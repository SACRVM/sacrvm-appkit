/**
 * <tool-about> — demo overlay app.
 * Lazily injected by sac.apps on first open; lives inside a <sac-window>
 * (light DOM, so ui.css applies). First real consumer of the app contract:
 * it implements mount(context) / unmount() and shows what it received.
 */
class ToolAbout extends HTMLElement {
    connectedCallback() {
        if (this.firstElementChild) return; // window close/open re-connects
        this.innerHTML = `
            <div style="display:flex;flex-direction:column;gap:0.9rem;height:100%;">
                <h2 style="font-size:1.2rem;">SACRVM APPKIT</h2>
                <p style="margin:0;">
                    A complete, self-contained UI system for tool apps —
                    zero dependencies, zero build, plain HTML + Custom Elements + CSS tokens.
                </p>
                <p style="margin:0;">
                    This window itself is the demo: the app ships as a custom element,
                    its script was injected the moment you first clicked the tile, and it
                    was mounted into a floating <code>&lt;sac-window&gt;</code> through the
                    app contract. Try the deep link: <code>?app=about</code> on the URL of
                    whichever page hosts it (<code>?tool=about</code> still works).
                </p>
                <div style="display:flex;gap:4px;flex-wrap:wrap;">
                    <sac-chip label="zero-deps" color="green"></sac-chip>
                    <sac-chip label="no-build" color="blue"></sac-chip>
                    <sac-chip label="tokens" color="purple"></sac-chip>
                    <sac-chip label="themable" color="orange"></sac-chip>
                </div>
                <div style="border:1px solid var(--border);border-radius:var(--radius-m);
                            background:color-mix(in srgb, var(--accent) 6%, transparent);
                            padding:0.6rem 0.75rem;font-size:0.8rem;color:var(--text-muted);">
                    <b style="color:var(--text);">mount(context)</b> received:
                    app id <code id="about-app-id">—</code> ·
                    theme <code id="about-theme">—</code> (live — flip the toggle) ·
                    <code>fs</code> <code id="about-fs">—</code> ·
                    <code>identity</code> <code id="about-identity">—</code>
                </div>
                <div style="display:flex;align-items:center;gap:1.25rem;margin-top:0.25rem;">
                    <sac-icon name="cube" id="about-cube"
                              style="--icon-size:44px;color:var(--accent);flex-shrink:0;
                                     transition: transform 0.15s var(--ease-smooth), filter 0.15s;"></sac-icon>
                    <div style="flex:1;">
                        <sac-slider id="about-magic" label="Window magic" min="0" max="100" value="25" suffix="%"></sac-slider>
                    </div>
                </div>
                <div style="margin-top:auto;color:var(--text-dim);font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;">
                    zero dependencies · zero build
                </div>
            </div>
        `;

        // No dead controls: the slider spins and charges the cube.
        const cube = this.querySelector("#about-cube");
        const apply = (v) => {
            const t = Number(v) / 100;
            cube.style.transform = `rotate(${t * 360}deg) scale(${1 + t * 0.35})`;
            cube.style.filter = `drop-shadow(0 0 ${Math.round(t * 18)}px var(--accent-glow))`;
        };
        this.querySelector("#about-magic").addEventListener("sac:input", (e) => {
            if (e.detail) apply(e.detail.value);
        });
        apply(25);
    }

    /** App contract: called by sac.apps exactly once, right after first insert. */
    mount(context) {
        this._ctx = context;
        this.querySelector("#about-app-id").textContent = context.appId;

        // theme.get() returns the flag ("dark" | "light" | "auto"); resolve
        // "auto" against the OS for the initial readout, then let onChange
        // keep it current — it fires on every EFFECTIVE change, OS flips
        // in auto included.
        const themeOut = this.querySelector("#about-theme");
        const flag = context.theme.get();
        themeOut.textContent = flag === "auto"
            ? (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark")
            : flag;
        this._offTheme = context.theme.onChange((resolved) => {
            themeOut.textContent = resolved;
        });

        // fs and identity are real capabilities, granted or not by the HOST —
        // this shell loads both libs, so they arrive live (not the null a
        // capability-less host would pass). Report what actually came in.
        this.querySelector("#about-fs").textContent =
            context.fs ? "ready" : "null";
        const who = context.identity && context.identity.get();
        this.querySelector("#about-identity").textContent =
            context.identity ? (who ? who.name : "ready (nobody signed in)") : "null";
    }

    /** App contract: called only by sac.apps.remove(). */
    unmount() {
        if (this._offTheme) { this._offTheme(); this._offTheme = null; }
    }
}

if (!customElements.get("tool-about")) customElements.define("tool-about", ToolAbout);
