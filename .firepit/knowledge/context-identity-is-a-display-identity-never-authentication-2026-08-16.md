`sac.identity` fills the second and last reserved slot of the app contract. API in the style guide (Helpers → sac.identity); the decisions:

**Client-side identity decides what to RENDER. Server-side verification decides what to HAND OUT.** This is the rule that matters most, and the one the shape invites you to break. The natural next step for an app with a database — resolve the person with a real provider (Google, say), then fetch their rows — is correct; sending `context.identity.get().id` to your API and trusting it is not. That id arrives from the client, so anybody can put anybody's id in it. The server must verify the credential the host issued (ID token, session cookie) itself. The kit can only answer the first question and never pretends otherwise. Stated on the Build an App page in a warning box and in the style guide.

**It is not authentication *on a desktop*.** No server, no password, nothing verified — a profile is a name somebody typed into their own browser. The desktop says so next to the input field, because that is where the belief forms.

**Whether identity means anything is the HOST's business.** A host with real accounts installs a provider: `sac.identity.use({ get, onChange?, set?, clear? })`. The kit keeps the app-facing shape, `forApp()` and the fan-out; the host answers who is here. Omit `set()` and the identity is read-only. `use(null)` restores the local profile. Same division as `sac.fs.backend`. THE FISHBOWL will use exactly this when it moves onto the kit: standalone (not a desktop app), its own host, Google as the identity provider purely to know *who*, and personal data then fetched from its own DB — see the rule above for the part that must happen server-side.

**`get()` is synchronous by design.** Apps call it while rendering. A host whose answer needs a round trip returns `null` until it knows, then announces via the `onChange` it provided or `sac.identity.changed()`. Apps paint "nobody" first and update — the same pattern as the theme.

**Apps read, the host writes.** `context.identity` is `{ get, onChange }` only. An app that wants a name of its own asks in its own UI and keeps it in its own `context.fs`.

**Anonymous is the default and a valid state.** `get()` returns `null` until somebody fills the profile in. The desktop hides the avatar badge entirely rather than showing an empty one.

**The id is stable and meaningless.** Not a fingerprint, not a secret: it exists so an app can key its own data by "who", and so a real account has something to attach to without changing the shape apps were written against. Renaming keeps the id; `clear()` drops it, because that is "forget me".

**Local storage** rides on the sac.fs backend at `sac.identity/profile`, outside every app drawer. Related: [[context-fs-design-decisions-storage-capability-2026-08-16]].
