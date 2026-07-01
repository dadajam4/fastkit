# @fastkit/plugboy-vue-jsx-plugin

🌐 [English](https://github.com/dadajam4/fastkit/blob/main/packages/plugboy-vue-jsx-plugin/README.md) | 日本語

Vue の JSX/TSX サポートを [Plugboy](https://github.com/dadajam4/fastkit/blob/main/packages/plugboy/README-ja.md) のビルドに追加するプラグインです。[unplugin-vue-jsx](https://github.com/unplugin/unplugin-vue-jsx)（Rolldown）をビルドパイプラインへ組み込み、同じ JSX 変換を開発サーバーや Storybook などでも再利用できるよう Vite 用プラグインも同梱しています。

## 特徴

- **ビルドでの Vue JSX**: Vue の JSX 構文で書かれた `.jsx` / `.tsx` を Plugboy のビルド時に変換します。
- **Vite 連携**: `ViteVueJSXPlugin()` は、開発サーバーや Storybook などで利用する Vite 用プラグイン（[`@vitejs/plugin-vue-jsx`](https://www.npmjs.com/package/@vitejs/plugin-vue-jsx) ベース）を提供します。ビルド用プラグインに設定したオプションを引き継ぎます。
- **オプション共有**: Vite 用プラグインは、プロジェクトに登録された `createVueJSXPlugin()` からオプションを解決するため、ビルド時と開発時の変換設定が揃います。

## インストール

```bash
npm install -D @fastkit/plugboy-vue-jsx-plugin
# or
pnpm add -D @fastkit/plugboy-vue-jsx-plugin
```

> [!NOTE]
> `@fastkit/plugboy` を peer dependencies として要求します。Vite 連携（`@fastkit/plugboy-vue-jsx-plugin/vite`）を使う場合は、`vite` と `@vitejs/plugin-vue-jsx` も peer dependencies として必要になるため、利用者側でインストールしてください。メインエントリはこれらを一切ロードしないので、ビルドのみの利用ならどちらも不要です。

## 使い方

### 1. ビルドへの登録

`plugboy.project.ts`（プロジェクト全体）または各ワークスペースの `plugboy.workspace.ts` の `plugins` に登録します。

```typescript
import { defineProjectConfig } from '@fastkit/plugboy';
import { createVueJSXPlugin } from '@fastkit/plugboy-vue-jsx-plugin';

export default defineProjectConfig({
  plugins: [
    createVueJSXPlugin(),
  ],
});
```

`createVueJSXPlugin(options)` には [unplugin-vue-jsx](https://github.com/unplugin/unplugin-vue-jsx) と同じオプションを渡せます。

### 2. Vite での利用（開発 / Storybook など）

ビルドを伴わずに JSX を解決したい環境（Vite の開発サーバーや Storybook 等）では、Vite 用プラグインを使用します。プロジェクトに登録された `createVueJSXPlugin()` からオプションを読み取るため、引数は不要です。

```typescript
import { defineConfig } from 'vite';
import { ViteVueJSXPlugin } from '@fastkit/plugboy-vue-jsx-plugin/vite';

export default defineConfig(async () => ({
  plugins: [
    await ViteVueJSXPlugin(),
  ],
}));
```

## ライセンス

[MIT](https://github.com/dadajam4/fastkit/blob/main/LICENSE)
