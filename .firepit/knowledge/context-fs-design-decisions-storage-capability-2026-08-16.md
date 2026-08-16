`sac.fs` fills the reserved `context.fs` slot. The API itself is documented in the style guide (Helpers → sac.fs); this records the decisions behind it, which the API does not show.

**Scope of the rule — narrower than it reads.** "Store through `context.fs`, never `localStorage`" is about LOCAL storage only. Plenty of apps store nothing; plenty of others need a database and therefore have their own REST backend, which they call with `fetch` — entirely outside the kit's business. Server data from an app's own API and per-device preferences in `context.fs` mix freely in one app. The docs said this by omission until it was corrected on 2026-08-16; the wrong reading ("everything goes through the kit") would have made the kit look unusable for any real product.

**Async even though localStorage is synchronous.** Every method returns a Promise so a host can back the same API with IndexedDB, the File System Access API or a server later without any app changing a line.

**Namespaced, not sandboxed.** Paths live under `sac.fs/<appId>/`. Same origin, same JS realm — an app *could* reach another's data through raw localStorage. The scoping is there so the shape stays honest for a backend where it is enforced, and so two apps cannot collide on `"settings"`.

**Four-method backend.** `get/set/del/keys` is all a host replaces (`sac.fs.backend`); namespacing, JSON, error mapping and change notification stay the kit's. This is why `usage()` estimates UTF-16 bytes rather than asking the browser: the estimate is backend-independent.

**Data outlives the install.** Removing an app keeps its data by default; the desktop's remove dialog states how much there is and offers a second, explicit "Remove + delete data" button. Rationale: removing an app is a decision about the desktop, deleting what you wrote in it is a decision about your work. Consequence: orphaned drawers accumulate, so `sac.fs.apps()` (host-only in spirit — an app only sees its own drawer) exists and the desktop's settings surface leftovers with a delete.

**Standalone id = tag minus `app-`.** `<app-notes>` → `notes`, matching the manifest id under the template's naming convention (`tag = "app-" + id`). That is what lets an app keep its data when it moves from its own page onto a desktop.

**Quota is a rejection, not a warning.** `write()` rejects when storage is full; the notes app catches it, shows "Not saved" and a persistent toast. A note that was not saved must never look saved.

Found while testing: registering a view app while the hash already named it did nothing (a hash that never changed fires no `hashchange`) — that is the "install the app this link points at" case. `register()` now re-routes when nothing is on stage. Related: [[floating-panels-need-the-top-layer-a-transformed-ancestor-traps-position-fixed]], [[context-identity-is-a-display-identity-never-authentication-2026-08-16]].
