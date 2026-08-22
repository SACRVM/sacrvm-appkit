/**
 * <app-orb-lab> — the Orb Lab demo as a view app.
 *
 * kind:"view": it runs on the shell's stage, not in a document of its own.
 * One element, one classic script: the markup, the controls and the whole
 * canvas simulation live here (the tool used to be an index.html plus a
 * script.js beside it).
 *
 * What goes where:
 *   control panel  — stays INSIDE the view (sliders, toggles, the segmented
 *                    control and the colour well are controls, not navigation),
 *                    beside the viewport in the app's own <sac-split>.
 *   nav + toolbar  — the app draws its own <sac-nav>; Pause / Reset view /
 *                    Help sit in ITS toolbar slot. Hosted, the nav also
 *                    renders the host's jump (context.host). The same actions
 *                    register on sac.commands so the palette reaches them.
 *   rail           — none. The app has no sections.
 *
 * The view fills the stage without scrolling it, pauses its animation loop
 * whenever it is not on screen, and keeps every bit of state (orbs, controls,
 * log, zoom, the canvas pixels themselves) across a stage swap.
 */
(function () {
    // Resolved at parse time: the app's own folder, wherever it was injected
    // from. Stylesheet, help markdown and the help loader are addressed
    // against it, so the app works under any path prefix.
    const BASE = document.currentScript.src.replace(/[^/]+$/, "");
    const CSS_ID = "sac-app-orb-lab-css";

    const HELP_MD     = new URL("help.md", BASE).href;
    const HELP_MODULE = new URL("../../kit/js/lib/help-loader.js", BASE).href;
    // loadHelp() addresses its target by id — one element, one app, one id.
    const HELP_TARGET = "orb-lab-help-content";

    /** One <link> per document, however often the app is created. */
    function ensureStyles() {
        if (document.getElementById(CSS_ID)) return;
        const link = document.createElement("link");
        link.id = CSS_ID;
        link.rel = "stylesheet";
        link.href = BASE + "style.css";
        document.head.appendChild(link);
    }

    // The kit's 10-slot data palette — orbs pick a slot NAME, so a re-theme
    // recolours them without touching a single orb.
    const PALETTE_SLOTS = ["blue", "orange", "red", "green", "purple",
                           "pink", "yellow", "teal", "gray", "indigo"];

    const LINK_REACH = 150;   // px between two orbs still worth a line

    class AppOrbLab extends HTMLElement {
        constructor() {
            super();
            this.state = {
                count: 80,
                speed: 1,
                size: 8,
                trails: true,
                links: false,
                colorMode: "accent",
                customColor: "#f472b6",   // seeds the <sac-color-field>
                paused: false,
                zoom: 1,
            };
            this._orbs = [];
            this._raf = null;
            this._visible = false;        // set by the IntersectionObserver
            this._frames = 0;
            this._fps = 0;
            this._lastFpsAt = 0;
            this._helpLoaded = false;
            this._customLogTimer = null;
            this._unregisterCommands = null;
        }

        connectedCallback() {
            if (this.firstElementChild) return;   // a stage swap re-connects
            ensureStyles();
            this.innerHTML = `
<!-- The app is complete: its own nav carries its own tools. A host adds
     nothing here — its presence arrives via context.host in mount(). -->
<sac-nav brand="ORB LAB" brand-icon="globe" brand-href="#/orb-lab">
    <div slot="context"><sac-theme-toggle></sac-theme-toggle></div>
    <div slot="toolbar" class="toolbar">
        <button type="button" class="nav-icon-btn ol-act-pause" title="Pause">
            <sac-icon name="pause"></sac-icon>
        </button>
        <button type="button" class="nav-icon-btn ol-act-reset" title="Reset view">
            <sac-icon name="undo"></sac-icon>
        </button>
        <button type="button" class="nav-icon-btn ol-act-help" title="Help">
            <sac-icon name="info"></sac-icon>
        </button>
    </div>
</sac-nav>

<div class="ol-root">
    <!-- Resizable control panel: one <sac-split> owns both widths. min-start
         keeps the controls usable, min-end protects the canvas. Drag the
         hairline, or focus it and use the arrow keys. -->
    <sac-split class="ol-split" position="22%" min-start="200px" min-end="320px"
               aria-label="Resize the control panel">

        <div class="sidebar" slot="start">
            <sac-section title="Simulation">
                <sac-slider class="ol-count" label="Orbs" min="10" max="300" step="10" value="80"></sac-slider>
                <sac-slider class="ol-speed" label="Speed" min="0" max="3" step="0.1" value="1" suffix="×"></sac-slider>
                <sac-slider class="ol-size" label="Size" min="2" max="20" step="1" value="8" suffix="px"></sac-slider>
            </sac-section>

            <sac-section title="Look">
                <sac-toggle class="ol-trails" label="Trails" checked></sac-toggle>
                <sac-toggle class="ol-links" label="Connect lines"></sac-toggle>
                <div>
                    <label>Color mode</label>
                    <!-- wraps: four options no longer fit one row at the
                         panel's minimum width. -->
                    <sac-segmented-control class="ol-colors" value="accent">
                        <button data-value="accent">Accent</button>
                        <button data-value="palette">Palette</button>
                        <button data-value="mono">Mono</button>
                        <button data-value="custom">Custom</button>
                    </sac-segmented-control>
                </div>
                <!-- Only relevant in "custom" mode — the mode flips its
                     [disabled], so the row dims itself. -->
                <sac-color-field class="ol-custom" label="Custom color"
                                 value="#f472b6" disabled></sac-color-field>
            </sac-section>

            <sac-section title="Log">
                <sac-log class="ol-log"></sac-log>
            </sac-section>
        </div>

        <div class="viewport ol-viewport" slot="end">
            <div class="pz-layer"><canvas class="ol-canvas"></canvas></div>
            <sac-hud class="ol-hud" position="top-right"></sac-hud>
        </div>

    </sac-split>
</div>

<!-- A help window needs no min/max — close-only chrome. Fixed-positioned, so
     it lives beside the layout and disappears with the view. -->
<sac-window class="ol-help" title="Orb Lab Help" width="480px" height="560px"
            left="calc(100vw - 520px)" top="80px" controls="close">
    <div id="${HELP_TARGET}"></div>
</sac-window>
`;
        }

        /* ------------------------------------------------- app contract --- */

        /** Called once by sac.apps, right after the first insert. */
        mount(context) {
            this._appCtx = context;
            // The host's injection (jump, suite nav, toolbar controls),
            // rendered by OUR nav. Null standalone — the nav shows nothing.
            const nav = this.querySelector("sac-nav");
            if (nav) nav.host = context.host;

            this._canvas   = this.querySelector(".ol-canvas");
            this._ctx      = this._canvas.getContext("2d");
            this._viewport = this.querySelector(".ol-viewport");
            this._layer    = this.querySelector(".pz-layer");
            this._hud      = this.querySelector(".ol-hud");
            this._log      = this.querySelector(".ol-log");

            this._resize();
            this._syncCount();
            this._wireControls();
            this._wireToolbar();
            this._syncToolbar();

            // Pan / zoom (kit helper, shared-transform pattern).
            this._pz = sac.setupPanZoom({
                panes: [{ pane: this._viewport, layer: this._layer }],
                minScale: 0.3,
                maxScale: 8,
                onChange: (scale) => { this.state.zoom = scale; this._updateHud(); },
            });

            // The split changes the viewport's box without any window event,
            // and the observer fires after layout — the measurement is never
            // stale mid-drag.
            this._ro = new ResizeObserver(() => this._resize());
            this._ro.observe(this._viewport);

            // Off-stage a view is display:none, so it never intersects — the
            // honest signal for "nobody is looking". Cheaper and more general
            // than watching [hidden]: a scrolled-away or collapsed host stops
            // the loop just the same.
            this._io = new IntersectionObserver((entries) => {
                this._setVisible(entries[entries.length - 1].isIntersecting);
            });
            this._io.observe(this);

            this._log.add("Orb Lab ready — wheel to zoom, drag to pan, double-click to reset");
            this._updateHud();
        }

        /** Called only by sac.apps.remove() — give back everything global. */
        unmount() {
            this._setVisible(false);
            this._io?.disconnect();
            this._io = null;
            this._ro?.disconnect();
            this._ro = null;
            clearTimeout(this._customLogTimer);
            this._customLogTimer = null;
        }

        /* --------------------------------------------------- visibility --- */

        /**
         * On stage / off stage. Owns everything that costs something while
         * nobody is looking: the animation loop and the palette commands.
         * (The toolbar is the app's own markup — it needs no lifecycle.)
         */
        _setVisible(visible) {
            if (visible === this._visible) return;
            this._visible = visible;

            if (visible) {
                this._resize();       // the stage may have resized while hidden
                this._registerCommands();
            } else {
                this._unregisterCommands?.();
                this._unregisterCommands = null;
            }
            this._syncLoop();
        }

        /* ----------------------------------------------------- toolbar ---- */

        /** The pause button mirrors the state; the other two are static. */
        _syncToolbar() {
            const btn = this.querySelector(".ol-act-pause");
            if (!btn) return;
            const paused = this.state.paused;
            btn.title = paused ? "Resume" : "Pause";
            btn.classList.toggle("active", paused);
            btn.querySelector("sac-icon").setAttribute("name", paused ? "play" : "pause");
        }

        _wireToolbar() {
            this.querySelector(".ol-act-pause").addEventListener("click", () => this._togglePause());
            this.querySelector(".ol-act-reset").addEventListener("click", () => this._resetView());
            this.querySelector(".ol-act-help").addEventListener("click", () => this._openHelp());
        }

        _registerCommands() {
            if (this._unregisterCommands || !window.sac?.commands) return;
            // The app owns its toolbar, so the palette does not see those
            // buttons by itself — everything keyboard-worthy registers here.
            const offs = [
                sac.commands.register({
                    id:    "orb-lab-toggle-pause",
                    label: "Pause / resume",
                    icon:  "pause",
                    run:   () => this._togglePause(),
                }),
                sac.commands.register({
                    id:    "orb-lab-reset-view",
                    label: "Reset view",
                    icon:  "undo",
                    run:   () => this._resetView(),
                }),
                sac.commands.register({
                    id:    "orb-lab-help",
                    label: "Help",
                    icon:  "info",
                    run:   () => this._openHelp(),
                }),
                sac.commands.register({
                    id:    "orb-lab-clear-log",
                    label: "Clear log",
                    icon:  "trash",
                    run:   () => this._log && this._log.clear(),
                }),
            ];
            this._unregisterCommands = () => offs.forEach((off) => off());
        }

        /* ---------------------------------------------------- controls ---- */

        /**
         * Guard: native `input` events from inside a component's shadow input
         * are composed and bubble through the host with no detail — only the
         * kit's CustomEvents carry one, so skip anything without it.
         */
        _on(selector, type, fn) {
            const el = this.querySelector(selector);
            if (!el) return;
            el.addEventListener(type, (e) => {
                if (e.detail == null) return;
                fn(e);
            });
        }

        _wireControls() {
            const state = this.state;
            const log = this._log;

            this._on(".ol-count", "sac:input", (e) => {
                state.count = parseInt(e.detail.value, 10);
                this._syncCount();
                this._updateHud();
            });
            this._on(".ol-count", "sac:change", (e) => log.add(`Orb count → ${e.detail.value}`));
            this._on(".ol-speed", "sac:input",  (e) => { state.speed = parseFloat(e.detail.value); });
            this._on(".ol-speed", "sac:change", (e) => log.add(`Speed → ${e.detail.value}×`));
            this._on(".ol-size",  "sac:input",  (e) => { state.size = parseInt(e.detail.value, 10); });
            this._on(".ol-size",  "sac:change", (e) => log.add(`Size → ${e.detail.value}px`));

            this._on(".ol-trails", "sac:change", (e) => {
                state.trails = e.detail.value;
                log.add(`Trails ${e.detail.value ? "on" : "off"}`);
            });
            this._on(".ol-links", "sac:change", (e) => {
                state.links = e.detail.value;
                log.add(`Connect lines ${e.detail.value ? "on" : "off"}`, e.detail.value ? "warn" : "info");
            });

            // The custom well only means anything in "custom" mode, so the
            // mode owns its [disabled] — one line, and the row dims itself.
            const customColor = this.querySelector(".ol-custom");
            this._on(".ol-colors", "sac:change", (e) => {
                if (typeof e.detail.value !== "string") return;
                state.colorMode = e.detail.value;
                customColor.toggleAttribute("disabled", e.detail.value !== "custom");
                log.add(`Color mode → ${e.detail.value}`);
            });

            // Live: the next frame already paints the new color. The log is
            // debounced, because sac:change fires on every drag step.
            this._on(".ol-custom", "sac:change", (e) => {
                state.customColor = e.detail.value;
                clearTimeout(this._customLogTimer);
                this._customLogTimer = setTimeout(
                    () => log.add(`Custom color → ${state.customColor}`), 400);
            });
        }

        _togglePause() {
            this.state.paused = !this.state.paused;
            this._log.add(this.state.paused ? "Paused" : "Resumed",
                          this.state.paused ? "warn" : "info");
            this._syncToolbar();      // the icon reflects the state
            this._syncLoop();
        }

        _resetView() {
            this._pz.reset();
            this._log.add("View reset");
            if (typeof sac.toast === "function") sac.toast("View reset");
        }

        _openHelp() {
            // An app script is a classic script and the help loader is an ES
            // module — dynamic import bridges the two. Loaded once, on first
            // open; the shell already brings marked + DOMPurify.
            if (!this._helpLoaded) {
                this._helpLoaded = true;
                import(HELP_MODULE)
                    .then(({ loadHelp }) => loadHelp(HELP_MD, HELP_TARGET))
                    .catch((err) => {
                        this._helpLoaded = false;   // a later open may retry
                        console.error("[orb-lab] could not load the help module:", err);
                    });
            }
            this.querySelector(".ol-help").open();
        }

        /* ----------------------------------------------------- the sim ---- */

        _makeOrb() {
            return {
                x:  Math.random() * this._canvas.width,
                y:  Math.random() * this._canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                r:  0.5 + Math.random(),
                slot: PALETTE_SLOTS[Math.floor(Math.random() * PALETTE_SLOTS.length)],
            };
        }

        _syncCount() {
            while (this._orbs.length < this.state.count) this._orbs.push(this._makeOrb());
            this._orbs.length = Math.min(this._orbs.length, this.state.count);
        }

        /** Tokens are read off THIS element, so the app's own --accent wins
         *  over the shell's — that is the per-app retheme mechanism. */
        _token(name) {
            return getComputedStyle(this).getPropertyValue(name).trim();
        }

        _colorFor(orb) {
            const mode = this.state.colorMode;
            if (mode === "accent")  return this._token("--accent");
            if (mode === "palette") return this._token(`--palette-${orb.slot}`);
            if (mode === "custom")  return this.state.customColor;
            // Mono reads --lift, not --fg: the viewport ground is black in
            // every theme, and --fg is near-black in the light one.
            return this._token("--lift");
        }

        _resize() {
            const rect = this._viewport.getBoundingClientRect();
            const w = Math.round(rect.width);
            const h = Math.round(rect.height);
            // Off stage the box measures 0×0 — keep the canvas exactly as it
            // is instead of collapsing it, so coming back shows the frame you
            // left. Same reason for the equality check: assigning width or
            // height always clears the bitmap, even to the same value.
            if (!w || !h) return;
            const c = this._canvas;
            if (c.width === w && c.height === h) return;
            const prevW = c.width, prevH = c.height;
            c.width = w;
            c.height = h;

            // Orbs hold their RELATIVE place instead of piling up against the
            // edge that just moved. It also fixes the first frame: the app's
            // stylesheet is injected at connect and lands after mount(), so
            // the very first measurement is of a not-yet-laid-out box.
            const sx = w / prevW, sy = h / prevH;
            for (const o of this._orbs) { o.x *= sx; o.y *= sy; }

            // Assigning width/height wiped the bitmap: repaint at once so a
            // drag — or a paused simulation — never shows an empty viewport.
            this._paint(false);
        }

        _syncLoop() {
            if (this._visible && !this.state.paused) this._start();
            else this._stop();
        }

        _start() {
            if (this._raf !== null) return;
            this._frames = 0;
            this._lastFpsAt = performance.now();
            const loop = () => {
                this._raf = requestAnimationFrame(loop);
                this._frame();
            };
            this._raf = requestAnimationFrame(loop);
        }

        _stop() {
            if (this._raf === null) return;
            cancelAnimationFrame(this._raf);
            this._raf = null;
        }

        _frame() {
            this._paint(true);
            this._frames++;
            const now = performance.now();
            if (now - this._lastFpsAt >= 1000) {
                this._fps = this._frames;
                this._frames = 0;
                this._lastFpsAt = now;
                this._updateHud();
            }
        }

        /**
         * One frame. `advance` steps the physics; without it the same scene is
         * re-drawn as it stands (after a resize, or while paused).
         */
        _paint(advance) {
            const ctx = this._ctx;
            const s = this.state;
            const { width, height } = this._canvas;

            if (advance && s.trails) {
                // Fade instead of clear — --viewport-bg is black in every
                // theme, so the trails fade toward the ground they lie on.
                ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
                ctx.fillRect(0, 0, width, height);
            } else {
                ctx.clearRect(0, 0, width, height);
            }
            if (!this._orbs.length) return;

            if (advance) {
                for (const o of this._orbs) {
                    o.x += o.vx * s.speed;
                    o.y += o.vy * s.speed;
                    if (o.x < 0 || o.x > width)  { o.vx *= -1; o.x = Math.max(0, Math.min(width, o.x)); }
                    if (o.y < 0 || o.y > height) { o.vy *= -1; o.y = Math.max(0, Math.min(height, o.y)); }
                }
            }

            if (s.links) {
                ctx.lineWidth = 1;
                for (let i = 0; i < this._orbs.length; i++) {
                    for (let j = i + 1; j < this._orbs.length; j++) {
                        const a = this._orbs[i], b = this._orbs[j];
                        const dx = a.x - b.x, dy = a.y - b.y;
                        const d2 = dx * dx + dy * dy;
                        if (d2 < LINK_REACH * LINK_REACH) {
                            ctx.strokeStyle = this._colorFor(a);
                            ctx.globalAlpha = 0.45 * (1 - Math.sqrt(d2) / LINK_REACH);
                            ctx.beginPath();
                            ctx.moveTo(a.x, a.y);
                            ctx.lineTo(b.x, b.y);
                            ctx.stroke();
                        }
                    }
                }
                ctx.globalAlpha = 1;
            }

            for (const o of this._orbs) {
                ctx.fillStyle = this._colorFor(o);
                ctx.beginPath();
                ctx.arc(o.x, o.y, o.r * s.size * 0.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        _updateHud() {
            this._hud.textContent =
                `zoom ${this.state.zoom.toFixed(2)} · ${this._fps} fps · ${this._orbs.length} orbs`;
        }
    }

    if (!customElements.get("app-orb-lab")) customElements.define("app-orb-lab", AppOrbLab);
})();
