# @fastkit/vanilla-extract-utils

## 1.0.2

### Patch Changes

- [#175](https://github.com/dadajam4/fastkit/pull/175) [`05d8bb4`](https://github.com/dadajam4/fastkit/commit/05d8bb4385811b677e323d2137a6d0e8a65186c5) Thanks [@dadajam4](https://github.com/dadajam4)! - Rebuild with the updated toolchain. No functional changes.

  `tsdown` moved from 0.22.3 to 0.22.14 (and with it rolldown from 1.1.3 to 1.2.0), which changes the emitted output even for packages whose sources are untouched — rolldown hoists some expressions into local bindings, and declaration printing differs in where it wraps lines. Comparing every `dist` file against `main`, built twice per side to filter out the known non-reproducible declaration output, 56 packages differ across 59 `.d.mts`, 26 `.map`, 18 `.mjs` and 1 `.css` file, all of them incidental.

  A few packages here also carry a refreshed dependency range — `fs-extra` 11.4.0, `typescript-eslint` 8.65.0, `eslint-plugin-vue` 10.10.0, `@vanilla-extract/rollup-plugin` 1.5.4. Each stays within the major the previous range already allowed, so resolution does not change for anyone; the declarations are just brought back in line.

  These are published together so the incidental output differences are versioned explicitly, rather than riding along unannounced in whatever release happens to touch these packages next.

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
