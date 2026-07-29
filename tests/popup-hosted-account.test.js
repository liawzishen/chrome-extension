const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "popup.js"), "utf8");

function sourceBetween(startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.ok(start >= 0, `Missing ${startMarker}`);
  assert.ok(end > start, `Missing ${endMarker}`);
  return source.slice(start, end).trim();
}

test("hosted account buttons report their failure instead of rejecting silently", async () => {
  const initSource = sourceBetween("function init()", "function scheduleSourceRefresh(");
  const hostedButtons = [
    "hostedAccountWebButton",
    "hostedRefreshAccountButton",
    "hostedManageBillingButton",
    "hostedUpgradeButton"
  ];
  for (const button of hostedButtons) {
    const line = initSource
      .split("\n")
      .find((entry) => entry.includes(`elements.${button}?.addEventListener`));
    assert.ok(line, `Missing listener registration for ${button}`);
    assert.match(line, /handleHostedAccountAction\(/, button);
  }
  assert.doesNotMatch(initSource, /void refreshHostedAccount\(/);
  assert.doesNotMatch(initSource, /void openHostedWebPath\(/);

  const renderCalls = [];
  const statuses = [];
  const harness = vm.runInNewContext(`(() => {
    ${sourceBetween("async function handleHostedAccountAction(operation)", "async function openHostedWebPath(")}
    return { handleHostedAccountAction };
  })()`, {
    STORAGE_KEYS: { settings: "settings" },
    getStorage: async () => ({ backendMode: "hosted" }),
    renderHostedAccountUi: (settings, error) => renderCalls.push({ settings, error }),
    showStatus: (message, isError) => statuses.push({ message, isError }),
    safeHostedAccountMessage: (error) => error.message
  });

  const authError = Object.assign(new Error("Sign in before using hosted AI."), {
    code: "HOSTED_AUTH_REQUIRED",
    isHostedAccess: true
  });
  await harness.handleHostedAccountAction(async () => {
    throw authError;
  });
  assert.equal(renderCalls.length, 1);
  assert.deepEqual(renderCalls[0].settings, { backendMode: "hosted" });
  assert.equal(renderCalls[0].error, authError);
  assert.deepEqual(statuses, [{ message: "Sign in before using hosted AI.", isError: true }]);

  const resolved = await harness.handleHostedAccountAction(async () => "https://example.test/account");
  assert.equal(resolved, "https://example.test/account");
  assert.equal(renderCalls.length, 1, "a successful hosted action must not render an error");
  assert.equal(statuses.length, 1);
});

test("building a backend error never opens the hosted dialog by itself", () => {
  const dialogs = [];
  const harness = vm.runInNewContext(`(() => {
    ${sourceBetween("function backendRequestError(", "function safeHostedAccountMessage(")}
    return {
      backendRequestError,
      surfaceHostedAccessError: typeof surfaceHostedAccessError === "function" ? surfaceHostedAccessError : null
    };
  })()`, {
    HOSTED_ACCOUNT_CONFIG: { enabled: true },
    HostedAccount: {
      ACTIONS: { VIDEO_PROCESSING: "video_processing", QUIZ_BUILD: "quiz_build" },
      isHostedMode: (settings) => settings?.backendMode === "hosted"
    },
    queueHostedAccessDialog: (error) => dialogs.push(error)
  });

  const settings = { backendMode: "hosted" };
  const error = harness.backendRequestError(
    { status: 402 },
    { error: { code: "ALLOWANCE_EXHAUSTED", message: "No quiz builds remain.", details: { action: "quiz_build", remaining: 0 } } },
    "The quiz service could not generate questions.",
    { settings, action: "quiz_build" }
  );
  assert.equal(error.isHostedAccess, true);
  assert.equal(error.allowance?.action, "quiz_build");
  assert.equal(dialogs.length, 0, "the error factory must stay free of UI side effects");

  assert.equal(typeof harness.surfaceHostedAccessError, "function");
  assert.equal(harness.surfaceHostedAccessError(error, settings), error);
  assert.deepEqual(dialogs, [error]);

  harness.surfaceHostedAccessError(error, { backendMode: "custom" });
  assert.equal(dialogs.length, 1, "a bring-your-own-backend user must not see the hosted dialog");

  const plainError = harness.backendRequestError({ status: 500 }, {}, "Backend failed.", { settings });
  harness.surfaceHostedAccessError(plainError, settings);
  assert.equal(dialogs.length, 1, "non-hosted-access failures must not open the hosted dialog");
});

test("the six metered call sites, not the factory, decide to surface a hosted failure", () => {
  const surfaced = source.match(/throw surfaceHostedAccessError\(\s*\n\s*backendRequestError\(/g) || [];
  assert.equal(surfaced.length, 7, "every settings-aware throw site must opt in to the dialog");
  const bare = source.match(/throw backendRequestError\(/g) || [];
  assert.equal(bare.length, 1, "only refreshHostedAccount may throw an unsurfaced backend error");
});

test("refreshing the hosted account reads the entitlement from the usage response", async () => {
  const requested = [];
  const usageEntitlement = { plan: "pro", status: "active" };
  let usageOk = true;
  const context = {
    URL,
    HOSTED_ACCOUNT_CONFIG: { enabled: true },
    STORAGE_KEYS: { settings: "settings" },
    hostedAccountConfig: { active: true, apiOrigin: "https://api.example.test" },
    HostedAccount: {
      buildApiUrl: (_config, pathname) => `https://api.example.test${pathname}`,
      normalizeSnapshot: (snapshot) => snapshot
    },
    state: { hostedAccountSnapshot: null, hostedAccountRefresh: null, hostedAccessToken: "" },
    createHostedAccessError: (decision) => Object.assign(new Error(decision.code), decision),
    backendRequestError: (_response, _payload, fallback) => new Error(fallback),
    readHostedSession: async () => ({
      accessToken: "hosted-session-access-token",
      expiresAt: new Date(Date.now() + 3_600_000).toISOString()
    }),
    normalizeHostedAccessToken: (value) => String(value || ""),
    getStorage: async () => ({ backendMode: "hosted" }),
    renderHostedAccountUi: () => {},
    fetch: async (url) => {
      const pathname = new URL(url).pathname;
      requested.push(pathname);
      if (pathname === "/v1/me") {
        return { ok: true, json: async () => ({ account: { email: "learner@example.test" } }) };
      }
      if (pathname === "/v1/usage") {
        return {
          ok: usageOk,
          status: usageOk ? 200 : 503,
          json: async () => ({
            entitlement: usageEntitlement,
            policyVersion: "2026-07-01",
            allowances: [{ action: "quiz_build", remaining: 3 }]
          })
        };
      }
      return { ok: true, json: async () => ({ entitlement: { plan: "stale", status: "active" } }) };
    }
  };
  const harness = vm.runInNewContext(`(() => {
    ${sourceBetween("async function refreshHostedAccount({ force = false } = {})", "async function readHostedSession(")}
    return { refreshHostedAccount };
  })()`, context);

  const snapshot = await harness.refreshHostedAccount({ force: true });
  assert.deepEqual(requested, ["/v1/me", "/v1/usage"], "the entitlement request is redundant with usage");
  assert.equal(snapshot.entitlement, usageEntitlement);
  assert.equal(snapshot.policyVersion, "2026-07-01");
  assert.equal(context.state.hostedAccessToken, "hosted-session-access-token");

  usageOk = false;
  context.state.hostedAccountSnapshot = null;
  await assert.rejects(
    harness.refreshHostedAccount({ force: true }),
    /could not refresh your allowance/
  );
});

test("the journey summary batches its three independent storage reads", () => {
  const summarize = sourceBetween("async function handleSummarizeJourney(", "function renderJourneySummary(");
  assert.doesNotMatch(
    summarize,
    /const summaryStudyGoal = await getStudyGoal\(\)/,
    "the study goal must not be a third sequential storage round-trip"
  );
  assert.match(
    summarize,
    /const \[settings, storedFocus, summaryStudyGoal\] = await Promise\.all\(\[[\s\S]*?getStorage\(STORAGE_KEYS\.settings, \{\}\)[\s\S]*?getStorage\(STORAGE_KEYS\.focusState, \{\}\)\.catch\(\(\) => \(\{\}\)\)[\s\S]*?getStudyGoal\(\)\.catch\(\(\) => null\)[\s\S]*?\]\);/
  );
  assert.ok(
    summarize.indexOf("summaryStudyGoal] = await Promise.all([") < summarize.indexOf("studyGoal: summaryStudyGoal"),
    "the batched read must resolve before the summary uses it"
  );
});

test("quiz generation calls the metered header helper directly like its six siblings", () => {
  const quizBackend = sourceBetween("async function generateQuizWithBackend(", "function generateLocalQuizArtifact(");
  assert.doesNotMatch(quizBackend, /typeof getMeteredBackendHeaders/);
  assert.doesNotMatch(quizBackend, /typeof HostedAccount/);
  assert.doesNotMatch(
    quizBackend,
    /getBackendHeaders\(settings, endpoint\)/,
    "the dead fallback would send an unmetered, unauthenticated request"
  );
  assert.match(
    quizBackend,
    /headers: await getMeteredBackendHeaders\(\s*settings,\s*endpoint,\s*HostedAccount\?\.ACTIONS\.QUIZ_BUILD\s*\),/
  );
});

test("the hosted session key records that nothing writes it yet", () => {
  const declaration = sourceBetween("const DEFAULT_API_ENDPOINT =", "const HOSTED_ACCOUNT_CONFIG =");
  assert.match(declaration, /HOSTED_SESSION_STORAGE_KEY/);
  assert.match(declaration, /no writer/i);
  assert.match(declaration, /chrome\.storage\.session/);
});
