# Native controls: wrap only for behavior, never style-only

Settled with the owner 2026-08-15 (the original proposal — wrap ALL native controls in sac-* now for later swappability — was withdrawn after platform review, in favor of whatever works best cross-platform).

## The rule

A native form control gets a sac-* component ONLY when the component adds real behavior (sac-drop-zone: drag logic; sac-stepper: hold-repeat/clamping; sac-color-field: popover; sac-toggle). Style-only theming of native controls lives in `ui.css` on light-DOM elements (the select-with-painted-chevron pattern) — never in wrapper components.

## Why (platform facts)

1. Customized built-ins (`extends HTMLSelectElement` + `is=""`) are dead cross-platform: Safari/WebKit never implemented and refuses them.
2. `attachShadow()` is FORBIDDEN on form controls (`<select>`, `<input>`, `<button>` can't host shadow roots) — "inherit and put styles in the shadow DOM" is impossible twice over.
3. Wrapping a native control INSIDE an autonomous element's shadow root breaks form participation (no outer-form membership, `<label for>` can't reach in, autofill/password managers degrade). Restoring it means `ElementInternals`/`formAssociated` re-implementation per control, plus perpetual attribute forwarding ("wrapper rot").
4. The swap-later win is marginal: `<select>` → `<sac-select>` is a find/replace plus API adaptation — the API part is owed with or without a wrapper.

## When a real custom control IS built

(e.g. a future sac-select with its own popup, or sac-date-field): build it as a proper form-associated custom element with `ElementInternals` — once, justified by a consumer, not preemptively.
