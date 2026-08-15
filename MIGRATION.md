# Migrating a legacy app to SACRVM APPKIT

This guide is for the apps built on the kit's two predecessor UI layers — the
`dream-*` component generation and its `fb-*` derivative. It is deliberately
NOT part of the style guide: the style guide documents the kit as it is; this
file maps the old world onto it, and only matters while a legacy project is
being moved over.

It is a living document — when the first real migration happens, add every
gotcha you hit here.

## 1. Swap the foundation

1. Replace the legacy stylesheet (`ui.css` of the old project) with
   `kit/css/ui.css`. Fonts ship with the kit (`kit/fonts/`, self-hosted
   woff2) — delete any font CDN links.
2. Replace the pile of component `<script>` tags with the autoloader:
   `<script src="kit/js/all.js"></script>` — or keep individual classic
   `defer` tags if the page only uses a handful (load order: `lib/globals.js`
   first, then libs, then components; see any kit template).
3. Set the theme flag on the root element if the app should not be dark:
   `<html data-theme="light">` or `"auto"`.

## 2. Rename the components

The rename is mechanical: `dream-*` → `sac-*` and `fb-*` → `sac-*` — same
tags, same slots, same attributes unless listed under Behavior changes below.
A project-wide find/replace on the two prefixes (markup, `querySelector`
strings, CSS selectors, `customElements.get` calls) does almost all of it.

Not carried over:

| Legacy | Status |
|---|---|
| `fb-md-editor` | not in the core kit — planned as an optional add-on module |
| `dream-terminal` | dropped — too close to `sac-log`, which wins. Port: `append(text, level)` → `add(text, level)`; levels `normal`/`success` → `info`, timestamps appear |
| `3dx-*`, converter/domain logic | left behind by design; UI only |

## 3. Token and class map

| Old | Kit |
|---|---|
| `--bg-dark` | `--viewport-bg` (canvas ground, black in every theme) |
| `--tag-*` | `--palette-*` |
| `--tile-bg` / `--tile-border` | `--tile` / `--border-strong` |
| raw `rgba(255,255,255,.08)` etc. | `--border`, `--hover`, … (derived — stop hardcoding) |
| `.beta-badge` | `.tile-badge` (+ `.accent` variant) |
| `.tool-btn` | `.btn` (inside `.toolbar` for ribbon sizing) |
| `#canvas-container` | `.viewport` |
| hardcoded 6–16px radii | `--radius-s/m/l` (reduced — the kit is deliberately sharper than the legacy look) |
| state color doing double duty (fill under text, colored text) | the AA layer: `-fill` + `--on-*` inks for text-carrying planes, per-theme `-text` for state-colored text — the bare seed stays identity-only (rings, borders, icons) |

The kit derives every non-seed color via `color-mix()` from the seeds
(`--bg`, `--fg`, `--surface`, `--accent`, `--accent-edit`, `--accent-warm`,
`--danger`, `--ok`, `--on-accent`). Any raw hex/rgba a legacy app sprinkled
into its own CSS should be replaced by the nearest derived token — that is
what makes the app rethemeable for free.

## 4. Behavior changes to expect

- **Events are `sac:`-prefixed** (`sac:tab-show`, `sac:menu-select`,
  `sac:files`, …), `CustomEvent` with `bubbles` + `composed`. Exception:
  `sac-window` keeps its legacy unprefixed `open`/`close` events for
  launcher compatibility.
- **`sac-nav` is configurable** — the legacy nav hardcoded its tool list and
  path logic; nav entries now come from attributes/registration
  (`sac.router.register`). Port the app's nav data instead of patching the
  component.
- **No kind stripes.** Legacy toasts/callouts signalled state with a thick
  colored left border; the kit signals via icon color + a subtle background
  tint (hard design rule — do not reintroduce the stripe when porting
  app-specific callouts).
- **`sac.launcher` is now a deprecated alias for `sac.apps`** — legacy
  `register`/`open`/`init` calls keep working unchanged (`title` and a missing
  `kind` included), as do `[data-overlay]` tiles and `?tool=` deep links. New
  apps use the app manifest + `mount(context)` contract on `sac.apps`
  (`kit/js/lib/apps.js`; the old `lib/launcher.js` is gone) and `?app=` deep
  links; `<sac-launcher>` renders the registry as a user-composable tile grid.
- **New since the legacy era** (nothing to migrate, but stop hand-rolling
  them): toast stack, tooltip, tabs, progress/spinner, menu behavior, theme
  toggle, split panels, drop zone, window minimize/maximize, command palette
  (`sac.hotkeys`/`sac.commands`), breadcrumbs/pagination/empty-state/badge
  patterns, avatar, copy button, the date suite
  (`sac-calendar`/`sac-date-field`).

## 5. Per-app accent

Unchanged and still the cheapest win: one `--accent` override on the app's
root retheme the whole surface. Custom themes = swap the seeds (style guide →
Tokens & Theming has the recipe).
