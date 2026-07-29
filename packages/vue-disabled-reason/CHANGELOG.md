# @fastkit/vue-disabled-reason

## 0.3.3

### Patch Changes

- [#180](https://github.com/dadajam4/fastkit/pull/180) [`406f96d`](https://github.com/dadajam4/fastkit/commit/406f96d74bd9ce0fdbfca36a03ef4b83342abfaf) Thanks [@dadajam4](https://github.com/dadajam4)! - Hand the extracted CSS to tsdown's CSS pipeline, so the `css` options apply to it.

  `@vanilla-extract/rollup-plugin` resolves its virtual stylesheets as **external** modules and, in `extract` mode, emits the collected CSS itself as a bundler asset. Either way tsdown never saw the CSS, so none of the `css` options could reach it: `css.target` in particular, which meant a `.css.ts` writing `userSelect: 'none'` shipped a bare `user-select` — the property Safari ignores without `-webkit-` — while `.scss` in the same repository was prefixed correctly. `css.transformer: 'postcss'` and `css.minify` were equally invisible to it.

  The plugin now resolves the virtual stylesheet as a real module and supplies its content from `load`, the approach `@vanilla-extract/vite-plugin` takes. The extracted CSS is an ordinary `.css` module in the graph, so tsdown owns it: `target`, `transformer` (lightningcss _or_ postcss), `minify` and the preprocessor options all apply, and its pipeline emits the single `css.fileName`. One consequence worth recording: the `?source=` query has to be stripped when resolving, because `@tsdown/css` skips any CSS id carrying a non-`?inline` query — with the query intact the styles are dropped from the output entirely.

  Because there is now one CSS producer instead of two, the machinery built around the old split is gone: the temporary file that avoided a `FILE_NAME_CONFLICT` with tsdown's own output, the on-disk merge in `writeBundle`, the `assetFileNames` override that renamed the emitted asset, and the per-entry re-split driven by `meta.css`. `@vanilla-extract/integration` becomes a direct dependency (it provides the virtual-id helpers, and was already an indirect one).

  The per-entry CSS contract — plugboy declares a `./<entry>.css` export for every entry with `css: true` — is now served by `css.splitting`, which the plugin derives from the number of such entries: one of them keeps `splitting: false` and a single `<package>.css`, several switch to `splitting: true` so tsdown emits one stylesheet per chunk. That second case is measurably better than the old hand-rolled split, which lost an entry's own CSS whenever a `.css.ts` was shared between entries; plugboy now guarantees every `./<entry>.css` exists and is self-contained. No package in this repository declares more than one CSS entry, so none of this affects a published stylesheet today.

  The three packages that use Vanilla Extract ship changed CSS. The change is a normalization, not a restructuring — verified against the previous build: the selector sequence and the at-rule sequence are identical, so cascade order and class names are untouched. The declarations themselves are now normalized the way lightningcss normalizes them everywhere else in the repository (`top/right/bottom/left: 0` → `inset: 0`, `flex: 1 1 100%` → `flex: 100%`, `rgba(0,0,0,.5)` → `#00000080`, `200ms` → `.2s`), and `@layer` declarations lightningcss can prove redundant are dropped. Total size is unchanged (vue-app-layout: 15957 → 15959 bytes).

## 0.3.2

### Patch Changes

- [#175](https://github.com/dadajam4/fastkit/pull/175) [`05d8bb4`](https://github.com/dadajam4/fastkit/commit/05d8bb4385811b677e323d2137a6d0e8a65186c5) Thanks [@dadajam4](https://github.com/dadajam4)! - Rebuild with the updated toolchain. No functional changes.

  `tsdown` moved from 0.22.3 to 0.22.14 (and with it rolldown from 1.1.3 to 1.2.0), which changes the emitted output even for packages whose sources are untouched — rolldown hoists some expressions into local bindings, and declaration printing differs in where it wraps lines. Comparing every `dist` file against `main`, built twice per side to filter out the known non-reproducible declaration output, 56 packages differ across 59 `.d.mts`, 26 `.map`, 18 `.mjs` and 1 `.css` file, all of them incidental.

  A few packages here also carry a refreshed dependency range — `fs-extra` 11.4.0, `typescript-eslint` 8.65.0, `eslint-plugin-vue` 10.10.0, `@vanilla-extract/rollup-plugin` 1.5.4. Each stays within the major the previous range already allowed, so resolution does not change for anyone; the declarations are just brought back in line.

  These are published together so the incidental output differences are versioned explicitly, rather than riding along unannounced in whatever release happens to touch these packages next.

- Updated dependencies [[`05d8bb4`](https://github.com/dadajam4/fastkit/commit/05d8bb4385811b677e323d2137a6d0e8a65186c5)]:
  - @fastkit/vue-utils@0.18.3

## 0.3.1

### Patch Changes

- [`d63b1af`](https://github.com/dadajam4/fastkit/commit/d63b1af8bf1bb131590ff540af82428cc60aeb7e) Thanks [@dadajam4](https://github.com/dadajam4)! - Strip the dangling `//# sourceMappingURL=*.d.mts.map` comment from emitted declaration files.

  tsdown (rolldown) appends this comment to every `.d.(m)ts` it emits but does not emit the referenced declaration map, so consumers' editors/build tools fail to resolve it. plugboy now removes the comment during build — but only when the referenced map is genuinely absent, so it becomes a no-op automatically if a future tsdown starts emitting real declaration maps.

  Every package in this monorepo is built by plugboy, so this patch re-publishes them all with declaration files that no longer point at a missing map.

- Updated dependencies [[`d63b1af`](https://github.com/dadajam4/fastkit/commit/d63b1af8bf1bb131590ff540af82428cc60aeb7e)]:
  - @fastkit/vue-utils@0.18.1

## 0.3.0

### Minor Changes

- [`b824e71`](https://github.com/dadajam4/fastkit/commit/b824e7136b57649d7958e257c21e8704267380e6) Thanks [@dadajam4](https://github.com/dadajam4)! - Release due to package bundler change. No functional changes included.

- Release accompanying the plugboy bundler migration (tsup → tsdown).

  No API changes are intended for this package. The minor bump exists because the package is rebuilt with the new bundler (tsdown / rolldown), and is published together so any incidental output differences are versioned explicitly.

### Patch Changes

- [`25602cb`](https://github.com/dadajam4/fastkit/commit/25602cbe1493cbeb10456b8b0e7680983d9e2ed7) Thanks [@dadajam4](https://github.com/dadajam4)! - Update dependencies and apply the associated fixes.

- Updated dependencies [[`b824e71`](https://github.com/dadajam4/fastkit/commit/b824e7136b57649d7958e257c21e8704267380e6), [`25602cb`](https://github.com/dadajam4/fastkit/commit/25602cbe1493cbeb10456b8b0e7680983d9e2ed7)]:
  - @fastkit/vue-utils@0.18.0

## 0.3.0-next.1

### Patch Changes

- Update dependencies and apply the associated fixes.

- Updated dependencies []:
  - @fastkit/vue-utils@0.18.0-next.1

## 0.3.0-next.0

### Minor Changes

- Release due to package bundler change. No functional changes included.

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.18.0-next.0

## 0.2.0

### Minor Changes

- Updated major dependencies.

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.17.0

## 0.1.0

### Minor Changes

- Updated major dependencies.

  This release also includes the following behavioral change:

  Previously, this package used only a single element specified with `data-disabled-reason-container` as the target for displaying the disabled reason. Starting with this version, **all child elements contained within the specified container** will act as targets. This change improves the UI for cases where multiple disabled child elements exist, such as in a group of checkboxes.

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.16.0

## 0.0.1

### Patch Changes

- First release.

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.13
