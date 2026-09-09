# @fastkit/vot

## 1.4.0

### Minor Changes

- [#203](https://github.com/dadajam4/fastkit/pull/203) [`b9fc3af`](https://github.com/dadajam4/fastkit/commit/b9fc3afdc5d34c18f6ff7a1bb8d87b831caa79f9) Thanks [@dadajam4](https://github.com/dadajam4)! - Take `vue`, `vue-router` and `@types/node` as `peerDependencies`, and expose the head API from a new `@fastkit/vot/head` subpath.

  `dependencies` was the wrong side for all three. A consumer has to declare `vue` and `vue-router` anyway — it writes components and routes — so holding them here bought nothing on the resolution side while giving up the **single-instance guarantee**, and `@types/node` forced this package's choice of Node types onto a project whose runtime it knows nothing about.

  **`vue` and `vue-router` → peers** (`^3.5.0`, `^4.4.0 || ^5.0.0`). Both are real value imports in the published `dist/vot.mjs`: `createApp`/`createSSRApp`/`h`/`inject` from `vue`, `createRouter`/`createWebHistory`/`createMemoryHistory` from `vue-router`. So this package calls into whichever copy it resolves. Where its range and the consumer's failed to intersect, the two resolved separately and the result was two reactivity systems in one process — `provide`/`inject` across the boundary stopped resolving, `app.use()` landed on the wrong instance — plus `Type 'Router' is not assignable to type 'Router'` wherever Vue's types use `unique symbol`s or declaration merging. A peer declaration is what makes pnpm link the consumer's copy, so the situation cannot arise.

  **`@types/node` → peer** (`>=20`). The published `.d.mts` exposes `IncomingMessage`, `ServerResponse` and `Server` from `node:http`, so a consumer's `tsc` must resolve Node's types — but they are only meaningful if they match the Node the consumer actually runs, and a `dependency` left no way to say so. A project on Node 20 that upgraded got `@types/node@^24` pulled in and its types ran two majors ahead of its runtime. The range is deliberately open at the top: unlike a library API, this declares _which Node's types_, and capping it would push consumers off newer Node for no benefit — `node:http` is all this package needs from it.

  **`express` stays a `dependency`.** It appears nowhere in the published type surface and has no instance-identity requirement; the server internals are this package's business.

  **`@unhead/vue` also stays a `dependency`, and is now re-exported from `@fastkit/vot/head`.** This package installs unhead into the application itself, so an application only ever needs `useHead` and the input types. Reaching them through `@unhead/vue` directly meant declaring it and keeping its range aligned with the copy resolved here — and unhead's Vue composables read the client out of Vue's injection context, so a second copy with a different `headSymbol` resolves nothing and `useHead` silently stops applying. The subpath removes the declaration and keeps `@unhead/vue`, `unhead` and the SSR renderer versioned together, which is where that decision belongs.

  **Migration.** Declare the three peers:

  ```sh
  pnpm add vue vue-router
  pnpm add -D @types/node
  ```

  In practice a project already declares `vue` and `vue-router` — it imports them in its own components. Projects relying on `shamefully-hoist=true` and never declaring them will see a `missing peer dependency` warning until they do.

  Optionally, drop `@unhead/vue` and import the head API from here instead:

  ```diff
  -import { useHead, type ReactiveHead } from '@unhead/vue';
  +import { useHead, type ReactiveHead } from '@fastkit/vot/head';
  ```

  ```sh
  pnpm remove @unhead/vue
  ```

## 1.3.3

### Patch Changes

- [#199](https://github.com/dadajam4/fastkit/pull/199) [`a879812`](https://github.com/dadajam4/fastkit/commit/a8798127ed358898d3e7315d54fff9f6d61e5838) Thanks [@dadajam4](https://github.com/dadajam4)! - Fix `vot generate`, which could not start.

  `bin/generate.mjs` imported the CLI without a file extension:

  ```js
  import { cli } from '../dist/tool';
  ```

  ESM does no extension guessing, so Node threw before anything ran:

  ```
  Error [ERR_MODULE_NOT_FOUND]: Cannot find module '.../packages/vot/dist/tool'
    imported from .../packages/vot/bin/generate.mjs
  ```

  `bin/build.mjs` and `bin/dev.mjs` name `../dist/tool.mjs` correctly; only this one did not, so `vot dev`, `vot build` and `vot serve` were unaffected and `vot generate` had never worked. Present since the first commit.

- Updated dependencies [[`d224120`](https://github.com/dadajam4/fastkit/commit/d224120639a248468c69d83f2791983cb61c248c)]:
  - @fastkit/helpers@0.17.0
  - @fastkit/vue-page@0.18.4
  - @fastkit/vue-utils@0.18.4

## 1.3.2

### Patch Changes

- [#175](https://github.com/dadajam4/fastkit/pull/175) [`05d8bb4`](https://github.com/dadajam4/fastkit/commit/05d8bb4385811b677e323d2137a6d0e8a65186c5) Thanks [@dadajam4](https://github.com/dadajam4)! - Fix SSR breaking with Vue 3.5.40 or newer. That release removed the `vue` peerDependency from `@vue/server-renderer` and made `@vue/runtime-dom` a plain dependency instead ([vuejs/core#15063](https://github.com/vuejs/core/pull/15063)). Because the SSR build keeps `vue` external while bundling `@vue/*`, server-renderer started pulling in its own copy of the runtime, leaving two Vue instances in one process — rendering then failed with `resolveDirective can only be used in render() or setup()` warnings followed by `TypeError: Cannot read properties of null (reading 'ce')`. A `vite:vot-vue-runtime-dom` plugin now redirects `@vue/runtime-dom` back to `vue` during SSR resolution, restoring the single-instance topology. `vue` re-exports every symbol server-renderer needs, and the change requires no additional dependencies on the consumer side.

- Updated dependencies [[`05d8bb4`](https://github.com/dadajam4/fastkit/commit/05d8bb4385811b677e323d2137a6d0e8a65186c5)]:
  - @fastkit/helpers@0.16.2
  - @fastkit/vue-utils@0.18.3
  - @fastkit/vue-page@0.18.3

## 1.3.1

### Patch Changes

- [`d63b1af`](https://github.com/dadajam4/fastkit/commit/d63b1af8bf1bb131590ff540af82428cc60aeb7e) Thanks [@dadajam4](https://github.com/dadajam4)! - Strip the dangling `//# sourceMappingURL=*.d.mts.map` comment from emitted declaration files.

  tsdown (rolldown) appends this comment to every `.d.(m)ts` it emits but does not emit the referenced declaration map, so consumers' editors/build tools fail to resolve it. plugboy now removes the comment during build — but only when the referenced map is genuinely absent, so it becomes a no-op automatically if a future tsdown starts emitting real declaration maps.

  Every package in this monorepo is built by plugboy, so this patch re-publishes them all with declaration files that no longer point at a missing map.

- Updated dependencies [[`d63b1af`](https://github.com/dadajam4/fastkit/commit/d63b1af8bf1bb131590ff540af82428cc60aeb7e)]:
  - @fastkit/helpers@0.16.1
  - @fastkit/vue-page@0.18.1
  - @fastkit/vue-utils@0.18.1

## 1.3.0

### Minor Changes

- [`b824e71`](https://github.com/dadajam4/fastkit/commit/b824e7136b57649d7958e257c21e8704267380e6) Thanks [@dadajam4](https://github.com/dadajam4)! - Release due to package bundler change. No functional changes included.

- Release accompanying the plugboy bundler migration (tsup → tsdown).

  No API changes are intended for this package. The minor bump exists because the package is rebuilt with the new bundler (tsdown / rolldown), and is published together so any incidental output differences are versioned explicitly.

### Patch Changes

- [`25602cb`](https://github.com/dadajam4/fastkit/commit/25602cbe1493cbeb10456b8b0e7680983d9e2ed7) Thanks [@dadajam4](https://github.com/dadajam4)! - Update dependencies and apply the associated fixes.

- Updated dependencies [[`b824e71`](https://github.com/dadajam4/fastkit/commit/b824e7136b57649d7958e257c21e8704267380e6), [`25602cb`](https://github.com/dadajam4/fastkit/commit/25602cbe1493cbeb10456b8b0e7680983d9e2ed7)]:
  - @fastkit/vue-utils@0.18.0
  - @fastkit/vue-page@0.18.0
  - @fastkit/helpers@0.16.0

## 1.3.0-next.1

### Patch Changes

- Update dependencies and apply the associated fixes.

- Updated dependencies []:
  - @fastkit/vue-utils@0.18.0-next.1
  - @fastkit/vue-page@0.18.0-next.1
  - @fastkit/helpers@0.16.0-next.1

## 1.3.0-next.0

### Minor Changes

- Release due to package bundler change. No functional changes included.

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.18.0-next.0
  - @fastkit/vue-page@0.18.0-next.0
  - @fastkit/helpers@0.16.0-next.0

## 1.2.0

### Minor Changes

- Updated major dependencies.

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.17.0
  - @fastkit/vue-page@0.16.1

## 1.1.0

### Minor Changes

- Updated major dependencies.

  Accordingly, the page directory previously specified with `pagesDir` must now be changed to `dirs`.

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.16.0
  - @fastkit/vue-page@0.16.0
  - @fastkit/helpers@0.15.0

## 1.0.0

### Major Changes

- [#153](https://github.com/dadajam4/fastkit/pull/153) [`2a9ac68`](https://github.com/dadajam4/fastkit/commit/2a9ac68653d4335d761d958a4061098218faaa0e) Thanks [@nkenji09](https://github.com/nkenji09)! - Now supports Vite 7 series

## 1.0.0-next.0

### Major Changes

- [#153](https://github.com/dadajam4/fastkit/pull/153) [`c650b4a`](https://github.com/dadajam4/fastkit/commit/c650b4a3813c891b5e21c6dd68cac981ac01d465) Thanks [@nkenji09](https://github.com/nkenji09)! - Now supports Vite 7 series

## 0.17.3

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.13
  - @fastkit/vue-page@0.15.14

## 0.17.2

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.12
  - @fastkit/vue-page@0.15.13

## 0.17.1

### Patch Changes

- **Fixed**: Warning shown when slot functions were executed outside of their rendering scope.

- Updated dependencies []:
  - @fastkit/vue-page@0.15.12
  - @fastkit/vue-utils@0.15.11

## 0.17.0

### Minor Changes

- [#148](https://github.com/dadajam4/fastkit/pull/148) [`8b66410`](https://github.com/dadajam4/fastkit/commit/8b66410e3423016c76956f772b86426dec99a0e7) Thanks [@nkenji09](https://github.com/nkenji09)! - 依存パッケージのアップデートを行いました

## 0.16.13

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.10
  - @fastkit/vue-page@0.15.11

## 0.16.12

### Patch Changes

- Dependency updates only.

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.9
  - @fastkit/helpers@0.14.5
  - @fastkit/vue-page@0.15.10

## 0.16.11

### Patch Changes

- Updated dependencies.

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.8
  - @fastkit/vue-page@0.15.9

## 0.16.10

### Patch Changes

- Updated dependencies.

- Updated dependencies []:
  - @fastkit/vue-page@0.15.8

## 0.16.9

### Patch Changes

- Updated dependencies only.

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.7
  - @fastkit/vue-page@0.15.7

## 0.16.8

### Patch Changes

- [#146](https://github.com/dadajam4/fastkit/pull/146) [`38c99c8`](https://github.com/dadajam4/fastkit/commit/38c99c8d34c434a4acd1df802453b1009cc4009b) Thanks [@dadajam4](https://github.com/dadajam4)! - We have addressed the issue of potential failure when generating a large number of pages simultaneously during static generation by limiting the number of pages generated at once.

## 0.16.7

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.6
  - @fastkit/vue-page@0.15.6

## 0.16.6

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.14.4
  - @fastkit/vue-page@0.15.5
  - @fastkit/vue-utils@0.15.5

## 0.16.5

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.14.3
  - @fastkit/vue-page@0.15.4
  - @fastkit/vue-utils@0.15.4

## 0.16.4

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.14.2
  - @fastkit/vue-page@0.15.3
  - @fastkit/vue-utils@0.15.3

## 0.16.3

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.2
  - @fastkit/vue-page@0.15.2

## 0.16.2

### Patch Changes

- Updated major dependencies.

## 0.16.1

### Patch Changes

- Reverted the removal of the `main` field that was introduced in the previous release and restored support for the old `moduleResolution`.

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.1
  - @fastkit/vue-page@0.15.1
  - @fastkit/helpers@0.14.1

## 0.16.0

### Minor Changes

- Updated Vite to version 5.

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.0
  - @fastkit/vue-page@0.15.0
  - @fastkit/helpers@0.14.0

## 0.15.17

### Patch Changes

- Refactored internal implementation due to a review of ESLint rules, with no changes to the specifications.

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.17
  - @fastkit/vue-page@0.14.17
  - @fastkit/helpers@0.13.8

## 0.15.16

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.16
  - @fastkit/vue-page@0.14.16

## 0.15.15

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.15
  - @fastkit/vue-page@0.14.15

## 0.15.14

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.14
  - @fastkit/vue-page@0.14.14

## 0.15.13

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.13
  - @fastkit/vue-page@0.14.13

## 0.15.12

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.13.7
  - @fastkit/vue-page@0.14.12
  - @fastkit/vue-utils@0.14.12

## 0.15.11

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.13.6
  - @fastkit/vue-page@0.14.11
  - @fastkit/vue-utils@0.14.11

## 0.15.10

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.13.5
  - @fastkit/vue-page@0.14.10
  - @fastkit/vue-utils@0.14.10

## 0.15.9

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.13.4
  - @fastkit/vue-page@0.14.9
  - @fastkit/vue-utils@0.14.9

## 0.15.8

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.8
  - @fastkit/vue-page@0.14.8

## 0.15.7

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.7
  - @fastkit/vue-page@0.14.7

## 0.15.6

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.6
  - @fastkit/vue-page@0.14.6

## 0.15.5

### Patch Changes

- Updated dependencies [[`811800c`](https://github.com/dadajam4/fastkit/commit/811800c8aec5dc1236a887e35aa846560b8c40f7)]:
  - @fastkit/vue-utils@0.14.5
  - @fastkit/vue-page@0.14.5

## 0.15.4

### Patch Changes

- Updated dependencies [[`25885d2`](https://github.com/dadajam4/fastkit/commit/25885d2139c445478ce9aa7ff03539398f28cd55)]:
  - @fastkit/vue-utils@0.14.4
  - @fastkit/vue-page@0.14.4

## 0.15.3

### Patch Changes

- [#122](https://github.com/dadajam4/fastkit/pull/122) [`d0c96fa`](https://github.com/dadajam4/fastkit/commit/d0c96faf96b6c91bcb8bc0b1ca9d22fc8ede303e) Thanks [@dadajam4](https://github.com/dadajam4)! - Update major and non-major packages

- Updated dependencies [[`d0c96fa`](https://github.com/dadajam4/fastkit/commit/d0c96faf96b6c91bcb8bc0b1ca9d22fc8ede303e)]:
  - @fastkit/helpers@0.13.3
  - @fastkit/vue-page@0.14.3
  - @fastkit/vue-utils@0.14.3

## 0.15.2

### Patch Changes

- [#120](https://github.com/dadajam4/fastkit/pull/120) [`5b881b9`](https://github.com/dadajam4/fastkit/commit/5b881b94ce1852c12cc3c8f6954564d5235cba4d) Thanks [@dadajam4](https://github.com/dadajam4)! - JSDocs were added and no-console lint improvements were made.

- Updated dependencies [[`5b881b9`](https://github.com/dadajam4/fastkit/commit/5b881b94ce1852c12cc3c8f6954564d5235cba4d)]:
  - @fastkit/helpers@0.13.2
  - @fastkit/vue-page@0.14.2
  - @fastkit/vue-utils@0.14.2

## 0.15.1

### Patch Changes

- Updated dependencies [[`8e25df8`](https://github.com/dadajam4/fastkit/commit/8e25df840c83d63617f5f343939fc22abf06b4a0)]:
  - @fastkit/vue-utils@0.14.1
  - @fastkit/vue-page@0.14.1

## 0.15.0

### Minor Changes

- [#53](https://github.com/dadajam4/fastkit/pull/53) [`326fa29`](https://github.com/dadajam4/fastkit/commit/326fa29bf34fe8501be6c5a4fa190244d1068090) Thanks [@dadajam4](https://github.com/dadajam4)! - Migrated head to unhead package.

## 0.14.0

### Minor Changes

- [#39](https://github.com/dadajam4/fastkit/pull/39) [`40ee82f`](https://github.com/dadajam4/fastkit/commit/40ee82f4501b88e44ad9b67918df2237298493a0) Thanks [@dadajam4](https://github.com/dadajam4)! - Updated Vue to improve type support for slots, etc.
  This improvement is based on the following Vue.js 3.3 release

  https://blog.vuejs.org/posts/vue-3-3

### Patch Changes

- Updated dependencies [[`40ee82f`](https://github.com/dadajam4/fastkit/commit/40ee82f4501b88e44ad9b67918df2237298493a0)]:
  - @fastkit/vue-utils@0.14.0
  - @fastkit/vue-page@0.14.0

## 0.13.2

### Patch Changes

- Updated dependencies [[`3ed3703a`](https://github.com/dadajam4/fastkit/commit/3ed3703aa9092bf47caed6ec192ef4d5a7621d34)]:
  - @fastkit/helpers@0.13.1
  - @fastkit/vue-page@0.13.1
  - @fastkit/vue-utils@0.13.1

## 0.13.1

### Patch Changes

- [#15](https://github.com/dadajam4/fastkit/pull/15) [`9ac30980`](https://github.com/dadajam4/fastkit/commit/9ac30980a5ee468ae151a2c9fa1f0c5736e488d1) Thanks [@dadajam4](https://github.com/dadajam4)! - Fixed vot build command failure in generate mode on Node v18.

## 0.13.0

### Minor Changes

- First Release in Repository Migration.
