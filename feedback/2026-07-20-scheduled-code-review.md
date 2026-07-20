# Scheduled Code Review — 2026-07-20 (discussion, no changes applied)

Automated review run, one day before the 2026-07-21 17:00 PDT deadline. Code freeze per
`hackathon/CHAMPION_PLAN.md` — nothing was edited; this is a verification pass plus the
requested Codex plan.

## Baseline (verified tonight)

- `npm run check`: pass (all syntax checks clean).
- `npm test`: **430 tests, 430 pass, 0 fail** — up from 400 on 2026-07-19; new
  Google-plugin-integration tests are green.
- Working tree: only `README.md` shows a 437-line diff that is pure line-ending/whitespace
  churn (likely CRLF from a Windows editor). Content is unchanged. Normalize or discard
  before tagging so the submission diff stays honest.

## Status of prior findings (2026-07-19)

- **Fixed:** correct-answer position pattern — `popup.js:8479` now shuffles
  `question.choices` at render via the existing `shuffle()`. Verified present.
- **Open, deferred (correctly):** generic-term auto-pass in the grounding check
  (`server.js:~2644`), single question type, recovery-quiz padding, shallow style regex.
  All are post-submission work; none are freeze-safe. `backend-error.log` shows the
  grounding validator actively repairing unsupported cheat-sheet rows — the safety net is
  doing its job in practice.

## Criteria fit (Design / Impact / Idea)

Code-side evidence is strong: complete runnable loop with zero-key judge path (Design);
visible grounding-repair mechanism that judges can see working (Impact); evidence-linked
provenance contracts as the differentiator (Idea). The remaining risk is entirely in
submission logistics, not code — which is what the plan below scopes.

## Codex Plan (final 24 hours, <250 words)

**Problem.** NeatMind is a source-grounded Chrome study extension entering OpenAI Build
Week (Education track, deadline 2026-07-21 17:00 PDT). Students studying from scattered
pages, PDFs, and videos cannot trust unverifiable AI summaries; NeatMind links every
generated claim to a quoted source and turns sources into evidence-checked quizzes and a
persistent Journey. The codebase is healthy — 430/430 tests pass, syntax checks clean,
and the answer-shuffle fix from the last review is in. The remaining risk is submission
completeness, not code.

**Implementation.**

1. Hold the feature freeze; accept only submission-blocking fixes.
2. Prove the judge path on a clean machine: fresh clone, install, preview, complete the
   60-second math demo. Fix or document any friction found.
3. Record the demo video (≤3 min): elevator pitch in the first 10 seconds, Evidence-checked
   badge, quoted source, one-question check, Journey update, then a 20-second breadth pan.
4. Finalize the Devpost entry: specific problem and persona, primary Codex session ID,
   pilot-metrics closing line; confirm the repo and all links are public.
5. Clean the tree (README line-ending churn), commit, tag the release, re-run the packager
   and publish-safety scan against the tag.
6. Only if time remains: close the generic-term auto-pass in the grounding check, guarded
   by existing server tests.

**Minimum targets.** Submission accepted with every required asset; a judge completes the
zero-key demo in under five minutes on a clean machine; the tagged commit is fully green;
no claim in the video exceeds what the demo shows.
