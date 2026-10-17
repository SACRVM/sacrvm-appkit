---
name: sacrvm-design
description: >
  Design rules for SACRVM APPKIT apps: any repo that vendors the appkit `kit/` folder or builds
  with `sac-*` web components (sac-dialog, sac-window, sac-nav, sac-menu, sac.contextMenu,
  sac.toast, …), and sacrvm-appkit itself. Apple's interface principles (the WWDC fluid-interface
  talks, the HIG's layout rules) expressed in appkit tokens, components and runtime, with appkit's
  settled decisions taking precedence. Use it to build or review UI in an appkit app: "review this
  screen", "build a sheet / dialog / menu / drawer / toolbar", layout, spacing, button hierarchy,
  press feedback, drag and gestures, springs and momentum, glass materials, colour and theming,
  typography, reduced motion, touch and compact layouts. In appkit repos use it instead of generic
  Apple or HIG design skills; consult apple-hig-review only to look up a HIG page.
---

# sacrvm-design

How appkit apps should look, move and respond. Apple is the yardstick, and appkit decides: every
rule here is Apple's thinking expressed in appkit's tokens and components. Where the two disagree,
the appkit decision wins (section 1).

This skill does not repeat what the kit already does well. It points to it. Most words go to the
gaps and to using the kit's own parts correctly.

## 0. First, place yourself

- **Is it an appkit app?** It is if the repo has `kit/VERSION` and `kit/css/ui.css`, the markup uses
  `<sac-…>` tags, or the repo is sacrvm-appkit itself.
- **Consumer app: never edit `kit/`.** It is a vendored copy (see `CONSUMING.md` in sacrvm-appkit).
  A defect inside a kit component goes to sacrvm-appkit as an issue or a Firepit message. The app
  works around it in its own CSS/JS until a kit release lands. In sacrvm-appkit, `kit/` is the
  product, and a fix there must keep the style guide true.
- **Hosted or standalone?** On the desktop an app runs on the host's kit and the host owns theme and
  language. Standalone (F5, its own `index.html`), the app's own `kit/` and its own nav apply.

## 1. Precedence: where Apple and appkit disagree

| Apple says | appkit decided | Do this |
| --- | --- | --- |
| Use the system font first | Self-hosted Inter (UI, body) + Outfit (display), woff2, no CDN | Use the kit fonts. Apple's type craft (tracking, leading, weight) still applies to them (section 8). |
| Design light first | Dark is the default theme (the Fishbowl seeds); the light theme is signed off and deliberately bright | Design and check dark first, then light. Both must work. |
| No app-specific appearance switch | One global theme and language, owned by the host; a standalone app puts `<sac-theme-toggle>` / `<sac-lang-toggle>` in its own nav | A hosted app never adds a switch. It reads `context.theme` / `context.lang`. Standalone apps use the kit toggles, never a custom one. |
| Example code built on a motion library | Zero dependencies, no build step | Vanilla JS and CSS only. Spring recipes are in `references/motion.md`. |
| Material recipes in `rgba()` / white | No raw colours: seeds plus tokens derived with `color-mix()` | Build every colour from tokens (section 7). |
| Continuous ("squircle") corners | `--radius-s` 2px · `--radius-m` 4px (controls) · `--radius-l` 6px (surfaces) | Use the radius tokens. Skip `corner-shape` experiments. |

When a HIG rule meets an appkit rule not listed here, follow appkit and name the conflict in your
answer. If it is a real open question, ask the user. Don't decide it yourself.

## 2. Kit rules that are not up for review

- **Seeds → derived tokens.** A theme is 8 seeds plus the light/dark flag. An app's identity is one
  `--accent` override on its root. No hex, `rgb()`, `hsl()` or named colours in app CSS, inline
  styles or JS. The one exception is the seed values of a custom theme.
- **Ink pairs are contrast-tuned per theme; use them, don't mix new ones.** Coloured text on a
  surface: `--accent-text`, `--danger-text`, `--ok-text`, `--accent-warm-text`. Coloured fills:
  `--accent-fill`, `--danger-fill`. Ink on fills: `--on-accent`, `--on-danger`, `--on-warm`, `--on-ok`.
- **One meaning per colour.** `--accent` = interactive / identity. `--accent-edit` = edit modes.
  `--accent-warm` = attention, unsaved, shared. `--danger` = destructive, error. `--ok` = success.
  `--palette-*` = user categories (chips, tags), never UI state.
- **No thick (≥ 2px) coloured border on a rounded surface.** Show kind or state through icon colour
  or a 6–8% `color-mix()` tint. 1px `--border` / `--border-strong` hairlines are fine.
- **Context menus, not hover "⋯".** Every surface with actions opens its own menu through
  `sac.contextMenu`: right-click, Shift+F10 or the Menu key, and a 500ms long-press on touch.
  Nothing may be reachable by hover alone (`.hover-reveal` is shown permanently on touch).
- **Responsive.** Page layout reacts to `@media`: compact ≤ 768px, narrow ≤ 480px only where a part
  needs it. Components react to their container (`@container`), because they also live in narrow
  `sac-window`s and `sac-split` panels. Desktop (≥ 1024px) is the reference.
- **Every visible string goes through `sac.t(key, fallback)`** (app strings via `sac.i18n.add`).
  Layouts must survive German, which runs about 30% longer.
- **Light-DOM CSS does not reach into shadow roots.** Style kit components through their custom
  properties and attributes.

## 3. Layout and hierarchy

- **Hit targets.** Under `(pointer: coarse)` every control gets a 44 × 44px hit area. The kit does
  this for its own controls (`.btn` min-height 44px, `--tool-btn-size` 44px, `::after` halos on
  small parts). App-made controls do the same with padding or the kit's halo idiom,
  `::after { content: ""; position: absolute; inset: min(0px, calc((100% - 44px) / 2)); }`.
  Never enlarge the artwork to get there. With a fine pointer, smaller sizes are fine
  (`--icon-btn-size` 26px).
- **Emphasis by style, not size.** One `.btn.primary` per view, two at most. The rest are plain
  `.btn`; destructive actions get `.btn.danger`. Buttons in one row share one height
  (`.toolbar .btn` is 32px).
- **Group by spacing first.** Use a box (`.card`, a `--panel` background, `<sac-section>`) only when
  spacing is not enough, and never put a box inside a box: sub-groups get spacing and alignment.
  A box that nearly fills its container no longer separates anything.
- **Reading order is hierarchy.** The most important thing goes top and leading. Align edges. Prefer
  progressive disclosure (`<sac-collapsible>`, `<sac-section>`, a submenu) over cramming.
- **Insets.** Keep controls off the screen edge and respect `env(safe-area-inset-*)` on compact (as
  the `sac-dialog` sheet does). Backgrounds may bleed to the edge.
- **Navigation is not action.** `<sac-tabs>` and nav sections switch places. Actions live in the
  nav's toolbar slot, a `.toolbar` or a context menu. Never hide an empty section; show an
  `.empty-state` inside it.
- **One icon set.** Use `<sac-icon>` from `sac.icons`, at the size its pattern sets (`--icon-size`).
  No emoji or second icon font as UI icons.
- **Specific labels.** Name things for what they hold ("Rules", "Library"), not with umbrella words.
  Titles in sentence case; captions through the `--caption-*` pattern.
- **Measure, don't eyeball.** Check repeated items with `getBoundingClientRect()` (centre to centre,
  ±1px). Check the longest label, in German, at the narrowest width (375px) and the computed hit
  areas. A screenshot does not show a 4px misalignment.

## 4. Response: feedback starts at the press

- **React on pointer-down, never on release.** Use `:active` (or a `[data-pressed]` set on
  `pointerdown`) with `transform: scale(0.97)` over ~100ms ease-out, or the `--hover-strong` wash
  (the kit's `.icon-btn:active` idiom). As of kit 2.32, many kit controls still lack a press state.
  That is a known kit gap; app-made controls must not copy it.
- **Never `transition: all`.** Name the properties (`transform`, `opacity`, `background-color`,
  `border-color`, `box-shadow`). `all` also animates layout properties and every theme switch.
- **No latency on the input path.** No debounce on direct input, no waiting for a transition to
  finish before accepting the next input, no double-tap detection where there is no double tap.
- **Touch leaves `:hover` stuck after a tap.** Reset hover looks under `@media (hover: none)`, as
  every kit component does.
- **Put each kind of feedback in its place.** Status: `<sac-progress>`, `<sac-spinner>`,
  `<sac-loader>`. Completion: `sac.toast(msg, { kind: "success" })`. Warning: `<sac-status-banner>`
  (inline, stays). Error: inline at the field (`sac.dialog.prompt`'s `validate`) or a banner. A toast
  never carries something that must be read before the user can go on.

## 5. Direct manipulation

- **Use the kit's drag machinery before writing your own.** `sac.sortable` / `sac.tiles.sortable`
  reorder with 1:1 tracking, Escape-to-cancel, auto-scroll, and a 250ms long-press or a handle on
  touch. Also available: `sac.setupPanZoom` (canvases), `<sac-split>` (dividers), `<sac-slider>`.
- **Writing your own drag:**
  - Use Pointer Events with `setPointerCapture`, and keep the grab offset (never snap to centre).
  - Move with `transform` on every `pointermove`, with no transition during the drag.
  - Keep ~100ms of samples for the release velocity.
  - Wait for ~10px of movement before committing to a direction.
  - Set `touch-action` on the drag surface. Put `[data-no-long-press]` where a still finger paints,
    so the kit's long-press menu stays out.
  - Escape and `pointercancel` put the item back.
- **Track continuously from the first move.** A swipe detected only on `touchend` throws away the
  tracking the user needs to see.

## 6. Motion

- **CSS for state, springs for releases.** Transitions and keyframes are right for things nobody
  holds: hover, a menu opening, a toast arriving. Anything released from a gesture needs a spring,
  because only a spring starts from the value on screen and takes over the finger's velocity: a
  dragged window, a sheet pulled down, a drawer swiped, a tile dropped.
- **The kit has no spring primitive yet.** Write one in vanilla JS from `references/motion.md`
  (spring by damping ratio + response, velocity handoff, momentum projection, rubber-band). Never
  pull in a library.
- **Spring values.**
  - Damping ratio 1.0 (no overshoot) with a response of 0.3–0.4s is the default.
  - Use ~0.8 only when the release carried momentum (a flick).
  - Pick the target from the projected resting point, not from where the finger let go.
- **Interruptible.** Grabbing a moving element continues from where it is, so read the current
  value, not the target. Never lock input during a transition.
- **Easing tokens.** `--ease-smooth` is the default for UI state. `--ease-swift` is for panel slides
  (drawer, split). `--ease-bounce` overshoots: keep it off new hover and press states. The kit still
  uses it on `.btn.primary` and `.tile` hover, an inherited look that the user has yet to decide on.
- **Durations, as the kit uses them.** 100–160ms for menus, tooltips and washes; ~220ms for the
  sheet; 0.2–0.4s for hover lifts. Keep app motion in that range.
- **Spatial consistency.** Things leave the way they came. A sheet rising from the bottom leaves
  downwards, and a panel from the right leaves to the right. Anything that grows does so from its
  trigger: set `transform-origin` on the trigger's side, and when a popover flips above its anchor,
  flip its entry offset too.
- **Animate only `transform` and `opacity`.** Use `will-change` only on what is about to move. The
  `.tile`'s permanent layer is a deliberate exception that prevents hover flicker.
- **Reduced motion.** Every kit component honours `prefers-reduced-motion`. App code needs its own
  `@media (prefers-reduced-motion: reduce)` branch: no slide, scale, bounce or spring, at most an
  opacity cross-fade of ≤ 200ms. JS springs jump to the target. A document rule does not reach into
  a component's shadow root.

## 7. Materials and depth

- **Tokens.**
  - `--glass` covers floating surfaces (windows, overlays) and `--glass-strong` menus and the nav
    ribbon, both used with `backdrop-filter: blur(12–14px)`.
  - `--panel` / `--panel-2` are opaque: sidebars, cards, an elevated panel.
  - `--field` is for inputs.
  - `--shadow-1` is for things raised a little and `--shadow-2` for things floating (menus,
    dialogs, windows).
  - A bigger surface reads thicker: `--shadow-2` and the stronger glass.
- **Never translucent on translucent.** A `--glass-strong` menu over a `--glass` window is fine. A
  glass card inside a glass window is not: use `--panel-2` inside glass.
- **Modal or parallel.** A task that blocks gets `<sac-dialog>` / `sac.dialog.*`: a scrim, and a
  bottom sheet on compact on its own. A tool that runs alongside gets `<sac-window>` (no scrim).
  Don't build a third kind.
- **Text on glass** uses `--text` or `--text-muted`, never `--text-dim`. Small text on glass uses
  weight 500 or more.
- **Blur needs fallbacks.** As of kit 2.32 the kit has none (a known gap). Every `backdrop-filter`
  surface an app builds itself gets:

  ```css
  @media (prefers-reduced-transparency: reduce) {
      .my-surface { background: var(--panel-2); backdrop-filter: none; -webkit-backdrop-filter: none; }
  }
  @media (prefers-contrast: more) {
      .my-surface {
          background: var(--panel-2);
          backdrop-filter: none; -webkit-backdrop-filter: none;
          border-color: color-mix(in srgb, var(--fg) 45%, transparent);
      }
  }
  ```

## 8. Typography

- **Fonts.** Inter 400/500/600 for UI and body. Outfit 600/700/800 for headings and captions:
  `h1`–`h6` are already set, captions use `--caption-font/size/weight/tracking`. `--font-mono` for
  code.
- **Size in rem** (the root is 14px), so layout grows with the user's text size. Shadow-DOM control
  chrome inside kit components may stay in px.
- **Tracking by size.**
  - Display text tightens: the kit uses −0.02em on headings and −0.03em on the hub title.
  - Body text stays at 0.
  - Small uppercase text opens up: `--caption-tracking` is 0.12em, `.btn` 0.02em.
  - Small text never gets negative tracking.
- **Leading.** About 1.1 on large headings, about 1.5 for body text, tighter in dense data views.
- **Hierarchy from weight, size and the text steps** (`--text` → `--text-muted` → `--text-dim`)
  together, not size alone. `--text-dim` is for hints and metadata only, never for text that must be
  read.

## 9. Components first

A hand-built version of any of these is a finding.

| Need | appkit |
| --- | --- |
| Ask, confirm, rename | `sac.dialog.confirm` / `.prompt` / `.info` (a sheet on compact, Enter on the default button, Escape cancels) |
| Irreversible destructive action | `confirm` with `{ kind: "destructive", armAfterMs }` |
| Reversible action | Do it, then offer Undo through `sac.toast(msg, { action })`: forgiveness beats confirmation |
| Floating tool, inspector | `<sac-window>` |
| Menu from a button / actions on a surface | `<sac-menu>` / `sac.contextMenu(el, { targets, items, selection })` |
| Marking several rows | `sac.selection` ("Select" becomes the first context-menu entry) |
| Reorder | `sac.sortable`; hub tiles: `<sac-launcher>` / `sac.tiles.sortable` (arrange mode built in) |
| Transient / lasting feedback | `sac.toast` / `<sac-status-banner>` |
| Hint, shortcuts, search-to-act | `<sac-tooltip>`, `<sac-shortcut-bar>` / `<sac-shortcut-sheet>`, `<sac-command-palette>` |
| Exclusive modes / sections / on-off | `<sac-segmented-control>` / `<sac-tabs>` / `<sac-toggle>` |
| Pick, number, date, colour, tags | `<sac-select>`, `<sac-number-field>` / `<sac-stepper>` / `<sac-slider>`, `<sac-date-field>` / `<sac-time-field>` / `<sac-calendar>`, `<sac-color-field>`, `<sac-chip-input>` |
| List + detail | `<sac-split>` (one panel at a time on compact, with a back bar) |
| App frame | `<sac-nav>` (ribbon, burger, rail drawer on compact) + `.main-layout`; starting points in `kit/templates/` |
| Nothing here yet | `.empty-state`: icon, title, one line, one action |
| About, credits | `sac.about` |

The live reference for every component, attribute and event is the style guide
(https://sacrvm.github.io/sacrvm-appkit/, or `styleguide/` in the kit repo).

## 10. Reviewing a screen

1. **Context.** Is it a consumer app or the kit? Hosted or standalone? Which layouts does it ship
   (desktop, compact, touch)? What is this screen's one job? Infer it, and ask only if the answer
   would change the review.
2. **Look at the real thing.** Run it and check:
   - both themes (`data-theme`);
   - 375px with touch emulation;
   - German strings;
   - real numbers from `getBoundingClientRect()` / `getComputedStyle()`, not estimates from a
     screenshot.
3. **Grep the app's own code** (exclude the vendored `kit/`) for the mechanical violations:

   ```bash
   grep -rnE "#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(" --include=*.css --include=*.js --include=*.html --exclude-dir=kit .
   grep -rnE "transition: *all" --include=*.css --include=*.js --exclude-dir=kit .
   grep -rnE "border(-left|-right|-top|-bottom)?: *[2-9]px solid var\(--" --exclude-dir=kit .
   grep -rn "backdrop-filter" --exclude-dir=kit .   # each one needs the section 7 fallbacks
   ```

4. **Audit worst first, through five lenses in this order:**
   1. **Accessibility** (Critical): contrast from real values; 44px under coarse; the keyboard path
      including Shift+F10 and Escape; visible focus; reduced motion; nothing hover-only.
   2. **Conventions** (usually High): appkit's first (sections 2 and 9), then the platform's.
   3. **Craft** (High / Medium): tokens, hierarchy, spacing rhythm, type, materials.
   4. **Interaction** (Medium): press feedback, drag, motion, interruptibility.
   5. **Writing** (Medium): specific labels, sentence case, `sac.t` coverage, German length.
5. **Report.**
   - A summary with a rating (Excellent / Good / Needs work / Critical issues) and the screen's job.
   - Then Critical, Improvements (tagged High / Medium / Low) and What works.
   - Each finding gives what is wrong (with numbers), why, and the fix in appkit terms (token,
     component, attribute).
   - For "why", cite an appkit rule (a CLAUDE.md decision, a style-guide page, a section here) or a
     HIG page looked up in `apple-hig-review` (`references/hig/<page>.md`), or label it "judgment".
   - Mark kit defects separately: they go to sacrvm-appkit, not into the app.

Ground rules:

- Numbers, not adjectives.
- Never invent a guideline.
- Name the trade-off when a rule collides with what the app needs.
- Review the flow, not only the screen.
- A strong screen gets a short review.
- Don't flatten the app's personality: its `--accent`, voice and signature details are the point.

## 11. The principles underneath

Apple's eight design principles (WWDC 2026), as they show up in appkit work:

1. **Purpose.** Build what earns the user's attention, and decide what not to build.
2. **Agency.** Leave choices, make slips undoable (toast Undo), and confirm only the irreversible
   (armed destructive buttons).
3. **Responsibility.** Act in the user's interest: ask for data at the moment it is needed, preview
   before acting, keep risk out.
4. **Familiarity.** The same thing looks and behaves the same everywhere, which is why the
   components come first.
5. **Flexibility.** Desktop pointer, touch, compact, keyboard: one app, every input.
6. **Simplicity, not minimalism.** Lead with the common path and put advanced options one level
   deeper.
7. **Craft.** Every spacing, timing and colour is a token or a deliberate value you can defend.
8. **Delight.** The result of the other seven, not decoration added on top.

## Keeping this skill true

This skill lives in sacrvm-appkit (`.claude/skills/sacrvm-design/`) and is linked into
`~/.claude/skills/` for consumer repos. When the kit closes a gap named here (springs, transparency
and contrast fallbacks, press states), update the matching section in the same commit.

## Sources and credit

Written in our own words from:

- **Emil Kowalski, `apple-design` skill** (MIT, https://github.com/emilkowalski/skills): the motion,
  gesture, material, typography and principle rules. The projection and rubber-band formulas come
  from it, and through it from Apple's WWDC 2018 talk *Designing Fluid Interfaces*.
- **t2murata, `apple-hig` gist** (https://gist.github.com/t2murata/d61bbf6f00367732fca25eb17a5cfa27):
  the static layout rules.
- **dickwu, `apple-design-skill`**: the review workflow (measure, cite or label as judgment, five
  lenses worst first). Installed locally as `apple-hig-review` for HIG lookups. Its HIG text is
  Apple's own wording and is never copied into this repo.
- **Apple**: the Human Interface Guidelines and the WWDC sessions *Designing Fluid Interfaces*
  (2018), *The Details of UI Typography* (2020) and *Principles of Great Design* (2026).
