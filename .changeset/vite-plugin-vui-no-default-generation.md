---
'@fastkit/vite-plugin-vui': minor
---

Stop generating an icon font by default — use the one `@fastkit/vui` now ships.

The default was `iconFont: [{ src: '@mdi' }]`, and `@fastkit/icon-font-gen` treats `"@mdi"` as a sentinel meaning "find or install `@mdi/svg`, then build a font from its 7,447 SVGs". So a project that never customised icons still paid ~31MB of build-time input and 1.7MB of generated output on every clean build — and `findOrInstallMDI()` ran `pnpm add @mdi/svg` mid-build to get there, which fails outright in a `--prod` container image where the devDependency was pruned.

With no `iconFont`, nothing is generated now. `installer.ts` imports the font `@fastkit/vui` ships instead:

```ts
import '@fastkit/vui/icon-font/index.css';
import '@fastkit/vui/icon-font/index.mjs';
```

and `.vui/vui.d.ts` no longer references a generated `icon-font/`. The icon *names* are unchanged — same source set, same `icon-mdi-*` class names — so no project source has to change.

Generation is unchanged where it is asked for. `iconFont: [{ src: './assets/icons' }]` builds those entries exactly as before, and those entries **replace** the shipped font rather than adding to it, so `IconName` ends up being exactly the project's own names with no MDI glyph types for a font it does not load. `{ src: '@mdi' }` still works if you want to keep building the MDI font yourself. `iconFontDefaults` on its own — with no `iconFont` — still means the old default entry with those settings applied: they are font metrics, the shipped font's are fixed, and silently dropping a project's metrics would be worse than doing the build it asked for.

**Migration.** Rebuild. `@fastkit/icon-font-gen` is only needed if you pass `iconFont` (it has always been an optional peer); `@mdi/svg` is needed by nobody unless you use `{ src: '@mdi' }` explicitly.