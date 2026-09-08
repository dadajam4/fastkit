# @fastkit/icon-font-gen

## 0.16.3

### Patch Changes

- [#198](https://github.com/dadajam4/fastkit/pull/198) [`cb976bf`](https://github.com/dadajam4/fastkit/commit/cb976bf88268aca5d6101377644ec328e5730c02) Thanks [@dadajam4](https://github.com/dadajam4)! - Include the generator's version and options in the regeneration check.

  The decision to skip work compared only the source directory against the hash stored beside the output:

  ```ts
  const hash = new HashComparator(options.src, options.dest);
  ```

  so nothing about the generator itself entered into it. After upgrading `@fastkit/icon-font-gen` (or `@fastkit/vite-plugin-vui`), a project whose icon sources had not changed kept the **previously generated** output — indefinitely, even where the new version would emit something different. The same held for an option change: switching `formats` or `startUnicode` alone did not trigger a regeneration.

  Consumers were left deleting the output directory themselves whenever any `@fastkit/*` version moved, which is a workaround that has to guess which directories are generated and compares version strings rather than ranges.

  The comparison now also covers this package's version and the effective options for the entry. `src` and `dest` stay out of it: `src` has its own content hash, `dest` holds the meta file, and keeping absolute paths out leaves the meta file portable between machines and CI.

  Upgrading to this version regenerates each entry once, because a meta file written by an earlier version carries no record of these inputs.

- [#199](https://github.com/dadajam4/fastkit/pull/199) [`a879812`](https://github.com/dadajam4/fastkit/commit/a8798127ed358898d3e7315d54fff9f6d61e5838) Thanks [@dadajam4](https://github.com/dadajam4)! - Add `runtimeModule`, so the generated code can name a module the project already declares.

  The emitted `.ts` imported `registerIconNames` from — and augmented — `@fastkit/icon-font` by a hard-coded name:

  ```ts
  import { registerIconNames } from '@fastkit/icon-font';
  declare module '@fastkit/icon-font' {
    export interface IconNameMap { 'mdi-check': true, … }
  }
  ```

  That file lands in the _consuming_ project, so the specifier resolves from there, and pnpm places into a project's `node_modules` only what the project itself declares. Naming the leaf package therefore forced every project to declare `@fastkit/icon-font`, on top of whatever kit it was already using. A peer declaration cannot lift that: an auto-installed peer lands in the virtual store, where the generated tree cannot see it.

  `runtimeModule` names the module instead:

  ```ts
  generate({ entries, dest, runtimeModule: '@acme/ui' });
  ```

  The module it names has to re-export `@fastkit/icon-font`'s `registerIconNames`, `ICON_NAMES`, `IconName` and `IconNameMap`. Module augmentation follows a re-export to the interface it aliases, so `IconNameMap` still merges into the one `@fastkit/icon-font` declares and every derived type agrees — the project just never has to name it.

  The default is unchanged (`@fastkit/icon-font`), so standalone use, including the `icon-font` CLI, emits exactly what it did before.

  `runtimeModule` is part of the regeneration check, so changing it regenerates rather than leaving the old module name in place.

  **`@fastkit/icon-font` moves from `dependencies` to an optional peer dependency.** This package never imported it: the specifier existed only inside the emitted template, and what a package _emits_ is the consumer's to resolve, not something to install beside itself. It is optional because a project that points `runtimeModule` elsewhere does not need it at all.

  Under pnpm nothing changes — a nested copy was never visible to the generated tree, so a project using the default already had to declare `@fastkit/icon-font` itself. Under npm or Yarn it did resolve, by hoisting, and it will not any more: npm does not auto-install _optional_ peers. If you use this package standalone with the default `runtimeModule` on either, declare it:

  ```sh
  npm install @fastkit/icon-font
  ```

- Updated dependencies [[`d224120`](https://github.com/dadajam4/fastkit/commit/d224120639a248468c69d83f2791983cb61c248c), [`0c77aba`](https://github.com/dadajam4/fastkit/commit/0c77aba5e0256661de80a6e8c1f49515a73ea795), [`0c77aba`](https://github.com/dadajam4/fastkit/commit/0c77aba5e0256661de80a6e8c1f49515a73ea795), [`cb976bf`](https://github.com/dadajam4/fastkit/commit/cb976bf88268aca5d6101377644ec328e5730c02)]:
  - @fastkit/helpers@0.17.0
  - @fastkit/node-util@0.17.0
  - @fastkit/tiny-logger@0.16.3

## 0.16.2

### Patch Changes

- [#175](https://github.com/dadajam4/fastkit/pull/175) [`05d8bb4`](https://github.com/dadajam4/fastkit/commit/05d8bb4385811b677e323d2137a6d0e8a65186c5) Thanks [@dadajam4](https://github.com/dadajam4)! - Update `webfont` from 11.x to 12.x, and add `otf` to the supported icon font formats.

  `IconFontFormat` used to be derived through a deep `webfont/dist/src/types/OptionsBase` import. webfont 12 introduced an `exports` map that only publishes the package root, so that path is no longer reachable and `OptionsBase` is not part of the public type surface. The type is now derived from the exported `webfont` function's own signature, which removes the dependency on webfont's internal layout.

  webfont 12 also added `otf` to its format union, so `otf` (CSS `format("opentype")`) is now selectable through `formats`. The default is still `['woff2']`, so existing configurations generate exactly the same files — verified by regenerating the docs icon font under both 11.2.26 and 12.5.0 and comparing SHA-256 hashes of the emitted `.css`, `.ts` and `.woff2`, which are identical.

  Note that webfont 12 raises its Node requirement from `>=12.0.0` to `>=24.14.0`, and consumers of this package inherit that floor.

  Released as a patch even though `otf` is an addition. `@fastkit/vite-plugin-vui` declares this package as a peer dependency, so a minor here would move it outside the published `^0.16.x` range and force a major release of that package for no reason a consumer would recognise. Nothing is removed or renamed, and `formats` behaves identically unless `otf` is asked for, so keeping the version in range is the less disruptive trade.

- Updated dependencies [[`05d8bb4`](https://github.com/dadajam4/fastkit/commit/05d8bb4385811b677e323d2137a6d0e8a65186c5), [`05d8bb4`](https://github.com/dadajam4/fastkit/commit/05d8bb4385811b677e323d2137a6d0e8a65186c5)]:
  - @fastkit/node-util@0.16.2
  - @fastkit/ev@0.15.2
  - @fastkit/helpers@0.16.2
  - @fastkit/icon-font@2.2.3
  - @fastkit/tiny-logger@0.16.2

## 0.16.1

### Patch Changes

- [`d63b1af`](https://github.com/dadajam4/fastkit/commit/d63b1af8bf1bb131590ff540af82428cc60aeb7e) Thanks [@dadajam4](https://github.com/dadajam4)! - Strip the dangling `//# sourceMappingURL=*.d.mts.map` comment from emitted declaration files.

  tsdown (rolldown) appends this comment to every `.d.(m)ts` it emits but does not emit the referenced declaration map, so consumers' editors/build tools fail to resolve it. plugboy now removes the comment during build — but only when the referenced map is genuinely absent, so it becomes a no-op automatically if a future tsdown starts emitting real declaration maps.

  Every package in this monorepo is built by plugboy, so this patch re-publishes them all with declaration files that no longer point at a missing map.

- Updated dependencies [[`d63b1af`](https://github.com/dadajam4/fastkit/commit/d63b1af8bf1bb131590ff540af82428cc60aeb7e)]:
  - @fastkit/ev@0.15.1
  - @fastkit/helpers@0.16.1
  - @fastkit/icon-font@2.2.1
  - @fastkit/node-util@0.16.1
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
  - @fastkit/icon-font@2.2.0
  - @fastkit/node-util@0.16.0
  - @fastkit/helpers@0.16.0
  - @fastkit/ev@0.15.0

## 0.16.0-next.1

### Patch Changes

- Update dependencies and apply the associated fixes.

- Updated dependencies []:
  - @fastkit/tiny-logger@0.16.0-next.1
  - @fastkit/icon-font@2.2.0-next.1
  - @fastkit/node-util@0.16.0-next.1
  - @fastkit/helpers@0.16.0-next.1
  - @fastkit/ev@0.15.0-next.1

## 0.16.0-next.0

### Minor Changes

- Release due to package bundler change. No functional changes included.

### Patch Changes

- Updated dependencies []:
  - @fastkit/tiny-logger@0.16.0-next.0
  - @fastkit/icon-font@3.0.0-next.0
  - @fastkit/node-util@0.16.0-next.0
  - @fastkit/helpers@0.16.0-next.0
  - @fastkit/ev@0.15.0-next.0

## 0.15.0

### Minor Changes

- Updated major dependencies.

### Patch Changes

- Updated dependencies []:
  - @fastkit/node-util@0.15.0
  - @fastkit/helpers@0.15.0
  - @fastkit/tiny-logger@0.15.6
  - @fastkit/icon-font@2.1.0

## 0.14.13

### Patch Changes

- Updated dependencies []:
  - @fastkit/node-util@0.14.11
  - @fastkit/helpers@0.14.5
  - @fastkit/icon-font@2.0.7
  - @fastkit/tiny-logger@0.14.5

## 0.14.12

### Patch Changes

- Updated dependencies []:
  - @fastkit/node-util@0.14.10
  - @fastkit/icon-font@2.0.6

## 0.14.11

### Patch Changes

- Updated dependencies []:
  - @fastkit/node-util@0.14.9
  - @fastkit/icon-font@2.0.5

## 0.14.10

### Patch Changes

- Updated dependencies []:
  - @fastkit/icon-font@2.0.4

## 0.14.9

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.14.4
  - @fastkit/tiny-logger@0.14.4
  - @fastkit/node-util@0.14.8

## 0.14.8

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.14.3
  - @fastkit/tiny-logger@0.14.3
  - @fastkit/node-util@0.14.7

## 0.14.7

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.14.2
  - @fastkit/tiny-logger@0.14.2
  - @fastkit/node-util@0.14.6

## 0.14.6

### Patch Changes

- Updated dependencies []:
  - @fastkit/icon-font@2.0.3

## 0.14.5

### Patch Changes

- Updated major dependencies.

- Updated dependencies []:
  - @fastkit/node-util@0.14.5
  - @fastkit/icon-font@2.0.2

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
  - @fastkit/icon-font@2.0.1
  - @fastkit/node-util@0.14.1
  - @fastkit/helpers@0.14.1
  - @fastkit/ev@0.14.1

## 0.14.0

### Minor Changes

- This release includes no functional changes, but it contains the following important updates:
  - Now adheres to ES Modules and the latest TypeScript standards, and the output for the `main` field and `typesVersions` is no longer generated.

### Patch Changes

- Updated dependencies []:
  - @fastkit/tiny-logger@0.14.0
  - @fastkit/icon-font@2.0.0
  - @fastkit/node-util@0.14.0
  - @fastkit/helpers@0.14.0
  - @fastkit/ev@0.14.0

## 0.13.16

### Patch Changes

- Refactored internal implementation due to a review of ESLint rules, with no changes to the specifications.

- Updated dependencies []:
  - @fastkit/icon-font@1.0.10
  - @fastkit/node-util@0.13.9
  - @fastkit/helpers@0.13.8
  - @fastkit/ev@0.13.2
  - @fastkit/tiny-logger@0.13.8

## 0.13.15

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.13.7
  - @fastkit/tiny-logger@0.13.7
  - @fastkit/node-util@0.13.8

## 0.13.14

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.13.6
  - @fastkit/tiny-logger@0.13.6
  - @fastkit/node-util@0.13.7

## 0.13.13

### Patch Changes

- Added an option to customize `font-display`.

## 0.13.12

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.13.5
  - @fastkit/tiny-logger@0.13.5
  - @fastkit/node-util@0.13.6

## 0.13.11

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.13.4
  - @fastkit/tiny-logger@0.13.4
  - @fastkit/node-util@0.13.5

## 0.13.10

### Patch Changes

- [#122](https://github.com/dadajam4/fastkit/pull/122) [`d0c96fa`](https://github.com/dadajam4/fastkit/commit/d0c96faf96b6c91bcb8bc0b1ca9d22fc8ede303e) Thanks [@dadajam4](https://github.com/dadajam4)! - Update major and non-major packages

- Updated dependencies [[`d0c96fa`](https://github.com/dadajam4/fastkit/commit/d0c96faf96b6c91bcb8bc0b1ca9d22fc8ede303e)]:
  - @fastkit/node-util@0.13.4
  - @fastkit/helpers@0.13.3
  - @fastkit/ev@0.13.1
  - @fastkit/icon-font@1.0.9
  - @fastkit/tiny-logger@0.13.3

## 0.13.9

### Patch Changes

- Updated dependencies [[`5b881b9`](https://github.com/dadajam4/fastkit/commit/5b881b94ce1852c12cc3c8f6954564d5235cba4d)]:
  - @fastkit/tiny-logger@0.13.2
  - @fastkit/node-util@0.13.3
  - @fastkit/helpers@0.13.2
  - @fastkit/icon-font@1.0.8

## 0.13.8

### Patch Changes

- Updated dependencies []:
  - @fastkit/icon-font@1.0.7

## 0.13.7

### Patch Changes

- Updated dependencies []:
  - @fastkit/icon-font@1.0.6

## 0.13.6

### Patch Changes

- Updated dependencies [[`40ee82f`](https://github.com/dadajam4/fastkit/commit/40ee82f4501b88e44ad9b67918df2237298493a0)]:
  - @fastkit/node-util@0.13.2
  - @fastkit/icon-font@1.0.5

## 0.13.5

### Patch Changes

- Updated dependencies []:
  - @fastkit/icon-font@1.0.4

## 0.13.4

### Patch Changes

- Updated dependencies []:
  - @fastkit/icon-font@1.0.3

## 0.13.3

### Patch Changes

- Updated dependencies []:
  - @fastkit/icon-font@1.0.2

## 0.13.2

### Patch Changes

- Updated dependencies [[`3ed3703a`](https://github.com/dadajam4/fastkit/commit/3ed3703aa9092bf47caed6ec192ef4d5a7621d34)]:
  - @fastkit/helpers@0.13.1
  - @fastkit/tiny-logger@0.13.1
  - @fastkit/node-util@0.13.1

## 0.13.1

### Patch Changes

- Updated dependencies []:
  - @fastkit/icon-font@1.0.1

## 0.13.0

### Minor Changes

- First Release in Repository Migration.
