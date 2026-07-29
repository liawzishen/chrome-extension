const { randomUUID } = require("crypto");
const { assertDomain } = require("../domain/errors.js");

// Billing history retention. Stripe stops retrying a webhook long before this
// window closes, so replaying an event older than the window is not a realistic
// duplicate; keeping the index unbounded instead is what makes every transaction
// slower forever.
const BILLING_EVENT_RETENTION_MAX = 5_000;
const BILLING_EVENT_RETENTION_MS = 30 * 86_400_000;

class MemoryHostedStore {
  constructor(seed = {}, options = {}) {
    // Rollback uses an undo journal rather than a whole-state snapshot: a
    // collection records the pre-transaction image of a key the first time that
    // key is handed out or written, so a transaction pays for the entries it
    // actually touches instead of for the size of the entire store.
    this.journal = new TransactionJournal();
    this.state = {
      accounts: new JournaledMap(seed.accounts || [], this.journal),
      subscriptions: new JournaledMap(seed.subscriptions || [], this.journal),
      entitlements: new JournaledMap(seed.entitlements || [], this.journal),
      reservations: new JournaledMap(seed.reservations || [], this.journal),
      idempotency: new JournaledMap(seed.idempotency || [], this.journal),
      processedBillingEvents: new JournaledSet(seed.processedBillingEvents || [], this.journal),
      billingReceipts: new JournaledMap(seed.billingReceipts || [], this.journal),
      customerAccounts: new JournaledMap(seed.customerAccounts || [], this.journal),
      subscriptionAccounts: new JournaledMap(seed.subscriptionAccounts || [], this.journal),
      checkoutAttempts: new JournaledMap(seed.checkoutAttempts || [], this.journal),
      checkoutIdempotency: new JournaledMap(seed.checkoutIdempotency || [], this.journal),
      activeCheckoutAccounts: new JournaledMap(seed.activeCheckoutAccounts || [], this.journal),
      checkoutSessions: new JournaledMap(seed.checkoutSessions || [], this.journal),
      // These are derived usage indexes, but they still participate in the same
      // undo journal. A failed reservation transaction must not roll back the
      // source reservation while leaving its counters or expiry index mutated.
      usageTotals: new JournaledMap(seed.usageTotals || [], this.journal),
      activeReservations: new JournaledMap(seed.activeReservations || [], this.journal),
      finalizedReservations: new JournaledMap(seed.finalizedReservations || [], this.journal)
    };
    if (!seed.usageTotals || !seed.activeReservations || !seed.finalizedReservations) {
      rebuildUsageIndexes(this.state);
    }
    this.now = typeof options.now === "function" ? options.now : Date.now;
    this.billingEventRetention = {
      maxEntries: clampInteger(options.billingEventRetentionMax, 1, 1_000_000, BILLING_EVENT_RETENTION_MAX),
      maxAgeMs: clampInteger(options.billingEventRetentionMs, 60_000, 365 * 86_400_000, BILLING_EVENT_RETENTION_MS)
    };
    this.stats = { transactions: 0, journaledEntries: 0, evictedBillingEvents: 0 };
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
      this.stats.transactions += 1;
      return result;
    } catch (error) {
      this.journal.rollback();
      throw error;
    } finally {
      release();
    }
  }

  // Runs after the journal is committed so eviction never costs a snapshot and
  // never resurrects entries a rolled back transaction was supposed to drop.
  pruneBillingHistory() {
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
  }

  begin(stats) {
    this.collections.clear();
    this.stats = stats || null;
    this.active = true;
  }

  record(collection) {
    this.collections.add(collection);
    if (this.stats) this.stats.journaledEntries += 1;
  }

  commit() {
    for (const collection of this.collections) collection.discardUndo();
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
  constructor(entries, journal) {
    // Map's constructor calls the overridden set(), so seed after the journal exists.
    super();
    this.journal = journal;
    this.undo = new Map();
    this.keyOrder = null;
    for (const [key, value] of entries) super.set(key, value);
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
  constructor(values, journal) {
    // Set's constructor calls the overridden add(), so seed after the journal exists.
    super();
    this.journal = journal;
    this.undo = new Map();
    this.valueOrder = null;
    for (const value of values) super.add(value);
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

function rebuildUsageIndexes(state) {
  state.usageTotals.clear();
  state.activeReservations.clear();
  state.finalizedReservations.clear();
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
    if (stateName === "committed") addReservationTotals(state, reservation, "committed");
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
    const action = String(item?.action || "");
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

module.exports = { MemoryHostedStore };
