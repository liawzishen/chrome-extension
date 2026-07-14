const STORAGE_KEYS = {
  sessions: "examCramSessions",
  settings: "examCramSettings",
  exportPayload: "examCramExportPayload",
  journey: "examCramLearningJourney",
  focusState: "examCramFocusState",
  lastChapter: "examCramLastChapter",
  sessionDraft: "examCramSessionDraft",
  panelState: "examCramPanelState"
};

const DEFAULT_API_ENDPOINT = "http://127.0.0.1:8787/api/study-session";

const STOP_WORDS = new Set([
  "about", "after", "again", "also", "because", "before", "being", "between",
  "could", "during", "every", "from", "have", "into", "more", "most", "only",
  "other", "over", "should", "some", "such", "than", "that", "their", "there",
  "these", "they", "this", "through", "under", "using", "were", "when", "where",
  "which", "while", "with", "would", "your"
]);

const state = {
  currentSession: null,
  currentExportItem: null,
  currentArtifact: null,
  submitted: false,
  progressTimer: null,
  generationToken: 0,
  detectedSource: null,
  transcriptBinding: null,
  videoCaptureState: null,
  videoCaptureAuthorization: null,
  videoCaptureAuthorizationTimer: null,
  pendingVideoStudyOptions: null,
  selectedJourneyChapterId: "",
  focusState: null,
  focusCountdownTimer: null,
  sourceRefreshTimer: null,
  sourceDetectionSequence: 0,
  sourceDetectionError: "",
  importedDocument: null,
  visualModelCleanup: null,
  chapterDialogReturnFocus: null
};

const elements = {
  tabs: document.querySelectorAll(".tab"),
  views: document.querySelectorAll(".view"),
  statusText: document.getElementById("statusText"),
  accessBanner: document.getElementById("accessBanner"),
  accessBannerText: document.getElementById("accessBannerText"),
  grantCrossSiteAccessButton: document.getElementById("grantCrossSiteAccessButton"),
  progressWrap: document.getElementById("progressWrap"),
  progressBar: document.getElementById("progressBar"),
  progressLabel: document.getElementById("progressLabel"),
  studyPageButton: document.getElementById("studyPageButton"),
  studyVideoButton: document.getElementById("studyVideoButton"),
  openDocumentButton: document.getElementById("openDocumentButton"),
  documentFileInput: document.getElementById("documentFileInput"),
  addCurrentSourceButton: document.getElementById("addCurrentSourceButton"),
  refreshSourceButton: document.getElementById("refreshSourceButton"),
  openPinnedArtifactButton: document.getElementById("openPinnedArtifactButton"),
  activeSourceIcon: document.getElementById("activeSourceIcon"),
  activeSourceLabel: document.getElementById("activeSourceLabel"),
  activeSourceTitle: document.getElementById("activeSourceTitle"),
  activeSourceMeta: document.getElementById("activeSourceMeta"),
  pageChapterInput: document.getElementById("pageChapterInput"),
  notesChapterInput: document.getElementById("notesChapterInput"),
  newPageChapterButton: document.getElementById("newPageChapterButton"),
  newNotesChapterButton: document.getElementById("newNotesChapterButton"),
  newJourneyChapterButton: document.getElementById("newJourneyChapterButton"),
  newChapterDialog: document.getElementById("newChapterDialog"),
  newChapterForm: document.getElementById("newChapterForm"),
  newChapterNameInput: document.getElementById("newChapterNameInput"),
  newChapterDialogStatus: document.getElementById("newChapterDialogStatus"),
  cancelNewChapterButton: document.getElementById("cancelNewChapterButton"),
  confirmNewChapterButton: document.getElementById("confirmNewChapterButton"),
  videoTranscriptFallback: document.getElementById("videoTranscriptFallback"),
  videoTranscriptInput: document.getElementById("videoTranscriptInput"),
  videoTranscriptBinding: document.getElementById("videoTranscriptBinding"),
  videoCapturePanel: document.getElementById("videoCapturePanel"),
  videoCaptureTitle: document.getElementById("videoCaptureTitle"),
  videoCaptureStatus: document.getElementById("videoCaptureStatus"),
  startVideoCaptureButton: document.getElementById("startVideoCaptureButton"),
  stopVideoCaptureButton: document.getElementById("stopVideoCaptureButton"),
  buildCapturedVideoButton: document.getElementById("buildCapturedVideoButton"),
  videoCaptureDialog: document.getElementById("videoCaptureDialog"),
  videoCaptureDialogStatus: document.getElementById("videoCaptureDialogStatus"),
  reloadExtensionButton: document.getElementById("reloadExtensionButton"),
  cancelVideoCaptureButton: document.getElementById("cancelVideoCaptureButton"),
  confirmVideoCaptureButton: document.getElementById("confirmVideoCaptureButton"),
  studyNotesButton: document.getElementById("studyNotesButton"),
  demoNoteButton: document.getElementById("demoNoteButton"),
  pageQuestionCount: document.getElementById("pageQuestionCount"),
  pageDifficulty: document.getElementById("pageDifficulty"),
  pageQuizStyle: document.getElementById("pageQuizStyle"),
  notesInput: document.getElementById("notesInput"),
  resultView: document.getElementById("resultView"),
  sessionTitle: document.getElementById("sessionTitle"),
  sessionMeta: document.getElementById("sessionMeta"),
  summaryList: document.getElementById("summaryList"),
  cheatSheetBlock: document.getElementById("cheatSheetBlock"),
  cheatSheetIntro: document.getElementById("cheatSheetIntro"),
  cheatSheetTableHost: document.getElementById("cheatSheetTableHost"),
  noteVisual: document.getElementById("noteVisual"),
  quizBlock: document.querySelector(".quiz-block"),
  quizContainer: document.getElementById("quizContainer"),
  quizProgress: document.getElementById("quizProgress"),
  submitQuizButton: document.getElementById("submitQuizButton"),
  scoreBlock: document.getElementById("scoreBlock"),
  scoreTitle: document.getElementById("scoreTitle"),
  weakTopicText: document.getElementById("weakTopicText"),
  wrongAnswerList: document.getElementById("wrongAnswerList"),
  goalList: document.getElementById("goalList"),
  saveSessionButton: document.getElementById("saveSessionButton"),
  exportDocButton: document.getElementById("exportDocButton"),
  exportPdfButton: document.getElementById("exportPdfButton"),
  closeSessionButton: document.getElementById("closeSessionButton"),
  artifactSourceBanner: document.getElementById("artifactSourceBanner"),
  generateQuizButton: document.getElementById("generateQuizButton"),
  saveArtifactButton: document.getElementById("saveArtifactButton"),
  exportButton: document.getElementById("exportButton"),
  quizSettingsDialog: document.getElementById("quizSettingsDialog"),
  quizSourceLabel: document.getElementById("quizSourceLabel"),
  confirmGenerateQuizButton: document.getElementById("confirmGenerateQuizButton"),
  libraryList: document.getElementById("libraryList"),
  clearLibraryButton: document.getElementById("clearLibraryButton"),
  journeyTitle: document.getElementById("journeyTitle"),
  journeyMetrics: document.getElementById("journeyMetrics"),
  journeyRoute: document.getElementById("journeyRoute"),
  journeyChapterDetail: document.getElementById("journeyChapterDetail"),
  journeyRange: document.getElementById("journeyRange"),
  summarizeJourneyButton: document.getElementById("summarizeJourneyButton"),
  journeySummary: document.getElementById("journeySummary"),
  openJourneyButton: document.getElementById("openJourneyButton"),
  focusQuickToggle: document.getElementById("focusQuickToggle"),
  focusQuickLabel: document.getElementById("focusQuickLabel"),
  focusStateBadge: document.getElementById("focusStateBadge"),
  focusCountdown: document.getElementById("focusCountdown"),
  focusCountdownLabel: document.getElementById("focusCountdownLabel"),
  focusDuration: document.getElementById("focusDuration"),
  focusCustomDurationWrap: document.getElementById("focusCustomDurationWrap"),
  focusCustomDuration: document.getElementById("focusCustomDuration"),
  focusSitesInput: document.getElementById("focusSitesInput"),
  startFocusButton: document.getElementById("startFocusButton"),
  focusBreakButton: document.getElementById("focusBreakButton"),
  stopFocusButton: document.getElementById("stopFocusButton"),
  focusHistory: document.getElementById("focusHistory"),
  settingsButton: document.getElementById("settingsButton"),
  settingsDialog: document.getElementById("settingsDialog"),
  apiEndpointInput: document.getElementById("apiEndpointInput"),
  backendTokenInput: document.getElementById("backendTokenInput"),
  saveSettingsButton: document.getElementById("saveSettingsButton")
};

init();

function init() {
  elements.tabs.forEach((tab) => {
    tab.setAttribute("aria-controls", tab.dataset.view);
    const selected = tab.classList.contains("active");
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
    tab.addEventListener("click", () => switchView(tab.dataset.view));
    tab.addEventListener("keydown", handleStudyModeKeydown);
  });

  elements.studyPageButton.addEventListener("click", handleStudyPage);
  elements.studyVideoButton?.addEventListener("click", handleStudyVideo);
  elements.openDocumentButton?.addEventListener("click", () => elements.documentFileInput?.click());
  elements.documentFileInput?.addEventListener("change", handleDocumentFileSelected);
  elements.addCurrentSourceButton?.addEventListener("click", handleAddCurrentSource);
  elements.refreshSourceButton?.addEventListener("click", handleRefreshSource);
  elements.openPinnedArtifactButton?.addEventListener("click", openPinnedArtifact);
  elements.grantCrossSiteAccessButton?.addEventListener("click", handleGrantCrossSiteAccess);
  elements.videoTranscriptInput?.addEventListener("input", handleTranscriptInput);
  elements.notesInput?.addEventListener("input", () => void savePanelState());
  elements.pageChapterInput?.addEventListener("change", handleChapterSelectionChange);
  elements.notesChapterInput?.addEventListener("change", handleChapterSelectionChange);
  elements.newPageChapterButton?.addEventListener("click", openNewChapterDialog);
  elements.newNotesChapterButton?.addEventListener("click", openNewChapterDialog);
  elements.newJourneyChapterButton?.addEventListener("click", openNewChapterDialog);
  elements.newChapterForm?.addEventListener("submit", handleCreateChapter);
  elements.cancelNewChapterButton?.addEventListener("click", closeNewChapterDialog);
  elements.newChapterDialog?.addEventListener("close", restoreChapterDialogFocus);
  elements.pageDifficulty?.addEventListener("change", () => void savePanelState());
  elements.pageQuestionCount?.addEventListener("change", () => void savePanelState());
  elements.pageQuizStyle?.addEventListener("change", () => void savePanelState());
  elements.startVideoCaptureButton?.addEventListener("click", openVideoCaptureConsent);
  elements.confirmVideoCaptureButton?.addEventListener("click", handleStartVideoCapture);
  elements.videoCaptureDialog?.addEventListener("close", handleVideoCaptureDialogClosed);
  elements.reloadExtensionButton?.addEventListener("click", handleReloadExtension);
  elements.stopVideoCaptureButton?.addEventListener("click", handleStopVideoCapture);
  elements.buildCapturedVideoButton?.addEventListener("click", handleBuildCapturedVideoLesson);
  elements.studyNotesButton.addEventListener("click", handleStudyNotes);
  elements.demoNoteButton?.addEventListener("click", handleDemoNote);
  elements.submitQuizButton.addEventListener("click", handleSubmitQuiz);
  elements.generateQuizButton?.addEventListener("click", openQuizSettings);
  elements.confirmGenerateQuizButton?.addEventListener("click", handleGenerateQuiz);
  elements.saveArtifactButton?.addEventListener("click", handleSaveArtifact);
  elements.exportButton?.addEventListener("click", handleOpenExport);
  elements.saveSessionButton.addEventListener("click", handleSaveSession);
  elements.exportDocButton?.addEventListener("click", handleExportDocument);
  elements.exportPdfButton?.addEventListener("click", handleExportPdf);
  elements.closeSessionButton.addEventListener("click", closeSession);
  elements.clearLibraryButton.addEventListener("click", handleClearLibrary);
  elements.summarizeJourneyButton?.addEventListener("click", handleSummarizeJourney);
  elements.openJourneyButton?.addEventListener("click", openFullJourney);
  elements.startFocusButton?.addEventListener("click", handleStartFocus);
  elements.focusBreakButton?.addEventListener("click", handleFocusBreak);
  elements.stopFocusButton?.addEventListener("click", handleStopFocus);
  elements.focusQuickToggle?.addEventListener("change", handleQuickFocusToggle);
  elements.focusDuration?.addEventListener("change", () => {
    syncCustomFocusDurationControl();
    if (!state.focusState?.active) renderFocusState();
  });
  elements.focusCustomDuration?.addEventListener("input", () => {
    if (!state.focusState?.active) renderFocusState();
  });
  elements.settingsButton.addEventListener("click", openSettings);
  elements.saveSettingsButton.addEventListener("click", saveSettings);
  elements.apiEndpointInput?.addEventListener("change", handleBackendEndpointChange);

  void initializePersistentPanel();
  loadSettings();
  syncCustomFocusDurationControl();
  renderLibrary();
  void loadFocusState();
  void loadVideoCaptureState();
  void loadVideoCaptureAuthorizationState();
  void refreshCrossSiteAccessState();

  if (globalThis.chrome?.tabs?.onActivated) {
    globalThis.chrome.tabs.onActivated.addListener(() => scheduleSourceRefresh());
  }
  if (globalThis.chrome?.tabs?.onUpdated) {
    globalThis.chrome.tabs.onUpdated.addListener((_tabId, changeInfo) => {
      if (changeInfo.status === "complete" || changeInfo.url) scheduleSourceRefresh();
    });
  }

  if (globalThis.chrome?.runtime?.onMessage) {
    globalThis.chrome.runtime.onMessage.addListener((message, sender) => {
      if (sender?.id !== globalThis.chrome.runtime.id) return;
      if (message?.type === "FOCUS_STATE_CHANGED") {
        state.focusState = message.state || null;
        renderFocusState();
      }
      if (message?.type === "VIDEO_CAPTURE_STATE_CHANGED") {
        state.videoCaptureState = message.state || null;
        renderVideoCaptureState();
        if (["starting", "recording"].includes(state.videoCaptureState?.status)) {
          state.videoCaptureAuthorization = null;
          if (elements.videoCaptureDialog?.open) elements.videoCaptureDialog.close();
          resetVideoCaptureAuthorizationUi();
        }
      }
      if (message?.type === "VIDEO_CAPTURE_AUTHORIZATION_CHANGED") {
        state.videoCaptureAuthorization = message.state || null;
        renderVideoCaptureAuthorization();
      }
      if (message?.type === "OPEN_JOURNEY_ARTIFACT" && message.artifactId) {
        const senderUrl = String(sender?.url || sender?.tab?.url || "").split("#", 1)[0].split("?", 1)[0];
        if (senderUrl !== globalThis.chrome.runtime.getURL("journey.html")) return;
        void openJourneyArtifact(String(message.artifactId), { preferDraft: true }).catch((error) => {
          showStatus(error?.message || "The saved note could not be opened.", true);
        });
      }
    });
  }

  if (globalThis.chrome?.storage?.onChanged) {
    globalThis.chrome.storage.onChanged.addListener((changes, areaName) => {
      const draft = changes?.[STORAGE_KEYS.sessionDraft]?.newValue;
      if (areaName !== "local" || !draft || state.currentArtifact || state.currentSession) return;
      void maybeRestoreSessionDraft().catch((error) => {
        showStatus(error?.message || "The saved note could not be restored.", true);
      });
    });
  }
}

function scheduleSourceRefresh() {
  clearTimeout(state.sourceRefreshTimer);
  state.sourceRefreshTimer = setTimeout(() => {
    state.detectedSource = null;
    reconcileTranscriptBinding(null);
    void refreshCrossSiteAccessState();
    void detectActiveSource();
  }, 220);
}

async function initializePersistentPanel() {
  let initialView = "pageView";
  let restoredArtifact = false;
  try {
    initialView = await loadPanelState();
    restoredArtifact = await maybeRestoreSessionDraft();
    await loadJourney();
    if (!restoredArtifact && initialView === "journeyView") await renderJourney();
    if (!restoredArtifact && initialView === "libraryView") await renderLibrary();
  } catch (error) {
    showStatus(error?.message || "Could not restore the pinned note.", true);
  }
  await detectActiveSource();
}

async function handleRefreshSource() {
  if (elements.refreshSourceButton) elements.refreshSourceButton.disabled = true;
  try {
    state.importedDocument = null;
    const refreshed = await detectActiveSource();
    showStatus(refreshed
      ? "Current page refreshed. Your pinned note is unchanged."
      : state.sourceDetectionError || "The current page changed while it was being checked. Refresh again when it finishes loading.", !refreshed);
  } finally {
    if (elements.refreshSourceButton) elements.refreshSourceButton.disabled = false;
  }
}

async function refreshCrossSiteAccessState() {
  if (!elements.accessBanner || !globalThis.chrome?.permissions?.contains) return false;
  const permissionPattern = await getCurrentPagePermissionPattern();
  if (!permissionPattern) {
    elements.accessBanner.classList.add("hidden");
    return false;
  }
  const granted = await new Promise((resolve) => {
    chrome.permissions.contains({ origins: [permissionPattern] }, (value) => {
      resolve(!chrome.runtime?.lastError && Boolean(value));
    });
  });
  elements.accessBanner.classList.toggle("hidden", granted);
  if (!granted && elements.accessBannerText) {
    elements.accessBannerText.textContent = permissionPattern === "file:///*"
      ? "Grant file access only when you want Exam-Cram to read a local HTML or PDF source."
      : "Grant access to this website only. Exam-Cram reads its page after you choose a study action.";
    elements.grantCrossSiteAccessButton.textContent = permissionPattern === "file:///*" ? "Allow this file" : "Allow this site";
  }
  return granted;
}

async function handleGrantCrossSiteAccess() {
  if (!globalThis.chrome?.permissions?.request) return;
  elements.grantCrossSiteAccessButton.disabled = true;
  try {
    const permissionPattern = await getCurrentPagePermissionPattern();
    if (!permissionPattern) throw new Error("Chrome does not allow extensions to read this browser page.");
    const granted = await new Promise((resolve, reject) => {
      chrome.permissions.request({ origins: [permissionPattern] }, (value) => {
        const error = chrome.runtime?.lastError;
        if (error) reject(error);
        else resolve(Boolean(value));
      });
    });
    if (!granted) throw new Error("Page access was not granted. Exam-Cram will stay open without reading this source.");
    await refreshCrossSiteAccessState();
    await detectActiveSource();
    showStatus("This source is available. Its content is read only when you choose a study action.");
  } catch (error) {
    showStatus(error?.message || "Could not request page access.", true);
  } finally {
    elements.grantCrossSiteAccessButton.disabled = false;
  }
}

async function getCurrentPagePermissionPattern() {
  const tab = await getActiveTab().catch(() => null);
  try {
    const url = new URL(String(tab?.url || ""));
    if (url.protocol === "file:") return "file:///*";
    if (!["http:", "https:"].includes(url.protocol)) return "";
    const bareHostname = url.hostname.replace(/^\[|\]$/g, "");
    const hostname = bareHostname.includes(":") ? `[${bareHostname}]` : bareHostname;
    return `${url.protocol}//${hostname}/*`;
  } catch {
    return "";
  }
}

async function loadPanelState() {
  const saved = await getStorage(STORAGE_KEYS.panelState, {});
  if (typeof saved.notesInput === "string") elements.notesInput.value = saved.notesInput;
  if (elements.pageChapterInput) {
    elements.pageChapterInput.dataset.restoreChapterId = typeof saved.pageChapterId === "string" ? saved.pageChapterId : "";
    elements.pageChapterInput.dataset.restoreChapterTitle = typeof saved.pageChapter === "string" ? saved.pageChapter : "";
  }
  if (elements.notesChapterInput) {
    elements.notesChapterInput.dataset.restoreChapterId = typeof saved.notesChapterId === "string" ? saved.notesChapterId : "";
    elements.notesChapterInput.dataset.restoreChapterTitle = typeof saved.notesChapter === "string" ? saved.notesChapter : "";
  }
  if (elements.pageDifficulty?.querySelector(`option[value="${cssEscape(saved.difficulty || "")}"]`)) elements.pageDifficulty.value = saved.difficulty;
  if (elements.pageQuestionCount?.querySelector(`option[value="${cssEscape(saved.questionCount || "")}"]`)) elements.pageQuestionCount.value = saved.questionCount;
  if (elements.pageQuizStyle?.querySelector(`option[value="${cssEscape(saved.quizStyle || "")}"]`)) elements.pageQuizStyle.value = saved.quizStyle;
  const initialView = saved.activeView && document.getElementById(saved.activeView)
    ? saved.activeView
    : "pageView";
  if (initialView) {
    switchView(initialView, { skipViewLoad: true, skipSave: true });
  }
  return initialView;
}

async function savePanelState(overrides = {}) {
  const activeView = [...elements.tabs].find((tab) => tab.classList.contains("active"))?.dataset.view || "pageView";
  const pageChapter = getSelectedChapterBinding(elements.pageChapterInput, { required: false });
  const notesChapter = getSelectedChapterBinding(elements.notesChapterInput, { required: false });
  await setStorage(STORAGE_KEYS.panelState, {
    activeView,
    notesInput: elements.notesInput?.value || "",
    pageChapterId: pageChapter.chapterId,
    pageChapter: pageChapter.chapterTitle,
    notesChapterId: notesChapter.chapterId,
    notesChapter: notesChapter.chapterTitle,
    difficulty: elements.pageDifficulty?.value || "normal",
    questionCount: elements.pageQuestionCount?.value || "5",
    quizStyle: elements.pageQuizStyle?.value || "mixed",
    ...overrides
  });
}

function updateStudyModeSelection(viewId = "") {
  elements.tabs.forEach((tab, index) => {
    const selected = tab.dataset.view === viewId;
    tab.classList.toggle("active", selected);
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected || (!viewId && index === 0) ? 0 : -1;
  });
}

function handleStudyModeKeydown(event) {
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
  const tabs = [...elements.tabs];
  const currentIndex = tabs.indexOf(event.currentTarget);
  if (currentIndex < 0 || !tabs.length) return;
  event.preventDefault();
  const nextIndex = event.key === "Home"
    ? 0
    : event.key === "End"
      ? tabs.length - 1
      : event.key === "ArrowRight"
        ? (currentIndex + 1) % tabs.length
        : (currentIndex - 1 + tabs.length) % tabs.length;
  const nextTab = tabs[nextIndex];
  nextTab.focus();
  switchView(nextTab.dataset.view);
}

function switchView(viewId, options = {}) {
  updateStudyModeSelection(viewId);
  elements.views.forEach((view) => {
    const active = view.id === viewId;
    view.classList.toggle("active", active);
    view.setAttribute("aria-hidden", String(!active));
  });
  elements.resultView.classList.add("hidden");
  elements.resultView.setAttribute("aria-hidden", "true");
  if (!options.skipViewLoad && viewId === "libraryView") {
    renderLibrary();
  } else if (!options.skipViewLoad && viewId === "journeyView") {
    void renderJourney();
  } else if (!options.skipViewLoad && viewId === "focusView") {
    void loadFocusState();
  } else if (!options.skipViewLoad && viewId === "pageView") {
    void detectActiveSource();
  }
  if (!options.skipSave) void savePanelState({ activeView: viewId });
}

async function handleStudyPage() {
  const generationToken = ++state.generationToken;
  setBusy(true, "Reading current page...");
  startProgress("Reading page content...", 8);
  try {
    const page = state.importedDocument || await extractCurrentPage();
    globalThis.ExamCramDocumentReader.assertReadableContent(page.text, page.documentType || "html");
    updateGenerationProgress(25, "Creating a source-grounded visual note...");
    await createAndRecordStudyArtifact({
      title: page.title || "Current page",
      sourceType: "webpage",
      sourceUrl: page.url,
      sourceTabId: page.sourceTabId,
      sourceFingerprint: page.sourceFingerprint,
      documentType: page.documentType || "html",
      pageCount: page.pageCount || 0,
      rawText: page.text,
      ...getSelectedChapterBinding(elements.pageChapterInput),
      generationToken
    });
    finishProgress("Visual note ready.");
    showStatus("Visual note created. Generate a quiz only when you are ready to practise.");
  } catch (error) {
    if (generationToken === state.generationToken) {
      failProgress("Page study failed.");
      showStatus(error.message, true);
    }
  } finally {
    if (generationToken === state.generationToken) {
      setBusy(false);
    }
  }
}

function getSelectedChapterTitle(inputElement) {
  return getSelectedChapterBinding(inputElement, { required: false }).chapterTitle || "No chapter selected";
}

function getSelectedChapterBinding(selectElement, options = {}) {
  const chapterId = String(selectElement?.value || "").trim().slice(0, 100);
  const selectedOption = selectElement?.selectedOptions?.[0]
    || selectElement?.querySelector?.(`option[value="${cssEscape(chapterId)}"]`);
  const chapterTitle = String(selectedOption?.dataset?.chapterTitle || selectedOption?.textContent || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 140);
  if (!chapterId && options.required !== false) {
    throw new Error("Choose a Journey chapter or create a new one first.");
  }
  return { chapterId, chapterTitle: chapterId ? chapterTitle : "" };
}

function handleChapterSelectionChange(event) {
  const chapterId = String(event?.currentTarget?.value || "");
  selectChapterAcrossControls(chapterId);
  void savePanelState();
}

function selectChapterAcrossControls(chapterId) {
  const safeId = String(chapterId || "");
  [elements.pageChapterInput, elements.notesChapterInput].forEach((select) => {
    if (!select) return;
    const option = [...select.options].find((item) => item.value === safeId);
    select.value = option ? safeId : "";
  });
  state.selectedJourneyChapterId = safeId;
}

function openNewChapterDialog(event) {
  if (!elements.newChapterDialog || !elements.newChapterNameInput) return;
  state.chapterDialogReturnFocus = event?.currentTarget || document.activeElement;
  elements.newChapterForm?.reset();
  if (elements.newChapterDialogStatus) {
    elements.newChapterDialogStatus.textContent = "";
    elements.newChapterDialogStatus.classList.add("hidden");
  }
  if (!elements.newChapterDialog.open) elements.newChapterDialog.showModal();
  requestAnimationFrame(() => elements.newChapterNameInput.focus());
}

function closeNewChapterDialog() {
  if (elements.newChapterDialog?.open) elements.newChapterDialog.close("cancel");
}

function restoreChapterDialogFocus() {
  const target = state.chapterDialogReturnFocus;
  state.chapterDialogReturnFocus = null;
  if (target?.isConnected) target.focus();
}

async function handleCreateChapter(event) {
  event.preventDefault();
  const title = String(elements.newChapterNameInput?.value || "").replace(/\s+/g, " ").trim().slice(0, 140);
  if (!title) {
    elements.newChapterNameInput?.focus();
    showNewChapterDialogStatus("Enter a chapter name.");
    return;
  }
  if (elements.confirmNewChapterButton) elements.confirmNewChapterButton.disabled = true;
  try {
    const created = await mutateJourney("JOURNEY_CREATE_CHAPTER", { title });
    const chapter = globalThis.ExamCramJourney.findChapter(created.journey, created.result?.chapterId);
    if (!chapter) throw new Error("The new chapter could not be selected.");
    selectChapterAcrossControls(chapter.id);
    await setStorage(STORAGE_KEYS.lastChapter, chapter.title);
    await savePanelState();
    if (created.result?.duplicate) {
      showNewChapterDialogStatus(`“${chapter.title}” already exists and is now selected. Enter a different name to grow another tree.`);
      return;
    }
    if (elements.newChapterDialog?.open) elements.newChapterDialog.close("created");
    showStatus(`${chapter.title} is ready. Your next note or saved source will grow on its own tree.`);
    if (document.getElementById("journeyView")?.classList.contains("active")) await renderJourney();
  } catch (error) {
    showNewChapterDialogStatus(error?.message || "The chapter could not be created.");
  } finally {
    if (elements.confirmNewChapterButton) elements.confirmNewChapterButton.disabled = false;
  }
}

function showNewChapterDialogStatus(message) {
  if (!elements.newChapterDialogStatus) return;
  elements.newChapterDialogStatus.textContent = String(message || "");
  elements.newChapterDialogStatus.classList.remove("hidden");
}

async function handleDocumentFileSelected(event) {
  const file = event?.target?.files?.[0];
  if (!file) return;
  elements.openDocumentButton.disabled = true;
  showStatus(`Reading ${file.name} locally...`);
  try {
    const documentSource = await extractSelectedDocumentFile(file);
    globalThis.ExamCramDocumentReader.assertReadableContent(documentSource.text, documentSource.documentType || "html");
    state.importedDocument = documentSource;
    state.detectedSource = {
      type: documentSource.documentType,
      hasVideo: false,
      title: documentSource.title,
      url: "",
      imported: true,
      pageCount: documentSource.pageCount || 0
    };
    elements.activeSourceIcon.textContent = documentSource.documentType === "pdf" ? "PDF" : "H";
    if (elements.activeSourceLabel) elements.activeSourceLabel.textContent = "Selected local file";
    elements.activeSourceTitle.textContent = documentSource.title;
    elements.activeSourceMeta.textContent = documentSource.documentType === "pdf"
      ? `${documentSource.pageCount} ${documentSource.pageCount === 1 ? "page" : "pages"} · ready to create a visual note`
      : "HTML document · ready to create a visual note";
    elements.studyPageButton.textContent = "Create note from document";
    showStatus(`${file.name} is ready. Only its bounded extracted text will be used when you create the note.`);
  } catch (error) {
    state.importedDocument = null;
    showStatus(error?.message || "This document could not be opened safely.", true);
  } finally {
    event.target.value = "";
    elements.openDocumentButton.disabled = false;
  }
}

async function extractSelectedDocumentFile(file) {
  const Reader = globalThis.ExamCramDocumentReader;
  if (!Reader) throw new Error("The document reader is unavailable. Reload Exam-Cram from chrome://extensions and try again.");
  const name = String(file?.name || "Local document").slice(0, 180);
  const hintedKind = /\.pdf$/i.test(name) || file?.type === "application/pdf" ? "pdf" : "html";
  const maxBytes = hintedKind === "pdf" ? Reader.MAX_PDF_BYTES : Reader.MAX_HTML_BYTES;
  if (!Number.isFinite(file?.size) || file.size < 1 || file.size > maxBytes) {
    throw new Reader.DocumentReaderError(
      hintedKind === "pdf" ? "PDF_TOO_LARGE" : "HTML_TOO_LARGE",
      hintedKind === "pdf" ? "This PDF is larger than the 24 MB reading limit." : "This HTML document is larger than the 5 MB reading limit."
    );
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = Reader.classifyFetchedDocument({ bytes, contentType: file.type, url: name, expectedKind: hintedKind });
  if (kind === "pdf") {
    const parsed = await Reader.extractPdfText(bytes, await getPdfJs(), {
      fallbackTitle: name.replace(/\.pdf$/i, ""),
      workerSrc: getPdfWorkerUrl(),
      maxBytes: Reader.MAX_PDF_BYTES,
      maxPages: Reader.MAX_PDF_PAGES,
      maxText: Reader.MAX_EXTRACTED_TEXT,
      timeoutMs: Reader.DOCUMENT_PARSE_TIMEOUT_MS
    });
    return {
      ...parsed,
      title: parsed.title || name,
      url: "",
      sourceTabId: null,
      sourceFingerprint: makeContentFingerprint(parsed.text),
      documentType: "pdf",
      imported: true
    };
  }
  const parsed = Reader.extractHtmlText(Reader.decodeHtmlBytes(bytes), name.replace(/\.html?$/i, ""));
  return {
    ...parsed,
    title: parsed.title || name,
    url: "",
    sourceTabId: null,
    sourceFingerprint: makeContentFingerprint(parsed.text),
    documentType: "html",
    imported: true
  };
}

async function detectActiveSource() {
  if (!elements.activeSourceTitle) return;
  if (state.importedDocument) {
    if (elements.activeSourceLabel) elements.activeSourceLabel.textContent = "Selected local file";
    elements.activeSourceIcon.textContent = state.importedDocument.documentType === "pdf" ? "PDF" : "H";
    elements.activeSourceTitle.textContent = state.importedDocument.title;
    elements.activeSourceMeta.textContent = state.importedDocument.documentType === "pdf"
      ? `${state.importedDocument.pageCount || 0} pages · ready to create a visual note`
      : "HTML document · ready to create a visual note";
    elements.studyPageButton.textContent = "Create note from document";
    return true;
  }
  const detectionSequence = ++state.sourceDetectionSequence;
  state.sourceDetectionError = "";
  if (!hasChromeTabs() || !hasChromeScripting()) {
    state.sourceDetectionError = "";
    state.detectedSource = { type: "preview", hasVideo: false };
    elements.activeSourceIcon.textContent = "R";
    if (elements.activeSourceLabel) elements.activeSourceLabel.textContent = "Current page";
    elements.activeSourceTitle.textContent = "Browser source detection";
    elements.activeSourceMeta.textContent = "Available after loading this as a Chrome extension.";
    elements.studyPageButton.textContent = "Create note from page";
    return true;
  }
  elements.activeSourceMeta.textContent = "Checking the active tab...";
  if (elements.activeSourceLabel) elements.activeSourceLabel.textContent = "Current page";
  elements.studyPageButton.textContent = "Create note from page";
  let tab = null;
  let documentDescriptor = null;
  try {
    tab = await getActiveTab();
    if (detectionSequence !== state.sourceDetectionSequence) return false;
    if (!Number.isInteger(tab?.id)) throw new Error("Open an HTML page, PDF document, or video.");
    const Reader = globalThis.ExamCramDocumentReader;
    if (!Reader) throw new Error("The document reader is unavailable. Reload Exam-Cram from chrome://extensions.");
    const descriptor = Reader.classifyTabDocument(tab.url || "");
    documentDescriptor = descriptor;
    if (descriptor.local || descriptor.kind === "pdf") {
      await ensureDocumentUrlAccess(descriptor.url, { request: false });
    }
    const identity = descriptor.kind === "pdf" ? null : await readCurrentVideoIdentity(tab.id);
    if (detectionSequence !== state.sourceDetectionSequence) return false;
    const stillActiveTab = await getActiveTab();
    if (detectionSequence !== state.sourceDetectionSequence) return false;
    if (stillActiveTab?.id !== tab.id || !samePageUrl(stillActiveTab?.url, tab.url)) return false;
    const nextSource = {
      type: identity ? "video" : descriptor.kind === "pdf" ? "pdf" : "webpage",
      hasVideo: Boolean(identity),
      tabId: tab.id,
      url: descriptor.url,
      title: identity?.title || tab.title || (descriptor.kind === "pdf" ? "PDF document" : "Current webpage"),
      documentType: descriptor.kind,
      durationMs: identity?.durationMs || 0,
      mediaId: identity?.mediaId || "",
      currentSrc: identity?.currentSrc || "",
      poster: identity?.poster || "",
      tracks: identity?.tracks || [],
      seekable: Boolean(identity?.seekable)
    };
    reconcileTranscriptBinding(nextSource);
    state.detectedSource = nextSource;
    state.sourceDetectionError = "";
    elements.activeSourceIcon.textContent = identity ? "V" : descriptor.kind === "pdf" ? "PDF" : "P";
    elements.activeSourceTitle.textContent = state.detectedSource.title;
    elements.activeSourceMeta.textContent = identity
      ? `Video detected · ${formatTimestamp(identity.durationMs / 1000)} · captions will be checked when you study it`
      : descriptor.kind === "pdf" ? "PDF text is ready to read" : `${new URL(descriptor.url).hostname || "Local file"} · HTML text ready to read`;
    const sourceUrl = new URL(descriptor.url);
    const hostname = sourceUrl.protocol === "file:" ? "Local file" : sourceUrl.hostname.replace(/^www\./i, "");
    const selectedChapter = getSelectedChapterTitle(elements.pageChapterInput);
    elements.activeSourceTitle.textContent = `${state.detectedSource.title} · ${hostname}`;
    elements.activeSourceMeta.textContent = identity
      ? `Readable video · ${formatTimestamp(identity.durationMs / 1000)} · Selected chapter: ${selectedChapter}`
      : descriptor.kind === "pdf"
        ? `Readable PDF document · Selected chapter: ${selectedChapter}`
        : `Readable HTML page · Selected chapter: ${selectedChapter}`;
    elements.studyVideoButton.disabled = !identity && !elements.videoTranscriptInput?.value.trim();
    renderVideoCaptureState();
    return true;
  } catch (error) {
    if (detectionSequence !== state.sourceDetectionSequence) return false;
    state.sourceDetectionError = error?.message || "Could not inspect this tab.";
    reconcileTranscriptBinding(null);
    state.detectedSource = null;
    elements.activeSourceIcon.textContent = "!";
    elements.activeSourceTitle.textContent = "Source unavailable";
    elements.activeSourceMeta.textContent = error.message || "Could not inspect this tab.";
    const permissionProblem = /cannot access|cannot read|host permission|permission/i.test(error?.message || "");
    const hostname = (() => {
      try {
        const source = new URL(documentDescriptor?.url || tab?.url || "");
        return source.protocol === "file:" ? "Local file" : source.hostname.replace(/^www\./i, "");
      } catch {
        return "this website";
      }
    })();
    if (permissionProblem) {
      elements.activeSourceTitle.textContent = "Permission needed for this page";
      elements.activeSourceMeta.textContent = `${hostname} · Allow page access to read it · Selected chapter: ${getSelectedChapterTitle(elements.pageChapterInput)}`;
      elements.accessBanner?.classList.remove("hidden");
    }
    elements.studyVideoButton.disabled = !elements.videoTranscriptInput?.value.trim();
    renderVideoCaptureState();
    return false;
  }
}

function handleTranscriptInput() {
  const value = elements.videoTranscriptInput?.value.trim() || "";
  if (!value) {
    state.transcriptBinding = null;
  } else if (!state.transcriptBinding) {
    state.transcriptBinding = makeTranscriptBinding(state.detectedSource);
  }
  renderTranscriptBinding();
  if (elements.studyVideoButton) {
    elements.studyVideoButton.disabled = !state.detectedSource?.hasVideo && !value;
  }
}

function makeTranscriptBinding(source) {
  if (!source || source.type === "preview") return null;
  return {
    tabId: Number.isInteger(source.tabId) ? source.tabId : null,
    url: String(source.url || ""),
    mediaId: String(source.mediaId || ""),
    title: String(source.title || "Current video").slice(0, 180)
  };
}

function transcriptBindingMatches(binding, source) {
  if (!binding || !source) return false;
  return binding.tabId === source.tabId
    && samePageUrl(binding.url, source.url)
    && (!binding.mediaId || !source.mediaId || binding.mediaId === source.mediaId);
}

function reconcileTranscriptBinding(nextSource) {
  if (!elements.videoTranscriptInput?.value.trim() || !state.transcriptBinding) return;
  if (transcriptBindingMatches(state.transcriptBinding, nextSource)) return;
  elements.videoTranscriptInput.value = "";
  state.transcriptBinding = null;
  if (elements.videoTranscriptFallback) elements.videoTranscriptFallback.open = false;
  renderTranscriptBinding();
  showStatus("Cleared the pasted transcript because the active source changed.", true);
}

function renderTranscriptBinding() {
  if (!elements.videoTranscriptBinding) return;
  const binding = state.transcriptBinding;
  elements.videoTranscriptBinding.classList.toggle("hidden", !binding);
  elements.videoTranscriptBinding.textContent = binding
    ? `Bound to: ${binding.title}`
    : "";
}

async function readCurrentVideoIdentity(tabId) {
  if (!Number.isInteger(tabId) || !hasChromeScripting()) return null;
  const [result] = await globalThis.chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      const videos = [...document.querySelectorAll("video")].filter((video) => {
        const rect = video.getBoundingClientRect();
        return rect.width * rect.height > 12000 || Number.isFinite(video.duration);
      });
      const video = videos.sort((first, second) => {
        const firstRect = first.getBoundingClientRect();
        const secondRect = second.getBoundingClientRect();
        return secondRect.width * secondRect.height - firstRect.width * firstRect.height;
      })[0];
      if (!video) return null;
      const url = new URL(location.href);
      const youtubeId = /(^|\.)youtube\.com$/i.test(url.hostname) ? url.searchParams.get("v") : "";
      const stableMediaIdentity = [
        video.currentSrc || video.src || "",
        video.poster || "",
        ...[...video.querySelectorAll("track")].map((track) => `${track.kind}|${track.srclang}|${track.label}|${track.src}`)
      ].join("\n");
      let mediaHash = 2166136261;
      for (let index = 0; index < stableMediaIdentity.length; index += 1) {
        mediaHash ^= stableMediaIdentity.charCodeAt(index);
        mediaHash = Math.imul(mediaHash, 16777619);
      }
      const mediaId = youtubeId
        ? `youtube:${youtubeId}`
        : `${url.origin}${url.pathname}|media:${(mediaHash >>> 0).toString(36)}`;
      return {
        mediaId,
        currentSrc: video.currentSrc || video.src || "",
        poster: video.poster || "",
        tracks: [...video.querySelectorAll("track")].map((track) => ({
          id: track.id || "",
          kind: track.kind || "",
          label: track.label || "",
          language: track.srclang || "",
          src: track.src || ""
        })),
        durationMs: Math.max(0, Math.round((Number(video.duration) || 0) * 1000)),
        currentTimeMs: Math.max(0, Math.round((Number(video.currentTime) || 0) * 1000)),
        playbackRate: Number(video.playbackRate) || 1,
        paused: Boolean(video.paused),
        seekable: Boolean(video.seekable?.length),
        title: document.title.replace(/\s+-\s+YouTube\s*$/i, "").trim() || "Current video",
        url: location.href
      };
    }
  });
  return result?.result || null;
}

async function extractCurrentVideo({ allowAutomatic = true } = {}) {
  const pastedSegments = globalThis.ExamCramJourney?.parseTimestampedTranscript(elements.videoTranscriptInput?.value || "") || [];
  if (!hasChromeTabs() || !hasChromeScripting()) {
    if (pastedSegments.length >= 3) {
      const rawText = pastedSegments.map((segment) => `[${formatTimestamp(segment.startMs / 1000)}] ${segment.text}`).join("\n");
      return {
        title: "Pasted video transcript",
        url: "",
        sourceTabId: null,
        videoMediaId: "",
        durationMs: pastedSegments[pastedSegments.length - 1].endMs,
        videoSegments: pastedSegments,
        transcriptFingerprint: makeContentFingerprint(rawText),
        sourceFingerprint: makeContentFingerprint(rawText),
        manualTranscript: true,
        timestampConfidence: "user-provided",
        transcriptProvenance: "pasted",
        rawText
      };
    }
    throw new Error("Video study is available after loading this as a Chrome extension.");
  }
  const tab = await getActiveTab();
  if (!Number.isInteger(tab?.id) || !/^https?:\/\//.test(tab.url || "")) {
    throw new Error("Open a webpage with a video before using Study video + record.");
  }
  const identity = await readCurrentVideoIdentity(tab.id);
  if (!identity && !pastedSegments.length) {
    throw new Error("No HTML5 video was detected. If this player is unsupported, paste a timestamped transcript below.");
  }
  const currentBindingSource = {
    tabId: tab.id,
    url: tab.url,
    mediaId: identity?.mediaId || "",
    title: identity?.title || tab.title || "Current video"
  };
  if (pastedSegments.length) {
    if (!state.transcriptBinding) {
      state.transcriptBinding = makeTranscriptBinding(currentBindingSource);
      renderTranscriptBinding();
    } else if (!transcriptBindingMatches(state.transcriptBinding, currentBindingSource)) {
      throw new Error("This pasted transcript belongs to a different page or video. Clear it and paste the transcript for the current source.");
    }
  }

  let segments = identity ? await extractRenderedTranscript(tab.id) : [];
  let usedPastedTranscript = false;
  let automaticTranscript = null;
  let automaticTranscriptError = "";
  if (segments.length < 3 && pastedSegments.length) {
    segments = pastedSegments;
    usedPastedTranscript = true;
  }
  if (allowAutomatic && segments.length < 3 && identity?.mediaId.startsWith("youtube:")) {
    try {
      automaticTranscript = await requestAutomaticYouTubeTranscript(tab, identity);
      segments = automaticTranscript.segments;
    } catch (error) {
      automaticTranscriptError = error.message || "Public-video analysis was unavailable.";
    }
  }
  if (segments.length < 3 && identity && state.videoCaptureState?.status === "ready") {
    const snapshot = makeVideoSourceSnapshot(tab, identity);
    const captureSnapshot = state.videoCaptureState.sourceSnapshot;
    if (globalThis.ExamCramVideo?.sourceSnapshotsMatch(captureSnapshot, snapshot)) {
      automaticTranscript = state.videoCaptureState.result;
      segments = automaticTranscript?.segments || [];
    }
  }
  segments = globalThis.ExamCramJourney?.normalizeTranscriptSegments(segments) || [];
  if (segments.length < 3) {
    const captureStatus = state.videoCaptureState?.status;
    if (["starting", "recording", "paused", "processing"].includes(captureStatus)) {
      const elapsedMs = Math.max(
        Number(state.videoCaptureState?.liveCapturedMs) || 0,
        Number(state.videoCaptureState?.capturedMs) || 0
      );
      const capturedSegments = state.videoCaptureState?.result?.segments?.length || 0;
      const error = new Error(
        captureStatus === "processing"
          ? `Tab audio is processing (${capturedSegments} segments ready). Wait for completion before creating the note.`
          : `Tab audio is still ${captureStatus} (${formatTimestamp(elapsedMs / 1000)} audio, ${capturedSegments} segments). Keep audible speech playing, then Stop and create the note when at least three segments are ready.`
      );
      error.code = "VIDEO_CAPTURE_IN_PROGRESS";
      throw error;
    }
    if (captureStatus === "error" && state.videoCaptureState?.error) {
      const error = new Error(state.videoCaptureState.error);
      error.code = state.videoCaptureState.errorCode || "VIDEO_CAPTURE_FAILED";
      throw error;
    }
    if (identity && globalThis.ExamCramVideo) {
      const error = new Error(`${automaticTranscriptError ? `${automaticTranscriptError} ` : ""}No usable captions were found. Auto-transcribe this tab's audio, or paste at least three timestamped lines.`);
      error.code = "VIDEO_CAPTURE_REQUIRED";
      throw error;
    }
    elements.videoTranscriptFallback.open = true;
    throw new Error("No usable captions were found. Open the video's transcript panel and retry, or paste at least three timestamped lines.");
  }

  const activeTab = await getActiveTab();
  const latestIdentity = identity ? await readCurrentVideoIdentity(tab.id) : null;
  if (activeTab?.id !== tab.id || !samePageUrl(activeTab.url, tab.url)
    || (identity && latestIdentity?.mediaId !== identity.mediaId)) {
    throw new Error("The active video changed while its transcript was being read. Return to the source and try again.");
  }

  const rawText = segments
    .map((segment) => `[${formatTimestamp(segment.startMs / 1000)}] ${segment.text}`)
    .join("\n")
    .slice(0, 36000);
  const transcriptFingerprint = makeContentFingerprint(rawText);
  return {
    title: identity?.title || tab.title || "Video lesson",
    url: tab.url,
    sourceTabId: tab.id,
    videoMediaId: identity?.mediaId || "",
    durationMs: identity?.durationMs || segments[segments.length - 1].endMs,
    videoSegments: segments,
    transcriptFingerprint,
    sourceFingerprint: transcriptFingerprint,
    manualTranscript: usedPastedTranscript,
    automaticTranscript: Boolean(automaticTranscript),
    timestampConfidence: automaticTranscript?.timestampConfidence
      || (usedPastedTranscript ? "user-provided" : "caption-grounded"),
    transcriptProvenance: automaticTranscript?.provenance || (usedPastedTranscript ? "pasted" : "captions"),
    sourceSnapshot: identity ? makeVideoSourceSnapshot(tab, identity) : null,
    rawText
  };
}

function makeVideoSourceSnapshot(tab, identity) {
  if (!globalThis.ExamCramVideo || !identity) return null;
  return globalThis.ExamCramVideo.normalizeSourceSnapshot({
    tabId: tab?.id,
    url: tab?.url || identity.url,
    title: identity.title || tab?.title,
    currentSrc: identity.currentSrc,
    poster: identity.poster,
    tracks: identity.tracks,
    durationMs: identity.durationMs,
    seekable: identity.seekable,
    capturedAt: Date.now()
  });
}

async function requestAutomaticYouTubeTranscript(tab, identity) {
  const settings = await getStorage(STORAGE_KEYS.settings, {});
  const configuredEndpoint = getConfiguredApiEndpoint(settings);
  if (!configuredEndpoint) throw new Error("Start the Gemini backend or paste a transcript for this captionless video.");
  const endpoint = deriveBackendEndpoint(configuredEndpoint, "video-transcript");
  updateGenerationProgress(18, "Gemini is reading this public video...");
  let response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: getBackendHeaders(settings, endpoint),
      body: JSON.stringify({
        sourceUrl: tab.url,
        title: identity.title || tab.title,
        durationMs: identity.durationMs
      })
    });
  } catch {
    throw new Error("Gemini public-YouTube analysis could not reach the configured backend. Start or configure the backend, or use explicit tab-audio transcription.");
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Gemini could not analyze this public YouTube URL. Use explicit tab-audio transcription instead.");
  }
  const normalizedSegments = globalThis.ExamCramJourney?.normalizeTranscriptSegments(payload.segments) || [];
  if (normalizedSegments.length < 3) {
    throw new Error("Gemini did not return enough timestamped YouTube content. Use explicit tab-audio transcription instead.");
  }
  const latestTab = await getActiveTab();
  const latestIdentity = await readCurrentVideoIdentity(tab.id);
  if (latestTab?.id !== tab.id || !samePageUrl(latestTab.url, tab.url)
    || latestIdentity?.mediaId !== identity.mediaId) {
    throw new Error("The video changed while automatic transcription was running. Return to the original video and try again.");
  }
  return { ...payload, segments: normalizedSegments };
}

async function extractRenderedTranscript(tabId) {
  const [result] = await globalThis.chrome.scripting.executeScript({
    target: { tabId },
    func: async () => {
      const clean = (value) => String(value || "").replace(/\s+/g, " ").trim();
      const parseTime = (value) => {
        const parts = String(value || "").trim().split(":").map(Number);
        if (!parts.length || parts.some((part) => !Number.isFinite(part))) return null;
        return parts.reduce((total, part) => total * 60 + part, 0);
      };
      const videos = [...document.querySelectorAll("video")];
      const video = videos.sort((first, second) => {
        const a = first.getBoundingClientRect();
        const b = second.getBoundingClientRect();
        return b.width * b.height - a.width * a.height;
      })[0];
      const segments = [];
      if (video) {
        [...video.textTracks].forEach((track) => {
          try {
            if (track.mode === "disabled") track.mode = "hidden";
          } catch {}
        });
        await new Promise((resolve) => setTimeout(resolve, 350));
        [...video.textTracks].forEach((track) => {
          [...(track.cues || [])].forEach((cue) => {
            const text = clean(cue.text);
            if (text) segments.push({ startMs: cue.startTime * 1000, endMs: cue.endTime * 1000, text });
          });
        });
      }

      document.querySelectorAll("ytd-transcript-segment-renderer").forEach((node) => {
        const time = parseTime(node.querySelector(".segment-timestamp")?.textContent);
        const text = clean(node.querySelector(".segment-text")?.textContent);
        if (time != null && text) segments.push({ startMs: time * 1000, endMs: time * 1000 + 5000, text });
      });

      document.querySelectorAll(".transcript [data-start], [data-transcript] [data-start], .transcript [data-start-time]").forEach((node) => {
        const raw = node.getAttribute("data-start") || node.getAttribute("data-start-time");
        const seconds = Number(raw);
        const text = clean(node.textContent);
        if (Number.isFinite(seconds) && text) segments.push({ startMs: seconds * 1000, endMs: seconds * 1000 + 5000, text });
      });

      return segments.slice(0, 600);
    }
  });
  return result?.result || [];
}

async function handleStudyVideo() {
  const generationToken = ++state.generationToken;
  let chapterBinding = null;
  setBusy(true, "Finding video captions...");
  startProgress("Reading timestamped transcript...", 8);
  try {
    chapterBinding = getSelectedChapterBinding(elements.pageChapterInput);
    const video = await extractCurrentVideo();
    updateGenerationProgress(26, "Creating a timestamped visual note...");
    await createAndRecordStudyArtifact({
      title: video.title,
      sourceType: "video",
      sourceUrl: video.url,
      sourceTabId: video.sourceTabId,
      sourceFingerprint: video.sourceFingerprint,
      videoMediaId: video.videoMediaId,
      transcriptFingerprint: video.transcriptFingerprint,
      manualTranscript: video.manualTranscript,
      automaticTranscript: video.automaticTranscript,
      timestampConfidence: video.timestampConfidence,
      transcriptProvenance: video.transcriptProvenance,
      sourceSnapshot: video.sourceSnapshot,
      durationMs: video.durationMs,
      videoSegments: video.videoSegments,
      rawText: video.rawText,
      ...chapterBinding,
      generationToken
    });
    finishProgress("Video note ready.");
    showStatus("Timestamped visual note created. Generate a quiz when you want practice.");
  } catch (error) {
    if (generationToken === state.generationToken) {
      if (error?.code === "VIDEO_CAPTURE_REQUIRED") {
        state.pendingVideoStudyOptions = chapterBinding;
        failProgress("Automatic transcript available.");
        elements.videoCapturePanel?.classList.remove("hidden");
        renderVideoCaptureState();
        openVideoCaptureConsent();
        showStatus(error.message);
      } else {
        failProgress("Video study failed.");
        showStatus(error.message, true);
      }
    }
  } finally {
    if (generationToken === state.generationToken) setBusy(false);
  }
}

function openVideoCaptureConsent() {
  if (!state.detectedSource?.hasVideo) {
    showStatus("Open a webpage with a detectable video before starting tab-audio transcription.", true);
    return;
  }
  elements.videoCapturePanel?.classList.remove("hidden");
  if (elements.videoCaptureDialogStatus) {
    elements.videoCaptureDialogStatus.textContent = "Confirm below, then keep this video tab active for one Chrome toolbar click.";
    elements.videoCaptureDialogStatus.classList.remove("hidden");
  }
  state.videoCaptureAuthorization = null;
  resetVideoCaptureAuthorizationUi();
  elements.reloadExtensionButton?.classList.add("hidden");
  if (typeof elements.videoCaptureDialog?.showModal === "function") {
    elements.videoCaptureDialog.showModal();
  }
}

async function handleStartVideoCapture(event) {
  event?.preventDefault();
  if (!globalThis.ExamCramVideo) {
    showStatus("Video capture tools did not load. Reload Exam-Cram from chrome://extensions.", true);
    return;
  }
  const detectedSource = state.detectedSource;
  const requestedTabId = Number(detectedSource?.tabId);
  const expectedSourceSnapshot = makeVideoSourceSnapshot({
    id: requestedTabId,
    url: detectedSource?.url,
    title: detectedSource?.title
  }, detectedSource);
  if (!expectedSourceSnapshot?.identityAvailable) {
    showStatus("Refresh the current page source, then start tab audio from the detected video.", true);
    return;
  }
  const activeTabPromise = getActiveTab();
  const identityPromise = activeTabPromise.then((tab) => readCurrentVideoIdentity(tab?.id));
  elements.confirmVideoCaptureButton.disabled = true;
  elements.confirmVideoCaptureButton.textContent = "Checking video...";
  if (elements.videoCaptureDialogStatus) {
    elements.videoCaptureDialogStatus.textContent = "Checking the video and transcription service before Chrome asks for access...";
    elements.videoCaptureDialogStatus.classList.remove("hidden");
  }
  try {
    const [tab, identity] = await Promise.all([activeTabPromise, identityPromise]);
    if (tab?.id !== requestedTabId) {
      throw new Error("The active video tab changed. Return to the detected video and try again.");
    }
    if (!identity) throw new Error("The current page no longer has a detectable video.");
    if (identity.paused) throw new Error("Play the video first, then start automatic transcription.");
    const sourceSnapshot = makeVideoSourceSnapshot(tab, identity);
    if (!globalThis.ExamCramVideo.sourceSnapshotsMatch(expectedSourceSnapshot, sourceSnapshot)) {
      const error = new Error("The page or video changed while Exam-Cram was checking it. Refresh the source and try again.");
      error.code = "CAPTURE_SOURCE_CHANGED";
      throw error;
    }
    if (elements.videoCaptureDialogStatus) {
      elements.videoCaptureDialogStatus.textContent = "Checking the transcription service...";
    }
    const authorization = await sendVideoCaptureMessage({
      type: "VIDEO_CAPTURE_ARM",
      tabId: tab.id,
      sourceSnapshot,
      mediaTimeMs: identity.currentTimeMs,
      playbackRate: identity.playbackRate,
      recording: !identity.paused
    });
    if (authorization?.protocolVersion !== 3) {
      const error = new Error("Exam-Cram's loaded video worker is out of date. Open chrome://extensions, click Reload for Exam-Cram, then reopen the video and try again.");
      error.code = "VIDEO_WORKER_RELOAD_REQUIRED";
      throw error;
    }
    state.videoCaptureAuthorization = authorization;
    renderVideoCaptureAuthorization();
    elements.reloadExtensionButton?.classList.add("hidden");
    showStatus("Tab audio is ready. Click the Exam-Cram toolbar icon once on this video tab; recording will start automatically.");
  } catch (error) {
    const message = error.message || "Automatic transcription could not start.";
    if (elements.videoCaptureDialogStatus) {
      elements.videoCaptureDialogStatus.textContent = message;
      elements.videoCaptureDialogStatus.classList.remove("hidden");
    }
    elements.reloadExtensionButton?.classList.toggle("hidden", error?.code !== "VIDEO_WORKER_RELOAD_REQUIRED");
    state.videoCaptureAuthorization = null;
    showStatus(message, true);
    elements.confirmVideoCaptureButton.disabled = false;
    elements.confirmVideoCaptureButton.textContent = "Try again";
  }
}

function renderVideoCaptureAuthorization() {
  const authorization = state.videoCaptureAuthorization;
  scheduleVideoCaptureAuthorizationExpiry(authorization);
  if (!authorization || !elements.videoCaptureDialogStatus) return;
  const messages = {
    "awaiting-toolbar": "Ready. Keep this video tab active, then click the Exam-Cram toolbar icon once. Recording starts automatically.",
    authorizing: "Chrome authorized this tab. Starting the private offscreen recorder...",
    "wrong-tab": authorization.message || "Return to the armed video tab and click the Exam-Cram toolbar icon there.",
    error: authorization.message || "Chrome could not authorize this tab. Keep the video active and try again.",
    expired: authorization.message || "The tab-audio request expired. Press Start tab audio again, then click the toolbar icon within one minute.",
    cleared: authorization.message || "The pending tab-audio request was cancelled."
  };
  elements.videoCaptureDialogStatus.textContent = messages[authorization.status] || authorization.message || "Preparing tab audio...";
  elements.videoCaptureDialogStatus.classList.remove("hidden");
  const waiting = ["awaiting-toolbar", "authorizing", "wrong-tab"].includes(authorization.status);
  elements.confirmVideoCaptureButton.disabled = waiting;
  if (elements.cancelVideoCaptureButton) {
    elements.cancelVideoCaptureButton.disabled = authorization.status === "authorizing";
  }
  elements.confirmVideoCaptureButton.textContent = authorization.status === "authorizing"
    ? "Starting..."
    : authorization.status === "wrong-tab"
      ? "Waiting for video tab"
    : waiting
      ? "Waiting for toolbar"
      : "Try again";
  if (["wrong-tab", "error", "expired", "cleared"].includes(authorization.status)) {
    showStatus(elements.videoCaptureDialogStatus.textContent, true);
  }
}

function scheduleVideoCaptureAuthorizationExpiry(authorization) {
  if (state.videoCaptureAuthorizationTimer) {
    clearTimeout(state.videoCaptureAuthorizationTimer);
    state.videoCaptureAuthorizationTimer = null;
  }
  if (!["awaiting-toolbar", "wrong-tab"].includes(authorization?.status)) return;
  const delayMs = Math.max(0, Number(authorization.expiresAt) - Date.now());
  const requestId = authorization.requestId;
  state.videoCaptureAuthorizationTimer = setTimeout(() => {
    if (state.videoCaptureAuthorization?.requestId !== requestId) return;
    const expired = {
      ...state.videoCaptureAuthorization,
      status: "expired",
      message: "The tab-audio request expired. Keep the video playing, press Start tab audio again, then click the toolbar icon within one minute."
    };
    state.videoCaptureAuthorization = expired;
    renderVideoCaptureAuthorization();
    void sendVideoCaptureMessage({
      type: "VIDEO_CAPTURE_CANCEL_ARM",
      tabId: expired.tabId,
      reason: "expired"
    }).catch(() => undefined);
  }, delayMs);
}

function resetVideoCaptureAuthorizationUi() {
  if (state.videoCaptureAuthorizationTimer) {
    clearTimeout(state.videoCaptureAuthorizationTimer);
    state.videoCaptureAuthorizationTimer = null;
  }
  if (!elements.confirmVideoCaptureButton) return;
  elements.confirmVideoCaptureButton.disabled = false;
  elements.confirmVideoCaptureButton.textContent = "Start tab audio";
  if (elements.cancelVideoCaptureButton) elements.cancelVideoCaptureButton.disabled = false;
}

function handleVideoCaptureDialogClosed() {
  const authorization = state.videoCaptureAuthorization;
  if (["awaiting-toolbar", "wrong-tab"].includes(authorization?.status)) {
    void sendVideoCaptureMessage({
      type: "VIDEO_CAPTURE_CANCEL_ARM",
      tabId: authorization.tabId
    }).catch(() => undefined);
  }
  state.videoCaptureAuthorization = null;
  resetVideoCaptureAuthorizationUi();
}

function handleReloadExtension() {
  if (!globalThis.chrome?.runtime?.reload) {
    showStatus("Open chrome://extensions and click Reload for Exam-Cram.", true);
    return;
  }
  if (elements.videoCaptureDialogStatus) {
    elements.videoCaptureDialogStatus.textContent = "Reloading Exam-Cram. Reopen the side panel on the playing video when it finishes.";
  }
  globalThis.chrome.runtime.reload();
}

async function handleStopVideoCapture() {
  elements.stopVideoCaptureButton.disabled = true;
  try {
    state.videoCaptureState = await sendVideoCaptureMessage({
      type: "VIDEO_CAPTURE_STOP_REQUEST",
      reason: "completed"
    });
    renderVideoCaptureState();
    if (state.videoCaptureState?.status === "ready") {
      showStatus(`${state.videoCaptureState.result?.segments?.length || 0} timestamped segments are ready. Create the video note now.`);
    } else if (state.videoCaptureState?.status === "error") {
      showStatus(state.videoCaptureState.error || "Tab audio did not produce a usable transcript.", true);
    } else {
      showStatus("Finishing the last audio chunk and checking its timestamps...");
    }
  } catch (error) {
    showStatus(error.message || "Automatic transcription could not stop cleanly.", true);
  } finally {
    elements.stopVideoCaptureButton.disabled = false;
  }
}

async function handleBuildCapturedVideoLesson() {
  const capture = state.videoCaptureState;
  if (capture?.status !== "ready" || (capture.result?.segments || []).length < 3) {
    showStatus("The automatic transcript is not ready yet.", true);
    return;
  }
  const generationToken = ++state.generationToken;
  setBusy(true, "Checking the recorded video source...");
  startProgress("Verifying automatic transcript coverage...", 10);
  try {
    const tab = await getActiveTab();
    const identity = await readCurrentVideoIdentity(tab?.id);
    if (!identity) throw new Error("Return to the original video before building this lesson.");
    const currentSnapshot = makeVideoSourceSnapshot(tab, identity);
    if (!globalThis.ExamCramVideo.sourceSnapshotsMatch(capture.sourceSnapshot, currentSnapshot)) {
      throw new Error("This transcript belongs to a different video. Return to its original tab before building the lesson.");
    }
    const segments = globalThis.ExamCramJourney.normalizeTranscriptSegments(capture.result.segments);
    const rawText = segments
      .map((segment) => `[${formatTimestamp(segment.startMs / 1000)}] ${segment.text}`)
      .join("\n")
      .slice(0, 36000);
    const transcriptFingerprint = makeContentFingerprint(rawText);
    const options = state.pendingVideoStudyOptions || getSelectedChapterBinding(elements.pageChapterInput);
    updateGenerationProgress(26, "Building a timestamped visual note...");
    await createAndRecordStudyArtifact({
      title: identity.title || tab.title || "Automatically transcribed video",
      sourceType: "video",
      sourceUrl: tab.url,
      sourceTabId: tab.id,
      sourceFingerprint: transcriptFingerprint,
      videoMediaId: identity.mediaId,
      transcriptFingerprint,
      manualTranscript: false,
      automaticTranscript: true,
      timestampConfidence: "AI-estimated",
      transcriptProvenance: "audio-ai",
      sourceSnapshot: currentSnapshot,
      durationMs: identity.durationMs,
      videoSegments: segments,
      rawText,
      chapterId: options.chapterId,
      chapterTitle: options.chapterTitle,
      generationToken
    });
    finishProgress("Video note ready.");
    state.pendingVideoStudyOptions = null;
  } catch (error) {
    if (generationToken === state.generationToken) {
      failProgress("Video lesson failed.");
      showStatus(error.message || "Could not build the automatic video lesson.", true);
    }
  } finally {
    if (generationToken === state.generationToken) setBusy(false);
  }
}

async function loadVideoCaptureState() {
  if (!globalThis.chrome?.runtime?.sendMessage || !globalThis.ExamCramVideo) return;
  try {
    state.videoCaptureState = await sendVideoCaptureMessage({ type: "VIDEO_CAPTURE_GET_STATE" });
  } catch {
    state.videoCaptureState = null;
  }
  renderVideoCaptureState();
}

async function loadVideoCaptureAuthorizationState() {
  if (!globalThis.chrome?.runtime?.sendMessage || !globalThis.ExamCramVideo) return;
  try {
    state.videoCaptureAuthorization = await sendVideoCaptureMessage({ type: "VIDEO_CAPTURE_GET_AUTHORIZATION" });
  } catch {
    state.videoCaptureAuthorization = null;
  }
  if (state.videoCaptureAuthorization) {
    if (!elements.videoCaptureDialog?.open && typeof elements.videoCaptureDialog?.showModal === "function") {
      elements.videoCaptureDialog.showModal();
    }
    renderVideoCaptureAuthorization();
  }
}

function sendVideoCaptureMessage(message) {
  if (!globalThis.chrome?.runtime?.sendMessage) {
    return Promise.reject(new Error("Automatic tab-audio transcription is available only in the loaded Chrome extension."));
  }
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      const runtimeError = chrome.runtime?.lastError;
      if (runtimeError) {
        const rawError = new Error(runtimeError.message || "Could not contact the video capture worker.");
        const errorPhase = message?.type === "VIDEO_CAPTURE_ARM"
          ? "video worker authorization"
          : "video worker message";
        const mappedError = globalThis.ExamCramVideo?.toCaptureStartError
          ? globalThis.ExamCramVideo.toCaptureStartError(rawError, errorPhase)
          : rawError;
        reject(mappedError);
        return;
      }
      if (!response?.ok) {
        const error = new Error(response?.error?.message || "Automatic video transcription failed.");
        error.code = response?.error?.code;
        reject(error);
        return;
      }
      resolve(response.state || null);
    });
  });
}

function renderVideoCaptureState() {
  if (!elements.videoCapturePanel) return;
  const capture = state.videoCaptureState;
  const sourceHasVideo = Boolean(state.detectedSource?.hasVideo);
  elements.videoCapturePanel.classList.toggle("hidden", !sourceHasVideo && !capture);
  const status = capture?.status || "idle";
  const liveCapturedMs = Math.max(
    Number(capture?.liveCapturedMs) || 0,
    Number(capture?.capturedMs) || 0
  );
  const capturedSeconds = Math.max(0, Math.round(liveCapturedMs / 1000));
  const segmentCount = capture?.result?.segments?.length || 0;
  const receivedChunkCount = Math.max(Number(capture?.receivedChunkCount) || 0, Number(capture?.chunkCount) || 0);
  const pendingChunkCount = Math.max(0, Number(capture?.pendingChunkCount) || 0);
  const successfulChunkCount = Math.max(0, Number(capture?.successfulChunkCount) || 0);
  const failedChunkCount = Math.max(0, Number(capture?.failedChunkCount) || 0);
  const chunkProgress = [
    `${successfulChunkCount} transcribed`,
    pendingChunkCount ? `${pendingChunkCount} processing` : "",
    failedChunkCount ? `${failedChunkCount} failed` : ""
  ].filter(Boolean).join(" · ");
  const signalPercent = Math.round(Math.min(1, Math.max(0, Number(capture?.audioLevel) || 0) * 8) * 100);
  const recordingLabel = capture?.samplesObserved
    ? `Recording tab audio · ${formatTimestamp(capturedSeconds)} · Signal ${signalPercent}% · ${segmentCount} segments · ${receivedChunkCount} audio chunks · ${chunkProgress}`
    : `Waiting for tab audio · ${formatTimestamp(capturedSeconds)} · Play the video and confirm the player and tab are unmuted`;
  const labels = {
    idle: "Use this only when the video has no usable captions.",
    starting: "Connecting to this tab's audio...",
    recording: recordingLabel,
    paused: `Video paused · ${formatTimestamp(capturedSeconds)} audio · ${segmentCount} segments ready`,
    processing: `Processing audio · ${segmentCount} segments ready · ${chunkProgress}`,
    aborting: "Discarding transcript data because the source changed...",
    aborted: "Capture was discarded because the source changed.",
    ready: `${segmentCount} timestamped segments ready · ${formatTimestamp(capturedSeconds)} audio · AI-estimated times`,
    error: capture?.lastTranscriptionError || capture?.error || "Automatic transcription failed."
  };
  elements.videoCaptureTitle.textContent = status === "recording" ? "Automatic transcript · REC" : "Automatic transcript";
  elements.videoCaptureStatus.textContent = labels[status] || labels.idle;
  elements.startVideoCaptureButton.classList.toggle("hidden", ["starting", "recording", "paused", "processing", "ready"].includes(status));
  elements.stopVideoCaptureButton.classList.toggle("hidden", !["recording", "paused"].includes(status));
  elements.buildCapturedVideoButton.classList.toggle("hidden", status !== "ready");
}

async function handleAddCurrentSource() {
  if (!globalThis.ExamCramJourney) return;
  setBusy(true, "Saving this source to your journey...");
  try {
    const chapterBinding = getSelectedChapterBinding(elements.pageChapterInput);
    let source;
    if (state.detectedSource?.hasVideo || elements.videoTranscriptInput?.value.trim()) {
      const video = await extractCurrentVideo({ allowAutomatic: false });
      source = {
        type: "video",
        title: video.title,
        url: video.url,
        capturedAt: new Date().toISOString(),
        fingerprint: video.transcriptFingerprint,
        segments: video.videoSegments,
        durationMs: video.durationMs,
        mediaId: video.videoMediaId
      };
    } else {
      const page = state.importedDocument || await extractCurrentPage();
      globalThis.ExamCramDocumentReader.assertReadableContent(page.text, page.documentType || "html");
      source = {
        type: "webpage",
        title: page.title,
        url: page.url,
        capturedAt: new Date().toISOString(),
        fingerprint: page.sourceFingerprint,
        text: page.text,
        documentType: page.documentType || "html",
        pageCount: page.pageCount || 0
      };
    }
    const added = await mutateJourney("JOURNEY_ADD_SOURCE", {
      chapterIdOrTitle: chapterBinding.chapterId,
      source
    });
    state.selectedJourneyChapterId = added.result.chapterId;
    const chapter = globalThis.ExamCramJourney.findChapter(added.journey, added.result.chapterId);
    const chapterTitle = chapter?.title || chapterBinding.chapterTitle;
    showStatus(added.result.duplicate
      ? `This exact source is already saved in ${chapterTitle}.`
      : `${source.title || "Source"} was saved to ${chapterTitle}. No note was generated yet.`);
    await renderJourney();
  } catch (error) {
    showStatus(error.message || "Could not add this source.", true);
  } finally {
    setBusy(false);
  }
}

async function handleStudyNotes() {
  const notes = elements.notesInput.value.trim();
  if (notes.length < 120) {
    showStatus("Paste at least a few paragraphs of notes to import.", true);
    return;
  }

  const generationToken = ++state.generationToken;
  setBusy(true, "Creating a visual note...");
  startProgress("Preparing notes...", 10);
  try {
    updateGenerationProgress(30, "Generating clean study notes...");
    const note = await createAndRecordStudyArtifact({
      title: "Imported notes",
      sourceType: "notes",
      sourceUrl: "",
      rawText: notes,
      sourceFingerprint: makeContentFingerprint(notes),
      ...getSelectedChapterBinding(elements.notesChapterInput),
      generationToken
    });
    if (!note) return;
    elements.notesInput.value = "";
    await savePanelState();
    if (note.usedLocalFallback) {
      finishProgress("Local backup saved.");
      showStatus(`Local backup saved. AI note generation failed: ${note.generationError}`, true);
    } else if (note.generator === "local") {
      finishProgress("Local interactive note saved.");
      showStatus("Local-only mode: interactive note generated without an AI request.");
    } else {
      finishProgress("Visual note saved.");
      showStatus("Visual note saved. Generate a quiz only when you want practice.");
    }
  } catch (error) {
    failProgress("Note generation failed.");
    showStatus(error.message, true);
  } finally {
    setBusy(false);
  }
}

function handleDemoNote() {
  const note = buildInteractiveDemoNote();
  renderNote(note);
  showStatus("Interactive demo loaded. Select a concept, change the conditions, then generate a quiz only if you want one.");
}

function buildInteractiveDemoNote() {
  return {
    id: "demo-photosynthesis",
    kind: "note",
    artifactType: "study",
    title: "Photosynthesis: light into stored energy",
    sourceType: "demo",
    sourceUrl: "",
    createdAt: new Date().toISOString(),
    generator: "built-in demo",
    sourceBinding: {
      type: "notes",
      sourceType: "notes",
      title: "Built-in photosynthesis demo",
      url: "",
      fingerprint: "demo:photosynthesis:v1",
      chapter: "Interactive demo",
      chapterTitle: "Interactive demo",
      rawText: "Photosynthesis converts light energy into chemical energy stored in glucose. Water and carbon dioxide supply matter to the connected reactions inside chloroplasts. Glucose stores captured energy, while oxygen is released. When usable light, water, or carbon dioxide becomes limited, the connected pathway slows and downstream outputs change.",
      videoSegments: [],
      collectionSources: [],
      capturedAt: new Date().toISOString()
    },
    summary: [
      "Photosynthesis converts light energy into chemical energy stored in glucose.",
      "Water and carbon dioxide supply matter; glucose and oxygen are produced.",
      "Changing an input changes the rate of the connected process and its outputs."
    ],
    terms: ["Light energy", "Chloroplast", "Carbon dioxide", "Water", "Glucose", "Oxygen"],
    goals: [
      "Trace every input through the chloroplast to an output.",
      "Predict which product changes when one input is limited.",
      "Explain why glucose is stored chemical energy."
    ],
    visualLesson: {
      title: "How photosynthesis moves energy and matter",
      visualModel: {
        title: "From sunlight to sugar",
        objective: "Trace the inputs, transformation, and outputs—then change one condition to see what the system can produce.",
        kind: "system",
        nodes: [
          {
            id: "chloroplast",
            label: "Chloroplast",
            symbol: "◎",
            role: "Transformation",
            detail: "Chloroplasts capture light energy and use it to build glucose from carbon dioxide and water.",
            why: "This is the central conversion that links every input to both outputs.",
            example: "Leaf cells contain many chloroplasts where the reactions occur.",
            sourceAnchor: "Photosynthesis occurs in chloroplasts and converts light energy into chemical energy."
          },
          {
            id: "light",
            label: "Light",
            symbol: "☀",
            role: "Energy input",
            detail: "Light supplies the energy that drives the reactions.",
            why: "Without an energy source, the conversion cannot keep running.",
            example: "A plant in brighter usable light can photosynthesize faster until another input becomes limiting.",
            sourceAnchor: "Light energy powers photosynthesis."
          },
          {
            id: "carbon-dioxide",
            label: "Carbon dioxide",
            symbol: "CO₂",
            role: "Matter input",
            detail: "Carbon dioxide supplies carbon atoms used to assemble glucose.",
            why: "Glucose cannot be built when its carbon source is missing.",
            example: "Carbon dioxide enters a leaf through tiny openings called stomata.",
            sourceAnchor: "Plants take in carbon dioxide to make glucose."
          },
          {
            id: "water",
            label: "Water",
            symbol: "H₂O",
            role: "Matter input",
            detail: "Water provides hydrogen and participates in the light-dependent reactions.",
            why: "A shortage of water limits the connected reactions and can cause stomata to close.",
            example: "Roots absorb water and transport it to leaves.",
            sourceAnchor: "Water is one of the raw materials for photosynthesis."
          },
          {
            id: "glucose",
            label: "Glucose",
            symbol: "C₆",
            role: "Stored-energy output",
            detail: "Glucose stores captured energy in chemical bonds for later use and growth.",
            why: "It is the main energy-rich product the plant can transport, store, or break down.",
            example: "Glucose can be converted into starch for storage.",
            sourceAnchor: "The captured energy is stored in glucose."
          },
          {
            id: "oxygen",
            label: "Oxygen",
            symbol: "O₂",
            role: "Released output",
            detail: "Oxygen is released as water molecules are processed during the light reactions.",
            why: "Its release is observable evidence that the light-driven stage is active.",
            example: "Aquatic plants can produce visible oxygen bubbles in bright light.",
            sourceAnchor: "Oxygen is released during photosynthesis."
          }
        ],
        edges: [
          { from: "light", to: "chloroplast", label: "powers" },
          { from: "carbon-dioxide", to: "chloroplast", label: "supplies carbon" },
          { from: "water", to: "chloroplast", label: "supplies matter" },
          { from: "chloroplast", to: "glucose", label: "stores energy" },
          { from: "chloroplast", to: "oxygen", label: "releases" }
        ],
        scenarios: [
          {
            id: "balanced",
            label: "Balanced inputs",
            prompt: "All three inputs are available.",
            activeIds: ["light", "carbon-dioxide", "water", "chloroplast", "glucose", "oxygen"],
            values: [
              { nodeId: "glucose", value: "steady output" },
              { nodeId: "oxygen", value: "released" }
            ],
            outcome: "The connected pathway can keep producing glucose and releasing oxygen.",
            insight: "Energy and matter inputs work together; one input cannot replace another."
          },
          {
            id: "low-light",
            label: "Low light",
            prompt: "Reduce the energy input while matter is still available.",
            activeIds: ["light", "chloroplast", "glucose", "oxygen"],
            values: [
              { nodeId: "light", value: "limited" },
              { nodeId: "glucose", value: "slower" },
              { nodeId: "oxygen", value: "less" }
            ],
            outcome: "The light-driven stage slows, so both product rates fall.",
            insight: "Follow the active path from the limited input to every downstream output."
          },
          {
            id: "no-carbon",
            label: "No CO₂",
            prompt: "Remove the carbon source but keep light and water available.",
            activeIds: ["carbon-dioxide", "chloroplast", "glucose"],
            values: [
              { nodeId: "carbon-dioxide", value: "missing" },
              { nodeId: "glucose", value: "cannot build" }
            ],
            outcome: "Glucose production becomes limited because the system lacks carbon atoms.",
            insight: "Energy can still arrive, but the main stored-energy product needs matter as well."
          }
        ],
        check: {
          prompt: "If usable light falls sharply, which change should happen first?",
          choices: [
            "The light-driven reactions slow",
            "Glucose production immediately increases",
            "Carbon dioxide becomes an output"
          ],
          answer: "The light-driven reactions slow",
          explanation: "Light is the energy input. Reducing it slows the light-dependent stage before the lower product rates follow."
        },
        suggestedQuestions: [
          "Why is glucose called stored energy?",
          "Why does low light affect oxygen too?"
        ]
      },
      blocks: [
        {
          type: "process_steps",
          title: "Trace the pathway",
          intro: "Follow energy and matter through the system.",
          steps: [
            { label: "Capture", detail: "Chlorophyll absorbs usable light.", why: "The pathway needs an energy source." },
            { label: "Transform", detail: "Water and carbon dioxide are processed in linked reactions.", why: "Atoms are rearranged instead of created." },
            { label: "Store and release", detail: "Energy is stored in glucose while oxygen is released.", why: "The outputs have different roles." }
          ]
        }
      ]
    }
  };
}

async function createStudyNote(input) {
  const settings = await getStorage(STORAGE_KEYS.settings, {});
  const endpoint = getConfiguredApiEndpoint(settings);
  const noteEndpoint = endpoint ? deriveBackendEndpoint(endpoint, "notes") : "";
  let note;
  let generationError = "";
  try {
    note = noteEndpoint
      ? await generateNotesWithBackend(noteEndpoint, input, settings)
      : generateLocalStudyNote(input);
  } catch (error) {
    generationError = error?.message || "AI notes backend was unavailable.";
    note = generateLocalStudyNote(input);
  }

  const normalizedCheatSheet = normalizeStudyCheatSheet(note, input);
  return {
    ...note,
    cheatSheet: normalizedCheatSheet,
    id: crypto.randomUUID(),
    kind: "note",
    artifactType: "study",
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    generatedAt: new Date().toISOString(),
    usedLocalFallback: Boolean(generationError),
    generationError
  };
}

function buildStudySourceBinding(input) {
  return {
    type: input.sourceType || "notes",
    sourceType: input.sourceType || "notes",
    title: String(input.title || "Study source").slice(0, 180),
    url: String(input.sourceUrl || "").slice(0, 2000),
    tabId: Number.isInteger(input.sourceTabId) ? input.sourceTabId : null,
    fingerprint: String(input.sourceFingerprint || input.transcriptFingerprint || makeContentFingerprint(input.rawText || "")).slice(0, 120),
    mediaId: String(input.videoMediaId || "").slice(0, 240),
    transcriptFingerprint: String(input.transcriptFingerprint || "").slice(0, 120),
    timestampConfidence: String(input.timestampConfidence || "").slice(0, 40),
    transcriptProvenance: String(input.transcriptProvenance || "").slice(0, 40),
    sourceSnapshot: input.sourceSnapshot || null,
    documentType: String(input.documentType || "").slice(0, 20),
    pageCount: Math.max(0, Math.min(10000, Number(input.pageCount) || 0)),
    durationMs: Math.max(0, Number(input.durationMs) || 0),
    chapterId: String(input.chapterId || "").slice(0, 100),
    chapter: String(input.chapterTitle || "Current chapter").slice(0, 140),
    chapterTitle: String(input.chapterTitle || "Current chapter").slice(0, 140),
    sourceRevisionHash: String(input.sourceRevisionHash || "").slice(0, 120),
    rawText: String(input.rawText || "").slice(0, 60000),
    videoSegments: Array.isArray(input.videoSegments) ? input.videoSegments.slice(0, 600) : [],
    collectionSources: Array.isArray(input.collectionSources) ? input.collectionSources.slice(0, 40) : [],
    capturedAt: new Date().toISOString()
  };
}

async function createAndRecordStudyArtifact(input) {
  const generationToken = Number.isSafeInteger(input.generationToken) ? input.generationToken : state.generationToken;
  const note = await createStudyNote(input);
  if (generationToken !== state.generationToken) return null;
  const sourceBinding = buildStudySourceBinding(input);
  const artifact = {
    ...note,
    sourceType: sourceBinding.sourceType,
    sourceUrl: sourceBinding.url,
    sourceTabId: sourceBinding.tabId,
    sourceFingerprint: sourceBinding.fingerprint,
    videoMediaId: sourceBinding.mediaId,
    transcriptFingerprint: sourceBinding.transcriptFingerprint,
    timestampConfidence: sourceBinding.timestampConfidence,
    transcriptProvenance: sourceBinding.transcriptProvenance,
    sourceSnapshot: sourceBinding.sourceSnapshot,
    journeyChapterId: sourceBinding.chapterId,
    journeyChapterTitle: sourceBinding.chapterTitle,
    sourceRevisionHash: sourceBinding.sourceRevisionHash,
    sources: sourceBinding.collectionSources,
    sourceBinding,
    questions: [],
    answers: {},
    score: null,
    submittedAt: null,
    wrongAnswers: [],
    weakTopics: []
  };

  let recorded;
  if (sourceBinding.sourceType === "collection") {
    recorded = await mutateJourney("JOURNEY_FINALIZE_COLLECTION", {
      chapterId: sourceBinding.chapterId,
      sourceRevisionHash: sourceBinding.sourceRevisionHash,
      session: artifact
    });
  } else {
    recorded = await recordLearningItem(
      artifact,
      sourceBinding.chapterId || sourceBinding.chapterTitle,
      sourceBinding.sourceType === "notes"
        ? {
            type: "notes",
            title: artifact.title,
            url: "",
            capturedAt: artifact.createdAt,
            fingerprint: sourceBinding.fingerprint,
            text: sourceBinding.rawText
          }
        : buildJourneySourceFromStudyInput(input, artifact)
    );
  }
  const chapterId = recorded?.result?.chapterId || recorded?.chapterId;
  if (chapterId) {
    artifact.journeyChapterId = chapterId;
    artifact.sourceBinding.chapterId = chapterId;
  }
  state.currentArtifact = artifact;
  state.currentSession = null;
  state.currentExportItem = artifact;
  state.submitted = false;
  await saveLibraryItem(artifact);
  await persistCurrentSessionDraft();
  renderNote(artifact);
  return artifact;
}

async function generateNotesWithBackend(endpoint, input, settings = {}) {
  const stopProgress = startSimulatedProgress(35, 86, "Gemini is cleaning your notes...");
  let response;
  try {
    response = await fetch(endpoint, {
    method: "POST",
    headers: getBackendHeaders(settings, endpoint),
    body: JSON.stringify(input)
    });
  } finally {
    stopProgress();
  }

  updateGenerationProgress(90, "Processing notes...");

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "AI notes backend failed. Check your endpoint or clear settings for local mode.");
  }
  if (!payload.summary || !payload.terms || !payload.visualLesson?.visualModel
    || !Array.isArray(payload.visualLesson.visualModel.nodes)
    || payload.visualLesson.visualModel.nodes.length < 3) {
    throw new Error("AI notes backend returned an incomplete interactive visual.");
  }
  return payload;
}

function openQuizSettings() {
  const artifact = state.currentArtifact || state.currentExportItem;
  if (!artifact?.visualLesson) {
    showStatus("Create or open a visual note before generating a quiz.", true);
    return;
  }
  const binding = artifact.sourceBinding || {};
  if (elements.quizSourceLabel) {
    elements.quizSourceLabel.textContent = `The quiz will use the saved evidence for “${binding.title || artifact.title}”, even if you switch pages.`;
  }
  if (typeof elements.quizSettingsDialog?.showModal === "function") elements.quizSettingsDialog.showModal();
}

async function handleGenerateQuiz(event) {
  event?.preventDefault();
  const artifact = state.currentArtifact || state.currentExportItem;
  if (!artifact?.visualLesson) return;
  elements.confirmGenerateQuizButton.disabled = true;
  elements.generateQuizButton.disabled = true;
  startProgress("Preparing the note’s saved evidence…", 10);
  try {
    const input = await resolveQuizSourceInput(artifact);
    const quizRequest = {
      ...input,
      noteId: artifact.id,
      sourceFingerprint: artifact.sourceBinding?.fingerprint || artifact.sourceFingerprint || "",
      title: artifact.title,
      difficulty: elements.pageDifficulty.value,
      quizStyle: elements.pageQuizStyle.value,
      questionCount: Number(elements.pageQuestionCount.value),
      summary: artifact.summary || [],
      visualModel: artifact.visualLesson?.visualModel || null
    };
    updateGenerationProgress(32, "Generating questions from the pinned source…");
    const settings = await getStorage(STORAGE_KEYS.settings, {});
    const endpoint = getConfiguredApiEndpoint(settings);
    let quiz;
    let usedLocalFallback = false;
    try {
      quiz = endpoint
        ? await generateQuizWithBackend(deriveBackendEndpoint(endpoint, "quiz"), quizRequest, settings)
        : generateLocalQuizArtifact(quizRequest);
    } catch (error) {
      usedLocalFallback = true;
      quiz = generateLocalQuizArtifact(quizRequest);
      showStatus(`AI quiz unavailable; using the local backup. ${error.message || ""}`.trim(), true);
    }

    if (input.sourceType === "video" && globalThis.ExamCramJourney) {
      quiz = globalThis.ExamCramJourney.attachVideoProvenance(quiz, input.videoSegments, input.sourceId || "current-video");
    } else if (input.sourceType === "collection" && globalThis.ExamCramJourney) {
      quiz = globalThis.ExamCramJourney.attachCollectionProvenance(quiz, input.collectionSources, input.rawText);
    }

    const combined = {
      ...artifact,
      ...quiz,
      id: artifact.id,
      noteId: artifact.id,
      kind: "quiz",
      artifactType: "study",
      visualLesson: artifact.visualLesson,
      summary: artifact.summary,
      terms: artifact.terms,
      goals: artifact.goals,
      sourceBinding: artifact.sourceBinding,
      sourceType: input.sourceType,
      sourceUrl: input.sourceUrl,
      sourceTabId: artifact.sourceTabId,
      sourceFingerprint: artifact.sourceFingerprint,
      videoMediaId: artifact.videoMediaId,
      timestampConfidence: artifact.timestampConfidence,
      transcriptProvenance: artifact.transcriptProvenance,
      generatedAt: artifact.generatedAt || artifact.createdAt,
      quizGeneratedAt: new Date().toISOString(),
      answers: {},
      score: null,
      submittedAt: null,
      wrongAnswers: [],
      weakTopics: [],
      usedLocalQuizFallback: usedLocalFallback
    };
    let journeySaveError = null;
    try {
      const recorded = await recordLearningItem(
        combined,
        combined.journeyChapterId || combined.journeyChapterTitle
      );
      if (recorded?.chapterId) {
        combined.journeyChapterId = recorded.chapterId;
        if (combined.sourceBinding) combined.sourceBinding.chapterId = recorded.chapterId;
      }
    } catch (error) {
      journeySaveError = error;
    }

    state.currentArtifact = combined;
    state.currentSession = combined;
    state.currentExportItem = combined;
    state.submitted = false;
    await saveLibraryItem(combined);
    await persistCurrentSessionDraft();
    renderSession(combined);
    elements.quizSettingsDialog?.close();
    finishProgress("Quiz ready.");
    showStatus(journeySaveError
      ? `Quiz ready, but Journey could not be updated: ${journeySaveError.message || "unknown error"}`
      : "Quiz generated from the note’s original source and saved to Journey.", Boolean(journeySaveError));
  } catch (error) {
    failProgress("Quiz generation failed.");
    showStatus(error.message || "Could not generate a quiz from this note.", true);
  } finally {
    elements.confirmGenerateQuizButton.disabled = false;
    elements.generateQuizButton.disabled = false;
  }
}

async function resolveQuizSourceInput(artifact) {
  const binding = artifact?.sourceBinding || {};
  if (binding.rawText && String(binding.rawText).trim().length >= 120) {
    return {
      sourceType: binding.sourceType || artifact.sourceType || "notes",
      sourceUrl: binding.url || artifact.sourceUrl || "",
      sourceId: "current-video",
      rawText: binding.rawText,
      videoSegments: binding.videoSegments || [],
      collectionSources: binding.collectionSources || []
    };
  }

  const journey = await getJourney().catch(() => null);
  const sources = (journey?.chapters || []).flatMap((chapter) => chapter.sources || []);
  const immutableFingerprint = binding.fingerprint || artifact.sourceFingerprint || "";
  const matched = sources.find((source) => immutableFingerprint
    ? source.fingerprint === immutableFingerprint
    : artifact.sourceUrl && source.url && samePageUrl(source.url, artifact.sourceUrl));
  if (matched?.text || matched?.segments?.length) {
    const rawText = matched.text || matched.segments.map((segment) => `[${formatTimestamp(segment.startMs / 1000)}] ${segment.text}`).join("\n");
    return {
      sourceType: matched.type,
      sourceUrl: matched.url,
      sourceId: matched.id,
      rawText,
      videoSegments: matched.segments || [],
      collectionSources: []
    };
  }

  if (artifact.sourceType === "webpage" && artifact.sourceUrl) {
    const current = await extractCurrentPage();
    if (samePageUrl(current.url, artifact.sourceUrl) && (!artifact.sourceFingerprint || current.sourceFingerprint === artifact.sourceFingerprint)) {
      return { sourceType: "webpage", sourceUrl: current.url, rawText: current.text, videoSegments: [], collectionSources: [] };
    }
  }
  throw new Error("The original evidence is no longer available. Open the saved source or create the visual note again before generating a quiz.");
}

async function generateQuizWithBackend(endpoint, input, settings = {}) {
  const stopProgress = startSimulatedProgress(35, 88, "Generating source-grounded questions…");
  let response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: getBackendHeaders(settings, endpoint),
      body: JSON.stringify(input)
    });
  } finally {
    stopProgress();
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "The quiz service could not generate questions.");
  if (!Array.isArray(payload.questions) || payload.questions.length < 3) throw new Error("The quiz service returned too few usable questions.");
  return payload;
}

function generateLocalQuizArtifact(input) {
  const local = generateLocalStudySession(input);
  return {
    title: input.title,
    sourceType: input.sourceType,
    sourceUrl: input.sourceUrl,
    difficulty: input.difficulty,
    quizStyle: input.quizStyle,
    questions: local.questions,
    generator: "local"
  };
}

function generateLocalStudyNote({ title, sourceType, sourceUrl, rawText }) {
  const cleanedText = normalizeText(rawText);
  const sentences = getSentences(cleanedText);
  const terms = getImportantTerms(cleanedText).slice(0, 12).map(toTitleCase);
  const summary = buildSummary(sentences, getImportantTerms(cleanedText));

  return {
    title,
    sourceType,
    sourceUrl,
    summary,
    sections: buildLocalNoteSections(summary),
    visualLesson: buildLocalVisualLesson(cleanedText, summary, terms),
    terms,
    goals: [
      "Review the key notes once today.",
      "Turn these notes into a webpage quiz when you need exam practice.",
      "Mark unclear terms for deeper revision."
    ],
    generator: "local"
  };
}
async function createStudySession(input) {
  const { generationToken: requestedToken, ...sessionInput } = input;
  const generationToken = Number.isSafeInteger(requestedToken)
    ? requestedToken
    : ++state.generationToken;
  if (generationToken !== state.generationToken) return;

  const settings = await getStorage(STORAGE_KEYS.settings, {});
  if (generationToken !== state.generationToken) return;

  const endpoint = getConfiguredApiEndpoint(settings);
  let session;
  let usedLocalFallback = false;
  try {
    session = endpoint
      ? await generateWithBackend(endpoint, sessionInput, settings)
      : generateLocalStudySession(sessionInput);
  } catch (error) {
    usedLocalFallback = true;
    if (generationToken === state.generationToken) {
      showStatus(`AI unavailable; using local backup. ${error.message || ""}`.trim(), true);
    }
    session = generateLocalStudySession(sessionInput);
  }

  if (generationToken !== state.generationToken) return;
  await verifyGeneratedPageSource(sessionInput);
  if (generationToken !== state.generationToken) return;

  if (sessionInput.sourceType === "video" && globalThis.ExamCramJourney) {
    session = globalThis.ExamCramJourney.attachVideoProvenance(
      session,
      sessionInput.videoSegments,
      sessionInput.sourceId || "current-video"
    );
  } else if (sessionInput.sourceType === "collection" && globalThis.ExamCramJourney) {
    session = globalThis.ExamCramJourney.attachCollectionProvenance(
      session,
      sessionInput.collectionSources,
      sessionInput.rawText
    );
  }

  const generatedAt = new Date().toISOString();
  state.currentSession = {
    ...session,
    sourceType: sessionInput.sourceType,
    sourceUrl: sessionInput.sourceUrl,
    sourceTabId: sessionInput.sourceTabId,
    sourceFingerprint: sessionInput.sourceFingerprint,
    videoMediaId: sessionInput.videoMediaId,
    transcriptFingerprint: sessionInput.transcriptFingerprint,
    manualTranscript: Boolean(sessionInput.manualTranscript),
    automaticTranscript: Boolean(sessionInput.automaticTranscript),
    timestampConfidence: sessionInput.timestampConfidence || "",
    transcriptProvenance: sessionInput.transcriptProvenance || "",
    sourceSnapshot: sessionInput.sourceSnapshot || null,
    journeyChapterTitle: sessionInput.chapterTitle || "Current chapter",
    journeyChapterId: sessionInput.chapterId || "",
    sourceRevisionHash: sessionInput.sourceRevisionHash || "",
    sources: Array.isArray(session.sources)
      ? session.sources
      : Array.isArray(sessionInput.collectionSources) ? sessionInput.collectionSources : [],
    id: crypto.randomUUID(),
    createdAt: generatedAt,
    generatedAt,
    submittedAt: null,
    answers: {},
    score: null,
    wrongAnswers: [],
    weakTopics: []
  };
  state.submitted = false;
  let journeyRecord = null;
  let journeyRecordFailed = false;
  try {
    if (sessionInput.sourceType === "collection") {
      const finalized = await mutateJourney("JOURNEY_FINALIZE_COLLECTION", {
        chapterId: sessionInput.chapterId,
        sourceRevisionHash: sessionInput.sourceRevisionHash,
        session: state.currentSession
      });
      journeyRecord = { ...finalized.result, journey: finalized.journey };
    } else {
      journeyRecord = await recordLearningItem(
        state.currentSession,
        state.currentSession.journeyChapterId || state.currentSession.journeyChapterTitle,
        buildJourneySourceFromStudyInput(sessionInput, state.currentSession)
      );
    }
  } catch {
    journeyRecordFailed = true;
  }
  if (journeyRecord?.chapterId) state.currentSession.journeyChapterId = journeyRecord.chapterId;
  await persistCurrentSessionDraft();
  renderSession(state.currentSession);
  const isLocalOnly = !endpoint && session.generator === "local";
  finishProgress(usedLocalFallback ? "Local backup ready." : isLocalOnly ? "Local study session ready." : "Study session ready.");
  const readyMessage = usedLocalFallback
      ? "Local backup generated. Start the AI backend for richer generated questions."
      : isLocalOnly
        ? "Local-only mode: study session generated without an AI request."
        : "Study session ready.";
  showStatus(
    journeyRecordFailed ? `${readyMessage} The learning journey could not be updated.` : readyMessage,
    usedLocalFallback || journeyRecordFailed
  );
  return state.currentSession;
}

async function verifyGeneratedPageSource(input) {
  if (input.sourceType === "collection") {
    const journey = await getJourney();
    const chapter = globalThis.ExamCramJourney?.findChapter(journey, input.chapterId);
    if (!chapter || globalThis.ExamCramJourney.sourceRevisionHash(chapter) !== input.sourceRevisionHash) {
      throw new Error("The chapter sources changed while the lesson was being generated. Build it again to use the latest sources.");
    }
    return;
  }
  if (!['webpage', 'video'].includes(input.sourceType)) return;
  if (input.sourceType === "video" && input.manualTranscript && !hasChromeTabs()) return;
  if (!hasChromeTabs()) {
    throw new Error("The webpage tab could not be verified. Return to the source page and try again.");
  }

  const activeTab = await getActiveTab();
  const sourceIsStillActive = activeTab?.id === input.sourceTabId
    && samePageUrl(activeTab.url, input.sourceUrl);
  if (!sourceIsStillActive) {
    throw new Error(`The active ${input.sourceType === "video" ? "video" : "page"} changed while the quiz was being generated. Return to the source and generate a fresh quiz.`);
  }
  if (input.sourceType === "video") {
    const identity = input.videoMediaId ? await readCurrentVideoIdentity(activeTab.id) : null;
    if (input.videoMediaId && (!identity || identity.mediaId !== input.videoMediaId)) {
      throw new Error("The video changed while the lesson was being generated. Return to the original video and generate again.");
    }
    if (input.automaticTranscript) {
      const currentSnapshot = makeVideoSourceSnapshot(activeTab, identity);
      if (!input.sourceSnapshot || !globalThis.ExamCramVideo?.sourceSnapshotsMatch(input.sourceSnapshot, currentSnapshot)) {
        throw new Error("The automatically transcribed video changed while the lesson was being generated.");
      }
      if (input.transcriptProvenance === "audio-ai") {
        const captureSegments = state.videoCaptureState?.result?.segments || [];
        if (fingerprintTranscriptSegments(captureSegments) !== input.transcriptFingerprint) {
          throw new Error("The automatic transcript changed while the lesson was being generated. Build it again from the current capture.");
        }
      }
    } else if (input.manualTranscript) {
      const bindingSource = {
        tabId: activeTab.id,
        url: activeTab.url,
        mediaId: identity?.mediaId || ""
      };
      const currentSegments = globalThis.ExamCramJourney?.parseTimestampedTranscript(
        elements.videoTranscriptInput?.value || ""
      ) || [];
      if (!transcriptBindingMatches(state.transcriptBinding, bindingSource)
        || fingerprintTranscriptSegments(currentSegments) !== input.transcriptFingerprint) {
        throw new Error("The pasted transcript changed or no longer belongs to this video. Generate a fresh lesson from the current transcript.");
      }
    } else if (input.transcriptFingerprint) {
      const currentSegments = await extractRenderedTranscript(activeTab.id).catch(() => []);
      if (fingerprintTranscriptSegments(currentSegments) !== input.transcriptFingerprint) {
        throw new Error("The video transcript changed while the lesson was being generated. Generate again to use the current captions.");
      }
    }
    return;
  }
  const currentPage = await extractCurrentPage();
  const contentIsStillCurrent = currentPage.sourceTabId === input.sourceTabId
    && samePageUrl(currentPage.url, input.sourceUrl)
    && currentPage.sourceFingerprint === input.sourceFingerprint;
  if (!contentIsStillCurrent) {
    throw new Error("The page content changed while the quiz was being generated. Generate again to use the latest page content.");
  }
}

function fingerprintTranscriptSegments(segments) {
  const normalized = globalThis.ExamCramJourney?.normalizeTranscriptSegments(segments) || [];
  const rawText = normalized
    .map((segment) => `[${formatTimestamp(segment.startMs / 1000)}] ${segment.text}`)
    .join("\n")
    .slice(0, 36000);
  return makeContentFingerprint(rawText);
}
async function generateWithBackend(endpoint, input, settings = {}) {
  const stopProgress = startSimulatedProgress(38, 88, "Gemini is generating your quiz...");
  let response;
  try {
    response = await fetch(endpoint, {
    method: "POST",
    headers: getBackendHeaders(settings, endpoint),
    body: JSON.stringify(input)
    });
  } finally {
    stopProgress();
  }

  updateGenerationProgress(90, "Processing quiz...");

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "AI backend failed. Check your endpoint or use local mode.");
  }
  if (!payload.summary || !payload.questions) {
    throw new Error("AI backend returned an invalid study session.");
  }
  return payload;
}

function generateLocalStudySession({ title, sourceType, sourceUrl, rawText, questionCount, difficulty = "normal", quizStyle = "mixed" }) {
  const cleanedText = normalizeText(rawText);
  const sentences = getSentences(cleanedText);
  const terms = getImportantTerms(cleanedText);
  const summary = buildSummary(sentences, terms);
  const questions = buildConceptQuestions(cleanedText, sentences, summary, questionCount, difficulty, quizStyle);

  if (questions.length < 3) {
    throw new Error("Not enough clear facts were found to create a useful quiz.");
  }

  return {
    title,
    sourceType,
    sourceUrl,
    summary,
    difficulty,
    quizStyle,
    visualLesson: buildLocalVisualLesson(cleanedText, summary, terms),
    questions,
    generator: "local"
  };
}
function buildLocalVisualLesson(text, summary, terms) {
  const labels = summary.slice(0, 4).map((item) => ({
    id: makeNodeId(item),
    label: makeConceptLabel(item),
    detail: simplifyStatement(item)
  }));
  const lower = text.toLowerCase();
  const blocks = [buildLocalInteractiveDemo(text, summary), {
    type: "concept_map",
    title: "Big Picture",
    intro: "Use this map to connect the main lesson ideas before the quiz.",
    nodes: labels,
    edges: labels.slice(1).map((node, index) => ({
      from: labels[index].id,
      to: node.id,
      label: index === 0 ? "supports" : "connects to"
    }))
  }];

  if (/declar|defin|initiali/.test(lower)) {
    blocks.push({
      type: "process_steps",
      title: "Variable Setup Flow",
      intro: "Java variables move from type/name to stored value.",
      steps: [
        { label: "Declare", detail: "State the data type and variable name.", why: "Java needs the type and identity before use." },
        { label: "Allocate", detail: "The compiler knows enough about the variable to reserve suitable memory.", why: "Different data types need different storage." },
        { label: "Initialise", detail: "Assign the first value to the variable.", why: "The variable can now be used in expressions and statements." }
      ]
    });
  }

  if (/primitive/.test(lower) || /string/.test(lower) || /char/.test(lower)) {
    blocks.push({
      type: "comparison_table",
      title: "Types At A Glance",
      intro: "Compare common Java data types by what they store.",
      rows: [
        { left: "int", right: "Whole number", difference: "Use for values like 42 or -367." },
        { left: "double", right: "Decimal number", difference: "Use for values like 19.53." },
        { left: "char", right: "Single character", difference: "Use single quotes, such as 'A'." },
        { left: "String", right: "Character sequence", difference: "Use double quotes, such as \"Something\"." },
        { left: "boolean", right: "True/false", difference: "Use for logical states." }
      ]
    });
  }

  if (/variable/.test(lower)) {
    blocks.push({
      type: "worked_example",
      title: "Read A Java Variable Example",
      intro: "Use the example to separate declaration from initialisation.",
      example: {
        question: "What happens in int total; then total = 10;?",
        walkthrough: [
          "int total; declares a variable named total with type int.",
          "total = 10; assigns the first stored value.",
          "After assignment, total can be used in expressions or statements."
        ],
        answer: "The first line declares the variable; the second line initialises or defines it."
      }
    });
  }

  const lesson = {
    title: "Visual Tutor Note",
    blocks: blocks.slice(0, 5)
  };
  lesson.visualModel = synthesizeVisualModel(lesson, summary);
  return lesson;
}

function buildLocalInteractiveDemo(text, summary) {
  const lower = text.toLowerCase();
  if (/variable/.test(lower) && /declar|initiali|defin/.test(lower)) {
    return {
      type: "interactive_demo",
      title: "Variable Memory Lab",
      intro: "Choose a program state to preview what Java knows at that moment.",
      demo: {
        prompt: "Select a code state",
        code: "int total;\ntotal = 10;",
        choices: [
          { label: "After declaration", result: "Java knows total is an int with a name and suitable memory, but no first value has been assigned.", tip: "Declaration gives the type and identifier; it does not store the first value." },
          { label: "After initialisation", result: "total now stores 10 and can be used in later expressions or statements.", tip: "Initialisation assigns the first value after the declaration." },
          { label: "Use the wrong type", result: "The stored value must match the declared data type, so choose the type that fits the value shape.", tip: "Match whole numbers, decimals, characters, text, and true/false values to their proper types." }
        ]
      }
    };
  }

  const ideas = compactSummaryForDisplay(summary, 3);
  const choices = ideas.length >= 2
    ? ideas.map((idea, index) => ({
      label: `Explore idea ${index + 1}`,
      result: idea,
      tip: "Connect this idea to the rule or relationship tested in the quiz."
    }))
    : [
      { label: "Identify the rule", result: "Start by identifying the main rule or relationship in the material.", tip: "Ask what changes, what stays true, and why." },
      { label: "Test an example", result: "Apply the rule to one concrete example from the material.", tip: "Explain why the outcome follows before choosing an answer." }
    ];

  return {
    type: "interactive_demo",
    title: "Try The Main Idea",
    intro: "Choose a case to turn the key note into a small guided demo.",
    demo: { prompt: "Select a case", code: "", choices }
  };
}
function makeNodeId(value) {
  return makeConceptLabel(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 24) || crypto.randomUUID().slice(0, 8);
}
function normalizeText(text) {
  return text
    .replace(/\s+/g, " ")
    .replace(/\[[0-9]+\]/g, "")
    .trim()
    .slice(0, 18000);
}

function getSentences(text) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 45 && sentence.length <= 260)
    .slice(0, 80);
}

function getWords(text) {
  return text
    .toLowerCase()
    .match(/[a-z][a-z-]{3,}/g)
    ?.filter((word) => !STOP_WORDS.has(word)) || [];
}

function getImportantTerms(text) {
  const counts = new Map();
  getWords(text).forEach((word) => counts.set(word, (counts.get(word) || 0) + 1));
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40)
    .map(([word]) => word);
}

function buildSummary(sentences, terms) {
  const maxItems = sentences.length <= 2 ? 2 : sentences.length <= 5 ? 3 : 4;
  const scored = sentences.map((sentence) => {
    const lower = sentence.toLowerCase();
    const score = terms.reduce((total, term) => total + (lower.includes(term) ? 1 : 0), 0);
    return { sentence, score };
  });
  const seen = new Set();

  return scored
    .sort((a, b) => b.score - a.score)
    .map((item) => compactSummaryItem(item.sentence, 130))
    .filter((item) => {
      const key = item.toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, maxItems);
}

function compactSummaryForDisplay(items, maxItems = 5) {
  const seen = new Set();
  return (Array.isArray(items) ? items : [])
    .map((item) => compactSummaryItem(item, 140))
    .filter((item) => {
      const key = item.toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, maxItems);
}

function compactSummaryItem(value, maxChars) {
  const text = String(value || "")
    .replace(/^(?:key\s*(?:note|point)|definition|note)\s*:\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= maxChars) return text;
  const firstSentence = text.split(/(?<=[.!?])\s+/)[0];
  const candidate = firstSentence.length <= maxChars ? firstSentence : text;
  const cutoff = candidate.lastIndexOf(" ", maxChars - 3);
  return `${candidate.slice(0, cutoff > 40 ? cutoff : maxChars - 3).trim()}...`;
}
function buildLocalNoteSections(summary) {
  return summary.slice(0, 4).map((item, index) => ({
    heading: `Key Idea ${index + 1}`,
    bullets: [item]
  }));
}
function buildQuestions(sentences, terms, questionCount) {
  return buildConceptQuestions(sentences.join(" "), sentences, buildSummary(sentences, terms), questionCount);
}

function buildConceptQuestions(text, sentences, summary, questionCount, difficulty = "normal", quizStyle = "mixed") {
  const bank = [];
  const lower = text.toLowerCase();
  const add = (question) => {
    if (!question?.prompt || bank.some((item) => item.prompt === question.prompt)) return;
    bank.push({
      id: crypto.randomUUID(),
      type: "mcq",
      questionStyle: question.questionStyle || "Understand",
      cognitiveLevel: question.cognitiveLevel || "understand",
      skill: question.skill || question.topic || "Concept understanding",
      whyThisMatters: question.whyThisMatters || "This checks whether you understand the concept beyond keywords.",
      misconceptionTested: question.misconceptionTested || "",
      ...question
    });
  };

  if (/variable/.test(lower)) {
    add({
      prompt: "What is the best description of a variable in Java?",
      choices: shuffle(["A named container that stores a value", "A comment that explains code", "A class that always creates objects", "A number that cannot change"]),
      answer: "A named container that stores a value",
      topic: "Variables",
      questionStyle: "Definition",
      skill: "Explain what variables store",
      hint: "Think about what a program needs to remember and reuse.",
      explanation: "The source describes variables as containers used by a program to store values.",
      sourceText: findSentence(sentences, "Variables are") || findSentence(sentences, "container")
    });
  }

  if (/declared before it is used|declaring a variable|declare/.test(lower)) {
    add({
      prompt: "Why must a Java variable be declared before it is used?",
      choices: shuffle(["So Java knows its data type, name, and required memory", "So the value is automatically printed", "So the program becomes object-oriented", "So Java ignores case sensitivity"]),
      answer: "So Java knows its data type, name, and required memory",
      topic: "Declaring Variables",
      questionStyle: "Application",
      cognitiveLevel: "apply",
      skill: "Connect declaration to memory and identity",
      hint: "Look at what declaration tells the compiler before a value is assigned.",
      explanation: "Declaration states the data type and identifier so memory can be allocated and the variable can be accessed.",
      sourceText: findSentence(sentences, "declared before") || findSentence(sentences, "memory")
    });
  }

  if (/defin|initiali/.test(lower)) {
    add({
      prompt: "Which option correctly distinguishes declaring and defining a variable?",
      choices: shuffle(["Declaring gives type/name; defining or initialising assigns a value", "Declaring assigns a value; defining deletes the variable", "Declaring only works for String; defining only works for int", "Declaring and defining are unrelated to memory"]),
      answer: "Declaring gives type/name; defining or initialising assigns a value",
      topic: "Declaration vs Definition",
      questionStyle: "Comparison",
      skill: "Compare declaration and definition",
      hint: "One step introduces the variable; the other gives it a stored value.",
      explanation: "The source explains that declaration states data type and name, while definition/initialisation assigns a value.",
      sourceText: findSentence(sentences, "Declaring a variable means") || findSentence(sentences, "defining")
    });
  }

  if (/primitive/.test(lower) && /object/.test(lower)) {
    add({
      prompt: "Which statement correctly compares primitive and object data types in Java?",
      choices: shuffle(["Primitive types are predefined by Java; object types are defined by classes", "Primitive types are always written with uppercase names", "Object types cannot store sequences of characters", "Primitive and object types are exactly the same"]),
      answer: "Primitive types are predefined by Java; object types are defined by classes",
      topic: "Primitive vs Object Types",
      questionStyle: "Comparison",
      skill: "Separate primitive and object data types",
      hint: "Focus on whether the type comes built into the language or from a class.",
      explanation: "The source says primitive types are predefined as part of Java, while object types are defined by classes.",
      sourceText: findSentence(sentences, "Primitive types") || findSentence(sentences, "object types")
    });
  }

  const typeQuestions = [
    ["boolean", "Which Java type should you choose for true/false values?", "boolean", ["int", "double", "char"]],
    ["char", "Which Java type should you choose for a single character such as 'A'?", "char", ["String", "boolean", "double"]],
    ["double", "Which Java type should you choose for a number with a decimal point?", "double", ["int", "char", "boolean"]],
    ["int", "Which Java type should you choose for a whole integer number such as 42?", "int", ["double", "char", "boolean"]]
  ];
  typeQuestions.forEach(([keyword, prompt, answer, distractors]) => {
    if (lower.includes(keyword)) {
      add({
        prompt,
        choices: shuffle([answer, ...distractors]),
        answer,
        topic: "Primitive Data Types",
        questionStyle: "Application",
        cognitiveLevel: "apply",
        skill: `Choose the correct ${keyword} type`,
        hint: "Match the value shape to the data type.",
        explanation: `The source lists ${keyword} as one of Java's primitive data types and gives examples of its values.`,
        sourceText: findSentence(sentences, keyword) || keyword
      });
    }
  });

  if (/string/.test(lower) && /double quotes|sequence of characters/.test(lower)) {
    add({
      prompt: "What makes String different from char in the lesson?",
      choices: shuffle(["String stores a sequence of characters in double quotes; char stores one character in single quotes", "String is a primitive type written in lowercase", "char stores whole sentences in double quotes", "String values must always be true or false"]),
      answer: "String stores a sequence of characters in double quotes; char stores one character in single quotes",
      topic: "String vs Char",
      questionStyle: "Misconception",
      cognitiveLevel: "analyze",
      skill: "Avoid mixing String and char literals",
      hint: "Pay attention to length and quote style.",
      explanation: "The source says String stores character sequences using double quotes, while char stores a single character using single quotes.",
      sourceText: findSentence(sentences, "double quotes") || findSentence(sentences, "single quotes")
    });
  }

  if (/case-sensitive|case sensitive/.test(lower)) {
    add({
      prompt: "What does Java being case-sensitive imply for this lesson?",
      choices: shuffle(["Uppercase and lowercase letters are treated differently", "All primitive types must start uppercase", "Quotes are optional around characters", "Boolean values can be written as True or False"]),
      answer: "Uppercase and lowercase letters are treated differently",
      topic: "Case Sensitivity",
      questionStyle: "Misconception",
      skill: "Recognize Java case sensitivity rules",
      hint: "Think about why String starts with uppercase S but primitive types do not.",
      explanation: "The source explicitly notes that Java is case-sensitive and points out lowercase primitive types and uppercase String.",
      sourceText: findSentence(sentences, "case-sensitive")
    });
  }

  buildStatementQuestions(summary, sentences).forEach(add);
  return tuneLocalQuestions(bank, difficulty, quizStyle).slice(0, questionCount);
}

function buildStatementQuestions(summary, sentences) {
  const useful = summary.filter((item) => item.length > 50).slice(0, 5);
  return useful.map((sentence, index) => {
    const correct = simplifyStatement(sentence);
    const distractors = useful
      .filter((item) => item !== sentence)
      .map((item) => simplifyStatement(item))
      .slice(0, 3);
    while (distractors.length < 3) distractors.push(["This concept is only background information", "This rule applies only after object creation", "This value is ignored by Java"][distractors.length]);
    return {
      prompt: `Which statement best matches the lesson idea: ${makeConceptLabel(sentence)}?`,
      choices: shuffle([correct, ...distractors.slice(0, 3)]),
      answer: correct,
      topic: makeConceptLabel(sentence),
      questionStyle: ["Understand", "Application", "Comparison", "Misconception", "Sequence"][index % 5],
      skill: `Explain ${makeConceptLabel(sentence)}`,
      hint: "Choose the option that matches the source, not just a familiar keyword.",
      explanation: sentence,
      sourceText: sentence
    };
  });
}


function tuneLocalQuestions(questions, difficulty, quizStyle) {
  const byStyle = {
    definition: ["Definition", "Understand", "Comparison", "Application", "Misconception"],
    application: ["Application", "Sequence", "Formula Reading", "Comparison", "Misconception", "Definition"],
    weakness: ["Misconception", "Comparison", "Application", "Formula Reading", "Definition", "Understand"],
    mixed: ["Application", "Comparison", "Misconception", "Definition", "Sequence", "Understand", "Formula Reading"]
  };
  const order = byStyle[quizStyle] || byStyle.mixed;
  let ranked;
  if (quizStyle === "mixed") {
    ranked = roundRobinByStyle(questions, order);
  } else {
    ranked = [...questions].sort((a, b) => {
      const aRank = order.indexOf(a.questionStyle);
      const bRank = order.indexOf(b.questionStyle);
      return (aRank === -1 ? 99 : aRank) - (bRank === -1 ? 99 : bRank);
    });
  }

  return ranked.map((question, index) => adjustLocalQuestionDifficulty(question, difficulty, quizStyle, index));
}

function roundRobinByStyle(questions, styleOrder) {
  const buckets = new Map(styleOrder.map((style) => [style, []]));
  const other = [];
  questions.forEach((question) => {
    const bucket = buckets.get(question.questionStyle);
    if (bucket) bucket.push(question);
    else other.push(question);
  });

  const result = [];
  let added = true;
  while (added) {
    added = false;
    for (const style of styleOrder) {
      const bucket = buckets.get(style);
      if (bucket?.length) {
        result.push(bucket.shift());
        added = true;
      }
    }
  }
  return [...result, ...other];
}

function adjustLocalQuestionDifficulty(question, difficulty, quizStyle, index = 0) {
  const next = { ...question, choices: [...question.choices] };
  const incorrectChoice = getPlausibleWrongChoice(next);

  applyLocalQuizStyle(next, quizStyle, incorrectChoice, index);
  applyLocalDifficulty(next, difficulty, quizStyle, incorrectChoice);
  return next;
}

function applyLocalQuizStyle(question, quizStyle, incorrectChoice, index) {
  if (quizStyle === "application") {
    question.questionStyle = "Application";
    question.cognitiveLevel = "apply";
    question.prompt = makeApplicationPrompt(question.prompt, question.topic);
    question.hint = `Use the lesson rule in the situation instead of matching a keyword. ${question.hint || ""}`.trim();
    return;
  }

  if (quizStyle === "weakness") {
    question.questionStyle = "Misconception";
    question.cognitiveLevel = "analyze";
    question.prompt = `A student chooses "${cleanChoiceForPrompt(incorrectChoice)}" while revising ${question.topic || "this idea"}. Which option is the best correction?`;
    question.misconceptionTested = `Choosing "${cleanChoiceForPrompt(incorrectChoice)}" instead of applying the exact rule.`;
    question.hint = `Find the exact rule that makes the student's choice incomplete or wrong. ${question.hint || ""}`.trim();
    return;
  }

  if (quizStyle === "definition") {
    question.questionStyle = "Definition";
    question.cognitiveLevel = "recall";
    question.prompt = makeDefinitionPrompt(question);
    question.hint = `Recall the precise meaning from the lesson. ${question.hint || ""}`.trim();
    return;
  }

  if (index % 4 === 0 && question.questionStyle === "Definition") {
    question.questionStyle = "Application";
    question.cognitiveLevel = "apply";
    question.prompt = makeApplicationPrompt(question.prompt, question.topic);
  }
}

function applyLocalDifficulty(question, difficulty, quizStyle, incorrectChoice) {
  if (difficulty === "easy") {
    question.cognitiveLevel = quizStyle === "application" ? "understand" : "recall";
    question.prompt = makeEasyPrompt(question.prompt);
    question.hint = `Start with the direct rule or definition. ${question.hint || ""}`.trim();
    return;
  }

  if (difficulty === "hard") {
    question.cognitiveLevel = quizStyle === "application" ? "apply" : "analyze";
    question.prompt = makeHarderPrompt(question.prompt, question.questionStyle, incorrectChoice, question.topic);
    question.hint = `Check every condition and eliminate answers that are only partly true. ${question.hint || ""}`.trim();
    question.whyThisMatters = "This tests whether you can apply the idea precisely instead of recognizing a familiar phrase.";
  }
}

function getPlausibleWrongChoice(question) {
  return question.choices.find((choice) => choice !== question.answer) || "an incomplete rule";
}

function cleanChoiceForPrompt(choice) {
  return String(choice || "an incomplete rule").replace(/["\n\r]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 120);
}

function makeApplicationPrompt(prompt, topic) {
  const text = String(prompt || "").replace(/\s+/g, " ").trim();
  if (/^Which Java type should you choose/i.test(text)) {
    return `A student is writing a Java example for ${topic || "the lesson"}. ${lowercaseFirst(text)}`;
  }
  if (/^What is the best description/i.test(text)) {
    return `A student needs to explain ${topic || "this concept"} in a short program example. Which description should they use?`;
  }
  return `In a short exam example about ${topic || "this lesson"}, ${lowercaseFirst(text)}`;
}

function makeDefinitionPrompt(question) {
  const prompt = String(question.prompt || "").replace(/\s+/g, " ").trim();
  const simpleChoices = question.choices.every((choice) => /^[A-Za-z][A-Za-z0-9_]*$/.test(String(choice)));
  if (simpleChoices || /^(What is|What does|Which Java type|Which statement best matches)/i.test(prompt)) {
    return prompt;
  }
  return `Which statement gives the most accurate core meaning of ${question.topic || "this concept"}?`;
}

function makeEasyPrompt(prompt) {
  return String(prompt || "")
    .replace(/^Which answer most precisely explains/i, "Which answer best explains")
    .replace(/^Which option avoids the most common mistake\?\s*/i, "")
    .replace(/^In a short exam example about .*?,\s*/i, "");
}

function makeHarderPrompt(prompt, style, incorrectChoice, topic) {
  const text = String(prompt || "").replace(/\s+/g, " ").trim();
  if (style === "Misconception") {
    return `A student defends the choice "${cleanChoiceForPrompt(incorrectChoice)}" about ${topic || "this topic"}. Which answer most precisely corrects the reasoning?`;
  }
  if (style === "Application") {
    const base = text.replace(/^In a short exam example about .*?,\s*/i, "");
    const sentence = base ? base.charAt(0).toUpperCase() + base.slice(1) : "Choose the rule that applies.";
    return `A student must apply the lesson in a new example. ${sentence}`;
  }
  return `In an unfamiliar exam situation about ${topic || "this topic"}, ${lowercaseFirst(text)}`;
}

function lowercaseFirst(value) {
  const text = String(value || "").trim();
  return text ? text.charAt(0).toLowerCase() + text.slice(1) : "which option is correct?";
}
function findSentence(sentences, pattern) {
  const lowerPattern = String(pattern || "").toLowerCase();
  return sentences.find((sentence) => sentence.toLowerCase().includes(lowerPattern)) || "";
}

function simplifyStatement(sentence) {
  return sentence
    .replace(/^Definition:\s*/i, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 150);
}

function makeConceptLabel(sentence) {
  const words = getWords(sentence).filter((word) => word.length > 3).slice(0, 4);
  return words.length ? words.map(toTitleCase).join(" ") : "Key Concept";
}
function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toTitleCase(value) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function hasChromeTabs() {
  return typeof globalThis.chrome?.tabs?.query === "function";
}

function hasChromeScripting() {
  return typeof globalThis.chrome?.scripting?.executeScript === "function";
}

async function getActiveTab() {
  if (!hasChromeTabs()) return null;
  const [tab] = await globalThis.chrome.tabs.query({ active: true, currentWindow: true });
  return tab || null;
}

function normalizePageUrl(value) {
  try {
    return new URL(String(value || "")).href;
  } catch {
    return "";
  }
}

function samePageUrl(firstUrl, secondUrl) {
  const first = normalizePageUrl(firstUrl);
  const second = normalizePageUrl(secondUrl);
  return Boolean(first && second && first === second);
}

function makeContentFingerprint(value) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `${text.length}:${(hash >>> 0).toString(36)}`;
}

async function getPdfJs() {
  if (globalThis.ExamCramPdfVendor?.pdfjs) return globalThis.ExamCramPdfVendor.pdfjs;
  if (globalThis.ExamCramPdfVendorReady) {
    const vendor = await globalThis.ExamCramPdfVendorReady;
    if (vendor?.pdfjs) return vendor.pdfjs;
  }
  throw new Error("The local PDF reader is unavailable. Reload Exam-Cram from chrome://extensions and try again.");
}

function getPdfWorkerUrl() {
  return globalThis.chrome?.runtime?.getURL
    ? globalThis.chrome.runtime.getURL("pdf-worker.bundle.mjs")
    : new URL("pdf-worker.bundle.mjs", location.href).href;
}

function callChromeBooleanMethod(context, method, args = []) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (value, error) => {
      if (settled) return;
      settled = true;
      if (error) reject(error);
      else resolve(Boolean(value));
    };
    const callback = (value) => {
      const runtimeError = globalThis.chrome?.runtime?.lastError;
      finish(value, runtimeError ? new Error(runtimeError.message || "Chrome permission check failed.") : null);
    };
    try {
      const result = method.apply(context, [...args, callback]);
      if (result && typeof result.then === "function") result.then((value) => finish(value), (error) => finish(false, error));
    } catch (error) {
      finish(false, error);
    }
  });
}

async function ensureDocumentUrlAccess(sourceUrl, { request = false } = {}) {
  const Reader = globalThis.ExamCramDocumentReader;
  const url = new URL(sourceUrl);
  if (url.protocol === "file:") {
    const declared = globalThis.chrome?.runtime?.getManifest?.()?.optional_host_permissions || [];
    if (!declared.includes("file:///*")) {
      throw new Reader.DocumentReaderError("FILE_ACCESS_DISABLED", Reader.FILE_ACCESS_GUIDANCE);
    }
    if (!globalThis.chrome?.extension?.isAllowedFileSchemeAccess) {
      throw new Reader.DocumentReaderError("FILE_ACCESS_DISABLED", Reader.FILE_ACCESS_GUIDANCE);
    }
    const allowed = await callChromeBooleanMethod(
      globalThis.chrome.extension,
      globalThis.chrome.extension.isAllowedFileSchemeAccess
    );
    if (!allowed) throw new Reader.DocumentReaderError("FILE_ACCESS_DISABLED", Reader.FILE_ACCESS_GUIDANCE);
    return true;
  }

  const origin = Reader.getPermissionOrigin(sourceUrl);
  if (!origin || !globalThis.chrome?.permissions?.contains) return true;
  const contained = await callChromeBooleanMethod(globalThis.chrome.permissions, globalThis.chrome.permissions.contains, [{ origins: [origin] }]);
  if (contained) return true;
  const hostname = url.hostname.replace(/^www\./i, "") || "this document host";
  if (!request || !globalThis.chrome?.permissions?.request) {
    throw new Reader.DocumentReaderError("DOCUMENT_PERMISSION_NEEDED", `Permission needed for this document. Allow Exam-Cram access to ${hostname} and try again.`);
  }
  const granted = await callChromeBooleanMethod(globalThis.chrome.permissions, globalThis.chrome.permissions.request, [{ origins: [origin] }]);
  if (!granted) {
    throw new Reader.DocumentReaderError("DOCUMENT_PERMISSION_DENIED", `Document access was not granted for ${hostname}. The side panel will stay open, but Exam-Cram cannot read it.`);
  }
  return true;
}

async function fetchBoundedActiveDocument(sourceUrl) {
  const Reader = globalThis.ExamCramDocumentReader;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(sourceUrl, {
      method: "GET",
      credentials: "omit",
      cache: "no-store",
      redirect: "follow",
      referrerPolicy: "no-referrer",
      headers: { Accept: "application/pdf,application/octet-stream;q=0.9,text/html;q=0.2" },
      signal: controller.signal
    });
    if (!response.ok) {
      throw new Reader.DocumentReaderError("DOCUMENT_FETCH_FAILED", `The document server returned HTTP ${response.status}.`);
    }
    if (response.url && response.url !== sourceUrl) {
      await ensureDocumentUrlAccess(response.url, { request: false });
    }
    const declaredLength = Number(response.headers.get("content-length"));
    if (Number.isFinite(declaredLength) && declaredLength > Reader.MAX_PDF_BYTES) {
      throw new Reader.DocumentReaderError("PDF_TOO_LARGE", "This PDF is larger than the 24 MB reading limit.");
    }
    if (!response.body?.getReader) {
      throw new Reader.DocumentReaderError("DOCUMENT_STREAM_UNAVAILABLE", "This browser could not stream the document safely.");
    }
    const stream = response.body.getReader();
    const chunks = [];
    let total = 0;
    while (true) {
      const { done, value } = await stream.read();
      if (done) break;
      total += value.byteLength;
      if (total > Reader.MAX_PDF_BYTES) {
        await stream.cancel().catch(() => undefined);
        throw new Reader.DocumentReaderError("PDF_TOO_LARGE", "This PDF is larger than the 24 MB reading limit.");
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return {
      bytes,
      contentType: response.headers.get("content-type") || "",
      finalUrl: response.url || sourceUrl
    };
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Reader.DocumentReaderError("DOCUMENT_FETCH_TIMEOUT", "The document download took too long and was stopped safely.");
    }
    if (error instanceof Reader.DocumentReaderError) throw error;
    throw new Reader.DocumentReaderError("DOCUMENT_FETCH_FAILED", `The document could not be downloaded safely: ${error?.message || "network error"}`);
  } finally {
    clearTimeout(timeoutId);
  }
}

async function extractPdfDocumentFromTab(tab, descriptor, { probe = false } = {}) {
  const Reader = globalThis.ExamCramDocumentReader;
  await ensureDocumentUrlAccess(descriptor.url, { request: true });
  const fetched = await fetchBoundedActiveDocument(descriptor.url);
  const kind = Reader.classifyFetchedDocument({
    bytes: fetched.bytes,
    contentType: fetched.contentType,
    url: fetched.finalUrl,
    expectedKind: descriptor.kind === "pdf" ? "pdf" : ""
  });
  if (kind !== "pdf") {
    throw new Reader.DocumentReaderError(
      probe ? "NOT_PDF_DOCUMENT" : "UNSUPPORTED_DOCUMENT",
      probe ? "The active source is HTML, not PDF." : "Exam-Cram can read HTML pages and PDF documents only."
    );
  }
  const parsed = await Reader.extractPdfText(fetched.bytes, await getPdfJs(), {
    fallbackTitle: String(tab.title || "PDF document").replace(/\s*[-|]\s*PDF(?: Viewer)?\s*$/i, ""),
    workerSrc: getPdfWorkerUrl(),
    maxBytes: Reader.MAX_PDF_BYTES,
    maxPages: Reader.MAX_PDF_PAGES,
    maxText: Reader.MAX_EXTRACTED_TEXT,
    timeoutMs: Reader.DOCUMENT_PARSE_TIMEOUT_MS
  });
  Reader.assertReadableContent(parsed.text, "pdf");
  const activeTab = await getActiveTab();
  if (activeTab?.id !== tab.id || !samePageUrl(activeTab.url, tab.url)) {
    throw new Reader.DocumentReaderError("DOCUMENT_CHANGED", "The active PDF changed while it was being read. Return to the source and try again.");
  }
  return {
    ...parsed,
    title: parsed.title || tab.title || "PDF document",
    url: descriptor.url,
    sourceTabId: tab.id,
    sourceFingerprint: makeContentFingerprint(parsed.text),
    documentType: "pdf",
    imported: false
  };
}

async function extractHtmlDocumentFromTab(tab) {
  const frameResults = await globalThis.chrome.scripting.executeScript({
    target: { tabId: tab.id, allFrames: true },
    files: ["document-frame-reader.js"]
  });
  return globalThis.ExamCramDocumentReader.mergeFrameSnapshots(frameResults, {
    title: tab.title || "HTML document",
    url: tab.url
  });
}

async function extractCurrentPage() {
  if (!hasChromeTabs() || !hasChromeScripting()) {
    throw new Error("Current-page reading is available in the browser extension. You can still use Open HTML or PDF file here.");
  }
  const Reader = globalThis.ExamCramDocumentReader;
  if (!Reader) throw new Error("The document reader is unavailable. Reload Exam-Cram from chrome://extensions and try again.");
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const tab = await getActiveTab();
    if (!Number.isInteger(tab?.id)) throw new Error("Open an HTML page or PDF document before creating a visual note.");
    const descriptor = Reader.classifyTabDocument(tab.url || "");
    await ensureDocumentUrlAccess(descriptor.url, { request: true });
    if (descriptor.kind === "pdf") return extractPdfDocumentFromTab(tab, descriptor);

    let page;
    try {
      page = await extractHtmlDocumentFromTab(tab);
    } catch (error) {
      try {
        return await extractPdfDocumentFromTab(tab, descriptor, { probe: true });
      } catch (probeError) {
        if (probeError?.code !== "NOT_PDF_DOCUMENT" && probeError?.code !== "UNSUPPORTED_DOCUMENT") throw probeError;
      }
      if (attempt === 0) continue;
      const message = String(error?.message || "");
      if (/cannot access|cannot read|host permission|permission/i.test(message)) {
        throw new Reader.DocumentReaderError("DOCUMENT_PERMISSION_NEEDED", "Permission needed for this page. Allow Exam-Cram access to this site and try again.");
      }
      throw new Reader.DocumentReaderError("HTML_READ_FAILED", "Chrome could not read this HTML page. Protected browser pages and extension galleries are not supported.");
    }
    const activeTab = await getActiveTab();
    const sourceStayedActive = activeTab?.id === tab.id
      && samePageUrl(tab.url, page?.url)
      && samePageUrl(activeTab.url, page?.url);
    if (page && sourceStayedActive) {
      return {
        ...page,
        sourceTabId: tab.id,
        sourceFingerprint: makeContentFingerprint(page.text),
        documentType: "html"
      };
    }

    if (attempt === 1) {
      throw new Error("The active page changed while it was being read. Return to the source page and try again.");
    }
  }

  throw new Error("The active page could not be read safely. Try again from the source page.");
}
function renderNote(note) {
  state.currentSession = null;
  state.currentArtifact = note;
  state.currentExportItem = note;
  elements.views.forEach((view) => {
    view.classList.remove("active");
    view.setAttribute("aria-hidden", "true");
  });
  updateStudyModeSelection("");
  elements.resultView.classList.remove("hidden");
  elements.resultView.setAttribute("aria-hidden", "false");
  elements.quizBlock.classList.add("hidden");
  elements.scoreBlock.classList.add("hidden");
  elements.submitQuizButton.classList.add("hidden");
  elements.saveSessionButton.classList.add("hidden");
  elements.generateQuizButton?.classList.remove("hidden");
  if (elements.generateQuizButton) elements.generateQuizButton.textContent = "Generate quiz";
  renderArtifactSourceBanner(note);

  elements.sessionTitle.textContent = note.title;
  elements.sessionMeta.textContent = `${formatSessionSource(note)} | ${note.terms?.length || 0} key terms | ${note.generator || "ai"}`;
  const conciseSummary = compactSummaryForDisplay(note.summary || []);
  elements.summaryList.replaceChildren(...conciseSummary.map((item) => createElement("li", item)));
  renderCheatSheet(note);
  renderNoteVisual({ ...note, summary: conciseSummary });
  elements.wrongAnswerList.replaceChildren();
  updatePinnedArtifactControl();
  void persistCurrentSessionDraft();
}

function renderNoteVisual(note) {
  renderVisualTutorNote(note.visualLesson, note.summary || [], { ...note, showAssessment: false });
}

function normalizeStudyCheatSheet(artifact = {}, sourceContext = {}) {
  const api = globalThis.ExamCramCheatSheet;
  if (!api?.normalizeCheatSheet) return artifact.cheatSheet || null;
  const binding = artifact.sourceBinding && typeof artifact.sourceBinding === "object"
    ? artifact.sourceBinding
    : {};
  const sourceType = binding.sourceType || binding.type || sourceContext.sourceType || artifact.sourceType || "webpage";
  const sourceUrl = binding.url || sourceContext.sourceUrl || artifact.sourceUrl || "";
  const sourceTitle = binding.title || sourceContext.title || artifact.title || "Study source";
  return api.normalizeCheatSheet(artifact.cheatSheet, {
    artifact,
    title: artifact.title || sourceTitle,
    sourceTitle,
    sourceType,
    sourceUrl,
    sourceFingerprint: binding.fingerprint || sourceContext.sourceFingerprint || artifact.sourceFingerprint || "",
    sourceBinding: binding,
    documentType: binding.documentType || sourceContext.documentType || artifact.documentType || "",
    rawText: sourceContext.rawText || binding.rawText || "",
    summary: artifact.summary || [],
    visualLesson: artifact.visualLesson || null,
    visualModel: artifact.visualLesson?.visualModel || null,
    videoSegments: binding.videoSegments || sourceContext.videoSegments || artifact.videoSegments || [],
    collectionSources: binding.collectionSources || sourceContext.collectionSources || artifact.sources || [],
    sources: artifact.sources || binding.collectionSources || []
  });
}

function renderCheatSheet(artifact = {}) {
  if (!elements.cheatSheetBlock || !elements.cheatSheetTableHost) return;
  const sheet = normalizeStudyCheatSheet(artifact);
  const api = globalThis.ExamCramCheatSheet;
  if (!api?.hasUsableCheatSheet?.(sheet)) {
    elements.cheatSheetBlock.classList.add("hidden");
    elements.cheatSheetTableHost.replaceChildren();
    return;
  }

  artifact.cheatSheet = sheet;
  elements.cheatSheetBlock.classList.remove("hidden");
  if (elements.cheatSheetIntro) {
    elements.cheatSheetIntro.textContent = `${sheet.caption} Use the evidence column to verify where each idea came from.`;
  }

  const table = document.createElement("table");
  table.className = "cheat-sheet-table";
  const caption = document.createElement("caption");
  caption.textContent = sheet.title;
  table.append(caption);

  const head = document.createElement("thead");
  const headRow = document.createElement("tr");
  sheet.columns.forEach((column) => {
    const header = document.createElement("th");
    header.scope = "col";
    header.textContent = column.label;
    headRow.append(header);
  });
  head.append(headRow);
  table.append(head);

  const body = document.createElement("tbody");
  sheet.rows.forEach((row) => {
    const tableRow = document.createElement("tr");
    const values = {
      topic: row.topic,
      mainIdea: row.mainIdea,
      keyFacts: row.keyFacts,
      example: row.example
    };
    sheet.columns.forEach((column, columnIndex) => {
      const cell = document.createElement(columnIndex === 0 ? "th" : "td");
      if (columnIndex === 0) cell.scope = "row";
      cell.dataset.label = column.label;
      if (column.key === "evidence") renderCheatSheetEvidence(cell, row.evidence || {}, artifact);
      else cell.textContent = values[column.key] || "—";
      tableRow.append(cell);
    });
    body.append(tableRow);
  });
  table.append(body);
  elements.cheatSheetTableHost.replaceChildren(table);
}

function renderCheatSheetEvidence(cell, evidence, artifact) {
  const label = createElement("strong", evidence.label || "Source passage", "cheat-sheet-evidence-label");
  cell.append(label);
  if (evidence.anchor) cell.append(createElement("span", `“${evidence.anchor}”`, "cheat-sheet-evidence-anchor"));

  const actions = document.createElement("span");
  actions.className = "cheat-sheet-evidence-actions";
  if (evidence.sourceType === "video" && Number.isFinite(evidence.timestampSeconds)) {
    const jumpButton = document.createElement("button");
    jumpButton.type = "button";
    jumpButton.className = "text-button cheat-sheet-source-action";
    jumpButton.textContent = `Jump to ${formatTimestamp(evidence.timestampSeconds)}`;
    jumpButton.addEventListener("click", async () => {
      jumpButton.disabled = true;
      const binding = artifact.sourceBinding || {};
      const result = await jumpToVideoTimestamp(evidence.timestampSeconds, {
        expectedSourceUrl: evidence.url || binding.url || artifact.sourceUrl,
        sourceTabId: Number.isInteger(artifact.sourceTabId) ? artifact.sourceTabId : binding.tabId,
        videoMediaId: artifact.videoMediaId || binding.mediaId || ""
      });
      showStatus(result.message, !result.ok);
      jumpButton.disabled = false;
    });
    actions.append(jumpButton);
  }
  const safeEvidenceUrl = normalizeSafeExternalUrl(evidence.url);
  if (safeEvidenceUrl) {
    const sourceLink = document.createElement("a");
    sourceLink.className = "cheat-sheet-source-action";
    sourceLink.href = safeEvidenceUrl;
    sourceLink.target = "_blank";
    sourceLink.rel = "noopener noreferrer";
    sourceLink.textContent = evidence.sourceType === "video" ? "Open video" : "Open source";
    sourceLink.addEventListener("click", async (event) => {
      event.preventDefault();
      await persistCurrentSessionDraft();
      await openSafeExternalUrl(safeEvidenceUrl);
    });
    actions.append(sourceLink);
  }
  if (actions.childElementCount) cell.append(actions);
}

function renderQuizVisual(session) {
  renderVisualTutorNote(session.visualLesson, session.summary || [], { ...session, showAssessment: true });
}

function renderVisualTutorNote(visualLesson, summary = [], context = {}) {
  elements.noteVisual.classList.remove("hidden");
  const lesson = normalizeVisualLessonForRender(visualLesson, summary);
  const heavyMode = isHeavyVisualModel(lesson.visualModel, { ...context, summary });
  const root = document.createElement("div");
  root.className = "vin-root";
  const interactiveModel = renderInteractiveVisualModel(lesson.visualModel, {
    ...context,
    summary,
    heavyMode
  });
  root.append(interactiveModel);

  // Dense notes already expose an overview, concept index, selected detail,
  // evidence, and optional practice. Repeating legacy views makes that route
  // harder to scan, so they remain available only for compact models.
  if (!heavyMode) {
    const legacyViews = renderLegacyVisualViews(lesson.blocks);
    if (legacyViews) root.append(legacyViews);
  }
  cleanupVisualModelRenderer();
  state.visualModelCleanup = interactiveModel.cleanupVisualModel || null;
  elements.noteVisual.replaceChildren(root);
  promoteInteractiveNoteSurface();
}

function cleanupVisualModelRenderer() {
  if (typeof state.visualModelCleanup === "function") state.visualModelCleanup();
  state.visualModelCleanup = null;
}

function promoteInteractiveNoteSurface() {
  const summaryBlock = elements.noteVisual.closest(".summary-block");
  if (!summaryBlock) return;
  const keyPoints = elements.summaryList.closest(".key-points-visible");
  if (keyPoints && keyPoints.nextElementSibling !== elements.noteVisual) {
    keyPoints.insertAdjacentElement("afterend", elements.noteVisual);
  }
}

function normalizeVisualLessonForRender(visualLesson, summary = []) {
  const lesson = visualLesson && typeof visualLesson === "object" ? visualLesson : {};
  const rawBlocks = Array.isArray(lesson.blocks) && lesson.blocks.length
    ? lesson.blocks.slice(0, 5)
    : buildFallbackVisualBlocks(summary);
  const blocks = rawBlocks.some((block) => block?.type === "interactive_demo")
    ? rawBlocks
    : [buildFallbackInteractiveDemo(summary), ...rawBlocks].slice(0, 5);
  const candidateModel = lesson.visualModel && typeof lesson.visualModel === "object"
    ? lesson.visualModel
    : (Array.isArray(lesson.nodes) ? lesson : synthesizeVisualModel({ ...lesson, blocks }, summary));
  return {
    title: lesson.title || "Guided lesson from this page",
    objective: lesson.objective || "Explore the relationships, test a case, then check your understanding.",
    visualModel: normalizeVisualModelForRender(candidateModel, summary),
    blocks
  };
}

function normalizeVisualModelForRender(value, summary = []) {
  const model = value && typeof value === "object" ? value : {};
  const kind = ["system", "flow", "timeline", "comparison", "formula", "cycle"].includes(model.kind)
    ? model.kind
    : "system";
  const fallbackNotes = compactSummaryForDisplay(summary, 6);
  const rawNodes = Array.isArray(model.nodes) && model.nodes.length
    ? model.nodes.slice(0, 8)
    : fallbackNotes.map((detail, index) => ({
      id: `idea-${index + 1}`,
      label: makeConceptLabel(detail) || `Idea ${index + 1}`,
      detail,
      why: "It supports the main relationship shown in this note.",
      example: detail,
      sourceText: detail
    }));
  if (!rawNodes.length) {
    rawNodes.push(
      { id: "core-idea", label: "Core idea", detail: visualText(model.objective, "Start with the central relationship in this note.") },
      { id: "result", label: "Result", detail: "Trace what the core idea changes or produces." }
    );
  }
  while (rawNodes.length < 3) {
    const index = rawNodes.length;
    const groundedDetail = fallbackNotes[index]
      || fallbackNotes.join(" ")
      || visualText(model.objective, rawNodes.map((node) => node?.detail).filter(Boolean).join(" "));
    rawNodes.push({
      id: `connection-${index + 1}`,
      label: index === 1 ? "Context" : "Connection",
      detail: groundedDetail || "Connect the visible concepts to explain the result.",
      why: visualText(model.objective, "It links the other concepts in this note."),
      example: groundedDetail,
      sourceText: groundedDetail
    });
  }

  const idMap = new Map();
  const usedIds = new Set();
  const nodes = rawNodes.map((node, index) => {
    const source = node && typeof node === "object" ? node : { label: node };
    const rawId = visualText(source.id || source.label, `node-${index + 1}`, 70);
    let id = visualId(rawId, index, "node");
    while (usedIds.has(id)) id = `${id}-${index + 1}`;
    usedIds.add(id);
    idMap.set(rawId, id);
    idMap.set(visualId(rawId, index, "node"), id);
    const detail = visualText(source.detail || source.description || source.definition, "Review how this idea connects to the lesson.");
    const sourceText = visualText(source.sourceText || source.source || source.sourceAnchor || source.sourceExcerpt || detail, detail, 320);
    return {
      id,
      label: visualText(source.label || source.name, `Concept ${index + 1}`, 70),
      symbol: visualText(source.symbol || source.icon, "", 12),
      detail,
      why: visualText(source.why || source.whyItMatters || source.role || model.objective, "It helps explain the relationship shown in the visual."),
      example: visualText(source.example || source.application || sourceText, detail),
      sourceText,
      sourceAnchor: sourceText,
      role: visualText(source.role || source.type, "concept", 40),
      sourceId: visualText(source.sourceId || source.sourceRef?.sourceId, "", 100),
      sourceSegmentId: visualText(source.sourceSegmentId || source.sourceRef?.segmentId, "", 90),
      sourceTimestamp: Number.isFinite(Number(source.sourceTimestamp ?? Number(source.sourceRef?.startMs) / 1000))
        ? Math.max(0, Math.round(Number(source.sourceTimestamp ?? Number(source.sourceRef?.startMs) / 1000)))
        : null,
      sourceRef: source.sourceRef && typeof source.sourceRef === "object" ? source.sourceRef : null
    };
  });

  const resolveNodeId = (rawValue) => {
    const raw = visualText(rawValue, "", 70);
    return idMap.get(raw) || idMap.get(visualId(raw, 0, "node")) || (usedIds.has(raw) ? raw : "");
  };

  const rawEdges = Array.isArray(model.edges) ? model.edges.slice(0, 12) : [];
  const usedEdgeIds = new Set();
  let edges = rawEdges.map((edge, index) => {
    const source = edge && typeof edge === "object" ? edge : {};
    const from = resolveNodeId(source.from || source.source);
    const to = resolveNodeId(source.to || source.target);
    if (!from || !to || from === to) return null;
    const baseId = visualText(source.id, `${from}::${to}::${index + 1}`, 90);
    let id = baseId;
    let suffix = 2;
    while (usedEdgeIds.has(id)) {
      id = `${baseId}::${suffix}`.slice(0, 90);
      suffix += 1;
    }
    usedEdgeIds.add(id);
    return {
      id,
      from,
      to,
      label: visualText(source.label || source.relationship, "connects to", 55)
    };
  }).filter(Boolean);
  if (!edges.length && nodes.length > 1) {
    edges = nodes.slice(1).map((node, index) => ({
      id: `${nodes[index].id}::${node.id}::${index + 1}`,
      from: nodes[index].id,
      to: node.id,
      label: kind === "timeline" || kind === "flow" ? "then" : "connects"
    }));
  }

  const rawScenarios = Array.isArray(model.scenarios) ? model.scenarios.slice(0, 5) : [];
  let scenarios = rawScenarios.map((scenario, index) => normalizeVisualScenario(
    scenario,
    index,
    nodes,
    edges,
    resolveNodeId
  ));
  if (!scenarios.length) {
    scenarios = nodes.slice(0, Math.min(3, nodes.length)).map((node, index) => ({
      id: `focus-${index + 1}`,
      label: node.label,
      activeIds: [node.id, ...connectedVisualNodeIds(node.id, edges)].slice(0, 4),
      connections: edges.filter((edge) => edge.from === node.id || edge.to === node.id).map((edge) => edge.id),
      nodeValues: {},
      outcome: node.detail,
      insight: node.why
    }));
  }

  const check = normalizeVisualCheck(model.check, nodes, scenarios);
  let suggestedQuestions = (Array.isArray(model.suggestedQuestions) ? model.suggestedQuestions : [])
    .map((item) => visualText(typeof item === "object" ? item.prompt || item.label : item, "", 140))
    .filter(Boolean)
    .slice(0, 3);
  if (!suggestedQuestions.length) {
    suggestedQuestions = nodes.slice(0, 2).map((node) => `Why does ${node.label} matter here?`);
  }

  return {
    title: visualText(model.title, "Interactive visual note", 100),
    objective: visualText(model.objective, "Explore the connected ideas, try a scenario, then check your understanding.", 220),
    kind,
    nodes,
    edges,
    scenarios,
    check,
    suggestedQuestions
  };
}

function normalizeVisualScenario(value, index, nodes, edges, resolveNodeId) {
  const scenario = value && typeof value === "object" ? value : {};
  const rawActiveIds = scenario.activeIds || scenario.activeNodeIds || scenario.highlights || scenario.nodeIds || [];
  let activeIds = (Array.isArray(rawActiveIds) ? rawActiveIds : [rawActiveIds])
    .map((id) => resolveNodeId(typeof id === "object" ? id.id : id))
    .filter(Boolean);

  const rawConnections = Array.isArray(scenario.connections) ? scenario.connections : [];
  const connections = rawConnections.map((connection) => {
    if (connection && typeof connection === "object") {
      const from = resolveNodeId(connection.from || connection.source);
      const to = resolveNodeId(connection.to || connection.target);
      return from && to ? `${from}::${to}` : "";
    }
    return visualText(connection, "", 90);
  }).filter(Boolean);

  if (!activeIds.length && connections.length) {
    const connectionIds = new Set(connections);
    activeIds = edges
      .filter((edge) => connectionIds.has(edge.id) || connectionIds.has(`${edge.from}::${edge.to}`) || connectionIds.has(`${edge.to}::${edge.from}`))
      .flatMap((edge) => [edge.from, edge.to]);
  }
  if (!activeIds.length && nodes.length) activeIds = [nodes[index % nodes.length].id];

  const rawValues = scenario.nodeValues || scenario.values || {};
  const values = rawValues && typeof rawValues === "object" ? rawValues : {};
  const nodeValues = {};
  if (Array.isArray(values)) {
    values.forEach((item) => {
      const id = resolveNodeId(item?.id || item?.nodeId);
      if (id) nodeValues[id] = visualText(item?.value || item?.label, "", 60);
    });
  } else {
    Object.entries(values).forEach(([rawId, rawValue]) => {
      const id = resolveNodeId(rawId);
      const displayValue = rawValue && typeof rawValue === "object" ? rawValue.value || rawValue.label : rawValue;
      if (id) nodeValues[id] = visualText(displayValue, "", 60);
    });
  }

  return {
    id: visualId(scenario.id || scenario.label, index, "scenario"),
    label: visualText(scenario.label || scenario.name, `Case ${index + 1}`, 70),
    prompt: visualText(scenario.prompt || scenario.instruction, "", 180),
    activeIds: [...new Set(activeIds)],
    connections,
    nodeValues,
    values: Object.entries(nodeValues).map(([nodeId, displayValue]) => ({ nodeId, value: displayValue })),
    outcome: visualText(scenario.outcome || scenario.result, "Observe how the highlighted relationship changes."),
    insight: visualText(scenario.insight || scenario.tip || scenario.why, "Use the active path to explain the outcome.")
  };
}

function normalizeVisualCheck(value, nodes, scenarios) {
  const check = value && typeof value === "object" ? value : {};
  let choices = (Array.isArray(check.choices) ? check.choices : [])
    .map((choice) => visualText(typeof choice === "object" ? choice.label || choice.text || choice.value : choice, "", 180))
    .filter(Boolean)
    .filter((choice, index, list) => list.indexOf(choice) === index)
    .slice(0, 4);
  let answer = typeof check.answer === "number"
    ? choices[check.answer] || choices[Math.max(0, check.answer - 1)] || ""
    : visualText(check.answer || check.correctAnswer, "", 180);

  if (choices.length >= 3 && choices.includes(answer)) {
    const compactChoices = choices.slice(0, 3);
    if (!compactChoices.includes(answer)) compactChoices[2] = answer;
    choices = compactChoices;
  } else {
    choices = [
      ...scenarios.map((scenario) => scenario.outcome),
      ...nodes.map((node) => node.detail),
      ...nodes.map((node) => `${node.label}: ${node.why}`)
    ]
      .map((choice) => visualText(choice, "", 180))
      .filter(Boolean)
      .filter((choice, index, list) => list.indexOf(choice) === index)
      .slice(0, 3);
    answer = choices[0] || "";
  }

  return {
    prompt: visualText(check.prompt || check.question, scenarios[0]
      ? `Which outcome matches "${scenarios[0].label}"?`
      : "Which statement best matches the visual?", 220),
    choices,
    answer,
    explanation: visualText(check.explanation || check.feedback, scenarios[0]?.insight || nodes[0]?.why || "Follow the highlighted relationship to verify the answer.")
  };
}

function synthesizeVisualModel(lesson = {}, summary = []) {
  const blocks = Array.isArray(lesson.blocks) ? lesson.blocks : [];
  const conceptBlock = blocks.find((block) => block?.type === "concept_map");
  const processBlock = blocks.find((block) => block?.type === "process_steps");
  const formulaBlock = blocks.find((block) => block?.type === "formula_explainer");
  const comparisonBlock = blocks.find((block) => block?.type === "comparison_table");
  const exampleBlock = blocks.find((block) => block?.type === "worked_example");
  const demoBlock = blocks.find((block) => block?.type === "interactive_demo");
  let kind = conceptBlock ? "system" : processBlock ? "flow" : formulaBlock ? "formula" : comparisonBlock ? "comparison" : "system";
  let nodes = [];
  let edges = [];

  if (Array.isArray(conceptBlock?.nodes) && conceptBlock.nodes.length) {
    nodes = conceptBlock.nodes.slice(0, 8).map((node, index) => ({
      id: node.id || `concept-${index + 1}`,
      label: node.label || `Concept ${index + 1}`,
      detail: node.detail || conceptBlock.intro,
      why: conceptBlock.intro,
      example: node.detail,
      sourceText: node.detail
    }));
    edges = Array.isArray(conceptBlock.edges) ? conceptBlock.edges : [];
  } else if (Array.isArray(processBlock?.steps) && processBlock.steps.length) {
    kind = "flow";
    nodes = processBlock.steps.slice(0, 8).map((step, index) => ({
      id: `step-${index + 1}`,
      label: step.label || `Step ${index + 1}`,
      detail: step.detail,
      why: step.why || processBlock.intro,
      example: step.detail,
      sourceText: step.detail
    }));
  } else if (Array.isArray(formulaBlock?.variables) && formulaBlock.variables.length) {
    kind = "formula";
    nodes = formulaBlock.variables.slice(0, 8).map((variable, index) => ({
      id: `variable-${index + 1}`,
      label: variable.symbol || `Term ${index + 1}`,
      detail: variable.meaning,
      why: variable.role || formulaBlock.intro,
      example: variable.role,
      sourceText: variable.meaning
    }));
  } else if (Array.isArray(comparisonBlock?.rows) && comparisonBlock.rows.length) {
    kind = "comparison";
    nodes = comparisonBlock.rows.slice(0, 6).map((row, index) => ({
      id: `comparison-${index + 1}`,
      label: `${row.left || "Idea A"} / ${row.right || "Idea B"}`,
      detail: row.difference,
      why: comparisonBlock.intro,
      example: `${row.left || "Idea A"} compared with ${row.right || "Idea B"}`,
      sourceText: row.difference
    }));
  }

  const summaryNodes = compactSummaryForDisplay(summary, 6).map((detail, index) => ({
    id: `idea-${index + 1}`,
    label: makeConceptLabel(detail) || `Idea ${index + 1}`,
    detail,
    why: lesson.title || "This is one of the note's central ideas.",
    example: detail,
    sourceText: detail
  }));
  if (nodes.length < 2) {
    const existingLabels = new Set(nodes.map((node) => String(node.label || "").toLowerCase()));
    summaryNodes.forEach((node) => {
      if (nodes.length < 6 && !existingLabels.has(String(node.label).toLowerCase())) nodes.push(node);
    });
  }
  if (!nodes.length && exampleBlock?.example) {
    nodes = [
      { id: "question", label: "Question", detail: exampleBlock.example.question, why: exampleBlock.intro, example: exampleBlock.example.question, sourceText: exampleBlock.example.question },
      { id: "answer", label: "Answer", detail: exampleBlock.example.answer, why: "It completes the worked example.", example: exampleBlock.example.answer, sourceText: exampleBlock.example.answer }
    ];
  }
  if (!edges.length && nodes.length > 1) {
    edges = nodes.slice(1).map((node, index) => ({ from: nodes[index].id, to: node.id, label: kind === "flow" ? "then" : "connects" }));
  }

  const demoChoices = Array.isArray(demoBlock?.demo?.choices) ? demoBlock.demo.choices.slice(0, 5) : [];
  const scenarios = demoChoices.map((choice, index) => ({
    id: `case-${index + 1}`,
    label: choice.label || `Case ${index + 1}`,
    activeIds: nodes.length ? [nodes[index % nodes.length].id] : [],
    connections: [],
    nodeValues: {},
    outcome: choice.result,
    insight: choice.tip
  }));

  const checkChoices = (scenarios.length >= 2
    ? scenarios.map((scenario) => scenario.outcome)
    : nodes.map((node) => node.detail)).filter(Boolean).slice(0, 4);

  return {
    title: lesson.title || "Interactive visual note",
    objective: blocks.find((block) => block?.intro)?.intro || "Explore the main ideas and how they connect.",
    kind,
    nodes,
    edges,
    scenarios,
    check: {
      prompt: scenarios[0] ? `Which outcome matches "${scenarios[0].label}"?` : "Which statement matches the first concept?",
      choices: checkChoices,
      answer: checkChoices[0] || "",
      explanation: scenarios[0]?.insight || nodes[0]?.why || "Use the connected ideas in the visual."
    },
    suggestedQuestions: nodes.slice(0, 2).map((node) => `Why does ${node.label} matter here?`)
  };
}

function connectedVisualNodeIds(nodeId, edges) {
  return edges
    .filter((edge) => edge.from === nodeId || edge.to === nodeId)
    .map((edge) => edge.from === nodeId ? edge.to : edge.from);
}

function visualText(value, fallback = "", maxLength = 280) {
  const text = String(value ?? fallback ?? "").replace(/\s+/g, " ").trim();
  return text.slice(0, maxLength);
}

function visualId(value, index = 0, prefix = "item") {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50) || `${prefix}-${index + 1}`;
}

function isHeavyVisualModel(model, context = {}) {
  const nodes = Array.isArray(model?.nodes) ? model.nodes : [];
  const edges = Array.isArray(model?.edges) ? model.edges : [];
  const conceptCharacters = nodes.reduce((total, node) => total + [
    node?.label,
    node?.detail,
    node?.why,
    node?.example
  ].reduce((count, value) => count + String(value || "").length, 0), 0);
  const summaryCharacters = (Array.isArray(context?.summary) ? context.summary : [])
    .reduce((total, value) => total + String(value || "").length, 0);
  return nodes.length > 5 || edges.length > 7 || conceptCharacters > 1600 || summaryCharacters > 700;
}

function getPriorityVisualNodes(model, limit = 5) {
  const nodes = Array.isArray(model?.nodes) ? model.nodes : [];
  const safeLimit = Math.max(3, Math.min(5, Number(limit) || 5));
  if (["flow", "timeline", "cycle", "comparison", "formula"].includes(model?.kind)) {
    return nodes.slice(0, safeLimit);
  }
  const degree = new Map(nodes.map((node) => [node.id, 0]));
  (Array.isArray(model?.edges) ? model.edges : []).forEach((edge) => {
    if (degree.has(edge.from)) degree.set(edge.from, degree.get(edge.from) + 1);
    if (degree.has(edge.to)) degree.set(edge.to, degree.get(edge.to) + 1);
  });
  return nodes
    .map((node, index) => ({ node, index, degree: degree.get(node.id) || 0 }))
    .sort((first, second) => second.degree - first.degree || first.index - second.index)
    .slice(0, safeLimit)
    .map((entry) => entry.node);
}

function getVisualOverviewCopy(kind) {
  return {
    flow: ["Process at a glance", "Follow the priority steps in order, then select one step for its evidence and explanation."],
    timeline: ["Timeline at a glance", "Read from earliest to latest, then select one event to understand why it matters."],
    cycle: ["Cycle at a glance", "Follow the repeating route, then inspect one stage and its nearest relationships."],
    comparison: ["Comparison at a glance", "Review the main comparison points one at a time before opening the detailed explanation."],
    formula: ["Formula and variables", "Start with the central rule, then choose one variable or term to see its role."],
    system: ["Relationship overview", "Begin with the highest-connected concepts. The key relationships below summarize the larger model."]
  }[kind] || ["Concept overview", "Start with the priority concepts, then inspect one explanation at a time."];
}

function getKeyVisualRelationships(model, priorityNodeIds, limit = 6) {
  const nodes = Array.isArray(model?.nodes) ? model.nodes : [];
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const edges = Array.isArray(model?.edges) ? model.edges : [];
  const priorities = priorityNodeIds instanceof Set ? priorityNodeIds : new Set(priorityNodeIds || []);
  const relevant = edges.filter((edge) => priorities.has(edge.from) || priorities.has(edge.to));
  return (relevant.length ? relevant : edges).slice(0, Math.max(1, Number(limit) || 6)).map((edge) => ({
    ...edge,
    text: `${nodeById.get(edge.from)?.label || edge.from} — ${edge.label} → ${nodeById.get(edge.to)?.label || edge.to}`
  }));
}

function buildMindMapHierarchy(model) {
  const nodes = Array.isArray(model?.nodes) ? model.nodes : [];
  if (!nodes.length) return [];
  const primaryLimit = nodes.length <= 3 ? nodes.length : Math.min(nodes.length, nodes.length <= 5 ? 3 : 4);
  const primaryNodes = getPriorityVisualNodes(model, primaryLimit);
  const primaryIds = new Set(primaryNodes.map((node) => node.id));
  const branches = primaryNodes.map((node, index) => ({
    node,
    index,
    relationship: visualText(node.role, "Main theme", 55),
    children: []
  }));

  nodes.filter((node) => !primaryIds.has(node.id)).forEach((node, index) => {
    const candidates = branches.map((branch) => {
      const edge = (model.edges || []).find((item) => (
        (item.from === branch.node.id && item.to === node.id)
        || (item.to === branch.node.id && item.from === node.id)
      ));
      return { branch, edge };
    });
    const connected = candidates.find((candidate) => candidate.edge);
    const selected = connected || candidates[index % candidates.length];
    selected.branch.children.push({
      node,
      relationship: visualText(selected.edge?.label, "supports", 55),
      edgeId: selected.edge?.id || `${selected.branch.node.id}::${node.id}`
    });
  });
  return branches;
}

function getMindMapConnectionPoints(sourceElement, targetElement, canvasRect) {
  const source = sourceElement.getBoundingClientRect();
  const target = targetElement.getBoundingClientRect();
  const sourceCenter = {
    x: source.left - canvasRect.left + source.width / 2,
    y: source.top - canvasRect.top + source.height / 2
  };
  const targetCenter = {
    x: target.left - canvasRect.left + target.width / 2,
    y: target.top - canvasRect.top + target.height / 2
  };
  const vertical = Math.abs(targetCenter.y - sourceCenter.y) >= Math.abs(targetCenter.x - sourceCenter.x);
  if (vertical) {
    const direction = targetCenter.y >= sourceCenter.y ? 1 : -1;
    return {
      source: { x: sourceCenter.x, y: sourceCenter.y + direction * source.height / 2 },
      target: { x: targetCenter.x, y: targetCenter.y - direction * target.height / 2 },
      vertical
    };
  }
  const direction = targetCenter.x >= sourceCenter.x ? 1 : -1;
  return {
    source: { x: sourceCenter.x + direction * source.width / 2, y: sourceCenter.y },
    target: { x: targetCenter.x - direction * target.width / 2, y: targetCenter.y },
    vertical
  };
}

function renderMindMapConnectorPath(svg, definition, canvasRect, index = 0) {
  if (!definition.source?.isConnected || !definition.target?.isConnected) return;
  const points = getMindMapConnectionPoints(definition.source, definition.target, canvasRect);
  const path = createVisualSvgElement("path");
  path.classList.add("vin-map-path", `is-${definition.level || "secondary"}`);
  if (definition.active) path.classList.add("is-active");
  if (definition.dimmed) path.classList.add("is-dimmed");
  path.dataset.edgeId = definition.edgeId || "";
  if (points.vertical) {
    const middleY = (points.source.y + points.target.y) / 2;
    const bend = definition.level === "cross" ? ((index % 2 ? -1 : 1) * 14) : 0;
    path.setAttribute("d", `M ${points.source.x} ${points.source.y} C ${points.source.x + bend} ${middleY}, ${points.target.x + bend} ${middleY}, ${points.target.x} ${points.target.y}`);
  } else {
    const middleX = (points.source.x + points.target.x) / 2;
    const bend = definition.level === "cross" ? ((index % 2 ? -1 : 1) * 12) : 0;
    path.setAttribute("d", `M ${points.source.x} ${points.source.y} C ${middleX} ${points.source.y + bend}, ${middleX} ${points.target.y + bend}, ${points.target.x} ${points.target.y}`);
  }
  const title = createVisualSvgElement("title", definition.label || "Concept relationship");
  path.append(title);
  svg.append(path);
}

function renderInteractiveVisualModel(model, context = {}) {
  const heavyMode = context.heavyMode === undefined
    ? isHeavyVisualModel(model, context)
    : Boolean(context.heavyMode);
  const lesson = document.createElement("article");
  lesson.className = `vin-lesson vin-mindmap-lesson${heavyMode ? " is-heavy" : ""}`;

  const header = document.createElement("header");
  header.className = "vin-header";
  header.append(
    createElement("span", "Interactive visual note", "vin-kicker"),
    createElement("h3", model.title, "vin-title"),
    createElement("p", model.objective, "vin-objective")
  );

  const progress = document.createElement("div");
  progress.className = "vin-progress";
  const progressText = createElement("span", `0 of ${model.nodes.length} concepts explored`, "vin-progress-text");
  const progressTrack = document.createElement("div");
  progressTrack.className = "vin-progress-track";
  progressTrack.setAttribute("role", "progressbar");
  progressTrack.setAttribute("aria-label", "Concept exploration progress");
  progressTrack.setAttribute("aria-valuemin", "0");
  progressTrack.setAttribute("aria-valuemax", String(model.nodes.length));
  progressTrack.setAttribute("aria-valuenow", "0");
  const progressFill = createElement("span", "", "vin-progress-fill");
  progressFill.style.width = "0%";
  progressTrack.append(progressFill);
  progress.append(progressText, progressTrack);
  header.append(progress);

  const stage = document.createElement("section");
  stage.className = "vin-stage";
  const scene = document.createElement("section");
  scene.className = "vin-scene vin-mindmap-scene";
  scene.dataset.kind = model.kind;
  scene.setAttribute("aria-label", `${model.title}. Connected mind map with primary and secondary branches.`);

  const mapHeader = document.createElement("header");
  mapHeader.className = "vin-map-heading";
  mapHeader.append(
    createElement("span", "Connected mind map", "vin-kicker"),
    createElement("h4", "Big picture and relationships", "vin-overview-title"),
    createElement("p", "Start at the central topic. Follow the solid primary branches, then the thinner secondary branches. Select a concept to focus its real source relationships.", "vin-overview-help")
  );

  const mapToolbar = document.createElement("div");
  mapToolbar.className = "vin-map-toolbar";
  const focusButton = document.createElement("button");
  focusButton.type = "button";
  focusButton.className = "vin-map-focus-button";
  focusButton.textContent = "Focus selected branch";
  focusButton.disabled = true;
  focusButton.setAttribute("aria-pressed", "false");
  const mapStatus = createElement("span", "All branches visible", "vin-map-status");
  mapStatus.setAttribute("role", "status");
  mapStatus.setAttribute("aria-live", "polite");
  mapToolbar.append(focusButton, mapStatus);

  const mapCanvas = document.createElement("div");
  mapCanvas.className = "vin-map-canvas";
  const connectorLayer = createVisualSvgElement("svg");
  connectorLayer.classList.add("vin-map-connectors");
  connectorLayer.setAttribute("role", "img");
  connectorLayer.setAttribute("aria-label", "Visible lines connect the central topic to primary themes and their supporting concepts.");
  connectorLayer.append(
    createVisualSvgElement("title", `${model.title} mind map connections`),
    createVisualSvgElement("desc", "Thick lines are primary branches. Thin lines are secondary branches. Select a concept to highlight its direct relationships.")
  );

  const centralTopic = document.createElement("div");
  centralTopic.className = "vin-map-root";
  centralTopic.dataset.mapRoot = "true";
  centralTopic.append(
    createElement("span", "Central topic", "vin-map-root-label"),
    createElement("strong", model.title, "vin-map-root-title")
  );

  const branchGrid = document.createElement("div");
  branchGrid.className = "vin-map-branches";
  branchGrid.setAttribute("role", "group");
  branchGrid.setAttribute("aria-label", `${model.nodes.length} connected concepts`);
  const hierarchy = buildMindMapHierarchy(model);
  const nodeElements = new Map();
  const structuralConnectors = [];
  const orderedButtons = [];

  const createMindMapNode = (node, relationship, level, branchIndex) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `vin-node vin-map-node is-${level}`;
    button.dataset.nodeId = node.id;
    button.dataset.branchIndex = String(branchIndex);
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-controls", "vin-selected-concept-detail");
    const relation = createElement("span", relationship, "vin-map-node-relation");
    const label = createElement("span", node.label, "vin-node-label");
    const value = createElement("span", "", "vin-node-value hidden");
    button.append(relation, label, value);
    nodeElements.set(node.id, { button, value, relation, baseRelationship: relationship });
    orderedButtons.push(button);
    return button;
  };

  hierarchy.forEach((branch, branchIndex) => {
    const branchElement = document.createElement("section");
    branchElement.className = "vin-map-branch";
    branchElement.dataset.branchIndex = String(branchIndex);
    const primaryButton = createMindMapNode(branch.node, branch.relationship, "primary", branchIndex);
    branchElement.append(primaryButton);
    structuralConnectors.push({
      edgeId: `root::${branch.node.id}`,
      source: centralTopic,
      target: primaryButton,
      label: branch.relationship,
      level: "primary"
    });
    if (branch.children.length) {
      const childGroup = document.createElement("div");
      childGroup.className = "vin-map-secondary-group";
      branch.children.forEach((child) => {
        const childButton = createMindMapNode(child.node, child.relationship, "secondary", branchIndex);
        childGroup.append(childButton);
        structuralConnectors.push({
          edgeId: child.edgeId,
          source: primaryButton,
          target: childButton,
          label: child.relationship,
          level: "secondary"
        });
      });
      branchElement.append(childGroup);
    }
    branchGrid.append(branchElement);
  });

  mapCanvas.append(connectorLayer, centralTopic, branchGrid);
  scene.append(mapHeader, mapToolbar, mapCanvas);

  const detailPanel = document.createElement("section");
  detailPanel.className = "vin-detail";
  detailPanel.id = "vin-selected-concept-detail";
  detailPanel.setAttribute("aria-live", "polite");
  detailPanel.setAttribute("aria-atomic", "true");
  detailPanel.setAttribute("aria-label", "Selected concept explanation and source evidence");

  const scenarioSection = document.createElement("section");
  scenarioSection.className = "vin-scenarios";
  scenarioSection.append(createElement("strong", "Try a scenario", "vin-section-label"));
  const scenarioControls = document.createElement("div");
  scenarioControls.className = "vin-scenario-controls";
  scenarioControls.setAttribute("role", "group");
  scenarioControls.setAttribute("aria-label", "Visual scenarios");
  const scenarioButtons = new Map();
  model.scenarios.forEach((scenario) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "vin-scenario-button";
    button.textContent = scenario.label;
    button.setAttribute("aria-pressed", "false");
    scenarioControls.append(button);
    scenarioButtons.set(scenario.id, button);
  });
  const scenarioOutcome = document.createElement("div");
  scenarioOutcome.className = "vin-scenario-outcome";
  scenarioOutcome.setAttribute("aria-live", "polite");
  scenarioOutcome.setAttribute("aria-atomic", "true");
  scenarioSection.append(scenarioControls, scenarioOutcome);

  let selectedNodeId = "";
  let activeScenarioId = "";
  let branchFocusActive = false;
  let connectorFrame = 0;
  let resizeObserver = null;
  let usesWindowResizeFallback = false;
  const exploredIds = new Set();
  const getActiveScenario = () => model.scenarios.find((scenario) => scenario.id === activeScenarioId) || null;

  const drawConnectors = () => {
    connectorFrame = 0;
    if (!mapCanvas.isConnected) return;
    const width = Math.max(1, mapCanvas.clientWidth);
    const height = Math.max(1, mapCanvas.clientHeight);
    const canvasRect = mapCanvas.getBoundingClientRect();
    connectorLayer.setAttribute("viewBox", `0 0 ${width} ${height}`);
    connectorLayer.setAttribute("width", String(width));
    connectorLayer.setAttribute("height", String(height));
    connectorLayer.querySelectorAll(".vin-map-path").forEach((path) => path.remove());
    structuralConnectors.forEach((definition, index) => {
      const sourceId = definition.source?.dataset?.nodeId || "";
      const targetId = definition.target?.dataset?.nodeId || "";
      const connected = !selectedNodeId || sourceId === selectedNodeId || targetId === selectedNodeId;
      renderMindMapConnectorPath(connectorLayer, {
        ...definition,
        active: connected && Boolean(selectedNodeId),
        dimmed: branchFocusActive && !connected
      }, canvasRect, index);
    });
    if (selectedNodeId) {
      model.edges.filter((edge) => edge.from === selectedNodeId || edge.to === selectedNodeId).forEach((edge, index) => {
        const source = nodeElements.get(edge.from)?.button;
        const target = nodeElements.get(edge.to)?.button;
        if (!source || !target || structuralConnectors.some((item) => item.edgeId === edge.id)) return;
        renderMindMapConnectorPath(connectorLayer, {
          edgeId: edge.id,
          source,
          target,
          label: edge.label,
          level: "cross",
          active: true
        }, canvasRect, index);
      });
    }
  };
  const scheduleConnectorDraw = () => {
    if (connectorFrame) cancelAnimationFrame(connectorFrame);
    connectorFrame = requestAnimationFrame(drawConnectors);
  };

  const updateProgress = () => {
    const exploredCount = exploredIds.size;
    const total = model.nodes.length;
    progressText.textContent = `${exploredCount} of ${total} concepts explored`;
    progressTrack.setAttribute("aria-valuenow", String(exploredCount));
    progressFill.style.width = `${total ? (exploredCount / total) * 100 : 0}%`;
  };

  const updateScene = () => {
    const scenario = getActiveScenario();
    const connectedIds = new Set(selectedNodeId ? connectedVisualNodeIds(selectedNodeId, model.edges) : []);
    const activeIds = new Set(scenario?.activeIds || []);
    model.nodes.forEach((node) => {
      const entry = nodeElements.get(node.id);
      if (!entry) return;
      const selected = node.id === selectedNodeId;
      const connected = connectedIds.has(node.id);
      const scenarioActive = activeIds.has(node.id);
      const dimmed = Boolean(selectedNodeId) && !selected && !connected && !scenarioActive;
      entry.button.classList.toggle("is-selected", selected);
      entry.button.classList.toggle("is-connected", connected);
      entry.button.classList.toggle("is-scenario-active", scenarioActive);
      entry.button.classList.toggle("is-dimmed", dimmed);
      entry.button.classList.toggle("is-focus-muted", branchFocusActive && dimmed);
      entry.button.setAttribute("aria-pressed", String(selected));
      const currentValue = scenario?.nodeValues?.[node.id] || "";
      entry.value.textContent = currentValue;
      entry.value.classList.toggle("hidden", !currentValue);
      const selectedEdge = selectedNodeId
        ? model.edges.find((edge) => (
          (edge.from === selectedNodeId && edge.to === node.id)
          || (edge.to === selectedNodeId && edge.from === node.id)
        ))
        : null;
      entry.relation.textContent = connected && selectedEdge ? selectedEdge.label : entry.baseRelationship;
      entry.button.setAttribute("aria-label", [
        node.label,
        entry.relation.textContent,
        selected ? "selected" : "",
        connected ? "directly connected to the selected concept" : "",
        scenarioActive ? `active in ${scenario.label}` : ""
      ].filter(Boolean).join(". "));
    });
    scenarioButtons.forEach((button, id) => button.setAttribute("aria-pressed", String(id === activeScenarioId)));
    const selectedNode = model.nodes.find((node) => node.id === selectedNodeId) || null;
    renderVisualNodeDetail(detailPanel, selectedNode, scenario, context, model);
    renderVisualScenarioOutcome(scenarioOutcome, scenario);
    focusButton.disabled = !selectedNodeId;
    focusButton.setAttribute("aria-pressed", String(branchFocusActive));
    focusButton.textContent = branchFocusActive ? "Show full map" : "Focus selected branch";
    mapStatus.textContent = branchFocusActive && selectedNode
      ? `${selectedNode.label} and its ${connectedIds.size} direct ${connectedIds.size === 1 ? "relationship" : "relationships"} are emphasized`
      : selectedNode
        ? `${selectedNode.label} selected; connected branches highlighted`
        : "All branches visible";
    updateProgress();
    scheduleConnectorDraw();
  };

  nodeElements.forEach(({ button }, nodeId) => {
    button.addEventListener("click", () => {
      selectedNodeId = nodeId;
      exploredIds.add(nodeId);
      updateScene();
    });
    button.addEventListener("keydown", (event) => {
      if (!["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"].includes(event.key)) return;
      const currentIndex = orderedButtons.indexOf(button);
      if (currentIndex < 0 || !orderedButtons.length) return;
      event.preventDefault();
      let nextIndex = currentIndex;
      if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = orderedButtons.length - 1;
      else if (["ArrowDown", "ArrowRight"].includes(event.key)) nextIndex = (currentIndex + 1) % orderedButtons.length;
      else nextIndex = (currentIndex - 1 + orderedButtons.length) % orderedButtons.length;
      orderedButtons[nextIndex].focus();
    });
  });
  focusButton.addEventListener("click", () => {
    if (!selectedNodeId) return;
    branchFocusActive = !branchFocusActive;
    updateScene();
  });
  scenarioButtons.forEach((button, scenarioId) => {
    button.addEventListener("click", () => {
      activeScenarioId = scenarioId;
      updateScene();
    });
  });

  const scenarioDisclosure = document.createElement("details");
  scenarioDisclosure.className = "vin-disclosure";
  scenarioDisclosure.append(createElement("summary", "Optional: Try a scenario"), scenarioSection);
  stage.append(scene, detailPanel, scenarioDisclosure);
  lesson.append(header, stage);
  if (context.showAssessment === true) lesson.append(renderVisualQuickCheck(model.check));
  const followupDisclosure = document.createElement("details");
  followupDisclosure.className = "vin-disclosure";
  followupDisclosure.append(
    createElement("summary", "Optional: Ask this note"),
    renderVisualFollowup(model, context, () => model.nodes.find((node) => node.id === selectedNodeId), getActiveScenario)
  );
  lesson.append(followupDisclosure);

  if (typeof ResizeObserver === "function") {
    resizeObserver = new ResizeObserver(scheduleConnectorDraw);
    resizeObserver.observe(mapCanvas);
    resizeObserver.observe(branchGrid);
  } else {
    usesWindowResizeFallback = true;
    window.addEventListener("resize", scheduleConnectorDraw, { passive: true });
  }
  lesson.cleanupVisualModel = () => {
    if (connectorFrame) cancelAnimationFrame(connectorFrame);
    connectorFrame = 0;
    resizeObserver?.disconnect();
    if (usesWindowResizeFallback) window.removeEventListener("resize", scheduleConnectorDraw);
  };
  updateScene();
  return lesson;
}

function renderLegacyInteractiveVisualModel(model, context = {}) {
  const heavyMode = context.heavyMode === undefined
    ? isHeavyVisualModel(model, context)
    : Boolean(context.heavyMode);
  const lesson = document.createElement("article");
  lesson.className = `vin-lesson${heavyMode ? " is-heavy" : ""}`;

  const header = document.createElement("header");
  header.className = "vin-header";
  header.append(
    createElement("span", heavyMode ? "Visual study note" : "Explore the model", "vin-kicker"),
    createElement("h3", model.title, "vin-title"),
    createElement("p", model.objective, "vin-objective")
  );

  const progress = document.createElement("div");
  progress.className = "vin-progress";
  const progressText = createElement("span", `0 of ${model.nodes.length} concepts explored`, "vin-progress-text");
  const progressTrack = document.createElement("div");
  progressTrack.className = "vin-progress-track";
  progressTrack.setAttribute("role", "progressbar");
  progressTrack.setAttribute("aria-label", "Concept exploration progress");
  progressTrack.setAttribute("aria-valuemin", "0");
  progressTrack.setAttribute("aria-valuemax", String(model.nodes.length));
  progressTrack.setAttribute("aria-valuenow", "0");
  const progressFill = document.createElement("span");
  progressFill.className = "vin-progress-fill";
  progressFill.style.width = "0%";
  progressTrack.append(progressFill);
  progress.append(progressText, progressTrack);
  header.append(progress);

  const stage = document.createElement("section");
  stage.className = "vin-stage";
  const scene = document.createElement("div");
  scene.className = "vin-scene";
  scene.dataset.kind = model.kind;
  scene.classList.toggle("is-heavy", heavyMode);
  scene.setAttribute("role", "group");
  scene.setAttribute("aria-label", heavyMode
    ? `${model.title}. Priority concept overview. Select one concept for its explanation.`
    : `${model.title}. Select a concept to explore its connections.`);

  const priorityNodes = heavyMode ? getPriorityVisualNodes(model, 5) : model.nodes;
  const priorityNodeIds = new Set(priorityNodes.map((node) => node.id));
  const orderedNodes = heavyMode
    ? [...priorityNodes, ...model.nodes.filter((node) => !priorityNodeIds.has(node.id))]
    : model.nodes;

  if (heavyMode) {
    const [overviewTitle, overviewHelp] = getVisualOverviewCopy(model.kind);
    const overviewHeading = document.createElement("header");
    overviewHeading.className = "vin-overview-heading";
    overviewHeading.append(
      createElement("span", "Visual overview", "vin-kicker"),
      createElement("h4", overviewTitle, "vin-overview-title"),
      createElement("p", overviewHelp, "vin-overview-help")
    );
    scene.append(overviewHeading);
  }

  const positions = getVisualNodeLayout(model.nodes.length, model.kind);
  const positionById = new Map(model.nodes.map((node, index) => [node.id, positions[index]]));
  const edgeElements = new Map();
  let connectorLayer = null;
  if (!heavyMode) {
    connectorLayer = createVisualSvgElement("svg");
    connectorLayer.classList.add("vin-connector-layer");
    connectorLayer.setAttribute("viewBox", "0 0 100 100");
    connectorLayer.setAttribute("preserveAspectRatio", "none");
    connectorLayer.setAttribute("role", "img");
    connectorLayer.setAttribute("aria-label", `Connections between ${model.nodes.length} concepts.`);
    connectorLayer.append(
      createVisualSvgElement("title", `${model.title} concept connections`),
      createVisualSvgElement("desc", "Lines show how the labeled concepts relate. Select a concept for details.")
    );
    model.edges.forEach((edge) => {
      const from = positionById.get(edge.from);
      const to = positionById.get(edge.to);
      if (!from || !to) return;
      const group = createVisualSvgElement("g");
      group.classList.add("vin-edge-group");
      group.dataset.edgeId = edge.id;
      const line = createVisualSvgElement("line");
      line.classList.add("vin-edge");
      line.setAttribute("x1", String(from.x));
      line.setAttribute("y1", String(from.y));
      line.setAttribute("x2", String(to.x));
      line.setAttribute("y2", String(to.y));
      const target = createVisualSvgElement("circle");
      target.classList.add("vin-edge-target");
      target.setAttribute("cx", String(to.x));
      target.setAttribute("cy", String(to.y));
      target.setAttribute("r", "1.2");
      const label = createVisualSvgElement("text", edge.label);
      label.classList.add("vin-edge-label");
      label.setAttribute("x", String((from.x + to.x) / 2));
      label.setAttribute("y", String((from.y + to.y) / 2 - 2));
      label.setAttribute("text-anchor", "middle");
      group.append(line, target, label);
      connectorLayer.append(group);
      edgeElements.set(edge.id, group);
    });
  }

  const nodeLayer = document.createElement("div");
  nodeLayer.className = `vin-node-layer${heavyMode ? " vin-concept-index" : ""}`;
  if (heavyMode) {
    nodeLayer.id = "vin-priority-concept-index";
    nodeLayer.setAttribute("role", "group");
    nodeLayer.setAttribute("aria-label", `${model.nodes.length} concepts. ${priorityNodes.length} priority concepts shown first.`);
  }
  if (model.kind === "formula") {
    scene.append(createElement("div", model.objective, "vin-formula-rule"));
  }
  const nodeElements = new Map();
  orderedNodes.forEach((node, orderedIndex) => {
    const modelIndex = model.nodes.findIndex((item) => item.id === node.id);
    const position = positions[Math.max(0, modelIndex)];
    const button = document.createElement("button");
    button.type = "button";
    button.className = `vin-node${heavyMode ? " vin-concept-card" : ""}`;
    button.dataset.nodeId = node.id;
    if (!heavyMode) {
      button.style.left = `${position.x}%`;
      button.style.top = `${position.y}%`;
    } else {
      button.setAttribute("aria-controls", "vin-selected-concept-detail");
      if (orderedIndex >= priorityNodes.length) {
        button.hidden = true;
        button.dataset.additionalConcept = "true";
      }
      const markerText = ["flow", "timeline", "cycle"].includes(model.kind)
        ? String(Math.max(0, modelIndex) + 1)
        : node.symbol || String(orderedIndex + 1);
      const marker = createElement("span", markerText, "vin-concept-marker");
      marker.setAttribute("aria-hidden", "true");
      button.append(marker);
    }
    button.setAttribute("aria-pressed", "false");
    if (!heavyMode && node.symbol) {
      const symbol = createElement("span", node.symbol, "vin-node-symbol");
      symbol.setAttribute("aria-hidden", "true");
      button.append(symbol);
    }
    const label = createElement("span", node.label, "vin-node-label");
    const value = createElement("span", "", "vin-node-value hidden");
    button.append(label);
    if (heavyMode) {
      const connectionCount = model.edges.filter((edge) => edge.from === node.id || edge.to === node.id).length;
      const kindLabel = ["flow", "timeline", "cycle"].includes(model.kind)
        ? `Step ${Math.max(0, modelIndex) + 1}`
        : model.kind === "comparison"
          ? "Comparison point"
          : model.kind === "formula"
            ? "Variable or term"
            : `${connectionCount} ${connectionCount === 1 ? "relationship" : "relationships"}`;
      button.append(createElement("span", kindLabel, "vin-concept-meta"));
    }
    button.append(value);
    nodeLayer.append(button);
    nodeElements.set(node.id, { button, value });
  });

  const relationshipElements = new Map();
  let relationshipSummary = null;
  if (heavyMode && ["system", "cycle"].includes(model.kind) && model.edges.length) {
    const keyRelationships = getKeyVisualRelationships(model, priorityNodeIds, 6);
    relationshipSummary = document.createElement("section");
    relationshipSummary.className = "vin-relationship-summary";
    relationshipSummary.append(
      createElement("h5", "Key relationships", "vin-relationship-title"),
      createElement("p", `Showing ${keyRelationships.length} of ${model.edges.length} relationships. Select a concept to filter its detail.`, "vin-relationship-help")
    );
    const list = document.createElement("ul");
    list.className = "vin-key-relationships";
    keyRelationships.forEach((edge) => {
      const item = createElement("li", edge.text);
      list.append(item);
      relationshipElements.set(edge.id, item);
    });
    relationshipSummary.append(list);
  }

  const relationshipList = document.createElement("ul");
  relationshipList.className = "vin-mobile-relationships";
  relationshipList.setAttribute("aria-label", "Concept relationships");
  if (!heavyMode) {
    relationshipList.append(...model.edges.map((edge) => {
      const from = model.nodes.find((node) => node.id === edge.from)?.label || edge.from;
      const to = model.nodes.find((node) => node.id === edge.to)?.label || edge.to;
      return createElement("li", `${from} — ${edge.label} → ${to}`);
    }));
  }

  let showMoreButton = null;
  const additionalConceptCount = Math.max(0, model.nodes.length - priorityNodes.length);
  if (heavyMode && additionalConceptCount) {
    showMoreButton = document.createElement("button");
    showMoreButton.type = "button";
    showMoreButton.className = "vin-show-more";
    showMoreButton.textContent = `Show ${additionalConceptCount} more ${additionalConceptCount === 1 ? "concept" : "concepts"}`;
    showMoreButton.setAttribute("aria-controls", nodeLayer.id);
    showMoreButton.setAttribute("aria-expanded", "false");
  }
  const conceptStatus = createElement("span", "", "vin-concept-status");
  conceptStatus.setAttribute("role", "status");
  conceptStatus.setAttribute("aria-live", "polite");

  if (connectorLayer) scene.append(connectorLayer);
  scene.append(nodeLayer);
  if (showMoreButton) scene.append(showMoreButton);
  if (heavyMode) scene.append(conceptStatus);
  if (relationshipSummary) scene.append(relationshipSummary);
  if (!heavyMode) scene.append(relationshipList);

  const detailPanel = document.createElement("section");
  detailPanel.className = "vin-detail";
  detailPanel.id = "vin-selected-concept-detail";
  detailPanel.setAttribute("aria-live", "polite");
  detailPanel.setAttribute("aria-atomic", "true");
  detailPanel.setAttribute("aria-label", "Selected concept explanation and source evidence");

  const scenarioSection = document.createElement("section");
  scenarioSection.className = "vin-scenarios";
  scenarioSection.append(createElement("strong", "Try a scenario", "vin-section-label"));
  const scenarioControls = document.createElement("div");
  scenarioControls.className = "vin-scenario-controls";
  scenarioControls.setAttribute("role", "group");
  scenarioControls.setAttribute("aria-label", "Visual scenarios");
  const scenarioButtons = new Map();
  model.scenarios.forEach((scenario) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "vin-scenario-button";
    button.textContent = scenario.label;
    button.setAttribute("aria-pressed", "false");
    scenarioControls.append(button);
    scenarioButtons.set(scenario.id, button);
  });
  const scenarioOutcome = document.createElement("div");
  scenarioOutcome.className = "vin-scenario-outcome";
  scenarioOutcome.setAttribute("aria-live", "polite");
  scenarioOutcome.setAttribute("aria-atomic", "true");
  scenarioSection.append(scenarioControls, scenarioOutcome);

  let selectedNodeId = "";
  let activeScenarioId = "";
  const exploredIds = new Set();

  const getActiveScenario = () => model.scenarios.find((scenario) => scenario.id === activeScenarioId) || null;
  const updateProgress = () => {
    const exploredCount = exploredIds.size;
    const total = model.nodes.length;
    progressText.textContent = `${exploredCount} of ${total} concepts explored`;
    progressTrack.setAttribute("aria-valuenow", String(exploredCount));
    progressFill.style.width = `${total ? (exploredCount / total) * 100 : 0}%`;
  };

  const updateScene = () => {
    const scenario = getActiveScenario();
    const connectedIds = new Set([selectedNodeId, ...connectedVisualNodeIds(selectedNodeId, model.edges)]);
    const activeIds = new Set(scenario?.activeIds || []);
    const selectedEdgeCount = model.edges.filter((edge) => edge.from === selectedNodeId || edge.to === selectedNodeId).length;

    model.nodes.forEach((node) => {
      const entry = nodeElements.get(node.id);
      if (!entry) return;
      const selected = node.id === selectedNodeId;
      const connected = !selected && connectedIds.has(node.id);
      const scenarioActive = activeIds.has(node.id);
      const dimmed = Boolean(selectedNodeId) && !selected && !connected && !scenarioActive;
      entry.button.classList.toggle("is-selected", selected);
      entry.button.classList.toggle("is-connected", connected);
      entry.button.classList.toggle("is-scenario-active", scenarioActive);
      entry.button.classList.toggle("is-dimmed", dimmed);
      entry.button.setAttribute("aria-pressed", String(selected));
      const currentValue = scenario?.nodeValues?.[node.id] || "";
      entry.value.textContent = currentValue;
      entry.value.classList.toggle("hidden", !currentValue);
      entry.button.setAttribute("aria-label", [
        node.label,
        selected ? "selected" : "",
        connected ? "connected to the selected concept" : "",
        scenarioActive ? `active in ${scenario.label}` : "",
        currentValue ? `current value ${currentValue}` : ""
      ].filter(Boolean).join(". "));
    });

    model.edges.forEach((edge) => {
      const group = edgeElements.get(edge.id);
      const connected = edge.from === selectedNodeId || edge.to === selectedNodeId;
      const scenarioActive = visualScenarioHasEdge(scenario, edge);
      if (group) {
        group.classList.toggle("is-connected", connected);
        group.classList.toggle("is-scenario-active", scenarioActive);
        group.classList.toggle("is-dimmed", Boolean(selectedNodeId) && !connected && !scenarioActive);
        group.classList.toggle("show-label", connected && selectedEdgeCount <= 2);
      }
      const relationship = relationshipElements.get(edge.id);
      if (relationship) relationship.classList.toggle("is-related", connected || scenarioActive);
    });

    scenarioButtons.forEach((button, id) => button.setAttribute("aria-pressed", String(id === activeScenarioId)));
    const selectedNode = model.nodes.find((node) => node.id === selectedNodeId) || null;
    renderVisualNodeDetail(detailPanel, selectedNode, scenario, context, model);
    renderVisualScenarioOutcome(scenarioOutcome, scenario);
    updateProgress();
  };

  nodeElements.forEach(({ button }, nodeId) => {
    button.addEventListener("click", () => {
      selectedNodeId = nodeId;
      exploredIds.add(nodeId);
      updateScene();
    });
    button.addEventListener("keydown", (event) => {
      if (!["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"].includes(event.key)) return;
      const visibleButtons = [...nodeElements.values()].map((entry) => entry.button).filter((item) => !item.hidden);
      const currentIndex = visibleButtons.indexOf(button);
      if (currentIndex < 0 || !visibleButtons.length) return;
      event.preventDefault();
      let nextIndex = currentIndex;
      if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = visibleButtons.length - 1;
      else if (["ArrowDown", "ArrowRight"].includes(event.key)) nextIndex = (currentIndex + 1) % visibleButtons.length;
      else nextIndex = (currentIndex - 1 + visibleButtons.length) % visibleButtons.length;
      visibleButtons[nextIndex].focus();
    });
  });
  showMoreButton?.addEventListener("click", () => {
    if (showMoreButton.dataset.complete === "true") return;
    nodeElements.forEach(({ button }) => {
      if (button.dataset.additionalConcept === "true") button.hidden = false;
    });
    showMoreButton.dataset.complete = "true";
    showMoreButton.setAttribute("aria-expanded", "true");
    showMoreButton.setAttribute("aria-disabled", "true");
    showMoreButton.textContent = `All ${model.nodes.length} concepts shown`;
    conceptStatus.textContent = `${additionalConceptCount} additional ${additionalConceptCount === 1 ? "concept is" : "concepts are"} now shown in the list.`;
  });
  scenarioButtons.forEach((button, scenarioId) => {
    button.addEventListener("click", () => {
      activeScenarioId = scenarioId;
      updateScene();
    });
  });

  const scenarioDisclosure = document.createElement("details");
  scenarioDisclosure.className = "vin-disclosure";
  scenarioDisclosure.append(createElement("summary", heavyMode ? "Optional: Try a scenario" : "Try a scenario"), scenarioSection);
  stage.append(scene, detailPanel, scenarioDisclosure);
  lesson.append(header, stage);
  if (context.showAssessment === true) lesson.append(renderVisualQuickCheck(model.check));
  const followupDisclosure = document.createElement("details");
  followupDisclosure.className = "vin-disclosure";
  followupDisclosure.append(
    createElement("summary", heavyMode ? "Optional: Ask this note" : "Ask this note"),
    renderVisualFollowup(model, context, () => model.nodes.find((node) => node.id === selectedNodeId), getActiveScenario)
  );
  lesson.append(followupDisclosure);
  updateScene();
  return lesson;
}

function renderVisualNodeDetail(panel, node, scenario, context, model) {
  if (!node) {
    panel.replaceChildren(
      createElement("span", "Selected concept", "vin-kicker"),
      createElement("h4", "Choose one concept", "vin-detail-title"),
      createElement("p", "Its explanation, relationships, and source evidence will appear here without changing the overview.", "vin-detail-empty")
    );
    return;
  }
  const header = document.createElement("div");
  header.className = "vin-detail-header";
  header.append(
    createElement("span", `Selected concept · ${node.role || "Concept"}`, "vin-detail-role"),
    createElement("h4", node.label, "vin-detail-title")
  );
  const currentValue = scenario?.nodeValues?.[node.id];
  if (currentValue) header.append(createElement("span", currentValue, "vin-detail-value"));
  const isPdfDocument = context.documentType === "pdf" || context.sourceBinding?.documentType === "pdf";

  const content = document.createElement("div");
  content.className = "vin-detail-content";
  content.append(
    renderVisualDetailField("What it means", node.detail),
    renderVisualDetailField("Why it matters", node.why),
    renderVisualDetailField("Example", node.example)
  );
  const relationships = (model?.edges || [])
    .filter((edge) => edge.from === node.id || edge.to === node.id)
    .map((edge) => {
      const otherId = edge.from === node.id ? edge.to : edge.from;
      const other = model.nodes.find((candidate) => candidate.id === otherId);
      return edge.from === node.id
        ? `${edge.label} → ${other?.label || otherId}`
        : `${other?.label || otherId} → ${edge.label}`;
    });
  if (relationships.length) {
    const relationshipField = document.createElement("section");
    relationshipField.className = "vin-detail-field vin-detail-relationships";
    relationshipField.append(createElement("strong", "Related concepts", "vin-detail-label"));
    const list = document.createElement("ul");
    list.append(...relationships.slice(0, 5).map((relationship) => createElement("li", relationship)));
    relationshipField.append(list);
    content.append(relationshipField);
  }
  if (node.sourceText) {
    const source = document.createElement("blockquote");
    source.className = "vin-source-excerpt";
    source.append(
      createElement("strong", "Source evidence", "vin-detail-label"),
      createElement("p", node.sourceText),
      createElement(
        "small",
        isPdfDocument
          ? "This passage was extracted locally from the selected PDF; use the PDF link below to verify it."
          : context.sourceType === "webpage"
            ? "This is the source passage used for this concept."
          : context.sourceType === "video"
            ? (context.timestampConfidence || context.sourceBinding?.timestampConfidence) === "AI-estimated"
              ? "This excerpt came from automatic transcription; its linked time is AI-estimated."
              : (context.timestampConfidence || context.sourceBinding?.timestampConfidence) === "user-provided"
                ? "This excerpt uses a timestamp supplied in the pasted transcript; verify it against the video."
                : "This excerpt is grounded in the publisher caption segment at the linked video time."
            : context.sourceType === "collection"
              ? `This excerpt is grounded in ${node.sourceRef?.title || "one saved chapter source"}.`
          : "This passage was matched from the note you pasted.",
        "vin-source-help"
      )
    );
    content.append(source);
  }

  const actions = document.createElement("div");
  actions.className = "vin-source-actions";
  const sourceStatus = document.createElement("span");
  sourceStatus.className = "vin-source-status";
  sourceStatus.setAttribute("aria-live", "polite");
  const detailSourceUrl = node.sourceRef?.url || context.sourceUrl || "";
  const pinnedBinding = context.sourceBinding || {};
  const pinnedSourceTabId = Number.isInteger(context.sourceTabId) ? context.sourceTabId : pinnedBinding.tabId;
  const pinnedMediaId = context.videoMediaId || pinnedBinding.mediaId || "";
  if (!isPdfDocument && ["webpage", "collection"].includes(context.sourceType) && node.sourceText && detailSourceUrl) {
    const findButton = document.createElement("button");
    findButton.type = "button";
    findButton.className = "text-button vin-source-button";
    findButton.textContent = "Show in original page";
    findButton.title = "Open the saved source if needed, then scroll to and highlight this exact passage.";
    findButton.addEventListener("click", async () => {
      findButton.disabled = true;
      sourceStatus.textContent = "Looking for this passage in the original page...";
      const result = await highlightSourceText(node.sourceText, {
        announce: false,
        expectedSourceUrl: detailSourceUrl,
        sourceTabId: context.sourceType === "webpage" ? pinnedSourceTabId : null
      });
      sourceStatus.textContent = result.message;
      findButton.disabled = false;
    });
    actions.append(findButton);
  }
  if (context.sourceType === "video" && Number.isFinite(node.sourceTimestamp)) {
    const jumpButton = document.createElement("button");
    jumpButton.type = "button";
    jumpButton.className = "secondary timestamp-button";
    jumpButton.textContent = `Jump to ${formatTimestamp(node.sourceTimestamp)}`;
    jumpButton.addEventListener("click", async () => {
      jumpButton.disabled = true;
      const result = await jumpToVideoTimestamp(node.sourceTimestamp, {
        expectedSourceUrl: context.sourceUrl,
        sourceTabId: pinnedSourceTabId,
        videoMediaId: pinnedMediaId
      });
      sourceStatus.textContent = result.message;
      jumpButton.disabled = false;
    });
    actions.append(jumpButton);
  }
  const safeDetailSourceUrl = normalizeSafeExternalUrl(detailSourceUrl);
  if (safeDetailSourceUrl) {
    const sourceLink = document.createElement("a");
    sourceLink.className = "vin-source-link";
    sourceLink.href = safeDetailSourceUrl;
    sourceLink.target = "_blank";
    sourceLink.rel = "noopener noreferrer";
    sourceLink.textContent = context.sourceType === "video"
      ? "Open original video"
      : context.sourceType === "collection"
        ? "Open cited source"
        : isPdfDocument ? "Open original PDF" : "Open original page";
    sourceLink.addEventListener("click", async (event) => {
      event.preventDefault();
      await persistCurrentSessionDraft();
      await openSafeExternalUrl(safeDetailSourceUrl);
    });
    actions.append(sourceLink);
  }
  actions.append(sourceStatus);
  panel.replaceChildren(header, content, actions);
}

function renderVisualDetailField(label, value) {
  const field = document.createElement("div");
  field.className = "vin-detail-field";
  field.append(createElement("strong", label, "vin-detail-label"), createElement("p", value || "Review the selected relationship in the visual."));
  return field;
}

function renderVisualScenarioOutcome(panel, scenario) {
  if (!scenario) {
    panel.replaceChildren(createElement("p", "Select a concept to explore the visual.", "vin-scenario-empty"));
    return;
  }
  panel.replaceChildren(
    createElement("strong", scenario.label, "vin-scenario-title"),
    ...(scenario.prompt ? [createElement("p", scenario.prompt, "vin-scenario-prompt")] : []),
    createElement("p", scenario.outcome, "vin-scenario-result"),
    createElement("p", `Insight: ${scenario.insight}`, "vin-scenario-insight")
  );
}

function renderVisualQuickCheck(check) {
  const section = document.createElement("section");
  section.className = "vin-check";
  section.append(
    createElement("span", "Quick check", "vin-kicker"),
    createElement("h4", check.prompt, "vin-check-prompt")
  );
  const choices = document.createElement("div");
  choices.className = "vin-check-choices";
  choices.setAttribute("role", "group");
  choices.setAttribute("aria-label", check.prompt);
  const feedback = document.createElement("div");
  feedback.className = "vin-check-feedback";
  feedback.setAttribute("aria-live", "polite");
  feedback.setAttribute("aria-atomic", "true");
  const buttons = [];

  check.choices.forEach((choice) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "vin-check-choice";
    button.textContent = choice;
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => {
      const correct = choice === check.answer;
      buttons.forEach((item) => {
        item.classList.remove("is-selected", "is-correct", "is-incorrect", "is-answer");
        item.setAttribute("aria-pressed", "false");
        item.setAttribute("aria-label", item.textContent);
      });
      button.classList.add("is-selected", correct ? "is-correct" : "is-incorrect");
      button.setAttribute("aria-pressed", "true");
      if (!correct) {
        const answerButton = buttons.find((item) => item.textContent === check.answer);
        answerButton?.classList.add("is-answer");
        answerButton?.setAttribute("aria-label", `${check.answer}. Correct answer.`);
      }
      feedback.classList.toggle("is-correct", correct);
      feedback.classList.toggle("is-incorrect", !correct);
      feedback.replaceChildren(
        createElement("strong", correct ? "Correct" : "Not quite"),
        createElement("p", correct ? check.explanation : `The correct answer is “${check.answer}”. ${check.explanation}`)
      );
      section.dataset.completed = String(correct);
    });
    buttons.push(button);
    choices.append(button);
  });
  section.append(choices, feedback);
  return section;
}

function renderVisualFollowup(model, context, getSelectedNode, getActiveScenario) {
  const section = document.createElement("section");
  section.className = "vin-followup";
  section.append(
    createElement("span", "Ask the note", "vin-kicker"),
    createElement("p", "Ask about the selected concept or try a suggested question.", "vin-followup-intro")
  );
  const chips = document.createElement("div");
  chips.className = "vin-question-chips";
  const responsePanel = document.createElement("div");
  responsePanel.className = "vin-followup-response";
  responsePanel.setAttribute("aria-live", "polite");
  responsePanel.setAttribute("aria-atomic", "true");
  responsePanel.hidden = true;
  let pending = false;

  const ask = async (question, trigger) => {
    const trimmedQuestion = visualText(question, "", 500);
    if (!trimmedQuestion || pending) return false;
    pending = true;
    [...section.querySelectorAll("button")].forEach((button) => { button.disabled = true; });
    try {
      await requestVisualFollowup({
        question: trimmedQuestion,
        model,
        context,
        selectedNode: getSelectedNode(),
        scenario: getActiveScenario(),
        responsePanel,
        trigger
      });
      return true;
    } finally {
      pending = false;
      [...section.querySelectorAll("button")].forEach((button) => { button.disabled = false; });
    }
  };

  model.suggestedQuestions.forEach((question) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "vin-question-chip";
    button.textContent = question;
    button.addEventListener("click", () => void ask(question, button));
    chips.append(button);
  });

  const form = document.createElement("form");
  form.className = "vin-followup-form";
  const label = document.createElement("label");
  label.className = "vin-followup-label";
  label.append(createElement("span", "Your question", "vin-followup-label-text"));
  const input = document.createElement("input");
  input.type = "text";
  input.className = "vin-followup-input";
  input.placeholder = "What should I understand next?";
  input.autocomplete = "off";
  label.append(input);
  const submit = document.createElement("button");
  submit.type = "submit";
  submit.className = "secondary vin-followup-submit";
  submit.textContent = "Ask";
  form.append(label, submit);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question) {
      input.focus();
      return;
    }
    void ask(question, submit).then((completed) => {
      if (completed && input.value.trim() === question) input.value = "";
    });
  });
  section.append(chips, form, responsePanel);
  return section;
}

async function requestVisualFollowup({ question, model, context, selectedNode, scenario, responsePanel, trigger }) {
  trigger.disabled = true;
  responsePanel.hidden = false;
  responsePanel.classList.remove("is-local-fallback", "is-generated");
  responsePanel.replaceChildren(
    createElement("strong", "Thinking with this note...", "vin-followup-source"),
    createElement("p", question, "vin-followup-question")
  );

  try {
    const settings = await getStorage(STORAGE_KEYS.settings, {});
    const configuredEndpoint = getConfiguredApiEndpoint(settings);
    if (!configuredEndpoint) throw new Error("Local-only mode is enabled.");
    const endpoint = deriveVisualFollowupEndpoint(configuredEndpoint);
    const response = await fetch(endpoint, {
      method: "POST",
      headers: getBackendHeaders(settings, endpoint),
      body: JSON.stringify({
        question,
        title: context.title || model.title,
        sourceType: context.sourceType || "notes",
        sourceUrl: context.sourceUrl || "",
        summary: Array.isArray(context.summary) ? context.summary : [],
        selectedNode,
        activeScenario: scenario,
        visualModel: model
      })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "The visual tutor follow-up service is unavailable.");
    const answer = visualText(
      payload.answer?.text || payload.answer || payload.response || payload.text || payload.followup?.answer,
      "",
      1200
    );
    if (!answer) throw new Error("The visual tutor returned an empty answer.");
    const takeaway = visualText(payload.takeaway, "", 300);
    const nextQuestions = (Array.isArray(payload.suggestedQuestions) ? payload.suggestedQuestions : [])
      .map((item) => visualText(item, "", 160))
      .filter(Boolean)
      .slice(0, 2);
    responsePanel.classList.add("is-generated");
    const responseParts = [
      createElement("strong", visualText(payload.generator, "Generated follow-up", 60), "vin-followup-source"),
      createElement("p", answer, "vin-followup-answer")
    ];
    if (takeaway) responseParts.push(createElement("p", `Takeaway: ${takeaway}`, "vin-followup-takeaway"));
    if (nextQuestions.length) responseParts.push(createElement("small", `Try next: ${nextQuestions.join(" · ")}`, "vin-followup-next"));
    responsePanel.replaceChildren(...responseParts);
  } catch (error) {
    const localAnswer = buildGroundedVisualFallbackAnswer(question, selectedNode, scenario);
    responsePanel.classList.add("is-local-fallback");
    responsePanel.replaceChildren(
      createElement("strong", "Local note fallback", "vin-followup-source"),
      createElement("p", localAnswer, "vin-followup-answer"),
      createElement("small", `AI follow-up unavailable: ${error?.message || "connection failed"}. This response only uses the generated note.`, "vin-followup-disclaimer")
    );
  } finally {
    trigger.disabled = false;
  }
}

function buildGroundedVisualFallbackAnswer(question, selectedNode, scenario) {
  const facts = [selectedNode?.detail, selectedNode?.why, scenario?.outcome, scenario?.insight]
    .map((item) => visualText(item, "", 260))
    .filter(Boolean)
    .filter((item, index, list) => list.indexOf(item) === index)
    .slice(0, 3);
  const subject = selectedNode?.label || "the selected concept";
  return `For "${visualText(question, "this question", 180)}," the generated note says ${subject}: ${facts.join(" ") || "review the highlighted relationship and its source anchor."}`;
}

function deriveVisualFollowupEndpoint(value) {
  return deriveBackendEndpoint(value, "visual-followup");
}

function deriveBackendEndpoint(value, routeName) {
  try {
    const endpoint = new URL(value || DEFAULT_API_ENDPOINT);
    if (/\/api\/(?:study-session|notes|quiz|visual-followup|journey-summary|video-transcript|transcript-chunk)\/?$/i.test(endpoint.pathname)) {
      endpoint.pathname = endpoint.pathname.replace(/\/api\/(?:study-session|notes|quiz|visual-followup|journey-summary|video-transcript|transcript-chunk)\/?$/i, `/api/${routeName}`);
    } else {
      endpoint.pathname = `/api/${routeName}`;
    }
    endpoint.search = "";
    endpoint.hash = "";
    return endpoint.toString();
  } catch {
    return DEFAULT_API_ENDPOINT.replace(/\/api\/study-session$/, `/api/${routeName}`);
  }
}

function renderLegacyVisualViews(blocks) {
  if (!Array.isArray(blocks) || !blocks.length) return null;
  const details = document.createElement("details");
  details.className = "vin-secondary-views";
  const summary = document.createElement("summary");
  summary.className = "vin-secondary-summary";
  summary.textContent = "More study views";
  const nav = document.createElement("div");
  nav.className = "vin-secondary-nav";
  nav.setAttribute("aria-label", "Additional study views");
  const host = document.createElement("div");
  host.className = "vin-secondary-host";

  const renderAt = (index) => {
    [...nav.children].forEach((button, buttonIndex) => {
      const selected = buttonIndex === index;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    host.replaceChildren(renderVisualBlock(blocks[index]));
  };
  blocks.forEach((block, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "vin-secondary-tab";
    button.setAttribute("aria-pressed", "false");
    button.textContent = labelVisualBlock(block.type);
    button.addEventListener("click", () => renderAt(index));
    nav.append(button);
  });
  details.append(summary, nav, host);
  renderAt(0);
  return details;
}

function visualScenarioHasEdge(scenario, edge) {
  if (!scenario) return false;
  const connections = new Set(scenario.connections || []);
  if (connections.size) {
    return connections.has(edge.id)
      || connections.has(`${edge.from}::${edge.to}`)
      || connections.has(`${edge.to}::${edge.from}`);
  }
  const active = new Set(scenario.activeIds || []);
  return active.has(edge.from) && active.has(edge.to);
}

function getVisualNodeLayout(count, kind) {
  if (!count) return [];
  if (kind === "cycle" && count >= 3) {
    return Array.from({ length: count }, (_, index) => {
      const angle = (-Math.PI / 2) + (index * Math.PI * 2 / count);
      return {
        x: 50 + Math.cos(angle) * 34,
        y: 50 + Math.sin(angle) * 31
      };
    });
  }
  if ((kind === "system" || kind === "formula") && count >= 3) {
    const positions = [{ x: 50, y: 50 }];
    const satellites = count - 1;
    for (let index = 0; index < satellites; index += 1) {
      const angle = (-Math.PI / 2) + (index * Math.PI * 2 / satellites);
      positions.push({
        x: 50 + Math.cos(angle) * 34,
        y: 50 + Math.sin(angle) * 31
      });
    }
    return positions;
  }
  if ((kind === "flow" || kind === "timeline") && count <= 3) {
    return Array.from({ length: count }, (_, index) => ({
      x: ((index + 1) / (count + 1)) * 100,
      y: 50
    }));
  }
  const columns = count <= 4 ? 2 : 3;
  const rows = Math.ceil(count / columns);
  return Array.from({ length: count }, (_, index) => ({
    x: ((index % columns) + 1) / (columns + 1) * 100,
    y: (Math.floor(index / columns) + 1) / (rows + 1) * 100
  }));
}

function createVisualSvgElement(tagName, text = "") {
  const element = document.createElementNS("http://www.w3.org/2000/svg", tagName);
  if (text) element.textContent = text;
  return element;
}

function buildFallbackVisualBlocks(summary = []) {
  const nodes = compactSummaryForDisplay(summary, 4).map((item, index) => ({
    id: `n${index + 1}`,
    label: `Idea ${index + 1}`,
    detail: item
  }));
  return [
    buildFallbackInteractiveDemo(summary),
    {
      type: "concept_map",
      title: "Big Picture",
      intro: "Start with these connected ideas before taking the quiz.",
      nodes,
      edges: nodes.slice(1).map((_, index) => ({ from: `n${index + 1}`, to: `n${index + 2}`, label: "connects to" }))
    }
  ];
}
function buildFallbackInteractiveDemo(summary = []) {
  const ideas = compactSummaryForDisplay(summary, 3);
  const choices = ideas.length >= 2
    ? ideas.map((idea, index) => ({
      label: `Explore idea ${index + 1}`,
      result: idea,
      tip: "Connect this point to the rule being tested before answering."
    }))
    : [
      { label: "Identify the rule", result: "Find the central rule or relationship in the material first.", tip: "Ask what changes, what stays true, and why." },
      { label: "Test an example", result: "Apply the rule to one concrete example from the page.", tip: "Explain why the result follows, not only what it is." }
    ];
  return {
    type: "interactive_demo",
    title: "Try The Main Idea",
    intro: "Choose a case to reveal a guided explanation.",
    demo: { prompt: "Select a case", code: "", choices }
  };
}
function renderVisualBlock(block) {
  const wrapper = document.createElement("section");
  wrapper.className = `visual-block visual-${block.type || "concept_map"}`;
  wrapper.append(
    createElement("h3", block.title || labelVisualBlock(block.type)),
    createElement("p", block.intro || "Use this visual guide to understand the topic.", "visual-intro")
  );

  if (block.type === "interactive_demo") {
    wrapper.append(renderInteractiveDemo(block));
  } else if (block.type === "formula_explainer") {
    wrapper.append(renderFormulaExplainer(block));
  } else if (block.type === "comparison_table") {
    wrapper.append(renderComparisonTable(block));
  } else if (block.type === "process_steps") {
    wrapper.append(renderProcessSteps(block));
  } else if (block.type === "worked_example") {
    wrapper.append(renderWorkedExample(block));
  } else {
    wrapper.append(renderConceptMap(block));
  }

  return wrapper;
}
function renderConceptMap(block) {
  const map = document.createElement("div");
  map.className = "concept-map";
  const detail = createElement("p", "Click a concept to see its explanation.", "concept-detail");

  const nodes = Array.isArray(block.nodes) ? block.nodes.slice(0, 6) : [];
  const edges = Array.isArray(block.edges) ? block.edges.slice(0, 6) : [];
  const nodeById = new Map(nodes.map((node) => [String(node.id), node]));

  const nodeGrid = document.createElement("div");
  nodeGrid.className = "concept-node-grid";
  nodes.forEach((node, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "concept-node";
    button.textContent = node.label || `Concept ${index + 1}`;
    button.addEventListener("click", () => {
      [...nodeGrid.children].forEach((child) => child.classList.remove("active"));
      button.classList.add("active");
      detail.textContent = node.detail || node.label || "Review this concept.";
    });
    nodeGrid.append(button);
  });

  const edgeList = document.createElement("ul");
  edgeList.className = "concept-edge-list";
  edges.forEach((edge) => {
    const from = nodeById.get(String(edge.from))?.label || edge.from || "Idea";
    const to = nodeById.get(String(edge.to))?.label || edge.to || "Idea";
    edgeList.append(createElement("li", `${from} -> ${edge.label || "relates to"} -> ${to}`));
  });

  map.append(nodeGrid, detail);
  if (edges.length) map.append(edgeList);
  return map;
}

function renderInteractiveDemo(block) {
  const demo = block.demo || {};
  const choices = Array.isArray(demo.choices) && demo.choices.length
    ? demo.choices.slice(0, 4)
    : buildFallbackInteractiveDemo([]).demo.choices;
  const host = document.createElement("div");
  host.className = "demo-stage";
  const prompt = createElement("p", demo.prompt || "Choose a case to see what changes.", "demo-prompt");
  const choiceGrid = document.createElement("div");
  choiceGrid.className = "demo-choice-grid";
  const outcome = document.createElement("div");
  outcome.className = "demo-outcome";
  const code = String(demo.code || "").trim();

  const renderOutcome = (index) => {
    const selected = choices[index] || choices[0];
    [...choiceGrid.children].forEach((button, buttonIndex) => button.classList.toggle("active", buttonIndex === index));
    outcome.replaceChildren(
      createElement("strong", "What happens"),
      createElement("p", selected.result || "Review the source rule for this case."),
      createElement("p", `Tutor tip: ${selected.tip || "Explain why this outcome follows from the rule."}`, "demo-tip")
    );
  };

  choices.forEach((choice, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "demo-choice";
    button.textContent = choice.label || `Case ${index + 1}`;
    button.addEventListener("click", () => renderOutcome(index));
    choiceGrid.append(button);
  });

  host.append(prompt);
  if (code) {
    const codeBox = document.createElement("pre");
    codeBox.className = "demo-code";
    codeBox.textContent = code;
    host.append(codeBox);
  }
  host.append(choiceGrid, outcome);
  renderOutcome(0);
  return host;
}
function renderFormulaExplainer(block) {
  const box = document.createElement("div");
  box.className = "formula-grid";
  const variables = Array.isArray(block.variables) ? block.variables.slice(0, 8) : [];
  variables.forEach((item) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "formula-variable";
    card.append(createElement("strong", item.symbol || "?"), createElement("span", item.meaning || "Meaning"), createElement("small", item.role || "Role in the idea"));
    card.addEventListener("click", () => showStatus(`${item.symbol || "Term"}: ${item.role || item.meaning || "Review this variable."}`));
    box.append(card);
  });
  if (!variables.length) box.append(createElement("p", "No formula variables found for this topic.", "hint"));
  return box;
}
function renderComparisonTable(block) {
  const table = document.createElement("table");
  table.className = "visual-table";
  const head = document.createElement("tr");
  ["Idea A", "Idea B", "Exam Difference"].forEach((label) => head.append(createElement("th", label)));
  table.append(head);
  (Array.isArray(block.rows) ? block.rows.slice(0, 6) : []).forEach((row) => {
    const tr = document.createElement("tr");
    tr.append(createElement("td", row.left || "-"), createElement("td", row.right || "-"), createElement("td", row.difference || "-"));
    table.append(tr);
  });
  return table;
}

function renderProcessSteps(block) {
  const host = document.createElement("div");
  host.className = "step-reveal";
  const steps = Array.isArray(block.steps) ? block.steps.slice(0, 6) : [];
  let visibleCount = Math.min(1, steps.length);
  const list = document.createElement("ol");
  const button = document.createElement("button");
  button.type = "button";
  button.className = "secondary reveal-step-button";
  button.textContent = "Reveal next step";

  const render = () => {
    list.replaceChildren(...steps.slice(0, visibleCount).map((step) => {
      const li = document.createElement("li");
      li.append(createElement("strong", step.label || "Step"), createElement("p", step.detail || "What happens"), createElement("small", step.why || "Why it matters"));
      return li;
    }));
    button.disabled = visibleCount >= steps.length;
    button.textContent = visibleCount >= steps.length ? "All steps shown" : "Reveal next step";
  };

  button.addEventListener("click", () => {
    visibleCount = Math.min(steps.length, visibleCount + 1);
    render();
  });
  render();
  host.append(list, button);
  return host;
}

function renderWorkedExample(block) {
  const example = block.example || {};
  const host = document.createElement("div");
  host.className = "worked-example";
  host.append(createElement("p", example.question || "Try applying the idea."));

  const steps = document.createElement("ol");
  steps.className = "hidden";
  (Array.isArray(example.walkthrough) ? example.walkthrough : []).slice(0, 5).forEach((item) => steps.append(createElement("li", item)));

  const answer = createElement("p", `Answer: ${example.answer || "Review the walkthrough."}`, "example-answer hidden");
  const button = document.createElement("button");
  button.type = "button";
  button.className = "secondary";
  button.textContent = "Show walkthrough";
  button.addEventListener("click", () => {
    steps.classList.toggle("hidden");
    answer.classList.toggle("hidden");
    button.textContent = steps.classList.contains("hidden") ? "Show walkthrough" : "Hide walkthrough";
  });

  host.append(button, steps, answer);
  return host;
}

function labelVisualBlock(type) {
  return {
    interactive_demo: "Demo",
    concept_map: "Map",
    formula_explainer: "Formula",
    comparison_table: "Compare",
    process_steps: "Steps",
    worked_example: "Example"
  }[type] || "Map";
}

function formatDifficulty(value) {
  return { easy: "Easy", normal: "Normal", hard: "Hard" }[value] || "Normal";
}

function formatQuizStyle(value) {
  return {
    mixed: "Mixed practice",
    application: "Application focused",
    weakness: "Weak-spot diagnostic",
    definition: "Core definitions"
  }[value] || "Mixed practice";
}

function formatSessionSource(session) {
  if (session.sourceType === "collection") return "multi-source chapter";
  if (!["webpage", "video"].includes(session.sourceType)) return session.sourceType;
  const binding = session.sourceBinding || {};
  if (binding.documentType === "pdf") {
    try {
      const hostname = new URL(session.sourceUrl || binding.url).hostname;
      return hostname ? `PDF: ${hostname}` : "PDF document";
    } catch {
      return "PDF document";
    }
  }
  if (binding.documentType === "html" && !(session.sourceUrl || binding.url)) return "HTML document";
  try {
    const hostname = new URL(session.sourceUrl).hostname;
    return hostname ? `${session.sourceType}: ${hostname}` : session.sourceType;
  } catch {
    return session.sourceType;
  }
}

function renderArtifactSourceBanner(item) {
  if (!elements.artifactSourceBanner) return;
  const binding = item?.sourceBinding || {};
  const sourceType = binding.sourceType || item?.sourceType || "notes";
  const sourceUrl = binding.url || item?.sourceUrl || "";
  let sourceName = binding.title || item?.title || "Imported notes";
  let sourceMeta = sourceType === "notes" ? "Pasted study material" : sourceType;
  if (binding.documentType === "pdf") {
    sourceMeta = binding.pageCount
      ? `PDF document · ${binding.pageCount} ${binding.pageCount === 1 ? "page" : "pages"}`
      : "PDF document";
    try {
      const hostname = new URL(sourceUrl).hostname;
      if (hostname) sourceMeta += ` · ${hostname}`;
    } catch {
      // A locally selected PDF deliberately has no reusable filesystem URL.
    }
  } else {
    try {
      const url = new URL(sourceUrl);
      sourceMeta = `${sourceType} · ${url.hostname}`;
    } catch {
      if (sourceType === "collection") sourceMeta = `${item?.sources?.length || binding.collectionSources?.length || 0} saved sources`;
      else if (binding.documentType === "html") sourceMeta = "Local HTML document";
    }
  }
  const chapter = item?.journeyChapterTitle || binding.chapterTitle || "Current chapter";
  elements.artifactSourceBanner.replaceChildren(
    createElement("strong", `This note is from ${sourceName}`),
    createElement("span", `${sourceMeta} · Saved to ${chapter}. Switching pages will not replace this source.`)
  );
}

function renderSession(session) {
  state.currentArtifact = session;
  state.currentExportItem = session;
  elements.views.forEach((view) => {
    view.classList.remove("active");
    view.setAttribute("aria-hidden", "true");
  });
  updateStudyModeSelection("");
  elements.resultView.classList.remove("hidden");
  elements.resultView.setAttribute("aria-hidden", "false");
  elements.quizBlock.classList.remove("hidden");
  elements.saveSessionButton.classList.remove("hidden");
  elements.generateQuizButton?.classList.remove("hidden");
  if (elements.generateQuizButton) elements.generateQuizButton.textContent = "Regenerate quiz";
  renderArtifactSourceBanner(session);
  updatePinnedArtifactControl();
  const conciseSummary = compactSummaryForDisplay(session.summary || []);
  renderCheatSheet(session);
  renderQuizVisual({ ...session, summary: conciseSummary });
  elements.scoreBlock.classList.add("hidden");
  elements.submitQuizButton.classList.remove("hidden");

  elements.sessionTitle.textContent = session.title;
  elements.sessionMeta.textContent = `${formatDifficulty(session.difficulty)} | ${formatQuizStyle(session.quizStyle)} | ${formatSessionSource(session)} | ${session.questions.length} questions | ${session.generator || "ai"}`;
  elements.summaryList.replaceChildren(...conciseSummary.map((item) => createElement("li", item)));
  elements.quizProgress.textContent = `0/${session.questions.length} answered`;
  renderQuiz(session);
  Object.entries(session.answers || {}).forEach(([questionId, answer]) => {
    const input = document.querySelector(`input[name="${cssEscape(questionId)}"][value="${cssEscape(answer)}"]`);
    if (input) input.checked = true;
  });
  updateQuizProgress();
  if (state.submitted) {
    markQuizAnswers();
    renderScore();
    elements.submitQuizButton.classList.add("hidden");
  }
  void persistCurrentSessionDraft();
}
function renderQuiz(session) {
  const cards = session.questions.map((question, index) => {
    const card = document.createElement("div");
    card.className = "question-card";

    const badge = createElement("span", question.questionStyle || question.skill || "Exam Check", "question-badge");
    const title = createElement("p", `${index + 1}. ${question.prompt}`);
    card.append(badge, title);

    question.choices.forEach((choice) => {
      const choiceId = `${question.id}-${choice}`;
      const label = document.createElement("label");
      label.className = "choice";
      label.setAttribute("for", choiceId);

      const input = document.createElement("input");
      input.type = "radio";
      input.id = choiceId;
      input.name = question.id;
      input.value = choice;
      input.addEventListener("change", () => {
        state.currentSession.answers[question.id] = choice;
        updateQuizProgress();
        void persistCurrentSessionDraft();
      });

      label.append(input, document.createTextNode(choice));
      card.append(label);
    });

    const actions = document.createElement("div");
    actions.className = "question-actions";
    const hintButton = document.createElement("button");
    hintButton.type = "button";
    hintButton.className = "secondary";
    hintButton.textContent = "Hint";

    const hintBox = document.createElement("div");
    hintBox.className = "hint-box hidden";
    hintButton.addEventListener("click", () => {
      if (!hintBox.classList.contains("hidden")) {
        hintBox.classList.add("hidden");
        return;
      }
      void revealHintWithSource(question, hintBox, hintButton);
    });

    actions.append(hintButton);
    card.append(actions, hintBox);
    return card;
  });

  elements.quizContainer.replaceChildren(...cards);
}

async function revealHintWithSource(question, hintBox, hintButton) {
  if (state.currentSession?.sourceType === "video") {
    const timestamp = Number(question.sourceTimestamp ?? Number(question.sourceRef?.startMs) / 1000);
    hintBox.classList.remove("hidden");
    const children = [
      createElement("strong", "Hint"),
      createElement("p", question.hint || question.sourceText || "Review the related caption segment."),
      createElement("p", question.sourceRef?.quote || question.sourceText || "The hint is grounded in the video transcript.", "hint-source-tip"),
      createElement(
        "p",
        state.currentSession.timestampConfidence === "AI-estimated"
          ? "Time confidence: AI-estimated from tab audio."
          : state.currentSession.timestampConfidence === "user-provided"
            ? "Time confidence: user-provided; verify it against the video."
            : "Time confidence: publisher-caption-grounded.",
        "hint-source-tip"
      )
    ];
    if (Number.isFinite(timestamp)) {
      const jumpButton = document.createElement("button");
      jumpButton.type = "button";
      jumpButton.className = "secondary timestamp-button";
      jumpButton.textContent = `Jump to ${formatTimestamp(timestamp)}`;
      jumpButton.addEventListener("click", async () => {
        jumpButton.disabled = true;
        const result = await jumpToVideoTimestamp(timestamp, {
          expectedSourceUrl: state.currentSession.sourceUrl,
          sourceTabId: state.currentSession.sourceTabId,
          videoMediaId: state.currentSession.videoMediaId
        });
        showStatus(result.message, !result.found);
        jumpButton.disabled = false;
      });
      children.push(jumpButton);
    } else {
      children.push(createElement("p", "This caption could not be tied to a safe timestamp.", "hint-source-tip"));
    }
    hintBox.replaceChildren(...children);
    hintButton.disabled = false;
    return;
  }
  if (state.currentSession?.sourceType === "collection") {
    hintBox.classList.remove("hidden");
    const sourceUrl = question.sourceRef?.url || "";
    const safeSourceUrl = normalizeSafeExternalUrl(sourceUrl);
    const children = [
      createElement("strong", "Hint"),
      createElement("p", question.hint || question.sourceText || "Review the cited chapter source."),
      createElement("p", question.sourceRef?.quote || question.sourceText || "This hint was matched to a saved source.", "hint-source-tip")
    ];
    if (safeSourceUrl) {
      const openButton = document.createElement("button");
      openButton.type = "button";
      openButton.className = "secondary timestamp-button";
      openButton.textContent = `Open ${question.sourceRef?.title || "cited source"}`;
      openButton.addEventListener("click", async () => {
        await persistCurrentSessionDraft();
        await openSafeExternalUrl(safeSourceUrl);
      });
      children.push(openButton);
    }
    hintBox.replaceChildren(...children);
    hintButton.disabled = false;
    return;
  }
  if (state.currentSession?.sourceBinding?.documentType === "pdf") {
    hintBox.classList.remove("hidden");
    const sourceUrl = state.currentSession.sourceUrl || state.currentSession.sourceBinding.url || "";
    const safeSourceUrl = normalizeSafeExternalUrl(sourceUrl, { allowFile: true });
    const children = [
      createElement("strong", "Hint"),
      createElement("p", question.hint || question.sourceText || "Review the related PDF passage."),
      createElement("p", question.sourceText || question.explanation || "This hint is grounded in the PDF text saved with the note.", "hint-source-tip")
    ];
    if (safeSourceUrl) {
      const openButton = document.createElement("button");
      openButton.type = "button";
      openButton.className = "secondary timestamp-button";
      openButton.textContent = "Open original PDF";
      openButton.addEventListener("click", async () => {
        await persistCurrentSessionDraft();
        await openSafeExternalUrl(safeSourceUrl, { allowFile: true });
      });
      children.push(openButton);
    }
    hintBox.replaceChildren(...children);
    hintButton.disabled = false;
    return;
  }
  hintBox.classList.remove("hidden");
  hintBox.replaceChildren(
    createElement("strong", "Hint"),
    createElement("p", question.hint || question.sourceText || "Review the related source section before choosing."),
    createElement("p", "Looking for the matching sentence in the original page...", "hint-source-tip")
  );
  hintButton.disabled = true;

  const result = await highlightSourceText(question.sourceText || question.explanation || question.prompt, {
    announce: false,
    expectedSourceUrl: state.currentSession?.sourceUrl,
    sourceTabId: state.currentSession?.sourceTabId
  });
  const sourceTip = result.found
    ? "The matching sentence is highlighted in yellow on the original page. Read it, then return here to answer."
    : `${result.message} Use the hint to compare the choices with the source rule.`;

  hintBox.replaceChildren(
    createElement("strong", "Hint"),
    createElement("p", question.hint || question.sourceText || "Review the related source section before choosing."),
    createElement("p", sourceTip, "hint-source-tip")
  );
  hintButton.disabled = false;
}
function updateQuizProgress() {
  const answered = Object.keys(state.currentSession.answers).length;
  const total = state.currentSession.questions.length;
  elements.quizProgress.textContent = `${answered}/${total} answered`;
}

async function handleSubmitQuiz() {
  if (!state.currentSession || state.submitted) return;

  const total = state.currentSession.questions.length;
  const answered = Object.keys(state.currentSession.answers).length;
  if (answered < total) {
    showStatus("Answer every question before submitting.", true);
    return;
  }

  const wrongAnswers = [];
  let correctCount = 0;

  state.currentSession.questions.forEach((question) => {
    const selected = state.currentSession.answers[question.id];
    if (selected === question.answer) {
      correctCount += 1;
    } else {
      wrongAnswers.push({ ...question, selected });
    }
  });

  const weakTopics = [...new Set(wrongAnswers.map((item) => item.topic))];
  state.currentSession.score = Math.round((correctCount / total) * 100);
  state.currentSession.wrongAnswers = wrongAnswers;
  state.currentSession.weakTopics = weakTopics;
  state.currentSession.submittedAt = new Date().toISOString();
  state.submitted = true;
  await persistCurrentSessionDraft();

  markQuizAnswers();
  renderScore();
  elements.submitQuizButton.classList.add("hidden");
  showStatus("Quiz complete. Saving the result to your Journey...");
  try {
    const recorded = await recordLearningItem(
      state.currentSession,
      state.currentSession.journeyChapterId || state.currentSession.journeyChapterTitle
    );
    if (recorded?.chapterId) state.currentSession.journeyChapterId = recorded.chapterId;
    await persistCurrentSessionDraft();
    showStatus("Quiz complete and saved to your Journey.");
  } catch (error) {
    showStatus(`Quiz complete, but Journey saving failed. Use Save session and retry from the Library. ${error.message || ""}`.trim(), true);
  }
}

async function jumpToVideoTimestamp(seconds, { expectedSourceUrl = "", sourceTabId = null, videoMediaId = "" } = {}) {
  await persistCurrentSessionDraft();
  const timestamp = Math.max(0, Number(seconds) || 0);
  if (!hasChromeTabs() || !hasChromeScripting()) {
    return { found: false, message: "Timestamp jumping is available inside the Chrome extension." };
  }
  try {
    const activeTab = await getActiveTab();
    let tab = activeTab;
    if (!tab || (expectedSourceUrl && !samePageUrl(tab.url, expectedSourceUrl))) {
      tab = null;
      if (Number.isInteger(sourceTabId) && typeof chrome.tabs.get === "function") {
        tab = await chrome.tabs.get(sourceTabId).catch(() => null);
        if (tab && expectedSourceUrl && !samePageUrl(tab.url, expectedSourceUrl)) tab = null;
      }
    }

    if (!tab?.id) {
      const safeExpectedSourceUrl = normalizeSafeExternalUrl(expectedSourceUrl);
      if (safeExpectedSourceUrl && /(?:youtube\.com\/watch|youtu\.be\/)/i.test(safeExpectedSourceUrl)) {
        const url = new URL(safeExpectedSourceUrl);
        url.searchParams.set("t", `${Math.round(timestamp)}s`);
        await chrome.tabs.create({ url: url.href });
        return { found: true, message: `Opened the original video at ${formatTimestamp(timestamp)}.` };
      }
      return { found: false, message: "Open the original video tab, then use the timestamp again." };
    }

    if (videoMediaId) {
      const currentIdentity = await readCurrentVideoIdentity(tab.id);
      if (!currentIdentity || currentIdentity.mediaId !== videoMediaId) {
        return { found: false, message: "The source tab now contains a different video." };
      }
    }

    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      args: [timestamp],
      func: (requestedSeconds) => {
        const videos = [...document.querySelectorAll("video")];
        const video = videos.sort((first, second) => {
          const a = first.getBoundingClientRect();
          const b = second.getBoundingClientRect();
          return b.width * b.height - a.width * a.height;
        })[0];
        if (!video) return { ok: false, reason: "No video player was found on the source page." };
        const duration = Number.isFinite(video.duration) ? video.duration : requestedSeconds;
        video.currentTime = Math.min(Math.max(0, requestedSeconds), Math.max(0, duration - 0.1));
        video.pause();
        video.scrollIntoView({ behavior: "smooth", block: "center" });
        video.style.transition = "outline 180ms ease";
        video.style.outline = "4px solid #5b55d7";
        setTimeout(() => { video.style.outline = ""; }, 3500);
        return { ok: true, actualTime: video.currentTime };
      }
    });
    if (!result?.result?.ok) {
      return { found: false, message: result?.result?.reason || "The video player could not seek to that timestamp." };
    }
    return { found: true, message: `Moved the original video to ${formatTimestamp(result.result.actualTime)} and paused it.` };
  } catch (error) {
    return { found: false, message: error.message || "Could not jump to the video timestamp." };
  }
}

async function highlightSourceText(sourceText, { announce = true, expectedSourceUrl = "", sourceTabId = null } = {}) {
  await persistCurrentSessionDraft();
  const finish = (found, message, isError = false) => {
    if (announce) showStatus(message, isError);
    return { found, message };
  };

  if (!sourceText || sourceText.length < 8) {
    return finish(false, "This item does not include a source excerpt to highlight.", true);
  }

  if (announce) showStatus("Looking for this passage in the original page...");

  try {
    if (!hasChromeTabs()) {
      return finish(false, "Page highlighting is only available inside the Chrome extension.", true);
    }
    let tab = await getActiveTab();
    if (expectedSourceUrl && (!tab?.id || !samePageUrl(tab.url, expectedSourceUrl))) {
      tab = null;
      if (Number.isInteger(sourceTabId) && typeof chrome.tabs.get === "function") {
        tab = await chrome.tabs.get(sourceTabId).catch(() => null);
        if (tab && !samePageUrl(tab.url, expectedSourceUrl)) tab = null;
      }
      if (!tab && typeof chrome.tabs.query === "function") {
        const candidates = await chrome.tabs.query({});
        tab = candidates.find((candidate) => candidate?.id && samePageUrl(candidate.url, expectedSourceUrl)) || null;
      }
      if (tab && typeof chrome.tabs.update === "function") {
        tab = await chrome.tabs.update(tab.id, { active: true });
      }
    }
    if (!tab?.id || !/^https?:\/\//.test(tab.url || "")) {
      const safeExpectedSourceUrl = normalizeSafeExternalUrl(expectedSourceUrl);
      if (safeExpectedSourceUrl && typeof chrome.tabs.create === "function") {
        await chrome.tabs.create({ url: safeExpectedSourceUrl });
        return finish(false, "Opened the cited page. Reopen Exam-Cram there to highlight the passage.", false);
      }
      return finish(false, "Open the original webpage tab, then try the highlight action again.", true);
    }
    if (expectedSourceUrl && !samePageUrl(tab.url, expectedSourceUrl)) {
      return finish(false, "The original source tab could not be found.", true);
    }

    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      args: [sourceText],
      func: (needle) => {
        const stopWords = new Set(["about", "after", "before", "between", "from", "into", "that", "their", "there", "these", "this", "with", "would", "which", "when", "where", "function", "source"]);
        const normalize = (value) => String(value || "")
          .replace(/\\text\{([^}]*)\}/g, "$1")
          .replace(/\\[a-zA-Z]+/g, " ")
          .replace(/[{}]/g, " ")
          .replace(/([A-Za-z]\([^)]{1,20}\))\1+/g, "$1")
          .replace(/\b([A-Za-z])\1\b/g, "$1")
          .replace(/\s+/g, " ")
          .trim()
          .toLowerCase();
        const tokens = normalize(needle)
          .split(/[^a-z0-9()]+/i)
          .filter((word) => word.length >= 4 && !stopWords.has(word))
          .slice(0, 12);
        const target = normalize(needle).slice(0, 220);
        const nodes = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, {
          acceptNode(node) {
            if (!node || ["SCRIPT", "STYLE", "NOSCRIPT", "SVG", "CANVAS"].includes(node.tagName)) return NodeFilter.FILTER_REJECT;
            if (!["P", "LI", "TD", "TH", "DD", "DT", "BLOCKQUOTE", "PRE", "H1", "H2", "H3", "H4"].includes(node.tagName)) return NodeFilter.FILTER_SKIP;
            const text = normalize(node.innerText || node.textContent);
            return text.length > 25 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
          }
        });

        while (walker.nextNode()) nodes.push(walker.currentNode);

        const exactCandidates = [target, target.split(" ").slice(0, 14).join(" "), target.split(" ").slice(0, 8).join(" ")]
          .filter((item) => item.length >= 20);

        const highlight = (element) => {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.setAttribute("data-exam-cram-highlight", "true");
          element.style.transition = "background-color 180ms ease, outline 180ms ease";
          element.style.backgroundColor = "#fff3a3";
          element.style.outline = "3px solid #f5c542";
          setTimeout(() => {
            element.style.backgroundColor = "";
            element.style.outline = "";
            element.removeAttribute("data-exam-cram-highlight");
          }, 7000);
          return true;
        };

        for (const candidate of exactCandidates) {
          const exactMatch = nodes.find((node) => normalize(node.innerText || node.textContent).includes(candidate));
          if (exactMatch) return highlight(exactMatch);
        }

        let best = null;
        let bestScore = 0;
        for (const node of nodes) {
          const nodeText = normalize(node.innerText || node.textContent);
          const score = tokens.reduce((total, token) => total + (nodeText.includes(token) ? 1 : 0), 0);
          if (score > bestScore) {
            best = node;
            bestScore = score;
          }
        }

        if (best && bestScore >= Math.min(3, Math.max(1, tokens.length))) {
          return highlight(best);
        }

        if (window.find && window.find(needle)) {
          const selection = window.getSelection();
          const matchedElement = selection?.anchorNode?.parentElement;
          return matchedElement ? highlight(matchedElement) : false;
        }

        return false;
      }
    });

    const found = Boolean(result?.result);
    if (tab.id !== activeTab?.id && typeof chrome.tabs.update === "function") {
      await chrome.tabs.update(tab.id, { active: true });
    }
    return found
      ? finish(true, "Highlighted the matching passage in yellow on the original page.")
      : finish(false, "No close match was found. Open the original page and use the excerpt shown above.", true);
  } catch (error) {
    return finish(false, error.message || "Could not highlight source text.", true);
  }
}
function markQuizAnswers() {
  state.currentSession.questions.forEach((question) => {
    document.querySelectorAll(`input[name="${question.id}"]`).forEach((input) => {
      const label = input.closest(".choice");
      input.disabled = true;
      if (input.value === question.answer) {
        label.classList.add("correct");
      } else if (input.checked) {
        label.classList.add("wrong");
      }
    });
  });
}

function renderScore() {
  const session = state.currentSession;
  elements.scoreBlock.classList.remove("hidden");
  elements.scoreTitle.textContent = `Score: ${session.score}%`;

  if (session.weakTopics.length) {
    elements.weakTopicText.textContent = `Weak topics: ${session.weakTopics.join(", ")}`;
  } else {
    elements.weakTopicText.textContent = "No weak topics detected in this quiz.";
  }

  const wrongItems = session.wrongAnswers.map((item) => {
    const node = document.createElement("div");
    node.className = "wrong-answer";
    const sourceButton = document.createElement("button");
    sourceButton.type = "button";
    sourceButton.className = "text-button";
    const timestamp = Number(item.sourceTimestamp ?? Number(item.sourceRef?.startMs) / 1000);
    if (session.sourceType === "video" && Number.isFinite(timestamp)) {
      sourceButton.textContent = `Jump to ${formatTimestamp(timestamp)} in video`;
      sourceButton.addEventListener("click", () => jumpToVideoTimestamp(timestamp, {
        expectedSourceUrl: session.sourceUrl,
        sourceTabId: session.sourceTabId,
        videoMediaId: session.videoMediaId
      }));
    } else if (session.sourceType === "collection" && normalizeSafeExternalUrl(item.sourceRef?.url)) {
      sourceButton.textContent = `Open ${item.sourceRef?.title || "cited source"}`;
      sourceButton.addEventListener("click", async () => {
        await persistCurrentSessionDraft();
        await openSafeExternalUrl(item.sourceRef.url);
      });
    } else {
      sourceButton.textContent = "Highlight supporting source";
      sourceButton.addEventListener("click", () => highlightSourceText(
        item.sourceText || item.explanation || item.prompt,
        { expectedSourceUrl: session.sourceUrl, sourceTabId: session.sourceTabId }
      ));
    }
    node.append(
      createElement("strong", item.topic),
      createElement("p", `Your answer: ${item.selected}`),
      createElement("p", `Correct answer: ${item.answer}`),
      createElement("p", item.explanation),
      createElement("p", item.whyThisMatters ? `Why it matters: ${item.whyThisMatters}` : "", "review-note"),
      createElement("p", item.misconceptionTested ? `Misconception: ${item.misconceptionTested}` : "", "review-note"),
      sourceButton
    );
    return node;
  });
  elements.wrongAnswerList.replaceChildren(...wrongItems);

  const goals = buildGoals(session);
  elements.goalList.replaceChildren(...goals.map((goal) => createElement("li", goal)));
}

function buildGoals(session) {
  if (!session.weakTopics.length) {
    return [
      "Retake this quiz tomorrow to confirm retention.",
      "Generate a harder quiz from the same material.",
      "Move this topic to final exam review."
    ];
  }

  return [
    `Revise these weak topics today: ${session.weakTopics.join(", ")}.`,
    "Read the source explanations for every wrong answer.",
    "Retake a 10-question quiz after revision.",
    "Add weak topics to your final exam checklist."
  ];
}

function getCurrentExportItem() {
  const item = state.currentSession || state.currentArtifact || state.currentExportItem;
  if (!item || typeof item !== "object") return null;
  try {
    return typeof structuredClone === "function"
      ? structuredClone(item)
      : JSON.parse(JSON.stringify(item));
  } catch {
    return item;
  }
}

async function handleSaveArtifact() {
  const item = getCurrentExportItem();
  if (!item?.id) {
    showStatus("Open a visual note before saving it.", true);
    return;
  }
  try {
    await saveLibraryItem(item);
    await persistCurrentSessionDraft();
    await renderLibrary();
    showStatus(Array.isArray(item.questions) && item.questions.length ? "Note and quiz saved." : "Visual note saved.");
  } catch (error) {
    showStatus(error?.message || "Could not save this study note.", true);
  }
}

async function handleOpenExport() {
  const item = getCurrentExportItem();
  const exportApi = globalThis.ExamCramExport;
  if (!item || !exportApi?.createExportModel) {
    showStatus("Open a generated visual note before exporting.", true);
    return;
  }

  const exportId = crypto.randomUUID();
  const exportKey = `${STORAGE_KEYS.exportPayload}:${exportId}`;
  try {
    await pruneExpiredExportPayloads().catch(() => {});
    const exportModel = exportApi.createExportModel(item);
    const exportedAt = new Date();
    await setStorage(exportKey, {
      exportId,
      exportModel,
      exportedAt: exportedAt.toISOString(),
      expiresAt: new Date(exportedAt.getTime() + 60 * 60 * 1000).toISOString(),
      selections: exportApi.getDefaultSelections(exportModel)
    });

    const exportUrl = new URL(
      globalThis.chrome?.runtime?.getURL
        ? globalThis.chrome.runtime.getURL("export.html")
        : new URL("export.html", location.href).href
    );
    exportUrl.searchParams.set("exportId", exportId);
    if (typeof globalThis.chrome?.tabs?.create === "function") {
      await globalThis.chrome.tabs.create({ url: exportUrl.href });
    } else {
      const opened = window.open(exportUrl.href, "_blank");
      if (!opened) throw new Error("The browser blocked the export preview tab.");
      try {
        opened.opener = null;
      } catch {
        // The browser may isolate the new tab immediately.
      }
    }
    showStatus("Export preview opened. Choose the sections and download a real DOCX or PDF.");
  } catch (error) {
    await removeStorage(exportKey).catch(() => {});
    showStatus(error?.message || "Could not open the export preview.", true);
  }
}

function handleExportDocument() {
  void handleOpenExport();
}

async function handleExportPdf() {
  await handleOpenExport();
}

async function persistCurrentSessionDraft() {
  const currentArtifact = state.currentSession || state.currentArtifact || state.currentExportItem;
  if (!currentArtifact?.id) return false;
  try {
    const artifact = typeof structuredClone === "function"
      ? structuredClone(currentArtifact)
      : JSON.parse(JSON.stringify(currentArtifact));
    await setStorage(STORAGE_KEYS.sessionDraft, {
      savedAt: new Date().toISOString(),
      submitted: Boolean(state.submitted),
      artifact,
      session: artifact
    });
    return true;
  } catch {
    return false;
  }
}

async function maybeRestoreSessionDraft() {
  if (state.currentArtifact || state.currentSession) return false;
  const draft = await getStorage(STORAGE_KEYS.sessionDraft, null);
  const artifact = draft?.artifact || draft?.session;
  if (!artifact?.id || typeof artifact !== "object") {
    if (draft) await removeStorage(STORAGE_KEYS.sessionDraft).catch(() => {});
    return false;
  }
  const hasQuiz = Array.isArray(artifact.questions) && artifact.questions.length > 0;
  state.currentArtifact = artifact;
  state.currentExportItem = artifact;
  state.currentSession = hasQuiz ? artifact : null;
  state.submitted = Boolean(draft.submitted || artifact.submittedAt || (artifact.score !== null && artifact.score !== undefined));
  if (hasQuiz) renderSession(artifact);
  else renderNote(artifact);
  showStatus(hasQuiz
    ? "Restored your pinned note and quiz. The current browser page is shown separately."
    : "Restored your pinned visual note. The current browser page is shown separately.");
  return true;
}

async function handleSaveSession() {
  if (!state.currentSession) return;
  await saveLibraryItem(state.currentSession);
  showStatus("Session saved.");
  renderLibrary();
}

async function saveLibraryItem(item) {
  const sessions = await getStorage(STORAGE_KEYS.sessions, []);
  const nextSessions = [item, ...sessions.filter((saved) => saved.id !== item.id)].slice(0, 30);
  await setStorage(STORAGE_KEYS.sessions, nextSessions);
}

async function renderLibrary() {
  const sessions = await getStorage(STORAGE_KEYS.sessions, []);
  if (!sessions.length) {
    elements.libraryList.replaceChildren(createElement("p", "No saved sessions yet.", "hint"));
    return;
  }

  const items = sessions.map((session) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "library-item";

    if (session.kind === "note") {
      const noteLabel = session.artifactType === "study" ? "Visual note" : "Imported notes";
      button.append(
        createElement("strong", session.title),
        createElement("span", `${formatDate(session.createdAt)} | ${noteLabel}`),
        createElement("span", session.terms?.length ? `Terms: ${session.terms.slice(0, 5).join(", ")}` : "Study notes saved")
      );
      button.addEventListener("click", () => renderNote(session));
      return button;
    }

    const scoreLabel = session.score === null || session.score === undefined
      ? "Not submitted"
      : `Score: ${session.score}%`;
    button.append(
      createElement("strong", session.title),
      createElement("span", `${formatDate(session.createdAt)} | ${scoreLabel}`),
      createElement("span", session.weakTopics?.length ? `Weak: ${session.weakTopics.join(", ")}` : "No weak topics saved")
    );
    button.addEventListener("click", () => {
      state.currentSession = session;
      state.submitted = session.score !== null;
      renderSession(session);
    });
    return button;
  });

  elements.libraryList.replaceChildren(...items);
}

async function getJourney() {
  if (!globalThis.ExamCramJourney) return null;
  try {
    const response = await sendJourneyWorkerMessage({ type: "JOURNEY_GET" });
    if (response?.journey) return globalThis.ExamCramJourney.normalizeJourney(response.journey);
  } catch {
    // Preview and older extension workers use the local storage fallback below.
  }
  const stored = await getStorage(STORAGE_KEYS.journey, null);
  return globalThis.ExamCramJourney.normalizeJourney(stored || globalThis.ExamCramJourney.createJourney());
}

async function saveJourney(journey) {
  if (!journey) return;
  await setStorage(STORAGE_KEYS.journey, journey);
  await updateJourneyChapterOptions(journey);
}

function sendJourneyWorkerMessage(message) {
  if (!globalThis.chrome?.runtime?.sendMessage) {
    const stored = localStorage.getItem(STORAGE_KEYS.journey);
    const current = stored ? JSON.parse(stored) : globalThis.ExamCramJourney.createJourney();
    const outcome = globalThis.ExamCramJourneyWorker.reduceJourneyOperation(current, message, Date.now());
    if (outcome.changed) localStorage.setItem(STORAGE_KEYS.journey, JSON.stringify(outcome.journey));
    return Promise.resolve({ ok: true, journey: outcome.journey, result: outcome.result, duplicate: outcome.duplicate });
  }
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      const runtimeError = chrome.runtime?.lastError;
      if (runtimeError) {
        reject(new Error(runtimeError.message || "Could not contact the Journey service worker."));
        return;
      }
      if (!response?.ok) {
        const error = new Error(response?.error?.message || "The learning journey could not be updated.");
        error.code = response?.error?.code;
        error.details = response?.error?.details || {};
        reject(error);
        return;
      }
      resolve(response);
    });
  });
}

async function mutateJourney(type, payload, options = {}) {
  let journey = options.journey || await getJourney();
  const opId = options.opId || crypto.randomUUID();
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await sendJourneyWorkerMessage({
        type,
        opId,
        expectedRevision: journey.revision,
        payload
      });
      await updateJourneyChapterOptions(response.journey);
      return response;
    } catch (error) {
      if (error.code !== "REVISION_CONFLICT" || attempt > 0) throw error;
      journey = await getJourney();
    }
  }
  throw new Error("The learning journey changed too quickly. Try again.");
}

async function loadJourney() {
  let journey = await getJourney();
  if (!journey) return;
  const savedSessions = await getStorage(STORAGE_KEYS.sessions, []);
  const knownSessions = new Map(journey.chapters.flatMap((chapter) =>
    chapter.sessions.map((session) => [session.id, session])));
  for (const saved of Array.isArray(savedSessions) ? savedSessions : []) {
    const existing = saved?.id ? knownSessions.get(saved.id) : null;
    if (!saved?.id || !shouldImportSavedArtifact(saved, existing)) continue;
    try {
      const recorded = await mutateJourney("JOURNEY_UPSERT_SESSION", {
        chapterIdOrTitle: saved.journeyChapterId || saved.journeyChapterTitle || "Previous study sessions",
        session: saved
      }, { journey });
      journey = recorded.journey;
      const updatedChapter = globalThis.ExamCramJourney.findChapter(journey, recorded.result?.chapterId);
      const updatedSession = updatedChapter?.sessions?.find((session) => session.id === saved.id);
      if (updatedSession) knownSessions.set(saved.id, updatedSession);
    } catch {
      break;
    }
  }
  await updateJourneyChapterOptions(journey);
  const lastChapter = await getStorage(STORAGE_KEYS.lastChapter, "Current chapter");
  const preferredChapter = globalThis.ExamCramJourney.findChapter(journey, elements.pageChapterInput?.value)
    || globalThis.ExamCramJourney.findChapter(journey, elements.notesChapterInput?.value)
    || globalThis.ExamCramJourney.findChapter(journey, journey.lastStudySource?.chapterId)
    || globalThis.ExamCramJourney.findChapter(journey, lastChapter)
    || journey.chapters.at(-1)
    || null;
  selectChapterAcrossControls(preferredChapter?.id || "");
}

function shouldImportSavedArtifact(saved, existing) {
  if (!existing) return true;
  const savedQuestionCount = Array.isArray(saved?.questions)
    ? saved.questions.length
    : Math.max(0, Number(saved?.questionCount) || 0);
  const existingQuestionCount = Math.max(0, Number(existing?.questionCount) || 0);
  const savedHasQuiz = saved?.kind === "quiz" || saved?.itemKind === "quiz" || savedQuestionCount > 0;
  const existingHasQuiz = existing?.itemKind === "quiz" || existingQuestionCount > 0;
  if (savedHasQuiz && !existingHasQuiz) return true;
  if (savedQuestionCount > existingQuestionCount) return true;
  const savedHasVisualNote = saved?.artifactType === "study" || Boolean(saved?.visualLesson?.visualModel || saved?.hasVisualNote);
  if (savedHasVisualNote && !existing?.hasVisualNote) return true;
  const savedSubmittedAt = Date.parse(saved?.submittedAt || "") || 0;
  const existingSubmittedAt = Date.parse(existing?.submittedAt || "") || 0;
  return savedSubmittedAt > existingSubmittedAt;
}

async function updateJourneyChapterOptions(journey) {
  const chapters = Array.isArray(journey?.chapters) ? journey.chapters : [];
  const titleCounts = chapters.reduce((counts, chapter) => {
    const key = String(chapter?.title || "").toLowerCase();
    counts.set(key, (counts.get(key) || 0) + 1);
    return counts;
  }, new Map());
  [elements.pageChapterInput, elements.notesChapterInput].forEach((select) => {
    if (!select) return;
    const currentId = select.value;
    const restoreId = String(select.dataset.restoreChapterId || "");
    const restoreTitle = String(select.dataset.restoreChapterTitle || "").toLowerCase();
    const selectedChapter = chapters.find((chapter) => chapter.id === currentId)
      || chapters.find((chapter) => chapter.id === restoreId)
      || chapters.find((chapter) => chapter.title.toLowerCase() === restoreTitle)
      || null;
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = chapters.length ? "Choose a chapter" : "No chapters yet";
    const options = chapters.map((chapter) => {
      const option = document.createElement("option");
      option.value = chapter.id;
      option.dataset.chapterTitle = chapter.title;
      option.textContent = titleCounts.get(chapter.title.toLowerCase()) > 1
        ? `${chapter.title} — ${formatDate(chapter.createdAt)}`
        : chapter.title;
      return option;
    });
    select.replaceChildren(placeholder, ...options);
    select.value = selectedChapter?.id || "";
    delete select.dataset.restoreChapterId;
    delete select.dataset.restoreChapterTitle;
  });
}

function buildJourneySourceFromStudyInput(input, item) {
  if (!input || !["webpage", "video"].includes(input.sourceType)) return null;
  return {
    type: input.sourceType,
    title: input.title || item?.sourceBinding?.title || item?.title,
    url: input.sourceUrl,
    capturedAt: item?.createdAt || new Date().toISOString(),
    fingerprint: input.sourceFingerprint || input.transcriptFingerprint,
    text: input.sourceType === "webpage" ? input.rawText : "",
    documentType: input.sourceType === "webpage" ? String(input.documentType || "html").slice(0, 20) : "",
    pageCount: input.sourceType === "webpage" ? Math.max(0, Number(input.pageCount) || 0) : 0,
    segments: input.sourceType === "video" ? input.videoSegments : [],
    durationMs: input.sourceType === "video" ? input.videoSegments?.at?.(-1)?.endMs || 0 : 0,
    mediaId: input.videoMediaId || "",
    timestampConfidence: input.timestampConfidence || "",
    transcriptProvenance: input.transcriptProvenance || ""
  };
}

async function recordLearningItem(item, chapterIdOrTitle, source = null) {
  if (!globalThis.ExamCramJourney || !item) return null;
  const chapterValue = String(chapterIdOrTitle || item.journeyChapterTitle || "Current chapter").trim() || "Current chapter";
  const recorded = await mutateJourney("JOURNEY_UPSERT_SESSION", {
    chapterIdOrTitle: chapterValue,
    session: item,
    source
  });
  const chapterId = recorded.result?.chapterId;
  const chapter = globalThis.ExamCramJourney.findChapter(recorded.journey, chapterId);
  if (chapter) await setStorage(STORAGE_KEYS.lastChapter, chapter.title);
  return { ...recorded.result, journey: recorded.journey };
}

async function renderJourney() {
  if (!elements.journeyRoute || !globalThis.ExamCramJourney) return;
  const [journey, storedFocus] = await Promise.all([
    getJourney(),
    getStorage(STORAGE_KEYS.focusState, {})
  ]);
  const focusHistory = Array.isArray(storedFocus?.history) ? storedFocus.history : [];
  elements.journeyTitle.textContent = journey.title;
  if (journey.summary?.range && elements.journeyRange?.querySelector(`option[value="${journey.summary.range}"]`)) {
    elements.journeyRange.value = journey.summary.range;
  }
  const metrics = globalThis.ExamCramJourney.getMetrics(journey, focusHistory);
  elements.journeyMetrics.replaceChildren(
    renderJourneyMetric("Progress", `${metrics.progressPercent}%`),
    renderJourneyMetric("Average", metrics.averageScore == null ? "—" : `${metrics.averageScore}%`),
    renderJourneyMetric("Focus", `${metrics.focusMinutes}m`)
  );

  if (!journey.chapters.length) {
    const empty = document.createElement("div");
    empty.className = "journey-empty";
    empty.append(
      createElement("strong", "No learning chapters yet"),
      createElement("p", "Create and save a visual note from a page, pasted note, or captioned video to make your first chapter.")
    );
    const createButton = document.createElement("button");
    createButton.type = "button";
    createButton.className = "primary";
    createButton.textContent = "Create visual note";
    createButton.addEventListener("click", () => switchView("pageView"));
    empty.append(createButton);
    elements.journeyRoute.replaceChildren(empty);
    elements.journeyChapterDetail.replaceChildren();
    if (journey.summary) renderJourneySummary(journey.summary);
    return;
  }

  if (!state.selectedJourneyChapterId || !globalThis.ExamCramJourney.findChapter(journey, state.selectedJourneyChapterId)) {
    const current = journey.chapters.filter((chapter) => globalThis.ExamCramJourney.getChapterStatus(chapter) !== "completed").at(-1);
    state.selectedJourneyChapterId = (current || journey.chapters[journey.chapters.length - 1]).id;
  }

  const nodes = journey.chapters.map((chapter, index) => {
    const status = globalThis.ExamCramJourney.getChapterStatus(chapter);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "journey-node";
    button.dataset.status = status;
    button.setAttribute("aria-pressed", String(chapter.id === state.selectedJourneyChapterId));
    const date = createElement("span", formatJourneyDay(chapter.updatedAt));
    const copy = document.createElement("span");
    copy.className = "journey-node-copy";
    copy.append(createElement("strong", chapter.title), date);
    button.append(
      createElement("span", status === "completed" ? "✓" : String(index + 1), "journey-node-orb"),
      copy,
      createElement("span", formatJourneyStatus(status), "journey-node-state")
    );
    button.addEventListener("click", () => {
      state.selectedJourneyChapterId = chapter.id;
      void renderJourney();
    });
    return button;
  });
  elements.journeyRoute.replaceChildren(...nodes);
  renderJourneyChapterDetail(journey, globalThis.ExamCramJourney.findChapter(journey, state.selectedJourneyChapterId));
  if (journey.summary) renderJourneySummary(journey.summary);
}

function renderJourneyMetric(label, value) {
  const card = document.createElement("div");
  card.className = "journey-metric";
  card.append(createElement("span", label), createElement("strong", value));
  return card;
}

function renderJourneyChapterDetail(journey, chapter) {
  if (!chapter) {
    elements.journeyChapterDetail.replaceChildren();
    return;
  }
  const status = globalThis.ExamCramJourney.getChapterStatus(chapter);
  const scored = chapter.sessions.find((session) => Number.isFinite(session.score));
  const heading = document.createElement("div");
  heading.append(
    createElement("strong", chapter.title),
    createElement("p", `${formatJourneyStatus(status)} · ${chapter.sources.length} ${chapter.sources.length === 1 ? "source" : "sources"} · ${chapter.sessions.length} learning ${chapter.sessions.length === 1 ? "session" : "sessions"}`, "hint")
  );
  if (scored) heading.append(createElement("p", `Latest submitted score: ${scored.score}%`, "hint"));
  const lastSource = journey.lastStudySource?.chapterId === chapter.id
    ? journey.lastStudySource
    : null;
  if (lastSource) {
    heading.append(
      createElement("p", `Last studied source: ${lastSource.title} · ${lastSource.domain}`, "journey-last-source"),
      createElement("p", `Saved to: ${lastSource.chapter}`, "hint")
    );
  }

  const sources = document.createElement("div");
  sources.className = "journey-source-list";
  sources.append(createElement("strong", "Saved source snapshots"));
  if (!chapter.sources.length) {
    sources.append(createElement("p", `Current chapter: ${chapter.title} · No saved source yet. Create and save a visual note to add evidence.`, "hint"));
  } else {
    chapter.sources.forEach((source) => {
      const row = document.createElement("div");
      row.className = "journey-source-row";
      const sourceKind = source.type === "video" ? "Video" : source.documentType === "pdf" ? "PDF" : source.type === "notes" ? "Notes" : "Page";
      const label = createElement("span", `${sourceKind}: ${source.title}`);
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "text-button";
      remove.textContent = "Remove";
      remove.setAttribute("aria-label", `Remove ${source.title} from ${chapter.title}`);
      remove.addEventListener("click", async () => {
        await mutateJourney("JOURNEY_REMOVE_SOURCE", {
          chapterId: chapter.id,
          sourceId: source.id
        });
        showStatus("Source removed from the chapter.");
        await renderJourney();
      });
      row.append(label, remove);
      sources.append(row);
    });
  }

  const artifacts = document.createElement("div");
  artifacts.className = "journey-source-list journey-artifact-list";
  artifacts.append(createElement("strong", "Saved learning artifacts"));
  if (!chapter.sessions.length) {
    artifacts.append(createElement("p", "No saved visual notes or quizzes in this chapter yet.", "hint"));
  } else {
    [...chapter.sessions]
      .sort((first, second) => globalThis.ExamCramJourney.sessionActivityTime(second)
        - globalThis.ExamCramJourney.sessionActivityTime(first))
      .forEach((session) => {
        const row = document.createElement("div");
        row.className = "journey-source-row journey-artifact-row";
        const sourceLabel = session.sourceTitle || getHostnameLabel(session.sourceUrl) || "Saved study material";
        const copy = document.createElement("div");
        copy.className = "journey-artifact-copy";
        const meta = document.createElement("span");
        meta.className = "journey-artifact-meta";
        meta.append(
          createElement("span", formatDate(session.generatedAt), "journey-artifact-date"),
          createElement("span", `From ${sourceLabel}`, "journey-artifact-source")
        );
        copy.append(
          createElement("span", formatJourneyArtifactKind(session), "journey-artifact-kind"),
          createElement("strong", session.title, "journey-artifact-title"),
          meta
        );
        const open = document.createElement("button");
        open.type = "button";
        open.className = "text-button journey-artifact-open";
        open.textContent = "Open note";
        open.setAttribute("aria-label", `Open saved learning artifact ${session.title}`);
        open.addEventListener("click", () => void openJourneyArtifact(session.id));
        row.append(copy, open);
        artifacts.append(row);
      });
  }

  const actions = document.createElement("div");
  actions.className = "journey-detail-actions";
  const buildButton = document.createElement("button");
  buildButton.type = "button";
  buildButton.className = "primary";
  buildButton.textContent = "Build chapter visual note";
  buildButton.disabled = chapter.sources.length < 1;
  buildButton.addEventListener("click", () => void handleBuildChapterLesson(chapter.id));
  actions.append(buildButton);
  elements.journeyChapterDetail.replaceChildren(heading, artifacts, sources, actions);
}

function formatJourneyArtifactKind(session) {
  const hasQuiz = session?.itemKind === "quiz" || Number(session?.questionCount) > 0;
  if (session?.hasVisualNote && hasQuiz) return "Visual note + quiz";
  if (session?.hasVisualNote || session?.itemKind === "note") return "Visual note";
  return "Quiz evidence";
}

function getHostnameLabel(value) {
  try {
    return new URL(String(value || "")).hostname.replace(/^www\./i, "");
  } catch {
    return "";
  }
}

async function openJourneyArtifact(artifactId, options = {}) {
  const [savedItems, stagedDraft] = await Promise.all([
    getStorage(STORAGE_KEYS.sessions, []),
    options.preferDraft ? getStorage(STORAGE_KEYS.sessionDraft, null) : Promise.resolve(null)
  ]);
  const stagedArtifact = stagedDraft?.artifact || stagedDraft?.session;
  const artifact = options.preferDraft && stagedArtifact?.id === artifactId
    ? stagedArtifact
    : (Array.isArray(savedItems) ? savedItems : []).find((item) => item?.id === artifactId);
  if (!artifact) {
    showStatus("This Journey evidence record is available, but its full note is no longer in the local library.", true);
    return;
  }
  const hasQuiz = Array.isArray(artifact.questions) && artifact.questions.length > 0;
  state.submitted = Boolean(
    (options.preferDraft && stagedDraft?.submitted)
    || artifact.submittedAt
    || (artifact.score !== null && artifact.score !== undefined)
  );
  if (hasQuiz) {
    state.currentSession = artifact;
    renderSession(artifact);
  } else {
    renderNote(artifact);
  }
}

async function handleBuildChapterLesson(chapterId) {
  const generationToken = ++state.generationToken;
  setBusy(true, "Combining the chapter sources...");
  startProgress("Preparing a cross-site chapter lesson...", 10);
  try {
    const journey = await getJourney();
    const chapter = globalThis.ExamCramJourney.findChapter(journey, chapterId);
    if (!chapter?.sources.length) throw new Error("Add at least one source to this chapter first.");
    const collection = globalThis.ExamCramJourney.buildCollectionPayload(chapter);
    if (!globalThis.ExamCramDocumentReader.assessReadableContent(collection.text, "html").readable) {
      throw new Error("The collected sources do not contain enough distinct readable study content.");
    }
    showStatus(collection.condensed
      ? `Using all ${collection.includedSourceCount} sources; long sources were evenly excerpted.`
      : `Using all ${collection.includedSourceCount} collected sources.`);
    await createAndRecordStudyArtifact({
      title: `${chapter.title}: combined visual note`,
      sourceType: "collection",
      sourceUrl: "",
      rawText: collection.text,
      chapterId: chapter.id,
      chapterTitle: chapter.title,
      sourceRevisionHash: collection.sourceRevisionHash,
      collectionSources: collection.sources,
      collectionCondensed: collection.condensed,
      generationToken
    });
    finishProgress("Chapter visual note ready.");
    showStatus("Combined visual note created from the saved sources. Generate a quiz when ready.");
  } catch (error) {
    if (generationToken === state.generationToken) {
      failProgress("Chapter lesson failed.");
      showStatus(error.message, true);
    }
  } finally {
    if (generationToken === state.generationToken) setBusy(false);
  }
}

async function handleSummarizeJourney() {
  if (!globalThis.ExamCramJourney) return;
  elements.summarizeJourneyButton.disabled = true;
  showStatus("Summarizing your saved learning evidence...");
  try {
    const journey = await getJourney();
    let summary = globalThis.ExamCramJourney.summarize(journey, { range: elements.journeyRange.value });
    const settings = await getStorage(STORAGE_KEYS.settings, {});
    const endpoint = getConfiguredApiEndpoint(settings);
    const summaryEndpoint = endpoint ? deriveBackendEndpoint(endpoint, "journey-summary") : "";
    const rangeChapters = getJourneyChaptersInRange(journey, elements.journeyRange.value);
    if (summaryEndpoint && rangeChapters.length) {
      try {
        const response = await fetch(summaryEndpoint, {
          method: "POST",
          headers: getBackendHeaders(settings, summaryEndpoint),
          body: JSON.stringify({
            journeyTitle: journey.title,
            range: elements.journeyRange.value,
            revision: journey.revision,
            chapters: rangeChapters.map((chapter) => ({
              id: chapter.id,
              title: chapter.title,
              status: globalThis.ExamCramJourney.getChapterStatus(chapter),
              sourceCount: chapter.sources.length,
              sessions: chapter.sessions.map((session) => ({
                title: session.title,
                createdAt: session.createdAt,
                generatedAt: session.generatedAt,
                submittedAt: session.submittedAt,
                score: session.score,
                weakTopics: session.weakTopics,
                summary: session.summary
              })).slice(0, 8)
            })).slice(0, 24)
          })
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || "AI journey summary failed.");
        if (payload.overview && Array.isArray(payload.nextSteps)) summary = payload;
      } catch (error) {
        summary = { ...summary, fallbackReason: error.message || "AI summary unavailable." };
      }
    }
    let summaryToSave = { ...summary, range: elements.journeyRange.value, sourceRevision: journey.revision };
    let saved;
    try {
      saved = await sendJourneyWorkerMessage({
        type: "JOURNEY_SAVE_SUMMARY",
        opId: crypto.randomUUID(),
        expectedRevision: journey.revision,
        payload: { summary: summaryToSave }
      });
    } catch (error) {
      if (error.code !== "REVISION_CONFLICT") throw error;
      const latest = await getJourney();
      summaryToSave = {
        ...globalThis.ExamCramJourney.summarize(latest, { range: elements.journeyRange.value }),
        range: elements.journeyRange.value,
        sourceRevision: latest.revision,
        fallbackReason: "Journey activity changed while the AI summary was running, so this summary was refreshed locally."
      };
      saved = await sendJourneyWorkerMessage({
        type: "JOURNEY_SAVE_SUMMARY",
        opId: crypto.randomUUID(),
        expectedRevision: latest.revision,
        payload: { summary: summaryToSave }
      });
    }
    renderJourneySummary(saved.journey.summary);
    showStatus(summaryToSave.fallbackReason ? "Local journey summary ready; AI was unavailable or the Journey changed." : "Learning journey summarized.", Boolean(summaryToSave.fallbackReason));
  } catch (error) {
    showStatus(error.message || "Could not summarize this journey.", true);
  } finally {
    elements.summarizeJourneyButton.disabled = false;
  }
}

function renderJourneySummary(summary) {
  if (!elements.journeySummary || !summary) return;
  const section = (title, items) => {
    const wrapper = document.createElement("div");
    wrapper.append(createElement("strong", title));
    const list = document.createElement("ul");
    list.append(...(Array.isArray(items) ? items : []).map((item) => createElement("li", item)));
    wrapper.append(list);
    return wrapper;
  };
  elements.journeySummary.classList.remove("hidden");
  elements.journeySummary.replaceChildren(
    createElement("h3", "Your learning so far"),
    createElement("p", summary.overview || "Your learning evidence has been summarized."),
    createElement("p", summary.evidence || `Generated ${formatDate(summary.generatedAt || Date.now())}`, "journey-summary-evidence"),
    section("Progress", summary.progressHighlights || summary.learned || []),
    section("Connections", summary.recurringThemes || summary.connections || []),
    section("Still shaky", summary.knowledgeGaps || summary.weakAreas || []),
    section("Next actions", summary.nextSteps || summary.nextActions || [])
  );
}

function getJourneyChaptersInRange(journey, range) {
  const days = { week: 7, month: 30, all: Infinity }[range] || Infinity;
  const cutoff = range === "today"
    ? new Date().setHours(0, 0, 0, 0)
    : days === Infinity ? 0 : Date.now() - days * 86400000;
  return (journey?.chapters || []).map((chapter) => ({
    ...chapter,
    sessions: (chapter.sessions || []).filter((session) => (
      globalThis.ExamCramJourney.sessionActivityTime(session) >= cutoff
    ))
  })).filter((chapter) => chapter.sessions.length);
}

async function openFullJourney() {
  const url = globalThis.chrome?.runtime?.getURL
    ? globalThis.chrome.runtime.getURL("journey.html")
    : new URL("journey.html", location.href).href;
  await persistCurrentSessionDraft();
  if (globalThis.chrome?.tabs?.create) await globalThis.chrome.tabs.create({ url });
  else window.open(url, "_blank", "noopener");
}

function formatJourneyDay(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatJourneyStatus(value) {
  return { completed: "Completed", current: "In progress", review: "Needs review", planned: "Planned" }[value] || "In progress";
}

function parseFocusRulesInput(value) {
  if (!globalThis.ExamCramFocus) throw new Error("Focus utilities are unavailable.");
  const rules = String(value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      let candidate = line;
      if (/^https?:\/\//i.test(candidate)) {
        const parsed = new URL(candidate);
        candidate = `${parsed.hostname}${parsed.pathname === "/" ? "" : parsed.pathname}`;
      }
      const slashIndex = candidate.indexOf("/");
      const domain = slashIndex === -1 ? candidate : candidate.slice(0, slashIndex);
      const path = slashIndex === -1 ? "/*" : candidate.slice(slashIndex) || "/*";
      return { id: `rule-${index + 1}`, domain, path };
    });
  return globalThis.ExamCramFocus.normalizeFocusRules(rules);
}

function sendFocusMessage(message) {
  if (!globalThis.chrome?.runtime?.sendMessage) return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      const runtimeError = chrome.runtime?.lastError;
      if (runtimeError) {
        reject(new Error(runtimeError.message || "Could not contact the Focus service worker."));
        return;
      }
      if (!response?.ok) {
        const error = new Error(response?.error?.message || "Focus mode request failed.");
        error.code = response?.error?.code;
        error.origins = response?.error?.origins || [];
        reject(error);
        return;
      }
      resolve(response.state);
    });
  });
}

async function requestFocusOrigins(rules) {
  if (!globalThis.chrome?.permissions?.request) return true;
  const manifest = chrome.runtime?.getManifest?.() || {};
  try {
    globalThis.ExamCramFocus.validateFocusPermissionManifest(manifest);
    const requiredOrigins = globalThis.ExamCramFocus.getRequiredOrigins(rules);
    const containsResults = await Promise.all(requiredOrigins.map((origin) => new Promise((resolve, reject) => {
      chrome.permissions.contains({ origins: [origin] }, (contains) => {
        const runtimeError = chrome.runtime?.lastError;
        if (runtimeError) reject(new Error(runtimeError.message || "Could not inspect site-blocking permission."));
        else resolve(contains ? origin : "");
      });
    })));
    const plan = globalThis.ExamCramFocus.createFocusPermissionPlan(
      rules,
      containsResults.filter(Boolean),
      manifest
    );
    if (!plan.missingOrigins.length) return true;
    return await new Promise((resolve, reject) => {
      chrome.permissions.request({ origins: plan.missingOrigins }, (granted) => {
        const runtimeError = chrome.runtime?.lastError;
        if (runtimeError) reject(new Error(runtimeError.message || "Could not request site-blocking permission."));
        else resolve(Boolean(granted));
      });
    });
  } catch (error) {
    throw globalThis.ExamCramFocus.toFocusPermissionRequestError(error, manifest);
  }
}

async function loadFocusState() {
  if (!globalThis.ExamCramFocus) return;
  try {
    const remoteState = await sendFocusMessage({ type: globalThis.ExamCramFocus.MESSAGE_TYPES.GET_STATE });
    state.focusState = remoteState || globalThis.ExamCramFocus.normalizeFocusState(
      await getStorage(STORAGE_KEYS.focusState, null)
    );
  } catch {
    state.focusState = globalThis.ExamCramFocus.normalizeFocusState(
      await getStorage(STORAGE_KEYS.focusState, null)
    );
  }
  const reconciled = globalThis.ExamCramFocus.reconcileFocusState(state.focusState, Date.now());
  state.focusState = reconciled.state;
  if (reconciled.changed && !globalThis.chrome?.runtime?.sendMessage) {
    await setStorage(STORAGE_KEYS.focusState, state.focusState).catch(() => {});
  }
  if (state.focusState?.rules?.length && elements.focusSitesInput) {
    elements.focusSitesInput.value = state.focusState.rules.map((rule) => (
      rule.path === "/*" ? rule.domain : `${rule.domain}${rule.path}`
    )).join("\n");
  }
  const plannedMinutes = state.focusState?.active
    ? Math.round((state.focusState.endsAt - state.focusState.startedAt) / 60000)
    : state.focusState?.history?.at?.(-1)?.plannedMinutes;
  if (plannedMinutes) {
    if (elements.focusDuration?.querySelector(`option[value="${plannedMinutes}"]`)) {
      elements.focusDuration.value = String(plannedMinutes);
    } else if (elements.focusDuration?.querySelector('option[value="custom"]')) {
      elements.focusDuration.value = "custom";
      if (elements.focusCustomDuration) elements.focusCustomDuration.value = String(plannedMinutes);
    }
  }
  syncCustomFocusDurationControl();
  renderFocusState();
}

function syncCustomFocusDurationControl() {
  const customSelected = elements.focusDuration?.value === "custom";
  elements.focusCustomDurationWrap?.classList.toggle("hidden", !customSelected);
  if (elements.focusCustomDuration) {
    elements.focusCustomDuration.disabled = Boolean(state.focusState?.active) || !customSelected;
  }
}

function getSelectedFocusDurationMinutes() {
  const rawValue = elements.focusDuration?.value === "custom"
    ? elements.focusCustomDuration?.value
    : elements.focusDuration?.value;
  return globalThis.ExamCramFocus.normalizeDurationMinutes(rawValue);
}

function renderFocusState() {
  if (!elements.focusCountdown || !globalThis.ExamCramFocus) return;
  clearInterval(state.focusCountdownTimer);
  const update = () => {
    const focus = globalThis.ExamCramFocus.toPublicFocusState(state.focusState || {}, Date.now());
    const active = focus.status === "active";
    const onBreak = focus.status === "break";
    const remaining = onBreak ? focus.breakRemainingMs : focus.remainingMs;
    elements.focusQuickToggle.checked = focus.active;
    elements.focusQuickLabel.textContent = onBreak
      ? `Break ${formatTimestamp(Math.ceil(remaining / 1000))}`
      : active
        ? `Focus ${formatTimestamp(Math.ceil(remaining / 1000))}`
        : "Focus off";
    elements.focusStateBadge.textContent = onBreak ? "Break" : active ? "Active" : "Off";
    elements.focusStateBadge.classList.toggle("active", focus.active);
    let plannedSeconds = 25 * 60;
    if (!focus.active) {
      try {
        plannedSeconds = getSelectedFocusDurationMinutes() * 60;
      } catch {
        plannedSeconds = 0;
      }
    }
    elements.focusCountdown.textContent = focus.active
      ? formatTimestamp(Math.ceil(remaining / 1000))
      : plannedSeconds ? formatTimestamp(plannedSeconds) : "--:--";
    elements.focusCountdownLabel.textContent = onBreak
      ? "Five-minute recovery break"
      : active
        ? `${focus.rules.length} custom ${focus.rules.length === 1 ? "rule" : "rules"} protecting this session`
        : "Ready for a focus session";
    elements.startFocusButton.classList.toggle("hidden", focus.active);
    elements.focusBreakButton.classList.toggle("hidden", !active);
    elements.stopFocusButton.classList.toggle("hidden", !focus.active);
    elements.focusDuration.disabled = focus.active;
    syncCustomFocusDurationControl();
    elements.focusSitesInput.disabled = focus.active;
    renderFocusHistory(focus.history || []);
    if (focus.active && remaining <= 0) void loadFocusState();
  };
  update();
  if (state.focusState?.active) state.focusCountdownTimer = setInterval(update, 1000);
}

function renderFocusHistory(history) {
  if (!elements.focusHistory) return;
  const items = Array.isArray(history) ? history.slice(-3).reverse() : [];
  if (!items.length) {
    elements.focusHistory.textContent = "Completed focus sessions will appear here as elapsed session time, including breaks.";
    return;
  }
  elements.focusHistory.replaceChildren(
    createElement("strong", "Recent focus"),
    ...items.map((entry) => createElement(
      "p",
      `${globalThis.ExamCramFocus.formatElapsedFocusTime(entry.elapsedMs)} · ${entry.outcome || "stopped"} · ${new Date(entry.endedAt).toLocaleDateString()}`
    ))
  );
}

async function handleStartFocus() {
  if (!globalThis.ExamCramFocus) return;
  elements.startFocusButton.disabled = true;
  try {
    const durationMinutes = getSelectedFocusDurationMinutes();
    const rules = parseFocusRulesInput(elements.focusSitesInput.value);
    const granted = await requestFocusOrigins(rules);
    if (!granted) throw new Error("Site access was not granted, so Focus mode was not started.");
    const remoteState = await sendFocusMessage({
      type: globalThis.ExamCramFocus.MESSAGE_TYPES.START,
      durationMinutes,
      rules
    });
    if (remoteState) {
      state.focusState = remoteState;
    } else {
      const previous = await getStorage(STORAGE_KEYS.focusState, null);
      state.focusState = globalThis.ExamCramFocus.startFocusState(previous, { durationMinutes, rules }, Date.now(), crypto.randomUUID());
      await setStorage(STORAGE_KEYS.focusState, state.focusState);
    }
    renderFocusState();
    showStatus(`Focus mode started for ${durationMinutes} minutes.`);
  } catch (error) {
    await loadFocusState().catch(() => {
      elements.focusQuickToggle.checked = false;
      renderFocusState();
    });
    showStatus(error.message || "Could not start Focus mode.", true);
  } finally {
    elements.startFocusButton.disabled = false;
  }
}

async function handleStopFocus() {
  try {
    const remoteState = await sendFocusMessage({ type: globalThis.ExamCramFocus.MESSAGE_TYPES.STOP });
    state.focusState = remoteState || globalThis.ExamCramFocus.stopFocusState(state.focusState, Date.now(), "stopped");
    if (!remoteState) await setStorage(STORAGE_KEYS.focusState, state.focusState);
    renderFocusState();
    showStatus("Focus mode ended. Blocking rules were removed.");
    await renderJourney();
  } catch (error) {
    await loadFocusState().catch(() => renderFocusState());
    showStatus(error.message || "Could not end Focus mode.", true);
  }
}

async function handleFocusBreak() {
  try {
    const remoteState = await sendFocusMessage({ type: globalThis.ExamCramFocus.MESSAGE_TYPES.BREAK });
    state.focusState = remoteState || globalThis.ExamCramFocus.applyFiveMinuteBreak(state.focusState, Date.now());
    if (!remoteState) await setStorage(STORAGE_KEYS.focusState, state.focusState);
    renderFocusState();
    showStatus("Five-minute break started. Distracting-site rules are temporarily paused.");
  } catch (error) {
    await loadFocusState().catch(() => renderFocusState());
    showStatus(error.message || "Could not start a focus break.", true);
  }
}

async function handleQuickFocusToggle() {
  if (elements.focusQuickToggle.checked) await handleStartFocus();
  else await handleStopFocus();
}

async function handleClearLibrary() {
  await setStorage(STORAGE_KEYS.sessions, []);
  renderLibrary();
  showStatus("Library cleared.");
}

function closeSession() {
  void removeStorage(STORAGE_KEYS.sessionDraft).catch(() => {});
  cleanupVisualModelRenderer();
  state.currentSession = null;
  state.currentArtifact = null;
  state.currentExportItem = null;
  state.submitted = false;
  updatePinnedArtifactControl();
  elements.resultView.classList.add("hidden");
  elements.resultView.setAttribute("aria-hidden", "true");
  switchView("pageView");
}

function openPinnedArtifact() {
  const artifact = state.currentArtifact || state.currentSession || state.currentExportItem;
  if (!artifact) return;
  if (Array.isArray(artifact.questions) && artifact.questions.length) {
    state.currentSession = artifact;
    renderSession(artifact);
  } else {
    renderNote(artifact);
  }
}

function updatePinnedArtifactControl() {
  if (!elements.openPinnedArtifactButton) return;
  const artifact = state.currentArtifact || state.currentSession || state.currentExportItem;
  elements.openPinnedArtifactButton.classList.toggle("hidden", !artifact);
  if (artifact) elements.openPinnedArtifactButton.textContent = "Open pinned note";
}

async function openSettings() {
  const settings = await getStorage(STORAGE_KEYS.settings, {});
  applySettingsToForm(settings);
  elements.settingsDialog.showModal();
}

async function loadSettings() {
  const settings = await getStorage(STORAGE_KEYS.settings, {});
  applySettingsToForm(settings);
}

function applySettingsToForm(settings = {}) {
  const endpoint = getConfiguredApiEndpoint(settings);
  const token = String(settings.backendAccessToken || "");
  elements.apiEndpointInput.value = endpoint;
  elements.apiEndpointInput.dataset.backendTokenOrigin = String(settings.backendTokenOrigin || (token ? getEndpointOrigin(endpoint) : ""));
  if (elements.backendTokenInput) elements.backendTokenInput.value = token;
}

function handleBackendEndpointChange() {
  const previousOrigin = String(elements.apiEndpointInput?.dataset.backendTokenOrigin || "");
  let nextOrigin = "";
  try {
    nextOrigin = getEndpointOrigin(normalizeSafeBackendEndpoint(elements.apiEndpointInput?.value || ""));
  } catch {
    return;
  }
  if (previousOrigin && previousOrigin !== nextOrigin && elements.backendTokenInput?.value) {
    elements.backendTokenInput.value = "";
    showStatus("The saved backend token was cleared because the backend origin changed.");
  }
  if (elements.apiEndpointInput) elements.apiEndpointInput.dataset.backendTokenOrigin = nextOrigin;
}

async function saveSettings(event) {
  event?.preventDefault();
  const apiEndpointInput = elements.apiEndpointInput.value.trim();
  let backendAccessToken = elements.backendTokenInput?.value.trim() || "";
  try {
    const previousSettings = await getStorage(STORAGE_KEYS.settings, {});
    const apiEndpoint = normalizeSafeBackendEndpoint(apiEndpointInput);
    const permitted = await requestEndpointPermission(apiEndpoint);
    if (!permitted) {
      showStatus("Permission was not granted for that backend endpoint.", true);
      return;
    }
    const nextOrigin = getEndpointOrigin(apiEndpoint);
    const previousToken = String(previousSettings.backendAccessToken || "").trim();
    const previousOrigin = String(previousSettings.backendTokenOrigin
      || (previousToken ? getEndpointOrigin(getConfiguredApiEndpoint(previousSettings)) : ""));
    if (backendAccessToken && previousToken && backendAccessToken === previousToken && previousOrigin && previousOrigin !== nextOrigin) {
      backendAccessToken = "";
      await setStorage(STORAGE_KEYS.settings, { apiEndpoint, backendAccessToken: "", backendTokenOrigin: "" });
      if (elements.backendTokenInput) elements.backendTokenInput.value = "";
      if (elements.apiEndpointInput) elements.apiEndpointInput.dataset.backendTokenOrigin = nextOrigin;
      showStatus("Backend origin changed. The old token was removed; enter this backend's token again if it requires one.", true);
      return;
    }
    const backendTokenOrigin = backendAccessToken ? nextOrigin : "";
    await setStorage(STORAGE_KEYS.settings, { apiEndpoint, backendAccessToken, backendTokenOrigin });
    if (elements.apiEndpointInput) elements.apiEndpointInput.dataset.backendTokenOrigin = backendTokenOrigin;
    elements.settingsDialog.close();
    showStatus(apiEndpoint ? "Backend settings saved." : "Local-only mode enabled.");
  } catch (error) {
    showStatus(error.message || "Could not save backend settings.", true);
  }
}

function requestEndpointPermission(endpoint) {
  if (!endpoint) return Promise.resolve(true);
  let url;
  try {
    url = new URL(normalizeSafeBackendEndpoint(endpoint));
  } catch (error) {
    return Promise.reject(error);
  }
  if (!globalThis.chrome?.permissions?.request) return Promise.resolve(true);
  if (isLoopbackBackendHost(url.hostname)) return Promise.resolve(true);
  const bareHostname = url.hostname.replace(/^\[|\]$/g, "");
  const matchHostname = bareHostname.includes(":") ? `[${bareHostname}]` : bareHostname;
  const originPattern = `${url.protocol}//${matchHostname}/*`;
  return new Promise((resolve, reject) => {
    chrome.permissions.request({ origins: [originPattern] }, (granted) => {
      const runtimeError = chrome.runtime?.lastError;
      if (runtimeError) {
        reject(new Error(runtimeError.message || "Could not request endpoint permission."));
        return;
      }
      resolve(Boolean(granted));
    });
  });
}

function getConfiguredApiEndpoint(settings) {
  const value = Object.prototype.hasOwnProperty.call(settings || {}, "apiEndpoint")
    ? String(settings.apiEndpoint || "").trim()
    : DEFAULT_API_ENDPOINT;
  try {
    return normalizeSafeBackendEndpoint(value);
  } catch {
    return "";
  }
}

function isLoopbackBackendHost(hostname) {
  const normalized = String(hostname || "").trim().toLowerCase().replace(/^\[|\]$/g, "");
  return ["127.0.0.1", "localhost", "::1"].includes(normalized);
}

function getEndpointOrigin(value) {
  try {
    return new URL(String(value || "")).origin;
  } catch {
    return "";
  }
}

function normalizeSafeBackendEndpoint(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  let endpoint;
  try {
    endpoint = new URL(raw);
  } catch {
    throw new Error("Enter a valid backend URL or leave it empty for local-only mode.");
  }
  if (endpoint.protocol !== "https:" && !(endpoint.protocol === "http:" && isLoopbackBackendHost(endpoint.hostname))) {
    throw new Error("Remote backend URLs must use HTTPS. Plain HTTP is allowed only for localhost.");
  }
  endpoint.username = "";
  endpoint.password = "";
  return endpoint.toString();
}

function normalizeSafeExternalUrl(value, options = {}) {
  try {
    const url = new URL(String(value || ""));
    const allowedProtocols = options.allowFile ? ["http:", "https:", "file:"] : ["http:", "https:"];
    if (!allowedProtocols.includes(url.protocol)) return "";
    if (url.protocol === "file:" && !options.allowFile) return "";
    url.username = "";
    url.password = "";
    return url.href;
  } catch {
    return "";
  }
}

async function openSafeExternalUrl(value, options = {}) {
  const safeUrl = normalizeSafeExternalUrl(value, options);
  if (!safeUrl) throw new Error("The saved source link is not a safe URL.");
  if (globalThis.chrome?.tabs?.create) await globalThis.chrome.tabs.create({ url: safeUrl });
  else window.open(safeUrl, "_blank", "noopener");
  return safeUrl;
}

function getBackendHeaders(settings = {}, endpoint = "", extraHeaders = {}) {
  const headers = { "Content-Type": "application/json", ...extraHeaders };
  const token = String(settings?.backendAccessToken || "").trim();
  const requestOrigin = getEndpointOrigin(endpoint);
  const configuredOrigin = getEndpointOrigin(getConfiguredApiEndpoint(settings));
  const tokenOrigin = String(settings?.backendTokenOrigin || configuredOrigin);
  if (token && requestOrigin && requestOrigin === tokenOrigin) headers.Authorization = `Bearer ${token}`;
  return headers;
}


function startProgress(label, percent = 5) {
  clearProgressTimer();
  elements.progressWrap.classList.remove("hidden");
  elements.progressWrap.setAttribute("aria-hidden", "false");
  updateGenerationProgress(percent, label);
}

function updateGenerationProgress(percent, label) {
  const safePercent = Math.max(0, Math.min(100, percent));
  elements.progressBar.style.width = `${safePercent}%`;
  elements.progressLabel.textContent = label;
}

function startSimulatedProgress(start, max, label) {
  updateGenerationProgress(start, label);
  let current = start;
  clearProgressTimer();
  state.progressTimer = setInterval(() => {
    const remaining = max - current;
    if (remaining <= 0.4) return;
    current += Math.max(0.35, remaining * 0.08);
    updateGenerationProgress(current, label);
  }, 700);

  return () => clearProgressTimer();
}

function finishProgress(label) {
  clearProgressTimer();
  updateGenerationProgress(100, label);
  setTimeout(() => {
    elements.progressWrap.classList.add("hidden");
    elements.progressWrap.setAttribute("aria-hidden", "true");
    elements.progressBar.style.width = "0%";
  }, 900);
}

function failProgress(label) {
  clearProgressTimer();
  if (!elements.progressWrap.classList.contains("hidden")) {
    updateGenerationProgress(100, label || "Generation failed.");
    setTimeout(() => {
      elements.progressWrap.classList.add("hidden");
      elements.progressWrap.setAttribute("aria-hidden", "true");
      elements.progressBar.style.width = "0%";
    }, 900);
  }
}

function clearProgressTimer() {
  if (state.progressTimer) {
    clearInterval(state.progressTimer);
    state.progressTimer = null;
  }
}

function setBusy(isBusy, message = "") {
  elements.studyPageButton.disabled = isBusy;
  if (elements.studyVideoButton) elements.studyVideoButton.disabled = isBusy || (!state.detectedSource?.hasVideo && !elements.videoTranscriptInput?.value.trim());
  if (elements.addCurrentSourceButton) elements.addCurrentSourceButton.disabled = isBusy;
  elements.studyNotesButton.disabled = isBusy;
  if (elements.demoNoteButton) elements.demoNoteButton.disabled = isBusy;
  if (message) showStatus(message);
}

function showStatus(message, isError = false) {
  elements.statusText.textContent = message;
  elements.statusText.classList.toggle("is-error", isError);
}

function createElement(tagName, text, className = "") {
  const element = document.createElement(tagName);
  element.textContent = text;
  if (className) element.className = className;
  return element;
}

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatTimestamp(value) {
  if (globalThis.ExamCramJourney?.formatTimestamp) {
    return globalThis.ExamCramJourney.formatTimestamp(value);
  }
  const total = Math.max(0, Math.round(Number(value) || 0));
  const minutes = Math.floor(total / 60);
  return `${minutes}:${String(total % 60).padStart(2, "0")}`;
}

function cssEscape(value) {
  if (window.CSS?.escape) return CSS.escape(value);
  return value.replace(/"/g, '\\"');
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
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (result) => resolve(result[key] ?? fallback));
  });
}

function setStorage(key, value) {
  if (!globalThis.chrome?.storage?.local) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Local preview storage can be unavailable for restricted file URLs.
    }
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [key]: value }, () => {
      const runtimeError = chrome.runtime?.lastError;
      if (runtimeError) {
        reject(new Error(runtimeError.message || "Could not save extension data."));
        return;
      }
      resolve();
    });
  });
}

function removeStorage(keys) {
  const keysToRemove = Array.isArray(keys) ? keys : [keys];
  if (!keysToRemove.length) return Promise.resolve();
  if (!globalThis.chrome?.storage?.local) {
    for (const key of keysToRemove) {
      try {
        localStorage.removeItem(key);
      } catch {
        // Local preview storage can be unavailable for restricted file URLs.
      }
    }
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove(keysToRemove, () => {
      const runtimeError = chrome.runtime?.lastError;
      if (runtimeError) {
        reject(new Error(runtimeError.message || "Could not remove extension data."));
        return;
      }
      resolve();
    });
  });
}

function pruneExpiredExportPayloads(maxAgeMs = 60 * 60 * 1000) {
  const prefix = `${STORAGE_KEYS.exportPayload}:`;
  const cutoff = Date.now() - maxAgeMs;
  const isExpired = (value) => {
    const expiresAt = Date.parse(value?.expiresAt || "");
    if (Number.isFinite(expiresAt)) return expiresAt <= Date.now();
    const exportedAt = Date.parse(value?.exportedAt || "");
    return !Number.isFinite(exportedAt) || exportedAt < cutoff;
  };

  if (!globalThis.chrome?.storage?.local) {
    const staleKeys = [];
    try {
      for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index);
        if (!key?.startsWith(prefix)) continue;
        let payload;
        try {
          payload = JSON.parse(localStorage.getItem(key) || "null");
        } catch {
          payload = null;
        }
        if (isExpired(payload)) staleKeys.push(key);
      }
    } catch {
      return Promise.resolve();
    }
    return removeStorage(staleKeys);
  }

  return new Promise((resolve, reject) => {
    chrome.storage.local.get(null, (items) => {
      const runtimeError = chrome.runtime?.lastError;
      if (runtimeError) {
        reject(new Error(runtimeError.message || "Could not inspect export data."));
        return;
      }
      const staleKeys = Object.entries(items || {})
        .filter(([key, value]) => key.startsWith(prefix) && isExpired(value))
        .map(([key]) => key);
      removeStorage(staleKeys).then(resolve, reject);
    });
  });
}
