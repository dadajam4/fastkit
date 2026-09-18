---
'@fastkit/tiny-logger': minor
---

Declare what `createTinyError` returns, instead of letting it be inferred.

It returns a class expression extending `Error`, so the inferred type carried `Error`'s **static** side — which `@types/node` augments with `prepareStackTrace(err, stackTraces: NodeJS.CallSite[])`. That expansion reached the published declarations, so they referenced `NodeJS.CallSite` even though `@fastkit/tiny-logger` runs in a browser as readily as in Node and declares no Node types.

The return type is now the exported `TinyErrorConstructor`, producing an exported `TinyError`. Both are named in the declarations rather than expanded inline, and nothing in the package's types mentions `NodeJS` any more.

**What can change for you:** the returned value's type no longer carries `Error`'s statics (`captureStackTrace`, `stackTraceLimit`, …). They still exist at runtime — the class is unchanged — but reading them off the constructor's *type* now needs a cast. `new MyError(...)`, `instanceof` and subclassing are unaffected.
