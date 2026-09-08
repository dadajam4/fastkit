---
'@fastkit/node-util': patch
---

Resolve `esbuild` from this package rather than from the consumer.

`esbuildRequire()` marks `esbuild` external and writes the resulting CommonJS bundle into the **consumer's** `node_modules/.esbuild-require/`. The bare specifier left in it therefore resolved from the consumer's package at require time, not from `@fastkit/node-util` — so with pnpm's default layout, a consumer that did not declare `esbuild` itself got:

```
Error: Cannot find module 'esbuild'
Require stack:
- <pkg>/node_modules/.esbuild-require/<flattened path>/index.js
- <root>/node_modules/.pnpm/@fastkit+node-util@…/node_modules/@fastkit/node-util/dist/node-util.mjs
```

`@fastkit/node-util` already depends on `esbuild`, so the requirement should never have reached the consumer. It also could not be satisfied honestly: the consumer had to pick a version, and any mismatch meant one esbuild produced the bundle while another executed it.

The specifier is now resolved to the absolute path of the esbuild this package itself uses, so the emitted bundle carries no bare `esbuild` and the two are always the same copy. Resolution happens only when an entry point actually imports esbuild, so nothing changes for one that does not.

A project that added `esbuild` to a package's `devDependencies` purely to satisfy this — the reporter had to do so in five of them, none of which imports esbuild — can drop it, along with any range pinned to match `@fastkit/node-util`.
