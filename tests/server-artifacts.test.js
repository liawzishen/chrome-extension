const test = require("node:test");
const assert = require("node:assert/strict");

process.env.BACKEND_ACCESS_TOKEN = "test-token-that-is-long-enough-123456";
process.env.ALLOWED_EXTENSION_ORIGINS = "chrome-extension://abcdefghijklmnopabcdefghijklmnop";

const {
  appendRetryCorrection,
  assertVisualModelUsable,
  buildNotesPrompt,
  buildQuizOnlyPrompt,
  buildRecoveryComposition,
  buildRecoveryQuizPrompt,
  getResponseSchema,
  normalizeNotes,
  normalizeQuizArtifact,
  normalizeSession,
  prepareQuizArtifactInput,
  prepareStudyNotesInput,
  stripGeminiUnsupportedSchemaKeywords
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

function makeCollectionCoverageNodes(sourceIds) {
  return sourceIds.map((sourceId, index) => {
    const isDiffusionSource = sourceId === "source-b";
    const evidence = isDiffusionSource
      ? "Diffusion moves particles down a concentration gradient."
      : "Cell membranes control transport through selective permeability.";
    return {
      id: `coverage-node-${index + 1}`,
      label: isDiffusionSource ? "Diffusion" : "Cell membranes",
      symbol: "",
      role: isDiffusionSource ? "Movement" : "Boundary",
      detail: evidence,
      why: evidence,
      example: evidence,
      sourceAnchor: evidence,
      sourceSegmentId: "",
      sourceId
    };
  });
}

const photosynthesisText = "Photosynthesis converts light energy into chemical energy stored in glucose. Water and carbon dioxide supply matter to the connected reactions inside chloroplasts. Glucose stores captured energy, while oxygen is released. When usable light, water, or carbon dioxide becomes limited, the connected pathway slows and downstream outputs change.";

const photosynthesisPdfText = [
  "Page 1",
  "Photosynthesis converts light energy into chemical energy inside chloroplasts.",
  "Page 2",
  "Glucose stores captured chemical energy, while oxygen is released during photosynthesis.",
  "Page 3",
  "Water and carbon dioxide supply matter, and limiting either input slows the connected pathway."
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
    sourcePage: 0,
    ...overrides
  };
}

function makeVideoVisualModel() {
  return makeVisualModel(videoSegments.map((segment, index) => ({
    id: `node-${index + 1}`,
    label: ["Diffusion", "Osmosis", "Active transport"][index],
    symbol: "",
    role: "Transport mechanism",
    detail: segment.text,
    why: "It explains membrane transport.",
    example: segment.text,
    sourceAnchor: segment.text,
    sourceSegmentId: segment.id,
    sourceId: "",
    sourcePage: 0
  })));
}

function makePhotosynthesisQuestions(overrides = {}) {
  return Array.from({ length: 5 }, (_, index) => makeQuestion({
    prompt: `Which product stores captured energy according to the photosynthesis note? (${index + 1})`,
    choices: ["Glucose", "Oxygen", "Water", "Carbon dioxide"],
    answer: "Glucose",
    topic: "Photosynthesis",
    questionStyle: index === 0 ? "Application" : index === 1 ? "Comparison" : "Definition",
    cognitiveLevel: index === 0 ? "apply" : "understand",
    explanation: "Photosynthesis converts light energy into chemical energy stored in glucose.",
    sourceText: "Photosynthesis converts light energy into chemical energy stored in glucose.",
    primaryConceptId: "glucose",
    relatedConceptIds: [],
    ...overrides
  }));
}

function makePhotosynthesisVisualModel() {
  const sourceId = "source-photosynthesis-note";
  const nodes = [
    {
      id: "light-energy",
      label: "Light energy",
      symbol: "",
      role: "Energy input",
      detail: "Photosynthesis converts light energy into chemical energy stored in glucose.",
      why: "Light supplies the energy captured by the process.",
      example: "Usable light powers the reactions inside chloroplasts.",
      sourceAnchor: "Photosynthesis converts light energy into chemical energy stored in glucose.",
      sourceId,
      sourceSegmentId: "",
      sourcePage: 0
    },
    {
      id: "glucose",
      label: "Glucose",
      symbol: "",
      role: "Stored-energy output",
      detail: "Glucose stores captured energy, while oxygen is released.",
      why: "Glucose retains the captured energy in chemical form.",
      example: "The plant can later use energy stored in glucose.",
      sourceAnchor: "Glucose stores captured energy, while oxygen is released.",
      sourceId,
      sourceSegmentId: "",
      sourcePage: 0
    },
    {
      id: "limiting-input",
      label: "Limiting input",
      symbol: "",
      role: "Rate constraint",
      detail: "When usable light, water, or carbon dioxide becomes limited, the connected pathway slows.",
      why: "The process depends on all of its inputs.",
      example: "Low carbon dioxide limits glucose production even when light is available.",
      sourceAnchor: "When usable light, water, or carbon dioxide becomes limited, the connected pathway slows.",
      sourceId,
      sourceSegmentId: "",
      sourcePage: 0
    }
  ];
  return {
    ...makeVisualModel(nodes),
    title: "Photosynthesis model",
    objective: "Trace how inputs support glucose production and oxygen release.",
    kind: "system",
    edges: [
      { from: "light-energy", to: "glucose", type: "causes", label: "powers production of" },
      { from: "limiting-input", to: "glucose", type: "related", label: "constrains production of" }
    ],
    check: {
      prompt: "Which product stores captured chemical energy?",
      choices: ["Glucose", "Oxygen", "Water"],
      answer: "Glucose",
      explanation: "The source identifies glucose as the stored-energy product."
    },
    suggestedQuestions: ["Why does glucose store energy?", "How does a limiting input slow photosynthesis?"]
  };
}

function makePhotosynthesisPdfVisualModel(sourceId = "source-photosynthesis-pdf") {
  const nodes = [
    {
      id: "light",
      label: "Light energy",
      symbol: "",
      role: "Energy input",
      detail: "Photosynthesis converts light energy into chemical energy inside chloroplasts.",
      why: "Photosynthesis converts light energy into chemical energy inside chloroplasts.",
      example: "Photosynthesis converts light energy into chemical energy inside chloroplasts.",
      sourceAnchor: "Photosynthesis converts light energy into chemical energy inside chloroplasts.",
      sourceId,
      sourceSegmentId: "",
      sourcePage: 1
    },
    {
      id: "glucose",
      label: "Glucose",
      symbol: "",
      role: "Stored-energy output",
      detail: "Glucose stores captured chemical energy, while oxygen is released during photosynthesis.",
      why: "Glucose stores captured chemical energy, while oxygen is released during photosynthesis.",
      example: "Glucose stores captured chemical energy, while oxygen is released during photosynthesis.",
      sourceAnchor: "Glucose stores captured chemical energy, while oxygen is released during photosynthesis.",
      sourceId,
      sourceSegmentId: "",
      sourcePage: 2
    },
    {
      id: "inputs",
      label: "Matter inputs",
      symbol: "",
      role: "Matter supply",
      detail: "Water and carbon dioxide supply matter, and limiting either input slows the connected pathway.",
      why: "Water and carbon dioxide supply matter, and limiting either input slows the connected pathway.",
      example: "Water and carbon dioxide supply matter, and limiting either input slows the connected pathway.",
      sourceAnchor: "Water and carbon dioxide supply matter, and limiting either input slows the connected pathway.",
      sourceId,
      sourceSegmentId: "",
      sourcePage: 3
    }
  ];
  return {
    ...makeVisualModel(nodes),
    title: "Photosynthesis PDF model",
    objective: "Trace how energy and matter become glucose.",
    kind: "system",
    edges: [
      { from: "light", to: "glucose", type: "causes", label: "powers production of" },
      { from: "inputs", to: "glucose", label: "supplies matter for" }
    ]
  };
}

function preparePhotosynthesisQuizInput(overrides = {}) {
  return prepareQuizArtifactInput({
    sourceType: "notes",
    title: "Photosynthesis",
    noteId: "note-photosynthesis",
    sourceFingerprint: "photosynthesis-fingerprint",
    rawText: photosynthesisText,
    questionCount: 5,
    difficulty: "normal",
    quizStyle: "mixed",
    visualModel: makePhotosynthesisVisualModel(),
    ...overrides
  });
}

function makeRecoveryVisualModel(edges = []) {
  return {
    nodes: [
      { id: "target", label: "Target concept" },
      { id: "prerequisite-a", label: "Prerequisite A" },
      { id: "prerequisite-b", label: "Prerequisite B" },
      { id: "related-a", label: "Related A" },
      { id: "related-b", label: "Related B" }
    ],
    edges
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
    sourceType: "notes",
    title: "Photosynthesis",
    rawText: photosynthesisText,
    questionCount: 5,
    visualModel: makePhotosynthesisVisualModel()
  };
  assert.throws(() => prepareQuizArtifactInput(base), /noteId is required/);
  assert.throws(() => prepareQuizArtifactInput({ ...base, noteId: "note-1" }), /sourceFingerprint is required/);
  assert.throws(() => prepareQuizArtifactInput({
    ...base,
    noteId: "note-1",
    sourceFingerprint: "fingerprint-a",
    sourceBinding: { fingerprint: "fingerprint-b" }
  }), /does not match/);
  assert.throws(() => prepareQuizArtifactInput({
    ...base,
    noteId: "note-1",
    sourceFingerprint: "fingerprint-a",
    questionCount: 5.5
  }), /whole number from 5 to 15/);

  const prepared = prepareQuizArtifactInput({
    ...base,
    noteId: "note-1",
    sourceFingerprint: "fingerprint-a",
    summary: ["Photosynthesis converts light energy into stored chemical energy."],
    visualModel: makePhotosynthesisVisualModel()
  });
  assert.equal(prepared.noteId, "note-1");
  assert.equal(prepared.sourceFingerprint, "fingerprint-a");
  assert.ok(Array.isArray(prepared.summary));
  assert.equal(prepared.visualModel.nodes.length, 3);
  assert.equal(prepared.noteEvidence.noteId, "note-1");
});

test("single-source quizzes require the exact count and reject unrelated question content", () => {
  const input = preparePhotosynthesisQuizInput({ sourceId: "source-photosynthesis-note" });
  const groundedQuestions = Array.from({ length: 5 }, (_, index) => makeQuestion({
    prompt: `Which product stores captured energy according to the photosynthesis note? (${index + 1})`,
    choices: ["Glucose", "Oxygen", "Water", "Carbon dioxide"],
    answer: "Glucose",
    topic: "Photosynthesis",
    questionStyle: index === 0 ? "Application" : index === 1 ? "Comparison" : "Definition",
    cognitiveLevel: index === 0 ? "apply" : "understand",
    explanation: "Photosynthesis converts light energy into chemical energy stored in glucose.",
    sourceText: "Photosynthesis converts light energy into chemical energy stored in glucose.",
    sourceId: "source-photosynthesis-note",
    primaryConceptId: "glucose",
    relatedConceptIds: ["light-energy"]
  }));

  assert.throws(
    () => normalizeQuizArtifact({ title: "Photosynthesis quiz", questions: groundedQuestions.slice(0, 4) }, input),
    /expected 5, received 4/
  );

  const unrelated = [...groundedQuestions];
  unrelated[0] = makeQuestion({
    prompt: "Which Java primitive type stores light energy as a whole integer number?",
    choices: ["int", "double", "char", "boolean"],
    answer: "int",
    topic: "Primitive data types",
    questionStyle: "Application",
    cognitiveLevel: "apply",
    explanation: "Photosynthesis converts light energy into chemical energy stored in glucose.",
    sourceText: "Photosynthesis converts light energy into chemical energy stored in glucose.",
    sourceId: "source-photosynthesis-note",
    primaryConceptId: "glucose",
    relatedConceptIds: ["light-energy"]
  });
  assert.throws(
    () => normalizeQuizArtifact({ title: "Contaminated quiz", questions: unrelated }, input),
    /question answer is not supported by the saved source/
  );

  const normalized = normalizeQuizArtifact({ title: "Photosynthesis quiz", questions: groundedQuestions }, input);
  assert.equal(normalized.questions.length, 5);
});

test("server quiz artifacts receive distinct quiz IDs and globally unique question IDs", () => {
  const input = preparePhotosynthesisQuizInput({ sourceId: "source-photosynthesis-note" });
  const first = normalizeQuizArtifact({
    title: "Photosynthesis quiz",
    questions: makePhotosynthesisQuestions()
  }, input);
  const second = normalizeQuizArtifact({
    title: "Photosynthesis quiz",
    questions: makePhotosynthesisQuestions()
  }, input);

  assert.equal(typeof first.quizId, "string");
  assert.ok(first.quizId.trim());
  assert.equal(typeof second.quizId, "string");
  assert.ok(second.quizId.trim());
  assert.notEqual(first.quizId, second.quizId);

  const firstIds = first.questions.map((question) => question.id);
  const secondIds = second.questions.map((question) => question.id);
  assert.equal(new Set(firstIds).size, firstIds.length);
  assert.equal(new Set(secondIds).size, secondIds.length);
  assert.equal(new Set([...firstIds, ...secondIds]).size, firstIds.length + secondIds.length);
});

test("PDF quiz evidence keeps webpage source type, PDF document type, and the supporting page", () => {
  const input = prepareQuizArtifactInput({
    sourceType: "webpage",
    documentType: "pdf",
    sourceId: "source-photosynthesis-pdf",
    title: "Photosynthesis PDF",
    noteId: "note-photosynthesis-pdf",
    sourceFingerprint: "photosynthesis-pdf-fingerprint",
    rawText: photosynthesisPdfText,
    questionCount: 5,
    difficulty: "normal",
    quizStyle: "mixed",
    visualModel: makePhotosynthesisPdfVisualModel()
  });
  const supportingText = "Glucose stores captured chemical energy, while oxygen is released during photosynthesis.";
  const questions = Array.from({ length: 5 }, (_, index) => makeQuestion({
    prompt: `Which photosynthesis product stores captured chemical energy? (${index + 1})`,
    choices: ["Glucose", "Oxygen", "Water", "Carbon dioxide"],
    answer: "Glucose",
    topic: "Photosynthesis",
    explanation: supportingText,
    sourceText: supportingText,
    sourceId: "source-photosynthesis-pdf",
    sourcePage: 2,
    primaryConceptId: "glucose",
    relatedConceptIds: ["light"]
  }));
  const quiz = normalizeQuizArtifact({ title: "Photosynthesis PDF quiz", questions }, input);

  assert.deepEqual({
    sourceType: quiz.sourceType,
    documentType: quiz.documentType,
    sourcePage: quiz.questions[0].sourcePage
  }, {
    sourceType: "webpage",
    documentType: "pdf",
    sourcePage: 2
  });
});

test("generic non-video quiz evidence retains its stable source ID", () => {
  const input = preparePhotosynthesisQuizInput({ sourceId: "source-photosynthesis-note" });
  const quiz = normalizeQuizArtifact({
    title: "Photosynthesis quiz",
    questions: makePhotosynthesisQuestions({ sourceId: "source-photosynthesis-note" })
  }, input);
  const question = quiz.questions[0];

  assert.notEqual(question.sourceId, "current-video");
  assert.equal(question.sourceId, "source-photosynthesis-note");
  assert.equal(question.sourceRef?.sourceId, "source-photosynthesis-note");
});

test("generic non-video sources never default to the current-video sentinel", () => {
  const input = preparePhotosynthesisQuizInput();
  assert.equal(typeof input.sourceId, "string");
  assert.notEqual(input.sourceId, "current-video");
});

test("visual models preserve typed edges and default untyped edges to related", () => {
  const sourceId = "source-photosynthesis-pdf";
  const visualModel = makePhotosynthesisPdfVisualModel(sourceId);
  const input = prepareStudyNotesInput({
    sourceType: "webpage",
    documentType: "pdf",
    sourceId,
    title: "Photosynthesis PDF",
    sourceFingerprint: "photosynthesis-pdf-fingerprint",
    rawText: photosynthesisPdfText
  });
  const note = normalizeNotes({
    title: "Photosynthesis PDF",
    summary: ["Photosynthesis converts light energy and matter into stored chemical energy."],
    visualLesson: { title: "Photosynthesis", visualModel },
    terms: ["Photosynthesis", "Glucose", "Chloroplast"],
    goals: ["Trace the inputs and outputs"]
  }, input);

  assert.deepEqual(
    note.visualLesson.visualModel.edges.map(({ from, to, type }) => ({ from, to, type })),
    [
      { from: "light", to: "glucose", type: "causes" },
      { from: "inputs", to: "glucose", type: "related" }
    ]
  );
});

test("PDF visual-note nodes retain their supporting sourcePage values", () => {
  const sourceId = "source-photosynthesis-pdf";
  const input = prepareStudyNotesInput({
    sourceType: "webpage",
    documentType: "pdf",
    sourceId,
    title: "Photosynthesis PDF",
    sourceFingerprint: "photosynthesis-pdf-fingerprint",
    rawText: photosynthesisPdfText
  });
  const note = normalizeNotes({
    title: "Photosynthesis PDF",
    summary: ["Photosynthesis converts light energy and matter into stored chemical energy."],
    visualLesson: { title: "Photosynthesis", visualModel: makePhotosynthesisPdfVisualModel(sourceId) },
    terms: ["Photosynthesis", "Glucose", "Chloroplast"],
    goals: ["Trace the inputs and outputs"]
  }, input);

  assert.deepEqual(
    note.visualLesson.visualModel.nodes.map((node) => node.sourcePage),
    [1, 2, 3]
  );
});

test("quiz schema and prompt expose explicit concept-link and source-page fields", () => {
  const schema = getResponseSchema("quiz_only");
  const notesSchema = getResponseSchema("study_notes");
  const questionProperties = schema.properties.questions.items.properties;
  const visualModelProperties = notesSchema.properties.visualLesson.properties.visualModel.properties;
  const input = preparePhotosynthesisQuizInput({
    sourceId: "source-photosynthesis-note",
    visualModel: makePhotosynthesisVisualModel()
  });
  const prompt = buildQuizOnlyPrompt(input);

  assert.deepEqual({
    primaryConceptId: Boolean(questionProperties.primaryConceptId),
    relatedConceptIds: Boolean(questionProperties.relatedConceptIds),
    sourcePage: Boolean(questionProperties.sourcePage),
    nodeSourcePage: Boolean(visualModelProperties.nodes.items.properties.sourcePage),
    edgeType: Boolean(visualModelProperties.edges.items.properties.type),
    promptPrimaryConceptId: /primaryConceptId/.test(prompt),
    promptRelatedConceptIds: /relatedConceptIds/.test(prompt)
  }, {
    primaryConceptId: true,
    relatedConceptIds: true,
    sourcePage: true,
    nodeSourcePage: true,
    edgeType: true,
    promptPrimaryConceptId: true,
    promptRelatedConceptIds: true
  });
});

test("quiz questions retain valid primary and related concept IDs from the saved note", () => {
  const sourceId = "source-photosynthesis-note";
  const input = preparePhotosynthesisQuizInput({
    sourceId,
    visualModel: makePhotosynthesisVisualModel()
  });
  const questions = makePhotosynthesisQuestions({
    sourceId,
    primaryConceptId: "glucose",
    relatedConceptIds: ["light-energy"]
  });
  const quiz = normalizeQuizArtifact({ title: "Photosynthesis quiz", questions }, input);

  assert.deepEqual(
    quiz.questions.map(({ primaryConceptId, relatedConceptIds }) => ({ primaryConceptId, relatedConceptIds })),
    Array.from({ length: 5 }, () => ({
      primaryConceptId: "glucose",
      relatedConceptIds: ["light-energy"]
    }))
  );
});

test("quiz questions reject an unknown primaryConceptId", () => {
  const sourceId = "source-photosynthesis-note";
  const input = preparePhotosynthesisQuizInput({
    sourceId,
    visualModel: makePhotosynthesisVisualModel()
  });
  const questions = makePhotosynthesisQuestions({
    sourceId,
    primaryConceptId: "not-a-note-concept",
    relatedConceptIds: ["light-energy"]
  });

  assert.throws(
    () => normalizeQuizArtifact({ title: "Photosynthesis quiz", questions }, input),
    /primaryConceptId|primary concept/i
  );
});

test("quiz questions reject unknown relatedConceptIds", () => {
  const sourceId = "source-photosynthesis-note";
  const input = preparePhotosynthesisQuizInput({
    sourceId,
    visualModel: makePhotosynthesisVisualModel()
  });
  const questions = makePhotosynthesisQuestions({
    sourceId,
    primaryConceptId: "glucose",
    relatedConceptIds: ["not-a-note-concept"]
  });

  assert.throws(
    () => normalizeQuizArtifact({ title: "Photosynthesis quiz", questions }, input),
    /relatedConceptIds|related concept/i
  );
});

const recoveryCompositionSkip = typeof buildRecoveryComposition === "function"
  ? false
  : "buildRecoveryComposition must be exported from server.js for direct contract coverage";

test("recovery composition prefers three target questions and two explicit prerequisites", {
  skip: recoveryCompositionSkip
}, () => {
  const model = makeRecoveryVisualModel([
    { from: "prerequisite-a", to: "target", type: "prerequisite_of" },
    { from: "prerequisite-b", to: "target", type: "prerequisite_of" },
    { from: "target", to: "related-a", type: "related" }
  ]);
  const composition = buildRecoveryComposition(model, "target");

  assert.deepEqual({
    targetQuestionCount: composition.targetQuestionCount,
    prerequisiteQuestionCount: composition.prerequisiteQuestionCount,
    relatedQuestionCount: composition.relatedQuestionCount,
    extraTargetQuestionCount: composition.extraTargetQuestionCount,
    prerequisiteConceptIds: composition.prerequisiteConceptIds
  }, {
    targetQuestionCount: 3,
    prerequisiteQuestionCount: 2,
    relatedQuestionCount: 0,
    extraTargetQuestionCount: 0,
    prerequisiteConceptIds: ["prerequisite-a", "prerequisite-b"]
  });
  assert.equal(composition.description, "Actual recovery composition: 3 target, 2 prerequisite.");
});

test("recovery composition falls back to related concepts before extra target questions", {
  skip: recoveryCompositionSkip
}, () => {
  const twoRelated = buildRecoveryComposition(makeRecoveryVisualModel([
    { from: "target", to: "related-a", type: "related" },
    { from: "related-b", to: "target", type: "related" }
  ]), "target");
  const oneRelated = buildRecoveryComposition(makeRecoveryVisualModel([
    { from: "target", to: "related-a", type: "related" }
  ]), "target");
  const targetOnly = buildRecoveryComposition(makeRecoveryVisualModel(), "target");

  assert.deepEqual(
    [twoRelated, oneRelated, targetOnly].map((item) => ({
      target: item.targetQuestionCount,
      prerequisite: item.prerequisiteQuestionCount,
      related: item.relatedQuestionCount,
      extraTarget: item.extraTargetQuestionCount,
      description: item.description
    })),
    [
      {
        target: 3,
        prerequisite: 0,
        related: 2,
        extraTarget: 0,
        description: "Actual recovery composition: 3 target, 2 related."
      },
      {
        target: 4,
        prerequisite: 0,
        related: 1,
        extraTarget: 1,
        description: "Actual recovery composition: 4 target, 1 related, 1 extra target fallback."
      },
      {
        target: 5,
        prerequisite: 0,
        related: 0,
        extraTarget: 2,
        description: "Actual recovery composition: 5 target, 2 extra target fallback."
      }
    ]
  );
});

test("recovery prerequisites use only prerequisite_of edges directed source to target", {
  skip: recoveryCompositionSkip
}, () => {
  const composition = buildRecoveryComposition(makeRecoveryVisualModel([
    { from: "target", to: "prerequisite-a", type: "prerequisite_of" },
    { from: "prerequisite-b", to: "related-a", type: "prerequisite_of" }
  ]), "target");

  assert.deepEqual(composition.prerequisiteConceptIds, []);
  assert.equal(composition.prerequisiteQuestionCount, 0);
  assert.equal(composition.targetQuestionCount, 5);
});

const recoveryPromptSkip = typeof buildRecoveryComposition === "function" && typeof buildRecoveryQuizPrompt === "function"
  ? false
  : "buildRecoveryComposition and buildRecoveryQuizPrompt must be exported from server.js";

test("recovery prompt discloses the actual graph-backed composition", {
  skip: recoveryPromptSkip
}, () => {
  const visualModel = makePhotosynthesisVisualModel();
  const input = preparePhotosynthesisQuizInput({
    sourceId: "source-photosynthesis-note",
    visualModel
  });
  const recoveryComposition = buildRecoveryComposition(visualModel, "glucose");
  const prompt = buildRecoveryQuizPrompt({
    ...input,
    targetConceptId: "glucose",
    recoveryComposition
  });

  assert.match(prompt, new RegExp(`Actual composition disclosure: ${recoveryComposition.description.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
  assert.match(prompt, /prerequisite_of edge pointing from that concept to glucose/);
});

test("condensed quiz prompts keep note evidence and concept IDs but omit an unrelated raw-text tail", () => {
  const tailMarker = "UNRELATED_RAW_TEXT_TAIL_MUST_NOT_REACH_THE_QUIZ_PROMPT";
  const unrelatedAppendix = Array.from(
    { length: 80 },
    (_, index) => `Neutral archival appendix item ${index + 1} contains unrelated padding.`
  ).join(" ");
  const rawText = `${photosynthesisText} ${unrelatedAppendix} ${tailMarker}`;
  const input = preparePhotosynthesisQuizInput({
    sourceId: "source-photosynthesis-note",
    rawText,
    sourceFingerprint: "photosynthesis-with-tail-fingerprint"
  });
  const prompt = buildQuizOnlyPrompt(input);

  assert.match(prompt, /Condensed immutable note evidence:/);
  assert.match(prompt, /"id":"light-energy"/);
  assert.match(prompt, /"id":"glucose"/);
  assert.doesNotMatch(prompt, new RegExp(tailMarker));
});

const retryCorrectionSkip = typeof appendRetryCorrection === "function"
  ? false
  : "appendRetryCorrection must be exported from server.js for direct contract coverage";

test("retry correction names concept, grounding, count, and collection-coverage failures", {
  skip: retryCorrectionSkip
}, () => {
  const concept = appendRetryCorrection("BASE PROMPT", new Error("unknown primary concept"));
  const grounding = appendRetryCorrection("BASE PROMPT", new Error("citation is not supported by the saved source"));
  const count = appendRetryCorrection("BASE PROMPT", new Error("too few valid quiz questions"));
  const collectionCoverage = appendRetryCorrection(
    "BASE PROMPT",
    new Error("missing grounded collection source coverage for saved source IDs: source-b")
  );

  assert.match(concept, /missing or unknown concept ID/i);
  assert.match(grounding, /not supported by the cited evidence/i);
  assert.match(count, /wrong question count/i);
  assert.match(collectionCoverage, /every supplied saved source ID/i);
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
    videoSegments,
    visualModel: makeVideoVisualModel()
  });
  assert.match(buildNotesPrompt(noteInput), /Do not create quiz questions/);
  const quizPrompt = buildQuizOnlyPrompt(quizInput);
  const responseShape = quizPrompt.slice(0, quizPrompt.indexOf("Rules:"));
  assert.doesNotMatch(responseShape, /"visualLesson"\s*:/);
  assert.doesNotMatch(responseShape, /"summary"\s*:/);
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
    sourceType: "video",
    documentType: "",
    sourceId: "current-video",
    sourceFingerprint: "video-fingerprint",
    segmentId: "seg-0001",
    startMs: 12000,
    endMs: 18000,
    quote: videoSegments[0].text,
    url: "https://www.youtube.com/watch?v=abcDEF12345",
    sourcePage: 0
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
    quizStyle: "definition",
    visualModel: note.visualLesson.visualModel
  });
  const quiz = normalizeQuizArtifact({
    title: "Transport quiz",
    questions: Array.from({ length: 5 }, (_, index) => makeQuestion({
      prompt: `Which statement describes diffusion? (${index + 1})`,
      sourceSegmentId: "seg-0001",
      primaryConceptId: "node-1",
      relatedConceptIds: []
    }))
  }, quizInput);
  assert.equal(quiz.questions[0].sourceTimestamp, 12);
  assert.equal(quiz.questions[0].sourceRef.segmentId, "seg-0001");
});

test("video visual nodes repair claims contaminated beyond their exact transcript segment", () => {
  const input = prepareStudyNotesInput({
    sourceType: "video",
    title: "Transport video",
    sourceUrl: "https://www.youtube.com/watch?v=abcDEF12345",
    sourceFingerprint: "video-fingerprint",
    rawText: videoSegments.map((segment) => segment.text).join(" "),
    videoSegments
  });
  const visualModel = makeVideoVisualModel();
  visualModel.nodes[0] = {
    ...visualModel.nodes[0],
    label: "Java primitive type",
    detail: "A Java int stores a whole-number value.",
    sourceAnchor: videoSegments[0].text,
    example: videoSegments[0].text
  };

  const note = normalizeNotes({
    title: "Transport video",
    summary: ["Membrane transport follows gradients or uses energy."],
    visualLesson: { title: "Transport", visualModel },
    terms: ["Diffusion", "Osmosis", "Active transport"],
    goals: ["Compare transport mechanisms"]
  }, input);

  const repaired = note.visualLesson.visualModel.nodes.find((node) => node.id === "node-1");
  assert.ok(repaired);
  assert.equal(repaired.sourceSegmentId, "seg-0001");
  assert.match(repaired.detail, /diffusion moves particles down a concentration gradient/i);
  assert.doesNotMatch(JSON.stringify(repaired), /Java int|primitive type/i);
});

test("cheat-sheet grounding repairs one bad row instead of rejecting the generated note", () => {
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
    visualLesson: { title: "Transport", visualModel: makeVideoVisualModel() },
    cheatSheet: { rows: [{
      topic: "Java primitive type",
      mainIdea: "A Java int stores a whole-number value.",
      keyFacts: "Primitive types are built into Java.",
      example: "The value 42 uses int.",
      sourceSegmentId: "seg-0001",
      sourceAnchor: videoSegments[0].text
    }] },
    terms: ["Diffusion", "Osmosis", "Active transport"],
    goals: ["Compare transport mechanisms"]
  }, input);

  assert.ok(note.cheatSheet.rows.length >= 3);
  assert.doesNotMatch(JSON.stringify(note.cheatSheet), /Java int|primitive type|value 42/i);
  assert.match(note.cheatSheet.rows[0].mainIdea, /Diffusion moves particles down a concentration gradient/i);
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
      why: "Cell membranes control transport through selective permeability.",
      example: "Cell membranes control transport through selective permeability.",
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
      why: "Diffusion moves particles down a concentration gradient.",
      example: "Diffusion moves particles down a concentration gradient.",
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
      why: "Cell membranes control transport through selective permeability.",
      example: "Cell membranes control transport through selective permeability.",
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
    quizStyle: "definition",
    visualModel: note.visualLesson.visualModel
  });
  const questions = Array.from({ length: 5 }, (_, index) => makeQuestion({
    prompt: `Which statement describes diffusion? (${index + 1})`,
    sourceId: "source-b",
    primaryConceptId: "diffusion",
    relatedConceptIds: ["membrane"]
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

test("collection visual notes reject a valid grounded model that omits an included source", () => {
  const input = prepareStudyNotesInput({
    sourceType: "collection",
    title: "Transport collection",
    sourceFingerprint: "collection-fingerprint",
    rawText: collectionText,
    collectionSources
  });
  const visualModel = makeVisualModel(makeCollectionCoverageNodes([
    "source-a",
    "source-a",
    "source-a"
  ]));

  assert.throws(
    () => normalizeNotes({
      title: "Transport collection",
      summary: ["Cell membranes regulate transport."],
      visualLesson: { title: "Transport", visualModel },
      terms: [],
      goals: []
    }, input),
    /collection source coverage.*source-b/i
  );
});

test("collection visual notes accept grounded node coverage for every included source", () => {
  const input = prepareStudyNotesInput({
    sourceType: "collection",
    title: "Transport collection",
    sourceFingerprint: "collection-fingerprint",
    rawText: collectionText,
    collectionSources
  });
  const visualModel = makeVisualModel(makeCollectionCoverageNodes([
    "source-a",
    "source-b",
    "source-a"
  ]));
  const note = normalizeNotes({
    title: "Transport collection",
    summary: ["Selective membranes and gradients shape transport."],
    visualLesson: { title: "Transport", visualModel },
    terms: [],
    goals: []
  }, input);

  assert.deepEqual(
    [...new Set(note.visualLesson.visualModel.nodes.map((node) => node.sourceId))].sort(),
    ["source-a", "source-b"]
  );
});

test("collection visual nodes repair claims contaminated beyond their exact saved source", () => {
  const input = prepareStudyNotesInput({
    sourceType: "collection",
    title: "Transport collection",
    sourceFingerprint: "collection-fingerprint",
    rawText: collectionText,
    collectionSources
  });
  const nodes = [
    {
      id: "membrane",
      label: "Java primitive type",
      symbol: "",
      role: "Boundary",
      detail: "A Java int stores a whole-number value.",
      why: "Cell membranes control transport through selective permeability.",
      example: "Cell membranes control transport through selective permeability.",
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
      why: "Diffusion moves particles down a concentration gradient.",
      example: "Diffusion moves particles down a concentration gradient.",
      sourceAnchor: "Diffusion moves particles down a concentration gradient.",
      sourceSegmentId: "",
      sourceId: "source-b"
    },
    {
      id: "relationship",
      label: "Selective permeability",
      symbol: "",
      role: "Connection",
      detail: "Cell membranes control transport through selective permeability.",
      why: "Cell membranes control transport through selective permeability.",
      example: "Cell membranes control transport through selective permeability.",
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
  }, input);
  const repaired = note.visualLesson.visualModel.nodes.find((node) => node.id === "membrane");
  assert.ok(repaired);
  assert.equal(repaired.sourceId, "source-a");
  assert.match(repaired.detail, /Cell membranes control transport through selective permeability/i);
  assert.doesNotMatch(JSON.stringify(repaired), /Java int|primitive type/i);
});

function makeUsableRawVisualModel({ scenarioCount = 2, nodeCount = 3, brokenScenario = false } = {}) {
  const nodes = [];
  for (let index = 0; index < nodeCount; index += 1) {
    nodes.push({
      id: `n${index + 1}`,
      label: `Concept ${index + 1}`,
      detail: `Concept ${index + 1} is grounded in the source material.`
    });
  }
  const scenarios = [];
  for (let index = 0; index < scenarioCount; index += 1) {
    scenarios.push({
      id: `s${index + 1}`,
      label: `Scenario ${index + 1}`,
      activeIds: brokenScenario ? ["does-not-exist"] : ["n1"],
      values: [],
      outcome: "The active concept drives the outcome.",
      insight: "Use the active relationship to explain the result."
    });
  }
  return {
    title: "Model",
    objective: "Understand how the concepts connect.",
    kind: "system",
    nodes,
    edges: [],
    scenarios,
    check: {
      question: "Which concept is active?",
      choices: ["Increases the rate", "Decreases the rate", "Stops the process"],
      answer: "Increases the rate"
    },
    suggestedQuestions: []
  };
}

test("assertVisualModelUsable tolerates fewer than 2 scenarios when scenarios are not required", () => {
  const rawModel = makeUsableRawVisualModel({ scenarioCount: 1 });
  assert.doesNotThrow(() => assertVisualModelUsable(rawModel, { requireScenarios: false }));
});

test("assertVisualModelUsable still requires 2 scenarios by default", () => {
  const rawModel = makeUsableRawVisualModel({ scenarioCount: 1 });
  assert.throws(() => assertVisualModelUsable(rawModel), /fewer than 2 usable scenarios/);
});

test("assertVisualModelUsable still rejects a broken scenario even when scenarios are optional", () => {
  const rawModel = makeUsableRawVisualModel({ scenarioCount: 2, brokenScenario: true });
  assert.throws(
    () => assertVisualModelUsable(rawModel, { requireScenarios: false }),
    /scenario with no valid active node IDs/
  );
});

test("assertVisualModelUsable still fast-fails on too few nodes when scenarios are optional", () => {
  const rawModel = makeUsableRawVisualModel({ scenarioCount: 1, nodeCount: 2 });
  assert.throws(
    () => assertVisualModelUsable(rawModel, { requireScenarios: false }),
    /fewer than 3 usable nodes/
  );
});

test("normalizeNotes pads a single-scenario AI model up to two grounded scenarios", () => {
  const input = prepareStudyNotesInput({
    sourceType: "notes",
    title: "Photosynthesis",
    sourceFingerprint: "photosynthesis-fingerprint",
    rawText: photosynthesisText
  });
  const singleScenarioModel = makePhotosynthesisVisualModel();
  singleScenarioModel.scenarios = singleScenarioModel.scenarios.slice(0, 1);
  assert.equal(singleScenarioModel.scenarios.length, 1);

  const note = normalizeNotes({
    title: "Photosynthesis",
    summary: ["Photosynthesis converts light energy into chemical energy stored in glucose."],
    visualLesson: { title: "Photosynthesis", visualModel: singleScenarioModel },
    terms: [],
    goals: []
  }, input);

  assert.ok(note.visualLesson.visualModel.scenarios.length >= 2);
});

test("normalizeSession tolerates a single-scenario AI model and pads it after normalization", () => {
  const input = preparePhotosynthesisQuizInput({ sourceId: "source-photosynthesis-note" });
  const singleScenarioModel = makePhotosynthesisVisualModel();
  singleScenarioModel.scenarios = singleScenarioModel.scenarios.slice(0, 1);
  assert.equal(singleScenarioModel.scenarios.length, 1);

  const session = {
    title: "Photosynthesis",
    summary: ["Photosynthesis converts light energy into chemical energy stored in glucose."],
    visualLesson: { title: "Photosynthesis", visualModel: singleScenarioModel },
    questions: makePhotosynthesisQuestions({ sourceId: "source-photosynthesis-note" })
  };

  const normalized = normalizeSession(session, input);
  assert.ok(normalized.visualLesson.visualModel.scenarios.length >= 2);
});

test("strips unsupported item-count keywords from every Gemini schema path only", () => {
  const findUnsupportedKeyword = (value) => {
    if (Array.isArray(value)) return value.some(findUnsupportedKeyword);
    if (!value || typeof value !== "object") return false;
    return Object.entries(value).some(([key, child]) => (
      key === "minItems" || key === "maxItems" || findUnsupportedKeyword(child)
    ));
  };

  const studyNotesSchema = getResponseSchema("study_notes");
  assert.equal(findUnsupportedKeyword(studyNotesSchema), true, "provider-neutral schema retains count guidance");
  for (const schemaName of [
    "study_notes",
    "quiz_only",
    "visual_followup",
    "journey_summary",
    "classify_sources",
    "video_transcript",
    "quiz_session"
  ]) {
    assert.equal(findUnsupportedKeyword(stripGeminiUnsupportedSchemaKeywords(getResponseSchema(schemaName))), false, schemaName);
  }
});
