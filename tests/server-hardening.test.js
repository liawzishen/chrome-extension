const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const serverSource = fs.readFileSync(path.join(__dirname, "..", "server.js"), "utf8");

function functionSource(startMarker, endMarker) {
  const start = serverSource.indexOf(startMarker);
  const end = serverSource.indexOf(endMarker, start + startMarker.length);
  assert.ok(start >= 0, `Missing ${startMarker}`);
  assert.ok(end > start, `Missing ${endMarker}`);
  return serverSource.slice(start, end);
}

process.env.BACKEND_ACCESS_TOKEN = "test-token-that-is-long-enough-123456";
process.env.ALLOWED_EXTENSION_ORIGINS = "chrome-extension://abcdefghijklmnopabcdefghijklmnop";

const {
  assertAuthorizedRequest,
  fitJourneyContext,
  getAllowedRequestOrigin,
  isTrustedLoopbackExtensionRequest,
  normalizeAutomaticTranscript,
  normalizeQuestion,
  normalizePublicYouTubeUrl,
  resolveCollectionSource,
  resolveVideoSegment
} = require("../server.js");

test("allows tokenless auth only for the exact configured extension origin on loopback", () => {
  assert.equal(getAllowedRequestOrigin({ headers: { origin: "chrome-extension://abcdefghijklmnopabcdefghijklmnop" } }), "chrome-extension://abcdefghijklmnopabcdefghijklmnop");
  assert.equal(getAllowedRequestOrigin({ headers: { origin: "chrome-extension://otherextension" } }), null);
  assert.equal(getAllowedRequestOrigin({ headers: { origin: "chrome-extension://abcdefghijklmnopabcdefghijklmnop/" } }), null);
  const trustedRequest = {
    headers: { origin: "chrome-extension://abcdefghijklmnopabcdefghijklmnop" },
    socket: { localAddress: "127.0.0.1" }
  };
  assert.equal(isTrustedLoopbackExtensionRequest(trustedRequest), true);
  assert.doesNotThrow(() => assertAuthorizedRequest(trustedRequest));
  assert.throws(
    () => assertAuthorizedRequest({ ...trustedRequest, socket: { localAddress: "192.0.2.20" } }),
    (error) => error.code === "BACKEND_TOKEN_REQUIRED"
  );
  assert.throws(
    () => assertAuthorizedRequest({
      ...trustedRequest,
      headers: { ...trustedRequest.headers, authorization: "Bearer wrong" }
    }),
    (error) => error.code === "BACKEND_TOKEN_INVALID" && /invalid/i.test(error.message)
  );
  assert.doesNotThrow(() => assertAuthorizedRequest({
    headers: { authorization: "Bearer test-token-that-is-long-enough-123456" }
  }));
});

test("provider requests keep API keys out of URLs and disable OpenAI response storage", () => {
  const openAiRequest = functionSource(
    "async function generateOpenAiText(",
    "async function generateGeminiText("
  );
  const geminiRequest = functionSource(
    "async function generateGeminiParts(",
    "async function generateStudySession("
  );

  assert.match(openAiRequest, /body:\s*JSON\.stringify\(\{[\s\S]*?\bstore:\s*false\b/);
  assert.match(geminiRequest, /"x-goog-api-key":\s*GEMINI_API_KEY/);
  assert.match(geminiRequest, /const url = `https:\/\/generativelanguage\.googleapis\.com\/[^`]+:generateContent`/);
  assert.doesNotMatch(geminiRequest, /[?&](?:key|api_key|token)=/i);
});

test("normalizes safe unique question ids, choices, and balanced answer positions", () => {
  const source = {
    sourceType: "webpage"
  };
  const question = {
    id: "bad id ]\"",
    prompt: "Which choice is supported?",
    choices: ["Correct", "Second", "Third", "Fourth"],
    answer: "Correct",
    sourceText: "Supported source detail",
    explanation: "Supported source detail",
    topic: "Evidence"
  };
  const first = normalizeQuestion(question, source, 0);
  const third = normalizeQuestion(question, source, 2);
  assert.equal(first.id, "q-001");
  assert.equal(third.id, "q-003");
  assert.equal(first.choices.indexOf("Correct"), 0);
  assert.equal(third.choices.indexOf("Correct"), 2);
  assert.throws(
    () => normalizeQuestion({ ...question, choices: ["Same", "same", "Other", "Fourth"], answer: "Same" }, source, 0),
    /four distinct choices/
  );
});

test("collection and video provenance require explicit supported evidence", () => {
  const collection = {
    rawText: "SOURCE source-a\nTitle: A\nCell membranes control transport through selective permeability.\n\nSOURCE source-b\nTitle: B\nDiffusion moves particles down a concentration gradient.",
    collectionSources: [
      { id: "source-a", type: "webpage", title: "A", url: "https://example.com/a" },
      { id: "source-b", type: "webpage", title: "B", url: "https://example.com/b" }
    ]
  };
  assert.equal(
    resolveCollectionSource(collection, "source-b", "particles move down a concentration gradient").id,
    "source-b"
  );
  assert.throws(() => resolveCollectionSource(collection, "source-b", "unrelated astronomy claim"), /not supported/);
  assert.throws(() => resolveCollectionSource(collection, "", "diffusion particles gradient"), /omitted/);

  const segments = [{ id: "seg-0001", startMs: 12000, endMs: 17000, text: "Diffusion moves particles down a concentration gradient." }];
  assert.equal(resolveVideoSegment(segments, "seg-0001", "particles move down a concentration gradient").id, "seg-0001");
  assert.throws(() => resolveVideoSegment(segments, "", "particles gradient"), /omitted/);
});

test("journey context fitting stays within the paid prompt budget", () => {
  const chapters = Array.from({ length: 24 }, (_, chapterIndex) => ({
    id: `chapter-${chapterIndex}`,
    title: `Chapter ${chapterIndex}`,
    status: "current",
    sourceCount: 8,
    sessions: Array.from({ length: 8 }, (_, sessionIndex) => ({
      title: `Session ${sessionIndex}`,
      summary: ["x".repeat(180), "y".repeat(180), "z".repeat(180), "w".repeat(180)],
      weakTopics: Array(6).fill("weak-topic".repeat(8))
    }))
  }));
  const fitted = fitJourneyContext(chapters, 96 * 1024);
  assert.ok(Buffer.byteLength(JSON.stringify(fitted), "utf8") <= 96 * 1024);
  assert.ok(fitted.reduce((total, chapter) => total + chapter.sessions.length, 0) < 24 * 8);
});

test("accepts only canonical public YouTube watch URLs and validates estimated transcript time", () => {
  assert.equal(
    normalizePublicYouTubeUrl("https://youtu.be/abcDEF12345?t=42"),
    "https://www.youtube.com/watch?v=abcDEF12345"
  );
  assert.equal(normalizePublicYouTubeUrl("https://example.com/watch?v=abcDEF12345"), "");
  const result = normalizeAutomaticTranscript({
    title: "Lesson",
    segments: [
      { startMs: 0, endMs: 1500, text: "First point" },
      { startMs: 1500, endMs: 3000, text: "Second point" },
      { startMs: 3000, endMs: 4500, text: "Third point" }
    ]
  }, { durationMs: 5000, minimumSegments: 3, provenance: "youtube-ai" });
  assert.equal(result.timestampConfidence, "AI-estimated");
  assert.equal(result.segments[0].id, "seg-0001");
  assert.throws(() => normalizeAutomaticTranscript({
    segments: [
      { startMs: 0, endMs: 2500, text: "First" },
      { startMs: 2000, endMs: 3000, text: "Overlaps" },
      { startMs: 3000, endMs: 6000, text: "Too late" }
    ]
  }, { durationMs: 5000, minimumSegments: 3 }), /invalid or non-monotonic/);
});
