# @fastkit/tiny-logger

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/tiny-logger/README-ja.md)

A small logger library for displaying application logs in a slightly more beautiful way. Provides colored log output, namespace-based classification, and custom error class generation functionality.

## Features

- **Colored Log Output**: Automatic color coding based on log level (debug, info, warn, error, success)
- **Namespace Management**: Output classification and identification by logger name
- **Multiple Log Levels**: 5 levels - debug, info, warn, error, success
- **Color Control**: Enable/disable color output toggle
- **Lightweight Design**: Simple implementation with minimal dependencies
- **Full TypeScript Support**: Type safety through strict type definitions
- **Custom Error Classes**: Automatic generation of namespaced error classes

## Installation

```bash
npm install @fastkit/tiny-logger
```

## Basic Usage

### Creating and Using TinyLogger

```typescript
import { TinyLogger } from '@fastkit/tiny-logger'

// Create logger instance
const logger = new TinyLogger('MyApp')

// Output at various log levels
logger.debug('This is debug information')        // Displayed in purple
logger.info('This is normal information')        // Displayed in cyan
logger.warn('This is a warning message')        // Displayed in yellow
logger.error('An error has occurred')           // Displayed in red
logger.success('Process completed successfully') // Displayed in green
```

### Log Output with Arguments

```typescript
const logger = new TinyLogger('API')

// You can pass additional arguments
logger.info('Retrieved user information', { userId: 123, name: 'John' })
logger.error('Request failed', new Error('Network timeout'))
logger.debug('Debug information', { timestamp: Date.now(), level: 'verbose' })
```

### Multiple Logger Instances

```typescript
import { TinyLogger } from '@fastkit/tiny-logger'

// Separate loggers by functionality
const dbLogger = new TinyLogger('Database')
const authLogger = new TinyLogger('Auth')
const apiLogger = new TinyLogger('API')

dbLogger.info('Database connection established')
// Output: [Database] Database connection established

authLogger.warn('Authentication token expiration approaching')
// Output: [Auth] Authentication token expiration approaching

apiLogger.error('Error occurred in API request')
// Output: [API] Error occurred in API request
```

## Log Levels and Color Coding

Each log level has a dedicated color assigned:

| Log Level | Color | Purpose |
|-----------|-------|---------|
| `debug` | Purple (magenta) | Debug information, detailed logs during development |
| `info` | Cyan | General information, normal processing results |
| `warn` | Yellow | Warnings, situations requiring attention |
| `error` | Red | Errors, abnormal situations |
| `success` | Green | Success, completed processing |

### Color Output Control

```typescript
import { TinyLogger } from '@fastkit/tiny-logger'

// Disable color output
TinyLogger.colorEnable(false)

const logger = new TinyLogger('App')
logger.info('This output will not be colored')

// Enable color output
TinyLogger.colorEnable(true)
logger.info('This output will be colored')
```

## Custom Error Classes

You can create custom error classes with namespaces using the `createTinyError` function:

```typescript
import { createTinyError } from '@fastkit/tiny-logger'

// Create custom error classes
const ValidationError = createTinyError('Validation')
const DatabaseError = createTinyError('Database')
const AuthError = createTinyError('Authentication')

// Using errors
try {
  throw new ValidationError('Username is required')
} catch (error) {
  console.log(error.message)
  // Output: [Validation] Username is required
}

// Error chaining is also supported
try {
  throw new Error('Database connection failed')
} catch (originalError) {
  throw new DatabaseError(originalError)
  // Output: [Database] Database connection failed
}
```

## Practical Usage Examples

### Application-wide Logger Management

```typescript
import { TinyLogger } from '@fastkit/tiny-logger'

// Create loggers for each module
export const loggers = {
  app: new TinyLogger('App'),
  user: new TinyLogger('User'),
  product: new TinyLogger('Product'),
  payment: new TinyLogger('Payment'),
  notification: new TinyLogger('Notification')
} as const

// Usage examples
loggers.user.info('User logged in', { userId: '12345' })
loggers.product.warn('Low stock level', { productId: 'P001', stock: 3 })
loggers.payment.error('Payment processing error', { orderId: 'O12345', error: 'Card error' })
```

### Debug Logs in Development Environment

```typescript
import { TinyLogger } from '@fastkit/tiny-logger'

const debugLogger = new TinyLogger('Debug')

class ApiService {
  private logger = new TinyLogger('ApiService')

  async fetchUser(userId: string) {
    this.logger.debug('Starting user fetch', { userId })

    try {
      const response = await fetch(`/api/users/${userId}`)
      const user = await response.json()

      this.logger.success('User fetch successful', { userId, user })
      return user
    } catch (error) {
      this.logger.error('User fetch error', { userId, error })
      throw error
    }
  }
}
```

### Integration with Error Handling

```typescript
import { TinyLogger, createTinyError } from '@fastkit/tiny-logger'

const logger = new TinyLogger('FileProcessor')
const FileProcessError = createTinyError('FileProcessor')

class FileProcessor {
  async processFile(filePath: string) {
    logger.info('Starting file processing', { filePath })

    try {
      // Check file existence
      if (!this.fileExists(filePath)) {
        throw new FileProcessError('File not found')
      }

      // Process file
      const result = await this.doProcess(filePath)
      logger.success('File processing completed', { filePath, result })

      return result
    } catch (error) {
      logger.error('File processing error', { filePath, error })

      if (error instanceof FileProcessError) {
        throw error
      }

      throw new FileProcessError(error as Error)
    }
  }

  private fileExists(filePath: string): boolean {
    // Implementation for file existence check
    return true
  }

  private async doProcess(filePath: string) {
    // Implementation for file processing
    return { processed: true }
  }
}
```

### Conditional Log Output

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

// Disable verbose in production environment
const isDevelopment = process.env.NODE_ENV === 'development'
const appLogger = new ConditionalLogger('App', isDevelopment)
```

### Integration with Log Aggregation Systems

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
    // Output to standard output
    super.log(type, message, ...args)

    // Record to log buffer
    this.logBuffer.push({
      timestamp: new Date().toISOString(),
      level: type,
      logger: this.name,
      message,
      args
    })

    // Send to external system when buffer is full
    if (this.logBuffer.length >= 100) {
      this.flushLogs()
    }
  }

  private async flushLogs() {
    const logs = [...this.logBuffer]
    this.logBuffer = []

    try {
      // Send to external log system
      await this.sendToLogSystem(logs)
    } catch (error) {
      // Fallback to standard output on send failure
      console.error('Failed to send logs', error)
    }
  }

  private async sendToLogSystem(logs: LogEntry[]) {
    // Implementation for sending to external log service
    // await fetch('/api/logs', { method: 'POST', body: JSON.stringify(logs) })
  }
}
```

## API Reference

### TinyLogger Class

#### Constructor
```typescript
constructor(loggerName: string)
```
- `loggerName`: Logger name (displayed during log output)

#### Static Methods
- `TinyLogger.colorEnable(enable: boolean)`: Enable/disable color output

#### Instance Properties
- `name: string`: Logger name (read-only)

#### Log Output Methods
```typescript
debug(message: string, ...args: any[]): void
info(message: string, ...args: any[]): void
warn(message: string, ...args: any[]): void
error(message: string, ...args: any[]): void
success(message: string, ...args: any[]): void
```

#### Generic Log Method
```typescript
log(type: TinyLoggerLogType, message: string, ...args: any[]): void
```

### createTinyError Function

```typescript
function createTinyError(name: string): typeof TinyError
```

Generates custom error classes. The generated class:
- Inherits from `Error` class
- Automatically generates namespaced error messages
- Supports error chaining

### Type Definitions

#### TinyLoggerLogType
```typescript
type TinyLoggerLogType = 'debug' | 'info' | 'warn' | 'error' | 'success'
```

#### ConsoleColorPaletteName
```typescript
type ConsoleColorPaletteName = 'red' | 'green' | 'yellow' | 'magenta' | 'cyan' | 'reset'
```

## Colors and ANSI Escape Sequences

ANSI escape sequences used internally:

| Color | Escape Sequence |
|-------|-----------------|
| Red | `\u001b[31m` |
| Green | `\u001b[32m` |
| Yellow | `\u001b[33m` |
| Purple | `\u001b[35m` |
| Cyan | `\u001b[36m` |
| Reset | `\u001b[0m` |

## Related Packages

- `@fastkit/helpers` - Helper functions (internal dependency)

## License

MIT
