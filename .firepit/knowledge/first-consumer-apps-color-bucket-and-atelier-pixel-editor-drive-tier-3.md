# First consumer apps: color-bucket and Atelier pixel editor drive Tier 3

Decided 2026-08-15 by the owner: two existing apps will be re-realized on the appkit, and their real needs — not speculation — set the kit's Tier-3 priorities.

## The two apps

1. **color-bucket** (`D:\repos\color-bucket`) — "Mix colors like paint": subtractive pigment mixing (spectral.js / Kubelka-Munk), COLOURlovers-style palette community planned (P1 site → P2 Firebase community). Today a one-file prototype (`prototype/app.html`). Domain logic (SHELVES table, mixPigment/mixRGB, hash serializer, `src/mixing.js`) ports untouched. Warm-paper light-first identity — per-app theming needs more than `--accent` (ground/ink seeds too).
2. **Atelier pixel editor** (`D:\repos\bunnybot-web-io\public\atelier`) — high-quality sprite/pixel editor (946-line `sprite-editor.js`): full tool set, float selection model, frame animation + onion skin, 80-step undo. Will become a STANDALONE app: cut Firebase auth/storage + farm coupling, extract a headless `PixelDoc` + tools module (~400 DOM-free lines), replace all hand-rolled chrome (window dragging, toast, ctxmenu, confirm()) with kit components. Its amber `--accent: #e6a341` carries the identity.

## Consumer-validated kit gaps (both apps agree on the top of the list)

1. **Color suite** (BOTH): color picker (HSV area + hue + alpha + hex/RGB inputs), swatch grid component (N-col, selected ring, transparent swatch, corner count badge, used-in-document mode), color field (validated hex input + color well).
2. **Numeric stepper family** (BOTH): −/value/+ stepper with min/max/unit; W×H dimension pair.
3. Atelier-specific: integer-snap pixel pan-zoom (+ `image-rendering:pixelated`, checkerboard token pair, pixel-grid overlay — the existing pan-zoom lib is fractional-scale, wrong for pixels), icon tool-ribbon (radio grid), filmstrip/timeline, sortable layer list (= roadmap "drag-reorder"), ~14 missing icons (fill, eyedropper, marquee, line, rect, ellipse, move, zoom, grid, layers, flip-h/v, onion), export-options dialog, shortcut cheat-sheet overlay.
3. color-bucket-specific: many-tab strip (11+ wrapping tabs), auto-contrast text-on-user-color utility, router-compatible hash app-state convention (app rewrites `#…` continuously — collides with the hash router), single-file build target (artifact CSP channel needs everything inlined incl. fonts), embeddable component mode (tokens self-contained in shadow root for third-party `<color-bucket>` element).

## Roadmap consequences

Old Tier-3 guesses re-scored by real consumers: drag-reorder ✔ needed (Atelier layers); sac-select ✘ neither app needs it; virtual list / data table ✘ not yet (maybe color-bucket P2 gallery); scale tokens — nice, not demanded; md-editor add-on ✘ unrelated. Full exploration reports: session 4d184a57 (2026-08-15), agents ace62212/a1da1744.
