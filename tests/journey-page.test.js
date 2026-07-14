const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "journey.html"), "utf8");
const script = fs.readFileSync(path.join(root, "journey-page.js"), "utf8");
const styles = fs.readFileSync(path.join(root, "journey.css"), "utf8");
const forest = fs.readFileSync(path.join(root, "journey-tree", "forest.js"), "utf8");
const particles = fs.readFileSync(path.join(root, "journey-tree", "particle-system.js"), "utf8");
const shaders = fs.readFileSync(path.join(root, "journey-tree", "shaders.js"), "utf8");
const popupScript = fs.readFileSync(path.join(root, "popup.js"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

test("replaces the old Wayfinder trail with the full-screen Learning Forest route", () => {
  assert.match(html, /id="learningForest"[^>]*aria-label="Interactive learning forest"/);
  assert.match(html, /id="forestScene"/);
  assert.match(html, /id="forestConnectors"/);
  assert.match(html, /id="forestLabels"/);
  assert.match(html, /journey-tree-utils\.js/);
  assert.match(html, /cheat-sheet-utils\.js/);
  assert.match(html, /journey-tree\.bundle\.js/);
  assert.doesNotMatch(html, /trailCanvas|trailNodes|chapter-sidebar|Wayfinder/);
  assert.doesNotMatch(script, /renderTrail|renderSidebar/);
});

test("exposes the forest controller lifecycle and stable tree/concept selection IDs", () => {
  assert.match(forest, /export function mountLearningForest/);
  assert.match(forest, /return \{[\s\S]*?setTrees,[\s\S]*?focusTree,[\s\S]*?focusConcept,[\s\S]*?clearConceptFocus,[\s\S]*?showOverview,[\s\S]*?destroy\(\)/);
  assert.match(forest, /onSelectTree\?\.\(\{ treeId: record\.id \}\)/);
  assert.match(forest, /onSelectConcept\?\.\(\{ treeId: record\.id, conceptId: concept\.id \}\)/);
  assert.match(forest, /resizeObserver\.disconnect\(\)/);
  assert.match(forest, /controls\.dispose\(\)/);
  assert.match(forest, /renderer\.dispose\(\)/);
});

test("shows one tree's concepts immediately and uses name-only overview labels for multiple trees", () => {
  assert.match(forest, /if \(trees\.length === 1\) \{[\s\S]*?focusTree\(trees\[0\]\.id\)/);
  assert.match(forest, /function buildOverview\(\)[\s\S]*?createParticleTree\(\[\], renderer/);
  assert.match(forest, /createLabelButton\(\s*entry\.record,\s*'tree'/);
  assert.match(forest, /function focusTree\(treeId\)[\s\S]*?record\.concepts\.map/);
  assert.match(forest, /createLabelButton\(\s*\{ \.\.\.concept, createdAt: record\.createdAt \},\s*'concept'/);
  assert.match(html, /id="backToForest"[^>]*>Back to forest</);
  assert.match(script, /page\.back\.addEventListener\("click", \(\) => \{[\s\S]*?selectedConceptId = "";[\s\S]*?forestController\.showOverview\(\)/);
});

test("keeps overview particle work bounded and rebuilds one full-detail focused tree", () => {
  assert.match(forest, /OVERVIEW_TREE_BUDGET_CAP = 240_000/);
  assert.match(forest, /Math\.floor\(totalParticleBudget \/ Math\.max\(1, trees\.length\)\)/);
  assert.match(forest, /particleBudget: perTreeBudget/);
  assert.match(forest, /particleBudget: totalParticleBudget/);
  assert.match(forest, /clearSceneContent\(\);[\s\S]*?setMode\('focus'/);
  assert.match(particles, /createParticleTree\(chapters, renderer, options = \{\}\)/);
  assert.match(particles, /Math\.max\(12_000, Math\.round\(requestedBudget\)\)/);
});

test("uses a non-overlapping bounded layout and a responsive tree-name directory", () => {
  assert.match(forest, /function buildLayout\(count, aspect\)/);
  assert.match(forest, /spacingX = 4\.9/);
  assert.match(forest, /spacingZ = 4\.6/);
  assert.match(forest, /bounds\.union\(transformedBounds\(entry\.system\)\)/);
  assert.match(forest, /trees\.length > 8 \|\| sceneHost\.clientWidth < 700/);
  assert.match(styles, /\.forest-labels\.is-directory[\s\S]*?grid-template-columns:\s*repeat\(auto-fit, minmax\(130px, 1fr\)\)/);
  assert.match(styles, /@media \(max-width: 560px\)/);
  assert.match(styles, /@media \(max-width: 360px\)/);
});

test("places concept subheaders 12 percentage points closer at 25 percent of the side span", () => {
  assert.match(forest, /LABEL_TREE_GAP_RATIO = 0\.25/);
  assert.match(forest, /LABEL_EDGE_PADDING = 18/);
  assert.match(forest, /function projectSystemHorizontalBounds\(system, camera, viewportWidth\)/);
  assert.match(forest, /const silhouetteSamples = \[/);
  assert.match(forest, /\[bounds\.min\.x, center\.y, center\.z\]/);
  assert.match(forest, /\[center\.x, center\.y, bounds\.min\.z\]/);
  assert.match(forest, /sideSpan \* LABEL_TREE_GAP_RATIO/);
  assert.match(forest, /const treeFacingX = treeBounds\.left - sideSpan \* LABEL_TREE_GAP_RATIO/);
  assert.match(forest, /const treeFacingX = treeBounds\.right \+ sideSpan \* LABEL_TREE_GAP_RATIO/);
  assert.match(forest, /entry\.leafScreenX >= treeCenterX/);
});

test("keeps short subheader connectors anchored to the tree and outside button hit areas", () => {
  assert.match(forest, /MAX_CONCEPT_CONNECTOR_LENGTH = 112/);
  assert.match(forest, /MAX_TREE_CONNECTOR_LENGTH = 96/);
  assert.match(forest, /CONNECTOR_TREE_INSET = 4/);
  assert.match(forest, /connectorLength = Math\.min\(rawDistance - treeInset, maximumLength\)/);
  assert.match(forest, /const endX = leafX - unitX \* treeInset/);
  assert.match(forest, /const connectorStartX = endX - unitX \* connectorLength/);
  assert.match(forest, /labelSafeTop = width <= 560 \? 214 : \(width <= 860 \? 150 : 140\)/);
  assert.match(forest, /Math\.max\(entry\.screenY, labelSafeTop, lastY \+ 48\)/);
  assert.match(html, /class="forest-topbar__utility"[\s\S]*class="forest-controls" role="group" aria-label="Journey actions and tree navigation"/);
  assert.match(html, /class="forest-controls"[\s\S]*id="backToForest"[\s\S]*id="openTreeDetails"[\s\S]*id="openJourneySummary"/);
  assert.match(styles, /\.forest-connectors \{[^}]*pointer-events:\s*none/);
  assert.match(styles, /\.forest-labels \{[^}]*pointer-events:\s*none/);
  assert.match(styles, /\.forest-labels\.is-directory \{[\s\S]*?pointer-events:\s*none/);
  assert.match(styles, /\.forest-controls \{[\s\S]*?position:\s*static[\s\S]*?pointer-events:\s*auto/);
  assert.match(styles, /\.forest-control \{[^}]*pointer-events:\s*auto/);
  assert.match(styles, /@media \(max-width: 860px\)[\s\S]*?\.forest-connector \{ display: none; \}/);
});

test("keeps moving subheaders clickable above decorative layers", () => {
  assert.match(forest, /button\.setPointerCapture\?\.\(event\.pointerId\)/);
  assert.match(forest, /button\.addEventListener\('pointerup',[\s\S]*?if \(moved <= 12\) onActivate\(\)/);
  assert.match(forest, /event\.detail === 0/);
  assert.match(forest, /\(\) => \{ cameraIsFlying = false; \}/);
  assert.match(styles, /\.forest-labels \{ z-index: 14; pointer-events: none; \}/);
  assert.match(styles, /\.forest-axis,\s*\.forest-legend \{ pointer-events: none; \}/);
  assert.match(styles, /\.forest-label \{[\s\S]*?min-height: 40px;[\s\S]*?touch-action: manipulation/);
});

test("raises pointer response without expanding the particle interaction area", () => {
  assert.match(forest, /POINTER_REPEL_STRENGTH = 1\.45/);
  assert.match(forest, /POINTER_REPEL_RESPONSE = 16/);
  assert.match(forest, /\? 0\s*:\s*POINTER_REPEL_STRENGTH/);
  assert.match(forest, /repelTarget,\s*POINTER_REPEL_RESPONSE/);
  assert.match(particles, /uRepelRadius:\s*\{ value: 0\.52 \}/);
});

test("keeps orbit dragging stable by suspending pointer disturbance and camera flights", () => {
  assert.match(forest, /function onControlsStart\(\) \{[\s\S]*?cameraIsFlying = false;[\s\S]*?isOrbitDragging = true;[\s\S]*?repelTarget = 0;/);
  assert.match(forest, /function onControlsEnd\(\) \{[\s\S]*?isOrbitDragging = false;[\s\S]*?pointerInside \? POINTER_REPEL_STRENGTH : 0/);
  assert.match(forest, /repelTarget = isOrbitDragging \|\| event\.buttons !== 0/);
  assert.match(forest, /controls\.addEventListener\('start', onControlsStart\)/);
  assert.match(forest, /controls\.addEventListener\('end', onControlsEnd\)/);
  assert.match(forest, /controls\.removeEventListener\('start', onControlsStart\)/);
  assert.match(forest, /controls\.removeEventListener\('end', onControlsEnd\)/);
  assert.ok(forest.indexOf('if (cameraIsFlying)') < forest.indexOf('controls.update();'));
});

test("enlarges and spaces the same particles while trunk, root, branch, and leaf contours visibly dissolve", () => {
  assert.match(particles, /PARTICLE_POINT_SIZE_GAIN = 1\.1/);
  assert.match(particles, /PARTICLE_SPATIAL_SCALE = 1\.04/);
  assert.match(particles, /points\.scale\.setScalar\(PARTICLE_SPATIAL_SCALE\)/);
  assert.match(particles, /spatialScale: PARTICLE_SPATIAL_SCALE/);
  assert.match(shaders, /uPointSizeGain/);
  assert.match(shaders, /decodedSize \* perspective \* uPointSizeGain/);
  assert.match(shaders, /0\.44 \* uPointSizeGain/);
  assert.match(shaders, /closeUpCeiling \* uPointSizeGain/);
  assert.match(shaders, /float contourSurfaceMask = smoothstep\(0\.68, 0\.93, aSurface\)/);
  assert.match(shaders, /float trunkContourMask = 1\.0 - smoothstep\(0\.03, 0\.08, aWindMask\)/);
  assert.match(particles, /segment\.kind === 'root'\s*\? 0\.12/);
  assert.match(shaders, /float windStructureMask = smoothstep\(0\.22, 0\.46, aWindMask\)/);
  assert.match(shaders, /float rootContourMask = smoothstep\(0\.06, 0\.1, aWindMask\)/);
  assert.match(shaders, /float branchContourMask = smoothstep\(0\.24, 0\.46, aWindMask\)/);
  assert.match(shaders, /1\.0 - smoothstep\(0\.86, 0\.96, aWindMask\)/);
  assert.match(shaders, /float leafContourMask = smoothstep\(0\.94, 1\.0, aWindMask\)/);
  assert.match(shaders, /float branchOrLeafContour = max\(branchContourMask, leafContourMask\)/);
  assert.match(shaders, /max\(trunkContourMask, rootContourMask\)/);
  assert.match(shaders, /float edgeCycle = fract\(aPhase \+ u_time \* 0\.22\)/);
  assert.match(shaders, /float spawnVisibility = smoothstep\(0\.0, 0\.06, edgeCycle\)/);
  assert.match(shaders, /float travelProgress = smoothstep\(0\.02, 0\.96, edgeCycle\)/);
  assert.match(shaders, /float fadeVisibility = 1\.0 - smoothstep\(0\.84, 0\.995, edgeCycle\)/);
  assert.match(shaders, /float rootToBranchDistance = mix\([\s\S]*?0\.42,[\s\S]*?0\.62/);
  assert.match(shaders, /float trunkToRootDistance = mix\([\s\S]*?0\.30,[\s\S]*?rootToBranchDistance/);
  assert.match(shaders, /float flowDistanceLimit = mix\([\s\S]*?nonLeafFlowDistance,[\s\S]*?1\.02/);
  assert.match(shaders, /float flowDistance = travelProgress \* travelProgress \* flowDistanceLimit/);
  assert.match(shaders, /vEdgeVisibility = 1\.0;\s*vEdgeFlow = 0\.0;\s*float edgePointGain = 1\.0;/);
  assert.match(shaders, /spawnVisibility \* fadeVisibility/);
  assert.match(shaders, /\* vEdgeVisibility/);
  assert.match(shaders, /edgePointGain = 1\.0 \+ flowEmphasis \* 0\.58/);
  assert.match(shaders, /vEdgeFlow = flowEmphasis/);
  assert.match(shaders, /alpha \*= 1\.0 \+ vEdgeFlow \* 0\.78/);
  assert.match(forest, /edgeDissolveStrength: motionHasStarted \? 1 : 0/g);
  assert.match(forest, /const visualScale = scale \* system\.spatialScale/);
  assert.match(forest, /leaf\.center\)\.multiplyScalar\(system\.spatialScale\)/);
  assert.match(particles, /new Float32Array\(count \* 3\)/);
  assert.match(particles, /new THREE\.Points\(geometry, material\)/);
  assert.equal((particles.match(/new THREE\.Points\(/g) || []).length, 1);
  assert.doesNotMatch(particles, /edgeMasks|edgeVisibilities/);
});

test("retains loading recovery, an empty note CTA, and a complete WebGL fallback directory", () => {
  assert.match(html, /id="pageLoadState"[^>]*role="status"/);
  assert.match(script, /setLoadState\("error"/);
  assert.match(script, /button\.textContent = "Retry"/);
  assert.match(html, /id="forestEmpty"/);
  assert.match(html, /id="pageCreateNoteButton"[^>]*>Open Exam-Cram</);
  assert.match(html, /id="forestFallbackList"/);
  assert.match(forest, /root\.dataset\.renderer = 'fallback'/);
  assert.match(script, /renderFallback\(\)/);
  assert.match(styles, /\.forest-app\[data-renderer="fallback"\] \.forest-fallback/);
});

test("redesigns chapter evidence and Journey summary inside one accessible drawer", () => {
  assert.match(html, /id="forestDrawer"[^>]*aria-hidden="true"/);
  assert.match(html, /id="chapterTab"[^>]*role="tab"/);
  assert.match(html, /id="summaryTab"[^>]*role="tab"/);
  assert.match(html, /id="pageSummaryRange"/);
  assert.match(html, /id="pageSummarizeButton"/);
  assert.match(script, /Planted \$\{formatDate\(chapter\.createdAt\)\}/);
  assert.match(script, /Updated \$\{formatDate\(chapter\.updatedAt\)\}/);
  assert.match(script, /Tree concepts/);
  assert.match(script, /Saved learning artifacts/);
  assert.match(script, /Saved source snapshots/);
  assert.match(styles, /\.forest-drawer\.is-open/);
});

test("zooms to a selected subheader and shows only its translucent concept information", () => {
  assert.match(html, /id="forestDrawer"[^>]*tabindex="-1"/);
  assert.match(script, /onSelectConcept\(\{ treeId, conceptId \}\)[\s\S]*?openDrawer\("chapter"\)/);
  assert.match(script, /page\.drawer\.focus\(\{ preventScroll: true \}\)/);
  assert.match(script, /requestAnimationFrame\(revealSelectedConceptMessage\)/);
  assert.match(script, /function revealSelectedConceptMessage\(\)/);
  assert.match(script, /scrollIntoView\(\{[\s\S]*?block: "nearest"/);
  assert.match(forest, /function focusConcept\(treeId, conceptId\)/);
  assert.match(forest, /entry\.leaf\.center\.clone\(\)\.applyMatrix4\(entry\.points\.matrixWorld\)/);
  assert.match(forest, /CONCEPT_CAMERA_DISTANCE = 2\.75/);
  assert.match(forest, /setCameraTarget\(cameraDestination, framingTarget\)/);
  assert.match(forest, /entry\.isVisible = inFrustum && !selectedConceptId/);
  assert.match(script, /function renderConceptFocusMessage\(chapter, record, selectedConcept\)/);
  assert.match(script, /page\.drawer\.classList\.toggle\("is-concept-only"/);
  assert.match(styles, /\.forest-drawer\.is-concept-only \{[\s\S]*rgba\(5, 7, 8, 0\.55\)/);
  assert.match(styles, /\.forest-drawer\.is-concept-only \.forest-drawer__tabs,[\s\S]*display: none/);
  assert.match(styles, /\.forest-drawer\.is-concept-only \.chapter-inspector \{[\s\S]*background: transparent/);
});

test("keeps exact Visual Tutor Note and cheat sheet access in full Note details", () => {
  assert.match(script, /function openFullDetails\(tab, trigger\)/);
  assert.match(script, /function renderChapterNotePreview\(chapter, record\)/);
  assert.match(script, /getExactChapterArtifact\(record\)/);
  assert.match(script, /savedArtifacts\.find\(\(artifact\) => artifact\.id === artifactId\)/);
  assert.match(script, /Visual Tutor Note/);
  assert.match(script, /function normalizeChapterCheatSheet\(artifact\)/);
  assert.match(script, /function renderChapterCheatSheet\(sheet\)/);
  assert.match(styles, /\.chapter-focus-message \{/);
  assert.match(styles, /\.visual-tutor-preview__nodes \{/);
  assert.match(styles, /\.chapter-cheat-sheet__table \{/);
  assert.match(styles, /\.forest-drawer \{[\s\S]*bottom: clamp\(22px, 4vh, 42px\)/);
  assert.match(styles, /\.forest-drawer \{[\s\S]*transform: translate\(-50%, calc\(100% \+ 96px\)\)/);
  assert.match(styles, /\.forest-drawer\.is-open \{[\s\S]*transform: translate\(-50%, 0\)/);
  assert.match(styles, /\.forest-drawer \{[\s\S]*pointer-events: none/);
  assert.match(styles, /\.forest-drawer\.is-open \{[\s\S]*pointer-events: auto/);
  assert.match(styles, /\.forest-drawer__chrome \{[\s\S]*position: sticky[\s\S]*top: 0/);
  assert.match(styles, /@media \(max-width: 560px\)[\s\S]*\.forest-controls \{[^}]*display: grid[^}]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
});

test("uses progressive disclosure, responsive regions, and a user-controlled motion state", () => {
  assert.match(html, /class="forest-topbar__meta"/);
  assert.match(html, /id="toggleForestMotion"[^>]*aria-pressed="false"[^>]*>Pause motion</);
  assert.match(html, /<kbd>Drag<\/kbd> orbit[\s\S]*<kbd>Scroll<\/kbd> zoom/);
  assert.match(script, /onSelectTree\(\{ treeId \}\) \{[\s\S]*?renderDetails\(\);\s*closeDrawer\(\);/);
  assert.match(script, /onSelectConcept\(\{ treeId, conceptId \}\)[\s\S]*?openDrawer\("chapter"\)/);
  assert.match(script, /function updateMotionControl\(\)[\s\S]*?Resume motion[\s\S]*?Pause motion/);
  assert.match(script, /function rememberDrawerReturnFocus\(preferred\)/);
  assert.match(script, /returnTarget\.focus\(\{ preventScroll: true \}\)/);
  assert.match(forest, /function setMotionPaused\(nextPaused\)/);
  assert.match(forest, /if \(!motionPaused\) motionElapsed \+= delta/);
  assert.match(styles, /\.forest-topbar__meta \{/);
  assert.match(styles, /\.forest-control--motion\[aria-pressed="true"\]/);
  assert.match(styles, /@media \(max-width: 560px\)[\s\S]*\.forest-drawer \{[\s\S]*?bottom: 0;[\s\S]*?width: 100%/);
});

test("documents the current Learning Forest interaction and verification contract", () => {
  assert.match(readme, /full Learning Forest/);
  assert.match(readme, /Pause motion/);
  assert.match(readme, /subheader/i);
  assert.match(readme, /npm run build:journey/);
  assert.doesNotMatch(readme, /All 153 automated tests currently pass/);
});

test("preserves source-specific names and the exact saved-artifact side-panel handoff", () => {
  assert.match(script, /`Open \$\{source\.title\}`/);
  assert.match(script, /savedArtifacts\.find\(\(item\) => item\.id === artifactId\)/);
  assert.match(script, /setStorage\(STORAGE\.sessionDraft/);
  assert.match(script, /artifact: exactArtifact/);
  assert.match(script, /session: exactArtifact/);
  assert.ok(script.indexOf("const draftSave = setStorage") < script.indexOf("const sidePanelOpen = openSidePanelFromGesture"));
  assert.match(script, /OPEN_JOURNEY_ARTIFACT/);
  assert.match(script, /WINDOW_ID_CURRENT \?\? -2/);
  assert.match(popupScript, /message\?\.type === "OPEN_JOURNEY_ARTIFACT"[\s\S]*?openJourneyArtifact\(String\(message\.artifactId\), \{ preferDraft: true \}\)/);
});

test("keeps reduced-motion behavior, keyboard exit, and touch-sized artifact actions", () => {
  assert.match(forest, /prefers-reduced-motion: reduce/);
  assert.match(forest, /event\.key === 'Escape'[\s\S]*?showOverview\(\)/);
  assert.match(script, /event\.key === "Escape"[\s\S]*?closeDrawer\(\)/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(styles, /\.artifact-card \.artifact-open-button[\s\S]*?min-height:\s*44px/);
  assert.match(styles, /button:focus-visible/);
});

test("bundles Three.js locally through the extension's existing build", () => {
  assert.equal(packageJson.dependencies.three, "^0.178.0");
  assert.ok(packageJson.scripts.build.includes("build:journey"));
  assert.match(packageJson.scripts["build:journey"], /build-journey-tree\.mjs/);
  assert.ok(fs.statSync(path.join(root, "journey-tree.bundle.js")).size > 100_000);
});
