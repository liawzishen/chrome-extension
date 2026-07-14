const test = require("node:test");
const assert = require("node:assert/strict");

const Focus = require("../focus-utils.js");

test("normalizes bounded domain and path rules without accepting raw URLs", () => {
  const rules = Focus.normalizeFocusRules([
    { id: "video", domain: "YouTube.COM.", path: "/shorts/**" },
    { domain: "youtube.com", path: "/shorts/*" },
    { domain: "bücher.de" }
  ]);

  assert.deepEqual(rules, [
    { id: "video", domain: "youtube.com", path: "/shorts/*" },
    { id: "rule-3", domain: "xn--bcher-kva.de", path: "/*" }
  ]);
  assert.deepEqual(Focus.getRequiredOrigins(rules), [
    "*://*.youtube.com/*",
    "*://*.xn--bcher-kva.de/*"
  ]);
});

test("rejects localhost, internal hosts, schemes, ports, and unsafe path syntax", () => {
  const unsafeDomains = [
    "localhost",
    "127.0.0.2",
    "0.0.0.0",
    "router.local",
    "company.internal",
    "home.arpa",
    "chrome://settings",
    "https://example.com",
    "example.com:8080",
    "intranet"
  ];
  unsafeDomains.forEach((domain) => {
    assert.throws(() => Focus.normalizeFocusRule({ domain }), Focus.FocusError);
  });

  ["//elsewhere", "/watch?x=1", "/watch#part", "/watch^evil", "/(watch|shorts)/", "/has space"]
    .forEach((path) => {
      assert.throws(() => Focus.normalizeFocusRule({ domain: "example.com", path }), Focus.FocusError);
    });
});

test("compiles only deterministic main-frame session rules in its reserved range", () => {
  const rules = Focus.buildSessionDnrRules([
    { domain: "example.com" },
    { domain: "video.example.org", path: "/shorts/*" }
  ]);

  assert.deepEqual(rules, [
    {
      id: Focus.DNR_RULE_ID_BASE,
      priority: 1,
      action: { type: "block" },
      condition: { urlFilter: "||example.com^", resourceTypes: ["main_frame"] }
    },
    {
      id: Focus.DNR_RULE_ID_BASE + 1,
      priority: 1,
      action: { type: "block" },
      condition: { urlFilter: "||video.example.org/shorts/*", resourceTypes: ["main_frame"] }
    }
  ]);
  assert.equal(Focus.isManagedRuleId(Focus.DNR_RULE_ID_BASE), true);
  assert.equal(Focus.isManagedRuleId(Focus.DNR_RULE_ID_LIMIT), false);
});

test("uses the stored deadline as authority and restores blocking after a fixed break", () => {
  const start = 1_700_000_000_000;
  const active = Focus.startFocusState(
    Focus.createDefaultFocusState(start),
    { durationMinutes: 25, rules: [{ domain: "example.com" }] },
    start,
    "session-1"
  );

  assert.equal(active.endsAt, start + 25 * 60 * 1000);
  assert.equal(Focus.shouldBlock(active, start + 1000), true);

  const onBreak = Focus.applyFiveMinuteBreak(active, start + 60 * 1000);
  assert.equal(onBreak.breakUntil, start + 6 * 60 * 1000);
  assert.equal(Focus.shouldBlock(onBreak, start + 2 * 60 * 1000), false);

  const repeatedBreak = Focus.applyFiveMinuteBreak(onBreak, start + 2 * 60 * 1000);
  assert.equal(repeatedBreak.breakUntil, onBreak.breakUntil);

  const afterBreak = Focus.reconcileFocusState(onBreak, onBreak.breakUntil).state;
  assert.equal(afterBreak.breakUntil, null);
  assert.equal(Focus.shouldBlock(afterBreak, onBreak.breakUntil), true);

  const completed = Focus.reconcileFocusState(afterBreak, active.endsAt + 60_000).state;
  assert.equal(completed.active, false);
  assert.equal(completed.history.at(-1).outcome, "completed");
  assert.equal(completed.history.at(-1).endedAt, active.endsAt);
});

test("manual stop and replacement are idempotent and history remains bounded", () => {
  const base = 1_700_000_000_000;
  let state = Focus.createDefaultFocusState(base);

  state = Focus.startFocusState(
    state,
    { durationMinutes: 10, rules: [{ domain: "example.com" }] },
    base,
    "first"
  );
  state = Focus.startFocusState(
    state,
    { durationMinutes: 20, rules: [{ domain: "example.org" }] },
    base + 60_000,
    "second"
  );
  assert.equal(state.history.at(-1).outcome, "replaced");

  state = Focus.stopFocusState(state, base + 120_000, "stopped");
  const historyLength = state.history.length;
  state = Focus.stopFocusState(state, base + 180_000, "stopped");
  assert.equal(state.history.length, historyLength);

  for (let index = 0; index < Focus.MAX_HISTORY + 5; index += 1) {
    const now = base + (index + 10) * 600_000;
    state = Focus.startFocusState(
      state,
      { durationMinutes: 1, rules: [{ domain: "example.com" }] },
      now,
      `bounded-${index}`
    );
    state = Focus.stopFocusState(state, now + 30_000, "stopped");
  }
  assert.equal(state.history.length, Focus.MAX_HISTORY);
  assert.equal(state.history.at(-1).sessionId, `bounded-${Focus.MAX_HISTORY + 4}`);
});

test("validates focus duration and active-break requirements", () => {
  assert.throws(() => Focus.normalizeDurationMinutes(0), /between 1 and 720/);
  assert.throws(() => Focus.normalizeDurationMinutes(12.5), /whole number/);
  assert.throws(
    () => Focus.applyFiveMinuteBreak(Focus.createDefaultFocusState(1000), 1000),
    (error) => error.code === "NO_ACTIVE_FOCUS"
  );
});

test("resolves preset and custom durations and restores a non-preset selection", () => {
  assert.equal(Focus.resolveDurationMinutes("25", ""), 25);
  assert.equal(Focus.resolveDurationMinutes("custom", "137"), 137);
  assert.throws(() => Focus.resolveDurationMinutes("custom", "12.5"), /whole number/);
  assert.deepEqual(Focus.getDurationControlState(25), {
    selection: "25",
    customDuration: 25,
    isCustom: false
  });
  assert.deepEqual(Focus.getDurationControlState(137), {
    selection: "custom",
    customDuration: 137,
    isCustom: true
  });
});

test("reports truthful wall-clock focus session time", () => {
  const state = Focus.startFocusState(
    Focus.createDefaultFocusState(1_000),
    { durationMinutes: 37, rules: [{ domain: "example.com" }] },
    1_000,
    "custom-duration"
  );
  assert.equal(Focus.getPlannedDurationMinutes(state), 37);
  assert.equal(Focus.FOCUS_SESSION_TIME_LABEL, "Focus session time");
  assert.equal(Focus.getRecordedSessionTimeMinutes([
    { elapsedMs: 10 * 60_000 },
    { elapsedMinutes: 5 },
    { elapsedMs: -100 }
  ]), 15);
  assert.equal(Focus.formatElapsedFocusTime(12_500), "<1 min");
  assert.equal(Focus.formatElapsedFocusTime(90_000), "2 min");
});

test("builds a permission request plan from only origins that are still missing", () => {
  const manifest = { optional_host_permissions: [Focus.GLOBAL_OPTIONAL_HOST_PATTERN] };
  const plan = Focus.createFocusPermissionPlan(
    [
      { domain: "youtube.com", path: "/shorts/*" },
      { domain: "reddit.com" }
    ],
    ["*://*.youtube.com/*"],
    manifest
  );

  assert.deepEqual(plan, {
    requiredOrigins: ["*://*.youtube.com/*", "*://*.reddit.com/*"],
    missingOrigins: ["*://*.reddit.com/*"],
    requestOriginPattern: "*://*/*"
  });
});

test("turns stale permission manifests and Chrome's raw mismatch into a reload instruction", () => {
  const staleManifest = { optional_host_permissions: ["https://*/*"] };
  assert.throws(
    () => Focus.validateFocusPermissionManifest(staleManifest),
    (error) => (
      error.code === "EXTENSION_RELOAD_REQUIRED"
      && error.message === "Reload Exam-Cram from chrome://extensions to activate updated permissions."
    )
  );

  const mapped = Focus.toFocusPermissionRequestError(
    new Error("Only permissions specified in the manifest may be requested."),
    { optional_host_permissions: [Focus.GLOBAL_OPTIONAL_HOST_PATTERN] }
  );
  assert.equal(mapped.code, "EXTENSION_RELOAD_REQUIRED");
  assert.equal(mapped.message, Focus.EXTENSION_RELOAD_REQUIRED_MESSAGE);
});
