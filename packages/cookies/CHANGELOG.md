# @fastkit/cookies

## 1.1.0

### Minor Changes

- [#267](https://github.com/dadajam4/fastkit/pull/267) [`98bfb47`](https://github.com/dadajam4/fastkit/commit/98bfb47338c1e9c562c5359ed18745ab54194b49) Thanks [@dadajam4](https://github.com/dadajam4)! - Accept a web-standard `Request` / `Headers` pair as a server context.

  `Cookies` took a browser `Document` or a Node `{ req, res }` pair, and nothing else. Handed a `Request` it did not throw — it silently did nothing. The detection helpers were the reason: `isIncomingMessage` and `isServerResponse` both start from `isObject`, which asks for `[object Object]`, and a `Request` stringifies to `[object Request]`. So `parse()` fell through to `{}` and every cookie read as absent, while `set()` still updated the in-memory bucket and produced no `Set-Cookie` at all — a session that looks right in development and drops every cookie in production.

  There is now a second server context:

  ```ts
  export default {
    async fetch(request: Request): Promise<Response> {
      const headers = new Headers();
      const cookies = new Cookies({ request, headers });

      cookies.get('session_id');
      cookies.set('session_id', id, { httpOnly: true, sameSite: 'strict' });

      return new Response(body, { headers });
    },
  };
  ```

  Reading goes through `request.headers.get('cookie')` and writing through `headers.append('set-cookie', …)`, both feeding the same parser and the same duplicate-cookie merge the Node branch has always used. Either half may be left out: `{ request }` alone reads, `{ headers }` alone writes.

  Two things are worth knowing about the web branch. `Headers` only appends, so the whole `Set-Cookie` set is rewritten on each `set()` — that is how an overwritten cookie gets taken back out. And there is no `writableEnded` equivalent to consult, so the "response has already been sent" warning is Node-only; on the web branch that check belongs to the transport layer.

  `CookiesServerContext` is now `CookiesNodeContext | CookiesWebContext`. Existing `{ req, res }` and `Document` callers are untouched; only code that reads `.req` off a value _typed_ as `CookiesServerContext` needs to narrow first.

  New exports: the `CookiesWebContext` type and the `isWebRequest` / `isWebHeaders` guards, both duck-typed rather than built on `isObject`.

### Patch Changes

- [#279](https://github.com/dadajam4/fastkit/pull/279) [`2346b16`](https://github.com/dadajam4/fastkit/commit/2346b16c15db7b97b721174ea09a06b2304d89a8) Thanks [@dadajam4](https://github.com/dadajam4)! - Fix the README's `maxAge` examples, which were in milliseconds.

  `maxAge` is in **seconds** — `cookie@2` types it as "the `number` (in seconds)", per RFC 6265 §5.2.2 — and four examples multiplied by 1,000:

  | written                                     | read as     | meant    |
  | ------------------------------------------- | ----------- | -------- |
  | `maxAge: 24 * 60 * 60 * 1000 // 24 hours`   | ~2.7 years  | 24 hours |
  | `maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days` | ~19.2 years | 7 days   |

  Three of the four are session and auth-token examples, which is the worst place for it: copying the login handler out of this README shipped a session cookie that never expires in any practical sense, with a comment on the line saying it lasts a day.

  The `SerializeOptions` reference now says which unit it is, since that is what would have made this visible. `expires` was and remains correct: it takes a `Date`, so the millisecond arithmetic around it is right.

  Documentation only.

## 1.0.1

### Patch Changes

- [#253](https://github.com/dadajam4/fastkit/pull/253) [`e9da85f`](https://github.com/dadajam4/fastkit/commit/e9da85f5a48cfb0d63459144262f77d62775e980) Thanks [@dadajam4](https://github.com/dadajam4)! - Declare `@types/node`, which the published declarations have always needed.

  `@fastkit/plugboy` names `node:fs` and `NodeJS.ErrnoException`, and `@fastkit/cookies` and `@fastkit/vue-page` name `IncomingMessage` / `ServerResponse` from `node:http`. None of them said so, so a consumer without Node's types in scope got errors from inside these packages with `skipLibCheck: false`.

  All three already run in Node — they are in the repo's own `RUNS_IN_NODE` set and declare `engines.node` — so `"@types/node": ">=20"` as a peer states an existing implicit requirement, in the shape `@fastkit/vot` already uses. No upper bound: it describes the consumer's Node types rather than an API these packages call.

  Patch for the same reason the `engines` additions in [#212](https://github.com/dadajam4/fastkit/issues/212) were: no code changes, and nothing that was working stops working.

- Updated dependencies [[`e9da85f`](https://github.com/dadajam4/fastkit/commit/e9da85f5a48cfb0d63459144262f77d62775e980), [`e9da85f`](https://github.com/dadajam4/fastkit/commit/e9da85f5a48cfb0d63459144262f77d62775e980)]:
  - @fastkit/helpers@1.1.0
  - @fastkit/tiny-logger@1.1.0

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
  - @fastkit/ev@1.0.0
  - @fastkit/helpers@1.0.0
  - @fastkit/tiny-logger@1.0.0

## 0.17.2

### Patch Changes

- [#213](https://github.com/dadajam4/fastkit/pull/213) [`02ed660`](https://github.com/dadajam4/fastkit/commit/02ed660f4e06be90dceb2664d341d67f1136fe6e) Thanks [@dadajam4](https://github.com/dadajam4)! - Declare `engines.node` on the packages that run in Node

  None of these packages said which Node they needed, so a project on an older
  Node installed cleanly and failed later. `@fastkit/node-util` reaches
  `execa@10` (`engines: >=22`), and nothing in the chain up through
  `@fastkit/vite-plugin-vui` declared anything, so Node 20 builds died with:

  ```
  TypeError: TEXT_ENCODINGS.union is not a function
      at .../execa/lib/arguments/encoding-option.js:20
  ```

  `Set.prototype.union` is Node 22+ and `execa` calls it at import time. The
  failure surfaced only during the build and vui's generation step -- `tsc` and
  the tests passed -- so it showed up in CI and container images while a
  developer on a newer Node saw everything green.

  Each package now declares the highest floor its own shipped dependencies
  impose, so `npm`/`pnpm` report an unsupported engine at install time and
  `engine-strict` fails outright:

  | Floor       | Packages                                                                                                                                  |
  | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
  | `>=24.14.0` | `icon-font-gen`, `vite-kit`, `vite-plugin-vui` (`webfont@12.5.0`)                                                                         |
  | `>=22.18.0` | `plugboy` and its four plugins (`@tsdown/css`, `unplugin-vue-jsx`)                                                                        |
  | `>=22.12.0` | `stylelint-config-vue` (`postcss-html`)                                                                                                   |
  | `>=22.0.0`  | `node-util`, `nodepack`, `color-scheme-gen`, `media-match-gen`, `vui` (`execa@10`); `cookies`, `vue-page`, `vot`, `vot-i18n` (`cookie@2`) |
  | `>=20.19.0` | `eslint-config`, `eslint-config-vue`, `stylelint-config`, `sprite-images`, `ts-tiny-meta`, `vue-tiny-meta`                                |
  | `>=18.0.0`  | `hashed-sync` (`imagemin`)                                                                                                                |

  Note that `@fastkit/vite-plugin-vui` requires **Node 24.14**, not 22: its
  `webfont` dependency does. Nothing here changes what any package needs at run
  time -- these floors were already in force, just undeclared.

  Browser-only packages are left alone even where a transitive dependency has a
  floor: `@fastkit/vui-wysiwyg` inherits one from `@fastkit/vui`, but runs no
  Node code of its own. Optional peers do not contribute a floor, since they are
  reachable only through an opt-in subpath.

  `pnpm audit:deps` now recomputes every floor and fails when a declaration is
  missing or undershoots, so a future dependency bump cannot quietly reintroduce
  the gap. The policy is written up in `docs/dependency-management.md`.

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
