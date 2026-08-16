/**
 * <sg-patterns-view> (#/patterns) — the global CSS classes. These are the
 * "components without elements": documented here, so they exist.
 */
(function () {
    const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const code = (s) => `<pre class="sg-code"><code>${esc(s)}</code></pre>`;

    class SgPatternsView extends HTMLElement {
        connectedCallback() {
            this.innerHTML = `
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
                        <a class="tile" href="#/patterns">
                            <sac-icon name="shapes"></sac-icon>
                            <div><h2 style="font-size:1.2rem;">Page tile</h2><p>Plain link.</p></div>
                        </a>
                        <a class="tile" href="#/patterns">
                            <span class="tile-badge accent">NEW</span>
                            <sac-icon name="vector"></sac-icon>
                            <div><h2 style="font-size:1.2rem;">Badged</h2><p>.tile-badge.accent</p></div>
                        </a>
                        <a class="tile tile-window" href="#/patterns">
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
                        <li><a href="#/patterns">Home</a></li>
                        <li><a href="#/patterns">Projects</a></li>
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
            <sac-footer brand="SACRVM APPKIT" version="1.0.0"></sac-footer>
            `;
        }
    }

    customElements.define("sg-patterns-view", SgPatternsView);
    sac.router.register("#/patterns", "sg-patterns-view", { label: "CSS Patterns", icon: "document" });
})();
