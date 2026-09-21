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

## リゾルバーをテストする

このパッケージの主な使われ方はリゾルバーを書くことです。そのテストのためにコンテキストを手で組み立てる必要はありません。手組みは自分の所有物でない型の形にテストを結合させ、さらに `ctx.resolve()` と `ctx.degraded()` を観測不能にします。

```typescript
import { runResolver } from '@fastkit/catcher/testing'

const { data, resolved, degraded } = await runResolver(apiErrorResolver, apiError)

data?.apiErrorCode // リゾルバーの戻り値。処理しなかった場合は undefined
resolved           // ctx.resolve() を呼んだか
degraded           // ctx.degraded() で報告された内容
```

リゾルバーが同期か非同期かに関わらず常に非同期なので、`await` 1つで両方を扱えます。実行の形を決めるオプションは2つです。

| オプション | 既定 | 用途 |
| --- | --- | --- |
| `canAwait` | `true` | `ctx.canAwait` の値。`false` にすると同期エントリーポイントが通る経路を検証できます。 |
| `resolvedData` | `{}` | 先行するリゾルバーが残したもの。実際のキャッチャーでは `Error` に対してこれが空になることはありません（`nativeErrorResolver` が最初に走り、必ず `nativeError` を足すため）。 |

```typescript
// 同期経路と、そこで失われたと申告された内容
const sync = await runResolver(fetchResponseResolver(), err, { canAwait: false })
sync.degraded // ['response body']
```

渡した1つのリゾルバーだけを実行します。それ以外は走らないので、必要な前提は `resolvedData` で与えてください。

専用のパスで公開しているので、メインエントリー経由でアプリケーションのバンドルに入ることはありません。

### 届かなかったものを申告する

await できればもっと取れるリゾルバーには、2つの経路があります。同期側の経路では、置き去りにしたものを申告してください。

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

`ctx.degraded()` は `ctx.canAwait` が `true` のときは何もしないので、呼び出し側でガードする必要はありません。これは「何かが失われたかもしれない」と推測するのではなく、警告が**失われたものの名前**を出せるようにするためのものです。そして `runResolver` がそれをテストで表明可能にします。

型の上で optional なのは、手組みのコンテキストがコンパイルを通り続けるようにするためだけです。キャッチャーは常にこれを渡します。

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

カスタムリゾルバーを作成します。

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
