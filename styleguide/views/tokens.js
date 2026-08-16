/**
 * <sg-tokens-view> (#/tokens) — seeds, derived tokens, palette, theming.
 * All swatches render live via var(...), so the theme switcher in the nav
 * (light/dark + accent) re-paints this page — that is the demo.
 */
(function () {
    const sw = (token, note) => `
        <div class="sg-swatch">
            <div class="chip" style="--sw: var(${token})"></div>
            <div class="meta"><b>${token}</b>${note || ""}</div>
        </div>`;

    class SgTokensView extends HTMLElement {
        connectedCallback() {
            this.innerHTML = `
            <div class="sg-page">
                <h1>Tokens &amp; Theming</h1>
                <p class="lead">
                    A theme is a handful of <strong>seed colors</strong> plus a <strong>light-or-dark
                    flag</strong>; every other color is <em>derived</em> via <code>color-mix()</code>.
                    Swap a seed or flip the flag and everything re-themes — the switcher in the nav
                    ribbon does it live.
                </p>

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
            <sac-footer brand="SACRVM APPKIT" version="1.0.0"></sac-footer>
            `;
        }
    }

    customElements.define("sg-tokens-view", SgTokensView);
    sac.router.register("#/tokens", "sg-tokens-view", { label: "Tokens & Theming", icon: "star" });
})();
