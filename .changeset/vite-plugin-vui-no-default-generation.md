---
'@fastkit/vite-plugin-vui': major
---

Stop generating an icon font by default — use the one `@fastkit/vui` now ships.

The default was `iconFont: [{ src: '@mdi' }]`, and `@fastkit/icon-font-gen` treats `"@mdi"` as a sentinel meaning "find or install `@mdi/svg`, then build a font from its 7,447 SVGs". So a project that never customised icons still paid ~31MB of build-time input and 1.7MB of generated output on every clean build — and `findOrInstallMDI()` ran `pnpm add @mdi/svg` mid-build to get there, which fails outright in a `--prod` container image where the devDependency was pruned.

With no `iconFont`, nothing is generated now. `installer.ts` imports the font `@fastkit/vui` ships instead:

```ts
import '@fastkit/vui/icon-font/index.css';
import '@fastkit/vui/icon-font/index.mjs';
```

and `.vui/vui.d.ts` no longer references a generated `icon-font/`. The icon *names* are unchanged — same source set, same `icon-mdi-*` class names — so no project source has to change.

`iconFont` is now the slot for adding **your own** icons to the kit. `iconFont: [{ src: './assets/icons' }]` builds those entries exactly as before, but they are generated *in addition to* the shipped font rather than instead of it — this kit's own defaults (`menuDown: 'mdi-menu-down'`, `clear: 'mdi-close'`, twenty-odd more) are named in that font, so replacing it would have meant redefining every one of them before anything rendered. `IconName` becomes the union of both, which is exactly what is loaded at runtime.

`{ src: '@mdi' }` no longer exists: `@fastkit/icon-font-gen` has dropped that sentinel, so `@fastkit/vui` is the only package that knows `@mdi/svg` exists. `iconFontDefaults` sets metrics for the entries generated here; the shipped font is built once, by `@fastkit/vui`, with fixed metrics, so with no `iconFont` entries there is nothing for it to apply to.

The default `icons` are now type-checked against the shipped names, rather than cast past `IconName`'s placeholder one field at a time (`'mdi-menu-down' as any`, ×23) and then cast again wholesale. A typo in one of them is a build error here with a `Did you mean …?` suggestion, instead of an icon that silently renders as a blank glyph in every project on the default configuration.

**Migration.** Rebuild. `@fastkit/icon-font-gen` is only needed if you pass `iconFont` (it has always been an optional peer), and `@mdi/svg` is needed by nobody.

Two configurations do change behaviour:

- `iconFont: [{ src: '@mdi' }]` — remove the entry. The font it built is the one now shipped.
- `iconFontDefaults` with no `iconFont` — this used to tune the MDI font's metrics; it now has nothing to apply to. If those metrics mattered, generate the font yourself with an explicit `iconFont` entry.