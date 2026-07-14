const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const styles = fs.readFileSync(path.join(__dirname, "..", "popup.css"), "utf8");
const script = fs.readFileSync(path.join(__dirname, "..", "popup.js"), "utf8");

test("compact Journey artifacts use separate readable title and provenance fields", () => {
  assert.match(script, /copy\.className = "journey-artifact-copy"/);
  assert.match(script, /"journey-artifact-kind"/);
  assert.match(script, /"journey-artifact-title"/);
  assert.match(script, /"journey-artifact-date"/);
  assert.match(script, /"journey-artifact-source"/);
  assert.match(script, /open\.addEventListener\("click", \(\) => void openJourneyArtifact\(session\.id\)\)/);
});

test("compact Journey rows wrap without ellipsis and keep touch-sized actions", () => {
  assert.match(styles, /\.journey-source-row span\s*\{[\s\S]*?overflow-wrap:\s*anywhere;[\s\S]*?text-overflow:\s*clip;[\s\S]*?white-space:\s*normal;/);
  assert.match(styles, /\.journey-source-row > \.text-button\s*\{[\s\S]*?min-height:\s*44px;/);
  assert.match(styles, /\.journey-artifact-row\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\) minmax\(100px, auto\);/);
});

test("artifact actions become full-width cards through 640px", () => {
  assert.match(styles, /@media \(max-width: 640px\)\s*\{[\s\S]*?\.journey-artifact-row\s*\{\s*grid-template-columns:\s*minmax\(0, 1fr\);[\s\S]*?\.journey-artifact-open\s*\{[\s\S]*?width:\s*100%;[\s\S]*?min-width:\s*0;/);
});
