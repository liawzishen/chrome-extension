const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { webcrypto } = require("node:crypto");

const root = path.resolve(__dirname, "..");
const Video = require("../video-utils.js");

function createStorageArea(store, events, label) {
  return {
    async get(keys) {
      if (keys == null) return Object.fromEntries(store);
      const requested = Array.isArray(keys) ? keys : [keys];
      return Object.fromEntries(requested.filter((key) => store.has(key)).map((key) => [key, store.get(key)]));
    },
    async set(values) {
      Object.entries(values || {}).forEach(([key, value]) => store.set(key, structuredClone(value)));
      events.push(`${label}.set:${Object.keys(values || {}).join(",")}`);
    },
    async remove(keys) {
      (Array.isArray(keys) ? keys : [keys]).forEach((key) => store.delete(key));
      events.push(`${label}.remove:${Array.isArray(keys) ? keys.join(",") : keys}`);
    },
    async setAccessLevel() {}
  };
}

function createWorkerHarness({ authorization, tabUrl = authorization?.sourceSnapshot?.canonicalUrl } = {}) {
  const events = [];
  const localStore = new Map();
  const sessionStore = new Map();
  if (authorization) sessionStore.set("neatMindVideoCaptureAuthorization", structuredClone(authorization));
  const listeners = {};
  const runtimeMessages = [];
  const offscreenMessages = [];
  const streamRequests = [];
  let offscreenOpen = false;

  const event = (name) => ({ addListener(listener) { listeners[name] = listener; } });
  const manifest = {
    manifest_version: 3,
    minimum_chrome_version: "116",
    permissions: [
      "activeTab",
      "alarms",
      "declarativeNetRequestWithHostAccess",
      "offscreen",
      "sidePanel",
      "scripting",
      "storage",
      "tabCapture"
    ]
  };
  const chrome = {
    runtime: {
      id: "neatmind-test",
      lastError: null,
      getManifest: () => manifest,
      getURL: (resource = "") => `chrome-extension://neatmind-test/${resource}`,
      getContexts: async () => offscreenOpen
        ? [{ contextType: "OFFSCREEN_DOCUMENT", documentUrl: "chrome-extension://neatmind-test/offscreen.html" }]
        : [],
      onInstalled: event("runtime.onInstalled"),
      onStartup: event("runtime.onStartup"),
      onMessage: event("runtime.onMessage"),
      sendMessage(message, callback) {
        runtimeMessages.push(structuredClone(message));
        if (message?.target === "offscreen") {
          offscreenMessages.push(structuredClone(message));
          events.push(`offscreen.message:${message.type}`);
          queueMicrotask(() => callback?.({ ok: true, active: true, jobId: message.jobId }));
          return undefined;
        }
        callback?.({ ok: true });
        return Promise.resolve({ ok: true });
      }
    },
    action: {
      onClicked: event("action.onClicked"),
      async setBadgeText() {},
      async setBadgeBackgroundColor() {},
      async setTitle() {}
    },
    alarms: {
      onAlarm: event("alarms.onAlarm"),
      async create() {},
      async clear() { return true; }
    },
    permissions: {
      onRemoved: event("permissions.onRemoved"),
      async contains() { return true; }
    },
    tabs: {
      onUpdated: event("tabs.onUpdated"),
      onRemoved: event("tabs.onRemoved")
    },
    sidePanel: {
      async setPanelBehavior() {},
      open({ windowId }) {
        events.push(`sidePanel.open:${windowId}`);
        return Promise.resolve();
      }
    },
    storage: {
      local: createStorageArea(localStore, events, "local"),
      session: createStorageArea(sessionStore, events, "session")
    },
    declarativeNetRequest: {
      async getSessionRules() { return []; },
      async updateSessionRules() {}
    },
    tabCapture: {
      getMediaStreamId(options, callback) {
        streamRequests.push(structuredClone(options));
        events.push(`tabCapture.getMediaStreamId:${options.targetTabId}`);
        queueMicrotask(() => callback("one-use-stream-id"));
      }
    },
    offscreen: {
      async createDocument() {
        events.push("offscreen.createDocument");
        offscreenOpen = true;
      },
      async closeDocument() {
        events.push("offscreen.closeDocument");
        offscreenOpen = false;
      }
    },
    scripting: {
      async executeScript() {
        events.push("scripting.executeScript");
        return [{ result: true }];
      }
    }
  };

  let context;
  context = vm.createContext({
    AbortController,
    URL,
    chrome,
    console: { log() {}, warn() {}, error() {} },
    crypto: webcrypto,
    DOMException,
    fetch,
    queueMicrotask,
    setInterval,
    clearInterval,
    setTimeout,
    clearTimeout,
    structuredClone
  });
  context.importScripts = (...files) => {
    files.forEach((file) => {
      vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context, { filename: file });
    });
  };
  vm.runInContext(fs.readFileSync(path.join(root, "background.js"), "utf8"), context, { filename: "background.js" });

  return {
    events,
    listeners,
    localStore,
    offscreenMessages,
    runtimeMessages,
    sessionStore,
    streamRequests,
    tab: { id: authorization?.tabId ?? 17, windowId: 4, url: tabUrl, title: "Authorization test video" }
  };
}

function makeAuthorization(overrides = {}) {
  const now = Date.now();
  const sourceSnapshot = Video.normalizeSourceSnapshot({
    tabId: 17,
    url: "https://video.example.test/lesson",
    title: "Authorization test video",
    currentSrc: "https://cdn.example.test/lesson.mp4",
    durationMs: 120_000,
    seekable: true,
    capturedAt: now
  });
  return {
    protocolVersion: 3,
    requestId: "authorization-test",
    tabId: 17,
    sourceSnapshot,
    mediaTimeMs: 12_000,
    playbackRate: 1,
    recording: true,
    requestedAt: now,
    expiresAt: now + 60_000,
    ...overrides
  };
}

async function waitFor(predicate, timeoutMs = 1000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  throw new Error("Timed out waiting for the service-worker authorization flow.");
}

test("real worker action consumes one armed request and starts the exact offscreen source", async () => {
  const authorization = makeAuthorization();
  const harness = createWorkerHarness({ authorization });
  assert.equal(harness.streamRequests.length, 0, "arming alone must not mint a Chrome stream id");

  harness.listeners["action.onClicked"](harness.tab);
  await waitFor(() => harness.offscreenMessages.some((message) => message.type === "VIDEO_OFFSCREEN_START"));

  assert.deepEqual(harness.streamRequests, [{ targetTabId: 17 }]);
  assert.equal(harness.sessionStore.has("neatMindVideoCaptureAuthorization"), false);
  const start = harness.offscreenMessages.find((message) => message.type === "VIDEO_OFFSCREEN_START");
  assert.equal(start.streamId, "one-use-stream-id");
  assert.equal(start.sourceSnapshot.sourceFingerprint, authorization.sourceSnapshot.sourceFingerprint);
  assert.equal(start.sourceSnapshot.tabId, authorization.tabId);
  assert.equal(start.mediaStartMs, authorization.mediaTimeMs);
  assert.equal(harness.localStore.get("neatMindVideoCaptureState")?.status, "starting");
  assert.ok(harness.events.indexOf("session.remove:neatMindVideoCaptureAuthorization") < harness.events.indexOf("tabCapture.getMediaStreamId:17"));
  assert.ok(harness.events.indexOf("tabCapture.getMediaStreamId:17") < harness.events.indexOf("offscreen.message:VIDEO_OFFSCREEN_START"));
});

test("real worker refuses a changed page and expires the armed request without tab capture", async () => {
  const changed = createWorkerHarness({
    authorization: makeAuthorization(),
    tabUrl: "https://video.example.test/replaced"
  });
  changed.listeners["action.onClicked"](changed.tab);
  await waitFor(() => !changed.sessionStore.has("neatMindVideoCaptureAuthorization"));
  assert.equal(changed.streamRequests.length, 0);
  assert.equal(changed.offscreenMessages.length, 0);
  assert.ok(changed.runtimeMessages.some((message) => (
    message.type === "VIDEO_CAPTURE_AUTHORIZATION_CHANGED"
    && message.state?.reason === "navigation"
  )));

  const expired = createWorkerHarness({
    authorization: makeAuthorization({ expiresAt: Date.now() - 1 })
  });
  expired.listeners["action.onClicked"](expired.tab);
  await waitFor(() => !expired.sessionStore.has("neatMindVideoCaptureAuthorization"));
  assert.equal(expired.streamRequests.length, 0);
  assert.ok(expired.runtimeMessages.some((message) => (
    message.type === "VIDEO_CAPTURE_AUTHORIZATION_CHANGED"
    && message.state?.status === "expired"
  )));
});
