---
pin: true
---

# Design rule: no thick colored borders on rounded surfaces

Hard kit-wide design rule from the user (2026-08-14): **never combine a thick (≥2px) colored border with corner radius** — the classic "kind stripe" on the left edge of a rounded card is banned. It was shipped on sac-toast, the styleguide/roadmap callout boxes and the sac-nav active item, and removed everywhere the same day.

Approved replacements for signaling kind/state:
- **Icon color** carries the kind (e.g. sac-toast: `--kind` custom property colors the icon).
- **Subtle background tint**: ~6-8% `color-mix(in srgb, <state-color> N%, transparent)` layered over the surface.
- Accent-tinted background + accent text for active items (sac-nav).
- Thin neutral 1px hairlines (`--border`, `--border-strong`) remain fine everywhere.

When adding any new component, callout or status surface, check for the pattern first:
`grep -E "border(-left|-right|-top|-bottom)?: *[2-9]px solid var\(--" kit/ styleguide/ demo/ roadmap/`
