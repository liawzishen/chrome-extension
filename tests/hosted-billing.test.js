const test = require("node:test");
const assert = require("node:assert/strict");

const {
  MemoryHostedStore
} = require("../services/hosted-api/src/adapters/memory-store.js");
const {
  BillingService
} = require("../services/hosted-api/src/domain/billing-service.js");
const {
  UsageService
} = require("../services/hosted-api/src/domain/usage-service.js");

const NOW = Date.parse("2026-07-28T00:00:00.000Z");
const NOW_SECONDS = Math.floor(NOW / 1000);
const DAY_MS = 86_400_000;

function billingConfig(overrides = {}) {
  return {
    graceDays: 3,
    refundRevokesAccess: true,
    priceIds: {
      month: "price_monthly123",
      year: "price_annual123",
      foundingYear: ""
    },
    ...overrides
  };
}

function stripeEvent(id, type, created, object) {
  return {
    id,
    type,
    created,
    data: { object }
  };
}

function checkoutSession(overrides = {}) {
  return {
    id: "cs_test_unit123",
    client_reference_id: "account-123",
    customer: "cus_unit123",
    subscription: "sub_unit123",
    metadata: {
      account_id: "account-123"
    },
    ...overrides
  };
}

function subscriptionObject(overrides = {}) {
  return {
    id: "sub_unit123",
    customer: "cus_unit123",
    status: "active",
    start_date: NOW_SECONDS - 10 * 60,
    current_period_start: NOW_SECONDS - 10 * 60,
    current_period_end: NOW_SECONDS + 30 * 24 * 60 * 60,
    cancel_at_period_end: false,
    metadata: {
      account_id: "account-123"
    },
    items: {
      data: [{
        price: {
          id: "price_monthly123"
        }
      }]
    },
    ...overrides
  };
}

async function createBillingFixture(configOverrides = {}) {
  let clock = NOW;
  const store = new MemoryHostedStore();
  await store.createAccount({
    id: "account-123",
    email: "student@example.test",
    emailVerified: true,
    createdAt: new Date(NOW - DAY_MS).toISOString()
  });
  const config = billingConfig(configOverrides);
  const billing = new BillingService({
    store,
    config,
    now: () => clock
  });
  return {
    billing,
    config,
    get clock() {
      return clock;
    },
    set clock(value) {
      clock = value;
    },
    store
  };
}

async function linkAndActivate(fixture, eventCreated = NOW_SECONDS) {
  await fixture.billing.processVerifiedEvent(stripeEvent(
    "evt_checkout123",
    "checkout.session.completed",
    eventCreated - 1,
    checkoutSession()
  ));
  return fixture.billing.processVerifiedEvent(stripeEvent(
    "evt_subscription123",
    "customer.subscription.created",
    eventCreated,
    subscriptionObject()
  ));
}

test("verified Stripe events are applied once and duplicate IDs cannot relink an account", async () => {
  const fixture = await createBillingFixture();
  const event = stripeEvent(
    "evt_checkout123",
    "checkout.session.completed",
    NOW_SECONDS,
    checkoutSession()
  );

  const first = await fixture.billing.processVerifiedEvent(event);
  const duplicate = await fixture.billing.processVerifiedEvent(stripeEvent(
    "evt_checkout123",
    "checkout.session.completed",
    NOW_SECONDS + 1,
    checkoutSession({
      customer: "cus_attacker123",
      subscription: "sub_attacker123"
    })
  ));

  assert.deepEqual(first, {
    duplicate: false,
    outcome: "checkout_linked"
  });
  assert.deepEqual(duplicate, {
    duplicate: true,
    outcome: "already_processed"
  });
  assert.equal(fixture.store.state.accounts.get("account-123").stripeCustomerId, "cus_unit123");
  assert.equal(fixture.store.state.customerAccounts.get("cus_unit123"), "account-123");
  assert.equal(fixture.store.state.customerAccounts.has("cus_attacker123"), false);
  assert.equal(fixture.store.state.processedBillingEvents.size, 1);
  assert.equal(fixture.store.state.billingReceipts.size, 1);
});

test("older subscription and invoice events are recorded but cannot overwrite newer state", async () => {
  const fixture = await createBillingFixture();
  await fixture.billing.processVerifiedEvent(stripeEvent(
    "evt_checkout123",
    "checkout.session.completed",
    NOW_SECONDS - 20,
    checkoutSession()
  ));
  await fixture.billing.processVerifiedEvent(stripeEvent(
    "evt_subscription_newer",
    "customer.subscription.updated",
    NOW_SECONDS + 20,
    subscriptionObject({
      status: "active",
      cancel_at_period_end: true
    })
  ));

  const staleSubscription = await fixture.billing.processVerifiedEvent(stripeEvent(
    "evt_subscription_older",
    "customer.subscription.updated",
    NOW_SECONDS + 10,
    subscriptionObject({
      status: "past_due",
      cancel_at_period_end: false
    })
  ));
  const staleInvoice = await fixture.billing.processVerifiedEvent(stripeEvent(
    "evt_invoice_older",
    "invoice.payment_failed",
    NOW_SECONDS + 15,
    {
      id: "in_older123",
      customer: "cus_unit123",
      subscription: "sub_unit123"
    }
  ));

  assert.deepEqual(staleSubscription, {
    duplicate: false,
    outcome: "stale_subscription_event"
  });
  assert.deepEqual(staleInvoice, {
    duplicate: false,
    outcome: "stale_invoice_event"
  });
  const subscription = fixture.store.state.subscriptions.get("account-123");
  assert.equal(subscription.status, "active");
  assert.equal(subscription.cancelAtPeriodEnd, true);
  assert.equal(subscription.graceEndsAt, null);
  assert.equal(subscription.lastStripeEventCreated, NOW_SECONDS + 20);
  assert.equal(fixture.store.state.entitlements.get("account-123").plan, "student_pro");
  assert.equal(fixture.store.state.processedBillingEvents.has("evt_subscription_older"), true);
  assert.equal(fixture.store.state.processedBillingEvents.has("evt_invoice_older"), true);
});

test("failed payment grants a dated grace period and a later payment restores Pro", async () => {
  const fixture = await createBillingFixture({ graceDays: 3 });
  await linkAndActivate(fixture, NOW_SECONDS);

  const failed = await fixture.billing.processVerifiedEvent(stripeEvent(
    "evt_invoice_failed123",
    "invoice.payment_failed",
    NOW_SECONDS + 1,
    {
      id: "in_failed123",
      customer: "cus_unit123",
      subscription: "sub_unit123"
    }
  ));

  assert.deepEqual(failed, {
    duplicate: false,
    outcome: "payment_grace_started"
  });
  let subscription = fixture.store.state.subscriptions.get("account-123");
  assert.equal(subscription.status, "past_due");
  assert.equal(subscription.graceEndsAt, "2026-07-31T00:00:00.000Z");
  assert.deepEqual(fixture.store.state.entitlements.get("account-123"), {
    plan: "student_pro",
    policyVersion: "student-pro.v1",
    status: "grace",
    effectiveStart: "2026-07-28T00:00:00.000Z",
    effectiveEnd: "2026-07-31T00:00:00.000Z",
    cancelAtPeriodEnd: false,
    source: "subscription"
  });

  const usage = new UsageService({
    store: fixture.store,
    now: () => fixture.clock,
    graceMs: 3 * DAY_MS
  });
  assert.equal((await usage.getEntitlement("account-123")).plan, "student_pro");
  fixture.clock = NOW + 3 * DAY_MS;
  const expiredGrace = await usage.getEntitlement("account-123");
  assert.equal(expiredGrace.plan, "free");
  assert.equal(expiredGrace.status, "past_due");

  const paid = await fixture.billing.processVerifiedEvent(stripeEvent(
    "evt_invoice_paid123",
    "invoice.paid",
    NOW_SECONDS + 2,
    {
      id: "in_paid123",
      customer: "cus_unit123",
      subscription: "sub_unit123"
    }
  ));
  assert.deepEqual(paid, {
    duplicate: false,
    outcome: "payment_restored"
  });
  subscription = fixture.store.state.subscriptions.get("account-123");
  assert.equal(subscription.status, "active");
  assert.equal(subscription.graceEndsAt, null);
  assert.equal((await usage.getEntitlement("account-123")).plan, "student_pro");
});

test("only a full refund revokes access when the configured policy requires it", async () => {
  const fixture = await createBillingFixture({
    refundRevokesAccess: true
  });
  await linkAndActivate(fixture, NOW_SECONDS);

  const partial = await fixture.billing.processVerifiedEvent(stripeEvent(
    "evt_refund_partial123",
    "charge.refunded",
    NOW_SECONDS + 1,
    {
      id: "ch_partial123",
      customer: "cus_unit123",
      amount: 499,
      amount_refunded: 100,
      refunded: false
    }
  ));
  assert.deepEqual(partial, {
    duplicate: false,
    outcome: "refund_recorded"
  });
  assert.equal(fixture.store.state.subscriptions.get("account-123").status, "active");
  assert.equal(fixture.store.state.entitlements.get("account-123").plan, "student_pro");

  const full = await fixture.billing.processVerifiedEvent(stripeEvent(
    "evt_refund_full123",
    "charge.refunded",
    NOW_SECONDS + 2,
    {
      id: "ch_full123",
      customer: "cus_unit123",
      amount: 499,
      amount_refunded: 499,
      refunded: true
    }
  ));
  assert.deepEqual(full, {
    duplicate: false,
    outcome: "entitlement_revoked"
  });
  const subscription = fixture.store.state.subscriptions.get("account-123");
  assert.equal(subscription.status, "revoked");
  assert.equal(subscription.revokedAt, "2026-07-28T00:00:00.000Z");
  assert.equal(subscription.graceEndsAt, null);
  assert.equal(fixture.store.state.entitlements.get("account-123").plan, "free");
  assert.equal(fixture.store.state.entitlements.get("account-123").status, "billing_revoked");
});

test("refund events remain non-revoking when that policy is explicitly disabled", async () => {
  const fixture = await createBillingFixture({
    refundRevokesAccess: false
  });
  await linkAndActivate(fixture, NOW_SECONDS);

  const result = await fixture.billing.processVerifiedEvent(stripeEvent(
    "evt_refund_policy123",
    "charge.refunded",
    NOW_SECONDS + 1,
    {
      id: "ch_policy123",
      customer: "cus_unit123",
      amount: 499,
      amount_refunded: 499,
      refunded: true
    }
  ));

  assert.deepEqual(result, {
    duplicate: false,
    outcome: "refund_recorded"
  });
  assert.equal(fixture.store.state.subscriptions.get("account-123").status, "active");
  assert.equal(fixture.store.state.entitlements.get("account-123").plan, "student_pro");
});

test("a late invoice cannot revive revoked access, while a new subscription can", async () => {
  const fixture = await createBillingFixture({
    refundRevokesAccess: true
  });
  await linkAndActivate(fixture, NOW_SECONDS);
  await fixture.billing.processVerifiedEvent(stripeEvent(
    "evt_refund_terminal123",
    "charge.refunded",
    NOW_SECONDS + 1,
    {
      id: "ch_terminal123",
      customer: "cus_unit123",
      amount: 499,
      amount_refunded: 499,
      refunded: true
    }
  ));

  const lateInvoice = await fixture.billing.processVerifiedEvent(stripeEvent(
    "evt_invoice_after_refund123",
    "invoice.paid",
    NOW_SECONDS + 2,
    {
      id: "in_after_refund123",
      customer: "cus_unit123",
      subscription: "sub_unit123"
    }
  ));
  assert.equal(lateInvoice.outcome, "terminal_subscription_unchanged");
  assert.equal(fixture.store.state.entitlements.get("account-123").plan, "free");
  assert.equal(fixture.store.state.subscriptions.get("account-123").status, "revoked");

  const resubscribed = await fixture.billing.processVerifiedEvent(stripeEvent(
    "evt_resubscribe123",
    "customer.subscription.created",
    NOW_SECONDS + 3,
    subscriptionObject({
      id: "sub_replacement123",
      start_date: NOW_SECONDS + 3,
      current_period_start: NOW_SECONDS + 3,
      current_period_end: NOW_SECONDS + 30 * 24 * 60 * 60
    })
  ));
  assert.equal(resubscribed.outcome, "subscription_projected");
  assert.equal(fixture.store.state.subscriptions.get("account-123").stripeSubscriptionId, "sub_replacement123");
  assert.equal(fixture.store.state.subscriptions.get("account-123").revokedAt, null);
  assert.equal(fixture.store.state.entitlements.get("account-123").plan, "student_pro");
});
