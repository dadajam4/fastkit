# @fastkit/vue-scoped-loading

## 1.0.0

### Major Changes

- [#228](https://github.com/dadajam4/fastkit/pull/228) [`023bebd`](https://github.com/dadajam4/fastkit/commit/023bebd6352f4bb18e6944dc72d2fd52e233e411) Thanks [@dadajam4](https://github.com/dadajam4)! - Graduate from `0.x`

  Every remaining `0.x` package moves to `1.0.0`. **No functional change** -- this
  release only restates what these versions already meant.

  `0.x` was never an accurate label for most of them. The convention it carries is
  "anything may break at any time", and this repo has in practice been shipping
  breaking changes as minors to match. A caret also behaves differently there:
  `^0.18.4` excludes `0.19.0`, because on `0.x` a caret pins the minor rather than
  the major. That one difference sits behind three separate problems.

  **Duplicate copies in consumer installs.** Twenty-one of these packages are
  shared by two or more published packages -- `@fastkit/helpers` by 35,
  `@fastkit/tiny-logger` by 27, `@fastkit/vue-utils` by 18. When an application
  installs two fastkit packages from different release waves and a minor of a
  shared dependency falls between them, the declared ranges cannot both be
  satisfied and the package manager installs both copies. Nothing breaks -- none
  of the shared ones carry injection identity or meaningful module state -- but
  the bytes ship twice. On `1.x` a caret covers every minor, so the window closes.

  **Breaking changes that do not look like it.** A breaking change released as
  `0.19.0` reaches consumers through their existing caret as though it were
  additive, unless they happened to pin. From `1.0.0` on, a breaking change takes
  a major and says so.

  **Packages that cannot become peers.** Eight of these carry Vue injection
  identity: `vue-page`, `vue-form-control`, `vue-app-layout`, `vue-color-scheme`,
  `vue-i18n`, `vue-location`, `vue-stack` and `vue-scoped-loading`. Those are
  exactly the packages that may one day need to be declared as peers, so that an
  application and its host resolve the same copy. A `0.x` package cannot be:
  changesets forces a dependent to `major` whenever a peer's new version leaves
  the declared range, and on `0.x` every minor leaves it.
  `@fastkit/vite-plugin-vui` carried that exact scar -- of its first three majors,
  only `3.0.0` was one anybody intended ([#225](https://github.com/dadajam4/fastkit/issues/225)). See
  `docs/dependency-management.md`.

  **Nothing to migrate.** No API changes, no removals, no renames. Internal
  version ranges are rewritten by changesets. If you declare any of these
  directly, widen the range to `^1.0.0` when you next update; until then your
  existing `^0.x` range simply stops matching new releases, which is the ordinary
  way a major is opted into.

### Patch Changes

- Updated dependencies [[`023bebd`](https://github.com/dadajam4/fastkit/commit/023bebd6352f4bb18e6944dc72d2fd52e233e411)]:
  - @fastkit/helpers@1.0.0

## 0.4.4

### Patch Changes

- Updated dependencies [[`d224120`](https://github.com/dadajam4/fastkit/commit/d224120639a248468c69d83f2791983cb61c248c)]:
  - @fastkit/helpers@0.17.0

## 0.4.3

### Patch Changes

- [#175](https://github.com/dadajam4/fastkit/pull/175) [`05d8bb4`](https://github.com/dadajam4/fastkit/commit/05d8bb4385811b677e323d2137a6d0e8a65186c5) Thanks [@dadajam4](https://github.com/dadajam4)! - Rebuild with the updated toolchain. No functional changes.

  `tsdown` moved from 0.22.3 to 0.22.14 (and with it rolldown from 1.1.3 to 1.2.0), which changes the emitted output even for packages whose sources are untouched — rolldown hoists some expressions into local bindings, and declaration printing differs in where it wraps lines. Comparing every `dist` file against `main`, built twice per side to filter out the known non-reproducible declaration output, 56 packages differ across 59 `.d.mts`, 26 `.map`, 18 `.mjs` and 1 `.css` file, all of them incidental.

  A few packages here also carry a refreshed dependency range — `fs-extra` 11.4.0, `typescript-eslint` 8.65.0, `eslint-plugin-vue` 10.10.0, `@vanilla-extract/rollup-plugin` 1.5.4. Each stays within the major the previous range already allowed, so resolution does not change for anyone; the declarations are just brought back in line.

  These are published together so the incidental output differences are versioned explicitly, rather than riding along unannounced in whatever release happens to touch these packages next.

- Updated dependencies [[`05d8bb4`](https://github.com/dadajam4/fastkit/commit/05d8bb4385811b677e323d2137a6d0e8a65186c5)]:
  - @fastkit/helpers@0.16.2

## 0.4.2

### Patch Changes

- [#166](https://github.com/dadajam4/fastkit/pull/166) [`88d561b`](https://github.com/dadajam4/fastkit/commit/88d561be563b26a9b1347f97b3eb9c21a3ef8730) Thanks [@dadajam4](https://github.com/dadajam4)! - Fix peer dependency ranges that had drifted behind the versions actually built against.

  - `vue-router`: widen the peer range from `^4.4.0` to `^4.4.0 || ^5.0.0` across the packages that declare it. Development moved to `vue-router@5.1.0`, but the peer range still only allowed the v4 major, which excluded v5 for consumers and pulled a stale `vue-router@4.6.4` into the lockfile via `@fastkit/vui-wysiwyg`. Both majors are now supported.
  - `@unhead/vue` (`@fastkit/vue-color-scheme`): bump the peer range from `^1.8.0` to `^3.0.0` to match the `3.1.3` version used in development. The previous range was two majors behind and emitted spurious peer warnings.

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
