(function initExamCramCheatSheet(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.ExamCramCheatSheet = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createCheatSheetApi() {
  "use strict";

  const SCHEMA_VERSION = 1;
  const MAX_ROWS = 8;
  const MIN_GENERATED_ROWS = 3;
  const MAX_CONTEXT_TEXT = 100000;
  const FIELD_LIMITS = Object.freeze({
    title: 140,
    caption: 220,
    topic: 90,
    mainIdea: 260,
    keyFacts: 260,
    example: 240,
    anchor: 180,
    sourceTitle: 180,
    sourceId: 100,
    segmentId: 80,
    fingerprint: 160,
    url: 1000
  });
  const COLUMNS = Object.freeze([
    Object.freeze({ key: "topic", label: "Topic / concept" }),
    Object.freeze({ key: "mainIdea", label: "Main idea" }),
    Object.freeze({ key: "keyFacts", label: "Key facts or rule" }),
    Object.freeze({ key: "example", label: "Example / application" }),
    Object.freeze({ key: "evidence", label: "Evidence / citation" })
  ]);

  function cleanText(value, maxLength = 300) {
    return String(value ?? "")
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, Math.max(0, Number(maxLength) || 0));
  }

  function cleanUrl(value) {
    const raw = cleanText(value, FIELD_LIMITS.url);
    if (!raw) return "";
    try {
      const parsed = new URL(raw);
      if (!["http:", "https:"].includes(parsed.protocol)) return "";
      parsed.username = "";
      parsed.password = "";
      parsed.hash = "";
      return parsed.href.slice(0, FIELD_LIMITS.url);
    } catch {
      return "";
    }
  }

  function normalizeSourceType(context = {}) {
    const binding = context.sourceBinding && typeof context.sourceBinding === "object"
      ? context.sourceBinding
      : {};
    if (context.documentType === "pdf" || binding.documentType === "pdf") return "pdf";
    const value = cleanText(context.sourceType || binding.sourceType || binding.type, 24).toLowerCase();
    return ["webpage", "notes", "video", "collection", "pdf"].includes(value) ? value : "webpage";
  }

  function normalizeRowsInput(value) {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.rows)) return value.rows;
    return [];
  }

  function tokenize(value) {
    return new Set(cleanText(value, 1000)
      .toLocaleLowerCase()
      .split(/[^\p{L}\p{N}]+/u)
      .filter((token) => token.length > 1)
      .slice(0, 80));
  }

  function overlapScore(first, second) {
    const firstTokens = tokenize(first);
    const secondTokens = tokenize(second);
    if (!firstTokens.size || !secondTokens.size) return 0;
    let matches = 0;
    for (const token of firstTokens) {
      if (secondTokens.has(token)) matches += 1;
    }
    return matches / Math.max(1, Math.min(firstTokens.size, secondTokens.size));
  }

  function getVisualNodes(context = {}) {
    const nodes = context.visualModel?.nodes
      || context.visualLesson?.visualModel?.nodes
      || context.artifact?.visualLesson?.visualModel?.nodes
      || [];
    return Array.isArray(nodes) ? nodes.filter((node) => node && typeof node === "object").slice(0, MAX_ROWS) : [];
  }

  function chooseGroundedNode(row, nodes, index) {
    if (!nodes.length) return null;
    const requestedSegmentId = cleanText(row?.sourceSegmentId || row?.evidence?.segmentId, FIELD_LIMITS.segmentId);
    const requestedSourceId = cleanText(row?.sourceId || row?.evidence?.sourceId, FIELD_LIMITS.sourceId);
    if (requestedSegmentId) {
      const exact = nodes.find((node) => cleanText(node.sourceSegmentId || node.sourceRef?.segmentId, FIELD_LIMITS.segmentId) === requestedSegmentId);
      if (exact) return exact;
    }
    if (requestedSourceId) {
      const exact = nodes.find((node) => cleanText(node.sourceId || node.sourceRef?.sourceId, FIELD_LIMITS.sourceId) === requestedSourceId);
      if (exact) return exact;
    }
    const rowText = [
      row?.topic,
      row?.concept,
      row?.mainIdea,
      row?.keyFacts,
      row?.keyFact,
      row?.rule,
      row?.sourceAnchor,
      row?.evidence?.anchor
    ].filter(Boolean).join(" ");
    let best = null;
    let bestScore = 0;
    for (const node of nodes) {
      const nodeText = [node.label, node.role, node.detail, node.why, node.example, node.sourceAnchor].filter(Boolean).join(" ");
      const score = overlapScore(rowText, nodeText);
      if (score > bestScore) {
        best = node;
        bestScore = score;
      }
    }
    return best || nodes[index % nodes.length];
  }

  function positiveInteger(value) {
    const number = Number(value);
    return Number.isInteger(number) && number > 0 ? number : null;
  }

  function inferPdfPage(anchorValue, rawTextValue) {
    const anchor = cleanText(anchorValue, FIELD_LIMITS.anchor);
    const directMatch = anchor.match(/(?:^|\b)(?:page|p\.)\s*(\d{1,4})(?:\b|$)/i);
    if (directMatch) return positiveInteger(directMatch[1]);
    if (!anchor) return null;
    const rawText = String(rawTextValue || "").slice(0, MAX_CONTEXT_TEXT);
    const lower = rawText.toLocaleLowerCase();
    const position = lower.indexOf(anchor.toLocaleLowerCase());
    if (position < 0) return null;
    const prefix = rawText.slice(0, position);
    const pageMatches = [...prefix.matchAll(/(?:^|\b)Page\s+(\d{1,4})(?:\b|$)/gi)];
    return pageMatches.length ? positiveInteger(pageMatches[pageMatches.length - 1][1]) : null;
  }

  function formatTimestamp(secondsValue) {
    const seconds = Math.max(0, Math.floor(Number(secondsValue) || 0));
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainder = seconds % 60;
    return hours
      ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`
      : `${minutes}:${String(remainder).padStart(2, "0")}`;
  }

  function findVideoSegment(context, segmentId) {
    const segments = Array.isArray(context.videoSegments) ? context.videoSegments : [];
    return segments.find((segment) => cleanText(segment?.id, FIELD_LIMITS.segmentId) === segmentId) || null;
  }

  function findCollectionSource(context, sourceId) {
    const sources = Array.isArray(context.collectionSources)
      ? context.collectionSources
      : (Array.isArray(context.sources) ? context.sources : []);
    return sources.find((source) => cleanText(source?.id, FIELD_LIMITS.sourceId) === sourceId) || null;
  }

  function normalizeEvidence(row, node, context, sourceType) {
    const supplied = row?.evidence && typeof row.evidence === "object" ? row.evidence : {};
    const sourceRef = node?.sourceRef && typeof node.sourceRef === "object" ? node.sourceRef : {};
    const segmentId = cleanText(
      node?.sourceSegmentId || sourceRef.segmentId || row?.sourceSegmentId || supplied.segmentId,
      FIELD_LIMITS.segmentId
    );
    const sourceId = cleanText(
      node?.sourceId || sourceRef.sourceId || row?.sourceId || supplied.sourceId,
      FIELD_LIMITS.sourceId
    );
    const segment = sourceType === "video" ? findVideoSegment(context, segmentId) : null;
    const collectionSource = sourceType === "collection" ? findCollectionSource(context, sourceId) : null;
    const startMsValue = segment?.startMs ?? sourceRef.startMs ?? supplied.startMs;
    const endMsValue = segment?.endMs ?? sourceRef.endMs ?? supplied.endMs;
    const startMs = Number.isFinite(Number(startMsValue)) ? Math.max(0, Math.round(Number(startMsValue))) : null;
    const endMs = Number.isFinite(Number(endMsValue)) && Number(endMsValue) >= Number(startMs || 0)
      ? Math.round(Number(endMsValue))
      : null;
    const anchor = cleanText(
      node?.sourceAnchor || sourceRef.quote || row?.sourceAnchor || supplied.anchor || supplied.quote,
      FIELD_LIMITS.anchor
    );
    const explicitPage = positiveInteger(supplied.pageNumber ?? supplied.page ?? row?.sourcePage ?? node?.sourcePage ?? sourceRef.pageNumber);
    const pageNumber = sourceType === "pdf"
      ? explicitPage || inferPdfPage(anchor, context.rawText)
      : null;
    const title = cleanText(
      collectionSource?.title || sourceRef.title || supplied.title || context.sourceTitle || context.title || context.sourceBinding?.title,
      FIELD_LIMITS.sourceTitle
    );
    const url = cleanUrl(collectionSource?.url || sourceRef.url || supplied.url || context.sourceUrl || context.sourceBinding?.url);
    let label = "Source passage";
    if (sourceType === "video" && startMs != null) label = `${formatTimestamp(startMs / 1000)} · Video transcript`;
    else if (sourceType === "pdf" && pageNumber) label = `Page ${pageNumber} · PDF`;
    else if (sourceType === "pdf") label = "PDF passage";
    else if (sourceType === "collection" && title) label = title;
    else if (sourceType === "notes") label = "Saved note";
    else if (title) label = title;

    return {
      label: cleanText(label, FIELD_LIMITS.sourceTitle),
      anchor,
      sourceType,
      sourceId,
      segmentId,
      startMs,
      endMs,
      timestampSeconds: startMs == null ? null : Math.round(startMs / 1000),
      pageNumber,
      title,
      url
    };
  }

  function createRow(rowValue, node, context, sourceType, index) {
    const row = rowValue && typeof rowValue === "object" ? rowValue : {};
    const topic = cleanText(row.topic || row.concept || row.label || row.title || node?.label, FIELD_LIMITS.topic);
    const mainIdea = cleanText(row.mainIdea || row.idea || row.summary || row.detail || node?.detail, FIELD_LIMITS.mainIdea);
    const keyFactsValue = Array.isArray(row.keyFacts)
      ? row.keyFacts.join("; ")
      : (row.keyFacts || row.keyFact || row.rule || row.fact || node?.role || node?.why);
    const keyFacts = cleanText(keyFactsValue, FIELD_LIMITS.keyFacts);
    const example = cleanText(row.example || row.application || node?.example, FIELD_LIMITS.example);
    if (!topic || !mainIdea) return null;
    return {
      id: `cheat-${String(index + 1).padStart(2, "0")}`,
      topic,
      mainIdea,
      keyFacts: keyFacts || mainIdea,
      example: example || "Apply this idea when explaining or comparing the topic.",
      evidence: normalizeEvidence(row, node, context, sourceType)
    };
  }

  function buildFallbackRows(context, sourceType) {
    const nodes = getVisualNodes(context);
    const rows = nodes.map((node, index) => createRow({}, node, context, sourceType, index)).filter(Boolean);
    if (rows.length) return rows.slice(0, MAX_ROWS);
    const summary = Array.isArray(context.summary) ? context.summary : [];
    return summary.slice(0, MAX_ROWS).map((item, index) => createRow({
      topic: `Key idea ${index + 1}`,
      mainIdea: item,
      keyFacts: item,
      example: "Use this point in a short-answer explanation.",
      sourceAnchor: item
    }, null, context, sourceType, index)).filter(Boolean);
  }

  function normalizeCheatSheet(value, contextValue = {}) {
    const context = contextValue && typeof contextValue === "object" ? contextValue : {};
    const sourceType = normalizeSourceType(context);
    const nodes = getVisualNodes(context);
    const suppliedRows = normalizeRowsInput(value).slice(0, MAX_ROWS);
    const normalized = suppliedRows.map((row, index) => createRow(
      row,
      chooseGroundedNode(row, nodes, index),
      context,
      sourceType,
      index
    )).filter(Boolean);
    const fallbacks = buildFallbackRows(context, sourceType);
    const combined = [...normalized];
    const seen = new Set(combined.map((row) => `${row.topic}|${row.mainIdea}`.toLocaleLowerCase()));
    for (const fallback of fallbacks) {
      if (combined.length >= MAX_ROWS || (suppliedRows.length && combined.length >= MIN_GENERATED_ROWS)) break;
      const key = `${fallback.topic}|${fallback.mainIdea}`.toLocaleLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      combined.push({ ...fallback, id: `cheat-${String(combined.length + 1).padStart(2, "0")}` });
    }
    const valueObject = value && typeof value === "object" && !Array.isArray(value) ? value : {};
    const titleBase = cleanText(context.title || context.sourceTitle || context.sourceBinding?.title || "Study note", FIELD_LIMITS.title);
    return {
      schemaVersion: SCHEMA_VERSION,
      title: cleanText(valueObject.title || `${titleBase} cheat sheet`, FIELD_LIMITS.title),
      caption: cleanText(
        valueObject.caption || "Important ideas, rules, examples, and their source evidence.",
        FIELD_LIMITS.caption
      ),
      sourceFingerprint: cleanText(
        context.sourceFingerprint || context.sourceBinding?.fingerprint,
        FIELD_LIMITS.fingerprint
      ),
      columns: COLUMNS.map((column) => ({ ...column })),
      rows: combined.slice(0, MAX_ROWS)
    };
  }

  function hasUsableCheatSheet(value) {
    return Boolean(value && Array.isArray(value.rows) && value.rows.some((row) => (
      cleanText(row?.topic, FIELD_LIMITS.topic) && cleanText(row?.mainIdea, FIELD_LIMITS.mainIdea)
    )));
  }

  return Object.freeze({
    SCHEMA_VERSION,
    MAX_ROWS,
    MIN_GENERATED_ROWS,
    FIELD_LIMITS,
    COLUMNS,
    cleanText,
    formatTimestamp,
    inferPdfPage,
    normalizeCheatSheet,
    hasUsableCheatSheet
  });
});
