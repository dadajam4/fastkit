# @fastkit/plugboy-vue-jsx-plugin

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/plugboy-vue-jsx-plugin/README-ja.md)

A plugin that adds Vue JSX/TSX support to [Plugboy](https://github.com/dadajam4/fastkit/blob/main/packages/plugboy/README.md) builds. It wires [unplugin-vue-jsx](https://github.com/unplugin/unplugin-vue-jsx) (Rolldown) into the build pipeline, and ships a Vite plugin so the same JSX transform can be reused in dev servers, Storybook, and similar environments.

## Features

- **Vue JSX in builds**: Transforms `.jsx` / `.tsx` written with Vue's JSX syntax during a Plugboy build.
- **Vite integration**: `ViteVueJSXPlugin()` provides a Vite plugin (backed by [`@vitejs/plugin-vue-jsx`](https://www.npmjs.com/package/@vitejs/plugin-vue-jsx)) for dev servers, Storybook, and the like. It inherits the options configured for the build plugin.
- **Shared options**: The Vite plugin resolves its options from the `createVueJSXPlugin()` registered on the project, so the build and dev-time transforms stay in sync.

## Installation

```bash
npm install -D @fastkit/plugboy-vue-jsx-plugin
# or
pnpm add -D @fastkit/plugboy-vue-jsx-plugin
```

> [!NOTE]
> Requires `@fastkit/plugboy` as a peer dependency. When using the Vite integration (`@fastkit/plugboy-vue-jsx-plugin/vite`), `vite` and `@vitejs/plugin-vue-jsx` are also required as peer dependencies — install them yourself. The main entry never loads them, so build-only usage needs neither.

## Usage

### 1. Register in the build

Add it to the `plugins` of `plugboy.project.ts` (project-wide) or a per-workspace `plugboy.workspace.ts`.

```typescript
import { defineProjectConfig } from '@fastkit/plugboy';
import { createVueJSXPlugin } from '@fastkit/plugboy-vue-jsx-plugin';

export default defineProjectConfig({
  plugins: [
    createVueJSXPlugin(),
  ],
});
```

`createVueJSXPlugin(options)` accepts the same options as [unplugin-vue-jsx](https://github.com/unplugin/unplugin-vue-jsx).

### 2. Use with Vite (dev / Storybook, etc.)

For environments that resolve JSX without a Plugboy build (Vite dev server, Storybook, etc.), use the Vite plugin. It reads the options from the `createVueJSXPlugin()` registered on the project, so no arguments are needed.

```typescript
import { defineConfig } from 'vite';
import { ViteVueJSXPlugin } from '@fastkit/plugboy-vue-jsx-plugin/vite';

export default defineConfig(async () => ({
  plugins: [
    await ViteVueJSXPlugin(),
  ],
}));
```

## License

[MIT](https://github.com/dadajam4/fastkit/blob/main/LICENSE)
