# NeatMind — Demo Video Script

**Submission:** OpenAI Build Week · Education track
**Runtime target:** 2:45 (165s) — safely under the 3:00 cap
**Format:** narrated screencast of the live extension, cut against light motion-graphic explainers for the three advanced systems. 1920×1080, audio required (Devpost rule).
**Voice:** confident, plain, fast. Talk to one student, not a room.

## The one thing this video must prove

Most AI study tools generate *plausible* material you can't verify. NeatMind's differentiator is **evidence-grounded study**: every visual claim and every quiz answer stays tied to an exact source passage, and backend quiz answers must pass a lexical **and** a provider-semantic check before the app will show them. The video is built to make that single idea land, then show it closing a loop into a persistent, adaptive Journey.

Per the champion plan, the three judging criteria are **Design** (a complete, runnable product), **Potential Impact** (a real problem for a real student), and **Quality of the Idea** (novel vs. generic AI summarizers). Each beat below is tagged with the criterion it serves.

## The three advanced systems this video centers on

1. **Evidence-grounded visual notes** — concepts expose their quoted source; an "Evidence checked" badge and a one-click "Report unsupported claim" control make grounding visible. *(the main advanced part)*
2. **Dual-layer answer grounding (anti-hallucination)** — lexical evidence match + provider semantic verdict on every backend quiz answer; failures are rejected/repaired, not shown.
3. **Adaptive Learning Journey / Learning Forest** — one chapter = one tree; an SM-2-lite scheduler derives each concept's ease factor from its cumulative wrong-answer ratio, so weak concepts return sooner; recovery quizzes walk a prerequisite graph instead of blindly repeating.

Everything else (video/PDF sources, Focus blocker, Export, hardened loopback backend, full regression suite) is shown fast as breadth, not explained.

---

## 1. Timeline at a glance

| # | Beat | Time | Dur | Mode | Criterion |
|---|---|---|---|---|---|
| 1 | Hook — the trust problem | 0:00–0:14 | 14s | Motion graphic | Impact |
| 2 | Solution + one-line promise | 0:14–0:26 | 12s | Title card | Quality |
| 3 | Zero-setup entry (no API key) | 0:26–0:40 | 14s | Screencast | Design |
| 4 | **Evidence-grounded visual note** | 0:40–1:16 | 36s | Screencast | Quality / Impact |
| 5 | **Dual-layer grounding (anti-hallucination)** | 1:16–1:36 | 20s | Motion graphic | Quality |
| 6 | Source-checked quiz → mastery | 1:36–1:58 | 22s | Screencast | Impact |
| 7 | **Adaptive Learning Journey / Forest** | 1:58–2:22 | 24s | Screencast + graphic | Quality |
| 8 | Breadth + quality bar | 2:22–2:38 | 16s | Screencast montage | Design |
| 9 | Close — track, repo, CTA | 2:38–2:52 | 14s | Title card | — |

Total ≈ **2:52** with natural pauses; the narration below times to ~2:40 of speech, leaving headroom. If you need to trim, cut beat 8 first, then tighten beat 5.

---

## 2. Scene-by-scene

### Beat 1 — Hook: the trust problem (0:00–0:14) · Impact

**Visual:** Motion graphic. Three browser-tab shapes and a PDF and a video thumbnail scatter across the frame. A generic "AI summary" card fades in over them, then a red question mark stamps onto it and it dims. Keep it abstract — no real UI yet.

**On-screen captions (one phrase at a time):** *"Scattered sources."* → *"A confident AI summary."* → *"But can you trust it?"*

**Voiceover:** "Before an exam, you're studying from a dozen tabs, PDFs, and videos. An AI summary sounds helpful — but you can't tell what's real. So you either re-check everything, or you trust an answer you can't trace."

**Transition:** Hard cut on the beat.
**Music:** Low tension pad, one hit per caption.

---

### Beat 2 — Solution + one-line promise (0:14–0:26) · Quality

**Visual:** Wipe to clean background. "NeatMind" wordmark draws in; tagline types beneath.

**On-screen text:** `NeatMind` → *"Source-grounded study. Every claim keeps its receipt."*

**Voiceover:** "NeatMind is a source-grounded study companion. It turns any page, PDF, or video into an interactive visual lesson and quiz — and keeps every claim tied to the exact passage it came from."

**Transition:** Cut into the live extension.
**Music:** Shift to optimistic, driving.

---

### Beat 3 — Zero-setup entry, no API key (0:26–0:40) · Design

**Screencast (real UI):** Side panel opens on **Dashboard**. Cursor: **Create** → **Paste Notes** → **Try 60-sec math demo**. Land on the generated note titled *"Math demo: solve 2(x + 3) = 18."*

**On-screen caption:** *"No API key. No account. A judge can run the whole loop."*

**Voiceover:** "Here's the part judges will like: the whole loop runs with no API key and no setup. This 60-second math demo is fully deterministic — same evidence, same result, every time."

**Transition:** Match-cut as the note appears.

---

### Beat 4 — Evidence-grounded visual note (0:40–1:16) · Quality / Impact · MAIN ADVANCED PART

**Screencast (real UI), slow and deliberate — this is the heart of the video:**
1. On the note, hold on the source banner: **"Evidence checked — 4 of 4 visual claims match the curated source excerpt."** (0:40–0:48)
2. Show the connected mind map ("From equation to verified solution": Divide by 2, Subtract 3, Check by substitution, Keep both sides balanced). (0:48–0:56)
3. Click the **Subtract 3** concept. The panel opens: *What it means / Why it matters / Example*, then the **Source evidence** box: *"Then subtract 3 from both sides to get x = 6,"* labelled *"This exact passage comes from the curated demo source."* (0:56–1:08)
4. Move the cursor to the **Report unsupported claim** control right beneath it and pause. (1:08–1:16)

**On-screen captions:** *"Every concept exposes its quoted source."* → *"See something off? Report it in one click."*

**Voiceover:** "Open any concept and it shows its receipt: what it means, why it matters, and the exact source sentence it's grounded in — here, 'subtract 3 from both sides to get x = 6.' The cheat sheet does the same, with a citation for every row. And if a claim ever looks unsupported, one click reports it. Grounding isn't a promise here — it's something you can see and challenge."

**Transition:** Push in on the evidence box, dissolve to the motion graphic.
**Music:** Sustained, confident.

---

### Beat 5 — Dual-layer grounding / anti-hallucination (1:16–1:36) · Quality · ADVANCED

**Visual:** Motion graphic. A quiz answer card travels through two gates:
- **Gate 1 — Lexical evidence check:** the answer's words must appear in the quoted source. (green check)
- **Gate 2 — Provider semantic check:** a second model must agree the answer actually follows from that evidence. (green check)
A third card fails Gate 2, flips red, and is stamped **"rejected — not grounded"** and drops away. Optionally overlay a real line from `backend-error.log`: *"visual node not grounded in the saved source → repaired from its cited source phrase."*

**On-screen captions:** *"Lexical check + semantic check."* → *"Answers that fail grounding never reach you."*

**Voiceover:** "For AI-generated quizzes there are two gates. First, the answer's evidence must literally appear in your source. Second, a separate model has to agree the answer actually follows from that evidence. Fail either gate and the answer is rejected before it's ever shown. This is the anti-hallucination layer — and it runs on every backend answer."

**Transition:** Cut back to the live quiz.
**Music:** A tick per gate; resolve on the reject.

---

### Beat 6 — Source-checked quiz → recorded mastery (1:36–1:58) · Impact

**Screencast (real UI):** Click **Start 1-question check**. The question reads *"After dividing both sides of 2(x + 3) = 18 by 2, what value of x follows after the next stated operation?"* Select **x = 6**, click **Submit Quiz**. Toast: **"Quiz complete and saved to your Journey."**

**On-screen caption:** *"Practice is recorded — not a disposable chat."*

**Voiceover:** "Now the active-recall check — one source-grounded question. Answer x = 6, submit, and it's saved. Unlike a chat window you close and lose, your demonstrated performance persists."

**Transition:** Cut to Journey tab.

---

### Beat 7 — Adaptive Learning Journey / Forest (1:58–2:22) · Quality · ADVANCED

**Screencast (real UI) + overlay:** Open **Journey**. Gauges read **Progress 100% · Average 100%**. The **Demo – Linear Equations** chapter shows **Completed**, latest submitted score 100%, saved artifacts, "Build chapter visual note," "Summarize journey."

Overlay a small motion graphic illustrating the scheduler: three concept chips with different wrong-answer ratios get different next-review dates (weak = sooner), and a tiny prerequisite-graph arrow shows a recovery quiz routing to a foundation concept first.

**On-screen captions:** *"One chapter = one tree in your Learning Forest."* → *"Weak concepts come back sooner. Recovery follows prerequisites, not repetition."*

**Voiceover:** "Everything lands in the Journey. Each chapter is its own tree in your Learning Forest. A per-concept scheduler sets each review from how often you've missed it — weak concepts return sooner, mastered ones stretch out. And a recovery quiz walks the prerequisite graph, so it rebuilds the foundation instead of just repeating the question you failed."

**Transition:** Pull back to a fast montage.
**Music:** Peak.

---

### Beat 8 — Breadth + quality bar (2:22–2:38) · Design

**Screencast montage (2–3s each):** From Video (timestamped, caption-grounded vs AI-estimated labels) → Import Files (PDF) → Focus session blocker (15/25/50/90) → Export → the cheat sheet's evidence column.

**On-screen captions:** *"Pages, PDFs, videos, notes."* → *"Hardened loopback backend · lexical + semantic checks · full regression suite."*

**Voiceover:** "The same grounded loop works for videos with timestamped evidence, for PDFs, and for your own notes — plus a built-in focus blocker and export. Underneath: a hardened local backend, lexical-plus-semantic answer checks, and a complete automated test suite."

**Transition:** Whip to the closing card.

---

### Beat 9 — Close (2:38–2:52)

**Visual:** Logo lock-up. Tagline. Track + repo + session ID.

**On-screen text:**
`NeatMind` → *"Study you can trust — and come back to."*
`OpenAI Build Week · Education track`
`github.com/liawzishen/chrome-extension · Codex session 019f65fd-eb83-7cf1-9ec5-1eaf083f4b5f`

**Voiceover:** "NeatMind — study you can trust, and come back to. Built for the Education track with Codex. Thanks for watching."

**Transition:** Slow fade.
**Music:** Resolve and fade over 3s.

---

## 3. Full continuous voiceover (read straight through)

> Before an exam, you're studying from a dozen tabs, PDFs, and videos. An AI summary sounds helpful — but you can't tell what's real. So you either re-check everything, or you trust an answer you can't trace.
>
> NeatMind is a source-grounded study companion. It turns any page, PDF, or video into an interactive visual lesson and quiz — and keeps every claim tied to the exact passage it came from.
>
> Here's the part judges will like: the whole loop runs with no API key and no setup. This 60-second math demo is fully deterministic — same evidence, same result, every time.
>
> Open any concept and it shows its receipt: what it means, why it matters, and the exact source sentence it's grounded in — here, "subtract 3 from both sides to get x = 6." The cheat sheet does the same, with a citation for every row. And if a claim ever looks unsupported, one click reports it. Grounding isn't a promise here — it's something you can see and challenge.
>
> For AI-generated quizzes there are two gates. First, the answer's evidence must literally appear in your source. Second, a separate model has to agree the answer actually follows from that evidence. Fail either gate and the answer is rejected before it's ever shown. This is the anti-hallucination layer — and it runs on every backend answer.
>
> Now the active-recall check — one source-grounded question. Answer x = 6, submit, and it's saved. Unlike a chat window you close and lose, your demonstrated performance persists.
>
> Everything lands in the Journey. Each chapter is its own tree in your Learning Forest. A per-concept scheduler sets each review from how often you've missed it — weak concepts return sooner, mastered ones stretch out. And a recovery quiz walks the prerequisite graph, so it rebuilds the foundation instead of just repeating the question you failed.
>
> The same grounded loop works for videos with timestamped evidence, for PDFs, and for your own notes — plus a built-in focus blocker and export. Underneath: a hardened local backend, lexical-plus-semantic answer checks, and a complete automated test suite.
>
> NeatMind — study you can trust, and come back to. Built for the Education track with Codex. Thanks for watching.

*(≈360 words. At ~135 wpm that's ~2:40 of speech across the 2:52 timeline — the gap is deliberate breathing room over the screencast. If a judge's attention is the constraint, this is comfortably under the 3-minute cap with margin.)*

---

## 4. How to record it (screencast is the main video)

The champion plan is explicit: judges want a narrated screencast of the real product, not slides. So the primary video is your live capture of the extension running the deterministic demo, with the narration above. Practical notes:

- **Capture the side panel clean.** Record just the panel region (or the panel + a real study page) at 1080p; crop out the OS chrome. Scale the panel up so text is legible on a projector.
- **Rehearse the click path once** so the cursor moves deliberately: Dashboard → Create → Paste Notes → Try 60-sec math demo → click **Subtract 3** → hold on the source-evidence box and **Report unsupported claim** → **Start 1-question check** → **x = 6** → **Submit Quiz** → **Journey**.
- **Slow down on beat 4.** The evidence box is the whole pitch; give it real screen time.
- **Add the motion-graphic beats (1, 2, 5, 7-overlay, 9)** from the companion Hyperframes reel (see `neatmind-demo-reel/`) — cut them in around your screencast, or use the reel standalone as an animatic if you can't record live.
- **Music/rights:** use a track you have rights to; the Devpost form asks you to confirm this.

## 5. On-screen strings to reuse (verbatim from the live UI)

These are the exact labels captured from the running extension — matching them keeps captions honest:

- "Evidence checked — 4 of 4 visual claims match the curated source excerpt."
- "This note is from Curated Mathematics source: solving a linear equation."
- Concept **Subtract 3** → Source evidence: "Then subtract 3 from both sides to get x = 6." / "This exact passage comes from the curated demo source."
- "Report unsupported claim"
- Cheat sheet header: "Evidence / citation" · badge "Source grounded"
- Quiz: "After dividing both sides of 2(x + 3) = 18 by 2, what value of x follows after the next stated operation?" → correct option "x = 6"
- Toast: "Quiz complete and saved to your Journey."
- Journey: "Demo – Linear Equations · Completed · Latest submitted score: 100%" · gauges "Progress 100% / Average 100%"

## 6. Companion motion-graphic reel

`neatmind-demo-reel/` is a Hyperframes (HTML + CSS + GSAP) project that renders the non-screencast beats — the hook, the title cards, the dual-check anti-hallucination explainer, the adaptive-Journey/Learning-Forest explainer, and the closing — plus framed shots of the **real captured UI** so it can also play standalone. It's already rendered to `NeatMind_Demo_Reel.mp4` (**82s / 1:22, 1280×720**). See its `README.md` for `preview` / `render` commands and where to drop in your live screen recording. The reel is built to intercut with, or stand in for, your live screencast; either way the finished submission video stays under the 3-minute cap.
