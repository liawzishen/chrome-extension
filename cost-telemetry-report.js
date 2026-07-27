function summarizeCostTelemetry(events) {
  const validEvents = Array.isArray(events)
    ? events.filter((event) => event?.schemaVersion === 1 && typeof event.action === "string")
    : [];
  const actions = new Map();
  const operations = new Map();

  for (const event of validEvents) {
    const action = getAggregate(actions, event.action);
    action.actions += 1;
    action.successes += event.outcome === "succeeded" ? 1 : 0;
    action.failures += event.outcome === "failed" ? 1 : 0;
    action.providerCalls += boundedNumber(event.providerCalls);
    action.providerRetries += boundedNumber(event.providerRetries);
    action.transportFailures += boundedNumber(event.transportFailures);
    action.transportRetries += boundedNumber(event.transportRetries);
    action.validationRejections += boundedNumber(event.validationRejections);
    action.validationRetries += boundedNumber(event.validationRetries);
    action.inputTokens += boundedNumber(event.inputTokens);
    action.outputTokens += boundedNumber(event.outputTokens);
    action.estimatedCostUsd += boundedNumber(event.estimatedCostUsd);
    action.mediaDurationMs += boundedNumber(event.mediaDurationMs);
    action.incompleteCostEvents += event.costStatus === "incomplete" ? 1 : 0;
    action.latencies.push(boundedNumber(event.latencyMs));

    for (const usage of Array.isArray(event.providerUsage) ? event.providerUsage : []) {
      const key = [
        normalizeLabel(usage?.provider),
        normalizeLabel(usage?.model),
        normalizeLabel(usage?.operation)
      ].join(":");
      const operation = getAggregate(operations, key);
      operation.provider = normalizeLabel(usage?.provider);
      operation.model = normalizeLabel(usage?.model);
      operation.operation = normalizeLabel(usage?.operation);
      operation.providerCalls += boundedNumber(usage?.calls);
      operation.providerRetries += boundedNumber(usage?.retries);
      operation.transportFailures += boundedNumber(usage?.transportFailures);
      operation.transportRetries += boundedNumber(usage?.transportRetries);
      operation.validationRejections += boundedNumber(usage?.validationRejections);
      operation.validationRetries += boundedNumber(usage?.validationRetries);
      operation.inputTokens += boundedNumber(usage?.inputTokens);
      operation.outputTokens += boundedNumber(usage?.outputTokens);
      operation.estimatedCostUsd += boundedNumber(usage?.estimatedCostUsd);
      operation.incompleteCostEvents += usage?.costStatus === "incomplete" ? 1 : 0;
    }
  }

  return {
    schemaVersion: 1,
    eventCount: validEvents.length,
    actions: [...actions.entries()]
      .map(([action, totals]) => ({
        action,
        actions: totals.actions,
        successes: totals.successes,
        failures: totals.failures,
        successRate: round(totals.actions ? totals.successes / totals.actions : 0, 4),
        providerCalls: totals.providerCalls,
        providerRetries: totals.providerRetries,
        transportFailures: totals.transportFailures,
        transportRetries: totals.transportRetries,
        validationRejections: totals.validationRejections,
        validationRetries: totals.validationRetries,
        inputTokens: totals.inputTokens,
        outputTokens: totals.outputTokens,
        estimatedCostUsd: round(totals.estimatedCostUsd, 6),
        costStatus: totals.incompleteCostEvents ? "incomplete"
          : totals.providerCalls ? "configured" : "not_applicable",
        mediaMinutes: round(totals.mediaDurationMs / 60_000, 3),
        latencyP50Ms: percentile(totals.latencies, 0.5),
        latencyP95Ms: percentile(totals.latencies, 0.95)
      }))
      .sort((left, right) => left.action.localeCompare(right.action)),
    providerOperations: [...operations.values()]
      .map((totals) => ({
        provider: totals.provider,
        model: totals.model,
        operation: totals.operation,
        calls: totals.providerCalls,
        retries: totals.providerRetries,
        transportFailures: totals.transportFailures,
        transportRetries: totals.transportRetries,
        validationRejections: totals.validationRejections,
        validationRetries: totals.validationRetries,
        inputTokens: totals.inputTokens,
        outputTokens: totals.outputTokens,
        estimatedCostUsd: round(totals.estimatedCostUsd, 6),
        costStatus: totals.incompleteCostEvents ? "incomplete" : "configured"
      }))
      .sort((left, right) => left.operation.localeCompare(right.operation))
  };
}

function parseCostTelemetryJsonl(value) {
  const events = [];
  let invalidLineCount = 0;
  String(value || "").split(/\r?\n/).forEach((line) => {
    if (!line.trim()) return;
    try {
      events.push(JSON.parse(line));
    } catch {
      invalidLineCount += 1;
    }
  });
  return { events, invalidLineCount };
}

function getAggregate(collection, key) {
  if (!collection.has(key)) {
    collection.set(key, {
      actions: 0,
      successes: 0,
      failures: 0,
      providerCalls: 0,
      providerRetries: 0,
      transportFailures: 0,
      transportRetries: 0,
      validationRejections: 0,
      validationRetries: 0,
      inputTokens: 0,
      outputTokens: 0,
      estimatedCostUsd: 0,
      mediaDurationMs: 0,
      incompleteCostEvents: 0,
      latencies: []
    });
  }
  return collection.get(key);
}

function percentile(values, fraction) {
  if (!values.length) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.max(0, Math.ceil(fraction * sorted.length) - 1);
  return sorted[index];
}

function boundedNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function normalizeLabel(value) {
  return String(value || "unknown")
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "_")
    .slice(0, 100) || "unknown";
}

function round(value, places) {
  const factor = 10 ** places;
  return Math.round((Number(value) || 0) * factor) / factor;
}

module.exports = { parseCostTelemetryJsonl, summarizeCostTelemetry };
