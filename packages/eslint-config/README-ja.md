# @fastkit/eslint-config

🌐 [English](https://github.com/dadajam4/fastkit/blob/main/packages/eslint-config/README.md) | 日本語

TypeScript プロジェクト向けの、fastkit 共有 ESLint 設定（[flat config](https://eslint.org/docs/latest/use/configure/configuration-files)）です。コード品質のルールに専念し、**整形（フォーマット）関連のルールは [`eslint-config-prettier`](https://github.com/prettier/eslint-config-prettier) で無効化**するため、フォーマッタと競合しません。

これらのルールが無効なため、ESLint は整形の指摘も修正も行いません。またこの設定自体はフォーマッタを実行しません。整形は消費側でお好きな方法を用意してください — Prettier（CLI やエディタ）、dprint、Biome、あるいは ESLint 経由で整形したい場合は `eslint-plugin-prettier` など。

> [!NOTE]
> ESLint の整形ルールを一括で無効化する事実上の標準として `eslint-config-prettier` を使用しています（名前は prettier ですがフォーマッタ非依存です）。ESLint 公式にこの用途のプリセットは無く、組み込みの整形ルールは非推奨で、`@stylistic` の disable-legacy と違いプラグイン側のルール（例: `eslint-plugin-vue`）もカバーするためです。現時点での実装上の選択であり、将来変わる可能性があります。

## インストール

```bash
npm install -D @fastkit/eslint-config eslint
# or
pnpm add -D @fastkit/eslint-config eslint
```

## 使い方

`eslint.config.mjs`（flat config）を用意し、デフォルトエクスポートを展開します:

```js
import config from '@fastkit/eslint-config';

export default [
  ...config,
  // プロジェクト固有の上書き設定…
];
```

> [!NOTE]
> この設定は末尾で整形ルールを無効化するため、あとに足したルールは有効になります（通常はそれが望ましい挙動です）。整形ルールを再び有効化する別プリセットをこの設定の後に重ねる場合のみ、最後にフォーマッタ無効化（例: `eslint-config-prettier`）を append してください。

TypeScript ESLint のヘルパは `tseslint` として再エクスポートしています:

```js
import config, { tseslint } from '@fastkit/eslint-config';
```

### 整形（任意）

この設定はフォーマッタと衝突するルールを無効化するだけで、整形自体は実行しません。ワークフローは自由に選べます:

- **Prettier を CLI / エディタで実行**、dprint、Biome など — そのまま実行すれば ESLint は干渉しません。
- **ESLint 経由で Prettier を実行** — [`eslint-plugin-prettier`](https://github.com/prettier/eslint-plugin-prettier) を自分で追加:

  ```js
  import config from '@fastkit/eslint-config';
  import prettier from 'eslint-plugin-prettier/recommended';

  export default [...config, prettier];
  ```

## ドキュメント

https://dadajam4.github.io/fastkit/eslint-config/

## ライセンス

[MIT](https://github.com/dadajam4/fastkit/blob/main/LICENSE)
