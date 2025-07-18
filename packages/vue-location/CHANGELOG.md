# @fastkit/vue-location

## 0.4.2

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.12

## 0.4.1

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.11

## 0.4.0

### Minor Changes

- [#148](https://github.com/dadajam4/fastkit/pull/148) [`8b66410`](https://github.com/dadajam4/fastkit/commit/8b66410e3423016c76956f772b86426dec99a0e7) Thanks [@nkenji09](https://github.com/nkenji09)! - 依存パッケージのアップデートを行いました

## 0.3.7

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.10

## 0.3.6

### Patch Changes

- **Improved Query Submission Behavior**

  - Added `watchKey` to monitor the current query conditions.
  - Fixed an issue where submitting `undefined` did not update the query.
  - Queries now remove parameters if they match the default value during submission.

## 0.3.5

### Patch Changes

- Reset queries on route changes.

## 0.3.4

### Patch Changes

- Improved value change checks to ambiguously handle empty strings and nullable values.

## 0.3.3

### Patch Changes

- Fixed an issue where queries were not removed when null was specified using the merge option.

## 0.3.2

### Patch Changes

- Enabled reference to the state of queries during transitions.

## 0.3.1

### Patch Changes

- Fixed an issue where `TypedQueryForm.query` could not retrieve the current query values.

## 0.3.0

### Minor Changes

- Added TypedQueryForm for query operations linked with a form.

## 0.2.9

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.9

## 0.2.8

### Patch Changes

- Updated dependencies.

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.8

## 0.2.7

### Patch Changes

- Updated dependencies only.

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.7

## 0.2.6

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.6

## 0.2.5

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.5

## 0.2.4

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.4

## 0.2.3

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.3

## 0.2.2

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.2

## 0.2.1

### Patch Changes

- Reverted the removal of the `main` field that was introduced in the previous release and restored support for the old `moduleResolution`.

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.1

## 0.2.0

### Minor Changes

- This release includes no functional changes, but it contains the following important updates:

  - Now adheres to ES Modules and the latest TypeScript standards, and the output for the `main` field and `typesVersions` is no longer generated.

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.0

## 0.1.26

### Patch Changes

- Refactored internal implementation due to a review of ESLint rules, with no changes to the specifications.

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.17

## 0.1.25

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.16

## 0.1.24

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.15

## 0.1.23

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.14

## 0.1.22

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.13

## 0.1.21

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.12

## 0.1.20

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.11

## 0.1.19

### Patch Changes

- Updated the conditional logic in the `locationIsMatched()` method to prioritize the matching conditions of the query and hash values only when those values are specified in the current route. Previously, the method prioritized the current route's values in all cases.

## 0.1.18

### Patch Changes

- Added a method to check if the current route matches the specified location.

## 0.1.17

### Patch Changes

- Corrected an issue in which, when the default setting is a function, the function itself was mistakenly set as the default value instead of its return value.

## 0.1.16

### Patch Changes

- Type inference for cases where a function was specified for the default has been corrected.

## 0.1.15

### Patch Changes

- I have added an interface for manual export to the TypedQuery interface and an interface for referencing the latest extraction information.

## 0.1.14

### Patch Changes

- [#141](https://github.com/dadajam4/fastkit/pull/141) [`2018742`](https://github.com/dadajam4/fastkit/commit/2018742147de0e5fc94c1d83754abe27fed895b3) Thanks [@dadajam4](https://github.com/dadajam4)! - I have improved several interfaces and the behavior of query operations.

## 0.1.13

### Patch Changes

- Add Typed Query composables.

## 0.1.12

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.10

## 0.1.11

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.9

## 0.1.10

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.8

## 0.1.9

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.7

## 0.1.8

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.6

## 0.1.7

### Patch Changes

- Updated dependencies [[`811800c`](https://github.com/dadajam4/fastkit/commit/811800c8aec5dc1236a887e35aa846560b8c40f7)]:
  - @fastkit/vue-utils@0.14.5

## 0.1.6

### Patch Changes

- Updated dependencies [[`25885d2`](https://github.com/dadajam4/fastkit/commit/25885d2139c445478ce9aa7ff03539398f28cd55)]:
  - @fastkit/vue-utils@0.14.4

## 0.1.5

### Patch Changes

- [#122](https://github.com/dadajam4/fastkit/pull/122) [`d0c96fa`](https://github.com/dadajam4/fastkit/commit/d0c96faf96b6c91bcb8bc0b1ca9d22fc8ede303e) Thanks [@dadajam4](https://github.com/dadajam4)! - Update major and non-major packages

- Updated dependencies [[`d0c96fa`](https://github.com/dadajam4/fastkit/commit/d0c96faf96b6c91bcb8bc0b1ca9d22fc8ede303e)]:
  - @fastkit/vue-utils@0.14.3

## 0.1.4

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.2

## 0.1.3

### Patch Changes

- Updated dependencies [[`8e25df8`](https://github.com/dadajam4/fastkit/commit/8e25df840c83d63617f5f343939fc22abf06b4a0)]:
  - @fastkit/vue-utils@0.14.1

## 0.1.2

### Patch Changes

- Updated dependencies [[`40ee82f`](https://github.com/dadajam4/fastkit/commit/40ee82f4501b88e44ad9b67918df2237298493a0)]:
  - @fastkit/vue-utils@0.14.0

## 0.1.1

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.13.1

## 0.1.0

### Minor Changes

- First Release in Repository Migration.
