# @fastkit/stylelint-config

## 0.17.1

### Patch Changes

- [#192](https://github.com/dadajam4/fastkit/pull/192) [`b83afba`](https://github.com/dadajam4/fastkit/commit/b83afba29c3d2e2d489c8468b4d517de62c39d4c) Thanks [@dadajam4](https://github.com/dadajam4)! - Drop the unused `stylelint-config-css-modules` dependency.

  The config has never extended it — nothing in the package, or anywhere in this repository, references it — so it was installed with every consumer for nothing.

  A project that extends `stylelint-config-css-modules` in its own config while relying on this package to install it has to declare it directly now, which is where that dependency belongs.

- [#192](https://github.com/dadajam4/fastkit/pull/192) [`b83afba`](https://github.com/dadajam4/fastkit/commit/b83afba29c3d2e2d489c8468b4d517de62c39d4c) Thanks [@dadajam4](https://github.com/dadajam4)! - Stop extending `stylelint-prettier/recommended`, which the package no longer depends on.

  The `extends` entry was kept when `stylelint-prettier` was dropped from `dependencies` in 0.15.0 (the CJS → ESM change), so every consumer of the shared config failed to load Stylelint at all:

  ```
  ConfigurationError: Could not find "stylelint-prettier/recommended".
  Do you need to install the package or use the "configBasedir" option?
  ```

  `@fastkit/stylelint-config-vue` was equally unusable, since it extends the base config. This repository did not notice because `stylelint-prettier` is a root devDependency here and the root `stylelint.config.mjs` extends `stylelint-prettier/recommended` itself.

  The entry is removed rather than the dependency restored: Prettier is a formatting choice that belongs to the consuming project, and `stylelint-prettier` resolves `prettier` at module load time — declaring it would force Prettier onto every consumer, including those who format with something else. A project that wants the integration adds `stylelint-prettier` and puts `'stylelint-prettier/recommended'` after this config in its own `extends`, which is what this repository already does.

  Nothing else about the config changes, and formatting enforcement in this repository is unaffected.

- [#192](https://github.com/dadajam4/fastkit/pull/192) [`b83afba`](https://github.com/dadajam4/fastkit/commit/b83afba29c3d2e2d489c8468b4d517de62c39d4c) Thanks [@dadajam4](https://github.com/dadajam4)! - Declare `postcss-html` in the package that actually needs it, and upgrade `stylelint-config-recommended-vue` to v2.

  `postcss-html` is a required peer of `stylelint-config-recommended-vue`, which only `@fastkit/stylelint-config-vue` depends on — but it was declared by `@fastkit/stylelint-config`, whose own config never parses HTML or Vue. It resolved for consumers by hoisting, not by declaration, and `pnpm` reported it as a missing peer.

  Moving it alone was not enough. `stylelint-config-recommended-vue@1.6.1` requires `postcss-html@^1` while depending on `stylelint-config-html@>=1.0.0` with no upper bound, so a fresh install pulls `stylelint-config-html@2`, whose own peer is `postcss-html@^2`:

  ```
  └─┬ stylelint-config-recommended-vue 1.6.1
    └─┬ stylelint-config-html 2.0.0
      └── ✕ unmet peer postcss-html@^2.0.0: found 1.8.1
  ```

  `stylelint-config-recommended-vue@2.0.0` moved its configs to peer dependencies, so `@fastkit/stylelint-config-vue` now declares them itself (`postcss-html`, `stylelint-config-html`, `stylelint-config-recommended`, `stylelint-config-recommended-scss`) and the whole graph resolves on v2 with no peer warnings.

  Nothing changes about the rules: v2 only drops support for Stylelint below 14.5 and switches to ESM, and the config Stylelint resolves for a `.vue` file is identical, rule for rule, before and after.

## 0.17.0

### Minor Changes

- Release accompanying the plugboy bundler migration (tsup → tsdown).

  No API changes are intended for this package. The minor bump exists because the package is rebuilt with the new bundler (tsdown / rolldown), and is published together so any incidental output differences are versioned explicitly.

### Patch Changes

- [`25602cb`](https://github.com/dadajam4/fastkit/commit/25602cbe1493cbeb10456b8b0e7680983d9e2ed7) Thanks [@dadajam4](https://github.com/dadajam4)! - Update dependencies and apply the associated fixes.

## 0.16.1-next.0

### Patch Changes

- Update dependencies and apply the associated fixes.

## 0.16.0

### Minor Changes

- Updated major dependencies.

## 0.15.0

### Minor Changes

- Changed the export file extensions to `.mjs` and made some adjustments to several rules.

## 0.14.0

### Minor Changes

- Updated major dependencies.

## 0.13.10

### Patch Changes

- Dependency updates only.

## 0.13.9

### Patch Changes

- Updated dependencies.

## 0.13.8

### Patch Changes

- Updated dependencies only.

## 0.13.7

### Patch Changes

- Updated major dependencies.

## 0.13.6

### Patch Changes

- Updated Stylelint peer dependency to v16 and updated major dependencies.

## 0.13.5

### Patch Changes

- [#122](https://github.com/dadajam4/fastkit/pull/122) [`d0c96fa`](https://github.com/dadajam4/fastkit/commit/d0c96faf96b6c91bcb8bc0b1ca9d22fc8ede303e) Thanks [@dadajam4](https://github.com/dadajam4)! - Update major and non-major packages

## 0.13.4

### Patch Changes

- [#114](https://github.com/dadajam4/fastkit/pull/114) [`bfcaa9e`](https://github.com/dadajam4/fastkit/commit/bfcaa9e05cce7e60b2826847f4c710313b626d56) Thanks [@dadajam4](https://github.com/dadajam4)! - Improved Scss lint.

## 0.13.3

### Patch Changes

- [#39](https://github.com/dadajam4/fastkit/pull/39) [`40ee82f`](https://github.com/dadajam4/fastkit/commit/40ee82f4501b88e44ad9b67918df2237298493a0) Thanks [@dadajam4](https://github.com/dadajam4)! - Dependencies have been updated.

## 0.13.2

### Patch Changes

- [#12](https://github.com/dadajam4/fastkit/pull/12) [`7ea8d4c1`](https://github.com/dadajam4/fastkit/commit/7ea8d4c112f70990887a345e0dd61e9060434bc7) Thanks [@dadajam4](https://github.com/dadajam4)! - No changes have been made to the content. This is a re-release with fixes to the publish settings.

## 0.13.1

### Patch Changes

- [#9](https://github.com/dadajam4/fastkit/pull/9) [`251fdb71`](https://github.com/dadajam4/fastkit/commit/251fdb71feeb489ef06937e13a2e5aeae2234c25) Thanks [@dadajam4](https://github.com/dadajam4)! - Removed deprecated formatter-related rules in Stylelint and fixed warnings.

  [Stylelint v15 migration guide](https://stylelint.io/migration-guide/to-15/#deprecated-stylistic-rules)

## 0.13.0

### Minor Changes

- First Release in Repository Migration.
