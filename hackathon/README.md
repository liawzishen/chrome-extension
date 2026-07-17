# Exam-Cram Assistant — Hackathon Submission

Exam-Cram Assistant is a source-grounded Chrome study companion for students in any subject. It turns student-selected pages, PDFs, notes, and videos into visual lessons, active-recall quizzes, and a persistent learning journey.

## Problem

Students learn from scattered sources and often end up with unverified summaries, passive revision habits, and no clear next step. They need a way to transform the material they already use into trusted, reusable study actions.

## Solution

Exam-Cram creates an evidence-to-mastery loop:

```text
Choose or create a chapter
  -> save a source
  -> build a visual lesson and cheat sheet
  -> inspect source evidence
  -> practise with a quiz
  -> review progress and choose the next study action
```

The product supports everyday learning during a course as well as focused exam revision. It is not limited to a specific subject: a student can use it for science, humanities, languages, business, computing, and more.

## What makes it different

- **Source-grounded learning:** concepts and quiz material retain links to source passages, PDF pages, or video timestamps.
- **Active learning:** learners move beyond a summary into quizzes and recorded mastery.
- **Persistent chapters:** saved sources, notes, and outcomes remain organized by named study chapter.
- **Visible next step:** the Journey view helps the learner see what they have studied and what to revisit.

## OpenAI Build Week Submission Evidence

**Recommended track:** Education

**Primary `/feedback` Codex Session ID:** `019f65fd-eb83-7cf1-9ec5-1eaf083f4b5f`

This is the `Fix quiz generation grounding` build thread. Among the locally exported project sessions, it contains the most recorded implementation activity: 224 file-change events across 41 unique file paths. Submit this ID—not the documentation-export session—to Devpost as the primary build-thread evidence.

### Builder-led collaboration with Codex GPT-5.6

I owned the product direction: the study problem, source-grounding standards, scope, PRD, technical specification, design materials, priorities, and acceptance decisions. Codex GPT-5.6 worked as my engineering and design-review partner. It read those builder-authored materials as implementation constraints, inspected the Chrome-extension repository, raised material uncertainty before editing, made focused changes, and supported validation.
This was an iterative professional workflow: I supplied requirements and reviewed outcomes; Codex translated those requirements into repository-aware engineering work; I gave corrective product and visual feedback; Codex refined and verified the result. The separate [design-validation session](../feedback/2026-07-16-design-test-review-md-files-and-implement.md) demonstrates the safety gate in practice: Codex caught a Vite-versus-extension workspace mismatch before it could edit the wrong project.
Read the full [builder-led collaboration report](CODEX_COLLABORATION.md) for the workstream summary, responsibilities, evidence links, and a submission-ready narrative.

### Submission handoff

Use the [detailed submission evidence record](../feedback/HACKATHON_SUBMISSION_EVIDENCE.md) alongside the primary session transcript. Before submitting, complete the pending public-video, repository-access, and licensing checklist items in that record.

## Hackathon documents

- [Project scope](SCOPE.md)
- [Product requirements document](PRD.md)
- [Technical specification](TECHNICAL_SPEC.md)
- [Builder-led Codex GPT-5.6 collaboration](CODEX_COLLABORATION.md)

## Running and verifying the project

The repository's main [README](../README.md) contains detailed installation, privacy, workflow, and release documentation.

```powershell
npm test
npm run check
```
