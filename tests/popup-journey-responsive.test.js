const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const styles = fs.readFileSync(path.join(__dirname, "..", "popup.css"), "utf8");
const script = fs.readFileSync(path.join(__dirname, "..", "popup.js"), "utf8");
const html = fs.readFileSync(path.join(__dirname, "..", "popup.html"), "utf8");

test("one import input routes every file selection through Smart Import", () => {
  assert.doesNotMatch(html, /id="openDocumentButton"|id="documentFileInput"/);
  assert.match(html, /id="bulkImportButton"[^>]*>[\s\S]{0,500}>Import Files</);
  assert.match(html, /id="bulkImportInput"[^>]*type="file"[^>]*multiple[^>]*accept="[^"]*\.html[^"]*\.pdf/);
  assert.match(script, /bulkImportInput:\s*document\.getElementById\("bulkImportInput"\)/);
  assert.match(script, /bulkImportInput\?\.addEventListener\("change", handleBulkImportSelected\)/);
  assert.doesNotMatch(script, /activateSingleFileImport/);
  assert.match(script, /if \(selectedFiles\.length > 12\)/);
});

test("single and multi-file imports share the bounded extraction helper", () => {
  assert.match(script, /async function readImportedDocument\(file\)\s*\{\s*return extractDocumentSource\(file\);\s*\}/);
  assert.match(script, /for \(let index = 0; index < selectedFiles\.length; index \+= 1\)[\s\S]*?readImportedDocument\(file\)/);
});

test("Smart Import rejects selections above twelve before reading", () => {
  assert.match(script, /if \(selectedFiles\.length > 12\)\s*\{[\s\S]*?Import supports up to 12 files at a time\./);
  assert.match(script, /async function handleBulkImportSelected\(event\)[\s\S]*?for \(let index = 0; index < selectedFiles\.length; index \+= 1\)/);
});

test("Smart Import falls back to the deterministic local classifier", () => {
  assert.match(script, /catch\s*\{[\s\S]*?NeatMindJourney\.classifySourcesLocally\(readableFiles, journey\)/);
});

test("Smart Import sends only excerpt data to the source classifier", () => {
  assert.match(script, /async function classifyImportSourcesWithBackend[\s\S]*?files: files\.map\(\(\{ fileId, excerpt \}\) => \(\{ fileId, excerpt \}\)\)[\s\S]*?existingChapters:[\s\S]*?chapterHints:/);
});

test("Smart Import passes all assignments through the capacity planner", () => {
  assert.match(script, /NeatMindJourney\.planBulkFiling\(plannedAssignments, journey\)/);
  assert.match(script, /state\.pendingImport = \{[\s\S]*?files,[\s\S]*?plan: globalThis\.NeatMindJourney\.planBulkFiling\(assignments, journey\)/);
  assert.match(script, /pending\.assignments = plannedAssignments;[\s\S]*?pending\.plan = plan;/);
});

test("backend endpoint rewriting supports source classification", () => {
  assert.match(script, /journey-summary\|classify-sources\|video-transcript/);
  assert.match(script, /deriveBackendEndpoint\(configuredEndpoint, "classify-sources"\)/);
});

test("Smart Import re-plans capacity whenever a chapter dropdown changes", () => {
  assert.match(script, /select\.addEventListener\("change", \(event\) => \{[\s\S]*?pending\.plan = globalThis\.NeatMindJourney\.planBulkFiling\(pending\.assignments, pending\.journey\);[\s\S]*?renderImportReview\(\)/);
  assert.match(script, /openNewChapterDialog\(event, \{ importFileId: row\.fileId \}\)/);
  assert.match(script, /if \(importFileId\)[\s\S]*?Assigned by you during import review\.[\s\S]*?planBulkFiling/);
});

test("Smart Import cannot confirm while chapter-cap rows remain blocked", () => {
  assert.match(script, /confirm\.disabled = retryingCount > 0 \|\| processingCount > 0 \|\| pending\.plan\.blockedCount > 0 \|\| importableCount === 0/);
  assert.match(script, /async function handleConfirmImport\(\)[\s\S]*?if \(pending\.plan\.blockedCount > 0\) \{[\s\S]*?return;/);
  assert.match(script, /pending\.files\.some\(\(file\) => \["uploading", "reading", "detecting", "retrying"\]\.includes\(file\.status\)\)/);
  assert.match(script, /if \(!pending\.plan\.rows\.some\(\(row\) => !row\.skipped && !row\.blocked\)\)/);
  assert.match(script, /section\?\.querySelectorAll\("button, select"\)\.forEach\(\(control\) => \{\s*control\.disabled = true;/);
  assert.match(script, /footerSummary\.textContent = "Importing files…"/);
  assert.match(script, /if \(activeSection && state\.pendingImport === pending\) renderImportReview\(\)/);
});

test("Smart Import confirms sources through the existing Journey add-source operation", () => {
  assert.match(script, /function saveImportedSourceToChapter\(chapterTitle, source, journey\)[\s\S]*?mutateJourney\("JOURNEY_ADD_SOURCE"/);
  assert.match(script, /const source = buildImportedChapterSource\(file, detectedChapter\)/);
  assert.match(script, /const added = await saveImportedSourceToChapter\(chapterTitle, source, pending\.journey\)/);
  assert.match(script, /findImportChapterByKey\(pending\.journey, source\.importKey\)/);
  assert.match(script, /startImportNoteQueue\(\[\.\.\.affectedChapterIds\]\)/);
});

test("Smart Import identifies exact re-uploads before reserving chapter capacity", () => {
  assert.match(script, /function isImportSourceAlreadySaved\(file, assignment, journey\)[\s\S]*?source\.fingerprint === sourceFingerprint/);
  assert.match(script, /assignment\?\.alreadySaved[\s\S]*?This source is already saved and will not be imported again\./);
  assert.match(script, /refreshImportDuplicateAssignments\(pending, pending\.journey\);[\s\S]*?planBulkFiling\(pending\.assignments, pending\.journey\)/);
});

test("Smart Import review is accessible, compact, and uses semantic UI tokens", () => {
  assert.match(script, /section\.setAttribute\("aria-label", "Review imported files"\)/);
  assert.match(script, /const select = document\.createElement\("select"\)/);
  assert.match(script, /status\.setAttribute\("aria-label", `\$\{statusLabel\} import status`\)/);
  assert.match(styles, /\.smart-import\s*\{[\s\S]*?max-height:[\s\S]*?overflow-y:\s*auto;[\s\S]*?background:\s*var\(--ui-surface\);/);
  assert.match(styles, /\.smart-import__group--check\s*\{[\s\S]*?background:\s*var\(--ui-warning-tint\);/);
  assert.match(styles, /\.smart-import__message--danger\s*\{[\s\S]*?color:\s*var\(--ui-danger\);/);
});

test("Smart Import matches the compact folder-and-status review hierarchy", () => {
  assert.match(script, /page-composer--reviewing/);
  assert.match(script, /Review & Confirm Import/);
  assert.match(script, /function groupImportReviewEntries\(entries\)/);
  assert.match(script, /function renderImportReviewFolderGroup\(cluster, pending\)/);
  assert.match(script, /createElement\("span", "Imported file"\)/);
  assert.match(script, /createElement\("span", "Destination and actions"\)/);
  assert.match(script, /move\.textContent = "Move"/);
  assert.match(script, /smart-import__groups/);
  assert.match(styles, /#pageView \.page-composer--reviewing > :not\(\.smart-import\)/);
  assert.match(styles, /#pageView \.page-composer--reviewing \.smart-import\s*\{[\s\S]*?position:\s*fixed;/);
  assert.match(styles, /#pageView \.smart-import__row-actions\s*\{/);
  assert.match(styles, /#pageView \.smart-import__confirm\s*\{[\s\S]*?var\(--ui-success\)/);
  assert.match(styles, /#pageView \.smart-import__cluster\s*\{/);
  assert.match(styles, /#pageView \.smart-import__footer-actions\s*\{/);
});

test("Smart Import renders every selected file even when planning state is incomplete", () => {
  const start = script.indexOf("function getPendingImportReviewEntries(pending)");
  const end = script.indexOf("function renderImportReview()", start);
  assert.ok(start >= 0 && end > start);
  const helper = vm.runInNewContext(`(() => {
    ${script.slice(start, end)}
    return getPendingImportReviewEntries;
  })()`);
  const files = Array.from({ length: 11 }, (_, index) => ({
    fileId: `file-${index}`,
    fileName: `Chapter ${index}.html`,
    skipped: false
  }));
  const entries = helper({
    files,
    assignments: [{ fileId: "file-0", confidence: 0.9 }],
    plan: { rows: [{ fileId: "file-0", skipped: false, blocked: false, confidence: 0.9 }] },
    retryingFileIds: new Set(["file-10"])
  });
  assert.equal(entries.length, 11);
  assert.equal(entries[0].row.blocked, false);
  assert.equal(entries[10].row.blocked, true);
  assert.equal(entries[10].retrying, true);
});

test("Smart Import keeps errors visible and exposes retry, remove, confirm, and cancel", () => {
  assert.match(script, /originalFile: file,[\s\S]*?status: "failed",[\s\S]*?error:/);
  assert.match(script, /file\?\.error \|\| "This file could not be read safely\."/);
  assert.match(script, /message\.setAttribute\("role", "alert"\)/);
  assert.match(script, /retry\.textContent = "Retry"[\s\S]*?retryImportReviewFile\(row\.fileId\)/);
  assert.match(script, /remove\.textContent = "Remove"[\s\S]*?removeImportReviewFile\(row\.fileId\)/);
  assert.match(script, /cancel\.textContent = "Cancel"[\s\S]*?cancelImportReview/);
  assert.match(script, /confirm\.textContent = "Confirm Import"[\s\S]*?handleConfirmImport/);
  assert.match(script, /async function retryImportReviewFile\(fileId\)[\s\S]*?readImportedDocument\(file\.originalFile\)[\s\S]*?rebuildPendingImportPlan\(pending\)/);
  assert.match(script, /file\?\.status === "failed"[\s\S]*?stats\.failed \+= 1/);
  assert.match(script, /if \(stats\.failed\) parts\.push\(`\$\{stats\.failed\} failed`\)/);
  assert.match(script, /excludedCount[\s\S]*?skipped or need attention/);
});

test("Smart Import review owns a stable viewport grid with isolated scrolling", () => {
  assert.match(styles, /#pageView \.page-composer--reviewing\s*\{[\s\S]*?animation:\s*none !important;[\s\S]*?transform:\s*none !important;/);
  assert.match(styles, /#pageView \.page-composer--reviewing \.smart-import\s*\{[\s\S]*?position:\s*fixed;[\s\S]*?height:\s*100dvh;[\s\S]*?grid-template-rows:\s*auto auto minmax\(0, 1fr\) auto;[\s\S]*?overflow:\s*hidden;/);
  assert.match(styles, /@media \(max-width: 640px\)\s*\{[\s\S]*?#pageView \.page-composer--reviewing \.smart-import\s*\{[\s\S]*?grid-template-rows:\s*auto minmax\(0, 1fr\) auto;/);
  assert.match(styles, /#pageView \.smart-import__groups\s*\{[\s\S]*?min-height:\s*0;[\s\S]*?overflow-y:\s*auto;[\s\S]*?overscroll-behavior:\s*contain;[\s\S]*?scrollbar-gutter:\s*stable;/);
  assert.match(styles, /#pageView \.smart-import__footer\s*\{[\s\S]*?justify-content:\s*space-between;/);
});

test("Journey metrics use semantic single surfaces with container-based reflow", () => {
  const metricCard = styles.match(/#journeyView \.journey-metrics \.journey-metric\s*\{[\s\S]*?\n\}/)?.[0] || "";
  assert.match(styles, /#journeyView\s*\{[\s\S]*?container-name:\s*journey-metrics;[\s\S]*?container-type:\s*inline-size;/);
  assert.match(styles, /#journeyView \.journey-metrics\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\);[\s\S]*?gap:\s*16px;/);
  assert.match(metricCard, /min-height:\s*280px;[\s\S]*?overflow:\s*hidden;[\s\S]*?border:\s*1px solid color-mix\(in srgb, var\(--journey-metric-color\) 12%, var\(--ui-separator\)\);[\s\S]*?border-radius:\s*12px;[\s\S]*?padding:\s*20px;[\s\S]*?background:\s*var\(--journey-metric-surface-bg\);/);
  assert.match(metricCard, /--journey-metric-surface-bg:\s*color-mix\(in srgb, var\(--journey-metric-wash\) 22%, var\(--ui-surface\)\);/);
  assert.doesNotMatch(metricCard, /linear-gradient/);
  assert.match(styles, /#journeyView \.journey-metric__copy\s*\{[\s\S]*?display:\s*grid;[\s\S]*?max-width:\s*58%;[\s\S]*?gap:\s*6px;/);
  assert.match(styles, /#journeyView \.journey-metric \.journey-metric__label\s*\{[\s\S]*?font-size:\s*0\.75rem;[\s\S]*?font-weight:\s*600;[\s\S]*?letter-spacing:\s*0\.06em;/);
  assert.match(styles, /#journeyView \.journey-metric \.journey-metric__value\s*\{[\s\S]*?font-size:\s*2\.25rem;[\s\S]*?font-weight:\s*700;[\s\S]*?letter-spacing:\s*-0\.02em;/);
  assert.match(styles, /#journeyView \.journey-metric \.journey-metric__detail\s*\{[\s\S]*?border:\s*0;[\s\S]*?background:\s*transparent;[\s\S]*?font-size:\s*0\.87rem;[\s\S]*?font-weight:\s*500;/);
  assert.match(styles, /#journeyView \.journey-metric__visual\s*\{[\s\S]*?position:\s*absolute;[\s\S]*?right:\s*0;[\s\S]*?bottom:\s*0;[\s\S]*?pointer-events:\s*none;/);
  assert.match(styles, /#journeyView \.journey-metric--average \.journey-metric__visual\s*\{[\s\S]*?width:\s*136px;[\s\S]*?right:\s*-4px;/);
  assert.match(styles, /\.journey-hourglass__reservoir\s*\{[\s\S]*?mask-mode:\s*luminance;/);
  assert.match(styles, /\.journey-hourglass--average \.journey-hourglass__reservoir--top\s*\{[\s\S]*?top:\s*8\.4%;[\s\S]*?left:\s*15%;[\s\S]*?width:\s*70%;/);
  assert.match(styles, /\.journey-hourglass--average \.journey-hourglass__reservoir--bottom\s*\{[\s\S]*?top:\s*52\.6%;[\s\S]*?left:\s*15%;[\s\S]*?width:\s*70%;/);
  assert.match(styles, /#journeyView \.journey-metric--focus \.journey-metric__visual\s*\{[\s\S]*?width:\s*174px;[\s\S]*?right:\s*-4px;/);
  assert.match(styles, /@container journey-metrics \(min-width: 500px\)\s*\{[\s\S]*?#journeyView \.journey-metrics\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\);[\s\S]*?#journeyView \.journey-metric--progress\s*\{[\s\S]*?grid-column:\s*1 \/ -1;/);
  assert.match(styles, /@container journey-metrics \(min-width: 720px\)\s*\{[\s\S]*?#journeyView \.journey-metrics\s*\{[\s\S]*?grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\);[\s\S]*?#journeyView \.journey-metric--progress\s*\{[\s\S]*?grid-column:\s*auto;/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)\s*\{[\s\S]*?#journeyView \.journey-metric,[\s\S]*?#journeyView \.journey-metric__visual,[\s\S]*?transition:\s*none !important;/);
  assert.match(script, /function getJourneyMetricStateClass\(kind, tone, hasMetricValue = false\)/);
  assert.match(script, /return "state-attention";/);
  assert.match(script, /return tone\?\.key === "unscored" \? "state-ready" : "state-performance";/);
  assert.match(script, /card\.className = \["journey-metric", "journey-metric--" \+ kind, stateClass\]\.join\(" "\);/);
  assert.match(script, /visual\.setAttribute\("aria-hidden", "true"\);/);
  assert.doesNotMatch(script, /journey-metric__focus-value/);
});

test("Smart Import generates affected chapter notes sequentially", () => {
  assert.match(script, /async function startImportNoteQueue\(chapterIds\)[\s\S]*?for \(const row of queue\.rows\) \{[\s\S]*?await runImportNoteQueueRow\(queue, row\)/);
  assert.match(script, /async function runImportNoteQueueRow\(queue, row\)[\s\S]*?await handleBuildChapterLesson\(row\.chapterId, \{[\s\S]*?rethrow: true/);
  assert.match(script, /handleBuildChapterLesson\(row\.chapterId, \{[\s\S]*?quietStatus: true/);
  assert.match(script, /if \(!options\.quietStatus\) showStatus\(error\.message, true\)/);
  assert.doesNotMatch(script, /requireAiBackend|IMPORT_NOTE_BACKEND_UNAVAILABLE/);
});

test("Smart Import note failures expose a single-chapter Retry control", () => {
  assert.match(script, /if \(\["failed", "done"\]\.includes\(row\.status\)\) \{[\s\S]*?retry\.textContent = row\.status === "done" \? "Regenerate" : "Retry"[\s\S]*?retryImportNoteChapter\(queue\.id, row\.chapterId\)/);
  assert.match(script, /async function retryImportNoteChapter\(queueId, chapterId\)[\s\S]*?await runImportNoteQueueRow\(queue, row\)/);
  assert.match(script, /\["failed", "done"\]\.includes\(item\.status\)/);
});

test("Smart Import saves a local fallback note instead of leaving a source-only tree", async () => {
  const queueStart = script.indexOf("async function startImportNoteQueue(chapterIds)");
  const queueEnd = script.indexOf("async function runImportNoteQueueRow(queue, row)", queueStart);
  const rowStart = queueEnd;
  const rowEnd = script.indexOf("function renderImportNoteQueue(queue)", rowStart);
  assert.ok(queueStart >= 0 && queueEnd > queueStart && rowEnd > rowStart);

  const queueSource = script.slice(queueStart, queueEnd);
  assert.match(queueSource, /if \(queue\.dismissed\) break/);
  assert.doesNotMatch(queueSource, /getConfiguredApiEndpoint|Generate .* later/);

  const buildCalls = [];
  const renders = [];
  const runRow = vm.runInNewContext(`(${script.slice(rowStart, rowEnd).trim()})`, {
    handleBuildChapterLesson: async (chapterId, options) => {
      buildCalls.push({ chapterId, options });
      return { id: "local-note", usedLocalFallback: true };
    },
    updateImportChapterResourceStatus: async () => {},
    renderImportNoteQueue: (queue) => renders.push(queue)
  });
  const queue = { id: "queue-local" };
  const row = { chapterId: "chapter-pdf", status: "pending", message: "Waiting" };
  const outcome = await runRow(queue, row);

  assert.equal(outcome, "local-fallback");
  assert.equal(row.status, "done");
  assert.equal(row.message, "Local backup learning resources saved");
  assert.equal(buildCalls.length, 1);
  assert.equal(buildCalls[0].chapterId, "chapter-pdf");
  assert.equal(buildCalls[0].options.rethrow, true);
  assert.equal(buildCalls[0].options.quietStatus, true);
  assert.equal(Object.hasOwn(buildCalls[0].options, "requireAiBackend"), false);
  assert.ok(renders.length >= 2);
  assert.match(script, /dismissImportNoteQueue\(queue\.id\)/);
  assert.match(styles, /\.smart-import-notes\s*\{[\s\S]*?background:\s*var\(--ui-surface-elevated\);/);
});

test("Smart Import splits PDFs into stable chapter records and retries only missing ranges", () => {
  assert.match(script, /detectedChapters: normalizeImportedChapterCandidates\(source\)/);
  assert.match(script, /for \(const detectedChapter of detectedChapters\)/);
  assert.match(script, /pageStart,[\s\S]*?pageEnd,[\s\S]*?fileId,[\s\S]*?fileFingerprint,[\s\S]*?importKey/);
  assert.match(script, /importKeys\.every\(\(importKey\) => Boolean\(findImportChapterByKey\(journey, importKey\)\)\)/);
  assert.match(script, /const fileId = `file-\$\{makeContentFingerprint\(fileFingerprint \|\| file\?\.fileName \|\| "document"\)\}`/);
  assert.match(script, /processedChapterCount \+= 1[\s\S]*?importProgress\.value = processedChapterCount/);
  assert.match(script, /buildAutomaticStudyResources[\s\S]*?keyConcepts,[\s\S]*?definitions,[\s\S]*?formulas,[\s\S]*?examples,[\s\S]*?reviewQuestions/);
});

test("compact Journey artifacts use separate readable title and provenance fields", () => {
  assert.match(script, /copy\.className = "journey-artifact-copy"/);
  assert.match(script, /"journey-artifact-kind"/);
  assert.match(script, /"journey-artifact-title"/);
  assert.match(script, /"journey-artifact-date"/);
  assert.match(script, /"journey-artifact-source"/);
  assert.match(script, /open\.addEventListener\("click", \(\) => void openJourneyArtifact\(session\.id\)\)/);
});

test("Journey presents a newest-first, de-duplicated artifact timeline", () => {
  assert.match(html, /aria-label="Chapter timeline, newest activity first"/);
  assert.match(script, /orderChaptersByTimeline\(journey\.chapters\)/);
  assert.match(script, /getChapterArtifactTimeline\(chapter, savedItems\)/);
  assert.match(script, /Showing the \$\{visibleArtifacts\.length\} newest unique artifacts/);
  assert.match(script, /createElement\("strong", "Chapter timeline"\)/);
  assert.match(styles, /\.journey-timeline-heading,[\s\S]*?\.journey-section-heading/);
  assert.match(styles, /\.journey-node\s*\{[\s\S]*?grid-template-columns:\s*58px minmax\(0, 1fr\) auto;[\s\S]*?min-height:\s*86px;[\s\S]*?border-radius:\s*22px;/);
  assert.match(styles, /\.journey-node\[aria-pressed="true"\]\s*\{[\s\S]*?background:\s*#f3f8ff;/);
  assert.match(styles, /\.journey-node:not\(:last-child\) \.journey-node-orb::after\s*\{[\s\S]*?height:\s*calc\(100% \+ 20px\);/);
  assert.match(styles, /@media \(max-width: 480px\)\s*\{[\s\S]*?\.journey-node\s*\{[\s\S]*?grid-template-columns:\s*52px minmax\(0, 1fr\);[\s\S]*?\.journey-node-state\s*\{[\s\S]*?grid-column:\s*2;/);
});

test("compact Journey rows wrap without ellipsis and keep touch-sized actions", () => {
  assert.match(styles, /\.journey-source-row span\s*\{[\s\S]*?overflow-wrap:\s*anywhere;[\s\S]*?text-overflow:\s*clip;[\s\S]*?white-space:\s*normal;/);
  assert.match(styles, /\.journey-source-row > \.text-button\s*\{[\s\S]*?min-height:\s*44px;/);
  assert.match(styles, /\.journey-artifact-row\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\) minmax\(100px, auto\);/);
});

test("artifact actions become full-width cards through 640px", () => {
  assert.match(styles, /@media \(max-width: 640px\)\s*\{[\s\S]*?\.journey-artifact-row\s*\{\s*grid-template-columns:\s*minmax\(0, 1fr\);[\s\S]*?\.journey-artifact-open\s*\{[\s\S]*?width:\s*100%;[\s\S]*?min-width:\s*0;/);
});

test("Dashboard builds and renders the accessible Today's plan section outside Journey", () => {
  assert.match(script, /NeatMindJourney\.buildStudyPlan\(journey, focusHistory, \{ now: Date\.now\(\), savedNoteIds, studyGoal \}\)/);
  assert.match(script, /const persistedView = viewId === "notesView" \? "pageView" : viewId/);
  assert.match(script, /function buildTodayPlanSection\(plan\)/);
  assert.match(script, /section\.setAttribute\("aria-label", "Today's study plan"\)/);
  assert.match(script, /createElement\("span", "TODAY'S PLAN", "today-plan__label"\)/);
  assert.match(script, /action\.type = "button"/);
  const journeyStart = script.indexOf("async function renderJourney()");
  const planSectionStart = script.indexOf("function buildTodayPlanSection(plan)", journeyStart);
  assert.doesNotMatch(script.slice(journeyStart, planSectionStart), /buildStudyPlan|renderTodayPlan/);
});

test("Dashboard plan recovery actions reuse the existing recovery quiz launcher", () => {
  assert.match(script, /async function openTodayPlanChapterArtifact\(step, options = \{\}\)/);
  assert.match(script, /const boundChapterId = String\(artifact\?\.journeyChapterId \|\| artifact\?\.sourceBinding\?\.chapterId \|\| ""\)\.trim\(\);[\s\S]*?return boundChapterId \? boundChapterId === chapter\?\.id : sessionIds\.has\(artifactId\);/);
  assert.match(script, /const newestFirst = \(Array\.isArray\(savedItems\) \? savedItems : \[\]\)[\s\S]*?sessionActivityTime\(second\)[\s\S]*?sessionActivityTime\(first\)/);
  assert.match(script, /else if \(step\.noteMissing && step\.chapterId\) \{[\s\S]*?await openTodayPlanChapterArtifact\(step, \{ openCreateOnMissing: false \}\)/);
  assert.match(script, /async function startTodayPlanQuiz\(step\)[\s\S]*?openJourneyArtifact\(step\.noteId\)[\s\S]*?handleGenerateRecoveryQuiz\(\)/);
  assert.match(script, /action\.textContent = canStartQuiz \? "Start quiz" : "Go"/);
  assert.match(script, /switchView\("notesView"\)/);
});

test("Today's plan styles use semantic UI tokens", () => {
  assert.match(styles, /\.today-plan\s*\{[\s\S]*?border-radius:\s*var\(--ui-radius-card\);[\s\S]*?background:\s*var\(--ui-surface\);/);
  assert.match(styles, /\.today-plan__title\s*\{[\s\S]*?color:\s*var\(--ui-label\);/);
  assert.match(styles, /\.today-plan__streak,[\s\S]*?\.today-plan__reason\s*\{[\s\S]*?color:\s*var\(--ui-label-secondary\);/);
  assert.match(styles, /\.today-plan\s*\{[\s\S]*?box-sizing:\s*border-box;[\s\S]*?min-width:\s*0;[\s\S]*?overflow-x:\s*hidden;/);
  assert.match(styles, /\.today-plan__step\s*\{[\s\S]*?display:\s*flex;[\s\S]*?flex-wrap:\s*wrap;[\s\S]*?gap:\s*var\(--ui-space-3\);/);
  assert.match(styles, /\.today-plan__copy\s*\{[\s\S]*?flex:\s*1 1 160px;[\s\S]*?min-width:\s*0;/);
  assert.match(styles, /\.today-plan__controls\s*\{[\s\S]*?display:\s*flex;[\s\S]*?flex-wrap:\s*wrap;/);
});

test("AI Journey summaries send bounded local habit and due-concept context", () => {
  assert.match(script, /NeatMindJourney\.buildHabitProfile\(journey, focusHistory, summaryNow\)/);
  assert.match(script, /NeatMindJourney\.getDueConcepts\(journey, \{ now: summaryNow, limit: 5 \}\)/);
  assert.match(script, /\.map\(\(\{ conceptLabel, effectiveStrength, state \}\) => \(\{ conceptLabel, effectiveStrength, state \}\)\)/);
  assert.match(script, /\.\.\.\(habitProfile \? \{ habitProfile \} : \{\}\)/);
  assert.match(script, /\.\.\.\(dueConcepts \? \{ dueConcepts \} : \{\}\)/);
});
