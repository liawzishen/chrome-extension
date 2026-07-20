# Flow & Quality Review — 2026-07-20 (discussion, no changes applied)

Scheduled review, second pass today alongside the freeze-status report
(`feedback/2026-07-20-scheduled-code-review.md`). That one covered submission
readiness; this one answers the standing prompt directly — quiz quality, note
generation quality, performance, and anything else worth a second look. No
code was touched.

**Baseline:** `npm test` → **448/448 pass** (up from 430 on 2026-07-19; the
new `study-time-utils.js` module ships with its own tests already). Given the
freeze noted in the other report, treat everything below as a **post-submission
backlog**, not a call to act tonight.

## Quiz generation

**What's working well:**
- `generateQuizArtifact` (`server.js:727`) runs a 3-tier prompt retry ladder
  (normal → strict → compact) and only gives up after all three fail — good
  resilience against malformed JSON or off-contract output.
- Every quiz question is bound to a `noteId` + `sourceFingerprint`, and
  `primaryConceptId`/`relatedConceptIds` must match the saved visual note's
  concept graph exactly. That's a real structural guarantee, not just a prompt
  request.
- The recovery quiz (`buildRecoveryComposition`, `server.js:2248`) is genuinely
  clever: it mixes directed prerequisites (graph edges), source-inferred
  prerequisites (evidence co-occurrence scoring across shared source id,
  transcript segment, PDF page, and quoted anchor), and related concepts, with
  the exact composition disclosed back in the prompt. This is above the bar
  for a hackathon submission.

**Two things worth a look after the deadline:**

1. **Still one question type.** Every path (`buildQuizOnlyPrompt`,
   `buildRecoveryQuizPrompt`, etc.) hard-codes `"type": "mcq"`. This was flagged
   on 2026-07-19 too and remains open — reasonably, since it's not
   freeze-safe. Four-choice MCQ is the safest format for auto-grading, but a
   short-answer or ordering item type would raise perceived rigor without much
   added grounding-verification complexity (the same `sourceText`/concept
   binding machinery would carry over).

2. **The answer-position pattern lives in two places with two different
   fixes.** `normalizeQuestion` (`server.js:2881-2883`) places the correct
   answer at a *deterministic* slot — `questionIndex % 4` — so question 1's
   answer always lands in slot 0, question 2's in slot 1, and so on. The
   2026-07-19 review's "fixed" verdict was based on `popup.js:8703` calling
   `shuffle(question.choices)` at render time, which is correct and does mask
   the pattern in the UI. But the deterministic order is still what's stored
   in `session.questions` and whatever consumes it directly — exports, the
   quiz JSON returned by the API, tests, any future analytics — sees the
   biased `A,B,C,D,A,B,C,D…` pattern, not the shuffled one. Two options once
   the freeze lifts: shuffle once at generation time in `normalizeQuestion`
   itself (so the stored order is already unbiased and the render-time
   shuffle becomes redundant/removable), or explicitly document that render
   is the only place safe to read choice order from. I'd lean toward the
   former — one source of truth beats "shuffle happens to be called before
   anyone looks."

3. **Minor:** `isQuestionAnswerSupported` (`server.js:2770`) — the fast
   lexical pre-check — passes if *any single* non-stopword term in the answer
   appears anywhere in the source+evidence text. That's a low bar on its own,
   but it's not the real gate: `verifyQuizAnswersSemantically`
   (`server.js:2817`) runs an LLM semantic check after every generation and
   throws (triggering a retry with a stricter prompt) on any unsupported
   answer. `backend-error.log` already shows this catching and repairing bad
   output in practice, so this is working as designed — just flagging that
   the lexical check's name ("grounded") oversells what it verifies; it's
   really a cheap prefilter, and the semantic pass is doing the real work.

## Note generation

- `generateStudyNotes` (`server.js:702`) uses the same retry-ladder pattern
  but with only 2 fallback prompts (`buildNotesPrompt`,
  `buildStrictNotesPrompt`) versus 3 for quizzes. Given notes are the
  foundation everything else (quiz, recovery quiz, cheat sheet) is bound to,
  it might be worth adding a third, maximally-compact fallback for parity —
  right now a note generation that fails twice has one fewer safety net than
  a quiz that fails twice.
- `assertVisualModelUsable` is called twice per attempt — once loosely
  (`requireScenarios: false`) right after parsing, once strictly after
  normalization. That's a sensible cheap-fail-fast-then-verify-fully pattern.

## Performance

- **Cost per quiz is at least 2 AI calls, worst case 6.** Every successful
  quiz generation pays for 1 generate + 1 semantic-verify call. Because a
  semantic-verify failure is retryable, a quiz that fails grounding on every
  attempt burns all 3 prompt tiers × (1 generate + 1 verify) = 6 sequential
  LLM round-trips before surfacing an error to the user. Individually each
  step is necessary, but there's no visible circuit breaker or "this is
  attempt 2 of 3" signal surfaced to the UI — a flaky source could mean a
  30–60s wait with no intermediate feedback. Worth surfacing progress state
  (`generating → verifying → retrying`) in the popup once there's time.
- **Response cache is small and short-lived by design** (`RESPONSE_CACHE_MAX_ENTRIES
  = 32`, `RESPONSE_CACHE_TTL_MS = 5 min`, `server.js:31-32`), keyed by a
  SHA-256 hash of the full request including `rawText`. That's the right
  shape for a demo-scale cache — cheap to compute, self-evicting, no stale
  data risk beyond 5 minutes.
- **`limitStudyText`'s sentence dedup is O(n²)** (`server.js:3965` —
  `.filter()` calling `list.findIndex()` per sentence). At the configured
  caps (22k–24k chars by default, 100k max via env) this stays in the
  low-thousands of sentences and runs in well under a second, so it's not an
  active problem — just something that would need a `Set`-based rewrite if
  `MAX_STUDY_CHARS` is ever raised meaningfully past its current ceiling.

## Flow / in-progress work

The uncommitted `study-time-utils.js` (per-chapter/per-note study-time
tracking, idle-window grace, immutable state transitions) is clean, pure, and
already has dedicated tests contributing to the 448-test baseline. No notes —
it's a good pattern to keep using for new state modules.

## Suggested priority order (post-freeze)

1. Make answer position unbiased at the source (`normalizeQuestion`), not just
   at render — closes the last real gap in the shuffle story.
2. Add a compact third fallback to the notes retry ladder for parity with quizzes.
3. Surface generate/verify/retry progress in the UI so a slow quiz doesn't read as a hang.
4. Second question type (short-answer) — biggest quality lift, also the most work.
5. Close the generic-term lexical auto-pass, or rename it so it doesn't imply grounding.
