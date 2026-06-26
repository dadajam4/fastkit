# @fastkit/plugboy

## 1.0.0

### Major Changes

- Major release: the plugboy toolchain migrates its internal bundler from **tsup (esbuild)** to **tsdown (rolldown)**.

  This is a large change that affects the workspace config schema, the plugin-authoring API, and several output details. See the migration guide for what changed and the steps to upgrade:

  https://github.com/dadajam4/fastkit/blob/main/packages/plugboy/docs/migrations/v1.md

- [`b824e71`](https://github.com/dadajam4/fastkit/commit/b824e7136b57649d7958e257c21e8704267380e6) Thanks [@dadajam4](https://github.com/dadajam4)! - Changed the bundler from tsup to tsdown.

  This release includes the following breaking changes:

  - Plugin system changed from esbuild-based to rolldown-based
  - `onSuccess` hook has been removed
  - `publicDir` option has been removed

  New features:

  - Plugboy plugins are now compatible with tsdown (rolldown) plugins
  - vue-tsc can now be used as the DTS compiler (`dts.compiler: 'vue-tsc'`)
  - Added `dts.ignoreCompilerErrors` option
  - Added `@fastkit/plugboy/runtime-utils` export for runtime utilities

  ### Migration Guide
  - If using `esbuildPlugins`, replace with rolldown-compatible plugins
  - If using `onSuccess` hook, use the `onSuccess` option in workspace config instead
  - If using `publicDir`, use the `copy` option instead

### Patch Changes

- [`7b655c1`](https://github.com/dadajam4/fastkit/commit/7b655c1513ccc9fec99ea66fb0db396dc831f5c7) Thanks [@dadajam4](https://github.com/dadajam4)! - Fix CSS regressions from the tsdown migration

  `@fastkit/plugboy`:

  - Repair the `preserve-css-imports` plugin so external (bare-specifier) `@import`s
    — e.g. `@import url('material-symbols/rounded.css') layer(...)` — are kept
    verbatim instead of being inlined by tsdown's lightningcss, which bloated the
    bundle and broke the imported package's relative asset URLs (fonts). The
    statements are now stripped in a `load` hook (which runs before the CSS
    transform that previously inlined them) and re-emitted in `writeBundle`, just
    below a hoisted `@layer` order declaration so cascade ordering is preserved.

  `@fastkit/plugboy-vanilla-extract-plugin`:

  - Resolve a `FILE_NAME_CONFLICT` where tsdown's built-in CSS pipeline and
    `@vanilla-extract/rollup-plugin` both emitted `<pkg>.css`, silently dropping
    all extracted component styles. tsdown's CSS is now routed to a temporary file
    and merged into the vanilla-extract bundle in `writeBundle`, so the package
    again ships a single `<pkg>.css`. This only happens when vanilla-extract is
    present, so packages without `.css.ts` keep emitting `<pkg>.css` directly.
  - Remove the unused `prepend` option, which had no effect after the migration to
    `@vanilla-extract/rollup-plugin`.

- [`7e16feb`](https://github.com/dadajam4/fastkit/commit/7e16feb3e45cd6bbf06ac878b8c8e9133f373eb6) Thanks [@dadajam4](https://github.com/dadajam4)! - Support for the tsdown `css` option has been added.

- [`8271c15`](https://github.com/dadajam4/fastkit/commit/8271c15bc79fe7de6ff5df40e8393168df74fe86) Thanks [@dadajam4](https://github.com/dadajam4)! - Improve the type hints shown for `defineWorkspaceConfig` / `defineProjectConfig`.

  Both helpers declared a generic type parameter (`<Config extends UserWorkspaceConfig>` / `<Config extends UserProjectConfig>`) that the return type never used, so it added nothing but noise: on hover the parameter showed up as the opaque `Config`, hiding the field-level types and JSDoc of the underlying config type. The generic is removed and the config is typed directly (`config: UserWorkspaceConfig` / `config: UserProjectConfig`), giving callers a clean signature and proper per-field hints. Behavior is unchanged.

- [`ed9b7b3`](https://github.com/dadajam4/fastkit/commit/ed9b7b3c3cf6ce262c0c5682ba1f1bac047ae98f) Thanks [@dadajam4](https://github.com/dadajam4)! - Document the `__PLUGBOY_DEV__` / `__PLUGBOY_STUB__` build-time env constants and fix their type JSDoc.

  - Correct the `__PLUGBOY_DEV__` global type's `@remarks` to match actual behavior: `true` during `stub`, and in a published `build` it is replaced with a runtime check of the consumer's environment (`NODE_ENV` / `import.meta.env.DEV`) rather than being stub-only.
  - Add an "Env constants" usage guide (`docs/env-constants.md`, with a Japanese version) and a v1 (tsdown) migration guide (`docs/migrations/v1.md`), linked from the README.

- [`3ecc871`](https://github.com/dadajam4/fastkit/commit/3ecc87179bff9cb97096b14e08bf7717f99b077d) Thanks [@dadajam4](https://github.com/dadajam4)! - Add a plugboy-owned `publicDir` workspace option and drop the public `css` option.

  - `publicDir` copies a directory (default `./public`, `false` to disable, or a custom path) into the output directory. plugboy performs this copy itself, identically in both `build` and `stub`, so dev (`stub`) and release (`build`) stay in sync without relying on tsdown's `copy` (whose `flatten`/`rename`/function form would diverge between the two). tsdown's `copy` still works for build-time-only assets and is documented as not running during `stub`.
  - Remove `css` from the public workspace config (`UserWorkspaceConfig` / `ResolvedWorkspaceConfig`). It was never meaningfully user-settable — CSS plugins (e.g. vanilla-extract) overwrite it — and exposing it conflicted with per-entry CSS handling. It remains as the internal `ctx.css` channel for plugins.

- [`71d8d03`](https://github.com/dadajam4/fastkit/commit/71d8d03ec5351bd296aa9a182f05ca6be3de5c6f) Thanks [@dadajam4](https://github.com/dadajam4)! - A fix has been added to work around an issue where `@import` rules were removed when the imported CSS target was an external module, due to the current behavior of rolldown.

- [`b9640a7`](https://github.com/dadajam4/fastkit/commit/b9640a7e3786b1e75f54df3b184941cea6038672) Thanks [@dadajam4](https://github.com/dadajam4)! - The raw-loader plugin has been integrated via the `?raw` query.

- [#158](https://github.com/dadajam4/fastkit/pull/158) [`ab1fc22`](https://github.com/dadajam4/fastkit/commit/ab1fc228299c2610aaf024ab390e8f5e2ed82a82) Thanks [@schwarz9791](https://github.com/schwarz9791)! - Updated the regular expression in `preserve-css-imports.ts` to support import with layer

- [`25602cb`](https://github.com/dadajam4/fastkit/commit/25602cbe1493cbeb10456b8b0e7680983d9e2ed7) Thanks [@dadajam4](https://github.com/dadajam4)! - Update dependencies and apply the associated fixes.

## 1.0.0-next.9

### Patch Changes

- Document the `__PLUGBOY_DEV__` / `__PLUGBOY_STUB__` build-time env constants and fix their type JSDoc.

  - Correct the `__PLUGBOY_DEV__` global type's `@remarks` to match actual behavior: `true` during `stub`, and in a published `build` it is replaced with a runtime check of the consumer's environment (`NODE_ENV` / `import.meta.env.DEV`) rather than being stub-only.
  - Add an "Env constants" usage guide (`docs/env-constants.md`, with a Japanese version) and a v1 (tsdown) migration guide (`docs/migrations/v1.md`), linked from the README.

## 1.0.0-next.8

### Patch Changes

- Add a plugboy-owned `publicDir` workspace option and drop the public `css` option.

  - `publicDir` copies a directory (default `./public`, `false` to disable, or a custom path) into the output directory. plugboy performs this copy itself, identically in both `build` and `stub`, so dev (`stub`) and release (`build`) stay in sync without relying on tsdown's `copy` (whose `flatten`/`rename`/function form would diverge between the two). tsdown's `copy` still works for build-time-only assets and is documented as not running during `stub`.
  - Remove `css` from the public workspace config (`UserWorkspaceConfig` / `ResolvedWorkspaceConfig`). It was never meaningfully user-settable — CSS plugins (e.g. vanilla-extract) overwrite it — and exposing it conflicted with per-entry CSS handling. It remains as the internal `ctx.css` channel for plugins.

## 1.0.0-next.7

### Patch Changes

- Improve the type hints shown for `defineWorkspaceConfig` / `defineProjectConfig`.

  Both helpers declared a generic type parameter (`<Config extends UserWorkspaceConfig>` / `<Config extends UserProjectConfig>`) that the return type never used, so it added nothing but noise: on hover the parameter showed up as the opaque `Config`, hiding the field-level types and JSDoc of the underlying config type. The generic is removed and the config is typed directly (`config: UserWorkspaceConfig` / `config: UserProjectConfig`), giving callers a clean signature and proper per-field hints. Behavior is unchanged.

## 1.0.0-next.6

### Patch Changes

- Fix CSS regressions from the tsdown migration

  `@fastkit/plugboy`:

  - Repair the `preserve-css-imports` plugin so external (bare-specifier) `@import`s
    — e.g. `@import url('material-symbols/rounded.css') layer(...)` — are kept
    verbatim instead of being inlined by tsdown's lightningcss, which bloated the
    bundle and broke the imported package's relative asset URLs (fonts). The
    statements are now stripped in a `load` hook (which runs before the CSS
    transform that previously inlined them) and re-emitted in `writeBundle`, just
    below a hoisted `@layer` order declaration so cascade ordering is preserved.

  `@fastkit/plugboy-vanilla-extract-plugin`:

  - Resolve a `FILE_NAME_CONFLICT` where tsdown's built-in CSS pipeline and
    `@vanilla-extract/rollup-plugin` both emitted `<pkg>.css`, silently dropping
    all extracted component styles. tsdown's CSS is now routed to a temporary file
    and merged into the vanilla-extract bundle in `writeBundle`, so the package
    again ships a single `<pkg>.css`. This only happens when vanilla-extract is
    present, so packages without `.css.ts` keep emitting `<pkg>.css` directly.
  - Remove the unused `prepend` option, which had no effect after the migration to
    `@vanilla-extract/rollup-plugin`.

## 1.0.0-next.5

### Patch Changes

- Update dependencies and apply the associated fixes.

## 1.0.0-next.4

### Patch Changes

- Updated the regular expression in `preserve-css-imports.ts` to support import with layer

## 1.0.0-next.3

### Patch Changes

- A fix has been added to work around an issue where `@import` rules were removed when the imported CSS target was an external module, due to the current behavior of rolldown.

## 1.0.0-next.2

### Patch Changes

- Support for the tsdown `css` option has been added.

## 1.0.0-next.1

### Patch Changes

- The raw-loader plugin has been integrated via the `?raw` query.

## 1.0.0-next.0

### Major Changes

- Changed the bundler from tsup to tsdown.

  This release includes the following breaking changes:
  - Plugin system changed from esbuild-based to rolldown-based
  - `onSuccess` hook has been removed
  - `publicDir` option has been removed

  New features:
  - Plugboy plugins are now compatible with tsdown (rolldown) plugins
  - vue-tsc can now be used as the DTS compiler (`dts.compiler: 'vue-tsc'`)
  - Added `dts.ignoreCompilerErrors` option
  - Added `@fastkit/plugboy/runtime-utils` export for runtime utilities

  ### Migration Guide
  - If using `esbuildPlugins`, replace with rolldown-compatible plugins
  - If using `onSuccess` hook, use the `onSuccess` option in workspace config instead
  - If using `publicDir`, use the `copy` option instead

## 0.3.0

### Minor Changes

- Updated major dependencies.

  This release also includes the following breaking change:

  Previously, when running a plugboy build, the entries from package.json `peerDependencies` were copied into `devDependencies`. Now, if a version is already specified in `devDependencies`, it will no longer be overwritten.

## 0.2.7

### Patch Changes

- Dependency updates only.

## 0.2.6

### Patch Changes

- Updated dependencies.

## 0.2.5

### Patch Changes

- Updated dependencies.

## 0.2.4

### Patch Changes

- Updated dependencies only.

## 0.2.3

### Patch Changes

- Changed the version specification for dependencies within the workspace to use `"^"` instead of `"*"` when automatically generating. This change aligns with the behavior of installing workspace packages in pnpm.

## 0.2.2

### Patch Changes

- Updated major dependencies.

## 0.2.1

### Patch Changes

- Reverted the removal of the `main` field that was introduced in the previous release and restored support for the old `moduleResolution`.

## 0.2.0

### Minor Changes

- Now adheres to ES Modules and the latest TypeScript standards, and the output for the `main` field and `typesVersions` is no longer generated.

## 0.1.10

### Patch Changes

- Refactored internal implementation due to a review of ESLint rules, with no changes to the specifications.

## 0.1.9

### Patch Changes

- [#122](https://github.com/dadajam4/fastkit/pull/122) [`d0c96fa`](https://github.com/dadajam4/fastkit/commit/d0c96faf96b6c91bcb8bc0b1ca9d22fc8ede303e) Thanks [@dadajam4](https://github.com/dadajam4)! - Update major and non-major packages

## 0.1.8

### Patch Changes

- [#120](https://github.com/dadajam4/fastkit/pull/120) [`5b881b9`](https://github.com/dadajam4/fastkit/commit/5b881b94ce1852c12cc3c8f6954564d5235cba4d) Thanks [@dadajam4](https://github.com/dadajam4)! - JSDocs were added and no-console lint improvements were made.

## 0.1.7

### Patch Changes

- [#91](https://github.com/dadajam4/fastkit/pull/91) [`4a974d2`](https://github.com/dadajam4/fastkit/commit/4a974d2bc85767048abcc4ed8294058d19ebfb0f) Thanks [@dadajam4](https://github.com/dadajam4)! - Fixed failure to retrieve configuration files in projects configured with polyrepo.

  This was due to the `allowMissing` option of the `findConfig` method sometimes not working properly.

## 0.1.6

### Patch Changes

- [#67](https://github.com/dadajam4/fastkit/pull/67) [`93488f2`](https://github.com/dadajam4/fastkit/commit/93488f21251f32ed5d577f854146815bd6307161) Thanks [@dadajam4](https://github.com/dadajam4)! - Added option to optimize CSS.

## 0.1.5

### Patch Changes

- [#39](https://github.com/dadajam4/fastkit/pull/39) [`40ee82f`](https://github.com/dadajam4/fastkit/commit/40ee82f4501b88e44ad9b67918df2237298493a0) Thanks [@dadajam4](https://github.com/dadajam4)! - Dependencies have been updated.

## 0.1.4

### Patch Changes

- [#37](https://github.com/dadajam4/fastkit/pull/37) [`50e81c9`](https://github.com/dadajam4/fastkit/commit/50e81c949e0e99c54ffe227e3274826ed31c04af) Thanks [@dadajam4](https://github.com/dadajam4)! - Output file to determine when stub is executed.
  This allows you to check if a package is stub built and change the behavior of the application.

## 0.1.3

### Patch Changes

- [#33](https://github.com/dadajam4/fastkit/pull/33) [`dc6b10a4`](https://github.com/dadajam4/fastkit/commit/dc6b10a4d3279dd24de1f7f1b5113dcec52b63ad) Thanks [@dadajam4](https://github.com/dadajam4)! - Fixed CSS layer optimization process.

## 0.1.2

### Patch Changes

- [#31](https://github.com/dadajam4/fastkit/pull/31) [`8e04503f`](https://github.com/dadajam4/fastkit/commit/8e04503f7acb585f50ceb482af0128e2263a94f9) Thanks [@dadajam4](https://github.com/dadajam4)! - The output CSS is now optimized using cssnano.

## 0.1.1

### Patch Changes

- [#17](https://github.com/dadajam4/fastkit/pull/17) [`8bbadb71`](https://github.com/dadajam4/fastkit/commit/8bbadb7102edbc2bf89df54268c12be5435d5241) Thanks [@dadajam4](https://github.com/dadajam4)! - Fixed so that absolute paths can be linked in stub commands.

## 0.1.0

### Minor Changes

- First Release in Repository Migration.
