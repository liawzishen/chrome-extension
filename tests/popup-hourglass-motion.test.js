const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const script = fs.readFileSync(path.join(root, "popup.js"), "utf8");
const styles = fs.readFileSync(path.join(root, "popup.css"), "utf8");
const html = fs.readFileSync(path.join(root, "popup.html"), "utf8");

test("Paste Notes has its own action icon instead of sharing save-source.png", () => {
  assert.match(html, /id="pasteNotesButton"[\s\S]{0,200}?src="assets\/page-actions\/paste-notes\.png"/);
  assert.match(html, /id="addCurrentSourceButton"[\s\S]{0,200}?src="assets\/page-actions\/save-source\.png"/);
  assert.match(fs.readFileSync(path.join(root, "preview-server.js"), "utf8"), /assets\/page-actions\/paste-notes\.png/);
  assert.match(fs.readFileSync(path.join(root, "scripts", "extension-files.mjs"), "utf8"), /assets\/page-actions\/paste-notes\.png/);
  assert.ok(fs.statSync(path.join(root, "assets", "page-actions", "paste-notes.png")).size > 0);
});

test("each metric card renders exactly one engraved dial instrument", () => {
  assert.match(script, /visual\.append\(buildJourneyArc\(sandState\?\.hasValue \? sandState\.percent : 0, tone\)\);/);
  assert.match(script, /visual\.append\(buildJourneyGauge\(sandState\?\.hasValue \? sandState\.percent : null, tone\)\);/);
  assert.match(script, /dial\.className = "journey-focus-dial";/);
  assert.match(script, /function journeyDialTicks\(\{ centerX, centerY, startAngle, count, step, majorEvery, radiusOuter, radiusMinor, radiusMajor \}\)/);
  assert.doesNotMatch(script, /createJourneySandHourglass|journey-metric__art/);
});

test("the progress compass sweeps 270 degrees with a rotating needle", () => {
  assert.match(script, /function buildJourneyArc\(percent, tone\)/);
  assert.match(script, /setProperty\("--journey-arc-sweep", `\$\{\(clamped \* 2\.7\)\.toFixed\(1\)\}deg`\)/);
  assert.match(script, /arc\.classList\.toggle\("is-complete", clamped === 100\);/);
  assert.match(script, /needle\.className = "journey-arc__needle";/);
  assert.match(styles, /@property --journey-arc-sweep \{\s*syntax: "<angle>";\s*inherits: true;/);
  assert.match(styles, /\.journey-arc::before \{[\s\S]*?conic-gradient\(\s*from 225deg,\s*var\(--journey-metric-color\) 0deg var\(--journey-arc-sweep, 0deg\)/);
  assert.match(styles, /\.journey-arc__needle \{[\s\S]*?rotate\(calc\(225deg \+ var\(--journey-arc-sweep, 0deg\)\)\)/);
  assert.match(styles, /\.journey-arc\.is-complete::before \{\s*filter: drop-shadow/);
});

test("the average barometer swings a needle across engraved LOW/FAIR/FINE zones", () => {
  assert.match(script, /function buildJourneyGauge\(percent, tone\)/);
  assert.match(script, /const angle = hasScore \? Math\.round\(-90 \+ \(Math\.max\(0, Math\.min\(100, percent\)\) \* 1\.8\)\) : -90;/);
  assert.match(script, /gauge\.classList\.toggle\("is-idle", !hasScore\);/);
  assert.match(script, /stroke="#c8674a"[\s\S]*?stroke="#cf9f3a"[\s\S]*?stroke="#5c8a63"/);
  assert.match(script, />LOW<\/text>[\s\S]*?>FAIR<\/text>[\s\S]*?>FINE<\/text>/);
  assert.match(styles, /\.journey-gauge__needle \{[\s\S]*?rotate\(var\(--journey-gauge-angle, -90deg\)\)/);
  assert.doesNotMatch(styles, /journey-gauge__caption/);
});

test("the focus pocket watch pairs a conic sweep with a rotating hand", () => {
  assert.match(script, /hand\.className = "journey-focus-dial__hand";/);
  assert.match(script, /<rect x="68" y="2\.5" width="12" height="8" rx="2"/);
  assert.match(styles, /\.journey-focus-dial::before \{[\s\S]*?conic-gradient\(var\(--journey-metric-color\) var\(--journey-focus-sweep, 0deg\)/);
  assert.match(styles, /\.journey-focus-dial__hand \{[\s\S]*?rotate\(var\(--journey-focus-sweep, 0deg\)\)/);
  assert.match(styles, /@property --journey-focus-sweep \{\s*syntax: "<angle>";\s*inherits: true;/);
});

test("metric values count up without fighting live focus updates", () => {
  assert.match(script, /function animateMetricValue\(element, targetText\)/);
  assert.match(script, /animateMetricValue\(valueElement, value\);/);
  assert.match(script, /if \(element\.dataset\.liveValue\) \{\s*clearTimeout\(settle\);\s*return;\s*\}/);
  assert.match(script, /document\.visibilityState === "hidden";/);
  assert.match(script, /const settle = setTimeout\(\(\) => \{\s*if \(!element\.dataset\.liveValue\) element\.textContent = targetText;\s*\}, 1400\);/);
  assert.match(script, /prefers-reduced-motion: reduce/);
});

test("the focus card counts only today's focused minutes toward the daily goal", () => {
  assert.match(script, /function sumTodayFocusMinutes\(history\)/);
  assert.match(script, /journeyUtils\.localDayKey\(new Date\(endedAt\)\) !== todayKey\) return total;/);
  assert.match(script, /const focusMinutesToday = sumTodayFocusMinutes\(focusHistory\);/);
  assert.match(script, /value: `\$\{focusMinutesToday\}m`,/);
  assert.match(script, /fraction: Math\.max\(0, Math\.min\(1, focusMinutesToday \/ \(journeyStudyGoal\?\.dailyMinutes \|\| 20\)\)\)/);
  assert.match(script, /\? sumTodayFocusMinutes\(focus\.history\)/);
  assert.doesNotMatch(script, /metrics\.focusMinutes \/ \(journeyStudyGoal/);
});

test("the focus card mirrors the quick toggle's live session state", () => {
  assert.match(script, /function updateJourneyFocusInstrument\(focus\)/);
  assert.match(script, /card\.classList\.toggle\("is-session-live", live\);/);
  assert.match(script, /card\.classList\.toggle\("is-session-break", onBreak\);/);
  assert.match(script, /renderFocusHistory\(focus\.history \|\| \[\]\);\s*updateJourneyFocusInstrument\(focus\);/);
  assert.match(script, /valueElement\.dataset\.liveValue = "1";/);
  assert.match(script, /detailElement\.textContent = onBreak \? "Break running — session resumes soon" : "Focus session in progress";/);
  assert.match(script, /card\.dataset\.loggedMinutes = String\(focusDial\.minutes\);/);
  assert.match(styles, /\.journey-metric--focus\.is-session-live \.journey-focus-dial \{\s*opacity: 1;\s*animation: journey-dial-live/);
});

test("dashboard stat plaques bind engraved icons to live streak and due data", () => {
  assert.match(script, /const DASHBOARD_STAT_ICONS = \{/);
  assert.match(script, /function buildDashboardStat\(label, value, options = \{\}\)/);
  assert.match(script, /buildDashboardStat\("Current streak", String\(streakDays\), \{\s*kind: "streak",\s*unit: streakDays === 1 \? "day\." : "days\.",\s*leadNode: buildStreakFlameIcon\(streakDays\),\s*tailNode: buildStreakCalendarIcon\(journey\)/);
  assert.match(script, /buildDashboardStat\("Due concepts", String\(dueCount\), \{\s*kind: "due",\s*leadIcon: "scroll"/);
  assert.match(styles, /\.dashboard__stat::before \{[\s\S]*?border: 1px solid color-mix/);
  assert.match(styles, /\.dashboard__stat .dashboard__stat-value \{[\s\S]*?font-family: Georgia, Cambria[\s\S]*?white-space: nowrap;/);
  assert.match(styles, /\.dashboard__stat-unit \{/);
});

test("the streak flame heats up and the calendar marks real study days", () => {
  assert.match(script, /function getStreakFlameTier\(streakDays\)/);
  assert.match(script, /if \(streakDays >= 14\) return 4;\s*if \(streakDays >= 7\) return 3;\s*if \(streakDays >= 3\) return 2;\s*if \(streakDays >= 1\) return 1;\s*return 0;/);
  assert.match(script, /const STREAK_FLAME_COLORS = \["#a1937e", "#c99044", "#d97b35", "#cd5d2a", "#b23a25"\];/);
  assert.match(script, /icon\.dataset\.streakTier = String\(tier\);/);
  assert.match(script, /icon\.style\.color = STREAK_FLAME_COLORS\[tier\];/);
  assert.match(script, /function buildStreakCalendarIcon\(journey, now = Date\.now\(\)\)/);
  assert.match(script, /const activeDays = new Set\(\(journey\?\.events \|\| \[\]\)\.map\(\(event\) => event\?\.localDay\)\.filter\(Boolean\)\);/);
  assert.match(script, /const weekdayIndex = \(new Date\(now\)\.getDay\(\) \+ 6\) % 7;/);
  assert.match(script, /activeDays\.has\(key\)/);
  assert.match(styles, /\.dashboard__stat-icon--flame\[data-streak-tier="4"\] svg \{\s*filter: drop-shadow/);
});

test("reduced motion keeps the dials legible while stopping the movement", () => {
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\) \{\s*\.journey-focus-dial,\s*\.journey-focus-dial::before,\s*\.journey-focus-dial__hand,\s*\.journey-arc::before,\s*\.journey-arc__head,\s*\.journey-arc__needle,\s*\.journey-gauge__needle \{\s*transition: none;\s*\}/);
  assert.match(styles, /\.journey-metric--focus\.is-session-live \.journey-focus-dial,\s*\.journey-metric--focus\.is-session-live \.journey-metric__label::after \{\s*animation: none;\s*\}/);
});
