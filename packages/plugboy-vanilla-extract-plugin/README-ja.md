# @fastkit/plugboy-vanilla-extract-plugin

🌐 [English](https://github.com/dadajam4/fastkit/blob/main/packages/plugboy-vanilla-extract-plugin/README.md) | 日本語

[Vanilla Extract](https://vanilla-extract.style/) を [Plugboy](https://github.com/dadajam4/fastkit/blob/main/packages/plugboy/README-ja.md) のビルドに統合するプラグインです。`.css.ts` から抽出した CSS をパッケージごとに 1 つの CSS ファイルへまとめ、開発用の Vite プラグインと、カスケードレイヤーを扱うためのヘルパーを提供します。

## 特徴

- **単一 CSS へ集約**: パッケージ内の `.css.ts` から抽出したスタイルを、パッケージが import する素の `.css` / `.scss` とあわせて `dist/<package>.css` 1 ファイルに出力します。
- **tsdown の CSS パイプラインで処理**: 抽出した CSS を通常の CSS モジュールとして tsdown へ渡すため、すべての [`css` オプション](https://github.com/dadajam4/fastkit/blob/main/packages/plugboy/README-ja.md#css-オプション)が適用されます（`target` によるベンダープレフィクスと構文変換、`transformer` の lightningcss / postcss、`minify`、プリプロセッサオプション）。plugboy 自身の `optimizeCSS` も同様に適用されます。
- **Vite 連携**: 開発サーバーや Storybook などで利用する Vite 用プラグインを同梱しています。
- **レイヤーヘルパー**: `@fastkit/plugboy-vanilla-extract-plugin/css` から、カスケードレイヤーを型安全に定義するユーティリティを提供します。

> [!NOTE]
> 外部パッケージを指す `@import`（例: `@import url('material-symbols/rounded.css') layer(...)`）の保持や `@layer` 順序の整理は、[Plugboy](https://github.com/dadajam4/fastkit/blob/main/packages/plugboy/README-ja.md) 本体が担います。本プラグインで集約した CSS にもそのまま適用されます。

## インストール

```bash
npm install -D @fastkit/plugboy-vanilla-extract-plugin
# or
pnpm add -D @fastkit/plugboy-vanilla-extract-plugin
```

> [!NOTE]
> `@fastkit/plugboy` を peer dependencies として要求します。Vite 連携（`@fastkit/plugboy-vanilla-extract-plugin/vite`）を使う場合は、`vite` と `@vanilla-extract/vite-plugin` も peer dependencies として必要になるため、利用者側でインストールしてください。メインエントリはこれらを一切ロードしないので、ビルドのみの利用ならどちらも不要です。

## 使い方

### 1. ビルドへの登録

`plugboy.project.ts`（プロジェクト全体）または各ワークスペースの `plugboy.workspace.ts` の `plugins` に登録します。`.css.ts` を含むパッケージで自動的に有効になります。

```typescript
import { defineProjectConfig } from '@fastkit/plugboy';
import { createVanillaExtractPlugin } from '@fastkit/plugboy-vanilla-extract-plugin';

export default defineProjectConfig({
  plugins: [
    createVanillaExtractPlugin({
      // クラス名などの識別子の形式（本番は 'short' 推奨）
      identifiers: 'short',
    }),
  ],
});
```

ビルドすると、パッケージのスタイルは `dist/<package>.css` にまとめて出力されます。

### 2. Vite での利用（開発 / Storybook など）

ビルドを伴わずに Vanilla Extract を解決したい環境（Vite の開発サーバーや Storybook 等）では、Vite 用プラグインを使用します。

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

### 3. カスケードレイヤーヘルパー（`/css`）

`@fastkit/plugboy-vanilla-extract-plugin/css` から、ネスト可能なカスケードレイヤーを型安全に定義できます。

```typescript
import { defineLayerStyle } from '@fastkit/plugboy-vanilla-extract-plugin/css';

export const framework = defineLayerStyle({ globalName: 'my-ui' });

export const base = framework.defineNestedLayer({ globalName: 'base' });
export const component = framework.defineNestedLayer({ globalName: 'component' });
```

## オプション

`createVanillaExtractPlugin(options)` / `ViteVanillaExtractPlugin(options)` に渡せる主なオプションです。

| オプション | 型 | 説明 |
| --- | --- | --- |
| `identifiers` | `'short' \| 'debug' \| ((meta) => string)` | 生成されるクラス名などの識別子の形式。本番ビルドでは `'short'`、デバッグ時は `'debug'` を推奨します。 |
| `esbuildOptions` | `EsbuildOptions` | `.css.ts` のコンパイルに使用する esbuild へ渡すオプション。 |

### 予約された `css` オプション

このプラグインは、登録されたワークスペースに対して plugboy の `css.splitting` と `css.fileName` を設定します。これは、出力されるスタイルシートが plugboy の宣言する CSS export（`css: true` の各エントリに対する `./<entry>.css`）と一致するようにするためです。

- 該当エントリが 1 つ（通常のケース）: `splitting: false`、`fileName: '<package>.css'` — パッケージにつき単一のスタイルシート。
- 複数の場合: `splitting: true` とし、tsdown が出力チャンクごとにその名前でスタイルシートを出力します。`splitting: false` ではパッケージ全体を 1 ファイルに集約する際に 1 つのチャンクの CSS しか残らず、残りが黙って失われます。

設定はプラグインのデフォルトより優先されるため、これらのキーを宣言するとその通りに適用され、出力ファイル名が上記の export と一致しなくなる場合があります。その他の `css` オプション（`target`、`transformer`、`minify`、`preprocessorOptions`、`lightningcss`、`postcss`、`modules` など）は自由に利用でき、抽出された CSS にも適用されます。

> [!NOTE]
> CSS エントリが複数ある場合、2 つ以上のエントリから import された `.css.ts` は共有チャンクに配置されます。plugboy がその共有チャンクのスタイルシートを必要な各エントリへ畳み込むため、`./<entry>.css` は常に完結した内容になります（[CSS エントリごとのスタイルシート](https://github.com/dadajam4/fastkit/blob/main/packages/plugboy/README-ja.md#css-エントリごとのスタイルシート)）。

### CSS が出力に至る経路

`@vanilla-extract/rollup-plugin` は `.css.ts` を JavaScript と仮想スタイルシートの `import` にコンパイルし、その仮想スタイルシートを **external** として解決します（`extract` モードではさらに自身がバンドラのアセットとして出力します）。いずれの場合も CSS は tsdown の CSS パイプラインに入らないため、`css` オプションが一切届きません。

本プラグインは代わりにその仮想スタイルシートを実モジュールとして解決します（公式の [`@vanilla-extract/vite-plugin`](https://vanilla-extract.style/documentation/integrations/vite/) と同じ方式）。これにより抽出された CSS はモジュールグラフ上の通常の `.css` モジュールとなり、以降は tsdown が処理を担います。

plugboy のビルド向けに CSS を出力するプラグインを書く場合も、同じ形を推奨します。スタイルシートをバンドラのアセットとして出力すると、設定されたパイプラインの外に出てしまい、`css.target` や `css.transformer` が何も適用されません。

## ライセンス

[MIT](https://github.com/dadajam4/fastkit/blob/main/LICENSE)
