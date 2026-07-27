const { AsyncLocalStorage } = require("async_hooks");
const { appendFile, stat } = require("fs/promises");
const { createHash, randomUUID } = require("crypto");

const ALLOWED_ACTIONS = new Set([
  "study_build",
  "quiz_build",
  "classification_batch",
  "visual_followup",
  "journey_summary",
  "video_transcript",
  "transcript_chunk"
]);
const ALLOWED_SOURCE_TYPES = new Set(["webpage", "notes", "video", "collection", "unknown"]);
const PROVIDER_OPERATIONS = new Map([
  ["study_notes", "notes_generation"],
  ["quiz_session", "study_quiz_generation"],
  ["quiz_only", "quiz_generation"],
  ["quiz_grounding_verification", "quiz_verification"],
  ["visual_followup", "visual_followup"],
  ["classify_sources", "classification"],
  ["journey_summary", "journey_summary"],
  ["video_transcript", "video_transcription"]
]);

function createCostTelemetry(options = {}) {
  const actionStorage = new AsyncLocalStorage();
  const outputPath = String(options.outputPath || "").trim();
  const now = typeof options.now === "function" ? options.now : Date.now;
  const maxBytes = normalizeMaxBytes(options.maxBytes);
  const writeLine = typeof options.writeLine === "function"
    ? options.writeLine
    : createBoundedFileWriter(outputPath, maxBytes);
  const writer = createQueuedWriter(writeLine, options.maxPendingWrites);
  const prices = normalizePrices(options.prices);

  async function runAction(action, input, operation) {
    if (!outputPath && typeof options.writeLine !== "function") return operation();

    const startedAt = now();
    const context = {
      eventId: randomUUID(),
      action: normalizeAction(action),
      sourceType: normalizeSourceType(input?.sourceType),
      inputSizeBucket: getSizeBucket(estimateInputSize(input)),
      providerCalls: 0,
      providerRetries: 0,
      inputTokens: 0,
      outputTokens: 0,
      estimatedCostUsd: 0,
      unpricedProviderCalls: 0,
      transportFailures: 0,
      transportRetries: 0,
      validationRejections: 0,
      validationRetries: 0,
      providerUsage: new Map()
    };

    return actionStorage.run(context, async () => {
      try {
        const result = await operation();
        emit("succeeded");
        return result;
      } catch (error) {
        emit("failed", normalizeResultCode(error));
        throw error;
      }
    });

    function emit(outcome, resultCode = "OK") {
      const event = {
        schemaVersion: 1,
        eventId: context.eventId,
        recordedAt: new Date(now()).toISOString(),
        action: context.action,
        sourceType: context.sourceType,
        inputSizeBucket: context.inputSizeBucket,
        outcome,
        resultCode,
        latencyMs: Math.max(0, now() - startedAt),
        providerCalls: context.providerCalls,
        providerRetries: context.providerRetries,
        transportFailures: context.transportFailures,
        transportRetries: context.transportRetries,
        validationRejections: context.validationRejections,
        validationRetries: context.validationRetries,
        inputTokens: context.inputTokens,
        outputTokens: context.outputTokens,
        estimatedCostUsd: roundUsd(context.estimatedCostUsd),
        costStatus: context.providerCalls === 0
          ? "not_applicable"
          : context.unpricedProviderCalls === 0 ? "configured" : "incomplete",
        ...getMediaUsage(context.action, input),
        providerUsage: [...context.providerUsage.values()]
          .map((usage) => ({
            ...usage,
            estimatedCostUsd: roundUsd(usage.estimatedCostUsd),
            costStatus: usage.unpricedCalls === 0 ? "configured" : "incomplete"
          }))
          .map(({ unpricedCalls, ...usage }) => usage)
          .sort((left, right) => left.operation.localeCompare(right.operation))
      };
      writer.enqueue(JSON.stringify(event));
    }
  }

  function recordProviderResult(provider, model, operation, result) {
    const context = actionStorage.getStore();
    if (!context) return;
    const usage = extractProviderUsage(provider, result);
    const priceConfigured = hasConfiguredPrice(prices, provider, model);
    const providerEvent = recordProviderCall(context, provider, model, operation, priceConfigured);
    const cost = estimateCost(prices, provider, model, usage);
    context.inputTokens += usage.inputTokens;
    context.outputTokens += usage.outputTokens;
    context.estimatedCostUsd += cost;
    providerEvent.inputTokens += usage.inputTokens;
    providerEvent.outputTokens += usage.outputTokens;
    providerEvent.estimatedCostUsd += cost;
  }

  function recordProviderFailure(provider, model, operation, willRetry = false) {
    const context = actionStorage.getStore();
    if (!context) return;
    const providerEvent = recordProviderCall(
      context,
      provider,
      model,
      operation,
      hasConfiguredPrice(prices, provider, model)
    );
    context.transportFailures += 1;
    providerEvent.transportFailures += 1;
    if (willRetry) {
      context.transportRetries += 1;
      providerEvent.transportRetries += 1;
    }
  }

  function recordValidationRejection(provider, model, operation, willRetry = false) {
    const context = actionStorage.getStore();
    if (!context) return;
    const providerEvent = getProviderEvent(
      context,
      provider,
      model,
      operation,
      hasConfiguredPrice(prices, provider, model)
    );
    context.validationRejections += 1;
    providerEvent.validationRejections += 1;
    if (willRetry) {
      context.validationRetries += 1;
      providerEvent.validationRetries += 1;
    }
  }

  return {
    flush: writer.flush,
    runAction,
    recordProviderResult,
    recordProviderFailure,
    recordValidationRejection
  };
}

function extractProviderUsage(provider, result) {
  const normalizedProvider = String(provider || "").toLowerCase();
  if (normalizedProvider === "openai") {
    return {
      inputTokens: boundedCount(result?.usage?.input_tokens),
      outputTokens: boundedCount(result?.usage?.output_tokens)
    };
  }
  if (normalizedProvider === "gemini") {
    const inputTokens = boundedCount(result?.usageMetadata?.promptTokenCount);
    const candidatesTokens = boundedCount(result?.usageMetadata?.candidatesTokenCount);
    const thoughtTokens = boundedCount(result?.usageMetadata?.thoughtsTokenCount);
    return {
      inputTokens,
      outputTokens: candidatesTokens + thoughtTokens
    };
  }
  return { inputTokens: 0, outputTokens: 0 };
}

function normalizePrices(value = {}) {
  const normalized = {};
  for (const [key, price] of Object.entries(value || {})) {
    const amount = Number(price);
    if (/^[a-z0-9._-]+:(input|output)$/i.test(key) && Number.isFinite(amount) && amount >= 0) {
      normalized[key.toLowerCase()] = amount;
    }
  }
  return normalized;
}

function estimateCost(prices, provider, model, usage) {
  const prefix = `${String(provider || "").toLowerCase()}.${String(model || "").toLowerCase()}`;
  const inputRate = prices[`${prefix}:input`] || 0;
  const outputRate = prices[`${prefix}:output`] || 0;
  return (usage.inputTokens * inputRate + usage.outputTokens * outputRate) / 1_000_000;
}

function hasConfiguredPrice(prices, provider, model) {
  const prefix = `${String(provider || "").toLowerCase()}.${String(model || "").toLowerCase()}`;
  return Object.hasOwn(prices, `${prefix}:input`) && Object.hasOwn(prices, `${prefix}:output`);
}

function estimateInputSize(input) {
  const stack = [input];
  const seen = new WeakSet();
  let total = 0;
  let visitedObjects = 0;
  while (stack.length && total < 1_000_000_000 && visitedObjects < 10_000) {
    const value = stack.pop();
    if (typeof value === "string") {
      total += value.length;
      continue;
    }
    if (!value || typeof value !== "object" || seen.has(value)) continue;
    seen.add(value);
    visitedObjects += 1;
    Object.values(value).forEach((item) => stack.push(item));
  }
  return Math.min(total, 1_000_000_000);
}

function getSizeBucket(size) {
  if (size <= 0) return "none";
  if (size <= 4_000) return "xs";
  if (size <= 16_000) return "small";
  if (size <= 64_000) return "medium";
  if (size <= 256_000) return "large";
  return "xl";
}

function normalizeAction(value) {
  const action = String(value || "").toLowerCase();
  return ALLOWED_ACTIONS.has(action) ? action : "unknown";
}

function normalizeSourceType(value) {
  const sourceType = String(value || "unknown").toLowerCase();
  return ALLOWED_SOURCE_TYPES.has(sourceType) ? sourceType : "unknown";
}

function normalizeResultCode(error) {
  const code = String(error?.code || "").toUpperCase();
  const statusCode = Number(error?.statusCode);
  if (code === "PROVIDER_TIMEOUT") return "PROVIDER_TIMEOUT";
  if (code === "PROVIDER_UNAVAILABLE") return "PROVIDER_UNAVAILABLE";
  if (code === "QUIZ_VERIFIER_UNAVAILABLE") return "VERIFIER_UNAVAILABLE";
  if (code.startsWith("GEMINI_")) return "PROVIDER_RESPONSE_INVALID";
  if (statusCode === 429) return "RATE_LIMITED";
  if (statusCode >= 500) return "SERVER_ERROR";
  if (statusCode >= 400) return "VALIDATION_FAILED";
  return "ACTION_FAILED";
}

function recordProviderCall(context, provider, model, operation, priceConfigured) {
  const providerEvent = getProviderEvent(context, provider, model, operation, priceConfigured);
  context.providerCalls += 1;
  providerEvent.calls += 1;
  if (!priceConfigured) {
    context.unpricedProviderCalls += 1;
    providerEvent.unpricedCalls += 1;
  }
  if (providerEvent.calls > 1) {
    context.providerRetries += 1;
    providerEvent.retries += 1;
  }
  return providerEvent;
}

function getProviderEvent(context, provider, model, operation) {
  const normalizedProvider = normalizeIdentifier(provider, "unknown");
  const normalizedModel = normalizeIdentifier(model, "unknown");
  const normalizedOperation = PROVIDER_OPERATIONS.get(String(operation || "").toLowerCase()) || "unknown";
  const key = `${normalizedProvider}:${normalizedModel}:${normalizedOperation}`;
  let providerEvent = context.providerUsage.get(key);
  if (!providerEvent) {
    providerEvent = {
      provider: normalizedProvider,
      model: normalizedModel,
      operation: normalizedOperation,
      calls: 0,
      retries: 0,
      transportFailures: 0,
      transportRetries: 0,
      validationRejections: 0,
      validationRetries: 0,
      inputTokens: 0,
      outputTokens: 0,
      estimatedCostUsd: 0,
      unpricedCalls: 0
    };
    context.providerUsage.set(key, providerEvent);
  }
  return providerEvent;
}

function normalizeIdentifier(value, fallback) {
  const normalized = String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "_")
    .slice(0, 100);
  return normalized || fallback;
}

function boundedCount(value) {
  const count = Number(value);
  return Number.isFinite(count) && count > 0 ? Math.min(Math.round(count), 1_000_000_000) : 0;
}

function roundUsd(value) {
  return Math.round(Math.max(0, Number(value) || 0) * 1_000_000) / 1_000_000;
}

function getMediaUsage(action, input) {
  if (action !== "video_transcript" && action !== "transcript_chunk") return {};
  const rawDuration = action === "transcript_chunk"
    ? input?.chunk?.capturedDurationMs ?? input?.capturedDurationMs
    : input?.durationMs;
  const maximum = action === "transcript_chunk" ? 45_000 : 12 * 60 * 60 * 1000;
  const durationMs = Math.max(0, Math.min(maximum, Math.round(Number(rawDuration) || 0)));
  const jobId = action === "transcript_chunk" ? String(input?.jobId || "") : "";
  return {
    mediaDurationMs: durationMs,
    mediaDurationBucket: getDurationBucket(durationMs),
    ...(jobId ? { mediaJobKey: createHash("sha256").update(jobId).digest("hex").slice(0, 16) } : {})
  };
}

function getDurationBucket(durationMs) {
  if (durationMs <= 0) return "unknown";
  if (durationMs <= 60_000) return "up_to_1m";
  if (durationMs <= 15 * 60_000) return "up_to_15m";
  if (durationMs <= 60 * 60_000) return "up_to_1h";
  return "over_1h";
}

function createBoundedFileWriter(outputPath, maxBytes) {
  let currentBytesPromise;
  return async (line) => {
    if (!outputPath) return;
    if (!currentBytesPromise) {
      currentBytesPromise = stat(outputPath)
        .then((metadata) => metadata.size)
        .catch((error) => error?.code === "ENOENT" ? 0 : Promise.reject(error));
    }
    const currentBytes = await currentBytesPromise;
    const lineBytes = Buffer.byteLength(line, "utf8") + 1;
    if (currentBytes + lineBytes > maxBytes) {
      const error = new Error(`Cost telemetry reached its ${maxBytes}-byte retention cap.`);
      error.code = "TELEMETRY_CAP_REACHED";
      throw error;
    }
    await appendFile(outputPath, `${line}\n`, { encoding: "utf8", mode: 0o600 });
    currentBytesPromise = Promise.resolve(currentBytes + lineBytes);
  };
}

function createQueuedWriter(writeLine, requestedLimit) {
  const pending = [];
  const limit = Math.max(10, Math.min(10_000, Math.round(Number(requestedLimit) || 1_000)));
  let activeDrain = null;
  let warningShown = false;

  function enqueue(line) {
    if (pending.length >= limit) {
      warnOnce("QUEUE_FULL");
      return;
    }
    pending.push(line);
    if (!activeDrain) activeDrain = drain();
  }

  async function drain() {
    while (pending.length) {
      const line = pending.shift();
      try {
        await writeLine(line);
      } catch (error) {
        warnOnce(error?.code || "WRITE_FAILED");
      }
    }
    activeDrain = null;
    if (pending.length) activeDrain = drain();
  }

  async function flush() {
    while (activeDrain) await activeDrain;
  }

  function warnOnce(code) {
    if (warningShown) return;
    warningShown = true;
    console.warn(`Cost telemetry could not be written: ${String(code || "WRITE_FAILED").slice(0, 40)}`);
  }

  return { enqueue, flush };
}

function normalizeMaxBytes(value) {
  const bytes = Number(value);
  return Number.isFinite(bytes)
    ? Math.max(1024 * 1024, Math.min(1024 * 1024 * 1024, Math.round(bytes)))
    : 50 * 1024 * 1024;
}

module.exports = {
  createCostTelemetry,
  estimateInputSize,
  extractProviderUsage,
  getSizeBucket
};
