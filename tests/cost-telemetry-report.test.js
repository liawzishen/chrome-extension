const test = require("node:test");
const assert = require("node:assert/strict");
const {
  parseCostTelemetryJsonl,
  summarizeCostTelemetry
} = require("../cost-telemetry-report.js");

test("cost report aggregates action percentiles and provider operations without event content", () => {
  const report = summarizeCostTelemetry([
    makeEvent({ latencyMs: 10, estimatedCostUsd: 0.001 }),
    makeEvent({ latencyMs: 30, outcome: "failed", estimatedCostUsd: 0.002 }),
    makeEvent({ latencyMs: 20, estimatedCostUsd: 0.003 })
  ]);

  assert.equal(report.eventCount, 3);
  assert.deepEqual(report.actions, [{
    action: "study_build",
    actions: 3,
    successes: 2,
    failures: 1,
    successRate: 0.6667,
    providerCalls: 3,
    providerRetries: 0,
    transportFailures: 0,
    transportRetries: 0,
    validationRejections: 0,
    validationRetries: 0,
    inputTokens: 30,
    outputTokens: 15,
    estimatedCostUsd: 0.006,
    costPerActionP50Usd: 0.002,
    costPerActionP90Usd: 0.003,
    costPerActionP95Usd: 0.003,
    costStatus: "configured",
    mediaMinutes: 0,
    latencyP50Ms: 20,
    latencyP90Ms: 30,
    latencyP95Ms: 30
  }]);
  assert.equal(report.sourceSizeBuckets.length, 1);
  assert.equal(report.sourceSizeBuckets[0].sourceType, "notes");
  assert.equal(report.sourceSizeBuckets[0].inputSizeBucket, "small");
  assert.equal(report.sourceSizeBuckets[0].costPerActionP95Usd, 0.003);
  assert.equal(report.providerOperations[0].operation, "notes_generation");
  assert.equal(report.providerOperations[0].calls, 3);
  assert.equal(report.providerOperations[0].costPerCallP90Usd, 0.001);
  assert.equal(Object.hasOwn(report, "eventId"), false);
});

test("JSONL parser tolerates a partial final line and reports it", () => {
  const { events, invalidLineCount } = parseCostTelemetryJsonl(
    `${JSON.stringify(makeEvent({}))}\n{"partial":`
  );
  assert.equal(events.length, 1);
  assert.equal(invalidLineCount, 1);
});

function makeEvent(overrides) {
  const event = {
    schemaVersion: 1,
    action: "study_build",
    sourceType: "notes",
    inputSizeBucket: "small",
    outcome: "succeeded",
    latencyMs: 10,
    providerCalls: 1,
    providerRetries: 0,
    transportFailures: 0,
    transportRetries: 0,
    validationRejections: 0,
    validationRetries: 0,
    inputTokens: 10,
    outputTokens: 5,
    estimatedCostUsd: 0.001,
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
      inputTokens: 10,
      outputTokens: 5,
      estimatedCostUsd: 0.001,
      costStatus: "configured"
    }]
  };
  return { ...event, ...overrides };
}
