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
    isHostedBackendRequested: (settings) => settings?.backendMode === "hosted",
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

test("all seven hosted-capable generation paths use the versioned transport adapter", () => {
  const adapterCalls = source
    .slice(0, source.indexOf("async function requestBackendAction("))
    .match(/requestBackendAction\(\{/g) || [];
  assert.equal(adapterCalls.length, 7);
  const quizBackend = sourceBetween("async function generateQuizWithBackend(", "function generateLocalQuizArtifact(");
  assert.match(
    quizBackend,
    /requestBackendAction\(\{[\s\S]*?routeName,[\s\S]*?action: HostedAccount\?\.ACTIONS\.QUIZ_BUILD/
  );
});

test("persisted hosted mode never rolls back to a custom endpoint when the feature is unavailable", () => {
  const harness = vm.runInNewContext(`(() => {
    ${sourceBetween("function getConfiguredApiEndpoint(settings)", "function getConfiguredCustomApiEndpoint(settings)")}
    return { getConfiguredApiEndpoint };
  })()`, {
    HostedAccount: {
      isHostedRequested: (settings) => settings?.backendMode === "hosted",
      buildApiUrl: () => "https://api.example.test/v1/generate"
    },
    hostedAccountConfig: { active: false },
    HOSTED_ACCOUNT_CONFIG: { enabled: false },
    getConfiguredCustomApiEndpoint: () => "https://custom.example.test/api/study-session"
  });

  assert.equal(harness.getConfiguredApiEndpoint({ backendMode: "hosted" }), "");
  assert.equal(
    harness.getConfiguredApiEndpoint({ backendMode: "custom" }),
    "https://custom.example.test/api/study-session"
  );
});

test("hosted transport wraps v1 generation, retries with one key, unwraps the result, and applies usage", async () => {
  const requests = [];
  let attempts = 0;
  const state = {
    hostedAccountSnapshot: {
      account: { id: "account-1", email: "learner@example.test" },
      entitlement: { plan: "free" },
      allowances: []
    },
    hostedAccessToken: "hosted-access-token"
  };
  const usage = {
    entitlement: { plan: "free", status: "free" },
    policyVersion: "free.v1",
    allowances: [{ action: "quiz_build", limit: 5, remaining: 4 }]
  };
  const context = {
    HOSTED_ACCOUNT_CONFIG: { enabled: true },
    HOSTED_SESSION_STORAGE_KEY: "hosted-session",
    STORAGE_KEYS: { settings: "settings" },
    HostedAccount: {
      isHostedRequested: (settings) => settings?.backendMode === "hosted",
      isHostedMode: (settings) => settings?.backendMode === "hosted",
      buildApiUrl: (_config, pathname) => `https://api.example.test${pathname}`,
      normalizeSnapshot: (snapshot) => snapshot
    },
    isHostedBackendRequested: (settings) => settings?.backendMode === "hosted",
    state,
    crypto: { randomUUID: () => "00000000-0000-4000-8000-000000000001" },
    fetch: async (url, options) => {
      requests.push({ url, options });
      attempts += 1;
      if (attempts === 1) throw new Error("response lost");
      return {
        ok: true,
        status: 200,
        json: async () => ({ result: { quizId: "quiz-1" }, usage })
      };
    },
    getMeteredBackendHeaders: async () => ({
      "Content-Type": "application/json",
      Authorization: "Bearer hosted-access-token"
    }),
    createHostedAccessError: (decision) => Object.assign(new Error(decision.code), decision),
    queueHostedAccessDialog: () => {},
    getStorage: async () => ({ backendMode: "hosted" }),
    renderHostedAccountUi: () => {},
    chrome: { storage: { session: { remove: (_key, callback) => callback() } } },
    Date,
    Math
  };
  const harness = vm.runInNewContext(`(() => {
    ${sourceBetween("async function requestBackendAction(", "async function getMeteredBackendHeaders(")}
    return { requestBackendAction };
  })()`, context);

  const outcome = await harness.requestBackendAction({
    settings: { backendMode: "hosted" },
    endpoint: "https://custom.example.test/api/recovery-quiz",
    routeName: "recovery-quiz",
    action: "quiz_build",
    input: { noteId: "note-1" }
  });

  assert.equal(requests.length, 2);
  assert.equal(requests[0].url, "https://api.example.test/v1/generate");
  assert.equal(requests[0].options.headers["Idempotency-Key"], requests[1].options.headers["Idempotency-Key"]);
  assert.deepEqual(
    JSON.parse(requests[0].options.body),
    { operation: "recovery_quiz", input: { noteId: "note-1" } }
  );
  assert.equal(outcome.payload.quizId, "quiz-1");
  assert.equal(state.hostedAccountSnapshot.policyVersion, "free.v1");
  assert.equal(state.hostedAccountSnapshot.allowances[0].remaining, 4);
});

test("hosted access tokens require a finite future expiry", () => {
  const harness = vm.runInNewContext(`(() => {
    ${sourceBetween("function normalizeHostedAccessToken(value, expiresAt)", "async function requestBackendAction(")}
    return { normalizeHostedAccessToken };
  })()`, { Date });
  const token = "hosted-session-access-token";
  assert.equal(harness.normalizeHostedAccessToken(token), "");
  assert.equal(harness.normalizeHostedAccessToken(token, "not-a-date"), "");
  assert.equal(
    harness.normalizeHostedAccessToken(token, new Date(Date.now() + 10_000).toISOString()),
    ""
  );
  assert.equal(
    harness.normalizeHostedAccessToken(token, new Date(Date.now() + 3_600_000).toISOString()),
    token
  );
});

test("hosted dialog chooses sign-in, upgrade, retry, or BYOB-only actions by account state", () => {
  const button = {
    dataset: {},
    textContent: "",
    hidden: false,
    classList: {
      toggle(_name, hidden) {
        button.hidden = hidden;
      }
    }
  };
  const elements = {
    hostedAllowanceDialog: {
      open: false,
      showModal() {
        this.open = true;
      }
    },
    hostedAllowanceDialogTitle: { textContent: "" },
    hostedAllowanceDialogMessage: { textContent: "" },
    hostedAllowanceDialogReset: {
      textContent: "",
      classList: { toggle() {} }
    },
    hostedUpgradeButton: button
  };
  const context = {
    hostedAccountConfig: { active: true },
    elements,
    state: { hostedAccountSnapshot: null },
    HostedAccount: {
      ACTION_LABELS: { quiz_build: "quiz builds" },
      resetLabel: () => "",
      planLabel: (snapshot) => snapshot?.entitlement?.plan === "student_pro" ? "Student Pro" : "Free"
    },
    safeHostedAccountMessage: (error) => error.message
  };
  const harness = vm.runInNewContext(`(() => {
    ${sourceBetween("function showHostedAccessDialog(error)", "async function handleHostedDialogPrimaryAction(")}
    return { showHostedAccessDialog };
  })()`, context);

  harness.showHostedAccessDialog({ code: "HOSTED_AUTH_REQUIRED", message: "Sign in." });
  assert.equal(button.dataset.hostedAction, "account");
  assert.equal(button.textContent, "Sign in");
  assert.equal(button.hidden, false);

  context.state.hostedAccountSnapshot = { entitlement: { plan: "free" } };
  harness.showHostedAccessDialog({
    code: "ALLOWANCE_EXHAUSTED",
    action: "quiz_build",
    message: "No quiz builds remain."
  });
  assert.equal(button.dataset.hostedAction, "pricing");
  assert.equal(button.textContent, "View Student Pro");
  assert.equal(button.hidden, false);

  context.state.hostedAccountSnapshot = { entitlement: { plan: "student_pro" } };
  harness.showHostedAccessDialog({
    code: "ALLOWANCE_EXHAUSTED",
    action: "quiz_build",
    message: "No quiz builds remain."
  });
  assert.equal(button.dataset.hostedAction, "");
  assert.equal(button.hidden, true, "an exhausted Pro account must not be upsold to the same plan");

  harness.showHostedAccessDialog({
    code: "HOSTED_ENTITLEMENT_UNAVAILABLE",
    message: "Usage could not be refreshed."
  });
  assert.equal(button.dataset.hostedAction, "retry");
  assert.equal(button.textContent, "Retry usage check");
  assert.equal(button.hidden, false);
});

test("allowance copy covers classification, Visual Tutor, multi-source, and requested video time", () => {
  const html = fs.readFileSync(path.join(root, "popup.html"), "utf8");
  assert.match(html, /id="classificationHostedAllowanceNotice"/);
  assert.match(source, /classificationHostedAllowanceNotice,\s*HostedAccount\?\.ACTIONS\.CLASSIFICATION_BATCH/);
  assert.match(source, /createHostedActionNotice\(HostedAccount\?\.ACTIONS\.VISUAL_FOLLOWUP\)/);
  assert.match(source, /multiSourceMeteringAction\(state\.hostedAccountSnapshot\)/);
  assert.match(source, /renderHostedVideoAllowanceNotice\(requestedMs\)/);
});

test("downgrade cannot gate existing artifacts, Journey evidence, or standard export", () => {
  const readPaths = [
    sourceBetween("function openPinnedArtifact()", "function updatePinnedArtifactControl()"),
    sourceBetween("async function openJourneyArtifact(", "async function handleBuildChapterLesson("),
    sourceBetween("async function handleOpenExport()", "function handleExportDocument()")
  ];
  for (const pathSource of readPaths) {
    assert.doesNotMatch(pathSource, /HostedAccount|hostedAccount|entitlement|allowance/i);
  }
});

test("the hosted session key records that nothing writes it yet", () => {
  const declaration = sourceBetween("const DEFAULT_API_ENDPOINT =", "const HOSTED_ACCOUNT_CONFIG =");
  assert.match(declaration, /HOSTED_SESSION_STORAGE_KEY/);
  assert.match(declaration, /no writer/i);
  assert.match(declaration, /chrome\.storage\.session/);
});
