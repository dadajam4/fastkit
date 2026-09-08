---
'@fastkit/vue-color-scheme': minor
---

Declare `@fastkit/color-scheme` as a peer dependency instead of a dependency.

This package re-exposes `ThemeName`, `PaletteName`, `ScopeName` and `ColorVariant` in its published types, and a project's generated color-scheme info augments `@fastkit/color-scheme` to replace those placeholders with its real scheme. A module augmentation only applies to the copy it resolves, so the project and this package have to resolve the same one; as a `dependency` a version skew silently produced two copies and the customized types were lost.

The README already told you to install `@fastkit/color-scheme` alongside this package; the manifest now says the same thing.
