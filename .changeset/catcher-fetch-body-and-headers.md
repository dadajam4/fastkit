---
'@fastkit/catcher': minor
---

Fix `fetchResponseResolver`: stop the unhandled rejection, leave the caller their body, and make `headers` serializable.

The resolver read the same body twice:

```ts
response.json().then((json) => { fetchResponse.json = json; });
response.text().then((text) => { fetchResponse.text = text; });
```

A body can only be read once, so the second call rejected with `TypeError: Body is unusable` — every time, with no `catch`. An unhandled rejection terminates a Node process by default, so a resolver whose whole job is to make an error reportable could take the process down instead. It also left the application's own `response` drained: the code that threw could no longer read what it had fetched.

The body is now read once, from `response.clone()`, and only when the resolver may await (see `fromAsync`). `json` is derived from that text, `response.bodyUsed` stays `false`, and a body that is already consumed, locked, or fails mid-read degrades to `''` / `null` instead of throwing — a resolver runs while an error is being described and must not replace it with one of its own.

**`headers` is now `Record<string, string>` rather than `Headers`.** The type is named for being JSON-serializable and `headers` was the one field that was not: `JSON.stringify(new Headers({...}))` is `{}`, so the headers silently vanished from any serialized error. Repeated header names are combined with `, `, the same way `Headers.get()` combines them — `Object.fromEntries(headers.entries())` would have kept only the last `set-cookie`.

```diff
- Object.fromEntries(fetchError.response.headers.entries())
+ fetchError.response.headers
```

This does not change what leaves your process. Resolver output is not serialized — `toJSON()` emits what the *normalizer* returns — so the response reaching the normalizer in full is by design, and what you copy out of it is your decision. The README now says so, and says which fields are worth thinking twice about: `set-cookie` (a 401 is exactly when session and refresh tokens get rotated), a `url` that may carry a signed-URL signature, and a body that may hold more than the message you were after. The previous example spread all of them into the normalizer's return value.
