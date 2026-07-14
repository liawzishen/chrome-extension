const test = require("node:test");
const assert = require("node:assert/strict");

process.env.BACKEND_ACCESS_TOKEN = "test-token-that-is-long-enough-123456";
process.env.ALLOWED_EXTENSION_ORIGINS = "chrome-extension://abcdefghijklmnopabcdefghijklmnop";

const {
  buildNotesPrompt,
  buildQuizOnlyPrompt,
  getResponseSchema,
  normalizeNotes,
  normalizeQuizArtifact,
  prepareQuizArtifactInput,
  prepareStudyNotesInput
} = require("../server.js");

const videoSegments = [
  { id: "seg-0001", startMs: 12000, endMs: 18000, text: "Diffusion moves particles down a concentration gradient." },
  { id: "seg-0002", startMs: 18000, endMs: 25000, text: "Osmosis is the movement of water through a selectively permeable membrane." },
  { id: "seg-0003", startMs: 25000, endMs: 33000, text: "Active transport uses cellular energy to move substances against a gradient." }
];

const collectionSources = [
  { id: "source-a", type: "webpage", title: "Membrane transport", url: "https://example.com/membrane" },
  { id: "source-b", type: "notes", title: "Diffusion notes", url: "" }
];

const collectionText = [
  "<<<SOURCE_BLOCK>>>",
  "SOURCE source-a",
  "TYPE webpage",
  "TITLE Membrane transport",
  "URL https://example.com/membrane",
  "CONTENT_BEGIN",
  "Cell membranes control transport through selective permeability.",
  "CONTENT_END",
  "<<<END_SOURCE_BLOCK>>>",
  "",
  "<<<SOURCE_BLOCK>>>",
  "SOURCE source-b",
  "TYPE notes",
  "TITLE Diffusion notes",
  "URL saved notes",
  "CONTENT_BEGIN",
  "Diffusion moves particles down a concentration gradient.",
  "CONTENT_END",
  "<<<END_SOURCE_BLOCK>>>"
].join("\n");

function makeVisualModel(nodes) {
  return {
    title: "Transport model",
    objective: "Understand how membrane transport mechanisms differ.",
    kind: "comparison",
    nodes,
    edges: [
      { from: nodes[0].id, to: nodes[1].id, label: "contrasts with" },
      { from: nodes[1].id, to: nodes[2].id, label: "contrasts with" }
    ],
    scenarios: [
      {
        id: "case-1",
        label: "Down gradient",
        prompt: "Which path applies?",
        activeIds: [nodes[0].id],
        values: [{ nodeId: nodes[0].id, value: "down gradient" }],
        outcome: "Particles spread without cellular energy.",
        insight: "The concentration difference drives net movement."
      },
      {
        id: "case-2",
        label: "Against gradient",
        prompt: "Which path applies?",
        activeIds: [nodes[2].id],
        values: [{ nodeId: nodes[2].id, value: "energy required" }],
        outcome: "Cellular energy powers movement.",
        insight: "Moving against a gradient requires energy."
      }
    ],
    check: {
      prompt: "Which mechanism uses cellular energy?",
      choices: ["Diffusion", "Osmosis", "Active transport"],
      answer: "Active transport",
      explanation: "Active transport moves substances against a gradient."
    },
    suggestedQuestions: ["Why does diffusion need no cellular energy?", "How does osmosis differ from diffusion?"]
  };
}

function makeQuestion(overrides = {}) {
  return {
    prompt: "Which statement describes diffusion?",
    choices: [
      "Particles move down a concentration gradient",
      "Particles always require cellular energy",
      "Water cannot cross a membrane",
      "Particles move only against a gradient"
    ],
    answer: "Particles move down a concentration gradient",
    topic: "Diffusion",
    questionStyle: "Definition",
    skill: "Identify diffusion",
    cognitiveLevel: "recall",
    whyThisMatters: "Diffusion is a core transport mechanism.",
    misconceptionTested: "Diffusion always requires energy.",
    hint: "Consider the direction of the gradient.",
    explanation: "Diffusion moves particles down a concentration gradient.",
    sourceText: "Diffusion moves particles down a concentration gradient.",
    sourceSegmentId: "",
    sourceId: "",
    ...overrides
  };
}

test("note input accepts webpage, notes, video, and collection snapshots without quiz settings", () => {
  const webpage = prepareStudyNotesInput({ sourceType: "webpage", title: "Page", rawText: "A sufficiently useful source sentence about cell transport and diffusion." });
  const notes = prepareStudyNotesInput({ sourceType: "notes", title: "Notes", rawText: "A sufficiently useful note about cell transport and diffusion." });
  const video = prepareStudyNotesInput({ sourceType: "video", title: "Video", rawText: videoSegments.map((segment) => segment.text).join(" "), videoSegments });
  const collection = prepareStudyNotesInput({ sourceType: "collection", title: "Collection", rawText: collectionText, collectionSources });

  assert.equal(webpage.sourceType, "webpage");
  assert.equal(notes.sourceType, "notes");
  assert.equal(video.videoSegments.length, 3);
  assert.equal(collection.collectionSources.length, 2);
  assert.match(collection.rawText, /SOURCE source-a\n/);
  assert.match(collection.rawText, /CONTENT_BEGIN\nCell membranes/);
  for (const prepared of [webpage, notes, video, collection]) {
    assert.equal("questionCount" in prepared, false);
    assert.equal("questions" in prepared, false);
  }
});

test("quiz input requires a note id and matching immutable source fingerprint", () => {
  const base = {
    sourceType: "webpage",
    title: "Cell transport",
    rawText: "Cell membranes control transport while diffusion moves particles down a gradient.",
    questionCount: 5
  };
  assert.throws(() => prepareQuizArtifactInput(base), /noteId is required/);
  assert.throws(() => prepareQuizArtifactInput({ ...base, noteId: "note-1" }), /sourceFingerprint is required/);
  assert.throws(() => prepareQuizArtifactInput({
    ...base,
    noteId: "note-1",
    sourceFingerprint: "fingerprint-a",
    sourceBinding: { fingerprint: "fingerprint-b" }
  }), /does not match/);

  const prepared = prepareQuizArtifactInput({
    ...base,
    noteId: "note-1",
    sourceFingerprint: "fingerprint-a",
    summary: ["must not be sent to the model"],
    visualModel: { title: "must not be sent to the model" }
  });
  assert.equal(prepared.noteId, "note-1");
  assert.equal(prepared.sourceFingerprint, "fingerprint-a");
  assert.equal("summary" in prepared, false);
  assert.equal("visualModel" in prepared, false);
});

test("notes and quiz-only schemas keep the two generated artifacts separate", () => {
  const notesSchema = getResponseSchema("study_notes");
  const quizOnlySchema = getResponseSchema("quiz_only");
  const legacySchema = getResponseSchema("quiz_session");
  assert.equal("questions" in notesSchema.properties, false);
  assert.equal("summary" in quizOnlySchema.properties, false);
  assert.equal("visualLesson" in quizOnlySchema.properties, false);
  assert.ok(quizOnlySchema.properties.questions);
  assert.ok(legacySchema.properties.summary);
  assert.ok(legacySchema.properties.visualLesson);
  assert.ok(legacySchema.properties.questions);

  const noteInput = prepareStudyNotesInput({ sourceType: "video", title: "Video", rawText: videoSegments.map((segment) => segment.text).join(" "), videoSegments });
  const quizInput = prepareQuizArtifactInput({
    sourceType: "video",
    title: "Video",
    noteId: "note-1",
    sourceFingerprint: "video-fingerprint",
    rawText: videoSegments.map((segment) => segment.text).join(" "),
    videoSegments
  });
  assert.match(buildNotesPrompt(noteInput), /Do not create quiz questions/);
  const quizPrompt = buildQuizOnlyPrompt(quizInput);
  assert.doesNotMatch(quizPrompt, /"visualLesson"\s*:/);
  assert.doesNotMatch(quizPrompt, /"summary"\s*:/);
  assert.match(quizPrompt, /questions only/i);
});

test("video visual notes retain grounded timestamp references and never expose quiz data", () => {
  const nodes = videoSegments.map((segment, index) => ({
    id: `node-${index + 1}`,
    label: ["Diffusion", "Osmosis", "Active transport"][index],
    symbol: "",
    role: "Transport mechanism",
    detail: segment.text,
    why: "It explains membrane transport.",
    example: segment.text,
    sourceAnchor: segment.text,
    sourceSegmentId: segment.id,
    sourceId: ""
  }));
  const input = prepareStudyNotesInput({
    sourceType: "video",
    title: "Transport video",
    sourceUrl: "https://www.youtube.com/watch?v=abcDEF12345",
    sourceFingerprint: "video-fingerprint",
    rawText: videoSegments.map((segment) => segment.text).join(" "),
    videoSegments
  });
  const note = normalizeNotes({
    title: "Transport video",
    summary: ["Membrane transport follows gradients or uses energy."],
    visualLesson: { title: "Transport", visualModel: makeVisualModel(nodes) },
    terms: ["Diffusion", "Osmosis", "Active transport"],
    goals: ["Compare transport mechanisms"],
    questions: [makeQuestion()]
  }, input);

  assert.equal(note.sourceType, "video");
  assert.equal(note.sourceFingerprint, "video-fingerprint");
  assert.equal("questions" in note, false);
  assert.equal(note.visualLesson.visualModel.nodes[0].sourceSegmentId, "seg-0001");
  assert.equal(note.visualLesson.visualModel.nodes[0].sourceTimestamp, 12);
  assert.deepEqual(note.visualLesson.visualModel.nodes[0].sourceRef, {
    sourceId: "current-video",
    segmentId: "seg-0001",
    startMs: 12000,
    endMs: 18000,
    quote: videoSegments[0].text
  });

  const quizInput = prepareQuizArtifactInput({
    sourceType: "video",
    title: "Transport video",
    sourceUrl: "https://www.youtube.com/watch?v=abcDEF12345",
    noteId: "note-video",
    sourceFingerprint: "video-fingerprint",
    rawText: videoSegments.map((segment) => segment.text).join(" "),
    videoSegments,
    questionCount: 5,
    difficulty: "easy",
    quizStyle: "definition"
  });
  const quiz = normalizeQuizArtifact({
    title: "Transport quiz",
    questions: Array.from({ length: 5 }, (_, index) => makeQuestion({
      prompt: `Which statement describes diffusion? (${index + 1})`,
      sourceSegmentId: "seg-0001"
    }))
  }, quizInput);
  assert.equal(quiz.questions[0].sourceTimestamp, 12);
  assert.equal(quiz.questions[0].sourceRef.segmentId, "seg-0001");
});

test("collection visual notes and quiz questions retain exact saved source IDs", () => {
  const collectionInput = prepareStudyNotesInput({
    sourceType: "collection",
    title: "Transport collection",
    sourceFingerprint: "collection-fingerprint",
    rawText: collectionText,
    collectionSources
  });
  const nodes = [
    {
      id: "membrane",
      label: "Selective membrane",
      symbol: "",
      role: "Boundary",
      detail: "Cell membranes control transport through selective permeability.",
      why: "Selective permeability controls what crosses.",
      example: "A membrane permits some substances.",
      sourceAnchor: "Cell membranes control transport through selective permeability.",
      sourceSegmentId: "",
      sourceId: "source-a"
    },
    {
      id: "diffusion",
      label: "Diffusion",
      symbol: "",
      role: "Movement",
      detail: "Diffusion moves particles down a concentration gradient.",
      why: "The gradient drives net movement.",
      example: "Particles spread from high to low concentration.",
      sourceAnchor: "Diffusion moves particles down a concentration gradient.",
      sourceSegmentId: "",
      sourceId: "source-b"
    },
    {
      id: "relationship",
      label: "Transport relationship",
      symbol: "",
      role: "Connection",
      detail: "Selective permeability controls transport through cell membranes.",
      why: "The membrane and gradient jointly shape movement.",
      example: "Membranes permit selective diffusion.",
      sourceAnchor: "Cell membranes control transport through selective permeability.",
      sourceSegmentId: "",
      sourceId: "source-a"
    }
  ];
  const note = normalizeNotes({
    title: "Transport collection",
    summary: ["Selective membranes and gradients shape transport."],
    visualLesson: { title: "Transport", visualModel: makeVisualModel(nodes) },
    terms: [],
    goals: []
  }, collectionInput);
  assert.equal(note.visualLesson.visualModel.nodes[0].sourceId, "source-a");
  assert.equal(note.visualLesson.visualModel.nodes[1].sourceRef.sourceId, "source-b");

  const quizInput = prepareQuizArtifactInput({
    sourceType: "collection",
    title: "Transport collection",
    noteId: "note-collection",
    sourceFingerprint: "collection-fingerprint",
    rawText: collectionText,
    collectionSources,
    questionCount: 5,
    difficulty: "easy",
    quizStyle: "definition"
  });
  const questions = Array.from({ length: 5 }, (_, index) => makeQuestion({
    prompt: `Which statement describes diffusion? (${index + 1})`,
    sourceId: "source-b"
  }));
  const quiz = normalizeQuizArtifact({
    title: "Transport quiz",
    summary: ["must be excluded"],
    visualLesson: { title: "must be excluded" },
    questions
  }, quizInput);
  assert.equal(quiz.noteId, "note-collection");
  assert.equal(quiz.sourceFingerprint, "collection-fingerprint");
  assert.equal("summary" in quiz, false);
  assert.equal("visualLesson" in quiz, false);
  assert.equal("rawText" in quiz, false);
  assert.equal("sources" in quiz, false);
  assert.equal(quiz.questions[0].sourceId, "source-b");
  assert.equal(quiz.questions[0].sourceRef.title, "Diffusion notes");
});
