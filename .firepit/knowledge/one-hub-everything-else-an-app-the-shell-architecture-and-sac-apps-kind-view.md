# One hub, everything else an app: shell, app toolkit, install by origin

Decided and built with the owner 2026-08-16. There is exactly ONE desktop; every other destination is an app running on it. Live proof: <https://desktop.sacrvm.dev> installs apps from other repositories by URL.

## The three kinds

| Kind | Where it runs | For |
|---|---|---|
| `window` | floating `<sac-window>` above the shell | dialog-style tools (calculator) |
| `view` | the shell's stage, addressed `#/<id>` with the app's sub-route after it | anything that used to be its own page |
| `page` | its own document | only apps that must also stand alone |

## Host side (sac.apps)

- `sac.apps.init({ viewHost, home })`; `active()` returns the view on stage.
- View elements are created once and hidden on switch — state survives; `mount()` runs once, and **only when the element is visible**, so apps that measure (canvas, deep-link scroll) get a real box.
- View creation is keyed by an in-flight promise: one hash navigation fires `hashchange` AND `popstate`, which otherwise built two elements.
- `sac.apps.inspect(url)` fetches and validates an app manifest — **data only, no code runs**. `sac.apps.add(manifest)` registers it. Splitting them is what makes an informed install dialog possible.
- Manifest URL resolution: `github.com/owner/repo` → `https://owner.github.io/repo/app.json`.

## App side (sac.app — the toolkit)

`base()`, `styles(href, id)`, `define(tag, Class)`, and `Element` with three hooks: `build()` / `onMount(context)` / `onUnmount()`. Its **standalone fallback** mounts the element itself when no host does, so one app file runs on a desktop and alone in its own harness page.

`context`: `appId, params, route, onRoute(cb), sidebar{set,clear}, href(route), deepLink{set}, theme, fs: null, identity: null`.

**`context.href(route)` is mandatory for links** — the host owns the address space (`#/<id>/<route>` on a desktop, `#/<route>` standalone). An app that builds its own hash breaks standalone.

## Measured facts (verified, do not re-derive)

| Source | Content-Type | CORS | Usable as a script? |
|---|---|---|---|
| GitHub Pages | correct (`application/javascript`, `application/json`) | `*` | yes — the delivery surface |
| raw.githubusercontent | `text/plain` + `nosniff` | `*` | **no** |
| Release asset | `application/octet-stream` | — | **no** |

## Traps this cost us (all fixed in the kit)

- **Custom properties are substituted where they are DECLARED.** Accent derivations living only on `:root` ignore any `--accent` set further down, so a per-app accent half-worked. The derivations now also run on `.sac-app` (set by `sac.app.Element` on every app element), `.sac-app-view` and `sac-window`.
- **`requestAnimationFrame` never runs in a background tab.** Anything that REVEALS something must not wait for a frame: the standalone mount, `sac.dialog`, window open and `sac-loader` all use timeouts now. Measurement and focus refinements still use rAF, which is what it is for. Smooth scrolling is affected too — prefer instant.
- **`all.js` injects its scripts, and injected scripts do not hold up DOMContentLoaded.** Boot code must wait for `sac:ready` / `window.sacReady`. Cherry-picked `<script defer>` tags are unaffected.
- Pattern rules like `.empty-state sac-icon` must be **direct-child** selectors, or they paint icons inside nested buttons.

## Repos (one repo, one app — binding guideline)

`sacrvm-appkit` (the kit + its site), `sacrvm-desktop` (the shell at desktop.sacrvm.dev, kit VENDORED), `sacrvm-calculator` (window app), `sacrvm-notes` (view app). App repo shape: `app.json`, `app.js`, `app.css`, `index.html` harness, README, LICENSE. Templates: `kit/templates/app-dialog/` and `app-fullscreen/`.

## Trust model

Same realm, informed install: the manifest is read and shown (name, version, origin, kind) before the app's script is ever loaded, and every tile carries its origin. An iframe/sandbox kind would be an ADDITIONAL kind, never a rewrite.

## Still open

- A "Build an App" page on the appkit site (docs + template downloads + the TODO list).
- `context.fs` / `identity` are reserved and still null — the notes app uses localStorage meanwhile.
- No calculator glyph in `sac.icons` (the app borrows `note`).
- Installed apps are not version-pinned; the desktop re-reads the origin.
