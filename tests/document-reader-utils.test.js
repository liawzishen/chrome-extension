const test = require("node:test");
const assert = require("node:assert/strict");
const { PDFDocument, StandardFonts } = require("pdf-lib");
const Reader = require("../document-reader-utils");

function installPromiseWithResolvers() {
  if (typeof Promise.withResolvers === "function") return;
  Promise.withResolvers = function withResolvers() {
    let resolve;
    let reject;
    const promise = new Promise((resolvePromise, rejectPromise) => {
      resolve = resolvePromise;
      reject = rejectPromise;
    });
    return { promise, resolve, reject };
  };
}

test("recovers remote and local source URLs from Chrome's PDF viewer", () => {
  const remote = "https://learning.example/course/chapter.pdf?download=1";
  const viewer = `chrome-extension://${Reader.PDF_VIEWER_EXTENSION_ID}/index.html?file=${encodeURIComponent(remote)}#page=4`;
  assert.equal(Reader.classifyTabDocument(viewer).kind, "pdf");
  assert.equal(Reader.recoverDocumentSourceUrl(viewer), remote);
  assert.equal(Reader.getPermissionOrigin(remote), "https://learning.example/*");
  assert.equal(Reader.getPermissionOrigin("file:///C:/Study/chapter.pdf"), "file:///*");
});

test("returns explicit errors when a PDF viewer hides its source", () => {
  assert.throws(
    () => Reader.recoverDocumentSourceUrl(`chrome-extension://${Reader.PDF_VIEWER_EXTENSION_ID}/index.html`),
    (error) => error.code === "PDF_SOURCE_URL_UNAVAILABLE" && /Open HTML or PDF file/.test(error.message)
  );
  assert.match(Reader.FILE_ACCESS_GUIDANCE, /chrome:\/\/extensions > NeatMind > Allow access to file URLs/);
});

test("never treats binary PDF or arbitrary binary data as HTML", () => {
  const pdf = new TextEncoder().encode("%PDF-1.7\n1 0 obj\n");
  assert.equal(Reader.classifyFetchedDocument({ bytes: pdf, contentType: "application/pdf" }), "pdf");
  assert.throws(
    () => Reader.classifyFetchedDocument({ bytes: pdf, contentType: "text/html" }),
    (error) => error.code === "PDF_CONTENT_TYPE_MISMATCH"
  );
  assert.throws(
    () => Reader.classifyFetchedDocument({ bytes: new Uint8Array([0, 1, 2, 3]), expectedKind: "html" }),
    (error) => error.code === "UNSUPPORTED_DOCUMENT"
  );
});

test("extracts bounded page-anchored text from a genuine PDF with unsafe eval disabled", async () => {
  installPromiseWithResolvers();
  const document = await PDFDocument.create();
  const font = await document.embedFont(StandardFonts.Helvetica);
  const page = document.addPage();
  page.drawText("Cell membranes control movement between the cell and its environment.", { x: 40, y: 720, size: 11, font });
  page.drawText("Diffusion moves particles down a concentration gradient without direct energy.", { x: 40, y: 700, size: 11, font });
  page.drawText("Active transport uses membrane proteins and cellular energy to move substances.", { x: 40, y: 680, size: 11, font });
  page.drawText("Osmosis describes water movement across a selectively permeable membrane.", { x: 40, y: 660, size: 11, font });
  const bytes = new Uint8Array(await document.save());
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const result = await Reader.extractPdfText(bytes, pdfjs, { timeoutMs: 5000 });
  assert.equal(result.pageCount, 1);
  assert.match(result.text, /^Page 1\n/);
  assert.match(result.text, /selectively permeable membrane/);
  assert.ok(result.text.length <= Reader.MAX_EXTRACTED_TEXT);
  assert.equal(Reader.assessReadableContent(result.text, "pdf").readable, true);
});

test("distinguishes password-protected, scanned, and malformed PDFs with PDF-specific errors", async () => {
  const bytes = new TextEncoder().encode("%PDF-1.7\n");
  const encryptedTask = {
    promise: new Promise(() => {}),
    destroy: async () => {}
  };
  setTimeout(() => encryptedTask.onPassword?.(() => {}, 1), 0);
  await assert.rejects(
    Reader.extractPdfText(bytes, { getDocument: () => encryptedTask }, { timeoutMs: 2000 }),
    (error) => error.code === "PDF_ENCRYPTED" && /password-protected/.test(error.message) && !/HTML page/.test(error.message)
  );

  const scannedDocument = {
    numPages: 1,
    getPage: async () => ({ getTextContent: async () => ({ items: [] }), cleanup() {} }),
    getMetadata: async () => null
  };
  await assert.rejects(
    Reader.extractPdfText(bytes, {
      getDocument: () => ({ promise: Promise.resolve(scannedDocument), destroy: async () => {} })
    }, { timeoutMs: 2000 }),
    (error) => error.code === "PDF_NO_TEXT" && /scanned document/.test(error.message) && !/HTML page/.test(error.message)
  );

  const malformed = new Error("Invalid PDF structure: missing xref table");
  malformed.name = "InvalidPDFException";
  await assert.rejects(
    Reader.extractPdfText(bytes, {
      getDocument: () => ({ promise: Promise.reject(malformed), destroy: async () => {} })
    }, { timeoutMs: 2000 }),
    (error) => error.code === "PDF_MALFORMED" && /malformed or corrupted/.test(error.message) && !/HTML page/.test(error.message)
  );
});

test("enforces PDF page and byte limits before unbounded extraction", async () => {
  const bytes = new TextEncoder().encode("%PDF-1.7\n");
  const tooManyPages = {
    numPages: Reader.MAX_PDF_PAGES + 1,
    getMetadata: async () => null
  };
  await assert.rejects(
    Reader.extractPdfText(bytes, {
      getDocument: () => ({ promise: Promise.resolve(tooManyPages), destroy: async () => {} })
    }),
    (error) => error.code === "PDF_TOO_MANY_PAGES"
  );
  const oversized = new Uint8Array(Reader.MAX_PDF_BYTES + 1);
  oversized.set(new TextEncoder().encode("%PDF-"));
  await assert.rejects(
    Reader.extractPdfText(oversized, { getDocument() {} }),
    (error) => error.code === "PDF_TOO_LARGE"
  );
});

test("multilingual structured HTML passes the readable-content gate without a 300-character rule", () => {
  const cjk = [
    "细胞膜具有选择透过性，能够控制物质进入和离开细胞。",
    "扩散使粒子沿浓度梯度移动，不需要细胞直接提供能量。",
    "主动运输需要能量，并且能够逆着浓度梯度移动物质。",
    "渗透描述水分子通过选择透过膜移动的过程。"
  ].join("\n");
  assert.ok(cjk.length < 300);
  assert.equal(Reader.assessReadableContent(cjk, "html").readable, true);
  assert.throws(
    () => Reader.assertReadableContent("Home Settings Account Help", "html"),
    (error) => error.code === "HTML_INSUFFICIENT_TEXT"
  );
  assert.throws(
    () => Reader.assertReadableContent("Page 1\nShort selectable text", "pdf"),
    (error) => error.code === "PDF_INSUFFICIENT_TEXT" && /This PDF/.test(error.message)
  );
});

test("merges main-frame, child-frame, and shadow-derived chunks with stable bounds", () => {
  const childText = "Passive transport moves substances down a concentration gradient without direct cellular energy.";
  const merged = Reader.mergeFrameSnapshots([
    { frameId: 8, result: { title: "Child", url: "https://app.example/frame", chunks: [childText, "Active transport uses membrane proteins and energy to move selected substances against a concentration gradient."] } },
    { frameId: 0, result: { title: "App lesson", url: "https://app.example/lesson", chunks: ["Interactive lesson workspace", "细胞膜具有选择透过性，能够控制物质进入和离开细胞，从而维持稳定的内部环境。"] } },
    { frameId: 9, result: { title: "Duplicate", url: "https://app.example/frame-2", chunks: [childText] } }
  ]);
  assert.equal(merged.title, "App lesson");
  assert.equal(merged.url, "https://app.example/lesson");
  assert.equal(merged.frameCount, 3);
  assert.equal(merged.text.match(/Passive transport/g)?.length, 1);
  assert.ok(merged.text.length <= Reader.MAX_EXTRACTED_TEXT);
  assert.equal(Reader.assessReadableContent(merged.text, "html").readable, true);
});

test("drops Wikipedia-style navigation and fundraising chrome before local study generation", () => {
  const article = "Photosynthesis converts light energy into chemical energy stored in glucose inside chloroplasts.";
  const boilerplate = [
    "Jump to content",
    "From Wikipedia, the free encyclopedia",
    "Wiki Loves Earth: Upload photos to help win exciting prizes!",
    "Home · About · Help · Contact"
  ];

  for (const line of boilerplate) assert.equal(Reader.isExtractedBoilerplate(line), true, line);
  assert.equal(Reader.isExtractedBoilerplate(article), false);

  const merged = Reader.mergeFrameSnapshots([{
    frameId: 0,
    result: { title: "Photosynthesis", url: "https://example.test/wiki", chunks: [...boilerplate, article] }
  }]);
  assert.match(merged.text, /Photosynthesis converts light energy/i);
  assert.doesNotMatch(merged.text, /Jump to content|From Wikipedia|Wiki Loves Earth|Upload photos|Home .* Help/i);
});

test("adversarial PDF text items stop at the output budget instead of building an unbounded line", async () => {
  const bytes = new TextEncoder().encode("%PDF-1.7\n");
  let yielded = 0;
  const hugeRawItem = "A membrane transport explanation ".repeat(10000);
  const items = {
    *[Symbol.iterator]() {
      while (yielded < Reader.MAX_PDF_TEXT_ITEMS) {
        yielded += 1;
        yield { str: hugeRawItem, hasEOL: false };
      }
    }
  };
  const document = {
    numPages: 1,
    getPage: async () => ({ getTextContent: async () => ({ items }), cleanup() {} }),
    getMetadata: async () => null
  };
  const result = await Reader.extractPdfText(bytes, {
    getDocument: () => ({ promise: Promise.resolve(document), destroy: async () => {} })
  }, { timeoutMs: 3000 });
  assert.ok(result.text.length <= Reader.MAX_EXTRACTED_TEXT);
  assert.ok(yielded < 20, `expected early item cutoff, received ${yielded}`);
});

test("detects ordered PDF chapters from bookmarks, headings, and a whole-document fallback", () => {
  const pageTexts = [
    "Chapter 1\nCell structure and membranes introduce the course.",
    "Cells exchange matter with their environment.",
    "Chapter 2: Energy Transfer\nATP couples reactions inside cells.",
    "Enzymes reduce activation energy."
  ];
  const bookmarked = Reader.detectPdfChapters({
    title: "Biology handbook",
    pageTexts,
    pageCount: 4,
    outline: [
      { title: "Chapter 1", pageNumber: 1, method: "bookmark" },
      { title: "Chapter 2: Energy Transfer", pageNumber: 3, method: "bookmark" }
    ]
  });

  assert.deepEqual(bookmarked.map(({ title, pageStart, pageEnd, detectionMethod }) => ({
    title, pageStart, pageEnd, detectionMethod
  })), [
    { title: "Chapter 1", pageStart: 1, pageEnd: 2, detectionMethod: "bookmark" },
    { title: "Chapter 2: Energy Transfer", pageStart: 3, pageEnd: 4, detectionMethod: "bookmark" }
  ]);
  assert.match(bookmarked[1].text, /^Page 3\n/);
  assert.doesNotMatch(bookmarked[1].text, /Cell structure/);

  const detectedFromHeadings = Reader.detectPdfChapters({ title: "Biology", pageTexts, pageCount: 4 });
  assert.equal(detectedFromHeadings.length, 2);
  assert.equal(detectedFromHeadings[0].title, "Chapter 1");
  assert.equal(detectedFromHeadings[1].pageStart, 3);

  const fallback = Reader.detectPdfChapters({
    title: "Chapter 1",
    pageTexts: ["A complete document with readable course material."],
    pageCount: 1
  });
  assert.deepEqual(fallback.map(({ title, pageStart, pageEnd, detectionMethod }) => ({
    title, pageStart, pageEnd, detectionMethod
  })), [{ title: "Chapter 1", pageStart: 1, pageEnd: 1, detectionMethod: "whole-document" }]);
});
