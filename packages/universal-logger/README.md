# @fastkit/universal-logger

サーバー/ブラウザの実行環境を問わないプラグイン可能でユニバーサルなログ出力用ライブラリです。

## 特徴

- **ユニバーサル対応**: Node.js、ブラウザ環境で同じAPIを使用可能
- **プラグイン設計**: Transformer、Transport で自由にカスタマイズ
- **TypeScript完全対応**: 厳密な型定義でタイプセーフなログ操作
- **レベル制御**: trace、debug、info、warn、error の5段階レベル対応
- **複数出力**: コンソール、Datadog等への同時出力をサポート
- **名前付きロガー**: 用途別にロガーを分離して管理可能

## インストール

```bash
npm install @fastkit/universal-logger
# or
pnpm add @fastkit/universal-logger
```

## 基本的な使い方

### シンプルなロガー

```typescript
import { loggerBuilder, ConsoleTransport } from '@fastkit/universal-logger';

// ロガーを構築
const { getLogger } = loggerBuilder({
  defaultSettings: {
    level: 'info',
    transports: [ConsoleTransport({ pretty: true })]
  }
});

// ロガーを取得して使用
const logger = getLogger();
logger.info('Hello, world!');
logger.warn('Warning message');
logger.error('Error occurred', new Error('Sample error'));
```

### 名前付きロガー

```typescript
const { getLogger } = loggerBuilder({
  defaultSettings: {
    transports: [ConsoleTransport()]
  },
  namedSettings: {
    api: { level: 'debug' },
    database: { level: 'error' }
  }
});

const apiLogger = getLogger('api');
const dbLogger = getLogger('database');

apiLogger.debug('API request received');
dbLogger.error('Database connection failed');
```

### Datadogとの連携

```typescript
import { datadogLogs } from '@datadog/browser-logs';
import { DDTransport } from '@fastkit/universal-logger';

const { getLogger } = loggerBuilder({
  defaultSettings: {
    transports: [
      ConsoleTransport(),
      DDTransport({
        dd: datadogLogs,
        config: {
          clientToken: 'your-client-token',
          env: 'production'
        }
      })
    ]
  }
});

const logger = getLogger();
logger.info('User action', { userId: 123, action: 'login' });
```

### カスタムTransformer

```typescript
import { Transformer, loggerBuilder } from '@fastkit/universal-logger';

// タイムスタンプを追加するTransformer
const timestampTransformer: Transformer = (payload) => {
  payload.meta.timestamp = new Date().toISOString();
  return payload;
};

const { getLogger } = loggerBuilder({
  defaultSettings: {
    transformers: [timestampTransformer],
    transports: [ConsoleTransport()]
  }
});
```

## API

### Logger クラス

#### `log(level: LogLevel, ...args: any[]): Promise<any[]>`
指定されたログレベルでログを出力

#### `trace(...args: any[]): Promise<any[]>`
traceレベルでログを出力

#### `debug(...args: any[]): Promise<any[]>`
debugレベルでログを出力

#### `info(...args: any[]): Promise<any[]>`
infoレベルでログを出力

#### `warn(...args: any[]): Promise<any[]>`
warnレベルでログを出力

#### `error(...args: any[]): Promise<any[]>`
errorレベルでログを出力

### loggerBuilder 関数

#### `loggerBuilder(opts?: LoggerBuilderOptions): LoggerBuilderResult`
指定されたオプションに対応するロガーを生成

#### LoggerBuilderOptions
```typescript
interface LoggerBuilderOptions {
  defaultSettings?: LoggerOptions;  // 全ロガーのベース設定
  namedSettings?: LoggerNamedSettings;  // 名前付きロガーの設定
}
```

#### LoggerOptions
```typescript
interface LoggerOptions {
  level?: LogLevelThreshold;  // ログレベル閾値
  transformers?: Transformer[];  // 変換関数のリスト
  transports?: RawTransport[];  // 出力先のリスト
}
```

### 内蔵Transport

#### `ConsoleTransport(settings?: ConsoleTransportSettings): Transport`
JavaScript コンソールへの出力

- `level`: ログレベル閾値
- `pretty`: ログレベル別の色付け

#### `DDTransport(settings: DDTransportSettings): Transport`
Datadog への送信（ブラウザ環境）

- `dd`: datadogLogs オブジェクト
- `config`: Datadog初期化設定
- `clone`: クローン変換設定

#### `StdoTransport(settings?: StdoTransportSettings): Transport`
標準出力への出力（Node.js環境）

### 内蔵Transformer

#### `CloneTransformer(options?: CloneOptions): Transformer`
ペイロードのディープクローンを作成

#### `SanitizerTransformer(options?: SanitizerOptions): Transformer`
機密データのサニタイズを実行

### ログレベル

- `error`: エラーレベル（最高優先度）
- `warn`: 警告レベル
- `info`: 情報レベル
- `debug`: デバッグレベル
- `trace`: トレースレベル（最低優先度）
- `silent`: 出力を無効化

## 高度な使用例

### 環境別設定

```typescript
const isDevelopment = process.env.NODE_ENV === 'development';

const { getLogger } = loggerBuilder({
  defaultSettings: {
    level: isDevelopment ? 'debug' : 'info',
    transformers: [
      // 本番環境では機密情報をサニタイズ
      !isDevelopment && SanitizerTransformer()
    ].filter(Boolean),
    transports: [
      ConsoleTransport({ pretty: isDevelopment }),
      // 本番環境でのみDatadog送信
      !isDevelopment && DDTransport({
        dd: datadogLogs,
        config: { /* Datadog設定 */ }
      })
    ].filter(Boolean)
  }
});
```

### カスタムTransport

```typescript
const FileTransport = (filePath: string): Transport => ({
  transport: async (payload) => {
    const fs = await import('fs/promises');
    const logLine = JSON.stringify(payload) + '\n';
    await fs.appendFile(filePath, logLine);
  }
});
```

## 依存関係

- `@fastkit/cloner`: オブジェクトクローン機能
- `@fastkit/helpers`: ヘルパーユーティリティ
- `@fastkit/json`: JSON処理
- `@fastkit/tiny-logger`: 軽量ログユーティリティ

### Peer Dependencies

- `@datadog/browser-logs`: Datadog連携（オプション）

## ドキュメント

詳細なドキュメントは[こちら](https://dadajam4.github.io/fastkit/universal-logger/)をご覧ください。

## ライセンス

MIT
