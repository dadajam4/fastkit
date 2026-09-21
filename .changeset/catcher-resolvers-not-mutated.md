---
'@fastkit/catcher': patch
---

Fix `build()` rewriting the resolver array it was given.

The native resolver has to run in front, and `build` put it there with `unshift` — on `opts.resolvers` itself, which the caller still holds:

```ts
const resolvers = [apiErrorResolver];

const AppError = build({ resolvers, normalizer: a });
const HttpError = build({ resolvers, normalizer: b });

resolvers; // [nativeErrorResolver, apiErrorResolver] — never put there
```

A shared `const resolvers` is the natural thing to write once an application has two catchers, and the array came back with a resolver in it that was never added. The `includes` guard stopped the double insert but not the rewrite.

`build` now copies the list. A list that already names `nativeErrorResolver` is still taken as given, since its position decides which resolvers see `nativeError` in `ctx.resolvedData`.
