const test = require("node:test");
const assert = require("node:assert/strict");
const Stripe = require("stripe");

const {
  createStripeBillingAdapter
} = require("../services/hosted-api/src/adapters/stripe-billing.js");

const CHECKOUT_ATTEMPT_ID = "checkout-attempt-unit123";

function adapterConfig(overrides = {}) {
  return {
    billingEnabled: true,
    stripeSecretKey: "sk_test_unit123",
    stripeWebhookSecret: "whsec_unit123",
    apiVersion: "2026-06-24.dahlia",
    publicAppOrigin: "https://app.exam-cram.test",
    automaticTax: false,
    priceIds: {
      month: "price_monthly123",
      year: "price_annual123",
      foundingYear: ""
    },
    priceAmounts: {
      month: 499,
      year: 4999
    },
    ...overrides
  };
}

function createFakeStripe(overrides = {}) {
  const calls = {
    checkout: [],
    checkoutRetrieve: [],
    invoices: [],
    portal: [],
    prices: []
  };
  const stripe = {
    prices: {
      retrieve: async (priceId) => {
        calls.prices.push(priceId);
        const founding = priceId === "price_founding123";
        const annual = founding || priceId === "price_annual123";
        return {
          id: priceId,
          active: true,
          livemode: false,
          currency: "usd",
          type: "recurring",
          unit_amount: founding ? 3999 : annual ? 4999 : 499,
          recurring: {
            interval: annual ? "year" : "month",
            interval_count: 1
          }
        };
      }
    },
    checkout: {
      sessions: {
        create: async (parameters, requestOptions) => {
          calls.checkout.push({ parameters, requestOptions });
          return {
            id: "cs_test_unit123",
            url: "https://checkout.stripe.com/c/pay/cs_test_unit123"
          };
        },
        retrieve: async (sessionId) => {
          calls.checkoutRetrieve.push(sessionId);
          return {
            id: sessionId,
            status: "open",
            expires_at: 1_785_326_400,
            url: "https://checkout.stripe.com/c/pay/cs_test_unit123"
          };
        }
      }
    },
    billingPortal: {
      sessions: {
        create: async (parameters, requestOptions) => {
          calls.portal.push({ parameters, requestOptions });
          return {
            id: "bps_test_unit123",
            url: "https://billing.stripe.com/p/session/test_unit123"
          };
        }
      }
    },
    invoices: {
      retrieve: async (invoiceId) => {
        calls.invoices.push(invoiceId);
        return {
          id: invoiceId,
          parent: {
            subscription_details: {
              subscription: "sub_resolved123"
            }
          }
        };
      }
    },
    webhooks: {
      constructEvent: () => ({ id: "evt_unit123" })
    },
    ...overrides
  };
  return { calls, stripe };
}

function assertHostedError(error, expectedCode) {
  assert.equal(error?.code, expectedCode);
  return true;
}

test("Stripe adapter cannot be constructed while hosted billing is disabled", () => {
  const { stripe } = createFakeStripe();
  assert.throws(
    () => createStripeBillingAdapter({ ...adapterConfig(), billingEnabled: false }, { stripe }),
    (error) => assertHostedError(error, "BILLING_NOT_CONFIGURED")
  );
});

test("checkout maps a monthly choice to server-owned price and redirect values", async () => {
  const { calls, stripe } = createFakeStripe();
  const adapter = createStripeBillingAdapter(adapterConfig(), { stripe });

  const result = await adapter.createCheckoutSession({
    attemptId: CHECKOUT_ATTEMPT_ID,
    interval: "month",
    idempotencyKey: "checkout:account-123:0001",
    account: {
      id: "account-123",
      email: "student@example.test",
      emailVerified: true
    },
    priceId: "price_attacker_supplied",
    successUrl: "https://attacker.test/success",
    cancelUrl: "https://attacker.test/cancel"
  });

  assert.deepEqual(result, {
    id: "cs_test_unit123",
    url: "https://checkout.stripe.com/c/pay/cs_test_unit123",
    status: "open",
    expiresAt: null
  });
  assert.equal(calls.checkout.length, 1);
  assert.deepEqual(calls.checkout[0], {
    parameters: {
      mode: "subscription",
      ui_mode: "hosted_page",
      client_reference_id: "account-123",
      line_items: [{ price: "price_monthly123", quantity: 1 }],
      success_url: "https://app.exam-cram.test/billing/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://app.exam-cram.test/billing/canceled",
      automatic_tax: { enabled: false },
      metadata: {
        account_id: "account-123",
        checkout_attempt_id: CHECKOUT_ATTEMPT_ID,
        plan: "student_pro",
        interval: "month",
        price_id: "price_monthly123"
      },
      subscription_data: {
        metadata: {
          account_id: "account-123",
          plan: "student_pro",
          interval: "month"
        }
      },
      customer_email: "student@example.test"
    },
    requestOptions: {
      idempotencyKey: "checkout:account-123:0001"
    }
  });
});

test("annual checkout reuses only the authenticated account's stored Stripe customer", async () => {
  const { calls, stripe } = createFakeStripe();
  const adapter = createStripeBillingAdapter(adapterConfig({
    automaticTax: true
  }), { stripe });

  await adapter.createCheckoutSession({
    attemptId: CHECKOUT_ATTEMPT_ID,
    interval: "year",
    idempotencyKey: "checkout:account-123:0002",
    account: {
      id: "account-123",
      email: "untrusted@example.test",
      emailVerified: false,
      stripeCustomerId: "cus_stored123"
    }
  });

  const parameters = calls.checkout[0].parameters;
  assert.deepEqual(parameters.line_items, [{ price: "price_annual123", quantity: 1 }]);
  assert.equal(parameters.customer, "cus_stored123");
  assert.equal(Object.hasOwn(parameters, "customer_email"), false);
  assert.deepEqual(parameters.automatic_tax, { enabled: true });
  assert.equal(parameters.success_url, "https://app.exam-cram.test/billing/success?session_id={CHECKOUT_SESSION_ID}");
  assert.equal(parameters.cancel_url, "https://app.exam-cram.test/billing/canceled");
});

test("an existing open Checkout session can be recovered without creating another", async () => {
  const { calls, stripe } = createFakeStripe();
  const adapter = createStripeBillingAdapter(adapterConfig(), { stripe });
  const session = await adapter.retrieveCheckoutSession({
    sessionId: "cs_test_unit123"
  });
  assert.deepEqual(session, {
    id: "cs_test_unit123",
    url: "https://checkout.stripe.com/c/pay/cs_test_unit123",
    status: "open",
    expiresAt: "2026-07-29T12:00:00.000Z"
  });
  assert.deepEqual(calls.checkoutRetrieve, ["cs_test_unit123"]);
  assert.equal(calls.checkout.length, 0);
});

test("a refunded Charge resolves its subscription through the signed invoice reference", async () => {
  const { calls, stripe } = createFakeStripe();
  const adapter = createStripeBillingAdapter(adapterConfig(), { stripe });
  const subscriptionId = await adapter.resolveRefundSubscriptionId({
    id: "ch_refunded123",
    invoice: "in_refunded123"
  });
  assert.equal(subscriptionId, "sub_resolved123");
  assert.deepEqual(calls.invoices, ["in_refunded123"]);
});

test("checkout fails closed when a configured Price has the wrong amount or interval", async () => {
  let checkoutCalled = false;
  const { stripe } = createFakeStripe({
    prices: {
      retrieve: async (priceId) => ({
        id: priceId,
        active: true,
        livemode: false,
        currency: "usd",
        type: "recurring",
        unit_amount: priceId === "price_monthly123" ? 999 : 4999,
        recurring: {
          interval: priceId === "price_monthly123" ? "month" : "year",
          interval_count: 1
        }
      })
    },
    checkout: {
      sessions: {
        create: async () => {
          checkoutCalled = true;
          return {
            id: "cs_test_should_not_exist",
            url: "https://checkout.stripe.com/c/pay/cs_test_should_not_exist"
          };
        }
      }
    }
  });
  const adapter = createStripeBillingAdapter(adapterConfig(), { stripe });

  await assert.rejects(
    adapter.createCheckoutSession({
      attemptId: CHECKOUT_ATTEMPT_ID,
      interval: "month",
      idempotencyKey: "checkout:account-123:catalog",
      account: { id: "account-123" }
    }),
    (error) => assertHostedError(error, "STRIPE_PRICE_CONFIGURATION_INVALID")
  );
  assert.equal(checkoutCalled, false);
});

test("a transient Stripe price outage does not permanently poison the catalog memo", async () => {
  const { calls, stripe } = createFakeStripe();
  const healthyRetrieve = stripe.prices.retrieve;
  let stripeIsDown = true;
  stripe.prices.retrieve = async (priceId) => {
    if (stripeIsDown) throw new Error("stripe network blip");
    return healthyRetrieve(priceId);
  };
  const adapter = createStripeBillingAdapter(adapterConfig(), { stripe });

  await assert.rejects(
    adapter.validatePriceCatalog(),
    (error) => assertHostedError(error, "STRIPE_PRICE_CONFIGURATION_UNAVAILABLE")
  );
  await assert.rejects(
    adapter.createCheckoutSession({
      attemptId: CHECKOUT_ATTEMPT_ID,
      interval: "month",
      idempotencyKey: "checkout:account-123:outage",
      account: { id: "account-123" }
    }),
    (error) => assertHostedError(error, "STRIPE_PRICE_CONFIGURATION_UNAVAILABLE")
  );
  assert.equal(calls.checkout.length, 0);

  stripeIsDown = false;
  const catalog = await adapter.validatePriceCatalog();
  assert.equal(catalog.month.id, "price_monthly123");
  assert.equal(catalog.year.id, "price_annual123");

  const result = await adapter.createCheckoutSession({
    attemptId: CHECKOUT_ATTEMPT_ID,
    interval: "month",
    idempotencyKey: "checkout:account-123:recovered",
    account: { id: "account-123" }
  });
  assert.equal(result.id, "cs_test_unit123");
  assert.equal(calls.checkout.length, 1);
});

test("a validated price catalog is retrieved once and reused across calls", async () => {
  const { calls, stripe } = createFakeStripe();
  const adapter = createStripeBillingAdapter(adapterConfig(), { stripe });

  const [first, second] = await Promise.all([
    adapter.validatePriceCatalog(),
    adapter.validatePriceCatalog()
  ]);
  await adapter.validatePriceCatalog();

  assert.equal(first, second);
  assert.deepEqual(calls.prices, ["price_monthly123", "price_annual123"]);
});

test("the provisional founding offer cannot use the ordinary recurring checkout path", async () => {
  const { stripe } = createFakeStripe();
  const adapter = createStripeBillingAdapter(adapterConfig({
    priceIds: {
      month: "price_monthly123",
      year: "price_annual123",
      foundingYear: "price_founding123"
    }
  }), { stripe });

  await assert.rejects(
    adapter.createCheckoutSession({
      attemptId: CHECKOUT_ATTEMPT_ID,
      interval: "founding_year",
      idempotencyKey: "checkout:account-123:founding",
      account: { id: "account-123" }
    }),
    (error) => assertHostedError(error, "BILLING_INTERVAL_INVALID")
  );
});

test("checkout rejects unsupported intervals and missing association or idempotency before calling Stripe", async () => {
  const { calls, stripe } = createFakeStripe();
  const adapter = createStripeBillingAdapter(adapterConfig(), { stripe });
  const account = { id: "account-123" };

  await assert.rejects(
    adapter.createCheckoutSession({
      attemptId: CHECKOUT_ATTEMPT_ID,
      interval: "founding-year",
      idempotencyKey: "checkout:account-123:0003",
      account
    }),
    (error) => assertHostedError(error, "BILLING_INTERVAL_INVALID")
  );
  await assert.rejects(
    adapter.createCheckoutSession({
      attemptId: CHECKOUT_ATTEMPT_ID,
      interval: "month",
      account
    }),
    (error) => assertHostedError(error, "IDEMPOTENCY_REQUIRED")
  );
  await assert.rejects(
    adapter.createCheckoutSession({
      interval: "month",
      idempotencyKey: "checkout:account-123:missing-attempt",
      account
    }),
    (error) => assertHostedError(error, "CHECKOUT_ATTEMPT_REQUIRED")
  );
  assert.equal(calls.checkout.length, 0);
});

test("billing portal uses the stored customer and a fixed first-party return URL", async () => {
  const { calls, stripe } = createFakeStripe();
  const adapter = createStripeBillingAdapter(adapterConfig(), { stripe });

  const result = await adapter.createPortalSession({
    idempotencyKey: "portal:account-123:0001",
    returnUrl: "https://attacker.test/account",
    account: {
      id: "account-123",
      stripeCustomerId: "cus_stored123"
    }
  });

  assert.deepEqual(result, {
    id: "bps_test_unit123",
    url: "https://billing.stripe.com/p/session/test_unit123"
  });
  assert.deepEqual(calls.portal[0], {
    parameters: {
      customer: "cus_stored123",
      return_url: "https://app.exam-cram.test/account"
    },
    requestOptions: {
      idempotencyKey: "portal:account-123:0001"
    }
  });
});

test("adapter rejects non-Stripe Checkout and Portal response URLs", async () => {
  const { stripe } = createFakeStripe({
    checkout: {
      sessions: {
        create: async () => ({
          id: "cs_test_bad",
          url: "https://checkout.stripe.com.evil.test/session"
        })
      }
    },
    billingPortal: {
      sessions: {
        create: async () => ({
          id: "bps_test_bad",
          url: "https://billing.stripe.com.evil.test/session"
        })
      }
    }
  });
  const adapter = createStripeBillingAdapter(adapterConfig(), { stripe });

  await assert.rejects(
    adapter.createCheckoutSession({
      attemptId: CHECKOUT_ATTEMPT_ID,
      interval: "month",
      idempotencyKey: "checkout:account-123:0004",
      account: { id: "account-123" }
    }),
    (error) => assertHostedError(error, "STRIPE_CHECKOUT_INVALID")
  );
  await assert.rejects(
    adapter.createPortalSession({
      idempotencyKey: "portal:account-123:0002",
      account: { id: "account-123", stripeCustomerId: "cus_stored123" }
    }),
    (error) => assertHostedError(error, "STRIPE_PORTAL_INVALID")
  );
});

test("webhook verification accepts the untouched raw body and rejects any mutation", () => {
  const config = adapterConfig();
  const adapter = createStripeBillingAdapter(config);
  const stripe = new Stripe(config.stripeSecretKey, {
    apiVersion: config.apiVersion
  });
  const rawPayload = '{\n  "id": "evt_raw123",\n  "type": "invoice.paid"\n}';
  const signature = stripe.webhooks.generateTestHeaderString({
    payload: rawPayload,
    secret: config.stripeWebhookSecret,
    timestamp: Math.floor(Date.now() / 1000)
  });

  const event = adapter.constructWebhookEvent(Buffer.from(rawPayload, "utf8"), signature);
  assert.equal(event.id, "evt_raw123");
  assert.equal(event.type, "invoice.paid");

  assert.throws(
    () => adapter.constructWebhookEvent(JSON.stringify(JSON.parse(rawPayload)), signature),
    (error) => assertHostedError(error, "WEBHOOK_SIGNATURE_INVALID")
  );
  assert.throws(
    () => adapter.constructWebhookEvent(JSON.parse(rawPayload), signature),
    (error) => assertHostedError(error, "WEBHOOK_BODY_REQUIRED")
  );
  assert.throws(
    () => adapter.constructWebhookEvent(Buffer.from(rawPayload), ""),
    (error) => assertHostedError(error, "WEBHOOK_SIGNATURE_REQUIRED")
  );
});
