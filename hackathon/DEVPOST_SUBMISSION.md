# Exam-Cram Devpost submission handoff

## Five-line project summary

Exam-Cram turns one chosen study source into an evidence-linked visual note, practice, and a clear next step.
Its zero-setup mathematics demo takes a judge from a curated source to a verified visual note in seconds.
Every visual concept exposes its supporting excerpt and a visible evidence-status indicator.
One source-checked quiz answer records demonstrated learning in a stable Journey chapter.
The product is deliberately focused on trustworthy study practice, not a broad classroom platform.

## Judge quick start

1. Run `npm ci` once, then `npm run preview`.
2. Open `http://127.0.0.1:8788`; no API key, extension install, or account is needed for this route.
3. Choose **Notes**, then **Try 60-sec math demo**.
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

For a 5-10 student pilot, record time to first completed study loop, citation trust rating, quiz completion rate, and return use after seven days. Pair each trust-rating response with the optional local unsupported-claim report count; do not retain full source text in feedback logs.
