# Reconciliation notes — HyperFrames vs. Codex's Remotion build

Written from `.claude/worktrees/demo-plan-revision`, which cannot write to the main checkout
(`C:\Users\Dell\Documents\google_plugin`, branch `session-forest-ux-study-time`) where Codex's
work actually lives. Everything below is a **read-only finding + fix list** — none of it has been
applied to `demo-video/neatmind-remotion/` yet.

## The decision

Two parallel video-build efforts existed:

1. **HyperFrames** (`demo-video/neatmind-demo-reel-v2/`, this worktree) — reached a reviewed
   11-frame plan (`STORYBOARD.md`) and an open storyboard-review checkpoint. No scenes built,
   no render.
2. **Remotion** (`demo-video/neatmind-remotion/`, main checkout, built by Codex) — a complete
   12-scene composition, already rendered to `out/NeatMind_Build_Week_Demo.mp4`, with real
   narration audio (`public/audio/narration.wav`) and reused UI screenshots.

**Remotion is adopted as the primary path.** HyperFrames is parked, not deleted — its plan
documents remain a valid independent reference. `demo-video/script_of_video/BUILD_WEEK_DEMO_VIDEO_PLAN.md`
(this worktree, pushed on `worktree-demo-plan-revision`) is now the reconciled, claim-checked
source of truth for narration/timing/evidence; this file is the fix list against the actual
Remotion source.

## What I could verify by reading the actual Remotion source (not just the markdown draft)

Good news first — the **markdown draft** Codex wrote (`BUILD_WEEK_DEMO_VIDEO_PLAN.md`'s
uncommitted diff in the main checkout) is **not** a 1:1 match for what's actually in
`Composition.tsx`. The real component is more conservative than the draft in several places:

- `CodexCollaboration` scene's actual on-screen text (`Composition.tsx:376-377`) reads: "Codex
  accelerated implementation, debugging, testing, and the engineering workflow while the builder
  retained product judgment and claim review." — this does **not** say "Codex GPT-5.6" as one
  name and does **not** mention "Java." It's already close to this plan's Section 6 wording.
- `AdaptivePlan` scene's actual on-screen text (`Composition.tsx:307-336`) reads: "Quiz
  performance, review history, and completed actions can support a recommendation for what to
  revisit next... NeatMind recommends what to revisit without replacing the learner's judgment."
  — this is much closer to verified behavior than the markdown draft's six-bullet list
  (difficulty/type of practice, explanation/recall/revision balance, "study mode," etc.). The
  component text doesn't claim those extra dimensions.
- Background palette (`src/index.css:18`): `radial-gradient(... rgba(112,76,51,0.62) ...)` over
  `linear-gradient(135deg, #1d1713 0%, #2e1d15 48%, #1a1612 100%)` — a warm dark-brown gradient,
  **not pure black**. Consistent with this plan's no-pure-black rule in spirit, though it appears
  to be every scene's *default* background, which is what the separate "light/warm redesign"
  brief (given to the HyperFrames project) explicitly reacted against. That brief was scoped to
  `neatmind-demo-reel-v2` by your own answer, not to Remotion — whether to extend the same
  light-first direction to the Remotion build is an open question, not something I've changed.

## What still needs a human check (I could not verify these)

- **`public/audio/narration.wav`** is an audio file — I cannot read its spoken content from here.
  It may have been recorded from the markdown draft, which *does* contain "Codex GPT-5.6" (as one
  name) and "irrelevant Java content" as the memorable defect detail — both phrasings this plan
  corrected once already (Section 6D) and had to correct *again* when reconciling (Section 8's
  "Fixes applied vs. Codex's draft"). **Listen to `narration.wav` scenes 10–11 specifically** and
  compare against Section 9's corrected script before treating the render as final. If it needs
  re-recording, only those two scenes (10–11, ~32s combined) should need it.
- **`public/proof/codex-session.png`** (referenced `Composition.tsx:381`) — a real screenshot used
  as visual proof of the Codex session. Check it doesn't expose a full `/feedback` session ID in
  readable text, local file paths, or unrelated tab/window content before it ships (same spirit as
  this plan's "never show local paths, private attachments" rule, Section 14).
- **Scene 8 (Study Goal) does not appear to exist as its own beat in `Composition.tsx`** — the
  12-scene list is Opening → Transformation → Entry → EvidenceLesson → InspectEvidence →
  PracticeJourney → LearningForest → AdaptivePlan → ResponsibleFlow → CodexCollaboration →
  Implementation → Closing. There is no scene showing the real Dashboard Study Goal form, the
  "Until target" stat, or the Today's Plan next-action step — the State-A feature this whole
  audit was built around. **This is the one substantive content gap between the actual render and
  the reconciled plan**, not just a wording fix. Adding it would mean either extending past 150s
  or trimming another scene (Section 8's reconciled timing table gives it 15s at 1:21–1:36,
  borrowed 2s from the Codex scene, if this gets added to Remotion).
- **Whether the on-screen `AdaptivePlan` text actually appears in the render as read above**, or
  whether the JSX has changed since — re-check `Composition.tsx` directly before finalizing.

## Fix list, if these are applied directly in the main checkout

| # | File / scene | Issue | Fix |
| --- | --- | --- | --- |
| 1 | `public/audio/narration.wav`, scenes 10–11 | Possible "Codex GPT-5.6" / "irrelevant Java content" in spoken narration | Listen and compare to Section 9's script; re-record only if needed |
| 2 | `public/proof/codex-session.png` | Unreviewed real screenshot | Check for session ID text, file paths, unrelated content |
| 3 | Missing Study Goal / Today's Plan scene | Drops the State-A feature this whole audit confirmed | Add a scene (real Dashboard capture) per Section 8's reconciled table, ~15s |
| 4 | `demo-video/script_of_video/BUILD_WEEK_DEMO_VIDEO_PLAN.md` (main checkout, uncommitted) | Diverges from both the original committed baseline and this worktree's reconciled version | Replace with this worktree's version (or merge the two branches) — do not leave three divergent copies uncommitted |
| 5 | Background palette, all scenes | Warm dark-brown default, not pure black, but dark-as-default | Open question (see above) — confirm whether the light/warm redesign direction should extend here too, don't assume either way |

## Handling the uncommitted state

Everything Codex built (`neatmind-remotion/`, the rendered mp4, the plan-doc rewrite) is
**uncommitted** in the main checkout. This is fragile — no git safety net. Recommend committing
it (on whatever branch is appropriate) before further work risks losing it, independent of which
fixes above get applied first.
