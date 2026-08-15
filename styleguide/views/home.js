/**
 * <sg-home-view> (#/) — style guide landing page.
 * Dogfoods the launcher pattern: orb + hub container + tile grid.
 */
class SgHomeView extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <div class="orb"></div>
            <div class="hub-container">
                <header>
                    <h1>SACRVM APPKIT</h1>
                    <p class="intro-text">
                        A complete UI system for tool apps.
                        Zero dependencies, zero build — plain HTML, Custom Elements, CSS tokens.
                    </p>
                </header>
                <main class="grid">
                    <a class="tile" href="#/tokens">
                        <sac-icon name="star"></sac-icon>
                        <div>
                            <h2>Tokens &amp; Theming</h2>
                            <p>Seeds in, everything derived. Light, dark and custom themes from a handful of colors.</p>
                        </div>
                    </a>
                    <a class="tile" href="#/components">
                        <sac-icon name="shapes"></sac-icon>
                        <div>
                            <h2>Components</h2>
                            <p>Every sac-* element with live examples, attributes, events and methods.</p>
                        </div>
                    </a>
                    <a class="tile" href="#/layout">
                        <sac-icon name="globe"></sac-icon>
                        <div>
                            <h2>Layouts</h2>
                            <p>Workspace pages, the launcher hub, the SPA app shell and the router.</p>
                        </div>
                    </a>
                    <a class="tile" href="#/patterns">
                        <sac-icon name="document"></sac-icon>
                        <div>
                            <h2>CSS Patterns</h2>
                            <p>Buttons, cards, glass, tiles, form controls — the global classes and their rules.</p>
                        </div>
                    </a>
                    <a class="tile" href="#/helpers">
                        <sac-icon name="settings"></sac-icon>
                        <div>
                            <h2>Helpers</h2>
                            <p>Pan/zoom, dialog helper, toolbar projection, launcher overlays, help loader, scopes.</p>
                        </div>
                    </a>
                </main>
            </div>
            <sac-footer brand="SACRVM APPKIT" version="0.1.0"></sac-footer>
        `;
    }
}

customElements.define("sg-home-view", SgHomeView);
sac.router.register("#/", "sg-home-view", { label: "Home", icon: "home" });
