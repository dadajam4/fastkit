# @fastkit/catcher

🌐 [English](https://github.com/dadajam4/fastkit/blob/main/packages/catcher/README.md) | 日本語

アプリケーション内でTypeセーフな例外処理を実現するためのカスタムクラスライブラリ。様々な例外タイプ（Native Error、Axios Error、Fetch Error）を統一的に処理し、型安全性を保ちながら詳細なエラー情報の抽出と正規化を提供します。

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

#### ノーマライザーで何を返すか

キャッチャーは2層構造で、その境界がノーマライザーです。

| | 保持するもの | `toJSON()` が出力するか |
| --- | --- | --- |
| `resolvedData`（リゾルバの出力） | リゾルバが抽出した全て | **しない** |
| `data`（ノーマライザーの出力） | あなたが返したもの | **する** |

つまりリゾルバはレスポンスを丸ごと持っていて構わず、外に出すものはあなたが決めます。
スプレッドで丸投げせず、必要なものを選んでコピーしてください。レスポンスには
`set-cookie`（セッション／リフレッシュトークン。しかも 401 はまさにそれが
ローテーションされる場面です）、署名付き URL の署名や `?token=` を含みうる `url`、
そして目的のメッセージ以上のものを含みうるボディが乗っています。

```typescript
// 良い例: コードとメッセージだけ。
return { status: response.status, message: response.json?.message }

// セッションクッキー・署名付き URL・ボディ全体を、このエラーが記録される場所すべてに置く。
return { ...response }
```

ヘッダーが必要なら、名前を指定します。

```typescript
return { requestId: response.headers['x-request-id'] }
```

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
