const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const popupHtml = fs.readFileSync(path.join(root, "popup.html"), "utf8");
const journeyHtml = fs.readFileSync(path.join(root, "journey.html"), "utf8");
const exportHtml = fs.readFileSync(path.join(root, "export.html"), "utf8");
const styles = fs.readFileSync(path.join(root, "vintage-planner.css"), "utf8");
const script = fs.readFileSync(path.join(root, "popup.js"), "utf8");
const previewServer = fs.readFileSync(path.join(root, "preview-server.js"), "utf8");
const extensionFiles = fs.readFileSync(path.join(root, "scripts", "extension-files.mjs"), "utf8");

function relativeLuminance(hex) {
  const channels = hex.match(/[0-9a-f]{2}/gi).map((part) => Number.parseInt(part, 16) / 255);
  const [red, green, blue] = channels.map((value) => (
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  ));
  return (0.2126 * red) + (0.7152 * green) + (0.0722 * blue);
}

function contrastRatio(first, second) {
  const a = relativeLuminance(first);
  const b = relativeLuminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

test("one vintage planner theme is loaded last across every user-facing page", () => {
  assert.ok(popupHtml.indexOf('href="vintage-planner.css"') > popupHtml.indexOf('href="popup-design-system.css"'));
  assert.ok(journeyHtml.indexOf('href="vintage-planner.css"') > journeyHtml.indexOf('href="journey.css"'));
  assert.ok(exportHtml.indexOf('href="vintage-planner.css"') > exportHtml.indexOf('href="export.css"'));
  assert.match(popupHtml, /<body class="vintage-planner vintage-planner--panel">/);
  assert.match(journeyHtml, /<body class="vintage-planner vintage-planner--forest">/);
  assert.match(exportHtml, /<body class="vintage-planner vintage-planner--export">/);
  assert.match(previewServer, /\["\/vintage-planner\.css", "vintage-planner\.css"\]/);
  assert.match(extensionFiles, /"vintage-planner\.css"/);
});

test("shared tokens define leather, paper, ink, brass, typography, spacing, and motion", () => {
  for (const token of [
    "planner-leather-900",
    "planner-paper",
    "planner-paper-edge",
    "planner-ink",
    "planner-brass",
    "planner-oxblood",
    "planner-font-display",
    "planner-space-4",
    "planner-radius-card",
    "planner-shadow-frame",
    "planner-ease"
  ]) {
    assert.match(styles, new RegExp(`--${token}:`));
  }
  assert.match(styles, /--planner-font-display:\s*Georgia, Cambria/);
  assert.match(styles, /\.vintage-planner--panel \.app::before\s*\{[\s\S]*border:\s*1px dashed/);
  assert.match(styles, /\.vintage-planner--panel \.panel,[\s\S]*background:\s*var\(--planner-paper\)/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
});

test("the core paper and leather text pairings exceed normal-text contrast", () => {
  assert.ok(contrastRatio("#30261e", "#fbf4e3") >= 4.5);
  assert.ok(contrastRatio("#655442", "#fbf4e3") >= 4.5);
  assert.ok(contrastRatio("#fff6df", "#6d4930") >= 4.5);
  assert.ok(contrastRatio("#77352f", "#fbf4e3") >= 4.5);
});

test("complex chapter selection uses reusable compact slots and one accessible contents sheet", () => {
  assert.equal((popupHtml.match(/class="toc-entry-slot(?: [^"]*)?"/g) || []).length, 3);
  assert.equal((popupHtml.match(/data-toc-target="(?:dashboard|page|notes)"/g) || []).length, 3);
  assert.match(popupHtml, /id="tocSheetDialog"[^>]*aria-labelledby="tocSheetTitle"[^>]*aria-describedby="tocSheetDescription"/);
  assert.match(popupHtml, /id="tocSheetList"[^>]*role="group"[^>]*aria-label="Available chapters"/);
  assert.match(popupHtml, /id="tocSheetDraftState"[^>]*role="status"[^>]*aria-live="polite"/);
  assert.match(popupHtml, /id="cancelTocSheetButton"[^>]*type="button">Cancel</);
  assert.match(popupHtml, /id="saveTocSheetButton"[^>]*type="submit">Save selection</);
  assert.match(styles, /\.toc-sheet__list\s*\{[\s\S]*overflow-y:\s*auto;[\s\S]*overscroll-behavior:\s*contain/);
  assert.match(styles, /\.toc-sheet__leader\s*\{[\s\S]*border-bottom:\s*2px dotted/);
  assert.match(styles, /\.toc-sheet\s*\{[\s\S]*grid-template-rows:\s*auto minmax\(0, 1fr\) auto/);
});

test("contents-sheet edits remain draft-only until Save and Cancel restores focus", () => {
  const openStart = script.indexOf("function openTocSheet(event)");
  const applyStart = script.indexOf("function applyTocSheetSelection(event)");
  assert.ok(openStart >= 0 && applyStart > openStart);
  const draftBlock = script.slice(openStart, applyStart);
  const applyBlock = script.slice(applyStart, script.indexOf("function openNewChapterDialog", applyStart));
  assert.match(draftBlock, /initialValues:\s*new Set|initialValues,/);
  assert.match(draftBlock, /draftValues:\s*new Set\(initialValues\)/);
  assert.match(draftBlock, /context\.draftValues\.add\(input\.value\)/);
  assert.doesNotMatch(draftBlock, /dashboardChapterOptions\.querySelectorAll\('input\[name="chapterIds"\]'\)\.forEach/);
  assert.match(applyBlock, /dashboardChapterOptions\.querySelectorAll\('input\[name="chapterIds"\]'\)\.forEach/);
  assert.match(applyBlock, /tocSheetDialog\.close\("saved"\)/);
  assert.match(applyBlock, /tocSheetDialog\?\.open[\s\S]*tocSheetDialog\.close\("cancel"\)/);
  assert.match(applyBlock, /requestAnimationFrame\(\(\) => returnFocus\?\.focus\?\.\(\)\)/);
});

test("the Focus chapter sheet searches titles without mutating its draft", () => {
  assert.match(popupHtml, /id="tocSheetSearchInput"[^>]*type="search"[^>]*aria-controls="tocSheetList"/);
  assert.match(popupHtml, /Search focus chapters \(case-sensitive\)/);
  assert.match(popupHtml, /id="tocSheetSearchStatus"[^>]*role="status"[^>]*aria-live="polite"/);
  assert.match(popupHtml, /id="tocSheetClearSearchButton"[^>]*type="button"[^>]*aria-label="Clear chapter search"/);
  assert.match(script, /target,\s*mode: "multiple",\s*searchable: true/);
  assert.match(script, /const preferred = searchEnabled\s*\? elements\.tocSheetSearchInput/);

  const filterStart = script.indexOf("function filterTocSheetEntries()");
  const filterEnd = script.indexOf("function handleTocSheetSearchKeydown", filterStart);
  assert.ok(filterStart >= 0 && filterEnd > filterStart);
  const filterBlock = script.slice(filterStart, filterEnd);
  assert.match(filterBlock, /row\.dataset\.searchText/);
  assert.match(filterBlock, /row\.classList\.toggle\("hidden", !matches\)/);
  assert.match(filterBlock, /No focus chapters match/);
  assert.doesNotMatch(filterBlock, /draftValues|initialValues/);
  const normalizeStart = script.indexOf("function normalizeTocSearchValue(value)");
  const normalizeEnd = script.indexOf("function filterTocSheetEntries()", normalizeStart);
  const normalizeBlock = script.slice(normalizeStart, normalizeEnd);
  assert.doesNotMatch(normalizeBlock, /toLocaleLowerCase|toLowerCase/);
  const normalizeSearch = new Function(`${normalizeBlock}; return normalizeTocSearchValue;`)();
  assert.equal("Biology".includes(normalizeSearch("Bio")), true);
  assert.equal("Biology".includes(normalizeSearch("bio")), false);
  assert.match(styles, /\.toc-sheet__search-control input\s*\{[\s\S]*?min-height:\s*44px/);
});
