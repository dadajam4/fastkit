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
pnpm add @fastkit/vui @fastkit/vue-page vue vue-router
```

これらは**プロジェクトから解決できる**必要があるため、直接インストールしてください。
すべてピア依存関係として宣言していますが、ピアの宣言だけでは配置されません。pnpm が
プロジェクトの `node_modules` に置くのは、プロジェクト自身が宣言したものだけで、
自動インストールされたピアは仮想ストアに入るため生成コードからは見えません。

生成コードがこれ以外のパッケージを名指しすることはありません。プレースホルダ型を実際の
アイコン名・カラースコープ・ブレイクポイントに差し替えるために拡張するのは `@fastkit/vui`
自身であり、これはプロジェクトが必ず宣言しているモジュールです。

いずれかが不足している場合、`viteVuiPlugin()` は不足分を列挙して失敗します。この検査が
ないと原因から遠い症状だけが出ます（ジェネレータも `vite build` も成功し、アイコン名は
すべてプレースホルダの union に落ちて `tsc` が数百件の `TS2322` を報告する）。

### アイコン

既定では何も生成しません。`@fastkit/vui` が生成済みの Material Design Icons
ウェブフォントを同梱しており、`installer.ts` がそれを import します。つまり既定構成では
`@mdi/svg`（SVG 7,447 ファイル、約 31MB）も `@fastkit/icon-font-gen` も生成ステップも
不要です。

`iconFont` は、そこへ **独自のアイコンを追加する** ための口です。

```ts
const viteVui = await viteVuiPlugin({
  iconFont: [{ src: './assets/icons' }],
});
```

このエントリは同梱フォントを置き換えるのではなく、それに **追加** して生成されます。
このキット自身の既定（`menuDown: 'mdi-menu-down'`、`clear: 'mdi-close'` ほか 20 数個）が
同梱フォントの名前を指しているためです。`IconName` は両者の合併になり、実行時に読み込まれる
ものと一致します。生成には `devDependencies` の `@fastkit/icon-font-gen` が必要です
（既定の経路では使わないので optional peer にしてあります）。

`iconFontDefaults` はここで生成するエントリのフォントメトリクスです。同梱の MDI フォントは
`@fastkit/vui` 側で固定のメトリクスで一度だけビルドされるため、`iconFont` のエントリが
無ければ適用対象がありません。

### カラースキームとブレイクポイントのカスタマイズ

値はビルド時に記述するため、ジェネレータはアプリに同梱されるものではなく
`devDependencies` に入ります。

```bash
pnpm add -D @fastkit/color-scheme-gen @fastkit/media-match-gen @fastkit/icon-font-gen
```

`@fastkit/color-scheme-gen` はカラースキーム記述用の API（`createColorScheme`、
`createSimpleColorScheme`、ソース型）をすべて再エクスポートしているため、完全な独自スキーム
でもこれ以外は不要です。定義したテーマ、パレット、スコープ、バリアントは、
`@fastkit/vui` からエクスポートされる `ThemeName` / `PaletteName` / `ScopeName` /
`ColorVariant` にそのまま現れます。

### 生成ディレクトリについて

`.vui/` は生成物です。編集しないでください。また、削除する必要もありません。`.vui/.manifest.json` に生成したバージョンが記録されており、変化があればディレクトリを空にして作り直します。関係する `@fastkit/*` パッケージのアップグレードはこれで吸収され、生成されなくなった出力（削除したアイコンフォントのエントリなど）も取り除かれます。

コミットするかどうかは任意です。コミットする場合、内部の import は相対パスなのでどのチェックアウトでも解決できます。


## ドキュメント
https://dadajam4.github.io/fastkit/vite-plugin-vui/
