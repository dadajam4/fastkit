# @fastkit/vue-scoped-loading

## 0.4.1

### Patch Changes

- [`d63b1af`](https://github.com/dadajam4/fastkit/commit/d63b1af8bf1bb131590ff540af82428cc60aeb7e) Thanks [@dadajam4](https://github.com/dadajam4)! - Strip the dangling `//# sourceMappingURL=*.d.mts.map` comment from emitted declaration files.

  tsdown (rolldown) appends this comment to every `.d.(m)ts` it emits but does not emit the referenced declaration map, so consumers' editors/build tools fail to resolve it. plugboy now removes the comment during build — but only when the referenced map is genuinely absent, so it becomes a no-op automatically if a future tsdown starts emitting real declaration maps.

  Every package in this monorepo is built by plugboy, so this patch re-publishes them all with declaration files that no longer point at a missing map.

- Updated dependencies [[`d63b1af`](https://github.com/dadajam4/fastkit/commit/d63b1af8bf1bb131590ff540af82428cc60aeb7e)]:
  - @fastkit/helpers@0.16.1

## 0.4.0

### Minor Changes

- [`b824e71`](https://github.com/dadajam4/fastkit/commit/b824e7136b57649d7958e257c21e8704267380e6) Thanks [@dadajam4](https://github.com/dadajam4)! - Release due to package bundler change. No functional changes included.

- Release accompanying the plugboy bundler migration (tsup → tsdown).

  No API changes are intended for this package. The minor bump exists because the package is rebuilt with the new bundler (tsdown / rolldown), and is published together so any incidental output differences are versioned explicitly.

### Patch Changes

- [`25602cb`](https://github.com/dadajam4/fastkit/commit/25602cbe1493cbeb10456b8b0e7680983d9e2ed7) Thanks [@dadajam4](https://github.com/dadajam4)! - Update dependencies and apply the associated fixes.

- Updated dependencies [[`b824e71`](https://github.com/dadajam4/fastkit/commit/b824e7136b57649d7958e257c21e8704267380e6), [`25602cb`](https://github.com/dadajam4/fastkit/commit/25602cbe1493cbeb10456b8b0e7680983d9e2ed7)]:
  - @fastkit/helpers@0.16.0

## 0.4.0-next.1

### Patch Changes

- Update dependencies and apply the associated fixes.

- Updated dependencies []:
  - @fastkit/helpers@0.16.0-next.1

## 0.4.0-next.0

### Minor Changes

- Release due to package bundler change. No functional changes included.

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.16.0-next.0

## 0.3.0

### Minor Changes

- Updated major dependencies.

## 0.2.0

### Minor Changes

- Updated major dependencies.

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.15.0

## 0.1.3

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.14.5

## 0.1.2

### Patch Changes

- Updated dependencies.

## 0.1.1

### Patch Changes

- Updated dependencies only.

## 0.1.0

### Minor Changes

- [#146](https://github.com/dadajam4/fastkit/pull/146) [`38c99c8`](https://github.com/dadajam4/fastkit/commit/38c99c8d34c434a4acd1df802453b1009cc4009b) Thanks [@dadajam4](https://github.com/dadajam4)! - First release.
