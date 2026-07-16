(function initJourneyUtils(root) {
  "use strict";

  const SCHEMA_VERSION = 3;
  const MAX_CHAPTERS = 24;
  const MAX_SOURCES_PER_CHAPTER = 8;
  const MAX_SESSIONS_PER_CHAPTER = 30;
  const MAX_SOURCE_TEXT = 14000;
  const MAX_TRANSCRIPT_SEGMENTS = 500;
  const MAX_TRANSCRIPT_TEXT = 24000;
  const MAX_EVENTS = 500;
  const MAX_APPLIED_OPERATIONS = 120;
  const MAX_LEARNING_ATTEMPTS = 20;

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

  function createLearningMemory() {
    return {
      concepts: [],
      attempts: [],
      recordedAttemptIds: []
    };
  }

  function normalizePositiveInteger(value, maximum = 10000) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric < 1) return 0;
    return Math.min(maximum, Math.round(numeric));
  }

  function normalizeAttemptSourceRef(value, sourcePage = 0) {
    const sourceRef = value && typeof value === "object" && !Array.isArray(value) ? value : {};
    const startMs = Number.isFinite(Number(sourceRef.startMs))
      ? Math.max(0, Math.round(Number(sourceRef.startMs)))
      : null;
    const endMs = Number.isFinite(Number(sourceRef.endMs)) && Number(sourceRef.endMs) >= Number(startMs || 0)
      ? Math.round(Number(sourceRef.endMs))
      : null;
    const normalizedSourcePage = normalizePositiveInteger(
      sourceRef.sourcePage || sourceRef.pageNumber || sourceRef.page || sourcePage
    );
    const sourceType = cleanText(sourceRef.sourceType || sourceRef.type, 40);
    const normalized = {
      sourceType,
      documentType: cleanText(sourceRef.documentType, 40),
      sourceId: cleanText(sourceRef.sourceId || sourceRef.id, 100),
      sourceFingerprint: cleanText(sourceRef.sourceFingerprint, 120),
      segmentId: cleanText(sourceRef.segmentId || sourceRef.sourceSegmentId, 100),
      title: cleanText(sourceRef.title, 180),
      url: canonicalUrl(sourceRef.url, sourceType === "video" ? "video" : "webpage"),
      quote: cleanText(sourceRef.quote || sourceRef.sourceText, 600),
      startMs,
      endMs,
      sourcePage: normalizedSourcePage
    };
    return normalized.sourceId || normalized.sourceFingerprint || normalized.segmentId || normalized.title || normalized.url
      || normalized.quote || normalized.startMs !== null || normalized.sourcePage
      ? normalized
      : null;
  }

  function normalizeQuestionAttempt(value, defaults = {}) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    defaults = defaults && typeof defaults === "object" && !Array.isArray(defaults) ? defaults : {};
    const attemptId = cleanText(value.attemptId || defaults.attemptId, 120);
    const quizId = cleanText(value.quizId || defaults.quizId, 100);
    const questionId = cleanText(value.questionId || defaults.questionId, 120);
    const noteId = cleanText(value.noteId || defaults.noteId, 100);
    const primaryConceptId = cleanText(value.primaryConceptId || defaults.primaryConceptId, 120);
    const correctAnswer = cleanText(value.correctAnswer, 300);
    const studentAnswer = cleanText(value.studentAnswer, 300);
    const suppliedResult = cleanText(value.result, 20).toLowerCase();
    const result = ["correct", "incorrect"].includes(suppliedResult)
      ? suppliedResult
      : correctAnswer || studentAnswer
        ? correctAnswer === studentAnswer ? "correct" : "incorrect"
        : "";
    const answeredAt = normalizeOptionalIsoDate(
      value.answeredAt || defaults.answeredAt || defaults.submittedAt || defaults.completedAt
    );
    if (!attemptId || !quizId || !questionId || !noteId || !primaryConceptId || !result || !answeredAt) return null;

    const sourcePage = normalizePositiveInteger(
      value.sourcePage || value.pageNumber || value.sourceRef?.sourcePage || value.sourceRef?.pageNumber || defaults.sourcePage
    );
    const attemptTypeValue = cleanText(value.attemptType || defaults.attemptType, 20).toLowerCase();
    const attemptType = attemptTypeValue === "recovery" ? "recovery" : "normal";
    const relatedConceptIds = uniqueText(value.relatedConceptIds, 12, 120)
      .filter((conceptId) => conceptId !== primaryConceptId);
    return {
      attemptId,
      quizId,
      questionId,
      noteId,
      sourceFingerprint: cleanText(
        value.sourceFingerprint
        || value.sourceRef?.sourceFingerprint
        || defaults.sourceFingerprint
        || defaults.sourceRef?.sourceFingerprint,
        120
      ),
      primaryConceptId,
      relatedConceptIds,
      conceptLabel: cleanText(value.conceptLabel || defaults.conceptLabel, 120) || primaryConceptId,
      sourceRef: normalizeAttemptSourceRef(value.sourceRef || defaults.sourceRef, sourcePage),
      sourcePage,
      correctAnswer,
      studentAnswer,
      result,
      answeredAt,
      attemptType,
      targetConceptId: cleanText(value.targetConceptId || defaults.targetConceptId, 120)
    };
  }

  function conceptMemoryKey(noteId, conceptId) {
    return `${noteId}\u0000${conceptId}`;
  }

  function normalizeConceptMemory(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const noteId = cleanText(value.noteId, 100);
    const conceptId = cleanText(value.conceptId || value.primaryConceptId, 120);
    if (!noteId || !conceptId) return null;
    const timesTested = Math.max(0, Math.min(1000000, Math.round(Number(value.timesTested) || 0)));
    const timesWrong = Math.max(0, Math.min(timesTested, Math.round(Number(value.timesWrong) || 0)));
    const state = ["weak", "recovering", "stable"].includes(value.state) ? value.state : timesWrong ? "weak" : "stable";
    return {
      noteId,
      sourceFingerprint: cleanText(value.sourceFingerprint, 120),
      conceptId,
      conceptLabel: cleanText(value.conceptLabel, 120) || conceptId,
      timesTested,
      timesWrong,
      state,
      lastAttemptAt: normalizeOptionalIsoDate(value.lastAttemptAt)
    };
  }

  function normalizeLearningMemory(value) {
    const memory = value && typeof value === "object" && !Array.isArray(value) ? value : {};
    const rawConcepts = Array.isArray(memory.concepts)
      ? memory.concepts
      : memory.concepts && typeof memory.concepts === "object"
        ? Object.values(memory.concepts)
        : [];
    const conceptMap = new Map();
    rawConcepts.map(normalizeConceptMemory).filter(Boolean).forEach((concept) => {
      const key = conceptMemoryKey(concept.noteId, concept.conceptId);
      const existing = conceptMap.get(key);
      if (!existing) {
        conceptMap.set(key, concept);
        return;
      }
      const existingTime = dateTimestamp(existing.lastAttemptAt) ?? -1;
      const incomingTime = dateTimestamp(concept.lastAttemptAt) ?? -1;
      const latest = incomingTime >= existingTime ? concept : existing;
      const mergedTimesTested = Math.max(existing.timesTested, concept.timesTested);
      conceptMap.set(key, {
        ...latest,
        timesTested: mergedTimesTested,
        timesWrong: Math.min(mergedTimesTested, Math.max(existing.timesWrong, concept.timesWrong))
      });
    });
    const concepts = [...conceptMap.values()]
      .sort((first, second) => (dateTimestamp(second.lastAttemptAt) ?? -1) - (dateTimestamp(first.lastAttemptAt) ?? -1)
        || first.noteId.localeCompare(second.noteId)
        || first.conceptId.localeCompare(second.conceptId));

    const attemptIds = new Set();
    const attempts = (Array.isArray(memory.attempts) ? memory.attempts : [])
      .map((attempt, index) => ({ attempt: normalizeQuestionAttempt(attempt), index }))
      .filter(({ attempt }) => attempt && !attemptIds.has(attempt.attemptId) && attemptIds.add(attempt.attemptId))
      .sort((first, second) => (dateTimestamp(first.attempt.answeredAt) ?? 0) - (dateTimestamp(second.attempt.answeredAt) ?? 0)
        || first.index - second.index)
      .slice(-MAX_LEARNING_ATTEMPTS)
      .map(({ attempt }) => attempt);
    const rawRecordedAttemptIds = [
      ...(Array.isArray(memory.recordedAttemptIds) ? memory.recordedAttemptIds : []),
      ...attempts.map((attempt) => attempt.attemptId)
    ];
    const recordedAttemptIdSet = new Set();
    const recordedAttemptIds = [];
    for (let index = rawRecordedAttemptIds.length - 1; index >= 0; index -= 1) {
      const attemptId = cleanText(rawRecordedAttemptIds[index], 120);
      if (!attemptId || recordedAttemptIdSet.has(attemptId)) continue;
      recordedAttemptIdSet.add(attemptId);
      recordedAttemptIds.push(attemptId);
    }
    recordedAttemptIds.reverse();
    return { concepts, attempts, recordedAttemptIds };
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
    const preserveCompletedResult = itemKind === "quiz"
      && !Number.isFinite(score)
      && Number.isFinite(options.existing?.score)
      && normalizeOptionalIsoDate(options.existing?.submittedAt);
    const normalizedScore = itemKind === "note"
      ? null
      : Number.isFinite(score)
        ? Math.max(0, Math.min(100, Math.round(score)))
        : preserveCompletedResult ? options.existing.score : null;
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
      weakTopics: uniqueText(
        preserveCompletedResult ? options.existing?.weakTopics : session?.weakTopics ?? options.existing?.weakTopics,
        12,
        80
      ),
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
      learningMemory: createLearningMemory(),
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
      learningMemory: normalizeLearningMemory(base.learningMemory),
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
      removed: Boolean(value.removed),
      recordedAttemptCount: Math.max(0, Math.round(Number(value.recordedAttemptCount) || 0)),
      duplicateAttemptCount: Math.max(0, Math.round(Number(value.duplicateAttemptCount) || 0)),
      clearedAttemptCount: Math.max(0, Math.round(Number(value.clearedAttemptCount) || 0)),
      clearedConceptCount: Math.max(0, Math.round(Number(value.clearedConceptCount) || 0))
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
    if (incoming.type === "webpage" && incoming.url) {
      return existing.url === incoming.url && existing.fingerprint === incoming.fingerprint;
    }
    if (incoming.type === "notes") return existing.fingerprint === incoming.fingerprint;
    if (incoming.type === "video") {
      if (incoming.mediaId && existing.mediaId) {
        return existing.mediaId === incoming.mediaId && existing.fingerprint === incoming.fingerprint;
      }
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

  function recordQuestionAttempts(value, attempts, quizResult = {}) {
    const journey = normalizeJourney(value);
    const memory = normalizeLearningMemory(journey.learningMemory);
    const metadata = quizResult && typeof quizResult === "object" && !Array.isArray(quizResult) ? quizResult : {};
    const defaults = {
      quizId: metadata.quizId || metadata.id,
      noteId: metadata.noteId || metadata.artifactId || metadata.id,
      sourceFingerprint: metadata.sourceFingerprint || metadata.sourceBinding?.fingerprint,
      answeredAt: metadata.answeredAt || metadata.submittedAt || metadata.completedAt,
      attemptType: metadata.attemptType,
      targetConceptId: metadata.targetConceptId
    };
    const normalizedCandidates = (Array.isArray(attempts) ? attempts : [])
      .map((attempt) => normalizeQuestionAttempt(attempt, defaults))
      .filter(Boolean);
    const batchIds = new Set();
    const normalizedAttempts = normalizedCandidates
      .filter((attempt) => !batchIds.has(attempt.attemptId) && batchIds.add(attempt.attemptId));
    const recordedIds = new Set(memory.recordedAttemptIds);
    const freshAttempts = normalizedAttempts.filter((attempt) => !recordedIds.has(attempt.attemptId));
    const duplicateCount = normalizedCandidates.length - freshAttempts.length;
    if (!freshAttempts.length) {
      return { journey, recordedCount: 0, duplicateCount };
    }

    const conceptMap = new Map(memory.concepts.map((concept) => [
      conceptMemoryKey(concept.noteId, concept.conceptId),
      { ...concept }
    ]));
    const priorConcepts = new Map([...conceptMap.entries()].map(([key, concept]) => [key, { ...concept }]));
    const batchByConcept = new Map();
    freshAttempts.forEach((attempt) => {
      const key = conceptMemoryKey(attempt.noteId, attempt.primaryConceptId);
      const record = conceptMap.get(key) || {
        noteId: attempt.noteId,
        sourceFingerprint: attempt.sourceFingerprint,
        conceptId: attempt.primaryConceptId,
        conceptLabel: attempt.conceptLabel || attempt.primaryConceptId,
        timesTested: 0,
        timesWrong: 0,
        state: "stable",
        lastAttemptAt: null
      };
      record.sourceFingerprint = attempt.sourceFingerprint || record.sourceFingerprint;
      record.conceptLabel = attempt.conceptLabel || record.conceptLabel || record.conceptId;
      record.timesTested = Math.min(1000000, record.timesTested + 1);
      if (attempt.result === "incorrect") {
        record.timesWrong = Math.min(record.timesTested, record.timesWrong + 1);
        record.state = "weak";
      }
      if ((dateTimestamp(attempt.answeredAt) ?? 0) >= (dateTimestamp(record.lastAttemptAt) ?? -1)) {
        record.lastAttemptAt = attempt.answeredAt;
      }
      conceptMap.set(key, record);
      const group = batchByConcept.get(key) || [];
      group.push(attempt);
      batchByConcept.set(key, group);
    });

    const correctCount = freshAttempts.filter((attempt) => attempt.result === "correct").length;
    const isSingleQuizBatch = new Set(freshAttempts.map((attempt) => attempt.quizId)).size === 1;
    const suppliedScore = Number(metadata.score);
    const overallScore = Number.isFinite(suppliedScore)
      ? Math.max(0, Math.min(100, suppliedScore))
      : (correctCount / freshAttempts.length) * 100;
    const batchTimestamp = Math.max(...freshAttempts.map((attempt) => dateTimestamp(attempt.answeredAt) ?? 0));
    const suppliedTargetCount = Number(
      metadata.expectedTargetCount
      ?? metadata.targetQuestionCount
      ?? metadata.recoveryTargetQuestionCount
      ?? metadata.recoveryComposition?.targetQuestionCount
    );
    const expectedTargetCount = Number.isInteger(suppliedTargetCount)
      && suppliedTargetCount >= 1
      && suppliedTargetCount <= 5
      ? suppliedTargetCount
      : 3;
    const recoveryTargets = new Map();
    freshAttempts
      .filter((attempt) => attempt.attemptType === "recovery" && attempt.targetConceptId)
      .forEach((attempt) => recoveryTargets.set(
        conceptMemoryKey(attempt.noteId, attempt.targetConceptId),
        { noteId: attempt.noteId, targetConceptId: attempt.targetConceptId }
      ));

    recoveryTargets.forEach(({ noteId, targetConceptId }, key) => {
      const targetAttempts = freshAttempts.filter((attempt) => attempt.noteId === noteId
        && attempt.primaryConceptId === targetConceptId
        && attempt.attemptType === "recovery"
        && attempt.targetConceptId === targetConceptId);
      const qualifies = isSingleQuizBatch
        && targetAttempts.length === expectedTargetCount
        && targetAttempts.every((attempt) => attempt.result === "correct")
        && freshAttempts.length === 5
        && correctCount >= 4
        && overallScore >= 80;
      const record = conceptMap.get(key);
      if (record && qualifies) record.state = "recovering";
    });

    batchByConcept.forEach((conceptAttempts, key) => {
      const prior = priorConcepts.get(key);
      const record = conceptMap.get(key);
      if (!prior || !record || prior.state !== "recovering") return;
      const conceptBatchTimestamp = Math.max(
        ...conceptAttempts.map((attempt) => dateTimestamp(attempt.answeredAt) ?? 0)
      );
      const laterThanRecovery = conceptBatchTimestamp > (dateTimestamp(prior.lastAttemptAt) ?? -1);
      const conceptSucceeded = conceptAttempts.length > 0
        && conceptAttempts.every((attempt) => attempt.result === "correct");
      if (isSingleQuizBatch && laterThanRecovery && conceptSucceeded && overallScore >= 80) record.state = "stable";
    });

    journey.learningMemory = normalizeLearningMemory({
      concepts: [...conceptMap.values()],
      attempts: [...memory.attempts, ...freshAttempts],
      recordedAttemptIds: [...memory.recordedAttemptIds, ...freshAttempts.map((attempt) => attempt.attemptId)]
    });
    touchJourney(journey, metadata.submittedAt || metadata.answeredAt || batchTimestamp);
    return {
      journey,
      recordedCount: freshAttempts.length,
      duplicateCount
    };
  }

  function rankWeakConcepts(value, options = {}) {
    const journey = normalizeJourney(value);
    const memory = normalizeLearningMemory(journey.learningMemory);
    options = options && typeof options === "object" && !Array.isArray(options) ? options : {};
    const noteId = cleanText(options.noteId, 100);
    const sourceFingerprint = cleanText(options.sourceFingerprint, 120);
    const currentAttempts = Array.isArray(options.currentAttempts)
      ? options.currentAttempts
        .map((attempt) => normalizeQuestionAttempt(attempt, {
          quizId: options.quizId,
          noteId,
          sourceFingerprint,
          answeredAt: options.answeredAt || options.submittedAt
        }))
        .filter(Boolean)
      : memory.attempts;
    const conceptMap = new Map(memory.concepts.map((concept) => [
      conceptMemoryKey(concept.noteId, concept.conceptId),
      concept
    ]));
    const persistedAttemptIds = new Set(memory.recordedAttemptIds);
    const attemptGroups = new Map();
    currentAttempts.forEach((attempt) => {
      if (noteId && attempt.noteId !== noteId) return;
      if (sourceFingerprint && attempt.sourceFingerprint !== sourceFingerprint) return;
      const key = conceptMemoryKey(attempt.noteId, attempt.primaryConceptId);
      const group = attemptGroups.get(key) || {
        noteId: attempt.noteId,
        sourceFingerprint: attempt.sourceFingerprint,
        conceptId: attempt.primaryConceptId,
        conceptLabel: attempt.conceptLabel || attempt.primaryConceptId,
        tested: 0,
        wrong: 0,
        persistedWrong: 0,
        lastMissAt: null
      };
      group.tested += 1;
      if (attempt.result === "incorrect") {
        group.wrong += 1;
        if (persistedAttemptIds.has(attempt.attemptId)) group.persistedWrong += 1;
        if ((dateTimestamp(attempt.answeredAt) ?? 0) >= (dateTimestamp(group.lastMissAt) ?? -1)) {
          group.lastMissAt = attempt.answeredAt;
        }
      }
      attemptGroups.set(key, group);
    });

    const ranked = [...attemptGroups.values()]
      .filter((group) => group.wrong > 0)
      .map((group) => {
        const concept = conceptMap.get(conceptMemoryKey(group.noteId, group.conceptId));
        const timesTested = concept?.timesTested || 0;
        const timesWrong = concept?.timesWrong || 0;
        return {
          noteId: group.noteId,
          sourceFingerprint: group.sourceFingerprint || concept?.sourceFingerprint || "",
          conceptId: group.conceptId,
          primaryConceptId: group.conceptId,
          conceptLabel: group.conceptLabel || concept?.conceptLabel || group.conceptId,
          state: "weak",
          wrongCount: group.wrong,
          errorRate: group.tested ? group.wrong / group.tested : 0,
          historicalMisses: Math.max(0, timesWrong - group.persistedWrong),
          timesTested,
          timesWrong,
          lastMissAt: group.lastMissAt,
          lastAttemptAt: concept?.lastAttemptAt || group.lastMissAt
        };
      })
      .sort((first, second) => second.wrongCount - first.wrongCount
        || second.errorRate - first.errorRate
        || second.historicalMisses - first.historicalMisses
        || (dateTimestamp(second.lastMissAt || second.lastAttemptAt) ?? 0)
          - (dateTimestamp(first.lastMissAt || first.lastAttemptAt) ?? 0)
        || first.conceptLabel.localeCompare(second.conceptLabel)
        || first.conceptId.localeCompare(second.conceptId));
    const limit = Math.max(1, Math.min(50, Math.round(Number(options.limit) || 10)));
    return ranked.slice(0, limit);
  }

  function clearLearningMemory(value, now = Date.now()) {
    const journey = normalizeJourney(value);
    const memory = normalizeLearningMemory(journey.learningMemory);
    const clearedAttemptCount = memory.attempts.length;
    const clearedConceptCount = memory.concepts.length;
    const clearedRecordedAttemptIdCount = memory.recordedAttemptIds.length;
    if (clearedAttemptCount || clearedConceptCount || clearedRecordedAttemptIdCount) {
      journey.learningMemory = createLearningMemory();
      touchJourney(journey, now);
    }
    return {
      journey,
      clearedAttemptCount,
      clearedConceptCount
    };
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

  function artifactBelongsToCollectionChapter(artifact, chapter, sessionIds) {
    if (!artifact || typeof artifact !== "object" || !chapter) return false;
    const boundChapterId = cleanText(
      artifact.journeyChapterId || artifact.sourceBinding?.chapterId,
      100
    );
    if (boundChapterId) return boundChapterId === chapter.id;
    const artifactId = cleanText(artifact.id, 100);
    return Boolean(artifactId && sessionIds.has(artifactId));
  }

  function getChapterVisualNoteArtifacts(chapter, artifacts) {
    const sessionIds = new Set((Array.isArray(chapter?.sessions) ? chapter.sessions : [])
      .map((session) => cleanText(session?.id, 100))
      .filter(Boolean));
    const seenNoteIds = new Set();
    return (Array.isArray(artifacts) ? artifacts : [])
      .filter((artifact) => artifactBelongsToCollectionChapter(artifact, chapter, sessionIds))
      .filter((artifact) => artifact?.visualLesson?.visualModel && typeof artifact.visualLesson.visualModel === "object")
      .sort((first, second) => sessionActivityTime(second) - sessionActivityTime(first))
      .filter((artifact) => {
        const noteId = cleanText(artifact.noteId || artifact.id, 100);
        if (!noteId || seenNoteIds.has(noteId)) return false;
        seenNoteIds.add(noteId);
        return true;
      });
  }

  function sourceSnapshotsFromVisualArtifact(artifact) {
    const binding = artifact?.sourceBinding && typeof artifact.sourceBinding === "object"
      ? artifact.sourceBinding
      : {};
    const sourceType = cleanText(binding.sourceType || binding.type || artifact?.sourceType, 40) || "webpage";
    if (sourceType === "collection") {
      return [
        ...(Array.isArray(binding.collectionSources) ? binding.collectionSources : []),
        ...(Array.isArray(artifact?.sources) ? artifact.sources : [])
      ].map((source) => ({
        ...source,
        text: source?.text || source?.excerpt || "",
        segments: source?.segments || source?.videoSegments || []
      }));
    }

    const videoSegments = binding.videoSegments || artifact?.videoSegments || [];
    const rawText = String(binding.rawText || artifact?.rawText || "").trim();
    if (!rawText && !videoSegments.length) return [];
    return [{
      id: binding.sourceId || artifact?.sourceId || `source-${cleanText(artifact?.id, 70) || "visual-note"}`,
      type: sourceType,
      documentType: binding.documentType || artifact?.documentType || "",
      pageCount: binding.pageCount || artifact?.pageCount || 0,
      title: binding.title || artifact?.sourceTitle || artifact?.title || "Saved visual note source",
      url: binding.url || artifact?.sourceUrl || "",
      fingerprint: binding.fingerprint || artifact?.sourceFingerprint || fingerprint(rawText || JSON.stringify(videoSegments)),
      capturedAt: binding.capturedAt || artifact?.generatedAt || artifact?.createdAt,
      durationMs: binding.durationMs || artifact?.durationMs || 0,
      mediaId: binding.mediaId || artifact?.videoMediaId || "",
      timestampConfidence: binding.timestampConfidence || artifact?.timestampConfidence || "",
      transcriptProvenance: binding.transcriptProvenance || artifact?.transcriptProvenance || "",
      text: rawText,
      segments: videoSegments
    }];
  }

  function collectionSnapshotIdentity(source) {
    const type = cleanText(source?.type, 40) || "webpage";
    const url = canonicalUrl(source?.url || source?.canonicalUrl, type);
    const mediaId = cleanText(source?.mediaId, 220);
    const fingerprintValue = cleanText(source?.fingerprint, 100)
      || fingerprint(source?.text || JSON.stringify(source?.segments || []));
    return `${type}|${url}|${mediaId}|${fingerprintValue}`;
  }

  function normalizeDistinctCollectionSnapshots(sources) {
    const snapshots = [];
    const identityIndexes = new Map();
    for (const [index, source] of (Array.isArray(sources) ? sources : []).entries()) {
      if (!source || typeof source !== "object") continue;
      const sourcePage = normalizePositiveInteger(source.sourcePage || source.pageNumber);
      const normalized = {
        ...normalizeSource({
          ...source,
          id: cleanText(source.id || source.sourceId, 100) || `source-snapshot-${index + 1}`,
          text: source.text || source.excerpt || "",
          segments: source.segments || source.videoSegments || []
        }),
        sourcePage,
        pageNumber: sourcePage
      };
      const identity = collectionSnapshotIdentity(normalized);
      const existingIndex = identityIndexes.get(identity);
      if (existingIndex !== undefined) {
        const existing = snapshots[existingIndex];
        const existingSize = existing.text.length + existing.segments.reduce((total, segment) => total + segment.text.length, 0);
        const candidateSize = normalized.text.length + normalized.segments.reduce((total, segment) => total + segment.text.length, 0);
        if (candidateSize > existingSize) snapshots[existingIndex] = { ...normalized, id: existing.id };
        continue;
      }
      identityIndexes.set(identity, snapshots.length);
      snapshots.push(normalized);
    }

    const usedIds = new Set();
    return snapshots.map((source, index) => {
      let id = cleanText(source.id, 100) || `source-snapshot-${index + 1}`;
      if (usedIds.has(id)) {
        const suffix = cleanText(source.fingerprint, 12) || String(index + 1);
        const base = id.slice(0, Math.max(1, 99 - suffix.length));
        id = `${base}-${suffix}`;
        let attempt = 2;
        while (usedIds.has(id)) {
          const numberedSuffix = `${suffix}-${attempt}`;
          id = `${base.slice(0, Math.max(1, 99 - numberedSuffix.length))}-${numberedSuffix}`;
          attempt += 1;
        }
      }
      usedIds.add(id);
      return { ...source, id };
    });
  }

  function buildChapterCollectionPayload(chapter, artifacts, maxChars = 50000) {
    const visualArtifacts = getChapterVisualNoteArtifacts(chapter, artifacts);
    const logicalNoteIdByArtifactId = new Map(visualArtifacts.map((artifact) => [
      cleanText(artifact.id, 100),
      cleanText(artifact.noteId || artifact.id, 100)
    ]));
    const visualNoteIds = new Set(visualArtifacts
      .map((artifact) => cleanText(artifact.noteId || artifact.id, 100))
      .filter(Boolean));
    for (const session of Array.isArray(chapter?.sessions) ? chapter.sessions : []) {
      if (!session?.hasVisualNote) continue;
      const sessionId = cleanText(session.id, 100);
      const logicalNoteId = logicalNoteIdByArtifactId.get(sessionId)
        || cleanText(session.noteId || session.id, 100);
      if (logicalNoteId) visualNoteIds.add(logicalNoteId);
    }
    const artifactSnapshots = visualArtifacts.flatMap(sourceSnapshotsFromVisualArtifact);
    const sources = normalizeDistinctCollectionSnapshots([
      ...artifactSnapshots,
      ...(Array.isArray(chapter?.sources) ? chapter.sources : [])
    ]);
    if (sources.length > MAX_SOURCES_PER_CHAPTER) {
      throw new Error(`This chapter has ${sources.length} distinct saved source revisions. A combined visual note supports up to ${MAX_SOURCES_PER_CHAPTER}; remove an unneeded source revision first.`);
    }
    const compositionChapter = { ...chapter, sources };
    const payload = buildCollectionPayload(compositionChapter, maxChars);
    return {
      ...payload,
      // Concurrency protection must still compare the live Journey source set,
      // while compositionRevisionHash describes the immutable note snapshots.
      sourceRevisionHash: sourceRevisionHash(chapter),
      compositionRevisionHash: payload.sourceRevisionHash,
      visualNoteCount: visualNoteIds.size,
      availableVisualNoteCount: visualArtifacts.length,
      sourceSnapshotCount: sources.length
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
      const videoSegments = source.type === "video"
        ? normalizeTranscriptSegments(source.segments || source.videoSegments)
        : [];
      const body = source.type === "video" && videoSegments.length
        ? videoSegments.map((segment) => `[${formatTimestamp(segment.startMs / 1000)}] ${segment.text}`).join("\n")
        : source.text;
      const id = cleanText(source.id, 100) || `source-${index + 1}`;
      const title = escapeSourceBlockText(cleanText(source.title, 180) || `Source ${index + 1}`);
      const url = escapeSourceBlockText(source.url || "saved notes");
      const header = `<<<SOURCE_BLOCK>>>\nSOURCE ${id}\nTYPE ${source.type || "webpage"}\nTITLE ${title}\nURL ${url}\nCONTENT_BEGIN\n`;
      const footer = "\nCONTENT_END\n<<<END_SOURCE_BLOCK>>>";
      return {
        source: { ...source, segments: videoSegments },
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
      const sourcePage = normalizePositiveInteger(item.source.sourcePage || item.source.pageNumber);
      const segments = item.source.type === "video"
        ? normalizeTranscriptSegments(item.source.segments || item.source.videoSegments)
        : [];
      blocks.push(`${item.header}${excerpt}${item.footer}`);
      return {
        id: item.id,
        type: item.source.type,
        documentType: item.source.documentType === "pdf" ? "pdf" : item.source.documentType === "html" ? "html" : "",
        pageCount: Math.max(0, Math.min(10000, Math.round(Number(item.source.pageCount) || 0))),
        title: item.source.title,
        url: item.source.url,
        fingerprint: item.source.fingerprint,
        sourcePage,
        pageNumber: sourcePage,
        durationMs: Math.max(0, Math.round(Number(item.source.durationMs) || 0)),
        mediaId: cleanText(item.source.mediaId, 220),
        segments,
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
    const normalizedSources = (Array.isArray(sources) ? sources : []).map((source) => {
      const normalized = normalizeSource({
        ...source,
        text: source?.text || source?.excerpt,
        segments: source?.segments || source?.videoSegments
      });
      const sourcePage = normalizePositiveInteger(source?.sourcePage || source?.pageNumber);
      return { ...normalized, sourcePage, pageNumber: sourcePage };
    }).slice(0, MAX_SOURCES_PER_CHAPTER);
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
      const existingRef = item.sourceRef && typeof item.sourceRef === "object" && !Array.isArray(item.sourceRef)
        ? item.sourceRef
        : {};
      const sourcePage = source.documentType === "pdf"
        ? normalizePositiveInteger(
          item.sourcePage
          || item.pageNumber
          || existingRef.sourcePage
          || existingRef.pageNumber
          || source.sourcePage
          || source.pageNumber
        )
        : 0;
      const requestedSegmentId = cleanText(item.sourceSegmentId || existingRef.segmentId, 100);
      const segment = source.type === "video"
        ? source.segments.find((candidate) => candidate.id === requestedSegmentId)
          || findBestSegment(source.segments, item.sourceText || item.sourceAnchor || item.explanation || item.detail || item.prompt)
        : null;
      const suppliedStartMs = Number(existingRef.startMs ?? Number(item.sourceTimestamp) * 1000);
      const startMs = segment
        ? segment.startMs
        : source.type === "video" && Number.isFinite(suppliedStartMs)
          ? Math.max(0, Math.round(suppliedStartMs))
          : null;
      const suppliedEndMs = Number(existingRef.endMs);
      const endMs = segment
        ? segment.endMs
        : startMs !== null && Number.isFinite(suppliedEndMs) && suppliedEndMs >= startMs
          ? Math.round(suppliedEndMs)
          : null;
      const segmentId = cleanText(segment?.id || requestedSegmentId, 100);
      const quote = cleanText(
        segment?.text || existingRef.quote || item.sourceText || item.sourceAnchor || item.detail,
        600
      );
      return {
        ...item,
        sourceId: source.id,
        sourcePage,
        pageNumber: sourcePage,
        ...(source.type === "video" && startMs !== null ? {
          sourceSegmentId: segmentId,
          sourceTimestamp: Math.round(startMs / 1000)
        } : {}),
        sourceRef: {
          ...existingRef,
          sourceId: source.id,
          type: source.type,
          sourceType: source.type,
          documentType: source.documentType,
          sourceFingerprint: source.fingerprint,
          title: source.title,
          url: source.url,
          quote,
          pageCount: source.pageCount,
          sourcePage,
          pageNumber: sourcePage,
          ...(source.type === "video" && startMs !== null ? {
            segmentId,
            startMs,
            endMs
          } : {})
        }
      };
    };
    result.questions = (Array.isArray(result.questions) ? result.questions : []).map(resolve);
    if (result.visualLesson?.visualModel?.nodes) {
      result.visualLesson.visualModel.nodes = result.visualLesson.visualModel.nodes.map(resolve);
    }
    result.sources = normalizedSources.map(({ text, ...source }) => source);
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
    MAX_LEARNING_ATTEMPTS,
    createLearningMemory,
    createJourney,
    normalizeJourney,
    normalizeSource,
    normalizeLastStudySource,
    normalizeTranscriptSegments,
    normalizeQuestionAttempt,
    normalizeLearningMemory,
    canonicalUrl,
    fingerprint,
    findChapter,
    createChapter,
    addSource,
    removeSource,
    recordSession,
    recordQuestionAttempts,
    rankWeakConcepts,
    clearLearningMemory,
    getChapterStatus,
    getMetrics,
    getChapterVisualNoteArtifacts,
    buildChapterCollectionPayload,
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
