# NeatMind — OpenAI Build Week Demo Video Plan

> **Status:** Planning and scriptwriting only. No video implementation, rendering, generated animation, application changes, or new feature code are included in this document. This revision was verified against the repository at commit `f345792`.
>
> **Reconciliation note (this revision):** in parallel with this document, Codex independently built a 12-scene Remotion pipeline (`demo-video/neatmind-remotion/`) and produced a rendered `out/NeatMind_Build_Week_Demo.mp4`, along with its own uncommitted rewrite of this file. This revision **reconciles the two**: it adopts Codex's fuller 12-scene structure (it already covers the Learning Forest and adaptive-planning beats this document's earlier 11-scene version only partially addressed), corrects several claims that went beyond verified repository behavior, fixes recurring wording issues ("Codex GPT-5.6" as one name; "irrelevant Java content" as the memorable hook), and folds in this document's own guardrails (no-pure-black, study-goal accuracy limits, session-ID redaction) that Codex's version didn't carry. See `../RECONCILIATION_NOTES.md` for the itemized, scene-by-scene fix list against the actual Remotion source — this document is the claims/evidence authority; that file is the implementation fix list for files this session cannot edit directly (they live in the main checkout, not this worktree).
>
> **Target:** 150 seconds, 1920 × 1080, 16:9, 30 FPS. Absolute submission maximum: 180 seconds.
>
> **Audience:** OpenAI Build Week judges.
>
> **Editorial rule for this revision:** the working product must appear on screen within the first five seconds; abstract framing rides *over* real UI rather than replacing it. Every spoken claim must map to a row in the evidence matrix (Section 4).

## 1. Verified Competition Requirements

Checked on 20 July 2026 using the official [OpenAI Build Week page](https://openai.com/build-week/), [Devpost challenge page](https://openai.devpost.com/), [Official Rules](https://openai.devpost.com/rules), [FAQ](https://openai.devpost.com/details/faqs), [updates](https://openai.devpost.com/updates), [Codex documentation](https://developers.openai.com/api/docs/guides/code-generation#use-codex), and [GPT-5.6 documentation](https://developers.openai.com/api/docs/guides/latest-model?model=gpt-5.6).

### Official requirements

- Submit by **Tuesday, 21 July 2026, 5:00 PM Pacific** / **22 July, 8:00 AM MYT**.
- Select exactly one track: **Apps for Your Life, Work & Productivity**, **Developer Tools**, or **Education**.
- Submit a working, non-trivial project meaningfully built with **Codex** and **GPT-5.6**.
- Explain Codex and GPT-5.6 use in the Devpost description, README, and demo-video audio.
- Submit the `/feedback` session ID from the primary Codex build thread.
- Provide a public licensed repository, or a private repository shared with the required judge emails.
- README must contain setup/sample-data/run/test instructions and accurately describe creator, Codex, and GPT-5.6 contributions.
- Demo video must be publicly viewable on YouTube, below three minutes, have audio/voice-over, show the working product, and explain Codex/GPT-5.6 use.
- Judges assess Technological Implementation, Design, Potential Impact, and Quality of the Idea equally after the viability screen.
- Judges need free, unrestricted access to the intended platform, test build, or functioning demo through judging.
- Only use third-party music, images, marks, and screenshots with the necessary rights. Use English or include translations.

### Guidance, not competition requirements

- AI/TTS narration is permitted; a silent/music-only screencast is insufficient.
- Showing Codex onscreen is not mandatory, but is a strong implementation signal.
- Public YouTube visibility is safest even though the FAQ permits unlisted videos.
- The 150-second target, product-first opening, per-scene timing audit, and Hyperframes recommendation are strategic choices, not official requirements.

## 2. Project Understanding

### One-sentence explanation

NeatMind turns learner-selected study material into evidence-linked lessons and active recall, then builds a goal-aware plan that tells the learner what to study next — all from their own saved evidence.

### Product summary

NeatMind is a Chrome Manifest V3 study companion. A learner deliberately selects a webpage, note, document, or supported video source; the extension builds or opens a grounded visual lesson, exposes source evidence, supports active-recall practice, records progress in a durable Journey, and — when the learner sets a study goal on the Dashboard — surfaces a short daily plan of the next study actions.

### Primary judge workflow

1. Open Dashboard.
2. Select **Create**.
3. Select **Paste Notes**.
4. Select **Try 60-sec math demo**.
5. Inspect the **Evidence checked** banner and a source quote in the **Subtract 3** concept.
6. Start the one-question check, choose `x = 6`, and submit.
7. Open **Journey** and show the saved `Demo - Linear Equations` chapter.
8. Return to **Dashboard**, set a **Study Goal** (focus chapters, target date, daily study time), and show the **Until target** countdown and the generated **Today's Plan** next action.

> Production note: steps 6–8 need at least one real Journey chapter to exist so the goal form can select focus chapters and the plan can show a concrete recovery step. A fresh install shows "All Journey chapters" and an onboarding step, which is a weaker demo. Capture the goal segment on a profile that already has the demo chapter and one submitted quiz.

### Adaptive planning — corrected to verified behavior only

Codex's draft described NeatMind as adjusting six dimensions of the learner's plan. Checked against `journey-utils.js`, only some of these are real:

| Codex's draft claim | Verified? | Repository evidence |
| --- | --- | --- |
| Which concepts to review next | **Yes** | `getDueConcepts` ranks by weak state, effective strength, and overdue `nextReviewAt` |
| Urgency/timing of future reviews | **Yes** | SM-2-lite scheduling: `intervalDays`/`easeFactor` shrink or grow per concept based on right/wrong history |
| Suggested session length | **Partial** | Step count (`goalMaxSteps`) scales with the goal's `dailyMinutes` or, with no goal, the learner's typical Focus session length (`habit.typicalSessionMinutes`) — this is a declared-setting/habit lookup, not the system detecting "you seem tired today" |
| Difficulty and type of practice | **No** | Quiz difficulty is a manual setting at generation time (`server.js` difficulty modes); no code adjusts it based on learner state |
| Balance of explanation vs. active recall vs. revision | **No** | No such balancing logic exists |
| Most appropriate "study mode" | **No** | No "study mode" concept exists anywhere in the codebase |

**Video-safe framing:** "NeatMind tracks which concepts are due or weak, brings them back sooner or later based on how you did last time, and sizes today's plan to your goal or your usual session length." Do not claim it adjusts practice difficulty/type, balances teaching styles, or picks a "mode" — none of that is implemented. "Confidence" is also not a tracked signal; do not list it as an input.

### Technical architecture

```text
Learner-selected source
  -> Chrome side-panel capture and validation
  -> optional protected loopback Node.js API
  -> configured Gemini or OpenAI provider path
  -> evidence/artifact validation
  -> Chrome extension-local Journey storage
  -> visual lesson, quiz, evidence navigation
  -> goal-aware study plan and next action
```

- Chrome side panel: user interaction, lesson and quiz UI, source display, Dashboard study goal.
- Service worker: privileged browser actions, storage coordination, Focus rules, video authorization.
- Chrome local storage: durable local Journey chapters, sources, artifacts, results, and the saved study goal.
- Optional Node.js backend: bounded API routes, origin/token checks, provider isolation, structured output handling.
- No user accounts, role system, administrator console, or remote database are claimed.

### Strongest product claims for the video

- The math judge demo is deterministic and needs no account, provider key, extension install, or site-access approval.
- The learner can inspect the supporting source sentence for a visual concept.
- The learner can report an unsupported claim without changing the source.
- Quiz work is bound to the saved source and recorded in Journey.
- Journey keeps evidence, practice results, and per-concept review scheduling together.
- The learner can define a study goal, and NeatMind turns it into a short daily plan of concrete next actions from their own evidence.
- Site access is explicitly requested when the learner chooses to study a site.

## 3. Track, Users, Problem, and Impact

### Recommended track

**Education.** The project is a student study product whose central workflow is evidence-linked learning, active recall, sustained revision, and a learner-defined study goal.

### Primary users

- Everyday learners organizing course material.
- Exam revisers turning selected material into source-backed practice against a target date.
- Independent learners combining sources without losing provenance.

### Previous problem

Students move between scattered pages, PDFs, videos, and notes. Generic summaries can be hard to verify and do not automatically become a durable revision plan or tell the learner what to do next. The video must describe this as a documented product problem, not as measured market data.

### Value proposition

Students should not have to choose between fast AI help and knowing both where an answer came from and what to study next.

### Impact framing

NeatMind can make selected study material more inspectable, reusable, and actionable, and can turn a learner's own evidence into a concrete next step. Do not claim time savings, accuracy percentages, user adoption, learner outcomes, security certifications, or performance benchmarks.

## 4. Evidence and Claim Guardrails

Line numbers are indicative for commit `f345792`; the file and named symbol are the durable references. Re-confirm the symbol before capture.

| Video claim | Evidence (file · symbol) | Commit | Status | Video use |
| --- | --- | --- | --- | --- |
| Source-grounded study companion | `README.md:1` | `f345792` | Confirmed | Use |
| Zero-setup curated demo | `README.md` Judge Quick Start (~`:21`) | `f345792` | Confirmed | Use |
| Evidence-linked visual concepts, "Evidence checked" status | `popup.js:3480` (`"Evidence checked"` label) | `f345792` | Confirmed | Use |
| Report an unsupported claim without changing the source | `popup.js:7753` (`"Report unsupported claim"`), `popup.js:7801` | `f345792` | Confirmed | Use |
| Source-bound quiz with semantic grounding check | `server.js:747`, `server.js:689` (`verifyQuizAnswersSemantically`) | `f345792` | Confirmed | Use |
| Per-concept review scheduling (SM-2-lite) | `journey-utils.js:1646` (`getDueConcepts`), `journey-utils.js:1528` (`nextReviewAt`/`intervalDays`) | `f345792` | Confirmed | Use, plain language |
| Plan step count scales with goal/habit session length | `journey-utils.js:1927` (`goalMaxSteps`/`maxSteps`), `journey-utils.js` `buildHabitProfile` | `f345792` | Confirmed | Use, qualified — a settings/habit lookup, not live behavior sensing |
| Adaptive difficulty/practice-type selection, explanation/recall/revision balancing, or a "study mode" | Not found in `journey-utils.js`, `popup.js`, or `server.js` | `f345792` | Unconfirmed | Do not use — corrects Codex's draft "Adaptive Learning" section |
| Local Journey storage | `background.js:307` (`chrome.storage.local`) | `f345792` | Confirmed | Use |
| Learner-defined study goal (label, target date, focus chapters, days/week, daily minutes) | `popup.html:95` (`#dashboardGoalForm`), `journey-utils.js:50` (`normalizeStudyGoal`), `popup.js:10098` (`handleSaveStudyGoal`) | `f345792` | Confirmed | Use |
| Goal-aware study plan and next action | `journey-utils.js:1862` (`buildStudyPlan`), `popup.js:10252` (`today-plan`) | `f345792` | Confirmed | Use |
| "Until target" countdown / goal progress context | `journey-utils.js:1887` (`goalContext.daysToTarget`), `popup.js:10038` | `f345792` | Confirmed | Use, qualified |
| Study-goal / plan regression tests exist | `tests/journey-utils.test.js:1257`+, `tests/popup-dashboard.test.js` | `f345792` | Confirmed | Use (as build evidence) |
| Optional provider path | `server.js` provider adapter, `README.md:162` | `f345792` | Confirmed | Use, qualified |
| Backend hardening (origin/token/bounds/limits/safe errors) | `README.md:426`, `server.js` API guards | `f345792` | Confirmed | Use, simple language |
| Codex primary build session | `feedback/2026-07-15-fix-quiz-generation-grounding.md:1` | `f345792` | Confirmed | Use |
| GPT-5.6 as Codex build collaborator | `hackathon/CODEX_COLLABORATION.md:5` | `f345792` | Strongly supported | Use |
| GPT-5.6 as live runtime model | Runtime configuration not verified in submitted demo | — | Unconfirmed | Do not use |

### Study-goal accuracy guardrails (do NOT overclaim)

The study-goal feature is real (State A), but it is a **goal-aware next-action planner**, not a calendar or reminder system. In narration and captions, do **not** claim any of the following, none of which exist in the code:

- Reminders, push notifications, or alerts.
- A dated calendar, timetable, or scheduled sessions on specific days.
- Deadline enforcement or "we'll keep you on track" automation.
- An explicit "mark goal complete" state (the goal has no completion flag; only chapters carry a completed status).
- Deleting or removing a goal in the UI (the form supports creating and updating a goal; there is no remove control).
- A single "percent of goal complete" figure (progress is shown as a target-date countdown, completed focus-chapter count, and a daily-minutes ring — not one aggregate percentage).

Accurate phrasings to prefer: "set a study goal," "focus chapters, a target date, and a daily study time," "counts down the days to your target," "builds today's plan from your own evidence," "recommends the next study action."

### Mandatory wording constraint (GPT-5.6)

Use this natural wording unless the creator confirms live OpenAI/GPT-5.6 runtime use in the submitted demo:

> "I used GPT-5.6 in Codex as an engineering collaborator during development. This demo does not claim GPT-5.6 as its runtime model."

Do not claim encryption, compliance certification, RBAC, user accounts, audit logging, anonymous storage, provider retention guarantees, or a remote database.

## 5. Security and Data Story

### Three ideas the narration must communicate (and only these)

1. **Site access is requested only when the learner chooses** to study a page.
2. **Study progress is stored in Chrome extension-local storage.**
3. **Optional AI generation passes through a protected local backend that validates and limits requests.**

Everything else is shown, not spoken.

### Video-safe data flow

```text
Learner action
  -> per-site permission and bounded source handling
  -> NeatMind extension
  -> optional protected loopback backend
  -> configured provider
  -> validation and evidence binding
  -> Chrome extension-local Journey storage
  -> safe lesson, quiz, and next action
```

### Shown on screen (labels, not narration)

The technical mechanisms appear only as compact diagram labels while the narration stays at the three-idea level:

- **Origin check**, **Token rule**, **Input bounds**, **Validation**, **Safe errors**.

Supporting evidence for these labels: `README.md:426`, `server.js` API guards. Never depict a lock icon, an encrypted database, or a compliance badge — none are verified.

### Diagram direction

- Solid lines: learner action, extension, validation, local Journey storage.
- Dotted line: optional configured provider path.
- Keep the five labels small and static; the voice-over never reads them as a list.

## 6. Human, Codex, and GPT-5.6 Collaboration Story

### Human contribution

- Defined the learner problem and the source-grounding standard.
- Authored the scope, PRD, technical specification, and design constraints.
- Identified the defect, defined the expected result, set acceptance criteria, reviewed outcomes, and made final decisions.
- Authored and committed the repository changes. Do not say Codex committed them.

### Codex contribution (using GPT-5.6)

- Inspected relevant repository surfaces — the UI, prompts, parser, validation, and tests — and traced the complete generation path.
- Helped develop or recommend focused source-grounding changes.
- Supported Journey UX, responsive QA, tests, and documentation.
- Detected a Vite-versus-extension workspace mismatch before an incorrect repository edit.

### Framing to use (professional, specific)

> "When quiz generation returned the wrong number of questions and included off-source content, I asked Codex using GPT-5.6 to trace the complete generation path — the UI, prompts, parser, and validation. Codex proposed focused fixes; I reviewed them, and the stronger source-grounding is visible in this demo."

Do not say: "Codex GPT-5.6" as one product name; "Codex committed changes"; or "Codex designed the project." Prefer "Codex using GPT-5.6," "GPT-5.6 in Codex," or "I used GPT-5.6 through Codex during development."

### Primary visual proof

1. Human defect card: expected result stated — "Five source-grounded questions requested; the flow returned the wrong count and off-source content."
2. Codex trace card: UI → prompt → parser → validation → tests.
3. Compact grounding/test card.
4. Human review card: exact count and source grounding are non-negotiable.
5. Match cut to the evidence-linked math demo.

### Primary `/feedback` evidence

- Session ID: `019f65fd-eb83-7cf1-9ec5-1eaf083f4b5f`
- Thread: `Fix quiz generation grounding` (`feedback/2026-07-15-fix-quiz-generation-grounding.md`)
- Use only a cropped/sanitized transcript if the creator approves it.

## 7. Narrative Strategy

### Product-first opening (first five seconds show real UI)

> Frame 1 is the real NeatMind side panel with an evidence-linked lesson already visible; the problem is narrated *over* that live product.

### Core narrative

```text
Real product on screen
  -> the fragmented-study problem, spoken over live UI
  -> what NeatMind is
  -> zero-setup working demo (evidence, recall, Journey)
  -> learner-defined goal and next action
  -> security and data boundaries
  -> human + Codex/GPT-5.6 collaboration
  -> memorable value conclusion and silent hold
```

### Closing message

> "NeatMind — study material you can inspect, practice, and keep."

## 8. Timed Storyboard

**Reconciled with Codex's 12-scene structure** (adds a dedicated Learning Forest beat and splits the Codex/GPT-5.6 story across two scenes for more breathing room). Total 150 seconds. The full prose beat sheet as Codex wrote it — screen directions, card copy, etc. — lives in the diff at `demo-video/script_of_video/` history; the table below is this document's authoritative, claim-checked version. Scene-by-scene fixes needed in the actual Remotion source are itemized in `../RECONCILIATION_NOTES.md`.

| Section | Timing |
| --- | ---: |
| Hook | 0:00–0:07 |
| Introduce NeatMind | 0:07–0:17 |
| Zero-setup demo | 0:17–0:28 |
| Evidence-checked learning | 0:28–0:43 |
| Inspect/challenge evidence | 0:43–0:56 |
| Quiz → Journey | 0:56–1:13 |
| Learning Forest | 1:13–1:21 |
| Study Goal & Today's Plan | 1:21–1:36 |
| Trust in three ideas | 1:36–1:48 |
| Codex collaboration | 1:48–2:09 |
| GPT-5.6 contribution | 2:09–2:20 |
| Closing | 2:20–2:30 |

| # | Time | Section | Objective | Voice-over | Screen / action | On-screen text | Motion | Evidence |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 00:00–00:07 | Hook | Show the real product immediately | "Before an exam, students jump between tabs, PDFs, videos, and scattered notes." | Live side panel: an evidence-linked lesson already visible. | `NeatMind` | Gentle push-in on real UI. | `README.md:1`, `popup.js:3480` |
| 2 | 00:07–00:17 | Introduce NeatMind | State what NeatMind does | "NeatMind turns learner-selected material into evidence-linked lessons, active-recall practice, and a study journey that continues adapting as the learner progresses." | Four-stage loop (Source→Evidence→Practice→Journey) resolving into the app header. | `Source → Evidence → Practice → Journey` | Sequential reveal over live UI. | `README.md:1` |
| 3 | 00:17–00:28 | Zero-setup demo | Prove easy judge entry | "Here's the zero-setup demo — a note from a short linear-equations source. It needs no account, site-access approval, or provider key." | Dashboard → Create → Paste Notes → math demo. | `Zero-setup judge demo` | Cursor taps; controlled crop. | `README.md:21` |
| 4 | 00:28–00:43 | Evidence-checked learning | Show visible evidence status | "The lesson identifies its source and marks the generated concepts as evidence checked. Instead of asking the learner to trust a summary blindly, NeatMind keeps the supporting material visible." | Evidence-checked banner; zoom to the Subtract 3 concept. | `Evidence checked` | Highlight sweep; slow zoom banner→concept. | `popup.js:3480` |
| 5 | 00:43–00:56 | Inspect/challenge evidence | Show inspectable, challengeable evidence | "Open 'Subtract 3,' and the explanation appears beside the exact supporting sentence. If something is unsupported, the learner can report the claim without changing the original source." | Concept panel, quote, and report control. | `Exact supporting evidence` | Drawn evidence line; rack focus concept→quote. | `popup.js:7753`, `popup.js:7801` |
| 6 | 00:56–01:13 | Quiz → Journey | Turn recall into durable progress | "Next, the learner completes a source-bound question. Choosing x equals six and submitting the answer records progress beyond a disposable chat. Journey keeps the chapter, source, result, and next action together." | Select `x = 6` → submit → Journey card updates. | `Saved to Journey` | Match cut quiz chip → Journey card. | `server.js:747`, `background.js:307` |
| 7 | 01:13–01:21 | Learning Forest | Memorable long-term-progress visual | "Progress becomes visible in the Learning Forest — each chapter grows as it develops." | Seed→seedling→tree; cursor clicks a tree; compact stage/notes/practice panel. | `Learning Forest` | Ambient leaf motion; one controlled growth animation. | `journey-utils.js` growth-stage thresholds, `journey-utils.js:1699` `getChapterStatus` |
| 8 | 01:21–01:36 | Study Goal & Today's Plan | Show learner-defined goal and next action | "On the Dashboard, I set a goal — focus chapters, a target date, a daily time. NeatMind counts down and builds today's plan: the next step, ready to go." | Dashboard goal form fills in; **Until target** stat; **Today's Plan** step with a **Go** action. | `Study goal → Today's Plan` | Calm form fill; highlight the top plan step. | `popup.html:95`, `journey-utils.js:1862`, `popup.js:10252` |
| 9 | 01:36–01:48 | Trust in three ideas | Explain security/data simply | "NeatMind asks for site access only when you choose. Progress stays in local storage. Optional AI runs through a protected, limited backend." | Permission banner; data-flow diagram with five small labels. | `Origin check · Validation · Safe errors` | Solid local lines; dotted optional path. | `README.md:426`, `background.js:307` |
| 10 | 01:48–02:09 | Codex collaboration | Human-led collaboration, professional framing | "I led the product — the problem and the grounding standard. When quiz generation returned the wrong number of questions and included off-source content, I asked Codex, using GPT-5.6, to trace the whole path. It proposed focused fixes, and I reviewed the result." | Human defect card → Codex trace card (UI→prompt→parser→validation) → test/grounding card → human review card. | `Requirement → Trace → Fix → Reviewed` | Causal timeline; match cut toward the demo. | `feedback/2026-07-15-fix-quiz-generation-grounding.md`, `hackathon/CODEX_COLLABORATION.md:5` |
| 11 | 02:09–02:20 | GPT-5.6 contribution | Explain GPT-5.6 accurately | "Through Codex, GPT-5.6 traced the interface, the prompt, and validation, and helped verify the fix — an engineering collaborator, not this demo's runtime model." | Collaboration loop behind a clean product shot. | `GPT-5.6 through Codex` | Slow pullback. | `hackathon/CODEX_COLLABORATION.md:5` |
| 12 | 02:20–02:30 | Closing | End memorably, then hold silent | "Evidence you can inspect. Practice you can keep. A journey that grows with you." *(then silence)* | App header/wordmark over a blurred Learning Forest; ≥3 s music-only hold. | `NeatMind` | Deliberate line, then still hold; fade. | `README.md:1` |

### Fixes applied vs. Codex's draft (do not reintroduce)

- **Scene 3 wording:** Codex's "no account, provider key, or extension permission" reopened the ambiguity Section 4F already closed. Fixed to "no account, site-access approval, or provider key," scoped to *this built-in demo*.
- **Scene 8 content:** Codex's draft invented a stylized "Practice level: Standard → Guided recall" text card and a literal "Next review: Friday" — neither exists in the product (no "practice level" field; due dates are relative, not named weekdays). Replaced with the real, verified Dashboard Study Goal + Today's Plan UI (already planned and evidence-cited in this document).
- **Scene 10 wording:** "Codex GPT-5.6" (as one name) and "irrelevant Java content" (as the memorable hook) both reappeared in Codex's draft after this document had already corrected them once (Section 6D). Fixed back to "Codex, using GPT-5.6," and a professional wrong-count/off-source-content framing.
- **Scene 11 wording:** same "Codex GPT-5.6" fix applied to the collaboration-loop label and narration.
- **No-pure-black rule (Section 10) and the study-goal accuracy guardrails (Section 4, "do NOT overclaim")** are not mentioned anywhere in Codex's draft; both carry forward unchanged and apply to every scene above, especially 7 and 8.

## 9. Continuous Voice-Over Script

281 words across 12 scenes (reconciled with Codex's structure). Deliver at ~133 WPM overall with the pauses noted below. Bracketed cues are visual-only holds, not spoken.

Before an exam, students jump between tabs, PDFs, videos, and scattered notes. [hold on live UI]

NeatMind turns learner-selected material into evidence-linked lessons, active-recall practice, and a study journey that continues adapting as the learner progresses. [pause]

Here's the zero-setup demo — a note from a short linear-equations source. It needs no account, site-access approval, or provider key. [cursor taps, let the demo run]

The lesson identifies its source and marks the generated concepts as evidence checked. Instead of asking the learner to trust a summary blindly, NeatMind keeps the supporting material visible. [let the banner breathe]

Open "Subtract 3," and the explanation appears beside the exact supporting sentence. If something is unsupported, the learner can report the claim without changing the original source. [pause]

Next, the learner completes a source-bound question. Choosing x equals six and submitting the answer records progress beyond a disposable chat. Journey keeps the chapter, source, result, and next action together. [let the match cut land]

Progress becomes visible in the Learning Forest — each chapter grows as it develops. [ambient forest motion]

On the Dashboard, I set a goal — focus chapters, a target date, a daily time. NeatMind counts down and builds today's plan: the next step, ready to go. [let the plan appear]

NeatMind asks for site access only when you choose. Progress stays in local storage. Optional AI runs through a protected, limited backend. [pause]

I led the product — the problem and the grounding standard. When quiz generation returned the wrong number of questions and included off-source content, I asked Codex, using GPT-5.6, to trace the whole path. It proposed focused fixes, and I reviewed the result. [causal card timeline]

Through Codex, GPT-5.6 traced the interface, the prompt, and validation, and helped verify the fix — an engineering collaborator, not this demo's runtime model. [slow pullback]

Evidence you can inspect. Practice you can keep. A journey that grows with you. [silent end-card hold, ≥3 seconds]

## 10. Visual and Motion Direction

- **Theme:** Warm, trustworthy scholarly workspace — not generic neon AI.
- **Palette:** Existing espresso brown, parchment surfaces, oxblood actions, muted evidence green/teal, and restrained Journey blue.
- **Typography:** Existing editorial serif for headlines; readable system sans for UI and captions.
- **UI treatment:** Real side-panel capture is dominant and appears from frame one. Use browser framing only when it adds context.
- **Captions:** Compact, high-contrast sentence rail; no large reserved caption band.
- **Motion:** Cursor taps, evidence highlights, controlled crop/zoom, diagram-flow lines, and causal match cuts.
- **Breathing space:** at least two seconds of visual-only time after each important product action (banner, quiz submit, plan appears); the end-card holds silent for at least three seconds.
- **Avoid:** Glitch effects, generic stock footage, long code lists, constant camera movement, tiny UI, overbuilt 3D, and **pure black (`#000000`) anywhere in the frame** — no black mattes, letterboxing, transition beds, or end-card background.
- **Music:** Licensed/original warm electronic-acoustic bed with minimal UI sounds; duck under narration; carries the silent end-card.
- **Accessibility:** Captions, readable sizes, contrast, no rapid flashes, and reduced-motion-aware pacing.

### Background color rule (mandatory — confirmed against the product's own dark surfaces)

**No scene, transition, matte, or end-card may use pure black (`#000000`).** This is not an invented brand preference — it matches how NeatMind's own dark UI is already built:

- The Learning Forest / Journey view (`journey.css:38`, `:49`) never renders on flat black. Its real background is a warm near-black gradient — `linear-gradient(145deg, #070909 0%, #020303 48%, #050606 100%)` — plus a soft ember-brown radial highlight (`rgba(130, 68, 24, 0.08)`). Because Scenes 6, 7, and the end-card sit on or fade toward Journey, capturing the real UI already satisfies this rule for those frames.
- For any *invented* dark surface (title cards, transition beds, the end-card backdrop) that is not a direct UI capture, use one of these two verified dark tokens instead of black:
  - Journey near-black warm gradient: `#070909` → `#020303` → `#050606` (with the ember radial tint above), or
  - Vintage-planner leather brown: `--planner-leather-950: #26170f` / `--planner-leather-900: #342015` (`vintage-planner.css:3-4`), optionally toward `--planner-ember: #6f3217` for warmth.
- Never composite a plain `#000` fade-to-black; fade toward one of the two tokens above so the closing hold stays warm and on-brand instead of reading as a generic dark screen.
- QA check: sample the darkest pixel in every non-captured frame before Gate 5 sign-off and confirm it is not `#000000`.

## 11. Timing Audit (per scene)

Speaking rate is computed per scene from spoken words and speaking seconds (scene duration minus visual-only seconds). Statuses: **Comfortable** (≤135 WPM), **Acceptable** (136–150 WPM), **Too dense** (151–165 WPM), **Must revise** (>165 WPM). No scene may remain Too dense or Must revise.

| Scene | Duration (s) | Word count | Visual-only (s) | Speaking (s) | Required WPM | Status |
| ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 1 | 7 | 12 | 0.5 | 6.5 | 111 | Comfortable |
| 2 | 10 | 20 | 2.0 | 8.0 | 150 | Acceptable |
| 3 | 11 | 20 | 1.0 | 10.0 | 120 | Comfortable |
| 4 | 15 | 29 | 2.0 | 13.0 | 134 | Comfortable |
| 5 | 13 | 27 | 2.0 | 11.0 | 147 | Acceptable |
| 6 | 17 | 31 | 2.5 | 14.5 | 128 | Comfortable |
| 7 | 8 | 13 | 0.5 | 7.5 | 104 | Comfortable |
| 8 | 15 | 28 | 2.5 | 12.5 | 134 | Comfortable |
| 9 | 12 | 22 | 2.0 | 10.0 | 132 | Comfortable |
| 10 | 21 | 42 | 3.0 | 18.0 | 140 | Comfortable |
| 11 | 11 | 23 | 1.5 | 9.5 | 145 | Acceptable |
| 12 | 10 | 14 | 4.0 (incl. ≥3 s silent hold) | 6.0 | 140 | Comfortable |

| Measure | Planned result |
| --- | ---: |
| Spoken narration | 281 words |
| Overall speaking rate | ~133 WPM |
| Total speaking time | ~126.5 seconds |
| Visual-only / silent time | ~23.5 seconds |
| Complete video duration | 150 seconds |
| Maximum allowed duration | 180 seconds |

No scene is marked Too dense or Must revise.

## 12. Production Approval Gates

Do not proceed automatically from one gate to the next. Each gate requires explicit creator approval.

### Gate 1 — Script lock

Approve narration, timestamps, per-scene claims, the evidence matrix, and the storyboard. No capture or animation begins before this gate.

**Decision record (this revision):**

- **Narration (Section 9):** 281 words, ~135 WPM, prepared and internally consistent with the per-scene timing audit (Section 11). Ready for creator sign-off.
- **Timestamps / storyboard (Section 8):** 12 scenes (reconciled with Codex's structure), 150 s total, product-first structure. Ready for creator sign-off.
- **Claims / evidence (Section 4):** every spoken claim maps to a file+symbol+commit row; no unverified claim remains in the script. Ready for creator sign-off.
- **Background color rule (Section 10):** locked as a hard constraint — no pure black anywhere in the frame; use the two verified warm-dark tokens instead. Applies to every future gate, including Gate 2's preflight test.
- **Feature decision (Section 15):** the Study Goal segment (Scene 8) uses the *existing, shipped* Dashboard Study Goal + Today's Plan feature (State A). No new feature was proposed, approved, or implemented to support this script — the segment is demo-script work only, not code work.
- **Still open before Gate 1 can formally close:** the six items in Section 16 (runtime GPT-5.6 confirmation, transcript/session-ID display approval, asset reuse, end-card credit, judge URL, and which specific goal to capture). Gate 1 is script-*ready*, not yet script-*signed*.

This document remains planning/script only. Gate 2 (technical preflight) is the first step that touches Hyperframes, installs any video-production dependency, or renders a frame — none of that has started, and it will not start without a separate explicit go-ahead, since it falls outside this task's current scope.

### Gate 2 — Technical preflight

Superseded by events: Codex's Remotion build already passed this gate in practice (a full render exists). Treat the existing `out/NeatMind_Build_Week_Demo.mp4` as the preflight artifact — review it against the fix list in `../RECONCILIATION_NOTES.md` rather than building a fresh 10–15 second test.

### Gate 3 — Rough animatic

Produce a low-resolution, complete timeline using rough assets to validate pacing, order, and the per-scene timing audit end to end.

### Gate 4 — Visual-polish approval

Review detailed motion, diagrams, typography, cursor movement, transitions, and sound.

### Gate 5 — Final quality assurance

Verify runtime, captions, audio, absence of sensitive information, UI readability, copyright/rights, YouTube compression, submission requirements, and the **no-pure-black background rule** (Section 10) before publishing.

## 13. Production Pipeline (superseded by events — Remotion is now the further-along path)

### What actually happened

Two implementation paths were explored in parallel:

1. **HyperFrames** (this session, `demo-video/neatmind-demo-reel-v2/`) — reached a reviewed 11-frame plan (`STORYBOARD.md`) and a live storyboard-review checkpoint, but **no scenes were built or rendered**.
2. **Remotion** (Codex, `demo-video/neatmind-remotion/`) — independently reached a complete 12-scene composition and an actual rendered `out/NeatMind_Build_Week_Demo.mp4`, with real narration audio and reused UI screenshots already in place.

Given Remotion is materially further along — a working render already exists — **it is the pragmatic primary path going forward**, not HyperFrames. The HyperFrames project is parked, not deleted; its `STORYBOARD.md` and `BRIEF.md` remain a valid, independently-reviewed reference if the Remotion path needs to be abandoned later.

### What the Remotion output still needs before it can ship

None of the fixes below have been applied to the actual Remotion source yet — that source lives in the main checkout, outside this worktree's write access. See `../RECONCILIATION_NOTES.md` for the itemized, file-and-line-level fix list; the corrected claims/wording/timing above (Sections 4, 8, 9, 11) are what that source needs to be brought into line with.

- **Background/build note (carries forward unchanged):** any invented background, transition bed, or end-card component must use the Journey near-black gradient (`#070909`/`#020303`/`#050606` + ember radial tint) or the vintage-planner leather browns (`#26170f`/`#342015`) — never `#000000`. Not yet verified against the actual Remotion component colors — check before shipping.
- Twelve scene components now (not eleven) — see Section 8's reconciled table.
- H.264/AAC MP4 output at 1920×1080/30fps/150s remains the target; the existing render should be checked against this before being treated as final.

## 14. Asset and Compliance Checklist

### Capture after approval

- Dashboard-to-math-demo route.
- Evidence status banner.
- Subtract 3 concept and exact source quote.
- One-question quiz and Journey update.
- **Study Goal form** (focus chapters, target date, daily study time), **Until target** stat, and **Today's Plan** next-action step with its Go control — captured on a profile that already has the demo chapter and a submitted quiz.
- Permission banner.
- Optional short PDF/video/Focus/Library montage.
- Sanitized Codex defect and trace cards.
- Fresh current test result if it will be shown.
- App header/wordmark and Journey end-card background.

### Existing candidate assets

- `assets/page-actions/` illustrations.
- `assets/journey/` Journey artwork.
- Existing untracked `demo-video/` UI screenshots only if the creator approves their reuse.

### Never show

- `.env`, API keys, tokens, backend logs, local paths, private attachments, raw source data beyond safe demo content, or historical test totals.

### Submission checks

- YouTube video is publicly viewable and under three minutes.
- Audio is present and understandable.
- Repository link works while signed out.
- Judge path instructions match the demo (including the study-goal steps).
- Primary `/feedback` session ID is entered exactly.
- Rights are confirmed for all music, images, trademarks, and screenshots.

## 15. Study-Goal Feature Finding (Part 3 audit)

**Classification: State A — Fully implemented, with stated limits.**

A learner can define a study goal and NeatMind uses it to organize and track a study plan. The feature is wired end to end and covered by tests.

| Capability | Present? | User-defined or automatic | Repository evidence | UI evidence | Safe to mention in video? |
| --- | --- | --- | --- | --- | --- |
| Set a study goal (name) | Yes | User-defined (name optional) | `journey-utils.js:50` `normalizeStudyGoal`; `popup.js:9702` `saveStudyGoal` | `popup.html:145` goal name field | Yes |
| Set a target date | Yes | User-defined (optional) | `normalizeStudyGoal` `targetDate`; `journey-utils.js:1881` | `popup.html:143` date input | Yes |
| Choose target topics | Yes (existing chapters only) | User-defined | `normalizeStudyGoal` `chapterIds` | `popup.html:114` focus-chapter checkboxes | Yes — say "focus chapters" |
| Choose a daily / weekly target | Yes | User-defined | `normalizeStudyGoal` `dailyMinutes`, `daysPerWeek` | `popup.html:121`,`:133` selects | Yes |
| Generate a study plan | Yes | Automatic from goal + evidence | `journey-utils.js:1862` `buildStudyPlan` | `popup.js:10252` Today's Plan | Yes |
| Track progress toward the goal | Partial (coarse) | Automatic | `journey-utils.js:1887` `goalContext` (days to target, completed focus-chapter count) | `popup.js:10038` "Until target"; daily-minutes ring | Yes, qualified — not a single % |
| Reschedule missed work | Partial | Automatic (spaced repetition) | `journey-utils.js:1646` `getDueConcepts`; overdue `nextReviewAt` | Recovery steps in Today's Plan | Yes, as "due for review" |
| Recommend the next study action | Yes | Automatic | `buildStudyPlan` steps (recovery/advance/stretch) | `popup.js:10252` step + Go | Yes |
| Schedule concept reviews | Yes | Automatic (SM-2-lite) | `journey-utils.js:1528` `intervalDays`/`nextReviewAt` | Journey / due count | Yes |
| Mark a goal as completed | No | — | No completion flag on the goal | Chapters have status; goal does not | No — do not claim |

**Limits to respect (see Section 4 guardrails):** no reminders/notifications, no dated calendar, no deadline enforcement, no explicit goal-completion state, no goal-removal control, and no single aggregate "goal % complete." Because the feature is State A, no separate enhancement proposal is included in this plan; any future work (goal completion state, goal removal, reminders) would be a new proposal requiring explicit approval.

## 16. Open Questions Before Production

Only decisions that genuinely require creator input:

1. Was `AI_PROVIDER=openai` with a GPT-5.6 model actually used in development or the intended demo runtime? (Controls whether any runtime claim is permitted.)
2. If runtime GPT-5.6 use is confirmed, what is the exact public model label, code path, and configuration to cite?
3. May a cropped/sanitized primary Codex transcript and the session ID appear on screen?
4. May existing untracked `demo-video/` assets be reused, or should all captures be retaken?
5. What creator name/title should appear on the end card?
6. What public judge-access URL will be submitted?
7. For the study-goal segment, which goal should be shown (name, focus chapters, target date, daily time) so the "Until target" countdown and top plan step read cleanly on the demo profile?
8. Confirm the Remotion pipeline (`demo-video/neatmind-remotion/`) as the primary path over HyperFrames, and confirm whether the fixes in `../RECONCILIATION_NOTES.md` should be applied by Codex directly, or handed back to this session in a worktree that includes that project.
9. Commit Codex's uncommitted work in the main checkout (the Remotion project and this plan-doc rewrite) before it's at risk of being lost — whose job is that, and on which branch?

---

**RECONCILED WITH CODEX'S REMOTION BUILD — WAITING ON THE OPEN QUESTIONS IN SECTION 16 (ESPECIALLY #8–9) BEFORE THE REMOTION SOURCE IS CORRECTED AND TREATED AS FINAL**
