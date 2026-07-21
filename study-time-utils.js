(function attachNeatMindStudyTime(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.NeatMindStudyTime = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createNeatMindStudyTime() {
  "use strict";

  // Automatic per-chapter / per-note study-time recorder.
  //
  // Time is attributed to the chapter (and the open note) the learner is
  // actively studying in the side panel. The side panel drives the live
  // session; the Learning Forest only reads the accumulated totals. Nothing
  // here starts or stops manual timers — accrual follows what is on screen.

  const SCHEMA_VERSION = 1;
  const STORAGE_KEY = "neatMindStudyTimeState";
  // Grace window after the last activity that still counts as studying. Matches
  // the retired chapter timer so switching systems does not change behaviour.
  const DEFAULT_IDLE_MS = 90 * 1000;
  // Upper bound on a single flush so a stalled timer or a clock jump can never
  // credit an implausible slice of time to a chapter.
  const MAX_SLICE_MS = 15 * 60 * 1000;
  const MAX_ENTRIES = 1000;
  const MAX_TOTAL_MS = 10 * 365 * 24 * 60 * 60 * 1000;
  const MAX_ID_LENGTH = 100;

  function normalizeNow(value) {
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? Math.floor(number) : Date.now();
  }

  function normalizeId(value) {
    return String(value === undefined || value === null ? "" : value).slice(0, MAX_ID_LENGTH);
  }

  function clampMs(value) {
    const number = Number(value);
    if (!Number.isFinite(number) || number <= 0) return 0;
    return Math.min(MAX_TOTAL_MS, Math.floor(number));
  }

  function normalizeTotals(value) {
    const totals = {};
    if (value && typeof value === "object" && !Array.isArray(value)) {
      for (const [rawKey, rawValue] of Object.entries(value).slice(0, MAX_ENTRIES)) {
        const key = normalizeId(rawKey);
        const ms = clampMs(rawValue);
        if (key && ms > 0) totals[key] = ms;
      }
    }
    return totals;
  }

  function createDefaultStudyTimeState(now = Date.now()) {
    return {
      schemaVersion: SCHEMA_VERSION,
      chapterTotals: {},
      noteTotals: {},
      updatedAt: normalizeNow(now)
    };
  }

  function normalizeStudyTimeState(value, now = Date.now()) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return createDefaultStudyTimeState(now);
    }
    const updatedAt = Number(value.updatedAt);
    return {
      schemaVersion: SCHEMA_VERSION,
      chapterTotals: normalizeTotals(value.chapterTotals),
      noteTotals: normalizeTotals(value.noteTotals),
      updatedAt: Number.isFinite(updatedAt) && updatedAt >= 0 ? Math.floor(updatedAt) : normalizeNow(now)
    };
  }

  function addStudyTime(previousValue, input, now = Date.now()) {
    const state = normalizeStudyTimeState(previousValue, now);
    const chapterId = normalizeId(input?.chapterId);
    const noteId = normalizeId(input?.noteId);
    const durationMs = Math.min(MAX_SLICE_MS, Math.max(0, Math.floor(Number(input?.durationMs) || 0)));
    // Study time always belongs to a chapter. A note total is a subset of its
    // chapter, so the grand total stays the sum of chapterTotals with no
    // double counting.
    if (!chapterId || durationMs <= 0) {
      return { ...state, updatedAt: normalizeNow(now) };
    }
    const chapterTotals = {
      ...state.chapterTotals,
      [chapterId]: clampMs((state.chapterTotals[chapterId] || 0) + durationMs)
    };
    const noteTotals = noteId
      ? { ...state.noteTotals, [noteId]: clampMs((state.noteTotals[noteId] || 0) + durationMs) }
      : { ...state.noteTotals };
    return {
      schemaVersion: SCHEMA_VERSION,
      chapterTotals,
      noteTotals,
      updatedAt: normalizeNow(now)
    };
  }

  function getChapterStudyMs(stateValue, chapterId) {
    const state = normalizeStudyTimeState(stateValue);
    return state.chapterTotals[normalizeId(chapterId)] || 0;
  }

  function getNoteStudyMs(stateValue, noteId) {
    const state = normalizeStudyTimeState(stateValue);
    return state.noteTotals[normalizeId(noteId)] || 0;
  }

  function getTotalStudyMs(stateValue) {
    const state = normalizeStudyTimeState(stateValue);
    return Object.values(state.chapterTotals).reduce((total, ms) => total + Math.max(0, Number(ms) || 0), 0);
  }

  function formatStudyDuration(value) {
    const minutes = Math.floor(Math.max(0, Number(value) || 0) / 60000);
    if (minutes < 1) return "0m";
    const hours = Math.floor(minutes / 60);
    return hours ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
  }

  // ---- Live session helpers (pure) ---------------------------------------
  //
  // A session tracks the chapter/note under study plus two timestamps:
  //   lastFlushAt   — time already credited to the totals
  //   lastActivityAt — last observed learner activity
  // While activity stays within the idle window, elapsed time is credited
  // continuously. After the idle window lapses, accrual stops at
  // lastActivityAt + idle, granting the same short grace the old timer did.

  function createStudySession(chapterId, noteId, now = Date.now()) {
    const startedAt = normalizeNow(now);
    return {
      chapterId: normalizeId(chapterId),
      noteId: normalizeId(noteId),
      lastFlushAt: startedAt,
      lastActivityAt: startedAt
    };
  }

  function isStudySessionIdle(session, now = Date.now(), idleMs = DEFAULT_IDLE_MS) {
    if (!session || !session.chapterId) return true;
    return normalizeNow(now) - normalizeNow(session.lastActivityAt) > Math.max(0, idleMs);
  }

  function flushStudySession(previousValue, session, now = Date.now(), idleMs = DEFAULT_IDLE_MS) {
    const currentTime = normalizeNow(now);
    const state = normalizeStudyTimeState(previousValue, currentTime);
    if (!session || !session.chapterId) {
      return { state, session: session || null, idle: true, addedMs: 0 };
    }
    const grace = Math.max(0, idleMs);
    const activeUntil = Math.min(currentTime, normalizeNow(session.lastActivityAt) + grace);
    const addedMs = Math.max(0, activeUntil - normalizeNow(session.lastFlushAt));
    const nextState = addedMs > 0
      ? addStudyTime(state, { chapterId: session.chapterId, noteId: session.noteId, durationMs: addedMs }, currentTime)
      : state;
    const nextSession = { ...session, lastFlushAt: Math.max(normalizeNow(session.lastFlushAt), activeUntil) };
    return {
      state: nextState,
      session: nextSession,
      idle: currentTime - normalizeNow(session.lastActivityAt) > grace,
      addedMs
    };
  }

  function touchStudySession(session, now = Date.now(), idleMs = DEFAULT_IDLE_MS) {
    if (!session || !session.chapterId) return session;
    const currentTime = normalizeNow(now);
    const resumingFromIdle = currentTime - normalizeNow(session.lastActivityAt) > Math.max(0, idleMs);
    return {
      ...session,
      // Resuming after an idle gap must not back-credit the time away.
      lastFlushAt: resumingFromIdle ? currentTime : session.lastFlushAt,
      lastActivityAt: currentTime
    };
  }

  return Object.freeze({
    SCHEMA_VERSION,
    STORAGE_KEY,
    DEFAULT_IDLE_MS,
    MAX_SLICE_MS,
    createDefaultStudyTimeState,
    normalizeStudyTimeState,
    addStudyTime,
    getChapterStudyMs,
    getNoteStudyMs,
    getTotalStudyMs,
    formatStudyDuration,
    createStudySession,
    isStudySessionIdle,
    flushStudySession,
    touchStudySession
  });
});
