(function attachExamCramVideo(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.ExamCramVideo = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createExamCramVideo() {
  "use strict";

  const SCHEMA_VERSION = 1;
  const MAX_CAPTURE_MS = 15 * 60 * 1000;
  const MAX_CHUNK_MS = 45 * 1000;
  const CAPTURE_UPLOAD_CHUNK_MS = 15 * 1000;
  const CAPTURE_PROGRESS_INTERVAL_MS = 1000;
  const NO_SAMPLE_TIMEOUT_MS = 6 * 1000;
  const SILENT_AUDIO_TIMEOUT_MS = 12 * 1000;
  const AUDIBLE_RMS_THRESHOLD = 0.0005;
  const CAPTURE_START_TIMEOUT_MS = 12 * 1000;
  const STREAM_RESERVATION_TTL_MS = 5 * 1000;
  const TARGET_SAMPLE_RATE = 16_000;
  const MIN_PLAYBACK_RATE = 0.25;
  const MAX_PLAYBACK_RATE = 16;
  const MAX_SEGMENTS = 500;
  const MAX_SEGMENT_TEXT = 600;

  const MESSAGE_TYPES = Object.freeze({
    START: "VIDEO_OFFSCREEN_START",
    CONTROL: "VIDEO_OFFSCREEN_CONTROL",
    STOP: "VIDEO_OFFSCREEN_STOP",
    GET_STATE: "VIDEO_OFFSCREEN_GET_STATE",
    READY: "VIDEO_OFFSCREEN_READY",
    PROGRESS: "VIDEO_OFFSCREEN_PROGRESS",
    CHUNK: "VIDEO_OFFSCREEN_CHUNK",
    STOPPED: "VIDEO_OFFSCREEN_STOPPED",
    ERROR: "VIDEO_OFFSCREEN_ERROR"
  });

  class VideoCaptureError extends Error {
    constructor(code, message, details = {}) {
      super(message);
      this.name = "VideoCaptureError";
      this.code = code;
      this.details = details;
    }
  }

  function validateCaptureManifest(manifest) {
    const permissions = new Set(Array.isArray(manifest?.permissions) ? manifest.permissions : []);
    const missing = ["offscreen", "tabCapture"].filter((permission) => !permissions.has(permission));
    const minimumChrome = Number.parseInt(String(manifest?.minimum_chrome_version || "0"), 10);
    if (missing.length || !Number.isFinite(minimumChrome) || minimumChrome < 116) {
      throw new VideoCaptureError(
        "CAPTURE_MANIFEST_STALE",
        "Reload Exam-Cram from chrome://extensions to activate the Chrome 116+ tab-audio permissions.",
        { missingPermissions: missing, minimumChromeVersion: minimumChrome || 0 }
      );
    }
    return true;
  }

  function toCaptureStartError(error, phase = "capture") {
    if (error instanceof VideoCaptureError) return error;
    const rawMessage = cleanText(error?.message || error, 500);
    const rawName = cleanText(error?.name, 80);
    const searchable = `${rawName} ${rawMessage}`.toLowerCase();
    const details = { phase: cleanText(phase, 50), cause: rawMessage };
    if (/extension has not been invoked|activetab|user gesture/.test(searchable)) {
      return new VideoCaptureError(
        "TAB_CAPTURE_NOT_INVOKED",
        "Chrome did not authorize this page for tab capture. Keep the video playing, press Start tab audio to arm the request, then click the Exam-Cram toolbar icon once on that same tab. Recording starts automatically, and navigation cancels the request.",
        details
      );
    }
    if (/chrome:\/\/|edge:\/\/|cannot capture.*(page|tab)|restricted|not capturable/.test(searchable)) {
      return new VideoCaptureError(
        "UNSUPPORTED_CAPTURE_TAB",
        "Chrome cannot capture audio from this page. Open the video on a normal HTTP or HTTPS website and try again.",
        details
      );
    }
    if (/notallowederror|permission denied|permission dismissed|denied permission/.test(searchable)) {
      return new VideoCaptureError(
        "TAB_AUDIO_PERMISSION_DENIED",
        "Chrome denied tab-audio capture. Keep the video tab active and allow capture when Chrome asks, then try again.",
        details
      );
    }
    if (/could not establish connection|receiving end does not exist|message port closed/.test(searchable)
      && /worker|reservation|runtime message/.test(String(phase).toLowerCase())) {
      return new VideoCaptureError(
        "VIDEO_WORKER_RELOAD_REQUIRED",
        "Exam-Cram's loaded video worker is out of date or unavailable. Open chrome://extensions, click Reload for Exam-Cram, then reopen the video and try again.",
        details
      );
    }
    if (/could not establish connection|receiving end does not exist|message port closed|offscreen/.test(searchable)) {
      return new VideoCaptureError(
        "OFFSCREEN_CAPTURE_UNAVAILABLE",
        "The tab-audio recorder did not load. Reload Exam-Cram from chrome://extensions, reopen the video, and try again.",
        details
      );
    }
    if (/aborterror|error starting tab capture|already.*captur|capture.*active/.test(searchable)) {
      return new VideoCaptureError(
        "TAB_AUDIO_UNAVAILABLE",
        "Chrome could not start this tab's audio. Keep the video playing, stop any other tab recorder, and try again.",
        details
      );
    }
    return new VideoCaptureError(
      "TAB_AUDIO_START_FAILED",
      rawMessage || "Chrome could not start tab-audio capture.",
      details
    );
  }

  function invokeChromeCallbackOrPromise(invoker, getLastError = () => null) {
    return new Promise((resolve, reject) => {
      let settled = false;
      const settle = (handler, value) => {
        if (settled) return;
        settled = true;
        handler(value);
      };
      const callback = (value) => {
        let runtimeError = null;
        try {
          runtimeError = getLastError?.() || null;
        } catch (error) {
          settle(reject, error);
          return;
        }
        if (runtimeError) {
          const message = cleanText(runtimeError.message || runtimeError, 500) || "The Chrome extension request failed.";
          settle(reject, new Error(message));
          return;
        }
        settle(resolve, value);
      };

      let returned;
      try {
        returned = invoker(callback);
      } catch (error) {
        settle(reject, error);
        return;
      }
      if (returned && typeof returned.then === "function") {
        returned.then(
          (value) => settle(resolve, value),
          (error) => settle(reject, error)
        );
      }
    });
  }

  function createResponseOnce(sendResponse) {
    let responded = false;
    return (payload) => {
      if (responded) return false;
      responded = true;
      try {
        sendResponse(payload);
        return true;
      } catch {
        return false;
      }
    };
  }

  function withTimeout(promiseValue, timeoutMs, errorFactory) {
    const milliseconds = Number(timeoutMs);
    if (!Number.isFinite(milliseconds) || milliseconds <= 0) return Promise.resolve(promiseValue);
    return new Promise((resolve, reject) => {
      let settled = false;
      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        const error = typeof errorFactory === "function"
          ? errorFactory()
          : new VideoCaptureError("CAPTURE_TIMEOUT", "Tab-audio capture timed out.");
        reject(error);
      }, milliseconds);
      Promise.resolve(promiseValue).then(
        (value) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          resolve(value);
        },
        (error) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          reject(error);
        }
      );
    });
  }

  function cleanText(value, maxLength = 300) {
    return String(value || "").replace(/\s+/g, " ").trim().slice(0, maxLength);
  }

  function stableHash(value) {
    const text = String(value || "");
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36).padStart(7, "0");
  }

  function canonicalUrl(value, options = {}) {
    const raw = cleanText(value, 4096);
    if (!raw) return "";
    try {
      const url = new URL(raw);
      if (!["http:", "https:"].includes(url.protocol)) return "";
      url.username = "";
      url.password = "";
      url.hash = "";
      if (options.removePlaybackParameters) {
        ["t", "start", "time_continue", "si"].forEach((key) => url.searchParams.delete(key));
      }
      return url.href;
    } catch {
      return "";
    }
  }

  function normalizeMediaResource(value) {
    const raw = cleanText(value, 4096);
    if (!raw) return "";
    const webUrl = canonicalUrl(raw);
    if (webUrl) return webUrl;
    try {
      const url = new URL(raw);
      if (url.protocol !== "blob:" || !/^blob:https?:\/\//i.test(raw)) return "";
      url.hash = "";
      return url.href;
    } catch {
      return "";
    }
  }

  function normalizeTrackIdentity(track) {
    if (!track || typeof track !== "object") return null;
    const src = normalizeMediaResource(track.src || track.url);
    const identity = {
      id: cleanText(track.id, 100),
      kind: cleanText(track.kind, 40).toLowerCase(),
      label: cleanText(track.label, 120),
      language: cleanText(track.language || track.srclang, 40).toLowerCase(),
      src
    };
    return Object.values(identity).some(Boolean) ? identity : null;
  }

  function normalizeDurationMs(value) {
    const duration = Number(value);
    return Number.isFinite(duration) && duration > 0
      ? Math.round(duration)
      : null;
  }

  function normalizeSourceSnapshot(value = {}, now = Date.now()) {
    const canonicalPageUrl = canonicalUrl(
      value.canonicalUrl || value.url || value.pageUrl,
      { removePlaybackParameters: true }
    );
    if (!canonicalPageUrl) {
      throw new VideoCaptureError("INVALID_SOURCE_URL", "A video source needs a valid HTTP or HTTPS page URL.");
    }

    const suppliedIdentity = value.mediaIdentity && typeof value.mediaIdentity === "object"
      ? value.mediaIdentity
      : {};
    const currentSrc = normalizeMediaResource(
      value.currentSrc || value.mediaUrl || value.src || suppliedIdentity.currentSrc
    );
    const poster = normalizeMediaResource(value.poster || value.posterUrl || suppliedIdentity.poster);
    const rawTracks = Array.isArray(value.tracks)
      ? value.tracks
      : (Array.isArray(suppliedIdentity.tracks) ? suppliedIdentity.tracks : []);
    const tracks = rawTracks
      .map(normalizeTrackIdentity)
      .filter(Boolean)
      .sort((first, second) => JSON.stringify(first).localeCompare(JSON.stringify(second)));
    const mediaIdentity = { currentSrc, poster, tracks };
    const identityAvailable = Boolean(currentSrc || poster || tracks.length);
    const mediaKey = identityAvailable
      ? `media-${stableHash(JSON.stringify(mediaIdentity))}`
      : "media-unidentified";
    const sourceFingerprint = `video-${stableHash(`${canonicalPageUrl}|${mediaKey}`)}`;
    const tabId = Number.isInteger(Number(value.tabId)) && Number(value.tabId) >= 0
      ? Number(value.tabId)
      : null;
    const capturedAt = Number.isFinite(Number(value.capturedAt ?? now))
      ? Math.max(0, Math.floor(Number(value.capturedAt ?? now)))
      : Date.now();

    return {
      schemaVersion: SCHEMA_VERSION,
      sourceType: "video",
      tabId,
      canonicalUrl: canonicalPageUrl,
      title: cleanText(value.title, 300) || "Untitled video",
      mediaKey,
      sourceFingerprint,
      identityAvailable,
      mediaIdentity,
      durationMs: normalizeDurationMs(value.durationMs ?? Number(value.durationSeconds) * 1000),
      seekable: Boolean(value.seekable),
      capturedAt
    };
  }

  function compareSourceSnapshots(expectedValue, actualValue) {
    let expected;
    let actual;
    try {
      expected = normalizeSourceSnapshot(expectedValue, expectedValue?.capturedAt);
      actual = normalizeSourceSnapshot(actualValue, actualValue?.capturedAt);
    } catch (error) {
      return {
        matches: false,
        reasons: [error instanceof VideoCaptureError ? error.code : "INVALID_SOURCE"]
      };
    }

    const reasons = [];
    if (expected.tabId != null && actual.tabId != null && expected.tabId !== actual.tabId) {
      reasons.push("TAB_CHANGED");
    }
    if (expected.canonicalUrl !== actual.canonicalUrl) reasons.push("PAGE_CHANGED");
    if (!expected.identityAvailable || !actual.identityAvailable) reasons.push("MEDIA_IDENTITY_UNAVAILABLE");
    if (expected.mediaKey !== actual.mediaKey) reasons.push("MEDIA_CHANGED");
    if (expected.sourceFingerprint !== actual.sourceFingerprint) reasons.push("FINGERPRINT_CHANGED");
    return { matches: reasons.length === 0, reasons, expected, actual };
  }

  function sourceSnapshotsMatch(expected, actual) {
    return compareSourceSnapshots(expected, actual).matches;
  }

  function createCaptureReservationSourceBinding(snapshotValue) {
    const snapshot = normalizeSourceSnapshot(snapshotValue, snapshotValue?.capturedAt);
    if (snapshot.tabId == null || !snapshot.identityAvailable) {
      throw new VideoCaptureError(
        "MEDIA_IDENTITY_UNAVAILABLE",
        "Tab audio can be authorized only after the current video exposes a stable source identity."
      );
    }
    return Object.freeze({
      tabId: snapshot.tabId,
      canonicalUrl: snapshot.canonicalUrl,
      mediaKey: snapshot.mediaKey,
      sourceFingerprint: snapshot.sourceFingerprint
    });
  }

  function compareCaptureReservationSource(bindingValue, snapshotValue) {
    const binding = bindingValue && typeof bindingValue === "object" ? bindingValue : {};
    let actual;
    try {
      actual = createCaptureReservationSourceBinding(snapshotValue);
    } catch (error) {
      return {
        matches: false,
        reasons: [error instanceof VideoCaptureError ? error.code : "INVALID_SOURCE"]
      };
    }
    const reasons = [];
    if (Number(binding.tabId) !== actual.tabId) reasons.push("TAB_CHANGED");
    if (String(binding.canonicalUrl || "") !== actual.canonicalUrl) reasons.push("PAGE_CHANGED");
    if (String(binding.mediaKey || "") !== actual.mediaKey) reasons.push("MEDIA_CHANGED");
    if (String(binding.sourceFingerprint || "") !== actual.sourceFingerprint) reasons.push("FINGERPRINT_CHANGED");
    return { matches: reasons.length === 0, reasons, actual };
  }

  function createStreamReservationRegistry(options = {}) {
    const now = typeof options.now === "function" ? options.now : Date.now;
    const reservations = new Map();
    const tabEpochs = new Map();

    const clearTab = (tabIdValue) => {
      const tabId = Number(tabIdValue);
      if (!Number.isInteger(tabId) || tabId < 0) return 0;
      tabEpochs.set(tabId, (tabEpochs.get(tabId) || 0) + 1);
      let removed = 0;
      for (const [reservationId, reservation] of reservations) {
        if (reservation.tabId !== tabId) continue;
        reservations.delete(reservationId);
        removed += 1;
      }
      return removed;
    };

    const begin = (tabIdValue, snapshotValue) => {
      const tabId = Number(tabIdValue);
      const sourceBinding = createCaptureReservationSourceBinding(snapshotValue);
      if (!Number.isInteger(tabId) || tabId < 0 || sourceBinding.tabId !== tabId) {
        throw new VideoCaptureError("SOURCE_MISMATCH", "The requested tab does not match the expected video source.");
      }
      clearTab(tabId);
      return Object.freeze({ tabId, epoch: tabEpochs.get(tabId), sourceBinding });
    };

    const commit = (recordValue, expectedEpochValue) => {
      const record = recordValue && typeof recordValue === "object" ? recordValue : {};
      const reservationId = cleanText(record.reservationId, 160);
      const streamId = cleanText(record.streamId, 4096);
      const tabId = Number(record.tabId);
      const expiresAt = Number(record.expiresAt);
      const expectedEpoch = Number(expectedEpochValue);
      if (!reservationId || !streamId || !Number.isInteger(tabId) || tabId < 0) {
        throw new VideoCaptureError("INVALID_CAPTURE_RESERVATION", "Chrome returned an invalid tab-audio reservation.");
      }
      if (tabEpochs.get(tabId) !== expectedEpoch) {
        throw new VideoCaptureError("CAPTURE_SOURCE_CHANGED", "The video page changed while Chrome was authorizing tab audio.");
      }
      if (!Number.isFinite(expiresAt) || now() >= expiresAt) {
        throw new VideoCaptureError("CAPTURE_AUTHORIZATION_EXPIRED", "Chrome's tab-audio authorization expired before it could be reserved.");
      }
      const sourceBinding = Object.freeze({ ...(record.sourceBinding || {}) });
      reservations.set(reservationId, Object.freeze({
        reservationId,
        streamId,
        tabId,
        requestedAt: Number(record.requestedAt) || now(),
        expiresAt,
        sourceBinding
      }));
      return reservations.get(reservationId);
    };

    const consume = (reservationIdValue, tabIdValue, snapshotValue) => {
      const reservationId = cleanText(reservationIdValue, 160);
      const reservation = reservations.get(reservationId);
      if (reservationId) reservations.delete(reservationId);
      if (!reservation || now() >= reservation.expiresAt) {
        throw new VideoCaptureError(
          "CAPTURE_AUTHORIZATION_EXPIRED",
          "Tab-audio authorization expired before capture started. Keep the video playing and press Start tab audio again."
        );
      }
      const tabId = Number(tabIdValue);
      if (!Number.isInteger(tabId) || reservation.tabId !== tabId) {
        throw new VideoCaptureError("CAPTURE_SOURCE_CHANGED", "The authorized tab no longer matches the current video source.");
      }
      const comparison = compareCaptureReservationSource(reservation.sourceBinding, snapshotValue);
      if (!comparison.matches) {
        throw new VideoCaptureError(
          "CAPTURE_SOURCE_CHANGED",
          "The page or video changed after tab audio was authorized. Return to the intended video and press Start tab audio again.",
          { reasons: comparison.reasons }
        );
      }
      return reservation.streamId;
    };

    const expire = (reservationIdValue, expectedExpiresAt) => {
      const reservationId = cleanText(reservationIdValue, 160);
      const reservation = reservations.get(reservationId);
      if (!reservation || reservation.expiresAt !== Number(expectedExpiresAt)) return false;
      reservations.delete(reservationId);
      return true;
    };

    return Object.freeze({
      begin,
      commit,
      consume,
      clearTab,
      expire,
      get size() { return reservations.size; }
    });
  }

  function createTranscriptBinding(snapshotValue, options = {}) {
    const snapshot = normalizeSourceSnapshot(snapshotValue, snapshotValue?.capturedAt);
    if (!snapshot.identityAvailable) {
      throw new VideoCaptureError(
        "MEDIA_IDENTITY_UNAVAILABLE",
        "The transcript cannot be bound until the current video exposes a stable source, poster, or track identity."
      );
    }
    return {
      schemaVersion: SCHEMA_VERSION,
      sourceFingerprint: snapshot.sourceFingerprint,
      tabId: snapshot.tabId,
      canonicalUrl: snapshot.canonicalUrl,
      mediaKey: snapshot.mediaKey,
      kind: cleanText(options.kind, 40) || "transcript",
      createdAt: Number.isFinite(Number(options.createdAt))
        ? Math.max(0, Math.floor(Number(options.createdAt)))
        : Date.now()
    };
  }

  function compareTranscriptBinding(binding, snapshotValue) {
    if (!binding || typeof binding !== "object") {
      return { matches: false, reasons: ["BINDING_MISSING"] };
    }
    let snapshot;
    try {
      snapshot = normalizeSourceSnapshot(snapshotValue, snapshotValue?.capturedAt);
    } catch (error) {
      return {
        matches: false,
        reasons: [error instanceof VideoCaptureError ? error.code : "INVALID_SOURCE"]
      };
    }
    const reasons = [];
    if (binding.tabId != null && snapshot.tabId != null && Number(binding.tabId) !== snapshot.tabId) {
      reasons.push("TAB_CHANGED");
    }
    if (binding.canonicalUrl !== snapshot.canonicalUrl) reasons.push("PAGE_CHANGED");
    if (binding.mediaKey !== snapshot.mediaKey) reasons.push("MEDIA_CHANGED");
    if (binding.sourceFingerprint !== snapshot.sourceFingerprint) reasons.push("FINGERPRINT_CHANGED");
    if (!snapshot.identityAvailable) reasons.push("MEDIA_IDENTITY_UNAVAILABLE");
    return { matches: reasons.length === 0, reasons, snapshot };
  }

  function transcriptBindingMatches(binding, snapshot) {
    return compareTranscriptBinding(binding, snapshot).matches;
  }

  function clone(value) {
    if (value == null) return value;
    if (typeof structuredClone === "function") return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
  }

  function makeId(prefix = "video") {
    const id = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    return `${prefix}-${id}`;
  }

  function normalizeNow(value) {
    const now = Number(value);
    if (!Number.isFinite(now) || now < 0) {
      throw new VideoCaptureError("INVALID_TIME", "Capture event time must be a non-negative number.");
    }
    return Math.floor(now);
  }

  function normalizeMediaTime(value, fallback = 0) {
    const mediaTime = Number(value);
    if (!Number.isFinite(mediaTime) || mediaTime < 0) return Math.max(0, Number(fallback) || 0);
    return Math.round(mediaTime);
  }

  function normalizePlaybackRate(value, fallback = 1) {
    const rate = Number(value);
    if (!Number.isFinite(rate)) return Number(fallback) || 1;
    if (rate < MIN_PLAYBACK_RATE || rate > MAX_PLAYBACK_RATE) {
      throw new VideoCaptureError(
        "INVALID_PLAYBACK_RATE",
        `Playback rate must be between ${MIN_PLAYBACK_RATE} and ${MAX_PLAYBACK_RATE}.`
      );
    }
    return rate;
  }

  function createCaptureJob(snapshotValue, options = {}) {
    const sourceSnapshot = normalizeSourceSnapshot(snapshotValue, snapshotValue?.capturedAt);
    if (!sourceSnapshot.identityAvailable) {
      throw new VideoCaptureError(
        "MEDIA_IDENTITY_UNAVAILABLE",
        "Automatic capture requires a stable current source, poster, or track identity."
      );
    }
    const createdAt = normalizeNow(options.createdAt ?? Date.now());
    const requestedLimit = Number(options.maxCaptureMs ?? MAX_CAPTURE_MS);
    const maxCaptureMs = Number.isFinite(requestedLimit)
      ? Math.max(1, Math.min(MAX_CAPTURE_MS, Math.floor(requestedLimit)))
      : MAX_CAPTURE_MS;
    return {
      schemaVersion: SCHEMA_VERSION,
      jobId: cleanText(options.jobId, 120) || makeId("capture"),
      status: "ready",
      sourceSnapshot,
      sourceFingerprint: sourceSnapshot.sourceFingerprint,
      createdAt,
      startedAt: null,
      completedAt: null,
      abortedAt: null,
      abortReason: "",
      capturedMs: 0,
      maxCaptureMs,
      chunks: [],
      activeChunk: null,
      lastMediaTimeMs: normalizeMediaTime(options.mediaTimeMs, 0),
      playbackRate: normalizePlaybackRate(options.playbackRate, 1),
      updatedAt: createdAt
    };
  }

  function assertMutableJob(job) {
    if (!job || typeof job !== "object") {
      throw new VideoCaptureError("INVALID_JOB", "A capture job is required.");
    }
    if (["completed", "aborted"].includes(job.status)) {
      throw new VideoCaptureError("JOB_FINISHED", `Capture job is already ${job.status}.`);
    }
  }

  function beginActiveChunk(job, now, mediaTimeMs, playbackRate) {
    if (job.activeChunk) {
      throw new VideoCaptureError("CHUNK_ALREADY_ACTIVE", "Finalize the active audio chunk before recording another one.");
    }
    if (job.capturedMs >= job.maxCaptureMs) {
      job.status = "completed";
      job.completedAt = now;
      return job;
    }
    job.status = "recording";
    job.lastMediaTimeMs = normalizeMediaTime(mediaTimeMs, job.lastMediaTimeMs);
    job.playbackRate = normalizePlaybackRate(playbackRate, job.playbackRate);
    job.activeChunk = {
      sequence: job.chunks.length + 1,
      captureStartedAt: now,
      mediaStartMs: job.lastMediaTimeMs,
      playbackRate: job.playbackRate
    };
    return job;
  }

  function finishActiveChunk(job, event, now, reason) {
    if (!job.activeChunk) return job;
    const active = job.activeChunk;
    const elapsed = Math.max(0, now - active.captureStartedAt);
    const requestedDuration = Number(event.capturedDurationMs);
    const measuredDuration = Number.isFinite(requestedDuration)
      ? Math.max(0, Math.round(requestedDuration))
      : elapsed;
    const remaining = Math.max(0, job.maxCaptureMs - job.capturedMs);
    const capturedDurationMs = Math.min(measuredDuration, MAX_CHUNK_MS, remaining);
    job.activeChunk = null;

    if (capturedDurationMs > 0) {
      const mediaEndMs = Math.round(active.mediaStartMs + capturedDurationMs * active.playbackRate);
      job.chunks.push({
        id: `chunk-${String(active.sequence).padStart(4, "0")}`,
        sequence: active.sequence,
        captureStartedAt: active.captureStartedAt,
        captureEndedAt: active.captureStartedAt + capturedDurationMs,
        capturedDurationMs,
        mediaStartMs: active.mediaStartMs,
        mediaEndMs,
        playbackRate: active.playbackRate,
        reason: cleanText(reason, 40) || "finalize"
      });
      job.capturedMs += capturedDurationMs;
      job.lastMediaTimeMs = mediaEndMs;
    }

    if (job.capturedMs >= job.maxCaptureMs) {
      job.status = "completed";
      job.completedAt = now;
    }
    return job;
  }

  function transitionCaptureJob(jobValue, event = {}, nowValue = Date.now()) {
    const job = clone(jobValue);
    assertMutableJob(job);
    const now = normalizeNow(event.now ?? nowValue);
    const type = cleanText(event.type, 30).toLowerCase();
    if (!type) throw new VideoCaptureError("INVALID_EVENT", "A capture event type is required.");

    if (type === "start") {
      if (job.status !== "ready") {
        throw new VideoCaptureError("INVALID_TRANSITION", "Only a ready capture job can start.");
      }
      job.startedAt = now;
      beginActiveChunk(job, now, event.mediaTimeMs, event.playbackRate);
    } else if (type === "record") {
      if (!["ready", "paused"].includes(job.status)) {
        throw new VideoCaptureError("INVALID_TRANSITION", "Recording can begin only from ready or paused state.");
      }
      if (job.startedAt == null) job.startedAt = now;
      beginActiveChunk(job, now, event.mediaTimeMs, event.playbackRate);
    } else if (type === "pause") {
      if (job.status !== "recording") {
        throw new VideoCaptureError("INVALID_TRANSITION", "Only a recording capture job can pause.");
      }
      finishActiveChunk(job, event, now, "pause");
      if (job.status !== "completed") job.status = "paused";
    } else if (type === "seek") {
      if (!["recording", "paused"].includes(job.status)) {
        throw new VideoCaptureError("INVALID_TRANSITION", "A seek requires a recording or paused capture job.");
      }
      if (job.status === "recording") finishActiveChunk(job, event, now, "seek");
      if (job.status !== "completed") {
        job.status = "paused";
        job.lastMediaTimeMs = normalizeMediaTime(event.mediaTimeMs, job.lastMediaTimeMs);
      }
    } else if (type === "rate") {
      if (!["recording", "paused"].includes(job.status)) {
        throw new VideoCaptureError("INVALID_TRANSITION", "A rate change requires a recording or paused capture job.");
      }
      const wasRecording = job.status === "recording";
      if (wasRecording) finishActiveChunk(job, event, now, "rate");
      if (job.status !== "completed") {
        job.playbackRate = normalizePlaybackRate(event.playbackRate, job.playbackRate);
        job.lastMediaTimeMs = normalizeMediaTime(event.mediaTimeMs, job.lastMediaTimeMs);
        if (wasRecording) beginActiveChunk(job, now, job.lastMediaTimeMs, job.playbackRate);
      }
    } else if (type === "finalize") {
      if (job.status !== "recording") {
        throw new VideoCaptureError("INVALID_TRANSITION", "Only a recording capture job has an active chunk to finalize.");
      }
      finishActiveChunk(job, event, now, event.reason || "finalize");
      if (job.status !== "completed") {
        if (event.continueRecording) {
          beginActiveChunk(
            job,
            now,
            event.mediaTimeMs ?? job.lastMediaTimeMs,
            event.playbackRate ?? job.playbackRate
          );
        } else {
          job.status = "paused";
        }
      }
    } else if (type === "complete") {
      if (!["recording", "paused", "ready"].includes(job.status)) {
        throw new VideoCaptureError("INVALID_TRANSITION", "Capture job cannot complete from its current state.");
      }
      if (job.status === "recording") finishActiveChunk(job, event, now, "complete");
      job.status = "completed";
      job.completedAt = now;
      job.activeChunk = null;
    } else if (type === "abort") {
      const discardedChunkCount = job.chunks.length + (job.activeChunk ? 1 : 0);
      job.status = "aborted";
      job.abortedAt = now;
      job.abortReason = cleanText(event.reason, 200) || "aborted";
      job.activeChunk = null;
      job.chunks = [];
      job.capturedMs = 0;
      job.discardedChunkCount = discardedChunkCount;
    } else {
      throw new VideoCaptureError("INVALID_EVENT", `Unsupported capture event: ${type}`);
    }

    job.updatedAt = now;
    return job;
  }

  function normalizeProviderSegment(segment, index) {
    const text = cleanText(segment?.text, MAX_SEGMENT_TEXT);
    const startMs = Number(segment?.startMs ?? Number(segment?.startSeconds) * 1000);
    const endCandidate = Number(segment?.endMs ?? Number(segment?.endSeconds) * 1000);
    const endMs = Number.isFinite(endCandidate) ? endCandidate : startMs;
    if (!text || !Number.isFinite(startMs) || !Number.isFinite(endMs)) {
      throw new VideoCaptureError("INVALID_SEGMENT", `Transcript segment ${index + 1} is incomplete.`);
    }
    return {
      id: cleanText(segment?.id, 100) || `provider-${String(index + 1).padStart(4, "0")}`,
      startMs: Math.round(startMs),
      endMs: Math.round(endMs),
      text
    };
  }

  function mapProviderSegments(providerSegments, chunk, options = {}) {
    if (!chunk || typeof chunk !== "object") {
      throw new VideoCaptureError("INVALID_CHUNK", "Chunk metadata is required for timestamp mapping.");
    }
    const rate = normalizePlaybackRate(chunk.playbackRate, 1);
    const mediaStartMs = normalizeMediaTime(chunk.mediaStartMs, 0);
    const capturedDurationMs = Number(chunk.capturedDurationMs);
    if (!Number.isFinite(capturedDurationMs) || capturedDurationMs <= 0 || capturedDurationMs > MAX_CHUNK_MS) {
      throw new VideoCaptureError("INVALID_CHUNK", `Chunk duration must be between 1 and ${MAX_CHUNK_MS} ms.`);
    }
    const videoDurationMs = normalizeDurationMs(options.videoDurationMs ?? options.durationMs);
    const normalized = (Array.isArray(providerSegments) ? providerSegments : [])
      .slice(0, MAX_SEGMENTS)
      .map(normalizeProviderSegment);

    let previousRelativeStart = -1;
    return normalized.map((segment, index) => {
      if (segment.startMs < 0 || segment.endMs < segment.startMs || segment.endMs > capturedDurationMs) {
        throw new VideoCaptureError(
          "INVALID_SEGMENT_TIME",
          `Transcript segment ${index + 1} falls outside its audio chunk.`
        );
      }
      if (segment.startMs < previousRelativeStart) {
        throw new VideoCaptureError("NON_MONOTONIC_SEGMENTS", "Provider transcript timestamps must be monotonic.");
      }
      previousRelativeStart = segment.startMs;
      const startMs = Math.round(mediaStartMs + segment.startMs * rate);
      const endMs = Math.round(mediaStartMs + segment.endMs * rate);
      if (videoDurationMs != null && endMs > videoDurationMs) {
        throw new VideoCaptureError("SEGMENT_OUT_OF_DURATION", "Estimated transcript timestamp exceeds video duration.");
      }
      return {
        id: segment.id,
        startMs,
        endMs,
        text: segment.text,
        sourceChunkId: cleanText(chunk.id, 100),
        provenance: "audio-ai",
        timestampConfidence: "AI-estimated"
      };
    });
  }

  function validateEstimatedSegments(segments, durationMs) {
    const videoDurationMs = normalizeDurationMs(durationMs);
    if (videoDurationMs == null) {
      throw new VideoCaptureError("INVALID_DURATION", "A finite video duration is required to validate estimated timestamps.");
    }
    const values = Array.isArray(segments) ? segments.slice(0, MAX_SEGMENTS) : [];
    const seenIds = new Set();
    let previousStart = -1;
    let previousEnd = -1;
    return values.map((segment, index) => {
      const normalized = normalizeProviderSegment(segment, index);
      if (normalized.startMs < 0 || normalized.endMs < normalized.startMs || normalized.endMs > videoDurationMs) {
        throw new VideoCaptureError("SEGMENT_OUT_OF_DURATION", `Transcript segment ${index + 1} is outside the video duration.`);
      }
      if (normalized.startMs < previousStart || normalized.endMs < previousEnd) {
        throw new VideoCaptureError("NON_MONOTONIC_SEGMENTS", "Estimated transcript timestamps must be monotonic.");
      }
      if (seenIds.has(normalized.id)) {
        throw new VideoCaptureError("DUPLICATE_SEGMENT_ID", `Transcript segment id ${normalized.id} is duplicated.`);
      }
      previousStart = normalized.startMs;
      previousEnd = normalized.endMs;
      seenIds.add(normalized.id);
      return {
        ...normalized,
        sourceChunkId: cleanText(segment?.sourceChunkId, 100),
        provenance: "audio-ai",
        timestampConfidence: "AI-estimated"
      };
    });
  }

  function downmixToMono(channelData) {
    const channels = Array.isArray(channelData)
      ? channelData.filter((channel) => channel && Number.isFinite(channel.length))
      : [];
    if (!channels.length) return new Float32Array(0);
    const length = Math.min(...channels.map((channel) => channel.length));
    const mono = new Float32Array(length);
    for (let index = 0; index < length; index += 1) {
      let sum = 0;
      for (const channel of channels) sum += Number(channel[index]) || 0;
      mono[index] = Math.max(-1, Math.min(1, sum / channels.length));
    }
    return mono;
  }

  function resampleLinear(samplesValue, sourceRateValue, targetRateValue = TARGET_SAMPLE_RATE) {
    const samples = samplesValue instanceof Float32Array
      ? samplesValue
      : Float32Array.from(samplesValue || []);
    const sourceRate = Number(sourceRateValue);
    const targetRate = Number(targetRateValue);
    if (!Number.isFinite(sourceRate) || sourceRate <= 0 || !Number.isFinite(targetRate) || targetRate <= 0) {
      throw new VideoCaptureError("INVALID_SAMPLE_RATE", "Source and target sample rates must be positive numbers.");
    }
    if (!samples.length || sourceRate === targetRate) return new Float32Array(samples);
    const outputLength = Math.max(1, Math.round(samples.length * targetRate / sourceRate));
    const output = new Float32Array(outputLength);
    const ratio = sourceRate / targetRate;
    for (let index = 0; index < outputLength; index += 1) {
      const position = index * ratio;
      const before = Math.min(samples.length - 1, Math.floor(position));
      const after = Math.min(samples.length - 1, before + 1);
      const fraction = position - before;
      output[index] = samples[before] + (samples[after] - samples[before]) * fraction;
    }
    return output;
  }

  function encodeWavPcm16(samplesValue, sampleRateValue = TARGET_SAMPLE_RATE) {
    const samples = samplesValue instanceof Float32Array
      ? samplesValue
      : Float32Array.from(samplesValue || []);
    const sampleRate = Math.round(Number(sampleRateValue));
    if (!Number.isFinite(sampleRate) || sampleRate <= 0) {
      throw new VideoCaptureError("INVALID_SAMPLE_RATE", "WAV sample rate must be a positive number.");
    }
    const bytesPerSample = 2;
    const dataSize = samples.length * bytesPerSample;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);
    const writeAscii = (offset, text) => {
      for (let index = 0; index < text.length; index += 1) {
        view.setUint8(offset + index, text.charCodeAt(index));
      }
    };

    writeAscii(0, "RIFF");
    view.setUint32(4, 36 + dataSize, true);
    writeAscii(8, "WAVE");
    writeAscii(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * bytesPerSample, true);
    view.setUint16(32, bytesPerSample, true);
    view.setUint16(34, 16, true);
    writeAscii(36, "data");
    view.setUint32(40, dataSize, true);

    for (let index = 0; index < samples.length; index += 1) {
      const sample = Math.max(-1, Math.min(1, Number(samples[index]) || 0));
      const pcm = sample < 0 ? Math.round(sample * 0x8000) : Math.round(sample * 0x7fff);
      view.setInt16(44 + index * bytesPerSample, pcm, true);
    }
    return buffer;
  }

  function prepareMonoWav(channelData, sourceRate, targetRate = TARGET_SAMPLE_RATE) {
    const mono = downmixToMono(channelData);
    const resampled = resampleLinear(mono, sourceRate, targetRate);
    return {
      buffer: encodeWavPcm16(resampled, targetRate),
      sampleRate: Math.round(targetRate),
      sampleCount: resampled.length,
      durationMs: Math.round(resampled.length / targetRate * 1000)
    };
  }

  function calculateAudioLevel(samplesValue) {
    const samples = samplesValue instanceof Float32Array
      ? samplesValue
      : Float32Array.from(samplesValue || []);
    if (!samples.length) return 0;
    let energy = 0;
    for (let index = 0; index < samples.length; index += 1) {
      const sample = Math.max(-1, Math.min(1, Number(samples[index]) || 0));
      energy += sample * sample;
    }
    return Math.max(0, Math.min(1, Math.sqrt(energy / samples.length)));
  }

  function evaluateCaptureHealth(metrics = {}, nowValue = Date.now()) {
    if (metrics.recording === false) return { status: "paused", code: "" };
    const now = normalizeNow(nowValue);
    const startedAt = normalizeNow(metrics.recordingStartedAt || metrics.startedAt || now);
    const elapsedMs = Math.max(0, now - startedAt);
    const totalInputSamples = Math.max(0, Number(metrics.totalInputSamples) || 0);
    const lastAudibleAt = Math.max(0, Number(metrics.lastAudibleAt) || 0);
    const audioLevel = Math.max(0, Number(metrics.audioLevel) || 0);
    if (!totalInputSamples && elapsedMs >= NO_SAMPLE_TIMEOUT_MS) {
      return {
        status: "error",
        code: "NO_TAB_AUDIO_SAMPLES",
        message: "Chrome opened the tab-audio stream, but no audio samples arrived. Confirm the video is playing with audible tab sound, then try again."
      };
    }
    const silentForMs = lastAudibleAt ? now - lastAudibleAt : elapsedMs;
    if (totalInputSamples > 0 && audioLevel < AUDIBLE_RMS_THRESHOLD && silentForMs >= SILENT_AUDIO_TIMEOUT_MS) {
      return {
        status: "error",
        code: "SILENT_TAB_AUDIO",
        message: "Tab audio stayed silent. Unmute the YouTube player and the Chrome tab, play audible speech, then start transcription again."
      };
    }
    if (audioLevel >= AUDIBLE_RMS_THRESHOLD || lastAudibleAt) return { status: "healthy", code: "" };
    return { status: "waiting", code: "" };
  }

  function transitionChunkTranscription(stateValue, chunkValue, eventValue, nowValue = Date.now()) {
    const state = stateValue && typeof stateValue === "object" ? { ...stateValue } : {};
    const chunk = chunkValue && typeof chunkValue === "object" ? chunkValue : {};
    const event = eventValue && typeof eventValue === "object" ? eventValue : {};
    const type = cleanText(event.type, 20).toLowerCase();
    if (!["pending", "success", "error"].includes(type)) {
      throw new VideoCaptureError("INVALID_TRANSCRIPTION_EVENT", "Chunk transcription must become pending, success, or error.");
    }
    const chunkId = cleanText(chunk.id, 100);
    if (!chunkId) throw new VideoCaptureError("INVALID_CHUNK", "Chunk transcription requires a stable chunk id.");

    const now = normalizeNow(nowValue);
    const records = Array.isArray(state.chunkTranscriptions)
      ? state.chunkTranscriptions.map((record) => ({ ...record }))
      : [];
    const index = records.findIndex((record) => record?.chunkId === chunkId);
    const previous = index >= 0 ? records[index] : null;
    const record = {
      chunkId,
      sequence: Math.max(0, Math.round(Number(chunk.sequence) || Number(previous?.sequence) || 0)),
      status: type,
      attemptCount: Math.max(1, Math.round(Number(event.attemptCount) || Number(previous?.attemptCount) || 1)),
      receivedAt: Number(previous?.receivedAt) || now,
      completedAt: type === "pending" ? 0 : now,
      segmentCount: type === "success" ? Math.max(0, Math.round(Number(event.segmentCount) || 0)) : 0,
      errorCode: type === "error" ? cleanText(event.errorCode, 80) || "TRANSCRIPTION_FAILED" : "",
      error: type === "error" ? cleanText(event.error, 500) || "This audio chunk could not be transcribed." : ""
    };
    if (type === "success" && record.segmentCount < 1) {
      throw new VideoCaptureError(
        "EMPTY_TRANSCRIPT_CHUNK",
        "A successful audio chunk must contain at least one validated transcript segment."
      );
    }
    if (index >= 0) records[index] = record;
    else records.push(record);

    const previousStatus = previous?.status || "";
    let pendingChunkCount = Math.max(0, Number(state.pendingChunkCount) || 0);
    let successfulChunkCount = Math.max(0, Number(state.successfulChunkCount) || 0);
    let failedChunkCount = Math.max(0, Number(state.failedChunkCount) || 0);
    if (!previousStatus && type === "pending") pendingChunkCount += 1;
    if (previousStatus === "pending" && type !== "pending") pendingChunkCount = Math.max(0, pendingChunkCount - 1);
    if (previousStatus !== "success" && type === "success") successfulChunkCount += 1;
    if (previousStatus === "success" && type !== "success") successfulChunkCount = Math.max(0, successfulChunkCount - 1);
    if (previousStatus !== "error" && type === "error") failedChunkCount += 1;
    if (previousStatus === "error" && type !== "error") failedChunkCount = Math.max(0, failedChunkCount - 1);

    return {
      ...state,
      pendingChunkCount,
      successfulChunkCount,
      failedChunkCount,
      transcriptionStatus: type,
      transcriptionAttemptCount: Math.max(Number(state.transcriptionAttemptCount) || 0, record.attemptCount),
      lastTranscriptionChunkId: chunkId,
      lastTranscriptionErrorCode: record.errorCode,
      lastTranscriptionError: record.error,
      chunkTranscriptions: records
        .sort((first, second) => Number(first.sequence) - Number(second.sequence))
        .slice(-24),
      updatedAt: now
    };
  }

  return Object.freeze({
    SCHEMA_VERSION,
    MAX_CAPTURE_MS,
    MAX_CHUNK_MS,
    CAPTURE_UPLOAD_CHUNK_MS,
    CAPTURE_PROGRESS_INTERVAL_MS,
    NO_SAMPLE_TIMEOUT_MS,
    SILENT_AUDIO_TIMEOUT_MS,
    AUDIBLE_RMS_THRESHOLD,
    CAPTURE_START_TIMEOUT_MS,
    STREAM_RESERVATION_TTL_MS,
    TARGET_SAMPLE_RATE,
    MESSAGE_TYPES,
    VideoCaptureError,
    validateCaptureManifest,
    toCaptureStartError,
    invokeChromeCallbackOrPromise,
    createResponseOnce,
    withTimeout,
    stableHash,
    canonicalUrl,
    normalizeMediaResource,
    normalizeTrackIdentity,
    normalizeSourceSnapshot,
    compareSourceSnapshots,
    sourceSnapshotsMatch,
    createCaptureReservationSourceBinding,
    compareCaptureReservationSource,
    createStreamReservationRegistry,
    createTranscriptBinding,
    compareTranscriptBinding,
    transcriptBindingMatches,
    createCaptureJob,
    transitionCaptureJob,
    mapProviderSegments,
    validateEstimatedSegments,
    downmixToMono,
    resampleLinear,
    encodeWavPcm16,
    prepareMonoWav,
    calculateAudioLevel,
    evaluateCaptureHealth,
    transitionChunkTranscription
  });
});
