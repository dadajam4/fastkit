---
'@fastkit/icon-font-gen': minor
---

Remove the `src: '@mdi'` sentinel, and with it the build-time `pnpm add`.

`src: '@mdi'` meant "find `@mdi/svg`, and install it if it is not there" — `installPackage('@mdi/svg', { dev: true })`, i.e. a package manager invocation in the middle of a build. Wherever the build is not also the place dependencies are managed, that is a bad bargain: in a container image built with `--prod`, where the devDependency had been pruned, it failed with `ERR_PNPM_INCLUDED_DEPS_CONFLICT` rather than anything a reader could act on.

`@fastkit/vui` now ships a Material Design Icons webfont it generated at its own build time, so nothing has to build one at a consumer's, and this package has no reason to know that `@mdi/svg` exists. `src` is a directory of SVG files, with no special cases.

Passing `'@mdi'` is now an error naming the replacement, rather than being left to fail on its own: an entry whose source directory does not exist is *skipped*, so the old behaviour of this input would have been a silently empty font.

**Migration.** Using `@fastkit/vite-plugin-vui`: drop the entry — the font is already there. Using this generator on its own, install `@mdi/svg` yourself and name its directory:

```diff
-{ src: '@mdi' }
+{ src: './node_modules/@mdi/svg/svg', name: 'mdi', fontHeight: 512, descent: 64 }
```

Those are the metrics the sentinel applied, so the output is unchanged.