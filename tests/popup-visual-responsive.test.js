const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const styles = fs.readFileSync(path.join(__dirname, "..", "popup.css"), "utf8");
const script = fs.readFileSync(path.join(__dirname, "..", "popup.js"), "utf8");
const heavyFixture = JSON.parse(fs.readFileSync(path.join(__dirname, "fixtures", "heavy-visual-note.json"), "utf8"));
const mindMapStart = styles.indexOf("/* Connected mind-map visual tutor");
const mindMapStyles = mindMapStart >= 0 ? styles.slice(mindMapStart) : "";

test("heavy-note fixture exercises eight long concepts, twelve edges, and dense summaries", () => {
  assert.equal(heavyFixture.visualModel.nodes.length, 8);
  assert.equal(heavyFixture.visualModel.edges.length, 12);
  assert.equal(heavyFixture.summary.length, 5);
  assert.ok(heavyFixture.visualModel.nodes.every((node) => node.label.length > 40));
  assert.ok(heavyFixture.summary.join(" ").length > 700);
});

test("visual tutor renders a central topic with explicit primary and secondary hierarchy", () => {
  assert.match(script, /function buildMindMapHierarchy\(model\)/);
  assert.match(script, /primaryLimit = nodes\.length <= 3 \? nodes\.length : Math\.min\(nodes\.length, nodes\.length <= 5 \? 3 : 4\)/);
  assert.match(script, /createElement\("span", "Central topic", "vin-map-root-label"\)/);
  assert.match(script, /className = "vin-map-branches"/);
  assert.match(script, /createMindMapNode\(branch\.node, branch\.relationship, "primary"/);
  assert.match(script, /createMindMapNode\(child\.node, child\.relationship, "secondary"/);
  assert.match(mindMapStyles, /\.vin-map-root\s*\{[\s\S]*border:\s*2px solid var\(--accent\)/);
  assert.match(mindMapStyles, /\.vin-map-branches\s*\{[\s\S]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);
});

test("connection lines remain visible and use stronger primary than secondary weight", () => {
  assert.match(script, /classList\.add\("vin-map-connectors"\)/);
  assert.match(script, /renderMindMapConnectorPath\(connectorLayer/);
  assert.match(script, /structuralConnectors\.forEach/);
  assert.match(script, /level:\s*"primary"/);
  assert.match(script, /level:\s*"secondary"/);
  assert.match(script, /level:\s*"cross"/);
  assert.match(mindMapStyles, /\.vin-map-connectors\s*\{[\s\S]*display:\s*block/);
  assert.match(mindMapStyles, /\.vin-map-path\.is-primary\s*\{[\s\S]*stroke-width:\s*3/);
  assert.match(mindMapStyles, /\.vin-map-path\.is-secondary\s*\{[\s\S]*stroke-width:\s*1\.75/);
  assert.match(mindMapStyles, /\.vin-map-path\.is-cross\s*\{[\s\S]*stroke-dasharray:\s*5 4/);
  assert.doesNotMatch(mindMapStyles, /\.vin-map-connectors\s*\{[\s\S]{0,140}display:\s*none/);
});

test("relationship labels are anchored inside nodes so long text cannot collide with lines", () => {
  assert.match(script, /createElement\("span", relationship, "vin-map-node-relation"\)/);
  assert.match(script, /entry\.relation\.textContent = connected && selectedEdge \? selectedEdge\.label : entry\.baseRelationship/);
  assert.match(mindMapStyles, /\.vin-map-node-relation\s*\{[\s\S]*overflow-wrap:\s*anywhere/);
  assert.match(mindMapStyles, /\.vin-mindmap-lesson \.vin-map-node \.vin-node-label\s*\{[\s\S]*overflow-wrap:\s*anywhere/);
});

test("selection exposes a focused connected submap without removing the full overview", () => {
  assert.match(script, /focusButton\.textContent = "Focus selected branch"/);
  assert.match(script, /branchFocusActive = !branchFocusActive/);
  assert.match(script, /connectedVisualNodeIds\(selectedNodeId, model\.edges\)/);
  assert.match(script, /model\.edges\.filter\(\(edge\) => edge\.from === selectedNodeId \|\| edge\.to === selectedNodeId\)/);
  assert.match(script, /renderVisualNodeDetail\(detailPanel, selectedNode, scenario, context, model\)/);
  assert.match(mindMapStyles, /\.vin-mindmap-lesson \.vin-map-node\.is-focus-muted\s*\{[\s\S]*opacity:\s*\.22/);
  assert.match(mindMapStyles, /\.vin-map-path\.is-active\s*\{[\s\S]*stroke-width:\s*3\.25/);
});

test("mind map supports keyboard traversal, visible state, and resize-safe connector redraw", () => {
  assert.match(script, /\["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"\]/);
  assert.match(script, /orderedButtons\[nextIndex\]\.focus\(\)/);
  assert.match(script, /new ResizeObserver\(scheduleConnectorDraw\)/);
  assert.match(script, /progressText\.textContent = `\$\{exploredCount\} of \$\{total\} concepts explored`/);
  assert.match(script, /progressTrack\.setAttribute\("aria-valuenow"/);
  assert.match(mindMapStyles, /\.vin-mindmap-lesson \.vin-map-node\.is-selected\s*\{[\s\S]*box-shadow:\s*0 0 0 3px/);
});

test("320, 360, and 429 pixel panels use a connected one-column tree without horizontal scrolling", () => {
  assert.match(mindMapStyles, /@media \(max-width: 519px\)/);
  assert.match(mindMapStyles, /\.vin-map-branches\s*\{[\s\S]*grid-template-columns:\s*minmax\(0, 1fr\)/);
  assert.match(mindMapStyles, /\.vin-map-focus-button\s*\{[\s\S]*width:\s*100%;[\s\S]*min-height:\s*44px/);
  assert.match(mindMapStyles, /\.vin-map-secondary-group\s*\{[\s\S]*margin-left:\s*14px/);
  assert.doesNotMatch(mindMapStyles, /overflow-x:\s*(auto|scroll)/);
});

test("640 pixel panels use two readable branches and detail content remains in normal flow", () => {
  assert.match(mindMapStyles, /\.vin-map-branches\s*\{[\s\S]*repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(mindMapStyles, /\.vin-mindmap-lesson \.vin-detail\s*\{[\s\S]*max-height:\s*none;[\s\S]*overflow:\s*visible/);
  assert.match(mindMapStyles, /\.vin-map-canvas\s*\{[\s\S]*width:\s*100%;[\s\S]*overflow:\s*visible/);
});

test("mind map height wins the cascade and reserves every branch before concept detail", () => {
  const genericSceneSizing = styles.indexOf("/* Professional visual-note hierarchy");
  const mindMapFlowOverride = styles.search(/\/\*\r?\n \* Mind maps grow with their branch grid/);
  assert.ok(genericSceneSizing >= 0);
  assert.ok(mindMapFlowOverride > genericSceneSizing);
  const finalMindMapStyles = styles.slice(mindMapFlowOverride);
  assert.match(finalMindMapStyles, /\.vin-mindmap-lesson \.vin-mindmap-scene,[\s\S]*height:\s*auto;[\s\S]*min-height:\s*0;[\s\S]*overflow:\s*visible/);
  assert.match(finalMindMapStyles, /\.vin-mindmap-lesson \.vin-map-canvas,[\s\S]*\.vin-mindmap-lesson \.vin-map-branches\s*\{[\s\S]*height:\s*auto/);
});

test("reduced motion removes map transitions", () => {
  assert.match(mindMapStyles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(mindMapStyles, /\.vin-map-path,[\s\S]*\.vin-mindmap-lesson \.vin-map-node\s*\{[\s\S]*transition:\s*none/);
});

test("narrow sticky actions stay compact and cannot cover scrolled note controls", () => {
  assert.match(styles, /html,[\s\S]*body\s*\{[\s\S]*scroll-padding-bottom:\s*86px/);
  const narrowStart = styles.indexOf("@media (max-width: 519px)");
  const narrowStyles = narrowStart >= 0 ? styles.slice(narrowStart) : "";
  assert.match(narrowStyles, /\.artifact-action-bar\s*\{[\s\S]*grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(narrowStyles, /\.artifact-action-bar button\s*\{[\s\S]*min-height:\s*46px/);
  assert.match(narrowStyles, /\.result-view button,[\s\S]*\.result-view summary\s*\{[\s\S]*scroll-margin-bottom:\s*86px/);
});
