# @fastkit/media-match-gen

## 1.3.2

### Patch Changes

- [#216](https://github.com/dadajam4/fastkit/pull/216) [`290746b`](https://github.com/dadajam4/fastkit/commit/290746bd9646f3978f6a3f34ebca2797e78a2574) Thanks [@dadajam4](https://github.com/dadajam4)! - Stop generating the deprecated Sass `if()` function

  The SCSS these two generators emit called Sass's `if()` in three places. Dart
  Sass now deprecates that syntax in favour of the CSS one, so every project
  building against a recent `sass` gets:

  ```
  DEPRECATION WARNING [if-function]: The Sass if() syntax is deprecated in favor of the modern CSS syntax.
  ```

  Sass reports the warning once per root stylesheet that reaches the generated
  file, so three call sites became 786 warnings in a real build (524 from
  `media-match.scss`, 262 from `color-scheme.scss`). Nothing was broken -- but the
  noise buried the warnings a project raised about its _own_ stylesheets, and the
  generated files are not editable downstream, leaving
  `silenceDeprecations: ['if-function']` as the only way out.

  The three calls are now `@if` / `@else` statements. The modern CSS-style
  `if(sass(cond): a; else: b)` would have worked too, but only on very recent Dart
  Sass; `@if` / `@else` has always been available, so the generated output stays
  compatible with the `sass` versions these packages already supported.

  The emitted CSS is byte-for-byte identical -- verified by compiling
  `@fastkit/vui`'s `after-effects.scss` (~500 KB of output, the heaviest `mq-each`
  consumer) and a stylesheet exercising `palette-border` in both branches against
  the old and new generators. Both packages now carry a test that compiles their
  generated SCSS and asserts Sass reports no deprecations.

  No action is needed beyond upgrading and regenerating.

## 1.3.1

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
  - @fastkit/node-util@0.17.1

## 1.3.0

### Minor Changes

- [#199](https://github.com/dadajam4/fastkit/pull/199) [`a879812`](https://github.com/dadajam4/fastkit/commit/a8798127ed358898d3e7315d54fff9f6d61e5838) Thanks [@dadajam4](https://github.com/dadajam4)! - Add `runtimeModule`, so the generated code can name a module the project already declares.

  The emitted `.ts` imported `registerMediaMatchConditions` from — and augmented — `@fastkit/media-match` by a hard-coded name. That file lands in the _consuming_ project, so the specifier resolves from there, and pnpm places into a project's `node_modules` only what the project itself declares. Naming the leaf package therefore forced every project to declare `@fastkit/media-match` as well.

  ```ts
  new MediaMatchGeneratorRunner({ src, dest, runtimeModule: '@acme/ui' });
  ```

  The module it names has to re-export `registerMediaMatchConditions`, `MediaMatchKey` and `MediaMatchKeyMap`. Module augmentation follows a re-export to the interface it aliases, so `MediaMatchKeyMap` still merges into the one `@fastkit/media-match` declares.

  The default is unchanged (`@fastkit/media-match`), so standalone use emits exactly what it did before.

  **`@fastkit/media-match` moves from `dependencies` to an optional peer dependency.** This package never imported it: the specifier existed only inside the emitted template, and what a package _emits_ is the consumer's to resolve. It is optional because a project that points `runtimeModule` elsewhere does not need it.

  Under pnpm nothing changes — a nested copy was never visible to the generated tree, so a project using the default already had to declare `@fastkit/media-match` itself. Under npm or Yarn it did resolve, by hoisting, and it will not any more: npm does not auto-install _optional_ peers. If you use this package standalone with the default `runtimeModule` on either, declare it:

  ```sh
  npm install @fastkit/media-match
  ```

### Patch Changes

- Updated dependencies [[`0c77aba`](https://github.com/dadajam4/fastkit/commit/0c77aba5e0256661de80a6e8c1f49515a73ea795), [`0c77aba`](https://github.com/dadajam4/fastkit/commit/0c77aba5e0256661de80a6e8c1f49515a73ea795), [`cb976bf`](https://github.com/dadajam4/fastkit/commit/cb976bf88268aca5d6101377644ec328e5730c02)]:
  - @fastkit/node-util@0.17.0
  - @fastkit/tiny-logger@0.16.3

## 1.2.2

### Patch Changes

- [#175](https://github.com/dadajam4/fastkit/pull/175) [`05d8bb4`](https://github.com/dadajam4/fastkit/commit/05d8bb4385811b677e323d2137a6d0e8a65186c5) Thanks [@dadajam4](https://github.com/dadajam4)! - Rebuild with the updated toolchain. No functional changes.

  `tsdown` moved from 0.22.3 to 0.22.14 (and with it rolldown from 1.1.3 to 1.2.0), which changes the emitted output even for packages whose sources are untouched — rolldown hoists some expressions into local bindings, and declaration printing differs in where it wraps lines. Comparing every `dist` file against `main`, built twice per side to filter out the known non-reproducible declaration output, 56 packages differ across 59 `.d.mts`, 26 `.map`, 18 `.mjs` and 1 `.css` file, all of them incidental.

  A few packages here also carry a refreshed dependency range — `fs-extra` 11.4.0, `typescript-eslint` 8.65.0, `eslint-plugin-vue` 10.10.0, `@vanilla-extract/rollup-plugin` 1.5.4. Each stays within the major the previous range already allowed, so resolution does not change for anyone; the declarations are just brought back in line.

  These are published together so the incidental output differences are versioned explicitly, rather than riding along unannounced in whatever release happens to touch these packages next.

- Updated dependencies [[`05d8bb4`](https://github.com/dadajam4/fastkit/commit/05d8bb4385811b677e323d2137a6d0e8a65186c5), [`05d8bb4`](https://github.com/dadajam4/fastkit/commit/05d8bb4385811b677e323d2137a6d0e8a65186c5)]:
  - @fastkit/node-util@0.16.2
  - @fastkit/ev@0.15.2
  - @fastkit/media-match@2.2.3
  - @fastkit/tiny-logger@0.16.2

## 1.2.1

### Patch Changes

- [`d63b1af`](https://github.com/dadajam4/fastkit/commit/d63b1af8bf1bb131590ff540af82428cc60aeb7e) Thanks [@dadajam4](https://github.com/dadajam4)! - Strip the dangling `//# sourceMappingURL=*.d.mts.map` comment from emitted declaration files.

  tsdown (rolldown) appends this comment to every `.d.(m)ts` it emits but does not emit the referenced declaration map, so consumers' editors/build tools fail to resolve it. plugboy now removes the comment during build — but only when the referenced map is genuinely absent, so it becomes a no-op automatically if a future tsdown starts emitting real declaration maps.

  Every package in this monorepo is built by plugboy, so this patch re-publishes them all with declaration files that no longer point at a missing map.

- Updated dependencies [[`d63b1af`](https://github.com/dadajam4/fastkit/commit/d63b1af8bf1bb131590ff540af82428cc60aeb7e)]:
  - @fastkit/ev@0.15.1
  - @fastkit/media-match@2.2.1
  - @fastkit/node-util@0.16.1
  - @fastkit/tiny-logger@0.16.1

## 1.2.0

### Minor Changes

- [`b824e71`](https://github.com/dadajam4/fastkit/commit/b824e7136b57649d7958e257c21e8704267380e6) Thanks [@dadajam4](https://github.com/dadajam4)! - Release due to package bundler change. No functional changes included.

- Release accompanying the plugboy bundler migration (tsup → tsdown).

  No API changes are intended for this package. The minor bump exists because the package is rebuilt with the new bundler (tsdown / rolldown), and is published together so any incidental output differences are versioned explicitly.

### Patch Changes

- [`25602cb`](https://github.com/dadajam4/fastkit/commit/25602cbe1493cbeb10456b8b0e7680983d9e2ed7) Thanks [@dadajam4](https://github.com/dadajam4)! - Update dependencies and apply the associated fixes.

- Updated dependencies [[`b824e71`](https://github.com/dadajam4/fastkit/commit/b824e7136b57649d7958e257c21e8704267380e6), [`25602cb`](https://github.com/dadajam4/fastkit/commit/25602cbe1493cbeb10456b8b0e7680983d9e2ed7)]:
  - @fastkit/media-match@2.2.0
  - @fastkit/tiny-logger@0.16.0
  - @fastkit/node-util@0.16.0
  - @fastkit/ev@0.15.0

## 1.2.0-next.1

### Patch Changes

- Update dependencies and apply the associated fixes.

- Updated dependencies []:
  - @fastkit/media-match@2.2.0-next.1
  - @fastkit/tiny-logger@0.16.0-next.1
  - @fastkit/node-util@0.16.0-next.1
  - @fastkit/ev@0.15.0-next.1

## 1.2.0-next.0

### Minor Changes

- Release due to package bundler change. No functional changes included.

### Patch Changes

- Updated dependencies []:
  - @fastkit/media-match@3.0.0-next.0
  - @fastkit/tiny-logger@0.16.0-next.0
  - @fastkit/node-util@0.16.0-next.0
  - @fastkit/ev@0.15.0-next.0

## 1.1.0

### Minor Changes

- Updated major dependencies.

### Patch Changes

- Updated dependencies []:
  - @fastkit/node-util@0.15.0
  - @fastkit/tiny-logger@0.15.0
  - @fastkit/media-match@2.1.0

## 1.0.0

### Major Changes

- [#153](https://github.com/dadajam4/fastkit/pull/153) [`2a9ac68`](https://github.com/dadajam4/fastkit/commit/2a9ac68653d4335d761d958a4061098218faaa0e) Thanks [@nkenji09](https://github.com/nkenji09)! - Now supports Vite 7 series

## 1.0.0-next.0

### Major Changes

- [#153](https://github.com/dadajam4/fastkit/pull/153) [`c650b4a`](https://github.com/dadajam4/fastkit/commit/c650b4a3813c891b5e21c6dd68cac981ac01d465) Thanks [@nkenji09](https://github.com/nkenji09)! - Now supports Vite 7 series

## 0.14.13

### Patch Changes

- Updated dependencies []:
  - @fastkit/node-util@0.14.11
  - @fastkit/media-match@2.0.7
  - @fastkit/tiny-logger@0.14.5

## 0.14.12

### Patch Changes

- Updated dependencies []:
  - @fastkit/node-util@0.14.10
  - @fastkit/media-match@2.0.6

## 0.14.11

### Patch Changes

- Updated dependencies []:
  - @fastkit/node-util@0.14.9
  - @fastkit/media-match@2.0.5

## 0.14.10

### Patch Changes

- Updated dependencies []:
  - @fastkit/media-match@2.0.4

## 0.14.9

### Patch Changes

- Updated dependencies []:
  - @fastkit/tiny-logger@0.14.4
  - @fastkit/node-util@0.14.8

## 0.14.8

### Patch Changes

- Updated dependencies []:
  - @fastkit/tiny-logger@0.14.3
  - @fastkit/node-util@0.14.7

## 0.14.7

### Patch Changes

- Updated dependencies []:
  - @fastkit/tiny-logger@0.14.2
  - @fastkit/node-util@0.14.6

## 0.14.6

### Patch Changes

- Updated dependencies []:
  - @fastkit/media-match@2.0.3

## 0.14.5

### Patch Changes

- Updated dependencies []:
  - @fastkit/node-util@0.14.5
  - @fastkit/media-match@2.0.2

## 0.14.4

### Patch Changes

- Updated dependencies []:
  - @fastkit/node-util@0.14.4

## 0.14.3

### Patch Changes

- Updated dependencies []:
  - @fastkit/node-util@0.14.3

## 0.14.2

### Patch Changes

- Updated dependencies []:
  - @fastkit/node-util@0.14.2

## 0.14.1

### Patch Changes

- Reverted the removal of the `main` field that was introduced in the previous release and restored support for the old `moduleResolution`.

- Updated dependencies []:
  - @fastkit/media-match@2.0.1
  - @fastkit/tiny-logger@0.14.1
  - @fastkit/node-util@0.14.1
  - @fastkit/ev@0.14.1

## 0.14.0

### Minor Changes

- This release includes no functional changes, but it contains the following important updates:
  - Now adheres to ES Modules and the latest TypeScript standards, and the output for the `main` field and `typesVersions` is no longer generated.

### Patch Changes

- Updated dependencies []:
  - @fastkit/media-match@2.0.0
  - @fastkit/tiny-logger@0.14.0
  - @fastkit/node-util@0.14.0
  - @fastkit/ev@0.14.0

## 0.13.15

### Patch Changes

- Refactored internal implementation due to a review of ESLint rules, with no changes to the specifications.

- Updated dependencies []:
  - @fastkit/media-match@1.0.10
  - @fastkit/node-util@0.13.9
  - @fastkit/ev@0.13.2
  - @fastkit/tiny-logger@0.13.8

## 0.13.14

### Patch Changes

- Updated dependencies []:
  - @fastkit/tiny-logger@0.13.7
  - @fastkit/node-util@0.13.8

## 0.13.13

### Patch Changes

- Updated dependencies []:
  - @fastkit/tiny-logger@0.13.6
  - @fastkit/node-util@0.13.7

## 0.13.12

### Patch Changes

- Updated dependencies []:
  - @fastkit/tiny-logger@0.13.5
  - @fastkit/node-util@0.13.6

## 0.13.11

### Patch Changes

- Updated dependencies []:
  - @fastkit/tiny-logger@0.13.4
  - @fastkit/node-util@0.13.5

## 0.13.10

### Patch Changes

- [#122](https://github.com/dadajam4/fastkit/pull/122) [`d0c96fa`](https://github.com/dadajam4/fastkit/commit/d0c96faf96b6c91bcb8bc0b1ca9d22fc8ede303e) Thanks [@dadajam4](https://github.com/dadajam4)! - Update major and non-major packages

- Updated dependencies [[`d0c96fa`](https://github.com/dadajam4/fastkit/commit/d0c96faf96b6c91bcb8bc0b1ca9d22fc8ede303e)]:
  - @fastkit/node-util@0.13.4
  - @fastkit/ev@0.13.1
  - @fastkit/media-match@1.0.9
  - @fastkit/tiny-logger@0.13.3

## 0.13.9

### Patch Changes

- Updated dependencies [[`5b881b9`](https://github.com/dadajam4/fastkit/commit/5b881b94ce1852c12cc3c8f6954564d5235cba4d)]:
  - @fastkit/tiny-logger@0.13.2
  - @fastkit/node-util@0.13.3
  - @fastkit/media-match@1.0.8

## 0.13.8

### Patch Changes

- Updated dependencies []:
  - @fastkit/media-match@1.0.7

## 0.13.7

### Patch Changes

- Updated dependencies []:
  - @fastkit/media-match@1.0.6

## 0.13.6

### Patch Changes

- Updated dependencies [[`40ee82f`](https://github.com/dadajam4/fastkit/commit/40ee82f4501b88e44ad9b67918df2237298493a0)]:
  - @fastkit/node-util@0.13.2
  - @fastkit/media-match@1.0.5

## 0.13.5

### Patch Changes

- Updated dependencies []:
  - @fastkit/media-match@1.0.4

## 0.13.4

### Patch Changes

- Updated dependencies []:
  - @fastkit/media-match@1.0.3

## 0.13.3

### Patch Changes

- Updated dependencies []:
  - @fastkit/media-match@1.0.2

## 0.13.2

### Patch Changes

- Updated dependencies []:
  - @fastkit/tiny-logger@0.13.1
  - @fastkit/node-util@0.13.1

## 0.13.1

### Patch Changes

- Updated dependencies []:
  - @fastkit/media-match@1.0.1

## 0.13.0

### Minor Changes

- First Release in Repository Migration.
