const test = require("node:test");
const assert = require("node:assert/strict");

require("../journey-utils.js");
const Worker = require("../journey-worker-utils.js");
const Journey = globalThis.ExamCramJourney;

function operation(type, opId, expectedRevision, payload = {}) {
  return { type, opId, expectedRevision, payload };
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

test("updates a repeated webpage snapshot without adding a second source card", () => {
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

  assert.equal(updated.result.duplicate, true);
  assert.equal(updated.result.updated, true);
  assert.equal(updated.journey.chapters[0].sources.length, 1);
  assert.equal(updated.journey.chapters[0].sources[0].id, "source-stable");
  assert.equal(updated.journey.chapters[0].sources[0].fingerprint, "new-fingerprint");
  assert.equal(duplicateRetry.duplicate, true);
  assert.equal(duplicateRetry.result.updated, true);
});
