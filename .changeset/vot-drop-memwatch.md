---
'@fastkit/vot': minor
---

Remove `vot serve --memwatch`.

The flag could not have worked. `createMemwatch()` did `const gc = getGc()`
against an `async` function without awaiting it, so `gc` was a `Promise` and the
`/__memwatch__/diff` route — the only reason the flag existed — threw
`TypeError: memwatch.gc is not a function` on its first request. The file had
barely changed since the initial commit, so this went unnoticed for a long time.

Repairing it was not worth doing. The two packages behind it were never declared
anywhere: `node-memwatcher` and `@airbnb/node-memwatch` were dynamic-imported
under a `MODULE_NOT_FOUND` guard, but `package.json` carried neither
`optionalDependencies` nor `peerDependenciesMeta` for them, in this version or
in any published one. `node-memwatcher` was last published in 2022, and
`@airbnb/node-memwatch` is a native addon — the opposite direction from the work
that made vot's core runtime-agnostic.

Everything it set out to do is in Node itself, with nothing to install and
nothing to compile: `v8.writeHeapSnapshot()`, `--heapsnapshot-signal`,
`--heapsnapshot-near-heap-limit`, `--heap-prof`, and GC entries from
`perf_hooks`. All of them reach `vot serve` through `NODE_OPTIONS`, because it
runs `serve()` in the same process as the bin.

The README gains an "Investigating memory in production" section covering that
route, including why a heap-snapshot endpoint is better left out of the
framework: a snapshot contains whatever is in memory at the time, including
session tokens and user data, and the authentication that should guard it
belongs to the application.

## Migration

Replace the flag with Node's own instrumentation:

```bash
# was: vot serve --memwatch
NODE_OPTIONS="--heapsnapshot-signal=SIGUSR2 --heapsnapshot-near-heap-limit=3" vot serve
```

`ServeOptions.memwatch` is gone from `@fastkit/vot/internal/serve` along with
it. Passing it did nothing that worked, so nothing that worked can break.

Closes #281.
