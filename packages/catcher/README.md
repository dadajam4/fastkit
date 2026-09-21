
# @fastkit/catcher

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/catcher/README-ja.md)

A custom class library for implementing type-safe exception handling within applications. Provides unified processing of various exception types (Native Error, Axios Error, Fetch Error) while maintaining type safety and offering detailed error information extraction and normalization.

## Why

You want to write the happy path. Errors still have to be handled properly, but that work should not be smeared across every feature that makes a request.

So decide, once and application-wide, how an exception is recognised and what an error looks like when it comes out. After that a feature throws whatever it caught, and whoever handles it reads a schema rather than re-deriving the same thing:

```typescript
// Without. Every feature reimplements the same guesswork, slightly differently.
catch (e) {
  if (axios.isAxiosError(e)) {
    message = e.response?.data?.message ?? e.message
    status = e.response?.status
  } else if (e instanceof Response) {
    message = e.statusText
    status = e.status
  } else if (e instanceof Error) {
    message = e.message
  } else {
    message = String(e)
  }
}
```

```typescript
// With. Declared once, in one file.
export const AppError = build({
  resolvers: [axiosErrorResolver, fetchResponseResolver()],
  normalizer: (resolved) => () => ({
    message: resolved.fetchError?.response.statusText ?? 'Something went wrong',
    status: resolved.fetchError?.response.status,
    code: 'APP_ERROR'
  })
})

// Every feature, from then on.
throw await AppError.fromAsync(e)
```

What that buys you:

- **`from` takes anything.** `unknown`, an `Error`, a `Response`, an axios error, or a catcher you already built. A feature does not have to know which it caught, and does not have to branch to find out.
- **One place defines the shape.** Resolvers say how each kind of exception is recognised and what is worth pulling out of it; the normalizer says what an error looks like in your application. Add a resolver and every call site gains it.
- **Reading it is type-safe.** `err.status` is typed from the normalizer's return type. No `(e as any).response?.data?.message`, and no field that exists on one error kind and silently not on another.
- **One place decides what gets reported.** See [The two layers](#the-two-layers) below — a resolver may hold everything it found, and only what the normalizer returns is serialized.
- **The original is still there.** `resolvedData` keeps what the resolvers extracted, so the normalized shape is the default rather than a ceiling.

An instance is a real `Error`, so `throw` it, `catch` it, and let it cross frameworks as usual.

## The two layers

This is the one thing worth knowing before anything else, because it decides where you put things and what ends up in your logs.

| | holds | serialized by `toJSON()` |
| --- | --- | --- |
| `resolvedData` — what the **resolvers** extracted | everything they found | **no** |
| `data` — what the **normalizer** returned | what you chose | **yes** |

**The normalizer is the boundary.** A resolver may hold the whole response — headers, url, body — because none of it leaves on its own. Only what the normalizer returns is serialized, so "what this application calls an error" and "what is safe to log" are one decision, made once.

```typescript
const err = await AppError.fromAsync(response)

err.toJSONString()
// {"code":"HTTP_ERROR","message":"That item is gone.","status":404, ...}
// ...and nothing else. The set-cookie, the url and the raw body stayed behind.

err.resolvedData.fetchError.response.headers['set-cookie']
// still here, for a normalizer that wants it
```

So copy from `resolvedData` deliberately rather than spreading it. A response carries `set-cookie` (session and refresh tokens — and a 401 is exactly when those get rotated), a `url` that may hold a signed-URL signature, and a body that may hold much more than the message you were after.

```typescript
// Fine: a code and a message.
return { code: 'HTTP_ERROR', message: response.json?.message }

// Puts the session cookie, the signed URL and the whole body wherever this
// error is logged.
return { ...response }
```

## Guaranteeing a message

Set `defaultMessage`. Without it there is no guarantee that a catcher has one, and the failure is quiet rather than loud:

```typescript
const AppError = build({ normalizer: () => () => ({ code: 'APP_ERROR' }) })

const err = AppError.from('just a string')  // nothing recognised it
err.message                                 // ''
err.toJSONString()                          // {"code":"APP_ERROR","message":"", ...}
```

An instance is a real `Error`, and an `Error` is born with an empty message. So a normalizer that returned no `message` for an exception it did not recognise does not leave the field out — it leaves an empty one, which reads like a message rather than the absence of one.

`defaultMessage` is the last word, applied after the normalizer and after the exception's own message:

```typescript
const AppError = build({
  defaultName: 'AppError',
  defaultMessage: 'Something went wrong',
  normalizer: () => () => ({ code: 'APP_ERROR' }),
})

AppError.from('just a string').message   // 'Something went wrong'
AppError.from(new Error('real')).message // 'real' — never displaced
```

The string is not this package's to choose, because it is what a user may end up reading, so there is no default. Development warns once per catcher when an instance is built without a message and `defaultMessage` is unset.

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

## Writing a resolver

A resolver answers one question: *is this exception mine, and if so what is worth pulling out of it?* Return an object, which is merged into `resolvedData` for the normalizer, or nothing to decline.

```typescript
const apiErrorResolver = createCatcherResolver((source, ctx) => {
  if (!isAPIError(source)) return // not mine

  ctx.resolve() // ...and nobody after me needs to look
  return { apiError: { code: source.code, status: source.statusCode } }
})
```

`createCatcherResolver` is an identity function. It exists so the argument types are inferred and the return type is carried through to `resolvedData` and the normalizer.

### The order they run in

`nativeErrorResolver` is put in front of your list, and it never declines an `Error`.

| what you write | what runs |
| --- | --- |
| `resolvers: [a, b]` | `nativeErrorResolver`, `a`, `b` |
| `resolvers: [a, nativeErrorResolver, b]` | `a`, `nativeErrorResolver`, `b` |

Naming it yourself is how you move it: a list that already contains it is taken as given. `build` never rewrites the array you pass, so one `const resolvers` can be shared between two catchers.

So by the time your resolver runs, `ctx.resolvedData` already holds `nativeError` for anything that is an `Error`, and is empty for anything that is not.

**Two resolvers matching the same exception is the normal case, not an edge case.** A fetch error carries both `fetchError` and `nativeError`, because the native resolver ran first and did not decline it.

### Merging, and `ctx.resolve()`

Results are merged in order, so a later resolver overwrites the keys of an earlier one and leaves the rest:

```typescript
// a returns { who: 'a', onlyA: 1 }, then b returns { who: 'b' }
resolvedData // { nativeError, who: 'b', onlyA: 1 }
```

Namespacing what you return under one key — `{ apiError: { ... } }` rather than `{ code, status }` — keeps two resolvers from silently overwriting each other's fields.

`ctx.resolve()` stops the resolvers after you. It is optional: leaving it uncalled means everyone still gets a turn, which is what you want when your resolver adds a facet of the exception rather than claiming it. It holds whether or not you return anything — "this one is mine and nobody after me needs to look" is just as sayable by a resolver that recognised the exception and found nothing in it worth extracting.

### Returning a promise

Only when `ctx.canAwait` is `true`. A synchronous entry point has nowhere to await — an instance is an `Error` that has to exist by the time it is thrown — so a promise returned there is discarded, along with whatever it would have produced.

A resolver that can reach further when awaited therefore has two paths, and says on the synchronous one what that cost:

```typescript
const myResolver = createCatcherResolver((source, ctx) => {
  const extracted = extract(source)
  if (!extracted) return

  if (!ctx.canAwait) {
    ctx.degraded?.('response body')
    return { myError: metaOf(extracted) }
  }

  return readBody(extracted).then((body) => ({
    myError: { ...metaOf(extracted), body },
  }))
})
```

`ctx.degraded()` is a no-op when `ctx.canAwait` is `true`, so it needs no guard of its own. It is what lets the warning name the thing that was lost instead of guessing that something might have been. It is optional on the type only so that a hand-built context still compiles; a catcher always supplies it.

### Do not throw

A resolver runs while an error is being described, and must not replace it with one of its own — whoever is handling the original exception would get a `TypeError` from inside this package instead of the thing they caught.

One that throws anyway is skipped, the resolvers after it still get their turn, and development is told:

```
[@fastkit/catcher] A resolver threw while describing an exception, and was skipped.
  TypeError: Cannot read properties of undefined (reading 'data')
  The exception being described is unaffected -- fix the resolver.
```

A resolver that threw is treated as having contributed nothing, and that includes its `ctx.resolve()`: one failed run does not get to silence every resolver after it. This is a safety net rather than a licence — the warning is where you find out.

### Which entry point

| | second argument to the normalizer | takes overrides | awaits resolvers |
| --- | --- | --- | --- |
| `create(info)` | `info` | no | no |
| `from(e, overrides?)` | `undefined` | yes | no |
| `createAsync(info)` | `info` | no | yes |
| `fromAsync(e, overrides?)` | `undefined` | yes | yes |

`from` is for something you caught and do not recognise: the normalizer works from what the resolvers extracted, and that is the usual case. `create` is for an error you are constructing deliberately from your own payload, which the normalizer's second stage then sees in full.

`fromAsync` / `createAsync` are the same two, awaiting every resolver first. Prefer them wherever you can await — see [`from` vs `fromAsync`](#from-vs-fromasync).

## Testing a resolver

Testing a resolver should not mean building a context by hand — that couples your tests to the shape of a type you do not own, and leaves `ctx.resolve()` and `ctx.degraded()` unobservable.

```typescript
import { runResolver } from '@fastkit/catcher/testing'

const { data, resolved, degraded } = await runResolver(apiErrorResolver, apiError)

data?.apiError.code // what the resolver returned, or undefined if it declined
resolved            // whether it called ctx.resolve()
degraded            // what it reported through ctx.degraded()
```

Always asynchronous, whether or not the resolver is, so one `await` covers both kinds. Two options shape the run:

| option | default | what it is for |
| --- | --- | --- |
| `canAwait` | `true` | The value of `ctx.canAwait`. Set `false` to exercise the path the synchronous entry points take. |
| `resolvedData` | `{}` | What earlier resolvers left behind. Inside a real catcher this is never empty for an `Error`, since `nativeErrorResolver` runs first. |

```typescript
// The synchronous path, and what it admits to losing
const sync = await runResolver(fetchResponseResolver(), err, { canAwait: false })
sync.degraded // ['response body']
```

It runs the one resolver you give it and nothing else, which is what `resolvedData` is for.

It is published on its own path, so it never reaches an application bundle through the main entry.

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

#### Keeping the choice in one place

`from` and `fromAsync` differ in what they can reach, not in what they mean, and picking the wrong one loses the body silently. Write one helper where the choice belongs and call that everywhere:

```typescript
// One file, application-wide.
export const toAppError = (e: unknown) => AppError.fromAsync(e)

// Every feature.
catch (e) {
  throw await toAppError(e)
}
```

`from` is then left for what it is good at: an error boundary that cannot await, where the response metadata is all there is to report anyway.

Where the choice cannot be confined — a `from` called directly — development says so rather than letting it pass:

```
[@fastkit/catcher] A resolver could not wait for: response body.
  Use `await AppError.fromAsync(e)` where you can await.
```

The resolver reports this, through `ctx.degraded()`, so it appears only when something really was within reach and could not be taken. A catcher that merely *holds* `fetchResponseResolver` stays quiet for every exception that resolver never matched.

#### What to return from the normalizer

See [The two layers](#the-two-layers). A response is exactly the kind of thing worth copying from deliberately: `set-cookie`, a `url` that may carry a signed-URL signature, and a body that may hold more than the message you were after.

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

  // Message used when nothing else produced one.
  // See [Guaranteeing a message](#guaranteeing-a-message).
  defaultMessage?: string

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

Creates a custom resolver. See [Writing a resolver](#writing-a-resolver) for the contract it has to keep.

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

### `runResolver` Function

Published as `@fastkit/catcher/testing`, so it stays out of application bundles.

```typescript
function runResolver<Resolver extends AnyResolver>(
  resolver: Resolver,
  source: unknown,
  options?: {
    canAwait?: boolean      // default: true
    resolvedData?: AnyData  // default: {}
  }
): Promise<{
  data: ResolverOutput<Resolver> | undefined
  resolved: boolean
  degraded: string[]
}>
```

Runs a single resolver over an exception. See [Testing a resolver](#testing-a-resolver).

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
