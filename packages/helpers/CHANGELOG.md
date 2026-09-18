# @fastkit/helpers

## 1.1.0

### Minor Changes

- [#253](https://github.com/dadajam4/fastkit/pull/253) [`e9da85f`](https://github.com/dadajam4/fastkit/commit/e9da85f5a48cfb0d63459144262f77d62775e980) Thanks [@dadajam4](https://github.com/dadajam4)! - Stop requiring Node's types for `isBuffer`, and fix `copyBuffer` in the browser.

  `isBuffer` and `copyBuffer` named `Buffer` in their signatures, so the published declarations needed `@types/node` — in a browser-first package that 21 others depend on, for two functions. Consumers without those types got `TS2591: Cannot find name 'Buffer'` from inside `@fastkit/helpers` with `skipLibCheck: false`, and silently unchecked members otherwise.

  ```ts
  // before
  declare function isBuffer(source: unknown): source is Buffer;
  declare function copyBuffer(cur: Buffer | ArrayBufferView): Buffer;

  // after
  declare function isBuffer<T extends Uint8Array = Uint8Array>(
    source: unknown,
  ): source is T;
  declare function copyBuffer(cur: Uint8Array | ArrayBufferView): Uint8Array;
  ```

  `isBuffer` narrows to `Uint8Array` by default, and a consumer who does have Node's types names what they expect: `isBuffer<Buffer>(value)` narrows to `Buffer` as before. `copyBuffer` is not generic — it _constructs_ the value, so a caller-chosen return type would be an unchecked cast — and `Buffer` extends `Uint8Array`, so the declared type covers what it returns either way.

  **`copyBuffer` no longer throws in a browser.** It called `Buffer.from` unconditionally, so it raised `ReferenceError: Buffer is not defined` wherever the global is absent — and `@fastkit/cloner` calls it for every `ArrayBufferView` it deep-clones, so cloning an object holding a typed array threw. It now takes the Node path only when the global exists and copies with plain ES otherwise. In Node the result is still a `Buffer`, still an independent copy, and a view's `byteOffset` is still respected.

  **What can change for you:** `copyBuffer`'s declared return is `Uint8Array` rather than `Buffer`, so `Buffer`-only methods on the result need a cast — or `isBuffer<Buffer>()` first. Reading it as bytes is unaffected.

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
  - @fastkit/ts-type-utils@1.0.0

## 0.17.0

### Minor Changes

- [#194](https://github.com/dadajam4/fastkit/pull/194) [`d224120`](https://github.com/dadajam4/fastkit/commit/d224120639a248468c69d83f2791983cb61c248c) Thanks [@dadajam4](https://github.com/dadajam4)! - **Breaking:** rename `DefaultsScheme` / `DefaultsSchemeSource` / `createIndexSignatureDefaultsScheme` to `DefaultsSchema` / `DefaultsSchemaSource` / `createIndexSignatureDefaultsSchema`.

  These describe the shape of default values, so the word is **schema** — a description of the structure of data — not **scheme**, which is a plan or an arrangement (a URI scheme, a color scheme). Every comparable API in the ecosystem spells it that way (JSON Schema, `zod`'s `ZodSchema`, Mongoose's `Schema`, GraphQL's schema), so `Scheme` here read as a typo.

  ### Migration

  A search and replace over the three names, longest first so the `Source` variant is not left half-renamed:

  | Before                               | After                                |
  | ------------------------------------ | ------------------------------------ |
  | `DefaultsSchemeSource`               | `DefaultsSchemaSource`               |
  | `DefaultsScheme`                     | `DefaultsSchema`                     |
  | `createIndexSignatureDefaultsScheme` | `createIndexSignatureDefaultsSchema` |

  ```sh
  # from the project root, adjust the path list to taste
  grep -rl 'DefaultsScheme\|createIndexSignatureDefaultsScheme' src \
    | xargs sed -i '' \
      -e 's/DefaultsSchemeSource/DefaultsSchemaSource/g' \
      -e 's/DefaultsScheme/DefaultsSchema/g' \
      -e 's/createIndexSignatureDefaultsScheme/createIndexSignatureDefaultsSchema/g'
  ```

  Nothing else changes: the types describe the same shapes, `mergeDefaults` behaves identically, and the parameter names inside it are renamed the same way (visible in editor signature hints only). No deprecated aliases are kept — the old names are gone in this release, so a missed reference fails at compile time rather than silently living on.

## 0.16.2

### Patch Changes

- [#175](https://github.com/dadajam4/fastkit/pull/175) [`05d8bb4`](https://github.com/dadajam4/fastkit/commit/05d8bb4385811b677e323d2137a6d0e8a65186c5) Thanks [@dadajam4](https://github.com/dadajam4)! - Rebuild with the updated toolchain. No functional changes.

  `tsdown` moved from 0.22.3 to 0.22.14 (and with it rolldown from 1.1.3 to 1.2.0), which changes the emitted output even for packages whose sources are untouched — rolldown hoists some expressions into local bindings, and declaration printing differs in where it wraps lines. Comparing every `dist` file against `main`, built twice per side to filter out the known non-reproducible declaration output, 56 packages differ across 59 `.d.mts`, 26 `.map`, 18 `.mjs` and 1 `.css` file, all of them incidental.

  A few packages here also carry a refreshed dependency range — `fs-extra` 11.4.0, `typescript-eslint` 8.65.0, `eslint-plugin-vue` 10.10.0, `@vanilla-extract/rollup-plugin` 1.5.4. Each stays within the major the previous range already allowed, so resolution does not change for anyone; the declarations are just brought back in line.

  These are published together so the incidental output differences are versioned explicitly, rather than riding along unannounced in whatever release happens to touch these packages next.

## 0.16.1

### Patch Changes

- [`d63b1af`](https://github.com/dadajam4/fastkit/commit/d63b1af8bf1bb131590ff540af82428cc60aeb7e) Thanks [@dadajam4](https://github.com/dadajam4)! - Strip the dangling `//# sourceMappingURL=*.d.mts.map` comment from emitted declaration files.

  tsdown (rolldown) appends this comment to every `.d.(m)ts` it emits but does not emit the referenced declaration map, so consumers' editors/build tools fail to resolve it. plugboy now removes the comment during build — but only when the referenced map is genuinely absent, so it becomes a no-op automatically if a future tsdown starts emitting real declaration maps.

  Every package in this monorepo is built by plugboy, so this patch re-publishes them all with declaration files that no longer point at a missing map.

## 0.16.0

### Minor Changes

- [`b824e71`](https://github.com/dadajam4/fastkit/commit/b824e7136b57649d7958e257c21e8704267380e6) Thanks [@dadajam4](https://github.com/dadajam4)! - Release due to package bundler change. No functional changes included.

- Release accompanying the plugboy bundler migration (tsup → tsdown).

  No API changes are intended for this package. The minor bump exists because the package is rebuilt with the new bundler (tsdown / rolldown), and is published together so any incidental output differences are versioned explicitly.

### Patch Changes

- [`25602cb`](https://github.com/dadajam4/fastkit/commit/25602cbe1493cbeb10456b8b0e7680983d9e2ed7) Thanks [@dadajam4](https://github.com/dadajam4)! - Update dependencies and apply the associated fixes.

- Updated dependencies [[`25602cb`](https://github.com/dadajam4/fastkit/commit/25602cbe1493cbeb10456b8b0e7680983d9e2ed7)]:
  - @fastkit/ts-type-utils@0.3.0

## 0.16.0-next.1

### Patch Changes

- Update dependencies and apply the associated fixes.

- Updated dependencies []:
  - @fastkit/ts-type-utils@0.2.2-next.0

## 0.16.0-next.0

### Minor Changes

- Release due to package bundler change. No functional changes included.

## 0.15.0

### Minor Changes

- Added helper functions for string manipulation:
  - `toCamelCase`
  - `toKebabCase`

## 0.14.5

### Patch Changes

- Added a function (temporaryObjectID) to generate unique IDs from object references.

## 0.14.4

### Patch Changes

- Added multiple object mixin helper.

## 0.14.3

### Patch Changes

- Added a method `removeSpace` for removing all spaces and tab characters.

## 0.14.2

### Patch Changes

- Added support for setters to proxies generated by the mixin function.

## 0.14.1

### Patch Changes

- Reverted the removal of the `main` field that was introduced in the previous release and restored support for the old `moduleResolution`.

## 0.14.0

### Minor Changes

- This release includes no functional changes, but it contains the following important updates:
  - Now adheres to ES Modules and the latest TypeScript standards, and the output for the `main` field and `typesVersions` is no longer generated.

### Patch Changes

- Updated dependencies []:
  - @fastkit/ts-type-utils@0.2.0

## 0.13.8

### Patch Changes

- Refactored internal implementation due to a review of ESLint rules, with no changes to the specifications.

- Updated dependencies []:
  - @fastkit/ts-type-utils@0.1.2

## 0.13.7

### Patch Changes

- Added a helper for mixing in additional interfaces to objects.

## 0.13.6

### Patch Changes

- Implemented conversion of full-width whitespace to half-width in `toHalfWidth`.

## 0.13.5

### Patch Changes

- Added method (`omitProperties`) to omit partial properties from objects.

## 0.13.4

### Patch Changes

- Added method (`pickProperties`) to extract partial properties from objects.

## 0.13.3

### Patch Changes

- [#122](https://github.com/dadajam4/fastkit/pull/122) [`d0c96fa`](https://github.com/dadajam4/fastkit/commit/d0c96faf96b6c91bcb8bc0b1ca9d22fc8ede303e) Thanks [@dadajam4](https://github.com/dadajam4)! - Update major and non-major packages

- Updated dependencies [[`d0c96fa`](https://github.com/dadajam4/fastkit/commit/d0c96faf96b6c91bcb8bc0b1ca9d22fc8ede303e)]:
  - @fastkit/ts-type-utils@0.1.1

## 0.13.2

### Patch Changes

- [#120](https://github.com/dadajam4/fastkit/pull/120) [`5b881b9`](https://github.com/dadajam4/fastkit/commit/5b881b94ce1852c12cc3c8f6954564d5235cba4d) Thanks [@dadajam4](https://github.com/dadajam4)! - JSDocs were added and no-console lint improvements were made.

## 0.13.1

### Patch Changes

- [#24](https://github.com/dadajam4/fastkit/pull/24) [`3ed3703a`](https://github.com/dadajam4/fastkit/commit/3ed3703aa9092bf47caed6ec192ef4d5a7621d34) Thanks [@dadajam4](https://github.com/dadajam4)! - Added method for indentation normalization

## 0.13.0

### Minor Changes

- First Release in Repository Migration.
