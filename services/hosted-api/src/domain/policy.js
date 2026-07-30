const { assertDomain } = require("./errors.js");

const ACTIONS = Object.freeze({
  STUDY_BUILD: "study_build",
  QUIZ_BUILD: "quiz_build",
  VISUAL_FOLLOWUP: "visual_followup",
  JOURNEY_SUMMARY: "journey_summary",
  CLASSIFICATION_BATCH: "classification_batch",
  VIDEO_PROCESSING: "video_processing",
  MULTI_SOURCE_PREVIEW: "multi_source_preview"
});
const MAX_USAGE_UNITS = 12 * 60 * 60 * 1000;

const POLICIES = Object.freeze({
  free: freezePolicy({
    plan: "free",
    version: "free.v1",
    features: {
      hostedAi: true,
      multiSourceHosted: false,
      typedAnswerEvaluation: false,
      scheduledFocus: false
    },
    allowances: {
      [ACTIONS.STUDY_BUILD]: allowance("action", 3, "free_calendar_month"),
      [ACTIONS.QUIZ_BUILD]: allowance("action", 5, "free_calendar_month"),
      [ACTIONS.VISUAL_FOLLOWUP]: allowance("action", 5, "free_calendar_month"),
      [ACTIONS.JOURNEY_SUMMARY]: allowance("action", 1, "free_calendar_month"),
      [ACTIONS.CLASSIFICATION_BATCH]: allowance("batch", 1, "free_calendar_month"),
      [ACTIONS.VIDEO_PROCESSING]: allowance("millisecond", 15 * 60 * 1000, "lifetime"),
      [ACTIONS.MULTI_SOURCE_PREVIEW]: allowance("action", 1, "lifetime")
    }
  }),
  student_pro: freezePolicy({
    plan: "student_pro",
    version: "student-pro.v1",
    features: {
      hostedAi: true,
      multiSourceHosted: true,
      typedAnswerEvaluation: false,
      scheduledFocus: false
    },
    allowances: {
      [ACTIONS.STUDY_BUILD]: allowance("action", 30, "subscription_month"),
      [ACTIONS.QUIZ_BUILD]: allowance("action", 60, "subscription_month"),
      [ACTIONS.VISUAL_FOLLOWUP]: allowance("action", 60, "subscription_month"),
      [ACTIONS.JOURNEY_SUMMARY]: allowance("action", 10, "subscription_month"),
      [ACTIONS.CLASSIFICATION_BATCH]: allowance("batch", 10, "subscription_month"),
      [ACTIONS.VIDEO_PROCESSING]: allowance("millisecond", 120 * 60 * 1000, "subscription_month"),
      // Student Pro multi-source lessons are included, but they consume the same
      // study-build allowance rather than receiving an independent unlimited bucket.
      [ACTIONS.MULTI_SOURCE_PREVIEW]: sharedAllowance(ACTIONS.STUDY_BUILD)
    }
  })
});

function allowance(unit, limit, periodKind) {
  return Object.freeze({ unit, limit, periodKind });
}

function sharedAllowance(bucketAction) {
  return Object.freeze({ bucketAction });
}

function freezePolicy(policy) {
  Object.freeze(policy.features);
  Object.values(policy.allowances).forEach(Object.freeze);
  Object.freeze(policy.allowances);
  return Object.freeze(policy);
}

// `options` is accepted for call-site compatibility but deliberately carries no
// grace fallback: grace has to come from a persisted deadline (see below).
function resolveEntitlement(subscription, nowValue = Date.now(), options = {}) {
  const now = toTimestamp(nowValue);
  if (!subscription) return freeEntitlement(now, "no_subscription");

  const status = String(subscription.status || "").toLowerCase();
  const effectiveStart = toOptionalTimestamp(subscription.effectiveStartAt ?? subscription.createdAt);
  const periodEnd = toOptionalTimestamp(subscription.currentPeriodEnd);
  // Grace must be a stored deadline written once when the payment first failed.
  // Deriving it from `now` here would restart the window on every single call,
  // so a permanently failing card would keep Pro forever.
  const graceEndsAt = toOptionalTimestamp(subscription.graceEndsAt);
  const started = effectiveStart === null || effectiveStart <= now;
  // Fail closed: an absent period end is missing data, not an unlimited licence.
  const inPaidPeriod = periodEnd !== null && now < periodEnd;
  const cancelAtPeriodEnd =
    Boolean(subscription.cancelAtPeriodEnd) ||
    status === "canceled_at_period_end";
  const paidStatus =
    status === "active" ||
    status === "trialing" ||
    status === "canceled_at_period_end";
  const inGrace = status === "past_due" && graceEndsAt !== null && now < graceEndsAt;

  if (subscription.revokedAt && toTimestamp(subscription.revokedAt) <= now) {
    return freeEntitlement(now, terminalEntitlementStatus(status));
  }
  if (started && ((paidStatus && inPaidPeriod) || inGrace)) {
    return {
      plan: "student_pro",
      policyVersion: POLICIES.student_pro.version,
      status: inGrace
        ? "grace_period"
        : cancelAtPeriodEnd ? "canceled_at_period_end" : status,
      effectiveStart: toIso(effectiveStart ?? now),
      effectiveEnd: toIso(inGrace ? graceEndsAt : periodEnd),
      cancelAtPeriodEnd,
      source: "subscription"
    };
  }
  if (started && paidStatus && periodEnd === null) {
    return freeEntitlement(now, "missing_period_end");
  }
  if (started && paidStatus && !inPaidPeriod) {
    return freeEntitlement(now, "expired");
  }
  if (["canceled", "expired", "incomplete_expired"].includes(status)) {
    return freeEntitlement(now, "expired");
  }
  return freeEntitlement(now, status || "inactive_subscription");
}

function terminalEntitlementStatus(status) {
  if (["refunded", "disputed"].includes(status)) return status;
  if (["canceled", "canceled_at_period_end", "expired", "incomplete_expired"].includes(status)) {
    return "expired";
  }
  return status === "revoked" ? "revoked" : "billing_revoked";
}

function freeEntitlement(now, status) {
  return {
    plan: "free",
    policyVersion: POLICIES.free.version,
    status,
    effectiveStart: toIso(now),
    effectiveEnd: null,
    cancelAtPeriodEnd: false,
    source: "policy"
  };
}

function getPolicyForEntitlement(entitlement) {
  return entitlement?.plan === "student_pro" ? POLICIES.student_pro : POLICIES.free;
}

function resolveAllowance(policy, action) {
  const requested = policy?.allowances?.[action];
  assertDomain(requested, "UNKNOWN_ACTION", "The requested hosted action is not recognized.", 400);
  const bucketAction = requested.bucketAction || action;
  const definition = policy?.allowances?.[bucketAction];
  assertDomain(
    definition && !definition.bucketAction,
    "ALLOWANCE_POLICY_INVALID",
    "The hosted allowance policy contains an invalid shared bucket.",
    500
  );
  return { bucketAction, definition };
}

function isValidUsageUnits(action, units) {
  return Number.isSafeInteger(units) &&
    units > 0 &&
    units <= MAX_USAGE_UNITS &&
    (action === ACTIONS.VIDEO_PROCESSING || units === 1);
}

function getAllowanceWindow(policy, action, nowValue = Date.now(), subscription = null) {
  const { bucketAction, definition } = resolveAllowance(policy, action);
  const now = toTimestamp(nowValue);
  if (definition.periodKind === "lifetime") {
    return {
      kind: "lifetime",
      key: `${policy.version}:${bucketAction}:lifetime`,
      start: "1970-01-01T00:00:00.000Z",
      end: null
    };
  }
  if (definition.periodKind === "free_calendar_month") {
    const date = new Date(now);
    const start = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1);
    const end = Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1);
    return {
      kind: definition.periodKind,
      key: `${policy.version}:${bucketAction}:${new Date(start).toISOString()}`,
      start: toIso(start),
      end: toIso(end)
    };
  }

  const anchor = toOptionalTimestamp(subscription?.allowanceAnchorAt ?? subscription?.effectiveStartAt ?? subscription?.createdAt);
  assertDomain(anchor !== null, "SUBSCRIPTION_ANCHOR_MISSING", "The subscription allowance anchor is missing.", 500);
  const { start, end } = getAnchoredMonthWindow(anchor, now);
  return {
    kind: "subscription_month",
    key: `${policy.version}:${bucketAction}:${toIso(start)}`,
    start: toIso(start),
    end: toIso(end)
  };
}

function getAnchoredMonthWindow(anchorValue, nowValue) {
  const anchor = toTimestamp(anchorValue);
  const now = toTimestamp(nowValue);
  assertDomain(now >= anchor, "ALLOWANCE_PERIOD_NOT_STARTED", "The subscription allowance period has not started.", 409);
  const anchorDate = new Date(anchor);
  const nowDate = new Date(now);
  let monthOffset = (nowDate.getUTCFullYear() - anchorDate.getUTCFullYear()) * 12
    + nowDate.getUTCMonth() - anchorDate.getUTCMonth();
  let start = addUtcMonthsClamped(anchor, monthOffset);
  while (start > now) {
    monthOffset -= 1;
    start = addUtcMonthsClamped(anchor, monthOffset);
  }
  let end = addUtcMonthsClamped(anchor, monthOffset + 1);
  while (end <= now) {
    monthOffset += 1;
    start = end;
    end = addUtcMonthsClamped(anchor, monthOffset + 1);
  }
  return { start, end };
}

function addUtcMonthsClamped(timestamp, monthOffset) {
  const source = new Date(timestamp);
  const targetMonthStart = new Date(Date.UTC(
    source.getUTCFullYear(),
    source.getUTCMonth() + monthOffset,
    1,
    source.getUTCHours(),
    source.getUTCMinutes(),
    source.getUTCSeconds(),
    source.getUTCMilliseconds()
  ));
  const finalDay = new Date(Date.UTC(
    targetMonthStart.getUTCFullYear(),
    targetMonthStart.getUTCMonth() + 1,
    0
  )).getUTCDate();
  targetMonthStart.setUTCDate(Math.min(source.getUTCDate(), finalDay));
  return targetMonthStart.getTime();
}

function toOptionalTimestamp(value) {
  if (value === undefined || value === null || value === "") return null;
  return toTimestamp(value);
}

function toTimestamp(value) {
  const timestamp = value instanceof Date ? value.getTime() : typeof value === "number" ? value : Date.parse(value);
  assertDomain(Number.isFinite(timestamp), "INVALID_TIMESTAMP", "A hosted-service timestamp is invalid.", 500);
  return timestamp;
}

function toIso(value) {
  return value === null || value === undefined ? null : new Date(value).toISOString();
}

module.exports = {
  ACTIONS,
  POLICIES,
  addUtcMonthsClamped,
  getAllowanceWindow,
  getAnchoredMonthWindow,
  getPolicyForEntitlement,
  isValidUsageUnits,
  resolveAllowance,
  resolveEntitlement
};
