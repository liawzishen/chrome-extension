const { randomUUID } = require("crypto");
const { assertDomain } = require("../domain/errors.js");
const {
  createCommittedTombstone,
  idempotencyIndex
} = require("../domain/idempotency.js");

// Billing history retention. Stripe stops retrying a webhook long before this
// window closes, so replaying an event older than the window is not a realistic
// duplicate; keeping the index unbounded instead is what makes every transaction
// slower forever.
const BILLING_EVENT_RETENTION_MAX = 5_000;
const BILLING_EVENT_RETENTION_MS = 30 * 86_400_000;

// The collections a durable adapter has to write. `usageTotals`,
// `activeReservations` and `finalizedReservations` are deliberately absent: they
// are derived indexes that rebuildUsageIndexes() regenerates from `reservations`
// at load, so persisting them would only create a second thing to keep correct.
const DURABLE_COLLECTIONS = Object.freeze([
  "accounts",
  "subscriptions",
  "entitlements",
  "reservations",
  "idempotency",
  "processedBillingEvents",
  "billingReceipts",
  "customerAccounts",
  "subscriptionAccounts",
  "checkoutAttempts",
  "checkoutIdempotency",
  "activeCheckoutAccounts",
  "checkoutSessions",
  "authSessions",
  "identityAccounts",
  // Committed metering that has to outlive reservation pruning. Losing this on a
  // restart would let an already-charged action be replayed as fresh work.
  "committedIdempotency"
]);

class MemoryHostedStore {
  constructor(seed = {}, options = {}) {
    // Rollback uses an undo journal rather than a whole-state snapshot: a
    // collection records the pre-transaction image of a key the first time that
    // key is handed out or written, so a transaction pays for the entries it
    // actually touches instead of for the size of the entire store.
    this.journal = new TransactionJournal();
    this.state = {
      accounts: new JournaledMap(seed.accounts || [], this.journal, "accounts"),
      subscriptions: new JournaledMap(seed.subscriptions || [], this.journal, "subscriptions"),
      entitlements: new JournaledMap(seed.entitlements || [], this.journal, "entitlements"),
      reservations: new JournaledMap(seed.reservations || [], this.journal, "reservations"),
      idempotency: new JournaledMap(seed.idempotency || [], this.journal, "idempotency"),
      processedBillingEvents: new JournaledSet(seed.processedBillingEvents || [], this.journal, "processedBillingEvents"),
      billingReceipts: new JournaledMap(seed.billingReceipts || [], this.journal, "billingReceipts"),
      customerAccounts: new JournaledMap(seed.customerAccounts || [], this.journal, "customerAccounts"),
      subscriptionAccounts: new JournaledMap(seed.subscriptionAccounts || [], this.journal, "subscriptionAccounts"),
      checkoutAttempts: new JournaledMap(seed.checkoutAttempts || [], this.journal, "checkoutAttempts"),
      checkoutIdempotency: new JournaledMap(seed.checkoutIdempotency || [], this.journal, "checkoutIdempotency"),
      activeCheckoutAccounts: new JournaledMap(seed.activeCheckoutAccounts || [], this.journal, "activeCheckoutAccounts"),
      checkoutSessions: new JournaledMap(seed.checkoutSessions || [], this.journal, "checkoutSessions"),
      authSessions: new JournaledMap(seed.authSessions || [], this.journal, "authSessions"),
      // `${provider}:${subject}` -> accountId. The identity provider's subject is
      // the stable join key; email is display data and can change under the user.
      identityAccounts: new JournaledMap(seed.identityAccounts || [], this.journal, "identityAccounts"),
      // These are derived usage indexes, but they still participate in the same
      // undo journal. A failed reservation transaction must not roll back the
      // source reservation while leaving its counters or expiry index mutated.
      usageTotals: new JournaledMap(seed.usageTotals || [], this.journal, "usageTotals"),
      activeReservations: new JournaledMap(seed.activeReservations || [], this.journal, "activeReservations"),
      finalizedReservations: new JournaledMap(seed.finalizedReservations || [], this.journal, "finalizedReservations"),
      // Unlike the three indexes above, this one is not derived: it is the compact
      // committed-usage authority that outlives finalized-reservation pruning, so
      // it is named and persisted rather than rebuilt.
      committedIdempotency: new JournaledMap(seed.committedIdempotency || [], this.journal, "committedIdempotency")
    };
    if (
      !seed.usageTotals ||
      !seed.activeReservations ||
      !seed.finalizedReservations ||
      !seed.committedIdempotency
    ) {
      rebuildUsageIndexes(this.state);
    }
    this.now = typeof options.now === "function" ? options.now : Date.now;
    this.billingEventRetention = {
      maxEntries: clampInteger(options.billingEventRetentionMax, 1, 1_000_000, BILLING_EVENT_RETENTION_MAX),
      maxAgeMs: clampInteger(options.billingEventRetentionMs, 60_000, 365 * 86_400_000, BILLING_EVENT_RETENTION_MS)
    };
    this.stats = { transactions: 0, journaledEntries: 0, evictedBillingEvents: 0 };
    this.lastEvictedBillingEvents = [];
    this.lock = Promise.resolve();
  }

  async transaction(operation) {
    let release;
    const previous = this.lock;
    this.lock = new Promise((resolve) => {
      release = resolve;
    });
    await previous;
    this.journal.begin(this.stats);
    try {
      const result = await operation(this.state);
      this.journal.commit();
      this.pruneBillingHistory();
      // Runs while the serialization lock is still held, so a durable subclass can
      // write the changeset before any other transaction is allowed to overwrite it.
      this.afterCommit();
      this.stats.transactions += 1;
      return result;
    } catch (error) {
      this.journal.rollback();
      throw error;
    } finally {
      release();
    }
  }

  // Overridden by durable adapters. The base store keeps nothing beyond memory.
  afterCommit() {}

  // Runs after the journal is committed so eviction never costs a snapshot and
  // never resurrects entries a rolled back transaction was supposed to drop.
  pruneBillingHistory() {
    // Eviction runs after the journal has committed, so it produces no changeset
    // entries. A durable adapter reads this list to delete the same rows.
    this.lastEvictedBillingEvents = [];
    const { maxEntries, maxAgeMs } = this.billingEventRetention;
    const events = this.state.processedBillingEvents;
    const receipts = this.state.billingReceipts;
    const cutoff = this.now() - maxAgeMs;
    const oldestEventId = events.values().next().value;
    const oldestExpired = oldestEventId !== undefined &&
      isExpiredReceipt(receipts.get(oldestEventId), cutoff);
    if (events.size <= maxEntries && receipts.size <= maxEntries && !oldestExpired) return;

    let remaining = events.size;
    for (const eventId of [...events]) {
      const expired = isExpiredReceipt(receipts.get(eventId), cutoff);
      if (remaining <= maxEntries && !expired) continue;
      events.delete(eventId);
      receipts.delete(eventId);
      this.lastEvictedBillingEvents.push(eventId);
      remaining -= 1;
      this.stats.evictedBillingEvents += 1;
    }

    // Receipts without an index entry (seeded directly) obey the same bound.
    let overflow = receipts.size - maxEntries;
    if (overflow <= 0) return;
    for (const [eventId, receipt] of [...receipts.entries()]) {
      if (overflow <= 0) break;
      if (events.has(eventId) && !isExpiredReceipt(receipt, cutoff)) continue;
      receipts.delete(eventId);
      events.delete(eventId);
      this.lastEvictedBillingEvents.push(eventId);
      overflow -= 1;
      this.stats.evictedBillingEvents += 1;
    }
  }

  async createAccount(input = {}) {
    return this.transaction((state) => {
      const id = normalizeId(input.id || randomUUID(), "account");
      assertDomain(!state.accounts.has(id), "ACCOUNT_EXISTS", "The account already exists.", 409);
      const now = new Date(input.createdAt || Date.now()).toISOString();
      const account = {
        id,
        state: "active",
        email: String(input.email || "").trim().toLowerCase().slice(0, 320),
        emailVerified: input.emailVerified === true,
        locale: String(input.locale || "en").slice(0, 20),
        billingRegion: String(input.billingRegion || "").slice(0, 8),
        stripeCustomerId: null,
        createdAt: now,
        updatedAt: now
      };
      state.accounts.set(id, account);
      return structuredClone(account);
    });
  }

  async getAccount(accountId) {
    return structuredClone(this.state.accounts.get(String(accountId)) || null);
  }
}

class TransactionJournal {
  constructor() {
    this.active = false;
    this.collections = new Set();
    this.stats = null;
    // Populated on every commit with only the entries whose value actually
    // changed. A durable adapter reads this instead of diffing the whole store.
    this.changeset = [];
  }

  begin(stats) {
    this.collections.clear();
    this.changeset = [];
    this.stats = stats || null;
    this.active = true;
  }

  record(collection) {
    this.collections.add(collection);
    if (this.stats) this.stats.journaledEntries += 1;
  }

  commit() {
    const changeset = [];
    // Collect before discarding: discardUndo() drops the pre-images that make
    // "did this key actually change?" answerable.
    for (const collection of this.collections) collection.collectChanges(changeset);
    for (const collection of this.collections) collection.discardUndo();
    this.changeset = changeset;
    this.end();
  }

  rollback() {
    for (const collection of this.collections) collection.applyUndo();
    this.end();
  }

  end() {
    this.active = false;
    this.collections.clear();
  }
}

class JournaledMap extends Map {
  constructor(entries, journal, name = "") {
    // Map's constructor calls the overridden set(), so seed after the journal exists.
    super();
    this.journal = journal;
    this.name = name;
    this.undo = new Map();
    this.keyOrder = null;
    for (const [key, value] of entries) super.set(key, value);
  }

  // A key is journaled on read as well as on write, so "touched" is far wider
  // than "changed". Comparing against the pre-image keeps a durable adapter from
  // rewriting rows that a transaction only looked at.
  collectChanges(out) {
    for (const [key, entry] of this.undo) {
      const exists = super.has(key);
      const value = exists ? super.get(key) : undefined;
      if (entry.existed === exists && sameSnapshot(entry.value, value)) continue;
      out.push({ collection: this.name, key, exists, value });
    }
  }

  record(key) {
    if (!this.journal.active || this.undo.has(key)) return;
    const existed = super.has(key);
    this.undo.set(key, { existed, value: existed ? cloneValue(super.get(key)) : undefined });
    this.journal.record(this);
  }

  get(key) {
    this.record(key);
    return super.get(key);
  }

  set(key, value) {
    this.record(key);
    return super.set(key, value);
  }

  delete(key) {
    this.record(key);
    if (this.journal.active && !this.keyOrder && super.has(key)) this.keyOrder = [...super.keys()];
    return super.delete(key);
  }

  clear() {
    if (this.journal.active) {
      for (const key of super.keys()) this.record(key);
      if (!this.keyOrder && super.size > 0) this.keyOrder = [...super.keys()];
    }
    return super.clear();
  }

  *entries() {
    for (const key of super.keys()) {
      this.record(key);
      yield [key, super.get(key)];
    }
  }

  *values() {
    for (const key of super.keys()) {
      this.record(key);
      yield super.get(key);
    }
  }

  [Symbol.iterator]() {
    return this.entries();
  }

  forEach(callback, thisArg) {
    for (const [key, value] of this.entries()) callback.call(thisArg, value, key, this);
  }

  applyUndo() {
    for (const [key, entry] of this.undo) {
      if (entry.existed) super.set(key, entry.value);
      else super.delete(key);
    }
    // Re-adding a deleted key would otherwise move it to the end of the Map.
    if (this.keyOrder) {
      const current = new Map(super.entries());
      super.clear();
      for (const key of this.keyOrder) {
        if (!current.has(key)) continue;
        super.set(key, current.get(key));
        current.delete(key);
      }
      for (const [key, value] of current) super.set(key, value);
    }
    this.discardUndo();
  }

  discardUndo() {
    this.undo.clear();
    this.keyOrder = null;
  }
}

class JournaledSet extends Set {
  constructor(values, journal, name = "") {
    // Set's constructor calls the overridden add(), so seed after the journal exists.
    super();
    this.journal = journal;
    this.name = name;
    this.undo = new Map();
    this.valueOrder = null;
    for (const value of values) super.add(value);
  }

  collectChanges(out) {
    for (const [value, existed] of this.undo) {
      const exists = super.has(value);
      if (existed === exists) continue;
      out.push({ collection: this.name, key: value, exists, value: exists ? value : undefined });
    }
  }

  record(value) {
    if (!this.journal.active || this.undo.has(value)) return;
    this.undo.set(value, super.has(value));
    this.journal.record(this);
  }

  add(value) {
    this.record(value);
    return super.add(value);
  }

  delete(value) {
    this.record(value);
    if (this.journal.active && !this.valueOrder && super.has(value)) this.valueOrder = [...super.values()];
    return super.delete(value);
  }

  clear() {
    if (this.journal.active) {
      for (const value of super.values()) this.record(value);
      if (!this.valueOrder && super.size > 0) this.valueOrder = [...super.values()];
    }
    return super.clear();
  }

  applyUndo() {
    for (const [value, existed] of this.undo) {
      if (existed) super.add(value);
      else super.delete(value);
    }
    if (this.valueOrder) {
      const current = new Set(super.values());
      super.clear();
      for (const value of this.valueOrder) {
        if (!current.has(value)) continue;
        super.add(value);
        current.delete(value);
      }
      for (const value of current) super.add(value);
    }
    this.discardUndo();
  }

  discardUndo() {
    this.undo.clear();
    this.valueOrder = null;
  }
}

function cloneValue(value) {
  return value !== null && typeof value === "object" ? structuredClone(value) : value;
}

function sameSnapshot(left, right) {
  if (left === right) return true;
  if (left === null || right === null || left === undefined || right === undefined) return false;
  if (typeof left !== "object" || typeof right !== "object") return false;
  return snapshotJson(left) === snapshotJson(right);
}

function snapshotJson(value) {
  // Plain JSON.stringify flattens a Map to "{}", which would report two different
  // usage-total buckets as identical.
  return JSON.stringify(value, (key, entry) => (entry instanceof Map ? [...entry.entries()] : entry));
}

function rebuildUsageIndexes(state) {
  state.usageTotals.clear();
  state.activeReservations.clear();
  state.finalizedReservations.clear();
  // A supplied compact tombstone can outlive its pruned detailed reservation.
  // Preserve it while rebuilding the other derived indexes, then add any
  // committed reservations that are still present.
  for (const reservation of state.reservations.values()) {
    const stateName = String(reservation?.state || "");
    if (stateName === "reserved") {
      const expiresAt = Date.parse(reservation.expiresAt);
      state.activeReservations.set(
        reservation.id,
        Number.isFinite(expiresAt) ? expiresAt : Number.POSITIVE_INFINITY
      );
      addReservationTotals(state, reservation, "reserved");
      continue;
    }
    if (stateName === "committed") {
      addReservationTotals(state, reservation, "committed");
      state.committedIdempotency.set(
        idempotencyIndex(reservation.accountId, reservation.idempotencyKey),
        createCommittedTombstone(reservation)
      );
    }
    const finalizedAt = Date.parse(
      reservation?.committedAt || reservation?.releasedAt || reservation?.createdAt
    );
    state.finalizedReservations.set(
      reservation.id,
      Number.isFinite(finalizedAt) ? finalizedAt : 0
    );
  }
}

function addReservationTotals(state, reservation, field) {
  let buckets = state.usageTotals.get(reservation.accountId);
  if (!buckets) {
    buckets = new Map();
    state.usageTotals.set(reservation.accountId, buckets);
  }
  for (const item of Array.isArray(reservation.items) ? reservation.items : []) {
    const action = String(item?.bucketAction || item?.action || "");
    const periodKey = String(item?.periodKey || "");
    const units = Number(item?.units);
    if (!action || !periodKey || !Number.isSafeInteger(units) || units <= 0) continue;
    const key = `${action}\u0000${periodKey}`;
    const bucket = buckets.get(key) || {
      reserved: 0,
      committed: 0,
      periodEnd: item.periodEnd ? Date.parse(item.periodEnd) : null
    };
    bucket[field] += units;
    buckets.set(key, bucket);
  }
  if (buckets.size === 0) state.usageTotals.delete(reservation.accountId);
}

function isExpiredReceipt(receipt, cutoff) {
  const processedAt = Date.parse(receipt?.processedAt);
  return Number.isFinite(processedAt) && processedAt <= cutoff;
}

function clampInteger(value, minimum, maximum, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(minimum, Math.min(maximum, Math.round(number))) : fallback;
}

function normalizeId(value, label) {
  const id = String(value || "").trim();
  assertDomain(/^[a-zA-Z0-9_-]{3,100}$/.test(id), "INVALID_ID", `The ${label} identifier is invalid.`, 400);
  return id;
}

module.exports = { DURABLE_COLLECTIONS, MemoryHostedStore };
