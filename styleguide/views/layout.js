/**
 * <sg-layout-view> (#/layout) — the three page archetypes + the router.
 */
(function () {
    const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const code = (s) => `<pre class="sg-code"><code>${esc(s)}</code></pre>`;

    class SgLayoutView extends HTMLElement {
        connectedCallback() {
            this.innerHTML = `
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
                   <a href="#/components">Components</a> and <a href="#/helpers">Helpers</a>).
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
        this.render();
        sac.toolbar.set([{ icon: "plus", title: "New", onClick: () => this.create() }]);
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
                    <tr><td><code>mount(selector)</code></td><td>Starts rendering views into the mount point. On hashchange it swaps <code>innerHTML</code> to the matching tag — and clears <code>sac.toolbar</code>, so outgoing views never clean the ribbon themselves.</td></tr>
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
            <sac-footer brand="SACRVM APPKIT" version="0.1.0"></sac-footer>
            `;
        }
    }

    customElements.define("sg-layout-view", SgLayoutView);
    sac.router.register("#/layout", "sg-layout-view", { label: "Layouts", icon: "globe" });
})();
