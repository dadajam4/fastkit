---
'@fastkit/catcher': minor
---

Let `fetchResponseResolver` use a body the error already carries, and say where the body it reports came from.

An application that throws its own error for a failed fetch usually reads the body first, because it needs it to build the error's message:

```ts
class ApiResponseError extends Error {
  readonly response: Response;
  readonly body: unknown; // already parsed
}
```

The body is then consumed, so the resolver could not read it again — `clone()` throws on a disturbed body — and reported `text: ''`, `json: null`. The message survived, because the error's own message was built from the body, but the structured part did not:

```
{"message":"That item is gone.","code":"ITEM_GONE","errors":[{"field":"id"}]}
        -> code and errors[] were invisible to the resolver
```

`code` and the field-level errors are the part worth normalizing, and an application in this shape therefore could not use the built-in resolver at all. `ExtractedFetchError` now takes a `body`, used as-is when present:

```ts
fetchResponseResolver((source) =>
  source instanceof ApiResponseError
    ? { response: source.response, body: source.body }
    : undefined,
);
```

The built-in extract function picks up a `body` sitting next to a `response` on the error, so that shape often needs no custom extract at all. A body that arrives this way needs no `await`, so `from` is enough where `fromAsync` would otherwise be required.

**`bodyState` says where a body came from, or why there is none.** `bodyRead` answers "can I look at it"; this answers the rest:

| `bodyState` | `bodyRead` | |
| --- | --- | --- |
| `'unread'` | `false` | nothing was attempted — a synchronous entry point cannot wait for a body |
| `'read'` | `true` | read off the wire |
| `'unavailable'` | `true` | reading was attempted and could not happen: already consumed or locked |
| `'provided'` | `true` | handed over by the application |

The middle two used to be indistinguishable — both `text: ''`, `json: null` — which left a server that genuinely sent nothing looking exactly like a body the resolver could not reach. When an error report says the body was empty, that difference is whether to suspect the server or your own code.

`bodyRead` keeps its meaning and its place as the discriminant, so narrowing still works unchanged. It is derived from `bodyState` and kept anyway, the way `Response.ok` is kept beside `Response.status`.
