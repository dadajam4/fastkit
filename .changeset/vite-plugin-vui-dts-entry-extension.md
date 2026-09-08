---
'@fastkit/vite-plugin-vui': patch
---

Generate the declaration entry as `vui.d.ts` again, not `vui.d.mts`.

The plugin writes one file whose only content is `/// <reference path>` lines pointing at the generated color-scheme, icon-font and media-match declarations. It exists to be named in a project's `compilerOptions.types`:

```json
"types": ["./.vui/vui"]
```

That lookup only considers `.d.ts`. The file was renamed to `vui.d.mts` in 0fb7b9f9 (the tsdown migration, #161), along with the package's own sources, so since then a freshly generated tree has had nothing for that entry to resolve and `tsc` fails with:

```
error TS2688: Cannot find type definition file for './.vui/vui'.
```

It went unnoticed because the file left behind by an earlier version keeps satisfying the lookup — including in this repository, where deleting `.vui` and regenerating it is what surfaced this. Any project that generated its tree after upgrading past that release, or cleaned the directory, would have hit it: without the entry the `declare module` augmentations are never loaded, so this is also the difference between typed icon names and the placeholder union.

`vui.d.mts` is no longer written. Nothing could have referenced it through `types`; a project that pointed at it some other way should use `./.vui/vui`.
