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
      const expectedCatalog = expectedPriceCatalog(config);
      const pending = Promise.all(
        expectedCatalog.map((entry) => retrieveAndValidatePrice(stripe, config, entry.priceId, entry))
      ).then((prices) => Object.freeze(Object.fromEntries(
        expectedCatalog.map((entry, index) => [entry.key, prices[index]])
      )));
      // A transient Stripe failure must not stay memoized, or one blip would keep every
      // later checkout and webhook returning 503 until the process restarts.
      pending.catch(() => {
        if (priceCatalogValidation === pending) priceCatalogValidation = null;
      });
      priceCatalogValidation = pending;
    }
    return priceCatalogValidation;
  }

  async function createCheckoutSession(input) {
    const interval = normalizeInterval(input?.interval);
    const account = input?.account;
    assertDomain(account?.id, "ACCOUNT_REQUIRED", "An authenticated account is required.", 401);
    await validatePriceCatalog();
    const priceId = config.priceIds[interval];
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
    return normalizeCheckoutSession(session);
  }

  async function retrieveCheckoutSession(input) {
    const sessionId = String(input?.sessionId || "").trim();
    assertDomain(/^cs_[A-Za-z0-9_]+$/.test(sessionId), "STRIPE_CHECKOUT_INVALID", "A valid Stripe Checkout session is required.", 400);
    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId);
    } catch (error) {
      const unavailable = new HostedDomainError(
        "STRIPE_CHECKOUT_UNAVAILABLE",
        "The existing Stripe Checkout session could not be recovered.",
        503
      );
      unavailable.cause = error;
      throw unavailable;
    }
    return normalizeCheckoutSession(session);
  }

  async function resolveRefundSubscriptionId(charge) {
    const embedded = extractInvoiceSubscriptionId(charge?.invoice);
    if (embedded) return embedded;
    const invoiceId = typeof charge?.invoice === "string" ? charge.invoice.trim() : "";
    if (!invoiceId) return null;
    try {
      const invoice = await stripe.invoices.retrieve(invoiceId);
      return extractInvoiceSubscriptionId(invoice);
    } catch (error) {
      const unavailable = new HostedDomainError(
        "STRIPE_REFUND_RECONCILIATION_UNAVAILABLE",
        "Stripe could not resolve the refunded invoice to its subscription.",
        503
      );
      unavailable.cause = error;
      throw unavailable;
    }
  }

  // Reconciliation reads the live object rather than replaying events, because a
  // webhook that was never delivered leaves no event to replay.
  async function retrieveSubscription(subscriptionId) {
    const id = String(subscriptionId || "").trim();
    assertDomain(/^sub_[A-Za-z0-9_]+$/.test(id), "STRIPE_SUBSCRIPTION_INVALID", "A valid Stripe subscription is required.", 400);
    try {
      return await stripe.subscriptions.retrieve(id);
    } catch (error) {
      const unavailable = new HostedDomainError(
        "STRIPE_SUBSCRIPTION_UNAVAILABLE",
        "The Stripe subscription could not be read.",
        503
      );
      unavailable.cause = error;
      throw unavailable;
    }
  }

  // A Dispute names only its Charge, so tying it to a subscription needs the same
  // Charge -> Invoice -> Subscription walk a bare refund needs.
  async function resolveDisputeSubscriptionId(dispute) {
    const inline = dispute?.charge;
    if (inline && typeof inline === "object") return resolveRefundSubscriptionId(inline);
    const chargeId = typeof inline === "string" ? inline.trim() : "";
    if (!chargeId) return null;
    let charge;
    try {
      charge = await stripe.charges.retrieve(chargeId);
    } catch (error) {
      const unavailable = new HostedDomainError(
        "STRIPE_DISPUTE_RECONCILIATION_UNAVAILABLE",
        "Stripe could not resolve the disputed charge to its subscription.",
        503
      );
      unavailable.cause = error;
      throw unavailable;
    }
    return resolveRefundSubscriptionId(charge);
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
    resolveDisputeSubscriptionId,
    resolveRefundSubscriptionId,
    retrieveCheckoutSession,
    retrieveSubscription,
    validatePriceCatalog
  };
}

function normalizeCheckoutSession(session) {
  const id = String(session?.id || "").trim();
  const status = String(session?.status || "open").toLowerCase();
  const url = String(session?.url || "");
  assertDomain(/^cs_[A-Za-z0-9_]+$/.test(id), "STRIPE_CHECKOUT_INVALID", "Stripe did not return a valid Checkout session.", 502);
  assertDomain(["open", "complete", "expired"].includes(status), "STRIPE_CHECKOUT_INVALID", "Stripe returned an invalid Checkout status.", 502);
  if (status === "open") {
    assertDomain(/^https:\/\/checkout\.stripe\.com\//.test(url), "STRIPE_CHECKOUT_INVALID", "Stripe did not return a valid hosted Checkout URL.", 502);
  }
  const expiresAt = Number.isFinite(session?.expires_at)
    ? new Date(session.expires_at * 1000).toISOString()
    : null;
  return {
    id,
    url: status === "open" ? url : "",
    status,
    expiresAt
  };
}

function extractInvoiceSubscriptionId(invoice) {
  if (!invoice || typeof invoice !== "object") return null;
  const candidate =
    invoice.subscription ||
    invoice?.parent?.subscription_details?.subscription;
  if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
  if (candidate && typeof candidate === "object" && typeof candidate.id === "string") {
    return candidate.id.trim() || null;
  }
  return null;
}

function expectedPriceCatalog(config) {
  const catalog = [
    { key: "month", priceId: config.priceIds.month, amount: expectedAmount(config, "month"), interval: "month" },
    { key: "year", priceId: config.priceIds.year, amount: expectedAmount(config, "year"), interval: "year" }
  ];
  return catalog;
}

function expectedAmount(config, key) {
  const amount = config.priceAmounts?.[key];
  assertDomain(
    Number.isInteger(amount) && amount > 0,
    "STRIPE_PRICE_AMOUNT_UNCONFIGURED",
    "The approved Stripe unit amount for this plan is not configured.",
    500
  );
  return amount;
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
  const allowed = ["month", "year"];
  assertDomain(allowed.includes(interval), "BILLING_INTERVAL_INVALID", `Billing interval must be one of ${allowed.join(", ")}.`, 400);
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
