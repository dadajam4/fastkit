---
'@fastkit/vue-color-scheme': minor
---

Re-export `ThemeSettings`, `PaletteSettings`, `ScopeSettings`, `ColorVariantSettings` and `ColorSchemeInfo` from `@fastkit/color-scheme`.

Only the derived names (`ThemeName`, `PaletteName`, `ScopeName`, `ColorVariant`) were re-exported, so the four interfaces they are computed from were not reachable through this package — nor through anything built on it.

That mattered because those interfaces are the augmentation anchors. A project's generated color-scheme definition adds its real theme, palette, scope and variant names to them. TypeScript resolves an augmentation target through a re-export to the interface it aliases, so a kit that re-exports these can be named as the augmentation target itself, and the augmentation still lands on the declarations `@fastkit/color-scheme` owns. Without the re-export, `declare module` against that kit silently creates a *new* interface, the derived names keep their placeholders, and the consumer sees `TS2322: Type '"primary"' is not assignable to type '"__ScopeName__"'` pointing at code that is fine.

`ColorSchemeInfo` is included because the generated info file's own types are written against it.
