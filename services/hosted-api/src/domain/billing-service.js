const { HostedDomainError, assertDomain } = require("./errors.js");
const { resolveEntitlement } = require("./policy.js");

const SUPPORTED_EVENT_TYPES = new Set([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.paid",
  "invoice.payment_failed",
  "charge.refunded",
  "charge.dispute.created",
  "charge.dispute.closed"
]);

// Failures that no amount of Stripe retrying can turn into a success. They are
// recorded as processed so the webhook can answer 200 and stop the three-day
// retry storm; everything else still throws and is retried.
const PERMANENT_FAILURE_OUTCOMES = Object.freeze({
  UNKNOWN_STRIPE_PRICE: "unknown_price",
  UNKNOWN_BILLING_ACCOUNT: "unknown_account"
});

class BillingService {
  constructor(options) {
    assertDomain(options?.store, "STORE_REQUIRED", "A hosted billing store is required.", 500);
    assertDomain(options?.config, "CONFIG_REQUIRED", "Hosted billing configuration is required.", 500);
    this.store = options.store;
    this.config = options.config;
    this.now = typeof options.now === "function" ? options.now : Date.now;
    this.logger = typeof options.logger?.error === "function" ? options.logger : console;
    this.resolveRefundSubscriptionId =
      typeof options.resolveRefundSubscriptionId === "function"
        ? options.resolveRefundSubscriptionId
        : null;
    this.resolveDisputeSubscriptionId =
      typeof options.resolveDisputeSubscriptionId === "function"
        ? options.resolveDisputeSubscriptionId
        : null;
  }

  // Applies the live Stripe subscription object directly. A webhook that was
  // never delivered leaves no event to replay, so periodic reconciliation is the
  // only thing that closes the gap between "the learner paid" and "we noticed".
  // The synthesized event is stamped with the current time so it always wins over
  // stale projections, and it is not recorded in processedBillingEvents because
  // it is not a delivery.
  async reconcileSubscription(subscription) {
    assertDomain(
      subscription && typeof subscription === "object",
      "INVALID_STRIPE_EVENT",
      "A Stripe subscription object is required for reconciliation."
    );
    const syntheticEvent = {
      id: `reconcile_${requireStripeId(subscription.id, "subscription id")}`,
      type: subscription.status === "canceled"
        ? "customer.subscription.deleted"
        : "customer.subscription.updated",
      created: Math.floor(this.now() / 1000)
    };
    return this.store.transaction((state) => {
      try {
        return { outcome: this.applySubscription(state, syntheticEvent, subscription) };
      } catch (error) {
        const permanent = classifyPermanentFailure(error);
        if (!permanent) throw error;
        return { outcome: permanent };
      }
    });
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
    const eventContext = await this.prepareEventContext(event);

    return this.store.transaction((state) => {
      if (state.processedBillingEvents.has(eventId)) {
        return { duplicate: true, outcome: "already_processed" };
      }

      let outcome;
      try {
        outcome = SUPPORTED_EVENT_TYPES.has(eventType)
          ? this.applySupportedEvent(state, event, eventContext)
          : "ignored";
      } catch (error) {
        const permanentOutcome = classifyPermanentFailure(error);
        if (!permanentOutcome) throw error;
        this.logger.error(
          `[NeatMind Hosted Billing] ${error.code}: Stripe event ${eventId} (${eventType}) is permanently unprocessable and will not be retried.`,
          { eventId, eventType, outcome: permanentOutcome, message: error.message }
        );
        outcome = permanentOutcome;
      }

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

  async prepareEventContext(event) {
    if (event.type === "charge.dispute.created" || event.type === "charge.dispute.closed") {
      const dispute = event?.data?.object;
      const inline = getDisputeSubscriptionId(dispute);
      if (inline) return { disputeSubscriptionId: inline };
      assertDomain(
        this.resolveDisputeSubscriptionId,
        "DISPUTE_RECONCILIATION_REQUIRED",
        "A dispute requires a verified charge-to-subscription lookup before it can be acknowledged.",
        503
      );
      const resolved = await this.resolveDisputeSubscriptionId(dispute);
      assertDomain(
        typeof resolved === "string" && resolved.trim(),
        "DISPUTE_RECONCILIATION_REQUIRED",
        "The disputed Charge could not be tied to a subscription.",
        503
      );
      return { disputeSubscriptionId: resolved.trim() };
    }
    if (
      event.type !== "charge.refunded" ||
      !this.config.refundRevokesAccess ||
      !isFullyRefunded(event?.data?.object)
    ) {
      return {};
    }
    const inlineSubscriptionId = getChargeSubscriptionId(event.data.object);
    if (inlineSubscriptionId) return { refundSubscriptionId: inlineSubscriptionId };
    assertDomain(
      this.resolveRefundSubscriptionId,
      "REFUND_RECONCILIATION_REQUIRED",
      "A full refund requires a verified invoice-to-subscription lookup before it can be acknowledged.",
      503
    );
    const resolved = await this.resolveRefundSubscriptionId(event.data.object);
    assertDomain(
      typeof resolved === "string" && resolved.trim(),
      "REFUND_RECONCILIATION_REQUIRED",
      "The refunded Charge could not be tied to a subscription.",
      503
    );
    return { refundSubscriptionId: resolved.trim() };
  }

  applySupportedEvent(state, event, context = {}) {
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
        return this.applyRefund(state, event, object, context.refundSubscriptionId);
      case "charge.dispute.created":
      case "charge.dispute.closed":
        return this.applyDispute(state, event, object, context.disputeSubscriptionId);
      default:
        return "ignored";
    }
  }

  applyCheckoutCompleted(state, session) {
    const sessionId = requireStripeId(session.id, "checkout session id");
    const referencedAccountId = typeof session.client_reference_id === "string"
      ? session.client_reference_id.trim()
      : "";
    const metadataAccountId = getMetadataAccountId(session);
    assertDomain(
      !referencedAccountId || !metadataAccountId || referencedAccountId === metadataAccountId,
      "CHECKOUT_ASSOCIATION_MISMATCH",
      "Checkout session account references do not match.",
      409
    );
    const accountId = referencedAccountId || metadataAccountId;
    assertDomain(
      typeof accountId === "string" && state.accounts.has(accountId),
      "UNKNOWN_BILLING_ACCOUNT",
      "Checkout session does not reference a known account.",
      400,
      // A checkout session carries its account reference inline, so a bad or
      // absent one will never resolve on a retry.
      { permanent: true }
    );
    const attempt = resolveCheckoutAttempt(
      state,
      session,
      sessionId,
      accountId
    );

    const customerId = requireStripeId(session.customer, "customer");
    const account = state.accounts.get(accountId);
    account.stripeCustomerId = customerId;
    account.updatedAt = new Date(this.now()).toISOString();
    state.customerAccounts.set(customerId, accountId);

    if (typeof session.subscription === "string" && session.subscription) {
      state.subscriptionAccounts.set(session.subscription, accountId);
    }
    completeCheckoutAttempt(state, attempt, sessionId, this.now());
    return "checkout_linked";
  }

  applySubscription(state, event, subscription) {
    const subscriptionId = requireStripeId(subscription.id, "subscription id");
    const customerId = requireStripeId(subscription.customer, "customer");
    const namedAccountId = getMetadataAccountId(subscription);
    const accountId =
      namedAccountId ||
      state.subscriptionAccounts.get(subscriptionId) ||
      state.customerAccounts.get(customerId);
    assertDomain(
      typeof accountId === "string" && state.accounts.has(accountId),
      "UNKNOWN_BILLING_ACCOUNT",
      "Subscription does not map to a known account.",
      400,
      // Only an event that names an account we have never issued is hopeless. A
      // subscription with no link yet may just be racing ahead of its
      // checkout.session.completed, so that case stays retryable.
      { permanent: Boolean(namedAccountId) }
    );

    const existing = state.subscriptions.get(accountId);
    if (
      existing &&
      existing.stripeSubscriptionId === subscriptionId &&
      Number.isFinite(existing.lastStripeEventCreated) &&
      event.created < existing.lastStripeEventCreated
    ) {
      return "stale_subscription_event";
    }

    const priceId = subscription?.items?.data?.[0]?.price?.id;
    const billingInterval = this.mapPriceToInterval(priceId);
    const now = this.now();
    const nowIso = new Date(now).toISOString();
    const period = getSubscriptionPeriod(subscription, nowIso);
    const isDeleted = event.type === "customer.subscription.deleted";
    const isSameSubscription = existing?.stripeSubscriptionId === subscriptionId;
    const cancelAtPeriodEnd = Boolean(subscription.cancel_at_period_end);
    const providerStatus = isDeleted
      ? "canceled"
      : String(subscription.status || "").toLowerCase();
    const suppliedStart = subscription.start_date ?? subscription.created;
    assertDomain(
      isSameSubscription || (Number.isFinite(suppliedStart) && suppliedStart > 0),
      "INVALID_STRIPE_EVENT",
      "A new Stripe subscription is missing its start timestamp."
    );
    const createdAt = asIsoFromUnix(
      suppliedStart,
      existing?.allowanceAnchorAt || nowIso
    );
    if (
      existing &&
      !isSameSubscription &&
      Date.parse(createdAt) < subscriptionAnchorTimestamp(existing)
    ) {
      state.subscriptionAccounts.set(subscriptionId, accountId);
      state.customerAccounts.set(customerId, accountId);
      return "historical_subscription_event";
    }
    const projection = {
      accountId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      stripePriceId: priceId,
      plan: "student_pro",
      billingInterval,
      providerStatus,
      status: isSameSubscription && isTerminalSubscriptionStatus(existing.status)
        ? existing.status
        : projectSubscriptionStatus(providerStatus, {
            cancelAtPeriodEnd,
            isDeleted
          }),
      cancelAtPeriodEnd,
      currentPeriodStart: period.currentPeriodStart,
      currentPeriodEnd: period.currentPeriodEnd,
      effectiveStartAt: isSameSubscription
        ? existing.effectiveStartAt || createdAt
        : createdAt,
      allowanceAnchorAt: isSameSubscription
        ? existing.allowanceAnchorAt || createdAt
        : createdAt,
      // Stripe may report past_due through a subscription event alone, with no
      // invoice.payment_failed to open the window. Stamp a dated deadline here
      // so the grace period is real and bounded, and never extend one already
      // stamped for this same subscription.
      graceEndsAt: !isDeleted && providerStatus === "past_due"
        ? (
            (isSameSubscription && existing.graceEndsAt) ||
            this.graceDeadlineIso(Math.min(now, event.created * 1000))
          )
        : null,
      revokedAt: isDeleted
        ? (isSameSubscription && existing.revokedAt) || nowIso
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
    clearActiveCheckout(state, accountId, nowIso);
    this.refreshEntitlement(state, accountId, projection);
    return "subscription_projected";
  }

  applyInvoice(state, event, invoice, failed) {
    const subscriptionId = typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice?.parent?.subscription_details?.subscription;
    if (typeof subscriptionId !== "string" || !subscriptionId) {
      return "non_subscription_invoice_ignored";
    }
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
    if (existing.stripeSubscriptionId !== subscriptionId) {
      return "historical_invoice_event";
    }
    if (event.created < existing.lastStripeEventCreated) {
      return "stale_invoice_event";
    }

    const now = this.now();
    existing.lastStripeEventCreated = event.created;
    existing.updatedAt = new Date(now).toISOString();
    if (isTerminalSubscriptionStatus(existing.status)) {
      this.refreshEntitlement(state, accountId, existing);
      return "terminal_subscription_unchanged";
    }
    if (failed) {
      existing.providerStatus = "past_due";
      existing.status = "past_due";
      existing.graceEndsAt = existing.graceEndsAt ||
        this.graceDeadlineIso(Math.min(now, event.created * 1000));
      this.refreshEntitlement(state, accountId, existing);
      return "payment_grace_started";
    }
    const periodAdvanced = reconcilePaidInvoicePeriod(existing, invoice, subscriptionId);
    if (["past_due", "unpaid", "incomplete", "grace_period"].includes(existing.status)) {
      existing.providerStatus = "active";
      existing.status = existing.cancelAtPeriodEnd
        ? "canceled_at_period_end"
        : "active";
      existing.graceEndsAt = null;
      existing.revokedAt = null;
      this.refreshEntitlement(state, accountId, existing);
      return "payment_restored";
    }
    this.refreshEntitlement(state, accountId, existing);
    return periodAdvanced ? "renewal_period_advanced" : "payment_confirmed";
  }

  applyRefund(state, event, charge, resolvedSubscriptionId) {
    if (!isFullyRefunded(charge) || !this.config.refundRevokesAccess) {
      return "refund_recorded";
    }

    const refundedSubscriptionId = resolvedSubscriptionId || getChargeSubscriptionId(charge);
    assertDomain(
      refundedSubscriptionId,
      "REFUND_RECONCILIATION_REQUIRED",
      "The refunded Charge could not be tied to a subscription.",
      503
    );
    const customerId = typeof charge.customer === "string" ? charge.customer : null;
    const accountId =
      state.subscriptionAccounts.get(refundedSubscriptionId) ||
      (customerId && state.customerAccounts.get(customerId));
    assertDomain(
      typeof accountId === "string" && state.accounts.has(accountId),
      "UNKNOWN_BILLING_ACCOUNT",
      "Refund does not map to a known account."
    );
    const existing = state.subscriptions.get(accountId);
    if (!existing || existing.stripeSubscriptionId !== refundedSubscriptionId) {
      return "historical_refund_recorded";
    }
    if (!existing || event.created < existing.lastStripeEventCreated) {
      return "stale_refund_event";
    }

    const nowIso = new Date(this.now()).toISOString();
    existing.status = "refunded";
    existing.revokedAt = nowIso;
    existing.graceEndsAt = null;
    existing.lastStripeEventCreated = event.created;
    existing.updatedAt = nowIso;
    this.refreshEntitlement(state, accountId, existing);
    return "entitlement_refunded";
  }

  // A dispute withdraws the funds immediately, so unlike a refund this is not
  // gated behind refundRevokesAccess: continuing to serve a charge that has been
  // pulled back is a straight loss. If the dispute is later won, access returns.
  applyDispute(state, event, dispute, resolvedSubscriptionId) {
    const subscriptionId = resolvedSubscriptionId || getDisputeSubscriptionId(dispute);
    assertDomain(
      subscriptionId,
      "DISPUTE_RECONCILIATION_REQUIRED",
      "The disputed Charge could not be tied to a subscription.",
      503
    );
    const customerId = typeof dispute?.customer === "string" ? dispute.customer : null;
    const accountId =
      state.subscriptionAccounts.get(subscriptionId) ||
      (customerId && state.customerAccounts.get(customerId));
    assertDomain(
      typeof accountId === "string" && state.accounts.has(accountId),
      "UNKNOWN_BILLING_ACCOUNT",
      "Dispute does not map to a known account."
    );
    const existing = state.subscriptions.get(accountId);
    if (!existing || existing.stripeSubscriptionId !== subscriptionId) {
      return "historical_dispute_recorded";
    }
    if (event.created < existing.lastStripeEventCreated) return "stale_dispute_event";

    const nowIso = new Date(this.now()).toISOString();
    const status = String(dispute?.status || "").toLowerCase();
    existing.lastStripeEventCreated = event.created;
    existing.updatedAt = nowIso;

    if (event.type === "charge.dispute.closed" && status === "won") {
      // Only lift the revocation this dispute caused. A subscription that was
      // separately canceled or refunded must stay in its own terminal state, and
      // reconciliation corrects any residual drift from the live Stripe object.
      if (existing.status === "disputed") {
        existing.status = "active";
        existing.revokedAt = null;
        existing.graceEndsAt = null;
      }
      this.refreshEntitlement(state, accountId, existing);
      return "dispute_won_access_restored";
    }
    if (event.type === "charge.dispute.closed" && ["warning_closed", "warning_needs_response"].includes(status)) {
      this.refreshEntitlement(state, accountId, existing);
      return "dispute_warning_recorded";
    }

    existing.status = "disputed";
    existing.revokedAt = nowIso;
    existing.graceEndsAt = null;
    this.refreshEntitlement(state, accountId, existing);
    return "entitlement_revoked_for_dispute";
  }

  refreshEntitlement(state, accountId, subscription) {
    state.entitlements.set(
      accountId,
      resolveEntitlement(subscription, this.now(), {
        graceMs: this.config.graceDays * 86_400_000
      })
    );
  }

  graceDeadlineIso(now) {
    const graceDays = Number(this.config.graceDays);
    return new Date(
      now + (Number.isFinite(graceDays) ? Math.max(0, graceDays) : 0) * 86_400_000
    ).toISOString();
  }

  mapPriceToInterval(priceId) {
    if (priceId === this.config.priceIds.month) return "month";
    if (priceId === this.config.priceIds.year) return "year";
    throw new HostedDomainError(
      "UNKNOWN_STRIPE_PRICE",
      "Subscription uses a price that is not configured for this service.",
      500
    );
  }
}

function classifyPermanentFailure(error) {
  if (!(error instanceof HostedDomainError)) return null;
  if (error.code === "UNKNOWN_BILLING_ACCOUNT" && error.details?.permanent !== true) return null;
  return PERMANENT_FAILURE_OUTCOMES[error.code] || null;
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

function getMetadataCheckoutAttemptId(object) {
  const attemptId = object?.metadata?.checkout_attempt_id;
  return typeof attemptId === "string" && attemptId.trim() ? attemptId.trim() : null;
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

function projectSubscriptionStatus(providerStatus, options = {}) {
  if (
    options.isDeleted ||
    providerStatus === "canceled" ||
    providerStatus === "incomplete_expired"
  ) {
    return "expired";
  }
  if (
    options.cancelAtPeriodEnd &&
    (providerStatus === "active" || providerStatus === "trialing")
  ) {
    return "canceled_at_period_end";
  }
  return providerStatus || "incomplete";
}

function isTerminalSubscriptionStatus(status) {
  return [
    "canceled",
    "expired",
    "incomplete_expired",
    "refunded",
    "revoked",
    "disputed"
  ].includes(String(status || "").toLowerCase());
}

function reconcilePaidInvoicePeriod(subscription, invoice, subscriptionId) {
  const candidate = getInvoiceSubscriptionPeriod(invoice, subscriptionId);
  if (!candidate) return false;

  const currentEnd = Date.parse(subscription.currentPeriodEnd || "");
  const candidateEnd = Date.parse(candidate.currentPeriodEnd);
  if (Number.isFinite(currentEnd) && candidateEnd <= currentEnd) return false;

  subscription.currentPeriodStart = candidate.currentPeriodStart;
  subscription.currentPeriodEnd = candidate.currentPeriodEnd;
  return true;
}

function getInvoiceSubscriptionPeriod(invoice, subscriptionId) {
  const candidates = [];
  addUnixPeriodCandidate(candidates, invoice?.period_start, invoice?.period_end);

  const lines = Array.isArray(invoice?.lines?.data) ? invoice.lines.data : [];
  for (const line of lines) {
    const lineSubscriptionId = getInvoiceLineSubscriptionId(line);
    if (lineSubscriptionId && lineSubscriptionId !== subscriptionId) continue;
    addUnixPeriodCandidate(candidates, line?.period?.start, line?.period?.end);
  }

  if (candidates.length === 0) return null;
  candidates.sort((left, right) => right.end - left.end);
  const selected = candidates[0];
  return {
    currentPeriodStart: new Date(selected.start * 1000).toISOString(),
    currentPeriodEnd: new Date(selected.end * 1000).toISOString()
  };
}

function addUnixPeriodCandidate(candidates, startValue, endValue) {
  const start = Number(startValue);
  const end = Number(endValue);
  if (
    Number.isFinite(start) &&
    start > 0 &&
    Number.isFinite(end) &&
    end > start
  ) {
    candidates.push({ start, end });
  }
}

function getInvoiceLineSubscriptionId(line) {
  const candidates = [
    line?.subscription,
    line?.parent?.subscription_item_details?.subscription,
    line?.parent?.subscription_details?.subscription,
    line?.metadata?.subscription_id
  ];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
    if (candidate && typeof candidate === "object" && typeof candidate.id === "string") {
      return candidate.id.trim();
    }
  }
  return null;
}

function subscriptionAnchorTimestamp(subscription) {
  const timestamp = Date.parse(
    subscription?.allowanceAnchorAt ||
    subscription?.effectiveStartAt ||
    subscription?.createdAt ||
    ""
  );
  return Number.isFinite(timestamp) ? timestamp : Number.POSITIVE_INFINITY;
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

function getChargeSubscriptionId(charge) {
  const candidates = [
    charge?.subscription,
    charge?.invoice?.subscription,
    charge?.invoice?.parent?.subscription_details?.subscription,
    charge?.metadata?.subscription_id
  ];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
    if (candidate && typeof candidate === "object" && typeof candidate.id === "string") {
      return candidate.id.trim();
    }
  }
  return null;
}

function getDisputeSubscriptionId(dispute) {
  const candidates = [
    dispute?.charge?.invoice?.subscription,
    dispute?.charge?.invoice?.parent?.subscription_details?.subscription,
    dispute?.charge?.subscription,
    dispute?.metadata?.subscription_id
  ];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
    if (candidate && typeof candidate === "object" && typeof candidate.id === "string") {
      return candidate.id.trim() || null;
    }
  }
  return null;
}

function resolveCheckoutAttempt(state, session, sessionId, accountId) {
  assertDomain(
    state.checkoutSessions instanceof Map &&
      state.checkoutAttempts instanceof Map &&
      state.activeCheckoutAccounts instanceof Map,
    "CHECKOUT_STORE_UNAVAILABLE",
    "The hosted Checkout association store is not configured.",
    500
  );
  const mappedAttemptId = state.checkoutSessions.get(sessionId) || null;
  const metadataAttemptId = getMetadataCheckoutAttemptId(session);
  assertDomain(
    mappedAttemptId || metadataAttemptId,
    "CHECKOUT_ATTEMPT_UNMATCHED",
    "Checkout session does not match a persisted Checkout attempt.",
    409
  );
  assertDomain(
    !mappedAttemptId || !metadataAttemptId || mappedAttemptId === metadataAttemptId,
    "CHECKOUT_ASSOCIATION_MISMATCH",
    "Checkout session associations do not match.",
    409
  );
  const attemptId = mappedAttemptId || metadataAttemptId;
  const attempt = state.checkoutAttempts.get(attemptId);
  assertDomain(
    attempt && attempt.accountId === accountId,
    "CHECKOUT_ASSOCIATION_MISMATCH",
    "Checkout session does not match the persisted account attempt.",
    409
  );
  assertDomain(
    !attempt.providerSessionId || attempt.providerSessionId === sessionId,
    "CHECKOUT_ASSOCIATION_MISMATCH",
    "Checkout session does not match the provider session on the persisted attempt.",
    409
  );
  const interval = String(session?.metadata?.interval || "").trim().toLowerCase();
  const priceId = String(session?.metadata?.price_id || "").trim();
  assertDomain(
    interval === attempt.interval &&
      priceId === attempt.providerPriceId,
    "CHECKOUT_ASSOCIATION_MISMATCH",
    "Checkout session does not match the persisted billing interval.",
    409
  );
  assertDomain(
    ["creating", "open", "completed"].includes(attempt.status),
    "CHECKOUT_ATTEMPT_STALE",
    "Checkout session references an attempt that is no longer pending.",
    409
  );
  return attempt;
}

function completeCheckoutAttempt(state, attempt, sessionId, now) {
  attempt.providerSessionId = sessionId;
  attempt.status = "completed";
  attempt.updatedAt = new Date(now).toISOString();
  state.checkoutSessions.set(sessionId, attempt.id);
  if (state.activeCheckoutAccounts.get(attempt.accountId) === attempt.id) {
    state.activeCheckoutAccounts.delete(attempt.accountId);
  }
}

function clearActiveCheckout(state, accountId, nowIso) {
  if (!(state.activeCheckoutAccounts instanceof Map)) return;
  const attemptId = state.activeCheckoutAccounts.get(accountId);
  const attempt = state.checkoutAttempts instanceof Map
    ? state.checkoutAttempts.get(attemptId)
    : null;
  if (attempt && attempt.status === "open") {
    attempt.status = "completed";
    attempt.updatedAt = nowIso;
  }
  state.activeCheckoutAccounts.delete(accountId);
}

module.exports = { BillingService, SUPPORTED_EVENT_TYPES };
