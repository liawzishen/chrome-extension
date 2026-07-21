const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const script = fs.readFileSync(path.join(root, "popup.js"), "utf8");
const styles = fs.readFileSync(path.join(root, "popup.css"), "utf8");
const journeyPage = fs.readFileSync(path.join(root, "journey-page.js"), "utf8");

function readFunction(startMarker, endMarker) {
  const start = script.indexOf(startMarker);
  const end = script.indexOf(endMarker, start + startMarker.length);
  assert.ok(start >= 0, `Missing ${startMarker}`);
  assert.ok(end > start, `Missing ${endMarker}`);
  return script.slice(start, end).trim();
}

test("AI note fallbacks have a visible explanation, a safe reason, and a retry action", () => {
  assert.match(script, /function renderArtifactSourceBanner\(item\)[\s\S]*?classList\.toggle\("is-ai-fallback", Boolean\(item\?\.usedLocalFallback\)\)/);
  assert.match(script, /function renderAiFallbackBanner\(item\)[\s\S]*?AI backend unavailable \\u2014 showing local outline/);
  assert.match(script, /retry\.textContent = "Retry with AI"/);
  assert.match(script, /retry\.addEventListener\("click", \(\) => void retryNoteWithAi\(item, retry\)\)/);
  assert.match(styles, /\.artifact-source-banner\.is-ai-fallback\s*\{/);
  assert.match(styles, /\.artifact-source-fallback__retry\s*\{/);

  const sanitize = vm.runInNewContext(`(${readFunction("function sanitizeAiFallbackReason(value)", "function buildAiRetryStudyInput(item)")})`);
  assert.equal(sanitize("PROVIDER_UNAVAILABLE from https://ai.example.test"), "Gemini could not complete this request.");
  assert.equal(sanitize("network timeout at https://ai.example.test"), "The configured AI backend could not be reached.");
  assert.doesNotMatch(sanitize("apiKey=secret-value https://ai.example.test/private"), /secret-value|https?:\/\//i);
});

test("local visual-note presentation suppresses repeated examples but retains labelled source evidence", () => {
  assert.match(script, /const example = suppliedExample && !sameVisualText\(suppliedExample, detail\) && !sameVisualText\(suppliedExample, sourceText\)/);
  assert.match(script, /const appendDistinctDetail = \(label, value\) => \{[\s\S]*?visibleDetails\.some\(\(previous\) => sameVisualText\(previous, text\)\)/);
  assert.match(script, /if \(node\.sourceText\) \{[\s\S]*?createElement\("strong", "Source evidence"/);
});

test("a hidden active-tab URL directs the learner to the toolbar rather than a dead permission state", () => {
  assert.match(script, /const activeUrlIsHidden = error\?\.code === "UNSUPPORTED_DOCUMENT_URL" && !String\(tab\?\.url \|\| ""\)\.trim\(\)/);
  assert.match(script, /Click the NeatMind toolbar icon while this tab is active, then return to the panel\./);
  assert.match(script, /state\.sourceVisibilityNeedsToolbar = activeUrlIsHidden/);
  assert.match(script, /elements\.accessBanner\?\.classList\.add\("hidden"\)/);
  assert.match(script, /!refreshed && !state\.sourceVisibilityNeedsToolbar/);
});

test("the new-chapter modal remains within a 360-pixel panel and the full Journey view de-duplicates cards", () => {
  const dialogStyles = styles.match(/\.new-chapter-dialog\s*\{[\s\S]*?\n\}/)?.[0] || "";
  assert.match(dialogStyles, /box-sizing:\s*border-box/);
  assert.match(dialogStyles, /max-width:\s*calc\(100vw - 24px\)/);
  assert.match(dialogStyles, /min-width:\s*0/);
  assert.match(dialogStyles, /overflow-x:\s*clip/);
  assert.match(styles, /\.new-chapter-dialog input\s*\{[\s\S]*?width:\s*100%/);
  assert.match(journeyPage, /const visibleArtifacts = globalThis\.NeatMindJourney\.getChapterArtifactTimeline\(chapter, savedArtifacts\)/);
  assert.match(journeyPage, /Showing the \$\{visibleArtifacts\.length\} newest unique artifacts\. Older saves remain in Library\./);
});
