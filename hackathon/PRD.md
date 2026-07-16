# Product Requirements Document

## Product vision

Exam-Cram helps students build understanding from their own learning sources, then turn that understanding into active recall and a persistent record of progress.

## Users and jobs

| User | Job to be done |
| --- | --- |
| Everyday learner | Capture course material as it is encountered and keep it organized for later revision. |
| Exam reviser | Turn selected material into concise, source-backed explanations and practice questions. |
| Independent learner | Combine material from several sources without losing where each idea came from. |

## Primary user flow

1. The student creates or selects a chapter.
2. The student explicitly saves a source to that chapter.
3. Exam-Cram creates a visual note and cheat sheet grounded in the saved evidence.
4. The student explores concepts and verifies supporting evidence.
5. The student generates a quiz and submits answers.
6. Exam-Cram records progress and shows the next learning action in Journey.

## Functional requirements

### Source and chapter management

- The user can create a named chapter and select it before saving or generating learning material.
- The user can save supported pages, PDFs, notes, and video transcripts to a chapter.
- Saved sources are deduplicated when the same source is captured again.
- Sources, notes, quizzes, and progress remain separated by stable chapter IDs.

### Visual learning and evidence

- The product creates a visual tutor note, connected concept map, and cheat sheet from selected material.
- Generated claims expose source evidence appropriate to the source type: a passage, page anchor, or timestamp.
- The UI explains when a video timestamp is caption-grounded, user-provided, or AI-estimated.

### Active recall and progress

- The user can generate a quiz only from a matching saved note and source fingerprint.
- The product records submitted quiz results separately from passive study activity.
- The Journey presents saved artifacts, sources, mastery, weak concepts, and an appropriate next action.

### Supporting study tools

- The product exports selected study content as editable DOCX or PDF.
- The user can start a bounded Focus session with explicit domain and path rules.

## Experience requirements

- The first useful action must be obvious: create/select a chapter and save a source.
- The learner must be able to distinguish the current browser page from a pinned study artifact.
- Evidence must remain accessible without overwhelming the main lesson.
- Important controls must remain keyboard accessible and usable on narrow side-panel widths.

## Trust and privacy requirements

- No source is read or captured without an explicit user action and needed Chrome permission.
- Source processing is bounded; raw PDFs and raw audio are not persisted or exported.
- Provider keys stay in backend configuration rather than extension code.
- The product does not present AI-estimated video timestamps as publisher captions.

## Success metrics

- A first-time student completes the core loop in under five minutes.
- A student can open the evidence supporting a generated concept without leaving the study flow.
- A completed quiz produces a clear progress or revision signal in Journey.

## Non-goals

- A universal chatbot or a replacement for teaching.
- Automatic crawling of unrelated tabs, links, or browsing history.
- Multi-user classrooms, payment systems, or broad social features in the hackathon scope.
