# @fastkit/tiny-logger

アプリケーションログをほんの少し綺麗に表示するための小さなロガーライブラリ。色付きログ出力、名前空間による分類、カスタムエラークラス生成機能を提供します。

## 機能

- **色付きログ出力**: ログレベルに応じた自動色分け（debug, info, warn, error, success）
- **名前空間管理**: ロガー名による出力の分類と識別
- **複数ログレベル**: debug、info、warn、error、successの5段階
- **色制御**: 色出力の有効/無効切り替え
- **軽量設計**: 最小限の依存関係でシンプルな実装
- **TypeScript完全サポート**: 厳密な型定義による型安全性
- **カスタムエラークラス**: 名前空間付きエラークラスの自動生成

## インストール

```bash
npm install @fastkit/tiny-logger
```

## 基本的な使用方法

### TinyLogger の作成と使用

```typescript
import { TinyLogger } from '@fastkit/tiny-logger'

// ロガーインスタンスの作成
const logger = new TinyLogger('MyApp')

// 各種ログレベルでの出力
logger.debug('デバッグ情報です')        // 紫色で表示
logger.info('通常の情報です')          // シアン色で表示
logger.warn('警告メッセージです')       // 黄色で表示
logger.error('エラーが発生しました')    // 赤色で表示
logger.success('処理が成功しました')    // 緑色で表示
```

### 引数付きログ出力

```typescript
const logger = new TinyLogger('API')

// 追加引数を渡すことができます
logger.info('ユーザー情報を取得しました', { userId: 123, name: 'John' })
logger.error('リクエストに失敗しました', new Error('Network timeout'))
logger.debug('デバッグ情報', { timestamp: Date.now(), level: 'verbose' })
```

### 複数のロガーインスタンス

```typescript
import { TinyLogger } from '@fastkit/tiny-logger'

// 機能別にロガーを分離
const dbLogger = new TinyLogger('Database')
const authLogger = new TinyLogger('Auth')
const apiLogger = new TinyLogger('API')

dbLogger.info('データベース接続が確立されました')
// 出力: [Database] データベース接続が確立されました

authLogger.warn('認証トークンの有効期限が近づいています')
// 出力: [Auth] 認証トークンの有効期限が近づいています

apiLogger.error('APIリクエストでエラーが発生しました')
// 出力: [API] APIリクエストでエラーが発生しました
```

## ログレベルと色分け

各ログレベルには専用の色が割り当てられています：

| ログレベル | 色 | 用途 |
|-----------|----|----|
| `debug` | 紫 (magenta) | デバッグ情報、開発時の詳細ログ |
| `info` | シアン (cyan) | 一般的な情報、正常な処理結果 |
| `warn` | 黄 (yellow) | 警告、注意が必要な状況 |
| `error` | 赤 (red) | エラー、異常な状況 |
| `success` | 緑 (green) | 成功、完了した処理 |

### 色出力の制御

```typescript
import { TinyLogger } from '@fastkit/tiny-logger'

// 色出力を無効にする
TinyLogger.colorEnable(false)

const logger = new TinyLogger('App')
logger.info('この出力は色が付きません')

// 色出力を有効にする
TinyLogger.colorEnable(true)
logger.info('この出力は色が付きます')
```

## カスタムエラークラス

`createTinyError` 関数を使用して、名前空間付きのカスタムエラークラスを作成できます：

```typescript
import { createTinyError } from '@fastkit/tiny-logger'

// カスタムエラークラスを作成
const ValidationError = createTinyError('Validation')
const DatabaseError = createTinyError('Database')
const AuthError = createTinyError('Authentication')

// エラーの使用
try {
  throw new ValidationError('ユーザー名は必須です')
} catch (error) {
  console.log(error.message)
  // 出力: [Validation] ユーザー名は必須です
}

// エラーチェーンも対応
try {
  throw new Error('データベース接続に失敗しました')
} catch (originalError) {
  throw new DatabaseError(originalError)
  // 出力: [Database] データベース接続に失敗しました
}
```

## 実用的な使用例

### アプリケーション全体でのロガー管理

```typescript
import { TinyLogger } from '@fastkit/tiny-logger'

// 各モジュール用のロガーを作成
export const loggers = {
  app: new TinyLogger('App'),
  user: new TinyLogger('User'),
  product: new TinyLogger('Product'),
  payment: new TinyLogger('Payment'),
  notification: new TinyLogger('Notification')
} as const

// 使用例
loggers.user.info('ユーザーがログインしました', { userId: '12345' })
loggers.product.warn('在庫が少なくなっています', { productId: 'P001', stock: 3 })
loggers.payment.error('決済処理でエラーが発生', { orderId: 'O12345', error: 'カードエラー' })
```

### 開発環境でのデバッグログ

```typescript
import { TinyLogger } from '@fastkit/tiny-logger'

const debugLogger = new TinyLogger('Debug')

class ApiService {
  private logger = new TinyLogger('ApiService')

  async fetchUser(userId: string) {
    this.logger.debug('ユーザー取得開始', { userId })
    
    try {
      const response = await fetch(`/api/users/${userId}`)
      const user = await response.json()
      
      this.logger.success('ユーザー取得成功', { userId, user })
      return user
    } catch (error) {
      this.logger.error('ユーザー取得エラー', { userId, error })
      throw error
    }
  }
}
```

### エラーハンドリングと組み合わせ

```typescript
import { TinyLogger, createTinyError } from '@fastkit/tiny-logger'

const logger = new TinyLogger('FileProcessor')
const FileProcessError = createTinyError('FileProcessor')

class FileProcessor {
  async processFile(filePath: string) {
    logger.info('ファイル処理開始', { filePath })
    
    try {
      // ファイル存在チェック
      if (!this.fileExists(filePath)) {
        throw new FileProcessError('ファイルが見つかりません')
      }
      
      // ファイル処理
      const result = await this.doProcess(filePath)
      logger.success('ファイル処理完了', { filePath, result })
      
      return result
    } catch (error) {
      logger.error('ファイル処理エラー', { filePath, error })
      
      if (error instanceof FileProcessError) {
        throw error
      }
      
      throw new FileProcessError(error as Error)
    }
  }
  
  private fileExists(filePath: string): boolean {
    // ファイル存在チェックの実装
    return true
  }
  
  private async doProcess(filePath: string) {
    // ファイル処理の実装
    return { processed: true }
  }
}
```

### 条件付きログ出力

```typescript
import { TinyLogger } from '@fastkit/tiny-logger'

class ConditionalLogger {
  private logger: TinyLogger
  private verbose: boolean
  
  constructor(name: string, verbose = false) {
    this.logger = new TinyLogger(name)
    this.verbose = verbose
  }
  
  debug(message: string, ...args: any[]) {
    if (this.verbose) {
      this.logger.debug(message, ...args)
    }
  }
  
  info(message: string, ...args: any[]) {
    this.logger.info(message, ...args)
  }
  
  warn(message: string, ...args: any[]) {
    this.logger.warn(message, ...args)
  }
  
  error(message: string, ...args: any[]) {
    this.logger.error(message, ...args)
  }
  
  success(message: string, ...args: any[]) {
    this.logger.success(message, ...args)
  }
}

// 本番環境ではverboseを無効にする
const isDevelopment = process.env.NODE_ENV === 'development'
const appLogger = new ConditionalLogger('App', isDevelopment)
```

### ログ集約システムとの連携

```typescript
import { TinyLogger } from '@fastkit/tiny-logger'

interface LogEntry {
  timestamp: string
  level: string
  logger: string
  message: string
  args: any[]
}

class AggregatedLogger extends TinyLogger {
  private logBuffer: LogEntry[] = []
  
  constructor(name: string) {
    super(name)
  }
  
  log(type: any, message: string, ...args: any[]) {
    // 標準出力に出力
    super.log(type, message, ...args)
    
    // ログバッファに記録
    this.logBuffer.push({
      timestamp: new Date().toISOString(),
      level: type,
      logger: this.name,
      message,
      args
    })
    
    // バッファが満杯になったら外部に送信
    if (this.logBuffer.length >= 100) {
      this.flushLogs()
    }
  }
  
  private async flushLogs() {
    const logs = [...this.logBuffer]
    this.logBuffer = []
    
    try {
      // 外部ログシステムに送信
      await this.sendToLogSystem(logs)
    } catch (error) {
      // 送信失敗時は標準出力にフォールバック
      console.error('ログ送信に失敗しました', error)
    }
  }
  
  private async sendToLogSystem(logs: LogEntry[]) {
    // 外部ログサービスへの送信実装
    // await fetch('/api/logs', { method: 'POST', body: JSON.stringify(logs) })
  }
}
```

## API リファレンス

### TinyLogger クラス

#### コンストラクタ
```typescript
constructor(loggerName: string)
```
- `loggerName`: ロガーの名前（ログ出力時に表示される）

#### 静的メソッド
- `TinyLogger.colorEnable(enable: boolean)`: 色出力の有効/無効を設定

#### インスタンスプロパティ
- `name: string`: ロガーの名前（読み取り専用）

#### ログ出力メソッド
```typescript
debug(message: string, ...args: any[]): void
info(message: string, ...args: any[]): void  
warn(message: string, ...args: any[]): void
error(message: string, ...args: any[]): void
success(message: string, ...args: any[]): void
```

#### 汎用ログメソッド
```typescript
log(type: TinyLoggerLogType, message: string, ...args: any[]): void
```

### createTinyError 関数

```typescript
function createTinyError(name: string): typeof TinyError
```

カスタムエラークラスを生成します。生成されたクラスは：
- `Error` クラスを継承
- 名前空間付きのエラーメッセージを自動生成
- エラーチェーンに対応

### 型定義

#### TinyLoggerLogType
```typescript
type TinyLoggerLogType = 'debug' | 'info' | 'warn' | 'error' | 'success'
```

#### ConsoleColorPaletteName
```typescript
type ConsoleColorPaletteName = 'red' | 'green' | 'yellow' | 'magenta' | 'cyan' | 'reset'
```

## 色とANSIエスケープシーケンス

内部で使用されるANSIエスケープシーケンス：

| 色 | エスケープシーケンス |
|----|--------------------|
| 赤 | `\u001b[31m` |
| 緑 | `\u001b[32m` |
| 黄 | `\u001b[33m` |
| 紫 | `\u001b[35m` |
| シアン | `\u001b[36m` |
| リセット | `\u001b[0m` |

## 関連パッケージ

- `@fastkit/helpers` - ヘルパー関数（内部依存）

## ライセンス

MIT
