# One hub, everything else an app: the shell architecture and sac.apps kind view

Decided with the owner 2026-08-16, implemented the same day. The site (and the Tier-4 direction) has exactly ONE desktop; every other destination is an app running on it.

## Why

`kind: "page"` means *its own document*, and every document brings its own nav — so three tile-grid landings appeared (GitHub landing page, demo hub, style guide home). Three desktops contradicted the web-OS-shell goal.

## The three kinds

| Kind | Where it runs | For |
|---|---|---|
| `window` | floating `<sac-window>` above the shell | small tools, dialog-like apps (calculator) |
| `view` | the shell's stage, addressed `#/<id>` with the app's sub-route after it (`#/styleguide/components`) | anything that used to be its own page |
| `page` | its own document | only apps that must also stand alone |

## The primitives added to the kit

- **`sac.sidebar` + `<sac-sidebar>`** — the left-rail counterpart to the existing `sac.toolbar` ribbon projection. An app never draws chrome; it projects navigation (`context.sidebar.set([{label, icon, href, active} | {section}])`) and the shell renders it. This is the answer to "how does the app's navigation get into the shell".
- **context grows** `route`, `onRoute(cb)` and the scoped `sidebar` handle; `deepLink.set("sub")` writes the view's sub-route via replaceState.
- View elements are created once and hidden on switch — state survives, `mount()` stays once per element lifetime.
- `sac.apps.init({ viewHost, home })`; `sac.apps.active()` returns the view on stage.
- `sac-nav` keeps a route active while inside its sub-routes.
- **`all.js` now fires `sac:ready`** (+ `window.sacReady`): injected scripts do NOT hold up DOMContentLoaded, so boot code that used that event failed silently. Cherry-picked `<script defer>` tags are unaffected.
- Shell skeleton: `kit/templates/shell.html`.

## App-side rules (unchanged contract, restated)

ONE custom element in ONE classic script, guarded define, no other tags registered, light DOM so `ui.css` applies, own stylesheet injected via a `<link>` guarded by id, BASE resolved from `document.currentScript.src` at parse time.

Controls that are not navigation (sliders, colour fields) stay INSIDE the app — the rail is a navigation rail. Ribbon actions still go through `sac.toolbar`.

## Agreed direction, not yet built (2026-08-16)

- **Origin in the registry**: an app describes itself in a tiny `app.manifest.js` next to it that calls `sac.apps.register(...)`. The desktop then stores only URLs. Chosen over a JSON manifest because classic scripts are exempt from CORS — foreign origins work with no server cooperation.
- **App toolkit** (`kit/js/lib/app.js`): the app-side half of the contract — tag guard, BASE, stylesheet injection, and a standalone fallback (self-mount with a default context when no shell mounts it), so one file runs both on a shell and alone. Plus a dev harness page.
- **Trust model**: the registry holds the owner's own apps, same realm (direct API injection, shared tokens). An iframe/postMessage kind is only for third-party apps, and would be an additional kind, never a rewrite.
- First external proof planned: a calculator as a `window` app living in another repo.
