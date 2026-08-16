`sac.identity` fills the second and last reserved slot of the app contract. API in the style guide (Helpers → sac.identity); the decisions:

**It is not authentication *on a desktop*, and the docs say so twice.** No server, no password, nothing verified — a profile is a name somebody typed into their own browser. The shape (`{ id, name, avatar }` + `onChange`) invites the wrong assumption, and the wrong assumption becomes a security hole in somebody else's app. Both the style guide and the Build an App page state it in bold; the desktop states it next to the input field, because that is where the belief forms.

**Whether identity means anything is the HOST's business.** A host with real accounts installs a provider: `sac.identity.use({ get, onChange?, set?, clear? })`. The kit keeps the app-facing shape, `forApp()` and the listener fan-out; the host answers who is here. Omit `set()` and the identity is read-only — which is what an account should be. `use(null)` restores the local profile. This is the same division as `sac.fs.backend`, and it is what THE FISHBOWL will use when it moves onto the kit: it is its own host, standalone (not a desktop app), with a real backend behind both `identity` and `fs`. An app reads the same two methods on either kind of host and never learns which one it is on — which is exactly why it must not assume the stronger one.

**`get()` is synchronous by design.** Apps call it while rendering. A host whose answer needs a round trip returns `null` until it knows, then announces via the `onChange` it provided or `sac.identity.changed()`. Apps paint "nobody" first and update — the same pattern as the theme.

**Apps read, the host writes.** `context.identity` is `{ get, onChange }` only. An app that wants a name of its own asks in its own UI and keeps it in its own `context.fs`.

**Anonymous is the default and a valid state.** `get()` returns `null` until somebody fills the profile in. The desktop hides the avatar badge entirely rather than showing an empty one.

**The id is stable and meaningless.** Not a fingerprint, not a secret: it exists so an app can key data by "who", and so a real account has something to attach to without changing the shape apps were written against. Renaming keeps the id; `clear()` drops it, because that is "forget me".

**Local storage** rides on the sac.fs backend at `sac.identity/profile`, outside every app drawer. Related: [[context-fs-design-decisions-storage-capability-2026-08-16]].
