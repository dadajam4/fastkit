# @fastkit/plugboy

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
