const { createHash, randomUUID } = require("crypto");
const { assertDomain, HostedDomainError } = require("./errors.js");
const {
  createCommittedTombstone,
  idempotencyIndex
} = require("./idempotency.js");
const {
  ACTIONS,
  getAllowanceWindow,
  getPolicyForEntitlement,
  isValidUsageUnits,
  resolveAllowance,
  resolveEntitlement
} = require("./policy.js");

const ALLOWED_ACTIONS = new Set(Object.values(ACTIONS));
const REPLAYABLE_STATES = new Set(["reserved", "committed"]);

class UsageService {
  constructor(options) {
    assertDomain(options?.store, "STORE_REQUIRED", "A hosted usage store is required.", 500);
    this.store = options.store;
    this.now = typeof options.now === "function" ? options.now : Date.now;
    this.reservationTtlMs = clampInteger(options.reservationTtlMs, 30_000, 30 * 60_000, 10 * 60_000);
    this.graceMs = clampInteger(options.graceMs, 0, 30 * 24 * 60 * 60 * 1000, 3 * 24 * 60 * 60 * 1000);
    this.finalizedRetentionMs = clampInteger(options.finalizedRetentionMs, 60_000, 30 * 24 * 60 * 60 * 1000, 24 * 60 * 60 * 1000);
    this.maxFinalizedReservations = clampInteger(options.maxFinalizedReservations, 100, 1_000_000, 10_000);
  }

  // Expiry, retention pruning and stale-window cleanup for one account, all proportional to
  // that account's live work rather than to everything the store has ever held.
  maintain(state, accountId, now) {
    ensureIndexes(state);
    expireReservations(state, now);
    pruneFinalizedReservations(state, now, this.finalizedRetentionMs, this.maxFinalizedReservations);
    pruneAccountBuckets(state, accountId, now);
  }

  // maintain() only ever runs for an account that is actively transacting, so an
  // abandoned reservation on an idle account would hold its units forever. The
  // deployed sweeper calls this to release them on a timer instead.
  async sweepExpiredReservations() {
    return this.store.transaction((state) => {
      ensureIndexes(state);
      const now = this.now();
      const before = state.activeReservations.size;
      expireReservations(state, now);
      pruneFinalizedReservations(state, now, this.finalizedRetentionMs, this.maxFinalizedReservations);
      return { expired: before - state.activeReservations.size };
    });
  }

  async getEntitlement(accountId) {
    return this.store.transaction((state) => {
      const account = requireActiveAccount(state, accountId);
      const subscription = state.subscriptions.get(account.id) || null;
      return resolveEntitlement(subscription, this.now(), { graceMs: this.graceMs });
    });
  }

  async getUsage(accountId) {
    return this.store.transaction((state) => {
      const account = requireActiveAccount(state, accountId);
      const now = this.now();
      this.maintain(state, account.id, now);
      const subscription = state.subscriptions.get(account.id) || null;
      const entitlement = resolveEntitlement(subscription, now, { graceMs: this.graceMs });
      const policy = getPolicyForEntitlement(entitlement);
      const allowances = Object.keys(policy.allowances).map((action) => {
        const { bucketAction, definition } = resolveAllowance(policy, action);
        const period = getAllowanceWindow(policy, action, now, subscription);
        const totals = countUsage(state, account.id, bucketAction, period.key);
        return formatAllowance(action, definition, period, totals, bucketAction);
      });
      return { plan: policy.plan, policyVersion: policy.version, entitlement, allowances };
    });
  }

  async reserve(input) {
    const accountId = String(input?.accountId || "");
    const idempotencyKey = normalizeIdempotencyKey(input?.idempotencyKey);
    const items = normalizeItems(input?.items);
    const requestFingerprint = normalizeRequestFingerprint(input?.requestFingerprint);
    const digest = digestReservation(items, requestFingerprint);
    return this.store.transaction((state) => {
      const account = requireActiveAccount(state, accountId);
      const now = this.now();
      this.maintain(state, account.id, now);
      const indexKey = idempotencyIndex(account.id, idempotencyKey);
      const committed = state.committedIdempotency.get(indexKey);
      if (committed) {
        assertDomain(committed.requestDigest === digest, "IDEMPOTENCY_CONFLICT", "The idempotency key was already used for different work.", 409);
        return { ...structuredClone(committed), idempotentReplay: true };
      }
      const existingId = state.idempotency.get(indexKey);
      const existing = existingId ? state.reservations.get(existingId) : undefined;
      if (existing) {
        assertDomain(existing.requestDigest === digest, "IDEMPOTENCY_CONFLICT", "The idempotency key was already used for different work.", 409);
        // Only live work replays. A released or expired reservation means the client is retrying
        // failed work under the standard retry contract, so it earns a fresh reservation.
        if (REPLAYABLE_STATES.has(existing.state)) {
          return { ...structuredClone(existing), idempotentReplay: true };
        }
      } else if (existingId) {
        state.idempotency.delete(indexKey);
      }

      const subscription = state.subscriptions.get(account.id) || null;
      const entitlement = resolveEntitlement(subscription, now, { graceMs: this.graceMs });
      const policy = getPolicyForEntitlement(entitlement);
      const requestedByBucket = new Map();
      const reservedItems = items.map((item) => {
        const { bucketAction, definition } = resolveAllowance(policy, item.action);
        const period = getAllowanceWindow(policy, item.action, now, subscription);
        const totals = countUsage(state, account.id, bucketAction, period.key);
        const requestBucketKey = bucketKey(bucketAction, period.key);
        const requestedInReservation = requestedByBucket.get(requestBucketKey) || 0;
        const remaining = definition.limit === null
          ? null
          : Math.max(
            0,
            definition.limit - totals.reserved - totals.committed - requestedInReservation
          );
        if (remaining !== null && item.units > remaining) {
          throw new HostedDomainError(
            "ALLOWANCE_EXHAUSTED",
            allowanceExhaustedMessage(item.action),
            402,
            {
              action: item.action,
              requested: item.units,
              remaining,
              periodEndsAt: period.end
            }
          );
        }
        requestedByBucket.set(requestBucketKey, requestedInReservation + item.units);
        return {
          action: item.action,
          bucketAction,
          unit: definition.unit,
          units: item.units,
          limit: definition.limit,
          periodKey: period.key,
          periodStart: period.start,
          periodEnd: period.end
        };
      });

      const reservation = {
        id: randomUUID(),
        accountId: account.id,
        idempotencyKey,
        requestDigest: digest,
        state: "reserved",
        policyVersion: policy.version,
        plan: policy.plan,
        items: reservedItems,
        createdAt: new Date(now).toISOString(),
        expiresAt: new Date(now + this.reservationTtlMs).toISOString(),
        committedAt: null,
        releasedAt: null,
        resultCode: null,
        resultReference: null
      };
      state.reservations.set(reservation.id, reservation);
      state.idempotency.set(indexKey, reservation.id);
      state.activeReservations.set(reservation.id, now + this.reservationTtlMs);
      applyTotals(state, reservation, "reserved", 1);
      return { ...structuredClone(reservation), idempotentReplay: false };
    });
  }

  async commit(reservationId, resultCode = "OK", resultReference = null) {
    return this.transition(reservationId, "committed", resultCode, resultReference);
  }

  async release(reservationId, resultCode = "ACTION_FAILED") {
    return this.transition(reservationId, "released", resultCode);
  }

  async transition(reservationId, targetState, resultCode, resultReference = null) {
    const result = await this.store.transaction((state) => {
      ensureIndexes(state);
      const reservation = state.reservations.get(String(reservationId || ""));
      assertDomain(reservation, "RESERVATION_NOT_FOUND", "The usage reservation was not found.", 404);
      if (reservation.state === targetState) {
        if (targetState === "committed") rememberCommittedReservation(state, reservation);
        return { ...structuredClone(reservation), idempotentReplay: true };
      }
      assertDomain(reservation.state === "reserved", "RESERVATION_FINALIZED", "The usage reservation has already been finalized.", 409);
      const now = this.now();
      if (Date.parse(reservation.expiresAt) <= now && targetState === "committed") {
        reservation.state = "expired";
        reservation.releasedAt = new Date(now).toISOString();
        reservation.resultCode = "RESERVATION_EXPIRED";
        finalizeIndexes(state, reservation, now);
        return { ...structuredClone(reservation), expiredDuringCommit: true };
      }
      reservation.state = targetState;
      reservation.resultCode = normalizeResultCode(resultCode);
      if (targetState === "committed") {
        reservation.committedAt = new Date(now).toISOString();
        reservation.resultReference = normalizeResultReference(resultReference, reservation.id);
      } else {
        reservation.releasedAt = new Date(now).toISOString();
      }
      finalizeIndexes(state, reservation, now);
      return { ...structuredClone(reservation), idempotentReplay: false };
    });
    if (result.expiredDuringCommit) {
      throw new HostedDomainError(
        "RESERVATION_EXPIRED",
        "The usage reservation expired before completion.",
        409
      );
    }
    return result;
  }
}

function normalizeItems(value) {
  assertDomain(Array.isArray(value) && value.length >= 1 && value.length <= 4, "INVALID_USAGE_ITEMS", "One to four usage items are required.", 400);
  const combined = new Map();
  for (const rawItem of value) {
    const action = String(rawItem?.action || "").toLowerCase();
    assertDomain(ALLOWED_ACTIONS.has(action), "UNKNOWN_ACTION", "The requested hosted action is not recognized.", 400);
    const units = Number(rawItem?.units);
    assertValidUsageUnits(action, units);
    combined.set(action, (combined.get(action) || 0) + units);
  }
  const normalized = [...combined.entries()]
    .map(([action, units]) => ({ action, units }))
    .sort((left, right) => left.action.localeCompare(right.action));
  for (const item of normalized) assertValidUsageUnits(item.action, item.units);
  return normalized;
}

function normalizeIdempotencyKey(value) {
  const key = String(value || "").trim();
  assertDomain(/^[a-zA-Z0-9._:-]{16,160}$/.test(key), "IDEMPOTENCY_REQUIRED", "A valid Idempotency-Key is required.", 400);
  return key;
}

function normalizeRequestFingerprint(value) {
  const fingerprint = String(value || "").trim().toLowerCase();
  assertDomain(
    /^[a-f0-9]{64}$/.test(fingerprint),
    "REQUEST_FINGERPRINT_REQUIRED",
    "A server-produced request fingerprint is required for hosted idempotency.",
    400
  );
  return fingerprint;
}

function digestReservation(items, requestFingerprint) {
  return createHash("sha256")
    .update(`${requestFingerprint}:${JSON.stringify(items)}`)
    .digest("hex");
}

function requireActiveAccount(state, accountId) {
  const account = state.accounts.get(String(accountId || ""));
  assertDomain(account, "ACCOUNT_NOT_FOUND", "The account was not found.", 404);
  assertDomain(account.state === "active", "ACCOUNT_UNAVAILABLE", "The account is not active.", 403);
  return account;
}

// The store keeps three derived indexes alongside `reservations`:
//   activeReservations    id -> expiry timestamp, only for reservations still in "reserved"
//   usageTotals           accountId -> bucket key -> running reserved/committed unit totals
//   finalizedReservations id -> finalization timestamp, in FIFO order for retention pruning
// They are rebuilt from scratch whenever a store hands over state that has none (fresh or seeded).
function ensureIndexes(state) {
  if (state.usageTotals instanceof Map
    && state.activeReservations instanceof Map
    && state.finalizedReservations instanceof Map
    && state.committedIdempotency instanceof Map) {
    return;
  }
  state.usageTotals = new Map();
  state.activeReservations = new Map();
  state.finalizedReservations = new Map();
  // Never discard a compact committed authority merely because another
  // derived index needs rebuilding.
  state.committedIdempotency = state.committedIdempotency instanceof Map
    ? state.committedIdempotency
    : new Map();
  for (const reservation of state.reservations.values()) {
    if (reservation.state === "reserved") {
      state.activeReservations.set(reservation.id, Date.parse(reservation.expiresAt));
      applyTotals(state, reservation, "reserved", 1);
      continue;
    }
    if (reservation.state === "committed") {
      applyTotals(state, reservation, "committed", 1);
      rememberCommittedReservation(state, reservation);
    }
    const finalizedAt = Date.parse(reservation.committedAt || reservation.releasedAt || reservation.createdAt);
    state.finalizedReservations.set(reservation.id, Number.isFinite(finalizedAt) ? finalizedAt : 0);
  }
}

function bucketKey(action, periodKey) {
  return `${action}\u0000${periodKey}`;
}

function applyTotals(state, reservation, field, sign) {
  let buckets = state.usageTotals.get(reservation.accountId);
  if (!buckets) {
    if (sign < 0) return;
    buckets = new Map();
    state.usageTotals.set(reservation.accountId, buckets);
  }
  for (const item of reservation.items) {
    const key = bucketKey(item.bucketAction || item.action, item.periodKey);
    let bucket = buckets.get(key);
    if (!bucket) {
      if (sign < 0) continue;
      bucket = { reserved: 0, committed: 0, periodEnd: item.periodEnd ? Date.parse(item.periodEnd) : null };
      buckets.set(key, bucket);
    }
    bucket[field] += sign * item.units;
    if (bucket.reserved <= 0 && bucket.committed <= 0) buckets.delete(key);
  }
  if (buckets.size === 0) state.usageTotals.delete(reservation.accountId);
}

function finalizeIndexes(state, reservation, now) {
  state.activeReservations.delete(reservation.id);
  applyTotals(state, reservation, "reserved", -1);
  if (reservation.state === "committed") {
    applyTotals(state, reservation, "committed", 1);
    rememberCommittedReservation(state, reservation);
  }
  state.finalizedReservations.set(reservation.id, now);
}

function expireReservations(state, now) {
  for (const [reservationId, expiresAt] of state.activeReservations) {
    if (expiresAt > now) continue;
    const reservation = state.reservations.get(reservationId);
    if (!reservation) {
      state.activeReservations.delete(reservationId);
      continue;
    }
    reservation.state = "expired";
    reservation.releasedAt = new Date(now).toISOString();
    reservation.resultCode = "RESERVATION_EXPIRED";
    finalizeIndexes(state, reservation, now);
  }
}

// Detailed finalized reservations are bounded, while compact committed tombstones survive
// pruning so a delayed retry can never run provider work or consume usage twice.
function pruneFinalizedReservations(state, now, retentionMs, maxRetained) {
  for (const [reservationId, finalizedAt] of state.finalizedReservations) {
    if (state.finalizedReservations.size <= maxRetained && finalizedAt + retentionMs > now) break;
    state.finalizedReservations.delete(reservationId);
    const reservation = state.reservations.get(reservationId);
    state.reservations.delete(reservationId);
    if (!reservation) continue;
    const indexKey = idempotencyIndex(reservation.accountId, reservation.idempotencyKey);
    if (state.idempotency.get(indexKey) === reservationId) state.idempotency.delete(indexKey);
  }
}

function pruneAccountBuckets(state, accountId, now) {
  const buckets = state.usageTotals.get(accountId);
  if (!buckets) return;
  for (const [key, bucket] of buckets) {
    if (bucket.periodEnd !== null && bucket.periodEnd <= now && bucket.reserved <= 0) buckets.delete(key);
  }
  if (buckets.size === 0) state.usageTotals.delete(accountId);
}

function countUsage(state, accountId, action, periodKey) {
  const bucket = state.usageTotals.get(accountId)?.get(bucketKey(action, periodKey));
  return {
    reserved: bucket ? Math.max(0, bucket.reserved) : 0,
    committed: bucket ? Math.max(0, bucket.committed) : 0
  };
}

function formatAllowance(action, definition, period, totals, bucketAction = action) {
  const formatted = {
    action,
    unit: definition.unit,
    limit: definition.limit,
    reserved: totals.reserved,
    committed: totals.committed,
    remaining: definition.limit === null
      ? null
      : Math.max(0, definition.limit - totals.reserved - totals.committed),
    period: {
      kind: period.kind,
      start: period.start,
      end: period.end
    }
  };
  if (bucketAction !== action) formatted.sharedWith = bucketAction;
  return formatted;
}

function allowanceExhaustedMessage(action) {
  const labels = {
    [ACTIONS.STUDY_BUILD]: "hosted study builds",
    [ACTIONS.QUIZ_BUILD]: "hosted quiz builds",
    [ACTIONS.VISUAL_FOLLOWUP]: "Visual Tutor follow-ups",
    [ACTIONS.JOURNEY_SUMMARY]: "Journey summaries",
    [ACTIONS.CLASSIFICATION_BATCH]: "classification batches",
    [ACTIONS.VIDEO_PROCESSING]: "hosted video processing time",
    [ACTIONS.MULTI_SOURCE_PREVIEW]: "multi-source previews"
  };
  return `No ${labels[action] || "hosted usage"} remain in this allowance period.`;
}

function normalizeResultCode(value) {
  return String(value || "ACTION_FAILED").toUpperCase().replace(/[^A-Z0-9_]/g, "_").slice(0, 80);
}

function assertValidUsageUnits(action, units) {
  assertDomain(
    isValidUsageUnits(action, units),
    "INVALID_USAGE_UNITS",
    action === ACTIONS.VIDEO_PROCESSING
      ? "Video usage must be a positive bounded millisecond count."
      : "Action and batch usage must contain exactly one unit.",
    400
  );
}

function normalizeResultReference(value, fallback) {
  const reference = String(value || fallback || "").trim();
  assertDomain(
    /^[A-Za-z0-9._:-]{1,255}$/.test(reference),
    "RESULT_REFERENCE_INVALID",
    "A committed hosted result requires a bounded opaque reference.",
    500
  );
  return reference;
}

function rememberCommittedReservation(state, reservation) {
  state.committedIdempotency.set(
    idempotencyIndex(reservation.accountId, reservation.idempotencyKey),
    createCommittedTombstone(reservation)
  );
}

function clampInteger(value, minimum, maximum, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(minimum, Math.min(maximum, Math.round(number))) : fallback;
}

module.exports = {
  UsageService,
  digestReservation,
  normalizeItems,
  normalizeRequestFingerprint
};
