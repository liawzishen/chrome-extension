const Stripe = require("stripe");
const { HostedDomainError, assertDomain } = require("../domain/errors.js");

function createStripeBillingAdapter(config, dependencies = {}) {
  assertDomain(config?.billingEnabled, "BILLING_NOT_CONFIGURED", "Hosted billing is not configured.", 503);
  const stripe = dependencies.stripe || new Stripe(config.stripeSecretKey, {
    apiVersion: config.apiVersion,
    maxNetworkRetries: 2,
    timeout: 20_000
  });
  let priceCatalogValidation = null;

  async function validatePriceCatalog() {
    if (!priceCatalogValidation) {
      priceCatalogValidation = Promise.all([
        retrieveAndValidatePrice(stripe, config, config.priceIds.month, {
          amount: 499,
          interval: "month"
        }),
        retrieveAndValidatePrice(stripe, config, config.priceIds.year, {
          amount: 4999,
          interval: "year"
        })
      ]).then(([month, year]) => Object.freeze({ month, year }));
    }
    return priceCatalogValidation;
  }

  async function createCheckoutSession(input) {
    const interval = normalizeInterval(input?.interval);
    const account = input?.account;
    assertDomain(account?.id, "ACCOUNT_REQUIRED", "An authenticated account is required.", 401);
    await validatePriceCatalog();
    const priceId = interval === "month" ? config.priceIds.month : config.priceIds.year;
    const parameters = {
      mode: "subscription",
      ui_mode: "hosted_page",
      client_reference_id: account.id,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${config.publicAppOrigin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.publicAppOrigin}/billing/canceled`,
      automatic_tax: { enabled: config.automaticTax },
      metadata: {
        account_id: account.id,
        plan: "student_pro",
        interval
      },
      subscription_data: {
        metadata: {
          account_id: account.id,
          plan: "student_pro",
          interval
        }
      }
    };
    if (account.stripeCustomerId) parameters.customer = account.stripeCustomerId;
    else if (account.emailVerified && account.email) parameters.customer_email = account.email;
    const session = await stripe.checkout.sessions.create(parameters, {
      idempotencyKey: normalizeStripeIdempotencyKey(input?.idempotencyKey)
    });
    assertDomain(/^https:\/\/checkout\.stripe\.com\//.test(String(session?.url || "")), "STRIPE_CHECKOUT_INVALID", "Stripe did not return a valid hosted Checkout URL.", 502);
    return { id: session.id, url: session.url };
  }

  async function createPortalSession(input) {
    const account = input?.account;
    assertDomain(account?.stripeCustomerId, "BILLING_CUSTOMER_MISSING", "No billing customer exists for this account.", 409);
    const session = await stripe.billingPortal.sessions.create({
      customer: account.stripeCustomerId,
      return_url: `${config.publicAppOrigin}/account`
    }, {
      idempotencyKey: normalizeStripeIdempotencyKey(input?.idempotencyKey)
    });
    assertDomain(/^https:\/\/billing\.stripe\.com\//.test(String(session?.url || "")), "STRIPE_PORTAL_INVALID", "Stripe did not return a valid billing portal URL.", 502);
    return { id: session.id, url: session.url };
  }

  function constructWebhookEvent(rawBody, signature) {
    assertDomain(Buffer.isBuffer(rawBody) || typeof rawBody === "string", "WEBHOOK_BODY_REQUIRED", "The untouched Stripe webhook body is required.", 400);
    assertDomain(String(signature || "").length > 0, "WEBHOOK_SIGNATURE_REQUIRED", "The Stripe-Signature header is required.", 400);
    try {
      return stripe.webhooks.constructEvent(rawBody, signature, config.stripeWebhookSecret, 300);
    } catch {
      assertDomain(false, "WEBHOOK_SIGNATURE_INVALID", "The Stripe webhook signature is invalid.", 400);
    }
  }

  return {
    constructWebhookEvent,
    createCheckoutSession,
    createPortalSession,
    validatePriceCatalog
  };
}

async function retrieveAndValidatePrice(stripe, config, priceId, expected) {
  let price;
  try {
    price = await stripe.prices.retrieve(priceId);
  } catch (error) {
    const unavailable = new HostedDomainError(
      "STRIPE_PRICE_CONFIGURATION_UNAVAILABLE",
      "The configured Stripe Price could not be verified.",
      503
    );
    unavailable.cause = error;
    throw unavailable;
  }
  const expectedLivemode = config.stripeSecretKey.startsWith("sk_live_");
  assertDomain(
    price?.id === priceId &&
      price.active === true &&
      price.livemode === expectedLivemode &&
      price.currency === "usd" &&
      price.type === "recurring" &&
      price.unit_amount === expected.amount &&
      price.recurring?.interval === expected.interval &&
      Number(price.recurring?.interval_count) === 1,
    "STRIPE_PRICE_CONFIGURATION_INVALID",
    "A configured Stripe Price does not match the approved Student Pro catalog.",
    503
  );
  return Object.freeze({
    id: price.id,
    amount: price.unit_amount,
    currency: price.currency,
    interval: price.recurring.interval,
    livemode: price.livemode
  });
}

function normalizeInterval(value) {
  const interval = String(value || "").toLowerCase();
  assertDomain(interval === "month" || interval === "year", "BILLING_INTERVAL_INVALID", "Billing interval must be month or year.", 400);
  return interval;
}

function normalizeStripeIdempotencyKey(value) {
  const key = String(value || "").trim();
  assertDomain(/^[a-zA-Z0-9._:-]{16,160}$/.test(key), "IDEMPOTENCY_REQUIRED", "A valid Idempotency-Key is required.", 400);
  return key;
}

module.exports = {
  createStripeBillingAdapter,
  normalizeInterval,
  retrieveAndValidatePrice
};
