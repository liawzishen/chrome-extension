(function initVideoOffscreen(root) {
  "use strict";

  const Video = root.NeatMindVideo;
  if (!Video) throw new Error("video-utils.js must load before offscreen.js");

  const Types = Video.MESSAGE_TYPES;
  const WORKER_EVENT_TIMEOUT_MS = 120 * 1000;
  let session = null;
  let operationQueue = Promise.resolve();

  function sendRuntimeMessage(message, timeoutMs = Video.CAPTURE_START_TIMEOUT_MS) {
    if (typeof chrome === "undefined" || !chrome.runtime?.sendMessage) return Promise.resolve();
    const responsePromise = Video.invokeChromeCallbackOrPromise(
      (callback) => chrome.runtime.sendMessage({ ...message, target: "service-worker" }, callback),
      () => chrome.runtime?.lastError
    );
    return Video.withTimeout(
      responsePromise,
      timeoutMs,
      () => new Video.VideoCaptureError("WORKER_RESPONSE_TIMEOUT", "The video capture worker did not respond in time.")
    ).then((response) => {
      if (response?.ok !== false) return response;
      const detail = response.error && typeof response.error === "object" ? response.error : {};
      throw new Video.VideoCaptureError(
        String(detail.code || "WORKER_EVENT_REJECTED").slice(0, 80),
        String(detail.message || response.error || "The video capture worker rejected this recorder event.").slice(0, 500)
      );
    });
  }

  function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    const blockSize = 0x8000;
    let binary = "";
    for (let offset = 0; offset < bytes.length; offset += blockSize) {
      binary += String.fromCharCode(...bytes.subarray(offset, Math.min(bytes.length, offset + blockSize)));
    }
    return btoa(binary);
  }

  function normalizeMediaTime(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? Math.round(number) : Math.max(0, Number(fallback) || 0);
  }

  function normalizeRate(value, fallback = 1) {
    const rate = Number(value);
    if (!Number.isFinite(rate)) return fallback;
    if (rate < 0.25 || rate > 16) throw new Error("Playback rate must be between 0.25 and 16.");
    return rate;
  }

  function takeBufferedSamples(target, count) {
    const output = new Float32Array(count);
    let offset = 0;
    while (offset < count && target.sampleBuffers.length) {
      const first = target.sampleBuffers[0];
      const needed = count - offset;
      if (first.length <= needed) {
        output.set(first, offset);
        offset += first.length;
        target.sampleBuffers.shift();
      } else {
        output.set(first.subarray(0, needed), offset);
        target.sampleBuffers[0] = first.slice(needed);
        offset += needed;
      }
    }
    target.bufferedSamples = Math.max(0, target.bufferedSamples - offset);
    return offset === output.length ? output : output.slice(0, offset);
  }

  function appendSamples(target, samples) {
    if (!samples.length) return;
    target.sampleBuffers.push(samples);
    target.bufferedSamples += samples.length;
    target.totalInputSamples += samples.length;
  }

  function getLiveCapturedMs(target) {
    return Math.max(0, Math.round(target.totalInputSamples / target.sourceSampleRate * 1000));
  }

  function queueProgress(target) {
    if (!target || target.progressInFlight || target.stopping || session !== target) return;
    target.lastProgressAt = Date.now();
    target.progressInFlight = true;
    void sendRuntimeMessage({
      type: Types.PROGRESS,
      jobId: target.jobId,
      sourceFingerprint: target.sourceSnapshot.sourceFingerprint,
      recording: target.recording,
      liveCapturedMs: getLiveCapturedMs(target),
      bufferedMs: Math.round(target.bufferedSamples / target.sourceSampleRate * 1000),
      totalInputSamples: target.totalInputSamples,
      samplesObserved: target.totalInputSamples > 0,
      audioLevel: target.audioLevel,
      peakAudioLevel: target.peakAudioLevel,
      lastSampleAt: target.lastSampleAt,
      lastAudibleAt: target.lastAudibleAt,
      receivedChunkCount: target.chunkSequence
    }).catch(() => undefined).finally(() => {
      target.progressInFlight = false;
    });
  }

  function monitorCaptureHealth(target) {
    if (!target || target.stopping || target.watchdogTriggered || session !== target) return;
    queueProgress(target);
    const health = Video.evaluateCaptureHealth(target, Date.now());
    if (health.status !== "error") return;
    target.watchdogTriggered = true;
    target.recording = false;
    operationQueue = operationQueue
      .then(async () => {
        await emitError(target, health.code, new Error(health.message));
        await stopCapture({ jobId: target.jobId, reason: health.code.toLowerCase(), discard: true });
      })
      .catch(() => undefined);
  }

  async function emitChunk(target, monoSamples, reason) {
    if (!monoSamples.length || target.discardAll) return;
    const sourceDurationMs = Math.round(monoSamples.length / target.sourceSampleRate * 1000);
    if (sourceDurationMs <= 0) return;
    const sequence = ++target.chunkSequence;
    const id = `chunk-${String(sequence).padStart(4, "0")}`;
    const mediaStartMs = target.nextMediaStartMs;
    const mediaEndMs = Math.round(mediaStartMs + sourceDurationMs * target.playbackRate);
    const prepared = Video.prepareMonoWav([monoSamples], target.sourceSampleRate, Video.TARGET_SAMPLE_RATE);
    const wavBase64 = arrayBufferToBase64(prepared.buffer);
    const captureEndedAt = Date.now();
    const captureStartedAt = Math.max(target.chunkStartedAt, captureEndedAt - sourceDurationMs);

    await sendRuntimeMessage({
      type: Types.CHUNK,
      jobId: target.jobId,
      sourceFingerprint: target.sourceSnapshot.sourceFingerprint,
      chunk: {
        id,
        sequence,
        captureStartedAt,
        captureEndedAt,
        capturedDurationMs: sourceDurationMs,
        mediaStartMs,
        mediaEndMs,
        playbackRate: target.playbackRate,
        reason: String(reason || "interval").slice(0, 40),
        sampleRate: prepared.sampleRate,
        sampleCount: prepared.sampleCount,
        liveCapturedMs: getLiveCapturedMs(target),
        audioLevel: target.audioLevel,
        peakAudioLevel: target.peakAudioLevel,
        mimeType: "audio/wav",
        encoding: "base64",
        wavBase64
      }
    }, WORKER_EVENT_TIMEOUT_MS);

    target.nextMediaStartMs = mediaEndMs;
    target.emittedCaptureMs += sourceDurationMs;
    target.chunkStartedAt = Date.now();
  }

  function queueChunk(target, samples, reason) {
    target.sendQueue = target.sendQueue
      .then(() => emitChunk(target, samples, reason))
      .catch((error) => emitError(target, "CHUNK_DELIVERY_FAILED", error));
    return target.sendQueue;
  }

  function flushFullChunks(target) {
    const samplesPerChunk = Math.max(1, Math.floor(target.sourceSampleRate * Video.CAPTURE_UPLOAD_CHUNK_MS / 1000));
    while (target.bufferedSamples >= samplesPerChunk) {
      queueChunk(target, takeBufferedSamples(target, samplesPerChunk), "interval");
    }
  }

  function flushPartialChunk(target, reason) {
    if (!target.bufferedSamples || target.discardAll) return target.sendQueue;
    queueChunk(target, takeBufferedSamples(target, target.bufferedSamples), reason);
    return target.sendQueue;
  }

  function preservePlaybackAndCollect(event) {
    const target = session;
    if (!target || target.stopping) return;

    const input = event.inputBuffer;
    const output = event.outputBuffer;
    const inputChannels = [];
    for (let channel = 0; channel < input.numberOfChannels; channel += 1) {
      inputChannels.push(input.getChannelData(channel));
    }

    for (let channel = 0; channel < output.numberOfChannels; channel += 1) {
      const destination = output.getChannelData(channel);
      const source = inputChannels[Math.min(channel, inputChannels.length - 1)];
      if (source) destination.set(source);
      else destination.fill(0);
    }

    if (!target.recording || !inputChannels.length) return;
    const mono = Video.downmixToMono(inputChannels);
    const now = Date.now();
    const audioLevel = Video.calculateAudioLevel(mono);
    target.lastSampleAt = now;
    target.audioLevel = audioLevel;
    target.peakAudioLevel = Math.max(target.peakAudioLevel, audioLevel);
    if (audioLevel >= Video.AUDIBLE_RMS_THRESHOLD) target.lastAudibleAt = now;
    const maxInputSamples = Math.floor(target.sourceSampleRate * Video.MAX_CAPTURE_MS / 1000);
    const remaining = Math.max(0, maxInputSamples - target.totalInputSamples);
    if (remaining > 0) appendSamples(target, mono.length > remaining ? mono.slice(0, remaining) : mono);
    flushFullChunks(target);
    if (now - target.lastProgressAt >= Video.CAPTURE_PROGRESS_INTERVAL_MS) queueProgress(target);

    if (target.totalInputSamples >= maxInputSamples && !target.limitStopScheduled) {
      target.limitStopScheduled = true;
      target.recording = false;
      operationQueue = operationQueue
        .then(() => stopCapture({ reason: "limit", discard: false }))
        .catch(() => undefined);
    }
  }

  async function emitError(target, code, error) {
    try {
      await sendRuntimeMessage({
        type: Types.ERROR,
        jobId: target?.jobId || "",
        code,
        message: String(error?.message || error || "Video capture failed.").slice(0, 500)
      });
    } catch {
      // The worker can disappear while Chrome is shutting down the extension.
    }
  }

  async function releaseAudioGraph(target) {
    if (!target) return;
    if (target.watchdogTimer) clearInterval(target.watchdogTimer);
    target.watchdogTimer = null;
    if (target.processor) {
      target.processor.onaudioprocess = null;
      try { target.processor.disconnect(); } catch { /* already disconnected */ }
    }
    if (target.sourceNode) {
      try { target.sourceNode.disconnect(); } catch { /* already disconnected */ }
    }
    if (target.audioTrack && target.trackEndedHandler) {
      target.audioTrack.removeEventListener("ended", target.trackEndedHandler);
    }
    for (const track of target.stream?.getTracks?.() || []) track.stop();
    if (target.audioContext && target.audioContext.state !== "closed") {
      try { await target.audioContext.close(); } catch { /* closing is best-effort */ }
    }
  }

  async function stopCapture(message = {}) {
    const target = session;
    if (!target) return { ok: true, active: false };
    if (message.jobId && message.jobId !== target.jobId) {
      throw new Error("The requested capture job is not active in the offscreen document.");
    }
    if (target.stopping) return { ok: true, active: false, stopping: true };

    target.stopping = true;
    target.recording = false;
    const reason = String(message.reason || "stopped").slice(0, 80);
    const discardAll = Boolean(message.discard)
      || ["abort", "navigation", "media-changed", "permission-denied", "replaced"].includes(reason);
    target.discardAll = discardAll;
    if (discardAll) {
      target.sampleBuffers = [];
      target.bufferedSamples = 0;
    } else {
      flushPartialChunk(target, reason);
    }
    await target.sendQueue.catch(() => undefined);
    await releaseAudioGraph(target);
    session = null;

    await sendRuntimeMessage({
      type: Types.STOPPED,
      jobId: target.jobId,
      reason,
      discardAll,
      chunkCount: discardAll ? 0 : target.chunkSequence,
      capturedMs: discardAll ? 0 : target.emittedCaptureMs,
      liveCapturedMs: discardAll ? 0 : getLiveCapturedMs(target),
      totalInputSamples: discardAll ? 0 : target.totalInputSamples,
      audioLevel: target.audioLevel,
      peakAudioLevel: target.peakAudioLevel
    }).catch(() => undefined);
    return { ok: true, active: false, reason, discardAll };
  }

  async function startCapture(message) {
    const streamId = String(message.streamId || "").trim();
    const jobId = String(message.jobId || "").trim().slice(0, 120);
    if (!streamId || !jobId) throw new Error("A tab stream id and capture job id are required.");
    if (session) await stopCapture({ reason: "replaced", discard: true });

    const sourceSnapshot = Video.normalizeSourceSnapshot(message.sourceSnapshot || {});
    if (!sourceSnapshot.identityAvailable) throw new Error("The current video does not expose a stable media identity.");

    let target = null;
    let pendingResources = null;
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Tab-audio media capture is unavailable in this offscreen document.");
      }
      // A chromeMediaSourceId obtained through chrome.tabCapture is deliberately
      // required here. This constraint cannot fall back to the microphone.
      const stream = await Video.withTimeout(
        navigator.mediaDevices.getUserMedia({
          audio: {
            mandatory: {
              chromeMediaSource: "tab",
              chromeMediaSourceId: streamId
            }
          },
          video: false
        }),
        Video.CAPTURE_START_TIMEOUT_MS,
        () => new Video.VideoCaptureError(
          "TAB_AUDIO_STREAM_TIMEOUT",
          "Chrome did not provide the authorized tab-audio stream in time."
        )
      );
      pendingResources = { stream };
      const audioTrack = stream.getAudioTracks?.()[0] || null;
      if (!audioTrack || audioTrack.readyState === "ended") {
        for (const track of stream.getTracks?.() || []) track.stop();
        throw new Error("The selected tab did not provide a live audio track.");
      }
      const AudioContextClass = root.AudioContext || root.webkitAudioContext;
      if (!AudioContextClass) throw new Error("AudioContext is unavailable in the offscreen document.");
      const audioContext = new AudioContextClass();
      pendingResources.audioContext = audioContext;
      const sourceNode = audioContext.createMediaStreamSource(stream);
      pendingResources.sourceNode = sourceNode;
      if (typeof audioContext.createScriptProcessor !== "function") {
        throw new Error("This Chrome version cannot initialize the tab-audio processor.");
      }
      const processor = audioContext.createScriptProcessor(4096, 2, 2);
      pendingResources.processor = processor;
      const now = Date.now();
      target = {
        jobId,
        stream,
        audioTrack,
        audioContext,
        sourceNode,
        processor,
        sourceSnapshot,
        sourceSampleRate: audioContext.sampleRate,
        playbackRate: normalizeRate(message.playbackRate, 1),
        nextMediaStartMs: normalizeMediaTime(message.mediaStartMs, 0),
        recording: message.recording !== false,
        stopping: false,
        discardAll: false,
        limitStopScheduled: false,
        sampleBuffers: [],
        bufferedSamples: 0,
        totalInputSamples: 0,
        emittedCaptureMs: 0,
        recordingStartedAt: now,
        lastSampleAt: 0,
        lastAudibleAt: 0,
        audioLevel: 0,
        peakAudioLevel: 0,
        lastProgressAt: 0,
        progressInFlight: false,
        watchdogTriggered: false,
        watchdogTimer: null,
        chunkSequence: 0,
        chunkStartedAt: now,
        sendQueue: Promise.resolve(),
        trackEndedHandler: null
      };
      target.trackEndedHandler = () => {
        if (target.stopping || session !== target) return;
        operationQueue = operationQueue
          .then(async () => {
            await emitError(target, "TAB_AUDIO_TRACK_ENDED", new Error("Chrome ended the captured tab-audio track."));
            await stopCapture({ jobId: target.jobId, reason: "track-ended", discard: true });
          })
          .catch(() => undefined);
      };
      audioTrack.addEventListener("ended", target.trackEndedHandler, { once: true });
      processor.onaudioprocess = preservePlaybackAndCollect;
      sourceNode.connect(processor);
      // Routing captured tab audio back to the output preserves ordinary playback.
      processor.connect(audioContext.destination);
      if (audioContext.state === "suspended") {
        await Video.withTimeout(
          audioContext.resume(),
          Video.CAPTURE_START_TIMEOUT_MS,
          () => new Video.VideoCaptureError("AUDIO_CONTEXT_TIMEOUT", "Chrome did not start the tab-audio playback graph in time.")
        );
      }
      if (audioContext.state !== "running") {
        throw new Error(`The tab-audio playback graph is ${audioContext.state || "not running"}.`);
      }
      session = target;
      target.watchdogTimer = setInterval(
        () => monitorCaptureHealth(target),
        Video.CAPTURE_PROGRESS_INTERVAL_MS
      );

      await sendRuntimeMessage({
        type: Types.READY,
        jobId,
        sourceFingerprint: sourceSnapshot.sourceFingerprint,
        sampleRate: audioContext.sampleRate,
        maxCaptureMs: Video.MAX_CAPTURE_MS,
        maxChunkMs: Video.MAX_CHUNK_MS,
        playbackPreserved: true,
        microphone: false
      });
      return { ok: true, active: true, jobId };
    } catch (error) {
      const failedResources = target || pendingResources;
      session = null;
      // Let the START message reject immediately so its runtime channel can be
      // answered. Media cleanup and the state event are both best-effort and
      // must not hold the original response port open.
      void releaseAudioGraph(failedResources)
        .catch(() => undefined)
        .then(() => emitError(target || { jobId }, "CAPTURE_START_FAILED", error))
        .catch(() => undefined);
      throw error;
    }
  }

  async function controlCapture(message) {
    const target = session;
    if (!target || target.jobId !== String(message.jobId || "")) {
      throw new Error("The requested capture job is not active in the offscreen document.");
    }
    const action = String(message.action || "").toLowerCase();
    if (action === "pause" || action === "seek" || action === "rate") {
      target.recording = false;
      flushPartialChunk(target, action);
      await target.sendQueue;
    }
    if (action === "pause") {
      return { ok: true, active: true, recording: false };
    }
    if (action === "seek") {
      target.nextMediaStartMs = normalizeMediaTime(message.mediaTimeMs, target.nextMediaStartMs);
      target.chunkStartedAt = Date.now();
      return { ok: true, active: true, recording: false };
    }
    if (action === "rate") {
      target.nextMediaStartMs = normalizeMediaTime(message.mediaTimeMs, target.nextMediaStartMs);
      target.playbackRate = normalizeRate(message.playbackRate, target.playbackRate);
      target.chunkStartedAt = Date.now();
      target.recording = message.recording !== false;
      return { ok: true, active: true, recording: target.recording };
    }
    if (action === "record" || action === "resume") {
      target.nextMediaStartMs = normalizeMediaTime(message.mediaTimeMs, target.nextMediaStartMs);
      target.playbackRate = normalizeRate(message.playbackRate, target.playbackRate);
      target.chunkStartedAt = Date.now();
      target.recordingStartedAt = Date.now();
      target.lastSampleAt = 0;
      target.lastAudibleAt = 0;
      target.audioLevel = 0;
      target.recording = true;
      return { ok: true, active: true, recording: true };
    }
    throw new Error(`Unsupported offscreen capture control: ${action}`);
  }

  function getCaptureState() {
    if (!session) return { ok: true, active: false };
    return {
      ok: true,
      active: true,
      jobId: session.jobId,
      sourceFingerprint: session.sourceSnapshot.sourceFingerprint,
      recording: session.recording,
      chunkCount: session.chunkSequence,
      capturedMs: session.emittedCaptureMs,
      liveCapturedMs: getLiveCapturedMs(session),
      bufferedMs: Math.round(session.bufferedSamples / session.sourceSampleRate * 1000),
      totalInputSamples: session.totalInputSamples,
      samplesObserved: session.totalInputSamples > 0,
      audioLevel: session.audioLevel,
      peakAudioLevel: session.peakAudioLevel,
      lastSampleAt: session.lastSampleAt,
      lastAudibleAt: session.lastAudibleAt,
      maxCaptureMs: Video.MAX_CAPTURE_MS,
      maxChunkMs: Video.MAX_CHUNK_MS,
      playbackPreserved: true,
      microphone: false
    };
  }

  async function handleMessage(message) {
    if (message.type === Types.START) return startCapture(message);
    if (message.type === Types.CONTROL) return controlCapture(message);
    if (message.type === Types.STOP) return stopCapture(message);
    if (message.type === Types.GET_STATE) return getCaptureState();
    return null;
  }

  if (typeof chrome !== "undefined" && chrome.runtime?.onMessage) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (sender.id !== chrome.runtime.id || message?.target !== "offscreen" || !Object.values(Types).includes(message?.type)) return false;
      if (![Types.START, Types.CONTROL, Types.STOP, Types.GET_STATE].includes(message.type)) return false;
      const respond = Video.createResponseOnce(sendResponse);
      operationQueue = operationQueue
        .then(() => handleMessage(message))
        .then((response) => respond(response))
        .catch((error) => {
          // Respond before emitting telemetry. The worker may decide to close
          // this document after receiving the error, which would otherwise
          // destroy this still-open reply channel.
          respond({ ok: false, error: String(error?.message || error) });
          if (message.type !== Types.START) {
            void emitError(session || { jobId: String(message.jobId || "") }, "OFFSCREEN_OPERATION_FAILED", error);
          }
        });
      return true;
    });
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
