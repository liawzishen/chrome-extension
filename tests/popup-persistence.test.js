const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "popup.js"), "utf8");

function functionBody(startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.ok(start >= 0, `Missing ${startMarker}`);
  assert.ok(end > start, `Missing ${endMarker}`);
  return source.slice(start, end);
}

test("legacy panel state opens Dashboard once, then restores its active view", async () => {
  const loadPanelStateSource = functionBody(
    "async function loadPanelState()",
    "let panelStateSaveTimer"
  );
  let stored = { activeView: "journeyView", notesInput: "Legacy notes" };
  const writes = [];
  const switchedViews = [];
  const context = {
    STORAGE_KEYS: { panelState: "panelState" },
    elements: {
      notesInput: { value: "" },
      pageQuestionCount: { querySelector: () => null },
      pageQuizStyle: { querySelector: () => null }
    },
    state: {},
    getStorage: async () => ({ ...stored }),
    setStorage: async (_key, value) => {
      stored = { ...value };
      writes.push({ ...value });
    },
    setQuizDifficulty: () => {},
    cssEscape: (value) => String(value),
    document: {
      getElementById: (id) => ["dashboardView", "journeyView", "pageView"].includes(id) ? {} : null
    },
    switchView: (viewId) => switchedViews.push(viewId)
  };
  const loadPanelState = vm.runInNewContext(`(() => {
    ${loadPanelStateSource}
    return loadPanelState;
  })()`, context);

  assert.equal(await loadPanelState(), "dashboardView");
  assert.deepEqual(switchedViews, ["dashboardView"]);
  assert.equal(writes.length, 1);
  assert.equal(stored.dashboardIntroSeen, true);
  assert.equal(stored.activeView, "journeyView");

  assert.equal(await loadPanelState(), "journeyView");
  assert.deepEqual(switchedViews, ["dashboardView", "journeyView"]);
  assert.equal(writes.length, 1);

  stored.activeView = "notesView";
  assert.equal(await loadPanelState(), "pageView");
  assert.equal(writes.length, 1);
});

test("restores the pinned artifact before detecting a permission-dependent page", () => {
  const initialization = functionBody(
    "async function initializePersistentPanel()",
    "async function handleRefreshSource()"
  );
  assert.ok(initialization.indexOf("await maybeRestoreSessionDraft()") < initialization.indexOf("await detectActiveSource()"));
  assert.ok(initialization.indexOf("await maybeRestoreSessionDraft()") < initialization.indexOf("await loadJourney()"));
  assert.ok(initialization.indexOf("await loadJourney()") < initialization.indexOf("await detectActiveSource()"));
  assert.match(source, /void initializePersistentPanel\(\)/);
  assert.doesNotMatch(source, /loadPanelState\(\)\.then\(\(\) => detectActiveSource\(\)\)/);
  assert.match(source, /state\.selectedChapter = \{[\s\S]*?id: selectedChapterId[\s\S]*?title: selectedChapterTitle/);
  assert.match(source, /legacyPageChapterId \|\| legacyNotesChapterId/);
  assert.match(source, /selectChapterAcrossControls\(preferredChapter\?\.id \|\| ""\);\s*await savePanelState\(\)/);
});

test("Refresh page changes only browser context and cannot render the pinned artifact", () => {
  const refresh = functionBody("async function handleRefreshSource()", "async function refreshCrossSiteAccessState()");
  const detection = functionBody("async function detectActiveSource()", "function handleTranscriptInput()");
  assert.match(refresh, /await detectActiveSource\(\)/);
  assert.match(refresh, /pinned note is unchanged/);
  assert.doesNotMatch(refresh, /currentArtifact|currentSession|renderNote|renderSession/);
  assert.doesNotMatch(detection, /maybeRestoreSessionDraft|renderNote|renderSession|currentArtifact|currentSession/);
  assert.match(detection, /sourceDetectionSequence/);
  assert.match(detection, /stillActiveTab\?\.id !== tab\.id/);
});

test("a pinned artifact persists until explicit Close is used", () => {
  const restore = functionBody("async function maybeRestoreSessionDraft()", "async function handleSaveSession()");
  const close = functionBody("function closeSession()", "function openPinnedArtifact()");
  assert.doesNotMatch(restore, /MAX_AGE|Date\.now\(\) - savedAt/);
  assert.match(restore, /draft\?\.artifact \|\| draft\?\.session/);
  assert.match(close, /removeStorage\(STORAGE_KEYS\.sessionDraft\)/);
});

test("draft restore accepts only coherent quizzes and hides empty or unfinished quiz UI", () => {
  const helpers = functionBody("function isRenderableQuizArtifact", "function renderSummaryPoints");
  const harness = vm.runInNewContext(`(() => {
    ${helpers}
    return { isRenderableQuizArtifact, sanitizeDraftArtifact };
  })()`);
  const incomplete = {
    id: "note-incomplete",
    kind: "quiz",
    questions: [{ prompt: "", choices: [], answer: "" }],
    answers: { orphan: "answer" }
  };
  assert.equal(harness.isRenderableQuizArtifact(incomplete), false);
  const restoredNote = harness.sanitizeDraftArtifact(incomplete);
  assert.equal(restoredNote.kind, "note");
  assert.equal(Object.hasOwn(restoredNote, "questions"), false);
  assert.equal(Object.hasOwn(restoredNote, "answers"), false);

  const complete = {
    id: "quiz-complete",
    kind: "quiz",
    questions: [{
      prompt: "What stores captured energy?",
      choices: ["Glucose", "Oxygen"],
      answer: "Glucose"
    }]
  };
  assert.equal(harness.isRenderableQuizArtifact(complete), true);
  assert.equal(harness.sanitizeDraftArtifact(complete).questions.length, 1);

  const restore = functionBody("async function maybeRestoreSessionDraft()", "async function handleSaveSession()");
  assert.match(restore, /const hasQuiz = isRenderableQuizArtifact\(storedArtifact\)/);
  assert.match(restore, /previous quiz did not finish, so quiz controls were not shown/);
  assert.match(source, /keyPointsBlock\?\.classList\.toggle\("hidden", points\.length === 0\)/);

  const render = functionBody("function renderSession(session)", "function ensureStoredQuizIdentity(session)");
  assert.ok(render.indexOf('elements.quizBlock.classList.add("hidden")') < render.indexOf("renderQuiz(session)"));
  assert.ok(render.indexOf("renderQuiz(session)") < render.indexOf('elements.quizBlock.classList.remove("hidden")'));
});

test("quiz choices are shuffled for display while answers remain text keyed", () => {
  const renderQuizSource = functionBody("function renderQuiz(session)", "async function revealHintWithSource(");

  class FakeElement {
    constructor(tagName) {
      this.tagName = tagName;
      this.children = [];
      this.listeners = {};
      this.attributes = {};
      const classes = new Set();
      this.classList = {
        add: (...names) => names.forEach((name) => classes.add(name)),
        remove: (...names) => names.forEach((name) => classes.delete(name)),
        contains: (name) => classes.has(name)
      };
    }

    append(...children) {
      this.children.push(...children);
    }

    replaceChildren(...children) {
      this.children = [...children];
    }

    setAttribute(name, value) {
      this.attributes[name] = value;
    }

    addEventListener(type, listener) {
      this.listeners[type] = listener;
    }
  }

  const quizContainer = new FakeElement("section");
  const scheduledSaves = [];
  let progressUpdates = 0;
  const context = {
    document: {
      createElement: (tagName) => new FakeElement(tagName),
      createTextNode: (text) => ({ textContent: text })
    },
    elements: { quizContainer },
    state: { currentSession: null },
    createElement: (tagName, text, className = "") => {
      const element = new FakeElement(tagName);
      element.textContent = text;
      element.className = className;
      return element;
    },
    shuffle: (items) => [...items].reverse(),
    scheduleCurrentSessionDraftSave: () => scheduledSaves.push("scheduled"),
    updateQuizProgress: () => { progressUpdates += 1; },
    revealHintWithSource: async () => {}
  };
  const renderQuiz = vm.runInNewContext(`(${renderQuizSource})`, context);
  const session = {
    answers: {},
    questions: [{
      id: "question-1",
      prompt: "Choose the correct text.",
      choices: ["A text", "B text", "C text", "D text"],
      answer: "A text"
    }]
  };
  context.state.currentSession = session;

  renderQuiz(session);

  const card = quizContainer.children[0];
  const renderedInputs = card.children
    .filter((child) => child?.tagName === "label")
    .map((label) => label.children[0]);
  assert.deepEqual(renderedInputs.map((input) => input.value), ["D text", "C text", "B text", "A text"]);
  assert.deepEqual(session.questions[0].choices, ["A text", "B text", "C text", "D text"]);

  renderedInputs[0].listeners.change();
  assert.equal(session.answers["question-1"], "D text");
  assert.equal(progressUpdates, 1);
  assert.equal(scheduledSaves.length, 1);
});

test("quiz answer drafts use one trailing 400 ms save", async () => {
  const draftSaveSource = functionBody(
    "let currentSessionDraftSaveTimer",
    "async function maybeRestoreSessionDraft()"
  );
  const timers = [];
  const writes = [];
  const context = {
    setTimeout: (callback, delay) => {
      const timer = { callback, delay, cleared: false };
      timers.push(timer);
      return timer;
    },
    clearTimeout: (timer) => { timer.cleared = true; },
    structuredClone,
    state: {
      currentSession: { id: "quiz-1", answers: { "question-1": "A text" }, sourceText: "source" },
      currentArtifact: null,
      currentExportItem: null,
      submitted: false
    },
    sanitizeDraftArtifact: (artifact) => artifact,
    STORAGE_KEYS: { sessionDraft: "sessionDraft" },
    setStorage: async (key, value) => { writes.push({ key, value }); }
  };
  const harness = vm.runInNewContext(`(() => {
    ${draftSaveSource}
    return { scheduleCurrentSessionDraftSave, persistCurrentSessionDraft };
  })()`, context);

  harness.scheduleCurrentSessionDraftSave();
  harness.scheduleCurrentSessionDraftSave();

  assert.equal(timers.length, 2);
  assert.equal(timers[0].cleared, true);
  assert.equal(timers[1].delay, 400);
  assert.equal(writes.length, 0);

  timers[1].callback();
  await Promise.resolve();
  assert.equal(writes.length, 1);
  assert.equal(writes[0].key, "sessionDraft");
  assert.equal(writes[0].value.artifact.answers["question-1"], "A text");

  harness.scheduleCurrentSessionDraftSave();
  const pendingTimer = timers[2];
  await harness.persistCurrentSessionDraft();
  assert.equal(pendingTimer.cleared, true);
  assert.equal(writes.length, 2);
});

test("Journey separates saved artifacts from deduplicated source snapshots", () => {
  assert.match(source, /Saved learning artifacts/);
  assert.match(source, /Saved source snapshots/);
  assert.match(source, /formatJourneyArtifactKind\(session\)/);
  assert.match(source, /openJourneyArtifact\(session\.id\)/);
  assert.match(source, /title: input\.title \|\| item\?\.sourceBinding\?\.title \|\| item\?\.title/);
  assert.match(source, /immutableFingerprint\s*\?\s*source\.fingerprint === immutableFingerprint/);
});

test("PDF, imported-collection, and video fallback notes all persist as Journey artifacts", async () => {
  const journeySourceBuilder = functionBody(
    "function buildJourneySourceFromStudyInput(input, item)",
    "async function recordLearningItem("
  );
  const artifactPersistence = functionBody(
    "function buildStudySourceBinding(input)",
    "async function generateNotesWithBackend("
  );
  const recorded = [];
  const finalizedCollections = [];
  const saved = [];
  const rendered = [];
  let noteSequence = 0;
  const context = {
    state: {
      generationToken: 41,
      currentArtifact: null,
      currentSession: null,
      currentExportItem: null,
      submitted: false
    },
    makeContentFingerprint: (text) => `fingerprint:${String(text).length}`,
    createStudyNote: async (input) => ({
      id: `note-${++noteSequence}`,
      kind: "note",
      artifactType: "study",
      title: `${input.title} visual note`,
      createdAt: "2026-07-19T12:00:00.000Z",
      generatedAt: "2026-07-19T12:00:00.000Z",
      usedLocalFallback: true,
      generationError: "The AI backend is unavailable.",
      visualLesson: { visualModel: { nodes: [{ id: "concept-1", label: "Grounded concept" }] } }
    }),
    recordLearningItem: async (artifact, chapterId, sourceSnapshot) => {
      recorded.push({ artifact, chapterId, sourceSnapshot });
      return { chapterId, sourceId: `source-${chapterId}` };
    },
    mutateJourney: async (type, payload) => {
      finalizedCollections.push({ type, payload });
      return { result: { chapterId: payload.chapterId, sessionId: payload.session.id } };
    },
    saveLibraryItem: async (artifact) => saved.push(artifact),
    persistCurrentSessionDraft: async () => {},
    renderNote: (artifact) => rendered.push(artifact)
  };
  const createAndRecordStudyArtifact = vm.runInNewContext(`(() => {
    ${journeySourceBuilder}
    ${artifactPersistence}
    return createAndRecordStudyArtifact;
  })()`, context);

  const pdfArtifact = await createAndRecordStudyArtifact({
    title: "Imported algorithms.pdf",
    sourceType: "webpage",
    sourceUrl: "",
    sourceFingerprint: "pdf-fingerprint",
    documentType: "pdf",
    pageCount: 12,
    rawText: "Page 1 Trees and graphs. Page 2 Traversal algorithms.",
    chapterId: "chapter-pdf",
    chapterTitle: "Algorithms",
    generationToken: 41
  });
  const videoArtifact = await createAndRecordStudyArtifact({
    title: "Tree traversal lecture",
    sourceType: "video",
    sourceUrl: "https://video.example/watch/trees",
    sourceFingerprint: "video-fingerprint",
    videoMediaId: "media-trees",
    transcriptFingerprint: "transcript-trees",
    videoSegments: [{ startMs: 0, endMs: 5000, text: "A preorder traversal visits the root first." }],
    rawText: "[00:00] A preorder traversal visits the root first.",
    chapterId: "chapter-video",
    chapterTitle: "Video Trees",
    generationToken: 41
  });
  const collectionArtifact = await createAndRecordStudyArtifact({
    title: "Imported PDFs: combined visual note",
    sourceType: "collection",
    rawText: "Combined bounded PDF evidence.",
    sourceRevisionHash: "source-revision-1",
    compositionRevisionHash: "composition-revision-1",
    collectionSources: [{ id: "pdf-source-1", documentType: "pdf", text: "PDF evidence" }],
    chapterId: "chapter-imports",
    chapterTitle: "Imported PDFs",
    generationToken: 41
  });

  assert.equal(pdfArtifact.sourceBinding.documentType, "pdf");
  assert.equal(pdfArtifact.sourceBinding.pageCount, 12);
  assert.equal(pdfArtifact.journeyChapterId, "chapter-pdf");
  assert.equal(recorded[0].sourceSnapshot.documentType, "pdf");
  assert.equal(videoArtifact.sourceBinding.sourceType, "video");
  assert.equal(videoArtifact.sourceBinding.mediaId, "media-trees");
  assert.equal(recorded[1].sourceSnapshot.type, "video");
  assert.equal(recorded[1].sourceSnapshot.segments.length, 1);
  assert.equal(collectionArtifact.journeyChapterId, "chapter-imports");
  assert.equal(finalizedCollections.length, 1);
  assert.equal(finalizedCollections[0].type, "JOURNEY_FINALIZE_COLLECTION");
  assert.equal(finalizedCollections[0].payload.session.id, collectionArtifact.id);
  assert.equal(saved.length, 3);
  assert.equal(rendered.length, 3);
  assert.ok(saved.every((artifact) => artifact.usedLocalFallback));
  assert.ok(saved.every((artifact) => artifact.artifactType === "study"));
});

test("startup upgrades older Journey evidence from the richer saved artifact", () => {
  const loadJourney = functionBody("async function loadJourney()", "async function updateJourneyChapterOptions(");
  const quizGeneration = functionBody("async function handleGenerateQuiz(event)", "async function resolveQuizSourceInput(");
  assert.match(loadJourney, /shouldImportSavedArtifact\(saved, existing\)/);
  assert.match(loadJourney, /saved\.journeyChapterId \|\| saved\.journeyChapterTitle/);
  assert.match(source, /savedHasQuiz && !existingHasQuiz/);
  assert.match(source, /savedQuestionCount > existingQuestionCount/);
  assert.match(quizGeneration, /recordLearningItem\(\s*combined,/);
  assert.ok(quizGeneration.indexOf("recordLearningItem(") < quizGeneration.indexOf("saveLibraryItem(combined)"));
});
