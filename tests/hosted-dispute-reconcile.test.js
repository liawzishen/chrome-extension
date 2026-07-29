const test = require("node:test");
const assert = require("node:assert/strict");

const { MemoryHostedStore } = require("../services/hosted-api/src/adapters/memory-store.js");
const { BillingService } = require("../services/hosted-api/src/domain/billing-service.js");
const { createSubscriptionReconciler } = require("../services/hosted-api/src/runtime/reconciler.js");
const { resolveEntitlement } = require("../services/hosted-api/src/domain/policy.js");

const NOW = Date.parse("2026-07-29T12:00:00.000Z");
const CONFIG = {
  graceDays: 3,
  refundRevokesAccess: false,
  priceIds: { month: "price_month", year: "price_year" }
};

async function seedPaidAccount(overrides = {}) {
  const store = new MemoryHostedStore();
  await store.createAccount({ id: "account_1", email: "learner@example.test", emailVerified: true });
  await store.transaction((state) => {
    state.subscriptions.set("account_1", {
      accountId: "account_1",
      stripeCustomerId: "cus_1",
      stripeSubscriptionId: "sub_1",
      stripePriceId: "price_month",
      plan: "student_pro",
      billingInterval: "month",
      status: "active",
      cancelAtPeriodEnd: false,
      currentPeriodStart: "2026-07-01T00:00:00.000Z",
      currentPeriodEnd: "2026-08-01T00:00:00.000Z",
      effectiveStartAt: "2026-07-01T00:00:00.000Z",
      allowanceAnchorAt: "2026-07-01T00:00:00.000Z",
      graceEndsAt: null,
      revokedAt: null,
      lastStripeEventCreated: 1_700_000_000,
      updatedAt: "2026-07-01T00:00:00.000Z",
      ...overrides
    });
    state.customerAccounts.set("cus_1", "account_1");
    state.subscriptionAccounts.set("sub_1", "account_1");
  });
  return store;
}

function billingService(store, extras = {}) {
  return new BillingService({ store, config: CONFIG, now: () => NOW, ...extras });
}

function disputeEvent(type, id, status, overrides = {}) {
  return {
    id,
    type,
    created: Math.floor(NOW / 1000),
    data: {
      object: {
        id: "dp_1",
        status,
        customer: "cus_1",
        charge: { id: "ch_1", invoice: { subscription: "sub_1" } },
        ...overrides
      }
    }
  };
}

async function entitlementFor(store) {
  return store.transaction((state) => resolveEntitlement(state.subscriptions.get("account_1"), NOW, {}));
}

test("an opened dispute revokes Pro even when refunds are configured not to", async () => {
  const store = await seedPaidAccount();
  const service = billingService(store);
  const before = await entitlementFor(store);
  assert.equal(before.plan, "student_pro");

  const result = await service.processVerifiedEvent(disputeEvent("charge.dispute.created", "evt_d1", "needs_response"));
  assert.equal(result.outcome, "entitlement_revoked_for_dispute");

  const after = await entitlementFor(store);
  assert.equal(after.plan, "free");
  assert.equal(after.status, "billing_revoked");
});

test("winning a dispute restores the access it revoked", async () => {
  const store = await seedPaidAccount();
  const service = billingService(store);
  await service.processVerifiedEvent(disputeEvent("charge.dispute.created", "evt_d1", "needs_response"));
  assert.equal((await entitlementFor(store)).plan, "free");

  const won = await service.processVerifiedEvent(disputeEvent("charge.dispute.closed", "evt_d2", "won"));
  assert.equal(won.outcome, "dispute_won_access_restored");
  const restored = await entitlementFor(store);
  assert.equal(restored.plan, "student_pro");
  assert.equal(restored.status, "active");
});

test("winning a dispute does not resurrect a subscription that was separately canceled", async () => {
  const store = await seedPaidAccount({ status: "canceled", revokedAt: "2026-07-10T00:00:00.000Z" });
  const service = billingService(store);

  const won = await service.processVerifiedEvent(disputeEvent("charge.dispute.closed", "evt_d3", "won"));
  assert.equal(won.outcome, "dispute_won_access_restored");
  const entitlement = await entitlementFor(store);
  assert.equal(entitlement.plan, "free", "a canceled subscription must stay canceled");
});

test("a dispute that cannot be tied to a subscription is retried, not silently accepted", async () => {
  const store = await seedPaidAccount();
  const service = billingService(store);
  const orphan = disputeEvent("charge.dispute.created", "evt_d4", "needs_response", { charge: "ch_unlinked" });

  await assert.rejects(
    service.processVerifiedEvent(orphan),
    (error) => error.code === "DISPUTE_RECONCILIATION_REQUIRED" && error.statusCode === 503
  );
  // Nothing may be recorded, or Stripe's retry would be answered as a duplicate.
  const recorded = await store.transaction((state) => state.processedBillingEvents.has("evt_d4"));
  assert.equal(recorded, false);
  assert.equal((await entitlementFor(store)).plan, "student_pro");
});

test("a duplicate dispute delivery is processed exactly once", async () => {
  const store = await seedPaidAccount();
  const service = billingService(store);
  const event = disputeEvent("charge.dispute.created", "evt_d5", "needs_response");

  assert.equal((await service.processVerifiedEvent(event)).duplicate, false);
  const replay = await service.processVerifiedEvent(event);
  assert.equal(replay.duplicate, true);
  assert.equal(replay.outcome, "already_processed");
});

test("reconciliation upgrades an account whose checkout webhook never arrived", async () => {
  const store = await seedPaidAccount({ status: "incomplete", currentPeriodEnd: null });
  const service = billingService(store);
  assert.equal((await entitlementFor(store)).plan, "free", "an incomplete subscription grants nothing");

  const reconciler = createSubscriptionReconciler({
    store,
    billingService: service,
    logger: { error() {} },
    billingAdapter: {
      retrieveSubscription: async (id) => ({
        id,
        customer: "cus_1",
        status: "active",
        cancel_at_period_end: false,
        start_date: Math.floor(Date.parse("2026-07-01T00:00:00.000Z") / 1000),
        current_period_start: Math.floor(Date.parse("2026-07-01T00:00:00.000Z") / 1000),
        current_period_end: Math.floor(Date.parse("2026-08-01T00:00:00.000Z") / 1000),
        items: { data: [{ price: { id: "price_month" } }] }
      })
    }
  });

  const summary = await reconciler.runOnce();
  assert.equal(summary.checked, 1);
  assert.equal(summary.reconciled, 1);
  assert.equal(summary.failed, 0);

  const entitlement = await entitlementFor(store);
  assert.equal(entitlement.plan, "student_pro");
  assert.equal(entitlement.status, "active");
});

test("one unreadable subscription does not abort the reconciliation pass", async () => {
  const store = await seedPaidAccount({ status: "past_due" });
  await store.createAccount({ id: "account_2" });
  await store.transaction((state) => {
    state.subscriptions.set("account_2", {
      accountId: "account_2",
      stripeCustomerId: "cus_2",
      stripeSubscriptionId: "sub_2",
      stripePriceId: "price_month",
      plan: "student_pro",
      billingInterval: "month",
      status: "past_due",
      cancelAtPeriodEnd: false,
      currentPeriodStart: "2026-07-01T00:00:00.000Z",
      currentPeriodEnd: "2026-08-01T00:00:00.000Z",
      effectiveStartAt: "2026-07-01T00:00:00.000Z",
      allowanceAnchorAt: "2026-07-01T00:00:00.000Z",
      graceEndsAt: null,
      revokedAt: null,
      lastStripeEventCreated: 1_700_000_000,
      updatedAt: "2026-07-01T00:00:00.000Z"
    });
    state.subscriptionAccounts.set("sub_2", "account_2");
    state.customerAccounts.set("cus_2", "account_2");
  });

  const reconciler = createSubscriptionReconciler({
    store,
    billingService: billingService(store),
    logger: { error() {} },
    billingAdapter: {
      retrieveSubscription: async (id) => {
        if (id === "sub_1") throw new Error("Stripe is unreachable for this one");
        return {
          id,
          customer: "cus_2",
          status: "active",
          cancel_at_period_end: false,
          start_date: Math.floor(Date.parse("2026-07-01T00:00:00.000Z") / 1000),
          current_period_start: Math.floor(Date.parse("2026-07-01T00:00:00.000Z") / 1000),
          current_period_end: Math.floor(Date.parse("2026-08-01T00:00:00.000Z") / 1000),
          items: { data: [{ price: { id: "price_month" } }] }
        };
      }
    }
  });

  const summary = await reconciler.runOnce();
  assert.equal(summary.checked, 2);
  assert.equal(summary.failed, 1);
  assert.equal(summary.reconciled, 1, "the healthy account must still be reconciled");

  const recovered = await store.transaction((state) => state.subscriptions.get("account_2").status);
  assert.equal(recovered, "active");
});

test("reconciliation is not recorded as a webhook delivery", async () => {
  const store = await seedPaidAccount({ status: "past_due" });
  const service = billingService(store);
  await service.reconcileSubscription({
    id: "sub_1",
    customer: "cus_1",
    status: "active",
    cancel_at_period_end: false,
    start_date: Math.floor(Date.parse("2026-07-01T00:00:00.000Z") / 1000),
    current_period_start: Math.floor(Date.parse("2026-07-01T00:00:00.000Z") / 1000),
    current_period_end: Math.floor(Date.parse("2026-08-01T00:00:00.000Z") / 1000),
    items: { data: [{ price: { id: "price_month" } }] }
  });

  const eventCount = await store.transaction((state) => state.processedBillingEvents.size);
  assert.equal(eventCount, 0, "a synthesized reconciliation must not consume an event id");
});
