(function attachNeatMindJourneyWorker(root, factory) {
  const Journey = root.NeatMindJourney
    || (typeof require === "function" ? (require("./journey-utils.js"), root.NeatMindJourney) : null);
  const api = factory(Journey);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.NeatMindJourneyWorker = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createJourneyWorkerUtils(Journey) {
  "use strict";

  if (!Journey) throw new Error("journey-utils.js must load before journey-worker-utils.js.");

  const MESSAGE_TYPES = Object.freeze({
    GET: "JOURNEY_GET",
    CREATE_CHAPTER: "JOURNEY_CREATE_CHAPTER",
    ADD_SOURCE: "JOURNEY_ADD_SOURCE",
    REMOVE_SOURCE: "JOURNEY_REMOVE_SOURCE",
    REMOVE_SESSION: "JOURNEY_REMOVE_SESSION",
    RENAME_SESSION: "JOURNEY_RENAME_SESSION",
    UPSERT_SESSION: "JOURNEY_UPSERT_SESSION",
    UPDATE_CHAPTER_STATUS: "JOURNEY_UPDATE_CHAPTER_STATUS",
    CLEAR_LEARNING_MEMORY: "JOURNEY_CLEAR_LEARNING_MEMORY",
    SAVE_SUMMARY: "JOURNEY_SAVE_SUMMARY",
    FINALIZE_COLLECTION: "JOURNEY_FINALIZE_COLLECTION"
  });
  const MUTATION_TYPES = new Set(Object.values(MESSAGE_TYPES).filter((type) => type !== MESSAGE_TYPES.GET));

  class JourneyOperationError extends Error {
    constructor(code, message, details = {}) {
      super(message);
      this.name = "JourneyOperationError";
      this.code = code;
      this.details = details;
    }
  }

  function reduceJourneyOperation(currentValue, operation, now = Date.now()) {
    const journey = Journey.normalizeJourney(currentValue || Journey.createJourney(undefined, now));
    const type = String(operation?.type || "");
    if (!Object.values(MESSAGE_TYPES).includes(type)) {
      throw new JourneyOperationError("UNKNOWN_OPERATION", `Unsupported Journey operation: ${type || "missing type"}.`);
    }
    if (type === MESSAGE_TYPES.GET) {
      return {
        journey,
        result: { revision: journey.revision },
        duplicate: false,
        changed: false
      };
    }

    const opId = normalizeOpId(operation?.opId);
    const payload = operation?.payload && typeof operation.payload === "object" ? operation.payload : {};
    const payloadHash = hashOperationPayload(payload);
    const previous = journey.appliedOperations.find((entry) => entry.opId === opId);
    if (previous) {
      if (previous.type !== type || (previous.payloadHash && previous.payloadHash !== payloadHash)) {
        throw new JourneyOperationError(
          "OP_ID_REUSED",
          "This operation identifier was already used for a different Journey change or payload.",
          {
            opId,
            previousType: previous.type,
            requestedType: type,
            payloadChanged: Boolean(previous.payloadHash && previous.payloadHash !== payloadHash)
          }
        );
      }
      return {
        journey,
        result: {
          ...previous.result,
          revision: journey.revision,
          appliedRevision: previous.appliedRevision
        },
        duplicate: true,
        changed: false
      };
    }

    const expectedRevision = normalizeExpectedRevision(operation?.expectedRevision);
    if (expectedRevision !== journey.revision) {
      throw new JourneyOperationError(
        "REVISION_CONFLICT",
        `Journey changed from revision ${expectedRevision} to ${journey.revision}. Reload it and retry the operation.`,
        { expectedRevision, actualRevision: journey.revision }
      );
    }

    const before = JSON.stringify(journey);
    let next = journey;
    let result = {};

    switch (type) {
      case MESSAGE_TYPES.CREATE_CHAPTER: {
        const title = String(payload.title || payload.chapterTitle || "").replace(/\s+/g, " ").trim();
        if (!title) throw new JourneyOperationError("INVALID_CHAPTER", "Enter a chapter name before creating it.");
        const created = Journey.createChapter(journey, title, now);
        next = created.journey;
        result = {
          chapterId: created.chapterId,
          created: created.created,
          duplicate: created.duplicate
        };
        break;
      }
      case MESSAGE_TYPES.ADD_SOURCE: {
        const chapter = String(payload.chapterIdOrTitle || payload.chapterId || payload.chapterTitle || "").trim();
        if (!chapter) throw new JourneyOperationError("INVALID_CHAPTER", "Adding a source requires a chapter.");
        if (!payload.source || typeof payload.source !== "object") {
          throw new JourneyOperationError("INVALID_SOURCE", "Adding a source requires source data.");
        }
        const added = Journey.addSource(journey, chapter, payload.source, now);
        next = added.journey;
        result = {
          chapterId: added.chapterId,
          sourceId: added.sourceId,
          duplicate: added.duplicate,
          updated: added.updated
        };
        break;
      }
      case MESSAGE_TYPES.REMOVE_SOURCE: {
        const chapterId = String(payload.chapterId || "").trim();
        const sourceId = String(payload.sourceId || "").trim();
        if (!chapterId || !sourceId) {
          throw new JourneyOperationError("INVALID_SOURCE", "Removing a source requires chapterId and sourceId.");
        }
        const chapter = Journey.findChapter(journey, chapterId);
        const removed = Boolean(chapter?.sources?.some((source) => source.id === sourceId));
        next = Journey.removeSource(journey, chapterId, sourceId, now);
        result = { chapterId, sourceId, removed };
        break;
      }
      case MESSAGE_TYPES.REMOVE_SESSION: {
        const chapterId = String(payload.chapterId || "").trim();
        const sessionId = String(payload.sessionId || "").trim();
        if (!chapterId || !sessionId) {
          throw new JourneyOperationError("INVALID_SESSION", "Removing a note requires its chapter and note ids.");
        }
        const removedOutcome = Journey.removeSession(journey, chapterId, sessionId, now);
        next = removedOutcome.journey;
        result = { removed: removedOutcome.removed, removedConceptCount: removedOutcome.removedConceptCount };
        break;
      }
      case MESSAGE_TYPES.RENAME_SESSION: {
        const chapterId = String(payload.chapterId || "").trim();
        const sessionId = String(payload.sessionId || "").trim();
        const title = String(payload.title || "").trim();
        if (!chapterId || !sessionId || !title) {
          throw new JourneyOperationError("INVALID_SESSION", "Renaming a note requires its chapter id, note id, and a new title.");
        }
        const renamedOutcome = Journey.renameSession(journey, chapterId, sessionId, title, now);
        next = renamedOutcome.journey;
        result = { renamed: renamedOutcome.renamed };
        break;
      }
      case MESSAGE_TYPES.UPSERT_SESSION: {
        let chapter = String(payload.chapterIdOrTitle || payload.chapterId || payload.chapterTitle || "").trim();
        if (!chapter) throw new JourneyOperationError("INVALID_CHAPTER", "Saving a session requires a chapter.");
        if (!payload.session || typeof payload.session !== "object") {
          throw new JourneyOperationError("INVALID_SESSION", "Saving a session requires session data.");
        }
        if (payload.questionAttempts !== undefined && !Array.isArray(payload.questionAttempts)) {
          throw new JourneyOperationError("INVALID_ATTEMPTS", "Saving question attempts requires a list.");
        }
        if (Array.isArray(payload.questionAttempts)) {
          const attemptDefaults = {
            quizId: payload.quizResult?.quizId || payload.session.quizId || payload.session.id,
            noteId: payload.quizResult?.noteId || payload.session.noteId || payload.session.id,
            sourceFingerprint: payload.quizResult?.sourceFingerprint
              || payload.session.sourceFingerprint
              || payload.session.sourceBinding?.fingerprint,
            answeredAt: payload.quizResult?.submittedAt || payload.session.submittedAt,
            attemptType: payload.quizResult?.attemptType || payload.session.attemptType,
            targetConceptId: payload.quizResult?.targetConceptId || payload.session.recoveryTargetConceptId
          };
          if (payload.questionAttempts.some((attempt) => !Journey.normalizeQuestionAttempt(attempt, attemptDefaults))) {
            throw new JourneyOperationError("INVALID_ATTEMPTS", "Every question attempt must include valid quiz, question, note, concept, answer, result, and time fields.");
          }
        }
        let sourceResult = null;
        let sessionToRecord = payload.session;
        if (payload.source && typeof payload.source === "object") {
          const added = Journey.addSource(journey, chapter, payload.source, now);
          next = added.journey;
          chapter = added.chapterId;
          sourceResult = { sourceId: added.sourceId, sourceDuplicate: added.duplicate, sourceUpdated: added.updated };
          const binding = payload.session.sourceBinding && typeof payload.session.sourceBinding === "object"
            ? payload.session.sourceBinding
            : {};
          sessionToRecord = {
            ...payload.session,
            sourceId: added.sourceId,
            sourceBinding: { ...binding, sourceId: added.sourceId }
          };
        }
        const recorded = Journey.recordSession(next, chapter, sessionToRecord, now);
        next = recorded.journey;
        let attemptResult = null;
        if (Array.isArray(payload.questionAttempts) && payload.questionAttempts.length) {
          const quizResult = payload.quizResult && typeof payload.quizResult === "object" && !Array.isArray(payload.quizResult)
            ? payload.quizResult
            : {};
          attemptResult = Journey.recordQuestionAttempts(next, payload.questionAttempts, {
            ...payload.session,
            ...quizResult,
            quizId: quizResult.quizId || payload.session.quizId || payload.session.id,
            noteId: quizResult.noteId || payload.session.noteId || payload.session.id,
            sourceFingerprint: quizResult.sourceFingerprint
              || payload.session.sourceFingerprint
              || payload.session.sourceBinding?.fingerprint,
            submittedAt: quizResult.submittedAt || payload.session.submittedAt
          });
          next = attemptResult.journey;
        }
        result = {
          chapterId: recorded.chapterId,
          sessionId: recorded.sessionId,
          recordedAttemptCount: attemptResult?.recordedCount || 0,
          duplicateAttemptCount: attemptResult?.duplicateCount || 0,
          ...sourceResult
        };
        break;
      }
      case MESSAGE_TYPES.UPDATE_CHAPTER_STATUS: {
        const chapterId = String(payload.chapterId || "").trim();
        if (!chapterId) throw new JourneyOperationError("INVALID_CHAPTER", "Updating chapter progress requires a chapter id.");
        const updated = Journey.updateChapterProcessingStatus(journey, chapterId, {
          processingStatus: payload.processingStatus,
          resourceStatus: payload.resourceStatus,
          resourceError: payload.resourceError
        }, now);
        next = updated.journey;
        result = { chapterId, updated: updated.updated };
        break;
      }
      case MESSAGE_TYPES.CLEAR_LEARNING_MEMORY: {
        const cleared = Journey.clearLearningMemory(journey, now);
        next = cleared.journey;
        result = {
          clearedAttemptCount: cleared.clearedAttemptCount,
          clearedConceptCount: cleared.clearedConceptCount
        };
        break;
      }
      case MESSAGE_TYPES.SAVE_SUMMARY: {
        if (!payload.summary || typeof payload.summary !== "object" || Array.isArray(payload.summary)) {
          throw new JourneyOperationError("INVALID_SUMMARY", "Saving a Journey summary requires summary data.");
        }
        next = Journey.normalizeJourney({
          ...journey,
          summary: {
            ...payload.summary,
            generatedAt: payload.summary.generatedAt || Journey.normalizeIsoDate(now),
            sourceRevision: journey.revision
          },
          updatedAt: Journey.normalizeIsoDate(now, journey.updatedAt)
        });
        result = {};
        break;
      }
      case MESSAGE_TYPES.FINALIZE_COLLECTION: {
        const chapterId = String(payload.chapterId || "").trim();
        const expectedSourceHash = String(payload.sourceRevisionHash || "").trim();
        const chapter = Journey.findChapter(journey, chapterId);
        if (!chapter) throw new JourneyOperationError("INVALID_CHAPTER", "The collection chapter no longer exists.");
        if (!expectedSourceHash) {
          throw new JourneyOperationError("MISSING_SOURCE_REVISION", "Finalizing a collection requires its source revision hash.");
        }
        const actualSourceHash = Journey.sourceRevisionHash(chapter);
        if (actualSourceHash !== expectedSourceHash) {
          throw new JourneyOperationError(
            "SOURCE_REVISION_CONFLICT",
            "The chapter sources changed while the combined lesson was being generated.",
            { expectedSourceHash, actualSourceHash }
          );
        }
        if (!payload.session || typeof payload.session !== "object") {
          throw new JourneyOperationError("INVALID_SESSION", "Finalizing a collection requires a generated session.");
        }
        const recorded = Journey.recordSession(journey, chapterId, {
          ...payload.session,
          sourceRevisionHash: actualSourceHash
        }, now);
        next = recorded.journey;
        result = {
          chapterId: recorded.chapterId,
          sessionId: recorded.sessionId
        };
        break;
      }
      default:
        throw new JourneyOperationError("UNKNOWN_OPERATION", `Unsupported Journey operation: ${type}.`);
    }

    next.appliedOperations = [
      ...(Array.isArray(next.appliedOperations) ? next.appliedOperations : []),
      {
        opId,
        type,
        payloadHash,
        appliedRevision: next.revision,
        appliedAt: Journey.normalizeIsoDate(now),
        result
      }
    ].slice(-Journey.MAX_APPLIED_OPERATIONS);
    next = Journey.normalizeJourney(next);
    return {
      journey: next,
      result: { ...result, revision: next.revision },
      duplicate: false,
      changed: before !== JSON.stringify(next)
    };
  }

  function reduceJourneyOperations(currentValue, operations, now = Date.now()) {
    if (!Array.isArray(operations)) {
      throw new JourneyOperationError("INVALID_OPERATIONS", "Journey operations must be supplied as a list.");
    }
    let journey = Journey.normalizeJourney(currentValue || Journey.createJourney(undefined, now));
    const outcomes = [];
    operations.forEach((operation, index) => {
      const operationNow = typeof now === "function" ? now(operation, index) : now;
      const outcome = reduceJourneyOperation(journey, operation, operationNow);
      journey = outcome.journey;
      outcomes.push({
        result: outcome.result,
        duplicate: outcome.duplicate,
        changed: outcome.changed
      });
    });
    return { journey, outcomes };
  }

  function normalizeOpId(value) {
    const opId = String(value || "").trim();
    if (!/^[a-zA-Z0-9:_-]{8,120}$/.test(opId)) {
      throw new JourneyOperationError(
        "INVALID_OP_ID",
        "Journey changes require an operation identifier containing 8–120 letters, numbers, colons, dashes, or underscores."
      );
    }
    return opId;
  }

  function normalizeExpectedRevision(value) {
    const revision = Number(value);
    if (!Number.isInteger(revision) || revision < 0) {
      throw new JourneyOperationError("INVALID_REVISION", "Journey changes require a non-negative expectedRevision.");
    }
    return revision;
  }

  function hashOperationPayload(payload) {
    return Journey.fingerprint(stableSerialize(payload));
  }

  function stableSerialize(value, seen = new Set()) {
    if (value === null || typeof value !== "object") return JSON.stringify(value ?? null);
    if (seen.has(value)) {
      throw new JourneyOperationError("INVALID_PAYLOAD", "Journey operation payloads cannot contain circular data.");
    }
    seen.add(value);
    const serialized = Array.isArray(value)
      ? `[${value.map((item) => stableSerialize(item, seen)).join(",")}]`
      : `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableSerialize(value[key], seen)}`).join(",")}}`;
    seen.delete(value);
    return serialized;
  }

  return Object.freeze({
    MESSAGE_TYPES,
    MUTATION_TYPES,
    JourneyOperationError,
    hashOperationPayload,
    reduceJourneyOperation,
    reduceJourneyOperations
  });
});
