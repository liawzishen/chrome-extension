const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync, statSync } = require("node:fs");
const { join } = require("node:path");
const JSZip = require("jszip");
const { PDFDocument } = require("pdf-lib");

require("../export-utils.js");

const api = globalThis.NeatMindExport;

function studyItem(overrides = {}) {
  return {
    id: "note-energy",
    title: "Energy lesson",
    sourceType: "video",
    sourceUrl: "https://example.com/lesson",
    sourceTitle: "Energy lecture",
    timestampConfidence: "AI-estimated",
    journeyChapterTitle: "Chapter 2: Energy",
    createdAt: "2026-07-11T04:00:00.000Z",
    summary: ["Energy changes form.", "Systems transfer energy."],
    capturedText: "PRIVATE RAW SOURCE MUST NOT EXPORT",
    rawAudioBase64: "PRIVATE AUDIO MUST NOT EXPORT",
    visualLesson: {
      visualModel: {
        title: "Energy flow",
        objective: "Trace the change.",
        nodes: [
          { id: "input", label: "Input", detail: "Starts <here>", why: "It powers the system", example: "Light", sourceAnchor: "Energy enters", sourceTimestamp: 65 },
          { id: "output", label: "Output", detail: "Ends here" }
        ],
        edges: [{ from: "input", to: "output", label: "becomes" }],
        scenarios: [{ label: "Less input", prompt: "Reduce it", outcome: "Output falls", insight: "The path depends on input" }]
      }
    },
    ...overrides
  };
}

function quizFields(submitted = false) {
  return {
    questions: [{
      id: "q1",
      prompt: "What is the result?",
      choices: ["Input", "Output", "Neither", "Both"],
      answer: "Output",
      explanation: "The source identifies the output.",
      sourceText: "Output is produced.",
      sourceTimestamp: 65
    }],
    answers: { q1: "Input" },
    score: submitted ? 0 : null,
    submittedAt: submitted ? "2026-07-11T05:00:00.000Z" : null
  };
}

test("sanitizes a legacy study session into a bounded ExportModel without raw captures", () => {
  const model = api.createExportModel(studyItem());
  assert.equal(model.schema, api.MODEL_SCHEMA);
  assert.equal(model.source.hostname, "example.com");
  assert.equal(model.source.chapter, "Chapter 2: Energy");
  assert.deepEqual(model.keyPoints, ["Energy changes form.", "Systems transfer energy."]);
  assert.equal(model.visualNote.concepts[0].citation.timestamp, 65);
  assert.equal(JSON.stringify(model).includes("PRIVATE RAW SOURCE"), false);
  assert.equal(JSON.stringify(model).includes("PRIVATE AUDIO"), false);
});

test("labels a PDF-backed visual note as a PDF source in exports", () => {
  const model = api.createExportModel(studyItem({
    sourceType: "webpage",
    sourceBinding: {
      type: "webpage",
      sourceType: "webpage",
      documentType: "pdf",
      title: "Cell transport handbook",
      url: "https://example.com/cell-transport.pdf"
    }
  }));
  assert.equal(model.source.type, "pdf");
  assert.equal(model.source.title, "Cell transport handbook");
});

test("exports the grounded cheat sheet while excluding private raw evidence", () => {
  const item = studyItem({
    cheatSheet: {
      title: "Energy cheat sheet",
      caption: "The important ideas and where to verify them.",
      rows: [{
        topic: "Energy transfer",
        mainIdea: "Energy moves between parts of a system.",
        keyFacts: "Total energy is conserved.",
        example: "Light becomes stored chemical energy.",
        evidence: {
          label: "1:05 · Video transcript",
          anchor: "Energy enters the system.",
          timestampSeconds: 65,
          url: "https://example.com/lesson"
        },
        privateRawText: "DO NOT EXPORT THIS RAW TRANSCRIPT"
      }]
    }
  });
  const model = api.createExportModel(item);
  const html = api.buildExportBody(model, api.getDefaultSelections(model));

  assert.equal(model.cheatSheet.rows.length, 1);
  assert.match(html, /Energy cheat sheet/);
  assert.match(html, /Topic \/ concept/);
  assert.match(html, /Energy transfer/);
  assert.match(html, /1:05/);
  assert.doesNotMatch(JSON.stringify(model), /DO NOT EXPORT THIS RAW TRANSCRIPT/);
});

test("note-only preview uses a static visual label and disables unavailable quiz sections", () => {
  const item = studyItem();
  const availability = api.getAvailability(item);
  const selections = api.getDefaultSelections(item);
  const html = api.buildExportBody(item, selections);

  assert.equal(availability.quiz, false);
  assert.equal(availability.answerKey, false);
  assert.equal(selections.quiz, false);
  assert.equal(selections.answerKey, false);
  assert.match(html, /Visual study note — static export/);
  assert.match(html, /Input — becomes → Output/);
  assert.doesNotMatch(html, /Practice quiz/);
  assert.doesNotMatch(html, /Answer key/);
  assert.match(html, /Starts &lt;here&gt;/);
});

test("quiz is selectable while an unsubmitted answer key defaults off", () => {
  const item = studyItem(quizFields(false));
  const defaults = api.getDefaultSelections(item);
  assert.equal(defaults.quiz, true);
  assert.equal(defaults.answerKey, false);

  const quizHtml = api.buildExportBody(item, defaults);
  assert.match(quizHtml, /Practice quiz/);
  assert.match(quizHtml, /Your choice:<\/strong> Input/);
  assert.doesNotMatch(quizHtml, /Answers and explanations/);

  const withKey = api.buildExportBody(item, { ...defaults, answerKey: true });
  assert.match(withKey, /Answers and explanations/);
  assert.match(withKey, /Video time 1:05 \(AI-estimated\)/);
});

test("submitted quizzes include a separate answer key by default", () => {
  const item = studyItem(quizFields(true));
  const defaults = api.getDefaultSelections(item);
  const html = api.buildExportBody(item, defaults);
  assert.equal(defaults.answerKey, true);
  assert.match(html, /Score: <strong>0%/);
  assert.match(html, /answer-key-export/);
  assert.match(html, /Answer:<\/strong> Output/);
});

test("escapes generated content and rejects unsafe source links", () => {
  const model = api.createExportModel({
    title: "<img src=x onerror=alert(1)>",
    sourceUrl: "javascript:alert(1)",
    summary: ["<script>alert(1)</script>"]
  });
  const html = api.buildExportBody(model, { keyPoints: true });

  assert.doesNotMatch(html, /<script>/);
  assert.doesNotMatch(html, /javascript:/);
  assert.match(html, /&lt;img/);
  assert.match(html, /&lt;script&gt;/);
});

test("uses a title-date filename with the requested real extension", () => {
  const date = new Date(2026, 6, 11, 9, 30, 0);
  assert.equal(api.buildFilename({ title: "Cell Transport!" }, "docx", date), "cell-transport-2026-07-11.docx");
  assert.equal(api.buildFilename({ title: "Cell Transport!" }, "pdf", date), "cell-transport-2026-07-11.pdf");
});

test("creates a genuine OOXML DOCX with note, quiz, and answer-key content", async () => {
  const item = studyItem(quizFields(true));
  const bytes = await api.createDocxBytes(item, api.getDefaultSelections(item));
  assert.equal(Buffer.from(bytes.subarray(0, 2)).toString("ascii"), "PK");

  const zip = await JSZip.loadAsync(bytes);
  assert.ok(zip.file("[Content_Types].xml"));
  assert.ok(zip.file("word/document.xml"));
  const xml = await zip.file("word/document.xml").async("string");
  assert.match(xml, /Visual study note/);
  assert.match(xml, /Practice quiz/);
  assert.match(xml, /Answers and explanations/);
  assert.doesNotMatch(xml, /PRIVATE RAW SOURCE|PRIVATE AUDIO/);
});

test("creates a direct PDF and starts the answer key on a later page", async () => {
  const item = studyItem(quizFields(true));
  const bytes = await api.createPdfBytes(item, api.getDefaultSelections(item));
  assert.equal(Buffer.from(bytes.subarray(0, 5)).toString("ascii"), "%PDF-");

  const pdf = await PDFDocument.load(bytes);
  assert.ok(pdf.getPageCount() >= 2);
});

test("note-only DOCX and PDF remain valid without a quiz", async () => {
  const item = studyItem();
  const selections = api.getDefaultSelections(item);
  const [docxBytes, pdfBytes] = await Promise.all([
    api.createDocxBytes(item, selections),
    api.createPdfBytes(item, selections)
  ]);
  assert.equal(Buffer.from(docxBytes.subarray(0, 2)).toString("ascii"), "PK");
  assert.equal(Buffer.from(pdfBytes.subarray(0, 5)).toString("ascii"), "%PDF-");
});

test("export payload remains valid until its expiry window", () => {
  const now = Date.parse("2026-07-11T06:00:00.000Z");
  assert.equal(api.isExportPayloadFresh({ exportedAt: "2026-07-11T05:30:00.000Z" }, now), true);
  assert.equal(api.isExportPayloadFresh({ exportedAt: "2026-07-11T04:00:00.000Z" }, now), false);
  assert.equal(api.isExportPayloadFresh({ exportedAt: "2026-07-11T04:00:00.000Z", expiresAt: "2026-07-11T06:30:00.000Z" }, now), true);
});

test("preview reads payloads non-destructively and loads only local export libraries", () => {
  const root = join(__dirname, "..");
  const html = readFileSync(join(root, "export.html"), "utf8");
  const script = readFileSync(join(root, "export.js"), "utf8");
  const vendor = readFileSync(join(root, "export-vendor.bundle.js"), "utf8");
  assert.match(html, /src="export-vendor\.bundle\.js"/);
  assert.doesNotMatch(html, /<script[^>]+https?:\/\//i);
  assert.doesNotMatch(script, /storage\.local\.remove|localStorage\.removeItem/);
  assert.doesNotMatch(vendor, /\beval\s*\(|\bnew Function\b/);
  assert.ok(statSync(join(root, "export-vendor.bundle.js")).size > 100_000);
});
