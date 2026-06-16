---
'@fastkit/plugboy': patch
'@fastkit/plugboy-vanilla-extract-plugin': patch
---

Fix CSS regressions from the tsdown migration

`@fastkit/plugboy`:

- Repair the `preserve-css-imports` plugin so external (bare-specifier) `@import`s
  — e.g. `@import url('material-symbols/rounded.css') layer(...)` — are kept
  verbatim instead of being inlined by tsdown's lightningcss, which bloated the
  bundle and broke the imported package's relative asset URLs (fonts). The
  statements are now stripped in a `load` hook (which runs before the CSS
  transform that previously inlined them) and re-emitted in `writeBundle`, just
  below a hoisted `@layer` order declaration so cascade ordering is preserved.

`@fastkit/plugboy-vanilla-extract-plugin`:

- Resolve a `FILE_NAME_CONFLICT` where tsdown's built-in CSS pipeline and
  `@vanilla-extract/rollup-plugin` both emitted `<pkg>.css`, silently dropping
  all extracted component styles. tsdown's CSS is now routed to a temporary file
  and merged into the vanilla-extract bundle in `writeBundle`, so the package
  again ships a single `<pkg>.css`. This only happens when vanilla-extract is
  present, so packages without `.css.ts` keep emitting `<pkg>.css` directly.
- Remove the unused `prepend` option, which had no effect after the migration to
  `@vanilla-extract/rollup-plugin`.
