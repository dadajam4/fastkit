# @fastkit/plugboy-vue-plugin

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/plugboy-vue-plugin/README-ja.md)

A plugin that adds Vue SFC (`.vue`) support to [Plugboy](https://github.com/dadajam4/fastkit/blob/main/packages/plugboy/README.md) builds. It wires [unplugin-vue](https://github.com/unplugin/unplugin-vue) (Rolldown) into the build pipeline, and ships a Vite plugin so the same transform can be reused in dev servers, Storybook, and similar environments.

## Features

- **Vue SFC in builds**: Transforms `.vue` single-file components during a Plugboy build.
- **Automatic `vue-tsc`**: When the package depends on `vue`, the declaration compiler is switched to `vue-tsc` automatically so `.vue` types are emitted correctly.
- **Vite integration**: `ViteVuePlugin()` provides a Vite plugin (backed by [`@vitejs/plugin-vue`](https://www.npmjs.com/package/@vitejs/plugin-vue)) for dev servers, Storybook, and the like. It inherits the options configured for the build plugin.
- **Shared options**: The Vite plugin resolves its options from the `createVuePlugin()` registered on the project, so the build and dev-time transforms stay in sync.

## Installation

```bash
npm install -D @fastkit/plugboy-vue-plugin
# or
pnpm add -D @fastkit/plugboy-vue-plugin
```

> [!NOTE]
> Requires `@fastkit/plugboy` as a peer dependency. When using the Vite integration (`@fastkit/plugboy-vue-plugin/vite`), `vite` and `@vitejs/plugin-vue` are also required as peer dependencies — install them yourself. The main entry never loads them, so build-only usage needs neither.

## Usage

### 1. Register in the build

Add it to the `plugins` of `plugboy.project.ts` (project-wide) or a per-workspace `plugboy.workspace.ts`.

```typescript
import { defineProjectConfig } from '@fastkit/plugboy';
import { createVuePlugin } from '@fastkit/plugboy-vue-plugin';

export default defineProjectConfig({
  plugins: [
    createVuePlugin(),
  ],
});
```

`createVuePlugin(options)` accepts the same options as [unplugin-vue](https://github.com/unplugin/unplugin-vue).

### 2. Use with Vite (dev / Storybook, etc.)

For environments that resolve `.vue` without a Plugboy build (Vite dev server, Storybook, etc.), use the Vite plugin. It reads the options from the `createVuePlugin()` registered on the project, so no arguments are needed.

```typescript
import { defineConfig } from 'vite';
import { ViteVuePlugin } from '@fastkit/plugboy-vue-plugin/vite';

export default defineConfig(async () => ({
  plugins: [
    await ViteVuePlugin(),
  ],
}));
```

## License

[MIT](https://github.com/dadajam4/fastkit/blob/main/LICENSE)
