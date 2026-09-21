# @fastkit/catcher

🌐 [English](https://github.com/dadajam4/fastkit/blob/main/packages/catcher/README.md) | 日本語

アプリケーション内でTypeセーフな例外処理を実現するためのカスタムクラスライブラリ。様々な例外タイプ（Native Error、Axios Error、Fetch Error）を統一的に処理し、型安全性を保ちながら詳細なエラー情報の抽出と正規化を提供します。

## 何が得られるか

書きたいのは正常フローです。例外はきちんと処理する必要がありますが、その仕事を通信する機能ごとに散らばらせたくはありません。

そこで「例外をどう識別するか」と「エラーとして出てくる形」をアプリケーション全体で一度だけ決めます。以降、各機能は捕まえたものをそのまま投げ、受け取る側は同じ導出を書き直すのではなくスキーマを読みます。

```typescript
// なし。機能ごとに同じ推測を、少しずつ違う書き方で実装することになる。
catch (e) {
  if (axios.isAxiosError(e)) {
    message = e.response?.data?.message ?? e.message
    status = e.response?.status
  } else if (e instanceof Response) {
    message = e.statusText
    status = e.status
  } else if (e instanceof Error) {
    message = e.message
  } else {
    message = String(e)
  }
}
```

```typescript
// あり。1ファイルで一度だけ宣言する。
export const AppError = build({
  resolvers: [axiosErrorResolver, fetchResponseResolver()],
  normalizer: (resolved) => () => ({
    message: resolved.fetchError?.response.statusText ?? '問題が発生しました',
    status: resolved.fetchError?.response.status,
    code: 'APP_ERROR'
  })
})

// 以降、各機能はこれだけ。
throw await AppError.fromAsync(e)
```

これで得られるもの:

- **`from` は何でも受け取ります。** `unknown`、`Error`、`Response`、axios のエラー、すでに生成済みのキャッチャー。機能側はどれを捕まえたか知る必要も、判別するために分岐する必要もありません。
- **形の定義が1箇所に集まります。** リゾルバーが「各種の例外をどう識別し、何を取り出すか」を、ノーマライザーが「このアプリケーションにおけるエラーの形」を決めます。リゾルバーを1つ足せば、全ての呼び出し箇所がその恩恵を受けます。
- **読み出しが型安全です。** `err.status` はノーマライザーの戻り値型から型付けされます。`(e as any).response?.data?.message` も、「ある種類のエラーには存在するが別の種類には黙って存在しない」フィールドもありません。
- **何を報告するかの判断も1箇所です。** 下の[2つの層](#2つの層)を参照してください。リゾルバーは見つけたものを全部持っていて構わず、シリアライズされるのはノーマライザーが返したものだけです。
- **元の情報も残ります。** `resolvedData` にリゾルバーが抽出したものが残るので、正規化された形は既定であって上限ではありません。

インスタンスは本物の `Error` です。いつもどおり `throw` し、`catch` し、フレームワークをまたいで渡せます。

## 2つの層

最初に知る価値があるのはこれです。何をどこに置くか、そしてログに何が残るかが、これで決まります。

| | 持つもの | `toJSON()` に出るか |
| --- | --- | --- |
| `resolvedData` — **リゾルバー**が抽出したもの | 見つけた全部 | **出ない** |
| `data` — **ノーマライザー**が返したもの | あなたが選んだもの | **出る** |

**境界はノーマライザーです。** リゾルバーはレスポンスを丸ごと持っていて構いません。それ自体が外に出ることはないからです。シリアライズされるのはノーマライザーが返したものだけなので、「このアプリケーションにおけるエラーとは何か」と「ログに出して良いものは何か」が、一度きりの1つの判断になります。

```typescript
const err = await AppError.fromAsync(response)

err.toJSONString()
// {"code":"HTTP_ERROR","message":"That item is gone.","status":404, ...}
// それ以外は出ない。set-cookie も url も生のボディも残らない。

err.resolvedData.fetchError.response.headers['set-cookie']
// 必要とするノーマライザーのために、ここには残っている
```

ですから `resolvedData` からはスプレッドで丸投げせず、必要なものを選んでコピーしてください。レスポンスには `set-cookie`（セッション／リフレッシュトークン。しかも 401 はまさにそれがローテーションされる場面です）、署名付き URL の署名を含みうる `url`、そして目的のメッセージ以上のものを含みうるボディが乗っています。

```typescript
// 良い例: コードとメッセージだけ。
return { code: 'HTTP_ERROR', message: response.json?.message }

// セッションクッキー・署名付き URL・ボディ全体を、このエラーが記録される場所すべてに置く。
return { ...response }
```

## メッセージを保証する

`defaultMessage` を設定してください。設定しないとキャッチャーがメッセージを持つ保証はなく、しかもその失敗は静かです。

```typescript
const AppError = build({ normalizer: () => () => ({ code: 'APP_ERROR' }) })

const err = AppError.from('ただの文字列')  // どのリゾルバーも認識しなかった
err.message                                // ''
err.toJSONString()                         // {"code":"APP_ERROR","message":"", ...}
```

インスタンスは本物の `Error` であり、`Error` は空のメッセージを持って生まれます。つまり、認識できなかった例外に対してノーマライザーが `message` を返さなかったとき、フィールドが欠落するのではなく**空のフィールドが残ります**。これは「メッセージが無い」ではなく「メッセージがある」ように読めてしまいます。

`defaultMessage` は最後の一手で、ノーマライザーの後、そして例外自身のメッセージの後に適用されます。

```typescript
const AppError = build({
  defaultName: 'AppError',
  defaultMessage: '問題が発生しました',
  normalizer: () => () => ({ code: 'APP_ERROR' }),
})

AppError.from('ただの文字列').message      // '問題が発生しました'
AppError.from(new Error('real')).message // 'real' — 上書きはしない
```

この文字列は最終的にユーザーが読むものなので、パッケージが決めるべきものではありません。よって既定値はありません。`defaultMessage` が未設定のままメッセージ無しのインスタンスが生成されたとき、開発時にキャッチャーごとに1回だけ警告します。

## 機能

- **型安全な例外処理**: TypeScriptでの厳密な型定義による安全な例外ハンドリング
- **カスタムリゾルバー**: 様々な例外タイプに対応するカスタムリゾルバーシステム
- **例外の正規化**: 異なる形式の例外を統一的なフォーマットに正規化
- **履歴管理**: 例外の継承・連鎖を追跡する履歴機能
- **JSON シリアライゼーション**: 例外情報の JSON 出力機能
- **Axios 統合**: Axios エラーの詳細情報抽出とシリアライゼーション
- **Fetch API 統合**: Fetch API レスポンスエラーの処理
- **カスタマイズ可能**: 独自のリゾルバーとノーマライザーの作成

## インストール

```bash
npm install @fastkit/catcher
```

## 基本的な使用方法

### シンプルなキャッチャーの作成

```typescript
import { build, createCatcherNormalizer } from '@fastkit/catcher'

// 基本的なノーマライザーの作成
const normalizer = createCatcherNormalizer((resolvedData) => (exceptionInfo) => {
  return {
    timestamp: new Date().toISOString(),
    code: 'UNKNOWN_ERROR',
    message: '予期しないエラーが発生しました'
  }
})

// キャッチャークラスの生成
const MyCatcher = build({
  normalizer,
  defaultName: 'ApplicationError'
})

// 使用例
try {
  throw new Error('何かしらのエラー')
} catch (error) {
  const caughtError = MyCatcher.from(error)

  console.log(caughtError.name)        // 'ApplicationError'
  console.log(caughtError.message)     // 'エラーメッセージ'
  console.log(caughtError.timestamp)   // '2024-01-01T00:00:00.000Z'
  console.log(caughtError.code)        // 'UNKNOWN_ERROR'
}
```

### カスタムリゾルバーの使用

```typescript
import {
  build,
  createCatcherResolver,
  createCatcherNormalizer
} from '@fastkit/catcher'

// カスタムエラータイプの定義
interface APIError {
  code: string
  detail: string
  statusCode: number
}

function isAPIError(source: unknown): source is APIError {
  return typeof source === 'object' &&
         source !== null &&
         'code' in source &&
         'detail' in source &&
         'statusCode' in source
}

// APIエラー用のリゾルバー
const apiErrorResolver = createCatcherResolver((source, ctx) => {
  if (isAPIError(source)) {
    ctx.resolve() // 後続のリゾルバーをスキップ
    return {
      apiErrorCode: source.code,
      apiErrorDetail: source.detail,
      statusCode: source.statusCode
    }
  }
})

// ノーマライザーの作成
const normalizer = createCatcherNormalizer((resolvedData) => (exceptionInfo) => {
  if (resolvedData.apiErrorCode) {
    return {
      code: resolvedData.apiErrorCode,
      message: resolvedData.apiErrorDetail,
      statusCode: resolvedData.statusCode,
      type: 'API_ERROR'
    }
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: '予期しないエラーが発生しました',
    type: 'GENERIC_ERROR'
  }
})

// キャッチャークラスの生成
const APICatcher = build({
  resolvers: [apiErrorResolver],
  normalizer,
  defaultName: 'APIError'
})

// 使用例
const apiError: APIError = {
  code: 'VALIDATION_FAILED',
  detail: 'ユーザー名が無効です',
  statusCode: 400
}

const caught = APICatcher.from(apiError)
console.log(caught.code)        // 'VALIDATION_FAILED'
console.log(caught.message)     // 'ユーザー名が無効です'
console.log(caught.statusCode)  // 400
console.log(caught.type)        // 'API_ERROR'
```

## リゾルバーを書く

リゾルバーが答えるのは1つの問いだけです。**この例外は自分のものか、だとしたら何を取り出す価値があるか。** オブジェクトを返すとノーマライザー向けに `resolvedData` へマージされ、何も返さなければ「自分のものではない」という意思表示になります。

```typescript
const apiErrorResolver = createCatcherResolver((source, ctx) => {
  if (!isAPIError(source)) return // 自分のものではない

  ctx.resolve() // そして後続が見る必要もない
  return { apiError: { code: source.code, status: source.statusCode } }
})
```

`createCatcherResolver` は恒等関数です。引数の型を推論させ、戻り値の型を `resolvedData` とノーマライザーまで運ぶために存在します。

### 実行される順序

`nativeErrorResolver` はあなたのリストの**前**に置かれ、`Error` を決して見送りません。

| 書いたもの | 実行されるもの |
| --- | --- |
| `resolvers: [a, b]` | `nativeErrorResolver`, `a`, `b` |
| `resolvers: [a, nativeErrorResolver, b]` | `a`, `nativeErrorResolver`, `b` |

位置を動かしたいときは自分でリストに書きます。既に含まれているリストはそのまま尊重されます。`build` は渡された配列を書き換えないので、1つの `const resolvers` を2つのキャッチャーで共有できます。

したがって、あなたのリゾルバーが走る時点で `ctx.resolvedData` は、`Error` に対しては既に `nativeError` を持っており、`Error` でないものに対しては空です。

**2つのリゾルバーが同じ例外にマッチするのは例外ケースではなく通常ケースです。** fetch エラーは `fetchError` と `nativeError` の両方を持ちます。ネイティブリゾルバーが先に走り、それを見送らなかったからです。

### マージと `ctx.resolve()`

結果は順にマージされるので、後のリゾルバーは先のリゾルバーのキーを上書きし、それ以外はそのまま残します。

```typescript
// a が { who: 'a', onlyA: 1 } を返し、次に b が { who: 'b' } を返す
resolvedData // { nativeError, who: 'b', onlyA: 1 }
```

返すものを1つのキーの下にまとめる（`{ code, status }` ではなく `{ apiError: { ... } }`）と、2つのリゾルバーが黙って互いのフィールドを上書きすることを防げます。

`ctx.resolve()` は後続のリゾルバーを止めます。呼ぶかどうかは任意です。呼ばなければ全員に順番が回るので、例外を「占有する」のではなく「一側面を足す」リゾルバーではそれが正解です。**何かを返したかどうかに関わらず効きます。**「これは自分のもので、後続が見る必要はない」は、例外を認識した上で取り出す価値のあるものが無かったリゾルバーにも等しく言えることだからです。

### Promise を返す

`ctx.canAwait` が `true` のときだけです。同期エントリーポイントには await する場所がありません（インスタンスは、throw される時点で存在していなければならない `Error` です）。そこで返された Promise は、それが生んだはずのものごと破棄されます。

await できればもっと取れるリゾルバーには2つの経路があり、同期側ではそれが何を失わせたかを申告します。

```typescript
const myResolver = createCatcherResolver((source, ctx) => {
  const extracted = extract(source)
  if (!extracted) return

  if (!ctx.canAwait) {
    ctx.degraded?.('response body')
    return { myError: metaOf(extracted) }
  }

  return readBody(extracted).then((body) => ({
    myError: { ...metaOf(extracted), body },
  }))
})
```

`ctx.degraded()` は `ctx.canAwait` が `true` のときは何もしないので、呼び出し側でガードする必要はありません。これは「何かが失われたかもしれない」と推測するのではなく、警告が**失われたものの名前**を出せるようにするためのものです。型の上で optional なのは、手組みのコンテキストがコンパイルを通り続けるようにするためだけで、キャッチャーは常にこれを渡します。

### throw してはいけない

リゾルバーはエラーが記述されている最中に走ります。そこに自分のエラーを持ち込んではいけません。元の例外を処理している側が、捕まえたはずのものの代わりにこのパッケージ内部からの `TypeError` を受け取ることになります。

それでも throw したリゾルバーはスキップされ、後続のリゾルバーには順番が回り、開発時には通知されます。

```
[@fastkit/catcher] A resolver threw while describing an exception, and was skipped.
  TypeError: Cannot read properties of undefined (reading 'data')
  The exception being described is unaffected -- fix the resolver.
```

throw したリゾルバーは「何も貢献しなかった」として扱われ、それには `ctx.resolve()` も含まれます。1回の失敗が後続すべてを黙らせることはありません。これは安全網であって免罪符ではありません。気づく場所がこの警告です。

### どのエントリーポイントを使うか

| | ノーマライザー第2段への引数 | overrides | リゾルバーを await |
| --- | --- | --- | --- |
| `create(info)` | `info` | 不可 | しない |
| `from(e, overrides?)` | `undefined` | 可 | しない |
| `createAsync(info)` | `info` | 不可 | する |
| `fromAsync(e, overrides?)` | `undefined` | 可 | する |

`from` は「捕まえたが何かは分からないもの」向けで、ノーマライザーはリゾルバーが抽出したものから組み立てます。通常はこちらです。`create` は「自分のペイロードから意図的に構築するエラー」向けで、そのペイロードがノーマライザーの第2段にそのまま渡ります。

`fromAsync` / `createAsync` は同じ2つを、全リゾルバーを await してから実行する版です。await できる場所では常にこちらを選んでください（[`from` と `fromAsync`](#from-と-fromasync)を参照）。

## リゾルバーをテストする

リゾルバーのテストのためにコンテキストを手で組み立てる必要はありません。手組みは自分の所有物でない型の形にテストを結合させ、さらに `ctx.resolve()` と `ctx.degraded()` を観測不能にします。

```typescript
import { runResolver } from '@fastkit/catcher/testing'

const { data, resolved, degraded } = await runResolver(apiErrorResolver, apiError)

data?.apiError.code // リゾルバーの戻り値。処理しなかった場合は undefined
resolved            // ctx.resolve() を呼んだか
degraded            // ctx.degraded() で報告された内容
```

リゾルバーが同期か非同期かに関わらず常に非同期なので、`await` 1つで両方を扱えます。実行の形を決めるオプションは2つです。

| オプション | 既定 | 用途 |
| --- | --- | --- |
| `canAwait` | `true` | `ctx.canAwait` の値。`false` にすると同期エントリーポイントが通る経路を検証できます。 |
| `resolvedData` | `{}` | 先行するリゾルバーが残したもの。実際のキャッチャーでは `Error` に対してこれが空になることはありません（`nativeErrorResolver` が最初に走るため）。 |

```typescript
// 同期経路と、そこで失われたと申告された内容
const sync = await runResolver(fetchResponseResolver(), err, { canAwait: false })
sync.degraded // ['response body']
```

渡した1つのリゾルバーだけを実行します。それ以外は走らないので、必要な前提は `resolvedData` で与えてください。

専用のパスで公開しているので、メインエントリー経由でアプリケーションのバンドルに入ることはありません。

## ノーマライザーを書く

ノーマライザーは「このアプリケーションにとってエラーとは何か」を決めます。手で書くとオプショナルアクセスの連鎖になり、構造が「どの種類の例外だったか」ではなく「このフィールドは存在するか」に支配されます。

```typescript
normalizer: (resolved) => () => ({
  message: resolved.fetchError?.response.bodyRead
    ? (resolved.fetchError.response.json?.message ??
       resolved.fetchError.response.statusText)
    : resolved.fetchError?.response.statusText,
  status: resolved.fetchError?.response.status,
})
```

`match` はリゾルバーが見つけたものでディスパッチし、各ブランチには**絞り込み済みのスライス**を渡します。`?.` は消えます。

```typescript
import { build, match, fetchResponseResolver } from '@fastkit/catcher'

const resolvers = [fetchResponseResolver()]

export const AppError = build({
  resolvers,
  defaultName: 'AppError',
  defaultMessage: '問題が発生しました',
  normalizer: match(resolvers, {
    fetchError: ({ response }) => ({
      code: 'HTTP_ERROR',
      message: response.bodyRead
        ? (response.json?.message ?? response.statusText)
        : response.statusText,
      status: response.status,
    }),
    nativeError: (e) => ({ code: 'UNEXPECTED', message: e.message }),
    default: () => ({ code: 'UNKNOWN', message: '問題が発生しました' }),
  }),
})
```

### ブランチは排他ではなく順序つき

これが書く前に知っておくべき唯一のことです。**ブランチは書かれた順に試され**、キーが存在する最初のものが勝ちます。`default` はどこに書いても常に最後です。

順序つきでなければならないのは、排他ではないからです。`nativeErrorResolver` はあなたのリストの前に走り、`Error` を決して見送りません（[実行される順序](#実行される順序)を参照）。したがって fetch エラーは**両方のキー**を持って到達します。

```typescript
resolvedData // { nativeError: ApiResponseError, fetchError: { ... } }
```

つまり `nativeError` ブランチはほぼ何にでもマッチするので、`default` の直前、最後に置きます。それより前に置くと後続のブランチはすべて死にます。そうしたときは開発時に警告します。

```
[@fastkit/catcher] `match` lists `nativeError` before `fetchError`, which will never run.
```

オブジェクトリテラルは例外の種類に対する `switch` のように見えますが、実体は「リゾルバーが残したものに対する述語の順序つきリスト」です。具体的なものから順に並べてください。

### ブランチが受け取るもの

```typescript
fetchError: (slice, ctx) => ({ ... })
default: (ctx) => ({ ... })
```

`slice` はそのリゾルバー自身の出力から `undefined` を除いたものです。`ctx.resolvedData` はリゾルバーが見つけたすべてで、他のブランチが取るはずだったスライスも含みます。ブランチは分割ではなくディスパッチなので、`fetchError` ブランチが `nativeError.stack` を参照するのは通常の使い方です。`ctx.exceptionInfo` は `create` / `createAsync` ではエラー情報、`from` / `fromAsync` では `undefined` です。

### 結果の型

ブランチの戻り値型はユニオンのままではなく**マージ**されます。すべてのブランチが返すフィールドは**必須**に、一部だけが返すフィールドは**オプショナル**になります。

```typescript
AppError.from(e).code   // 'HTTP_ERROR' | 'UNEXPECTED' | 'UNKNOWN'
AppError.from(e).status // number | undefined
```

ユニオンのままだと `status` は読むこと自体がエラーになります。`default` が必須であることが効いてくるのもここです。全体をカバーするディスパッチでなければ「何も返さない経路」が常に存在し、どのフィールドも約束できません。すべてのブランチで `message` を宣言すれば型レベルで保証されます。ランタイム側は [`defaultMessage`](#メッセージを保証する) と組み合わせてください。メッセージを例外自身に委ねるブランチもカバーできます。

### なぜリゾルバーを再度渡すのか

スライスに型を付ける唯一の方法だからです。渡さずに `match({ ... })` と書くと、ブランチの引数は `any` に落ち、絞り込みごとこのヘルパーの意味が失われます。ランタイムでは配列を読みません。`const` に持ち上げて、同じものを両方に渡してください。

## 高度な使用例

### Axios エラーハンドリング

```typescript
import {
  build,
  createCatcherNormalizer,
  axiosErrorResolver
} from '@fastkit/catcher'
import axios from 'axios'

// Axiosエラー用ノーマライザー
const axiosNormalizer = createCatcherNormalizer((resolvedData) => (exceptionInfo) => {
  if (resolvedData.axiosError) {
    const { axiosError } = resolvedData
    return {
      message: axiosError.message,
      method: axiosError.config.method?.toUpperCase(),
      url: axiosError.config.url,
      statusCode: axiosError.response?.status,
      statusText: axiosError.response?.statusText,
      responseData: axiosError.response?.data,
      requestData: axiosError.config.data,
      headers: axiosError.config.headers,
      code: axiosError.code,
      type: 'HTTP_ERROR'
    }
  }

  return {
    message: '通信エラーが発生しました',
    type: 'NETWORK_ERROR'
  }
})

// Axiosキャッチャーの作成
const HttpCatcher = build({
  resolvers: [axiosErrorResolver],
  normalizer: axiosNormalizer,
  defaultName: 'HttpError'
})

// 使用例
async function fetchUserData(userId: string) {
  try {
    const response = await axios.get(`/api/users/${userId}`)
    return response.data
  } catch (error) {
    const httpError = HttpCatcher.from(error)

    console.log('エラータイプ:', httpError.type)      // 'HTTP_ERROR'
    console.log('HTTPメソッド:', httpError.method)    // 'GET'
    console.log('URL:', httpError.url)               // '/api/users/123'
    console.log('ステータス:', httpError.statusCode) // 404
    console.log('レスポンス:', httpError.responseData)

    // JSON形式での出力
    console.log(httpError.toJSONString(true))

    throw httpError
  }
}
```

### Fetch API エラーハンドリング

```typescript
import {
  build,
  createCatcherNormalizer,
  fetchResponseResolver
} from '@fastkit/catcher'

// カスタムFetchエラー抽出関数
const extractFetchError = (source: unknown) => {
  if (source instanceof Response) {
    return { response: source }
  }

  // カスタムエラー形式
  if (source instanceof Error && 'response' in source) {
    return {
      name: source.name,
      message: source.message,
      stack: source.stack,
      response: (source as any).response as Response
    }
  }
}

// Fetchエラー用ノーマライザー
//
// ここで返したものだけがエラーと一緒に運ばれます。`toJSON()` が出力するのも
// ログに残るのもこの戻り値で、`resolvedData` 自体はシリアライズされません。
// 後述の「ノーマライザーで何を返すか」を参照してください。
const fetchNormalizer = createCatcherNormalizer((resolvedData) => (exceptionInfo) => {
  const { fetchError } = resolvedData

  if (fetchError) {
    const { response } = fetchError
    return {
      // ボディは `fromAsync` で生成したときだけ存在します。
      message: response.bodyRead
        ? (response.json?.message ?? response.statusText)
        : (fetchError.message || `HTTP ${response.status} Error`),
      status: response.status,
      type: 'FETCH_ERROR'
    }
  }

  return {
    message: 'ネットワークエラーが発生しました',
    type: 'NETWORK_ERROR'
  }
})

// Fetchキャッチャーの作成
const FetchCatcher = build({
  resolvers: [fetchResponseResolver(extractFetchError)],
  normalizer: fetchNormalizer,
  defaultName: 'FetchError'
})

// カスタムfetch関数
async function safeFetch(url: string, options?: RequestInit) {
  try {
    const response = await fetch(url, options)

    if (!response.ok) {
      // レスポンスエラーを例外として投げる
      throw response
    }

    return response
  } catch (error) {
    // `from` ではなく `fromAsync` です。`Response` はボディを Promise 経由でしか
    // 渡さないため、上のノーマライザーが `response.json` を見られるのはこちらだけです。
    // リゾルバがボディを奪うことはありません（クローンを読むので、この後も
    // `response.json()` は使えます）。
    const fetchError = await FetchCatcher.fromAsync(error)

    console.log('Fetch error:', fetchError.message)
    console.log('Status:', fetchError.status)

    throw fetchError
  }
}

// 使用例
async function loadApiData() {
  try {
    const response = await safeFetch('/api/data')
    return await response.json()
  } catch (error) {
    if (error.type === 'FETCH_ERROR') {
      console.error('API呼び出しに失敗しました:', error.message)
    }
    throw error
  }
}
```

#### `from` と `fromAsync`

| | `from` / `create` | `fromAsync` / `createAsync` |
| --- | --- | --- |
| 戻り値 | インスタンス | インスタンスの Promise |
| `response.bodyRead` | `false` | `true` |
| `response.json` / `.text` | 型に存在しない | 参照できる |

それ以外（status / statusText / url / headers / ok / redirected / type）は
`Response` が同期で返すので、どちらでも取得できます。

`bodyRead` は判別子なので、絞り込んだ後でのみボディに触れます。

```typescript
if (response.bodyRead) {
  response.json // ここだけ
}
```

ただし、例外が既にボディを持っている場合は別です（[例外が既にボディを持っている場合](#例外が既にボディを持っている場合)）。その場合は `from` で足ります。

#### `bodyState`: ボディがどこから来たか

`bodyRead` は「見られるか」に答えます。`bodyState` は「なぜ見られないのか」「これはどこから来たのか」に答えます。

| `bodyState` | `bodyRead` | 意味 |
| --- | --- | --- |
| `'unread'` | `false` | 何も試みていない。同期エントリーポイントはボディを待てない |
| `'read'` | `true` | wire から読んだ。`text` はサーバが送ったそのもの |
| `'unavailable'` | `true` | 読もうとしたができなかった。既に消費済みかロック済みだった |
| `'provided'` | `true` | アプリケーションが渡した。`json` がその値で、`text` は `''` |

以前は上2つの区別しかなく、**「サーバが本当に空を返した」と「リゾルバが届かなかった」が同じ見た目**でした（どちらも `text: ''` / `json: null`）。障害報告に「ボディが空だった」と出たとき、この違いはサーバを疑うか自分のコードを疑うかの違いです。

`bodyRead` は `bodyState` から導出できますが、あえて残しています。`Response.ok` を `Response.status` の隣に残すのと同じ理由で、「ボディを見られるか」はほぼすべての使用箇所で聞かれる質問なので、一語で答えられるべきだからです。

#### 例外が既にボディを持っている場合

fetch の失敗に対して自前の例外を投げるアプリケーションは、たいてい先にボディを読んでいます。例外のメッセージを組み立てるのに必要だからです。

```typescript
class ApiResponseError extends Error {
  readonly response: Response
  readonly body: unknown // パース済み
}
```

このときボディは消費済みなので、リゾルバは読み直せません（`clone()` は消費済みのボディで例外を投げます）。その結果、正規化する価値のある構造化された部分——`code` やフィールド単位のエラー——が失われます。

渡せば、そのまま使われます。

```typescript
fetchResponseResolver((source) =>
  source instanceof ApiResponseError
    ? { response: source.response, body: source.body }
    : undefined
)
```

組み込みの extract 関数は、例外に `response` と並んで `body` があればそれを拾うので、上の形なら extract を自作する必要すらないことが多いはずです。

これは「消費者がリゾルバの仕事をする」のではありません。アプリケーションは自分の都合でボディを読んだのであって、これはリゾルバが「既にあるものを使う」ことを受け入れるという話です。この経路で来たボディは `await` を必要としないので、**`from` で足ります**（本来なら `fromAsync` が必要な場面でも）。

#### 選択を1箇所に閉じ込める

`from` と `fromAsync` は意味ではなく「届く範囲」が違うだけで、取り違えると黙ってボディを失います。選択が属する場所にヘルパーを1つ作り、各所はそれを呼ぶ形にしてください。

```typescript
// アプリケーション全体で1ファイル。
export const toAppError = (e: unknown) => AppError.fromAsync(e)

// 各機能はこれだけ。
catch (e) {
  throw await toAppError(e)
}
```

`from` は本来の得意分野に残ります。await できないエラー境界で、そもそも報告できるのはレスポンスのメタ情報だけ、という場面です。

選択を閉じ込めきれない場合（`from` を直接呼んだ場合）は、黙って通さず開発時に知らせます。

```
[@fastkit/catcher] A resolver could not wait for: response body.
  Use `await AppError.fromAsync(e)` where you can await.
```

これを報告するのはリゾルバー自身（`ctx.degraded()`）です。したがって、**本当に手が届く場所にあって取れなかったとき**にだけ出ます。`fetchResponseResolver` を「持っているだけ」のキャッチャーは、そのリゾルバーがマッチしなかった例外に対しては黙ったままです。

#### ノーマライザーで何を返すか

[2つの層](#2つの層)を参照してください。レスポンスはまさに「選んでコピーすべきもの」の典型です。`set-cookie`、署名付き URL の署名を含みうる `url`、そして目的のメッセージ以上のものを含みうるボディが乗っています。

### 複数リゾルバーとエラー履歴管理

```typescript
import {
  build,
  createCatcherResolver,
  createCatcherNormalizer,
  axiosErrorResolver,
  fetchResponseResolver
} from '@fastkit/catcher'

// 汎用エラーリゾルバー
const genericErrorResolver = createCatcherResolver((source, ctx) => {
  if (typeof source === 'string') {
    return { errorMessage: source }
  }

  if (source && typeof source === 'object' && 'message' in source) {
    return { errorMessage: String(source.message) }
  }
})

// 統合ノーマライザー
const unifiedNormalizer = createCatcherNormalizer((resolvedData) => (exceptionInfo) => {
  // Axiosエラーの場合
  if (resolvedData.axiosError) {
    return {
      type: 'HTTP_ERROR',
      message: resolvedData.axiosError.message,
      statusCode: resolvedData.axiosError.response?.status,
      url: resolvedData.axiosError.config.url,
      method: resolvedData.axiosError.config.method
    }
  }

  // Fetchエラーの場合
  if (resolvedData.fetchError) {
    return {
      type: 'FETCH_ERROR',
      message: `HTTP ${resolvedData.fetchError.response.status}`,
      statusCode: resolvedData.fetchError.response.status,
      url: resolvedData.fetchError.response.url
    }
  }

  // Nativeエラーの場合
  if (resolvedData.nativeError) {
    return {
      type: 'NATIVE_ERROR',
      message: resolvedData.nativeError.message,
      name: resolvedData.nativeError.name,
      stack: resolvedData.nativeError.stack
    }
  }

  // 汎用エラーの場合
  if (resolvedData.errorMessage) {
    return {
      type: 'GENERIC_ERROR',
      message: resolvedData.errorMessage
    }
  }

  return {
    type: 'UNKNOWN_ERROR',
    message: '不明なエラーが発生しました'
  }
})

// 統合キャッチャーの作成
const UnifiedCatcher = build({
  resolvers: [
    axiosErrorResolver,
    fetchResponseResolver(),
    genericErrorResolver
  ],
  normalizer: unifiedNormalizer,
  defaultName: 'UnifiedError'
})

// エラー処理チェーン
async function processWithErrorHandling() {
  try {
    // 何らかの処理
    throw new Error('処理に失敗しました')
  } catch (originalError) {
    const primaryError = UnifiedCatcher.from(originalError)

    try {
      // リトライ処理
      throw new Error('リトライも失敗しました')
    } catch (retryError) {
      // 元のエラー情報を保持しつつ新しいエラーを作成
      const finalError = UnifiedCatcher.from(retryError, {
        message: 'すべての処理が失敗しました',
        originalError: primaryError.message
      })

      // エラー履歴の確認
      console.log('エラー履歴:')
      finalError.histories.forEach((history, index) => {
        console.log(`  ${index + 1}. ${history.message}`)
      })

      // すべてのメッセージを取得
      console.log('全メッセージ:', finalError.messages)

      throw finalError
    }
  }
}
```

### ユーティリティ関数の活用

```typescript
import { isCatcher, isCatcherData } from '@fastkit/catcher'

// エラー判定の例
function handleAnyError(error: unknown) {
  if (isCatcher(error)) {
    console.log('キャッチャーエラー:', error.type)
    console.log('詳細情報:', error.toJSONString(true))
    return
  }

  if (error instanceof Error) {
    console.log('ネイティブエラー:', error.message)
    return
  }

  console.log('その他のエラー:', error)
}

// データ復元の例
function restoreErrorFromData(data: unknown) {
  if (isCatcherData(data)) {
    // キャッチャーデータから復元
    const restoredError = UnifiedCatcher.from(data)
    return restoredError
  }

  throw new Error('有効なキャッチャーデータではありません')
}

// JSON保存・復元の例
function saveAndRestoreError() {
  try {
    throw new Error('テストエラー')
  } catch (originalError) {
    const caughtError = UnifiedCatcher.from(originalError)

    // JSON文字列として保存
    const jsonString = caughtError.toJSONString()
    console.log('保存用JSON:', jsonString)

    // JSON文字列から復元
    const parsedData = JSON.parse(jsonString)
    const restoredError = restoreErrorFromData(parsedData)

    console.log('復元されたエラー:', restoredError.message)
    console.log('元のエラーと同じ?:', caughtError.message === restoredError.message)
  }
}
```

## API仕様

### `build` 関数

```typescript
function build<
  Resolvers extends AnyResolvers,
  Normalizer extends AnyNormalizer<Resolvers>
>(
  opts: CatcherBuilderOptions<Resolvers, Normalizer>
): CatcherConstructor<Resolvers, Normalizer>
```

キャッチャークラスを生成します。

#### オプション

```typescript
interface CatcherBuilderOptions<Resolvers, Normalizer> {
  // デフォルトエラー名
  defaultName?: string

  // 他の何もメッセージを生まなかったときに使うメッセージ
  // （[メッセージを保証する](#メッセージを保証する)を参照）
  defaultMessage?: string

  // リゾルバー配列
  resolvers?: Resolvers

  // ノーマライザー関数
  normalizer: Normalizer
}
```

### `createCatcherResolver` 関数

```typescript
function createCatcherResolver<Resolver extends AnyResolver>(
  resolver: Resolver
): Resolver
```

カスタムリゾルバーを作成します。守るべき契約は[リゾルバーを書く](#リゾルバーを書く)を参照してください。

### `match` 関数

```typescript
function match<Resolvers extends AnyResolvers, Branches extends MatchBranches<Resolvers>>(
  resolvers: Resolvers,
  branches: Branches
): AnyNormalizer<Resolvers>
```

リゾルバーが見つけたものでディスパッチするノーマライザーを作ります。ブランチは書かれた順に試され、`default` は必須かつ常に最後です（[ノーマライザーを書く](#ノーマライザーを書く)を参照）。

### `createCatcherNormalizer` 関数

```typescript
function createCatcherNormalizer<
  Normalizer extends AnyNormalizer<Resolvers>,
  Resolvers extends AnyResolvers
>(
  normalizer: Normalizer,
  _resolvers?: Resolvers
): Normalizer
```

カスタムノーマライザーを作成します。

### キャッチャーインスタンス

```typescript
interface Catcher<Resolvers, T> extends Error {
  // キャッチャーフラグ
  readonly isCatcher: true

  // 処理済みデータ
  readonly data: CatcherData<T>

  // リゾルバーで抽出されたデータ
  readonly resolvedData: ResolvedCatcherData<Resolvers>

  // 元のソースエラー（オーバーライド時のみ）
  readonly source?: Catcher<Resolvers, T>

  // エラー履歴
  readonly histories: Catcher<Resolvers, T>[]

  // 全メッセージ
  readonly messages: string[]

  // JSON出力
  toJSON(): ErrorImplements & CatcherData<T> & { messages: string[] }

  // JSON文字列出力
  toJSONString(indent?: number | boolean): string
}
```

インスタンスは生成したコンストラクタ経由で作ります。

```typescript
Catcher.create(errorInfo)          // エラー情報から
Catcher.from(unknownException)     // 任意の値から正規化して

// 上の2つを、全リゾルバーを await してから実行する版。
// `Response` のボディのように Promise 経由でしか得られないものを
// リゾルバーが扱う場合に必要です。
await Catcher.createAsync(errorInfo)
await Catcher.fromAsync(unknownException)
```

### 組み込みリゾルバー

#### `nativeErrorResolver`
ネイティブErrorオブジェクトを処理します。

#### `axiosErrorResolver`
Axiosエラーを処理し、詳細な HTTP リクエスト・レスポンス情報を抽出します。

#### `fetchResponseResolver`
Fetch API のレスポンスエラーを処理します。レスポンスボディを含めるには
`fromAsync` / `createAsync` でインスタンスを生成してください
（[Fetch API エラーハンドリング](#fetch-api-エラーハンドリング)を参照）。

### ユーティリティ関数

```typescript
// キャッチャーインスタンス判定
function isCatcher(source: unknown): source is Catcher

// キャッチャーデータ判定
function isCatcherData<T extends Catcher>(source: unknown): source is T['data']
```

### `runResolver` 関数

`@fastkit/catcher/testing` として公開しています。アプリケーションのバンドルには入りません。

```typescript
function runResolver<Resolver extends AnyResolver>(
  resolver: Resolver,
  source: unknown,
  options?: {
    canAwait?: boolean      // 既定: true
    resolvedData?: AnyData  // 既定: {}
  }
): Promise<{
  data: ResolverOutput<Resolver> | undefined
  resolved: boolean
  degraded: string[]
}>
```

1つのリゾルバーを例外に対して実行します（[リゾルバーをテストする](#リゾルバーをテストする)を参照）。

## 注意事項

### TypeScript考慮事項
- リゾルバーとノーマライザーの型定義を正確に行う
- 戻り値の型が適切に推論されるようにする
- カスタムエラータイプの型ガードを適切に実装

### パフォーマンス考慮事項
- 大量のエラーが発生する環境では履歴管理のメモリ使用量に注意
- 複雑なリゾルバーチェーンは処理コストを考慮
- JSON シリアライゼーション時の循環参照に注意

### エラーハンドリング
- リゾルバー内での例外は適切に処理される
- ノーマライザーでの例外はキャッチャー自体の生成に影響
- 外部ライブラリのエラー形式変更に対する互換性維持

## ライセンス

MIT

## 関連パッケージ

- [@fastkit/helpers](../helpers/README.md): 基本的なユーティリティ関数
