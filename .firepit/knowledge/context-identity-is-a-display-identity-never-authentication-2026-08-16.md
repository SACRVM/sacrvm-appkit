# context.identity is a display identity, never authentication (2026-08-16)

`sac.identity` fills the second and last reserved slot of the app contract. API in the style guide (Helpers → sac.identity); the decisions:

**It is not authentication, and the docs say so twice.** No server, no password, nothing verified — a profile is a name somebody typed into their own browser. The shape (`{ id, name, avatar }` + `onChange`) invites the wrong assumption, and the wrong assumption becomes a security hole in somebody else's app. Both the style guide and the Build an App page state it in bold; the desktop states it next to the input field, because that is where the belief forms.

**Apps read, the host writes.** `context.identity` is `{ get, onChange }` only. An app that wants a name of its own asks in its own UI and keeps it in its own `context.fs` — it does not get to rename the user everywhere. `sac.identity.set/clear` exists for the host's settings UI.

**Anonymous is the default and a valid state.** `get()` returns `null` until somebody fills the profile in. Apps must handle null first; the desktop hides the avatar badge entirely rather than showing an empty one.

**The id is stable and meaningless.** Not a fingerprint, not a secret: it exists so an app can key data by "who", and so a real account — if one ever arrives — has something to attach to without changing the shape apps were written against. Renaming keeps the id (`set`); `clear()` drops it, because that is "forget me".

**Storage rides on the sac.fs backend** at `sac.identity/profile`, outside every app drawer — so a host that swapped the backend keeps identity with it, and no app can reach it through its own handle. Related: [[context-fs-design-decisions-storage-capability-2026-08-16]].
