# Consuming the kit (and moving between versions)

How an app takes the SACRVM APPKIT and stays current without drifting. Written
after the v2.0.0 rollout, when the runtime model finally became clear.

## The one thing to understand: two kits, not one

An app meets the kit in two places, and they can be different copies:

| Context | Which kit is live | Set by |
|---|---|---|
| **On a host** (the desktop opens your app) | the **host's** vendored kit | the host — `sac.apps` injects your `app.js` into the host's own page (no iframe), so your `index.html` and its kit link are never loaded |
| **Standalone** (you open the app's own page, F5-dev) | the kit your **`index.html`** links | you |

Consequence: your app's behavior *on the desktop* is decided by the **desktop's**
kit version, not yours. Your own vendored copy only governs standalone dev. Keep
both on the same version and this never bites you.

## Autark: vendor your own copy

Every app carries its own kit copy — local, offline, no CDN (decided 2026-08-22).

1. Download the release ZIP (`sacrvm-appkit-X.Y.Z.zip`) from the appkit releases.
2. Drop its `kit/` into your repo root **verbatim**, including `kit/VERSION`.
   Verbatim is the point: upgrading later is "delete `kit/`, unzip the new one" —
   nothing to reconcile.
3. In `index.html`, link the local copy — never the github.io CDN:
   ```html
   <link rel="stylesheet" href="kit/css/ui.css">
   <script defer src="kit/js/all.js"></script>
   ```
4. `kit/VERSION` then tells you — and any reviewer — exactly what you are on.

**Never edit anything under `kit/`.** A local kit change is the Wildwuchs this
model exists to prevent. If the kit needs a fix, it happens in the appkit and
ships in the next release; you re-vendor.

## Moving to a new MAJOR (e.g. → 2.0.0)

A major means a breaking change. Re-vendor (above), then reconcile your own code
against `MIGRATION.md` in the appkit. For **2.0.0** the breakers that reach app
code:

**Chrome ownership moved to the app.** A view now draws its own nav, toolbar and
rail; the 1.x `sac.toolbar` / `sac.sidebar` projection into shared chrome is gone.
Put ribbon actions in your own `<sac-nav>` (its `toolbar` slot) and your rail in
your own `<sac-sidebar>`; the host injects into your nav via `context.host`
(`nav.host = context.host`), it never paints into your chrome. This reaches app
code as hard as the event renames — an app built on the 1.x projection model must
move its chrome inward.

**Events are unified.** Kit components now emit `sac:change` / `sac:input` for
value changes (`detail: { value }`) or a descriptive verb — native `change` /
`input` on a kit component is gone. Rename in your listeners:

| Old event | v2.0.0 | detail |
|---|---|---|
| native `change` on `sac-segmented-control` (and other value components) | `sac:change` | `{ value }` |
| `sac:color-change` (`sac-color-field` / `sac-color-picker`) | `sac:change` | `{ value }` |
| `sac:swatch-select` (`sac-swatch-grid`) | `sac:change` | `{ value, swatch }` |
| `sac-dialog:action` | `sac:action` | `{ action }` |
| `sac-dialog:open` | `sac:open` | — |
| `sac:menu-select` (`sac-menu`) | `sac:select` | `{ action }` |
| `sac:tab-show` (`sac-tabs`) | *unchanged* | `{ name }` |

Read the value off `e.detail.value`, not `e.detail`.

**`<select>` needs a wrapper.** The chevron is painted on the wrapper:
`<span class="select"><select>…</select></span>`. A bare `<select>` loses its
arrow.

**`disabled` is additive** (attribute + property on form components) — nothing to
change unless you want to use it.

Native DOM events on your **own** plain elements (`<input>`, `<button>`, …) are
unaffected — this is only about events the kit dispatches.

## Credits and licences: use `sac.about`, not a hand-rolled dialog

If your app credits a third-party library, or ships a licence or trademark
notice, expose it through the manifest — not a bespoke About dialog. Put the text
in the optional `notices` field:

```jsonc
"notices": [
    { "title": "spectral.js", "text": "MIT © 2025 Ronald van Wijnen…" },
    { "title": "RAL",         "text": "\"RAL\" is a registered trademark…" }
]
```

…and open the standard About with `sac.about.open(context.manifest)` (or a plain
object standalone). The kit renders name · icon · description · version plus your
notices into one shared `<sac-window>`, so your About and a host's About look
related instead of every app inventing its own surface — copied conventions
drift, shipped components can't. There is a `copyright` icon for the button.

## Verify

- **Standalone (F5):** the app renders, the console is clean, value events fire.
- **On the desktop:** install/open the app; the interactions above work against
  the desktop's (matching) kit.
