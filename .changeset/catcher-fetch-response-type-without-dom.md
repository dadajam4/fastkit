---
'@fastkit/catcher': patch
---

Stop `SerializableFetchResponse` from requiring the DOM lib.

`type` was declared as `ResponseType`, a name only `lib.dom.d.ts` publishes as a global. `@types/node` types the same property through `undici-types`, which exports the union as a *module* type and never as a global — so in a Node-only program (`lib: ["esnext"]`, `types: ["node"]`) the declarations failed with `TS2552: Cannot find name 'ResponseType'`, while the `headers: Headers` on the line above resolved fine.

```ts
// before
type: ResponseType;

// after
type: Response['type'];
```

`Response` is a global in both environments, so the property now resolves in either — to `undici-types`' union in Node and to the DOM one in a browser. The six members are the same today, no spec union is restated, and each environment keeps its own definition if they ever diverge. Nothing changes for a consumer who already had the DOM lib.

Fixes #255.
