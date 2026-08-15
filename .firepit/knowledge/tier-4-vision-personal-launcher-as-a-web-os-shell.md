# Tier 4 vision: personal launcher as a web OS shell

The owner's platform vision (2026-08-15), extending the apps-as-web-components direction. Explicitly labeled "Tier 4" — after Tier 3 (color suite, app contract, Atelier workbench).

## The vision

The personal launcher becomes a web OS shell: apps are web components pulled into a suite; the launcher itself is just an app; users compose their own launcher.

1. **Version independence**: apps need NOT share one kit version. Shadow DOM isolates CSS per app. The one global conflict point is the custom-element registry (`customElements.define` is page-global). `window.sac` is the second global: apps should receive the API injected by the host, not grab it from window.
2. **Shared file storage in the host**: the shell owns a common Dateiablage (OPFS for files + IndexedDB for metadata) and hands apps access at mount time. Same-realm web components beat the old iframe approach: direct API object injection, no postMessage/serialization/origin friction. Capability model — apps only get what the shell grants; permission prompts are the shell's job.
3. **Login only in the shell**: only the launcher authenticates (e.g. Google), syncs storage, feeds apps with data. Apps stay auth-free and portable — the same app embeds on third-party pages without any login.

## Portability rule + ZERO-BUILD stance (settled with the owner 2026-08-15)

Truly portable on ANY page today = a component that registers exactly ONE global tag (guarded with `customElements.get()`), whose internals need no further registered tags. Scoped Custom Element Registries exist in Chrome/Chromium but NOT reliably in Safari/Firefox — never a prerequisite, only a runtime-detected bonus. Shared plain-JS code (classes rendering plain DOM in the own shadow root) is always safe — only tag registration collides.

**Hard owner value: NO build process, ever, in the workflow.** No bundlers, no TypeScript, no node_modules. Dev/our own platform/our own apps = plain files + F5, forever.

Embed strategy honoring that:
1. DEFAULT everywhere: `customElements.get()` guards — zero build, dedupes same-version reuse.
2. **Release web components via GitHub Actions (decided 2026-08-15):** packaging happens ONLY at release, server-side — a workflow on tag/release runs the dependency-free inliner and attaches ONE self-contained `.js` release asset. Consumer: one script tag + one element tag. Contents: kit CSS inlined in shadow root, internal `sac-*` tags rewritten to a versioned prefix (e.g. `cb1-icon`), public tag guarded, vendored libs inlined. Fonts: default = system font stack (truly zero runtime requests; matches color-bucket's CSP practice); data-URI fonts optional per app (size tradeoff). Self-contained but themable: CSS custom properties inherit through, so a host MAY set seeds/--accent without the embed ever needing anything. No build output ever lives in the repo; local dev untouched.

## Consequence for Tier 3b (do NOW)

Shape the app contract as `mount(context)` with four slots — `{ fs, identity, theme, deepLink }` — even though Tier 3 only implements theme + deepLink. Tier 4 then fills in fs + identity without reshaping the contract. Atelier's standalone port (local-first, IndexedDB) should save through `context.fs` from day one.

Related: [[first-consumer-apps-color-bucket-and-atelier-pixel-editor-drive-tier-3]]
