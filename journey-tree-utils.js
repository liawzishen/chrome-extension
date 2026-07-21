(function attachLearningForestData(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.NeatMindLearningForestData = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createLearningForestData() {
  "use strict";

  const MAX_CONCEPTS = 7;
  const MAX_VISUAL_NOTES_PER_CHAPTER = 8;

  function growthStageForUnitCount(value) {
    const count = Math.max(0, Math.floor(Number(value) || 0));
    if (count === 0) return "plot";
    if (count <= 2) return "seedling";
    if (count <= 5) return "growing";
    return "mature";
  }

  // Kept as an alias for callers from the first forest prototype. Growth is no
  // longer driven by the latest note's concept count; it uses saved learning
  // units (distinct sources plus distinct saved visual notes).
  const growthStageForConceptCount = growthStageForUnitCount;

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
    const boundChapterId = cleanText(
      artifact?.journeyChapterId || artifact?.sourceBinding?.chapterId,
      100
    );
    if (boundChapterId) return boundChapterId === chapter.id;
    const artifactId = cleanText(artifact?.id, 100);
    return Boolean(artifactId && sessionIds.has(artifactId));
  }

  function getChapterArtifacts(chapter, artifacts) {
    const sessionIds = new Set((Array.isArray(chapter?.sessions) ? chapter.sessions : [])
      .map((session) => cleanText(session?.id, 100))
      .filter(Boolean));
    return normalizeArtifacts(artifacts)
      .filter((artifact) => artifactBelongsToChapter(artifact, chapter, sessionIds))
      .sort((first, second) => activityTime(second) - activityTime(first));
  }

  function getDistinctChapterSources(chapter) {
    const seen = new Set();
    const result = [];
    for (const [index, source] of (Array.isArray(chapter?.sources) ? chapter.sources : []).entries()) {
      if (!source || typeof source !== "object") continue;
      const id = cleanText(source.id, 100);
      const fingerprint = cleanText(source.fingerprint, 100);
      const url = cleanText(source.url || source.canonicalUrl, 2000);
      // Current Journey records always have source IDs. The fingerprint/URL
      // fallbacks keep older pre-ID data useful without joining it to another
      // chapter or relying on a similar title.
      const identity = id
        ? `id:${id}`
        : fingerprint
          ? `fingerprint:${fingerprint}`
          : url
            ? `url:${url}`
            : `legacy:${index}`;
      if (seen.has(identity)) continue;
      seen.add(identity);
      result.push(source);
    }
    return result;
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

  function getVisualModel(artifact) {
    const visualModel = artifact?.visualLesson?.visualModel;
    return visualModel && typeof visualModel === "object" && !Array.isArray(visualModel)
      ? visualModel
      : null;
  }

  function visualNoteBranchIdentity(item) {
    const binding = item?.sourceBinding && typeof item.sourceBinding === "object"
      ? item.sourceBinding
      : {};
    const sourceType = cleanText(item?.sourceType || binding.sourceType || binding.type, 40) || "webpage";
    if (sourceType === "collection") {
      const compositionRevision = cleanText(
        item?.compositionRevisionHash
        || binding.compositionRevisionHash
        || item?.sourceRevisionHash
        || binding.sourceRevisionHash
        || item?.sourceFingerprint
        || binding.fingerprint,
        120
      );
      if (compositionRevision) return `collection:${compositionRevision}`;
    }
    const fingerprint = cleanText(item?.sourceFingerprint || binding.fingerprint, 120);
    const url = cleanText(item?.sourceUrl || binding.url, 2000);
    if (fingerprint) return `${sourceType}:${url}:${fingerprint}`;
    const sourceId = cleanText(item?.sourceId || binding.sourceId, 100);
    if (sourceId) return `${sourceType}:source:${sourceId}`;
    return `note:${cleanText(item?.noteId || item?.id, 100)}`;
  }

  function getChapterVisualNotes(chapter, artifacts) {
    const seenNoteIds = new Set();
    const representedIds = new Set();
    const visualNotes = [];
    for (const artifact of getChapterArtifacts(chapter, artifacts)) {
      const visualModel = getVisualModel(artifact);
      if (!visualModel) continue;
      const artifactId = cleanText(artifact.id, 100);
      const noteId = cleanText(artifact.noteId || artifact.id, 100);
      if (!artifactId || !noteId || seenNoteIds.has(noteId)) continue;
      seenNoteIds.add(noteId);
      const binding = artifact.sourceBinding && typeof artifact.sourceBinding === "object"
        ? artifact.sourceBinding
        : {};
      const sources = [
        ...(Array.isArray(artifact.sources) ? artifact.sources : []),
        ...(Array.isArray(binding.collectionSources) ? binding.collectionSources : [])
      ].filter((source) => source && typeof source === "object");
      visualNotes.push({
        id: artifactId,
        noteId,
        title: cleanText(artifact.title || artifact.visualLesson?.title, 180) || "Visual note",
        generatedAt: cleanText(artifact.generatedAt || artifact.createdAt, 50),
        createdAt: cleanText(artifact.generatedAt || artifact.createdAt, 50),
        updatedAt: cleanText(
          artifact.submittedAt || artifact.quizGeneratedAt || artifact.generatedAt || artifact.createdAt,
          50
        ),
        activityAt: cleanText(
          artifact.submittedAt || artifact.quizGeneratedAt || artifact.generatedAt || artifact.createdAt,
          50
        ),
        sourceIds: [...new Set([
          binding.sourceId,
          artifact.sourceId,
          ...sources.map((source) => source.id || source.sourceId)
        ].map((value) => cleanText(value, 100)).filter(Boolean))],
        sourceUrls: [...new Set([
          binding.url,
          artifact.sourceUrl,
          ...sources.map((source) => source.url)
        ].map((value) => cleanText(value, 2000)).filter(Boolean))],
        sources,
        visualModel,
        concepts: conceptsFromArtifact(artifact),
        branchIdentity: visualNoteBranchIdentity(artifact),
        hasFullArtifact: true
      });
      representedIds.add(artifactId);
      representedIds.add(noteId);
    }
    // Journey keeps a compact session record after the full library artifact
    // has been evicted. Preserve those saved Visual Notes as branches, while
    // preferring the richer artifact descriptor whenever both records exist.
    for (const session of Array.isArray(chapter?.sessions) ? chapter.sessions : []) {
      if (!session || typeof session !== "object" || !session.hasVisualNote) continue;
      const sessionId = cleanText(session.id, 100);
      const noteId = cleanText(session.noteId || session.id, 100);
      if (!sessionId || !noteId || seenNoteIds.has(noteId) || representedIds.has(sessionId)) continue;
      seenNoteIds.add(noteId);
      representedIds.add(sessionId);
      representedIds.add(noteId);
      const generatedAt = cleanText(session.generatedAt || session.createdAt, 50);
      const activityAt = cleanText(
        session.submittedAt || session.quizGeneratedAt || session.generatedAt || session.createdAt,
        50
      );
      visualNotes.push({
        id: sessionId,
        noteId,
        title: cleanText(session.title, 180) || "Visual note",
        generatedAt,
        createdAt: generatedAt,
        updatedAt: activityAt,
        activityAt,
        sourceIds: [cleanText(session.sourceId, 100)].filter(Boolean),
        sourceUrls: [cleanText(session.sourceUrl, 2000)].filter(Boolean),
        sources: [],
        visualModel: null,
        concepts: conceptsFromLegacySession(session),
        branchIdentity: visualNoteBranchIdentity(session),
        hasFullArtifact: false
      });
    }
    const sorted = visualNotes.sort((first, second) => {
      const firstCreated = Date.parse(first.generatedAt || first.createdAt || "");
      const secondCreated = Date.parse(second.generatedAt || second.createdAt || "");
      return (Number.isFinite(secondCreated) ? secondCreated : 0)
        - (Number.isFinite(firstCreated) ? firstCreated : 0)
        || Number(second.hasFullArtifact) - Number(first.hasFullArtifact);
    });
    const seenBranches = new Set();
    return sorted
      .filter((note) => {
        const identity = note.branchIdentity || `note:${note.noteId}`;
        if (seenBranches.has(identity)) return false;
        seenBranches.add(identity);
        return true;
      })
      .slice(0, MAX_VISUAL_NOTES_PER_CHAPTER)
      .map(({ branchIdentity, hasFullArtifact, ...note }) => note);
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
    const distinctSources = getDistinctChapterSources(chapter);
    const visualNotes = getChapterVisualNotes(chapter, artifacts);
    let conceptArtifact = visualNotes[0]
      ? chapterArtifacts.find((artifact) => cleanText(artifact.id, 100) === visualNotes[0].id) || null
      : null;
    let concepts = conceptsFromArtifact(conceptArtifact);
    for (const artifact of concepts.length ? [] : chapterArtifacts) {
      const candidate = conceptsFromArtifact(artifact);
      if (!candidate.length) continue;
      conceptArtifact = artifact;
      concepts = candidate;
      break;
    }
    if (!concepts.length) concepts = conceptsFromLegacySession(getLatestSession(chapter));
    const conceptCount = concepts.length;
    const sourceCount = distinctSources.length;
    const visualNoteCount = visualNotes.length;
    const growthUnitCount = sourceCount + visualNoteCount;
    const growthStage = growthStageForUnitCount(growthUnitCount);
    return {
      id: cleanText(chapter.id, 100),
      name: cleanText(chapter.title, 140) || "Untitled note",
      createdAt: cleanText(chapter.createdAt, 50),
      updatedAt: cleanText(chapter.updatedAt, 50),
      status: typeof getChapterStatus === "function" ? getChapterStatus(chapter) : "current",
      seed: stableSeed(chapter.id),
      concepts,
      conceptCount,
      visualNotes,
      visualNoteCount,
      growthUnitCount,
      growthStage,
      isBarePlot: growthStage === "plot",
      // Retained for older consumers that use this flag as "needs a note".
      isSeedling: concepts.length === 0,
      sourceCount,
      sessionCount: Array.isArray(chapter.sessions) ? chapter.sessions.length : 0,
      latestArtifactId: cleanText(visualNotes[0]?.id || conceptArtifact?.id || chapterArtifacts[0]?.id, 100)
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
    MAX_VISUAL_NOTES_PER_CHAPTER,
    activityTime,
    artifactBelongsToChapter,
    buildForestRecords,
    conceptsFromArtifact,
    getChapterVisualNotes,
    getChapterArtifacts,
    getDistinctChapterSources,
    growthStageForConceptCount,
    growthStageForUnitCount,
    stableSeed,
    uniqueConcepts,
    visualNoteBranchIdentity
  });
});
