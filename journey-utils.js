(function initJourneyUtils(root) {
  "use strict";

  const SCHEMA_VERSION = 2;
  const MAX_CHAPTERS = 24;
  const MAX_SOURCES_PER_CHAPTER = 8;
  const MAX_SESSIONS_PER_CHAPTER = 30;
  const MAX_SOURCE_TEXT = 14000;
  const MAX_TRANSCRIPT_SEGMENTS = 500;
  const MAX_TRANSCRIPT_TEXT = 24000;
  const MAX_EVENTS = 500;
  const MAX_APPLIED_OPERATIONS = 120;

  function clone(value) {
    if (value == null) return value;
    if (typeof structuredClone === "function") return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
  }

  function makeId(prefix = "item") {
    const id = root.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    return `${prefix}-${id}`;
  }

  function cleanText(value, maxLength = 300) {
    return String(value || "").replace(/\s+/g, " ").trim().slice(0, maxLength);
  }

  function dateTimestamp(value) {
    if (value === null || value === undefined || value === "") return null;
    const timestamp = new Date(value).getTime();
    return Number.isFinite(timestamp) ? timestamp : null;
  }

  function normalizeIsoDate(value, fallback = Date.now()) {
    const timestamp = dateTimestamp(value) ?? dateTimestamp(fallback) ?? 0;
    return new Date(timestamp).toISOString();
  }

  function normalizeOptionalIsoDate(value) {
    const timestamp = dateTimestamp(value);
    return timestamp === null ? null : new Date(timestamp).toISOString();
  }

  function fingerprint(value) {
    const text = String(value || "").replace(/\s+/g, " ").trim();
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return `${text.length}:${(hash >>> 0).toString(36)}`;
  }

  function canonicalUrl(value, sourceType = "webpage") {
    try {
      const url = new URL(String(value || ""));
      if (!["http:", "https:"].includes(url.protocol)) return "";
      url.hash = "";
      if (sourceType === "video") {
        ["t", "start", "time_continue", "si"].forEach((key) => url.searchParams.delete(key));
      }
      return url.href;
    } catch {
      return "";
    }
  }

  function normalizeTranscriptSegments(value) {
    const segments = Array.isArray(value) ? value : [];
    const normalized = segments
      .map((segment, index) => {
        const text = cleanText(segment?.text, 500);
        const startMs = Math.max(0, Math.round(Number(segment?.startMs ?? Number(segment?.startSeconds) * 1000)));
        const rawEnd = Number(segment?.endMs ?? Number(segment?.endSeconds) * 1000);
        const endMs = Number.isFinite(rawEnd) && rawEnd >= startMs
          ? Math.round(rawEnd)
          : startMs + 4000;
        if (!text || !Number.isFinite(startMs)) return null;
        return {
          id: cleanText(segment?.id, 80) || `seg-${String(index + 1).padStart(4, "0")}`,
          startMs,
          endMs,
          text,
          timestampConfidence: cleanText(segment?.timestampConfidence, 40),
          provenance: cleanText(segment?.provenance, 40),
          sourceChunkId: cleanText(segment?.sourceChunkId, 100)
        };
      })
      .filter(Boolean)
      .sort((first, second) => first.startMs - second.startMs)
      .filter((segment, index, list) => index === 0
        || segment.startMs !== list[index - 1].startMs
        || segment.text !== list[index - 1].text)
      .slice(0, MAX_TRANSCRIPT_SEGMENTS);
    let textLength = 0;
    return normalized.filter((segment) => {
      if (textLength + segment.text.length > MAX_TRANSCRIPT_TEXT) return false;
      textLength += segment.text.length;
      return true;
    });
  }

  function normalizeSource(source, fallbackDate = Date.now()) {
    const type = ["webpage", "video", "notes"].includes(source?.type) ? source.type : "webpage";
    const documentType = type === "webpage" && source?.documentType === "pdf" ? "pdf" : type === "webpage" ? "html" : "";
    const segments = normalizeTranscriptSegments(source?.segments || source?.transcript?.segments);
    const text = String(source?.text || "").replace(/\s+/g, " ").trim().slice(0, MAX_SOURCE_TEXT);
    const capturedAt = normalizeIsoDate(source?.capturedAt, fallbackDate);
    const safeUrl = canonicalUrl(source?.url || source?.canonicalUrl, type);
    const contentFingerprint = cleanText(source?.fingerprint, 100)
      || fingerprint(segments.length ? JSON.stringify(segments) : text);
    return {
      id: cleanText(source?.id, 100) || makeId("source"),
      type,
      title: cleanText(source?.title, 180) || (type === "video" ? "Video lesson" : "Study source"),
      url: safeUrl,
      capturedAt,
      fingerprint: contentFingerprint,
      text,
      documentType,
      pageCount: documentType === "pdf" ? Math.max(0, Math.min(10000, Math.round(Number(source?.pageCount) || 0))) : 0,
      language: cleanText(source?.language, 40),
      durationMs: Math.max(0, Math.round(Number(source?.durationMs) || 0)),
      mediaId: cleanText(source?.mediaId, 220),
      timestampConfidence: cleanText(source?.timestampConfidence, 40),
      transcriptProvenance: cleanText(source?.transcriptProvenance, 40),
      segments
    };
  }

  function normalizeLastStudySource(value, options = {}) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const requestedType = value.type || value.sourceType;
    const type = ["webpage", "video", "notes", "collection"].includes(requestedType)
      ? requestedType
      : "webpage";
    const url = canonicalUrl(value.url || value.canonicalUrl, type);
    const urlDomain = getUrlDomain(url);
    const suppliedDomain = cleanText(value.domain || value.hostname, 180)
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, "")
      .replace(/^\.+|\.+$/g, "");
    const title = cleanText(value.title, 180);
    const chapter = cleanText(value.chapter || value.chapterTitle || options.chapterTitle, 140);
    const chapterId = cleanText(value.chapterId || options.chapterId, 100);
    if (!title && !chapter && !url && !urlDomain && !suppliedDomain) return null;
    return {
      sourceId: cleanText(value.sourceId || value.id, 100),
      title: title || (type === "video" ? "Video lesson" : type === "notes" ? "Saved notes" : "Study source"),
      domain: urlDomain || suppliedDomain || (type === "notes" ? "Saved notes" : "No website link"),
      type,
      chapterId,
      chapter: chapter || "Untitled chapter",
      url,
      capturedAt: normalizeIsoDate(value.capturedAt || value.studiedAt, options.fallbackDate)
    };
  }

  function getUrlDomain(value) {
    try {
      return new URL(String(value || "")).hostname.toLowerCase().replace(/^www\./, "").slice(0, 180);
    } catch {
      return "";
    }
  }

  function normalizeSessionRecord(session, options = {}) {
    const rawScore = session?.score;
    const score = rawScore === null || rawScore === undefined || rawScore === "" ? NaN : Number(rawScore);
    const explicitKind = session?.kind || session?.itemKind;
    const itemKind = explicitKind === "note"
      ? "note"
      : explicitKind === "quiz"
        ? "quiz"
        : options.existing?.itemKind === "note" ? "note" : "quiz";
    const binding = session?.sourceBinding && typeof session.sourceBinding === "object"
      ? session.sourceBinding
      : {};
    const sourceType = cleanText(session?.sourceType || binding.sourceType || binding.type || options.existing?.sourceType, 40) || "webpage";
    const fallbackDate = options.fallbackDate ?? Date.now();
    const generatedAt = normalizeIsoDate(
      session?.generatedAt || session?.createdAt || options.existing?.generatedAt,
      fallbackDate
    );
    const normalizedScore = itemKind === "note"
      ? null
      : Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : null;
    const existingSubmittedAt = normalizeOptionalIsoDate(options.existing?.submittedAt);
    const suppliedSubmittedAt = normalizeOptionalIsoDate(session?.submittedAt);
    const legacySubmittedAt = Number(options.sourceSchemaVersion) < SCHEMA_VERSION && normalizedScore !== null
      ? normalizeIsoDate(session?.createdAt || generatedAt, generatedAt)
      : null;
    const submittedAt = normalizedScore === null
      ? null
      : suppliedSubmittedAt
        || existingSubmittedAt
        || legacySubmittedAt
        || normalizeIsoDate(options.submissionFallback, generatedAt);
    const artifactType = cleanText(session?.artifactType || options.existing?.artifactType, 40);
    const questionCount = Math.max(0, Math.min(50, Math.round(
      Array.isArray(session?.questions) ? session.questions.length : Number(session?.questionCount ?? options.existing?.questionCount) || 0
    )));
    const visualConceptCount = Math.max(0, Math.min(12, Math.round(
      Array.isArray(session?.visualLesson?.visualModel?.nodes)
        ? session.visualLesson.visualModel.nodes.length
        : Number(session?.visualConceptCount ?? options.existing?.visualConceptCount) || 0
    )));
    const hasVisualNote = Boolean(
      session?.hasVisualNote
      || options.existing?.hasVisualNote
      || artifactType === "study"
      || session?.visualLesson?.visualModel
    );
    return {
      id: cleanText(session?.id, 100) || makeId("session"),
      title: cleanText(session?.title || options.existing?.title, 180) || "Study session",
      sourceType,
      sourceId: cleanText(session?.sourceId || binding.sourceId || binding.id || options.existing?.sourceId, 100),
      sourceTitle: cleanText(session?.sourceTitle || binding.title || options.existing?.sourceTitle, 180),
      sourceFingerprint: cleanText(session?.sourceFingerprint || binding.fingerprint || options.existing?.sourceFingerprint, 100),
      sourceUrl: canonicalUrl(session?.sourceUrl || binding.url || options.existing?.sourceUrl, sourceType),
      generatedAt,
      submittedAt,
      // Kept as a read-only compatibility alias for 0.3.x popup/export code.
      createdAt: generatedAt,
      score: normalizedScore,
      weakTopics: uniqueText(session?.weakTopics ?? options.existing?.weakTopics, 12, 80),
      summary: uniqueText(session?.summary ?? options.existing?.summary, 6, 220),
      keyTerms: uniqueText(session?.terms ?? session?.keyTerms ?? options.existing?.keyTerms, 10, 80),
      itemKind,
      artifactType,
      hasVisualNote,
      questionCount,
      visualConceptCount,
      sourceRevisionHash: cleanText(session?.sourceRevisionHash, 120)
    };
  }

  function createJourney(title = "My Learning Journey", now = Date.now()) {
    const timestamp = normalizeIsoDate(now);
    return {
      schemaVersion: SCHEMA_VERSION,
      id: makeId("journey"),
      title: cleanText(title, 100) || "My Learning Journey",
      createdAt: timestamp,
      updatedAt: timestamp,
      revision: 0,
      chapters: [],
      events: [],
      summary: null,
      lastStudySource: null,
      appliedOperations: []
    };
  }

  function normalizeJourney(value) {
    const base = value && typeof value === "object"
      ? clone(value)
      : createJourney();
    const sourceSchemaVersion = Math.max(1, Math.round(Number(base.schemaVersion) || 1));
    const createdAt = normalizeIsoDate(base.createdAt);
    const chapters = (Array.isArray(base.chapters) ? base.chapters : [])
      .map((chapter) => {
        const chapterCreatedAt = normalizeIsoDate(chapter?.createdAt, createdAt);
        return {
          id: cleanText(chapter?.id, 100) || makeId("chapter"),
          title: cleanText(chapter?.title, 140) || "Untitled chapter",
          createdAt: chapterCreatedAt,
          updatedAt: normalizeIsoDate(chapter?.updatedAt, chapterCreatedAt),
          sources: (Array.isArray(chapter?.sources) ? chapter.sources : [])
            .map((source) => normalizeSource(source, chapterCreatedAt))
            .slice(0, MAX_SOURCES_PER_CHAPTER),
          sessions: (Array.isArray(chapter?.sessions) ? chapter.sessions : [])
            .map((session) => normalizeSessionRecord(session, {
              sourceSchemaVersion,
              fallbackDate: chapterCreatedAt,
              submissionFallback: session?.createdAt || chapterCreatedAt
            }))
            .slice(0, MAX_SESSIONS_PER_CHAPTER)
        };
      })
      .slice(0, MAX_CHAPTERS);
    const updatedAt = normalizeIsoDate(base.updatedAt, createdAt);
    const storedLastStudySource = normalizeLastStudySource(base.lastStudySource, { fallbackDate: updatedAt });
    const lastStudySource = refreshLastStudyChapter(storedLastStudySource, chapters)
      || inferLastStudySource(chapters, updatedAt);
    return {
      schemaVersion: SCHEMA_VERSION,
      id: cleanText(base.id, 100) || makeId("journey"),
      title: cleanText(base.title, 100) || "My Learning Journey",
      createdAt,
      updatedAt,
      revision: Math.max(0, Math.round(Number(base.revision) || 0)),
      chapters,
      events: normalizeEvents(base.events, createdAt),
      summary: normalizeSummary(base.summary),
      lastStudySource,
      appliedOperations: normalizeAppliedOperations(base.appliedOperations)
    };
  }

  function uniqueText(value, limit, maxLength) {
    const list = Array.isArray(value) ? value : [];
    const seen = new Set();
    return list.map((item) => cleanText(item, maxLength)).filter((item) => {
      const key = item.toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, limit);
  }

  function normalizeEvents(value, fallbackDate = Date.now()) {
    const events = Array.isArray(value) ? value : [];
    return events.filter((event) => event && typeof event === "object").map((event) => {
      const occurredAt = normalizeIsoDate(event.occurredAt, fallbackDate);
      return {
        id: cleanText(event.id, 120) || makeId("event"),
        type: cleanText(event.type, 40) || "captured",
        chapterId: cleanText(event.chapterId, 100),
        sourceId: cleanText(event.sourceId, 100),
        sessionId: cleanText(event.sessionId, 100),
        occurredAt,
        localDay: cleanText(event.localDay, 20) || localDayKey(new Date(occurredAt)),
        timeZone: cleanText(event.timeZone, 80) || getTimeZone(),
        score: event.score === null || event.score === undefined || event.score === ""
          ? null
          : Number.isFinite(Number(event.score))
            ? Math.max(0, Math.min(100, Math.round(Number(event.score))))
            : null,
        weakTopics: uniqueText(event.weakTopics, 12, 80)
      };
    }).slice(-MAX_EVENTS);
  }

  function normalizeSummary(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    return {
      generatedAt: normalizeIsoDate(value.generatedAt),
      generator: cleanText(value.generator, 40) || "local",
      range: ["today", "week", "month", "all"].includes(value.range) ? value.range : "all",
      sourceRevision: Math.max(0, Math.round(Number(value.sourceRevision) || 0)),
      evidence: cleanText(value.evidence, 500),
      overview: cleanText(value.overview, 800),
      progressHighlights: uniqueText(value.progressHighlights, 5, 240),
      recurringThemes: uniqueText(value.recurringThemes, 5, 240),
      knowledgeGaps: uniqueText(value.knowledgeGaps, 5, 240),
      nextSteps: uniqueText(value.nextSteps, 5, 240)
    };
  }

  function normalizeAppliedOperations(value) {
    const operations = Array.isArray(value) ? value : [];
    const seen = new Set();
    return operations.filter((entry) => entry && typeof entry === "object").map((entry) => ({
      opId: cleanText(entry.opId, 120),
      type: cleanText(entry.type, 60),
      payloadHash: cleanText(entry.payloadHash, 100),
      appliedRevision: Math.max(0, Math.round(Number(entry.appliedRevision) || 0)),
      appliedAt: normalizeIsoDate(entry.appliedAt),
      result: normalizeOperationResult(entry.result)
    })).filter((entry) => {
      if (!entry.opId || !entry.type || seen.has(entry.opId)) return false;
      seen.add(entry.opId);
      return true;
    }).slice(-MAX_APPLIED_OPERATIONS);
  }

  function normalizeOperationResult(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return {
      chapterId: cleanText(value.chapterId, 100),
      created: Boolean(value.created),
      sourceId: cleanText(value.sourceId, 100),
      sessionId: cleanText(value.sessionId, 100),
      duplicate: Boolean(value.duplicate),
      updated: Boolean(value.updated),
      sourceDuplicate: Boolean(value.sourceDuplicate),
      sourceUpdated: Boolean(value.sourceUpdated),
      removed: Boolean(value.removed)
    };
  }

  function refreshLastStudyChapter(value, chapters) {
    if (!value) return null;
    const chapter = chapters.find((item) => item.id === value.chapterId)
      || chapters.find((item) => item.title.toLowerCase() === value.chapter.toLowerCase());
    return chapter
      ? { ...value, chapterId: chapter.id, chapter: chapter.title }
      : value;
  }

  function inferLastStudySource(chapters, fallbackDate = Date.now()) {
    const candidates = [];
    chapters.forEach((chapter) => {
      chapter.sources.forEach((source) => {
        candidates.push(normalizeLastStudySource({
          ...source,
          sourceId: source.id,
          chapterId: chapter.id,
          chapter: chapter.title
        }, { fallbackDate }));
      });
      chapter.sessions.forEach((session) => {
        const matchingSource = chapter.sources.find((source) =>
          (session.sourceId && source.id === session.sourceId)
          || (session.sourceUrl && source.url === session.sourceUrl)
          || (session.sourceFingerprint && source.fingerprint === session.sourceFingerprint));
        candidates.push(normalizeLastStudySource({
          ...matchingSource,
          sourceId: matchingSource?.id || session.sourceId,
          title: matchingSource?.title || session.sourceTitle || session.title,
          type: matchingSource?.type || session.sourceType,
          url: matchingSource?.url || session.sourceUrl,
          chapterId: chapter.id,
          chapter: chapter.title,
          capturedAt: session.submittedAt || session.generatedAt
        }, { fallbackDate }));
      });
    });
    return candidates.filter(Boolean).sort((first, second) =>
      (dateTimestamp(second.capturedAt) || 0) - (dateTimestamp(first.capturedAt) || 0))[0] || null;
  }

  function setLastStudySource(journey, source, chapter, fallbackDate = Date.now()) {
    journey.lastStudySource = normalizeLastStudySource({
      ...source,
      sourceId: source?.sourceId || source?.id,
      chapterId: chapter?.id,
      chapter: chapter?.title
    }, {
      chapterId: chapter?.id,
      chapterTitle: chapter?.title,
      fallbackDate
    });
  }

  function findChapter(journey, chapterIdOrTitle) {
    const needle = cleanText(chapterIdOrTitle, 140).toLowerCase();
    return journey.chapters.find((chapter) => chapter.id === chapterIdOrTitle || chapter.title.toLowerCase() === needle) || null;
  }

  function ensureChapter(journey, title, now = Date.now()) {
    const safeTitle = cleanText(title, 140) || "Current chapter";
    let chapter = findChapter(journey, safeTitle);
    if (chapter) return chapter;
    if (journey.chapters.length >= MAX_CHAPTERS) {
      throw new Error(`A journey can contain up to ${MAX_CHAPTERS} chapters.`);
    }
    const timestamp = normalizeIsoDate(now);
    chapter = {
      id: makeId("chapter"),
      title: safeTitle,
      createdAt: timestamp,
      updatedAt: timestamp,
      sources: [],
      sessions: []
    };
    journey.chapters.push(chapter);
    return chapter;
  }

  function createChapter(value, title, now = Date.now()) {
    const journey = normalizeJourney(value);
    const safeTitle = cleanText(title, 140);
    if (!safeTitle) {
      throw new Error("Enter a chapter name before creating it.");
    }
    const existing = journey.chapters.find((chapter) => chapter.title.toLowerCase() === safeTitle.toLowerCase());
    if (existing) {
      return {
        journey,
        chapterId: existing.id,
        created: false,
        duplicate: true
      };
    }
    const chapter = ensureChapter(journey, safeTitle, now);
    touchJourney(journey, now);
    return {
      journey,
      chapterId: chapter.id,
      created: true,
      duplicate: false
    };
  }

  function touchJourney(journey, now = Date.now()) {
    journey.revision += 1;
    journey.updatedAt = normalizeIsoDate(now, journey.updatedAt);
    journey.summary = null;
  }

  function addEvent(journey, event, now = Date.now()) {
    const occurredAt = normalizeIsoDate(event?.occurredAt, now);
    const eventId = cleanText(event?.id, 120) || makeId("event");
    if (journey.events.some((item) => item?.id === eventId)) return;
    const date = new Date(occurredAt);
    journey.events.push({
      id: eventId,
      type: cleanText(event?.type, 40) || "captured",
      chapterId: cleanText(event?.chapterId, 100),
      sourceId: cleanText(event?.sourceId, 100),
      sessionId: cleanText(event?.sessionId, 100),
      occurredAt,
      localDay: cleanText(event?.localDay, 20) || localDayKey(date),
      timeZone: cleanText(event?.timeZone, 80) || getTimeZone(),
      score: event?.score === null || event?.score === undefined || event?.score === ""
        ? null
        : Number.isFinite(Number(event.score)) ? Math.round(Number(event.score)) : null,
      weakTopics: uniqueText(event?.weakTopics, 12, 80)
    });
    journey.events = journey.events.slice(-MAX_EVENTS);
  }

  function addSource(value, chapterTitle, source, now = Date.now()) {
    const journey = normalizeJourney(value);
    const chapter = ensureChapter(journey, chapterTitle, now);
    const normalized = normalizeSource(source, now);
    const duplicateIndex = chapter.sources.findIndex((item) => sourceIdentityMatches(item, normalized));
    if (duplicateIndex >= 0) {
      const duplicate = chapter.sources[duplicateIndex];
      if (duplicate.fingerprint === normalized.fingerprint) {
        return { journey, chapterId: chapter.id, sourceId: duplicate.id, duplicate: true, updated: false };
      }
      const refreshed = { ...normalized, id: duplicate.id };
      chapter.sources[duplicateIndex] = refreshed;
      chapter.updatedAt = normalizeIsoDate(now, chapter.updatedAt);
      setLastStudySource(journey, refreshed, chapter, now);
      addEvent(journey, { type: "recaptured", chapterId: chapter.id, sourceId: refreshed.id }, now);
      touchJourney(journey, now);
      return { journey, chapterId: chapter.id, sourceId: refreshed.id, duplicate: true, updated: true };
    }
    if (chapter.sources.length >= MAX_SOURCES_PER_CHAPTER) {
      throw new Error(`A chapter can contain up to ${MAX_SOURCES_PER_CHAPTER} saved sources.`);
    }
    chapter.sources.push(normalized);
    chapter.updatedAt = normalizeIsoDate(now, chapter.updatedAt);
    setLastStudySource(journey, normalized, chapter, now);
    addEvent(journey, { type: "captured", chapterId: chapter.id, sourceId: normalized.id }, now);
    touchJourney(journey, now);
    return { journey, chapterId: chapter.id, sourceId: normalized.id, duplicate: false, updated: false };
  }

  function sourceIdentityMatches(existing, incoming) {
    if (!existing || !incoming || existing.type !== incoming.type) return false;
    if (incoming.type === "webpage" && incoming.url) return existing.url === incoming.url;
    if (incoming.type === "notes") return existing.fingerprint === incoming.fingerprint;
    if (incoming.type === "video") {
      if (incoming.mediaId && existing.mediaId) return existing.mediaId === incoming.mediaId;
      return Boolean(incoming.url && existing.url === incoming.url && existing.fingerprint === incoming.fingerprint);
    }
    return Boolean(incoming.url && existing.url === incoming.url && existing.fingerprint === incoming.fingerprint);
  }

  function removeSource(value, chapterId, sourceId, now = Date.now()) {
    const journey = normalizeJourney(value);
    const chapter = findChapter(journey, chapterId);
    if (!chapter) return journey;
    const nextSources = chapter.sources.filter((source) => source.id !== sourceId);
    if (nextSources.length === chapter.sources.length) return journey;
    chapter.sources = nextSources;
    chapter.updatedAt = normalizeIsoDate(now, chapter.updatedAt);
    if (journey.lastStudySource?.sourceId === sourceId) {
      journey.lastStudySource = inferLastStudySource(journey.chapters, now);
    }
    touchJourney(journey, now);
    return journey;
  }

  function recordSession(value, chapterIdOrTitle, session, now = Date.now()) {
    const journey = normalizeJourney(value);
    const chapter = findChapter(journey, chapterIdOrTitle) || ensureChapter(journey, chapterIdOrTitle, now);
    const incomingId = cleanText(session?.id, 100);
    const existing = incomingId ? chapter.sessions.find((item) => item.id === incomingId) : null;
    const record = normalizeSessionRecord(session, {
      sourceSchemaVersion: SCHEMA_VERSION,
      existing,
      fallbackDate: existing?.generatedAt || now,
      submissionFallback: existing
        ? existing.score === null ? now : existing.submittedAt || now
        : session?.submittedAt || session?.createdAt || now
    });
    const existingIndex = chapter.sessions.findIndex((item) => item.id === record.id);
    if (existingIndex >= 0) chapter.sessions[existingIndex] = record;
    else chapter.sessions.unshift(record);
    chapter.sessions = chapter.sessions
      .sort((first, second) => sessionActivityTime(second) - sessionActivityTime(first))
      .slice(0, MAX_SESSIONS_PER_CHAPTER);
    chapter.updatedAt = normalizeIsoDate(now, chapter.updatedAt);
    const sourceBinding = session?.sourceBinding && typeof session.sourceBinding === "object"
      ? session.sourceBinding
      : {};
    const matchingSource = chapter.sources.find((source) =>
      (record.sourceId && source.id === record.sourceId)
      || (record.sourceUrl && source.url === record.sourceUrl)
      || (record.sourceFingerprint && source.fingerprint === record.sourceFingerprint));
    setLastStudySource(journey, matchingSource || {
      sourceId: record.sourceId,
      title: record.sourceTitle || sourceBinding.title || record.title,
      type: record.sourceType,
      url: record.sourceUrl,
      capturedAt: sourceBinding.capturedAt || record.submittedAt || record.generatedAt
    }, chapter, now);
    addEvent(journey, {
      id: `${record.id}:generated`,
      type: "generated",
      chapterId: chapter.id,
      sessionId: record.id,
      occurredAt: record.generatedAt
    }, now);
    if (record.submittedAt && record.score !== null) addEvent(journey, {
      id: `${record.id}:submitted:${record.submittedAt}`,
      type: "quiz_submitted",
      chapterId: chapter.id,
      sessionId: record.id,
      score: record.score,
      weakTopics: record.weakTopics,
      occurredAt: record.submittedAt
    }, now);
    touchJourney(journey, now);
    return { journey, chapterId: chapter.id, sessionId: record.id };
  }

  function sessionActivityTime(session) {
    return dateTimestamp(session?.submittedAt) ?? dateTimestamp(session?.generatedAt || session?.createdAt) ?? 0;
  }

  function getChapterStatus(chapter) {
    const sessions = Array.isArray(chapter?.sessions) ? chapter.sessions : [];
    if (!sessions.length) return chapter?.sources?.length ? "current" : "planned";
    const scored = sessions
      .filter((session) => session?.itemKind !== "note" && Number.isFinite(session?.score) && dateTimestamp(session?.submittedAt) !== null)
      .sort((first, second) => dateTimestamp(second.submittedAt) - dateTimestamp(first.submittedAt));
    if (!scored.length) return "current";
    const latestScore = scored[0].score;
    if (latestScore >= 80) return "completed";
    if (latestScore < 65) return "review";
    return "current";
  }

  function getMetrics(value, focusHistory = []) {
    const journey = normalizeJourney(value);
    const sessions = journey.chapters.flatMap((chapter) => chapter.sessions);
    const scores = sessions.map((session) => session.score).filter(Number.isFinite);
    const completed = journey.chapters.filter((chapter) => getChapterStatus(chapter) === "completed").length;
    const studyDays = new Set(journey.events.map((event) => event?.localDay).filter(Boolean)).size;
    const focusMinutes = (Array.isArray(focusHistory) ? focusHistory : [])
      .reduce((total, item) => total + Math.max(0,
        Number(item?.elapsedMinutes) || (Number(item?.elapsedMs) || 0) / 60000
      ), 0);
    return {
      chapterCount: journey.chapters.length,
      completed,
      review: journey.chapters.filter((chapter) => getChapterStatus(chapter) === "review").length,
      sourceCount: journey.chapters.reduce((total, chapter) => total + chapter.sources.length, 0),
      sessionCount: sessions.length,
      averageScore: scores.length ? Math.round(scores.reduce((total, score) => total + score, 0) / scores.length) : null,
      progressPercent: journey.chapters.length ? Math.round((completed / journey.chapters.length) * 100) : 0,
      studyDays,
      focusMinutes: Math.round(focusMinutes)
    };
  }

  function buildCollectionPayload(chapter, maxChars = 50000) {
    const sources = (Array.isArray(chapter?.sources) ? chapter.sources : [])
      .slice(0, MAX_SOURCES_PER_CHAPTER);
    const limit = Math.max(0, Math.floor(Number(maxChars) || 0));
    if (!sources.length) {
      return {
        sourceRevisionHash: sourceRevisionHash(chapter),
        totalSourceCount: 0,
        includedSourceCount: 0,
        condensed: false,
        sources: [],
        text: ""
      };
    }

    const prepared = sources.map((source, index) => {
      const body = source.type === "video" && source.segments?.length
        ? source.segments.map((segment) => `[${formatTimestamp(segment.startMs / 1000)}] ${segment.text}`).join("\n")
        : source.text;
      const id = cleanText(source.id, 100) || `source-${index + 1}`;
      const title = escapeSourceBlockText(cleanText(source.title, 180) || `Source ${index + 1}`);
      const url = escapeSourceBlockText(source.url || "saved notes");
      const header = `<<<SOURCE_BLOCK>>>\nSOURCE ${id}\nTYPE ${source.type || "webpage"}\nTITLE ${title}\nURL ${url}\nCONTENT_BEGIN\n`;
      const footer = "\nCONTENT_END\n<<<END_SOURCE_BLOCK>>>";
      return {
        source,
        id,
        body: escapeSourceBlockText(String(body || "").trim()),
        header,
        footer
      };
    });
    const separatorsSize = Math.max(0, prepared.length - 1) * 2;
    const structuralSize = prepared.reduce((total, item) => total + item.header.length + item.footer.length, separatorsSize);
    const minimumBodySize = prepared.length * 32;
    if (limit < structuralSize + minimumBodySize) {
      throw new Error(`Collection text limit must be at least ${structuralSize + minimumBodySize} characters to include every saved source safely.`);
    }

    const availableBody = limit - structuralSize;
    const baseBudget = Math.floor(availableBody / prepared.length);
    let remainder = availableBody % prepared.length;
    const blocks = [];
    const structuredSources = prepared.map((item) => {
      const budget = baseBudget + (remainder > 0 ? 1 : 0);
      remainder = Math.max(0, remainder - 1);
      const excerpt = item.body.slice(0, budget);
      blocks.push(`${item.header}${excerpt}${item.footer}`);
      return {
        id: item.id,
        type: item.source.type,
        title: item.source.title,
        url: item.source.url,
        fingerprint: item.source.fingerprint,
        excerpt,
        originalLength: item.body.length,
        includedLength: excerpt.length,
        condensed: excerpt.length < item.body.length
      };
    });
    const text = blocks.join("\n\n");
    return {
      sourceRevisionHash: sourceRevisionHash(chapter),
      totalSourceCount: sources.length,
      includedSourceCount: structuredSources.length,
      condensed: structuredSources.some((source) => source.condensed),
      sources: structuredSources,
      text
    };
  }

  function escapeSourceBlockText(value) {
    return String(value || "")
      .replace(/<<<SOURCE_BLOCK>>>/gi, "[source block marker removed]")
      .replace(/<<<END_SOURCE_BLOCK>>>/gi, "[end source block marker removed]")
      .replace(/\bCONTENT_(?:BEGIN|END)\b/gi, "CONTENT_MARKER")
      .replace(/(^|\n)SOURCE\s+/gi, "$1SOURCE_TEXT ");
  }

  function buildCollectionText(chapter, maxChars = 50000) {
    return buildCollectionPayload(chapter, maxChars).text;
  }

  function sourceRevisionHash(chapter) {
    const value = (chapter?.sources || []).map((source) => `${source.id}:${source.fingerprint}`).join("|");
    return fingerprint(value);
  }

  function summarize(value, options = {}) {
    const journey = normalizeJourney(value);
    const now = dateTimestamp(options.now) ?? Date.now();
    const rangeDays = { week: 7, month: 30, all: Infinity }[options.range] || Infinity;
    const cutoff = options.range === "today"
      ? new Date(now).setHours(0, 0, 0, 0)
      : rangeDays === Infinity ? 0 : now - rangeDays * 86400000;
    const sessions = journey.chapters.flatMap((chapter) => chapter.sessions.map((session) => ({ chapter, session })))
      .filter(({ session }) => sessionActivityTime(session) >= cutoff && sessionActivityTime(session) <= now);
    const chapters = uniqueText(sessions.map(({ chapter }) => chapter.title), 12, 140);
    const scores = sessions.map(({ session }) => session.score).filter(Number.isFinite);
    const weakCounts = new Map();
    sessions.forEach(({ session }) => session.weakTopics.forEach((topic) => {
      weakCounts.set(topic, (weakCounts.get(topic) || 0) + 1);
    }));
    const weakAreas = [...weakCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([topic]) => topic);
    const completed = chapters.filter((title) => getChapterStatus(findChapter(journey, title)) === "completed");
    const average = scores.length ? Math.round(scores.reduce((total, score) => total + score, 0) / scores.length) : null;
    const evidence = `Based on ${sessions.length} saved ${sessions.length === 1 ? "session" : "sessions"} across ${chapters.length} ${chapters.length === 1 ? "chapter" : "chapters"}.`;
    return {
      generatedAt: new Date(now).toISOString(),
      generator: "local",
      range: options.range || "all",
      evidence,
      overview: sessions.length
        ? average == null
          ? `You have started ${chapters.length} ${chapters.length === 1 ? "chapter" : "chapters"}; submit a quiz when you want activity to become mastery evidence.`
          : `Across ${chapters.length} ${chapters.length === 1 ? "chapter" : "chapters"}, your average submitted quiz score is ${average}%.`
        : journey.chapters.length
          ? `Current chapter: ${journey.chapters.at(-1).title}. No saved learning session yet.`
          : "No chapters yet. Create a visual note from a page, note, or video to begin your learning route.",
      progressHighlights: completed.length
        ? completed.map((title) => `${title} reached the completed threshold.`).slice(0, 4)
        : chapters.slice(0, 4).map((title) => `You added learning evidence to ${title}.`),
      recurringThemes: chapters.slice(0, 5),
      knowledgeGaps: weakAreas.length ? weakAreas : ["No repeated weak topic has been recorded yet."],
      nextSteps: weakAreas.length
        ? weakAreas.slice(0, 3).map((topic) => `Review ${topic}, then retake a focused quiz.`)
        : chapters.length
          ? [`Continue ${chapters[chapters.length - 1]}.`, "Submit a quiz to turn activity into mastery evidence."]
          : journey.chapters.length
            ? [`Create a visual note for ${journey.chapters.at(-1).title}.`, "Save the note to record learning evidence."]
            : ["Open a page, note, or video and create a visual note.", "Save it to create your first chapter."]
    };
  }

  function parseTimestamp(value) {
    const match = String(value || "").match(/(?:^|\[|\s)(?:(\d{1,2}):)?(\d{1,2}):(\d{2})(?:\]|\s|$)/);
    if (!match) return null;
    const hours = Number(match[1] || 0);
    const minutes = Number(match[2]);
    const seconds = Number(match[3]);
    if (minutes > 59 || seconds > 59) return null;
    return hours * 3600 + minutes * 60 + seconds;
  }

  function formatTimestamp(value) {
    const total = Math.max(0, Math.round(Number(value) || 0));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    return hours
      ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      : `${minutes}:${String(seconds).padStart(2, "0")}`;
  }

  function parseTimestampedTranscript(value) {
    const lines = String(value || "").split(/\r?\n/);
    const segments = [];
    for (const line of lines) {
      const startSeconds = parseTimestamp(line);
      if (startSeconds == null) continue;
      const text = cleanText(line.replace(/^\s*\[?(?:(?:\d{1,2}:)?\d{1,2}:\d{2})\]?\s*[-–—:]?\s*/, ""), 500);
      if (!text) continue;
      segments.push({
        id: `seg-${String(segments.length + 1).padStart(4, "0")}`,
        startMs: startSeconds * 1000,
        endMs: startSeconds * 1000 + 5000,
        text
      });
    }
    return normalizeTranscriptSegments(segments.map((segment, index, list) => ({
      ...segment,
      endMs: list[index + 1]?.startMs || segment.endMs
    })));
  }

  function findBestSegment(segments, value) {
    const normalized = normalizeTranscriptSegments(segments);
    if (!normalized.length) return null;
    const explicitTime = parseTimestamp(value);
    if (explicitTime != null) {
      return normalized.reduce((best, segment) => Math.abs(segment.startMs - explicitTime * 1000) < Math.abs(best.startMs - explicitTime * 1000) ? segment : best);
    }
    const tokens = new Set(cleanText(value, 1000).toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length > 3));
    if (!tokens.size) return normalized[0];
    let best = normalized[0];
    let bestScore = -1;
    for (const segment of normalized) {
      const segmentTokens = new Set(segment.text.toLowerCase().split(/[^a-z0-9]+/));
      const score = [...tokens].reduce((total, token) => total + (segmentTokens.has(token) ? 1 : 0), 0);
      if (score > bestScore) {
        best = segment;
        bestScore = score;
      }
    }
    return best;
  }

  function attachVideoProvenance(session, segments, sourceId = "video-source") {
    const result = clone(session || {});
    const normalized = normalizeTranscriptSegments(segments);
    const attach = (item) => {
      if (!item || !normalized.length) return item;
      const byId = normalized.find((segment) => segment.id === item.sourceSegmentId);
      const segment = byId || findBestSegment(normalized, item.sourceText || item.sourceAnchor || item.explanation || item.detail || item.prompt);
      if (!segment) return item;
      return {
        ...item,
        sourceSegmentId: segment.id,
        sourceTimestamp: Math.round(segment.startMs / 1000),
        sourceRef: {
          sourceId,
          segmentId: segment.id,
          startMs: segment.startMs,
          endMs: segment.endMs,
          quote: segment.text
        }
      };
    };
    result.questions = (Array.isArray(result.questions) ? result.questions : []).map(attach);
    if (result.visualLesson?.visualModel?.nodes) {
      result.visualLesson.visualModel.nodes = result.visualLesson.visualModel.nodes.map(attach);
    }
    return result;
  }

  function attachCollectionProvenance(session, sources, combinedText) {
    const result = clone(session || {});
    const normalizedSources = (Array.isArray(sources) ? sources : []).map(normalizeSource).slice(0, MAX_SOURCES_PER_CHAPTER);
    const resolve = (item) => {
      if (!item || !normalizedSources.length) return item;
      const requestedId = cleanText(item.sourceId || item.sourceRef?.sourceId, 100);
      let source = normalizedSources.find((candidate) => candidate.id === requestedId) || null;
      if (requestedId && !source) {
        throw new Error(`Generated output referenced an unknown saved source ID: ${requestedId}`);
      }
      if (!source) {
        const tokens = cleanText(item.sourceText || item.sourceAnchor || item.explanation || item.detail || item.prompt, 1000)
          .toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length > 3);
        let bestScore = 0;
        for (const candidate of normalizedSources) {
          const marker = `SOURCE ${candidate.id}`;
          const start = String(combinedText || "").indexOf(marker);
          if (start < 0) continue;
          const next = String(combinedText || "").indexOf("\nSOURCE ", start + marker.length);
          const block = String(combinedText || "").slice(start, next < 0 ? undefined : next).toLowerCase();
          const score = tokens.reduce((total, token) => total + (block.includes(token) ? 1 : 0), 0);
          if (score > bestScore) {
            source = candidate;
            bestScore = score;
          }
        }
      }
      if (!source) {
        throw new Error("Generated output could not be grounded to a saved source.");
      }
      return {
        ...item,
        sourceId: source.id,
        sourceRef: {
          sourceId: source.id,
          type: source.type,
          title: source.title,
          url: source.url,
          quote: cleanText(item.sourceText || item.sourceAnchor || item.detail, 600)
        }
      };
    };
    result.questions = (Array.isArray(result.questions) ? result.questions : []).map(resolve);
    if (result.visualLesson?.visualModel?.nodes) {
      result.visualLesson.visualModel.nodes = result.visualLesson.visualModel.nodes.map(resolve);
    }
    result.sources = normalizedSources.map(({ text, segments, ...source }) => source);
    return result;
  }

  function localDayKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function getTimeZone() {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
      return "UTC";
    }
  }

  root.ExamCramJourney = Object.freeze({
    SCHEMA_VERSION,
    MAX_CHAPTERS,
    MAX_SOURCES_PER_CHAPTER,
    MAX_SESSIONS_PER_CHAPTER,
    MAX_APPLIED_OPERATIONS,
    createJourney,
    normalizeJourney,
    normalizeSource,
    normalizeLastStudySource,
    normalizeTranscriptSegments,
    canonicalUrl,
    fingerprint,
    findChapter,
    createChapter,
    addSource,
    removeSource,
    recordSession,
    getChapterStatus,
    getMetrics,
    buildCollectionPayload,
    buildCollectionText,
    sourceRevisionHash,
    summarize,
    parseTimestamp,
    formatTimestamp,
    parseTimestampedTranscript,
    findBestSegment,
    attachVideoProvenance,
    attachCollectionProvenance,
    localDayKey,
    normalizeIsoDate,
    normalizeOptionalIsoDate,
    sessionActivityTime
  });
})(typeof globalThis !== "undefined" ? globalThis : window);
