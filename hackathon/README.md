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

## Hackathon documents

- [Project scope](SCOPE.md)
- [Product requirements document](PRD.md)
- [Technical specification](TECHNICAL_SPEC.md)

## Running and verifying the project

The repository's main [README](../README.md) contains detailed installation, privacy, workflow, and release documentation.

```powershell
npm test
npm run check
```
