const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "popup.html"), "utf8");
const script = fs.readFileSync(path.join(root, "popup.js"), "utf8");
const styles = fs.readFileSync(path.join(root, "popup.css"), "utf8");

test("Dashboard is the first tab and default active view", () => {
  const navStart = html.indexOf('<nav class="tabs"');
  const navEnd = html.indexOf("</nav>", navStart);
  const nav = html.slice(navStart, navEnd);
  assert.ok(nav.indexOf('id="dashboardTab"') < nav.indexOf('id="pageTab"'));
  assert.match(nav, /id="dashboardTab" class="tab active"[^>]*aria-selected="true"[^>]*tabindex="0"/);
  assert.match(html, /id="dashboardView" class="view active"[^>]*role="tabpanel"[^>]*aria-labelledby="dashboardTab"/);
  assert.match(script, /let initialView = "dashboardView"/);
  assert.match(script, /const initialView = restoredView[\s\S]*?: "dashboardView"/);
});

test("Dashboard persists one normalized local study goal", () => {
  assert.match(script, /studyGoal:\s*"examCramStudyGoal"/);
  assert.match(script, /async function getStudyGoal\(\)[\s\S]*?normalizeStudyGoal\(stored\)/);
  assert.match(script, /async function saveStudyGoal\(goal\)[\s\S]*?setStorage\(STORAGE_KEYS\.studyGoal, normalized\)/);
  assert.match(script, /async function handleSaveStudyGoal\(event\)[\s\S]*?normalizeStudyGoal\(\{[\s\S]*?await saveStudyGoal\(normalized\)[\s\S]*?await renderDashboard\(\)[\s\S]*?showStatus\("Study goal saved\."\)/);
});

test("Dashboard builds the goal-aware plan locally from one parallel read", () => {
  assert.match(script, /const \[journey, storedFocus, savedItems, studyGoal\] = await Promise\.all\(\[[\s\S]*?getJourney\(\)[\s\S]*?STORAGE_KEYS\.focusState[\s\S]*?STORAGE_KEYS\.sessions[\s\S]*?getStudyGoal\(\)/);
  assert.match(script, /ExamCramJourney\.buildStudyPlan\(journey, focusHistory, \{ now: Date\.now\(\), savedNoteIds, studyGoal \}\)/);
  const dashboardStart = script.indexOf("async function renderDashboard()");
  const dashboardEnd = script.indexOf("async function handleSaveStudyGoal", dashboardStart);
  assert.doesNotMatch(script.slice(dashboardStart, dashboardEnd), /\bfetch\s*\(|DEFAULT_API_ENDPOINT|generate/i);
});

test("Today's Plan is reusable on Dashboard and absent from Journey", () => {
  assert.match(script, /function buildTodayPlanSection\(plan\)/);
  assert.match(script, /elements\.dashboardPlan\.replaceChildren\(buildTodayPlanSection\(plan\)\)/);
  assert.match(script, /section\.setAttribute\("aria-label", "Today's study plan"\)/);
  assert.match(script, /createElement\("span", "Outside your goal", "today-plan__outside-goal"\)/);
  assert.doesNotMatch(script, /function renderTodayPlan\(|elements\.journeyChapterDetail\.after\(section\)/);
  const journeyStart = script.indexOf("async function renderJourney()");
  const planSectionStart = script.indexOf("function buildTodayPlanSection(plan)", journeyStart);
  assert.doesNotMatch(script.slice(journeyStart, planSectionStart), /buildStudyPlan|today-plan/);
});

test("Dashboard includes goal, stats, plan, and onboarding containers with semantic responsive styles", () => {
  assert.match(html, /id="dashboardGoalForm" class="dashboard__goal"/);
  assert.match(html, /id="dashboardStats" class="dashboard__stats"/);
  assert.match(html, /id="dashboardPlan" class="dashboard__plan"/);
  assert.match(html, /id="dashboardEmptyState" class="dashboard__empty hidden"/);
  assert.match(script, /createButton\.textContent = "Create your first note"/);
  assert.match(styles, /\.dashboard__goal,[\s\S]*?border:\s*1px solid var\(--ui-separator\);[\s\S]*?border-radius:\s*var\(--ui-radius-card\);[\s\S]*?background:\s*var\(--ui-surface\);/);
  assert.match(styles, /\.dashboard__stats\s*\{[\s\S]*?display:\s*flex;[\s\S]*?flex-wrap:\s*wrap;/);
  assert.match(styles, /@media \(max-width: 480px\)[\s\S]*?\.dashboard__form-grid\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\);/);
});
