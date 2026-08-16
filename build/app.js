/**
 * <app-build> — "Build an App", the authoring guide as a view app.
 *
 * It is written the way it tells you to write: sac.app.Element, three hooks,
 * light DOM, its own stylesheet, tokens only. The one thing it does that a
 * normal app does not is register the template app at runtime, so the "install
 * it now" button is a real install and not a screenshot of one.
 */
(function () {
    const BASE = sac.app.base();

    // The starting point every section points at.
    const TEMPLATE_REPO = "https://github.com/SACRVM/sacrvm-app-template";
    const TEMPLATE_URL  = "github.com/SACRVM/sacrvm-app-template";

    const esc = (s) => String(s)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    /** A code block with its own copy button — the page is meant to be taken. */
    const code = (s) => `
        <div class="bd-code">
            <pre><code>${esc(s)}</code></pre>
            <sac-copy-button value="${esc(s).replace(/"/g, "&quot;")}" label="Copy"></sac-copy-button>
        </div>`;

    const table = (head, rows) => `
        <table class="bd">
            <tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr>
            ${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}
        </table>`;

    // Trim after the cut too, or a slug can end on the dash the cut created.
    const slug = (text) => text.toLowerCase()
        .replace(/[^a-z0-9]+/g, "-").slice(0, 40).replace(/^-+|-+$/g, "");

    class AppBuild extends sac.app.Element {
        build() {
            sac.app.styles(BASE + "build.css", "sac-app-build-css");
            this.innerHTML = `
<div class="bd-page">
    <header>
        <h1>Build an App</h1>
        <p class="lead">An app is a repository: one manifest, one custom element,
           one stylesheet. No build step, no packaging, no store — you push, and
           anyone who installed it has the new version. This page is itself one of
           those apps, running on this shell.</p>
    </header>

    <h2>The shape of it</h2>
    <p>Three files carry an app, and a fourth lets you develop it alone. Everything
       else in a repository is optional.</p>
    ${table(["File", "What it is"], [
        ["<code>app.json</code>", "The <b>manifest</b> — what a desktop reads before it runs anything. Lives in the repository root, because that is where a desktop looks."],
        ["<code>app.js</code>", "One classic script defining <b>one</b> custom element. Not a module, so a host can inject it into any page."],
        ["<code>app.css</code>", "Styles scoped to that element. Loaded by the app itself, once per document."],
        ["<code>index.html</code>", "A harness: your app alone in a page, for developing with <code>npx serve .</code> and F5. A desktop never loads it."],
    ])}
    <p><b>One repo, one app.</b> Not a rule the kit enforces — a rule that makes
       everything else simple: the repository URL <em>is</em> the app's address,
       auto-discovery needs no configuration, and a person (or an agent) working
       on the app has exactly one thing in front of them.</p>

    <h2>Start from the template</h2>
    <p>The template repository is a working window app with the contract already
       in place. <b>Use this template</b> gives you your own copy; then rename the
       placeholder in five spots and you are writing your app, not scaffolding it.</p>
    <div class="bd-cta">
        <a class="btn primary" href="${TEMPLATE_REPO}/generate" target="_blank" rel="noopener">
            <sac-icon name="plus"></sac-icon> Use this template
        </a>
        <a class="btn" href="${TEMPLATE_REPO}" target="_blank" rel="noopener">
            <sac-icon name="document"></sac-icon> Read it first
        </a>
    </div>
    ${code(`git clone https://github.com/<you>/<your-repo>.git
cd <your-repo>
npx serve .        # http://localhost:3000 — F5 is the whole dev loop`)}
    ${table(["Rename in", "What"], [
        ["<code>app.json</code>", "<code>id</code>, <code>name</code>, <code>description</code>, <code>icon</code>, <code>tag</code>"],
        ["<code>app.js</code>", "the class name, the tag in <code>sac.app.define(…)</code>, the stylesheet id"],
        ["<code>app.css</code>", "every <code>app-my-app</code> selector"],
        ["<code>index.html</code>", "the <code>&lt;title&gt;</code> and the element in <code>&lt;body&gt;</code>"],
    ])}
    <p class="bd-note">The tag needs a dash in it — that is a custom-element rule,
       not ours — and it has to match the manifest's <code>tag</code> exactly, or a
       desktop will load your script and then wait for an element that never
       arrives.</p>

    <h2>The three hooks</h2>
    <p>Extend <code>sac.app.Element</code> and you own three moments. Everything
       around them — the guarded define, finding your own folder, loading your
       stylesheet, running with no desktop at all — is the toolkit's job.</p>
    ${code(`(function () {
    const BASE = sac.app.base();          // this script's folder, at parse time

    class AppMyApp extends sac.app.Element {
        build() {                          // once, on first connect
            sac.app.styles(BASE + "app.css", "app-my-app-css");
            this.innerHTML = \`<h2>My App</h2>\`;
        }

        onMount(context) {                 // once, when really on screen
            this._off = context.theme.onChange((t) => console.log(t));
        }

        onUnmount() {                      // the host removed you
            if (this._off) { this._off(); this._off = null; }
        }
    }

    sac.app.define("app-my-app", AppMyApp);
})();`)}
    ${table(["Hook", "When, and what belongs there"], [
        ["<code>build()</code>", "Once, on first connect. Write your markup and load your stylesheet. The element may not be visible yet — do not measure here."],
        ["<code>onMount(context)</code>", "Once, when the app is really on screen. Subscriptions, measurements, first render, reading the route. This is where the host hands you its capabilities."],
        ["<code>onUnmount()</code>", "The host removed the app. Undo exactly what <code>onMount</code> did: every unsubscribe, and <code>context.sidebar.clear()</code> if you filled the rail."],
    ])}
    <p>Switching away from a view app does <b>not</b> unmount it — the element stays
       alive and comes back as you left it. <code>onUnmount</code> means gone.</p>

    <h2>What the host hands you</h2>
    <p><code>context</code> is the entire handshake. Take what you need and assume
       nothing else: an app that works on this shell must work on somebody's own.</p>
    ${table(["context", "Description"], [
        ["<code>theme.get()</code><br><code>theme.onChange(cb)</code>", "The current theme, and a subscription that returns its own unsubscribe function. Keep it, call it in <code>onUnmount</code>."],
        ["<code>route</code><br><code>onRoute(cb)</code>", "Your sub-route — the part after <code>#/&lt;id&gt;/</code> — now, and on every change. Rail clicks, the back button and pasted links all arrive here."],
        ["<code>href(route)</code>", "Builds a link into your own app. Never hand-assemble <code>#/id/route</code>: the host owns the address space, and standalone there is no id at all."],
        ["<code>deepLink.set(route)</code>", "Makes the current state linkable (<code>replaceState</code> — switching sections is not a new page in the history)."],
        ["<code>sidebar.set([…])</code><br><code>sidebar.clear()</code>", "Projects navigation into the host's rail instead of drawing your own. Items are <code>{ label, icon, href, active }</code>, or <code>{ section }</code> for a heading."],
        ["<code>params</code>", "The query parameters the host was opened with."],
        ["<code>appId</code>", "Your id, as the host registered it."],
        ["<code>fs</code>", "Storage scoped to your app — see below. <code>null</code> if the host granted none, so check before you reach for it."],
        ["<code>identity</code>", "Reserved for who-you-are, still <code>null</code>. The contract will not change shape when it lands."],
    ])}

    <h3>Storing things</h3>
    <p><code>context.fs</code> is a small async store, scoped to your app: every
       path lives under your id, so nothing you write can collide with another
       app, and nothing another app writes can collide with you.</p>
    ${code(`async onMount(context) {
    this.store = context.fs;                       // null if the host grants none
    const settings = this.store
        ? await this.store.read("settings", { sort: "date" })
        : { sort: "date" };
}

await this.store.write("notes/2026-08", { title: "…", body: "…" });
const paths = await this.store.list("notes/");     // app-relative, sorted
await this.store.remove("notes/2026-08");`)}
    ${table(["Method", "Description"], [
        ["<code>read(path, fallback)</code>", "The value, or <code>fallback</code> when nothing is stored there."],
        ["<code>write(path, value)</code>", "Any JSON value. <b>Rejects</b> when storage is full — catch it and tell the user; a note that was not saved must not look saved."],
        ["<code>remove(path)</code> · <code>clear()</code>", "Delete one path, or everything of yours."],
        ["<code>list(prefix)</code>", "Enumerate a collection: <code>list(\"notes/\")</code>."],
        ["<code>usage()</code>", "<code>{ bytes, count }</code> — what you are keeping."],
        ["<code>watch(cb)</code>", "Changes as they happen, <b>including from another tab</b>. Returns an unsubscribe for <code>onUnmount</code>."],
    ])}
    <p class="bd-note">Async on purpose. Today it is this browser's storage; a
       host is free to back it with IndexedDB, the File System Access API or a
       server, and an app written against these seven methods does not change a
       line. That is also why you never call <code>localStorage</code> directly:
       you would be opting out of every host that offers something better.</p>
    <p class="bd-note">Everything on <code>sac</code> beyond <code>sac.app</code>
       belongs to the <b>host</b> and is optional. <code>sac.toast</code> is the usual
       example: guard it with <code>typeof sac.toast === "function"</code> rather than
       assume a desktop that has one.</p>

    <h2>The manifest</h2>
    <p>Five keys are required; the rest are how you ask for a shape.</p>
    ${code(`{
    "id": "my-app",
    "name": "My App",
    "icon": "shapes",
    "description": "One sentence — a desktop shows this on the tile.",
    "kind": "window",
    "tag": "app-my-app",
    "entry": "app.js",
    "version": "1.0.0",
    "width": "420px",
    "height": "360px"
}`)}
    ${table(["Key", "Description"], [
        ["<code>id</code> <b class=\"req\">required</b>", "Unique per desktop. A <code>view</code> app lives at <code>#/&lt;id&gt;</code>."],
        ["<code>name</code> <b class=\"req\">required</b>", "Shown on the tile and in the window title."],
        ["<code>kind</code> <b class=\"req\">required</b>", "<code>window</code>, <code>view</code> or <code>page</code> — see below."],
        ["<code>tag</code> <b class=\"req\">required</b>", "The custom element name. Must contain a dash, must match what your script defines."],
        ["<code>entry</code> <b class=\"req\">required</b>", "Path to the script, resolved against the manifest's own URL."],
        ["<code>icon</code>", "A kit icon name (<code>sac.icons.names()</code>). Falls back to a cube."],
        ["<code>description</code>", "One sentence. The tile and the install dialog both show it."],
        ["<code>version</code>", "Yours to bump. The desktop displays it next to the origin."],
        ["<code>accent</code>", "A hex seed the <b>host</b> applies to your element. An app with an identity of its own sets <code>--accent</code> in its own stylesheet instead."],
        ["<code>width</code> / <code>height</code>", "<code>window</code> apps: the initial window size."],
        ["<code>resizable</code> / <code>controls</code>", "<code>window</code> apps: passed through to <code>&lt;sac-window&gt;</code>."],
        ["<code>nav</code>", "<code>view</code> apps: <code>false</code> keeps the app out of the host's nav panel."],
    ])}

    <h2>Two shapes</h2>
    <p>The kind decides how the host frames you — and nothing else. The same
       element, the same hooks, the same context.</p>
    <div class="bd-shapes">
        <div class="card bd-shape">
            <div class="bd-shape-head"><sac-icon name="copy"></sac-icon><h3>window</h3></div>
            <p>Floats above the desktop in a <code>&lt;sac-window&gt;</code> the host
               provides. For tools you reach for and put down again: a calculator, a
               converter, a picker.</p>
            <p class="bd-eg">Example: <a href="https://github.com/SACRVM/sacrvm-calculator" target="_blank" rel="noopener">calculator</a></p>
        </div>
        <div class="card bd-shape">
            <div class="bd-shape-head"><sac-icon name="globe"></sac-icon><h3>view</h3></div>
            <p>Takes the whole stage at <code>#/&lt;id&gt;</code>, owns a sub-route, and
               projects its navigation into the host's rail. For anything that used to
               be a page of its own.</p>
            <p class="bd-eg">Example: <a href="https://github.com/SACRVM/sacrvm-notes" target="_blank" rel="noopener">notes</a> — and this page</p>
        </div>
    </div>
    <p>There is a third, <code>page</code>: a plain document the host links to. It is
       for wrapping something that is not an app at all.</p>
    <h3>Turning a window app into a view app</h3>
    <p>Three edits, about ten lines:</p>
    ${code(`// 1. app.json — "kind": "view", and drop width/height

// 2. app.js — read the route, fill the rail, publish the address
onMount(context) {
    this._ctx = context;
    this._show(context.route || "first");
    this._offRoute = context.onRoute((r) => this._show(r || "first"));
}

_show(id) {
    /* …render the section… */
    this._ctx.sidebar.set([
        { section: "My App" },
        { label: "First",  icon: "star",   href: this._ctx.href("first"),  active: id === "first" },
        { label: "Second", icon: "shapes", href: this._ctx.href("second"), active: id === "second" },
    ]);
    this._ctx.deepLink.set(id);
}

onUnmount() {
    if (this._offRoute) { this._offRoute(); this._offRoute = null; }
    this._ctx.sidebar.clear();
}

// 3. index.html — drop the .frame wrapper, put the element straight in <body>`)}

    <h2>Publish it</h2>
    <p>Publishing is turning on GitHub Pages. There is no build, no release
       artifact and nothing to upload.</p>
    <ol class="bd-steps">
        <li><b>Settings → Pages → Deploy from a branch</b>, branch <code>main</code>,
            folder <code>/ (root)</code>.</li>
        <li>Wait for the first build, then open
            <code>https://&lt;you&gt;.github.io/&lt;your-repo&gt;/app.json</code> in a
            browser. If you see the manifest, a desktop can see it too.</li>
        <li>On a desktop — <a href="https://desktop.sacrvm.dev/" target="_blank" rel="noopener">desktop.sacrvm.dev</a>
            or your own — paste <code>github.com/&lt;you&gt;/&lt;your-repo&gt;</code>
            into the install tile.</li>
    </ol>
    <p>The desktop stores your <b>address</b>, never a copy of your code. Every push
       is live for everyone who installed you — and equally: a broken push is live
       too.</p>

    <h3>What "install" actually does</h3>
    ${code(`const manifest = await sac.apps.inspect("github.com/owner/repo");
// → fetches owner.github.io/repo/app.json, validates it, resolves entry.
//   Data only: nothing registered, no code of yours has run.

sac.apps.add(manifest);      // registers it — the script is injected on
                             // first open, exactly like a built-in app`)}
    <p>Reading and running are two deliberate steps, so a desktop can show you the
       name, the version and the origin <em>before</em> anything executes. Your
       manifest is the thing a stranger reads to decide about you — write the
       description like it matters.</p>

    <div class="bd-live">
        <div class="bd-live-text">
            <h3>Try it on this page</h3>
            <p>The button installs the template app the same way a desktop would:
               read the manifest from its origin, then open it. It is not a mockup —
               the code comes from
               <code>sacrvm.github.io/sacrvm-app-template</code>.</p>
        </div>
        <button class="btn primary bd-install">
            <sac-icon name="download"></sac-icon> Install &amp; open the template
        </button>
    </div>

    <h2>Before you publish</h2>
    <ul class="bd-check">
        <li><b>The tag matches</b> the manifest, and contains a dash.</li>
        <li><b>One element per repository.</b> Helper classes are fine; a second
            <code>define()</code> means a second repo.</li>
        <li><b>Light DOM</b> — no shadow root, or the kit's stylesheet cannot reach
            your markup.</li>
        <li><b>Tokens only.</b> Style your own element, never <code>:root</code> —
            <code>:root</code> is the desktop around you. No raw colour literals; one
            <code>--accent</code> seed re-derives the rest, in both themes.</li>
        <li><b>The kit is not vendored.</b> The host provides it; your
            <code>index.html</code> only borrows it so you can develop alone.</li>
        <li><b>Cleanup in <code>onUnmount</code></b> — every subscription released,
            the rail cleared.</li>
        <li><b>No build step.</b> If it needs compiling, it is not this kind of app.</li>
        <li><b>It runs standalone</b> (<code>npx serve .</code>, no desktop) and
            <b>installed</b> — check both, they fail differently.</li>
        <li><b>Both themes</b>, and a narrow window.</li>
    </ul>

    <h2>Where to look next</h2>
    ${table(["", ""], [
        ["<a href=\"#/styleguide\">Style Guide</a>", "Every component, token and pattern, with live examples. What you build your app out of."],
        ["<a href=\"#/styleguide/helpers\">Helpers</a>", "<code>sac.app</code>, <code>sac.apps</code>, the sidebar and toolbar projections, the router — the host side of the contract."],
        [`<a href="${TEMPLATE_REPO}" target="_blank" rel="noopener">Template repo</a>`, "The starting point, with the same contract written as a README."],
        ["<a href=\"https://github.com/SACRVM/sacrvm-calculator\" target=\"_blank\" rel=\"noopener\">calculator</a> · <a href=\"https://github.com/SACRVM/sacrvm-notes\" target=\"_blank\" rel=\"noopener\">notes</a>", "Two finished apps, one of each shape. Small enough to read in a sitting."],
    ])}
</div>`;
        }

        onMount(context) {
            this._ctx = context;

            // Sections come from the headings, so adding one needs no second
            // edit here — same trick the roadmap app uses.
            this._sections = Array.from(this.querySelectorAll(".bd-page > h2")).map((h) => {
                const id = h.id || slug(h.textContent);
                h.id = id;
                return { id, label: h.textContent, el: h };
            });

            this._project(context.route);
            if (context.route) this._scrollTo(context.route);
            this._offRoute = context.onRoute((route) => {
                this._project(route);
                if (route) this._scrollTo(route);
            });

            this._installBtn = this.querySelector(".bd-install");
            this._onInstall = () => this._installTemplate();
            this._installBtn.addEventListener("click", this._onInstall);
        }

        onUnmount() {
            if (this._offRoute) { this._offRoute(); this._offRoute = null; }
            if (this._installBtn) this._installBtn.removeEventListener("click", this._onInstall);
            this._ctx.sidebar.clear();
        }

        _project(active) {
            this._ctx.sidebar.set([
                { section: "Build an App" },
                ...this._sections.map((s) => ({
                    label:  s.label,
                    icon:   "chevron-right",
                    href:   this._ctx.href(s.id),
                    active: s.id === active,
                })),
            ]);
        }

        /** Instant, deliberately: a smooth scroll is a compositor animation that
         *  silently does nothing in an unfocused tab, and a jump that always
         *  lands beats a glide that sometimes never starts. */
        _scrollTo(id) {
            const section = this._sections.find((s) => s.id === id);
            if (section) section.el.scrollIntoView({ block: "start" });
        }

        /** The live proof: read a real manifest, register it, open it. */
        async _installTemplate() {
            const btn = this._installBtn;
            btn.disabled = true;
            try {
                if (!sac.apps.get || !sac.apps.get("my-app")) {
                    const manifest = await sac.apps.inspect(TEMPLATE_URL);
                    sac.apps.add(manifest);
                }
                await sac.apps.open("my-app");
            } catch (err) {
                console.warn("[build] template install failed:", err);
                if (typeof sac.toast === "function") {
                    sac.toast(`Could not reach ${TEMPLATE_URL} — that is the origin, not you.`,
                              { kind: "error" });
                }
            } finally {
                btn.disabled = false;
            }
        }
    }

    sac.app.define("app-build", AppBuild);
})();
