---
'@fastkit/vui': minor
---

Own `@fastkit/icon-font`, `@fastkit/color-scheme` and `@fastkit/media-match`, so a project using this kit does not have to declare them.

This package exposes their types in its own public types — icon names on `VIcon`, color scopes across the component surface, media-match keys — 32 references in the published `.d.mts`. The generated code in a consuming project then **augments** those types to replace the placeholders (`IconName`, `ScopeName`, …) with the project's real values.

A module augmentation only applies to the copy of the module it resolves, and the generated tree used to name the three leaf packages directly. Since pnpm places into a project's `node_modules` only what the project itself declares, that made all three a requirement of every project using this kit — three packages to declare, and to keep at versions that deduplicate against the copies this package resolves. A range skew silently produced two copies: the augmentation applied to the one the app could see while this package's own types kept their placeholders, giving a wall of `TS2322: Type '"mdi-check"' is not assignable to type '"__IconName__"'` with nothing wrong at the site it points to.

`@fastkit/vite-plugin-vui` now generates code that names `@fastkit/vui` alone. So the three are held here as `dependencies`, and this package re-exports what the generated code needs. TypeScript resolves an augmentation target through a re-export to the interface it aliases, so `declare module '@fastkit/vui'` still merges into the interfaces `@fastkit/icon-font`, `@fastkit/color-scheme` and `@fastkit/media-match` declare — one copy, resolved by this package, with no version range for a project to get wrong.

**Migration.** Remove them from your project unless you import them yourself:

```sh
pnpm remove @fastkit/icon-font @fastkit/color-scheme @fastkit/media-match
```

Regenerate afterwards (delete `.vui/`, or just run the build) so the generated tree names `@fastkit/vui`. Using `@fastkit/vue-color-scheme` or `@fastkit/vue-media-match` directly, rather than through this kit, still requires their respective peer.
