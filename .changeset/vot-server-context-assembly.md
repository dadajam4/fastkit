---
'@fastkit/vot': major
---

Assemble the server context that `@fastkit/vue-page` now expects.

The page layer stopped building its own HTTP plumbing, so this package builds it: the cookie jar, the response draft, and the Node `{ request, response }` pair that its own code still needs. `@fastkit/cookies` is a dependency here now, because this is the layer that knows what a request actually is.

```ts
const server: VuePageServerContext = {
  request,
  response: draft,
  cookies: new Cookies({ req: request, res: response }, { bucket: reactive({}) }),
  runtime: { request, response } satisfies VotNodeRuntime,
};
```

The cookie context stays Node-shaped for now, so `Set-Cookie` still goes out through `response.setHeader` exactly as before.

**`VotContext` gains `server`**, and `VotNodeRuntime` names what goes in `server.runtime`. `PageResponseDraft` and `VuePageServerContext` are re-exported from `@fastkit/vue-page`, alongside `WrittenResponse` / `WriteResponseFn` / `RedirectFn`.

Internally, `useSsrResponse` now keeps one store rather than two: the draft is the response state, and the `WrittenResponse` the renderer returns is a snapshot taken from it.

## Migration

**`control.response` is a `PageResponseDraft`, not a `ServerResponse`.** This package re-exports the page layer, so the change reaches anything reading `useVuePageControl().response`. Code that wrote to the real response through it takes the runtime handle instead:

```diff
 middleware: (ctx) => {
-  ctx.response.setHeader('Content-Type', 'application/json');
-  ctx.response.writeHead(200);
-  ctx.response.end(body);
+  const { response } = (ctx.server?.runtime || {}) as Partial<VotNodeRuntime>;
+  if (!response) return;
+  response.setHeader('Content-Type', 'application/json');
+  response.writeHead(200);
+  response.end(body);
 }
```

`VotContext.request` and `VotContext.response` are untouched: inside a vot hook, the Node objects are still right there.
