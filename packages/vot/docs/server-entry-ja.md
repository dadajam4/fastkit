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
  configureServer({ app }) {
    app.get('/healthcheck', (c) => c.body(null, 200));
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
| `proxy`           | `Record<string, string \| VotProxyOptions>` | プロキシ設定。Vite の `server.proxy` より狭い（後述） |
| `configureServer` | `(ctx: { app }) => void \| Promise<void>` | アダプタのアプリ（既定では `Hono`）にミドルウェアをマウントする |

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

## プロキシ設定

転送は `fetch` で行うため、ルールが持てるのは `target` / `changeOrigin` /
`rewrite` / `headers` / `ws` だけです。

Vite の `configure` と `bypass` はありません。前者は `http-proxy` のインスタンスを、
後者は Node のリクエストとレスポンスを渡すもので、どちらも `fetch` に対応物がありません。
残すと `vot dev` と `vot serve` が乖離することになり、それはこのエントリが防ぐために
存在している唯一のものです。`secure` も同様の理由でありません ── `fetch` の TLS 検証を
標準的な方法で切ることはできず、黙って効かないオプションを宣言するのは、無いことより
悪いからです。自己署名の上流には `NODE_TLS_REJECT_UNAUTHORIZED=0` を使ってください。

WebSocket の転送（`ws: true`、または `ws:` / `wss:` ターゲット）は vot ではなく
**アダプタの能力**です。fetch モデルに upgrade の概念がないため、各ランタイムが自前の
API で行う必要があります。既定の node アダプタは転送します。できないアダプタは
`supports.proxyWebSocket: false` を宣言し、vot は起動時に警告します ── ルールが黙って
何もしないままになるのを避けるためです。

## `base` とミドルウェア

`configureServer` のミドルウェアとプロキシは、`vot dev` と `vot serve` の
どちらでも `base` の外側、サーバーのルートにマウントされます。

| | `base: '/app/'` |
| --- | --- |
| `vot dev` | `/healthcheck` |
| `vot serve` | `/healthcheck` |

`base` はアプリケーションのアセットとルートの置き場所であり、ヘルスチェックや
メトリクスのエンドポイント、Webhook の受け口はそのルートツリーの一部ではありません。
ルートに置くことで、同じソース行が開発と本番で同じ URL に応答します。

静的アセットとレンダリングのルートは従来どおり `base` の下で配信されます。

`@fastkit/vot@1.6.0` より前は、`vot dev` がルートにマウントするのに対して
`vot serve` は両方を `base` の内側にマウントしていました。既定の `base: '/'` の
アプリケーションはこの変更の影響を受けません。
