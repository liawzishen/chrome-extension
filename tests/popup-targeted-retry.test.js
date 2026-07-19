const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const popup = fs.readFileSync(path.join(__dirname, "..", "popup.js"), "utf8");

function sourceBetween(startMarker, endMarker) {
  const start = popup.indexOf(startMarker);
  const end = popup.indexOf(endMarker, start + startMarker.length);
  assert.ok(start >= 0, `Missing ${startMarker}`);
  assert.ok(end > start, `Missing ${endMarker}`);
  return popup.slice(start, end).trim();
}

function getRecoveryHarness() {
  return vm.runInNewContext(`(() => {
    ${sourceBetween("function normalizeRecoveryConceptText", "function generateLocalRecoveryQuizArtifact")}
    ${sourceBetween("function normalizeClientVisualEdgeType", "function normalizeVisualScenario")}
    return { getClientRecoveryComposition };
  })()`);
}

test("client recovery composition uses directed prerequisites, then related fallback", () => {
  const harness = getRecoveryHarness();
  const visualModel = {
    nodes: ["target", "prereq", "reverse", "related"].map((id) => ({ id })),
    edges: [
      { from: "prereq", to: "target", type: "prerequisite_of" },
      { from: "target", to: "reverse", type: "prerequisite_of" },
      { from: "target", to: "related", type: "related" }
    ]
  };
  const composition = harness.getClientRecoveryComposition(visualModel, "target");
  assert.deepEqual([...composition.prerequisiteConceptIds], ["prereq"]);
  assert.equal(composition.directedPrerequisiteQuestionCount, 1);
  assert.equal(composition.sourceInferredPrerequisiteQuestionCount, 0);
  assert.deepEqual([...composition.relatedConceptIds], ["related"]);
  assert.equal(composition.targetQuestionCount, 3);
  assert.equal(composition.description, "Actual recovery composition: 3 target, 1 directed prerequisite, 1 related.");
});

test("client recovery composition uses co-occurring source concepts before target repetition", () => {
  const harness = getRecoveryHarness();
  const visualModel = {
    nodes: [{
      id: "target",
      label: "Target concept",
      sourceSegmentId: "segment-1",
      sourceAnchor: "Foundation A and the target concept appear together."
    }, {
      id: "foundation-a",
      label: "Foundation A",
      sourceSegmentId: "segment-1",
      sourceAnchor: "Foundation A establishes the first step."
    }, {
      id: "foundation-b",
      label: "Foundation B",
      sourceSegmentId: "segment-1",
      sourceAnchor: "Foundation B establishes the second step."
    }, {
      id: "same-source-only",
      label: "Same source only",
      sourceId: "source-note",
      sourceAnchor: "A separate source section."
    }],
    edges: []
  };
  const composition = harness.getClientRecoveryComposition(visualModel, "target");

  assert.deepEqual([...composition.sourceInferredPrerequisiteConceptIds], ["foundation-a", "foundation-b"]);
  assert.deepEqual([...composition.primaryConceptIds], [
    "target", "target", "target", "foundation-a", "foundation-b"
  ]);
  assert.equal(composition.targetQuestionCount, 3);
  assert.equal(composition.extraTargetQuestionCount, 0);
  assert.equal(composition.description, "Actual recovery composition: 3 target, 2 source-inferred prerequisite.");
});

test("question definitions remain static while submission creates rich attempt records", () => {
  const harness = vm.runInNewContext(`(() => {
    ${sourceBetween("function buildQuestionAttempts", "async function jumpToVideoTimestamp")}
    return { buildQuestionAttempts };
  })()`, { crypto: { randomUUID: crypto.randomUUID } });
  const question = {
    id: "quiz-1-q-001",
    prompt: "What stores energy?",
    answer: "Glucose",
    topic: "Energy storage",
    primaryConceptId: "glucose",
    relatedConceptIds: ["light"],
    sourcePage: 18,
    sourceRef: { sourceType: "webpage", documentType: "pdf", sourcePage: 18 }
  };
  const session = {
    id: "note-1",
    noteId: "note-1",
    quizId: "quiz-1",
    sourceFingerprint: "fp-1",
    attemptType: "recovery",
    recoveryTargetConceptId: "glucose",
    questions: [question],
    answers: { "quiz-1-q-001": "Oxygen" },
    visualLesson: { visualModel: { nodes: [{ id: "glucose", label: "Glucose" }] } }
  };
  const [attempt] = harness.buildQuestionAttempts(session, "2026-07-15T10:00:00.000Z");
  assert.equal(attempt.questionId, question.id);
  assert.equal(attempt.primaryConceptId, "glucose");
  assert.equal(attempt.studentAnswer, "Oxygen");
  assert.equal(attempt.correctAnswer, "Glucose");
  assert.equal(attempt.result, "incorrect");
  assert.equal(attempt.attemptType, "recovery");
  assert.equal(attempt.targetConceptId, "glucose");
  assert.equal(attempt.sourcePage, 18);
  assert.equal("studentAnswer" in question, false);
  assert.equal("result" in question, false);
});

test("weakest concept diagnosis groups misses by primary concept only", () => {
  const harness = vm.runInNewContext(`(() => {
    ${sourceBetween("function getWeakestConceptFromSession", "function buildGoals")}
    return { getWeakestConceptFromSession };
  })()`);
  const weakest = harness.getWeakestConceptFromSession({
    visualLesson: { visualModel: { nodes: [
      { id: "tcp-congestion", label: "TCP congestion control" },
      { id: "flow-control", label: "Flow control" }
    ] } },
    wrongAnswers: [
      { primaryConceptId: "tcp-congestion", relatedConceptIds: ["flow-control"], sourcePage: 18 },
      { primaryConceptId: "tcp-congestion", relatedConceptIds: ["flow-control"], sourcePage: 18 },
      { primaryConceptId: "flow-control", relatedConceptIds: ["tcp-congestion"], sourcePage: 17 }
    ]
  });
  assert.equal(weakest.conceptId, "tcp-congestion");
  assert.equal(weakest.label, "TCP congestion control");
  assert.equal(weakest.wrongCount, 2);
  assert.equal(weakest.sourcePage, 18);
});

test("PDF review is a dedicated page jump and never routes through HTML highlighting", () => {
  const renderScore = sourceBetween("function renderScore", "function getWeakestConceptFromSession");
  const dispatcher = sourceBetween("async function openEvidenceAtSource", "async function jumpToVideoTimestamp");
  const jump = sourceBetween("async function jumpToPdfPage", "async function highlightSourceText");
  assert.match(renderScore, /Review PDF page \$\{weakest\.sourcePage\}/);
  assert.match(renderScore, /openEvidenceAtSource\(\{ \.\.\.reviewItem, sourcePage: weakest\.sourcePage \}/);
  assert.ok(dispatcher.indexOf('descriptor.documentType === "pdf"') < dispatcher.indexOf("highlightSourceText("));
  assert.match(dispatcher, /jumpToPdfPage\(descriptor\.sourcePage/);
  assert.doesNotMatch(jump, /highlightSourceText/);
  assert.match(jump, /expectedFingerprint/);
  assert.match(jump, /buildPdfEvidenceUrl\(safeSourceUrl, page, quote\)/);
});
