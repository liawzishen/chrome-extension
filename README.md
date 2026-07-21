# NeatMind

NeatMind is a source-grounded study companion for the open web. It turns pages, notes, and videos into interactive visual lessons and active-recall quizzes, keeps generated evidence connected to its supporting passage or timestamp, records demonstrated learning in a dated chapter Journey, and provides a lightweight timed Focus blocker. Backend-generated quizzes must pass lexical evidence checks and a provider-backed semantic check of every answer against its quoted evidence before the client accepts them.

The project is available under the [MIT License](LICENSE).

The product is designed around one loop:

```text
read across pages and videos
  -> select or create the chapter that owns the evidence
  -> inspect the supporting evidence
  -> practise with a quiz
  -> record mastery and weak concepts
  -> choose the next chapter action
  -> protect the study session
```

This is intentionally not another general-purpose browser chatbot. Broad assistants already compete on model count and feature volume; NeatMind is optimizing for traceability, active learning, persistence, and a clear next study action.

## Judge Quick Start (no API key)

For the fastest end-to-end evaluation, run `npm ci`, then `npm run preview`, and open `http://127.0.0.1:8788`.

1. From **Dashboard**, choose **Create**, then **Paste Notes**, then **Try 60-sec math demo**.
2. Inspect one visual concept and its quoted source evidence; the source banner shows an explicit **Evidence checked** status.
3. Select **Start 1-question check**, choose `x = 6`, and submit.
4. Open **Journey** to see the stable **Demo - Linear Equations** chapter update.

The preview starts on **Dashboard**. Choose **Create**, then **Paste Notes**, then **Try 60-sec math demo**. The curated route uses no API key, browser permission, extension setup, or database cleanup. See [the system architecture](ARCHITECTURE.md) for component boundaries and data contracts, and [the Devpost handoff](hackathon/DEVPOST_SUBMISSION.md) for the ready-to-paste description, video beat sheet, and pilot-measurement plan.

## Build Beyond Hackathon submission guide

This repository accompanies the [NeatMind Devpost project](https://devpost.com/software/exam-cram-assistant) for the [Build Beyond Hackathon](https://build-beyond-hackathon.devpost.com/). The official project guidance has no theme restriction or track selection, so this README focuses on making the product easy to evaluate against the published criteria.

The project overview should explain the idea, how it works, main features, technology stack, and intended audience. This README covers those topics through the introduction, [Current Capabilities](#current-capabilities), [Why NeatMind](#why-neatmind), and installation sections. The official guide states: "Every submission must include at least one visual showcasing the project."

### Judging-criteria map

| Official criterion | How this repository supports evaluation |
| --- | --- |
| Technical Execution (30%) | The [judge quick start](#judge-quick-start-no-api-key), architecture, verification commands, and deterministic no-key demo make the end-to-end flow reproducible. |
| Originality & Creativity (25%) | The evidence-to-mastery loop combines source-linked visual notes, evidence-checked quizzes, recovery practice, and a persistent Learning Journey. |
| Impact & Usefulness (20%) | The product targets students who study from scattered pages, PDFs, notes, and videos but need a trustworthy next study action. |
| UX & Design (15%) | The side-panel design, responsive import flow, evidence navigation, and Learning Journey are documented below and can be exercised in the preview. |
| Clarity of Submission (10%) | The quick start, architecture, source code, and [submission handoff](hackathon/DEVPOST_SUBMISSION.md) give judges a concise route through the project. |

### Final Devpost checklist

- [ ] Verify that the Devpost entry includes at least one current visual: a demo video, screenshot, presentation, or equivalent project visual.
- [ ] Link the public source repository and/or a live demo, which the official guidelines recommend so judges can explore the project further.
- [ ] Add every team member in Devpost and describe each contributor's work, if the project is not a solo entry.
- [ ] Re-read the [official Build Beyond rules](https://build-beyond-hackathon.devpost.com/rules) and the live challenge page immediately before submitting; they control eligibility, deadline, and any organizer updates.

## Historical OpenAI Build Week development record

> This section preserves a prior OpenAI Build Week collaboration record. It is development provenance only; it is not a current Build Beyond submission requirement or track.

For that historical event, NeatMind was prepared for the **Education** track. The primary `/feedback` Codex Session ID for the thread with the most recorded core implementation work is:

`019f65fd-eb83-7cf1-9ec5-1eaf083f4b5f` — **Fix quiz generation grounding**

The repository’s [hackathon submission narrative](hackathon/README.md#openai-build-week-submission-evidence) explains how Codex and GPT-5.6 contributed to the build. The detailed [submission evidence record](feedback/HACKATHON_SUBMISSION_EVIDENCE.md) maps the official requirements to the primary session, supporting session exports, and dated commits.

The [builder-led collaboration report](hackathon/CODEX_COLLABORATION.md) explains the professional working model: the builder authored the product direction and materials, while Codex GPT-5.6 supported repository analysis, implementation, review, and verification.

The shipped extension does not claim GPT-5.6 as a runtime dependency; the hackathon evidence is the Codex/GPT-5.6 build workflow and submitted primary session ID.

A separate [design-test conversation](feedback/2026-07-16-design-test-review-md-files-and-implement.md) caught a workspace mismatch before implementation: the brief targeted Chrome-extension popup files while the open `design_test` workspace was a Vite app. It identified this repository as the intended extension target, preserving the design brief’s correct implementation context.

## Current Capabilities

| Runtime fact | Current value |
| --- | --- |
| Extension platform | Chrome Manifest V3, Chrome 116+ |
| Local runtime | Node.js 18+ |
| Learning structure | One stable Journey chapter ID = one independent Learning Forest tree |
| Grounding | Lexical source checks for all quizzes; backend quizzes additionally require provider semantic verification of every answer against its quoted evidence |
| Review scheduling | Per-concept SM-2-lite intervals use the cumulative wrong-answer ratio; difficult concepts return sooner than mastered concepts |
| External study | Opt-in external suggestions remain visibly separate from saved evidence until the learner explicitly saves a page to the chapter |
| Unpacked build | `release/neatmind-extension` |
| Verification | Build, syntax, test, secret-scan, dependency-audit, and package commands are documented below |
| Publication safety | The extension packager copies an explicit runtime allowlist and excludes local credentials |

### Explicit chapters, least-privilege access, and release security

- adds **New chapter** beside the chapter selector in Page and Notes and to the compact Journey view; each unique chapter receives a stable ID and grows as an independent Learning Forest tree, while choosing an existing name selects its existing ID instead of silently creating or merging another record
- changes note and source creation to require an explicitly selected chapter, passes both the stable chapter ID and display title through every creation path, and keeps same-titled legacy records isolated by IDs rather than fuzzy title matching
- prevents a newly created or empty chapter from displaying another chapter's last studied source; chapter evidence now appears only when its stable chapter ID matches
- replaces the dense multi-tree overview with an exact-count Journey Ribbon, keeps chapter titles beneath their planting roots, and removes the obsolete timeline rule that ran through compact Journey chapter numbers
- renames the collection action to **Save source to chapter** and explains its behavior in place: it stores a bounded page, document, or video/transcript snapshot without generating a note, deduplicates an exact repeated source, and lets the learner later choose **Build chapter visual note** in Journey to combine the chapter's saved evidence
- replaces global all-sites onboarding with an **Allow this site** banner for the current HTTP/HTTPS origin; document hosts, local-file access, Focus destinations, and custom backend origins are requested separately only when their corresponding action needs them
- binds every saved backend token to the configured endpoint origin, clears a reused token when that origin changes, sends it only to its bound origin, permits plain HTTP only for loopback hosts, and requires HTTPS for custom remote backends
- hardens the local services with loopback-only listeners, exact origin validation, constant-time bearer-token comparison, JSON-only API posts, bounded request bodies, per-origin/address rate limits, concurrency limits, timeouts, redacted server errors, no-store responses, and restrictive CSP, framing, referrer, MIME, and permissions headers
- adds an allowlisted extension packager and publish-safety scanner, CI verification, CodeQL analysis, Dependabot updates, a private vulnerability-reporting policy, an explicit extension CSP, and expanded regression coverage for chapter isolation, permission contracts, endpoint-bound tokens, loopback authentication, JSON-only API posts, and defensive response headers

## Interface Design Principles

The side panel applies Apple Human Interface Guidelines as cross-platform web principles rather than copying Apple branding. It uses the operating system's UI font stack and small custom SVG symbols; it does not redistribute SF Pro or SF Symbols.

- **Hierarchy before decoration:** opaque neutral surfaces carry reading content, while translucent material is reserved for persistent navigation and command layers. See Apple HIG [Foundations](https://developer.apple.com/design/human-interface-guidelines/) and [Materials](https://developer.apple.com/design/human-interface-guidelines/materials).
- **Adaptive composition:** compact widths keep five short symbol-and-label destinations in one row, stack competing controls, and place study details in normal flow so no toolbar or visual note blocks them. See [Layout](https://developer.apple.com/design/human-interface-guidelines/layout) and [Sidebars](https://developer.apple.com/design/human-interface-guidelines/sidebars).
- **Legibility and clear action priority:** system typography, a restrained weight scale, semantic contrast, one filled primary action, and sentence-case labels replace ornamental type and equally weighted controls. See [Typography](https://developer.apple.com/design/human-interface-guidelines/typography) and [Color](https://developer.apple.com/design/human-interface-guidelines/color).
- **Direct, accessible interaction:** important controls retain at least 44px hit regions, keyboard focus is visible, tabs support arrow/Home/End navigation, and reduced-motion, reduced-transparency, and higher-contrast preferences have explicit fallbacks. See Apple's [UI design tips](https://developer.apple.com/design/tips/) and [Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility/).

## Why NeatMind

| Need | NeatMind approach |
|---|---|
| Trust | Visual concepts and quiz questions retain source evidence; backend quiz answers additionally require a provider semantic verdict against their quoted evidence. |
| Active learning | Quiz generation validates option quality and records submitted performance separately from passive activity. |
| Persistence | Notes, quizzes, sources, timestamps, and demonstrated progress survive outside a disposable chat. |
| Cross-site study | A chapter combines explicitly selected sources without crawling unrelated tabs or links. |
| Video verification | Caption times are labelled caption-grounded; automatic transcript times are labelled AI-estimated. |
| Focus | A simple persistent session blocker is built into the study flow without claiming full LeechBlock parity. |

## Market Evidence Behind The Priorities

This section is a directional product-research sample checked on 11 July 2026. Reddit posts are anecdotal, self-selected, and not representative of all students. Counts overlap across a 14-thread review and should not be interpreted as population prevalence.

| Recurring theme | Mentions in sample | Product response |
|---|---:|---|
| Trust, depth, and verifiability | 6 | Strict source IDs, evidence overlap checks, source chips, transcript confidence, and stale-source rejection. |
| Workflow and persistence | 4 | Saved artifacts, cross-site chapters, exports, and the dated Journey. |
| Pricing and quota clarity | 4 | Keep saved work accessible and show any future metered AI allowance before generation. |
| Active-learning quality | 3 | Distinct plausible choices, difficulty/style controls, progressive hints, and mastery based on submitted work. |
| Focus-blocker balance | 2 | Start with a simple configurable session blocker; add strict/scheduled modes only with clear escape behavior. |
| Video navigation | 2 | Lead with timestamped evidence and one-click return to the exact moment, not a transcript dump. |

Representative discussions:

- [r/studytips: why students do or do not use AI quiz generators](https://www.reddit.com/r/studytips/comments/1mk2br0/do_you_actually_use_ai_quiz_generators_if_not_why/)
- [r/studytips: passive AI explanations and false confidence](https://www.reddit.com/r/studytips/comments/1uogrex/i_used_ai_it_goes_horribly_wrong/)
- [r/notebooklm: mistakes, interface complexity, and source setup](https://www.reddit.com/r/notebooklm/comments/1r6ndqd/why_most_people_dont_use_notebooklm_for_studying/)
- [r/notebooklm: shallow summaries for logic-heavy coursework](https://www.reddit.com/r/notebooklm/comments/1o1dhc9/beware_of_relying_on_notebooklm_for_schoolwork/)
- [r/notebooklm: saved citation navigation regression](https://www.reddit.com/r/notebooklm/comments/1hii8h6/not_able_to_get_the_source_citations_after_the_recent_update/)
- [r/CollegeStudywithAI: saved quizzes versus disposable chat](https://www.reddit.com/r/CollegeStudywithAI/comments/1qk5soq/what_ai_tools_are_you_actually_using_for_studying/)
- [r/productivity: why people abandon website blockers](https://www.reddit.com/r/productivity/comments/1qhm7sr/what_makes_you_stop_using_website/)
- [r/youtube: timestamp navigation as the valuable summarizer behavior](https://www.reddit.com/r/youtube/comments/1upjh6v/summary_feature_actually_saved_my_time/)

## Comparable Products And Business Models

The comparison uses official product or pricing pages for business claims. Plans and limits can change.

| Product | What it does especially well | Business pattern | Lesson for NeatMind |
|---|---|---|---|
| [NotebookLM](https://support.google.com/notebooklm/answer/16213268) | Source workspaces, grounded chat, mind maps, quizzes, and overviews | Free standard limits plus higher-limit Google AI, Workspace, and enterprise plans | Source grounding and workspace clarity matter more than generic chat breadth. |
| [Recall](https://app.getrecall.ai/pricing) | Persistent knowledge graph, summaries, chat, quiz, and spaced repetition | Freemium subscription tiers | The saved knowledge graph and review loop justify recurring value. |
| [Glasp](https://glasp.co/pricing) | Web/PDF/video highlighting, discovery, summaries, and export | Free core plus Pro subscription and student discount | Capture and export can stay free while higher AI usage is metered. |
| [Knowt](https://knowt.com/plans?tab=Plus) and [Quizlet](https://quizlet.com/features/ai-study-tools) | Established practice modes, content libraries, imports, and school workflows | Free entry plus learner/institution subscriptions | Practice quality and migration are stronger differentiators than summary generation. |
| [Eightify](https://eightify.app/) | Fast timestamped YouTube topics and jumps | Free installation with paid in-app access | Video value should be visible immediately through topics and exact moments. |
| [MaxAI](https://www.maxai.me/pricing/) and [Sider](https://sider.ai/pricing) | Broad page/PDF/video assistants and multiple models | Free allowances plus subscriptions or usage credits | Competing on feature count is unattractive; NeatMind should stay learning-specific. |
| [LeechBlock NG](https://chromewebstore.google.com/detail/leechblock-ng/blaaajhemilngeeffpbfkdjjoefldkok) | Highly configurable browser blocking | Free/open source | Basic browser-only blocking has a strong free expectation. |
| [Freedom](https://support.freedom.to/en/articles/13764747-what-s-included-in-free-and-premium-plans) | Cross-device blocking, schedules, exceptions, and locked sessions | Free immediate sessions plus Premium scheduling/strict controls | Advanced cross-device and scheduled controls, not the basic timer, can support paid value. |

The strongest positioning opportunity is the integrated evidence-to-mastery loop. That conclusion is an inference from the products' official positioning, not a claim that no other competing product exists.

## Business Model Hypothesis

No payment or quota system is implemented in this repository. The proposed model is:

### Free and always accessible

- manual page, note, and captioned-video study
- saved Journey history and previously generated artifacts
- basic visual lessons and quizzes
- manual cross-site source collection
- Word/PDF export
- timed Focus sessions and custom domain/path rules
- local deterministic fallback and optional self-hosted backend

### Potential metered or premium capabilities

- captionless-video processing, because it has direct media-compute cost
- larger source collections and higher AI-generation limits
- advanced practice such as typed recall and answer evaluation beyond the existing adaptive review interval
- scheduled/rolling Focus rules and optional strict mode
- team, classroom, and institution administration after privacy and teacher controls mature

Product principles for any future paid version:

- show the remaining allowance before the user starts an expensive action
- never lock notes, quizzes, citations, or exports that were already generated
- offer a student-oriented annual plan and verified discount only after pricing research
- retain bring-your-own-backend/local fallback to reduce cost and increase user control

## Install, Configure, And Pair The Local Backend

Requirements:

- Chrome 116 or newer
- Node.js 18 or newer
- one supported provider key for note and quiz generation; automatic public-video analysis and tab-audio transcription specifically require a Gemini key

1. Install the locked dependencies and build the allowlisted unpacked extension:

   ```powershell
   npm ci
   npm run package:extension
   ```

2. Open `chrome://extensions`, enable Developer mode, choose **Load unpacked**, and select `release/neatmind-extension`. Do not load or distribute the project root; the release folder contains only the runtime files listed by `scripts/extension-files.mjs`.
3. Copy the extension ID shown by Chrome. Use only that value in the origin setting described below; do not add it to source files or documentation.
4. Copy the environment template and edit the private copy:

   ```powershell
   Copy-Item .env.example .env
   ```

5. Choose one note-generation provider in `.env`. The default Gemini configuration uses `AI_PROVIDER=gemini`, `GEMINI_API_KEY`, and `GEMINI_MODEL`. The alternative uses `AI_PROVIDER=openai`, `OPENAI_API_KEY`, and `OPENAI_MODEL`; a Gemini key is still required if automatic video transcription is needed.
6. Set the exact loaded-extension origin, with no trailing slash:

   ```text
   ALLOWED_EXTENSION_ORIGINS=chrome-extension://your-32-character-extension-id
   ```

7. Keep the bounded defaults from `.env.example` unless you have a measured reason to change them. They control provider timeouts, concurrent API work, requests per minute, request-body bytes, and maximum study, note, and collection text.
8. Leave `BACKEND_ACCESS_TOKEN` blank to generate a private token file for non-extension clients, or supply a strong private token through the environment. Never commit `.env`, the generated token file, provider keys, tokens, browser profiles, screenshots, or logs.
9. Start the loopback backend:

   ```powershell
   npm start
   ```

10. In NeatMind Settings, keep the bundled endpoint and leave the token field empty:

    ```text
    Endpoint: http://127.0.0.1:8787/api/study-session
    Backend access token: leave blank for the allowlisted bundled backend
    ```

11. Open a study page and choose **Allow this site** if the access banner appears. Chrome grants only that current website pattern; NeatMind reads the page only after an explicit study or save action. Repeat this step separately for another website when needed.

The provider key stays in the backend `.env` and is never placed in the extension. The bundled server accepts tokenless API posts only when it is listening on loopback, the socket is loopback, and Chrome supplies an exact origin listed in `ALLOWED_EXTENSION_ORIGINS`. Preview pages, missing or different origins, and other clients require the generated or configured bearer token. A supplied wrong token is rejected even when the request uses the trusted extension origin.

Health check:

```text
http://127.0.0.1:8787/health
```

## Preview

Run the local interface preview in another terminal:

```powershell
npm run preview
```

Open `http://127.0.0.1:8788`, choose **Create** from Dashboard, select **Paste Notes**, and choose **Try 60-sec math demo**. It loads a curated source, an evidence-linked visual note, and a one-question check without backend configuration. Open `http://127.0.0.1:8788/journey.html` to inspect the full Learning Forest route. Browser tab reading, blocking, timestamp jumping, the persistent side panel, and tab-audio capture require the loaded extension.

## Side Panel And Page Access

- The panel stays open while switching tabs and navigating across origins. Chrome's native side-panel close button is the explicit close control.
- When the active HTTP/HTTPS page has not been granted, the panel shows **Allow this site** and requests only that site's origin pattern. Declining leaves the panel usable without reading the page; no global all-sites grant is part of onboarding.
- Remote document hosts, the optional local-file capability, Focus destinations, and a custom backend origin use separate just-in-time permission requests. A custom backend must use HTTPS unless it is a loopback address.
- **Current page** reports the live browser title, domain, readability/permission state, and selected Journey chapter.
- **This note is from...** always identifies the pinned artifact separately. Refreshing page context never replaces the pinned note or quiz.
- The panel autosaves the selected tool view, pasted notes, stable selected chapter ID, settings choices, pinned artifact, and in-progress quiz answers. A saved custom-backend token is bound to that endpoint's origin and is cleared rather than reused if the origin changes.
- If Chrome reports `Only permissions specified in the manifest may be requested`, reload NeatMind from `chrome://extensions`; the running extension is still using an older manifest.

### Required reload after updating an unpacked build

Refreshing the side panel is not the same as reloading the extension. A refreshed panel can load newer UI files while Chrome still runs the previous service worker, which produces errors such as `The message port closed before a response was received`.

1. Close the NeatMind side panel.
2. Open `chrome://extensions`.
3. Find NeatMind and choose **Reload**.
4. Open the video page and start playback.
5. Click the NeatMind toolbar icon to open the global panel.
6. Choose **Create note from video**, then **Auto-transcribe** and **Start tab audio** if the video has no usable captions.
7. Keep that playing video tab active and click the NeatMind toolbar icon once more, or press `Ctrl+Shift+Y`. This authorizes the exact armed request and starts recording automatically.

NeatMind performs backend preflight before the final toolbar invocation and never stores an unused Chrome stream ID. Navigation intentionally cancels the armed request; on the new video page, press **Start tab audio** again and then use the toolbar action once to authorize and start it.

## Core Workflows

### Study and record a page

1. Open an HTTP or HTTPS article or documentation page.
2. Choose **Allow this site** if Chrome has not already granted that website.
3. Select an existing Journey chapter, or choose **New chapter**, enter a unique name, and create it. One chapter is one Learning Forest tree.
4. Choose **Create note from page**.
5. Review the key points and grounded cheat sheet, then explore the connected mind map and inspect the selected concept's source evidence.
6. Choose **Generate quiz** only when you want practice, select the settings, and submit it to record demonstrated mastery.

Generation checks the tab ID, canonical URL, and content fingerprint before showing the result. A page changed during generation cannot replace the current quiz.

### Study HTML and PDF documents

- For an open web HTML page, choose **Create note from page**.
- NeatMind combines readable content from the top page, accessible child frames, and open shadow roots. Hidden, inert, navigation, form, script, style, canvas, and duplicate content are excluded within strict node, time, chunk, and text budgets.
- For an open PDF URL, grant that document host when requested and choose **Create note from page**. The PDF is fetched without cookies, parsed locally, and only bounded extracted text enters the normal note-generation path.
- For a local `.html`, `.htm`, or `.pdf`, choose **Open HTML or PDF file**. This file picker works even when Chrome's file-URL toggle is off.
- To read a local file already open in a Chrome tab, enable **Allow access to file URLs** on NeatMind's `chrome://extensions` details page, then refresh the source.
- Password-protected PDFs must be unlocked and saved as an unprotected copy. Image-only/scanned PDFs require an OCR copy because NeatMind does not upload pages for silent OCR. These cases, malformed PDFs, and PDFs with too little selectable study text receive PDF-specific messages rather than the HTML readability error.

Selecting a document prepares it as the current source; choose **Create note from document** to generate the visual note. **Refresh page** clears the selected file and returns the source card to the active browser tab.

### Collect across websites

**Save source to chapter** is collection, not note generation. It stores a bounded snapshot of the selected readable page/document or supported video transcript under the currently selected stable chapter ID. The action does not create a visual note, quiz, or additional tree.

1. Select an existing chapter or use **New chapter** to create the tree that should own the collection.
2. On each intended page, allow that website if prompted and choose **Save source to chapter**.
3. Repeat on other websites or supported videos, selecting the same chapter each time.
4. Open Journey, select that chapter, and choose **Build chapter visual note** to generate one grounded combined note from its saved sources.

- collection is always explicit; the extension never crawls links or silently reads other tabs
- saving the same source fingerprint again refreshes or deduplicates that source instead of adding an indistinguishable copy
- all included sources receive an even bounded excerpt instead of silently dropping later sources
- the server requires every generated citation to name a supplied source ID and overlap that source's evidence
- finalization rechecks the chapter source revision atomically

### Explore further without blurring evidence

When a chapter has weak concepts, Journey offers a collapsed **Explore further (external)** lane for each one. These are opt-in links to external study searches and are labelled as external, not evidence-checked, and styled separately from source-backed artifacts. Choosing **Open and prepare to save** opens the page and preselects the same chapter in NeatMind; the learner must review it and explicitly choose **Save source to chapter**. Only then does the page become a bounded source snapshot and enter the normal grounding loop.

### Study a video

The extension tries:

1. loaded HTML5 captions
2. a rendered transcript, including an open YouTube transcript panel
3. a timestamped transcript the user deliberately pasted for that bound video
4. automatic public-YouTube analysis through Gemini
5. explicit audio-only tab capture for the detected playing tab

NeatMind no longer depends on YouTube's private player-response or caption-track URLs. Those internal endpoints are not a stable extension interface; unopened captions therefore fall through to the documented Gemini public-video route or the explicit tab-audio path.

For tab capture:

- the video must be playing before capture begins
- the user sees a consent dialog and a persistent `REC` badge
- **Start tab audio** binds a 60-second armed request to the detected tab, canonical URL, and exact media fingerprint; it does not ask Chrome for a stream ID or begin recording yet
- the next NeatMind toolbar action—or `Ctrl+Shift+Y` / `Command+Shift+Y` action shortcut—supplies Chrome's qualifying invocation, creates the one-use stream ID in the service worker, and immediately starts the offscreen recorder; there is no second Start click
- before `REC`, the worker checks the Gemini backend, exact extension-origin allowlist, optional custom token, and provider key; the bundled loopback backend does not require a token to be copied into Settings
- `REC` advances from live input before the first transcript response and reports elapsed audio, signal, total chunks, processing/transcribed/failed chunk counts, and validated timestamped segments separately
- every emitted chunk must finish with at least one valid segment or a persisted provider error; a failed request can no longer leave the interface indefinitely at `0 segments`
- if Chrome supplies no samples or the tab remains silent, capture stops with a direct instruction to play the video and unmute both the player and tab
- navigation, tab closure, expiry, consent dismissal, or a source mismatch clears the armed request; press **Start tab audio** on the intended video again, then use the toolbar action once
- capture is limited to 15 minutes and continues if the side panel closes
- pause, seek, and playback-rate changes create new timestamp mapping boundaries
- the extension captures the selected tab, not the microphone
- transient WAV uploads are normally emitted every 15 seconds and are hard-limited to 45 seconds; they are immediately discarded, and raw audio is never written to extension storage or logs
- navigation or media replacement aborts the job and discards its transcript evidence

Chrome exposes current-tab media through [`chrome.tabCapture`](https://developer.chrome.com/docs/extensions/reference/api/tabCapture). Gemini supports [inline audio understanding](https://ai.google.dev/gemini-api/docs/generate-content/audio) and [public YouTube video input](https://ai.google.dev/gemini-api/docs/generate-content/video-understanding).

Publisher-caption timestamps are labelled `caption-grounded`, pasted timestamp transcripts are labelled `user-provided`, and automatically generated timestamps are validated, bounded to the video, and labelled `AI-estimated`; the latter two may still be approximate.

### Learning Journey

The compact panel route and full Learning Forest page show:

- explicit **New chapter** actions in Page, Notes, and Journey; a chapter can exist as an empty named tree before any source or note is added
- one planting plot per user-named Journey chapter on an adaptive serpentine ribbon; the ribbon creates only the chapters that exist and never pads a four-chapter journey with numbers 05–11
- grounded growth stages based on saved learning units: Visual Tutor Notes and distinct saved sources each contribute one unit; 0 units is an empty plot, 1–2 is a seedling, 3–5 is a normal tree, and 6 or more is a huge tree
- a stage-accurate bronze particle plant for every non-empty chapter in the overview, with the shared hardware-aware particle budget distributed across the forest so journeys of up to 24 chapters remain visible and bounded
- focused trees and their dimmed background plants share that same hardware-tier ceiling; focus increases the selected plant's detail without stacking a second unbounded particle pool
- a completion pulse at the base of chapters whose latest submitted quiz reaches the existing 80% completion threshold
- up to eight meaningful Visual Tutor Note branches per chapter; repeated builds from the same exact source revision or combined-source composition collapse to the newest branch, while older artifacts remain available in the Library
- saved source snapshots for pages, notes, documents, and videos inside the focused tree drawer
- generation activity separately from submitted performance
- chapter state based on the latest submitted quiz
- source count, study days, average score, and elapsed Focus session time
- a bounded overall summary for today, seven days, 30 days, or all time
- responsive saved-artifact cards whose **Open note** action restores the exact local note or quiz
- a complete list fallback when WebGL or hardware acceleration is unavailable

Learning Forest interaction model:

1. Choose **New chapter** from Page, Notes, or Journey, name it, and select it. The Journey writer creates an empty chapter with a stable ID; using an existing name selects the existing chapter rather than creating a title-based duplicate.
2. Notes, saved sources, quizzes, and forest selection carry that stable chapter ID. Similar chapter or artifact titles are not used to merge unrelated records.
3. With one chapter, its saved-unit growth stage is centered, the ribbon shows only 01, and up to eight newest distinct Visual Tutor Note branches are available immediately.
4. With multiple chapters, every stage-accurate plant remains visible in stored chapter order along the S-shaped ribbon. The currently selected chapter moves in the overview; hovering, touching, or keyboard-focusing another bottom-index chapter temporarily starts that matching plant too. Direct contact with a rendered grain also starts its tree, while blank canvas and the tree's surrounding hit box do not. Drag to orbit the 360-degree overview.
5. Select a plot or chapter number to glide toward that tree without changing its seedling, normal, or huge stage. Select a Visual Tutor Note branch to fly to its mapped location and open that exact stable artifact in the centered bottom drawer.
6. The bottom drawer shows the selected Visual Tutor Note, cheat sheet, quiz and source evidence, dates, and chapter status; **Open full note** restores the same artifact in the side panel. **Journey summary** retains its range-based overall progress view.
7. Use **Back to forest** or `Escape` to leave a focused tree or note. In the overview, the selected tree keeps its wind and contour flow; particle contact and bottom-index hover, touch, or focus add temporary motion to their matching trees. Use **Pause motion** to disable all forest motion without disabling tree selection, 360-degree orbit, zoom, or evidence access; focused-tree motion keeps its existing behavior.

The layout treats the canvas as the primary content region and the evidence drawer as auxiliary information. Desktop uses a centered bounded bottom panel rather than a right-side inspector; narrow viewports use a single-column bottom sheet and a horizontally scrollable chapter index. The ribbon and connectors are non-interactive decoration, while every plot, index entry, Visual Tutor Note branch, and command remains a real HTML button. Controls retain visible 2px keyboard focus, pointer targets are at least 40px high, and `prefers-reduced-motion` starts the forest paused and turns the completion pulse into a static ring. These choices follow the responsive-region guidance in [GitHub Primer](https://primer-docs-preview.github.com/product/getting-started/foundations/layout/) and the target-size, focus, and motion guidance in [WCAG 2.2](https://www.w3.org/TR/WCAG22/).

The renderer is bundled locally for extension CSP compliance. After editing `journey-tree/`, rebuild it with:

```powershell
npm run build:journey
```

The service worker is the sole Journey writer. Operations are serialized, idempotent, and revision checked so an open full Journey page cannot overwrite a newly captured source or score.

### Focus mode

Focus is a timed session blocker, not a full LeechBlock clone.

1. Choose a preset or any whole-minute duration from 1 to 720.
2. Enter one domain or path per line, such as `reddit.com` or `youtube.com/shorts`.
3. Start Focus and approve access only to those origins.
4. Take the fixed five-minute break or end the session at any time.

The MV3 worker stores an absolute deadline, recreates alarms after restart, installs top-level session rules, and removes them after stop/expiry. The displayed metric is elapsed Focus session time, including breaks.

## Evidence, Privacy, And Limitations

- Generated content can still be incomplete or wrong; inspect the linked source before relying on it.
- AI-estimated transcript times are not equivalent to publisher captions.
- Public YouTube URL support depends on Gemini's current preview capability and provider limits.
- Private/unlisted YouTube videos, DRM players, closed shadow roots, frames for which Chrome has not granted access, and videos without detectable audio may require a local HTML/PDF file, captions, or a pasted transcript.
- Journey data, saved sessions, focus history, and completed automatic transcripts are stored in extension-local storage.
- Page/video reading and tab capture are explicit user actions.
- HTML/PDF reading is explicit. Remote PDFs are fetched without cookies or a referrer; local file-picker input stays in memory until a note is created. Only bounded extracted text is stored with the source-grounded note and sent to the configured backend; raw PDF bytes are never stored or exported.
- PDF JavaScript evaluation is disabled. Attachments, forms, actions, and external links inside a PDF are not executed by the reader.
- Website access is granted per site through **Allow this site**. Focus separately requests only the distracting-site origins still missing, and NeatMind does not inspect browsing history.
- The local backend binds to `127.0.0.1`, validates the exact configured extension Origin, and permits that trusted loopback extension to connect without manual token entry. Other clients require the separate access token.
- Provider keys exist only in the backend `.env`. A custom backend token is stored in extension-local settings, which is convenient but is not an operating-system password vault; use a scoped token and protect the browser profile.

## Security And Publication

No application can be guaranteed impossible to compromise. NeatMind reduces exposed authority, validates trust boundaries, bounds resource use, and adds repeatable release checks. See [SECURITY.md](SECURITY.md) for the supported release line, credential-response guidance, and private reporting process.

### Runtime protections

- Extension pages use a manifest CSP that loads scripts only from the extension package, disables plugin objects, and prevents a document base URL from being redirected. No provider key is bundled into extension code.
- Page, document, Focus, and custom-backend permissions are requested only for the relevant site or origin when an action needs them. External source links are restricted to expected safe schemes.
- Custom remote backend URLs must use HTTPS; unencrypted HTTP is accepted only for `localhost` and loopback addresses. URL credentials are stripped during normalization.
- Saved bearer tokens are associated with one backend origin. Changing the endpoint origin clears a reused token, and request builders omit the token when a derived URL does not match its stored origin.
- The bundled backend listens only on `127.0.0.1`. Tokenless API access requires both a loopback socket and an exact configured extension Origin. Other allowed clients must present the generated or configured bearer token, which is compared in constant time.
- API posts must use JSON. Declared and streamed bodies are bounded, provider requests have timeouts, concurrent work is capped, and a per-origin/address minute bucket returns `429` when the configured limit is exceeded.
- Backend and preview responses set no-store/MIME/framing/referrer/permissions protections and restrictive CSP headers. Server errors redact configured keys, tokens, authorization values, and credential query parameters before logging or returning a generic failure.
- Page text, notes, transcripts, and collection blocks are handled as untrusted source data rather than executable instructions. Generated structures are schema checked and evidence checked before storage. Backend quiz answers additionally require a separate provider-backed semantic verdict against their quoted evidence; missing, malformed, or unsupported verdicts fail closed. The no-key local and curated paths remain deterministic/extractive and lexically checked.

### Secrets and local configuration

- Start from `.env.example`; it documents Gemini and OpenAI provider selection, the exact extension-origin allowlist, preview origins, token behavior, and bounded resource controls.
- Keep `.env`, `.env.*`, the generated token file, certificates, credentials, browser profiles, logs, test screenshots, coverage, and release output out of Git. `.env.example` is the only environment template intended for source control.
- If a credential is exposed, revoke or rotate it at the provider first. Deleting it from a later commit does not remove it from Git history.

### Local release checks

```powershell
npm run security:secrets
npm run security:audit
npm run package:extension
```

- `security:secrets` scans publishable text for common credential formats, private-key material, personal home paths, non-placeholder email addresses, and exact locally configured secrets; it also verifies the required ignore rules. It is a guardrail, not a substitute for reviewing the staged diff.
- `security:audit` runs the publish-safety scan and fails on high-severity npm advisories.
- `package:extension` rebuilds bundled dependencies, deletes the previous package directory, and copies only the explicit runtime allowlist into `release/neatmind-extension`. Load, inspect, or zip that folder rather than the project root.

### GitHub safeguards

- `.github/workflows/ci.yml` installs the lockfile, scans for secrets and personal paths, checks syntax, runs the complete test suite, audits production dependencies, builds the allowlisted extension folder, and uploads it as a short-retention workflow artifact. Third-party Actions are pinned to commit SHAs.
- `.github/workflows/codeql.yml` analyzes JavaScript on pushes, pull requests, and a weekly schedule with least-privilege workflow permissions.
- `.github/dependabot.yml` checks npm dependencies weekly and GitHub Actions monthly.
- Security reports should use the private vulnerability-reporting link in [SECURITY.md](SECURITY.md), never a public issue containing credentials, private study content, or exploit details. Private vulnerability reporting is a GitHub repository setting and must remain enabled by the repository owner after publication.

## Export

Open a generated or saved item and choose **Export**. The unified preview shows the filename, source, and selectable sections: Visual note, Key points, Sources, Quiz, and Answer key.

- **Download DOCX** creates an editable OOXML `.docx` locally in the browser.
- **Download PDF** creates a genuine `.pdf` directly, without the print dialog.
- Quiz sections remain unavailable until a quiz exists. The answer key defaults off before submission and on after submission.
- Raw captured page text and raw audio are excluded; the static connected visual, bounded cheat-sheet rows, citations, source links, PDF pages, and video timestamps are preserved.

Automatic transcript times retain the `AI-estimated` label in exported evidence.

## Backend Routes

Protected routes (exact allowlisted loopback extension Origin, or a valid bearer token for other allowed clients):

- `POST /api/study-session`
- `POST /api/notes`
- `POST /api/quiz`
- `POST /api/visual-followup`
- `POST /api/journey-summary`
- `POST /api/video-transcript`
- `POST /api/transcript-chunk`
- `POST /api/transcript-preflight`

`POST /api/notes` accepts `webpage`, `notes`, `video`, or `collection` source types, returns a visual note plus its five-column grounded cheat sheet, and never returns quiz questions. `POST /api/quiz` requires a saved note ID plus the same source fingerprint and returns questions only after lexical checks and a provider-backed semantic verification pass covers every answer against its quoted evidence. `POST /api/study-session` remains the legacy combined adapter and uses the same quiz verification when it generates questions. Video requests carry stable transcript segment IDs; collection requests carry bounded source blocks and saved-source IDs.

## Verification

```powershell
npm run build
npm run check
npm test
npm run security:secrets
npm run security:audit
npm run package:extension
```

The complete automated suite covers real DOCX/PDF exports, grounded cheat-sheet sanitization and responsive semantics, PDF-backed source labels, multi-frame/open-shadow HTML extraction, multilingual readability, adversarial HTML/PDF bounds, genuine PDF text parsing, PDF-specific failure states, per-site and file-permission contracts, Focus-rule lifecycle, empty stable-ID chapter creation, duplicate-name resolution, cross-chapter isolation, Journey schema migration and document metadata, per-concept ease-factor scheduling, difficult-versus-mastered review intervals, exact artifact handoff, Learning Forest saved-unit growth stages, external-resource separation and save-to-chapter handoff, persistent stage-accurate overviews, exact-count ribbon entries, stable Visual Tutor Note branch IDs, responsive bottom-drawer behavior, motion pausing, stable 360-degree orbit dragging, reliable branch activation, connected 3/5/8-concept mind maps, keyboard/reflow behavior, non-obscuring narrow action controls, collection provenance and deduplication, lexical and provider-semantic quiz verification, quiz isolation, endpoint-bound tokens, exact-origin loopback authentication, wrong-token and wrong-origin rejection, JSON-only API posts, defensive response headers, visible-caption and public-YouTube routing, stable video identity, executable service-worker action authorization, expiry and changed-page rejection, source-bound one-use stream reservations, reply-before-teardown behavior, live audio health/progress, explicit zero-segment failure, transcript binding, audio chunk limits, timestamp mapping, and WAV encoding.

## Market-Informed Roadmap

Priority order:

1. Continue trust work: visible evidence chips, coverage indicators, bad-question reporting, and evaluation fixtures for factual/citation accuracy.
2. Improve active recall: typed answers, explain-in-your-own-words prompts, better distractor evaluation, and optional answer editing.
3. Extend the current adaptive review interval with typed recall and learner-selected reminder delivery.
4. Add transparent AI usage metering without restricting saved work.
5. Add optional research unlocks, rolling per-site allowances, weekday schedules, and strict Focus mode.
6. Consider Firefox only after the Chrome capture, storage, and permission paths are stable.
7. Explore institution licensing only after privacy documentation, educator controls, and reliability benchmarks are mature.
