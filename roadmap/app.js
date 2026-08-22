/**
 * <app-roadmap> — the roadmap as a view app.
 *
 * kind:"view": it runs on the shell's stage, not in a document of its own.
 * The app is COMPLETE: its own nav (with the host's injected jump), its own
 * rail (<sac-sidebar>, items property), its own scrolling body. The section
 * you are reading is addressed through the sub-route ("#/roadmap/the-gaps"),
 * so a link lands where it points.
 */
(function () {
    // Resolved at parse time: the app's own folder, wherever it was injected
    // from. Its stylesheet is a sibling.
    const BASE = document.currentScript.src.replace(/[^/]+$/, "");
    const CSS_ID = "sac-app-roadmap-css";

    /** One <link> per document, however often the app is created. */
    function ensureStyles() {
        if (document.getElementById(CSS_ID)) return;
        const link = document.createElement("link");
        link.id = CSS_ID;
        link.rel = "stylesheet";
        link.href = BASE + "roadmap.css";
        document.head.appendChild(link);
    }

    // Trim AFTER the cut too, or a slug can end on the dash the cut created.
    const slug = (text) => text.toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .slice(0, 40)
        .replace(/^-+|-+$/g, "");

    class AppRoadmap extends HTMLElement {
        connectedCallback() {
            if (this.firstElementChild) return;   // a stage swap re-connects
            ensureStyles();

            // The app is complete: its own nav, its own rail, its own
            // scrolling body. A host adds nothing but context.host.
            this._nav = document.createElement("sac-nav");
            this._nav.setAttribute("brand", "ROADMAP");
            this._nav.setAttribute("brand-icon", "document");
            this._nav.setAttribute("brand-href", "#/roadmap");
            const ctxSlot = document.createElement("div");
            ctxSlot.slot = "context";
            ctxSlot.appendChild(document.createElement("sac-theme-toggle"));
            this._nav.appendChild(ctxSlot);

            const layout = document.createElement("div");
            layout.className = "main-layout";
            this._rail   = document.createElement("sac-sidebar");
            this._scroll = document.createElement("div");
            this._scroll.className = "app-scroll";
            layout.append(this._rail, this._scroll);
            this.append(this._nav, layout);

            this._scroll.innerHTML = `
<div class="rm-page">
    <header>
        <h1>Gap Analysis &amp; Roadmap</h1>
        <p class="lead">
            The appkit measured against the community's favorite comparable kits
            (researched 2026-08). What they have that we don't, what we have that
            nobody else does, and the order we'll close the gaps in.
            <b>Status legend:</b>
            <sac-chip label="open" color="gray"></sac-chip>
            <sac-chip label="in progress" color="yellow"></sac-chip>
            <sac-chip label="done" color="green"></sac-chip>
            <sac-chip label="decided against" color="red"></sac-chip>
        </p>
    </header>

    <!-- ============================================================ -->
    <h2>1 · The field — who the community loves, and why</h2>
    <div class="rm-cards">
        <div class="card rm-card">
            <div class="rm-card-head"><sac-icon name="star"></sac-icon><h3>Web Awesome / Shoelace</h3></div>
            <p class="who">THE web-components favorite (Font Awesome team). ~45 framework-agnostic
               components, accessible by default, themed via CSS custom properties.</p>
            <p class="steal"><b>Steal:</b> the component <em>vocabulary</em> (tooltip, tabs, toast,
               progress, split-panel, dropdown/menu, skeleton), the autoloader convenience, and the
               a11y discipline (focus management, ARIA, live regions).</p>
        </div>
        <div class="card rm-card">
            <div class="rm-card-head"><sac-icon name="document"></sac-icon><h3>Pico CSS</h3></div>
            <p class="who">The classless-CSS darling: semantic HTML looks right with zero classes,
               &lt;10 KB, no build — the same philosophy we run on.</p>
            <p class="steal"><b>Steal:</b> how far the <em>element baseline</em> goes — Pico styles
               tables, kbd, details, dialogs, figures out of the box. Our ui.css skips several
               plain elements (notably <code>&lt;table&gt;</code>).</p>
        </div>
        <div class="card rm-card">
            <div class="rm-card-head"><sac-icon name="settings"></sac-icon><h3>Open Props</h3></div>
            <p class="who">The design-tokens favorite: a CSS-custom-property system for color ramps,
               spacing, radii, typography, shadows, easings. Loved for being adoptable piecemeal.</p>
            <p class="steal"><b>Steal:</b> the idea of <em>scale tokens</em> — we derive colors
               beautifully but still hardcode spacing/radius/font sizes per component.</p>
        </div>
        <div class="card rm-card">
            <div class="rm-card-head"><sac-icon name="shapes"></sac-icon><h3>daisyUI</h3></div>
            <p class="who">The most-starred Tailwind component set (~60 components). Wrong stack for
               us, but the best checklist of what apps actually need.</p>
            <p class="steal"><b>Steal:</b> the inventory: toast, tabs, breadcrumbs, pagination,
               steps, stat tiles, kbd, theme controller, validator states, empty states.</p>
        </div>
        <div class="card rm-card">
            <div class="rm-card-head"><sac-icon name="copy"></sac-icon><h3>WinBox.js</h3></div>
            <p class="who">HN-beloved zero-dependency floating window manager — the reference for
               what a web window can do.</p>
            <p class="steal"><b>Steal:</b> minimize / maximize / restore, double-click-title to
               maximize, viewport-edge clamping. Our sac-window only closes.</p>
        </div>
        <div class="card rm-card">
            <div class="rm-card-head"><sac-icon name="search"></sac-icon><h3>ninja-keys</h3></div>
            <p class="who">Community favorite command palette — a single web component, works in
               plain HTML, keyboard-first.</p>
            <p class="steal"><b>Steal:</b> the whole idea. A kit with a router, a toolbar API and an
               icon registry is 80% of the way to a great Ctrl-K palette.</p>
        </div>
    </div>

    <!-- ============================================================ -->
    <h2>2 · What we have that none of them do</h2>
    <p>Worth naming before we chase gaps — the appkit's identity is the part nobody else ships:</p>
    <ul class="rm-strengths">
        <li><b>A whole app shell</b> — hash router + self-registering views + nav that renders itself. Shoelace gives you parts; we give you the car.</li>
        <li><b>The workspace layout</b> — fixed nav / sidebar / viewport with pan-zoom, HUD, log. Purpose-built for tools; no component library has this.</li>
        <li><b>Floating windows + launcher overlays</b> with <code>?tool=</code> deep links — lazy tools as custom elements.</li>
        <li><b>Seed-derived theming</b> — 8 seeds + a flag → the whole palette via <code>color-mix()</code>. Open Props gives tokens; we give the derivation.</li>
        <li><b>Armed destructive dialogs, scoped workspaces, scene graph, synchronized pan-zoom</b> — battle-tested in production before the kit existed.</li>
    </ul>

    <!-- ============================================================ -->
    <h2>3 · The gaps</h2>

    <h3>Tier 1 — essentials every loved kit has (do first)</h3>
    <table class="rm">
        <tr><th>Item</th><th>What / why</th><th>Inspired by</th><th>Effort</th><th>Status</th></tr>
        <tr data-item="toast">
            <td><code>sac-toast</code></td>
            <td>Notification stack (corner, auto-dismiss, kinds on semantic seeds, ARIA live region). Our status-banner is inline-only — every app needs "saved ✓" feedback.</td>
            <td>Shoelace alert.toast(), daisyUI</td><td>M</td>
            <td><sac-chip label="done" color="green"></sac-chip></td>
        </tr>
        <tr data-item="tooltip">
            <td><code>sac-tooltip</code></td>
            <td>Hover/focus tooltip with delay + placement. We only have native <code>title</code>.</td>
            <td>Shoelace</td><td>M</td>
            <td><sac-chip label="done" color="green"></sac-chip></td>
        </tr>
        <tr data-item="tabs">
            <td><code>sac-tabs</code></td>
            <td>Tab group + panels. Long promised in older docs, never real — the kit finally ships it.</td>
            <td>Shoelace, daisyUI</td><td>M</td>
            <td><sac-chip label="done" color="green"></sac-chip></td>
        </tr>
        <tr data-item="progress">
            <td><code>sac-progress</code> + <code>sac-spinner</code></td>
            <td>Inline progress bar (+ indeterminate) and small spinner. Our loader is fullscreen-only.</td>
            <td>Shoelace, daisyUI</td><td>S</td>
            <td><sac-chip label="done" color="green"></sac-chip></td>
        </tr>
        <tr data-item="menu">
            <td><code>sac-menu</code></td>
            <td>Dropdown / context menu <em>behavior</em> (open/close, outside-click, keyboard, submenu) on top of the .floating-menu look — today it's CSS only.</td>
            <td>Shoelace dropdown+menu</td><td>M</td>
            <td><sac-chip label="done" color="green"></sac-chip></td>
        </tr>
        <tr data-item="table">
            <td><code>&lt;table&gt;</code> baseline</td>
            <td>Global table styling in ui.css (the styleguide had to invent its own — that's the gap talking).</td>
            <td>Pico</td><td>S</td>
            <td><sac-chip label="done" color="green"></sac-chip></td>
        </tr>
        <tr data-item="theme-auto">
            <td>Auto theme + <code>sac-theme-toggle</code></td>
            <td><code>data-theme="auto"</code> follows <code>prefers-color-scheme</code>; a Dark/Light/Auto toggle component (the styleguide switcher, promoted into the kit).</td>
            <td>Water.css, daisyUI theme controller</td><td>S</td>
            <td><sac-chip label="done" color="green"></sac-chip></td>
        </tr>
        <tr data-item="reduced-motion">
            <td>Reduced motion</td>
            <td><code>prefers-reduced-motion</code> media query neutralizing the motion rails — a11y table stakes in every loved kit.</td>
            <td>Shoelace, Pico</td><td>S</td>
            <td><sac-chip label="done" color="green"></sac-chip></td>
        </tr>
        <tr data-item="skeleton">
            <td>Skeleton pattern</td>
            <td>.skeleton shimmer class for loading placeholders.</td>
            <td>Shoelace, daisyUI</td><td>S</td>
            <td><sac-chip label="done" color="green"></sac-chip></td>
        </tr>
        <tr data-item="autoloader">
            <td><code>kit/js/all.js</code></td>
            <td>One classic script that injects lib + all components in the right order — Shoelace's autoloader convenience, zero build kept.</td>
            <td>Shoelace autoloader</td><td>S</td>
            <td><sac-chip label="done" color="green"></sac-chip></td>
        </tr>
    </table>

    <h3>Tier 2 — workspace power (our home turf, do second)</h3>
    <table class="rm">
        <tr><th>Item</th><th>What / why</th><th>Inspired by</th><th>Effort</th><th>Status</th></tr>
        <tr data-item="split">
            <td><code>sac-split</code></td>
            <td>Resizable split panel — and with it a resizable sidebar. Tool apps live in this.</td>
            <td>Shoelace split-panel</td><td>M</td>
            <td><sac-chip label="done" color="green"></sac-chip></td>
        </tr>
        <tr data-item="dropzone">
            <td><code>sac-drop-zone</code></td>
            <td>Drag-&amp;-drop + file-picker surface ("drop your SVG here"). Every tool page so far re-invented this.</td>
            <td>own need; daisyUI file input</td><td>M</td>
            <td><sac-chip label="done" color="green"></sac-chip></td>
        </tr>
        <tr data-item="window-max">
            <td>Window min/max</td>
            <td>sac-window: minimize + maximize/restore buttons, double-click title, viewport clamping.</td>
            <td>WinBox.js</td><td>M</td>
            <td><sac-chip label="done" color="green"></sac-chip></td>
        </tr>
        <tr data-item="palette">
            <td><code>sac-command-palette</code></td>
            <td>Ctrl-K palette fed by routes, toolbar actions and app-registered commands; plus a hotkeys helper and a .kbd style.</td>
            <td>ninja-keys, daisyUI kbd</td><td>L</td>
            <td><sac-chip label="done" color="green"></sac-chip></td>
        </tr>
        <tr data-item="crumbs">
            <td>Breadcrumbs + pagination</td>
            <td>Small nav patterns (CSS-first, component only if behavior demands).</td>
            <td>daisyUI</td><td>S</td>
            <td><sac-chip label="done" color="green"></sac-chip></td>
        </tr>
        <tr data-item="smallstuff">
            <td>Avatar · badge dot · copy button · empty state</td>
            <td>Small display helpers: initials avatar, count/dot badge, click-to-copy, "nothing here yet" pattern.</td>
            <td>Shoelace, daisyUI</td><td>S</td>
            <td><sac-chip label="done" color="green"></sac-chip></td>
        </tr>
    </table>

    <h3>Tier 3 — consumer-driven (the first real apps set the order)</h3>
    <p>Two real consumer apps — "Color Bucket" (a paint-style color-mixing tool and future
       embeddable color-picker web component) and "Atelier" (a sprite/pixel editor becoming a
       standalone app) — were analyzed, and their concrete needs now set these priorities in
       place of speculation.</p>
    <table class="rm">
        <tr><th>Item</th><th>What / why</th><th>Inspired by</th><th>Effort</th><th>Status</th></tr>
        <tr data-item="color-picker">
            <td><code>sac-color-picker</code> + <code>sac.color</code> lib</td>
            <td>Full picker: SV area, hue, optional alpha, RGB sliders + values, hex.</td>
            <td>Color Bucket, Atelier</td><td>L</td>
            <td><sac-chip label="done" color="green"></sac-chip></td>
        </tr>
        <tr data-item="swatch-grid">
            <td><code>sac-swatch-grid</code> + <code>sac-swatch</code></td>
            <td>Square swatch grid, selection ring, transparent swatch, corner count badge.</td>
            <td>Color Bucket, Atelier</td><td>M</td>
            <td><sac-chip label="done" color="green"></sac-chip></td>
        </tr>
        <tr data-item="color-field">
            <td><code>sac-color-field</code></td>
            <td>Hex input + color well opening a picker popover.</td>
            <td>Color Bucket, Atelier</td><td>M</td>
            <td><sac-chip label="done" color="green"></sac-chip></td>
        </tr>
        <tr data-item="stepper">
            <td><code>sac-stepper</code></td>
            <td>Discrete −/value/+ control with hold-repeat.</td>
            <td>Color Bucket, Atelier</td><td>S</td>
            <td><sac-chip label="done" color="green"></sac-chip></td>
        </tr>
        <tr data-item="app-contract">
            <td>App contract + personal launcher</td>
            <td>Apps as web components: <code>mount(context)</code> with { fs, identity, theme, deepLink } slots, app manifest, guarded single-tag embeds; the launcher becomes a user-composed app.</td>
            <td>own need</td><td>L</td>
            <td><sac-chip label="done" color="green"></sac-chip></td>
        </tr>
        <tr data-item="pixel-workbench">
            <td>Pixel workbench</td>
            <td>Integer-snap pan-zoom + checkerboard tokens, icon tool-ribbon, filmstrip/timeline, sortable layer list, ~14 tool icons, export dialog, shortcut cheat-sheet.</td>
            <td>Atelier</td><td>L</td>
            <td><sac-chip label="open" color="gray"></sac-chip></td>
        </tr>
        <tr data-item="date-suite">
            <td><code>sac-calendar</code> + <code>sac-date-field</code></td>
            <td>Embeddable month calendar + input with popover; native pickers stay the baseline elsewhere. A production app in the kit's family needs an embeddable calendar — the old "native is enough" stance held until a real consumer proved otherwise.</td>
            <td>own need</td><td>M</td>
            <td><sac-chip label="done" color="green"></sac-chip></td>
        </tr>
    </table>

    <h3>Parked — no consumer demands it yet</h3>
    <table class="rm">
        <tr><th>Item</th><th>Why parked</th><th>Status</th></tr>
        <tr data-item="select">
            <td><code>sac-select</code></td>
            <td>No consumer needs it; native + color-scheme still fine.</td>
            <td><sac-chip label="open" color="gray"></sac-chip></td>
        </tr>
        <tr data-item="scales">
            <td>Scale tokens</td>
            <td><code>--space-*</code> / <code>--radius-*</code> / <code>--text-*</code> — big consistency win, big churn, no demand yet.</td>
            <td><sac-chip label="open" color="gray"></sac-chip></td>
        </tr>
        <tr data-item="virtual">
            <td>Virtual list / data table</td>
            <td>Waits for a real consumer.</td>
            <td><sac-chip label="open" color="gray"></sac-chip></td>
        </tr>
        <tr data-item="md-editor">
            <td>Markdown editor add-on</td>
            <td>Standing decision: optional module, not core.</td>
            <td><sac-chip label="open" color="gray"></sac-chip></td>
        </tr>
    </table>

    <h3>Tier 4 — the shell becomes a web OS</h3>
    <table class="rm">
        <tr><th>Item</th><th>What</th><th>Status</th></tr>
        <tr data-item="shared-storage">
            <td>Shared file storage</td>
            <td><code>context.fs</code> ships: a store scoped per app (read/write/remove/list/clear/usage/watch),
                async so the bytes layer can move. The default is this browser's storage; a host swaps
                <code>sac.fs.backend</code> — four methods — for OPFS, IndexedDB or a server without any app changing.</td>
            <td><sac-chip label="done" color="green"></sac-chip></td>
        </tr>
        <tr data-item="shell-identity">
            <td>Identity in the shell</td>
            <td><code>context.identity</code> ships: the host answers who is here, apps only read it and stay
                auth-free and portable. A desktop's answer is a local profile (explicitly not authentication);
                a host with a real account system installs its own through <code>sac.identity.use()</code>.</td>
            <td><sac-chip label="done" color="green"></sac-chip></td>
        </tr>
        <tr data-item="release-embeds">
            <td>Release embeds</td>
            <td>Packaging only at release via GitHub Actions: one self-contained .js per app, prefixed internal tags, no local build ever.</td>
            <td><sac-chip label="open" color="gray"></sac-chip></td>
        </tr>
        <tr data-item="apps-own-chrome">
            <td>Apps own their chrome</td>
            <td>Owner ruling (2026-08-20): the ownership model was inverted, and now it is not.
                <strong>An app is complete and autonomous</strong> — it draws its whole UI: its
                own <code>&lt;sac-nav&gt;</code>, its own toolbar, its own rail
                (<code>&lt;sac-sidebar&gt;</code> with the <code>items</code> property).
                Standing alone it is its own host — no fake harness hull. Inside a desktop the
                host <em>injects into the app</em> (the way <code>identity</code> already works):
                <code>context.host</code> is the package — name and jump-home address, the
                suite's navigation, the host's toolbar controls — and the app renders all of it
                in its own nav (<code>nav.host = context.host</code>: the host + app title segments,
                host group in the burger panel, controls at the right end of the ribbon). The
                projection globals (<code>sac.toolbar</code>, <code>sac.sidebar</code>) are gone;
                palette-worthy actions register on <code>sac.commands</code>. This shell, all its
                apps and the templates run the model.</td>
            <td><sac-chip label="done" color="green"></sac-chip></td>
        </tr>
    </table>

    <h3>Delivery — how other projects consume the kit</h3>
    <p>Primary model: <strong>vendoring</strong>. A consumer copies the versioned
       <code>kit/</code> folder into its repo and upgrades when <em>it</em> chooses —
       no install, no lockfile, fully offline, and version independence between apps
       by design. Everything below is produced by one GitHub Action at tag time;
       nothing ever enters the local dev workflow.</p>
    <table class="rm">
        <tr><th>Item</th><th>What</th><th>Status</th></tr>
        <tr data-item="release-zip">
            <td>Semver tag + release ZIP</td>
            <td>Semver tags; the release action attaches a ZIP of <code>kit/</code> with a VERSION stamp. See the <a href="https://github.com/SACRVM/sacrvm-appkit/releases">GitHub releases</a> for the current list.</td>
            <td><sac-chip label="done" color="green"></sac-chip></td>
        </tr>
        <tr data-item="npm-channel">
            <td>npm publish (optional channel)</td>
            <td>The same action publishes the plain files with a metadata-only <code>package.json</code> — zero dependencies, zero scripts; skips quietly until an <code>NPM_TOKEN</code> secret exists. We never use npm ourselves; people who live there shouldn't trip over us.</td>
            <td><sac-chip label="done" color="green"></sac-chip></td>
        </tr>
    </table>

    <h3>Non-goals (decided against, so we stop re-deciding)</h3>
    <table class="rm">
        <tr><th>Item</th><th>Why not</th><th>Status</th></tr>
        <tr><td>Charts / data-viz</td><td>Separate concern; apps bring their own.</td><td><sac-chip label="decided against" color="red"></sac-chip></td></tr>
        <tr><td>i18n / localization layer</td><td>Single-language apps for now; revisit if a consumer needs it.</td><td><sac-chip label="decided against" color="red"></sac-chip></td></tr>
        <tr><td>Framework wrappers (React/Vue)</td><td>Against the whole point. Custom elements already work everywhere.</td><td><sac-chip label="decided against" color="red"></sac-chip></td></tr>
        <tr><td>CDN delivery (jsDelivr etc.)</td><td>The kit is self-hosted and offline by value — no foreign infrastructure in consumers.</td><td><sac-chip label="decided against" color="red"></sac-chip></td></tr>
        <tr><td>NuGet</td><td>.NET's package manager — wrong ecosystem for an HTML/JS kit.</td><td><sac-chip label="decided against" color="red"></sac-chip></td></tr>
        <tr><td>Carousel, QR, image comparer, mockups</td><td>Marketing-site furniture, not tool furniture.</td><td><sac-chip label="decided against" color="red"></sac-chip></td></tr>
    </table>

    <!-- ============================================================ -->
    <h2>4 · Feature matrix</h2>
    <div class="rm-scroll">
    <table class="rm rm-matrix">
        <tr><th></th><th>SACRVM</th><th>Web Awesome</th><th>Pico</th><th>Open Props</th><th>daisyUI</th></tr>
        <tr><td>Zero build / no npm</td><td>✔</td><td>✔ (CDN)</td><td>✔</td><td>✔ (CDN)</td><td>✘ (Tailwind)</td></tr>
        <tr><td>Web components</td><td>✔ 40</td><td>✔ ~45</td><td>—</td><td>—</td><td>—</td></tr>
        <tr><td>Token theming</td><td>✔ seeds→derived</td><td>✔ props</td><td>✔ vars</td><td>✔✔ scales</td><td>✔ themes</td></tr>
        <tr><td>Dark + light</td><td>✔ auto</td><td>✔</td><td>✔ auto</td><td>✔</td><td>✔ many</td></tr>
        <tr><td>App shell / router</td><td>✔✔</td><td>✘</td><td>✘</td><td>✘</td><td>✘</td></tr>
        <tr><td>Workspace layout + pan-zoom</td><td>✔✔</td><td>✘</td><td>✘</td><td>✘</td><td>✘</td></tr>
        <tr><td>Floating windows + launcher</td><td>✔✔</td><td>✘</td><td>✘</td><td>✘</td><td>✘</td></tr>
        <tr><td>Toast</td><td>✔</td><td>✔</td><td>✘</td><td>✘</td><td>✔</td></tr>
        <tr><td>Tooltip</td><td>✔</td><td>✔</td><td>✔ (attr)</td><td>✘</td><td>✔</td></tr>
        <tr><td>Tabs</td><td>✔</td><td>✔</td><td>✘</td><td>✘</td><td>✔</td></tr>
        <tr><td>Progress / spinner</td><td>✔</td><td>✔</td><td>✔</td><td>✘</td><td>✔</td></tr>
        <tr><td>Dropdown menu</td><td>✔</td><td>✔</td><td>✔</td><td>✘</td><td>✔</td></tr>
        <tr><td>Split panel</td><td>✔</td><td>✔</td><td>✘</td><td>✘</td><td>✘</td></tr>
        <tr><td>Command palette</td><td>✔</td><td>✘</td><td>✘</td><td>✘</td><td>✘</td></tr>
        <tr><td>Tree view</td><td>✔</td><td>✔</td><td>✘</td><td>✘</td><td>✘</td></tr>
        <tr><td>Chips + palette slots</td><td>✔</td><td>✔ tag</td><td>✘</td><td>✘</td><td>✔ badge</td></tr>
        <tr><td>Color suite</td><td>T3</td><td>✔</td><td>✘</td><td>✘</td><td>✘ (third-party)</td></tr>
        <tr><td>Reduced motion</td><td>✔</td><td>✔</td><td>✔</td><td>✔</td><td>✔</td></tr>
    </table>
    </div>

    <p class="rm-closing">
        Net: nobody in the field is a superset of us — but the essentials row (toast, tooltip,
        tabs, progress, menus) is where every loved kit beats us, and it's all Tier 1.
        We close those first, then double down on what makes us unique.
    </p>
</div>
`;
        }

        /** App contract: called once by sac.apps, right after the first insert. */
        mount(context) {
            this._ctx = context;
            // The host's injection (jump, suite nav, toolbar controls),
            // rendered by OUR nav. Null standalone — the nav shows nothing.
            this._nav.host = context.host;

            // Every section becomes a rail entry and an address. Derived from
            // the content, so adding a section needs no second edit here.
            this._sections = Array.from(this.querySelectorAll("h2")).map((h) => {
                const id = h.id || slug(h.textContent);
                h.id = id;
                return { id, label: h.textContent.replace(/^\d+\s*·\s*/, ""), el: h };
            });
            // Offered to the burger too: hosted they nest under this app's
            // suite entry, standalone they are the list.
            this._nav.sections = this._sections.map((s) =>
                ({ label: s.label, href: context.href(s.id) }));

            this._project(context.route);
            if (context.route) this._scrollTo(context.route);

            // Back/forward, rail clicks and pasted URLs all arrive here.
            this._offRoute = context.onRoute((route) => {
                this._project(route);
                if (route) this._scrollTo(route);
            });
        }

        unmount() {
            if (this._offRoute) { this._offRoute(); this._offRoute = null; }
        }

        _project(active) {
            if (!this._ctx) return;
            this._rail.items = [
                { section: "Roadmap" },
                ...this._sections.map((s) => ({
                    label:  s.label,
                    icon:   "chevron-right",
                    href:   this._ctx.href(s.id),   // the host owns the prefix
                    active: s.id === active,
                })),
            ];
        }

        /** Instant, deliberately: a smooth scroll is a compositor animation
         *  that silently does nothing in some contexts (an unfocused tab is
         *  one), and a jump that always lands beats a glide that sometimes
         *  never starts. It is also what reduced-motion would ask for. */
        _scrollTo(id) {
            const section = this._sections.find((s) => s.id === id);
            if (section) section.el.scrollIntoView({ block: "start" });
        }
    }

    if (!customElements.get("app-roadmap")) customElements.define("app-roadmap", AppRoadmap);
})();
