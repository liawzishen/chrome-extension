# NeatMind — OpenAI Build Week Demo Video Plan

> **Status:** Planning and scriptwriting only. No video implementation, rendering, generated animation, or application changes are included in this document.
>
> **Target:** 150 seconds, 1920 × 1080, 16:9, 30 FPS. Absolute submission maximum: 180 seconds.
>
> **Audience:** OpenAI Build Week judges.

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
- The 150-second target, visual data-flow explanation, and Hyperframes recommendation are strategic choices, not official requirements.

## 2. Project Understanding

### One-sentence explanation

NeatMind turns learner-selected study material into evidence-linked lessons, active recall, and a persistent next study action.

### Product summary

NeatMind is a Chrome Manifest V3 study companion. A learner deliberately selects a webpage, note, document, or supported video source; the extension builds or opens a grounded visual lesson, exposes source evidence, supports active-recall practice, and records progress in a durable Journey.

### Primary judge workflow

1. Open Dashboard.
2. Select **Create**.
3. Select **Paste Notes**.
4. Select **Try 60-sec math demo**.
5. Inspect the **Evidence checked** banner and a source quote in the **Subtract 3** concept.
6. Start the one-question check, choose `x = 6`, and submit.
7. Open **Journey** and show the saved `Demo - Linear Equations` chapter.

### Technical architecture

```text
Learner-selected source
  -> Chrome side-panel capture and validation
  -> optional protected loopback Node.js API
  -> configured Gemini or OpenAI provider path
  -> evidence/artifact validation
  -> Chrome extension-local Journey storage
  -> visual lesson, quiz, evidence navigation, and next action
```

- Chrome side panel: user interaction, lesson and quiz UI, source display.
- Service worker: privileged browser actions, storage coordination, Focus rules, video authorization.
- Chrome local storage: durable local Journey chapters, sources, artifacts, and results.
- Optional Node.js backend: bounded API routes, origin/token checks, provider isolation, structured output handling.
- No user accounts, role system, administrator console, or remote database are claimed.

### Strongest product claims for the video

- The math judge demo is deterministic and needs no account, provider key, extension install, or browser permission.
- The learner can inspect the supporting source sentence for a visual concept.
- The learner can report an unsupported claim without changing the source.
- Quiz work is bound to the saved source and recorded in Journey.
- Journey keeps evidence, practice results, and a next action together.
- Site access is explicitly requested when the learner chooses to study a site.

## 3. Track, Users, Problem, and Impact

### Recommended track

**Education.** The project is a student study product whose central workflow is evidence-linked learning, active recall, and sustained revision.

### Primary users

- Everyday learners organizing course material.
- Exam revisers turning selected material into source-backed practice.
- Independent learners combining sources without losing provenance.

### Previous problem

Students move between scattered pages, PDFs, videos, and notes. Generic summaries can be hard to verify and do not automatically become a durable revision plan. The video must describe this as a documented product problem, not as measured market data.

### Value proposition

Students should not have to choose between fast AI help and knowing where an answer came from.

### Impact framing

NeatMind can make selected study material more inspectable, reusable, and actionable. Do not claim time savings, accuracy percentages, user adoption, learner outcomes, security certifications, or performance benchmarks.

## 4. Evidence and Claim Guardrails

| Video claim | Evidence | Status | Video use |
| --- | --- | --- | --- |
| Source-grounded study companion | `README.md:1` | Confirmed | Use |
| Zero-setup curated demo | `README.md:21` | Confirmed | Use |
| Evidence-linked visual concepts | `popup.js:7623`, `popup.js:8439` | Confirmed | Use |
| Unsupported-claim report | `popup.js:7741` | Confirmed | Use |
| Source-bound quiz | `server.js:806` | Confirmed | Use |
| Journey and review scheduling | `journey-utils.js:1313`, `journey-utils.js:1400` | Confirmed | Use |
| Local Journey storage | `background.js:296` | Confirmed | Use |
| Optional provider path | `server.js:57`, `README.md:162` | Confirmed | Use, qualified |
| Backend hardening | `server.js:324`, `server.js:378`, `server.js:454` | Confirmed | Use, simple language |
| Codex primary build session | `feedback/2026-07-15-fix-quiz-generation-grounding.md:1` | Confirmed | Use |
| GPT-5.6 as Codex build collaborator | `hackathon/CODEX_COLLABORATION.md:5` | Strongly supported | Use |
| GPT-5.6 as live runtime model | Runtime configuration not safely verified | Unconfirmed | Do not use |

### Mandatory wording constraint

Use this wording unless the creator confirms live OpenAI/GPT-5.6 runtime use:

> “GPT-5.6 was used through Codex as the engineering collaborator in this build workflow; this demo does not claim it is the runtime model.”

Do not claim encryption, compliance certification, RBAC, user accounts, audit logging, anonymous storage, provider retention guarantees, or a remote database.

## 5. Security and Data Story

### Video-safe explanation

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

### Confirmed protections to show

- Page access is requested only when the learner acts.
- Extension-local storage holds study records.
- Optional generation uses a loopback backend with exact-origin checks and bearer-token rules for non-extension clients.
- Requests are bounded and protected by JSON/body limits, timeouts, rate limits, concurrency limits, validation, and safe error handling.
- Provider keys live in backend environment configuration rather than the extension.
- Raw tab-audio chunks and raw PDF bytes are not stored as study artifacts.

### Diagram direction

- Solid lines: learner action, extension, validation, local Journey storage.
- Dotted line: optional configured provider path.
- Five visible labels: **Origin check**, **Token rule**, **Input bounds**, **Validation**, **Safe errors**.
- Never depict a lock or encrypted database unless it is explicitly verified.

## 6. Human, Codex, and GPT-5.6 Collaboration Story

### Human contribution

- Defined the learner problem and source-grounding standard.
- Authored the scope, PRD, technical specification, and design constraints.
- Reported observed defects, set acceptance criteria, reviewed outcomes, and made final decisions.
- Authored and committed the repository changes; do not say Codex committed them.

### Codex contribution

- Inspected relevant repository surfaces and raised risks before implementation.
- Traced the grounded-quiz defect across UI, prompt, parsing, evidence, and validation paths.
- Supported focused source-grounding, Journey UX, responsive QA, tests, and documentation.
- Detected a Vite-versus-extension workspace mismatch before an incorrect repository edit.

### Primary visual proof

1. Human defect card: “Five requested questions returned four, including irrelevant Java content.”
2. Codex plan card: trace UI → prompt → parser → validation.
3. Compact test/grounding card.
4. Human review card: exact count and source grounding are non-negotiable.
5. Match cut to the evidence-linked math demo.

### Primary `/feedback` evidence

- Session ID: `019f65fd-eb83-7cf1-9ec5-1eaf083f4b5f`
- Thread: `Fix quiz generation grounding`
- Use only a cropped/sanitized transcript if the creator approves it.

## 7. Narrative Strategy

### Opening hook

> “Before an exam, students jump between tabs, PDFs, videos, and notes.”

### Core narrative

```text
Problem
  -> affected students
  -> NeatMind’s evidence-linked solution
  -> zero-setup working demo
  -> security and data boundaries
  -> human + Codex GPT-5.6 collaboration
  -> memorable value conclusion
```

### Closing message

> “NeatMind turns scattered study material into evidence learners can inspect, practice they can keep, and a next step they can act on.”

## 8. Timed Storyboard

| # | Time | Objective | Voice-over summary | Screen / action | On-screen text | Motion / transition | Evidence |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | 00:00–00:08 | Hook the fragmented-study problem | Students jump between tabs, PDFs, videos, and notes. | Abstract tabs, PDF, video, note card. | `Scattered sources.` | Slow push-in; clean cut. | `hackathon/SCOPE.md:13` |
| 2 | 00:08–00:17 | Explain the trust gap | Generic summaries can be hard to trace or turn into a next action. | Summary card lacks source link. | `Helpful… but traceable?` | Focus shift; source-link transition. | `README.md:1` |
| 3 | 00:17–00:28 | Introduce solution | NeatMind turns a learner-selected source into lesson, practice, and Journey. | Four-stage product loop resolving into app header. | `Source → Evidence → Practice → Journey` | Sequential reveal. | `README.md:1` |
| 4 | 00:28–00:40 | Prove easy judge entry | Show curated no-key route. | Dashboard → Create → Paste Notes → math demo. | `Try 60-sec math demo` | Cursor taps and controlled crop. | `README.md:21` |
| 5 | 00:40–00:56 | Show visible evidence status | The note names its source and marks claims as evidence checked. | Curated source banner. | `Evidence checked` | 105% zoom; highlight sweep. | `popup.js:8439` |
| 6 | 00:56–01:08 | Show inspectable/challengeable evidence | Open Subtract 3; show exact source and report control. | Concept panel and quote. | `Exact supporting sentence` | Focus rack from concept to quote. | `popup.js:7623`, `popup.js:7741` |
| 7 | 01:08–01:26 | Turn active recall into durable progress | Answer source-bound quiz and show Journey. | Select `x = 6` → submit → Journey. | `Saved to Journey` | Match cut quiz chip to Journey card. | `popup.js:8796` |
| 8 | 01:26–01:48 | Explain security/data simply | Explicit permission, local storage, optional protected generation. | Permission banner and data-flow diagram. | `Origin check · Validation · Safe errors` | Solid local lines; dotted optional path. | `README.md:377`, `server.js:378` |
| 9 | 01:48–02:11 | Prove human-led Codex collaboration | Human direction, Codex analysis, focused grounding work, human review. | Sanitized transcript → plan → code/test card → demo. | `Requirement → Analysis → Test → Reviewed result` | Causal timeline; match cut to product. | `feedback/2026-07-15-fix-quiz-generation-grounding.md:21` |
| 10 | 02:11–02:21 | Explain GPT-5.6 accurately | GPT-5.6 used through Codex, not claimed as demo runtime. | Collaboration loop behind product. | `GPT-5.6 through Codex` | Slow pullback. | `README.md:42` |
| 11 | 02:21–02:30 | End memorably | Evidence, practice, and next action. | App header over blurred Journey. | `Study material you can inspect, practice, and continue.` | Restrained fade to black. | `README.md:1` |

## 9. Continuous Voice-Over Script

Before an exam, students jump between tabs, PDFs, videos, and notes. [brief pause]

Generic summaries can be hard to trace or turn into a next study action. [brief pause]

NeatMind is a Chrome study companion that turns a learner-selected source into an evidence-linked visual lesson, active-recall practice, and a persistent learning journey. Evidence stays visible. [transition]

Here is the zero-setup demo. From Dashboard, I create a note from a short linear-equations source. The curated route needs no account, permission, or provider key. [interface demonstration]

The note names its source and marks its claims as evidence checked. Open “Subtract 3,” and the explanation sits beside the exact supporting sentence. Learners can report an unsupported claim without changing the source. [interface demonstration]

Next, the learner answers a source-bound question. It is tied to the saved note and source fingerprint; submitting records progress beyond a disposable chat. [interface demonstration]

Journey keeps the chapter, source, note, quiz result, and next action together. Its scheduler brings difficult concepts back sooner than mastered concepts. [brief pause]

Trust shapes the data path too. The extension asks for page access only when the learner acts. Study records live in Chrome extension-local storage. Optional generation sends bounded source data through a protected loopback backend to the configured provider; origin checks, token rules, validation, rate limits, and safe error handling guard that boundary. [transition]

I led the product: the student problem, source-grounding standard, and review decisions. After five requested questions produced four with irrelevant Java content, I asked Codex GPT-5.6 to inspect the path. It traced UI, prompt, and validation; helped make targeted grounding changes; and supported regression coverage. I reviewed the result; its principle appears in this demo. [interface demonstration]

GPT-5.6 was used through Codex as the engineering collaborator in this build workflow; this demo does not claim it is the runtime model. [brief pause]

NeatMind turns scattered study material into evidence learners can inspect, practice they can keep, and a next step they can act on.

## 10. Visual and Motion Direction

- **Theme:** Warm, trustworthy scholarly workspace—not generic neon AI.
- **Palette:** Existing espresso brown, parchment surfaces, oxblood actions, muted evidence green/teal, and restrained Journey blue.
- **Typography:** Existing editorial serif for headlines; readable system sans for UI and captions.
- **UI treatment:** Real side-panel capture remains dominant. Use browser framing only when it adds context.
- **Captions:** Compact, high-contrast sentence rail; no large reserved caption band.
- **Motion:** Cursor taps, evidence highlights, controlled crop/zoom, diagram-flow lines, and causal match cuts.
- **Avoid:** Glitch effects, generic stock footage, long code lists, constant camera movement, tiny UI, and overbuilt 3D.
- **Music:** Licensed/original warm electronic-acoustic bed with minimal UI sounds; duck under narration.
- **Accessibility:** Captions, readable sizes, contrast, no rapid flashes, and reduced-motion-aware pacing.

## 11. Future Technical Production Recommendation

### Recommendation: Hyperframes after explicit approval

Hyperframes is the better future fit because NeatMind is already HTML/CSS/JavaScript-focused, and an existing user-owned untracked Hyperframes draft is present in `demo-video/`. Do not modify or reuse that draft until the creator explicitly approves reuse.

### Future-only implementation architecture

- One 150-second 1920 × 1080, 30 FPS composition: **4,500 frames**.
- Eleven scene components matching the storyboard.
- Shared browser frame, caption rail, evidence badge, data-flow diagram, Codex timeline, and end-card components.
- Separate asset groups for screen captures, sanitized development proof, music/SFX, and captions.
- Shared motion utilities for controlled zooms, cursor taps, text reveals, and flow-line timing.
- H.264/AAC MP4 output; absolute maximum remains 5,400 frames / 180 seconds.
- After approval: capture current UI, assemble scenes, validate timing/contrast/captions, review final preview, then render.

## 12. Asset and Compliance Checklist

### Capture after approval

- Dashboard-to-math-demo route.
- Evidence status banner.
- Subtract 3 concept and exact source quote.
- One-question quiz and Journey update.
- Permission banner.
- Optional short PDF/video/Focus/Library montage.
- Sanitized Codex defect and plan cards.
- Fresh current test result if it will be shown.
- App header/wordmark and Journey end-card background.

### Existing candidate assets

- `assets/page-actions/` illustrations.
- `assets/journey/` Journey artwork.
- Existing untracked `demo-video/` UI screenshots only if creator approves their reuse.

### Never show

- `.env`, API keys, tokens, backend logs, local paths, private attachments, raw source data beyond safe demo content, or historical test totals.

### Submission checks

- YouTube video is publicly viewable and under three minutes.
- Audio is present and understandable.
- Repository link works while signed out.
- Judge path instructions match the demo.
- Primary `/feedback` session ID is entered exactly.
- Rights are confirmed for all music, images, trademarks, and screenshots.

## 13. Timing Audit

| Measure | Planned result |
| --- | ---: |
| Spoken narration | 312 words |
| Estimated speaking rate | Approximately 145 WPM |
| Narration duration | Approximately 129 seconds |
| Visual-only pauses and holds | Approximately 21 seconds |
| Complete video duration | 150 seconds |
| Maximum allowed duration | 180 seconds |

## 14. Open Questions Before Production

1. Was `AI_PROVIDER=openai` with `gpt-5.6-sol` actually used in development or the intended demo?
2. Is `gpt-5.6-sol` the exact public model label to mention, if runtime use is confirmed?
3. May a cropped/sanitized primary Codex transcript and session ID appear in the video?
4. May existing untracked `demo-video/` assets be reused, or should all captures be retaken?
5. What creator name/title should appear in the final card?
6. What public judge-access URL will be submitted?

---

**PLANNING COMPLETE — WAITING FOR SCRIPT APPROVAL**
