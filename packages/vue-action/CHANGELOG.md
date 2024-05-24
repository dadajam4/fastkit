# @fastkit/vue-action

## 0.3.13

### Patch Changes

- Added provisional support for cases where the href cannot be obtained when used in conjunction with nuxt-i18n. This will be removed once it is improved in nuxt-i18n.

## 0.3.12

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.6

## 0.3.11

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.5

## 0.3.10

### Patch Changes

- Modified the handler registration for Route actions to only trigger on link clicks. This change facilitates easier integration with nuxtjs/i18n.

## 0.3.9

### Patch Changes

- Added feature: Custom function for adjusting RouteLocation can now be configured from the application. This facilitates easier setup when used in conjunction with modules like nuxtjs/i18n.

## 0.3.8

### Patch Changes

- Implemented functionality to enable setting up Vue application context in the attribute resolution handler.

## 0.3.7

### Patch Changes

- [`d7101e2`](https://github.com/dadajam4/fastkit/commit/d7101e2a5724f8f578c253c4f98de715b0949825) Thanks [@dadajam4](https://github.com/dadajam4)! - Added a helper function registerActionableAttrsResolver to customize all action attributes in the application.

## 0.3.6

### Patch Changes

- Fixed issue where clicking using the target attribute or control keys did not behave as expected.

## 0.3.5

### Patch Changes

- Fixed an issue where the `guardInProgressClass` was not being applied to elements.

## 0.3.4

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.4

## 0.3.3

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.3

## 0.3.2

### Patch Changes

- Added a utility for splitting and retrieving Action elements and other attributes.

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.2

## 0.3.1

### Patch Changes

- Reverted the removal of the `main` field that was introduced in the previous release and restored support for the old `moduleResolution`.

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.1

## 0.3.0

### Minor Changes

- This release includes no functional changes, but it contains the following important updates:

  - Now adheres to ES Modules and the latest TypeScript standards, and the output for the `main` field and `typesVersions` is no longer generated.

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.0

## 0.2.22

### Patch Changes

- Added a method to set the default value for the actionable class name at the application level.

## 0.2.21

### Patch Changes

- Refactored internal implementation due to a review of ESLint rules, with no changes to the specifications.

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.17

## 0.2.20

### Patch Changes

- Fixed cases where referencing the Vue Router instance on click was not possible. This was caused by timing issues with the internal invocation of `useRouter`.

## 0.2.19

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.16

## 0.2.18

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.15

## 0.2.17

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.14

## 0.2.16

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.13

## 0.2.15

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.12

## 0.2.14

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.11

## 0.2.13

### Patch Changes

- Improved behavior: Empty strings passed to boolean LIKE attributes will now be normalized to `true`. This addresses previous issues where attribute values could unexpectedly deviate from the expected outcome, especially when creating custom components that wrap the `VAction` component.

## 0.2.12

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.10

## 0.2.11

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.9

## 0.2.10

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.8

## 0.2.9

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.7

## 0.2.8

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.6

## 0.2.7

### Patch Changes

- [#138](https://github.com/dadajam4/fastkit/pull/138) [`811800c`](https://github.com/dadajam4/fastkit/commit/811800c8aec5dc1236a887e35aa846560b8c40f7) Thanks [@dadajam4](https://github.com/dadajam4)! - - Action guards can now be set.
  - Relative paths can now be specified as location paths.
- Updated dependencies [[`811800c`](https://github.com/dadajam4/fastkit/commit/811800c8aec5dc1236a887e35aa846560b8c40f7)]:
  - @fastkit/vue-utils@0.14.5

## 0.2.6

### Patch Changes

- Updated dependencies [[`25885d2`](https://github.com/dadajam4/fastkit/commit/25885d2139c445478ce9aa7ff03539398f28cd55)]:
  - @fastkit/vue-utils@0.14.4

## 0.2.5

### Patch Changes

- [#122](https://github.com/dadajam4/fastkit/pull/122) [`d0c96fa`](https://github.com/dadajam4/fastkit/commit/d0c96faf96b6c91bcb8bc0b1ca9d22fc8ede303e) Thanks [@dadajam4](https://github.com/dadajam4)! - Update major and non-major packages

- Updated dependencies [[`d0c96fa`](https://github.com/dadajam4/fastkit/commit/d0c96faf96b6c91bcb8bc0b1ca9d22fc8ede303e)]:
  - @fastkit/vue-utils@0.14.3

## 0.2.4

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.2

## 0.2.3

### Patch Changes

- [#77](https://github.com/dadajam4/fastkit/pull/77) [`1f8ee9e`](https://github.com/dadajam4/fastkit/commit/1f8ee9e42d4a1c8e0d627a2ccad56862694781ae) Thanks [@dadajam4](https://github.com/dadajam4)! - Fixed escaping of JSDoc html tag descriptions so that documents are properly displayed.

## 0.2.2

### Patch Changes

- Updated dependencies [[`8e25df8`](https://github.com/dadajam4/fastkit/commit/8e25df840c83d63617f5f343939fc22abf06b4a0)]:
  - @fastkit/vue-utils@0.14.1

## 0.2.1

### Patch Changes

- [#49](https://github.com/dadajam4/fastkit/pull/49) [`53af680`](https://github.com/dadajam4/fastkit/commit/53af680b854d7f5f86c36f1ab51e43043f49eaa5) Thanks [@dadajam4](https://github.com/dadajam4)! - Added JSDocs and improved code hints.

## 0.2.0

### Minor Changes

- [#39](https://github.com/dadajam4/fastkit/pull/39) [`40ee82f`](https://github.com/dadajam4/fastkit/commit/40ee82f4501b88e44ad9b67918df2237298493a0) Thanks [@dadajam4](https://github.com/dadajam4)! - Updated Vue to improve type support for slots, etc.
  This improvement is based on the following Vue.js 3.3 release

  https://blog.vuejs.org/posts/vue-3-3

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
