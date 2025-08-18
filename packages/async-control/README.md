# @fastkit/async-control

🌐 English | [日本語](./README-ja.md)

A helper library for efficient control and management of asynchronous processing. It prevents duplicate execution of consecutive asynchronous processes with the same arguments and provides advanced features such as caching and background updates. Written in TypeScript with strict type safety guarantees.

## Features

- **Duplicate Execution Prevention**: Automatically consolidates consecutive asynchronous processes with identical arguments
- **Advanced Cache Control**: Customizable caching functionality with background updates
- **Delayed Execution**: Ability to delay execution for a specified time
- **Decorator Support**: Declarative async control through TypeScript decorators
- **Error Handling**: Comprehensive error handling with custom logging capabilities
- **Full TypeScript Support**: Type safety through strict type definitions
- **Flexible Configuration**: Runtime enable/disable switching and argument customization
- **State Management**: Detailed state tracking of asynchronous processes

## Installation

```bash
npm install @fastkit/async-control
```

## Basic Usage

### Simple Async Control

```typescript
import { AsyncHandler } from '@fastkit/async-control'

// Define async function
async function fetchUserData(userId: string): Promise<{ id: string; name: string }> {
  const response = await fetch(`/api/users/${userId}`)
  return response.json()
}

// Wrap with AsyncHandler
const handler = new AsyncHandler(fetchUserData)

// Usage example
async function example() {
  // Even if called multiple times simultaneously with the same userId, only one actual API call is made
  const promise1 = handler.handler('user123')
  const promise2 = handler.handler('user123')
  const promise3 = handler.handler('user123')
  
  // All receive the same result
  const [result1, result2, result3] = await Promise.all([promise1, promise2, promise3])
  
  console.log(result1 === result2 && result2 === result3) // true
}
```

### Declarative Control Using Decorators

```typescript
import { AsyncHandle } from '@fastkit/async-control'

class ApiService {
  // Apply async control with decorator
  @AsyncHandle()
  async getUserProfile(userId: string) {
    console.log(`API call: ${userId}`)
    const response = await fetch(`/api/users/${userId}`)
    return response.json()
  }
  
  @AsyncHandle({ delay: 500 }) // 500ms delay
  async searchUsers(query: string) {
    console.log(`Executing search: ${query}`)
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
    return response.json()
  }
  
  @AsyncHandle({
    hashArgs: (productId: string, _timestamp: number) => [productId] // ignore timestamp
  })
  async getProductInfo(productId: string, timestamp: number) {
    // Even if timestamp is different, prevents duplicate execution if productId is the same
    const response = await fetch(`/api/products/${productId}`)
    return response.json()
  }
}

// Usage example
const apiService = new ApiService()

// Even if called multiple times in a short period, only one actual API call is made
apiService.getUserProfile('user123')
apiService.getUserProfile('user123')
apiService.getUserProfile('user123')
```

## Advanced Usage Examples

### Async Control with Caching

```typescript
import { AsyncHandler } from '@fastkit/async-control'
import { createMemoryCacheController } from '@fastkit/cache-control'

// Create cache controller
const cacheController = createMemoryCacheController({
  ttl: 60 * 1000, // Cache for 60 seconds
  max: 100        // Maximum 100 entries
})

// AsyncHandler with cache
const handler = new AsyncHandler(fetchUserData, {
  cache: {
    controller: cacheController,
    ttl: 60 * 1000, // Valid for 60 seconds
    
    // Background update settings
    revalidate: (details) => {
      // Execute background update if remaining valid time is 10 seconds or less
      return details.remainingTimes.ttl <= 10 * 1000
    },
    
    errorHandlers: {
      get: (error) => console.warn('Cache retrieval error:', error),
      set: (error) => console.warn('Cache save error:', error)
    }
  }
})

async function fetchUserData(userId: string) {
  console.log(`API call: ${userId}`)
  const response = await fetch(`/api/users/${userId}`)
  return response.json()
}

// Usage example
async function cacheExample() {
  // First call: API call is executed
  const user1 = await handler.handler('user123')
  
  // Second call: Retrieved from cache (no API call)
  const user2 = await handler.handler('user123')
  
  // Background update is executed when cache expiration is near
  console.log(user1, user2)
}
```

### Utilization in Search Functionality

```typescript
import { AsyncHandle, getAsyncHandler } from '@fastkit/async-control'

interface SearchResult {
  id: string
  title: string
  description: string
}

class SearchService {
  @AsyncHandle({
    delay: 300, // 300ms delay (debounce effect)
    
    // Disable control if search query is empty
    enabled: (query: string) => query.trim().length > 0,
    
    cache: {
      ttl: 5 * 60 * 1000, // Cache for 5 minutes
      revalidate: 'always' // Always background update
    }
  })
  async searchProducts(query: string): Promise<SearchResult[]> {
    console.log(`Executing search: "${query}"`)
    
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
    if (!response.ok) {
      throw new Error(`Search error: ${response.status}`)
    }
    
    return response.json()
  }
  
  // Search cancellation feature
  cancelSearch() {
    const handler = getAsyncHandler(this.searchProducts)
    // Destroy all currently running requests
    Object.values((handler as any)._requestMap).forEach((request: any) => {
      request.destroy()
    })
  }
}

// Usage example
const searchService = new SearchService()

// Real-time search implementation
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
      console.error('Search error:', error)
      displayError('An error occurred during search')
    }
  })
}

function displaySearchResults(results: SearchResult[]) {
  // Display search results
}

function displayError(message: string) {
  // Display error
}
```

### API Call Optimization

```typescript
import { AsyncHandler } from '@fastkit/async-control'

class OptimizedApiClient {
  private userHandler: AsyncHandler<typeof this.fetchUser>
  private postsHandler: AsyncHandler<typeof this.fetchUserPosts>
  
  constructor() {
    // User information retrieval (long-term cache)
    this.userHandler = new AsyncHandler(this.fetchUser.bind(this), {
      cache: {
        ttl: 10 * 60 * 1000, // Cache for 10 minutes
        revalidate: 30 * 1000 // Background update with 30 seconds remaining
      },
      errorLogger: (error) => {
        console.error('User retrieval error:', error)
      }
    })
    
    // Post list retrieval (short-term cache + debounce)
    this.postsHandler = new AsyncHandler(this.fetchUserPosts.bind(this), {
      delay: 100, // 100ms delay
      cache: {
        ttl: 60 * 1000, // Cache for 1 minute
        revalidate: 'always' // Always background update
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
  
  // Public methods
  async getUser(userId: string) {
    return this.userHandler.handler(userId)
  }
  
  async getUserPosts(userId: string, page: number = 1) {
    return this.postsHandler.handler(userId, page)
  }
  
  // Batch data retrieval
  async getUserWithPosts(userId: string) {
    // Execute in parallel (cache and duplicate control are effective)
    const [user, posts] = await Promise.all([
      this.getUser(userId),
      this.getUserPosts(userId, 1)
    ])
    
    return { user, posts }
  }
}

// Usage example
const apiClient = new OptimizedApiClient()

async function loadUserDashboard(userId: string) {
  try {
    // Efficient even when called simultaneously from multiple places
    const dashboardData = await apiClient.getUserWithPosts(userId)
    return dashboardData
  } catch (error) {
    console.error('Dashboard loading error:', error)
    throw error
  }
}
```

### Custom Argument Hashing

```typescript
import { AsyncHandler } from '@fastkit/async-control'

interface RequestOptions {
  includeMetadata?: boolean
  format?: 'json' | 'xml'
  version?: string
}

// Hashing excluding default settings
const handler = new AsyncHandler(
  async (resourceId: string, options: RequestOptions = {}) => {
    // Retrieve resource
    const response = await fetch(`/api/resources/${resourceId}`, {
      headers: {
        'Accept': options.format === 'xml' ? 'application/xml' : 'application/json',
        'API-Version': options.version || '1.0'
      }
    })
    return response.json()
  },
  {
    // Hash excluding default values
    hashArgs: (resourceId: string, options: RequestOptions = {}) => [
      resourceId,
      {
        includeMetadata: options.includeMetadata || false,
        format: options.format || 'json',
        version: options.version || '1.0'
      }
    ],
    
    cache: {
      ttl: 5 * 60 * 1000 // Cache for 5 minutes
    }
  }
)

// Usage example
async function resourceExample() {
  // These calls generate the same hash, so duplicate execution is prevented
  const resource1 = handler.handler('resource123')
  const resource2 = handler.handler('resource123', {})
  const resource3 = handler.handler('resource123', { format: 'json' })
  const resource4 = handler.handler('resource123', { version: '1.0' })
  
  const results = await Promise.all([resource1, resource2, resource3, resource4])
  // All same results
}
```

### Conditional Async Control

```typescript
import { AsyncHandle } from '@fastkit/async-control'

class ConditionalService {
  private isProductionMode = process.env.NODE_ENV === 'production'
  
  @AsyncHandle({
    // Enable async control only in production environment
    enabled: function(this: ConditionalService) {
      return this.isProductionMode
    },
    
    cache: {
      ttl: 30 * 1000, // 30 seconds cache
    }
  })
  async getAnalyticsData(eventType: string, dateRange: string) {
    console.log(`Getting analytics data: ${eventType}, ${dateRange}`)
    
    // Heavy analysis processing
    const response = await fetch(`/api/analytics/${eventType}?range=${dateRange}`)
    return response.json()
  }
  
  @AsyncHandle({
    // Enable control based on data size
    enabled: (data: any[]) => data.length > 100, // Control only when over 100 items
    
    delay: 50, // Slight delay
  })
  async processLargeDataset(data: any[]) {
    console.log(`Starting large data processing: ${data.length} items`)
    
    // Heavy processing simulation
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return data.map(item => ({
      ...item,
      processed: true,
      processedAt: new Date().toISOString()
    }))
  }
}

// Usage example
const service = new ConditionalService()

async function conditionalExample() {
  // Small dataset (no control)
  const smallResult = await service.processLargeDataset([1, 2, 3])
  
  // Large dataset (with control)
  const largeData = Array.from({ length: 200 }, (_, i) => ({ id: i }))
  const largeResult = await service.processLargeDataset(largeData)
  
  console.log({ smallResult, largeResult })
}
```

## Request State Management

```typescript
import { AsyncHandler } from '@fastkit/async-control'

const handler = new AsyncHandler(async (id: string) => {
  // Simulate long-running process
  await new Promise(resolve => setTimeout(resolve, 2000))
  return { id, data: `Result: ${id}` }
})

async function requestStateExample() {
  // Get request object
  const request = handler.getRequestByArgs(['test123'])
  
  console.log('Initial state:', request.state) // 'pending'
  console.log('Is pending?:', request.isPending) // true
  
  // Start processing
  const resultPromise = handler.handler('test123')
  
  // Wait a bit and check state
  setTimeout(() => {
    console.log('Running state:', request.state) // 'running'
    console.log('Is running?:', request.isRunning) // true
  }, 100)
  
  // Wait for result
  const result = await resultPromise
  
  console.log('Completed state:', request.state) // 'resolved'
  console.log('Is resolved?:', request.isResolved) // true
  console.log('Result:', result)
}
```

## API Specification

### `AsyncHandler` Class

```typescript
class AsyncHandler<Fn extends AsyncFn> {
  constructor(func: Fn, options?: AsyncHandlerOptions<Fn>)
  
  // Controlled async function
  readonly handler: Fn
  
  // Direct call to original function
  call(...args: Parameters<Fn>): Promise<Awaited<ReturnType<Fn>>>
  
  // Check if specified arguments are controlled
  isEnabled(...args: Parameters<Fn>): boolean
  
  // Get request object corresponding to arguments
  getRequestByArgs(args: Parameters<Fn>): AsyncHandlerRequest<Fn>
}
```

### Option Settings

```typescript
interface AsyncHandlerOptions<Fn extends AsyncFn> {
  // Error log function
  errorLogger?: (error: unknown) => any
  
  // Function's this object
  thisObj?: any
  
  // Execution delay time (milliseconds)
  delay?: number
  
  // Customize argument hashing
  hashArgs?: (...args: Parameters<Fn>) => any
  
  // Cache settings
  cache?: RawAsyncHandlerCacheBehavior<AwaitedReturnType<Fn>>
  
  // Enable/disable control
  enabled?: boolean | ((...args: Parameters<Fn>) => boolean)
}
```

### Cache Settings

```typescript
interface AsyncHandlerCacheBehavior<T> {
  // TTL (Time To Live)
  ttl?: number | Duration
  
  // Maximum number of entries
  max?: number
  
  // Background update condition
  revalidate?: 'always' | number | Duration | ((details) => boolean)
  
  // Error handlers
  errorHandlers?: {
    get?: (error: unknown) => any
    set?: (error: unknown) => any
  }
}
```

### Decorators

```typescript
// Method decorator
@AsyncHandle<Fn>(options?: AsyncHandlerOptions<Fn>)

// Handler retrieval
function getAsyncHandler<Fn extends AsyncFn>(func: Fn): AsyncHandler<Fn>
```

### Request State

```typescript
interface AsyncHandlerRequest<Fn extends AsyncFn> {
  // Execution state
  readonly state: 'pending' | 'running' | 'resolved' | 'rejected' | 'destroyed'
  
  // State checks
  readonly isPending: boolean
  readonly isRunning: boolean
  readonly isResolved: boolean
  readonly isRejected: boolean
  readonly isDestroyed: boolean
  
  // Result retrieval
  getResolvedValue(): Awaited<ReturnType<Fn>>
  
  // Destroy request
  destroy(): void
}
```

## Considerations

### Performance Considerations
- Complex objects in arguments increase hash calculation cost
- Cache size should be properly limited
- Consider appropriate timeout settings for long-running processes

### Memory Management
- Unnecessary requests are automatically destroyed
- Be careful with internal map size when calling with many different arguments
- Set appropriate maximum cache size

### Error Handling
- Errors from original function are propagated to caller
- Cache operation errors can be handled individually
- Customize log output with custom error logger

## License

MIT

## Related Packages

- [@fastkit/cache-control](../cache-control/README.md): Cache control functionality
- [@fastkit/duration](../duration/README.md): Time duration management
- [@fastkit/helpers](../helpers/README.md): Basic utility functions
- [@fastkit/tiny-hash](../tiny-hash/README.md): Lightweight hash generation
- [@fastkit/tiny-logger](../tiny-logger/README.md): Log output functionality