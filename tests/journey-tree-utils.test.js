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

function artifact(id, chapterId, generatedAt, labels, overrides = {}) {
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
    },
    ...overrides
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
  assert.equal(records[0].conceptCount, 2);
  assert.equal(records[0].visualNoteCount, 1);
  assert.equal(records[0].growthUnitCount, 2);
  assert.equal(records[0].growthStage, "seedling");
  assert.deepEqual(records[0].visualNotes.map((item) => item.id), ["note-java"]);
  assert.equal(records[0].isSeedling, false);
});

test("maps saved learning-unit counts to the four growth stages", () => {
  const expectations = [
    [0, "plot"],
    [1, "seedling"],
    [2, "seedling"],
    [3, "growing"],
    [5, "growing"],
    [6, "mature"],
    [7, "mature"],
    [18, "mature"]
  ];
  expectations.forEach(([count, stage]) => {
    assert.equal(ForestData.growthStageForUnitCount(count), stage);
  });
  assert.equal(ForestData.growthStageForUnitCount(-3), "plot");
  assert.equal(ForestData.growthStageForUnitCount(Number.NaN), "plot");
  assert.equal(ForestData.growthStageForConceptCount(3), "growing");
});

test("uses exact IDs, selects the newest concept model, and preserves all matching note branches", () => {
  const sessions = [{ id: "older-note" }, { id: "newer-note" }];
  const labels = Array.from({ length: 3 }, (_, index) => `Concept ${index + 1}`);
  const records = ForestData.buildForestRecords(
    { chapters: [chapter({ sessions })] },
    [
      artifact("same-title-wrong-id", "other-chapter", "2026-07-12T00:00:00Z", ["Must not leak"]),
      artifact("older-note", "chapter-java", "2026-07-02T00:00:00Z", ["Old concept"]),
      artifact("newer-note", "chapter-java", "2026-07-11T00:00:00Z", labels)
    ]
  );

  assert.equal(records[0].latestArtifactId, "newer-note");
  assert.equal(records[0].concepts.length, labels.length);
  assert.equal(records[0].conceptCount, labels.length);
  assert.equal(records[0].visualNoteCount, 2);
  assert.equal(records[0].growthUnitCount, 2);
  assert.equal(records[0].growthStage, "seedling");
  assert.deepEqual(records[0].visualNotes.map((item) => item.id), ["newer-note", "older-note"]);
  assert.deepEqual(records[0].concepts.map((item) => item.label), labels);
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
  assert.deepEqual(records.map((record) => record.visualNotes[0].id), ["note-one", "note-two"]);
});

test("gives an explicit chapter binding precedence over a stale shared session ID", () => {
  const sharedSession = { id: "shared-note" };
  const records = ForestData.buildForestRecords(
    { chapters: [
      chapter({ id: "chapter-one", sessions: [sharedSession] }),
      chapter({ id: "chapter-two", sessions: [sharedSession] })
    ] },
    [artifact("shared-note", "chapter-one", "2026-07-08T00:00:00Z", ["Bound only once"])]
  );

  assert.deepEqual(records.map((record) => record.visualNoteCount), [1, 0]);
  assert.deepEqual(records[0].visualNotes.map((item) => item.id), ["shared-note"]);
  assert.deepEqual(records[1].visualNotes, []);
});

test("falls back to grounded legacy terms, then summaries, without inventing concepts", () => {
  const termRecord = ForestData.buildForestRecords({ chapters: [chapter({
    sessions: [{ id: "legacy", generatedAt: "2026-07-02T00:00:00Z", keyTerms: ["Loops", "Arrays"], summary: ["Ignored summary"] }]
  })] }, [])[0];
  assert.deepEqual(termRecord.concepts.map((item) => item.label), ["Loops", "Arrays"]);
  assert.equal(termRecord.growthUnitCount, 0);
  assert.equal(termRecord.growthStage, "plot");

  const summaryRecord = ForestData.buildForestRecords({ chapters: [chapter({
    sessions: [{ id: "legacy", generatedAt: "2026-07-02T00:00:00Z", keyTerms: [], summary: ["Compilation stages", "Runtime behavior"] }]
  })] }, [])[0];
  assert.deepEqual(summaryRecord.concepts.map((item) => item.label), ["Compilation stages", "Runtime behavior"]);
  assert.equal(summaryRecord.growthUnitCount, 0);
  assert.equal(summaryRecord.growthStage, "plot");
});

test("grows source-only chapters while missing library artifacts remain bare plots", () => {
  const sourceOnly = ForestData.buildForestRecords({ chapters: [chapter({
    sources: [
      { id: "source-java", title: "Java documentation" },
      { id: "source-java", title: "Repeated Java documentation" },
      { id: "source-jvm", title: "JVM specification" }
    ]
  })] }, [])[0];
  assert.equal(sourceOnly.isSeedling, true);
  assert.equal(sourceOnly.isBarePlot, false);
  assert.equal(sourceOnly.growthUnitCount, 2);
  assert.equal(sourceOnly.growthStage, "seedling");
  assert.equal(sourceOnly.sourceCount, 2);
  assert.equal(sourceOnly.visualNoteCount, 0);
  assert.deepEqual(sourceOnly.concepts, []);

  const missingLibrary = ForestData.buildForestRecords({ chapters: [chapter({
    sessions: [{ id: "missing-full-note", generatedAt: "2026-07-02T00:00:00Z" }]
  })] }, [])[0];
  assert.equal(missingLibrary.isSeedling, true);
  assert.equal(missingLibrary.growthUnitCount, 0);
  assert.equal(missingLibrary.growthStage, "plot");
  assert.equal(missingLibrary.latestArtifactId, "");
});

test("preserves Journey Visual Note branches when all but one full artifact was evicted", () => {
  const record = ForestData.buildForestRecords({ chapters: [chapter({
    sessions: [
      {
        id: "note-newer",
        title: "Newer saved note",
        generatedAt: "2026-07-12T00:00:00Z",
        hasVisualNote: true,
        sourceId: "source-two"
      },
      {
        id: "note-evicted",
        title: "Earlier saved note",
        generatedAt: "2026-07-08T00:00:00Z",
        hasVisualNote: true,
        sourceId: "source-one",
        keyTerms: ["Retained session concept"]
      },
      {
        id: "quiz-only",
        title: "Quiz without a Visual Note",
        generatedAt: "2026-07-13T00:00:00Z",
        hasVisualNote: false
      }
    ]
  })] }, [artifact(
    "note-newer",
    "chapter-java",
    "2026-07-12T00:00:00Z",
    ["Full artifact concept"],
    { title: "Full newer note" }
  )])[0];

  assert.equal(record.visualNoteCount, 2);
  assert.deepEqual(record.visualNotes.map((note) => note.id), ["note-newer", "note-evicted"]);
  assert.equal(record.visualNotes[0].title, "Full newer note");
  assert.ok(record.visualNotes[0].visualModel);
  assert.equal(record.visualNotes[1].title, "Earlier saved note");
  assert.equal(record.visualNotes[1].visualModel, null);
  assert.deepEqual(record.visualNotes[1].sourceIds, ["source-one"]);
  assert.deepEqual(record.visualNotes[1].concepts.map((concept) => concept.label), ["Retained session concept"]);
  assert.ok(!record.visualNotes.some((note) => note.id === "quiz-only"));
});

test("full note-plus-quiz artifacts win over Journey fallback sessions without duplicate branches", () => {
  const upgraded = artifact(
    "note-with-quiz",
    "chapter-java",
    "2026-07-06T00:00:00Z",
    ["Full upgraded model"],
    {
      noteId: "note-original",
      title: "Full note and quiz",
      submittedAt: "2026-07-14T00:00:00Z",
      questions: [{ id: "question-one" }]
    }
  );
  const record = ForestData.buildForestRecords({ chapters: [chapter({
    sessions: [
      {
        id: "note-with-quiz",
        noteId: "note-original",
        title: "Compact upgraded session",
        generatedAt: "2026-07-06T00:00:00Z",
        submittedAt: "2026-07-14T00:00:00Z",
        hasVisualNote: true,
        itemKind: "quiz"
      },
      {
        id: "note-original",
        noteId: "note-original",
        title: "Compact original session",
        generatedAt: "2026-07-06T00:00:00Z",
        hasVisualNote: true
      }
    ]
  })] }, [upgraded])[0];

  assert.equal(record.visualNoteCount, 1);
  assert.deepEqual(record.visualNotes.map((note) => note.id), ["note-with-quiz"]);
  assert.equal(record.visualNotes[0].title, "Full note and quiz");
  assert.ok(record.visualNotes[0].visualModel);
});

test("uses the latest note for subheaders while all saved notes contribute growth units", () => {
  const records = ForestData.buildForestRecords(
    { chapters: [chapter({ sessions: [{ id: "old-note" }, { id: "new-note" }] })] },
    [
      artifact("old-note", "chapter-java", "2026-07-02T00:00:00Z", Array.from({ length: 7 }, (_, index) => `Old ${index}`)),
      artifact("new-note", "chapter-java", "2026-07-12T00:00:00Z", ["Current one", "Current two"])
    ]
  );
  assert.equal(records[0].conceptCount, 2);
  assert.equal(records[0].visualNoteCount, 2);
  assert.equal(records[0].growthUnitCount, 2);
  assert.equal(records[0].growthStage, "seedling");
  assert.deepEqual(records[0].visualNotes.map((item) => item.id), ["new-note", "old-note"]);
  assert.deepEqual(records[0].concepts.map((item) => item.label), ["Current one", "Current two"]);
});

test("keeps only the eight newest meaningful Visual Tutor Note branches", () => {
  const notes = Array.from({ length: 12 }, (_, index) => artifact(
    `note-${index + 1}`,
    "chapter-java",
    `2026-07-${String(index + 1).padStart(2, "0")}T00:00:00Z`,
    [`Concept ${index + 1}`],
    { title: `Visual note ${index + 1}` }
  ));
  const record = ForestData.buildForestRecords({ chapters: [chapter({
    sessions: notes.map((note) => ({ id: note.id }))
  })] }, notes)[0];

  assert.equal(ForestData.MAX_VISUAL_NOTES_PER_CHAPTER, 8);
  assert.equal(record.visualNoteCount, 8);
  assert.equal(record.growthUnitCount, 8);
  assert.equal(record.growthStage, "mature");
  assert.deepEqual(
    record.visualNotes.map((note) => note.id),
    notes.slice(-8).map((note) => note.id).reverse()
  );
  assert.deepEqual(
    record.visualNotes.map((note) => note.title),
    notes.slice(-8).map((note) => note.title).reverse()
  );
});

test("collapses repeated combined builds and repeated source revisions to their newest branch", () => {
  const repeatedCombined = Array.from({ length: 6 }, (_, index) => artifact(
    `combined-${index + 1}`,
    "chapter-java",
    `2026-07-${String(index + 1).padStart(2, "0")}T00:00:00Z`,
    [`Combined ${index + 1}`],
    {
      title: "Current chapter: combined visual note",
      sourceType: "collection",
      sourceRevisionHash: "chapter-source-set-v1",
      sourceBinding: {
        sourceType: "collection",
        sourceRevisionHash: "chapter-source-set-v1",
        fingerprint: "combined-fingerprint-v1"
      }
    }
  ));
  const repeatedSource = [
    artifact("source-old", "chapter-java", "2026-07-07T00:00:00Z", ["Old source note"], {
      title: "FIT1051 Ed Lessons",
      sourceType: "webpage",
      sourceUrl: "https://ed.example/lesson/1",
      sourceFingerprint: "lesson-1-v1"
    }),
    artifact("source-new", "chapter-java", "2026-07-08T00:00:00Z", ["New source note"], {
      title: "FIT1051 Ed Lessons",
      sourceType: "webpage",
      sourceUrl: "https://ed.example/lesson/1",
      sourceFingerprint: "lesson-1-v1"
    })
  ];
  const distinctSource = artifact("source-two", "chapter-java", "2026-07-09T00:00:00Z", ["Second source"], {
    title: "FIT2094 Ed Lessons",
    sourceType: "webpage",
    sourceUrl: "https://ed.example/lesson/2",
    sourceFingerprint: "lesson-2-v1"
  });
  const record = ForestData.buildForestRecords(
    { chapters: [chapter()] },
    [...repeatedCombined, ...repeatedSource, distinctSource]
  )[0];

  assert.equal(record.visualNoteCount, 3);
  assert.deepEqual(record.visualNotes.map((note) => note.id), ["source-two", "source-new", "combined-6"]);
  assert.equal(record.visualNotes.filter((note) => note.title === "Current chapter: combined visual note").length, 1);
});

test("combines saved Visual Tutor Notes and distinct sources to choose the tree stage", () => {
  const record = ForestData.buildForestRecords({ chapters: [chapter({
    sources: [{ id: "source-one" }, { id: "source-one" }, { id: "source-two" }],
    sessions: [{ id: "note-one" }]
  })] }, [artifact("note-one", "chapter-java", "2026-07-10T00:00:00Z", ["One"])])[0];

  assert.equal(record.visualNoteCount, 1);
  assert.equal(record.sourceCount, 2);
  assert.equal(record.growthUnitCount, 3);
  assert.equal(record.growthStage, "growing");
});

test("deduplicates sources and note-plus-quiz upgrades while excluding quiz-only artifacts", () => {
  const original = artifact(
    "note-original",
    "chapter-java",
    "2026-07-02T00:00:00Z",
    ["Original note"]
  );
  const upgraded = artifact(
    "note-and-quiz",
    "chapter-java",
    "2026-07-12T00:00:00Z",
    ["Upgraded note"],
    {
      noteId: "note-original",
      kind: "quiz",
      questions: [{ id: "question-1" }],
      visualLesson: {
        title: "Upgraded visual note",
        visualModel: {
          nodes: [{ id: "upgraded-node", label: "Upgraded note" }],
          edges: [{ id: "edge-1", from: "upgraded-node", to: "upgraded-node" }],
          layout: "mindmap"
        }
      }
    }
  );
  const second = artifact(
    "note-second",
    "chapter-java",
    "2026-07-10T00:00:00Z",
    ["Second note"]
  );
  const quizOnly = {
    id: "quiz-only",
    noteId: "note-second",
    journeyChapterId: "chapter-java",
    generatedAt: "2026-07-13T00:00:00Z",
    kind: "quiz",
    questions: [{ id: "question-2" }]
  };
  const wrongChapter = artifact(
    "wrong-chapter-note",
    "chapter-kotlin",
    "2026-07-14T00:00:00Z",
    ["Must not leak"]
  );
  const record = ForestData.buildForestRecords({ chapters: [chapter({
    sources: [
      { id: "source-one", url: "https://example.test/one" },
      { id: "source-one", url: "https://example.test/duplicate" },
      { id: "source-two", url: "https://example.test/two" }
    ]
  })] }, [original, upgraded, second, quizOnly, wrongChapter])[0];

  assert.equal(record.sourceCount, 2);
  assert.equal(record.visualNoteCount, 2);
  assert.equal(record.growthUnitCount, 4);
  assert.equal(record.growthStage, "growing");
  assert.deepEqual(record.visualNotes.map((item) => item.id), ["note-and-quiz", "note-second"]);
  assert.equal(record.visualNotes[0].noteId, "note-original");
  assert.deepEqual(record.visualNotes[0].visualModel.edges, [
    { id: "edge-1", from: "upgraded-node", to: "upgraded-node" }
  ]);
  assert.equal(record.latestArtifactId, "note-and-quiz");
  assert.ok(!record.visualNotes.some((item) => item.id === "quiz-only"));
  assert.ok(!record.visualNotes.some((item) => item.id === "wrong-chapter-note"));
});

test("keeps full visual models for the eight displayed notes in newest-first order", () => {
  const savedNotes = Array.from({ length: 9 }, (_, index) => artifact(
    `note-${index + 1}`,
    "chapter-java",
    `2026-07-${String(index + 1).padStart(2, "0")}T00:00:00Z`,
    Array.from({ length: 12 }, (__, nodeIndex) => `Note ${index + 1} node ${nodeIndex + 1}`),
    {
      visualLesson: {
        visualModel: {
          nodes: Array.from({ length: 12 }, (__, nodeIndex) => ({
            id: `note-${index + 1}-node-${nodeIndex + 1}`,
            label: `Note ${index + 1} node ${nodeIndex + 1}`
          })),
          edges: [{ id: `note-${index + 1}-edge` }]
        }
      }
    }
  ));
  const record = ForestData.buildForestRecords({ chapters: [chapter()] }, savedNotes)[0];

  assert.equal(record.visualNoteCount, 8);
  assert.equal(record.growthUnitCount, 8);
  assert.equal(record.growthStage, "mature");
  assert.deepEqual(
    record.visualNotes.map((item) => item.id),
    savedNotes.slice(-8).map((item) => item.id).reverse()
  );
  assert.equal(record.visualNotes[0].visualModel.nodes.length, 12);
  assert.deepEqual(record.visualNotes[0].visualModel.edges, [{ id: "note-9-edge" }]);
});

test("keeps Visual Notes ordered by note creation when an older note receives a newer quiz", () => {
  const original = artifact(
    "old-note",
    "chapter-java",
    "2026-07-01T00:00:00Z",
    ["Old model"]
  );
  const upgraded = artifact(
    "old-note-with-quiz",
    "chapter-java",
    "2026-07-01T00:00:00Z",
    ["Old model with quiz"],
    {
      noteId: "old-note",
      submittedAt: "2026-07-14T00:00:00Z",
      questions: [{ id: "old-question" }]
    }
  );
  const newer = artifact(
    "new-note",
    "chapter-java",
    "2026-07-10T00:00:00Z",
    ["Newest model"]
  );
  const record = ForestData.buildForestRecords(
    { chapters: [chapter()] },
    [original, upgraded, newer]
  )[0];

  assert.deepEqual(record.visualNotes.map((item) => item.id), ["new-note", "old-note-with-quiz"]);
  assert.equal(record.latestArtifactId, "new-note");
  assert.deepEqual(record.concepts.map((item) => item.label), ["Newest model"]);
  assert.equal(record.visualNotes[1].updatedAt, "2026-07-14T00:00:00Z");
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

test("returns exactly the stored chapter count and order without future ribbon placeholders", () => {
  for (const count of [0, 1, 4, 11, 24]) {
    const chapters = Array.from({ length: count }, (_, index) => chapter({
      id: `chapter-${index + 1}`,
      title: `Chapter ${index + 1}`
    }));
    const records = ForestData.buildForestRecords({ chapters }, []);
    assert.equal(records.length, count);
    assert.deepEqual(
      records.map((record) => record.id),
      chapters.map((item) => item.id)
    );
    assert.deepEqual(
      records.map((record) => record.name),
      chapters.map((item) => item.title)
    );
  }
});
