const { createStripeBillingAdapter } = require("./adapters/stripe-billing.js");
const { loadHostedConfig } = require("./config.js");
const { BillingService } = require("./domain/billing-service.js");
const { HostedGenerationGateway } = require("./domain/generation-gateway.js");
const { UsageService } = require("./domain/usage-service.js");
const { createHostedApi } = require("./http-api.js");

function createHostedService(options) {
  const config = options?.config || loadHostedConfig(options?.env);
  const store = options?.store;
  const now = options?.now;
  const usageService = options?.usageService || new UsageService({
    store,
    now,
    graceMs: Number.isFinite(config.graceDays)
      ? config.graceDays * 86_400_000
      : 0
  });
  const generationGateway = new HostedGenerationGateway({ usageService });
  const billingAdapter = config.billingEnabled
    ? options?.billingAdapter || createStripeBillingAdapter(config)
    : null;
  const billingService = config.billingEnabled
    ? options?.billingService || new BillingService({ store, config, now })
    : null;
  const handleRequest = createHostedApi({
    allowedOrigins: options?.allowedOrigins,
    authenticate: options?.authenticate,
    billingAdapter,
    billingService,
    config,
    store,
    usageService
  });

  return Object.freeze({
    billingAdapter,
    billingService,
    config,
    generationGateway,
    handleRequest,
    store,
    usageService
  });
}

module.exports = { createHostedService };
