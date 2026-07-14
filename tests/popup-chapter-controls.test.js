const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "popup.html"), "utf8");
const script = fs.readFileSync(path.join(root, "popup.js"), "utf8");

function functionSource(name) {
  const expression = new RegExp(
    `(?:async\\s+)?function\\s+${name}\\s*\\([^]*?(?=\\n(?:async\\s+)?function\\s+|$)`
  );
  return script.match(expression)?.[0] || "";
}

test("shows stable-ID chapter selectors and an explicit new-chapter action in both creation flows", () => {
  assert.match(html, /<select\b[^>]*\bid="pageChapterInput"[^>]*>/i);
  assert.match(html, /<select\b[^>]*\bid="notesChapterInput"[^>]*>/i);
  assert.match(html, /id="newPageChapterButton"[^>]*>[^<]*New chapter/i);
  assert.match(html, /id="newNotesChapterButton"[^>]*>[^<]*New chapter/i);
  assert.doesNotMatch(html, /id="journeyChapterOptions"|list="journeyChapterOptions"/i);
});

test("uses one accessible chapter-name dialog rather than duplicating modal state", () => {
  assert.equal((html.match(/id="newChapterDialog"/g) || []).length, 1);
  assert.match(html, /<dialog\b[^>]*\bid="newChapterDialog"[^>]*\baria-labelledby="[^"]+"/i);
  assert.match(html, /<input\b[^>]*\bid="newChapterNameInput"[^>]*\bmaxlength="140"/i);
  assert.match(html, /id="cancelNewChapterButton"/);
  assert.match(html, /id="confirmNewChapterButton"/);
});

test("makes the collect-source action explain that it saves evidence without generating a note", () => {
  assert.match(html, /id="addCurrentSourceButton"[^>]*>\s*Save source to chapter\s*</i);
  assert.match(html, /without generating (?:a )?note/i);
  assert.match(html, /combine|combined chapter note/i);
});

test("creates and selects a new stable-ID chapter through the Journey worker", () => {
  const createFlow = functionSource("handleCreateChapter");
  assert.match(createFlow, /mutateJourney\(\s*["']JOURNEY_CREATE_CHAPTER["']/);
  assert.match(createFlow, /created\.result\??\.chapterId/);
  assert.match(createFlow, /selectChapterAcrossControls\(/);
  assert.match(createFlow, /setStorage\(STORAGE_KEYS\.lastChapter,/);
  assert.match(script, /newPageChapterButton[^]*addEventListener\(\s*["']click["']/);
  assert.match(script, /newNotesChapterButton[^]*addEventListener\(\s*["']click["']/);
});

test("renders chapter options with IDs as values while preserving user-entered titles as labels", () => {
  const updateOptions = functionSource("updateJourneyChapterOptions");
  assert.ok(updateOptions, "updateJourneyChapterOptions must exist");
  assert.match(updateOptions, /option\.value\s*=\s*chapter\.id/);
  assert.match(updateOptions, /option\.dataset\.chapterTitle\s*=\s*chapter\.title/);
  assert.match(updateOptions, /option\.textContent\s*=/);
  assert.match(updateOptions, /pageChapterInput/);
  assert.match(updateOptions, /notesChapterInput/);
});

test("persists stable selector IDs alongside legacy chapter titles", () => {
  const saveState = functionSource("savePanelState");
  const loadState = functionSource("loadPanelState");
  assert.match(saveState, /pageChapterId/);
  assert.match(saveState, /notesChapterId/);
  assert.match(saveState, /pageChapter:/);
  assert.match(saveState, /notesChapter:/);
  assert.match(loadState, /pageChapterId/);
  assert.match(loadState, /notesChapterId/);
  assert.match(loadState, /pageChapter/);
  assert.match(loadState, /notesChapter/);
});

test("passes both the selected chapter ID and title through every note creation path", () => {
  const bindingHelper = functionSource("getSelectedChapterBinding");
  assert.ok(bindingHelper, "getSelectedChapterBinding must exist");
  assert.match(bindingHelper, /return\s*\{\s*chapterId\s*,\s*chapterTitle/);

  const pageFlow = functionSource("handleStudyPage");
  assert.match(pageFlow, /getSelectedChapterBinding\(elements\.pageChapterInput\)/);
  assert.match(pageFlow, /\.\.\.getSelectedChapterBinding\(elements\.pageChapterInput\)/);

  const videoFlow = functionSource("handleStudyVideo");
  assert.match(videoFlow, /getSelectedChapterBinding\(elements\.pageChapterInput\)/);
  assert.match(videoFlow, /\.\.\.\w*[Cc]hapter\w*/);

  const notesFlow = functionSource("handleStudyNotes");
  assert.match(notesFlow, /getSelectedChapterBinding\(elements\.notesChapterInput\)/);
  assert.match(notesFlow, /\.\.\.getSelectedChapterBinding\(elements\.notesChapterInput\)/);

  const collectFlow = functionSource("handleAddCurrentSource");
  assert.match(collectFlow, /getSelectedChapterBinding\(elements\.pageChapterInput\)/);
  assert.match(collectFlow, /chapterIdOrTitle:\s*\w+\.chapterId(?:\s*\|\|\s*\w+\.chapterTitle)?/);
});

test("never displays the previous chapter's last source in a newly selected chapter", () => {
  assert.match(
    script,
    /journey\.lastStudySource\?\.chapterId\s*===\s*chapter\.id/
  );
});
