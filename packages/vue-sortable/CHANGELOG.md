# @fastkit/vue-sortable

## 0.3.1

### Patch Changes

- [`d63b1af`](https://github.com/dadajam4/fastkit/commit/d63b1af8bf1bb131590ff540af82428cc60aeb7e) Thanks [@dadajam4](https://github.com/dadajam4)! - Strip the dangling `//# sourceMappingURL=*.d.mts.map` comment from emitted declaration files.

  tsdown (rolldown) appends this comment to every `.d.(m)ts` it emits but does not emit the referenced declaration map, so consumers' editors/build tools fail to resolve it. plugboy now removes the comment during build — but only when the referenced map is genuinely absent, so it becomes a no-op automatically if a future tsdown starts emitting real declaration maps.

  Every package in this monorepo is built by plugboy, so this patch re-publishes them all with declaration files that no longer point at a missing map.

- Updated dependencies [[`d63b1af`](https://github.com/dadajam4/fastkit/commit/d63b1af8bf1bb131590ff540af82428cc60aeb7e)]:
  - @fastkit/helpers@0.16.1
  - @fastkit/vue-utils@0.18.1

## 0.3.0

### Minor Changes

- [`b824e71`](https://github.com/dadajam4/fastkit/commit/b824e7136b57649d7958e257c21e8704267380e6) Thanks [@dadajam4](https://github.com/dadajam4)! - Release due to package bundler change. No functional changes included.

- Release accompanying the plugboy bundler migration (tsup → tsdown).

  No API changes are intended for this package. The minor bump exists because the package is rebuilt with the new bundler (tsdown / rolldown), and is published together so any incidental output differences are versioned explicitly.

### Patch Changes

- [`25602cb`](https://github.com/dadajam4/fastkit/commit/25602cbe1493cbeb10456b8b0e7680983d9e2ed7) Thanks [@dadajam4](https://github.com/dadajam4)! - Update dependencies and apply the associated fixes.

- Updated dependencies [[`b824e71`](https://github.com/dadajam4/fastkit/commit/b824e7136b57649d7958e257c21e8704267380e6), [`25602cb`](https://github.com/dadajam4/fastkit/commit/25602cbe1493cbeb10456b8b0e7680983d9e2ed7)]:
  - @fastkit/vue-utils@0.18.0
  - @fastkit/helpers@0.16.0

## 0.3.0-next.1

### Patch Changes

- Update dependencies and apply the associated fixes.

- Updated dependencies []:
  - @fastkit/vue-utils@0.18.0-next.1
  - @fastkit/helpers@0.16.0-next.1

## 0.3.0-next.0

### Minor Changes

- Release due to package bundler change. No functional changes included.

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.18.0-next.0
  - @fastkit/helpers@0.16.0-next.0

## 0.2.0

### Minor Changes

- Updated major dependencies.

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.17.0

## 0.1.0

### Minor Changes

- Updated major dependencies.

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.16.0
  - @fastkit/helpers@0.15.0

## 0.0.8

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.13

## 0.0.7

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.12

## 0.0.6

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.11

## 0.0.5

### Patch Changes

- I've implemented a temporary fix for the issue where MultiDrag fails to mount in execution environments such as Vitest.

## 0.0.4

### Patch Changes

- Apply dragging className for body.

## 0.0.3

### Patch Changes

- Fixed an issue where the item type was not applied to slots within Vue file templates.

## 0.0.2

### Patch Changes

- Added support for specifying keys for list items.

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.10

## 0.0.1

### Patch Changes

- This is an experimental release.

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.9
  - @fastkit/helpers@0.14.5
