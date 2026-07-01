# @fastkit/plugboy-vue-plugin

🌐 [English](https://github.com/dadajam4/fastkit/blob/main/packages/plugboy-vue-plugin/README.md) | 日本語

Vue の SFC（`.vue`）サポートを [Plugboy](https://github.com/dadajam4/fastkit/blob/main/packages/plugboy/README-ja.md) のビルドに追加するプラグインです。[unplugin-vue](https://github.com/unplugin/unplugin-vue)（Rolldown）をビルドパイプラインへ組み込み、同じ変換を開発サーバーや Storybook などでも再利用できるよう Vite 用プラグインも同梱しています。

## 特徴

- **ビルドでの Vue SFC**: `.vue` 単一ファイルコンポーネントを Plugboy のビルド時に変換します。
- **`vue-tsc` への自動切り替え**: パッケージが `vue` に依存している場合、型定義コンパイラを自動的に `vue-tsc` へ切り替え、`.vue` の型を正しく出力します。
- **Vite 連携**: `ViteVuePlugin()` は、開発サーバーや Storybook などで利用する Vite 用プラグイン（[`@vitejs/plugin-vue`](https://www.npmjs.com/package/@vitejs/plugin-vue) ベース）を提供します。ビルド用プラグインに設定したオプションを引き継ぎます。
- **オプション共有**: Vite 用プラグインは、プロジェクトに登録された `createVuePlugin()` からオプションを解決するため、ビルド時と開発時の変換設定が揃います。

## インストール

```bash
npm install -D @fastkit/plugboy-vue-plugin
# or
pnpm add -D @fastkit/plugboy-vue-plugin
```

> [!NOTE]
> `@fastkit/plugboy` を peer dependencies として要求します。Vite 連携（`@fastkit/plugboy-vue-plugin/vite`）を使う場合は、`vite` と `@vitejs/plugin-vue` も peer dependencies として必要になるため、利用者側でインストールしてください。メインエントリはこれらを一切ロードしないので、ビルドのみの利用ならどちらも不要です。

## 使い方

### 1. ビルドへの登録

`plugboy.project.ts`（プロジェクト全体）または各ワークスペースの `plugboy.workspace.ts` の `plugins` に登録します。

```typescript
import { defineProjectConfig } from '@fastkit/plugboy';
import { createVuePlugin } from '@fastkit/plugboy-vue-plugin';

export default defineProjectConfig({
  plugins: [
    createVuePlugin(),
  ],
});
```

`createVuePlugin(options)` には [unplugin-vue](https://github.com/unplugin/unplugin-vue) と同じオプションを渡せます。

### 2. Vite での利用（開発 / Storybook など）

ビルドを伴わずに `.vue` を解決したい環境（Vite の開発サーバーや Storybook 等）では、Vite 用プラグインを使用します。プロジェクトに登録された `createVuePlugin()` からオプションを読み取るため、引数は不要です。

```typescript
import { defineConfig } from 'vite';
import { ViteVuePlugin } from '@fastkit/plugboy-vue-plugin/vite';

export default defineConfig(async () => ({
  plugins: [
    await ViteVuePlugin(),
  ],
}));
```

## ライセンス

[MIT](https://github.com/dadajam4/fastkit/blob/main/LICENSE)
