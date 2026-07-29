# Scheduled Code Review — 2026-07-25 (discussion, no changes applied)

Automated review run answering the standing prompt: quiz quality, note generation
quality, performance, and anything else worth flagging. No code was touched.

## Top finding: this checkout is 4 commits behind `origin/main`

`git status` shows local `main` and `origin/main` have **diverged** — 1 commit local-only
(`9a476d1`, the design-qa image cleanup), **4 commits origin-only**:

- `e408319` — "Learning Forest UX, auto study-time, contrast + external-source fixes"
- `f345792` — "update codex feedback, warning font color"
- `f60ffee` — "Remove obsolete code and configuration"
- `becc3a0` — merge commit (PR #5, `session-forest-ux-study-time`)

I diffed both trees to see what's actually different before reviewing:

- **`server.js` and `journey-utils.js` differ by rebranding only** (`NeatMind` →
  `NeatMind`, storage keys `examCram*` → `neatMind*`). No functional change. This means
  every logic-level finding from the 2026-07-23 review (still sitting uncommitted in this
  repo at `feedback/2026-07-23-scheduled-code-review.md`) is **still accurate against the
  true current codebase**, not stale — I re-verified the relevant line ranges below rather
  than re-deriving them from scratch.
- **`popup.js` (+542/-∅ lines) and `journey-page.js` (+219 lines) carry real new work**:
  automatic per-chapter/per-note study-time tracking (new `study-time-utils.js` module,
  15s tick loop keyed off pointer/keyboard/wheel activity with a 90s idle grace and a
  15-minute max-slice clamp) plus "Learning Forest" UX and contrast fixes. This is a
  genuinely new, well-isolated feature — pure state module with its own test file
  (`tests/study-time-utils.test.js`), same pattern the 2026-07-20 review praised when it
  was still uncommitted.
- The whole repo was renamed **NeatMind → NeatMind** (`.env.example`, README, manifest,
  hackathon docs, storage keys, log prefixes, the token filename
  `.exam-cram-backend-token` → `.neatmind-backend-token`).

**Why this matters for you, not just for me:** any local edits made against this checkout
right now would conflict with the study-time feature and the rename, and any review done
only against local files (like this one, if I stopped here) would miss a shipped feature
entirely. I did not merge or pull — that changes shared branch state and you asked me to
discuss, not act — but this is worth reconciling before more local work stacks up on top
of the older branding/schema.

## Baseline

- `npm test` (local checkout): **440/440 passing.**
- Working tree otherwise clean except the already-known `design-qa-*` deletions (your own
  cleanup, left untouched) and this new file.

## Quiz generation — status check against 07-23's open items

All confirmed still open, verified at current line numbers:

1. **Verifier error-classification conflation (highest priority, unchanged).**
   `verifyQuizAnswersSemantically` (`server.js:2817-2858`) throws a message containing
   "grounded"/"answer" on *any* failure — including its own malformed-JSON or
   provider-timeout errors — and `isRetryableQuizOutputError` (`server.js:2736`) can't
   tell "verifier says this answer is unsupported" apart from "verifier itself broke."
   Under the Gemini free-tier quota pressure noted in
   [[project-gemini-freetier-model]], a flaky verifier call now discards a perfectly good,
   already-grounded quiz and forces a regeneration (or local fallback) — the opposite of
   what the semantic-verification feature was built to improve. This is still the single
   best next fix: small, isolated, and it protects a feature you already shipped rather
   than adding a new one.
2. **`getDueConcepts` OR-condition still self-contradicts** (`journey-utils.js:1665-1669`):
   due if `nextReviewAt` passed OR `strength < 60` OR `state === "weak"`. A missed answer
   defers `nextReviewAt` to tomorrow while leaving strength/state weak, so "Today's Plan"
   can keep resurfacing a concept the schedule just told the student they don't need yet.
3. **`summarize()` still can't see the mastery model next to it**
   (`journey-utils.js:2449-2488`): narrates progress from raw `weakTopics` text counts,
   never touching `rankWeakConcepts`/`getDueConcepts`/`easeFactor`. This is still the
   highest-leverage non-mechanical gap — you've built real per-concept mastery tracking
   and the one surface that talks to the student about progress doesn't use it.
4. **Fallback visual note has no UI signal** (`server.js:3536`
   `buildFallbackVisualModel`) — still `console.warn`-only; the flag already exists in the
   response payload, just isn't rendered.
5. **Retry-classification regex still swallows the original error**
   (`server.js:2736/2740`) — broad keyword match, no `console.error` of what actually
   failed before reclassifying as retryable.
6. **Recovery quiz can still repeat the same node** when the concept graph lacks
   prerequisite edges (`buildRecoveryComposition`, `server.js:2167-2195` region).

## Note generation

No functional change since 07-20/07-23. The open item worth restating: the notes retry
ladder has 2 fallback tiers (`buildNotesPrompt`, `buildStrictNotesPrompt`) vs. 3 for
quizzes, despite notes being the thing everything else (quiz, recovery quiz, cheat sheet)
is bound to — a note generation that fails twice has one less safety net than a quiz that
fails twice. Cheap parity fix, not urgent.

## Performance

Unchanged from the 07-20 finding, still worth doing once there's bandwidth: a quiz can
cost up to 6 sequential LLM calls (3 prompt tiers × generate+verify) before falling to
local fallback, with no intermediate "generating → verifying → retrying" signal in the UI
— a flaky source reads as a 30-60s hang rather than visible progress. This compounds with
finding #1 above (verifier hiccups forcing unnecessary retries), so fixing the error
classification first should also reduce how often this worst case is actually hit.

## Priority recommendation

1. **Fix the verifier's error classification** (`server.js:2736-2858`) — smallest, most
   isolated, prevents a silent regression in fallback rate on the feature you just shipped.
2. **Reconcile the branch divergence** before more local work accumulates on the older
   `NeatMind`-branded schema — not a code-quality issue, but it will become a merge-pain
   issue the longer it sits.
3. **Wire `summarize()` to the mastery model** — the highest-value place where the
   product's actual differentiator (active recall + progress memory) still isn't visible
   to the student.
4. Surface generate/verify/retry progress in the UI, fix `getDueConcepts`'s OR-condition,
   add the notes-ladder third tier, badge the visual-fallback path — all smaller, can be
   batched together.

## Reviewed and deliberately left unchanged

- Server hardening (timing-safe token comparison, byte caps, rate buckets, TTL+LRU cache)
  — no new issues this pass.
- New `study-time-utils.js` (origin-only) — clean, immutable-state pattern, capped
  correctly (15-min max slice, 90s idle grace, 1000-entry cap); flagged here only as
  something not yet reviewed against a running local checkout, not as a defect.
