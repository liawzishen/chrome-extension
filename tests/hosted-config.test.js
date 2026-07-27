const test = require("node:test");
const assert = require("node:assert/strict");

const {
  loadHostedConfig,
  normalizeHttpsOrigin
} = require("../services/hosted-api/src/config.js");

function validTestEnvironment(overrides = {}) {
  return {
    BILLING_ENABLED: "true",
    BILLING_PROVIDER: "stripe",
    PUBLIC_APP_ORIGIN: "https://app.exam-cram.test",
    STRIPE_SECRET_KEY: "sk_test_unit123",
    STRIPE_WEBHOOK_SECRET: "whsec_unit123",
    STRIPE_PRICE_PRO_MONTHLY: "price_monthly123",
    STRIPE_PRICE_PRO_ANNUAL: "price_annual123",
    STRIPE_AUTOMATIC_TAX: "false",
    REFUND_REVOKES_ACCESS: "true",
    BILLING_GRACE_DAYS: "3",
    ...overrides
  };
}

function assertConfigError(environment, expectedCode) {
  assert.throws(
    () => loadHostedConfig(environment),
    (error) => {
      assert.equal(error?.code, expectedCode);
      assert.equal(error?.statusCode, 500);
      return true;
    }
  );
}

test("hosted billing is disabled by default without requiring Stripe configuration", () => {
  const config = loadHostedConfig({});

  assert.equal(config.billingEnabled, false);
  assert.equal(config.billingProvider, "stripe");
  assert.equal(config.stripeSecretKey, "");
  assert.equal(config.stripeWebhookSecret, "");
  assert.deepEqual(config.priceIds, {
    month: "",
    year: "",
    foundingYear: ""
  });
  assert.equal(config.publicAppOrigin, "");
  assert.equal(config.allowLiveBilling, false);
});

test("enabled test-mode billing requires every security and policy decision", () => {
  const requiredCases = [
    ["STRIPE_SECRET_KEY", "STRIPE_SECRET_MISSING"],
    ["STRIPE_WEBHOOK_SECRET", "STRIPE_WEBHOOK_SECRET_MISSING"],
    ["STRIPE_PRICE_PRO_MONTHLY", "STRIPE_MONTHLY_PRICE_MISSING"],
    ["STRIPE_PRICE_PRO_ANNUAL", "STRIPE_ANNUAL_PRICE_MISSING"],
    ["PUBLIC_APP_ORIGIN", "PUBLIC_APP_ORIGIN_MISSING"],
    ["STRIPE_AUTOMATIC_TAX", "TAX_POLICY_REQUIRED"],
    ["REFUND_REVOKES_ACCESS", "REFUND_POLICY_REQUIRED"],
    ["BILLING_GRACE_DAYS", "GRACE_POLICY_REQUIRED"]
  ];

  for (const [name, expectedCode] of requiredCases) {
    const environment = validTestEnvironment();
    delete environment[name];
    assertConfigError(environment, expectedCode);
  }
});

test("test-mode billing loads fixed prices and freezes the resulting configuration", () => {
  const config = loadHostedConfig(validTestEnvironment({
    STRIPE_PRICE_FOUNDING_ANNUAL: "price_founding123",
    STRIPE_AUTOMATIC_TAX: "true",
    REFUND_REVOKES_ACCESS: "false",
    BILLING_GRACE_DAYS: "7"
  }));

  assert.equal(config.billingEnabled, true);
  assert.equal(config.publicAppOrigin, "https://app.exam-cram.test");
  assert.equal(config.automaticTax, true);
  assert.equal(config.refundRevokesAccess, false);
  assert.equal(config.graceDays, 7);
  assert.deepEqual(config.priceIds, {
    month: "price_monthly123",
    year: "price_annual123",
    foundingYear: "price_founding123"
  });
  assert.equal(Object.isFrozen(config), true);
  assert.equal(Object.isFrozen(config.priceIds), true);
});

test("live Stripe keys stay fail-closed until live billing is explicitly unlocked", () => {
  const locked = validTestEnvironment({
    STRIPE_SECRET_KEY: "sk_live_unit123"
  });
  assertConfigError(locked, "LIVE_BILLING_LOCKED");

  const unlocked = loadHostedConfig({
    ...locked,
    ALLOW_LIVE_BILLING: "true"
  });
  assert.equal(unlocked.allowLiveBilling, true);
  assert.equal(unlocked.stripeSecretKey, "sk_live_unit123");

  assertConfigError(validTestEnvironment({
    STRIPE_SECRET_KEY: "pk_live_publishable123",
    ALLOW_LIVE_BILLING: "true"
  }), "STRIPE_SECRET_MISSING");
});

test("configuration rejects unsupported providers, malformed booleans, and unsafe app origins", () => {
  assertConfigError(validTestEnvironment({ BILLING_PROVIDER: "other" }), "BILLING_PROVIDER_INVALID");
  assertConfigError(validTestEnvironment({ STRIPE_API_VERSION: "2026-02-25.clover" }), "STRIPE_API_VERSION_UNSUPPORTED");
  assertConfigError(validTestEnvironment({ BILLING_ENABLED: "sometimes" }), "CONFIG_INVALID");
  assertConfigError(validTestEnvironment({ STRIPE_AUTOMATIC_TAX: "yes" }), "CONFIG_INVALID");
  assertConfigError(validTestEnvironment({ BILLING_GRACE_DAYS: "31" }), "CONFIG_INVALID");
  assertConfigError(validTestEnvironment({ PUBLIC_APP_ORIGIN: "http://app.exam-cram.test" }), "PUBLIC_APP_ORIGIN_MISSING");
  assertConfigError(validTestEnvironment({ PUBLIC_APP_ORIGIN: "https://app.exam-cram.test/billing" }), "PUBLIC_APP_ORIGIN_MISSING");
  assertConfigError(validTestEnvironment({ PUBLIC_APP_ORIGIN: "https://user@app.exam-cram.test" }), "PUBLIC_APP_ORIGIN_MISSING");

  assert.equal(normalizeHttpsOrigin("https://app.exam-cram.test/"), "https://app.exam-cram.test");
  assert.equal(normalizeHttpsOrigin("https://app.exam-cram.test/?next=elsewhere"), "");
});
