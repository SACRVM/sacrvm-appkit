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

    // Page-lifetime guards. The demo window lives in <body> and outlives every
    // render; the demo hotkey is torn down before it is registered again.
    let windowStateWired = false;
    let demoHotkeyOff = null;

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

                <h3>State fills + text — the AA layer</h3>
                <p>A state color has two jobs at two contrast bars. The seed stays the identity
                   (rings, borders, icons — 3:1); a plane that carries text uses its <code>-fill</code>
                   with its ink (4.5:1); state-colored text uses the per-theme <code>-text</code>
                   variant. Every ratio is solved against the default seeds and worst-case plane —
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
                    36 component files, 40 custom elements — Shadow DOM (<code>mode: 'open'</code>)
                    except the one documented light-DOM case, <code>&lt;sac-launcher&gt;</code>.
                    All are classic deferred scripts self-registering via
                    <code>customElements.define()</code>, usable from classic and module scripts alike.
                    They style themselves exclusively from the kit tokens: <strong>ui.css is
                    required</strong> — without it they render unstyled.
                </p>

                <h2 id="sac-icon">&lt;sac-icon&gt;</h2>
                <p>Inline SVG icon from the <code>sac.icons</code> registry. Size via <code>--icon-size</code>, color via <code>currentColor</code>.</p>
                <div class="sg-demo">
                    <div class="sg-row" id="icon-grid" style="gap:1rem;"></div>
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
                    ["brand", "Brand text left of the separator."],
                    ["brand-icon", "Icon name rendered before the brand text."],
                    ["brand-href", "Brand link target (default <code>#/</code>, scope-aware)."],
                    ["app-name", "Accent-colored text after “BRAND ·”."],
                    ["host-href / host-label / host-icon", "Attribute form of the host jump alone, for static pages. A hosted app sets the <code>host</code> property instead. Icon default <code>home</code>."],
                ])}
                ${table("Property", [
                    ["host", "THE injection point of the app contract — one line in <code>mount()</code>: <code>nav.host = context.host</code>. Shape <code>{ name, icon, href, nav, toolbar }</code>: name/icon/href render the muted “⌂ SACRVM APPKIT ·” jump before the brand (visible at the top of this page); <code>nav</code> entries (<code>{label, href, icon?}</code>) become a labeled host group at the top of the burger panel — the suite's cross-app navigation (open the burger: “SACRVM APPKIT” is that group); <code>toolbar</code> entries (<code>{icon, label?, title?, href?|onClick?}</code>) render as controls at the right end of the ribbon — a signed-in user, a suite-wide action (the GitHub button up right is one). They are real <code>.nav-icon-btn</code> elements in the light DOM — the exact same recipe as the app's own ribbon buttons (labeled entries get the <code>.labeled</code> pill variant), so host controls and app controls always look alike. Routes already listed in the host group are dropped from the app's own group, so a shared-page suite lists nothing twice. <code>null</code> = standalone, none of it renders."],
                    ["sections", "The app's OWN sub-navigation, <b>optional</b>: <code>[{label, href, icon?}]</code>. Entirely the app's choice — a simple app sets nothing and its suite entry stays a plain point. When set and a host group is present, the entries nest indented under the app's own entry in the burger — one tree, the suite with the running app unfolded (open the burger on this page: the Style Guide's five sections hang under its entry). Standalone the same entries are the panel's flat list. This app sets it from the same data as its rail: <code>nav.sections = SECTIONS.map(s =&gt; ({ label, href: ctx.href(s.id), icon }))</code>."],
                ])}
                ${table("Slot", [
                    ["context", "For persistent controls (the theme switcher above lives here)."],
                    ["toolbar", "Right-aligned content — the <em>owner's</em> chrome: whoever writes the <code>&lt;sac-nav&gt;</code> markup puts their own buttons here. There is no projection surface; an app draws its own toolbar in its own area (see Orb Lab). Use the <code>.toolbar</code> recipe for sizing."],
                ])}
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
                ])}

                <h2 id="sac-launcher">&lt;sac-launcher&gt;</h2>
                <p>One tile per app in the <code>sac.apps</code> registry. Light DOM, so the
                   global <code>.grid</code>/<code>.tile</code> patterns apply — the one
                   documented exception to the shadow rule. Page apps are real links, window
                   apps real buttons. The manifest decides the tile's look
                   (<code>badge</code>, <code>tile</code> footprint — see sac.apps in
                   Helpers); a <code>storage</code> key adds the persisted user layer.
                   This demo is storage-less; the demo app's hub is the live one.</p>
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
                    ["sac:launcher-change", "detail { order, hidden, customCount } after every user change (move / hide / show / add / remove). Bubbles + composed."],
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
                    ["title, width, height, top, left", "Geometry + title. width/height/top/left accept any CSS length."],
                    ["open", "Presence = visible."],
                    ["minimized", "Collapsed to the title bar: body and resize handle hidden, configured width kept. Still draggable, not resizable. Reflected."],
                    ["maximized", "Filled to the viewport with an 8px inset, the top clearing the fixed 50px nav ribbon. Neither draggable nor resizable. Reflected, and mutually exclusive with <code>minimized</code>."],
                    ["controls", "Space-separated subset of <code>min max close</code> — which traffic lights render. Absent = all three. Without <code>max</code>, double-clicking the title bar does nothing. Runtime changes apply (CSS token matching); the methods stay callable."],
                    ["no-resize", "Boolean: no resize handle, no resizing. Dragging is unaffected. An app manifest sets these two via <code>controls</code> / <code>resizable: false</code> (see sac.apps in Helpers)."],
                ])}
                ${table("Method", [
                    ["open() / close() / toggle()", "Show, hide, flip. open() also brings to front."],
                    ["bringToFront()", "Z-index walk over all sac-windows (base 10000)."],
                    ["minimize() / maximize()", "Enter either state. Each clears the other; leaving <code>maximized</code> puts the saved rect back first."],
                    ["restore()", "Back to the saved rect from either state, clamped in case the viewport shrank meanwhile."],
                ])}
                ${table("Event", [
                    ["open / close", "detail.window = the element."],
                    ["sac:window-minimize / -maximize / -restore", "Bubbles + composed, <code>detail.window</code> = the element. The restore event covers the return from either state."],
                ])}

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
                ])}
                ${table("Property", [
                    ["position", "get/set, normalized to one decimal (<code>\"34.2%\"</code>). Setting it does NOT fire sac:split-change (the caller already knows); user interaction does."],
                ])}
                ${table("Slot", [
                    ["start", "Left (horizontal) / top (vertical) panel. Scrolls its own overflow."],
                    ["end", "Right / bottom panel. Same."],
                ])}
                ${table("Event", [
                    ["sac:split-change", "detail { position } — the percent string. Fired live during a drag, on keyboard moves, on the double-click reset, and when a container resize forces a clamp; never when the app sets it itself."],
                ])}
                ${table("CSS custom property", [
                    ["--split-divider", "Thickness of the divider's grab zone (default 9px). The hairline inside stays 1px."],
                ])}
                ${table("Keyboard", [
                    ["Divider", "<kbd>←</kbd>/<kbd>→</kbd> (vertical split: <kbd>↑</kbd>/<kbd>↓</kbd>) move 1%, <kbd>Shift</kbd> 5%, <kbd>Home</kbd>/<kbd>End</kbd> jump to the clamped extremes. Double-click resets to the starting position."],
                ])}
                ${code(`<sac-split direction="horizontal" position="30%" min-start="150px" min-end="200px">
    <div slot="start">…left panel…</div>
    <div slot="end">…right panel…</div>
</sac-split>`)}
                <p class="sg-note"><b>Resizable sidebar:</b> the workspace layout (fixed 50px nav +
                   sidebar + viewport) becomes resizable by wrapping the sidebar and the viewport in one
                   split. <code>min-start</code> keeps the sidebar usable, <code>min-end</code> protects
                   the canvas; the sidebar hands its own 260px width over to the panel.</p>
                ${code(`<div class="main-layout">
    <sac-split style="flex:1" position="20%" min-start="180px" min-end="320px">
        <aside class="sidebar" slot="start" style="width:100%;height:100%">…</aside>
        <section class="viewport" slot="end">…</section>
    </sac-split>
</div>`)}
                ${code(`// The attribute is already the truth — persist it as it comes:
split.addEventListener("sac:split-change", (e) => localStorage.setItem("sidebar", e.detail.position));
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

                <h2 id="sac-section">&lt;sac-section&gt;</h2>
                <p>Sidebar group separator: uppercase title + thin border.</p>
                <div class="sg-demo" style="max-width:280px;background:var(--panel);">
                    <sac-section title="Filters">
                        <sac-toggle label="Show hidden" checked></sac-toggle>
                        <sac-toggle label="Snap to grid"></sac-toggle>
                    </sac-section>
                    <sac-section title="Export">
                        <button class="btn">Export</button>
                    </sac-section>
                </div>
                ${table("Attribute", [["title", "Uppercase heading text."]])}

                <h2 id="sac-toggle">&lt;sac-toggle&gt;</h2>
                <div class="sg-demo sg-col">
                    <sac-toggle id="demo-toggle" label="Enabled" checked></sac-toggle>
                    <span id="demo-toggle-state" style="color:var(--text-muted);font-size:0.85rem;">state: true</span>
                </div>
                ${table("Attribute", [["label", "Text left of the switch."], ["checked", "Presence = on. Property <code>.checked</code> mirrors it."]])}
                ${table("Event", [["change", "detail = boolean (bubbles, composed)."]])}

                <h2 id="sac-slider">&lt;sac-slider&gt;</h2>
                <p>Range slider with live value readout. <strong>All seven attributes are observed</strong>,
                   and value changes update the DOM in place — dragging never re-renders.</p>
                <div class="sg-demo sg-col">
                    <sac-slider id="demo-slider" label="Depth" min="0" max="100" step="1" value="40" suffix="px"></sac-slider>
                    <sac-slider label="Quality" min="0" max="2" step="1" value="1" labels="Low,Medium,High"></sac-slider>
                    <span id="demo-slider-state" style="color:var(--text-muted);font-size:0.85rem;">value: 40</span>
                </div>
                ${table("Attribute", [
                    ["label / min / max / step / value / suffix", "The usual suspects. Property <code>.value</code> mirrors the attribute."],
                    ["labels", "Comma-separated texts mapped by integer value — turns the readout into discrete steps."],
                ])}
                ${table("Event", [["input", "On drag; detail = string value."], ["change", "On release; detail = string value."]])}

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
                ${table("Event", [["change", "detail = new value (string)."]])}

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
                    ["sac:color-change", "detail { value } — the hex string. Fired on USER changes only (drag, arrow key, valid typing) and only when the resulting hex actually differs from the last one, so a drag that wanders two pixels inside the same color stays quiet."],
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
                ${code(`picker.addEventListener("sac:color-change", (e) => {
    brush.color = e.detail.value;        // "#3b82f6" — or "#3b82f699" with [alpha]
});
picker.value = "#10b981";                // updates in place, fires nothing`)}

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
                    ["sac:color-change", "detail { value } — the normalized hex. Fired on USER changes only: a committed hex entry, or any picker interaction. The inner picker's identically named event is stopped at the boundary, so apps see exactly one."],
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

field.addEventListener("sac:color-change", (e) => paint(e.detail.value));
field.value = "#22c55e";   // programmatic — updates the UI, fires nothing`)}

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
                    ["sac:swatch-select", "detail { value, swatch }. Fires only on a user click or keyboard activation that selects a different, non-disabled swatch — never for programmatic <code>selected</code> writes or the <code>.colors</code> setter."],
                ])}
                ${table("Keyboard", [
                    ["Grid", "Always on, with or without <code>selectable</code>: arrow keys walk the grid in 2D, <kbd>Home</kbd>/<kbd>End</kbd> jump to the ends, and a roving tabindex keeps exactly one swatch in the page's tab order — <kbd>Tab</kbd> resumes where you left off."],
                ])}
                ${code(`<sac-swatch-grid columns="8" selectable>
    <sac-swatch value="#ef4444" label="Red"></sac-swatch>
    <sac-swatch value="#eab308" label="Yellow" count="3"></sac-swatch>
    <sac-swatch value="transparent" label="No color"></sac-swatch>
</sac-swatch-grid>

grid.addEventListener("sac:swatch-select", (e) => setBrush(e.detail.value));
grid.colors = [{ value: "#ef4444", label: "Red" }];   // bulk rebuild, no event`)}

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
                                  style="--calendar-width:240px;"></sac-calendar>
                    <div class="sg-col" style="gap:0.6rem;min-width:200px;">
                        <code id="demo-cal-out">waiting for a selection…</code>
                        <p class="sg-note" style="margin:0;">Both calendars report into the same
                           line. The right one is bounded (min/max) and starts its weeks on Sunday.</p>
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
                    ["sac:date-change", "detail { value } — the ISO string. Fired on USER selection only (click, <kbd>Enter</kbd>/<kbd>Space</kbd>) and only when the date actually changes — re-selecting the selected day stays quiet."],
                ])}
                ${table("CSS custom property", [
                    ["--calendar-width", "Width of the whole calendar. Default <code>280px</code>."],
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
                ${code(`cal.addEventListener("sac:date-change", (e) => {
    load(e.detail.value);        // "2026-08-15"
});
cal.value = "2026-12-24";        // selects + shows December, fires nothing`)}

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
                    ["sac:date-change", "detail { value } — the normalized ISO, or <code>\"\"</code> when the user cleared the input. Fired on USER changes only: a committed typed date or a picked day. The inner calendar's identically named event is stopped at the boundary, so apps see exactly one."],
                ])}
                ${table("CSS custom property", [
                    ["--calendar-width", "Set on the field, forwarded to the popover's <code>&lt;sac-calendar&gt;</code>. Default <code>280px</code>."],
                ])}
                ${table("Interaction", [
                    ["Calendar button", "Click drops the calendar below the field (built on first open); an outside click, a re-click, <kbd>Esc</kbd> or picking a day closes it, focus returning to the button. The popover is <code>position: fixed</code> on the dropdown layer and flips above the field when there is no room below."],
                    ["Date input", "A tolerant ISO date (<code>2026-8-5</code>) + <kbd>Enter</kbd> commits and normalizes; invalid or out-of-range text is marked in <code>--danger</code> and reverts on blur or <kbd>Esc</kbd>."],
                ])}
                ${code(`<sac-date-field label="Due" value="2026-08-15"></sac-date-field>
<sac-date-field label="This year" value="2026-08-15" min="2026-01-01" max="2026-12-31"></sac-date-field>

field.addEventListener("sac:date-change", (e) => plan(e.detail.value));
field.value = "2026-09-01";   // programmatic — updates the UI, fires nothing`)}

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
                ${table("Event", [["sac:collapse-toggle", "detail { expanded }."]])}
                ${table("Method", [["measure()", "Re-run overflow detection (escape hatch)."]])}

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
                ${table("Event", [["chip-remove", "detail { label } (only with [removable])."]])}

                <h2 id="sac-chip-input">&lt;sac-chip-input&gt;</h2>
                <p>Combobox for a list of named chips — chips + input + filtered dropdown. Decoupled
                   from any backend: you supply <code>.suggestions</code>, you persist on
                   <code>change</code> / <code>chip-create</code>.</p>
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
                    ["change", "detail = string[] (new list)."],
                    ["chip-create", "detail { name, color } — persist it, then refresh .suggestions."],
                ])}
                ${table("Keyboard", [
                    ["Input", "<kbd>Tab</kbd> / <kbd>Enter</kbd> / comma commit the highlighted (or top) entry · <kbd>Esc</kbd> closes the dropdown without committing · <kbd>↓</kbd>/<kbd>↑</kbd> move the highlight · <kbd>Backspace</kbd> on an empty input removes the last chip."],
                ])}

                <h2 id="sac-drop-zone">&lt;sac-drop-zone&gt;</h2>
                <p>One surface for both ways files arrive: drag files onto it, click it, or focus it and
                   press <kbd>Enter</kbd> — every gesture ends in the same <code>sac:files</code> event,
                   so an app wires one listener and never asks which gesture the user chose.</p>
                <div class="sg-demo sg-col" style="max-width:520px;">
                    <sac-drop-zone id="demo-drop" accept=".svg,.png,image/*" multiple
                                   label="Drop images here" hint="or click to browse"></sac-drop-zone>
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
                ])}
                ${table("CSS shadow part", [
                    ["zone", "The dashed surface itself, for the rare app that needs to reshape it."],
                ])}
                ${code(`<sac-drop-zone accept=".svg,image/*" multiple
               label="Drop your SVG here" hint="or click to browse"></sac-drop-zone>`)}
                ${code(`zone.addEventListener("sac:files", (e) => {
    for (const file of e.detail.files) console.log(file.name, file.size);
});
zone.addEventListener("sac:rejected", (e) => {
    sac.toast(\`\${e.detail.files.length} file(s) of the wrong type.\`, { kind: "warn" });
});`)}

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
                   to an error glyph on failure; nothing moves, nothing resizes.</p>
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
                    ["select", "detail also carries additive (ctrl/cmd) and range (shift) for multi-selection."],
                    ["toggle-visibility", "detail.visible = requested new state (host applies it)."],
                    ["toggle-expand / delete / change-color", "detail.expanded / — / detail.color."],
                ])}

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
                ${table("Slot", [
                    ["trigger", "The element that opens the menu (a <code>.btn</code>, an icon button, …). Kept in sync with <code>aria-haspopup</code> / <code>aria-expanded</code>."],
                    ["(default)", "Menu items: <code>&lt;button data-action=\"…\"&gt;</code>. An <code>&lt;hr&gt;</code> draws a separator; <code>data-danger</code> tints the hover state with <code>--danger</code>. Icons inside items inherit <code>--icon-size: 16px</code> from the panel."],
                ])}
                ${table("Attribute / Method", [
                    ["open", "Presence = panel visible. Reflected by the methods; settable directly (it positions itself either way)."],
                    ["open() / close() / toggle()", "Show, hide, flip. <code>open()</code> anchors the panel to the trigger's viewport rect and shows it in the <strong>top layer</strong> (<code>popover</code>), so neither a clipping ancestor nor a transformed one can reach it — a menu works inside a <code>.tile</code>, which is both. It flips above the trigger when there is no room below, and re-anchors on scroll/resize."],
                ])}
                ${table("Event", [["sac:menu-select", "detail { action }."]])}
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

menu.addEventListener("sac:menu-select", e => console.log(e.detail.action));`)}

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
                        <span style="color:var(--text-dim);font-size:0.85rem;">…or press
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
                    ["opts.description", "Shown by <code>list()</code> (and any shortcuts help screen)."],
                    ["opts.allowInInput", "Combos without ctrl/alt/meta are ignored while the user types in an input, textarea, select or contenteditable — including inside Shadow DOM. This opts out."],
                    ["Same combo twice", "A stack: the newest registration wins, unregistering it restores the previous one. That is what makes a modal's temporary binding safe."],
                    ["list() / format(combo)", "<code>[{ combo, display, description }]</code> for every active binding · a platform-aware display string (<code>\"Ctrl+Shift+X\"</code> / <code>\"⌃⇧X\"</code>)."],
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

                <h2 id="sac-tooltip">&lt;sac-tooltip&gt;</h2>
                <p>Wraps a trigger (default slot) and shows a small glass bubble beside it — hover
                   after a 400ms delay, focus immediately. The bubble is <code>position: fixed</code>
                   in the shadow root, so it escapes clipping ancestors, and clamps to the viewport
                   with 8px margins; scroll and resize <em>hide</em> it rather than chase it.
                   Cross-root ARIA can't point a light-DOM trigger at a shadow bubble, so this is a
                   <strong>visual affordance only</strong>: keep an <code>aria-label</code> on
                   icon-only triggers.</p>
                <div class="sg-demo" style="padding-bottom:2.75rem">
                    <div class="sg-row">
                        <sac-tooltip content="Bubble above the trigger" placement="top"><button class="btn" style="width:auto">top</button></sac-tooltip>
                        <sac-tooltip content="Bubble below the trigger" placement="bottom"><button class="btn" style="width:auto">bottom</button></sac-tooltip>
                        <sac-tooltip content="Bubble left of the trigger" placement="left"><button class="btn" style="width:auto">left</button></sac-tooltip>
                        <sac-tooltip content="Bubble right of the trigger" placement="right"><button class="btn" style="width:auto">right</button></sac-tooltip>
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
                ${table("Property", [["theme", "get/set \"dark\" | \"light\" | \"auto\". Setting applies + persists + re-highlights the pill (no event — that's reserved for user clicks)."]])}
                ${table("Event", [["sac:theme-changed", "Fired on click; detail { theme } (bubbles, composed)."]])}
            </div>
            `;
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
                win.setAttribute("title", "Demo Window");
                win.setAttribute("width", "360px");
                win.setAttribute("height", "240px");
                win.setAttribute("left", `${Math.max((window.innerWidth - 360) / 2, 20)}px`);
                win.setAttribute("top", "140px");
                win.innerHTML = `<p>Drag the title bar, resize at the bottom-right corner. The dots
                                    minimize, maximize and close — or double-click the title bar.</p>`;
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
            ["sac:window-minimize", "sac:window-maximize", "sac:window-restore"].forEach(type => {
                document.addEventListener(type, (e) => {
                    if (e.detail.window.id !== "sg-demo-window") return;
                    const out = document.getElementById("demo-window-state");
                    if (out) out.textContent = `${type.replace("sac:window-", "")}d`;
                });
            });
        }

        // Split — the event bubbles, so the outer host also hears the nested one.
        const splitOut = root.querySelector("#demo-split-out");
        const splitOuter = root.querySelector("#demo-split");
        splitOuter.addEventListener("sac:split-change", (e) => {
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
        root.querySelector("#demo-toggle").addEventListener("change", (e) => {
            toggleState.textContent = `state: ${e.detail}`;
        });

        // Slider
        const sliderState = root.querySelector("#demo-slider-state");
        root.querySelector("#demo-slider").addEventListener("input", (e) => {
            if (e.detail != null) sliderState.textContent = `value: ${e.detail}`;
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
        root.querySelector("#demo-seg").addEventListener("change", (e) => {
            if (typeof e.detail === "string") segState.textContent = `value: ${e.detail}`;
        });

        // Color picker — both instances report into one readout line.
        const pickOut = root.querySelector("#demo-picker-out");
        const pickDot = root.querySelector("#demo-picker-dot");
        const showColor = (label, value) => {
            pickOut.textContent = `${label} → ${value}`;
            pickDot.style.background = value;
        };
        root.querySelector("#demo-picker").addEventListener("sac:color-change",
            (e) => showColor("opaque", e.detail.value));
        root.querySelector("#demo-picker-alpha").addEventListener("sac:color-change",
            (e) => showColor("alpha", e.detail.value));

        // Color field — newest line on top, six lines kept.
        const cfOut = root.querySelector("#demo-color-field-out");
        [["Accent", "#demo-color-field"], ["Glow", "#demo-color-field-alpha"]].forEach(([name, sel]) => {
            root.querySelector(sel).addEventListener("sac:color-change", (e) => {
                const row = document.createElement("div");
                row.textContent = `${name} → ${e.detail.value}`;
                cfOut.prepend(row);
                while (cfOut.children.length > 6) cfOut.lastChild.remove();
            });
        });

        // Swatch grid — selection readout plus the .colors bulk rebuild.
        const swatches = root.querySelector("#demo-swatches");
        const swatchState = root.querySelector("#demo-swatches-state");
        swatches.addEventListener("sac:swatch-select", (e) => {
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
        root.querySelector("#demo-cal").addEventListener("sac:date-change",
            (e) => showDate("free", e.detail.value));
        root.querySelector("#demo-cal-bounded").addEventListener("sac:date-change",
            (e) => showDate("bounded", e.detail.value));

        // Date field — newest line on top, six lines kept.
        const dfOut = root.querySelector("#demo-date-field-out");
        [["Due", "#demo-date-field"], ["This year", "#demo-date-field-bounded"]].forEach(([name, sel]) => {
            root.querySelector(sel).addEventListener("sac:date-change", (e) => {
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
        chips.addEventListener("change", (e) => {
            chipsState.textContent = `value: ${JSON.stringify(e.detail)}`;
        });
        chips.addEventListener("chip-create", (e) => {
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
        ["select", "toggle-visibility", "toggle-expand", "delete", "change-color"].forEach(type => {
            scene.addEventListener(type, (e) => {
                sceneLog.textContent = `${type}: ${JSON.stringify(e.detail)}`;
                // Demo-only: actually apply visibility so the eye toggles.
                if (type === "toggle-visibility") {
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
        root.querySelector("#demo-menu").addEventListener("sac:menu-select", (e) => {
            menuResult.textContent = `selected: ${e.detail.action}`;
        });

        // Command palette — a live button plus two demo commands. register()
        // upserts by id, so re-entering this view never duplicates them; the
        // hotkey is torn down first so it doesn't stack.
        root.querySelector("#palette-open").addEventListener("click", () => sac.palette.open());

        sac.commands.register({
            id: "sg-say-hello", label: "Say hello", icon: "info",
            group: "Style guide",
            run: () => sac.toast("Hello from the command palette.", { kind: "info" }),
        });
        sac.commands.register({
            id: "sg-toast-demo", label: "Toast a success message", icon: "success",
            group: "Style guide", hotkey: "mod+shift+x",
            run: () => sac.toast("Ran from the palette.", { kind: "success" }),
        });
        if (demoHotkeyOff) demoHotkeyOff();
        demoHotkeyOff = sac.hotkeys.register(
            "mod+shift+x",
            () => sac.toast("Ran from the keyboard.", { kind: "success" }),
            { description: "Toast a success message" }
        );

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
        root.querySelector("#demo-theme-toggle").addEventListener("sac:theme-changed", (e) => {
            themeState.textContent = `theme: ${e.detail.theme}`;
        });
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
                   <strong>window tiles</strong> (dashed) open a lazy app in a
                   <code>&lt;sac-window&gt;</code> via <code>sac.apps</code>, <code>?app=&lt;id&gt;</code>
                   deep links included. The modern shape is <code>&lt;sac-launcher&gt;</code> — one tile
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
                   <code>&lt;a class="tile tile-window" data-app="foo"&gt;</code> — and
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

                <h2>The one rule that matters</h2>
                <p class="sg-note"><b>Views use light DOM, components use Shadow DOM.</b> Views are composed
                   from the global classes (<code>.grid</code>, <code>.tile</code>, <code>.btn</code>) and
                   need ui.css to reach them; components need style isolation so a view's CSS can't reach
                   in. Guess wrong and either your view is unstyled or your component leaks.</p>
                <p class="sg-note"><b>Scrollbar caveat:</b> the global scrollbar rules in ui.css do
                   <em>not</em> pierce Shadow DOM. A component with its own scrollable shadow content must
                   duplicate them (all kit components already do).</p>
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
                        <select>
                            <option>Precision</option>
                            <option>Balanced</option>
                            <option>Fast</option>
                        </select>
                    </div>
                    <div class="sg-row" style="gap:1.25rem;">
                        <label style="display:flex;align-items:center;gap:6px;margin:0;text-transform:none;font-size:0.85rem;color:var(--text);font-weight:400;"><input type="checkbox" checked> Checkbox</label>
                        <label style="display:flex;align-items:center;gap:6px;margin:0;text-transform:none;font-size:0.85rem;color:var(--text);font-weight:400;"><input type="radio" name="r" checked> Radio</label>
                    </div>
                </div>
                <p class="sg-note"><b>The select trap:</b> the chevron is a background-<em>image</em>.
                   Sizing classes may add padding/width but must <strong>never re-declare the
                   <code>background</code> shorthand</strong> — that wipes the chevron. Set
                   <code>background-color</code> if you need a different fill.</p>

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
                <p>Variants: <code>.tile.large</code> (2 columns), <code>.tile-window</code> (dashed =
                   overlay tool), <code>.tile.disabled</code> (grayscale — but prefer the no-dead-tiles
                   rule: don't show what doesn't work), <code>.tile-badge</code> (+<code>.accent</code>).</p>
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
                        <a class="tile tile-window" href="#/styleguide/patterns">
                            <sac-icon name="lightbulb"></sac-icon>
                            <div><h2 style="font-size:1.2rem;">Overlay tile</h2><p>Dashed = opens a window.</p></div>
                        </a>
                    </div>
                </div>

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
                    <tr><td><code>.pz-layer</code></td><td>absolute inset:0, transform-origin 0 0 — the layer sac.setupPanZoom() transforms.</td></tr>
                    <tr><td><code>#app-root</code></td><td>SPA mount point, nav padding included.</td></tr>
                </table>
                <p class="sg-note"><b>Reduced motion:</b> a global <code>prefers-reduced-motion</code>
                   query in <code>ui.css</code> collapses animation/transition durations app-wide, but it
                   does not pierce Shadow DOM — components with their own animations carry their own
                   query too.</p>
            </div>
            `;
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
<script defer src="kit/js/lib/color.js"><\/script>      <!-- required by the color components -->
<!-- vendor (optional, for markdown): marked + purify -->
<!-- components in any order, then views -->`)}

                <p>Or load everything with one tag — <code>kit/js/all.js</code> injects the libs and every
                   component in order. Cherry-picking stays the recommended production path.</p>
                ${code(`<script src="kit/js/all.js"><\/script>`)}

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
                <p>Each layer must fill its pane — the kit's <code>.pz-layer</code> class does exactly that.</p>

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
                    <tr><td><code>open(id, params?)</code></td><td><code>Promise&lt;HTMLElement&gt;</code> (the app element). <code>kind:"page"</code> navigates to <code>href</code> (params appended, promise never resolves). <code>kind:"window"</code> injects <code>src</code> once (keyed by src), awaits <code>customElements.whenDefined(tag)</code>, shows the app in a centered, cascaded <code>&lt;sac-window&gt;</code> that stays in the DOM and is re-opened later (minimized → restored). Rejects on script-load failure (console.error + error toast).</td></tr>
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
            { icon: "user", label: "chloe", onClick: () => openAccount() },
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
                    <tr><td><code>tag</code>, <code>src</code></td><td>window + view: the app's single custom element + its classic script, injected once on first open. The script guards its definition with <code>customElements.get</code> and registers no other tags; the element fills its window (<code>height: 100%</code> is set for you).</td></tr>
                    <tr><td><code>width</code>, <code>height</code></td><td>window only: <code>sac-window</code> size (defaults 500px / 600px).</td></tr>
                    <tr><td><code>accent</code></td><td>window only, optional: set as <code>--accent</code> on the window — the per-app retheme.</td></tr>
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
                    <tr><td><code>host</code> <b>(view)</b></td><td><code>{ name, icon, href }</code> — the host's presence, from <code>init({ host })</code>; <code>null</code> when the host declared none and always <code>null</code> standalone. The app copies it onto its own <code>&lt;sac-nav&gt;</code>'s <code>host-*</code> attributes; that jump is the ONLY thing a host adds to an app's chrome.</td></tr>
                    <tr><td><code>deepLink.set(…)</code></td><td>view: <code>set(route)</code> writes <code>#/&lt;id&gt;/&lt;route&gt;</code> (replaceState — switching sections is not a new history entry). window/page: <code>set(obj)</code> writes <code>?app=&lt;id&gt;&amp;&lt;obj entries&gt;</code>; <code>set(null)</code> cleans back to the bare path (hash preserved).</td></tr>
                    <tr><td><code>theme.get()</code></td><td>The flag: <code>"dark"</code> | <code>"light"</code> | <code>"auto"</code>.</td></tr>
                    <tr><td><code>theme.set(mode)</code></td><td>Same values; routes through <code>&lt;sac-theme-toggle&gt;</code> when present (one source of truth: <code>data-theme</code> on <code>&lt;html&gt;</code> + the <code>sac-theme</code> localStorage key).</td></tr>
                    <tr><td><code>theme.onChange(cb)</code></td><td><code>cb(resolved)</code> with <code>"dark"</code>/<code>"light"</code> on every effective change, incl. OS flips in auto. Returns an unsubscribe function.</td></tr>
                    <tr><td><code>fs</code></td><td>Storage scoped to this app — see <code>sac.fs</code> below. <code>null</code> when the host did not load <code>lib/fs.js</code>, so an app checks before reaching for it.</td></tr>
                    <tr><td><code>identity</code></td><td>Who is at this desktop — see <code>sac.identity</code> below. Read-only for apps, and <code>null</code> when the host granted none.</td></tr>
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
                    <tr><td><code>write(path, value)</code></td><td>Stores any JSON-serializable value. <b>Rejects</b> when there is no room left, or when the value is a function, a symbol or <code>undefined</code> — quota is the one failure an app can act on, so it arrives as a rejection rather than a swallowed console line.</td></tr>
                    <tr><td><code>remove(path)</code></td><td>Deletes one path.</td></tr>
                    <tr><td><code>list(prefix = "")</code></td><td>App-relative paths, sorted. <code>list("notes/")</code> is how a collection is enumerated.</td></tr>
                    <tr><td><code>clear()</code></td><td>Deletes everything this app stored — and only what this app stored.</td></tr>
                    <tr><td><code>usage()</code></td><td><code>{ bytes, count }</code>. A host uses this to show what an app is keeping, or to offer deleting it.</td></tr>
                    <tr><td><code>watch(cb)</code></td><td><code>cb(path, value)</code> on every change, <code>value === null</code> for a delete — including writes from <b>another tab</b> of the same origin. Returns an unsubscribe.</td></tr>
                </table>
                <p>Paths are slash-separated strings; leading, trailing and empty segments are
                   stripped, and <code>..</code> is not a way out of the app's own root. Values are
                   JSON — not Blobs: binary needs a backend that can hold it, and that is exactly the
                   point at which a host supplies its own.</p>
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
                <p class="sg-note">Standalone, the same handle comes from the app's tag with the
                   <code>app-</code> prefix removed (<code>&lt;app-notes&gt;</code> → <code>notes</code>).
                   Follow the template's naming — <code>tag = "app-" + id</code> — and an app keeps
                   its data when it moves from its own page onto a desktop.</p>

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

                <h2>sac.i18n / sac.t — kit UI strings</h2>
                <p><code>sac.i18n</code> is a flat key table for the kit's few own UI strings
                   (tooltips, aria-labels, button text); components read them via
                   <code>sac.t(key, fallback)</code>, so with an empty table everything renders its
                   inline English fallback — zero setup. Language is boot-time, like the browser
                   locale that drives the Intl month names: assign the table in a deferred script
                   loaded AFTER <code>globals.js</code> and BEFORE the component scripts.</p>
                ${code(`<script defer src="kit/js/lib/globals.js"><\/script>
<script defer>
    Object.assign(sac.i18n, {
        "window.close":        "Schließen",
        "calendar.prev-month": "Voriger Monat",
        "launcher.hide":       "{name} ausblenden",
    });
<\/script>
<!-- component scripts after this -->`)}
                <table class="sg">
                    <tr><th style="width:260px">Key</th><th>English default</th><th style="width:160px">Component</th></tr>
                    <tr><td><code>calendar.prev-decade</code></td><td><code>Back 10 years</code></td><td>sac-calendar</td></tr>
                    <tr><td><code>calendar.prev-year</code></td><td><code>Previous year</code></td><td>sac-calendar</td></tr>
                    <tr><td><code>calendar.prev-month</code></td><td><code>Previous month</code></td><td>sac-calendar</td></tr>
                    <tr><td><code>calendar.next-month</code></td><td><code>Next month</code></td><td>sac-calendar</td></tr>
                    <tr><td><code>calendar.next-year</code></td><td><code>Next year</code></td><td>sac-calendar</td></tr>
                    <tr><td><code>calendar.next-decade</code></td><td><code>Forward 10 years</code></td><td>sac-calendar</td></tr>
                    <tr><td><code>chip.remove</code></td><td><code>Remove</code></td><td>sac-chip</td></tr>
                    <tr><td><code>chip-input.add</code></td><td><code>Add</code></td><td>sac-chip-input</td></tr>
                    <tr><td><code>chip-input.no-matches</code></td><td><code>no matches</code></td><td>sac-chip-input</td></tr>
                    <tr><td><code>chip-input.create</code></td><td><code>Create "{name}"</code></td><td>sac-chip-input</td></tr>
                    <tr><td><code>chip-input.pick-color</code></td><td><code>Pick color for "{name}"</code></td><td>sac-chip-input</td></tr>
                    <tr><td><code>collapsible.more</code></td><td><code>more</code></td><td>sac-collapsible</td></tr>
                    <tr><td><code>collapsible.less</code></td><td><code>less</code></td><td>sac-collapsible</td></tr>
                    <tr><td><code>color-field.choose-color</code></td><td><code>Choose color</code></td><td>sac-color-field</td></tr>
                    <tr><td><code>color-field.hex-color</code></td><td><code>Hex color</code></td><td>sac-color-field</td></tr>
                    <tr><td><code>color-field.color-picker</code></td><td><code>Color picker</code></td><td>sac-color-field</td></tr>
                    <tr><td><code>color-picker.title</code></td><td><code>Color picker</code></td><td>sac-color-picker</td></tr>
                    <tr><td><code>color-picker.saturation-value</code></td><td><code>Saturation and value</code></td><td>sac-color-picker</td></tr>
                    <tr><td><code>color-picker.saturation-value-text</code></td><td><code>saturation {s}%, value {v}%</code></td><td>sac-color-picker</td></tr>
                    <tr><td><code>color-picker.hue</code></td><td><code>Hue</code></td><td>sac-color-picker</td></tr>
                    <tr><td><code>color-picker.opacity</code></td><td><code>Opacity</code></td><td>sac-color-picker</td></tr>
                    <tr><td><code>color-picker.red</code></td><td><code>Red</code></td><td>sac-color-picker</td></tr>
                    <tr><td><code>color-picker.green</code></td><td><code>Green</code></td><td>sac-color-picker</td></tr>
                    <tr><td><code>color-picker.blue</code></td><td><code>Blue</code></td><td>sac-color-picker</td></tr>
                    <tr><td><code>color-picker.hex-color</code></td><td><code>Hex color</code></td><td>sac-color-picker</td></tr>
                    <tr><td><code>copy-button.copy</code></td><td><code>Copy</code></td><td>sac-copy-button</td></tr>
                    <tr><td><code>date-field.date</code></td><td><code>Date</code></td><td>sac-date-field</td></tr>
                    <tr><td><code>date-field.placeholder</code></td><td><code>yyyy-mm-dd</code></td><td>sac-date-field</td></tr>
                    <tr><td><code>date-field.choose-date</code></td><td><code>Choose date</code></td><td>sac-date-field</td></tr>
                    <tr><td><code>date-field.calendar</code></td><td><code>Calendar</code></td><td>sac-date-field</td></tr>
                    <tr><td><code>drop-zone.label</code></td><td><code>Drop files here</code></td><td>sac-drop-zone</td></tr>
                    <tr><td><code>drop-zone.hint</code></td><td><code>or click to browse</code></td><td>sac-drop-zone</td></tr>
                    <tr><td><code>footer.link</code></td><td><code>LINK</code></td><td>sac-footer</td></tr>
                    <tr><td><code>help.load-failed</code></td><td><code>Failed to load documentation</code></td><td>help-loader</td></tr>
                    <tr><td><code>help.check-console</code></td><td><code>Check console for details.</code></td><td>help-loader</td></tr>
                    <tr><td><code>launcher.add-app</code></td><td><code>Add app</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.no-apps</code></td><td><code>No apps registered.</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.edit</code></td><td><code>Edit</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.done</code></td><td><code>Done</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.move-left</code></td><td><code>Move {name} left</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.move-right</code></td><td><code>Move {name} right</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.show</code></td><td><code>Show {name}</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.hide</code></td><td><code>Hide {name}</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.remove</code></td><td><code>Remove {name}</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.cancel</code></td><td><code>Cancel</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.add</code></td><td><code>Add</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.add-hint</code></td><td><code>The script is loaded on first open and must define the tag. Any URL works — including other sites.</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.field-name</code></td><td><code>Name</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.field-icon</code></td><td><code>Icon</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.field-tag</code></td><td><code>Tag</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.field-src</code></td><td><code>Script URL</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.field-width</code></td><td><code>Width</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.field-height</code></td><td><code>Height</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.placeholder-name</code></td><td><code>My App</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.placeholder-icon</code></td><td><code>shapes (a sac-icon name)</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.placeholder-tag</code></td><td><code>app-my-app</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.placeholder-src</code></td><td><code>apps/my-app.js or https://…</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.placeholder-width</code></td><td><code>500px</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.placeholder-height</code></td><td><code>600px</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.error-needs</code></td><td><code>An app needs {problems}.</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.error-name</code></td><td><code>a name</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.error-tag</code></td><td><code>a tag containing a dash</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>launcher.error-src</code></td><td><code>a script URL</code></td><td>sac-launcher</td></tr>
                    <tr><td><code>loader.loading</code></td><td><code>Loading...</code></td><td>sac-loader</td></tr>
                    <tr><td><code>log.header</code></td><td><code>LOG</code></td><td>sac-log</td></tr>
                    <tr><td><code>log.copy</code></td><td><code>Copy</code></td><td>sac-log</td></tr>
                    <tr><td><code>log.clear</code></td><td><code>Clear</code></td><td>sac-log</td></tr>
                    <tr><td><code>log.copied</code></td><td><code>Copied!</code></td><td>sac-log</td></tr>
                    <tr><td><code>nav.menu</code></td><td><code>Menu</code></td><td>sac-nav</td></tr>
                    <tr><td><code>nav.no-sections</code></td><td><code>No sections yet.</code></td><td>sac-nav</td></tr>
                    <tr><td><code>palette.title</code></td><td><code>Command palette</code></td><td>sac-command-palette</td></tr>
                    <tr><td><code>palette.placeholder</code></td><td><code>Type a command…</code></td><td>sac-command-palette</td></tr>
                    <tr><td><code>palette.search</code></td><td><code>Search commands</code></td><td>sac-command-palette</td></tr>
                    <tr><td><code>palette.commands</code></td><td><code>Commands</code></td><td>sac-command-palette</td></tr>
                    <tr><td><code>palette.group-views</code></td><td><code>Views</code></td><td>sac-command-palette</td></tr>
                    <tr><td><code>palette.group-actions</code></td><td><code>Actions</code></td><td>sac-command-palette</td></tr>
                    <tr><td><code>palette.empty</code></td><td><code>No matching commands</code></td><td>sac-command-palette</td></tr>
                    <tr><td><code>scene.unnamed</code></td><td><code>Unnamed</code></td><td>sac-scene-item</td></tr>
                    <tr><td><code>spinner.loading</code></td><td><code>Loading</code></td><td>sac-spinner</td></tr>
                    <tr><td><code>split.resize-panels</code></td><td><code>Resize panels</code></td><td>sac-split</td></tr>
                    <tr><td><code>stepper.decrease</code></td><td><code>Decrease</code></td><td>sac-stepper</td></tr>
                    <tr><td><code>stepper.increase</code></td><td><code>Increase</code></td><td>sac-stepper</td></tr>
                    <tr><td><code>theme-toggle.dark</code></td><td><code>Dark</code></td><td>sac-theme-toggle</td></tr>
                    <tr><td><code>theme-toggle.light</code></td><td><code>Light</code></td><td>sac-theme-toggle</td></tr>
                    <tr><td><code>theme-toggle.auto</code></td><td><code>Auto</code></td><td>sac-theme-toggle</td></tr>
                    <tr><td><code>toast.dismiss</code></td><td><code>Dismiss</code></td><td>sac-toast-stack</td></tr>
                    <tr><td><code>toast.notifications</code></td><td><code>Notifications</code></td><td>sac-toast-stack</td></tr>
                    <tr><td><code>window.minimize</code></td><td><code>Minimize</code></td><td>sac-window</td></tr>
                    <tr><td><code>window.maximize</code></td><td><code>Maximize</code></td><td>sac-window</td></tr>
                    <tr><td><code>window.close</code></td><td><code>Close</code></td><td>sac-window</td></tr>
                    <tr><td><code>window.restore</code></td><td><code>Restore</code></td><td>sac-window</td></tr>
                    <tr><td><code>window.default-title</code></td><td><code>Window</code></td><td>sac-window</td></tr>
                </table>
                <p class="sg-note"><b>Placeholders:</b> <code>{name}</code>, <code>{problems}</code>,
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
          html: patternsHtml },
        { id: "helpers",    label: "Helpers",          icon: "settings",
          html: helpersHtml,    wire: wireHelpers },
    ];

    /** "components/sac-calendar" → { id: "components", anchor: "sac-calendar" } */
    function splitRoute(route) {
        const parts = String(route || "").split("/").filter(Boolean);
        return { id: parts[0] || "", anchor: parts[1] || "" };
    }

    const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

    class AppStyleguide extends HTMLElement {
        connectedCallback() {
            if (this.firstElementChild) return;   // a stage swap re-connects
            ensureStyles();
            this._anchors = [];
            this._anchor = "";

            // The app is complete: its own nav, its own rail, its own
            // scrolling body. A host adds nothing but context.host.
            this._nav = document.createElement("sac-nav");
            this._nav.setAttribute("brand", "STYLE GUIDE");
            this._nav.setAttribute("brand-icon", "star");
            this._nav.setAttribute("brand-href", "#/styleguide");
            const ctxSlot = document.createElement("div");
            ctxSlot.slot = "context";
            ctxSlot.appendChild(document.createElement("sac-theme-toggle"));
            this._nav.appendChild(ctxSlot);

            const layout = document.createElement("div");
            layout.className = "main-layout";
            this._rail   = document.createElement("sac-sidebar");
            this._scroll = document.createElement("div");
            this._scroll.className = "app-scroll";
            this._body   = document.createElement("div");
            this._scroll.appendChild(this._body);
            layout.append(this._rail, this._scroll);
            this.append(this._nav, layout);
        }

        /** App contract: called once by sac.apps, right after the first insert. */
        mount(context) {
            this._ctx = context;
            // The host's injection (jump, suite nav, toolbar controls),
            // rendered by OUR nav. Null standalone — the nav shows nothing.
            this._nav.host = context.host;
            // Our own sections, offered to the burger: hosted they nest
            // under this app's suite entry, standalone they are the list.
            this._nav.sections = SECTIONS.map((s) =>
                ({ label: s.label, href: context.href(s.id), icon: s.icon }));
            const target = splitRoute(context.route);
            this._go(target.id, target.anchor, false);

            // Rail clicks, back/forward and pasted URLs arrive here.
            this._offRoute = context.onRoute((route) => {
                const next = splitRoute(route);
                this._go(next.id, next.anchor, true);
            });
        }

        unmount() {
            if (this._offRoute) { this._offRoute(); this._offRoute = null; }
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
                this._anchors = section.anchors
                    ? Array.from(this._body.querySelectorAll("h2[id]"),
                                 (h) => ({ id: h.id, label: h.textContent.trim() }))
                    : [];
            }
            this._anchor = this._anchors.some((a) => a.id === anchor) ? anchor : "";

            if (this._ctx) {
                this._ctx.deepLink.set(section.id + (this._anchor ? "/" + this._anchor : ""));
            }
            this._project();

            if (this._anchor) this._scrollToAnchor(this._anchor, animate && !swapped, swapped);
            else if (swapped) this._scroller().scrollTop = 0;
        }

        /** The rail is this app's OWN chrome — replaced on every move. */
        _project() {
            if (!this._ctx) return;
            const items = [
                { section: "Style guide" },
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
