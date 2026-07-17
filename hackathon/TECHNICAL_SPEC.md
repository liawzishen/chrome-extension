# Technical Specification

## Architecture

The canonical system design is in [the repository architecture](../ARCHITECTURE.md). The implementation has six explicit boundaries: side-panel orchestration, source normalization, evidence/artifact validation, stable Journey persistence, privileged service-worker actions, and an optional hardened loopback backend.

~~~mermaid
flowchart LR
  source["Learner-selected source or curated Math source"] --> normalize["Normalize + fingerprint"]
  normalize --> validate["Validate evidence-linked artifact"]
  validate --> journey["Stable Journey chapter"]
  validate -. "optional generation" .-> backend["Loopback backend"]
  backend --> provider["Configured provider"]
~~~

The curated Mathematics demo follows the same source, validation, and Journey contracts as the normal route, while bypassing the optional backend entirely. This keeps the judge experience deterministic without creating a misleading parallel product path.

## Main components

| Component | Responsibility |
| --- | --- |
| Chrome side panel | Presents Page, Notes, Journey, Focus, Library, visual notes, quizzes, and settings. |
| Service worker | Coordinates extension events, chapter writes, permissions, Focus rules, and short-lived video authorization. |
| Journey | Stores named chapters using stable IDs and renders study progress as an interactive Learning Forest. |
| Local Node.js backend | Validates requests, applies bounds, calls the configured AI provider, and returns structured study output. |
| Source readers | Extract bounded content from accessible web pages, local/remote PDFs, notes, captions, and supported transcript paths. |
| Export pipeline | Produces editable DOCX and direct PDF exports from selected study artifacts. |

## Study data flow

1. The student explicitly selects a chapter and saves or creates a source.
2. The extension builds a bounded source snapshot with stable identity and provenance.
3. The backend receives structured source data and returns a validated visual-note model or quiz model.
4. The extension attaches the generated artifact to the source and chapter IDs.
5. The Journey records saved artifacts and submitted quiz outcomes separately.
6. The student can reopen evidence, revisit an artifact, export it, or continue studying from the same chapter.

## Data model principles

- One user-named chapter maps to one stable chapter ID.
- Notes, quizzes, saved sources, and progress refer to stable IDs instead of titles or array positions.
- A quiz is bound to the exact source fingerprint of its saved note.
- Duplicate source captures are deduplicated without losing distinct generated artifacts.

## AI and validation

- The backend supports configured Gemini or OpenAI note/quiz generation; automatic video transcription requires Gemini.
- Output is normalized and schema-checked before it is presented or saved.
- Evidence references are checked against the supplied source snapshot, PDF page anchors, or transcript segments.
- Video evidence is labelled according to its provenance: caption-grounded, user-provided, or AI-estimated.

## Privacy and security

- Website, document, local-file, Focus, and custom-backend permissions are requested only when the relevant action needs them.
- The bundled backend listens on loopback and validates the extension origin.
- Requests use JSON with body limits, timeouts, rate limits, concurrency limits, and defensive response headers.
- Provider keys remain in the backend environment configuration and are not bundled with the extension.
- Raw audio is processed in bounded transient chunks and is not stored as a study artifact.

## Key technologies

- JavaScript and Chrome Extensions Manifest V3
- Node.js
- Gemini and OpenAI provider support
- Three.js for the Learning Forest
- PDF.js for local PDF extraction
- `docx` and PDF-Lib for exports
- esbuild for local bundles

## Verification

```powershell
npm test
npm run check
npm run build
```

The automated suite covers source provenance, chapter isolation, exports, responsive UI behavior, permission contracts, backend hardening, transcript handling, and capture authorization.
