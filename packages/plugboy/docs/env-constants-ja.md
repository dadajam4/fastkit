# 環境定数（Env constants）

🌐 [English](./env-constants.md) | 日本語

plugboy はビルド対象のパッケージに、ビルド時のグローバル定数を2つ注入します。これにより、開発時のみのコード（ログ・警告・アサーション）をソース内で切り分けられます。

| 定数 | `stub`（ローカル開発） | `build`（公開される成果物） |
| --- | --- | --- |
| `__PLUGBOY_STUB__` | `true` | `false`（静的リテラル） |
| `__PLUGBOY_DEV__` | `true` | **消費者の**環境のランタイム判定: `process.env.NODE_ENV === 'development'` \|\| `import.meta.env?.DEV === true` |

## どちらを使うか

- **`__PLUGBOY_STUB__`** — plugboy がパッケージを `stub`（ソースをその場で実行するローカル開発）で動かしている間だけ `true`。実際の `build` では静的リテラル `false` になるため、`if (__PLUGBOY_STUB__)` ブロックは**公開成果物から除去**されます。決して出荷したくないコードに使います。

- **`__PLUGBOY_DEV__`** — `stub` では `true`。公開成果物では**消費者の環境で評価されるランタイム式**になります。*消費者*がアプリを開発モードで動かしたときに有効化したい挙動（例: 親切な警告）に使います。ランタイムで解決されるため、その分岐はバンドルに残り、デッドコード除去はされません。

## 使い方

```ts
if (__PLUGBOY_DEV__) {
  // このパッケージの開発中（stub）と、消費者がアプリを開発モードで
  // 動かしているときに表示されます。
  console.warn('[my-pkg] you passed a deprecated option');
}

if (__PLUGBOY_STUB__) {
  // `plugboy stub` でこのパッケージを開発しているときのみ。
  // 公開ビルドからは除去されます。
}
```

## TypeScript

グローバル型は `@fastkit/plugboy/env` サブパスから提供されます。一度参照すれば
（例: パッケージ内の任意の `*.d.ts`）定数が型付けされます。

```ts
/// <reference types="@fastkit/plugboy/env" />
```

または `tsconfig.json` に追加します。

```jsonc
{
  "compilerOptions": {
    "types": ["@fastkit/plugboy/env"]
  }
}
```
