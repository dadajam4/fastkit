---
'@fastkit/plugboy-vanilla-extract-plugin': minor
'@fastkit/plugboy-vue-plugin': minor
'@fastkit/plugboy-vue-jsx-plugin': minor
'@fastkit/ts-tiny-meta': patch
'@fastkit/vite-kit': patch
'@fastkit/vite-plugin-vui': patch
'@fastkit/vue-tiny-meta': patch
---

Move the Vite integration plugin to a dedicated `./vite` subpath export, and make the underlying Vite plugin an optional peer dependency.

The `ViteVanillaExtractPlugin` / `ViteVuePlugin` / `ViteVueJSXPlugin` helpers are no longer exported from the package root — import them from `@fastkit/plugboy-<name>-plugin/vite` instead. Because of this split, the main entry no longer loads the underlying Vite plugin (`@vanilla-extract/vite-plugin`, `@vitejs/plugin-vue`, `@vitejs/plugin-vue-jsx`), so build-only consumers no longer pull it in. These Vite plugins moved from `dependencies` to optional `peerDependencies`; install the corresponding one yourself when using the `/vite` integration.

`@fastkit/plugboy-vue-plugin`'s Vite helper was also renamed from `ViteVueJSXPlugin` to `ViteVuePlugin` (it wraps `@vitejs/plugin-vue`, not the JSX plugin).

In addition, the supported `vite` peer dependency range is unified to `^6.0.0 || ^7.0.0 || ^8.0.0` across all Vite-related packages — dropping the untested `^5.0.0`, adding `^8.0.0`, and aligning `@fastkit/vue-tiny-meta` which previously omitted `^8.0.0`.
