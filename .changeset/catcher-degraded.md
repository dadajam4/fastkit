---
'@fastkit/catcher': minor
---

Add `ctx.degraded()`, so a resolver can say what a synchronous entry point cost it.

`from` and `fromAsync` differ in what they can reach, not in what they mean, and picking the wrong one in an async context was silent:

```ts
catch (e) {
  throw AppError.from(e); // no body. No type error, no runtime error.
}
```

The normalizer just saw `bodyRead: false` and fell back to `statusText`. A resolver now reports what it could see and could not take, and the catcher warns once, in development only:

```
[@fastkit/catcher] A resolver could not wait for: response body.
  Use `await AppError.fromAsync(e)` where you can await.
```

It is the resolver that reports this rather than the builder inferring it from the resolver list, so the warning names what was lost instead of guessing that something might have been — and it stays quiet for every exception that resolver never matched. A catcher holding `fetchResponseResolver` says nothing when you wrap a `TypeError` that has no `Response` in it.

Custom resolvers get the same mechanism, which is the point: writing a resolver is how this package is mostly used, and a builder-side inference would have had nothing to offer one.

```ts
if (!ctx.canAwait) {
  ctx.degraded?.('response body');
  return { myError: meta };
}
```

It is a no-op when `ctx.canAwait` is `true`, so it needs no guard of its own. Optional on `ResolverContext` only so that a hand-built context still compiles; a catcher always supplies it.
