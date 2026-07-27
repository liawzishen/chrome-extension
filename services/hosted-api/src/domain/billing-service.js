const { HostedDomainError, assertDomain } = require("./errors.js");
const { resolveEntitlement } = require("./policy.js");

const SUPPORTED_EVENT_TYPES = new Set([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.paid",
  "invoice.payment_failed",
  "charge.refunded"
]);

class BillingService {
  constructor(options) {
    assertDomain(options?.store, "STORE_REQUIRED", "A hosted billing store is required.", 500);
    assertDomain(options?.config, "CONFIG_REQUIRED", "Hosted billing configuration is required.", 500);
    this.store = options.store;
    this.config = options.config;
    this.now = typeof options.now === "function" ? options.now : Date.now;
  }

  async processVerifiedEvent(event) {
    assertDomain(event && typeof event === "object", "INVALID_STRIPE_EVENT", "Stripe event must be an object.");
    const eventId = requireStripeId(event.id, "id");
    const eventType = requireStripeId(event.type, "type");
    const eventCreated = Number(event.created);
    assertDomain(
      Number.isFinite(eventCreated) && eventCreated > 0,
      "INVALID_STRIPE_EVENT",
      "Stripe event is missing a valid created timestamp."
    );

    return this.store.transaction((state) => {
      if (state.processedBillingEvents.has(eventId)) {
        return { duplicate: true, outcome: "already_processed" };
      }

      const outcome = SUPPORTED_EVENT_TYPES.has(eventType)
        ? this.applySupportedEvent(state, event)
        : "ignored";

      state.processedBillingEvents.add(eventId);
      state.billingReceipts.set(eventId, {
        eventId,
        eventType,
        eventCreated,
        processedAt: new Date(this.now()).toISOString(),
        outcome
      });
      return { duplicate: false, outcome };
    });
  }

  applySupportedEvent(state, event) {
    const object = event?.data?.object;
    assertDomain(
      object && typeof object === "object",
      "INVALID_STRIPE_EVENT",
      "Stripe event has no data object."
    );

    switch (event.type) {
      case "checkout.session.completed":
        return this.applyCheckoutCompleted(state, object);
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        return this.applySubscription(state, event, object);
      case "invoice.paid":
        return this.applyInvoice(state, event, object, false);
      case "invoice.payment_failed":
        return this.applyInvoice(state, event, object, true);
      case "charge.refunded":
        return this.applyRefund(state, event, object);
      default:
        return "ignored";
    }
  }

  applyCheckoutCompleted(state, session) {
    const accountId = session.client_reference_id || getMetadataAccountId(session);
    assertDomain(
      typeof accountId === "string" && state.accounts.has(accountId),
      "UNKNOWN_BILLING_ACCOUNT",
      "Checkout session does not reference a known account."
    );

    const customerId = requireStripeId(session.customer, "customer");
    const account = state.accounts.get(accountId);
    account.stripeCustomerId = customerId;
    account.updatedAt = new Date(this.now()).toISOString();
    state.customerAccounts.set(customerId, accountId);

    if (typeof session.subscription === "string" && session.subscription) {
      state.subscriptionAccounts.set(session.subscription, accountId);
    }
    return "checkout_linked";
  }

  applySubscription(state, event, subscription) {
    const subscriptionId = requireStripeId(subscription.id, "subscription id");
    const customerId = requireStripeId(subscription.customer, "customer");
    const accountId =
      getMetadataAccountId(subscription) ||
      state.subscriptionAccounts.get(subscriptionId) ||
      state.customerAccounts.get(customerId);
    assertDomain(
      typeof accountId === "string" && state.accounts.has(accountId),
      "UNKNOWN_BILLING_ACCOUNT",
      "Subscription does not map to a known account."
    );

    const existing = state.subscriptions.get(accountId);
    if (
      existing &&
      Number.isFinite(existing.lastStripeEventCreated) &&
      event.created < existing.lastStripeEventCreated
    ) {
      return "stale_subscription_event";
    }

    const priceId = subscription?.items?.data?.[0]?.price?.id;
    const billingInterval = this.mapPriceToInterval(priceId);
    const nowIso = new Date(this.now()).toISOString();
    const period = getSubscriptionPeriod(subscription, nowIso);
    const isDeleted = event.type === "customer.subscription.deleted";
    const isSameSubscription = existing?.stripeSubscriptionId === subscriptionId;
    const status = isDeleted ? "canceled" : String(subscription.status || "");
    const createdAt = asIsoFromUnix(
      subscription.start_date ?? subscription.created,
      existing?.allowanceAnchorAt || nowIso
    );
    const projection = {
      accountId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      stripePriceId: priceId,
      plan: "student_pro",
      billingInterval,
      status,
      cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
      currentPeriodStart: period.currentPeriodStart,
      currentPeriodEnd: period.currentPeriodEnd,
      allowanceAnchorAt: isSameSubscription
        ? existing.allowanceAnchorAt || createdAt
        : createdAt,
      graceEndsAt: isDeleted
        ? null
        : isSameSubscription ? existing.graceEndsAt || null : null,
      revokedAt: isDeleted
        ? nowIso
        : isSameSubscription ? existing.revokedAt || null : null,
      lastStripeEventCreated: event.created,
      updatedAt: nowIso
    };

    state.subscriptions.set(accountId, projection);
    state.subscriptionAccounts.set(subscriptionId, accountId);
    state.customerAccounts.set(customerId, accountId);
    const account = state.accounts.get(accountId);
    account.stripeCustomerId = customerId;
    account.updatedAt = nowIso;
    this.refreshEntitlement(state, accountId, projection);
    return "subscription_projected";
  }

  applyInvoice(state, event, invoice, failed) {
    const subscriptionId = typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice?.parent?.subscription_details?.subscription;
    const customerId = typeof invoice.customer === "string" ? invoice.customer : null;
    const accountId =
      (subscriptionId && state.subscriptionAccounts.get(subscriptionId)) ||
      (customerId && state.customerAccounts.get(customerId));

    assertDomain(
      typeof accountId === "string" && state.accounts.has(accountId),
      "UNKNOWN_BILLING_ACCOUNT",
      "Invoice does not map to a known account."
    );
    const existing = state.subscriptions.get(accountId);
    assertDomain(
      existing,
      "UNKNOWN_BILLING_SUBSCRIPTION",
      "Invoice does not map to a known subscription."
    );
    if (event.created < existing.lastStripeEventCreated) {
      return "stale_invoice_event";
    }

    const now = this.now();
    existing.lastStripeEventCreated = event.created;
    existing.updatedAt = new Date(now).toISOString();
    if (["canceled", "expired", "refunded", "revoked", "disputed"].includes(existing.status)) {
      this.refreshEntitlement(state, accountId, existing);
      return "terminal_subscription_unchanged";
    }
    if (failed) {
      existing.status = "past_due";
      existing.graceEndsAt = new Date(
        now + this.config.graceDays * 86_400_000
      ).toISOString();
      this.refreshEntitlement(state, accountId, existing);
      return "payment_grace_started";
    }
    if (["past_due", "unpaid", "incomplete"].includes(existing.status)) {
      existing.status = "active";
      existing.graceEndsAt = null;
      existing.revokedAt = null;
      this.refreshEntitlement(state, accountId, existing);
      return "payment_restored";
    }
    this.refreshEntitlement(state, accountId, existing);
    return "payment_confirmed";
  }

  applyRefund(state, event, charge) {
    if (!isFullyRefunded(charge) || !this.config.refundRevokesAccess) {
      return "refund_recorded";
    }

    const customerId = typeof charge.customer === "string" ? charge.customer : null;
    const accountId = customerId && state.customerAccounts.get(customerId);
    assertDomain(
      typeof accountId === "string" && state.accounts.has(accountId),
      "UNKNOWN_BILLING_ACCOUNT",
      "Refund does not map to a known account."
    );
    const existing = state.subscriptions.get(accountId);
    if (!existing || event.created < existing.lastStripeEventCreated) {
      return "stale_refund_event";
    }

    const nowIso = new Date(this.now()).toISOString();
    existing.status = "revoked";
    existing.revokedAt = nowIso;
    existing.graceEndsAt = null;
    existing.lastStripeEventCreated = event.created;
    existing.updatedAt = nowIso;
    this.refreshEntitlement(state, accountId, existing);
    return "entitlement_revoked";
  }

  refreshEntitlement(state, accountId, subscription) {
    state.entitlements.set(
      accountId,
      resolveEntitlement(subscription, this.now(), {
        graceMs: this.config.graceDays * 86_400_000
      })
    );
  }

  mapPriceToInterval(priceId) {
    if (priceId === this.config.priceIds.month) return "month";
    if (priceId === this.config.priceIds.year) return "year";
    if (priceId && priceId === this.config.priceIds.foundingYear) return "founding_year";
    throw new HostedDomainError(
      "UNKNOWN_STRIPE_PRICE",
      "Subscription uses a price that is not configured for this service.",
      500
    );
  }
}

function asIsoFromUnix(value, fallback) {
  return Number.isFinite(value) && value > 0
    ? new Date(value * 1000).toISOString()
    : fallback;
}

function requireStripeId(value, fieldName) {
  assertDomain(
    typeof value === "string" && value.trim().length > 0,
    "INVALID_STRIPE_EVENT",
    `Stripe event is missing ${fieldName}.`
  );
  return value.trim();
}

function getMetadataAccountId(object) {
  const accountId = object?.metadata?.account_id;
  return typeof accountId === "string" && accountId.trim() ? accountId.trim() : null;
}

function getSubscriptionPeriod(subscription, fallback) {
  const firstItem = subscription?.items?.data?.[0] || null;
  const start = subscription?.current_period_start ?? firstItem?.current_period_start;
  const end = subscription?.current_period_end ?? firstItem?.current_period_end;
  return {
    currentPeriodStart: asIsoFromUnix(start, fallback),
    currentPeriodEnd: asIsoFromUnix(end, null)
  };
}

function isFullyRefunded(charge) {
  const amount = Number(charge?.amount);
  const refunded = Number(charge?.amount_refunded);
  return charge?.refunded === true || (
    Number.isFinite(amount) &&
    amount > 0 &&
    Number.isFinite(refunded) &&
    refunded >= amount
  );
}

module.exports = { BillingService, SUPPORTED_EVENT_TYPES };
