# @fastkit/vite-plugin-vui

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/vite-plugin-vui/README-ja.md)

## Installation

```bash
pnpm add @fastkit/vite-plugin-vui
```

### Peer dependencies

The plugin generates code into your project (`.vui/` by default), and that code imports
the following **by name**:

```bash
pnpm add @fastkit/vui @fastkit/vue-page @fastkit/icon-font @fastkit/color-scheme @fastkit/media-match vue vue-router
```

They have to be resolvable **from your project**, so install them directly. All of them
are declared as peer dependencies, but a peer declaration cannot place them for you:
pnpm puts only what your project itself declares into its `node_modules`, and a peer it
auto-installs lands in the virtual store, where the generated code cannot see it.

They also have to be the *same copies* the rest of your app uses. The generated code
augments `@fastkit/icon-font`, `@fastkit/color-scheme` and `@fastkit/media-match` to
replace their placeholder types with your real icon names, color scopes and breakpoints,
and a module augmentation only applies to the copy it resolves.

If any of them is missing, `viteVuiPlugin()` fails with the list. Without that check the
symptom is remote from the cause: the generator and `vite build` both succeed, while every
icon name falls back to its placeholder union and `tsc` reports hundreds of `TS2322`.

## Documentation
https://dadajam4.github.io/fastkit/vite-plugin-vui/
