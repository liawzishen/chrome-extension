const test = require("node:test");
const assert = require("node:assert/strict");
const {
  ACTIONS,
  POLICIES,
  getAllowanceWindow,
  getAnchoredMonthWindow,
  resolveEntitlement
} = require("../services/hosted-api/src/domain/policy.js");

test("accounts without a paid subscription resolve to the versioned Free policy", () => {
  const now = Date.parse("2026-07-28T12:00:00.000Z");
  assert.deepEqual(resolveEntitlement(null, now), {
    plan: "free",
    policyVersion: "free.v1",
    status: "no_subscription",
    effectiveStart: "2026-07-28T12:00:00.000Z",
    effectiveEnd: null,
    cancelAtPeriodEnd: false,
    source: "policy"
  });
});

test("active and trialing subscriptions receive Student Pro through the paid period", () => {
  const now = Date.parse("2026-07-28T12:00:00.000Z");
  for (const status of ["active", "trialing"]) {
    const entitlement = resolveEntitlement({
      status,
      createdAt: "2026-07-01T00:00:00.000Z",
      currentPeriodEnd: "2026-08-01T00:00:00.000Z",
      cancelAtPeriodEnd: status === "active"
    }, now);
    assert.equal(entitlement.plan, "student_pro");
    assert.equal(entitlement.status, status);
    assert.equal(entitlement.cancelAtPeriodEnd, status === "active");
  }
});

test("past-due subscriptions only retain Pro during an explicitly dated grace period", () => {
  const beforeEnd = resolveEntitlement({
    status: "past_due",
    createdAt: "2026-07-01T00:00:00.000Z",
    currentPeriodEnd: "2026-07-28T00:00:00.000Z",
    graceEndsAt: "2026-07-31T00:00:00.000Z"
  }, "2026-07-30T00:00:00.000Z");
  const afterEnd = resolveEntitlement({
    status: "past_due",
    createdAt: "2026-07-01T00:00:00.000Z",
    currentPeriodEnd: "2026-07-28T00:00:00.000Z",
    graceEndsAt: "2026-07-31T00:00:00.000Z"
  }, "2026-08-01T00:00:00.000Z");
  assert.equal(beforeEnd.plan, "student_pro");
  assert.equal(beforeEnd.status, "grace");
  assert.equal(afterEnd.plan, "free");
});

test("revocation overrides an otherwise active paid period", () => {
  const entitlement = resolveEntitlement({
    status: "active",
    createdAt: "2026-07-01T00:00:00.000Z",
    currentPeriodEnd: "2026-08-01T00:00:00.000Z",
    revokedAt: "2026-07-15T00:00:00.000Z"
  }, "2026-07-28T00:00:00.000Z");
  assert.equal(entitlement.plan, "free");
  assert.equal(entitlement.status, "billing_revoked");
});

test("Free allowances reset at the first instant of each UTC calendar month", () => {
  const july = getAllowanceWindow(
    POLICIES.free,
    ACTIONS.STUDY_BUILD,
    "2026-07-31T23:59:59.999Z"
  );
  const august = getAllowanceWindow(
    POLICIES.free,
    ACTIONS.STUDY_BUILD,
    "2026-08-01T00:00:00.000Z"
  );
  assert.equal(july.start, "2026-07-01T00:00:00.000Z");
  assert.equal(july.end, "2026-08-01T00:00:00.000Z");
  assert.equal(august.start, "2026-08-01T00:00:00.000Z");
  assert.notEqual(july.key, august.key);
});

test("subscription-month windows clamp month-end anchors without drifting", () => {
  const anchor = "2024-01-31T10:15:00.000Z";
  const february = getAnchoredMonthWindow(anchor, "2024-02-29T10:15:00.000Z");
  const march = getAnchoredMonthWindow(anchor, "2024-03-30T10:15:00.000Z");
  assert.equal(new Date(february.start).toISOString(), "2024-02-29T10:15:00.000Z");
  assert.equal(new Date(february.end).toISOString(), "2024-03-31T10:15:00.000Z");
  assert.equal(new Date(march.start).toISOString(), "2024-02-29T10:15:00.000Z");
  assert.equal(new Date(march.end).toISOString(), "2024-03-31T10:15:00.000Z");
});

test("the launch policy encodes the approved bounded allowances", () => {
  assert.equal(POLICIES.free.allowances[ACTIONS.STUDY_BUILD].limit, 3);
  assert.equal(POLICIES.free.allowances[ACTIONS.QUIZ_BUILD].limit, 5);
  assert.equal(POLICIES.free.allowances[ACTIONS.VIDEO_PROCESSING].limit, 15 * 60 * 1000);
  assert.equal(POLICIES.student_pro.allowances[ACTIONS.STUDY_BUILD].limit, 30);
  assert.equal(POLICIES.student_pro.allowances[ACTIONS.QUIZ_BUILD].limit, 60);
  assert.equal(POLICIES.student_pro.allowances[ACTIONS.VIDEO_PROCESSING].limit, 120 * 60 * 1000);
  assert.equal(POLICIES.student_pro.allowances[ACTIONS.MULTI_SOURCE_PREVIEW].limit, null);
});
