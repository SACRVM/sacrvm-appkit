/**
 * Orb Lab — demo tool logic.
 * Bouncing orbs on a canvas; every control in the sidebar drives it live.
 * Proves: sliders/toggles/segmented events, sac-color-field, sac-log,
 * sac-hud, pan-zoom, toolbar buttons, per-app accent (the orbs read
 * var(--accent) live), a resizable sidebar via sac-split, and one Ctrl-K
 * command.
 */
window.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    const viewport = document.getElementById("viewport");
    const layer = document.getElementById("layer");
    const hud = document.getElementById("hud");
    const log = document.getElementById("log");

    const state = {
        count: 80,
        speed: 1,
        size: 8,
        trails: true,
        links: false,
        colorMode: "accent",
        customColor: "#f472b6",   // seeds <sac-color-field id="ctl-custom-color">
        paused: false,
        zoom: 1,
    };

    const paletteSlots = ["blue", "orange", "red", "green", "purple", "pink", "yellow", "teal", "gray", "indigo"];
    const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

    // ── Orbs ────────────────────────────────────────────────────────────
    let orbs = [];
    function makeOrb() {
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            r: 0.5 + Math.random(),
            slot: paletteSlots[Math.floor(Math.random() * paletteSlots.length)],
        };
    }
    function syncCount() {
        while (orbs.length < state.count) orbs.push(makeOrb());
        orbs.length = Math.min(orbs.length, state.count);
    }

    function resize() {
        const rect = viewport.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }
    // A ResizeObserver instead of a window resize listener: the sidebar split
    // changes the viewport's box without any window event, and the observer
    // fires after layout, so the measurement is never stale mid-drag.
    new ResizeObserver(resize).observe(viewport);
    resize();
    syncCount();

    // ── Render loop ─────────────────────────────────────────────────────
    let frames = 0, fps = 0, lastFpsAt = performance.now();

    function colorFor(orb) {
        if (state.colorMode === "accent")  return cssVar("--accent");
        if (state.colorMode === "palette") return cssVar(`--palette-${orb.slot}`);
        if (state.colorMode === "custom")  return state.customColor;
        return cssVar("--fg");
    }

    function tick() {
        requestAnimationFrame(tick);
        if (state.paused) return;

        if (state.trails) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        for (const o of orbs) {
            o.x += o.vx * state.speed;
            o.y += o.vy * state.speed;
            if (o.x < 0 || o.x > canvas.width)  { o.vx *= -1; o.x = Math.max(0, Math.min(canvas.width, o.x)); }
            if (o.y < 0 || o.y > canvas.height) { o.vy *= -1; o.y = Math.max(0, Math.min(canvas.height, o.y)); }
        }

        if (state.links) {
            const reach = 150;
            ctx.lineWidth = 1;
            for (let i = 0; i < orbs.length; i++) {
                for (let j = i + 1; j < orbs.length; j++) {
                    const a = orbs[i], b = orbs[j];
                    const dx = a.x - b.x, dy = a.y - b.y;
                    const d2 = dx * dx + dy * dy;
                    if (d2 < reach * reach) {
                        ctx.strokeStyle = colorFor(a);
                        ctx.globalAlpha = 0.45 * (1 - Math.sqrt(d2) / reach);
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }
            }
            ctx.globalAlpha = 1;
        }

        for (const o of orbs) {
            ctx.fillStyle = colorFor(o);
            ctx.beginPath();
            ctx.arc(o.x, o.y, o.r * state.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }

        frames++;
        const now = performance.now();
        if (now - lastFpsAt >= 1000) {
            fps = frames;
            frames = 0;
            lastFpsAt = now;
            updateHud();
        }
    }
    requestAnimationFrame(tick);

    function updateHud() {
        hud.textContent = `zoom ${state.zoom.toFixed(2)} · ${fps} fps · ${orbs.length} orbs`;
    }

    // ── Pan / zoom (kit helper, shared-transform pattern) ───────────────
    const pz = sac.setupPanZoom({
        panes: [{ pane: viewport, layer }],
        minScale: 0.3,
        maxScale: 8,
        onChange: (scale) => { state.zoom = scale; updateHud(); },
    });

    // ── Controls ────────────────────────────────────────────────────────
    // Guard: native `input` events from inside a component's shadow input
    // are composed and bubble through the host with no detail — only the
    // kit's CustomEvents carry one, so skip anything without it.
    const on = (id, type, fn) => document.getElementById(id).addEventListener(type, (e) => {
        if (e.detail == null) return;
        fn(e);
    });

    on("ctl-count", "input", (e) => {
        state.count = parseInt(e.detail, 10);
        syncCount();
        updateHud();
    });
    on("ctl-count", "change", (e) => log.add(`Orb count → ${e.detail}`));
    on("ctl-speed", "input",  (e) => { state.speed = parseFloat(e.detail); });
    on("ctl-speed", "change", (e) => log.add(`Speed → ${e.detail}×`));
    on("ctl-size", "input",   (e) => { state.size = parseInt(e.detail, 10); });
    on("ctl-size", "change",  (e) => log.add(`Size → ${e.detail}px`));

    on("ctl-trails", "change", (e) => {
        state.trails = e.detail;
        log.add(`Trails ${e.detail ? "on" : "off"}`);
    });
    on("ctl-links", "change", (e) => {
        state.links = e.detail;
        log.add(`Connect lines ${e.detail ? "on" : "off"}`, e.detail ? "warn" : "info");
    });
    // The custom well only means anything in "custom" mode, so the mode owns
    // its [disabled] — one line, and the row dims itself.
    const customColor = document.getElementById("ctl-custom-color");
    on("ctl-colors", "change", (e) => {
        if (typeof e.detail !== "string") return;
        state.colorMode = e.detail;
        customColor.toggleAttribute("disabled", e.detail !== "custom");
        log.add(`Color mode → ${e.detail}`);
    });
    // Live: the next frame already paints the new color. The log is debounced,
    // because sac:color-change fires on every drag step.
    let customLogTimer = null;
    on("ctl-custom-color", "sac:color-change", (e) => {
        state.customColor = e.detail.value;
        clearTimeout(customLogTimer);
        customLogTimer = setTimeout(() => log.add(`Custom color → ${state.customColor}`), 400);
    });

    // ── Toolbar ─────────────────────────────────────────────────────────
    const pauseBtn = document.getElementById("btn-pause");
    pauseBtn.addEventListener("click", () => {
        state.paused = !state.paused;
        pauseBtn.textContent = state.paused ? "Resume" : "Pause";
        pauseBtn.classList.toggle("primary", !state.paused);
        log.add(state.paused ? "Paused" : "Resumed", state.paused ? "warn" : "info");
    });
    function resetView() {
        pz.reset();
        log.add("View reset");
        sac.toast("View reset");
    }
    document.getElementById("btn-reset").addEventListener("click", resetView);

    // ── Command palette ─────────────────────────────────────────────────
    // One app command, running the very function the toolbar button runs.
    sac.commands.register({
        id: "reset-view",
        label: "Reset view",
        icon: "sync",
        run: resetView,
    });

    log.add("Orb Lab ready — wheel to zoom, drag to pan, double-click to reset");
    updateHud();
});
