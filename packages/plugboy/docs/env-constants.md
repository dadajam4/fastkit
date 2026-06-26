# Env constants

🌐 English | [日本語](./env-constants-ja.md)

plugboy injects two build-time global constants into the packages it builds, so
you can guard development-only code (logs, warnings, assertions) in your source.

| Constant | `stub` (local dev) | `build` (published output) |
| --- | --- | --- |
| `__PLUGBOY_STUB__` | `true` | `false` (static literal) |
| `__PLUGBOY_DEV__` | `true` | runtime check of the **consumer's** env: `process.env.NODE_ENV === 'development'` \|\| `import.meta.env?.DEV === true` |

## Which one to use

- **`__PLUGBOY_STUB__`** — true only while plugboy runs your package in `stub`
  (source executed in place during local development of the package itself). In a
  real `build` it is the static literal `false`, so any `if (__PLUGBOY_STUB__)`
  block is **eliminated from the published output**. Use it for code that should
  never ship.

- **`__PLUGBOY_DEV__`** — true in `stub`, and in the published output it becomes a
  **runtime expression evaluated in the consumer's environment**. Use it for
  dev-only behavior that should activate when the *consumer* runs their app in
  development (e.g. helpful warnings). Because it resolves at runtime, the branch
  remains in the bundle; it is not dead-code-eliminated.

## Usage

```ts
if (__PLUGBOY_DEV__) {
  // Shown while developing this package (stub) AND when the consumer runs
  // their app in development.
  console.warn('[my-pkg] you passed a deprecated option');
}

if (__PLUGBOY_STUB__) {
  // Only while developing THIS package via `plugboy stub`. Stripped from the
  // published build.
}
```

## TypeScript

The global types ship from the `@fastkit/plugboy/env` subpath. Reference it once
(e.g. in a `*.d.ts` in your package) so the constants are typed:

```ts
/// <reference types="@fastkit/plugboy/env" />
```

Or add it to `tsconfig.json`:

```jsonc
{
  "compilerOptions": {
    "types": ["@fastkit/plugboy/env"]
  }
}
```
