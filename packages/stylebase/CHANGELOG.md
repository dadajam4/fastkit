# @fastkit/stylebase

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

## 0.14.0

### Minor Changes

- Release accompanying the plugboy bundler migration (tsup → tsdown).

  No API changes are intended for this package. The minor bump exists because the package is rebuilt with the new bundler (tsdown / rolldown), and is published together so any incidental output differences are versioned explicitly.

## 0.13.1

### Patch Changes

- [#122](https://github.com/dadajam4/fastkit/pull/122) [`d0c96fa`](https://github.com/dadajam4/fastkit/commit/d0c96faf96b6c91bcb8bc0b1ca9d22fc8ede303e) Thanks [@dadajam4](https://github.com/dadajam4)! - Update major and non-major packages

## 0.13.0

### Minor Changes

- First Release in Repository Migration.
