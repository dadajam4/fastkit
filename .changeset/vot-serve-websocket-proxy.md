---
'@fastkit/vot': patch
---

Make `ws: true` proxy rules work under `vot serve`.

`proxyMiddleware` installs its `upgrade` listener on the HTTP server it is handed, and `serve()` had none to hand it — the server only came into being at `app.listen()`, so the call passed `null` and the listener was never registered. A rule that opted into WebSocket forwarding therefore worked under `vot dev`, where Vite gives its proxy the dev server, and silently did nothing in production. Nothing threw and nothing was logged; a client just fell back to whatever transport it had.

`serve()` now builds the HTTP server with `http.createServer(app)` before mounting anything, which is what `express().listen()` does internally, and hands it to the proxy.

Unchanged: a rule written as a plain string target still forwards HTTP only. Both `vot dev` and `vot serve` forward an upgrade only when the rule sets `ws: true` or points at a `ws:` / `wss:` target, so the same config behaves the same either side.
