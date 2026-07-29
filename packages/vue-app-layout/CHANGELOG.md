# @fastkit/vue-app-layout

## 0.19.5

### Patch Changes

- [#182](https://github.com/dadajam4/fastkit/pull/182) [`6e577af`](https://github.com/dadajam4/fastkit/commit/6e577af928bfaea49499e760655532d2a636d5b1) Thanks [@dadajam4](https://github.com/dadajam4)! - Stop publishing the absolute path of every `.vue` file.

  `unplugin-vue` defaults `isProduction` to false, which enables the devtools annotations — among them `__file`, holding the **absolute** path of the SFC:

  ```js
  export_helper_default(_sfc_main, [
    ['render', _sfc_render],
    ['__file', '/Users/someone/projects/acme/packages/ui/src/Button.vue'],
  ]);
  ```

  plugboy builds artifacts for publishing, so `isProduction: true` is the right default; a consumer that wants the annotations can pass `isProduction: false`. Production mode also switches on template inlining, which rewrites a `<script setup>` component's compiled shape — that is a codegen change rather than a leak fix, so `inlineTemplate` is defaulted off and left for the consumer to opt into.

  `@fastkit/vue-app-layout` is the only package here with an SFC. Its output loses the `__file` entry and, from the production props codegen, a redundant `required: false` on an optional Boolean prop; the component is otherwise unchanged.

## 0.19.4

### Patch Changes

- [#180](https://github.com/dadajam4/fastkit/pull/180) [`406f96d`](https://github.com/dadajam4/fastkit/commit/406f96d74bd9ce0fdbfca36a03ef4b83342abfaf) Thanks [@dadajam4](https://github.com/dadajam4)! - Hand the extracted CSS to tsdown's CSS pipeline, so the `css` options apply to it.

  `@vanilla-extract/rollup-plugin` resolves its virtual stylesheets as **external** modules and, in `extract` mode, emits the collected CSS itself as a bundler asset. Either way tsdown never saw the CSS, so none of the `css` options could reach it: `css.target` in particular, which meant a `.css.ts` writing `userSelect: 'none'` shipped a bare `user-select` — the property Safari ignores without `-webkit-` — while `.scss` in the same repository was prefixed correctly. `css.transformer: 'postcss'` and `css.minify` were equally invisible to it.

  The plugin now resolves the virtual stylesheet as a real module and supplies its content from `load`, the approach `@vanilla-extract/vite-plugin` takes. The extracted CSS is an ordinary `.css` module in the graph, so tsdown owns it: `target`, `transformer` (lightningcss _or_ postcss), `minify` and the preprocessor options all apply, and its pipeline emits the single `css.fileName`. One consequence worth recording: the `?source=` query has to be stripped when resolving, because `@tsdown/css` skips any CSS id carrying a non-`?inline` query — with the query intact the styles are dropped from the output entirely.

  Because there is now one CSS producer instead of two, the machinery built around the old split is gone: the temporary file that avoided a `FILE_NAME_CONFLICT` with tsdown's own output, the on-disk merge in `writeBundle`, the `assetFileNames` override that renamed the emitted asset, and the per-entry re-split driven by `meta.css`. `@vanilla-extract/integration` becomes a direct dependency (it provides the virtual-id helpers, and was already an indirect one).

  The per-entry CSS contract — plugboy declares a `./<entry>.css` export for every entry with `css: true` — is now served by `css.splitting`, which the plugin derives from the number of such entries: one of them keeps `splitting: false` and a single `<package>.css`, several switch to `splitting: true` so tsdown emits one stylesheet per chunk. That second case is measurably better than the old hand-rolled split, which lost an entry's own CSS whenever a `.css.ts` was shared between entries; plugboy now guarantees every `./<entry>.css` exists and is self-contained. No package in this repository declares more than one CSS entry, so none of this affects a published stylesheet today.

  The three packages that use Vanilla Extract ship changed CSS. The change is a normalization, not a restructuring — verified against the previous build: the selector sequence and the at-rule sequence are identical, so cascade order and class names are untouched. The declarations themselves are now normalized the way lightningcss normalizes them everywhere else in the repository (`top/right/bottom/left: 0` → `inset: 0`, `flex: 1 1 100%` → `flex: 100%`, `rgba(0,0,0,.5)` → `#00000080`, `200ms` → `.2s`), and `@layer` declarations lightningcss can prove redundant are dropped. Total size is unchanged (vue-app-layout: 15957 → 15959 bytes).

## 0.19.3

### Patch Changes

- [#175](https://github.com/dadajam4/fastkit/pull/175) [`05d8bb4`](https://github.com/dadajam4/fastkit/commit/05d8bb4385811b677e323d2137a6d0e8a65186c5) Thanks [@dadajam4](https://github.com/dadajam4)! - Rebuild with the updated toolchain. No functional changes.

  `tsdown` moved from 0.22.3 to 0.22.14 (and with it rolldown from 1.1.3 to 1.2.0), which changes the emitted output even for packages whose sources are untouched — rolldown hoists some expressions into local bindings, and declaration printing differs in where it wraps lines. Comparing every `dist` file against `main`, built twice per side to filter out the known non-reproducible declaration output, 56 packages differ across 59 `.d.mts`, 26 `.map`, 18 `.mjs` and 1 `.css` file, all of them incidental.

  A few packages here also carry a refreshed dependency range — `fs-extra` 11.4.0, `typescript-eslint` 8.65.0, `eslint-plugin-vue` 10.10.0, `@vanilla-extract/rollup-plugin` 1.5.4. Each stays within the major the previous range already allowed, so resolution does not change for anyone; the declarations are just brought back in line.

  These are published together so the incidental output differences are versioned explicitly, rather than riding along unannounced in whatever release happens to touch these packages next.

- Updated dependencies [[`05d8bb4`](https://github.com/dadajam4/fastkit/commit/05d8bb4385811b677e323d2137a6d0e8a65186c5), [`05d8bb4`](https://github.com/dadajam4/fastkit/commit/05d8bb4385811b677e323d2137a6d0e8a65186c5)]:
  - @fastkit/vue-scroller@0.18.2
  - @fastkit/helpers@0.16.2
  - @fastkit/tiny-logger@0.16.2
  - @fastkit/vue-body-scroll-lock@0.5.2
  - @fastkit/vue-resize@0.5.2
  - @fastkit/vue-utils@0.18.3

## 0.19.2

### Patch Changes

- [#166](https://github.com/dadajam4/fastkit/pull/166) [`88d561b`](https://github.com/dadajam4/fastkit/commit/88d561be563b26a9b1347f97b3eb9c21a3ef8730) Thanks [@dadajam4](https://github.com/dadajam4)! - Fix peer dependency ranges that had drifted behind the versions actually built against.

  - `vue-router`: widen the peer range from `^4.4.0` to `^4.4.0 || ^5.0.0` across the packages that declare it. Development moved to `vue-router@5.1.0`, but the peer range still only allowed the v4 major, which excluded v5 for consumers and pulled a stale `vue-router@4.6.4` into the lockfile via `@fastkit/vui-wysiwyg`. Both majors are now supported.
  - `@unhead/vue` (`@fastkit/vue-color-scheme`): bump the peer range from `^1.8.0` to `^3.0.0` to match the `3.1.3` version used in development. The previous range was two majors behind and emitted spurious peer warnings.

- Updated dependencies [[`88d561b`](https://github.com/dadajam4/fastkit/commit/88d561be563b26a9b1347f97b3eb9c21a3ef8730)]:
  - @fastkit/vue-utils@0.18.2

## 0.19.1

### Patch Changes

- [`d63b1af`](https://github.com/dadajam4/fastkit/commit/d63b1af8bf1bb131590ff540af82428cc60aeb7e) Thanks [@dadajam4](https://github.com/dadajam4)! - Strip the dangling `//# sourceMappingURL=*.d.mts.map` comment from emitted declaration files.

  tsdown (rolldown) appends this comment to every `.d.(m)ts` it emits but does not emit the referenced declaration map, so consumers' editors/build tools fail to resolve it. plugboy now removes the comment during build — but only when the referenced map is genuinely absent, so it becomes a no-op automatically if a future tsdown starts emitting real declaration maps.

  Every package in this monorepo is built by plugboy, so this patch re-publishes them all with declaration files that no longer point at a missing map.

- Updated dependencies [[`d63b1af`](https://github.com/dadajam4/fastkit/commit/d63b1af8bf1bb131590ff540af82428cc60aeb7e)]:
  - @fastkit/helpers@0.16.1
  - @fastkit/tiny-logger@0.16.1
  - @fastkit/vue-body-scroll-lock@0.5.1
  - @fastkit/vue-resize@0.5.1
  - @fastkit/vue-scroller@0.18.1
  - @fastkit/vue-utils@0.18.1

## 0.19.0

### Minor Changes

- [`b824e71`](https://github.com/dadajam4/fastkit/commit/b824e7136b57649d7958e257c21e8704267380e6) Thanks [@dadajam4](https://github.com/dadajam4)! - Release due to package bundler change. No functional changes included.

- Release accompanying the plugboy bundler migration (tsup → tsdown).

  No API changes are intended for this package. The minor bump exists because the package is rebuilt with the new bundler (tsdown / rolldown), and is published together so any incidental output differences are versioned explicitly.

### Patch Changes

- [`25602cb`](https://github.com/dadajam4/fastkit/commit/25602cbe1493cbeb10456b8b0e7680983d9e2ed7) Thanks [@dadajam4](https://github.com/dadajam4)! - Update dependencies and apply the associated fixes.

- Updated dependencies [[`b824e71`](https://github.com/dadajam4/fastkit/commit/b824e7136b57649d7958e257c21e8704267380e6), [`25602cb`](https://github.com/dadajam4/fastkit/commit/25602cbe1493cbeb10456b8b0e7680983d9e2ed7)]:
  - @fastkit/vue-body-scroll-lock@0.5.0
  - @fastkit/vue-scroller@0.18.0
  - @fastkit/tiny-logger@0.16.0
  - @fastkit/vue-resize@0.5.0
  - @fastkit/vue-utils@0.18.0
  - @fastkit/helpers@0.16.0

## 0.19.0-next.1

### Patch Changes

- Update dependencies and apply the associated fixes.

- Updated dependencies []:
  - @fastkit/vue-body-scroll-lock@0.5.0-next.1
  - @fastkit/vue-scroller@0.18.0-next.1
  - @fastkit/tiny-logger@0.16.0-next.1
  - @fastkit/vue-resize@0.5.0-next.1
  - @fastkit/vue-utils@0.18.0-next.1
  - @fastkit/helpers@0.16.0-next.1

## 0.19.0-next.0

### Minor Changes

- Release due to package bundler change. No functional changes included.

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-body-scroll-lock@0.5.0-next.0
  - @fastkit/vue-scroller@0.18.0-next.0
  - @fastkit/tiny-logger@0.16.0-next.0
  - @fastkit/vue-resize@0.5.0-next.0
  - @fastkit/vue-utils@0.18.0-next.0
  - @fastkit/helpers@0.16.0-next.0

## 0.18.0

### Minor Changes

- Updated native event types such as PointerEvent to align with changes in Vue 3.5.

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-body-scroll-lock@0.4.0
  - @fastkit/vue-scroller@0.17.0
  - @fastkit/vue-resize@0.4.0
  - @fastkit/vue-utils@0.17.0

## 0.17.0

### Minor Changes

- Updated major dependencies.

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-body-scroll-lock@0.3.0
  - @fastkit/vue-scroller@0.16.0
  - @fastkit/vue-resize@0.3.0
  - @fastkit/vue-utils@0.16.0
  - @fastkit/helpers@0.15.0
  - @fastkit/tiny-logger@0.15.0

## 0.16.3

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.13
  - @fastkit/vue-body-scroll-lock@0.2.14
  - @fastkit/vue-resize@0.2.13
  - @fastkit/vue-scroller@0.15.13

## 0.16.2

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.12
  - @fastkit/vue-body-scroll-lock@0.2.13
  - @fastkit/vue-resize@0.2.12
  - @fastkit/vue-scroller@0.15.12

## 0.16.1

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.11
  - @fastkit/vue-body-scroll-lock@0.2.12
  - @fastkit/vue-resize@0.2.11
  - @fastkit/vue-scroller@0.15.11

## 0.16.0

### Minor Changes

- [#148](https://github.com/dadajam4/fastkit/pull/148) [`8b66410`](https://github.com/dadajam4/fastkit/commit/8b66410e3423016c76956f772b86426dec99a0e7) Thanks [@nkenji09](https://github.com/nkenji09)! - 依存パッケージのアップデートを行いました

## 0.15.11

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.10
  - @fastkit/vue-body-scroll-lock@0.2.11
  - @fastkit/vue-resize@0.2.10
  - @fastkit/vue-scroller@0.15.10

## 0.15.10

### Patch Changes

- Dependency updates only.

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.9
  - @fastkit/helpers@0.14.5
  - @fastkit/vue-body-scroll-lock@0.2.10
  - @fastkit/vue-resize@0.2.9
  - @fastkit/vue-scroller@0.15.9
  - @fastkit/tiny-logger@0.14.5

## 0.15.9

### Patch Changes

- Updated dependencies.

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.8
  - @fastkit/vue-body-scroll-lock@0.2.9
  - @fastkit/vue-resize@0.2.8
  - @fastkit/vue-scroller@0.15.8

## 0.15.8

### Patch Changes

- Updated dependencies only.

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.7
  - @fastkit/vue-body-scroll-lock@0.2.8
  - @fastkit/vue-resize@0.2.7
  - @fastkit/vue-scroller@0.15.7

## 0.15.7

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.6
  - @fastkit/vue-body-scroll-lock@0.2.7
  - @fastkit/vue-resize@0.2.6
  - @fastkit/vue-scroller@0.15.6

## 0.15.6

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.14.4
  - @fastkit/tiny-logger@0.14.4
  - @fastkit/vue-body-scroll-lock@0.2.6
  - @fastkit/vue-resize@0.2.5
  - @fastkit/vue-utils@0.15.5
  - @fastkit/vue-scroller@0.15.5

## 0.15.5

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.14.3
  - @fastkit/tiny-logger@0.14.3
  - @fastkit/vue-body-scroll-lock@0.2.5
  - @fastkit/vue-resize@0.2.4
  - @fastkit/vue-utils@0.15.4
  - @fastkit/vue-scroller@0.15.4

## 0.15.4

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.14.2
  - @fastkit/tiny-logger@0.14.2
  - @fastkit/vue-body-scroll-lock@0.2.4
  - @fastkit/vue-resize@0.2.3
  - @fastkit/vue-utils@0.15.3
  - @fastkit/vue-scroller@0.15.3

## 0.15.3

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.2
  - @fastkit/vue-body-scroll-lock@0.2.3
  - @fastkit/vue-resize@0.2.2
  - @fastkit/vue-scroller@0.15.2

## 0.15.2

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-body-scroll-lock@0.2.2

## 0.15.1

### Patch Changes

- Reverted the removal of the `main` field that was introduced in the previous release and restored support for the old `moduleResolution`.

- Updated dependencies []:
  - @fastkit/vue-body-scroll-lock@0.2.1
  - @fastkit/vue-scroller@0.15.1
  - @fastkit/tiny-logger@0.14.1
  - @fastkit/vue-resize@0.2.1
  - @fastkit/vue-utils@0.15.1
  - @fastkit/helpers@0.14.1

## 0.15.0

### Minor Changes

- This release includes no functional changes, but it contains the following important updates:
  - Now adheres to ES Modules and the latest TypeScript standards, and the output for the `main` field and `typesVersions` is no longer generated.

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-body-scroll-lock@0.2.0
  - @fastkit/vue-scroller@0.15.0
  - @fastkit/tiny-logger@0.14.0
  - @fastkit/vue-resize@0.2.0
  - @fastkit/vue-utils@0.15.0
  - @fastkit/helpers@0.14.0

## 0.14.22

### Patch Changes

- Refactored internal implementation due to a review of ESLint rules, with no changes to the specifications.

- Updated dependencies []:
  - @fastkit/vue-body-scroll-lock@0.1.19
  - @fastkit/vue-scroller@0.14.21
  - @fastkit/vue-resize@0.1.19
  - @fastkit/vue-utils@0.14.17
  - @fastkit/helpers@0.13.8
  - @fastkit/tiny-logger@0.13.8

## 0.14.21

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.16
  - @fastkit/vue-body-scroll-lock@0.1.18
  - @fastkit/vue-resize@0.1.18
  - @fastkit/vue-scroller@0.14.20

## 0.14.20

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.15
  - @fastkit/vue-body-scroll-lock@0.1.17
  - @fastkit/vue-resize@0.1.17
  - @fastkit/vue-scroller@0.14.19

## 0.14.19

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.14
  - @fastkit/vue-body-scroll-lock@0.1.16
  - @fastkit/vue-resize@0.1.16
  - @fastkit/vue-scroller@0.14.18

## 0.14.18

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.13
  - @fastkit/vue-body-scroll-lock@0.1.15
  - @fastkit/vue-resize@0.1.15
  - @fastkit/vue-scroller@0.14.17

## 0.14.17

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.13.7
  - @fastkit/tiny-logger@0.13.7
  - @fastkit/vue-body-scroll-lock@0.1.14
  - @fastkit/vue-resize@0.1.14
  - @fastkit/vue-utils@0.14.12
  - @fastkit/vue-scroller@0.14.16

## 0.14.16

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.13.6
  - @fastkit/tiny-logger@0.13.6
  - @fastkit/vue-body-scroll-lock@0.1.13
  - @fastkit/vue-resize@0.1.13
  - @fastkit/vue-utils@0.14.11
  - @fastkit/vue-scroller@0.14.15

## 0.14.15

### Patch Changes

- Fixed typo in IF method.

  `calicurateViewHeight` to `calculateViewHeight`

## 0.14.14

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.13.5
  - @fastkit/tiny-logger@0.13.5
  - @fastkit/vue-body-scroll-lock@0.1.12
  - @fastkit/vue-resize@0.1.12
  - @fastkit/vue-utils@0.14.10
  - @fastkit/vue-scroller@0.14.14

## 0.14.13

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.13.4
  - @fastkit/tiny-logger@0.13.4
  - @fastkit/vue-body-scroll-lock@0.1.11
  - @fastkit/vue-resize@0.1.11
  - @fastkit/vue-utils@0.14.9
  - @fastkit/vue-scroller@0.14.13

## 0.14.12

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.8
  - @fastkit/vue-body-scroll-lock@0.1.10
  - @fastkit/vue-resize@0.1.10
  - @fastkit/vue-scroller@0.14.12

## 0.14.11

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.7
  - @fastkit/vue-body-scroll-lock@0.1.9
  - @fastkit/vue-resize@0.1.9
  - @fastkit/vue-scroller@0.14.11

## 0.14.10

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-scroller@0.14.10

## 0.14.9

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-scroller@0.14.9

## 0.14.8

### Patch Changes

- Various Typo corrections were made.

- Updated dependencies []:
  - @fastkit/vue-scroller@0.14.8

## 0.14.7

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.6
  - @fastkit/vue-body-scroll-lock@0.1.8
  - @fastkit/vue-resize@0.1.8
  - @fastkit/vue-scroller@0.14.7

## 0.14.6

### Patch Changes

- Updated dependencies [[`811800c`](https://github.com/dadajam4/fastkit/commit/811800c8aec5dc1236a887e35aa846560b8c40f7)]:
  - @fastkit/vue-utils@0.14.5
  - @fastkit/vue-body-scroll-lock@0.1.7
  - @fastkit/vue-resize@0.1.7
  - @fastkit/vue-scroller@0.14.6

## 0.14.5

### Patch Changes

- Updated dependencies [[`25885d2`](https://github.com/dadajam4/fastkit/commit/25885d2139c445478ce9aa7ff03539398f28cd55)]:
  - @fastkit/vue-utils@0.14.4
  - @fastkit/vue-body-scroll-lock@0.1.6
  - @fastkit/vue-resize@0.1.6
  - @fastkit/vue-scroller@0.14.5

## 0.14.4

### Patch Changes

- [#122](https://github.com/dadajam4/fastkit/pull/122) [`d0c96fa`](https://github.com/dadajam4/fastkit/commit/d0c96faf96b6c91bcb8bc0b1ca9d22fc8ede303e) Thanks [@dadajam4](https://github.com/dadajam4)! - Update major and non-major packages

- Updated dependencies [[`d0c96fa`](https://github.com/dadajam4/fastkit/commit/d0c96faf96b6c91bcb8bc0b1ca9d22fc8ede303e)]:
  - @fastkit/helpers@0.13.3
  - @fastkit/tiny-logger@0.13.3
  - @fastkit/vue-body-scroll-lock@0.1.5
  - @fastkit/vue-resize@0.1.5
  - @fastkit/vue-scroller@0.14.4
  - @fastkit/vue-utils@0.14.3

## 0.14.3

### Patch Changes

- Updated dependencies [[`5b881b9`](https://github.com/dadajam4/fastkit/commit/5b881b94ce1852c12cc3c8f6954564d5235cba4d)]:
  - @fastkit/tiny-logger@0.13.2
  - @fastkit/helpers@0.13.2
  - @fastkit/vue-scroller@0.14.3
  - @fastkit/vue-body-scroll-lock@0.1.4
  - @fastkit/vue-resize@0.1.4
  - @fastkit/vue-utils@0.14.2

## 0.14.2

### Patch Changes

- Updated dependencies [[`8e25df8`](https://github.com/dadajam4/fastkit/commit/8e25df840c83d63617f5f343939fc22abf06b4a0)]:
  - @fastkit/vue-utils@0.14.1
  - @fastkit/vue-body-scroll-lock@0.1.3
  - @fastkit/vue-resize@0.1.3
  - @fastkit/vue-scroller@0.14.2

## 0.14.1

### Patch Changes

- [#67](https://github.com/dadajam4/fastkit/pull/67) [`93488f2`](https://github.com/dadajam4/fastkit/commit/93488f21251f32ed5d577f854146815bd6307161) Thanks [@dadajam4](https://github.com/dadajam4)! - Rebuild in build dependency update.

- Updated dependencies [[`93488f2`](https://github.com/dadajam4/fastkit/commit/93488f21251f32ed5d577f854146815bd6307161)]:
  - @fastkit/vue-scroller@0.14.1

## 0.14.0

### Minor Changes

- [#39](https://github.com/dadajam4/fastkit/pull/39) [`40ee82f`](https://github.com/dadajam4/fastkit/commit/40ee82f4501b88e44ad9b67918df2237298493a0) Thanks [@dadajam4](https://github.com/dadajam4)! - Updated Vue to improve type support for slots, etc.
  This improvement is based on the following Vue.js 3.3 release

  https://blog.vuejs.org/posts/vue-3-3

### Patch Changes

- Updated dependencies [[`40ee82f`](https://github.com/dadajam4/fastkit/commit/40ee82f4501b88e44ad9b67918df2237298493a0)]:
  - @fastkit/vue-scroller@0.14.0
  - @fastkit/vue-utils@0.14.0
  - @fastkit/vue-body-scroll-lock@0.1.2
  - @fastkit/vue-resize@0.1.2

## 0.13.3

### Patch Changes

- [#33](https://github.com/dadajam4/fastkit/pull/33) [`dc6b10a4`](https://github.com/dadajam4/fastkit/commit/dc6b10a4d3279dd24de1f7f1b5113dcec52b63ad) Thanks [@dadajam4](https://github.com/dadajam4)! - Fixed the order of CSS layers.

## 0.13.2

### Patch Changes

- [#31](https://github.com/dadajam4/fastkit/pull/31) [`8e04503f`](https://github.com/dadajam4/fastkit/commit/8e04503f7acb585f50ceb482af0128e2263a94f9) Thanks [@dadajam4](https://github.com/dadajam4)! - A CSS layer has been added to vue-app-layout to properly override styles.

## 0.13.1

### Patch Changes

- Updated dependencies [[`3ed3703a`](https://github.com/dadajam4/fastkit/commit/3ed3703aa9092bf47caed6ec192ef4d5a7621d34)]:
  - @fastkit/helpers@0.13.1
  - @fastkit/tiny-logger@0.13.1
  - @fastkit/vue-body-scroll-lock@0.1.1
  - @fastkit/vue-resize@0.1.1
  - @fastkit/vue-utils@0.13.1
  - @fastkit/vue-scroller@0.13.1

## 0.13.0

### Minor Changes

- First Release in Repository Migration.
