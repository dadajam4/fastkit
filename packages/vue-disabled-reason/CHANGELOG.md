# @fastkit/vue-disabled-reason

## 0.3.0

### Minor Changes

- [`b824e71`](https://github.com/dadajam4/fastkit/commit/b824e7136b57649d7958e257c21e8704267380e6) Thanks [@dadajam4](https://github.com/dadajam4)! - Release due to package bundler change. No functional changes included.

- Release accompanying the plugboy bundler migration (tsup → tsdown).

  No API changes are intended for this package. The minor bump exists because the package is rebuilt with the new bundler (tsdown / rolldown), and is published together so any incidental output differences are versioned explicitly.

### Patch Changes

- [`25602cb`](https://github.com/dadajam4/fastkit/commit/25602cbe1493cbeb10456b8b0e7680983d9e2ed7) Thanks [@dadajam4](https://github.com/dadajam4)! - Update dependencies and apply the associated fixes.

- Updated dependencies [[`b824e71`](https://github.com/dadajam4/fastkit/commit/b824e7136b57649d7958e257c21e8704267380e6), [`25602cb`](https://github.com/dadajam4/fastkit/commit/25602cbe1493cbeb10456b8b0e7680983d9e2ed7)]:
  - @fastkit/vue-utils@0.18.0

## 0.3.0-next.1

### Patch Changes

- Update dependencies and apply the associated fixes.

- Updated dependencies []:
  - @fastkit/vue-utils@0.18.0-next.1

## 0.3.0-next.0

### Minor Changes

- Release due to package bundler change. No functional changes included.

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.18.0-next.0

## 0.2.0

### Minor Changes

- Updated major dependencies.

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.17.0

## 0.1.0

### Minor Changes

- Updated major dependencies.

  This release also includes the following behavioral change:

  Previously, this package used only a single element specified with `data-disabled-reason-container` as the target for displaying the disabled reason. Starting with this version, **all child elements contained within the specified container** will act as targets. This change improves the UI for cases where multiple disabled child elements exist, such as in a group of checkboxes.

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.16.0

## 0.0.1

### Patch Changes

- First release.

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.13
