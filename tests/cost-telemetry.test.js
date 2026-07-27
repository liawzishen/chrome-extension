const test = require("node:test");
const assert = require("node:assert/strict");
const {
  createCostTelemetry,
  estimateInputSize,
  extractProviderUsage,
  getSizeBucket
} = require("../cost-telemetry.js");

test("cost telemetry emits a content-free successful action record", async () => {
  const lines = [];
  let clock = 1_000;
  const telemetry = createCostTelemetry({
    outputPath: "unused-in-test",
    writeLine: (line) => lines.push(line),
    now: () => clock,
    prices: {
      "openai.test-model:input": 2,
      "openai.test-model:output": 8
    }
  });
  const sourceText = "private study material that must never be logged";

  await telemetry.runAction("study_build", { sourceType: "notes", text: sourceText }, async () => {
    clock += 25;
    telemetry.recordProviderResult("openai", "test-model", "study_notes", {
      usage: { input_tokens: 100, output_tokens: 50 }
    });
    clock += 25;
    return { privateOutput: "also never logged" };
  });
  await telemetry.flush();

  assert.equal(lines.length, 1);
  assert.doesNotMatch(lines[0], /private study material|also never logged/);
  assert.deepEqual(JSON.parse(lines[0]), {
    schemaVersion: 1,
    eventId: JSON.parse(lines[0]).eventId,
    recordedAt: "1970-01-01T00:00:01.050Z",
    action: "study_build",
    sourceType: "notes",
    inputSizeBucket: "xs",
    outcome: "succeeded",
    resultCode: "OK",
    latencyMs: 50,
    providerCalls: 1,
    providerRetries: 0,
    transportFailures: 0,
    transportRetries: 0,
    validationRejections: 0,
    validationRetries: 0,
    inputTokens: 100,
    outputTokens: 50,
    estimatedCostUsd: 0.0006,
    costStatus: "configured",
    providerUsage: [{
      provider: "openai",
      model: "test-model",
      operation: "notes_generation",
      calls: 1,
      retries: 0,
      transportFailures: 0,
      transportRetries: 0,
      validationRejections: 0,
      validationRetries: 0,
      inputTokens: 100,
      outputTokens: 50,
      estimatedCostUsd: 0.0006,
      costStatus: "configured"
    }]
  });
});

test("cost telemetry records sanitized failures and never hides the original error", async () => {
  const lines = [];
  const telemetry = createCostTelemetry({
    outputPath: "unused-in-test",
    writeLine: (line) => lines.push(line)
  });
  const failure = Object.assign(new Error("secret response body"), { code: "provider unavailable!" });

  await assert.rejects(
    telemetry.runAction("quiz_build", { sourceType: "webpage", text: "private" }, async () => {
      telemetry.recordProviderFailure("gemini", "test-model", "quiz_only");
      throw failure;
    }),
    (error) => error === failure
  );
  await telemetry.flush();

  const event = JSON.parse(lines[0]);
  assert.equal(event.outcome, "failed");
  assert.equal(event.resultCode, "ACTION_FAILED");
  assert.equal(event.providerCalls, 1);
  assert.equal(event.providerRetries, 0);
  assert.doesNotMatch(lines[0], /secret response body|private/);
});

test("provider usage extraction and size bucketing are bounded and provider-neutral", () => {
  assert.deepEqual(extractProviderUsage("gemini", {
    usageMetadata: { promptTokenCount: 12, candidatesTokenCount: 7, thoughtsTokenCount: 3 }
  }), { inputTokens: 12, outputTokens: 10 });
  assert.equal(estimateInputSize({ rawText: "abc", files: [{ excerpt: "12345" }] }), 8);
  assert.equal(getSizeBucket(0), "none");
  assert.equal(getSizeBucket(4_001), "small");
  assert.equal(getSizeBucket(300_000), "xl");
});

test("provider breakdown counts transport and validation retries by bounded operation", async () => {
  const lines = [];
  const telemetry = createCostTelemetry({
    outputPath: "unused-in-test",
    writeLine: (line) => lines.push(line)
  });

  await telemetry.runAction("quiz_build", { rawText: "private" }, async () => {
    telemetry.recordProviderFailure("OpenAI", "test-model", "quiz_only", true);
    telemetry.recordProviderResult("OpenAI", "test-model", "quiz_only", {
      usage: { input_tokens: 20, output_tokens: 10 }
    });
    telemetry.recordValidationRejection("OpenAI", "test-model", "quiz_only", true);
    telemetry.recordProviderResult("OpenAI", "test-model", "quiz_only", {
      usage: { input_tokens: 18, output_tokens: 9 }
    });
    telemetry.recordProviderResult("OpenAI", "test-model", "quiz_grounding_verification", {
      usage: { input_tokens: 5, output_tokens: 2 }
    });
  });
  await telemetry.flush();

  const event = JSON.parse(lines[0]);
  assert.equal(event.providerCalls, 4);
  assert.equal(event.providerRetries, 2);
  assert.equal(event.transportFailures, 1);
  assert.equal(event.transportRetries, 1);
  assert.equal(event.validationRejections, 1);
  assert.equal(event.validationRetries, 1);
  assert.deepEqual(event.providerUsage.map(({ operation, calls, retries }) => ({
    operation,
    calls,
    retries
  })), [
    { operation: "quiz_generation", calls: 3, retries: 2 },
    { operation: "quiz_verification", calls: 1, retries: 0 }
  ]);
});

test("concurrent action telemetry keeps provider usage isolated", async () => {
  const lines = [];
  let releaseFirst;
  const firstCanFinish = new Promise((resolve) => {
    releaseFirst = resolve;
  });
  const telemetry = createCostTelemetry({
    outputPath: "unused-in-test",
    writeLine: (line) => lines.push(line)
  });

  const first = telemetry.runAction("study_build", { sourceType: "notes" }, async () => {
    telemetry.recordProviderResult("openai", "notes-model", "study_notes", {
      usage: { input_tokens: 11, output_tokens: 3 }
    });
    await firstCanFinish;
  });
  await telemetry.runAction("journey_summary", {}, async () => {
    telemetry.recordProviderResult("gemini", "summary-model", "journey_summary", {
      usageMetadata: { promptTokenCount: 7, candidatesTokenCount: 2 }
    });
  });
  releaseFirst();
  await first;
  await telemetry.flush();

  const events = lines.map(JSON.parse);
  const study = events.find((event) => event.action === "study_build");
  const summary = events.find((event) => event.action === "journey_summary");
  assert.deepEqual([study.inputTokens, study.outputTokens], [11, 3]);
  assert.deepEqual([summary.inputTokens, summary.outputTokens], [7, 2]);
  assert.equal(study.providerUsage[0].model, "notes-model");
  assert.equal(summary.providerUsage[0].model, "summary-model");
});

test("media telemetry exposes bounded duration and a one-way chunk job key", async () => {
  const lines = [];
  const telemetry = createCostTelemetry({
    outputPath: "unused-in-test",
    writeLine: (line) => lines.push(line)
  });

  await telemetry.runAction("transcript_chunk", {
    jobId: "private-random-job-id",
    chunk: { capturedDurationMs: 12_345, wavBase64: "private-audio" }
  }, async () => {});
  await telemetry.flush();

  const event = JSON.parse(lines[0]);
  assert.equal(event.mediaDurationMs, 12_345);
  assert.equal(event.mediaDurationBucket, "up_to_1m");
  assert.match(event.mediaJobKey, /^[a-f0-9]{16}$/);
  assert.doesNotMatch(lines[0], /private-random-job-id|private-audio/);
});

test("Gemini video cost is priced independently from the main provider", async () => {
  const lines = [];
  const telemetry = createCostTelemetry({
    outputPath: "unused-in-test",
    writeLine: (line) => lines.push(line),
    prices: {
      "openai.main-model:input": 2,
      "openai.main-model:output": 4,
      "gemini.video-model:input": 1,
      "gemini.video-model:output": 3
    }
  });

  await telemetry.runAction("video_transcript", { durationMs: 120_000 }, async () => {
    telemetry.recordProviderResult("gemini", "video-model", "video_transcript", {
      usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 50 }
    });
  });
  await telemetry.flush();

  const event = JSON.parse(lines[0]);
  assert.equal(event.costStatus, "configured");
  assert.equal(event.estimatedCostUsd, 0.00025);
  assert.equal(event.providerUsage[0].provider, "gemini");
  assert.equal(event.mediaDurationMs, 120_000);
});

test("telemetry write failures never fail the learner action and warn once", async () => {
  const warnings = [];
  const originalWarn = console.warn;
  console.warn = (message) => warnings.push(String(message));
  try {
    const telemetry = createCostTelemetry({
      outputPath: "unused-in-test",
      writeLine: async () => {
        const error = new Error("private filesystem detail");
        error.code = "EACCES";
        throw error;
      }
    });

    const result = await telemetry.runAction("study_build", {}, async () => "success");
    await telemetry.runAction("study_build", {}, async () => "also-success");
    await telemetry.flush();

    assert.equal(result, "success");
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /EACCES/);
    assert.doesNotMatch(warnings[0], /private filesystem detail/);
  } finally {
    console.warn = originalWarn;
  }
});
