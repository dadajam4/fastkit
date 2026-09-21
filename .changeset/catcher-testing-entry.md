---
'@fastkit/catcher': minor
---

Add `@fastkit/catcher/testing`, so a resolver can be tested without hand-rolling a context.

Writing a resolver is how most applications use this package, and testing one meant reaching into the shape of `ResolverContext`:

```ts
// before
const result = myResolver(someError, { resolve() {}, resolvedData: {}, canAwait: true });
```

That couples every consumer's tests to a type they do not own, and leaves the parts that are not plain return values unobservable — whether the resolver called `ctx.resolve()`, and what it reported through `ctx.degraded()`.

```ts
import { runResolver } from '@fastkit/catcher/testing';

const { data, resolved, degraded } = await runResolver(myResolver, someError);

// ...and the path the synchronous entry points take
const sync = await runResolver(fetchResponseResolver(), err, { canAwait: false });
sync.degraded; // ['response body']
```

Always asynchronous, whether or not the resolver is, so one `await` covers both kinds. `canAwait` (default `true`) picks the path; `resolvedData` (default `{}`) seeds what earlier resolvers left behind — inside a real catcher that is never empty for an `Error`, since `nativeErrorResolver` runs first and always contributes.

It is a separate export path so it never reaches an application bundle through the main entry.
