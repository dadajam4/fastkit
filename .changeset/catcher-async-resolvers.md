---
'@fastkit/catcher': minor
---

Add `fromAsync` / `createAsync`, so a resolver can reach for what only a promise can give.

`fetchResponseResolver` wanted the response body and could not have it. A resolver ran inside a synchronous constructor — an instance is an `Error` that has to exist by the time it is thrown — while a `Response` hands out its body through a promise and no other way. It read the body anyway and wrote the result in afterwards, which could never work: the normalizer had already produced `data` by then, so `json` and `text` never reached it. The documented example read `bodyText` / `bodyJson` and always got `''` / `null`.

Resolvers may now return a promise, and two entry points await them before normalizing:

```ts
try {
  await api.getUser(id);
} catch (e) {
  throw await AppError.fromAsync(e);   // the normalizer sees the body
}
```

Nothing else about the model changes: you still hand it an unknown exception and let the resolvers work out what it is. `from` / `create` behave exactly as before. A resolver that needs to await reads the new `ctx.canAwait` and offers what it can synchronously instead — which is what `fetchResponseResolver` now does.

**`SerializableFetchResponse` is a discriminated union.** `bodyRead` says which half you have, so a missing body is no longer indistinguishable from a body that was not JSON:

```ts
const { response } = resolvedData.fetchError;
if (response.bodyRead) {
  response.json; // only in scope here
}
```

`from` gives you `bodyRead: false` with the metadata a `Response` reports synchronously — status, statusText, url, headers, ok, redirected, type. `fromAsync` gives you `bodyRead: true`, plus `json` and `text`.

**Migration.** `json` and `text` are behind the discriminant, so code that read them unconditionally no longer compiles — which is the point: it was reading values that were never populated. Build with `fromAsync` and narrow on `bodyRead`.
