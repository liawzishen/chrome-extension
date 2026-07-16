const test = require("node:test");
const assert = require("node:assert/strict");

const CheatSheet = require("../cheat-sheet-utils.js");

function makeNode(overrides = {}) {
  return {
    id: "diffusion",
    label: "Diffusion",
    role: "Passive transport rule",
    detail: "Particles move from high concentration to low concentration.",
    why: "A concentration gradient drives net movement without cellular energy.",
    example: "Oxygen diffuses from an alveolus into blood.",
    sourceAnchor: "particles move from high concentration to low concentration",
    ...overrides
  };
}

test("normalizes a bounded five-column cheat sheet without quiz or raw source data", () => {
  const rows = Array.from({ length: 12 }, (_, index) => ({
    topic: `Concept ${index + 1}`,
    mainIdea: `Main idea ${index + 1}`,
    keyFacts: [`Fact ${index + 1}`, "Rule"],
    example: `Example ${index + 1}`,
    sourceAnchor: `Evidence ${index + 1}`
  }));
  const result = CheatSheet.normalizeCheatSheet({ title: "Transport essentials", rows }, {
    title: "Cell transport",
    sourceType: "webpage",
    sourceUrl: "https://example.test/transport#section",
    sourceFingerprint: "fingerprint-transport",
    visualModel: { nodes: [makeNode()] }
  });

  assert.equal(result.rows.length, CheatSheet.MAX_ROWS);
  assert.deepEqual(result.columns.map((column) => column.label), [
    "Topic / concept",
    "Main idea",
    "Key facts or rule",
    "Example / application",
    "Evidence / citation"
  ]);
  assert.equal(result.sourceFingerprint, "fingerprint-transport");
  assert.equal(result.rows[0].keyFacts, "Fact 1; Rule");
  assert.equal(result.rows[0].evidence.url, "https://example.test/transport");
  assert.equal("rawText" in result, false);
  assert.equal("questions" in result, false);
  assert.doesNotMatch(JSON.stringify(result), /private source snapshot/i);
});

test("uses the exact cited video segment for grounded row claims and timestamps", () => {
  const result = CheatSheet.normalizeCheatSheet({ rows: [{
    topic: "Diffusion",
    mainIdea: "Diffusion follows a concentration gradient.",
    keyFacts: "No cellular energy is required.",
    example: "Gas exchange",
    sourceSegmentId: "seg-0002",
    evidence: { startMs: 999999, anchor: "Particles move from high concentration to low concentration." }
  }] }, {
    title: "Membrane transport video",
    sourceType: "video",
    sourceFingerprint: "video-fingerprint",
    videoSegments: [{
      id: "seg-0002",
      startMs: 65000,
      endMs: 71000,
      text: "Diffusion follows a concentration gradient. Particles move from high concentration to low concentration. No cellular energy is required. Gas exchange is one example."
    }],
    visualModel: { nodes: [makeNode({
      sourceSegmentId: "seg-0002",
      sourceTimestamp: 65,
      sourceRef: {
        sourceId: "current-video",
        segmentId: "seg-0002",
        startMs: 65000,
        endMs: 71000,
        quote: "Particles move from high concentration to low concentration."
      }
    })] }
  });

  const evidence = result.rows[0].evidence;
  assert.equal(evidence.segmentId, "seg-0002");
  assert.equal(evidence.startMs, 65000);
  assert.equal(evidence.timestampSeconds, 65);
  assert.equal(evidence.label, "1:05 · Video transcript");
  assert.match(evidence.anchor, /particles move/i);
  assert.doesNotMatch(JSON.stringify(evidence), /999999/);
});

test("rejects ungrounded video claims and zero-overlap citation attachment", () => {
  const context = {
    title: "Membrane transport video",
    sourceType: "video",
    videoSegments: [{
      id: "seg-0002",
      startMs: 65000,
      endMs: 71000,
      text: "Diffusion moves particles down a concentration gradient without cellular energy."
    }],
    visualModel: { nodes: [makeNode({
      sourceSegmentId: "seg-0002",
      sourceRef: { segmentId: "seg-0002", startMs: 65000, endMs: 71000 }
    })] }
  };

  assert.throws(() => CheatSheet.normalizeCheatSheet({ rows: [{
    topic: "Primitive types",
    mainIdea: "Java int stores a whole integer.",
    keyFacts: "Primitive types are built into Java.",
    example: "The value 42 uses int.",
    sourceSegmentId: "seg-0002",
    sourceAnchor: "Diffusion moves particles down a concentration gradient."
  }] }, context), /main idea is not supported by the saved source/);

  assert.throws(() => CheatSheet.normalizeCheatSheet({ rows: [{
    topic: "Astronomy",
    mainIdea: "Mars has two moons.",
    keyFacts: "Phobos and Deimos orbit Mars.",
    example: "A telescope observes Phobos.",
    sourceAnchor: "Mars and its moons"
  }] }, context), /omitted the transcript segment|required by the saved source/);
});

test("keeps strict grounding for generation while saved-content rendering degrades one citation", () => {
  const context = {
    title: "Photosynthesis demo",
    sourceType: "notes",
    rawText: "Photosynthesis occurs in chloroplasts and converts light energy into chemical energy.",
    visualModel: { nodes: [makeNode({
      label: "Chloroplast",
      detail: "Chloroplasts capture light energy.",
      role: "Transformation",
      sourceAnchor: "Photosynthesis occurs in chloroplasts and converts light energy into chemical energy."
    })] }
  };
  const savedSheet = { rows: [{
    topic: "Chloroplast",
    mainIdea: "Chloroplasts capture light energy.",
    keyFacts: "Transformation",
    example: "Photosynthesis occurs in chloroplasts.",
    sourceAnchor: "Photosynthesis occurs in chloroplasts and converts light energy into chemical energy."
  }] };

  assert.throws(
    () => CheatSheet.normalizeCheatSheet(savedSheet, context),
    /key facts is not supported by the saved source/
  );
  const rendered = CheatSheet.normalizeCheatSheetForRender(savedSheet, context);
  assert.equal(rendered.rows.length, 1);
  assert.equal(rendered.rows[0].topic, "Chloroplast");
  assert.deepEqual(rendered.rows[0].evidence, {
    label: "Evidence unavailable",
    anchor: "",
    sourceType: "notes",
    unavailable: true
  });
});

test("retains collection source identity and public citation URL", () => {
  const result = CheatSheet.normalizeCheatSheet({ rows: [{
    topic: "Selective permeability",
    mainIdea: "The membrane controls which substances cross.",
    keyFacts: "Transport depends on membrane properties.",
    example: "Small non-polar molecules cross more readily.",
    sourceId: "source-a"
  }] }, {
    title: "Transport collection",
    sourceType: "collection",
    rawText: [
      "<<<SOURCE_BLOCK>>>",
      "SOURCE source-a",
      "TITLE Membrane reference",
      "CONTENT_BEGIN",
      "The membrane controls which substances cross. Transport depends on membrane properties. Small non-polar molecules cross more readily.",
      "CONTENT_END",
      "<<<END_SOURCE_BLOCK>>>"
    ].join("\n"),
    collectionSources: [{
      id: "source-a",
      title: "Membrane reference",
      url: "https://reference.test/membrane#transport"
    }],
    visualModel: { nodes: [makeNode({
      label: "Selective permeability",
      sourceId: "source-a",
      sourceAnchor: "the membrane controls which substances cross",
      sourceRef: {
        sourceId: "source-a",
        title: "Membrane reference",
        url: "https://reference.test/membrane",
        quote: "the membrane controls which substances cross"
      }
    })] }
  });

  assert.equal(result.rows[0].evidence.sourceId, "source-a");
  assert.equal(result.rows[0].evidence.label, "Membrane reference");
  assert.equal(result.rows[0].evidence.url, "https://reference.test/membrane");
});

test("retains cited PDF page aliases and the per-source fingerprint from sourceRef metadata", () => {
  const sourceText = "Active transport moves particles against a gradient. Cellular energy is required. A sodium-potassium pump uses active transport.";
  const makeContext = (pageField) => ({
    title: "Transport collection",
    sourceType: "collection",
    sourceFingerprint: "combined-collection-fingerprint",
    rawText: [
      "<<<SOURCE_BLOCK>>>",
      "SOURCE source-pdf",
      "CONTENT_BEGIN",
      `Page 7 ${sourceText}`,
      "CONTENT_END",
      "<<<END_SOURCE_BLOCK>>>"
    ].join("\n"),
    collectionSources: [{
      id: "source-pdf",
      type: "webpage",
      documentType: "pdf",
      pageCount: 10,
      title: "Transport handbook",
      url: "https://reference.test/transport.pdf",
      fingerprint: "cited-pdf-fingerprint"
    }],
    visualModel: { nodes: [makeNode({
      id: "active-transport",
      label: "Active transport",
      detail: "Active transport moves particles against a gradient.",
      why: "Cellular energy is required.",
      example: "A sodium-potassium pump uses active transport.",
      sourceId: "source-pdf",
      sourcePage: 0,
      sourceAnchor: "Active transport moves particles against a gradient.",
      sourceRef: {
        sourceId: "source-pdf",
        sourceType: "webpage",
        documentType: "pdf",
        sourceFingerprint: "cited-pdf-fingerprint",
        quote: "Active transport moves particles against a gradient.",
        [pageField]: 7
      }
    })] }
  });
  const row = {
    topic: "Active transport",
    mainIdea: "Active transport moves particles against a gradient.",
    keyFacts: "Cellular energy is required.",
    example: "A sodium-potassium pump uses active transport.",
    sourceId: "source-pdf"
  };

  for (const pageField of ["sourcePage", "pageNumber"]) {
    const result = CheatSheet.normalizeCheatSheet({ rows: [row] }, makeContext(pageField));
    const evidence = result.rows[0].evidence;
    assert.equal(evidence.documentType, "pdf");
    assert.equal(evidence.sourcePage, 7);
    assert.equal(evidence.pageNumber, 7);
    assert.equal(evidence.sourceFingerprint, "cited-pdf-fingerprint");
  }
});

test("routes collection-video evidence as a timestamped video citation", () => {
  const sourceText = "Chlorophyll absorbs light energy. The light reactions produce energy carriers. Oxygen is released from water.";
  const result = CheatSheet.normalizeCheatSheet({ rows: [{
    topic: "Light reactions",
    mainIdea: "Chlorophyll absorbs light energy.",
    keyFacts: "The light reactions produce energy carriers.",
    example: "Oxygen is released from water.",
    sourceId: "source-video"
  }] }, {
    title: "Photosynthesis collection",
    sourceType: "collection",
    rawText: [
      "<<<SOURCE_BLOCK>>>",
      "SOURCE source-video",
      "CONTENT_BEGIN",
      sourceText,
      "CONTENT_END",
      "<<<END_SOURCE_BLOCK>>>"
    ].join("\n"),
    collectionSources: [{
      id: "source-video",
      type: "video",
      title: "Light reactions lecture",
      url: "https://video.test/watch",
      fingerprint: "video-fingerprint",
      segments: [{ id: "seg-0001", startMs: 65000, endMs: 72000, text: sourceText }]
    }],
    visualModel: { nodes: [makeNode({
      id: "light-reactions",
      label: "Light reactions",
      detail: "Chlorophyll absorbs light energy.",
      why: "The light reactions produce energy carriers.",
      example: "Oxygen is released from water.",
      sourceId: "source-video",
      sourceSegmentId: "seg-0001",
      sourceAnchor: "Chlorophyll absorbs light energy.",
      sourceRef: {
        sourceId: "source-video",
        sourceType: "video",
        segmentId: "seg-0001",
        sourceFingerprint: "video-fingerprint",
        quote: "Chlorophyll absorbs light energy."
      }
    })] }
  });

  const evidence = result.rows[0].evidence;
  assert.equal(evidence.sourceType, "video");
  assert.equal(evidence.timestampSeconds, 65);
  assert.equal(evidence.segmentId, "seg-0001");
  assert.equal(evidence.sourceFingerprint, "video-fingerprint");
});

test("rejects collection claims that are not supported by their exact cited source block", () => {
  const sources = [
    { id: "source-a", title: "Membranes", url: "https://reference.test/a" },
    { id: "source-b", title: "Diffusion", url: "https://reference.test/b" }
  ];
  const rawText = [
    "<<<SOURCE_BLOCK>>>",
    "SOURCE source-a",
    "CONTENT_BEGIN",
    "Cell membranes are selectively permeable.",
    "CONTENT_END",
    "<<<END_SOURCE_BLOCK>>>",
    "<<<SOURCE_BLOCK>>>",
    "SOURCE source-b",
    "CONTENT_BEGIN",
    "Diffusion moves particles down a concentration gradient.",
    "CONTENT_END",
    "<<<END_SOURCE_BLOCK>>>"
  ].join("\n");

  assert.throws(() => CheatSheet.normalizeCheatSheet({ rows: [{
    topic: "Selective permeability",
    mainIdea: "Cell membranes are selectively permeable.",
    keyFacts: "Cell membranes control which substances cross.",
    example: "A selectively permeable membrane filters substances.",
    sourceId: "source-b",
    sourceAnchor: "Diffusion moves particles down a concentration gradient."
  }] }, {
    sourceType: "collection",
    rawText,
    collectionSources: sources
  }), /main idea is not supported by the saved source/);
});

test("infers a PDF page anchor from the bounded source snapshot", () => {
  const result = CheatSheet.normalizeCheatSheet({ rows: [{
    topic: "Active transport",
    mainIdea: "Active transport moves particles against a gradient.",
    keyFacts: "Cellular energy is required.",
    example: "A sodium-potassium pump.",
    sourceAnchor: "moves particles against a gradient"
  }] }, {
    title: "Biology chapter",
    sourceType: "webpage",
    documentType: "pdf",
    sourceUrl: "https://example.test/chapter.pdf",
    rawText: "Page 1\nDiffusion moves particles down a gradient.\nPage 2\nActive transport moves particles against a gradient. Cellular energy is required. A sodium-potassium pump is an example.",
    visualModel: { nodes: [makeNode({
      label: "Active transport",
      detail: "Active transport moves particles against a gradient.",
      sourceAnchor: "moves particles against a gradient"
    })] }
  });

  assert.equal(result.rows[0].evidence.sourceType, "webpage");
  assert.equal(result.rows[0].evidence.documentType, "pdf");
  assert.equal(result.rows[0].evidence.pageNumber, 2);
  assert.equal(result.rows[0].evidence.sourcePage, 2);
  assert.equal(result.rows[0].evidence.label, "Page 2 · PDF");
});

test("scales the bounded row target with source length and scans past unusable supplied rows", () => {
  assert.equal(CheatSheet.getCheatSheetTargetRowCount("short source"), 3);
  assert.equal(CheatSheet.getCheatSheetTargetRowCount("x".repeat(4000)), 4);
  assert.equal(CheatSheet.getCheatSheetTargetRowCount("x".repeat(20000)), 8);

  const groundedSentence = "Photosynthesis stores chemical energy in glucose, and oxygen is released as an output.";
  const makeRows = (count) => Array.from({ length: count }, (_, index) => ({
    topic: `Photosynthesis ${index + 1}`,
    mainIdea: "Photosynthesis stores chemical energy in glucose.",
    keyFacts: "Oxygen is released as an output.",
    example: "Glucose stores chemical energy.",
    sourceAnchor: "Photosynthesis stores chemical energy in glucose"
  }));

  const short = CheatSheet.normalizeCheatSheet({ rows: makeRows(8) }, {
    sourceType: "notes",
    rawText: groundedSentence
  });
  assert.equal(short.rows.length, 3);

  assert.throws(() => CheatSheet.normalizeCheatSheet({ rows: [
    ...makeRows(3),
    {
      topic: "Primitive types",
      mainIdea: "Java int stores a whole integer.",
      keyFacts: "Primitive types are built into Java.",
      example: "The value 42 uses int.",
      sourceAnchor: "Photosynthesis stores chemical energy in glucose"
    }
  ] }, {
    sourceType: "notes",
    rawText: groundedSentence
  }), /row 4 main idea is not supported/);

  const unusable = Array.from({ length: 5 }, () => ({ topic: "Missing main idea" }));
  const long = CheatSheet.normalizeCheatSheet({ rows: [...unusable, ...makeRows(8)] }, {
    sourceType: "notes",
    rawText: `${groundedSentence} ${"supporting study detail ".repeat(1000)}`
  });
  assert.equal(long.rows.length, 8);
});

test("builds a local legacy fallback from visual nodes and fills sparse generated output", () => {
  const visualModel = {
    nodes: [
      makeNode(),
      makeNode({ id: "osmosis", label: "Osmosis", detail: "Water moves through a selectively permeable membrane.", sourceAnchor: "water moves through a selectively permeable membrane" }),
      makeNode({ id: "active", label: "Active transport", detail: "Cellular energy moves particles against a gradient.", sourceAnchor: "cellular energy moves particles against a gradient" })
    ]
  };
  const legacy = CheatSheet.normalizeCheatSheet(null, {
    title: "Legacy note",
    sourceType: "webpage",
    visualModel
  });
  const sparse = CheatSheet.normalizeCheatSheet({ rows: [{
    topic: "Diffusion",
    mainIdea: "Particles spread down a concentration gradient."
  }] }, {
    title: "Sparse note",
    sourceType: "webpage",
    visualModel
  });

  assert.equal(legacy.rows.length, 3);
  assert.deepEqual(legacy.rows.map((row) => row.topic), ["Diffusion", "Osmosis", "Active transport"]);
  assert.equal(sparse.rows.length, CheatSheet.MIN_GENERATED_ROWS);
  assert.ok(CheatSheet.hasUsableCheatSheet(legacy));
  assert.equal(CheatSheet.hasUsableCheatSheet({ rows: [] }), false);
});

test("sanitizes unsafe evidence URLs and bounds every display field", () => {
  const huge = "x".repeat(5000);
  const result = CheatSheet.normalizeCheatSheet({
    title: huge,
    caption: huge,
    rows: [{ topic: huge, mainIdea: huge, keyFacts: huge, example: huge, evidence: { url: "javascript:alert(1)", anchor: huge } }]
  }, { sourceType: "webpage", title: "Bounded" });
  const row = result.rows[0];
  assert.equal(result.title.length, CheatSheet.FIELD_LIMITS.title);
  assert.equal(result.caption.length, CheatSheet.FIELD_LIMITS.caption);
  assert.equal(row.topic.length, CheatSheet.FIELD_LIMITS.topic);
  assert.equal(row.mainIdea.length, CheatSheet.FIELD_LIMITS.mainIdea);
  assert.equal(row.keyFacts.length, CheatSheet.FIELD_LIMITS.keyFacts);
  assert.equal(row.example.length, CheatSheet.FIELD_LIMITS.example);
  assert.equal(row.evidence.anchor.length, CheatSheet.FIELD_LIMITS.anchor);
  assert.equal(row.evidence.url, "");
});
