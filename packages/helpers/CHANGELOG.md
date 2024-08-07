# @fastkit/helpers

## 0.14.5

### Patch Changes

- Added a function (temporaryObjectID) to generate unique IDs from object references.

## 0.14.4

### Patch Changes

- Added multiple object mixin helper.

## 0.14.3

### Patch Changes

- Added a method `removeSpace` for removing all spaces and tab characters.

## 0.14.2

### Patch Changes

- Added support for setters to proxies generated by the mixin function.

## 0.14.1

### Patch Changes

- Reverted the removal of the `main` field that was introduced in the previous release and restored support for the old `moduleResolution`.

## 0.14.0

### Minor Changes

- This release includes no functional changes, but it contains the following important updates:

  - Now adheres to ES Modules and the latest TypeScript standards, and the output for the `main` field and `typesVersions` is no longer generated.

### Patch Changes

- Updated dependencies []:
  - @fastkit/ts-type-utils@0.2.0

## 0.13.8

### Patch Changes

- Refactored internal implementation due to a review of ESLint rules, with no changes to the specifications.

- Updated dependencies []:
  - @fastkit/ts-type-utils@0.1.2

## 0.13.7

### Patch Changes

- Added a helper for mixing in additional interfaces to objects.

## 0.13.6

### Patch Changes

- Implemented conversion of full-width whitespace to half-width in `toHalfWidth`.

## 0.13.5

### Patch Changes

- Added method (`omitProperties`) to omit partial properties from objects.

## 0.13.4

### Patch Changes

- Added method (`pickProperties`) to extract partial properties from objects.

## 0.13.3

### Patch Changes

- [#122](https://github.com/dadajam4/fastkit/pull/122) [`d0c96fa`](https://github.com/dadajam4/fastkit/commit/d0c96faf96b6c91bcb8bc0b1ca9d22fc8ede303e) Thanks [@dadajam4](https://github.com/dadajam4)! - Update major and non-major packages

- Updated dependencies [[`d0c96fa`](https://github.com/dadajam4/fastkit/commit/d0c96faf96b6c91bcb8bc0b1ca9d22fc8ede303e)]:
  - @fastkit/ts-type-utils@0.1.1

## 0.13.2

### Patch Changes

- [#120](https://github.com/dadajam4/fastkit/pull/120) [`5b881b9`](https://github.com/dadajam4/fastkit/commit/5b881b94ce1852c12cc3c8f6954564d5235cba4d) Thanks [@dadajam4](https://github.com/dadajam4)! - JSDocs were added and no-console lint improvements were made.

## 0.13.1

### Patch Changes

- [#24](https://github.com/dadajam4/fastkit/pull/24) [`3ed3703a`](https://github.com/dadajam4/fastkit/commit/3ed3703aa9092bf47caed6ec192ef4d5a7621d34) Thanks [@dadajam4](https://github.com/dadajam4)! - Added method for indentation normalization

## 0.13.0

### Minor Changes

- First Release in Repository Migration.
