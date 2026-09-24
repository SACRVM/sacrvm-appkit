/**
 * <app-pixel-lab> — the pixel workbench as a running app.
 *
 * kind:"view", like Orb Lab. It proves the workbench end to end and is the
 * porting blueprint for a real sprite editor: every piece of chrome is a kit
 * component, and everything that is about PIXELS lives in one small headless
 * document below (PixelDoc) — no DOM in it. That split is the point:
 *
 *   kit (view)                      app (document + tools)
 *   ─────────────────────────────   ─────────────────────────────────────
 *   <sac-pixel-canvas>  shows       PixelDoc  frames × layers of RGBA
 *     pixels, reports cells           buffers, composite(), undo snapshots
 *   <sac-toolbox>       tool pick    tools     pencil/eraser/line/rect/
 *   <sac-layer-list>    layers                  ellipse/fill/pick/marquee
 *   <sac-filmstrip>     frames      playback  a timer over frame indices
 *   <sac-shortcut-sheet> keys       export    canvas → PNG
 *   context.files       open/save   the sheet PNG ⇄ frames (Save = 1×
 *                                     strip, back through the handle)
 *
 * Phone: the side panel becomes the nav's drawer (sac-split rail-start, as in
 * Orb Lab); the canvas and the filmstrip keep the screen. One finger draws,
 * two pinch.
 */
(function () {
    const BASE = document.currentScript.src.replace(/[^/]+$/, "");
    const CSS_ID = "sac-app-pixel-lab-css";

    const W = 16, H = 16;
    const UNDO_LIMIT = 60;

    // PICO-8's 16 colors — the palette is DATA (a user's colors), not theme.
    const PALETTE = [
        "#000000", "#1d2b53", "#7e2553", "#008751", "#ab5236", "#5f574f", "#c2c3c7", "#fff1e8",
        "#ff004d", "#ffa300", "#ffec27", "#00e436", "#29adff", "#83769c", "#ff77a8", "#ffccaa",
    ];

    const TOOLS = [
        { id: "pencil",  icon: "pencil",     label: "Pencil",     key: "b" },
        { id: "eraser",  icon: "eraser",     label: "Eraser",     key: "e" },
        { id: "line",    icon: "line",       label: "Line",       key: "l" },
        { id: "rect",    icon: "square",     label: "Rectangle",  key: "r" },
        { id: "ellipse", icon: "circle",     label: "Ellipse",    key: "c" },
        { id: "fill",    icon: "bucket",     label: "Fill",       key: "g" },
        { id: "pick",    icon: "eyedropper", label: "Eyedropper", key: "i" },
        { id: "marquee", icon: "marquee",    label: "Select",     key: "m" },
    ];
    const SHAPES = new Set(["line", "rect", "ellipse"]);

    const hexToRgba = (h) => {
        if (!h || h === "transparent") return [0, 0, 0, 0];
        const n = parseInt(h.slice(1, 7), 16);
        return [(n >> 16) & 255, (n >> 8) & 255, n & 255, h.length >= 9 ? parseInt(h.slice(7, 9), 16) : 255];
    };
    const rgbaToHex = (c) => c[3] === 0 ? "transparent"
        : "#" + [c[0], c[1], c[2]].map((v) => v.toString(16).padStart(2, "0")).join("");

    /* ================================================================
       PixelDoc — the headless document. No DOM; a port lifts it as is.
       ================================================================ */
    class PixelDoc {
        constructor(w, h) {
            this.w = w; this.h = h;
            this.layers = [];          // TOP first: [{ id, name, visible, locked }]
            this.frames = [];          // [{ [layerId]: Uint8ClampedArray(w*h*4) }]
            this._next = 1;
        }
        blank() { return new Uint8ClampedArray(this.w * this.h * 4); }
        addLayer(name, index = 0) {
            const id = "l" + this._next++;
            this.layers.splice(index, 0, { id, name: name || "Layer " + id.slice(1), visible: true, locked: false });
            for (const f of this.frames) f[id] = this.blank();
            return id;
        }
        removeLayer(id) {
            if (this.layers.length < 2) return false;
            this.layers = this.layers.filter((l) => l.id !== id);
            for (const f of this.frames) delete f[id];
            return true;
        }
        duplicateLayer(id) {
            const i = this.layers.findIndex((l) => l.id === id);
            const nid = this.addLayer(this.layers[i].name + " copy", i);
            for (const f of this.frames) f[nid] = f[id].slice();
            return nid;
        }
        addFrame(at, copyOf) {
            const f = {};
            for (const l of this.layers) f[l.id] = copyOf == null ? this.blank() : this.frames[copyOf][l.id].slice();
            this.frames.splice(at, 0, f);
        }
        move(list, from, to) { const [x] = list.splice(from, 1); list.splice(to, 0, x); }

        get(buf, x, y) { const i = (y * this.w + x) * 4; return [buf[i], buf[i + 1], buf[i + 2], buf[i + 3]]; }
        set(buf, x, y, c) {
            if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
            const i = (y * this.w + x) * 4;
            buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2]; buf[i + 3] = c[3];
        }
        /** Visible layers, bottom to top, "source-over" in integer RGBA. */
        composite(fi, only) {
            const out = new ImageData(this.w, this.h), d = out.data, f = this.frames[fi];
            for (let k = this.layers.length - 1; k >= 0; k--) {
                const l = this.layers[k];
                if (only ? l.id !== only : !l.visible) continue;
                const s = f[l.id];
                for (let i = 0; i < d.length; i += 4) {
                    const a = s[i + 3];
                    if (!a) continue;
                    if (a === 255 || !d[i + 3]) { d[i] = s[i]; d[i + 1] = s[i + 1]; d[i + 2] = s[i + 2]; d[i + 3] = a; continue; }
                    const t = a / 255, da = d[i + 3] / 255, oa = t + da * (1 - t);
                    for (let c = 0; c < 3; c++) d[i + c] = (s[i + c] * t + d[i + c] * da * (1 - t)) / oa;
                    d[i + 3] = oa * 255;
                }
            }
            return out;
        }
        snapshot() {
            return {
                layers: this.layers.map((l) => ({ ...l })),
                frames: this.frames.map((f) => Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v.slice()]))),
            };
        }
        restore(s) { this.layers = s.layers.map((l) => ({ ...l })); this.frames = s.frames; }
    }

    /* Raster helpers — pure functions over one buffer. */
    const raster = {
        stamp(doc, buf, x, y, size, c) {
            const o = Math.floor((size - 1) / 2);
            for (let j = 0; j < size; j++) for (let i = 0; i < size; i++) doc.set(buf, x - o + i, y - o + j, c);
        },
        line(doc, buf, a, b, size, c) {
            let x0 = a.x, y0 = a.y;
            const dx = Math.abs(b.x - x0), dy = -Math.abs(b.y - y0), sx = x0 < b.x ? 1 : -1, sy = y0 < b.y ? 1 : -1;
            let err = dx + dy;
            for (;;) {
                raster.stamp(doc, buf, x0, y0, size, c);
                if (x0 === b.x && y0 === b.y) break;
                const e2 = 2 * err;
                if (e2 >= dy) { err += dy; x0 += sx; }
                if (e2 <= dx) { err += dx; y0 += sy; }
            }
        },
        rect(doc, buf, a, b, size, c) {
            const x0 = Math.min(a.x, b.x), x1 = Math.max(a.x, b.x), y0 = Math.min(a.y, b.y), y1 = Math.max(a.y, b.y);
            for (let x = x0; x <= x1; x++) { raster.stamp(doc, buf, x, y0, size, c); raster.stamp(doc, buf, x, y1, size, c); }
            for (let y = y0; y <= y1; y++) { raster.stamp(doc, buf, x0, y, size, c); raster.stamp(doc, buf, x1, y, size, c); }
        },
        // Gap-free outline: scan columns AND rows for the boundary.
        ellipse(doc, buf, a, b, size, c) {
            const x0 = Math.min(a.x, b.x), x1 = Math.max(a.x, b.x), y0 = Math.min(a.y, b.y), y1 = Math.max(a.y, b.y);
            const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, rx = (x1 - x0) / 2, ry = (y1 - y0) / 2;
            if (rx < 0.5 || ry < 0.5) return raster.line(doc, buf, a, b, size, c);
            for (let x = x0; x <= x1; x++) {
                const d = (x - cx) / rx, e = ry * Math.sqrt(Math.max(0, 1 - d * d));
                raster.stamp(doc, buf, x, Math.round(cy - e), size, c); raster.stamp(doc, buf, x, Math.round(cy + e), size, c);
            }
            for (let y = y0; y <= y1; y++) {
                const d = (y - cy) / ry, e = rx * Math.sqrt(Math.max(0, 1 - d * d));
                raster.stamp(doc, buf, Math.round(cx - e), y, size, c); raster.stamp(doc, buf, Math.round(cx + e), y, size, c);
            }
        },
        fill(doc, buf, x, y, c) {
            const t = doc.get(buf, x, y);
            if (t.every((v, k) => v === c[k])) return;
            const stack = [[x, y]];
            while (stack.length) {
                const [px, py] = stack.pop();
                if (px < 0 || py < 0 || px >= doc.w || py >= doc.h) continue;
                const p = doc.get(buf, px, py);
                if (!p.every((v, k) => v === t[k])) continue;
                doc.set(buf, px, py, c);
                stack.push([px + 1, py], [px - 1, py], [px, py + 1], [px, py - 1]);
            }
        },
    };

    /** A small two-frame sprite so the app opens on something alive. */
    function seed(doc) {
        const bg = doc.addLayer("Outline");
        doc.addLayer("Fill", 1);
        const fillId = doc.layers[1].id;
        doc.addFrame(0); doc.addFrame(1);
        const heart = [
            "................",
            "................",
            "...####..####...",
            "..#ffff##ffff#..",
            ".#ffwwffffffff#.",
            ".#fwwfffffffff#.",
            ".#ffffffffffff#.",
            ".#ffffffffffff#.",
            "..#ffffffffff#..",
            "...#ffffffff#...",
            "....#ffffff#....",
            ".....#ffff#.....",
            "......#ff#......",
            ".......##.......",
            "................",
            "................",
        ];
        const ink = hexToRgba("#1d2b53"), red = hexToRgba("#ff004d"), hi = hexToRgba("#fff1e8"), dark = hexToRgba("#7e2553");
        heart.forEach((row, y) => [...row].forEach((ch, x) => {
            if (ch === "#") { doc.set(doc.frames[0][bg], x, y, ink); doc.set(doc.frames[1][bg], x, y, ink); }
            if (ch === "f") { doc.set(doc.frames[0][fillId], x, y, red); doc.set(doc.frames[1][fillId], x, y, x > 9 && y > 7 ? dark : red); }
            if (ch === "w") { doc.set(doc.frames[0][fillId], x, y, hi); }
        }));
        return fillId;
    }

    /* ================================================================
       The app element — wiring only.
       ================================================================ */
    class AppPixelLab extends HTMLElement {
        constructor() {
            super();
            this.doc = new PixelDoc(W, H);
            this.layer = seed(this.doc);
            this.frame = 0;
            this.tool = "pencil";
            this.brush = 1;
            this.color = hexToRgba("#ff004d");
            this.onion = true;
            this.fps = 4;
            this.sel = null;
            this.undo = []; this.redo = [];
            this._visible = false;
            this._offs = [];
        }

        connectedCallback() {
            if (this.firstElementChild) return;   // a stage swap re-connects
            sac.app.styles(BASE + "style.css", CSS_ID);
            this.innerHTML = `
<sac-nav brand="PIXEL LAB" brand-icon="grid" brand-href="#/pixel-lab" host-nav="wide">
    <div slot="context"><sac-theme-toggle></sac-theme-toggle></div>
    <div slot="toolbar" class="toolbar">
        <button type="button" class="nav-icon-btn pl-open" title="Open…"><sac-icon name="folder"></sac-icon></button>
        <button type="button" class="nav-icon-btn pl-save" title="Save"><sac-icon name="save"></sac-icon></button>
        <button type="button" class="nav-icon-btn pl-undo" title="Undo"><sac-icon name="undo"></sac-icon></button>
        <button type="button" class="nav-icon-btn pl-redo" title="Redo"><sac-icon name="redo"></sac-icon></button>
        <button type="button" class="nav-icon-btn pl-zout" title="Zoom out"><sac-icon name="zoom-out"></sac-icon></button>
        <button type="button" class="nav-icon-btn pl-fit" title="Fit"><sac-icon name="fit"></sac-icon></button>
        <button type="button" class="nav-icon-btn pl-zin" title="Zoom in"><sac-icon name="zoom-in"></sac-icon></button>
        <button type="button" class="nav-icon-btn pl-export" title="Export PNG"><sac-icon name="download"></sac-icon></button>
        <button type="button" class="nav-icon-btn pl-keys" title="Keyboard shortcuts"><sac-icon name="keyboard"></sac-icon></button>
    </div>
</sac-nav>

<div class="main-layout pl-root">
    <sac-split class="pl-split" position="22%" min-start="220px" min-end="320px"
               aria-label="Resize the side panel">
        <div class="sidebar fill pl-panel" slot="start">
            <sac-section title="Tools">
                <sac-toolbox class="pl-tools" columns="auto" value="pencil"></sac-toolbox>
                <div class="pl-row"><label>Brush</label>
                    <sac-stepper class="pl-brush" value="1" min="1" max="4" unit="px" label="Brush size"></sac-stepper></div>
            </sac-section>
            <sac-section title="Color">
                <sac-color-field class="pl-color" label="Current color" value="#ff004d"></sac-color-field>
                <sac-swatch-grid class="pl-palette" columns="8" selectable></sac-swatch-grid>
            </sac-section>
            <sac-section title="Layers">
                <sac-layer-list class="pl-layers" actions pixelated></sac-layer-list>
            </sac-section>
            <sac-section title="Preview">
                <div class="pl-preview"><sac-pixel-canvas class="pl-pv" static zoom="4"></sac-pixel-canvas></div>
                <div class="pl-row"><label>Speed</label>
                    <sac-stepper class="pl-fps" value="4" min="1" max="24" unit="fps" label="Playback speed"></sac-stepper></div>
            </sac-section>
        </div>

        <div class="pl-work" slot="end">
            <div class="viewport pl-viewport">
                <sac-pixel-canvas class="pl-canvas" tile-grid="8"></sac-pixel-canvas>
                <sac-hud class="pl-hud" position="top-right"></sac-hud>
            </div>
            <sac-filmstrip class="pl-film" actions reorderable pixelated value="0">
                <div slot="controls" class="pl-film-ctrl">
                    <button type="button" class="icon-btn pl-play" title="Play"><sac-icon name="play"></sac-icon></button>
                    <button type="button" class="icon-btn pl-onion active" title="Onion skin (O)"><sac-icon name="onion"></sac-icon></button>
                </div>
            </sac-filmstrip>
        </div>
    </sac-split>
</div>`;
        }

        /* ------------------------------------------------- app contract --- */

        mount(context) {
            this._ctx = context;
            this._file = null;        // the FileRef we opened / last saved
            const $ = (s) => this.querySelector(s);
            const nav = $("sac-nav");
            if (nav) nav.host = context.host;
            this.$canvas = $(".pl-canvas");
            this.$pv = $(".pl-pv");
            this.$tools = $(".pl-tools");
            this.$layers = $(".pl-layers");
            this.$film = $(".pl-film");
            this.$hud = $(".pl-hud");
            this.$color = $(".pl-color");
            this.$palette = $(".pl-palette");

            this.$tools.tools = TOOLS;
            this.$palette.colors = [{ value: "transparent", label: "Transparent" },
                ...PALETTE.map((value) => ({ value, selected: value === "#ff004d" }))];

            this._wire();
            this._refreshAll();

            this._io = new IntersectionObserver((es) => this._setVisible(es[es.length - 1].isIntersecting));
            this._io.observe(this);
        }

        unmount() {
            this._setVisible(false);
            this._io?.disconnect();
        }

        /**
         * On stage / off stage. Hotkeys are global, so they exist only while
         * the app is looked at — including the toolbox's (its `hotkeys`
         * attribute is toggled, which registers / unregisters its keys).
         */
        _setVisible(v) {
            if (v === this._visible) return;
            this._visible = v;
            if (v) {
                this.$tools.setAttribute("hotkeys", "");
                this._bindKeys();
            } else {
                this.$tools.removeAttribute("hotkeys");
                this._offs.forEach((off) => off());
                this._offs = [];
                this._stopPlay();
            }
        }

        _bindKeys() {
            const k = (combo, fn, description, group) =>
                this._offs.push(sac.hotkeys.register(combo, fn, { description, group }));
            k("mod+z", () => this._undo(), "Undo", "Edit");
            k("mod+shift+z", () => this._redo(), "Redo", "Edit");
            k("mod+y", () => this._redo(), "Redo", "Edit");
            k("delete", () => this._clearSelection(), "Clear the selection", "Edit");
            k("escape", () => this._select(null), "Deselect", "Edit");
            k("mod+a", () => this._select({ x: 0, y: 0, w: W, h: H }), "Select all", "Edit");
            k("[", () => this._setBrush(this.brush - 1), "Smaller brush", "Tools");
            k("]", () => this._setBrush(this.brush + 1), "Bigger brush", "Tools");
            k("plus", () => this.$canvas.zoomIn(), "Zoom in", "View");
            k("=", () => this.$canvas.zoomIn(), "", "View");
            k("-", () => this.$canvas.zoomOut(), "Zoom out", "View");
            k("0", () => this.$canvas.fit(), "Fit", "View");
            k("left", () => this._setFrame(this.frame - 1), "Previous frame", "Frames");
            k("right", () => this._setFrame(this.frame + 1), "Next frame", "Frames");
            k("o", () => this._toggleOnion(), "Onion skin", "Frames");
            k("enter", () => this._togglePlay(), "Play / stop", "Frames");
            k("mod+o", () => this._open(), "Open…", "File");
            k("mod+s", () => this._save(false), "Save", "File");
            k("mod+shift+s", () => this._save(true), "Save as…", "File");
            k("mod+e", () => this._export(), "Export PNG", "File");
            this._offs.push(sac.shortcuts.bind());
            this._offs.push(sac.shortcuts.add([
                { group: "View", keys: "Space + drag", description: "Pan" },
                { group: "View", keys: ["Middle-drag"], description: "Pan" },
                { group: "View", keys: ["Wheel"], description: "Zoom at the cursor" },
                { group: "Tools", keys: ["Alt", "click"], description: "Pick a color with any tool" },
                { group: "Tools", keys: ["Shift", "click"], description: "Pencil: line from the last point" },
            ]));
        }

        /* ------------------------------------------------------ wiring ---- */

        _wire() {
            const on = (sel, type, fn) => this.querySelector(sel).addEventListener(type, fn);
            on(".pl-undo", "click", () => this._undo());
            on(".pl-redo", "click", () => this._redo());
            on(".pl-zin", "click", () => this.$canvas.zoomIn());
            on(".pl-zout", "click", () => this.$canvas.zoomOut());
            on(".pl-fit", "click", () => this.$canvas.fit());
            on(".pl-export", "click", () => this._export());
            on(".pl-open", "click", () => this._open());
            on(".pl-save", "click", () => this._save(false));
            on(".pl-keys", "click", () => sac.shortcuts.show({ title: "Pixel Lab shortcuts" }));
            on(".pl-play", "click", () => this._togglePlay());
            on(".pl-onion", "click", () => this._toggleOnion());

            this.$tools.addEventListener("sac:change", (e) => this._setTool(e.detail.value));
            on(".pl-brush", "sac:change", (e) => this._setBrush(e.detail.value));
            on(".pl-fps", "sac:change", (e) => { this.fps = e.detail.value; if (this._timer) { this._stopPlay(); this._togglePlay(); } });
            this.$color.addEventListener("sac:change", (e) => { if (e.detail) this._setColor(hexToRgba(e.detail.value), "field"); });
            this.$palette.addEventListener("sac:change", (e) => this._setColor(hexToRgba(e.detail.value), "palette"));

            // Canvas: the kit reports cells, the tools below do the pixels.
            const c = this.$canvas;
            c.addEventListener("sac:pixel-down", (e) => this._down(e.detail));
            c.addEventListener("sac:pixel-move", (e) => this._drag(e.detail));
            c.addEventListener("sac:pixel-up", () => this._up());
            c.addEventListener("sac:pixel-cancel", () => this._cancel());
            c.addEventListener("sac:pixel-hover", (e) => this._hud(e.detail));
            c.addEventListener("sac:zoom", () => this._hud(this._lastCell));
            c.addEventListener("contextmenu", (e) => e.preventDefault());

            // Layers.
            const L = this.$layers;
            L.addEventListener("sac:change", (e) => { this.layer = e.detail.id; this._refreshLayers(); });
            L.addEventListener("sac:toggle", (e) => {
                this._push();
                const l = this.doc.layers.find((x) => x.id === e.detail.id);
                l[e.detail.prop] = e.detail.value;
                this._refreshAll();
            });
            L.addEventListener("sac:rename", (e) => {
                this._push();
                this.doc.layers.find((x) => x.id === e.detail.id).name = e.detail.name;
                this._refreshLayers();
            });
            L.addEventListener("sac:reorder", (e) => { this._push(); this.doc.move(this.doc.layers, e.detail.from, e.detail.to); this._refreshAll(); });
            L.addEventListener("sac:action", (e) => {
                this._push();
                const a = e.detail.action;
                if (a === "add") this.layer = this.doc.addLayer(null, Math.max(0, this.doc.layers.findIndex((l) => l.id === this.layer)));
                if (a === "duplicate") this.layer = this.doc.duplicateLayer(this.layer);
                if (a === "delete" && this.doc.removeLayer(this.layer)) this.layer = this.doc.layers[0].id;
                this._refreshAll();
            });

            // Frames.
            const F = this.$film;
            F.addEventListener("sac:change", (e) => this._setFrame(e.detail.index));
            F.addEventListener("sac:reorder", (e) => {
                this._push();
                this.doc.move(this.doc.frames, e.detail.from, e.detail.to);
                this.frame = e.detail.to;
                this._refreshAll();
            });
            F.addEventListener("sac:action", (e) => {
                const a = e.detail.action, i = this.frame;
                if (a === "delete" && this.doc.frames.length < 2) return;
                this._push();
                if (a === "add") { this.doc.addFrame(i + 1); this.frame = i + 1; }
                if (a === "duplicate") { this.doc.addFrame(i + 1, i); this.frame = i + 1; }
                if (a === "delete") { this.doc.frames.splice(i, 1); this.frame = Math.min(i, this.doc.frames.length - 1); }
                this._refreshAll();
            });
        }

        /* ------------------------------------------------------- tools ---- */

        _buf() { return this.doc.frames[this.frame][this.layer]; }
        _activeLayer() { return this.doc.layers.find((l) => l.id === this.layer); }
        _paintColor() { return this.tool === "eraser" ? [0, 0, 0, 0] : this.color; }

        _down(c) {
            if (this._timer) this._stopPlay();
            if (c.button === 2) return;
            // Alt+click or the eyedropper: pick from what you SEE (the composite).
            if (c.altKey || this.tool === "pick") { this._pick(c); this._picking = true; return; }
            if (this.tool === "marquee") { this._selStart = c; this._select({ x: c.x, y: c.y, w: 1, h: 1 }); return; }
            if (!c.inside && this.tool === "fill") return;
            if (this._activeLayer().locked) { this._toast("This layer is locked"); return; }
            this._push();
            this._stroke = { start: c, last: c, base: this._buf().slice() };
            const buf = this._buf(), col = this._paintColor();
            if (SHAPES.has(this.tool)) raster[this.tool](this.doc, buf, c, c, this.brush, col);
            else if (this.tool === "fill") raster.fill(this.doc, buf, c.x, c.y, col);
            else if (c.shiftKey && this._lastPoint) raster.line(this.doc, buf, this._lastPoint, c, this.brush, col);
            else raster.stamp(this.doc, buf, c.x, c.y, this.brush, col);
            this._refreshCanvas();
        }

        _drag(c) {
            this._hud(c);
            if (this._picking) { this._pick(c); return; }
            if (this._selStart) {
                const a = this._selStart;
                const x0 = Math.max(0, Math.min(a.x, c.x)), y0 = Math.max(0, Math.min(a.y, c.y));
                const x1 = Math.min(W - 1, Math.max(a.x, c.x)), y1 = Math.min(H - 1, Math.max(a.y, c.y));
                this._select({ x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 });
                return;
            }
            const s = this._stroke;
            if (!s || this.tool === "fill") return;
            const buf = this._buf(), col = this._paintColor();
            if (SHAPES.has(this.tool)) { buf.set(s.base); raster[this.tool](this.doc, buf, s.start, c, this.brush, col); }
            else raster.line(this.doc, buf, s.last, c, this.brush, col);   // fast strokes skip cells
            s.last = c;
            this._refreshCanvas();
        }

        _up() {
            this._picking = false;
            this._selStart = null;
            if (!this._stroke) return;
            this._lastPoint = this._stroke.last;
            this._stroke = null;
            this._refreshAll();
        }

        /** A second finger turned the stroke into a pinch: roll it back. */
        _cancel() {
            if (this._stroke) { this._buf().set(this._stroke.base); this.undo.pop(); this._stroke = null; this._refreshCanvas(); }
            this._picking = false; this._selStart = null;
        }

        _pick(c) {
            if (!c.inside) return;
            const img = this.doc.composite(this.frame), i = (c.ly * W + c.lx) * 4;
            this._setColor([img.data[i], img.data[i + 1], img.data[i + 2], img.data[i + 3]]);
        }

        _select(s) { this.sel = s; this.$canvas.selection = s; }
        _clearSelection() {
            if (!this.sel || this._activeLayer().locked) return;
            this._push();
            const s = this.sel;
            for (let y = s.y; y < s.y + s.h; y++) for (let x = s.x; x < s.x + s.w; x++) this.doc.set(this._buf(), x, y, [0, 0, 0, 0]);
            this._refreshAll();
        }

        _setTool(t) {
            this.tool = t;
            this.$tools.value = t;
            if (t !== "marquee") this._select(null);
            this.$canvas.style.cursor = t === "pick" ? "copy" : "";
        }
        _setBrush(n) {
            this.brush = Math.max(1, Math.min(4, n));
            this.querySelector(".pl-brush").value = this.brush;
            this.$canvas.setAttribute("brush", String(this.brush));
        }
        _setColor(c, from) {
            this.color = c;
            const hex = rgbaToHex(c);
            if (from !== "field" && hex !== "transparent") this.$color.value = hex;
            if (from !== "palette") for (const s of this.$palette.querySelectorAll("sac-swatch")) s.selected = s.value === hex;
        }

        /* ----------------------------------------------------- history ---- */

        _push() {
            this.undo.push(this.doc.snapshot());
            if (this.undo.length > UNDO_LIMIT) this.undo.shift();
            this.redo = [];
            // Every edit goes through here first: the one place to say
            // "unsaved work" — leaving the page now asks.
            this._ctx?.setDirty?.(true);
        }
        _undo() { if (!this.undo.length) return; this.redo.push(this.doc.snapshot()); this._restore(this.undo.pop()); }
        _redo() { if (!this.redo.length) return; this.undo.push(this.doc.snapshot()); this._restore(this.redo.pop()); }
        _restore(s) {
            this.doc.restore(s);
            if (!this.doc.layers.some((l) => l.id === this.layer)) this.layer = this.doc.layers[0].id;
            this.frame = Math.min(this.frame, this.doc.frames.length - 1);
            this._refreshAll();
        }

        /* ------------------------------------------------------ frames ---- */

        _setFrame(i) {
            const n = this.doc.frames.length;
            this.frame = ((i % n) + n) % n;
            this._refreshAll();
        }
        _toggleOnion() {
            this.onion = !this.onion;
            this.querySelector(".pl-onion").classList.toggle("active", this.onion);
            this._refreshCanvas();
        }
        _togglePlay() {
            if (this._timer) return this._stopPlay();
            if (this.doc.frames.length < 2) return;
            this._setPlayIcon(true);
            this._timer = setInterval(() => this._setFrame(this.frame + 1), 1000 / this.fps);
        }
        _stopPlay() { clearInterval(this._timer); this._timer = null; this._setPlayIcon(false); }
        _setPlayIcon(on) {
            const b = this.querySelector(".pl-play");
            b.title = on ? "Stop" : "Play";
            b.querySelector("sac-icon").setAttribute("name", on ? "pause" : "play");
        }

        /* ---------------------------------------------------- refresh ----- */

        _refreshCanvas() {
            const img = this.doc.composite(this.frame), n = this.doc.frames.length;
            const under = [];
            if (this.onion && !this._timer && n > 1) {
                // Onion wraps the loop: the last frame shows the first behind it.
                const prev = (this.frame - 1 + n) % n, next = (this.frame + 1) % n;
                for (const f of new Set([prev, next])) under.push({ image: this.doc.composite(f), opacity: 0.28 });
            }
            this.$canvas.underlays = under;
            this.$canvas.image = img;
            this.$pv.image = img;
            this.$film.frames = this.doc.frames.map((_, i) => i === this.frame ? img : this.doc.composite(i));
        }
        _refreshLayers() {
            this.$layers.layers = this.doc.layers.map((l) => ({ ...l, thumb: this.doc.composite(this.frame, l.id) }));
            this.$layers.value = this.layer;
        }
        _refreshAll() {
            this._refreshCanvas();
            this._refreshLayers();
            this.$film.value = String(this.frame);
            this._hud(this._lastCell);
        }
        _hud(c) {
            this._lastCell = c;
            const pos = c && c.inside ? `${c.lx}, ${c.ly}` : "–";
            this.$hud.textContent = `${pos} · ${this.$canvas.zoom}× · frame ${this.frame + 1}/${this.doc.frames.length}`;
        }
        _toast(msg) { if (window.sac && sac.toast) sac.toast(msg); }

        /* ------------------------------------------------- open / save ---- */

        /** The document's file: a 1× strip, one 16×16 cell per frame. */
        _sheet() {
            const n = this.doc.frames.length;
            const c = document.createElement("canvas");
            c.width = W * n; c.height = H;
            this.doc.frames.forEach((_, f) => c.getContext("2d").putImageData(this.doc.composite(f), f * W, 0));
            return new Promise((resolve) => c.toBlob(resolve, "image/png"));
        }

        /** Save = back through the handle; Save as (or no handle yet) asks. */
        async _save(asNew) {
            const files = this._ctx && this._ctx.files;
            if (!files) { this._toast("This host offers no file saving."); return; }
            const saved = await files.save(await this._sheet(), {
                name: this._file ? this._file.name : "sprite.png",
                handle: asNew || !this._file ? null : this._file.handle,
                accept: ".png",
            });
            if (!saved) return;
            this._file = saved;
            this._ctx.setDirty?.(false);
            this._toast(files.kind === "browser" && !saved.handle ? `Downloaded ${saved.name}` : `Saved ${saved.name}`);
        }

        /** Open a 16×16 sprite or a 16-px-high strip: one frame per cell. */
        async _open() {
            const files = this._ctx && this._ctx.files;
            if (!files) return;
            const picked = await files.open({ accept: ".png,image/png" });
            if (!picked) return;
            let bmp;
            try { bmp = await createImageBitmap(picked.file); }
            catch (err) { this._toast(`${picked.name} is not an image.`); return; }
            if (bmp.height !== H || bmp.width % W !== 0) {
                this._toast(`Pixel Lab opens ${W}×${H} sprites or ${H}-px-high strips — ${picked.name} is ${bmp.width}×${bmp.height}.`);
                return;
            }
            const c = document.createElement("canvas");
            c.width = bmp.width; c.height = bmp.height;
            const g = c.getContext("2d", { willReadFrequently: true });
            g.drawImage(bmp, 0, 0);
            const doc = new PixelDoc(W, H);
            const id = doc.addLayer("Layer 1");
            for (let f = 0; f < bmp.width / W; f++) {
                doc.frames.push({ [id]: new Uint8ClampedArray(g.getImageData(f * W, 0, W, H).data) });
            }
            this._stopPlay();
            this.doc = doc;
            this.layer = id;
            this.frame = 0;
            this.sel = null;
            this.undo = []; this.redo = [];
            this._file = picked;
            this._ctx.setDirty?.(false);
            this._refreshAll();
            this.$canvas.fit();
            this._toast(`Opened ${picked.name}`);
        }

        /* ------------------------------------------------------ export ---- */

        async _export() {
            const dlg = document.createElement("sac-dialog");
            dlg.setAttribute("title", "Export PNG");
            dlg.buttons = [
                { action: "cancel", label: "Cancel", kind: "default" },
                { action: "export", label: "Export…", kind: "primary" },
            ];
            dlg.innerHTML = `
                <div class="pl-export-form">
                    <div class="pl-row"><label>What</label>
                        <sac-segmented-control class="pl-x-what" value="sheet">
                            <button data-value="frame">This frame</button>
                            <button data-value="sheet">Sprite sheet</button>
                        </sac-segmented-control></div>
                    <div class="pl-row"><label>Scale</label>
                        <sac-stepper class="pl-x-scale" value="8" min="1" max="32" unit="×" label="Scale"></sac-stepper></div>
                    <p class="pl-x-size"></p>
                </div>`;
            const size = () => {
                const what = dlg.querySelector(".pl-x-what").value, s = dlg.querySelector(".pl-x-scale").value;
                const n = what === "sheet" ? this.doc.frames.length : 1;
                dlg.querySelector(".pl-x-size").textContent = `${W * n * s} × ${H * s} px`;
            };
            dlg.addEventListener("sac:change", size);
            document.body.appendChild(dlg);
            size();
            const action = await new Promise((resolve) => {
                dlg.addEventListener("sac:action", (e) => resolve(e.detail.action), { once: true });
                setTimeout(() => dlg.open(), 0);
            });
            const what = dlg.querySelector(".pl-x-what").value, s = dlg.querySelector(".pl-x-scale").value;
            setTimeout(() => dlg.remove(), 150);
            if (action !== "export") return;

            const frames = what === "sheet" ? this.doc.frames.map((_, i) => i) : [this.frame];
            const src = document.createElement("canvas");
            src.width = W * frames.length; src.height = H;
            frames.forEach((f, k) => src.getContext("2d").putImageData(this.doc.composite(f), k * W, 0));
            const out = document.createElement("canvas");
            out.width = src.width * s; out.height = src.height * s;
            const ctx = out.getContext("2d");
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(src, 0, 0, out.width, out.height);
            // An export is a copy, never the document: no handle, and the
            // document's own file stays the one Save writes to.
            const blob = await new Promise((resolve) => out.toBlob(resolve, "image/png"));
            const name = what === "sheet" ? "pixel-lab-sheet.png" : `pixel-lab-frame-${this.frame + 1}.png`;
            if (this._ctx && this._ctx.files) await this._ctx.files.save(blob, { name, accept: ".png" });
        }
    }

    if (!customElements.get("app-pixel-lab")) customElements.define("app-pixel-lab", AppPixelLab);
})();
