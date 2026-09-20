---
'@fastkit/vot-i18n': major
---

Read the request through the web-standard `Headers`, and require `@fastkit/vot` 2.

The SSR context now carries a `Request` rather than a Node `IncomingMessage`, so language negotiation reads its header the web way:

```diff
-request.headers['accept-language']
+request.headers.get('accept-language')
```

Nothing else changes here. `ctx.cookies` and `ctx.request` keep their names, and the strategy storage is untouched. What moves is the floor: a project still on vot 1 cannot take this version.
