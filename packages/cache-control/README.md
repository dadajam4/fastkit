

# @fastkit/cache-control

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/cache-control/README-ja.md)

A helper library for plugging cache control into JavaScript implementations. Provides memory and file system-based storage with TTL (Time To Live) management, automatic expiration checking, and flexible cache operation APIs as a comprehensive caching solution.

## Features

- **Multiple Storage Support**: Memory-based and file system-based storage
- **TTL Management**: Flexible expiration settings with Duration class integration
- **Automatic Expiration Check**: Automatic deletion of expired cache
- **Type Safety**: Strict type definitions with TypeScript
- **Async Support**: Fully asynchronous API based on Promises
- **Remaining Time Calculation**: Detailed information about cache remaining valid time
- **Flexible Key Management**: String keys or object-formatted requests
- **Memory Limits**: Memory usage control by maximum number of keys
- **File Cache**: Persistent cache storage

## Installation

```bash
npm install @fastkit/cache-control
```

## Basic Usage

### Basic Memory Cache Usage

```typescript
import { CacheController, MemoryCacheStorage } from '@fastkit/cache-control'

// Create memory-based storage
const storage = new MemoryCacheStorage({
  maxKeys: 1000 // Hold maximum 1000 cache entries
})

// Create cache controller
const cacheController = new CacheController({
  storage,
  ttl: 300 // Default 5-minute TTL
})

// Basic cache operations
async function basicCacheExample() {
  // Save data to cache
  const cacheDetails = await cacheController.set({
    key: 'user:123',
    data: { id: 123, name: 'John Doe', email: 'john@example.com' },
    args: ['123'] // Optional: record arguments
  })

  console.log('Cache saved:', cacheDetails.createdAt)
  console.log('Expires at:', cacheDetails.expiredAt)

  // Retrieve data from cache
  const retrieved = await cacheController.get('user:123')

  if (retrieved) {
    console.log('Cache data:', retrieved.data)
    console.log('Remaining time:', retrieved.remainingTimes.humanReadable)
    console.log('Elapsed time:', retrieved.elapsedTimes.humanReadable)
    console.log('Expired?:', retrieved.expired)
  } else {
    console.log('Cache not found or expired')
  }

  // Delete cache
  await cacheController.delete('user:123')
}
```

### Custom TTL and Duration Usage

```typescript
import { CacheController, MemoryCacheStorage } from '@fastkit/cache-control'
import { Duration } from '@fastkit/duration'

const storage = new MemoryCacheStorage()
const cacheController = new CacheController({
  storage,
  ttl: Duration.hours(1) // Default 1 hour
})

async function customTtlExample() {
  // Short-term cache (30 seconds)
  await cacheController.set({
    key: 'temp:data',
    data: { temporary: true },
    ttl: 30
  })

  // Long-term cache (1 day)
  await cacheController.set({
    key: 'daily:summary',
    data: { summary: 'Daily report data' },
    ttl: Duration.days(1)
  })

  // Persistent cache (no expiration)
  await cacheController.set({
    key: 'config:app',
    data: { version: '1.0.0', settings: {} },
    ttl: -1 // or Infinity
  })

  // Simulate time passage
  setTimeout(async () => {
    const tempData = await cacheController.get('temp:data')
    const dailyData = await cacheController.get('daily:summary')
    const configData = await cacheController.get('config:app')

    console.log('After 30 seconds:')
    console.log('  Temp data:', tempData ? 'exists' : 'expired')
    console.log('  Daily data:', dailyData ? 'exists' : 'expired')
    console.log('  Config data:', configData ? 'exists' : 'expired')
  }, 31000)
}
```

## Advanced Usage Examples

### File System Cache

```typescript
import { CacheController, FileCacheStorage } from '@fastkit/cache-control'
import path from 'path'

// Create file-based storage
const fileStorage = new FileCacheStorage({
  dir: path.join(process.cwd(), '.cache'), // Cache directory
  maxTimeout: 24 * 60 * 60 * 1000 // Maximum 24-hour timeout
})

const fileCacheController = new CacheController({
  storage: fileStorage,
  ttl: Duration.hours(6) // 6-hour default TTL
})

async function fileCacheExample() {
  // Save large dataset to file cache
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

  console.log('Saving large dataset to file cache...')
  await fileCacheController.set({
    key: 'dataset:users',
    data: largeDataset,
    ttl: Duration.hours(12) // Cache for 12 hours
  })

  console.log('Retrieving from file cache...')
  const cached = await fileCacheController.get('dataset:users')

  if (cached) {
    console.log(`Retrieved ${cached.data.users.length} user data`)
    console.log(`Created at: ${cached.createdAt}`)
    console.log(`Remaining time: ${cached.remainingTimes.humanReadable}`)
  }
}
```

### API Cache System

```typescript
import { CacheController, MemoryCacheStorage } from '@fastkit/cache-control'
import { Duration } from '@fastkit/duration'

// Multi-tier cache system
class ApiCacheSystem {
  private shortTermCache: CacheController
  private longTermCache: CacheController

  constructor() {
    // Short-term cache (for fast access)
    this.shortTermCache = new CacheController({
      storage: new MemoryCacheStorage({ maxKeys: 500 }),
      ttl: Duration.minutes(5)
    })

    // Long-term cache (file-based)
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
      // Use long-term cache for persistent data
      return this.longTermCache.set({
        key,
        data,
        ttl: ttl || Duration.hours(1)
      })
    } else {
      // Use short-term cache normally
      return this.shortTermCache.set({
        key,
        data,
        ttl: ttl || Duration.minutes(5)
      })
    }
  }

  async getApiResponse<T>(endpoint: string): Promise<T | null> {
    const key = `api:${endpoint}`

    // Check short-term cache first
    let cached = await this.shortTermCache.get(key)
    if (cached) {
      console.log('Short-term cache hit')
      return cached.data
    }

    // Check long-term cache
    cached = await this.longTermCache.get(key)
    if (cached) {
      console.log('Long-term cache hit')

      // Restore to short-term cache as well
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

// Usage example
async function apiCacheExample() {
  const apiCache = new ApiCacheSystem()

  // API response simulation
  async function fetchUserData(userId: string) {
    const endpoint = `users/${userId}`

    // Check cache
    let userData = await apiCache.getApiResponse<any>(endpoint)
    if (userData) {
      console.log('Retrieved user data from cache')
      return userData
    }

    // Call API
    console.log('Fetching user data from API...')
    const response = await fetch(`https://api.example.com/users/${userId}`)
    userData = await response.json()

    // Cache response
    await apiCache.cacheApiResponse(endpoint, userData, {
      ttl: Duration.minutes(10),
      persistent: true
    })

    return userData
  }

  // Usage example
  const user1 = await fetchUserData('123')
  const user2 = await fetchUserData('123') // Cache hit

  console.log('User data:', user1.name)
}
```

## API Specification

### `CacheController` Class

```typescript
class CacheController<T = any> {
  constructor(behavior: CacheControllerBehavior<T>)

  // Get cache
  get(req: RawGetCacheRequest): Promise<CacheDetailsWithRemainingTimes<T> | null>

  // Set cache
  set(settings: CreateCacheDetailsSettings<T>): Promise<CacheDetails<T>>

  // Delete cache
  delete(req: RawDeleteCacheRequest): Promise<void>
}
```

### Storage Classes

#### `MemoryCacheStorage`

```typescript
class MemoryCacheStorage implements CacheStorage {
  constructor(options?: MemoryCacheStorageOptions)

  // Properties
  maxKeys: number        // Maximum number of keys
  maxTimeout: number     // Maximum timeout duration
  size: number          // Current number of keys

  // Methods
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

  // Properties
  dir: string           // Cache directory
  maxTimeout: number    // Maximum timeout duration

  // Methods
  get(req: GetCacheRequest): Promise<CacheDetails | null>
  set(details: CacheDetails): Promise<void>
  delete(req: DeleteCacheRequest): Promise<void>
  clear(): Promise<void>
  createFilePath(key: string): string
}
```

### Type Definitions

```typescript
interface CacheDetails<T = any> {
  key: string                    // Cache key
  args?: any[]                  // Arguments list
  data: T                       // Cache data
  createdAt: string             // Creation date (ISO string)
  expiredAt: string | null      // Expiration date (ISO string or null)
}

interface CacheRemainingTimes {
  elapsedTimes: Duration        // Elapsed time
  remainingTimes: Duration      // Remaining time
  expired: boolean              // Expiration flag
}

interface CacheDetailsWithRemainingTimes<T = any>
  extends CacheDetails<T>, CacheRemainingTimes {}
```

### Option Settings

```typescript
interface MemoryCacheStorageOptions {
  maxKeys?: number              // Maximum number of keys (default: 32767)
  maxTimeout?: number           // Maximum timeout (default: 2147483647ms)
}

interface FileCacheStorageOptions {
  dir: string                   // Cache directory
  maxTimeout?: number           // Maximum timeout (default: 2147483647ms)
}

interface CacheControllerBehavior<T = any> {
  storage: CacheStorage<T>      // Storage instance
  ttl: number | Duration        // Default TTL
}
```

## Considerations

### Performance Considerations
- Memory cache is fast but be careful with memory usage
- File cache is persistent but has I/O costs
- Set maxKeys appropriately to prevent memory leaks
- Consider compression for large data caching

### TTL Management
- TTL is fixed at creation and cannot be changed later
- Automatic deletion is timer-based so not completely accurate
- Expiration check is performed on retrieval
- May be affected by system time changes

### File System Usage
- Disk space management required
- Be careful with file permissions
- Watch for race conditions during concurrent access
- Recommend implementing cleanup procedures

### Error Handling
- Implement exception handling for storage operations
- Handle disk space shortage and access permission errors
- Handle connection errors when using network storage

## License

MIT

## Related Packages

- [@fastkit/duration](../duration/README.md): Time duration management
- [@fastkit/cloner](../cloner/README.md): Object cloning functionality
- [@fastkit/helpers](../helpers/README.md): Basic utility functions
