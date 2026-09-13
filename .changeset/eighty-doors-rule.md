---
'@fastkit/vot': minor
---

Add a server entry so `vot serve` no longer loads `vite.config.ts` at runtime

`vot serve` called `loadConfigFromFile()` and `resolveConfig()` on startup, so
every static import in `vite.config.ts` -- and every Vite plugin it references --
had to be installed in the production runtime, even though none of them do any
work when serving a prebuilt app. Reinstalling with `--prod` before the final
Docker stage broke the app, which meant shipping the build toolchain to
production with no way to opt out.

The whole plugin pipeline was being instantiated for `server.host`,
`server.port`, `server.proxy`, `base`, a logger, and the vot plugin's
`configureServer` hook. Only the last of those is code rather than data, and it
is the reason the resolved config cannot simply be serialized at build time.

Applications can now declare that surface in a **server entry** -- `vot.server.ts`
at the project root, picked up by convention:

```ts
import { defineVotServer } from '@fastkit/vot/server';

export default defineVotServer(({ dev }) => ({
  host: '0.0.0.0',
  port: dev ? 3000 : Number(process.env.PORT ?? 8080),
  proxy: { '/api': process.env.API_URL! },
  configureServer({ use }) {
    use('/healthcheck', (_req, res) => res.writeHead(200).end());
  },
}));
```

`vot build` bundles it into `dist/server/vot.server.js` and records it in
`dist/server/package.json`, which `vot serve` already reads -- so the artifact is
found without consulting the Vite config at all. The entry is bundled rather
than evaluated at build time, so values it reads from `process.env` come from
the machine that runs the app, not the one that built it.

`vot dev` reads the same file, so host, port, proxy and middleware cannot drift
between development and production. Where `vite.config.ts` sets the same key,
the entry wins and vot warns.

Applications without an entry keep working unchanged: `serve()` falls back to
the previous path, and prints no warning. `vite` is now imported lazily and only
down that fallback, so it is no longer in the import graph of a serve backed by
an entry.

See [the server entry guide](https://github.com/dadajam4/fastkit/blob/main/packages/vot/docs/server-entry.md).

**Migration:** the `serve()` implementation moved from `@fastkit/vot/server` to
`@fastkit/vot/internal/serve`, and `@fastkit/vot/server` now exports
`defineVotServer` and its types. `serve()` is driven by the `vot serve` command
and was not imported by any consumer; if you do import it, update the specifier.
The `internal/` prefix marks it as private -- it is not part of the supported
API surface.

Closes #218
