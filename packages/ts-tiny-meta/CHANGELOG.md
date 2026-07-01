# @fastkit/ts-tiny-meta

## 1.2.1

### Patch Changes

- [`d63b1af`](https://github.com/dadajam4/fastkit/commit/d63b1af8bf1bb131590ff540af82428cc60aeb7e) Thanks [@dadajam4](https://github.com/dadajam4)! - Strip the dangling `//# sourceMappingURL=*.d.mts.map` comment from emitted declaration files.

  tsdown (rolldown) appends this comment to every `.d.(m)ts` it emits but does not emit the referenced declaration map, so consumers' editors/build tools fail to resolve it. plugboy now removes the comment during build — but only when the referenced map is genuinely absent, so it becomes a no-op automatically if a future tsdown starts emitting real declaration maps.

  Every package in this monorepo is built by plugboy, so this patch re-publishes them all with declaration files that no longer point at a missing map.

- [`cd79340`](https://github.com/dadajam4/fastkit/commit/cd793404582f7fca56798b8dc0e46eafa39bc91b) Thanks [@dadajam4](https://github.com/dadajam4)! - Move the Vite integration plugin to a dedicated `./vite` subpath export, and make the underlying Vite plugin an optional peer dependency.

  The `ViteVanillaExtractPlugin` / `ViteVuePlugin` / `ViteVueJSXPlugin` helpers are no longer exported from the package root — import them from `@fastkit/plugboy-<name>-plugin/vite` instead. Because of this split, the main entry no longer loads the underlying Vite plugin (`@vanilla-extract/vite-plugin`, `@vitejs/plugin-vue`, `@vitejs/plugin-vue-jsx`), so build-only consumers no longer pull it in. These Vite plugins moved from `dependencies` to optional `peerDependencies`; install the corresponding one yourself when using the `/vite` integration.

  `@fastkit/plugboy-vue-plugin`'s Vite helper was also renamed from `ViteVueJSXPlugin` to `ViteVuePlugin` (it wraps `@vitejs/plugin-vue`, not the JSX plugin).

  In addition, the supported `vite` peer dependency range is unified to `^6.0.0 || ^7.0.0 || ^8.0.0` across all Vite-related packages — dropping the untested `^5.0.0`, adding `^8.0.0`, and aligning `@fastkit/vue-tiny-meta` which previously omitted `^8.0.0`.

## 1.2.0

### Minor Changes

- [`b824e71`](https://github.com/dadajam4/fastkit/commit/b824e7136b57649d7958e257c21e8704267380e6) Thanks [@dadajam4](https://github.com/dadajam4)! - Release due to package bundler change. No functional changes included.

- Release accompanying the plugboy bundler migration (tsup → tsdown).

  No API changes are intended for this package. The minor bump exists because the package is rebuilt with the new bundler (tsdown / rolldown), and is published together so any incidental output differences are versioned explicitly.

### Patch Changes

- [`25602cb`](https://github.com/dadajam4/fastkit/commit/25602cbe1493cbeb10456b8b0e7680983d9e2ed7) Thanks [@dadajam4](https://github.com/dadajam4)! - Update dependencies and apply the associated fixes.

## 1.2.0-next.1

### Patch Changes

- Update dependencies and apply the associated fixes.

## 1.2.0-next.0

### Minor Changes

- Release due to package bundler change. No functional changes included.

## 1.1.0

### Minor Changes

- Updated major dependencies.

## 1.0.0

### Major Changes

- [#153](https://github.com/dadajam4/fastkit/pull/153) [`2a9ac68`](https://github.com/dadajam4/fastkit/commit/2a9ac68653d4335d761d958a4061098218faaa0e) Thanks [@nkenji09](https://github.com/nkenji09)! - Now supports Vite 7 series

## 1.0.0-next.0

### Major Changes

- [#153](https://github.com/dadajam4/fastkit/pull/153) [`c650b4a`](https://github.com/dadajam4/fastkit/commit/c650b4a3813c891b5e21c6dd68cac981ac01d465) Thanks [@nkenji09](https://github.com/nkenji09)! - Now supports Vite 7 series

## 0.3.0

### Minor Changes

- [#148](https://github.com/dadajam4/fastkit/pull/148) [`8b66410`](https://github.com/dadajam4/fastkit/commit/8b66410e3423016c76956f772b86426dec99a0e7) Thanks [@nkenji09](https://github.com/nkenji09)! - 依存パッケージのアップデートを行いました

## 0.2.6

### Patch Changes

- Dependency updates only.

## 0.2.5

### Patch Changes

- Updated dependencies.

## 0.2.4

### Patch Changes

- Updated dependencies.

## 0.2.3

### Patch Changes

- Updated dependencies only.

## 0.2.2

### Patch Changes

- Updated major dependencies.

## 0.2.1

### Patch Changes

- Reverted the removal of the `main` field that was introduced in the previous release and restored support for the old `moduleResolution`.

## 0.2.0

### Minor Changes

- This release includes no functional changes, but it contains the following important updates:
  - Now adheres to ES Modules and the latest TypeScript standards, and the output for the `main` field and `typesVersions` is no longer generated.

## 0.1.8

### Patch Changes

- Refactored internal implementation due to a review of ESLint rules, with no changes to the specifications.

## 0.1.7

### Patch Changes

- Resolved an issue where the Watcher process did not terminate properly in Vite's Production build, leading to build failures in tools like Storybook.

## 0.1.6

### Patch Changes

- [#122](https://github.com/dadajam4/fastkit/pull/122) [`d0c96fa`](https://github.com/dadajam4/fastkit/commit/d0c96faf96b6c91bcb8bc0b1ca9d22fc8ede303e) Thanks [@dadajam4](https://github.com/dadajam4)! - Update major and non-major packages

## 0.1.5

### Patch Changes

- [#120](https://github.com/dadajam4/fastkit/pull/120) [`5b881b9`](https://github.com/dadajam4/fastkit/commit/5b881b94ce1852c12cc3c8f6954564d5235cba4d) Thanks [@dadajam4](https://github.com/dadajam4)! - JSDocs were added and no-console lint improvements were made.

## 0.1.4

### Patch Changes

- [#49](https://github.com/dadajam4/fastkit/pull/49) [`53af680`](https://github.com/dadajam4/fastkit/commit/53af680b854d7f5f86c36f1ab51e43043f49eaa5) Thanks [@dadajam4](https://github.com/dadajam4)! - Clean up unnecessary TYPE text.

## 0.1.3

### Patch Changes

- [#47](https://github.com/dadajam4/fastkit/pull/47) [`84602ce`](https://github.com/dadajam4/fastkit/commit/84602ce0512c744d0e9e1e7a8f78acf383e03076) Thanks [@dadajam4](https://github.com/dadajam4)! - Omit namespace in type string.

## 0.1.2

### Patch Changes

- [#45](https://github.com/dadajam4/fastkit/pull/45) [`c6aee31`](https://github.com/dadajam4/fastkit/commit/c6aee31d3393bc07bdca5a08e04919e847932698) Thanks [@dadajam4](https://github.com/dadajam4)! - Plug-ins can now be set up in Workspace.

## 0.1.1

### Patch Changes

- [#39](https://github.com/dadajam4/fastkit/pull/39) [`40ee82f`](https://github.com/dadajam4/fastkit/commit/40ee82f4501b88e44ad9b67918df2237298493a0) Thanks [@dadajam4](https://github.com/dadajam4)! - Dependencies have been updated.

## 0.1.0

### Minor Changes

- [#20](https://github.com/dadajam4/fastkit/pull/20) [`934ea01d`](https://github.com/dadajam4/fastkit/commit/934ea01d72a19392a3b494d5308fa90cccb357ab) Thanks [@dadajam4](https://github.com/dadajam4)! - Initial release
