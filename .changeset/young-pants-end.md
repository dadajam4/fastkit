---
'@fastkit/plugboy-vanilla-extract-plugin': patch
---

Fix CSS file name conflict that dropped all vanilla-extract component styles

When a package emits CSS from both tsdown's built-in pipeline (plain `.css` /
`.scss`) and `@vanilla-extract/rollup-plugin` (`.css.ts`), both outputs were
pointed at the same `<pkg>.css` file. rolldown reported `FILE_NAME_CONFLICT` and
one output silently overwrote the other, so the extracted component styles were
lost and only the global CSS shipped.

tsdown's CSS is now routed to a temporary file and merged into the
vanilla-extract bundle in `generateBundle`, so the package again ships a single
`<pkg>.css` containing both the global and component styles (global first, to
preserve `@layer` ordering).
