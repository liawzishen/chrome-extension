const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "journey.html"), "utf8");
const script = fs.readFileSync(path.join(root, "journey-page.js"), "utf8");
const styles = fs.readFileSync(path.join(root, "journey.css"), "utf8");
const forest = fs.readFileSync(path.join(root, "journey-tree", "forest.js"), "utf8");
const forestData = fs.readFileSync(path.join(root, "journey-tree-utils.js"), "utf8");
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

test("exposes the forest lifecycle and selects Visual Tutor Notes by stable artifact ID", () => {
  assert.match(forest, /export function mountLearningForest/);
  assert.match(forest, /return \{[\s\S]*?setTrees,[\s\S]*?focusTree,[\s\S]*?focusVisualNote,[\s\S]*?showOverview,[\s\S]*?destroy\(\)/);
  assert.match(forest, /onSelectTree\?\.\(\{\s*treeId:\s*record\.id\s*\}\)/);
  assert.match(forest, /onSelectVisualNote\?\.\(\{[\s\S]*?treeId:\s*record\.id[\s\S]*?artifactId:\s*(?:visualNote|note)\.id[\s\S]*?\}\)/);
  assert.match(script, /onSelectVisualNote\(\{\s*treeId,\s*artifactId\s*\}\)[\s\S]*?selectedVisualNoteId\s*=\s*artifactId/);
  assert.match(forest, /resizeObserver\.disconnect\(\)/);
  assert.match(forest, /controls\.dispose\(\)/);
  assert.match(forest, /renderer\.dispose\(\)/);
});

test("shows up to eight meaningful Visual Tutor Note branches and creates only real chapter ribbon entries", () => {
  assert.match(forest, /if \(trees\.length === 1\) \{[\s\S]*?focusTree\(trees\[0\]\.id\)/);
  assert.match(html, /id="forestRibbon"[\s\S]*?id="forestRibbonPath"[\s\S]*?id="forestRibbonPlots"[\s\S]*?id="forestChapterIndex"/);
  assert.match(forest, /function buildRibbon\(activeTreeId, presentation\)[\s\S]*?ribbonEntries = trees\.map/);
  assert.match(forest, /String\(index \+ 1\)\.padStart\(2, '0'\)/);
  assert.doesNotMatch(forest, /Array\.from\(\{ length: 11 \}/);
  assert.match(forest, /function focusTree\(treeId\)[\s\S]*?record\.visualNotes\.map/);
  assert.match(forest, /focusVisualNote\(record\.id,\s*(?:visualNote|note)\.id\)/);
  assert.doesNotMatch(forest, /visualNotes[^;\n]*\.slice\(0,\s*7\)|visualNoteCount[^;\n]*Math\.min\(7,/);
  assert.match(forestData, /const MAX_VISUAL_NOTES_PER_CHAPTER = 8/);
  assert.match(forestData, /visualNoteBranchIdentity/);
  assert.match(forestData, /slice\(0, MAX_VISUAL_NOTES_PER_CHAPTER\)/);
  assert.match(html, /id="backToForest"[^>]*>Back to forest</);
  assert.match(script, /page\.back\.addEventListener\("click", \(\) => \{[\s\S]*?selectedVisualNoteId = "";[\s\S]*?forestController\.showOverview\(\)/);
});

test("places each chapter title beneath its planting root without decorative hit-area blockers", () => {
  assert.match(forest, /className = 'forest-ribbon__plot-title'/);
  assert.match(forest, /function getRibbonRoot\(entry\)[\s\S]*?bounds\.min\.y - 0\.08/);
  assert.match(forest, /LIVE_TREE_LABEL_CLEARANCE = 18/);
  assert.match(forest, /const labelOffset = !compact && item\.hasLiveTree[\s\S]*?Math\.max\(rowOffset, LIVE_TREE_LABEL_CLEARANCE\)/);
  assert.match(forest, /item\.minimumScreenY = !compact && item\.hasLiveTree[\s\S]*?rootAlignedScreenY \+ LIVE_TREE_LABEL_CLEARANCE/);
  assert.match(forest, /candidateY >= item\.minimumScreenY && candidateY <= safeBottom/);
  assert.match(forest, /const horizontalCandidates = \[[\s\S]*?collision\.screenX - minimumHorizontalGap,[\s\S]*?collision\.screenX \+ minimumHorizontalGap/);
  assert.match(forest, /hasLiveTree: entry\.record\.growthStage !== 'plot'/);
  assert.match(forest, /entry\.plot\.style\.transform = `translate3d\(\$\{screenX\}px, \$\{screenY\}px, 0\) translate\(-50%, -50%\)`/);
  assert.match(styles, /\.forest-ribbon \{[\s\S]*?pointer-events:\s*none/);
  assert.match(styles, /\.forest-ribbon__plot \{[\s\S]*?pointer-events:\s*auto/);
  assert.match(styles, /\.forest-ribbon__plot-title \{[\s\S]*?top:\s*76px/);
});

test("keeps every non-empty growth stage visible in overview and preserves it when focused", () => {
  assert.match(forest, /function buildPreviewSystems\([\s\S]*?ribbonEntries\.(?:forEach|map)\([\s\S]*?createParticleTree\([\s\S]*?growthStage:\s*record\.growthStage[\s\S]*?overviewSystems\.push/);
  assert.match(forest, /function buildOverview\([\s\S]*?buildPreviewSystems\(\{ highlightedTreeId: activeRecord\.id \}\)/);
  assert.match(forest, /button\.dataset\.growth\s*=\s*record\.growthStage/);
  for (const stage of ["plot", "seedling", "growing", "mature"]) {
    assert.match(styles, new RegExp(`forest-ribbon__plot\\[data-growth="${stage}"\\]`));
  }
  assert.match(forest, /entry\.plot\.hidden\s*=\s*false/);
  assert.doesNotMatch(forest, /entry\.plot\.hidden\s*=\s*true/);
  assert.match(forest, /function focusTree\(treeId\)[\s\S]*?createParticleTree\([\s\S]*?growthStage:\s*record\.growthStage/);
  assert.match(forest, /clearSceneContent\(\);[\s\S]*?setMode\('focus'/);
  assert.match(particles, /createParticleTree\(chapters, renderer, options = \{\}\)/);
});

test("keeps focused and background plants inside one hardware-tier particle budget", () => {
  assert.match(forest, /FOCUS_BACKGROUND_MIN_TREE_BUDGET = 4_000/);
  assert.match(forest, /const backgroundReserve = Math\.min\([\s\S]*?backgroundTreeCount \* FOCUS_BACKGROUND_MIN_TREE_BUDGET/);
  assert.match(forest, /const focusedBudget = record\.growthStage === 'plot'[\s\S]*?totalParticleBudget - backgroundReserve/);
  assert.match(forest, /poolLimit: Math\.max\(0, totalParticleBudget - focusedBudget\)/);
  assert.match(particles, /MAX_PARTICLE_BUDGET = 320_000/);
  assert.match(particles, /Math\.min\(MAX_PARTICLE_BUDGET, Math\.max\(2_000, Math\.round\(requestedBudget\)\)\)/);
  assert.match(forest, /const pool = Math\.min\(totalBudget,/);
});

test("idles the forest renderer while hidden, unfocused, offscreen, or reduced-motion", () => {
  assert.match(forest, /function isForestViewActive\(\)[\s\S]*?!document\.hidden[\s\S]*?document\.hasFocus\?\.\(\)[\s\S]*?forestIsIntersecting[\s\S]*?getClientRects\(\)\.length[\s\S]*?aria-hidden/);
  assert.match(forest, /function isForestAnimationActive\(\) \{[\s\S]*?isForestViewActive\(\) && !reducedMotion/);
  assert.match(forest, /function scheduleAnimationFrame\(\) \{[\s\S]*?!isForestAnimationActive\(\)[\s\S]*?requestAnimationFrame\(render\)/);
  assert.match(forest, /function requestForestRender\(\) \{[\s\S]*?if \(reducedMotion\) \{[\s\S]*?drawForestFrame\(performance\.now\(\), true\);[\s\S]*?scheduleAnimationFrame\(\)/);
  assert.match(forest, /function render\(timestamp = 0\) \{[\s\S]*?animationFrameId = 0;[\s\S]*?if \(!isForestAnimationActive\(\)\) return;[\s\S]*?scheduleAnimationFrame\(\)/);
  assert.match(forest, /new IntersectionObserver\([\s\S]*?forestIsIntersecting = Boolean\(entry\?\.isIntersecting\)/);
  assert.match(forest, /function handleForestBlur\(\) \{[\s\S]*?stopAnimationLoop\(\)/);
  assert.match(forest, /window\.addEventListener\('focus', handleForestActivityChange\)[\s\S]*?window\.addEventListener\('blur', handleForestBlur\)[\s\S]*?document\.addEventListener\('visibilitychange', handleForestActivityChange\)/);
  assert.match(forest, /visibilityObserver\?\.disconnect\(\)[\s\S]*?window\.removeEventListener\('focus', handleForestActivityChange\)[\s\S]*?window\.removeEventListener\('blur', handleForestBlur\)[\s\S]*?document\.removeEventListener\('visibilitychange', handleForestActivityChange\)/);
});

test("retains exact note focus across one-tree refreshes and responsive reframing", () => {
  assert.match(forest, /if \(trees\.length === 1\) \{[\s\S]*?previousVisualNoteId[\s\S]*?focusVisualNote\(trees\[0\]\.id, previousVisualNoteId\)/);
  assert.match(forest, /if \(\(mode === 'overview' \|\| mode === 'focus'\) && trees\.length\)/);
  assert.match(forest, /const selectedNoteEntry = selectedVisualNoteId[\s\S]*?getVisualNotePose\(selectedNoteEntry\)[\s\S]*?getFocusPose\(focusSystem\?\.system \|\| null, selectedEntry\.position\)/);
  assert.match(script, /function handleStorageChanged\(changes, area\)[\s\S]*?metricsChanged = true[\s\S]*?else if \(metricsChanged\) renderHeaderMetrics\(\)/);
  assert.doesNotMatch(script, /if \(!relevantSources\.length && chapter\.sources\.length === 1\)/);
});

test("uses a bounded serpentine ribbon and a scrollable exact-count chapter index", () => {
  assert.match(forest, /function buildLayout\(records, aspect = 1\)/);
  assert.match(forest, /LAYOUT_STAGE_RADII = Object\.freeze\([\s\S]*?seedling:[\s\S]*?growing:[\s\S]*?mature:/);
  assert.match(forest, /RIBBON_HORIZONTAL_GAP = 2\.2/);
  assert.match(forest, /RIBBON_Z_SPACING = 9/);
  assert.match(forest, /RIBBON_ROW_STAGGER = 5\.2/);
  assert.match(forest, /const rowStagger = row === 0[\s\S]*?RIBBON_ROW_STAGGER/);
  assert.match(forest, /ribbonLayout = buildLayout\(trees, camera\.aspect \|\| 1\)/);
  assert.match(forest, /ribbonEntries = trees\.map\(\(record, index\)/);
  assert.match(forest, /function buildSmoothPath\(points\)/);
  assert.match(styles, /\.forest-ribbon__index \{[\s\S]*?overflow-x:\s*auto/);
  assert.match(styles, /\.forest-ribbon__index-button \{[\s\S]*?min-width:\s*104px/);
  assert.match(styles, /@media \(max-width: 560px\)/);
  assert.match(styles, /@media \(max-width: 360px\)/);
});

test("keeps chapter trees and projected chapter controls from blocking one another", () => {
  assert.match(forest, /function fitCameraToOverview\(\)[\s\S]*?systemsByTreeId[\s\S]*?bounds\.union\([\s\S]*?applyMatrix4\(overviewEntry\.system\.points\.matrixWorld\)/);
  assert.match(forest, /bounds\.expandByVector\(new THREE\.Vector3\(1\.7, 2\.2, 1\.7\)\)/);
  assert.match(forest, /function separateChapterPlotPositions\(items, width, safeTop, safeBottom, compact = false\)/);
  assert.match(forest, /CHAPTER_PLOT_ROW_OFFSET = 44/);
  assert.match(forest, /minimumHorizontalGap = plotWidth \+ CHAPTER_PLOT_COLLISION_GAP/);
  assert.match(forest, /Math\.abs\(item\.screenX - candidate\.screenX\) < minimumHorizontalGap/);
  assert.match(forest, /Math\.abs\(item\.screenY - candidate\.screenY\) < minimumVerticalGap/);
  assert.match(forest, /const freeLanes = \[\]/);
  assert.match(forest, /separateChapterPlotPositions\(projectedPlots, width, safeTop, safeBottom, compact\)/);
});

test("uses the reference hierarchy without misrepresenting chapter growth", () => {
  assert.match(forest, /OVERVIEW_SELECTED_TREE_SCALE = 0\.62/);
  assert.match(forest, /OVERVIEW_CONTEXT_TREE_SCALE = 0\.38/);
  assert.match(forest, /OVERVIEW_SELECTED_OPACITY = 0\.98/);
  assert.match(forest, /OVERVIEW_CONTEXT_OPACITY = 0\.58/);
  assert.match(forest, /const isHighlighted = !dimmed && record\.id === highlightedTreeId/);
  assert.match(forest, /growthStage:\s*record\.growthStage/);
  assert.match(forest, /buildPreviewSystems\(\{ highlightedTreeId: activeRecord\.id \}\)/);
  assert.match(forest, /COMPACT_RIBBON_CHAPTER_COUNT = 9/);
  assert.match(forest, /ribbonElement\.dataset\.density = compact \? 'compact' : 'comfortable'/);
  assert.match(styles, /\.forest-ribbon\[data-density="compact"\] \.forest-ribbon__plot-number/);
  assert.match(html, /id="forestRibbonBed"/);
  assert.match(styles, /\.forest-ribbon__track-bed \{[\s\S]*?stroke-width:\s*34/);
});

test("links plot and index feedback, pulses completed chapters, and preserves staged growth in focus", () => {
  assert.match(forest, /function bindRibbonFeedback\(element, treeId, \{ motionPreview = false \} = \{\}\)[\s\S]*?pointerenter[\s\S]*?focus/);
  assert.match(forest, /bindRibbonFeedback\(button, record\.id, \{ motionPreview: true \}\)/);
  assert.match(forest, /entry\.plot\.classList\.toggle\('is-linked', isLinked\)/);
  assert.match(forest, /entry\.indexButton\.classList\.toggle\('is-linked', isLinked\)/);
  assert.match(forest, /button\.dataset\.status = record\.status/);
  assert.match(styles, /\.forest-ribbon__plot\[data-status="completed"\] \.forest-ribbon__completion-pulse[\s\S]*?animation: forest-completion-pulse/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.forest-ribbon__completion-pulse/);
  assert.match(particles, /GROWTH_PROFILES = Object\.freeze\([\s\S]*?seedling:[\s\S]*?growing:[\s\S]*?mature:/);
  assert.match(particles, /const growthStage = options\.growthStage/);
  assert.match(particles, /growthProfile\.botanicalModel === 'dicot-seedling'[\s\S]*?generateSeedlingStructure\(random\)/);
  assert.match(particles, /seedlingStructure\?\.skeleton \|\| generateSkeleton\(random, growthProfile\)/);
  assert.doesNotMatch(forest, /controls\.enabled = nextMode === 'focus'/);
  assert.match(forest, /controls\.enabled\s*=\s*(?:nextMode\s*!==\s*'empty'|nextMode === 'overview' \|\| nextMode === 'focus')/);
  assert.match(forest, /entry\.system\.points\.position\.lerp\(entry\.targetPosition/);
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
  assert.match(forest, /CONNECTOR_TREE_INSET = 4/);
  assert.match(forest, /connectorLength = Math\.min\(rawDistance - treeInset, MAX_CONCEPT_CONNECTOR_LENGTH\)/);
  assert.match(forest, /const endX = leafX - unitX \* treeInset/);
  assert.match(forest, /const connectorStartX = endX - unitX \* connectorLength/);
  assert.match(forest, /labelSafeTop = width <= 560 \? 238 : \(width <= 860 \? 150 : 140\)/);
  assert.match(forest, /Math\.max\(entry\.screenY, labelSafeTop, lastY \+ 48\)/);
  assert.match(html, /class="forest-topbar__utility"[\s\S]*class="forest-controls" role="group" aria-label="Journey actions and tree navigation"/);
  assert.match(html, /class="forest-controls"[\s\S]*id="backToForest"[\s\S]*id="openTreeDetails"[\s\S]*id="openJourneySummary"/);
  assert.match(styles, /\.forest-connectors \{[^}]*pointer-events:\s*none/);
  assert.match(styles, /\.forest-labels \{[^}]*pointer-events:\s*none/);
  assert.match(styles, /\.forest-ribbon \{[\s\S]*?pointer-events:\s*none/);
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
  assert.match(styles, /\.forest-legend \{ pointer-events: none; \}/);
  assert.match(styles, /\.forest-label \{[\s\S]*?min-height: 40px;[\s\S]*?touch-action: manipulation/);
});

test("raises pointer response while requiring contact with an actual overview particle", () => {
  assert.match(forest, /POINTER_REPEL_STRENGTH = 2\.15/);
  assert.match(forest, /POINTER_REPEL_RESPONSE = 28/);
  assert.match(forest, /POINTER_PARTICLE_HIT_THRESHOLD = 0\.085/);
  assert.match(particles, /uRepelRadius:\s*\{ value: 0\.52 \}/);
  assert.match(forest, /function rayTouchesOverviewParticle\(entry\)[\s\S]*?positions\.count[\s\S]*?distanceSqToPoint\(particleHitPoint\) <= localThresholdSquared/);
  assert.match(forest, /function findOverviewParticleEntryAtPointer\(\)[\s\S]*?raycaster\.intersectObjects\(treeTargets, false\)[\s\S]*?rayTouchesOverviewParticle\(entry\)/);
  assert.match(forest, /const entryRepelTarget = mode === 'overview'[\s\S]*?isParticleContactEntry \? repelTarget : 0/);
  assert.match(forest, /renderer\.domElement\.addEventListener\('pointercancel', onPointerCancel\)/);
  assert.match(forest, /renderer\.domElement\.removeEventListener\('pointercancel', onPointerCancel\)/);
});

test("moves selected and bottom-index preview trees while leaving other overview trees paused", () => {
  assert.match(forest, /activeOverviewTreeId = ''/);
  assert.match(forest, /const ribbonMotionTreeIds = new Set\(\)/);
  assert.match(forest, /function getActiveOverviewMotionTreeIds\(\)[\s\S]*?activeTreeIds\.add\(selectedTreeId\)[\s\S]*?ribbonMotionTreeIds\.forEach[\s\S]*?activeTreeIds\.add\(activeOverviewTreeId\)/);
  assert.match(forest, /function activateOverviewEntry\(entry\)[\s\S]*?entry\.targetMotionStrength = 1[\s\S]*?uEdgeDissolveStrength\.value = 1/);
  assert.match(forest, /function setRibbonMotionTreeActive\(treeId, isActive\)[\s\S]*?ribbonMotionTreeIds\.add\(normalizedTreeId\)[\s\S]*?syncMotionDataset\(\)/);
  assert.match(forest, /bindRibbonFeedback\(button, record\.id, \{ motionPreview: true \}\)/);
  assert.match(forest, /edgeDissolveStrength: mode === 'overview' \? 0 : \(motionHasStarted \? 1 : 0\)/);
  assert.match(forest, /motionStrength: mode === 'overview' \? 0 : 1/);
  assert.match(forest, /targetMotionStrength: mode === 'overview' \? 0 : 1/);
  assert.match(forest, /if \(!motionPaused && !settleImmediately && mode !== 'overview'\) motionElapsed \+= delta/);
  assert.match(forest, /if \(isActiveOverviewEntry && !settleImmediately\) entry\.motionElapsed \+= delta/);
  assert.match(forest, /root\.dataset\.motion = motionPaused[\s\S]*?activeMotionTreeIds\.size \? 'active' : 'waiting'/);
  assert.match(particles, /uMotionStrength:[\s\S]*?options\.motionStrength/);
  assert.match(shaders, /uniform float uMotionStrength/);
  assert.match(shaders, /windOffset \*= uMotionStrength/);
});

test("keeps orbit dragging stable by suspending pointer disturbance and camera flights", () => {
  assert.match(forest, /function onControlsStart\(\) \{[\s\S]*?cameraIsFlying = false;[\s\S]*?isOrbitDragging = true;[\s\S]*?repelTarget = 0;/);
  assert.match(forest, /function onControlsEnd\(\) \{[\s\S]*?isOrbitDragging = false;[\s\S]*?mode === 'overview'[\s\S]*?updateOverviewPointerActivation\(\)[\s\S]*?pointerInside \? POINTER_REPEL_STRENGTH : 0/);
  assert.match(forest, /repelTarget = isOrbitDragging \|\| event\.buttons !== 0/);
  assert.match(forest, /controls\.addEventListener\('start', onControlsStart\)/);
  assert.match(forest, /controls\.addEventListener\('end', onControlsEnd\)/);
  assert.match(forest, /controls\.removeEventListener\('start', onControlsStart\)/);
  assert.match(forest, /controls\.removeEventListener\('end', onControlsEnd\)/);
  assert.ok(forest.indexOf('if (cameraIsFlying)') < forest.indexOf('controls.update();'));
});

test("builds the seedling from explicit dicot anatomy instead of a miniature tree", () => {
  assert.match(particles, /botanicalModel: 'dicot-seedling'/);
  assert.match(particles, /function generateSeedlingStructure\(random\)/);
  assert.match(particles, /botanicalPart = 'hypocotyl'/);
  assert.match(particles, /botanicalPart = 'epicotyl'/);
  assert.match(particles, /botanicalPart = 'radicle'/);
  assert.match(particles, /botanicalPart = 'lateral-root'/);
  assert.equal((particles.match(/role: 'cotyledon'/g) || []).length, 2);
  assert.equal((particles.match(/role: 'true-leaf'/g) || []).length, 2);
  assert.match(particles, /sideSign = index % 2 === 0 \? -1 : 1/);
});

test("renders denser, sharper grains while trunk, root, branch, and leaf contours visibly dissolve", () => {
  assert.match(particles, /PARTICLE_POINT_SIZE_GAIN = 1\.18/);
  assert.match(particles, /SEEDLING_POINT_SIZE_GAIN = 1\.24/);
  assert.match(particles, /PARTICLE_SPATIAL_SCALE = 1\.04/);
  assert.match(particles, /points\.scale\.setScalar\(PARTICLE_SPATIAL_SCALE\)/);
  assert.match(particles, /spatialScale: PARTICLE_SPATIAL_SCALE/);
  assert.match(shaders, /uPointSizeGain/);
  assert.match(shaders, /decodedSize \* perspective \* uPointSizeGain/);
  assert.match(shaders, /0\.68 \* uPointSizeGain/);
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
  assert.match(forest, /edgeDissolveStrength: mode === 'overview' \? 0 : \(motionHasStarted \? 1 : 0\)/);
  assert.match(forest, /edgeDissolveStrength: motionHasStarted \? 1 : 0/);
  assert.match(forest, /antialias:\s*true/);
  assert.match(forest, /Math\.min\(window\.devicePixelRatio, 1\.75\)/);
  assert.match(forest, /hitTarget\.position\.copy\(leaf\.center\)/);
  assert.match(forest, /system\.points\.add\(hitTarget\)/);
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
  assert.match(script, /Visual Note branches/);
  assert.match(script, /Saved learning artifacts/);
  assert.match(script, /Saved source snapshots/);
  assert.match(styles, /\.forest-drawer\.is-open/);
});

test("keeps opt-in external study suggestions separate until the learner saves a source", () => {
  const helperStart = script.indexOf("function normalizeExternalConceptLabel(value)");
  const helperEnd = script.indexOf("function renderExploreFurther(chapter, weakTopics)", helperStart);
  assert.ok(helperStart >= 0 && helperEnd > helperStart);
  const helpers = vm.runInNewContext(`(() => {
    ${script.slice(helperStart, helperEnd)}
    return { getChapterWeakConceptLabels, buildExternalStudySuggestions };
  })()`);
  const weak = helpers.getChapterWeakConceptLabels({
    sessions: [{ id: "note-1", weakTopics: ["  Linear equations  ", "linear equations"] }]
  }, {
    concepts: [{ noteId: "note-1", conceptId: "inverse", conceptLabel: "Inverse operations", state: "weak" }]
  });
  assert.deepEqual([...weak], ["Linear equations", "Inverse operations"]);
  const suggestions = helpers.buildExternalStudySuggestions("x & y");
  assert.equal(suggestions.length, 2);
  suggestions.forEach((suggestion) => assert.match(suggestion.url, /^https:\/\//));
  assert.ok(suggestions.every((suggestion) => suggestion.url.includes("x%20%26%20y")));

  assert.match(script, /dataset\.contentOrigin = "external-unverified"/);
  assert.match(script, /Explore further \(external\)/);
  assert.match(script, /not evidence-checked and never mix with saved evidence/);
  assert.match(script, /action: "save-external-source"/);
  assert.match(script, /page\.inspector\.replaceChildren\(header, workspace,[\s\S]*?exploreFurther/);
  assert.match(popupScript, /action\.action === "save-external-source"[\s\S]*?switchView\("pageView"\)[\s\S]*?selectChapterAcrossControls\(chapter\.id\)[\s\S]*?Save source to chapter/);
  assert.match(styles, /\.external-study-suggestions \{[\s\S]*?border: 1px dashed/);
  assert.match(styles, /\.external-study-card button \{[\s\S]*?min-height: 40px/);
});

test("Full Trail exposes retained local PDF text with a bounded reader", () => {
  const helperStart = script.indexOf("function getSourceContentForDisplay(source)");
  const helperEnd = script.indexOf("function renderSourceCard(source)", helperStart);
  assert.ok(helperStart >= 0 && helperEnd > helperStart);
  const helpers = vm.runInNewContext(`(() => {
    ${script.slice(helperStart, helperEnd)}
    return { getSourceContentForDisplay, getSourceContentPreview };
  })()`);
  const content = helpers.getSourceContentForDisplay({
    documentType: "pdf",
    text: "Page 1 Cell membranes control transport. Page 2 Active transport requires energy."
  });
  assert.equal(content, "Page 1 Cell membranes control transport.\n\nPage 2 Active transport requires energy.");
  assert.match(helpers.getSourceContentPreview(`${content} ${"detail ".repeat(80)}`, 80), /…$/);

  const cardStart = script.indexOf("function renderSourceCard(source)");
  const cardEnd = script.indexOf("function renderSummary(summary)", cardStart);
  const sourceCard = script.slice(cardStart, cardEnd);
  assert.match(sourceCard, /getSourceContentForDisplay\(source\)/);
  assert.match(sourceCard, /source-leaf__preview/);
  assert.match(sourceCard, /Read extracted PDF content/);
  assert.match(sourceCard, /source-leaf__local-badge/);
  assert.match(sourceCard, /pageCount[\s\S]*?pageCount === 1 \? "page" : "pages"/);
  assert.match(styles, /\.source-leaf__content-body \{[^}]*max-height:[^}]*overflow: auto;[^}]*overscroll-behavior: contain;[^}]*white-space: pre-wrap;/);
});

test("zooms to a Visual Tutor Note branch and opens its exact artifact in the bottom drawer", () => {
  assert.match(html, /id="forestDrawer"[^>]*tabindex="-1"/);
  assert.match(script, /onSelectVisualNote\(\{\s*treeId,\s*artifactId\s*\}\)[\s\S]*?selectedVisualNoteId\s*=\s*artifactId[\s\S]*?openDrawer\("chapter"\)/);
  assert.match(script, /page\.drawer\.focus\(\{ preventScroll: true \}\)/);
  assert.match(script, /requestAnimationFrame\(revealSelectedVisualNote\w*\)/);
  assert.match(script, /function revealSelectedVisualNote\w*\(\)/);
  assert.match(script, /scrollIntoView\(\{[\s\S]*?block: "nearest"/);
  assert.match(forest, /function focusVisualNote\(treeId, artifactId\)/);
  assert.match(forest, /record\?\.visualNotes\.find\(\(item\) => item\.id === artifactId\)/);
  assert.match(forest, /CONCEPT_CAMERA_DISTANCE = 2\.75/);
  assert.match(forest, /setCameraTarget\(cameraDestination, framingTarget\)/);
  assert.match(script, /function renderVisualNoteFocus\([\s\S]*?renderChapterNotePreview\(chapter, record, selectedNote\.id\)/);
  assert.match(script, /function renderChapterNotePreview\(chapter, record,\s*preferredArtifactId[\s\S]*?getExactChapterArtifact\(record, preferredArtifactId\)/);
  assert.match(script, /page\.drawer\.classList\.toggle\("is-note-only"/);
  assert.match(styles, /\.forest-drawer\.is-note-only[\s\S]*rgba\(5, 7, 8, 0\.55\)/);
});

test("keeps exact Visual Tutor Note and cheat sheet access in full Note details", () => {
  assert.match(script, /function openFullDetails\(tab, trigger\)/);
  assert.match(script, /function renderChapterNotePreview\(chapter, record,\s*\w+/);
  assert.match(script, /function getExactChapterArtifact\(record,\s*\w+[\s\S]*?selectedVisualNoteId[\s\S]*?savedArtifacts\.find\(\(artifact\) => artifact\.id === artifactId\)/);
  assert.match(script, /savedArtifacts\.find\(\(artifact\) => artifact\.id === artifactId\)/);
  assert.match(script, /Visual Tutor Note/);
  assert.match(script, /function normalizeChapterCheatSheet\(artifact\)/);
  assert.match(script, /normalizeCheatSheetForRender/);
  assert.match(script, /function renderChapterCheatSheet\(sheet\)/);
  assert.match(styles, /\.chapter-focus-message \{/);
  assert.match(styles, /\.visual-tutor-preview__nodes \{/);
  assert.match(styles, /\.chapter-cheat-sheet__table \{/);
  assert.match(styles, /\.forest-drawer \{[\s\S]*bottom: clamp\(22px, 4vh, 42px\)/);
  assert.match(styles, /\.forest-drawer \{[\s\S]*transform: translate\(-50%, calc\(100% \+ 96px\)\)/);
  assert.match(styles, /\.forest-drawer\.is-open \{[\s\S]*transform: translate\(-50%, 0\)/);
  assert.match(styles, /\.forest-drawer \{[\s\S]*pointer-events: none/);
  assert.match(styles, /\.forest-drawer\.is-open \{[\s\S]*pointer-events: auto/);
  assert.match(styles, /\.forest-drawer \{[\s\S]*display: grid[\s\S]*grid-template-rows: auto minmax\(0, 1fr\)[\s\S]*overflow: hidden/);
  assert.match(styles, /\.forest-drawer__chrome \{[\s\S]*position: relative/);
  assert.match(styles, /\.forest-drawer__panel \{[\s\S]*min-height: 0[\s\S]*overflow: auto/);
  assert.doesNotMatch(styles, /\.forest-drawer\s*\{[^}]*position:\s*fixed[^}]*right:\s*0/);
  assert.match(styles, /@media \(max-width: 560px\)[\s\S]*\.forest-controls \{[^}]*display: grid[^}]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
});

test("uses progressive disclosure, responsive regions, and a user-controlled motion state", () => {
  assert.match(html, /class="forest-topbar__meta"/);
  assert.match(html, /id="toggleForestMotion"[^>]*aria-pressed="false"[^>]*>Pause motion</);
  assert.match(html, /<kbd>Drag<\/kbd> orbit[\s\S]*<kbd>Scroll<\/kbd> zoom/);
  assert.match(script, /onSelectTree\(\{\s*treeId\s*\}\) \{[\s\S]*?renderDetails\(\);[\s\S]*?openDrawer\("chapter"\);/);
  assert.match(script, /onSelectVisualNote\(\{\s*treeId,\s*artifactId\s*\}\)[\s\S]*?openDrawer\("chapter"\)/);
  assert.match(script, /function updateMotionControl\(\)[\s\S]*?Resume motion[\s\S]*?Pause motion/);
  assert.match(script, /function rememberDrawerReturnFocus\(preferred\)/);
  assert.match(script, /returnTarget\.focus\(\{ preventScroll: true \}\)/);
  assert.match(forest, /function setMotionPaused\(nextPaused\)/);
  assert.match(forest, /if \(!motionPaused && !settleImmediately && mode !== 'overview'\) motionElapsed \+= delta/);
  assert.match(styles, /\.forest-topbar__meta \{/);
  assert.match(styles, /\.forest-control--motion\[aria-pressed="true"\]/);
  assert.match(styles, /@media \(max-width: 560px\)[\s\S]*\.forest-drawer \{[\s\S]*?bottom: 0;[\s\S]*?width: 100%/);
});

test("documents the current Learning Forest interaction and verification contract", () => {
  assert.match(readme, /full Learning Forest/);
  assert.match(readme, /Pause motion/);
  assert.match(readme, /up to eight meaningful Visual Tutor Note branches/i);
  assert.match(readme, /Visual Tutor Notes.*distinct saved sources|distinct saved sources.*Visual Tutor Notes/i);
  assert.match(readme, /360|orbit/i);
  assert.match(readme, /npm run build:journey/);
  assert.doesNotMatch(readme, /## Current Release|### 0\.[0-9]|Version 0\.[0-9]|tests passing/i);
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
  assert.match(script, /function handlePageKeyDown\(event\)[\s\S]*?event\.key === "Escape"[\s\S]*?dismissDetails\(\)/);
  assert.match(script, /function handleBeforeUnload\(\)[\s\S]*?removeEventListener\("keydown", handlePageKeyDown\)[\s\S]*?removeListener\?\.\(handleStorageChanged\)[\s\S]*?forestController\.destroy\(\)/);
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

test("adds a file-to-chapter outline and chapter workspace inside a collapsible study rail", () => {
  assert.match(html, /id="learningOutline"/);
  assert.match(script, /function renderLearningOutline\(\)[\s\S]*?importedFileId[\s\S]*?learning-outline__file[\s\S]*?renderOutlineChapterNode/);
  assert.match(script, /function renderChapterWorkspace\([\s\S]*?"Source"[\s\S]*?"Visual Note"[\s\S]*?"Cheat Sheet"[\s\S]*?"Summary"[\s\S]*?"Practice"/);
  assert.match(script, /requestChapterResourceGeneration\(chapter, available \? "regenerate" : "retry"\)/);
  assert.match(styles, /\.forest-study-rail[\s\S]*?overflow:\s*auto/);
  assert.match(styles, /\.learning-outline__chapter::before/);
  assert.match(styles, /\.chapter-workspace__tabs[\s\S]*?overflow-x:\s*auto/);
  assert.match(styles, /\.chapter-workspace__panel[\s\S]*?overflow-wrap:\s*anywhere/);
});

test("removes the in-forest chapter study timer and lets the learner close or reopen the study rail", () => {
  assert.doesNotMatch(html, /id="chapterFocusPanel"|id="startChapterFocus"|id="pauseChapterFocus"|id="resumeChapterFocus"|Chapter study timer/);
  assert.doesNotMatch(script, /chapterFocusState|CHAPTER_MESSAGE_TYPES|sendChapterFocusMessage|selectChapterForFocus/);
  assert.match(html, /id="closeStudyRail"[^>]*aria-label="Close the course outline"/);
  assert.match(html, /id="openStudyRail"[^>]*hidden[^>]*aria-label="Open the course outline"/);
  assert.match(script, /page\.closeStudyRail\?\.addEventListener\("click", \(\) => setStudyRailCollapsed\(true\)\)/);
  assert.match(script, /page\.openStudyRail\?\.addEventListener\("click", \(\) => setStudyRailCollapsed\(false\)\)/);
  assert.match(script, /function setStudyRailCollapsed\(collapsed\)[\s\S]*?localStorage\.setItem\(STUDY_RAIL_COLLAPSED_KEY/);
  assert.match(script, /function applyStudyRailState\(\)[\s\S]*?page\.studyRail\.hidden = studyRailCollapsed[\s\S]*?page\.openStudyRail\.hidden = !studyRailCollapsed/);
  assert.match(styles, /\.forest-study-rail__close/);
  assert.match(styles, /\.forest-study-rail__opener/);
});

test("feeds the top-bar Focus stat from externally recorded focus sessions, live for an active session", () => {
  assert.match(html, /id="pageFocusTime"/);
  assert.match(script, /function getLiveFocusMetrics\([\s\S]*?reconcileFocusState[\s\S]*?activeMinutes/);
  assert.match(script, /page\.focus\.textContent = `\$\{metrics\.focusMinutes \+ liveFocus\.activeMinutes\}m`/);
  assert.match(script, /function scheduleFocusMetricsRender\(active\)[\s\S]*?setInterval\(renderHeaderMetrics/);
});
