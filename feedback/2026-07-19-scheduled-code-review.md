# Scheduled Code Review — 2026-07-19 (discussion, no changes applied)

Automated review run. This run was scoped as a **discussion**, not a fix pass — no code was
edited. Context: `hackathon/CHAMPION_PLAN.md` calls for a code freeze starting today
(2026-07-19), so recommendations below are labeled **Now** (small, contained, safe inside a
freeze) or **Later** (real improvement, needs post-submission runway) rather than applied
directly.

## Baseline

- `npm test`: last full run (2026-07-18) was 387 tests / 30 files, all passing. Reran the
  suite tonight; the tail of the run (media-capture/document-reader suite, largest file)
  shows `tests 400, pass 400, fail 0` — consistent, healthy. Working tree currently has
  uncommitted changes (journey-utils.js, popup.js, popup.html/css, server.js, +tests) that
  look like in-progress dashboard/study-goal work per [[project-dashboard-brief]] — left
  untouched.

## Quiz quality

**1. Correct-answer position is a learnable pattern, not randomized — highest-value fix.**
`server.js:2723-2725` places the correct choice at `questionIndex % 4` (A,B,C,D,A,B,C,D...).
`popup.js:7650` (`renderQuiz`) renders `question.choices` in that exact server order —
**no client-side shuffle**, even though a `shuffle()` helper already exists and is used by
every *local-fallback* quiz path (`popup.js:3427, 4458, 4512`). A student who retakes a quiz
(or a judge who clicks through twice) can learn the position cycle instead of the material —
this undercuts the "active recall" pitch that's the whole competitive differentiator vs
NotebookLM. **Fix is one line**: shuffle `question.choices` client-side at render time
(reuse the existing `shuffle()`), or randomize `answerPosition` server-side instead of
`% 4`. Low risk, well-isolated, verifiable in the existing quiz-render tests.

**2. Grounding check has two soft spots that can pass a hallucinated flip.**
`hasQuestionSourceOverlap`/`hasEvidenceOverlap` (`server.js:2652-2687`, `2952-2975`) accept
≥15% term overlap or a single shared 8+ char substring as "grounded" — a lexical proxy, not
a truth check. Worse, `server.js:2644-2650` auto-passes any answer built only from generic
terms (true/false/increases/decreases/more/less) with **no source check at all** — exactly
the answer style most prone to a hallucinated flip (source says "increases", model says
"decreases"). Given the demo leans hard on "evidence-grounded, not hallucinated" as the
product's core claim (`hackathon/CHAMPION_PLAN.md` C1/C3), this is the one correctness gap
most likely to embarrass the demo if a judge hits it live. **Later** — needs real design
work, not a freeze-safe patch.

**3. Only one question type ships despite the schema implying more.**
`normalizeQuestion` (`server.js:2762`) hardcodes `type: "mcq"` regardless of AI output —
recognition-only testing, no short-answer/cloze. Fine for the hackathon window; worth a
backlog note since it caps how strong the "active recall" claim can get long-term. **Later.**

**4. Recovery quiz can silently stop being a recovery quiz.**
`buildRecoveryComposition` (`server.js:2167-2195`) pads with more questions on the *same*
weak concept when the AI-generated concept graph has no prerequisite/related edges — so a
"recovery quiz" can end up testing the same node 5 times instead of diagnosing the
prerequisite gap. **Later**, but worth a code comment now flagging the fallback as a known
compromise so it doesn't look intentional to the next person touching this.

**5. Minor: "hard difficulty" and question-style contracts are enforced by shallow regex**
(`questionHasScenario`, `server.js:2439/2605-2610`; `inferQuestionStyle`, `server.js:3732-3739`
mislabels ordinary "not/except" phrasing as "Misconception"). Cosmetic — affects internal
quiz-style-mix bookkeeping, not what the student sees. **Later / low priority.**

## Note generation quality

**6. A rich concept map can silently collapse into generic filler — invisible to the student.**
`server.js:3107-3190` drops any node whose `sourceAnchor`/`detail` fails the grounding check
and can't be repaired; if fewer than 3 nodes survive, the *entire* visual model is replaced
by `buildFallbackVisualModel(summary)` (`server.js:3378-3400`), which fills node detail with
boilerplate like `"This point helps connect ${label} to the rest of the study note."` The
only trace is a `console.warn` (`reportGroundingRepair`, `server.js:2989`) — nothing in the
UI tells the student "this note is thinner than it should be." This is the intermittent
"visual note fails to local outline" behavior already noted in
[[project-gemini-freetier-model]] (the free-tier Gemini model occasionally returns <2
scenarios) — same failure family, different severity: here it's a *quiet* quality
downgrade rather than a hard failure. **Now, cheap version**: surface a small UI badge
("simplified note — some AI content couldn't be verified against your source") when the
fallback path fires; the flag already exists in the response, this is a render-only change.
**Later**: improve repair quality itself.

**7. "Repair" of an ungrounded claim overwrites it with the citation, not a fix.**
`repairVisualNodeGrounding` (`server.js:3308-3325`) replaces a failing `detail`/`example`
with the raw `sourceAnchor` text — so the node's explanation and its citation can become
near-duplicates, losing the pedagogical value while still being logged as "repaired."
**Later** — needs a real regeneration step, not a freeze-week change.

**8. Retry logic reclassifies unrelated errors as retryable via substring match.**
`isRetryableVisualOutputError`/`isRetryableQuizOutputError` (`server.js:2627-2634`) match
broad words ("concept", "grounded", "answer", "node") in the error message — any unrelated
exception containing one of those words gets silently retried with a terser prompt (up to 3x)
before falling through to the local outline, burning latency/cost on the actual bug instead
of surfacing it. Worth a `console.error` with the original error preserved even on retry, so
a real bug doesn't get invisibly eaten during the freeze. **Now, low-risk**: add logging only,
no behavior change.

## Performance

**9. `normalizeJourney` is re-run (full deep clone + re-validate) up to 4x per dashboard render.**
Nearly every public journey-utils API (`getDueConcepts:1527`, `rankWeakConcepts:1434`,
`buildStudyPlan:1743`) unconditionally re-normalizes its input. `popup.js`'s
`renderDashboard()` (8879-8918) ends up normalizing the same journey object 3-4 times in one
render pass. Each pass clones and re-sorts every chapter/session/concept/attempt. Not
urgent at current data sizes, but this is exactly the kind of thing that gets slow right when
a judge has spent 10 minutes building up a journey during the demo. **Later** (needs a
"caller already normalized" fast path threaded through several call sites — more surface
area than a freeze-week patch should touch).

**10. Un-debounced full-artifact clone + storage write on every quiz-choice click.**
`popup.js:7661-7665` — each radio `change` handler calls `persistCurrentSessionDraft()`,
which `structuredClone`s the entire session (visual note model, up to 14k chars of source
text, all questions) and writes to `chrome.storage` on **every answer click**, not just on
submit/navigation. This is the exact same class of bug already fixed for the notes-input
keystroke case in yesterday's review — this call site wasn't covered by that fix.
**Now** — same debounce pattern (`schedulePanelStateSave`-style, ~300-400ms trailing) applies
directly; low risk, mechanical, and the existing persistence tests should catch a mistake.

**11. `learningMemory.concepts` and `recordedAttemptIds` grow unbounded; sessions evict without pruning them.**
Every other collection in `journey-utils.js` has a cap (attempts ≤20, sessions ≤`MAX_SESSIONS_PER_CHAPTER`,
events ≤500, appliedOperations ≤120) — `concepts` and `recordedAttemptIds` don't. Worse,
`recordSession` (1246-1248) evicts old sessions via `.slice()` with no matching cleanup of
`learningMemory.concepts`/`attempts` for the evicted `noteId`s (contrast with the explicit
user-triggered `removeSession`, 1192-1213, which does prune). Net effect: `chrome.storage`
slowly accumulates orphaned concept-mastery rows, and `buildStudyPlan` can emit plan steps
with `chapterId: ""` pointing at a session that no longer exists (dead link in the UI).
Unlikely to bite during a 3-day hackathon demo (not enough sessions accumulate), but real for
any judge or user who keeps using it afterward. **Later.**

## Mastery / spaced-repetition design (journey-utils.js)

**12. `getDueConcepts`'s "due" definition fights the schedule it just set.**
A concept is due if `nextReviewAt` has passed **OR** `strength < 60` **OR** `state === "weak"`
(`journey-utils.js:1545-1549`). But a missed answer sets `nextReviewAt` to tomorrow while
leaving `strength`/`state` in the weak range (`recordQuestionAttempts`, 1413-1416) — so the
concept is immediately "due" again, contradicting the 1-day interval just assigned. In
practice this means "Today's Plan" can keep resurfacing the same freshly-missed concept
instead of respecting its own spacing. **Later** — this is a real design decision (should
`nextReviewAt` alone gate due-ness, with strength/state only used for *ranking* among due
concepts?), not a mechanical fix.

**13. No per-concept ease factor — every concept doubles its interval identically.**
Correct → `intervalDays *= 2` (cap 60), incorrect → reset to 1, flat `strength ±20/-30`
(1400-1418). Unlike SM-2's ease factor, a concept the student has missed five times before
and one they nailed on the first try converge to the same interval after the same number of
consecutive correct answers. Fine for a hackathon demo (nobody will notice in a 10-minute
session); matters for the product long-term. **Later.**

**14. `rankWeakConcepts` can miss persistently-weak concepts once their miss ages out of the last-20-attempts window**
(`journey-utils.js:1433-1511`) — it reads `memory.attempts` (capped at 20 system-wide) rather
than the concept-level `state`/`strength` it already has available, and hardcodes the output
`state: "weak"` rather than reflecting the concept's real state. **Later.**

**15. Local `summarize()` doesn't use the mastery model it sits next to.**
`journey-utils.js:2329-2373` builds `knowledgeGaps`/`nextSteps` from free-text `weakTopics`
tags and chapter completion only — it never calls `rankWeakConcepts`/`getDueConcepts` or
reads `concept.strength`/`state`, despite that structured data existing in the same file.
Given [[project-hackathon-goal]]'s framing (the mastery model *is* the moat vs NotebookLM),
this is worth calling out specifically: the one place that narrates progress back to the
student is currently the one place that ignores the structured mastery data. **Later, but
flagged as high-value** — "3 concepts regressed to weak this week" / "5 concepts overdue" is
a more demo-worthy line than the current template filler, if there's a slot in the schedule
for it after the freeze.

## Priority summary (given the Jul 21 deadline)

**Safe to do now, in-freeze** (mechanical, low blast radius, covered by existing test
patterns): #1 (shuffle quiz choices — highest value for the least risk), #10 (debounce
quiz-choice persistence), #8 (preserve original error on retry-classification, log-only).

**Flag but don't touch until after submission**: everything else. #2 (grounding soft spots)
and #6 (silent note-quality collapse) are the most consequential long-term, but both are
core-pipeline changes that carry real regression risk during a freeze — better handled with
runway than under deadline pressure. #15 is the highest-leverage "widen the moat" item once
there's time again.

## Reviewed and deliberately left unchanged (from prior review, still holds)

- `background.js` `saveVideoCaptureState`'s JSON round-trip (sanitizes shape, not a perf bug).
- `journey-tree/forest.js` render loop already cancels `requestAnimationFrame` when hidden
  and honors reduced-motion.
- Server hardening (timing-safe token comparison, byte caps, rate buckets, TTL+LRU cache) —
  no new issues found this pass.
