---
format: 1920x1080
duration: 150s
message: "NeatMind turns learner-selected study material into evidence-linked lessons and active recall, then builds a goal-aware plan for what to study next"
arc: Scattered sources → NeatMind transformation → Evidence-linked lesson → Validation flow → Trust → Quiz to Journey → Learning Forest → Study Goal & Today's Plan → Capability montage → Codex & GPT-5.6 → Closing
audience: "OpenAI Build Week judges"
mode: collaborative
---

## Frame 1 — Scattered sources

- status: outline
- src: compositions/s1.html
- duration: 10s
- transition_in: cut
- scene: Bright infinite study desk. Floating browser tabs, PDFs, videos, notes at different depths; camera already drifting when the scene opens. A disconnected coral thread weaves between the cards.
- voiceover: (visual-only hook beat; VO for this beat lives in the parent script's opening lines)

World: a sunlit, endless desk — not a dark void. Depth layers: BG soft-blurred distant cards, MG
mid-depth cards catching daylight, FG a few sharp cards plus the coral thread. Blueprint:
`spatial-pan-stations` (Adapt — the tabs/PDF/video/note cards are the "stations," camera pans
across them, landing on the tangled, disconnected coral thread). Compose with `viewport-change`
(camera drift), `sine-wave-loop`/`ambient-glow-bloom` (floating idle motion on each card), organic
per-card rotation (not grid-aligned). Hero motion: the camera drift itself, already in motion at
t=0 — never a static-then-move open.

## Frame 2 — NeatMind transformation

- status: outline
- src: compositions/s2.html
- duration: 9s
- transition_in: cut (object continuity, not a stock crossfade)
- scene: The coral thread from Frame 1 transforms into a green evidence path as it draws itself; the path constructs "Source → Evidence → Practice → Journey" in sequence, then its growth resolves into the NeatMind wordmark.
- voiceover: (visual-only; wordmark lands as the spoken product-explanation line completes)

**Object-carry transition #1**: the coral thread is the same DOM/visual object from Frame 1,
color-morphing coral → teal/green as it draws — not a fade-out/fade-in pair. Compose:
`svg-path-draw` for the self-drawing path (color transitions along the stroke), `waterfall-entry`
for the four stage words arriving in sequence along the path, then extend the same drawn line into
the wordmark strokes (no standard title fade — the path IS the title reveal). Hero motion: the
path drawing itself.

## Frame 3 — Evidence-linked lesson (real UI)

- status: outline
- src: compositions/s3.html
- duration: 16s
- transition_in: crossfade
- scene: Real NeatMind UI on a bright editorial stage (frosted-glass browser frame, warm paper
  surround). Camera attention animates: "Evidence checked" banner → selected concept → exact
  supporting sentence, via a drawn evidence-connection line and a controlled zoom.
- voiceover: "Here's the zero-setup demo... it names its source and marks each claim evidence
  checked... the explanation sits beside the exact supporting sentence."

Blueprint: `cursor-ui-demo` (Adapt — real captured UI, cursor-led attention). Compose:
`svg-path-draw` (the drawn evidence-connection line, banner → concept → sentence),
`depth-of-field-blur` (rack-focus push from banner to concept to quote). Evidence:
`popup.js:3480` ("Evidence checked"), `popup.js:7623`, `popup.js:7753`/`7801` (report control).
Occlusion QA: the drawn connection line and camera framing must never cover the report-claim
control or the source quote itself.

## Frame 4 — Validation flow

- status: outline
- src: compositions/s4.html
- duration: 13s
- transition_in: crossfade
- scene: A bright, transparent inspection tunnel (light frosted glass, not a dark tube) that an
  answer visibly travels through: source matching → meaning validation → evidence binding.
  Grounded output continues and receives a green receipt stamp; unsupported output is visibly
  stopped/repaired before it would reach the display.
- voiceover: (folds the grounding-check idea into the demo narration; no separate "gate" jargon
  spoken aloud — keep the spoken language at "checked against its source before it's shown")

Compose: `viewport-change`/`coordinate-target-zoom` (the answer element travels through the
tunnel, camera follows), `svg-icon-enrichment` (small checkpoint icons pulse as the answer passes
each stage), a spring-stamp motion (`press-release-spring` family) for the green receipt. Claim
guardrail: do not claim or imply a percentage/absolute accuracy — the verified behavior is
"missing, malformed, or unsupported verdicts fail closed" (README), not a guarantee of
correctness. Evidence: `server.js:689`/`747` (`verifyQuizAnswersSemantically`).

## Frame 5 — Trust, in three ideas *(folded in — flagged for review)*

- status: outline
- src: compositions/s5.html
- duration: 8s
- transition_in: crossfade
- scene: Compact beat — a small permission-banner mock (site access only when the learner
  chooses), a local-storage icon (a simple folder/drive motif, not a cloud), and a protected-
  backend badge (a checkmark/gate motif — explicitly not a padlock, to avoid implying
  encryption). Three ideas arrive in quiet sequence, each with one short label only.
- voiceover: "Site access only when you choose. Everything stays on your device. AI requests are
  checked and limited before they run."

**This beat was not in the creator's new scene brief** — the brief's Frame 4 ("Validation flow")
covers answer-grounding correctness, which is different content from this site-access/storage/
backend privacy story that the parent plan had locked as its own beat. Added here so the
hackathon-facing trust story isn't silently lost; revise or cut if it reads as redundant next to
Frame 4 once both are on the board. Compose: `waterfall-entry` (three icons/labels in sequence),
`ambient-glow-bloom` (settle glow behind each). Evidence: `README.md:426`, `background.js:307`.
Guardrail: no lock/encryption iconography, no compliance claims.

## Frame 6 — Quiz to Journey (real UI)

- status: outline
- src: compositions/s6.html
- duration: 12s
- transition_in: crossfade
- scene: Real quiz interaction. The click ripple from answer selection transforms into the
  Journey progress indicator, visually connecting the submitted response to the saved chapter and
  its next study action.
- voiceover: "Answering records real progress — saved to your Journey."

Blueprint: `cursor-ui-demo` (Adapt, real UI) composed with `cursor-click-ripple` (the selection
click) and **`card-morph-anchor` — object-carry transition #2**: the ripple itself morphs into
the Journey progress element at the cut, not a plain crossfade. Evidence: `server.js:747`,
`background.js:307`, `journey-utils.js:1360` (`quiz_submitted` event).

## Frame 7 — Learning Forest

- status: outline
- src: compositions/s7.html
- duration: 8s
- transition_in: crossfade
- scene: An actual animated Learning Forest — daylight-through-canopy, warm register (a
  stylized illustration for this film, not a literal screenshot of the product's own dark Journey
  view, so the light-first rule fully applies here). Shows: one seed/new chapter, one seedling,
  one mature tree; subtle leaf/lighting ambient movement; a chapter receiving progress and visibly
  growing a stage; a cursor clicking a tree; a compact panel showing stage, note count, practice,
  mastery, and next action.
- voiceover: "Its scheduler brings difficult concepts back sooner than mastered ones."

Keep tight — ~8s exactly, don't overload. Compose: staggered scale+sway growth for
seed→seedling→tree, `sine-wave-loop` (ambient leaf/light drift), `cursor-click-ripple` (the
click), `spring-pop-entrance` (the info panel). Evidence: `journey-utils.js` growth-stage
thresholds (0 / 1–2 / 3–5 / 6+ saved units), `journey-utils.js:1699` `getChapterStatus`.
Acceptance criterion #5 (trees at distinct growth stages) is scoped to this frame.

## Frame 8 — Study Goal & Today's Plan *(folded in per creator decision)*

- status: outline
- src: compositions/s8.html
- duration: 15s
- transition_in: crossfade
- scene: Real Dashboard UI. The Study Goal form fills in (focus chapters, target date, daily
  minutes) by cursor; the "Until target" stat resolves; the Today's Plan top step highlights with
  its Go control.
- voiceover: "I turn that into a goal — focus chapters, a target date, a daily study time.
  NeatMind counts down the days left and builds today's plan: a recovery quiz on my weakest
  concept, and the next step to take."

Blueprint: `cursor-ui-demo` (Adapt, real form fill) composed with `counting-dynamic-scale`/
`stat-bars-and-fills` (Until-target count, daily-minutes ring) and `spring-pop-entrance` (the
highlighted plan step). **New capture required** — no existing screenshot; source:
`popup.html:95` `#dashboardGoalForm`, `journey-utils.js:1862` `buildStudyPlan`, `popup.js:10252`
Today's Plan, `popup.js:10038` "Until target". **Occlusion QA for this frame specifically:** the
highlighted plan-step card and any count-up label must never cover the focus-chapter checkboxes
or the Go control underneath.

## Frame 9 — Capability montage

- status: outline
- src: compositions/s9.html
- duration: 14s
- transition_in: crossfade
- scene: Four distinct micro-worlds — Video, PDF, Focus, Export — each with its own dominant
  accent and motion treatment inside one coherent design system, cut rhythmically (or carouseled).
- voiceover: (visual-only breadth beat; brief on-screen labels only, no narrated list)

Four accents, four motions, one shared frame/typography system:
- **Video** — study blue; `coordinate-target-zoom` on a timestamp jump.
- **PDF** — warm amber; `card-morph-anchor` page-turn-like morph.
- **Focus** — restrained coral; `counting-dynamic-scale` timer count.
- **Export** — growth green; `svg-path-draw` document-outline draw.

Rhythmic percussive cuts (`kinetic-beat-slam` family) between the four, not four identical cards.
Evidence: `video-utils.js`, `document-reader-utils.js`, `focus-utils.js`, `export.js`.

## Frame 10 — Codex & GPT-5.6 collaboration *(folded in per creator decision, re-skinned)*

- status: outline
- src: compositions/s10.html
- duration: 17s
- transition_in: crossfade
- scene: Human defect card → Codex trace card (UI → prompt → parser → validation) → test/
  grounding card → human review card, presented as labeled stations along a light, warm drawn
  path (deliberately echoing Frame 2's path motif — the "trace" travels the same kind of line as
  the evidence path, tying the build story to the product story). Match-cuts back into a glimpse
  of the live demo at the end.
- voiceover: "I led the product — the problem and the grounding standard. When quiz generation
  returned too few questions and some off-source content, I asked Codex, using GPT-5.6, to trace
  the whole path — UI, prompts, and validation. It proposed focused fixes; I reviewed them, and
  that grounding is what you just saw. GPT-5.6 worked through Codex in development, not as the
  runtime model."

Blueprint: `spatial-pan-stations` (Adapt — same blueprint family as Frame 1, an intentional visual
rhyme between "scattered sources" and "collaboration stations"). **Object-carry transition #3**:
match cut from the last station into the live demo via `scale-swap-transition`. Re-skinned in the
new light/warm palette — not the old dark sanitized-card motif. Wording: "Codex using GPT-5.6"
(never "Codex GPT-5.6" as one name); human identified the defect and reviewed the outcome; Codex
traced and proposed, did not commit or design the project. **Do not place the full `/feedback`
session ID in small text on this frame** — detailed identifiers stay in the README/Devpost entry
only. Evidence: `feedback/2026-07-15-fix-quiz-generation-grounding.md`,
`hackathon/CODEX_COLLABORATION.md:5`.

## Frame 11 — Closing

- status: outline
- src: compositions/s11.html
- duration: 10s
- transition_in: crossfade
- scene: Camera pulls back smoothly to the Learning Forest (reprising Frame 7); the green
  evidence path (carried from Frames 2 and 6) travels through the forest and resolves beneath the
  NeatMind wordmark. Final three-line message displays, then a silent hold ≥3s before fade.
- voiceover: "Evidence you can inspect. Practice you can keep. A journey that grows with you."

Blueprint: `titlecard-reveal` (exactly one restrained move, then a still hold — low motion is the
payload) combined with the carried evidence-path object landing here as its final payoff — the
throughline from Frame 2 resolves in this frame. Background: light/warm daylight-forest register;
dark tones, if used at all for edge vignetting/depth, stay non-dominant and never pure black.
**No full Codex session ID on this frame** (same guardrail as Frame 10). Narration stops before
the final held frame — do not speak over the last ≥3 seconds.

## Production notes (acceptance criteria carried from BRIEF.md)

1. No more than two consecutive frames share the same dominant background color — check across
   Frames 1–11 once builds land, not just per-frame in isolation.
2. Dark brown/near-black is never the *default* background of any frame (Frames 5's brief dark
   contrast moments, if any, must stay non-dominant).
3. Every frame above names one hero motion — don't let a frame ship without one.
4. Three object-carry transitions are named explicitly: Frame 1→2 (coral thread), Frame 6
   (ripple→Journey card), Frame 10→closing (match cut to demo/Frame 11's carried path). Confirm at
   least these three land as true object-continuity, not disguised crossfades.
5–10. See `BRIEF.md` → `## Customizations` → Acceptance criteria for the full list (Forest growth
stages, UI readability, caption non-occlusion, 30 FPS smoothness, claim-evidence match, lint/render
pass).
