const test = require("node:test");
const assert = require("node:assert/strict");

const ForestData = require("../journey-tree-utils.js");

function chapter(overrides = {}) {
  return {
    id: "chapter-java",
    title: "Java",
    createdAt: "2026-07-01T00:00:00Z",
    updatedAt: "2026-07-10T00:00:00Z",
    sources: [],
    sessions: [],
    ...overrides
  };
}

function artifact(id, chapterId, generatedAt, labels) {
  return {
    id,
    journeyChapterId: chapterId,
    generatedAt,
    visualLesson: {
      visualModel: {
        nodes: labels.map((label, index) => ({
          id: `node-${index + 1}`,
          label,
          role: `Role ${index + 1}`,
          detail: `Grounded detail ${index + 1}`
        }))
      }
    }
  };
}

test("maps one user-named Journey chapter to one stable tree record", () => {
  const journey = { chapters: [chapter({ sources: [{ id: "source-1" }], sessions: [{ id: "note-java" }] })] };
  const records = ForestData.buildForestRecords(
    journey,
    [artifact("note-java", "chapter-java", "2026-07-03T00:00:00Z", ["Classes", "Interfaces"])],
    { getChapterStatus: () => "completed" }
  );

  assert.equal(records.length, 1);
  assert.equal(records[0].id, "chapter-java");
  assert.equal(records[0].name, "Java");
  assert.equal(records[0].createdAt, "2026-07-01T00:00:00Z");
  assert.equal(records[0].updatedAt, "2026-07-10T00:00:00Z");
  assert.equal(records[0].status, "completed");
  assert.equal(records[0].sourceCount, 1);
  assert.equal(records[0].sessionCount, 1);
  assert.deepEqual(records[0].concepts.map((item) => item.label), ["Classes", "Interfaces"]);
  assert.equal(records[0].isSeedling, false);
});

test("uses exact IDs, selects the newest full note, and caps concepts at seven", () => {
  const sessions = [{ id: "older-note" }, { id: "newer-note" }];
  const labels = Array.from({ length: 9 }, (_, index) => `Concept ${index + 1}`);
  const records = ForestData.buildForestRecords(
    { chapters: [chapter({ sessions })] },
    [
      artifact("same-title-wrong-id", "other-chapter", "2026-07-12T00:00:00Z", ["Must not leak"]),
      artifact("older-note", "chapter-java", "2026-07-02T00:00:00Z", ["Old concept"]),
      artifact("newer-note", "chapter-java", "2026-07-11T00:00:00Z", labels)
    ]
  );

  assert.equal(records[0].latestArtifactId, "newer-note");
  assert.equal(records[0].concepts.length, ForestData.MAX_CONCEPTS);
  assert.deepEqual(records[0].concepts.map((item) => item.label), labels.slice(0, 7));
  assert.ok(!records[0].concepts.some((item) => item.label === "Must not leak"));
});

test("keeps duplicate chapter titles isolated by chapter and session IDs", () => {
  const first = chapter({ id: "java-one", sessions: [{ id: "note-one" }] });
  const second = chapter({ id: "java-two", sessions: [{ id: "note-two" }] });
  const records = ForestData.buildForestRecords(
    { chapters: [first, second] },
    [
      artifact("note-one", "java-one", "2026-07-04T00:00:00Z", ["First Java"]),
      artifact("note-two", "java-two", "2026-07-05T00:00:00Z", ["Second Java"])
    ]
  );

  assert.deepEqual(records.map((record) => record.concepts[0].label), ["First Java", "Second Java"]);
});

test("falls back to grounded legacy terms, then summaries, without inventing concepts", () => {
  const termRecord = ForestData.buildForestRecords({ chapters: [chapter({
    sessions: [{ id: "legacy", generatedAt: "2026-07-02T00:00:00Z", keyTerms: ["Loops", "Arrays"], summary: ["Ignored summary"] }]
  })] }, [])[0];
  assert.deepEqual(termRecord.concepts.map((item) => item.label), ["Loops", "Arrays"]);

  const summaryRecord = ForestData.buildForestRecords({ chapters: [chapter({
    sessions: [{ id: "legacy", generatedAt: "2026-07-02T00:00:00Z", keyTerms: [], summary: ["Compilation stages", "Runtime behavior"] }]
  })] }, [])[0];
  assert.deepEqual(summaryRecord.concepts.map((item) => item.label), ["Compilation stages", "Runtime behavior"]);
});

test("renders source-only chapters and missing library artifacts as seedlings", () => {
  const sourceOnly = ForestData.buildForestRecords({ chapters: [chapter({
    sources: [{ id: "source-java", title: "Java documentation" }]
  })] }, [])[0];
  assert.equal(sourceOnly.isSeedling, true);
  assert.equal(sourceOnly.sourceCount, 1);
  assert.deepEqual(sourceOnly.concepts, []);

  const missingLibrary = ForestData.buildForestRecords({ chapters: [chapter({
    sessions: [{ id: "missing-full-note", generatedAt: "2026-07-02T00:00:00Z" }]
  })] }, [])[0];
  assert.equal(missingLibrary.isSeedling, true);
  assert.equal(missingLibrary.latestArtifactId, "");
});

test("preserves all 24 supported Journey chapters as independent trees", () => {
  const chapters = Array.from({ length: 24 }, (_, index) => chapter({
    id: `chapter-${index + 1}`,
    title: `Note ${index + 1}`
  }));
  const records = ForestData.buildForestRecords({ chapters }, []);
  assert.equal(records.length, 24);
  assert.equal(new Set(records.map((record) => record.seed)).size, 24);
});
