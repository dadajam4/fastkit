# @fastkit/cache-control

JavaScript実装にキャッシュ制御をプラグインするためのヘルパライブラリ。メモリ・ファイルシステムベースのストレージを提供し、TTL（有効期限）管理、自動有効期限チェック、柔軟なキャッシュ操作APIを備えた包括的なキャッシュソリューションです。

## 機能

- **複数ストレージサポート**: メモリベース・ファイルシステムベースのストレージ
- **TTL管理**: 柔軟な有効期限設定とDurationクラス統合
- **自動有効期限チェック**: 期限切れキャッシュの自動削除
- **型安全性**: TypeScriptによる厳密な型定義
- **非同期対応**: Promise ベースの完全非同期API
- **残り時間計算**: キャッシュの残り有効時間の詳細情報
- **柔軟なキー管理**: 文字列キーまたはオブジェクト形式のリクエスト
- **メモリ制限**: 最大キー数によるメモリ使用量制御
- **ファイルキャッシュ**: 永続化されたキャッシュストレージ

## インストール

```bash
npm install @fastkit/cache-control
```

## 基本的な使用方法

### メモリキャッシュの基本使用

```typescript
import { CacheController, MemoryCacheStorage } from '@fastkit/cache-control'

// メモリベースストレージの作成
const storage = new MemoryCacheStorage({
  maxKeys: 1000 // 最大1000件のキャッシュを保持
})

// キャッシュコントローラーの作成
const cacheController = new CacheController({
  storage,
  ttl: 300 // デフォルト5分のTTL
})

// 基本的なキャッシュ操作
async function basicCacheExample() {
  // データをキャッシュに保存
  const cacheDetails = await cacheController.set({
    key: 'user:123',
    data: { id: 123, name: 'John Doe', email: 'john@example.com' },
    args: ['123'] // オプション：引数の記録
  })
  
  console.log('キャッシュ保存:', cacheDetails.createdAt)
  console.log('有効期限:', cacheDetails.expiredAt)
  
  // キャッシュからデータを取得
  const retrieved = await cacheController.get('user:123')
  
  if (retrieved) {
    console.log('キャッシュデータ:', retrieved.data)
    console.log('残り時間:', retrieved.remainingTimes.humanReadable)
    console.log('経過時間:', retrieved.elapsedTimes.humanReadable)
    console.log('期限切れ?:', retrieved.expired)
  } else {
    console.log('キャッシュが見つからないか期限切れです')
  }
  
  // キャッシュを削除
  await cacheController.delete('user:123')
}
```

### カスタムTTLとDuration使用

```typescript
import { CacheController, MemoryCacheStorage } from '@fastkit/cache-control'
import { Duration } from '@fastkit/duration'

const storage = new MemoryCacheStorage()
const cacheController = new CacheController({
  storage,
  ttl: Duration.hours(1) // デフォルト1時間
})

async function customTtlExample() {
  // 短期間キャッシュ（30秒）
  await cacheController.set({
    key: 'temp:data',
    data: { temporary: true },
    ttl: 30
  })
  
  // 長期間キャッシュ（1日）
  await cacheController.set({
    key: 'daily:summary',
    data: { summary: 'Daily report data' },
    ttl: Duration.days(1)
  })
  
  // 永続キャッシュ（期限なし）
  await cacheController.set({
    key: 'config:app',
    data: { version: '1.0.0', settings: {} },
    ttl: -1 // または Infinity
  })
  
  // 時間経過のシミュレーション
  setTimeout(async () => {
    const tempData = await cacheController.get('temp:data')
    const dailyData = await cacheController.get('daily:summary')
    const configData = await cacheController.get('config:app')
    
    console.log('30秒後:')
    console.log('  Temp data:', tempData ? '存在' : '期限切れ')
    console.log('  Daily data:', dailyData ? '存在' : '期限切れ')
    console.log('  Config data:', configData ? '存在' : '期限切れ')
  }, 31000)
}
```

## 高度な使用例

### ファイルシステムキャッシュ

```typescript
import { CacheController, FileCacheStorage } from '@fastkit/cache-control'
import path from 'path'

// ファイルベースストレージの作成
const fileStorage = new FileCacheStorage({
  dir: path.join(process.cwd(), '.cache'), // キャッシュディレクトリ
  maxTimeout: 24 * 60 * 60 * 1000 // 最大24時間のタイムアウト
})

const fileCacheController = new CacheController({
  storage: fileStorage,
  ttl: Duration.hours(6) // 6時間のデフォルトTTL
})

async function fileCacheExample() {
  // 大きなデータセットをファイルキャッシュに保存
  const largeDataset = {
    users: Array.from({ length: 1000 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`
    })),
    metadata: {
      generated: new Date().toISOString(),
      count: 1000
    }
  }
  
  console.log('大きなデータセットをファイルキャッシュに保存中...')
  await fileCacheController.set({
    key: 'dataset:users',
    data: largeDataset,
    ttl: Duration.hours(12) // 12時間キャッシュ
  })
  
  console.log('ファイルキャッシュから取得中...')
  const cached = await fileCacheController.get('dataset:users')
  
  if (cached) {
    console.log(`${cached.data.users.length}人のユーザーデータを取得`)
    console.log(`作成日時: ${cached.createdAt}`)
    console.log(`残り時間: ${cached.remainingTimes.humanReadable}`)
  }
}
```

### APIキャッシュシステム

```typescript
import { CacheController, MemoryCacheStorage } from '@fastkit/cache-control'
import { Duration } from '@fastkit/duration'

// 複数層キャッシュシステム
class ApiCacheSystem {
  private shortTermCache: CacheController
  private longTermCache: CacheController
  
  constructor() {
    // 短期間キャッシュ（高速アクセス用）
    this.shortTermCache = new CacheController({
      storage: new MemoryCacheStorage({ maxKeys: 500 }),
      ttl: Duration.minutes(5)
    })
    
    // 長期間キャッシュ（ファイルベース）
    this.longTermCache = new CacheController({
      storage: new FileCacheStorage({ 
        dir: '.cache/api',
        maxTimeout: Duration.days(7).milliseconds
      }),
      ttl: Duration.hours(1)
    })
  }
  
  async cacheApiResponse<T>(
    endpoint: string, 
    data: T, 
    options: { ttl?: number | Duration; persistent?: boolean } = {}
  ) {
    const { ttl, persistent = false } = options
    const key = `api:${endpoint}`
    
    if (persistent) {
      // 永続化が必要な場合は長期間キャッシュを使用
      return this.longTermCache.set({
        key,
        data,
        ttl: ttl || Duration.hours(1)
      })
    } else {
      // 通常は短期間キャッシュを使用
      return this.shortTermCache.set({
        key,
        data,
        ttl: ttl || Duration.minutes(5)
      })
    }
  }
  
  async getApiResponse<T>(endpoint: string): Promise<T | null> {
    const key = `api:${endpoint}`
    
    // 短期間キャッシュを最初にチェック
    let cached = await this.shortTermCache.get(key)
    if (cached) {
      console.log('短期間キャッシュからヒット')
      return cached.data
    }
    
    // 長期間キャッシュをチェック
    cached = await this.longTermCache.get(key)
    if (cached) {
      console.log('長期間キャッシュからヒット')
      
      // 短期間キャッシュにも復元
      await this.shortTermCache.set({
        key,
        data: cached.data,
        ttl: Duration.minutes(5)
      })
      
      return cached.data
    }
    
    return null
  }
  
  async invalidateApiCache(endpoint: string) {
    const key = `api:${endpoint}`
    await Promise.all([
      this.shortTermCache.delete(key),
      this.longTermCache.delete(key)
    ])
  }
}

// 使用例
async function apiCacheExample() {
  const apiCache = new ApiCacheSystem()
  
  // APIレスポンスのシミュレーション
  async function fetchUserData(userId: string) {
    const endpoint = `users/${userId}`
    
    // キャッシュをチェック
    let userData = await apiCache.getApiResponse<any>(endpoint)
    if (userData) {
      console.log('キャッシュからユーザーデータを取得')
      return userData
    }
    
    // APIを呼び出し
    console.log('APIからユーザーデータを取得中...')
    const response = await fetch(`https://api.example.com/users/${userId}`)
    userData = await response.json()
    
    // レスポンスをキャッシュ
    await apiCache.cacheApiResponse(endpoint, userData, {
      ttl: Duration.minutes(10),
      persistent: true
    })
    
    return userData
  }
  
  // 使用例
  const user1 = await fetchUserData('123')
  const user2 = await fetchUserData('123') // キャッシュからヒット
  
  console.log('ユーザーデータ:', user1.name)
}
```

### 期限切れキャッシュの処理

```typescript
import { CacheController, MemoryCacheStorage } from '@fastkit/cache-control'

const storage = new MemoryCacheStorage()
const cacheController = new CacheController({
  storage,
  ttl: 10 // 10秒のTTL
})

async function expiredCacheExample() {
  // データを保存
  await cacheController.set({
    key: 'test:expiration',
    data: { message: 'This will expire soon' },
    ttl: 5 // 5秒で期限切れ
  })
  
  // 即座に取得（まだ有効）
  let cached = await cacheController.get('test:expiration')
  console.log('即座に取得:', cached?.data)
  console.log('残り時間:', cached?.remainingTimes.seconds, '秒')
  
  // 3秒後に取得（まだ有効）
  setTimeout(async () => {
    const cached = await cacheController.get('test:expiration')
    if (cached) {
      console.log('3秒後:', cached.data)
      console.log('残り時間:', cached.remainingTimes.seconds, '秒')
    }
  }, 3000)
  
  // 6秒後に取得（期限切れ）
  setTimeout(async () => {
    const cached = await cacheController.get('test:expiration')
    console.log('6秒後:', cached ? 'まだ有効' : '期限切れで削除済み')
  }, 6000)
  
  // 期限切れでも取得したい場合
  setTimeout(async () => {
    const cached = await cacheController.get({
      key: 'test:expiration',
      allowExpired: true
    })
    
    if (cached) {
      console.log('期限切れデータ:', cached.data)
      console.log('期限切れ?:', cached.expired)
    }
  }, 6000)
}
```

### 高度なキャッシュパターン

```typescript
import { CacheController, MemoryCacheStorage } from '@fastkit/cache-control'
import { Duration } from '@fastkit/duration'

// 階層キャッシュクラス
class HierarchicalCache {
  private l1Cache: CacheController // L1: 高速・小容量
  private l2Cache: CacheController // L2: 中速・中容量
  private l3Cache: CacheController // L3: 低速・大容量
  
  constructor() {
    this.l1Cache = new CacheController({
      storage: new MemoryCacheStorage({ maxKeys: 100 }),
      ttl: Duration.minutes(2)
    })
    
    this.l2Cache = new CacheController({
      storage: new MemoryCacheStorage({ maxKeys: 1000 }),
      ttl: Duration.minutes(10)
    })
    
    this.l3Cache = new CacheController({
      storage: new FileCacheStorage({ dir: '.cache/l3' }),
      ttl: Duration.hours(1)
    })
  }
  
  async get<T>(key: string): Promise<T | null> {
    // L1キャッシュをチェック
    let result = await this.l1Cache.get(key)
    if (result) {
      console.log('L1キャッシュヒット')
      return result.data
    }
    
    // L2キャッシュをチェック
    result = await this.l2Cache.get(key)
    if (result) {
      console.log('L2キャッシュヒット')
      // L1にプロモート
      await this.l1Cache.set({
        key,
        data: result.data,
        ttl: Duration.minutes(2)
      })
      return result.data
    }
    
    // L3キャッシュをチェック
    result = await this.l3Cache.get(key)
    if (result) {
      console.log('L3キャッシュヒット')
      // L2とL1にプロモート
      await Promise.all([
        this.l2Cache.set({
          key,
          data: result.data,
          ttl: Duration.minutes(10)
        }),
        this.l1Cache.set({
          key,
          data: result.data,
          ttl: Duration.minutes(2)
        })
      ])
      return result.data
    }
    
    console.log('キャッシュミス')
    return null
  }
  
  async set<T>(key: string, data: T, priority: 'low' | 'medium' | 'high' = 'medium') {
    switch (priority) {
      case 'high':
        // 全レベルに保存
        await Promise.all([
          this.l1Cache.set({ key, data, ttl: Duration.minutes(2) }),
          this.l2Cache.set({ key, data, ttl: Duration.minutes(10) }),
          this.l3Cache.set({ key, data, ttl: Duration.hours(1) })
        ])
        break
      case 'medium':
        // L2とL3に保存
        await Promise.all([
          this.l2Cache.set({ key, data, ttl: Duration.minutes(10) }),
          this.l3Cache.set({ key, data, ttl: Duration.hours(1) })
        ])
        break
      case 'low':
        // L3のみに保存
        await this.l3Cache.set({ key, data, ttl: Duration.hours(1) })
        break
    }
  }
  
  async invalidate(key: string) {
    await Promise.all([
      this.l1Cache.delete(key),
      this.l2Cache.delete(key),
      this.l3Cache.delete(key)
    ])
  }
}

// 使用例
async function hierarchicalCacheExample() {
  const cache = new HierarchicalCache()
  
  // 高優先度データの保存
  await cache.set('critical:config', { 
    version: '1.0.0',
    features: ['auth', 'api', 'cache'] 
  }, 'high')
  
  // 中優先度データの保存
  await cache.set('user:profile:123', {
    id: 123,
    name: 'John Doe',
    preferences: {}
  }, 'medium')
  
  // 低優先度データの保存
  await cache.set('analytics:daily', {
    date: '2024-01-01',
    pageViews: 1000
  }, 'low')
  
  // データの取得（階層を自動的に検索）
  const config = await cache.get('critical:config')
  const profile = await cache.get('user:profile:123')
  const analytics = await cache.get('analytics:daily')
  
  console.log('設定:', config)
  console.log('プロフィール:', profile)
  console.log('分析:', analytics)
}
```

## API仕様

### `CacheController`クラス

```typescript
class CacheController<T = any> {
  constructor(behavior: CacheControllerBehavior<T>)
  
  // キャッシュ取得
  get(req: RawGetCacheRequest): Promise<CacheDetailsWithRemainingTimes<T> | null>
  
  // キャッシュ保存
  set(settings: CreateCacheDetailsSettings<T>): Promise<CacheDetails<T>>
  
  // キャッシュ削除
  delete(req: RawDeleteCacheRequest): Promise<void>
}
```

### ストレージクラス

#### `MemoryCacheStorage`

```typescript
class MemoryCacheStorage implements CacheStorage {
  constructor(options?: MemoryCacheStorageOptions)
  
  // プロパティ
  maxKeys: number        // 最大キー数
  maxTimeout: number     // 最大タイムアウト時間
  size: number          // 現在のキー数
  
  // メソッド
  get(req: GetCacheRequest): CacheDetails | null
  set(details: CacheDetails): void
  delete(req: DeleteCacheRequest): void
  clear(): void
  keys(): IterableIterator<string>
}
```

#### `FileCacheStorage`

```typescript
class FileCacheStorage implements CacheStorage {
  constructor(options: FileCacheStorageOptions)
  
  // プロパティ
  dir: string           // キャッシュディレクトリ
  maxTimeout: number    // 最大タイムアウト時間
  
  // メソッド
  get(req: GetCacheRequest): Promise<CacheDetails | null>
  set(details: CacheDetails): Promise<void>
  delete(req: DeleteCacheRequest): Promise<void>
  clear(): Promise<void>
  createFilePath(key: string): string
}
```

### 型定義

```typescript
interface CacheDetails<T = any> {
  key: string                    // キャッシュキー
  args?: any[]                  // 引数リスト
  data: T                       // キャッシュデータ
  createdAt: string             // 作成日時（ISO文字列）
  expiredAt: string | null      // 有効期限（ISO文字列またはnull）
}

interface CacheRemainingTimes {
  elapsedTimes: Duration        // 経過時間
  remainingTimes: Duration      // 残り時間
  expired: boolean              // 期限切れフラグ
}

interface CacheDetailsWithRemainingTimes<T = any> 
  extends CacheDetails<T>, CacheRemainingTimes {}
```

### オプション設定

```typescript
interface MemoryCacheStorageOptions {
  maxKeys?: number              // 最大キー数（デフォルト: 32767）
  maxTimeout?: number           // 最大タイムアウト（デフォルト: 2147483647ms）
}

interface FileCacheStorageOptions {
  dir: string                   // キャッシュディレクトリ
  maxTimeout?: number           // 最大タイムアウト（デフォルト: 2147483647ms）
}

interface CacheControllerBehavior<T = any> {
  storage: CacheStorage<T>      // ストレージインスタンス
  ttl: number | Duration        // デフォルトTTL
}
```

## 注意事項

### パフォーマンス考慮事項
- メモリキャッシュは高速だがメモリ使用量に注意
- ファイルキャッシュは永続化されるがI/Oコストがかかる
- maxKeysを適切に設定してメモリリークを防ぐ
- 大容量データのキャッシュ時は圧縮を検討

### TTL管理
- TTLは作成時に固定され、後から変更不可
- 自動削除はタイマーベースなので完全ではない
- 期限切れチェックは取得時に実行される
- システム時刻変更の影響を受ける可能性

### ファイルシステム使用時
- ディスク容量の管理が必要
- ファイル権限の設定に注意
- 並行アクセス時の競合状態に注意
- クリーンアップ処理の実装を推奨

### エラーハンドリング
- ストレージ操作の例外処理を実装
- ディスク容量不足やアクセス権限エラーの対応
- ネットワークストレージ使用時の接続エラー対応

## ライセンス

MIT

## 関連パッケージ

- [@fastkit/duration](../duration/README.md): 時間期間管理
- [@fastkit/cloner](../cloner/README.md): オブジェクトクローン機能
- [@fastkit/helpers](../helpers/README.md): 基本的なユーティリティ関数