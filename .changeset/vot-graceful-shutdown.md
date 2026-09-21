---
'@fastkit/vot': minor
---

Shut `vot serve` down gracefully instead of dropping in-flight requests.

`vot serve` registered no signal handlers at all, and `bin/serve.mjs` discarded
the `ServedResult` that `serve()` returns — so the `close()` the node adapter
had implemented was unreachable. On `SIGTERM` the process died on the spot and
whatever was being rendered went with it. Every rolling deploy dropped requests,
showing up as a handful of 502s or truncated responses that are easy to blame on
the load balancer.

Nothing downstream could fix this: `configureServer` hands out the adapter's
`Hono` app, not the server, and `VotListenResult.native` never escaped the bin.

`vot serve` now handles `SIGTERM` and `SIGINT`, stops accepting connections,
lets accepted requests finish, and exits `128 + signal`.

## `close()` had to learn to drain

`server.close()` on its own is not a graceful shutdown — it waits for *every*
connection to end, and an idle keep-alive socket ends when the client decides
it should. Worse, **Node keeps answering `Connection: keep-alive` after
`close()` has been called**, so a socket that goes idle partway through the
drain is never released either. A shutdown that only called `close()` would not
drain at all; it would hang until `SIGKILL`.

So the adapter drops idle connections when the shutdown starts *and* as each
further request finishes, and forces the rest once the deadline passes.

## `shutdownTimeout`

```ts
export default defineVotServer({
  shutdownTimeout: 10_000, // default
});
```

The default is deliberately below the 30s grace period Kubernetes and Docker
both default to: a timeout that expires at the same moment as the grace period
never gets to force anything, because `SIGKILL` has already arrived. Raise it
only alongside `terminationGracePeriodSeconds`. `0` forces immediately.

There is no environment variable for it — a server entry is evaluated at startup
and can read `process.env` itself.

## `vot dev` is unchanged, on purpose

Vite's dev server installs its own `SIGTERM` handler whenever it is not in
middleware mode, which is how `vot dev` runs it. A second handler here would
race Vite's to `process.exit()`, so adding one would be a regression rather than
a fix.

Adapters other than the node one are unaffected in shape: `close()` is already
part of `VotListenResult`, so the bin-level handling covers any adapter that
implements `listen()`. `VotAdapterContext` gains an optional `shutdownTimeout`
for adapters that own a listening socket.

Closes #282.
