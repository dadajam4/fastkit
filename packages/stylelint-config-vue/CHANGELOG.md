# @fastkit/stylelint-config-vue

## 0.4.2

### Patch Changes

- [#213](https://github.com/dadajam4/fastkit/pull/213) [`02ed660`](https://github.com/dadajam4/fastkit/commit/02ed660f4e06be90dceb2664d341d67f1136fe6e) Thanks [@dadajam4](https://github.com/dadajam4)! - Declare `engines.node` on the packages that run in Node

  None of these packages said which Node they needed, so a project on an older
  Node installed cleanly and failed later. `@fastkit/node-util` reaches
  `execa@10` (`engines: >=22`), and nothing in the chain up through
  `@fastkit/vite-plugin-vui` declared anything, so Node 20 builds died with:

  ```
  TypeError: TEXT_ENCODINGS.union is not a function
      at .../execa/lib/arguments/encoding-option.js:20
  ```

  `Set.prototype.union` is Node 22+ and `execa` calls it at import time. The
  failure surfaced only during the build and vui's generation step -- `tsc` and
  the tests passed -- so it showed up in CI and container images while a
  developer on a newer Node saw everything green.

  Each package now declares the highest floor its own shipped dependencies
  impose, so `npm`/`pnpm` report an unsupported engine at install time and
  `engine-strict` fails outright:

  | Floor       | Packages                                                                                                                                  |
  | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
  | `>=24.14.0` | `icon-font-gen`, `vite-kit`, `vite-plugin-vui` (`webfont@12.5.0`)                                                                         |
  | `>=22.18.0` | `plugboy` and its four plugins (`@tsdown/css`, `unplugin-vue-jsx`)                                                                        |
  | `>=22.12.0` | `stylelint-config-vue` (`postcss-html`)                                                                                                   |
  | `>=22.0.0`  | `node-util`, `nodepack`, `color-scheme-gen`, `media-match-gen`, `vui` (`execa@10`); `cookies`, `vue-page`, `vot`, `vot-i18n` (`cookie@2`) |
  | `>=20.19.0` | `eslint-config`, `eslint-config-vue`, `stylelint-config`, `sprite-images`, `ts-tiny-meta`, `vue-tiny-meta`                                |
  | `>=18.0.0`  | `hashed-sync` (`imagemin`)                                                                                                                |

  Note that `@fastkit/vite-plugin-vui` requires **Node 24.14**, not 22: its
  `webfont` dependency does. Nothing here changes what any package needs at run
  time -- these floors were already in force, just undeclared.

  Browser-only packages are left alone even where a transitive dependency has a
  floor: `@fastkit/vui-wysiwyg` inherits one from `@fastkit/vui`, but runs no
  Node code of its own. Optional peers do not contribute a floor, since they are
  reachable only through an opt-in subpath.

  `pnpm audit:deps` now recomputes every floor and fails when a declaration is
  missing or undershoots, so a future dependency bump cannot quietly reintroduce
  the gap. The policy is written up in `docs/dependency-management.md`.

- Updated dependencies [[`02ed660`](https://github.com/dadajam4/fastkit/commit/02ed660f4e06be90dceb2664d341d67f1136fe6e)]:
  - @fastkit/stylelint-config@0.17.2

## 0.4.1

### Patch Changes

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

- Updated dependencies [[`b83afba`](https://github.com/dadajam4/fastkit/commit/b83afba29c3d2e2d489c8468b4d517de62c39d4c), [`b83afba`](https://github.com/dadajam4/fastkit/commit/b83afba29c3d2e2d489c8468b4d517de62c39d4c), [`b83afba`](https://github.com/dadajam4/fastkit/commit/b83afba29c3d2e2d489c8468b4d517de62c39d4c)]:
  - @fastkit/stylelint-config@0.17.1

## 0.4.0

### Minor Changes

- Release accompanying the plugboy bundler migration (tsup → tsdown).

  No API changes are intended for this package. The minor bump exists because the package is rebuilt with the new bundler (tsdown / rolldown), and is published together so any incidental output differences are versioned explicitly.

### Patch Changes

- [`25602cb`](https://github.com/dadajam4/fastkit/commit/25602cbe1493cbeb10456b8b0e7680983d9e2ed7) Thanks [@dadajam4](https://github.com/dadajam4)! - Update dependencies and apply the associated fixes.

- Updated dependencies [[`25602cb`](https://github.com/dadajam4/fastkit/commit/25602cbe1493cbeb10456b8b0e7680983d9e2ed7)]:
  - @fastkit/stylelint-config@0.17.0

## 0.3.1-next.0

### Patch Changes

- Update dependencies and apply the associated fixes.

- Updated dependencies []:
  - @fastkit/stylelint-config@0.16.1-next.0

## 0.3.0

### Patch Changes

- Updated dependencies []:
  - @fastkit/stylelint-config@0.16.0

## 0.2.0

### Minor Changes

- Changed the export file extensions to `.mjs` and made some adjustments to several rules.

### Patch Changes

- Updated dependencies []:
  - @fastkit/stylelint-config@0.15.0

## 0.1.0

### Minor Changes

- Updated major dependencies.

### Patch Changes

- Updated dependencies []:
  - @fastkit/stylelint-config@0.14.0

## 0.0.7

### Patch Changes

- Updated dependencies []:
  - @fastkit/stylelint-config@0.13.10

## 0.0.6

### Patch Changes

- Updated dependencies []:
  - @fastkit/stylelint-config@0.13.9

## 0.0.5

### Patch Changes

- Updated dependencies []:
  - @fastkit/stylelint-config@0.13.8

## 0.0.4

### Patch Changes

- Updated dependencies []:
  - @fastkit/stylelint-config@0.13.7

## 0.0.3

### Patch Changes

- Updated Stylelint peer dependency to v16 and updated major dependencies.

- Updated dependencies []:
  - @fastkit/stylelint-config@0.13.6

## 0.0.2

### Patch Changes

- [#122](https://github.com/dadajam4/fastkit/pull/122) [`d0c96fa`](https://github.com/dadajam4/fastkit/commit/d0c96faf96b6c91bcb8bc0b1ca9d22fc8ede303e) Thanks [@dadajam4](https://github.com/dadajam4)! - Update major and non-major packages

- Updated dependencies [[`d0c96fa`](https://github.com/dadajam4/fastkit/commit/d0c96faf96b6c91bcb8bc0b1ca9d22fc8ede303e)]:
  - @fastkit/stylelint-config@0.13.5

## 0.0.1

### Patch Changes

- [#114](https://github.com/dadajam4/fastkit/pull/114) [`bfcaa9e`](https://github.com/dadajam4/fastkit/commit/bfcaa9e05cce7e60b2826847f4c710313b626d56) Thanks [@dadajam4](https://github.com/dadajam4)! - first release

- Updated dependencies [[`bfcaa9e`](https://github.com/dadajam4/fastkit/commit/bfcaa9e05cce7e60b2826847f4c710313b626d56)]:
  - @fastkit/stylelint-config@0.13.4
