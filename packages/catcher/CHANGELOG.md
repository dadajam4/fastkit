# @fastkit/catcher

## 1.3.0

### Minor Changes

- [#301](https://github.com/dadajam4/fastkit/pull/301) [`eff207b`](https://github.com/dadajam4/fastkit/commit/eff207be9cdf4d901863d413f5a7f2af074b85c2) Thanks [@dadajam4](https://github.com/dadajam4)! - Add `defaultMessage`, so an application can guarantee that every catcher has a message.

  For a package whose pitch is "throw anything at it and read the result", "whatever you throw, the result has a message" ought to hold. It did not, and the failure was quiet rather than loud:

  ```ts
  const AppError = build({ normalizer: () => () => ({ code: 'APP_ERROR' }) });

  const err = AppError.from('just a string'); // nothing recognised it
  err.message; // ''
  err.toJSONString(); // {"code":"APP_ERROR","message":"", ...}
  ```

  An instance is a real `Error`, and an `Error` is born with an empty message. So a normalizer that returned no `message` for an exception it did not recognise did not leave the field out — it left an empty one, which reads like a message rather than the absence of one. Nothing flagged it.

  `defaultMessage` is the last word, applied after the normalizer and after the exception's own message, and only when what is left is empty:

  ```ts
  const AppError = build({
    defaultName: 'AppError',
    defaultMessage: 'Something went wrong',
    normalizer: () => () => ({ code: 'APP_ERROR' }),
  });

  AppError.from('just a string').message; // 'Something went wrong'
  AppError.from(new Error('real')).message; // 'real' — never displaced
  ```

  There is no default value: the string is what a user may end up reading, so it belongs to the application rather than to this package. Development warns once per catcher when an instance is built with no message and `defaultMessage` is unset.

  `CatcherData` now also carries `name`, `message` and `stack` as optional members, which is what the catcher has always written into it regardless of the normalizer. A normalizer that declares them narrows them back to required.

- [#301](https://github.com/dadajam4/fastkit/pull/301) [`eff207b`](https://github.com/dadajam4/fastkit/commit/eff207be9cdf4d901863d413f5a7f2af074b85c2) Thanks [@dadajam4](https://github.com/dadajam4)! - Add `ctx.degraded()`, so a resolver can say what a synchronous entry point cost it.

  `from` and `fromAsync` differ in what they can reach, not in what they mean, and picking the wrong one in an async context was silent:

  ```ts
  catch (e) {
    throw AppError.from(e); // no body. No type error, no runtime error.
  }
  ```

  The normalizer just saw `bodyRead: false` and fell back to `statusText`. A resolver now reports what it could see and could not take, and the catcher warns once, in development only:

  ```
  [@fastkit/catcher] A resolver could not wait for: response body.
    Use `await AppError.fromAsync(e)` where you can await.
  ```

  It is the resolver that reports this rather than the builder inferring it from the resolver list, so the warning names what was lost instead of guessing that something might have been — and it stays quiet for every exception that resolver never matched. A catcher holding `fetchResponseResolver` says nothing when you wrap a `TypeError` that has no `Response` in it.

  Custom resolvers get the same mechanism, which is the point: writing a resolver is how this package is mostly used, and a builder-side inference would have had nothing to offer one.

  ```ts
  if (!ctx.canAwait) {
    ctx.degraded?.('response body');
    return { myError: meta };
  }
  ```

  It is a no-op when `ctx.canAwait` is `true`, so it needs no guard of its own. Optional on `ResolverContext` only so that a hand-built context still compiles; a catcher always supplies it.

- [#303](https://github.com/dadajam4/fastkit/pull/303) [`dadb40b`](https://github.com/dadajam4/fastkit/commit/dadb40b4d6fb369ba4bf0b88b512ff0e6d632616) Thanks [@dadajam4](https://github.com/dadajam4)! - Add `match`, so a normalizer dispatches on the kind of exception rather than on which fields happen to exist.

  Written by hand a normalizer is a chain of optional access, and its shape ends up dominated by "does this field exist":

  ```ts
  normalizer: (resolved) => () => ({
    message: resolved.fetchError?.response.bodyRead
      ? (resolved.fetchError.response.json?.message ??
        resolved.fetchError.response.statusText)
      : resolved.fetchError?.response.statusText,
    status: resolved.fetchError?.response.status,
  });
  ```

  `match` hands each branch its slice, already narrowed:

  ```ts
  const resolvers = [fetchResponseResolver()];

  const AppError = build({
    resolvers,
    defaultMessage: 'Something went wrong',
    normalizer: match(resolvers, {
      fetchError: ({ response }) => ({
        code: 'HTTP_ERROR',
        message: response.bodyRead
          ? (response.json?.message ?? response.statusText)
          : response.statusText,
        status: response.status,
      }),
      nativeError: (e) => ({ code: 'UNEXPECTED', message: e.message }),
      default: () => ({ code: 'UNKNOWN', message: 'Something went wrong' }),
    }),
  });
  ```

  **The branches are ordered, not exclusive**, and that is the thing to know before writing one. They are tried in the order written, the first whose key is present wins, and `default` is always last wherever you put it. They have to be ordered because `nativeErrorResolver` runs in front of your list and never declines an `Error`, so a fetch error arrives carrying both keys — a `nativeError` branch matches almost everything and belongs last. Listing it earlier makes every branch after it dead, and development warns when you do.

  **The branch return types are merged rather than left as a union.** A field is required on the result when every branch produces it and optional when only some do, so `err.status` reads as `number | undefined` instead of being an error on a union whose other member has no `status`. That is what `default` being required buys: without a total dispatch there is always a path producing nothing, and no field can be promised. Declare `message` in every branch and it is guaranteed at the type level, with `defaultMessage` covering the runtime half.

  **The resolvers are passed again because they are the only way to type the slices.** Written as `match({ ... })` the branch parameters fall back to `any`, taking the narrowing with them — measured, not assumed. Nothing reads the array at runtime.

- [#301](https://github.com/dadajam4/fastkit/pull/301) [`eff207b`](https://github.com/dadajam4/fastkit/commit/eff207be9cdf4d901863d413f5a7f2af074b85c2) Thanks [@dadajam4](https://github.com/dadajam4)! - Add `@fastkit/catcher/testing`, so a resolver can be tested without hand-rolling a context.

  Writing a resolver is how most applications use this package, and testing one meant reaching into the shape of `ResolverContext`:

  ```ts
  // before
  const result = myResolver(someError, {
    resolve() {},
    resolvedData: {},
    canAwait: true,
  });
  ```

  That couples every consumer's tests to a type they do not own, and leaves the parts that are not plain return values unobservable — whether the resolver called `ctx.resolve()`, and what it reported through `ctx.degraded()`.

  ```ts
  import { runResolver } from '@fastkit/catcher/testing';

  const { data, resolved, degraded } = await runResolver(myResolver, someError);

  // ...and the path the synchronous entry points take
  const sync = await runResolver(fetchResponseResolver(), err, {
    canAwait: false,
  });
  sync.degraded; // ['response body']
  ```

  Always asynchronous, whether or not the resolver is, so one `await` covers both kinds. `canAwait` (default `true`) picks the path; `resolvedData` (default `{}`) seeds what earlier resolvers left behind — inside a real catcher that is never empty for an `Error`, since `nativeErrorResolver` runs first and always contributes.

  It is a separate export path so it never reaches an application bundle through the main entry.

### Patch Changes

- [#301](https://github.com/dadajam4/fastkit/pull/301) [`eff207b`](https://github.com/dadajam4/fastkit/commit/eff207be9cdf4d901863d413f5a7f2af074b85c2) Thanks [@dadajam4](https://github.com/dadajam4)! - Fix `ctx.resolve()` being ignored when the resolver returns nothing.

  The check that stops the later resolvers sat inside the branch that merges a result, so a resolver had to both claim the exception _and_ have something to extract for the claim to hold:

  ```ts
  const claimOnly = createCatcherResolver((source, ctx) => {
    if (!isMine(source)) return;
    ctx.resolve(); // "this one is mine, nobody after me needs to look"
    // ...and nothing worth extracting
  });
  ```

  Every resolver after it ran anyway. "This is mine and there is nothing in it worth reporting" is a legitimate thing for a resolver to say, and the documented meaning of `resolve()` never mentioned a return value.

  The stop is now honoured either way, on both the synchronous and the awaiting pass.

- [#301](https://github.com/dadajam4/fastkit/pull/301) [`eff207b`](https://github.com/dadajam4/fastkit/commit/eff207be9cdf4d901863d413f5a7f2af074b85c2) Thanks [@dadajam4](https://github.com/dadajam4)! - Stop a resolver that throws from replacing the exception it was describing.

  A resolver runs while an error is being handled. If it threw — one `?.` short of an unexpected payload shape is enough — the exception propagated out of `from()`, so the caller got a `TypeError` from inside this package instead of the API error they had caught. The package's own code says this must not happen, in the comment on `readBody`, but nothing enforced it for resolvers.

  The resolver is now skipped, the resolvers after it still get their turn, the exception being described reaches the normalizer unharmed, and development is told:

  ```
  [@fastkit/catcher] A resolver threw while describing an exception, and was skipped.
    TypeError: Cannot read properties of undefined (reading 'data')
    The exception being described is unaffected -- fix the resolver.
  ```

  A resolver that threw is treated as having contributed nothing, and that includes its `ctx.resolve()`: one failed run does not get to silence every resolver after it.

  This is a safety net rather than a licence, which is what the warning is for. The contract is now written down — see "Writing a resolver" in the README.

- [#301](https://github.com/dadajam4/fastkit/pull/301) [`eff207b`](https://github.com/dadajam4/fastkit/commit/eff207be9cdf4d901863d413f5a7f2af074b85c2) Thanks [@dadajam4](https://github.com/dadajam4)! - Fix `build()` rewriting the resolver array it was given.

  The native resolver has to run in front, and `build` put it there with `unshift` — on `opts.resolvers` itself, which the caller still holds:

  ```ts
  const resolvers = [apiErrorResolver];

  const AppError = build({ resolvers, normalizer: a });
  const HttpError = build({ resolvers, normalizer: b });

  resolvers; // [nativeErrorResolver, apiErrorResolver] — never put there
  ```

  A shared `const resolvers` is the natural thing to write once an application has two catchers, and the array came back with a resolver in it that was never added. The `includes` guard stopped the double insert but not the rewrite.

  `build` now copies the list. A list that already names `nativeErrorResolver` is still taken as given, since its position decides which resolvers see `nativeError` in `ctx.resolvedData`.

## 1.2.0

### Minor Changes

- [#256](https://github.com/dadajam4/fastkit/pull/256) [`bac6c0b`](https://github.com/dadajam4/fastkit/commit/bac6c0baecbf90801abaa33301189591ee7f3e69) Thanks [@dadajam4](https://github.com/dadajam4)! - Add `fromAsync` / `createAsync`, so a resolver can reach for what only a promise can give.

  `fetchResponseResolver` wanted the response body and could not have it. A resolver ran inside a synchronous constructor — an instance is an `Error` that has to exist by the time it is thrown — while a `Response` hands out its body through a promise and no other way. It read the body anyway and wrote the result in afterwards, which could never work: the normalizer had already produced `data` by then, so `json` and `text` never reached it. The documented example read `bodyText` / `bodyJson` and always got `''` / `null`.

  Resolvers may now return a promise, and two entry points await them before normalizing:

  ```ts
  try {
    await api.getUser(id);
  } catch (e) {
    throw await AppError.fromAsync(e); // the normalizer sees the body
  }
  ```

  Nothing else about the model changes: you still hand it an unknown exception and let the resolvers work out what it is. `from` / `create` behave exactly as before. A resolver that needs to await reads the new `ctx.canAwait` and offers what it can synchronously instead — which is what `fetchResponseResolver` now does.

  **`SerializableFetchResponse` is a discriminated union.** `bodyRead` says which half you have, so a missing body is no longer indistinguishable from a body that was not JSON:

  ```ts
  const { response } = resolvedData.fetchError;
  if (response.bodyRead) {
    response.json; // only in scope here
  }
  ```

  `from` gives you `bodyRead: false` with the metadata a `Response` reports synchronously — status, statusText, url, headers, ok, redirected, type. `fromAsync` gives you `bodyRead: true`, plus `json` and `text`.

  **Migration.** `json` and `text` are behind the discriminant, so code that read them unconditionally no longer compiles — which is the point: it was reading values that were never populated. Build with `fromAsync` and narrow on `bodyRead`.

- [#256](https://github.com/dadajam4/fastkit/pull/256) [`bac6c0b`](https://github.com/dadajam4/fastkit/commit/bac6c0baecbf90801abaa33301189591ee7f3e69) Thanks [@dadajam4](https://github.com/dadajam4)! - Fix `fetchResponseResolver`: stop the unhandled rejection, leave the caller their body, and make `headers` serializable.

  The resolver read the same body twice:

  ```ts
  response.json().then((json) => {
    fetchResponse.json = json;
  });
  response.text().then((text) => {
    fetchResponse.text = text;
  });
  ```

  A body can only be read once, so the second call rejected with `TypeError: Body is unusable` — every time, with no `catch`. An unhandled rejection terminates a Node process by default, so a resolver whose whole job is to make an error reportable could take the process down instead. It also left the application's own `response` drained: the code that threw could no longer read what it had fetched.

  The body is now read once, from `response.clone()`, and only when the resolver may await (see `fromAsync`). `json` is derived from that text, `response.bodyUsed` stays `false`, and a body that is already consumed, locked, or fails mid-read degrades to `''` / `null` instead of throwing — a resolver runs while an error is being described and must not replace it with one of its own.

  **`headers` is now `Record<string, string>` rather than `Headers`.** The type is named for being JSON-serializable and `headers` was the one field that was not: `JSON.stringify(new Headers({...}))` is `{}`, so the headers silently vanished from any serialized error. Repeated header names are combined with `, `, the same way `Headers.get()` combines them — `Object.fromEntries(headers.entries())` would have kept only the last `set-cookie`.

  ```diff
  - Object.fromEntries(fetchError.response.headers.entries())
  + fetchError.response.headers
  ```

  This does not change what leaves your process. Resolver output is not serialized — `toJSON()` emits what the _normalizer_ returns — so the response reaching the normalizer in full is by design, and what you copy out of it is your decision. The README now says so, and says which fields are worth thinking twice about: `set-cookie` (a 401 is exactly when session and refresh tokens get rotated), a `url` that may carry a signed-URL signature, and a body that may hold more than the message you were after. The previous example spread all of them into the normalizer's return value.

### Patch Changes

- [#256](https://github.com/dadajam4/fastkit/pull/256) [`bac6c0b`](https://github.com/dadajam4/fastkit/commit/bac6c0baecbf90801abaa33301189591ee7f3e69) Thanks [@dadajam4](https://github.com/dadajam4)! - Stop `SerializableFetchResponse` from requiring the DOM lib.

  `type` was declared as `ResponseType`, a name only `lib.dom.d.ts` publishes as a global. `@types/node` types the same property through `undici-types`, which exports the union as a _module_ type and never as a global — so in a Node-only program (`lib: ["esnext"]`, `types: ["node"]`) the declarations failed with `TS2552: Cannot find name 'ResponseType'`, while the `headers: Headers` on the line above resolved fine.

  ```ts
  // before
  type: ResponseType;

  // after
  type: Response['type'];
  ```

  `Response` is a global in both environments, so the property now resolves in either — to `undici-types`' union in Node and to the DOM one in a browser. The six members are the same today, no spec union is restated, and each environment keeps its own definition if they ever diverge. Nothing changes for a consumer who already had the DOM lib.

  Fixes [#255](https://github.com/dadajam4/fastkit/issues/255).

## 1.1.0

### Minor Changes

- [#250](https://github.com/dadajam4/fastkit/pull/250) [`762a7ee`](https://github.com/dadajam4/fastkit/commit/762a7ee847f9b541edb2c70185f81eac9d35abbb) Thanks [@dadajam4](https://github.com/dadajam4)! - Stop naming `axios` in the published types, so the optional peer is genuinely optional.

  `axios` is declared as an optional peer and the runtime never imported it — an axios error is recognised by the `isAxiosError` marker it carries. The **declarations** imported it unconditionally:

  ```ts
  import { AxiosError, AxiosRequestConfig } from 'axios';
  ```

  A declaration file has no notion of an optional import, so TypeScript had to resolve `axios` to check the file. Consumers without it got `TS2307: Cannot find module 'axios'`, and consumers with `skipLibCheck: true` got quietly unchecked members — a normalizer reading `axiosError.response?.data` was going unvalidated.

  The two types are now structural, so nothing in the package names the module:

  - `toAxiosErrorInfo()` accepts a new exported `AxiosErrorLike` — the part of an axios error the resolver actually reads. TypeScript is structural, so a real `AxiosError` still satisfies it and callers pass one unchanged (verified against `axios@1.18.1`).
  - `SerializableAxiosRequestConfig` declares its 15 fields directly instead of `Pick<AxiosRequestConfig, …>`, mirroring axios field by field: `method` keeps the HTTP-method union plus `(string & {})` exactly as axios' `StringLiteralsOrString<Method>` allows, `responseType` keeps its seven literals, `proxy` keeps its shape. `headers` is `any` — it describes the object _after_ the copy, where the value may be a plain object or an `AxiosHeaders` instance, and `SerializableAxiosResponse` already types `data` and `headers` that way.

  A type-level test keeps the mirrored shapes honest: `axios` stays a devDependency here, and `pnpm typecheck` asserts that `method`, `responseType`, `proxy`, `timeout` and `socketPath` are still mutually assignable with axios' own, and that a real `AxiosError` still satisfies `AxiosErrorLike`. If axios changes one of them, the build says so instead of the types drifting quietly.

  **The `axios` optional peer declaration is removed**, since nothing references the module any more. It also claimed `^1.6.0` while the duck-typing works with any axios that sets `isAxiosError`.

  **What can change for you:**

  - Without axios — the types resolve for the first time. Code reading members that do not exist on `AxiosErrorInfo` starts reporting errors instead of passing silently.
  - With axios — `config.headers` is now `any` rather than axios' own header union, because after the copy it may be a plain object or an `AxiosHeaders` instance. `method`, `responseType` and `proxy` keep their unions and shapes, composed the way axios composes them, so completion still works.

### Patch Changes

- Updated dependencies [[`e9da85f`](https://github.com/dadajam4/fastkit/commit/e9da85f5a48cfb0d63459144262f77d62775e980)]:
  - @fastkit/helpers@1.1.0

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

## 0.16.3

### Patch Changes

- Updated dependencies [[`d224120`](https://github.com/dadajam4/fastkit/commit/d224120639a248468c69d83f2791983cb61c248c)]:
  - @fastkit/helpers@0.17.0

## 0.16.2

### Patch Changes

- [#175](https://github.com/dadajam4/fastkit/pull/175) [`05d8bb4`](https://github.com/dadajam4/fastkit/commit/05d8bb4385811b677e323d2137a6d0e8a65186c5) Thanks [@dadajam4](https://github.com/dadajam4)! - Rebuild with the updated toolchain. No functional changes.

  `tsdown` moved from 0.22.3 to 0.22.14 (and with it rolldown from 1.1.3 to 1.2.0), which changes the emitted output even for packages whose sources are untouched — rolldown hoists some expressions into local bindings, and declaration printing differs in where it wraps lines. Comparing every `dist` file against `main`, built twice per side to filter out the known non-reproducible declaration output, 56 packages differ across 59 `.d.mts`, 26 `.map`, 18 `.mjs` and 1 `.css` file, all of them incidental.

  A few packages here also carry a refreshed dependency range — `fs-extra` 11.4.0, `typescript-eslint` 8.65.0, `eslint-plugin-vue` 10.10.0, `@vanilla-extract/rollup-plugin` 1.5.4. Each stays within the major the previous range already allowed, so resolution does not change for anyone; the declarations are just brought back in line.

  These are published together so the incidental output differences are versioned explicitly, rather than riding along unannounced in whatever release happens to touch these packages next.

- Updated dependencies [[`05d8bb4`](https://github.com/dadajam4/fastkit/commit/05d8bb4385811b677e323d2137a6d0e8a65186c5)]:
  - @fastkit/helpers@0.16.2

## 0.16.1

### Patch Changes

- [`d63b1af`](https://github.com/dadajam4/fastkit/commit/d63b1af8bf1bb131590ff540af82428cc60aeb7e) Thanks [@dadajam4](https://github.com/dadajam4)! - Strip the dangling `//# sourceMappingURL=*.d.mts.map` comment from emitted declaration files.

  tsdown (rolldown) appends this comment to every `.d.(m)ts` it emits but does not emit the referenced declaration map, so consumers' editors/build tools fail to resolve it. plugboy now removes the comment during build — but only when the referenced map is genuinely absent, so it becomes a no-op automatically if a future tsdown starts emitting real declaration maps.

  Every package in this monorepo is built by plugboy, so this patch re-publishes them all with declaration files that no longer point at a missing map.

- Updated dependencies [[`d63b1af`](https://github.com/dadajam4/fastkit/commit/d63b1af8bf1bb131590ff540af82428cc60aeb7e)]:
  - @fastkit/helpers@0.16.1

## 0.16.0

### Minor Changes

- [`b824e71`](https://github.com/dadajam4/fastkit/commit/b824e7136b57649d7958e257c21e8704267380e6) Thanks [@dadajam4](https://github.com/dadajam4)! - Release due to package bundler change. No functional changes included.

- Release accompanying the plugboy bundler migration (tsup → tsdown).

  No API changes are intended for this package. The minor bump exists because the package is rebuilt with the new bundler (tsdown / rolldown), and is published together so any incidental output differences are versioned explicitly.

### Patch Changes

- [`25602cb`](https://github.com/dadajam4/fastkit/commit/25602cbe1493cbeb10456b8b0e7680983d9e2ed7) Thanks [@dadajam4](https://github.com/dadajam4)! - Update dependencies and apply the associated fixes.

- Updated dependencies [[`b824e71`](https://github.com/dadajam4/fastkit/commit/b824e7136b57649d7958e257c21e8704267380e6), [`25602cb`](https://github.com/dadajam4/fastkit/commit/25602cbe1493cbeb10456b8b0e7680983d9e2ed7)]:
  - @fastkit/helpers@0.16.0

## 0.16.0-next.1

### Patch Changes

- Update dependencies and apply the associated fixes.

- Updated dependencies []:
  - @fastkit/helpers@0.16.0-next.1

## 0.16.0-next.0

### Minor Changes

- Release due to package bundler change. No functional changes included.

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.16.0-next.0

## 0.15.0

### Minor Changes

- Updated major dependencies.

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.15.0

## 0.14.7

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.14.5

## 0.14.6

### Patch Changes

- Updated dependencies only.

## 0.14.5

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.14.4

## 0.14.4

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.14.3

## 0.14.3

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.14.2

## 0.14.2

### Patch Changes

- Updated major dependencies.

## 0.14.1

### Patch Changes

- Reverted the removal of the `main` field that was introduced in the previous release and restored support for the old `moduleResolution`.

- Updated dependencies []:
  - @fastkit/helpers@0.14.1

## 0.14.0

### Minor Changes

- This release includes no functional changes, but it contains the following important updates:
  - Now adheres to ES Modules and the latest TypeScript standards, and the output for the `main` field and `typesVersions` is no longer generated.

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.14.0

## 0.13.15

### Patch Changes

- Refactored internal implementation due to a review of ESLint rules, with no changes to the specifications.

- Updated dependencies []:
  - @fastkit/helpers@0.13.8

## 0.13.14

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.13.7

## 0.13.13

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.13.6

## 0.13.12

### Patch Changes

- Fixed cases where information was missing for instance fields.
  - Resolved an issue where custom fields in the application were missing when enumerating keys for Catcher instances.
  - Addressed a situation where the stack of Catcher instances was missing when an empty stack was returned in the resolver.

## 0.13.11

### Patch Changes

- Addressed an issue where specifying override data during exception generation would result in invalid values being passed to the normalization function.

## 0.13.10

### Patch Changes

- Fixed an issue where the `unknown` exception argument was not being passed to the normalizer function.

## 0.13.9

### Patch Changes

- Fixed an issue where referencing `resolvedData` within the resolver function caused a RangeError due to an infinite loop.

## 0.13.8

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.13.5

## 0.13.7

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.13.4

## 0.13.6

### Patch Changes

- [#128](https://github.com/dadajam4/fastkit/pull/128) [`733de7f`](https://github.com/dadajam4/fastkit/commit/733de7fcc745933eca8b975aa80d8a78d23e6809) Thanks [@dadajam4](https://github.com/dadajam4)! - Export Native Error resolver type.

## 0.13.5

### Patch Changes

- [#122](https://github.com/dadajam4/fastkit/pull/122) [`d0c96fa`](https://github.com/dadajam4/fastkit/commit/d0c96faf96b6c91bcb8bc0b1ca9d22fc8ede303e) Thanks [@dadajam4](https://github.com/dadajam4)! - Update major and non-major packages

- Updated dependencies [[`d0c96fa`](https://github.com/dadajam4/fastkit/commit/d0c96faf96b6c91bcb8bc0b1ca9d22fc8ede303e)]:
  - @fastkit/helpers@0.13.3

## 0.13.4

### Patch Changes

- Updated dependencies [[`5b881b9`](https://github.com/dadajam4/fastkit/commit/5b881b94ce1852c12cc3c8f6954564d5235cba4d)]:
  - @fastkit/helpers@0.13.2

## 0.13.3

### Patch Changes

- [#116](https://github.com/dadajam4/fastkit/pull/116) [`1db21df`](https://github.com/dadajam4/fastkit/commit/1db21dfffd2df9b88bc481ff19e2a556f175e932) Thanks [@dadajam4](https://github.com/dadajam4)! - Enhanced comments by JSDocs for easier use in development.

## 0.13.2

### Patch Changes

- [#39](https://github.com/dadajam4/fastkit/pull/39) [`40ee82f`](https://github.com/dadajam4/fastkit/commit/40ee82f4501b88e44ad9b67918df2237298493a0) Thanks [@dadajam4](https://github.com/dadajam4)! - Dependencies have been updated.

## 0.13.1

### Patch Changes

- Updated dependencies [[`3ed3703a`](https://github.com/dadajam4/fastkit/commit/3ed3703aa9092bf47caed6ec192ef4d5a7621d34)]:
  - @fastkit/helpers@0.13.1

## 0.13.0

### Minor Changes

- First Release in Repository Migration.
