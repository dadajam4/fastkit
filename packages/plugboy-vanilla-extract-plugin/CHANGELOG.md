# @fastkit/plugboy-vanilla-extract-plugin

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
