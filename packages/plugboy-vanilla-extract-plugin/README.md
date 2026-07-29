# @fastkit/plugboy-vanilla-extract-plugin

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/plugboy-vanilla-extract-plugin/README-ja.md)

A plugin that integrates [Vanilla Extract](https://vanilla-extract.style/) into [Plugboy](https://github.com/dadajam4/fastkit/blob/main/packages/plugboy/README.md) builds. It bundles the CSS extracted from `.css.ts` files into a single stylesheet per package, ships a Vite plugin for development, and provides helpers for working with cascade layers.

## Features

- **Single CSS output**: Combines the styles extracted from a package's `.css.ts` files into one `dist/<package>.css`, together with any plain `.css` / `.scss` the package imports.
- **Handled by tsdown's CSS pipeline**: The extracted CSS is handed to tsdown as an ordinary CSS module, so every [`css` option](https://github.com/dadajam4/fastkit/blob/main/packages/plugboy/README.md#css-options) applies to it — `target` (vendor prefixes and syntax lowering), `transformer` (lightningcss or postcss), `minify`, preprocessor options — as do plugboy's own `optimizeCSS` optimizations.
- **Vite integration**: Ships a Vite plugin for use in dev servers, Storybook, and similar environments.
- **Layer helpers**: `@fastkit/plugboy-vanilla-extract-plugin/css` exposes utilities for defining cascade layers in a type-safe way.

> [!NOTE]
> Preserving external `@import`s (e.g. `@import url('material-symbols/rounded.css') layer(...)`) and ordering `@layer` declarations are handled by [Plugboy](https://github.com/dadajam4/fastkit/blob/main/packages/plugboy/README.md) itself, and apply to the CSS this plugin combines as well.

## Installation

```bash
npm install -D @fastkit/plugboy-vanilla-extract-plugin
# or
pnpm add -D @fastkit/plugboy-vanilla-extract-plugin
```

> [!NOTE]
> Requires `@fastkit/plugboy` as a peer dependency. When using the Vite integration (`@fastkit/plugboy-vanilla-extract-plugin/vite`), `vite` and `@vanilla-extract/vite-plugin` are also required as peer dependencies — install them yourself. The main entry never loads them, so build-only usage needs neither.

## Usage

### 1. Register in the build

Add it to the `plugins` of `plugboy.project.ts` (project-wide) or a per-workspace `plugboy.workspace.ts`. It activates automatically for packages that contain `.css.ts` files.

```typescript
import { defineProjectConfig } from '@fastkit/plugboy';
import { createVanillaExtractPlugin } from '@fastkit/plugboy-vanilla-extract-plugin';

export default defineProjectConfig({
  plugins: [
    createVanillaExtractPlugin({
      // Identifier format for class names etc. ('short' recommended for production)
      identifiers: 'short',
    }),
  ],
});
```

On build, the package styles are combined into `dist/<package>.css`.

### 2. Use with Vite (dev / Storybook, etc.)

For environments that resolve Vanilla Extract without a Plugboy build (Vite dev server, Storybook, etc.), use the Vite plugin.

```typescript
import { defineConfig } from 'vite';
import { ViteVanillaExtractPlugin } from '@fastkit/plugboy-vanilla-extract-plugin/vite';

export default defineConfig({
  plugins: [
    ViteVanillaExtractPlugin({
      identifiers: 'debug',
    }),
  ],
});
```

### 3. Cascade layer helpers (`/css`)

`@fastkit/plugboy-vanilla-extract-plugin/css` lets you define nestable cascade layers in a type-safe way.

```typescript
import { defineLayerStyle } from '@fastkit/plugboy-vanilla-extract-plugin/css';

export const framework = defineLayerStyle({ globalName: 'my-ui' });

export const base = framework.defineNestedLayer({ globalName: 'base' });
export const component = framework.defineNestedLayer({ globalName: 'component' });
```

## Options

The main options accepted by `createVanillaExtractPlugin(options)` / `ViteVanillaExtractPlugin(options)`.

| Option | Type | Description |
| --- | --- | --- |
| `identifiers` | `'short' \| 'debug' \| ((meta) => string)` | Format of generated identifiers such as class names. Use `'short'` for production builds and `'debug'` while debugging. |
| `esbuildOptions` | `EsbuildOptions` | Options forwarded to esbuild when compiling `.css.ts` files. |

### Reserved `css` options

This plugin sets plugboy's `css.splitting` and `css.fileName` for the workspaces
it is registered in, so the emitted stylesheets match the CSS exports plugboy
declares — `./<entry>.css` for every entry with `css: true`:

- One such entry (the common case): `splitting: false` and
  `fileName: '<package>.css'` — a single stylesheet for the package.
- Several: `splitting: true`, so tsdown emits one stylesheet per output chunk,
  named after it. `splitting: false` would collect the package into one file and
  keep only one chunk's CSS, silently dropping the rest.

Configuration wins over plugin defaults, so declaring either key is applied as
written, and the emitted file names may then no longer match those exports. Every
other `css` option (`target`, `transformer`, `minify`, `preprocessorOptions`,
`lightningcss`, `postcss`, `modules`, …) is free to use and applies to the
extracted CSS as well.

> [!NOTE]
> With several CSS entries, a `.css.ts` imported by more than one of them is
> placed in a shared chunk, so its CSS lands in that chunk's own stylesheet rather
> than being duplicated into each entry's. `./<entry>.css` is then not
> self-contained.

### How the CSS reaches the output

`@vanilla-extract/rollup-plugin` compiles a `.css.ts` to JavaScript plus an
`import` of a virtual stylesheet, which it then resolves as an **external**
module — and, in `extract` mode, emits itself as a bundler asset. Either way the
CSS never enters tsdown's CSS pipeline, so none of the `css` options can reach it.

This plugin resolves that virtual stylesheet as a real module instead — the
approach [`@vanilla-extract/vite-plugin`](https://vanilla-extract.style/documentation/integrations/vite/)
takes — so the extracted CSS is an ordinary `.css` module in the graph and tsdown
owns it from there.

If you write a plugin that emits CSS for a plugboy build, prefer the same shape.
Emitting a stylesheet as a bundler asset puts it outside the configured pipeline,
where nothing about `css.target` or `css.transformer` applies to it.

## License

[MIT](https://github.com/dadajam4/fastkit/blob/main/LICENSE)
