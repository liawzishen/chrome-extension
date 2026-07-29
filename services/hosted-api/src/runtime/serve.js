const { HostedDomainError } = require("../domain/errors.js");
const { loadHostedConfig } = require("../config.js");
const { createHostedService } = require("../index.js");
const { SqliteHostedStore } = require("../adapters/sqlite-store.js");
const { createGoogleOAuthAdapter } = require("../adapters/google-oauth.js");
const { AccountService } = require("../domain/account-service.js");
const { SessionService } = require("../domain/session-service.js");
const { UsageService } = require("../domain/usage-service.js");
const { loadRuntimeConfig } = require("./config.js");
const { createHostedHttpServer, readTlsMaterial } = require("./http-server.js");
const { createRuntimeRouter } = require("./router.js");

// Builds every collaborator and returns them without binding a socket, so the
// whole runtime can be exercised in tests through plain Request objects.
function createHostedRuntime(options = {}) {
  const env = options.env || process.env;
  const runtimeConfig = options.runtimeConfig || loadRuntimeConfig(env);
  const billingConfig = options.billingConfig || loadHostedConfig(env);
  const logger = options.logger || console;

  const store = options.store || new SqliteHostedStore({ databasePath: runtimeConfig.databasePath });
  const usageService = new UsageService({
    store,
    reservationTtlMs: runtimeConfig.reservationTtlMs,
    graceMs: Number.isFinite(billingConfig.graceDays) ? billingConfig.graceDays * 86_400_000 : 0
  });
  const sessionService = new SessionService({
    store,
    signingKey: runtimeConfig.sessionSigningKey,
    issuer: runtimeConfig.publicAppOrigin,
    audience: runtimeConfig.publicAppOrigin
  });
  const accountService = new AccountService({ store });
  const oauth = options.oauth || createGoogleOAuthAdapter({
    clientId: runtimeConfig.google.clientId,
    clientSecret: runtimeConfig.google.clientSecret,
    redirectUri: runtimeConfig.google.redirectUri,
    stateSigningKey: runtimeConfig.sessionSigningKey
  });

  const hostedService = createHostedService({
    allowedOrigins: [...runtimeConfig.allowedExtensionOrigins],
    // A thrown domain error is preferable to a null here: it lets the extension
    // tell "refresh my token" apart from "sign in again", which is the
    // difference between a silent recovery and an interrupted purchase.
    authenticate: async (request) => {
      const header = String(request.headers.get("authorization") || "");
      const match = /^Bearer\s+(.+)$/i.exec(header);
      if (!match) return null;
      return { accountId: sessionService.verifyAccessToken(match[1].trim()).accountId };
    },
    billingAdapter: options.billingAdapter,
    config: billingConfig,
    store,
    usageService
  });

  const handler = createRuntimeRouter({
    accountService,
    allowedOrigins: [...runtimeConfig.allowedExtensionOrigins],
    allowedRedirectUris: [...runtimeConfig.allowedRedirectUris],
    hostedApi: hostedService.handleRequest,
    oauth,
    priceAmounts: billingConfig.priceAmounts,
    sessionService
  });

  return {
    accountService,
    billingConfig,
    handler,
    hostedService,
    logger,
    oauth,
    runtimeConfig,
    sessionService,
    store,
    usageService
  };
}

async function startHostedServer(options = {}) {
  const runtime = createHostedRuntime(options);
  const { runtimeConfig, logger } = runtime;
  const tls = readTlsMaterial(runtimeConfig.tls.certPath, runtimeConfig.tls.keyPath);
  const server = createHostedHttpServer({
    handler: runtime.handler,
    publicAppOrigin: runtimeConfig.publicAppOrigin,
    tls
  });
  const address = await server.listen(
    options.port === undefined ? runtimeConfig.port : options.port,
    runtimeConfig.host
  );

  const timers = [];
  if (runtimeConfig.sweepIntervalMs > 0) {
    const sweep = setInterval(() => {
      runtime.usageService.sweepExpiredReservations().catch((error) => {
        logger.error("[NeatMind Hosted] reservation sweep failed", { message: error?.message });
      });
    }, runtimeConfig.sweepIntervalMs);
    // An operational timer must never be the reason the process refuses to exit.
    if (typeof sweep.unref === "function") sweep.unref();
    timers.push(sweep);
  }

  logger.log(
    `[NeatMind Hosted] listening on ${server.secure ? "https" : "http"}://${runtimeConfig.host}:${address.port} ` +
    `(public origin ${runtimeConfig.publicAppOrigin}, billing ${runtime.billingConfig.billingEnabled ? "ENABLED" : "disabled"})`
  );
  if (!server.secure) {
    logger.warn(
      "[NeatMind Hosted] TLS is not configured in this process. Terminate HTTPS in front of it, " +
      "or set HOSTED_TLS_CERT_PATH and HOSTED_TLS_KEY_PATH."
    );
  }

  return {
    ...runtime,
    address,
    server,
    async close() {
      for (const timer of timers) clearInterval(timer);
      await server.close();
      if (typeof runtime.store.close === "function") runtime.store.close();
    }
  };
}

function describeStartupFailure(error) {
  if (error instanceof HostedDomainError) {
    return `[NeatMind Hosted] ${error.code}: ${error.message}`;
  }
  return `[NeatMind Hosted] startup failed: ${error?.message || error}`;
}

module.exports = { createHostedRuntime, describeStartupFailure, startHostedServer };
