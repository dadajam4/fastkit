# @fastkit/node-util

## 0.17.0

### Minor Changes

- [#198](https://github.com/dadajam4/fastkit/pull/198) [`cb976bf`](https://github.com/dadajam4/fastkit/commit/cb976bf88268aca5d6101377644ec328e5730c02) Thanks [@dadajam4](https://github.com/dadajam4)! - `HashComparator` can fold extra inputs into its comparison.

  A directory hash of `src` answers "did the sources change". It cannot answer "would this run produce something different", which is also decided by the generator's own version and its effective options — neither of which appears in a directory hash. So output could stay in place across an upgrade that would have produced something else.

  `inputs` covers that:

  ```ts
  const hash = new HashComparator(src, dest, {
    inputs: { generator: pkg.version, options },
  });
  ```

  Anything passed is serialized with object keys sorted — so the order an options object happened to be built in is not a change — hashed, and stored beside the source hash as `inputsHash`. `hasChanged()` compares both. The source hash itself keeps its exact previous meaning, and a meta file written before this existed has no `inputsHash`, which compares unequal to any inputs and therefore regenerates once.

  Arrays keep their order significant, since `['woff2', 'otf']` and `['otf', 'woff2']` are different requests.

  Omitting `inputs` behaves exactly as before.

### Patch Changes

- [#195](https://github.com/dadajam4/fastkit/pull/195) [`0c77aba`](https://github.com/dadajam4/fastkit/commit/0c77aba5e0256661de80a6e8c1f49515a73ea795) Thanks [@dadajam4](https://github.com/dadajam4)! - Keep the `esbuildRequire` cache directory name within the filename length limit.

  The name was the entry point's **absolute path** with every separator replaced by `_`, collapsing the whole path into one segment. Most filesystems cap a single path segment at 255 bytes (`NAME_MAX`), so a deep enough entry point failed the build outright:

  ```
  ✘ [ERROR] Failed to create output directory: mkdir
    .../node_modules/.esbuild-require/_Users_me_projects_app_node_modules_.pnpm_@fastkit+vui@0.19.23_…_dist_builtins_color-scheme.ts:
    file name too long
  ```

  Any consumer passing a path from `require.resolve()` reaches this quickly, because Node returns the realpath — under pnpm that means the virtual store directory, peer-dependency hash included. Measured in a real monorepo, the same entry point flattens to 92 bytes as a symlink path under the repository root and 232 as a realpath, so checking the repository out one directory deeper was enough to break it.

  The name is now the entry point's basename plus a 16-character hash of its absolute path: unique per entry point, stable across runs, readable, and at most 77 bytes. Everything outside `[A-Za-z0-9_.-]` in the basename is replaced, so each character is one byte and the bound holds for a non-ASCII path too. This also fixes Windows in passing — only `/` was replaced, so a `C:\…` path kept its separators and its drive colon.

  Cache directories written by earlier versions are left behind under `node_modules/.esbuild-require/`; they are a cache and can be deleted.

- [#195](https://github.com/dadajam4/fastkit/pull/195) [`0c77aba`](https://github.com/dadajam4/fastkit/commit/0c77aba5e0256661de80a6e8c1f49515a73ea795) Thanks [@dadajam4](https://github.com/dadajam4)! - Resolve `esbuild` from this package rather than from the consumer.

  `esbuildRequire()` marks `esbuild` external and writes the resulting CommonJS bundle into the **consumer's** `node_modules/.esbuild-require/`. The bare specifier left in it therefore resolved from the consumer's package at require time, not from `@fastkit/node-util` — so with pnpm's default layout, a consumer that did not declare `esbuild` itself got:

  ```
  Error: Cannot find module 'esbuild'
  Require stack:
  - <pkg>/node_modules/.esbuild-require/<flattened path>/index.js
  - <root>/node_modules/.pnpm/@fastkit+node-util@…/node_modules/@fastkit/node-util/dist/node-util.mjs
  ```

  `@fastkit/node-util` already depends on `esbuild`, so the requirement should never have reached the consumer. It also could not be satisfied honestly: the consumer had to pick a version, and any mismatch meant one esbuild produced the bundle while another executed it.

  The specifier is now resolved to the absolute path of the esbuild this package itself uses, so the emitted bundle carries no bare `esbuild` and the two are always the same copy. Resolution happens only when an entry point actually imports esbuild, so nothing changes for one that does not.

  A project that added `esbuild` to a package's `devDependencies` purely to satisfy this — the reporter had to do so in five of them, none of which imports esbuild — can drop it, along with any range pinned to match `@fastkit/node-util`.

- Updated dependencies []:
  - @fastkit/tiny-logger@0.16.3

## 0.16.2

### Patch Changes

- [#175](https://github.com/dadajam4/fastkit/pull/175) [`05d8bb4`](https://github.com/dadajam4/fastkit/commit/05d8bb4385811b677e323d2137a6d0e8a65186c5) Thanks [@dadajam4](https://github.com/dadajam4)! - Update `execa` from 9.x to 10.x.

  No code changes were needed. Every call site uses the plain `execa(file, args, options)` form and only awaits the result or reads `stdout` / `stderr`, so none of execa 10's removals apply — `execaCommand()` / `execaCommandSync()`, the `stdio: [..., 'ipc']` syntax, and the `ChildProcess` methods that moved behind `subprocess.nodeChildProcess` are all unused, as is the `input` / `inputFile` behaviour change.

  Both packages are bumped together so a single execa major is installed rather than two side by side.

- Updated dependencies [[`05d8bb4`](https://github.com/dadajam4/fastkit/commit/05d8bb4385811b677e323d2137a6d0e8a65186c5)]:
  - @fastkit/ev@0.15.2
  - @fastkit/tiny-logger@0.16.2

## 0.16.1

### Patch Changes

- [`d63b1af`](https://github.com/dadajam4/fastkit/commit/d63b1af8bf1bb131590ff540af82428cc60aeb7e) Thanks [@dadajam4](https://github.com/dadajam4)! - Strip the dangling `//# sourceMappingURL=*.d.mts.map` comment from emitted declaration files.

  tsdown (rolldown) appends this comment to every `.d.(m)ts` it emits but does not emit the referenced declaration map, so consumers' editors/build tools fail to resolve it. plugboy now removes the comment during build — but only when the referenced map is genuinely absent, so it becomes a no-op automatically if a future tsdown starts emitting real declaration maps.

  Every package in this monorepo is built by plugboy, so this patch re-publishes them all with declaration files that no longer point at a missing map.

- Updated dependencies [[`d63b1af`](https://github.com/dadajam4/fastkit/commit/d63b1af8bf1bb131590ff540af82428cc60aeb7e)]:
  - @fastkit/ev@0.15.1
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
  - @fastkit/ev@0.15.0

## 0.16.0-next.1

### Patch Changes

- Update dependencies and apply the associated fixes.

- Updated dependencies []:
  - @fastkit/tiny-logger@0.16.0-next.1
  - @fastkit/ev@0.15.0-next.1

## 0.16.0-next.0

### Minor Changes

- Release due to package bundler change. No functional changes included.

### Patch Changes

- Updated dependencies []:
  - @fastkit/tiny-logger@0.16.0-next.0
  - @fastkit/ev@0.15.0-next.0

## 0.15.0

### Minor Changes

- Updated major dependencies.

### Patch Changes

- Updated dependencies []:
  - @fastkit/tiny-logger@0.15.0

## 0.14.11

### Patch Changes

- Dependency updates only.

- Updated dependencies []:
  - @fastkit/tiny-logger@0.14.5

## 0.14.10

### Patch Changes

- Updated dependencies.

## 0.14.9

### Patch Changes

- Updated dependencies.

## 0.14.8

### Patch Changes

- Updated dependencies []:
  - @fastkit/tiny-logger@0.14.4

## 0.14.7

### Patch Changes

- Updated dependencies []:
  - @fastkit/tiny-logger@0.14.3

## 0.14.6

### Patch Changes

- Updated dependencies []:
  - @fastkit/tiny-logger@0.14.2

## 0.14.5

### Patch Changes

- Updated major dependencies.

## 0.14.4

### Patch Changes

- Fixed the escape processing to prevent unnecessary replacement of `__dirname` and `__filename` implementations.

## 0.14.3

### Patch Changes

- Added the `external` option to the `esbuildRequire` method.

## 0.14.2

### Patch Changes

- Added support for the `__dirname` and `__filename` constants.

## 0.14.1

### Patch Changes

- Reverted the removal of the `main` field that was introduced in the previous release and restored support for the old `moduleResolution`.

- Updated dependencies []:
  - @fastkit/tiny-logger@0.14.1
  - @fastkit/ev@0.14.1

## 0.14.0

### Minor Changes

- This release includes no functional changes, but it contains the following important updates:
  - Now adheres to ES Modules and the latest TypeScript standards, and the output for the `main` field and `typesVersions` is no longer generated.

### Patch Changes

- Updated dependencies []:
  - @fastkit/tiny-logger@0.14.0
  - @fastkit/ev@0.14.0

## 0.13.9

### Patch Changes

- Refactored internal implementation due to a review of ESLint rules, with no changes to the specifications.

- Updated dependencies []:
  - @fastkit/ev@0.13.2
  - @fastkit/tiny-logger@0.13.8

## 0.13.8

### Patch Changes

- Updated dependencies []:
  - @fastkit/tiny-logger@0.13.7

## 0.13.7

### Patch Changes

- Updated dependencies []:
  - @fastkit/tiny-logger@0.13.6

## 0.13.6

### Patch Changes

- Updated dependencies []:
  - @fastkit/tiny-logger@0.13.5

## 0.13.5

### Patch Changes

- Updated dependencies []:
  - @fastkit/tiny-logger@0.13.4

## 0.13.4

### Patch Changes

- [#122](https://github.com/dadajam4/fastkit/pull/122) [`d0c96fa`](https://github.com/dadajam4/fastkit/commit/d0c96faf96b6c91bcb8bc0b1ca9d22fc8ede303e) Thanks [@dadajam4](https://github.com/dadajam4)! - Update major and non-major packages

- Updated dependencies [[`d0c96fa`](https://github.com/dadajam4/fastkit/commit/d0c96faf96b6c91bcb8bc0b1ca9d22fc8ede303e)]:
  - @fastkit/ev@0.13.1
  - @fastkit/tiny-logger@0.13.3

## 0.13.3

### Patch Changes

- [#120](https://github.com/dadajam4/fastkit/pull/120) [`5b881b9`](https://github.com/dadajam4/fastkit/commit/5b881b94ce1852c12cc3c8f6954564d5235cba4d) Thanks [@dadajam4](https://github.com/dadajam4)! - JSDocs were added and no-console lint improvements were made.

- Updated dependencies [[`5b881b9`](https://github.com/dadajam4/fastkit/commit/5b881b94ce1852c12cc3c8f6954564d5235cba4d)]:
  - @fastkit/tiny-logger@0.13.2

## 0.13.2

### Patch Changes

- [#39](https://github.com/dadajam4/fastkit/pull/39) [`40ee82f`](https://github.com/dadajam4/fastkit/commit/40ee82f4501b88e44ad9b67918df2237298493a0) Thanks [@dadajam4](https://github.com/dadajam4)! - Dependencies have been updated.

## 0.13.1

### Patch Changes

- Updated dependencies []:
  - @fastkit/tiny-logger@0.13.1

## 0.13.0

### Minor Changes

- First Release in Repository Migration.
