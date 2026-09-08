# @fastkit/cookies

## 0.17.1

### Patch Changes

- Updated dependencies [[`d224120`](https://github.com/dadajam4/fastkit/commit/d224120639a248468c69d83f2791983cb61c248c)]:
  - @fastkit/helpers@0.17.0
  - @fastkit/tiny-logger@0.16.3

## 0.17.0

### Minor Changes

- [#175](https://github.com/dadajam4/fastkit/pull/175) [`05d8bb4`](https://github.com/dadajam4/fastkit/commit/05d8bb4385811b677e323d2137a6d0e8a65186c5) Thanks [@dadajam4](https://github.com/dadajam4)! - Update `cookie` from 1.x to 2.x.

  The public API is unchanged — the re-exported `ParseOptions` and `SerializeOptions` types are byte-for-byte identical between cookie 1.1.1 and 2.0.1, and cookie serialization/parsing produces the same output (verified across the attribute matrix, including the `TypeError` cases for invalid values). Internally, the calls moved off the aliases cookie 2 removed: `parse` → `parseCookie`, and `serialize(name, value, options)` → `stringifySetCookie({ ...attributes, name, value }, { encode })`, since object mode is now the only supported signature and `encode` lives in a separate argument.

  Note that cookie 2 is ESM-only and declares `engines.node >= 22`, so consumers of this package inherit that floor. `@fastkit/cookies` already ships ESM only, so nothing changes about how it is consumed.

### Patch Changes

- [#175](https://github.com/dadajam4/fastkit/pull/175) [`05d8bb4`](https://github.com/dadajam4/fastkit/commit/05d8bb4385811b677e323d2137a6d0e8a65186c5) Thanks [@dadajam4](https://github.com/dadajam4)! - Fix `Cookies#delete()`, which never worked, and stop `Cookies#set()` from emitting duplicate `Set-Cookie` headers. Adds the package's first test suite, which is what surfaced all three problems.

  - `delete()` and `set()` called each other in a loop — `set()` routed an empty value to `delete()`, and `delete()` re-entered `set()` with `''` — so every `delete()` ended in `RangeError: Maximum call stack size exceeded`. The header-writing logic now lives in a private `write()` that both entry points call. `set(name, '', options)` also forwards its options, so deleting a cookie scoped by `path` / `domain` targets the right cookie instead of a bare name.
  - `update()` ended with an `Object.assign(this.bucket, cookies)` that wrote the raw value back after the loop above it had already deleted the key, so a removed cookie reappeared in the bucket as `''`. The loop already maintains the bucket, so the trailing assign is gone.
  - `areCookiesEqual()` compared the cookie value, so re-setting a cookie under an existing name appended a second `Set-Cookie` instead of replacing the stale one. Cookies are overwritten by key and attributes, not by value, so the value is now excluded. `sameSite` is also normalized on both sides, because one side comes from a parsed header while the other comes from `createCookie()`, which defaults it — without that, anything set without an explicit `sameSite` still duplicated.

- Updated dependencies [[`05d8bb4`](https://github.com/dadajam4/fastkit/commit/05d8bb4385811b677e323d2137a6d0e8a65186c5)]:
  - @fastkit/ev@0.15.2
  - @fastkit/helpers@0.16.2
  - @fastkit/tiny-logger@0.16.2

## 0.16.1

### Patch Changes

- [`d63b1af`](https://github.com/dadajam4/fastkit/commit/d63b1af8bf1bb131590ff540af82428cc60aeb7e) Thanks [@dadajam4](https://github.com/dadajam4)! - Strip the dangling `//# sourceMappingURL=*.d.mts.map` comment from emitted declaration files.

  tsdown (rolldown) appends this comment to every `.d.(m)ts` it emits but does not emit the referenced declaration map, so consumers' editors/build tools fail to resolve it. plugboy now removes the comment during build — but only when the referenced map is genuinely absent, so it becomes a no-op automatically if a future tsdown starts emitting real declaration maps.

  Every package in this monorepo is built by plugboy, so this patch re-publishes them all with declaration files that no longer point at a missing map.

- Updated dependencies [[`d63b1af`](https://github.com/dadajam4/fastkit/commit/d63b1af8bf1bb131590ff540af82428cc60aeb7e)]:
  - @fastkit/ev@0.15.1
  - @fastkit/helpers@0.16.1
  - @fastkit/tiny-logger@0.16.1

## 0.16.0

### Minor Changes

- [`b824e71`](https://github.com/dadajam4/fastkit/commit/b824e7136b57649d7958e257c21e8704267380e6) Thanks [@dadajam4](https://github.com/dadajam4)! - Release due to package bundler change. No functional changes included.

- Release accompanying the plugboy bundler migration (tsup → tsdown).

  No API changes are intended for this package. The minor bump exists because the package is rebuilt with the new bundler (tsdown / rolldown), and is published together so any incidental output differences are versioned explicitly.

### Patch Changes

- [`25602cb`](https://github.com/dadajam4/fastkit/commit/25602cbe1493cbeb10456b8b0e7680983d9e2ed7) Thanks [@dadajam4](https://github.com/dadajam4)! - Update dependencies and apply the associated fixes.

- Updated dependencies [[`b824e71`](https://github.com/dadajam4/fastkit/commit/b824e7136b57649d7958e257c21e8704267380e6), [`25602cb`](https://github.com/dadajam4/fastkit/commit/25602cbe1493cbeb10456b8b0e7680983d9e2ed7)]:
  - @fastkit/tiny-logger@0.16.0
  - @fastkit/helpers@0.16.0
  - @fastkit/ev@0.15.0

## 0.16.0-next.1

### Patch Changes

- Update dependencies and apply the associated fixes.

- Updated dependencies []:
  - @fastkit/tiny-logger@0.16.0-next.1
  - @fastkit/helpers@0.16.0-next.1
  - @fastkit/ev@0.15.0-next.1

## 0.16.0-next.0

### Minor Changes

- Release due to package bundler change. No functional changes included.

### Patch Changes

- Updated dependencies []:
  - @fastkit/tiny-logger@0.16.0-next.0
  - @fastkit/helpers@0.16.0-next.0
  - @fastkit/ev@0.15.0-next.0

## 0.15.0

### Minor Changes

- Updated major dependencies.

- Updated major dependencies.

  Accordingly, the names of the following two exported types have been changed:
  - `CookieParseOptions` → `ParseOptions`
  - `CookieSerializeOptions` → `SerializeOptions`

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.15.0
  - @fastkit/tiny-logger@0.15.0

## 0.14.6

### Patch Changes

- Dependency updates only.

- Updated dependencies []:
  - @fastkit/helpers@0.14.5
  - @fastkit/tiny-logger@0.14.5

## 0.14.5

### Patch Changes

- Updated dependencies.

## 0.14.4

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.14.4
  - @fastkit/tiny-logger@0.14.4

## 0.14.3

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.14.3
  - @fastkit/tiny-logger@0.14.3

## 0.14.2

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.14.2
  - @fastkit/tiny-logger@0.14.2

## 0.14.1

### Patch Changes

- Reverted the removal of the `main` field that was introduced in the previous release and restored support for the old `moduleResolution`.

- Updated dependencies []:
  - @fastkit/tiny-logger@0.14.1
  - @fastkit/helpers@0.14.1
  - @fastkit/ev@0.14.1

## 0.14.0

### Minor Changes

- This release includes no functional changes, but it contains the following important updates:
  - Now adheres to ES Modules and the latest TypeScript standards, and the output for the `main` field and `typesVersions` is no longer generated.

### Patch Changes

- Updated dependencies []:
  - @fastkit/tiny-logger@0.14.0
  - @fastkit/helpers@0.14.0
  - @fastkit/ev@0.14.0

## 0.13.8

### Patch Changes

- Refactored internal implementation due to a review of ESLint rules, with no changes to the specifications.

- Updated dependencies []:
  - @fastkit/helpers@0.13.8
  - @fastkit/ev@0.13.2
  - @fastkit/tiny-logger@0.13.8

## 0.13.7

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.13.7
  - @fastkit/tiny-logger@0.13.7

## 0.13.6

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.13.6
  - @fastkit/tiny-logger@0.13.6

## 0.13.5

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.13.5
  - @fastkit/tiny-logger@0.13.5

## 0.13.4

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.13.4
  - @fastkit/tiny-logger@0.13.4

## 0.13.3

### Patch Changes

- [#122](https://github.com/dadajam4/fastkit/pull/122) [`d0c96fa`](https://github.com/dadajam4/fastkit/commit/d0c96faf96b6c91bcb8bc0b1ca9d22fc8ede303e) Thanks [@dadajam4](https://github.com/dadajam4)! - Update major and non-major packages

- Updated dependencies [[`d0c96fa`](https://github.com/dadajam4/fastkit/commit/d0c96faf96b6c91bcb8bc0b1ca9d22fc8ede303e)]:
  - @fastkit/helpers@0.13.3
  - @fastkit/ev@0.13.1
  - @fastkit/tiny-logger@0.13.3

## 0.13.2

### Patch Changes

- Updated dependencies [[`5b881b9`](https://github.com/dadajam4/fastkit/commit/5b881b94ce1852c12cc3c8f6954564d5235cba4d)]:
  - @fastkit/tiny-logger@0.13.2
  - @fastkit/helpers@0.13.2

## 0.13.1

### Patch Changes

- Updated dependencies [[`3ed3703a`](https://github.com/dadajam4/fastkit/commit/3ed3703aa9092bf47caed6ec192ef4d5a7621d34)]:
  - @fastkit/helpers@0.13.1
  - @fastkit/tiny-logger@0.13.1

## 0.13.0

### Minor Changes

- First Release in Repository Migration.
