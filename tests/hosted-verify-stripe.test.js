const test = require("node:test");
const assert = require("node:assert/strict");

const { formatReport, verifyStripeSetup } = require("../services/hosted-api/src/runtime/verify-stripe.js");

const PRODUCT_ID = "prod_UyZK0HMpCUXI8C";
const TEST_KEY = "sk_test_verifyunit123";

function price(overrides = {}) {
  return {
    id: "price_default",
    active: true,
    currency: "usd",
    type: "recurring",
    unit_amount: 499,
    tax_behavior: "unspecified",
    recurring: { interval: "month", interval_count: 1 },
    ...overrides
  };
}

function fakeStripe(options = {}) {
  return {
    products: {
      retrieve: async (id) => {
        if (options.productMissing) {
          const error = new Error("No such product");
          error.code = "resource_missing";
          throw error;
        }
        return { id, name: "NeatMind Student Pro", active: options.productArchived ? false : true };
      }
    },
    prices: {
      list: async () => ({ data: options.prices || [] })
    },
    billingPortal: {
      configurations: {
        list: async () => ({
          data: options.portal === undefined
            ? [{ id: "bpc_1", active: true, features: { subscription_cancel: { enabled: true } } }]
            : options.portal
        })
      }
    }
  };
}

function findingsWith(result, level) {
  return result.findings.filter((finding) => finding.level === level);
}

const CORRECT_PRICES = [
  price({ id: "price_monthly_ok", unit_amount: 499, recurring: { interval: "month", interval_count: 1 } }),
  price({ id: "price_annual_ok", unit_amount: 3999, recurring: { interval: "year", interval_count: 1 } })
];

test("a correctly configured product yields the exact env lines to paste", async () => {
  const result = await verifyStripeSetup({
    stripe: fakeStripe({ prices: CORRECT_PRICES }),
    secretKey: TEST_KEY,
    productId: PRODUCT_ID,
    automaticTax: false
  });

  assert.equal(result.ok, true);
  assert.equal(result.livemode, false);
  assert.deepEqual(result.envLines, [
    "STRIPE_PRICE_PRO_MONTHLY=price_monthly_ok",
    "STRIPE_PRICE_PRO_ANNUAL=price_annual_ok"
  ]);
  assert.match(formatReport(result), /Stripe setup matches the approved catalog/);
});

test("a $49.99 annual price is rejected with the amount the service actually requires", async () => {
  const result = await verifyStripeSetup({
    stripe: fakeStripe({
      prices: [
        price({ id: "price_monthly_ok", unit_amount: 499 }),
        price({ id: "price_annual_wrong", unit_amount: 4999, recurring: { interval: "year", interval_count: 1 } })
      ]
    }),
    secretKey: TEST_KEY,
    productId: PRODUCT_ID,
    automaticTax: false
  });

  assert.equal(result.ok, false);
  const failure = findingsWith(result, "fail").find((finding) => /yearly price/.test(finding.message));
  assert.ok(failure, "the annual mismatch must be reported");
  assert.match(failure.message, /\$39\.99/);
  assert.match(failure.detail, /price_annual_wrong is \$49\.99 USD/);
  assert.equal(result.envLines.includes("STRIPE_PRICE_PRO_ANNUAL=price_annual_wrong"), false);
});

test("prices split across separate products are caught as a missing price", async () => {
  // Reproduces the original mistake: monthly on one product, annual on another,
  // so listing one product's prices only ever finds half the catalog.
  const result = await verifyStripeSetup({
    stripe: fakeStripe({ prices: [price({ id: "price_monthly_ok", unit_amount: 499 })] }),
    secretKey: TEST_KEY,
    productId: PRODUCT_ID,
    automaticTax: false
  });

  assert.equal(result.ok, false);
  const failure = findingsWith(result, "fail").find((finding) => /yearly price/.test(finding.message));
  assert.match(failure.detail, /Create a recurring USD price of \$39\.99 per year/);
});

test("duplicate matching prices are rejected rather than silently picking one", async () => {
  const result = await verifyStripeSetup({
    stripe: fakeStripe({
      prices: [
        price({ id: "price_monthly_a", unit_amount: 499 }),
        price({ id: "price_monthly_b", unit_amount: 499 }),
        price({ id: "price_annual_ok", unit_amount: 3999, recurring: { interval: "year", interval_count: 1 } })
      ]
    }),
    secretKey: TEST_KEY,
    productId: PRODUCT_ID,
    automaticTax: false
  });

  assert.equal(result.ok, false);
  const failure = findingsWith(result, "fail").find((finding) => /2 active monthly prices/.test(finding.message));
  assert.ok(failure);
  assert.match(failure.detail, /price_monthly_a, price_monthly_b/);
});

test("automatic tax with unspecified tax behavior is refused before Stripe errors on it", async () => {
  const result = await verifyStripeSetup({
    stripe: fakeStripe({ prices: CORRECT_PRICES }),
    secretKey: TEST_KEY,
    productId: PRODUCT_ID,
    automaticTax: true
  });

  assert.equal(result.ok, false);
  const failure = findingsWith(result, "fail").find((finding) => /tax_behavior/.test(finding.message));
  assert.ok(failure);
  assert.match(failure.detail, /STRIPE_AUTOMATIC_TAX=false/);
});

test("a live key is flagged loudly but still verified", async () => {
  const result = await verifyStripeSetup({
    stripe: fakeStripe({ prices: CORRECT_PRICES }),
    secretKey: "sk_live_verifyunit123",
    productId: PRODUCT_ID,
    automaticTax: false
  });

  assert.equal(result.livemode, true);
  assert.equal(result.ok, true);
  const warning = findingsWith(result, "warn").find((finding) => /LIVE secret key/.test(finding.message));
  assert.ok(warning, "a live key must be called out");
  assert.match(warning.message, /real money/);
});

test("a product from the other mode explains the mode mismatch", async () => {
  const result = await verifyStripeSetup({
    stripe: fakeStripe({ productMissing: true }),
    secretKey: TEST_KEY,
    productId: PRODUCT_ID,
    automaticTax: false
  });

  assert.equal(result.ok, false);
  const failure = findingsWith(result, "fail")[0];
  assert.match(failure.detail, /Objects created in one mode do not exist in the other/);
});

test("a missing Customer Portal configuration fails the preflight", async () => {
  const result = await verifyStripeSetup({
    stripe: fakeStripe({ prices: CORRECT_PRICES, portal: [] }),
    secretKey: TEST_KEY,
    productId: PRODUCT_ID,
    automaticTax: false
  });

  assert.equal(result.ok, false);
  const failure = findingsWith(result, "fail").find((finding) => /Customer Portal/.test(finding.message));
  assert.ok(failure);
  assert.match(failure.detail, /Manage billing will fail/);
});

test("a portal without cancellation warns, because self-service cancel is required", async () => {
  const result = await verifyStripeSetup({
    stripe: fakeStripe({
      prices: CORRECT_PRICES,
      portal: [{ id: "bpc_1", active: true, features: { subscription_cancel: { enabled: false } } }]
    }),
    secretKey: TEST_KEY,
    productId: PRODUCT_ID,
    automaticTax: false
  });

  assert.equal(result.ok, true, "a warning must not block the preflight");
  const warning = findingsWith(result, "warn").find((finding) => /cancellation/.test(finding.message));
  assert.ok(warning);
});

test("a malformed key stops before any Stripe call is attempted", async () => {
  let called = false;
  const result = await verifyStripeSetup({
    stripe: { products: { retrieve: async () => { called = true; return {}; } } },
    secretKey: "not-a-key",
    productId: PRODUCT_ID
  });

  assert.equal(result.ok, false);
  assert.equal(called, false, "no network call may be made with an unusable key");
});
