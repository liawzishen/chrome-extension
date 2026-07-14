(() => {
  "use strict";
  const MAX_NODES = 2500;
  const MAX_CHUNKS = 220;
  const MAX_TEXT = 16000;
  const MAX_NODE_RAW_TEXT = 6000;
  const deadline = performance.now() + 160;
  const blockedTags = new Set([
    "SCRIPT", "STYLE", "NOSCRIPT", "SVG", "CANVAS", "IFRAME", "NAV", "HEADER", "FOOTER", "ASIDE", "FORM",
    "BUTTON", "INPUT", "TEXTAREA", "SELECT", "OPTION", "TEMPLATE"
  ]);
  const studyTags = new Set(["H1", "H2", "H3", "H4", "P", "LI", "DT", "DD", "BLOCKQUOTE", "FIGCAPTION", "TD", "TH", "PRE", "CODE"]);
  const chunks = [];
  const seen = new Set();
  let inspectedNodes = 0;
  let outputCharacters = 0;
  let shadowRoots = 0;

  const cleanText = (value) => String(value || "")
    .slice(0, MAX_NODE_RAW_TEXT)
    .replace(/\\text\{([^}]*)\}/g, "$1")
    .replace(/\\(?:to|in|forall|exists|cdot|leq|geq|mathbb|mathrm|left|right|big|Big)\b/g, " ")
    .replace(/\\[a-zA-Z]+/g, " ")
    .replace(/[{}]/g, " ")
    .replace(/([A-Za-z]\([^)]{1,20}\))\1+/g, "$1")
    .replace(/\b([A-Za-z])\1\b/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

  const addChunk = (rawValue, prefix = "") => {
    if (chunks.length >= MAX_CHUNKS || outputCharacters >= MAX_TEXT) return;
    const text = cleanText(rawValue);
    if ((text.match(/[\p{L}\p{N}]/gu) || []).length < 8) return;
    const key = text.toLocaleLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    const chunk = `${prefix}${text}`.slice(0, MAX_TEXT - outputCharacters);
    chunks.push(chunk);
    outputCharacters += chunk.length + 1;
  };

  const isHidden = (element) => {
    if (element.hidden || element.inert || element.getAttribute("aria-hidden") === "true") return true;
    if (["navigation", "banner", "contentinfo"].includes(element.getAttribute("role"))) return true;
    const style = getComputedStyle(element);
    return style.display === "none" || style.visibility === "hidden" || style.contentVisibility === "hidden";
  };

  const root = document.body || document.documentElement;
  const stack = root ? [root] : [];
  while (stack.length && inspectedNodes < MAX_NODES && performance.now() <= deadline && outputCharacters < MAX_TEXT) {
    const element = stack.pop();
    inspectedNodes += 1;
    if (element?.nodeType === Node.TEXT_NODE) {
      addChunk(element.nodeValue);
      continue;
    }
    if (!(element instanceof Element)) continue;
    if (blockedTags.has(element.tagName) || isHidden(element)) continue;

    const shadowChildren = element.shadowRoot?.mode === "open" ? [...element.shadowRoot.children] : [];
    if (shadowChildren.length) shadowRoots += 1;
    const semantic = studyTags.has(element.tagName);
    const leaf = element.childElementCount === 0 && shadowChildren.length === 0;
    if (semantic || leaf) {
      const prefix = /^H[1-4]$/.test(element.tagName) ? "\n" : element.tagName === "LI" ? "- " : "";
      addChunk(element.innerText || element.textContent, prefix);
    }

    if (!semantic) {
      const lightChildren = [...element.childNodes];
      for (let index = lightChildren.length - 1; index >= 0; index -= 1) stack.push(lightChildren[index]);
    }
    const shadowNodes = element.shadowRoot?.mode === "open" ? [...element.shadowRoot.childNodes] : [];
    for (let index = shadowNodes.length - 1; index >= 0; index -= 1) stack.push(shadowNodes[index]);
  }

  const snapshot = {
    title: String(document.title || "").replace(/\s+/g, " ").trim().slice(0, 180),
    url: String(location.href || "").slice(0, 2000),
    text: chunks.join("\n").slice(0, MAX_TEXT),
    chunks,
    stats: { inspectedNodes, outputCharacters, shadowRoots, truncated: Boolean(stack.length) }
  };
  globalThis.__EXAM_CRAM_FRAME_SNAPSHOT__ = snapshot;
  return snapshot;
})();
