const test = require("node:test");
const assert = require("node:assert/strict");
const { MemoryHostedStore } = require("../services/hosted-api/src/adapters/memory-store.js");

const DAY_MS = 86_400_000;
const BASE = Date.parse("2026-07-28T00:00:00.000Z");

function delay() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function seededStore(options = {}) {
  return new MemoryHostedStore({
    accounts: [
      ["account_a", {
        id: "account_a",
        state: "active",
        email: "a@example.test",
        profile: { tags: ["alpha"], counters: { builds: 1 } },
        updatedAt: new Date(BASE).toISOString()
      }],
      ["account_b", {
        id: "account_b",
        state: "active",
        email: "b@example.test",
        profile: { tags: [], counters: { builds: 0 } },
        updatedAt: new Date(BASE).toISOString()
      }]
    ],
    subscriptions: [
      ["account_a", { accountId: "account_a", status: "active", lastStripeEventCreated: 10 }]
    ],
    entitlements: [["account_a", { plan: "student_pro", status: "active" }]],
    reservations: [
      ["res_1", {
        id: "res_1",
        accountId: "account_a",
        state: "reserved",
        items: [{ action: "study_build", units: 1 }]
      }]
    ],
    idempotency: [["account_a:key-one", "res_1"]],
    processedBillingEvents: ["evt_seed"],
    billingReceipts: [["evt_seed", {
      eventId: "evt_seed",
      outcome: "checkout_linked",
      processedAt: new Date(BASE).toISOString()
    }]],
    customerAccounts: [["cus_seed", "account_a"]],
    subscriptionAccounts: [["sub_seed", "account_a"]]
  }, options);
}

function snapshotState(state) {
  return structuredClone({
    accounts: [...state.accounts.entries()],
    subscriptions: [...state.subscriptions.entries()],
    entitlements: [...state.entitlements.entries()],
    reservations: [...state.reservations.entries()],
    idempotency: [...state.idempotency.entries()],
    processedBillingEvents: [...state.processedBillingEvents],
    billingReceipts: [...state.billingReceipts.entries()],
    customerAccounts: [...state.customerAccounts.entries()],
    subscriptionAccounts: [...state.subscriptionAccounts.entries()],
    checkoutAttempts: [...state.checkoutAttempts.entries()],
    checkoutIdempotency: [...state.checkoutIdempotency.entries()],
    activeCheckoutAccounts: [...state.activeCheckoutAccounts.entries()],
    checkoutSessions: [...state.checkoutSessions.entries()],
    usageTotals: [...state.usageTotals.entries()].map(([accountId, buckets]) => [
      accountId,
      [...buckets.entries()]
    ]),
    activeReservations: [...state.activeReservations.entries()],
    finalizedReservations: [...state.finalizedReservations.entries()]
  });
}

function recordBillingEvent(store, eventId, processedAt) {
  return store.transaction((state) => {
    state.processedBillingEvents.add(eventId);
    state.billingReceipts.set(eventId, {
      eventId,
      outcome: "subscription_projected",
      processedAt: new Date(processedAt).toISOString()
    });
    return eventId;
  });
}

test("a throwing transaction rolls back every mutation, including nested object mutations", async () => {
  const store = seededStore();
  const before = snapshotState(store.state);

  await assert.rejects(
    store.transaction(async (state) => {
      const account = state.accounts.get("account_a");
      account.email = "hijacked@example.test";
      account.profile.tags.push("beta");
      account.profile.counters.builds += 41;

      const reservation = state.reservations.get("res_1");
      reservation.state = "committed";
      reservation.items[0].units = 99;

      state.subscriptions.get("account_a").status = "revoked";
      state.accounts.set("account_c", { id: "account_c", state: "active" });
      state.accounts.delete("account_b");
      state.idempotency.set("account_a:key-two", "res_2");
      state.processedBillingEvents.add("evt_rollback");
      state.processedBillingEvents.delete("evt_seed");
      state.billingReceipts.delete("evt_seed");
      state.customerAccounts.set("cus_rollback", "account_c");
      await delay();
      throw new Error("transaction failed");
    }),
    /transaction failed/
  );

  assert.deepEqual(snapshotState(store.state), before);
  // Deleting then restoring a key must not move it to the end of the Map.
  assert.deepEqual([...store.state.accounts.keys()], ["account_a", "account_b"]);
});

test("derived usage indexes roll back atomically with their source reservation", async () => {
  const store = new MemoryHostedStore();
  const periodEnd = new Date(BASE + DAY_MS).toISOString();
  await store.transaction((state) => {
    state.reservations.set("res_indexed", {
      id: "res_indexed",
      accountId: "account_indexed",
      state: "reserved",
      expiresAt: new Date(BASE + 60_000).toISOString(),
      items: [{
        action: "study_build",
        units: 1,
        periodKey: "period-indexed",
        periodEnd
      }]
    });
    state.activeReservations.set("res_indexed", BASE + 60_000);
    state.usageTotals.set("account_indexed", new Map([
      ["study_build\u0000period-indexed", {
        reserved: 1,
        committed: 0,
        periodEnd: Date.parse(periodEnd)
      }]
    ]));
  });
  const before = snapshotState(store.state);

  await assert.rejects(
    store.transaction((state) => {
      state.reservations.get("res_indexed").state = "expired";
      state.activeReservations.delete("res_indexed");
      state.usageTotals.get("account_indexed").get("study_build\u0000period-indexed").reserved = 0;
      state.finalizedReservations.set("res_indexed", BASE);
      throw new Error("roll back indexes");
    }),
    /roll back indexes/
  );

  assert.deepEqual(snapshotState(store.state), before);
});

test("concurrent transactions serialize and a failed one leaves the next ones consistent", async () => {
  const store = seededStore();
  const order = [];

  const bump = (label) => store.transaction(async (state) => {
    order.push(`${label}:enter`);
    const account = state.accounts.get("account_a");
    const seen = account.profile.counters.builds;
    await delay();
    account.profile.counters.builds = seen + 1;
    order.push(`${label}:exit`);
    return account.profile.counters.builds;
  });

  const failing = () => store.transaction(async (state) => {
    order.push("boom:enter");
    state.accounts.get("account_a").profile.counters.builds = 999;
    state.reservations.delete("res_1");
    await delay();
    throw new Error("boom");
  });

  const settled = await Promise.allSettled([bump("a"), failing(), bump("b"), bump("c")]);

  assert.deepEqual(settled.map((entry) => entry.status), [
    "fulfilled",
    "rejected",
    "fulfilled",
    "fulfilled"
  ]);
  assert.deepEqual(order, [
    "a:enter",
    "a:exit",
    "boom:enter",
    "b:enter",
    "b:exit",
    "c:enter",
    "c:exit"
  ]);
  assert.deepEqual(
    settled.filter((entry) => entry.status === "fulfilled").map((entry) => entry.value),
    [2, 3, 4]
  );
  assert.equal(store.state.accounts.get("account_a").profile.counters.builds, 4);
  assert.equal(store.state.reservations.has("res_1"), true);
});

test("a transaction only snapshots the entries it touches, not the whole store", async () => {
  const store = seededStore();
  for (let index = 0; index < 500; index += 1) {
    await recordBillingEvent(store, `evt_bulk_${index}`, BASE + index);
  }

  const before = store.stats.journaledEntries;
  await store.createAccount({ id: "account_touch_one", email: "one@example.test" });
  const touched = store.stats.journaledEntries - before;
  assert.ok(touched <= 4, `expected a handful of journaled entries, got ${touched}`);

  for (let index = 500; index < 1500; index += 1) {
    await recordBillingEvent(store, `evt_bulk_${index}`, BASE + index);
  }
  const beforeLarger = store.stats.journaledEntries;
  await store.createAccount({ id: "account_touch_two", email: "two@example.test" });
  assert.equal(store.stats.journaledEntries - beforeLarger, touched);
});

test("an untouched collection is never cloned by an unrelated transaction", async () => {
  const store = new MemoryHostedStore({
    processedBillingEvents: ["evt_uncloneable"],
    billingReceipts: [["evt_uncloneable", {
      eventId: "evt_uncloneable",
      processedAt: new Date(BASE).toISOString(),
      // A structured-clone-hostile value: only a whole-state snapshot would hit it.
      onReplay() { return true; }
    }]]
  }, { now: () => BASE });

  const account = await store.createAccount({ id: "account_isolated", email: "iso@example.test" });
  assert.equal(account.id, "account_isolated");
  assert.equal(store.state.billingReceipts.size, 1);
});

test("billing history retention caps the processed-event index and its receipts", async () => {
  const store = seededStore({ billingEventRetentionMax: 5, now: () => BASE });
  for (let index = 0; index < 8; index += 1) {
    await recordBillingEvent(store, `evt_capped_${index}`, BASE + index);
  }

  assert.equal(store.state.processedBillingEvents.size, 5);
  assert.deepEqual([...store.state.processedBillingEvents], [
    "evt_capped_3",
    "evt_capped_4",
    "evt_capped_5",
    "evt_capped_6",
    "evt_capped_7"
  ]);
  assert.equal(store.state.billingReceipts.size, 5);
  assert.equal(store.state.billingReceipts.has("evt_capped_0"), false);
  assert.equal(store.state.billingReceipts.has("evt_capped_7"), true);
});

test("billing history retention evicts by age but keeps the idempotency window intact", async () => {
  let clock = BASE;
  const store = new MemoryHostedStore({}, {
    billingEventRetentionMs: DAY_MS,
    now: () => clock
  });

  await recordBillingEvent(store, "evt_stale", clock);
  clock = BASE + 6 * 60 * 60 * 1000;
  await recordBillingEvent(store, "evt_recent", clock);
  assert.equal(store.state.processedBillingEvents.has("evt_stale"), true);
  assert.equal(store.state.processedBillingEvents.has("evt_recent"), true);

  clock = BASE + 2 * DAY_MS;
  await recordBillingEvent(store, "evt_newest", clock);
  assert.equal(store.state.processedBillingEvents.has("evt_stale"), false);
  assert.equal(store.state.billingReceipts.has("evt_stale"), false);
  assert.equal(store.state.processedBillingEvents.has("evt_recent"), false);
  assert.equal(store.state.processedBillingEvents.has("evt_newest"), true);

  clock = BASE + 2 * DAY_MS + 60_000;
  await recordBillingEvent(store, "evt_followup", clock);
  assert.deepEqual([...store.state.processedBillingEvents], ["evt_newest", "evt_followup"]);
});
