# @fastkit/vanilla-extract-utils

🌐 [English](https://github.com/dadajam4/fastkit/blob/main/packages/vanilla-extract-utils/README.md) | 日本語

vanilla-extract によるスタイリングを補助するユーティリティ集です。`@vanilla-extract/css` をラップし、レイヤースコープのスタイル定義やグローバルテーマなど、定型的な記述を簡潔にします。

## 機能

- **レイヤースコープのスタイル定義**: `defineLayerStyle` で `@layer` にスコープした `style` / `globalStyle` を生成
- **ネストレイヤー**: `@layer a.b` のような階層を簡単に定義
- **レイヤースコープのグローバルテーマ / CSS変数**
- **`.css.ts` からの export 対応**: vanilla-extract 公式の function serializer に対応
- **TypeScript 完全サポート**

## インストール

```bash
npm install @fastkit/vanilla-extract-utils
```

## 基本的な使用方法

### レイヤースコープのスタイル

```ts
// styles.css.ts
import { defineLayerStyle } from '@fastkit/vanilla-extract-utils';

// `@layer app` を定義
export const app = defineLayerStyle('app');

// `@layer app` の中に style を定義（クラス名を返す）
export const button = app({
  color: 'red',
  padding: '8px 16px',
});
```

### ネストレイヤー / グローバルスタイル / テーマ

```ts
const app = defineLayerStyle('app');

// `@layer app.component`
const component = app.defineNestedLayer('component');

// レイヤー内の globalStyle
app.global('body', { margin: 0 });

// レイヤースコープのグローバルテーマ（CSS変数）
const vars = app.globalTheme(':root', {
  color: { primary: '#333' },
});
```

### `.css.ts` からの export について

`defineLayerStyle` の戻り値は関数ですが、vanilla-extract 公式の function serializer に対応しているため、上記のように `.css.ts` から直接 export できます。

## API 概要

- **`defineLayerStyle(globalName | options)` → `LayerStyle`**
  - `(rule, debugId?)` / `.style(rule, debugId?)`: レイヤー内の `style`（クラス名を返す）
  - `.global(selector, rule)`: レイヤー内の `globalStyle`
  - `.globalTheme(...)`: レイヤースコープの `createGlobalTheme`
  - `.defineNestedLayer(globalName | options)`: ネストレイヤー
  - `.layerName` / `.parentLayerName`
- **`createGlobalTheme(layerName, selector, tokens)`**: 指定レイヤー内にグローバルテーマを定義

## ライセンス

MIT
