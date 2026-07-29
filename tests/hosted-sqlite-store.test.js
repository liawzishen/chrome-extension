const test = require("node:test");
const assert = require("node:assert/strict");
const { mkdtempSync, rmSync } = require("node:fs");
const { join } = require("node:path");
const { tmpdir } = require("node:os");
const { randomUUID } = require("node:crypto");

const { SqliteHostedStore } = require("../services/hosted-api/src/adapters/sqlite-store.js");
const { UsageService } = require("../services/hosted-api/src/domain/usage-service.js");
const { BillingService } = require("../services/hosted-api/src/domain/billing-service.js");

const NOW = Date.parse("2026-07-29T12:00:00.000Z");

function createTemporaryDatabasePath() {
  const directory = mkdtempSync(join(tmpdir(), "neatmind-store-"));
  return {
    path: join(directory, "hosted.sqlite"),
    cleanup: () => rmSync(directory, { recursive: true, force: true })
  };
}

function openStore(databasePath) {
  return new SqliteHostedStore({ databasePath, now: () => NOW });
}

function fingerprint(seed) {
  return seed.repeat(64).slice(0, 64);
}

test("a paid subscription written by one process is still paid after a restart", async () => {
  const { path, cleanup } = createTemporaryDatabasePath();
  try {
    const first = openStore(path);
    await first.createAccount({ id: "account_durable", email: "learner@example.test", emailVerified: true });
    await first.transaction((state) => {
      state.subscriptions.set("account_durable", {
        accountId: "account_durable",
        stripeCustomerId: "cus_durable",
        stripeSubscriptionId: "sub_durable",
        stripePriceId: "price_annual",
        plan: "student_pro",
        billingInterval: "year",
        status: "active",
        cancelAtPeriodEnd: false,
        currentPeriodStart: "2026-07-01T00:00:00.000Z",
        currentPeriodEnd: "2027-07-01T00:00:00.000Z",
        effectiveStartAt: "2026-07-01T00:00:00.000Z",
        allowanceAnchorAt: "2026-07-01T00:00:00.000Z",
        graceEndsAt: null,
        revokedAt: null,
        lastStripeEventCreated: 1_780_000_000,
        updatedAt: "2026-07-01T00:00:00.000Z"
      });
      state.customerAccounts.set("cus_durable", "account_durable");
      state.subscriptionAccounts.set("sub_durable", "account_durable");
    });
    first.close();

    const second = openStore(path);
    const account = await second.getAccount("account_durable");
    assert.equal(account.email, "learner@example.test");

    const entitlement = await new UsageService({ store: second, now: () => NOW })
      .getEntitlement("account_durable");
    assert.equal(entitlement.plan, "student_pro");
    assert.equal(entitlement.status, "active");

    const reloaded = await second.transaction((state) => ({
      customer: state.customerAccounts.get("cus_durable"),
      subscription: state.subscriptionAccounts.get("sub_durable")
    }));
    assert.equal(reloaded.customer, "account_durable");
    assert.equal(reloaded.subscription, "account_durable");
    second.close();
  } finally {
    cleanup();
  }
});

test("a rolled back transaction writes nothing to disk", async () => {
  const { path, cleanup } = createTemporaryDatabasePath();
  try {
    const first = openStore(path);
    await first.createAccount({ id: "account_rollback" });
    await assert.rejects(
      first.transaction((state) => {
        state.subscriptions.set("account_rollback", { plan: "student_pro", status: "active" });
        throw new Error("provider exploded mid-transaction");
      }),
      /provider exploded mid-transaction/
    );
    first.close();

    const second = openStore(path);
    const survived = await second.transaction((state) => state.subscriptions.get("account_rollback"));
    assert.equal(survived, undefined);
    assert.notEqual(await second.getAccount("account_rollback"), null);
    second.close();
  } finally {
    cleanup();
  }
});

test("committed usage and its derived indexes rebuild from disk", async () => {
  const { path, cleanup } = createTemporaryDatabasePath();
  try {
    const first = openStore(path);
    await first.createAccount({ id: "account_usage" });
    const usage = new UsageService({ store: first, now: () => NOW });
    const reservation = await usage.reserve({
      accountId: "account_usage",
      idempotencyKey: "durable-reservation-key-1",
      items: [{ action: "study_build", units: 1 }],
      requestFingerprint: fingerprint("a")
    });
    await usage.commit(reservation.id, "OK");
    first.close();

    const second = openStore(path);
    const restored = await new UsageService({ store: second, now: () => NOW }).getUsage("account_usage");
    const studyBuild = restored.allowances.find((entry) => entry.action === "study_build");
    // Free allows 3 study builds; one committed build must still be spent.
    assert.equal(studyBuild.committed, 1);
    assert.equal(studyBuild.remaining, 2);
    second.close();
  } finally {
    cleanup();
  }
});

test("a processed Stripe event stays deduplicated across a restart", async () => {
  const { path, cleanup } = createTemporaryDatabasePath();
  try {
    const config = { graceDays: 3, refundRevokesAccess: true, priceIds: { month: "price_m", year: "price_y" } };
    const event = {
      id: "evt_restart_1",
      type: "checkout.session.completed",
      created: Math.floor(NOW / 1000),
      data: {
        object: {
          id: "cs_test_restart",
          client_reference_id: "account_events",
          customer: "cus_events",
          subscription: "sub_events"
        }
      }
    };

    const first = openStore(path);
    await first.createAccount({ id: "account_events" });
    const firstResult = await new BillingService({ store: first, config, now: () => NOW })
      .processVerifiedEvent(event);
    assert.equal(firstResult.duplicate, false);
    assert.equal(firstResult.outcome, "checkout_linked");
    first.close();

    const second = openStore(path);
    const replay = await new BillingService({ store: second, config, now: () => NOW })
      .processVerifiedEvent(event);
    assert.equal(replay.duplicate, true);
    assert.equal(replay.outcome, "already_processed");
    second.close();
  } finally {
    cleanup();
  }
});

test("a store that cannot persist refuses to keep serving", async () => {
  const { path, cleanup } = createTemporaryDatabasePath();
  try {
    const store = openStore(path);
    await store.createAccount({ id: "account_failclosed" });
    // Simulate the disk going away after the process has already booted.
    store.database.close();

    await assert.rejects(
      store.transaction((state) => state.accounts.set("account_failclosed", { id: "account_failclosed", state: "active" })),
      (error) => error.code === "STORE_PERSISTENCE_FAILED"
    );
    await assert.rejects(
      store.transaction(() => "anything at all"),
      (error) => error.code === "STORE_PERSISTENCE_FAILED" && error.statusCode === 503
    );
  } finally {
    cleanup();
  }
});

test("the same database file reopens cleanly with a fresh identity each time", async () => {
  const { path, cleanup } = createTemporaryDatabasePath();
  try {
    const identifier = randomUUID();
    const first = openStore(path);
    await first.createAccount({ id: "account_reopen", locale: identifier.slice(0, 8) });
    first.close();
    const second = openStore(path);
    const account = await second.getAccount("account_reopen");
    assert.equal(account.locale, identifier.slice(0, 8));
    second.close();
  } finally {
    cleanup();
  }
});
