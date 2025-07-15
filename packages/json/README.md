# @fastkit/json

JSON操作のためのセーフなユーティリティライブラリ。循環参照を含むオブジェクトでも安全にシリアライゼーションを行い、`JSON.stringify`で発生するエラーを回避しながら、カスタマイズ可能なシリアライゼーション機能を提供します。

## 機能

- **循環参照対応**: 循環参照を含むオブジェクトの安全なシリアライゼーション
- **カスタムリプレーサー**: 値の変換・フィルタリング機能
- **型安全性**: TypeScriptによるJSON型定義と型安全な操作
- **柔軟な設定**: インデント・循環参照処理のカスタマイズ
- **軽量**: 依存関係なしの軽量ライブラリ
- **エラー回避**: `JSON.stringify`の典型的なエラーを予防

## インストール

```bash
npm install @fastkit/json
```

## 基本的な使用方法

### 循環参照の安全な処理

```typescript
import { safeJSONStringify } from '@fastkit/json'

// 循環参照を含むオブジェクト
const user = {
  id: 1,
  name: 'Alice',
  friends: [] as any[]
}

const friend = {
  id: 2,
  name: 'Bob',
  friends: [user] // 循環参照
}

user.friends.push(friend)

// 通常のJSON.stringifyではエラーが発生
try {
  JSON.stringify(user)
} catch (error) {
  console.error('エラー:', error.message) // Converting circular structure to JSON
}

// safeJSONStringifyを使用すると安全に処理
const safeJson = safeJSONStringify(user, null, 2)
console.log(safeJson)
/*
{
  "id": 1,
  "name": "Alice",
  "friends": [
    {
      "id": 2,
      "name": "Bob",
      "friends": [
        "[Circular ~]"
      ]
    }
  ]
}
*/
```

### カスタムリプレーサーの使用

```typescript
import { safeJSONStringify } from '@fastkit/json'

const data = {
  id: 123,
  name: 'John Doe',
  email: 'john@example.com',
  password: 'secret123',
  createdAt: new Date(),
  metadata: {
    lastLogin: new Date(),
    loginCount: 42
  }
}

// パスワードを除外し、日付をISO文字列に変換
const jsonString = safeJSONStringify(data, function(key, value) {
  // パスワードフィールドを除外
  if (key === 'password') {
    return undefined
  }
  
  // 日付をISO文字列に変換
  if (value instanceof Date) {
    return value.toISOString()
  }
  
  return value
}, 2)

console.log(jsonString)
/*
{
  "id": 123,
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2024-01-01T10:00:00.000Z",
  "metadata": {
    "lastLogin": "2024-01-01T09:30:00.000Z",
    "loginCount": 42
  }
}
*/
```

## 高度な使用例

### API レスポンスの安全なログ出力

```typescript
import { safeJSONStringify } from '@fastkit/json'

class APILogger {
  private sensitiveFields = new Set([
    'password', 'token', 'secret', 'apiKey', 'privateKey',
    'accessToken', 'refreshToken', 'sessionId', 'ssn', 'creditCard'
  ])
  
  logRequest(url: string, method: string, data?: any, headers?: any): void {
    const logData = {
      timestamp: new Date().toISOString(),
      type: 'REQUEST',
      method,
      url,
      headers: this.sanitizeHeaders(headers),
      body: data
    }
    
    const logString = safeJSONStringify(logData, (key, value) => {
      return this.sanitizeValue(key, value)
    }, 2)
    
    console.log('API Request:', logString)
  }
  
  logResponse(url: string, status: number, data?: any, headers?: any): void {
    const logData = {
      timestamp: new Date().toISOString(),
      type: 'RESPONSE',
      url,
      status,
      headers: this.sanitizeHeaders(headers),
      body: data
    }
    
    const logString = safeJSONStringify(logData, (key, value) => {
      return this.sanitizeValue(key, value)
    }, 2)
    
    console.log('API Response:', logString)
  }
  
  private sanitizeValue(key: string, value: any): any {
    // 機密フィールドをマスク
    if (typeof key === 'string' && this.isSensitiveField(key)) {
      return '[REDACTED]'
    }
    
    // 大きな文字列を切り詰め
    if (typeof value === 'string' && value.length > 1000) {
      return value.substring(0, 1000) + '...[TRUNCATED]'
    }
    
    // 大きな配列を切り詰め
    if (Array.isArray(value) && value.length > 50) {
      return [
        ...value.slice(0, 50),
        `...[${value.length - 50} more items]`
      ]
    }
    
    // 日付オブジェクトをISO文字列に変換
    if (value instanceof Date) {
      return value.toISOString()
    }
    
    // エラーオブジェクトをシリアライズ可能な形式に変換
    if (value instanceof Error) {
      return {
        name: value.name,
        message: value.message,
        stack: value.stack
      }
    }
    
    return value
  }
  
  private isSensitiveField(key: string): boolean {
    const lowerKey = key.toLowerCase()
    return Array.from(this.sensitiveFields).some(field => 
      lowerKey.includes(field.toLowerCase())
    )
  }
  
  private sanitizeHeaders(headers?: any): any {
    if (!headers) return undefined
    
    const sanitized: any = {}
    for (const [key, value] of Object.entries(headers)) {
      if (this.isSensitiveField(key)) {
        sanitized[key] = '[REDACTED]'
      } else {
        sanitized[key] = value
      }
    }
    return sanitized
  }
}

// 使用例
async function apiExample() {
  const logger = new APILogger()
  
  // リクエストログ
  logger.logRequest('/api/users', 'POST', {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'secret123' // これはマスクされる
  }, {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token123' // これはマスクされる
  })
  
  // レスポンスログ
  logger.logResponse('/api/users', 201, {
    id: 123,
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: new Date()
  })
}
```

### 設定ファイルの安全な保存

```typescript
import { safeJSONStringify } from '@fastkit/json'
import fs from 'fs/promises'

interface AppConfig {
  database: {
    host: string
    port: number
    username: string
    password: string
    ssl: boolean
  }
  cache: {
    redis: {
      host: string
      port: number
      password?: string
    }
  }
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error'
    file: string
  }
  features: {
    [key: string]: boolean
  }
}

class ConfigManager {
  private configPath: string
  
  constructor(configPath: string) {
    this.configPath = configPath
  }
  
  async saveConfig(config: AppConfig, includePasswords = false): Promise<void> {
    const replacer = includePasswords 
      ? null 
      : function(key: string, value: any) {
          // パスワード関連のフィールドを除外
          if (key.toLowerCase().includes('password')) {
            return '[PROTECTED]'
          }
          return value
        }
    
    const configJson = safeJSONStringify(config, replacer, 2)
    
    await fs.writeFile(this.configPath, configJson, 'utf-8')
  }
  
  async loadConfig(): Promise<AppConfig> {
    const configJson = await fs.readFile(this.configPath, 'utf-8')
    return JSON.parse(configJson)
  }
  
  async createBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupPath = `${this.configPath}.backup.${timestamp}`
    
    const config = await this.loadConfig()
    
    // バックアップには機密情報を含めない
    const backupJson = safeJSONStringify(config, function(key, value) {
      if (key.toLowerCase().includes('password')) {
        return '[REDACTED]'
      }
      if (value instanceof Date) {
        return value.toISOString()
      }
      return value
    }, 2)
    
    await fs.writeFile(backupPath, backupJson, 'utf-8')
    
    return backupPath
  }
  
  exportConfig(excludeSecrets = true): string {
    // 実行中の設定をエクスポート
    const runtimeConfig = this.getCurrentConfig()
    
    const replacer = excludeSecrets 
      ? function(key: string, value: any) {
          if (key.toLowerCase().includes('password') || 
              key.toLowerCase().includes('secret') ||
              key.toLowerCase().includes('token')) {
            return '[EXCLUDED]'
          }
          return value
        }
      : null
    
    return safeJSONStringify(runtimeConfig, replacer, 2)
  }
  
  private getCurrentConfig(): AppConfig {
    // 実際のアプリケーションでは実行中の設定を取得
    return {
      database: {
        host: 'localhost',
        port: 5432,
        username: 'app_user',
        password: 'secret_password',
        ssl: true
      },
      cache: {
        redis: {
          host: 'localhost',
          port: 6379,
          password: 'redis_password'
        }
      },
      logging: {
        level: 'info',
        file: '/var/log/app.log'
      },
      features: {
        authentication: true,
        logging: true,
        caching: true
      }
    }
  }
}

// 使用例
async function configExample() {
  const configManager = new ConfigManager('./app-config.json')
  
  const config: AppConfig = {
    database: {
      host: 'localhost',
      port: 5432,
      username: 'myapp',
      password: 'supersecret',
      ssl: true
    },
    cache: {
      redis: {
        host: 'redis.example.com',
        port: 6379,
        password: 'redis_secret'
      }
    },
    logging: {
      level: 'info',
      file: '/var/log/myapp.log'
    },
    features: {
      newFeature: true,
      betaFeature: false
    }
  }
  
  // パスワードを除外して保存
  await configManager.saveConfig(config, false)
  
  // バックアップ作成
  const backupPath = await configManager.createBackup()
  console.log('バックアップ作成:', backupPath)
  
  // 設定のエクスポート
  const exportedConfig = configManager.exportConfig(true)
  console.log('エクスポートされた設定:', exportedConfig)
}
```

### デバッグ用のオブジェクトダンプ

```typescript
import { safeJSONStringify } from '@fastkit/json'

class DebugDumper {
  private static readonly MAX_DEPTH = 10
  private static readonly MAX_ARRAY_LENGTH = 100
  private static readonly MAX_STRING_LENGTH = 500
  
  static dump(obj: any, options: {
    maxDepth?: number
    includeTypes?: boolean
    includeFunctions?: boolean
    customReplacer?: (key: string, value: any) => any
  } = {}): string {
    const {
      maxDepth = this.MAX_DEPTH,
      includeTypes = true,
      includeFunctions = false,
      customReplacer
    } = options
    
    let currentDepth = 0
    
    const replacer = function(key: string, value: any): any {
      // カスタムリプレーサーを最初に適用
      if (customReplacer) {
        const customResult = customReplacer(key, value)
        if (customResult !== value) {
          return customResult
        }
      }
      
      // 深度制限
      if (key && currentDepth > maxDepth) {
        return '[Max Depth Exceeded]'
      }
      
      if (key) currentDepth++
      
      // 関数の処理
      if (typeof value === 'function') {
        if (includeFunctions) {
          return `[Function: ${value.name || 'anonymous'}]`
        }
        return undefined
      }
      
      // Symbol の処理
      if (typeof value === 'symbol') {
        return value.toString()
      }
      
      // undefined の処理
      if (value === undefined) {
        return '[undefined]'
      }
      
      // 大きな文字列の切り詰め
      if (typeof value === 'string' && value.length > this.MAX_STRING_LENGTH) {
        return value.substring(0, this.MAX_STRING_LENGTH) + '...[TRUNCATED]'
      }
      
      // 大きな配列の切り詰め
      if (Array.isArray(value) && value.length > this.MAX_ARRAY_LENGTH) {
        const truncated = value.slice(0, this.MAX_ARRAY_LENGTH)
        truncated.push(`...[${value.length - this.MAX_ARRAY_LENGTH} more items]`)
        return truncated
      }
      
      // 型情報の追加
      if (includeTypes && value !== null && typeof value === 'object') {
        if (value.constructor && value.constructor.name !== 'Object') {
          return {
            __type: value.constructor.name,
            __value: value
          }
        }
      }
      
      // Date オブジェクトの処理
      if (value instanceof Date) {
        return includeTypes 
          ? { __type: 'Date', __value: value.toISOString() }
          : value.toISOString()
      }
      
      // RegExp オブジェクトの処理
      if (value instanceof RegExp) {
        return includeTypes 
          ? { __type: 'RegExp', __value: value.toString() }
          : value.toString()
      }
      
      // Error オブジェクトの処理
      if (value instanceof Error) {
        return {
          __type: 'Error',
          name: value.name,
          message: value.message,
          stack: value.stack
        }
      }
      
      return value
    }
    
    return safeJSONStringify(obj, replacer, 2)
  }
  
  static dumpToConsole(obj: any, label?: string, options?: Parameters<typeof DebugDumper.dump>[1]): void {
    const dump = this.dump(obj, options)
    
    if (label) {
      console.group(`🔍 Debug Dump: ${label}`)
      console.log(dump)
      console.groupEnd()
    } else {
      console.log('🔍 Debug Dump:', dump)
    }
  }
  
  static compare(obj1: any, obj2: any, label1 = 'Object 1', label2 = 'Object 2'): void {
    console.group('🔍 Object Comparison')
    
    console.group(label1)
    console.log(this.dump(obj1))
    console.groupEnd()
    
    console.group(label2)
    console.log(this.dump(obj2))
    console.groupEnd()
    
    // 簡単な等価性チェック
    const json1 = this.dump(obj1, { includeTypes: false })
    const json2 = this.dump(obj2, { includeTypes: false })
    
    console.log('Equal:', json1 === json2)
    
    console.groupEnd()
  }
}

// 使用例
function debugExample() {
  // 複雑なオブジェクト
  const complexObject = {
    id: 123,
    name: 'Test Object',
    createdAt: new Date(),
    pattern: /^test-\d+$/,
    data: new Array(200).fill(0).map((_, i) => ({ id: i, value: `item-${i}` })),
    metadata: {
      version: '1.0.0',
      author: 'Developer'
    },
    calculateValue: function(x: number) { return x * 2 },
    undefinedValue: undefined,
    symbolValue: Symbol('test'),
    errorValue: new Error('Test error')
  }
  
  // 循環参照を追加
  complexObject.metadata['self'] = complexObject
  
  // 基本的なダンプ
  DebugDumper.dumpToConsole(complexObject, 'Complex Object')
  
  // オプション付きダンプ
  DebugDumper.dumpToConsole(complexObject, 'With Functions', {
    includeFunctions: true,
    maxDepth: 3,
    customReplacer: (key, value) => {
      if (key === 'data' && Array.isArray(value)) {
        return `[Array with ${value.length} items]`
      }
      return value
    }
  })
  
  // オブジェクト比較
  const modifiedObject = { ...complexObject, name: 'Modified Object' }
  DebugDumper.compare(complexObject, modifiedObject, 'Original', 'Modified')
}
```

## API仕様

### 型定義

```typescript
// プリミティブな JSON 値
type JSONPrimitiveValue = string | number | boolean | null | undefined

// JSON データ型
type JSONData = JSONPrimitiveValue | JSONPrimitiveValue[] | JSONMapValue

// JSON オブジェクト型
type JSONMapValue = { [key: string]: JSONData }

// リプレーサー関数型
type Replacer = (this: any, key: string, value: any) => any

// シリアライザー関数型
type Serializer = (this: any, key: string, value: any) => any
```

### 主要関数

#### `safeJSONStringify`

```typescript
function safeJSONStringify<T>(
  obj: T,
  replacer?: Replacer,
  spaces?: string | number,
  cycleReplacer?: Replacer
): string
```

安全なJSON文字列化を行います。

**パラメーター:**
- `obj`: シリアライズするオブジェクト
- `replacer`: 値の変換・フィルタリング関数（オプション）
- `spaces`: インデント文字列または数値（オプション）
- `cycleReplacer`: 循環参照検出時の処理関数（オプション）

**戻り値:** JSON文字列

#### `safeJSONSerializer`

```typescript
function safeJSONSerializer(
  replacer?: Replacer,
  cycleReplacer?: Replacer
): Serializer
```

循環参照に対応したシリアライザー関数を生成します。

**パラメーター:**
- `replacer`: 値の変換・フィルタリング関数（オプション）
- `cycleReplacer`: 循環参照検出時の処理関数（オプション）

**戻り値:** シリアライザー関数

### 循環参照の処理

デフォルトの循環参照処理では以下の形式で置き換えられます：

```typescript
// ルートオブジェクトへの循環参照
"[Circular ~]"

// 特定のパスへの循環参照
"[Circular ~.path.to.object]"
```

## 注意事項

### パフォーマンス考慮事項
- 大きなオブジェクトや深いネストのオブジェクトでは処理時間が増加
- 循環参照の検出にはスタック管理のオーバーヘッドがある
- カスタムリプレーサーの複雑さが性能に影響

### メモリ使用量
- 循環参照検出のためのスタック管理でメモリを使用
- 大量のオブジェクトを同時処理する際はメモリ使用量に注意

### セキュリティ考慮事項
- 機密情報を含むオブジェクトのシリアライズ時は適切なリプレーサーを使用
- ログ出力時は機密フィールドのマスキングを実装
- エラーオブジェクトのスタック情報が意図せず出力される可能性に注意

### 使用場面
- APIリクエスト・レスポンスのログ出力
- 設定ファイルの安全な保存
- デバッグ用のオブジェクト出力
- 循環参照を含むデータ構造の処理

## ライセンス

MIT