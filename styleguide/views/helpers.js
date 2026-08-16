/**
 * <sg-helpers-view> (#/helpers) — the shared JS helpers + load order.
 */
(function () {
    const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const code = (s) => `<pre class="sg-code"><code>${esc(s)}</code></pre>`;

    class SgHelpersView extends HTMLElement {
        connectedCallback() {
            this.render();
            this.wire();
        }

        disconnectedCallback() {
            // pan-zoom listeners live on elements inside this view — removed
            // with the DOM. Nothing global to clean up.
        }

        render() {
            this.innerHTML = `
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

                <h2>sac.toolbar — ribbon projection</h2>
                <p>SPA views declare <em>what</em> actions they have; the nav ribbon owns <em>how</em> they
                   look. The router clears the items between view swaps.</p>
                ${code(`sac.toolbar.set([
    { icon: "plus",  title: "New note",  onClick: () => this.create() },
    { icon: "trash", title: "Delete",    onClick: () => this.remove(), disabled: !sel },
    { icon: "pin",   title: "Pinned",    onClick: () => this.pin(),    active: pinned },
]);`)}

                <h2>sac.dialog — confirm helper</h2>
                <p>Promise wrapper over <code>&lt;sac-dialog&gt;</code> — see the
                   <a href="#/components">Components</a> page for the live demo and the armed-button rules.</p>

                <h2>sac.apps — apps as web components</h2>
                <p>The app runtime: a registry of app manifests, floating-window lifecycle,
                   <code>?app=</code> deep links and the opt-in <code>mount(context)</code>
                   capability handshake. An app is ONE custom element in ONE classic script —
                   register a manifest, call <code>init()</code>, done.
                   <code>&lt;sac-launcher&gt;</code> (see
                   <a href="#/components">Components</a>) renders the registry as a tile grid.</p>
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
                    <tr><td><code>init()</code></td><td>Delegated click binding for <code>[data-app="&lt;id&gt;"]</code> tiles + the <code>?app=&lt;id&gt;</code> deep link (URL cleaned via replaceState). Legacy: <code>[data-overlay]</code> and <code>?tool=</code> honored the same way.</td></tr>
                </table>
                <table class="sg">
                    <tr><th style="width:260px">Manifest field</th><th>Description</th></tr>
                    <tr><td><code>id</code></td><td>Unique; <code>?app=</code> deep links + persistence key.</td></tr>
                    <tr><td><code>name</code></td><td>Display name (window title / tile heading).</td></tr>
                    <tr><td><code>icon</code></td><td><code>sac-icon</code> name for the tile.</td></tr>
                    <tr><td><code>description</code></td><td>Tile subline (optional).</td></tr>
                    <tr><td><code>badge</code></td><td>Optional: short string, rendered by <code>&lt;sac-launcher&gt;</code> as the tile's corner pill (the global <code>.tile-badge</code> pattern).</td></tr>
                    <tr><td><code>tile</code></td><td>Optional tile footprint in the launcher grid: <code>"medium"</code> (default, omit-able), <code>"wide"</code> (2 columns) or <code>"large"</code> (2 columns × 2 rows). Unknown values fall back to medium silently; all footprints collapse to medium on narrow viewports.</td></tr>
                    <tr><td><code>kind</code></td><td><code>"window"</code> (overlay app, default) or <code>"page"</code> (plain link).</td></tr>
                    <tr><td><code>tag</code>, <code>src</code></td><td>window only: the app's single custom element + its classic script, injected once on first open. The script guards its definition with <code>customElements.get</code> and registers no other tags; the element fills its window (<code>height: 100%</code> is set for you).</td></tr>
                    <tr><td><code>width</code>, <code>height</code></td><td>window only: <code>sac-window</code> size (defaults 500px / 600px).</td></tr>
                    <tr><td><code>accent</code></td><td>window only, optional: set as <code>--accent</code> on the window — the per-app retheme.</td></tr>
                    <tr><td><code>controls</code>, <code>resizable</code></td><td>window only, optional: <code>controls</code> = space-separated subset of <code>min max close</code> (window chrome); <code>resizable: false</code> sets <code>no-resize</code>. Absent = all three dots, resizable.</td></tr>
                    <tr><td><code>href</code></td><td>page only: the tile becomes a normal link.</td></tr>
                </table>
                <h3>mount(context) — the capability handshake</h3>
                <p>The host calls <code>el.mount(context)</code> IF the method exists — exactly once
                   per element lifetime, after the element is first appended into its window
                   (re-opening does not re-mount). <code>el.unmount()</code> (if present) is called
                   only by <code>sac.apps.remove()</code>. Both hooks are opt-in.</p>
                <table class="sg">
                    <tr><th style="width:260px">Context slot</th><th>Description</th></tr>
                    <tr><td><code>appId</code></td><td>The manifest id.</td></tr>
                    <tr><td><code>params</code></td><td><code>URLSearchParams</code> — deep-link params snapshot at open (empty if none).</td></tr>
                    <tr><td><code>deepLink.set(obj)</code></td><td>Writes <code>?app=&lt;id&gt;&amp;&lt;obj entries&gt;</code> via <code>history.replaceState</code>; <code>set(null)</code> cleans back to the bare path (hash preserved).</td></tr>
                    <tr><td><code>theme.get()</code></td><td>The flag: <code>"dark"</code> | <code>"light"</code> | <code>"auto"</code>.</td></tr>
                    <tr><td><code>theme.set(mode)</code></td><td>Same values; routes through <code>&lt;sac-theme-toggle&gt;</code> when present (one source of truth: <code>data-theme</code> on <code>&lt;html&gt;</code> + the <code>sac-theme</code> localStorage key).</td></tr>
                    <tr><td><code>theme.onChange(cb)</code></td><td><code>cb(resolved)</code> with <code>"dark"</code>/<code>"light"</code> on every effective change, incl. OS flips in auto. Returns an unsubscribe function.</td></tr>
                    <tr><td><code>fs</code>, <code>identity</code></td><td>Reserved capability slots — <code>null</code> in this tier.</td></tr>
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
            <sac-footer brand="SACRVM APPKIT" version="1.0.0"></sac-footer>
            `;
        }

        wire() {
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
            const layerA = this.querySelector("#pz-layer-a");
            const layerB = this.querySelector("#pz-layer-b");
            layerA.appendChild(grid("A"));
            layerB.appendChild(grid("B"));
            const hud = this.querySelector("#pz-hud");
            sac.setupPanZoom({
                panes: [
                    { pane: this.querySelector("#pz-pane-a"), layer: layerA },
                    { pane: this.querySelector("#pz-pane-b"), layer: layerB },
                ],
                onChange: (scale) => { hud.textContent = `zoom ${scale.toFixed(2)}`; },
            });
        }
    }

    customElements.define("sg-helpers-view", SgHelpersView);
    sac.router.register("#/helpers", "sg-helpers-view", { label: "Helpers", icon: "settings" });
})();
