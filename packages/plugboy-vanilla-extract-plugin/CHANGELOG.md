# @fastkit/plugboy-vanilla-extract-plugin

## 4.2.1

### Patch Changes

- [#184](https://github.com/dadajam4/fastkit/pull/184) [`b028370`](https://github.com/dadajam4/fastkit/commit/b028370c357f5768d0b54956f4ede03cf1193c68) Thanks [@dadajam4](https://github.com/dadajam4)! - Name the single combined stylesheet after the entry that declares the CSS.

  plugboy publishes a `./<entry>.css` export for every `css: true` entry, normalizing the main entry (`.`) to the package directory name. With exactly one such entry the plugin turns `css.splitting` off, so the whole package collects into one file named by `css.fileName` — which therefore has to be the name plugboy declared.

  That name was derived from whether a `.` entry existed at all, rather than from which entry carries the CSS:

  ```ts
  const cssBaseName = entryIds.includes('.') ? ctx.dir.basename : entryIds[0];
  ```

  The two only agree when `.` is itself the `css: true` entry. A package whose sole CSS entry is a secondary one — say `styles`, alongside a `.` entry with no CSS — emitted `dist/<package>.css` while plugboy declared `./styles.css`, so the published export resolved to a file the build never wrote.

  Nothing fails at build time: `plugboy build` is green, the stylesheet is complete, and only its name is wrong. The breakage surfaces in a consumer, as `ENOENT` on an `@import` of the declared path — or, worse, as silently missing styles.

  The name is now taken from the sole `css: true` entry, normalized the same way plugboy normalizes it. Packages whose `.` entry carries the CSS are unaffected, and so are packages with several CSS entries, where `splitting` names each stylesheet after its own chunk and `assemble-entry-css` reconciles them with the declared exports.

  Every package in this repository declares its CSS on the main entry, so none of them changes shape here; the fix was reported from a downstream package whose `styles` entry carried the CSS. An affected package now emits its stylesheet under the declared name, so a consumer reaching past the package export into a deep `dist/` path has to follow the rename.

## 4.2.0

### Minor Changes

- [#180](https://github.com/dadajam4/fastkit/pull/180) [`406f96d`](https://github.com/dadajam4/fastkit/commit/406f96d74bd9ce0fdbfca36a03ef4b83342abfaf) Thanks [@dadajam4](https://github.com/dadajam4)! - Hand the extracted CSS to tsdown's CSS pipeline, so the `css` options apply to it.

  `@vanilla-extract/rollup-plugin` resolves its virtual stylesheets as **external** modules and, in `extract` mode, emits the collected CSS itself as a bundler asset. Either way tsdown never saw the CSS, so none of the `css` options could reach it: `css.target` in particular, which meant a `.css.ts` writing `userSelect: 'none'` shipped a bare `user-select` — the property Safari ignores without `-webkit-` — while `.scss` in the same repository was prefixed correctly. `css.transformer: 'postcss'` and `css.minify` were equally invisible to it.

  The plugin now resolves the virtual stylesheet as a real module and supplies its content from `load`, the approach `@vanilla-extract/vite-plugin` takes. The extracted CSS is an ordinary `.css` module in the graph, so tsdown owns it: `target`, `transformer` (lightningcss _or_ postcss), `minify` and the preprocessor options all apply, and its pipeline emits the single `css.fileName`. One consequence worth recording: the `?source=` query has to be stripped when resolving, because `@tsdown/css` skips any CSS id carrying a non-`?inline` query — with the query intact the styles are dropped from the output entirely.

  Because there is now one CSS producer instead of two, the machinery built around the old split is gone: the temporary file that avoided a `FILE_NAME_CONFLICT` with tsdown's own output, the on-disk merge in `writeBundle`, the `assetFileNames` override that renamed the emitted asset, and the per-entry re-split driven by `meta.css`. `@vanilla-extract/integration` becomes a direct dependency (it provides the virtual-id helpers, and was already an indirect one).

  The per-entry CSS contract — plugboy declares a `./<entry>.css` export for every entry with `css: true` — is now served by `css.splitting`, which the plugin derives from the number of such entries: one of them keeps `splitting: false` and a single `<package>.css`, several switch to `splitting: true` so tsdown emits one stylesheet per chunk. That second case is measurably better than the old hand-rolled split, which lost an entry's own CSS whenever a `.css.ts` was shared between entries; plugboy now guarantees every `./<entry>.css` exists and is self-contained. No package in this repository declares more than one CSS entry, so none of this affects a published stylesheet today.

  The three packages that use Vanilla Extract ship changed CSS. The change is a normalization, not a restructuring — verified against the previous build: the selector sequence and the at-rule sequence are identical, so cascade order and class names are untouched. The declarations themselves are now normalized the way lightningcss normalizes them everywhere else in the repository (`top/right/bottom/left: 0` → `inset: 0`, `flex: 1 1 100%` → `flex: 100%`, `rgba(0,0,0,.5)` → `#00000080`, `200ms` → `.2s`), and `@layer` declarations lightningcss can prove redundant are dropped. Total size is unchanged (vue-app-layout: 15957 → 15959 bytes).

## 4.1.2

### Patch Changes

- [#178](https://github.com/dadajam4/fastkit/pull/178) [`b1feb84`](https://github.com/dadajam4/fastkit/commit/b1feb84f16f5a03c105f85f38cc246fc35561861) Thanks [@dadajam4](https://github.com/dadajam4)! - Accept tsdown's `css` option in the workspace and project configurations.

  `WorkspaceSetupContext.css` already existed, but only as an internal channel for plugins to seed — it was absent from `UserWorkspaceConfig` / `UserProjectConfig`, so consumers could not influence how stylesheets are processed or emitted (file name, preprocessor options, CSS modules, syntax lowering).

  `css` can now be declared in `plugboy.workspace.ts` and `plugboy.project.ts`; the workspace value is shallow-merged over the project one, since the keys are independent. `WorkspaceSetupContext.css` is seeded from that merged value, and plugins are now expected to merge their defaults _under_ it so a configured value always wins.

  `@fastkit/plugboy-vanilla-extract-plugin` follows that rule: it now merges `splitting` / `fileName` instead of assigning them. Its CSS merge depends on both, so its README documents that consumers should leave those two keys to the plugin — every other `css` option is free to use. Builds that set no `css` option are unaffected.

## 4.1.1

### Patch Changes

- [#175](https://github.com/dadajam4/fastkit/pull/175) [`05d8bb4`](https://github.com/dadajam4/fastkit/commit/05d8bb4385811b677e323d2137a6d0e8a65186c5) Thanks [@dadajam4](https://github.com/dadajam4)! - Rebuild with the updated toolchain. No functional changes.

  `tsdown` moved from 0.22.3 to 0.22.14 (and with it rolldown from 1.1.3 to 1.2.0), which changes the emitted output even for packages whose sources are untouched — rolldown hoists some expressions into local bindings, and declaration printing differs in where it wraps lines. Comparing every `dist` file against `main`, built twice per side to filter out the known non-reproducible declaration output, 56 packages differ across 59 `.d.mts`, 26 `.map`, 18 `.mjs` and 1 `.css` file, all of them incidental.

  A few packages here also carry a refreshed dependency range — `fs-extra` 11.4.0, `typescript-eslint` 8.65.0, `eslint-plugin-vue` 10.10.0, `@vanilla-extract/rollup-plugin` 1.5.4. Each stays within the major the previous range already allowed, so resolution does not change for anyone; the declarations are just brought back in line.

  These are published together so the incidental output differences are versioned explicitly, rather than riding along unannounced in whatever release happens to touch these packages next.

## 4.1.0

### Minor Changes

- [`cd79340`](https://github.com/dadajam4/fastkit/commit/cd793404582f7fca56798b8dc0e46eafa39bc91b) Thanks [@dadajam4](https://github.com/dadajam4)! - Move the Vite integration plugin to a dedicated `./vite` subpath export, and make the underlying Vite plugin an optional peer dependency.

  The `ViteVanillaExtractPlugin` / `ViteVuePlugin` / `ViteVueJSXPlugin` helpers are no longer exported from the package root — import them from `@fastkit/plugboy-<name>-plugin/vite` instead. Because of this split, the main entry no longer loads the underlying Vite plugin (`@vanilla-extract/vite-plugin`, `@vitejs/plugin-vue`, `@vitejs/plugin-vue-jsx`), so build-only consumers no longer pull it in. These Vite plugins moved from `dependencies` to optional `peerDependencies`; install the corresponding one yourself when using the `/vite` integration.

  `@fastkit/plugboy-vue-plugin`'s Vite helper was also renamed from `ViteVueJSXPlugin` to `ViteVuePlugin` (it wraps `@vitejs/plugin-vue`, not the JSX plugin).

  In addition, the supported `vite` peer dependency range is unified to `^6.0.0 || ^7.0.0 || ^8.0.0` across all Vite-related packages — dropping the untested `^5.0.0`, adding `^8.0.0`, and aligning `@fastkit/vue-tiny-meta` which previously omitted `^8.0.0`.

### Patch Changes

- [`d63b1af`](https://github.com/dadajam4/fastkit/commit/d63b1af8bf1bb131590ff540af82428cc60aeb7e) Thanks [@dadajam4](https://github.com/dadajam4)! - Strip the dangling `//# sourceMappingURL=*.d.mts.map` comment from emitted declaration files.

  tsdown (rolldown) appends this comment to every `.d.(m)ts` it emits but does not emit the referenced declaration map, so consumers' editors/build tools fail to resolve it. plugboy now removes the comment during build — but only when the referenced map is genuinely absent, so it becomes a no-op automatically if a future tsdown starts emitting real declaration maps.

  Every package in this monorepo is built by plugboy, so this patch re-publishes them all with declaration files that no longer point at a missing map.

## 4.0.0

### Major Changes

- [`b824e71`](https://github.com/dadajam4/fastkit/commit/b824e7136b57649d7958e257c21e8704267380e6) Thanks [@dadajam4](https://github.com/dadajam4)! - Contains fixes to follow the internal bundler change in plugboy.

- Major release: the plugboy toolchain migrates its internal bundler from **tsup (esbuild)** to **tsdown (rolldown)**.

  This is a large change that affects the workspace config schema, the plugin-authoring API, and several output details. See the migration guide for what changed and the steps to upgrade:

  https://github.com/dadajam4/fastkit/blob/main/packages/plugboy/docs/migrations/v1.md

- [`7f48999`](https://github.com/dadajam4/fastkit/commit/7f4899920b42da8098f3596031d7255b3ce59d42) Thanks [@dadajam4](https://github.com/dadajam4)! - Extract the vanilla-extract authoring helpers into a new `@fastkit/vanilla-extract-utils` package.

  `defineLayerStyle`, `createGlobalTheme` and the related layer/theme utilities were previously exported from `@fastkit/plugboy-vanilla-extract-plugin/css`. They are bundler-agnostic (they only wrap `@vanilla-extract/css`) and have nothing to do with the plugboy build pipeline, so they now live in their own package.

  - **New `@fastkit/vanilla-extract-utils`** — provides `defineLayerStyle` etc. Declares `@vanilla-extract/css` as a **peer dependency** so it resolves to the consumer's single instance (vanilla-extract requires a singleton).
  - **Breaking (`@fastkit/plugboy-vanilla-extract-plugin`)** — the `./css` subpath export is removed, and the package no longer depends on `@vanilla-extract/css`. It is now purely the plugboy build plugin (`@vanilla-extract/rollup-plugin` / `vite-plugin`). Migration: replace `@fastkit/plugboy-vanilla-extract-plugin/css` imports with `@fastkit/vanilla-extract-utils` (and add `@vanilla-extract/css` to your dependencies).

### Patch Changes

- [`7e16feb`](https://github.com/dadajam4/fastkit/commit/7e16feb3e45cd6bbf06ac878b8c8e9133f373eb6) Thanks [@dadajam4](https://github.com/dadajam4)! - When plain CSS is imported, it is now merged into the beginning of the vanilla-extract bundle file.

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

- [`e5a301d`](https://github.com/dadajam4/fastkit/commit/e5a301d2ab722317f1fcd4e40a54d69d101ef54f) Thanks [@dadajam4](https://github.com/dadajam4)! - Added a `prepend` option to insert arbitrary code at the beginning of the bundled CSS file.

- [`f821548`](https://github.com/dadajam4/fastkit/commit/f821548d8b812efe1f91f443a487875fe8804662) Thanks [@dadajam4](https://github.com/dadajam4)! - Fix per-entry CSS splitting silently no-op'ing on some rolldown versions.

  The split introduced in 4.0.0-next.11 attributed CSS to entries by reading each output chunk's `imports`, but whether vanilla-extract's external virtual CSS ids appear there is rolldown-version-dependent. On versions that list only real output chunks, the lookup found nothing, so multi-entry packages fell back to a single combined `<package>.css` instead of one `<entry>.css` per entry.

  CSS is now attributed by walking the input module graph from each entry's `facadeModuleId` via `getModuleInfo().importedIds`, which is stable across rolldown versions and independent of how the output is chunked. A `.css.ts` reached by several entries is included in each entry's file (self-contained per-entry CSS). Single-CSS-entry packages are unaffected.

- [`cde4fad`](https://github.com/dadajam4/fastkit/commit/cde4fad840325d08d3fd4428c262e5cf54d35c75) Thanks [@dadajam4](https://github.com/dadajam4)! - Allow `LayerStyle` values created by `defineLayerStyle` to be exported from `.css.ts` modules.

  The `.css.ts` build is delegated to `@vanilla-extract/rollup-plugin`, whose `serializeVanillaModule` rejects plain function exports — so the documented usage `export const x = defineLayerStyle(...)` (which returns a function) previously crashed the build. `defineLayerStyle` now registers vanilla-extract's official function serializer (`addFunctionSerializer`), emitting deterministic re-construction code instead of throwing.

  - Global layers (`{ globalName }`) re-construct via `defineLayerStyle({ globalName, parent })`, whose name is deterministic. Existing behavior is unchanged.
  - Scoped layers (`{ debugId }`) carry their build-time hash name verbatim through the new internal `defineLayerStyleFromResolvedName(layerName, parentLayerName)` entry, so the re-constructed reference resolves to the exact layer emitted into CSS (calling `layer()` again would produce a different name).

  A re-constructed instance is a reference handle that restores only deterministic state (`layerName` / `parentLayerName`); `hooks` and `extend()` additions are not serialized. This does not affect build-time behavior — hooks run during `.css.ts` evaluation and their CSS is already baked in before serialization.

- [`c581733`](https://github.com/dadajam4/fastkit/commit/c5817337cd4fa315f32f6d2fad3f1c507ccc007d) Thanks [@dadajam4](https://github.com/dadajam4)! - This release does not include any functional changes.

- [`c30c7bd`](https://github.com/dadajam4/fastkit/commit/c30c7bdd5baf594512f84f2054f716f95c51bed1) Thanks [@dadajam4](https://github.com/dadajam4)! - - Removed the forced inline output setting for d.ts.

  - Fixed an issue where CSS was emitted for entries that did not require it when multiple entries were configured.

- [`55c1990`](https://github.com/dadajam4/fastkit/commit/55c19907812f5a146a79e61e0a6be33198cc4e59) Thanks [@dadajam4](https://github.com/dadajam4)! - Split extracted CSS per entry so multi-entry packages emit one `<entry>.css` per entry again.

  `@vanilla-extract/rollup-plugin`'s `extract: { name }` mode collects the CSS of every `.css.ts` in the graph into a single bundle, which lost plugboy's per-entry CSS contract: each entry with `css: true` declares a `./<entry>.css` export, but only the main entry's file was ever produced (so e.g. `pkg/secondary.css` 404'd).

  The `rename-css` plugin now rebuilds per-entry files from data vanilla-extract already exposes — `moduleInfo.meta.css` (its public hand-off for extracted CSS) keyed by each entry chunk's `imports`. The only coupling to vanilla-extract is `meta.css`; asset names are not parsed and the import statements it strips are not re-added.

  - Splitting only happens when more than one entry actually has CSS. With a single CSS entry (the common case) vanilla-extract's already-correct bundle is left untouched, so existing single-entry packages are unaffected.
  - The split runs before `plugboy-optimize-css`, so each per-entry file still goes through the postcss optimizations.
  - The main entry overwrites vanilla-extract's existing asset in place (re-emitting the same name would trip rolldown's `FILE_NAME_CONFLICT`); other entries are emitted as new assets.

- [`25602cb`](https://github.com/dadajam4/fastkit/commit/25602cbe1493cbeb10456b8b0e7680983d9e2ed7) Thanks [@dadajam4](https://github.com/dadajam4)! - Update dependencies and apply the associated fixes.

- [`46ed4b7`](https://github.com/dadajam4/fastkit/commit/46ed4b7e4101057b4b8fb53f65005ddca39142ba) Thanks [@dadajam4](https://github.com/dadajam4)! - The `prepend` option has been enhanced to accept a function, enabling dynamic code injection.

- [`b9640a7`](https://github.com/dadajam4/fastkit/commit/b9640a7e3786b1e75f54df3b184941cea6038672) Thanks [@dadajam4](https://github.com/dadajam4)! - Added support to fix an issue where file scopes were not created correctly when utilities using vanilla-extract functions (such as `style`) are defined in external packages.

- [`bd97396`](https://github.com/dadajam4/fastkit/commit/bd97396fd6fbd6897bdcc8bc432e81533dcc825f) Thanks [@dadajam4](https://github.com/dadajam4)! - Merge plain (non-`.css.ts`) CSS into the per-entry CSS of the entry that imports it.

  Plain CSS imported by an entry (e.g. an `@font-face` sheet) flows through tsdown's own CSS pipeline, which combines it into a single file. With per-entry splitting active that combined file was written to a `<package>.css` named after the package directory — a file that is not in `package.json#exports` and is imported by no entry, so consumers reading the real `<entry>.css` lost those styles (e.g. `@font-face` went missing).

  `generateBundle` now records which entries import plain CSS (by walking the input module graph), and `writeBundle` merges tsdown's plain-CSS blob into those entries' CSS files instead of the orphan `<package>.css`. With a single CSS entry the original single-file behavior is unchanged.

  Note: the combined blob cannot be partitioned per entry, so if several entries import distinct plain CSS each receives the whole blob; in practice plain CSS (fonts/resets) is imported by a single entry. tsdown's native CSS `splitting` is not usable here — it drops plain CSS entirely when vanilla-extract is present.

- [`4f5dc5b`](https://github.com/dadajam4/fastkit/commit/4f5dc5bb6215ee46bd0d19ab190e78e6a4db3450) Thanks [@dadajam4](https://github.com/dadajam4)! - Fix CSS file name conflict that dropped all vanilla-extract component styles

  When a package emits CSS from both tsdown's built-in pipeline (plain `.css` /
  `.scss`) and `@vanilla-extract/rollup-plugin` (`.css.ts`), both outputs were
  pointed at the same `<pkg>.css` file. rolldown reported `FILE_NAME_CONFLICT` and
  one output silently overwrote the other, so the extracted component styles were
  lost and only the global CSS shipped.

  tsdown's CSS is now routed to a temporary file and merged into the
  vanilla-extract bundle in `generateBundle`, so the package again ships a single
  `<pkg>.css` containing both the global and component styles (global first, to
  preserve `@layer` ordering).

## 4.0.0-next.14

### Major Changes

- Extract the vanilla-extract authoring helpers into a new `@fastkit/vanilla-extract-utils` package.

  `defineLayerStyle`, `createGlobalTheme` and the related layer/theme utilities were previously exported from `@fastkit/plugboy-vanilla-extract-plugin/css`. They are bundler-agnostic (they only wrap `@vanilla-extract/css`) and have nothing to do with the plugboy build pipeline, so they now live in their own package.

  - **New `@fastkit/vanilla-extract-utils`** — provides `defineLayerStyle` etc. Declares `@vanilla-extract/css` as a **peer dependency** so it resolves to the consumer's single instance (vanilla-extract requires a singleton).
  - **Breaking (`@fastkit/plugboy-vanilla-extract-plugin`)** — the `./css` subpath export is removed, and the package no longer depends on `@vanilla-extract/css`. It is now purely the plugboy build plugin (`@vanilla-extract/rollup-plugin` / `vite-plugin`). Migration: replace `@fastkit/plugboy-vanilla-extract-plugin/css` imports with `@fastkit/vanilla-extract-utils` (and add `@vanilla-extract/css` to your dependencies).

## 4.0.0-next.13

### Patch Changes

- Merge plain (non-`.css.ts`) CSS into the per-entry CSS of the entry that imports it.

  Plain CSS imported by an entry (e.g. an `@font-face` sheet) flows through tsdown's own CSS pipeline, which combines it into a single file. With per-entry splitting active that combined file was written to a `<package>.css` named after the package directory — a file that is not in `package.json#exports` and is imported by no entry, so consumers reading the real `<entry>.css` lost those styles (e.g. `@font-face` went missing).

  `generateBundle` now records which entries import plain CSS (by walking the input module graph), and `writeBundle` merges tsdown's plain-CSS blob into those entries' CSS files instead of the orphan `<package>.css`. With a single CSS entry the original single-file behavior is unchanged.

  Note: the combined blob cannot be partitioned per entry, so if several entries import distinct plain CSS each receives the whole blob; in practice plain CSS (fonts/resets) is imported by a single entry. tsdown's native CSS `splitting` is not usable here — it drops plain CSS entirely when vanilla-extract is present.

## 4.0.0-next.12

### Patch Changes

- Fix per-entry CSS splitting silently no-op'ing on some rolldown versions.

  The split introduced in 4.0.0-next.11 attributed CSS to entries by reading each output chunk's `imports`, but whether vanilla-extract's external virtual CSS ids appear there is rolldown-version-dependent. On versions that list only real output chunks, the lookup found nothing, so multi-entry packages fell back to a single combined `<package>.css` instead of one `<entry>.css` per entry.

  CSS is now attributed by walking the input module graph from each entry's `facadeModuleId` via `getModuleInfo().importedIds`, which is stable across rolldown versions and independent of how the output is chunked. A `.css.ts` reached by several entries is included in each entry's file (self-contained per-entry CSS). Single-CSS-entry packages are unaffected.

## 4.0.0-next.11

### Patch Changes

- Split extracted CSS per entry so multi-entry packages emit one `<entry>.css` per entry again.

  `@vanilla-extract/rollup-plugin`'s `extract: { name }` mode collects the CSS of every `.css.ts` in the graph into a single bundle, which lost plugboy's per-entry CSS contract: each entry with `css: true` declares a `./<entry>.css` export, but only the main entry's file was ever produced (so e.g. `pkg/secondary.css` 404'd).

  The `rename-css` plugin now rebuilds per-entry files from data vanilla-extract already exposes — `moduleInfo.meta.css` (its public hand-off for extracted CSS) keyed by each entry chunk's `imports`. The only coupling to vanilla-extract is `meta.css`; asset names are not parsed and the import statements it strips are not re-added.

  - Splitting only happens when more than one entry actually has CSS. With a single CSS entry (the common case) vanilla-extract's already-correct bundle is left untouched, so existing single-entry packages are unaffected.
  - The split runs before `plugboy-optimize-css`, so each per-entry file still goes through the postcss optimizations.
  - The main entry overwrites vanilla-extract's existing asset in place (re-emitting the same name would trip rolldown's `FILE_NAME_CONFLICT`); other entries are emitted as new assets.

## 4.0.0-next.10

### Patch Changes

- Allow `LayerStyle` values created by `defineLayerStyle` to be exported from `.css.ts` modules.

  The `.css.ts` build is delegated to `@vanilla-extract/rollup-plugin`, whose `serializeVanillaModule` rejects plain function exports — so the documented usage `export const x = defineLayerStyle(...)` (which returns a function) previously crashed the build. `defineLayerStyle` now registers vanilla-extract's official function serializer (`addFunctionSerializer`), emitting deterministic re-construction code instead of throwing.

  - Global layers (`{ globalName }`) re-construct via `defineLayerStyle({ globalName, parent })`, whose name is deterministic. Existing behavior is unchanged.
  - Scoped layers (`{ debugId }`) carry their build-time hash name verbatim through the new internal `defineLayerStyleFromResolvedName(layerName, parentLayerName)` entry, so the re-constructed reference resolves to the exact layer emitted into CSS (calling `layer()` again would produce a different name).

  A re-constructed instance is a reference handle that restores only deterministic state (`layerName` / `parentLayerName`); `hooks` and `extend()` additions are not serialized. This does not affect build-time behavior — hooks run during `.css.ts` evaluation and their CSS is already baked in before serialization.

## 4.0.0-next.9

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

## 4.0.0-next.8

### Patch Changes

- Fix CSS file name conflict that dropped all vanilla-extract component styles

  When a package emits CSS from both tsdown's built-in pipeline (plain `.css` /
  `.scss`) and `@vanilla-extract/rollup-plugin` (`.css.ts`), both outputs were
  pointed at the same `<pkg>.css` file. rolldown reported `FILE_NAME_CONFLICT` and
  one output silently overwrote the other, so the extracted component styles were
  lost and only the global CSS shipped.

  tsdown's CSS is now routed to a temporary file and merged into the
  vanilla-extract bundle in `generateBundle`, so the package again ships a single
  `<pkg>.css` containing both the global and component styles (global first, to
  preserve `@layer` ordering).

## 4.0.0-next.7

### Patch Changes

- Update dependencies and apply the associated fixes.

## 4.0.0-next.6

### Patch Changes

- When plain CSS is imported, it is now merged into the beginning of the vanilla-extract bundle file.

- Updated dependencies []:
  - @fastkit/plugboy@1.0.0-next.2

## 4.0.0-next.5

### Patch Changes

- The `prepend` option has been enhanced to accept a function, enabling dynamic code injection.

## 4.0.0-next.4

### Patch Changes

- Added a `prepend` option to insert arbitrary code at the beginning of the bundled CSS file.

## 4.0.0-next.3

### Patch Changes

- Added support to fix an issue where file scopes were not created correctly when utilities using vanilla-extract functions (such as `style`) are defined in external packages.

- Updated dependencies []:
  - @fastkit/plugboy@1.0.0-next.1

## 4.0.0-next.2

### Patch Changes

- This release does not include any functional changes.

## 4.0.0-next.1

### Patch Changes

- - Removed the forced inline output setting for d.ts.
  - Fixed an issue where CSS was emitted for entries that did not require it when multiple entries were configured.

## 4.0.0-next.0

### Major Changes

- Contains fixes to follow the internal bundler change in plugboy.

### Patch Changes

- Updated dependencies []:
  - @fastkit/plugboy@1.0.0-next.0

## 3.2.0

### Minor Changes

- Updated major dependencies.

## 3.1.0

### Minor Changes

- Updated major dependencies.

### Patch Changes

- Updated dependencies []:
  - @fastkit/plugboy@0.3.0

## 3.0.0

### Major Changes

- [#153](https://github.com/dadajam4/fastkit/pull/153) [`2a9ac68`](https://github.com/dadajam4/fastkit/commit/2a9ac68653d4335d761d958a4061098218faaa0e) Thanks [@nkenji09](https://github.com/nkenji09)! - Now supports Vite 7 series

## 3.0.0-next.0

### Major Changes

- [#153](https://github.com/dadajam4/fastkit/pull/153) [`c650b4a`](https://github.com/dadajam4/fastkit/commit/c650b4a3813c891b5e21c6dd68cac981ac01d465) Thanks [@nkenji09](https://github.com/nkenji09)! - Now supports Vite 7 series

## 2.1.1

### Patch Changes

- Updated major dependencies.

## 2.1.0

### Minor Changes

- [#148](https://github.com/dadajam4/fastkit/pull/148) [`8b66410`](https://github.com/dadajam4/fastkit/commit/8b66410e3423016c76956f772b86426dec99a0e7) Thanks [@nkenji09](https://github.com/nkenji09)! - 依存パッケージのアップデートを行いました

## 2.0.7

### Patch Changes

- Dependency updates only.

- Updated dependencies []:
  - @fastkit/plugboy@0.2.7

## 2.0.6

### Patch Changes

- Updated dependencies []:
  - @fastkit/plugboy@0.2.6

## 2.0.5

### Patch Changes

- Updated dependencies.

- Updated dependencies []:
  - @fastkit/plugboy@0.2.5

## 2.0.4

### Patch Changes

- Updated dependencies only.

- Updated dependencies []:
  - @fastkit/plugboy@0.2.4

## 2.0.3

### Patch Changes

- Updated dependencies []:
  - @fastkit/plugboy@0.2.3

## 2.0.2

### Patch Changes

- Updated major dependencies.

- Updated dependencies []:
  - @fastkit/plugboy@0.2.2

## 2.0.1

### Patch Changes

- Reverted the removal of the `main` field that was introduced in the previous release and restored support for the old `moduleResolution`.

- Updated dependencies []:
  - @fastkit/plugboy@0.2.1

## 2.0.0

### Minor Changes

- This release includes no functional changes, but it contains the following important updates:
  - Now adheres to ES Modules and the latest TypeScript standards, and the output for the `main` field and `typesVersions` is no longer generated.

### Patch Changes

- Updated dependencies []:
  - @fastkit/plugboy@0.2.0

## 1.0.14

### Patch Changes

- Refactored internal implementation due to a review of ESLint rules, with no changes to the specifications.

- Updated dependencies []:
  - @fastkit/plugboy@0.1.10

## 1.0.13

### Patch Changes

- [#122](https://github.com/dadajam4/fastkit/pull/122) [`d0c96fa`](https://github.com/dadajam4/fastkit/commit/d0c96faf96b6c91bcb8bc0b1ca9d22fc8ede303e) Thanks [@dadajam4](https://github.com/dadajam4)! - Update major and non-major packages

- Updated dependencies [[`d0c96fa`](https://github.com/dadajam4/fastkit/commit/d0c96faf96b6c91bcb8bc0b1ca9d22fc8ede303e)]:
  - @fastkit/plugboy@0.1.9

## 1.0.12

### Patch Changes

- [#120](https://github.com/dadajam4/fastkit/pull/120) [`5b881b9`](https://github.com/dadajam4/fastkit/commit/5b881b94ce1852c12cc3c8f6954564d5235cba4d) Thanks [@dadajam4](https://github.com/dadajam4)! - JSDocs were added and no-console lint improvements were made.

- Updated dependencies [[`5b881b9`](https://github.com/dadajam4/fastkit/commit/5b881b94ce1852c12cc3c8f6954564d5235cba4d)]:
  - @fastkit/plugboy@0.1.8

## 1.0.11

### Patch Changes

- Updated dependencies [[`4a974d2`](https://github.com/dadajam4/fastkit/commit/4a974d2bc85767048abcc4ed8294058d19ebfb0f)]:
  - @fastkit/plugboy@0.1.7

## 1.0.10

### Patch Changes

- Updated dependencies [[`93488f2`](https://github.com/dadajam4/fastkit/commit/93488f21251f32ed5d577f854146815bd6307161)]:
  - @fastkit/plugboy@0.1.6

## 1.0.9

### Patch Changes

- [#55](https://github.com/dadajam4/fastkit/pull/55) [`caf4e36`](https://github.com/dadajam4/fastkit/commit/caf4e36172e94a98e389df3201410f639d457d43) Thanks [@dadajam4](https://github.com/dadajam4)! - Fixed incorrect style generation when applying compound styles.

## 1.0.8

### Patch Changes

- [#51](https://github.com/dadajam4/fastkit/pull/51) [`f3b13f6`](https://github.com/dadajam4/fastkit/commit/f3b13f6d32cdfebd44f4d3f662fdb5c91e4b90e0) Thanks [@dadajam4](https://github.com/dadajam4)! - - We have extended the type to allow declaring custom interfaces for styles.
  - Allows registration of hooks when defining styles.

## 1.0.7

### Patch Changes

- [#41](https://github.com/dadajam4/fastkit/pull/41) [`094e94d`](https://github.com/dadajam4/fastkit/commit/094e94d808725b6f1b58a279cdb635abf0371a50) Thanks [@dadajam4](https://github.com/dadajam4)! - Style Composition is now supported.

  https://vanilla-extract.style/documentation/api/style/#style-composition

## 1.0.6

### Patch Changes

- [#39](https://github.com/dadajam4/fastkit/pull/39) [`40ee82f`](https://github.com/dadajam4/fastkit/commit/40ee82f4501b88e44ad9b67918df2237298493a0) Thanks [@dadajam4](https://github.com/dadajam4)! - Dependencies have been updated.

- Updated dependencies [[`40ee82f`](https://github.com/dadajam4/fastkit/commit/40ee82f4501b88e44ad9b67918df2237298493a0)]:
  - @fastkit/plugboy@0.1.5

## 1.0.5

### Patch Changes

- Updated dependencies [[`50e81c9`](https://github.com/dadajam4/fastkit/commit/50e81c949e0e99c54ffe227e3274826ed31c04af)]:
  - @fastkit/plugboy@0.1.4

## 1.0.4

### Patch Changes

- [#33](https://github.com/dadajam4/fastkit/pull/33) [`dc6b10a4`](https://github.com/dadajam4/fastkit/commit/dc6b10a4d3279dd24de1f7f1b5113dcec52b63ad) Thanks [@dadajam4](https://github.com/dadajam4)! - Fixed types when defining layers.

- Updated dependencies [[`dc6b10a4`](https://github.com/dadajam4/fastkit/commit/dc6b10a4d3279dd24de1f7f1b5113dcec52b63ad)]:
  - @fastkit/plugboy@0.1.3

## 1.0.3

### Patch Changes

- [#31](https://github.com/dadajam4/fastkit/pull/31) [`8e04503f`](https://github.com/dadajam4/fastkit/commit/8e04503f7acb585f50ceb482af0128e2263a94f9) Thanks [@dadajam4](https://github.com/dadajam4)! - A helper has been added for defining global variables with layers.

  This helper is a temporary fix for the fact that vanilla-extract does not properly output all variables when outputting layered global styles. This feature may be deprecated when an official fix is made.

- Updated dependencies [[`8e04503f`](https://github.com/dadajam4/fastkit/commit/8e04503f7acb585f50ceb482af0128e2263a94f9)]:
  - @fastkit/plugboy@0.1.2

## 1.0.2

### Patch Changes

- [#29](https://github.com/dadajam4/fastkit/pull/29) [`821790ac`](https://github.com/dadajam4/fastkit/commit/821790acf74c162e584a535a7888e69bd3f1b9eb) Thanks [@dadajam4](https://github.com/dadajam4)! - Added experimental CSS layer helper functions.

## 1.0.1

### Patch Changes

- Updated dependencies [[`8bbadb71`](https://github.com/dadajam4/fastkit/commit/8bbadb7102edbc2bf89df54268c12be5435d5241)]:
  - @fastkit/plugboy@0.1.1

## 1.0.0

### Minor Changes

- First Release in Repository Migration.
