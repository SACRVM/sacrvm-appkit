# Floating panels need the top layer: a transformed ancestor traps position: fixed

Found 2026-08-16 on the desktop, reported as "the tile's ⋯ menu doesn't work".

**Symptom:** `<sac-menu>` inside a `.tile` opened (attribute flipped, no console error) but nothing appeared on screen.

**Cause — two CSS facts stacking:**

1. `transform`, `will-change: transform`, `filter` and `backdrop-filter` on an ancestor make that ancestor the containing block for `position: fixed` descendants. `.tile` sets `transform: translateZ(0)`, `will-change: transform` AND `backdrop-filter: blur(12px)` — three separate reasons.
2. `.tile` also sets `overflow: hidden`. Once the panel is positioned against the tile instead of the viewport, the tile clips it away entirely.

The panel's `getBoundingClientRect()`-based anchoring math was correct and useless: viewport coordinates applied inside a non-viewport containing block.

**Fix (kit, `sac-menu.js`):** give the panel `popover="manual"` and call `showPopover()` / `hidePopover()` around open/close. The top layer sits outside the containing-block and clipping chain, so viewport anchoring is right again. Details that matter:

- Author `display: flex` on the panel beats the UA's `[popover]:not(:popover-open) { display: none }`, so the existing opacity/visibility transition survives instead of snapping through `display`.
- Reset the UA's popover centring: `inset: auto; margin: 0`.
- `hidePopover()` is instant, so delay it ~160ms (past the close transition) and skip it if the menu reopened meanwhile.
- Raise into the top layer BEFORE measuring for anchoring.
- Custom properties still inherit through the DOM tree, so tokens keep working in the top layer.

**Still unfixed (same trap, same fix applies):** `sac-chip-input`'s dropdown, `sac-tooltip`, and the `.popover` panels in `sac-color-field` / `sac-date-field` all use plain `position: fixed`. They are fine today because nothing puts them inside a tile — put one there and it vanishes the same way.

**Reflex when a floating panel "does nothing":** check the ancestors for transform/filter/backdrop-filter/will-change before debugging the JS. Related: [[no-scale-animations-on-text-bearing-surfaces-chromium-re-rasters-mid-animation]].
