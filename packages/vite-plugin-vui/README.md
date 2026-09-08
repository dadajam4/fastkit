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
pnpm add @fastkit/vui @fastkit/vue-page vue vue-router
```

They have to be resolvable **from your project**, so install them directly. All of them
are declared as peer dependencies, but a peer declaration cannot place them for you:
pnpm puts only what your project itself declares into its `node_modules`, and a peer it
auto-installs lands in the virtual store, where the generated code cannot see it.

The generated code names no other package. It augments `@fastkit/vui` to replace its
placeholder types with your real icon names, color scopes and breakpoints, so the module
it augments is one your project declares by definition.

If any of them is missing, `viteVuiPlugin()` fails with the list. Without that check the
symptom is remote from the cause: the generator and `vite build` both succeed, while every
icon name falls back to its placeholder union and `tsc` reports hundreds of `TS2322`.

### Customizing the color scheme and breakpoints

The values are authored at build time, so the generators belong in
`devDependencies` — not in what ships with your app:

```bash
pnpm add -D @fastkit/color-scheme-gen @fastkit/media-match-gen @fastkit/icon-font-gen
```

`@fastkit/color-scheme-gen` re-exports the whole color-scheme authoring API
(`createColorScheme`, `createSimpleColorScheme`, the source types), so a fully custom
scheme needs nothing else. Whatever themes, palettes, scopes and variants you define show
up in `ThemeName`, `PaletteName`, `ScopeName` and `ColorVariant` as exported from
`@fastkit/vui`.

## Documentation
https://dadajam4.github.io/fastkit/vite-plugin-vui/
