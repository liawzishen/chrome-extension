const test = require("node:test");
const assert = require("node:assert/strict");
const StudyTime = require("../study-time-utils.js");

const MINUTE = 60 * 1000;

test("normalizes malformed study-time state into safe totals", () => {
  const state = StudyTime.normalizeStudyTimeState({
    chapterTotals: { "chapter-a": 5000, bad: -10, "": 9999, blank: "nope" },
    noteTotals: { "note-a": 3000 },
    updatedAt: "not-a-number"
  }, 1000);
  assert.deepEqual(state.chapterTotals, { "chapter-a": 5000 });
  assert.deepEqual(state.noteTotals, { "note-a": 3000 });
  assert.equal(state.updatedAt, 1000);
  assert.deepEqual(StudyTime.normalizeStudyTimeState(null, 42).chapterTotals, {});
});

test("adds study time to a chapter and its open note without double counting the total", () => {
  let state = StudyTime.createDefaultStudyTimeState(0);
  state = StudyTime.addStudyTime(state, { chapterId: "ch1", noteId: "note1", durationMs: 4 * MINUTE }, 1);
  state = StudyTime.addStudyTime(state, { chapterId: "ch1", noteId: "note2", durationMs: 2 * MINUTE }, 2);
  state = StudyTime.addStudyTime(state, { chapterId: "ch2", durationMs: 3 * MINUTE }, 3);
  assert.equal(StudyTime.getChapterStudyMs(state, "ch1"), 6 * MINUTE);
  assert.equal(StudyTime.getNoteStudyMs(state, "note1"), 4 * MINUTE);
  assert.equal(StudyTime.getNoteStudyMs(state, "note2"), 2 * MINUTE);
  assert.equal(StudyTime.getChapterStudyMs(state, "ch2"), 3 * MINUTE);
  // Total is the sum of chapter totals (notes are a subset), so 6 + 3 = 9.
  assert.equal(StudyTime.getTotalStudyMs(state), 9 * MINUTE);
});

test("ignores study time with no chapter and clamps an implausibly large slice", () => {
  let state = StudyTime.createDefaultStudyTimeState(0);
  state = StudyTime.addStudyTime(state, { noteId: "orphan", durationMs: MINUTE }, 1);
  assert.equal(StudyTime.getTotalStudyMs(state), 0);
  state = StudyTime.addStudyTime(state, { chapterId: "ch1", durationMs: 24 * 60 * MINUTE }, 2);
  assert.equal(StudyTime.getChapterStudyMs(state, "ch1"), StudyTime.MAX_SLICE_MS);
});

test("credits continuous study while activity stays inside the idle window", () => {
  const idle = StudyTime.DEFAULT_IDLE_MS;
  let state = StudyTime.createDefaultStudyTimeState(0);
  let session = StudyTime.createStudySession("ch1", "note1", 0);
  // Learner is active at t=30s, so the whole 45s counts (30s < idle grace).
  session = StudyTime.touchStudySession(session, 30 * 1000, idle);
  const flushed = StudyTime.flushStudySession(state, session, 45 * 1000, idle);
  state = flushed.state;
  session = flushed.session;
  assert.equal(StudyTime.getChapterStudyMs(state, "ch1"), 45 * 1000);
  assert.equal(StudyTime.getNoteStudyMs(state, "note1"), 45 * 1000);
  assert.equal(flushed.idle, false);
});

test("caps accrual at the idle grace and never back-credits time spent away", () => {
  const idle = StudyTime.DEFAULT_IDLE_MS;
  let state = StudyTime.createDefaultStudyTimeState(0);
  let session = StudyTime.createStudySession("ch1", "", 0);
  // No activity after t=0. At t=10min the session is idle; only the first
  // idle-grace window (90s) is credited, not the full ten minutes.
  const idleFlush = StudyTime.flushStudySession(state, session, 10 * MINUTE, idle);
  state = idleFlush.state;
  session = idleFlush.session;
  assert.equal(idleFlush.idle, true);
  assert.equal(StudyTime.getChapterStudyMs(state, "ch1"), idle);

  // Learner returns at t=10min: activity resets the flush anchor so the nine
  // idle minutes are discarded, and the next 20s of real study is credited.
  session = StudyTime.touchStudySession(session, 10 * MINUTE, idle);
  const resumeFlush = StudyTime.flushStudySession(state, session, 10 * MINUTE + 20 * 1000, idle);
  assert.equal(StudyTime.getChapterStudyMs(resumeFlush.state, "ch1"), idle + 20 * 1000);
});

test("reports idle sessions and treats an empty session as idle", () => {
  const idle = StudyTime.DEFAULT_IDLE_MS;
  const session = StudyTime.createStudySession("ch1", "", 0);
  assert.equal(StudyTime.isStudySessionIdle(session, 30 * 1000, idle), false);
  assert.equal(StudyTime.isStudySessionIdle(session, 2 * MINUTE, idle), true);
  assert.equal(StudyTime.isStudySessionIdle(null, 0, idle), true);
});

test("formats study duration into compact hour/minute labels", () => {
  assert.equal(StudyTime.formatStudyDuration(0), "0m");
  assert.equal(StudyTime.formatStudyDuration(59 * 1000), "0m");
  assert.equal(StudyTime.formatStudyDuration(12 * MINUTE), "12m");
  assert.equal(StudyTime.formatStudyDuration(65 * MINUTE), "1h 5m");
});
