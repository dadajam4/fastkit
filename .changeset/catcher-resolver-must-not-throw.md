---
'@fastkit/catcher': patch
---

Stop a resolver that throws from replacing the exception it was describing.

A resolver runs while an error is being handled. If it threw — one `?.` short of an unexpected payload shape is enough — the exception propagated out of `from()`, so the caller got a `TypeError` from inside this package instead of the API error they had caught. The package's own code says this must not happen, in the comment on `readBody`, but nothing enforced it for resolvers.

The resolver is now skipped, the resolvers after it still get their turn, the exception being described reaches the normalizer unharmed, and development is told:

```
[@fastkit/catcher] A resolver threw while describing an exception, and was skipped.
  TypeError: Cannot read properties of undefined (reading 'data')
  The exception being described is unaffected -- fix the resolver.
```

A resolver that threw is treated as having contributed nothing, and that includes its `ctx.resolve()`: one failed run does not get to silence every resolver after it.

This is a safety net rather than a licence, which is what the warning is for. The contract is now written down — see "Writing a resolver" in the README.
