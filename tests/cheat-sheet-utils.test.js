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

test("uses grounded visual-node timestamps instead of an unverified video citation", () => {
  const result = CheatSheet.normalizeCheatSheet({ rows: [{
    topic: "Diffusion",
    mainIdea: "Diffusion follows a concentration gradient.",
    keyFacts: "No cellular energy is required.",
    example: "Gas exchange",
    sourceSegmentId: "invented-segment",
    evidence: { startMs: 999999, anchor: "invented evidence" }
  }] }, {
    title: "Membrane transport video",
    sourceType: "video",
    sourceFingerprint: "video-fingerprint",
    videoSegments: [{
      id: "seg-0002",
      startMs: 65000,
      endMs: 71000,
      text: "Particles move from high concentration to low concentration."
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
  assert.doesNotMatch(JSON.stringify(evidence), /999999|invented evidence/);
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
    collectionSources: [{
      id: "source-a",
      title: "Membrane reference",
      url: "https://reference.test/membrane#transport"
    }],
    visualModel: { nodes: [makeNode({
      label: "Selective permeability",
      sourceId: "source-a",
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
    rawText: "Page 1\nDiffusion moves particles down a gradient.\nPage 2\nActive transport moves particles against a gradient and requires energy.",
    visualModel: { nodes: [makeNode({
      label: "Active transport",
      detail: "Active transport moves particles against a gradient.",
      sourceAnchor: "moves particles against a gradient"
    })] }
  });

  assert.equal(result.rows[0].evidence.sourceType, "pdf");
  assert.equal(result.rows[0].evidence.pageNumber, 2);
  assert.equal(result.rows[0].evidence.label, "Page 2 · PDF");
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
