const test = require("node:test");
const assert = require("node:assert/strict");

const { HostedDomainError } = require("../services/hosted-api/src/domain/errors.js");
const { MemoryHostedStore } = require("../services/hosted-api/src/adapters/memory-store.js");
const { createHostedRuntime } = require("../services/hosted-api/src/runtime/serve.js");

const APP_ORIGIN = "https://billing.neatmind.test";
const EXTENSION_ID = "abcdefghijklmnopabcdefghijklmnop";
const EXTENSION_ORIGIN = `chrome-extension://${EXTENSION_ID}`;
const CHROME_REDIRECT = `https://${EXTENSION_ID}.chromiumapp.org/`;
const SIGNING_KEY = "runtime-test-session-signing-key-0123456789";

function runtimeConfig(overrides = {}) {
  return {
    host: "127.0.0.1",
    port: 0,
    publicAppOrigin: APP_ORIGIN,
    databasePath: ":memory:",
    allowedExtensionOrigins: [EXTENSION_ORIGIN],
    allowedRedirectUris: [],
    sessionSigningKey: SIGNING_KEY,
    google: { clientId: "client-id", clientSecret: "client-secret", redirectUri: `${APP_ORIGIN}/auth/callback` },
    tls: { certPath: "", keyPath: "" },
    reservationTtlMs: 600_000,
    reconcileIntervalMs: 0,
    sweepIntervalMs: 0,
    ...overrides
  };
}

function fakeOauth(identityOverrides = {}) {
  return {
    exchanges: [],
    buildAuthorizationUrl(returnTo) {
      return `https://accounts.google.com/o/oauth2/v2/auth?state=${encodeURIComponent(returnTo)}`;
    },
    verifyState(state) {
      return { returnTo: decodeURIComponent(String(state || "")) };
    },
    async exchangeCode(code) {
      this.exchanges.push(code);
      return {
        provider: "google",
        subject: "google-subject-1",
        email: "learner@example.test",
        emailVerified: true,
        locale: "en",
        ...identityOverrides
      };
    }
  };
}

function buildRuntime(overrides = {}) {
  const store = new MemoryHostedStore();
  const oauth = overrides.oauth || fakeOauth();
  const runtime = createHostedRuntime({
    store,
    oauth,
    runtimeConfig: runtimeConfig(overrides.runtimeConfig),
    billingConfig: {
      billingEnabled: false,
      graceDays: 3,
      priceAmounts: { month: 499, year: 3999 }
    },
    logger: { log() {}, warn() {}, error() {} }
  });
  return { ...runtime, oauth, store };
}

function parseFragment(location) {
  return new URLSearchParams(String(location).split("#")[1] || "");
}

async function signIn(handler) {
  const callback = await handler(new Request(
    `${APP_ORIGIN}/auth/callback?code=auth-code-1&state=${encodeURIComponent(CHROME_REDIRECT)}`
  ));
  assert.equal(callback.status, 302);
  return parseFragment(callback.headers.get("location"));
}

function extensionRequest(path, accessToken, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("origin", EXTENSION_ORIGIN);
  if (accessToken) headers.set("authorization", `Bearer ${accessToken}`);
  return new Request(`${APP_ORIGIN}${path}`, { ...init, headers });
}

test("sign-in redirects to the provider only for a genuine extension redirect target", async () => {
  const { handler } = buildRuntime();

  const allowed = await handler(new Request(`${APP_ORIGIN}/auth/start?return_to=${encodeURIComponent(CHROME_REDIRECT)}`));
  assert.equal(allowed.status, 302);
  assert.match(allowed.headers.get("location"), /^https:\/\/accounts\.google\.com\//);

  // A browser navigation gets a readable page, not a JSON blob, but the refusal
  // still has to be visible and attributable.
  const attacker = await handler(new Request(`${APP_ORIGIN}/auth/start?return_to=${encodeURIComponent("https://evil.test/steal")}`));
  assert.equal(attacker.status, 400);
  assert.match(attacker.headers.get("content-type"), /text\/html/);
  assert.match(await attacker.text(), /OAUTH_REDIRECT_NOT_ALLOWED/);
});

test("a completed sign-in creates one account and returns usable session tokens", async () => {
  const { handler, oauth, store } = buildRuntime();
  const fragment = await signIn(handler);

  assert.equal(oauth.exchanges.length, 1);
  assert.ok(fragment.get("access_token"));
  assert.ok(fragment.get("refresh_token"));
  assert.ok(Date.parse(fragment.get("expires_at")) > Date.now());

  const me = await handler(extensionRequest("/v1/me", fragment.get("access_token")));
  assert.equal(me.status, 200);
  assert.equal((await me.json()).account.email, "learner@example.test");

  // Signing in again with the same Google subject must reuse the account, not
  // create a second unpaid identity.
  await signIn(handler);
  const accountCount = await store.transaction((state) => state.accounts.size);
  assert.equal(accountCount, 1);
});

test("refresh rotates the token and retires the presented one", async () => {
  const { handler } = buildRuntime();
  const fragment = await signIn(handler);
  const originalRefresh = fragment.get("refresh_token");

  const refreshed = await handler(extensionRequest("/v1/auth/refresh", null, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ refreshToken: originalRefresh })
  }));
  assert.equal(refreshed.status, 200);
  const rotated = await refreshed.json();
  assert.ok(rotated.accessToken);
  assert.notEqual(rotated.refreshToken, originalRefresh);

  const replay = await handler(extensionRequest("/v1/auth/refresh", null, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ refreshToken: originalRefresh })
  }));
  assert.equal(replay.status, 401);
  assert.equal((await replay.json()).error.code, "SESSION_REFRESH_INVALID");

  const me = await handler(extensionRequest("/v1/me", rotated.accessToken));
  assert.equal(me.status, 200);
});

test("sign-out revokes the refresh token", async () => {
  const { handler } = buildRuntime();
  const fragment = await signIn(handler);

  const signedOut = await handler(extensionRequest("/v1/auth/signout", null, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ refreshToken: fragment.get("refresh_token") })
  }));
  assert.equal(signedOut.status, 200);

  const afterSignOut = await handler(extensionRequest("/v1/auth/refresh", null, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ refreshToken: fragment.get("refresh_token") })
  }));
  assert.equal(afterSignOut.status, 401);
});

test("session routes refuse an origin that is not the allow-listed extension", async () => {
  const { handler } = buildRuntime();
  const response = await handler(new Request(`${APP_ORIGIN}/v1/auth/refresh`, {
    method: "POST",
    headers: { origin: "chrome-extension://ponmlkjihgfedcbaponmlkjihgfedcba", "content-type": "application/json" },
    body: JSON.stringify({ refreshToken: "whatever" })
  }));
  assert.equal(response.status, 403);
  assert.equal((await response.json()).error.code, "ORIGIN_NOT_ALLOWED");
});

test("a tampered access token cannot authenticate", async () => {
  const { handler } = buildRuntime();
  const fragment = await signIn(handler);
  const [header, payload] = fragment.get("access_token").split(".");
  const forgedPayload = Buffer.from(JSON.stringify({
    sub: "account-i-do-not-own",
    iss: APP_ORIGIN,
    aud: APP_ORIGIN,
    exp: Math.floor(Date.now() / 1000) + 3600
  })).toString("base64url");

  const forged = await handler(extensionRequest("/v1/me", `${header}.${forgedPayload}.${payload}`));
  assert.equal(forged.status, 401);
  assert.equal((await forged.json()).error.code, "SESSION_TOKEN_INVALID");
});

test("an unverified provider email is refused before an account exists", async () => {
  const oauth = fakeOauth();
  oauth.exchangeCode = async () => {
    throw new HostedDomainError(
      "OAUTH_EMAIL_UNVERIFIED",
      "Verify your Google email address before using the hosted service.",
      403
    );
  };
  const { handler, store } = buildRuntime({ oauth });
  const response = await handler(new Request(
    `${APP_ORIGIN}/auth/callback?code=abc&state=${encodeURIComponent(CHROME_REDIRECT)}`
  ));
  assert.equal(response.status, 403);
  assert.match(await response.text(), /OAUTH_EMAIL_UNVERIFIED/);
  assert.equal(await store.transaction((state) => state.accounts.size), 0);
});

test("the pricing page publishes the approved amounts and never promises unlimited usage", async () => {
  const { handler } = buildRuntime();
  const response = await handler(new Request(`${APP_ORIGIN}/pricing`));
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /text\/html/);
  const html = await response.text();

  assert.match(html, /\$4\.99/);
  assert.match(html, /\$39\.99 billed once per year \(about \$3\.33\/month\)/);
  assert.match(html, /Renews every year until canceled/);
  assert.match(html, /Canceling never removes your work/);
  assert.equal(/unlimited/i.test(html), false);
  assert.match(html, /NeatMind/);
});

test("checkout return pages exist on the fixed public origin", async () => {
  const { handler } = buildRuntime();
  for (const path of ["/billing/success", "/billing/canceled", "/account"]) {
    const response = await handler(new Request(`${APP_ORIGIN}${path}`));
    assert.equal(response.status, 200, `${path} must be served`);
    assert.match(await response.text(), /NeatMind/);
  }
});

test("the webhook path is never given CORS headers or an origin check", async () => {
  const { handler } = buildRuntime();
  const response = await handler(new Request(`${APP_ORIGIN}/v1/billing/webhook`, {
    method: "POST",
    body: "{}"
  }));
  // Billing is disabled in this fixture, so the route reports that rather than
  // rejecting the (absent) browser origin.
  assert.equal(response.status, 503);
  assert.equal(response.headers.get("access-control-allow-origin"), null);
  assert.equal((await response.json()).error.code, "BILLING_NOT_CONFIGURED");
});
