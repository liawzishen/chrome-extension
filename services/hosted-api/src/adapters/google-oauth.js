const { createHmac, randomBytes, timingSafeEqual } = require("crypto");
const { HostedDomainError, assertDomain } = require("../domain/errors.js");

const GOOGLE_ISSUERS = new Set(["https://accounts.google.com", "accounts.google.com"]);
const AUTHORIZATION_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const STATE_TTL_MS = 10 * 60_000;

// The browser extension never holds the OAuth client secret. It opens this
// server, the server talks to Google, and the server hands back its own session
// token. That keeps the only long-lived credential on the server and means the
// hosted API validates a token it minted rather than one a client chose.
function createGoogleOAuthAdapter(config, dependencies = {}) {
  const clientId = requireValue(config?.clientId, "GOOGLE_OAUTH_NOT_CONFIGURED", "The Google OAuth client ID is missing.");
  const clientSecret = requireValue(config?.clientSecret, "GOOGLE_OAUTH_NOT_CONFIGURED", "The Google OAuth client secret is missing.");
  const redirectUri = requireValue(config?.redirectUri, "GOOGLE_OAUTH_NOT_CONFIGURED", "The Google OAuth redirect URI is missing.");
  const stateKey = Buffer.isBuffer(config?.stateSigningKey)
    ? Buffer.from(config.stateSigningKey)
    : Buffer.from(String(config?.stateSigningKey || ""), "utf8");
  assertDomain(
    stateKey.byteLength >= 32,
    "GOOGLE_OAUTH_NOT_CONFIGURED",
    "A state signing key of at least 32 bytes is required.",
    500
  );
  const fetchImpl = typeof dependencies.fetch === "function" ? dependencies.fetch : globalThis.fetch;
  const now = typeof dependencies.now === "function" ? dependencies.now : Date.now;

  function buildAuthorizationUrl(returnTo) {
    const state = signState({ returnTo, nonce: randomBytes(12).toString("hex"), expiresAt: now() + STATE_TTL_MS }, stateKey);
    const url = new URL(AUTHORIZATION_ENDPOINT);
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email");
    url.searchParams.set("state", state);
    // Force the account chooser so a shared browser cannot silently reuse a
    // previous learner's Google session for a purchase.
    url.searchParams.set("prompt", "select_account");
    return url.href;
  }

  function verifyState(state) {
    const payload = openState(state, stateKey);
    assertDomain(payload, "OAUTH_STATE_INVALID", "The sign-in request could not be verified.", 400);
    assertDomain(
      Number(payload.expiresAt) > now(),
      "OAUTH_STATE_EXPIRED",
      "The sign-in request expired. Try signing in again.",
      400
    );
    return payload;
  }

  async function exchangeCode(code) {
    const body = new URLSearchParams({
      code: String(code || ""),
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code"
    });
    let response;
    try {
      response = await fetchImpl(TOKEN_ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: body.toString()
      });
    } catch (error) {
      const unavailable = new HostedDomainError(
        "OAUTH_PROVIDER_UNAVAILABLE",
        "The identity provider could not be reached.",
        503
      );
      unavailable.cause = error;
      throw unavailable;
    }
    assertDomain(response?.ok, "OAUTH_EXCHANGE_FAILED", "The sign-in code could not be exchanged.", 401);
    const tokens = await response.json();
    return readIdentity(tokens?.id_token, clientId);
  }

  return { buildAuthorizationUrl, exchangeCode, verifyState };
}

// The ID token arrives directly from Google's token endpoint over TLS in response
// to a request authenticated with our client secret, so its signature adds no
// guarantee we do not already have. The claims still need checking: they are what
// binds the token to this client and proves the address was verified by Google.
function readIdentity(idToken, clientId) {
  const parts = String(idToken || "").split(".");
  assertDomain(parts.length === 3, "OAUTH_IDENTITY_INVALID", "The identity provider returned no usable identity.", 401);
  let claims;
  try {
    claims = JSON.parse(Buffer.from(parts[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"));
  } catch {
    claims = null;
  }
  assertDomain(claims && typeof claims === "object", "OAUTH_IDENTITY_INVALID", "The identity provider returned no usable identity.", 401);
  assertDomain(GOOGLE_ISSUERS.has(String(claims.iss)), "OAUTH_IDENTITY_INVALID", "The identity token was not issued by Google.", 401);
  assertDomain(String(claims.aud) === clientId, "OAUTH_IDENTITY_INVALID", "The identity token was issued for another application.", 401);
  const subject = String(claims.sub || "").trim();
  assertDomain(subject, "OAUTH_IDENTITY_INVALID", "The identity token carries no subject.", 401);
  const email = String(claims.email || "").trim().toLowerCase();
  const emailVerified = claims.email_verified === true || claims.email_verified === "true";
  // An unverified address must never become a billing identity: it would let
  // someone claim another learner's account by asserting their email.
  assertDomain(
    email && emailVerified,
    "OAUTH_EMAIL_UNVERIFIED",
    "Verify your Google email address before using the hosted service.",
    403
  );
  return { provider: "google", subject, email, emailVerified: true, locale: String(claims.locale || "en").slice(0, 20) };
}

function signState(payload, key) {
  const encoded = base64Url(Buffer.from(JSON.stringify(payload), "utf8"));
  return `${encoded}.${base64Url(createHmac("sha256", key).update(encoded).digest())}`;
}

function openState(state, key) {
  const [encoded, signature] = String(state || "").split(".");
  if (!encoded || !signature) return null;
  const expected = base64Url(createHmac("sha256", key).update(encoded).digest());
  const presented = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");
  if (presented.byteLength !== expectedBuffer.byteLength || !timingSafeEqual(presented, expectedBuffer)) return null;
  try {
    return JSON.parse(Buffer.from(encoded.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"));
  } catch {
    return null;
  }
}

function base64Url(buffer) {
  return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function requireValue(value, code, message) {
  const normalized = String(value || "").trim();
  assertDomain(normalized, code, message, 500);
  return normalized;
}

module.exports = { createGoogleOAuthAdapter, readIdentity };
