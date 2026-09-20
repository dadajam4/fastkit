---
'@fastkit/vue-page': major
---

Receive the server context instead of assembling one, and stop needing Node to do it.

This package owns the page lifecycle — routing, prefetch, error pages, page state. It also owned a piece of HTTP transport: it imported `IncomingMessage` / `ServerResponse` from `node:http`, **built** the `Cookies` instance out of `{ req, res }`, and wrote `response.statusCode` directly. That is why `@types/node` was a peer here, and why the page layer could not run anywhere `node:http` does not exist.

The boundary now sits where it belongs. The transport layer builds the context; this package receives it and never assembles one.

```ts
export interface VuePageServerContext {
  /** web-standard, so this layer runs wherever its transport does */
  request: Request;
  /** where status and headers for this render are written */
  response: PageResponseDraft;
  /** built by the transport layer, the only side that knows what the request is */
  cookies: Cookies;
  /** adapter-specific handle. This package never looks inside it. */
  runtime?: unknown;
}
```

`PageResponseDraft` is the mutable sibling of `WrittenResponse` — the same three pieces, but `headers` is a `Headers` rather than a `Record<string, string>`, so a multi-value `Set-Cookie` survives being written into it. Both types are declared here and re-exported by `@fastkit/vot`, the same way `WrittenResponse` already is.

**`@types/node` is no longer a peer dependency.** Nothing published from this package names `node:http` any more.

## Migration

**`settings.request` / `settings.response` become `settings.server`.** The transport layer now supplies the cookie jar too:

```diff
 installVuePageControl({
   app,
   router,
-  request,   // IncomingMessage
-  response,  // ServerResponse
+  server: {
+    request,                                    // Request
+    response: { headers: new Headers() },       // PageResponseDraft
+    cookies: new Cookies({ request, headers }), // built by you
+  },
 });
```

**`control.request` is a `Request`, and `control.response` is a `PageResponseDraft`.** The read-side names are unchanged — `control.request`, `control.response`, `control.cookies` all still work — but the types are not, and code that reached through `control.response` for `setHeader` / `writeHead` / `end` has to get the real response from the transport layer instead. That is what `server.runtime` is for; `@fastkit/vot` puts its Node objects there.

Node header access moves with it: `request.headers['accept-language']` becomes `request.headers.get('accept-language')`.

**The "response has finished" check is gone.** `_writeStates` used to skip when `response.headersSent` was true. A draft does not know whether anything went out on the wire, and it should not: the transport owns the draft and applies it once the render is over, so nothing can have been sent while the render was still running.

A control built with no server context — the browser, or a server render given nothing — behaves as before: the browser jar is built from `document`, and a contextless server render gets an inert jar that reads nothing and writes nowhere.
