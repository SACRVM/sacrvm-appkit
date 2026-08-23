---
description: Cut a versioned release — bump, commit, tag, push, notify consumers (the GitHub Action builds the ZIP)
argument-hint: <version, e.g. 2.1.0>
---
Cut release **$ARGUMENTS** of SACRVM APPKIT.

This is a solo repo with **no PRs**: work lands on `master` directly, and a pushed
`vX.Y.Z` tag triggers `.github/workflows/release.yml`, which writes `kit/VERSION`,
zips `kit/` + `LICENSE` into `sacrvm-appkit-X.Y.Z.zip`, and creates a GitHub release
with generated notes. A second job npm-publishes the same plain files **only** if an
`NPM_TOKEN` secret exists, and skips quietly otherwise. Packaging happens **only**
server-side — the local workflow stays build-free by design.

Follow these steps exactly:

1. **Sanity.** Confirm `$ARGUMENTS` is a plain semver `X.Y.Z`. Decide MAJOR/MINOR/PATCH
   from the changes since the last tag — a **breaking** change (renamed/removed API,
   changed event shape, a markup contract like the `<select>` wrapper) means a MAJOR
   bump. Run `git status`: the tree must be clean (commit or stop if it is not). If the
   work sits on a feature branch, `git checkout master` then `git merge --ff-only <branch>` —
   this repo keeps **linear history**, never a merge commit.

2. **Bump the version.** It lives in exactly these spots (kept deliberately few — do
   NOT scatter it further; the About demo and the roadmap carry none on purpose, and
   `kit/VERSION` is written by the Action, not committed):
   - `package.json` → the `"version"` field.
   - `index.html` → `<sac-nav … app-name="vX.Y.Z">`, the Download `href`
     (`…/releases/download/vX.Y.Z/sacrvm-appkit-X.Y.Z.zip`), the Download tile-meta
     (`vX.Y.Z · ZIP`), and `<sac-footer … version="X.Y.Z">`.
   Also fix any now-stale count in the `package.json` description if components changed.

3. **Commit** on `master`: subject `Stamp $ARGUMENTS`, then a one-paragraph body naming
   the headline changes (say "breaking" plainly when the MAJOR moved, and point at
   `MIGRATION.md` if consumers must change). End with the repo's `Co-Authored-By:`
   trailer naming the model that made the commit (e.g.
   `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`).

4. **Push, then tag.** `git push origin master`, then
   `git tag -a v$ARGUMENTS -m "v$ARGUMENTS — <one-line summary>"` and
   `git push origin v$ARGUMENTS`. The **tag push is the publish** — a public release
   goes out the moment it lands. Only push the tag when the release is truly intended.

5. **Verify.** Poll `gh run list --workflow=release.yml` until the `v$ARGUMENTS` run is
   `completed / success`, then `gh release view v$ARGUMENTS` and confirm the
   `sacrvm-appkit-$ARGUMENTS.zip` asset is attached. Report the release URL.

6. **Notify every consumer app repo — standing policy, do this on EVERY release (patch
   included).** A kit release does not reach a consumer until it re-vendors: until the
   Tier-4 self-contained embed exists, a hosted app runs against the HOST's kit, so a
   new version only lands once each repo pulls it. After the release verifies, send a
   re-vendor "update now" message to every consumer via `firepit_send_to`; each repo
   decides whether to act. Current consumers (keep this list current as they appear or
   retire):
   - `sacrvm-desktop` — the host; call out anything that changes hosted-app behavior.
   - `sacrvm-calculator`, `sacrvm-notes`, `color-bucket` — apps.
   - `sacrvm-app-template` — so new apps start on the current kit.
   Each message carries: the version + release URL, the one-line re-vendor step (delete
   `kit/`, unzip the new ZIP), the headline changes that touch that repo, and the
   version-skew caveat (a new-version feature is unusable on a host still on an older
   kit until the host re-vendors too).

Note: the hub's Download tile links to the `vX.Y.Z` release, so it 404s until this
Action finishes — cut the release as part of shipping, never long before.
