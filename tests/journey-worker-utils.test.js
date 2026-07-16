const test = require("node:test");
const assert = require("node:assert/strict");

require("../journey-utils.js");
const Worker = require("../journey-worker-utils.js");
const Journey = globalThis.ExamCramJourney;

function operation(type, opId, expectedRevision, payload = {}) {
  return { type, opId, expectedRevision, payload };
}

function workerAttempt(index, overrides = {}) {
  return {
    attemptId: `worker-attempt-${String(index).padStart(3, "0")}`,
    quizId: "worker-quiz",
    questionId: `worker-question-${String(index).padStart(3, "0")}`,
    noteId: "worker-note",
    sourceFingerprint: "worker-source",
    primaryConceptId: "concept-light",
    relatedConceptIds: [],
    conceptLabel: "Light-dependent reactions",
    sourceRef: { sourceId: "source-photo", quote: "Light energy drives photosynthesis." },
    sourcePage: 1,
    correctAnswer: "Light energy",
    studentAnswer: "Light energy",
    result: "correct",
    answeredAt: new Date(Date.parse("2026-07-15T02:00:00Z") + index * 1000).toISOString(),
    attemptType: "normal",
    targetConceptId: "",
    ...overrides
  };
}

test("creates an empty chapter through the serialized Journey worker", () => {
  assert.equal(Worker.MESSAGE_TYPES.CREATE_CHAPTER, "JOURNEY_CREATE_CHAPTER");
  const initial = Journey.createJourney("Biology", "2026-07-14T00:00:00Z");
  const created = Worker.reduceJourneyOperation(initial, operation(
    Worker.MESSAGE_TYPES.CREATE_CHAPTER,
    "op:create:cells",
    initial.revision,
    { title: "Cell Transport" }
  ), "2026-07-14T01:00:00Z");

  assert.equal(created.result.created, true);
  assert.equal(created.result.duplicate, false);
  assert.match(created.result.chapterId, /^chapter-/);
  assert.equal(created.journey.revision, initial.revision + 1);
  assert.equal(created.journey.chapters.length, 1);
  assert.equal(created.journey.chapters[0].title, "Cell Transport");
  assert.deepEqual(created.journey.chapters[0].sources, []);
  assert.deepEqual(created.journey.chapters[0].sessions, []);
});

test("makes chapter creation idempotent and resolves duplicate names to the original stable ID", () => {
  const initial = Journey.createJourney("Biology", "2026-07-14T00:00:00Z");
  const request = operation(
    Worker.MESSAGE_TYPES.CREATE_CHAPTER,
    "op:create:stable",
    initial.revision,
    { title: "Cell Transport" }
  );
  const first = Worker.reduceJourneyOperation(initial, request, "2026-07-14T01:00:00Z");
  const retry = Worker.reduceJourneyOperation(first.journey, request, "2026-07-14T01:05:00Z");

  assert.equal(retry.duplicate, true, "replaying the same opId must not create another chapter");
  assert.equal(retry.changed, false);
  assert.equal(retry.result.chapterId, first.result.chapterId);
  assert.equal(retry.journey.chapters.length, 1);

  const sameName = Worker.reduceJourneyOperation(first.journey, operation(
    Worker.MESSAGE_TYPES.CREATE_CHAPTER,
    "op:create:same-name",
    first.journey.revision,
    { title: "  cell transport " }
  ), "2026-07-14T01:10:00Z");
  assert.equal(sameName.duplicate, false, "a new operation was processed normally");
  assert.equal(sameName.result.created, false);
  assert.equal(sameName.result.duplicate, true);
  assert.equal(sameName.result.chapterId, first.result.chapterId);
  assert.equal(sameName.journey.chapters.length, 1);
});

test("validates chapter creation and rejects stale create operations", () => {
  const initial = Journey.createJourney("Biology", "2026-07-14T00:00:00Z");
  assert.throws(() => Worker.reduceJourneyOperation(initial, operation(
    Worker.MESSAGE_TYPES.CREATE_CHAPTER,
    "op:create:blank",
    initial.revision,
    { title: "   " }
  )), (error) => error.code === "INVALID_CHAPTER");

  const first = Worker.reduceJourneyOperation(initial, operation(
    Worker.MESSAGE_TYPES.CREATE_CHAPTER,
    "op:create:first",
    initial.revision,
    { title: "First chapter" }
  ));
  assert.throws(() => Worker.reduceJourneyOperation(first.journey, operation(
    Worker.MESSAGE_TYPES.CREATE_CHAPTER,
    "op:create:stale",
    initial.revision,
    { title: "Stale chapter" }
  )), (error) => error.code === "REVISION_CONFLICT"
    && error.details.actualRevision === first.journey.revision);
});

test("applies serialized operations without losing earlier writes", () => {
  const initial = Journey.createJourney("Biology", "2026-07-11T00:00:00Z");
  const first = Worker.reduceJourneyOperation(initial, operation(
    Worker.MESSAGE_TYPES.ADD_SOURCE,
    "op:add-source-a",
    0,
    {
      chapterTitle: "Cells",
      source: {
        id: "source-a",
        title: "Membranes",
        url: "https://a.example/",
        text: "Membranes are selectively permeable.",
        fingerprint: "a"
      }
    }
  ), "2026-07-11T01:00:00Z");
  const second = Worker.reduceJourneyOperation(first.journey, operation(
    Worker.MESSAGE_TYPES.ADD_SOURCE,
    "op:add-source-b",
    first.journey.revision,
    {
      chapterId: first.result.chapterId,
      source: {
        id: "source-b",
        title: "Diffusion",
        url: "https://b.example/",
        text: "Particles diffuse down a gradient.",
        fingerprint: "b"
      }
    }
  ), "2026-07-11T02:00:00Z");

  assert.deepEqual(second.journey.chapters[0].sources.map((source) => source.id), ["source-a", "source-b"]);
  assert.equal(second.journey.appliedOperations.length, 2);
});

test("returns a persisted idempotent result and rejects stale or reused operations", () => {
  const initial = Journey.createJourney("Biology", "2026-07-11T00:00:00Z");
  const op = operation(Worker.MESSAGE_TYPES.ADD_SOURCE, "op:idempotent", 0, {
    chapterTitle: "Cells",
    source: { id: "source-a", title: "A", text: "alpha", fingerprint: "a" }
  });
  const first = Worker.reduceJourneyOperation(initial, op, "2026-07-11T01:00:00Z");
  const duplicate = Worker.reduceJourneyOperation(first.journey, op, "2026-07-11T02:00:00Z");

  assert.equal(duplicate.duplicate, true);
  assert.equal(duplicate.changed, false);
  assert.equal(duplicate.journey.chapters[0].sources.length, 1);
  assert.equal(duplicate.result.sourceId, first.result.sourceId);
  assert.throws(() => Worker.reduceJourneyOperation(first.journey, {
    ...op,
    type: Worker.MESSAGE_TYPES.REMOVE_SOURCE
  }), (error) => error.code === "OP_ID_REUSED");
  assert.throws(() => Worker.reduceJourneyOperation(first.journey, operation(
    Worker.MESSAGE_TYPES.ADD_SOURCE,
    "op:stale-revision",
    0,
    { chapterTitle: "Cells", source: { title: "B", text: "beta" } }
  )), (error) => error.code === "REVISION_CONFLICT");
});

test("rejects collection finalization after its source set changes", () => {
  const initial = Journey.addSource(Journey.createJourney(), "Cells", {
    id: "source-a",
    title: "A",
    text: "alpha",
    fingerprint: "a"
  }).journey;
  const chapter = initial.chapters[0];
  const staleHash = Journey.sourceRevisionHash(chapter);
  const changed = Journey.addSource(initial, chapter.id, {
    id: "source-b",
    title: "B",
    text: "beta",
    fingerprint: "b"
  }).journey;

  assert.throws(() => Worker.reduceJourneyOperation(changed, operation(
    Worker.MESSAGE_TYPES.FINALIZE_COLLECTION,
    "op:finish-stale",
    changed.revision,
    {
      chapterId: chapter.id,
      sourceRevisionHash: staleHash,
      session: { id: "combined", title: "Combined", score: null }
    }
  )), (error) => error.code === "SOURCE_REVISION_CONFLICT");
});

test("saves summaries without changing the evidence revision", () => {
  const initial = Journey.recordSession(Journey.createJourney(), "Cells", {
    id: "quiz",
    title: "Quiz",
    score: 90,
    createdAt: "2026-07-11T01:00:00Z"
  }).journey;
  const result = Worker.reduceJourneyOperation(initial, operation(
    Worker.MESSAGE_TYPES.SAVE_SUMMARY,
    "op:save-summary",
    initial.revision,
    {
      summary: {
        range: "week",
        overview: "Strong progress",
        evidence: "Based on one submitted quiz."
      }
    }
  ), "2026-07-11T02:00:00Z");

  assert.equal(result.journey.revision, initial.revision);
  assert.equal(result.journey.summary.sourceRevision, initial.revision);
  assert.equal(result.journey.summary.overview, "Strong progress");
});

test("bounds persisted operation identifiers", () => {
  let journey = Journey.createJourney();
  for (let index = 0; index < Journey.MAX_APPLIED_OPERATIONS + 5; index += 1) {
    const result = Worker.reduceJourneyOperation(journey, operation(
      Worker.MESSAGE_TYPES.SAVE_SUMMARY,
      `op:summary:${String(index).padStart(3, "0")}`,
      journey.revision,
      { summary: { range: "all", overview: `Summary ${index}` } }
    ), 1_700_000_000_000 + index);
    journey = result.journey;
  }
  assert.equal(journey.appliedOperations.length, Journey.MAX_APPLIED_OPERATIONS);
  assert.equal(journey.appliedOperations.at(-1).opId, `op:summary:${Journey.MAX_APPLIED_OPERATIONS + 4}`);
});

test("binds an idempotency key to a stable payload hash", () => {
  const initial = Journey.createJourney("Payload hashes", "2026-07-11T00:00:00Z");
  const firstPayload = {
    chapterTitle: "Cells",
    source: { id: "source-a", title: "Membranes", text: "Evidence", fingerprint: "fp-a" }
  };
  const first = Worker.reduceJourneyOperation(initial, operation(
    Worker.MESSAGE_TYPES.ADD_SOURCE,
    "op:payload-hash",
    initial.revision,
    firstPayload
  ), "2026-07-11T01:00:00Z");

  assert.ok(first.journey.appliedOperations[0].payloadHash);
  const reorderedEquivalent = {
    source: { fingerprint: "fp-a", text: "Evidence", title: "Membranes", id: "source-a" },
    chapterTitle: "Cells"
  };
  const duplicate = Worker.reduceJourneyOperation(first.journey, operation(
    Worker.MESSAGE_TYPES.ADD_SOURCE,
    "op:payload-hash",
    0,
    reorderedEquivalent
  ));
  assert.equal(duplicate.duplicate, true);

  assert.throws(() => Worker.reduceJourneyOperation(first.journey, operation(
    Worker.MESSAGE_TYPES.ADD_SOURCE,
    "op:payload-hash",
    first.journey.revision,
    { ...firstPayload, chapterTitle: "Different chapter" }
  )), (error) => error.code === "OP_ID_REUSED" && error.details.payloadChanged === true);
});

test("preserves a changed webpage revision and keeps operation retries idempotent", () => {
  const initial = Journey.addSource(Journey.createJourney(), "Cells", {
    id: "source-stable",
    type: "webpage",
    title: "Cells",
    url: "https://learn.example/cells",
    fingerprint: "old-fingerprint",
    text: "Old evidence"
  }).journey;
  const op = operation(
    Worker.MESSAGE_TYPES.ADD_SOURCE,
    "op:refresh-source",
    initial.revision,
    {
      chapterId: initial.chapters[0].id,
      source: {
        id: "source-new-id",
        type: "webpage",
        title: "Cells updated",
        url: "https://learn.example/cells#updated",
        fingerprint: "new-fingerprint",
        text: "New evidence"
      }
    }
  );
  const updated = Worker.reduceJourneyOperation(initial, op, "2026-07-12T01:00:00Z");
  const duplicateRetry = Worker.reduceJourneyOperation(updated.journey, op, "2026-07-12T01:05:00Z");

  assert.equal(updated.result.duplicate, false);
  assert.equal(updated.result.updated, false);
  assert.equal(updated.journey.chapters[0].sources.length, 2);
  assert.equal(updated.journey.chapters[0].sources[0].id, "source-stable");
  assert.equal(updated.journey.chapters[0].sources[1].fingerprint, "new-fingerprint");
  assert.equal(duplicateRetry.duplicate, true);
  assert.equal(duplicateRetry.result.updated, false);
});

test("atomically binds a saved session to the source ID assigned by Journey", () => {
  const initial = Journey.createJourney("Source binding", "2026-07-16T00:00:00Z");
  const saved = Worker.reduceJourneyOperation(initial, operation(
    Worker.MESSAGE_TYPES.UPSERT_SESSION,
    "op:source-session-binding",
    initial.revision,
    {
      chapterTitle: "Photosynthesis",
      source: {
        type: "webpage",
        title: "Photosynthesis",
        url: "https://learn.example/photosynthesis",
        fingerprint: "photo-source-v1",
        text: "Light energy is converted into chemical energy stored in glucose."
      },
      session: {
        id: "note-photo",
        kind: "note",
        artifactType: "study",
        title: "Photosynthesis visual note",
        sourceBinding: { sourceType: "webpage", sourceId: "" },
        visualLesson: { visualModel: { nodes: [{ id: "light-energy" }] } }
      }
    }
  ), "2026-07-16T01:00:00Z");

  const session = saved.journey.chapters[0].sessions[0];
  assert.equal(session.sourceId, saved.result.sourceId);
  assert.equal(session.sourceId, saved.journey.chapters[0].sources[0].id);
});

test("atomically saves a quiz session and its normalized question attempts", () => {
  assert.equal(Worker.MESSAGE_TYPES.CLEAR_LEARNING_MEMORY, "JOURNEY_CLEAR_LEARNING_MEMORY");
  const initial = Journey.createJourney("Worker memory", "2026-07-15T00:00:00Z");
  const request = operation(
    Worker.MESSAGE_TYPES.UPSERT_SESSION,
    "op:save-quiz-attempts",
    initial.revision,
    {
      chapterTitle: "Photosynthesis",
      session: {
        id: "worker-note",
        quizId: "worker-quiz",
        title: "Photosynthesis quiz",
        kind: "quiz",
        score: 50,
        submittedAt: "2026-07-15T02:05:00Z",
        sourceFingerprint: "worker-source",
        weakTopics: ["Calvin cycle"]
      },
      questionAttempts: [
        workerAttempt(1),
        workerAttempt(2, {
          primaryConceptId: "concept-calvin",
          conceptLabel: "Calvin cycle",
          studentAnswer: "Oxygen",
          result: "incorrect"
        })
      ]
    }
  );

  const saved = Worker.reduceJourneyOperation(initial, request, "2026-07-15T02:05:00Z");

  assert.equal(initial.chapters.length, 0, "the reducer must not mutate the input before the atomic result is returned");
  assert.equal(saved.result.recordedAttemptCount, 2);
  assert.equal(saved.result.duplicateAttemptCount, 0);
  assert.equal(saved.journey.chapters[0].sessions.length, 1);
  assert.deepEqual(saved.journey.chapters[0].sessions[0].weakTopics, ["Calvin cycle"]);
  assert.equal(saved.journey.learningMemory.attempts.length, 2);
  assert.equal(saved.journey.learningMemory.concepts.length, 2);
  assert.equal(
    saved.journey.learningMemory.concepts.find((concept) => concept.conceptId === "concept-calvin").state,
    "weak"
  );

  const retry = Worker.reduceJourneyOperation(saved.journey, request, "2026-07-15T02:06:00Z");
  assert.equal(retry.duplicate, true);
  assert.equal(retry.changed, false);
  assert.equal(retry.result.recordedAttemptCount, 2);
  assert.equal(retry.result.duplicateAttemptCount, 0);
  assert.equal(retry.journey.learningMemory.attempts.length, 2);
});

test("rejects malformed attempt collections without committing the session", () => {
  const initial = Journey.createJourney("Worker memory", "2026-07-15T00:00:00Z");
  const before = JSON.stringify(initial);

  assert.throws(() => Worker.reduceJourneyOperation(initial, operation(
    Worker.MESSAGE_TYPES.UPSERT_SESSION,
    "op:invalid-attempts",
    initial.revision,
    {
      chapterTitle: "Photosynthesis",
      session: {
        id: "worker-note",
        title: "Photosynthesis quiz",
        score: 100,
        submittedAt: "2026-07-15T02:05:00Z"
      },
      questionAttempts: { attemptId: "not-a-list" }
    }
  )), (error) => error.code === "INVALID_ATTEMPTS");

  assert.throws(() => Worker.reduceJourneyOperation(initial, operation(
    Worker.MESSAGE_TYPES.UPSERT_SESSION,
    "op:invalid-attempt-item",
    initial.revision,
    {
      chapterTitle: "Photosynthesis",
      session: {
        id: "worker-note",
        title: "Photosynthesis quiz",
        score: 100,
        submittedAt: "2026-07-15T02:05:00Z"
      },
      questionAttempts: [{ attemptId: "missing-required-fields" }]
    }
  )), (error) => error.code === "INVALID_ATTEMPTS");

  assert.equal(JSON.stringify(initial), before);
  assert.equal(initial.chapters.length, 0);
});

test("clears learning memory through the worker while preserving all Journey evidence", () => {
  let journey = Journey.addSource(Journey.createJourney("Worker clear", "2026-07-15T00:00:00Z"), "Photosynthesis", {
    id: "source-photo",
    title: "Photosynthesis note",
    fingerprint: "worker-source",
    text: "Light energy drives photosynthesis."
  }, "2026-07-15T01:00:00Z").journey;
  journey = Journey.recordSession(journey, journey.chapters[0].id, {
    id: "worker-note",
    title: "Photosynthesis quiz",
    score: 50,
    submittedAt: "2026-07-15T01:30:00Z",
    weakTopics: ["Light-dependent reactions"]
  }, "2026-07-15T01:30:00Z").journey;
  journey = Journey.recordQuestionAttempts(journey, [workerAttempt(1, {
    result: "incorrect",
    studentAnswer: "Wrong"
  })], { score: 0, submittedAt: "2026-07-15T02:00:00Z" }).journey;
  const chaptersBefore = structuredClone(journey.chapters);
  const eventsBefore = structuredClone(journey.events);
  const request = operation(
    Worker.MESSAGE_TYPES.CLEAR_LEARNING_MEMORY,
    "op:clear-learning-memory",
    journey.revision
  );

  const cleared = Worker.reduceJourneyOperation(journey, request, "2026-07-15T03:00:00Z");

  assert.equal(cleared.result.clearedAttemptCount, 1);
  assert.equal(cleared.result.clearedConceptCount, 1);
  assert.deepEqual(cleared.journey.learningMemory, {
    concepts: [],
    attempts: [],
    recordedAttemptIds: []
  });
  assert.deepEqual(cleared.journey.chapters, chaptersBefore);
  assert.deepEqual(cleared.journey.events, eventsBefore);
  assert.deepEqual(cleared.journey.chapters[0].sessions[0].weakTopics, ["Light-dependent reactions"]);

  const retry = Worker.reduceJourneyOperation(cleared.journey, request, "2026-07-15T03:05:00Z");
  assert.equal(retry.duplicate, true);
  assert.equal(retry.changed, false);
  assert.equal(retry.result.clearedAttemptCount, 1);
  assert.equal(retry.result.clearedConceptCount, 1);
});
