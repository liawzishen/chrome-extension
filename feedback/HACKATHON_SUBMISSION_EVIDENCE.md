# OpenAI Build Week Submission Evidence

> Updated 2026-07-17. This is an evidence package, not a legal eligibility determination. The [Official Rules](https://openai.devpost.com/rules) and [Build Week FAQ](https://openai.devpost.com/details/faqs) control if any detail differs.

## Primary `/feedback` Session ID

**Submit this ID to Devpost:** `019f65fd-eb83-7cf1-9ec5-1eaf083f4b5f`

- **Primary build thread:** `Fix quiz generation grounding`
- **Started:** `2026-07-15T13:36:12Z`
- **Captured work:** `224` file-change events across `41` unique file paths.
- **Transcript:** [2026-07-15-fix-quiz-generation-grounding.md](2026-07-15-fix-quiz-generation-grounding.md)
- **Selection rationale:** this is the largest recorded implementation session in the exported project history. It is therefore the strongest available candidate for the required primary build-thread Session ID.
- **Do not submit:** the `Create chat feedback files` thread; it packages documentation rather than core product work.

## Build Window Provenance

The official submission period runs from **2026-07-13 09:00 PDT** through **2026-07-21 17:00 PDT**. In Malaysia time, that is 2026-07-14 00:00 through 2026-07-22 08:00. The recorded repository history begins after the window opens:

| Commit | Timestamp (UTC+08:00) | Evidence |
| --- | --- | --- |
| `564e1e5` | `2026-07-14 18:29:59` | Initial commit |
| `26cde57` | `2026-07-14 20:06:41` | Chrome-extension initial commit |
| `de8bfa8` | `2026-07-16 12:08:01` | Feature, UX, hackathon-document, and test expansion |
| `7cc5522` | `2026-07-16 14:20:21` | Journey feature and UX implementation |
| `9d3dfab` | `2026-07-17 01:45:31` | Design, source handling, and verification expansion |
| `447b098` | `2026-07-17 16:25:55` | Categorized upload optimization and design work |

## Requirement Checklist

| Requirement | Evidence or action | Status |
| --- | --- | --- |
| Codex and GPT-5.6 build evidence | Submit the primary `/feedback` Session ID and retain this detailed collaboration narrative. | Documented |
| One submission track | **Education** is the recommended match for Exam-Cram; select it in Devpost. | Ready to select |
| Detailed project description | Product summary, scope, PRD, and technical specification are linked from `hackathon/README.md`. | Ready |
| Explain Codex/GPT-5.6 collaboration | Root README, hackathon README, and the builder-led collaboration report document the builder’s direction, review process, and Codex implementation support. | Ready |
| Public YouTube demo under 3 minutes with audio | Record a working demo with a specific voiceover on the user problem, product flow, Codex work, and GPT-5.6 build use. | Pending |
| Judge-accessible repository | Use a public repository with an appropriate license, or a private repository shared with the addresses in the Official Rules. | Pending |
| Setup and test guidance | Root README documents installation and verification commands. | Ready |
| Third-party usage rights | Confirm that any SDKs, APIs, data, trademarks, music, and images used in the submission are authorized. | Entrant action |

## README Narrative Guardrail

The collaboration narrative documents the Codex/GPT-5.6 build workflow. It intentionally does **not** claim that GPT-5.6 is a runtime dependency of the shipped extension unless that is true in the actual deployed configuration.

The [builder-led collaboration report](../hackathon/CODEX_COLLABORATION.md) makes the ownership model explicit: the product documents and decisions are builder-owned; Codex GPT-5.6 supported analysis, implementation, review, and verification.

## Design Validation Evidence

The linked [design-test session](2026-07-16-design-test-review-md-files-and-implement.md) provides supporting design-process evidence. It found that a brief for a Chrome-extension popup was opened in a Vite workspace, identified the two nearby extension candidates, and avoided editing the incorrect repository. It contains no core product file changes and is not the primary Session ID.

## All Exported Sessions

| Role | Session ID | Thread | Created | File changes | Export |
| --- | --- | --- | --- | ---: | --- |
| Primary build evidence — submit this ID | `019f65fd-eb83-7cf1-9ec5-1eaf083f4b5f` | Fix quiz generation grounding | 2026-07-15 | 224 | [2026-07-15-fix-quiz-generation-grounding.md](2026-07-15-fix-quiz-generation-grounding.md) (95 messages) |
| Review evidence | `019f65de-f5de-7de3-bf49-0e8e2fd03bf9` | Review | 2026-07-15 | 0 | [2026-07-15-review.md](2026-07-15-review.md) (1 messages) |
| Supporting optimization evidence | `019f699b-bcab-7a72-8902-bccb2c0cc8f1` | Review optimization.md | 2026-07-16 | 29 | [2026-07-16-review-optimization-md.md](2026-07-16-review-optimization-md.md) (39 messages) |
| Supporting design validation | `019f6b1d-de25-76e3-9ff0-3fd5a9c0936e` | Review md files and implement | 2026-07-16 | 0 | [2026-07-16-design-test-review-md-files-and-implement.md](2026-07-16-design-test-review-md-files-and-implement.md) (5 messages) |
| Supporting implementation evidence | `019f6b22-834e-7a12-8ab6-b611599b776f` | Implement from md files | 2026-07-16 | 29 | [2026-07-16-implement-from-md-files.md](2026-07-16-implement-from-md-files.md) (17 messages) |
| Supporting specification implementation | `019f6c01-05a1-73b1-bd6d-5c7f1de88cf5` | Read md files | 2026-07-16 | 32 | [2026-07-16-read-md-files.md](2026-07-16-read-md-files.md) (67 messages) |
| Supporting UX implementation | `019f6c5e-7392-78f0-9104-5962a6fd237a` | Fix learning journey UX | 2026-07-16 | 49 | [2026-07-16-fix-learning-journey-ux.md](2026-07-16-fix-learning-journey-ux.md) (46 messages) |
| Evidence-export session — not the primary build thread | `019f6f1e-5e5c-7592-868b-3470785c446f` | Create chat feedback files | 2026-07-17 | 0 | [2026-07-17-create-chat-feedback-files.md](2026-07-17-create-chat-feedback-files.md) (20 messages) |

## Final Submission Actions

1. Select **Education** in Devpost and paste the primary Session ID exactly as shown above.
2. Publish a public YouTube demo under three minutes. Use voiceover to explain the working study flow, how Codex was used, and the GPT-5.6 build workflow.
3. Make the repository judge-accessible. If it is public, add an appropriate license; no `LICENSE*` file was found during this review. If it is private, share it using the official-rule instructions.
4. Re-read the official rules immediately before submitting because the organizer can amend them.
