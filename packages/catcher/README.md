
# @fastkit/catcher

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/catcher/README-ja.md)

A custom class library for implementing type-safe exception handling within applications. Provides unified processing of various exception types (Native Error, Axios Error, Fetch Error) while maintaining type safety and offering detailed error information extraction and normalization.

## Features

- **Type-Safe Exception Handling**: Safe exception handling through strict type definitions in TypeScript
- **Custom Resolvers**: Custom resolver system supporting various exception types
- **Exception Normalization**: Normalizes different exception formats to a unified format
- **History Management**: History functionality to track exception inheritance and chaining
- **JSON Serialization**: JSON output functionality for exception information
- **Axios Integration**: Detailed information extraction and serialization for Axios errors
- **Fetch API Integration**: Handling of Fetch API response errors
- **Customizable**: Create custom resolvers and normalizers

## Installation

```bash
npm install @fastkit/catcher
```

## Basic Usage

### Creating a Simple Catcher

```typescript
import { build, createCatcherNormalizer } from '@fastkit/catcher'

// Creating a basic normalizer
const normalizer = createCatcherNormalizer((resolvedData) => (exceptionInfo) => {
  return {
    timestamp: new Date().toISOString(),
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred'
  }
})

// Generating the catcher class
const MyCatcher = build({
  normalizer,
  defaultName: 'ApplicationError'
})

// Usage example
try {
  throw new Error('Some error')
} catch (error) {
  const caughtError = MyCatcher.from(error)

  console.log(caughtError.name)        // 'ApplicationError'
  console.log(caughtError.message)     // 'Error message'
  console.log(caughtError.timestamp)   // '2024-01-01T00:00:00.000Z'
  console.log(caughtError.code)        // 'UNKNOWN_ERROR'
}
```

### Using Custom Resolvers

```typescript
import {
  build,
  createCatcherResolver,
  createCatcherNormalizer
} from '@fastkit/catcher'

// Defining custom error types
interface APIError {
  code: string
  detail: string
  statusCode: number
}

function isAPIError(source: unknown): source is APIError {
  return typeof source === 'object' &&
         source !== null &&
         'code' in source &&
         'detail' in source &&
         'statusCode' in source
}

// Resolver for API errors
const apiErrorResolver = createCatcherResolver((source, ctx) => {
  if (isAPIError(source)) {
    ctx.resolve() // Skip subsequent resolvers
    return {
      apiErrorCode: source.code,
      apiErrorDetail: source.detail,
      statusCode: source.statusCode
    }
  }
})

// Creating the normalizer
const normalizer = createCatcherNormalizer((resolvedData) => (exceptionInfo) => {
  if (resolvedData.apiErrorCode) {
    return {
      code: resolvedData.apiErrorCode,
      message: resolvedData.apiErrorDetail,
      statusCode: resolvedData.statusCode,
      type: 'API_ERROR'
    }
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
    type: 'GENERIC_ERROR'
  }
})

// Generating the catcher class
const APICatcher = build({
  resolvers: [apiErrorResolver],
  normalizer,
  defaultName: 'APIError'
})

// Usage example
const apiError: APIError = {
  code: 'VALIDATION_FAILED',
  detail: 'Username is invalid',
  statusCode: 400
}

const caught = APICatcher.from(apiError)
console.log(caught.code)        // 'VALIDATION_FAILED'
console.log(caught.message)     // 'Username is invalid'
console.log(caught.statusCode)  // 400
console.log(caught.type)        // 'API_ERROR'
```

## Advanced Usage Examples

### Axios Error Handling

```typescript
import {
  build,
  createCatcherNormalizer,
  axiosErrorResolver
} from '@fastkit/catcher'
import axios from 'axios'

// Normalizer for Axios errors
const axiosNormalizer = createCatcherNormalizer((resolvedData) => (exceptionInfo) => {
  if (resolvedData.axiosError) {
    const { axiosError } = resolvedData
    return {
      message: axiosError.message,
      method: axiosError.config.method?.toUpperCase(),
      url: axiosError.config.url,
      statusCode: axiosError.response?.status,
      statusText: axiosError.response?.statusText,
      responseData: axiosError.response?.data,
      requestData: axiosError.config.data,
      headers: axiosError.config.headers,
      code: axiosError.code,
      type: 'HTTP_ERROR'
    }
  }

  return {
    message: 'A communication error occurred',
    type: 'NETWORK_ERROR'
  }
})

// Creating Axios catcher
const HttpCatcher = build({
  resolvers: [axiosErrorResolver],
  normalizer: axiosNormalizer,
  defaultName: 'HttpError'
})

// Usage example
async function fetchUserData(userId: string) {
  try {
    const response = await axios.get(`/api/users/${userId}`)
    return response.data
  } catch (error) {
    const httpError = HttpCatcher.from(error)

    console.log('Error type:', httpError.type)      // 'HTTP_ERROR'
    console.log('HTTP method:', httpError.method)    // 'GET'
    console.log('URL:', httpError.url)               // '/api/users/123'
    console.log('Status:', httpError.statusCode) // 404
    console.log('Response:', httpError.responseData)

    // JSON format output
    console.log(httpError.toJSONString(true))

    throw httpError
  }
}
```

### Fetch API Error Handling

```typescript
import {
  build,
  createCatcherNormalizer,
  fetchResponseResolver
} from '@fastkit/catcher'

// Custom Fetch error extraction function
const extractFetchError = (source: unknown) => {
  if (source instanceof Response) {
    return { response: source }
  }

  // Custom error format
  if (source instanceof Error && 'response' in source) {
    return {
      name: source.name,
      message: source.message,
      stack: source.stack,
      response: (source as any).response as Response
    }
  }
}

// Normalizer for Fetch errors
//
// Return only what you want to travel with the error. Whatever you return here
// is what `toJSON()` emits and what ends up in your logs; `resolvedData` itself
// is never serialized. See "Choosing what the normalizer returns" below.
const fetchNormalizer = createCatcherNormalizer((resolvedData) => (exceptionInfo) => {
  const { fetchError } = resolvedData

  if (fetchError) {
    const { response } = fetchError
    return {
      // The body is only there when the instance was built with `fromAsync`.
      message: response.bodyRead
        ? (response.json?.message ?? response.statusText)
        : (fetchError.message || `HTTP ${response.status} Error`),
      status: response.status,
      type: 'FETCH_ERROR'
    }
  }

  return {
    message: 'A network error occurred',
    type: 'NETWORK_ERROR'
  }
})

// Creating Fetch catcher
const FetchCatcher = build({
  resolvers: [fetchResponseResolver(extractFetchError)],
  normalizer: fetchNormalizer,
  defaultName: 'FetchError'
})

// Custom fetch function
async function safeFetch(url: string, options?: RequestInit) {
  try {
    const response = await fetch(url, options)

    if (!response.ok) {
      // Throw response error as exception
      throw response
    }

    return response
  } catch (error) {
    // `fromAsync`, not `from`: a `Response` hands out its body through a
    // promise and no other way, so this is what lets the normalizer above see
    // `response.json`. The resolver never takes the body from you -- it reads
    // a clone, and `response.json()` still works afterwards.
    const fetchError = await FetchCatcher.fromAsync(error)

    console.log('Fetch error:', fetchError.message)
    console.log('Status:', fetchError.status)

    throw fetchError
  }
}

// Usage example
async function loadApiData() {
  try {
    const response = await safeFetch('/api/data')
    return await response.json()
  } catch (error) {
    if (error.type === 'FETCH_ERROR') {
      console.error('API call failed:', error.message)
    }
    throw error
  }
}
```

#### `from` vs `fromAsync`

| | `from` / `create` | `fromAsync` / `createAsync` |
| --- | --- | --- |
| Returns | the instance | a promise of the instance |
| `response.bodyRead` | `false` | `true` |
| `response.json` / `.text` | not on the type | available |

Everything else — status, statusText, url, headers, ok, redirected, type — is
reported either way, because a `Response` gives those up synchronously.

`bodyRead` is a discriminant, so the body is only in scope once you have
narrowed on it:

```typescript
if (response.bodyRead) {
  response.json // only here
}
```

#### Choosing what the normalizer returns

A catcher has two layers, and the normalizer is the boundary between them:

| | holds | serialized by `toJSON()` |
| --- | --- | --- |
| `resolvedData` (resolver output) | everything the resolvers extracted | **no** |
| `data` (normalizer output) | what you returned | **yes** |

So a resolver is free to carry the whole response, and you decide what leaves
the process. Copy from it deliberately rather than spreading it: a response
carries `set-cookie` (session and refresh tokens — and a 401 is exactly when
they get rotated), a `url` that may hold a signed-URL signature or a `?token=`,
and a body that may hold much more than the message you were after.

```typescript
// Fine: a code and a message.
return { status: response.status, message: response.json?.message }

// Puts the session cookie, the signed URL and the whole body wherever this
// error is logged.
return { ...response }
```

If you do want a header, name it:

```typescript
return { requestId: response.headers['x-request-id'] }
```

### Multiple Resolvers and Error History Management

```typescript
import {
  build,
  createCatcherResolver,
  createCatcherNormalizer,
  axiosErrorResolver,
  fetchResponseResolver
} from '@fastkit/catcher'

// Generic error resolver
const genericErrorResolver = createCatcherResolver((source, ctx) => {
  if (typeof source === 'string') {
    return { errorMessage: source }
  }

  if (source && typeof source === 'object' && 'message' in source) {
    return { errorMessage: String(source.message) }
  }
})

// Unified normalizer
const unifiedNormalizer = createCatcherNormalizer((resolvedData) => (exceptionInfo) => {
  // For Axios errors
  if (resolvedData.axiosError) {
    return {
      type: 'HTTP_ERROR',
      message: resolvedData.axiosError.message,
      statusCode: resolvedData.axiosError.response?.status,
      url: resolvedData.axiosError.config.url,
      method: resolvedData.axiosError.config.method
    }
  }

  // For Fetch errors
  if (resolvedData.fetchError) {
    return {
      type: 'FETCH_ERROR',
      message: `HTTP ${resolvedData.fetchError.response.status}`,
      statusCode: resolvedData.fetchError.response.status,
      url: resolvedData.fetchError.response.url
    }
  }

  // For Native errors
  if (resolvedData.nativeError) {
    return {
      type: 'NATIVE_ERROR',
      message: resolvedData.nativeError.message,
      name: resolvedData.nativeError.name,
      stack: resolvedData.nativeError.stack
    }
  }

  // For generic errors
  if (resolvedData.errorMessage) {
    return {
      type: 'GENERIC_ERROR',
      message: resolvedData.errorMessage
    }
  }

  return {
    type: 'UNKNOWN_ERROR',
    message: 'An unknown error occurred'
  }
})

// Creating unified catcher
const UnifiedCatcher = build({
  resolvers: [
    axiosErrorResolver,
    fetchResponseResolver(),
    genericErrorResolver
  ],
  normalizer: unifiedNormalizer,
  defaultName: 'UnifiedError'
})

// Error processing chain
async function processWithErrorHandling() {
  try {
    // Some processing
    throw new Error('Processing failed')
  } catch (originalError) {
    const primaryError = UnifiedCatcher.from(originalError)

    try {
      // Retry processing
      throw new Error('Retry also failed')
    } catch (retryError) {
      // Create new error while preserving original error information
      const finalError = UnifiedCatcher.from(retryError, {
        message: 'All processing failed',
        originalError: primaryError.message
      })

      // Check error history
      console.log('Error history:')
      finalError.histories.forEach((history, index) => {
        console.log(`  ${index + 1}. ${history.message}`)
      })

      // Get all messages
      console.log('All messages:', finalError.messages)

      throw finalError
    }
  }
}
```

### Utilizing Utility Functions

```typescript
import { isCatcher, isCatcherData } from '@fastkit/catcher'

// Error determination example
function handleAnyError(error: unknown) {
  if (isCatcher(error)) {
    console.log('Catcher error:', error.type)
    console.log('Detailed information:', error.toJSONString(true))
    return
  }

  if (error instanceof Error) {
    console.log('Native error:', error.message)
    return
  }

  console.log('Other error:', error)
}

// Data restoration example
function restoreErrorFromData(data: unknown) {
  if (isCatcherData(data)) {
    // Restore from catcher data
    const restoredError = UnifiedCatcher.from(data)
    return restoredError
  }

  throw new Error('Not valid catcher data')
}

// JSON save/restore example
function saveAndRestoreError() {
  try {
    throw new Error('Test error')
  } catch (originalError) {
    const caughtError = UnifiedCatcher.from(originalError)

    // Save as JSON string
    const jsonString = caughtError.toJSONString()
    console.log('JSON for saving:', jsonString)

    // Restore from JSON string
    const parsedData = JSON.parse(jsonString)
    const restoredError = restoreErrorFromData(parsedData)

    console.log('Restored error:', restoredError.message)
    console.log('Same as original error?:', caughtError.message === restoredError.message)
  }
}
```

## API Specification

### `build` Function

```typescript
function build<
  Resolvers extends AnyResolvers,
  Normalizer extends AnyNormalizer<Resolvers>
>(
  opts: CatcherBuilderOptions<Resolvers, Normalizer>
): CatcherConstructor<Resolvers, Normalizer>
```

Generates a catcher class.

#### Options

```typescript
interface CatcherBuilderOptions<Resolvers, Normalizer> {
  // Default error name
  defaultName?: string

  // Resolver array
  resolvers?: Resolvers

  // Normalizer function
  normalizer: Normalizer
}
```

### `createCatcherResolver` Function

```typescript
function createCatcherResolver<Resolver extends AnyResolver>(
  resolver: Resolver
): Resolver
```

Creates a custom resolver.

### `createCatcherNormalizer` Function

```typescript
function createCatcherNormalizer<
  Normalizer extends AnyNormalizer<Resolvers>,
  Resolvers extends AnyResolvers
>(
  normalizer: Normalizer,
  _resolvers?: Resolvers
): Normalizer
```

Creates a custom normalizer.

### Catcher Instance

```typescript
interface Catcher<Resolvers, T> extends Error {
  // Catcher flag
  readonly isCatcher: true

  // Processed data
  readonly data: CatcherData<T>

  // Data extracted by resolvers
  readonly resolvedData: ResolvedCatcherData<Resolvers>

  // Original source error (only when overridden)
  readonly source?: Catcher<Resolvers, T>

  // Error history
  readonly histories: Catcher<Resolvers, T>[]

  // All messages
  readonly messages: string[]

  // JSON output
  toJSON(): ErrorImplements & CatcherData<T> & { messages: string[] }

  // JSON string output
  toJSONString(indent?: number | boolean): string
}
```

Instances are created through the constructor it was built with:

```typescript
Catcher.create(errorInfo)          // from error information
Catcher.from(unknownException)     // from anything, normalized

// The same two, awaiting every resolver first. Needed whenever a resolver
// reaches for something only a promise can give -- a `Response` body.
await Catcher.createAsync(errorInfo)
await Catcher.fromAsync(unknownException)
```

### Built-in Resolvers

#### `nativeErrorResolver`
Processes native Error objects.

#### `axiosErrorResolver`
Processes Axios errors and extracts detailed HTTP request/response information.

#### `fetchResponseResolver`
Processes Fetch API response errors. Build the instance with `fromAsync` /
`createAsync` to include the response body — see
[Fetch API Error Handling](#fetch-api-error-handling).

### Utility Functions

```typescript
// Catcher instance determination
function isCatcher(source: unknown): source is Catcher

// Catcher data determination
function isCatcherData<T extends Catcher>(source: unknown): source is T['data']
```

## Considerations

### TypeScript Considerations
- Accurately define types for resolvers and normalizers
- Ensure return value types are properly inferred
- Properly implement type guards for custom error types

### Performance Considerations
- Be mindful of memory usage from history management in environments with high error volumes
- Consider processing costs for complex resolver chains
- Be aware of circular references during JSON serialization

### Error Handling
- Exceptions within resolvers are handled appropriately
- Exceptions in normalizers affect catcher generation itself
- Maintain compatibility against error format changes in external libraries

## License

MIT

## Related Packages

- [@fastkit/helpers](../helpers/README.md): Basic utility functions
