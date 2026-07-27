const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const Hosted = require("../hosted-account-utils.js");

const root = path.resolve(__dirname, "..");
const popupHtml = fs.readFileSync(path.join(root, "popup.html"), "utf8");
const popupSource = fs.readFileSync(path.join(root, "popup.js"), "utf8");

const activeConfig = Object.freeze({
  enabled: true,
  apiOrigin: "https://api.exam-cram.test",
  allowedApiOrigins: Object.freeze(["https://api.exam-cram.test"])
});

function snapshot(overrides = {}) {
  return {
    account: { id: "acct-1", email: "learner@example.test", state: "active" },
    entitlement: { plan: "free", status: "free" },
    allowances: [{
      action: Hosted.ACTIONS.STUDY_BUILD,
      unit: "action",
      limit: 3,
      committed: 1,
      reserved: 0,
      remaining: 2,
      period: {
        kind: "free_calendar_month",
        start: "2026-07-01T00:00:00.000Z",
        end: "2026-08-01T00:00:00.000Z"
      }
    }],
    refreshedAt: "2026-07-28T00:00:00.000Z",
    ...overrides
  };
}

test("hosted accounts are false-by-default and require an allowlisted HTTPS origin", () => {
  assert.deepEqual(
    Hosted.resolveConfig({ enabled: false, apiOrigin: "", allowedApiOrigins: [] }),
    {
      enabled: false,
      active: false,
      reason: "disabled",
      apiOrigin: "",
      allowedApiOrigins: []
    }
  );
  assert.equal(Hosted.resolveConfig({
    enabled: true,
    apiOrigin: "http://api.example.test",
    allowedApiOrigins: ["http://api.example.test"]
  }).active, false);
  assert.equal(Hosted.resolveConfig({
    enabled: true,
    apiOrigin: "https://api.example.test",
    allowedApiOrigins: ["https://other.example.test"]
  }).reason, "origin_not_allowlisted");
  assert.equal(Hosted.resolveConfig(activeConfig).active, true);
  assert.equal(Hosted.buildApiUrl(activeConfig, "/v1/usage"), "https://api.exam-cram.test/v1/usage");
  assert.equal(Hosted.buildApiUrl(activeConfig, "https://evil.example/v1/usage"), "");
});

test("custom and local modes bypass hosted decisions without consuming an allowance", () => {
  assert.deepEqual(
    Hosted.decideAction({
      settings: { backendMode: "custom" },
      config: activeConfig,
      snapshot: null,
      action: Hosted.ACTIONS.STUDY_BUILD
    }),
    {
      hosted: false,
      allowed: true,
      code: "NOT_HOSTED",
      action: Hosted.ACTIONS.STUDY_BUILD,
      units: 0
    }
  );
});

test("explicit hosted mode fails closed without config, authentication, or an action allowance", () => {
  const settings = { backendMode: "hosted" };
  assert.equal(Hosted.decideAction({
    settings,
    config: { ...activeConfig, allowedApiOrigins: [] },
    snapshot: snapshot(),
    action: Hosted.ACTIONS.STUDY_BUILD
  }).code, "HOSTED_FEATURE_UNAVAILABLE");
  assert.equal(Hosted.decideAction({
    settings,
    config: activeConfig,
    snapshot: null,
    action: Hosted.ACTIONS.STUDY_BUILD
  }).code, "HOSTED_ENTITLEMENT_UNAVAILABLE");
  assert.equal(Hosted.decideAction({
    settings,
    config: activeConfig,
    snapshot: { account: null, allowances: [] },
    action: Hosted.ACTIONS.STUDY_BUILD
  }).code, "HOSTED_AUTH_REQUIRED");
  assert.equal(Hosted.decideAction({
    settings,
    config: activeConfig,
    snapshot: snapshot(),
    action: Hosted.ACTIONS.QUIZ_BUILD
  }).code, "HOSTED_ENTITLEMENT_UNAVAILABLE");
});

test("hosted decision permits available units and rejects exhausted allowances", () => {
  const settings = { backendMode: "hosted" };
  const available = Hosted.decideAction({
    settings,
    config: activeConfig,
    snapshot: snapshot(),
    action: Hosted.ACTIONS.STUDY_BUILD,
    units: 2
  });
  assert.equal(available.allowed, true);
  assert.equal(available.code, "ALLOWANCE_AVAILABLE");

  const exhausted = Hosted.decideAction({
    settings,
    config: activeConfig,
    snapshot: snapshot(),
    action: Hosted.ACTIONS.STUDY_BUILD,
    units: 3
  });
  assert.equal(exhausted.allowed, false);
  assert.equal(exhausted.code, "ALLOWANCE_EXHAUSTED");
  assert.equal(exhausted.allowance.remaining, 2);
});

test("allowance copy is bounded and never calls a finite plan unlimited", () => {
  assert.equal(
    Hosted.allowanceLabel(snapshot().allowances[0]),
    "study builds: 2 remaining"
  );
  assert.equal(Hosted.allowanceLabel({
    action: Hosted.ACTIONS.VIDEO_PROCESSING,
    unit: "millisecond",
    limit: 120 * 60 * 1000,
    remaining: 61 * 60 * 1000,
    period: {}
  }), "video processing: 61 min remaining");
  assert.equal(Hosted.allowanceLabel({
    action: Hosted.ACTIONS.MULTI_SOURCE_PREVIEW,
    unit: "action",
    limit: null,
    remaining: null,
    period: {}
  }), "multi-source previews: included");
});

test("dormant account UI and helper stay packaged behind the explicit disabled flag", () => {
  assert.match(popupHtml, /id="hostedAccountSection"[^>]*class="[^"]*hidden/);
  assert.match(popupHtml, /<script src="hosted-account-utils\.js"><\/script>[\s\S]*<script src="popup\.js"><\/script>/);
  assert.match(
    popupSource,
    /const HOSTED_ACCOUNT_CONFIG = Object\.freeze\(\{\s*enabled: false,\s*apiOrigin: "",\s*allowedApiOrigins: Object\.freeze\(\[\]\)/
  );
  assert.match(popupSource, /function getMeteredBackendHeaders\(/);
  assert.match(popupSource, /HOSTED_ENTITLEMENT_UNAVAILABLE/);
});
