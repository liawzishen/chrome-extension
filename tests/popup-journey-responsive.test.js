const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

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
  assert.match(script, /catch\s*\{[\s\S]*?ExamCramJourney\.classifySourcesLocally\(readableFiles, journey\)/);
});

test("Smart Import sends only excerpt data to the source classifier", () => {
  assert.match(script, /async function classifyImportSourcesWithBackend[\s\S]*?files: files\.map\(\(\{ fileId, excerpt \}\) => \(\{ fileId, excerpt \}\)\)[\s\S]*?existingChapters:[\s\S]*?chapterHints:/);
});

test("Smart Import passes all assignments through the capacity planner", () => {
  assert.match(script, /ExamCramJourney\.planBulkFiling\(plannedAssignments, journey\)/);
  assert.match(script, /state\.pendingImport = \{[\s\S]*?files,[\s\S]*?assignments: plannedAssignments,[\s\S]*?plan/);
});

test("backend endpoint rewriting supports source classification", () => {
  assert.match(script, /journey-summary\|classify-sources\|video-transcript/);
  assert.match(script, /deriveBackendEndpoint\(configuredEndpoint, "classify-sources"\)/);
});

test("Smart Import re-plans capacity whenever a chapter dropdown changes", () => {
  assert.match(script, /select\.addEventListener\("change", \(event\) => \{[\s\S]*?pending\.plan = globalThis\.ExamCramJourney\.planBulkFiling\(pending\.assignments, pending\.journey\);[\s\S]*?renderImportReview\(\)/);
  assert.match(script, /openNewChapterDialog\(event, \{ importFileId: row\.fileId \}\)/);
  assert.match(script, /if \(importFileId\)[\s\S]*?Assigned by you during import review\.[\s\S]*?planBulkFiling/);
});

test("Smart Import cannot confirm while chapter-cap rows remain blocked", () => {
  assert.match(script, /confirm\.disabled = pending\.plan\.blockedCount > 0/);
  assert.match(script, /async function handleConfirmImport\(\)[\s\S]*?if \(pending\.plan\.blockedCount > 0\) \{[\s\S]*?return;/);
});

test("Smart Import confirms sources through the existing Journey add-source operation", () => {
  assert.match(script, /function saveImportedSourceToChapter\(chapterTitle, source, journey\)[\s\S]*?mutateJourney\("JOURNEY_ADD_SOURCE"/);
  assert.match(script, /const added = await saveImportedSourceToChapter\([\s\S]*?row\.finalChapterTitle,[\s\S]*?file\.source/);
  assert.match(script, /startImportNoteQueue\(\[\.\.\.affectedChapterIds\]\)/);
});

test("Smart Import identifies exact re-uploads before reserving chapter capacity", () => {
  assert.match(script, /function isImportSourceAlreadySaved\(file, assignment, journey\)[\s\S]*?source\.fingerprint === sourceFingerprint/);
  assert.match(script, /alreadySaved \? "already saved — will be skipped" : "couldn't read — will be skipped"/);
  assert.match(script, /refreshImportDuplicateAssignments\(pending, pending\.journey\);[\s\S]*?planBulkFiling\(pending\.assignments, pending\.journey\)/);
});

test("Smart Import review is accessible, compact, and uses semantic UI tokens", () => {
  assert.match(script, /section\.setAttribute\("aria-label", "Review imported files"\)/);
  assert.match(script, /const select = document\.createElement\("select"\)/);
  assert.match(script, /confidence\.setAttribute\("aria-label", `\$\{confidenceLabel\} classification confidence`\)/);
  assert.match(styles, /\.smart-import\s*\{[\s\S]*?max-height:[\s\S]*?overflow-y:\s*auto;[\s\S]*?background:\s*var\(--ui-surface\);/);
  assert.match(styles, /\.smart-import__group--check\s*\{[\s\S]*?background:\s*var\(--ui-warning-tint\);/);
  assert.match(styles, /\.smart-import__message--danger\s*\{[\s\S]*?color:\s*var\(--ui-danger\);/);
});

test("Smart Import matches the compact folder-and-status review hierarchy", () => {
  assert.match(script, /page-composer--reviewing/);
  assert.match(script, /Review & Confirm Import/);
  assert.match(script, /function groupImportReviewEntries\(entries\)/);
  assert.match(script, /function renderImportReviewFolderGroup\(cluster, pending\)/);
  assert.match(script, /createElement\("span", "Folder"\)/);
  assert.match(script, /createElement\("span", "Status"\)/);
  assert.match(script, /move\.textContent = "Move"/);
  assert.match(script, /smart-import__groups/);
  assert.match(styles, /#pageView \.page-composer--reviewing > :not\(\.smart-import\)/);
  assert.match(styles, /#pageView \.page-composer--reviewing \.smart-import\s*\{[\s\S]*?position:\s*fixed;/);
  assert.match(styles, /#pageView \.smart-import__row-actions\s*\{/);
  assert.match(styles, /#pageView \.smart-import__confirm\s*\{[\s\S]*?var\(--ui-success\)/);
  assert.match(styles, /#pageView \.smart-import__cluster\s*\{/);
  assert.match(styles, /#pageView \.smart-import__footer-actions\s*\{/);
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
  assert.match(script, /if \(outcome === "backend-unavailable"\) \{[\s\S]*?showStatus\("All imported sources are saved in their chapters\. Generate each chapter's visual note later with Build chapter visual note\."\)/);
});

test("Smart Import note failures expose a single-chapter Retry control", () => {
  assert.match(script, /if \(row\.status === "failed"\) \{[\s\S]*?retry\.textContent = "Retry"[\s\S]*?retryImportNoteChapter\(queue\.id, row\.chapterId\)/);
  assert.match(script, /async function retryImportNoteChapter\(queueId, chapterId\)[\s\S]*?await runImportNoteQueueRow\(queue, row\)/);
});

test("Smart Import stops queued AI work safely when dismissed or unavailable", () => {
  assert.match(script, /if \(queue\.dismissed\) break/);
  assert.match(script, /IMPORT_NOTE_BACKEND_UNAVAILABLE[\s\S]*?Generate later with Build lesson/);
  assert.match(script, /dismissImportNoteQueue\(queue\.id\)/);
  assert.match(styles, /\.smart-import-notes\s*\{[\s\S]*?background:\s*var\(--ui-surface-elevated\);/);
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

test("Journey builds and renders an accessible Today's plan section", () => {
  assert.match(script, /ExamCramJourney\.buildStudyPlan\(journey, focusHistory, \{ now: Date\.now\(\), savedNoteIds \}\)/);
  assert.match(script, /const persistedView = viewId === "notesView" \? "pageView" : viewId/);
  assert.match(script, /section\.setAttribute\("aria-label", "Today's study plan"\)/);
  assert.match(script, /createElement\("span", "TODAY'S PLAN", "today-plan__label"\)/);
  assert.match(script, /action\.type = "button"/);
});

test("Journey plan recovery actions reuse the existing recovery quiz launcher", () => {
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
  assert.match(script, /ExamCramJourney\.buildHabitProfile\(journey, focusHistory, summaryNow\)/);
  assert.match(script, /ExamCramJourney\.getDueConcepts\(journey, \{ now: summaryNow, limit: 5 \}\)/);
  assert.match(script, /\.map\(\(\{ conceptLabel, effectiveStrength, state \}\) => \(\{ conceptLabel, effectiveStrength, state \}\)\)/);
  assert.match(script, /\.\.\.\(habitProfile \? \{ habitProfile \} : \{\}\)/);
  assert.match(script, /\.\.\.\(dueConcepts \? \{ dueConcepts \} : \{\}\)/);
});
