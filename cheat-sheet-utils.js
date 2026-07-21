(function initNeatMindCheatSheet(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.NeatMindCheatSheet = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createCheatSheetApi() {
  "use strict";

  const SCHEMA_VERSION = 1;
  const MAX_ROWS = 8;
  const MIN_GENERATED_ROWS = 3;
  const MAX_CONTEXT_TEXT = 100000;
  const ROW_SCALE_STEP_CHARS = 4000;
  const MAX_SUPPLIED_ROWS_TO_INSPECT = 32;
  const GROUNDING_STOP_WORDS = new Set([
    "about", "after", "also", "and", "are", "because", "before", "being", "between", "can",
    "could", "does", "each", "example", "for", "from", "have", "into", "its", "main", "more",
    "most", "note", "only", "other", "over", "source", "such", "than", "that", "the", "their",
    "there", "these", "they", "this", "through", "under", "using", "was", "were", "what", "when",
    "where", "which", "while", "with", "would"
  ]);
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

  function getCheatSheetTargetRowCount(rawTextValue) {
    const sourceLength = String(rawTextValue || "").trim().slice(0, MAX_CONTEXT_TEXT).length;
    if (!sourceLength) return MIN_GENERATED_ROWS;
    return Math.max(
      MIN_GENERATED_ROWS,
      Math.min(MAX_ROWS, MIN_GENERATED_ROWS + Math.floor(sourceLength / ROW_SCALE_STEP_CHARS))
    );
  }

  function getCheatSheetRowLimits(rawTextValue) {
    const hasSourceText = Boolean(String(rawTextValue || "").trim());
    const targetRows = getCheatSheetTargetRowCount(rawTextValue);
    return {
      targetRows,
      // Saved artifacts rendered without their private raw snapshot must retain their existing bounded rows.
      maxRows: hasSourceText ? targetRows : MAX_ROWS
    };
  }

  function normalizeGroundingText(value, maxLength = 4000) {
    return cleanText(value, maxLength)
      .normalize("NFKD")
      .replace(/\p{M}/gu, "")
      .toLocaleLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function groundingTerms(value) {
    return [...new Set(normalizeGroundingText(value, 4000)
      .split(/[^\p{L}\p{N}]+/u)
      .filter((token) => token.length > 2 && !GROUNDING_STOP_WORDS.has(token)))];
  }

  function hasGroundedClaim(evidenceValue, claimValue) {
    const evidence = normalizeGroundingText(evidenceValue, MAX_CONTEXT_TEXT);
    const claim = normalizeGroundingText(claimValue, 1000);
    if (!evidence || !claim) return false;
    if (claim.length >= 8 && evidence.includes(claim)) return true;

    const evidenceTerms = new Set(groundingTerms(evidence));
    const claimTerms = groundingTerms(claim);
    if (!claimTerms.length) return false;
    const hasSharedPhrase = claimTerms
      .slice(1)
      .some((term, index) => evidence.includes(`${claimTerms[index]} ${term}`));
    if (hasSharedPhrase) return true;
    const matches = claimTerms.filter((term) => evidenceTerms.has(term)).length;
    const requiredMatches = claimTerms.length >= 5 ? 2 : 1;
    return matches >= requiredMatches && matches / claimTerms.length >= 0.2;
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
      return null;
    }
    if (requestedSourceId) {
      const exact = nodes.find((node) => cleanText(node.sourceId || node.sourceRef?.sourceId, FIELD_LIMITS.sourceId) === requestedSourceId);
      if (exact) return exact;
      return null;
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
    return bestScore > 0 ? best : null;
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

  function getCollectionSourceBlock(rawTextValue, sourceId, sourcesValue = []) {
    const rawText = String(rawTextValue || "").slice(0, MAX_CONTEXT_TEXT);
    const safeId = cleanText(sourceId, FIELD_LIMITS.sourceId);
    if (!rawText || !safeId) return "";
    const marker = `SOURCE ${safeId}\n`;
    const start = rawText.indexOf(marker);
    if (start < 0) return "";

    const contentMarker = "\nCONTENT_BEGIN\n";
    const contentStart = rawText.indexOf(contentMarker, start + marker.length);
    const structuredEnd = rawText.indexOf("\nCONTENT_END\n<<<END_SOURCE_BLOCK>>>", start + marker.length);
    if (structuredEnd >= 0) {
      return rawText.slice(
        contentStart >= 0 && contentStart < structuredEnd ? contentStart + contentMarker.length : start + marker.length,
        structuredEnd
      ).trim();
    }

    const sources = Array.isArray(sourcesValue) ? sourcesValue : [];
    const nextStarts = sources
      .map((source) => cleanText(source?.id, FIELD_LIMITS.sourceId))
      .filter((candidateId) => candidateId && candidateId !== safeId)
      .map((candidateId) => rawText.indexOf(`\n\nSOURCE ${candidateId}\n`, start + marker.length))
      .filter((position) => position > start);
    const next = nextStarts.length ? Math.min(...nextStarts) : rawText.length;
    return rawText.slice(start + marker.length, next).trim();
  }

  function getSuppliedSegmentId(row) {
    return cleanText(row?.sourceSegmentId || row?.evidence?.segmentId, FIELD_LIMITS.segmentId);
  }

  function getSuppliedSourceId(row) {
    return cleanText(row?.sourceId || row?.evidence?.sourceId, FIELD_LIMITS.sourceId);
  }

  function resolveRowGroundingText(row, node, context, sourceType) {
    if (sourceType === "video") {
      const segmentId = getSuppliedSegmentId(row)
        || cleanText(node?.sourceSegmentId || node?.sourceRef?.segmentId, FIELD_LIMITS.segmentId);
      if (!segmentId) {
        if (Array.isArray(context.videoSegments) && context.videoSegments.length) {
          throw new Error("Cheat-sheet row omitted the transcript segment required by the saved source.");
        }
        return "";
      }
      const segment = findVideoSegment(context, segmentId);
      if (!segment) throw new Error(`Cheat-sheet row cited unknown transcript segment ${segmentId}.`);
      return cleanText(segment.text, MAX_CONTEXT_TEXT);
    }

    if (sourceType === "collection") {
      const sourceId = getSuppliedSourceId(row)
        || cleanText(node?.sourceId || node?.sourceRef?.sourceId, FIELD_LIMITS.sourceId);
      const sources = Array.isArray(context.collectionSources)
        ? context.collectionSources
        : (Array.isArray(context.sources) ? context.sources : []);
      if (!sourceId) {
        if (sources.length || String(context.rawText || "").trim()) {
          throw new Error("Cheat-sheet row omitted the saved source ID required by the collection.");
        }
        return "";
      }
      const source = findCollectionSource(context, sourceId);
      if (!source) throw new Error(`Cheat-sheet row cited unknown saved source ${sourceId}.`);
      const sourceBlock = getCollectionSourceBlock(context.rawText, sourceId, sources)
        || cleanText(source.text || source.rawText || source.content, MAX_CONTEXT_TEXT);
      if (String(context.rawText || "").trim() && !sourceBlock) {
        throw new Error(`Cheat-sheet citation for saved source ${sourceId} is missing from the collection snapshot.`);
      }
      return sourceBlock;
    }

    return cleanText(context.rawText, MAX_CONTEXT_TEXT);
  }

  function getSuppliedClaim(row, field) {
    if (field === "mainIdea") return row?.mainIdea || row?.idea || row?.summary || row?.detail || "";
    if (field === "keyFacts") {
      const value = row?.keyFacts || row?.keyFact || row?.rule || row?.fact || "";
      return Array.isArray(value) ? value.join("; ") : value;
    }
    return row?.example || row?.application || "";
  }

  function getSuppliedAnchor(row) {
    const evidence = row?.evidence && typeof row.evidence === "object" ? row.evidence : {};
    return row?.sourceAnchor || evidence.anchor || evidence.quote || "";
  }

  function assertSuppliedRowGrounded(row, normalizedRow, node, context, sourceType, index) {
    const groundingText = resolveRowGroundingText(row, node, context, sourceType);
    if (!groundingText) return false;

    const claims = [
      ["main idea", getSuppliedClaim(row, "mainIdea")],
      ["key facts", getSuppliedClaim(row, "keyFacts")],
      ["example", getSuppliedClaim(row, "example")]
    ];
    for (const [label, claim] of claims) {
      if (cleanText(claim, 1000) && !hasGroundedClaim(groundingText, claim)) {
        throw new Error(`Cheat-sheet row ${index + 1} ${label} is not supported by the saved source.`);
      }
    }

    const anchor = getSuppliedAnchor(row) || normalizedRow?.evidence?.anchor;
    if (!anchor || !hasGroundedClaim(groundingText, anchor)) {
      throw new Error(`Cheat-sheet row ${index + 1} citation is not supported by the saved source.`);
    }
    return true;
  }

  function createUnavailableEvidence(sourceType) {
    return {
      label: "Evidence unavailable",
      anchor: "",
      sourceType,
      unavailable: true
    };
  }

  function normalizeEvidence(row, node, context, sourceType) {
    const supplied = row?.evidence && typeof row.evidence === "object" ? row.evidence : {};
    const rowSourceRef = row?.sourceRef && typeof row.sourceRef === "object" ? row.sourceRef : {};
    const sourceRef = node?.sourceRef && typeof node.sourceRef === "object"
      ? { ...rowSourceRef, ...node.sourceRef }
      : rowSourceRef;
    const segmentId = cleanText(
      node?.sourceSegmentId || sourceRef.segmentId || row?.sourceSegmentId || supplied.segmentId,
      FIELD_LIMITS.segmentId
    );
    const sourceId = cleanText(
      node?.sourceId || sourceRef.sourceId || row?.sourceId || supplied.sourceId,
      FIELD_LIMITS.sourceId
    );
    const collectionSource = sourceType === "collection" ? findCollectionSource(context, sourceId) : null;
    const evidenceSourceType = sourceType === "collection"
      ? cleanText(collectionSource?.type || sourceRef.sourceType || sourceRef.type, 40) || "collection"
      : sourceType;
    const segment = evidenceSourceType === "video"
      ? findVideoSegment(collectionSource
        ? { videoSegments: collectionSource.segments || collectionSource.videoSegments || [] }
        : context, segmentId)
      : null;
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
    const isPdf = sourceType === "pdf" || collectionSource?.documentType === "pdf" || sourceRef.documentType === "pdf";
    const pageSourceText = collectionSource
      ? getCollectionSourceBlock(context.rawText, collectionSource.id, context.collectionSources || context.sources)
      : context.rawText;
    const explicitPage = [
      supplied.sourcePage,
      supplied.pageNumber,
      supplied.page,
      row?.sourcePage,
      row?.pageNumber,
      node?.sourcePage,
      node?.pageNumber,
      sourceRef.sourcePage,
      sourceRef.pageNumber
    ].map(positiveInteger).find(Boolean) || null;
    const pageNumber = isPdf
      ? explicitPage || inferPdfPage(anchor, pageSourceText)
      : null;
    const title = cleanText(
      collectionSource?.title || sourceRef.title || supplied.title || context.sourceTitle || context.title || context.sourceBinding?.title,
      FIELD_LIMITS.sourceTitle
    );
    const url = cleanUrl(collectionSource?.url || sourceRef.url || supplied.url || context.sourceUrl || context.sourceBinding?.url);
    const sourceFingerprint = cleanText(
      collectionSource?.fingerprint
      || sourceRef.sourceFingerprint
      || sourceRef.fingerprint
      || supplied.sourceFingerprint
      || supplied.fingerprint
      || context.sourceFingerprint
      || context.sourceBinding?.fingerprint,
      FIELD_LIMITS.fingerprint
    );
    let label = "Source passage";
    if (evidenceSourceType === "video" && startMs != null) label = `${formatTimestamp(startMs / 1000)} · Video transcript`;
    else if (isPdf && pageNumber) label = `Page ${pageNumber} · PDF`;
    else if (isPdf) label = "PDF passage";
    else if (sourceType === "collection" && title) label = title;
    else if (sourceType === "notes") label = "Saved note";
    else if (title) label = title;

    return {
      label: cleanText(label, FIELD_LIMITS.sourceTitle),
      anchor,
      sourceType: isPdf ? "webpage" : evidenceSourceType,
      documentType: isPdf ? "pdf" : "",
      sourceId,
      sourceFingerprint,
      segmentId,
      startMs,
      endMs,
      timestampSeconds: startMs == null ? null : Math.round(startMs / 1000),
      pageNumber,
      sourcePage: pageNumber || 0,
      title,
      url
    };
  }

  function sameLearnerText(first, second) {
    const normalize = (value) => cleanText(value, 600)
      .toLocaleLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
    const left = normalize(first);
    const right = normalize(second);
    // Do not treat a synthetic one-character payload as a meaningful duplicate.
    // Apart from preserving bounded-field sanitization, this keeps the rule focused
    // on repeated study content rather than malformed transport data.
    const distinctCharacters = new Set(left.match(/[\p{L}\p{N}]/gu) || []);
    if (distinctCharacters.size < 3) return false;
    return Boolean(left && right && (left === right || (left.length >= 28 && right.length >= 28 && (left.includes(right) || right.includes(left)))));
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
      keyFacts: keyFacts && !sameLearnerText(keyFacts, mainIdea) ? keyFacts : "",
      example: example && !sameLearnerText(example, mainIdea) ? example : "",
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
      example: "",
      sourceAnchor: item
    }, null, context, sourceType, index)).filter(Boolean);
  }

  function createGroundedRepairRow(node, context, sourceType, index) {
    if (!node || typeof node !== "object") return null;
    const anchor = cleanText(
      node.sourceAnchor || node.sourceRef?.quote || node.sourceText || node.detail,
      FIELD_LIMITS.anchor
    );
    if (!anchor) return null;
    const supplied = {
      topic: node.label || "Source-supported concept",
      mainIdea: anchor,
      keyFacts: anchor,
      example: node.example || anchor,
      sourceAnchor: anchor,
      sourceSegmentId: node.sourceSegmentId || node.sourceRef?.segmentId || "",
      sourceId: node.sourceId || node.sourceRef?.sourceId || "",
      sourcePage: node.sourcePage || node.sourceRef?.sourcePage || 0
    };
    const repaired = createRow(supplied, node, context, sourceType, index);
    if (!repaired) return null;
    try {
      assertSuppliedRowGrounded(supplied, repaired, node, context, sourceType, index);
      return repaired;
    } catch {
      return null;
    }
  }

  function normalizeCheatSheetValue(value, contextValue = {}, optionsValue = false) {
    const context = contextValue && typeof contextValue === "object" ? contextValue : {};
    const options = optionsValue && typeof optionsValue === "object"
      ? optionsValue
      : { resilient: Boolean(optionsValue), repairGrounding: false };
    const resilient = Boolean(options.resilient);
    const repairGrounding = Boolean(options.repairGrounding);
    const reportGroundingFailure = typeof options.onGroundingFailure === "function"
      ? options.onGroundingFailure
      : null;
    const sourceType = normalizeSourceType(context);
    const nodes = getVisualNodes(context);
    const suppliedRows = normalizeRowsInput(value).slice(0, MAX_SUPPLIED_ROWS_TO_INSPECT);
    const { targetRows, maxRows } = getCheatSheetRowLimits(context.rawText);
    const normalized = [];
    suppliedRows.forEach((row, rowIndex) => {
      const node = chooseGroundedNode(row, nodes, normalized.length);
      const normalizedRow = createRow(row, node, context, sourceType, normalized.length);
      if (!normalizedRow) return;
      try {
        const grounded = assertSuppliedRowGrounded(row, normalizedRow, node, context, sourceType, rowIndex);
        if (resilient && !grounded) normalizedRow.evidence = createUnavailableEvidence(sourceType);
      } catch (error) {
        if (!resilient) throw error;
        if (repairGrounding) {
          reportGroundingFailure?.({
            index: rowIndex,
            row,
            error,
            action: node ? "repaired from a grounded visual node" : "dropped because no grounded visual node was available"
          });
          const repaired = createGroundedRepairRow(node, context, sourceType, normalized.length);
          if (repaired) {
            if (normalized.length < maxRows) normalized.push(repaired);
            return;
          }
          return;
        }
        normalizedRow.evidence = createUnavailableEvidence(sourceType);
      }
      if (normalized.length < maxRows) normalized.push(normalizedRow);
    });
    const fallbacks = buildFallbackRows(context, sourceType);
    const combined = [...normalized];
    const seen = new Set(combined.map((row) => `${row.topic}|${row.mainIdea}`.toLocaleLowerCase()));
    for (const fallback of fallbacks) {
      if (combined.length >= targetRows) break;
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
      rows: combined.slice(0, maxRows)
    };
  }

  function normalizeCheatSheet(value, contextValue = {}) {
    return normalizeCheatSheetValue(value, contextValue, false);
  }

  function normalizeCheatSheetForGeneration(value, contextValue = {}) {
    const context = contextValue && typeof contextValue === "object" ? contextValue : {};
    return normalizeCheatSheetValue(value, context, {
      resilient: true,
      repairGrounding: true,
      onGroundingFailure: context.onGroundingFailure
    });
  }

  function normalizeCheatSheetForRender(value, contextValue = {}) {
    const context = contextValue && typeof contextValue === "object" ? contextValue : {};
    try {
      return normalizeCheatSheetValue(value, context, true);
    } catch {
      const titleBase = cleanText(context.title || context.sourceTitle || context.sourceBinding?.title || "Study note", FIELD_LIMITS.title);
      return {
        schemaVersion: SCHEMA_VERSION,
        title: `${titleBase} cheat sheet`,
        caption: "Evidence is temporarily unavailable for this saved cheat sheet.",
        sourceFingerprint: cleanText(context.sourceFingerprint || context.sourceBinding?.fingerprint, FIELD_LIMITS.fingerprint),
        columns: COLUMNS.map((column) => ({ ...column })),
        rows: []
      };
    }
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
    getCheatSheetTargetRowCount,
    getCollectionSourceBlock,
    hasGroundedClaim,
    inferPdfPage,
    normalizeCheatSheet,
    normalizeCheatSheetForGeneration,
    normalizeCheatSheetForRender,
    hasUsableCheatSheet
  });
});
