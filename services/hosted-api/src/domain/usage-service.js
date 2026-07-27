const { createHash, randomUUID } = require("crypto");
const { assertDomain, HostedDomainError } = require("./errors.js");
const {
  ACTIONS,
  getAllowanceWindow,
  getPolicyForEntitlement,
  resolveEntitlement
} = require("./policy.js");

const ALLOWED_ACTIONS = new Set(Object.values(ACTIONS));

class UsageService {
  constructor(options) {
    assertDomain(options?.store, "STORE_REQUIRED", "A hosted usage store is required.", 500);
    this.store = options.store;
    this.now = typeof options.now === "function" ? options.now : Date.now;
    this.reservationTtlMs = clampInteger(options.reservationTtlMs, 30_000, 30 * 60_000, 10 * 60_000);
    this.graceMs = clampInteger(options.graceMs, 0, 30 * 24 * 60 * 60 * 1000, 3 * 24 * 60 * 60 * 1000);
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
      expireReservations(state, now);
      const subscription = state.subscriptions.get(account.id) || null;
      const entitlement = resolveEntitlement(subscription, now, { graceMs: this.graceMs });
      const policy = getPolicyForEntitlement(entitlement);
      const allowances = Object.entries(policy.allowances).map(([action, definition]) => {
        const period = getAllowanceWindow(policy, action, now, subscription);
        const totals = countUsage(state, account.id, action, period.key);
        return formatAllowance(action, definition, period, totals);
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
      expireReservations(state, now);
      const idempotencyIndex = `${account.id}:${idempotencyKey}`;
      const existingId = state.idempotency.get(idempotencyIndex);
      if (existingId) {
        const existing = state.reservations.get(existingId);
        assertDomain(existing?.requestDigest === digest, "IDEMPOTENCY_CONFLICT", "The idempotency key was already used for different work.", 409);
        return { ...structuredClone(existing), idempotentReplay: true };
      }

      const subscription = state.subscriptions.get(account.id) || null;
      const entitlement = resolveEntitlement(subscription, now, { graceMs: this.graceMs });
      const policy = getPolicyForEntitlement(entitlement);
      const reservedItems = items.map((item) => {
        const definition = policy.allowances[item.action];
        assertDomain(definition, "UNKNOWN_ACTION", "The requested hosted action is not recognized.", 400);
        const period = getAllowanceWindow(policy, item.action, now, subscription);
        const totals = countUsage(state, account.id, item.action, period.key);
        const remaining = definition.limit === null
          ? null
          : Math.max(0, definition.limit - totals.reserved - totals.committed);
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
        return {
          action: item.action,
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
        resultCode: null
      };
      state.reservations.set(reservation.id, reservation);
      state.idempotency.set(idempotencyIndex, reservation.id);
      return { ...structuredClone(reservation), idempotentReplay: false };
    });
  }

  async commit(reservationId, resultCode = "OK") {
    return this.transition(reservationId, "committed", resultCode);
  }

  async release(reservationId, resultCode = "ACTION_FAILED") {
    return this.transition(reservationId, "released", resultCode);
  }

  async transition(reservationId, targetState, resultCode) {
    const result = await this.store.transaction((state) => {
      const reservation = state.reservations.get(String(reservationId || ""));
      assertDomain(reservation, "RESERVATION_NOT_FOUND", "The usage reservation was not found.", 404);
      if (reservation.state === targetState) return { ...structuredClone(reservation), idempotentReplay: true };
      assertDomain(reservation.state === "reserved", "RESERVATION_FINALIZED", "The usage reservation has already been finalized.", 409);
      const now = this.now();
      if (Date.parse(reservation.expiresAt) <= now && targetState === "committed") {
        reservation.state = "expired";
        reservation.releasedAt = new Date(now).toISOString();
        reservation.resultCode = "RESERVATION_EXPIRED";
        return { ...structuredClone(reservation), expiredDuringCommit: true };
      }
      reservation.state = targetState;
      reservation.resultCode = normalizeResultCode(resultCode);
      if (targetState === "committed") reservation.committedAt = new Date(now).toISOString();
      else reservation.releasedAt = new Date(now).toISOString();
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
    assertDomain(Number.isSafeInteger(units) && units > 0 && units <= 12 * 60 * 60 * 1000, "INVALID_USAGE_UNITS", "Usage units must be a positive bounded integer.", 400);
    combined.set(action, (combined.get(action) || 0) + units);
  }
  return [...combined.entries()]
    .map(([action, units]) => ({ action, units }))
    .sort((left, right) => left.action.localeCompare(right.action));
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

function expireReservations(state, now) {
  for (const reservation of state.reservations.values()) {
    if (reservation.state === "reserved" && Date.parse(reservation.expiresAt) <= now) {
      reservation.state = "expired";
      reservation.releasedAt = new Date(now).toISOString();
      reservation.resultCode = "RESERVATION_EXPIRED";
    }
  }
}

function countUsage(state, accountId, action, periodKey) {
  const totals = { reserved: 0, committed: 0 };
  for (const reservation of state.reservations.values()) {
    if (reservation.accountId !== accountId || !["reserved", "committed"].includes(reservation.state)) continue;
    const matching = reservation.items.find((item) => item.action === action && item.periodKey === periodKey);
    if (matching) totals[reservation.state] += matching.units;
  }
  return totals;
}

function formatAllowance(action, definition, period, totals) {
  return {
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
