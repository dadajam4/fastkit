# Server entry

🌐 English | [日本語](./server-entry-ja.md)

A **server entry** declares the server-side runtime surface of a vot
application: the host and port it listens on, its proxy rules, and any
middleware it mounts.

`vot dev` and `vot serve` both read it, and `vot build` bundles it into
`dist/server`.

## Production dependencies

`vot serve` reads the bundled entry, so serving a prebuilt app touches nothing
outside `dist/`. The application can run with `dependencies` only:

```dockerfile
RUN pnpm install --prod
CMD ["vot", "serve"]
```

Without an entry, `vot serve` resolves the project's Vite config at startup
instead. That evaluates `vite.config.ts` and every plugin it imports, so all of
them have to be installed in the production runtime even though none of them do
any work while serving:

```
> vot serve
vite.config.ts (3:30) [UNRESOLVED_IMPORT] Could not resolve '@fastkit/vite-plugin-vui'
failed to load config from /app/packages/admin-front/vite.config.ts
```

## Quick start

Create `vot.server.ts` at the project root. No configuration is needed -- vot
picks it up by convention.

```ts
// vot.server.ts
import { defineVotServer } from '@fastkit/vot/server';

export default defineVotServer({
  host: '0.0.0.0',
  port: 3000,
  proxy: {
    '/api': 'http://localhost:8080',
  },
  configureServer({ app }) {
    app.get('/healthcheck', (c) => c.body(null, 200));
  },
});
```

These settings belong to the entry alone. Setting `server.host`, `server.port`,
`server.proxy` or `votPlugin({ configureServer })` in `vite.config.ts` as well
is not an error, but vot warns about it -- see [Precedence](#precedence).

## Reading the environment at startup

Pass a function to read values from the machine that **runs** the app rather
than the one that built it. The function is evaluated at startup, and it may be
`async`.

```ts
import { defineVotServer } from '@fastkit/vot/server';

export default defineVotServer(({ command, dev, mode }) => ({
  host: '0.0.0.0',
  port: dev ? 3000 : Number(process.env.PORT ?? 8080),
  proxy: dev ? { '/api': 'http://localhost:8080' } : undefined,
}));
```

`vot build` bundles the entry rather than evaluating it, so `process.env.PORT`
is never baked into the artifact and a build machine that lacks it still
produces a working one.

### Context

| Property  | Type               | Description                                |
| --------- | ------------------ | ------------------------------------------ |
| `command` | `'dev' \| 'serve'` | Which command is evaluating the entry      |
| `dev`     | `boolean`          | `command === 'dev'`                        |
| `mode`    | `string`           | Vite mode (`development`, `production`, …) |

`build` and `generate` never appear: the entry is bundled, not evaluated, at
build time.

## Options

| Option            | Type                                      | Description                                                |
| ----------------- | ----------------------------------------- | ---------------------------------------------------------- |
| `host`            | `string \| boolean`                       | Hostname to listen on. `vot serve` defaults to `'0.0.0.0'`  |
| `port`            | `number`                                  | Port to listen on. Defaults to `3000`                       |
| `proxy`           | `Record<string, string \| VotProxyOptions>` | Proxy rules. Narrower than Vite's `server.proxy` -- see below |
| `configureServer` | `(ctx: { app }) => void \| Promise<void>` | Mount middleware on the adapter's app (`Hono` by default)   |
| `shutdownTimeout` | `number`                                  | Milliseconds a graceful shutdown waits for in-flight requests. Defaults to `10000` -- see below |

`base` is **not** an option. It is baked into the client bundle's asset URLs at
build time, so it belongs to `vite.config.ts`; `vot build` records the value in
`dist/server/package.json` for `vot serve` to mount its router on.

## Graceful shutdown

`vot serve` handles `SIGTERM` and `SIGINT`. It stops accepting connections, lets
the requests it has already accepted finish, and only then exits.

Idle keep-alive sockets are dropped as soon as the shutdown begins, and again as
each further request finishes. This is not an optimization -- Node keeps
answering `Connection: keep-alive` after `server.close()`, so a socket that goes
idle mid-drain is never released by the client in time, and a shutdown that only
called `close()` would hang until `SIGKILL` instead of draining.

Anything still in flight when `shutdownTimeout` runs out is forced shut.

```ts
export default defineVotServer({
  // Shorter than the platform's grace period, so that forcing still happens
  // before SIGKILL does.
  shutdownTimeout: 10_000,
});
```

The default of `10000` is deliberately below the 30s that Kubernetes and Docker
both use for their grace period: a timeout that expires at the same moment as
the grace period never gets to force anything. Raise it only alongside
`terminationGracePeriodSeconds` (or the equivalent). `0` forces immediately.

There is no environment variable for this. A server entry is evaluated at
startup, so it can read `process.env` itself:

```ts
export default defineVotServer({
  shutdownTimeout: Number(process.env.SHUTDOWN_TIMEOUT ?? 10_000),
});
```

`vot dev` has no equivalent, and needs none: there the listening socket belongs
to Vite, which closes it on `SIGTERM` itself.

## A custom path

```ts
votPlugin({
  server: { entry: './config/server.ts' },
});
```

An explicit path that does not exist is an error -- vot will not quietly fall
back to loading `vite.config.ts`.

Without this option, vot looks for `vot.server.{ts,mts,js,mjs}` at the project
root.

## Precedence

The entry wins over `vite.config.ts`, in dev as well as in production, and vot
warns when the same key is set in both places:

```
[vot] `server.port` is set in both vite.config.ts and vot.server.ts.
      The server entry wins -- remove the one in vite.config.ts.
```

The entry has to win. If `vite.config.ts` won in dev, a project could end up
with `vot dev` and `vot serve` listening on different ports.

`votPlugin({ configureServer })` is also still read. If both it and the entry
define one, **both run** -- `votPlugin()` first -- and vot warns.

## Build output

`vot build` writes the bundled entry next to the SSR bundle and records it:

```
dist/
├── client/
└── server/
    ├── main.js          # SSR bundle
    ├── vot.server.js    # bundled server entry
    └── package.json     # { "base": "/", "server": { "entry": "vot.server.js" } }
```

`vot serve` reads `dist/server/package.json`, and the presence of `server.entry`
is what makes it skip `vite.config.ts`.

Keep the entry thin. It is bundled separately from the SSR bundle, so anything
it imports is duplicated into `vot.server.js`.

## Applications without an entry

`vot serve` falls back to `loadConfigFromFile()` and takes `server` and
`votPlugin({ configureServer })` from `vite.config.ts`. This is the path that
requires the build-time plugins in production, and it is the only reason
`vot serve` imports `vite` at all. It is expected to be removed in a future
major version.

## Proxy rules

Forwarding is done over `fetch`, so a rule carries `target`, `changeOrigin`,
`rewrite`, `headers` and `ws` -- and nothing else.

Vite's `configure` and `bypass` are absent: one hands out the `http-proxy`
instance and the other the Node request and response, and neither has a `fetch`
equivalent. Keeping them would let `vot dev` and `vot serve` drift apart, which
is the one thing this entry exists to prevent. `secure` is absent for a related
reason -- there is no standard way to turn off TLS verification for a `fetch`,
and declaring an option that quietly does nothing is worse than not having it.
Reach a self-signed upstream with `NODE_TLS_REJECT_UNAUTHORIZED=0` instead.

WebSocket forwarding (`ws: true`, or a `ws:` / `wss:` target) is a capability of
the adapter rather than of vot: the fetch model has no notion of an upgrade, so
each runtime has to do it with its own API. The default node adapter forwards
them; an adapter that cannot declares `supports.proxyWebSocket: false`, and vot
warns at startup rather than leaving a rule silently doing nothing.

## `base` and middleware

`configureServer` middleware and proxy rules are mounted at the server root --
outside `base` -- under both `vot dev` and `vot serve`:

| | `base: '/app/'` |
| --- | --- |
| `vot dev` | `/healthcheck` |
| `vot serve` | `/healthcheck` |

`base` is where the application's assets and routes live, and a health check, a
metrics endpoint or a webhook receiver is not part of that route tree. Keeping
them at the root is what makes the same source line answer at the same URL in
development and in production.

Static assets and the rendering route are still served under `base`.

Before `@fastkit/vot@1.6.0`, `vot serve` mounted both inside `base` while
`vot dev` mounted them at the root. Applications with the default `base: '/'`
are unaffected by the change.
