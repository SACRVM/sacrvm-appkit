/**
 * <sg-components-view> (#/components) — every kit component, live, with
 * attribute/event/method tables. Undocumented = doesn't exist; this page is
 * the contract.
 */
(function () {
    const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const table = (title, rows) => rows.length === 0 ? "" : `
        <table class="sg">
            <tr><th style="width:220px">${title}</th><th>Description</th></tr>
            ${rows.map(([k, v]) => `<tr><td><code>${esc(k)}</code></td><td>${v}</td></tr>`).join("")}
        </table>`;

    const code = (s) => `<pre class="sg-code"><code>${esc(s)}</code></pre>`;

    // A stand-in "photo" for the sac-avatar src demo. Inline data URI, because
    // the guide must never reach out to the network to render itself.
    const DEMO_PORTRAIT =
        "data:image/svg+xml;utf8," +
        "<svg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2064%2064'>" +
        "<rect%20width='64'%20height='64'%20fill='%23475569'/>" +
        "<circle%20cx='32'%20cy='25'%20r='11'%20fill='%23cbd5e1'/>" +
        "<path%20d='M9%2064c0-13%2010-21%2023-21s23%208%2023%2021z'%20fill='%23cbd5e1'/></svg>";

    class SgComponentsView extends HTMLElement {
        connectedCallback() {
            this.render();
            this.wire();
        }

        render() {
            this.innerHTML = `
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
                <p>The fixed 50px glassmorphic ribbon + slide-out panel you are looking at right now.
                   The panel list is computed from <code>sac.router.routes()</code> — nothing hardcoded;
                   it re-renders on <code>sac:route-registered</code>, <code>hashchange</code> and
                   <code>sac:scope-changed</code>. Content below needs <code>padding-top: 50px</code>
                   (<code>#app-root</code> / <code>.main-layout</code> handle this).</p>
                ${table("Attribute", [
                    ["brand", "Brand text left of the separator."],
                    ["brand-icon", "Icon name rendered before the brand text."],
                    ["brand-href", "Brand link target (default <code>#/</code>, scope-aware)."],
                    ["app-name", "Accent-colored text after “BRAND ·”."],
                ])}
                ${table("Slot", [
                    ["context", "Never touched by toolbar repaints — for persistent controls (the theme switcher above lives here)."],
                    ["toolbar", "Right-aligned per-page content. Use the <code>.toolbar</code> recipe for sizing."],
                ])}
                ${table("API", [
                    ["sac.toolbar.set(items)", "Projection alternative for SPA views: <code>[{icon, title, onClick, active?, disabled?}]</code>. The router clears items between view swaps."],
                ])}
                ${code(`<sac-nav brand="MY TOOLS" app-name="EDITOR" brand-icon="cube">
    <div slot="toolbar" class="toolbar">
        <button class="btn primary">Open</button>
    </div>
</sac-nav>`)}

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
                   buttons</strong>. Use the <code>sac.dialog.confirm()</code> promise wrapper.</p>
                <div class="sg-demo sg-row">
                    <button class="btn danger" style="width:auto" id="demo-dialog">Delete something…</button>
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
});   // → "delete" | "cancel" | null (Escape/backdrop = null)`)}

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
                ${table("sac-swatch attribute", [
                    ["value", "Any CSS color string (data, not theme). <code>transparent</code> is special-cased to a checkerboard + thin neutral diagonal line rather than a flat fill."],
                    ["label", "Sets aria-label + title on the internal button. Falls back to <code>value</code> when absent, so a swatch is never nameless."],
                    ["count", "Small corner pill. The attribute's <em>presence</em> shows it — <code>count=\"0\"</code> still renders “0”; omit it entirely for no pill."],
                    ["selected", "Boolean, reflected. A 2px <code>--accent</code> outline at 2px offset — an outline, not a border. Set by the grid in selectable mode, or directly on a stand-alone swatch."],
                    ["disabled", "Boolean, reflected. Unclickable, unfocusable, skipped by the keyboard walk and excluded from the roving tabindex."],
                ])}
                ${table("sac-swatch-grid attribute", [
                    ["columns", "Grid column count, default 8. A CSS custom property under the hood — changing it restyles, never re-renders — and the same number is the stride for ↓/↑ arrow navigation."],
                    ["selectable", "Turns on click-to-select (single selection) and switches the grid's role to listbox/option (plain <code>group</code> otherwise)."],
                ])}
                ${table("Property", [
                    ["sac-swatch.value / .label / .count", "String get/set; <code>\"\"</code> clears label/count."],
                    ["sac-swatch.selected / .disabled", "Boolean get/set. <code>focus()</code> forwards to the shadow-internal button."],
                    ["sac-swatch-grid.colors", "get/set <code>[{ value, label?, count?, selected?, disabled? }]</code>. The setter rebuilds the light-DOM <code>&lt;sac-swatch&gt;</code> children from scratch — the one sanctioned bulk rebuild, for JS-driven palettes. Getter and setter carry the same shape, so <code>grid.colors = grid.colors</code> is a lossless round-trip."],
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
                ${table("sac-tab-group attribute", [
                    ["active", "Name of the active tab. Observed; applied in place. Absent on connect → the first tab is activated. Property <code>.active</code> mirrors it (setting it switches tabs but fires no event — the caller already knows)."],
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
                    ["open() / close() / toggle()", "Show, hide, flip. <code>open()</code> anchors the panel to the trigger's viewport rect; the panel is <code>position: fixed</code> — no <code>overflow: hidden</code> ancestor can clip it — flips above the trigger when there is no room below, and re-anchors on scroll/resize."],
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
                   template), no command list of its own. Every open merges three <em>live</em> sources:
                   the router's registered <strong>views</strong>, the ribbon's current toolbar
                   <strong>actions</strong> (<code>sac.toolbar</code> — per-view actions become
                   keyboard-reachable for free), and the app's own <strong>commands</strong> from
                   <code>sac.commands</code>.</p>
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
            <sac-footer brand="SACRVM APPKIT" version="1.0.0"></sac-footer>
            `;
        }

        wire() {
            // Icon grid — all registry entries with names.
            const grid = this.querySelector("#icon-grid");
            grid.innerHTML = sac.icons.names().map(n => `
                <span style="display:inline-flex;flex-direction:column;align-items:center;gap:4px;width:72px;">
                    <sac-icon name="${n}" style="--icon-size:22px;color:var(--text)"></sac-icon>
                    <span style="font-size:0.62rem;color:var(--text-dim);font-family:monospace;">${n}</span>
                </span>`).join("");

            // sac-launcher — three demo registry entries. The demo tag is
            // defined inline, so sac.apps never injects the src (it checks
            // customElements.get(tag) first) — no dead request. register()
            // upserts and emits sac:apps-changed, which re-syncs the grid.
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
                                    kind: "page", href: "#/components", tile: "wide" });
            }

            // Window
            this.querySelector("#demo-open-window").addEventListener("click", () => {
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

            this.querySelector("#demo-open-plain-window").addEventListener("click", () => {
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
            if (!window.__sgWindowStateWired) {
                window.__sgWindowStateWired = true;
                ["sac:window-minimize", "sac:window-maximize", "sac:window-restore"].forEach(type => {
                    document.addEventListener(type, (e) => {
                        if (e.detail.window.id !== "sg-demo-window") return;
                        const out = document.getElementById("demo-window-state");
                        if (out) out.textContent = `${type.replace("sac:window-", "")}d`;
                    });
                });
            }

            // Split — the event bubbles, so the outer host also hears the nested one.
            const splitOut = this.querySelector("#demo-split-out");
            const splitOuter = this.querySelector("#demo-split");
            splitOuter.addEventListener("sac:split-change", (e) => {
                const which = e.target === splitOuter ? "outer" : "nested";
                splitOut.textContent = `${which} → ${e.detail.position}`;
            });

            // Dialog
            const dlgResult = this.querySelector("#demo-dialog-result");
            this.querySelector("#demo-dialog").addEventListener("click", async () => {
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

            // Banner
            const banner = this.querySelector("#demo-banner");
            const messages = {
                error: "Name is required.",
                info: "Reindex runs in the background.",
                warn: "You are editing shared state.",
                success: "Saved.",
            };
            this.querySelectorAll("[data-banner]").forEach(btn => {
                btn.addEventListener("click", () => {
                    const kind = btn.dataset.banner;
                    if (kind === "hide") banner.hide();
                    else banner.show(messages[kind], kind);
                });
            });

            // Toggle
            const toggleState = this.querySelector("#demo-toggle-state");
            this.querySelector("#demo-toggle").addEventListener("change", (e) => {
                toggleState.textContent = `state: ${e.detail}`;
            });

            // Slider
            const sliderState = this.querySelector("#demo-slider-state");
            this.querySelector("#demo-slider").addEventListener("input", (e) => {
                if (e.detail != null) sliderState.textContent = `value: ${e.detail}`;
            });

            // Stepper — sac:change carries a number, and fires once per
            // held-repeat tick, so the readout moves while the button is down.
            const stepperState = this.querySelector("#demo-stepper-state");
            [["Parts", "#demo-stepper"], ["Mix ratio", "#demo-stepper-frac"]].forEach(([name, sel]) => {
                this.querySelector(sel).addEventListener("sac:change", (e) => {
                    stepperState.textContent = `${name} → ${e.detail.value}`;
                });
            });

            // Segmented
            const segState = this.querySelector("#demo-seg-state");
            this.querySelector("#demo-seg").addEventListener("change", (e) => {
                if (typeof e.detail === "string") segState.textContent = `value: ${e.detail}`;
            });

            // Color picker — both instances report into one readout line.
            const pickOut = this.querySelector("#demo-picker-out");
            const pickDot = this.querySelector("#demo-picker-dot");
            const showColor = (label, value) => {
                pickOut.textContent = `${label} → ${value}`;
                pickDot.style.background = value;
            };
            this.querySelector("#demo-picker").addEventListener("sac:color-change",
                (e) => showColor("opaque", e.detail.value));
            this.querySelector("#demo-picker-alpha").addEventListener("sac:color-change",
                (e) => showColor("alpha", e.detail.value));

            // Color field — newest line on top, six lines kept.
            const cfOut = this.querySelector("#demo-color-field-out");
            [["Accent", "#demo-color-field"], ["Glow", "#demo-color-field-alpha"]].forEach(([name, sel]) => {
                this.querySelector(sel).addEventListener("sac:color-change", (e) => {
                    const row = document.createElement("div");
                    row.textContent = `${name} → ${e.detail.value}`;
                    cfOut.prepend(row);
                    while (cfOut.children.length > 6) cfOut.lastChild.remove();
                });
            });

            // Swatch grid — selection readout plus the .colors bulk rebuild.
            const swatches = this.querySelector("#demo-swatches");
            const swatchState = this.querySelector("#demo-swatches-state");
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
            this.querySelector("#demo-swatches-reload").addEventListener("click", () => {
                swatchAlt = !swatchAlt;
                swatches.colors = swatchAlt ? swatchPaletteEarth : swatchPaletteRainbow;
                swatchState.textContent =
                    `.colors loaded the ${swatchAlt ? "earth" : "rainbow"} palette — no event fired; click a swatch`;
            });

            // Calendar — both instances report into one readout line.
            const calOut = this.querySelector("#demo-cal-out");
            const showDate = (label, value) => {
                calOut.textContent = `${label} → ${value}`;
            };
            this.querySelector("#demo-cal").addEventListener("sac:date-change",
                (e) => showDate("free", e.detail.value));
            this.querySelector("#demo-cal-bounded").addEventListener("sac:date-change",
                (e) => showDate("bounded", e.detail.value));

            // Date field — newest line on top, six lines kept.
            const dfOut = this.querySelector("#demo-date-field-out");
            [["Due", "#demo-date-field"], ["This year", "#demo-date-field-bounded"]].forEach(([name, sel]) => {
                this.querySelector(sel).addEventListener("sac:date-change", (e) => {
                    const row = document.createElement("div");
                    row.textContent = `${name} → ${e.detail.value === "" ? "(cleared)" : e.detail.value}`;
                    dfOut.prepend(row);
                    while (dfOut.children.length > 6) dfOut.lastChild.remove();
                });
            });

            // Chip input
            const chips = this.querySelector("#demo-chips");
            const chipsState = this.querySelector("#demo-chips-state");
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
            const dropList = this.querySelector("#demo-drop-list");
            const demoDrop = this.querySelector("#demo-drop");
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
            const copyOut = this.querySelector("#demo-copy-out");
            this.querySelectorAll("sac-copy-button").forEach(btn => {
                btn.addEventListener("sac:copy", (e) => {
                    copyOut.textContent = `copied: ${e.detail.text}`;
                });
            });

            // Scene graph
            const sceneLog = this.querySelector("#demo-scene-log");
            const scene = this.querySelector("#demo-scene");
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
            const log = this.querySelector("#demo-log");
            this.querySelectorAll("[data-log]").forEach(btn => {
                btn.addEventListener("click", () => log.add(`Sample ${btn.dataset.log} entry`, btn.dataset.log));
            });

            // Loader
            this.querySelector("#demo-loader").addEventListener("click", () => {
                const loader = this.querySelector("#demo-loader-el");
                loader.show("Processing…", "This hides again in 2 seconds");
                setTimeout(() => loader.hide(), 2000);
            });

            // Tabs
            const tabsState = this.querySelector("#demo-tabs-state");
            this.querySelector("#demo-tabs").addEventListener("sac:tab-show", (e) => {
                tabsState.textContent = `active: ${e.detail.name}`;
            });

            // Menu
            const menuResult = this.querySelector("#demo-menu-result");
            this.querySelector("#demo-menu").addEventListener("sac:menu-select", (e) => {
                menuResult.textContent = `selected: ${e.detail.action}`;
            });

            // Command palette — a live button plus two demo commands. register()
            // upserts by id, so re-entering this view never duplicates them; the
            // hotkey is torn down first so it doesn't stack.
            this.querySelector("#palette-open").addEventListener("click", () => sac.palette.open());

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
            if (window.__sgDemoHotkey) window.__sgDemoHotkey();
            window.__sgDemoHotkey = sac.hotkeys.register(
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
            this.querySelectorAll("[data-toast]").forEach(btn => {
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
            const progress = this.querySelector("#demo-progress");
            this.querySelectorAll("[data-progress]").forEach(btn => {
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
            const themeState = this.querySelector("#demo-theme-toggle-state");
            this.querySelector("#demo-theme-toggle").addEventListener("sac:theme-changed", (e) => {
                themeState.textContent = `theme: ${e.detail.theme}`;
            });
        }
    }

    customElements.define("sg-components-view", SgComponentsView);
    sac.router.register("#/components", "sg-components-view", { label: "Components", icon: "shapes" });
})();
