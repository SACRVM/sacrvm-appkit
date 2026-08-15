/**
 * SACRVM APPKIT — convenience autoloader.
 *
 * Usage:
 *   <script src="kit/js/all.js"></script>
 *
 * One tag, everything loads in order. Cherry-picking individual scripts
 * (see the "Script load order" section of the style guide's Helpers page)
 * stays the recommended production path — this file is for quick starts
 * and demos.
 *
 * Vendor libs (marked, purify) and the ES-module help-loader are NOT
 * included — pull those in yourself when a view needs markdown help.
 * Components define themselves as they arrive; loading order only matters
 * because later scripts may reference sac.* globals set up by earlier ones.
 */
(function () {
    const base = document.currentScript.src.replace(/all\.js(\?.*)?$/, "");

    const files = [
        // lib — globals first, then the rest in dependency order
        "lib/globals.js",
        "lib/icons.js",
        "lib/router.js",
        "lib/scope.js",
        "lib/dialog.js",
        "lib/pan-zoom.js",
        "lib/apps.js",
        "lib/hotkeys.js",
        "lib/color.js",

        // components — any order, except where a comment says otherwise
        "components/sac-icon.js",
        "components/sac-nav.js",
        "components/sac-footer.js",
        "components/sac-window.js",
        "components/sac-dialog.js",
        "components/sac-split.js",
        "components/sac-section.js",
        "components/sac-toggle.js",
        "components/sac-slider.js",
        "components/sac-stepper.js",
        "components/sac-segmented-control.js",

        // color suite — sac-color-picker MUST precede sac-color-field,
        // which builds a picker inside its popover.
        "components/sac-color-picker.js",
        "components/sac-color-field.js",
        "components/sac-swatch-grid.js",

        // date suite — sac-calendar MUST precede sac-date-field,
        // which builds a calendar inside its popover.
        "components/sac-calendar.js",
        "components/sac-date-field.js",

        "components/sac-collapsible.js",
        "components/sac-drop-zone.js",
        "components/sac-status-banner.js",
        "components/sac-loader.js",
        "components/sac-log.js",
        "components/sac-hud.js",
        "components/sac-chip.js",
        "components/sac-chip-input.js",
        "components/sac-avatar.js",
        "components/sac-copy-button.js",
        "components/sac-scene-graph.js",
        "components/sac-toast.js",
        "components/sac-tabs.js",
        "components/sac-tooltip.js",
        "components/sac-menu.js",
        "components/sac-command-palette.js",
        "components/sac-progress.js",
        "components/sac-spinner.js",
        "components/sac-theme-toggle.js",
        "components/sac-launcher.js",
    ];

    for (const file of files) {
        const s = document.createElement("script");
        s.src = base + file;
        s.async = false; // dynamically inserted classic scripts + async=false = insertion order
        document.head.appendChild(s);
    }
})();
