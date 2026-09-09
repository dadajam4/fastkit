---
'@fastkit/vui': minor
---

Ship a pre-generated Material Design Icons webfont, so the common case needs no generation.

The runtime only ever needed the *generated* artifacts — a woff2, the CSS mapping class names to code points, and the list of names. It never needed `@mdi/svg`. But because `@fastkit/vite-plugin-vui`'s default entry was the `"@mdi"` sentinel, every project on the stock configuration had to obtain 7,447 SVG files (~31MB) at build time and generate its own copy: 402KB of woff2, 441KB of CSS and a 14,910-line name map, to end up referencing perhaps 140 icons. Worse, `@fastkit/icon-font-gen` reached those SVGs by running `pnpm add @mdi/svg` *during the build*, which fails with `ERR_PNPM_INCLUDED_DEPS_CONFLICT` in a container image built with `--prod`, where the devDependency was pruned.

The font is generated once, here, from a devDependency of this package alone, and published in `dist/icon-font/`:

```ts
import '@fastkit/vui/icon-font/index.css'; // @font-face + the icon classes
import '@fastkit/vui/icon-font/index.mjs'; // registers the names; carries their types
```

`@fastkit/vite-plugin-vui` writes both lines into `.vui/installer.ts`, so nothing changes in a project's own source. The second import is what puts the `IconNameMap` augmentation in the project's program — which is why generation staying opt-in matters: a project that supplies its own SVGs never imports it, and `IconName` remains exactly its own names rather than 7,447 MDI glyphs it does not load.

**Licensing.** The font is Apache-2.0, from `@mdi/svg` by the Pictogrammers icon group, and is declared separately from this package's own MIT license. `dist/icon-font/` carries the full license text (Apache-2.0 §4(a)), upstream's own license file, the modification notice required by §4(b) — SVGs converted to a woff2, glyphs assigned Private Use Area code points, a stylesheet generated — and a trademark note for the brand marks the set includes. `@mdi/svg` ships no `NOTICE` file, so §4(d) does not apply.

**Migration.** None for a project using `@fastkit/vite-plugin-vui`: rebuild and `.vui/icon-font/` is simply no longer generated. You can drop `@mdi/svg` if you had added it yourself, and `@fastkit/icon-font-gen` unless you pass `iconFont`.