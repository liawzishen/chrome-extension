const STORAGE = {
  journey: "examCramLearningJourney",
  focus: "examCramFocusState",
  sessions: "examCramSessions",
  sessionDraft: "examCramSessionDraft",
  pendingChapterAction: "examCramPendingChapterAction"
};

const STUDY_RAIL_COLLAPSED_KEY = "examCramForestStudyRailCollapsed";

const page = {
  root: document.getElementById("learningForest"),
  title: document.getElementById("pageJourneyTitle"),
  progress: document.getElementById("pageProgress"),
  focus: document.getElementById("pageFocusTime"),
  empty: document.getElementById("forestEmpty"),
  fallbackList: document.getElementById("forestFallbackList"),
  loadState: document.getElementById("pageLoadState"),
  back: document.getElementById("backToForest"),
  details: document.getElementById("openTreeDetails"),
  motion: document.getElementById("toggleForestMotion"),
  drawer: document.getElementById("forestDrawer"),
  drawerTitle: document.getElementById("forestDrawerTitle"),
  closeDrawer: document.getElementById("closeForestDrawer"),
  openSummary: document.getElementById("openJourneySummary"),
  chapterTab: document.getElementById("chapterTab"),
  summaryTab: document.getElementById("summaryTab"),
  chapterPanel: document.getElementById("chapterPanel"),
  summaryPanel: document.getElementById("summaryPanel"),
  context: document.getElementById("pageStudyContext"),
  inspector: document.getElementById("chapterInspector"),
  artifactStatus: document.getElementById("pageArtifactStatus"),
  range: document.getElementById("pageSummaryRange"),
  summarize: document.getElementById("pageSummarizeButton"),
  summary: document.getElementById("pageJourneySummary"),
  createNote: document.getElementById("pageCreateNoteButton"),
  createNoteHelp: document.getElementById("pageCreateNoteHelp"),
  studyRail: document.getElementById("forestStudyRail"),
  closeStudyRail: document.getElementById("closeStudyRail"),
  openStudyRail: document.getElementById("openStudyRail"),
  learningOutline: document.getElementById("learningOutline")
};

let journey = globalThis.ExamCramJourney.createJourney();
let focusState = globalThis.ExamCramFocus?.createDefaultFocusState?.() || {};
let savedArtifacts = [];
let forestRecords = [];
let selectedChapterId = "";
let selectedVisualNoteId = "";
let forestMode = "loading";
let drawerReturnFocus = null;
let motionPaused = Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
let focusMetricsTimer = null;
let studyRailCollapsed = readStoredStudyRailCollapsed();

const forestController = globalThis.ExamCramLearningForest.mount(page.root, {
  onSelectTree({ treeId }) {
    selectedChapterId = treeId;
    selectedVisualNoteId = "";
    renderDetails();
    renderStudyRail();
    openDrawer("chapter");
  },
  onSelectVisualNote({ treeId, artifactId }) {
    rememberDrawerReturnFocus();
    selectedChapterId = treeId;
    selectedVisualNoteId = artifactId;
    renderDetails();
    renderStudyRail();
    openDrawer("chapter");
    page.drawer.scrollTop = 0;
    page.drawer.focus({ preventScroll: true });
    requestAnimationFrame(revealSelectedVisualNoteMessage);
  },
  onModeChange({ mode, treeId }) {
    forestMode = mode;
    if (treeId) selectedChapterId = treeId;
    page.back.hidden = !(mode === "focus" && forestRecords.length > 1);
    page.details.hidden = mode !== "focus";
    page.empty.hidden = mode !== "empty";
    if (mode === "overview") {
      selectedVisualNoteId = "";
      page.drawer.classList.remove("is-note-only");
      closeDrawer();
    }
  },
  onWebglError() {
    page.motion.hidden = true;
    closeDrawer();
  }
});

forestController.setMotionPaused(motionPaused);
updateMotionControl();

page.summarize.addEventListener("click", () => void refreshSummary());
page.createNote?.addEventListener("click", () => void openStudyPanel());
page.back.addEventListener("click", () => {
  selectedVisualNoteId = "";
  forestController.showOverview();
});
page.details.addEventListener("click", () => openFullDetails("chapter", page.details));
page.closeDrawer.addEventListener("click", dismissDetails);
page.openSummary.addEventListener("click", () => openFullDetails("summary", page.openSummary));
page.motion.addEventListener("click", () => {
  motionPaused = !motionPaused;
  forestController.setMotionPaused(motionPaused);
  updateMotionControl();
});
page.chapterTab.addEventListener("click", () => setDrawerTab("chapter"));
page.summaryTab.addEventListener("click", () => setDrawerTab("summary"));
page.closeStudyRail?.addEventListener("click", () => setStudyRailCollapsed(true));
page.openStudyRail?.addEventListener("click", () => setStudyRailCollapsed(false));
applyStudyRailState();
window.addEventListener("beforeunload", handleBeforeUnload, { once: true });
window.addEventListener("keydown", handlePageKeyDown);

if (globalThis.chrome?.storage?.onChanged) {
  globalThis.chrome.storage.onChanged.addListener(handleStorageChanged);
}

void load();

async function load() {
  setLoadState("loading", "Loading your learning forest...");
  try {
    const [storedJourney, storedFocus, storedArtifacts] = await Promise.all([
      getStorage(STORAGE.journey, null),
      getStorage(STORAGE.focus, null),
      getStorage(STORAGE.sessions, [])
    ]);
    journey = globalThis.ExamCramJourney.normalizeJourney(
      storedJourney || globalThis.ExamCramJourney.createJourney()
    );
    focusState = storedFocus || {};
    savedArtifacts = normalizeSavedArtifacts(storedArtifacts);
    if (journey.summary?.range && page.range.querySelector(`option[value="${journey.summary.range}"]`)) {
      page.range.value = journey.summary.range;
    }
    render();
    setLoadState("ready", "Learning forest loaded.");
  } catch (error) {
    render();
    setLoadState("error", error?.message || "The learning forest could not be loaded.", load);
  }
}

function renderHeaderMetrics() {
  const liveFocus = getLiveFocusMetrics(focusState, Date.now());
  const metrics = globalThis.ExamCramJourney.getMetrics(journey, liveFocus.history);
  page.title.textContent = journey.title;
  page.progress.textContent = `${metrics.progressPercent}%`;
  page.focus.textContent = `${metrics.focusMinutes + liveFocus.activeMinutes}m`;
  scheduleFocusMetricsRender(liveFocus.active);
}

function getLiveFocusMetrics(stateValue, now = Date.now()) {
  const focusApi = globalThis.ExamCramFocus;
  const reconciled = focusApi?.reconcileFocusState ? focusApi.reconcileFocusState(stateValue, now).state : null;
  const history = Array.isArray(reconciled?.history)
    ? reconciled.history
    : Array.isArray(stateValue?.history) ? stateValue.history : [];
  const active = Boolean(reconciled?.active && reconciled.startedAt !== null);
  const activeMs = active ? Math.max(0, Math.min(now, reconciled.endsAt ?? now) - reconciled.startedAt) : 0;
  return { active, history, activeMinutes: Math.floor(activeMs / 60000) };
}

function scheduleFocusMetricsRender(active) {
  if (!active) {
    if (focusMetricsTimer) clearInterval(focusMetricsTimer);
    focusMetricsTimer = null;
    return;
  }
  if (focusMetricsTimer) return;
  focusMetricsTimer = setInterval(renderHeaderMetrics, 30000);
}

function renderStudyRail() {
  renderLearningOutline();
}

function readStoredStudyRailCollapsed() {
  try {
    return localStorage.getItem(STUDY_RAIL_COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

function setStudyRailCollapsed(collapsed) {
  studyRailCollapsed = Boolean(collapsed);
  try {
    localStorage.setItem(STUDY_RAIL_COLLAPSED_KEY, studyRailCollapsed ? "1" : "0");
  } catch {
    // The outline still toggles for this visit when the preference cannot persist.
  }
  applyStudyRailState();
  const target = studyRailCollapsed ? page.openStudyRail : page.closeStudyRail;
  target?.focus({ preventScroll: true });
}

function applyStudyRailState() {
  if (!page.studyRail || !page.openStudyRail) return;
  page.studyRail.hidden = studyRailCollapsed;
  page.openStudyRail.hidden = !studyRailCollapsed;
}

function renderLearningOutline() {
  if (!page.learningOutline) return;
  if (!journey.chapters.length) {
    page.learningOutline.replaceChildren(createText("p", "No uploaded files or chapters yet. Import a PDF to build this outline."));
    return;
  }
  const groups = new Map();
  journey.chapters.forEach((chapter) => {
    const key = chapter.importedFileId || "manual";
    const group = groups.get(key) || {
      id: key,
      title: chapter.importedFileName || "Other learning chapters",
      size: chapter.importedFileSize || 0,
      imported: Boolean(chapter.importedFileId),
      chapters: []
    };
    group.chapters.push(chapter);
    groups.set(key, group);
  });
  const nodes = [...groups.values()].map((group) => {
    const wrapper = document.createElement("section");
    wrapper.className = "learning-outline__file";
    const heading = document.createElement("div");
    heading.className = "learning-outline__file-heading";
    heading.append(
      createText("strong", group.title),
      createText("span", group.imported
        ? `${formatFileSize(group.size)} \u00b7 ${group.chapters.length} ${group.chapters.length === 1 ? "chapter" : "chapters"}`
        : `${group.chapters.length} ${group.chapters.length === 1 ? "chapter" : "chapters"}`)
    );
    const list = document.createElement("div");
    list.className = "learning-outline__chapters";
    group.chapters
      .sort((first, second) => (first.importedChapterOrder || 0) - (second.importedChapterOrder || 0)
        || first.title.localeCompare(second.title))
      .forEach((chapter) => list.append(renderOutlineChapterNode(chapter)));
    wrapper.append(heading, list);
    return wrapper;
  });
  page.learningOutline.replaceChildren(...nodes);
}

function renderOutlineChapterNode(chapter) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `learning-outline__chapter${chapter.id === selectedChapterId ? " is-selected" : ""}`;
  button.setAttribute("aria-current", chapter.id === selectedChapterId ? "true" : "false");
  const title = chapter.importedChapterTitle || chapter.title;
  const status = getChapterWorkspaceStatus(chapter);
  const progress = getChapterWorkspaceProgress(chapter);
  button.append(
    createText("strong", title),
    createText("span", `${status} \u00b7 ${progress}%`)
  );
  if (chapter.pageStart) {
    button.append(createText("small", `Pages ${chapter.pageStart}${chapter.pageEnd > chapter.pageStart ? `\u2013${chapter.pageEnd}` : ""}`));
  }
  button.addEventListener("click", () => {
    rememberDrawerReturnFocus(button);
    selectedChapterId = chapter.id;
    selectedVisualNoteId = "";
    if (forestController.isWebGLAvailable) forestController.focusTree(chapter.id);
    renderDetails();
    renderStudyRail();
    openDrawer("chapter");
  });
  return button;
}

function getChapterWorkspaceStatus(chapter) {
  const status = chapter?.resourceStatus || (chapter?.sessions?.some((session) => session.hasVisualNote) ? "completed" : "waiting");
  return {
    waiting: "Waiting for generation",
    generating: "Generating resources",
    completed: "Resources ready",
    partially_completed: "Partially completed",
    failed: "Generation failed",
    empty: "Empty content",
    outdated: "Update available"
  }[status] || formatStatus(globalThis.ExamCramJourney.getChapterStatus(chapter));
}

function getChapterWorkspaceProgress(chapter) {
  if (chapter?.resourceStatus === "completed") {
    return globalThis.ExamCramJourney.getChapterStatus(chapter) === "completed" ? 100 : 75;
  }
  if (chapter?.resourceStatus === "partially_completed") return 55;
  if (chapter?.resourceStatus === "generating") return 35;
  if (chapter?.resourceStatus === "failed" || chapter?.resourceStatus === "empty") return 10;
  return chapter?.sources?.length ? 20 : 0;
}

function formatFileSize(value) {
  const bytes = Math.max(0, Number(value) || 0);
  if (!bytes) return "Local file";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function render() {
  renderHeaderMetrics();
  forestRecords = globalThis.ExamCramLearningForestData.buildForestRecords(
    journey,
    savedArtifacts,
    { getChapterStatus: globalThis.ExamCramJourney.getChapterStatus }
  );
  if (selectedChapterId && !forestRecords.some((record) => record.id === selectedChapterId)) {
    selectedChapterId = "";
    selectedVisualNoteId = "";
  }
  const selectedRecord = forestRecords.find((record) => record.id === selectedChapterId);
  if (selectedVisualNoteId && !selectedRecord?.visualNotes.some((note) => note.id === selectedVisualNoteId)) {
    selectedVisualNoteId = "";
  }
  if (forestRecords.length === 1) selectedChapterId = forestRecords[0].id;
  renderFallback();
  renderStudyRail();
  renderDetails();
  renderSummary(journey.summary || globalThis.ExamCramJourney.summarize(journey, { range: page.range.value }));
  forestController.setTrees(forestRecords);
  page.empty.hidden = forestRecords.length !== 0;
}

function renderFallback() {
  if (!forestRecords.length) {
    page.fallbackList.replaceChildren(createText("p", "No saved Journey chapters yet."));
    return;
  }
  page.fallbackList.replaceChildren(...forestRecords.map((record) => {
    const button = document.createElement("button");
    button.type = "button";
    button.append(
      createText("strong", record.name),
      createText(
        "span",
        `${formatDate(record.createdAt)} · ${formatGrowthStage(record)} · ${record.growthUnitCount} ${record.growthUnitCount === 1 ? "growth unit" : "growth units"} · ${record.visualNoteCount} Visual ${record.visualNoteCount === 1 ? "Note" : "Notes"} · ${record.sourceCount} ${record.sourceCount === 1 ? "source" : "sources"} · ${formatStatus(record.status)}`
      )
    );
    button.addEventListener("click", () => {
      rememberDrawerReturnFocus(button);
      selectedChapterId = record.id;
      selectedVisualNoteId = "";
      if (forestController.isWebGLAvailable) forestController.focusTree(record.id);
      renderDetails();
      renderStudyRail();
      openDrawer("chapter");
    });
    return button;
  }));
}

function renderDetails() {
  renderStudyContext();
  renderInspector();
  const chapter = globalThis.ExamCramJourney.findChapter(journey, selectedChapterId);
  const record = forestRecords.find((item) => item.id === selectedChapterId);
  const selectedNote = record?.visualNotes.find((note) => note.id === selectedVisualNoteId) || null;
  page.context.hidden = Boolean(selectedNote);
  page.drawer.classList.toggle("is-note-only", Boolean(selectedNote));
  page.drawerTitle.textContent = selectedNote?.title || chapter?.title || "Note details";
}

function setDrawerTab(tab) {
  const summarySelected = tab === "summary";
  page.chapterTab.setAttribute("aria-selected", String(!summarySelected));
  page.summaryTab.setAttribute("aria-selected", String(summarySelected));
  page.chapterPanel.hidden = summarySelected;
  page.summaryPanel.hidden = !summarySelected;
  page.drawerTitle.textContent = summarySelected
    ? "Overall learning journey"
    : (forestRecords.find((record) => record.id === selectedChapterId)?.visualNotes
      .find((note) => note.id === selectedVisualNoteId)?.title
      || globalThis.ExamCramJourney.findChapter(journey, selectedChapterId)?.title
      || "Note details");
}

function openDrawer(tab = "chapter") {
  if (tab === "chapter" && !selectedChapterId && forestRecords.length) {
    selectedChapterId = forestRecords[0].id;
    renderDetails();
  }
  setDrawerTab(tab);
  page.drawer.classList.toggle("is-note-only", tab === "chapter" && Boolean(selectedVisualNoteId));
  page.drawer.classList.add("is-open");
  page.drawer.setAttribute("aria-hidden", "false");
  page.root.dataset.drawer = "open";
  const activePanel = tab === "summary" ? page.summaryPanel : page.chapterPanel;
  activePanel.scrollTop = 0;
}

function closeDrawer() {
  page.drawer.classList.remove("is-open");
  page.drawer.setAttribute("aria-hidden", "true");
  page.root.dataset.drawer = "closed";
}

function clearSelectedVisualNote() {
  if (!selectedVisualNoteId) return;
  selectedVisualNoteId = "";
  forestController.clearVisualNoteFocus();
  renderDetails();
}

function dismissDetails() {
  const returnTarget = drawerReturnFocus;
  drawerReturnFocus = null;
  closeDrawer();
  clearSelectedVisualNote();
  if (returnTarget?.isConnected) {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      returnTarget.focus({ preventScroll: true });
    }));
  }
}

function openFullDetails(tab, trigger) {
  rememberDrawerReturnFocus(trigger);
  clearSelectedVisualNote();
  openDrawer(tab);
  page.drawer.focus({ preventScroll: true });
}

function rememberDrawerReturnFocus(preferred) {
  const active = document.activeElement;
  drawerReturnFocus = preferred
    || (active instanceof HTMLElement && active !== document.body ? active : null);
}

function updateMotionControl() {
  page.motion.setAttribute("aria-pressed", String(motionPaused));
  page.motion.textContent = motionPaused ? "Resume motion" : "Pause motion";
  page.motion.setAttribute(
    "aria-label",
    motionPaused ? "Resume forest particle motion" : "Pause forest particle motion"
  );
}

async function refreshSummary() {
  page.summarize.disabled = true;
  setLoadState("loading", "Refreshing the learning summary...");
  try {
    const summary = {
      ...globalThis.ExamCramJourney.summarize(journey, { range: page.range.value }),
      sourceRevision: journey.revision
    };
    try {
      const response = await saveSummaryThroughWorker(journey, summary);
      journey = globalThis.ExamCramJourney.normalizeJourney(response.journey);
    } catch (error) {
      if (error.code !== "REVISION_CONFLICT") throw error;
      const latest = globalThis.ExamCramJourney.normalizeJourney(await getStorage(STORAGE.journey, null));
      const refreshed = {
        ...globalThis.ExamCramJourney.summarize(latest, { range: page.range.value }),
        sourceRevision: latest.revision
      };
      const response = await saveSummaryThroughWorker(latest, refreshed);
      journey = globalThis.ExamCramJourney.normalizeJourney(response.journey);
    }
    render();
    setLoadState("ready", "Learning summary refreshed.");
  } catch (error) {
    setLoadState("error", error?.message || "The learning summary could not be saved.", refreshSummary);
  } finally {
    page.summarize.disabled = false;
  }
}

function setLoadState(kind, message, retry = null) {
  page.loadState.dataset.state = kind;
  page.loadState.hidden = kind === "ready";
  const content = createText("span", message);
  if (!retry) {
    page.loadState.replaceChildren(content);
    return;
  }
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "Retry";
  button.addEventListener("click", () => void retry());
  page.loadState.replaceChildren(content, button);
}

function renderStudyContext() {
  const chapter = globalThis.ExamCramJourney.findChapter(journey, selectedChapterId);
  if (!chapter) {
    page.context.hidden = true;
    page.context.replaceChildren();
    return;
  }
  page.context.hidden = false;
  const storedLastSource = journey.lastStudySource?.chapterId === chapter.id ? journey.lastStudySource : null;
  const chapterSource = [...(chapter.sources || [])]
    .sort((first, second) => Date.parse(second.capturedAt || 0) - Date.parse(first.capturedAt || 0))[0] || null;
  const lastSource = storedLastSource || (chapterSource ? {
    title: chapterSource.title || chapterSource.fileName || chapter.title,
    domain: chapterSource.fileName || getSourceDomain(chapterSource.url) || (chapterSource.documentType === "pdf" ? "Local PDF" : "Saved source"),
    type: chapterSource.type || "webpage",
    documentType: chapterSource.documentType || "",
    chapterId: chapter.id,
    chapter: chapter.title,
    url: chapterSource.url || "",
    capturedAt: chapterSource.capturedAt
  } : null);
  const hasSavedEvidence = Boolean(chapter.sources?.length || chapter.sessions?.length);
  const copy = document.createElement("div");
  copy.className = "study-context-copy";
  if (!lastSource) {
    copy.append(
      createText("span", "Selected tree", "study-context-label"),
      createText("h3", `${chapter.title} · No saved source yet`),
      createText("p", "Collect related pages, then build and save a visual note to grow this tree's concepts.", "study-context-meta")
    );
    page.context.replaceChildren(copy);
    return;
  }
  copy.append(
    createText("span", storedLastSource ? "Latest learning context" : "Selected chapter source", "study-context-label"),
    createText("h3", `${lastSource.title} · ${lastSource.domain}`),
    createText("p", `Saved to ${lastSource.chapter} · ${formatSourceType(lastSource.type, lastSource.documentType)} · ${formatDate(lastSource.capturedAt)}`, "study-context-meta")
  );
  if (!hasSavedEvidence) {
    copy.append(createText("p", `${chapter.title} has no saved evidence yet.`, "chapter-source-state"));
  }
  const children = [copy];
  if (lastSource.url) {
    const open = document.createElement("button");
    open.type = "button";
    open.textContent = "Open source";
    open.setAttribute("aria-label", `Open last studied source: ${lastSource.title}`);
    open.addEventListener("click", () => openSource(lastSource.url));
    children.push(open);
  }
  page.context.replaceChildren(...children);
}

function renderInspector() {
  const chapter = globalThis.ExamCramJourney.findChapter(journey, selectedChapterId);
  const record = forestRecords.find((item) => item.id === selectedChapterId);
  if (!chapter || !record) {
    page.inspector.replaceChildren();
    return;
  }
  const selectedNote = record.visualNotes.find((note) => note.id === selectedVisualNoteId) || null;
  if (selectedNote) {
    page.inspector.replaceChildren(renderVisualNoteFocus(chapter, record, selectedNote));
    return;
  }
  const status = globalThis.ExamCramJourney.getChapterStatus(chapter);
  const latestSubmittedQuiz = chapter.sessions
    .filter((session) => Number.isFinite(session.score) && session.submittedAt)
    .sort((first, second) => globalThis.ExamCramJourney.sessionActivityTime(second)
      - globalThis.ExamCramJourney.sessionActivityTime(first))[0];
  const latestScore = latestSubmittedQuiz?.score ?? null;
  const weakTopics = getChapterWeakConceptLabels(chapter, journey.learningMemory);
  const weakTopicSummary = weakTopics.slice(0, 6);
  const header = document.createElement("div");
  header.className = "inspector-header";
  const headerCopy = document.createElement("div");
  headerCopy.append(
    createText("span", `Planted ${formatDate(chapter.createdAt)}`, "inspector-kicker"),
    createText("h2", chapter.title),
    createText("p", `Updated ${formatDate(chapter.updatedAt)} · ${chapter.sources.length} saved ${chapter.sources.length === 1 ? "source" : "sources"}`)
  );
  header.append(headerCopy, createText("span", formatStatus(status), "status-pill"));

  const evidence = document.createElement("div");
  evidence.className = "inspector-evidence";
  evidence.append(
    evidenceItem("Latest score", latestScore == null ? "Not submitted" : `${latestScore}%`),
    evidenceItem("Study sessions", String(chapter.sessions.length)),
    evidenceItem("Weak topics", weakTopicSummary.length
      ? `${weakTopicSummary.join(", ")}${weakTopics.length > weakTopicSummary.length ? ` +${weakTopics.length - weakTopicSummary.length} more` : ""}`
      : "None recorded")
  );

  const visualNotes = document.createElement("section");
  visualNotes.className = "summary-section concept-evidence";
  visualNotes.append(createText("h3", "Visual Note branches"));
  const visualNoteList = document.createElement("div");
  visualNoteList.className = "concept-evidence__list";
  if (!record.visualNotes.length) {
    const message = record.sourceCount
      ? "Create a Visual Note to add branches. Your collected sources are already growing this chapter."
      : "This chapter is an empty planting plot. Collect a source or create a Visual Note to begin growing it.";
    visualNoteList.append(createText("p", message, "chapter-source-state"));
  } else {
    record.visualNotes.forEach((note) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "concept-evidence__item";
      item.append(
        createText("strong", note.title),
        createText("span", `${formatDate(note.activityAt || note.generatedAt)} · ${note.concepts.length} grounded ${note.concepts.length === 1 ? "concept" : "concepts"}`)
      );
      item.addEventListener("click", () => {
        forestController.focusVisualNote(record.id, note.id);
      });
      visualNoteList.append(item);
    });
  }
  visualNotes.append(visualNoteList);

  const notePreview = renderChapterNotePreview(chapter, record);

  const sourceState = !chapter.sources.length
    ? createText("p", `${chapter.title} has no saved source yet. Collect pages or save a note to add evidence.`, "chapter-source-state")
    : null;

  const artifacts = document.createElement("section");
  artifacts.className = "summary-section artifact-evidence";
  artifacts.append(createText("h3", "Saved learning artifacts"));
  const artifactList = document.createElement("div");
  artifactList.className = "source-leaves artifact-list";
  const visibleArtifacts = globalThis.ExamCramJourney.getChapterArtifactTimeline(chapter, savedArtifacts);
  if (!chapter.sessions.length) {
    artifactList.append(createText("p", "No saved visual notes or quizzes in this tree yet."));
  } else if (!visibleArtifacts.length) {
    artifactList.append(createText("p", "No distinct saved learning artifacts are available for this tree yet."));
  } else {
    visibleArtifacts.forEach((session) => artifactList.append(renderArtifactCard(session)));
    if (chapter.sessions.length > visibleArtifacts.length) {
      artifactList.append(createText("p", `Showing the ${visibleArtifacts.length} newest unique artifacts. Older saves remain in Library.`, "artifact-limit-note"));
    }
  }
  artifacts.append(artifactList);

  const sources = document.createElement("section");
  sources.className = "summary-section source-evidence";
  sources.append(createText("h3", "Saved source snapshots"));
  const sourceList = document.createElement("div");
  sourceList.className = "source-leaves";
  chapter.sources.forEach((source) => sourceList.append(renderSourceCard(source)));
  sources.append(sourceList);

  const workspace = renderChapterWorkspace(chapter, record, {
    notePreview,
    sourceState,
    evidence,
    visualNotes,
    artifacts,
    sources: chapter.sources.length ? sources : null
  });
  const exploreFurther = renderExploreFurther(chapter, weakTopics);
  page.inspector.replaceChildren(header, workspace, ...(exploreFurther ? [exploreFurther] : []));
}

function normalizeExternalConceptLabel(value) {
  return String(value || "")
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

function getChapterWeakConceptLabels(chapter, learningMemory = {}) {
  const noteIds = new Set((Array.isArray(chapter?.sessions) ? chapter.sessions : [])
    .flatMap((session) => [session?.id, session?.noteId, session?.artifactId])
    .map((value) => String(value || "").trim())
    .filter(Boolean));
  const labels = [
    ...(Array.isArray(chapter?.sessions) ? chapter.sessions : [])
      .flatMap((session) => Array.isArray(session?.weakTopics) ? session.weakTopics : []),
    ...(Array.isArray(learningMemory?.concepts) ? learningMemory.concepts : [])
      .filter((concept) => concept?.state === "weak" && noteIds.has(String(concept?.noteId || "")))
      .map((concept) => concept.conceptLabel || concept.conceptId)
  ];
  const seen = new Set();
  return labels
    .map(normalizeExternalConceptLabel)
    .filter((label) => {
      const key = label.toLocaleLowerCase();
      if (!label || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function buildExternalStudySuggestions(conceptLabel) {
  const concept = normalizeExternalConceptLabel(conceptLabel);
  if (!concept) return [];
  const query = encodeURIComponent(concept);
  return [
    {
      provider: "Khan Academy",
      description: "Lessons and practice results for this concept.",
      url: `https://www.khanacademy.org/search?page_search_query=${query}`
    },
    {
      provider: "Wikipedia",
      description: "An overview with references for further reading.",
      url: `https://en.wikipedia.org/w/index.php?search=${query}`
    }
  ];
}

function renderExploreFurther(chapter, weakTopics) {
  if (!weakTopics.length) return null;
  const section = document.createElement("section");
  section.className = "external-study-suggestions";
  section.dataset.contentOrigin = "external-unverified";
  section.setAttribute("aria-label", "External study suggestions");

  const disclosure = document.createElement("details");
  disclosure.className = "external-study-suggestions__disclosure";
  disclosure.append(createText("summary", "Explore further (external)", "external-study-suggestions__summary"));
  const body = document.createElement("div");
  body.className = "external-study-suggestions__body";
  body.append(
    createText("span", "Optional external resources", "external-study-suggestions__eyebrow"),
    createText("p", "These suggestions are not evidence-checked and never mix with saved evidence. Review an opened page, then explicitly save it to this chapter so its content enters the grounded loop.", "external-study-suggestions__notice")
  );

  weakTopics.forEach((concept) => {
    const conceptGroup = document.createElement("section");
    conceptGroup.className = "external-study-concept";
    conceptGroup.append(createText("h3", concept));
    const list = document.createElement("div");
    list.className = "external-study-concept__list";
    buildExternalStudySuggestions(concept).forEach((suggestion) => {
      const item = document.createElement("article");
      item.className = "external-study-card";
      const copy = document.createElement("div");
      copy.append(
        createText("strong", suggestion.provider),
        createText("p", suggestion.description)
      );
      const open = document.createElement("button");
      open.type = "button";
      open.textContent = "Open and prepare to save";
      open.setAttribute("aria-label", `Open ${suggestion.provider} results for ${concept} and prepare to save the page to ${chapter.title}`);
      open.addEventListener("click", () => void openExternalStudySuggestion(chapter, concept, suggestion, open));
      item.append(copy, open);
      list.append(item);
    });
    conceptGroup.append(list);
    body.append(conceptGroup);
  });
  disclosure.append(body);
  section.append(disclosure);
  return section;
}

function renderChapterWorkspace(chapter, record, sections) {
  const workspace = document.createElement("section");
  workspace.className = "chapter-workspace";
  workspace.setAttribute("aria-label", `${chapter.importedChapterTitle || chapter.title} learning workspace`);
  const artifact = getExactChapterArtifact(record);
  const tabs = [
    { id: "source", label: "Source" },
    { id: "visual", label: "Visual Note" },
    { id: "cheat", label: "Cheat Sheet" },
    { id: "summary", label: "Summary" },
    { id: "practice", label: "Practice" }
  ];
  const tabList = document.createElement("div");
  tabList.className = "chapter-workspace__tabs";
  tabList.setAttribute("role", "tablist");
  tabList.setAttribute("aria-label", "Chapter resources");
  const panels = new Map();
  tabs.forEach((tab, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.id = `chapter-workspace-tab-${chapter.id}-${tab.id}`;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-selected", String(index === 0));
    button.setAttribute("aria-controls", `chapter-workspace-panel-${chapter.id}-${tab.id}`);
    button.tabIndex = index === 0 ? 0 : -1;
    button.textContent = tab.label;
    button.addEventListener("click", () => selectChapterWorkspaceTab(tab.id, tabList, panels));
    button.addEventListener("keydown", (event) => handleChapterWorkspaceTabKeydown(event, tabs, tabList, panels));
    tabList.append(button);

    const panel = document.createElement("section");
    panel.id = `chapter-workspace-panel-${chapter.id}-${tab.id}`;
    panel.className = "chapter-workspace__panel";
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("aria-labelledby", button.id);
    panel.dataset.workspacePanel = tab.id;
    panel.hidden = index !== 0;
    panels.set(tab.id, panel);
  });

  const sourcePanel = panels.get("source");
  sourcePanel.append(...[sections.sourceState, sections.evidence, sections.sources].filter(Boolean));
  if (!sourcePanel.childElementCount) {
    sourcePanel.append(renderWorkspaceEmptyState(chapter, "No source content is available for this chapter yet."));
  }

  const visualPanel = panels.get("visual");
  visualPanel.append(renderWorkspaceResourceHeader(chapter, "Visual Note", Boolean(sections.notePreview)));
  visualPanel.append(...[sections.notePreview, sections.visualNotes, sections.artifacts].filter(Boolean));

  const cheatPanel = panels.get("cheat");
  const cheatSheet = normalizeChapterCheatSheet(artifact);
  cheatPanel.append(renderWorkspaceResourceHeader(
    chapter,
    "Cheat Sheet",
    Boolean(globalThis.ExamCramCheatSheet?.hasUsableCheatSheet?.(cheatSheet))
  ));
  if (globalThis.ExamCramCheatSheet?.hasUsableCheatSheet?.(cheatSheet)) {
    cheatPanel.append(renderChapterCheatSheet(cheatSheet));
  } else {
    cheatPanel.append(renderWorkspaceEmptyState(chapter, "The Cheat Sheet has not been generated yet."));
  }

  const summaryPanel = panels.get("summary");
  summaryPanel.append(renderWorkspaceResourceHeader(chapter, "Summary & concepts", Boolean(artifact?.summary?.length)));
  summaryPanel.append(renderArtifactSummaryResources(chapter, artifact));

  const practicePanel = panels.get("practice");
  practicePanel.append(renderWorkspaceResourceHeader(chapter, "Practice", Boolean(artifact?.reviewQuestions?.length)));
  practicePanel.append(renderArtifactPractice(chapter, artifact));

  workspace.append(tabList, ...panels.values());
  return workspace;
}

function selectChapterWorkspaceTab(tabId, tabList, panels) {
  tabList.querySelectorAll('[role="tab"]').forEach((button) => {
    const selected = button.getAttribute("aria-controls")?.endsWith(`-${tabId}`);
    button.setAttribute("aria-selected", String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
  panels.forEach((panel, id) => { panel.hidden = id !== tabId; });
}

function handleChapterWorkspaceTabKeydown(event, tabs, tabList, panels) {
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
  event.preventDefault();
  const buttons = [...tabList.querySelectorAll('[role="tab"]')];
  const current = buttons.indexOf(event.currentTarget);
  const next = event.key === "Home" ? 0
    : event.key === "End" ? buttons.length - 1
      : (current + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length;
  selectChapterWorkspaceTab(tabs[next].id, tabList, panels);
  buttons[next].focus();
}

function renderWorkspaceResourceHeader(chapter, label, available) {
  const header = document.createElement("header");
  header.className = "chapter-workspace__resource-header";
  const copy = document.createElement("div");
  const status = available
    ? chapter.resourceStatus === "outdated" ? "Update available" : "Ready"
    : chapter.resourceStatus === "failed" ? "Failed" : chapter.resourceStatus === "generating" ? "Generating" : "Not generated";
  copy.append(createText("h3", label), createText("span", status));
  const action = document.createElement("button");
  action.type = "button";
  action.textContent = available ? "Regenerate" : chapter.resourceStatus === "failed" ? "Retry" : "Generate";
  action.disabled = chapter.resourceStatus === "generating";
  action.addEventListener("click", () => void requestChapterResourceGeneration(chapter, available ? "regenerate" : "retry"));
  header.append(copy, action);
  if (chapter.resourceError) header.append(createText("p", chapter.resourceError, "chapter-workspace__error"));
  return header;
}

function renderWorkspaceEmptyState(chapter, message) {
  const state = document.createElement("div");
  state.className = "chapter-workspace__empty";
  state.append(createText("p", message));
  if (chapter.resourceStatus === "failed" && chapter.resourceError) {
    state.append(createText("p", chapter.resourceError, "chapter-workspace__error"));
  }
  return state;
}

function renderArtifactSummaryResources(chapter, artifact) {
  if (!artifact) return renderWorkspaceEmptyState(chapter, "The Summary and concept resources have not been generated yet.");
  const wrapper = document.createElement("div");
  wrapper.className = "chapter-summary-resources";
  const addList = (title, values, mapValue = (value) => value) => {
    if (!Array.isArray(values) || !values.length) return;
    const section = document.createElement("section");
    section.append(createText("h4", title));
    const list = document.createElement("ul");
    values.forEach((value) => list.append(createText("li", mapValue(value))));
    section.append(list);
    wrapper.append(section);
  };
  addList("Summary", artifact.summary);
  addList("Key concepts", artifact.keyConcepts, (concept) => `${concept.label}${concept.detail ? ` \u2014 ${concept.detail}` : ""}`);
  addList("Definitions", artifact.definitions, (definition) => `${definition.term}: ${definition.definition}`);
  addList("Formulas", artifact.formulas);
  addList("Examples", artifact.examples);
  if (!wrapper.childElementCount) wrapper.append(renderWorkspaceEmptyState(chapter, "No summary content was returned for this chapter."));
  return wrapper;
}

function renderArtifactPractice(chapter, artifact) {
  const questions = Array.isArray(artifact?.reviewQuestions) ? artifact.reviewQuestions : [];
  if (!questions.length) return renderWorkspaceEmptyState(chapter, "Review questions have not been generated yet.");
  const list = document.createElement("ol");
  list.className = "chapter-practice-list";
  questions.forEach((question) => {
    const item = document.createElement("li");
    item.append(createText("strong", question.prompt));
    if (question.choices?.length) {
      const choices = document.createElement("ul");
      question.choices.forEach((choice) => choices.append(createText("li", choice)));
      item.append(choices);
    }
    const answer = document.createElement("details");
    answer.append(
      createText("summary", "Show answer"),
      createText("p", question.answer || question.explanation || "Use the chapter evidence to check your response.")
    );
    item.append(answer);
    list.append(item);
  });
  return list;
}

async function requestChapterResourceGeneration(chapter, action) {
  const sidePanelOpen = globalThis.chrome?.sidePanel?.open ? openSidePanelFromGesture() : null;
  await setStorage(STORAGE.pendingChapterAction, {
    id: globalThis.crypto?.randomUUID?.() || `chapter-action-${Date.now()}`,
    chapterId: chapter.id,
    action,
    requestedAt: Date.now()
  });
  if (sidePanelOpen) {
    try {
      await sidePanelOpen;
      setArtifactStatus(`${action === "regenerate" ? "Regeneration" : "Retry"} queued for ${chapter.importedChapterTitle || chapter.title}.`, false);
    } catch (error) {
      setArtifactStatus(error?.message || "Open Exam-Cram to generate this chapter's resources.", true);
    }
  } else {
    setArtifactStatus("Resource generation is queued. Open Exam-Cram to continue.", false);
  }
}

function revealSelectedVisualNoteMessage() {
  page.drawer.querySelector(".chapter-note-preview")?.scrollIntoView({
    behavior: "auto",
    block: "nearest"
  });
}

function renderVisualNoteFocus(chapter, record, selectedNote) {
  const wrapper = document.createElement("div");
  wrapper.className = "selected-visual-note";
  const message = document.createElement("section");
  message.className = "chapter-focus-message";
  message.setAttribute("role", "status");
  message.setAttribute("aria-live", "polite");
  message.append(
    createText("span", "Selected Visual Note", "chapter-focus-message__eyebrow"),
    createText("h3", selectedNote.title),
    createText("p", `Saved ${formatDate(selectedNote.activityAt || selectedNote.generatedAt)} · ${selectedNote.concepts.length} grounded ${selectedNote.concepts.length === 1 ? "concept" : "concepts"}`),
    createText("small", chapter.title, "chapter-focus-message__source")
  );
  wrapper.append(message);
  const preview = renderChapterNotePreview(chapter, record, selectedNote.id);
  if (preview) wrapper.append(preview);
  const sourceSection = renderVisualNoteSources(chapter, selectedNote.id);
  if (sourceSection) wrapper.append(sourceSection);
  return wrapper;
}

function renderChapterNotePreview(chapter, record, preferredArtifactId = "") {
  const artifact = getExactChapterArtifact(record, preferredArtifactId);
  if (!artifact?.visualLesson) return null;

  const lesson = artifact.visualLesson;
  const visualModel = lesson.visualModel && typeof lesson.visualModel === "object"
    ? lesson.visualModel
    : {};
  const nodes = Array.isArray(visualModel.nodes) ? visualModel.nodes.slice(0, 7) : [];
  const section = document.createElement("section");
  section.className = "chapter-note-preview";

  const noteHeader = document.createElement("header");
  noteHeader.className = "chapter-note-preview__header";
  const noteHeading = document.createElement("div");
  noteHeading.append(
    createText("span", "Visual Tutor Note", "chapter-note-preview__eyebrow"),
    createText("h3", lesson.title || visualModel.title || artifact.title || chapter.title),
    createText(
      "p",
      visualModel.objective || lesson.objective || "Explore the connected ideas from this saved chapter note."
    )
  );
  const openNote = document.createElement("button");
  openNote.type = "button";
  openNote.className = "chapter-note-preview__open";
  openNote.textContent = "Open full note";
  openNote.setAttribute("aria-label", `Open full Visual Tutor Note ${artifact.title || chapter.title}`);
  openNote.addEventListener("click", () => void openSavedArtifact(artifact.id, openNote));
  noteHeader.append(noteHeading, openNote);
  section.append(noteHeader);

  if (nodes.length) {
    const map = document.createElement("div");
    map.className = "visual-tutor-preview";
    map.setAttribute("aria-label", "Visual Tutor Note concepts");
    const root = document.createElement("div");
    root.className = "visual-tutor-preview__root";
    root.append(
      createText("span", "Chapter model"),
      createText("strong", visualModel.title || artifact.title || chapter.title)
    );
    const nodeList = document.createElement("div");
    nodeList.className = "visual-tutor-preview__nodes";
    nodes.forEach((node, index) => {
      const nodeCard = document.createElement("article");
      nodeCard.className = "visual-tutor-preview__node";
      nodeCard.append(
        createText("span", node?.role || `Concept ${index + 1}`),
        createText("strong", node?.label || record.concepts[index]?.label || `Concept ${index + 1}`),
        createText("p", node?.detail || node?.why || "Saved concept from this visual note.")
      );
      nodeList.append(nodeCard);
    });
    map.append(root, nodeList);
    section.append(map);
  }

  const summary = Array.isArray(artifact.summary) ? artifact.summary.filter(Boolean).slice(0, 4) : [];
  if (summary.length) {
    const summaryBlock = document.createElement("div");
    summaryBlock.className = "chapter-note-summary";
    summaryBlock.append(createText("h4", "Key points"));
    const list = document.createElement("ul");
    list.append(...summary.map((point) => createText("li", point)));
    summaryBlock.append(list);
    section.append(summaryBlock);
  }

  const cheatSheet = normalizeChapterCheatSheet(artifact);
  if (globalThis.ExamCramCheatSheet?.hasUsableCheatSheet?.(cheatSheet)) {
    section.append(renderChapterCheatSheet(cheatSheet));
  }

  return section;
}

function getExactChapterArtifact(record, preferredArtifactId = "") {
  const artifactId = String(preferredArtifactId || selectedVisualNoteId || record?.latestArtifactId || "");
  return artifactId ? savedArtifacts.find((artifact) => artifact.id === artifactId) || null : null;
}

function renderVisualNoteSources(chapter, artifactId) {
  const artifact = savedArtifacts.find((item) => item.id === artifactId);
  if (!artifact) return null;
  const binding = artifact.sourceBinding && typeof artifact.sourceBinding === "object"
    ? artifact.sourceBinding
    : {};
  const embeddedSources = [
    ...(Array.isArray(artifact.sources) ? artifact.sources : []),
    ...(Array.isArray(binding.collectionSources) ? binding.collectionSources : [])
  ];
  const sourceIds = new Set([
    binding.sourceId,
    artifact.sourceId,
    ...embeddedSources.map((source) => source?.id || source?.sourceId)
  ].filter(Boolean).map(String));
  const sourceUrls = new Set([
    binding.url,
    artifact.sourceUrl,
    ...embeddedSources.map((source) => source?.url)
  ].filter(Boolean).map(String));
  let relevantSources = chapter.sources.filter((source) => (
    sourceIds.has(String(source.id || "")) || sourceUrls.has(String(source.url || ""))
  ));
  if (!relevantSources.length && embeddedSources.length) {
    relevantSources = embeddedSources.filter((source) => source && typeof source === "object");
  }
  if (!relevantSources.length) return null;
  const section = document.createElement("section");
  section.className = "summary-section source-evidence selected-note-sources";
  section.append(createText("h3", "Grounded sources"));
  const list = document.createElement("div");
  list.className = "source-leaves";
  relevantSources.forEach((source) => list.append(renderSourceCard(source)));
  section.append(list);
  return section;
}

function handlePageKeyDown(event) {
  if (event.key === "Escape" && page.drawer.classList.contains("is-open")) dismissDetails();
}

function handleStorageChanged(changes, area) {
  if (area !== "local") return;
  let shouldRender = false;
  let metricsChanged = false;
  if (changes[STORAGE.journey]) {
    journey = globalThis.ExamCramJourney.normalizeJourney(changes[STORAGE.journey].newValue);
    shouldRender = true;
  }
  if (changes[STORAGE.focus]) {
    focusState = changes[STORAGE.focus].newValue || {};
    metricsChanged = true;
  }
  if (changes[STORAGE.sessions]) {
    savedArtifacts = normalizeSavedArtifacts(changes[STORAGE.sessions].newValue);
    shouldRender = true;
  }
  if (shouldRender) render();
  else if (metricsChanged) renderHeaderMetrics();
}

function handleBeforeUnload() {
  window.removeEventListener("keydown", handlePageKeyDown);
  if (focusMetricsTimer) clearInterval(focusMetricsTimer);
  globalThis.chrome?.storage?.onChanged?.removeListener?.(handleStorageChanged);
  forestController.destroy();
}

function normalizeChapterCheatSheet(artifact) {
  const api = globalThis.ExamCramCheatSheet;
  if (!api?.normalizeCheatSheet) return artifact?.cheatSheet || null;
  const normalize = typeof api.normalizeCheatSheetForRender === "function"
    ? api.normalizeCheatSheetForRender
    : api.normalizeCheatSheet;
  const binding = artifact?.sourceBinding && typeof artifact.sourceBinding === "object"
    ? artifact.sourceBinding
    : {};
  return normalize(artifact?.cheatSheet, {
    artifact,
    title: artifact?.title || binding.title || "Study note",
    sourceTitle: binding.title || artifact?.sourceTitle || artifact?.title || "Study source",
    sourceType: binding.sourceType || binding.type || artifact?.sourceType || "webpage",
    sourceUrl: binding.url || artifact?.sourceUrl || "",
    sourceFingerprint: binding.fingerprint || artifact?.sourceFingerprint || "",
    sourceBinding: binding,
    documentType: binding.documentType || artifact?.documentType || "",
    summary: artifact?.summary || [],
    visualLesson: artifact?.visualLesson || null,
    visualModel: artifact?.visualLesson?.visualModel || null,
    videoSegments: binding.videoSegments || artifact?.videoSegments || [],
    collectionSources: binding.collectionSources || artifact?.sources || [],
    sources: artifact?.sources || binding.collectionSources || []
  });
}

function renderChapterCheatSheet(sheet) {
  const wrapper = document.createElement("section");
  wrapper.className = "chapter-cheat-sheet";
  wrapper.append(
    createText("span", "Quick reference", "chapter-note-preview__eyebrow"),
    createText("h4", sheet.title || "Chapter cheat sheet"),
    createText("p", sheet.caption || "Important ideas, rules, examples, and source evidence.")
  );
  const table = document.createElement("table");
  table.className = "chapter-cheat-sheet__table";
  const caption = document.createElement("caption");
  caption.textContent = sheet.title || "Chapter cheat sheet";
  const head = document.createElement("thead");
  const headRow = document.createElement("tr");
  headRow.append(...sheet.columns.map((column) => createText("th", column.label)));
  head.append(headRow);
  const body = document.createElement("tbody");
  sheet.rows.forEach((row) => {
    const values = {
      topic: row.topic,
      mainIdea: row.mainIdea,
      keyFacts: row.keyFacts,
      example: row.example,
      evidence: [row.evidence?.label, row.evidence?.anchor].filter(Boolean).join(" — ")
    };
    const tableRow = document.createElement("tr");
    sheet.columns.forEach((column, index) => {
      const cell = document.createElement(index === 0 ? "th" : "td");
      if (index === 0) cell.scope = "row";
      cell.dataset.label = column.label;
      cell.textContent = values[column.key] || "—";
      tableRow.append(cell);
    });
    body.append(tableRow);
  });
  table.append(caption, head, body);
  wrapper.append(table);
  return wrapper;
}

function renderArtifactCard(session) {
  const card = document.createElement("article");
  card.className = "source-leaf artifact-card";
  const copy = document.createElement("div");
  copy.className = "artifact-card-copy";
  const sourceLabel = session.sourceTitle || getSourceDomain(session.sourceUrl) || "Saved study material";
  const scoreLabel = Number.isFinite(session.score) ? ` · Score ${session.score}%` : "";
  copy.append(
    createText("strong", session.title, "artifact-card-title"),
    createText("span", `${formatArtifactKind(session)} · Saved ${formatDate(session.generatedAt)}${scoreLabel}`, "artifact-card-meta"),
    createText("span", `Source: ${sourceLabel}`, "artifact-card-source")
  );
  const open = document.createElement("button");
  open.type = "button";
  open.className = "artifact-open-button";
  open.textContent = "Open note";
  open.setAttribute("aria-label", `Open saved learning artifact ${session.title}`);
  open.addEventListener("click", () => void openSavedArtifact(session.id, open));
  card.append(copy, open);
  return card;
}

function getSourceContentForDisplay(source) {
  const rawText = String(source?.text || source?.excerpt || source?.rawText || "")
    .replace(/\r\n?/g, "\n")
    .trim()
    .slice(0, 14000);
  if (!rawText || source?.documentType !== "pdf") return rawText;
  return rawText.replace(/\s+(?=Page\s+\d+\b)/g, "\n\n");
}

function getSourceContentPreview(content, maxLength = 280) {
  const compact = String(content || "").replace(/\s+/g, " ").trim();
  if (compact.length <= maxLength) return compact;
  const clipped = compact.slice(0, maxLength + 1);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${clipped.slice(0, lastSpace > maxLength * 0.65 ? lastSpace : maxLength).trimEnd()}…`;
}

function renderSourceCard(source) {
  const card = document.createElement("div");
  card.className = "source-leaf";
  const copy = document.createElement("div");
  copy.className = "source-leaf__copy";
  const title = source.title || source.sourceTitle || getSourceDomain(source.url) || "Saved source";
  const sourceUrl = source.url || source.sourceUrl || "";
  const isPdf = source.documentType === "pdf";
  const pageCount = isPdf ? Math.max(0, Math.round(Number(source.pageCount) || 0)) : 0;
  const pageStart = isPdf ? Math.max(0, Math.round(Number(source.pageStart) || 0)) : 0;
  const pageEnd = isPdf ? Math.max(pageStart, Math.round(Number(source.pageEnd) || pageStart)) : 0;
  const sourceContent = getSourceContentForDisplay(source);
  const metadata = [
    formatSourceType(source.type || source.sourceType, source.documentType),
    pageStart ? `pages ${pageStart}${pageEnd > pageStart ? `\u2013${pageEnd}` : ""} of ${pageCount || pageEnd}` : pageCount ? `${pageCount} ${pageCount === 1 ? "page" : "pages"}` : "",
    source.fileName || "",
    `saved ${formatDate(source.capturedAt || source.createdAt || source.generatedAt)}`
  ].filter(Boolean).join(" · ");
  copy.append(
    createText("strong", title),
    createText("span", metadata, "source-leaf__meta")
  );
  if (sourceContent) {
    copy.append(createText("p", getSourceContentPreview(sourceContent), "source-leaf__preview"));
  }

  let sourceAction;
  if (sourceUrl) {
    sourceAction = document.createElement("button");
    sourceAction.type = "button";
    sourceAction.textContent = "Open";
    sourceAction.setAttribute("aria-label", source.title ? `Open ${source.title}` : `Open ${title}`);
    sourceAction.addEventListener("click", () => openSource(sourceUrl));
  } else {
    sourceAction = createText("span", isPdf ? "Local PDF" : "Local source", "source-leaf__local-badge");
  }
  card.append(copy, sourceAction);

  if (sourceContent) {
    const content = document.createElement("details");
    content.className = "source-leaf__content";
    const summary = createText(
      "summary",
      isPdf ? "Read extracted PDF content" : "Read saved source content",
      "source-leaf__content-toggle"
    );
    const body = createText("div", sourceContent, "source-leaf__content-body");
    body.setAttribute("role", "region");
    body.setAttribute("aria-label", `${title} ${isPdf ? "extracted PDF" : "saved source"} content`);
    content.append(summary, body);
    card.append(content);
  }
  return card;
}

function renderSummary(summary) {
  const section = (title, items) => {
    const wrapper = document.createElement("div");
    wrapper.className = "summary-section";
    wrapper.append(createText("h3", title));
    const list = document.createElement("ul");
    list.append(...(Array.isArray(items) ? items : []).map((item) => createText("li", item)));
    wrapper.append(list);
    return wrapper;
  };
  const overview = summary.overview || "Your journey summary is ready.";
  const evidence = summary.evidence || "Based on saved extension activity.";
  page.summary.replaceChildren(
    createText("p", overview, "summary-intro"),
    ...(evidence === overview ? [] : [createText("p", evidence, "summary-evidence")]),
    section("Progress", summary.progressHighlights || []),
    section("Connections", summary.recurringThemes || []),
    section("Still shaky", summary.knowledgeGaps || []),
    section("Next actions", summary.nextSteps || [])
  );
}

function evidenceItem(label, value) {
  const item = document.createElement("div");
  item.append(createText("span", label), createText("strong", value));
  return item;
}

function createText(tag, text, className = "") {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) element.className = className;
  return element;
}

function formatStatus(value) {
  return {
    completed: "Completed",
    current: "In progress",
    review: "Needs review",
    planned: "Planned"
  }[value] || "In progress";
}

function formatGrowthStage(record) {
  return {
    plot: "Empty plot",
    seedling: "Seedling",
    growing: "Normal tree",
    mature: "Huge tree"
  }[record?.growthStage] || "Learning tree";
}

function formatSourceType(value, documentType = "") {
  if (value === "webpage" && documentType === "pdf") return "PDF document";
  return {
    webpage: "Web page",
    video: "Video",
    notes: "Notes",
    collection: "Source collection"
  }[value] || "Study source";
}

function formatArtifactKind(session) {
  const hasQuiz = session?.itemKind === "quiz" || Number(session?.questionCount) > 0;
  if (session?.hasVisualNote && hasQuiz) return "Visual note + quiz";
  if (session?.hasVisualNote || session?.itemKind === "note") return "Visual note";
  return "Quiz evidence";
}

function getSourceDomain(value) {
  try {
    return new URL(String(value || "")).hostname.replace(/^www\./i, "");
  } catch {
    return "";
  }
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "unknown date"
    : date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

async function openSource(url) {
  const safeUrl = normalizeSafeExternalUrl(url);
  if (!safeUrl) {
    setArtifactStatus("This saved source link is not a safe HTTP or HTTPS URL.", true);
    return;
  }
  if (globalThis.chrome?.tabs?.create) await globalThis.chrome.tabs.create({ url: safeUrl });
  else window.open(safeUrl, "_blank", "noopener");
}

async function openExternalStudySuggestion(chapter, concept, suggestion, button) {
  const safeUrl = normalizeSafeExternalUrl(suggestion?.url);
  if (!safeUrl) {
    setArtifactStatus("This external suggestion is not a safe HTTP or HTTPS URL.", true);
    return;
  }
  if (button) button.disabled = true;
  const sidePanelOpen = globalThis.chrome?.sidePanel?.open ? openSidePanelFromGesture() : null;
  try {
    if (!globalThis.chrome?.tabs?.create) {
      window.open(safeUrl, "_blank", "noopener");
      setArtifactStatus("External page opened. In the installed extension, open Exam-Cram on that page and choose Save source to chapter.");
      return;
    }
    await globalThis.chrome.tabs.create({ url: safeUrl, active: true });
    await setStorage(STORAGE.pendingChapterAction, {
      id: globalThis.crypto?.randomUUID?.() || `external-source-${Date.now()}`,
      chapterId: chapter.id,
      action: "save-external-source",
      concept: normalizeExternalConceptLabel(concept),
      expectedUrl: safeUrl,
      requestedAt: Date.now()
    });
    if (sidePanelOpen) await sidePanelOpen;
    setArtifactStatus(`Opened an external ${suggestion.provider} page. Review it before saving it to ${chapter.title}.`);
  } catch (error) {
    setArtifactStatus(error?.message || "The external study suggestion could not be opened.", true);
  } finally {
    if (button) button.disabled = false;
  }
}

function normalizeSafeExternalUrl(value) {
  try {
    const url = new URL(String(value || ""));
    if (!["http:", "https:"].includes(url.protocol)) return "";
    url.username = "";
    url.password = "";
    return url.href;
  } catch {
    return "";
  }
}

function normalizeSavedArtifacts(value) {
  return Array.isArray(value) ? value.filter((artifact) => artifact?.id && typeof artifact === "object") : [];
}

async function openSavedArtifact(artifactId, button) {
  const artifact = savedArtifacts.find((item) => item.id === artifactId);
  if (!artifact) {
    setArtifactStatus("The full note is no longer in your local library. Its Journey evidence is still available.", true);
    return;
  }
  if (button) button.disabled = true;
  const exactArtifact = cloneArtifact(artifact);
  const draftSave = setStorage(STORAGE.sessionDraft, {
    savedAt: new Date().toISOString(),
    submitted: Boolean(exactArtifact.submittedAt || (exactArtifact.score !== null && exactArtifact.score !== undefined)),
    artifact: exactArtifact,
    session: exactArtifact
  });
  const sidePanelOpen = openSidePanelFromGesture();
  try {
    await draftSave;
    notifyArtifactReady(exactArtifact.id);
    await sidePanelOpen;
    setArtifactStatus(`Opened “${exactArtifact.title || "saved note"}” in Exam-Cram.`);
  } catch (error) {
    setArtifactStatus(error?.message || "The saved note could not be opened.", true);
  } finally {
    if (button) button.disabled = false;
  }
}

function openSidePanelFromGesture() {
  if (!globalThis.chrome?.sidePanel?.open) return Promise.resolve();
  const currentWindowId = globalThis.chrome?.windows?.WINDOW_ID_CURRENT ?? -2;
  return globalThis.chrome.sidePanel.open({ windowId: currentWindowId });
}

function notifyArtifactReady(artifactId) {
  if (!globalThis.chrome?.runtime?.sendMessage) return;
  globalThis.chrome.runtime.sendMessage({ type: "OPEN_JOURNEY_ARTIFACT", artifactId }, () => {
    void globalThis.chrome?.runtime?.lastError;
  });
}

function cloneArtifact(artifact) {
  return typeof structuredClone === "function"
    ? structuredClone(artifact)
    : JSON.parse(JSON.stringify(artifact));
}

function setArtifactStatus(message, isError = false) {
  page.artifactStatus.hidden = false;
  page.artifactStatus.dataset.state = isError ? "error" : "ready";
  page.artifactStatus.textContent = message;
}

async function openStudyPanel() {
  page.createNote.disabled = true;
  const sidePanelOpen = globalThis.chrome?.sidePanel?.open ? openSidePanelFromGesture() : null;
  try {
    if (!sidePanelOpen) {
      page.createNoteHelp.textContent = "Open Exam-Cram from the Chrome toolbar while viewing the page you want to study.";
      return;
    }
    await sidePanelOpen;
    page.createNoteHelp.textContent = "Exam-Cram is open. Name a Journey chapter, collect related pages, then build the visual note.";
  } catch (error) {
    page.createNoteHelp.textContent = error?.message || "Open Exam-Cram from the Chrome toolbar to create a visual note.";
  } finally {
    page.createNote.disabled = false;
  }
}

function getStorage(key, fallback) {
  if (!globalThis.chrome?.storage?.local) {
    try {
      const value = localStorage.getItem(key);
      return Promise.resolve(value ? JSON.parse(value) : fallback);
    } catch {
      return Promise.resolve(fallback);
    }
  }
  return chrome.storage.local.get(key).then((result) => result[key] ?? fallback);
}

function setStorage(key, value) {
  if (!globalThis.chrome?.storage?.local) {
    localStorage.setItem(key, JSON.stringify(value));
    return Promise.resolve();
  }
  return globalThis.chrome.storage.local.set({ [key]: value });
}

function saveSummaryThroughWorker(currentJourney, summary) {
  const message = {
    type: "JOURNEY_SAVE_SUMMARY",
    opId: globalThis.crypto?.randomUUID?.() || `summary-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    expectedRevision: currentJourney.revision,
    payload: { summary }
  };
  if (!globalThis.chrome?.runtime?.sendMessage) {
    const outcome = globalThis.ExamCramJourneyWorker.reduceJourneyOperation(currentJourney, message, Date.now());
    localStorage.setItem(STORAGE.journey, JSON.stringify(outcome.journey));
    return Promise.resolve({ journey: outcome.journey, result: outcome.result });
  }
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      const runtimeError = chrome.runtime?.lastError;
      if (runtimeError) {
        reject(new Error(runtimeError.message || "Could not contact the Journey worker."));
        return;
      }
      if (!response?.ok) {
        const error = new Error(response?.error?.message || "The Journey summary could not be saved.");
        error.code = response?.error?.code;
        reject(error);
        return;
      }
      resolve(response);
    });
  });
}
