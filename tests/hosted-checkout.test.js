const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");

const { MemoryHostedStore } = require("../services/hosted-api/src/adapters/memory-store.js");
const { BillingService } = require("../services/hosted-api/src/domain/billing-service.js");
const { CheckoutService } = require("../services/hosted-api/src/domain/checkout-service.js");

const NOW = Date.parse("2026-07-28T12:00:00.000Z");
const MIGRATION = readFileSync(
  path.resolve(__dirname, "../services/hosted-api/migrations/001_initial.sql"),
  "utf8"
);

async function createFixture(overrides = {}) {
  let clock = NOW;
  const store = new MemoryHostedStore();
  const account = await store.createAccount({
    id: "account_checkout",
    email: "checkout@example.test",
    emailVerified: true,
    createdAt: new Date(NOW).toISOString()
  });
  const calls = { create: [], retrieve: [] };
  const sessions = new Map();
  const billingAdapter = {
    async createCheckoutSession(input) {
      calls.create.push(input);
      if (overrides.createCheckoutSession) {
        return overrides.createCheckoutSession(input, calls, sessions);
      }
      const session = {
        id: "cs_test_coordinated",
        url: "https://checkout.stripe.com/c/pay/cs_test_coordinated",
        status: "open",
        expiresAt: "2026-07-29T12:00:00.000Z"
      };
      sessions.set(session.id, session);
      return session;
    },
    async retrieveCheckoutSession(input) {
      calls.retrieve.push(input);
      if (overrides.retrieveCheckoutSession) {
        return overrides.retrieveCheckoutSession(input, calls, sessions);
      }
      return sessions.get(input.sessionId);
    }
  };
  const checkout = new CheckoutService({
    store,
    billingAdapter,
    now: () => clock,
    priceIds: {
      month: "price_monthly",
      year: "price_annual"
    }
  });
  return {
    account,
    billingAdapter,
    calls,
    checkout,
    sessions,
    setClock(value) {
      clock = value;
    },
    store
  };
}

function checkoutInput(account, overrides = {}) {
  return {
    account,
    interval: "month",
    idempotencyKey: "checkout-client-key-0001",
    ...overrides
  };
}

function createBilling(store) {
  return new BillingService({
    store,
    config: {
      graceDays: 0,
      refundRevokesAccess: false,
      priceIds: { month: "price_monthly", year: "price_annual" }
    },
    now: () => NOW,
    logger: { error() {} }
  });
}

test("Checkout retries recover one provider session and never trust the client key at Stripe", async () => {
  const fixture = await createFixture();
  const first = await fixture.checkout.createSession(checkoutInput(fixture.account));
  const replay = await fixture.checkout.createSession(checkoutInput(fixture.account));

  assert.equal(first.id, "cs_test_coordinated");
  assert.equal(first.idempotentReplay, false);
  assert.equal(replay.id, first.id);
  assert.equal(replay.idempotentReplay, true);
  assert.equal(fixture.calls.create.length, 1);
  assert.equal(fixture.calls.retrieve.length, 1);
  const attempt = [...fixture.store.state.checkoutAttempts.values()][0];
  assert.equal(fixture.calls.create[0].attemptId, attempt.id);
  assert.match(fixture.calls.create[0].idempotencyKey, /^checkout:[a-f0-9]{64}$/);
  assert.notEqual(
    fixture.calls.create[0].idempotencyKey,
    checkoutInput(fixture.account).idempotencyKey
  );
});

test("a second client key reuses the same open interval and cannot open another interval", async () => {
  const fixture = await createFixture();
  await fixture.checkout.createSession(checkoutInput(fixture.account));

  const sameInterval = await fixture.checkout.createSession(checkoutInput(fixture.account, {
    idempotencyKey: "checkout-client-key-0002"
  }));
  assert.equal(sameInterval.idempotentReplay, true);
  assert.equal(fixture.calls.create.length, 1);
  assert.equal(fixture.calls.retrieve.length, 1);

  await assert.rejects(
    fixture.checkout.createSession(checkoutInput(fixture.account, {
      interval: "year",
      idempotencyKey: "checkout-client-key-0003"
    })),
    (error) => error?.code === "CHECKOUT_ALREADY_PENDING"
  );
  assert.equal(fixture.calls.create.length, 1);
});

test("concurrent different keys cannot create two Checkout sessions", async () => {
  let releaseProvider;
  let providerStarted;
  const started = new Promise((resolve) => {
    providerStarted = resolve;
  });
  const providerGate = new Promise((resolve) => {
    releaseProvider = resolve;
  });
  const fixture = await createFixture({
    async createCheckoutSession(input, calls, sessions) {
      providerStarted();
      await providerGate;
      const session = {
        id: "cs_test_concurrent",
        url: "https://checkout.stripe.com/c/pay/cs_test_concurrent",
        status: "open",
        expiresAt: "2026-07-29T12:00:00.000Z"
      };
      sessions.set(session.id, session);
      return session;
    }
  });

  const first = fixture.checkout.createSession(checkoutInput(fixture.account));
  await started;
  await assert.rejects(
    fixture.checkout.createSession(checkoutInput(fixture.account, {
      idempotencyKey: "checkout-client-key-0004"
    })),
    (error) => error?.code === "CHECKOUT_ALREADY_PENDING"
  );
  releaseProvider();
  await first;
  assert.equal(fixture.calls.create.length, 1);
});

test("an ambiguous provider failure remains locked but the same key can recover safely", async () => {
  let attempts = 0;
  const fixture = await createFixture({
    async createCheckoutSession(input, calls, sessions) {
      attempts += 1;
      if (attempts === 1) throw new Error("network response lost");
      const session = {
        id: "cs_test_recovered",
        url: "https://checkout.stripe.com/c/pay/cs_test_recovered",
        status: "open",
        expiresAt: "2026-07-29T12:00:00.000Z"
      };
      sessions.set(session.id, session);
      return session;
    }
  });
  await assert.rejects(
    fixture.checkout.createSession(checkoutInput(fixture.account)),
    /network response lost/
  );
  await assert.rejects(
    fixture.checkout.createSession(checkoutInput(fixture.account, {
      idempotencyKey: "checkout-client-key-0005"
    })),
    (error) => error?.code === "CHECKOUT_ALREADY_PENDING"
  );

  const recovered = await fixture.checkout.createSession(checkoutInput(fixture.account));
  assert.equal(recovered.id, "cs_test_recovered");
  assert.equal(fixture.calls.create.length, 2);
  assert.equal(
    fixture.calls.create[0].idempotencyKey,
    fixture.calls.create[1].idempotencyKey
  );
});

test("a verified Checkout webhook completes the pending attempt", async () => {
  const fixture = await createFixture();
  await fixture.checkout.createSession(checkoutInput(fixture.account));
  const pendingAttempt = [...fixture.store.state.checkoutAttempts.values()][0];
  const billing = createBilling(fixture.store);
  await billing.processVerifiedEvent({
    id: "evt_checkout_completed",
    type: "checkout.session.completed",
    created: Math.floor(NOW / 1000),
    data: {
      object: {
        id: "cs_test_coordinated",
        client_reference_id: fixture.account.id,
        customer: "cus_checkout",
        subscription: "sub_checkout",
        metadata: {
          account_id: fixture.account.id,
          checkout_attempt_id: pendingAttempt.id,
          interval: pendingAttempt.interval,
          price_id: pendingAttempt.providerPriceId
        }
      }
    }
  });

  assert.equal(pendingAttempt.status, "completed");
  assert.equal(fixture.store.state.activeCheckoutAccounts.has(fixture.account.id), false);
});

test("an unmatched completed session cannot link billing or clear the real pending attempt", async () => {
  const fixture = await createFixture();
  await fixture.checkout.createSession(checkoutInput(fixture.account));
  const pendingAttempt = [...fixture.store.state.checkoutAttempts.values()][0];
  const billing = createBilling(fixture.store);
  const event = {
    id: "evt_checkout_unmatched",
    type: "checkout.session.completed",
    created: Math.floor(NOW / 1000),
    data: {
      object: {
        id: "cs_test_unmatched",
        client_reference_id: fixture.account.id,
        customer: "cus_unmatched",
        subscription: "sub_unmatched",
        metadata: {
          account_id: fixture.account.id,
          interval: "month",
          price_id: pendingAttempt.providerPriceId
        }
      }
    }
  };

  await assert.rejects(
    billing.processVerifiedEvent(event),
    (error) => error?.code === "CHECKOUT_ATTEMPT_UNMATCHED"
  );
  assert.equal(pendingAttempt.status, "open");
  assert.equal(
    fixture.store.state.activeCheckoutAccounts.get(fixture.account.id),
    pendingAttempt.id
  );
  assert.equal(fixture.store.state.accounts.get(fixture.account.id).stripeCustomerId, null);
  assert.equal(fixture.store.state.customerAccounts.has("cus_unmatched"), false);
  assert.equal(fixture.store.state.subscriptionAccounts.has("sub_unmatched"), false);
  assert.equal(fixture.store.state.processedBillingEvents.has(event.id), false);
});

test("a stale completed session cannot clear a newer pending attempt", async () => {
  const fixture = await createFixture();
  await fixture.checkout.createSession(checkoutInput(fixture.account));
  const pendingAttempt = [...fixture.store.state.checkoutAttempts.values()][0];
  const staleAttempt = {
    ...structuredClone(pendingAttempt),
    id: "checkout-attempt-stale",
    idempotencyKey: "checkout-client-key-stale",
    providerSessionId: "cs_test_stale",
    status: "expired"
  };
  await fixture.store.transaction((state) => {
    state.checkoutAttempts.set(staleAttempt.id, staleAttempt);
    state.checkoutSessions.set(staleAttempt.providerSessionId, staleAttempt.id);
  });
  const billing = createBilling(fixture.store);
  const event = {
    id: "evt_checkout_stale",
    type: "checkout.session.completed",
    created: Math.floor(NOW / 1000),
    data: {
      object: {
        id: staleAttempt.providerSessionId,
        client_reference_id: fixture.account.id,
        customer: "cus_stale",
        subscription: "sub_stale",
        metadata: {
          account_id: fixture.account.id,
          checkout_attempt_id: staleAttempt.id,
          interval: staleAttempt.interval,
          price_id: staleAttempt.providerPriceId
        }
      }
    }
  };

  await assert.rejects(
    billing.processVerifiedEvent(event),
    (error) => error?.code === "CHECKOUT_ATTEMPT_STALE"
  );
  assert.equal(staleAttempt.status, "expired");
  assert.equal(pendingAttempt.status, "open");
  assert.equal(
    fixture.store.state.activeCheckoutAccounts.get(fixture.account.id),
    pendingAttempt.id
  );
  assert.equal(fixture.store.state.accounts.get(fixture.account.id).stripeCustomerId, null);
  assert.equal(fixture.store.state.customerAccounts.has("cus_stale"), false);
  assert.equal(fixture.store.state.processedBillingEvents.has(event.id), false);
});

test("a create-session response cannot regress a webhook-completed attempt to open", async () => {
  let billing;
  const fixture = await createFixture({
    async createCheckoutSession(input, calls, sessions) {
      const session = {
        id: "cs_test_webhook_race",
        url: "https://checkout.stripe.com/c/pay/cs_test_webhook_race",
        status: "open",
        expiresAt: "2026-07-29T12:00:00.000Z"
      };
      await billing.processVerifiedEvent({
        id: "evt_checkout_webhook_race",
        type: "checkout.session.completed",
        created: Math.floor(NOW / 1000),
        data: {
          object: {
            id: session.id,
            client_reference_id: fixture.account.id,
            customer: "cus_webhook_race",
            subscription: "sub_webhook_race",
            metadata: {
              account_id: fixture.account.id,
              checkout_attempt_id: input.attemptId,
              interval: input.interval,
              price_id: "price_monthly"
            }
          }
        }
      });
      sessions.set(session.id, session);
      return session;
    }
  });
  billing = createBilling(fixture.store);

  const response = await fixture.checkout.createSession(checkoutInput(fixture.account));
  const attempt = [...fixture.store.state.checkoutAttempts.values()][0];

  assert.equal(response.id, "cs_test_webhook_race");
  assert.equal(attempt.status, "completed");
  assert.equal(attempt.providerSessionId, response.id);
  assert.equal(fixture.store.state.checkoutSessions.get(response.id), attempt.id);
  assert.equal(fixture.store.state.activeCheckoutAccounts.has(fixture.account.id), false);
  assert.equal(
    fixture.store.state.accounts.get(fixture.account.id).stripeCustomerId,
    "cus_webhook_race"
  );
});

test("a nonterminal existing subscription must be repaired in the Portal, not duplicated", async () => {
  const fixture = await createFixture();
  await fixture.store.transaction((state) => {
    state.subscriptions.set(fixture.account.id, {
      accountId: fixture.account.id,
      stripeSubscriptionId: "sub_existing",
      status: "past_due"
    });
  });

  await assert.rejects(
    fixture.checkout.createSession(checkoutInput(fixture.account)),
    (error) => error?.code === "SUBSCRIPTION_ALREADY_EXISTS"
  );
  assert.equal(fixture.calls.create.length, 0);
});

test("the PostgreSQL contract prevents concurrent Checkout while permitting failed usage retries", () => {
  assert.match(
    MIGRATION,
    /CREATE UNIQUE INDEX billing_checkout_attempts_one_pending_per_account_idx[\s\S]*?WHERE status IN \('creating', 'open'\);/
  );
  assert.match(
    MIGRATION,
    /CREATE UNIQUE INDEX usage_operations_live_idempotency_unique_idx[\s\S]*?WHERE state IN \('reserved', 'committed'\);/
  );
  assert.doesNotMatch(
    MIGRATION,
    /CONSTRAINT usage_operations_account_idempotency_unique/
  );
});
