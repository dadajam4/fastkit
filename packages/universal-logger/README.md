
# @fastkit/universal-logger

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/universal-logger/README-ja.md)

A pluggable and universal logging library that works regardless of server/browser execution environment.

## Features

- **Universal Support**: Same API can be used in Node.js and browser environments
- **Plugin Design**: Freely customizable with Transformer and Transport
- **Full TypeScript Support**: Type-safe log operations with strict type definitions
- **Level Control**: 5-level support: trace, debug, info, warn, error
- **Multiple Outputs**: Supports simultaneous output to console, Datadog, etc.
- **Named Loggers**: Loggers can be separated and managed by purpose

## Installation

```bash
npm install @fastkit/universal-logger
# or
pnpm add @fastkit/universal-logger
```

## Basic Usage

### Simple Logger

```typescript
import { loggerBuilder, ConsoleTransport } from '@fastkit/universal-logger';

// Build logger
const { getLogger } = loggerBuilder({
  defaultSettings: {
    level: 'info',
    transports: [ConsoleTransport({ pretty: true })]
  }
});

// Get and use logger
const logger = getLogger();
logger.info('Hello, world!');
logger.warn('Warning message');
logger.error('Error occurred', new Error('Sample error'));
```

### Named Loggers

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

### Datadog Integration

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

### Custom Transformer

```typescript
import { Transformer, loggerBuilder } from '@fastkit/universal-logger';

// Transformer that adds timestamp
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

### Logger Class

#### `log(level: LogLevel, ...args: any[]): Promise<any[]>`
Output log at specified log level

#### `trace(...args: any[]): Promise<any[]>`
Output log at trace level

#### `debug(...args: any[]): Promise<any[]>`
Output log at debug level

#### `info(...args: any[]): Promise<any[]>`
Output log at info level

#### `warn(...args: any[]): Promise<any[]>`
Output log at warn level

#### `error(...args: any[]): Promise<any[]>`
Output log at error level

### loggerBuilder Function

#### `loggerBuilder(opts?: LoggerBuilderOptions): LoggerBuilderResult`
Generate logger corresponding to specified options

#### LoggerBuilderOptions
```typescript
interface LoggerBuilderOptions {
  defaultSettings?: LoggerOptions;  // Base settings for all loggers
  namedSettings?: LoggerNamedSettings;  // Settings for named loggers
}
```

#### LoggerOptions
```typescript
interface LoggerOptions {
  level?: LogLevelThreshold;  // Log level threshold
  transformers?: Transformer[];  // List of transformation functions
  transports?: RawTransport[];  // List of output destinations
}
```

### Built-in Transport

#### `ConsoleTransport(settings?: ConsoleTransportSettings): Transport`
Output to JavaScript console

- `level`: Log level threshold
- `pretty`: Color coding by log level

#### `DDTransport(settings: DDTransportSettings): Transport`
Send to Datadog (browser environment)

- `dd`: datadogLogs object
- `config`: Datadog initialization settings
- `clone`: Clone transformation settings

#### `StdoTransport(settings?: StdoTransportSettings): Transport`
Output to standard output (Node.js environment)

### Built-in Transformer

#### `CloneTransformer(options?: CloneOptions): Transformer`
Create deep clone of payload

#### `SanitizerTransformer(options?: SanitizerOptions): Transformer`
Execute sanitization of sensitive data

### Log Levels

- `error`: Error level (highest priority)
- `warn`: Warning level
- `info`: Information level
- `debug`: Debug level
- `trace`: Trace level (lowest priority)
- `silent`: Disable output

## Advanced Usage Examples

### Environment-specific Configuration

```typescript
const isDevelopment = process.env.NODE_ENV === 'development';

const { getLogger } = loggerBuilder({
  defaultSettings: {
    level: isDevelopment ? 'debug' : 'info',
    transformers: [
      // Sanitize sensitive information in production environment
      !isDevelopment && SanitizerTransformer()
    ].filter(Boolean),
    transports: [
      ConsoleTransport({ pretty: isDevelopment }),
      // Send to Datadog only in production environment
      !isDevelopment && DDTransport({
        dd: datadogLogs,
        config: { /* Datadog settings */ }
      })
    ].filter(Boolean)
  }
});
```

### Custom Transport

```typescript
const FileTransport = (filePath: string): Transport => ({
  transport: async (payload) => {
    const fs = await import('fs/promises');
    const logLine = JSON.stringify(payload) + '\n';
    await fs.appendFile(filePath, logLine);
  }
});
```

## Dependencies

- `@fastkit/cloner`: Object clone functionality
- `@fastkit/helpers`: Helper utilities
- `@fastkit/json`: JSON processing
- `@fastkit/tiny-logger`: Lightweight log utilities

### Peer Dependencies

- `@datadog/browser-logs`: Datadog integration (optional)

## Documentation

For detailed documentation, please see [here](https://dadajam4.github.io/fastkit/universal-logger/).

## License

MIT
