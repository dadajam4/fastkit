# @fastkit/plugboy

## 1.4.1

### Patch Changes

- [#182](https://github.com/dadajam4/fastkit/pull/182) [`6e577af`](https://github.com/dadajam4/fastkit/commit/6e577af928bfaea49499e760655532d2a636d5b1) Thanks [@dadajam4](https://github.com/dadajam4)! - Keep the build machine's paths out of `?raw` imports.

  The `?raw` loader built its virtual module id from the resolved absolute path (`\0raw:/home/runner/work/acme-ui/acme-ui/packages/core/src/logo.svg`). rolldown normalizes an ordinary module id against the project when it prints the `//#region <id>` comment that precedes each module in the output, but a virtual id — anything starting with `\0` — is printed verbatim, so the id reached the published bundle. Any package with a `?raw` import published the directory layout and the user name of whatever machine built it; reported from a package published out of CI, where the paths read `/home/runner/work/...`.

  The id is now relative to the workspace and resolved back to a path inside `load`. The comment reads `//#region \0raw:src/logo.svg`, and since the id also feeds the chunk's content hash, a chunk carrying a `?raw` module gets a reproducible file name across machines as well.

  `rawLoaderPlugin` becomes `createRawLoaderPlugin(workspace)`, matching the other built-in plugins, since the workspace directory is what the id is relative to. Nothing in this repository imports a `?raw` asset, so no published output changes here.

## 1.4.0

### Minor Changes

- [#180](https://github.com/dadajam4/fastkit/pull/180) [`406f96d`](https://github.com/dadajam4/fastkit/commit/406f96d74bd9ce0fdbfca36a03ef4b83342abfaf) Thanks [@dadajam4](https://github.com/dadajam4)! - Apply `optimizeCSS` to every stylesheet the build writes.

  The optimizations ran in `generateBundle`, over the CSS assets present in the bundle at that moment. tsdown's own CSS pipeline emits from a _post_ plugin, which runs after every user plugin's `generateBundle`, so a stylesheet tsdown produced was never in that set: it silently skipped the layer/media merging and `combineRules`. Only CSS that a plugin emitted itself — `@fastkit/plugboy-sass-plugin`, or the vanilla-extract plugin — was optimized, which is why the gap went unnoticed.

  The pass now runs in `writeBundle`, on the files on disk, where every producer has finished. `preserve-css-imports` re-injects external `@import`s in its own `writeBundle` and is registered later, so they still end up above the optimized rules.

  Every stylesheet this repository publishes is byte-identical after the change, since all of them came from a plugin. A package whose CSS comes only from tsdown (a plain `.css` / `.scss` import, with neither the sass nor the vanilla-extract plugin in play) now gets the optimizations it always declared.

### Patch Changes

- [#180](https://github.com/dadajam4/fastkit/pull/180) [`406f96d`](https://github.com/dadajam4/fastkit/commit/406f96d74bd9ce0fdbfca36a03ef4b83342abfaf) Thanks [@dadajam4](https://github.com/dadajam4)! - Guarantee a stylesheet for every `css: true` entry.

  plugboy declares a `./<entry>.css` export for each such entry, but with more than one of them the file it points at was not always produced. The build emits one stylesheet per output _chunk_ (`css.splitting`), which does not line up with the entries: CSS reached from several entries is moved into a shared chunk and emitted under that chunk's hashed name, which no export points at, and an entry whose CSS comes _only_ from there gets no stylesheet at all — a published export resolving to a missing file. Reported from a downstream package with two CSS entries, one of which re-exports only shared `.css.ts` helpers.

  Each entry's stylesheet is now rebuilt from its own CSS plus the CSS of every chunk it imports, dependencies first, and the leftover per-chunk files are deleted. Shared CSS is duplicated into each entry that needs it, which is what makes a single `./<entry>.css` import complete. Skipped when `css.inject` is on, since the JavaScript then imports the per-chunk stylesheets by name.

  The chunk graph is captured in `generateBundle` because it is gone by the time the stylesheets exist: a chunk holding nothing but CSS is dropped once tsdown's CSS pipeline has emitted its stylesheet, and its importers' `imports` are emptied with it — by `writeBundle` only the orphaned stylesheet is left. For the same reason `optimizeCSS` and `preserve-css-imports` no longer walk the bundle assets alone; they take every stylesheet the build wrote, so an assembled file gets the same treatment as any other.

  A package with a single CSS entry emits one combined stylesheet and is untouched: every stylesheet this repository publishes is byte-identical.

- [#180](https://github.com/dadajam4/fastkit/pull/180) [`406f96d`](https://github.com/dadajam4/fastkit/commit/406f96d74bd9ce0fdbfca36a03ef4b83342abfaf) Thanks [@dadajam4](https://github.com/dadajam4)! - Preserve the authored `@layer` order through the CSS transform.

  lightningcss drops a name from an `@layer a, b, c;` statement when a block for that layer follows in the same stylesheet — the block establishes the same order, so the name is redundant. That reasoning holds for a standalone document. It does not hold for a library stylesheet whose statement _also_ orders layers belonging to other packages: once the name is gone, the layer's position is decided by wherever its own block lands relative to those other packages' stylesheets, and the authored order is lost.

  `@fastkit/vui` declares `@layer vui-normalize, vui-color-scheme, vue-disabled-reason, vue-loading, vue-app-layout, vui;`, of which only `vui-normalize` and `vui` have blocks in the file. Both were being pruned, so the published `vui.css` declared four layers instead of six and `vui-normalize` was established _after_ `vui-color-scheme` / `vue-disabled-reason` / `vue-loading` — promoting the reset layer above the packages it is supposed to lose to, which showed up as changed component styling (buttons, among others).

  `preserve-css-imports` now records the layer names of every `@layer a, b;` statement before tsdown's CSS pipeline can prune them, and re-emits them, in their declared order, at the top of each stylesheet in `writeBundle`. Names the emitted stylesheet still declares on its own are appended after them.

  The capture is a `transform` hook declared `order: 'pre'`, which runs ahead of tsdown's CSS handling even though that is registered as a _pre plugin_ — hook order wins over plugin order. It is the only point that sees the CSS of every stylesheet in the graph, including a virtual one another plugin supplies from `load`: vanilla-extract generates its `@layer` statements into such a module, and for a package built entirely from `.css.ts` that generated statement is the only record of the intended order.

  Each stylesheet's declarations are read as a set of "must come before" constraints and merged by topological sort, rather than concatenated with repeats dropped. A name's first appearance is rarely where its order is decided: vanilla-extract re-declares a layer at the top of _every_ stylesheet that puts a rule in it, so a single `@layer that-one;` from some component is seen before the module that declares how all the layers relate — and taking first appearances would let that component decide the layer's position. The sequences are visited in module execution order, which decides which one wins a contradiction and how otherwise-free names are ordered.

  This regressed when a build `target` was first declared: before that, lightningcss transformed nothing at all (`@tsdown/css` returns early with no target, no `lightningcss` options and no minification), so the statement survived untouched.

  `vui.css` grows by the 20 bytes of the two restored names; its rules are unchanged.

## 1.3.0

### Minor Changes

- [#178](https://github.com/dadajam4/fastkit/pull/178) [`b1feb84`](https://github.com/dadajam4/fastkit/commit/b1feb84f16f5a03c105f85f38cc246fc35561861) Thanks [@dadajam4](https://github.com/dadajam4)! - Accept tsdown's `css` option in the workspace and project configurations.

  `WorkspaceSetupContext.css` already existed, but only as an internal channel for plugins to seed — it was absent from `UserWorkspaceConfig` / `UserProjectConfig`, so consumers could not influence how stylesheets are processed or emitted (file name, preprocessor options, CSS modules, syntax lowering).

  `css` can now be declared in `plugboy.workspace.ts` and `plugboy.project.ts`; the workspace value is shallow-merged over the project one, since the keys are independent. `WorkspaceSetupContext.css` is seeded from that merged value, and plugins are now expected to merge their defaults _under_ it so a configured value always wins.

  `@fastkit/plugboy-vanilla-extract-plugin` follows that rule: it now merges `splitting` / `fileName` instead of assigning them. Its CSS merge depends on both, so its README documents that consumers should leave those two keys to the plugin — every other `css` option is free to use. Builds that set no `css` option are unaffected.

- [#178](https://github.com/dadajam4/fastkit/pull/178) [`b1feb84`](https://github.com/dadajam4/fastkit/commit/b1feb84f16f5a03c105f85f38cc246fc35561861) Thanks [@dadajam4](https://github.com/dadajam4)! - Accept tsdown's `target` option in the workspace and project configurations.

  plugboy forwarded only a fixed subset of tsdown options (`define`, `deps`, `copy`, …), and `target` was not among them, so consumers had no way to control which JavaScript syntax the output is downleveled for. tsdown then fell back to its own default — the package's `engines.node` field — and applied no transformation at all when that field was absent, which is the case for most packages.

  `target` can now be declared in `plugboy.workspace.ts`, or in `plugboy.project.ts` to apply one target to every workspace. A workspace value replaces the project value outright rather than merging, since a target list describes a single environment set; `false` (tsdown's "apply no transformation") is preserved as an explicit workspace-level opt-out.

## 1.2.2

### Patch Changes

- [#175](https://github.com/dadajam4/fastkit/pull/175) [`05d8bb4`](https://github.com/dadajam4/fastkit/commit/05d8bb4385811b677e323d2137a6d0e8a65186c5) Thanks [@dadajam4](https://github.com/dadajam4)! - Update `execa` from 9.x to 10.x.

  No code changes were needed. Every call site uses the plain `execa(file, args, options)` form and only awaits the result or reads `stdout` / `stderr`, so none of execa 10's removals apply — `execaCommand()` / `execaCommandSync()`, the `stdio: [..., 'ipc']` syntax, and the `ChildProcess` methods that moved behind `subprocess.nodeChildProcess` are all unused, as is the `input` / `inputFile` behaviour change.

  Both packages are bumped together so a single execa major is installed rather than two side by side.

- [#175](https://github.com/dadajam4/fastkit/pull/175) [`05d8bb4`](https://github.com/dadajam4/fastkit/commit/05d8bb4385811b677e323d2137a6d0e8a65186c5) Thanks [@dadajam4](https://github.com/dadajam4)! - Update `magic-string` from 0.30.x to 1.1.0.

  No code changes were needed. magic-string 1.0.0 is a pure-ESM release — the CJS, UMD and IIFE builds were dropped and the type declarations are now generated from its TypeScript source — but the API is unchanged and `MagicString` is still exported as the default. Both packages already ship ESM only, so nothing about how they are consumed changes.

  Only append-style operations are used here (`appendLeft` in plugboy's env plugin, `append` in vue-tiny-meta's Vite plugin, both followed by `toString()` and `generateMap({ hires: true })`), so the 1.x fixes around replacement trimming and zero-length range moves do not apply. Emitted code and source maps were compared between 0.30.21 and 1.1.0 for both call shapes and are identical.

  Both packages are bumped together so a single magic-string major is installed rather than two side by side.

- [#175](https://github.com/dadajam4/fastkit/pull/175) [`05d8bb4`](https://github.com/dadajam4/fastkit/commit/05d8bb4385811b677e323d2137a6d0e8a65186c5) Thanks [@dadajam4](https://github.com/dadajam4)! - Generate a stable entry order in `exposeEntries()`.

  `glob` makes no ordering guarantee, and the insertion order of the entries `exposeEntries()` builds becomes the key order of the generated `exports` and `typesVersions`. The result was that building the same sources rewrote the workspace's `package.json` on an arbitrary subset of builds — over seven runs of this repo it flipped back and forth between two orderings, leaving a dirty working tree roughly every other build. The glob result is now sorted, so the generated key order is fixed.

  `@fastkit/vui-wysiwyg` is the only workspace using `exposeEntries()`; its `package.json` is committed in the new sorted order and no longer changes when it is rebuilt.

## 1.2.1

### Patch Changes

- [#173](https://github.com/dadajam4/fastkit/pull/173) [`4ab4bbf`](https://github.com/dadajam4/fastkit/commit/4ab4bbffc98f94834fa499aa2389c47592e1fc34) Thanks [@dadajam4](https://github.com/dadajam4)! - Fix the Vite-compatible ambient module declarations in `@fastkit/plugboy/env` being inert on the consumer side. The trailing `export {}` made `env.d.ts` a module, and top-level wildcard `declare module '*.svg'` / `*?raw` / CSS declarations in a module file are not registered as global ambient modules — so importing an asset, a `?raw` file, or CSS still failed to type-check (`TS2307` / `TS2882`) even after referencing `@fastkit/plugboy/env`. The file is now a script (plain top-level `declare const` / `declare module`, no trailing `export {}`), so both the `__PLUGBOY_DEV__` / `__PLUGBOY_STUB__` constants and the module declarations apply globally. Fixes [#172](https://github.com/dadajam4/fastkit/issues/172).

## 1.2.0

### Minor Changes

- [#170](https://github.com/dadajam4/fastkit/pull/170) [`fbb2897`](https://github.com/dadajam4/fastkit/commit/fbb28977f7eb6eb70280d29abb31440abb7c8084) Thanks [@dadajam4](https://github.com/dadajam4)! - Add Vite-compatible ambient module types to the `@fastkit/plugboy/env` subpath. Referencing it (already required for the `__PLUGBOY_DEV__` / `__PLUGBOY_STUB__` constants) now also types the non-JS imports plugboy can bundle, mirroring a subset of Vite's `vite/client` types so source written for Vite/tsdown type-checks the same way: static assets (images, media, fonts, `.webmanifest`, `.pdf`, `.txt`, …) as a `string` default export, CSS side-effect imports and CSS Modules, and `?raw` as a `string`. Vite-only features without a plugboy loader (`?url` / `?inline`, `?worker` / `?sharedworker`, `*.wasm?init`, `vite/modulepreload-polyfill`, `vite:preloadError`) are intentionally omitted so the types never imply unsupported behavior.

## 1.1.0

### Minor Changes

- [#167](https://github.com/dadajam4/fastkit/pull/167) [`edd4249`](https://github.com/dadajam4/fastkit/commit/edd4249e45ebdf39e6f3563a60c1b1c08aef8ea7) Thanks [@dadajam4](https://github.com/dadajam4)! - Declare `typescript` as a peer dependency (`^6.0.0 || ^7.0.0`). Both packages use the TypeScript compiler API and/or expose its types in their published `.d.ts`, so declaring it lets them resolve correctly in an isolated install instead of relying on the dependency being hoisted.

## 1.0.2

### Patch Changes

- [#164](https://github.com/dadajam4/fastkit/pull/164) [`50d4e2b`](https://github.com/dadajam4/fastkit/commit/50d4e2bc805978ca8d14f475ccb07b372f2a9be5) Thanks [@dadajam4](https://github.com/dadajam4)! - Silence two classes of spurious build warnings so real issues stand out.

  - **Self-reference / `deps.neverBundle` imports (`UNRESOLVED_IMPORT`):** imports of the package's own name (e.g. `my-pkg/assets/logo.svg`, resolved at runtime via the `exports` map) and subpaths of packages listed in `deps.neverBundle` are now resolved as explicit externals up front, so rolldown no longer emits `UNRESOLVED_IMPORT` for them. Genuinely unresolved specifiers (typos) still warn, and build output is unchanged.
  - **Empty declaration chunks (`SOURCEMAP_BROKEN`):** `rolldown-plugin-dts`'s fake-js pass returns a source-map-less string for empty `.d.ts` chunks (e.g. an entry composed solely of external re-exports), which made rolldown emit a spurious `SOURCEMAP_BROKEN` warning. This warning is now filtered — but only when attributed to `rolldown-plugin-dts:fake-js`; genuine JS-chunk sourcemap breakage still warns. The suppression is traceable at debug log level. This is a workaround for an upstream `rolldown-plugin-dts` bug and is documented for removal once fixed upstream.

## 1.0.1

### Patch Changes

- [`dbc6fd1`](https://github.com/dadajam4/fastkit/commit/dbc6fd13195bed3206dbe1f28898ceef47fe2d75) Thanks [@dadajam4](https://github.com/dadajam4)! - Bump dependencies to their latest compatible versions:

  - `@fastkit/eslint-config`: typescript-eslint 8.62.0
  - `@fastkit/vui-wysiwyg`: @tiptap/\* 3.27.1
  - `@fastkit/plugboy`: tsdown / @tsdown/css 0.22.3
  - `@fastkit/plugboy-vue-jsx-plugin`: unplugin-vue-jsx 0.10.0

- [`40fae8a`](https://github.com/dadajam4/fastkit/commit/40fae8a9bad88289fb96bffa80dd5632799777fd) Thanks [@dadajam4](https://github.com/dadajam4)! - Write the temporary bundled config file into `<configDir>/node_modules/.plugboy/` instead of next to the config.

  When loading `plugboy.project.*` / `plugboy.workspace.*`, `bundle-require` bundles the config to a throwaway `.mjs` before importing it. By default that landed in the repo/package root (e.g. `plugboy.project.bundled_<id>.mjs`), which is noisy and can be left behind if the build is force-killed. It now goes under the config's own `node_modules/.plugboy/` — already gitignored and out of sight — while module resolution is unchanged (Node still walks up to the same `node_modules`).

- [`d63b1af`](https://github.com/dadajam4/fastkit/commit/d63b1af8bf1bb131590ff540af82428cc60aeb7e) Thanks [@dadajam4](https://github.com/dadajam4)! - Strip the dangling `//# sourceMappingURL=*.d.mts.map` comment from emitted declaration files.

  tsdown (rolldown) appends this comment to every `.d.(m)ts` it emits but does not emit the referenced declaration map, so consumers' editors/build tools fail to resolve it. plugboy now removes the comment during build — but only when the referenced map is genuinely absent, so it becomes a no-op automatically if a future tsdown starts emitting real declaration maps.

  Every package in this monorepo is built by plugboy, so this patch re-publishes them all with declaration files that no longer point at a missing map.

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
