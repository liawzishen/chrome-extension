(function attachNeatMindExport(global) {
  "use strict";

  const MODEL_SCHEMA = "neatmind-export-v1";
  const SECTION_KEYS = ["visualNote", "keyPoints", "sources", "quiz", "answerKey"];
  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const LIMITS = Object.freeze({
    title: 180,
    text: 1200,
    excerpt: 500,
    url: 2048,
    keyPoints: 12,
    concepts: 18,
    relationships: 24,
    scenarios: 12,
    sources: 30,
    questions: 50,
    choices: 8
  });

  function text(value, max = LIMITS.text) {
    return String(value ?? "")
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
      .replace(/\r\n?/g, "\n")
      .trim()
      .slice(0, max);
  }

  function list(value, max = 100) {
    return Array.isArray(value) ? value.slice(0, max) : [];
  }

  function stringList(value, max = 100, itemMax = LIMITS.text) {
    return list(value, max).map((item) => text(item, itemMax)).filter(Boolean);
  }

  function safeHttpUrl(value) {
    try {
      const url = new URL(text(value, LIMITS.url));
      return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch {
      return "";
    }
  }

  function hostnameFromUrl(value) {
    try {
      return new URL(value).hostname.replace(/^www\./i, "");
    } catch {
      return "";
    }
  }

  function safeIsoDate(value, fallback = "") {
    if (value === null || value === undefined || value === "") return fallback;
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date.toISOString() : fallback;
  }

  function dateStamp(value = new Date()) {
    const date = new Date(value);
    const safe = Number.isFinite(date.getTime()) ? date : new Date();
    return `${safe.getFullYear()}-${String(safe.getMonth() + 1).padStart(2, "0")}-${String(safe.getDate()).padStart(2, "0")}`;
  }

  function finiteTimestamp(...values) {
    for (const value of values) {
      if (value === null || value === undefined || value === "") continue;
      const parsed = Number(value);
      if (Number.isFinite(parsed) && parsed >= 0) return Math.round(parsed * 1000) / 1000;
    }
    return null;
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

  function slugify(value) {
    return text(value || "study-material", LIMITS.title)
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 70) || "study-material";
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function sanitizeCitation(value, fallback = {}) {
    const citation = value && typeof value === "object" ? value : {};
    const sourceRef = citation.sourceRef && typeof citation.sourceRef === "object" ? citation.sourceRef : {};
    const url = safeHttpUrl(citation.url || sourceRef.url || fallback.url);
    return {
      title: text(citation.title || sourceRef.title || fallback.title || "Source", LIMITS.title),
      url,
      excerpt: text(citation.excerpt || citation.quote || citation.sourceAnchor || citation.sourceText, LIMITS.excerpt),
      timestamp: finiteTimestamp(citation.timestamp, citation.sourceTimestamp, Number(sourceRef.startMs) / 1000),
      timestampConfidence: text(citation.timestampConfidence || fallback.timestampConfidence, 40)
    };
  }

  function sanitizeSource(value, fallback = {}) {
    const source = value && typeof value === "object" ? value : {};
    const url = safeHttpUrl(source.url || source.sourceUrl || fallback.url);
    return {
      title: text(source.title || source.sourceTitle || fallback.title || hostnameFromUrl(url) || "Source", LIMITS.title),
      url,
      hostname: hostnameFromUrl(url),
      type: text(source.type || source.sourceType || fallback.type || "webpage", 40),
      timestamp: finiteTimestamp(source.timestamp, source.sourceTimestamp, Number(source.startMs) / 1000),
      timestampConfidence: text(source.timestampConfidence || fallback.timestampConfidence, 40)
    };
  }

  function sourceKey(source) {
    return `${String(source.url).toLowerCase()}|${String(source.title).toLowerCase()}|${source.timestamp ?? ""}`;
  }

  function uniqueSources(values) {
    const seen = new Set();
    return values.filter((source) => {
      if (!source?.url && !source?.title) return false;
      const key = sourceKey(source);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, LIMITS.sources);
  }

  function sanitizeConcept(node, index, sourceFallback) {
    const value = node && typeof node === "object" ? node : {};
    return {
      id: text(value.id || `concept-${index + 1}`, 80),
      symbol: text(value.symbol, 16),
      label: text(value.label || value.title || `Concept ${index + 1}`, LIMITS.title),
      role: text(value.role || "Concept", 80),
      detail: text(value.detail || value.description || value.summary),
      why: text(value.why || value.whyItMatters),
      example: text(value.example),
      citation: sanitizeCitation(value.citation || value, sourceFallback)
    };
  }

  function sanitizeScenario(value) {
    const scenario = value && typeof value === "object" ? value : {};
    return {
      label: text(scenario.label || "Scenario", LIMITS.title),
      prompt: text(scenario.prompt),
      outcome: text(scenario.outcome),
      insight: text(scenario.insight)
    };
  }

  function sanitizeCheatSheet(value) {
    const sheet = value && typeof value === "object" ? value : {};
    const rows = list(sheet.rows, 8).map((row, index) => {
      const evidence = row?.evidence && typeof row.evidence === "object" ? row.evidence : {};
      return {
        id: text(row?.id || `cheat-${index + 1}`, 100),
        topic: text(row?.topic, 120),
        mainIdea: text(row?.mainIdea, 360),
        keyFacts: text(row?.keyFacts, 360),
        example: text(row?.example, 320),
        evidence: {
          label: text(evidence.label, 180),
          anchor: text(evidence.anchor || evidence.quote, 320),
          url: safeHttpUrl(evidence.url),
          pageNumber: Number.isInteger(Number(evidence.pageNumber)) && Number(evidence.pageNumber) > 0
            ? Math.round(Number(evidence.pageNumber))
            : null,
          timestampSeconds: Number.isFinite(Number(evidence.timestampSeconds)) && Number(evidence.timestampSeconds) >= 0
            ? Math.round(Number(evidence.timestampSeconds))
            : null
        }
      };
    }).filter((row) => row.topic && row.mainIdea);
    return {
      title: text(sheet.title || "Cheat sheet", LIMITS.title),
      caption: text(sheet.caption || "Important ideas, rules, examples, and source evidence.", 320),
      rows
    };
  }

  function sanitizeQuestion(value, index, sourceFallback, answers) {
    const question = value && typeof value === "object" ? value : {};
    const id = text(question.id || `q-${index + 1}`, 100);
    return {
      id,
      prompt: text(question.prompt || question.question || `Question ${index + 1}`),
      style: text(question.questionStyle || question.style, 80),
      choices: stringList(question.choices || question.options, LIMITS.choices, 500),
      selectedAnswer: text(question.selectedAnswer || answers?.[id], 500),
      answer: text(question.answer || question.correctAnswer, 500),
      explanation: text(question.explanation, LIMITS.text),
      citation: sanitizeCitation(question.citation || question, sourceFallback)
    };
  }

  function createExportModel(input) {
    if (input?.schema === MODEL_SCHEMA) {
      // Re-sanitize even normalized data so storage payloads never become a trust boundary.
      input = {
        ...input,
        sourceBinding: input.source,
        summary: input.keyPoints,
        visualNote: input.visualNote,
        sources: input.sources,
        quizArtifact: input.quiz,
        createdAt: input.createdAt
      };
    }

    const value = input && typeof input === "object" ? input : {};
    const study = value.studyArtifact && typeof value.studyArtifact === "object" ? value.studyArtifact : value;
    const binding = study.sourceBinding && typeof study.sourceBinding === "object"
      ? study.sourceBinding
      : value.sourceBinding && typeof value.sourceBinding === "object"
        ? value.sourceBinding
        : {};
    const sourceUrl = safeHttpUrl(binding.url || study.sourceUrl || value.sourceUrl);
    const source = sanitizeSource({
      ...binding,
      type: binding.documentType === "pdf" ? "pdf" : binding.type
    }, {
      title: study.sourceTitle || value.sourceTitle || study.title || value.title,
      url: sourceUrl,
      type: binding.type || study.sourceType || value.sourceType,
      timestampConfidence: study.timestampConfidence || value.timestampConfidence
    });
    source.chapter = text(binding.chapter || binding.chapterTitle || study.journeyChapterTitle || value.journeyChapterTitle, LIMITS.title);
    source.fingerprint = text(binding.fingerprint || study.sourceFingerprint || value.sourceFingerprint, 160);

    const lesson = study.visualLesson && typeof study.visualLesson === "object" ? study.visualLesson : {};
    const visual = study.visualNote && typeof study.visualNote === "object"
      ? study.visualNote
      : value.visualNote && typeof value.visualNote === "object"
        ? value.visualNote
        : lesson.visualModel && typeof lesson.visualModel === "object"
          ? lesson.visualModel
          : {};
    const concepts = list(visual.concepts || visual.nodes, LIMITS.concepts)
      .map((node, index) => sanitizeConcept(node, index, source));
    const conceptById = new Map(concepts.map((concept) => [concept.id, concept.label]));
    const relationships = list(visual.relationships || visual.edges, LIMITS.relationships).map((edge) => {
      if (typeof edge === "string") return text(edge);
      const from = conceptById.get(text(edge?.from, 80)) || text(edge?.from || "Concept", LIMITS.title);
      const to = conceptById.get(text(edge?.to, 80)) || text(edge?.to || "Concept", LIMITS.title);
      const label = text(edge?.label || "connects to", LIMITS.title);
      return text(`${from} — ${label} → ${to}`);
    }).filter(Boolean);

    const quizSource = value.quizArtifact && typeof value.quizArtifact === "object"
      ? value.quizArtifact
      : value.quiz && typeof value.quiz === "object"
        ? value.quiz
        : value;
    const answers = quizSource.answers && typeof quizSource.answers === "object" ? quizSource.answers : {};
    const questions = list(quizSource.questions, LIMITS.questions)
      .map((question, index) => sanitizeQuestion(question, index, source, answers));
    const submittedAt = safeIsoDate(quizSource.submittedAt || value.submittedAt);
    const score = Number(quizSource.score ?? value.score);

    const citations = [
      ...list(value.sources || study.sources, LIMITS.sources).map((entry) => sanitizeSource(entry, source)),
      source,
      ...concepts.map((concept) => sanitizeSource(concept.citation, source)),
      ...questions.map((question) => sanitizeSource(question.citation, source))
    ];

    const createdAt = safeIsoDate(study.createdAt || value.createdAt || value.generatedAt, new Date().toISOString());
    const title = text(study.title || value.title || lesson.title || source.title || "Study material", LIMITS.title);
    const cheatSheet = sanitizeCheatSheet(study.cheatSheet || value.cheatSheet);
    return {
      schema: MODEL_SCHEMA,
      title,
      createdAt,
      source,
      keyPoints: stringList(study.keyPoints || study.summary || value.keyPoints || value.summary, LIMITS.keyPoints),
      visualNote: {
        title: text(visual.title || lesson.title || title, LIMITS.title),
        objective: text(visual.objective || lesson.objective),
        concepts,
        relationships,
        scenarios: list(visual.scenarios, LIMITS.scenarios).map(sanitizeScenario)
      },
      cheatSheet,
      sources: uniqueSources(citations),
      quiz: {
        noteId: text(quizSource.noteId || study.id || value.id, 160),
        questions,
        score: Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : null,
        submittedAt
      }
    };
  }

  function hasVisualNote(model) {
    const visual = model.visualNote;
    return Boolean(visual.title || visual.objective || visual.concepts.length || visual.relationships.length || visual.scenarios.length);
  }

  function getAvailability(input) {
    const model = createExportModel(input);
    const hasQuiz = model.quiz.questions.length > 0;
    return {
      visualNote: hasVisualNote(model),
      keyPoints: model.keyPoints.length > 0,
      sources: model.sources.length > 0,
      quiz: hasQuiz,
      answerKey: hasQuiz
    };
  }

  function getDefaultSelections(input) {
    const model = createExportModel(input);
    const availability = getAvailability(model);
    return {
      visualNote: availability.visualNote,
      keyPoints: availability.keyPoints,
      sources: availability.sources,
      quiz: availability.quiz,
      answerKey: availability.answerKey && Boolean(model.quiz.submittedAt)
    };
  }

  function sanitizeSelections(value, input) {
    const model = createExportModel(input);
    const defaults = getDefaultSelections(model);
    const availability = getAvailability(model);
    const selection = value && typeof value === "object" ? value : {};
    return Object.fromEntries(SECTION_KEYS.map((key) => [
      key,
      Boolean(availability[key] && (Object.hasOwn(selection, key) ? selection[key] : defaults[key]))
    ]));
  }

  function buildFilename(input, extension, now = new Date()) {
    const model = createExportModel(input);
    const cleanExtension = String(extension || "pdf").toLowerCase().replace(/[^a-z0-9]/g, "") || "pdf";
    return `${slugify(model.title)}-${dateStamp(now)}.${cleanExtension}`;
  }

  function citationSuffix(citation) {
    const parts = [];
    if (citation?.timestamp !== null && citation?.timestamp !== undefined) {
      parts.push(`Video time ${formatTimestamp(citation.timestamp)}${citation.timestampConfidence ? ` (${citation.timestampConfidence})` : ""}`);
    }
    if (citation?.title) parts.push(citation.title);
    return parts.join(" · ");
  }

  function renderStringList(items, className = "") {
    if (!items.length) return "";
    return `<ul${className ? ` class="${escapeHtml(className)}"` : ""}>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  }

  function renderVisualNote(model) {
    const visual = model.visualNote;
    const concepts = visual.concepts.map((concept) => {
      const source = citationSuffix(concept.citation);
      return `<article class="concept-card">
        <div class="concept-heading">${concept.symbol ? `<span class="concept-symbol">${escapeHtml(concept.symbol)}</span>` : ""}<div><span class="label">${escapeHtml(concept.role)}</span><h3>${escapeHtml(concept.label)}</h3></div></div>
        ${concept.detail ? `<p>${escapeHtml(concept.detail)}</p>` : ""}
        ${concept.why ? `<p><strong>Why it matters:</strong> ${escapeHtml(concept.why)}</p>` : ""}
        ${concept.example ? `<p><strong>Example:</strong> ${escapeHtml(concept.example)}</p>` : ""}
        ${concept.citation.excerpt ? `<blockquote><strong>Source citation:</strong> ${escapeHtml(concept.citation.excerpt)}${source ? `<br><span class="muted">${escapeHtml(source)}</span>` : ""}</blockquote>` : ""}
      </article>`;
    }).join("");
    const scenarios = visual.scenarios.map((scenario) => `<tr><th>${escapeHtml(scenario.label)}</th><td>${escapeHtml(scenario.prompt)}</td><td>${escapeHtml(scenario.outcome)}${scenario.insight ? `<br><span class="muted">${escapeHtml(scenario.insight)}</span>` : ""}</td></tr>`).join("");
    const cheatRows = model.cheatSheet.rows.map((row) => {
      const evidenceParts = [row.evidence.label, row.evidence.anchor, row.evidence.pageNumber ? `Page ${row.evidence.pageNumber}` : "", row.evidence.timestampSeconds !== null ? formatTimestamp(row.evidence.timestampSeconds) : ""].filter(Boolean);
      const evidence = `${escapeHtml(evidenceParts.join(" · "))}${row.evidence.url ? `<br><a href="${escapeHtml(row.evidence.url)}">${escapeHtml(row.evidence.url)}</a>` : ""}`;
      return `<tr><th scope="row">${escapeHtml(row.topic)}</th><td>${escapeHtml(row.mainIdea)}</td><td>${escapeHtml(row.keyFacts)}</td><td>${escapeHtml(row.example)}</td><td>${evidence}</td></tr>`;
    }).join("");
    const cheatSheet = cheatRows ? `<section class="cheat-sheet-export"><h3>${escapeHtml(model.cheatSheet.title)}</h3><table><caption>${escapeHtml(model.cheatSheet.caption)}</caption><thead><tr><th scope="col">Topic / concept</th><th scope="col">Main idea</th><th scope="col">Key facts or rule</th><th scope="col">Example / application</th><th scope="col">Evidence / citation</th></tr></thead><tbody>${cheatRows}</tbody></table></section>` : "";
    return `<section class="document-section visual-export">
      <span class="section-kicker">Visual study note — static export</span>
      <h2>${escapeHtml(visual.title || model.title)}</h2>
      ${visual.objective ? `<p class="lead">${escapeHtml(visual.objective)}</p>` : ""}
      ${cheatSheet}
      ${concepts ? `<div class="concept-grid">${concepts}</div>` : ""}
      ${visual.relationships.length ? `<h3>Relationships</h3>${renderStringList(visual.relationships)}` : ""}
      ${scenarios ? `<h3>Scenarios</h3><table><thead><tr><th>Scenario</th><th>Change</th><th>Outcome</th></tr></thead><tbody>${scenarios}</tbody></table>` : ""}
    </section>`;
  }

  function renderQuiz(model) {
    const questions = model.quiz.questions.map((question, index) => {
      const choices = question.choices.map((choice, choiceIndex) => `<li><strong>${LETTERS[choiceIndex] || choiceIndex + 1}.</strong> ${escapeHtml(choice)}</li>`).join("");
      return `<article class="question-export"><span class="label">Question ${index + 1}${question.style ? ` · ${escapeHtml(question.style)}` : ""}</span><h3>${escapeHtml(question.prompt)}</h3><ol class="choice-list">${choices}</ol>${question.selectedAnswer ? `<p class="selected-answer"><strong>Your choice:</strong> ${escapeHtml(question.selectedAnswer)}</p>` : ""}</article>`;
    }).join("");
    return `<section class="document-section quiz-export"><span class="section-kicker">Practice quiz</span><h2>${model.quiz.questions.length} questions</h2>${model.quiz.score !== null ? `<p class="score-line">Score: <strong>${model.quiz.score}%</strong></p>` : ""}${questions}</section>`;
  }

  function renderAnswerKey(model) {
    const answers = model.quiz.questions.map((question, index) => {
      const source = citationSuffix(question.citation);
      return `<article class="answer-item"><h3>${index + 1}. ${escapeHtml(question.prompt)}</h3><p><strong>Answer:</strong> ${escapeHtml(question.answer || "Not provided")}</p>${question.explanation ? `<p><strong>Explanation:</strong> ${escapeHtml(question.explanation)}</p>` : ""}${question.citation.excerpt ? `<blockquote><strong>Source citation:</strong> ${escapeHtml(question.citation.excerpt)}${source ? `<br><span class="muted">${escapeHtml(source)}</span>` : ""}</blockquote>` : ""}</article>`;
    }).join("");
    return `<section class="document-section answer-key-export"><span class="section-kicker">Answer key</span><h2>Answers and explanations</h2>${answers}</section>`;
  }

  function renderSources(model) {
    const items = model.sources.map((source) => {
      const suffix = source.timestamp !== null ? ` · ${formatTimestamp(source.timestamp)}${source.timestampConfidence ? ` (${source.timestampConfidence})` : ""}` : "";
      return `<li><strong>${escapeHtml(source.title)}</strong>${source.url ? `<br><a href="${escapeHtml(source.url)}">${escapeHtml(source.url)}</a>` : ""}${suffix ? `<span class="muted">${escapeHtml(suffix)}</span>` : ""}</li>`;
    }).join("");
    return `<section class="document-section sources-export"><span class="section-kicker">Sources</span><h2>Source references</h2><ol>${items}</ol></section>`;
  }

  function buildExportBody(input, selectionValue) {
    const model = createExportModel(input);
    const selections = sanitizeSelections(selectionValue, model);
    const meta = [model.source.type, model.createdAt ? new Date(model.createdAt).toLocaleString() : ""].filter(Boolean).join(" · ");
    return `<article class="study-document">
      <header class="document-header"><span class="brand">NeatMind Study Export</span><h1>${escapeHtml(model.title)}</h1><p class="document-meta">${escapeHtml(meta)}</p>${model.source.title ? `<p><strong>Source:</strong> ${escapeHtml(model.source.title)}${model.source.hostname ? ` · ${escapeHtml(model.source.hostname)}` : ""}</p>` : ""}${model.source.chapter ? `<p><strong>Saved to:</strong> ${escapeHtml(model.source.chapter)}</p>` : ""}</header>
      ${selections.keyPoints ? `<section class="document-section takeaways"><span class="section-kicker">Key points</span><h2>What to remember</h2>${renderStringList(model.keyPoints)}</section>` : ""}
      ${selections.visualNote ? renderVisualNote(model) : ""}
      ${selections.sources ? renderSources(model) : ""}
      ${selections.quiz ? renderQuiz(model) : ""}
      ${selections.answerKey ? renderAnswerKey(model) : ""}
      <footer>Generated by NeatMind. Check AI-generated study material against the original source.</footer>
    </article>`;
  }

  function buildExportDocument(input, selections) {
    const model = createExportModel(input);
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(model.title)}</title></head><body>${buildExportBody(model, selections)}</body></html>`;
  }

  function resolveVendors(override) {
    if (override?.docx && override?.pdfLib) return override;
    if (global.NeatMindExportVendor?.docx && global.NeatMindExportVendor?.pdfLib) return global.NeatMindExportVendor;
    if (typeof require === "function") {
      return { docx: require("docx"), pdfLib: require("pdf-lib") };
    }
    throw new Error("Export libraries are unavailable. Rebuild export-vendor.bundle.js and reload NeatMind.");
  }

  function documentLines(model, selections) {
    const lines = [];
    if (selections.keyPoints) lines.push({ type: "h1", text: "Key points" }, ...model.keyPoints.map((item) => ({ type: "bullet", text: item })));
    if (selections.visualNote) {
      lines.push({ type: "pageLabel", text: "Visual study note — static export" }, { type: "h1", text: model.visualNote.title || model.title });
      if (model.visualNote.objective) lines.push({ type: "lead", text: model.visualNote.objective });
      if (model.cheatSheet.rows.length) {
        lines.push({ type: "h1", text: model.cheatSheet.title || "Cheat sheet" });
        if (model.cheatSheet.caption) lines.push({ type: "lead", text: model.cheatSheet.caption });
        model.cheatSheet.rows.forEach((row) => {
          lines.push(
            { type: "h2", text: row.topic },
            { type: "body", text: `Main idea: ${row.mainIdea}` },
            { type: "body", text: `Key facts or rule: ${row.keyFacts}` },
            { type: "body", text: `Example / application: ${row.example}` }
          );
          const evidence = [row.evidence.label, row.evidence.anchor, row.evidence.pageNumber ? `Page ${row.evidence.pageNumber}` : "", row.evidence.timestampSeconds !== null ? formatTimestamp(row.evidence.timestampSeconds) : "", row.evidence.url].filter(Boolean).join(" · ");
          if (evidence) lines.push({ type: "citation", text: `Evidence: ${evidence}` });
        });
      }
      model.visualNote.concepts.forEach((concept) => {
        lines.push({ type: "h2", text: concept.label });
        if (concept.detail) lines.push({ type: "body", text: concept.detail });
        if (concept.why) lines.push({ type: "body", text: `Why it matters: ${concept.why}` });
        if (concept.example) lines.push({ type: "body", text: `Example: ${concept.example}` });
        if (concept.citation.excerpt) lines.push({ type: "citation", text: `${concept.citation.excerpt}${citationSuffix(concept.citation) ? ` — ${citationSuffix(concept.citation)}` : ""}` });
      });
      if (model.visualNote.relationships.length) lines.push({ type: "h2", text: "Relationships" }, ...model.visualNote.relationships.map((item) => ({ type: "bullet", text: item })));
      if (model.visualNote.scenarios.length) {
        lines.push({ type: "h2", text: "Scenarios" });
        model.visualNote.scenarios.forEach((scenario) => lines.push({ type: "body", text: `${scenario.label}: ${scenario.prompt}${scenario.outcome ? ` — ${scenario.outcome}` : ""}${scenario.insight ? ` (${scenario.insight})` : ""}` }));
      }
    }
    if (selections.sources) {
      lines.push({ type: "h1", text: "Sources" });
      model.sources.forEach((source) => lines.push({ type: "body", text: `${source.title}${source.url ? ` — ${source.url}` : ""}${source.timestamp !== null ? ` — ${formatTimestamp(source.timestamp)}${source.timestampConfidence ? ` (${source.timestampConfidence})` : ""}` : ""}` }));
    }
    if (selections.quiz) {
      lines.push({ type: "h1", text: "Practice quiz" });
      if (model.quiz.score !== null) lines.push({ type: "lead", text: `Score: ${model.quiz.score}%` });
      model.quiz.questions.forEach((question, index) => {
        lines.push({ type: "h2", text: `${index + 1}. ${question.prompt}` });
        question.choices.forEach((choice, choiceIndex) => lines.push({ type: "choice", text: `${LETTERS[choiceIndex] || choiceIndex + 1}. ${choice}` }));
        if (question.selectedAnswer) lines.push({ type: "body", text: `Your choice: ${question.selectedAnswer}` });
      });
    }
    if (selections.answerKey) {
      lines.push({ type: "pageBreak", text: "" }, { type: "pageLabel", text: "Answer key" }, { type: "h1", text: "Answers and explanations" });
      model.quiz.questions.forEach((question, index) => {
        lines.push({ type: "h2", text: `${index + 1}. ${question.prompt}` }, { type: "body", text: `Answer: ${question.answer || "Not provided"}` });
        if (question.explanation) lines.push({ type: "body", text: `Explanation: ${question.explanation}` });
        if (question.citation.excerpt) lines.push({ type: "citation", text: `${question.citation.excerpt}${citationSuffix(question.citation) ? ` — ${citationSuffix(question.citation)}` : ""}` });
      });
    }
    return lines;
  }

  async function createDocxBytes(input, selectionValue, vendorOverride) {
    const model = createExportModel(input);
    const selections = sanitizeSelections(selectionValue, model);
    const { docx } = resolveVendors(vendorOverride);
    const { Document, HeadingLevel, Packer, PageBreak, Paragraph, TextRun } = docx;
    const children = [
      new Paragraph({ children: [new TextRun({ text: "NEATMIND STUDY EXPORT", color: "5B55D7", bold: true, size: 18 })] }),
      new Paragraph({ text: model.title, heading: HeadingLevel.TITLE }),
      new Paragraph({ children: [new TextRun({ text: `Source: ${model.source.title || "Study material"}${model.source.hostname ? ` · ${model.source.hostname}` : ""}`, color: "686879" })] })
    ];
    if (model.source.chapter) children.push(new Paragraph({ children: [new TextRun({ text: `Saved to: ${model.source.chapter}`, color: "686879" })] }));

    for (const line of documentLines(model, selections)) {
      if (line.type === "pageBreak") {
        children.push(new Paragraph({ children: [new PageBreak()] }));
      } else if (line.type === "pageLabel") {
        children.push(new Paragraph({ spacing: { before: 260, after: 80 }, children: [new TextRun({ text: line.text, color: "5B55D7", bold: true, size: 18 })] }));
      } else if (line.type === "h1") {
        children.push(new Paragraph({ text: line.text, heading: HeadingLevel.HEADING_1, keepNext: true }));
      } else if (line.type === "h2") {
        children.push(new Paragraph({ text: line.text, heading: HeadingLevel.HEADING_2, keepNext: true }));
      } else if (line.type === "bullet") {
        children.push(new Paragraph({ text: line.text, bullet: { level: 0 } }));
      } else if (line.type === "choice") {
        children.push(new Paragraph({ text: line.text, indent: { left: 360 } }));
      } else {
        children.push(new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: line.text, color: line.type === "citation" ? "66550A" : "1D1D27", italics: line.type === "citation", size: line.type === "lead" ? 24 : 22 })] }));
      }
    }
    children.push(new Paragraph({ spacing: { before: 320 }, children: [new TextRun({ text: "Generated by NeatMind. Check AI-generated study material against the original source.", color: "737382", size: 18 })] }));

    const document = new Document({
      creator: "NeatMind",
      title: model.title,
      description: "NeatMind study export",
      sections: [{ properties: { page: { margin: { top: 1000, right: 1000, bottom: 1000, left: 1000 } } }, children }]
    });
    if (typeof Packer.toBuffer === "function" && typeof Buffer !== "undefined") {
      return new Uint8Array(await Packer.toBuffer(document));
    }
    const blob = await Packer.toBlob(document);
    return new Uint8Array(await blob.arrayBuffer());
  }

  function pdfSafeText(value) {
    return text(value, 10000)
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2013\u2014]/g, "-")
      .replace(/\u2192/g, "->")
      .replace(/\u00B7/g, "|")
      .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, "?");
  }

  function wrapPdfText(value, font, size, maxWidth) {
    const paragraphs = pdfSafeText(value).split("\n");
    const lines = [];
    paragraphs.forEach((paragraph) => {
      const words = paragraph.split(/\s+/).filter(Boolean);
      if (!words.length) {
        lines.push("");
        return;
      }
      let current = "";
      words.forEach((word) => {
        const candidate = current ? `${current} ${word}` : word;
        if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
          current = candidate;
          return;
        }
        if (current) lines.push(current);
        if (font.widthOfTextAtSize(word, size) <= maxWidth) {
          current = word;
          return;
        }
        let chunk = "";
        for (const character of word) {
          if (chunk && font.widthOfTextAtSize(chunk + character, size) > maxWidth) {
            lines.push(chunk);
            chunk = character;
          } else {
            chunk += character;
          }
        }
        current = chunk;
      });
      if (current) lines.push(current);
    });
    return lines;
  }

  async function createPdfBytes(input, selectionValue, vendorOverride) {
    const model = createExportModel(input);
    const selections = sanitizeSelections(selectionValue, model);
    const { pdfLib } = resolveVendors(vendorOverride);
    const { PDFDocument, StandardFonts, rgb } = pdfLib;
    const pdf = await PDFDocument.create();
    pdf.setTitle(model.title);
    pdf.setAuthor("NeatMind");
    pdf.setSubject("Study export");
    const regular = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const italic = await pdf.embedFont(StandardFonts.HelveticaOblique);
    const pageSize = [595.28, 841.89];
    const margin = 54;
    const contentWidth = pageSize[0] - margin * 2;
    const colors = {
      ink: rgb(0.114, 0.114, 0.153),
      muted: rgb(0.39, 0.39, 0.47),
      accent: rgb(0.357, 0.333, 0.843),
      citation: rgb(0.40, 0.33, 0.04)
    };
    let page;
    let y;
    const newPage = () => {
      page = pdf.addPage(pageSize);
      y = pageSize[1] - margin;
      return page;
    };
    const ensure = (height) => {
      if (!page || y - height < margin) newPage();
    };
    const draw = (value, options = {}) => {
      const size = options.size || 10.5;
      const font = options.font || regular;
      const leading = options.leading || size * 1.42;
      const before = options.before || 0;
      const after = options.after ?? 5;
      const indent = options.indent || 0;
      const lines = wrapPdfText(value, font, size, contentWidth - indent);
      ensure(before + Math.max(1, lines.length) * leading + after);
      y -= before;
      lines.forEach((line) => {
        page.drawText(line, { x: margin + indent, y: y - size, size, font, color: options.color || colors.ink, maxWidth: contentWidth - indent });
        y -= leading;
      });
      y -= after;
    };

    newPage();
    draw("NEATMIND STUDY EXPORT", { size: 9, font: bold, color: colors.accent, after: 8 });
    draw(model.title, { size: 24, font: bold, leading: 29, after: 10 });
    draw(`Source: ${model.source.title || "Study material"}${model.source.hostname ? ` | ${model.source.hostname}` : ""}`, { color: colors.muted });
    if (model.source.chapter) draw(`Saved to: ${model.source.chapter}`, { color: colors.muted, after: 14 });

    for (const line of documentLines(model, selections)) {
      if (line.type === "pageBreak") {
        newPage();
      } else if (line.type === "pageLabel") {
        draw(line.text, { size: 9, font: bold, color: colors.accent, before: 12, after: 5 });
      } else if (line.type === "h1") {
        draw(line.text, { size: 17, font: bold, leading: 21, before: 12, after: 7 });
      } else if (line.type === "h2") {
        draw(line.text, { size: 12, font: bold, leading: 16, before: 8, after: 4 });
      } else if (line.type === "bullet") {
        draw(`- ${line.text}`, { indent: 10, after: 3 });
      } else if (line.type === "choice") {
        draw(line.text, { indent: 14, after: 2 });
      } else {
        draw(line.text, { font: line.type === "citation" ? italic : regular, color: line.type === "citation" ? colors.citation : colors.ink, size: line.type === "lead" ? 12 : 10.5 });
      }
    }
    draw("Generated by NeatMind. Check AI-generated study material against the original source.", { size: 8.5, color: colors.muted, before: 16 });
    return new Uint8Array(await pdf.save());
  }

  function triggerDownload(bytes, mimeType, filename) {
    const blob = new Blob([bytes], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.hidden = true;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  async function downloadDocx(input, selections, now = new Date()) {
    const bytes = await createDocxBytes(input, selections);
    const filename = buildFilename(input, "docx", now);
    triggerDownload(bytes, "application/vnd.openxmlformats-officedocument.wordprocessingml.document", filename);
    return filename;
  }

  async function downloadPdf(input, selections, now = new Date()) {
    const bytes = await createPdfBytes(input, selections);
    const filename = buildFilename(input, "pdf", now);
    triggerDownload(bytes, "application/pdf", filename);
    return filename;
  }

  function isExportPayloadFresh(payload, now = Date.now(), maxAgeMs = 60 * 60 * 1000) {
    if (!payload || typeof payload !== "object") return false;
    const expiresAt = Date.parse(payload.expiresAt || "");
    if (Number.isFinite(expiresAt)) return expiresAt > now;
    const exportedAt = Date.parse(payload.exportedAt || "");
    return Number.isFinite(exportedAt) && exportedAt + maxAgeMs > now;
  }

  global.NeatMindExport = {
    MODEL_SCHEMA,
    SECTION_KEYS,
    buildExportBody,
    buildExportDocument,
    buildFilename,
    createDocxBytes,
    createExportModel,
    createPdfBytes,
    downloadDocx,
    downloadPdf,
    downloadWord: downloadDocx,
    escapeHtml,
    formatTimestamp,
    getAvailability,
    getDefaultSelections,
    isExportPayloadFresh,
    sanitizeSelections,
    slugify
  };
})(globalThis);
