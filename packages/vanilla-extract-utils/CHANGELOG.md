# @fastkit/vanilla-extract-utils

## 1.0.1

### Patch Changes

- [`d63b1af`](https://github.com/dadajam4/fastkit/commit/d63b1af8bf1bb131590ff540af82428cc60aeb7e) Thanks [@dadajam4](https://github.com/dadajam4)! - Strip the dangling `//# sourceMappingURL=*.d.mts.map` comment from emitted declaration files.

  tsdown (rolldown) appends this comment to every `.d.(m)ts` it emits but does not emit the referenced declaration map, so consumers' editors/build tools fail to resolve it. plugboy now removes the comment during build — but only when the referenced map is genuinely absent, so it becomes a no-op automatically if a future tsdown starts emitting real declaration maps.

  Every package in this monorepo is built by plugboy, so this patch re-publishes them all with declaration files that no longer point at a missing map.

## 1.0.0

### Major Changes

- [`7f48999`](https://github.com/dadajam4/fastkit/commit/7f4899920b42da8098f3596031d7255b3ce59d42) Thanks [@dadajam4](https://github.com/dadajam4)! - Extract the vanilla-extract authoring helpers into a new `@fastkit/vanilla-extract-utils` package.

  `defineLayerStyle`, `createGlobalTheme` and the related layer/theme utilities were previously exported from `@fastkit/plugboy-vanilla-extract-plugin/css`. They are bundler-agnostic (they only wrap `@vanilla-extract/css`) and have nothing to do with the plugboy build pipeline, so they now live in their own package.

  - **New `@fastkit/vanilla-extract-utils`** — provides `defineLayerStyle` etc. Declares `@vanilla-extract/css` as a **peer dependency** so it resolves to the consumer's single instance (vanilla-extract requires a singleton).
  - **Breaking (`@fastkit/plugboy-vanilla-extract-plugin`)** — the `./css` subpath export is removed, and the package no longer depends on `@vanilla-extract/css`. It is now purely the plugboy build plugin (`@vanilla-extract/rollup-plugin` / `vite-plugin`). Migration: replace `@fastkit/plugboy-vanilla-extract-plugin/css` imports with `@fastkit/vanilla-extract-utils` (and add `@vanilla-extract/css` to your dependencies).

## 0.1.0-next.2

### Minor Changes

- Extract the vanilla-extract authoring helpers into a new `@fastkit/vanilla-extract-utils` package.

  `defineLayerStyle`, `createGlobalTheme` and the related layer/theme utilities were previously exported from `@fastkit/plugboy-vanilla-extract-plugin/css`. They are bundler-agnostic (they only wrap `@vanilla-extract/css`) and have nothing to do with the plugboy build pipeline, so they now live in their own package.

  - **New `@fastkit/vanilla-extract-utils`** — provides `defineLayerStyle` etc. Declares `@vanilla-extract/css` as a **peer dependency** so it resolves to the consumer's single instance (vanilla-extract requires a singleton).
  - **Breaking (`@fastkit/plugboy-vanilla-extract-plugin`)** — the `./css` subpath export is removed, and the package no longer depends on `@vanilla-extract/css`. It is now purely the plugboy build plugin (`@vanilla-extract/rollup-plugin` / `vite-plugin`). Migration: replace `@fastkit/plugboy-vanilla-extract-plugin/css` imports with `@fastkit/vanilla-extract-utils` (and add `@vanilla-extract/css` to your dependencies).
