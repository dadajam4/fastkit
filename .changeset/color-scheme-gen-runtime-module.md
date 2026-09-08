---
'@fastkit/color-scheme-gen': minor
---

Add `runtimeModule`, and re-export the whole color-scheme authoring API.

**`runtimeModule`.** The generated info file imported `ColorSchemeInfo` from — and augmented `ThemeSettings` / `PaletteSettings` / `ScopeSettings` / `ColorVariantSettings` in — `@fastkit/color-scheme` by a hard-coded name. That file lands in the *consuming* project, so the specifier resolves from there, and pnpm places into a project's `node_modules` only what the project itself declares. Naming the leaf package therefore forced every project to declare `@fastkit/color-scheme` as well.

```ts
new LoadColorSchemeRunner({ entry, dest, runtimeModule: '@acme/ui' });
```

The module it names has to re-export the four `*Settings` interfaces and `ColorSchemeInfo`. Module augmentation follows a re-export to the interface it aliases, so the settings still merge into the ones `@fastkit/color-scheme` declares and `ThemeName`, `PaletteName`, `ScopeName` and `ColorVariant` agree everywhere.

The default is unchanged (`@fastkit/color-scheme`), so standalone use emits exactly what it did before.

**`export * from '@fastkit/color-scheme'`.** Only `createSimpleColorScheme` was reachable from here, so writing a fully custom scheme meant importing `createColorScheme` and the source types from `@fastkit/color-scheme` directly — a second package to declare for something this one exists to do. The authoring API is now re-exported in full, so a project's scheme definition needs nothing but this package, as a `devDependency`.

`@fastkit/color-scheme` stays a real `dependency`: unlike the icon-font and media-match generators, this package genuinely imports it, and now re-exports it deliberately rather than exposing its types by accident.
