# NeatMind demo reel (Hyperframes)

A code-driven motion-graphic reel for the NeatMind demo video, built with
[Hyperframes](https://hyperframes.heygen.com) (HTML + CSS + GSAP). It covers the
**non-screencast beats** of the script — the hook, title cards, the two-gate
anti-hallucination explainer, the adaptive Journey / Learning Forest explainer, the
breadth-and-quality montage, and the close — and frames **real captured screens** of the
running extension for the evidence, quiz, and Journey moments.

- **Output:** `../NeatMind_Demo_Reel.mp4` — 82s (1:22), 1280×720, 24fps (already rendered).
- **Pairs with:** `../NeatMind_Demo_Video_Script.md` (the full 2:45 narrated screencast plan).

## What's here

```
index.html        full reel — sequences s1..s8 as sub-compositions (one command renders everything)
s1..s8.html        one standalone scene each (edit/preview/render in isolation)
assets/ui/*.png    real screenshots + tight hero crops captured from the live extension preview
vendor/gsap.min.js GSAP, vendored locally so rendering needs no network
```

Scene map (start → duration):

| Scene | Beat | Advanced system |
|---|---|---|
| s1 | Hook — the trust problem | — |
| s2 | Title + promise | — |
| s3 | Evidence-grounded visual note (real UI) | **#1 grounding** |
| s4 | Two-gate anti-hallucination | **#2 lexical + semantic** |
| s5 | Source-checked quiz → recorded mastery (real UI) | — |
| s6 | Adaptive Journey / Learning Forest | **#3 SM-2-lite scheduling** |
| s7 | Breadth + quality bar | — |
| s8 | Close — track, repo, session ID | — |

## Preview and render

Requires Node.js ≥ 22 and FFmpeg (Hyperframes drives headless Chrome).

```bash
cd neatmind-demo-reel
npx hyperframes preview          # live browser preview at localhost
npx hyperframes render           # render the full reel (index.html) to renders/main.mp4
npx hyperframes render -c s4.html -o s4.mp4   # render a single scene
```

The included `NeatMind_Demo_Reel.mp4` was produced by rendering each scene and
concatenating them with FFmpeg (`ffmpeg -f concat -i list.txt -c copy`), which is a
reliable path on low-memory machines; rendering `index.html` directly produces the same reel.

## How to use it in your submission

The champion plan wants a **narrated screencast of the live extension** as the main video.
Two ways to use this reel:

1. **Intercut (recommended):** record your live screencast of the deterministic math demo
   (Dashboard → Create → Paste Notes → Try 60-sec math demo → Subtract 3 → Start 1-question
   check → x = 6 → Submit → Journey), then drop scenes s1, s2, s4, s6-overlay, and s8 around it.
2. **Standalone animatic:** use the reel as-is and record the narration from
   `../NeatMind_Demo_Video_Script.md` over it.

Add an audio track you have rights to (the Devpost form asks you to confirm this), keep the
final cut under 3:00, and upload publicly (YouTube) for the submission.

## Swapping in fresh screenshots

The screens in `assets/ui/` were captured from `npm run preview` in the extension repo. To
refresh them, re-run the preview server and re-screenshot; keep the same filenames and the
scenes pick them up automatically. Tight hero crops (`hero_*.png`) frame the evidence banner,
the concept-evidence box, the quiz, and the Journey gauges.
