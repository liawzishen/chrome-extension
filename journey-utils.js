(function initJourneyUtils(root) {
  "use strict";

  const SCHEMA_VERSION = 3;
  const MAX_CHAPTERS = 24;
  const MAX_SOURCES_PER_CHAPTER = 8;
  const MAX_SESSIONS_PER_CHAPTER = 30;
  const MAX_DISPLAYED_ARTIFACTS_PER_CHAPTER = 8;
  const MAX_SOURCE_TEXT = 14000;
  const MAX_TRANSCRIPT_SEGMENTS = 500;
  const MAX_TRANSCRIPT_TEXT = 24000;
  const MAX_EVENTS = 500;
  const MAX_APPLIED_OPERATIONS = 120;
  const MAX_LEARNING_ATTEMPTS = 20;
  const DAY_MS = 86400000;

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

  function normalizeStudyGoal(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const suppliedDaysPerWeek = Math.round(Number(value.daysPerWeek));
    const daysPerWeek = Number.isFinite(suppliedDaysPerWeek)
      ? Math.max(1, Math.min(7, suppliedDaysPerWeek))
      : 5;
    const allowedDailyMinutes = [10, 20, 30, 45, 60];
    const suppliedDailyMinutes = Number(value.dailyMinutes);
    const dailyMinutes = Number.isFinite(suppliedDailyMinutes)
      ? allowedDailyMinutes.reduce((nearest, candidate) => (
        Math.abs(candidate - suppliedDailyMinutes) < Math.abs(nearest - suppliedDailyMinutes)
          ? candidate
          : nearest
      ))
      : 20;
    const seenChapterIds = new Set();
    const chapterIds = (Array.isArray(value.chapterIds) ? value.chapterIds : [])
      .map((chapterId) => cleanText(chapterId, 100))
      .filter((chapterId) => {
        if (!chapterId || seenChapterIds.has(chapterId)) return false;
        seenChapterIds.add(chapterId);
        return true;
      })
      .slice(0, MAX_CHAPTERS);
    const suppliedTargetDate = cleanText(value.targetDate, 10);
    const targetTimestamp = /^\d{4}-\d{2}-\d{2}$/.test(suppliedTargetDate)
      ? Date.parse(`${suppliedTargetDate}T00:00:00.000Z`)
      : NaN;
    const targetDate = Number.isFinite(targetTimestamp)
      && new Date(targetTimestamp).toISOString().slice(0, 10) === suppliedTargetDate
      ? suppliedTargetDate
      : null;
    const createdAt = normalizeIsoDate(value.createdAt);
    return {
      chapterIds,
      daysPerWeek,
      dailyMinutes,
      targetDate,
      label: cleanText(value.label, 60),
      createdAt,
      updatedAt: normalizeIsoDate(value.updatedAt, createdAt)
    };
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

  function defaultConceptStrength(state) {
    if (state === "stable") return 80;
    if (state === "recovering") return 60;
    return 35;
  }

  function normalizeConceptStrength(value, state) {
    const numeric = Number(value);
    const fallback = defaultConceptStrength(state);
    return Math.max(0, Math.min(100, Math.round(Number.isFinite(numeric) ? numeric : fallback)));
  }

  function normalizeIntervalDays(value) {
    const numeric = Number(value);
    return Math.max(1, Math.min(60, Number.isFinite(numeric) ? numeric : 1));
  }

  function normalizeConceptMemory(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const noteId = cleanText(value.noteId, 100);
    const conceptId = cleanText(value.conceptId || value.primaryConceptId, 120);
    if (!noteId || !conceptId) return null;
    const timesTested = Math.max(0, Math.min(1000000, Math.round(Number(value.timesTested) || 0)));
    const timesWrong = Math.max(0, Math.min(timesTested, Math.round(Number(value.timesWrong) || 0)));
    const state = ["weak", "recovering", "stable"].includes(value.state) ? value.state : timesWrong ? "weak" : "stable";
    const strength = normalizeConceptStrength(value.strength, state);
    const intervalDays = normalizeIntervalDays(value.intervalDays);
    const lastAttemptAt = normalizeOptionalIsoDate(value.lastAttemptAt);
    const nextReviewAt = normalizeOptionalIsoDate(value.nextReviewAt)
      || (lastAttemptAt ? new Date(dateTimestamp(lastAttemptAt) + intervalDays * DAY_MS).toISOString() : null);
    return {
      noteId,
      sourceFingerprint: cleanText(value.sourceFingerprint, 120),
      conceptId,
      conceptLabel: cleanText(value.conceptLabel, 120) || conceptId,
      timesTested,
      timesWrong,
      state,
      lastAttemptAt,
      strength,
      intervalDays,
      nextReviewAt
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

  function normalizeChapterTitleProposal(title, existingTitles = []) {
    const safeTitle = cleanText(title, 60) || "New Chapter";
    const existing = (Array.isArray(existingTitles) ? existingTitles : [])
      .map((item) => cleanText(item, 140))
      .find((item) => item.toLowerCase() === safeTitle.toLowerCase());
    if (existing) return existing;
    return safeTitle.replace(/\S+/g, (word) => word.charAt(0).toUpperCase() + word.slice(1));
  }

  function planBulkFiling(assignments, value) {
    const emptyPlan = {
      rows: [],
      newChapterTitles: [],
      blockedCount: 0,
      valid: true
    };
    if (!Array.isArray(assignments)
      || !value
      || typeof value !== "object"
      || Array.isArray(value)) return emptyPlan;

    const journey = normalizeJourney(value);
    const capacities = new Map();
    const titlesByKey = new Map();
    const existingKeys = new Set();
    journey.chapters.forEach((chapter) => {
      const key = chapter.title.toLowerCase();
      if (titlesByKey.has(key)) return;
      titlesByKey.set(key, chapter.title);
      existingKeys.add(key);
      capacities.set(key, Math.max(0, MAX_SOURCES_PER_CHAPTER - chapter.sources.length));
    });
    const newChapterTitles = [];
    const canCreateChapter = () => journey.chapters.length + newChapterTitles.length < MAX_CHAPTERS;
    const reserveTitle = (title) => {
      const key = title.toLowerCase();
      if (capacities.has(key)) {
        if (capacities.get(key) <= 0) return null;
        capacities.set(key, capacities.get(key) - 1);
        return {
          title: titlesByKey.get(key),
          willCreateChapter: !existingKeys.has(key)
        };
      }
      if (!canCreateChapter()) return null;
      titlesByKey.set(key, title);
      capacities.set(key, MAX_SOURCES_PER_CHAPTER - 1);
      newChapterTitles.push(title);
      return { title, willCreateChapter: true };
    };
    const reserveSpillover = (baseTitle) => {
      if (!canCreateChapter()) {
        const prefix = `${baseTitle.toLowerCase()} `;
        const candidate = [...titlesByKey.entries()]
          .map(([key, title]) => {
            if (!key.startsWith(prefix)) return null;
            const suffix = key.slice(prefix.length);
            if (!/^\d+$/.test(suffix) || Number(suffix) < 2 || capacities.get(key) <= 0) return null;
            return { suffix: Number(suffix), title };
          })
          .filter(Boolean)
          .sort((first, second) => first.suffix - second.suffix)[0];
        return candidate ? reserveTitle(candidate.title) : null;
      }
      let suffix = 2;
      while (true) {
        const title = normalizeChapterTitleProposal(
          `${baseTitle} ${suffix}`,
          [...titlesByKey.values()]
        );
        const key = title.toLowerCase();
        if (!capacities.has(key) || capacities.get(key) > 0) return reserveTitle(title);
        suffix += 1;
      }
    };

    const rows = assignments.map((assignment) => {
      const fileId = cleanText(assignment?.fileId, 100);
      const numericConfidence = Number(assignment?.confidence);
      const confidence = Math.max(0, Math.min(1, Number.isFinite(numericConfidence) ? numericConfidence : 0));
      if (assignment?.skipped) {
        return {
          fileId,
          finalChapterTitle: "",
          willCreateChapter: false,
          spillover: false,
          blocked: false,
          skipped: true,
          confidence
        };
      }

      const requestedTitle = normalizeChapterTitleProposal(
        assignment?.chapterTitle,
        [...titlesByKey.values()]
      );
      let reserved = reserveTitle(requestedTitle);
      let spillover = false;
      if (!reserved) {
        reserved = reserveSpillover(requestedTitle);
        spillover = Boolean(reserved);
      }
      return {
        fileId,
        finalChapterTitle: reserved?.title || "",
        willCreateChapter: Boolean(reserved?.willCreateChapter),
        spillover,
        blocked: !reserved,
        skipped: false,
        confidence
      };
    });
    const blockedCount = rows.filter((row) => row.blocked).length;
    return {
      rows,
      newChapterTitles,
      blockedCount,
      valid: blockedCount === 0
    };
  }

  function classifySourceTokens(value, limit = Infinity) {
    const tokens = String(value || "").toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
    return [...new Set(tokens.filter((token) => token.length >= 4))].slice(0, limit);
  }

  const CLASSIFY_BOILERPLATE_LINE = /^(skip to (main )?content|accept (all )?cookies?|cookie (settings|policy|notice)|all rights reserved|privacy policy|terms of (service|use)|table of contents|copyright\b.*|page \d+( of \d+)?|\d+)$/i;

  function buildClassificationExcerpt(text, maxLength = 3000) {
    const rawLines = String(text || "").split(/\n+/)
      .map((line) => line.replace(/\s+/g, " ").trim())
      .filter(Boolean);
    const lineCounts = new Map();
    rawLines.forEach((line) => lineCounts.set(line, (lineCounts.get(line) || 0) + 1));
    const seenRepeated = new Set();
    const keptLines = rawLines.filter((line) => {
      if (CLASSIFY_BOILERPLATE_LINE.test(line)) return false;
      if ((lineCounts.get(line) || 0) >= 3) {
        if (seenRepeated.has(line)) return false;
        seenRepeated.add(line);
      }
      return true;
    });
    const cleaned = keptLines.join(" ").replace(/\s+/g, " ").trim();
    if (cleaned.length <= maxLength) return cleaned;
    const headLength = Math.ceil(maxLength * 0.5);
    const sliceLength = Math.floor(maxLength * 0.25);
    const midStart = Math.floor(cleaned.length * 0.45);
    const lateStart = Math.floor(cleaned.length * 0.75);
    return [
      cleaned.slice(0, headLength),
      cleaned.slice(midStart, midStart + sliceLength),
      cleaned.slice(lateStart, lateStart + sliceLength)
    ].join(" … ");
  }

  function buildImportTokenCounts(excerpt) {
    const counts = new Map();
    (String(excerpt || "").toLowerCase().match(/[\p{L}\p{N}]+/gu) || [])
      .filter((token) => token.length >= 4)
      .slice(0, 600)
      .forEach((token) => counts.set(token, (counts.get(token) || 0) + 1));
    return counts;
  }

  function importTokenSimilarity(first, second, ignored) {
    let shared = 0;
    let firstTotal = 0;
    let secondTotal = 0;
    first.forEach((count, token) => {
      if (ignored.has(token)) return;
      firstTotal += count;
      if (second.has(token)) shared += Math.min(count, second.get(token));
    });
    second.forEach((count, token) => {
      if (!ignored.has(token)) secondTotal += count;
    });
    const denominator = Math.min(firstTotal, secondTotal);
    return denominator > 0 ? shared / denominator : 0;
  }

  function clusterImportExcerpts(files, options = {}) {
    const threshold = Number.isFinite(Number(options.threshold)) ? Number(options.threshold) : 0.18;
    const entries = (Array.isArray(files) ? files : [])
      .map((file) => ({
        fileId: cleanText(file?.fileId, 100),
        counts: buildImportTokenCounts(file?.excerpt)
      }))
      .filter((entry) => entry.fileId);
    const presence = new Map();
    entries.forEach((entry) => {
      [...entry.counts.keys()].forEach((token) => presence.set(token, (presence.get(token) || 0) + 1));
    });
    const boilerplate = new Set([...presence.entries()]
      .filter(([, count]) => entries.length >= 3 && count >= entries.length * 0.7)
      .map(([token]) => token));

    const clusters = entries.map((entry) => ({ fileIds: [entry.fileId], members: [entry] }));
    const clusterSimilarity = (firstCluster, secondCluster) => {
      let best = 0;
      firstCluster.members.forEach((first) => secondCluster.members.forEach((second) => {
        best = Math.max(best, importTokenSimilarity(first.counts, second.counts, boilerplate));
      }));
      return best;
    };
    let merged = true;
    while (merged && clusters.length > 1) {
      merged = false;
      let bestPair = null;
      for (let firstIndex = 0; firstIndex < clusters.length; firstIndex += 1) {
        for (let secondIndex = firstIndex + 1; secondIndex < clusters.length; secondIndex += 1) {
          const similarity = clusterSimilarity(clusters[firstIndex], clusters[secondIndex]);
          if (!bestPair || similarity > bestPair.similarity) {
            bestPair = { firstIndex, secondIndex, similarity };
          }
        }
      }
      if (bestPair && bestPair.similarity >= threshold) {
        const absorbed = clusters.splice(bestPair.secondIndex, 1)[0];
        clusters[bestPair.firstIndex].fileIds.push(...absorbed.fileIds);
        clusters[bestPair.firstIndex].members.push(...absorbed.members);
        merged = true;
      }
    }

    return clusters.map((cluster) => {
      const totals = new Map();
      cluster.members.forEach((member) => member.counts.forEach((count, token) => {
        if (!boilerplate.has(token)) totals.set(token, (totals.get(token) || 0) + count);
      }));
      const ranked = [...totals.entries()]
        .sort((first, second) => second[1] - first[1] || first[0].localeCompare(second[0]));
      const codePattern = /^[a-z]{2,4}\d{4}$/;
      const codeCounts = new Map();
      cluster.members.forEach((member) => {
        const seen = new Set();
        member.counts.forEach((count, token) => {
          if (codePattern.test(token) && !seen.has(token)) {
            seen.add(token);
            codeCounts.set(token, (codeCounts.get(token) || 0) + 1);
          }
        });
      });
      const unitCode = [...codeCounts.entries()]
        .filter(([, count]) => count >= Math.ceil(cluster.members.length / 2))
        .sort((first, second) => second[1] - first[1])[0]?.[0] || "";
      const topicWords = ranked
        .filter(([token]) => !codePattern.test(token))
        .slice(0, 3)
        .map(([token]) => token.charAt(0).toUpperCase() + token.slice(1));
      const title = [unitCode ? unitCode.toUpperCase() : "", ...topicWords]
        .filter(Boolean)
        .join(" ")
        .slice(0, 60);
      return {
        fileIds: cluster.fileIds,
        keywords: ranked.slice(0, 12).map(([token]) => token),
        title: title || "New Chapter"
      };
    });
  }

  function buildChapterClassificationHints(value, options = {}) {
    const journey = normalizeJourney(value);
    const maxKeywords = Math.max(3, Math.min(12, Math.round(Number(options.maxKeywords) || 10)));
    return journey.chapters.map((chapter) => {
      const titleTokens = new Set(classifySourceTokens(chapter.title));
      const counts = new Map();
      const addTokens = (text, weight) => {
        classifySourceTokens(String(text || "").slice(0, 2000)).forEach((token) => {
          if (titleTokens.has(token)) return;
          counts.set(token, (counts.get(token) || 0) + weight);
        });
      };
      chapter.sources.forEach((source) => {
        addTokens(source.title, 3);
        addTokens(source.text, 1);
      });
      chapter.sessions.forEach((session) => addTokens(session.title, 2));
      const keywords = [...counts.entries()]
        .sort((first, second) => second[1] - first[1] || first[0].localeCompare(second[0]))
        .slice(0, maxKeywords)
        .map(([token]) => token);
      return { title: chapter.title, keywords };
    });
  }

  function classifySourcesLocally(files, value) {
    if (!Array.isArray(files)) return [];
    const journey = value && typeof value === "object" && !Array.isArray(value)
      ? normalizeJourney(value)
      : normalizeJourney({});
    const existingTitles = journey.chapters.map((chapter) => chapter.title);
    const chapterMatches = journey.chapters.map((chapter) => ({
      chapter,
      titleTokens: new Set(classifySourceTokens(chapter.title)),
      sourceTitleTokens: new Set(classifySourceTokens(
        chapter.sources.map((source) => source.title).join(" ")
      )),
      textTokens: new Set(classifySourceTokens([
        ...chapter.sources.map((source) => String(source.text || "").slice(0, 2000)),
        ...chapter.sessions.map((session) => session.title)
      ].join(" "), 80))
    }));

    const assignmentsByFileId = new Map();
    const readableFiles = files.filter((file) => !file?.skipped);
    clusterImportExcerpts(readableFiles).forEach((cluster) => {
      let bestMatch = null;
      chapterMatches.forEach((candidate) => {
        let score = 0;
        cluster.keywords.forEach((token) => {
          if (candidate.titleTokens.has(token)) score += 3;
          else if (candidate.sourceTitleTokens.has(token)) score += 2;
          else if (candidate.textTokens.has(token)) score += 1;
        });
        if (!bestMatch || score > bestMatch.score) bestMatch = { chapter: candidate.chapter, score };
      });
      if (bestMatch?.score >= 4) {
        cluster.fileIds.forEach((fileId) => assignmentsByFileId.set(fileId, {
          fileId,
          chapterTitle: bestMatch.chapter.title,
          isNewChapter: false,
          confidence: 0.4,
          reason: `Local match: shared terms with ${bestMatch.chapter.title}`
        }));
        return;
      }
      const chapterTitle = normalizeChapterTitleProposal(cluster.title, existingTitles);
      const clusterSize = cluster.fileIds.length;
      const confidence = Math.min(0.5, 0.3 + 0.04 * (clusterSize - 1));
      const reason = clusterSize > 1
        ? `Grouped with ${clusterSize - 1} related ${clusterSize === 2 ? "file" : "files"} by shared content`
        : "No close match — named from the file's content";
      cluster.fileIds.forEach((fileId) => assignmentsByFileId.set(fileId, {
        fileId,
        chapterTitle,
        isNewChapter: true,
        confidence,
        reason
      }));
    });

    return files
      .map((file) => assignmentsByFileId.get(cleanText(file?.fileId, 100)))
      .filter(Boolean);
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
      removedConceptCount: Math.max(0, Math.round(Number(value.removedConceptCount) || 0)),
      renamed: Boolean(value.renamed),
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
    if (incoming.type === "webpage") {
      if (incoming.url) return existing.url === incoming.url && existing.fingerprint === incoming.fingerprint;
      return !existing.url && existing.fingerprint === incoming.fingerprint;
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

  function removeSession(value, chapterId, sessionId, now = Date.now()) {
    const journey = normalizeJourney(value);
    const chapter = findChapter(journey, chapterId);
    const safeSessionId = cleanText(sessionId, 100);
    if (!chapter || !safeSessionId) return { journey, removed: false, removedConceptCount: 0 };
    const nextSessions = chapter.sessions.filter((session) => session.id !== safeSessionId);
    if (nextSessions.length === chapter.sessions.length) {
      return { journey, removed: false, removedConceptCount: 0 };
    }
    chapter.sessions = nextSessions;
    chapter.updatedAt = normalizeIsoDate(now, chapter.updatedAt);
    const memory = normalizeLearningMemory(journey.learningMemory);
    const keptConcepts = memory.concepts.filter((concept) => concept.noteId !== safeSessionId);
    const removedConceptCount = memory.concepts.length - keptConcepts.length;
    journey.learningMemory = {
      ...memory,
      concepts: keptConcepts,
      attempts: memory.attempts.filter((attempt) => attempt.noteId !== safeSessionId)
    };
    touchJourney(journey, now);
    return { journey, removed: true, removedConceptCount };
  }

  function renameSession(value, chapterId, sessionId, title, now = Date.now()) {
    const journey = normalizeJourney(value);
    const chapter = findChapter(journey, chapterId);
    const safeSessionId = cleanText(sessionId, 100);
    const safeTitle = cleanText(title, 180);
    const session = chapter?.sessions.find((item) => item.id === safeSessionId);
    if (!session || !safeTitle || session.title === safeTitle) {
      return { journey, renamed: false };
    }
    session.title = safeTitle;
    chapter.updatedAt = normalizeIsoDate(now, chapter.updatedAt);
    touchJourney(journey, now);
    return { journey, renamed: true };
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
        lastAttemptAt: null,
        strength: 50,
        intervalDays: 1,
        nextReviewAt: null
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

    batchByConcept.forEach((conceptAttempts, key) => {
      const record = conceptMap.get(key);
      if (!record || !conceptAttempts.length) return;
      const answeredAtMs = Math.max(
        ...conceptAttempts.map((attempt) => dateTimestamp(attempt.answeredAt) ?? 0)
      );
      const allCorrect = conceptAttempts.every((attempt) => attempt.result === "correct");
      if (allCorrect) {
        const nextReviewTimestamp = dateTimestamp(record.nextReviewAt);
        const wasDue = nextReviewTimestamp !== null && answeredAtMs >= nextReviewTimestamp;
        record.strength = Math.min(100, Math.round(record.strength + 20 + (wasDue ? 5 : 0)));
        record.intervalDays = Math.min(60, record.intervalDays * 2);
        record.nextReviewAt = new Date(answeredAtMs + record.intervalDays * DAY_MS).toISOString();
      } else {
        record.strength = Math.max(0, Math.round(record.strength - 30));
        record.intervalDays = 1;
        record.nextReviewAt = new Date(answeredAtMs + DAY_MS).toISOString();
      }
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

  function effectiveStrength(concept, now = Date.now()) {
    const state = ["weak", "recovering", "stable"].includes(concept?.state) ? concept.state : "stable";
    const strength = normalizeConceptStrength(concept?.strength, state);
    const lastAttemptAt = dateTimestamp(concept?.lastAttemptAt);
    if (lastAttemptAt === null) return strength;
    const nowTimestamp = dateTimestamp(now) ?? lastAttemptAt;
    const intervalDays = normalizeIntervalDays(concept?.intervalDays);
    const daysSince = (nowTimestamp - lastAttemptAt) / DAY_MS;
    const overdueDays = Math.max(0, daysSince - intervalDays);
    const factor = Math.pow(0.5, overdueDays / Math.max(1, intervalDays));
    return Math.max(0, Math.min(strength, Math.round(strength * factor)));
  }

  function getDueConcepts(value, options = {}) {
    const journey = normalizeJourney(value);
    const memory = normalizeLearningMemory(journey.learningMemory);
    options = options && typeof options === "object" && !Array.isArray(options) ? options : {};
    const now = options.now ?? Date.now();
    const nowTimestamp = dateTimestamp(now) ?? 0;
    const noteId = cleanText(options.noteId, 100);
    const rawLimit = Number(options.limit);
    const limit = Math.max(1, Math.min(50, Math.round(Number.isFinite(rawLimit) ? rawLimit : 5)));
    return memory.concepts
      .filter((concept) => !noteId || concept.noteId === noteId)
      .map((concept) => {
        const strength = effectiveStrength(concept, now);
        const nextReviewTimestamp = dateTimestamp(concept.nextReviewAt);
        const overdueDays = nextReviewTimestamp === null
          ? 0
          : Math.max(0, (nowTimestamp - nextReviewTimestamp) / DAY_MS);
        return { concept, strength, nextReviewTimestamp, overdueDays };
      })
      .filter(({ concept, strength, nextReviewTimestamp }) => (
        (nextReviewTimestamp !== null && nowTimestamp >= nextReviewTimestamp)
        || strength < 60
        || concept.state === "weak"
      ))
      .sort((first, second) => Number(second.concept.state === "weak") - Number(first.concept.state === "weak")
        || first.strength - second.strength
        || second.overdueDays - first.overdueDays
        || first.concept.conceptLabel.localeCompare(second.concept.conceptLabel))
      .slice(0, limit)
      .map(({ concept, strength }) => ({ ...concept, effectiveStrength: strength }));
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

  function getHourglassSandState(value, shape = "progress") {
    const numericValue = Number(value);
    const hasValue = value !== null
      && value !== undefined
      && String(value).trim() !== ""
      && Number.isFinite(numericValue);
    if (!hasValue) {
      return {
        hasValue: false,
        percent: 0,
        sourceFill: 0,
        destinationFill: 0,
        isFlowing: false
      };
    }
    const percent = Math.max(0, Math.min(100, Math.round(numericValue)));
    const sourceMultiplier = shape === "average" ? 0.78 : 0.84;
    const destinationMultiplier = shape === "average" ? 0.92 : 0.96;
    return {
      hasValue: true,
      percent,
      sourceFill: Math.round((100 - percent) * sourceMultiplier),
      destinationFill: Math.round(percent * destinationMultiplier),
      isFlowing: percent > 0 && percent < 100
    };
  }

  function buildHabitProfile(value, focusHistory = [], now = Date.now()) {
    const journey = value && typeof value === "object" && !Array.isArray(value) ? value : {};
    const events = Array.isArray(journey.events) ? journey.events : [];
    const nowTimestamp = dateTimestamp(now) ?? 0;
    const today = localDayKey(new Date(nowTimestamp));
    const todayTimestamp = Date.parse(`${today}T00:00:00.000Z`);
    const dayTimestamps = [...new Set(events.map((event) => {
      const suppliedDay = cleanText(event?.localDay, 10);
      const suppliedTimestamp = /^\d{4}-\d{2}-\d{2}$/.test(suppliedDay)
        ? Date.parse(`${suppliedDay}T00:00:00.000Z`)
        : NaN;
      if (Number.isFinite(suppliedTimestamp)
        && new Date(suppliedTimestamp).toISOString().slice(0, 10) === suppliedDay) {
        return suppliedTimestamp;
      }
      const occurredAt = dateTimestamp(event?.occurredAt);
      if (occurredAt === null) return null;
      return Date.parse(`${localDayKey(new Date(occurredAt))}T00:00:00.000Z`);
    }).filter(Number.isFinite))].sort((first, second) => first - second);

    let bestStreakDays = 0;
    let runningStreakDays = 0;
    dayTimestamps.forEach((timestamp, index) => {
      runningStreakDays = index > 0 && timestamp - dayTimestamps[index - 1] === DAY_MS
        ? runningStreakDays + 1
        : 1;
      bestStreakDays = Math.max(bestStreakDays, runningStreakDays);
    });

    const pastDayTimestamps = dayTimestamps.filter((timestamp) => timestamp <= todayTimestamp);
    const latestDayTimestamp = pastDayTimestamps.at(-1);
    let currentStreakDays = 0;
    if (latestDayTimestamp === todayTimestamp || latestDayTimestamp === todayTimestamp - DAY_MS) {
      currentStreakDays = 1;
      for (let index = pastDayTimestamps.length - 2; index >= 0; index -= 1) {
        if (pastDayTimestamps[index + 1] - pastDayTimestamps[index] !== DAY_MS) break;
        currentStreakDays += 1;
      }
    }

    const focusMinutes = (Array.isArray(focusHistory) ? focusHistory : [])
      .map((item) => Math.max(0,
        Number(item?.elapsedMinutes) || (Number(item?.elapsedMs) || 0) / 60000
      ))
      .sort((first, second) => first - second);
    const midpoint = Math.floor(focusMinutes.length / 2);
    const typicalSessionMinutes = focusMinutes.length
      ? Math.round(focusMinutes.length % 2
        ? focusMinutes[midpoint]
        : (focusMinutes[midpoint - 1] + focusMinutes[midpoint]) / 2)
      : 0;

    const timedEvents = events.map((event) => {
      const timestamp = dateTimestamp(event?.occurredAt);
      if (timestamp === null) return null;
      return {
        type: cleanText(event?.type, 40),
        timestamp,
        occurredAt: new Date(timestamp).toISOString()
      };
    }).filter(Boolean);
    const quizEvents = timedEvents.filter((event) => event.type === "quiz_submitted");
    const sessionsLast7Days = quizEvents.filter((event) => (
      event.timestamp >= nowTimestamp - 7 * DAY_MS && event.timestamp <= nowTimestamp
    )).length;
    const firstEventTimestamp = timedEvents.length
      ? Math.min(...timedEvents.map((event) => event.timestamp))
      : null;
    const weeksSinceFirstEvent = firstEventTimestamp === null
      ? 1
      : Math.max(1, (nowTimestamp - firstEventTimestamp) / (7 * DAY_MS));
    const sessionsPerWeekOverall = quizEvents.length
      ? Math.round((quizEvents.length / weeksSinceFirstEvent) * 10) / 10
      : 0;

    let preferredStudyHour = null;
    if (timedEvents.length >= 3) {
      const hourCounts = Array.from({ length: 24 }, () => 0);
      timedEvents.forEach((event) => {
        hourCounts[new Date(event.timestamp).getHours()] += 1;
      });
      preferredStudyHour = hourCounts.reduce((bestHour, count, hour) => (
        count > hourCounts[bestHour] ? hour : bestHour
      ), 0);
    }
    const lastStudiedAt = timedEvents.length
      ? timedEvents.reduce((latest, event) => event.timestamp > latest.timestamp ? event : latest).occurredAt
      : null;

    return {
      currentStreakDays,
      bestStreakDays,
      typicalSessionMinutes,
      sessionsLast7Days,
      sessionsPerWeekOverall,
      preferredStudyHour,
      lastStudiedAt
    };
  }

  function buildStudyPlan(value, focusHistory = [], options = {}) {
    const journey = normalizeJourney(value);
    options = options && typeof options === "object" && !Array.isArray(options) ? options : {};
    const now = options.now ?? Date.now();
    const nowTimestamp = dateTimestamp(now) ?? 0;
    const generatedAt = normalizeIsoDate(now, 0);
    const habit = buildHabitProfile(journey, focusHistory, now);
    const savedNoteIds = Array.isArray(options.savedNoteIds)
      ? new Set(options.savedNoteIds.map((id) => cleanText(id, 100)).filter(Boolean))
      : null;
    const studyGoal = normalizeStudyGoal(options.studyGoal);
    const hasStudyGoal = Object.prototype.hasOwnProperty.call(options, "studyGoal") && studyGoal !== null;
    const noteMissingFor = (noteId) => (savedNoteIds ? !savedNoteIds.has(noteId) : false);
    const streakNote = habit.currentStreakDays >= 2
      ? `Day ${habit.currentStreakDays} streak — one quiz today keeps it alive.`
      : "";
    const selectedChapters = hasStudyGoal && studyGoal.chapterIds.length
      ? journey.chapters.filter((chapter) => studyGoal.chapterIds.includes(chapter.id))
      : journey.chapters;
    const targetTimestamp = hasStudyGoal && studyGoal.targetDate
      ? Date.parse(`${studyGoal.targetDate}T00:00:00.000Z`)
      : NaN;
    const daysToTarget = Number.isFinite(targetTimestamp) && targetTimestamp > nowTimestamp
      ? Math.ceil((targetTimestamp - nowTimestamp) / DAY_MS)
      : null;
    const goalContext = daysToTarget === null
      ? null
      : {
        daysToTarget,
        selectedChapterCount: selectedChapters.length,
        completedSelectedChapterCount: selectedChapters.filter((chapter) => getChapterStatus(chapter) === "completed").length
      };

    if (!journey.chapters.length) {
      return {
        generatedAt,
        habit,
        streakNote,
        goalContext,
        steps: [{
          id: "onboard-1",
          kind: "advance",
          intent: "onboard",
          title: "Create your first visual note",
          reason: "Save a page, note, or video to plant your first tree.",
          noteId: "",
          conceptId: "",
          chapterId: "",
          estimatedMinutes: 5
        }]
      };
    }

    const chapterIdForNote = (noteId) => journey.chapters.find((chapter) => (
      chapter.sessions.some((session) => cleanText(session?.noteId || session?.id, 100) === noteId)
    ))?.id || "";
    const goalChapterIds = hasStudyGoal && studyGoal.chapterIds.length
      ? new Set(studyGoal.chapterIds)
      : null;
    const unscopedDue = getDueConcepts(journey, { now, limit: 3 });
    const scopedDue = goalChapterIds
      ? unscopedDue.filter((concept) => goalChapterIds.has(chapterIdForNote(concept.noteId)))
      : unscopedDue;
    const dueUsesFallback = Boolean(goalChapterIds && !scopedDue.length && unscopedDue.length);
    const due = dueUsesFallback ? unscopedDue : scopedDue;
    const maxSteps = habit.typicalSessionMinutes > 0 && habit.typicalSessionMinutes < 20 ? 2 : 3;
    const goalMaxSteps = hasStudyGoal
      ? studyGoal.dailyMinutes <= 15 ? 2 : studyGoal.dailyMinutes <= 30 ? 3 : 4
      : maxSteps;
    const steps = [];
    const usedRepairConceptIds = new Set();

    due.slice(0, 2).forEach((concept) => {
      const nextReviewTimestamp = dateTimestamp(concept.nextReviewAt);
      const lastAttemptTimestamp = dateTimestamp(concept.lastAttemptAt);
      const daysSinceAttempt = lastAttemptTimestamp === null
        ? 0
        : Math.floor(Math.max(0, (nowTimestamp - lastAttemptTimestamp) / DAY_MS));
      let reason = `Strength has faded to ${concept.effectiveStrength}%.`;
      if (concept.state === "weak") {
        reason = `You missed this ${concept.timesWrong} of ${concept.timesTested} times.`;
      } else if (nextReviewTimestamp !== null && nowTimestamp >= nextReviewTimestamp) {
        reason = `Due for review — last practiced ${daysSinceAttempt} days ago.`;
      }
      const step = {
        id: `repair-${concept.conceptId}`,
        kind: "recovery",
        intent: "recovery",
        noteMissing: noteMissingFor(concept.noteId),
        title: `5-minute recovery quiz: ${concept.conceptLabel}`,
        reason,
        noteId: concept.noteId,
        conceptId: concept.conceptId,
        chapterId: chapterIdForNote(concept.noteId),
        estimatedMinutes: 5
      };
      if (dueUsesFallback && !goalChapterIds.has(step.chapterId)) step.outsideGoal = true;
      steps.push(step);
      usedRepairConceptIds.add(concept.conceptId);
    });

    const selectUnscopedAdvanceChapter = () => {
      let selected = journey.chapters.reduce((latest, chapter) => (
      (dateTimestamp(chapter.updatedAt) ?? 0) > (dateTimestamp(latest.updatedAt) ?? 0) ? chapter : latest
      ));
      if (getChapterStatus(selected) === "completed") {
        const startIndex = journey.chapters.indexOf(selected);
        selected = null;
        for (let offset = 1; offset <= journey.chapters.length; offset += 1) {
          const candidate = journey.chapters[(startIndex + offset) % journey.chapters.length];
          if (getChapterStatus(candidate) === "completed") continue;
          selected = candidate;
          break;
        }
      }
      return selected;
    };
    const goalAdvanceCandidates = goalChapterIds
      ? journey.chapters.filter((chapter) => goalChapterIds.has(chapter.id) && getChapterStatus(chapter) !== "completed")
      : [];
    const advanceUsesFallback = Boolean(goalChapterIds && !goalAdvanceCandidates.length);
    let advanceChapter = goalAdvanceCandidates.length
      ? goalAdvanceCandidates.reduce((latest, chapter) => (
        (dateTimestamp(chapter.updatedAt) ?? 0) > (dateTimestamp(latest.updatedAt) ?? 0) ? chapter : latest
      ))
      : selectUnscopedAdvanceChapter();

    if (!advanceChapter) {
      const step = {
        id: "advance-new-chapter",
        kind: "advance",
        intent: "new-chapter",
        title: "Start a new chapter",
        reason: "Every chapter has reached the completed threshold.",
        noteId: "",
        conceptId: "",
        chapterId: "",
        estimatedMinutes: 10
      };
      if (advanceUsesFallback) step.outsideGoal = true;
      steps.push(step);
    } else {
      const status = getChapterStatus(advanceChapter);
      const scoredSessions = advanceChapter.sessions.filter((session) => (
        session?.itemKind !== "note"
        && Number.isFinite(session?.score)
        && dateTimestamp(session?.submittedAt) !== null
      ));
      let title = `Continue ${advanceChapter.title} with a new source or note`;
      let reason = "You are mid-chapter with no urgent repairs.";
      let intent = "continue";
      if (status === "review") {
        title = `Review ${advanceChapter.title} and retake its quiz`;
        reason = "Your last score there was below 65%.";
        intent = "review-retake";
      } else if (status === "planned") {
        title = `Add your first source to ${advanceChapter.title}`;
        reason = "This chapter is planned but has no saved material yet.";
        intent = "add-source";
      } else if (status === "current" && !scoredSessions.length) {
        title = `Take your first quiz in ${advanceChapter.title}`;
        reason = "Activity only becomes mastery evidence after a submitted quiz.";
        intent = "first-quiz";
      }
      const step = {
        id: `advance-${advanceChapter.id}`,
        kind: "advance",
        intent,
        title,
        reason,
        noteId: "",
        conceptId: "",
        chapterId: advanceChapter.id,
        estimatedMinutes: 10
      };
      if (advanceUsesFallback && !goalChapterIds.has(step.chapterId)) step.outsideGoal = true;
      steps.push(step);
    }

    if (steps.length < goalMaxSteps) {
      const unscopedStretchCandidates = journey.learningMemory.concepts
        .filter((concept) => concept.state === "stable" && !usedRepairConceptIds.has(concept.conceptId))
        .map((concept) => ({ concept, strength: effectiveStrength(concept, now) }))
        .sort((first, second) => first.strength - second.strength
          || first.concept.conceptLabel.localeCompare(second.concept.conceptLabel));
      const scopedStretchCandidates = goalChapterIds
        ? unscopedStretchCandidates.filter(({ concept }) => goalChapterIds.has(chapterIdForNote(concept.noteId)))
        : unscopedStretchCandidates;
      const stretchUsesFallback = Boolean(goalChapterIds && !scopedStretchCandidates.length && unscopedStretchCandidates.length);
      const stretch = (stretchUsesFallback ? unscopedStretchCandidates : scopedStretchCandidates)[0];
      if (stretch) {
        const lastAttemptTimestamp = dateTimestamp(stretch.concept.lastAttemptAt);
        const daysSinceAttempt = lastAttemptTimestamp === null
          ? 0
          : Math.floor(Math.max(0, (nowTimestamp - lastAttemptTimestamp) / DAY_MS));
        const step = {
          id: `stretch-${stretch.concept.conceptId}`,
          kind: "stretch",
          intent: "stretch",
          noteMissing: noteMissingFor(stretch.concept.noteId),
          title: `Quick self-test: ${stretch.concept.conceptLabel}`,
          reason: `Mastered ${daysSinceAttempt} days ago — a quick test keeps it strong.`,
          noteId: stretch.concept.noteId,
          conceptId: stretch.concept.conceptId,
          chapterId: chapterIdForNote(stretch.concept.noteId),
          estimatedMinutes: 5
        };
        if (stretchUsesFallback && !goalChapterIds.has(step.chapterId)) step.outsideGoal = true;
        steps.push(step);
      }
    }

    return {
      generatedAt,
      habit,
      streakNote,
      goalContext,
      steps: steps.slice(0, goalMaxSteps)
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

  function artifactTimelineIdentity(artifact) {
    const binding = artifact?.sourceBinding && typeof artifact.sourceBinding === "object"
      ? artifact.sourceBinding
      : {};
    const artifactId = cleanText(artifact?.noteId || artifact?.id, 100);
    const sourceType = cleanText(
      artifact?.sourceType || binding.sourceType || binding.type,
      40
    ) || "webpage";
    const hasVisualNote = Boolean(
      artifact?.hasVisualNote
      || artifact?.itemKind === "note"
      || artifact?.visualLesson?.visualModel
    );
    if (!hasVisualNote) return `artifact:${artifactId}`;

    if (sourceType === "collection") {
      const compositionRevision = cleanText(
        artifact?.compositionRevisionHash
        || binding.compositionRevisionHash
        || artifact?.sourceRevisionHash
        || binding.sourceRevisionHash
        || artifact?.sourceFingerprint
        || binding.fingerprint,
        120
      );
      if (compositionRevision) return `collection:${compositionRevision}`;
    }

    const sourceFingerprint = cleanText(artifact?.sourceFingerprint || binding.fingerprint, 120);
    const sourceUrl = canonicalUrl(artifact?.sourceUrl || binding.url, sourceType);
    if (sourceFingerprint) return `${sourceType}:${sourceUrl}:${sourceFingerprint}`;

    const sourceId = cleanText(artifact?.sourceId || binding.sourceId, 100);
    if (sourceId) return `${sourceType}:source:${sourceId}`;
    return `note:${artifactId}`;
  }

  function getChapterArtifactTimeline(chapter, artifacts, maxItems = MAX_DISPLAYED_ARTIFACTS_PER_CHAPTER) {
    const sessions = Array.isArray(chapter?.sessions)
      ? chapter.sessions.filter((session) => session && typeof session === "object" && cleanText(session.id, 100))
      : [];
    const sessionIds = new Set(sessions.map((session) => cleanText(session.id, 100)));
    const savedDetails = new Map();

    (Array.isArray(artifacts) ? artifacts : []).forEach((artifact) => {
      if (!artifactBelongsToCollectionChapter(artifact, chapter, sessionIds)) return;
      const artifactId = cleanText(artifact?.id, 100);
      const noteId = cleanText(artifact?.noteId, 100);
      if (artifactId) savedDetails.set(artifactId, artifact);
      if (noteId) savedDetails.set(noteId, artifact);
    });

    const requestedMaximum = Number(maxItems);
    const maximum = Number.isFinite(requestedMaximum)
      ? Math.max(1, Math.min(MAX_DISPLAYED_ARTIFACTS_PER_CHAPTER, Math.floor(requestedMaximum)))
      : MAX_DISPLAYED_ARTIFACTS_PER_CHAPTER;
    const seen = new Set();

    return sessions
      .map((session) => {
        const details = savedDetails.get(cleanText(session.id, 100))
          || savedDetails.get(cleanText(session.noteId, 100));
        if (!details) return session;
        return {
          ...details,
          ...session,
          noteId: cleanText(details.noteId || session.noteId || session.id, 100),
          sourceBinding: details.sourceBinding || session.sourceBinding,
          visualLesson: details.visualLesson || session.visualLesson,
          compositionRevisionHash: details.compositionRevisionHash || session.compositionRevisionHash
        };
      })
      .sort((first, second) => sessionActivityTime(second) - sessionActivityTime(first)
        || cleanText(first.id, 100).localeCompare(cleanText(second.id, 100)))
      .filter((artifact) => {
        const identity = artifactTimelineIdentity(artifact);
        if (!identity || seen.has(identity)) return false;
        seen.add(identity);
        return true;
      })
      .slice(0, maximum);
  }

  function chapterTimelineTime(chapter) {
    const sessionTimes = (Array.isArray(chapter?.sessions) ? chapter.sessions : [])
      .map((session) => sessionActivityTime(session));
    const sourceTimes = (Array.isArray(chapter?.sources) ? chapter.sources : [])
      .map((source) => dateTimestamp(source?.capturedAt || source?.updatedAt || source?.createdAt) ?? 0);
    const learningActivityTimes = [...sessionTimes, ...sourceTimes].filter((time) => time > 0);
    if (learningActivityTimes.length) return Math.max(...learningActivityTimes);
    return Math.max(
      dateTimestamp(chapter?.createdAt) ?? 0,
      dateTimestamp(chapter?.updatedAt) ?? 0
    );
  }

  function orderChaptersByTimeline(chapters) {
    return (Array.isArray(chapters) ? chapters : [])
      .map((chapter, index) => ({ chapter, index, activityTime: chapterTimelineTime(chapter) }))
      .sort((first, second) => second.activityTime - first.activityTime || first.index - second.index)
      .map(({ chapter }) => chapter);
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
    MAX_DISPLAYED_ARTIFACTS_PER_CHAPTER,
    MAX_APPLIED_OPERATIONS,
    MAX_LEARNING_ATTEMPTS,
    createLearningMemory,
    createJourney,
    normalizeStudyGoal,
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
    normalizeChapterTitleProposal,
    planBulkFiling,
    buildClassificationExcerpt,
    clusterImportExcerpts,
    buildChapterClassificationHints,
    classifySourcesLocally,
    removeSource,
    removeSession,
    renameSession,
    recordSession,
    recordQuestionAttempts,
    rankWeakConcepts,
    effectiveStrength,
    getDueConcepts,
    clearLearningMemory,
    getChapterStatus,
    getMetrics,
    getHourglassSandState,
    buildHabitProfile,
    buildStudyPlan,
    getChapterVisualNoteArtifacts,
    getChapterArtifactTimeline,
    chapterTimelineTime,
    orderChaptersByTimeline,
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
