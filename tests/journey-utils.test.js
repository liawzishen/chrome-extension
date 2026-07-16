const test = require("node:test");
const assert = require("node:assert/strict");

require("../journey-utils.js");

const Journey = globalThis.ExamCramJourney;

function questionAttempt(index, overrides = {}) {
  return {
    attemptId: `attempt-${String(index).padStart(3, "0")}`,
    quizId: "quiz-memory",
    questionId: `question-${String(index).padStart(3, "0")}`,
    noteId: "note-memory",
    sourceFingerprint: "source-memory",
    primaryConceptId: "concept-alpha",
    relatedConceptIds: [],
    conceptLabel: "Concept Alpha",
    sourceRef: { sourceId: "source-a", quote: "Grounded evidence", pageNumber: 2 },
    sourcePage: 2,
    correctAnswer: "Correct",
    studentAnswer: "Correct",
    result: "correct",
    answeredAt: new Date(Date.parse("2026-07-15T01:00:00Z") + index * 1000).toISOString(),
    attemptType: "normal",
    targetConceptId: "",
    ...overrides
  };
}

test("creates an empty named chapter with a stable ID before any source or note exists", () => {
  const initial = Journey.createJourney("Biology", "2026-07-14T01:00:00Z");
  const created = Journey.createChapter(initial, "  Cell   Transport  ", "2026-07-14T01:30:00Z");

  assert.equal(created.created, true);
  assert.equal(created.duplicate, false);
  assert.match(created.chapterId, /^chapter-/);
  assert.equal(initial.chapters.length, 0, "the pure adapter must not mutate its input Journey");
  assert.equal(created.journey.revision, initial.revision + 1);
  assert.equal(created.journey.summary, null);
  assert.equal(created.journey.chapters.length, 1);
  assert.deepEqual(created.journey.chapters[0], {
    id: created.chapterId,
    title: "Cell Transport",
    createdAt: "2026-07-14T01:30:00.000Z",
    updatedAt: "2026-07-14T01:30:00.000Z",
    sources: [],
    sessions: []
  });
});

test("selects an existing chapter for a case-insensitive duplicate name without changing its stable ID", () => {
  const first = Journey.createChapter(
    Journey.createJourney("Biology", "2026-07-14T01:00:00Z"),
    "Cell Transport",
    "2026-07-14T01:30:00Z"
  );
  const duplicate = Journey.createChapter(first.journey, " cell transport ", "2026-07-14T02:00:00Z");

  assert.equal(duplicate.created, false);
  assert.equal(duplicate.duplicate, true);
  assert.equal(duplicate.chapterId, first.chapterId);
  assert.equal(duplicate.journey.chapters.length, 1);
  assert.equal(duplicate.journey.revision, first.journey.revision);
  assert.equal(duplicate.journey.chapters[0].createdAt, "2026-07-14T01:30:00.000Z");
});

test("validates explicit chapter names and enforces the existing chapter limit", () => {
  assert.throws(
    () => Journey.createChapter(Journey.createJourney(), " \n\t "),
    /chapter name/i
  );

  const longName = `  ${"A".repeat(170)}   ${"B".repeat(20)}  `;
  const normalized = Journey.createChapter(Journey.createJourney(), longName);
  assert.equal(normalized.journey.chapters[0].title.length, 140);
  assert.doesNotMatch(normalized.journey.chapters[0].title, /\s{2,}/);

  let fullJourney = Journey.createJourney("Full Journey", "2026-07-14T00:00:00Z");
  for (let index = 0; index < Journey.MAX_CHAPTERS; index += 1) {
    fullJourney = Journey.createChapter(
      fullJourney,
      `Chapter ${index + 1}`,
      `2026-07-14T${String(index).padStart(2, "0")}:00:00Z`
    ).journey;
  }
  assert.equal(fullJourney.chapters.length, Journey.MAX_CHAPTERS);
  assert.throws(
    () => Journey.createChapter(fullJourney, "One chapter too many"),
    new RegExp(`up to ${Journey.MAX_CHAPTERS} chapters`, "i")
  );
});

test("collects sources across websites and rejects exact duplicates", () => {
  let journey = Journey.createJourney("Biology", "2026-07-11T00:00:00Z");
  const first = Journey.addSource(journey, "Cells", {
    id: "source-a",
    type: "webpage",
    title: "Cell membrane",
    url: "https://one.example/cells#section",
    text: "The membrane controls movement into and out of a cell.",
    fingerprint: "fp-a"
  }, "2026-07-11T01:00:00Z");
  journey = first.journey;
  const second = Journey.addSource(journey, "Cells", {
    id: "source-b",
    type: "webpage",
    title: "Diffusion",
    url: "https://two.example/diffusion",
    text: "Diffusion moves particles down a concentration gradient.",
    fingerprint: "fp-b"
  }, "2026-07-11T02:00:00Z");
  journey = second.journey;
  const duplicate = Journey.addSource(journey, "Cells", {
    type: "webpage",
    title: "Diffusion again",
    url: "https://two.example/diffusion#top",
    text: "Diffusion moves particles down a concentration gradient.",
    fingerprint: "fp-b"
  });

  assert.equal(duplicate.duplicate, true);
  assert.equal(duplicate.journey.chapters[0].sources.length, 2);
  assert.match(Journey.buildCollectionText(duplicate.journey.chapters[0]), /SOURCE source-a/);
  assert.match(Journey.buildCollectionText(duplicate.journey.chapters[0]), /two\.example/);
});

test("deduplicates identical local documents by fingerprint inside a chapter", () => {
  const first = Journey.addSource(
    Journey.createJourney("Local documents", "2026-07-16T00:00:00Z"),
    "Imports",
    {
      id: "local-a",
      type: "webpage",
      title: "Course notes",
      url: "",
      documentType: "pdf",
      text: "A bounded local document snapshot.",
      fingerprint: "local-document-fingerprint"
    },
    "2026-07-16T00:10:00Z"
  );
  const duplicate = Journey.addSource(first.journey, "Imports", {
    id: "local-b",
    type: "webpage",
    title: "Course notes re-uploaded",
    url: "",
    documentType: "pdf",
    text: "A bounded local document snapshot.",
    fingerprint: "local-document-fingerprint"
  }, "2026-07-16T00:20:00Z");

  assert.equal(duplicate.duplicate, true);
  assert.equal(duplicate.journey.chapters[0].sources.length, 1);
  assert.equal(duplicate.sourceId, "local-a");
});

test("reduces quiz evidence into chapter status and a journey summary", () => {
  let journey = Journey.createJourney("Physics", "2026-07-11T00:00:00Z");
  journey = Journey.recordSession(journey, "Forces", {
    id: "quiz-1",
    title: "Forces quiz",
    sourceType: "webpage",
    createdAt: "2026-07-11T03:00:00Z",
    score: 55,
    weakTopics: ["Friction", "Vectors"],
    summary: ["Forces change motion."]
  }).journey;
  assert.equal(Journey.getChapterStatus(journey.chapters[0]), "review");

  journey = Journey.recordSession(journey, journey.chapters[0].id, {
    id: "quiz-2",
    title: "Forces retake",
    sourceType: "webpage",
    createdAt: "2026-07-11T04:00:00Z",
    score: 90,
    weakTopics: [],
    summary: ["Net force determines acceleration."]
  }).journey;

  assert.equal(Journey.getChapterStatus(journey.chapters[0]), "completed");
  const summary = Journey.summarize(journey, { range: "all", now: Date.parse("2026-07-11T05:00:00Z") });
  assert.match(summary.evidence, /2 saved sessions/);
  assert.ok(summary.progressHighlights.some((item) => /Forces/.test(item)));
  assert.ok(summary.knowledgeGaps.includes("Friction"));
});

test("does not treat an unscored note as a zero-score quiz", () => {
  const journey = Journey.recordSession(Journey.createJourney(), "Reading", {
    id: "note-1",
    kind: "note",
    title: "Reading note",
    createdAt: "2026-07-11T01:00:00Z",
    score: null,
    summary: ["A saved note is learning evidence without a quiz score."]
  }).journey;
  assert.equal(journey.chapters[0].sessions[0].score, null);
  assert.equal(Journey.getChapterStatus(journey.chapters[0]), "current");
  assert.equal(Journey.getMetrics(journey).averageScore, null);
});

test("today summaries use the learner's local calendar day instead of a rolling 24 hours", () => {
  const now = new Date(2026, 6, 11, 0, 30, 0).getTime();
  let journey = Journey.recordSession(Journey.createJourney(), "Yesterday", {
    id: "old-session",
    title: "Late study",
    createdAt: new Date(2026, 6, 10, 23, 45, 0).toISOString(),
    score: 80
  }).journey;
  journey = Journey.recordSession(journey, "Today", {
    id: "new-session",
    title: "Early study",
    createdAt: new Date(2026, 6, 11, 0, 10, 0).toISOString(),
    score: 90
  }).journey;
  const summary = Journey.summarize(journey, { range: "today", now });
  assert.match(summary.evidence, /1 saved session across 1 chapter/);
  assert.ok(summary.recurringThemes.includes("Today"));
  assert.ok(!summary.recurringThemes.includes("Yesterday"));
});

test("parses timestamped transcripts and grounds generated items to real segments", () => {
  const segments = Journey.parseTimestampedTranscript(`
[00:12] Energy enters the system as light.
01:05 The chloroplast stores energy in glucose.
[1:02:03] Later review point.
  `);
  assert.equal(segments.length, 3);
  assert.equal(segments[1].startMs, 65000);
  assert.equal(Journey.parseTimestamp("jump to 1:02:03"), 3723);
  assert.equal(Journey.formatTimestamp(3723), "1:02:03");

  const grounded = Journey.attachVideoProvenance({
    questions: [{ prompt: "Where is energy stored?", sourceText: "The chloroplast stores energy in glucose." }],
    visualLesson: { visualModel: { nodes: [{ label: "Glucose", sourceAnchor: "stores energy in glucose" }] } }
  }, segments, "video-1");

  assert.equal(grounded.questions[0].sourceSegmentId, "seg-0002");
  assert.equal(grounded.questions[0].sourceTimestamp, 65);
  assert.equal(grounded.visualLesson.visualModel.nodes[0].sourceRef.sourceId, "video-1");
});

test("grounds combined chapter output to the saved source that contains the evidence", () => {
  const sources = [
    { id: "source-a", type: "webpage", title: "Membranes", url: "https://a.example/", fingerprint: "a" },
    { id: "source-b", type: "webpage", title: "Diffusion", url: "https://b.example/", fingerprint: "b" }
  ];
  const combined = `SOURCE source-a\nTitle: Membranes\nCell membranes are selectively permeable.\n\nSOURCE source-b\nTitle: Diffusion\nParticles move down a concentration gradient.`;
  const grounded = Journey.attachCollectionProvenance({
    questions: [{ prompt: "How do particles move?", sourceText: "Particles move down a concentration gradient." }],
    visualLesson: { visualModel: { nodes: [{ label: "Membrane", sourceAnchor: "selectively permeable" }] } }
  }, sources, combined);

  assert.equal(grounded.questions[0].sourceId, "source-b");
  assert.equal(grounded.questions[0].sourceRef.url, "https://b.example/");
  assert.equal(grounded.visualLesson.visualModel.nodes[0].sourceId, "source-a");
});

test("preserves PDF and video evidence metadata through collection payloads and provenance", () => {
  const chapter = {
    id: "chapter-evidence",
    title: "Mixed evidence",
    sources: [{
      id: "source-pdf",
      type: "webpage",
      documentType: "pdf",
      pageCount: 12,
      sourcePage: 4,
      title: "Transport handbook",
      url: "https://reference.test/transport.pdf",
      fingerprint: "fingerprint-pdf",
      text: "Page 4 Active transport moves particles against a concentration gradient and requires cellular energy."
    }, {
      id: "source-video",
      type: "video",
      title: "Transport video",
      url: "https://video.test/watch?v=transport",
      fingerprint: "fingerprint-video",
      durationMs: 120000,
      mediaId: "video-transport",
      segments: [{
        id: "seg-0001",
        startMs: 12000,
        endMs: 18000,
        text: "Diffusion moves particles down a concentration gradient."
      }, {
        id: "seg-0002",
        startMs: 65000,
        endMs: 71000,
        text: "Active transport requires cellular energy."
      }]
    }]
  };
  const payload = Journey.buildCollectionPayload(chapter, 5000);
  const pdfSource = payload.sources.find((source) => source.id === "source-pdf");
  const videoSource = payload.sources.find((source) => source.id === "source-video");

  assert.equal(pdfSource.documentType, "pdf");
  assert.equal(pdfSource.pageCount, 12);
  assert.equal(pdfSource.fingerprint, "fingerprint-pdf");
  assert.equal(pdfSource.sourcePage, 4);
  assert.equal(pdfSource.pageNumber, 4);
  assert.equal(videoSource.fingerprint, "fingerprint-video");
  assert.equal(videoSource.durationMs, 120000);
  assert.equal(videoSource.mediaId, "video-transport");
  assert.deepEqual(
    videoSource.segments.map(({ id, startMs, endMs }) => ({ id, startMs, endMs })),
    [
      { id: "seg-0001", startMs: 12000, endMs: 18000 },
      { id: "seg-0002", startMs: 65000, endMs: 71000 }
    ]
  );

  const grounded = Journey.attachCollectionProvenance({
    questions: [{
      id: "question-pdf",
      sourceId: "source-pdf",
      sourceText: "Active transport moves particles against a concentration gradient.",
      sourceRef: { sourcePage: 4 }
    }, {
      id: "question-video",
      sourceId: "source-video",
      sourceSegmentId: "seg-0002",
      sourceText: "Active transport requires cellular energy."
    }],
    visualLesson: { visualModel: { nodes: [{
      id: "node-pdf",
      sourceId: "source-pdf",
      sourceAnchor: "Active transport moves particles against a concentration gradient.",
      pageNumber: 4
    }] } }
  }, payload.sources, payload.text);

  const pdfQuestion = grounded.questions[0];
  assert.equal(pdfQuestion.sourcePage, 4);
  assert.equal(pdfQuestion.pageNumber, 4);
  assert.equal(pdfQuestion.sourceRef.documentType, "pdf");
  assert.equal(pdfQuestion.sourceRef.pageCount, 12);
  assert.equal(pdfQuestion.sourceRef.sourcePage, 4);
  assert.equal(pdfQuestion.sourceRef.pageNumber, 4);
  assert.equal(pdfQuestion.sourceRef.sourceFingerprint, "fingerprint-pdf");

  const videoQuestion = grounded.questions[1];
  assert.equal(videoQuestion.sourceSegmentId, "seg-0002");
  assert.equal(videoQuestion.sourceTimestamp, 65);
  assert.equal(videoQuestion.sourceRef.sourceType, "video");
  assert.equal(videoQuestion.sourceRef.sourceFingerprint, "fingerprint-video");
  assert.equal(videoQuestion.sourceRef.segmentId, "seg-0002");
  assert.equal(videoQuestion.sourceRef.startMs, 65000);
  assert.equal(videoQuestion.sourceRef.endMs, 71000);
  assert.equal(grounded.visualLesson.visualModel.nodes[0].sourceRef.sourcePage, 4);
  assert.equal(grounded.sources.find((source) => source.id === "source-video").segments[1].startMs, 65000);
});

test("migrates v1 dates safely and separates generation from quiz submission", () => {
  const migrated = Journey.normalizeJourney({
    schemaVersion: 1,
    id: "journey-legacy",
    title: "Legacy",
    createdAt: "not-a-date",
    updatedAt: "also-not-a-date",
    chapters: [{
      id: "chapter-legacy",
      title: "Legacy chapter",
      createdAt: "bad",
      updatedAt: "bad",
      sources: [{ id: "source-legacy", title: "Old source", capturedAt: "bad", text: "Useful evidence" }],
      sessions: [{
        id: "quiz-legacy",
        title: "Old quiz",
        createdAt: "2026-06-01T12:00:00Z",
        score: 88
      }]
    }],
    events: [{ id: "event-bad", occurredAt: "bad" }]
  });

  const session = migrated.chapters[0].sessions[0];
  assert.equal(migrated.schemaVersion, Journey.SCHEMA_VERSION);
  assert.equal(session.generatedAt, "2026-06-01T12:00:00.000Z");
  assert.equal(session.submittedAt, "2026-06-01T12:00:00.000Z");
  assert.equal(session.createdAt, session.generatedAt);
  assert.doesNotThrow(() => new Date(migrated.createdAt).toISOString());
  assert.doesNotThrow(() => new Date(migrated.chapters[0].sources[0].capturedAt).toISOString());
  assert.doesNotThrow(() => new Date(migrated.events[0].occurredAt).toISOString());
});

test("uses the latest submitted quiz rather than session array order for chapter status", () => {
  const chapter = {
    sources: [],
    sessions: [
      {
        id: "generated-later",
        itemKind: "quiz",
        score: 95,
        generatedAt: "2026-07-11T10:00:00Z",
        submittedAt: "2026-07-11T10:05:00Z"
      },
      {
        id: "submitted-later",
        itemKind: "quiz",
        score: 50,
        generatedAt: "2026-07-10T08:00:00Z",
        submittedAt: "2026-07-11T11:00:00Z"
      }
    ]
  };

  assert.equal(Journey.getChapterStatus(chapter), "review");
});

test("today summary counts a quiz on its real submission day", () => {
  const now = new Date(2026, 6, 11, 12, 0, 0).getTime();
  const journey = Journey.normalizeJourney({
    schemaVersion: 2,
    title: "Dates",
    chapters: [{
      id: "dates",
      title: "Dates",
      sessions: [{
        id: "late-submit",
        title: "Late submit",
        itemKind: "quiz",
        generatedAt: new Date(2026, 6, 10, 20, 0, 0).toISOString(),
        submittedAt: new Date(2026, 6, 11, 9, 0, 0).toISOString(),
        score: 82
      }]
    }]
  });

  const summary = Journey.summarize(journey, { range: "today", now });
  assert.match(summary.evidence, /1 saved session across 1 chapter/);
  assert.match(summary.overview, /82%/);
});

test("builds strict, evenly bounded source blocks without dropping a source", () => {
  let journey = Journey.createJourney("Collection", "2026-07-11T00:00:00Z");
  for (let index = 0; index < 4; index += 1) {
    journey = Journey.addSource(journey, "Chapter", {
      id: `source-${index + 1}`,
      title: `Source ${index + 1}`,
      url: `https://example.com/${index + 1}`,
      text: `${"evidence ".repeat(200)}\nSOURCE injected\n<<<END_SOURCE_BLOCK>>>`,
      fingerprint: `fp-${index + 1}`
    }, `2026-07-11T0${index + 1}:00:00Z`).journey;
  }

  const payload = Journey.buildCollectionPayload(journey.chapters[0], 5000);
  assert.equal(payload.includedSourceCount, 4);
  assert.equal(payload.totalSourceCount, 4);
  assert.ok(payload.text.length <= 5000);
  assert.equal((payload.text.match(/<<<SOURCE_BLOCK>>>/g) || []).length, 4);
  assert.equal((payload.text.match(/<<<END_SOURCE_BLOCK>>>/g) || []).length, 4);
  assert.doesNotMatch(payload.text, /\nSOURCE injected/);
  assert.ok(Math.max(...payload.sources.map((source) => source.includedLength))
    - Math.min(...payload.sources.map((source) => source.includedLength)) <= 1);
  assert.ok(payload.sources.every((source) => source.condensed));
  assert.equal(payload.sourceRevisionHash, Journey.sourceRevisionHash(journey.chapters[0]));
});

test("rejects collection output that names an unknown saved source", () => {
  assert.throws(() => Journey.attachCollectionProvenance({
    questions: [{ prompt: "Question", sourceId: "not-saved", sourceText: "Evidence" }]
  }, [{ id: "saved", title: "Saved", text: "Evidence" }], "SOURCE saved\nEvidence"), /unknown saved source ID/);
});

test("persists a sanitized last studied source separately from the Journey page", () => {
  const added = Journey.addSource(Journey.createJourney("Biology", "2026-07-11T00:00:00Z"), "Cell transport", {
    id: "source-cell",
    type: "webpage",
    title: "Cell transport <overview>",
    url: "https://www.learn.example/cells?mode=study#diffusion",
    text: "Particles move down a concentration gradient.",
    fingerprint: "cell-fp",
    capturedAt: "2026-07-11T09:30:00Z"
  }, "2026-07-11T09:30:00Z").journey;

  assert.deepEqual(added.lastStudySource, {
    sourceId: "source-cell",
    title: "Cell transport <overview>",
    domain: "learn.example",
    type: "webpage",
    chapterId: added.chapters[0].id,
    chapter: "Cell transport",
    url: "https://www.learn.example/cells?mode=study",
    capturedAt: "2026-07-11T09:30:00.000Z"
  });

  const sanitized = Journey.normalizeLastStudySource({
    title: "Local note",
    type: "notes",
    domain: "<script>alert(1)</script>",
    url: "javascript:alert(1)",
    chapter: "Safe chapter",
    capturedAt: "bad-date"
  }, { fallbackDate: "2026-07-11T10:00:00Z" });
  assert.equal(sanitized.url, "");
  assert.equal(sanitized.domain, "scriptalert1script");
  assert.equal(sanitized.capturedAt, "2026-07-11T10:00:00.000Z");
});

test("migrates existing Journey evidence into lastStudySource without changing revisions", () => {
  const migrated = Journey.normalizeJourney({
    schemaVersion: Journey.SCHEMA_VERSION,
    revision: 7,
    updatedAt: "2026-07-11T12:00:00Z",
    chapters: [{
      id: "chapter-video",
      title: "Long chapter title that remains intact",
      sources: [{
        id: "video-source",
        type: "video",
        title: "Photosynthesis walkthrough",
        url: "https://video.example/watch?v=1&t=30",
        fingerprint: "video-fp",
        capturedAt: "2026-07-11T11:00:00Z"
      }]
    }]
  });

  assert.equal(migrated.revision, 7);
  assert.equal(migrated.lastStudySource.title, "Photosynthesis walkthrough");
  assert.equal(migrated.lastStudySource.domain, "video.example");
  assert.equal(migrated.lastStudySource.chapter, "Long chapter title that remains intact");
});

test("records a sourceBinding as the latest learning context", () => {
  const journey = Journey.recordSession(Journey.createJourney(), "Energy", {
    id: "note-energy",
    kind: "note",
    title: "Energy visual note",
    sourceBinding: {
      sourceId: "bound-source",
      title: "Energy transfer",
      sourceType: "webpage",
      url: "https://science.example/energy#transfer",
      fingerprint: "energy-fp",
      capturedAt: "2026-07-11T13:00:00Z"
    },
    generatedAt: "2026-07-11T13:05:00Z"
  }, "2026-07-11T13:05:00Z").journey;

  assert.equal(journey.lastStudySource.sourceId, "bound-source");
  assert.equal(journey.lastStudySource.title, "Energy transfer");
  assert.equal(journey.lastStudySource.domain, "science.example");
  assert.equal(journey.lastStudySource.chapter, "Energy");
});

test("preserves distinct webpage revisions while deduplicating exact recaptures", () => {
  let journey = Journey.createJourney("Biology", "2026-07-11T00:00:00Z");
  const firstSource = Journey.addSource(journey, "Cells", {
    id: "source-original",
    type: "webpage",
    title: "Cell transport",
    url: "https://learn.example/cells#first",
    fingerprint: "fp-first",
    text: "Original page evidence"
  }, "2026-07-11T01:00:00Z");
  journey = Journey.recordSession(firstSource.journey, firstSource.chapterId, {
    id: "note-first",
    kind: "note",
    artifactType: "study",
    title: "First visual note",
    sourceTitle: "Cell transport",
    sourceUrl: "https://learn.example/cells",
    sourceFingerprint: "fp-first",
    visualLesson: { visualModel: { nodes: [{}, {}, {}] } },
    terms: ["Diffusion", "Membrane"]
  }, "2026-07-11T01:05:00Z").journey;

  const recaptured = Journey.addSource(journey, firstSource.chapterId, {
    id: "source-should-not-be-added",
    type: "webpage",
    title: "Cell transport updated",
    url: "https://learn.example/cells#second",
    fingerprint: "fp-second",
    text: "Updated page evidence"
  }, "2026-07-11T02:00:00Z");
  journey = Journey.recordSession(recaptured.journey, firstSource.chapterId, {
    id: "note-second",
    kind: "note",
    artifactType: "study",
    title: "Second visual note",
    sourceTitle: "Cell transport updated",
    sourceUrl: "https://learn.example/cells",
    sourceFingerprint: "fp-second",
    visualLesson: { visualModel: { nodes: [{}, {}, {}, {}] } }
  }, "2026-07-11T02:05:00Z").journey;

  const chapter = journey.chapters[0];
  assert.equal(recaptured.duplicate, false);
  assert.equal(recaptured.updated, false);
  assert.equal(chapter.sources.length, 2);
  assert.equal(chapter.sources[0].id, "source-original");
  assert.equal(chapter.sources[0].fingerprint, "fp-first");
  assert.equal(chapter.sources[1].fingerprint, "fp-second");
  const exactRecapture = Journey.addSource(journey, firstSource.chapterId, {
    id: "source-exact-copy",
    type: "webpage",
    title: "Cell transport updated",
    url: "https://learn.example/cells#third",
    fingerprint: "fp-second",
    text: "Updated page evidence"
  }, "2026-07-11T03:00:00Z");
  assert.equal(exactRecapture.duplicate, true);
  assert.equal(exactRecapture.updated, false);
  assert.equal(exactRecapture.journey.chapters[0].sources.length, 2);
  assert.deepEqual(chapter.sessions.map((session) => session.id).sort(), ["note-first", "note-second"]);
  assert.ok(chapter.sessions.every((session) => session.hasVisualNote));
  assert.equal(chapter.sessions.find((session) => session.id === "note-first").visualConceptCount, 3);
});

test("builds a chapter collection from every visual note source revision", () => {
  const chapter = {
    id: "chapter-revisions",
    title: "Cell transport",
    sessions: [
      { id: "note-first", title: "First note", hasVisualNote: true, generatedAt: "2026-07-11T01:00:00Z" },
      { id: "note-second", title: "Second note", hasVisualNote: true, generatedAt: "2026-07-11T02:00:00Z" },
      { id: "note-copy", title: "Exact-copy note", hasVisualNote: true, generatedAt: "2026-07-11T03:00:00Z" }
    ],
    sources: [{
      id: "source-shared",
      type: "webpage",
      title: "Cell transport current",
      url: "https://learn.example/cells",
      fingerprint: "fp-second",
      text: "Updated cell transport evidence explains active transport and cellular energy requirements."
    }]
  };
  const artifact = (id, fingerprint, rawText) => ({
    id,
    kind: "note",
    artifactType: "study",
    journeyChapterId: chapter.id,
    generatedAt: chapter.sessions.find((session) => session.id === id).generatedAt,
    visualLesson: { visualModel: { nodes: [{ id: `${id}-concept` }] } },
    sourceBinding: {
      chapterId: chapter.id,
      sourceId: "source-shared",
      sourceType: "webpage",
      title: "Cell transport",
      url: "https://learn.example/cells",
      fingerprint,
      rawText
    }
  });
  const artifacts = [
    artifact("note-first", "fp-first", "Original cell transport evidence explains diffusion across a membrane and concentration gradients."),
    artifact("note-second", "fp-second", "Updated cell transport evidence explains active transport and cellular energy requirements."),
    artifact("note-copy", "fp-first", "Original cell transport evidence explains diffusion across a membrane and concentration gradients.")
  ];

  const payload = Journey.buildChapterCollectionPayload(chapter, artifacts, 6000);
  assert.equal(payload.visualNoteCount, 3);
  assert.equal(payload.availableVisualNoteCount, 3);
  assert.equal(payload.sourceSnapshotCount, 2, "only exact source revisions should be deduplicated");
  assert.equal(payload.includedSourceCount, 2);
  assert.equal(new Set(payload.sources.map((source) => source.id)).size, 2, "colliding historical source IDs must be made unique");
  assert.deepEqual(new Set(payload.sources.map((source) => source.fingerprint)), new Set(["fp-first", "fp-second"]));
  assert.equal((payload.text.match(/<<<SOURCE_BLOCK>>>/g) || []).length, 2);
  assert.equal(payload.sourceRevisionHash, Journey.sourceRevisionHash(chapter));
  assert.notEqual(payload.compositionRevisionHash, "");
});

test("upgrades a saved visual note to visual note plus quiz evidence", () => {
  let journey = Journey.recordSession(Journey.createJourney(), "Forces", {
    id: "artifact-forces",
    kind: "note",
    artifactType: "study",
    title: "Forces visual note",
    visualLesson: { visualModel: { nodes: [{}, {}, {}] } },
    summary: ["Forces change motion."],
    terms: ["Force"]
  }, "2026-07-11T01:00:00Z").journey;
  journey = Journey.recordSession(journey, journey.chapters[0].id, {
    id: "artifact-forces",
    kind: "quiz",
    artifactType: "study",
    title: "Forces visual note",
    visualLesson: { visualModel: { nodes: [{}, {}, {}] } },
    questions: [{ id: "q1" }, { id: "q2" }],
    score: 90,
    submittedAt: "2026-07-11T02:00:00Z"
  }, "2026-07-11T02:00:00Z").journey;

  const artifact = journey.chapters[0].sessions[0];
  assert.equal(artifact.itemKind, "quiz");
  assert.equal(artifact.hasVisualNote, true);
  assert.equal(artifact.questionCount, 2);
  assert.deepEqual(artifact.summary, ["Forces change motion."]);
  assert.deepEqual(artifact.keyTerms, ["Force"]);
  assert.equal(Journey.getChapterStatus(journey.chapters[0]), "completed");
});

test("starting a replacement quiz does not erase the last completed result", () => {
  let journey = Journey.recordSession(Journey.createJourney(), "Biology", {
    id: "note-photo",
    kind: "quiz",
    title: "Photosynthesis quiz",
    score: 60,
    submittedAt: "2026-07-15T09:00:00Z",
    weakTopics: ["Light reactions"],
    questions: Array.from({ length: 5 }, (_, index) => ({ id: `old-${index}` }))
  }, "2026-07-15T09:00:00Z").journey;

  journey = Journey.recordSession(journey, journey.chapters[0].id, {
    id: "note-photo",
    kind: "quiz",
    title: "Photosynthesis recovery in progress",
    score: null,
    submittedAt: null,
    weakTopics: [],
    questions: Array.from({ length: 5 }, (_, index) => ({ id: `new-${index}` }))
  }, "2026-07-15T10:00:00Z").journey;

  const [record] = journey.chapters[0].sessions;
  assert.equal(record.score, 60);
  assert.equal(record.submittedAt, "2026-07-15T09:00:00.000Z");
  assert.deepEqual(record.weakTopics, ["Light reactions"]);
  assert.equal(record.questionCount, 5);
});

test("preserves PDF document metadata on a saved webpage source", () => {
  const added = Journey.addSource(Journey.createJourney(), "Documents", {
    type: "webpage",
    title: "Cell transport handbook",
    url: "https://learning.example/cell-transport.pdf",
    fingerprint: "pdf-cell-transport",
    text: "Page 1 Cell transport moves materials across membranes.",
    documentType: "pdf",
    pageCount: 14
  });
  const source = added.journey.chapters[0].sources[0];
  assert.equal(source.type, "webpage");
  assert.equal(source.documentType, "pdf");
  assert.equal(source.pageCount, 14);
});

test("migrates schema-v2 journeys with empty learning memory while preserving weakTopics", () => {
  const migrated = Journey.normalizeJourney({
    schemaVersion: 2,
    id: "journey-v2",
    title: "Legacy memory",
    chapters: [{
      id: "chapter-v2",
      title: "Photosynthesis",
      sessions: [{
        id: "quiz-v2",
        title: "Photosynthesis quiz",
        itemKind: "quiz",
        score: 40,
        submittedAt: "2026-07-14T01:00:00Z",
        weakTopics: ["Light-dependent reactions", "Calvin cycle"]
      }]
    }]
  });

  assert.equal(migrated.schemaVersion, 3);
  assert.deepEqual(migrated.learningMemory, {
    concepts: [],
    attempts: [],
    recordedAttemptIds: []
  });
  assert.deepEqual(
    migrated.chapters[0].sessions[0].weakTopics,
    ["Light-dependent reactions", "Calvin cycle"]
  );
});

test("normalizes source-grounded question attempts into the schema-v3 shape", () => {
  const normalized = Journey.normalizeQuestionAttempt(questionAttempt(1, {
    relatedConceptIds: ["concept-alpha", " concept-beta ", "concept-beta"],
    sourcePage: 20000,
    sourceRef: {
      sourceType: "webpage",
      documentType: "pdf",
      sourceId: "photosynthesis-note",
      sourceFingerprint: "photosynthesis-source",
      quote: "Chlorophyll absorbs light energy.",
      pageNumber: 20000
    },
    attemptType: "unsupported"
  }));

  assert.equal(normalized.attemptId, "attempt-001");
  assert.equal(normalized.result, "correct");
  assert.deepEqual(normalized.relatedConceptIds, ["concept-beta"]);
  assert.equal(normalized.sourcePage, 10000);
  assert.equal(normalized.sourceRef.sourcePage, 10000);
  assert.equal(normalized.sourceRef.sourceType, "webpage");
  assert.equal(normalized.sourceRef.documentType, "pdf");
  assert.equal(normalized.sourceRef.sourceFingerprint, "photosynthesis-source");
  assert.equal(normalized.sourceRef.quote, "Chlorophyll absorbs light energy.");
  assert.equal(normalized.attemptType, "normal");
  assert.equal(normalized.targetConceptId, "");
  assert.equal(Journey.normalizeQuestionAttempt({ questionId: "missing-required-fields" }), null);
});

test("migrates legacy concept memory with strength, interval, and review defaults", () => {
  const expectedStrengths = {
    "stable-concept": 80,
    "recovering-concept": 60,
    "weak-concept": 35
  };
  const concepts = [
    ["stable-concept", "stable"],
    ["recovering-concept", "recovering"],
    ["weak-concept", "weak"]
  ].map(([conceptId, state]) => ({
    noteId: "legacy-note",
    conceptId,
    conceptLabel: conceptId,
    timesTested: 3,
    timesWrong: state === "stable" ? 0 : 1,
    state,
    lastAttemptAt: "2026-07-10T10:00:00.000Z"
  }));

  const memory = Journey.normalizeLearningMemory({ concepts });

  memory.concepts.forEach((concept) => {
    assert.equal(concept.strength, expectedStrengths[concept.conceptId]);
    assert.equal(concept.intervalDays, 1);
    assert.equal(concept.nextReviewAt, "2026-07-11T10:00:00.000Z");
  });
});

test("raises strength and doubles the interval after a fully correct batch", () => {
  const answeredAt = "2026-07-15T10:00:00.000Z";
  const recorded = Journey.recordQuestionAttempts(
    Journey.createJourney("Strength", "2026-07-15T00:00:00.000Z"),
    [questionAttempt(101, { answeredAt })],
    { score: 100, submittedAt: answeredAt }
  );
  const concept = recorded.journey.learningMemory.concepts[0];

  assert.equal(concept.strength, 70);
  assert.equal(concept.intervalDays, 2);
  assert.equal(concept.nextReviewAt, "2026-07-17T10:00:00.000Z");
});

test("adds the due-date strength bonus only on or after the review time", () => {
  const makeJourney = (nextReviewAt) => Journey.normalizeJourney({
    ...Journey.createJourney("Due bonus", "2026-07-10T00:00:00.000Z"),
    learningMemory: {
      concepts: [{
        noteId: "note-memory",
        conceptId: "concept-alpha",
        conceptLabel: "Concept Alpha",
        timesTested: 1,
        timesWrong: 0,
        state: "stable",
        lastAttemptAt: "2026-07-14T10:00:00.000Z",
        strength: 50,
        intervalDays: 1,
        nextReviewAt
      }]
    }
  });
  const answeredAt = "2026-07-15T10:00:00.000Z";
  const beforeDue = Journey.recordQuestionAttempts(
    makeJourney("2026-07-15T10:00:01.000Z"),
    [questionAttempt(102, { answeredAt })],
    { score: 100, submittedAt: answeredAt }
  ).journey.learningMemory.concepts[0];
  const whenDue = Journey.recordQuestionAttempts(
    makeJourney(answeredAt),
    [questionAttempt(103, { answeredAt })],
    { score: 100, submittedAt: answeredAt }
  ).journey.learningMemory.concepts[0];

  assert.equal(beforeDue.strength, 70);
  assert.equal(whenDue.strength, 75);
});

test("reduces strength and resets the interval when a batch contains a wrong answer", () => {
  const answeredAt = "2026-07-15T10:00:00.000Z";
  const journey = Journey.normalizeJourney({
    ...Journey.createJourney("Wrong answer", "2026-07-10T00:00:00.000Z"),
    learningMemory: {
      concepts: [{
        noteId: "note-memory",
        conceptId: "concept-alpha",
        conceptLabel: "Concept Alpha",
        timesTested: 2,
        timesWrong: 0,
        state: "stable",
        lastAttemptAt: "2026-07-10T10:00:00.000Z",
        strength: 80,
        intervalDays: 8,
        nextReviewAt: "2026-07-18T10:00:00.000Z"
      }]
    }
  });
  const recorded = Journey.recordQuestionAttempts(journey, [
    questionAttempt(104, { answeredAt }),
    questionAttempt(105, { answeredAt, result: "incorrect", studentAnswer: "Wrong" })
  ], { score: 50, submittedAt: answeredAt });
  const concept = recorded.journey.learningMemory.concepts[0];

  assert.equal(concept.strength, 50);
  assert.equal(concept.intervalDays, 1);
  assert.equal(concept.nextReviewAt, "2026-07-16T10:00:00.000Z");
});

test("decays effective strength once a concept is overdue", () => {
  const strength = Journey.effectiveStrength({
    state: "stable",
    strength: 80,
    intervalDays: 2,
    lastAttemptAt: "2026-07-10T10:00:00.000Z"
  }, "2026-07-16T10:00:00.000Z");

  assert.equal(strength, 20);
});

test("orders weak due concepts first and applies limit and note filters", () => {
  const journey = Journey.normalizeJourney({
    ...Journey.createJourney("Due concepts", "2026-07-10T00:00:00.000Z"),
    learningMemory: {
      concepts: [{
        noteId: "note-a",
        conceptId: "stable-low",
        conceptLabel: "A stable low concept",
        timesTested: 2,
        timesWrong: 0,
        state: "stable",
        lastAttemptAt: "2026-07-15T10:00:00.000Z",
        strength: 20,
        intervalDays: 10,
        nextReviewAt: "2026-07-25T10:00:00.000Z"
      }, {
        noteId: "note-a",
        conceptId: "weak-high",
        conceptLabel: "Z weak concept",
        timesTested: 2,
        timesWrong: 1,
        state: "weak",
        lastAttemptAt: "2026-07-15T10:00:00.000Z",
        strength: 90,
        intervalDays: 10,
        nextReviewAt: "2026-07-25T10:00:00.000Z"
      }, {
        noteId: "note-b",
        conceptId: "other-note",
        conceptLabel: "Other note concept",
        timesTested: 1,
        timesWrong: 1,
        state: "weak",
        lastAttemptAt: "2026-07-15T10:00:00.000Z",
        strength: 40,
        intervalDays: 1,
        nextReviewAt: "2026-07-16T10:00:00.000Z"
      }]
    }
  });
  const now = "2026-07-16T10:00:00.000Z";

  assert.deepEqual(
    Journey.getDueConcepts(journey, { now, noteId: "note-a" }).map((concept) => concept.conceptId),
    ["weak-high", "stable-low"]
  );
  assert.deepEqual(
    Journey.getDueConcepts(journey, { now, limit: 1 }).map((concept) => concept.conceptId),
    ["other-note"]
  );
});

test("builds a zero habit profile from an empty or invalid journey", () => {
  const expected = {
    currentStreakDays: 0,
    bestStreakDays: 0,
    typicalSessionMinutes: 0,
    sessionsLast7Days: 0,
    sessionsPerWeekOverall: 0,
    preferredStudyHour: null,
    lastStudiedAt: null
  };

  assert.deepEqual(Journey.buildHabitProfile({}, [], "2026-07-16T10:00:00.000Z"), expected);
  assert.deepEqual(Journey.buildHabitProfile(null, null, "2026-07-16T10:00:00.000Z"), expected);
});

test("keeps a current streak through three consecutive days ending yesterday", () => {
  const profile = Journey.buildHabitProfile({
    events: ["2026-07-13", "2026-07-14", "2026-07-15"].map((localDay, index) => ({
      type: "generated",
      localDay,
      occurredAt: `2026-07-${String(13 + index).padStart(2, "0")}T10:00:00.000Z`
    }))
  }, [], "2026-07-16T10:00:00.000Z");

  assert.equal(profile.currentStreakDays, 3);
  assert.equal(profile.bestStreakDays, 3);
});

test("breaks the current habit streak after a full missed day", () => {
  const profile = Journey.buildHabitProfile({
    events: ["2026-07-10", "2026-07-11", "2026-07-13"].map((localDay, index) => ({
      type: "generated",
      localDay,
      occurredAt: [
        "2026-07-10T10:00:00.000Z",
        "2026-07-11T10:00:00.000Z",
        "2026-07-13T10:00:00.000Z"
      ][index]
    }))
  }, [], "2026-07-15T10:00:00.000Z");

  assert.equal(profile.currentStreakDays, 0);
  assert.equal(profile.bestStreakDays, 2);
});

test("uses the rounded median focus duration for odd and even histories", () => {
  const now = "2026-07-16T10:00:00.000Z";
  const odd = Journey.buildHabitProfile({}, [
    { elapsedMinutes: 10 },
    { elapsedMinutes: 20 },
    { elapsedMs: 30 * 60000 }
  ], now);
  const even = Journey.buildHabitProfile({}, [
    { elapsedMinutes: 10 },
    { elapsedMinutes: 20 },
    { elapsedMs: 30 * 60000 },
    { elapsedMinutes: 40 }
  ], now);

  assert.equal(odd.typicalSessionMinutes, 20);
  assert.equal(even.typicalSessionMinutes, 25);
});

test("finds the preferred local study hour only with at least three events", () => {
  const makeEvent = (occurredAt, localDay) => ({ type: "generated", occurredAt, localDay });
  const events = [
    makeEvent("2026-07-10T21:05:00", "2026-07-10"),
    makeEvent("2026-07-11T21:20:00", "2026-07-11"),
    makeEvent("2026-07-12T21:45:00", "2026-07-12"),
    makeEvent("2026-07-13T09:15:00", "2026-07-13")
  ];
  const now = "2026-07-16T10:00:00.000Z";

  assert.equal(Journey.buildHabitProfile({ events }, [], now).preferredStudyHour, 21);
  assert.equal(Journey.buildHabitProfile({ events: events.slice(0, 2) }, [], now).preferredStudyHour, null);
});

test("returns the single onboarding step when a study plan has no chapters", () => {
  const plan = Journey.buildStudyPlan(Journey.createJourney(), [], {
    now: "2026-07-16T10:00:00.000Z"
  });

  assert.equal(plan.generatedAt, "2026-07-16T10:00:00.000Z");
  assert.deepEqual(plan.steps, [{
    id: "onboard-1",
    kind: "advance",
    title: "Create your first visual note",
    reason: "Save a page, note, or video to plant your first tree.",
    noteId: "",
    conceptId: "",
    chapterId: "",
    estimatedMinutes: 5
  }]);
});

test("starts a study plan with an evidence-based weak-concept recovery", () => {
  const journey = Journey.normalizeJourney({
    ...Journey.createJourney("Recovery plan", "2026-07-10T00:00:00.000Z"),
    chapters: [{
      id: "chapter-recovery",
      title: "Photosynthesis",
      createdAt: "2026-07-10T00:00:00.000Z",
      updatedAt: "2026-07-15T09:00:00.000Z",
      sources: [],
      sessions: [{
        id: "note-recovery",
        itemKind: "note",
        title: "Photosynthesis note",
        generatedAt: "2026-07-15T09:00:00.000Z"
      }]
    }],
    learningMemory: {
      concepts: [{
        noteId: "note-recovery",
        conceptId: "calvin-cycle",
        conceptLabel: "Calvin cycle",
        timesTested: 3,
        timesWrong: 2,
        state: "weak",
        lastAttemptAt: "2026-07-15T10:00:00.000Z",
        strength: 35,
        intervalDays: 1,
        nextReviewAt: "2026-07-17T10:00:00.000Z"
      }]
    }
  });
  const plan = Journey.buildStudyPlan(journey, [], { now: "2026-07-16T10:00:00.000Z" });

  assert.equal(plan.steps[0].kind, "recovery");
  assert.equal(plan.steps[0].reason, "You missed this 2 of 3 times.");
  assert.equal(plan.steps[0].chapterId, "chapter-recovery");
});

test("sizes a study plan to the learner's typical focus session", () => {
  const journey = Journey.normalizeJourney({
    ...Journey.createJourney("Sized plan", "2026-07-10T00:00:00.000Z"),
    chapters: [{
      id: "chapter-sized",
      title: "Cell biology",
      createdAt: "2026-07-10T00:00:00.000Z",
      updatedAt: "2026-07-15T09:00:00.000Z",
      sources: [],
      sessions: [{ id: "note-sized", itemKind: "note", generatedAt: "2026-07-15T09:00:00.000Z" }]
    }],
    learningMemory: {
      concepts: [{
        noteId: "note-sized",
        conceptId: "weak-sized",
        conceptLabel: "Cell membrane",
        timesTested: 2,
        timesWrong: 1,
        state: "weak",
        lastAttemptAt: "2026-07-15T10:00:00.000Z",
        strength: 35,
        intervalDays: 1,
        nextReviewAt: "2026-07-17T10:00:00.000Z"
      }, {
        noteId: "note-sized",
        conceptId: "stable-sized",
        conceptLabel: "Nucleus",
        timesTested: 2,
        timesWrong: 0,
        state: "stable",
        lastAttemptAt: "2026-07-15T10:00:00.000Z",
        strength: 75,
        intervalDays: 10,
        nextReviewAt: "2026-07-25T10:00:00.000Z"
      }]
    }
  });
  const now = "2026-07-16T10:00:00.000Z";
  const shortPlan = Journey.buildStudyPlan(journey, [{ elapsedMinutes: 15 }], { now });
  const standardPlan = Journey.buildStudyPlan(journey, [{ elapsedMinutes: 30 }], { now });

  assert.equal(shortPlan.steps.length, 2);
  assert.equal(standardPlan.steps.length, 3);
});

test("uses chapter status to phrase review and first-quiz advance steps", () => {
  const baseChapter = {
    id: "chapter-status",
    title: "Forces",
    createdAt: "2026-07-10T00:00:00.000Z",
    updatedAt: "2026-07-15T09:00:00.000Z",
    sources: [{
      id: "source-forces",
      title: "Forces source",
      text: "Force changes motion.",
      capturedAt: "2026-07-15T08:00:00.000Z"
    }]
  };
  const reviewJourney = Journey.normalizeJourney({
    ...Journey.createJourney("Review wording", "2026-07-10T00:00:00.000Z"),
    chapters: [{
      ...baseChapter,
      sessions: [{
        id: "quiz-forces",
        itemKind: "quiz",
        score: 58,
        generatedAt: "2026-07-15T09:00:00.000Z",
        submittedAt: "2026-07-15T09:30:00.000Z"
      }]
    }]
  });
  const firstQuizJourney = Journey.normalizeJourney({
    ...Journey.createJourney("First quiz wording", "2026-07-10T00:00:00.000Z"),
    chapters: [{ ...baseChapter, sessions: [] }]
  });
  const now = "2026-07-16T10:00:00.000Z";
  const reviewStep = Journey.buildStudyPlan(reviewJourney, [], { now }).steps[0];
  const firstQuizStep = Journey.buildStudyPlan(firstQuizJourney, [], { now }).steps[0];

  assert.equal(reviewStep.title, "Review Forces and retake its quiz");
  assert.equal(reviewStep.reason, "Your last score there was below 65%.");
  assert.equal(firstQuizStep.title, "Take your first quiz in Forces");
  assert.equal(firstQuizStep.reason, "Activity only becomes mastery evidence after a submitted quiz.");
});

test("uses the clarified advance wording for an empty planned chapter", () => {
  const journey = Journey.normalizeJourney({
    ...Journey.createJourney("Planned chapter", "2026-07-10T00:00:00.000Z"),
    chapters: [{
      id: "chapter-planned",
      title: "Organic chemistry",
      createdAt: "2026-07-10T00:00:00.000Z",
      updatedAt: "2026-07-15T09:00:00.000Z",
      sources: [],
      sessions: []
    }]
  });
  const advance = Journey.buildStudyPlan(journey, [], {
    now: "2026-07-16T10:00:00.000Z"
  }).steps[0];

  assert.equal(advance.kind, "advance");
  assert.equal(advance.title, "Add your first source to Organic chemistry");
  assert.equal(advance.reason, "This chapter is planned but has no saved material yet.");
  assert.equal(advance.chapterId, "chapter-planned");
});

test("adds the weakest unused stable concept as a stretch step when there is room", () => {
  const journey = Journey.normalizeJourney({
    ...Journey.createJourney("Stretch plan", "2026-07-10T00:00:00.000Z"),
    chapters: [{
      id: "chapter-stretch",
      title: "Genetics",
      createdAt: "2026-07-10T00:00:00.000Z",
      updatedAt: "2026-07-15T09:00:00.000Z",
      sources: [],
      sessions: [{ id: "note-stretch", itemKind: "note", generatedAt: "2026-07-15T09:00:00.000Z" }]
    }],
    learningMemory: {
      concepts: [{
        noteId: "note-stretch",
        conceptId: "repair-concept",
        conceptLabel: "Punnett squares",
        timesTested: 3,
        timesWrong: 1,
        state: "weak",
        lastAttemptAt: "2026-07-15T10:00:00.000Z",
        strength: 35,
        intervalDays: 1,
        nextReviewAt: "2026-07-17T10:00:00.000Z"
      }, {
        noteId: "note-stretch",
        conceptId: "stable-low",
        conceptLabel: "Dominant alleles",
        timesTested: 3,
        timesWrong: 0,
        state: "stable",
        lastAttemptAt: "2026-07-15T10:00:00.000Z",
        strength: 65,
        intervalDays: 10,
        nextReviewAt: "2026-07-25T10:00:00.000Z"
      }, {
        noteId: "note-stretch",
        conceptId: "stable-high",
        conceptLabel: "Recessive alleles",
        timesTested: 3,
        timesWrong: 0,
        state: "stable",
        lastAttemptAt: "2026-07-15T10:00:00.000Z",
        strength: 85,
        intervalDays: 10,
        nextReviewAt: "2026-07-25T10:00:00.000Z"
      }]
    }
  });
  const plan = Journey.buildStudyPlan(journey, [{ elapsedMinutes: 30 }], {
    now: "2026-07-16T10:00:00.000Z"
  });
  const stretch = plan.steps.find((step) => step.kind === "stretch");
  const repairIds = new Set(plan.steps.filter((step) => step.kind === "recovery").map((step) => step.conceptId));

  assert.equal(stretch.conceptId, "stable-low");
  assert.equal(stretch.chapterId, "chapter-stretch");
  assert.equal(repairIds.has(stretch.conceptId), false);
});

test("shows a streak note only for a habit streak of at least two days", () => {
  const makeJourney = (days) => Journey.normalizeJourney({
    ...Journey.createJourney("Streak plan", "2026-07-10T00:00:00.000Z"),
    chapters: [{
      id: "chapter-streak",
      title: "Ecology",
      createdAt: "2026-07-10T00:00:00.000Z",
      updatedAt: "2026-07-15T09:00:00.000Z",
      sources: [],
      sessions: []
    }],
    events: days.map((localDay) => ({
      type: "generated",
      localDay,
      occurredAt: `${localDay}T10:00:00.000Z`
    }))
  });
  const now = "2026-07-16T10:00:00.000Z";

  assert.equal(
    Journey.buildStudyPlan(makeJourney(["2026-07-13", "2026-07-14", "2026-07-15"]), [], { now }).streakNote,
    "Day 3 streak — one quiz today keeps it alive."
  );
  assert.equal(Journey.buildStudyPlan(makeJourney(["2026-07-16"]), [], { now }).streakNote, "");
  assert.equal(Journey.buildStudyPlan(makeJourney([]), [], { now }).streakNote, "");
});

test("keeps mixed recent attempts bounded to 20 without losing lifetime counts or idempotence", () => {
  const attempts = Array.from({ length: 25 }, (_, offset) => {
    const index = offset + 1;
    return questionAttempt(index, {
      noteId: index % 2 ? "note-a" : "note-b",
      sourceFingerprint: index % 2 ? "source-a" : "source-b",
      primaryConceptId: `concept-${(index % 3) + 1}`,
      conceptLabel: `Concept ${(index % 3) + 1}`,
      result: index % 4 === 0 ? "incorrect" : "correct",
      studentAnswer: index % 4 === 0 ? "Wrong" : "Correct"
    });
  });

  const first = Journey.recordQuestionAttempts(Journey.createJourney(), attempts, {
    quizId: "quiz-memory",
    score: 76,
    submittedAt: "2026-07-15T02:00:00Z"
  });

  assert.equal(first.recordedCount, 25);
  assert.equal(first.duplicateCount, 0);
  assert.equal(first.journey.learningMemory.attempts.length, 20);
  assert.deepEqual(
    first.journey.learningMemory.attempts.map((attempt) => attempt.attemptId),
    attempts.slice(5).map((attempt) => attempt.attemptId)
  );
  assert.deepEqual(
    new Set(first.journey.learningMemory.attempts.map((attempt) => attempt.noteId)),
    new Set(["note-a", "note-b"])
  );
  assert.equal(
    first.journey.learningMemory.concepts.reduce((sum, concept) => sum + concept.timesTested, 0),
    25
  );

  const revisionBeforeReplay = first.journey.revision;
  const replay = Journey.recordQuestionAttempts(first.journey, [attempts[0]], {
    quizId: "quiz-memory",
    score: 100,
    submittedAt: "2026-07-15T03:00:00Z"
  });
  assert.equal(replay.recordedCount, 0, "an evicted recent attempt must still be recognized as recorded");
  assert.equal(replay.duplicateCount, 1);
  assert.equal(replay.journey.revision, revisionBeforeReplay);
  assert.equal(
    replay.journey.learningMemory.concepts.reduce((sum, concept) => sum + concept.timesTested, 0),
    25
  );
});

test("moves a weak concept through qualifying recovery and a later stable quiz", () => {
  let journey = Journey.createJourney("Recovery", "2026-07-15T00:00:00Z");
  journey = Journey.recordQuestionAttempts(journey, [questionAttempt(1, {
    result: "incorrect",
    studentAnswer: "Wrong"
  })], { score: 0, submittedAt: "2026-07-15T01:01:00Z" }).journey;

  const conceptState = () => journey.learningMemory.concepts.find((concept) => (
    concept.noteId === "note-memory" && concept.conceptId === "concept-alpha"
  ));
  assert.equal(conceptState().state, "weak");

  const recoveryAttempts = [
    ...[10, 11, 12].map((index) => questionAttempt(index, {
      attemptType: "recovery",
      targetConceptId: "concept-alpha"
    })),
    questionAttempt(13, {
      primaryConceptId: "concept-beta",
      conceptLabel: "Concept Beta"
    }),
    questionAttempt(14, {
      primaryConceptId: "concept-gamma",
      conceptLabel: "Concept Gamma",
      result: "incorrect",
      studentAnswer: "Wrong"
    })
  ];
  journey = Journey.recordQuestionAttempts(journey, recoveryAttempts, {
    score: 80,
    submittedAt: "2026-07-15T01:02:00Z"
  }).journey;
  assert.equal(conceptState().state, "recovering");
  assert.equal(conceptState().timesTested, 4);
  assert.equal(conceptState().timesWrong, 1);

  const laterQuiz = [20, 21, 22, 23, 24].map((index) => questionAttempt(index, {
    primaryConceptId: index === 20 ? "concept-alpha" : `later-concept-${index}`,
    conceptLabel: index === 20 ? "Concept Alpha" : `Later concept ${index}`
  }));
  journey = Journey.recordQuestionAttempts(journey, laterQuiz, {
    score: 100,
    submittedAt: "2026-07-15T01:03:00Z"
  }).journey;

  assert.equal(conceptState().state, "stable");
  assert.equal(conceptState().timesTested, 5);
  assert.equal(conceptState().timesWrong, 1);
});

test("requires the standard 3-of-3 recovery target count unless fallback metadata supplies another count", () => {
  const startWeak = (index) => Journey.recordQuestionAttempts(
    Journey.createJourney("Recovery counts", "2026-07-15T00:00:00Z"),
    [questionAttempt(index, { result: "incorrect", studentAnswer: "Wrong" })],
    { score: 0 }
  ).journey;
  const fourTargetRecovery = (startIndex) => [
    ...[0, 1, 2, 3].map((offset) => questionAttempt(startIndex + offset, {
      attemptType: "recovery",
      targetConceptId: "concept-alpha"
    })),
    questionAttempt(startIndex + 4, {
      primaryConceptId: "concept-beta",
      conceptLabel: "Concept Beta",
      attemptType: "recovery",
      targetConceptId: "concept-alpha"
    })
  ];
  const alphaState = (journey) => journey.learningMemory.concepts.find(
    (concept) => concept.noteId === "note-memory" && concept.conceptId === "concept-alpha"
  ).state;

  let standard = startWeak(39);
  standard = Journey.recordQuestionAttempts(standard, fourTargetRecovery(40), { score: 100 }).journey;
  assert.equal(alphaState(standard), "weak", "four target questions are not the standard 3-of-3 composition");

  let fallback = startWeak(49);
  fallback = Journey.recordQuestionAttempts(fallback, fourTargetRecovery(50), {
    score: 100,
    expectedTargetCount: 4
  }).journey;
  assert.equal(alphaState(fallback), "recovering");
});

test("ranks weak concepts by primary-concept misses, current error rate, history, then recency", () => {
  const concepts = [
    ["concept-a", "Concept A", 10, 6, "2026-07-15T02:00:00Z"],
    ["concept-b", "Concept B", 5, 4, "2026-07-15T02:01:00Z"],
    ["concept-c", "Concept C", 10, 5, "2026-07-15T02:02:00Z"],
    ["concept-d", "Concept D", 4, 2, "2026-07-15T02:03:00Z"],
    ["concept-e", "Concept E", 4, 2, "2026-07-15T02:04:00Z"]
  ].map(([conceptId, conceptLabel, timesTested, timesWrong, lastAttemptAt]) => ({
    noteId: "note-rank",
    sourceFingerprint: "source-rank",
    conceptId,
    conceptLabel,
    timesTested,
    timesWrong,
    state: "weak",
    lastAttemptAt
  }));
  const attempts = [
    questionAttempt(30, {
      noteId: "note-rank",
      sourceFingerprint: "source-rank",
      primaryConceptId: "concept-a",
      relatedConceptIds: ["concept-b"],
      conceptLabel: "Concept A",
      result: "incorrect",
      studentAnswer: "Wrong"
    }),
    questionAttempt(31, {
      noteId: "note-rank",
      sourceFingerprint: "source-rank",
      primaryConceptId: "concept-a",
      conceptLabel: "Concept A",
      result: "incorrect",
      studentAnswer: "Wrong"
    }),
    questionAttempt(32, {
      noteId: "note-rank",
      sourceFingerprint: "source-rank",
      primaryConceptId: "concept-b",
      conceptLabel: "Concept B",
      result: "incorrect",
      studentAnswer: "Wrong"
    }),
    questionAttempt(33, {
      noteId: "note-rank",
      sourceFingerprint: "source-rank",
      primaryConceptId: "concept-b",
      conceptLabel: "Concept B"
    }),
    ...["c", "d", "e"].map((suffix, index) => questionAttempt(34 + index, {
      noteId: "note-rank",
      sourceFingerprint: "source-rank",
      primaryConceptId: `concept-${suffix}`,
      conceptLabel: `Concept ${suffix.toUpperCase()}`,
      result: "incorrect",
      studentAnswer: "Wrong"
    }))
  ];
  const olderMemoryAttempt = questionAttempt(29, {
    noteId: "note-rank",
    sourceFingerprint: "source-rank",
    primaryConceptId: "concept-b",
    conceptLabel: "Concept B",
    result: "incorrect",
    studentAnswer: "Wrong"
  });
  const journey = Journey.normalizeJourney({
    ...Journey.createJourney("Ranking", "2026-07-15T00:00:00Z"),
    learningMemory: { concepts, attempts: [olderMemoryAttempt, ...attempts] }
  });

  const ranked = Journey.rankWeakConcepts(journey, {
    noteId: "note-rank",
    currentAttempts: attempts
  });

  assert.deepEqual(
    ranked.map((concept) => concept.conceptId),
    ["concept-a", "concept-c", "concept-e", "concept-d", "concept-b"]
  );
  assert.equal(ranked.find((concept) => concept.conceptId === "concept-b").wrongCount, 1);
  assert.equal(ranked.find((concept) => concept.conceptId === "concept-b").errorRate, 0.5);
  assert.equal(ranked.find((concept) => concept.conceptId === "concept-c").historicalMisses, 4);
});

test("clears only learning memory and leaves chapters, sources, sessions, events, and weakTopics intact", () => {
  let journey = Journey.addSource(Journey.createJourney("Clear memory", "2026-07-15T00:00:00Z"), "Photosynthesis", {
    id: "source-photo",
    title: "Photosynthesis note",
    fingerprint: "source-memory",
    text: "Plants convert light energy into chemical energy."
  }, "2026-07-15T00:10:00Z").journey;
  journey = Journey.recordSession(journey, journey.chapters[0].id, {
    id: "quiz-memory",
    title: "Photosynthesis quiz",
    score: 60,
    submittedAt: "2026-07-15T00:20:00Z",
    weakTopics: ["Calvin cycle"]
  }, "2026-07-15T00:20:00Z").journey;
  journey = Journey.recordQuestionAttempts(journey, [questionAttempt(1, {
    result: "incorrect",
    studentAnswer: "Wrong"
  })], { score: 0, submittedAt: "2026-07-15T00:21:00Z" }).journey;

  const chaptersBefore = structuredClone(journey.chapters);
  const eventsBefore = structuredClone(journey.events);
  const revisionBefore = journey.revision;
  const cleared = Journey.clearLearningMemory(journey, "2026-07-15T00:30:00Z");

  assert.equal(cleared.clearedAttemptCount, 1);
  assert.equal(cleared.clearedConceptCount, 1);
  assert.deepEqual(cleared.journey.learningMemory, {
    concepts: [],
    attempts: [],
    recordedAttemptIds: []
  });
  assert.deepEqual(cleared.journey.chapters, chaptersBefore);
  assert.deepEqual(cleared.journey.events, eventsBefore);
  assert.deepEqual(cleared.journey.chapters[0].sessions[0].weakTopics, ["Calvin cycle"]);
  assert.equal(cleared.journey.revision, revisionBefore + 1);

  const clearedAgain = Journey.clearLearningMemory(cleared.journey, "2026-07-15T00:40:00Z");
  assert.equal(clearedAgain.journey.revision, cleared.journey.revision);
  assert.equal(clearedAgain.clearedAttemptCount, 0);
  assert.equal(clearedAgain.clearedConceptCount, 0);
});

test("normalizes proposed chapter titles while preserving exact existing names", () => {
  assert.equal(Journey.normalizeChapterTitleProposal(" java ", ["Java"]), "Java");
  assert.equal(Journey.normalizeChapterTitleProposal("machine   learning", []), "Machine Learning");
  const longTitle = Journey.normalizeChapterTitleProposal("a".repeat(80), []);
  assert.equal(longTitle.length, 60);
  assert.equal(longTitle[0], "A");
});

test("plans multiple files into two new chapters in stable assignment order", () => {
  const assignments = [
    ...Array.from({ length: 3 }, (_, index) => ({
      fileId: `java-${index + 1}`,
      chapterTitle: "java",
      confidence: 0.8
    })),
    ...Array.from({ length: 5 }, (_, index) => ({
      fileId: `cooking-${index + 1}`,
      chapterTitle: "cooking",
      confidence: 0.7
    }))
  ];
  const plan = Journey.planBulkFiling(
    assignments,
    Journey.createJourney("Smart import", "2026-07-16T00:00:00Z")
  );

  assert.equal(plan.rows.length, 8);
  assert.deepEqual(plan.rows.map((row) => row.finalChapterTitle), [
    "Java", "Java", "Java",
    "Cooking", "Cooking", "Cooking", "Cooking", "Cooking"
  ]);
  assert.deepEqual(plan.newChapterTitles, ["Java", "Cooking"]);
  assert.equal(plan.blockedCount, 0);
  assert.equal(plan.valid, true);
});

test("fills an existing chapter before creating a numbered spillover chapter", () => {
  const journey = Journey.createJourney("Overflow", "2026-07-16T00:00:00Z");
  journey.chapters = [{
    id: "chapter-cooking",
    title: "Cooking",
    createdAt: "2026-07-16T00:00:00Z",
    updatedAt: "2026-07-16T00:00:00Z",
    sources: Array.from({ length: 7 }, (_, index) => ({
      id: `source-${index + 1}`,
      title: `Recipe ${index + 1}`,
      text: `Recipe instructions ${index + 1}`,
      fingerprint: `recipe-${index + 1}`
    })),
    sessions: []
  }];
  const plan = Journey.planBulkFiling(
    Array.from({ length: 3 }, (_, index) => ({
      fileId: `recipe-${index + 1}`,
      chapterTitle: "cooking",
      confidence: 0.9
    })),
    journey
  );

  assert.deepEqual(plan.rows.map((row) => row.finalChapterTitle), ["Cooking", "Cooking 2", "Cooking 2"]);
  assert.deepEqual(plan.rows.map((row) => row.spillover), [false, true, true]);
  assert.deepEqual(plan.newChapterTitles, ["Cooking 2"]);
});

test("blocks new chapters at the cap while retaining existing chapter capacity", () => {
  const journey = Journey.createJourney("Full", "2026-07-16T00:00:00Z");
  journey.chapters = Array.from({ length: Journey.MAX_CHAPTERS }, (_, index) => ({
    id: `chapter-${index + 1}`,
    title: `Chapter ${index + 1}`,
    createdAt: "2026-07-16T00:00:00Z",
    updatedAt: "2026-07-16T00:00:00Z",
    sources: [],
    sessions: []
  }));
  const plan = Journey.planBulkFiling([
    { fileId: "new-file", chapterTitle: "Brand New Topic", confidence: 0.6 },
    { fileId: "existing-file", chapterTitle: "chapter 1", confidence: 0.6 }
  ], journey);

  assert.equal(plan.rows[0].blocked, true);
  assert.equal(plan.rows[0].finalChapterTitle, "");
  assert.equal(plan.rows[1].blocked, false);
  assert.equal(plan.rows[1].finalChapterTitle, "Chapter 1");
  assert.equal(plan.blockedCount, 1);
  assert.equal(plan.valid, false);
});

test("keeps unreadable files in a filing plan without assigning or blocking them", () => {
  const plan = Journey.planBulkFiling([
    { fileId: "unreadable", chapterTitle: "Ignored", confidence: 4, skipped: true }
  ], Journey.createJourney("Skipped", "2026-07-16T00:00:00Z"));

  assert.deepEqual(plan.rows[0], {
    fileId: "unreadable",
    finalChapterTitle: "",
    willCreateChapter: false,
    spillover: false,
    blocked: false,
    skipped: true,
    confidence: 1
  });
  assert.deepEqual(plan.newChapterTitles, []);
  assert.equal(plan.valid, true);
});

test("locally classifies shared Java terms into the first matching chapter", () => {
  const journey = Journey.createJourney("Local classifier", "2026-07-16T00:00:00Z");
  journey.chapters = [{
    id: "chapter-java",
    title: "Java",
    createdAt: "2026-07-16T00:00:00Z",
    updatedAt: "2026-07-16T00:00:00Z",
    sources: [{
      id: "source-java",
      title: "Java Streams Tutorial",
      text: "Streams transform collections.",
      fingerprint: "java-streams"
    }],
    sessions: []
  }];
  const [assignment] = Journey.classifySourcesLocally([{
    fileId: "java-file",
    title: "Collections lesson.pdf",
    excerpt: "Java streams map and filter collection values."
  }], journey);

  assert.deepEqual(assignment, {
    fileId: "java-file",
    chapterTitle: "Java",
    isNewChapter: false,
    confidence: 0.4,
    reason: "Local match: shared terms with Java"
  });
});

test("locally names a new chapter from the first three cleaned filename words", () => {
  const [assignment] = Journey.classifySourcesLocally([{
    fileId: "pasta-file",
    title: "italian_pasta_recipes_2024.pdf",
    excerpt: "Boil water and prepare a tomato sauce."
  }], Journey.createJourney("Recipes", "2026-07-16T00:00:00Z"));

  assert.equal(assignment.chapterTitle, "Italian Pasta Recipes");
  assert.equal(assignment.isNewChapter, true);
  assert.equal(assignment.confidence, 0.3);
  assert.equal(assignment.reason, "No close match — named from the file title");
});

test("smart import pure helpers tolerate garbage inputs", () => {
  assert.deepEqual(Journey.planBulkFiling(null, null), {
    rows: [],
    newChapterTitles: [],
    blockedCount: 0,
    valid: true
  });
  assert.deepEqual(Journey.planBulkFiling([], null), {
    rows: [],
    newChapterTitles: [],
    blockedCount: 0,
    valid: true
  });
  assert.deepEqual(Journey.classifySourcesLocally(null, null), []);
  assert.equal(Journey.normalizeChapterTitleProposal(null, null), "New Chapter");
  assert.doesNotThrow(() => Journey.classifySourcesLocally([null], null));
});
