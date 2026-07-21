const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const script = fs.readFileSync(path.join(root, "popup.js"), "utf8");
const html = fs.readFileSync(path.join(root, "popup.html"), "utf8");
const styles = fs.readFileSync(path.join(root, "popup-design-system.css"), "utf8");

function sourceBetween(startMarker, endMarker) {
  const start = script.indexOf(startMarker);
  const end = script.indexOf(endMarker, start + startMarker.length);
  assert.ok(start >= 0, `Missing ${startMarker}`);
  assert.ok(end > start, `Missing ${endMarker}`);
  return script.slice(start, end).trim();
}

test("the no-setup demo uses a curated mathematics source with exact evidence", () => {
  const buildDemo = vm.runInNewContext(
    `(${sourceBetween("function buildCuratedMathDemoNote()", "function buildCuratedMathDemoQuiz")})`,
    {
      CURATED_DEMO_CHAPTER_TITLE: "Demo - Linear Equations",
      CURATED_DEMO_NOTE_ID: "demo-linear-equations-note",
      CURATED_DEMO_SOURCE_ID: "demo-linear-equations-source",
      CURATED_DEMO_FINGERPRINT: "demo:linear-equations:v1",
      Date
    }
  );
  const note = buildDemo();

  assert.equal(note.demoMode, true);
  assert.equal(note.journeyChapterTitle, "Demo - Linear Equations");
  assert.match(note.title, /2\(x \+ 3\) = 18/);
  assert.equal(note.evidenceStatus.label, "Evidence checked");
  assert.equal(note.visualLesson.visualModel.nodes.length, 4);
  for (const node of note.visualLesson.visualModel.nodes) {
    assert.ok(note.sourceBinding.rawText.includes(node.sourceText), `${node.id} must quote the saved source`);
    assert.equal(node.sourceRef.sourceId, "demo-linear-equations-source");
  }
});

test("the demo bypasses generic quiz configuration with exactly one validated question", () => {
  const demoQuiz = sourceBetween("function buildCuratedMathDemoQuiz", "async function openCuratedMathDemoQuiz");
  const quizEntry = sourceBetween("function openQuizSettings", "function isStudyServiceUnreachableError");
  const launcher = sourceBetween("async function openCuratedMathDemoQuiz", "async function createStudyNote");

  assert.match(demoQuiz, /questionCount:\s*1/);
  assert.match(demoQuiz, /choices:\s*\["x = 6", "x \+ 3 = 9", "divide both sides by 2", "subtract 3 from both sides"\]/);
  assert.match(demoQuiz, /validateGeneratedQuiz\(normalized, input, "Curated demo quiz"\)/);
  assert.match(quizEntry, /if \(artifact\.demoMode\) \{\s*void openCuratedMathDemoQuiz\(artifact\);/);
  assert.match(launcher, /recordLearningItem\(\s*session,/);
  assert.match(launcher, /saveLibraryItem\(session\)/);
});

test("the trust UI exposes evidence status and a local unsupported-claim report", () => {
  assert.match(html, /id="demoNoteButton"[^>]*>Try 60-sec math demo</);
  assert.match(html, /Zero setup: curated source - evidence-linked visual note - one answer - Journey update\./);
  assert.match(script, /function getEvidenceStatus\(item = \{\}\)/);
  assert.match(script, /Evidence checked/);
  assert.match(script, /function reportUnsupportedClaim\(context = \{\}, node = \{\}, evidence = \{\}\)/);
  assert.match(script, /Report unsupported claim/);
  assert.match(script, /claimReports: "neatMindUnsupportedClaimReports"/);
  assert.match(styles, /\.evidence-status\s*\{/);
  assert.match(styles, /\.vin-report-button\s*\{/);
});

test("the runtime has one explicit curated Mathematics demo boundary", () => {
  assert.match(script, /async function handleCuratedMathDemo\(\)/);
  assert.match(script, /function buildCuratedMathDemoNote\(\)/);
  assert.match(script, /function buildCuratedMathDemoQuiz\(note\)/);
  assert.match(script, /async function openCuratedMathDemoQuiz\(artifact\)/);
  assert.doesNotMatch(script, /photosynthesis|chlorophyll|chloroplast/i);
});
