# UI kit competitive landscape and gap analysis (2026-08)

Research snapshot backing the roadmap page at `/roadmap/` (serve the repo, open http://localhost:3000/roadmap/). Researched 2026-08.

## Community favorites among comparable kits

- **Web Awesome / Shoelace** (webawesome.com, shoelace.style) — THE framework-agnostic web-components favorite (Font Awesome team). ~45 components, accessible by default, CSS-custom-property theming, experimental autoloader. Web Awesome is Shoelace's next major version (OKLCH theming, native form association, cascade layers).
- **Pico CSS** (picocss.com) — the classless-CSS darling: semantic HTML styled directly, <10 KB, no build. Styles more plain elements than our ui.css does (tables, kbd, dialogs).
- **Open Props** (open-props.style) — the design-tokens favorite: CSS custom properties for color ramps, spacing, radii, typography, shadows, easings. Piecemeal adoptable.
- **daisyUI** (daisyui.com) — most-starred Tailwind component set (~60 components). Wrong stack for us, best inventory checklist (toast, tabs, breadcrumbs, pagination, steps, stat, kbd, theme controller, validator, empty states).
- **WinBox.js** (nextapps-de/winbox) — HN-beloved zero-dependency floating window manager; reference for minimize/maximize/restore + snapping.
- **ninja-keys** (ssleptsov/ninja-keys) — community-favorite command palette as a single web component.
- Water.css / Simple.css — classless minis; Water.css praised for automatic light/dark via prefers-color-scheme.

## Gap list derived for sacrvm-appkit (tiers mirror /roadmap/)

- **Tier 1 (essentials):** sac-toast, sac-tooltip, sac-tabs, sac-progress + sac-spinner, sac-menu (dropdown/context behavior on .floating-menu), global `<table>` baseline in ui.css, auto theme (`data-theme="auto"` via prefers-color-scheme) + sac-theme-toggle, prefers-reduced-motion support, .skeleton pattern, kit/js/all.js autoloader.
- **Tier 2 (workspace power):** sac-split (resizable panels/sidebar), sac-drop-zone (file drag&drop), sac-window minimize/maximize (WinBox-style), sac-command-palette + hotkeys + .kbd, breadcrumbs + pagination, avatar/badge-dot/copy-button/empty-state.
- **Tier 3 (later):** sac-select (custom popup), spacing/radius/type scale tokens (Open Props idea), virtual list/data table, drag-reorder, markdown editor add-on port.
- **Non-goals (decided):** charts, i18n, framework wrappers, carousel/QR/mockups, full date picker (styled native is enough).

## Unique strengths nobody in the field ships

App shell (router + self-registering views + nav + toolbar projection), workspace layout with synchronized pan-zoom/HUD/log, floating windows + launcher overlays with ?tool= deep links, seed-derived theming (8 seeds + light/dark flag → whole palette via color-mix), armed destructive dialogs, scoped workspaces, scene graph.

## Hard-won implementation lessons (this session)

- **Never re-render a shadow root on value-attribute changes**: replacing `<input type=range>` mid-drag kills the browser's thumb drag after one tick. Update DOM in place (sac-slider), style state via `:host([attr])` (sac-toggle).
- **Document styles beat `::slotted()` styles for slotted light-DOM children regardless of specificity** (CSS scoping cascade order). A global `button { background:none }` silently wiped sac-segmented-control's active state; `!important` inside the shadow `::slotted()` rules is the intended fix.
- Hash-router view swaps must `window.scrollTo(0,0)` — innerHTML swap keeps the old scroll position.
