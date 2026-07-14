const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const html = fs.readFileSync(path.join(__dirname, "..", "popup.html"), "utf8");
const script = fs.readFileSync(path.join(__dirname, "..", "popup.js"), "utf8");
const styles = fs.readFileSync(path.join(__dirname, "..", "popup.css"), "utf8");
const previewServer = fs.readFileSync(path.join(__dirname, "..", "preview-server.js"), "utf8");

test("visual notes expose a source-grounded cheat sheet before the connected mind map", () => {
  const cheatIndex = html.indexOf('id="cheatSheetBlock"');
  const visualIndex = html.indexOf('id="noteVisual"');
  assert.ok(cheatIndex > 0);
  assert.ok(visualIndex > cheatIndex);
  assert.match(html, /<script src="cheat-sheet-utils\.js"><\/script>[\s\S]*<script src="popup\.js"><\/script>/);
  assert.match(previewServer, /\["\/cheat-sheet-utils\.js", "cheat-sheet-utils\.js"\]/);
  assert.match(script, /cheatSheet: normalizedCheatSheet/);
  assert.match(script, /renderCheatSheet\(note\);[\s\S]{0,100}renderNoteVisual/);
  assert.match(script, /renderCheatSheet\(session\);[\s\S]{0,100}renderQuizVisual/);
});

test("cheat sheet uses an accessible semantic table with grounded evidence actions", () => {
  assert.match(script, /document\.createElement\("table"\)/);
  assert.match(script, /document\.createElement\("caption"\)/);
  assert.match(script, /header\.scope = "col"/);
  assert.match(script, /cell\.scope = "row"/);
  assert.match(script, /cell\.dataset\.label = column\.label/);
  assert.match(script, /Jump to \$\{formatTimestamp\(evidence\.timestampSeconds\)\}/);
  assert.match(script, /sourceLink\.rel = "noopener noreferrer"/);
});

test("cheat sheet reflows into labelled row cards without horizontal scrolling", () => {
  assert.match(styles, /\.cheat-sheet-table\s*\{[\s\S]*table-layout:\s*fixed/);
  assert.match(styles, /@media \(max-width: 760px\)[\s\S]*\.cheat-sheet-table tbody\s*\{[\s\S]*display:\s*grid/);
  assert.match(styles, /\.cheat-sheet-table th::before,[\s\S]*content:\s*attr\(data-label\)/);
  assert.doesNotMatch(styles, /\.cheat-sheet-table-host\s*\{[^}]*overflow-x:\s*(auto|scroll)/);
});
