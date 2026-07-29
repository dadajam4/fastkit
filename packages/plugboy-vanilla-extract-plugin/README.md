# @fastkit/plugboy-vanilla-extract-plugin

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/plugboy-vanilla-extract-plugin/README-ja.md)

A plugin that integrates [Vanilla Extract](https://vanilla-extract.style/) into [Plugboy](https://github.com/dadajam4/fastkit/blob/main/packages/plugboy/README.md) builds. It bundles the CSS extracted from `.css.ts` files into a single stylesheet per package, ships a Vite plugin for development, and provides helpers for working with cascade layers.

## Features

- **Single CSS output**: Combines the styles extracted from a package's `.css.ts` files into one `dist/<package>.css`.
- **Automatic merge with plain CSS**: Merges tsdown's output for plain `.css` / `.scss` with the Vanilla Extract output into a single file (preventing the style loss caused by a file-name collision between the two).
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
it is registered in, and **they should not be declared in
`plugboy.workspace.ts` / `plugboy.project.ts`**.

A package can have two independent CSS producers — tsdown's own pipeline for
plain `.css` / `.scss` imports, and this plugin for `.css.ts` files. The two
would collide on a single output name, so the plugin routes tsdown's CSS to a
temporary file, disables tsdown's CSS splitting, and merges everything into one
file per entry after the build. Both option values are load-bearing for that
merge.

Configuration wins over plugin defaults, so a value declared for either key is
applied as written — and the merge then silently misses its inputs, which
typically shows up as component styles missing from the published CSS. Every
other `css` option (`target`, `preprocessorOptions`, `lightningcss`, `modules`,
…) is free to use.

## License

[MIT](https://github.com/dadajam4/fastkit/blob/main/LICENSE)
