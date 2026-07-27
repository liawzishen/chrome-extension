const test = require("node:test");
const assert = require("node:assert/strict");
const { createHash } = require("node:crypto");
const { MemoryHostedStore } = require("../services/hosted-api/src/adapters/memory-store.js");
const { HostedGenerationGateway } = require("../services/hosted-api/src/domain/generation-gateway.js");
const { ACTIONS } = require("../services/hosted-api/src/domain/policy.js");
const { UsageService } = require("../services/hosted-api/src/domain/usage-service.js");

async function createFixture() {
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
    reservationTtlMs: 60_000
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
      items: [{ action: ACTIONS.QUIZ_BUILD, units: 2 }]
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

test("generation gateway commits only success and releases provider failures", async () => {
  const fixture = await createFixture();
  const gateway = new HostedGenerationGateway({ usageService: fixture.usageService });
  const success = await gateway.execute({
    accountId: fixture.account.id,
    idempotencyKey: "gateway-success-key",
    requestFingerprint: fingerprint("gateway-success-request"),
    items: [{ action: ACTIONS.STUDY_BUILD, units: 1 }],
    run: async () => ({ artifactId: "artifact_123" })
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
      }
    }),
    /provider unavailable/
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
    }
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
