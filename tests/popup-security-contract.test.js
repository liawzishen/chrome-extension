const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const popupSource = fs.readFileSync(path.join(root, "popup.js"), "utf8");
const journeySource = fs.readFileSync(path.join(root, "journey-page.js"), "utf8");
const backgroundSource = fs.readFileSync(path.join(root, "background.js"), "utf8");

function sourceBetween(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.ok(start >= 0, `Missing ${startMarker}`);
  assert.ok(end > start, `Missing ${endMarker}`);
  return source.slice(start, end).trim();
}

function evaluateFunction(source) {
  return vm.runInNewContext(`(${source})`, { URL });
}

test("saved source links allow only explicit web URLs at their final open boundary", () => {
  const popupNormalizer = evaluateFunction(sourceBetween(
    popupSource,
    "function normalizeSafeExternalUrl(value, options = {})",
    "async function openSafeExternalUrl("
  ));
  const journeyNormalizer = evaluateFunction(sourceBetween(
    journeySource,
    "function normalizeSafeExternalUrl(value)",
    "function normalizeSavedArtifacts("
  ));

  for (const unsafe of [
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "blob:https://example.test/id",
    "chrome-extension://abcdefghijklmnopabcdefghijklmnop/popup.html",
    "file:///C:/private.txt",
    "not a URL"
  ]) {
    assert.equal(popupNormalizer(unsafe), "", unsafe);
    assert.equal(journeyNormalizer(unsafe), "", unsafe);
  }

  assert.equal(
    popupNormalizer("https://user:password@example.test/lesson?q=1"),
    "https://example.test/lesson?q=1"
  );
  assert.equal(journeyNormalizer("http://example.test/source"), "http://example.test/source");
  assert.equal(popupNormalizer("file:///C:/notes.pdf", { allowFile: true }), "file:///C:/notes.pdf");
});

test("backend access tokens are sent only to their persisted endpoint origin", () => {
  const harness = vm.runInNewContext(`(() => {
    const DEFAULT_API_ENDPOINT = "http://127.0.0.1:8787/api/study-session";
    ${sourceBetween(popupSource, "function getConfiguredApiEndpoint(settings)", "function isLoopbackBackendHost(")}
    ${sourceBetween(popupSource, "function isLoopbackBackendHost(hostname)", "function getEndpointOrigin(")}
    ${sourceBetween(popupSource, "function getEndpointOrigin(value)", "function normalizeSafeBackendEndpoint(")}
    ${sourceBetween(popupSource, "function normalizeSafeBackendEndpoint(value)", "function normalizeSafeExternalUrl(")}
    ${sourceBetween(popupSource, "function getBackendHeaders(settings = {}, endpoint = \"\", extraHeaders = {})", "function startProgress(")}
    return { getBackendHeaders };
  })()`, { URL });

  const settings = {
    apiEndpoint: "https://api-a.example.test/api/study-session",
    backendAccessToken: "origin-bound-test-token",
    backendTokenOrigin: "https://api-a.example.test"
  };
  const sameOrigin = harness.getBackendHeaders(settings, "https://api-a.example.test/api/notes");
  const otherOrigin = harness.getBackendHeaders(settings, "https://api-b.example.test/api/notes");

  assert.equal(sameOrigin.Authorization, "Bearer origin-bound-test-token");
  assert.equal(Object.hasOwn(otherOrigin, "Authorization"), false);

  const workerBinding = sourceBetween(
    backgroundSource,
    "function getBoundBackendAccessToken(settings, endpoint)",
    "async function loadVideoCaptureState("
  );
  assert.match(workerBinding, /requestOrigin === tokenOrigin \? token : ""/);
});

test("saving a changed endpoint cannot silently re-bind the previous origin's token", async () => {
  const saveSettingsSource = sourceBetween(
    popupSource,
    "async function saveSettings(event)",
    "function requestEndpointPermission("
  );
  const writes = [];
  const statuses = [];
  let closeCount = 0;
  let prevented = false;
  const previousSettings = {
    apiEndpoint: "https://api-a.example.test/api/study-session",
    backendAccessToken: "old-origin-test-token",
    backendTokenOrigin: "https://api-a.example.test"
  };
  const context = {
    URL,
    STORAGE_KEYS: { settings: "settings" },
    elements: {
      apiEndpointInput: {
        value: "https://api-b.example.test/api/study-session",
        dataset: { backendTokenOrigin: "https://api-a.example.test" }
      },
      backendTokenInput: { value: "old-origin-test-token" },
      settingsDialog: { close: () => { closeCount += 1; } }
    },
    getStorage: async () => previousSettings,
    normalizeSafeBackendEndpoint: (value) => new URL(value).toString(),
    requestEndpointPermission: async () => true,
    getEndpointOrigin: (value) => new URL(value).origin,
    getConfiguredApiEndpoint: (settings) => settings.apiEndpoint,
    setStorage: async (key, value) => {
      writes.push({ key, value: JSON.parse(JSON.stringify(value)) });
    },
    showStatus: (message, isError) => statuses.push({ message, isError })
  };
  vm.runInNewContext(`${saveSettingsSource}\nglobalThis.runSaveSettings = saveSettings;`, context);

  await context.runSaveSettings({ preventDefault: () => { prevented = true; } });

  assert.equal(prevented, true);
  assert.deepEqual(writes, [{
    key: "settings",
    value: {
      apiEndpoint: "https://api-b.example.test/api/study-session",
      backendAccessToken: "",
      backendTokenOrigin: ""
    }
  }]);
  assert.equal(context.elements.backendTokenInput.value, "");
  assert.equal(closeCount, 0);
  assert.equal(statuses.at(-1)?.isError, true);
  assert.match(statuses.at(-1)?.message || "", /old token was removed/i);
});

test("popup runtime messages require this extension and Journey artifact opens require journey.html", () => {
  const initialization = sourceBetween(popupSource, "function init()", "function scheduleSourceRefresh()");
  const senderCheck = initialization.indexOf("if (sender?.id !== globalThis.chrome.runtime.id) return;");
  const focusBranch = initialization.indexOf('if (message?.type === "FOCUS_STATE_CHANGED")');
  const artifactBranch = initialization.indexOf('if (message?.type === "OPEN_JOURNEY_ARTIFACT"');
  const journeyPageCheck = initialization.indexOf('senderUrl !== globalThis.chrome.runtime.getURL("journey.html")');

  assert.ok(senderCheck >= 0 && senderCheck < focusBranch);
  assert.ok(artifactBranch > focusBranch);
  assert.ok(journeyPageCheck > artifactBranch);
  assert.match(initialization, /String\(sender\?\.url \|\| sender\?\.tab\?\.url \|\| ""\)/);
});
