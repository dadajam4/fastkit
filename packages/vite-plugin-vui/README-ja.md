# @fastkit/vite-plugin-vui

🌐 [English](https://github.com/dadajam4/fastkit/blob/main/packages/vite-plugin-vui/README.md) | 日本語

## インストール

```bash
pnpm add @fastkit/vite-plugin-vui
```

### ピア依存関係

このプラグインはプロジェクト内（既定では `.vui/`）にコードを生成し、そのコードは以下を
**名前で** import します。

```bash
pnpm add @fastkit/vui @fastkit/vue-page @fastkit/icon-font @fastkit/color-scheme @fastkit/media-match vue vue-router
```

これらは**プロジェクトから解決できる**必要があるため、直接インストールしてください。
すべてピア依存関係として宣言していますが、ピアの宣言だけでは配置されません。pnpm が
プロジェクトの `node_modules` に置くのは、プロジェクト自身が宣言したものだけで、
自動インストールされたピアは仮想ストアに入るため生成コードからは見えません。

さらに、アプリの他の部分が使うものと**同じコピー**である必要があります。生成コードは
`@fastkit/icon-font` / `@fastkit/color-scheme` / `@fastkit/media-match` を拡張して
プレースホルダ型を実際のアイコン名・カラースコープ・ブレイクポイントに差し替えますが、
モジュール拡張は解決されたコピーにしか適用されません。

いずれかが不足している場合、`viteVuiPlugin()` は不足分を列挙して失敗します。この検査が
ないと原因から遠い症状だけが出ます（ジェネレータも `vite build` も成功し、アイコン名は
すべてプレースホルダの union に落ちて `tsc` が数百件の `TS2322` を報告する）。

## ドキュメント
https://dadajam4.github.io/fastkit/vite-plugin-vui/
