# NeatMind Chrome Extension

> Historical MVP ideation record. It describes the original scope, not the current shipped capability set; see the root README and architecture document for the release behavior.

## Product Idea

NeatMind is a Chrome extension that helps students prepare quickly for upcoming exams by turning webpages, notes, and study materials into summaries, quizzes, weak-topic reports, highlights, bookmarks, and future study goals.

The main idea is simple:

> Turn any study page or imported note into an interactive exam practice session.

## Target Users

- Students preparing for school, college, or university exams
- Learners studying from websites, online articles, PDFs, and lecture notes
- Students who want to find weak topics before an exam
- Self-learners who want fast revision and quiz-based learning

## Core Problem

Students often have too much material and too little time before exams. They may read notes passively but do not know:

- What points are most important
- Whether they understand the material
- Which topics they are weak in
- What they should revise next
- Where the source information came from

NeatMind solves this by converting study material into active recall, quiz practice, and targeted revision.

## Core Features

### 1. Study Current Webpage

The user opens a study webpage and clicks the extension.

The extension should:

- Read the current webpage content
- Extract important information
- Generate key notes
- Generate an interactive quiz
- Show quiz score
- Identify weak topics
- Highlight sections related to wrong answers
- Bookmark important sections for later revision

### 2. Import Notes

The user can import their own study notes instead of using a webpage.

Supported input for the first version:

- Paste notes into a text box
- Upload `.txt` files

Future support:

- PDF files
- DOCX files
- Images or screenshots using OCR
- YouTube transcript import

From imported notes, the extension should generate:

- Clean summary
- Key points
- Flashcards
- Quiz questions
- Weak-topic analysis
- Revision goals

### 3. Interactive Quiz

The quiz should feel like a mini exam.

Question types:

- Multiple choice
- True or false
- Fill in the blank
- Short answer

Quiz result should include:

- Total score
- Correct answers
- Wrong answers
- Explanation for each answer
- Source reference from the webpage or notes
- Weak topics detected from wrong answers

### 4. Weak Topic Detection

After the quiz, the extension should identify areas where the student performed badly.

Example:

If the user answers 3 questions wrong about "solving linear equations", the extension marks that topic as weak.

The weak-topic report should show:

- Weak topic name
- Related wrong questions
- Short explanation
- Recommended revision action
- Suggested follow-up quiz

### 5. Highlight and Bookmark

When the user answers wrongly, the extension should connect the wrong answer to the original study material.

The extension should:

- Highlight the relevant text on the webpage
- Save the section into a review list
- Add a bookmark to revisit later
- Store the page title and URL
- Allow the user to mark the topic as revised

### 6. Saved Study Library

The extension should keep a personal study library.

Saved items:

- Generated notes
- Quizzes
- Quiz scores
- Wrong answers
- Weak topics
- Bookmarked pages
- Highlighted sections
- Exam goals

Organize by:

- Subject
- Topic
- Exam date
- Difficulty
- Status: not started, learning, weak, revised, mastered

### 7. Future Study Goals

After each quiz, the extension should suggest what the student should do next.

Example output:

- Today: revise weak topic "cell division"
- Tomorrow: retake quiz with 10 harder questions
- This week: complete 3 practice quizzes
- Before exam: review all bookmarked weak sections

## Main User Flow

1. User opens a study webpage or imports notes.
2. User clicks "Generate Study Session".
3. Extension creates key notes and quiz.
4. User answers interactive quiz.
5. Extension shows score and explanations.
6. Extension detects weak topics.
7. Extension highlights or bookmarks important sections.
8. Extension creates future study goals.
9. User can review everything later in the study library.

## MVP Version

The first version should stay small and focused.

### MVP Features

- Read current webpage content
- Paste notes manually
- Generate short summary
- Generate 5 to 10 quiz questions
- Show interactive multiple-choice quiz
- Calculate score
- Show correct and wrong answers
- Save wrong questions
- Save page URL as a bookmark

### Not Needed in MVP

- PDF upload
- DOCX upload
- Image OCR
- YouTube transcript support
- Advanced dashboard
- Complex spaced repetition
- Account login
- Payment system

These can be added after the first working version.

## Version 2 Features

- Highlight source text for wrong answers
- Weak-topic dashboard
- Spaced repetition reminders
- PDF import
- Flashcard mode
- Exam countdown
- Study streaks
- Export notes to PDF or Markdown
- Sync across devices

## Version 3 Features

- User accounts
- Cloud study library
- Paid premium plan
- Team or classroom plan
- Teacher/tutor dashboard
- Shared quizzes
- Advanced analytics
- Mobile companion app

## Monetization

The Chrome Web Store no longer supports direct paid extension purchases through its old payment system. The extension should be free to install, with paid features unlocked through an external payment provider.

Possible payment providers:

- Stripe
- Paddle
- Lemon Squeezy
- PayPal

### Suggested Pricing

Free plan:

- Limited webpage quizzes
- Limited pasted-note quizzes
- Basic summary
- Basic quiz score

Premium plan:

- Unlimited quiz generation
- PDF and DOCX import
- Weak-topic dashboard
- Saved study library
- Exam countdown plan
- Advanced flashcards

Possible price:

- $3 to $10 per month for students
- Higher price for tutors, schools, or teams

## Market Positioning

Avoid positioning it as only an AI quiz generator. Many tools can already generate quizzes.

Stronger positioning:

> Learn only what you are weak at before the exam.

Alternative pitch:

> Import your notes or use any webpage. NeatMind turns them into quizzes, finds your weak spots, and builds your final revision list.

## Important Policy and Safety Notes

The extension should be marketed as a study and revision assistant, not a cheating tool.

Avoid:

- Helping users answer live exam questions
- Hiding functionality from schools or teachers
- Promising guaranteed exam success
- Collecting unnecessary personal data

Do:

- Clearly explain what data is collected
- Add a privacy policy
- Ask permission before reading webpage content
- Show users when AI-generated content may be inaccurate
- Encourage learning and revision

## Possible Names

- CramPilot
- ExamSnap
- StudyMark
- QuizBack
- CramRecall
- PageToQuiz
- WeakSpot Study

## Recommended First Build

Start with this first product:

> A Chrome extension that reads the current webpage or pasted notes, generates a short summary and 10-question quiz, shows the score, saves wrong answers, and creates a review list.

This is small enough to build, test, and publish quickly while still proving whether students want the product.
