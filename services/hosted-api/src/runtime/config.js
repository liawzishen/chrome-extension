const { assertDomain } = require("../domain/errors.js");
const { normalizeHttpsOrigin } = require("../config.js");

const EXTENSION_ORIGIN_PATTERN = /^chrome-extension:\/\/[a-p]{32}$/;

// Runtime wiring is loaded separately from billing configuration so that turning
// billing on never depends on deployment details, and a deployment mistake can
// never quietly reprice or unlock live billing.
function loadRuntimeConfig(env = process.env) {
  const publicAppOrigin = normalizeHttpsOrigin(env.PUBLIC_APP_ORIGIN);
  const allowedExtensionOrigins = splitList(env.HOSTED_ALLOWED_EXTENSION_ORIGINS);
  const config = {
    host: String(env.HOSTED_API_HOST || "127.0.0.1").trim(),
    port: readPort(env.HOSTED_API_PORT, 8790),
    publicAppOrigin,
    databasePath: String(env.HOSTED_SQLITE_PATH || "").trim(),
    allowedExtensionOrigins,
    allowedRedirectUris: splitList(env.HOSTED_ALLOWED_REDIRECT_URIS),
    sessionSigningKey: String(env.HOSTED_SESSION_SIGNING_KEY || "").trim(),
    google: {
      clientId: String(env.GOOGLE_OAUTH_CLIENT_ID || "").trim(),
      clientSecret: String(env.GOOGLE_OAUTH_CLIENT_SECRET || "").trim(),
      redirectUri: publicAppOrigin ? `${publicAppOrigin}/auth/callback` : ""
    },
    tls: {
      certPath: String(env.HOSTED_TLS_CERT_PATH || "").trim(),
      keyPath: String(env.HOSTED_TLS_KEY_PATH || "").trim()
    },
    reservationTtlMs: readNumber(env.USAGE_RESERVATION_TTL_MS, 600_000),
    reconcileIntervalMs: readNumber(env.HOSTED_RECONCILE_INTERVAL_MS, 15 * 60_000),
    sweepIntervalMs: readNumber(env.HOSTED_SWEEP_INTERVAL_MS, 60_000)
  };
  validateRuntimeConfig(config);
  return Object.freeze({
    ...config,
    google: Object.freeze(config.google),
    tls: Object.freeze(config.tls),
    allowedExtensionOrigins: Object.freeze(config.allowedExtensionOrigins),
    allowedRedirectUris: Object.freeze(config.allowedRedirectUris)
  });
}

function validateRuntimeConfig(config) {
  assertDomain(
    Boolean(config.publicAppOrigin),
    "PUBLIC_APP_ORIGIN_MISSING",
    "PUBLIC_APP_ORIGIN must be a fixed HTTPS origin with no path, query, or credentials.",
    500
  );
  assertDomain(
    config.databasePath.length > 0,
    "HOSTED_SQLITE_PATH_MISSING",
    "HOSTED_SQLITE_PATH is required so account and subscription state survives a restart.",
    500
  );
  assertDomain(
    config.allowedExtensionOrigins.length > 0,
    "EXTENSION_ORIGIN_REQUIRED",
    "HOSTED_ALLOWED_EXTENSION_ORIGINS must list at least one exact chrome-extension origin.",
    500
  );
  for (const origin of config.allowedExtensionOrigins) {
    assertDomain(
      EXTENSION_ORIGIN_PATTERN.test(origin),
      "EXTENSION_ORIGIN_INVALID",
      `"${origin}" is not an exact chrome-extension origin.`,
      500
    );
  }
  assertDomain(
    Buffer.byteLength(config.sessionSigningKey, "utf8") >= 32,
    "SESSION_SIGNING_KEY_REQUIRED",
    "HOSTED_SESSION_SIGNING_KEY must be at least 32 bytes of server-only random data.",
    500
  );
  assertDomain(
    Boolean(config.google.clientId && config.google.clientSecret),
    "GOOGLE_OAUTH_NOT_CONFIGURED",
    "GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET are required for hosted sign-in.",
    500
  );
  const tlsPartiallyConfigured = Boolean(config.tls.certPath) !== Boolean(config.tls.keyPath);
  assertDomain(
    !tlsPartiallyConfigured,
    "TLS_CONFIG_INCOMPLETE",
    "HOSTED_TLS_CERT_PATH and HOSTED_TLS_KEY_PATH must be set together.",
    500
  );
}

function splitList(value) {
  return String(value || "")
    .split(/[,\s]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function readPort(value, fallback) {
  const number = Number(value);
  return Number.isInteger(number) && number >= 0 && number <= 65_535 ? number : fallback;
}

function readNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

module.exports = { EXTENSION_ORIGIN_PATTERN, loadRuntimeConfig };
