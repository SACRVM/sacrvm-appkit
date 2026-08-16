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

The root page is a **shell**: one hub, and everything else — style guide,
roadmap, demo tool — is an app that runs on its stage (`sac.apps`,
`kind: "view"`). Apps project their own navigation into the shell's rail and
address their state through the hash (`#/styleguide/components`).

## Write an app for it

An app is a repository: `app.json`, one custom element in one classic script,
its stylesheet, and a page to develop it in. No build, no packaging — enable
GitHub Pages and any desktop installs it from the repository URL.

- **[Build an App](https://sacrvm.github.io/sacrvm-appkit/#/build)** — the
  contract end to end: the three hooks, the manifest, publishing, the checklist.
- **[sacrvm-app-template](https://github.com/SACRVM/sacrvm-app-template)** —
  *Use this template*, rename five strings, you are writing your app.
- Finished examples: [calculator](https://github.com/SACRVM/sacrvm-calculator)
  (window) · [notes](https://github.com/SACRVM/sacrvm-notes) (view) ·
  [desktop](https://github.com/SACRVM/sacrvm-desktop) (a host that installs them).

## Structure

```
kit/                    the library — copy or link this folder into your app
  css/ui.css            tokens (seed→derived theming) + global styles
  fonts/                self-hosted Inter + Outfit (woff2)
  js/lib/               sac namespace: router, icons, scope, dialog,
                        pan-zoom, help-loader, apps, hotkeys, color
  js/vendor/            marked + DOMPurify (for the help loader)
  js/components/        37 files registering 41 sac-* Custom Elements
  templates/            copy-out skeletons: app shell, launcher, tool page,
                        SPA shell, and two app skeletons (dialog, fullscreen)
styleguide/             the kit documenting itself (built WITH the kit)
build/                  "Build an App" — the authoring guide, itself an app
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
