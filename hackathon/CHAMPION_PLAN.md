# Champion Plan — OpenAI Build Week (Education track)

> Written 2026-07-18. Submission deadline: **2026-07-21 17:00 PDT** (2026-07-22 08:00 MYT) — about 3 days remaining.
> This plan maps the properties of winning Devpost/GitHub hackathon projects onto Exam-Cram, organized by the three judging criteria in play: **Design**, **Potential Impact**, and **Quality of the Idea**.

## What champion projects have in common

From Devpost's own judging guidance and judge interviews, winning submissions consistently share these properties:

1. **They fulfill every basic requirement first.** Judges report that a surprising share of submissions fail on requirements alone (missing video, inaccessible repo, wrong track). Requirements are pass/fail before quality is even scored.
2. **The demo video opens with the elevator pitch in the first few seconds** and shows the product in use — a narrated screencast, not slides.
3. **They visibly address the published judging criteria**, balancing all of them instead of maxing one.
4. **A judge can run the project in minutes.** Low-friction setup and a scripted happy path.
5. **The README makes a credible, specific problem case** with a defined audience, and shows care and enthusiasm (polish signals effort).

Exam-Cram now has a clean-machine judge path (`npm ci`, `npm run preview`, zero API key), a deterministic 60-second math demo, lexical-plus-semantic quiz grounding, adaptive Journey review scheduling, and documented Codex collaboration. The remaining submission work is external publication logistics: video, Devpost URL, and usage-rights confirmation.

## Criterion 1 — Design (complete, coherent product experience)

**Judge question:** working/runnable project with a complete product experience, not a proof of concept?

**Current strengths to surface:** the full loop (chapter → source → evidence-linked note → quiz → Journey) works end to end; a complete automated regression suite; hardened local backend; zero-setup judge route; evidence-status indicator and report-unsupported-claim control.

**Actions:**
- **A1. Clean-machine path verified.** A fresh Windows clone completed `npm ci`, preview, and the demo in about 85 seconds. Judge instructions now follow the actual navigation: Dashboard → Create → Paste Notes → demo.
- **A2. Record the demo video (blocking requirement).** Follow the existing storyboard in `hackathon/DEVPOST_SUBMISSION.md`: elevator pitch in the first 10 seconds → Evidence checked badge → quoted source sentence → one-question check → Journey completion. Under 3 minutes, with audio, screencast style, uploaded public on YouTube.
- **A3. Show completeness in the video, fast.** After the core loop, spend ~20 seconds panning the surrounding product (cheat sheet, focus mode, export, video sources) to prove this is a product, not a demo script. Don't demo them fully — visible breadth is the point.
- **A4. State the quality bar out loud.** One line in the video and Devpost description: "A hardened loopback backend, lexical-plus-semantic answer checks, and a complete automated regression suite." Design credibility is also engineering credibility.

## Criterion 2 — Potential Impact (credible, specific case for a real audience)

**Judge question:** does it solve a real problem for a real audience, and does the demo actually address that problem?

**Actions:**
- **B1. Lead with the specific problem, not the category.** Frame: students study from scattered pages, PDFs, and videos; generic AI summaries are unverifiable, so students either re-verify everything or trust silently wrong material. Exam-Cram's evidence-linked loop is the direct answer: evidence-linked artifacts expose their supporting source excerpt, and backend quiz answers must pass lexical-plus-semantic checks before acceptance.
- **B2. Make the audience concrete.** "Students in any subject" is broad; anchor it with one vivid persona in the description and video (e.g., a student revising linear equations from their own saved source) and then state it generalizes because it is source-led, not content-library-led.
- **B3. Demonstrate the problem→solution link on screen.** In the video, show a grounding repair or the "Report unsupported claim" control and say why it exists: this is the anti-hallucination mechanism judges can *see* working, which is what "the solution actually addresses the problem based on what's demonstrated" asks for.
- **B4. Use the pilot-metrics plan as forward credibility.** The existing 5–10 student pilot design (time to first completed loop, citation trust rating, 7-day return) shows impact is measurable, not aspirational. Put it as the closing line of the Devpost description.

## Criterion 3 — Quality of the Idea (creative, novel, different from existing concepts)

**Judge question:** how novel is it versus existing concepts?

**Actions:**
- **C1. Name the differentiator explicitly: evidence-grounded study, not AI summarization.** Position against the obvious comparables (ChatGPT summaries, Quizlet, generic "chat with PDF" tools): those generate *plausible* study material; Exam-Cram keeps evidence-linked concepts and cheat-sheet rows tied to saved sources, while backend quiz answers must pass lexical and provider semantic verification before they are accepted.
- **C2. Highlight the evidence-to-mastery loop as the novel unit.** The idea is not any single feature but the closed loop: source → validated visual note → source-checked quiz → recorded mastery → visible next step. Use the existing mermaid architecture diagram in the Devpost description.
- **C3. Include the grounding-repair log as proof of novelty.** The sanitized `backend-error.log` entries ("AI visual node example is not grounded in the saved source → repaired from its cited source phrase") are rare, concrete evidence that the validation layer is real. A short screenshot or quote in the description differentiates from projects that merely claim grounding.

## Requirement gaps (pass/fail — do these first)

From `feedback/HACKATHON_SUBMISSION_EVIDENCE.md`, three items are still pending:

| Item | Action | Owner deadline |
| --- | --- | --- |
| Public YouTube demo video (<3 min, audio) | Record per A2/A3/B3 | Jul 19–20 |
| Judge-accessible repository | Verified public while signed out: [liawzishen/chrome-extension](https://github.com/liawzishen/chrome-extension), with MIT `LICENSE` | Complete |
| Third-party usage rights | Confirm assets/music/API terms used in the video and repo | Jul 20 |
| Devpost form | Track: **Education**; primary session ID `019f65fd-eb83-7cf1-9ec5-1eaf083f4b5f`; description assembled from B1/B4/C1/C2 | Jul 20, buffer day Jul 21 |

## Suggested 3-day schedule

- **Jul 19:** A1 clean-machine run; repo public + security audit; freeze code (bug fixes only).
- **Jul 20:** Record and edit video (A2/A3/B3); publish to YouTube; draft the Devpost description from this plan; confirm usage rights.
- **Jul 21 (buffer):** Submit early in the day MYT; verify the video plays publicly, the repo link works logged-out, and the session ID is entered; re-read the submission as a judge would, once, before the 17:00 PDT deadline.

## Sources

- [Understanding hackathon submission and judging criteria — Devpost](https://info.devpost.com/blog/understanding-hackathon-submission-and-judging-criteria)
- [How to win a hackathon: advice from 5 seasoned judges — Devpost](https://info.devpost.com/blog/hackathon-judging-tips)
- [6 tips for making a winning hackathon demo video — Devpost](https://info.devpost.com/blog/6-tips-for-making-a-hackathon-demo-video)
- [Video-making best practices — Devpost Help Center](https://help.devpost.com/article/84-video-making-best-practices)
