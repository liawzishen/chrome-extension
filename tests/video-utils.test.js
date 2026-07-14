const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const Video = require("../video-utils.js");

function source(overrides = {}) {
  return {
    tabId: 9,
    url: "https://video.example.test/lesson#chapter-2",
    title: "Cell transport",
    currentSrc: "https://cdn.example.test/cell-transport-v1.mp4?token=stable",
    poster: "https://cdn.example.test/cell-transport.jpg",
    tracks: [
      {
        kind: "captions",
        language: "en",
        label: "English",
        src: "https://cdn.example.test/cell-transport-en.vtt"
      }
    ],
    durationMs: 300_000,
    seekable: true,
    capturedAt: 1_700_000_000_000,
    ...overrides
  };
}

test("builds a stable source snapshot without using duration as media identity", () => {
  const first = Video.normalizeSourceSnapshot(source());
  const durationChanged = Video.normalizeSourceSnapshot(source({ durationMs: 302_500 }));

  assert.equal(first.canonicalUrl, "https://video.example.test/lesson");
  assert.equal(first.durationMs, 300_000);
  assert.equal(durationChanged.durationMs, 302_500);
  assert.equal(first.mediaKey, durationChanged.mediaKey);
  assert.equal(first.sourceFingerprint, durationChanged.sourceFingerprint);
  assert.equal(Video.sourceSnapshotsMatch(first, durationChanged), true);
});

test("detects an equal-duration media replacement on the same SPA route", () => {
  const before = Video.normalizeSourceSnapshot(source());
  const after = Video.normalizeSourceSnapshot(source({
    currentSrc: "https://cdn.example.test/cell-transport-v2.mp4?token=stable",
    poster: "https://cdn.example.test/cell-transport-v2.jpg",
    durationMs: 300_000
  }));
  const comparison = Video.compareSourceSnapshots(before, after);

  assert.equal(comparison.matches, false);
  assert.ok(comparison.reasons.includes("MEDIA_CHANGED"));
  assert.ok(comparison.reasons.includes("FINGERPRINT_CHANGED"));
});

test("uses a blob-backed HTML5 current source as stable per-media identity", () => {
  const first = Video.normalizeSourceSnapshot(source({
    currentSrc: "blob:https://video.example.test/4d5f6a",
    poster: "",
    tracks: []
  }));
  const replacement = Video.normalizeSourceSnapshot(source({
    currentSrc: "blob:https://video.example.test/7b8c9d",
    poster: "",
    tracks: []
  }));

  assert.equal(first.identityAvailable, true);
  assert.equal(Video.sourceSnapshotsMatch(first, replacement), false);
});

test("timestamp jumps reuse the same stable media identity reader", () => {
  const popupSource = fs.readFileSync(path.join(__dirname, "..", "popup.js"), "utf8");
  const jumpStart = popupSource.indexOf("async function jumpToVideoTimestamp");
  const jumpEnd = popupSource.indexOf("async function highlightSourceText", jumpStart);
  const jumpSource = popupSource.slice(jumpStart, jumpEnd);

  assert.match(jumpSource, /await readCurrentVideoIdentity\(tab\.id\)/);
  assert.doesNotMatch(jumpSource, /currentMediaId[\s\S]*video\.duration/);
});

test("the player observer resumes only on playing and re-anchors completed seeks", () => {
  const backgroundSource = fs.readFileSync(path.join(__dirname, "..", "background.js"), "utf8");

  assert.match(backgroundSource, /playing:\s*\(\)\s*=>\s*send\("play"\)/);
  assert.match(backgroundSource, /seeked:\s*\(\)\s*=>\s*send\("seek"\)/);
  assert.match(backgroundSource, /waiting:\s*\(\)\s*=>\s*send\("pause"\)/);
  assert.match(backgroundSource, /const latestState = await loadVideoCaptureState\(\)/);
});

test("binds a transcript to one tab, route, and media fingerprint", () => {
  const snapshot = Video.normalizeSourceSnapshot(source());
  const binding = Video.createTranscriptBinding(snapshot, {
    kind: "pasted",
    createdAt: 1_700_000_001_000
  });

  assert.equal(Video.transcriptBindingMatches(binding, snapshot), true);
  assert.equal(Video.transcriptBindingMatches(binding, source({ tabId: 10 })), false);
  assert.equal(Video.transcriptBindingMatches(binding, source({ url: "https://video.example.test/other" })), false);
  assert.equal(Video.transcriptBindingMatches(binding, source({
    currentSrc: "https://cdn.example.test/replacement.mp4"
  })), false);
});

test("capture state finalizes on pause, rate, seek, and completion", () => {
  const base = 1_700_000_000_000;
  let job = Video.createCaptureJob(source(), {
    jobId: "capture-1",
    createdAt: base,
    mediaTimeMs: 10_000,
    playbackRate: 1
  });

  job = Video.transitionCaptureJob(job, {
    type: "start",
    mediaTimeMs: 10_000,
    playbackRate: 1
  }, base);
  assert.equal(job.status, "recording");

  job = Video.transitionCaptureJob(job, { type: "pause" }, base + 10_000);
  assert.equal(job.status, "paused");
  assert.equal(job.chunks[0].capturedDurationMs, 10_000);
  assert.equal(job.chunks[0].mediaEndMs, 20_000);

  job = Video.transitionCaptureJob(job, {
    type: "record",
    mediaTimeMs: 20_000,
    playbackRate: 1
  }, base + 12_000);
  job = Video.transitionCaptureJob(job, {
    type: "rate",
    mediaTimeMs: 28_000,
    playbackRate: 2
  }, base + 20_000);
  assert.equal(job.status, "recording");
  assert.equal(job.chunks[1].reason, "rate");
  assert.equal(job.activeChunk.mediaStartMs, 28_000);
  assert.equal(job.activeChunk.playbackRate, 2);

  job = Video.transitionCaptureJob(job, {
    type: "seek",
    mediaTimeMs: 100_000
  }, base + 25_000);
  assert.equal(job.status, "paused");
  assert.equal(job.chunks[2].mediaStartMs, 28_000);
  assert.equal(job.chunks[2].mediaEndMs, 38_000);
  assert.equal(job.lastMediaTimeMs, 100_000);

  job = Video.transitionCaptureJob(job, {
    type: "record",
    mediaTimeMs: 100_000,
    playbackRate: 1
  }, base + 30_000);
  job = Video.transitionCaptureJob(job, { type: "complete" }, base + 35_000);
  assert.equal(job.status, "completed");
  assert.equal(job.activeChunk, null);
  assert.equal(job.chunks.at(-1).reason, "complete");
});

test("enforces 45-second chunks and the 15-minute job ceiling", () => {
  const base = 1_700_000_000_000;
  const bounded = Video.createCaptureJob(source(), {
    createdAt: base,
    maxCaptureMs: Video.MAX_CAPTURE_MS + 60_000
  });
  assert.equal(bounded.maxCaptureMs, Video.MAX_CAPTURE_MS);

  let job = Video.createCaptureJob(source(), {
    createdAt: base,
    maxCaptureMs: 50_000
  });
  job = Video.transitionCaptureJob(job, { type: "start", mediaTimeMs: 0 }, base);
  job = Video.transitionCaptureJob(job, {
    type: "finalize",
    capturedDurationMs: 90_000,
    continueRecording: true
  }, base + 90_000);
  assert.equal(job.chunks[0].capturedDurationMs, Video.MAX_CHUNK_MS);
  assert.equal(job.status, "recording");

  job = Video.transitionCaptureJob(job, {
    type: "finalize",
    capturedDurationMs: 30_000,
    continueRecording: true
  }, base + 120_000);
  assert.equal(job.chunks[1].capturedDurationMs, 5_000);
  assert.equal(job.capturedMs, 50_000);
  assert.equal(job.status, "completed");
  assert.equal(job.activeChunk, null);
});

test("aborting discards all chunk metadata so partial evidence cannot be used", () => {
  const base = 1_700_000_000_000;
  let job = Video.createCaptureJob(source(), { createdAt: base });
  job = Video.transitionCaptureJob(job, { type: "start" }, base);
  job = Video.transitionCaptureJob(job, { type: "pause" }, base + 5_000);
  job = Video.transitionCaptureJob(job, { type: "record", mediaTimeMs: 5_000 }, base + 6_000);
  job = Video.transitionCaptureJob(job, { type: "abort", reason: "navigation" }, base + 7_000);

  assert.equal(job.status, "aborted");
  assert.equal(job.capturedMs, 0);
  assert.deepEqual(job.chunks, []);
  assert.equal(job.discardedChunkCount, 2);
});

test("maps provider-relative times through media start and playback rate", () => {
  const mapped = Video.mapProviderSegments([
    { id: "provider-a", startMs: 1_000, endMs: 2_500, text: "Diffusion moves particles." },
    { id: "provider-b", startMs: 3_000, endMs: 4_000, text: "Osmosis moves water." }
  ], {
    id: "chunk-0002",
    capturedDurationMs: 10_000,
    mediaStartMs: 50_000,
    playbackRate: 2
  }, { videoDurationMs: 120_000 });

  assert.deepEqual(mapped.map(({ startMs, endMs }) => [startMs, endMs]), [
    [52_000, 55_000],
    [56_000, 58_000]
  ]);
  assert.equal(mapped[0].timestampConfidence, "AI-estimated");
  assert.equal(mapped[0].provenance, "audio-ai");
  assert.equal(mapped[0].sourceChunkId, "chunk-0002");
});

test("rejects invalid, non-monotonic, and out-of-duration estimated timestamps", () => {
  assert.throws(() => Video.mapProviderSegments([
    { startMs: 8_000, endMs: 9_000, text: "Later" },
    { startMs: 2_000, endMs: 3_000, text: "Earlier" }
  ], {
    id: "chunk-0001",
    capturedDurationMs: 10_000,
    mediaStartMs: 0,
    playbackRate: 1
  }, { videoDurationMs: 20_000 }), (error) => error.code === "NON_MONOTONIC_SEGMENTS");

  assert.throws(() => Video.mapProviderSegments([
    { startMs: 9_000, endMs: 11_000, text: "Outside chunk" }
  ], {
    id: "chunk-0001",
    capturedDurationMs: 10_000,
    mediaStartMs: 0,
    playbackRate: 1
  }, { videoDurationMs: 20_000 }), (error) => error.code === "INVALID_SEGMENT_TIME");

  assert.throws(() => Video.validateEstimatedSegments([
    { id: "a", startMs: 1_000, endMs: 3_000, text: "Inside" },
    { id: "b", startMs: 2_000, endMs: 2_500, text: "End goes backward" }
  ], 10_000), (error) => error.code === "NON_MONOTONIC_SEGMENTS");

  assert.throws(() => Video.validateEstimatedSegments([
    { id: "a", startMs: 9_000, endMs: 11_000, text: "Past duration" }
  ], 10_000), (error) => error.code === "SEGMENT_OUT_OF_DURATION");
});

test("encodes downmixed 16 kHz mono PCM16 WAV without retaining source buffers", () => {
  const left = Float32Array.from([1, 0.5, -1, -0.5]);
  const right = Float32Array.from([-1, 0.5, 1, -0.5]);
  const prepared = Video.prepareMonoWav([left, right], 16_000, 16_000);
  const view = new DataView(prepared.buffer);
  const ascii = (offset, length) => String.fromCharCode(
    ...new Uint8Array(prepared.buffer, offset, length)
  );

  assert.equal(ascii(0, 4), "RIFF");
  assert.equal(ascii(8, 4), "WAVE");
  assert.equal(view.getUint16(22, true), 1);
  assert.equal(view.getUint32(24, true), 16_000);
  assert.equal(view.getUint16(34, true), 16);
  assert.equal(view.getUint32(40, true), 8);
  assert.equal(prepared.sampleCount, 4);
  assert.equal(left[0], 1);
  assert.equal(right[0], -1);
});

test("validates the loaded Chrome 116 tab-audio manifest before capture", () => {
  assert.equal(Video.validateCaptureManifest({
    minimum_chrome_version: "116",
    permissions: ["offscreen", "tabCapture"]
  }), true);
  assert.throws(() => Video.validateCaptureManifest({
    minimum_chrome_version: "115",
    permissions: ["offscreen"]
  }), (error) => (
    error.code === "CAPTURE_MANIFEST_STALE"
    && /Reload Exam-Cram from chrome:\/\/extensions/.test(error.message)
    && error.details.missingPermissions.includes("tabCapture")
  ));
});

test("turns raw Chrome tab-capture failures into deterministic recovery guidance", () => {
  const invocation = Video.toCaptureStartError(
    new Error("Extension has not been invoked for the current page (see activeTab permission)."),
    "stream"
  );
  assert.equal(invocation.code, "TAB_CAPTURE_NOT_INVOKED");
  assert.match(invocation.message, /press Start tab audio to arm the request/);
  assert.match(invocation.message, /Recording starts automatically/);
  assert.match(invocation.message, /navigation cancels the request/);

  const busy = Video.toCaptureStartError(new DOMException("Error starting tab capture", "AbortError"), "stream");
  assert.equal(busy.code, "TAB_AUDIO_UNAVAILABLE");
  assert.match(busy.message, /stop any other tab recorder/);

  const offscreen = Video.toCaptureStartError(new Error("Could not establish connection. Receiving end does not exist."), "offscreen");
  assert.equal(offscreen.code, "OFFSCREEN_CAPTURE_UNAVAILABLE");
  assert.match(offscreen.message, /Reload Exam-Cram/);

  const staleWorker = Video.toCaptureStartError(
    new Error("The message port closed before a response was received."),
    "video worker reservation"
  );
  assert.equal(staleWorker.code, "VIDEO_WORKER_RELOAD_REQUIRED");
  assert.match(staleWorker.message, /chrome:\/\/extensions, click Reload/);
});

test("settles callback- and Promise-style Chrome APIs exactly once", async () => {
  const callbackValue = await Video.invokeChromeCallbackOrPromise((callback) => {
    setImmediate(() => callback("callback-result"));
  });
  assert.equal(callbackValue, "callback-result");

  const promiseValue = await Video.invokeChromeCallbackOrPromise(() => Promise.resolve("promise-result"));
  assert.equal(promiseValue, "promise-result");

  const hybridValue = await Video.invokeChromeCallbackOrPromise((callback) => {
    callback("first-result");
    return Promise.resolve("late-result");
  });
  assert.equal(hybridValue, "first-result");

  await assert.rejects(
    Video.invokeChromeCallbackOrPromise((callback) => callback(), () => ({ message: "The message port closed before a response was received." })),
    /message port closed/
  );

  const responses = [];
  const respond = Video.createResponseOnce((payload) => responses.push(payload));
  assert.equal(respond({ ok: true }), true);
  assert.equal(respond({ ok: false }), false);
  assert.deepEqual(responses, [{ ok: true }]);
});

test("measures live audio and distinguishes waiting, silent, healthy, and paused capture", () => {
  assert.equal(Video.calculateAudioLevel(Float32Array.from([0, 0, 0, 0])), 0);
  assert.ok(Video.calculateAudioLevel(Float32Array.from([0.25, -0.25, 0.25, -0.25])) > 0.24);

  const waiting = Video.evaluateCaptureHealth({
    recording: true,
    recordingStartedAt: 1_000,
    totalInputSamples: 0
  }, 1_000 + Video.NO_SAMPLE_TIMEOUT_MS - 1);
  assert.equal(waiting.status, "waiting");

  const noSamples = Video.evaluateCaptureHealth({
    recording: true,
    recordingStartedAt: 1_000,
    totalInputSamples: 0
  }, 1_000 + Video.NO_SAMPLE_TIMEOUT_MS);
  assert.equal(noSamples.code, "NO_TAB_AUDIO_SAMPLES");

  const silent = Video.evaluateCaptureHealth({
    recording: true,
    recordingStartedAt: 1_000,
    totalInputSamples: 48_000,
    audioLevel: 0,
    lastAudibleAt: 0
  }, 1_000 + Video.SILENT_AUDIO_TIMEOUT_MS);
  assert.equal(silent.code, "SILENT_TAB_AUDIO");

  const healthy = Video.evaluateCaptureHealth({
    recording: true,
    recordingStartedAt: 1_000,
    totalInputSamples: 48_000,
    audioLevel: Video.AUDIBLE_RMS_THRESHOLD * 2,
    lastAudibleAt: 2_000
  }, 3_000);
  assert.equal(healthy.status, "healthy");
  assert.equal(Video.evaluateCaptureHealth({ recording: false }, 3_000).status, "paused");
});

test("capture startup promises always settle within their deadline", async () => {
  await assert.rejects(
    Video.withTimeout(
      new Promise(() => undefined),
      10,
      () => new Video.VideoCaptureError("START_DEADLINE", "Capture start deadline reached.")
    ),
    (error) => error.code === "START_DEADLINE"
  );
  assert.equal(await Video.withTimeout(Promise.resolve("ready"), 100), "ready");
});

test("stream reservations are source-bound, one-shot, and reject same-tab navigation or media replacement", () => {
  let now = 1_000;
  const registry = Video.createStreamReservationRegistry({ now: () => now });
  const expected = Video.normalizeSourceSnapshot(source());

  const navigationLease = registry.begin(9, expected);
  registry.commit({
    reservationId: "navigation",
    streamId: "stream-navigation",
    tabId: 9,
    requestedAt: now,
    expiresAt: now + Video.STREAM_RESERVATION_TTL_MS,
    sourceBinding: navigationLease.sourceBinding
  }, navigationLease.epoch);
  assert.throws(
    () => registry.consume("navigation", 9, source({ url: "https://video.example.test/other" })),
    (error) => error.code === "CAPTURE_SOURCE_CHANGED" && error.details.reasons.includes("PAGE_CHANGED")
  );
  assert.throws(() => registry.consume("navigation", 9, expected), (error) => error.code === "CAPTURE_AUTHORIZATION_EXPIRED");

  const mediaLease = registry.begin(9, expected);
  registry.commit({
    reservationId: "media",
    streamId: "stream-media",
    tabId: 9,
    requestedAt: now,
    expiresAt: now + Video.STREAM_RESERVATION_TTL_MS,
    sourceBinding: mediaLease.sourceBinding
  }, mediaLease.epoch);
  assert.throws(
    () => registry.consume("media", 9, source({ currentSrc: "https://cdn.example.test/replacement.mp4" })),
    (error) => error.code === "CAPTURE_SOURCE_CHANGED" && error.details.reasons.includes("MEDIA_CHANGED")
  );

  const matchingLease = registry.begin(9, expected);
  registry.commit({
    reservationId: "matching",
    streamId: "stream-matching",
    tabId: 9,
    requestedAt: now,
    expiresAt: now + Video.STREAM_RESERVATION_TTL_MS,
    sourceBinding: matchingLease.sourceBinding
  }, matchingLease.epoch);
  assert.equal(registry.consume("matching", 9, expected), "stream-matching");
  assert.throws(() => registry.consume("matching", 9, expected), (error) => error.code === "CAPTURE_AUTHORIZATION_EXPIRED");
});

test("clearing a tab invalidates stored and in-flight reservations, and expiry is authoritative", () => {
  let now = 10_000;
  const registry = Video.createStreamReservationRegistry({ now: () => now });
  const expected = Video.normalizeSourceSnapshot(source());
  const storedLease = registry.begin(9, expected);
  registry.commit({
    reservationId: "stored",
    streamId: "stream-stored",
    tabId: 9,
    expiresAt: now + 5_000,
    sourceBinding: storedLease.sourceBinding
  }, storedLease.epoch);
  assert.equal(registry.clearTab(9), 1);
  assert.throws(() => registry.consume("stored", 9, expected), (error) => error.code === "CAPTURE_AUTHORIZATION_EXPIRED");

  const inFlightLease = registry.begin(9, expected);
  registry.clearTab(9);
  assert.throws(() => registry.commit({
    reservationId: "late",
    streamId: "stream-late",
    tabId: 9,
    expiresAt: now + 5_000,
    sourceBinding: inFlightLease.sourceBinding
  }, inFlightLease.epoch), (error) => error.code === "CAPTURE_SOURCE_CHANGED");

  const expiryLease = registry.begin(9, expected);
  registry.commit({
    reservationId: "expiry",
    streamId: "stream-expiry",
    tabId: 9,
    expiresAt: now + Video.STREAM_RESERVATION_TTL_MS,
    sourceBinding: expiryLease.sourceBinding
  }, expiryLease.epoch);
  now += Video.STREAM_RESERVATION_TTL_MS;
  assert.throws(() => registry.consume("expiry", 9, expected), (error) => error.code === "CAPTURE_AUTHORIZATION_EXPIRED");
  assert.equal(registry.size, 0);
  assert.equal(Video.STREAM_RESERVATION_TTL_MS, 5_000);
});

test("toolbar action owns the one-use tab stream and starts the armed request immediately", () => {
  const backgroundSource = fs.readFileSync(path.join(__dirname, "..", "background.js"), "utf8");
  const popupSource = fs.readFileSync(path.join(__dirname, "..", "popup.js"), "utf8");
  assert.match(backgroundSource, /chrome\.action\.onClicked\.addListener\([\s\S]*chrome\.sidePanel\.open\(\{ windowId \}\)/);
  assert.match(backgroundSource, /chrome\.action\.onClicked\.addListener\([\s\S]*authorizeArmedVideoCaptureFromAction\(tab\)/);
  assert.match(backgroundSource, /openPanelOnActionClick: false/);
  assert.match(backgroundSource, /invokeChromeCallbackOrPromise\([\s\S]*chrome\.tabCapture\.getMediaStreamId\(\{ targetTabId: tabId \}, callback\)/);
  assert.match(backgroundSource, /chrome\.runtime\.getContexts\(\{[\s\S]*contextTypes: \["OFFSCREEN_DOCUMENT"\]/);
  assert.match(backgroundSource, /creatingVideoOffscreenDocument/);
  assert.match(backgroundSource, /rollbackVideoCaptureStart\(state, normalized\)/);
  assert.match(backgroundSource, /target: "offscreen"/);

  const actionStart = backgroundSource.indexOf("async function authorizeArmedVideoCaptureFromAction");
  const actionEnd = backgroundSource.indexOf("function requestVideoCaptureStreamId", actionStart);
  const actionSource = backgroundSource.slice(actionStart, actionEnd);
  const consumeRequestIndex = actionSource.indexOf("chrome.storage.session.remove(VIDEO_CAPTURE_AUTHORIZATION_KEY)");
  const reserveIndex = actionSource.indexOf("reserveVideoCaptureStreamFromAction(authorization)");
  const captureIndex = actionSource.indexOf("startVideoCapture(authorization, authorizedStreamId)");
  assert.ok(consumeRequestIndex >= 0 && consumeRequestIndex < reserveIndex && reserveIndex < captureIndex);
  assert.match(actionSource, /actionUrl !== authorization\.sourceSnapshot\.canonicalUrl/);

  const popupHandler = popupSource.match(/async function handleStartVideoCapture\(event\) \{([\s\S]*?)\n\}/)?.[1] || "";
  const activeTabRead = popupHandler.indexOf("const activeTabPromise = getActiveTab()");
  const identityRead = popupHandler.indexOf("const identityPromise = activeTabPromise.then");
  const armCall = popupHandler.indexOf('type: "VIDEO_CAPTURE_ARM"');
  assert.ok(activeTabRead >= 0 && identityRead > activeTabRead && armCall > identityRead);
  assert.match(popupHandler, /sourceSnapshotsMatch\(expectedSourceSnapshot, sourceSnapshot\)/);
  assert.match(popupHandler, /authorization\?\.protocolVersion !== 3/);
  assert.doesNotMatch(popupHandler, /VIDEO_CAPTURE_RESERVE_STREAM|VIDEO_CAPTURE_BEGIN|getMediaStreamId/);
  assert.match(popupHandler, /VIDEO_WORKER_RELOAD_REQUIRED/);
  assert.match(popupHandler, /videoCaptureDialogStatus\.textContent = message/);
  assert.match(popupSource, /message\?\.type === "VIDEO_CAPTURE_ARM"[\s\S]*?"video worker authorization"/);
  assert.match(popupSource, /VIDEO_CAPTURE_AUTHORIZATION_CHANGED[\s\S]*renderVideoCaptureAuthorization/);
  assert.match(popupSource, /VIDEO_CAPTURE_GET_AUTHORIZATION/);
  assert.match(popupSource, /scheduleVideoCaptureAuthorizationExpiry[\s\S]*status: "expired"/);
  assert.match(popupSource, /ExamCramVideo\.toCaptureStartError\(rawError, errorPhase\)/);
  assert.match(popupSource, /reloadExtensionButton[\s\S]*?handleReloadExtension/);
});

test("video authorization protocol persists only the armed request and replies before teardown", () => {
  const backgroundSource = fs.readFileSync(path.join(__dirname, "..", "background.js"), "utf8");
  const offscreenSource = fs.readFileSync(path.join(__dirname, "..", "offscreen.js"), "utf8");

  assert.match(backgroundSource, /const VIDEO_CAPTURE_PROTOCOL_VERSION = 3/);
  assert.match(backgroundSource, /const VIDEO_CAPTURE_AUTHORIZATION_TTL_MS = 60 \* 1000/);
  assert.match(backgroundSource, /chrome\.storage\.session\.set\(\{ \[VIDEO_CAPTURE_AUTHORIZATION_KEY\]: authorization \}\)/);
  const reserveStart = backgroundSource.indexOf("function reserveVideoCaptureStreamFromAction");
  const reserveEnd = backgroundSource.indexOf("function consumeVideoCaptureReservation", reserveStart);
  const reserveSource = backgroundSource.slice(reserveStart, reserveEnd);
  assert.ok(reserveSource.indexOf("videoStreamReservations.commit") < reserveSource.indexOf("consumeVideoCaptureReservation"));
  assert.match(backgroundSource, /storedState \? \{ \.\.\.storedState, protocolVersion: VIDEO_CAPTURE_PROTOCOL_VERSION \} : null/);
  const settleStart = backgroundSource.indexOf("function settleVideoMessageResponse");
  const settleEnd = backgroundSource.indexOf("function scheduleVideoOffscreenClose", settleStart);
  const settleSource = backgroundSource.slice(settleStart, settleEnd);
  assert.ok(settleSource.indexOf("respond({ ok: false") < settleSource.indexOf("afterError(error)"));

  const stoppedStart = backgroundSource.indexOf("async function handleOffscreenVideoStopped");
  const stoppedEnd = backgroundSource.indexOf("async function handleOffscreenVideoError", stoppedStart);
  const stoppedSource = backgroundSource.slice(stoppedStart, stoppedEnd);
  assert.doesNotMatch(stoppedSource, /await closeVideoOffscreenDocument/);
  assert.match(stoppedSource, /closeOffscreenAfterResponse: true/);

  const errorStart = stoppedEnd;
  const errorEnd = backgroundSource.indexOf("async function stopVideoCapture", errorStart);
  const errorSource = backgroundSource.slice(errorStart, errorEnd);
  assert.doesNotMatch(errorSource, /await closeVideoOffscreenDocument/);
  assert.match(errorSource, /closeOffscreenAfterResponse: true/);

  const listenerStart = offscreenSource.indexOf("chrome.runtime.onMessage.addListener");
  const listenerSource = offscreenSource.slice(listenerStart);
  assert.ok(listenerSource.indexOf("respond({ ok: false") < listenerSource.indexOf("void emitError"));
});

test("worker clears source epochs and minimizes delay before offscreen consumes the stream", () => {
  const backgroundSource = fs.readFileSync(path.join(__dirname, "..", "background.js"), "utf8");
  const updatedStart = backgroundSource.indexOf("chrome.tabs.onUpdated.addListener");
  const updatedEnd = backgroundSource.indexOf("chrome.tabs.onRemoved.addListener", updatedStart);
  const updatedSource = backgroundSource.slice(updatedStart, updatedEnd);
  assert.ok(updatedSource.indexOf("videoStreamReservations.clearTab(tabId)") < updatedSource.indexOf("enqueueVideoOperation"));

  const removedStart = updatedEnd;
  const removedEnd = backgroundSource.indexOf("chrome.runtime.onMessage.addListener", removedStart);
  const removedSource = backgroundSource.slice(removedStart, removedEnd);
  assert.ok(removedSource.indexOf("videoStreamReservations.clearTab(tabId)") < removedSource.indexOf("enqueueVideoOperation"));

  const reserveStart = backgroundSource.indexOf("function reserveVideoCaptureStream");
  const reserveEnd = backgroundSource.indexOf("function consumeVideoCaptureReservation", reserveStart);
  const reserveSource = backgroundSource.slice(reserveStart, reserveEnd);
  assert.ok(reserveSource.indexOf("videoStreamReservations.begin(tabId, message?.sourceSnapshot)") < reserveSource.indexOf("prepareVideoCaptureStream(tabId)"));
  assert.ok(reserveSource.indexOf("videoStreamReservations.commit") < reserveSource.indexOf("consumeVideoCaptureReservation"));

  const captureStart = backgroundSource.indexOf("async function startVideoCapture");
  const captureEnd = backgroundSource.indexOf("async function rollbackVideoCaptureStart", captureStart);
  const captureSource = backgroundSource.slice(captureStart, captureEnd);
  const streamPromiseIndex = captureSource.indexOf("const streamIdPromise = Promise.resolve(authorizedStreamIdPromise)");
  const stateLoadIndex = captureSource.indexOf("const previous = await loadVideoCaptureState()");
  const ensureIndex = captureSource.indexOf("await ensureVideoOffscreenDocument()");
  const saveIndex = captureSource.indexOf("await saveVideoCaptureState(state)");
  const startMessageIndex = captureSource.indexOf("await sendVideoOffscreenMessage");
  assert.ok(streamPromiseIndex >= 0 && streamPromiseIndex < stateLoadIndex);
  assert.ok(ensureIndex > stateLoadIndex && saveIndex > ensureIndex && startMessageIndex > saveIndex);
  assert.match(captureSource, /CAPTURE_RESERVATION_REQUIRED/);
  assert.match(captureSource, /void broadcastVideoState\(state\)/);
  assert.doesNotMatch(captureSource, /prepareVideoCaptureStream\(/);
});

test("offscreen startup bounds getUserMedia and restores tab playback without microphone fallback", () => {
  const offscreenSource = fs.readFileSync(path.join(__dirname, "..", "offscreen.js"), "utf8");
  assert.match(offscreenSource, /Video\.withTimeout\([\s\S]*navigator\.mediaDevices\.getUserMedia/);
  assert.match(offscreenSource, /chromeMediaSource: "tab"/);
  assert.match(offscreenSource, /chromeMediaSourceId: streamId/);
  assert.match(offscreenSource, /video: false/);
  assert.match(offscreenSource, /processor\.connect\(audioContext\.destination\)/);
  assert.match(offscreenSource, /message\?\.target !== "offscreen"/);
  assert.match(offscreenSource, /audioTrack\.addEventListener\("ended"/);
});

test("captionless YouTube follows visible captions, Gemini URL analysis, then explicit audio fallback", () => {
  const popupSource = fs.readFileSync(path.join(__dirname, "..", "popup.js"), "utf8");
  const backgroundSource = fs.readFileSync(path.join(__dirname, "..", "background.js"), "utf8");
  const serverSource = fs.readFileSync(path.join(__dirname, "..", "server.js"), "utf8");
  const extractionStart = popupSource.indexOf("async function extractCurrentVideo");
  const extractionEnd = popupSource.indexOf("function makeVideoSourceSnapshot", extractionStart);
  const extractionSource = popupSource.slice(extractionStart, extractionEnd);
  const visibleIndex = extractionSource.indexOf("extractRenderedTranscript(tab.id)");
  const geminiIndex = extractionSource.indexOf("requestAutomaticYouTubeTranscript(tab, identity)");
  const audioFallbackIndex = extractionSource.indexOf("state.videoCaptureState?.status === \"ready\"");
  assert.ok(visibleIndex >= 0 && visibleIndex < geminiIndex && geminiIndex < audioFallbackIndex);
  assert.doesNotMatch(popupSource, /ytInitialPlayerResponse|captionTracks|player_response/);
  assert.match(popupSource, /Gemini public-YouTube analysis could not reach the configured backend/);
  assert.match(popupSource, /Gemini could not analyze this public YouTube URL/);
  assert.match(popupSource, /VIDEO_CAPTURE_IN_PROGRESS/);
  assert.match(backgroundSource, /DEFAULT_BACKEND_ENDPOINT = "http:\/\/127\.0\.0\.1:8787\/api\/study-session"/);
  assert.match(backgroundSource, /TRANSCRIPTION_BACKEND_UNAVAILABLE/);
  assert.match(serverSource, /generateYouTubeTranscript[\s\S]*fileData: \{ fileUri: sourceUrl \}/);
  assert.match(serverSource, /provenance: "youtube-ai"/);
});

test("live recorder progress advances before chunk transcription and rejects zero-segment note creation", () => {
  const popupSource = fs.readFileSync(path.join(__dirname, "..", "popup.js"), "utf8");
  const backgroundSource = fs.readFileSync(path.join(__dirname, "..", "background.js"), "utf8");
  const offscreenSource = fs.readFileSync(path.join(__dirname, "..", "offscreen.js"), "utf8");
  const renderStart = popupSource.indexOf("function renderVideoCaptureState");
  const renderEnd = popupSource.indexOf("async function handleAddCurrentSource", renderStart);
  const renderSource = popupSource.slice(renderStart, renderEnd);
  assert.match(renderSource, /Math\.max\([\s\S]*capture\?\.liveCapturedMs[\s\S]*capture\?\.capturedMs/);
  assert.match(renderSource, /Waiting for tab audio/);
  assert.match(renderSource, /Signal \$\{signalPercent\}%/);
  assert.match(renderSource, /receivedChunkCount/);

  assert.equal(Video.CAPTURE_UPLOAD_CHUNK_MS, 15_000);
  assert.match(offscreenSource, /type: Types\.PROGRESS/);
  assert.match(offscreenSource, /Video\.calculateAudioLevel\(mono\)/);
  assert.match(offscreenSource, /Video\.evaluateCaptureHealth\(target, Date\.now\(\)\)/);
  assert.match(offscreenSource, /Video\.CAPTURE_UPLOAD_CHUNK_MS/);
  assert.match(backgroundSource, /case Video\.MESSAGE_TYPES\.PROGRESS:[\s\S]*handleOffscreenVideoProgress/);
  assert.match(backgroundSource, /initialState\.receivedChunkCount[\s\S]*transcribeVideoChunk/);
  assert.match(backgroundSource, /Video\.transitionChunkTranscription[\s\S]*type: "pending"/);
  assert.match(backgroundSource, /failedState\.status = "error"/);
  assert.match(backgroundSource, /EMPTY_TRANSCRIPT_CHUNK/);
  assert.match(backgroundSource, /preflightVideoTranscriptionBackend/);
  assert.doesNotMatch(backgroundSource, /Enter the Exam-Cram backend access token in Settings before starting/);
  assert.match(backgroundSource, /if \(token\) headers\.Authorization = `Bearer \$\{token\}`/);
  assert.match(backgroundSource, /ORIGIN_NOT_ALLOWED/);
  assert.match(offscreenSource, /response\?\.ok !== false[\s\S]*WORKER_EVENT_REJECTED/);
  assert.match(backgroundSource, /state\.status = discard \? "aborting" : "processing"/);

  const buildStart = popupSource.indexOf("async function handleBuildCapturedVideoLesson");
  const buildEnd = popupSource.indexOf("async function loadVideoCaptureState", buildStart);
  const buildSource = popupSource.slice(buildStart, buildEnd);
  assert.match(buildSource, /capture\?\.status !== "ready"/);
  assert.match(buildSource, /segments \|\| \[\]\)\.length < 3/);
  assert.match(buildSource, /createAndRecordStudyArtifact\(/);
});
