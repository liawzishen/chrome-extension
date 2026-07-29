const { DatabaseSync } = require("node:sqlite");
const { mkdirSync } = require("node:fs");
const { dirname } = require("node:path");
const { HostedDomainError } = require("../domain/errors.js");
const { DURABLE_COLLECTIONS, MemoryHostedStore } = require("./memory-store.js");

const DURABLE = new Set(DURABLE_COLLECTIONS);

// The hosted domain reads and writes plain synchronous Maps inside one
// transaction callback. node:sqlite is the only durable engine that can service
// that contract without rewriting billing, checkout, and usage to be async, so
// the authoritative copy stays in memory and every committed change is written
// through to disk while the store's serialization lock is still held.
//
// Consequence to respect: this is correct for exactly ONE process. Two replicas
// would each hold their own authoritative memory and silently diverge. Scaling
// out requires the async-store refactor and row locking described in
// services/hosted-api/README.md, not a second copy of this file.
const SCHEMA = `
CREATE TABLE IF NOT EXISTS hosted_state (
  collection TEXT NOT NULL,
  key        TEXT NOT NULL,
  value      TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (collection, key)
);
CREATE INDEX IF NOT EXISTS hosted_state_collection ON hosted_state (collection);
`;

class SqliteHostedStore extends MemoryHostedStore {
  constructor(options = {}) {
    const database = openDatabase(options);
    super(loadSeed(database), options);
    this.database = database;
    this.persistenceFailure = null;
    this.upsertStatement = database.prepare(
      `INSERT INTO hosted_state (collection, key, value, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT (collection, key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
    );
    this.deleteStatement = database.prepare(
      "DELETE FROM hosted_state WHERE collection = ? AND key = ?"
    );
  }

  async transaction(operation) {
    // A store whose memory has outrun its disk must not keep answering as if the
    // two agree. Every later transaction fails closed until the process restarts
    // and reloads an authoritative snapshot from the database.
    if (this.persistenceFailure) {
      throw new HostedDomainError(
        "STORE_PERSISTENCE_FAILED",
        "The hosted store could not persist a previous change and is no longer authoritative.",
        503
      );
    }
    return super.transaction(operation);
  }

  afterCommit() {
    const changes = this.journal.changeset;
    const evicted = this.lastEvictedBillingEvents;
    if (changes.length === 0 && evicted.length === 0) return;
    const updatedAt = new Date(this.now()).toISOString();
    try {
      // Inside the try: if opening the write transaction is itself what fails,
      // that still has to raise STORE_PERSISTENCE_FAILED and latch the store
      // closed rather than escaping as a raw driver error.
      this.database.exec("BEGIN IMMEDIATE");
      for (const change of changes) {
        if (!DURABLE.has(change.collection)) continue;
        if (change.exists) {
          this.upsertStatement.run(
            change.collection,
            String(change.key),
            JSON.stringify(change.value === undefined ? null : change.value),
            updatedAt
          );
        } else {
          this.deleteStatement.run(change.collection, String(change.key));
        }
      }
      for (const eventId of evicted) {
        this.deleteStatement.run("processedBillingEvents", String(eventId));
        this.deleteStatement.run("billingReceipts", String(eventId));
      }
      this.database.exec("COMMIT");
    } catch (error) {
      try {
        this.database.exec("ROLLBACK");
      } catch {
        // A failed rollback cannot be recovered here; the failure flag below is
        // what actually protects callers.
      }
      this.persistenceFailure = error;
      const failure = new HostedDomainError(
        "STORE_PERSISTENCE_FAILED",
        "The hosted store could not persist a committed change.",
        503
      );
      failure.cause = error;
      throw failure;
    }
  }

  close() {
    this.database.close();
  }
}

function openDatabase(options) {
  const location = String(options.databasePath || options.location || "").trim();
  if (!location) {
    throw new HostedDomainError(
      "STORE_PATH_REQUIRED",
      "A hosted SQLite database path is required.",
      500
    );
  }
  if (location !== ":memory:") mkdirSync(dirname(location), { recursive: true });
  const database = new DatabaseSync(location);
  // WAL keeps readers off the writer's back; FULL synchronous means a committed
  // subscription survives an abrupt power loss, which is the whole point of
  // persisting billing state at all.
  database.exec("PRAGMA journal_mode = WAL");
  database.exec("PRAGMA synchronous = FULL");
  database.exec("PRAGMA foreign_keys = ON");
  database.exec(SCHEMA);
  return database;
}

function loadSeed(database) {
  const rows = database.prepare("SELECT collection, key, value FROM hosted_state").all();
  const seed = {};
  const receipts = new Map();
  const eventIds = [];
  const reservations = [];

  for (const row of rows) {
    const collection = String(row.collection);
    if (!DURABLE.has(collection)) continue;
    const key = String(row.key);
    let value;
    try {
      value = JSON.parse(String(row.value));
    } catch {
      // A single unreadable row must not take the whole service down at boot.
      continue;
    }
    if (collection === "processedBillingEvents") {
      eventIds.push(key);
      continue;
    }
    if (collection === "billingReceipts") {
      receipts.set(key, value);
      continue;
    }
    if (collection === "reservations") {
      reservations.push([key, value]);
      continue;
    }
    (seed[collection] ||= []).push([key, value]);
  }

  if (receipts.size > 0) seed.billingReceipts = [...receipts.entries()];
  if (eventIds.length > 0) {
    // Retention eviction walks this set front to back, so restoring it in
    // arbitrary SQLite row order would evict the wrong events after a restart.
    seed.processedBillingEvents = eventIds.sort(
      (left, right) => receiptTime(receipts.get(left)) - receiptTime(receipts.get(right))
    );
  }
  if (reservations.length > 0) {
    // Finalized-reservation pruning likewise assumes roughly chronological order.
    seed.reservations = reservations.sort(
      (left, right) => Date.parse(left[1]?.createdAt || 0) - Date.parse(right[1]?.createdAt || 0)
    );
  }
  return seed;
}

function receiptTime(receipt) {
  const parsed = Date.parse(receipt?.processedAt);
  return Number.isFinite(parsed) ? parsed : 0;
}

module.exports = { SqliteHostedStore };
