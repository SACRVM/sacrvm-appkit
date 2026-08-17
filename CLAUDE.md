# CLAUDE.md — SACRVM APPKIT

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## The Mission

Extract, conserve, and **complete** the UI layer of DREAM TOOLS (`D:\repos\dream-tools`) as a standalone, reusable HTML appkit. DREAM TOOLS is being wound down (the 3DXChat era is ending), but its look and handling are proven and loved — they must survive as the foundation for future apps, including the user's own social game.

## The two guides (read in this order)

**Read `D:\repos\dream-tools\dream-tools-guide.md` FIRST**, then
`D:\repos\the-fishbowl\docs\fishbowl-ui-guide.md` — the same UI system four
months later, in production. Its §7 is a 21-row merge decision table covering
every point where the two disagree, including four warts the dream-tools guide
still lists as open TODOs.

These are the authoritative handover documents: full component inventory with APIs, design tokens, layout patterns, exact source paths, what to take, what to leave behind, and the known warts to fix. Do not re-derive any of that by spelunking — the guides exist so you don't have to.

**Two sources, one kit.** THE FISHBOWL is a derivative of dream-tools but evolved standalone traits of its own. Neither guide wins by default: the goal is to weigh both against each other and build the best combination of both worlds. For every point of disagreement, start from the fishbowl guide's §7 decision table; where a conflict isn't settled there, ask the user — don't assume (Befehlsgehorsam).

**Fishbowl's own warts (§8): fix during consolidation, do not port faithfully.** Both sources ship working, proven UI — "wart" never means "broken". The fishbowl guide's §8 lists eight spots that are invisible in the shipped product but would be poison copied unchecked into a shared kit (e.g. `.tile` hardcoding `rgba(30,41,59,0.7)` instead of a token — looks identical, works fine, and is exactly the bug in a kit whose whole purpose is *one token set, one retheme*). Exception: §8 item 5 (no light theme) is a real design decision, not cleanup — see Open decisions.

## Deliverables (three parts, one repo)

1. **The kit (`kit/`)** — the reusable library itself:
   - Design tokens + global stylesheet (evolved from dream-tools `ui.css`)
   - All Dream web components, generalized (nothing hardcoded to dream-tools URLs, tool lists, or 3DXChat)
   - The shared helpers (markdown help loader, synchronized pan/zoom)
   - The **launcher/dashboard page as a reusable template** — the tile-grid hub with lazy `dream-window` tool overlays and `?tool=` deep links is part of the kit, not an afterthought.
2. **The style guide (`styleguide/`)** — a browsable page (built WITH the kit) documenting every token, every component with live examples + attribute/event tables, and the layout patterns (workspace, sidebar, nav ribbon, cards, floating windows).
3. **The demo app (`demo/`)** — one small but real app proving the kit works end-to-end: launcher dashboard → a workspace-layout tool page with sidebar, nav toolbar slot, sliders/toggles/log, and a floating `dream-window`.

## Core Philosophy (inherited from DREAM TOOLS — non-negotiable)

1. **Zero Dependencies**: No `node_modules`, no bundlers, no build step. Pure vanilla JavaScript, Custom Elements, plain CSS. Files are served as-is (`npx serve .`).
2. **Drop-in usable**: A new app consumes the kit by copying/linking the `kit/` folder and writing plain HTML. No framework, no compile.
3. **Zero Friction, Truth in Preview**: What the style guide shows is exactly what an app gets.
4. **Befehlsgehorsam**: The user decides, Claude executes. Do not second-guess design decisions.

## Theming architecture (decided 2026-08-14)

The kit must be **easily themable** — light, dark, AND custom themes:

- **Few seeds, everything else derived**: condense the palette to a small set of base colors (accent, surface, foreground, semantic states). All other colors are *derived* shades/alpha steps of those seeds (the classic "20% of main-forecolor" pattern) — in plain CSS (`color-mix()` / relative color syntax), zero build step.
- **One flag: light or dark**: a theme = its seed values + whether it is light or dark; the derivation flips direction accordingly. Result: any theme gets correct colors everywhere ("perfect colors everywhere — unless you pour ugly seeds in").
- **No raw colors in components or patterns, ever** — seeds and derived tokens only. This is exactly what fishbowl's §8 warts violate; fix during consolidation.

## Rules for the extraction

- **Generalize, don't fork-and-forget**: `dream-nav` currently hardcodes the dream-tools tool list and path logic — nav entries must become configurable (attributes/slots/JS config). Same for every other dream-tools-specific string. The guides list all known instances.
- **Complete the kit**: dream-tools styled buttons/inputs/labels/tabs via global CSS only — decide per case whether that stays a documented CSS pattern or becomes a proper component, and document whichever it is in the style guide. Undocumented = doesn't exist.
- **Leave the domain behind**: Nothing 3DXChat-specific crosses over (`3dx-*.js`, `world-to-gltf.js`, `blueprint-loader.js`, converter logic). UI only.
- **Keep the working patterns**: workspace layout (fixed 50px nav + sidebar + viewport), per-app `--accent` override via one CSS variable, lazy tool-as-custom-element in `dream-window` overlays, Shadow DOM components as classic deferred scripts.

## Decisions (settled 2026-08-14 with the user)

- **Component prefix: `sac-*`.** All kit components are `<sac-…>`; the rename from `dream-*`/`fb-*` is mechanical (fishbowl guide §7.21).
- **Default dark seeds: the Fishbowl token values** (§7 rows 1–4): shared-hue slate grounds `#0b0f1a`/`#171b24`, WCAG-checked two-step muted text, `--accent: #3b82f6`, semantic `--accent-warm`/`--danger`. They ARE the dream-tools palette, four months evolved.
- **Fonts: self-hosted woff2** (Inter 400/500/600 + Outfit 600/700/800, latin + latin-ext), copied from Fishbowl (§7.5). No CDN.
- **Merge plan: the §7 table as printed.** Core = Fishbowl's tokens/shell/router/nav/toolbar/form layer; plus dream-tools' scene-graph, pan-zoom, launcher-overlay pattern with deep links, and the per-app `--accent` retheme mechanism.
- **`fb-md-editor` stays out of the core kit** — optional add-on module later (guide §2 recommendation).
- **Light-theme seed values: signed off 2026-08-15.** The proposal shipped in `ui.css` is final — deliberately bright by design; apps wanting a softer light theme override the seeds per the custom-theme recipe in the style guide.

## Open decisions (TODO — ask, don't assume)

- *(none currently)*

## Development

```bash
npx serve .        # http://localhost:3000 — same workflow as dream-tools
```

No build step. No tests — verify manually in the browser, in both the style guide and the demo app.

## Firepit inbox

At the start of a session, read any pending messages in `.firepit/inbox/*.md` — cross-project notes Firepit routes here. Act on each, then mark it done with the `firepit_inbox_complete` MCP tool, passing the message's filename as the `id`.

## Firepit knowledge

Before researching something that may already be known, query the knowledge base with the `firepit_knowledge_search` MCP tool (scope `both` covers this project plus the global base). Save durable findings with `firepit_knowledge_add` — written in English, per the indexing convention. The created markdown files live under `.firepit/knowledge/` and are committed like any other file.

## Firepit pinned knowledge

@.firepit/knowledge-pinned.md

The import above auto-loads the knowledge docs marked `pin: true` in their frontmatter — always-on rules that apply every session without a search. Firepit regenerates the file from the pinned docs; don't edit it directly. Pin/unpin via the pinned flag on `firepit_knowledge_add` / `firepit_knowledge_update`, and keep the pinned set small — everything else stays reachable through `firepit_knowledge_search`.

## Firepit artifacts

When you produce a file the user will want to open — a report, screenshot, diagram, generated image, log excerpt, build output, or an executable you built for them to run — pin it with the `firepit_artifact_add` MCP tool so it appears in the project's paperclip pane. Do this as you produce it, not at the end of the session; a path buried in scrollback is a path the user has to hunt for. Pinning only links the file — it stays where it is, and `firepit_artifact_remove` never deletes it. Check `firepit_artifact_list` first so you update an existing entry instead of piling up near-duplicates, and unpin what has gone stale.

## Firepit conventions

<!-- claude-firepit-fragments -->

@../.firepit/projects/claude.md
@../.firepit/projects/claude-github-public.md

The two imports above are shared files in the Firepit central repo — edit them there and every project follows. They carry policy; the tools themselves are described by Firepit's MCP server at the handshake, so nothing is duplicated between the two.
