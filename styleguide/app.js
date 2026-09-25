/**
 * <app-styleguide> — the style guide as ONE view app.
 *
 * kind:"view": it runs on the shell's stage, not in a document of its own.
 * Five sections live in this single element — only the active one is in the
 * DOM, because the components section alone is three dozen live demos. The
 * sub-route addresses the section ("#/styleguide/patterns") and, on the
 * components section, the component you are reading ("#/styleguide/components/
 * sac-calendar"), so every link lands where it points.
 *
 * The app is COMPLETE: it draws its own nav (with the host's injected jump,
 * context.host), its own rail (<sac-sidebar>, items property) and its own
 * scrolling body. The accent-seed playground demonstrates the per-app
 * --accent override, so it lives in the Tokens section.
 */
(function () {
    // Resolved at parse time: the app's own folder, wherever it was injected
    // from. Its stylesheet is a sibling.
    const BASE = document.currentScript.src.replace(/[^/]+$/, "");
    const CSS_ID = "sac-app-styleguide-css";

    // Resolves once the guide's own stylesheet applies. Until it does the
    // page has a different height, so anchor scrolling waits for it.
    let stylesReady = null;

    /** One <link> per document, however often the app is created. */
    function ensureStyles() {
        if (stylesReady) return stylesReady;
        if (document.getElementById(CSS_ID)) {
            stylesReady = Promise.resolve();
            return stylesReady;
        }
        const link = document.createElement("link");
        link.id = CSS_ID;
        link.rel = "stylesheet";
        link.href = BASE + "styleguide.css";
        stylesReady = new Promise((resolve) => {
            link.addEventListener("load", resolve, { once: true });
            link.addEventListener("error", resolve, { once: true });
        });
        document.head.appendChild(link);
        return stylesReady;
    }

    /* ------------------------------------------------------- write-ups --- */

    const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const code = (s) => `<pre class="sg-code"><code>${esc(s)}</code></pre>`;

    const table = (title, rows) => rows.length === 0 ? "" : `
        <table class="sg">
            <tr><th style="width:220px">${title}</th><th>Description</th></tr>
            ${rows.map(([k, v]) => `<tr><td><code>${esc(k)}</code></td><td>${v}</td></tr>`).join("")}
        </table>`;

    // A component's phone behaviour, one short line in every section it
    // applies to. The full story lives in CSS Patterns → Responsive.
    const compact = (html) => `<p class="sg-compact"><b>Compact / touch:</b> ${html}</p>`;

    const sw = (token, note) => `
        <div class="sg-swatch">
            <div class="chip" style="--sw: var(${token})"></div>
            <div class="meta"><b>${token}</b>${note || ""}</div>
        </div>`;

    // A stand-in "photo" for the sac-avatar src demo. Inline data URI, because
    // the guide must never reach out to the network to render itself.
    const DEMO_PORTRAIT =
        "data:image/svg+xml;utf8," +
        "<svg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2064%2064'>" +
        "<rect%20width='64'%20height='64'%20fill='%23475569'/>" +
        "<circle%20cx='32'%20cy='25'%20r='11'%20fill='%23cbd5e1'/>" +
        "<path%20d='M9%2064c0-13%2010-21%2023-21s23%208%2023%2021z'%20fill='%23cbd5e1'/></svg>";

    // Page-lifetime guard: the demo window lives in <body> and outlives every
    // render. (The demo commands + hotkey are scoped to the app's visibility
    // inside AppStyleguide, not registered here.)
    let windowStateWired = false;

    /* ---------------------------------------------------------- tokens --- */

    function tokensHtml() {
        return `
            <div class="sg-page">
                <h1>Tokens &amp; Theming</h1>
                <p class="lead">
                    A theme is a handful of <strong>seed colors</strong> plus a <strong>light-or-dark
                    flag</strong>; every other color is <em>derived</em> via <code>color-mix()</code>.
                    Swap a seed or flip the flag and everything re-themes — the dots below and the
                    theme toggle in the nav ribbon do it live.
                </p>

                <div class="sg-demo sg-accent-play">
                    <label>Accent seed</label>
                    <span class="sg-accent-dots" id="sg-accent-dots">
                        <button type="button" data-accent="#3b82f6" style="background:#3b82f6" title="#3b82f6 — the kit default"></button>
                        <button type="button" data-accent="#10b981" style="background:#10b981" title="#10b981"></button>
                        <button type="button" data-accent="#f59e0b" style="background:#f59e0b" title="#f59e0b"></button>
                        <button type="button" data-accent="#ec4899" style="background:#ec4899" title="#ec4899"></button>
                    </span>
                    <span class="sg-accent-note">Sets <code>--accent</code> on <code>&lt;html&gt;</code> — every
                        accent-derived token follows, live, across the whole shell.</span>
                </div>

                <h2>Neutral seeds</h2>
                <p>Three colors carry the whole ground. Keep them in one hue family, so raised surfaces
                   read as <em>raised</em>.</p>
                <div class="sg-swatches">
                    ${sw("--bg", "page ground")}
                    ${sw("--fg", "text · borders · washes")}
                    ${sw("--surface", "glass material")}
                </div>

                <h2>Semantic seeds</h2>
                <p><code>--accent</code> is the app identity and THE per-app override point — one variable
                   re-themes a whole app. The other four encode state, separate from the brand identity.</p>
                <div class="sg-swatches">
                    ${sw("--accent", "identity · primary actions")}
                    ${sw("--accent-edit", "edit modes")}
                    ${sw("--accent-warm", "shared / unsaved / attention")}
                    ${sw("--danger", "destructive · overdue")}
                    ${sw("--ok", "success")}
                    ${sw("--on-accent", "ink on accent/edit/danger fills")}
                </div>

                <h2>Derived tokens</h2>
                <p>Never set these in a theme — override a seed instead. (The cascade still lets a brand
                   pin an individual derived token as an escape hatch.)</p>
                <h3>Surfaces</h3>
                <div class="sg-swatches">
                    ${sw("--panel", "sidebars · cards")}
                    ${sw("--panel-2", "elevated panel")}
                    ${sw("--glass", "content surfaces: windows · overlays (70%)")}
                    ${sw("--glass-strong", "chrome: menus · nav ribbon (88%)")}
                    ${sw("--tile", "tiles · floating windows")}
                    ${sw("--tile-hover", "tile hover state")}
                    ${sw("--field", "input / select background")}
                </div>
                <p class="sg-note"><b>Why two glass tokens:</b> one name with two opacities is a classic
                   drift bug.</p>
                <h3>Text — two-step secondary</h3>
                <div class="sg-swatches">
                    ${sw("--text", "primary")}
                    ${sw("--text-muted", "secondary — AA on every plane")}
                    ${sw("--text-dim", "tertiary — 3:1 on --surface, never the only carrier")}
                </div>
                <h3>Lines, washes, accent derivations</h3>
                <div class="sg-swatches">
                    ${sw("--border", "hairlines")}
                    ${sw("--border-strong", "chrome hairlines")}
                    ${sw("--hover", "hover wash")}
                    ${sw("--hover-strong", "active / press wash")}
                    ${sw("--accent-strong", "primary-button hover")}
                    ${sw("--accent-tint", "active-item background")}
                    ${sw("--accent-glow", "glows · focus shadows")}
                </div>
                <h3>Pixels — checker + grid</h3>
                <p>The transparency checker and the pixel grid, for anything that shows raw pixels.
                   <code>--checker</code> is the translucent square a CSS checkerboard lays over its surface
                   (the <code>.checker</code> utility class, color wells, swatches); <code>--checker-a</code>/<code>-b</code>
                   are an opaque pair for canvases, which cannot composite over the page.</p>
                <div class="sg-swatches">
                    ${sw("--checker", "checker square over any surface")}
                    ${sw("--checker-a", "opaque light square (canvas)")}
                    ${sw("--checker-b", "opaque dark square (canvas)")}
                    ${sw("--pixel-grid", "hairline between enlarged pixels")}
                </div>

                <h3>State fills + text — the AA layer</h3>
                <p>A state color has two jobs at two contrast bars. The seed stays the identity
                   (rings, borders, icons — 3:1); a plane that carries text uses its <code>-fill</code>
                   with its ink (4.5:1); state-colored text uses the per-theme <code>-text</code>
                   variant. Every ratio is solved against the default seeds and worst-case plane —
                   for <code>-text</code> that is the color's own 16% tint over <code>--bg</code> (an
                   active item, a status wash), where it reaches at least 4.6:1 in both themes —
                   pouring in very different seeds means re-checking them.</p>
                <div class="sg-swatches">
                    ${sw("--accent-fill", "text-carrying accent plane")}
                    ${sw("--accent-edit-fill", "text-carrying edit plane")}
                    ${sw("--danger-fill", "text-carrying danger plane")}
                    ${sw("--accent-warm-fill", "= seed · takes dark ink")}
                    ${sw("--ok-fill", "= seed · takes dark ink")}
                    ${sw("--on-warm", "dark ink on warm fill")}
                    ${sw("--on-ok", "dark ink on ok fill")}
                    ${sw("--accent-text", "accent readable as text")}
                    ${sw("--accent-edit-text", "edit readable as text")}
                    ${sw("--accent-warm-text", "warm readable as text")}
                    ${sw("--danger-text", "danger readable as text")}
                    ${sw("--ok-text", "ok readable as text")}
                </div>

                <h2>Data palette — 10 slots</h2>
                <p>For user-colored things (chips, labels, series). Persisted data stores the <strong>slot
                   name</strong>, not a hex — a re-theme shifts the palette without rewriting stored records.
                   Components tint fills and borders from the slot via <code>color-mix()</code>, so one token
                   per slot serves every state.</p>
                <div class="sg-swatches">
                    ${["blue","orange","red","green","purple","pink","yellow","teal","gray","indigo"]
                        .map(c => sw(`--palette-${c}`)).join("")}
                </div>

                <h2>Motion &amp; elevation rails</h2>
                <table class="sg">
                    <tr><th>Token</th><th>Value</th><th>Use for</th></tr>
                    <tr><td><code>--ease-bounce</code></td><td>cubic-bezier(0.175, 0.885, 0.32, 1.275)</td><td>playful lifts: tiles, primary buttons, icons</td></tr>
                    <tr><td><code>--ease-smooth</code></td><td>cubic-bezier(0.4, 0, 0.2, 1)</td><td>standard state changes</td></tr>
                    <tr><td><code>--ease-swift</code></td><td>cubic-bezier(0.77, 0, 0.175, 1)</td><td>panel slides (nav drawer)</td></tr>
                    <tr><td><code>--shadow-1</code></td><td>derived from --sink</td><td>cards, small raises</td></tr>
                    <tr><td><code>--shadow-2</code></td><td>derived from --sink</td><td>menus, dialogs, big raises</td></tr>
                </table>
                <p>Use the rails instead of ad-hoc cubic-beziers and shadows — one motion language everywhere.</p>

                <h2>Shape</h2>
                <table class="sg">
                    <tr><th>Token</th><th>Value</th><th>Use for</th></tr>
                    <tr><td><code>--radius-s</code></td><td>2px</td><td>mini elements: strips, tracks, tiny thumbs, inner wells</td></tr>
                    <tr><td><code>--radius-m</code></td><td>4px</td><td>controls: buttons, inputs, chips, menu items, tabs</td></tr>
                    <tr><td><code>--radius-l</code></td><td>6px</td><td>surfaces: panels, cards, tiles, windows, dialogs, popovers, toasts</td></tr>
                </table>
                <p>The whole kit rounds through these three tokens — identical in every theme (never set
                   inside a <code>[data-theme]</code> block). Tuning: override the three vars after
                   <code>ui.css</code> to resharpen or soften the entire kit at once.</p>
                <table class="sg">
                    <tr><th>Token</th><th>Value</th><th>Use for</th></tr>
                    <tr><td><code>--icon-btn-size</code></td><td>26px</td><td>box of <code>.icon-btn</code> and <code>&lt;sac-copy-button&gt;</code></td></tr>
                    <tr><td><code>--icon-btn-icon</code></td><td>14px</td><td>glyph inside it</td></tr>
                    <tr><td><code>--tool-btn-size</code></td><td>32px (44px coarse)</td><td>box of <code>&lt;sac-toolbox&gt;</code>'s tools and <code>.icon-btn.tool</code></td></tr>
                    <tr><td><code>--tool-btn-icon</code></td><td>18px</td><td>glyph inside it</td></tr>
                </table>

                <h2>Typography</h2>
                <div class="sg-demo">
                    <div style="font-family:'Outfit',sans-serif;font-weight:800;font-size:1.8rem;">Outfit 600/700/800 — display</div>
                    <div style="font-family:'Inter',sans-serif;font-size:1rem;margin-top:0.5rem;">Inter 400/500/600 — body and UI. Self-hosted woff2 (latin + latin-ext), <code>font-display: swap</code>, no CDN, works offline.</div>
                </div>

                <h2>How to theme an app</h2>
                <h3>1 — Per-app accent (the classic retheme)</h3>
                <pre class="sg-code">/* your-tool/style.css */
@import '../kit/css/ui.css';
:root { --accent: #10b981; }   /* everything accent-derived follows */</pre>
                <h3>2 — Light mode</h3>
                <pre class="sg-code">&lt;html data-theme="light"&gt;   &lt;!-- that's it — the flag swaps the
                                  neutral seeds + flips color-scheme --&gt;</pre>
                <h3>2b — Auto (follow the OS)</h3>
                <pre class="sg-code">&lt;html data-theme="auto"&gt;   &lt;!-- no explicit choice — matches the
                                 OS light/dark preference live --&gt;</pre>
                <p>Same declarations as the light block above, applied behind a
                   <code>prefers-color-scheme: light</code> media query — no JS required.</p>
                <h3>3 — Custom theme</h3>
                <pre class="sg-code">/* after ui.css: swap seeds, keep the derivations */
:root {
    --bg: #140f1e;          /* your ground */
    --fg: #f5f0ff;          /* your foreground */
    --surface: #2a2140;     /* your glass material */
    --accent: #a855f7;
}
/* or a custom LIGHT theme: set data-theme="light" AND override seeds */
:root[data-theme="light"] { --bg: #fdf6ec; --accent: #b45309; }</pre>
                <p class="sg-note"><b>Garbage in, garbage out:</b> derivation guarantees <em>consistent</em>
                   colors everywhere, not <em>tasteful</em> seeds. Pick good seeds.</p>

                <p class="sg-note"><b>Light seeds:</b> new design work, signed off as final — bright on
                   purpose. Apps wanting a softer light theme override the seeds as shown above.</p>
            </div>
            `;
    }

    /** The accent-seed playground — the per-app --accent override, live. */
    function wireTokens(root) {
        const dots = root.querySelector("#sg-accent-dots");
        if (!dots) return;
        const buttons = Array.from(dots.querySelectorAll("[data-accent]"));
        const mark = (btn) => buttons.forEach((b) => b.classList.toggle("active", b === btn));

        // Re-entering the section must show the seed that is actually set.
        const current = document.documentElement.style.getPropertyValue("--accent").trim();
        mark(buttons.find((b) => b.dataset.accent === current) || (current ? null : buttons[0]));

        dots.addEventListener("click", (e) => {
            const btn = e.target.closest("[data-accent]");
            if (!btn) return;
            document.documentElement.style.setProperty("--accent", btn.dataset.accent);
            mark(btn);
        });
    }

    /* ------------------------------------------------------ components --- */

    function componentsHtml() {
        return `
            <div class="sg-page">
                <h1>Components</h1>
                <p class="lead">
                    44 component files, 48 custom elements — Shadow DOM (<code>mode: 'open'</code>)
                    except the one documented light-DOM case, <code>&lt;sac-launcher&gt;</code>.
                    All are classic deferred scripts self-registering via
                    <code>customElements.define()</code>, usable from classic and module scripts alike.
                    They style themselves exclusively from the kit tokens: <strong>ui.css is
                    required</strong> — without it they render unstyled.
                </p>

                <h2 id="sac-icon">&lt;sac-icon&gt;</h2>
                <p>Inline SVG icon from the <code>sac.icons</code> registry. Size via <code>--icon-size</code>, color via <code>currentColor</code>.</p>
                <div class="sg-demo">
                    <div class="sg-row sg-icon-grid" id="icon-grid"></div>
                </div>
                ${table("Attribute", [["name", "Lookup key in the registry. <code>sac.icons.register(name, path)</code> adds or overrides; <code>{filled:true}</code> renders fill instead of stroke."]])}
                ${code(`<sac-icon name="cube" style="--icon-size: 48px; color: var(--accent);"></sac-icon>`)}

                <h2 id="sac-nav">&lt;sac-nav&gt;</h2>
                <p>The fixed 50px glassmorphic ribbon + slide-out panel you are looking at right now
                   — <em>this app's own</em>, like every app's. The panel list is computed from
                   <code>sac.router.routes()</code> — nothing hardcoded;
                   it re-renders on <code>sac:route-registered</code>, <code>hashchange</code> and
                   <code>sac:scope-changed</code>. Content below needs <code>padding-top: 50px</code>
                   (<code>#app-root</code> / <code>.main-layout</code> handle this).</p>
                ${table("Attribute", [
                    ["brand", "Brand text — the first title-bar segment."],
                    ["brand-icon", "Icon name rendered before the brand text."],
                    ["brand-href", "Brand link target (default <code>#/</code>, scope-aware)."],
                    ["app-name", "Accent-colored text after the brand — spacing alone separates the segments."],
                    ["compact-title", "The app's name as the <b>phone ribbon</b> shows it. Absent = <code>brand</code> for a hosted app, else <code>app-name</code>, else <code>brand</code>. Set it where <code>app-name</code> is no name — the home hub's is the version, so it sets <code>compact-title=\"SACRVM APPKIT\"</code>."],
                    ["host-href / host-label / host-icon", "Attribute form of the host jump alone, for static pages. A hosted app sets the <code>host</code> property instead. Icon default <code>home</code>."],
                    ["rail", "Which rail the burger opens as a drawer on compact: a CSS selector, or <code>none</code> to opt out. Absent = the first <code>&lt;sac-sidebar&gt;</code> / <code>.sidebar</code> inside a <code>.main-layout</code> next to the nav. A rail that is still empty (a hidden <code>&lt;sac-sidebar&gt;</code>) is adopted too; the burger appears once it has items. This guide sets it explicitly (<code>app-styleguide &gt; .main-layout &gt; sac-sidebar</code>)."],
                    ["host-nav", "<code>always</code> (default) | <code>wide</code>. <code>wide</code> drops the host group (Home + the suite's app list) from the burger on compact — for a suite whose dashboard is the phone's main level; the ⌂ in the ribbon (shown while the menu is open) leads back to it. See <a href=\"#/styleguide/patterns/responsive-burger\">Who owns the burger</a>."],
                    ["sections-nav", "<code>always</code> (default) | <code>wide</code>. <code>wide</code> drops the app's own <code>sections</code> from the burger on compact — for an app whose rail already lists them, so the phone drawer holds ONE list with ONE scroll instead of the same entries twice. This guide, Build an App and the Roadmap use it."],
                ])}
                ${table("Property", [
                    ["host", "THE injection point of the app contract — one line in <code>mount()</code>: <code>nav.host = context.host</code>. Shape <code>{ name, icon, href, nav, toolbar }</code>: name/icon/href render the “SACRVM APPKIT” jump-home segment before the brand, in the SAME brand recipe — one title-bar style everywhere, host then app with the app's segment in accent, spacing as the only divider (visible at the top of this page); <code>nav</code> entries (<code>{label, href, icon?}</code>) become a labeled host group at the top of the burger panel; the group opens with a <b>Home</b> entry (the host's ⌂ jump — so the way back to the host lives in the menu, not only the ribbon breadcrumb; on compact the ribbon's ⌂, shown while the menu is open, takes its place), then the suite's cross-app navigation (open the burger: “SACRVM APPKIT” is that group, Home first). A <code>nav</code> entry whose <code>href</code> is <code>?app=&lt;id&gt;</code> opens that window app <b>in place</b> on a plain click (via <code>sac.apps.open</code>) and stays a deep link on a modified/middle click (new tab) — so a host can list window apps in the burger beside its routes; <code>toolbar</code> entries (<code>{icon | avatar:{name,src?}, label?, title?, href?|onClick?}</code>) render as controls at the right end of the ribbon — a suite-wide action (the GitHub button up right is one), or a signed-in user: give an entry <code>avatar</code> instead of <code>icon</code> and it materializes a real <code>&lt;sac-avatar&gt;</code> (accent-independent, name-hashed color), so the who-am-I control looks the part on every host. They are real <code>.nav-icon-btn</code> elements in the light DOM — the exact same recipe as the app's own ribbon buttons (labeled entries get the <code>.labeled</code> pill variant, avatar entries the <code>.avatar</code> variant), so host controls and app controls always look alike. Routes already listed in the host group are dropped from the app's own group, so a shared-page suite lists nothing twice. A host may re-declare later (the signed-in user was renamed, say): assign <code>context.host</code> to the nav once — the kit refreshes the injected chrome in place (<code>sac:host-changed</code>), no app cooperation. <code>null</code> = standalone, none of it renders."],
                    ["sections", "The app's OWN sub-navigation, <b>optional</b>: <code>[{label, href, icon?}]</code>. Entirely the app's choice — a simple app sets nothing and its suite entry stays a plain point. When set and a host group is present, the entries nest indented under the app's own entry in the burger — one tree, the suite with the running app unfolded (open the burger on this page: the Style Guide's five sections hang under its entry). Standalone the same entries are the panel's flat list. This app sets it from the same data as its rail: <code>nav.sections = SECTIONS.map(s =&gt; ({ label, href: ctx.href(s.id), icon }))</code>."],
                ])}
                ${table("Slot", [
                    ["panel", "The app's <em>own</em> burger-panel content, rendered first, above the navigation groups — filters, account, settings: the burger belongs to the app, not only to a global navigation. Its presence alone makes the burger appear. A tap on an <code>a[href]</code> or <code>[data-nav-close]</code> inside closes the panel; other controls leave it open."],
                    ["context", "For persistent controls (the theme switcher above lives here)."],
                    ["toolbar", "Right-aligned content — the <em>owner's</em> chrome: whoever writes the <code>&lt;sac-nav&gt;</code> markup puts their own buttons here. There is no projection surface; an app draws its own toolbar in its own area (see Orb Lab). Use the <code>.toolbar</code> recipe for sizing. What does not fit moves behind a “…” menu — at any width (below)."],
                ])}
                ${table("Method / event", [
                    ["open() / close() / toggle()", "What the burger does: the rail drawer on compact (stacked under the panel's entries), otherwise the panel. <code>open()</code> is a no-op when there is nothing to open."],
                    ["sac:nav-open / sac:nav-close", "<code>detail { drawer }</code> — the panel and/or the rail drawer came out / went away. Bubbles, composed."],
                ])}
                ${compact(`the ribbon is the burger, the app's <b>name as text</b> (<code>compact-title</code>) and the app's
                   own controls right-aligned — <code>brand</code>, <code>brand-icon</code> and the host jump leave it
                   (three bare glyphs read as cryptic); the name truncates only once the toolbar has overflowed into
                   “…”. Opening the burger turns the ribbon into the desktop title bar: the controls slide out to
                   the right while ⌂ with the suite's name (it truncates first) and the app icon ease in before the
                   app's name — the desktop brand row exactly: same colours, sizes and spacing — where you
                   are and the way home, so the panel drops its Home entry. An app with nothing behind a burger
                   shows the icons all along. The panel wears the rail recipe (solid <code>--panel</code>, hairlines, item pills);
                   the app's rail is adopted as an off-canvas drawer with scrim, Escape, swipe-left-to-close and a
                   focus trap, panel entries stacked above it. The ribbon grows by the top safe-area inset.
                   <a href="#/styleguide/patterns/responsive-ribbon">Phone ribbon →</a>`)}
                <p><b>Toolbar overflow</b> (every width, ResizeObserver-driven): when the toolbar slot plus the host
                   tools do not fit, the trailing buttons hide behind a “…” <code>&lt;sac-menu&gt;</code> (label key
                   <code>nav.more</code>); a menu item clicks the original button. A <code>&lt;sac-menu&gt;</code> in the
                   toolbar folds as one item — its entries join the “…” menu as a group and fire the original menu's
                   <code>sac:select</code>. <code>data-overflow="never"</code> pins a control. Needs <code>sac-menu.js</code>; without it nothing overflows.</p>
                ${code(`<sac-nav brand="MY TOOLS" app-name="EDITOR" brand-icon="cube">
    <div slot="toolbar" class="toolbar">
        <button class="btn primary">Open</button>
    </div>
</sac-nav>`)}

                <h2 id="sac-sidebar">&lt;sac-sidebar&gt;</h2>
                <p>The rail on the left of this page — and it is <em>this app's own</em>: the app
                   puts the element in its own markup and assigns <code>items</code>. Nothing is
                   projected from anywhere (the same inversion as toolbars: a host injects context
                   into an app, it never offers the app a hull). With no items the rail hides
                   itself, so a page without navigation simply has no rail.</p>
                ${code(`<div class="main-layout">
    <sac-sidebar></sac-sidebar>
    <div class="app-scroll">…the app's scrolling content…</div>
</div>`)}
                ${table("Property", [
                    ["items", "Array, re-renders on assignment: <code>[{label, icon?, href?, onClick?, active?, disabled?}]</code>, or <code>{section}</code> alone for a heading. <code>href</code> renders a link, <code>onClick</code> a button — give one, not both."],
                ])}
                ${table("Attribute", [
                    ["width", "Rail width, default 220px — also settable via <code>--sidebar-width</code>."],
                    ["drawer", "Set by the <code>&lt;sac-nav&gt;</code> that adopts the rail. Only on compact does it change anything: the rail leaves the flow and becomes an off-canvas drawer, <code>--drawer-width</code> wide. Without a nav, set it yourself."],
                    ["open", "Reflected: the drawer is out. Ignored while the rail is inline (desktop, or no <code>drawer</code>)."],
                ])}
                ${table("Method", [
                    ["open() / close() / toggle(force?)", "Set, clear or flip <code>[open]</code>."],
                ])}
                ${table("Event", [
                    ["sac:sidebar-toggle", "<b>Listened for</b> on <code>window</code> — dispatch it (optionally <code>detail { open: true|false }</code>) to drive the rail from any button. The nav's burger holds the rail directly and does not need it."],
                    ["sac:sidebar-open / sac:sidebar-close", "Fired by the rail (bubbles + composed) whenever <code>[open]</code> changes."],
                ])}
                ${compact(`the rail on this page is the drawer — open the burger. An item tap closes it (the item navigated);
                   scrim, Escape, swipe-back and the focus trap belong to the nav that adopted it.
                   <a href="#/styleguide/patterns/responsive-drawer">Rail drawer →</a>`)}

                <h2 id="sac-launcher">&lt;sac-launcher&gt;</h2>
                <p>One tile per app in the <code>sac.apps</code> registry — or several: a
                   manifest with a <code>tiles</code> array deploys multiple entry points for
                   one app (the two "Suite" tiles below are one registration). Light DOM, so
                   the global <code>.grid</code>/<code>.tile</code> patterns apply — the one
                   documented exception to the shadow rule. Page apps are real links, window
                   and view apps real buttons; every tile looks the same. The manifest decides
                   the tile's look (<code>badge</code>, <code>tile</code> footprint,
                   <code>accent</code> — see sac.apps in Helpers); a tile's accent colors the
                   tile and rides into the app opened through it. A <code>storage</code> key
                   adds the persisted user layer. This demo is storage-less; the demo app's
                   hub is the live one.</p>
                <div class="sg-demo">
                    <sac-launcher id="sg-launcher-plain"></sac-launcher>
                </div>
                ${table("Attribute", [
                    ["storage", "Suffix of the localStorage key <code>sac.launcher.&lt;storage&gt;</code> holding <code>{ v: 1, order, hidden, custom }</code>. Persisted ids that no longer exist are ignored and only dropped from storage on the next user change. <code>custom</code> manifests are (re)registered into <code>sac.apps</code> on connect. Absent = pure registry render: no persistence, no edit mode."],
                    ["edit", "Presence = edit mode (needs <code>storage</code>): move/hide controls on every tile, hidden tiles grayed with a show control, remove only on user-added apps. The dashed tile adds an app by tag + script URL — cross-origin included (classic scripts need no CORS); added apps are plain medium tiles."],
                ])}
                ${table("Method", [
                    ["refresh()", "Re-read <code>sac.apps.list()</code> and re-sync the grid in place. The component re-syncs itself on every <code>sac:apps-changed</code> the runtime emits, so late registration just works — call this only after mutating state outside <code>sac.apps</code>."],
                ])}
                ${table("Event", [
                    ["sac:layout", "detail { order, hidden, customCount } after every user change (move / hide / show / add / remove). Bubbles + composed."],
                ])}
                ${code(`<sac-launcher storage="demo-hub"></sac-launcher>

<script>
    sac.apps.register({ id: "notes", name: "Notes", icon: "note",
                        description: "Quick notes in a window.",
                        kind: "window", tag: "app-notes", src: "apps/notes.js",
                        width: "420px", height: "520px", badge: "NEW" });
    sac.apps.register({ id: "docs", name: "Docs", icon: "document",
                        kind: "page", href: "docs/", tile: "wide" });
    sac.apps.init();   // tiles handle their own clicks; init adds ?app= deep links
<\/script>`)}
                ${compact(`the grid is its own container: below ~584px of <em>its own</em> width it goes single-column, wide and
                   large tiles included; below a 480px viewport each tile is a row, icon beside the text (the <code>.tile</code>
                   pattern). Under <code>pointer: coarse</code> the edit controls grow to a 36px look with a
                   44px hit halo; under <code>hover: none</code> the Add tile's hover tint is off. The windows it opens
                   maximize themselves on compact.`)}

                <h2 id="sac-window">&lt;sac-window&gt;</h2>
                <p>Draggable, resizable, glassmorphic floating window. Content = light-DOM children.
                   Wheel events are isolated so scrolling the window never zooms the workspace behind it.</p>
                <p>The title bar carries three traffic-light dots — plain colored circles, no glyphs:
                   <b>minimize</b>, <b>maximize</b>, <b>close</b>. Color carries the meaning; tooltip
                   and accessible name flip to <i>Restore</i> whenever the window isn't in its normal
                   rect, and double-clicking the title bar restores too. After every drag and on every
                   viewport resize the position is clamped — at least 40px stays horizontally in view,
                   the title bar between nav ribbon and bottom edge — so a window can't be lost
                   off-screen.</p>
                <div class="sg-demo sg-row">
                    <button class="btn primary" style="width:auto" id="demo-open-window">Open window</button>
                    <button class="btn" style="width:auto" id="demo-open-plain-window">Close-only, fixed size</button>
                    <span id="demo-window-state" style="color:var(--text-muted);font-size:0.85rem;"></span>
                </div>
                ${table("Attribute", [
                    ["title, width, height, top, left", "Geometry + title. width/height/top/left accept any CSS length. <code>height=\"auto\"</code> is supported: the window sizes to its content until the user resizes it."],
                    ["right, bottom", "Anchor to the viewport's right / bottom edge instead of left / top (used only when <code>left</code> / <code>top</code> is absent): <code>right=\"16px\" bottom=\"16px\"</code> keeps a preview window in the corner while the browser resizes, and survives maximize / restore. The user's first drag or resize turns the anchor into a plain left / top position — where they put it is where it stays."],
                    ["open", "Presence = visible. Showing pushes the window <b>wholly</b> into view — inside the viewport, below the nav ribbon — so one placed for a bigger screen, or opened after the browser shrank, never appears cut off. Larger than the viewport, it shows its top-left, title bar first. An anchored window that fits keeps its anchor."],
                    ["minimized", "Collapsed to the title bar: body and resize handle hidden, configured width kept. Still draggable, not resizable. Reflected."],
                    ["maximized", "Filled to the viewport with an 8px inset, the top clearing the fixed 50px nav ribbon. Neither draggable nor resizable. Reflected, and mutually exclusive with <code>minimized</code>."],
                    ["controls", "Space-separated subset of <code>min max close</code> — which traffic lights render. Absent = all three. Without <code>max</code>, double-clicking the title bar does nothing. Runtime changes apply (CSS token matching); the methods stay callable."],
                    ["no-resize", "Boolean: no resize handle, no resizing. Dragging is unaffected. An app manifest sets these two via <code>controls</code> / <code>resizable: false</code> (see sac.apps in Helpers)."],
                    ["no-compact", "Boolean: opts <b>out</b> of the compact rules. On a narrow screen a window normally maximizes itself (a window app IS the app there); a tool palette or preview over a canvas should not — with <code>no-compact</code> it stays a floating window: its own size, draggable, pushed into view. Window apps keep the default."],
                    ["snap", "Edge snapping while dragging: within 12px of a viewport edge (top = below the nav ribbon) the window snaps to it, keeping a gap of the value — <code>snap=\"14\"</code> → 14px, bare <code>snap</code> → 8px. Dropped snapped to the right and/or bottom edge it is <b>anchored</b> there again (<code>right</code> / <code>bottom</code>), so it follows browser resizes like a freshly placed tool window; snapped left / top it keeps left / top. Dropped free, a plain position. Opt-in — the choice for tool palettes over a canvas."],
                    ["compact", "Set <b>by the component</b> while the viewport is compact — a styling hook, not an input."],
                ])}
                ${table("Method", [
                    ["open() / close() / toggle()", "Show, hide, flip. open() also brings to front."],
                    ["bringToFront()", "Raises the window over the other sac-windows. Windows stack in their own band, <code>10000–18999</code>: above the page, below the open burger panel / rail drawer (<code>19000+</code>) and dialogs (<code>20000</code>) — reaching the top re-packs the band, so no window ever covers the menu."],
                    ["minimize() / maximize()", "Enter either state. Each clears the other; leaving <code>maximized</code> puts the saved rect back first."],
                    ["restore()", "Back to the saved rect from either state, clamped in case the viewport shrank meanwhile."],
                ])}
                ${table("Event", [
                    ["sac:open / sac:close", "Bubbles + composed, <code>detail.window</code> = the element."],
                    ["sac:minimize / sac:maximize / sac:restore", "Bubbles + composed, <code>detail.window</code> = the element. The restore event covers the return from either state."],
                ])}
                ${table("CSS custom property / part", [
                    ["--window-padding", "The content's inner padding, default <code>20px</code>. A tool palette wants about <code>8px</code>; <code>0</code> for edge-to-edge content (a canvas, a list)."],
                    ["::part(content)", "The scrolling content box, for the rare app that needs more than the padding."],
                ])}
                ${compact(`always maximized below the nav — an open window maximizes itself, the maximize dot is hidden,
                   dragging is off, minimize collapses it to its title bar at the top. The traffic lights get 44px
                   hit areas. Maximized on a phone the window is <b>opaque</b> — the glass hue without the blur, so the page
                   behind never shows through a full-screen app. Back on a wide screen a window the phone maximized
                   returns to its rect; one the user maximized stays maximized.`)}

                <h2 id="sac-split">&lt;sac-split&gt;</h2>
                <p>Two panels, one draggable divider; the end panel takes what the start leaves, so the
                   proportions survive a window resize. A drag writes one flex-basis — nothing
                   re-renders, and a canvas or a scroll position in either panel survives it. The drag
                   runs on pointer capture (no document-level listeners), so splits nest freely — as
                   below.</p>
                <div class="sg-demo sg-col" style="max-width:none;">
                    <div style="height:240px;border:1px solid var(--border);border-radius:var(--radius-l);overflow:hidden;">
                        <sac-split id="demo-split" position="34%" min-start="120px" min-end="200px">
                            <div slot="start" style="padding:0.75rem;font-size:0.85rem;color:var(--text-muted);">
                                <strong style="color:var(--text);">start</strong><br>
                                Drag the hairline. Double-click it to reset to 34%.
                            </div>
                            <sac-split slot="end" direction="vertical" position="50%" min-start="56px" min-end="56px">
                                <div slot="start" style="padding:0.75rem;font-size:0.85rem;color:var(--text-muted);">
                                    <strong style="color:var(--text);">nested start</strong> — a vertical split
                                    inside the end panel.
                                </div>
                                <div slot="end" style="padding:0.75rem;font-size:0.85rem;color:var(--text-muted);">
                                    <strong style="color:var(--text);">nested end</strong> — the event bubbles, so
                                    the readout below sees both splits.
                                </div>
                            </sac-split>
                        </sac-split>
                    </div>
                    <span id="demo-split-out" style="color:var(--text-muted);font-size:0.85rem;">outer → 34%</span>
                </div>
                ${table("Attribute", [
                    ["direction", "<code>horizontal</code> (default; start = left, the divider is a vertical separator) | <code>vertical</code> (start = top)."],
                    ["position", "Start panel size as a percentage of the space minus the divider, e.g. <code>30%</code> (default <code>50%</code>; a bare number counts as percent). Reflected — an out-of-range value is written back clamped, so the attribute never lies about the layout."],
                    ["min-start / min-end", "CSS lengths clamping the drag (default <code>0</code>): px, bare numbers, rem. Re-applied on container resize, so a narrowed window can never leave a sidebar below its minimum. If both minimums cannot hold at once, min-start wins."],
                    ["dragging", "Set by the component while a drag is in progress, not by hand — a styling hook."],
                    ["aria-label", "Names the divider for screen readers (it is a focusable <code>role=\"separator\"</code> with aria-valuenow/min/max in percent). Defaults to “Resize panels”."],
                    ["collapse", "List/detail on a phone: when the split's <b>own</b> width drops to this or below, it shows one panel at a time. <code>compact</code> (768px — also a bare <code>collapse</code>), <code>narrow</code> (480px) or a px length. It measures itself, so it also collapses inside a narrow sac-window on a wide screen. Absent = never collapses."],
                    ["show", "<code>start</code> (default) | <code>end</code> — the panel a collapsed split shows. Set <code>end</code> when the user opens an item; the back bar sets <code>start</code>. Nothing re-renders: the hidden panel keeps its scroll, form state, canvas."],
                    ["collapsed", "Set by the component while collapsed — a styling hook; the divider is hidden."],
                    ["rail-start", "Set by the component when the start slot holds a rail that <code>&lt;sac-nav&gt;</code> turned into a drawer (the resizable-sidebar recipe below): collapsed, the split then leaves the drawer alone and shows the end panel, with no back bar."],
                    ["no-back", "Hide the built-in back bar (draw your own and set <code>show</code>)."],
                    ["back-label", "The back bar's text (default “Back”, key <code>split.back</code>)."],
                ])}
                ${table("Property", [
                    ["position", "get/set, normalized to one decimal (<code>\"34.2%\"</code>). Setting it does NOT fire sac:resize (the caller already knows); user interaction does."],
                    ["show", "get/set <code>\"start\"</code> | <code>\"end\"</code> (the attribute)."],
                    ["collapsed", "Read-only boolean."],
                ])}
                ${table("Method", [
                    ["back()", "What the back bar does: show <code>start</code>, after a <code>sac:split-back</code> nobody cancelled."],
                ])}
                ${table("Slot", [
                    ["start", "Left (horizontal) / top (vertical) panel. Scrolls its own overflow."],
                    ["end", "Right / bottom panel. Same."],
                ])}
                ${table("Event", [
                    ["sac:resize", "detail { position } — the percent string. Fired live during a drag, on keyboard moves, on the double-click reset, and when a container resize forces a clamp; never when the app sets it itself."],
                    ["sac:split-back", "The back bar was used or <code>back()</code> called. Bubbles + composed, <b>cancelable</b>: <code>preventDefault()</code> keeps the end panel (confirm unsaved changes first)."],
                    ["sac:collapse", "detail { collapsed } — the split entered or left one-panel mode. Bubbles + composed."],
                ])}
                ${table("CSS custom property", [
                    ["--split-divider", "Thickness of the divider's grab zone (default 9px). The divider takes 1px of layout — the hairline — and the grab zone is laid invisibly over the panels beside it, so no empty strip stands between a panel (or its scrollbar) and the line."],
                ])}
                ${table("Keyboard", [
                    ["Divider", "<kbd>←</kbd>/<kbd>→</kbd> (vertical split: <kbd>↑</kbd>/<kbd>↓</kbd>) move 1%, <kbd>Shift</kbd> 5%, <kbd>Home</kbd>/<kbd>End</kbd> jump to the clamped extremes. Double-click resets to the starting position."],
                ])}
                ${code(`<sac-split direction="horizontal" position="30%" min-start="150px" min-end="200px">
    <div slot="start">…left panel…</div>
    <div slot="end">…right panel…</div>
</sac-split>`)}
                ${compact(`nothing changes unless <code>collapse</code> is set — then one panel at a time with a back bar.
                   <a href="#/styleguide/patterns/responsive-list-detail">Live list/detail demo →</a>`)}
                <p class="sg-note"><b>Resizable sidebar:</b> the workspace layout (fixed 50px nav +
                   sidebar + viewport) becomes resizable by wrapping the sidebar and the viewport in one
                   split. <code>min-start</code> keeps the sidebar usable, <code>min-end</code> protects
                   the canvas; the sidebar hands its own 260px width over to the panel. On a phone the
                   nav adopts the sidebar as its drawer and, with <code>collapse</code>, the split gives the
                   viewport the whole width (<code>rail-start</code>). <code>.sidebar.fill</code> (ui.css) hands the sidebar's width
                   to the panel and yields to the drawer's own size on compact — no media query needed.</p>
                ${code(`<div class="main-layout">
    <sac-split style="flex:1" position="20%" min-start="180px" min-end="320px" collapse>
        <aside class="sidebar fill" slot="start">…</aside>
        <section class="viewport" slot="end">…</section>
    </sac-split>
</div>`)}
                ${code(`// The attribute is already the truth — persist it as it comes:
split.addEventListener("sac:resize", (e) => localStorage.setItem("sidebar", e.detail.position));
split.position = localStorage.getItem("sidebar") || "20%";   // programmatic move, no event`)}

                <h2 id="sac-dialog">&lt;sac-dialog&gt;</h2>
                <p>Modal confirm with focus trap, Escape = cancel, and <strong>armed destructive
                   buttons</strong>. Use the <code>sac.dialog.confirm()</code> promise wrapper — or
                   <code>sac.dialog.info()</code> for the one-button "read, dismiss" case (an About
                   panel, the licence notice an app with vendored code owes). <code>message</code>
                   takes a string or an <em>array of paragraphs</em>, always rendered via
                   <code>textContent</code>. A dialog with more content than the viewport caps out
                   and scrolls its body; title and buttons stay put.</p>
                <div class="sg-demo sg-row">
                    <button class="btn danger" style="width:auto" id="demo-dialog">Delete something…</button>
                    <button class="btn" style="width:auto" id="demo-dialog-info">About…</button>
                    <span id="demo-dialog-result" style="color:var(--text-muted);font-size:0.85rem;"></span>
                </div>
                ${table("Button spec", [
                    ["action", "String the promise resolves with."],
                    ["label", "Button text."],
                    ["kind", "\"default\" | \"primary\" | \"destructive\"."],
                    ["armAfterMs", "Arm delay for the destructive button: it takes focus only after N ms, so a reflexive Enter can't confirm it early — and the timer cancels if the pointer visits another button first."],
                    ["disabled", "Start the button disabled — e.g. a Save that waits for a name. Toggle it later with <code>setDisabled()</code>."],
                    ["labelKey", "Optional i18n key: the button shows <code>sac.t(labelKey, label)</code> and follows a language switch in place (<code>label</code> is the English fallback). Without it the label is the caller's and never changes."],
                ])}
                ${code(`const answer = await sac.dialog.confirm({
    title:   "Delete this item?",
    message: "This cannot be undone.",
    buttons: [
        { action: "cancel", label: "Cancel" },
        { action: "delete", label: "Delete", kind: "destructive", armAfterMs: 2000 },
    ],
});   // → "delete" | "cancel" | null (Escape/backdrop = null)

await sac.dialog.info({
    title:   "About",
    message: ["One paragraph per array entry.", "Licence text lives well here."],
    label:   "Got it",          // default "OK"
});   // announce, not ask — the resolution carries no information`)}
                <p>The wrapper above is the everyday path. The element underneath it is public too —
                   reach for it when you need slotted interactive content (a form, links) in the body,
                   as <code>&lt;sac-launcher&gt;</code>'s add-app dialog does:</p>
                ${table("Element API", [
                    ["title", "Attribute — the heading; the panel is <code>aria-labelledby</code> it when set."],
                    [".buttons", "Property — array of button specs (same shape as above)."],
                    ["open()", "Show it: renders, traps focus, remembers the trigger."],
                    ["close(action)", "Hide it and fire <code>sac:action</code> with that action; also restores focus to the trigger."],
                    [".beforeAction", "Property — <code>(action) =&gt; boolean | Promise&lt;boolean&gt;</code>, asked on every button click; <code>false</code> keeps the dialog open (an empty required field, an “overwrite?” question). Escape and the backdrop always cancel without asking."],
                    ["trigger(action)", "Run a button's action from code, through <code>beforeAction</code> — Enter in a field of the body."],
                    ["setDisabled(action, flag)", "Enable / disable one button."],
                    ["--dialog-width", "CSS custom property on the element — the panel width, default <code>420px</code>. A dialog holding a file list wants more."],
                    ["sac:open", "Fired on open (bubbles + composed)."],
                    ["sac:action", "Fired on close; <code>detail { action }</code> (bubbles + composed). Escape / backdrop close with <code>null</code>."],
                ])}
                ${compact(`a bottom sheet — full width, anchored above the home-bar inset, at most 85dvh with the body
                   scrolling; the actions go full-width and stack, the last one (usually the primary) on top. Focus
                   trap and Escape unchanged. Arming cancels on a finger touching another button, not just a
                   pointer entering it.`)}

                <h3 id="sac-about"><code>sac.about.open(data)</code></h3>
                <p>The shared About surface — a <code>&lt;sac-window&gt;</code>, not a dialog, because credits and
                   licences are read (and left open), not answered; <code>sac.dialog.info</code> would collapse them
                   into one block. Rendered from data, so a host and an app open the same shape and look related by
                   construction — the reason it ships in the kit rather than each app reinventing it. A hosted app
                   passes <code>context.manifest</code>; standalone, pass a literal. Notice text is set via
                   <code>textContent</code> (third-party, untrusted as markup). Re-opening the same subject (by name)
                   resurfaces the window instead of stacking a duplicate.</p>
                ${code(`sac.about.open(context.manifest);         // hosted: zero duplication

sac.about.open({                          // or an explicit object (standalone)
    name: 'Color Bucket', icon: 'palette', version: '1.0.0',
    description: 'Mix colors like paint…',
    notices: [
        { title: 'spectral.js', text: 'MIT © 2025 Ronald van Wijnen…' },
        { title: 'RAL',         text: '"RAL" is a registered trademark…' },
    ],
});`)}
                <p>Only <code>notices</code> is a new manifest field (see <code>sac.apps</code>); <code>name · icon ·
                   description · version</code> are already there. In a hosted ribbon the host's controls sit behind a
                   hairline divider from the app's own, so an app About and a host About read as two scopes, not one row.
                   There is a <code>copyright</code> icon for the button that opens it.</p>

                <h2 id="sac-status-banner">&lt;sac-status-banner&gt;</h2>
                <p>Inline, non-modal status strip: sits where you put it, hidden until something
                   happens, never auto-dismisses.</p>
                <div class="sg-demo">
                    <sac-status-banner id="demo-banner"></sac-status-banner>
                    <div class="sg-row">
                        <button class="btn" style="width:auto" data-banner="error">error</button>
                        <button class="btn" style="width:auto" data-banner="info">info</button>
                        <button class="btn" style="width:auto" data-banner="warn">warn</button>
                        <button class="btn" style="width:auto" data-banner="success">success</button>
                        <button class="btn" style="width:auto" data-banner="hide">hide</button>
                    </div>
                </div>
                ${table("API", [
                    ["show(message, kind)", "kind: \"error\" (default) | \"info\" | \"warn\" | \"success\" — mapped to --danger / --accent / --accent-warm / --ok."],
                    ["hide()", "Clears the strip."],
                    ["kind / message / open", "Declarative attribute equivalents."],
                ])}
                ${compact(`in flow and full width; long unbroken strings (paths, URLs, error codes) wrap instead of pushing
                   the page sideways. No controls.`)}

                <h2 id="sac-section">&lt;sac-section&gt;</h2>
                <p>Sidebar group separator: uppercase title + thin border. With <code>collapsible</code> the title
                   folds the group away — for rarely touched settings.</p>
                <div class="sg-demo" style="max-width:280px;background:var(--panel);">
                    <sac-section title="Filters">
                        <sac-toggle label="Show hidden" checked></sac-toggle>
                        <sac-toggle label="Snap to grid"></sac-toggle>
                    </sac-section>
                    <sac-section title="Export">
                        <button class="btn">Export</button>
                    </sac-section>
                    <sac-section title="View settings" collapsible collapsed>
                        <sac-toggle label="Wireframe"></sac-toggle>
                        <sac-toggle label="Flat shading" checked></sac-toggle>
                        <sac-slider label="Light angle" min="0" max="360" value="45"></sac-slider>
                    </sac-section>
                </div>
                ${table("Attribute", [
                    ["title", "Uppercase heading text — rendered at <code>--text</code> so a group heading stands out from the labels it heads (AA with room to spare; never the tertiary <code>--text-dim</code>, which failed AA at this size)."],
                    ["collapsible", "The title becomes a toggle: chevron, button semantics, Enter/Space, <code>aria-expanded</code>; 44px hit target on touch. Height transition, none under <code>prefers-reduced-motion</code>. A folded body leaves the tab order."],
                    ["collapsed", "The folded state, reflected. Property <code>collapsed</code>, method <code>toggle(force?)</code>."],
                    ["remember", "A key — the folded state survives a reload, per viewer (<code>localStorage</code> <code>sac-section:&lt;key&gt;</code>); a stored state wins over the markup. Leave it out when the app persists the state itself (listen to <code>sac:toggle</code>, set <code>collapsed</code>)."],
                ])}
                ${table("Event", [["sac:toggle", "<code>detail { collapsed }</code> — on a user toggle and on <code>toggle()</code>, not when the attribute is set from outside."]])}
                <p><b>CSS parts:</b> <code>title</code> (the heading), <code>body</code> (the slotted content wrapper) and <code>chevron</code> — reach them from the light DOM, e.g. <code>sac-section::part(title) { … }</code>.</p>

                <h3 id="sac-caption"><code>.sac-caption</code></h3>
                <p>The section-title's type as a light-DOM utility — for a lone caption where a whole
                   <code>&lt;sac-section&gt;</code> (body slot, margins, underline) is too much. It reads the
                   same <code>--caption-*</code> tokens the section title does, so the two never drift.
                   Quiet by default (<code>--text-muted</code>); set <code>color</code> to lift it to a heading.</p>
                <div class="sg-demo sg-col" style="max-width:280px;background:var(--panel);">
                    <span class="sac-caption">Recipe</span>
                    <span class="sac-caption" style="color:var(--text);">Recipe · lifted</span>
                </div>
                ${code(`<span class="sac-caption">Recipe</span>`)}

                <h2 id="sac-toggle">&lt;sac-toggle&gt;</h2>
                <div class="sg-demo sg-col">
                    <sac-toggle id="demo-toggle" label="Enabled" checked></sac-toggle>
                    <span id="demo-toggle-state" style="color:var(--text-muted);font-size:0.85rem;">state: true</span>
                </div>
                ${table("Attribute", [["label", "Text left of the switch."], ["checked", "Presence = on. Property <code>.checked</code> mirrors it."]])}
                ${table("Event", [["sac:change", "detail { value: boolean }. Bubbles, not composed (native change semantics). Programmatic .checked is silent."]])}
                ${compact(`the whole row — label and switch — is the tap target, at least 44px tall under
                   <code>pointer: coarse</code>. The switch keeps its size.`)}

                <h2 id="sac-slider">&lt;sac-slider&gt;</h2>
                <p>Range slider with live value readout. <strong>All attributes are observed</strong>,
                   and value changes update the DOM in place — dragging never re-renders.</p>
                <div class="sg-demo sg-col">
                    <sac-slider id="demo-slider" label="Depth" min="0" max="100" step="1" value="40" suffix="px"></sac-slider>
                    <sac-slider label="Quality" min="0" max="2" step="1" value="1" labels="Low,Medium,High"></sac-slider>
                    <sac-slider label="Smoothing" min="0.01" max="4" step="0.01" value="1" ends="Crisp,Smooth"></sac-slider>
                    <span id="demo-slider-state" style="color:var(--text-muted);font-size:0.85rem;">value: 40</span>
                </div>
                ${table("Attribute", [
                    ["label / min / max / step / value / suffix", "The usual suspects. Property <code>.value</code> mirrors the attribute."],
                    ["labels", "Comma-separated texts mapped by integer value — turns the readout into discrete steps."],
                    ["ends", "<code>\"Crisp,Smooth\"</code> — two captions under the track's ends, for a continuous range whose extremes need words. The readout keeps the number. Translate it like <code>label</code>: set the attribute again on a language switch."],
                    ["disabled", "Inert and dimmed; fires nothing."],
                ])}
                <p><b>CSS parts:</b> <code>ends</code> (the caption row).</p>
                ${table("Event", [["sac:input", "On drag; detail { value } (string)."], ["sac:change", "On release; detail { value } (string). Both bubble, not composed."]])}
                ${compact(`a native range input, so dragging is the browser's own. Under <code>pointer: coarse</code> it is a
                   44px-tall hit strip with a 20px thumb, and <code>touch-action: pan-y</code> lets a vertical swipe
                   scroll the page while a sideways drag moves the thumb.`)}

                <h2 id="sac-stepper">&lt;sac-stepper&gt;</h2>
                <p>Discrete −/value/+ pill for small numeric quantities — part counts, brush sizes.
                   The value field is a <code>type="text"</code> <code>role="spinbutton"</code>
                   underneath, so the native number spinners never show up. Every path that changes
                   <code>value</code> (button, held repeat, keyboard, typed commit, programmatic set)
                   runs through the same clamp.</p>
                <div class="sg-demo sg-col">
                    <div class="sg-row" style="gap:1.5rem;flex-wrap:wrap;">
                        <sac-stepper id="demo-stepper" value="3" min="1" max="99" step="1" unit="parts" label="Parts"></sac-stepper>
                        <sac-stepper id="demo-stepper-frac" value="0.5" min="0" max="1" step="0.1" label="Mix ratio"></sac-stepper>
                        <sac-stepper value="10" min="0" max="20" unit="px" label="Brush size" disabled></sac-stepper>
                    </div>
                    <span id="demo-stepper-state" style="color:var(--text-muted);font-size:0.85rem;">no change yet</span>
                </div>
                ${table("Attribute", [
                    ["value", "Current number, reflected — clamped into <code>[min, max]</code> and snapped to the step grid (measured from <code>min</code>) on every change, so the attribute never carries an out-of-range or off-grid number. Defaults to <code>min</code>."],
                    ["min / max", "Bounds. Default <code>0</code> / <code>100</code>."],
                    ["step", "Increment, default <code>1</code>. Fractional steps (<code>0.1</code>) are supported; the displayed and reflected value keeps that many decimals."],
                    ["unit", "Optional dim word next to the number (<code>parts</code>, <code>px</code>). Also feeds <code>aria-valuetext</code> (“3 parts”)."],
                    ["label", "Accessible name for the value field."],
                    ["disabled", "Disables both buttons and the value field."],
                ])}
                ${table("Property", [
                    ["value", "get/set (number). Setting updates everything in place and fires nothing — same contract as writing the attribute."],
                    ["disabled", "get/set (boolean), reflects the attribute."],
                ])}
                ${table("Event", [
                    ["sac:change", "detail { value } — a number. Fired on every USER change: a click, each held-repeat tick (live, so consumers react as it moves), a keyboard step, or a typed commit that actually changed the value. Never on a programmatic set."],
                ])}
                ${table("Interaction", [
                    ["± buttons", "Click steps once. Press and hold repeats after 400ms, every 60ms, until release or the bound — the button disables itself there and the repeat stops on its own."],
                    ["Value field", "<kbd>↑</kbd>/<kbd>↓</kbd> step (<kbd>Shift</kbd> ×10) · <kbd>Enter</kbd> or blur commits · <kbd>Esc</kbd> reverts the text without committing."],
                ])}
                ${code(`<sac-stepper value="3" min="1" max="99" unit="parts" label="Parts"></sac-stepper>
<sac-stepper value="0.5" min="0" max="1" step="0.1" label="Mix ratio"></sac-stepper>`)}
                ${compact(`press-and-hold works with a finger (a long press never opens the context menu; a vertical swipe
                   cancels it and scrolls). Under <code>pointer: coarse</code> the pill is 44px tall, the ± buttons reach
                   44 × 44 with a halo, the field uses 16px type; <code>touch-action: manipulation</code> stops quick taps
                   from zooming.`)}

                <h2 id="sac-segmented-control">&lt;sac-segmented-control&gt;</h2>
                <p>Button group, one active at a time. Buttons are slotted light DOM (text, icons, SVG — your
                   call). For an edit-mode group, override the accent locally:
                   <code>style="--accent: var(--accent-edit)"</code> — no hardcoded per-value colors.</p>
                <div class="sg-demo sg-row">
                    <sac-segmented-control id="demo-seg" value="week">
                        <button data-value="today">Today</button>
                        <button data-value="week">Week</button>
                        <button data-value="all">All</button>
                    </sac-segmented-control>
                    <sac-segmented-control value="edge" style="--accent: var(--accent-edit)">
                        <button data-value="face">Face</button>
                        <button data-value="edge">Edge</button>
                        <button data-value="vertex">Vertex</button>
                    </sac-segmented-control>
                    <span id="demo-seg-state" style="color:var(--text-muted);font-size:0.85rem;">value: week</span>
                </div>
                ${table("Attribute", [["value", "Active data-value. Property <code>.value</code> mirrors it; setting fires change."]])}
                ${table("Event", [["sac:change", "detail { value } (string), on user click/keypress only. Bubbles, not composed; a programmatic set is silent."]])}
                ${compact(`never runs past its container — too many segments fold onto a second row. Under
                   <code>pointer: coarse</code> each segment keeps its look with a 44px-tall hit halo; no hover wash
                   sticks to a tapped segment.`)}

                <h2 id="sac-color-picker">&lt;sac-color-picker&gt;</h2>
                <p>The whole color surface in one element: a saturation/value field, a hue strip, an
                   optional alpha strip, three RGB rows and a hex field — every one a view onto the same
                   state, every one editable. The state is <b>HSV</b>, so the hue survives saturation 0
                   and value 0 and is only replaced when an incoming color actually has one — no
                   snapping back to red at the white edge or the black floor. The rainbow, field
                   gradients and swatch fills are the <em>data</em> — the one documented exception to
                   the no-raw-colors rule; everything around them is tokens, down to the transparency
                   checker, mixed from <code>--fg</code> so it adapts to the theme.</p>
                <div class="sg-demo sg-row" style="align-items:flex-start;gap:2rem;flex-wrap:wrap;">
                    <sac-color-picker id="demo-picker" value="#3b82f6"></sac-color-picker>
                    <sac-color-picker id="demo-picker-alpha" value="#f9731699" alpha
                                      style="--picker-width:200px;"></sac-color-picker>
                    <div class="sg-col" style="gap:0.6rem;min-width:200px;">
                        <div class="sg-row" style="align-items:center;gap:0.6rem;">
                            <span id="demo-picker-dot" style="width:22px;height:22px;border-radius:var(--radius-m);
                                  border:1px solid var(--border-strong);background:var(--accent);"></span>
                            <code id="demo-picker-out">waiting for a change…</code>
                        </div>
                        <p class="sg-note" style="margin:0;">Both pickers report into the same line.
                           Programmatic sets stay silent — only your edits show up here.</p>
                    </div>
                </div>
                ${table("Attribute", [
                    ["value", "Hex, reflected. Read tolerantly through <code>sac.color.parse</code> (<code>#rgb</code>, <code>#rgba</code>, <code>#rrggbb</code>, <code>#rrggbbaa</code>, with or without the <code>#</code>, any casing) and written back <b>normalized lowercase</b>, so attribute and property never disagree. Setting it updates every part in place and fires nothing. An unparseable value is ignored and the attribute heals back to the current color. Default <code>#3b82f6</code>."],
                    ["alpha", "Boolean. Adds the alpha strip and makes <code>value</code> reflect as <code>#rrggbbaa</code>. Removing it at runtime resets opacity to 100% — a transparency you can neither see nor edit is a trap, not a feature."],
                ])}
                ${table("Property", [
                    ["value", "get/set, normalized lowercase hex. Readable straight after <code>createElement</code>, before the element is connected."],
                ])}
                ${table("Method", [
                    ["focus(options)", "Focuses the SV thumb — the picker's primary control."],
                ])}
                ${table("Event", [
                    ["sac:change", "detail { value } — the hex string. Fired on USER changes only (drag, arrow key, valid typing) and only when the resulting hex actually differs from the last one, so a drag that wanders two pixels inside the same color stays quiet."],
                ])}
                ${table("CSS custom property", [
                    ["--picker-width", "Width of the whole stack. Default <code>240px</code>; the layout holds from 200px to 360px."],
                ])}
                ${table("Keyboard", [
                    ["SV thumb", "Arrows move saturation/value by 1%, <kbd>Shift</kbd> by 5%, <kbd>Home</kbd>/<kbd>End</kbd> jump saturation to 0% / 100%."],
                    ["Hue strip", "Arrows ±1°, <kbd>Shift</kbd> ±10°, <kbd>Home</kbd>/<kbd>End</kbd> 0° / 360°. Clamped, never wrapped — a thumb that teleports across the strip is a bug you feel."],
                    ["Alpha strip", "Arrows ±1%, <kbd>Shift</kbd> ±10%, <kbd>Home</kbd>/<kbd>End</kbd> 0% / 100%."],
                    ["Hex field", "<kbd>Enter</kbd> normalizes (or reverts if unparseable); <kbd>Esc</kbd> and blur revert. While the text is unparseable it is marked with <code>--danger</code> text and a 1px <code>--danger</code> underline — the color itself does not move, and the field you are typing in is never overwritten by a sync."],
                ])}
                ${code(`<sac-color-picker value="#3b82f6"></sac-color-picker>
<sac-color-picker value="#f9731699" alpha style="--picker-width:200px;"></sac-color-picker>`)}
                ${code(`picker.addEventListener("sac:change", (e) => {
    brush.color = e.detail.value;        // "#3b82f6" — or "#3b82f699" with [alpha]
});
picker.value = "#10b981";                // updates in place, fires nothing`)}
                ${compact(`caps itself at its container's width, so it fits a 360px phone or a narrow popover. Under
                   <code>pointer: coarse</code> the hue/alpha strips grow to 24px with 44px halos, the RGB sliders get a
                   44px hit box, the fields are 44px tall with 16px type. Every surface is a pointer-captured drag with
                   <code>touch-action: none</code>, so a finger drag never scrolls the page.`)}

                <h3 id="sac-color">sac.color</h3>
                <p>The shared color math every color component speaks through, so a rounding rule or a
                   parsing tolerance is fixed once and holds everywhere. Installed by
                   <code>kit/js/lib/color.js</code>; no DOM, no state.</p>
                ${table("Function", [
                    ["sac.color.parse(str)", "→ <code>{ r, g, b, a }</code> (r/g/b integers 0–255, a float 0–1) or <code>null</code>. Accepts <code>rgb</code>, <code>rgba</code>, <code>rrggbb</code>, <code>rrggbbaa</code>, case-insensitive, with or without the leading <code>#</code>, surrounding whitespace trimmed. Anything else — a color name, an <code>rgb(…)</code> function, five digits, a non-string — is <code>null</code>. Callers read <code>null</code> as “still typing”, not as an error."],
                    ["sac.color.format(rgba, { alpha })", "→ <code>#rrggbb</code> lowercase, or <code>#rrggbbaa</code> with <code>alpha: true</code>. Components are clamped and rounded, a missing <code>a</code> counts as 1, and junk formats as <code>#000000</code> rather than throwing mid-render."],
                    ["sac.color.rgbToHsv({r,g,b})", "→ <code>{ h: 0–360, s: 0–1, v: 0–1 }</code>. Grays and black report <code>h: 0</code> — they have no hue. UI that must REMEMBER the hue across s=0 / v=0 keeps its own and only adopts this one when s and v are non-zero (that is the picker's job, not the function's)."],
                    ["sac.color.hsvToRgb({h,s,v})", "→ <code>{ r, g, b }</code> integers 0–255. Hue wraps (−90 → 270, 450 → 90), s/v clamp. rgb → hsv → rgb is stable across the whole cube, so dragging one thumb never drifts the channels you are not touching."],
                    ["sac.color.luma({r,g,b})", "→ 0–1, Rec. 709 (0.2126 R + 0.7152 G + 0.0722 B over 255)."],
                    ["sac.color.onColor({r,g,b})", "→ <code>#000000</code> or <code>#ffffff</code> — the readable text/icon color on that ground, flipping at luma 0.35."],
                ])}
                ${code(`const rgba = sac.color.parse(userInput);      // null while the field is half-typed
if (rgba) {
    label.style.background = sac.color.format(rgba);
    label.style.color      = sac.color.onColor(rgba);
}`)}

                <h2 id="sac-color-field">&lt;sac-color-field&gt;</h2>
                <p>The compact form row for a sidebar or settings panel: an optional label, a color well
                   and a hex input, with the
                   <a href="#sac-color-picker"><code>&lt;sac-color-picker&gt;</code></a> in a popover
                   instead of inline.</p>
                <div class="sg-demo sg-row" style="align-items:flex-start;gap:2rem;flex-wrap:wrap;">
                    <sac-color-field id="demo-color-field" label="Accent" value="#3b82f6"></sac-color-field>
                    <sac-color-field id="demo-color-field-alpha" label="Glow" value="#f9731688" alpha></sac-color-field>
                    <sac-color-field label="Locked" value="#22c55e" disabled></sac-color-field>
                    <!-- gap:0 — the global label carries its own 0.4rem
                         margin-bottom; a flex gap on top would double the
                         spacing against the fields' internal labels. -->
                    <div class="sg-col" style="flex:1;min-width:220px;gap:0;">
                        <label>Readout</label>
                        <div class="log" id="demo-color-field-out" style="height:auto;min-height:64px;"></div>
                    </div>
                </div>
                ${table("Attribute", [
                    ["value", "Tolerant in (<code>f00</code>, <code>#F00</code>, <code>ff0000</code>, <code>#ff0000cc</code>), reflected normalized: <code>#rrggbb</code>, or <code>#rrggbbaa</code> with <code>alpha</code>. An unparseable value is rejected — the last valid one is put back."],
                    ["alpha", "Presence adds the alpha channel: the picker gets its alpha strip and <code>value</code> reflects eight digits. Removing it forces the color opaque."],
                    ["label", "Label line above the row (kit form-label styling). Absent or empty renders no label line at all. Also becomes the hex input's accessible name."],
                    ["disabled", "Greys the row out, blocks the well and the input, and closes an open popover."],
                ])}
                ${table("Property", [
                    ["value", "get/set, normalized lowercase hex. Setting updates the well, the input and an open popover in place and fires <em>nothing</em> — events mean “the user did this”."],
                ])}
                ${table("Event", [
                    ["sac:change", "detail { value } — the normalized hex. Fired on USER changes only: a committed hex entry, or any picker interaction. The inner picker's identically named event is stopped at the boundary, so apps see exactly one."],
                ])}
                ${table("CSS custom property", [
                    ["--picker-width", "Set on the field, forwarded to the popover's <code>&lt;sac-color-picker&gt;</code>. Default <code>240px</code>."],
                ])}
                ${table("Interaction", [
                    ["Color well", "Click drops the picker below the field (built on first open); an outside click, a re-click or <kbd>Esc</kbd> closes it, focus returning to the well. The popover is <code>position: fixed</code> on the dropdown layer and flips above the field when there is no room below."],
                    ["Hex input", "A tolerant hex (<code>f00</code>, <code>ff0000cc</code>) + <kbd>Enter</kbd> commits; unparseable text is marked in <code>--danger</code> and reverts on blur."],
                ])}
                ${code(`<sac-color-field label="Accent" value="#3b82f6"></sac-color-field>
<sac-color-field label="Glow" value="#f9731688" alpha></sac-color-field>

field.addEventListener("sac:change", (e) => paint(e.detail.value));
field.value = "#22c55e";   // programmatic — updates the UI, fires nothing`)}
                ${compact(`the popover is at most <code>100vw - 16px</code> wide and the picker inside shrinks to it, so the
                   8px viewport clamp holds at 360px. Under <code>pointer: coarse</code> the well is 44 × 44 and the hex
                   input 44px tall with 16px type.`)}

                <h2 id="sac-swatch-grid">&lt;sac-swatch-grid&gt; + &lt;sac-swatch&gt;</h2>
                <p>A grid of square color buttons — the cell a palette strip, a recent-colors row or a
                   swap chart is built from. Swatch fills are <strong>data</strong>; everything
                   <em>around</em> a swatch (border, focus ring, corner pill) stays on tokens.</p>
                <div class="sg-demo sg-col" style="max-width:420px;">
                    <sac-swatch-grid id="demo-swatches" columns="8" selectable>
                        <sac-swatch value="#ef4444" label="Red"></sac-swatch>
                        <sac-swatch value="#f97316" label="Orange"></sac-swatch>
                        <sac-swatch value="#eab308" label="Yellow" count="3"></sac-swatch>
                        <sac-swatch value="#22c55e" label="Green"></sac-swatch>
                        <sac-swatch value="#14b8a6" label="Teal"></sac-swatch>
                        <sac-swatch value="#3b82f6" label="Blue" selected></sac-swatch>
                        <sac-swatch value="#6366f1" label="Indigo"></sac-swatch>
                        <sac-swatch value="#8b5cf6" label="Purple"></sac-swatch>
                        <sac-swatch value="#ec4899" label="Pink" count="12"></sac-swatch>
                        <sac-swatch value="#64748b" label="Slate"></sac-swatch>
                        <sac-swatch value="transparent" label="No color"></sac-swatch>
                        <sac-swatch value="#f2c500" label="Cadmium Yellow" disabled></sac-swatch>
                    </sac-swatch-grid>
                    <div class="sg-row" style="align-items:center;gap:0.75rem;flex-wrap:wrap;">
                        <button type="button" class="btn" style="width:auto" id="demo-swatches-reload">Swap palette via .colors</button>
                        <span id="demo-swatches-state" style="color:var(--text-muted);font-size:0.85rem;">selected: #3b82f6</span>
                    </div>
                </div>
                <p>An ordered strip whose cells need names — a token ramp, a heatmap legend, a
                   severity scale — uses <code>caption</code>: a quiet label that is part of the
                   swatch, not a badge on it.</p>
                <div class="sg-demo" style="max-width:420px;">
                    <sac-swatch-grid columns="10">
                        <sac-swatch value="#f8fafc" caption="50"></sac-swatch>
                        <sac-swatch value="#f1f5f9" caption="100"></sac-swatch>
                        <sac-swatch value="#e2e8f0" caption="200"></sac-swatch>
                        <sac-swatch value="#cbd5e1" caption="300"></sac-swatch>
                        <sac-swatch value="#94a3b8" caption="400"></sac-swatch>
                        <sac-swatch value="#64748b" caption="500"></sac-swatch>
                        <sac-swatch value="#475569" caption="600"></sac-swatch>
                        <sac-swatch value="#334155" caption="700"></sac-swatch>
                        <sac-swatch value="#1e293b" caption="800"></sac-swatch>
                        <sac-swatch value="#0f172a" caption="900"></sac-swatch>
                    </sac-swatch-grid>
                </div>
                ${table("sac-swatch attribute", [
                    ["value", "Any CSS color string (data, not theme). <code>transparent</code> is special-cased to a checkerboard + thin neutral diagonal line rather than a flat fill."],
                    ["label", "Sets aria-label + title on the internal button. Falls back to <code>value</code> when absent, so a swatch is never nameless."],
                    ["count", "Small corner pill. The attribute's <em>presence</em> shows it — <code>count=\"0\"</code> still renders “0”; omit it entirely for no pill. A count, nothing else — naming a cell with it is misuse; that is what <code>caption</code> is for."],
                    ["caption", "Quiet muted label under the cell (a ramp step “500”, a legend entry). Ellipsized, never widens its column. When no <code>label</code> is set it joins the accessible name: “500 · #64748b”."],
                    ["selected", "Boolean, reflected. A 2px <code>--accent</code> outline at 2px offset — an outline, not a border. Set by the grid in selectable mode, or directly on a stand-alone swatch."],
                    ["disabled", "Boolean, reflected. Unclickable, unfocusable, skipped by the keyboard walk and excluded from the roving tabindex."],
                ])}
                ${table("sac-swatch-grid attribute", [
                    ["columns", "Grid column count, default 8. A CSS custom property under the hood — changing it restyles, never re-renders — and the same number is the stride for ↓/↑ arrow navigation."],
                    ["selectable", "Turns on click-to-select (single selection) and switches the grid's role to listbox/option (plain <code>group</code> otherwise)."],
                ])}
                ${table("Property", [
                    ["sac-swatch.value / .label / .count / .caption", "String get/set; <code>\"\"</code> clears label/count/caption."],
                    ["sac-swatch.selected / .disabled", "Boolean get/set. <code>focus()</code> forwards to the shadow-internal button."],
                    ["sac-swatch-grid.colors", "get/set <code>[{ value, label?, count?, caption?, selected?, disabled? }]</code>. The setter rebuilds the light-DOM <code>&lt;sac-swatch&gt;</code> children from scratch — the one sanctioned bulk rebuild, for JS-driven palettes (a computed ramp sets <code>caption</code> per step). Getter and setter carry the same shape, so <code>grid.colors = grid.colors</code> is a lossless round-trip."],
                ])}
                ${table("Event", [
                    ["sac:change", "detail { value, swatch }. Fires only on a user click or keyboard activation that selects a different, non-disabled swatch — never for programmatic <code>selected</code> writes or the <code>.colors</code> setter."],
                ])}
                ${table("Keyboard", [
                    ["Grid", "Always on, with or without <code>selectable</code>: arrow keys walk the grid in 2D, <kbd>Home</kbd>/<kbd>End</kbd> jump to the ends, and a roving tabindex keeps exactly one swatch in the page's tab order — <kbd>Tab</kbd> resumes where you left off."],
                ])}
                ${code(`<sac-swatch-grid columns="8" selectable>
    <sac-swatch value="#ef4444" label="Red"></sac-swatch>
    <sac-swatch value="#eab308" label="Yellow" count="3"></sac-swatch>
    <sac-swatch value="transparent" label="No color"></sac-swatch>
</sac-swatch-grid>

grid.addEventListener("sac:change", (e) => setBrush(e.detail.value));
grid.colors = [{ value: "#ef4444", label: "Red" }];   // bulk rebuild, no event`)}
                ${compact(`no dragging — tap selects. Columns stay at <code>columns</code> (it is the keyboard stride too)
                   and cells shrink with the container; a long caption ellipsizes. Under <code>pointer: coarse</code> a
                   swatch's hit area is its cell plus half the gap (44px once a cell is ~36px wide) — pick fewer columns
                   for touch-first palettes.`)}

                <h2 id="sac-calendar">&lt;sac-calendar&gt;</h2>
                <p>An embeddable month calendar: a paged header (‹ month, ‹‹ year, ‹‹‹ decade — a
                   birth date 50 years back is five clicks, not six hundred), weekday row and a
                   fixed 6×7 day grid that never changes height. Dates cross the API as ISO strings
                   (<code>yyyy-mm-dd</code>); month and weekday names come from <code>Intl</code>
                   in the browser's locale, so no locale data ships and no format is hand-rolled.</p>
                <div class="sg-demo sg-row" style="align-items:flex-start;gap:2rem;flex-wrap:wrap;">
                    <sac-calendar id="demo-cal" value="2026-08-15"></sac-calendar>
                    <sac-calendar id="demo-cal-bounded" value="2026-08-15"
                                  min="2026-08-04" max="2026-08-27" week-start="0"
></sac-calendar>
                    <div class="sg-col" style="gap:0.6rem;min-width:200px;">
                        <code id="demo-cal-out">waiting for a selection…</code>
                        <p class="sg-note" style="margin:0;">Both calendars report into the same
                           line. The second one is bounded (min/max) and starts its weeks on Sunday.</p>
                    </div>
                </div>
                ${table("Attribute", [
                    ["value", "ISO selected date, reflected. Parsed tolerantly (whitespace trimmed, single-digit month/day zero-padded) and written back <b>normalized</b>, so attribute and property never disagree. Setting it programmatically updates in place, jumps the view to its month and fires nothing. An unparseable or impossible date (<code>2026-02-31</code>) is ignored and the attribute heals back to the current selection. Empty / absent = no selection."],
                    ["min, max", "ISO bounds, inclusive. Days outside render disabled: the keyboard walk still lands on them, but click and <kbd>Enter</kbd>/<kbd>Space</kbd> do nothing there. Unparseable bounds count as absent."],
                    ["week-start", "<code>\"1\"</code> (default, Monday) or <code>\"0\"</code> (Sunday). Sets the grid's first column and the <kbd>Home</kbd>/<kbd>End</kbd> week edges."],
                ])}
                ${table("Property", [
                    ["value", "get/set, normalized ISO or <code>\"\"</code>. Readable straight after <code>createElement</code>, before the element is connected."],
                ])}
                ${table("Method", [
                    ["focus(options)", "Focuses the tabbable day cell (roving tabindex — exactly one day is in the tab order)."],
                ])}
                ${table("Event", [
                    ["sac:change", "detail { value } — the ISO string. Fired on USER selection only (click, <kbd>Enter</kbd>/<kbd>Space</kbd>) and only when the date actually changes — re-selecting the selected day stays quiet."],
                ])}
                ${table("CSS custom property", [
                    ["--calendar-width", "Width of the whole calendar. Default <code>280px</code> (<code>320px</code> under <code>pointer: coarse</code>, for 44px day cells). Never wider than its container — the day cells shrink instead."],
                ])}
                ${table("Interaction", [
                    ["Header", "Three chevron pairs page the view: ‹ › ±1 month, ‹‹ ›› ±1 year, ‹‹‹ ››› ±10 years — the selection never moves; the month label announces each page (aria-live polite)."],
                    ["Day cells", "Today wears a small accent dot; the selected day the 2px accent ring — an outline, not a border. Neighbor-month days are dimmed but live: selecting one, by click or keyboard, navigates and selects."],
                ])}
                ${table("Keyboard", [
                    ["Arrows", "±1 day (left/right), ±7 days (up/down). The walk crosses month boundaries and the view follows the focus."],
                    ["PageUp / PageDown", "±1 month; with <kbd>Shift</kbd> ±1 year. The day clamps: Jan 31 pages to Feb 28/29, a leap day steps to Feb 28."],
                    ["Home / End", "Start / end of the focused week."],
                    ["Enter / Space", "Select the focused day."],
                ])}
                ${code(`<sac-calendar value="2026-08-15"></sac-calendar>
<sac-calendar value="2026-08-15" min="2026-08-04" max="2026-08-27" week-start="0"></sac-calendar>`)}
                ${code(`cal.addEventListener("sac:change", (e) => {
    load(e.detail.value);        // "2026-08-15"
});
cal.value = "2026-12-24";        // selects + shows December, fires nothing`)}
                ${compact(`caps itself at its container's width, so the seven columns shrink rather than overflow. Under
                   <code>pointer: coarse</code> the default width grows to 320px for 44 × 44 day cells, and the header
                   wraps: the month label on its own line, the six paging buttons as 44px targets below it.`)}

                <h2 id="sac-date-field">&lt;sac-date-field&gt;</h2>
                <p>The compact form row for a sidebar or settings panel: an optional label, an ISO
                   date input and a calendar button, with the
                   <a href="#sac-calendar"><code>&lt;sac-calendar&gt;</code></a> in a popover
                   instead of inline.</p>
                <div class="sg-demo sg-row" style="align-items:flex-start;gap:2rem;flex-wrap:wrap;">
                    <sac-date-field id="demo-date-field" label="Due" value="2026-08-15"></sac-date-field>
                    <sac-date-field id="demo-date-field-bounded" label="This year" value="2026-08-15"
                                    min="2026-01-01" max="2026-12-31"></sac-date-field>
                    <sac-date-field label="Locked" value="2026-08-15" disabled></sac-date-field>
                    <!-- gap:0 — see the color-field readout note. -->
                    <div class="sg-col" style="flex:1;min-width:220px;gap:0;">
                        <label>Readout</label>
                        <div class="log" id="demo-date-field-out" style="height:auto;min-height:64px;"></div>
                    </div>
                </div>
                ${table("Attribute", [
                    ["value", "ISO date, tolerant in (whitespace, single-digit month/day: <code>2026-8-5</code>), reflected normalized <code>yyyy-mm-dd</code>. Empty or absent = no selection. An unparseable or impossible date (<code>2026-02-31</code>) is rejected — the last valid value is put back."],
                    ["min, max", "ISO bounds, inclusive, forwarded to the popover calendar (days outside render disabled there). A typed date outside the bounds counts as invalid and never commits."],
                    ["week-start", "<code>\"1\"</code> Monday (the calendar's default) or <code>\"0\"</code> Sunday, forwarded to the popover calendar."],
                    ["label", "Label line above the row (kit form-label styling). Absent or empty renders no label line at all. Also becomes the input's accessible name."],
                    ["placeholder", "The input's placeholder. Default <code>yyyy-mm-dd</code>."],
                    ["disabled", "Greys the row out, blocks the input and the button, and closes an open popover."],
                ])}
                ${table("Property", [
                    ["value", "get/set, normalized ISO or <code>\"\"</code>. Setting updates the input and an open popover in place and fires <em>nothing</em> — events mean “the user did this”. Never overwrites text mid-typing."],
                ])}
                ${table("Event", [
                    ["sac:change", "detail { value } — the normalized ISO, or <code>\"\"</code> when the user cleared the input. Fired on USER changes only: a committed typed date or a picked day. The inner calendar's identically named event is stopped at the boundary, so apps see exactly one."],
                ])}
                ${table("CSS custom property", [
                    ["--calendar-width", "Set on the field, forwarded to the popover's <code>&lt;sac-calendar&gt;</code>. Default <code>280px</code> (<code>320px</code> under <code>pointer: coarse</code>)."],
                ])}
                ${table("Interaction", [
                    ["Calendar button", "Click drops the calendar below the field (built on first open); an outside click, a re-click, <kbd>Esc</kbd> or picking a day closes it, focus returning to the button. The popover is <code>position: fixed</code> on the dropdown layer and flips above the field when there is no room below."],
                    ["Date input", "A tolerant ISO date (<code>2026-8-5</code>) + <kbd>Enter</kbd> commits and normalizes; invalid or out-of-range text is marked in <code>--danger</code> and reverts on blur or <kbd>Esc</kbd>."],
                ])}
                ${code(`<sac-date-field label="Due" value="2026-08-15"></sac-date-field>
<sac-date-field label="This year" value="2026-08-15" min="2026-01-01" max="2026-12-31"></sac-date-field>

field.addEventListener("sac:change", (e) => plan(e.detail.value));
field.value = "2026-09-01";   // programmatic — updates the UI, fires nothing`)}
                ${compact(`the popover is at most <code>100vw - 16px</code> wide and the calendar shrinks to it. Under
                   <code>pointer: coarse</code> the input and the calendar button are 44px (the button 44 × 44), the input
                   uses 16px type, the calendar gets 44px day cells.`)}

                <h2 id="sac-collapsible">&lt;sac-collapsible&gt;</h2>
                <p>Clamps content to a max height; when it actually overflows, a separator line with a
                   hanging “more/less” tab appears, plus a gradient fade at the clipped edge. Overflow is
                   re-measured on slot changes and resizes.</p>
                <div class="sg-demo" style="max-width:420px;">
                    <sac-collapsible max-height="48px">
                        <div class="sg-row" style="gap:4px;">
                            ${["alpha","bravo","charlie","delta","echo","foxtrot","golf","hotel","india","juliett",
                               "kilo","lima","mike","november","oscar","papa","quebec","romeo","sierra","tango",
                               "uniform","victor","whiskey","xray","yankee","zulu"]
                                .map((n, i) => `<sac-chip label="${n}" color="${["blue","green","orange","purple","pink","teal","yellow","red","indigo","gray"][i % 10]}"></sac-chip>`)
                                .join("")}
                        </div>
                    </sac-collapsible>
                </div>
                ${table("Attribute", [
                    ["max-height", "CSS length for the clamped state (default 82px)."],
                    ["more-label / less-label", "Tab texts (default \"more\"/\"less\")."],
                    ["expanded", "Presence = expanded. Property <code>.expanded</code> mirrors it."],
                ])}
                ${table("Event", [["sac:toggle", "detail { expanded }."]])}
                ${table("Method", [["measure()", "Re-run overflow detection (escape hatch)."]])}
                ${compact(`the tab gets a 44 × 44 hit halo under <code>pointer: coarse</code>; no hover tint sticks after a tap.
                   The clamp re-measures when a phone rotates or a panel narrows.`)}

                <h2 id="sac-chip">&lt;sac-chip&gt;</h2>
                <p>Colored pill. <code>color</code> is a <strong>palette slot name</strong> resolved to
                   <code>var(--palette-&lt;slot&gt;)</code>; fill/tint/border all derive from that one token
                   via <code>color-mix()</code>.</p>
                <div class="sg-demo sg-row">
                    <sac-chip label="plain" color="blue"></sac-chip>
                    <sac-chip label="clickable" color="green" clickable></sac-chip>
                    <sac-chip label="selected" color="orange" clickable selected></sac-chip>
                    <sac-chip label="removable" color="purple" removable></sac-chip>
                </div>
                ${table("Attribute", [
                    ["label", "Display text."],
                    ["color", "Palette slot (blue, orange, red, green, purple, pink, yellow, teal, gray, indigo). Unknown → gray."],
                    ["removable / selected / clickable", "× button / active ring / hover affordance."],
                ])}
                ${table("Event", [["sac:remove", "detail { label } (only with [removable])."]])}
                ${compact(`under <code>pointer: coarse</code> the × grows to 24px with a 44 × 44 halo and a
                   <code>clickable</code> chip gets a 44px-tall host halo — the pill keeps its look. Under
                   <code>hover: none</code> the × is always shown. Give chips ~10px gap on touch so halos do not overlap.`)}

                <h2 id="sac-chip-input">&lt;sac-chip-input&gt;</h2>
                <p>Combobox for a list of named chips — chips + input + filtered dropdown. Decoupled
                   from any backend: you supply <code>.suggestions</code>, you persist on
                   <code>change</code> / <code>sac:create</code>.</p>
                <div class="sg-demo sg-col">
                    <sac-chip-input id="demo-chips" add-label="Add tag" allow-create></sac-chip-input>
                    <span id="demo-chips-state" style="color:var(--text-muted);font-size:0.85rem;">value: []</span>
                </div>
                ${table("Attribute", [
                    ["add-label", "Ghost-button text when empty (default \"Add\")."],
                    ["allow-create", "Enables “Create '…'” with the 10-swatch palette picker."],
                ])}
                ${table("Property", [
                    ["value", "string[] — normalised names; reading returns a copy."],
                    ["suggestions", "[{ name, color, count? }] — color is a palette slot."],
                ])}
                ${table("Event", [
                    ["sac:change", "detail { value: string[] } (new list). Bubbles, not composed."],
                    ["sac:create", "detail { name, color } — persist it, then refresh .suggestions."],
                ])}
                ${table("Keyboard", [
                    ["Input", "<kbd>Tab</kbd> / <kbd>Enter</kbd> / comma commit the highlighted (or top) entry · <kbd>Esc</kbd> closes the dropdown without committing · <kbd>↓</kbd>/<kbd>↑</kbd> move the highlight · <kbd>Backspace</kbd> on an empty input removes the last chip."],
                ])}
                ${compact(`a tap commits a suggestion (a swipe that scrolls the list picks nothing). Under
                   <code>pointer: coarse</code> suggestion rows are 44px, the add button and colour swatches get 44px
                   halos, chips sit 10px apart and the field uses 16px type. The dropdown is at most
                   <code>100vw - 16px</code> wide and flips above the field when the on-screen keyboard is up.`)}

                <h2 id="sac-drop-zone">&lt;sac-drop-zone&gt;</h2>
                <p>One surface for both ways files arrive: drag files onto it, click it, or focus it and
                   press <kbd>Enter</kbd> — every gesture ends in the same <code>sac:files</code> event,
                   so an app wires one listener and never asks which gesture the user chose.</p>
                <div class="sg-demo sg-col" style="max-width:520px;">
                    <sac-drop-zone id="demo-drop" accept=".svg,.png,image/*" multiple
                                   label="Drop images here" hint="or click to browse"
                                   touch-label="Choose images" touch-hint="Tap to browse"></sac-drop-zone>
                    <ul id="demo-drop-list" style="margin:0;padding-left:1.1rem;color:var(--text-muted);font-size:0.85rem;">
                        <li>No files yet.</li>
                    </ul>
                    <sac-drop-zone label="Import is locked" hint="finish the current run first"
                                   disabled style="--drop-zone-min-height:100px;"></sac-drop-zone>
                </div>
                ${table("Attribute", [
                    ["accept", "Mirrored verbatim into the hidden input, and applied to dropped files with the same semantics: <code>.svg</code> = name suffix (case-insensitive), <code>image/*</code> = MIME prefix, <code>image/png</code> = exact MIME. Absent = take anything."],
                    ["multiple", "Presence = keep every accepted file; absent = the first one only."],
                    ["label", "Main line. Default <code>Drop files here</code>; <code>label=\"\"</code> hides it."],
                    ["hint", "Dim second line. Default <code>or click to browse</code>; <code>hint=\"\"</code> hides it."],
                    ["touch-label / touch-hint", "The two lines on a touch-only device (<code>hover: none</code> and <code>pointer: coarse</code>), where nothing can be dragged in. Defaults <code>Choose files</code> / <code>Tap to browse</code> — used only when the matching <code>label</code> / <code>hint</code> is not set, so an app that sets <code>label</code> sets <code>touch-label</code> too."],
                    ["disabled", "Dims the surface and blocks click, keyboard <em>and</em> drop — the drag is not accepted, so the browser shows the “no drop” cursor rather than a lie."],
                    ["over", "Set by the component while a file drag hovers — an accent wash + accent icon and label, never a thicker border or a scale that would move the target while the user aims at it. Drags carrying no files never set it. Read it, don't write it."],
                ])}
                ${table("Method", [
                    ["browse()", "Opens the picker. Browsers only honor this inside a user gesture."],
                ])}
                ${table("Event", [
                    ["sac:files", "detail { files } — accepted files as a plain Array, from drop <em>and</em> picker alike. The hidden shadow <code>&lt;input type=\"file\"&gt;</code> is reset after every pick, so picking the same file twice in a row really fires twice."],
                    ["sac:rejected", "detail { files } — fired <em>instead</em> of sac:files when <code>accept</code> filtered out every dropped file. Whether that deserves a toast is the app's call."],
                ])}
                ${table("CSS custom property", [
                    ["--drop-zone-min-height", "Height of the surface. Default <code>140px</code>."],
                    ["class=\"on-viewport\"", "On the <code>.viewport</code> ground (black in every theme) — a drop zone over an empty canvas — add the kit's <code>.on-viewport</code> class: it re-derives ink, lines and glass for that dark ground, so the light theme does not paint a light slab on black."],
                ])}
                ${table("CSS shadow part", [
                    ["zone", "The dashed surface itself, for the rare app that needs to reshape it."],
                ])}
                ${code(`<sac-drop-zone accept=".svg,image/*" multiple
               label="Drop your SVG here" hint="or click to browse"
               touch-label="Choose an SVG" touch-hint="Tap to browse"></sac-drop-zone>`)}
                ${code(`zone.addEventListener("sac:files", (e) => {
    for (const file of e.detail.files) console.log(file.name, file.size);
});
zone.addEventListener("sac:rejected", (e) => {
    sac.toast(\`\${e.detail.files.length} file(s) of the wrong type.\`, { kind: "warn" });
});`)}
                ${compact(`phones have no OS drag-and-drop, so on a touch-only device (<code>hover: none</code> and
                   <code>pointer: coarse</code>) the zone is a tap target first: the whole surface opens the picker and the
                   <code>touch-label</code> / <code>touch-hint</code> wording replaces “drop / click”. It follows a live
                   switch between touch and mouse; drops still work where the platform supports them.`)}

                <h2 id="sac-file-browser">&lt;sac-file-browser&gt;</h2>
                <p>A folder view over any <code>sac.fs</code> handle — the user's files, an app's own
                   drawer, a host's space. <code>sprites/hero.png</code> <em>is</em> the folder
                   <code>sprites</code>; a folder the user creates empty keeps itself with a hidden marker. It is the list inside the
                   <code>sac.files.virtual()</code> dialogs, and on its own the body of a Files app.</p>
                <div class="sg-demo sg-col" style="max-width:640px;height:320px;">
                    <sac-file-browser id="demo-file-browser" pixelated root-label="Demo files"
                                      style="flex:1;min-height:0;"></sac-file-browser>
                    <span id="demo-file-browser-result" style="color:var(--text-muted);font-size:0.85rem;">Double-click a file.</span>
                </div>
                ${table("Attribute", [
                    ["accept", "<code>.png,image/*</code> — the file input's grammar. Files that do not match are left out; folders always show."],
                    ["multiple", "Presence: Ctrl/⌘-click and Shift-click (Shift+↑/↓) select several."],
                    ["readonly", "Presence hides New folder, the per-row delete buttons and the Delete key — a view that changes nothing."],
                    ["pixelated", "Presence draws image thumbnails with hard pixel edges. Default smooth — most images are not pixel art."],
                    ["root-label", "The first breadcrumb. Default <code>Files</code>."],
                ])}
                ${table("Property / method", [
                    ["store", "The <code>sac.fs</code> handle to browse (<code>list</code>, <code>stat</code>, <code>read</code>, <code>remove</code>). Setting it resets to the root."],
                    ["path", "The current folder, <code>\"\"</code> = root. Setting navigates."],
                    ["selected", "The selected file paths (folders are never selected)."],
                    ["refresh()", "Re-read the current folder — after writing into the store from outside."],
                    ["up()", "One folder up."],
                    ["newFolder()", "An inline name field; Enter creates the folder and goes into it. An empty folder keeps itself alive with a hidden <code>&lt;folder&gt;/.folder</code> marker entry — never listed, removed with the folder."],
                    ["select(path)", "Select one file by path."],
                ])}
                ${table("Event", [
                    ["sac:select", "detail { paths } — the selection changed (user action)."],
                    ["sac:choose", "detail { paths } — a file was double-clicked or Enter'd. Folders open on a single click and never choose."],
                    ["sac:navigate", "detail { path } — the folder changed."],
                    ["sac:remove", "detail { path, folder } — a file, or a folder with everything in it, was deleted after an armed confirm that says how many files go with it."],
                ])}
                ${code(`<sac-file-browser accept=".png,image/*" pixelated></sac-file-browser>

browser.store = sac.fs.shared("files");
browser.addEventListener("sac:choose", (e) => open(e.detail.paths[0]));`)}
                <p>Keyboard: ↑/↓ Home/End move · Enter opens the folder or chooses the file ·
                   Backspace goes up · Delete removes the file or folder (asks first). Rows: folders first, then files by
                   name — an image file shows itself as its thumbnail, on the token checker.</p>
                ${compact(`under a 480px <em>container</em> the size and date columns drop out, so it fits a
                   narrow window or a bottom-sheet dialog. Rows are 44px on touch and the delete button is
                   always visible there — no hover to reveal it.`)}

                <h2 id="sac-avatar">&lt;sac-avatar&gt;</h2>
                <p>Round identity badge — initials by default, photo when <code>src</code> is set. The
                   <code>name</code> is hashed to one of the ten <code>--palette-*</code> slots and
                   painted with the <a href="#sac-chip"><code>&lt;sac-chip&gt;</code></a> tint pattern
                   (background at 25%, text at full); the same name always lands on the same slot, so a
                   person keeps their color across every list without anyone storing one.</p>
                <div class="sg-demo sg-row">
                    <sac-avatar name="Ada Lovelace"></sac-avatar>
                    <sac-avatar name="Grace Hopper"></sac-avatar>
                    <sac-avatar name="Alan Turing"></sac-avatar>
                    <sac-avatar name="Margaret Hamilton"></sac-avatar>
                    <sac-avatar name="Katherine Johnson"></sac-avatar>
                    <sac-avatar name="Radia Perlman"></sac-avatar>
                    <sac-avatar name="Barbara Liskov"></sac-avatar>
                    <sac-avatar name="Marconi"></sac-avatar>
                    <sac-avatar name="Build Bot" label="BB"></sac-avatar>
                    <sac-avatar name="Ada Lovelace" src="${DEMO_PORTRAIT}"></sac-avatar>
                    <sac-avatar name="Ada Lovelace" style="--avatar-size: 56px"></sac-avatar>
                </div>
                ${table("Attribute", [
                    ["name", "Source of the initials, the color hash and the accessible name. First letter of each of the first two words; a single word uses its own first two letters."],
                    ["src", "Image URL, drawn over the initials layer. On a load error the component falls back to initials by itself — both layers stay in the DOM, so a later <code>src</code> change un-hides the image again."],
                    ["label", "Verbatim override for the initials (<code>\"BB\"</code>). Also wins as the accessible name when <code>name</code> is empty."],
                ])}
                ${table("CSS custom property", [
                    ["--avatar-size", "Diameter, default <code>32px</code>. The font is 0.4× of it, so one property sizes the whole badge."],
                ])}
                ${code(`<sac-avatar name="Ada Lovelace"></sac-avatar>
<sac-avatar name="Ada Lovelace" src="ada.png"></sac-avatar>
<sac-avatar name="Build Bot" label="BB" style="--avatar-size: 48px"></sac-avatar>`)}

                <h2 id="sac-copy-button">&lt;sac-copy-button&gt;</h2>
                <p>Click-to-copy in one tag: a literal <code>value</code>, or a <code>for</code>
                   selector — the form to prefer next to a command line, since the page text stays the
                   single source of truth. The icon swaps in place to a check for ~1.4s on success and
                   to an error glyph on failure; nothing moves, nothing resizes. A button beside it
                   (delete, edit) is an <code>.icon-btn</code> — same recipe, same tokens.</p>
                <div class="sg-demo sg-col" style="max-width:420px;">
                    <div class="sg-row">
                        <sac-copy-button id="demo-copy-value" value="npx serve ."></sac-copy-button>
                        <span style="color:var(--text-muted);font-size:0.85rem;">copies a fixed <code>value</code></span>
                    </div>
                    <div class="sg-row">
                        <code id="demo-copy-src">npx serve .</code>
                        <sac-copy-button id="demo-copy-for" for="#demo-copy-src" label="Copy command"></sac-copy-button>
                        <span style="color:var(--text-muted);font-size:0.85rem;">copies the <code>for</code> target's text</span>
                    </div>
                    <span id="demo-copy-out" style="color:var(--text-muted);font-size:0.85rem;">copied: (nothing yet)</span>
                </div>
                ${table("Attribute", [
                    ["value", "Literal text to copy. Wins over <code>for</code>."],
                    ["for", "A <code>document.querySelector</code> selector; the target's trimmed <code>textContent</code> is copied. Read fresh at click time, so live text is always current."],
                    ["label", "Accessible name, default <code>Copy</code> — sets both <code>aria-label</code> and <code>title</code>, synced in place."],
                ])}
                ${table("Event", [
                    ["sac:copy", "detail { text } — only on a successful clipboard write. A failure logs via <code>console.warn</code> and fires nothing."],
                ])}
                ${code(`<sac-copy-button value="npx serve ."></sac-copy-button>
<sac-copy-button for="#install-cmd" label="Copy command"></sac-copy-button>`)}
                ${compact(`under <code>pointer: coarse</code> it keeps its 26px look with a 44 × 44 hit halo — the
                   <code>.icon-btn</code> rule. No hover wash sticks after a tap. Copying needs a secure context on phones
                   too.`)}

                <h2 id="sac-scene-graph">&lt;sac-scene-graph&gt; + &lt;sac-scene-item&gt;</h2>
                <p>Generic tree list with visibility eyes, color wells, delete buttons and expand chevrons.
                   The element's <code>id</code> is the data id in every event detail — give items meaningful ids.</p>
                <div class="sg-demo" style="max-width:320px;background:var(--panel);">
                    <sac-scene-graph id="demo-scene">
                        <sac-scene-item id="grp-1" label="Group A" visible expanded>
                            <sac-scene-item id="obj-1" label="Mesh 1" visible color="#3b82f6" can-delete></sac-scene-item>
                            <sac-scene-item id="obj-2" label="Mesh 2" color="#10b981" can-delete></sac-scene-item>
                        </sac-scene-item>
                        <sac-scene-item id="obj-3" label="Light" visible active></sac-scene-item>
                    </sac-scene-graph>
                    <div id="demo-scene-log" style="color:var(--text-muted);font-size:0.8rem;margin-top:0.5rem;">click around…</div>
                </div>
                ${table("sac-scene-item attribute", [
                    ["label / visible / color / can-delete / active / expanded", "Row state. color renders a color well."],
                    ["expandable", "Keeps the chevron on rows whose children are built lazily."],
                ])}
                ${table("Event (all bubble + composed, detail.id = element id)", [
                    ["sac:select", "detail also carries additive (ctrl/cmd) and range (shift) for multi-selection."],
                    ["sac:visibility", "detail.visible = requested new state (host applies it)."],
                    ["sac:expand / sac:delete / sac:recolor", "detail.expanded / — / detail.color."],
                ])}
                ${compact(`under <code>pointer: coarse</code> every row is 44px tall and each control (chevron, eye, colour
                   well, trash) a real 44 × 44 box — side by side, so boxes, not overlapping halos. Every action is
                   always visible; under <code>hover: none</code> no row stays lit after a tap.`)}

                <h2 id="sac-log">&lt;sac-log&gt;</h2>
                <div class="sg-demo sg-col" style="max-width:420px;">
                    <sac-log id="demo-log" style="height:140px;"></sac-log>
                    <div class="sg-row">
                        <button class="btn" style="width:auto" data-log="info">info</button>
                        <button class="btn" style="width:auto" data-log="warn">warn</button>
                        <button class="btn" style="width:auto" data-log="error">error</button>
                    </div>
                </div>
                ${table("Method", [
                    ["add(text, level)", "level: \"info\" | \"warn\" | \"error\" → --ok-text / --accent-warm-text / --danger-text. Timestamped."],
                    ["clear() / copy()", "Empty the log / copy all entries to the clipboard."],
                ])}
                <p>There is also a plain CSS <code>.log</code> box for div-based logs — see CSS Patterns.</p>
                ${compact(`entry text is always selectable, even inside a <code>user-select: none</code> shell. Under
                   <code>pointer: coarse</code> the Copy / Clear buttons are 44px (the header grows). The body is its own
                   container: below 480px of its own width, long unbroken strings wrap instead of scrolling sideways.`)}

                <h2 id="sac-hud">&lt;sac-hud&gt;</h2>
                <p>Viewport overlay readout: absolute inside a relative parent, auto-hides when empty,
                   <code>pointer-events: none</code>.</p>
                <div class="sg-demo on-bg" style="position:relative;height:120px;">
                    <sac-hud position="top-right">zoom 1.00 · 60 fps</sac-hud>
                    <sac-hud position="bottom-left">x 12.5 · y -3.2</sac-hud>
                </div>
                ${table("Attribute", [["position", "top-left | top-right | bottom-left | bottom-right (default top-right)."]])}

                <h2 id="sac-loader">&lt;sac-loader&gt;</h2>
                <p>Full-screen blocking overlay, two concentric rings (accent + accent-warm).</p>
                <div class="sg-demo">
                    <button class="btn" style="width:auto" id="demo-loader">Show for 2 seconds</button>
                    <sac-loader id="demo-loader-el"></sac-loader>
                </div>
                ${table("Method", [["show(title, subtitle)", "Displays the overlay."], ["hide()", "Fades out over 300ms."]])}
                ${compact(`the overlay covers the whole screen, its content kept clear of notch and home bar by safe-area
                   padding; a long title wraps centred. No controls.`)}

                <h2 id="sac-footer">&lt;sac-footer&gt;</h2>
                <p>Branded footer. The link renders <em>only</em> when <code>link-href</code> is set —
                   the no-dead-links rule, enforced by the component.</p>
                <div class="sg-demo" style="padding:0;">
                    <sac-footer brand="MY APP" version="1.2.3" link-href="https://example.com" link-label="GITHUB" style="margin-top:0;"></sac-footer>
                </div>
                ${table("Attribute", [
                    ["brand / version", "Text + optional \" · v…\"."],
                    ["link-href / link-label", "Optional external link (label default \"LINK\")."],
                ])}
                ${compact(`the bottom padding adds <code>env(safe-area-inset-bottom)</code>, so the home bar never sits on the
                   text; the line wraps at 360px. Under <code>pointer: coarse</code> the link gets a 44px-tall halo.`)}

                <h2 id="sac-tabs">&lt;sac-tab-group&gt; + &lt;sac-tab&gt; + &lt;sac-tab-panel&gt;</h2>
                <p>Three elements, one state: the group's <code>active</code> attribute toggles
                   <code>[active]</code> on the matching tab and panel in place — no panel is ever
                   moved, re-rendered or re-parented, so a scroll position, a canvas or a half-filled
                   form survives every switch. Tabs assign themselves to the strip slot (never write
                   <code>slot="tab"</code>); order in the light DOM is free.</p>
                <div class="sg-demo sg-col">
                    <sac-tab-group id="demo-tabs" active="one">
                        <sac-tab name="one">Overview</sac-tab>
                        <sac-tab name="two">Settings</sac-tab>
                        <sac-tab name="three">Log</sac-tab>
                        <sac-tab-panel name="one">
                            <p style="margin:0;">Panels are plain light DOM — everything in the kit's global
                               stylesheet works inside them, unchanged.</p>
                        </sac-tab-panel>
                        <sac-tab-panel name="two">
                            <sac-toggle label="Snap to grid" checked></sac-toggle>
                            <sac-toggle label="Show hidden"></sac-toggle>
                        </sac-tab-panel>
                        <sac-tab-panel name="three">
                            <p style="margin:0;">Switch away and back: this panel was never re-rendered,
                               only hidden.</p>
                        </sac-tab-panel>
                    </sac-tab-group>
                    <span id="demo-tabs-state" style="color:var(--text-muted);font-size:0.85rem;">active: one</span>
                </div>
                <p>By default the strip is a single unwrapped row — past the point where the tabs
                   stop fitting, it overflows its container. The <code>overflow</code> attribute
                   decides what happens instead: <code>wrap</code> folds the tabs into extra rows
                   (a sidebar — vertical room is cheap and seeing every choice at once is the
                   point), <code>scroll</code> keeps the strip one row tall and pans it like an
                   editor's tab bar — mouse wheel over the strip, ‹ › buttons at the ends while
                   there is more in that direction, never a scrollbar. With <code>scroll</code>,
                   the active tab is panned into view whenever <code>active</code> changes — the
                   second group below loads with a far tab active to show it.</p>
                <div class="sg-demo sg-row" style="align-items:flex-start;">
                    <div style="width:240px;">
                        <sac-tab-group overflow="wrap" active="general">
                            <sac-tab name="general">General</sac-tab>
                            <sac-tab name="display">Display</sac-tab>
                            <sac-tab name="audio">Audio</sac-tab>
                            <sac-tab name="input">Input</sac-tab>
                            <sac-tab name="network">Network</sac-tab>
                            <sac-tab name="sync">Sync</sac-tab>
                            <sac-tab name="privacy">Privacy</sac-tab>
                            <sac-tab name="advanced">Advanced</sac-tab>
                            <sac-tab-panel name="general"><p style="margin:0;"><code>overflow="wrap"</code> in a 240px column.</p></sac-tab-panel>
                            <sac-tab-panel name="display"><p style="margin:0;">Display settings.</p></sac-tab-panel>
                            <sac-tab-panel name="audio"><p style="margin:0;">Audio settings.</p></sac-tab-panel>
                            <sac-tab-panel name="input"><p style="margin:0;">Input settings.</p></sac-tab-panel>
                            <sac-tab-panel name="network"><p style="margin:0;">Network settings.</p></sac-tab-panel>
                            <sac-tab-panel name="sync"><p style="margin:0;">Sync settings.</p></sac-tab-panel>
                            <sac-tab-panel name="privacy"><p style="margin:0;">Privacy settings.</p></sac-tab-panel>
                            <sac-tab-panel name="advanced"><p style="margin:0;">Advanced settings.</p></sac-tab-panel>
                        </sac-tab-group>
                    </div>
                    <div style="width:240px;">
                        <sac-tab-group overflow="scroll" active="privacy">
                            <sac-tab name="general">General</sac-tab>
                            <sac-tab name="display">Display</sac-tab>
                            <sac-tab name="audio">Audio</sac-tab>
                            <sac-tab name="input">Input</sac-tab>
                            <sac-tab name="network">Network</sac-tab>
                            <sac-tab name="sync">Sync</sac-tab>
                            <sac-tab name="privacy">Privacy</sac-tab>
                            <sac-tab name="advanced">Advanced</sac-tab>
                            <sac-tab-panel name="general"><p style="margin:0;">General settings.</p></sac-tab-panel>
                            <sac-tab-panel name="display"><p style="margin:0;">Display settings.</p></sac-tab-panel>
                            <sac-tab-panel name="audio"><p style="margin:0;">Audio settings.</p></sac-tab-panel>
                            <sac-tab-panel name="input"><p style="margin:0;">Input settings.</p></sac-tab-panel>
                            <sac-tab-panel name="network"><p style="margin:0;">Network settings.</p></sac-tab-panel>
                            <sac-tab-panel name="sync"><p style="margin:0;">Sync settings.</p></sac-tab-panel>
                            <sac-tab-panel name="privacy"><p style="margin:0;"><code>overflow="scroll"</code> — this tab was panned into view on load.</p></sac-tab-panel>
                            <sac-tab-panel name="advanced"><p style="margin:0;">Advanced settings.</p></sac-tab-panel>
                        </sac-tab-group>
                    </div>
                </div>
                ${table("sac-tab-group attribute", [
                    ["active", "Name of the active tab. Observed; applied in place. Absent on connect → the first tab is activated. Property <code>.active</code> mirrors it (setting it switches tabs but fires no event — the caller already knows)."],
                    ["overflow", "What happens when the tabs outgrow the strip. <code>wrap</code>: fold into extra rows — the hairline closes the strip under the last row only, deliberately. <code>scroll</code>: one row, panned like an editor's tab bar — mouse wheel over the strip, ‹ › buttons at the ends while there is more in that direction, never a scrollbar; the active tab is panned into view whenever <code>active</code> changes, so a deep link can't select a tab nobody can see. Absent: a single unwrapped row (unchanged default)."],
                ])}
                ${table("sac-tab attribute", [
                    ["name", "The key a panel matches on."],
                    ["active", "Set by the group, not by hand — styles the accent underline."],
                    ["disabled", "Dimmed, unclickable, skipped by the keyboard walk."],
                ])}
                ${table("sac-tab-panel attribute", [
                    ["name", "The key its tab matches on."],
                    ["active", "Set by the group, not by hand. Hidden unless present."],
                ])}
                ${table("Event", [["sac:tab-show", "detail { name }."]])}
                ${table("Keyboard", [
                    ["Strip", "WAI-ARIA tabs pattern: <kbd>←</kbd>/<kbd>→</kbd> walk the strip (wrapping at both ends), <kbd>Home</kbd>/<kbd>End</kbd> jump to first/last, moving focus activates, and a roving tabindex keeps exactly one tab in the page's tab order."],
                ])}
                ${code(`<sac-tab-group active="one">
    <sac-tab name="one">Overview</sac-tab>
    <sac-tab name="two">Settings</sac-tab>
    <sac-tab name="three" disabled>Log</sac-tab>

    <sac-tab-panel name="one">…any content…</sac-tab-panel>
    <sac-tab-panel name="two">…</sac-tab-panel>
    <sac-tab-panel name="three">…</sac-tab-panel>
</sac-tab-group>`)}
                ${code(`group.addEventListener("sac:tab-show", (e) => console.log(e.detail.name));
group.active = "two";   // programmatic switch — no event`)}
                ${compact(`a group <b>without</b> <code>overflow</code> pans below 768px, like <code>overflow="scroll"</code>
                   (a single unwrapped row would push the page sideways). A panning strip swipes natively, and
                   <code>overscroll-behavior-x: contain</code> keeps the swipe from becoming browser back. Under
                   <code>pointer: coarse</code> tabs are 44px tall, ‹ › 44px wide. <code>overflow="wrap"</code> is unchanged.`)}

                <h2 id="sac-menu">&lt;sac-menu&gt;</h2>
                <p>Dropdown menu — the <code>.floating-menu</code> look with behavior attached. Trigger
                   and items are slotted light DOM, so any markup goes inside them.</p>
                <div class="sg-demo sg-row">
                    <sac-menu id="demo-menu">
                        <button slot="trigger" class="btn" style="width:auto">Actions</button>
                        <button data-action="rename"><sac-icon name="pencil"></sac-icon> Rename</button>
                        <button data-action="duplicate"><sac-icon name="copy"></sac-icon> Duplicate</button>
                        <hr>
                        <button data-action="delete" data-danger><sac-icon name="trash"></sac-icon> Delete</button>
                    </sac-menu>
                    <span id="demo-menu-result" style="color:var(--text-muted);font-size:0.85rem;"></span>
                </div>
                <div class="sg-demo">
                    <div id="demo-ctx-area" tabindex="0"
                         style="display:grid;place-items:center;height:110px;border:1px dashed var(--border-strong);border-radius:var(--radius-m);color:var(--text-muted);font-size:0.85rem;user-select:none;">
                        <span>Right-click here — a context menu via <code>openAt(event)</code></span>
                    </div>
                    <sac-menu id="demo-ctx-menu">
                        <button data-action="cut"><sac-icon name="scissors"></sac-icon> Cut</button>
                        <button data-action="copy"><sac-icon name="copy"></sac-icon> Copy</button>
                        <hr>
                        <button data-action="flip-h"><sac-icon name="flip-h"></sac-icon> Flip horizontal</button>
                    </sac-menu>
                </div>
                ${table("Slot", [
                    ["trigger", "The element that opens the menu (a <code>.btn</code>, an icon button, …). Kept in sync with <code>aria-haspopup</code> / <code>aria-expanded</code>."],
                    ["(default)", "Menu items: <code>&lt;button data-action=\"…\"&gt;</code>. An <code>&lt;hr&gt;</code> draws a separator; <code>data-danger</code> tints the hover state with <code>--danger</code>. Icons inside items inherit <code>--icon-size: 16px</code> from the panel."],
                ])}
                ${table("Attribute / Method", [
                    ["open", "Presence = panel visible. Reflected by the methods; settable directly (it positions itself either way)."],
                    ["open() / close() / toggle()", "Show, hide, flip. <code>open()</code> anchors the panel to the trigger's viewport rect and shows it in the <strong>top layer</strong> (<code>popover</code>), so neither a clipping ancestor nor a transformed one can reach it — a menu works inside a <code>.tile</code>, which is both. It flips above the trigger when there is no room below, and re-anchors on scroll/resize."],
                    ["openAt(point)", "A <b>context menu</b>: opens with its top-left at a viewport point — pass the <code>contextmenu</code> event itself or any <code>{ clientX, clientY }</code>. Flips left / up where there is no room, clamped 8px inside the viewport; same keyboard. No trigger needed — a <code>&lt;sac-menu&gt;</code> with only items is a context menu. Scrolling closes it (the point no longer means anything); <kbd>Esc</kbd> returns focus to what had it before."],
                ])}
                ${table("Event", [["sac:select", "detail { action }."]])}
                ${table("Keyboard", [
                    ["Open panel", "An outside pointerdown or <kbd>Esc</kbd> closes it (<kbd>Esc</kbd> also returns focus to the trigger) · <kbd>↓</kbd>/<kbd>↑</kbd> walk the items · <kbd>Enter</kbd> activates natively · <kbd>Tab</kbd> closes."],
                ])}
                ${code(`<sac-menu>
    <button slot="trigger" class="btn" style="width:auto">Actions</button>
    <button data-action="rename"><sac-icon name="pencil"></sac-icon> Rename</button>
    <button data-action="duplicate"><sac-icon name="copy"></sac-icon> Duplicate</button>
    <hr>
    <button data-action="delete" data-danger><sac-icon name="trash"></sac-icon> Delete</button>
</sac-menu>

menu.addEventListener("sac:select", e => console.log(e.detail.action));

// context menu — no trigger slot
canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    ctxMenu.openAt(e);
});`)}
                ${compact(`the panel is at most <code>100vw - 16px</code> wide, so the 8px clamp holds at 360px; under
                   <code>pointer: coarse</code> every item is at least 44px tall. The trigger opens on tap — nothing is
                   hover-only — and a closed panel takes no layout, so a menu at the right edge never adds sideways
                   scroll.`)}

                <h2 id="sac-command-palette">&lt;sac-command-palette&gt;</h2>
                <p>Ctrl-K palette — one line of markup per app
                   (<code>&lt;sac-command-palette&gt;&lt;/sac-command-palette&gt;</code> in the shell
                   template), no command list of its own. Every open merges two <em>live</em> sources:
                   the router's registered <strong>views</strong> and the app's own
                   <strong>commands</strong> from <code>sac.commands</code> — an app owns its
                   toolbar, so it registers the actions it wants keyboard-reachable there.</p>
                <div class="sg-demo">
                    <div class="sg-row">
                        <button class="btn" style="width:auto" id="palette-open">Open the palette</button>
                        <span class="sg-kbd-hint" style="color:var(--text-dim);font-size:0.85rem;">…or press
                            <kbd>Ctrl</kbd>+<kbd>K</kbd> anywhere on this page.</span>
                    </div>
                </div>
                ${table("&lt;sac-command-palette&gt;", [
                    ["open", "Reflected attribute. Present = visible; nothing renders while it is absent. Set it by hand and the element runs the real open path (collect + focus)."],
                    ["open() / close() / toggle()", "Methods. <code>open()</code> re-collects all three sources, so the list is never stale. <code>close()</code> restores the focus the palette took."],
                    ["sac.palette", "<code>{ open, close, toggle }</code>, bound to the first connected instance and nulled again when it disconnects."],
                    ["Filtering", "Case-insensitive subsequence match (<code>dg</code> finds “Delete Group”); exact substring matches rank first, shorter labels first within a rank."],
                    ["Keyboard", "<code>mod+k</code> toggles · <kbd>↑</kbd>/<kbd>↓</kbd> move (wrapping) · <kbd>Enter</kbd> runs then closes · <kbd>Esc</kbd> closes · <kbd>Tab</kbd> is trapped in the field."],
                    ["Events", "None. Running a row calls that entry's own <code>run</code> / <code>onClick</code>; a throwing command is logged and the palette still closes."],
                    ["Groups", "Routes list under <code>\"Views\"</code> unless they name a group (<code>register(…, { palette })</code>); installed <code>sac.apps</code> view apps list under <code>\"Apps\"</code> — a host lists its window apps there too (<code>sac.commands</code> <code>group: sac.t(\"palette.group-apps\", \"Apps\")</code>), so the user sees one Apps section."],
                ])}
                ${table("sac.commands", [
                    ["register({ id, label, icon, group, hotkey, run })", "<code>id</code> is required and <strong>upserts</strong> — registering the same id twice replaces the row instead of duplicating it. Returns an unregister function."],
                    ["icon", "A <code>sac.icons</code> name (optional). The icon cell keeps its width when empty, so labels stay aligned."],
                    ["group", "Group header in the palette. Default <code>\"Commands\"</code>."],
                    ["hotkey", "Display hint only, rendered as a <code>&lt;kbd&gt;</code> via <code>sac.hotkeys.format()</code>. Binding it is the app's job — the palette must not own an app's key bindings."],
                    ["unregister(id) / list()", "Remove one by id; list them all in registration order."],
                ])}
                ${table("sac.hotkeys", [
                    ["register(combo, handler, opts)", "Returns an idempotent unregister function. On match: <code>preventDefault()</code>, then <code>handler(event)</code>. One document listener for the whole app, attached on first use."],
                    ["combo", "<code>ctrl</code> · <code>alt</code> · <code>shift</code> · <code>meta</code> · <code>mod</code> (Ctrl on Windows/Linux, ⌘ on macOS), in any order, then the key: <code>\"mod+k\"</code>, <code>\"ctrl+shift+p\"</code>, <code>\"alt+1\"</code>, <code>\"escape\"</code>. Matching is exact — <code>ctrl+k</code> does not fire while Shift is held."],
                    ["opts.description", "Shown by <code>list()</code> (and any shortcuts help screen). A string, or a <b>function</b> returning one — resolved on every <code>list()</code>, so a description written with <code>sac.t()</code> follows the language."],
                    ["opts.group", "Heading the binding is listed under in <code>&lt;sac-shortcut-sheet&gt;</code> (\"Tools\", \"Edit\"). A listing aid only — it changes no matching."],
                    ["opts.allowInInput", "Combos without ctrl/alt/meta are ignored while the user types in an input, textarea, select or contenteditable — including inside Shadow DOM. This opts out (of the activation guard below too)."],
                    ["hold(combo, onDown, onUp, opts)", "A key that is <b>held</b>: <code>onDown(event)</code> once on press (auto-repeat swallowed, and a held Space never scrolls the page), <code>onUp(event)</code> on release — “hold Space to pan”. A bare modifier works too (<code>\"alt\"</code> for a hold-Alt eyedropper). Released cleanly on focus loss (window blur, tab hidden → <code>onUp(null)</code>) and when unregistered mid-hold, so a tool never sticks. Same typing / activation guards and <code>description</code> / <code>group</code> / <code>allowInInput</code> as <code>register()</code>; returns an unregister function; a hold binding shadows a <code>register()</code> of the same combo. <code>list()</code> marks it <code>hold: true</code>."],
                    ["opts.skipInInput", "Combos <em>with</em> ctrl/alt/meta fire even while typing — nobody types Ctrl-K. For a combo that also edits text (<code>mod+a</code>, <code>mod+z</code>, <code>mod+c/x/v</code>) pass <code>skipInInput: true</code>: the canvas keeps its select-all, every input on the page keeps its own."],
                    ["Activation guard", "A plain <code>enter</code> or <code>space</code> binding does not fire while focus is on something those keys already press — a button, a link, a checkbox, a <code>[role=button]</code> / menuitem / tab / option. Enter on a focused button presses the button, not the page's “play”."],
                    ["Same combo twice", "A stack: the newest registration wins, unregistering it restores the previous one. That is what makes a modal's temporary binding safe."],
                    ["list() / format(combo)", "<code>[{ combo, display, description, group, hold }]</code> for every active binding · a platform-aware display string (<code>\"Ctrl+Shift+X\"</code> / <code>\"⌃⇧X\"</code>). Key caps follow the language (German: <code>Strg+Umschalt+X</code>, <code>Entf</code>, <code>Leertaste</code>), so never cache <code>format()</code> across a switch or parse it back."],
                ])}
                ${code(`<!-- once, in the app shell -->
<sac-command-palette></sac-command-palette>

<script>
    sac.commands.register({
        id: "export-json", label: "Export as JSON", icon: "download",
        hotkey: "mod+shift+e", run: () => exportJson(),
    });
    sac.hotkeys.register("mod+shift+e", () => exportJson(), { description: "Export as JSON" });
<\/script>`)}
                ${compact(`on compact the panel is a full-width sheet anchored to the <b>top</b> edge (below the
                   notch inset) — the half an on-screen keyboard leaves free; tapping the dimmed area closes it. Rows are
                   44px and the field 16px under <code>pointer: coarse</code>. <kbd>mod</kbd>+<kbd>K</kbd> does not exist on
                   a phone: give the palette a button calling <code>sac.palette.open()</code>.`)}

                <h2 id="sac-tooltip">&lt;sac-tooltip&gt;</h2>
                <p>Wraps a trigger (default slot) and shows a small glass bubble beside it — hover
                   after a 400ms delay, focus immediately. The bubble is <code>position: fixed</code>
                   in the shadow root, so it escapes clipping ancestors, and clamps to the viewport
                   with 8px margins; scroll and resize <em>hide</em> it rather than chase it.
                   Cross-root ARIA can't point a light-DOM trigger at a shadow bubble, so this is a
                   <strong>visual affordance only</strong>: keep an <code>aria-label</code> on
                   icon-only triggers.</p>
                <div class="sg-demo sg-tip-demo">
                    <div class="sg-row">
                        <sac-tooltip content="Bubble above the trigger" placement="top"><button class="btn" style="width:auto">top</button></sac-tooltip>
                        <sac-tooltip content="Bubble below the trigger" placement="bottom"><button class="btn" style="width:auto">bottom</button></sac-tooltip>
                        <sac-tooltip content="Bubble left of the trigger" placement="left"><button class="btn" style="width:auto">left</button></sac-tooltip>
                        <sac-tooltip content="Bubble right of the trigger" placement="right"><button class="btn" style="width:auto">right</button></sac-tooltip>
                        <span class="sg-row-break"></span>
                        <sac-tooltip content="Forced visible with [open] — no hover needed" placement="bottom" open><button class="btn" style="width:auto">open</button></sac-tooltip>
                    </div>
                </div>
                ${table("Attribute", [
                    ["content", "The tooltip text. Applied as <code>textContent</code> — never HTML. Empty content = never shows."],
                    ["placement", "<code>top</code> (default) | <code>bottom</code> | <code>left</code> | <code>right</code>. Flips to the opposite side when that side has no room."],
                    ["distance", "Px gap between trigger and bubble (default <code>8</code>)."],
                    ["open", "Presence forces the bubble visible (docs, demos, debugging). A forced-open bubble re-anchors on scroll instead of hiding."],
                    ["disabled", "Presence means it never shows; added while visible, it hides immediately."],
                ])}
                ${table("Method", [
                    ["show() / hide()", "Same effect as the pointer/focus triggers, without the 400ms hover delay."],
                ])}
                ${code(`<sac-tooltip content="Sync with the server" placement="bottom" distance="10">
    <button class="nav-icon-btn" aria-label="Sync">
        <sac-icon name="sync"></sac-icon>
    </button>
</sac-tooltip>`)}
                ${compact(`no hover on a touch screen, so a <b>long-press</b> (~500ms, finger still) shows the bubble and the
                   next tap hides it; a normal tap is untouched and its click goes through. The bubble is at most
                   <code>min(280px, 100vw - 16px)</code> wide. A tooltip must never be the only way to reach
                   information.`)}

                <h2 id="sac-toast">&lt;sac-toast-stack&gt;</h2>
                <p>Corner-anchored, self-dismissing notifications — the floating sibling of
                   <a href="#sac-status-banner"><code>&lt;sac-status-banner&gt;</code></a>: the banner
                   is <em>inline</em> and waits to be cleared, a toast is transient app-level feedback
                   nobody has to read to proceed. Apps never place the stack by hand —
                   <code>sac.toast()</code> creates a shared bottom-right one on first use.</p>
                <div class="sg-demo">
                    <div class="sg-row">
                        <button class="btn" style="width:auto" data-toast="info">info</button>
                        <button class="btn" style="width:auto" data-toast="success">success</button>
                        <button class="btn" style="width:auto" data-toast="warn">warn</button>
                        <button class="btn" style="width:auto" data-toast="error">error</button>
                        <button class="btn" style="width:auto" data-toast="sticky">sticky + title</button>
                    </div>
                </div>
                ${table("sac-toast-stack", [
                    ["position", "<code>bottom-right</code> (default) | <code>bottom-left</code> | <code>top-right</code> | <code>top-left</code> — top corners clear the nav ribbon."],
                    ["Stacking", "The newest toast always appears nearest the anchored corner; hovering a toast pauses its timer, so a message you reached for never vanishes mid-read."],
                ])}
                ${table("sac.toast(message, opts)", [
                    ["opts.kind", "\"info\" (default) | \"success\" | \"warn\" | \"error\" — icon in the kind's -text variant, soft background tint from the raw kind color."],
                    ["opts.duration", "Milliseconds until auto-dismiss (default <code>4000</code>). <code>0</code> = sticky: stays until the × or <code>.dismiss()</code>."],
                    ["opts.title", "Optional bold line above the message. Title and message are set as text — never HTML."],
                    ["→ returns", "The toast element, carrying a <code>.dismiss()</code> method for dismissing it yourself."],
                ])}
                ${code(`sac.toast("Saved.", { kind: "success" });`)}
                ${compact(`on compact every stack sits at the bottom edge, full width minus an 8px gutter, above the home
                   bar, newest nearest the bottom. A finger on a toast holds its timer; a sideways swipe past ~80px
                   dismisses it. Under <code>pointer: coarse</code> the close button keeps its look with a 44px hit area.`)}

                <h2 id="sac-progress">&lt;sac-progress&gt;</h2>
                <p>Horizontal progress bar. Bar width and the percentage readout track
                   <code>value</code>/<code>max</code>, updated in place like
                   <a href="#sac-slider">sac-slider</a>.</p>
                <div class="sg-demo sg-col">
                    <sac-progress id="demo-progress" label="Upload" value="40" max="100"></sac-progress>
                    <div class="sg-row">
                        <button class="btn" style="width:auto" data-progress="0">0%</button>
                        <button class="btn" style="width:auto" data-progress="40">40%</button>
                        <button class="btn" style="width:auto" data-progress="100">100%</button>
                        <button class="btn" style="width:auto" data-progress="indeterminate">indeterminate</button>
                    </div>
                </div>
                ${table("Attribute", [
                    ["value / max", "Current progress / upper bound (default 0 / 100). Property <code>.value</code> mirrors the attribute."],
                    ["label", "Optional header text — presence shows the label-left / percentage-right row above the track; omit it and the row doesn't render at all."],
                    ["indeterminate", "Presence switches to an endless slide animation; value/max stop driving the bar width and the percentage hides."],
                ])}

                <h2 id="sac-spinner">&lt;sac-spinner&gt;</h2>
                <p>Small inline spinner ring for a button, status line, or loading panel. Size is a
                   local CSS custom property, not a kit token, so each instance sizes independently.</p>
                <div class="sg-demo sg-row" style="align-items:center;">
                    <sac-spinner style="--spinner-size: 16px;"></sac-spinner>
                    <sac-spinner style="--spinner-size: 24px;"></sac-spinner>
                    <sac-spinner style="--spinner-size: 40px;" label="Rendering"></sac-spinner>
                </div>
                ${table("Attribute", [["label", "Accessible name (default \"Loading\"). Not rendered as visible text — reflected as <code>aria-label</code> on the host, which also carries <code>role=\"status\"</code>."]])}
                ${code(`<sac-spinner style="--spinner-size: 32px"></sac-spinner>`)}

                <h2 id="sac-theme-toggle">&lt;sac-theme-toggle&gt;</h2>
                <p>Self-contained Dark / Light / Auto pill. It reads/writes the
                   <code>"sac-theme"</code> localStorage key and flips <code>&lt;html data-theme&gt;</code>
                   itself — one instance anywhere (typically the <code>sac-nav</code> context slot) themes
                   the whole page, no wiring required. The instance below is live and persists: reload this
                   page after clicking it.</p>
                <div class="sg-demo sg-col">
                    <sac-theme-toggle id="demo-theme-toggle"></sac-theme-toggle>
                    <span id="demo-theme-toggle-state" style="color:var(--text-muted);font-size:0.85rem;">theme: dark</span>
                </div>
                ${table("Attribute", [
                    ["collapse", "<code>\"never\"</code> keeps the pill even in a phone ribbon. Absent = the nav collapse below. A toggle in page content (a settings page, the demo above) never collapses — it has the room."],
                    ["in-nav", "Set <b>by the component</b> when it sits inside a <code>&lt;sac-nav&gt;</code> — a styling hook, not an input."],
                ])}
                ${table("Property", [["theme", "get/set \"dark\" | \"light\" | \"auto\". Setting applies + persists + re-highlights the pill (no event — that's reserved for user clicks)."]])}
                ${table("Event", [["sac:change", "Fired on user click only (never on a programmatic .theme set); detail { value: theme }. Bubbles, not composed."]])}
                ${compact(`inside a <code>&lt;sac-nav&gt;</code> below 768px the ~145px pill would push the app's toolbar
                   into the “…” menu, so it collapses to <b>one round button</b> (36px, 44px on touch) that cycles
                   dark → light → auto; its icon shows the current theme, its label says it (“Theme: Dark”, key
                   <code>theme-toggle.label</code>). The ribbon of this page shows it on a phone. The pill itself gets a
                   44px-tall hit halo per button under <code>pointer: coarse</code>; no hover tint sticks after a tap.`)}

                <h2 id="sac-lang-toggle">&lt;sac-lang-toggle&gt;</h2>
                <p>The page's language switch — the twin of the theme toggle, with the same ownership:
                   <b>one</b> language for the whole page (<code>sac.lang</code>), so on a desktop the
                   <b>host</b> shows it and a standalone app puts it in its own nav. Every kit component
                   switches in place; apps follow through <code>context.lang</code>. One button per
                   language that has a table, titled with the language's own name; <b>Auto</b> follows
                   the system language as far as the browser shows it. Live below — try DE.</p>
                <div class="sg-demo sg-col">
                    <sac-lang-toggle id="demo-lang-toggle"></sac-lang-toggle>
                </div>
                ${table("Attribute", [
                    ["collapse", "<code>\"never\"</code> keeps the pill even in a phone ribbon. Absent = the nav collapse below."],
                    ["in-nav", "Set <b>by the component</b> when it sits inside a <code>&lt;sac-nav&gt;</code>."],
                ])}
                ${table("Property", [["value", "get/set <code>\"auto\"</code> or a language code. Setting applies (<code>sac.lang.set</code>) and fires nothing."]])}
                ${table("Event", [["sac:change", "User click only; detail { value }. Bubbles, not composed."]])}
                ${code(`<sac-nav …>
    <div slot="context">
        <sac-lang-toggle></sac-lang-toggle>
        <sac-theme-toggle></sac-theme-toggle>
    </div>
</sac-nav>`)}
                ${compact(`inside a <code>&lt;sac-nav&gt;</code> below 768px the pill collapses to one round button that cycles
                   auto → en → de → … and shows the current code (a globe while on auto); its label names the language.`)}

                <h2 id="sac-pixel-canvas">&lt;sac-pixel-canvas&gt;</h2>
                <p>The pixel editor's viewport — a <em>view</em>, not an editor. It shows an image at an
                   integer zoom and reports which pixel the pointer is on; the document, the tools and undo
                   stay in the app. What it owns is everything a generic pan-zoom gets wrong for pixel art:
                   the zoom walks a fixed ladder (1 2 3 4 6 8 12 16 24 32 48 64) so every pixel is the same
                   size, the transparency checker is drawn <em>inside</em> the canvas and locked to the pixel
                   grid, a pixel grid appears from 8×, and onion-skin underlays, a floating-selection
                   overlay, a marquee and a brush-footprint hover box stack on top. The
                   <a href="#/pixel-lab">Pixel Lab</a> app is the full workbench built from it.</p>
                <div class="sg-demo sg-row" style="align-items:flex-start;gap:1rem;flex-wrap:wrap;">
                    <sac-pixel-canvas id="demo-pixel" tile-grid="8" brush="1"
                                      style="flex:1 1 320px;height:300px;border-radius:var(--radius-m);"></sac-pixel-canvas>
                    <div class="sg-col" style="gap:0.5rem;flex:0 0 12rem;">
                        <div style="padding:0.5rem;border:1px solid var(--border);border-radius:var(--radius-m);">
                            <sac-pixel-canvas id="demo-pixel-pv" static zoom="3"></sac-pixel-canvas>
                        </div>
                        <span id="demo-pixel-state" style="color:var(--text-muted);font-size:0.85rem;font-variant-numeric:tabular-nums;">
                            click to paint · wheel zooms · Space-drag pans</span>
                    </div>
                </div>
                ${table("Attribute", [
                    ["zoom", "Integer CSS px per image pixel, reflected on every change and snapped onto the ladder <code>1 2 3 4 6 8 12 16 24 32 48 64 96 128</code> (within min/max-zoom): a value off it goes to the nearest step, a tie going down — <code>5</code> is <code>4</code>, so offer ladder values in a zoom menu. A <code>static</code> canvas has no ladder: any integer within min/max-zoom is taken as is (a 5× preview is 5×), and a zoom change re-sizes the element. Omit it and the view fits the image — and keeps fitting while the element resizes, until the user zooms or pans. An author-given zoom is kept (re-centered on resize)."],
                    ["min-zoom / max-zoom", "Ladder bounds, default <code>1</code> / <code>64</code>."],
                    ["grid", "<code>auto</code> (default: the pixel grid from 8×), <code>on</code>, <code>off</code>. Color <code>--pixel-grid</code>."],
                    ["tile-grid", "N — a stronger line every N pixels (<code>--border-strong</code>), measured from the region's origin."],
                    ["brush", "Size of the hover box in image pixels (default 1, <code>0</code> hides it). Centered like a square brush."],
                    ["static", "A preview: no drawing, and the element sizes itself to region × zoom — the small live preview beside the big canvas. Larger than its box (a scrolling window or panel), a middle-drag pans that box — the editor's gesture; touch scrolls natively."],
                ])}
                ${table("Property", [
                    ["image", "The pixels: <code>ImageData</code>, <code>{ width, height, data }</code>, a canvas / OffscreenCanvas, an <code>&lt;img&gt;</code> or ImageBitmap. A new size refits."],
                    ["region", "<code>{ x, y, w, h }</code> — the part being edited (one frame of a strip). Default: the whole image. Events, selection and overlays all speak <b>absolute</b> image coordinates."],
                    ["underlays", "<code>[{ image?, region?, opacity }]</code> under the image, over the checker — onion skin. <code>image</code> defaults to the main image, so a strip's neighbour frames are just regions."],
                    ["overlays", "<code>[{ image, x, y, opacity? }]</code> over the image, clipped to the region — a floating selection's lifted pixels."],
                    ["selection", "<code>{ x, y, w, h }</code> or <code>null</code> — the marquee, dashed in <code>--sink</code>/<code>--lift</code> so it reads over any pixel color."],
                    ["zoom", "get/set; snapped onto the ladder."],
                ])}
                ${table("Method", [
                    ["render()", "Re-upload the pixel buffers and redraw — call it after mutating the pixels in place."],
                    ["fit() · center()", "Largest ladder zoom that shows the region, centered · center at the current zoom."],
                    ["zoomIn(anchor?) · zoomOut(anchor?)", "One ladder step; <code>anchor</code> <code>{ clientX, clientY }</code> stays still (default: the center)."],
                    ["cellAt(clientX, clientY)", "<code>{ x, y, lx, ly, inside }</code> for any screen point."],
                ])}
                ${table("Event", [
                    ["sac:pixel-down", "A press (any button except the pan ones). detail = a cell: <code>{ x, y, lx, ly, inside, button, buttons, shiftKey, altKey, ctrlKey, metaKey, pointerType, pressure }</code>. Outside-region cells are reported too (<code>inside: false</code>) — a line dragged past the edge still has an end."],
                    ["sac:pixel-move", "The pressed pointer entered <em>another</em> pixel — one event per pixel change. Fast strokes skip pixels: connect them (Bresenham) in the app."],
                    ["sac:pixel-up", "The press ended (captured, so also outside the element)."],
                    ["sac:pixel-cancel", "A second finger turned the stroke into a pinch — roll the stroke back."],
                    ["sac:pixel-hover", "The hovered pixel changed; <code>null</code> on leave."],
                    ["sac:zoom", "detail { zoom }, after any zoom change. All bubble, not composed."],
                ])}
                ${table("Interaction", [
                    ["Wheel", "Zooms one ladder step around the cursor (trackpad bursts are accumulated, so a flick does not race to 64×)."],
                    ["Pan", "Middle-drag, or <kbd>Space</kbd> held over the canvas + drag. A pan always leaves 32px of the image on screen."],
                    ["Right-click", "Not consumed — listen for <code>contextmenu</code> on the element and open a <code>&lt;sac-menu&gt;</code> there with <code>openAt(event)</code>."],
                ])}
                ${code(`<sac-pixel-canvas tile-grid="8" style="height: 480px"></sac-pixel-canvas>

canvas.image = doc.composite(frame);                  // ImageData
canvas.underlays = [{ image: doc.composite(frame - 1), opacity: 0.3 }];
canvas.addEventListener("sac:pixel-down", (e) => tool.down(e.detail));
canvas.addEventListener("sac:pixel-move", (e) => tool.drag(e.detail));
canvas.addEventListener("sac:pixel-up",   ()  => tool.up());
// after the tool changed pixels in place:
canvas.render();`)}
                ${compact(`one finger draws (<code>sac:pixel-*</code> as with a mouse); a second finger cancels that stroke
                   and pinches — the zoom snaps to the ladder around the fingers' midpoint, both fingers pan.
                   <code>touch-action: none</code> keeps the gesture inside the element; the page outside scrolls as usual.`)}

                <h2 id="sac-toolbox">&lt;sac-toolbox&gt;</h2>
                <p>A tool ribbon for any editor — paint, map, diagram, selection modes: a radio grid of
                   square icon buttons, exactly one active.
                   Where <code>&lt;sac-segmented-control&gt;</code> is a row of words, this is a grid of
                   glyphs — so every tool carries a kit tooltip with its name and shortcut, and the name
                   is its accessible label. With <code>hotkeys</code> each tool's key goes through
                   <code>sac.hotkeys</code> and shows up in the shortcut sheet for free.</p>
                <div class="sg-demo sg-row" style="align-items:flex-start;gap:2rem;flex-wrap:wrap;">
                    <sac-toolbox id="demo-toolbox" value="pencil" columns="2" group="Demo tools"></sac-toolbox>
                    <sac-toolbox id="demo-toolbox-row" value="rect" columns="row"></sac-toolbox>
                    <span id="demo-toolbox-state" style="color:var(--text-muted);font-size:0.85rem;">tool: pencil — try B, E, G, I</span>
                </div>
                ${table("Attribute", [
                    ["value", "Active tool id, reflected."],
                    ["columns", "Grid columns, default <code>2</code>. <code>row</code> = one horizontal row (a top ribbon). <code>auto</code> = as many per row as the container fits, wrapping only when it gets too narrow — the choice for a resizable side panel. A number is a custom property, so changing it re-renders nothing."],
                    ["hotkeys", "Presence registers every tool's <code>key</code> through <code>sac.hotkeys</code> while connected (description = label, group = <code>group</code>). The key selects the tool and fires <code>sac:change</code>."],
                    ["group", "Heading the hotkeys are listed under in the shortcut sheet. Default <code>Tools</code>."],
                    ["disabled", "Inert + dimmed; fires nothing, hotkeys ignored."],
                ])}
                ${table("Property", [
                    ["tools", "Array of <code>{ id, icon, label, key? }</code>. <code>null</code> or <code>{ separator: true }</code> inserts a gap — a full-width break in a grid, a hairline in a row. Setting it rebuilds the buttons (and re-registers the hotkeys)."],
                    ["value", "get/set; setting is silent."],
                    ["disabled", "get/set (boolean), reflects the attribute."],
                ])}
                ${table("Event", [["sac:change", "detail { value } (tool id) — on click, keyboard or hotkey only. Bubbles, not composed."]])}
                ${table("Interaction", [
                    ["Arrows", "<kbd>←</kbd>/<kbd>→</kbd> step in order (wrapping); <kbd>↑</kbd>/<kbd>↓</kbd> move to the tool visually above/below (measured from the layout, so gaps never trap the cursor). Moving selects. Roving tabindex: only the active tool is a tab stop."],
                    ["Tooltip", "Kit bubble, \"Label (K)\" — right of a grid, below a row."],
                ])}
                ${code(`<sac-toolbox value="pencil" columns="2" hotkeys></sac-toolbox>
<script>
  box.tools = [
    { id: "pencil", icon: "pencil",     label: "Pencil",     key: "b" },
    { id: "eraser", icon: "eraser",     label: "Eraser",     key: "e" },
    null,
    { id: "fill",   icon: "bucket",     label: "Fill",       key: "g" },
    { id: "pick",   icon: "eyedropper", label: "Eyedropper", key: "i" },
  ];
  box.addEventListener("sac:change", (e) => setTool(e.detail.value));
<\/script>`)}
                <p>The button measure is the kit token <code>--tool-btn-size</code> / <code>--tool-btn-icon</code>
                   (32 / 18px) — the same one <code>.icon-btn.tool</code> reads, so an action row under the box
                   matches it. <code>--tool-size</code> on the element still overrides one box.</p>
                ${compact(`under <code>pointer: coarse</code> every button grows to 44 × 44 (the glyph keeps its size — a tool
                   grid is tapped all day, a halo would steal a neighbour's taps); no hover wash sticks to a tapped tool.`)}

                <h2 id="sac-filmstrip">&lt;sac-filmstrip&gt;</h2>
                <p>The frame row of any animation or image sequence — a sprite timeline, a slideshow,
                   rendered 3D frames, a video's keyframes: a row of thumbnails, one active. It
                   <em>shows</em> frames, it does not own them — the app keeps the content and calls
                   <code>refresh(i)</code> after changing a frame. Thumbnails scale smoothly on the token
                   checker (<code>pixelated</code> keeps hard pixel edges, as in this sprite demo), numbered
                   from 1 — the same numbers a 1…0 key row selects. App buttons (play, onion skin) go in the
                   <code>controls</code> slot.</p>
                <div class="sg-demo sg-col" style="max-width:none;">
                    <sac-filmstrip id="demo-film" value="0" actions reorderable pixelated style="align-self:stretch;">
                        <button slot="controls" class="icon-btn" id="demo-film-play" title="Play" aria-label="Play">
                            <sac-icon name="play"></sac-icon>
                        </button>
                    </sac-filmstrip>
                    <span id="demo-film-state" style="color:var(--text-muted);font-size:0.85rem;">frame 1 of 4</span>
                </div>
                ${table("Attribute", [
                    ["value", "Active frame index (0-based), reflected. Clamped into the frame range on render."],
                    ["thumb-size", "Thumbnail box edge in px, default <code>48</code>."],
                    ["actions", "Presence adds trailing Add / Duplicate / Delete buttons (Delete is disabled on the last frame)."],
                    ["reorderable", "Presence enables drag-to-reorder and <kbd>Alt</kbd>+<kbd>←</kbd>/<kbd>→</kbd>."],
                    ["label", "Accessible name of the strip, default “Frames”."],
                    ["pixelated", "Hard pixel edges and an integer scale when the frame fits — for pixel art. Default: thumbnails scale smoothly to the box (photos, vector, 3D)."],
                    ["--sac-filmstrip-inset", "CSS custom property — left/right inset that keeps the controls and actions off the edges. Default <code>0.5rem</code>; <code>0</code> inside a container that already pads."],
                ])}
                ${table("Property", [
                    ["frames", "get/set array of frame sources, any mix: a canvas / image / ImageBitmap, an <code>ImageData</code>, a plain <code>{ width, height, data }</code> RGBA buffer, or an image URL. Setting rebuilds every thumbnail and fires nothing; the getter returns the current (user-reordered) order."],
                    ["value", "get/set number. Setting is silent."],
                ])}
                ${table("Method", [
                    ["refresh(index?)", "Redraw one thumbnail (or all) from its source. Sources are held by reference, so a canvas the app keeps painting into only needs this call."],
                ])}
                ${table("Event", [
                    ["sac:change", "detail { index } — the user picked a frame."],
                    ["sac:reorder", "detail { from, to } — the user moved a frame. The strip has already reordered itself and the active frame followed; mirror it on your data: <code>frames.splice(to, 0, ...frames.splice(from, 1))</code>."],
                    ["sac:action", "detail { action: \"add\" | \"duplicate\" | \"delete\", index } — <code>index</code> is the active frame. The strip changes nothing itself: edit your frames and set <code>frames</code> (and <code>value</code>) anew."],
                ])}
                ${table("Interaction", [
                    ["Pointer", "Click selects · drag reorders (<code>reorderable</code>)."],
                    ["Keyboard", "<kbd>←</kbd>/<kbd>→</kbd> select · <kbd>Home</kbd>/<kbd>End</kbd> · <kbd>Alt</kbd>+<kbd>←</kbd>/<kbd>→</kbd> move the frame · <kbd>Delete</kbd> fires the delete action (<code>actions</code>). Roving tabindex: the active frame is the one tab stop."],
                ])}
                ${code(`<sac-filmstrip value="0" actions reorderable>
    <button slot="controls" class="icon-btn" title="Play"><sac-icon name="play"></sac-icon></button>
</sac-filmstrip>

strip.frames = frameCanvases;                     // one canvas per frame
strip.addEventListener("sac:change",  (e) => editFrame(e.detail.index));
strip.addEventListener("sac:reorder", (e) => moveFrame(e.detail.from, e.detail.to));
strip.addEventListener("sac:action",  (e) => frameAction(e.detail.action, e.detail.index));
// after painting into frame 2:
strip.refresh(2);`)}
                ${compact(`the thumbnail row scrolls sideways inside its own box — the page never widens — and the
                   active frame is scrolled into view on every change. Under <code>pointer: coarse</code> frames and
                   action buttons reach 44px; a drag needs a 250ms long-press so a swipe still scrolls the row.`)}

                <h2 id="sac-layer-list">&lt;sac-layer-list&gt;</h2>
                <p>The layer stack of any layered document — a paint or pixel editor, a design tool, a map
                   editor: thumbnail, name, visibility eye and lock per row,
                   drag to reorder, double-click to rename. Like the filmstrip it <em>shows</em> layers and
                   reports what the user did; it keeps its own rows in step so nothing flickers back while the
                   app catches up. <b>Order:</b> <code>layers[0]</code> is the top row and the topmost layer —
                   composite by walking the array in reverse.</p>
                <div class="sg-demo sg-row" style="align-items:flex-start;gap:1.5rem;flex-wrap:wrap;">
                    <sac-layer-list id="demo-layers" value="ink" actions pixelated style="width:240px;"></sac-layer-list>
                    <span id="demo-layers-state" style="color:var(--text-muted);font-size:0.85rem;">no change yet</span>
                </div>
                ${table("Attribute", [
                    ["value", "Active layer id, reflected."],
                    ["actions", "Presence adds a footer with Add / Duplicate / Delete (Delete is disabled on the last layer)."],
                    ["thumb-size", "Thumbnail box edge in px, default <code>32</code>."],
                    ["label", "Accessible name, default “Layers”."],
                    ["pixelated", "Hard pixel edges and an integer scale when the thumbnail fits — for pixel art. Default: smooth."],
                ])}
                ${table("Property", [
                    ["layers", "get/set array of <code>{ id, name, visible, locked, thumb? }</code> — <code>thumb</code> takes the same sources as the filmstrip. Setting rebuilds the rows and fires nothing; your objects are copied, never mutated. The getter returns the list's current state."],
                    ["value", "get/set active id. Setting is silent."],
                ])}
                ${table("Method", [
                    ["refresh(id?)", "Redraw one thumbnail (or all) after painting."],
                ])}
                ${table("Event", [
                    ["sac:change", "detail { id } — a different layer became active."],
                    ["sac:reorder", "detail { from, to } — array indices, top row = 0. Mirror with <code>layers.splice(to, 0, ...layers.splice(from, 1))</code>."],
                    ["sac:toggle", "detail { id, prop: \"visible\" | \"locked\", value }."],
                    ["sac:rename", "detail { id, name } — trimmed, non-empty, actually changed."],
                    ["sac:action", "detail { action: \"add\" | \"duplicate\" | \"delete\", id } — <code>id</code> is the active layer; the list changes nothing itself."],
                ])}
                ${table("Interaction", [
                    ["Pointer", "Click activates · drag reorders · double-click the name renames (<kbd>Enter</kbd>/blur commits, <kbd>Esc</kbd> reverts) · eye and lock toggle in place."],
                    ["Keyboard", "<kbd>↑</kbd>/<kbd>↓</kbd> move the active layer · <kbd>Home</kbd>/<kbd>End</kbd> · <kbd>Alt</kbd>+<kbd>↑</kbd>/<kbd>↓</kbd> move it in the stack · <kbd>F2</kbd> renames · <kbd>Tab</kbd> from the active row reaches its eye and lock."],
                ])}
                ${code(`<sac-layer-list value="ink" actions></sac-layer-list>

list.layers = [
    { id: "ink",   name: "Ink",        visible: true,  locked: false, thumb: inkCanvas },
    { id: "color", name: "Flat color", visible: true,  locked: false, thumb: colorCanvas },
    { id: "bg",    name: "Background", visible: false, locked: true,  thumb: bgCanvas },
];
list.addEventListener("sac:toggle",  (e) => setLayer(e.detail.id, e.detail.prop, e.detail.value));
list.addEventListener("sac:reorder", (e) => moveLayer(e.detail.from, e.detail.to));`)}
                ${compact(`rows are 44px tall under <code>pointer: coarse</code>, the eye and lock get 44px hit halos,
                   and a drag needs a 250ms long-press so a swipe still scrolls the panel.`)}

                <h2 id="sac-shortcut-sheet">&lt;sac-shortcut-sheet&gt; + sac.shortcuts</h2>
                <p>The "keyboard shortcuts" cheat sheet. It lists every active binding in
                   <code>sac.hotkeys</code>, grouped by the <code>group</code> it was registered with, plus
                   static entries the registry cannot express — gestures and held keys
                   (<kbd>Space</kbd> + drag, <kbd>Alt</kbd> + click, wheel). It re-reads the registry on
                   every opening, so it is never out of date. Bindings without a description are internal
                   plumbing and are not listed.</p>
                <div class="sg-demo sg-row">
                    <button class="btn" id="demo-shortcuts" style="width:auto;">Show shortcuts</button>
                    <span style="color:var(--text-muted);font-size:0.85rem;">or press <kbd>?</kbd></span>
                </div>
                ${table("sac.shortcuts", [
                    ["show({ title?, extra? })", "Open the shared sheet. <code>extra</code> adds entries for this opening only."],
                    ["hide() · toggle(opts?)", "Close / flip."],
                    ["add(entries)", "Persistent extras shown on every opening → remove function. Entry: <code>{ group?, keys, description }</code>; <code>keys</code> is an array of chips (<code>[\"Alt\", \"click\"]</code>) or one string split on <code>+</code> (<code>\"Space + drag\"</code>)."],
                    ["bind(combo = \"shift+?\")", "Registers the toggle hotkey (group <code>Help</code>) → unregister. <code>shift+?</code> because matching is exact and <kbd>?</kbd> is a shifted key on the common layouts (US Shift+/, DE Shift+ß) — the event is <code>key \"?\"</code> with <code>shiftKey</code>, so a plain <code>\"?\"</code> would never fire."],
                ])}
                ${table("Element", [
                    ["title", "Attribute — heading, default \"Keyboard shortcuts\"."],
                    ["extra", "Property — the static entries (same shape as <code>add()</code>)."],
                    ["open() · close() · toggle()", "Methods. <code>open</code> is reflected while shown."],
                    ["sac:close", "Event after it closes. Bubbles, composed."],
                ])}
                ${table("Interaction", [["Keyboard", "<kbd>Esc</kbd>, backdrop or ✕ close; <kbd>Tab</kbd> cycles the list and ✕; focus returns to the opener."]])}
                ${code(`sac.shortcuts.bind();                         // "?" toggles the sheet
sac.shortcuts.add([
  { group: "View", keys: "Space + drag",    description: "Pan" },
  { group: "View", keys: ["Wheel"],         description: "Zoom" },
  { group: "Draw", keys: ["Alt", "click"],  description: "Pick a color" },
]);
sac.hotkeys.register("mod+z", undo, { description: "Undo", group: "Edit" });`)}
                ${compact(`a bottom sheet (full width, above the safe area, at most 85dvh, list scrolling) and one column
                   instead of two; the close button reaches 44 × 44.`)}
            </div>
            `;
    }

    /* The demo file space for <sac-file-browser> and sac.files: a shared
       space of its own (never the user's real "files"), seeded once with a
       few generated sprites so there is something to browse. */
    let demoSpace = null;
    function demoFiles() {
        if (demoSpace) return demoSpace;
        const store = sac.fs.shared("styleguide-demo");
        const sprite = (rows, colors) => new Promise((resolve) => {
            const c = document.createElement("canvas");
            c.width = rows[0].length; c.height = rows.length;
            const g = c.getContext("2d");
            rows.forEach((row, y) => [...row].forEach((ch, x) => {
                if (ch === ".") return;
                g.fillStyle = colors[ch];
                g.fillRect(x, y, 1, 1);
            }));
            c.toBlob(resolve, "image/png");
        });
        demoSpace = (async () => {
            if ((await store.list()).length) return store;
            await store.write("sprites/heart.png", await sprite([
                ".aa.aa.", "abbabba", "abbbbba", ".abbba.", "..aba..", "...a...",
            ], { a: "#7f1d1d", b: "#ef4444" }));
            await store.write("sprites/leaf.png", await sprite([
                "....aa", "..aabb", ".abbba", "abbba.", "abba..", "aa....",
            ], { a: "#14532d", b: "#22c55e" }));
            await store.write("sprites/drop.png", await sprite([
                "..a..", ".aba.", "abbba", "abbba", ".aaa.",
            ], { a: "#1e3a8a", b: "#60a5fa" }));
            await store.write("palettes/sunset.json", { colors: ["#f97316", "#ec4899", "#8b5cf6"] });
            await store.write("readme.txt", new Blob(["Demo files for the style guide."], { type: "text/plain" }));
            return store;
        })();
        return demoSpace;
    }

    function wireComponents(root) {
        // Icon grid — all registry entries with names.
        const grid = root.querySelector("#icon-grid");
        grid.innerHTML = sac.icons.names().map(n => `
            <span style="display:inline-flex;flex-direction:column;align-items:center;gap:4px;width:72px;">
                <sac-icon name="${n}" style="--icon-size:22px;color:var(--text)"></sac-icon>
                <span style="font-size:0.62rem;color:var(--text-dim);font-family:monospace;">${n}</span>
            </span>`).join("");

        // sac-launcher — three demo registry entries. The demo tag is
        // defined inline, so sac.apps never injects the src (it checks
        // customElements.get(tag) first) — no dead request. register()
        // upserts and emits sac:apps-changed, which re-syncs the grid.
        //
        // Documented exception to "an app registers ONE tag": this app's
        // subject matter IS app registration, so it needs a second element to
        // point at. Namespaced and guarded, and the only one in the kit.
        if (window.sac && sac.apps) {
            if (!customElements.get("sg-demo-app")) {
                customElements.define("sg-demo-app", class extends HTMLElement {
                    connectedCallback() {
                        if (this.firstChild) return;
                        this.style.cssText = "display:flex;align-items:center;justify-content:center;height:100%;padding:1rem;text-align:center;color:var(--text-muted);font-size:0.9rem;";
                        this.textContent = "A demo app. Real apps render their whole UI here.";
                    }
                });
            }
            sac.apps.register({ id: "sg-demo-notes", name: "Notes", icon: "note",
                                description: "A window app — opens in a floating window. badge: \"NEW\" renders the corner pill.",
                                kind: "window", tag: "sg-demo-app", src: "sg-demo-app.js",
                                width: "380px", height: "260px", badge: "NEW" });
            sac.apps.register({ id: "sg-demo-clock", name: "Clock", icon: "clock",
                                description: "Another window app.",
                                kind: "window", tag: "sg-demo-app", src: "sg-demo-app.js",
                                width: "380px", height: "260px" });
            // One app, several tiles: `tiles` replaces the default tile.
            // Each tile's accent colors the tile AND the app opened by it.
            sac.apps.register({ id: "sg-demo-suite", name: "Suite", icon: "shapes",
                                kind: "window", tag: "sg-demo-app", src: "sg-demo-app.js",
                                width: "380px", height: "260px",
                                tiles: [
                                    { id: "amber", name: "Suite · Amber", icon: "lightbulb",
                                      description: "tiles[] entry with accent — the window opens amber.",
                                      accent: "#e59500" },
                                    { id: "pink", name: "Suite · Pink", icon: "palette",
                                      description: "Same app, second tile, its own accent.",
                                      accent: "#ec4899" },
                                ] });
            sac.apps.register({ id: "sg-demo-docs", name: "Docs", icon: "document",
                                description: "A page app — the tile is a plain link. tile: \"wide\" spans two grid columns.",
                                kind: "page", href: "#/styleguide/components", tile: "wide" });
        }

        // Window
        root.querySelector("#demo-open-window").addEventListener("click", () => {
            let win = document.getElementById("sg-demo-window");
            if (!win) {
                win = document.createElement("sac-window");
                win.id = "sg-demo-window";
                win.className = "sg-demo-window";   // its text has a phone variant
                win.setAttribute("title", "Demo Window");
                win.setAttribute("width", "360px");
                win.setAttribute("height", "240px");
                win.setAttribute("left", `${Math.max((window.innerWidth - 360) / 2, 20)}px`);
                win.setAttribute("top", "140px");
                win.innerHTML = `<p><span class="sg-only-wide">Drag the title bar, resize at the bottom-right corner. The dots
                                    minimize, maximize and close — or double-click the title bar.</span><span
                                    class="sg-only-compact">On a phone every window opens maximized: the orange
                                    dot collapses it to its title bar, the red one closes it.</span></p>`;
                document.body.appendChild(win);
                requestAnimationFrame(() => win.open());
            } else {
                if (win.hasAttribute("minimized")) win.restore();
                win.open();
            }
        });

        root.querySelector("#demo-open-plain-window").addEventListener("click", () => {
            let win = document.getElementById("sg-demo-plain-window");
            if (!win) {
                win = document.createElement("sac-window");
                win.id = "sg-demo-plain-window";
                win.setAttribute("title", "Close Only");
                win.setAttribute("controls", "close");
                win.setAttribute("no-resize", "");
                win.setAttribute("width", "300px");
                win.setAttribute("height", "170px");
                win.setAttribute("left", `${Math.max((window.innerWidth - 300) / 2 + 60, 20)}px`);
                win.setAttribute("top", "200px");
                win.innerHTML = `<p><code>controls="close" no-resize</code> — one dot, fixed size,
                                    double-click does nothing. Dragging still works.</p>`;
                document.body.appendChild(win);
                requestAnimationFrame(() => win.open());
            } else {
                win.open();
            }
        });

        // Window state readout. The demo window lives in <body> and outlives
        // this view, so the listener is document-level and registered once;
        // it looks the readout up fresh, because the view re-renders on every
        // visit.
        if (!windowStateWired) {
                windowStateWired = true;
            ["sac:minimize", "sac:maximize", "sac:restore"].forEach(type => {
                document.addEventListener(type, (e) => {
                    if (e.detail.window.id !== "sg-demo-window") return;
                    const out = document.getElementById("demo-window-state");
                    if (out) out.textContent = `${type.replace("sac:", "")}d`;
                });
            });
        }

        // Split — the event bubbles, so the outer host also hears the nested one.
        const splitOut = root.querySelector("#demo-split-out");
        const splitOuter = root.querySelector("#demo-split");
        splitOuter.addEventListener("sac:resize", (e) => {
            const which = e.target === splitOuter ? "outer" : "nested";
            splitOut.textContent = `${which} → ${e.detail.position}`;
        });

        // Dialog
        const dlgResult = root.querySelector("#demo-dialog-result");
        root.querySelector("#demo-dialog").addEventListener("click", async () => {
            const answer = await sac.dialog.confirm({
                title: "Delete this item?",
                message: "Watch the Delete button arm itself after 2 seconds.",
                buttons: [
                    { action: "cancel", label: "Cancel" },
                    { action: "delete", label: "Delete", kind: "destructive", armAfterMs: 2000 },
                ],
            });
            dlgResult.textContent = `resolved: ${JSON.stringify(answer)}`;
        });
        root.querySelector("#demo-dialog-info").addEventListener("click", async () => {
            await sac.dialog.info({
                title: "About this demo",
                message: [
                    "Each array entry becomes its own paragraph, set with textContent — the escaping guarantee of confirm() is unchanged.",
                    "This is the one-button case: announce, not ask. An About panel or a licence notice is the typical tenant.",
                    "Give a dialog more text than the viewport has room for and the body scrolls while title and button stay put.",
                ],
                label: "Got it",
            });
            dlgResult.textContent = "info dismissed";
        });

        // Banner
        const banner = root.querySelector("#demo-banner");
        const messages = {
            error: "Name is required.",
            info: "Reindex runs in the background.",
            warn: "You are editing shared state.",
            success: "Saved.",
        };
        root.querySelectorAll("[data-banner]").forEach(btn => {
            btn.addEventListener("click", () => {
                const kind = btn.dataset.banner;
                if (kind === "hide") banner.hide();
                else banner.show(messages[kind], kind);
            });
        });

        // Toggle
        const toggleState = root.querySelector("#demo-toggle-state");
        root.querySelector("#demo-toggle").addEventListener("sac:change", (e) => {
            toggleState.textContent = `state: ${e.detail.value}`;
        });

        // Slider
        const sliderState = root.querySelector("#demo-slider-state");
        root.querySelector("#demo-slider").addEventListener("sac:input", (e) => {
            if (e.detail) sliderState.textContent = `value: ${e.detail.value}`;
        });

        // Stepper — sac:change carries a number, and fires once per
        // held-repeat tick, so the readout moves while the button is down.
        const stepperState = root.querySelector("#demo-stepper-state");
        [["Parts", "#demo-stepper"], ["Mix ratio", "#demo-stepper-frac"]].forEach(([name, sel]) => {
            root.querySelector(sel).addEventListener("sac:change", (e) => {
                stepperState.textContent = `${name} → ${e.detail.value}`;
            });
        });

        // Segmented
        const segState = root.querySelector("#demo-seg-state");
        root.querySelector("#demo-seg").addEventListener("sac:change", (e) => {
            if (typeof e.detail.value === "string") segState.textContent = `value: ${e.detail.value}`;
        });

        // Color picker — both instances report into one readout line.
        const pickOut = root.querySelector("#demo-picker-out");
        const pickDot = root.querySelector("#demo-picker-dot");
        const showColor = (label, value) => {
            pickOut.textContent = `${label} → ${value}`;
            pickDot.style.background = value;
        };
        root.querySelector("#demo-picker").addEventListener("sac:change",
            (e) => showColor("opaque", e.detail.value));
        root.querySelector("#demo-picker-alpha").addEventListener("sac:change",
            (e) => showColor("alpha", e.detail.value));

        // Color field — newest line on top, six lines kept.
        const cfOut = root.querySelector("#demo-color-field-out");
        [["Accent", "#demo-color-field"], ["Glow", "#demo-color-field-alpha"]].forEach(([name, sel]) => {
            root.querySelector(sel).addEventListener("sac:change", (e) => {
                const row = document.createElement("div");
                row.textContent = `${name} → ${e.detail.value}`;
                cfOut.prepend(row);
                while (cfOut.children.length > 6) cfOut.lastChild.remove();
            });
        });

        // Swatch grid — selection readout plus the .colors bulk rebuild.
        const swatches = root.querySelector("#demo-swatches");
        const swatchState = root.querySelector("#demo-swatches-state");
        swatches.addEventListener("sac:change", (e) => {
            swatchState.textContent = `selected: ${e.detail.value}`;
        });
        // Two clearly different palettes, so the .colors bulk setter reads
        // as "a whole palette was loaded from JS" — not as a reshuffle.
        const swatchPaletteRainbow = [
            { value: "#ef4444", label: "Red" },
            { value: "#f97316", label: "Orange" },
            { value: "#eab308", label: "Yellow", count: 3 },
            { value: "#22c55e", label: "Green" },
            { value: "#14b8a6", label: "Teal" },
            { value: "#3b82f6", label: "Blue", selected: true },
            { value: "#6366f1", label: "Indigo" },
            { value: "#8b5cf6", label: "Purple" },
            { value: "#ec4899", label: "Pink", count: 12 },
            { value: "#64748b", label: "Slate" },
            { value: "transparent", label: "No color" },
            { value: "#f2c500", label: "Cadmium Yellow", disabled: true },
        ];
        const swatchPaletteEarth = [
            { value: "#fde68a", label: "Sand" },
            { value: "#f59e0b", label: "Amber", count: 2 },
            { value: "#b45309", label: "Rust" },
            { value: "#78350f", label: "Umber" },
            { value: "#365314", label: "Moss" },
            { value: "#166534", label: "Forest", selected: true },
            { value: "#0f766e", label: "Deep Teal" },
            { value: "#1e3a8a", label: "Night Blue" },
            { value: "#f8fafc", label: "Chalk" },
            { value: "#0b0f1a", label: "Ink" },
            { value: "transparent", label: "No color" },
        ];
        let swatchAlt = false;
        root.querySelector("#demo-swatches-reload").addEventListener("click", () => {
            swatchAlt = !swatchAlt;
            swatches.colors = swatchAlt ? swatchPaletteEarth : swatchPaletteRainbow;
            swatchState.textContent =
                `.colors loaded the ${swatchAlt ? "earth" : "rainbow"} palette — no event fired; click a swatch`;
        });

        // Calendar — both instances report into one readout line.
        const calOut = root.querySelector("#demo-cal-out");
        const showDate = (label, value) => {
            calOut.textContent = `${label} → ${value}`;
        };
        root.querySelector("#demo-cal").addEventListener("sac:change",
            (e) => showDate("free", e.detail.value));
        root.querySelector("#demo-cal-bounded").addEventListener("sac:change",
            (e) => showDate("bounded", e.detail.value));

        // Date field — newest line on top, six lines kept.
        const dfOut = root.querySelector("#demo-date-field-out");
        [["Due", "#demo-date-field"], ["This year", "#demo-date-field-bounded"]].forEach(([name, sel]) => {
            root.querySelector(sel).addEventListener("sac:change", (e) => {
                const row = document.createElement("div");
                row.textContent = `${name} → ${e.detail.value === "" ? "(cleared)" : e.detail.value}`;
                dfOut.prepend(row);
                while (dfOut.children.length > 6) dfOut.lastChild.remove();
            });
        });

        // Chip input
        const chips = root.querySelector("#demo-chips");
        const chipsState = root.querySelector("#demo-chips-state");
        chips.suggestions = [
            { name: "work",     color: "blue",   count: 12 },
            { name: "personal", color: "green",  count: 5 },
            { name: "urgent",   color: "red",    count: 2 },
            { name: "idea",     color: "yellow" },
        ];
        chips.addEventListener("sac:change", (e) => {
            chipsState.textContent = `value: ${JSON.stringify(e.detail.value)}`;
        });
        chips.addEventListener("sac:create", (e) => {
            chipsState.textContent = `created: ${JSON.stringify(e.detail)} (host would persist this)`;
        });

        // Drop zone
        const dropList = root.querySelector("#demo-drop-list");
        const demoDrop = root.querySelector("#demo-drop");
        demoDrop.addEventListener("sac:files", (e) => {
            dropList.innerHTML = "";
            for (const file of e.detail.files) {
                const li = document.createElement("li");
                li.textContent = `${file.name} — ${(file.size / 1024).toFixed(1)} KB`;
                dropList.appendChild(li);
            }
        });
        demoDrop.addEventListener("sac:rejected", (e) => {
            dropList.innerHTML = "";
            const li = document.createElement("li");
            li.textContent = `Rejected ${e.detail.files.length} file(s) — accept is ".svg,.png,image/*".`;
            dropList.appendChild(li);
        });

        // File browser — over the style guide's own demo space
        const fileBrowser = root.querySelector("#demo-file-browser");
        const fileBrowserOut = root.querySelector("#demo-file-browser-result");
        demoFiles().then((store) => { fileBrowser.store = store; });
        fileBrowser.addEventListener("sac:choose", async (e) => {
            const st = await fileBrowser.store.stat(e.detail.paths[0]);
            fileBrowserOut.textContent = st ? `chose ${st.path} — ${st.type}, ${st.size} B` : "";
        });

        // Copy button
        const copyOut = root.querySelector("#demo-copy-out");
        root.querySelectorAll("sac-copy-button").forEach(btn => {
            btn.addEventListener("sac:copy", (e) => {
                copyOut.textContent = `copied: ${e.detail.text}`;
            });
        });

        // Scene graph
        const sceneLog = root.querySelector("#demo-scene-log");
        const scene = root.querySelector("#demo-scene");
        ["sac:select", "sac:visibility", "sac:expand", "sac:delete", "sac:recolor"].forEach(type => {
            scene.addEventListener(type, (e) => {
                sceneLog.textContent = `${type}: ${JSON.stringify(e.detail)}`;
                // Demo-only: actually apply visibility so the eye toggles.
                if (type === "sac:visibility") {
                    const item = scene.querySelector(`#${e.detail.id}`);
                    if (item) item.visible = e.detail.visible;
                }
            });
        });

        // Log
        const log = root.querySelector("#demo-log");
        root.querySelectorAll("[data-log]").forEach(btn => {
            btn.addEventListener("click", () => log.add(`Sample ${btn.dataset.log} entry`, btn.dataset.log));
        });

        // Loader
        root.querySelector("#demo-loader").addEventListener("click", () => {
            const loader = root.querySelector("#demo-loader-el");
            loader.show("Processing…", "This hides again in 2 seconds");
            setTimeout(() => loader.hide(), 2000);
        });

        // Tabs
        const tabsState = root.querySelector("#demo-tabs-state");
        root.querySelector("#demo-tabs").addEventListener("sac:tab-show", (e) => {
            tabsState.textContent = `active: ${e.detail.name}`;
        });

        // Menu
        const menuResult = root.querySelector("#demo-menu-result");
        root.querySelector("#demo-menu").addEventListener("sac:select", (e) => {
            menuResult.textContent = `selected: ${e.detail.action}`;
        });
        const ctxArea = root.querySelector("#demo-ctx-area");
        const ctxMenu = root.querySelector("#demo-ctx-menu");
        ctxArea.addEventListener("contextmenu", (e) => { e.preventDefault(); ctxMenu.openAt(e); });
        ctxMenu.addEventListener("sac:select", (e) => {
            ctxArea.textContent = `context menu: ${e.detail.action}`;
        });

        // Command palette — just the live opener here. The two demo commands
        // and the mod+shift+x hotkey are GLOBAL registrations, so they belong
        // to the app's visibility, not this section's render: registering them
        // here leaked them into every other app on the shell. They are now
        // scoped to the styleguide being on screen (see AppStyleguide).
        root.querySelector("#palette-open").addEventListener("click", () => sac.palette.open());

        // Toast
        const toastMessages = {
            info:    "Reindex runs in the background.",
            success: "Saved.",
            warn:    "You are editing shared state.",
            error:   "Export failed — see the log.",
        };
        root.querySelectorAll("[data-toast]").forEach(btn => {
            btn.addEventListener("click", () => {
                const kind = btn.dataset.toast;
                if (kind === "sticky") {
                    sac.toast("No duration — this one waits for the × (or .dismiss()).", {
                        kind: "info", duration: 0, title: "Sticky",
                    });
                } else {
                    sac.toast(toastMessages[kind], { kind });
                }
            });
        });

        // Progress
        const progress = root.querySelector("#demo-progress");
        root.querySelectorAll("[data-progress]").forEach(btn => {
            btn.addEventListener("click", () => {
                if (btn.dataset.progress === "indeterminate") {
                    progress.toggleAttribute("indeterminate", !progress.hasAttribute("indeterminate"));
                } else {
                    progress.removeAttribute("indeterminate");
                    progress.value = btn.dataset.progress;
                }
            });
        });

        // Theme toggle
        const themeState = root.querySelector("#demo-theme-toggle-state");
        root.querySelector("#demo-theme-toggle").addEventListener("sac:change", (e) => {
            themeState.textContent = `theme: ${e.detail.value}`;
        });

        // Pixel workbench demos share one helper: a w×h canvas with a few
        // pixels painted — stand-in sprite frames. Colors come from the data
        // palette tokens, so the demos follow the theme.
        const sgCs = getComputedStyle(document.documentElement);
        const sgColor = (token) => sgCs.getPropertyValue(token).trim() || "#888";
        function sgSprite(w, h, paint) {
            const c = document.createElement("canvas");
            c.width = w; c.height = h;
            paint(c.getContext("2d"));
            return c;
        }

        // sac-pixel-canvas — a 16×16 sprite painted with a one-pixel pencil;
        // the static preview beside it shares the same canvas.
        const pixel = root.querySelector("#demo-pixel");
        if (pixel) {
            const art = sgSprite(16, 16, (ctx) => {
                ctx.fillStyle = sgColor("--palette-indigo"); ctx.fillRect(4, 3, 8, 10);
                ctx.fillStyle = sgColor("--palette-yellow"); ctx.fillRect(5, 4, 6, 8);
                ctx.fillStyle = sgColor("--palette-indigo"); ctx.fillRect(6, 6, 1, 2); ctx.fillRect(9, 6, 1, 2); ctx.fillRect(6, 10, 4, 1);
            });
            const pv = root.querySelector("#demo-pixel-pv");
            const state = root.querySelector("#demo-pixel-state");
            const ink = sgColor("--palette-pink");
            let hover = null;
            const say = () => { state.textContent = `${hover && hover.inside ? `${hover.lx}, ${hover.ly}` : "–"} · ${pixel.zoom}×`; };
            const paint = (c) => {
                if (!c.inside) return;
                const ctx = art.getContext("2d");
                ctx.fillStyle = ink;
                ctx.fillRect(c.x, c.y, 1, 1);
                pixel.render(); pv.render();
            };
            pixel.image = art;
            pv.image = art;
            pixel.addEventListener("sac:pixel-down", (e) => paint(e.detail));
            pixel.addEventListener("sac:pixel-move", (e) => paint(e.detail));
            pixel.addEventListener("sac:pixel-hover", (e) => { hover = e.detail; say(); });
            pixel.addEventListener("sac:zoom", say);
        }

        // sac-toolbox — its hotkeys attribute is switched by the app itself
        // (on stage only: the keys are global), see _syncDemoKeys().
        const tb = root.querySelector("#demo-toolbox");
        if (tb) {
            tb.tools = [
                { id: "pencil", icon: "pencil",     label: "Pencil",     key: "b" },
                { id: "eraser", icon: "eraser",     label: "Eraser",     key: "e" },
                null,
                { id: "fill",   icon: "bucket",     label: "Fill",       key: "g" },
                { id: "pick",   icon: "eyedropper", label: "Eyedropper", key: "i" },
                null,
                { id: "select", icon: "marquee",    label: "Select",     key: "m" },
                { id: "move",   icon: "move",       label: "Move",       key: "v" },
            ];
            const st = root.querySelector("#demo-toolbox-state");
            tb.addEventListener("sac:change", (e) => { st.textContent = "tool: " + e.detail.value; });
        }
        const tr = root.querySelector("#demo-toolbox-row");
        if (tr) tr.tools = [
            { id: "line", icon: "line", label: "Line" },
            { id: "rect", icon: "square", label: "Rectangle" },
            { id: "rectfill", icon: "square-fill", label: "Filled rectangle" },
            { separator: true },
            { id: "ellipse", icon: "circle", label: "Ellipse" },
            { id: "ellipsefill", icon: "circle-fill", label: "Filled ellipse" },
        ];

        const film = root.querySelector("#demo-film");
        if (film) {
            const hues = ["var(--palette-blue)", "var(--palette-orange)", "var(--palette-green)", "var(--palette-pink)"];
            // A bouncing 16×16 ball, four frames. Colors are resolved from the
            // data palette so the demo follows the theme.
            const ball = (dy, i) => sgSprite(16, 16, (ctx) => {
                ctx.fillStyle = sgColor(hues[i].slice(4, -1));
                ctx.fillRect(5, 3 + dy, 6, 6);
                ctx.fillRect(4, 4 + dy, 8, 4);
                ctx.fillStyle = sgColor("--palette-gray");
                ctx.fillRect(3, 14, 10, 1);
            });
            let frames = [0, 3, 6, 3].map(ball);
            film.frames = frames;
            const state = root.querySelector("#demo-film-state");
            const say = (msg) => { state.textContent = `frame ${film.value + 1} of ${frames.length}${msg ? " · " + msg : ""}`; };
            film.addEventListener("sac:change", () => say());
            film.addEventListener("sac:reorder", (e) => {
                frames.splice(e.detail.to, 0, ...frames.splice(e.detail.from, 1));
                say(`moved ${e.detail.from + 1} → ${e.detail.to + 1}`);
            });
            film.addEventListener("sac:action", (e) => {
                const i = e.detail.index;
                if (e.detail.action === "add") { frames.splice(i + 1, 0, sgSprite(16, 16, () => {})); film.frames = frames; film.value = i + 1; }
                if (e.detail.action === "duplicate") {
                    const src = frames[i];
                    frames.splice(i + 1, 0, sgSprite(16, 16, (ctx) => ctx.drawImage(src, 0, 0)));
                    film.frames = frames; film.value = i + 1;
                }
                if (e.detail.action === "delete" && frames.length > 1) { frames.splice(i, 1); film.frames = frames; film.value = Math.min(i, frames.length - 1); }
                say(e.detail.action);
            });
            // Play: the timer is the app's, the strip just follows.
            let timer = null;
            const play = root.querySelector("#demo-film-play");
            play.addEventListener("click", () => {
                if (timer) { clearInterval(timer); timer = null; play.innerHTML = '<sac-icon name="play"></sac-icon>'; return; }
                play.innerHTML = '<sac-icon name="pause"></sac-icon>';
                timer = setInterval(() => {
                    if (!film.isConnected) { clearInterval(timer); timer = null; return; }
                    film.value = (film.value + 1) % frames.length; say();
                }, 160);
            });
            say();
        }

        const layerList = root.querySelector("#demo-layers");
        if (layerList) {
            const col = sgColor;
            const layers = [
                { id: "ink",   name: "Ink",        visible: true,  locked: false,
                  thumb: sgSprite(16, 16, (c) => { c.fillStyle = col("--palette-indigo"); c.fillRect(3, 3, 10, 1); c.fillRect(3, 12, 10, 1); c.fillRect(3, 3, 1, 10); c.fillRect(12, 3, 1, 10); }) },
                { id: "color", name: "Flat color", visible: true,  locked: false,
                  thumb: sgSprite(16, 16, (c) => { c.fillStyle = col("--palette-yellow"); c.fillRect(4, 4, 8, 8); }) },
                { id: "bg",    name: "Background", visible: false, locked: true,
                  thumb: sgSprite(16, 16, (c) => { c.fillStyle = col("--palette-teal"); c.fillRect(0, 0, 16, 16); }) },
            ];
            layerList.layers = layers;
            const state = root.querySelector("#demo-layers-state");
            let n = 0;
            layerList.addEventListener("sac:change",  (e) => { state.textContent = `active: ${e.detail.id}`; });
            layerList.addEventListener("sac:toggle",  (e) => { state.textContent = `${e.detail.id}.${e.detail.prop} = ${e.detail.value}`; });
            layerList.addEventListener("sac:rename",  (e) => { state.textContent = `renamed ${e.detail.id} → “${e.detail.name}”`; });
            layerList.addEventListener("sac:reorder", (e) => { state.textContent = `moved ${e.detail.from} → ${e.detail.to}`; });
            layerList.addEventListener("sac:action",  (e) => {
                const cur = layerList.layers;                       // the list's own state
                const i = Math.max(0, cur.findIndex((l) => l.id === e.detail.id));
                if (e.detail.action === "add") {
                    const id = "layer-" + (++n);
                    cur.splice(i, 0, { id, name: `Layer ${n}`, visible: true, locked: false, thumb: sgSprite(16, 16, () => {}) });
                    layerList.layers = cur; layerList.value = id;
                } else if (e.detail.action === "duplicate") {
                    const id = cur[i].id + "-copy-" + (++n);
                    cur.splice(i, 0, { ...cur[i], id, name: cur[i].name + " copy" });
                    layerList.layers = cur; layerList.value = id;
                } else if (e.detail.action === "delete" && cur.length > 1) {
                    cur.splice(i, 1);
                    layerList.layers = cur; layerList.value = cur[Math.min(i, cur.length - 1)].id;
                }
                state.textContent = e.detail.action;
            });
        }

        // sac-shortcut-sheet — "?" is bound while the guide is on stage.
        const sb = root.querySelector("#demo-shortcuts");
        if (sb) sb.addEventListener("click", () => sac.shortcuts.show());
    }

    /* ---------------------------------------------------------- layout --- */

    function layoutHtml() {
        return `
            <div class="sg-page">
                <h1>Layouts</h1>
                <p class="lead">
                    Three page archetypes cover every app so far: the <strong>launcher hub</strong> (tile
                    grid), the <strong>workspace tool page</strong> (nav + sidebar + viewport), and the
                    <strong>SPA app shell</strong> (router + views). Copy the matching file from
                    <code>kit/templates/</code> and go.
                </p>

                <h2>Workspace tool page</h2>
                <p>The classic tool layout: fixed 50px <code>&lt;sac-nav&gt;</code>, a 260px
                   <code>.sidebar</code>, and a flexible <code>.viewport</code>. The page never scrolls
                   (<code>body class="app-page"</code>: 100vh flex column, <code>user-select: none</code>
                   — inputs re-enable selection).</p>
                <div class="sg-demo on-bg" style="padding:0;overflow:hidden;">
                    <div style="display:flex;flex-direction:column;height:240px;">
                        <div style="height:34px;background:var(--glass-strong);border-bottom:1px solid var(--border-strong);display:flex;align-items:center;padding:0 0.75rem;font-size:0.7rem;font-weight:700;letter-spacing:0.08em;">SAC-NAV <span style="color:var(--text-dim);margin-left:0.5rem;font-weight:400;">fixed · 50px · z-index 9999</span></div>
                        <div style="flex:1;display:flex;overflow:hidden;">
                            <div style="width:120px;background:var(--panel);border-right:1px solid var(--border);padding:0.5rem;font-size:0.68rem;color:var(--text-dim);">.sidebar<br>260px</div>
                            <div style="flex:1;background:var(--viewport-bg);position:relative;">
                                <span style="position:absolute;top:8px;left:10px;font-size:0.68rem;color:var(--text-dim);">.viewport (flex:1)</span>
                                <sac-hud position="bottom-right" style="font-size:0.68rem;">sac-hud</sac-hud>
                            </div>
                        </div>
                    </div>
                </div>
                ${code(`<body class="app-page">
    <sac-nav brand="MY TOOLS" app-name="MY TOOL" brand-href="/">
        <div slot="toolbar" class="toolbar">
            <button class="btn primary">Open File</button>
        </div>
    </sac-nav>
    <div class="workspace">
        <div class="main-layout">          <!-- padding-top: 50px for the nav -->
            <div class="sidebar">
                <sac-section title="Settings">…sliders, toggles…</sac-section>
            </div>
            <div class="viewport" id="viewport">
                <div class="pz-layer" id="layer"><canvas></canvas></div>
                <sac-hud position="top-right"></sac-hud>
            </div>
        </div>
    </div>
</body>`)}
                <p>Template: <code>kit/templates/tool-page.html</code>. Per-app accent: the page's
                   <code>style.css</code> starts with <code>@import '../kit/css/ui.css';</code> followed by
                   <code>:root { --accent: … }</code>.</p>

                <h2>Launcher hub</h2>
                <p>Full-page tile grid (<code>.hub-container</code> + <code>.grid</code> +
                   <code>.tile</code>, see CSS Patterns): <strong>page tiles</strong> are plain links,
                   <strong>window tiles</strong> open a lazy app in a
                   <code>&lt;sac-window&gt;</code> via <code>sac.apps</code>, <code>?app=&lt;id&gt;</code>
                   deep links included — all tiles look the same; what a click does is not
                   encoded in the border. The modern shape is <code>&lt;sac-launcher&gt;</code> — one tile
                   per registered manifest, user-composable via its <code>storage</code> attribute (see
                   <a href="#/styleguide/components">Components</a> and <a href="#/styleguide/helpers">Helpers</a>).
                   The demo app's hub is the live example.</p>
                ${code(`<sac-launcher storage="my-hub"></sac-launcher>

sac.apps.register({ id: "my-tool", name: "My Tool", icon: "shapes",
                    kind: "page", href: "/my-tool/" });
sac.apps.register({ id: "foo", name: "Foo", icon: "lightbulb",
                    kind: "window", tag: "tool-foo", src: "foo/foo.js",
                    width: "500px", height: "750px" });
sac.apps.init();   // ?app=foo deep links (+ hand-written [data-app] tiles)`)}
                <p>Hand-written tiles remain possible anywhere on the page —
                   <code>&lt;a class="tile" data-app="foo"&gt;</code> — and
                   <code>sac.apps.init()</code> binds them. Template:
                   <code>kit/templates/launcher.html</code>.</p>

                <h2>SPA app shell + router</h2>
                <p>A 60-line shell: views as custom elements that self-register routes,
                   <code>&lt;sac-nav&gt;</code> renders whatever is registered. The whole framework
                   is ~120 lines (<code>globals.js</code> + <code>router.js</code>).</p>
                ${code(`// views/my-notes-view.js  (the canonical view shape)
class MyNotesView extends HTMLElement {
    connectedCallback() {
        this.render();   // the view draws its own toolbar (.toolbar recipe) in here
    }
    disconnectedCallback() { /* remove window/document listeners here */ }
    render() { this.innerHTML = \`<div class="hub-container">…</div>\`; }
}
customElements.define("my-notes-view", MyNotesView);
sac.router.register("#/notes", "my-notes-view", { label: "Notes", icon: "note" });`)}
                <table class="sg">
                    <tr><th style="width:280px">sac.router API</th><th>Description</th></tr>
                    <tr><td><code>register(hash, tag, {label, icon})</code></td><td>Adds a route + fires <code>sac:route-registered</code> (this is what makes a self-registering view list work — nav components render before view scripts run). Pass <code>tag = null</code> for plain multi-page hrefs.</td></tr>
                    <tr><td><code>options.palette</code></td><td>The Ctrl-K palette group the route lists under: a string, or a function returning one (resolved on every open — follows the language); <code>false</code> keeps it out of the palette. Default <code>"Views"</code>. <code>sac.apps</code> files app routes under <code>"Apps"</code>.</td></tr>
                    <tr><td><code>routes()</code></td><td>[{hash, tag, label, icon}] — what sac-nav renders.</td></tr>
                    <tr><td><code>current() / currentResource()</code></td><td>Raw hash / hash with any scope prefix stripped.</td></tr>
                    <tr><td><code>navigate(hash)</code></td><td>Sets location.hash.</td></tr>
                    <tr><td><code>mount(selector)</code></td><td>Starts rendering views into the mount point. On hashchange it swaps <code>innerHTML</code> to the matching tag.</td></tr>
                </table>
                <p>Template: <code>kit/templates/app-shell.html</code>.</p>

                <h2>Multi-page apps and the nav</h2>
                <p>Multi-page suites use the same registry without
                   <code>mount()</code>: register plain paths, and <code>&lt;sac-nav&gt;</code> renders them
                   as ordinary links with active state from <code>location.pathname</code>.</p>
                ${code(`sac.router.register("/svg-to-world/", null, { label: "SVG to World", icon: "shapes" });
sac.router.register("/vectorizer/",   null, { label: "Vectorizer",   icon: "vector" });
// no mount() — this page is just a page; the nav panel still lists everything.`)}

                <h2>List / detail</h2>
                <p>A list beside its detail — mail, contacts, settings — in one <code>&lt;sac-split collapse&gt;</code>:
                   two panels on a wide screen, one at a time with a back bar on a phone. Template:
                   <code>kit/templates/list-detail.html</code>; the live demo is in
                   <a href="#/styleguide/patterns/responsive-list-detail">CSS Patterns → Responsive</a>.</p>
                ${code(`<div class="main-layout">
    <sac-split collapse position="32%" min-start="220px" min-end="320px">
        <nav slot="start">…the list…</nav>
        <article slot="end">…the open item…</article>
    </sac-split>
</div>`)}

                <h2>The one rule that matters</h2>
                <p class="sg-note"><b>Views use light DOM, components use Shadow DOM.</b> Views are composed
                   from the global classes (<code>.grid</code>, <code>.tile</code>, <code>.btn</code>) and
                   need ui.css to reach them; components need style isolation so a view's CSS can't reach
                   in. Guess wrong and either your view is unstyled or your component leaks.</p>
                <p class="sg-note"><b>Scrollbars:</b> Chromium and Safari draw the kit's own bar
                   (<code>::-webkit-scrollbar</code>: a rounded 6px thumb with 2px of air, no arrow buttons, the
                   same on every OS); Firefox gets the standard <code>scrollbar-width</code>/<code>-color</code>
                   pair, set ONLY there — a set <code>scrollbar-color</code> (inherited, even into shadow roots)
                   makes Chrome ignore every <code>::-webkit-scrollbar</code> rule. The rules do <em>not</em>
                   pierce Shadow DOM: a component with its own scrollable shadow content repeats the recipe
                   (all kit components already do).</p>
            </div>
            `;
    }

    /* -------------------------------------------------------- patterns --- */

    function patternsHtml() {
        return `
            <div class="sg-page">
                <h1>CSS Patterns</h1>
                <p class="lead">
                    Global classes from <code>ui.css</code>. Rule of thumb: if a thing needs behavior it's a
                    <code>sac-*</code> element; if it's pure styling it's one of these classes.
                    Everything below runs on tokens — no class hides a raw color.
                    Phones and touch: <a href="#/styleguide/patterns/responsive">Responsive</a>, at the end.
                </p>

                <h2>Buttons — .btn</h2>
                <p>THE button (one class replaces the legacy <code>.btn</code>/<code>.tool-btn</code> pair).
                   Default shape: full-width uppercase sidebar button. Variants: <code>.primary</code>,
                   <code>.danger</code>, <code>:disabled</code>.</p>
                <p><strong>Full width is the default</strong>, sized for a sidebar column. Buttons
                   sharing a flex line shrink against each other and look right on their own — a
                   button standing alone in a wide container is the first place an app notices;
                   give it <code>width: auto</code> (or a container) when it shouldn't span.
                   The <code>hidden</code> attribute works on <code>.btn</code>: <code>ui.css</code>
                   carries the explicit <code>.btn[hidden]</code> rule, because a class with a
                   <code>display</code> of its own would otherwise beat the UA's hidden rule.</p>
                <div class="sg-demo sg-col">
                    <button class="btn">Default</button>
                    <button class="btn primary">Primary</button>
                    <button class="btn danger">Danger</button>
                    <button class="btn" disabled>Disabled</button>
                </div>

                <h2>The .toolbar recipe</h2>
                <p>Wrap ribbon content in <code>class="toolbar"</code> and <code>.btn</code> shrinks to the
                   32px ribbon size — no repeated inline styles anywhere.
                   Also home of <code>.nav-icon-btn</code>, the round icon button.</p>
                <div class="sg-demo">
                    <div class="toolbar">
                        <button class="btn primary">Open File</button>
                        <button class="btn">Export</button>
                        <button class="nav-icon-btn" title="Settings">
                            <sac-icon name="settings" style="--icon-size:20px"></sac-icon>
                        </button>
                    </div>
                </div>
                ${code(`<div slot="toolbar" class="toolbar">
    <button class="btn primary">Open File</button>
    <button class="nav-icon-btn"><sac-icon name="settings"></sac-icon></button>
</div>`)}

                ${compact(`under <code>pointer: coarse</code> a <code>.btn</code> in a <code>.toolbar</code> keeps its 32px look and
                   gets a 44px <code>::after</code> hit halo — the ribbon stays 50px tall.`)}

                <h2>Small icon button — .icon-btn</h2>
                <p>The 26px ghost icon button for rows, lists and cards — the light-DOM twin of
                   <code>&lt;sac-copy-button&gt;</code>. <strong>An icon button next to a copy button is an
                   <code>.icon-btn</code></strong>: both read <code>--icon-btn-size</code>/<code>--icon-btn-icon</code>,
                   so they stay alike across kit upgrades. Variants: <code>.danger</code> (danger on hover),
                   <code>:disabled</code>.</p>
                <div class="sg-demo">
                    <div class="sg-row">
                        <button class="icon-btn danger" title="Remove"><sac-icon name="trash"></sac-icon></button>
                        <button class="icon-btn" title="Edit"><sac-icon name="pencil"></sac-icon></button>
                        <sac-copy-button value="Ada Lovelace"></sac-copy-button>
                        <button class="icon-btn" title="Remove" disabled><sac-icon name="trash"></sac-icon></button>
                    </div>
                </div>
                ${code(`<button class="icon-btn danger" title="Remove"><sac-icon name="trash"></sac-icon></button>
<sac-copy-button value="Ada Lovelace"></sac-copy-button>`)}
                <h3>Tool-sized: .icon-btn.tool</h3>
                <p>An action row that sits beside a <code>&lt;sac-toolbox&gt;</code> — copy, paste, flip,
                   crop under the tools of a pixel editor — must share its measure. <code>.icon-btn.tool</code>
                   reads <code>--tool-btn-size</code>/<code>--tool-btn-icon</code>, the same tokens the toolbox
                   reads, so the row and the box can never drift; 44px under a coarse pointer, like the box.
                   <code>.active</code> or <code>aria-pressed="true"</code> takes the toolbox's active look.</p>
                <div class="sg-demo sg-row">
                    <button class="icon-btn tool" title="Copy"><sac-icon name="copy"></sac-icon></button>
                    <button class="icon-btn tool" title="Cut"><sac-icon name="scissors"></sac-icon></button>
                    <button class="icon-btn tool" title="Paste"><sac-icon name="paste"></sac-icon></button>
                    <button class="icon-btn tool" title="Flip horizontal"><sac-icon name="flip-h"></sac-icon></button>
                    <button class="icon-btn tool" title="Crop to the object"><sac-icon name="crop"></sac-icon></button>
                    <button class="icon-btn tool" aria-pressed="true" title="Onion skin"><sac-icon name="onion"></sac-icon></button>
                </div>
                ${code(`<button class="icon-btn tool" title="Paste"><sac-icon name="paste"></sac-icon></button>`)}

                <h2>Form controls</h2>
                <p>Native <code>input</code>/<code>select</code>/<code>textarea</code>/<code>label</code> are
                   fully styled: dark fields, accent focus ring, hidden number spinners, uppercase
                   micro-labels, <code>accent-color</code> on checkbox/radio, and a painted select chevron.
                   <code>color-scheme</code> on <code>:root</code> keeps native popups, pickers and
                   autofill in the right mode.</p>
                <div class="sg-demo sg-col">
                    <div><label>Project name</label><input type="text" placeholder="Type here…"></div>
                    <div><label>Amount</label><input type="number" value="42"></div>
                    <div><label>Mode</label>
                        <span class="select">
                            <select>
                                <option>Precision</option>
                                <option>Balanced</option>
                                <option>Fast</option>
                            </select>
                        </span>
                    </div>
                    <div class="sg-row" style="gap:1.25rem;">
                        <label style="display:flex;align-items:center;gap:6px;margin:0;text-transform:none;font-size:0.85rem;color:var(--text);font-weight:400;"><input type="checkbox" checked> Checkbox</label>
                        <label style="display:flex;align-items:center;gap:6px;margin:0;text-transform:none;font-size:0.85rem;color:var(--text);font-weight:400;"><input type="radio" name="r" checked> Radio</label>
                    </div>
                </div>
                <p class="sg-note"><b>Wrap the select:</b> a <code>&lt;select&gt;</code> is a replaced
                   element — it can hold no inline SVG and no <code>::after</code>, so the chevron
                   lives on a thin wrapper: <code>&lt;span class="select"&gt;&lt;select&gt;…&lt;/select&gt;&lt;/span&gt;</code>.
                   A bare <code>&lt;select&gt;</code> shows no arrow. The chevron is an SVG mask filled with
                   <code>var(--text-muted)</code>, so it follows the theme with no colour literal.</p>

                <h2>Surfaces painted from data — the onColor rule</h2>
                <p>Sometimes a surface's background IS the app's output: the colour a picker just
                   mixed, a user's brand value, a result only known at runtime. No token can promise
                   contrast against a colour that is not in the theme, so this is a rule, not a
                   component: <strong>the ink comes from <code>sac.color.onColor()</code></strong>
                   (black or white, flipping at luma 0.35 — see Helpers), and <strong>controls
                   standing on the plane inherit <code>currentColor</code></strong> instead of the
                   button tokens — an <code>--accent</code> fill on an arbitrary background is a
                   coin flip. The plane's layout is the app's business; the ink is not.</p>
                <div class="sg-demo">
                    <div class="sg-row" style="align-items:stretch;">
                        <div style="flex:1 1 180px;background:#a3e635;color:#000000;border-radius:var(--radius-m);padding:1rem;">
                            <div style="font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-weight:600;">#a3e635</div>
                            <button class="btn" style="width:auto;margin-top:0.75rem;background:transparent;border-color:currentColor;color:inherit;">Copy</button>
                        </div>
                        <div style="flex:1 1 180px;background:#1e3a8a;color:#ffffff;border-radius:var(--radius-m);padding:1rem;">
                            <div style="font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-weight:600;">#1e3a8a</div>
                            <button class="btn" style="width:auto;margin-top:0.75rem;background:transparent;border-color:currentColor;color:inherit;">Copy</button>
                        </div>
                    </div>
                </div>
                ${code(`// JS: paint the plane, then let the kit pick the ink
plane.style.background = value;                                  // data, not theme
plane.style.color = sac.color.onColor(sac.color.parse(value));   // "#000000" | "#ffffff"

/* CSS: controls ON the plane borrow its ink */
.plane .btn {
    background: transparent;
    border-color: currentColor;
    color: inherit;
}`)}

                <h2>Cards &amp; glass — .card, .glass, .floating-menu</h2>
                <div class="sg-demo on-bg">
                    <div class="sg-row" style="align-items:stretch;">
                        <div class="card" style="width:200px;">
                            <label>Card</label>
                            <p style="margin:0;font-size:0.85rem;">Opaque panel surface (--panel), shadow-1.</p>
                        </div>
                        <div class="glass" style="width:200px;border-radius:var(--radius-l);padding:1.25rem;">
                            <label>Glass</label>
                            <p style="margin:0;font-size:0.85rem;">Chrome material (--glass-strong) + blur.</p>
                        </div>
                        <div class="floating-menu" style="position:static;width:200px;">
                            <div class="floating-menu-header">Floating menu</div>
                            <button class="btn">Action A</button>
                            <button class="btn">Action B</button>
                        </div>
                    </div>
                </div>

                <h2>Plain log box — .log</h2>
                <p>Div-based fallback when the <code>&lt;sac-log&gt;</code> component is more than you need.</p>
                <div class="sg-demo">
                    <div class="log">[12:00:01] ready<br>[12:00:04] loaded 3 objects<br>[12:00:09] export ok</div>
                </div>

                <h2>Tiles — .grid + .tile</h2>
                <p>Variants: <code>.tile.large</code> (2 columns), <code>.tile.disabled</code>
                   (grayscale — for a tile that exists but is unavailable right now: no permission,
                   offline, wrong account),
                   <code>.tile-badge</code> (+<code>.accent</code>). One tile look for every kind —
                   what a click does (page, view, window) is not encoded in the border. A tile can
                   carry its own <code>--accent</code> seed: icon, hover ring and glow follow, and
                   opened through <code>sac.apps</code> the same color becomes the app's highlight.</p>
                <div class="sg-demo on-bg">
                    <div class="grid" style="grid-auto-rows:200px;">
                        <a class="tile" href="#/styleguide/patterns">
                            <sac-icon name="shapes"></sac-icon>
                            <div><h2 style="font-size:1.2rem;">Page tile</h2><p>Plain link.</p></div>
                        </a>
                        <a class="tile" href="#/styleguide/patterns">
                            <span class="tile-badge accent">NEW</span>
                            <sac-icon name="vector"></sac-icon>
                            <div><h2 style="font-size:1.2rem;">Badged</h2><p>.tile-badge.accent</p></div>
                        </a>
                        <a class="tile" href="#/styleguide/patterns" style="--accent:#e59500;">
                            <sac-icon name="lightbulb"></sac-icon>
                            <div><h2 style="font-size:1.2rem;">Accented tile</h2><p>Own <code>--accent</code> seed — the Windows-Phone move.</p></div>
                        </a>
                    </div>
                </div>
                ${compact(`the grid's columns never drop below the screen (<code>minmax(min(280px, 100%), 1fr)</code> —
                   one column on a phone), rows become <code>minmax(150px, auto)</code> and tiles pad less. Below 480px a tile
                   becomes a <b>row</b> — a 32px icon beside the text, a 1.15rem title, rows as tall as their content — so a
                   phone shows twice the tiles per screen; <code>.hub-container .intro-text</code> steps down to 1rem. Under
                   <code>hover: none</code> a tapped tile does not stay lifted.`)}

                <h2>Hub header + .orb</h2>
                <p><code>.hub-container</code> centers the launcher; its <code>h1</code> gets the
                   text→accent gradient. <code>.orb</code> is the fixed radial accent glow behind hub,
                   login and setup pages — it follows <code>--accent</code>, so a per-app accent re-tints
                   the whole atmosphere.</p>

                <h2>Centered card — .center-shell + .center-card</h2>
                <p>Pre-auth / empty-state shell: a viewport-centered glass card for login screens and
                   empty states.</p>
                <div class="sg-demo on-bg" style="padding:0;">
                    <div class="center-shell" style="min-height:280px;">
                        <div class="center-card" style="padding:2rem;">
                            <h1 style="font-size:1.5rem;">MY APP</h1>
                            <p class="tagline">One line about the app.</p>
                            <button class="btn primary">Sign in</button>
                        </div>
                    </div>
                </div>

                <h2>Tables &amp; kbd</h2>
                <p>Plain <code>&lt;table&gt;</code> is fully styled by the element baseline — no class
                   required. Uppercase micro-header, hairline row dividers, a subtle row hover wash.
                   <code>&lt;kbd&gt;</code> renders a keycap for documenting shortcuts.</p>
                <div class="sg-demo">
                    <table>
                        <tr><th>Name</th><th>Count</th><th>Status</th></tr>
                        <tr><td>Alpha set</td><td>128</td><td>Saved</td></tr>
                        <tr><td>Beta set</td><td>42</td><td>Unsaved</td></tr>
                    </table>
                    <p>Press <kbd>Ctrl</kbd>+<kbd>K</kbd> to open the command palette.</p>
                </div>

                <h2>Skeleton — .skeleton</h2>
                <p>A shimmering placeholder block for content still loading. The base class sizes to its
                   box; <code>.text</code> collapses to a line height, <code>.circle</code> rounds to an
                   avatar.</p>
                <div class="sg-demo">
                    <div class="sg-row" style="align-items:center;gap:1rem;">
                        <div class="skeleton circle" style="width:40px;height:40px;"></div>
                        <div style="flex:1;display:flex;flex-direction:column;gap:0.5rem;">
                            <div class="skeleton text" style="width:60%;"></div>
                            <div class="skeleton text" style="width:40%;"></div>
                        </div>
                    </div>
                    <div class="skeleton" style="width:120px;height:80px;margin-top:1rem;"></div>
                </div>

                <h2>Breadcrumbs — .crumbs</h2>
                <p>An ordered list of links with a chevron separator.</p>
                <div class="sg-demo">
                    <ol class="crumbs">
                        <li><a href="#/styleguide/patterns">Home</a></li>
                        <li><a href="#/styleguide/patterns">Projects</a></li>
                        <li aria-current="page">Illuminator</li>
                    </ol>
                </div>
                <table class="sg">
                    <tr><th style="width:220px">Class</th><th>Description</th></tr>
                    <tr><td><code>.crumbs</code></td><td>On the &lt;ol&gt; — flex row, wraps, chevron separator between items.</td></tr>
                    <tr><td><code>[aria-current="page"]</code></td><td>Current crumb — <code>--text</code> + weight 500, works on &lt;li&gt; or &lt;a&gt;, no link required.</td></tr>
                </table>

                <h2>Pagination — .pagination</h2>
                <p>Compact page-number strip; items are &lt;button&gt; or &lt;a&gt;.</p>
                <div class="sg-demo">
                    <nav class="pagination" aria-label="Pagination">
                        <button disabled>&lsaquo;</button>
                        <button>1</button>
                        <button class="active" aria-current="page">2</button>
                        <button>3</button>
                        <span class="gap">&hellip;</span>
                        <button>12</button>
                        <button>&rsaquo;</button>
                    </nav>
                </div>
                <table class="sg">
                    <tr><th style="width:220px">Class</th><th>Description</th></tr>
                    <tr><td><code>.active</code> / <code>[aria-current="page"]</code></td><td><code>--accent-tint</code> background + <code>--accent</code> text — no border.</td></tr>
                    <tr><td><code>.gap</code></td><td>Plain ellipsis, not a button — same footprint, no hover/click.</td></tr>
                    <tr><td><code>:disabled</code> / <code>.disabled</code> / <code>[aria-disabled="true"]</code></td><td>Dimmed prev/next — the last two cover &lt;a&gt;, which has no native disabled state.</td></tr>
                </table>

                <h2>Empty state — .empty-state</h2>
                <p>Centered filler for a panel or card with nothing in it yet — icon, title line, hint,
                   optional action.</p>
                <div class="sg-demo on-bg">
                    <div class="card" style="width:280px;">
                        <div class="empty-state">
                            <sac-icon name="archive"></sac-icon>
                            <b>No exports yet</b>
                            <p>Exports you run will show up here.</p>
                            <button class="btn primary">Run export</button>
                        </div>
                    </div>
                </div>
                <table class="sg">
                    <tr><th style="width:220px">Selector</th><th>Description</th></tr>
                    <tr><td><code>.empty-state sac-icon</code></td><td>36px, <code>--text-dim</code>.</td></tr>
                    <tr><td><code>b</code> / <code>strong</code> / <code>h3</code></td><td>Title line — <code>--text-muted</code>, 0.95rem, weight 600.</td></tr>
                    <tr><td><code>p</code></td><td>Hint line — <code>--text-dim</code>, 0.85rem.</td></tr>
                </table>

                <h2>Badges — .badge-dot, .badge-count</h2>
                <p>A status dot or a count pill anchored to any element. The ring around each is the
                   page ground showing through, not a border.</p>
                <div class="sg-demo">
                    <div class="sg-row" style="gap:1.5rem;align-items:center;">
                        <button class="nav-icon-btn has-badge" title="Notifications">
                            <sac-icon name="users"></sac-icon>
                            <span class="badge-dot"></span>
                        </button>
                        <button class="nav-icon-btn has-badge" title="Warnings">
                            <sac-icon name="warn"></sac-icon>
                            <span class="badge-dot warn"></span>
                        </button>
                        <button class="nav-icon-btn has-badge" title="Errors">
                            <sac-icon name="error"></sac-icon>
                            <span class="badge-dot danger"></span>
                        </button>
                        <button class="nav-icon-btn has-badge" title="Inbox">
                            <sac-icon name="document"></sac-icon>
                            <span class="badge-count">7</span>
                        </button>
                        <button class="nav-icon-btn has-badge" title="Inbox, many unread">
                            <sac-icon name="document"></sac-icon>
                            <span class="badge-count">24</span>
                        </button>
                    </div>
                </div>
                <table class="sg">
                    <tr><th style="width:220px">Class</th><th>Description</th></tr>
                    <tr><td><code>.has-badge</code></td><td>On the anchor element — <code>position: relative</code>.</td></tr>
                    <tr><td><code>.badge-dot</code></td><td>8px dot, top-right, <code>--accent</code> (or <code>.warn</code>/<code>.danger</code>/<code>.ok</code>).</td></tr>
                    <tr><td><code>.badge-count</code></td><td>Small pill, <code>--accent</code> bg / <code>--on-accent</code> text, grows for 2+ digits. Same <code>.warn</code>/<code>.danger</code>/<code>.ok</code> variants as the dot.</td></tr>
                </table>

                <h2>Page-level classes</h2>
                <table class="sg">
                    <tr><th style="width:220px">Class</th><th>Description</th></tr>
                    <tr><td><code>.app-page</code></td><td>On &lt;body&gt; of workspace pages: 100vh flex column, no page scroll, user-select none (inputs re-enable it).</td></tr>
                    <tr><td><code>.workspace / .main-layout</code></td><td>Tool-page frame; .main-layout carries the 50px nav padding.</td></tr>
                    <tr><td><code>.sidebar</code></td><td>260px panel column, thin scrollbar.</td></tr>
                    <tr><td><code>.viewport</code></td><td>flex:1 canvas area on --viewport-bg (was #canvas-container).</td></tr>
                    <tr><td><code>.on-viewport</code></td><td>For any kit component placed ON the viewport ground (a drop zone over an empty canvas, a hint, a HUD-like panel): the viewport is <code>--viewport-bg</code> (black) in every theme, so the class re-seeds the neutrals from it and <code>--lift</code> and re-derives every token below — ink, lines, washes, glass, state-as-text read dark-ground correct even in the light theme. Seeds only, so a custom <code>--viewport-bg</code> still works.</td></tr>
                    <tr><td><code>canvas</code> / <code>canvas.natural</code></td><td>Every <code>&lt;canvas&gt;</code> fills its box (<code>width/height: 100% !important</code>) — the right default for a viewport. A canvas shown at its own aspect (a source preview, a thumbnail) takes <code>class="natural"</code>: intrinsic size, capped at the box width.</td></tr>
                    <tr><td><code>.pz-layer</code></td><td>absolute inset:0, transform-origin 0 0 — the layer sac.setupPanZoom() transforms.</td></tr>
                    <tr><td><code>#app-root</code></td><td>SPA mount point, nav padding included.</td></tr>
                </table>
                <p class="sg-note"><b>Reduced motion:</b> a global <code>prefers-reduced-motion</code>
                   query in <code>ui.css</code> collapses animation/transition durations app-wide, but it
                   does not pierce Shadow DOM — components with their own animations carry their own
                   query too.</p>

                <h2 id="responsive">Responsive — phones and touch</h2>
                <p>An app built only from the kit works on a 360px portrait phone without one media
                   query of its own. Desktop (≥ 1024px) is untouched: every rule below sits inside a
                   width or input-capability query.</p>
                <div class="sg-demo sg-row">
                    <button class="btn primary sg-only-wide" style="width:auto" data-sg-width="phone">Preview this guide at 375px</button>
                    <button class="btn primary sg-only-compact" style="width:auto" data-sg-drawer>Open this page's rail drawer</button>
                    <span class="sg-muted">This guide is the live example — on a phone its rail is the drawer.</span>
                </div>

                <h3 id="responsive-breakpoints">Breakpoints</h3>
                <p>Two fixed values, written out: a custom property cannot be used inside a media
                   query, so a token would only pretend to be configurable.</p>
                <table class="sg">
                    <tr><th style="width:220px">Name</th><th>Query</th><th>What changes</th></tr>
                    <tr><td><code>compact</code></td><td><code>(max-width: 768px), (max-height: 480px) and (pointer: coarse)</code></td><td>≤768px wide, <b>or</b> a short touch screen — a phone held sideways (844 × 390) is wide but far too short for the desktop layout. Copy the whole query when you need “compact”. The ribbon shows the app's name, the rail becomes a drawer, paddings shrink, <code>sac-dialog</code> becomes a bottom sheet, <code>sac-window</code> opens maximized.</td></tr>
                    <tr><td><code>narrow</code></td><td style="white-space:nowrap"><code>(max-width: 480px)</code></td><td>A second step, only where a component truly needs one.</td></tr>
                </table>

                <h3 id="responsive-queries">Page @media, component @container</h3>
                <p>The page reacts to the viewport. A component reacts to its own box, because it also
                   lives in a <code>sac-window</code> or a <code>sac-split</code> panel that is narrow on a wide screen.</p>
                <table class="sg">
                    <tr><th style="width:220px">Who</th><th>Reacts to</th></tr>
                    <tr><td>Page layout</td><td><code>@media</code> — <code>.main-layout</code>, the rail, <code>sac-nav</code>, dialogs, windows.</td></tr>
                    <tr><td>Components</td><td><code>container-type: inline-size</code> + <code>@container</code> on their own box.</td></tr>
                    <tr><td>Shadow components</td><td>Their own queries inside the shadow root — a light-DOM <code>@media</code> rule does not pierce it.</td></tr>
                </table>
                <p class="sg-note"><b>Containment caveat:</b> <code>inline-size</code> containment stops an
                   element sizing to its content. Put the container on an inner wrapper or a block-level,
                   full-width host — never on a shrink-to-fit host, which would collapse to 0.</p>
                ${code(`.my-card { container-type: inline-size; }        /* block-level: safe */
@container (max-width: 480px) {
    .my-card .row { flex-direction: column; }
}`)}

                <h3 id="responsive-ribbon">The phone ribbon</h3>
                <p>On compact the ribbon names the app in words and hands everything else to the
                   burger. This page's own ribbon is the live example.</p>
                <table class="sg">
                    <tr><th style="width:220px">Part</th><th>On compact</th></tr>
                    <tr><td>Ribbon</td><td>Burger + the app's name as text (<code>compact-title</code>) + the app's own controls, right-aligned. <code>brand</code>, <code>brand-icon</code> and the host jump do not show; the name truncates only after the toolbar has overflowed into “…”.</td></tr>
                    <tr><td><code>compact-title</code></td><td>Default: <code>brand</code> for a hosted app, else <code>app-name</code>, else <code>brand</code>. Set it where <code>app-name</code> is a version, not a name.</td></tr>
                    <tr><td>Menu open</td><td>The ribbon becomes the desktop title bar: the app's controls slide out to the right while the ⌂ host jump with the suite's name (truncates first; “Home” without a host label) and the app icon ease in before the app's name — colours, sizes and spacing are the desktop brand row's, so opening the menu changes no colour. That is where you are and the way home, so the panel drops its Home entry. An app with no burger shows the brand row all along. No “No sections yet.” on compact.</td></tr>
                    <tr><td>Panel</td><td>Always the rail recipe — solid <code>--panel</code>, hairlines, item pills — alone or stacked above the adopted rail.</td></tr>
                    <tr><td><code>sac-theme-toggle</code></td><td>In the context slot it collapses to one round button (see Toolbar overflow).</td></tr>
                </table>

                <h3 id="responsive-drawer">The rail drawer</h3>
                <p>On compact the nav <b>adopts</b> the app's rail and its burger opens it as an
                   off-canvas drawer — one burger, not two. The nav owns scrim, Escape,
                   swipe-left-to-close and the focus trap; there is nothing to wire.</p>
                <table class="sg">
                    <tr><th style="width:220px">API</th><th>Description</th></tr>
                    <tr><td><code>sac-nav rail</code></td><td>Which rail to adopt: a CSS selector, or <code>none</code>. Absent = the first <code>&lt;sac-sidebar&gt;</code> / <code>.sidebar</code> inside a <code>.main-layout</code> next to the nav. An empty <code>&lt;sac-sidebar&gt;</code> is adopted too — the burger appears the moment it gets items.</td></tr>
                    <tr><td><code>drawer</code></td><td>Set by the nav on the rail it adopted. Changes nothing above 768px. Without a nav, set it yourself.</td></tr>
                    <tr><td><code>open</code></td><td>Reflected: the drawer is out.</td></tr>
                    <tr><td><code>open() / close() / toggle()</code></td><td><code>&lt;sac-sidebar&gt;</code> methods — set or clear <code>[open]</code>.</td></tr>
                    <tr><td><code>sac:sidebar-toggle</code></td><td>Listened for on <code>window</code>; <code>detail { open }</code> optional. Drives a rail from any button.</td></tr>
                    <tr><td><code>sac:sidebar-open / -close</code></td><td>Fired by <code>&lt;sac-sidebar&gt;</code> whenever <code>[open]</code> changes.</td></tr>
                    <tr><td>Closing on navigation</td><td><code>&lt;sac-sidebar&gt;</code> closes on any item tap; a plain <code>.sidebar</code> on a tap on <code>a[href]</code> or <code>[data-drawer-close]</code>.</td></tr>
                    <tr><td><code>--drawer-width</code></td><td>Token: <code>min(300px, 85vw)</code> — the drawer, and the burger panel beside it.</td></tr>
                </table>
                ${code(`<sac-nav brand="MY TOOLS" brand-icon="cube" app-name="EDITOR"></sac-nav>
<div class="main-layout">
    <div class="sidebar">
        …controls…
        <button class="btn" data-drawer-close>Apply</button>   <!-- closes the drawer -->
    </div>
    <div class="viewport">…</div>
</div>

<!-- any other button, anywhere: -->
<button onclick="dispatchEvent(new CustomEvent('sac:sidebar-toggle'))">Settings</button>`)}

                <h3 id="responsive-burger">Who owns the burger</h3>
                <p>The burger is the <b>app's</b>. The kit ships the parts with today's behaviour as the
                   default; the app decides what goes in. Recommended setups:</p>
                <table class="sg">
                    <tr><th style="width:220px">App</th><th>Setup</th></tr>
                    <tr><td>Suite with a dashboard</td><td><code>host-nav="wide"</code>. On a phone the tile dashboard is the main level and the ⌂ in the open menu's ribbon leads back to it; the burger holds only the app itself. The desktop burger keeps the suite list.</td></tr>
                    <tr><td>Tool page</td><td>Nothing to set: the burger opens the rail.</td></tr>
                    <tr><td>Sections <em>and</em> a rail</td><td>If the rail lists the same sections: <code>sections-nav="wide"</code> — one list on the phone. If they differ (areas above, a folder list in the rail): they stack in one column, sections capped at 45dvh.</td></tr>
                    <tr><td>Burger for something else</td><td>Put it in the <code>panel</code> slot; <code>rail="none"</code> keeps the rail out; <code>open()</code> / <code>sac:nav-open</code> to drive and follow it.</td></tr>
                </table>
                ${code(`<sac-nav brand="SUITE" brand-icon="cube" app-name="NOTES" host-nav="wide">
    <div slot="panel">
        <label>Filter</label>
        <input type="search" placeholder="Search notes">
        <a href="#/account">Account</a>          <!-- a link closes the panel -->
    </div>
</sac-nav>`)}

                <h3 id="responsive-list-detail">List / detail — one panel at a time</h3>
                <p><code>&lt;sac-split collapse&gt;</code> shows one panel when <b>its own</b> width drops
                   to the threshold, with a back bar above the detail. Narrow the box: the split
                   measures itself, not the page.</p>
                <div class="sg-demo sg-col" style="max-width:none;">
                    <div class="sg-row">
                        <sac-segmented-control id="demo-ld-width" value="full">
                            <button data-value="360">360px</button>
                            <button data-value="600">600px</button>
                            <button data-value="full">Full</button>
                        </sac-segmented-control>
                        <span id="demo-ld-out" class="sg-muted"></span>
                    </div>
                    <div class="sg-ld-box" id="demo-ld-box">
                        <sac-split id="demo-ld" collapse="480px" position="36%" min-start="150px" min-end="200px">
                            <div slot="start" class="sg-ld-list" id="demo-ld-list">
                                <button type="button" data-role="Notes on the Analytical Engine">Ada Lovelace</button>
                                <button type="button" data-role="The first compiler">Grace Hopper</button>
                                <button type="button" data-role="Frequency hopping">Hedy Lamarr</button>
                                <button type="button" data-role="Computability">Alan Turing</button>
                            </div>
                            <div slot="end" class="sg-ld-detail" id="demo-ld-detail">
                                <span class="sg-muted">Pick someone from the list.</span>
                            </div>
                        </sac-split>
                    </div>
                </div>
                <table class="sg">
                    <tr><th style="width:220px">API</th><th>Description</th></tr>
                    <tr><td><code>collapse</code></td><td><code>compact</code> (768px, also a bare <code>collapse</code>), <code>narrow</code> (480px) or a px length. Absent = never collapses.</td></tr>
                    <tr><td><code>show</code></td><td><code>start</code> (default) | <code>end</code> — the panel a collapsed split shows. Set <code>end</code> when the user opens an item.</td></tr>
                    <tr><td><code>no-back / back-label</code></td><td>Hide the built-in back bar / set its text (default “Back”, key <code>split.back</code>).</td></tr>
                    <tr><td><code>back()</code></td><td>What the back bar does: show <code>start</code>, after <code>sac:split-back</code>.</td></tr>
                    <tr><td><code>sac:split-back</code></td><td>Cancelable — <code>preventDefault()</code> keeps the detail (unsaved changes).</td></tr>
                    <tr><td><code>sac:collapse</code></td><td><code>detail { collapsed }</code> — entered or left one-panel mode.</td></tr>
                </table>
                ${code(`<sac-split collapse position="30%">
    <ul slot="start">…</ul>
    <article slot="end">…</article>
</sac-split>

list.addEventListener("click", (e) => { showItem(e.target); split.show = "end"; });`)}

                <h3 id="responsive-overlays">Dialogs and windows</h3>
                <table class="sg">
                    <tr><th style="width:220px">Component</th><th>On compact</th></tr>
                    <tr><td><code>sac-dialog</code></td><td>A bottom sheet: full width above the home-bar inset, at most 85dvh with the body scrolling, actions full-width and stacked (primary on top). Focus trap and Escape unchanged.</td></tr>
                    <tr><td><code>sac-window</code></td><td>Always maximized below the nav — no drag, the maximize dot hidden, 44px traffic-light hit areas, an opaque ground (no blur). The component sets <code>compact</code> meanwhile; back on a wide screen the window returns to its rect.</td></tr>
                </table>
                <div class="sg-demo sg-row">
                    <button class="btn" style="width:auto" id="demo-resp-dialog">Open a dialog</button>
                    <button class="btn" style="width:auto" id="demo-resp-window">Open a window</button>
                </div>

                <h3 id="responsive-overflow">Toolbar overflow</h3>
                <p>When the nav's toolbar and host tools do not fit, the trailing buttons move behind
                   a “…” <code>&lt;sac-menu&gt;</code> — at any width, driven by a ResizeObserver. A menu
                   item clicks the original button, so its handlers run unchanged.</p>
                <table class="sg">
                    <tr><th style="width:220px">Rule</th><th>Description</th></tr>
                    <tr><td>Candidates</td><td><code>button</code> / <code>a</code> / <code>sac-menu</code> in the toolbar slot (or one wrapper deep) and the host tools, trailing first.</td></tr>
                    <tr><td>A folded <code>&lt;sac-menu&gt;</code></td><td>Folds as ONE item: its entries join the “…” menu as a group behind a separator, and choosing one fires the original menu's <code>sac:select</code> — the app's listener runs unchanged. So a “More ▾” menu goes before the primary button does.</td></tr>
                    <tr><td><code>data-overflow="never"</code></td><td>Keeps a control in the ribbon.</td></tr>
                    <tr><td><code>[data-sac-overflow]</code></td><td>Marks a parked button (hidden by ui.css) — it is never moved in the DOM.</td></tr>
                    <tr><td>Needs</td><td><code>sac-menu.js</code> loaded; without it nothing overflows. Menu label: key <code>nav.more</code>.</td></tr>
                    <tr><td>Theme toggle</td><td>Never parked: in the context slot on compact a <code>&lt;sac-theme-toggle&gt;</code> collapses to one round button first, so the pill does not push the app's toolbar out (<code>collapse="never"</code> opts out).</td></tr>
                </table>

                <h3 id="responsive-touch">Touch</h3>
                <p>Input capability, not width: a touch laptop gets the same rules as a phone.</p>
                <table class="sg">
                    <tr><th style="width:220px">Query</th><th>Rule</th></tr>
                    <tr><td><code>(pointer: coarse)</code></td><td>Every control gets a 44 × 44px <b>hit area</b> — not always a 44px look: small buttons keep their size and grow an invisible <code>::after</code> halo.</td></tr>
                    <tr><td><code>(pointer: coarse)</code></td><td>Text fields get <code>font-size: max(16px, 1rem)</code> — below 16px iOS zooms the page on focus.</td></tr>
                    <tr><td><code>(hover: none)</code></td><td>Nothing is reachable by hover alone. Anything revealed on hover is shown for good; sticky <code>:hover</code> lifts are neutralised.</td></tr>
                    <tr><td><code>.reveal-on-hover</code> + <code>.hover-reveal</code></td><td>The utility for quiet row actions: hidden until the row is hovered or focused, always shown on a touch screen.</td></tr>
                </table>
                <div class="sg-demo">
                    <ul class="sg-reveal-list">
                        <li class="reveal-on-hover"><span>Ada Lovelace</span>
                            <button class="icon-btn hover-reveal" title="Edit"><sac-icon name="pencil"></sac-icon></button>
                            <button class="icon-btn danger hover-reveal" title="Remove"><sac-icon name="trash"></sac-icon></button></li>
                        <li class="reveal-on-hover"><span>Grace Hopper</span>
                            <button class="icon-btn hover-reveal" title="Edit"><sac-icon name="pencil"></sac-icon></button>
                            <button class="icon-btn danger hover-reveal" title="Remove"><sac-icon name="trash"></sac-icon></button></li>
                    </ul>
                </div>
                ${code(`<li class="reveal-on-hover">
    Ada Lovelace
    <button class="icon-btn hover-reveal" title="Edit"><sac-icon name="pencil"></sac-icon></button>
</li>`)}

                <h3 id="responsive-safe-areas">Safe areas and dvh</h3>
                <p>The kit pads its nav, layouts and scroll regions by the <code>env(safe-area-inset-*)</code>
                   insets. They are 0 until the page opts into the full screen:</p>
                ${code(`<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">`)}
                <table class="sg">
                    <tr><th style="width:220px">Where</th><th>Inset</th></tr>
                    <tr><td><code>sac-nav</code></td><td>Grows by the top inset, pads its sides by left / right.</td></tr>
                    <tr><td><code>.main-layout</code>, <code>#app-root</code>, <code>.hub-container</code></td><td>Clear <code>50px + env(safe-area-inset-top)</code>.</td></tr>
                    <tr><td><code>.app-scroll</code>, the drawer, the sheet</td><td>Pad by the bottom (home-bar) inset.</td></tr>
                    <tr><td>Full-height layouts</td><td><code>100dvh</code> after a <code>100vh</code> fallback — dvh follows the mobile toolbar sliding in and out.</td></tr>
                </table>

                <h3 id="responsive-as-is">Left as they are, on purpose</h3>
                <table class="sg">
                    <tr><th style="width:220px">What</th><th>Why</th></tr>
                    <tr><td><code>sac-window</code> drag / resize</td><td>A desktop metaphor — on compact a window is always maximized instead.</td></tr>
                    <tr><td><code>sac-swatch-grid</code> columns</td><td>Kept at <code>columns</code>: it is the keyboard stride, and a palette's rows often mean something. Cells shrink; pick fewer columns for touch-first palettes.</td></tr>
                    <tr><td><code>sac-toast</code> <code>position</code></td><td>Ignored on compact — every stack sits at the bottom edge, where a thumb is.</td></tr>
                    <tr><td><kbd>mod</kbd>+<kbd>K</kbd></td><td>There is no such key on a phone. An app that wants the palette there gives it a button calling <code>sac.palette.open()</code>.</td></tr>
                    <tr><td><code>sac-tooltip</code></td><td>Long-press only on touch — undiscoverable by design, so a tooltip is never the only way to reach information.</td></tr>
                    <tr><td>Width preview in this guide</td><td>The frame reproduces width; <code>pointer</code> / <code>hover</code> follow the device, so touch rules are checked on a real phone or in DevTools device mode.</td></tr>
                </table>
            </div>
            `;
    }

    function wirePatterns(root) {
        // List/detail: a split that measures itself, so a narrower box — not
        // a narrower page — collapses it.
        const box = root.querySelector("#demo-ld-box");
        const ld = root.querySelector("#demo-ld");
        const ldOut = root.querySelector("#demo-ld-out");
        const detail = root.querySelector("#demo-ld-detail");
        const say = () => {
            ldOut.textContent = ld.collapsed
                ? `collapsed — showing ${ld.show === "end" ? "the detail" : "the list"}`
                : "wide — both panels";
        };
        root.querySelector("#demo-ld-width").addEventListener("sac:change", (e) => {
            box.style.maxWidth = e.detail.value === "full" ? "" : `${e.detail.value}px`;
        });
        root.querySelector("#demo-ld-list").addEventListener("click", (e) => {
            const btn = e.target.closest("button");
            if (!btn) return;
            root.querySelectorAll("#demo-ld-list button").forEach((b) => b.classList.toggle("active", b === btn));
            detail.replaceChildren(
                Object.assign(document.createElement("h4"), { textContent: btn.textContent }),
                Object.assign(document.createElement("p"), { textContent: btn.dataset.role }));
            ld.show = "end";
            say();
        });
        ld.addEventListener("sac:collapse", say);
        ld.addEventListener("sac:split-back", () => requestAnimationFrame(say));
        say();

        root.querySelector("#demo-resp-dialog").addEventListener("click", () => {
            sac.dialog.confirm({
                title: "Discard the draft?",
                message: "On a phone this is a bottom sheet, its actions stacked full-width.",
                buttons: [
                    { action: "keep", label: "Keep editing" },
                    { action: "discard", label: "Discard", kind: "destructive" },
                ],
            });
        });

        root.querySelector("#demo-resp-window").addEventListener("click", () => {
            let win = document.getElementById("sg-demo-compact-window");
            if (!win) {
                win = document.createElement("sac-window");
                win.id = "sg-demo-compact-window";
                win.setAttribute("title", "Compact window");
                win.setAttribute("width", "340px");
                win.setAttribute("height", "220px");
                win.setAttribute("left", `${Math.max((window.innerWidth - 340) / 2, 20)}px`);
                win.setAttribute("top", "160px");
                win.innerHTML = `<p>A 340 × 220 window on a desktop. At 768px and below it opens
                                    maximized under the nav, with no drag and no maximize dot.</p>`;
                document.body.appendChild(win);
                requestAnimationFrame(() => win.open());
            } else {
                if (win.hasAttribute("minimized")) win.restore();
                win.open();
            }
        });
    }

    /* --------------------------------------------------------- helpers --- */

    function helpersHtml() {
        return `
            <div class="sg-page">
                <h1>Helpers</h1>
                <p class="lead">
                    Everything on <code>window.sac</code> beyond the router, plus the vendored libraries.
                    All classic deferred scripts except the help loader (ES module).
                </p>

                <h2>Script load order</h2>
                ${code(`<!-- lib: globals FIRST, then the rest (defer preserves order) -->
<script defer src="kit/js/lib/globals.js"><\/script>
<script defer src="kit/js/lib/icons.js"><\/script>
<script defer src="kit/js/lib/router.js"><\/script>     <!-- SPA or nav registry -->
<script defer src="kit/js/lib/scope.js"><\/script>      <!-- optional: scoped workspaces -->
<script defer src="kit/js/lib/dialog.js"><\/script>     <!-- optional: confirm helper -->
<script defer src="kit/js/lib/pan-zoom.js"><\/script>   <!-- optional: viewports -->
<script defer src="kit/js/lib/apps.js"><\/script>       <!-- optional: app runtime + hub pages -->
<script defer src="kit/js/lib/hotkeys.js"><\/script>    <!-- optional: shortcuts + Ctrl-K palette -->
<script defer src="kit/js/lib/sortable.js"><\/script>   <!-- required by filmstrip + layer list -->
<script defer src="kit/js/lib/color.js"><\/script>      <!-- required by the color components -->
<!-- vendor (optional, for markdown): marked + purify -->
<!-- components in any order, then views -->`)}

                <p>Or load everything with one tag — <code>kit/js/all.js</code> injects the libs and every
                   component in order. Cherry-picking stays the recommended production path.</p>
                ${code(`<script src="kit/js/all.js"><\/script>`)}
                <p class="sg-note"><b>Booting with <code>all.js</code>:</b> it <em>injects</em> its scripts, and
                   injected scripts do <strong>not</strong> hold up <code>DOMContentLoaded</code> — so page
                   code that calls <code>sac.*</code> must not boot from that event. Wait for
                   <code>sac:ready</code> on <code>document</code> (fired once, after the last file settles),
                   and check the <code>window.sacReady</code> flag in case you missed it. Cherry-picked
                   <code>&lt;script defer&gt;</code> tags have no such caveat — the parser holds
                   <code>DOMContentLoaded</code> for them.</p>
                ${code(`function boot() { sac.apps.register(/* … */); sac.apps.init(); }
if (window.sacReady) boot();
else document.addEventListener("sac:ready", boot, { once: true });`)}

                <h2>sac.setupPanZoom — synchronized pan &amp; zoom</h2>
                <p>Cursor-anchored wheel zoom + drag pan, driving <em>multiple panes from ONE shared
                   transform</em>. Middle-drag always pans; double-click resets. Try it below:</p>
                <div class="sg-demo on-bg" style="padding:0;">
                    <div style="display:flex;gap:1px;">
                        <div class="sg-viewport-demo" id="pz-pane-a" style="flex:1;position:relative;background:var(--viewport-bg);border-radius:0;border:none;">
                            <div class="pz-layer" id="pz-layer-a"></div>
                            <sac-hud position="top-left" id="pz-hud">zoom 1.00</sac-hud>
                        </div>
                        <div class="sg-viewport-demo" id="pz-pane-b" style="flex:1;position:relative;background:var(--viewport-bg);border-radius:0;border:none;">
                            <div class="pz-layer" id="pz-layer-b"></div>
                        </div>
                    </div>
                </div>
                ${code(`const pz = sac.setupPanZoom({
    panes: [
        { pane: paneA, layer: layerA },
        { pane: paneB, layer: layerB },   // any number of panes, one transform
    ],
    minScale: 0.2, maxScale: 24,
    enabled: () => mode === "pan",        // optional gate (middle-drag ignores it)
    onChange: (scale) => hud.textContent = \`zoom \${scale.toFixed(2)}\`,
});
pz.reset();                               // e.g. when a new image loads`)}
                <p>Each layer must fill its pane — the kit's <code>.pz-layer</code> class does exactly that.
                   <code>enabled()</code> returning false hands wheel, drag <em>and</em> touch to an edit tool.
                   <code>.viewport.grabbing</code> (ui.css) shows the grabbing cursor while a pan runs.</p>
                ${compact(`one finger pans, two fingers pinch-zoom around their midpoint (and pan with it), a double-tap
                   resets. The pane gets <code>touch-action: none</code>, so the gesture stays inside it — page scroll
                   and page zoom are untouched everywhere else.`)}

                <h2 id="sac-sortable">sac.sortable — drag to reorder</h2>
                <p>Pointer-based drag-to-reorder for any list of elements — the engine under
                   <code>&lt;sac-filmstrip reorderable&gt;</code> and <code>&lt;sac-layer-list&gt;</code>, usable on
                   plain markup too. The dragged item travels through the list and its slot opens as a live gap;
                   on drop it stays there and <code>onReorder(from, to)</code> reports the move once. Works inside
                   shadow roots (nothing is moved out of the container). Keyboard reordering is the component's
                   job — the helper is pointer-only.</p>
                <div class="sg-demo">
                    <ul id="demo-sortable" class="sg-sortable" style="list-style:none;margin:0;padding:0;display:flex;gap:6px;flex-wrap:wrap;">
                        <li class="sg-chip-item"><sac-chip label="Alpha"></sac-chip></li>
                        <li class="sg-chip-item"><sac-chip label="Bravo"></sac-chip></li>
                        <li class="sg-chip-item"><sac-chip label="Charlie"></sac-chip></li>
                        <li class="sg-chip-item"><sac-chip label="Delta"></sac-chip></li>
                        <li class="sg-chip-item"><sac-chip label="Echo"></sac-chip></li>
                    </ul>
                    <span id="demo-sortable-state" style="color:var(--text-muted);font-size:0.85rem;">drag a chip</span>
                </div>
                ${table("Option", [
                    ["items", "Selector for the draggable children of <code>container</code>. Default <code>*</code>."],
                    ["handle", "Optional selector — only this part starts a drag. On touch a handle drags at once (it gets <code>touch-action: none</code>); without one a drag needs a 250ms long-press, so a swipe keeps scrolling."],
                    ["axis", "<code>\"y\"</code> (default), <code>\"x\"</code> or <code>\"grid\"</code> (wrapping rows — nearest item decides)."],
                    ["onReorder(from, to)", "Called once on drop, only if the index changed. Mirror with <code>arr.splice(to, 0, ...arr.splice(from, 1))</code>."],
                    ["disabled", "Boolean or function returning one — e.g. <code>() =&gt; editing</code>."],
                    ["ignore", "Presses starting here never drag. Default <code>input, textarea, select, [contenteditable], [data-sortable-ignore]</code>."],
                ])}
                ${table("Returns", [["{ destroy() }", "Removes every listener (and puts back an item mid-drag)."]])}
                ${table("Interaction", [
                    ["Mouse / pen", "Press and move 4px to lift — a plain click stays a click; the click after a drop is eaten."],
                    ["Touch", "250ms long-press without moving (or the handle) lifts; moving first is a scroll."],
                    ["Escape", "Cancels the drag and puts the item back — no callback."],
                    ["Edges", "The nearest scrolling ancestor (across shadow roots) auto-scrolls near its edge."],
                    ["Styling", "The item in flight carries <code>data-sortable-dragging</code> — give it a lift (<code>box-shadow: var(--shadow-2)</code>)."],
                ])}
                ${code(`sac.sortable(listEl, {
    items: "li",
    axis: "grid",
    onReorder(from, to) { tags.splice(to, 0, ...tags.splice(from, 1)); save(tags); },
});`)}

                <h2>Toolbars — no projection, by design</h2>
                <p><strong>The app owns its top area.</strong> There is no <code>sac.toolbar</code>:
                   a view that has actions draws its own toolbar row (the <code>.toolbar</code>
                   recipe) inside its own markup — see Orb Lab for the shape — and registers the
                   actions it wants keyboard-reachable on <code>sac.commands</code>, which the
                   command palette lists. The direction is inverted, not the capability: a host
                   still puts suite-wide controls into every app — a signed-in user, a suite
                   action — but as <em>data</em>, through <code>context.host.toolbar</code>, and
                   the app's own nav renders them at the right end of its ribbon
                   (<code>nav.host = context.host</code>). Cross-app navigation travels the same
                   way: <code>context.host.nav</code> becomes a host group in the app's burger
                   panel. The host never paints into the app's chrome.</p>

                <h2>Rails — the app's own, like everything else</h2>
                <p>There is no <code>sac.sidebar</code> global and no rail projection: an app puts
                   <code>&lt;sac-sidebar&gt;</code> in its <em>own</em> markup and assigns the
                   <code>items</code> property (shape and demo on the
                   <a href="#/styleguide/components">Components</a> page). The rail is for
                   <b>navigation</b> — links built with <code>context.href(route)</code>; sliders
                   and colour fields belong in the content area. What a host contributes to an
                   app's chrome arrives as <code>context.host</code> and is rendered by the app's
                   own <code>&lt;sac-nav&gt;</code> (<code>nav.host = context.host</code> — jump,
                   suite nav in the burger, toolbar controls in the ribbon).</p>
                ${code(`this._rail.items = [
    { section: "Reference" },                                  // a heading
    { label: "Tokens",  icon: "star",  href: ctx.href("tokens"), active: true },
    { label: "Rebuild", icon: "sync",  onClick: () => rebuild() },
    { label: "Export",  icon: "download", disabled: true },
];`)}

                <h2>sac.dialog — confirm + info helpers</h2>
                <p>Promise wrappers over <code>&lt;sac-dialog&gt;</code>:
                   <code>confirm()</code> asks a question, <code>info()</code> announces —
                   one button (label default <code>"OK"</code>), no answer to carry. Both take
                   <code>message</code> as a string or an array of paragraphs, always rendered
                   via <code>textContent</code>. See the
                   <a href="#/styleguide/components">Components</a> page for the live demo and the armed-button rules.</p>

                <h2>sac.apps — apps as web components</h2>
                <p>The <b>host</b> side of the app contract: a registry of manifests, the stage for
                   view apps, floating windows for window apps, hash and <code>?app=</code> deep
                   links, and the <code>mount(context)</code> handshake. An app is ONE custom element
                   in ONE classic script — register a manifest, call <code>init()</code>, done.
                   <code>&lt;sac-launcher&gt;</code> (see
                   <a href="#/styleguide/components">Components</a>) renders the registry as a tile grid.</p>
                <p class="sg-note">Writing an app rather than hosting one? <a href="#/build">Build an
                   App</a> walks the whole path — the three hooks, the manifest, publishing to Pages
                   and installing by URL — and <code>sac.app</code> below is the toolkit it uses.</p>
                ${code(`sac.apps.register({
    id:          "color-bucket",         // unique; ?app= deep links + persistence key
    name:        "Color Bucket",         // display name
    icon:        "palette",              // sac-icon name
    description: "Mix and manage colors",
    kind:        "window",               // or "page" + href
    tag:         "app-color-bucket",     // the app's single custom element
    src:         "apps/color-bucket.js", // classic script, injected on first open
    width:       "520px", height: "640px",
    accent:      "#10b981",              // optional per-app accent on its window
});
sac.apps.init();                   // [data-app] tiles + ?app= deep links
sac.apps.open("color-bucket");     // or open programmatically`)}
                <table class="sg">
                    <tr><th style="width:260px">Method</th><th>Description</th></tr>
                    <tr><td><code>register(manifest)</code></td><td>Upsert by <code>id</code> — re-register replaces, first registration fixes list order. Emits <code>sac:apps-changed</code> on <code>document</code>.</td></tr>
                    <tr><td><code>list()</code></td><td>Array of manifest copies, registration order.</td></tr>
                    <tr><td><code>get(id)</code></td><td>Manifest copy or <code>null</code>.</td></tr>
                    <tr><td><code>open(id, params?, opts?)</code></td><td><code>Promise&lt;HTMLElement&gt;</code> (the app element). <code>opts { route, accent }</code> is what a launcher tile carries: <code>route</code> opens a view at <code>#/&lt;id&gt;/&lt;route&gt;</code>, <code>accent</code> seeds the app's <code>--accent</code> (tile color = app highlight). <code>kind:"page"</code> navigates to <code>href</code> (params appended, promise never resolves). <code>kind:"window"</code> injects <code>src</code> once (keyed by src), awaits <code>customElements.whenDefined(tag)</code>, shows the app in a centered, cascaded <code>&lt;sac-window&gt;</code> that stays in the DOM and is re-opened later (minimized → restored). Rejects on script-load failure (console.error + error toast).</td></tr>
                    <tr><td><code>close(id)</code></td><td>Closes the window — element and window stay in the DOM.</td></tr>
                    <tr><td><code>remove(id)</code></td><td>Unregister; calls the app's <code>unmount()</code> if present and removes its window. Emits <code>sac:apps-changed</code>.</td></tr>
                    <tr><td><code>isOpen(id)</code></td><td><code>true</code> if the app's window exists and is open.</td></tr>
                    <tr><td><code>active()</code></td><td>The id of the view app currently on the stage, or <code>null</code> at home.</td></tr>
                    <tr><td><code>init(options?)</code></td><td>Delegated click binding for <code>[data-app="&lt;id&gt;"]</code> tiles + the <code>?app=&lt;id&gt;</code> deep link (URL cleaned via replaceState), and — with <code>{ viewHost, home }</code> — the hash router for view apps. Legacy: <code>[data-overlay]</code> and <code>?tool=</code> honored the same way.</td></tr>
                    <tr><td><code>inspect(url)</code></td><td><code>Promise&lt;manifest&gt;</code>. Fetches and validates a manifest from a repository URL, an origin or a direct <code>app.json</code>; <code>github.com/owner/repo</code> resolves to <code>owner.github.io/repo/app.json</code>. <b>Reads only</b> — nothing is registered and no app code runs, so a host can show name, version and origin before deciding. Adds <code>src</code>, <code>origin</code> and <code>manifestUrl</code>.</td></tr>
                    <tr><td><code>add(manifest|url)</code></td><td><code>Promise&lt;manifest&gt;</code>. Registers an inspected manifest (or inspects a URL first). Registering still does not run the app: its script is injected on first open, exactly like an app the shell declared itself.</td></tr>
                </table>
                <h3>Hosting view apps</h3>
                <p>A shell that wants full-stage apps hands <code>init()</code> two elements — the
                   stage view apps are appended into, and the home screen to hide while one is up —
                   plus its <code>host</code> package, injected into every app as
                   <code>context.host</code>: the jump home, the suite's navigation (rendered as a
                   host group in each app's burger panel) and the host's toolbar controls (rendered
                   at the right end of each app's ribbon — entries take <code>href</code> or
                   <code>onClick</code>, so a signed-in user chip lives here). From there
                   <code>#/&lt;id&gt;</code> shows an app and
                   <code>#/&lt;id&gt;/&lt;route&gt;</code> reaches into it; the back button, pasted
                   links and rail clicks all go through the same path.</p>
                ${code(`sac.apps.init({
    viewHost: "#app-stage",
    home:     "#app-home",
    host: {
        name: "MY SUITE", icon: "cube", href: "#/",
        nav: [                             // the suite, in every app's burger
            { label: "Notes",  href: "#/notes",  icon: "document" },
            { label: "Bucket", href: "#/bucket", icon: "palette"  },
        ],
        toolbar: [                         // suite controls, in every ribbon
            { icon: "user", label: "Ada Lovelace", onClick: () => openAccount() },
        ],
    },
});

// #/notes          → mounts <app-notes> on the stage, hides the home screen
// #/notes/2026-08  → same, and hands "2026-08" to the app as context.route
// #/               → back home, the app element stays alive for next time`)}
                <p>A view app is created once and kept: switching away hides it, switching back
                   shows it exactly as it was. <code>mount()</code> runs when it first reaches the
                   stage — not while it is still hidden — and <code>unmount()</code> only when
                   <code>remove()</code> takes the app out for good.</p>
                <table class="sg">
                    <tr><th style="width:260px">Manifest field</th><th>Description</th></tr>
                    <tr><td><code>id</code></td><td>Unique; <code>?app=</code> deep links + persistence key.</td></tr>
                    <tr><td><code>name</code></td><td>Display name (window title / tile heading).</td></tr>
                    <tr><td><code>icon</code></td><td><code>sac-icon</code> name for the tile.</td></tr>
                    <tr><td><code>description</code></td><td>Tile subline (optional).</td></tr>
                    <tr><td><code>badge</code></td><td>Optional: short string, rendered by <code>&lt;sac-launcher&gt;</code> as the tile's corner pill (the global <code>.tile-badge</code> pattern).</td></tr>
                    <tr><td><code>tile</code></td><td>Optional tile footprint in the launcher grid: <code>"medium"</code> (default, omit-able), <code>"wide"</code> (2 columns) or <code>"large"</code> (2 columns × 2 rows). Unknown values fall back to medium silently; all footprints collapse to medium on narrow viewports.</td></tr>
                    <tr><td><code>kind</code></td><td><code>"window"</code> (floating overlay, default), <code>"view"</code> (takes the stage at <code>#/&lt;id&gt;</code>) or <code>"page"</code> (plain link to <code>href</code>).</td></tr>
                    <tr><td><code>entry</code></td><td>Installed apps: the script path <em>relative to the manifest</em>. <code>inspect()</code> resolves it into <code>src</code>. A shell registering its own apps gives <code>src</code> directly.</td></tr>
                    <tr><td><code>nav</code></td><td>view only: <code>false</code> keeps the app out of the nav panel (it stays reachable by hash).</td></tr>
                    <tr><td><code>palette</code></td><td>view only: <code>false</code> keeps the app out of the Ctrl-K palette. Otherwise it lists under <b>Apps</b> (not Views) — a host lists its window apps there too, so users see one Apps section.</td></tr>
                    <tr><td><code>tag</code>, <code>src</code></td><td>window + view: the app's single custom element + its classic script, injected once on first open. The script guards its definition with <code>customElements.get</code> and registers no other tags; the element fills its window (<code>height: 100%</code> is set for you).</td></tr>
                    <tr><td><code>width</code>, <code>height</code></td><td>window only: <code>sac-window</code> size (defaults 500px / 600px).</td></tr>
                    <tr><td><code>accent</code></td><td>window + view, optional: set as <code>--accent</code> on the window / view element — the per-app retheme. A tile's own accent (see <code>tiles</code>) wins for the open it triggers.</td></tr>
                    <tr><td><code>tiles</code></td><td>Optional: an array of launcher tiles for ONE app — complex apps deploy several entry points. When present it <b>replaces</b> the default tile. Each entry may override <code>name</code>/<code>icon</code>/<code>description</code>/<code>badge</code>/<code>tile</code> and adds <code>route</code> (views: opens <code>#/&lt;id&gt;/&lt;route&gt;</code>), <code>params</code> (windows), and <code>accent</code> — the tile's color, which also becomes the app's highlight when opened through that tile (tile color = app identity, the Windows-Phone move). Give entries a stable <code>id</code> so user layouts survive reordering.</td></tr>
                    <tr><td><code>controls</code>, <code>resizable</code></td><td>window only, optional: <code>controls</code> = space-separated subset of <code>min max close</code> (window chrome); <code>resizable: false</code> sets <code>no-resize</code>. Absent = all three dots, resizable.</td></tr>
                    <tr><td><code>href</code></td><td>page only: the tile becomes a normal link.</td></tr>
                </table>
                <h3>mount(context) — the capability handshake</h3>
                <p>The host calls <code>el.mount(context)</code> IF the method exists — exactly once
                   per element lifetime, when the app first reaches the screen (a window opening,
                   a view reaching the stage; re-opening or switching back does not re-mount).
                   <code>el.unmount()</code> (if present) is called only by
                   <code>sac.apps.remove()</code>. Both hooks are opt-in — and
                   <code>sac.app.Element</code> below turns them into <code>onMount</code> /
                   <code>onUnmount</code> that also work with no host at all.</p>
                <table class="sg">
                    <tr><th style="width:260px">Context slot</th><th>Description</th></tr>
                    <tr><td><code>appId</code></td><td>The manifest id.</td></tr>
                    <tr><td><code>params</code></td><td><code>URLSearchParams</code> — deep-link params snapshot at open (empty if none).</td></tr>
                    <tr><td><code>route</code> <b>(view)</b></td><td>The sub-route the app was opened at — everything after <code>#/&lt;id&gt;/</code>, <code>""</code> at the app's root.</td></tr>
                    <tr><td><code>onRoute(cb)</code> <b>(view)</b></td><td><code>cb(route)</code> on every change: rail clicks, the back button and pasted links all arrive here. Returns an unsubscribe.</td></tr>
                    <tr><td><code>href(route)</code> <b>(view)</b></td><td>Builds <code>#/&lt;id&gt;/&lt;route&gt;</code>. Apps must never assemble that string themselves — the host owns the address space, and standalone there is no id.</td></tr>
                    <tr><td><code>host</code> <b>(view)</b></td><td><code>{ name, icon, href, nav, toolbar }</code> — the host's package, from <code>init({ host })</code>; <code>null</code> when the host declared none and always <code>null</code> standalone. One line in <code>mount()</code>: <code>this._nav.host = context.host</code> — the app's own nav renders the host + app title segments, the suite nav in its burger and the host controls in its ribbon. The host supplies data; it never paints into the app's chrome.</td></tr>
                    <tr><td><code>deepLink.set(…)</code></td><td>view: <code>set(route)</code> writes <code>#/&lt;id&gt;/&lt;route&gt;</code> (replaceState — switching sections is not a new history entry). window/page: <code>set(obj)</code> writes <code>?app=&lt;id&gt;&amp;&lt;obj entries&gt;</code>; <code>set(null)</code> cleans back to the bare path (hash preserved).</td></tr>
                    <tr><td><code>theme.get()</code></td><td>The flag: <code>"dark"</code> | <code>"light"</code> | <code>"auto"</code>.</td></tr>
                    <tr><td><code>theme.set(mode)</code></td><td>Same values; routes through <code>&lt;sac-theme-toggle&gt;</code> when present (one source of truth: <code>data-theme</code> on <code>&lt;html&gt;</code> + the <code>sac-theme</code> localStorage key).</td></tr>
                    <tr><td><code>theme.onChange(cb)</code></td><td><code>cb(resolved)</code> with <code>"dark"</code>/<code>"light"</code> on every effective change, incl. OS flips in auto. Returns an unsubscribe function.</td></tr>
                    <tr><td><code>fs</code></td><td>Storage scoped to this app — see <code>sac.fs</code> below. <code>null</code> when the host did not load <code>lib/fs.js</code>, so an app checks before reaching for it.</td></tr>
                    <tr><td><code>identity</code></td><td>Who is at this desktop — see <code>sac.identity</code> below. Read-only for apps, and <code>null</code> when the host granted none.</td></tr>
                    <tr><td><code>files</code></td><td>The <b>user's</b> files — <code>open()</code> / <code>save()</code> / <code>kind</code>, see <code>sac.files</code> below. Where they live is the host's decision; <code>null</code> when the host did not load <code>lib/files.js</code>.</td></tr>
                    <tr><td><code>lang</code></td><td>The page's language: <code>get()</code> → <code>"en"</code>, <code>"de"</code>, … and <code>onChange(cb)</code> → unsubscribe. <b>Read-only</b> — the host owns the switch, like the theme. Render your strings with <code>sac.t()</code> and re-render them in the callback; see <code>sac.lang</code> below.</td></tr>
                    <tr><td><code>setDirty(flag)</code></td><td><code>true</code> while the app holds work that is not saved. Leaving or reloading the page then asks first, <code>sac.apps.isDirty(id)</code> answers for a host that is about to remove the app, and <code>document</code> gets <code>sac:dirty</code> <code>{ id, dirty }</code> (a taskbar dot). Closing a window never asks — the window stays in the DOM and loses nothing. Standalone it arms the same leave-page question.</td></tr>
                </table>
                ${code(`mount(context) {
    this._ctx = context;                         // once per element lifetime
    context.deepLink.set({ view: "mixer" });     // ?app=color-bucket&view=mixer
    this._offTheme = context.theme.onChange((resolved) => { /* dark|light */ });
}
unmount() { this._offTheme?.(); }                // called by sac.apps.remove()`)}
                <p class="sg-note"><b>Deprecated:</b> <code>sac.launcher</code>, the former name of
                   this API, survives as a thin alias — <code>register</code>/<code>open</code>/<code>init</code>
                   forward to <code>sac.apps</code> unchanged, legacy specs (<code>title</code>,
                   missing <code>kind</code>) keep working. Removal is a future major.</p>

                <h2>sac.app — the app side</h2>
                <p>Where <code>sac.apps</code> is the host, <code>sac.app</code> is what an app is
                   written with. It removes the four pieces of boilerplate every app would otherwise
                   repeat: finding its own folder, loading its stylesheet once, guarding its
                   <code>define()</code>, and running when there is no host to mount it.</p>
                ${code(`(function () {
    const BASE = sac.app.base();          // this script's folder, at parse time

    class AppMyApp extends sac.app.Element {
        build() {                          // once, on first connect
            sac.app.styles(BASE + "app.css", "app-my-app-css");
            this.innerHTML = \`<h2>My App</h2>\`;
        }
        onMount(context) {                 // once, when really on screen
            this._off = context.theme.onChange((t) => this.dataset.theme = t);
        }
        onUnmount() {                      // the host removed the app
            if (this._off) { this._off(); this._off = null; }
        }
    }

    sac.app.define("app-my-app", AppMyApp);
})();`)}
                <table class="sg">
                    <tr><th style="width:260px">Member</th><th>Description</th></tr>
                    <tr><td><code>sac.app.base()</code></td><td>The folder this script was loaded from, with a trailing slash — wherever a host injected it from. Call it at <b>parse time</b>, at the top of your IIFE: <code>document.currentScript</code> is only your file there.</td></tr>
                    <tr><td><code>sac.app.styles(href, id)</code></td><td>Injects a <code>&lt;link&gt;</code> into <code>&lt;head&gt;</code> once per document, keyed by <code>id</code> — however often the app is created, and however many apps share a page.</td></tr>
                    <tr><td><code>sac.app.define(tag, class)</code></td><td>Guarded <code>customElements.define</code>: defining twice (two hosts, one document) is a no-op instead of a throw.</td></tr>
                    <tr><td><code>sac.app.Element</code></td><td>Base class over <code>HTMLElement</code>. Adds the <code>sac-app</code> class (which scopes the kit's derived tokens, so a per-app <code>--accent</code> re-derives correctly), calls <code>build()</code> once on first connect, and turns the host's <code>mount()</code>/<code>unmount()</code> into <code>onMount(context)</code>/<code>onUnmount()</code>.</td></tr>
                    <tr><td><code>sac.app.context(el)</code></td><td>The standalone context, built from the page. <code>Element</code> calls it for you — you would only call it by hand in an app that stays a plain <code>HTMLElement</code>.</td></tr>
                </table>
                <p class="sg-note">Extending <code>Element</code> is sugar, not law. An app may
                   implement <code>mount()</code> / <code>unmount()</code> by hand and stay a plain
                   <code>HTMLElement</code>. What is not optional: one registered tag, a guarded
                   define, and no second tag.</p>
                <h3>The standalone fallback</h3>
                <p>An app that is never mounted by a host — opened straight from its own
                   <code>index.html</code>, or dropped into somebody's page as plain markup — still
                   gets an <code>onMount</code>. If no <code>mount()</code> arrives right after
                   connect, <code>sac.app.Element</code> builds a context from the page itself: the
                   kit's real theme (<code>sac.apps.theme</code> when it is loaded, the same rules
                   read-only when it is not), the page's query parameters, the hash as
                   <code>route</code>, an <code>href</code> that addresses that hash directly, and a
                   <code>sidebar</code> that drives the page's <code>&lt;sac-sidebar&gt;</code> if it
                   has one and does nothing if it does not. Your app cannot tell the difference and
                   never needs an "am I hosted?" branch.</p>
                <p class="sg-note">The fallback is scheduled with a <b>timeout</b>, deliberately —
                   not <code>requestAnimationFrame</code>, which never fires in a background tab.
                   An app opened in a tab you have not looked at yet must still be running when you
                   get there.</p>

                <h2>sac.fs — storage behind context.fs</h2>
                <p>An app never touches <code>localStorage</code> directly: it gets a handle scoped
                   to itself as <code>context.fs</code>. Three properties make that worth the layer —
                   every path lives under <code>sac.fs/&lt;appId&gt;/</code>, so two apps cannot collide
                   on <code>"settings"</code>; every method is a <b>Promise</b>, even though the
                   default backend answers immediately; and the bytes go through a four-method
                   backend a host can replace without any app noticing.</p>
                ${code(`await context.fs.write("notes/2026-08", { title: "…", body: "…" });
const note  = await context.fs.read("notes/2026-08", null);   // fallback if absent
const paths = await context.fs.list("notes/");                 // app-relative, sorted
await context.fs.remove("notes/2026-08");`)}
                <table class="sg">
                    <tr><th style="width:260px">Method</th><th>Description</th></tr>
                    <tr><td><code>read(path, fallback = null)</code></td><td>The stored value, or <code>fallback</code> when the path is absent. Unreadable JSON warns and returns the fallback too — corrupt data is not worth crashing an app over.</td></tr>
                    <tr><td><code>write(path, value)</code></td><td>Stores any JSON-serializable value — or a <b>Blob</b> (a File is one), see below. <b>Rejects</b> when there is no room left, or when the value is a function, a symbol or <code>undefined</code> — quota is the one failure an app can act on, so it arrives as a rejection rather than a swallowed console line.</td></tr>
                    <tr><td><code>remove(path)</code></td><td>Deletes one path.</td></tr>
                    <tr><td><code>list(prefix = "")</code></td><td>App-relative paths, sorted. <code>list("notes/")</code> is how a collection is enumerated.</td></tr>
                    <tr><td><code>stat(path)</code></td><td><code>{ path, name, type, size, modified, binary }</code> or <code>null</code> — what a file list shows without reading the bytes. JSON entries carry no timestamp (<code>modified: null</code>).</td></tr>
                    <tr><td><code>clear()</code></td><td>Deletes everything this app stored — and only what this app stored.</td></tr>
                    <tr><td><code>usage()</code></td><td><code>{ bytes, count }</code>. A host uses this to show what an app is keeping, or to offer deleting it.</td></tr>
                    <tr><td><code>watch(cb)</code></td><td><code>cb(path, value)</code> on every change, <code>value === null</code> for a delete — including writes from <b>another tab</b> of the same origin. Returns an unsubscribe.</td></tr>
                </table>
                <p>Paths are slash-separated strings; leading, trailing and empty segments are
                   stripped, and <code>..</code> is not a way out of the app's own root.</p>
                <h3>Binary files</h3>
                <p>Write a <b>Blob</b> and it is stored as bytes, not as JSON: the entry keeps a small
                   stub (<code>{ "$sac.blob": { type, size, modified } }</code>) and the bytes live beside
                   it — in IndexedDB for the default backend. So <code>list()</code>, <code>usage()</code>
                   and <code>watch()</code> treat a PNG like any other entry, it costs what a PNG costs,
                   and localStorage's few megabytes are not the ceiling. <code>read()</code> hands it back
                   as a <b>File</b> — <code>name</code> is the last path segment,
                   <code>lastModified</code> when it was written. Raw bytes go in a Blob first.</p>
                ${code(`const png = await new Promise((r) => canvas.toBlob(r, "image/png"));
await context.fs.write("sprites/hero.png", png);
const file = await context.fs.read("sprites/hero.png");     // File, type "image/png"
const img  = await createImageBitmap(file);`)}
                <p class="sg-note"><b>Not every app needs it.</b> <code>context.fs</code> is for what
                   belongs to an app <em>on this host</em> — settings, drafts, a local collection. An
                   app that needs a database has its own backend and talks to it with
                   <code>fetch</code>, which is entirely outside the kit's business. The rule is only
                   this: <b>if you are storing locally, store through <code>context.fs</code></b>
                   rather than <code>localStorage</code>. Server data from your API and per-device
                   preferences in <code>context.fs</code> mix freely in the same app.</p>
                <h3>Swapping the backend</h3>
                <p>The namespacing, JSON and notification layers are the kit's. The bytes are four
                   methods, and a host that wants IndexedDB, the File System Access API or a server
                   replaces them once — apps keep their code.</p>
                ${code(`sac.fs.backend = {
    get(key),          // → string | null   (a Promise is fine)
    set(key, value),   // string
    del(key),
    keys(prefix),      // → string[]
    // optional — where Blobs go. Without them bytes ride inline in the
    // stub as a data: URL: correct, only larger.
    getBlob(key), setBlob(key, blob), delBlob(key),
};`)}
                <h3>Host side</h3>
                <p><code>sac.fs.for(id)</code> is also how a <b>host</b> reaches an app's data without
                   being that app: what an app keeps (<code>usage()</code>) and offering to delete it
                   (<code>clear()</code>) when the app is uninstalled. Deleting an app's data is a
                   separate decision from removing the app — SACRVM DESKTOP asks, and keeps the data
                   by default, so reinstalling brings your notes back.</p>
                ${code(`const ids = await sac.fs.apps();             // ids that stored something
const { bytes } = await sac.fs.for("notes").usage();
await sac.fs.for("notes").clear();           // on an explicit "delete its data"`)}
                <p><code>sac.fs.apps()</code> is host-only in spirit: an app only ever sees its own
                   drawer. A host needs the list, or the data of an app somebody uninstalled a year
                   ago is unreachable and unaccountable.</p>
                <p><code>sac.fs.shared(name)</code> is the same handle over a space that belongs to
                   <em>no</em> app (<code>sac.shared/&lt;name&gt;/</code>) — which is why
                   <code>apps()</code> never lists it. The user's files live in
                   <code>shared("files")</code>; who may reach a space is the host's call.</p>
                <p class="sg-note">Standalone, the same handle comes from the app's tag with the
                   <code>app-</code> prefix removed (<code>&lt;app-notes&gt;</code> → <code>notes</code>).
                   Follow the template's naming — <code>tag = "app-" + id</code> — and an app keeps
                   its data when it moves from its own page onto a desktop.</p>

                <h2 id="sac-files">sac.files — the user's files</h2>
                <p><code>context.fs</code> is an app's private drawer. <code>sac.files</code> is the
                   other thing every editor needs: <b>Open…</b> and <b>Save as…</b> on files that belong
                   to the person, not to the app. Where they live is the <b>host's</b> decision — the
                   device, the desktop's own file space, a server — and the app never knows which.</p>
                <div class="sg-demo sg-row">
                    <button class="btn" style="width:auto" id="demo-files-open">Open…</button>
                    <button class="btn primary" style="width:auto" id="demo-files-save">Save as…</button>
                    <button class="btn" style="width:auto" id="demo-files-resave" disabled>Save</button>
                    <span id="demo-files-result" style="color:var(--text-muted);font-size:0.85rem;"></span>
                </div>
                <p class="sg-note">The demo runs on <code>sac.files.virtual()</code> over a demo space —
                   the same dialog a desktop shows. Its “this device” link goes to your real disk.</p>
                ${code(`const picked = await context.files.open({ accept: ".png,image/*" });
if (picked) this.load(picked.file);                     // a File

let doc = await context.files.save(blob, { name: "hero.png" });   // Save as…
if (doc) doc = await context.files.save(blob, { handle: doc.handle });   // Save`)}
                <table class="sg">
                    <tr><th style="width:260px">Member</th><th>Description</th></tr>
                    <tr><td><code>open(opts)</code></td><td><code>{ accept, multiple, title }</code> → a FileRef, an array of them with <code>multiple</code>, or <code>null</code> when cancelled. <code>accept</code> is the <code>&lt;input accept&gt;</code> grammar (<code>".png,image/*"</code> or an array).</td></tr>
                    <tr><td><code>save(data, opts)</code></td><td><code>data</code>: a Blob, a string (<code>text/plain</code>) or any JSON value (<code>application/json</code>). <code>{ name, type, accept, handle, title }</code> → a FileRef or <code>null</code>. With a <code>handle</code> the same file is overwritten <b>without a dialog</b> — that is “Save”; without, it is “Save as…”.</td></tr>
                    <tr><td><code>kind</code></td><td>Who answers: <code>"browser"</code>, <code>"virtual"</code> or a host's own — for wording (“Downloaded” vs “Saved”), never for branching logic.</td></tr>
                    <tr><td><code>use(provider)</code> <b>(host)</b></td><td>Install a provider; <code>null</code> restores the browser default.</td></tr>
                    <tr><td><code>forApp()</code> <b>(host)</b></td><td>The view handed to apps as <code>context.files</code> — <code>open</code>, <code>save</code>, <code>kind</code>; no <code>use()</code>.</td></tr>
                </table>
                <p>A <b>FileRef</b> is <code>{ name, file, handle }</code>: <code>file</code> is a
                   <code>File</code> (type, size, lastModified); <code>handle</code> is opaque — keep it
                   and pass it back. It can be <code>null</code> (a browser that could only download),
                   and then <code>save()</code> simply asks again. A handle remembers the provider that
                   made it and goes back there: a file opened <em>from the device</em> is saved back to
                   the device even on a desktop whose default is its own space.</p>
                <h3>Providers</h3>
                <table class="sg">
                    <tr><th style="width:260px">Provider</th><th>What the user gets</th></tr>
                    <tr><td><code>sac.files.browser</code> <b>(default)</b></td><td>The device's own files. The File System Access API where it exists — a real Save that writes back through the handle; elsewhere <code>&lt;input type="file"&gt;</code> to open and a download to save.</td></tr>
                    <tr><td><code>sac.files.virtual(options)</code></td><td>The desktop's own file space: the kit's open/save dialog (<code>&lt;sac-file-browser&gt;</code> in a <code>&lt;sac-dialog&gt;</code>) over a <code>sac.fs</code> handle — by default <code>sac.fs.shared("files")</code>, one space every app on the desktop shares. Folders, thumbnails, overwrite confirmation, and a link to the device both ways. Options: <code>{ store, label, pixelated }</code>.</td></tr>
                    <tr><td>your own</td><td><code>{ kind, open(opts), save(blob, opts) }</code> — a server, a cloud drive. <code>save</code> always receives a Blob; return FileRefs whose <code>handle.owner</code> is your provider and re-saves come back to you.</td></tr>
                </table>
                ${code(`// a desktop, once at boot — every app's Open/Save now shows the desktop's files
sac.files.use(sac.files.virtual({ label: "Desktop" }));`)}
                <p class="sg-note"><b>Pair it with <code>context.setDirty()</code>.</b> An editor
                   that marks unsaved work and clears the mark after a successful save gets the
                   leave-page question for free, standalone and hosted alike.</p>

                <h2>sac.identity — who is at this desktop</h2>
                <p><b>Not authentication.</b> There is no server, no password, no verification and no
                   secret: a profile is a name and a face somebody typed into their own browser.
                   Never gate access on it, never treat it as proof, never send it anywhere the user
                   did not ask for. What it is instead: the difference between an app that greets you
                   and an app that cannot tell whether anyone is there.</p>
                ${code(`// app side — read-only
const me = context.identity && context.identity.get();   // { id, name, avatar } | null
this._off = context.identity.onChange((me) => this.paint(me));

// host side — the desktop's settings, not an app
sac.identity.set({ name: "Ada", avatar: "ada.png" });
sac.identity.clear();`)}
                <table class="sg">
                    <tr><th style="width:260px">Member</th><th>Description</th></tr>
                    <tr><td><code>get()</code></td><td><code>{ id, name, avatar? }</code>, or <code>null</code> when nobody has said who they are — which is the default. Anonymous is a valid state, so handle it first.</td></tr>
                    <tr><td><code>onChange(cb)</code></td><td><code>cb(profile|null)</code> on every change, including from another tab. Returns an unsubscribe.</td></tr>
                    <tr><td><code>set({name, avatar})</code> <b>(host)</b></td><td>Keeps the existing <code>id</code> — renaming yourself does not make you somebody else. An empty name is <code>clear()</code>.</td></tr>
                    <tr><td><code>clear()</code> <b>(host)</b></td><td>Back to nobody, id included. This is "forget me".</td></tr>
                    <tr><td><code>forApp()</code> <b>(host)</b></td><td>The read-only view handed to apps as <code>context.identity</code> — <code>get</code> and <code>onChange</code>, nothing that writes.</td></tr>
                    <tr><td><code>use(provider)</code> <b>(host)</b></td><td>Hand the source to a host that has a real one — see below. <code>null</code> restores the local profile.</td></tr>
                    <tr><td><code>changed()</code> <b>(host)</b></td><td>With a provider installed: announce that the answer changed (a sign-in resolved, a session expired).</td></tr>
                </table>
                <h3>When the host has a real identity</h3>
                <p>The kit's local profile is right for a desktop, where there is nothing to be
                   authenticated against. A host that <em>does</em> have accounts — an app with a
                   backend and a session — hands the source over and keeps everything apps depend on:
                   the shape, <code>forApp()</code>, the fan-out.</p>
                ${code(`sac.identity.use({
    get()        { const u = session.user;                  // may be null
                   return u && { id: u.id, name: u.name, avatar: u.avatarUrl }; },
    onChange(cb) { return session.subscribe(cb); },         // optional
    clear()      { session.signOut(); },                    // optional
    // no set() → the identity is read-only, which is what an account should be
});`)}
                <p><code>get()</code> is <b>synchronous by design</b>: apps call it while rendering.
                   A host whose answer needs a round trip returns <code>null</code> until it knows and
                   then announces — through the <code>onChange</code> it provided, or by calling
                   <code>sac.identity.changed()</code>. Apps paint "nobody" first and update, exactly
                   as they already do for the theme.</p>
                <p class="sg-note">This is the same division as <code>sac.fs.backend</code>: an app
                   that stores through <code>context.fs</code> and greets through
                   <code>context.identity</code> runs unchanged on a desktop with neither a server
                   nor an account, and on a product with both. Which is the point — the app never
                   learns which one it is on.</p>
                <h3>Identity next to your own backend</h3>
                <p>The usual shape for an app with a database: the host resolves the person (a Google
                   sign-in, say), the app reads <code>context.identity</code> to know whose screen
                   this is, and fetches that person's rows from its own API. Identity is the question
                   answered — it is not where the data lives, and it does not replace an API.</p>
                <p><b>The server must establish identity itself.</b> Send the credential the host
                   issued — an ID token, a session cookie — and verify it server-side. Never let
                   <code>identity.get().id</code> be the thing that decides which rows come back: it
                   arrives from the client, so anybody can put anybody's id in it. Client-side
                   identity decides <em>what to render</em>; server-side verification decides
                   <em>what to hand out</em>. The kit can only answer the first question, and it never
                   pretends otherwise.</p>
                <p>Apps read, the host writes. An app that wants a name of its own asks in its own UI
                   and keeps it in its own <code>context.fs</code>; it does not get to rename you
                   everywhere. <code>id</code> is stable, meaningless and not a fingerprint: it
                   exists so an app can key data by "who", and so a future account has something to
                   attach to.</p>
                <p class="sg-note">The shape is chosen to survive becoming more. If a host one day
                   backs this with a real account, <code>{ id, name, avatar }</code> plus
                   <code>onChange</code> still describes it — and apps written today keep working.
                   Storage rides on the <code>sac.fs</code> backend, at a key outside every app's
                   drawer.</p>
                <p>Pair it with <a href="#/styleguide/components/sac-avatar">&lt;sac-avatar&gt;</a>,
                   which turns a name into initials and a deterministic palette colour, and takes the
                   optional image as <code>src</code>.</p>

                <h2>loadHelp — markdown help loader (ES module)</h2>
                <p>Fetch a markdown file, render via the vendored <code>marked</code>, sanitize via the
                   vendored <code>DOMPurify</code> (if loaded), inject into a target element. Internal
                   <code>.md</code> links load recursively in place; http links open in new tabs.
                   Classic combo: a <code>&lt;sac-window&gt;</code> with a help div inside.</p>
                ${code(`<script defer src="kit/js/vendor/marked.min.js"><\/script>
<script defer src="kit/js/vendor/purify.min.js"><\/script>
<script type="module">
    import { loadHelp } from "../kit/js/lib/help-loader.js";
    document.getElementById("btn-help").addEventListener("click", () => {
        loadHelp("help.md", "help-content");
        document.getElementById("help-window").open();
    });
<\/script>`)}
                <p class="sg-note"><b>Vendored, not CDN:</b> marked + purify live in
                   <code>kit/js/vendor/</code>, fonts are self-hosted — kit pages work with no outbound
                   internet.</p>

                <h2>sac.scope — scoped workspaces (optional)</h2>
                <p>URL-derived scope for multi-tenant / multi-project apps:
                   <code>#/notes</code> = root, <code>#/scope/SLUG/notes</code> = scoped. The URL is
                   authoritative (two tabs, two scopes; reload-safe; deep-linkable). One route registration
                   serves both shapes — the router matches on the <em>resource</em>, not the full path.</p>
                <table class="sg">
                    <tr><th style="width:260px">API</th><th>Description</th></tr>
                    <tr><td><code>configure({ prefix })</code></td><td>URL segment name (default "scope"; e.g. "space" for team workspaces).</td></tr>
                    <tr><td><code>get()</code></td><td>{ type: "root" } | { type: "scoped", slug }.</td></tr>
                    <tr><td><code>endpoint(path)</code></td><td>"/notes" → "/scope/SLUG/notes" when scoped — route every data call through this.</td></tr>
                    <tr><td><code>hashFor(rootPath)</code></td><td>Rewrites nav hrefs so links stay inside the active scope (sac-nav uses it automatically).</td></tr>
                    <tr><td><code>set(target)</code></td><td>Switch scope, keeping the current view.</td></tr>
                    <tr><td><code>sac:scope-changed</code></td><td>Window event on every switch — subscribers re-fetch without re-parsing URLs.</td></tr>
                </table>
                <p class="sg-note"><b>Convention:</b> tint your scope switcher with
                   <code>--accent-warm</code> — operating on shared state should be visually unmissable.</p>

                <h2 id="sac-lang">sac.lang / sac.t — language</h2>
                <p>One language for the whole page, switchable at runtime and owned by the host like the
                   theme. Every string the kit shows goes through <code>sac.t(key, fallback)</code>, which
                   answers in the <b>current</b> language — and every kit component re-renders its strings
                   in place when it changes. English lives inline as the fallback; the kit ships a German
                   table (<code>kit/js/i18n/de.js</code>, loaded by <code>all.js</code>).</p>
                ${code(`// app side — your own strings, per language
sac.i18n.add("de", { "atelier.save": "Speichern", "atelier.frames": "Frames" });
const label = () => sac.t("atelier.save", "Save");
button.textContent = label();
this._offLang = context.lang.onChange(() => { button.textContent = label(); });

// host side — the switch (or just drop a <sac-lang-toggle> in the nav)
sac.lang.set("de");        // or "auto"`)}
                <table class="sg">
                    <tr><th style="width:260px">Member</th><th>Description</th></tr>
                    <tr><td><code>sac.t(key, fallback)</code></td><td>The string in the current language; <code>fallback</code> (your English) when no table has the key. Placeholders like <code>{name}</code> are the caller's to substitute.</td></tr>
                    <tr><td><code>sac.i18n.add(lang, table)</code></td><td>Merge a flat <code>{ key: string }</code> table for one language. Namespace app keys (<code>"atelier.save"</code>). A new table can change what Auto resolves to, and the switch follows.</td></tr>
                    <tr><td><code>sac.lang.get()</code></td><td>The current code: the explicit choice, else the system language.</td></tr>
                    <tr><td><code>sac.lang.mode()</code></td><td><code>"auto"</code> or the chosen code.</td></tr>
                    <tr><td><code>sac.lang.set(code)</code> <b>(host)</b></td><td><code>"auto"</code> or a code. Persisted (localStorage <code>sac-lang</code>), mirrored onto <code>&lt;html lang&gt;</code>, announced — including to other tabs.</td></tr>
                    <tr><td><code>sac.lang.onChange(cb)</code></td><td><code>cb(code)</code> on every change; returns an unsubscribe. Also <code>sac:lang</code> { lang } on <code>document</code>.</td></tr>
                    <tr><td><code>sac.lang.available()</code></td><td>Codes with a table, <code>"en"</code> first.</td></tr>
                    <tr><td><code>sac.lang.name(code)</code></td><td>The language's own name via Intl — <code>"Deutsch"</code>.</td></tr>
                    <tr><td><code>sac.lang.locale()</code></td><td>A full locale for <code>Intl</code> date / number output: the browser's own entry for the current language (<code>"de-AT"</code>), else the code. Kit components format with it.</td></tr>
                </table>
                <p class="sg-note"><b>Auto = the system language, as far as a page can see it.</b> No web API
                   exposes the operating system's language: a page only gets the browser's language list
                   (<code>navigator.languages</code>). Auto takes the first entry the kit has a table for,
                   else English. If a browser shows English on a German Windows, its own language setting
                   differs from the system — putting German first there fixes every page at once.</p>
                <p class="sg-note"><b>Legacy:</b> a flat table assigned straight onto <code>sac.i18n</code>
                   (<code>Object.assign(sac.i18n, {…})</code>, the boot-time model before 2.12) is still
                   honoured for every language, after the current language's table.</p>
                <h3>Kit keys</h3>
                <table class="sg">
                    <tr><th style="width:240px">Key</th><th>English</th><th>Deutsch</th><th style="width:150px">Used by</th></tr>
                    <tr><td><code>about.this-app</code></td><td><code>This app</code></td><td><code>Diese App</code></td><td>sac.about</td></tr>
                    <tr><td><code>about.title</code></td><td><code>About {name}</code></td><td><code>Über {name}</code></td><td>sac.about</td></tr>
                    <tr><td><code>calendar.next-decade</code></td><td><code>Forward 10 years</code></td><td><code>10 Jahre vor</code></td><td>sac-calendar</td></tr>
                    <tr><td><code>calendar.next-month</code></td><td><code>Next month</code></td><td><code>Nächster Monat</code></td><td>sac-calendar</td></tr>
                    <tr><td><code>calendar.next-year</code></td><td><code>Next year</code></td><td><code>Nächstes Jahr</code></td><td>sac-calendar</td></tr>
                    <tr><td><code>calendar.prev-decade</code></td><td><code>Back 10 years</code></td><td><code>10 Jahre zurück</code></td><td>sac-calendar</td></tr>
                    <tr><td><code>calendar.prev-month</code></td><td><code>Previous month</code></td><td><code>Voriger Monat</code></td><td>sac-calendar</td></tr>
                    <tr><td><code>calendar.prev-year</code></td><td><code>Previous year</code></td><td><code>Voriges Jahr</code></td><td>sac-calendar</td></tr>
                    <tr><td><code>chip-input.add</code></td><td><code>Add</code></td><td><code>Hinzufügen</code></td><td>sac-chip-input</td></tr>
                    <tr><td><code>chip-input.color-blue</code></td><td><code>Blue</code></td><td><code>Blau</code></td><td>sac-chip-input</td></tr>
                    <tr><td><code>chip-input.color-gray</code></td><td><code>Gray</code></td><td><code>Grau</code></td><td>sac-chip-input</td></tr>
                    <tr><td><code>chip-input.color-green</code></td><td><code>Green</code></td><td><code>Grün</code></td><td>sac-chip-input</td></tr>
                    <tr><td><code>chip-input.color-indigo</code></td><td><code>Indigo</code></td><td><code>Indigo</code></td><td>sac-chip-input</td></tr>
                    <tr><td><code>chip-input.color-orange</code></td><td><code>Orange</code></td><td><code>Orange</code></td><td>sac-chip-input</td></tr>
                    <tr><td><code>chip-input.color-pink</code></td><td><code>Pink</code></td><td><code>Pink</code></td><td>sac-chip-input</td></tr>
                    <tr><td><code>chip-input.color-purple</code></td><td><code>Purple</code></td><td><code>Lila</code></td><td>sac-chip-input</td></tr>
                    <tr><td><code>chip-input.color-red</code></td><td><code>Red</code></td><td><code>Rot</code></td><td>sac-chip-input</td></tr>
                    <tr><td><code>chip-input.color-teal</code></td><td><code>Teal</code></td><td><code>Petrol</code></td><td>sac-chip-input</td></tr>
                    <tr><td><code>chip-input.color-yellow</code></td><td><code>Yellow</code></td><td><code>Gelb</code></td><td>sac-chip-input</td></tr>
                    <tr><td><code>chip-input.create</code></td><td><code>Create "{name}"</code></td><td><code>„{name}“ anlegen</code></td><td>sac-chip-input</td></tr>
                    <tr><td><code>chip-input.no-matches</code></td><td><code>no matches</code></td><td><code>keine Treffer</code></td><td>sac-chip-input</td></tr>
                    <tr><td><code>chip-input.pick-color</code></td><td><code>Pick color for "{name}"</code></td><td><code>Farbe für „{name}“ wählen</code></td><td>sac-chip-input</td></tr>
                    <tr><td><code>chip.remove</code></td><td><code>Remove</code></td><td><code>Entfernen</code></td><td>sac-chip</td></tr>
                    <tr><td><code>collapsible.less</code></td><td><code>less</code></td><td><code>weniger</code></td><td>sac-collapsible</td></tr>
                    <tr><td><code>collapsible.more</code></td><td><code>more</code></td><td><code>mehr</code></td><td>sac-collapsible</td></tr>
                    <tr><td><code>color-field.choose-color</code></td><td><code>Choose color</code></td><td><code>Farbe wählen</code></td><td>sac-color-field</td></tr>
                    <tr><td><code>color-field.color-picker</code></td><td><code>Color picker</code></td><td><code>Farbwähler</code></td><td>sac-color-field</td></tr>
                    <tr><td><code>color-field.hex-color</code></td><td><code>Hex color</code></td><td><code>Hex-Farbe</code></td><td>sac-color-field</td></tr>
                    <tr><td><code>color-picker.blue</code></td><td><code>Blue</code></td><td><code>Blau</code></td><td>sac-color-picker</td></tr>
                    <tr><td><code>color-picker.green</code></td><td><code>Green</code></td><td><code>Grün</code></td><td>sac-color-picker</td></tr>
                    <tr><td><code>color-picker.hex-color</code></td><td><code>Hex color</code></td><td><code>Hex-Farbe</code></td><td>sac-color-picker</td></tr>
                    <tr><td><code>color-picker.hue</code></td><td><code>Hue</code></td><td><code>Farbton</code></td><td>sac-color-picker</td></tr>
                    <tr><td><code>color-picker.opacity</code></td><td><code>Opacity</code></td><td><code>Deckkraft</code></td><td>sac-color-picker</td></tr>
                    <tr><td><code>color-picker.red</code></td><td><code>Red</code></td><td><code>Rot</code></td><td>sac-color-picker</td></tr>
                    <tr><td><code>color-picker.saturation-value</code></td><td><code>Saturation and value</code></td><td><code>Sättigung und Helligkeit</code></td><td>sac-color-picker</td></tr>
                    <tr><td><code>color-picker.saturation-value-text</code></td><td><code>saturation {s}%, value {v}%</code></td><td><code>Sättigung {s} %, Helligkeit {v} %</code></td><td>sac-color-picker</td></tr>
                    <tr><td><code>color-picker.title</code></td><td><code>Color picker</code></td><td><code>Farbwähler</code></td><td>sac-color-picker</td></tr>
                    <tr><td><code>copy-button.copy</code></td><td><code>Copy</code></td><td><code>Kopieren</code></td><td>sac-copy-button</td></tr>
                    <tr><td><code>date-field.calendar</code></td><td><code>Calendar</code></td><td><code>Kalender</code></td><td>sac-date-field</td></tr>
                    <tr><td><code>date-field.choose-date</code></td><td><code>Choose date</code></td><td><code>Datum wählen</code></td><td>sac-date-field</td></tr>
                    <tr><td><code>date-field.date</code></td><td><code>Date</code></td><td><code>Datum</code></td><td>sac-date-field</td></tr>
                    <tr><td><code>date-field.placeholder</code></td><td><code>yyyy-mm-dd</code></td><td><code>jjjj-mm-tt</code></td><td>sac-date-field</td></tr>
                    <tr><td><code>dialog.ok</code></td><td><code>OK</code></td><td><code>OK</code></td><td>sac.dialog</td></tr>
                    <tr><td><code>drop-zone.hint</code></td><td><code>or click to browse</code></td><td><code>oder klicken zum Auswählen</code></td><td>sac-drop-zone</td></tr>
                    <tr><td><code>drop-zone.hint-touch</code></td><td><code>Tap to browse</code></td><td><code>Tippen zum Auswählen</code></td><td>sac-drop-zone</td></tr>
                    <tr><td><code>drop-zone.label</code></td><td><code>Drop files here</code></td><td><code>Dateien hier ablegen</code></td><td>sac-drop-zone</td></tr>
                    <tr><td><code>drop-zone.label-touch</code></td><td><code>Choose files</code></td><td><code>Dateien auswählen</code></td><td>sac-drop-zone</td></tr>
                    <tr><td><code>files.accept-description</code></td><td><code>Files</code></td><td><code>Dateien</code></td><td>sac.files</td></tr>
                    <tr><td><code>files.cancel</code></td><td><code>Cancel</code></td><td><code>Abbrechen</code></td><td>sac.files, sac-file-browser</td></tr>
                    <tr><td><code>files.delete</code></td><td><code>Delete</code></td><td><code>Löschen</code></td><td>sac-file-browser</td></tr>
                    <tr><td><code>files.delete-folder-empty</code></td><td><code>is empty and will be removed.</code></td><td><code>ist leer und wird entfernt.</code></td><td>sac-file-browser</td></tr>
                    <tr><td><code>files.delete-folder-message</code></td><td><code>and the {n} file(s) in it will be permanently deleted.</code></td><td><code>und die {n} Datei(en) darin werden dauerhaft gelöscht.</code></td><td>sac-file-browser</td></tr>
                    <tr><td><code>files.delete-folder-title</code></td><td><code>Delete this folder?</code></td><td><code>Diesen Ordner löschen?</code></td><td>sac-file-browser</td></tr>
                    <tr><td><code>files.delete-message</code></td><td><code>will be permanently deleted.</code></td><td><code>wird dauerhaft gelöscht.</code></td><td>sac-file-browser</td></tr>
                    <tr><td><code>files.delete-title</code></td><td><code>Delete this file?</code></td><td><code>Diese Datei löschen?</code></td><td>sac-file-browser</td></tr>
                    <tr><td><code>files.empty</code></td><td><code>Nothing here yet.</code></td><td><code>Noch nichts vorhanden.</code></td><td>sac-file-browser</td></tr>
                    <tr><td><code>files.empty-folder</code></td><td><code>This folder is empty.</code></td><td><code>Dieser Ordner ist leer.</code></td><td>sac-file-browser</td></tr>
                    <tr><td><code>files.from-device</code></td><td><code>Open from this device…</code></td><td><code>Von diesem Gerät öffnen…</code></td><td>sac.files</td></tr>
                    <tr><td><code>files.list</code></td><td><code>Files</code></td><td><code>Dateien</code></td><td>sac-file-browser</td></tr>
                    <tr><td><code>files.location</code></td><td><code>Location</code></td><td><code>Speicherort</code></td><td>sac-file-browser</td></tr>
                    <tr><td><code>files.name</code></td><td><code>Name</code></td><td><code>Name</code></td><td>sac.files</td></tr>
                    <tr><td><code>files.new-folder</code></td><td><code>New folder</code></td><td><code>Neuer Ordner</code></td><td>sac-file-browser</td></tr>
                    <tr><td><code>files.new-folder-name</code></td><td><code>Folder name</code></td><td><code>Ordnername</code></td><td>sac-file-browser</td></tr>
                    <tr><td><code>files.open</code></td><td><code>Open</code></td><td><code>Öffnen</code></td><td>sac.files</td></tr>
                    <tr><td><code>files.open-title</code></td><td><code>Open</code></td><td><code>Öffnen</code></td><td>sac.files</td></tr>
                    <tr><td><code>files.replace</code></td><td><code>Replace</code></td><td><code>Ersetzen</code></td><td>sac.files</td></tr>
                    <tr><td><code>files.replace-message</code></td><td><code>already exists. Saving replaces it.</code></td><td><code>ist bereits vorhanden. Speichern ersetzt sie.</code></td><td>sac.files</td></tr>
                    <tr><td><code>files.replace-title</code></td><td><code>Replace this file?</code></td><td><code>Diese Datei ersetzen?</code></td><td>sac.files</td></tr>
                    <tr><td><code>files.root</code></td><td><code>Files</code></td><td><code>Dateien</code></td><td>sac-file-browser</td></tr>
                    <tr><td><code>files.save</code></td><td><code>Save</code></td><td><code>Speichern</code></td><td>sac.files</td></tr>
                    <tr><td><code>files.save-title</code></td><td><code>Save as</code></td><td><code>Speichern unter</code></td><td>sac.files</td></tr>
                    <tr><td><code>files.to-device</code></td><td><code>Save to this device instead…</code></td><td><code>Stattdessen auf diesem Gerät speichern…</code></td><td>sac.files</td></tr>
                    <tr><td><code>files.up</code></td><td><code>Up one folder</code></td><td><code>Einen Ordner nach oben</code></td><td>sac-file-browser</td></tr>
                    <tr><td><code>filmstrip.add</code></td><td><code>Add frame</code></td><td><code>Frame hinzufügen</code></td><td>sac-filmstrip</td></tr>
                    <tr><td><code>filmstrip.delete</code></td><td><code>Delete frame</code></td><td><code>Frame löschen</code></td><td>sac-filmstrip</td></tr>
                    <tr><td><code>filmstrip.duplicate</code></td><td><code>Duplicate frame</code></td><td><code>Frame duplizieren</code></td><td>sac-filmstrip</td></tr>
                    <tr><td><code>filmstrip.frame</code></td><td><code>Frame {i} of {n}</code></td><td><code>Frame {i} von {n}</code></td><td>sac-filmstrip</td></tr>
                    <tr><td><code>filmstrip.frames</code></td><td><code>Frames</code></td><td><code>Frames</code></td><td>sac-filmstrip</td></tr>
                    <tr><td><code>footer.link</code></td><td><code>LINK</code></td><td><code>LINK</code></td><td>sac-footer</td></tr>
                    <tr><td><code>help.check-console</code></td><td><code>Check console for details.</code></td><td><code>Details in der Konsole.</code></td><td>help-loader</td></tr>
                    <tr><td><code>help.load-failed</code></td><td><code>Failed to load documentation</code></td><td><code>Dokumentation konnte nicht geladen werden</code></td><td>help-loader</td></tr>
                    <tr><td><code>hotkeys.alt</code></td><td><code>Alt</code></td><td><code>Alt</code></td><td>sac.hotkeys</td></tr>
                    <tr><td><code>hotkeys.ctrl</code></td><td><code>Ctrl</code></td><td><code>Strg</code></td><td>sac.hotkeys</td></tr>
                    <tr><td><code>hotkeys.del</code></td><td><code>Del</code></td><td><code>Entf</code></td><td>sac.hotkeys</td></tr>
                    <tr><td><code>hotkeys.end</code></td><td><code>End</code></td><td><code>Ende</code></td><td>sac.hotkeys</td></tr>
                    <tr><td><code>hotkeys.enter</code></td><td><code>Enter</code></td><td><code>Enter</code></td><td>sac.hotkeys</td></tr>
                    <tr><td><code>hotkeys.esc</code></td><td><code>Esc</code></td><td><code>Esc</code></td><td>sac.hotkeys</td></tr>
                    <tr><td><code>hotkeys.home</code></td><td><code>Home</code></td><td><code>Pos1</code></td><td>sac.hotkeys</td></tr>
                    <tr><td><code>hotkeys.insert</code></td><td><code>Insert</code></td><td><code>Einfg</code></td><td>sac.hotkeys</td></tr>
                    <tr><td><code>hotkeys.pgdn</code></td><td><code>PgDn</code></td><td><code>Bild↓</code></td><td>sac.hotkeys</td></tr>
                    <tr><td><code>hotkeys.pgup</code></td><td><code>PgUp</code></td><td><code>Bild↑</code></td><td>sac.hotkeys</td></tr>
                    <tr><td><code>hotkeys.shift</code></td><td><code>Shift</code></td><td><code>Umschalt</code></td><td>sac.hotkeys</td></tr>
                    <tr><td><code>hotkeys.space</code></td><td><code>Space</code></td><td><code>Leertaste</code></td><td>sac.hotkeys</td></tr>
                    <tr><td><code>hotkeys.tab</code></td><td><code>Tab</code></td><td><code>Tab</code></td><td>sac.hotkeys</td></tr>
                    <tr><td><code>hotkeys.win</code></td><td><code>Win</code></td><td><code>Win</code></td><td>sac.hotkeys</td></tr>
                    <tr><td><code>lang-toggle.auto</code></td><td><code>Auto</code></td><td><code>Auto</code></td><td>sac-lang-toggle</td></tr>
                    <tr><td><code>lang-toggle.auto-title</code></td><td><code>Follow the system</code></td><td><code>Systemsprache folgen</code></td><td>sac-lang-toggle</td></tr>
                    <tr><td><code>lang-toggle.label</code></td><td><code>Language</code></td><td><code>Sprache</code></td><td>sac-lang-toggle</td></tr>
                    <tr><td><code>launcher.add</code></td><td><code>Add</code></td><td><code>Hinzufügen</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.add-app</code></td><td><code>Add app</code></td><td><code>App hinzufügen</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.add-hint</code></td><td><code>The script is loaded on first open and must define the tag. Any URL works — including other sites.</code></td><td><code>Das Skript wird beim ersten Öffnen geladen und muss das Tag definieren. Jede URL funktioniert – auch andere Websites.</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.cancel</code></td><td><code>Cancel</code></td><td><code>Abbrechen</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.done</code></td><td><code>Done</code></td><td><code>Fertig</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.edit</code></td><td><code>Edit</code></td><td><code>Bearbeiten</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.error-name</code></td><td><code>a name</code></td><td><code>einen Namen</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.error-needs</code></td><td><code>An app needs {problems}.</code></td><td><code>Eine App braucht {problems}.</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.error-src</code></td><td><code>a script URL</code></td><td><code>eine Skript-URL</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.error-tag</code></td><td><code>a tag containing a dash</code></td><td><code>ein Tag mit Bindestrich</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.field-height</code></td><td><code>Height</code></td><td><code>Höhe</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.field-icon</code></td><td><code>Icon</code></td><td><code>Icon</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.field-name</code></td><td><code>Name</code></td><td><code>Name</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.field-src</code></td><td><code>Script URL</code></td><td><code>Skript-URL</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.field-tag</code></td><td><code>Tag</code></td><td><code>Tag</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.field-width</code></td><td><code>Width</code></td><td><code>Breite</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.hide</code></td><td><code>Hide {name}</code></td><td><code>{name} ausblenden</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.move-left</code></td><td><code>Move {name} left</code></td><td><code>{name} nach links verschieben</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.move-right</code></td><td><code>Move {name} right</code></td><td><code>{name} nach rechts verschieben</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.no-apps</code></td><td><code>No apps registered.</code></td><td><code>Keine Apps registriert.</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.placeholder-height</code></td><td><code>600px</code></td><td><code>600px</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.placeholder-icon</code></td><td><code>shapes (a sac-icon name)</code></td><td><code>shapes (ein sac-icon-Name)</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.placeholder-name</code></td><td><code>My App</code></td><td><code>Meine App</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.placeholder-src</code></td><td><code>apps/my-app.js or https://…</code></td><td><code>apps/meine-app.js oder https://…</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.placeholder-tag</code></td><td><code>app-my-app</code></td><td><code>app-meine-app</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.placeholder-width</code></td><td><code>500px</code></td><td><code>500px</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.remove</code></td><td><code>Remove {name}</code></td><td><code>{name} entfernen</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.show</code></td><td><code>Show {name}</code></td><td><code>{name} einblenden</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>layer-list.add</code></td><td><code>Add layer</code></td><td><code>Ebene hinzufügen</code></td><td>sac-layer-list</td></tr>
                    <tr><td><code>layer-list.delete</code></td><td><code>Delete layer</code></td><td><code>Ebene löschen</code></td><td>sac-layer-list</td></tr>
                    <tr><td><code>layer-list.duplicate</code></td><td><code>Duplicate layer</code></td><td><code>Ebene duplizieren</code></td><td>sac-layer-list</td></tr>
                    <tr><td><code>layer-list.hidden</code></td><td><code>hidden</code></td><td><code>ausgeblendet</code></td><td>sac-layer-list</td></tr>
                    <tr><td><code>layer-list.hide</code></td><td><code>Hide layer</code></td><td><code>Ebene ausblenden</code></td><td>sac-layer-list</td></tr>
                    <tr><td><code>layer-list.hide-named</code></td><td><code>Hide {name}</code></td><td><code>{name} ausblenden</code></td><td>sac-layer-list</td></tr>
                    <tr><td><code>layer-list.layers</code></td><td><code>Layers</code></td><td><code>Ebenen</code></td><td>sac-layer-list</td></tr>
                    <tr><td><code>layer-list.lock</code></td><td><code>Lock layer</code></td><td><code>Ebene sperren</code></td><td>sac-layer-list</td></tr>
                    <tr><td><code>layer-list.lock-named</code></td><td><code>Lock {name}</code></td><td><code>{name} sperren</code></td><td>sac-layer-list</td></tr>
                    <tr><td><code>layer-list.locked</code></td><td><code>locked</code></td><td><code>gesperrt</code></td><td>sac-layer-list</td></tr>
                    <tr><td><code>layer-list.name</code></td><td><code>Layer name</code></td><td><code>Ebenenname</code></td><td>sac-layer-list</td></tr>
                    <tr><td><code>layer-list.show</code></td><td><code>Show layer</code></td><td><code>Ebene einblenden</code></td><td>sac-layer-list</td></tr>
                    <tr><td><code>layer-list.show-named</code></td><td><code>Show {name}</code></td><td><code>{name} einblenden</code></td><td>sac-layer-list</td></tr>
                    <tr><td><code>layer-list.unlock</code></td><td><code>Unlock layer</code></td><td><code>Ebene entsperren</code></td><td>sac-layer-list</td></tr>
                    <tr><td><code>layer-list.unlock-named</code></td><td><code>Unlock {name}</code></td><td><code>{name} entsperren</code></td><td>sac-layer-list</td></tr>
                    <tr><td><code>loader.loading</code></td><td><code>Loading...</code></td><td><code>Wird geladen …</code></td><td>sac-loader</td></tr>
                    <tr><td><code>log.clear</code></td><td><code>Clear</code></td><td><code>Leeren</code></td><td>sac-log</td></tr>
                    <tr><td><code>log.copied</code></td><td><code>Copied!</code></td><td><code>Kopiert!</code></td><td>sac-log</td></tr>
                    <tr><td><code>log.copy</code></td><td><code>Copy</code></td><td><code>Kopieren</code></td><td>sac-log</td></tr>
                    <tr><td><code>log.header</code></td><td><code>LOG</code></td><td><code>PROTOKOLL</code></td><td>sac-log</td></tr>
                    <tr><td><code>nav.home</code></td><td><code>Home</code></td><td><code>Start</code></td><td>sac-nav</td></tr>
                    <tr><td><code>nav.host</code></td><td><code>Host</code></td><td><code>Host</code></td><td>sac-nav</td></tr>
                    <tr><td><code>nav.menu</code></td><td><code>Menu</code></td><td><code>Menü</code></td><td>sac-nav</td></tr>
                    <tr><td><code>nav.more</code></td><td><code>More</code></td><td><code>Mehr</code></td><td>sac-nav</td></tr>
                    <tr><td><code>nav.no-sections</code></td><td><code>No sections yet.</code></td><td><code>Noch keine Bereiche.</code></td><td>sac-nav</td></tr>
                    <tr><td><code>palette.commands</code></td><td><code>Commands</code></td><td><code>Befehle</code></td><td>sac-command-palette</td></tr>
                    <tr><td><code>palette.empty</code></td><td><code>No matching commands</code></td><td><code>Keine passenden Befehle</code></td><td>sac-command-palette</td></tr>
                    <tr><td><code>palette.group-views</code></td><td><code>Views</code></td><td><code>Ansichten</code></td><td>sac-command-palette</td></tr>
                    <tr><td><code>palette.group-apps</code></td><td><code>Apps</code></td><td><code>Apps</code></td><td>sac-command-palette (sac.apps routes)</td></tr>
                    <tr><td><code>palette.placeholder</code></td><td><code>Type a command…</code></td><td><code>Befehl eingeben…</code></td><td>sac-command-palette</td></tr>
                    <tr><td><code>palette.search</code></td><td><code>Search commands</code></td><td><code>Befehle durchsuchen</code></td><td>sac-command-palette</td></tr>
                    <tr><td><code>palette.title</code></td><td><code>Command palette</code></td><td><code>Befehlspalette</code></td><td>sac-command-palette</td></tr>
                    <tr><td><code>pixel-canvas.label</code></td><td><code>Pixel canvas</code></td><td><code>Pixel-Leinwand</code></td><td>sac-pixel-canvas</td></tr>
                    <tr><td><code>scene.color</code></td><td><code>Color</code></td><td><code>Farbe</code></td><td>sac-scene-item</td></tr>
                    <tr><td><code>scene.delete</code></td><td><code>Delete</code></td><td><code>Löschen</code></td><td>sac-scene-item</td></tr>
                    <tr><td><code>scene.expand</code></td><td><code>Expand / collapse</code></td><td><code>Auf- / zuklappen</code></td><td>sac-scene-item</td></tr>
                    <tr><td><code>scene.unnamed</code></td><td><code>Unnamed</code></td><td><code>Unbenannt</code></td><td>sac-scene-item</td></tr>
                    <tr><td><code>scene.visibility</code></td><td><code>Toggle visibility</code></td><td><code>Sichtbarkeit umschalten</code></td><td>sac-scene-item</td></tr>
                    <tr><td><code>shortcuts.close</code></td><td><code>Close</code></td><td><code>Schließen</code></td><td>sac-shortcut-sheet</td></tr>
                    <tr><td><code>shortcuts.empty</code></td><td><code>No keyboard shortcuts are registered.</code></td><td><code>Keine Tastenkürzel registriert.</code></td><td>sac-shortcut-sheet</td></tr>
                    <tr><td><code>shortcuts.general</code></td><td><code>General</code></td><td><code>Allgemein</code></td><td>sac-shortcut-sheet</td></tr>
                    <tr><td><code>shortcuts.help</code></td><td><code>Help</code></td><td><code>Hilfe</code></td><td>sac.shortcuts</td></tr>
                    <tr><td><code>shortcuts.title</code></td><td><code>Keyboard shortcuts</code></td><td><code>Tastenkürzel</code></td><td>sac-shortcut-sheet</td></tr>
                    <tr><td><code>sidebar.label</code></td><td><code>Sections</code></td><td><code>Bereiche</code></td><td>sac-sidebar</td></tr>
                    <tr><td><code>spinner.loading</code></td><td><code>Loading</code></td><td><code>Lädt</code></td><td>sac-spinner</td></tr>
                    <tr><td><code>split.back</code></td><td><code>Back</code></td><td><code>Zurück</code></td><td>sac-split</td></tr>
                    <tr><td><code>split.resize-panels</code></td><td><code>Resize panels</code></td><td><code>Bereichsgröße ändern</code></td><td>sac-split</td></tr>
                    <tr><td><code>stepper.decrease</code></td><td><code>Decrease</code></td><td><code>Verringern</code></td><td>sac-stepper</td></tr>
                    <tr><td><code>stepper.increase</code></td><td><code>Increase</code></td><td><code>Erhöhen</code></td><td>sac-stepper</td></tr>
                    <tr><td><code>theme-toggle.auto</code></td><td><code>Auto</code></td><td><code>Auto</code></td><td>sac-theme-toggle</td></tr>
                    <tr><td><code>theme-toggle.dark</code></td><td><code>Dark</code></td><td><code>Dunkel</code></td><td>sac-theme-toggle</td></tr>
                    <tr><td><code>theme-toggle.label</code></td><td><code>Theme</code></td><td><code>Design</code></td><td>sac-theme-toggle</td></tr>
                    <tr><td><code>theme-toggle.light</code></td><td><code>Light</code></td><td><code>Hell</code></td><td>sac-theme-toggle</td></tr>
                    <tr><td><code>toast.dismiss</code></td><td><code>Dismiss</code></td><td><code>Schließen</code></td><td>sac-toast</td></tr>
                    <tr><td><code>toast.notifications</code></td><td><code>Notifications</code></td><td><code>Benachrichtigungen</code></td><td>sac-toast</td></tr>
                    <tr><td><code>toolbox.group</code></td><td><code>Tools</code></td><td><code>Werkzeuge</code></td><td>sac-toolbox</td></tr>
                    <tr><td><code>window.close</code></td><td><code>Close</code></td><td><code>Schließen</code></td><td>sac-window</td></tr>
                    <tr><td><code>window.default-title</code></td><td><code>Window</code></td><td><code>Fenster</code></td><td>sac-window</td></tr>
                    <tr><td><code>window.maximize</code></td><td><code>Maximize</code></td><td><code>Maximieren</code></td><td>sac-window</td></tr>
                    <tr><td><code>window.minimize</code></td><td><code>Minimize</code></td><td><code>Minimieren</code></td><td>sac-window</td></tr>
                    <tr><td><code>window.restore</code></td><td><code>Restore</code></td><td><code>Wiederherstellen</code></td><td>sac-window</td></tr>
                </table>
                <p class="sg-note"><b>Placeholders:</b> <code>{name}</code>, <code>{problems}</code>, <code>{n}</code>, <code>{i}</code>,
                   <code>{s}</code>/<code>{v}</code> are substituted by the component at render time —
                   keep them verbatim in a translation. Date and number OUTPUT is never in this table:
                   that is Intl's job, always in the browser's locale.</p>

                <h2>sac.icons — registry</h2>
                ${code(`sac.icons.register("my-icon", "<path d='M12 2 L22 22 L2 22 Z'/>");
sac.icons.register("brand", "<path …/>", { filled: true });  // fill, not stroke
sac.icons.get("note");  sac.icons.has("x");  sac.icons.names();`)}
            </div>
            `;
    }

    function wireHelpers(root) {
        // sac.files — the virtual provider over the demo space, so the demo
        // shows the desktop dialog without touching anybody's real files.
        const filesOut = root.querySelector("#demo-files-result");
        const resave = root.querySelector("#demo-files-resave");
        if (filesOut) {
            let provider = null;
            let last = null;
            const ready = async () => provider || (provider = sac.files.virtual({
                store: await demoFiles(), label: "Demo files", pixelated: true,
            }));
            const sample = () => new Promise((resolve) => {
                const c = document.createElement("canvas");
                c.width = c.height = 8;
                const g = c.getContext("2d");
                g.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#3b82f6";
                g.fillRect(1, 1, 6, 6);
                c.toBlob(resolve, "image/png");
            });
            root.querySelector("#demo-files-open").addEventListener("click", async () => {
                const ref = await (await ready()).open({ accept: ".png,image/*" });
                filesOut.textContent = ref ? `opened ${ref.name} — ${ref.file.size} B` : "cancelled";
                if (ref) { last = ref; resave.disabled = !ref.handle; }
            });
            root.querySelector("#demo-files-save").addEventListener("click", async () => {
                const ref = await (await ready()).save(await sample(), { name: "square.png" });
                filesOut.textContent = ref ? `saved ${ref.name}` : "cancelled";
                if (ref) { last = ref; resave.disabled = !ref.handle; }
            });
            resave.addEventListener("click", async () => {
                if (!last || !last.handle) return;
                const ref = await sac.files.save(await sample(), { handle: last.handle });
                filesOut.textContent = ref ? `saved ${ref.name} again — no dialog` : "cancelled";
            });
        }

        const sortList = root.querySelector("#demo-sortable");
        if (sortList && window.sac && sac.sortable) {
            const state = root.querySelector("#demo-sortable-state");
            sac.sortable(sortList, {
                items: "li",
                axis: "grid",
                onReorder: (from, to) => {
                    const order = Array.from(sortList.children, (li) => li.textContent.trim() || li.querySelector("sac-chip").getAttribute("label"));
                    state.textContent = `moved ${from} → ${to}: ${order.join(", ")}`;
                },
            });
        }

        // Live pan-zoom demo: two panes, one transform.
        const grid = (label) => {
            const div = document.createElement("div");
            div.style.cssText = `
                position:absolute; inset:0;
                background-image:
                    linear-gradient(var(--border-strong) 1px, transparent 1px),
                    linear-gradient(90deg, var(--border-strong) 1px, transparent 1px);
                background-size: 40px 40px;
            `;
            const dot = document.createElement("div");
            dot.style.cssText = `
                position:absolute; left:110px; top:90px; width:48px; height:48px;
                border-radius:50%; background: var(--accent);
                box-shadow: 0 0 24px var(--accent-glow);
                display:flex; align-items:center; justify-content:center;
                color: var(--on-accent); font-size:0.6rem; font-weight:700;`;
            dot.textContent = label;
            div.appendChild(dot);
            return div;
        };
        const layerA = root.querySelector("#pz-layer-a");
        const layerB = root.querySelector("#pz-layer-b");
        layerA.appendChild(grid("A"));
        layerB.appendChild(grid("B"));
        const hud = root.querySelector("#pz-hud");
        sac.setupPanZoom({
            panes: [
                { pane: root.querySelector("#pz-pane-a"), layer: layerA },
                { pane: root.querySelector("#pz-pane-b"), layer: layerB },
            ],
            onChange: (scale) => { hud.textContent = `zoom ${scale.toFixed(2)}`; },
        });
    }

    /* ------------------------------------------------------------ app --- */

    const SECTIONS = [
        { id: "tokens",     label: "Tokens & Theming", icon: "star",
          html: tokensHtml,     wire: wireTokens },
        { id: "components", label: "Components",       icon: "shapes",
          html: componentsHtml, wire: wireComponents, anchors: true },
        { id: "layout",     label: "Layouts",          icon: "globe",
          html: layoutHtml },
        { id: "patterns",   label: "CSS Patterns",     icon: "document",
          html: patternsHtml,   wire: wirePatterns },
        { id: "helpers",    label: "Helpers",          icon: "settings",
          html: helpersHtml,    wire: wireHelpers },
    ];

    /** "components/sac-calendar" → { id: "components", anchor: "sac-calendar" } */
    function splitRoute(route) {
        const parts = String(route || "").split("/").filter(Boolean);
        return { id: parts[0] || "", anchor: parts[1] || "" };
    }

    const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Width preview. A media query answers to the viewport, never to a div,
    // so "Phone 375" is an <iframe> of this very page: inside it the kit sees
    // a 375px viewport and does exactly what it does on a phone. The framed
    // copy is marked ?sg-frame and draws no switch — a phone has none either.
    const FRAMED = new URLSearchParams(location.search).has("sg-frame");
    const WIDTHS = {
        phone:  { label: "Phone 375",  w: 375, h: 812 },
        tablet: { label: "Tablet 768", w: 768, h: 1024 },
    };
    const WIDTH_KEY = "sac.styleguide.width";
    const COMPACT = matchMedia("(max-width: 768px), (max-height: 480px) and (pointer: coarse)");

    /** The viewer's last choice. Storage may be absent or blocked: then Full. */
    function readWidth() {
        try {
            const v = localStorage.getItem(WIDTH_KEY);
            return WIDTHS[v] ? v : "full";
        } catch { return "full"; }
    }
    function storeWidth(v) {
        try {
            if (WIDTHS[v]) localStorage.setItem(WIDTH_KEY, v);
            else localStorage.removeItem(WIDTH_KEY);
        } catch { /* a preview preference is not worth an error */ }
    }
    const themeOf = (doc) => doc.documentElement.getAttribute("data-theme") || "dark";

    class AppStyleguide extends HTMLElement {
        connectedCallback() {
            if (this.firstElementChild) return;   // a stage swap re-connects
            ensureStyles();
            this._anchors = [];
            this._targets = [];
            this._anchor = "";

            // The app is complete: its own nav, its own rail, its own
            // scrolling body. A host adds nothing but context.host.
            this._nav = document.createElement("sac-nav");
            this._nav.setAttribute("brand", "STYLE GUIDE");
            this._nav.setAttribute("brand-icon", "star");
            this._nav.setAttribute("brand-href", "#/styleguide");
            // On a phone the suite's tile dashboard is the main level (the
            // ⌂ in the open menu's ribbon goes back to it), so the burger holds only this app — no suite list
            // stacked above the rail.
            this._nav.setAttribute("host-nav", "wide");
            // Its rail lists the sections already: on a phone the burger
            // opens that one list instead of a second copy stacked above it.
            this._nav.setAttribute("sections-nav", "wide");
            const ctxSlot = document.createElement("div");
            ctxSlot.slot = "context";
            ctxSlot.append(document.createElement("sac-lang-toggle"), document.createElement("sac-theme-toggle"));
            this._nav.appendChild(ctxSlot);
            // Pinned in the ribbon (data-overflow="never"): parked behind
            // "…" the switch would be one tap further from what it previews.
            if (!FRAMED) {
                const tools = document.createElement("div");
                tools.slot = "toolbar";
                tools.className = "toolbar";
                this._widthSwitch = document.createElement("sac-segmented-control");
                this._widthSwitch.className = "sg-width-switch";
                this._widthSwitch.setAttribute("aria-label", "Preview width");
                this._widthSwitch.innerHTML = [
                    ...Object.entries(WIDTHS).map(([k, v]) =>
                        `<button type="button" data-value="${k}" data-overflow="never"
                                 title="Render the guide in a ${v.w}px-wide frame">${v.label}</button>`),
                    `<button type="button" data-value="full" data-overflow="never">Full</button>`,
                ].join("");
                this._widthSwitch.addEventListener("sac:change", (e) => this._setWidth(e.detail.value));
                tools.appendChild(this._widthSwitch);
                this._nav.appendChild(tools);
            }
            // Explicit, though the default would find it: demos below render
            // their own .main-layout mock-ups, and the drawer must be OURS.
            this._nav.setAttribute("rail", "app-styleguide > .main-layout > sac-sidebar");

            const layout = document.createElement("div");
            layout.className = "main-layout";
            this._rail   = document.createElement("sac-sidebar");
            this._scroll = document.createElement("div");
            this._scroll.className = "app-scroll";
            this._body   = document.createElement("div");
            this._scroll.appendChild(this._body);
            layout.append(this._rail, this._scroll);
            this.append(this._nav, layout);
            this._layout = layout;

            // In-page controls of the Responsive section.
            this.addEventListener("click", (e) => {
                const w = e.target.closest("[data-sg-width]");
                if (w) this._setWidth(w.dataset.sgWidth);
                if (e.target.closest("[data-sg-drawer]")) this._rail.open();
            });
        }

        /** App contract: called once by sac.apps, right after the first insert. */
        mount(context) {
            this._ctx = context;
            // Rail first: a rail with no items is [hidden], and the nav only
            // adopts a visible rail as its compact drawer — it looks when it
            // renders, which the two assignments below trigger.
            const target = splitRoute(context.route);
            this._go(target.id, target.anchor, false);
            // The host's injection (jump, suite nav, toolbar controls),
            // rendered by OUR nav. Null standalone — the nav shows nothing.
            this._nav.host = context.host;
            // Our own sections, offered to the burger: hosted they nest
            // under this app's suite entry, standalone they are the list.
            // On compact sections-nav="wide" keeps them out of the burger:
            // the rail beneath already lists them.
            this._nav.sections = SECTIONS.map((s) =>
                ({ label: s.label, href: context.href(s.id), icon: s.icon }));

            this._width = FRAMED ? "full" : readWidth();
            this._onCompact = () => { this._project(); this._applyWidth(); };
            COMPACT.addEventListener("change", this._onCompact);
            this._applyWidth();

            // Rail clicks, back/forward and pasted URLs arrive here.
            this._offRoute = context.onRoute((route) => {
                const next = splitRoute(route);
                this._go(next.id, next.anchor, true);
            });

            // The two demo commands + the mod+shift+x hotkey are GLOBAL. Bind
            // them to this app being ON STAGE — sac.apps keeps swapped-out views
            // in the DOM, so without this they would fire from inside other
            // apps. The stage emits sac:apps-changed ("view"/"home"), a
            // deterministic signal (an IntersectionObserver would be throttled
            // in a background tab). We mount only when shown, so register now.
            this._demoCmdsOn();
            this._onApps = (e) => {
                const d = e.detail || {};
                if (d.type === "view") (d.id === context.appId ? this._demoCmdsOn() : this._demoCmdsOff());
                else if (d.type === "home") this._demoCmdsOff();
            };
            document.addEventListener("sac:apps-changed", this._onApps);
        }

        _demoCmdsOn() {
            if (this._demoOff) return;   // already registered
            const offs = [
                sac.commands.register({
                    id: "sg-say-hello", label: "Say hello", icon: "info", group: "Style guide",
                    run: () => sac.toast("Hello from the command palette.", { kind: "info" }),
                }),
                sac.commands.register({
                    id: "sg-toast-demo", label: "Toast a success message", icon: "success",
                    group: "Style guide", hotkey: "mod+shift+x",
                    run: () => sac.toast("Ran from the palette.", { kind: "success" }),
                }),
                sac.hotkeys.register("mod+shift+x",
                    () => sac.toast("Ran from the keyboard.", { kind: "success" }),
                    { description: "Toast a success message" }),
            ];
            // The shortcut sheet's "?" and its gesture entries, and the demo
            // toolbox's tool keys — global too, so on stage only.
            offs.push(sac.shortcuts.bind(), sac.shortcuts.add([
                { group: "Demo tools", keys: "Space + drag", description: "Pan the pixel canvas" },
                { group: "Demo tools", keys: ["Alt", "click"], description: "Pick a color" },
            ]));
            this._demoOff = () => offs.forEach((f) => typeof f === "function" && f());
            this._syncDemoKeys();
        }

        _demoCmdsOff() {
            if (this._demoOff) { this._demoOff(); this._demoOff = null; }
            this._syncDemoKeys();
        }

        /** The demo toolbox registers its keys only while the guide is on stage. */
        _syncDemoKeys() {
            const tb = this.querySelector("#demo-toolbox");
            if (tb) tb.toggleAttribute("hotkeys", !!this._demoOff);
        }

        unmount() {
            if (this._offRoute) { this._offRoute(); this._offRoute = null; }
            if (this._onApps) { document.removeEventListener("sac:apps-changed", this._onApps); this._onApps = null; }
            this._demoCmdsOff();
            if (this._onCompact) { COMPACT.removeEventListener("change", this._onCompact); this._onCompact = null; }
            this._dropFrame();
            this._codeObs?.disconnect();
        }

        /* ----------------------------------------------- width preview --- */

        /** The switch, and the "preview at 375px" button, land here. */
        _setWidth(value) {
            this._width = WIDTHS[value] ? value : "full";
            storeWidth(this._width);
            this._applyWidth();
        }

        /** Frame or not. A compact viewport always gets the guide itself. */
        _applyWidth() {
            if (this._widthSwitch) this._widthSwitch.value = this._width;
            const size = COMPACT.matches ? null : WIDTHS[this._width];
            if (!size) {
                if (!this._frame) return;
                // Back to Full where the frame was reading.
                const r = this._frameRoute();
                this._dropFrame();
                if (r != null) {
                    const t = splitRoute(r);
                    this._go(t.id, t.anchor, false);
                }
                return;
            }
            if (!this._stage) {
                this._stage = document.createElement("div");
                this._stage.className = "sg-frame-stage";
                this._layout.appendChild(this._stage);
            }
            if (!this._frame) {
                this._frame = document.createElement("iframe");
                this._frame.className = "sg-frame";
                this._frame.title = "Style guide preview";
                this._frameReady = false;
                this._frame.addEventListener("load", () => this._wireFrame());
                const url = new URL(location.href);
                url.searchParams.delete("app");       // no window app twice
                url.searchParams.set("sg-frame", "");
                url.hash = this._ctx ? this._ctx.href(this._route()) : "";
                this._frame.src = url.href;
                const caption = document.createElement("p");
                caption.className = "sg-frame-caption";
                this._stage.replaceChildren(this._frame, caption);
            }
            this._frame.style.width = `${size.w}px`;
            this._frame.style.maxHeight = `${size.h}px`;
            this._stage.lastElementChild.innerHTML =
                `<b>${size.w}px</b> — this guide in a ${size.w}px viewport, laid out exactly as a
                 ${size.w}px screen lays it out. Touch rules (<code>pointer: coarse</code>,
                 <code>hover: none</code>) follow the device you are on.`;
            this._stage.hidden = false;
            this._scroll.hidden = true;
        }

        _dropFrame() {
            this._frameObs?.forEach((o) => o.disconnect());
            this._frameObs = null;
            this._frame = null;
            this._frameReady = false;
            if (this._stage) { this._stage.replaceChildren(); this._stage.hidden = true; }
            if (this._scroll) this._scroll.hidden = false;
        }

        /** The frame's sub-route under this app, or null when it left the app. */
        _frameRoute() {
            try {
                const h = this._frame.contentWindow.location.hash;
                const base = this._ctx.href("");
                if (h === base) return "";
                if (h.startsWith(base + "/")) return h.slice(base.length + 1);
            } catch { /* not loaded yet */ }
            return null;
        }

        _route() {
            return this._section ? this._section.id + (this._anchor ? "/" + this._anchor : "") : "";
        }

        /** Outer rail / burger / back button → the frame follows. */
        _pushFrame() {
            if (!this._frameReady || !this._frame || !this._ctx) return;
            try {
                const win = this._frame.contentWindow;
                const want = this._ctx.href(this._route());
                if (win.location.hash !== want) win.location.hash = want;
            } catch { /* mid-load */ }
        }

        /** Per load: the frame's navigation and theme flow back out here. */
        _wireFrame() {
            const frame = this._frame;
            let win;
            try { win = frame.contentWindow; if (!win.document) return; } catch { return; }
            this._frameReady = true;
            // The frame's own router runs first; read its settled address.
            win.addEventListener("hashchange", () => setTimeout(() => {
                if (this._frame !== frame) return;
                const r = this._frameRoute();
                if (r == null) return;
                const t = splitRoute(r);
                this._go(t.id, t.anchor, false);
            }));
            // Theme both ways: the outer toggle is the one in reach, the
            // frame's the one in view. Only a DIFFERENT value crosses, so the
            // two observers cannot ping-pong.
            const set = (doc, value) => {
                if (value === "dark") doc.documentElement.removeAttribute("data-theme");
                else doc.documentElement.setAttribute("data-theme", value);
                // Every toggle re-highlights (and stores the same value again) —
                // the shell's home keeps one of its own beside ours.
                doc.querySelectorAll("sac-theme-toggle").forEach((t) => { t.theme = value; });
            };
            const sync = (from, to) => () => {
                if (themeOf(from) !== themeOf(to)) set(to, themeOf(from));
            };
            const opts = { attributes: true, attributeFilter: ["data-theme"] };
            const out = new MutationObserver(sync(document, win.document));
            const inn = new MutationObserver(sync(win.document, document));
            out.observe(document.documentElement, opts);
            inn.observe(win.document.documentElement, opts);
            this._frameObs?.forEach((o) => o.disconnect());
            this._frameObs = [out, inn];
            sync(document, win.document)();
        }

        /** Render, address, rail — in that order; everything else derives. */
        _go(id, anchor, animate) {
            // A bare "#/styleguide" (the shell's tile and nav entry) carries no
            // opinion: first time it means Tokens, later it means "the section
            // I was reading". The address is rewritten to the full one below.
            const section = SECTIONS.find((s) => s.id === id) || this._section || SECTIONS[0];
            const swapped = this._section !== section;

            if (swapped) {
                this._section = section;
                // Only the active section is in the DOM. Replacing the subtree
                // also drops every listener the previous wiring added — the
                // demos wire themselves fresh on every render.
                this._body.innerHTML = section.html();
                if (section.wire) section.wire(this._body);
                this._syncDemoKeys();
                this._watchCode();
                // Every h2/h3 with an id is addressable ("patterns/responsive");
                // only an anchors section lists its h2s in the rail.
                this._targets = Array.from(this._body.querySelectorAll("h2[id], h3[id]"),
                    (h) => ({ id: h.id, label: h.textContent.trim(), top: h.tagName === "H2" }));
                this._anchors = section.anchors ? this._targets.filter((a) => a.top) : [];
            }
            this._anchor = this._targets.some((a) => a.id === anchor) ? anchor : "";

            if (this._ctx) {
                this._ctx.deepLink.set(section.id + (this._anchor ? "/" + this._anchor : ""));
            }
            this._project();

            if (this._anchor) this._scrollToAnchor(this._anchor, animate && !swapped, swapped);
            else if (swapped) this._scroller().scrollTop = 0;
            this._pushFrame();
        }

        /** The rail is this app's OWN chrome — replaced on every move. */
        _project() {
            if (!this._ctx) return;
            // On compact the open menu's ribbon right above already names the app,
            // so the rail's own "Style guide" heading would say it twice.
            const items = [
                ...(COMPACT.matches ? [] : [{ section: "Style guide" }]),
                ...SECTIONS.map((s) => ({
                    label:  s.label,
                    icon:   s.icon,
                    href:   this._ctx.href(s.id),   // the host owns the prefix
                    active: s === this._section,
                })),
            ];
            // Second level, read out of the DOM the section just rendered: a
            // new component documents itself in the rail, with no list to keep.
            if (this._anchors.length) {
                items.push({ section: this._section.label });
                this._anchors.forEach((a) => items.push({
                    label:  a.label,
                    href:   this._ctx.href(`${this._section.id}/${a.id}`),
                    active: a.id === this._anchor,
                }));
            }
            this._rail.items = items;
        }

        /** Code blocks scroll sideways inside themselves. Each one says which
         *  side still has more (.sg-more-start / .sg-more-end) — the phone
         *  stylesheet turns that into a soft edge. A ResizeObserver covers the
         *  first layout, a late stylesheet and a rotated phone alike. */
        _watchCode() {
            this._codeObs?.disconnect();
            const mark = (pre) => {
                const max = pre.scrollWidth - pre.clientWidth;
                pre.classList.toggle("sg-more-start", pre.scrollLeft > 1);
                pre.classList.toggle("sg-more-end", pre.scrollLeft < max - 1);
            };
            this._codeObs = new ResizeObserver((entries) => entries.forEach((e) => mark(e.target)));
            this._body.querySelectorAll("pre.sg-code").forEach((pre) => {
                pre.addEventListener("scroll", () => mark(pre), { passive: true });
                this._codeObs.observe(pre);
            });
        }

        /** The app owns its scrolling — the .app-scroll region beside the rail. */
        _scroller() {
            return this._scroll;
        }

        _scrollToAnchor(id, smooth, deferred) {
            const run = () => {
                if (this._anchor !== id) return;   // moved on since
                const el = this._body.querySelector("#" + CSS.escape(id));
                if (!el) return;
                el.scrollIntoView({
                    block: "start",
                    behavior: smooth && !reducedMotion() ? "smooth" : "auto",
                });
            };
            run();
            if (!deferred) return;
            // A section rendered just now is re-asserted when the stylesheet
            // lands (it changes every height) and again on the next frame —
            // both, because a background tab runs no frames at all.
            stylesReady.then(run);
            requestAnimationFrame(run);
        }
    }

    if (!customElements.get("app-styleguide")) {
        customElements.define("app-styleguide", AppStyleguide);
    }
})();
