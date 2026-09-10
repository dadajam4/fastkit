# @fastkit/plugboy-sass-plugin

## 3.0.3

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

## 3.0.2

### Patch Changes

- [#175](https://github.com/dadajam4/fastkit/pull/175) [`05d8bb4`](https://github.com/dadajam4/fastkit/commit/05d8bb4385811b677e323d2137a6d0e8a65186c5) Thanks [@dadajam4](https://github.com/dadajam4)! - Emit Sass stylesheets in a deterministic order.

  `rollup-plugin-sass` appends each stylesheet to a flat array from its `transform` hook and joins that array as-is. rolldown runs `transform` concurrently, so the array ended up in whatever order the transforms happened to finish, and building the same sources twice produced CSS with the rule blocks in a different order — which matters, because that order is the cascade order. Building this repo three times produced three different `vui.css` files.

  The plugin now joins the collected entries in the bundle's module execution order, which is already stable. Every stylesheet is a module in the graph, so the order is fully determined; anything the graph does not account for keeps its collected order, after the entries that could be placed.

  No rules are added, removed or rewritten — only reordered. This was verified during the build for all five affected packages: the byte length is unchanged and the set of rule blocks is an exact permutation of the previous output. The patch bumps for the CSS-emitting packages are there because their published `.css` changes order.

## 3.0.1

### Patch Changes

- [`d63b1af`](https://github.com/dadajam4/fastkit/commit/d63b1af8bf1bb131590ff540af82428cc60aeb7e) Thanks [@dadajam4](https://github.com/dadajam4)! - Strip the dangling `//# sourceMappingURL=*.d.mts.map` comment from emitted declaration files.

  tsdown (rolldown) appends this comment to every `.d.(m)ts` it emits but does not emit the referenced declaration map, so consumers' editors/build tools fail to resolve it. plugboy now removes the comment during build — but only when the referenced map is genuinely absent, so it becomes a no-op automatically if a future tsdown starts emitting real declaration maps.

  Every package in this monorepo is built by plugboy, so this patch re-publishes them all with declaration files that no longer point at a missing map.

## 3.0.0

### Major Changes

- [`b824e71`](https://github.com/dadajam4/fastkit/commit/b824e7136b57649d7958e257c21e8704267380e6) Thanks [@dadajam4](https://github.com/dadajam4)! - Contains fixes to follow the internal bundler change in plugboy.

- Major release: the plugboy toolchain migrates its internal bundler from **tsup (esbuild)** to **tsdown (rolldown)**.

  This is a large change that affects the workspace config schema, the plugin-authoring API, and several output details. See the migration guide for what changed and the steps to upgrade:

  https://github.com/dadajam4/fastkit/blob/main/packages/plugboy/docs/migrations/v1.md

### Patch Changes

- [`25602cb`](https://github.com/dadajam4/fastkit/commit/25602cbe1493cbeb10456b8b0e7680983d9e2ed7) Thanks [@dadajam4](https://github.com/dadajam4)! - Update dependencies and apply the associated fixes.

## 3.0.0-next.1

### Patch Changes

- Update dependencies and apply the associated fixes.

## 3.0.0-next.0

### Major Changes

- Contains fixes to follow the internal bundler change in plugboy.

### Patch Changes

- Updated dependencies []:
  - @fastkit/plugboy@1.0.0-next.0

## 2.2.0

### Minor Changes

- Updated major dependencies.

## 2.1.0

### Minor Changes

- Updated major dependencies.

### Patch Changes

- Updated dependencies []:
  - @fastkit/plugboy@0.3.0

## 2.0.7

### Patch Changes

- Dependency updates only.

- Updated dependencies []:
  - @fastkit/plugboy@0.2.7

## 2.0.6

### Patch Changes

- Updated dependencies.

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

## 1.0.10

### Patch Changes

- Refactored internal implementation due to a review of ESLint rules, with no changes to the specifications.

- Updated dependencies []:
  - @fastkit/plugboy@0.1.10

## 1.0.9

### Patch Changes

- [#122](https://github.com/dadajam4/fastkit/pull/122) [`d0c96fa`](https://github.com/dadajam4/fastkit/commit/d0c96faf96b6c91bcb8bc0b1ca9d22fc8ede303e) Thanks [@dadajam4](https://github.com/dadajam4)! - Update major and non-major packages

- Updated dependencies [[`d0c96fa`](https://github.com/dadajam4/fastkit/commit/d0c96faf96b6c91bcb8bc0b1ca9d22fc8ede303e)]:
  - @fastkit/plugboy@0.1.9

## 1.0.8

### Patch Changes

- Updated dependencies [[`5b881b9`](https://github.com/dadajam4/fastkit/commit/5b881b94ce1852c12cc3c8f6954564d5235cba4d)]:
  - @fastkit/plugboy@0.1.8

## 1.0.7

### Patch Changes

- Updated dependencies [[`4a974d2`](https://github.com/dadajam4/fastkit/commit/4a974d2bc85767048abcc4ed8294058d19ebfb0f)]:
  - @fastkit/plugboy@0.1.7

## 1.0.6

### Patch Changes

- Updated dependencies [[`93488f2`](https://github.com/dadajam4/fastkit/commit/93488f21251f32ed5d577f854146815bd6307161)]:
  - @fastkit/plugboy@0.1.6

## 1.0.5

### Patch Changes

- [#39](https://github.com/dadajam4/fastkit/pull/39) [`40ee82f`](https://github.com/dadajam4/fastkit/commit/40ee82f4501b88e44ad9b67918df2237298493a0) Thanks [@dadajam4](https://github.com/dadajam4)! - Dependencies have been updated.

- Updated dependencies [[`40ee82f`](https://github.com/dadajam4/fastkit/commit/40ee82f4501b88e44ad9b67918df2237298493a0)]:
  - @fastkit/plugboy@0.1.5

## 1.0.4

### Patch Changes

- Updated dependencies [[`50e81c9`](https://github.com/dadajam4/fastkit/commit/50e81c949e0e99c54ffe227e3274826ed31c04af)]:
  - @fastkit/plugboy@0.1.4

## 1.0.3

### Patch Changes

- Updated dependencies [[`dc6b10a4`](https://github.com/dadajam4/fastkit/commit/dc6b10a4d3279dd24de1f7f1b5113dcec52b63ad)]:
  - @fastkit/plugboy@0.1.3

## 1.0.2

### Patch Changes

- Updated dependencies [[`8e04503f`](https://github.com/dadajam4/fastkit/commit/8e04503f7acb585f50ceb482af0128e2263a94f9)]:
  - @fastkit/plugboy@0.1.2

## 1.0.1

### Patch Changes

- Updated dependencies [[`8bbadb71`](https://github.com/dadajam4/fastkit/commit/8bbadb7102edbc2bf89df54268c12be5435d5241)]:
  - @fastkit/plugboy@0.1.1

## 1.0.0

### Minor Changes

- First Release in Repository Migration.
