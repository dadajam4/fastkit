# @fastkit/vanilla-extract-utils

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/vanilla-extract-utils/README-ja.md)

A set of utilities that assist styling with vanilla-extract. It wraps `@vanilla-extract/css` and simplifies common patterns such as layer-scoped styles and global themes.

## Features

- **Layer-scoped styles**: `defineLayerStyle` creates `style` / `globalStyle` scoped to an `@layer`
- **Nested layers**: easily define hierarchies like `@layer a.b`
- **Layer-scoped global themes / CSS variables**
- **Exportable from `.css.ts`**: supports vanilla-extract's official function serializer
- **Full TypeScript support**

## Installation

```bash
npm install @fastkit/vanilla-extract-utils
```

## Basic Usage

### Layer-scoped styles

```ts
// styles.css.ts
import { defineLayerStyle } from '@fastkit/vanilla-extract-utils';

// Define `@layer app`
export const app = defineLayerStyle('app');

// Define a style inside `@layer app` (returns a class name)
export const button = app({
  color: 'red',
  padding: '8px 16px',
});
```

### Nested layers / global styles / themes

```ts
const app = defineLayerStyle('app');

// `@layer app.component`
const component = app.defineNestedLayer('component');

// globalStyle inside the layer
app.global('body', { margin: 0 });

// Layer-scoped global theme (CSS variables)
const vars = app.globalTheme(':root', {
  color: { primary: '#333' },
});
```

### Exporting from `.css.ts`

`defineLayerStyle` returns a function, but it supports vanilla-extract's official function serializer, so it can be exported directly from `.css.ts` as shown above.

## API

- **`defineLayerStyle(globalName | options)` → `LayerStyle`**
  - `(rule, debugId?)` / `.style(rule, debugId?)`: `style` inside the layer (returns a class name)
  - `.global(selector, rule)`: `globalStyle` inside the layer
  - `.globalTheme(...)`: layer-scoped `createGlobalTheme`
  - `.defineNestedLayer(globalName | options)`: nested layer
  - `.layerName` / `.parentLayerName`
- **`createGlobalTheme(layerName, selector, tokens)`**: define a global theme inside the given layer

## License

MIT
