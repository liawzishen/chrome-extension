(function attachExamCramFocus(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.ExamCramFocus = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createExamCramFocus() {
  "use strict";

  const SCHEMA_VERSION = 1;
  const STORAGE_KEY = "examCramFocusState";
  const END_ALARM = "examCramFocus:end";
  const BREAK_ALARM = "examCramFocus:break";
  const BREAK_DURATION_MS = 5 * 60 * 1000;
  const MIN_DURATION_MINUTES = 1;
  const MAX_DURATION_MINUTES = 12 * 60;
  const MAX_RULES = 50;
  const MAX_PATH_LENGTH = 180;
  const MAX_HISTORY = 40;
  const CHAPTER_STORAGE_KEY = "examCramChapterFocusState";
  const CHAPTER_IDLE_ALARM = "examCramChapterFocus:idle";
  const CHAPTER_IDLE_TIMEOUT_MS = 90 * 1000;
  const MAX_CHAPTER_HISTORY = 500;
  const FOCUS_SESSION_TIME_LABEL = "Focus session time";
  const GLOBAL_OPTIONAL_HOST_PATTERN = "*://*/*";
  const EXTENSION_RELOAD_REQUIRED_MESSAGE = "Reload Exam-Cram from chrome://extensions to activate updated permissions.";
  const DNR_RULE_ID_BASE = 840000;
  const DNR_RULE_ID_LIMIT = DNR_RULE_ID_BASE + MAX_RULES;
  const MESSAGE_TYPES = Object.freeze({
    GET_STATE: "FOCUS_GET_STATE",
    START: "FOCUS_START",
    STOP: "FOCUS_STOP",
    BREAK: "FOCUS_BREAK"
  });
  const CHAPTER_MESSAGE_TYPES = Object.freeze({
    GET_STATE: "CHAPTER_FOCUS_GET_STATE",
    SELECT: "CHAPTER_FOCUS_SELECT",
    START: "CHAPTER_FOCUS_START",
    PAUSE: "CHAPTER_FOCUS_PAUSE",
    RESUME: "CHAPTER_FOCUS_RESUME",
    ACTIVITY: "CHAPTER_FOCUS_ACTIVITY"
  });

  class FocusError extends Error {
    constructor(code, message, details = {}) {
      super(message);
      this.name = "FocusError";
      this.code = code;
      this.details = details;
    }
  }

  function createDefaultFocusState(now = Date.now()) {
    return {
      schemaVersion: SCHEMA_VERSION,
      active: false,
      sessionId: "",
      startedAt: null,
      endsAt: null,
      breakUntil: null,
      rules: [],
      history: [],
      lastError: "",
      updatedAt: normalizeNow(now)
    };
  }

  function createDefaultChapterFocusState(now = Date.now()) {
    return {
      schemaVersion: 1,
      active: false,
      status: "idle",
      sessionId: "",
      chapterId: "",
      chapterTitle: "",
      ownerId: "",
      ownerTabId: null,
      startedAt: null,
      resumedAt: null,
      lastActivityAt: null,
      currentSessionMs: 0,
      lastSessionDurationMs: 0,
      chapterTotals: {},
      history: [],
      updatedAt: normalizeNow(now)
    };
  }

  function normalizeNow(value) {
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? Math.floor(number) : Date.now();
  }

  function normalizeDurationMinutes(value) {
    const duration = Number(value);
    if (!Number.isFinite(duration) || !Number.isInteger(duration)) {
      throw new FocusError("INVALID_DURATION", "Focus duration must be a whole number of minutes.");
    }
    if (duration < MIN_DURATION_MINUTES || duration > MAX_DURATION_MINUTES) {
      throw new FocusError(
        "INVALID_DURATION",
        `Focus duration must be between ${MIN_DURATION_MINUTES} and ${MAX_DURATION_MINUTES} minutes.`
      );
    }
    return duration;
  }

  function resolveDurationMinutes(selection, customValue) {
    return normalizeDurationMinutes(String(selection || "").trim().toLowerCase() === "custom" ? customValue : selection);
  }

  function getDurationControlState(durationValue, presets = [15, 25, 50, 90]) {
    const durationMinutes = normalizeDurationMinutes(durationValue);
    const allowedPresets = new Set((Array.isArray(presets) ? presets : [])
      .map(Number)
      .filter((value) => Number.isInteger(value) && value >= MIN_DURATION_MINUTES && value <= MAX_DURATION_MINUTES));
    return allowedPresets.has(durationMinutes)
      ? { selection: String(durationMinutes), customDuration: durationMinutes, isCustom: false }
      : { selection: "custom", customDuration: durationMinutes, isCustom: true };
  }

  function getPlannedDurationMinutes(stateValue) {
    const startedAt = normalizeNullableTime(stateValue?.startedAt);
    const endsAt = normalizeNullableTime(stateValue?.endsAt);
    if (startedAt === null || endsAt === null || endsAt <= startedAt) return null;
    return Math.max(MIN_DURATION_MINUTES, Math.min(MAX_DURATION_MINUTES, Math.round((endsAt - startedAt) / 60000)));
  }

  function getRecordedSessionTimeMinutes(history) {
    const entries = Array.isArray(history) ? history : [];
    const milliseconds = entries.reduce((total, entry) => {
      const elapsedMs = Number(entry?.elapsedMs);
      const elapsedMinutes = Number(entry?.elapsedMinutes);
      if (Number.isFinite(elapsedMs)) return total + Math.max(0, elapsedMs);
      if (Number.isFinite(elapsedMinutes)) return total + Math.max(0, elapsedMinutes * 60000);
      return total;
    }, 0);
    return Math.round(milliseconds / 60000);
  }

  function formatElapsedFocusTime(elapsedMs) {
    const milliseconds = Math.max(0, Number(elapsedMs) || 0);
    return milliseconds < 60_000
      ? "<1 min"
      : `${Math.round(milliseconds / 60_000)} min`;
  }

  function normalizeDomain(value) {
    const raw = String(value || "").trim().toLowerCase().replace(/\.$/, "");
    if (!raw) {
      throw new FocusError("INVALID_RULE", "Each focus rule needs a domain.");
    }
    if (raw.length > 253 || /[\s/@?:#\\]/.test(raw) || raw.includes("://")) {
      throw new FocusError("INVALID_RULE", `\"${raw}\" is not a safe domain. Enter only a hostname such as example.com.`);
    }

    let domain;
    try {
      domain = new URL(`https://${raw}/`).hostname.toLowerCase().replace(/\.$/, "");
    } catch {
      throw new FocusError("INVALID_RULE", `\"${raw}\" is not a valid domain.`);
    }

    if (!domain || domain.length > 253 || domain.includes(":") || !isValidPublicHostname(domain)) {
      throw new FocusError("INVALID_RULE", `\"${raw}\" is not a valid public web domain.`);
    }
    if (isBlockedLocalDomain(domain)) {
      throw new FocusError("LOCAL_DOMAIN_NOT_ALLOWED", "Focus rules cannot block localhost or local network aliases.");
    }
    return domain;
  }

  function isValidPublicHostname(domain) {
    if (isValidIpv4(domain)) return true;
    if (!domain.includes(".")) return false;
    return domain.split(".").every((label) => (
      label.length >= 1
      && label.length <= 63
      && /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label)
    ));
  }

  function isValidIpv4(domain) {
    const parts = domain.split(".");
    return parts.length === 4 && parts.every((part) => (
      /^\d{1,3}$/.test(part) && Number(part) >= 0 && Number(part) <= 255
    ));
  }

  function isBlockedLocalDomain(domain) {
    if (["localhost", "home.arpa", "localdomain"].includes(domain) || domain.endsWith(".localhost")) return true;
    if (["0.0.0.0", "127.0.0.1"].includes(domain) || domain.startsWith("127.")) return true;
    return [".local", ".internal", ".intranet", ".lan", ".home", ".home.arpa", ".localdomain"]
      .some((suffix) => domain.endsWith(suffix));
  }

  function normalizePathPattern(value) {
    const raw = String(value === undefined || value === null || value === "" ? "/*" : value).trim();
    if (!raw.startsWith("/") || raw.startsWith("//")) {
      throw new FocusError("INVALID_RULE", "A focus rule path must start with one slash, for example /shorts/*.");
    }
    if (raw.length > MAX_PATH_LENGTH) {
      throw new FocusError("INVALID_RULE", `A focus rule path cannot exceed ${MAX_PATH_LENGTH} characters.`);
    }
    if (!/^\/[a-zA-Z0-9/_.%*~-]*$/.test(raw) || /[|^$()[\]{}+?&#:\\]/.test(raw)) {
      throw new FocusError(
        "INVALID_RULE",
        "A focus rule path may contain letters, numbers, slashes, dashes, dots, percent escapes, and * wildcards only."
      );
    }
    return raw.replace(/\*{2,}/g, "*");
  }

  function normalizeRuleId(value, index) {
    const id = String(value || "").trim();
    return /^[a-zA-Z0-9_-]{1,64}$/.test(id) ? id : `rule-${index + 1}`;
  }

  function normalizeFocusRule(value, index = 0) {
    const input = typeof value === "string" ? { domain: value } : value;
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      throw new FocusError("INVALID_RULE", "Each focus rule must contain a domain and optional path.");
    }
    return {
      id: normalizeRuleId(input.id, index),
      domain: normalizeDomain(input.domain),
      path: normalizePathPattern(input.path)
    };
  }

  function normalizeFocusRules(values, { allowEmpty = false } = {}) {
    if (!Array.isArray(values)) {
      throw new FocusError("INVALID_RULES", "Focus rules must be provided as a list.");
    }
    if (values.length > MAX_RULES) {
      throw new FocusError("TOO_MANY_RULES", `A focus session can use at most ${MAX_RULES} rules.`);
    }

    const seen = new Set();
    const usedIds = new Set();
    const rules = [];
    values.forEach((value, index) => {
      const rule = normalizeFocusRule(value, index);
      const key = `${rule.domain}\n${rule.path}`;
      if (seen.has(key)) return;
      seen.add(key);
      let id = normalizeRuleId(rule.id, rules.length);
      let suffix = rules.length + 1;
      while (usedIds.has(id)) {
        id = `rule-${suffix}`;
        suffix += 1;
      }
      usedIds.add(id);
      rules.push({ ...rule, id });
    });

    if (!allowEmpty && !rules.length) {
      throw new FocusError("NO_RULES", "Add at least one distracting site before starting Focus mode.");
    }
    return rules;
  }

  function getRequiredOrigin(rule) {
    const domain = normalizeDomain(rule?.domain);
    return isValidIpv4(domain) ? `*://${domain}/*` : `*://*.${domain}/*`;
  }

  function getRequiredOrigins(rules) {
    return [...new Set(normalizeFocusRules(rules).map(getRequiredOrigin))];
  }

  function getManifestOptionalHostPermissions(manifestValue) {
    const values = manifestValue?.optional_host_permissions;
    if (!Array.isArray(values)) return [];
    return [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))];
  }

  function validateFocusPermissionManifest(manifestValue) {
    const declaredOrigins = getManifestOptionalHostPermissions(manifestValue);
    if (declaredOrigins.includes(GLOBAL_OPTIONAL_HOST_PATTERN)) {
      return {
        valid: true,
        declaredOrigins,
        requiredOrigin: GLOBAL_OPTIONAL_HOST_PATTERN
      };
    }
    throw new FocusError(
      "EXTENSION_RELOAD_REQUIRED",
      EXTENSION_RELOAD_REQUIRED_MESSAGE,
      { declaredOrigins, requiredOrigin: GLOBAL_OPTIONAL_HOST_PATTERN }
    );
  }

  function createFocusPermissionPlan(rules, grantedOrigins, manifestValue) {
    validateFocusPermissionManifest(manifestValue);
    const requiredOrigins = getRequiredOrigins(rules);
    const granted = new Set((Array.isArray(grantedOrigins) ? grantedOrigins : [])
      .map((value) => String(value || "").trim())
      .filter(Boolean));
    return {
      requiredOrigins,
      missingOrigins: requiredOrigins.filter((origin) => !granted.has(origin)),
      requestOriginPattern: GLOBAL_OPTIONAL_HOST_PATTERN
    };
  }

  function toFocusPermissionRequestError(error, manifestValue) {
    const message = String(error?.message || error || "").replace(/\s+/g, " ").trim();
    const hasCurrentManifest = getManifestOptionalHostPermissions(manifestValue)
      .includes(GLOBAL_OPTIONAL_HOST_PATTERN);
    if (!hasCurrentManifest || /only permissions specified in the manifest may be requested/i.test(message)) {
      return new FocusError(
        "EXTENSION_RELOAD_REQUIRED",
        EXTENSION_RELOAD_REQUIRED_MESSAGE,
        { cause: message.slice(0, 240), requiredOrigin: GLOBAL_OPTIONAL_HOST_PATTERN }
      );
    }
    return new FocusError(
      "HOST_PERMISSION_REQUEST_FAILED",
      message || "Chrome could not request access to the distracting sites.",
      { cause: message.slice(0, 240) }
    );
  }

  function buildUrlFilter(rule) {
    const normalized = normalizeFocusRule(rule);
    if (normalized.path === "/*" || normalized.path === "/") {
      return `||${normalized.domain}^`;
    }
    return `||${normalized.domain}${normalized.path}`;
  }

  function buildSessionDnrRules(rules) {
    return normalizeFocusRules(rules).map((rule, index) => ({
      id: DNR_RULE_ID_BASE + index,
      priority: 1,
      action: { type: "block" },
      condition: {
        urlFilter: buildUrlFilter(rule),
        resourceTypes: ["main_frame"]
      }
    }));
  }

  function isManagedRuleId(value) {
    const id = Number(value);
    return Number.isInteger(id) && id >= DNR_RULE_ID_BASE && id < DNR_RULE_ID_LIMIT;
  }

  function normalizeHistory(values) {
    if (!Array.isArray(values)) return [];
    return values
      .filter((entry) => entry && typeof entry === "object")
      .map((entry) => ({
        sessionId: String(entry.sessionId || "").slice(0, 100),
        startedAt: normalizeNullableTime(entry.startedAt),
        endedAt: normalizeNullableTime(entry.endedAt),
        plannedMinutes: clampInteger(entry.plannedMinutes, 0, MAX_DURATION_MINUTES),
        elapsedMs: clampInteger(entry.elapsedMs ?? entry.activeMs, 0, MAX_DURATION_MINUTES * 60 * 1000),
        outcome: normalizeOutcome(entry.outcome),
        ruleCount: clampInteger(entry.ruleCount, 0, MAX_RULES)
      }))
      .filter((entry) => entry.startedAt !== null && entry.endedAt !== null)
      .slice(-MAX_HISTORY);
  }

  function normalizeChapterFocusHistory(values) {
    if (!Array.isArray(values)) return [];
    return values
      .filter((entry) => entry && typeof entry === "object")
      .map((entry) => ({
        sessionId: String(entry.sessionId || "").slice(0, 100),
        chapterId: String(entry.chapterId || "").slice(0, 100),
        chapterTitle: String(entry.chapterTitle || "").replace(/\s+/g, " ").trim().slice(0, 140),
        startedAt: normalizeNullableTime(entry.startedAt),
        endedAt: normalizeNullableTime(entry.endedAt),
        durationMs: clampInteger(entry.durationMs, 0, MAX_DURATION_MINUTES * 60 * 1000),
        lastActivityAt: normalizeNullableTime(entry.lastActivityAt),
        outcome: normalizeChapterFocusOutcome(entry.outcome)
      }))
      .filter((entry) => entry.sessionId && entry.chapterId && entry.startedAt !== null && entry.endedAt !== null)
      .slice(-MAX_CHAPTER_HISTORY);
  }

  function normalizeChapterTotals(value, history = []) {
    const totals = {};
    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.entries(value).slice(0, 500).forEach(([chapterId, duration]) => {
        const id = String(chapterId || "").slice(0, 100);
        if (id) totals[id] = clampInteger(duration, 0, 10 * 365 * 24 * 60 * 60 * 1000);
      });
    }
    if (!Object.keys(totals).length) {
      history.forEach((entry) => {
        totals[entry.chapterId] = (totals[entry.chapterId] || 0) + entry.durationMs;
      });
    }
    return totals;
  }

  function normalizeChapterFocusOutcome(value) {
    const outcome = String(value || "paused");
    return ["paused", "hidden", "inactive", "switched", "replaced", "closed"].includes(outcome)
      ? outcome
      : "paused";
  }

  function normalizeChapterFocusState(value, now = Date.now()) {
    const fallback = createDefaultChapterFocusState(now);
    if (!value || typeof value !== "object" || Array.isArray(value)) return fallback;
    const history = normalizeChapterFocusHistory(value.history);
    const chapterId = String(value.chapterId || "").slice(0, 100);
    const chapterTitle = String(value.chapterTitle || "").replace(/\s+/g, " ").trim().slice(0, 140);
    const startedAt = normalizeNullableTime(value.startedAt);
    const resumedAt = normalizeNullableTime(value.resumedAt);
    const lastActivityAt = normalizeNullableTime(value.lastActivityAt);
    const canRun = Boolean(value.active && value.status === "running" && value.sessionId && chapterId
      && startedAt !== null && resumedAt !== null && lastActivityAt !== null);
    const suppliedStatus = String(value.status || "idle");
    const status = canRun ? "running" : suppliedStatus === "paused" && chapterId ? "paused" : "idle";
    return {
      schemaVersion: 1,
      active: canRun,
      status,
      sessionId: canRun ? String(value.sessionId).slice(0, 100) : "",
      chapterId,
      chapterTitle,
      ownerId: canRun ? String(value.ownerId || "").slice(0, 100) : "",
      ownerTabId: canRun && value.ownerTabId !== null && value.ownerTabId !== undefined
        && Number.isInteger(Number(value.ownerTabId)) ? Number(value.ownerTabId) : null,
      startedAt: canRun ? startedAt : null,
      resumedAt: canRun ? resumedAt : null,
      lastActivityAt: canRun ? lastActivityAt : null,
      currentSessionMs: canRun ? clampInteger(value.currentSessionMs, 0, MAX_DURATION_MINUTES * 60 * 1000) : 0,
      lastSessionDurationMs: clampInteger(value.lastSessionDurationMs, 0, MAX_DURATION_MINUTES * 60 * 1000),
      chapterTotals: normalizeChapterTotals(value.chapterTotals, history),
      history,
      updatedAt: normalizeNullableTime(value.updatedAt) ?? normalizeNow(now)
    };
  }

  function getChapterFocusElapsedMs(stateValue, now = Date.now()) {
    const state = normalizeChapterFocusState(stateValue, now);
    if (!state.active || state.resumedAt === null) return state.currentSessionMs;
    return Math.max(0, state.currentSessionMs + normalizeNow(now) - state.resumedAt);
  }

  function pauseChapterFocusState(previousValue, now = Date.now(), outcome = "paused") {
    const currentTime = normalizeNow(now);
    const previous = normalizeChapterFocusState(previousValue, currentTime);
    if (!previous.active) return previous;
    const endedAt = Math.max(previous.startedAt, currentTime);
    const durationMs = Math.min(
      MAX_DURATION_MINUTES * 60 * 1000,
      Math.max(0, previous.currentSessionMs + endedAt - previous.resumedAt)
    );
    const entry = {
      sessionId: previous.sessionId,
      chapterId: previous.chapterId,
      chapterTitle: previous.chapterTitle,
      startedAt: previous.startedAt,
      endedAt,
      durationMs,
      lastActivityAt: previous.lastActivityAt,
      outcome: normalizeChapterFocusOutcome(outcome)
    };
    return {
      ...previous,
      active: false,
      status: "paused",
      sessionId: "",
      ownerId: "",
      ownerTabId: null,
      startedAt: null,
      resumedAt: null,
      lastActivityAt: null,
      currentSessionMs: 0,
      lastSessionDurationMs: durationMs,
      chapterTotals: {
        ...previous.chapterTotals,
        [previous.chapterId]: (previous.chapterTotals[previous.chapterId] || 0) + durationMs
      },
      history: [...previous.history, entry].slice(-MAX_CHAPTER_HISTORY),
      updatedAt: currentTime
    };
  }

  function selectChapterFocusState(previousValue, input, now = Date.now()) {
    const currentTime = normalizeNow(now);
    let previous = normalizeChapterFocusState(previousValue, currentTime);
    const chapterId = String(input?.chapterId || "").slice(0, 100);
    const chapterTitle = String(input?.chapterTitle || "").replace(/\s+/g, " ").trim().slice(0, 140);
    if (!chapterId) return previous;
    if (previous.active && previous.chapterId !== chapterId) {
      previous = pauseChapterFocusState(previous, currentTime, "switched");
    }
    return {
      ...previous,
      status: previous.active ? "running" : previous.chapterId === chapterId && previous.status === "paused" ? "paused" : "idle",
      chapterId,
      chapterTitle: chapterTitle || previous.chapterTitle,
      updatedAt: currentTime
    };
  }

  function startChapterFocusState(previousValue, input, now = Date.now(), sessionId = "") {
    const currentTime = normalizeNow(now);
    let previous = normalizeChapterFocusState(previousValue, currentTime);
    const chapterId = String(input?.chapterId || previous.chapterId || "").slice(0, 100);
    const chapterTitle = String(input?.chapterTitle || previous.chapterTitle || "").replace(/\s+/g, " ").trim().slice(0, 140);
    const ownerId = String(input?.ownerId || "").slice(0, 100);
    if (!chapterId) throw new FocusError("INVALID_CHAPTER", "Choose a chapter before starting its study timer.");
    if (!ownerId) throw new FocusError("INVALID_TIMER_OWNER", "The chapter timer could not identify this Learning Tree window.");
    if (previous.active) {
      if (previous.chapterId === chapterId && previous.ownerId === ownerId) return previous;
      previous = pauseChapterFocusState(previous, currentTime, previous.chapterId === chapterId ? "replaced" : "switched");
    }
    const nextSessionId = String(sessionId || "").trim();
    if (!nextSessionId) throw new FocusError("INVALID_SESSION", "The chapter timer could not create a session identifier.");
    return {
      ...previous,
      active: true,
      status: "running",
      sessionId: nextSessionId.slice(0, 100),
      chapterId,
      chapterTitle,
      ownerId,
      ownerTabId: input?.ownerTabId !== null && input?.ownerTabId !== undefined
        && Number.isInteger(Number(input.ownerTabId)) ? Number(input.ownerTabId) : null,
      startedAt: currentTime,
      resumedAt: currentTime,
      lastActivityAt: currentTime,
      currentSessionMs: 0,
      updatedAt: currentTime
    };
  }

  function recordChapterFocusActivity(previousValue, input, now = Date.now()) {
    const currentTime = normalizeNow(now);
    const previous = normalizeChapterFocusState(previousValue, currentTime);
    if (!previous.active || previous.ownerId !== String(input?.ownerId || "")
      || previous.chapterId !== String(input?.chapterId || "")) return previous;
    return { ...previous, lastActivityAt: currentTime, updatedAt: currentTime };
  }

  function reconcileChapterFocusState(previousValue, now = Date.now()) {
    const currentTime = normalizeNow(now);
    const previous = normalizeChapterFocusState(previousValue, currentTime);
    if (!previous.active || previous.lastActivityAt === null
      || currentTime - previous.lastActivityAt < CHAPTER_IDLE_TIMEOUT_MS) {
      return { state: previous, changed: false };
    }
    const endedAt = Math.min(currentTime, previous.lastActivityAt + CHAPTER_IDLE_TIMEOUT_MS);
    return { state: pauseChapterFocusState(previous, endedAt, "inactive"), changed: true };
  }

  function getChapterFocusedMs(stateValue, chapterId, now = Date.now()) {
    const state = normalizeChapterFocusState(stateValue, now);
    const id = String(chapterId || "");
    return (state.chapterTotals[id] || 0) + (state.active && state.chapterId === id ? getChapterFocusElapsedMs(state, now) : 0);
  }

  function getTotalChapterFocusedMs(stateValue, now = Date.now()) {
    const state = normalizeChapterFocusState(stateValue, now);
    const stored = Object.values(state.chapterTotals).reduce((total, duration) => total + Math.max(0, Number(duration) || 0), 0);
    return stored + (state.active ? getChapterFocusElapsedMs(state, now) : 0);
  }

  function normalizeNullableTime(value) {
    if (value === null || value === undefined || value === "") return null;
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? Math.floor(number) : null;
  }

  function clampInteger(value, min, max) {
    const number = Number(value);
    if (!Number.isFinite(number)) return min;
    return Math.min(max, Math.max(min, Math.floor(number)));
  }

  function normalizeOutcome(value) {
    const outcome = String(value || "stopped");
    return ["completed", "stopped", "replaced", "permission_removed", "error"].includes(outcome)
      ? outcome
      : "stopped";
  }

  function normalizeFocusState(value, now = Date.now()) {
    const fallback = createDefaultFocusState(now);
    if (!value || typeof value !== "object" || Array.isArray(value)) return fallback;

    let rules = [];
    try {
      rules = normalizeFocusRules(value.rules || [], { allowEmpty: true });
    } catch {
      rules = [];
    }

    const startedAt = normalizeNullableTime(value.startedAt);
    const endsAt = normalizeNullableTime(value.endsAt);
    const canBeActive = Boolean(value.active && value.sessionId && startedAt !== null && endsAt !== null && endsAt > startedAt && rules.length);
    return {
      schemaVersion: SCHEMA_VERSION,
      active: canBeActive,
      sessionId: canBeActive ? String(value.sessionId).slice(0, 100) : "",
      startedAt: canBeActive ? startedAt : null,
      endsAt: canBeActive ? endsAt : null,
      breakUntil: canBeActive ? normalizeNullableTime(value.breakUntil) : null,
      rules,
      history: normalizeHistory(value.history),
      lastError: String(value.lastError || "").slice(0, 240),
      updatedAt: normalizeNullableTime(value.updatedAt) ?? normalizeNow(now)
    };
  }

  function appendHistory(history, entry) {
    return [...normalizeHistory(history), entry].slice(-MAX_HISTORY);
  }

  function archiveActiveSession(state, endedAt, outcome) {
    if (!state.active || state.startedAt === null || state.endsAt === null) return state.history;
    const end = Math.max(state.startedAt, normalizeNow(endedAt));
    const plannedMs = Math.max(0, state.endsAt - state.startedAt);
    return appendHistory(state.history, {
      sessionId: state.sessionId,
      startedAt: state.startedAt,
      endedAt: end,
      plannedMinutes: Math.round(plannedMs / 60000),
      elapsedMs: Math.min(plannedMs, Math.max(0, end - state.startedAt)),
      outcome: normalizeOutcome(outcome),
      ruleCount: state.rules.length
    });
  }

  function startFocusState(previousValue, input, now = Date.now(), sessionId = "") {
    const currentTime = normalizeNow(now);
    const previous = normalizeFocusState(previousValue, currentTime);
    const durationMinutes = normalizeDurationMinutes(input?.durationMinutes);
    const rules = normalizeFocusRules(input?.rules);
    const nextSessionId = String(sessionId || "").trim();
    if (!nextSessionId) {
      throw new FocusError("INVALID_SESSION", "Focus mode could not create a session identifier.");
    }
    const history = previous.active
      ? archiveActiveSession(previous, currentTime, "replaced")
      : previous.history;

    return {
      schemaVersion: SCHEMA_VERSION,
      active: true,
      sessionId: nextSessionId.slice(0, 100),
      startedAt: currentTime,
      endsAt: currentTime + durationMinutes * 60 * 1000,
      breakUntil: null,
      rules,
      history,
      lastError: "",
      updatedAt: currentTime
    };
  }

  function stopFocusState(previousValue, now = Date.now(), outcome = "stopped") {
    const currentTime = normalizeNow(now);
    const previous = normalizeFocusState(previousValue, currentTime);
    const history = previous.active
      ? archiveActiveSession(previous, currentTime, outcome)
      : previous.history;
    return {
      ...previous,
      active: false,
      sessionId: "",
      startedAt: null,
      endsAt: null,
      breakUntil: null,
      history,
      updatedAt: currentTime
    };
  }

  function applyFiveMinuteBreak(previousValue, now = Date.now()) {
    const currentTime = normalizeNow(now);
    const previous = normalizeFocusState(previousValue, currentTime);
    if (!previous.active || previous.endsAt <= currentTime) {
      throw new FocusError("NO_ACTIVE_FOCUS", "Start Focus mode before taking a break.");
    }
    if (previous.breakUntil && previous.breakUntil > currentTime) return previous;
    return {
      ...previous,
      breakUntil: currentTime + BREAK_DURATION_MS,
      lastError: "",
      updatedAt: currentTime
    };
  }

  function reconcileFocusState(previousValue, now = Date.now()) {
    const currentTime = normalizeNow(now);
    let state = normalizeFocusState(previousValue, currentTime);
    let changed = false;

    if (state.active && state.endsAt <= currentTime) {
      state = stopFocusState(state, state.endsAt, "completed");
      state.updatedAt = currentTime;
      changed = true;
    } else if (state.active && state.breakUntil !== null && state.breakUntil <= currentTime) {
      state = { ...state, breakUntil: null, updatedAt: currentTime };
      changed = true;
    }
    return { state, changed };
  }

  function shouldBlock(stateValue, now = Date.now()) {
    const state = normalizeFocusState(stateValue, now);
    const currentTime = normalizeNow(now);
    return Boolean(
      state.active
      && state.endsAt > currentTime
      && (!state.breakUntil || state.breakUntil <= currentTime)
    );
  }

  function toPublicFocusState(stateValue, now = Date.now()) {
    const currentTime = normalizeNow(now);
    const { state } = reconcileFocusState(stateValue, currentTime);
    const onBreak = Boolean(state.active && state.breakUntil && state.breakUntil > currentTime);
    return {
      ...state,
      status: state.active ? (onBreak ? "break" : "active") : "inactive",
      remainingMs: state.active ? Math.max(0, state.endsAt - currentTime) : 0,
      breakRemainingMs: onBreak ? Math.max(0, state.breakUntil - currentTime) : 0,
      requiredOrigins: state.rules.length ? getRequiredOrigins(state.rules) : []
    };
  }

  return Object.freeze({
    SCHEMA_VERSION,
    STORAGE_KEY,
    END_ALARM,
    BREAK_ALARM,
    BREAK_DURATION_MS,
    MIN_DURATION_MINUTES,
    MAX_DURATION_MINUTES,
    MAX_RULES,
    MAX_HISTORY,
    CHAPTER_STORAGE_KEY,
    CHAPTER_IDLE_ALARM,
    CHAPTER_IDLE_TIMEOUT_MS,
    MAX_CHAPTER_HISTORY,
    FOCUS_SESSION_TIME_LABEL,
    GLOBAL_OPTIONAL_HOST_PATTERN,
    EXTENSION_RELOAD_REQUIRED_MESSAGE,
    DNR_RULE_ID_BASE,
    DNR_RULE_ID_LIMIT,
    MESSAGE_TYPES,
    CHAPTER_MESSAGE_TYPES,
    FocusError,
    createDefaultFocusState,
    createDefaultChapterFocusState,
    normalizeDurationMinutes,
    resolveDurationMinutes,
    getDurationControlState,
    getPlannedDurationMinutes,
    getRecordedSessionTimeMinutes,
    formatElapsedFocusTime,
    normalizeDomain,
    normalizePathPattern,
    normalizeFocusRule,
    normalizeFocusRules,
    normalizeFocusState,
    normalizeChapterFocusState,
    getRequiredOrigin,
    getRequiredOrigins,
    getManifestOptionalHostPermissions,
    validateFocusPermissionManifest,
    createFocusPermissionPlan,
    toFocusPermissionRequestError,
    buildUrlFilter,
    buildSessionDnrRules,
    isManagedRuleId,
    startFocusState,
    stopFocusState,
    applyFiveMinuteBreak,
    reconcileFocusState,
    shouldBlock,
    toPublicFocusState,
    selectChapterFocusState,
    startChapterFocusState,
    pauseChapterFocusState,
    recordChapterFocusActivity,
    reconcileChapterFocusState,
    getChapterFocusElapsedMs,
    getChapterFocusedMs,
    getTotalChapterFocusedMs
  });
});
