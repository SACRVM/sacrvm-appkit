# SACRVM APPKIT

A standalone, reusable HTML appkit for tool-style web apps — launcher hubs,
workspace pages, floating windows, and a seed-driven theme system.

**Zero dependencies. Zero build.** Plain HTML, vanilla JS Custom Elements,
plain CSS. Files are served as-is.

**Live: <https://sacrvm.github.io/sacrvm-appkit/>** — landing page, style
guide, demo app and roadmap, all built with the kit.

## Run it

```bash
npx serve .        # http://localhost:3000
```

- `/styleguide/` — every token, component and pattern, live (start here)
- `/demo/` — a small real app proving the kit end-to-end

## Structure

```
kit/                    the library — copy or link this folder into your app
  css/ui.css            tokens (seed→derived theming) + global styles
  fonts/                self-hosted Inter + Outfit (woff2)
  js/lib/               sac namespace: router, icons, scope, dialog,
                        pan-zoom, help-loader, apps, hotkeys, color
  js/vendor/            marked + DOMPurify (for the help loader)
  js/components/        36 files registering 40 sac-* Custom Elements
  templates/            copy-out skeletons: launcher, tool page, SPA shell
styleguide/             the kit documenting itself (built WITH the kit)
demo/                   launcher hub → Orb Lab workspace tool → overlays
MIGRATION.md            legacy app → kit (only relevant when porting one)
```

## Theming in one paragraph

A theme is a handful of **seed colors** (`--bg`, `--fg`, `--surface`,
`--accent`, `--accent-edit`, `--accent-warm`, `--danger`, `--ok`) plus a
**light-or-dark flag** (`<html data-theme="light">`). Everything else is
derived via `color-mix()`. Per-app retheme = override `--accent`.
Full custom theme = swap the seeds. Details: style guide → Tokens & Theming.
The shape scale works the same way: three `--radius-s/m/l` tokens carry all
rounding, tunable like the seeds. State colors ship an AA layer (`-fill`,
`-text`, `--on-*`) solved to WCAG 2.1 AA in both themes.

## License

MIT — see `LICENSE`. Vendored: marked (MIT), DOMPurify (Apache-2.0/MPL-2.0).
