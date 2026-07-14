const assert = require("node:assert/strict");
const test = require("node:test");

const {
  transcribeAudioChunk,
  isRetryableTranscriptOutputError
} = require("../server.js");
const Video = require("../video-utils.js");

function wavChunk(overrides = {}) {
  const wav = Buffer.alloc(48);
  wav.write("RIFF", 0, "ascii");
  wav.write("WAVE", 8, "ascii");
  return {
    id: "chunk-0001",
    sequence: 1,
    capturedDurationMs: 1000,
    wavBase64: wav.toString("base64"),
    ...overrides
  };
}

test("Gemini WAV chunk uses audio/wav inline data and returns one validated segment", async () => {
  let received;
  const result = await transcribeAudioChunk({ chunk: wavChunk() }, {
    generateParts: async (system, parts, maxTokens, schemaName) => {
      received = { system, parts, maxTokens, schemaName };
      return JSON.stringify({
        language: "en",
        segments: [{ startMs: 100, endMs: 900, text: "Photosynthesis stores light energy." }]
      });
    }
  });
  assert.equal(received.parts[0].inlineData.mimeType, "audio/wav");
  assert.ok(received.parts[0].inlineData.data.length > 0);
  assert.equal(received.schemaName, "video_transcript");
  assert.equal(result.attempts, 1);
  assert.equal(result.segments.length, 1);
});

test("provider empty output retries once and then succeeds", async () => {
  let calls = 0;
  const result = await transcribeAudioChunk({ chunk: wavChunk() }, {
    generateParts: async () => {
      calls += 1;
      return calls === 1
        ? JSON.stringify({ segments: [] })
        : JSON.stringify({ segments: [{ startMs: 0, endMs: 750, text: "The lesson begins." }] });
    }
  });
  assert.equal(calls, 2);
  assert.equal(result.attempts, 2);
  assert.equal(result.segments.length, 1);
});

test("provider empty output and malformed JSON become explicit errors after retry", async () => {
  let emptyCalls = 0;
  await assert.rejects(
    transcribeAudioChunk({ chunk: wavChunk() }, {
      generateParts: async () => {
        emptyCalls += 1;
        return JSON.stringify({ segments: [] });
      }
    }),
    (error) => error.code === "GEMINI_EMPTY_TRANSCRIPT" && error.attemptCount === 2
  );
  assert.equal(emptyCalls, 2);

  let malformedCalls = 0;
  await assert.rejects(
    transcribeAudioChunk({ chunk: wavChunk() }, {
      generateParts: async () => {
        malformedCalls += 1;
        return "not transcript JSON";
      }
    }),
    (error) => error.code === "GEMINI_INVALID_RESPONSE" && error.attemptCount === 2
  );
  assert.equal(malformedCalls, 2);

  let schemaCalls = 0;
  await assert.rejects(
    transcribeAudioChunk({ chunk: wavChunk() }, {
      generateParts: async () => {
        schemaCalls += 1;
        return JSON.stringify({ transcript: "missing required segments array" });
      }
    }),
    (error) => error.code === "GEMINI_INVALID_RESPONSE" && error.attemptCount === 2
  );
  assert.equal(schemaCalls, 2);
});

test("provider authentication failure is explicit and is not retried", async () => {
  let calls = 0;
  await assert.rejects(
    transcribeAudioChunk({ chunk: wavChunk() }, {
      generateParts: async () => {
        calls += 1;
        const error = new Error("API key invalid");
        error.providerStatus = 403;
        throw error;
      }
    }),
    (error) => error.code === "GEMINI_AUTH_FAILED" && /API key/i.test(error.message)
  );
  assert.equal(calls, 1);
});

test("out-of-chunk provider timestamps retry and end as an explicit validation error", async () => {
  let calls = 0;
  await assert.rejects(
    transcribeAudioChunk({ chunk: wavChunk() }, {
      generateParts: async () => {
        calls += 1;
        return JSON.stringify({
          segments: [{ startMs: 900, endMs: 2500, text: "Timestamp extends beyond the chunk." }]
        });
      }
    }),
    (error) => error.code === "GEMINI_INVALID_TIMESTAMPS" && error.attemptCount === 2
  );
  assert.equal(calls, 2);
});

test("chunk state cannot report success with zero segments and preserves final errors", () => {
  const chunk = { id: "chunk-0001", sequence: 1 };
  const pending = Video.transitionChunkTranscription({}, chunk, { type: "pending" }, 1000);
  assert.equal(pending.pendingChunkCount, 1);
  assert.equal(pending.transcriptionStatus, "pending");
  assert.throws(
    () => Video.transitionChunkTranscription(pending, chunk, { type: "success", segmentCount: 0 }, 1100),
    /at least one validated transcript segment/
  );
  const failed = Video.transitionChunkTranscription(pending, chunk, {
    type: "error",
    attemptCount: 2,
    errorCode: "GEMINI_EMPTY_TRANSCRIPT",
    error: "No speech segments returned."
  }, 1200);
  assert.equal(failed.pendingChunkCount, 0);
  assert.equal(failed.failedChunkCount, 1);
  assert.equal(failed.lastTranscriptionErrorCode, "GEMINI_EMPTY_TRANSCRIPT");
  assert.equal(failed.chunkTranscriptions[0].status, "error");
  assert.equal(isRetryableTranscriptOutputError({ code: failed.lastTranscriptionErrorCode }), true);
});
