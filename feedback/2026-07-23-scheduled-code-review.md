# Scheduled Code Review — 2026-07-23 (discussion, no changes applied)

Automated review run, discussion-only per convention (see the 2026-07-18/19 reviews in
this folder). The hackathon submission deadline (2026-07-21 17:00 PDT) has passed, so
unlike the 07-19 review this one does **not** need to split findings into freeze-safe vs.
later — everything below is a genuine recommendation, prioritized by value.

## Baseline

- `npm test`: 440/440 passing (up from 400 on 07-18/07-19 — new coverage has landed).
- Working tree is clean except for a deletion of `design-qa-*` images/md (looks like your
  own cleanup, left untouched).

## What landed since the 07-19 review (good news first)

Three of that review's flagged items are now fixed in the codebase:

1. **Quiz answer-position pattern — fixed.** `renderQuiz` (`popup.js:8573`) now calls
   `shuffle(question.choices)` at render time. The learnable A/B/C/D cycle from
   `server.js`'s `questionIndex % 4` placement no longer reaches the student.
2. **Un-debounced per-click persistence — fixed.** The quiz radio `change` handler
   (`popup.js:8587`) now calls `scheduleCurrentSessionDraftSave()` instead of writing to
   storage synchronously on every click.
3. **Ease factor for spaced repetition — implemented.** `deriveConceptEaseFactor`
   (`journey-utils.js:356-362`) now derives a per-concept ease multiplier from lifetime
   wrong-answer ratio and scales `intervalDays` by it (`journey-utils.js:1531`), instead of
   every concept doubling its interval identically. Real improvement toward the "mastery
   model as the moat" framing.

Also new since 07-19 and **not previously flagged**: `verifyQuizAnswersSemantically`
(`server.js:2817-2858`) adds a second AI pass that judges each answer against its quoted
evidence, with an explicit instruction *"shared keywords, generic words such as higher or
true, and outside knowledge are not sufficient"* (`server.js:2800`). This directly targets
the exact soft spot flagged as item #2 last time (lexical overlap passing a hallucinated
flip). Good design — it's a real judgment call on top of the cheap lexical pre-filter, not
a replacement for it.

## New concern introduced by the semantic verifier

The verifier is a genuine quality win, but it changes the cost/failure profile of quiz
generation in a way worth naming:

- **It doubles worst-case LLM calls per quiz.** `generateStudySession` retries across up
  to 3 prompt builders (`server.js:678-698`); each attempt now makes *two* sequential AI
  calls (generate, then verify) instead of one. Worst case: 6 calls instead of 3, before
  falling through to caller-side local fallback.
- **Its own failure is not distinguished from the generation's failure.** If the verifier
  call itself errors (malformed JSON, provider timeout, or the free-tier quota 502 noted
  in [[project-gemini-freetier-model]]), `verifyQuizAnswersSemantically` throws a message
  containing "grounded"/"answer" (`server.js:2820/2842/2849`), which `isRetryableQuizOutputError`
  (`server.js:2736`) matches — so a good quiz gets discarded and regenerated because the
  *verifier* hiccuped, not because the quiz was wrong. Under free-tier quota pressure this
  could raise the local-fallback rate rather than lower it, which cuts against the intent
  of the change.
- Suggestion (not applied): give the verifier its own retryable-error classifier that
  distinguishes "verifier says unsupported" (should retry generation) from "verifier
  itself failed to produce a parseable verdict" (should skip verification and use the
  quiz as-is, falling back to the lexical checks that already ran) — so a flaky second
  call can't tank a well-grounded quiz.

## Still open from the 07-19 review (verified against current code, unchanged)

- **`getDueConcepts` due-ness OR-condition still self-contradicts**
  (`journey-utils.js:1665-1669`): a concept is due if `nextReviewAt` passed **or**
  `strength < 60` **or** `state === "weak"`. A missed answer sets next review to tomorrow
  while leaving strength/state weak, so "Today's Plan" can keep resurfacing a concept the
  schedule just deferred. Now that the ease-factor work above shows the team has appetite
  for real spaced-repetition fixes, this is a natural next one — the real design question
  is whether `nextReviewAt` alone should gate due-ness, with strength/state only used to
  *rank* among already-due concepts.
- **Local `summarize()` still ignores the mastery model it sits next to**
  (`journey-utils.js:2449-2488`): builds `knowledgeGaps`/`nextSteps` purely from free-text
  `weakTopics` counts, never touching `rankWeakConcepts`/`getDueConcepts` or the
  `strength`/`state`/`easeFactor` data that now exists. This is the highest-leverage
  remaining gap: you've now built a genuinely good per-concept mastery model (ease
  factor, due tracking) and the one surface that narrates progress back to the student
  still can't see it. "3 concepts regressed to weak this week, 5 are overdue" would be a
  much stronger line than the current chapter-count template filler, and directly
  supports the "active recall + progress memory" differentiator vs NotebookLM.
- **No UI signal when a visual note silently collapses to filler**
  (`server.js:3536` `buildFallbackVisualModel`, still only logged via `console.warn`).
  Cheap fix, unchanged since last review: surface a small badge when the fallback path
  fires — the flag already exists in the response payload.
- **Retry-classification regex still swallows the original error**
  (`server.js:2736/2740`, `isRetryableQuizOutputError`/`isRetryableVisualOutputError`):
  broad word match ("concept", "grounded", "answer", "node") reclassifies almost any
  error as retryable with no `console.error` of the original message. Still a one-line,
  log-only fix.
- **Recovery quiz can still test the same node repeatedly**
  (`buildRecoveryComposition`, `server.js:2167-2195` region) when the concept graph lacks
  prerequisite edges.

## Priority recommendation

If picking one thing to do next: fix the verifier's error classification (new concern
above) before it causes a quiet regression in fallback rate — it's small, isolated, and
protects the very feature you just shipped. If picking the highest-value non-mechanical
project: wire `summarize()` to the mastery model (`rankWeakConcepts`/`getDueConcepts`) —
it's the one place left where the product's actual differentiator isn't visible to the
student.

## Reviewed and deliberately left unchanged

- Server hardening (timing-safe token comparison, byte caps, rate buckets, TTL+LRU cache)
  — no new issues found this pass.
- `journey-tree/forest.js` render loop — still cancels `requestAnimationFrame` correctly.
