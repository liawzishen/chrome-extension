const STORAGE = {
  journey: "examCramLearningJourney",
  focus: "examCramFocusState",
  sessions: "examCramSessions",
  sessionDraft: "examCramSessionDraft"
};

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
  createNoteHelp: document.getElementById("pageCreateNoteHelp")
};

let journey = globalThis.ExamCramJourney.createJourney();
let focusState = globalThis.ExamCramFocus?.createDefaultFocusState?.() || {};
let savedArtifacts = [];
let forestRecords = [];
let selectedChapterId = "";
let selectedConceptId = "";
let forestMode = "loading";
let drawerReturnFocus = null;
let motionPaused = Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

const forestController = globalThis.ExamCramLearningForest.mount(page.root, {
  onSelectTree({ treeId }) {
    selectedChapterId = treeId;
    selectedConceptId = "";
    renderDetails();
    closeDrawer();
  },
  onSelectConcept({ treeId, conceptId }) {
    rememberDrawerReturnFocus();
    selectedChapterId = treeId;
    selectedConceptId = conceptId;
    renderDetails();
    openDrawer("chapter");
    page.drawer.scrollTop = 0;
    page.drawer.focus({ preventScroll: true });
    requestAnimationFrame(revealSelectedConceptMessage);
  },
  onModeChange({ mode, treeId }) {
    forestMode = mode;
    if (treeId) selectedChapterId = treeId;
    page.back.hidden = !(mode === "focus" && forestRecords.length > 1);
    page.details.hidden = mode !== "focus";
    page.empty.hidden = mode !== "empty";
    if (mode === "overview") {
      selectedConceptId = "";
      page.drawer.classList.remove("is-concept-only");
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
  selectedConceptId = "";
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
window.addEventListener("beforeunload", () => forestController.destroy(), { once: true });
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && page.drawer.classList.contains("is-open")) dismissDetails();
});

if (globalThis.chrome?.storage?.onChanged) {
  globalThis.chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    let shouldRender = false;
    if (changes[STORAGE.journey]) {
      journey = globalThis.ExamCramJourney.normalizeJourney(changes[STORAGE.journey].newValue);
      shouldRender = true;
    }
    if (changes[STORAGE.focus]) {
      focusState = changes[STORAGE.focus].newValue || {};
      shouldRender = true;
    }
    if (changes[STORAGE.sessions]) {
      savedArtifacts = normalizeSavedArtifacts(changes[STORAGE.sessions].newValue);
      shouldRender = true;
    }
    if (shouldRender) render();
  });
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

function render() {
  const history = Array.isArray(focusState?.history) ? focusState.history : [];
  const metrics = globalThis.ExamCramJourney.getMetrics(journey, history);
  page.title.textContent = journey.title;
  page.progress.textContent = `${metrics.progressPercent}%`;
  page.focus.textContent = `${metrics.focusMinutes}m`;
  forestRecords = globalThis.ExamCramLearningForestData.buildForestRecords(
    journey,
    savedArtifacts,
    { getChapterStatus: globalThis.ExamCramJourney.getChapterStatus }
  );
  if (selectedChapterId && !forestRecords.some((record) => record.id === selectedChapterId)) {
    selectedChapterId = "";
    selectedConceptId = "";
  }
  if (forestRecords.length === 1) selectedChapterId = forestRecords[0].id;
  renderFallback();
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
        `${formatDate(record.createdAt)} · ${record.isSeedling ? "Seedling — build a visual note" : `${record.concepts.length} concepts`} · ${formatStatus(record.status)}`
      )
    );
    button.addEventListener("click", () => {
      rememberDrawerReturnFocus(button);
      selectedChapterId = record.id;
      selectedConceptId = "";
      if (forestController.isWebGLAvailable) forestController.focusTree(record.id);
      renderDetails();
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
  const selectedConcept = record?.concepts.find((concept) => concept.id === selectedConceptId) || null;
  page.context.hidden = Boolean(selectedConcept);
  page.drawer.classList.toggle("is-concept-only", Boolean(selectedConcept));
  page.drawerTitle.textContent = chapter?.title || "Note details";
}

function setDrawerTab(tab) {
  const summarySelected = tab === "summary";
  page.chapterTab.setAttribute("aria-selected", String(!summarySelected));
  page.summaryTab.setAttribute("aria-selected", String(summarySelected));
  page.chapterPanel.hidden = summarySelected;
  page.summaryPanel.hidden = !summarySelected;
  page.drawerTitle.textContent = summarySelected
    ? "Overall learning journey"
    : (globalThis.ExamCramJourney.findChapter(journey, selectedChapterId)?.title || "Note details");
}

function openDrawer(tab = "chapter") {
  if (tab === "chapter" && !selectedChapterId && forestRecords.length) {
    selectedChapterId = forestRecords[0].id;
    renderDetails();
  }
  setDrawerTab(tab);
  page.drawer.classList.toggle("is-concept-only", tab === "chapter" && Boolean(selectedConceptId));
  page.drawer.classList.add("is-open");
  page.drawer.setAttribute("aria-hidden", "false");
  page.root.dataset.drawer = "open";
}

function closeDrawer() {
  page.drawer.classList.remove("is-open");
  page.drawer.setAttribute("aria-hidden", "true");
  page.root.dataset.drawer = "closed";
}

function clearSelectedConcept() {
  if (!selectedConceptId) return;
  selectedConceptId = "";
  forestController.clearConceptFocus();
  renderDetails();
}

function dismissDetails() {
  const returnTarget = drawerReturnFocus;
  drawerReturnFocus = null;
  closeDrawer();
  clearSelectedConcept();
  if (returnTarget?.isConnected) {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      returnTarget.focus({ preventScroll: true });
    }));
  }
}

function openFullDetails(tab, trigger) {
  rememberDrawerReturnFocus(trigger);
  clearSelectedConcept();
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
  const lastSource = journey.lastStudySource;
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
    createText("span", "Latest learning context", "study-context-label"),
    createText("h3", `${lastSource.title} · ${lastSource.domain}`),
    createText("p", `Saved to ${lastSource.chapter} · ${formatSourceType(lastSource.type)} · ${formatDate(lastSource.capturedAt)}`, "study-context-meta")
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
  const selectedConcept = record.concepts.find((concept) => concept.id === selectedConceptId) || null;
  if (selectedConcept) {
    page.inspector.replaceChildren(renderConceptFocusMessage(chapter, record, selectedConcept));
    return;
  }
  const status = globalThis.ExamCramJourney.getChapterStatus(chapter);
  const latestSubmittedQuiz = chapter.sessions
    .filter((session) => Number.isFinite(session.score) && session.submittedAt)
    .sort((first, second) => globalThis.ExamCramJourney.sessionActivityTime(second)
      - globalThis.ExamCramJourney.sessionActivityTime(first))[0];
  const latestScore = latestSubmittedQuiz?.score ?? null;
  const weakTopics = [...new Set(chapter.sessions.flatMap((session) => session.weakTopics || []))].slice(0, 6);
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
    evidenceItem("Weak topics", weakTopics.length ? weakTopics.join(", ") : "None recorded")
  );

  const concepts = document.createElement("section");
  concepts.className = "summary-section concept-evidence";
  concepts.append(createText("h3", "Tree concepts"));
  const conceptList = document.createElement("div");
  conceptList.className = "concept-evidence__list";
  if (record.isSeedling) {
    conceptList.append(createText("p", "This chapter is a seedling. Build and save a visual note to grow grounded concept branches.", "chapter-source-state"));
  } else {
    record.concepts.forEach((concept) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "concept-evidence__item";
      item.classList.toggle("is-selected", concept.id === selectedConceptId);
      item.append(
        createText("strong", concept.label),
        createText("span", concept.detail || concept.role || "Grounded concept from the saved visual note.")
      );
      item.addEventListener("click", () => {
        forestController.focusConcept(record.id, concept.id);
      });
      conceptList.append(item);
    });
  }
  concepts.append(conceptList);

  const notePreview = renderChapterNotePreview(chapter, record);

  const sourceState = !chapter.sources.length
    ? createText("p", `${chapter.title} has no saved source yet. Collect pages or save a note to add evidence.`, "chapter-source-state")
    : null;

  const artifacts = document.createElement("section");
  artifacts.className = "summary-section artifact-evidence";
  artifacts.append(createText("h3", "Saved learning artifacts"));
  const artifactList = document.createElement("div");
  artifactList.className = "source-leaves artifact-list";
  if (!chapter.sessions.length) {
    artifactList.append(createText("p", "No saved visual notes or quizzes in this tree yet."));
  } else {
    [...chapter.sessions]
      .sort((first, second) => globalThis.ExamCramJourney.sessionActivityTime(second)
        - globalThis.ExamCramJourney.sessionActivityTime(first))
      .forEach((session) => artifactList.append(renderArtifactCard(session)));
  }
  artifacts.append(artifactList);

  const sources = document.createElement("section");
  sources.className = "summary-section source-evidence";
  sources.append(createText("h3", "Saved source snapshots"));
  const sourceList = document.createElement("div");
  sourceList.className = "source-leaves";
  chapter.sources.forEach((source) => sourceList.append(renderSourceCard(source)));
  sources.append(sourceList);

  page.inspector.replaceChildren(
    ...[
      header,
      notePreview,
      sourceState,
      evidence,
      concepts,
      artifacts,
      chapter.sources.length ? sources : null
    ].filter(Boolean)
  );
}

function revealSelectedConceptMessage() {
  page.drawer.querySelector(".chapter-focus-message")?.scrollIntoView({
    behavior: "auto",
    block: "nearest"
  });
}

function renderConceptFocusMessage(chapter, record, selectedConcept) {
  const artifact = getExactChapterArtifact(record);
  const noteTitle = artifact?.visualLesson?.title || artifact?.title || chapter.title;
  const message = document.createElement("section");
  message.className = "chapter-focus-message";
  message.setAttribute("role", "status");
  message.setAttribute("aria-live", "polite");
  message.append(
    createText("span", selectedConcept.role || "Selected chapter concept", "chapter-focus-message__eyebrow"),
    createText("h3", selectedConcept.label),
    createText("p", selectedConcept.detail || "This concept is grounded in the saved Visual Tutor Note."),
    createText("small", `${chapter.title} · ${noteTitle}`, "chapter-focus-message__source")
  );
  return message;
}

function renderChapterNotePreview(chapter, record) {
  const artifact = getExactChapterArtifact(record);
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
      const conceptId = String(node?.id || record.concepts[index]?.id || "");
      const nodeCard = document.createElement("button");
      nodeCard.type = "button";
      nodeCard.className = "visual-tutor-preview__node";
      nodeCard.classList.toggle("is-selected", Boolean(conceptId && conceptId === selectedConceptId));
      nodeCard.append(
        createText("span", node?.role || `Concept ${index + 1}`),
        createText("strong", node?.label || record.concepts[index]?.label || `Concept ${index + 1}`),
        createText("p", node?.detail || node?.why || "Saved concept from this visual note.")
      );
      nodeCard.addEventListener("click", () => {
        if (conceptId) forestController.focusConcept(record.id, conceptId);
      });
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

function getExactChapterArtifact(record) {
  const artifactId = String(record?.latestArtifactId || "");
  return artifactId ? savedArtifacts.find((artifact) => artifact.id === artifactId) || null : null;
}

function normalizeChapterCheatSheet(artifact) {
  const api = globalThis.ExamCramCheatSheet;
  if (!api?.normalizeCheatSheet) return artifact?.cheatSheet || null;
  const binding = artifact?.sourceBinding && typeof artifact.sourceBinding === "object"
    ? artifact.sourceBinding
    : {};
  return api.normalizeCheatSheet(artifact?.cheatSheet, {
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

function renderSourceCard(source) {
  const card = document.createElement("div");
  card.className = "source-leaf";
  const copy = document.createElement("div");
  copy.append(
    createText("strong", source.title),
    createText("span", `${formatSourceType(source.type, source.documentType)} · saved ${formatDate(source.capturedAt)}`)
  );
  const open = document.createElement("button");
  open.type = "button";
  open.textContent = "Open";
  open.disabled = !source.url;
  open.setAttribute("aria-label", source.url ? `Open ${source.title}` : `No saved link for ${source.title}`);
  open.addEventListener("click", () => openSource(source.url));
  card.append(copy, open);
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
