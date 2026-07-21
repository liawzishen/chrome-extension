(function initNeatMindDocumentReader(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.NeatMindDocumentReader = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createDocumentReaderApi() {
  "use strict";

  const MAX_PDF_BYTES = 24 * 1024 * 1024;
  const MAX_HTML_BYTES = 5 * 1024 * 1024;
  const MAX_PDF_PAGES = 200;
  const MAX_EXTRACTED_TEXT = 42000;
  const MAX_HTML_NODES = 2500;
  const MAX_HTML_CHUNKS = 400;
  const MAX_PDF_TEXT_ITEMS = 100000;
  const MAX_PDF_PAGE_TEXT = 6000;
  const MAX_PDF_CHAPTERS = 40;
  const DOCUMENT_PARSE_TIMEOUT_MS = 20000;
  const MAX_FRAME_RESULTS = 32;
  const PDF_VIEWER_EXTENSION_ID = "mhjfbmdgcfjbbpaeojofohoefgiehjai";
  const FILE_ACCESS_GUIDANCE = "Open chrome://extensions > NeatMind > Allow access to file URLs, enable it, then reload the page.";

  class DocumentReaderError extends Error {
    constructor(code, message, details = {}) {
      super(message);
      this.name = "DocumentReaderError";
      this.code = code;
      this.details = details;
    }
  }

  function cleanUrl(value) {
    try {
      const url = new URL(String(value || ""));
      url.hash = "";
      return url;
    } catch {
      return null;
    }
  }

  function isChromePdfViewerUrl(url) {
    return url?.protocol === "chrome-extension:"
      && url.hostname === PDF_VIEWER_EXTENSION_ID
      && /(?:^|\/)index\.html$/i.test(url.pathname);
  }

  function recoverDocumentSourceUrl(tabUrl) {
    const tab = cleanUrl(tabUrl);
    if (!tab) {
      throw new DocumentReaderError("UNSUPPORTED_DOCUMENT_URL", "This document does not have a readable URL.");
    }
    if (["http:", "https:", "file:"].includes(tab.protocol)) return tab.href;
    if (isChromePdfViewerUrl(tab)) {
      const candidate = cleanUrl(tab.searchParams.get("file"));
      if (candidate && ["http:", "https:", "file:"].includes(candidate.protocol)) return candidate.href;
      throw new DocumentReaderError(
        "PDF_SOURCE_URL_UNAVAILABLE",
        "This PDF viewer does not expose the original document URL. Open the PDF in its own tab or download it and use Open HTML or PDF file."
      );
    }
    throw new DocumentReaderError(
      "UNSUPPORTED_DOCUMENT_URL",
      "NeatMind can read HTML pages and PDF documents opened from http, https, or an allowed local file."
    );
  }

  function isPdfUrl(value) {
    const original = cleanUrl(value);
    if (isChromePdfViewerUrl(original)) return true;
    let source;
    try {
      source = cleanUrl(recoverDocumentSourceUrl(value));
    } catch {
      return false;
    }
    return Boolean(source && /\.pdf$/i.test(decodeURIComponent(source.pathname)));
  }

  function classifyTabDocument(tabUrl) {
    const url = recoverDocumentSourceUrl(tabUrl);
    return {
      kind: isPdfUrl(tabUrl) || isPdfUrl(url) ? "pdf" : "html",
      url,
      local: cleanUrl(url)?.protocol === "file:"
    };
  }

  function getPermissionOrigin(value) {
    const url = cleanUrl(value);
    if (!url) return "";
    if (url.protocol === "file:") return "file:///*";
    if (["http:", "https:"].includes(url.protocol)) return `${url.origin}/*`;
    return "";
  }

  function bytesToAscii(bytes, limit = 1024) {
    return Array.from(bytes.slice(0, limit), (byte) => String.fromCharCode(byte)).join("");
  }

  function hasPdfSignature(bytes) {
    return bytes instanceof Uint8Array && bytesToAscii(bytes, 1024).includes("%PDF-");
  }

  function looksLikeBinary(bytes) {
    if (!(bytes instanceof Uint8Array)) return false;
    const sample = bytes.slice(0, 2048);
    let controls = 0;
    for (const byte of sample) {
      if (byte === 0) return true;
      if (byte < 9 || (byte > 13 && byte < 32)) controls += 1;
    }
    return sample.length > 0 && controls / sample.length > 0.04;
  }

  function classifyFetchedDocument({ bytes, contentType = "", url = "", expectedKind = "" }) {
    if (!(bytes instanceof Uint8Array)) {
      throw new DocumentReaderError("INVALID_DOCUMENT_BYTES", "The document response could not be read safely.");
    }
    const normalizedType = String(contentType || "").split(";", 1)[0].trim().toLowerCase();
    if (hasPdfSignature(bytes)) {
      if (["text/html", "application/xhtml+xml", "application/json", "text/plain"].includes(normalizedType)) {
        throw new DocumentReaderError("PDF_CONTENT_TYPE_MISMATCH", "The server returned PDF bytes with an unsafe or conflicting Content-Type.");
      }
      return "pdf";
    }
    if (normalizedType === "application/pdf" || expectedKind === "pdf" || isPdfUrl(url)) {
      throw new DocumentReaderError("INVALID_PDF", "The response was labelled as a PDF, but it is not a valid PDF document.");
    }
    const htmlType = ["text/html", "application/xhtml+xml"].includes(normalizedType);
    const prefix = bytesToAscii(bytes, 512).replace(/^\uFEFF/, "").trimStart().toLowerCase();
    const htmlMarkup = /^(?:<!doctype\s+html|<html\b|<head\b|<body\b)/.test(prefix);
    if ((htmlType || htmlMarkup || expectedKind === "html") && !looksLikeBinary(bytes)) return "html";
    throw new DocumentReaderError("UNSUPPORTED_DOCUMENT", "NeatMind can read HTML pages and PDF documents only.");
  }

  function normalizeExtractedText(value, maxLength = MAX_EXTRACTED_TEXT) {
    const boundedInput = String(value || "").slice(0, Math.max(maxLength, Math.min(maxLength * 2, MAX_EXTRACTED_TEXT * 2)));
    return boundedInput
      .replace(/\u0000/g, "")
      .replace(/[\t\f\v]+/g, " ")
      .replace(/[ ]{2,}/g, " ")
      .replace(/\s*\n\s*/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
      .slice(0, maxLength);
  }

  function isExtractedBoilerplate(value) {
    const text = normalizeExtractedText(value, 1000)
      .toLocaleLowerCase()
      .replace(/\s+/g, " ")
      .trim();
    if (!text) return true;
    return /^(?:skip|jump) to (?:main )?content\.?$/i.test(text)
      || /^from wikipedia,? the free encyclopedia\.?$/i.test(text)
      || /(?:wiki loves earth|upload photos(?: to help)? .*win (?:exciting )?prizes|fundraising banner|donate now)/i.test(text)
      || /^(?:navigation|contents|main menu|site notice|privacy policy|terms of use)$/i.test(text)
      || (/^(?:home|about|help|contact|log ?in|sign ?in)(?:\s*[|\u00b7\u203a>]\s*(?:home|about|help|contact|log ?in|sign ?in))+$/i.test(text));
  }

  function assessReadableContent(value, documentType = "html") {
    const text = normalizeExtractedText(value);
    const meaningful = text.match(/[\p{L}\p{N}]/gu) || [];
    const cjk = text.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu) || [];
    const lexicalUnits = text.match(/[\p{L}\p{N}][\p{L}\p{N}\p{M}'’\-]*/gu) || [];
    const uniqueUnits = new Set(lexicalUnits.slice(0, 5000).map((unit) => unit.toLocaleLowerCase())).size;
    const uniqueCjk = new Set(cjk.slice(0, 5000)).size;
    const structuredLines = text.split(/\n+/).filter((line) => (line.match(/[\p{L}\p{N}]/gu) || []).length >= 8).length;
    const punctuationBreaks = (text.match(/[.!?。！？；:]/gu) || []).length;
    const readable = (
      meaningful.length >= 120 && (uniqueUnits >= 14 || punctuationBreaks >= 3)
    ) || (
      meaningful.length >= 80 && structuredLines >= 3 && uniqueUnits >= 10
    ) || (
      cjk.length >= 48 && uniqueCjk >= 20
    );
    const type = documentType === "pdf" ? "pdf" : "html";
    return {
      readable,
      documentType: type,
      message: readable
        ? ""
        : type === "pdf"
          ? "This PDF contains selectable text, but not enough distinct readable content for a visual note. If it is scanned, use an OCR copy."
          : "This HTML page does not contain enough distinct readable content for a visual note.",
      stats: {
        textLength: text.length,
        meaningfulCharacters: meaningful.length,
        cjkCharacters: cjk.length,
        uniqueUnits,
        uniqueCjk,
        structuredLines,
        punctuationBreaks
      }
    };
  }

  function assertReadableContent(value, documentType = "html") {
    const assessment = assessReadableContent(value, documentType);
    if (!assessment.readable) {
      throw new DocumentReaderError(
        assessment.documentType === "pdf" ? "PDF_INSUFFICIENT_TEXT" : "HTML_INSUFFICIENT_TEXT",
        assessment.message,
        assessment.stats
      );
    }
    return assessment;
  }

  function mergeFrameSnapshots(frameResults, options = {}) {
    const normalized = (Array.isArray(frameResults) ? frameResults : [])
      .slice(0, MAX_FRAME_RESULTS * 4)
      .map((entry) => {
        const result = entry?.result || entry || {};
        const candidates = Array.isArray(result.chunks)
          ? result.chunks.slice(0, MAX_HTML_CHUNKS)
          : normalizeExtractedText(result.text).split(/\n+/).slice(0, MAX_HTML_CHUNKS);
        const chunks = [];
        let frameCharacters = 0;
        for (const candidate of candidates) {
          if (frameCharacters >= 16000) break;
          const chunk = normalizeExtractedText(String(candidate || "").slice(0, 6000), Math.min(6000, 16000 - frameCharacters));
          if (!chunk || isExtractedBoilerplate(chunk)) continue;
          chunks.push(chunk);
          frameCharacters += chunk.length + 1;
        }
        return {
          frameId: Number.isInteger(entry?.frameId) ? entry.frameId : Number(result.frameId) || 0,
          title: normalizeExtractedText(result.title, 180),
          url: String(result.url || "").slice(0, 2000),
          chunks: chunks.slice(0, MAX_HTML_CHUNKS),
          textLength: frameCharacters
        };
      })
      .filter((snapshot) => snapshot.chunks.length)
      .sort((first, second) => {
        if (first.frameId === 0 && second.frameId !== 0) return -1;
        if (second.frameId === 0 && first.frameId !== 0) return 1;
        return second.textLength - first.textLength;
      })
      .slice(0, MAX_FRAME_RESULTS);

    const seen = new Set();
    const output = [];
    let characters = 0;
    for (const snapshot of normalized) {
      for (const chunk of snapshot.chunks) {
        if (characters >= MAX_EXTRACTED_TEXT || output.length >= MAX_HTML_CHUNKS) break;
        const key = chunk.toLocaleLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        const bounded = chunk.slice(0, MAX_EXTRACTED_TEXT - characters);
        output.push(bounded);
        characters += bounded.length + 1;
      }
    }
    const main = normalized.find((snapshot) => snapshot.frameId === 0) || normalized[0] || {};
    return {
      title: normalizeExtractedText(options.title || main.title || "HTML document", 180),
      url: String(options.url || main.url || "").slice(0, 2000),
      text: normalizeExtractedText(output.join("\n")),
      chunks: output,
      frameCount: normalized.length,
      documentType: "html"
    };
  }

  function extractHtmlText(html, fallbackTitle = "HTML document") {
    if (typeof DOMParser !== "function") {
      throw new DocumentReaderError("HTML_PARSER_UNAVAILABLE", "The HTML document reader is unavailable. Reload NeatMind and try again.");
    }
    const document = new DOMParser().parseFromString(String(html || ""), "text/html");
    const blockedSelector = [
      "script", "style", "noscript", "svg", "canvas", "iframe", "nav", "header", "footer", "aside", "form",
      "button", "input", "textarea", "select", "[role='navigation']", "[role='banner']", "[role='contentinfo']",
      "[aria-hidden='true']", "[hidden]", "[inert]", ".MathJax_Preview", ".MathJax", ".MJX_Assistive_MathML", "mjx-assistive-mml",
      ".katex-mathml", "annotation", "semantics annotation", ".mw-jump-link", ".mw-indicators", ".mw-footer", ".siteNotice",
      "#siteNotice", ".mw-dismissable-notice", ".ambox", ".notice", ".banner", ".fundraising", ".donate-banner"
    ].join(",");

    const source = document.querySelector("#mw-content-text .mw-parser-output,.mw-parser-output,article,main,[role='main'],.post-content,.entry-content,.article-content,.content,#content") || document.body;
    const chunks = [];
    const seen = new Set();
    let outputCharacters = 0;
    const add = (value, prefix = "") => {
      if (chunks.length >= MAX_HTML_CHUNKS || outputCharacters >= MAX_EXTRACTED_TEXT) return;
      const text = normalizeExtractedText(String(value || "").slice(0, 6000), 4000).replace(/\n+/g, " ");
      if (text.length < 20 || isExtractedBoilerplate(text)) return;
      const key = text.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      const remaining = Math.max(0, MAX_EXTRACTED_TEXT - outputCharacters);
      const chunk = `${prefix}${text}`.slice(0, remaining);
      chunks.push(chunk);
      outputCharacters += chunk.length + 1;
    };
    const studySelector = "h1,h2,h3,h4,p,li,dt,dd,blockquote,figcaption,td,th,pre";
    const deadline = Date.now() + 150;
    let inspectedNodes = 0;
    const stopTraversal = {};
    try {
      const walker = document.createTreeWalker(source, 1, {
        acceptNode(node) {
          inspectedNodes += 1;
          if (inspectedNodes > MAX_HTML_NODES || Date.now() > deadline) throw stopTraversal;
          if (node.matches?.(blockedSelector)) return 2;
          return node.matches?.(studySelector) || node.childElementCount === 0 ? 1 : 3;
        }
      });
      let node;
      while ((node = walker.nextNode())) {
        const tag = node.tagName.toLowerCase();
        add(node.textContent, /^h[1-4]$/.test(tag) ? "\n" : tag === "li" ? "- " : "");
        if (chunks.length >= MAX_HTML_CHUNKS || outputCharacters >= MAX_EXTRACTED_TEXT) break;
      }
    } catch (error) {
      if (error !== stopTraversal) throw error;
    }
    return {
      title: normalizeExtractedText(document.querySelector("title")?.textContent || document.querySelector("h1")?.textContent || fallbackTitle, 180),
      text: normalizeExtractedText(chunks.join("\n"))
    };
  }

  function decodeHtmlBytes(bytes) {
    if (!(bytes instanceof Uint8Array) || bytes.byteLength > MAX_HTML_BYTES) {
      throw new DocumentReaderError("HTML_TOO_LARGE", "This HTML document is larger than the 5 MB reading limit.");
    }
    if (hasPdfSignature(bytes) || looksLikeBinary(bytes)) {
      throw new DocumentReaderError("BINARY_HTML_REJECTED", "This file contains binary data and cannot be treated as HTML.");
    }
    return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  }

  function cleanPdfChapterTitle(value, fallback = "") {
    const title = normalizeExtractedText(value, 140)
      .replace(/\.{2,}\s*\d+\s*$/g, "")
      .replace(/^(?:chapter|unit|part|section)\s+(\d+|[ivxlcdm]+)\s*[:.\-\u2013\u2014]?\s*/i, (_match, number) => `Chapter ${number}: `)
      .replace(/:\s*$/g, "")
      .replace(/\s+/g, " ")
      .trim();
    return title || fallback;
  }

  function getPdfHeadingCandidate(line) {
    const text = normalizeExtractedText(line, 180).replace(/\s+/g, " ").trim();
    if (!text || text.length > 140 || /^(?:page\s+)?\d+(?:\s+of\s+\d+)?$/i.test(text)) return null;
    const explicit = text.match(/^(chapter|unit|part|section)\s+(\d+|[ivxlcdm]+)(?:\s*[:.\-\u2013\u2014]\s*|\s+)?(.{0,110})$/i);
    if (explicit) {
      const suffix = cleanPdfChapterTitle(explicit[3]);
      return cleanPdfChapterTitle(`${explicit[1]} ${explicit[2]}${suffix ? `: ${suffix}` : ""}`);
    }
    const numbered = text.match(/^(\d{1,2})(?:\.(?!\d)|\s*[:\u2013\u2014\-])\s*([A-Z][^.!?]{3,100})$/);
    if (numbered) return cleanPdfChapterTitle(`${numbered[1]}. ${numbered[2]}`);
    return null;
  }

  function findPdfContentsCandidates(pageTexts, pageCount) {
    const candidates = [];
    const scanLimit = Math.min(Array.isArray(pageTexts) ? pageTexts.length : 0, 12);
    for (let pageIndex = 0; pageIndex < scanLimit; pageIndex += 1) {
      const lines = String(pageTexts[pageIndex] || "").split(/\n+/).map((line) => line.trim()).filter(Boolean);
      if (!lines.some((line) => /^(?:table of )?contents$/i.test(line))) continue;
      lines.forEach((line) => {
        const match = line.match(/^((?:chapter|unit|part|section)\s+(?:\d+|[ivxlcdm]+)(?:\s*[:.\-\u2013\u2014]?\s*[^.]{0,100})?)\s*(?:\.{2,}|\s{2,}|\s\u2026\s)\s*(\d{1,4})\s*$/i);
        if (!match) return;
        const pageNumber = Math.round(Number(match[2]));
        if (pageNumber < 1 || pageNumber > pageCount) return;
        candidates.push({ title: cleanPdfChapterTitle(match[1]), pageNumber, method: "contents" });
      });
    }
    return candidates;
  }

  function findPdfHeadingCandidates(pageTexts) {
    const raw = [];
    (Array.isArray(pageTexts) ? pageTexts : []).forEach((pageText, pageIndex) => {
      const lines = String(pageText || "").split(/\n+/).map((line) => line.trim()).filter(Boolean).slice(0, 12);
      lines.forEach((line) => {
        const title = getPdfHeadingCandidate(line);
        if (title) raw.push({ title, pageNumber: pageIndex + 1, method: "heading" });
      });
    });
    const counts = new Map();
    raw.forEach((entry) => {
      const key = entry.title.toLocaleLowerCase();
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return raw.filter((entry) => (counts.get(entry.title.toLocaleLowerCase()) || 0) <= 2);
  }

  function normalizePdfChapterCandidates(candidates, pageCount) {
    const seenPages = new Set();
    const output = [];
    (Array.isArray(candidates) ? candidates : [])
      .filter((entry) => entry && Number.isInteger(Number(entry.pageNumber)))
      .sort((first, second) => Number(first.pageNumber) - Number(second.pageNumber))
      .forEach((entry) => {
        const pageNumber = Math.max(1, Math.min(pageCount, Math.round(Number(entry.pageNumber))));
        const title = cleanPdfChapterTitle(entry.title);
        if (!title || seenPages.has(pageNumber)) return;
        seenPages.add(pageNumber);
        output.push({ title, pageNumber, method: entry.method || "heading" });
      });
    return output.slice(0, MAX_PDF_CHAPTERS);
  }

  function buildPdfChapterText(pageTexts, pageStart, pageEnd, maxLength = 14000) {
    const blocks = [];
    let length = 0;
    for (let pageNumber = pageStart; pageNumber <= pageEnd; pageNumber += 1) {
      const pageText = normalizeExtractedText(pageTexts?.[pageNumber - 1], MAX_PDF_PAGE_TEXT);
      if (!pageText) continue;
      const prefix = `Page ${pageNumber}\n`;
      const remaining = Math.max(0, maxLength - length);
      if (remaining <= prefix.length) break;
      const block = `${prefix}${pageText}`.slice(0, remaining);
      blocks.push(block);
      length += block.length + 2;
      if (length >= maxLength) break;
    }
    return normalizeExtractedText(blocks.join("\n\n"), maxLength);
  }

  function detectPdfChapters({ title = "PDF document", pageTexts = [], outline = [], pageCount = 0 } = {}) {
    const totalPages = Math.max(1, Math.round(Number(pageCount) || pageTexts.length || 1));
    const outlineCandidates = normalizePdfChapterCandidates(outline, totalPages);
    const contentsCandidates = normalizePdfChapterCandidates(findPdfContentsCandidates(pageTexts, totalPages), totalPages);
    const headingCandidates = normalizePdfChapterCandidates(findPdfHeadingCandidates(pageTexts), totalPages);
    let candidates = outlineCandidates.length >= 2
      ? outlineCandidates
      : contentsCandidates.length >= 2
        ? contentsCandidates
        : headingCandidates.length >= 2
          ? headingCandidates
          : [];

    if (!candidates.length) {
      return [{
        title: cleanPdfChapterTitle(title, "Complete document"),
        order: 1,
        pageStart: 1,
        pageEnd: totalPages,
        detectionMethod: "whole-document",
        status: "ready",
        text: buildPdfChapterText(pageTexts, 1, totalPages)
      }];
    }

    if (candidates[0].pageNumber > 1) {
      candidates = [{ title: "Introduction", pageNumber: 1, method: candidates[0].method }, ...candidates];
    } else {
      candidates[0] = { ...candidates[0], pageNumber: 1 };
    }
    const titleCounts = new Map();
    return candidates.slice(0, MAX_PDF_CHAPTERS).map((candidate, index, list) => {
      const baseTitle = cleanPdfChapterTitle(candidate.title, `Chapter ${index + 1}`);
      const key = baseTitle.toLocaleLowerCase();
      const count = (titleCounts.get(key) || 0) + 1;
      titleCounts.set(key, count);
      const pageStart = candidate.pageNumber;
      const pageEnd = Math.max(pageStart, (list[index + 1]?.pageNumber || totalPages + 1) - 1);
      return {
        title: count === 1 ? baseTitle : `${baseTitle} (${count})`,
        order: index + 1,
        pageStart,
        pageEnd,
        detectionMethod: candidate.method,
        status: "ready",
        text: buildPdfChapterText(pageTexts, pageStart, pageEnd)
      };
    });
  }

  async function extractPdfOutline(pdf, timeoutFailure) {
    if (typeof pdf?.getOutline !== "function") return [];
    const outline = await Promise.race([pdf.getOutline(), timeoutFailure]).catch(() => []);
    const flattened = [];
    const visit = (items, depth = 0) => {
      (Array.isArray(items) ? items : []).slice(0, MAX_PDF_CHAPTERS * 4).forEach((item) => {
        if (flattened.length >= MAX_PDF_CHAPTERS * 4) return;
        flattened.push({ title: item?.title, destination: item?.dest, depth });
        visit(item?.items, depth + 1);
      });
    };
    visit(outline);
    const resolved = [];
    for (const entry of flattened) {
      try {
        const destination = typeof entry.destination === "string"
          ? await Promise.race([pdf.getDestination(entry.destination), timeoutFailure])
          : entry.destination;
        const reference = Array.isArray(destination) ? destination[0] : null;
        if (!reference || typeof pdf.getPageIndex !== "function") continue;
        const pageIndex = await Promise.race([pdf.getPageIndex(reference), timeoutFailure]);
        resolved.push({
          title: cleanPdfChapterTitle(entry.title),
          pageNumber: Math.max(1, Math.round(Number(pageIndex) || 0) + 1),
          depth: entry.depth,
          method: "bookmark"
        });
      } catch {
        // A malformed bookmark must not prevent the remaining PDF from importing.
      }
    }
    const chapterLike = resolved.filter((entry) => /^(?:chapter|unit|part|section)\b/i.test(entry.title));
    if (chapterLike.length >= 2) return chapterLike;
    if (!resolved.length) return [];
    const minimumDepth = Math.min(...resolved.map((entry) => entry.depth));
    return resolved.filter((entry) => entry.depth === minimumDepth);
  }

  async function extractPdfText(bytes, pdfjs, options = {}) {
    if (!(bytes instanceof Uint8Array) || !hasPdfSignature(bytes)) {
      throw new DocumentReaderError("INVALID_PDF", "This file is not a valid PDF document.");
    }
    if (bytes.byteLength > (options.maxBytes || MAX_PDF_BYTES)) {
      throw new DocumentReaderError("PDF_TOO_LARGE", "This PDF is larger than the 24 MB reading limit.");
    }
    if (!pdfjs?.getDocument) {
      throw new DocumentReaderError("PDF_READER_UNAVAILABLE", "The local PDF reader is unavailable. Reload NeatMind from chrome://extensions and try again.");
    }
    if (options.workerSrc && pdfjs.GlobalWorkerOptions) pdfjs.GlobalWorkerOptions.workerSrc = options.workerSrc;

    let loadingTask;
    let pdf;
    let rejectPassword;
    let timeoutId;
    const timeoutMs = Math.max(1000, Math.min(Number(options.timeoutMs) || DOCUMENT_PARSE_TIMEOUT_MS, 60000));
    const passwordFailure = new Promise((_resolve, reject) => { rejectPassword = reject; });
    const timeoutFailure = new Promise((_resolve, reject) => {
      timeoutId = setTimeout(() => reject(new DocumentReaderError("PDF_PARSE_TIMEOUT", "This PDF took too long to read and was stopped safely.")), timeoutMs);
    });
    try {
      loadingTask = pdfjs.getDocument({
        data: bytes,
        isEvalSupported: false,
        useSystemFonts: true,
        stopAtErrors: false
      });
      loadingTask.onPassword = () => {
        rejectPassword(new DocumentReaderError(
          "PDF_ENCRYPTED",
          "This PDF is encrypted or password-protected. Unlock it in Chrome, save an unprotected copy, and try again."
        ));
      };
      pdf = await Promise.race([loadingTask.promise, passwordFailure, timeoutFailure]);
      const pageLimit = options.maxPages || MAX_PDF_PAGES;
      if (pdf.numPages > pageLimit) {
        throw new DocumentReaderError("PDF_TOO_MANY_PAGES", `This PDF has ${pdf.numPages} pages; the reading limit is ${pageLimit}.`);
      }

      const pages = [];
      const pageTexts = [];
      let selectableCharacters = 0;
      let outputCharacters = 0;
      let inspectedTextItems = 0;
      const deadline = Date.now() + timeoutMs;
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        if (Date.now() > deadline) throw new DocumentReaderError("PDF_PARSE_TIMEOUT", "This PDF took too long to read and was stopped safely.");
        const page = await Promise.race([pdf.getPage(pageNumber), timeoutFailure]);
        const content = await Promise.race([page.getTextContent({ disableCombineTextItems: false }), timeoutFailure]);
        const lines = [];
        let line = "";
        let pageCharacters = 0;
        const textLimit = options.maxText || MAX_EXTRACTED_TEXT;
        const pageBudget = MAX_PDF_PAGE_TEXT;
        for (const item of content.items || []) {
          if (pageCharacters + line.length >= pageBudget) break;
          inspectedTextItems += 1;
          if (inspectedTextItems > MAX_PDF_TEXT_ITEMS || Date.now() > deadline) {
            throw new DocumentReaderError("PDF_TEXT_LIMIT", "This PDF contains more text objects than NeatMind can process safely.");
          }
          const remainingLineBudget = Math.max(0, pageBudget - pageCharacters - line.length - (line ? 1 : 0));
          if (!remainingLineBudget) break;
          const rawItem = String(item?.str || "").slice(0, Math.min(4096, remainingLineBudget));
          const text = normalizeExtractedText(rawItem, Math.min(4000, remainingLineBudget)).replace(/\n+/g, " ");
          if (text) {
            line = `${line}${line ? " " : ""}${text}`.slice(0, pageBudget);
            selectableCharacters += text.length;
          }
          if (item?.hasEOL && line) {
            lines.push(line);
            pageCharacters += line.length + 1;
            line = "";
          }
        }
        if (line) lines.push(line);
        const pageText = normalizeExtractedText(lines.join("\n"), MAX_PDF_PAGE_TEXT);
        pageTexts.push(pageText);
        const remaining = Math.max(0, textLimit - outputCharacters);
        if (pageText) {
          const anchoredPage = `Page ${pageNumber}\n${pageText}`.slice(0, remaining);
          if (anchoredPage) {
            pages.push(anchoredPage);
            outputCharacters += anchoredPage.length + 2;
          }
        }
        page.cleanup?.();
      }
      if (selectableCharacters < 40) {
        throw new DocumentReaderError("PDF_NO_TEXT", "This PDF has no selectable text. It may be a scanned document; OCR is not available yet.");
      }
      const metadata = await pdf.getMetadata().catch(() => null);
      const title = normalizeExtractedText(metadata?.info?.Title || options.fallbackTitle || "PDF document", 180);
      const outline = await extractPdfOutline(pdf, timeoutFailure);
      return {
        title,
        text: normalizeExtractedText(pages.join("\n\n"), options.maxText || MAX_EXTRACTED_TEXT),
        pageCount: pdf.numPages,
        pageTexts,
        outline,
        chapters: detectPdfChapters({ title, pageTexts, outline, pageCount: pdf.numPages })
      };
    } catch (error) {
      if (error instanceof DocumentReaderError) throw error;
      if (/password/i.test(`${error?.name || ""} ${error?.message || ""}`)) {
        throw new DocumentReaderError("PDF_ENCRYPTED", "This PDF is encrypted or password-protected. Unlock it in Chrome, save an unprotected copy, and try again.");
      }
      if (/invalidpdf|invalid pdf|malformed|xref/i.test(`${error?.name || ""} ${error?.message || ""}`)) {
        throw new DocumentReaderError("PDF_MALFORMED", "This PDF is malformed or corrupted and cannot be read safely.");
      }
      throw new DocumentReaderError("PDF_UNSUPPORTED", `This PDF could not be read safely: ${String(error?.message || "unsupported PDF structure").slice(0, 180)}`);
    } finally {
      clearTimeout(timeoutId);
      await loadingTask?.destroy?.().catch(() => undefined);
    }
  }

  return Object.freeze({
    MAX_PDF_BYTES,
    MAX_HTML_BYTES,
    MAX_PDF_PAGES,
    MAX_EXTRACTED_TEXT,
    MAX_HTML_NODES,
    MAX_HTML_CHUNKS,
    MAX_PDF_TEXT_ITEMS,
    MAX_PDF_PAGE_TEXT,
    MAX_PDF_CHAPTERS,
    DOCUMENT_PARSE_TIMEOUT_MS,
    MAX_FRAME_RESULTS,
    PDF_VIEWER_EXTENSION_ID,
    FILE_ACCESS_GUIDANCE,
    DocumentReaderError,
    recoverDocumentSourceUrl,
    classifyTabDocument,
    getPermissionOrigin,
    hasPdfSignature,
    looksLikeBinary,
    classifyFetchedDocument,
    normalizeExtractedText,
    isExtractedBoilerplate,
    assessReadableContent,
    assertReadableContent,
    mergeFrameSnapshots,
    extractHtmlText,
    decodeHtmlBytes,
    detectPdfChapters,
    extractPdfText
  });
});
