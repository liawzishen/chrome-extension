const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const popup = fs.readFileSync(path.join(root, "popup.js"), "utf8");
const html = fs.readFileSync(path.join(root, "popup.html"), "utf8");
const frameReader = fs.readFileSync(path.join(root, "document-frame-reader.js"), "utf8");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));

test("offers an explicit local HTML/PDF picker without requiring file URL permission", () => {
  assert.match(html, /id="openDocumentButton"[^>]*>Open HTML or PDF file/);
  assert.match(html, /id="documentFileInput"[^>]*type="file"[^>]*accept="[^"]*\.html[^"]*\.pdf/);
  assert.match(popup, /state\.importedDocument \|\| await extractCurrentPage\(\)/);
  assert.match(popup, /Only its bounded extracted text will be used when you create the note/);
  assert.match(popup, /state\.importedDocument = null;\s*const refreshed = await detectActiveSource\(\)/);
});

test("declares local file access and gives Chrome's exact toggle guidance", () => {
  assert.ok(manifest.optional_host_permissions.includes("file:///*"));
  assert.match(popup, /chrome\.extension\.isAllowedFileSchemeAccess/);
  assert.match(popup, /FILE_ACCESS_GUIDANCE/);
});

test("remote document fetch is bounded, credentialless, and redirect permission checked", () => {
  assert.match(popup, /credentials:\s*"omit"/);
  assert.match(popup, /cache:\s*"no-store"/);
  assert.match(popup, /referrerPolicy:\s*"no-referrer"/);
  assert.match(popup, /response\.headers\.get\("content-length"\)/);
  assert.match(popup, /response\.body\.getReader\(\)/);
  assert.match(popup, /if \(total > Reader\.MAX_PDF_BYTES\)/);
  assert.match(popup, /ensureDocumentUrlAccess\(response\.url, \{ request: false \}\)/);
});

test("active HTML extraction has hard traversal, chunk, time, and text budgets", () => {
  assert.match(popup, /target:\s*\{ tabId: tab\.id, allFrames: true \}/);
  assert.match(popup, /files:\s*\["document-frame-reader\.js"\]/);
  assert.match(popup, /mergeFrameSnapshots\(frameResults/);
  assert.match(frameReader, /const MAX_NODES = 2500/);
  assert.match(frameReader, /const MAX_CHUNKS = 220/);
  assert.match(frameReader, /const MAX_TEXT = 16000/);
  assert.match(frameReader, /performance\.now\(\) <= deadline/);
  assert.match(frameReader, /shadowRoot\?\.mode === "open"/);
  assert.match(frameReader, /element\.hidden \|\| element\.inert/);
  assert.match(frameReader, /slice\(0, MAX_NODE_RAW_TEXT\)/);
  assert.doesNotMatch(popup, /clone\.querySelectorAll\(blockedSelector\)/);
  assert.doesNotMatch(popup, /\[\.\.\.seen\]\.some/);
});

test("uses a multilingual quality gate instead of the old raw 300-character page gate", () => {
  assert.match(popup, /assertReadableContent\(page\.text, page\.documentType \|\| "html"\)/);
  assert.doesNotMatch(popup, /page\.text\.length < 300/);
  assert.doesNotMatch(popup, /This HTML page does not have enough readable study text/);
});

test("multi-frame fixture contains a top shell, a rich child frame, open shadow content, and hidden noise", () => {
  const shell = fs.readFileSync(path.join(root, "tests", "fixtures", "document-frame-shell.html"), "utf8");
  const child = fs.readFileSync(path.join(root, "tests", "fixtures", "document-frame-child.html"), "utf8");
  assert.match(shell, /attachShadow\(\{ mode: "open" \}\)/);
  assert.match(shell, /<iframe[^>]+document-frame-child\.html/);
  assert.match(shell, /<p hidden>/);
  assert.match(shell, /细胞膜具有选择透过性/);
  assert.match(child, /Passive transport moves substances/);
});

test("PDF parsing is local, page anchored, and disables dynamic PDF evaluation", () => {
  const reader = fs.readFileSync(path.join(root, "document-reader-utils.js"), "utf8");
  assert.match(reader, /isEvalSupported:\s*false/);
  assert.match(reader, /`Page \$\{pageNumber\}\\n\$\{pageText\}`/);
  assert.match(reader, /PDF_ENCRYPTED/);
  assert.match(reader, /PDF_NO_TEXT/);
  assert.match(reader, /PDF_PARSE_TIMEOUT/);
  assert.doesNotMatch(popup, /localStorage.*fetched\.bytes|setStorage\([^\n]*fetched\.bytes/);
});

test("PDF evidence is labelled clearly and never offers an HTML highlight action", () => {
  assert.match(popup, /This passage was extracted locally from the selected PDF/);
  assert.match(popup, /!isPdfDocument && \["webpage", "collection"\]/);
  assert.match(popup, /Open original PDF/);
  assert.match(popup, /source\.documentType === "pdf" \? "PDF"/);
});
