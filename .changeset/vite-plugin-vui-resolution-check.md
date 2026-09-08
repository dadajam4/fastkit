---
'@fastkit/vite-plugin-vui': minor
---

Fail with the list when the generated tree's imports cannot be resolved from the project.

`viteVuiPlugin()` now checks, before generating anything, that each package the generated code imports by name — `@fastkit/vui`, `@fastkit/vue-page`, `vue`, `vue-router` — resolves from the directory it generates into, and throws naming the missing ones:

```
[vite-plugin-vui] Cannot resolve `@fastkit/vue-page` from /path/to/app/.vui.

The code this plugin generates there imports them by name, so they have to be
resolvable from your project — a transitive install is not enough, and neither is
an auto-installed peer dependency. Add them to your project:

  pnpm add @fastkit/vue-page
```

Declaring them as peer dependencies documents the requirement, but nothing enforces it: pnpm places only what a project declares into its `node_modules`, and with `auto-install-peers` on (the default) the install is silent. Until now the consequence surfaced far from the cause — the generator and `vite build` both succeed, the `declare module` augmentations in the generated tree resolve nothing, every icon name falls back to its placeholder union, and `tsc` reports hundreds of `TS2322` pointing at the app's own code.

The list is short because the generated tree now names `@fastkit/vui` rather than the three leaf packages behind it.

A project that already declares them sees no change.
