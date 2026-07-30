(function initExamCramHostedAccount(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.ExamCramHostedAccount = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function buildExamCramHostedAccount() {
  "use strict";

  const ACTIONS = Object.freeze({
    STUDY_BUILD: "study_build",
    QUIZ_BUILD: "quiz_build",
    VISUAL_FOLLOWUP: "visual_followup",
    JOURNEY_SUMMARY: "journey_summary",
    CLASSIFICATION_BATCH: "classification_batch",
    VIDEO_PROCESSING: "video_processing",
    MULTI_SOURCE_PREVIEW: "multi_source_preview"
  });

  const ACTION_LABELS = Object.freeze({
    [ACTIONS.STUDY_BUILD]: "study builds",
    [ACTIONS.QUIZ_BUILD]: "quiz builds",
    [ACTIONS.VISUAL_FOLLOWUP]: "Visual Tutor follow-ups",
    [ACTIONS.JOURNEY_SUMMARY]: "Journey summaries",
    [ACTIONS.CLASSIFICATION_BATCH]: "classification batches",
    [ACTIONS.VIDEO_PROCESSING]: "video processing",
    [ACTIONS.MULTI_SOURCE_PREVIEW]: "multi-source previews"
  });

  function normalizeHttpsOrigin(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    try {
      const parsed = new URL(raw);
      if (
        parsed.protocol !== "https:"
        || parsed.username
        || parsed.password
        || parsed.pathname !== "/"
        || parsed.search
        || parsed.hash
      ) {
        return "";
      }
      return parsed.origin;
    } catch {
      return "";
    }
  }

  function resolveConfig(value = {}) {
    const enabled = value.enabled === true;
    const apiOrigin = normalizeHttpsOrigin(value.apiOrigin);
    const allowedApiOrigins = [...new Set(
      (Array.isArray(value.allowedApiOrigins) ? value.allowedApiOrigins : [])
        .map(normalizeHttpsOrigin)
        .filter(Boolean)
    )];
    let reason = "ready";
    if (!enabled) reason = "disabled";
    else if (!apiOrigin) reason = "origin_missing_or_insecure";
    else if (!allowedApiOrigins.includes(apiOrigin)) reason = "origin_not_allowlisted";
    return Object.freeze({
      enabled,
      active: reason === "ready",
      reason,
      apiOrigin,
      allowedApiOrigins: Object.freeze(allowedApiOrigins)
    });
  }

  function isHostedRequested(settings = {}) {
    return String(settings.backendMode || "").toLowerCase() === "hosted";
  }

  function isHostedMode(settings = {}, config = {}) {
    return isHostedRequested(settings) && resolveConfig(config).active;
  }

  function buildApiUrl(config, pathname) {
    const resolved = resolveConfig(config);
    if (!resolved.active) return "";
    const safePath = String(pathname || "");
    if (!/^\/(?:api|v1)\/[a-z0-9][a-z0-9/_-]*$/i.test(safePath)) return "";
    const url = new URL(safePath, `${resolved.apiOrigin}/`);
    return url.origin === resolved.apiOrigin ? url.href : "";
  }

  function normalizeAllowance(value = {}) {
    const action = String(value.action || "").toLowerCase();
    if (!Object.values(ACTIONS).includes(action)) return null;
    const rawLimit = value.limit;
    const rawRemaining = value.remaining;
    const limit = rawLimit === null ? null : toNonNegativeNumber(rawLimit);
    const remaining = limit === null && rawRemaining === null
      ? null
      : Math.min(limit === null ? Number.MAX_SAFE_INTEGER : limit, toNonNegativeNumber(rawRemaining));
    const period = value.period && typeof value.period === "object" ? value.period : {};
    return Object.freeze({
      action,
      unit: String(value.unit || "action").slice(0, 40),
      limit,
      remaining,
      committed: toNonNegativeNumber(value.committed),
      reserved: toNonNegativeNumber(value.reserved),
      period: Object.freeze({
        kind: String(period.kind || "").slice(0, 60),
        start: normalizeDate(period.start),
        end: normalizeDate(period.end)
      })
    });
  }

  function normalizeSnapshot(value = {}) {
    const account = value.account && typeof value.account === "object" ? value.account : null;
    const entitlement = value.entitlement && typeof value.entitlement === "object" ? value.entitlement : null;
    const allowances = (Array.isArray(value.allowances) ? value.allowances : [])
      .map(normalizeAllowance)
      .filter(Boolean);
    return Object.freeze({
      authenticated: Boolean(account?.id),
      account: account ? Object.freeze({
        id: String(account.id || "").slice(0, 160),
        email: String(account.email || "").slice(0, 320),
        state: String(account.state || "").slice(0, 40)
      }) : null,
      entitlement: entitlement ? Object.freeze({
        plan: String(entitlement.plan || value.plan || "free").slice(0, 40),
        status: String(entitlement.status || "free").slice(0, 60),
        effectiveEnd: normalizeDate(entitlement.effectiveEnd),
        cancelAtPeriodEnd: Boolean(entitlement.cancelAtPeriodEnd)
      }) : null,
      policyVersion: String(value.policyVersion || entitlement?.policyVersion || "").slice(0, 80),
      allowances: Object.freeze(allowances),
      refreshedAt: normalizeDate(value.refreshedAt) || new Date(0).toISOString()
    });
  }

  function decideAction({ settings = {}, config = {}, snapshot = null, action, units = 1 } = {}) {
    if (!isHostedRequested(settings)) {
      return Object.freeze({ hosted: false, allowed: true, code: "NOT_HOSTED", action: String(action || ""), units: 0 });
    }
    const resolvedConfig = resolveConfig(config);
    if (!resolvedConfig.active) {
      return deny("HOSTED_FEATURE_UNAVAILABLE", action, units);
    }
    const normalizedUnits = toPositiveInteger(units);
    if (!snapshot) return deny("HOSTED_ENTITLEMENT_UNAVAILABLE", action, normalizedUnits);
    const normalized = normalizeSnapshot(snapshot);
    if (!normalized.authenticated) return deny("HOSTED_AUTH_REQUIRED", action, normalizedUnits);
    const allowance = normalized.allowances.find((item) => item.action === action);
    if (!allowance) return deny("HOSTED_ENTITLEMENT_UNAVAILABLE", action, normalizedUnits);
    if (allowance.remaining !== null && allowance.remaining < normalizedUnits) {
      return Object.freeze({
        hosted: true,
        allowed: false,
        code: "ALLOWANCE_EXHAUSTED",
        action,
        units: normalizedUnits,
        allowance
      });
    }
    return Object.freeze({
      hosted: true,
      allowed: true,
      code: "ALLOWANCE_AVAILABLE",
      action,
      units: normalizedUnits,
      allowance
    });
  }

  function deny(code, action, units) {
    return Object.freeze({
      hosted: true,
      allowed: false,
      code,
      action: String(action || ""),
      units: toPositiveInteger(units)
    });
  }

  function allowanceLabel(allowance) {
    const normalized = normalizeAllowance(allowance);
    if (!normalized) return "";
    const label = ACTION_LABELS[normalized.action] || "hosted actions";
    if (normalized.remaining === null) return `${label}: included`;
    if (normalized.unit === "millisecond") {
      return `${label}: ${formatMinutes(normalized.remaining)} remaining`;
    }
    return `${label}: ${Math.floor(normalized.remaining)} remaining`;
  }

  function resetLabel(allowance) {
    const normalized = normalizeAllowance(allowance);
    if (normalized?.period.kind === "lifetime") {
      return "Lifetime allowance · does not reset";
    }
    if (!normalized?.period.end) return "";
    const formatted = new Date(normalized.period.end).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
    return `Resets ${formatted}`;
  }

  function formatMinutes(milliseconds) {
    const minutes = Math.max(0, Number(milliseconds) || 0) / 60000;
    if (minutes === 0) return "0 min";
    if (minutes < 1) return "<1 min";
    return `${Math.floor(minutes)} min`;
  }

  function planLabel(snapshot) {
    const normalized = normalizeSnapshot(snapshot);
    return normalized.entitlement?.plan === "student_pro" ? "Student Pro" : "Free";
  }

  function multiSourceMeteringAction(snapshot) {
    const normalized = normalizeSnapshot(snapshot || {});
    return normalized.entitlement?.plan === "student_pro"
      ? ACTIONS.STUDY_BUILD
      : ACTIONS.MULTI_SOURCE_PREVIEW;
  }

  function normalizeDate(value) {
    if (value === null || value === undefined || value === "") return null;
    const timestamp = Date.parse(value);
    return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
  }

  function toNonNegativeNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.max(0, number) : 0;
  }

  function toPositiveInteger(value) {
    const number = Math.round(Number(value) || 1);
    return Math.max(1, Math.min(12 * 60 * 60 * 1000, number));
  }

  return Object.freeze({
    ACTIONS,
    ACTION_LABELS,
    allowanceLabel,
    buildApiUrl,
    decideAction,
    formatMinutes,
    isHostedMode,
    isHostedRequested,
    multiSourceMeteringAction,
    normalizeAllowance,
    normalizeHttpsOrigin,
    normalizeSnapshot,
    planLabel,
    resetLabel,
    resolveConfig
  });
});
