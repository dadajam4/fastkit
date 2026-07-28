# @fastkit/nodepack

## 0.17.2

### Patch Changes

- [#175](https://github.com/dadajam4/fastkit/pull/175) [`05d8bb4`](https://github.com/dadajam4/fastkit/commit/05d8bb4385811b677e323d2137a6d0e8a65186c5) Thanks [@dadajam4](https://github.com/dadajam4)! - Rebuild with the updated toolchain. No functional changes.

  `tsdown` moved from 0.22.3 to 0.22.14 (and with it rolldown from 1.1.3 to 1.2.0), which changes the emitted output even for packages whose sources are untouched — rolldown hoists some expressions into local bindings, and declaration printing differs in where it wraps lines. Comparing every `dist` file against `main`, built twice per side to filter out the known non-reproducible declaration output, 56 packages differ across 59 `.d.mts`, 26 `.map`, 18 `.mjs` and 1 `.css` file, all of them incidental.

  A few packages here also carry a refreshed dependency range — `fs-extra` 11.4.0, `typescript-eslint` 8.65.0, `eslint-plugin-vue` 10.10.0, `@vanilla-extract/rollup-plugin` 1.5.4. Each stays within the major the previous range already allowed, so resolution does not change for anyone; the declarations are just brought back in line.

  These are published together so the incidental output differences are versioned explicitly, rather than riding along unannounced in whatever release happens to touch these packages next.

- Updated dependencies [[`05d8bb4`](https://github.com/dadajam4/fastkit/commit/05d8bb4385811b677e323d2137a6d0e8a65186c5), [`05d8bb4`](https://github.com/dadajam4/fastkit/commit/05d8bb4385811b677e323d2137a6d0e8a65186c5)]:
  - @fastkit/node-util@0.16.2
  - @fastkit/tiny-logger@0.16.2

## 0.17.1

### Patch Changes

- [`d63b1af`](https://github.com/dadajam4/fastkit/commit/d63b1af8bf1bb131590ff540af82428cc60aeb7e) Thanks [@dadajam4](https://github.com/dadajam4)! - Strip the dangling `//# sourceMappingURL=*.d.mts.map` comment from emitted declaration files.

  tsdown (rolldown) appends this comment to every `.d.(m)ts` it emits but does not emit the referenced declaration map, so consumers' editors/build tools fail to resolve it. plugboy now removes the comment during build — but only when the referenced map is genuinely absent, so it becomes a no-op automatically if a future tsdown starts emitting real declaration maps.

  Every package in this monorepo is built by plugboy, so this patch re-publishes them all with declaration files that no longer point at a missing map.

- Updated dependencies [[`d63b1af`](https://github.com/dadajam4/fastkit/commit/d63b1af8bf1bb131590ff540af82428cc60aeb7e)]:
  - @fastkit/node-util@0.16.1
  - @fastkit/tiny-logger@0.16.1

## 0.17.0

### Minor Changes

- [`b824e71`](https://github.com/dadajam4/fastkit/commit/b824e7136b57649d7958e257c21e8704267380e6) Thanks [@dadajam4](https://github.com/dadajam4)! - Release due to package bundler change. No functional changes included.

- Release accompanying the plugboy bundler migration (tsup → tsdown).

  No API changes are intended for this package. The minor bump exists because the package is rebuilt with the new bundler (tsdown / rolldown), and is published together so any incidental output differences are versioned explicitly.

### Patch Changes

- [`25602cb`](https://github.com/dadajam4/fastkit/commit/25602cbe1493cbeb10456b8b0e7680983d9e2ed7) Thanks [@dadajam4](https://github.com/dadajam4)! - Update dependencies and apply the associated fixes.

- Updated dependencies [[`b824e71`](https://github.com/dadajam4/fastkit/commit/b824e7136b57649d7958e257c21e8704267380e6), [`25602cb`](https://github.com/dadajam4/fastkit/commit/25602cbe1493cbeb10456b8b0e7680983d9e2ed7)]:
  - @fastkit/tiny-logger@0.16.0
  - @fastkit/node-util@0.16.0

## 0.17.0-next.1

### Patch Changes

- Update dependencies and apply the associated fixes.

- Updated dependencies []:
  - @fastkit/tiny-logger@0.16.0-next.1
  - @fastkit/node-util@0.16.0-next.1

## 0.17.0-next.0

### Minor Changes

- Release due to package bundler change. No functional changes included.

### Patch Changes

- Updated dependencies []:
  - @fastkit/tiny-logger@0.16.0-next.0
  - @fastkit/node-util@0.16.0-next.0

## 0.16.0

### Minor Changes

- Updated major dependencies.

### Patch Changes

- Updated dependencies []:
  - @fastkit/node-util@0.15.0
  - @fastkit/tiny-logger@0.15.0

## 0.15.8

### Patch Changes

- Dependency updates only.

- Updated dependencies []:
  - @fastkit/node-util@0.14.11
  - @fastkit/tiny-logger@0.14.5

## 0.15.7

### Patch Changes

- Updated dependencies.

- Updated dependencies []:
  - @fastkit/node-util@0.14.10

## 0.15.6

### Patch Changes

- Updated dependencies.

- Updated dependencies []:
  - @fastkit/node-util@0.14.9

## 0.15.5

### Patch Changes

- Updated dependencies only.

## 0.15.4

### Patch Changes

- Updated dependencies []:
  - @fastkit/tiny-logger@0.14.4
  - @fastkit/node-util@0.14.8

## 0.15.3

### Patch Changes

- Updated dependencies []:
  - @fastkit/tiny-logger@0.14.3
  - @fastkit/node-util@0.14.7

## 0.15.2

### Patch Changes

- Updated dependencies []:
  - @fastkit/tiny-logger@0.14.2
  - @fastkit/node-util@0.14.6

## 0.15.1

### Patch Changes

- Updated major dependencies.

- Updated dependencies []:
  - @fastkit/node-util@0.14.5

## 0.15.0

### Minor Changes

- Added the `noExternal` option to prevent any packages from being externalized.

## 0.14.4

### Patch Changes

- Updated dependencies []:
  - @fastkit/node-util@0.14.4

## 0.14.3

### Patch Changes

- Updated dependencies []:
  - @fastkit/node-util@0.14.3

## 0.14.2

### Patch Changes

- Updated dependencies []:
  - @fastkit/node-util@0.14.2

## 0.14.1

### Patch Changes

- Reverted the removal of the `main` field that was introduced in the previous release and restored support for the old `moduleResolution`.

- Updated dependencies []:
  - @fastkit/tiny-logger@0.14.1
  - @fastkit/node-util@0.14.1

## 0.14.0

### Minor Changes

- This release includes no functional changes, but it contains the following important updates:
  - Now adheres to ES Modules and the latest TypeScript standards, and the output for the `main` field and `typesVersions` is no longer generated.

### Patch Changes

- Updated dependencies []:
  - @fastkit/tiny-logger@0.14.0
  - @fastkit/node-util@0.14.0

## 0.13.9

### Patch Changes

- Refactored internal implementation due to a review of ESLint rules, with no changes to the specifications.

- Updated dependencies []:
  - @fastkit/node-util@0.13.9
  - @fastkit/tiny-logger@0.13.8

## 0.13.8

### Patch Changes

- Updated dependencies []:
  - @fastkit/tiny-logger@0.13.7
  - @fastkit/node-util@0.13.8

## 0.13.7

### Patch Changes

- Updated dependencies []:
  - @fastkit/tiny-logger@0.13.6
  - @fastkit/node-util@0.13.7

## 0.13.6

### Patch Changes

- Updated dependencies []:
  - @fastkit/tiny-logger@0.13.5
  - @fastkit/node-util@0.13.6

## 0.13.5

### Patch Changes

- Updated dependencies []:
  - @fastkit/tiny-logger@0.13.4
  - @fastkit/node-util@0.13.5

## 0.13.4

### Patch Changes

- [#122](https://github.com/dadajam4/fastkit/pull/122) [`d0c96fa`](https://github.com/dadajam4/fastkit/commit/d0c96faf96b6c91bcb8bc0b1ca9d22fc8ede303e) Thanks [@dadajam4](https://github.com/dadajam4)! - Update major and non-major packages

- Updated dependencies [[`d0c96fa`](https://github.com/dadajam4/fastkit/commit/d0c96faf96b6c91bcb8bc0b1ca9d22fc8ede303e)]:
  - @fastkit/node-util@0.13.4
  - @fastkit/tiny-logger@0.13.3

## 0.13.3

### Patch Changes

- [#120](https://github.com/dadajam4/fastkit/pull/120) [`5b881b9`](https://github.com/dadajam4/fastkit/commit/5b881b94ce1852c12cc3c8f6954564d5235cba4d) Thanks [@dadajam4](https://github.com/dadajam4)! - JSDocs were added and no-console lint improvements were made.

- Updated dependencies [[`5b881b9`](https://github.com/dadajam4/fastkit/commit/5b881b94ce1852c12cc3c8f6954564d5235cba4d)]:
  - @fastkit/tiny-logger@0.13.2
  - @fastkit/node-util@0.13.3

## 0.13.2

### Patch Changes

- [#39](https://github.com/dadajam4/fastkit/pull/39) [`40ee82f`](https://github.com/dadajam4/fastkit/commit/40ee82f4501b88e44ad9b67918df2237298493a0) Thanks [@dadajam4](https://github.com/dadajam4)! - Dependencies have been updated.

- Updated dependencies [[`40ee82f`](https://github.com/dadajam4/fastkit/commit/40ee82f4501b88e44ad9b67918df2237298493a0)]:
  - @fastkit/node-util@0.13.2

## 0.13.1

### Patch Changes

- Updated dependencies []:
  - @fastkit/tiny-logger@0.13.1
  - @fastkit/node-util@0.13.1

## 0.13.0

### Minor Changes

- First Release in Repository Migration.
