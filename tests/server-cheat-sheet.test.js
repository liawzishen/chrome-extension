const test = require("node:test");
const assert = require("node:assert/strict");

process.env.BACKEND_ACCESS_TOKEN = "test-token-that-is-long-enough-123456";
process.env.ALLOWED_EXTENSION_ORIGINS = "chrome-extension://abcdefghijklmnopabcdefghijklmnop";

const {
  buildNotesPrompt,
  getResponseSchema,
  normalizeNotes,
  prepareStudyNotesInput
} = require("../server.js");

function makeVisualModel(nodes) {
  return {
    title: "Transport relationships",
    objective: "Compare transport mechanisms.",
    kind: "comparison",
    nodes,
    edges: [
      { from: nodes[0].id, to: nodes[1].id, label: "contrasts with" },
      { from: nodes[1].id, to: nodes[2].id, label: "contrasts with" }
    ],
    scenarios: [
      {
        id: "passive",
        label: "Passive movement",
        prompt: "Follow a gradient.",
        activeIds: [nodes[0].id],
        values: [{ nodeId: nodes[0].id, value: "down gradient" }],
        outcome: "Particles spread.",
        insight: "The gradient drives movement."
      },
      {
        id: "active",
        label: "Active movement",
        prompt: "Move against a gradient.",
        activeIds: [nodes[2].id],
        values: [{ nodeId: nodes[2].id, value: "energy required" }],
        outcome: "Cellular energy powers transport.",
        insight: "Against-gradient movement needs energy."
      }
    ],
    check: {
      prompt: "Which process needs cellular energy?",
      choices: ["Diffusion", "Osmosis", "Active transport"],
      answer: "Active transport",
      explanation: "Active transport moves particles against a gradient."
    },
    suggestedQuestions: ["How does diffusion work?", "Why does active transport need energy?"]
  };
}

function makeNodes(sourceOptions = {}) {
  return [
    {
      id: "diffusion",
      label: "Diffusion",
      symbol: "",
      role: "Passive transport",
      detail: "Particles move down a concentration gradient.",
      why: "The gradient drives movement without cellular energy.",
      example: "Oxygen crosses an alveolus.",
      sourceAnchor: "particles move down a concentration gradient",
      sourceSegmentId: sourceOptions.diffusionSegment || "",
      sourceId: ""
    },
    {
      id: "osmosis",
      label: "Osmosis",
      symbol: "",
      role: "Water transport",
      detail: "Water crosses a selectively permeable membrane.",
      why: "Water potential differences drive net water movement.",
      example: "Water enters a plant cell.",
      sourceAnchor: "water crosses a selectively permeable membrane",
      sourceSegmentId: sourceOptions.osmosisSegment || "",
      sourceId: ""
    },
    {
      id: "active",
      label: "Active transport",
      symbol: "ATP",
      role: "Energy-dependent transport",
      detail: "Cellular energy moves particles against a gradient.",
      why: "Moving against a gradient requires energy.",
      example: "A sodium-potassium pump.",
      sourceAnchor: "cellular energy moves particles against a gradient",
      sourceSegmentId: sourceOptions.activeSegment || "",
      sourceId: ""
    }
  ];
}

test("the note-only response schema and prompt require a cheat sheet but no quiz", () => {
  const input = prepareStudyNotesInput({
    sourceType: "webpage",
    title: "Transport page",
    rawText: "Particles move down gradients by diffusion. Active transport moves particles against gradients using cellular energy."
  });
  const schema = getResponseSchema("study_notes");
  const prompt = buildNotesPrompt(input);

  assert.ok(schema.properties.cheatSheet);
  assert.ok(schema.required.includes("cheatSheet"));
  assert.equal("questions" in schema.properties, false);
  assert.match(prompt, /CHEAT-SHEET CONTRACT/);
  assert.match(prompt, /"mainIdea"/);
  assert.match(prompt, /Do not create quiz questions/);
});

test("normalizes generated video cheat rows against immutable transcript timestamps", () => {
  const videoSegments = [
    { id: "seg-0001", startMs: 12000, endMs: 18000, text: "Particles move down a concentration gradient by diffusion. No cellular energy is required. Oxygen crosses an alveolus." },
    { id: "seg-0002", startMs: 20000, endMs: 27000, text: "Water crosses a selectively permeable membrane by osmosis. Water enters a plant cell." },
    { id: "seg-0003", startMs: 31000, endMs: 39000, text: "Cellular energy moves particles against a gradient by active transport. A sodium-potassium pump is an example." }
  ];
  const input = prepareStudyNotesInput({
    sourceType: "video",
    title: "Transport video",
    sourceFingerprint: "video-fingerprint",
    rawText: videoSegments.map((segment) => segment.text).join(" "),
    videoSegments
  });
  const note = normalizeNotes({
    title: "Transport video",
    summary: ["Transport can follow or oppose a concentration gradient."],
    visualLesson: {
      title: "Transport",
      visualModel: makeVisualModel(makeNodes({
        diffusionSegment: "seg-0001",
        osmosisSegment: "seg-0002",
        activeSegment: "seg-0003"
      }))
    },
    cheatSheet: {
      title: "Transport essentials",
      caption: "Rules and examples.",
      rows: [{
        topic: "Diffusion",
        mainIdea: "Particles spread down a concentration gradient.",
        keyFacts: "No cellular energy is required.",
        example: "Oxygen crosses an alveolus.",
        sourceAnchor: "particles move down a concentration gradient",
        sourceSegmentId: "seg-0001",
        sourceId: "",
        sourcePage: 0
      }]
    },
    terms: [],
    goals: [],
    questions: [{ prompt: "must be discarded" }],
    rawText: "must never be exported"
  }, input);

  assert.equal(note.cheatSheet.sourceFingerprint, "video-fingerprint");
  assert.equal(note.cheatSheet.rows.length, 3);
  assert.equal(note.cheatSheet.rows[0].evidence.segmentId, "seg-0001");
  assert.equal(note.cheatSheet.rows[0].evidence.timestampSeconds, 12);
  assert.equal(note.cheatSheet.rows[0].evidence.label, "0:12 · Video transcript");
  assert.equal("questions" in note, false);
  assert.equal("rawText" in note.cheatSheet, false);
});

test("normalizes PDF cheat rows with page anchors and supports legacy note fallback", () => {
  const rawText = [
    "Page 1",
    "Particles move down a concentration gradient by diffusion. Oxygen crosses an alveolus.",
    "Water crosses a selectively permeable membrane by osmosis. Water enters a plant cell.",
    "Page 2",
    "Cellular energy moves particles against a gradient by active transport. A sodium-potassium pump is an example."
  ].join("\n");
  const input = prepareStudyNotesInput({
    sourceType: "webpage",
    documentType: "pdf",
    pageCount: 2,
    title: "Transport PDF",
    sourceUrl: "https://example.test/transport.pdf",
    sourceFingerprint: "pdf-fingerprint",
    rawText
  });
  const note = normalizeNotes({
    title: "Transport PDF",
    summary: ["Transport follows gradients or uses energy."],
    visualLesson: { title: "Transport", visualModel: makeVisualModel(makeNodes()) },
    terms: [],
    goals: []
  }, input);

  assert.equal(input.documentType, "pdf");
  assert.equal(note.cheatSheet.rows.length, 3);
  assert.equal(note.cheatSheet.rows[0].evidence.pageNumber, 1);
  assert.equal(note.cheatSheet.rows[2].evidence.pageNumber, 2);
  assert.equal(note.cheatSheet.rows[2].evidence.label, "Page 2 · PDF");
  assert.equal(note.cheatSheet.rows[2].evidence.url, "https://example.test/transport.pdf");
});
