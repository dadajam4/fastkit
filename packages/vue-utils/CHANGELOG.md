# @fastkit/vue-utils

## 0.18.2

### Patch Changes

- [#166](https://github.com/dadajam4/fastkit/pull/166) [`88d561b`](https://github.com/dadajam4/fastkit/commit/88d561be563b26a9b1347f97b3eb9c21a3ef8730) Thanks [@dadajam4](https://github.com/dadajam4)! - Fix peer dependency ranges that had drifted behind the versions actually built against.

  - `vue-router`: widen the peer range from `^4.4.0` to `^4.4.0 || ^5.0.0` across the packages that declare it. Development moved to `vue-router@5.1.0`, but the peer range still only allowed the v4 major, which excluded v5 for consumers and pulled a stale `vue-router@4.6.4` into the lockfile via `@fastkit/vui-wysiwyg`. Both majors are now supported.
  - `@unhead/vue` (`@fastkit/vue-color-scheme`): bump the peer range from `^1.8.0` to `^3.0.0` to match the `3.1.3` version used in development. The previous range was two majors behind and emitted spurious peer warnings.

## 0.18.1

### Patch Changes

- [`d63b1af`](https://github.com/dadajam4/fastkit/commit/d63b1af8bf1bb131590ff540af82428cc60aeb7e) Thanks [@dadajam4](https://github.com/dadajam4)! - Strip the dangling `//# sourceMappingURL=*.d.mts.map` comment from emitted declaration files.

  tsdown (rolldown) appends this comment to every `.d.(m)ts` it emits but does not emit the referenced declaration map, so consumers' editors/build tools fail to resolve it. plugboy now removes the comment during build — but only when the referenced map is genuinely absent, so it becomes a no-op automatically if a future tsdown starts emitting real declaration maps.

  Every package in this monorepo is built by plugboy, so this patch re-publishes them all with declaration files that no longer point at a missing map.

- Updated dependencies [[`d63b1af`](https://github.com/dadajam4/fastkit/commit/d63b1af8bf1bb131590ff540af82428cc60aeb7e)]:
  - @fastkit/helpers@0.16.1
  - @fastkit/visibility@0.16.1

## 0.18.0

### Minor Changes

- [`b824e71`](https://github.com/dadajam4/fastkit/commit/b824e7136b57649d7958e257c21e8704267380e6) Thanks [@dadajam4](https://github.com/dadajam4)! - Release due to package bundler change. No functional changes included.

- Release accompanying the plugboy bundler migration (tsup → tsdown).

  No API changes are intended for this package. The minor bump exists because the package is rebuilt with the new bundler (tsdown / rolldown), and is published together so any incidental output differences are versioned explicitly.

### Patch Changes

- [`25602cb`](https://github.com/dadajam4/fastkit/commit/25602cbe1493cbeb10456b8b0e7680983d9e2ed7) Thanks [@dadajam4](https://github.com/dadajam4)! - Update dependencies and apply the associated fixes.

- Updated dependencies [[`b824e71`](https://github.com/dadajam4/fastkit/commit/b824e7136b57649d7958e257c21e8704267380e6), [`25602cb`](https://github.com/dadajam4/fastkit/commit/25602cbe1493cbeb10456b8b0e7680983d9e2ed7)]:
  - @fastkit/visibility@0.16.0
  - @fastkit/helpers@0.16.0
  - @fastkit/ts-type-utils@0.3.0

## 0.18.0-next.1

### Patch Changes

- Update dependencies and apply the associated fixes.

- Updated dependencies []:
  - @fastkit/ts-type-utils@0.2.2-next.0
  - @fastkit/visibility@0.16.0-next.1
  - @fastkit/helpers@0.16.0-next.1

## 0.18.0-next.0

### Minor Changes

- Release due to package bundler change. No functional changes included.

### Patch Changes

- Updated dependencies []:
  - @fastkit/visibility@0.16.0-next.0
  - @fastkit/helpers@0.16.0-next.0

## 0.17.0

### Minor Changes

- Updated major dependencies.

## 0.16.0

### Minor Changes

- Updated major dependencies.

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.15.0
  - @fastkit/visibility@0.15.0

## 0.15.13

### Patch Changes

- Added VNode search utilities.
  - `isElementVNode` - Utility function to check if a VNode corresponds to a real DOM element.
  - `findFirstDomVNode` - Recursively searches a VNode tree and returns the first DOM-backed VNode.

## 0.15.12

### Patch Changes

- Skip applying `withCtx` in `typedSlotWithCtx()` when the `slot` argument is not a function.

## 0.15.11

### Patch Changes

- **Added**: Several helper functions for type-safe slot handling.

## 0.15.10

### Patch Changes

- Added: List Item Enumeration Key Detector.
  Available via `useIterableKeyDetector()`.

## 0.15.9

### Patch Changes

- Added a utility (getClientIterableKey) for retrieving keys from object references when enumerating iterable objects.

- Updated dependencies []:
  - @fastkit/helpers@0.14.5
  - @fastkit/visibility@0.14.5

## 0.15.8

### Patch Changes

- Updated dependencies.

## 0.15.7

### Patch Changes

- Updated dependencies only.

## 0.15.6

### Patch Changes

- Added a helper function (`refsProxy`) for mixin operations after flattening multiple objects, `Ref`, and getters.

## 0.15.5

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.14.4
  - @fastkit/visibility@0.14.4

## 0.15.4

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.14.3
  - @fastkit/visibility@0.14.3

## 0.15.3

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.14.2
  - @fastkit/visibility@0.14.2

## 0.15.2

### Patch Changes

- Added a list of key HTML attributes for major elements.

## 0.15.1

### Patch Changes

- Reverted the removal of the `main` field that was introduced in the previous release and restored support for the old `moduleResolution`.

- Updated dependencies []:
  - @fastkit/visibility@0.14.1
  - @fastkit/helpers@0.14.1

## 0.15.0

### Minor Changes

- This release includes no functional changes, but it contains the following important updates:
  - Now adheres to ES Modules and the latest TypeScript standards, and the output for the `main` field and `typesVersions` is no longer generated.

### Patch Changes

- Updated dependencies []:
  - @fastkit/ts-type-utils@0.2.0
  - @fastkit/visibility@0.14.0
  - @fastkit/helpers@0.14.0

## 0.14.17

### Patch Changes

- Refactored internal implementation due to a review of ESLint rules, with no changes to the specifications.

- Updated dependencies []:
  - @fastkit/ts-type-utils@0.1.2
  - @fastkit/visibility@0.13.8
  - @fastkit/helpers@0.13.8

## 0.14.16

### Patch Changes

- Improved performance by immediately returning when the argument value is `null`, `""`, or `false` during the execution of `cleanupEmptyVNodeChild`.

## 0.14.15

### Patch Changes

- Now supports shorthand `emits` options with `EmitFn` and `EmitsToProps` types.

## 0.14.14

### Patch Changes

- Fixed an issue when using the `renderVNodeChildOrSlotsOrEmpty` method where empty content was not being cleaned up completely.

## 0.14.13

### Patch Changes

- Added the method `renderVNodeChildOrSlotsOrEmpty` for rendering a list of `VNodeChildOrSlots` while performing cleanup.

## 0.14.12

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.13.7
  - @fastkit/visibility@0.13.7

## 0.14.11

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.13.6
  - @fastkit/visibility@0.13.6

## 0.14.10

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.13.5
  - @fastkit/visibility@0.13.5

## 0.14.9

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.13.4
  - @fastkit/visibility@0.13.4

## 0.14.8

### Patch Changes

- Added a utility to override Type safe attribute objects passed to Vue components.

## 0.14.7

### Patch Changes

- Static custom IFs can now be defined for components with `defineTypedComponent`.

## 0.14.6

### Patch Changes

- Added utility type to change emit option to property IF.

## 0.14.5

### Patch Changes

- [#138](https://github.com/dadajam4/fastkit/pull/138) [`811800c`](https://github.com/dadajam4/fastkit/commit/811800c8aec5dc1236a887e35aa846560b8c40f7) Thanks [@dadajam4](https://github.com/dadajam4)! - Added utilities to extend component instance references and public IFs.

## 0.14.4

### Patch Changes

- [#132](https://github.com/dadajam4/fastkit/pull/132) [`25885d2`](https://github.com/dadajam4/fastkit/commit/25885d2139c445478ce9aa7ff03539398f28cd55) Thanks [@dadajam4](https://github.com/dadajam4)! - Added utilities to support emit-related definitions in Vue.

## 0.14.3

### Patch Changes

- [#122](https://github.com/dadajam4/fastkit/pull/122) [`d0c96fa`](https://github.com/dadajam4/fastkit/commit/d0c96faf96b6c91bcb8bc0b1ca9d22fc8ede303e) Thanks [@dadajam4](https://github.com/dadajam4)! - Update major and non-major packages

- Updated dependencies [[`d0c96fa`](https://github.com/dadajam4/fastkit/commit/d0c96faf96b6c91bcb8bc0b1ca9d22fc8ede303e)]:
  - @fastkit/helpers@0.13.3
  - @fastkit/visibility@0.13.3

## 0.14.2

### Patch Changes

- Updated dependencies [[`5b881b9`](https://github.com/dadajam4/fastkit/commit/5b881b94ce1852c12cc3c8f6954564d5235cba4d)]:
  - @fastkit/helpers@0.13.2
  - @fastkit/visibility@0.13.2

## 0.14.1

### Patch Changes

- [#73](https://github.com/dadajam4/fastkit/pull/73) [`8e25df8`](https://github.com/dadajam4/fastkit/commit/8e25df840c83d63617f5f343939fc22abf06b4a0) Thanks [@dadajam4](https://github.com/dadajam4)! - Added utilities for mocking various events of HTML elements to emits options of Vue components.

## 0.14.0

### Minor Changes

- [#39](https://github.com/dadajam4/fastkit/pull/39) [`40ee82f`](https://github.com/dadajam4/fastkit/commit/40ee82f4501b88e44ad9b67918df2237298493a0) Thanks [@dadajam4](https://github.com/dadajam4)! - Updated Vue to improve type support for slots, etc.
  This improvement is based on the following Vue.js 3.3 release

  https://blog.vuejs.org/posts/vue-3-3

## 0.13.1

### Patch Changes

- Updated dependencies [[`3ed3703a`](https://github.com/dadajam4/fastkit/commit/3ed3703aa9092bf47caed6ec192ef4d5a7621d34)]:
  - @fastkit/helpers@0.13.1
  - @fastkit/visibility@0.13.1

## 0.13.0

### Minor Changes

- First Release in Repository Migration.
