# Delivery model: vendoring + GitHub releases, npm as optional courtesy channel

Settled with the owner 2026-08-15. How other projects consume SACRVM APPKIT:

**Primary: vendoring.** A consumer copies the versioned `kit/` folder into its own repo and upgrades when *it* chooses. No install step, no lockfile, fully offline/self-contained, and version independence between apps by design (the Tier-4 requirement "not every app must run the same kit version" solved at the distribution level).

**Release mechanics.** Semver git tags (`v1.0.0`, …). One GitHub Action fires at tag time and produces every channel; nothing ever enters the local dev workflow (the no-build value: plain files + F5, no bundlers, packaging only server-side at release):
1. Release ZIP of `kit/` with a VERSION stamp + CHANGELOG attached to the GitHub release.
2. **npm publish as an optional courtesy channel** — owner decision: declining a channel for our own workflow is no reason to obstruct the many who do use it. Metadata-only `package.json` (zero dependencies, zero scripts, `files: ["kit/"]`); publishing ≠ using — npm never appears in our own workflow.
3. Later, the already-decided embed inliner (self-contained per-app .js) hangs off the same action.

**Rejected (recorded in the roadmap Non-goals so we stop re-deciding):**
- NuGet — .NET's package manager, wrong ecosystem for an HTML/JS kit.
- CDN delivery (jsDelivr from tags) — against the kit's self-hosted/offline value.
- Git submodules — notoriously brittle; git subtree is the fallback if manual copying ever grates.

**1.0 gate (consumer-driven doctrine):** the kit is 1.0 when every roadmap row with a real consumer is done — Tier 3b (app contract + personal launcher) and the date suite (sac-calendar + sac-date-field for the production app); Tier 3c ships with its consumer (Atelier). The Parked list does not block 1.0.
