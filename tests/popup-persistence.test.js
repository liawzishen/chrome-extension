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

test("Journey separates saved artifacts from deduplicated source snapshots", () => {
  assert.match(source, /Saved learning artifacts/);
  assert.match(source, /Saved source snapshots/);
  assert.match(source, /formatJourneyArtifactKind\(session\)/);
  assert.match(source, /openJourneyArtifact\(session\.id\)/);
  assert.match(source, /title: input\.title \|\| item\?\.sourceBinding\?\.title \|\| item\?\.title/);
  assert.match(source, /immutableFingerprint\s*\?\s*source\.fingerprint === immutableFingerprint/);
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
