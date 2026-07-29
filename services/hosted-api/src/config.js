const { assertDomain } = require("./domain/errors.js");

const SUPPORTED_STRIPE_API_VERSION = "2026-06-24.dahlia";

// Approved Student Pro unit amounts in cents. Changing launch prices requires a
// reviewed code/policy-version change; environment variables cannot silently reprice.
// The annual price is the permanent $39.99 rate, not a first-term promotion, so it
// carries no renewal transition and STRIPE_PRICE_FOUNDING_ANNUAL stays rejected.
const DEFAULT_PRICE_AMOUNTS = Object.freeze({
  month: 499,
  year: 3999
});

function loadHostedConfig(env = process.env) {
  const billingEnabled = readBoolean(env.BILLING_ENABLED, false, "BILLING_ENABLED");
  const config = {
    billingEnabled,
    billingProvider: String(env.BILLING_PROVIDER || "stripe").toLowerCase(),
    publicAppOrigin: normalizeHttpsOrigin(env.PUBLIC_APP_ORIGIN),
    apiVersion: String(env.STRIPE_API_VERSION || SUPPORTED_STRIPE_API_VERSION),
    stripeSecretKey: String(env.STRIPE_SECRET_KEY || "").trim(),
    stripeWebhookSecret: String(env.STRIPE_WEBHOOK_SECRET || "").trim(),
    priceIds: {
      month: String(env.STRIPE_PRICE_PRO_MONTHLY || "").trim(),
      year: String(env.STRIPE_PRICE_PRO_ANNUAL || "").trim(),
      foundingYear: String(env.STRIPE_PRICE_FOUNDING_ANNUAL || "").trim()
    },
    priceAmounts: DEFAULT_PRICE_AMOUNTS,
    usageRequestHmacKey: String(env.USAGE_REQUEST_HMAC_KEY || "").trim(),
    allowLiveBilling: readBoolean(env.ALLOW_LIVE_BILLING, false, "ALLOW_LIVE_BILLING"),
    automaticTax: readOptionalBoolean(env.STRIPE_AUTOMATIC_TAX, "STRIPE_AUTOMATIC_TAX"),
    refundRevokesAccess: readOptionalBoolean(env.REFUND_REVOKES_ACCESS, "REFUND_REVOKES_ACCESS"),
    graceDays: readOptionalBoundedNumber(env.BILLING_GRACE_DAYS, 0, 30, "BILLING_GRACE_DAYS")
  };
  validateHostedConfig(config);
  return Object.freeze({
    ...config,
    priceIds: Object.freeze({ ...config.priceIds }),
    priceAmounts: DEFAULT_PRICE_AMOUNTS
  });
}

function validateHostedConfig(config) {
  if (!config.billingEnabled) return;
  assertDomain(config.billingProvider === "stripe", "BILLING_PROVIDER_INVALID", "Only the configured Stripe billing adapter is supported.", 500);
  assertDomain(
    config.apiVersion === SUPPORTED_STRIPE_API_VERSION,
    "STRIPE_API_VERSION_UNSUPPORTED",
    "The Stripe API version must match the reviewed SDK and webhook contract.",
    500
  );
  assertDomain(/^sk_(?:test|live)_[A-Za-z0-9]+$/.test(config.stripeSecretKey), "STRIPE_SECRET_MISSING", "A valid server-side Stripe secret key is required.", 500);
  assertDomain(/^whsec_[A-Za-z0-9]+$/.test(config.stripeWebhookSecret), "STRIPE_WEBHOOK_SECRET_MISSING", "A valid Stripe webhook signing secret is required.", 500);
  assertDomain(/^price_[A-Za-z0-9]+$/.test(config.priceIds.month), "STRIPE_MONTHLY_PRICE_MISSING", "The monthly Stripe Price ID is required.", 500);
  assertDomain(/^price_[A-Za-z0-9]+$/.test(config.priceIds.year), "STRIPE_ANNUAL_PRICE_MISSING", "The annual Stripe Price ID is required.", 500);
  if (config.priceIds.foundingYear) {
    assertDomain(/^price_[A-Za-z0-9]+$/.test(config.priceIds.foundingYear), "STRIPE_FOUNDING_PRICE_INVALID", "The founding annual Stripe Price ID is invalid.", 500);
    assertDomain(
      false,
      "FOUNDING_OFFER_NOT_IMPLEMENTED",
      "The first-term founding offer requires a reviewed renewal-price and eligibility workflow.",
      500
    );
  }
  assertDomain(Boolean(config.publicAppOrigin), "PUBLIC_APP_ORIGIN_MISSING", "A fixed HTTPS first-party app origin is required.", 500);
  assertDomain(typeof config.automaticTax === "boolean", "TAX_POLICY_REQUIRED", "STRIPE_AUTOMATIC_TAX must be explicitly true or false.", 500);
  assertDomain(typeof config.refundRevokesAccess === "boolean", "REFUND_POLICY_REQUIRED", "REFUND_REVOKES_ACCESS must be explicitly true or false.", 500);
  assertDomain(Number.isFinite(config.graceDays), "GRACE_POLICY_REQUIRED", "BILLING_GRACE_DAYS must be explicitly configured.", 500);
  if (config.stripeSecretKey.startsWith("sk_live_")) {
    assertDomain(config.allowLiveBilling, "LIVE_BILLING_LOCKED", "Live Stripe billing requires ALLOW_LIVE_BILLING=true after sandbox verification.", 500);
  }
}

function normalizeHttpsOrigin(value) {
  const candidate = String(value || "").trim();
  if (!candidate) return "";
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.pathname !== "/" || parsed.search || parsed.hash) return "";
    return parsed.origin;
  } catch {
    return "";
  }
}

function readBoolean(value, fallback, name) {
  if (value === undefined || String(value).trim() === "") return fallback;
  return parseBoolean(value, name);
}

function readOptionalBoolean(value, name) {
  if (value === undefined || String(value).trim() === "") return undefined;
  return parseBoolean(value, name);
}

function parseBoolean(value, name) {
  const normalized = String(value).trim().toLowerCase();
  assertDomain(["true", "false"].includes(normalized), "CONFIG_INVALID", `${name} must be true or false.`, 500);
  return normalized === "true";
}

function readOptionalBoundedNumber(value, minimum, maximum, name) {
  if (value === undefined || String(value).trim() === "") return undefined;
  const number = Number(value);
  assertDomain(Number.isFinite(number) && number >= minimum && number <= maximum, "CONFIG_INVALID", `${name} is outside its allowed range.`, 500);
  return number;
}

module.exports = {
  DEFAULT_PRICE_AMOUNTS,
  SUPPORTED_STRIPE_API_VERSION,
  loadHostedConfig,
  normalizeHttpsOrigin,
  validateHostedConfig
};
