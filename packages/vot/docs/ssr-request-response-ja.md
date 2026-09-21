# リクエストとレスポンス

🌐 [English](./ssr-request-response.md) | 日本語

サーバーサイドのレンダリングでは、vot は受信したリクエストと、送出するステータス /
ヘッダ / クッキーを書き込む場所を渡します。どちらも web 標準の `Request` と
`Headers` で、`node:http` に依存するものは含まれません。だから同じコードが、
アダプタの動くランタイムならどこでも動きます。

このページでは、何が渡されるのか、ブラウザでは何が無いのか、そして
`vot generate` がそれらをどう扱うのかを説明します。

## リクエストを読む

`VuePageControl.request` が受信した `Request` です。ブラウザでは `undefined` に
なります。

```ts
import { createVotPlugin } from '@fastkit/vot';

export const localePlugin = createVotPlugin({
  setup(ctx) {
    const language = ctx.request?.headers.get('accept-language');
    // ...
  },
});
```

同じコントロールはコンポーネントからも `useVuePageControl()` で取得できます。

**ブラウザで `undefined` になることが、ここでは本質です。** 同じコンポーネントは
2回描画されます —— サーバーで1回、ハイドレーション後にもう1回。リクエストを読む
コードは2回目の答えも用意しておかないと、2つの描画が食い違ってハイドレーションが
壊れます。サーバーで読み、必要なものを state に入れ、両側では state を読んでください。

node アダプタを前提としてよい場面で、リクエストの背後にある Node のオブジェクトへ
到達するには次のようにします。

```ts
import { getNodeRuntime } from '@fastkit/vot/adapters/node';
import type { VotRuntimeContext } from '@fastkit/vot';

const runtime = ctx.server?.runtime as VotRuntimeContext | undefined;
const { incoming, outgoing } = getNodeRuntime(runtime) ?? {};
```

キャストが要るのは `VuePageServerContext.runtime` が `unknown` だからです —— この型は
アダプタを知らない側の都合で、`getNodeRuntime` 自身はアダプタ名を実行時に検査して
合わなければ `undefined` を返します。

## レスポンスに書く

`VuePageControl.response` はこの描画のためのレスポンス下書き（`PageResponseDraft`）で、
`{ status?, statusText?, headers }` という形です（`headers` は `Headers`）。ブラウザでは
`undefined` です。

```ts
ctx.response?.headers.set('cache-control', 'private, no-store');
```

プレーンなオブジェクトではなく `Headers` なので、**複数値の `Set-Cookie` が
そのままレンダラの外まで生き残ります。**

ボディを伴うステータスやリダイレクトは、下書きを直接書くのではなくコントロールの
ヘルパを使ってください。描画を正しい位置で止めてくれます。

```ts
ctx.writeResponse({ status: 404 });

ctx.redirect('/signin'); // 302
ctx.redirect({ path: '/signin', statusCode: 301 });
ctx.redirect({ name: 'signin', query: { next: ctx.route.fullPath } });
```

`writeResponse` が受け取るのは `{ status?, statusText?, headers? }` で、`headers`
はプレーンなレコードです。`Set-Cookie` をここではなく `response.headers` か
`cookies` に書くべきなのはそのためです。

## クッキー

`VuePageControl.cookies` は [`Cookies`](../../cookies) のインスタンスで、両側で動きます。
そこが要点で、同じ呼び出しがプラグインでもコンポーネントでもハイドレーション後でも
正しく動きます。

```ts
ctx.cookies.get('theme');
ctx.cookies.set('theme', 'dark', { path: '/', maxAge: 60 * 60 * 24 * 365 });
ctx.cookies.delete('theme');
```

サーバーではリクエストの `Cookie` を読み、レスポンス下書きの `Set-Cookie` に追記します。
つまり描画中にセットしたクッキーは、そのページと一緒にブラウザへ届きます。ブラウザでは
`document.cookie` を読み書きし、`httpOnly` は例外を投げます —— ブラウザから
`httpOnly` は設定できないので、黙って `httpOnly` でないクッキーを書くより、
はっきり失敗させています。

## 上流 API へリクエストヘッダを転送する

自分の API を呼ぶサーバーサイド描画では、たいていブラウザのヘッダ —— 何よりまず
セッションクッキー —— を持って行く必要があります。サーバーの `fetch` は何も持たない
状態から始まるので、これは明示的な作業になります。そして **vot はこれを代行しません。**
呼び出し先が信頼できる相手かどうかを知っているのは、アプリケーションだけだからです。

```ts
const forwarded = new Headers(ctx.request?.headers);
for (const name of ['transfer-encoding', 'keep-alive', 'upgrade', 'expect', 'content-length']) {
  forwarded.delete(name);
}
const res = await fetch(`${API_ORIGIN}/me`, { headers: forwarded });
```

ここで除外しているヘッダは性質の違う2種類で、分けて考えると扱いやすくなります。

**必ず壊れるもの。** 上の5つは hop-by-hop か、ボディから導出される値です。前の4つは
`fetch` が明確に拒否し（`TypeError: fetch failed`、原因は
`invalid transfer-encoding header` や `expect header not supported` など）、
古い `content-length` は今のボディと食い違った時点で失敗します。**これらは送り先に
関係なく常に除外します。**

**送り先次第で答えが変わるもの。** `cookie`、`authorization`、`host`、`accept`、
`accept-encoding`。自分の API に転送するのは普通のことですが、第三者に転送すれば
利用者の資格情報が漏れます。**両方に正しい既定値は存在しません。** だからこれは
アプリケーションの判断であって、vot が渡せるヘルパにはなりません。送り先が
第一者でないなら、送らないものを消すのではなく、**送るものを列挙してください。**

なお、出力が受信リクエストに依存する描画は、キャッシュも静的生成もできない描画です。
それが次節の話です。

## `vot generate`

`vot generate` は実際にサーバーを起動し、素の HTTP でクロールして各ページの HTML を
`index.html` に保存します。つまりリクエストもレスポンスも本物ですが、**訪問者のもの
ではありません。**

- **リクエストはクローラのもの。** クッキーも `accept-language` も認証情報もありません。
  URL のホストはローカルのプレビューサーバーで、あなたのドメインではありません。
- **保存されるのは HTML ボディだけ。** レスポンス下書きに書いたもの —— ステータス、
  ヘッダ、`Set-Cookie` —— はファイルに落ちた時点で捨てられます。生成時の描画で
  セットしたクッキーは誰にも届きません。
- **200 以外のページは生成されずスキップされます。** リダイレクトも含みます。
  `vot generate` は `skip generate status[302] >>> /the/path` と表示して次へ進み、
  ファイルは残りません。未認証の訪問者をリダイレクトするページは、単に出力から
  欠落します。

ページを場合分けする必要があるときは `__VOT_GENERATE__` で分岐してください。ビルドが
定数として埋め込むので、使われない側は削除されます。

```ts
if (!__VOT_GENERATE__) {
  ctx.response?.headers.set('cache-control', 'private, no-store');
}
```

目安としては、**ページの出力が「誰が要求したか」に依存するほど、そのページは
`vot generate` には向きません。** 静的に生成することと、リクエストごとに個別化する
ことは同じ問いへの2つの答えであり、ページはどちらかを選ぶ必要があります。
