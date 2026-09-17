---
'@fastkit/vot': minor
---

`vot serve` now mounts `configureServer` middleware and proxy rules at the server root instead of inside `base`, matching `vot dev`.

`base` is where the application's assets and routes live. A health check, a metrics endpoint or a webhook receiver is not part of that route tree, and until now the same source line answered at two different URLs depending on the command:

| `base` | `vot dev` | `vot serve` (before) | `vot serve` (now) |
| --- | --- | --- | --- |
| `/` | `/healthcheck` | `/healthcheck` | `/healthcheck` |
| `/app/` | `/healthcheck` | `/app/healthcheck` | `/healthcheck` |

Static assets and the rendering route are still served under `base`.

**Migration.** Only applications that set `base` to something other than `/` *and* register middleware or proxy rules are affected. Applications on the default `base: '/'` need no change.

- Drop the `base` prefix from any path that points at them — load balancer and Kubernetes probes aimed at `/<base>/healthcheck` must move to `/healthcheck`.
- Middleware registered without a path (`use(handler)`) now runs for every request rather than only those below `base`, which is what it already did under `vot dev`.
