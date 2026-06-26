---
'@fastkit/vanilla-extract-utils': minor
'@fastkit/plugboy-vanilla-extract-plugin': major
---

Extract the vanilla-extract authoring helpers into a new `@fastkit/vanilla-extract-utils` package.

`defineLayerStyle`, `createGlobalTheme` and the related layer/theme utilities were previously exported from `@fastkit/plugboy-vanilla-extract-plugin/css`. They are bundler-agnostic (they only wrap `@vanilla-extract/css`) and have nothing to do with the plugboy build pipeline, so they now live in their own package.

- **New `@fastkit/vanilla-extract-utils`** — provides `defineLayerStyle` etc. Declares `@vanilla-extract/css` as a **peer dependency** so it resolves to the consumer's single instance (vanilla-extract requires a singleton).
- **Breaking (`@fastkit/plugboy-vanilla-extract-plugin`)** — the `./css` subpath export is removed, and the package no longer depends on `@vanilla-extract/css`. It is now purely the plugboy build plugin (`@vanilla-extract/rollup-plugin` / `vite-plugin`). Migration: replace `@fastkit/plugboy-vanilla-extract-plugin/css` imports with `@fastkit/vanilla-extract-utils` (and add `@vanilla-extract/css` to your dependencies).
