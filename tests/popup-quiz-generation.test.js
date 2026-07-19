const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "popup.js"), "utf8");

const photosynthesisSource = "Photosynthesis converts light energy into chemical energy stored in glucose. Water and carbon dioxide supply matter to the connected reactions inside chloroplasts. Glucose stores captured energy, while oxygen is released. When usable light, water, or carbon dioxide becomes limited, the connected pathway slows and downstream outputs change.";
const genericVocabularySource = [
  "Students will answer the first question by choosing the correct statement about cellular respiration and energy transfer.",
  "A learner will choose the best answer when a question tests how mitochondria release usable energy from glucose.",
  "The following example will help a student decide which choice correctly describes oxygen during aerobic respiration.",
  "This lesson note will ask what source statement best explains carbon dioxide production and ATP synthesis."
].join(" ");
const accentedSpanishSource = [
  "Las plantas convierten la luz solar mediante energía química almacenada en glucosa.",
  "Las hojas absorben carbono gaseoso y liberan oxígeno hacia la atmósfera cercana.",
  "Los cloroplastos coordinan reacciones conectadas dentro de células vegetales activas.",
  "La disponibilidad hídrica limita procesos metabólicos durante periodos ambientales secos."
].join(" ");

function sourceBetween(startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.ok(start >= 0, `Missing ${startMarker}`);
  assert.ok(end > start, `Missing ${endMarker}`);
  return source.slice(start, end).trim();
}

function createLocalQuizHarness() {
  return vm.runInNewContext(`(() => {
    ${sourceBetween("const STOP_WORDS = new Set([", "const state = {")}
    ${sourceBetween("const QUIZ_GROUNDING_STOP_WORDS = new Set([", "function validateGeneratedQuiz(")}
    ${sourceBetween("function isLocalBoilerplateText(value)", "function hasChromeTabs()")}
    return { normalizeText, getSentences, getImportantTerms, buildSummary, buildConceptQuestions, hasWholeWord, makeConceptLabel, isQuizAnswerSupported, assertQuizGroundedInSource };
  })()`, {
    crypto: { randomUUID: crypto.randomUUID }
  });
}

test("the local Photosynthesis demo returns exactly five source-grounded questions", () => {
  const harness = createLocalQuizHarness();
  const cleaned = harness.normalizeText(photosynthesisSource);
  const sentences = harness.getSentences(cleaned);
  const summary = harness.buildSummary(sentences, harness.getImportantTerms(cleaned));
  assert.equal(harness.hasWholeWord(cleaned, "int"), false, "'into' must not match the Java int keyword");
  for (const requestedCount of [5, 10, 15]) {
    const questions = harness.buildConceptQuestions(cleaned, sentences, summary, requestedCount, "normal", "mixed");
    assert.equal(questions.length, requestedCount);
    harness.assertQuizGroundedInSource({ questions }, photosynthesisSource, "The local quiz backup");
    for (const question of questions) {
      assert.equal(question.choices.length, 4);
      assert.equal(new Set(question.choices.map((choice) => choice.toLowerCase())).size, 4);
      assert.ok(question.choices.includes(question.answer));
      assert.ok(photosynthesisSource.includes(question.sourceText), question.sourceText);

      const content = [question.prompt, question.answer, question.explanation, question.hint, ...question.choices].join(" ");
      assert.doesNotMatch(content, /\b(?:java|primitive|int|boolean|char|string)\b|object creation/i);
      assert.match(content, /\b(?:photosynthesis|light|energy|glucose|water|carbon|dioxide|chloroplasts?|oxygen|pathway|outputs?)\b/i);
      for (const choice of question.choices) {
        assert.ok(photosynthesisSource.toLowerCase().includes(choice.toLowerCase()), `Choice is not sourced from the note: ${choice}`);
      }
    }
  }
});

test("the local fallback excludes Wikipedia chrome from its source sentences and choices", () => {
  const harness = createLocalQuizHarness();
  const sourceWithChrome = [
    "Jump to content",
    "From Wikipedia, the free encyclopedia",
    "Wiki Loves Earth: Upload photos to help win exciting prizes!",
    photosynthesisSource
  ].join("\n");
  const cleaned = harness.normalizeText(sourceWithChrome);
  const sentences = harness.getSentences(cleaned);
  const summary = harness.buildSummary(sentences, harness.getImportantTerms(cleaned));
  const questions = harness.buildConceptQuestions(cleaned, sentences, summary, 5, "normal", "mixed");

  assert.doesNotMatch(cleaned, /Jump to content|From Wikipedia|Wiki Loves Earth|Upload photos|win exciting prizes/i);
  assert.ok(sentences.every((sentence) => !/upload|win|wikipedia|jump to content/i.test(sentence)));
  assert.doesNotMatch(JSON.stringify(questions), /upload|win exciting prizes|wikipedia|jump to content/i);
  harness.assertQuizGroundedInSource({ questions }, photosynthesisSource, "The local quiz backup");
});

test("local concept labels collapse repeated phrase fragments", () => {
  const harness = createLocalQuizHarness();
  assert.equal(
    harness.makeConceptLabel("Light dependent reactions light dependent reactions convert energy."),
    "Light Dependent Reactions Convert"
  );
});

test("client grounding does not auto-pass unsupported generic answer words", () => {
  const harness = createLocalQuizHarness();
  const evidence = "Photosynthesis converts light energy into chemical energy stored in glucose.";
  assert.equal(harness.isQuizAnswerSupported(photosynthesisSource, evidence, "Glucose"), true);
  assert.equal(harness.isQuizAnswerSupported(photosynthesisSource, evidence, "Higher"), false);
  assert.equal(harness.isQuizAnswerSupported(photosynthesisSource, evidence, "True"), false);
});

test("the quiz service boundary rejects partial and ungrounded responses", async () => {
  let responseQuestions = 4;
  let contaminated = false;
  let semanticVerified = true;
  const quizId = "quiz-service-boundary";
  const groundedQuestion = (index) => ({
    id: `${quizId}-q-${String(index + 1).padStart(3, "0")}`,
    prompt: `Which product stores captured energy according to the photosynthesis note? (${index + 1})`,
    choices: ["Glucose", "Oxygen", "Water", "Carbon dioxide"],
    answer: "Glucose",
    primaryConceptId: "photosynthesis",
    relatedConceptIds: [],
    explanation: "Photosynthesis converts light energy into chemical energy stored in glucose.",
    sourceText: "Photosynthesis converts light energy into chemical energy stored in glucose."
  });
  const contaminatedQuestion = (index) => ({
    id: `${quizId}-q-${String(index + 1).padStart(3, "0")}`,
    prompt: "Which Java primitive type stores light energy as a whole integer number?",
    choices: ["int", "double", "char", "boolean"],
    answer: "int",
    primaryConceptId: "photosynthesis",
    relatedConceptIds: [],
    explanation: "Photosynthesis converts light energy into chemical energy stored in glucose.",
    sourceText: "Photosynthesis converts light energy into chemical energy stored in glucose."
  });
  const context = {
    fetch: async () => ({
      ok: true,
      json: async () => ({
        quizId,
        groundingVerification: semanticVerified ? {
          lexical: "passed",
          semantic: "passed",
          checkedAnswers: responseQuestions,
          provider: "openai",
          model: "test-model"
        } : undefined,
        questions: Array.from(
          { length: responseQuestions },
          (_, index) => contaminated ? contaminatedQuestion(index) : groundedQuestion(index)
        )
      })
    }),
    startSimulatedProgress: () => () => {},
    updateGenerationProgress: () => {},
    getBackendHeaders: () => ({})
  };
  const harness = vm.runInNewContext(`(() => {
    ${sourceBetween("const STOP_WORDS = new Set([", "const state = {")}
    ${sourceBetween("function assertExactQuizQuestionCount(", "function generateLocalQuizArtifact(")}
    return { generateQuizWithBackend };
  })()`, context);
  const input = {
    questionCount: 5,
    rawText: photosynthesisSource,
    visualModel: { nodes: [{ id: "photosynthesis", label: "Photosynthesis" }] }
  };

  await assert.rejects(
    harness.generateQuizWithBackend("https://example.test/api/quiz", input, {}),
    /returned 4 questions; expected exactly 5/
  );

  responseQuestions = 5;
  const result = await harness.generateQuizWithBackend("https://example.test/api/quiz", input, {});
  assert.equal(result.questions.length, 5);

  semanticVerified = false;
  await assert.rejects(
    harness.generateQuizWithBackend("https://example.test/api/quiz", input, {}),
    /did not provide semantic grounding verification for every quiz answer/i
  );

  semanticVerified = true;
  contaminated = true;
  await assert.rejects(
    harness.generateQuizWithBackend("https://example.test/api/quiz", input, {}),
    /answer that is not supported by the saved source/
  );
});

test("offline quiz generation reports a successful 15-question fallback without error styling", () => {
  const harness = vm.runInNewContext(`(() => {
    ${sourceBetween("function isStudyServiceUnreachableError(", "async function handleGenerateQuiz(")}
    return { isStudyServiceUnreachableError, getQuizGenerationErrorMessage, getQuizGenerationCompletionStatus };
  })()`);
  const networkError = { name: "TypeError", message: "Failed to fetch", cause: { code: "ECONNREFUSED" } };
  const offline = harness.getQuizGenerationCompletionStatus({
    questionCount: 15,
    usedLocalFallback: true,
    localFallbackError: networkError
  });
  assert.match(offline.message, /^Quiz ready: 15 source-grounded questions generated locally\./i);
  assert.match(offline.message, /AI study service could not be reached/i);
  assert.doesNotMatch(offline.message, /backup quiz was generated instead/i);
  assert.equal(offline.isError, false);

  const saveFailure = harness.getQuizGenerationCompletionStatus({
    questionCount: 15,
    usedLocalFallback: true,
    localFallbackError: networkError,
    journeySaveError: new Error("storage unavailable")
  });
  assert.equal(saveFailure.isError, true);
  assert.match(saveFailure.message, /Journey could not be updated: storage unavailable/);

  const groundingError = "Cheat-sheet row 1 key facts is not supported by the saved source.";
  assert.equal(harness.getQuizGenerationErrorMessage(new Error(groundingError)), groundingError);

  const generation = sourceBetween("async function handleGenerateQuiz(", "async function handleGenerateRecoveryQuiz(");
  assert.ok(generation.indexOf("closeQuizSettingsDialog();") < generation.indexOf("renderSession(combined);"));
  assert.match(generation, /catch \(error\) \{\s*closeQuizSettingsDialog\(\);\s*failProgress/);
  assert.match(generation, /showStatus\(completion\.message, completion\.isError\)/);
});

test("chapter visual-note generation combines saved artifact snapshots and enforces collection coverage", () => {
  const handler = sourceBetween("async function handleBuildChapterLesson(", "async function handleSummarizeJourney(");
  assert.match(handler, /getStorage\(STORAGE_KEYS\.sessions, \[\]\)/);
  assert.match(handler, /buildChapterCollectionPayload\(chapter, savedArtifacts\)/);
  assert.match(handler, /visualNoteCount: collection\.visualNoteCount/);
  assert.match(handler, /sourceSnapshotCount: collection\.sourceSnapshotCount/);

  const localCollection = sourceBetween("function buildLocalCollectionVisualLesson(", "async function createStudySession(");
  assert.match(localCollection, /sourceId,/);
  assert.match(localCollection, /collectionSources/);
  assert.match(source, /assertCollectionVisualSourceCoverage\(grounded, input\.collectionSources\)/);
});

test("the offline combined-note fallback creates a grounded node for every source snapshot", () => {
  const harness = vm.runInNewContext(`(() => {
    ${sourceBetween("const STOP_WORDS = new Set([", "const state = {")}
    ${sourceBetween("function assertCollectionVisualSourceCoverage(", "function normalizeSavedVisualNote(")}
    ${sourceBetween("function buildLocalCollectionVisualLesson(", "async function createStudySession(")}
    ${sourceBetween("function buildLocalVisualLesson(", "function hasChromeTabs()")}
    return { buildLocalCollectionVisualLesson, assertCollectionVisualSourceCoverage };
  })()`, {
    crypto: { randomUUID: crypto.randomUUID },
    synthesizeVisualModel: () => ({ nodes: [], edges: [], scenarios: [], check: {} })
  });
  const sources = [{
    id: "source-light",
    type: "webpage",
    title: "Light reactions",
    fingerprint: "fp-light",
    excerpt: "Light-dependent reactions capture solar energy and produce oxygen from water inside chloroplasts."
  }, {
    id: "source-carbon",
    type: "webpage",
    title: "Carbon fixation",
    fingerprint: "fp-carbon",
    excerpt: "Carbon fixation uses carbon dioxide to build energy-rich sugars during photosynthesis."
  }];
  const text = sources.map((item) => item.excerpt).join(" ");
  const lesson = harness.buildLocalCollectionVisualLesson(
    text,
    sources.map((item) => item.excerpt),
    ["Photosynthesis", "Energy"],
    sources,
    ""
  );

  assert.deepEqual(
    [...lesson.visualModel.nodes.map((node) => node.sourceId)],
    ["source-light", "source-carbon"]
  );
  assert.equal(harness.assertCollectionVisualSourceCoverage({ visualLesson: lesson }, sources), true);
});

test("local 10- and 15-question backups skip validator-only vocabulary", () => {
  const harness = createLocalQuizHarness();
  const cleaned = harness.normalizeText(genericVocabularySource);
  const sentences = harness.getSentences(cleaned);
  const summary = harness.buildSummary(sentences, harness.getImportantTerms(cleaned));

  for (const requestedCount of [10, 15]) {
    const questions = harness.buildConceptQuestions(cleaned, sentences, summary, requestedCount, "normal", "mixed");
    assert.equal(questions.length, requestedCount);
    harness.assertQuizGroundedInSource({ questions }, genericVocabularySource, "The local quiz backup");
    for (const question of questions) {
      assert.doesNotMatch(question.answer, /^(?:will|answer|question|choice|correct|example|lesson|note|source|statement|student|choose|following)$/i);
    }
  }
});

test("local 10- and 15-question backups keep accented source terms whole and grounded", () => {
  const harness = createLocalQuizHarness();
  const cleaned = harness.normalizeText(accentedSpanishSource);
  const sentences = harness.getSentences(cleaned);
  const summary = harness.buildSummary(sentences, harness.getImportantTerms(cleaned));
  const exactSourceToken = (value) => {
    const escaped = String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(?:^|[^\\p{L}\\p{N}])${escaped}(?=$|[^\\p{L}\\p{N}])`, "iu");
  };

  for (const requestedCount of [10, 15]) {
    const questions = harness.buildConceptQuestions(cleaned, sentences, summary, requestedCount, "normal", "mixed");
    assert.equal(questions.length, requestedCount);
    harness.assertQuizGroundedInSource({ questions }, accentedSpanishSource, "The local quiz backup");
    for (const question of questions) {
      assert.doesNotMatch(question.prompt, /\p{L}_{5}|_{5}\p{L}/u, "a cloze blank must replace a whole Unicode word");
      for (const choice of question.choices) {
        assert.match(accentedSpanishSource, exactSourceToken(choice), `Choice is not a whole source token: ${choice}`);
      }
    }
  }
});
