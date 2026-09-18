---
'@fastkit/catcher': minor
---

Stop naming `axios` in the published types, so the optional peer is genuinely optional.

`axios` is declared as an optional peer and the runtime never imported it — an axios error is recognised by the `isAxiosError` marker it carries. The **declarations** imported it unconditionally:

```ts
import { AxiosError, AxiosRequestConfig } from "axios";
```

A declaration file has no notion of an optional import, so TypeScript had to resolve `axios` to check the file. Consumers without it got `TS2307: Cannot find module 'axios'`, and consumers with `skipLibCheck: true` got quietly unchecked members — a normalizer reading `axiosError.response?.data` was going unvalidated.

The two types are now structural, so nothing in the package names the module:

- `toAxiosErrorInfo()` accepts a new exported `AxiosErrorLike` — the part of an axios error the resolver actually reads. TypeScript is structural, so a real `AxiosError` still satisfies it and callers pass one unchanged (verified against `axios@1.18.1`).
- `SerializableAxiosRequestConfig` declares its 15 fields directly instead of `Pick<AxiosRequestConfig, …>`, mirroring axios field by field: `method` keeps the HTTP-method union plus `(string & {})` exactly as axios' `StringLiteralsOrString<Method>` allows, `responseType` keeps its seven literals, `proxy` keeps its shape. `headers` is `any` — it describes the object *after* the copy, where the value may be a plain object or an `AxiosHeaders` instance, and `SerializableAxiosResponse` already types `data` and `headers` that way.

A type-level test keeps the mirrored shapes honest: `axios` stays a devDependency here, and `pnpm typecheck` asserts that `method`, `responseType`, `proxy`, `timeout` and `socketPath` are still mutually assignable with axios' own, and that a real `AxiosError` still satisfies `AxiosErrorLike`. If axios changes one of them, the build says so instead of the types drifting quietly.

**The `axios` optional peer declaration is removed**, since nothing references the module any more. It also claimed `^1.6.0` while the duck-typing works with any axios that sets `isAxiosError`.

**What can change for you:**

- Without axios — the types resolve for the first time. Code reading members that do not exist on `AxiosErrorInfo` starts reporting errors instead of passing silently.
- With axios — `config.headers` is now `any` rather than axios' own header union, because after the copy it may be a plain object or an `AxiosHeaders` instance. `method`, `responseType` and `proxy` keep their unions and shapes, composed the way axios composes them, so completion still works.
