# Frontend Wizards — Stage 1a Todo Card

An interactive, stateful, and accessible todo card component built for the Stage 1a frontend task. Extends Stage 0 with editing, status transitions, priority indicators, expand/collapse, and dynamic time management.

## Files

- `index.html` — semantic markup with all required `data-testid` attributes.
- `styles.css` — responsive styling for mobile, tablet, and desktop layouts.
- `script.js` — full state management, edit mode, status sync, time logic, and accessibility behavior.

## Run locally

Open `Frontend/todo-card/index.html` in your browser or preview it with a local static server (e.g. VS Code Live Server).

---

## What changed from Stage 0

| Area | Stage 0 | Stage 1a |
|---|---|---|
| Edit mode | `prompt()` dialog | Inline edit form with full fields |
| Status | Display only badge | Synced dropdown control + badge |
| Priority | Click-to-cycle badge | Visual indicator strip + edit form select |
| Description | Always fully visible | Collapsible with show more / show less |
| Time display | Updates every 60s | Updates every 30s, granular (hours/minutes) |
| Overdue | Red text only | Red text + explicit "⚠ Overdue" badge |
| Done state | Checkbox only | Checkbox, status control, and badge all synced |
| Keyboard flow | Basic tab order | Defined flow: Checkbox → Status → Expand → Edit → Delete |
| Responsiveness | Mobile + desktop | 320px / 768px / 1024px+ breakpoints |

---

## New design decisions

**Edit form always visible**
The edit form is permanently shown below the card view rather than toggling in on Edit click. This removes an extra interaction step and lets users see and modify task details at a glance. Clicking the Edit button focuses the title input and snapshots the current values so Cancel can undo any unsaved changes.

**Priority indicator as top accent strip**
Priority is shown as a 3px colored bar across the top of the card (orange = High, yellow = Medium, green = Low). This gives an instant at-a-glance signal without cluttering the content area.

**Status driven by `data-status` attribute**
The card element's `data-status` attribute drives all status-related visual states through CSS — done strikethrough, in-progress border, pending mute — keeping styling declarative and JS minimal.

**`[hidden]` CSS override**
A global `[hidden] { display: none !important; }` rule is added at the top of the stylesheet. Without it, any element that has a CSS `display` property set (flex, inline-flex) will ignore the HTML `hidden` attribute because author stylesheets take priority over browser defaults. This ensures the overdue indicator and other conditionally hidden elements behave correctly.

**Expand/collapse uses `max-height` transition**
The collapsible description uses a CSS `max-height` transition with a gradient fade overlay. The `scrollHeight` is read before class changes so the animation has a correct start/end point in both directions.

---

## Known limitations

- **Expand/collapse on wide screens** — if the description text wraps to only 2 lines on a wide viewport, the collapsed state may look visually similar to the expanded state since both fit within the `max-height` constraint. The toggle button still functions correctly.
- **No persistence** — task state is held in JS memory only. Refreshing the page resets all values to defaults.
- **Single card only** — this is a component demo, not a full task list. Adding/removing multiple cards is out of scope.
- **Date input browser styling** — the due date `<input type="date">` appearance varies across browsers. A custom date picker is not implemented.

---

## Accessibility notes

- All edit form fields have associated `<label for="">` elements.
- The status dropdown has a visually hidden `<label>` (`.sr-only`) so screen readers announce it correctly.
- The expand toggle uses `aria-expanded` and `aria-controls` pointing to the collapsible section's `id`.
- Time remaining is wrapped in `aria-live="polite"` so screen readers announce updates without interrupting the user.
- The overdue indicator uses `role="status"` for non-interruptive live announcements.
- The edit form has an `onkeydown` handler that traps focus within the form fields when in edit mode and closes on Escape.
- Tags use `role="button"` and `aria-pressed` to communicate toggle state to assistive technology.
- Keyboard tab order: **Checkbox → Status control → Expand toggle → Edit → Delete → (form) Save → Cancel**.
- All interactive elements have `:focus-visible` outlines with sufficient contrast.
