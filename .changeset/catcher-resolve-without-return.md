---
'@fastkit/catcher': patch
---

Fix `ctx.resolve()` being ignored when the resolver returns nothing.

The check that stops the later resolvers sat inside the branch that merges a result, so a resolver had to both claim the exception *and* have something to extract for the claim to hold:

```ts
const claimOnly = createCatcherResolver((source, ctx) => {
  if (!isMine(source)) return;
  ctx.resolve(); // "this one is mine, nobody after me needs to look"
  // ...and nothing worth extracting
});
```

Every resolver after it ran anyway. "This is mine and there is nothing in it worth reporting" is a legitimate thing for a resolver to say, and the documented meaning of `resolve()` never mentioned a return value.

The stop is now honoured either way, on both the synchronous and the awaiting pass.
