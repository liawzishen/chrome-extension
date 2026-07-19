# Exam-Cram Devpost submission handoff

## Ready-to-paste Devpost description

Students preparing for an exam often switch between scattered pages, PDFs, lecture videos, and personal notes. A generic AI summary can sound useful while being hard to verify, so the learner either rechecks everything or trusts an answer they cannot trace.

Exam-Cram is built for a student such as Aina, a first-year learner revising linear equations from a class page before a quiz. She saves the source she is already using, explores a visual note whose concepts expose quoted evidence, completes source-checked practice, and sees the result in a persistent Journey chapter. The same source-led loop works for pages, PDFs, videos, and notes rather than relying on a subject-specific content library.

Trust is the product feature: lexical evidence checks run for every quiz, and backend-generated quizzes also require a separate provider-backed semantic verdict for every answer against its quoted evidence before the client accepts them. The zero-key mathematics demo is deterministic and uses curated, extractive evidence so a judge can inspect the full loop without a provider key. Weak concepts can surface opt-in external study suggestions, but that external lane is visibly labelled and kept separate from evidence-linked material until the learner explicitly saves an opened page as a chapter source.

Journey turns practice into a next action. Recovery quizzes use directed graph prerequisites first and then source-co-occurring foundations instead of blindly repeating the weak target. Its SM-2-lite scheduler derives a per-concept ease factor from the cumulative wrong-answer ratio, so difficult concepts return sooner while mastered concepts stretch out.

Built with builder-led Codex GPT-5.6 collaboration; primary Codex session ID: `019f65fd-eb83-7cf1-9ec5-1eaf083f4b5f`. The public MIT-licensed repository is [liawzishen/chrome-extension](https://github.com/liawzishen/chrome-extension).

Pilot status: no participant results are represented as collected. For a 5-10 student pilot, measure time to first completed study loop, citation-trust rating, quiz-completion rate, seven-day return use, and optional local unsupported-claim report count without retaining full source text.

## Judge quick start

1. Run `npm ci` once, then `npm run preview`.
2. Open `http://127.0.0.1:8788`; no API key, extension install, or account is needed for this route.
3. From **Dashboard**, choose **Create**, then **Paste Notes**, then **Try 60-sec math demo**.
4. Select a concept and inspect its source evidence; the banner should show **Evidence checked**.
5. Choose **Start 1-question check**, answer **x = 6**, and submit.
6. Open **Journey** to see the completed activity in **Demo - Linear Equations**.

Running the demo again upserts the same source, note, and chapter instead of leaving test data behind.

## Architecture

~~~mermaid
flowchart LR
  source["Curated Mathematics source"] --> validation["Evidence validation"]
  validation --> note["Evidence-linked visual note"]
  validation --> quiz["One source-checked quiz question"]
  note --> status["Evidence status + report control"]
  quiz --> journey["Stable Journey chapter"]
  journey --> next["Visible next study step"]
  backend["Optional hardened loopback backend"] -. "normal learner sources only" .-> validation
~~~

The demo is deterministic but uses the production source, validation, and Journey contracts; it is not a disconnected mock. See the full [system architecture](../ARCHITECTURE.md) for component ownership, data contracts, and security boundaries.

## Suggested 60-90 second demo video

1. Start on Notes and introduce the one-line promise: one source becomes trusted practice with no setup.
2. Click the math demo, show the dedicated source banner and **Evidence checked** badge.
3. Select **Subtract 3** and point out its exact quoted source sentence and the one-click **Report unsupported claim** control.
4. Start the one-question check, choose `x = 6`, and submit.
5. Open Journey and show the saved completion in the same demo chapter.

## Pilot metrics

No participant metrics have been collected in this repository. For a 5-10 student pilot, record time to first completed study loop, citation trust rating, quiz completion rate, and return use after seven days. Pair each trust-rating response with the optional local unsupported-claim report count; do not retain full source text in feedback logs.

## Submission fields still requiring entrant input

- Public demo-video URL (under three minutes, with audio).
- Public Devpost project URL after submission.
- Confirmation that any music, screenshots, and other third-party material used in the video has appropriate rights.
