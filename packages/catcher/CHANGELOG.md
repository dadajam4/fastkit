# @fastkit/catcher

## 0.16.1

### Patch Changes

- [`d63b1af`](https://github.com/dadajam4/fastkit/commit/d63b1af8bf1bb131590ff540af82428cc60aeb7e) Thanks [@dadajam4](https://github.com/dadajam4)! - Strip the dangling `//# sourceMappingURL=*.d.mts.map` comment from emitted declaration files.

  tsdown (rolldown) appends this comment to every `.d.(m)ts` it emits but does not emit the referenced declaration map, so consumers' editors/build tools fail to resolve it. plugboy now removes the comment during build — but only when the referenced map is genuinely absent, so it becomes a no-op automatically if a future tsdown starts emitting real declaration maps.

  Every package in this monorepo is built by plugboy, so this patch re-publishes them all with declaration files that no longer point at a missing map.

- Updated dependencies [[`d63b1af`](https://github.com/dadajam4/fastkit/commit/d63b1af8bf1bb131590ff540af82428cc60aeb7e)]:
  - @fastkit/helpers@0.16.1

## 0.16.0

### Minor Changes

- [`b824e71`](https://github.com/dadajam4/fastkit/commit/b824e7136b57649d7958e257c21e8704267380e6) Thanks [@dadajam4](https://github.com/dadajam4)! - Release due to package bundler change. No functional changes included.

- Release accompanying the plugboy bundler migration (tsup → tsdown).

  No API changes are intended for this package. The minor bump exists because the package is rebuilt with the new bundler (tsdown / rolldown), and is published together so any incidental output differences are versioned explicitly.

### Patch Changes

- [`25602cb`](https://github.com/dadajam4/fastkit/commit/25602cbe1493cbeb10456b8b0e7680983d9e2ed7) Thanks [@dadajam4](https://github.com/dadajam4)! - Update dependencies and apply the associated fixes.

- Updated dependencies [[`b824e71`](https://github.com/dadajam4/fastkit/commit/b824e7136b57649d7958e257c21e8704267380e6), [`25602cb`](https://github.com/dadajam4/fastkit/commit/25602cbe1493cbeb10456b8b0e7680983d9e2ed7)]:
  - @fastkit/helpers@0.16.0

## 0.16.0-next.1

### Patch Changes

- Update dependencies and apply the associated fixes.

- Updated dependencies []:
  - @fastkit/helpers@0.16.0-next.1

## 0.16.0-next.0

### Minor Changes

- Release due to package bundler change. No functional changes included.

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.16.0-next.0

## 0.15.0

### Minor Changes

- Updated major dependencies.

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.15.0

## 0.14.7

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.14.5

## 0.14.6

### Patch Changes

- Updated dependencies only.

## 0.14.5

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.14.4

## 0.14.4

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.14.3

## 0.14.3

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.14.2

## 0.14.2

### Patch Changes

- Updated major dependencies.

## 0.14.1

### Patch Changes

- Reverted the removal of the `main` field that was introduced in the previous release and restored support for the old `moduleResolution`.

- Updated dependencies []:
  - @fastkit/helpers@0.14.1

## 0.14.0

### Minor Changes

- This release includes no functional changes, but it contains the following important updates:
  - Now adheres to ES Modules and the latest TypeScript standards, and the output for the `main` field and `typesVersions` is no longer generated.

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.14.0

## 0.13.15

### Patch Changes

- Refactored internal implementation due to a review of ESLint rules, with no changes to the specifications.

- Updated dependencies []:
  - @fastkit/helpers@0.13.8

## 0.13.14

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.13.7

## 0.13.13

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.13.6

## 0.13.12

### Patch Changes

- Fixed cases where information was missing for instance fields.
  - Resolved an issue where custom fields in the application were missing when enumerating keys for Catcher instances.
  - Addressed a situation where the stack of Catcher instances was missing when an empty stack was returned in the resolver.

## 0.13.11

### Patch Changes

- Addressed an issue where specifying override data during exception generation would result in invalid values being passed to the normalization function.

## 0.13.10

### Patch Changes

- Fixed an issue where the `unknown` exception argument was not being passed to the normalizer function.

## 0.13.9

### Patch Changes

- Fixed an issue where referencing `resolvedData` within the resolver function caused a RangeError due to an infinite loop.

## 0.13.8

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.13.5

## 0.13.7

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.13.4

## 0.13.6

### Patch Changes

- [#128](https://github.com/dadajam4/fastkit/pull/128) [`733de7f`](https://github.com/dadajam4/fastkit/commit/733de7fcc745933eca8b975aa80d8a78d23e6809) Thanks [@dadajam4](https://github.com/dadajam4)! - Export Native Error resolver type.

## 0.13.5

### Patch Changes

- [#122](https://github.com/dadajam4/fastkit/pull/122) [`d0c96fa`](https://github.com/dadajam4/fastkit/commit/d0c96faf96b6c91bcb8bc0b1ca9d22fc8ede303e) Thanks [@dadajam4](https://github.com/dadajam4)! - Update major and non-major packages

- Updated dependencies [[`d0c96fa`](https://github.com/dadajam4/fastkit/commit/d0c96faf96b6c91bcb8bc0b1ca9d22fc8ede303e)]:
  - @fastkit/helpers@0.13.3

## 0.13.4

### Patch Changes

- Updated dependencies [[`5b881b9`](https://github.com/dadajam4/fastkit/commit/5b881b94ce1852c12cc3c8f6954564d5235cba4d)]:
  - @fastkit/helpers@0.13.2

## 0.13.3

### Patch Changes

- [#116](https://github.com/dadajam4/fastkit/pull/116) [`1db21df`](https://github.com/dadajam4/fastkit/commit/1db21dfffd2df9b88bc481ff19e2a556f175e932) Thanks [@dadajam4](https://github.com/dadajam4)! - Enhanced comments by JSDocs for easier use in development.

## 0.13.2

### Patch Changes

- [#39](https://github.com/dadajam4/fastkit/pull/39) [`40ee82f`](https://github.com/dadajam4/fastkit/commit/40ee82f4501b88e44ad9b67918df2237298493a0) Thanks [@dadajam4](https://github.com/dadajam4)! - Dependencies have been updated.

## 0.13.1

### Patch Changes

- Updated dependencies [[`3ed3703a`](https://github.com/dadajam4/fastkit/commit/3ed3703aa9092bf47caed6ec192ef4d5a7621d34)]:
  - @fastkit/helpers@0.13.1

## 0.13.0

### Minor Changes

- First Release in Repository Migration.
