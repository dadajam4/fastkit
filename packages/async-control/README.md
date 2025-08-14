# @fastkit/async-control

非同期処理を効率的に制御・管理するためのヘルパーライブラリ。同一引数での連続する非同期処理の重複実行を防ぎ、キャッシュ機能やバックグラウンド更新などの高度な機能を提供します。TypeScriptで記述され、厳密な型安全性を保証します。

## 機能

- **重複実行防止**: 同一引数での連続する非同期処理を自動的に統合
- **高度なキャッシュ制御**: カスタマイズ可能なキャッシュ機能とバックグラウンド更新
- **遅延実行**: 指定された時間だけ実行を遅延させる機能
- **デコレータサポート**: TypeScriptデコレータによる宣言的な非同期制御
- **エラーハンドリング**: 包括的なエラー処理とカスタムログ機能
- **TypeScript完全サポート**: 厳密な型定義による型安全性
- **柔軟な設定**: 実行時の有効・無効切り替えや引数カスタマイズ
- **状態管理**: 非同期処理の詳細な状態追跡

## インストール

```bash
npm install @fastkit/async-control
```

## 基本的な使用方法

### シンプルな非同期制御

```typescript
import { AsyncHandler } from '@fastkit/async-control'

// 非同期関数の定義
async function fetchUserData(userId: string): Promise<{ id: string; name: string }> {
  const response = await fetch(`/api/users/${userId}`)
  return response.json()
}

// AsyncHandlerでラップ
const handler = new AsyncHandler(fetchUserData)

// 使用例
async function example() {
  // 同じuserIdで同時に複数回呼び出されても、実際のAPIコールは1回のみ
  const promise1 = handler.handler('user123')
  const promise2 = handler.handler('user123')
  const promise3 = handler.handler('user123')
  
  // すべて同じ結果を受け取る
  const [result1, result2, result3] = await Promise.all([promise1, promise2, promise3])
  
  console.log(result1 === result2 && result2 === result3) // true
}
```

### デコレータを使用した宣言的な制御

```typescript
import { AsyncHandle } from '@fastkit/async-control'

class ApiService {
  // デコレータで非同期制御を適用
  @AsyncHandle()
  async getUserProfile(userId: string) {
    console.log(`APIコール: ${userId}`)
    const response = await fetch(`/api/users/${userId}`)
    return response.json()
  }
  
  @AsyncHandle({ delay: 500 }) // 500ms遅延
  async searchUsers(query: string) {
    console.log(`検索実行: ${query}`)
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
    return response.json()
  }
  
  @AsyncHandle({
    hashArgs: (productId: string, _timestamp: number) => [productId] // timestampは無視
  })
  async getProductInfo(productId: string, timestamp: number) {
    // timestampが異なっていても、productIdが同じなら重複実行を防ぐ
    const response = await fetch(`/api/products/${productId}`)
    return response.json()
  }
}

// 使用例
const apiService = new ApiService()

// 短時間で複数回呼び出されても、実際のAPIコールは1回のみ
apiService.getUserProfile('user123')
apiService.getUserProfile('user123')
apiService.getUserProfile('user123')
```

## 高度な使用例

### キャッシュ機能付きの非同期制御

```typescript
import { AsyncHandler } from '@fastkit/async-control'
import { createMemoryCacheController } from '@fastkit/cache-control'

// キャッシュコントローラーの作成
const cacheController = createMemoryCacheController({
  ttl: 60 * 1000, // 60秒間キャッシュ
  max: 100        // 最大100エントリ
})

// キャッシュ付きAsyncHandler
const handler = new AsyncHandler(fetchUserData, {
  cache: {
    controller: cacheController,
    ttl: 60 * 1000, // 60秒間有効
    
    // バックグラウンド更新の設定
    revalidate: (details) => {
      // 残り有効期間が10秒以下の場合、バックグラウンド更新を実行
      return details.remainingTimes.ttl <= 10 * 1000
    },
    
    errorHandlers: {
      get: (error) => console.warn('キャッシュ取得エラー:', error),
      set: (error) => console.warn('キャッシュ保存エラー:', error)
    }
  }
})

async function fetchUserData(userId: string) {
  console.log(`API呼び出し: ${userId}`)
  const response = await fetch(`/api/users/${userId}`)
  return response.json()
}

// 使用例
async function cacheExample() {
  // 初回呼び出し: APIコールが実行される
  const user1 = await handler.handler('user123')
  
  // 2回目の呼び出し: キャッシュから取得（APIコールなし）
  const user2 = await handler.handler('user123')
  
  // キャッシュの有効期限が近い場合、バックグラウンドで更新が実行される
  console.log(user1, user2)
}
```

### 検索機能での活用

```typescript
import { AsyncHandle, getAsyncHandler } from '@fastkit/async-control'

interface SearchResult {
  id: string
  title: string
  description: string
}

class SearchService {
  @AsyncHandle({
    delay: 300, // 300ms遅延（デバウンス効果）
    
    // 検索クエリが空の場合は制御を無効化
    enabled: (query: string) => query.trim().length > 0,
    
    cache: {
      ttl: 5 * 60 * 1000, // 5分間キャッシュ
      revalidate: 'always' // 常にバックグラウンド更新
    }
  })
  async searchProducts(query: string): Promise<SearchResult[]> {
    console.log(`検索実行: "${query}"`)
    
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
    if (!response.ok) {
      throw new Error(`検索エラー: ${response.status}`)
    }
    
    return response.json()
  }
  
  // 検索のキャンセル機能
  cancelSearch() {
    const handler = getAsyncHandler(this.searchProducts)
    // 現在実行中のリクエストをすべて破棄
    Object.values((handler as any)._requestMap).forEach((request: any) => {
      request.destroy()
    })
  }
}

// 使用例
const searchService = new SearchService()

// リアルタイム検索の実装
function setupRealTimeSearch() {
  const searchInput = document.querySelector('#search') as HTMLInputElement
  
  searchInput.addEventListener('input', async () => {
    const query = searchInput.value
    
    if (query.length < 2) {
      searchService.cancelSearch()
      return
    }
    
    try {
      const results = await searchService.searchProducts(query)
      displaySearchResults(results)
    } catch (error) {
      console.error('検索エラー:', error)
      displayError('検索中にエラーが発生しました')
    }
  })
}

function displaySearchResults(results: SearchResult[]) {
  // 検索結果の表示処理
}

function displayError(message: string) {
  // エラー表示処理
}
```

### API呼び出しの最適化

```typescript
import { AsyncHandler } from '@fastkit/async-control'

class OptimizedApiClient {
  private userHandler: AsyncHandler<typeof this.fetchUser>
  private postsHandler: AsyncHandler<typeof this.fetchUserPosts>
  
  constructor() {
    // ユーザー情報の取得（長期キャッシュ）
    this.userHandler = new AsyncHandler(this.fetchUser.bind(this), {
      cache: {
        ttl: 10 * 60 * 1000, // 10分間キャッシュ
        revalidate: 30 * 1000 // 残り30秒でバックグラウンド更新
      },
      errorLogger: (error) => {
        console.error('ユーザー取得エラー:', error)
      }
    })
    
    // 投稿一覧の取得（短期キャッシュ + デバウンス）
    this.postsHandler = new AsyncHandler(this.fetchUserPosts.bind(this), {
      delay: 100, // 100ms遅延
      cache: {
        ttl: 60 * 1000, // 1分間キャッシュ
        revalidate: 'always' // 常にバックグラウンド更新
      }
    })
  }
  
  private async fetchUser(userId: string) {
    const response = await fetch(`/api/users/${userId}`)
    return response.json()
  }
  
  private async fetchUserPosts(userId: string, page: number = 1) {
    const response = await fetch(`/api/users/${userId}/posts?page=${page}`)
    return response.json()
  }
  
  // パブリックメソッド
  async getUser(userId: string) {
    return this.userHandler.handler(userId)
  }
  
  async getUserPosts(userId: string, page: number = 1) {
    return this.postsHandler.handler(userId, page)
  }
  
  // 一括データ取得
  async getUserWithPosts(userId: string) {
    // 並行して実行（キャッシュと重複制御が効く）
    const [user, posts] = await Promise.all([
      this.getUser(userId),
      this.getUserPosts(userId, 1)
    ])
    
    return { user, posts }
  }
}

// 使用例
const apiClient = new OptimizedApiClient()

async function loadUserDashboard(userId: string) {
  try {
    // 複数の場所から同時に呼び出されても効率的
    const dashboardData = await apiClient.getUserWithPosts(userId)
    return dashboardData
  } catch (error) {
    console.error('ダッシュボード読み込みエラー:', error)
    throw error
  }
}
```

### カスタム引数ハッシュ化

```typescript
import { AsyncHandler } from '@fastkit/async-control'

interface RequestOptions {
  includeMetadata?: boolean
  format?: 'json' | 'xml'
  version?: string
}

// デフォルト設定を除外したハッシュ化
const handler = new AsyncHandler(
  async (resourceId: string, options: RequestOptions = {}) => {
    // リソースを取得
    const response = await fetch(`/api/resources/${resourceId}`, {
      headers: {
        'Accept': options.format === 'xml' ? 'application/xml' : 'application/json',
        'API-Version': options.version || '1.0'
      }
    })
    return response.json()
  },
  {
    // デフォルト値は無視してハッシュ化
    hashArgs: (resourceId: string, options: RequestOptions = {}) => [
      resourceId,
      {
        includeMetadata: options.includeMetadata || false,
        format: options.format || 'json',
        version: options.version || '1.0'
      }
    ],
    
    cache: {
      ttl: 5 * 60 * 1000 // 5分間キャッシュ
    }
  }
)

// 使用例
async function resourceExample() {
  // これらの呼び出しは同じハッシュを生成するため、重複実行されない
  const resource1 = handler.handler('resource123')
  const resource2 = handler.handler('resource123', {})
  const resource3 = handler.handler('resource123', { format: 'json' })
  const resource4 = handler.handler('resource123', { version: '1.0' })
  
  const results = await Promise.all([resource1, resource2, resource3, resource4])
  // すべて同じ結果
}
```

### 条件付き非同期制御

```typescript
import { AsyncHandle } from '@fastkit/async-control'

class ConditionalService {
  private isProductionMode = process.env.NODE_ENV === 'production'
  
  @AsyncHandle({
    // 本番環境でのみ非同期制御を有効化
    enabled: function(this: ConditionalService) {
      return this.isProductionMode
    },
    
    cache: {
      ttl: 30 * 1000, // 30秒キャッシュ
    }
  })
  async getAnalyticsData(eventType: string, dateRange: string) {
    console.log(`分析データ取得: ${eventType}, ${dateRange}`)
    
    // 重い分析処理
    const response = await fetch(`/api/analytics/${eventType}?range=${dateRange}`)
    return response.json()
  }
  
  @AsyncHandle({
    // データサイズに基づく制御の有効化
    enabled: (data: any[]) => data.length > 100, // 100件超の場合のみ制御
    
    delay: 50, // 少し遅延
  })
  async processLargeDataset(data: any[]) {
    console.log(`大量データ処理開始: ${data.length}件`)
    
    // 重い処理のシミュレーション
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return data.map(item => ({
      ...item,
      processed: true,
      processedAt: new Date().toISOString()
    }))
  }
}

// 使用例
const service = new ConditionalService()

async function conditionalExample() {
  // 小さなデータセット（制御なし）
  const smallResult = await service.processLargeDataset([1, 2, 3])
  
  // 大きなデータセット（制御あり）
  const largeData = Array.from({ length: 200 }, (_, i) => ({ id: i }))
  const largeResult = await service.processLargeDataset(largeData)
  
  console.log({ smallResult, largeResult })
}
```

## リクエスト状態の管理

```typescript
import { AsyncHandler } from '@fastkit/async-control'

const handler = new AsyncHandler(async (id: string) => {
  // 長時間の処理をシミュレーション
  await new Promise(resolve => setTimeout(resolve, 2000))
  return { id, data: `結果: ${id}` }
})

async function requestStateExample() {
  // リクエストオブジェクトを取得
  const request = handler.getRequestByArgs(['test123'])
  
  console.log('初期状態:', request.state) // 'pending'
  console.log('保留中?:', request.isPending) // true
  
  // 処理開始
  const resultPromise = handler.handler('test123')
  
  // 少し待って状態確認
  setTimeout(() => {
    console.log('実行中の状態:', request.state) // 'running'
    console.log('実行中?:', request.isRunning) // true
  }, 100)
  
  // 結果を待機
  const result = await resultPromise
  
  console.log('完了状態:', request.state) // 'resolved'
  console.log('解決済み?:', request.isResolved) // true
  console.log('結果:', result)
}
```

## API仕様

### `AsyncHandler`クラス

```typescript
class AsyncHandler<Fn extends AsyncFn> {
  constructor(func: Fn, options?: AsyncHandlerOptions<Fn>)
  
  // 制御された非同期関数
  readonly handler: Fn
  
  // 元の関数を直接呼び出し
  call(...args: Parameters<Fn>): Promise<Awaited<ReturnType<Fn>>>
  
  // 指定引数が制御対象かどうか
  isEnabled(...args: Parameters<Fn>): boolean
  
  // 引数に対応するリクエストオブジェクトを取得
  getRequestByArgs(args: Parameters<Fn>): AsyncHandlerRequest<Fn>
}
```

### オプション設定

```typescript
interface AsyncHandlerOptions<Fn extends AsyncFn> {
  // エラーログ関数
  errorLogger?: (error: unknown) => any
  
  // 関数のthisオブジェクト
  thisObj?: any
  
  // 実行遅延時間（ミリ秒）
  delay?: number
  
  // 引数ハッシュ化のカスタマイズ
  hashArgs?: (...args: Parameters<Fn>) => any
  
  // キャッシュ設定
  cache?: RawAsyncHandlerCacheBehavior<AwaitedReturnType<Fn>>
  
  // 制御の有効・無効
  enabled?: boolean | ((...args: Parameters<Fn>) => boolean)
}
```

### キャッシュ設定

```typescript
interface AsyncHandlerCacheBehavior<T> {
  // TTL（有効期間）
  ttl?: number | Duration
  
  // 最大エントリ数
  max?: number
  
  // バックグラウンド更新条件
  revalidate?: 'always' | number | Duration | ((details) => boolean)
  
  // エラーハンドラ
  errorHandlers?: {
    get?: (error: unknown) => any
    set?: (error: unknown) => any
  }
}
```

### デコレータ

```typescript
// メソッドデコレータ
@AsyncHandle<Fn>(options?: AsyncHandlerOptions<Fn>)

// ハンドラー取得
function getAsyncHandler<Fn extends AsyncFn>(func: Fn): AsyncHandler<Fn>
```

### リクエスト状態

```typescript
interface AsyncHandlerRequest<Fn extends AsyncFn> {
  // 実行状態
  readonly state: 'pending' | 'running' | 'resolved' | 'rejected' | 'destroyed'
  
  // 状態確認
  readonly isPending: boolean
  readonly isRunning: boolean
  readonly isResolved: boolean
  readonly isRejected: boolean
  readonly isDestroyed: boolean
  
  // 結果取得
  getResolvedValue(): Awaited<ReturnType<Fn>>
  
  // リクエスト破棄
  destroy(): void
}
```

## 注意事項

### パフォーマンス考慮事項
- 引数の複雑なオブジェクトはハッシュ計算コストが高くなる
- キャッシュサイズは適切に制限する
- 長時間実行される処理では適切なタイムアウト設定を検討

### メモリ管理
- 不要になったリクエストは自動的に破棄される
- 大量の異なる引数での呼び出しは内部マップサイズに注意
- キャッシュの最大サイズを適切に設定

### エラー処理
- 元の関数のエラーは呼び出し元に伝播される
- キャッシュ操作のエラーは個別にハンドリング可能
- カスタムエラーロガーでログ出力をカスタマイズ

## ライセンス

MIT

## 関連パッケージ

- [@fastkit/cache-control](../cache-control/README.md): キャッシュ制御機能
- [@fastkit/duration](../duration/README.md): 時間期間管理
- [@fastkit/helpers](../helpers/README.md): 基本的なユーティリティ関数
- [@fastkit/tiny-hash](../tiny-hash/README.md): 軽量ハッシュ生成
- [@fastkit/tiny-logger](../tiny-logger/README.md): ログ出力機能