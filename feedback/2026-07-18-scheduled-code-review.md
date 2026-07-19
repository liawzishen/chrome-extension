# Scheduled Code Review — 2026-07-18

Automated review run. Scope: performance, debugging, and code health only — no feature changes.

## Baseline

- `npm test`: 387 tests across 30 files, all passing before changes.
- `npm run check`: all syntax checks passing.
- Note: the full test suite takes several minutes to run serially; `tests/document-reader-utils.test.js` alone takes ~17s because it loads the PDF vendor bundle. This is expected, not a hang.

## Changes applied

### 1. popup.js — debounced panel-state persistence (performance)

`elements.notesInput` had an `input` listener that called `savePanelState()` on **every keystroke**, serializing the full panel state (including a notes field bounded at ~24k chars) and writing it to `chrome.storage` each time. Added `schedulePanelStateSave()` with a 400 ms trailing debounce and switched the notes-input listener to it. A direct `savePanelState()` call still runs immediately and cancels any pending debounced save, so explicit saves (tab switches, difficulty changes, etc.) behave exactly as before. No data-loss window beyond 400 ms of idle typing.

### 2. popup.js — `buildSourceClozeQuestions` lookup complexity (performance)

The local quiz fallback filtered each sentence's terms with `sourceTerms.includes(term)` (array scan), giving O(sentences × terms × sourceTerms) on up to 14k chars of source text. Replaced with a `Set` built once before the loop. Identical output, linear membership checks.

### 3. server.js — `cloneJson` uses `structuredClone` (performance)

The response cache clones every cached artifact on write and on every cache hit via `JSON.parse(JSON.stringify(...))`. Node ≥18 (the declared engine) ships `structuredClone`, which is faster and allocation-lighter for these JSON-derived objects. Falls back to the JSON round-trip if unavailable. All cloned values originate from `JSON.parse`, so semantics are unchanged.

## Reviewed and deliberately left unchanged

- `background.js` `saveVideoCaptureState` keeps its `JSON.parse(JSON.stringify(...))`: the round-trip also *sanitizes* the state (drops functions/undefined) before `chrome.storage.local.set`, so swapping to `structuredClone` could change stored shapes. Not worth the risk for a small object.
- `journey-tree/forest.js` render loop already cancels `requestAnimationFrame` when the view is hidden and honors reduced-motion — no change needed.
- Server hardening is in good shape: timing-safe token comparison, request-body byte caps, per-origin rate buckets with pruning, concurrency slots, sanitized/redacted error logging, and a TTL+LRU response cache. The rate-bucket map prunes only when >100 entries, but the server binds to loopback so unbounded growth is not a practical concern.
- `backend-error.log` contains only expected "Corrected AI grounding issue" repair entries — the grounding validator is working as designed; no latent errors found.

## Verification

After changes: re-ran the entire suite in chunks — 38 + 134 + 34 + 43 + 28 + 64 + 46 = **387 tests, 0 failures** (including `popup-persistence`, which covers the touched save path) and `npm run check` passes.
