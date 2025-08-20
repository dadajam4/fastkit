
# @fastkit/json

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/json/README-ja.md)

A safe utility library for JSON operations. It provides secure serialization for objects containing circular references, avoiding errors that occur with `JSON.stringify` while offering customizable serialization functionality.

## Features

- **Circular Reference Support**: Safe serialization of objects containing circular references
- **Custom Replacer**: Value transformation and filtering functionality
- **Type Safety**: JSON type definitions and type-safe operations with TypeScript
- **Flexible Configuration**: Customizable indentation and circular reference handling
- **Lightweight**: Lightweight library with no dependencies
- **Error Prevention**: Prevents typical errors from `JSON.stringify`

## Installation

```bash
npm install @fastkit/json
```

## Basic Usage

### Safe Handling of Circular References

```typescript
import { safeJSONStringify } from '@fastkit/json'

// Object containing circular references
const user = {
  id: 1,
  name: 'Alice',
  friends: [] as any[]
}

const friend = {
  id: 2,
  name: 'Bob',
  friends: [user] // circular reference
}

user.friends.push(friend)

// Regular JSON.stringify will cause an error
try {
  JSON.stringify(user)
} catch (error) {
  console.error('Error:', error.message) // Converting circular structure to JSON
}

// Safe processing with safeJSONStringify
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

### Using Custom Replacer

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

// Exclude password and convert dates to ISO strings
const jsonString = safeJSONStringify(data, function(key, value) {
  // Exclude password field
  if (key === 'password') {
    return undefined
  }

  // Convert dates to ISO strings
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

## Advanced Usage Examples

### Safe API Response Logging

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
    // Mask sensitive fields
    if (typeof key === 'string' && this.isSensitiveField(key)) {
      return '[REDACTED]'
    }

    // Truncate large strings
    if (typeof value === 'string' && value.length > 1000) {
      return value.substring(0, 1000) + '...[TRUNCATED]'
    }

    // Truncate large arrays
    if (Array.isArray(value) && value.length > 50) {
      return [
        ...value.slice(0, 50),
        `...[${value.length - 50} more items]`
      ]
    }

    // Convert Date objects to ISO strings
    if (value instanceof Date) {
      return value.toISOString()
    }

    // Convert Error objects to serializable format
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

// Usage example
async function apiExample() {
  const logger = new APILogger()

  // Request log
  logger.logRequest('/api/users', 'POST', {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'secret123' // This will be masked
  }, {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token123' // This will be masked
  })

  // Response log
  logger.logResponse('/api/users', 201, {
    id: 123,
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: new Date()
  })
}
```

### Safe Configuration File Storage

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
          // Exclude password-related fields
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

    // Don't include sensitive information in backup
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
    // Export runtime configuration
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
    // In actual application, get runtime configuration
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

// Usage example
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

  // Save excluding passwords
  await configManager.saveConfig(config, false)

  // Create backup
  const backupPath = await configManager.createBackup()
  console.log('Backup created:', backupPath)

  // Export configuration
  const exportedConfig = configManager.exportConfig(true)
  console.log('Exported configuration:', exportedConfig)
}
```

### Debug Object Dump

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
      // Apply custom replacer first
      if (customReplacer) {
        const customResult = customReplacer(key, value)
        if (customResult !== value) {
          return customResult
        }
      }

      // Depth limitation
      if (key && currentDepth > maxDepth) {
        return '[Max Depth Exceeded]'
      }

      if (key) currentDepth++

      // Function handling
      if (typeof value === 'function') {
        if (includeFunctions) {
          return `[Function: ${value.name || 'anonymous'}]`
        }
        return undefined
      }

      // Symbol handling
      if (typeof value === 'symbol') {
        return value.toString()
      }

      // undefined handling
      if (value === undefined) {
        return '[undefined]'
      }

      // Truncate large strings
      if (typeof value === 'string' && value.length > this.MAX_STRING_LENGTH) {
        return value.substring(0, this.MAX_STRING_LENGTH) + '...[TRUNCATED]'
      }

      // Truncate large arrays
      if (Array.isArray(value) && value.length > this.MAX_ARRAY_LENGTH) {
        const truncated = value.slice(0, this.MAX_ARRAY_LENGTH)
        truncated.push(`...[${value.length - this.MAX_ARRAY_LENGTH} more items]`)
        return truncated
      }

      // Add type information
      if (includeTypes && value !== null && typeof value === 'object') {
        if (value.constructor && value.constructor.name !== 'Object') {
          return {
            __type: value.constructor.name,
            __value: value
          }
        }
      }

      // Date object handling
      if (value instanceof Date) {
        return includeTypes
          ? { __type: 'Date', __value: value.toISOString() }
          : value.toISOString()
      }

      // RegExp object handling
      if (value instanceof RegExp) {
        return includeTypes
          ? { __type: 'RegExp', __value: value.toString() }
          : value.toString()
      }

      // Error object handling
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

    // Simple equality check
    const json1 = this.dump(obj1, { includeTypes: false })
    const json2 = this.dump(obj2, { includeTypes: false })

    console.log('Equal:', json1 === json2)

    console.groupEnd()
  }
}

// Usage example
function debugExample() {
  // Complex object
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

  // Add circular reference
  complexObject.metadata['self'] = complexObject

  // Basic dump
  DebugDumper.dumpToConsole(complexObject, 'Complex Object')

  // Dump with options
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

  // Object comparison
  const modifiedObject = { ...complexObject, name: 'Modified Object' }
  DebugDumper.compare(complexObject, modifiedObject, 'Original', 'Modified')
}
```

## API Specification

### Type Definitions

```typescript
// Primitive JSON values
type JSONPrimitiveValue = string | number | boolean | null | undefined

// JSON data type
type JSONData = JSONPrimitiveValue | JSONPrimitiveValue[] | JSONMapValue

// JSON object type
type JSONMapValue = { [key: string]: JSONData }

// Replacer function type
type Replacer = (this: any, key: string, value: any) => any

// Serializer function type
type Serializer = (this: any, key: string, value: any) => any
```

### Main Functions

#### `safeJSONStringify`

```typescript
function safeJSONStringify<T>(
  obj: T,
  replacer?: Replacer,
  spaces?: string | number,
  cycleReplacer?: Replacer
): string
```

Performs safe JSON stringification.

**Parameters:**
- `obj`: Object to serialize
- `replacer`: Value transformation/filtering function (optional)
- `spaces`: Indent string or number (optional)
- `cycleReplacer`: Processing function when circular reference is detected (optional)

**Returns:** JSON string

#### `safeJSONSerializer`

```typescript
function safeJSONSerializer(
  replacer?: Replacer,
  cycleReplacer?: Replacer
): Serializer
```

Generates a serializer function that handles circular references.

**Parameters:**
- `replacer`: Value transformation/filtering function (optional)
- `cycleReplacer`: Processing function when circular reference is detected (optional)

**Returns:** Serializer function

### Handling Circular References

Default circular reference handling replaces them with the following format:

```typescript
// Circular reference to root object
"[Circular ~]"

// Circular reference to specific path
"[Circular ~.path.to.object]"
```

## Considerations

### Performance Considerations
- Processing time increases with large objects or deeply nested objects
- Circular reference detection has stack management overhead
- Custom replacer complexity affects performance

### Memory Usage
- Uses memory for stack management for circular reference detection
- Be mindful of memory usage when processing large amounts of objects simultaneously

### Security Considerations
- Use appropriate replacers when serializing objects containing sensitive information
- Implement masking of sensitive fields during log output
- Be aware that error object stack information may be output unintentionally

### Use Cases
- API request/response log output
- Safe storage of configuration files
- Debug object output
- Processing data structures containing circular references

## License

MIT
