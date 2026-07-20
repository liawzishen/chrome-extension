# Handoff — NeatMind demo video build (for Codex / next agent)

> **PARKED.** Codex independently built a further-along Remotion pipeline
> (`../neatmind-remotion/`, main checkout) with an actual rendered `out/NeatMind_Build_Week_Demo.mp4`.
> That path was adopted as primary. This project is kept as a reviewed, independent reference —
> not deleted, not being actively built further right now. See `../RECONCILIATION_NOTES.md` for
> the full reconciliation and the fix list against the Remotion source. If Remotion is later
> abandoned, this project's `STORYBOARD.md`/`BRIEF.md` are ready to resume from.

## What this project is

A fresh HyperFrames video project for the NeatMind OpenAI Build Week demo. It replaces the
older, superseded `../neatmind-demo-reel/` project (82s/1280x720/8-scene, built for a different,
older script) with an 11-scene build matching the **locked** script/storyboard at
`../script_of_video/BUILD_WEEK_DEMO_VIDEO_PLAN.md` — treat that document as the source of truth
for narration, timing, claims, and evidence citations. Don't re-derive or soften anything in it.

## Where things stand right now

- `hyperframes init` scaffolded this project; `BRIEF.md` and `STORYBOARD.md` are written.
- Preview server was running at **http://localhost:3002** but has since been stopped (background
  process lifecycle). **Restart it before opening the board:** `npm run dev` (run in background —
  it's long-running, never foreground) from this project directory, then confirm it's serving
  before handing out the URL again. Storyboard board once serving:
  `http://localhost:3002/?view=storyboard#project/neatmind-demo-reel-v2` (port may differ on
  restart — check the CLI's own printed `Studio` line rather than assuming 3002).
- The **plan (text layer)** was presented to the user for review in chat as a frame table (echo
  line + 11 rows, each with its cited blueprint/rule). **No sketches and no real composition HTML
  have been built yet.**
- **Still waiting on the user for two answers** before any further work:
  1. Approve the plan as-is, or name frames to change.
  2. Sketches-first (wireframe pass on the board before building) — recommended — or skip
     straight to build.

  Do not build scenes, write composition HTML, or run `npm run check`/render until both are
  answered. If you're picking this up cold, ask again rather than assuming.

## Hard constraints (apply to every scene, no exceptions)

- **No pure black (`#000000`) anywhere** — any invented background, transition bed, or end-card
  must use the Journey near-black gradient (`#070909` → `#020303` → `#050606`, ember radial tint
  `rgba(130, 68, 24, 0.08)`, from `journey.css`) or the vintage-planner leather browns
  (`#26170f` / `#342015`, from `vintage-planner.css`). This is grounded in the product's own real
  dark UI, not an invented brand rule — don't relax it.
- **Occlusion QA per scene:** no caption rail, diagram overlay, or graphic card may visually block
  required real UI content (evidence banner, quiz controls, Journey card, Dashboard goal
  form/Today's Plan step, permission banner). Frame 7 (Study Goal) needs this checked explicitly —
  the highlighted plan-step card and any stat label must never cover the focus-chapter checkboxes
  or the Go control.
- **Captions:** compact, high-contrast sentence rail only — never a large reserved band.
- **Breathing room:** ≥2s visual-only after each key product action (banner appears, quiz submits,
  plan appears); the closing hold is ≥3s silent/music-only before the final frame.
- **No raw Codex/ChatGPT footage.** The Codex/GPT-5.6 collaboration beat (Frame 9) is designed
  text/graphic cards (defect → trace → test → review), not screen recordings. The raw mp4s in
  `../video_create_with_codex/` are explicitly excluded — unreviewed, likely contain account/tab
  details never cleared for use. Do not reference or embed them.

## Assets

- Reusable real screenshots (dashboard, create, paste, note_evidence, concept_evidence, report,
  quiz, quiz_selected, result, journey, focus, library, plus hero crops) live at
  `../neatmind-demo-reel/assets/ui/*.png` — from a prior build of the same extension UI. Copy in
  whichever are still visually current; recapture any that have drifted.
- **Not yet captured:** the Dashboard **Study Goal** form, the **Today's Plan** next-action step,
  and the **Until target** stat (Frame 7 needs these). Source in the parent repo
  (`C:\Users\Dell\Documents\google_plugin\.claude\worktrees\demo-plan-revision`): `popup.html`
  `#dashboardGoalForm`, `popup.js` `renderDashboardStats` / today-plan rendering. Capture via
  `npm run preview` in that repo (a profile with the demo chapter + one submitted quiz already
  present reads best — see the parent plan's Section 2 production note).

## Narration / audio

- The 281-word, ~135 WPM voice-over script is locked (parent plan, Section 9). **The user will
  supply their own recorded VO file** — no TTS narration has been or should be generated for this
  build. Build/time scenes against the plan's audited per-scene durations (Section 11) with a
  silent/scratch track until the real file arrives; real voice duration overrides the estimate
  per scene once it does.
- `npx hyperframes auth status` at project start: **not signed in to HeyGen.** Voice/music would
  fall back to local offline engines (Kokoro, MusicGen), whose Python deps are not installed
  (`pip install kokoro-onnx soundfile` / `pip install transformers torch soundfile numpy`). Not a
  blocker yet — surface this again when actually resolving BGM/SFX at the audio-assembly stage,
  not before.

## Design spec

Use the existing spec — parent plan Section 10 (warm scholarly palette: espresso/parchment/
oxblood/teal/Journey blue; editorial serif headlines + system sans UI; cursor-tap/evidence-
highlight/match-cut motion) — not a shipped HyperFrames preset. `house-style.md`'s "pure #000/#fff"
warning independently agrees with the no-pure-black rule above.

## Process reminders

- `flow: companion`, `storyboard: yes` (see `BRIEF.md` frontmatter) — build this together on the
  live board, checkpoint by checkpoint; don't skip the review gates.
- Preference-backed BRIEF fields (`destination`, `aspect`, `language`, `flow`, `storyboard`) are
  already recorded via `media-use`'s `prefs.mjs`; don't re-ask for them.
- `STORYBOARD.md` is the dispatch artifact — 11 `## Frame N` blocks, `status: outline`, each with
  a declared `src:` under `compositions/frames/NN-*.html` and its blueprint/rule citation. Advance
  a frame's status (`outline` → `built` → `animated`) as work actually lands on it; don't jump
  straight to `animated`.
