# @fastkit/plugboy-vue-plugin

## 1.1.0

### Minor Changes

- [`cd79340`](https://github.com/dadajam4/fastkit/commit/cd793404582f7fca56798b8dc0e46eafa39bc91b) Thanks [@dadajam4](https://github.com/dadajam4)! - Move the Vite integration plugin to a dedicated `./vite` subpath export, and make the underlying Vite plugin an optional peer dependency.

  The `ViteVanillaExtractPlugin` / `ViteVuePlugin` / `ViteVueJSXPlugin` helpers are no longer exported from the package root — import them from `@fastkit/plugboy-<name>-plugin/vite` instead. Because of this split, the main entry no longer loads the underlying Vite plugin (`@vanilla-extract/vite-plugin`, `@vitejs/plugin-vue`, `@vitejs/plugin-vue-jsx`), so build-only consumers no longer pull it in. These Vite plugins moved from `dependencies` to optional `peerDependencies`; install the corresponding one yourself when using the `/vite` integration.

  `@fastkit/plugboy-vue-plugin`'s Vite helper was also renamed from `ViteVueJSXPlugin` to `ViteVuePlugin` (it wraps `@vitejs/plugin-vue`, not the JSX plugin).

  In addition, the supported `vite` peer dependency range is unified to `^6.0.0 || ^7.0.0 || ^8.0.0` across all Vite-related packages — dropping the untested `^5.0.0`, adding `^8.0.0`, and aligning `@fastkit/vue-tiny-meta` which previously omitted `^8.0.0`.

### Patch Changes

- [`d63b1af`](https://github.com/dadajam4/fastkit/commit/d63b1af8bf1bb131590ff540af82428cc60aeb7e) Thanks [@dadajam4](https://github.com/dadajam4)! - Strip the dangling `//# sourceMappingURL=*.d.mts.map` comment from emitted declaration files.

  tsdown (rolldown) appends this comment to every `.d.(m)ts` it emits but does not emit the referenced declaration map, so consumers' editors/build tools fail to resolve it. plugboy now removes the comment during build — but only when the referenced map is genuinely absent, so it becomes a no-op automatically if a future tsdown starts emitting real declaration maps.

  Every package in this monorepo is built by plugboy, so this patch re-publishes them all with declaration files that no longer point at a missing map.

## 1.0.0

### Major Changes

- Major release: the plugboy toolchain migrates its internal bundler from **tsup (esbuild)** to **tsdown (rolldown)**.

  This is a large change that affects the workspace config schema, the plugin-authoring API, and several output details. See the migration guide for what changed and the steps to upgrade:

  https://github.com/dadajam4/fastkit/blob/main/packages/plugboy/docs/migrations/v1.md

### Patch Changes

- [`b824e71`](https://github.com/dadajam4/fastkit/commit/b824e7136b57649d7958e257c21e8704267380e6) Thanks [@dadajam4](https://github.com/dadajam4)! - First release.

- [`25602cb`](https://github.com/dadajam4/fastkit/commit/25602cbe1493cbeb10456b8b0e7680983d9e2ed7) Thanks [@dadajam4](https://github.com/dadajam4)! - Update dependencies and apply the associated fixes.

## 1.0.0-next.1

### Patch Changes

- Update dependencies and apply the associated fixes.

## 1.0.0-next.0

### Patch Changes

- First release.

- Updated dependencies []:
  - @fastkit/plugboy@1.0.0-next.0
