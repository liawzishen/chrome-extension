const EXPORT_STORAGE_PREFIX = "examCramExportPayload";

const elements = {
  document: document.getElementById("exportDocument"),
  docxButton: document.getElementById("downloadDocxButton"),
  pdfButton: document.getElementById("downloadPdfButton"),
  options: document.getElementById("sectionOptions"),
  filename: document.getElementById("filenamePreview"),
  source: document.getElementById("sourcePreview"),
  status: document.getElementById("exportStatus")
};

let exportModel = null;
let selections = null;
let storedPayload = null;
let storageKey = "";

initExport();

async function initExport() {
  const api = globalThis.ExamCramExport;
  const exportId = new URLSearchParams(location.search).get("exportId") || "";
  const payload = await readExportPayload(exportId);
  const rawModel = payload?.exportModel || payload?.model || payload?.item;
  if (!api || !rawModel || payload?.exportId !== exportId || !api.isExportPayloadFresh(payload)) {
    showEmpty("No export is ready. Return to Exam-Cram, open a visual note, and choose Export.");
    return;
  }

  storedPayload = payload;
  storageKey = `${EXPORT_STORAGE_PREFIX}:${exportId}`;
  exportModel = api.createExportModel(rawModel);
  selections = api.sanitizeSelections(payload.selections, exportModel);
  document.title = `${exportModel.title} — Exam-Cram Export`;
  renderOptions();
  renderPreview();
  elements.options.addEventListener("change", handleSelectionChange);
  elements.docxButton.addEventListener("click", () => download("docx"));
  elements.pdfButton.addEventListener("click", () => download("pdf"));
}

function renderOptions() {
  const api = globalThis.ExamCramExport;
  const availability = api.getAvailability(exportModel);
  const filenameBase = api.buildFilename(exportModel, "docx").replace(/\.docx$/i, "");
  elements.filename.textContent = `${filenameBase}.docx / .pdf`;
  elements.source.textContent = [exportModel.source.title, exportModel.source.hostname].filter(Boolean).join(" · ") || "Saved study note";

  elements.options.querySelectorAll("input[type=checkbox]").forEach((input) => {
    const key = input.value;
    input.checked = Boolean(selections[key]);
    input.disabled = !availability[key];
    input.closest(".option-row")?.classList.toggle("is-disabled", input.disabled);
  });
  if (!availability.quiz) {
    elements.options.querySelector('[data-help="quiz"]').textContent = "Generate a quiz first";
    elements.options.querySelector('[data-help="answerKey"]').textContent = "Generate a quiz first";
  } else if (!exportModel.quiz.submittedAt) {
    elements.options.querySelector('[data-help="answerKey"]').textContent = "Correct answers (off until the quiz is submitted)";
  }
}

function renderPreview() {
  elements.document.innerHTML = globalThis.ExamCramExport.buildExportBody(exportModel, selections);
  const hasSelection = Object.values(selections).some(Boolean);
  elements.docxButton.disabled = !hasSelection;
  elements.pdfButton.disabled = !hasSelection;
  if (!hasSelection) setStatus("Choose at least one section to download.", true);
  else if (elements.status.classList.contains("is-error")) setStatus("");
}

function handleSelectionChange(event) {
  if (!(event.target instanceof HTMLInputElement)) return;
  selections = globalThis.ExamCramExport.sanitizeSelections({ ...selections, [event.target.value]: event.target.checked }, exportModel);
  renderPreview();
  persistSelections().catch(() => {});
}

async function download(format) {
  const api = globalThis.ExamCramExport;
  const button = format === "docx" ? elements.docxButton : elements.pdfButton;
  const other = format === "docx" ? elements.pdfButton : elements.docxButton;
  const original = button.textContent;
  button.disabled = true;
  other.disabled = true;
  button.textContent = "Creating…";
  setStatus(`Creating ${format.toUpperCase()} in this browser…`);
  try {
    const filename = format === "docx"
      ? await api.downloadDocx(exportModel, selections)
      : await api.downloadPdf(exportModel, selections);
    setStatus(`${filename} downloaded.`);
  } catch (error) {
    setStatus(error?.message || `Could not create the ${format.toUpperCase()} file.`, true);
  } finally {
    button.textContent = original;
    const enabled = Object.values(selections).some(Boolean);
    button.disabled = !enabled;
    other.disabled = !enabled;
  }
}

function showEmpty(message) {
  elements.document.replaceChildren(createMessage(message));
  elements.options.disabled = true;
  elements.docxButton.disabled = true;
  elements.pdfButton.disabled = true;
  elements.filename.textContent = "No file ready";
  elements.source.textContent = "No source ready";
  setStatus(message, true);
}

function createMessage(message) {
  const element = document.createElement("p");
  element.className = "export-loading";
  element.textContent = message;
  return element;
}

function setStatus(message, isError = false) {
  elements.status.textContent = message;
  elements.status.classList.toggle("is-error", isError);
}

async function readExportPayload(exportId) {
  if (!/^[a-f0-9-]{20,80}$/i.test(exportId)) return null;
  const key = `${EXPORT_STORAGE_PREFIX}:${exportId}`;
  if (globalThis.chrome?.storage?.local) {
    return new Promise((resolve) => {
      chrome.storage.local.get(key, (result) => {
        if (chrome.runtime?.lastError) resolve(null);
        else resolve(result[key] || null);
      });
    });
  }
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function persistSelections() {
  if (!storedPayload || !storageKey) return;
  storedPayload = { ...storedPayload, selections };
  if (globalThis.chrome?.storage?.local) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [storageKey]: storedPayload }, () => {
        if (chrome.runtime?.lastError) reject(new Error(chrome.runtime.lastError.message));
        else resolve();
      });
    });
  }
  localStorage.setItem(storageKey, JSON.stringify(storedPayload));
}
