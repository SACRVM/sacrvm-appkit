# Orb Lab

A tiny but real workspace tool, built entirely on the **SACRVM APPKIT** —
this help window itself is the kit's markdown help pattern:
`loadHelp()` + vendored `marked`/`DOMPurify` inside a floating `sac-window`.

## Controls

| Control | Effect |
|---|---|
| **Orbs** | Number of orbs in the simulation |
| **Speed** | Velocity multiplier |
| **Size** | Orb radius |
| **Trails** | Fade instead of clear — motion trails |
| **Connect lines** | Draw links between close orbs |
| **Color mode** | Accent (the app's `--accent` seed), Palette (10-slot data palette), Mono, Custom |
| **Custom color** | Enabled in Custom mode: pick a color and the orbs follow live |

On a phone the controls live behind the **☰** burger, and Pause, Reset
view and Help behind **…** when the ribbon runs out of room.

## Viewport

| Mouse | Touch | Does |
|---|---|---|
| **Wheel** | **Pinch** | Zoom, anchored at the cursor / between the fingers |
| **Drag** | **Drag** | Pan (middle-drag always pans) |
| **Double-click** | **Double-tap** | Reset the view |

## Why this exists

The demo proves the kit end-to-end: launcher → workspace layout →
sidebar controls → log → HUD → pan/zoom → floating windows → per-app
accent override (this app runs green, the hub runs blue — one variable).

External link test: [the marked library](https://github.com/markedjs/marked)
opens in a new tab.
