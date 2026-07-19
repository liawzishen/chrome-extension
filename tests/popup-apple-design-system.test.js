const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "popup.html"), "utf8");
const baseStyles = fs.readFileSync(path.join(root, "popup.css"), "utf8");
const styles = fs.readFileSync(path.join(root, "popup-design-system.css"), "utf8");
const script = fs.readFileSync(path.join(root, "popup.js"), "utf8");
const previewServer = fs.readFileSync(path.join(root, "preview-server.js"), "utf8");
const extensionFiles = fs.readFileSync(path.join(root, "scripts", "extension-files.mjs"), "utf8");

function readHexToken(name) {
  const match = styles.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, "i"));
  assert.ok(match, `Missing --${name}`);
  return match[1];
}

function relativeLuminance(hex) {
  const values = hex.match(/[0-9a-f]{2}/gi).map((part) => Number.parseInt(part, 16) / 255);
  const [red, green, blue] = values.map((value) => (
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  ));
  return (0.2126 * red) + (0.7152 * green) + (0.0722 * blue);
}

function contrastRatio(first, second) {
  const a = relativeLuminance(first);
  const b = relativeLuminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

function viewSource(id, nextId) {
  const start = html.indexOf(`id="${id}"`);
  const end = nextId ? html.indexOf(`id="${nextId}"`, start) : html.length;
  return html.slice(start, end);
}

function visiblePrimaryButtons(source) {
  return [...source.matchAll(/<button\b[^>]*class="([^"]*)"[^>]*>/g)]
    .filter((match) => /(?:^|\s)primary(?:\s|$)/.test(match[1]) && !/(?:^|\s)hidden(?:\s|$)/.test(match[1]));
}

test("the semantic design system is the final popup stylesheet", () => {
  const legacyIndex = html.indexOf('href="popup.css"');
  const systemIndex = html.indexOf('href="popup-design-system.css"');
  assert.ok(legacyIndex >= 0);
  assert.ok(systemIndex > legacyIndex);
  assert.match(styles, /font-family:\s*-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif/);
  assert.match(styles, /--ui-background:\s*#f5f5f7/);
  assert.match(styles, /--ui-surface:\s*#ffffff/);
  assert.match(styles, /--ui-label:\s*#1d1d1f/);
  assert.match(styles, /--ui-accent:\s*#0071e3/);
  assert.doesNotMatch(styles, /(?:linear|radial)-gradient\(/);
  assert.match(previewServer, /\["\/popup-design-system\.css", "popup-design-system\.css"\]/);
});

test("compact Journey cards do not draw a timeline through their chapter numbers", () => {
  assert.doesNotMatch(baseStyles, /\.journey-route(?::not\([^)]*\))?::before\s*\{/);
  assert.doesNotMatch(styles, /\.journey-route(?::not\([^)]*\))?::before\s*\{/);
});

test("rendered semantic colors meet normal-text contrast targets", () => {
  assert.ok(contrastRatio(readHexToken("ui-label"), readHexToken("ui-background")) >= 4.5);
  assert.ok(contrastRatio(readHexToken("ui-label-secondary"), readHexToken("ui-background")) >= 4.5);
  assert.ok(contrastRatio(readHexToken("ui-accent"), readHexToken("ui-surface")) >= 4.5);
  assert.ok(contrastRatio(readHexToken("ui-success"), readHexToken("ui-success-tint")) >= 4.5);
  assert.match(styles, /#statusText\.is-error\s*\{[\s\S]*color:\s*var\(--ui-danger\)/);
  assert.doesNotMatch(script, /#ffb4ad/);
});

test("five compact study destinations use symbols and complete tab semantics", () => {
  assert.equal((html.match(/role="tab"/g) || []).length, 5);
  assert.equal((html.match(/role="tabpanel"/g) || []).length, 5);
  assert.match(html, /<nav class="tabs"[^>]*role="tablist"/);
  const tabNames = {
    dashboardTab: "Dashboard",
    pageTab: "Create",
    journeyTab: "Journey",
    focusTab: "Focus",
    libraryTab: "Library"
  };
  for (const [id, name] of Object.entries(tabNames)) {
    assert.match(html, new RegExp(`id="${id}"[^>]*aria-label="${name}"`));
    assert.match(html, new RegExp(`id="${id}"[\\s\\S]{0,180}class="tab-icon"`));
  }
  assert.match(styles, /\.tabs\s*\{[\s\S]*grid-template-columns:\s*repeat\(5, minmax\(0, 1fr\)\)/);
  assert.match(styles, /\.tab\s*\{[\s\S]*min-height:\s*52px/);
});

test("tab selection exposes roving keyboard navigation without redundant pressed state", () => {
  assert.match(script, /function handleStudyModeKeydown\(event\)/);
  assert.match(script, /\["ArrowLeft", "ArrowRight", "Home", "End"\]/);
  assert.match(script, /nextTab\.focus\(\);\s*switchView\(nextTab\.dataset\.view\)/);
  assert.match(script, /tab\.setAttribute\("aria-selected", String\(selected\)\)/);
  const selectionStart = script.indexOf("function updateStudyModeSelection");
  const selectionBlock = script.slice(selectionStart, selectionStart + 520);
  assert.doesNotMatch(selectionBlock, /aria-pressed/);
  assert.match(script, /view\.setAttribute\("aria-hidden", String\(!active\)\)/);
  assert.match(html, /id="resultView"[^>]*role="region"[^>]*aria-labelledby="sessionTitle"[^>]*aria-hidden="true"/);
});

test("view changes clear stale errors and de-layer the pinned artifact", () => {
  const start = script.indexOf("function switchView(viewId, options = {})");
  const end = script.indexOf("async function handleStudyPage()", start);
  assert.ok(start >= 0 && end > start);
  const switchBlock = script.slice(start, end);
  assert.match(switchBlock, /resultView\.classList\.add\("hidden"\)/);
  assert.match(switchBlock, /resultView\.setAttribute\("aria-hidden", "true"\)/);
  assert.match(switchBlock, /if \(!options\.preserveStatus\) resetStatus\(\)/);
  assert.match(script, /function resetStatus\(\) \{\s*showStatus\(DEFAULT_STATUS_MESSAGE\);\s*\}/);
  assert.match(script, /function showStatus\(message, isError = false\)[\s\S]*classList\.toggle\("is-error", isError\)/);
});

test("primary controls and navigation affordances keep at least 44px hit regions", () => {
  assert.match(styles, /button\s*\{[\s\S]*min-height:\s*44px/);
  assert.match(styles, /\.topbar \.icon-button,[\s\S]*width:\s*44px;[\s\S]*height:\s*44px/);
  assert.match(styles, /\.focus-quick-toggle\s*\{[\s\S]*min-width:\s*44px;[\s\S]*min-height:\s*44px/);
  assert.match(styles, /\.source-card-actions button\s*\{[\s\S]*min-height:\s*44px/);
  assert.match(styles, /\.compact-button\s*\{[\s\S]*min-height:\s*44px/);
  assert.match(styles, /\.vin-map-focus-button\s*\{[\s\S]*min-height:\s*44px/);
});

test("Page actions use one grouped-card hierarchy and both creation panels keep one primary", () => {
  const pageView = viewSource("pageView", "notesView");
  const notesView = viewSource("notesView", "journeyView");
  const groupStart = pageView.indexOf('<div class="action-group page-action-grid"');
  const groupEnd = pageView.indexOf('<input id="bulkImportInput"', groupStart);
  const actionGroup = pageView.slice(groupStart, groupEnd);
  assert.ok(groupStart >= 0 && groupEnd > groupStart);
  assert.equal((actionGroup.match(/class="[^"]*\bprimary\b[^"]*"/g) || []).length, 1);
  assert.equal(visiblePrimaryButtons(pageView).length, 1);
  assert.equal(visiblePrimaryButtons(notesView).length, 1);
  assert.doesNotMatch(pageView, /feature-badge/);
  assert.doesNotMatch(notesView, /feature-badge/);
  assert.match(baseStyles, /\.action-group\s*\{[\s\S]*?border:\s*1px solid var\(--ui-separator\);[\s\S]*?border-radius:\s*var\(--ui-radius-card\);[\s\S]*?padding:\s*var\(--ui-space-4\);[\s\S]*?background:\s*var\(--ui-surface\);/);
  assert.match(baseStyles, /\.action-group__item \+ \.action-group__item\s*\{[\s\S]*?border-top:\s*1px solid var\(--ui-separator\);/);
  assert.match(baseStyles, /\.action-group \.action-group__tertiary\s*\{[\s\S]*?color:\s*var\(--ui-label-secondary\);/);
});

test("Page source composer matches the selected visual reference with five responsive illustrated actions", () => {
  const pageView = viewSource("pageView", "notesView");
  assert.match(pageView, /class="panel page-composer"/);
  assert.match(pageView, /class="action-group page-action-grid"/);
  assert.equal((pageView.match(/<button\b[^>]*class="[^"]*\bpage-action-card\b[^"]*"/g) || []).length, 5);
  assert.match(pageView, /id="studyPageButtonTitle"[^>]*>From Current Page</);
  assert.match(pageView, />From Video</);
  assert.match(pageView, />Paste Notes</);
  assert.match(pageView, />Import Files</);
  assert.match(pageView, />Save Source Only</);
  assert.match(pageView, /<summary>Timestamped transcript<\/summary>/);

  const assetPaths = ["from-page.png", "from-video.png", "import-files.png", "save-source.png"];
  for (const asset of assetPaths) {
    const relativePath = `assets/page-actions/${asset}`;
    assert.match(pageView, new RegExp(`src="${relativePath.replaceAll("/", "\\/")}"`));
    assert.match(previewServer, new RegExp(relativePath.replaceAll("/", "\\/")));
    assert.match(extensionFiles, new RegExp(relativePath.replaceAll("/", "\\/")));
    assert.ok(fs.statSync(path.join(root, ...relativePath.split("/"))).size > 0);
  }

  assert.match(styles, /#pageView \.page-action-grid\s*\{[\s\S]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(styles, /#pageView \.page-action-grid \.page-action-card\s*\{[\s\S]*min-height:\s*132px;[\s\S]*border:\s*1px solid var\(--ui-separator-strong\)/);
  assert.match(styles, /@media \(max-width: 560px\)[\s\S]*#pageView \.page-action-grid\s*\{[\s\S]*grid-template-columns:\s*minmax\(0, 1fr\)/);
  assert.match(script, /function setStudyPageActionCopy\([\s\S]*From Current Page[\s\S]*studyPageButtonTitle\.textContent = title/);
});

test("quiz difficulty is an accessible keyboard-operated segmented control", () => {
  assert.match(html, /id="difficultySegmentedControl"[^>]*role="radiogroup"[^>]*aria-labelledby="pageDifficultyLabel"/);
  assert.equal((html.match(/class="segmented-control__option"[^>]*role="radio"/g) || []).length, 3);
  assert.match(html, /id="pageDifficulty"[^>]*hidden[^>]*aria-hidden="true"/);
  assert.match(script, /function setQuizDifficulty\(value, options = \{\}\)/);
  assert.match(script, /option\.setAttribute\("aria-checked", String\(checked\)\)/);
  assert.match(script, /\["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"\]/);
  assert.match(script, /setQuizDifficulty\(difficultyOptions\[nextIndex\]\.dataset\.value, \{ focus: true \}\)/);
  assert.match(script, /difficultySegmentedControl\?\.querySelector\('\[aria-checked="true"\]'\)\?\.focus\(\)/);
  assert.match(script, /difficulty:\s*elements\.pageDifficulty\.value/);
  assert.match(baseStyles, /\.quiz-settings\s*\{[\s\S]*?width:\s*100%;[\s\S]*?min-width:\s*0;/);
  assert.match(baseStyles, /\.segmented-control\s*\{[\s\S]*?background:\s*var\(--ui-surface-secondary\);/);
  assert.match(baseStyles, /\.segmented-control__option\s*\{[\s\S]*?min-height:\s*44px;/);
  assert.match(baseStyles, /\.segmented-control__option\[aria-checked="true"\]\s*\{[\s\S]*?background:\s*var\(--ui-accent-tint\);/);
});

test("narrow panels cannot create a second tab row or an overlaying action dock", () => {
  assert.match(styles, /body\s*\{[\s\S]*min-width:\s*0/);
  assert.match(styles, /html\s*\{[\s\S]*scroll-padding-top:\s*72px/);
  const narrowStart = styles.indexOf("@media (max-width: 519px)");
  const narrowStyles = styles.slice(narrowStart, styles.indexOf("@media (max-width: 380px)"));
  assert.match(narrowStyles, /\.artifact-action-bar\s*\{[\s\S]*position:\s*static/);
  const mediumStart = styles.indexOf("@media (max-width: 640px)");
  const mediumStyles = styles.slice(mediumStart, narrowStart);
  assert.match(mediumStyles, /\.tabs\s*\{[\s\S]*repeat\(5, minmax\(0, 1fr\)\)/);
  assert.doesNotMatch(mediumStyles, /repeat\(3/);
  assert.match(styles, /\.topbar\s*\{[\s\S]*position:\s*relative/);
  assert.match(styles, /\.tabs\s*\{[\s\S]*position:\s*sticky;[\s\S]*top:\s*0/);
});

test("motion, transparency, contrast, and focus preferences have explicit fallbacks", () => {
  assert.match(styles, /@media \(prefers-contrast: more\)/);
  assert.match(styles, /@media \(prefers-reduced-transparency: reduce\)/);
  assert.match(styles, /backdrop-filter:\s*none/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(styles, /transition:\s*none/);
  assert.match(styles, /button:focus-visible,[\s\S]*outline:\s*3px solid var\(--ui-focus-ring\)/);
});

test("visual-note connector observers and resize listeners are disposed between renders", () => {
  assert.match(script, /function cleanupVisualModelRenderer\(\)/);
  assert.match(script, /resizeObserver\?\.disconnect\(\)/);
  assert.match(script, /window\.removeEventListener\("resize", scheduleConnectorDraw\)/);
  assert.match(script, /if \(connectorFrame\) cancelAnimationFrame\(connectorFrame\)/);
  assert.match(script, /cleanupVisualModelRenderer\(\);[\s\S]*elements\.noteVisual\.replaceChildren\(root\)/);
});
