(function attachLearningForestData(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.ExamCramLearningForestData = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createLearningForestData() {
  "use strict";

  const MAX_CONCEPTS = 7;

  function cleanText(value, maxLength = 180) {
    return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, maxLength);
  }

  function activityTime(value) {
    const timestamp = Date.parse(value?.submittedAt || value?.generatedAt || value?.createdAt || "");
    return Number.isFinite(timestamp) ? timestamp : 0;
  }

  function stableSeed(value) {
    const text = cleanText(value, 300) || "learning-tree";
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function normalizeArtifacts(value) {
    return Array.isArray(value)
      ? value.filter((artifact) => artifact && typeof artifact === "object" && cleanText(artifact.id, 100))
      : [];
  }

  function artifactBelongsToChapter(artifact, chapter, sessionIds) {
    const artifactId = cleanText(artifact?.id, 100);
    if (artifactId && sessionIds.has(artifactId)) return true;
    const boundChapterId = cleanText(
      artifact?.journeyChapterId || artifact?.sourceBinding?.chapterId,
      100
    );
    return Boolean(boundChapterId && boundChapterId === chapter.id);
  }

  function getChapterArtifacts(chapter, artifacts) {
    const sessionIds = new Set((Array.isArray(chapter?.sessions) ? chapter.sessions : [])
      .map((session) => cleanText(session?.id, 100))
      .filter(Boolean));
    return normalizeArtifacts(artifacts)
      .filter((artifact) => artifactBelongsToChapter(artifact, chapter, sessionIds))
      .sort((first, second) => activityTime(second) - activityTime(first));
  }

  function uniqueConcepts(items) {
    const seen = new Set();
    const result = [];
    for (const item of Array.isArray(items) ? items : []) {
      const label = cleanText(item?.label ?? item, 120);
      const key = label.toLocaleLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      result.push({
        id: cleanText(item?.id, 100) || `concept-${result.length + 1}`,
        label,
        role: cleanText(item?.role, 100),
        detail: cleanText(item?.detail || item?.why, 420),
        sourceId: cleanText(item?.sourceId || item?.sourceRef?.sourceId, 100)
      });
      if (result.length >= MAX_CONCEPTS) break;
    }
    return result;
  }

  function conceptsFromArtifact(artifact) {
    return uniqueConcepts(artifact?.visualLesson?.visualModel?.nodes);
  }

  function conceptsFromLegacySession(session) {
    const terms = uniqueConcepts((Array.isArray(session?.keyTerms) ? session.keyTerms : [])
      .map((label, index) => ({ id: `term-${index + 1}`, label })));
    if (terms.length) return terms;
    return uniqueConcepts((Array.isArray(session?.summary) ? session.summary : [])
      .map((label, index) => ({ id: `summary-${index + 1}`, label })));
  }

  function getLatestSession(chapter) {
    return [...(Array.isArray(chapter?.sessions) ? chapter.sessions : [])]
      .sort((first, second) => activityTime(second) - activityTime(first))[0] || null;
  }

  function buildForestRecord(chapter, artifacts, getChapterStatus) {
    const chapterArtifacts = getChapterArtifacts(chapter, artifacts);
    let conceptArtifact = null;
    let concepts = [];
    for (const artifact of chapterArtifacts) {
      const candidate = conceptsFromArtifact(artifact);
      if (!candidate.length) continue;
      conceptArtifact = artifact;
      concepts = candidate;
      break;
    }
    if (!concepts.length) concepts = conceptsFromLegacySession(getLatestSession(chapter));
    return {
      id: cleanText(chapter.id, 100),
      name: cleanText(chapter.title, 140) || "Untitled note",
      createdAt: cleanText(chapter.createdAt, 50),
      updatedAt: cleanText(chapter.updatedAt, 50),
      status: typeof getChapterStatus === "function" ? getChapterStatus(chapter) : "current",
      seed: stableSeed(chapter.id),
      concepts,
      isSeedling: concepts.length === 0,
      sourceCount: Array.isArray(chapter.sources) ? chapter.sources.length : 0,
      sessionCount: Array.isArray(chapter.sessions) ? chapter.sessions.length : 0,
      latestArtifactId: cleanText(conceptArtifact?.id || chapterArtifacts[0]?.id, 100)
    };
  }

  function buildForestRecords(journey, savedArtifacts, options = {}) {
    const chapters = Array.isArray(journey?.chapters) ? journey.chapters : [];
    return chapters
      .filter((chapter) => chapter && typeof chapter === "object" && cleanText(chapter.id, 100))
      .map((chapter) => buildForestRecord(chapter, savedArtifacts, options.getChapterStatus));
  }

  return Object.freeze({
    MAX_CONCEPTS,
    activityTime,
    artifactBelongsToChapter,
    buildForestRecords,
    conceptsFromArtifact,
    getChapterArtifacts,
    stableSeed,
    uniqueConcepts
  });
});
