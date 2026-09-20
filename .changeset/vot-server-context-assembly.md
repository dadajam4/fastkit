---
'@fastkit/vot': major
---

Replace Express with a swappable server adapter, and make the render core runtime-agnostic.

`vot serve` was an Express 4 application, and its proxy was backed by `http-proxy@1.18.1` — last published in 2020. Upgrading Express would have answered the EOL clock and nothing else: the larger problem was that **vot could not leave Node at all**, and the reason was in the public types rather than in Express. `VotContext.request` was an `IncomingMessage`, `RendererOptions` carried a `ServerResponse`, `configureServer` handed out connect's `use`, and the renderer refused to start without both Node objects.

## The shape

Three layers, and the core does not depend on Hono:

```
core (runtime-agnostic)    createVotRequestHandler()
                           (request: Request, runtime?) => Promise<Response | undefined>
         ↑ mounted last, as the catch-all
adapter (runtime-specific) static / proxy / listen / upgrade / user middleware
                           default: @fastkit/vot/adapters/node (Hono + @hono/node-server)
```

An adapter builds the application in the one order that matters — **proxy, user middleware, static, catch-all** — and reports what it can do, so vot can say at startup that a configured rule will not be honoured rather than letting it silently do nothing.

## `configureServer` receives the adapter's own app

vot does not invent a middleware abstraction to sit in front of Hono:

```ts
export default defineVotServer({
  port: 3000,
  proxy: { '/api': 'http://localhost:8080' },
  configureServer({ app }) {          // app: Hono
    app.get('/healthcheck', (c) => c.body(null, 200));
  },
});
```

`vot dev` and `vot serve` now build the **same** application through the same adapter, which is the only way that promise holds.

## Web-standard render context

```ts
export interface VotContext {
  request?: Request;
  response?: PageResponseDraft;  // { status?, statusText?, headers: Headers }
  runtime?: VotRuntimeContext;   // { adapter: string; native?: unknown }
}
```

`node:http` is gone from the core's published types and its published runtime, and an audit (`pnpm audit:deps`) fails the build if either comes back — a leak there breaks a Workers or Deno build of a vot application, and nothing else would catch it. The Node objects live behind the adapter's entry:

```ts
import { getNodeRuntime } from '@fastkit/vot/adapters/node';

const { incoming, outgoing } = getNodeRuntime(ctx.runtime) ?? {};
```

Because the response is now assembled as a `Headers`, **a multi-value `Set-Cookie` survives out of the renderer** — it used to be collapsed into a `Record<string, string>`, which is why cookies had to be written straight to the Node response instead.

## Dependencies

`express`, `@types/express`, `http-proxy` and `@types/http-proxy` are gone; `hono` and `@hono/node-server` take their place. That is **71 packages out and 2 in** — a net reduction of about 0.9 MB, so a consumer who never uses the node adapter still installs less than before.

If your project was reaching Express through vot's hoisted `node_modules` rather than declaring it, declare it.

## Migration

1. **`configureServer({ use })` → `configureServer({ app })`.** `app` is a `Hono`; `use('/path', handler)` becomes `app.get('/path', handler)` or `app.use('/path/*', middleware)`. Serving files from disk is `serveStatic` from `@hono/node-server/serve-static`.
2. **`VotContext.request` / `.response` are now `Request` / `PageResponseDraft`.** Node header access becomes `request.headers.get(name)`. For the raw objects, use `getNodeRuntime(ctx.runtime)`.
3. **Proxy `configure` and `bypass` are removed.** One hands out the `http-proxy` instance and the other the Node request and response; neither has a `fetch` equivalent, and keeping them would let dev and serve drift apart. `secure` is removed for a related reason — there is no standard way to turn off TLS verification for a `fetch`, and an option that quietly does nothing is worse than no option. Use `NODE_TLS_REJECT_UNAUTHORIZED=0`.
4. **WebSocket proxying is an adapter capability.** The default node adapter forwards upgrades, by hand, in about sixty lines and with no new dependency. An adapter that cannot declares `supports.proxyWebSocket: false` and vot warns.
5. **`serve()` returns the adapter's listen result.** `served.server.close()` becomes `served.close()`; the Node server, where there is one, is `served.native`.
6. **An application with no server entry keeps working**, but `configureServer` from `vite.config.ts` is no longer applied under `vot serve` — it cannot be, now that the hook takes an app rather than connect's `use`. vot says so at startup. Move it to a server entry.

## Also fixed

**A rendered page was served as `text/plain`.** Nothing set a `Content-Type`, so the transport fell back to plain text and a browser showed the markup instead of rendering it. Found by looking at the response headers of a real `vot serve`, not by any test — asserting on a response body cannot see it. There is a test for it now.
