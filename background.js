"use strict";

importScripts("branding-utils.js", "focus-utils.js", "journey-utils.js", "journey-worker-utils.js", "video-utils.js");

const Focus = globalThis.NeatMindFocus;
const Journey = globalThis.NeatMindJourney;
const JourneyWorker = globalThis.NeatMindJourneyWorker;
const Video = globalThis.NeatMindVideo;
const FOCUS_MESSAGE_TYPES = new Set(Object.values(Focus.MESSAGE_TYPES));
const CHAPTER_FOCUS_MESSAGE_TYPES = new Set(Object.values(Focus.CHAPTER_MESSAGE_TYPES || {}));
const JOURNEY_MESSAGE_TYPES = new Set(Object.values(JourneyWorker.MESSAGE_TYPES));
const VIDEO_REQUEST_TYPES = new Set([
  "VIDEO_CAPTURE_ARM",
  "VIDEO_CAPTURE_CANCEL_ARM",
  "VIDEO_CAPTURE_GET_AUTHORIZATION",
  "VIDEO_CAPTURE_STOP_REQUEST",
  "VIDEO_CAPTURE_GET_STATE",
  "VIDEO_CAPTURE_CLEAR",
  "VIDEO_PLAYER_EVENT"
]);
const VIDEO_EVENT_TYPES = new Set([
  Video.MESSAGE_TYPES.READY,
  Video.MESSAGE_TYPES.PROGRESS,
  Video.MESSAGE_TYPES.CHUNK,
  Video.MESSAGE_TYPES.STOPPED,
  Video.MESSAGE_TYPES.ERROR
]);
const JOURNEY_STORAGE_KEY = "neatMindLearningJourney";
const VIDEO_CAPTURE_STORAGE_KEY = "neatMindVideoCaptureState";
const VIDEO_CAPTURE_AUTHORIZATION_KEY = "neatMindVideoCaptureAuthorization";
const VIDEO_CAPTURE_PROTOCOL_VERSION = 3;
const VIDEO_CAPTURE_AUTHORIZATION_TTL_MS = 60 * 1000;
const DEFAULT_BACKEND_ENDPOINT = "http://127.0.0.1:8787/api/study-session";
const ACTIVE_VIDEO_CAPTURE_STATUSES = new Set(["starting", "recording", "paused", "processing", "aborting"]);
const VIDEO_TRANSCRIPTION_TIMEOUT_MS = 110 * 1000;
const VIDEO_BACKEND_PREFLIGHT_TIMEOUT_MS = 6 * 1000;
let operationQueue = Promise.resolve();
let journeyOperationQueue = Promise.resolve();
let videoOperationQueue = Promise.resolve();
let videoEventQueue = Promise.resolve();
let creatingVideoOffscreenDocument = null;
let latestVideoProgressState = null;
const videoStreamReservations = Video.createStreamReservationRegistry();

async function migrateBrandStorage() {
  const branding = globalThis.NeatMindBranding;
  if (!branding?.migrateStorageArea) return;
  await Promise.all([
    branding.migrateStorageArea(chrome.storage.local),
    branding.migrateStorageArea(chrome.storage.session)
  ]);
}

function initializeBackgroundState(reason, videoReason) {
  void migrateBrandStorage().catch((error) => {
    console.warn(`[NeatMind] Could not migrate stored data: ${safeErrorMessage(error) || "unknown error"}`);
  }).finally(() => {
    void configureGlobalSidePanel(reason);
    void enqueueOperation(async () => {
      await restrictStorageToTrustedContexts();
      return reconcileFocusState(reason);
    }).then(broadcastFocusState).catch((error) => logFocusError(`${reason} reconciliation`, error));
    void enqueueVideoOperation(() => reconcileVideoCaptureState(videoReason)).catch(() => undefined);
    void enqueueOperation(() => reconcileChapterFocusState(reason))
      .then(broadcastChapterFocusState)
      .catch((error) => logFocusError(`chapter focus ${reason}`, error));
  });
}

chrome.runtime.onInstalled.addListener(() => {
  initializeBackgroundState("installed", "extension update");
});

chrome.runtime.onStartup.addListener(() => {
  initializeBackgroundState("browser startup", "browser restart");
});

chrome.action.onClicked.addListener((tab) => {
  // Keep the panel opening inside the real action event. When the user has
  // armed tab audio, this same toolbar invocation is also the only place that
  // may mint the one-use stream id; it is consumed by the offscreen recorder
  // immediately instead of being left to expire in the side panel.
  const windowId = Number(tab?.windowId);
  if (Number.isInteger(windowId) && typeof chrome.sidePanel?.open === "function") {
    try {
      const opening = chrome.sidePanel.open({ windowId });
      if (opening && typeof opening.catch === "function") {
        void opening.catch((error) => {
          console.warn(`[NeatMind Panel] action click: ${safeErrorMessage(error) || "could not open the side panel"}`);
        });
      }
    } catch (error) {
      console.warn(`[NeatMind Panel] action click: ${safeErrorMessage(error) || "could not open the side panel"}`);
    }
  }
  void authorizeArmedVideoCaptureFromAction(tab).catch((error) => {
    console.warn(`[NeatMind Video] toolbar authorization: ${safeErrorMessage(error) || "could not start tab audio"}`);
  });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm?.name === Focus.CHAPTER_IDLE_ALARM) {
    void enqueueOperation(() => reconcileChapterFocusState("idle alarm"))
      .then(broadcastChapterFocusState)
      .catch((error) => logFocusError("chapter idle reconciliation", error));
    return;
  }
  if (![Focus.END_ALARM, Focus.BREAK_ALARM].includes(alarm?.name)) return;
  void enqueueOperation(() => reconcileFocusState(`alarm ${alarm.name}`))
    .then(broadcastFocusState)
    .catch((error) => logFocusError("alarm reconciliation", error));
});

chrome.permissions.onRemoved.addListener(() => {
  void enqueueOperation(() => reconcileFocusState("permission change"))
    .then(broadcastFocusState)
    .catch((error) => logFocusError("permission reconciliation", error));
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status !== "loading" && !changeInfo.url) return;
  void enqueueOperation(() => pauseChapterFocusForOwnedTab(tabId, "hidden"))
    .then((state) => state && broadcastChapterFocusState(state))
    .catch(() => undefined);
  // Revoke one-shot stream ids immediately, even when capture state has not
  // been persisted yet. The epoch also prevents an in-flight authorization
  // from committing after this navigation event.
  videoStreamReservations.clearTab(tabId);
  void clearVideoCaptureAuthorization(tabId, "navigation").catch(() => undefined);
  void closeIdleVideoOffscreenDocument().catch(() => undefined);
  void enqueueVideoOperation(async () => {
    const state = await loadVideoCaptureState();
    if (state?.sourceSnapshot?.tabId === tabId && ["starting", "recording", "paused", "processing"].includes(state.status)) {
      await stopVideoCapture("navigation", true);
    }
  }).catch(() => undefined);
});

chrome.tabs.onRemoved.addListener((tabId) => {
  videoStreamReservations.clearTab(tabId);
  void clearVideoCaptureAuthorization(tabId, "tab-closed").catch(() => undefined);
  void closeIdleVideoOffscreenDocument().catch(() => undefined);
  void enqueueVideoOperation(async () => {
    const state = await loadVideoCaptureState();
    if (state?.sourceSnapshot?.tabId === tabId && ["starting", "recording", "paused", "processing"].includes(state.status)) {
      await stopVideoCapture("navigation", true);
    }
  }).catch(() => undefined);
  void enqueueOperation(() => pauseChapterFocusForOwnedTab(tabId, "closed"))
    .then((state) => state && broadcastChapterFocusState(state))
    .catch(() => undefined);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (sender?.id !== chrome.runtime.id) {
    sendResponse({
      ok: false,
      error: {
        code: "UNAUTHORIZED_SENDER",
        message: "NeatMind controls are only available to this extension."
      }
    });
    return false;
  }

  if (FOCUS_MESSAGE_TYPES.has(message?.type)) {
    void enqueueOperation(() => handleFocusMessage(message))
      .then((state) => {
        void broadcastFocusState(state);
        sendResponse({ ok: true, state });
      })
      .catch((error) => sendResponse({ ok: false, error: serializeFocusError(error) }));
    return true;
  }
  if (CHAPTER_FOCUS_MESSAGE_TYPES.has(message?.type)) {
    void enqueueOperation(() => handleChapterFocusMessage(message, sender))
      .then((state) => {
        void broadcastChapterFocusState(state);
        sendResponse({ ok: true, state });
      })
      .catch((error) => sendResponse({ ok: false, error: serializeFocusError(error) }));
    return true;
  }
  if (JOURNEY_MESSAGE_TYPES.has(message?.type)) {
    void enqueueJourneyOperation(() => handleJourneyOperation(message))
      .then((outcome) => sendResponse({ ok: true, ...outcome }))
      .catch((error) => sendResponse({ ok: false, error: serializeJourneyError(error) }));
    return true;
  }
  if (VIDEO_REQUEST_TYPES.has(message?.type)) {
    settleVideoMessageResponse(
      enqueueVideoOperation(() => handleVideoMessage(message, sender)),
      sendResponse,
      (result) => ({ ok: true, ...result })
    );
    return true;
  }
  if (VIDEO_EVENT_TYPES.has(message?.type)) {
    if (message.target !== "service-worker" || !isVideoOffscreenSender(sender)) {
      sendResponse({ ok: false, error: serializeVideoError(new Video.VideoCaptureError("UNAUTHORIZED_CAPTURE_EVENT", "The capture event did not come from NeatMind's offscreen recorder.")) });
      return false;
    }
    const eventOperation = message.type === Video.MESSAGE_TYPES.PROGRESS
      ? handleVideoMessage(message, sender)
      : enqueueVideoEvent(() => handleVideoMessage(message, sender));
    settleVideoMessageResponse(
      eventOperation,
      sendResponse,
      (result) => {
        const { closeOffscreenAfterResponse: _close, ...publicResult } = result || {};
        return { ok: true, ...publicResult };
      },
      message.type === Video.MESSAGE_TYPES.CHUNK
        ? () => scheduleVideoOffscreenClose(500)
        : null,
      (result) => {
        if (result?.closeOffscreenAfterResponse) scheduleVideoOffscreenClose();
      }
    );
    return true;
  }
  return false;
});

void enqueueOperation(async () => {
  await restrictStorageToTrustedContexts();
  return reconcileFocusState("worker start");
}).then(broadcastFocusState).catch((error) => logFocusError("worker reconciliation", error));
void configureGlobalSidePanel("worker start");
void enqueueVideoOperation(() => reconcileVideoCaptureState("worker restart")).catch(() => undefined);
void enqueueOperation(() => reconcileChapterFocusState("worker restart"))
  .then(broadcastChapterFocusState)
  .catch((error) => logFocusError("chapter focus worker reconciliation", error));

async function configureGlobalSidePanel(reason) {
  if (typeof chrome.sidePanel?.setPanelBehavior !== "function") {
    console.warn(`[NeatMind Panel] ${reason}: Chrome 116 or newer is required for the persistent side panel.`);
    return false;
  }
  try {
    // Explicitly disable Chrome's native shortcut because it can open the
    // panel without granting activeTab (Chromium issue 336592430). The
    // synchronous action.onClicked handler above both grants the tab invocation
    // and opens this same global panel.
    await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
    return true;
  } catch (error) {
    console.warn(`[NeatMind Panel] ${reason}: ${safeErrorMessage(error) || "could not configure action-click behavior"}`);
    return false;
  }
}

function enqueueOperation(operation) {
  const next = operationQueue.then(operation, operation);
  operationQueue = next.catch(() => undefined);
  return next;
}

function enqueueJourneyOperation(operation) {
  const next = journeyOperationQueue.then(operation, operation);
  journeyOperationQueue = next.catch(() => undefined);
  return next;
}

function enqueueVideoOperation(operation) {
  const next = videoOperationQueue.then(operation, operation);
  videoOperationQueue = next.catch(() => undefined);
  return next;
}

function enqueueVideoEvent(operation) {
  const next = videoEventQueue.then(operation, operation);
  videoEventQueue = next.catch(() => undefined);
  return next;
}

function settleVideoMessageResponse(operation, sendResponse, mapSuccess, afterError = null, afterSuccess = null) {
  const respond = Video.createResponseOnce(sendResponse);
  void Promise.resolve(operation)
    .then((result) => {
      respond(mapSuccess(result));
      if (typeof afterSuccess === "function") {
        void Promise.resolve()
          .then(() => afterSuccess(result))
          .catch(() => undefined);
      }
    })
    .catch((error) => {
      // Reply while the runtime message channel is definitely still alive.
      // Offscreen teardown is best-effort and must never delay the error reply.
      respond({ ok: false, error: serializeVideoError(error) });
      if (typeof afterError === "function") {
        void Promise.resolve()
          .then(() => afterError(error))
          .catch(() => undefined);
      }
    });
}

function scheduleVideoOffscreenClose(delayMs = 250) {
  setTimeout(() => {
    void closeVideoOffscreenDocument().catch(() => undefined);
  }, Math.max(0, Number(delayMs) || 0));
}

async function handleJourneyOperation(message) {
  const stored = await chrome.storage.local.get(JOURNEY_STORAGE_KEY);
  const outcome = JourneyWorker.reduceJourneyOperation(stored[JOURNEY_STORAGE_KEY], message, Date.now());
  if (outcome.changed) {
    await chrome.storage.local.set({ [JOURNEY_STORAGE_KEY]: outcome.journey });
  }
  return {
    journey: outcome.journey,
    result: outcome.result,
    duplicate: outcome.duplicate
  };
}

function serializeJourneyError(error) {
  return {
    code: String(error?.code || "JOURNEY_ERROR").slice(0, 80),
    message: safeErrorMessage(error) || "The learning journey could not be updated.",
    details: error?.details && typeof error.details === "object" ? error.details : {}
  };
}

async function handleVideoMessage(message, sender) {
  switch (message.type) {
    case "VIDEO_CAPTURE_ARM":
      return { state: await armVideoCapture(message) };
    case "VIDEO_CAPTURE_CANCEL_ARM":
      await clearVideoCaptureAuthorization(
        message.tabId,
        message.reason === "expired" ? "expired" : "cancelled"
      );
      return { state: null };
    case "VIDEO_CAPTURE_GET_AUTHORIZATION":
      return { state: toPublicVideoCaptureAuthorization(await loadVideoCaptureAuthorization()) };
    case "VIDEO_CAPTURE_STOP_REQUEST":
      return stopVideoCapture(message.reason || "completed", false);
    case "VIDEO_CAPTURE_GET_STATE":
      return { state: await reconcileVideoCaptureState("state request") };
    case "VIDEO_CAPTURE_CLEAR":
      {
        const existingState = await loadVideoCaptureState();
        if (existingState?.jobId && ACTIVE_VIDEO_CAPTURE_STATUSES.has(existingState.status)) {
          await stopVideoCapture("cleared", true).catch(() => undefined);
        }
      }
      await chrome.storage.local.remove(VIDEO_CAPTURE_STORAGE_KEY);
      await clearVideoCaptureAuthorization(null, "cleared");
      await closeVideoOffscreenDocument();
      await updateVideoCaptureBadge(false).catch(() => undefined);
      await broadcastVideoState(null);
      return { state: null };
    case "VIDEO_PLAYER_EVENT":
      return handleVideoPlayerEvent(message, sender);
    case Video.MESSAGE_TYPES.READY:
      return handleOffscreenVideoReady(message);
    case Video.MESSAGE_TYPES.PROGRESS:
      return handleOffscreenVideoProgress(message);
    case Video.MESSAGE_TYPES.CHUNK:
      return handleOffscreenVideoChunk(message);
    case Video.MESSAGE_TYPES.STOPPED:
      return handleOffscreenVideoStopped(message);
    case Video.MESSAGE_TYPES.ERROR:
      return handleOffscreenVideoError(message);
    default:
      throw new Video.VideoCaptureError("UNKNOWN_VIDEO_MESSAGE", "Unknown automatic-video request.");
  }
}

async function armVideoCapture(message) {
  Video.validateCaptureManifest(chrome.runtime.getManifest());
  const sourceSnapshot = Video.normalizeSourceSnapshot(message?.sourceSnapshot || {});
  const tabId = Number(message?.tabId);
  if (!Number.isInteger(tabId) || tabId < 0 || sourceSnapshot.tabId !== tabId) {
    throw new Video.VideoCaptureError("SOURCE_MISMATCH", "The active tab no longer matches the detected video source.");
  }
  if (!sourceSnapshot.identityAvailable) {
    throw new Video.VideoCaptureError("MEDIA_IDENTITY_UNAVAILABLE", "Refresh the source after the video loads, then try tab audio again.");
  }
  if (message?.recording === false) {
    throw new Video.VideoCaptureError("VIDEO_PAUSED", "Play the video before starting automatic transcription.");
  }
  const existingState = await loadVideoCaptureState();
  if (existingState?.jobId && ACTIVE_VIDEO_CAPTURE_STATUSES.has(existingState.status)) {
    throw new Video.VideoCaptureError("CAPTURE_ALREADY_ACTIVE", "Stop the current automatic transcript before starting another one.");
  }

  // Perform every slow or failure-prone check before asking for Chrome's
  // toolbar invocation. Once the user clicks the action, the stream id can go
  // straight to the offscreen recorder instead of waiting on the backend.
  await preflightVideoTranscriptionBackend();
  const requestedAt = Date.now();
  const authorization = {
    protocolVersion: VIDEO_CAPTURE_PROTOCOL_VERSION,
    requestId: typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `authorization-${requestedAt.toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
    tabId,
    sourceSnapshot,
    mediaTimeMs: Math.max(0, Number(message?.mediaTimeMs) || 0),
    playbackRate: Math.max(0.25, Math.min(16, Number(message?.playbackRate) || 1)),
    recording: true,
    requestedAt,
    expiresAt: requestedAt + VIDEO_CAPTURE_AUTHORIZATION_TTL_MS
  };
  await chrome.storage.session.set({ [VIDEO_CAPTURE_AUTHORIZATION_KEY]: authorization });
  const publicState = toPublicVideoCaptureAuthorization(authorization, "awaiting-toolbar");
  await broadcastVideoCaptureAuthorization(publicState);
  return publicState;
}

async function loadVideoCaptureAuthorization() {
  const result = await chrome.storage.session.get(VIDEO_CAPTURE_AUTHORIZATION_KEY);
  const authorization = result?.[VIDEO_CAPTURE_AUTHORIZATION_KEY];
  if (!authorization || typeof authorization !== "object") return null;
  const sourceSnapshot = (() => {
    try {
      return Video.normalizeSourceSnapshot(authorization.sourceSnapshot || {});
    } catch {
      return null;
    }
  })();
  const valid = authorization.protocolVersion === VIDEO_CAPTURE_PROTOCOL_VERSION
    && String(authorization.requestId || "").trim()
    && Number.isInteger(Number(authorization.tabId))
    && Number(authorization.expiresAt) > Date.now()
    && sourceSnapshot?.tabId === Number(authorization.tabId)
    && sourceSnapshot.identityAvailable;
  if (!valid) {
    await chrome.storage.session.remove(VIDEO_CAPTURE_AUTHORIZATION_KEY);
    if (Number(authorization.expiresAt) <= Date.now()) {
      await broadcastVideoCaptureAuthorization({
        ...toPublicVideoCaptureAuthorization(authorization, "expired"),
        message: "The tab-audio request expired. Keep the video playing, press Start tab audio again, then click the toolbar icon within one minute."
      });
    }
    return null;
  }
  return { ...authorization, tabId: Number(authorization.tabId), sourceSnapshot };
}

async function clearVideoCaptureAuthorization(tabIdValue = null, reason = "cleared") {
  const result = await chrome.storage.session.get(VIDEO_CAPTURE_AUTHORIZATION_KEY);
  const authorization = result?.[VIDEO_CAPTURE_AUTHORIZATION_KEY];
  if (!authorization) return false;
  const tabId = tabIdValue == null ? null : Number(tabIdValue);
  if (tabId != null && Number(authorization.tabId) !== tabId) return false;
  await chrome.storage.session.remove(VIDEO_CAPTURE_AUTHORIZATION_KEY);
  const message = reason === "navigation"
    ? "The video page changed. Press Start tab audio again on the new page."
    : reason === "tab-closed"
      ? "The video tab closed before Chrome could authorize audio."
      : reason === "expired"
        ? "The tab-audio request expired. Keep the video playing, press Start tab audio again, then click the toolbar icon within one minute."
      : "";
  await broadcastVideoCaptureAuthorization({
    status: reason === "expired" ? "expired" : "cleared",
    tabId: Number(authorization.tabId),
    reason,
    message
  });
  return true;
}

function toPublicVideoCaptureAuthorization(authorization, status = "awaiting-toolbar") {
  if (!authorization) return null;
  return {
    protocolVersion: VIDEO_CAPTURE_PROTOCOL_VERSION,
    requestId: String(authorization.requestId || ""),
    status,
    tabId: Number(authorization.tabId),
    expiresAt: Number(authorization.expiresAt) || 0,
    sourceFingerprint: String(authorization.sourceSnapshot?.sourceFingerprint || "")
  };
}

async function broadcastVideoCaptureAuthorization(state) {
  try {
    await chrome.runtime.sendMessage({ type: "VIDEO_CAPTURE_AUTHORIZATION_CHANGED", state });
  } catch {
    // The side panel may be closed. The request remains in session storage.
  }
}

async function authorizeArmedVideoCaptureFromAction(tab) {
  const authorization = await loadVideoCaptureAuthorization();
  if (!authorization) return false;
  const tabId = Number(tab?.id);
  const actionUrl = Video.canonicalUrl(tab?.url, { removePlaybackParameters: true });
  if (!Number.isInteger(tabId) || tabId !== authorization.tabId) {
    await broadcastVideoCaptureAuthorization({
      ...toPublicVideoCaptureAuthorization(authorization, "wrong-tab"),
      message: "Return to the video tab you armed, then click the NeatMind toolbar icon there."
    });
    return false;
  }
  if (!actionUrl || actionUrl !== authorization.sourceSnapshot.canonicalUrl) {
    await clearVideoCaptureAuthorization(tabId, "navigation");
    return false;
  }

  // Consume the durable request before minting the one-use stream id. A replay
  // of the toolbar event can never start the same request twice.
  await chrome.storage.session.remove(VIDEO_CAPTURE_AUTHORIZATION_KEY);
  await broadcastVideoCaptureAuthorization(toPublicVideoCaptureAuthorization(authorization, "authorizing"));
  try {
    // Start stream authorization and offscreen creation immediately, then do
    // capture-state setup in parallel. The resulting Chrome id is never left
    // waiting in session storage or behind backend work.
    const authorizedStreamId = reserveVideoCaptureStreamFromAction(authorization);
    void authorizedStreamId.catch(() => undefined);
    const result = await enqueueVideoOperation(() => startVideoCapture(authorization, authorizedStreamId));
    await broadcastVideoCaptureAuthorization(null);
    return result;
  } catch (error) {
    const normalized = Video.toCaptureStartError(error, "toolbar tab authorization");
    await broadcastVideoCaptureAuthorization({
      ...toPublicVideoCaptureAuthorization(authorization, "error"),
      code: normalized.code,
      message: normalized.message
    });
    await closeIdleVideoOffscreenDocument().catch(() => undefined);
    throw normalized;
  }
}

function requestVideoCaptureStreamId(tabIdValue) {
  try {
    Video.validateCaptureManifest(chrome.runtime.getManifest());
    const tabId = Number(tabIdValue);
    if (!Number.isInteger(tabId) || tabId < 0) {
      throw new Video.VideoCaptureError("INVALID_TAB", "Automatic transcription requires the current video tab.");
    }
    if (typeof chrome.tabCapture?.getMediaStreamId !== "function") {
      throw new Video.VideoCaptureError(
        "TAB_CAPTURE_UNAVAILABLE",
        "Chrome 116 or newer is required for tab-audio capture. Update Chrome, then reload NeatMind."
      );
    }
    // This function is reached only from chrome.action.onClicked after an
    // armed request. That action invocation supplies Chrome's activeTab grant.
    const streamPromise = Video.invokeChromeCallbackOrPromise(
      (callback) => chrome.tabCapture.getMediaStreamId({ targetTabId: tabId }, callback),
      () => chrome.runtime?.lastError
    );
    return Video.withTimeout(
      streamPromise,
      Video.CAPTURE_START_TIMEOUT_MS,
      () => new Video.VideoCaptureError(
        "TAB_CAPTURE_STREAM_TIMEOUT",
        "Chrome did not authorize tab audio in time. Keep the video tab active and press Start tab audio again."
      )
    ).then((streamId) => {
      const normalized = String(streamId || "").trim();
      if (!normalized) {
        throw new Video.VideoCaptureError("EMPTY_TAB_STREAM", "Chrome returned an empty tab-audio stream. Try starting capture again.");
      }
      return normalized;
    }).catch((error) => {
      throw Video.toCaptureStartError(error, "tab stream authorization");
    });
  } catch (error) {
    return Promise.reject(Video.toCaptureStartError(error, "tab stream authorization"));
  }
}

function prepareVideoCaptureStream(tabId) {
  const streamPromise = requestVideoCaptureStreamId(tabId);
  const offscreenPromise = ensureVideoOffscreenDocument();
  return Promise.all([streamPromise, offscreenPromise]).then(([streamId]) => streamId);
}

function reserveVideoCaptureStreamFromAction(message) {
  const tabId = Number(message?.tabId);
  const reservationLease = videoStreamReservations.begin(tabId, message?.sourceSnapshot);
  const requestedAt = Date.now();
  const expiresAt = requestedAt + Video.STREAM_RESERVATION_TTL_MS;
  const preparedStream = prepareVideoCaptureStream(tabId);
  return preparedStream.then((streamId) => {
    if (Date.now() >= expiresAt) {
      throw new Video.VideoCaptureError(
        "CAPTURE_AUTHORIZATION_EXPIRED",
        "Chrome's tab-audio authorization expired while the recorder was loading. Press Start tab audio again."
      );
    }
    const reservationId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `capture-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    videoStreamReservations.commit({
      reservationId,
      tabId,
      streamId,
      requestedAt,
      expiresAt,
      sourceBinding: reservationLease.sourceBinding
    }, reservationLease.epoch);
    // Consume the registry entry in the same promise turn in which it is
    // committed. This preserves epoch/source validation without parking the
    // single-use stream id while the worker performs unrelated work.
    return consumeVideoCaptureReservation(reservationId, tabId, message?.sourceSnapshot);
  });
}

function consumeVideoCaptureReservation(reservationIdValue, tabId, sourceSnapshot) {
  return videoStreamReservations.consume(reservationIdValue, tabId, sourceSnapshot);
}

async function startVideoCapture(message, authorizedStreamIdPromise = null) {
  const tabId = Number(message.tabId);
  if (!Number.isInteger(tabId) || tabId < 0) {
    throw new Video.VideoCaptureError("INVALID_TAB", "Automatic transcription requires the current video tab.");
  }
  Video.validateCaptureManifest(chrome.runtime.getManifest());
  let state = null;
  try {
    if (!authorizedStreamIdPromise) {
      throw new Video.VideoCaptureError(
        "CAPTURE_RESERVATION_REQUIRED",
        "Tab audio must be armed from Start tab audio and authorized by the toolbar action before capture begins."
      );
    }
    const suppliedSourceSnapshot = message.sourceSnapshot || {};
    const sourceSnapshot = Video.normalizeSourceSnapshot(suppliedSourceSnapshot);
    if (sourceSnapshot.tabId !== tabId) {
      throw new Video.VideoCaptureError("SOURCE_MISMATCH", "The requested tab does not match the captured video source.");
    }
    if (message.recording === false) {
      throw new Video.VideoCaptureError("VIDEO_PAUSED", "Play the video before starting automatic transcription.");
    }
    const streamIdPromise = Promise.resolve(authorizedStreamIdPromise);
    // Attach rejection handling immediately while other state cleanup runs.
    void streamIdPromise.catch(() => undefined);
    const previous = await loadVideoCaptureState();
    if (previous?.status && ["starting", "recording", "paused", "processing"].includes(previous.status)) {
      await stopVideoCapture("replaced", true).catch(() => undefined);
    }
    await ensureVideoOffscreenDocument();
    let job = Video.createCaptureJob(sourceSnapshot, {
      mediaTimeMs: message.mediaTimeMs,
      playbackRate: message.playbackRate,
      createdAt: Date.now()
    });
    job = Video.transitionCaptureJob(job, {
      type: "start",
      mediaTimeMs: message.mediaTimeMs,
      playbackRate: message.playbackRate
    }, Date.now());
    state = {
      protocolVersion: VIDEO_CAPTURE_PROTOCOL_VERSION,
      schemaVersion: 1,
      jobId: job.jobId,
      status: "starting",
      sourceSnapshot,
      sourceFingerprint: sourceSnapshot.sourceFingerprint,
      startedAt: job.startedAt,
      capturedMs: 0,
      maxCaptureMs: Video.MAX_CAPTURE_MS,
      chunkCount: 0,
      receivedChunkCount: 0,
      pendingChunkCount: 0,
      successfulChunkCount: 0,
      failedChunkCount: 0,
      transcriptionStatus: "idle",
      transcriptionAttemptCount: 0,
      lastTranscriptionChunkId: "",
      lastTranscriptionErrorCode: "",
      lastTranscriptionError: "",
      chunkTranscriptions: [],
      liveCapturedMs: 0,
      samplesObserved: false,
      audioLevel: 0,
      peakAudioLevel: 0,
      result: {
        segments: [],
        coverageRanges: [],
        timestampConfidence: "AI-estimated",
        provenance: "audio-ai"
      },
      error: "",
      updatedAt: Date.now()
    };
    await saveVideoCaptureState(state);
    latestVideoProgressState = null;
    // Do not delay getUserMedia on panel rendering. READY/rollback will deliver
    // the authoritative state, while this best-effort update can run beside it.
    void broadcastVideoState(state);
    const streamId = await streamIdPromise;
    const offscreenResponse = await sendVideoOffscreenMessage({
      type: Video.MESSAGE_TYPES.START,
      jobId: state.jobId,
      streamId,
      sourceSnapshot,
      mediaStartMs: Number(message.mediaTimeMs) || 0,
      playbackRate: Number(message.playbackRate) || 1,
      recording: true
    }, Video.CAPTURE_START_TIMEOUT_MS);
    if (offscreenResponse?.ok === false) {
      throw Video.toCaptureStartError(
        new Error(offscreenResponse.error || "Tab-audio capture could not start."),
        "offscreen recorder start"
      );
    }
    const observerInstalled = await Video.withTimeout(
      installVideoPlayerObserver(tabId, state.jobId),
      Video.CAPTURE_START_TIMEOUT_MS,
      () => new Video.VideoCaptureError(
        "PLAYER_OBSERVER_TIMEOUT",
        "The video player did not respond in time. Reload the video page and try tab-audio capture again."
      )
    );
    if (observerInstalled === false) {
      throw new Video.VideoCaptureError("VIDEO_NOT_FOUND", "The video player disappeared before tab-audio capture could start.");
    }
    const latestState = await loadVideoCaptureState();
    if (!latestState || latestState.jobId !== state.jobId) {
      throw new Video.VideoCaptureError("STALE_CAPTURE", "The automatic-video job changed while capture was starting.");
    }
    await broadcastVideoState(latestState);
    return { state: latestState };
  } catch (error) {
    const normalized = Video.toCaptureStartError(error, "capture startup");
    // The sender needs the actionable start error immediately. State and media
    // cleanup continue independently so a slow AudioContext/offscreen close
    // cannot outlive the one-shot runtime response channel.
    void rollbackVideoCaptureStart(state, normalized).catch(() => undefined);
    throw normalized;
  }
}

async function rollbackVideoCaptureStart(startingState, error) {
  let shouldCloseRecorder = true;
  if (startingState?.jobId) {
    const latest = await loadVideoCaptureState().catch(() => null);
    if (!latest || latest.jobId === startingState.jobId) {
      const failedState = {
        ...(latest || startingState),
        status: "error",
        error: String(error?.message || "Automatic tab-audio capture could not start.").slice(0, 500),
        errorCode: String(error?.code || "CAPTURE_START_FAILED").slice(0, 80),
        result: null,
        capturedMs: 0,
        chunkCount: 0,
        updatedAt: Date.now()
      };
      await saveVideoCaptureState(failedState).catch(() => undefined);
      await broadcastVideoState(failedState).catch(() => undefined);
    } else if (ACTIVE_VIDEO_CAPTURE_STATUSES.has(latest.status)) {
      shouldCloseRecorder = false;
    }
  } else {
    const existing = await loadVideoCaptureState().catch(() => null);
    if (existing && ACTIVE_VIDEO_CAPTURE_STATUSES.has(existing.status)) {
      shouldCloseRecorder = false;
    }
  }
  if (shouldCloseRecorder) {
    await closeVideoOffscreenDocument().catch(() => undefined);
    await updateVideoCaptureBadge(false).catch(() => undefined);
  }
}

async function handleVideoPlayerEvent(message, sender) {
  const state = await loadVideoCaptureState();
  if (!state || state.jobId !== message.jobId || sender?.tab?.id !== state.sourceSnapshot?.tabId) {
    return { state };
  }
  const action = String(message.action || "").toLowerCase();
  if (["navigation", "media-changed"].includes(action)) {
    return stopVideoCapture(action, true);
  }
  if (action === "ended") return stopVideoCapture("completed", false);
  const controlAction = action === "play" ? "record" : action;
  if (!["record", "resume", "pause", "seek", "rate"].includes(controlAction)) return { state };
  const controlResponse = await sendVideoOffscreenMessage({
    type: Video.MESSAGE_TYPES.CONTROL,
    jobId: state.jobId,
    action: controlAction,
    mediaTimeMs: Number(message.mediaTimeMs) || 0,
    playbackRate: Number(message.playbackRate) || 1,
    recording: message.recording !== false
  });
  if (controlResponse?.ok === false) {
    throw new Video.VideoCaptureError("CAPTURE_CONTROL_FAILED", controlResponse.error || "The video recorder could not follow the player state.");
  }
  const latestState = await loadVideoCaptureState();
  if (!latestState || latestState.jobId !== state.jobId) return { state: latestState };
  latestState.status = ["pause", "seek"].includes(controlAction) ? "paused" : "recording";
  latestState.updatedAt = Date.now();
  await saveVideoCaptureState(latestState);
  await updateVideoCaptureBadge(true);
  await broadcastVideoState(latestState);
  return { state: latestState };
}

async function handleOffscreenVideoReady(message) {
  const state = await loadVideoCaptureState();
  if (!state || state.jobId !== message.jobId || state.sourceFingerprint !== message.sourceFingerprint) {
    throw new Video.VideoCaptureError("STALE_CAPTURE", "The offscreen recorder returned a stale source.");
  }
  state.status = "recording";
  state.playbackPreserved = Boolean(message.playbackPreserved);
  state.microphone = false;
  state.liveCapturedMs = 0;
  state.samplesObserved = false;
  state.audioLevel = 0;
  state.peakAudioLevel = 0;
  state.updatedAt = Date.now();
  await saveVideoCaptureState(state);
  await updateVideoCaptureBadge(true);
  await broadcastVideoState(state);
  return { state };
}

async function handleOffscreenVideoProgress(message) {
  const state = await loadVideoCaptureState();
  if (!state || state.jobId !== message.jobId || state.sourceFingerprint !== message.sourceFingerprint) {
    throw new Video.VideoCaptureError("STALE_CAPTURE", "Discarded progress from a stale video source.");
  }
  if (!["starting", "recording", "paused", "processing"].includes(state.status)) return { state };
  const transientState = {
    ...state,
    status: message.recording === false && state.status === "recording" ? "paused" : state.status,
    liveCapturedMs: Math.max(Number(state.liveCapturedMs) || 0, Number(message.liveCapturedMs) || 0),
    samplesObserved: Boolean(message.samplesObserved) || Boolean(state.samplesObserved),
    audioLevel: Math.max(0, Math.min(1, Number(message.audioLevel) || 0)),
    peakAudioLevel: Math.max(Number(state.peakAudioLevel) || 0, Math.min(1, Number(message.peakAudioLevel) || 0)),
    bufferedMs: Math.max(0, Number(message.bufferedMs) || 0),
    receivedChunkCount: Math.max(Number(state.receivedChunkCount) || 0, Number(message.receivedChunkCount) || 0),
    lastSampleAt: Math.max(0, Number(message.lastSampleAt) || 0),
    lastAudibleAt: Math.max(0, Number(message.lastAudibleAt) || 0),
    progressUpdatedAt: Date.now()
  };
  latestVideoProgressState = transientState;
  await broadcastVideoState(transientState);
  return { state: transientState };
}

async function handleOffscreenVideoChunk(message) {
  let initialState = await loadVideoCaptureState();
  if (!initialState || initialState.jobId !== message.jobId || initialState.sourceFingerprint !== message.sourceFingerprint) {
    throw new Video.VideoCaptureError("STALE_CAPTURE", "Discarded an audio chunk from a stale video source.");
  }
  const chunk = message.chunk && typeof message.chunk === "object" ? { ...message.chunk } : null;
  if (!chunk?.wavBase64) throw new Video.VideoCaptureError("INVALID_CHUNK", "The recorder returned an empty audio chunk.");
  const wavBase64 = chunk.wavBase64;
  delete chunk.wavBase64;
  initialState.liveCapturedMs = Math.max(
    Number(initialState.liveCapturedMs) || 0,
    Number(chunk.liveCapturedMs) || Number(chunk.capturedDurationMs) || 0
  );
  initialState.samplesObserved = Number(chunk.sampleCount) > 0 || Boolean(initialState.samplesObserved);
  initialState.audioLevel = Math.max(0, Math.min(1, Number(chunk.audioLevel) || 0));
  initialState.peakAudioLevel = Math.max(Number(initialState.peakAudioLevel) || 0, Math.min(1, Number(chunk.peakAudioLevel) || 0));
  initialState.receivedChunkCount = Math.max(Number(initialState.receivedChunkCount) || 0, Number(chunk.sequence) || 0);
  initialState = Video.transitionChunkTranscription(initialState, chunk, {
    type: "pending",
    attemptCount: 1
  });
  await saveVideoCaptureState(initialState);
  latestVideoProgressState = initialState;
  await broadcastVideoState(initialState);
  let transcription;
  let mapped;
  try {
    transcription = await transcribeVideoChunk({ ...chunk, wavBase64 }, initialState.jobId);
    mapped = Video.mapProviderSegments(transcription.segments, chunk, {
      videoDurationMs: initialState.sourceSnapshot?.durationMs
    });
    if (!mapped.length) {
      throw new Video.VideoCaptureError(
        "EMPTY_TRANSCRIPT_CHUNK",
        "The Gemini backend received this WAV audio chunk but returned zero validated speech segments."
      );
    }
  } catch (error) {
    const latest = await loadVideoCaptureState();
    if (latest && latest.jobId === initialState.jobId && latest.sourceFingerprint === initialState.sourceFingerprint) {
      const serialized = serializeVideoError(error);
      const failedState = Video.transitionChunkTranscription(latest, chunk, {
        type: "error",
        attemptCount: Number(error?.attemptCount) || Number(transcription?.attempts) || 1,
        errorCode: serialized.code,
        error: serialized.message
      });
      failedState.status = "error";
      failedState.errorCode = serialized.code;
      failedState.error = serialized.message;
      failedState.updatedAt = Date.now();
      await saveVideoCaptureState(failedState);
      latestVideoProgressState = null;
      await updateVideoCaptureBadge(false).catch(() => undefined);
      await broadcastVideoState(failedState);
    }
    throw error;
  }
  const state = await loadVideoCaptureState();
  if (!state || state.jobId !== initialState.jobId || state.sourceFingerprint !== initialState.sourceFingerprint) {
    throw new Video.VideoCaptureError("STALE_CAPTURE", "Discarded a completed transcript from a stale video source.");
  }
  if (["aborting", "aborted", "error"].includes(state.status)) {
    return { state };
  }
  const merged = mergeEstimatedTranscriptSegments(state.result?.segments || [], mapped);
  const verified = Video.validateEstimatedSegments(merged, state.sourceSnapshot?.durationMs);
  state.result = {
    segments: verified,
    coverageRanges: [
      ...(state.result?.coverageRanges || []),
      { startMs: chunk.mediaStartMs, endMs: chunk.mediaEndMs }
    ].slice(-40),
    timestampConfidence: "AI-estimated",
    provenance: "audio-ai"
  };
  state.capturedMs = Math.min(Video.MAX_CAPTURE_MS, Number(state.capturedMs || 0) + Number(chunk.capturedDurationMs || 0));
  state.liveCapturedMs = Math.max(Number(state.liveCapturedMs) || 0, Number(chunk.liveCapturedMs) || state.capturedMs);
  state.chunkCount = Number(state.chunkCount || 0) + 1;
  const completedState = Video.transitionChunkTranscription(state, chunk, {
    type: "success",
    attemptCount: Number(transcription?.attempts) || 1,
    segmentCount: mapped.length
  });
  completedState.error = "";
  completedState.errorCode = "";
  await saveVideoCaptureState(completedState);
  latestVideoProgressState = completedState;
  await broadcastVideoState(completedState);
  return { state: completedState };
}

async function handleOffscreenVideoStopped(message) {
  const state = await loadVideoCaptureState();
  if (!state || state.jobId !== message.jobId) return { state };
  if (state.status === "error" && state.errorCode) {
    state.pendingChunkCount = 0;
    state.transcriptionStatus = "error";
  } else if (message.discardAll && state.status === "error") {
    state.result = null;
    state.capturedMs = 0;
    state.liveCapturedMs = 0;
  } else if (message.discardAll) {
    state.status = "aborted";
    state.result = null;
    state.capturedMs = 0;
  } else if ((state.result?.segments || []).length >= 3) {
    state.status = "ready";
    state.completedAt = Date.now();
  } else {
    state.status = "error";
    state.error = "Automatic transcription did not capture enough speech. Play more of the video or paste a timestamped transcript.";
  }
  state.liveCapturedMs = message.discardAll
    ? 0
    : Math.max(Number(state.liveCapturedMs) || 0, Number(message.liveCapturedMs) || 0);
  state.samplesObserved = !message.discardAll && (Number(message.totalInputSamples) > 0 || Boolean(state.samplesObserved));
  state.audioLevel = Math.max(0, Math.min(1, Number(message.audioLevel) || 0));
  state.peakAudioLevel = Math.max(Number(state.peakAudioLevel) || 0, Math.min(1, Number(message.peakAudioLevel) || 0));
  state.updatedAt = Date.now();
  await saveVideoCaptureState(state);
  latestVideoProgressState = null;
  await updateVideoCaptureBadge(false);
  await broadcastVideoState(state);
  // Do not close the sender while it is still awaiting this event response.
  return { state, closeOffscreenAfterResponse: true };
}

async function handleOffscreenVideoError(message) {
  const state = await loadVideoCaptureState();
  if (!state || (message.jobId && state.jobId !== message.jobId)) return { state };
  if (state.status === "error" && state.errorCode) {
    state.pendingChunkCount = 0;
    state.updatedAt = Date.now();
    await saveVideoCaptureState(state);
    latestVideoProgressState = null;
    await updateVideoCaptureBadge(false);
    await broadcastVideoState(state);
    return { state, closeOffscreenAfterResponse: true };
  }
  state.status = "error";
  state.error = String(message.message || "Automatic video transcription failed.").slice(0, 300);
  state.errorCode = String(message.code || "VIDEO_CAPTURE_ERROR").slice(0, 80);
  state.result = null;
  state.updatedAt = Date.now();
  await saveVideoCaptureState(state);
  latestVideoProgressState = null;
  await updateVideoCaptureBadge(false);
  await broadcastVideoState(state);
  // START failures are reported by the offscreen document before it answers
  // the original START request. Closing it here would tear down both ports.
  return { state, closeOffscreenAfterResponse: true };
}

async function stopVideoCapture(reason, discard) {
  const state = await loadVideoCaptureState();
  if (!state?.jobId) return { state };
  if (latestVideoProgressState?.jobId === state.jobId) {
    [
      "liveCapturedMs",
      "samplesObserved",
      "audioLevel",
      "peakAudioLevel",
      "bufferedMs",
      "receivedChunkCount",
      "lastSampleAt",
      "lastAudibleAt"
    ].forEach((key) => {
      if (latestVideoProgressState[key] !== undefined) state[key] = latestVideoProgressState[key];
    });
  }
  state.status = discard ? "aborting" : "processing";
  state.updatedAt = Date.now();
  await saveVideoCaptureState(state);
  await broadcastVideoState(state);
  let response;
  try {
    response = await sendVideoOffscreenMessage({
      type: Video.MESSAGE_TYPES.STOP,
      jobId: state.jobId,
      reason,
      discard: Boolean(discard)
    });
  } catch (error) {
    const normalized = Video.toCaptureStartError(error, "capture stop");
    state.status = discard ? "aborted" : "error";
    state.result = null;
    state.capturedMs = 0;
    state.chunkCount = 0;
    state.error = discard ? "" : normalized.message;
    state.errorCode = discard ? "" : normalized.code;
    state.updatedAt = Date.now();
    await saveVideoCaptureState(state);
    await closeVideoOffscreenDocument();
    await updateVideoCaptureBadge(false);
    await broadcastVideoState(state);
    if (!discard) throw normalized;
    return { state };
  }
  if (response?.ok === false) {
    const error = new Video.VideoCaptureError("CAPTURE_STOP_FAILED", response.error || "Tab-audio capture could not stop cleanly.");
    state.status = discard ? "aborted" : "error";
    state.result = null;
    state.capturedMs = 0;
    state.chunkCount = 0;
    state.error = discard ? "" : error.message;
    state.errorCode = discard ? "" : error.code;
    state.updatedAt = Date.now();
    await saveVideoCaptureState(state);
    await closeVideoOffscreenDocument();
    await updateVideoCaptureBadge(false);
    await broadcastVideoState(state);
    if (!discard) throw error;
    return { state };
  }
  return { state: await loadVideoCaptureState() };
}

async function transcribeVideoChunk(chunk, jobId) {
  const settingsResult = await chrome.storage.local.get("neatMindSettings");
  const settings = settingsResult.neatMindSettings || {};
  const configuredEndpoint = Object.prototype.hasOwnProperty.call(settings, "apiEndpoint")
    ? settings.apiEndpoint
    : DEFAULT_BACKEND_ENDPOINT;
  const endpoint = deriveWorkerBackendEndpoint(configuredEndpoint, "transcript-chunk");
  if (!endpoint) throw new Video.VideoCaptureError("BACKEND_REQUIRED", "Configure the Gemini backend before automatic transcription.");
  const headers = { "Content-Type": "application/json" };
  const token = getBoundBackendAccessToken(settings, endpoint);
  if (token) headers.Authorization = `Bearer ${token}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), VIDEO_TRANSCRIPTION_TIMEOUT_MS);
  let response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({ jobId, chunk }),
      signal: controller.signal
    });
  } catch (error) {
    if (controller.signal.aborted || error?.name === "AbortError") {
      throw new Video.VideoCaptureError(
        "TRANSCRIPTION_TIMEOUT",
        "Audio transcription took too long. The capture was stopped; check the backend and try again."
      );
    }
    throw new Video.VideoCaptureError(
      "TRANSCRIPTION_BACKEND_UNAVAILABLE",
      "Tab audio arrived, but the configured Gemini backend could not be reached. Start or configure the backend, then capture again.",
      { cause: String(error?.message || error || "network error").slice(0, 200) }
    );
  } finally {
    clearTimeout(timeout);
  }
  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Video.VideoCaptureError(
      "TRANSCRIPTION_INVALID_RESPONSE",
      "The configured backend returned a non-JSON audio transcription response. Restart or update the NeatMind backend."
    );
  }
  if (!response.ok) {
    const backendCode = String(payload?.code || "").slice(0, 80);
    if (response.status === 403) {
      throw new Video.VideoCaptureError(
        backendCode || "TRANSCRIPTION_AUTH_FAILED",
        getVideoBackendAuthorizationMessage(backendCode)
      );
    }
    if (backendCode === "GEMINI_API_KEY_MISSING") {
      throw new Video.VideoCaptureError(backendCode, payload.error || "The backend needs GEMINI_API_KEY and a restart.");
    }
    throw new Video.VideoCaptureError(
      backendCode || "TRANSCRIPTION_FAILED",
      payload?.error || `The backend could not transcribe audio chunk ${String(chunk?.id || "").slice(0, 100)}.`
    );
  }
  const segments = Array.isArray(payload?.segments) ? payload.segments : null;
  if (!segments) {
    throw new Video.VideoCaptureError(
      "TRANSCRIPTION_INVALID_RESPONSE",
      "The backend response did not include a transcript segment list. Restart or update the NeatMind backend."
    );
  }
  if (!segments.length) {
    throw new Video.VideoCaptureError(
      "EMPTY_TRANSCRIPT_CHUNK",
      "The Gemini backend received this WAV audio chunk but returned no intelligible speech segments."
    );
  }
  return {
    segments,
    attempts: Math.max(1, Math.round(Number(payload.attempts) || 1))
  };
}

async function preflightVideoTranscriptionBackend() {
  const settingsResult = await chrome.storage.local.get("neatMindSettings");
  const settings = settingsResult.neatMindSettings || {};
  const configuredEndpoint = Object.prototype.hasOwnProperty.call(settings, "apiEndpoint")
    ? settings.apiEndpoint
    : DEFAULT_BACKEND_ENDPOINT;
  const endpoint = deriveWorkerBackendEndpoint(configuredEndpoint, "transcript-preflight");
  if (!endpoint) {
    throw new Video.VideoCaptureError(
      "BACKEND_REQUIRED",
      "Configure a trusted HTTPS or local NeatMind backend before starting tab-audio transcription."
    );
  }
  const token = getBoundBackendAccessToken(settings, endpoint);
  const headers = { "Content-Type": "application/json" };
  // A loopback backend may authenticate the exact configured extension Origin.
  // Chrome supplies Origin itself; do not synthesize or override that header.
  if (token) headers.Authorization = `Bearer ${token}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), VIDEO_BACKEND_PREFLIGHT_TIMEOUT_MS);
  let response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: "{}",
      signal: controller.signal
    });
  } catch (error) {
    const extensionOrigin = chrome.runtime.getURL("").replace(/\/$/, "");
    throw new Video.VideoCaptureError(
      "TRANSCRIPTION_BACKEND_UNAVAILABLE",
      controller.signal.aborted
        ? "The NeatMind backend did not respond before recording. Start or restart it, then try again."
        : `The NeatMind backend could not be reached or does not allow ${extensionOrigin}. Start it and add this exact origin to ALLOWED_EXTENSION_ORIGINS.`,
      { cause: String(error?.message || error || "network error").slice(0, 200) }
    );
  } finally {
    clearTimeout(timeout);
  }
  const payload = await response.json().catch(() => ({}));
  if (response.status === 403) {
    const backendCode = String(payload?.code || "TRANSCRIPTION_AUTH_FAILED").slice(0, 80);
    throw new Video.VideoCaptureError(
      backendCode,
      getVideoBackendAuthorizationMessage(backendCode)
    );
  }
  if (!response.ok || payload?.ok !== true) {
    const code = String(payload?.code || "TRANSCRIPTION_BACKEND_NOT_READY").slice(0, 80);
    throw new Video.VideoCaptureError(
      code,
      payload?.error || "The NeatMind backend is not ready for Gemini WAV transcription. Restart it and try again."
    );
  }
  return payload;
}

function getVideoBackendAuthorizationMessage(code) {
  const extensionOrigin = chrome.runtime.getURL("").replace(/\/$/, "");
  if (code === "ORIGIN_NOT_ALLOWED") {
    return `The local backend does not allow this extension. Add ${extensionOrigin} exactly to ALLOWED_EXTENSION_ORIGINS in .env, then restart the backend.`;
  }
  if (code === "BACKEND_TOKEN_REQUIRED") {
    return "This backend requires an access token. The bundled loopback backend works without manual token entry when this extension's exact origin is allowlisted; remote backends still require a token in Settings.";
  }
  if (code === "BACKEND_TOKEN_INVALID") {
    return "The saved backend access token is invalid. Clear or replace it in Settings. The allowlisted loopback backend does not need a manually entered token.";
  }
  return "The backend rejected this transcription request. Check its allowed extension origin and access-token configuration.";
}

function mergeEstimatedTranscriptSegments(existing, incoming) {
  const sorted = [...existing, ...incoming]
    .filter((segment) => segment?.text)
    .sort((first, second) => first.startMs - second.startMs || first.endMs - second.endMs);
  const result = [];
  const seen = new Set();
  for (const segment of sorted) {
    const key = `${segment.startMs}:${String(segment.text).toLocaleLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const previous = result.at(-1);
    if (previous && segment.startMs < previous.endMs) continue;
    result.push({ ...segment, id: `seg-${String(result.length + 1).padStart(4, "0")}` });
  }
  return result.slice(0, 500);
}

function deriveWorkerBackendEndpoint(value, routeName) {
  try {
    const endpoint = new URL(String(value || "http://127.0.0.1:8787/api/study-session"));
    if (!String(value || "").trim()) return "";
    const hostname = endpoint.hostname.toLowerCase().replace(/^\[|\]$/g, "");
    const loopback = ["127.0.0.1", "localhost", "::1"].includes(hostname);
    if (endpoint.protocol !== "https:" && !(endpoint.protocol === "http:" && loopback)) return "";
    endpoint.pathname = `/api/${routeName}`;
    endpoint.search = "";
    endpoint.hash = "";
    return endpoint.toString();
  } catch {
    return "";
  }
}

function getBoundBackendAccessToken(settings, endpoint) {
  const token = String(settings?.backendAccessToken || "").trim();
  if (!token) return "";
  try {
    const requestOrigin = new URL(String(endpoint || "")).origin;
    const configuredOrigin = new URL(String(settings?.apiEndpoint || DEFAULT_BACKEND_ENDPOINT)).origin;
    const tokenOrigin = String(settings?.backendTokenOrigin || configuredOrigin);
    return requestOrigin === tokenOrigin ? token : "";
  } catch {
    return "";
  }
}

async function loadVideoCaptureState() {
  const result = await chrome.storage.local.get(VIDEO_CAPTURE_STORAGE_KEY);
  const storedState = result[VIDEO_CAPTURE_STORAGE_KEY] || null;
  return storedState ? { ...storedState, protocolVersion: VIDEO_CAPTURE_PROTOCOL_VERSION } : null;
}

async function reconcileVideoCaptureState(reason = "worker restart") {
  const storedState = await loadVideoCaptureState();
  if (!storedState || !ACTIVE_VIDEO_CAPTURE_STATUSES.has(storedState.status)) {
    if (storedState) await updateVideoCaptureBadge(false).catch(() => undefined);
    await closeIdleVideoOffscreenDocument();
    return storedState;
  }

  try {
    const hasDocument = await hasVideoOffscreenDocument();
    if (!hasDocument) return markVideoCaptureInterrupted(storedState, reason);
    const response = await sendVideoOffscreenMessage({
      type: Video.MESSAGE_TYPES.GET_STATE,
      jobId: storedState.jobId
    });
    if (response?.ok === false || !response?.active || response.jobId !== storedState.jobId) {
      return markVideoCaptureInterrupted(storedState, reason);
    }

    const latestState = await loadVideoCaptureState();
    if (!latestState || latestState.jobId !== storedState.jobId) return latestState;
    latestState.status = response.recording ? "recording" : "paused";
    latestState.capturedMs = Math.max(Number(latestState.capturedMs) || 0, Number(response.capturedMs) || 0);
    latestState.liveCapturedMs = Math.max(Number(latestState.liveCapturedMs) || 0, Number(response.liveCapturedMs) || 0);
    latestState.chunkCount = Math.max(Number(latestState.chunkCount) || 0, Number(response.chunkCount) || 0);
    latestState.receivedChunkCount = Math.max(Number(latestState.receivedChunkCount) || 0, Number(response.chunkCount) || 0);
    latestState.samplesObserved = Boolean(response.samplesObserved) || Boolean(latestState.samplesObserved);
    latestState.audioLevel = Math.max(0, Math.min(1, Number(response.audioLevel) || 0));
    latestState.peakAudioLevel = Math.max(Number(latestState.peakAudioLevel) || 0, Math.min(1, Number(response.peakAudioLevel) || 0));
    latestState.updatedAt = Date.now();
    await saveVideoCaptureState(latestState);
    await updateVideoCaptureBadge(true);
    await broadcastVideoState(latestState);
    return latestState;
  } catch {
    return markVideoCaptureInterrupted(storedState, reason);
  }
}

async function markVideoCaptureInterrupted(storedState, reason) {
  const latestState = await loadVideoCaptureState();
  if (!latestState || latestState.jobId !== storedState.jobId) return latestState;
  latestState.status = "error";
  latestState.error = `Automatic transcription was interrupted by ${String(reason || "a browser restart").slice(0, 80)}. Start a new capture.`;
  latestState.result = null;
  latestState.capturedMs = 0;
  latestState.liveCapturedMs = 0;
  latestState.chunkCount = 0;
  latestState.receivedChunkCount = 0;
  latestState.samplesObserved = false;
  latestState.updatedAt = Date.now();
  await saveVideoCaptureState(latestState);
  await closeVideoOffscreenDocument();
  await updateVideoCaptureBadge(false).catch(() => undefined);
  await broadcastVideoState(latestState);
  return latestState;
}

async function saveVideoCaptureState(state) {
  const safeState = state ? JSON.parse(JSON.stringify(state)) : null;
  if (safeState) await chrome.storage.local.set({ [VIDEO_CAPTURE_STORAGE_KEY]: safeState });
  else await chrome.storage.local.remove(VIDEO_CAPTURE_STORAGE_KEY);
  return safeState;
}

async function broadcastVideoState(state) {
  try {
    await chrome.runtime.sendMessage({ type: "VIDEO_CAPTURE_STATE_CHANGED", state });
  } catch {
    // No popup is open.
  }
}

async function updateVideoCaptureBadge(active) {
  if (active) {
    await chrome.action.setBadgeText({ text: "REC" });
    await chrome.action.setBadgeBackgroundColor({ color: "#b3261e" });
    await chrome.action.setTitle({ title: "NeatMind — transcribing current tab audio" });
    return;
  }
  const focusState = await loadFocusState().catch(() => Focus.createDefaultFocusState(Date.now()));
  await updateFocusBadge(focusState, Date.now());
}

async function broadcastFocusState(state) {
  try {
    await chrome.runtime.sendMessage({ type: "FOCUS_STATE_CHANGED", state });
  } catch {
    // No popup is open.
  }
}

async function broadcastChapterFocusState(state) {
  try {
    await chrome.runtime.sendMessage({ type: "CHAPTER_FOCUS_STATE_CHANGED", state });
  } catch {
    // No Learning Tree page is open.
  }
}

function isVideoOffscreenSender(sender) {
  const expected = chrome.runtime.getURL("offscreen.html");
  return sender?.id === chrome.runtime.id && String(sender?.url || "") === expected;
}

function sendVideoOffscreenMessage(message, timeoutMs = Video.CAPTURE_START_TIMEOUT_MS) {
  const outbound = { ...message, target: "offscreen" };
  try {
    const responsePromise = Video.invokeChromeCallbackOrPromise(
      (callback) => chrome.runtime.sendMessage(outbound, callback),
      () => chrome.runtime?.lastError
    );
    return Video.withTimeout(
      responsePromise,
      timeoutMs,
      () => new Video.VideoCaptureError(
        "OFFSCREEN_RESPONSE_TIMEOUT",
        "The tab-audio recorder did not respond in time. Capture was stopped; try again."
      )
    ).catch((error) => {
      throw Video.toCaptureStartError(error, `offscreen ${String(message?.type || "operation")}`);
    });
  } catch (error) {
    return Promise.reject(Video.toCaptureStartError(error, "offscreen message"));
  }
}

async function hasVideoOffscreenDocument() {
  const documentUrl = chrome.runtime.getURL("offscreen.html");
  if (typeof chrome.runtime?.getContexts === "function") {
    const contexts = await chrome.runtime.getContexts({
      contextTypes: ["OFFSCREEN_DOCUMENT"],
      documentUrls: [documentUrl]
    });
    return Array.isArray(contexts) && contexts.length > 0;
  }
  if (typeof chrome.offscreen?.hasDocument === "function") {
    return chrome.offscreen.hasDocument();
  }
  return false;
}

async function ensureVideoOffscreenDocument() {
  if (creatingVideoOffscreenDocument) return creatingVideoOffscreenDocument;
  if (await hasVideoOffscreenDocument()) return;
  if (creatingVideoOffscreenDocument) return creatingVideoOffscreenDocument;
  creatingVideoOffscreenDocument = chrome.offscreen.createDocument({
    url: "offscreen.html",
    reasons: ["USER_MEDIA"],
    justification: "Capture user-approved current-tab audio for timestamped study transcription."
  });
  try {
    await creatingVideoOffscreenDocument;
  } finally {
    creatingVideoOffscreenDocument = null;
  }
}

async function closeVideoOffscreenDocument() {
  if (creatingVideoOffscreenDocument) await creatingVideoOffscreenDocument.catch(() => undefined);
  if (!await hasVideoOffscreenDocument()) return;
  await chrome.offscreen.closeDocument().catch(() => undefined);
}

async function closeIdleVideoOffscreenDocument() {
  if (videoStreamReservations.size) return;
  const state = await loadVideoCaptureState().catch(() => null);
  if (state && ACTIVE_VIDEO_CAPTURE_STATUSES.has(state.status)) return;
  await closeVideoOffscreenDocument().catch(() => undefined);
}

async function installVideoPlayerObserver(tabId, jobId) {
  const results = await chrome.scripting.executeScript({
    target: { tabId },
    func: (captureJobId) => {
      const videos = [...document.querySelectorAll("video")];
      const video = videos.sort((first, second) => {
        const a = first.getBoundingClientRect();
        const b = second.getBoundingClientRect();
        return b.width * b.height - a.width * a.height;
      })[0];
      if (!video) return false;
      const previous = window.__neatMindVideoObserver;
      if (previous?.cleanup) previous.cleanup();
      const send = (action) => chrome.runtime.sendMessage({
        type: "VIDEO_PLAYER_EVENT",
        jobId: captureJobId,
        action,
        mediaTimeMs: Math.max(0, Math.round((Number(video.currentTime) || 0) * 1000)),
        playbackRate: Number(video.playbackRate) || 1,
        recording: !video.paused && !video.ended
      }).catch(() => undefined);
      const handlers = {
        playing: () => send("play"),
        pause: () => { if (!video.ended) send("pause"); },
        seeking: () => send("seek"),
        seeked: () => send("seek"),
        waiting: () => send("pause"),
        stalled: () => send("pause"),
        ratechange: () => send("rate"),
        ended: () => send("ended"),
        emptied: () => send("media-changed")
      };
      Object.entries(handlers).forEach(([event, handler]) => video.addEventListener(event, handler));
      const pageHide = () => send("navigation");
      window.addEventListener("pagehide", pageHide, { once: true });
      window.__neatMindVideoObserver = {
        cleanup() {
          Object.entries(handlers).forEach(([event, handler]) => video.removeEventListener(event, handler));
          window.removeEventListener("pagehide", pageHide);
        }
      };
      return true;
    },
    args: [jobId]
  });
  return results?.[0]?.result !== false;
}

function serializeVideoError(error) {
  return {
    code: String(error?.code || "VIDEO_CAPTURE_ERROR").slice(0, 80),
    message: safeErrorMessage(error) || "Automatic video transcription could not complete."
  };
}

async function handleFocusMessage(message) {
  switch (message.type) {
    case Focus.MESSAGE_TYPES.GET_STATE:
      return reconcileFocusState("state request");
    case Focus.MESSAGE_TYPES.START:
      return startFocus(message);
    case Focus.MESSAGE_TYPES.STOP:
      return stopFocus();
    case Focus.MESSAGE_TYPES.BREAK:
      return startFocusBreak();
    default:
      throw new Focus.FocusError("UNKNOWN_MESSAGE", "Unknown Focus mode request.");
  }
}

async function handleChapterFocusMessage(message, sender) {
  const now = Date.now();
  const reconciled = await reconcileChapterFocusState("chapter timer request");
  let next = reconciled;
  const input = {
    chapterId: message.chapterId,
    chapterTitle: message.chapterTitle,
    ownerId: message.ownerId,
    ownerTabId: Number.isInteger(sender?.tab?.id) ? sender.tab.id : null
  };
  switch (message.type) {
    case Focus.CHAPTER_MESSAGE_TYPES.GET_STATE:
      return reconciled;
    case Focus.CHAPTER_MESSAGE_TYPES.SELECT:
      next = Focus.selectChapterFocusState(reconciled, input, now);
      break;
    case Focus.CHAPTER_MESSAGE_TYPES.START:
    case Focus.CHAPTER_MESSAGE_TYPES.RESUME:
      next = Focus.startChapterFocusState(reconciled, input, now, createSessionId());
      break;
    case Focus.CHAPTER_MESSAGE_TYPES.PAUSE:
      if (!reconciled.active || reconciled.ownerId === String(message.ownerId || "")) {
        next = Focus.pauseChapterFocusState(reconciled, now, message.outcome || "paused");
      }
      break;
    case Focus.CHAPTER_MESSAGE_TYPES.ACTIVITY:
      next = Focus.recordChapterFocusActivity(reconciled, input, now);
      break;
    default:
      throw new Focus.FocusError("UNKNOWN_MESSAGE", "Unknown chapter Focus request.");
  }
  if (JSON.stringify(next) !== JSON.stringify(reconciled)) await saveChapterFocusState(next);
  await syncChapterFocusAlarm(next);
  return Focus.normalizeChapterFocusState(next, now);
}

async function loadChapterFocusState() {
  const result = await chrome.storage.local.get(Focus.CHAPTER_STORAGE_KEY);
  return Focus.normalizeChapterFocusState(result?.[Focus.CHAPTER_STORAGE_KEY], Date.now());
}

async function saveChapterFocusState(state) {
  const normalized = Focus.normalizeChapterFocusState(state, Date.now());
  await chrome.storage.local.set({ [Focus.CHAPTER_STORAGE_KEY]: normalized });
  return normalized;
}

async function reconcileChapterFocusState(reason) {
  const now = Date.now();
  const stored = await loadChapterFocusState();
  const reconciled = Focus.reconcileChapterFocusState(stored, now);
  if (reconciled.changed) await saveChapterFocusState(reconciled.state);
  await syncChapterFocusAlarm(reconciled.state);
  void reason;
  return Focus.normalizeChapterFocusState(reconciled.state, now);
}

async function pauseChapterFocusForOwnedTab(tabId, outcome = "closed") {
  const stored = await loadChapterFocusState();
  if (!stored.active || stored.ownerTabId !== tabId) return null;
  const next = Focus.pauseChapterFocusState(stored, Date.now(), outcome);
  await saveChapterFocusState(next);
  await syncChapterFocusAlarm(next);
  return next;
}

async function syncChapterFocusAlarm(stateValue) {
  await chrome.alarms.clear(Focus.CHAPTER_IDLE_ALARM);
  const state = Focus.normalizeChapterFocusState(stateValue, Date.now());
  if (!state.active || state.lastActivityAt === null) return;
  await chrome.alarms.create(Focus.CHAPTER_IDLE_ALARM, {
    when: state.lastActivityAt + Focus.CHAPTER_IDLE_TIMEOUT_MS
  });
}

async function startFocus(message) {
  const now = Date.now();
  const durationMinutes = Focus.normalizeDurationMinutes(message.durationMinutes);
  const rules = Focus.normalizeFocusRules(message.rules);
  Focus.validateFocusPermissionManifest(chrome.runtime.getManifest());
  const missingOrigins = await findMissingHostOrigins(rules);
  if (missingOrigins.length) {
    throw new Focus.FocusError(
      "HOST_PERMISSION_REQUIRED",
      "Allow access to the listed distracting sites, then start Focus mode again.",
      { origins: missingOrigins }
    );
  }

  const previous = await loadFocusState();
  const next = Focus.startFocusState(
    previous,
    { durationMinutes, rules },
    now,
    createSessionId()
  );
  await saveFocusState(next);

  try {
    await replaceManagedSessionRules(Focus.buildSessionDnrRules(next.rules));
    await syncFocusAlarms(next, now);
    await updateFocusBadge(next, now);
    return Focus.toPublicFocusState(next, now);
  } catch (error) {
    const failed = Focus.stopFocusState(next, Date.now(), "error");
    failed.lastError = "Focus mode could not install its browser blocking rules.";
    await saveFocusState(failed).catch(() => undefined);
    await removeManagedSessionRules().catch(() => undefined);
    await clearFocusAlarms().catch(() => undefined);
    await updateFocusBadge(failed, Date.now()).catch(() => undefined);
    throw new Focus.FocusError(
      "DNR_UPDATE_FAILED",
      "Focus mode could not block those sites. Confirm site access is allowed and try again.",
      { cause: safeErrorMessage(error) }
    );
  }
}

async function stopFocus() {
  const now = Date.now();
  let removalError = null;
  try {
    await removeManagedSessionRules();
    await clearFocusAlarms();
  } catch (error) {
    removalError = error;
  }

  let previous;
  try {
    previous = await loadFocusState();
  } catch {
    previous = Focus.createDefaultFocusState(now);
  }
  const next = Focus.stopFocusState(previous, now, "stopped");

  try {
    await saveFocusState(next);
  } catch (error) {
    // Removing the state is a safe fallback: a restarted worker then stays inactive.
    try {
      await chrome.storage.local.remove(Focus.STORAGE_KEY);
    } catch {
      throw new Focus.FocusError(
        "FOCUS_STOP_PERSIST_FAILED",
        "Blocking rules were removed, but Chrome could not save the stopped state. Disable the extension if blocking returns.",
        { cause: safeErrorMessage(error) }
      );
    }
  }

  if (removalError) {
    await scheduleReconciliationRetry();
    await updateFocusBadge(next, now).catch(() => undefined);
    throw new Focus.FocusError(
      "FOCUS_STOP_RETRYING",
      "Focus mode is stopped and browser rules are being removed. Reopen the extension if the page remains blocked.",
      { cause: safeErrorMessage(removalError) }
    );
  }
  await updateFocusBadge(next, now);
  return Focus.toPublicFocusState(next, now);
}

async function startFocusBreak() {
  const now = Date.now();
  const previous = await loadFocusState();
  const reconciled = Focus.reconcileFocusState(previous, now).state;
  const next = Focus.applyFiveMinuteBreak(reconciled, now);

  let removalError = null;
  try {
    await removeManagedSessionRules();
  } catch (error) {
    removalError = error;
  }

  try {
    await saveFocusState(next);
  } catch (error) {
    // The rules are already removed. Clear stored focus state so it cannot be rebuilt.
    await chrome.storage.local.remove(Focus.STORAGE_KEY).catch(() => undefined);
    await clearFocusAlarms().catch(() => undefined);
    throw new Focus.FocusError(
      "BREAK_PERSIST_FAILED",
      "Blocking rules were removed, but the break could not be saved, so Focus mode was stopped.",
      { cause: safeErrorMessage(error) }
    );
  }

  if (removalError) {
    await scheduleReconciliationRetry();
    await updateFocusBadge(next, now).catch(() => undefined);
    throw new Focus.FocusError(
      "BREAK_START_RETRYING",
      "The five-minute break is saved and browser rules are being removed. Reopen the extension if the site remains blocked.",
      { cause: safeErrorMessage(removalError) }
    );
  }
  await syncFocusAlarms(next, now);
  await updateFocusBadge(next, now);
  return Focus.toPublicFocusState(next, now);
}

async function reconcileFocusState(reason) {
  const now = Date.now();
  const stored = await loadFocusState();
  const reconciled = Focus.reconcileFocusState(stored, now);
  let state = reconciled.state;
  let changed = reconciled.changed;

  if (state.active) {
    const missingOrigins = await findMissingHostOrigins(state.rules);
    if (missingOrigins.length) {
      state = Focus.stopFocusState(state, now, "permission_removed");
      state.lastError = "Focus mode stopped because site access was removed.";
      changed = true;
    }
  }

  if (changed) await saveFocusState(state);

  const expectedRules = Focus.shouldBlock(state, now)
    ? Focus.buildSessionDnrRules(state.rules)
    : [];
  await replaceManagedSessionRules(expectedRules);
  await syncFocusAlarms(state, now);
  await updateFocusBadge(state, now);
  void reason;
  return Focus.toPublicFocusState(state, now);
}

async function loadFocusState() {
  const result = await chrome.storage.local.get(Focus.STORAGE_KEY);
  return Focus.normalizeFocusState(result?.[Focus.STORAGE_KEY], Date.now());
}

async function saveFocusState(state) {
  const normalized = Focus.normalizeFocusState(state, Date.now());
  await chrome.storage.local.set({ [Focus.STORAGE_KEY]: normalized });
  return normalized;
}

async function restrictStorageToTrustedContexts() {
  if (typeof chrome.storage?.local?.setAccessLevel !== "function") return;
  try {
    await chrome.storage.local.setAccessLevel({ accessLevel: "TRUSTED_CONTEXTS" });
  } catch (error) {
    // Older supported Chromium builds may not expose this hardening option.
    logFocusError("storage access hardening", error);
  }
}

async function findMissingHostOrigins(rules) {
  const origins = Focus.getRequiredOrigins(rules);
  if (typeof chrome.permissions?.contains !== "function") {
    throw new Focus.FocusError(
      "PERMISSION_CHECK_UNAVAILABLE",
      "Chrome could not verify access to the distracting sites."
    );
  }

  const checks = await Promise.all(origins.map(async (origin) => {
    try {
      const granted = await chrome.permissions.contains({ origins: [origin] });
      return granted ? null : origin;
    } catch (error) {
      throw new Focus.FocusError(
        "PERMISSION_CHECK_FAILED",
        "Chrome could not verify site access. Reopen the extension and try again.",
        { cause: safeErrorMessage(error) }
      );
    }
  }));
  return checks.filter(Boolean);
}

async function replaceManagedSessionRules(expectedRules) {
  const allRules = await chrome.declarativeNetRequest.getSessionRules();
  const existing = (allRules || [])
    .filter((rule) => Focus.isManagedRuleId(rule.id))
    .sort((first, second) => first.id - second.id);
  const expected = [...expectedRules].sort((first, second) => first.id - second.id);
  if (rulesAreEqual(existing, expected)) return;

  const update = {
    removeRuleIds: existing.map((rule) => rule.id)
  };
  if (expected.length) update.addRules = expected;
  if (!update.removeRuleIds.length && !expected.length) return;
  await chrome.declarativeNetRequest.updateSessionRules(update);
}

async function removeManagedSessionRules() {
  await replaceManagedSessionRules([]);
}

function rulesAreEqual(firstRules, secondRules) {
  if (firstRules.length !== secondRules.length) return false;
  return JSON.stringify(firstRules) === JSON.stringify(secondRules);
}

async function syncFocusAlarms(stateValue, now = Date.now()) {
  const state = Focus.normalizeFocusState(stateValue, now);
  await clearFocusAlarms();
  if (!state.active) return;

  if (state.endsAt > now) {
    await chrome.alarms.create(Focus.END_ALARM, { when: state.endsAt });
  }
  if (state.breakUntil && state.breakUntil > now) {
    await chrome.alarms.create(Focus.BREAK_ALARM, { when: state.breakUntil });
  }
}

async function clearFocusAlarms() {
  await Promise.all([
    chrome.alarms.clear(Focus.END_ALARM),
    chrome.alarms.clear(Focus.BREAK_ALARM)
  ]);
}

async function scheduleReconciliationRetry() {
  try {
    await chrome.alarms.create(Focus.END_ALARM, { when: Date.now() + 30 * 1000 });
  } catch (error) {
    logFocusError("retry scheduling", error);
  }
}

async function updateFocusBadge(stateValue, now = Date.now()) {
  const state = Focus.toPublicFocusState(stateValue, now);
  const text = state.status === "break"
    ? "BRK"
    : state.status === "active"
      ? formatBadgeMinutes(state.remainingMs)
      : "";
  await chrome.action.setBadgeText({ text });
  if (text) {
    await chrome.action.setBadgeBackgroundColor({
      color: state.status === "break" ? "#2f9d8f" : "#496bdb"
    });
  }
  await chrome.action.setTitle({
    title: state.status === "break"
      ? "NeatMind — five-minute Focus break"
      : state.status === "active"
        ? `NeatMind — Focus mode: ${Math.ceil(state.remainingMs / 60000)} min left`
        : "NeatMind"
  });
}

function formatBadgeMinutes(remainingMs) {
  const minutes = Math.max(1, Math.ceil(Number(remainingMs || 0) / 60000));
  return minutes > 99 ? "99+" : String(minutes);
}

function createSessionId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `focus-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function serializeFocusError(error) {
  const details = error?.details && typeof error.details === "object" ? error.details : {};
  const payload = {
    code: String(error?.code || "FOCUS_ERROR").slice(0, 80),
    message: safeErrorMessage(error) || "Focus mode could not complete that action."
  };
  if (Array.isArray(details.origins)) {
    payload.origins = details.origins.map((origin) => String(origin)).slice(0, Focus.MAX_RULES);
  }
  return payload;
}

function safeErrorMessage(error) {
  return String(error?.message || "").replace(/\s+/g, " ").trim().slice(0, 240);
}

function logFocusError(context, error) {
  console.warn(`[NeatMind Focus] ${context}: ${safeErrorMessage(error) || "unknown error"}`);
}
