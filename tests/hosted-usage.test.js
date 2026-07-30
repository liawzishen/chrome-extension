const test = require("node:test");
const assert = require("node:assert/strict");
const { createHash } = require("node:crypto");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const { MemoryHostedStore } = require("../services/hosted-api/src/adapters/memory-store.js");
const { HostedGenerationGateway } = require("../services/hosted-api/src/domain/generation-gateway.js");
const { ACTIONS } = require("../services/hosted-api/src/domain/policy.js");
const { UsageService } = require("../services/hosted-api/src/domain/usage-service.js");

const MIGRATION = readFileSync(
  path.resolve(__dirname, "../services/hosted-api/migrations/001_initial.sql"),
  "utf8"
);

async function createFixture(overrides = {}) {
  let now = Date.parse("2026-07-28T12:00:00.000Z");
  const store = new MemoryHostedStore();
  const account = await store.createAccount({
    id: "account_test",
    email: "student@example.test",
    emailVerified: true,
    createdAt: now
  });
  const usageService = new UsageService({
    store,
    now: () => now,
    reservationTtlMs: 60_000,
    ...overrides
  });
  return {
    account,
    store,
    usageService,
    setNow(value) {
      now = Date.parse(value);
    }
  };
}

// Counts how many reservation records a read walks over, so the tests can assert that
// usage counting stays proportional to live work instead of total service history.
class CountingReservationMap extends Map {
  constructor(entries) {
    super(entries);
    this.visited = 0;
  }

  reset() {
    this.visited = 0;
  }

  values() {
    const iterator = super.values();
    const owner = this;
    return {
      next() {
        const step = iterator.next();
        if (!step.done) owner.visited += 1;
        return step;
      },
      [Symbol.iterator]() {
        return this;
      }
    };
  }

  [Symbol.iterator]() {
    const iterator = super[Symbol.iterator]();
    const owner = this;
    return {
      next() {
        const step = iterator.next();
        if (!step.done) owner.visited += 1;
        return step;
      },
      [Symbol.iterator]() {
        return this;
      }
    };
  }
}

function reservationInput(accountId, key, items) {
  return {
    accountId,
    idempotencyKey: `usage-test-key-${key}`,
    requestFingerprint: fingerprint(`request:${key}`),
    items
  };
}

function fingerprint(value) {
  return createHash("sha256").update(String(value)).digest("hex");
}

test("Free study builds commit up to the policy limit and then fail closed", async () => {
  const fixture = await createFixture();
  for (let index = 0; index < 3; index += 1) {
    const reservation = await fixture.usageService.reserve(reservationInput(
      fixture.account.id,
      `study-${index}`,
      [{ action: ACTIONS.STUDY_BUILD, units: 1 }]
    ));
    await fixture.usageService.commit(reservation.id);
  }
  await assert.rejects(
    fixture.usageService.reserve(reservationInput(
      fixture.account.id,
      "study-exhausted",
      [{ action: ACTIONS.STUDY_BUILD, units: 1 }]
    )),
    (error) => error.code === "ALLOWANCE_EXHAUSTED" &&
      error.statusCode === 402 &&
      error.details.remaining === 0
  );
});

test("released and expired work does not consume allowance", async () => {
  const fixture = await createFixture();
  const released = await fixture.usageService.reserve(reservationInput(
    fixture.account.id,
    "release-one",
    [{ action: ACTIONS.JOURNEY_SUMMARY, units: 1 }]
  ));
  await fixture.usageService.release(released.id, "PROVIDER_FAILED");

  const expired = await fixture.usageService.reserve(reservationInput(
    fixture.account.id,
    "expire-one",
    [{ action: ACTIONS.JOURNEY_SUMMARY, units: 1 }]
  ));
  fixture.setNow("2026-07-28T12:02:00.000Z");
  await assert.rejects(
    fixture.usageService.commit(expired.id),
    (error) => error.code === "RESERVATION_EXPIRED"
  );
  assert.equal(fixture.store.state.reservations.get(expired.id).state, "expired");

  const usage = await fixture.usageService.getUsage(fixture.account.id);
  const journey = usage.allowances.find((item) => item.action === ACTIONS.JOURNEY_SUMMARY);
  assert.equal(journey.committed, 0);
  assert.equal(journey.reserved, 0);
  assert.equal(journey.remaining, 1);
});

test("idempotency replays the same reservation and rejects changed work", async () => {
  const fixture = await createFixture();
  const input = reservationInput(
    fixture.account.id,
    "idempotent-one",
    [{ action: ACTIONS.QUIZ_BUILD, units: 1 }]
  );
  const first = await fixture.usageService.reserve(input);
  const replay = await fixture.usageService.reserve(input);
  assert.equal(replay.id, first.id);
  assert.equal(replay.idempotentReplay, true);
  await assert.rejects(
    fixture.usageService.reserve({
      ...input,
      items: [{ action: ACTIONS.STUDY_BUILD, units: 1 }]
    }),
    (error) => error.code === "IDEMPOTENCY_CONFLICT"
  );
  await assert.rejects(
    fixture.usageService.reserve({
      ...input,
      requestFingerprint: fingerprint("different-content-same-units")
    }),
    (error) => error.code === "IDEMPOTENCY_CONFLICT"
  );
});

test("concurrent requests cannot both reserve the final allowance unit", async () => {
  const fixture = await createFixture();
  const attempts = await Promise.allSettled([
    fixture.usageService.reserve(reservationInput(
      fixture.account.id,
      "concurrent-left",
      [{ action: ACTIONS.JOURNEY_SUMMARY, units: 1 }]
    )),
    fixture.usageService.reserve(reservationInput(
      fixture.account.id,
      "concurrent-right",
      [{ action: ACTIONS.JOURNEY_SUMMARY, units: 1 }]
    ))
  ]);
  assert.equal(attempts.filter((item) => item.status === "fulfilled").length, 1);
  assert.equal(attempts.filter((item) => item.status === "rejected").length, 1);
  assert.equal(
    attempts.find((item) => item.status === "rejected").reason.code,
    "ALLOWANCE_EXHAUSTED"
  );
});

test("composite study-session accounting is atomic across study and quiz limits", async () => {
  const fixture = await createFixture();
  for (let index = 0; index < 5; index += 1) {
    const reservation = await fixture.usageService.reserve(reservationInput(
      fixture.account.id,
      `quiz-${index}`,
      [{ action: ACTIONS.QUIZ_BUILD, units: 1 }]
    ));
    await fixture.usageService.commit(reservation.id);
  }

  await assert.rejects(
    fixture.usageService.reserve(reservationInput(
      fixture.account.id,
      "study-session",
      [
        { action: ACTIONS.STUDY_BUILD, units: 1 },
        { action: ACTIONS.QUIZ_BUILD, units: 1 }
      ]
    )),
    (error) => error.code === "ALLOWANCE_EXHAUSTED"
  );
  const usage = await fixture.usageService.getUsage(fixture.account.id);
  const study = usage.allowances.find((item) => item.action === ACTIONS.STUDY_BUILD);
  assert.equal(study.reserved, 0);
  assert.equal(study.committed, 0);
  assert.equal(study.remaining, 3);
});

test("video usage is metered in exact successful milliseconds", async () => {
  const fixture = await createFixture();
  const preview = await fixture.usageService.reserve(reservationInput(
    fixture.account.id,
    "video-preview",
    [{ action: ACTIONS.VIDEO_PROCESSING, units: 15 * 60 * 1000 }]
  ));
  await fixture.usageService.commit(preview.id);
  await assert.rejects(
    fixture.usageService.reserve(reservationInput(
      fixture.account.id,
      "video-over-limit",
      [{ action: ACTIONS.VIDEO_PROCESSING, units: 1 }]
    )),
    (error) => error.code === "ALLOWANCE_EXHAUSTED"
  );
});

test("action and batch allowances accept exactly one unit while video accepts milliseconds", async () => {
  const fixture = await createFixture();
  const nonVideoActions = Object.values(ACTIONS)
    .filter((action) => action !== ACTIONS.VIDEO_PROCESSING);
  for (const [index, action] of nonVideoActions.entries()) {
    await assert.rejects(
      fixture.usageService.reserve(reservationInput(
        fixture.account.id,
        `invalid-units-${index}`,
        [{ action, units: 2 }]
      )),
      (error) => error.code === "INVALID_USAGE_UNITS"
    );
  }
  await assert.rejects(
    fixture.usageService.reserve(reservationInput(
      fixture.account.id,
      "duplicate-action-units",
      [
        { action: ACTIONS.STUDY_BUILD, units: 1 },
        { action: ACTIONS.STUDY_BUILD, units: 1 }
      ]
    )),
    (error) => error.code === "INVALID_USAGE_UNITS"
  );

  const video = await fixture.usageService.reserve(reservationInput(
    fixture.account.id,
    "valid-video-units",
    [{ action: ACTIONS.VIDEO_PROCESSING, units: 1_234 }]
  ));
  await fixture.usageService.commit(video.id);
  const usage = await fixture.usageService.getUsage(fixture.account.id);
  assert.equal(
    usage.allowances.find((item) => item.action === ACTIONS.VIDEO_PROCESSING).committed,
    1_234
  );
});

test("the PostgreSQL usage contract enforces unit semantics and opaque result references", () => {
  assert.match(
    MIGRATION,
    /CONSTRAINT usage_operation_items_metering_units_check\s+CHECK \(action = 'video_processing' OR units = 1\)/
  );
  assert.match(
    MIGRATION,
    /result_reference varchar\(255\)[\s\S]*?state = 'committed'[\s\S]*?result_reference IS NOT NULL/
  );
});

test("Student Pro multi-source lessons consume the shared study-build allowance", async () => {
  const fixture = await createFixture();
  await fixture.store.transaction((state) => {
    state.subscriptions.set(fixture.account.id, {
      status: "active",
      effectiveStartAt: "2026-07-01T00:00:00.000Z",
      allowanceAnchorAt: "2026-07-01T00:00:00.000Z",
      currentPeriodEnd: "2026-08-01T00:00:00.000Z"
    });
  });

  const multiSource = await fixture.usageService.reserve(reservationInput(
    fixture.account.id,
    "pro-multi-source",
    [{ action: ACTIONS.MULTI_SOURCE_PREVIEW, units: 1 }]
  ));
  assert.equal(multiSource.items[0].action, ACTIONS.MULTI_SOURCE_PREVIEW);
  assert.equal(multiSource.items[0].bucketAction, ACTIONS.STUDY_BUILD);
  await fixture.usageService.commit(multiSource.id);

  const study = await fixture.usageService.reserve(reservationInput(
    fixture.account.id,
    "pro-study-build",
    [{ action: ACTIONS.STUDY_BUILD, units: 1 }]
  ));
  await fixture.usageService.commit(study.id);

  const usage = await fixture.usageService.getUsage(fixture.account.id);
  const studyAllowance = usage.allowances.find((item) => item.action === ACTIONS.STUDY_BUILD);
  const multiSourceAllowance = usage.allowances.find(
    (item) => item.action === ACTIONS.MULTI_SOURCE_PREVIEW
  );
  assert.equal(studyAllowance.committed, 2);
  assert.equal(studyAllowance.remaining, 28);
  assert.equal(multiSourceAllowance.committed, 2);
  assert.equal(multiSourceAllowance.remaining, 28);
  assert.equal(multiSourceAllowance.sharedWith, ACTIONS.STUDY_BUILD);
});

test("Free keeps one lifetime multi-source preview separate from monthly study builds", async () => {
  const fixture = await createFixture();
  const preview = await fixture.usageService.reserve(reservationInput(
    fixture.account.id,
    "free-multi-source-preview",
    [{ action: ACTIONS.MULTI_SOURCE_PREVIEW, units: 1 }]
  ));
  await fixture.usageService.commit(preview.id);

  fixture.setNow("2026-09-01T00:00:00.000Z");
  await assert.rejects(
    fixture.usageService.reserve(reservationInput(
      fixture.account.id,
      "free-multi-source-second",
      [{ action: ACTIONS.MULTI_SOURCE_PREVIEW, units: 1 }]
    )),
    (error) => error.code === "ALLOWANCE_EXHAUSTED"
  );
  const usage = await fixture.usageService.getUsage(fixture.account.id);
  const study = usage.allowances.find((item) => item.action === ACTIONS.STUDY_BUILD);
  const multiSource = usage.allowances.find(
    (item) => item.action === ACTIONS.MULTI_SOURCE_PREVIEW
  );
  assert.equal(study.committed, 0);
  assert.equal(study.remaining, 3);
  assert.equal(multiSource.committed, 1);
  assert.equal(multiSource.remaining, 0);
  assert.equal(multiSource.period.kind, "lifetime");
  assert.equal("sharedWith" in multiSource, false);
});

test("a reservation cannot overdraw the Pro study bucket through its multi-source alias", async () => {
  const fixture = await createFixture();
  await fixture.store.transaction((state) => {
    state.subscriptions.set(fixture.account.id, {
      status: "active",
      effectiveStartAt: "2026-07-01T00:00:00.000Z",
      allowanceAnchorAt: "2026-07-01T00:00:00.000Z",
      currentPeriodEnd: "2026-08-01T00:00:00.000Z"
    });
  });
  for (let index = 0; index < 29; index += 1) {
    const reservation = await fixture.usageService.reserve(reservationInput(
      fixture.account.id,
      `shared-bucket-seed-${index}`,
      [{ action: ACTIONS.STUDY_BUILD, units: 1 }]
    ));
    await fixture.usageService.commit(reservation.id);
  }

  await assert.rejects(
    fixture.usageService.reserve(reservationInput(
      fixture.account.id,
      "shared-bucket-overdraw",
      [
        { action: ACTIONS.STUDY_BUILD, units: 1 },
        { action: ACTIONS.MULTI_SOURCE_PREVIEW, units: 1 }
      ]
    )),
    (error) => error.code === "ALLOWANCE_EXHAUSTED"
  );
  const usage = await fixture.usageService.getUsage(fixture.account.id);
  assert.equal(
    usage.allowances.find((item) => item.action === ACTIONS.STUDY_BUILD).committed,
    29
  );
  assert.equal(fixture.store.state.activeReservations.size, 0);
});

test("generation gateway commits only success and releases provider failures", async () => {
  const fixture = await createFixture();
  const gateway = new HostedGenerationGateway({ usageService: fixture.usageService });
  const success = await gateway.execute({
    accountId: fixture.account.id,
    idempotencyKey: "gateway-success-key",
    requestFingerprint: fingerprint("gateway-success-request"),
    items: [{ action: ACTIONS.STUDY_BUILD, units: 1 }],
    run: async () => ({ artifactId: "artifact_123" }),
    validateResult: async (result) => result
  });
  assert.equal(success.reservation.state, "committed");
  assert.deepEqual(success.result, { artifactId: "artifact_123" });

  await assert.rejects(
    gateway.execute({
      accountId: fixture.account.id,
      idempotencyKey: "gateway-failure-key",
      requestFingerprint: fingerprint("gateway-failure-request"),
      items: [{ action: ACTIONS.STUDY_BUILD, units: 1 }],
      run: async () => {
        const error = new Error("provider unavailable");
        error.code = "PROVIDER_UNAVAILABLE";
        throw error;
      },
      validateResult: async (result) => result
    }),
    /provider unavailable/
  );
  await assert.rejects(
    gateway.execute({
      accountId: fixture.account.id,
      idempotencyKey: "gateway-invalid-result",
      requestFingerprint: fingerprint("gateway-invalid-result-request"),
      items: [{ action: ACTIONS.STUDY_BUILD, units: 1 }],
      run: async () => ({ malformed: true }),
      validateResult: async () => {
        const error = new Error("result schema rejected");
        error.code = "RESULT_SCHEMA_INVALID";
        throw error;
      }
    }),
    /result schema rejected/
  );
  const usage = await fixture.usageService.getUsage(fixture.account.id);
  const study = usage.allowances.find((item) => item.action === ACTIONS.STUDY_BUILD);
  assert.equal(study.committed, 1);
  assert.equal(study.reserved, 0);
  assert.equal(study.remaining, 2);
});

test("generation idempotency never repeats provider work and can replay a stored result", async () => {
  const fixture = await createFixture();
  const gateway = new HostedGenerationGateway({ usageService: fixture.usageService });
  let providerCalls = 0;
  const input = {
    accountId: fixture.account.id,
    idempotencyKey: "gateway-idempotent-key",
    requestFingerprint: fingerprint("gateway-idempotent-request"),
    items: [{ action: ACTIONS.QUIZ_BUILD, units: 1 }],
    run: async () => {
      providerCalls += 1;
      return { artifactId: "quiz_123" };
    },
    validateResult: async (result) => result
  };
  await gateway.execute(input);

  await assert.rejects(
    gateway.execute(input),
    (error) => error.code === "IDEMPOTENT_RESULT_UNAVAILABLE"
  );
  assert.equal(providerCalls, 1);

  const replay = await gateway.execute({
    ...input,
    loadCommittedResult: async () => ({ artifactId: "quiz_123" })
  });
  assert.equal(replay.idempotentReplay, true);
  assert.deepEqual(replay.result, { artifactId: "quiz_123" });
  assert.equal(providerCalls, 1);
});

test("a committed tombstone replays its opaque result reference after detail pruning", async () => {
  const fixture = await createFixture({ finalizedRetentionMs: 60 * 60_000 });
  const gateway = new HostedGenerationGateway({ usageService: fixture.usageService });
  let providerCalls = 0;
  const input = {
    accountId: fixture.account.id,
    idempotencyKey: "gateway-tombstone-replay",
    requestFingerprint: fingerprint("gateway-tombstone-request"),
    items: [{ action: ACTIONS.QUIZ_BUILD, units: 1 }],
    resultReference: "artifact_quiz_tombstone_123",
    run: async () => {
      providerCalls += 1;
      return { artifactId: "quiz_tombstone_123" };
    },
    validateResult: async (result) => result
  };
  await gateway.execute(input);
  fixture.setNow("2026-07-28T14:00:00.000Z");
  await fixture.usageService.getUsage(fixture.account.id);
  assert.equal(fixture.store.state.reservations.size, 0);

  let loadedReference = "";
  const replay = await gateway.execute({
    ...input,
    loadCommittedResult: async (resultReference) => {
      loadedReference = resultReference;
      return { artifactId: "quiz_tombstone_123" };
    }
  });
  assert.equal(replay.idempotentReplay, true);
  assert.equal(loadedReference, "artifact_quiz_tombstone_123");
  assert.equal(providerCalls, 1);
});

test("a released reservation lets the same idempotency key reserve fresh work", async () => {
  const fixture = await createFixture();
  const input = reservationInput(
    fixture.account.id,
    "retry-after-release",
    [{ action: ACTIONS.STUDY_BUILD, units: 1 }]
  );
  const first = await fixture.usageService.reserve(input);
  await fixture.usageService.release(first.id, "PROVIDER_FAILED");

  const retry = await fixture.usageService.reserve(input);
  assert.equal(retry.idempotentReplay, false);
  assert.notEqual(retry.id, first.id);
  assert.equal(retry.state, "reserved");

  const committed = await fixture.usageService.commit(retry.id);
  assert.equal(committed.state, "committed");

  const usage = await fixture.usageService.getUsage(fixture.account.id);
  const study = usage.allowances.find((item) => item.action === ACTIONS.STUDY_BUILD);
  assert.equal(study.committed, 1);
  assert.equal(study.reserved, 0);

  await assert.rejects(
    fixture.usageService.reserve({
      ...input,
      items: [{ action: ACTIONS.QUIZ_BUILD, units: 1 }]
    }),
    (error) => error.code === "IDEMPOTENCY_CONFLICT"
  );
});

test("an expired reservation lets the same idempotency key reserve fresh work", async () => {
  const fixture = await createFixture();
  const input = reservationInput(
    fixture.account.id,
    "retry-after-expiry",
    [{ action: ACTIONS.JOURNEY_SUMMARY, units: 1 }]
  );
  const first = await fixture.usageService.reserve(input);
  fixture.setNow("2026-07-28T12:05:00.000Z");

  const retry = await fixture.usageService.reserve(input);
  assert.equal(retry.idempotentReplay, false);
  assert.notEqual(retry.id, first.id);
  assert.equal(fixture.store.state.reservations.get(first.id).state, "expired");

  const committed = await fixture.usageService.commit(retry.id);
  assert.equal(committed.state, "committed");
});

test("the generation gateway retries a failed request under the same idempotency key", async () => {
  const fixture = await createFixture();
  const gateway = new HostedGenerationGateway({ usageService: fixture.usageService });
  let providerCalls = 0;
  const input = {
    accountId: fixture.account.id,
    idempotencyKey: "gateway-retry-after-failure",
    requestFingerprint: fingerprint("gateway-retry-request"),
    items: [{ action: ACTIONS.STUDY_BUILD, units: 1 }],
    run: async () => {
      providerCalls += 1;
      if (providerCalls === 1) {
        const error = new Error("provider unavailable");
        error.code = "PROVIDER_UNAVAILABLE";
        throw error;
      }
      return { artifactId: "study_retry" };
    },
    validateResult: async (result) => result
  };

  await assert.rejects(gateway.execute(input), /provider unavailable/);
  const retry = await gateway.execute(input);
  assert.equal(providerCalls, 2);
  assert.deepEqual(retry.result, { artifactId: "study_retry" });
  assert.equal(retry.reservation.state, "committed");

  const study = retry.usage.allowances.find((item) => item.action === ACTIONS.STUDY_BUILD);
  assert.equal(study.committed, 1);
  assert.equal(study.reserved, 0);
  assert.equal(study.remaining, 2);
});

test("pruning detailed reservations retains committed idempotency authority", async () => {
  const fixture = await createFixture({ finalizedRetentionMs: 60 * 60_000 });
  for (let index = 0; index < 60; index += 1) {
    const reservation = await fixture.usageService.reserve(reservationInput(
      fixture.account.id,
      `evict-${index}`,
      [{ action: ACTIONS.VIDEO_PROCESSING, units: 1000 }]
    ));
    await fixture.usageService.commit(reservation.id);
  }
  assert.equal(fixture.store.state.reservations.size, 60);

  fixture.setNow("2026-07-28T14:00:00.000Z");
  const usage = await fixture.usageService.getUsage(fixture.account.id);
  const video = usage.allowances.find((item) => item.action === ACTIONS.VIDEO_PROCESSING);
  assert.equal(video.committed, 60_000);
  assert.equal(video.remaining, 15 * 60 * 1000 - 60_000);
  assert.equal(fixture.store.state.reservations.size, 0);
  assert.equal(fixture.store.state.idempotency.size, 0);
  assert.equal(fixture.store.state.committedIdempotency.size, 60);

  const replay = await fixture.usageService.reserve(reservationInput(
    fixture.account.id,
    "evict-0",
    [{ action: ACTIONS.VIDEO_PROCESSING, units: 1000 }]
  ));
  assert.equal(replay.idempotentReplay, true);
  assert.equal(replay.state, "committed");
  assert.equal(replay.tombstone, true);
  assert.equal(replay.resultReference, replay.id);
  assert.equal(
    (await fixture.usageService.getUsage(fixture.account.id)).allowances
      .find((item) => item.action === ACTIONS.VIDEO_PROCESSING).committed,
    60_000
  );
  await assert.rejects(
    fixture.usageService.reserve(reservationInput(
      fixture.account.id,
      "evict-0",
      [{ action: ACTIONS.VIDEO_PROCESSING, units: 1001 }]
    )),
    (error) => error.code === "IDEMPOTENCY_CONFLICT"
  );

  await assert.rejects(
    fixture.usageService.reserve(reservationInput(
      fixture.account.id,
      "evict-over-limit",
      [{ action: ACTIONS.VIDEO_PROCESSING, units: 15 * 60 * 1000 - 60_000 + 1 }]
    )),
    (error) => error.code === "ALLOWANCE_EXHAUSTED"
  );
});

test("usage counting does not walk the whole reservation history", async () => {
  const fixture = await createFixture();
  const other = await fixture.store.createAccount({
    id: "account_other",
    email: "other@example.test",
    emailVerified: true,
    createdAt: Date.parse("2026-07-28T12:00:00.000Z")
  });
  for (let index = 0; index < 40; index += 1) {
    const reservation = await fixture.usageService.reserve(reservationInput(
      fixture.account.id,
      `history-${index}`,
      [{ action: ACTIONS.VIDEO_PROCESSING, units: 1000 }]
    ));
    await fixture.usageService.commit(reservation.id);
  }

  const counting = new CountingReservationMap(fixture.store.state.reservations);
  fixture.store.state.reservations = counting;
  counting.reset();
  const usage = await fixture.usageService.getUsage(other.id);
  assert.equal(usage.allowances.length, 7);
  assert.ok(
    counting.visited <= 8,
    `getUsage walked ${counting.visited} reservation records for an unrelated account`
  );
});
