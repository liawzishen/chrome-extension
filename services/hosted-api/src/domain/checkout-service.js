const { createHash, randomUUID } = require("crypto");
const { HostedDomainError, assertDomain } = require("./errors.js");

// Stripe retains idempotency results for at least 24 hours. Keep an ambiguous
// create locked for the same window so a different client key cannot create a
// second subscription session after a lost response.
const CREATING_LOCK_TTL_MS = 24 * 60 * 60_000;
const OPEN_SESSION_FALLBACK_TTL_MS = 24 * 60 * 60_000;
const TERMINAL_SUBSCRIPTION_STATUSES = new Set([
  "canceled",
  "expired",
  "incomplete_expired",
  "refunded",
  "revoked"
]);

class CheckoutService {
  constructor(options) {
    assertDomain(options?.store, "STORE_REQUIRED", "A hosted checkout store is required.", 500);
    assertDomain(
      typeof options?.billingAdapter?.createCheckoutSession === "function" &&
        typeof options?.billingAdapter?.retrieveCheckoutSession === "function",
      "BILLING_ADAPTER_REQUIRED",
      "A hosted billing adapter with Checkout recovery is required.",
      500
    );
    this.store = options.store;
    this.billingAdapter = options.billingAdapter;
    this.priceIds = Object.freeze({
      month: String(options?.priceIds?.month || "").trim(),
      year: String(options?.priceIds?.year || "").trim()
    });
    assertDomain(
      /^price_[A-Za-z0-9]+$/.test(this.priceIds.month) &&
        /^price_[A-Za-z0-9]+$/.test(this.priceIds.year),
      "CHECKOUT_PRICE_CATALOG_REQUIRED",
      "The approved Checkout Price catalog is required.",
      500
    );
    this.now = typeof options.now === "function" ? options.now : Date.now;
  }

  async createSession(input) {
    const account = input?.account;
    assertDomain(account?.id, "ACCOUNT_REQUIRED", "An authenticated account is required.", 401);
    const interval = normalizeInterval(input?.interval);
    const idempotencyKey = normalizeIdempotencyKey(input?.idempotencyKey);
    const requestDigest = digestCheckoutRequest(interval);
    const decision = await this.store.transaction((state) => {
      requireCheckoutState(state);
      const now = this.now();
      const storedAccount = state.accounts.get(account.id);
      assertDomain(storedAccount?.state === "active", "ACCOUNT_UNAVAILABLE", "The account is not active.", 403);
      const subscription = state.subscriptions.get(storedAccount.id);
      const subscriptionStatus = String(subscription?.status || "").toLowerCase();
      assertDomain(
        !subscription || TERMINAL_SUBSCRIPTION_STATUSES.has(subscriptionStatus),
        "SUBSCRIPTION_ALREADY_EXISTS",
        "This account already has a subscription. Use Manage billing instead.",
        409
      );
      expirePendingAttempt(state, account.id, now);
      const idempotencyIndex = `${account.id}:${idempotencyKey}`;
      const existingId = state.checkoutIdempotency.get(idempotencyIndex);
      const existing = existingId ? state.checkoutAttempts.get(existingId) : null;

      if (existing) {
        assertDomain(
          existing.requestDigest === requestDigest,
          "IDEMPOTENCY_CONFLICT",
          "The idempotency key was already used for a different Checkout request.",
          409
        );
        if (existing.status === "open" && existing.providerSessionId) {
          return {
            kind: "retrieve",
            account: structuredClone(storedAccount),
            attempt: structuredClone(existing)
          };
        }
        if (existing.status === "creating" || existing.status === "failed") {
          existing.status = "creating";
          existing.lockExpiresAt = new Date(now + CREATING_LOCK_TTL_MS).toISOString();
          existing.updatedAt = new Date(now).toISOString();
          state.activeCheckoutAccounts.set(account.id, existing.id);
          return {
            kind: "create",
            account: structuredClone(storedAccount),
            attempt: structuredClone(existing)
          };
        }
        throw new HostedDomainError(
          "CHECKOUT_IDEMPOTENCY_FINALIZED",
          "This Checkout request is already finalized. Start a new request if another purchase is needed.",
          409
        );
      }

      const activeId = state.activeCheckoutAccounts.get(account.id);
      const active = activeId ? state.checkoutAttempts.get(activeId) : null;
      if (active?.status === "open" && active.providerSessionId) {
        assertDomain(
          active.interval === interval,
          "CHECKOUT_ALREADY_PENDING",
          "A Checkout session for another billing interval is already open.",
          409
        );
        return {
          kind: "retrieve",
          account: structuredClone(storedAccount),
          attempt: structuredClone(active)
        };
      }
      assertDomain(
        !active || active.status !== "creating",
        "CHECKOUT_ALREADY_PENDING",
        "A Checkout session is already being created for this account.",
        409
      );

      const nowIso = new Date(now).toISOString();
      const attempt = {
        id: randomUUID(),
        accountId: account.id,
        idempotencyKey,
        requestDigest,
        interval,
        providerPriceId: this.priceIds[interval],
        providerIdempotencyKey: providerIdempotencyKey(account.id, idempotencyKey),
        providerSessionId: null,
        status: "creating",
        lockExpiresAt: new Date(now + CREATING_LOCK_TTL_MS).toISOString(),
        expiresAt: null,
        createdAt: nowIso,
        updatedAt: nowIso
      };
      state.checkoutAttempts.set(attempt.id, attempt);
      state.checkoutIdempotency.set(idempotencyIndex, attempt.id);
      state.activeCheckoutAccounts.set(account.id, attempt.id);
      return {
        kind: "create",
        account: structuredClone(storedAccount),
        attempt: structuredClone(attempt)
      };
    });

    if (decision.kind === "retrieve") {
      return this.recoverOpenSession(decision.attempt);
    }
    return this.createProviderSession(decision.account, decision.attempt);
  }

  async createProviderSession(account, attempt) {
    // Leave the attempt in "creating" on any ambiguous provider/network failure.
    // A retry with the same client key reuses the deterministic Stripe key, while
    // a different key stays blocked for the provider idempotency window.
    const session = await this.billingAdapter.createCheckoutSession({
      account,
      attemptId: attempt.id,
      interval: attempt.interval,
      idempotencyKey: attempt.providerIdempotencyKey
    });
    const normalized = normalizeProviderSession(session, this.now());
    await this.store.transaction((state) => {
      requireCheckoutState(state);
      const current = state.checkoutAttempts.get(attempt.id);
      if (!current) return;
      assertDomain(
        !current.providerSessionId || current.providerSessionId === normalized.id,
        "CHECKOUT_SESSION_MISMATCH",
        "Stripe returned a different Checkout session for this persisted attempt.",
        409
      );
      current.providerSessionId = normalized.id;
      state.checkoutSessions.set(normalized.id, current.id);
      // A signed webhook can complete the persisted attempt while Stripe's
      // create-session response is still in flight. Never let that older open
      // response move the terminal state backwards.
      if (current.status === "completed") {
        if (state.activeCheckoutAccounts.get(current.accountId) === current.id) {
          state.activeCheckoutAccounts.delete(current.accountId);
        }
        return;
      }
      current.status = normalized.status === "complete" ? "completed" : "open";
      current.expiresAt = normalized.expiresAt;
      current.updatedAt = new Date(this.now()).toISOString();
      if (
        current.status !== "open" &&
        state.activeCheckoutAccounts.get(current.accountId) === current.id
      ) {
        state.activeCheckoutAccounts.delete(current.accountId);
      }
    });
    return { ...normalized, idempotentReplay: false };
  }

  async recoverOpenSession(attempt) {
    const session = normalizeProviderSession(
      await this.billingAdapter.retrieveCheckoutSession({
        sessionId: attempt.providerSessionId
      }),
      this.now()
    );
    if (session.status === "open") {
      return { ...session, idempotentReplay: true };
    }
    await this.store.transaction((state) => {
      requireCheckoutState(state);
      const current = state.checkoutAttempts.get(attempt.id);
      if (!current) return;
      current.status = session.status === "complete" ? "completed" : "expired";
      current.updatedAt = new Date(this.now()).toISOString();
      if (state.activeCheckoutAccounts.get(current.accountId) === current.id) {
        state.activeCheckoutAccounts.delete(current.accountId);
      }
    });
    throw new HostedDomainError(
      session.status === "complete" ? "CHECKOUT_ALREADY_COMPLETED" : "CHECKOUT_SESSION_EXPIRED",
      session.status === "complete"
        ? "This Checkout session is already complete."
        : "The previous Checkout session expired. Start a new Checkout request.",
      409
    );
  }
}

function requireCheckoutState(state) {
  assertDomain(
    state.checkoutAttempts instanceof Map &&
      state.checkoutIdempotency instanceof Map &&
      state.activeCheckoutAccounts instanceof Map &&
      state.checkoutSessions instanceof Map,
    "CHECKOUT_STORE_UNAVAILABLE",
    "The hosted checkout store is not configured.",
    500
  );
}

function expirePendingAttempt(state, accountId, now) {
  const activeId = state.activeCheckoutAccounts.get(accountId);
  const active = activeId ? state.checkoutAttempts.get(activeId) : null;
  if (!active) {
    state.activeCheckoutAccounts.delete(accountId);
    return;
  }
  const deadline = Date.parse(
    active.status === "creating" ? active.lockExpiresAt : active.expiresAt
  );
  if (!Number.isFinite(deadline) || deadline > now) return;
  active.status = "expired";
  active.updatedAt = new Date(now).toISOString();
  state.activeCheckoutAccounts.delete(accountId);
}

function normalizeProviderSession(session, now) {
  const id = String(session?.id || "").trim();
  const url = String(session?.url || "").trim();
  const status = String(session?.status || "open").toLowerCase();
  assertDomain(/^cs_[A-Za-z0-9_]+$/.test(id), "STRIPE_CHECKOUT_INVALID", "Stripe returned an invalid Checkout session.", 502);
  assertDomain(["open", "complete", "expired"].includes(status), "STRIPE_CHECKOUT_INVALID", "Stripe returned an invalid Checkout status.", 502);
  if (status === "open") {
    assertDomain(/^https:\/\/checkout\.stripe\.com\//.test(url), "STRIPE_CHECKOUT_INVALID", "Stripe returned an invalid hosted Checkout URL.", 502);
  }
  const parsedExpiry = Date.parse(session?.expiresAt || "");
  return {
    id,
    url: status === "open" ? url : "",
    status,
    expiresAt: new Date(
      Number.isFinite(parsedExpiry) ? parsedExpiry : now + OPEN_SESSION_FALLBACK_TTL_MS
    ).toISOString()
  };
}

function normalizeInterval(value) {
  const interval = String(value || "").trim().toLowerCase();
  assertDomain(["month", "year"].includes(interval), "BILLING_INTERVAL_INVALID", "Billing interval must be month or year.", 400);
  return interval;
}

function normalizeIdempotencyKey(value) {
  const key = String(value || "").trim();
  assertDomain(/^[a-zA-Z0-9._:-]{16,160}$/.test(key), "IDEMPOTENCY_REQUIRED", "A valid Idempotency-Key is required.", 400);
  return key;
}

function digestCheckoutRequest(interval) {
  return createHash("sha256").update(`student_pro:${interval}`).digest("hex");
}

function providerIdempotencyKey(accountId, clientKey) {
  const digest = createHash("sha256")
    .update(`${accountId}\u0000${clientKey}`)
    .digest("hex");
  return `checkout:${digest}`;
}

module.exports = {
  CheckoutService,
  digestCheckoutRequest,
  providerIdempotencyKey
};
