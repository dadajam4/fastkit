# @fastkit/eslint-config

## 0.17.0

### Minor Changes

- [`bc06d47`](https://github.com/dadajam4/fastkit/commit/bc06d4726601129763f19c53271169258df3ff89) Thanks [@dadajam4](https://github.com/dadajam4)! - Clean up peer dependencies.

  - Drop the unused `prettier` peer. The config only uses `eslint-config-prettier` (which does not require Prettier to be installed) to turn off formatting rules and does not run Prettier itself, so requiring `prettier` was misleading.
  - Narrow the `eslint` peer from `^8.50.0` to `^9.0.0 || ^10.0.0`. This is a flat-config-only preset (built on typescript-eslint's flat configs and `eslint-plugin-vue` v10) that requires ESLint 9+; ESLint 8 is also end-of-life. Consumers must be on ESLint 9 or 10.

### Patch Changes

- [`dbc6fd1`](https://github.com/dadajam4/fastkit/commit/dbc6fd13195bed3206dbe1f28898ceef47fe2d75) Thanks [@dadajam4](https://github.com/dadajam4)! - Bump dependencies to their latest compatible versions:

  - `@fastkit/eslint-config`: typescript-eslint 8.62.0
  - `@fastkit/vui-wysiwyg`: @tiptap/\* 3.27.1
  - `@fastkit/plugboy`: tsdown / @tsdown/css 0.22.3
  - `@fastkit/plugboy-vue-jsx-plugin`: unplugin-vue-jsx 0.10.0

- [`a738f71`](https://github.com/dadajam4/fastkit/commit/a738f7183415b73c5de85925cbd9550ab83a461a) Thanks [@dadajam4](https://github.com/dadajam4)! - Document the formatting stance and add usage docs; clean up how the Vue config disables formatting.

  Both configs turn off ESLint's formatting rules (via `eslint-config-prettier`) and do **not** run any formatter — pick and run your own on your side (Prettier via CLI/editor, dprint, Biome, or `eslint-plugin-prettier` if you want to format through ESLint). The READMEs now cover installation, flat-config usage, and this stance.

  Migration: no action needed for most setups. `@fastkit/eslint-config-vue` now disables formatting with `eslint-config-prettier/flat` instead of `@vue/eslint-config-prettier/skip-formatting`. Behavior is unchanged — `eslint-plugin-vue`'s formatting rules are still turned off — but it is no longer Prettier-specific (`skip-formatting` also forced `prettier/prettier` off), and the `@vue/eslint-config-prettier` dependency is dropped in favor of `eslint-config-prettier`.

## 0.16.0

### Minor Changes

- Release accompanying the plugboy bundler migration (tsup → tsdown).

  No API changes are intended for this package. The minor bump exists because the package is rebuilt with the new bundler (tsdown / rolldown), and is published together so any incidental output differences are versioned explicitly.

### Patch Changes

- [`25602cb`](https://github.com/dadajam4/fastkit/commit/25602cbe1493cbeb10456b8b0e7680983d9e2ed7) Thanks [@dadajam4](https://github.com/dadajam4)! - Update dependencies and apply the associated fixes.

## 0.15.1-next.0

### Patch Changes

- Update dependencies and apply the associated fixes.

## 0.15.0

### Minor Changes

- Updated major dependencies.

## 0.14.0

### Minor Changes

- Updated ESLint to v9 and migrated to the flat configuration, making adjustments to the rules accordingly.

## 0.13.8

### Patch Changes

- Dependency updates only.

## 0.13.7

### Patch Changes

- Updated major dependencies.

## 0.13.6

### Patch Changes

- Updated major packages and tightened rules slightly.

## 0.13.5

### Patch Changes

- [#126](https://github.com/dadajam4/fastkit/pull/126) [`48c41ec`](https://github.com/dadajam4/fastkit/commit/48c41ecfe5bea16ce5cd8375829ef1058459a82c) Thanks [@dadajam4](https://github.com/dadajam4)! - Changed the version of Prettier's peer dependencies to v3.

## 0.13.4

### Patch Changes

- [#122](https://github.com/dadajam4/fastkit/pull/122) [`d0c96fa`](https://github.com/dadajam4/fastkit/commit/d0c96faf96b6c91bcb8bc0b1ca9d22fc8ede303e) Thanks [@dadajam4](https://github.com/dadajam4)! - Update major and non-major packages

## 0.13.3

### Patch Changes

- [#120](https://github.com/dadajam4/fastkit/pull/120) [`5b881b9`](https://github.com/dadajam4/fastkit/commit/5b881b94ce1852c12cc3c8f6954564d5235cba4d) Thanks [@dadajam4](https://github.com/dadajam4)! - JSDocs were added and no-console lint improvements were made.

## 0.13.2

### Patch Changes

- [#39](https://github.com/dadajam4/fastkit/pull/39) [`40ee82f`](https://github.com/dadajam4/fastkit/commit/40ee82f4501b88e44ad9b67918df2237298493a0) Thanks [@dadajam4](https://github.com/dadajam4)! - Dependencies have been updated.

## 0.13.1

### Patch Changes

- [#27](https://github.com/dadajam4/fastkit/pull/27) [`ce5299f8`](https://github.com/dadajam4/fastkit/commit/ce5299f895d6ff4b51e5d97253b745e1d3069d9b) Thanks [@dadajam4](https://github.com/dadajam4)! - Fixed Vue template lint not working properly.

## 0.13.0

### Minor Changes

- First Release in Repository Migration.
