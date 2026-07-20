---
workflow: general-video
flow: companion
storyboard: yes
message: "NeatMind turns learner-selected study material into evidence-linked lessons and active recall, then builds a goal-aware plan for what to study next"
destination: youtube
aspect: 1920x1080
language: en
audience: "OpenAI Build Week judges"
length: 150s
angle: product-demo
---

## Intent

A 150-second demo video for the NeatMind Chrome extension (OpenAI Build Week / Education
track). Product-first: real UI appears within the first five seconds, the learner's problem
is narrated over live product rather than an abstract cold open.

**Visual direction (superseding the earlier dark-leaning treatment):** a bright, warm, scholarly,
cinematic world is now the PRIMARY register, not just "avoid pure black." Dark surfaces may
appear briefly for contrast but must never be the default state. This is a deliberate rebuild of
the visual and motion language, not a palette substitution — see `## Customizations` for the full
color/motion/architecture spec. The claims, evidence matrix, and narration content still come
from `../script_of_video/BUILD_WEEK_DEMO_VIDEO_PLAN.md` (do not invent or soften a claim beyond
what it authorizes) — but the *visual and scene structure* below now supersedes that document's
Section 8 storyboard. `STORYBOARD.md` in this project is the current source of truth for scene
structure; the parent plan doc remains the source of truth for claims/evidence only.

**Scene-structure reconciliation:** the creator's new scene brief (bright desk → NeatMind
transformation → evidence-linked lesson → validation flow → quiz→Journey → Learning Forest →
capability montage → closing) intentionally did not include two things the parent plan already
locked in: the Study Goal/Today's Plan segment (State-A feature) and the Codex/GPT-5.6
collaboration explanation (a hackathon requirement: video audio must explain Codex/GPT-5.6 use).
Per the creator's explicit decision, both are folded back in as their own compact beats rather
than dropped. A third beat — a short "trust" beat (site access only when chosen · local storage ·
protected backend) — was added by inference, not requested verbatim: the new scene brief's
"Validation flow" beat covers *answer-grounding* correctness, which is different content from the
locked plan's site-access/storage/backend *privacy* story, so it doesn't automatically carry that
content forward. Flagged to the creator; revise if that reads as redundant instead of additive.

## Assets

- `../neatmind-demo-reel/assets/ui/*.png` — real screenshots from a prior build of this same
  extension (dashboard, create, paste, note_evidence, concept_evidence, report, quiz,
  quiz_selected, result, journey, focus, library, plus hero crops). Reuse whichever are still
  visually current; recapture any that have drifted from the live UI.
- Missing capture: the Dashboard **Study Goal** form, the **Today's Plan** next-action step,
  and the **Until target** stat (Study Goal beat, `STORYBOARD.md`) have no existing screenshot. Source: `popup.html`
  `#dashboardGoalForm` and `popup.js` `renderDashboardStats` / `today-plan` rendering, in the
  parent repo (`C:\Users\Dell\Documents\google_plugin\.claude\worktrees\demo-plan-revision`),
  captured via `npm run preview`.

## Customizations

### Palette (declare up front, per house-style)

- **Background:** warm paper surfaces (light, daylight gradients) as the default state; softly
  frosted glass for persistent chrome/panels; subtle paper grain texture.
- **Accents:** evidence teal, growth green, study blue, warm amber, restrained coral — one hue
  leads per scene, the others support; don't invent extra colors per-element.
- **Dark surfaces** (the Journey near-black gradient `#070909`/`#020303`/`#050606` + ember tint,
  or vintage-planner leather browns `#26170f`/`#342015`) may appear **briefly, for contrast only**
  — never as a scene's default background, and **never pure black (`#000000`)** even then.
- Botanical shapes and environmental depth (for the Learning Forest and as ambient background
  texture elsewhere) render in this same warm-daylight register, not a separate dark-forest look.

### Motion system

- Replace repeated fade-and-rise with a wider vocabulary: camera drift, depth parallax, object
  rotation, match cuts, clip-path reveals, SVG line drawing, staggered text, path-based motion,
  transformation between related UI objects, subtle environmental loops, fore/background depth,
  rhythmic montage cuts.
- Use GSAP timeline labels (`intro`, `hero`, `proof`, `transition`, `exit`) and relative position
  parameters, not only absolute numeric times.
- Shared motion helpers to build once and reuse across scenes: hero entrance, evidence-line
  drawing, cursor click, soft highlight sweep, scene exit, camera push, floating environmental
  motion, staggered assembly.

### Architecture

- Extract repeated CSS into a shared stylesheet; shared color/typography/spacing/radius/shadow/
  motion design tokens declared once.
- Reusable components: cursor, browser-frame, caption, evidence-line, chapter-tree, information
  panel.
- Transition compositions or controlled scene overlap in the root timeline; keep the root
  timeline thin (composition-patterns.md's modular-orchestrator pattern).
- Fully deterministic and seekable; no manual media playback inside scripts; preserve
  HyperFrames-managed sub-composition nesting.

### Content / claim guardrails (unchanged)

- Mandatory per-scene QA: no caption rail, diagram overlay, or graphic card may visually block
  or occlude required real UI content (evidence banner, quiz controls, Journey card, Dashboard
  goal form / Today's Plan step, permission banner) in any scene that frames captured UI.
- Captions: compact, high-contrast sentence rail only — never a large reserved caption band.
- Codex/GPT-5.6 collaboration beat is built as designed motion-graphic beats (human defect →
  Codex trace → test/grounding → human review), re-skinned in the new light/warm visual language
  — not raw footage. The raw ChatGPT/Codex screen recordings in `../video_create_with_codex/` are
  explicitly excluded — unreviewed, likely contain account/tab details never cleared for use.
  **Do not place the full Codex `/feedback` session ID in small text on the final frame** —
  detailed submission identifiers stay in the README and Devpost entry only.
- Silent end-card hold ≥3 seconds; ≥2 seconds of visual-only breathing room after each key
  product action (evidence banner appears, quiz submits, plan appears).
- Do not alter or falsify the real NeatMind screenshots.

### Acceptance criteria (the run is not "Done" until all hold)

1. No more than two consecutive scenes share the same dominant background color.
2. The reel does not use dark brown/near-black as its default background anywhere.
3. Every scene has one clearly identifiable hero motion.
4. At least three transitions visually carry an object from one scene into the next (match cuts).
5. The Learning Forest scene visibly contains trees at distinct growth stages.
6. The real NeatMind product stays readable in every UI-framing scene.
7. Captions never cover required interface content (ties to the per-scene occlusion QA above).
8. Motion stays smooth at 30 FPS.
9. Every claim shown is supported by the repository (evidence matrix in the parent plan doc).
10. `npx hyperframes lint` and the final render both complete successfully.

## Notes

- Narration: the user will supply their own recorded voice-over file; no TTS narration is
  generated for this build. Scenes are built/timed to the plan's audited per-scene durations
  (`BUILD_WEEK_DEMO_VIDEO_PLAN.md` Section 11) against a silent/scratch track for now; final
  timing will be reconciled once the real VO file arrives — real voice duration overrides the
  estimate per scene at that point.
- Not signed in to HeyGen at project start (`npx hyperframes auth status`); voice/music would
  fall back to local offline engines (Kokoro, MusicGen), whose Python deps are not yet
  installed. Not a blocker yet — narration is user-supplied and music/BGM resolution is
  deferred to the audio-assembly stage.
- An older sibling project, `../neatmind-demo-reel/`, was built for a different, superseded
  82s/1280x720/8-scene script and is left untouched as historical reference — do not read it as
  a source of current claims or timing, only as a source of reusable screenshot assets.
- The evidence citations and exact claim-guardrail wording live in the parent
  `BUILD_WEEK_DEMO_VIDEO_PLAN.md`; do not invent or soften claims beyond what that document
  authorizes, even though the scene structure itself now lives in this project's `STORYBOARD.md`.
