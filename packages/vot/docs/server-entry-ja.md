# サーバーエントリ

🌐 [English](./server-entry.md) | 日本語

**サーバーエントリ**は、vot アプリケーションのサーバーサイド実行面 —— listen する
ホストとポート、プロキシ設定、マウントするミドルウェア —— を宣言するファイルです。

`vot dev` と `vot serve` の両方がこれを読み、`vot build` が `dist/server` へ
バンドルします。

## 本番の依存関係

`vot serve` はバンドルされたエントリを読むため、ビルド済みアプリの配信は `dist/`
の外に一切触れません。アプリケーションは `dependencies` だけで動作します。

```dockerfile
RUN pnpm install --prod
CMD ["vot", "serve"]
```

エントリが無い場合、`vot serve` は起動時にプロジェクトの Vite 設定を解決します。
これは `vite.config.ts` と そこが import するすべてのプラグインを評価するため、
配信中に何もしないプラグインまで本番ランタイムにインストールされている必要が
あります。

```
> vot serve
vite.config.ts (3:30) [UNRESOLVED_IMPORT] Could not resolve '@fastkit/vite-plugin-vui'
failed to load config from /app/packages/admin-front/vite.config.ts
```

## クイックスタート

プロジェクトルートに `vot.server.ts` を作成します。設定は不要で、規約で拾われます。

```ts
// vot.server.ts
import { defineVotServer } from '@fastkit/vot/server';

export default defineVotServer({
  host: '0.0.0.0',
  port: 3000,
  proxy: {
    '/api': 'http://localhost:8080',
  },
  configureServer({ use }) {
    use('/healthcheck', (_req, res) => {
      res.writeHead(200).end();
    });
  },
});
```

これらの設定はエントリだけが持ちます。`vite.config.ts` 側にも `server.host` /
`server.port` / `server.proxy` / `votPlugin({ configureServer })` を書いても
エラーにはなりませんが、vot が警告します（[優先順位](#優先順位)を参照）。

## 起動時に環境変数を読む

関数を渡すと、**ビルドしたマシン**ではなく**アプリを実行するマシン**の値を読めます。
関数は起動時に評価され、`async` にもできます。

```ts
import { defineVotServer } from '@fastkit/vot/server';

export default defineVotServer(({ command, dev, mode }) => ({
  host: '0.0.0.0',
  port: dev ? 3000 : Number(process.env.PORT ?? 8080),
  proxy: dev ? { '/api': 'http://localhost:8080' } : undefined,
}));
```

`vot build` はエントリを評価せずバンドルするため、`process.env.PORT` が成果物に
焼き付くことはなく、`PORT` を持たないビルドマシンでも正しい成果物ができます。

### コンテキスト

| プロパティ | 型                 | 説明                                           |
| ---------- | ------------------ | ---------------------------------------------- |
| `command`  | `'dev' \| 'serve'` | どのコマンドがエントリを評価しているか         |
| `dev`      | `boolean`          | `command === 'dev'`                            |
| `mode`     | `string`           | Vite の mode（`development` / `production` …） |

`build` と `generate` は現れません。ビルド時にエントリは評価されず、バンドル
されるだけだからです。

## オプション

| オプション        | 型                                        | 説明                                              |
| ----------------- | ----------------------------------------- | ------------------------------------------------- |
| `host`            | `string \| boolean`                       | listen するホスト。`vot serve` の既定は `'0.0.0.0'` |
| `port`            | `number`                                  | listen するポート。既定は `3000`                    |
| `proxy`           | `Record<string, string \| ProxyOptions>`  | プロキシ設定。Vite の `server.proxy` と同じ形       |
| `configureServer` | `(ctx: { use }) => void \| Promise<void>` | サーバーにミドルウェアをマウントする                |

`base` はオプションに**含まれません**。ビルド時にクライアントバンドルのアセット
URL へ焼き込まれる値なので `vite.config.ts` が持ち、`vot build` がその値を
`dist/server/package.json` に記録して `vot serve` のルーターのマウント先にします。

## パスを変える

```ts
votPlugin({
  server: { entry: './config/server.ts' },
});
```

明示したパスが存在しない場合はエラーになります。黙って `vite.config.ts` の
読み込みにフォールバックすることはありません。

このオプションを指定しない場合、vot はプロジェクトルートの
`vot.server.{ts,mts,js,mjs}` を探します。

## 優先順位

dev でも本番でもエントリが `vite.config.ts` に優先し、同じキーが両方にある場合は
警告します。

```
[vot] `server.port` is set in both vite.config.ts and vot.server.ts.
      The server entry wins -- remove the one in vite.config.ts.
```

エントリが勝つ必要があります。dev で `vite.config.ts` が勝つと、`vot dev` と
`vot serve` が別のポートで待ち受ける状態が起こり得るためです。

`votPlugin({ configureServer })` も引き続き読まれます。エントリと両方に定義した
場合は**両方が実行され**（`votPlugin()` が先）、vot が警告します。

## ビルド出力

`vot build` はバンドルしたエントリを SSR バンドルの隣に出力し、記録します。

```
dist/
├── client/
└── server/
    ├── main.js          # SSR バンドル
    ├── vot.server.js    # バンドルされたサーバーエントリ
    └── package.json     # { "base": "/", "server": { "entry": "vot.server.js" } }
```

`vot serve` は `dist/server/package.json` を読み、`server.entry` があることを
もって `vite.config.ts` をスキップします。

エントリは薄く保ってください。SSR バンドルとは別にバンドルされるため、import した
ものは `vot.server.js` に重複して入ります。

## エントリを持たないアプリケーション

`vot serve` は `loadConfigFromFile()` にフォールバックし、`vite.config.ts` から
`server` と `votPlugin({ configureServer })` を読みます。本番にビルド時プラグインを
要求するのはこの経路で、`vot serve` が `vite` を import する唯一の理由でもあります。
将来のメジャーバージョンで削除される予定です。

## `base` とミドルウェア

`base` が `/` 以外のとき、`vot dev` と `vot serve` は `configureServer` の
ミドルウェアとプロキシを別のパスにマウントします。

| | `base: '/app/'` |
| --- | --- |
| `vot dev` | `/healthcheck` |
| `vot serve` | `/app/healthcheck` |

`vot serve` は `base` 用に作るルーターの内側にマウントするためです。既定の
`base: '/'` のアプリケーションには影響しません。
