---
'@fastkit/catcher': minor
---

Add `match`, so a normalizer dispatches on the kind of exception rather than on which fields happen to exist.

Written by hand a normalizer is a chain of optional access, and its shape ends up dominated by "does this field exist":

```ts
normalizer: (resolved) => () => ({
  message: resolved.fetchError?.response.bodyRead
    ? (resolved.fetchError.response.json?.message ??
       resolved.fetchError.response.statusText)
    : resolved.fetchError?.response.statusText,
  status: resolved.fetchError?.response.status,
});
```

`match` hands each branch its slice, already narrowed:

```ts
const resolvers = [fetchResponseResolver()];

const AppError = build({
  resolvers,
  defaultMessage: 'Something went wrong',
  normalizer: match(resolvers, {
    fetchError: ({ response }) => ({
      code: 'HTTP_ERROR',
      message: response.bodyRead
        ? (response.json?.message ?? response.statusText)
        : response.statusText,
      status: response.status,
    }),
    nativeError: (e) => ({ code: 'UNEXPECTED', message: e.message }),
    default: () => ({ code: 'UNKNOWN', message: 'Something went wrong' }),
  }),
});
```

**The branches are ordered, not exclusive**, and that is the thing to know before writing one. They are tried in the order written, the first whose key is present wins, and `default` is always last wherever you put it. They have to be ordered because `nativeErrorResolver` runs in front of your list and never declines an `Error`, so a fetch error arrives carrying both keys — a `nativeError` branch matches almost everything and belongs last. Listing it earlier makes every branch after it dead, and development warns when you do.

**The branch return types are merged rather than left as a union.** A field is required on the result when every branch produces it and optional when only some do, so `err.status` reads as `number | undefined` instead of being an error on a union whose other member has no `status`. That is what `default` being required buys: without a total dispatch there is always a path producing nothing, and no field can be promised. Declare `message` in every branch and it is guaranteed at the type level, with `defaultMessage` covering the runtime half.

**The resolvers are passed again because they are the only way to type the slices.** Written as `match({ ... })` the branch parameters fall back to `any`, taking the narrowing with them — measured, not assumed. Nothing reads the array at runtime.
