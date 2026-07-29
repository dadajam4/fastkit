# @fastkit/plugboy-vanilla-extract-plugin

🌐 [English](https://github.com/dadajam4/fastkit/blob/main/packages/plugboy-vanilla-extract-plugin/README.md) | 日本語

[Vanilla Extract](https://vanilla-extract.style/) を [Plugboy](https://github.com/dadajam4/fastkit/blob/main/packages/plugboy/README-ja.md) のビルドに統合するプラグインです。`.css.ts` から抽出した CSS をパッケージごとに 1 つの CSS ファイルへまとめ、開発用の Vite プラグインと、カスケードレイヤーを扱うためのヘルパーを提供します。

## 特徴

- **単一 CSS へ集約**: パッケージ内の `.css.ts` から抽出したスタイルを `dist/<package>.css` 1 ファイルにまとめて出力します。
- **プレーン CSS との自動マージ**: tsdown が処理する素の `.css` / `.scss` の出力と Vanilla Extract の出力を 1 ファイルへ統合します（両者のファイル名衝突によるスタイル欠落を防ぎます）。
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

このプラグインは、登録されたワークスペースに対して plugboy の `css.splitting` と `css.fileName` を設定します。**これらを `plugboy.workspace.ts` / `plugboy.project.ts` で宣言しないでください。**

パッケージは 2 つの独立した CSS 生成元を持ち得ます。プレーンな `.css` / `.scss` の import を扱う tsdown 自身のパイプラインと、`.css.ts` を扱うこのプラグインです。両者は単一の出力名で衝突するため、プラグインは tsdown 側の CSS を一時ファイルへ退避し、tsdown の CSS split を無効化した上で、ビルド後にエントリごとの 1 ファイルへマージします。この 2 つのオプション値はそのマージ処理の前提になっています。

設定はプラグインのデフォルトより優先されるため、これらのキーを宣言するとその通りに適用され、マージは入力を見失ったまま黙って素通りします。多くの場合、公開された CSS からコンポーネントのスタイルが欠落する形で顕在化します。その他の `css` オプション（`target`、`preprocessorOptions`、`lightningcss`、`modules` など）は自由に利用できます。

## ライセンス

[MIT](https://github.com/dadajam4/fastkit/blob/main/LICENSE)
