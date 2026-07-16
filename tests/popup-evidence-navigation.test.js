const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const popup = fs.readFileSync(path.join(__dirname, "..", "popup.js"), "utf8");

function sourceBetween(startMarker, endMarker) {
  const start = popup.indexOf(startMarker);
  const end = popup.indexOf(endMarker, start + startMarker.length);
  assert.ok(start >= 0, `Missing ${startMarker}`);
  assert.ok(end > start, `Missing ${endMarker}`);
  return popup.slice(start, end).trim();
}

function createUrlHarness() {
  return vm.runInNewContext(`(() => {
    ${sourceBetween("function normalizeSafeExternalUrl(value, options = {})", "async function openSafeExternalUrl(")}
    ${sourceBetween("function normalizePageUrl(value)", "function makeContentFingerprint(value)")}
    return { samePageUrl, buildSourceHighlightUrl, buildPdfEvidenceUrl };
  })()`, { URL, encodeURIComponent });
}

test("builds source URLs that open at and highlight the cited sentence", () => {
  const harness = createUrlHarness();
  const highlighted = harness.buildSourceHighlightUrl(
    "https://example.test/lesson#energy",
    "Light energy is converted into chemical energy stored in glucose."
  );
  assert.match(highlighted, /^https:\/\/example\.test\/lesson#energy:~:text=/);
  assert.match(highlighted, /Light%20energy%20is%20converted/);
  assert.equal(harness.samePageUrl(highlighted, "https://example.test/lesson#energy"), true);
  assert.equal(harness.samePageUrl(highlighted, "https://example.test/lesson#other-section"), false);

  const pdf = harness.buildPdfEvidenceUrl(
    "https://example.test/networking.pdf",
    18,
    "TCP congestion control reduces the sending window after loss."
  );
  assert.match(pdf, /#page=18&search=TCP%20congestion%20control/);
});

test("dispatches collection evidence by the cited source's real type and metadata", async () => {
  const calls = [];
  const context = {
    URL,
    normalizeSafeExternalUrl: (value) => String(value || ""),
    persistCurrentSessionDraft: async () => {},
    openSafeExternalUrl: async (url) => calls.push({ kind: "open", url }),
    jumpToPdfPage: async (page, options) => {
      calls.push({ kind: "pdf", page, options });
      return { found: true, message: "pdf" };
    },
    jumpToVideoTimestamp: async (seconds, options) => {
      calls.push({ kind: "video", seconds, options });
      return { found: true, message: "video" };
    },
    highlightSourceText: async (quote, options) => {
      calls.push({ kind: "webpage", quote, options });
      return { found: true, message: "webpage" };
    }
  };
  const harness = vm.runInNewContext(`(() => {
    ${sourceBetween("function normalizePageUrl(value)", "function getEvidenceHighlightExcerpt(value")}
    ${sourceBetween("function resolveEvidenceDescriptor(evidence = {}, context = {})", "async function jumpToVideoTimestamp(")}
    return { resolveEvidenceDescriptor, openEvidenceAtSource };
  })()`, context);
  const collection = {
    sourceType: "collection",
    sources: [{
      id: "source-pdf",
      type: "webpage",
      documentType: "pdf",
      url: "https://example.test/chapter.pdf",
      fingerprint: "pdf-fingerprint",
      pageCount: 42
    }]
  };
  const evidence = {
    sourceId: "source-pdf",
    sourceType: "collection",
    sourcePage: 18,
    sourceText: "Congestion control reduces the sending window after packet loss."
  };

  const descriptor = harness.resolveEvidenceDescriptor(evidence, collection);
  assert.equal(descriptor.documentType, "pdf");
  assert.equal(descriptor.sourcePage, 18);
  assert.equal(descriptor.sourceFingerprint, "pdf-fingerprint");
  await harness.openEvidenceAtSource(evidence, collection);
  assert.deepEqual(JSON.parse(JSON.stringify(calls.shift())), {
    kind: "pdf",
    page: 18,
    options: {
      expectedSourceUrl: "https://example.test/chapter.pdf",
      sourceTabId: null,
      expectedFingerprint: "pdf-fingerprint",
      quote: "Congestion control reduces the sending window after packet loss."
    }
  });

  await harness.openEvidenceAtSource({
    sourceRef: { sourceType: "webpage", url: "https://example.test/article", quote: "Exact article sentence." }
  }, {});
  assert.equal(calls.shift().kind, "webpage");

  await harness.openEvidenceAtSource({
    sourceRef: { sourceType: "video", url: "https://video.test/watch", startMs: 65000 }
  }, {});
  assert.equal(calls.shift().kind, "video");
});

test("new and existing webpage tabs complete the highlight action", async () => {
  const highlightSourceText = vm.runInNewContext(
    `(${sourceBetween("async function highlightSourceText(", "function markQuizAnswers()")})`,
    {
      setTimeout,
      normalizeSafeExternalUrl: (value) => String(value || ""),
      buildSourceHighlightUrl: (url, quote) => `${url}#:~:text=${encodeURIComponent(quote)}`,
      persistCurrentSessionDraft: async () => {},
      showStatus: () => {},
      hasChromeTabs: () => true,
      samePageUrl: (first, second) => first === second,
      getActiveTab: async () => null,
      chrome: {
        tabs: {
          create: async (options) => ({ id: 9, ...options }),
          get: async () => null,
          query: async () => []
        },
        scripting: { executeScript: async () => [{ result: true }] }
      }
    }
  );
  const created = await highlightSourceText(
    "The supporting sentence appears in the original lesson.",
    { announce: false, expectedSourceUrl: "https://example.test/lesson" }
  );
  assert.equal(created.found, true);
  assert.match(created.message, /highlighted the supporting sentence/i);

  const updates = [];
  const existingTabHighlighter = vm.runInNewContext(
    `(${sourceBetween("async function highlightSourceText(", "function markQuizAnswers()")})`,
    {
      setTimeout,
      normalizeSafeExternalUrl: (value) => String(value || ""),
      buildSourceHighlightUrl: (url, quote) => `${url}#:~:text=${encodeURIComponent(quote)}`,
      persistCurrentSessionDraft: async () => {},
      showStatus: () => {},
      hasChromeTabs: () => true,
      samePageUrl: (first, second) => first === second,
      getActiveTab: async () => ({ id: 7, url: "https://example.test/lesson" }),
      chrome: {
        tabs: {
          update: async (id, options) => {
            updates.push({ id, options });
            return { id, url: "https://example.test/lesson", ...options };
          },
          create: async () => null,
          get: async () => null,
          query: async () => []
        },
        scripting: { executeScript: async () => [{ result: true }] }
      }
    }
  );
  const existing = await existingTabHighlighter(
    "The supporting sentence appears in the original lesson.",
    { announce: false, expectedSourceUrl: "https://example.test/lesson" }
  );
  assert.equal(existing.found, true);
  assert.match(existing.message, /matching sentence in yellow/i);
  assert.equal(updates.length, 0);
});

test("cheat-sheet and review actions share the evidence dispatcher", () => {
  const cheatSheet = sourceBetween("function renderCheatSheetEvidence", "function renderQuizVisual");
  const score = sourceBetween("function renderScore", "function getWeakestConceptFromSession");
  const highlighter = sourceBetween("async function highlightSourceText", "function markQuizAnswers");
  assert.match(cheatSheet, /openEvidenceAtSource/);
  assert.match(cheatSheet, /Open and highlight source/);
  assert.match(score, /openEvidenceAtSource/);
  assert.match(highlighter, /CSS\.highlights\.set\("exam-cram-evidence"/);
  assert.match(highlighter, /window\.find\(candidate/);
});
