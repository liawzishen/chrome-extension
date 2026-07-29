const { createHmac, randomBytes, createHash, timingSafeEqual } = require("crypto");
const { assertDomain } = require("./errors.js");

// The access token is a self-contained HS256 JWT so that authenticating a request
// costs no store read. That speed is paid for with a short lifetime: revoking a
// refresh token cannot retract an access token that is already minted, so the
// access TTL is the true blast radius of a stolen token and is kept small.
const DEFAULT_ACCESS_TTL_MS = 60 * 60_000;
const DEFAULT_REFRESH_TTL_MS = 30 * 86_400_000;
const MIN_SIGNING_KEY_BYTES = 32;
const JWT_HEADER = Object.freeze({ alg: "HS256", typ: "JWT" });

class SessionService {
  constructor(options) {
    assertDomain(options?.store, "STORE_REQUIRED", "A hosted session store is required.", 500);
    const signingKey = Buffer.isBuffer(options.signingKey)
      ? Buffer.from(options.signingKey)
      : Buffer.from(String(options.signingKey || ""), "utf8");
    assertDomain(
      signingKey.byteLength >= MIN_SIGNING_KEY_BYTES,
      "SESSION_SIGNING_KEY_REQUIRED",
      "A server-only session signing key of at least 32 bytes is required.",
      500
    );
    this.store = options.store;
    this.signingKey = signingKey;
    this.issuer = requireNonEmpty(options.issuer, "SESSION_ISSUER_REQUIRED", "A session issuer is required.");
    this.audience = requireNonEmpty(options.audience, "SESSION_AUDIENCE_REQUIRED", "A session audience is required.");
    this.now = typeof options.now === "function" ? options.now : Date.now;
    this.accessTtlMs = clampInteger(options.accessTtlMs, 60_000, 24 * 60 * 60_000, DEFAULT_ACCESS_TTL_MS);
    this.refreshTtlMs = clampInteger(options.refreshTtlMs, 60 * 60_000, 365 * 86_400_000, DEFAULT_REFRESH_TTL_MS);
  }

  async startSession(accountId) {
    const id = String(accountId || "");
    assertDomain(id, "ACCOUNT_REQUIRED", "An account is required to start a session.", 401);
    const refreshToken = base64Url(randomBytes(32));
    const now = this.now();
    const sessionId = base64Url(randomBytes(16));
    await this.store.transaction((state) => {
      requireSessionState(state);
      const account = state.accounts.get(id);
      assertDomain(account?.state === "active", "ACCOUNT_UNAVAILABLE", "The account is not active.", 403);
      pruneExpiredSessions(state, now);
      state.authSessions.set(hashToken(refreshToken), {
        sessionId,
        accountId: id,
        createdAt: new Date(now).toISOString(),
        expiresAt: new Date(now + this.refreshTtlMs).toISOString(),
        lastUsedAt: new Date(now).toISOString(),
        revokedAt: null
      });
    });
    return this.issueFrom(id, sessionId, refreshToken, now);
  }

  // Rotates the refresh token on every use. A replayed refresh token is therefore
  // presented against a hash that no longer exists, which is what makes theft of a
  // stored refresh token detectable rather than silent.
  async refresh(refreshToken) {
    const presented = String(refreshToken || "");
    assertDomain(presented.length >= 16, "SESSION_REFRESH_INVALID", "The refresh token is invalid.", 401);
    const now = this.now();
    const rotated = base64Url(randomBytes(32));
    const resolved = await this.store.transaction((state) => {
      requireSessionState(state);
      const presentedHash = hashToken(presented);
      const session = state.authSessions.get(presentedHash);
      assertDomain(session, "SESSION_REFRESH_INVALID", "The refresh token is invalid.", 401);
      assertDomain(!session.revokedAt, "SESSION_REVOKED", "This session has been signed out.", 401);
      assertDomain(
        Date.parse(session.expiresAt) > now,
        "SESSION_EXPIRED",
        "This session has expired. Sign in again.",
        401
      );
      const account = state.accounts.get(session.accountId);
      assertDomain(account?.state === "active", "ACCOUNT_UNAVAILABLE", "The account is not active.", 403);
      state.authSessions.delete(presentedHash);
      state.authSessions.set(hashToken(rotated), {
        ...session,
        lastUsedAt: new Date(now).toISOString(),
        expiresAt: new Date(now + this.refreshTtlMs).toISOString()
      });
      return { accountId: session.accountId, sessionId: session.sessionId };
    });
    return this.issueFrom(resolved.accountId, resolved.sessionId, rotated, now);
  }

  async revoke(refreshToken) {
    const presented = String(refreshToken || "");
    if (!presented) return { revoked: false };
    return this.store.transaction((state) => {
      requireSessionState(state);
      const hash = hashToken(presented);
      const session = state.authSessions.get(hash);
      if (!session) return { revoked: false };
      state.authSessions.delete(hash);
      return { revoked: true };
    });
  }

  issueFrom(accountId, sessionId, refreshToken, now) {
    const expiresAtMs = now + this.accessTtlMs;
    const payload = {
      sub: accountId,
      iss: this.issuer,
      aud: this.audience,
      sid: sessionId,
      iat: Math.floor(now / 1000),
      exp: Math.floor(expiresAtMs / 1000)
    };
    return {
      accessToken: this.signJwt(payload),
      expiresAt: new Date(expiresAtMs).toISOString(),
      refreshToken,
      refreshExpiresAt: new Date(now + this.refreshTtlMs).toISOString()
    };
  }

  signJwt(payload) {
    const signingInput = `${base64Url(Buffer.from(JSON.stringify(JWT_HEADER), "utf8"))}.${
      base64Url(Buffer.from(JSON.stringify(payload), "utf8"))
    }`;
    return `${signingInput}.${base64Url(this.sign(signingInput))}`;
  }

  sign(signingInput) {
    return createHmac("sha256", this.signingKey).update(signingInput).digest();
  }

  // Synchronous and store-free: this runs on every authenticated hosted request.
  verifyAccessToken(token) {
    const parts = String(token || "").split(".");
    assertDomain(parts.length === 3, "SESSION_TOKEN_INVALID", "The hosted session token is invalid.", 401);
    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const expected = this.sign(`${encodedHeader}.${encodedPayload}`);
    const presented = decodeBase64Url(encodedSignature);
    assertDomain(
      presented.byteLength === expected.byteLength && timingSafeEqual(presented, expected),
      "SESSION_TOKEN_INVALID",
      "The hosted session token is invalid.",
      401
    );
    const header = parseJsonSegment(encodedHeader);
    // Rejecting the algorithm from the token itself is what stops an attacker
    // downgrading to "none" or swapping to an asymmetric alg we never issued.
    assertDomain(
      header?.alg === "HS256" && header?.typ === "JWT",
      "SESSION_TOKEN_INVALID",
      "The hosted session token is invalid.",
      401
    );
    const payload = parseJsonSegment(encodedPayload);
    assertDomain(
      payload?.iss === this.issuer && payload?.aud === this.audience,
      "SESSION_TOKEN_INVALID",
      "The hosted session token was not issued for this service.",
      401
    );
    const expiresAtMs = Number(payload?.exp) * 1000;
    assertDomain(
      Number.isFinite(expiresAtMs) && expiresAtMs > this.now(),
      "SESSION_TOKEN_EXPIRED",
      "The hosted session token has expired.",
      401
    );
    const accountId = String(payload?.sub || "");
    assertDomain(accountId, "SESSION_TOKEN_INVALID", "The hosted session token is invalid.", 401);
    return { accountId, sessionId: String(payload.sid || ""), expiresAt: new Date(expiresAtMs).toISOString() };
  }
}

function requireSessionState(state) {
  assertDomain(
    state.authSessions instanceof Map,
    "SESSION_STORE_UNAVAILABLE",
    "The hosted session store is not configured.",
    500
  );
}

function pruneExpiredSessions(state, now) {
  for (const [hash, session] of state.authSessions) {
    const expiresAt = Date.parse(session?.expiresAt);
    if (Number.isFinite(expiresAt) && expiresAt <= now) state.authSessions.delete(hash);
  }
}

function hashToken(token) {
  return createHash("sha256").update(String(token), "utf8").digest("hex");
}

function base64Url(buffer) {
  return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeBase64Url(value) {
  const normalized = String(value || "").replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized, "base64");
}

function parseJsonSegment(segment) {
  try {
    return JSON.parse(decodeBase64Url(segment).toString("utf8"));
  } catch {
    return null;
  }
}

function requireNonEmpty(value, code, message) {
  const normalized = String(value || "").trim();
  assertDomain(normalized, code, message, 500);
  return normalized;
}

function clampInteger(value, minimum, maximum, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(minimum, Math.min(maximum, Math.round(number))) : fallback;
}

module.exports = { SessionService, DEFAULT_ACCESS_TTL_MS, DEFAULT_REFRESH_TTL_MS };
