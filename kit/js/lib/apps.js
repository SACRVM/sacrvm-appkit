/**
 * SACRVM APPKIT — sac.apps: the app runtime.
 * Registry of app manifests, floating-window lifecycle, ?app= deep links and
 * the mount(context) capability handshake. Supersedes the old sac.launcher
 * lib (whose API survives below as a thin delegating alias).
 *
 * An app = ONE custom element in ONE classic script. The script guards its
 * definition (`if (!customElements.get(TAG)) customElements.define(...)`) and
 * registers no other tags — that is what makes an app portable to any page.
 *
 * Manifest:
 *
 *   sac.apps.register({
 *       id:          "color-bucket",          // unique; ?app= deep links + persistence key
 *       name:        "Color Bucket",          // display name
 *       icon:        "palette",               // sac-icon name
 *       description: "Mix and manage colors", // tile subline (optional)
 *       badge:       "NEW",                   // optional — short string, rendered by
 *                                             // <sac-launcher> as the tile's corner pill
 *       tile:        "wide",                  // optional tile footprint in the launcher
 *                                             // grid: "medium" (default, omit-able) |
 *                                             // "wide" (2 columns) | "large" (2 columns
 *                                             // × 2 rows); unknown values fall back to
 *                                             // medium silently
 *       kind:        "window",                // "window" (overlay app) | "page" (plain link)
 *       // kind:"window" only:
 *       tag:         "app-color-bucket",      // the app's custom element
 *       src:         "apps/color-bucket.js",  // classic script, injected on first open
 *       width:       "520px", height: "640px",// sac-window size (defaults 500px/600px)
 *       accent:      "#10b981",               // optional — set as --accent on the sac-window
 *       controls:    "close",                 // optional — sac-window controls subset ("min max close")
 *       resizable:   false,                   // optional — false sets no-resize on the window
 *       // kind:"page" only:
 *       href:        "orb-lab/",              // tile becomes a normal link
 *   });
 *   sac.apps.init();   // binds [data-app] tiles + ?app= deep links
 *
 * API:
 *   register(manifest)   upsert by id (re-register replaces; first
 *                        registration fixes the list order). Emits
 *                        "sac:apps-changed" on document.
 *   list()               → array of manifest copies, registration order
 *   get(id)              → manifest copy or null
 *   open(id, params?)    → Promise<HTMLElement> resolving to the app element.
 *                        params: URLSearchParams | object | string, handed to
 *                        the app via context.params. kind:"page" navigates
 *                        (params appended) and the promise never resolves.
 *                        kind:"window" injects src once (keyed by src), awaits
 *                        customElements.whenDefined(tag) and shows the app in
 *                        a centered, slightly cascaded <sac-window> that stays
 *                        in the DOM and is re-open()ed on later calls.
 *                        Rejects on script load failure (console.error +
 *                        sac.toast if available).
 *   close(id)            closes the window (element + window stay in the DOM)
 *   remove(id)           unregister; if a window exists, calls the app's
 *                        unmount() (when present) and removes the window.
 *                        Emits "sac:apps-changed".
 *   isOpen(id)           → boolean (window exists and is open)
 *   init()               binds click on [data-app="<id>"] tiles (delegated,
 *                        so tiles rendered later work too) and handles the
 *                        ?app=<id> deep link, then cleans the URL via
 *                        replaceState. Legacy compatibility: [data-overlay]
 *                        and ?tool= are honored the same way.
 *
 * mount(context) lifecycle:
 *   After the app element is first created and appended into its window, the
 *   host calls el.mount(context) IF the method exists — exactly once per
 *   element lifetime (re-opening an existing window does NOT re-mount).
 *   el.unmount() (if present) is called only by sac.apps.remove(). Apps that
 *   define neither still work — the contract is opt-in.
 *
 *   context = {
 *       appId: "color-bucket",
 *       params: URLSearchParams,   // deep-link params snapshot at open (empty if none)
 *       deepLink: {
 *           set(obj)               // writes ?app=<id>&<obj entries> via
 *                                  // history.replaceState; set(null) cleans the
 *                                  // URL back to the bare path (hash preserved)
 *       },
 *       theme: {
 *           get(),                 // "dark" | "light" | "auto" (the flag, not the resolution)
 *           set(mode),             // same values; routes through <sac-theme-toggle>
 *                                  // when present, so the toggle stays in sync
 *           onChange(cb),          // cb(resolved) with "dark"|"light" on every
 *                                  // EFFECTIVE change (incl. OS flips in auto);
 *                                  // returns an unsubscribe function
 *       },
 *       fs: null,                  // reserved — future shared storage capability
 *       identity: null,            // reserved — future shell identity capability
 *   }
 *
 * Events:
 *   sac:apps-changed (on document, bubbles) — detail { id, type } with type
 *   "register" | "remove"; lets registry-driven UI (e.g. <sac-launcher>)
 *   refresh when apps register after it connected.
 */
(function () {
    if (!window.sac || sac.apps) return;

    const registry = new Map();   // id  → manifest (internal copy)
    const windows  = new Map();   // id  → { win, el }
    const injected = new Map();   // src → Promise (each script injected once)
    const opening  = new Map();   // id  → in-flight open() Promise
    let stackOffset = 0;          // cascade multiple open windows slightly
    let inited = false;

    /* ------------------------------------------------------------ theme --
       One source of truth with <sac-theme-toggle>: the data-theme attribute
       on <html> ("light" / "auto", absent = dark) + the "sac-theme"
       localStorage key ("light" / "auto", removed = dark). */

    const mqLight = window.matchMedia("(prefers-color-scheme: light)");

    function themeFlag() {
        const t = document.documentElement.getAttribute("data-theme");
        return t === "light" || t === "auto" ? t : "dark";
    }

    function themeResolved() {
        const flag = themeFlag();
        if (flag === "auto") return mqLight.matches ? "light" : "dark";
        return flag;
    }

    function themeSet(mode) {
        const flag = mode === "light" || mode === "auto" ? mode : "dark";
        const toggles = document.querySelectorAll("sac-theme-toggle");
        if (toggles.length && customElements.get("sac-theme-toggle")) {
            // The toggle owns the flag: its `theme` setter applies, persists
            // and re-highlights the pill — no second mechanism to race it.
            toggles.forEach((t) => { t.theme = flag; });
            return;
        }
        // No toggle on this page: apply + persist with identical semantics.
        const root = document.documentElement;
        if (flag === "dark") root.removeAttribute("data-theme");
        else root.setAttribute("data-theme", flag);
        if (flag === "dark") localStorage.removeItem("sac-theme");
        else localStorage.setItem("sac-theme", flag);
    }

    const themeSubs = new Set();
    let themeObserver = null;
    let lastResolved = null;

    function notifyTheme() {
        const resolved = themeResolved();
        if (resolved === lastResolved) return;
        lastResolved = resolved;
        themeSubs.forEach((cb) => {
            try { cb(resolved); }
            catch (err) { console.error("[sac.apps] theme onChange callback threw:", err); }
        });
    }

    function themeOnChange(cb) {
        if (!themeObserver) {
            lastResolved = themeResolved();
            themeObserver = new MutationObserver(notifyTheme);
            themeObserver.observe(document.documentElement,
                { attributes: true, attributeFilter: ["data-theme"] });
            mqLight.addEventListener("change", notifyTheme);
        }
        themeSubs.add(cb);
        return function unsubscribe() {
            themeSubs.delete(cb);
            if (!themeSubs.size && themeObserver) {
                themeObserver.disconnect();
                themeObserver = null;
                mqLight.removeEventListener("change", notifyTheme);
            }
        };
    }

    const theme = { get: themeFlag, set: themeSet, onChange: themeOnChange };

    /* ---------------------------------------------------------- context -- */

    function makeContext(id, params) {
        return {
            appId: id,
            params: params == null ? new URLSearchParams() : new URLSearchParams(params),
            deepLink: {
                set(obj) {
                    const tail = window.location.hash;
                    if (obj == null) {
                        window.history.replaceState({}, document.title,
                            window.location.pathname + tail);
                        return;
                    }
                    const qs = new URLSearchParams();
                    qs.set("app", id);
                    Object.entries(obj).forEach(([k, v]) => {
                        if (v != null) qs.set(k, String(v));
                    });
                    window.history.replaceState({}, document.title,
                        `${window.location.pathname}?${qs}${tail}`);
                }
            },
            theme,
            fs: null,       // reserved — future shared storage capability
            identity: null, // reserved — future shell identity capability
        };
    }

    /* --------------------------------------------------------- registry -- */

    function emitChanged(id, type) {
        document.dispatchEvent(new CustomEvent("sac:apps-changed", {
            detail: { id, type },
            bubbles: true,
        }));
    }

    function register(manifest) {
        if (!manifest || !manifest.id) {
            console.warn("[sac.apps] register() needs a manifest with an id");
            return;
        }
        // Upsert: Map.set keeps the original position for existing keys, so
        // the order of FIRST registration is the list order.
        registry.set(manifest.id, Object.assign({}, manifest));
        emitChanged(manifest.id, "register");
    }

    function list() {
        return Array.from(registry.values(), (m) => Object.assign({}, m));
    }

    function get(id) {
        const m = registry.get(id);
        return m ? Object.assign({}, m) : null;
    }

    /* ----------------------------------------------------------- open ---- */

    function displayName(manifest) {
        // Legacy sac.launcher specs used `title` instead of `name`.
        return manifest.name || manifest.title || manifest.id;
    }

    function ensureDefined(manifest) {
        if (customElements.get(manifest.tag)) return Promise.resolve();
        if (!injected.has(manifest.src)) {
            injected.set(manifest.src, new Promise((resolve, reject) => {
                const script = document.createElement("script");
                script.src = manifest.src;
                script.onload = resolve;
                script.onerror = () => {
                    injected.delete(manifest.src); // a later open() may retry
                    reject(new Error(`Failed to load ${manifest.src}`));
                };
                document.head.appendChild(script);
            }));
        }
        return injected.get(manifest.src)
            .then(() => customElements.whenDefined(manifest.tag));
    }

    async function doOpen(id, params) {
        const manifest = registry.get(id);
        if (!manifest) {
            console.warn(`[sac.apps] unknown app: ${id}`);
            throw new Error(`[sac.apps] unknown app: ${id}`);
        }

        if (manifest.kind === "page") {
            let href = manifest.href;
            const qs = params == null ? "" : new URLSearchParams(params).toString();
            if (qs) href += (href.includes("?") ? "&" : "?") + qs;
            window.location.href = href;
            return new Promise(() => {}); // navigating away — never resolves
        }

        // kind:"window" (the default — legacy specs carry no kind field).
        const existing = windows.get(id);
        if (existing && existing.win.isConnected) {
            // Re-opening an app the user minimized must show the app, not the
            // collapsed title bar. A maximized window keeps its state.
            if (existing.win.hasAttribute("minimized")) existing.win.restore?.();
            existing.win.open();
            return existing.el;
        }

        try {
            await ensureDefined(manifest);
        } catch (err) {
            console.error(`[sac.apps] ${err.message}`);
            if (typeof sac.toast === "function") {
                sac.toast(`Could not load "${displayName(manifest)}".`, { kind: "error" });
            }
            throw err;
        }
        if (!registry.has(id)) throw new Error(`[sac.apps] app removed while loading: ${id}`);

        const win = document.createElement("sac-window");
        win.id = `sac-app-window-${id}`;
        win.setAttribute("title",  displayName(manifest));
        win.setAttribute("width",  manifest.width  || "500px");
        win.setAttribute("height", manifest.height || "600px");

        const w = parseInt(manifest.width  || "500", 10);
        const h = parseInt(manifest.height || "600", 10);
        const left = Math.max((window.innerWidth  - w) / 2 + stackOffset, 20);
        const top  = Math.max((window.innerHeight - h) / 2 + stackOffset, 20);
        stackOffset = (stackOffset + 40) % 200;
        win.setAttribute("left", `${left}px`);
        win.setAttribute("top",  `${top}px`);

        // Per-app accent: one seed on the window, everything derived follows.
        if (manifest.accent) win.style.setProperty("--accent", manifest.accent);

        // Window chrome, the app's choice: controls subset + fixed size.
        if (manifest.controls != null) win.setAttribute("controls", String(manifest.controls));
        if (manifest.resizable === false) win.setAttribute("no-resize", "");

        const el = document.createElement(manifest.tag);
        el.style.height = "100%";
        win.appendChild(el);
        document.body.appendChild(win);
        windows.set(id, { win, el });

        // mount(context): exactly once per element lifetime, right after the
        // element lands in the document. Opt-in — apps without mount() work.
        if (typeof el.mount === "function") {
            try { el.mount(makeContext(id, params)); }
            catch (err) { console.error(`[sac.apps] ${id}.mount() threw:`, err); }
        }

        // Defer open() to the next frame so CSS transitions trigger.
        requestAnimationFrame(() => win.open());
        return el;
    }

    function open(id, params) {
        // Collapse rapid double-opens into one window creation.
        if (opening.has(id)) return opening.get(id);
        const p = doOpen(id, params);
        opening.set(id, p);
        p.finally(() => opening.delete(id)).catch(() => {});
        return p;
    }

    /* ------------------------------------------------- close / remove ---- */

    function close(id) {
        const rec = windows.get(id);
        if (rec) rec.win.close();
    }

    function remove(id) {
        registry.delete(id);
        const rec = windows.get(id);
        if (rec) {
            if (typeof rec.el.unmount === "function") {
                try { rec.el.unmount(); }
                catch (err) { console.error(`[sac.apps] ${id}.unmount() threw:`, err); }
            }
            rec.win.remove();
            windows.delete(id);
        }
        emitChanged(id, "remove");
    }

    function isOpen(id) {
        const rec = windows.get(id);
        return !!(rec && rec.win.isConnected && rec.win.hasAttribute("open"));
    }

    /* ------------------------------------------------------------ init --- */

    function init() {
        if (!inited) {
            inited = true;
            // Tiles: [data-app="<id>"] opens that app. Delegated, so tiles
            // rendered after init() work too. [data-overlay] is the legacy
            // spelling — same behavior.
            document.addEventListener("click", (e) => {
                const tile = e.target.closest("[data-app], [data-overlay]");
                if (!tile) return;
                e.preventDefault();
                open(tile.dataset.app || tile.dataset.overlay)
                    .catch(() => {}); // already logged/toasted by open()
            });
        }

        // Deep link: ?app=<id> auto-opens (legacy: ?tool=<id>), remaining
        // params travel to the app via context.params. The URL is cleaned
        // synchronously, BEFORE the async open lands — so an app that writes
        // its own deep link during mount() is not overwritten afterwards.
        const query = new URLSearchParams(window.location.search);
        const id = query.get("app") || query.get("tool");
        if (id && registry.has(id)) {
            query.delete("app");
            query.delete("tool");
            open(id, query).catch(() => {});
            window.history.replaceState({}, document.title,
                window.location.pathname + window.location.hash);
        }
    }

    sac.apps = { register, list, get, open, close, remove, isOpen, init };

    /**
     * @deprecated sac.launcher is the pre-apps name of this API and forwards
     * to sac.apps unchanged. Legacy specs keep working: no `kind` means
     * "window", and `title` is honored as the display name. Kept so existing
     * hub pages don't break — removal is a future major.
     */
    sac.launcher = {
        register(spec) { register(spec); },
        open(id) { open(id).catch(() => {}); }, // legacy callers ignore the promise
        init() { init(); },
    };
})();
