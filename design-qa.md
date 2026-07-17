# Journey hourglass and chapter timeline QA

- Source visual truth, average mask defect: local capture `codex-clipboard-63a432fb-a5db-4974-95e4-6b55e4025cf0.png` (not included)
- Source visual truth, chapter timeline: local capture `codex-clipboard-f1df2799-0319-48be-8af4-153f282baa29.png` (not included)
- Browser-rendered desktop metrics capture: local capture `journey-average-mask-final-desktop.png` (not included)
- Browser-rendered desktop timeline capture: local capture `journey-timeline-final-desktop.png` (not included)
- Browser-rendered mobile timeline capture: local capture `journey-timeline-final-mobile.png` (not included)
- Desktop viewport: `842 x 820`.
- Mobile viewport: `360 x 640`.
- Local data state: Progress `0%`, Average unscored, Focus `0m`. The Average reference shows `40%`, so its active sand fill could not be reproduced without changing stored learning data.

**Comparison Evidence**

- The Average source and final desktop metric capture were opened together in one visual comparison input.
- The timeline source and final desktop and mobile captures were opened together in one visual comparison input.
- The focused mask inspection confirmed the source PNG corners are fully opaque black and that the rendered top and bottom Average reservoirs now compute to `mask-mode: luminance`.
- The selected Current chapter row was captured in its active state. It retains one title, one date, and one status chip.

**Findings**

- [P2 fixed] Average sand escaped the glass chamber.
  Location: `.journey-hourglass__reservoir` and the Average top and bottom reservoirs in `popup.css`.
  Evidence: The supplied defect showed two rounded yellow blobs crossing the glass outline. Asset inspection found black source-mask pixels with alpha `255`, so alpha masking exposed the entire reservoir rectangle.
  Impact: The Average panel looked broken whenever a score produced visible sand.
  Fix: Use luminance mask mode, move the reservoirs to the measured chamber bounds, remove the sand's independent rounded clipping, and align the stream with the glass neck.
  Post-fix evidence: The browser-rendered unscored state shows the clean glass shell with no escaped fill; the computed reservoir mask mode is `luminance`. The score-dependent fill behavior remains driven by the existing metric pipeline.

- [P2 fixed] The chapter list did not match the requested active-timeline hierarchy.
  Location: `.journey-route` and `.journey-node` in `popup.css`.
  Evidence: The earlier compact numbered rows lacked the full-width soft-blue active surface, generous rail spacing, and clear title/date/status rhythm of the reference.
  Impact: The current chapter was hard to distinguish in a long learning history.
  Fix: Use a 52px circular chapter marker on a continuous light rail, 86px desktop rows, a soft-blue selected surface, one right-aligned status chip, and a compact stacked mobile state.
  Post-fix evidence: `journey-timeline-final-desktop.png` shows the selected Current chapter as one soft-blue row; `journey-timeline-final-mobile.png` shows the state chip below the title/date without overflow.

- [P3] The reference uses document pictograms; the implementation retains existing sequential chapter markers.
  Location: `.journey-node-orb`.
  Evidence: The visual hierarchy, rail, selected state, metadata, and status placement match, while the available product assets contain no compatible document icon.
  Impact: Minor visual difference only; the chapter order is directly legible.
  Follow-up: Replace the sequence marker with a supplied or product-standard document icon when one becomes available.

**Fidelity Review**

- Fonts and typography: The timeline keeps strong title weight, muted 12px date metadata, and one readable 12px status chip. The metric labels, values, and semantic states keep the existing Journey hierarchy.
- Spacing and layout rhythm: The desktop timeline uses a consistent 58px rail column, 16px content gap, 86px row cadence, and 22px selected-row radius. Mobile reduces the rail and places the chip on its own second line.
- Colors and visual tokens: The selected row uses a restrained blue surface and border, current markers use a subtle blue ring, and status colors continue to distinguish progress, review, completion, and planned states without color-only communication.
- Image quality and asset fidelity: The existing glass, sand textures, and focus image remain the only metric artwork. No replacement asset, CSS drawing, SVG, placeholder, or generated image was introduced.
- Copy and content: Chapter sort order, labels, activity dates, status wording, selection behavior, saved artifacts, and metric values remain data-driven and unchanged.

**Accessibility and Runtime**

- Chapter rows remain buttons with `aria-pressed`; the selected row retains `aria-current="step"`.
- The focus-visible outline, touch-sized rows, and mobile status reflow remain available.
- Decorative metric artwork is still hidden from assistive technologies.
- At `360px`, document client width and scroll width both measured `345px`; no horizontal overflow occurred.
- Browser console errors: `[]`.

**Validation**

- `node --test tests\popup-journey-responsive.test.js`: passed, 25 tests.
- `npm run test`: passed, 369 tests.
- `npm run check`: passed.
- `git diff --check`: passed; only pre-existing line-ending warnings were reported.

final result: passed
