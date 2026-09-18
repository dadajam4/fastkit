# @fastkit/vot

## 1.6.0

### Minor Changes

- [#237](https://github.com/dadajam4/fastkit/pull/237) [`ec4fbd2`](https://github.com/dadajam4/fastkit/commit/ec4fbd2abe2ec3aff18bb2516ac6d38829c2b05e) Thanks [@dadajam4](https://github.com/dadajam4)! - `vot serve` now mounts `configureServer` middleware and proxy rules at the server root instead of inside `base`, matching `vot dev`.

  `base` is where the application's assets and routes live. A health check, a metrics endpoint or a webhook receiver is not part of that route tree, and until now the same source line answered at two different URLs depending on the command:

  | `base`  | `vot dev`      | `vot serve` (before) | `vot serve` (now) |
  | ------- | -------------- | -------------------- | ----------------- |
  | `/`     | `/healthcheck` | `/healthcheck`       | `/healthcheck`    |
  | `/app/` | `/healthcheck` | `/app/healthcheck`   | `/healthcheck`    |

  Static assets and the rendering route are still served under `base`.

  **Migration.** Only applications that set `base` to something other than `/` _and_ register middleware or proxy rules are affected. Applications on the default `base: '/'` need no change.

  - Drop the `base` prefix from any path that points at them — load balancer and Kubernetes probes aimed at `/<base>/healthcheck` must move to `/healthcheck`.
  - Middleware registered without a path (`use(handler)`) now runs for every request rather than only those below `base`, which is what it already did under `vot dev`.

### Patch Changes

- [#254](https://github.com/dadajam4/fastkit/pull/254) [`2e0d68f`](https://github.com/dadajam4/fastkit/commit/2e0d68ff726c4b03a21662420433370e43e50742) Thanks [@dadajam4](https://github.com/dadajam4)! - Make `ws: true` proxy rules work under `vot serve`.

  `proxyMiddleware` installs its `upgrade` listener on the HTTP server it is handed, and `serve()` had none to hand it — the server only came into being at `app.listen()`, so the call passed `null` and the listener was never registered. A rule that opted into WebSocket forwarding therefore worked under `vot dev`, where Vite gives its proxy the dev server, and silently did nothing in production. Nothing threw and nothing was logged; a client just fell back to whatever transport it had.

  `serve()` now builds the HTTP server with `http.createServer(app)` before mounting anything, which is what `express().listen()` does internally, and hands it to the proxy.

  Unchanged: a rule written as a plain string target still forwards HTTP only. Both `vot dev` and `vot serve` forward an upgrade only when the rule sets `ws: true` or points at a `ws:` / `wss:` target, so the same config behaves the same either side.

- Updated dependencies [[`e9da85f`](https://github.com/dadajam4/fastkit/commit/e9da85f5a48cfb0d63459144262f77d62775e980), [`e9da85f`](https://github.com/dadajam4/fastkit/commit/e9da85f5a48cfb0d63459144262f77d62775e980)]:
  - @fastkit/helpers@1.1.0
  - @fastkit/vue-page@1.1.1

## 1.5.1

### Patch Changes

- Updated dependencies [[`023bebd`](https://github.com/dadajam4/fastkit/commit/023bebd6352f4bb18e6944dc72d2fd52e233e411)]:
  - @fastkit/helpers@1.0.0
  - @fastkit/vue-page@1.0.0
  - @fastkit/vue-utils@1.0.0

## 1.5.0

### Minor Changes

- [#222](https://github.com/dadajam4/fastkit/pull/222) [`d31885c`](https://github.com/dadajam4/fastkit/commit/d31885c1033b90177d9b06b2324c8a3c83925d1f) Thanks [@dadajam4](https://github.com/dadajam4)! - Add a server entry so `vot serve` no longer loads `vite.config.ts` at runtime

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

  Closes [#218](https://github.com/dadajam4/fastkit/issues/218)

### Patch Changes

- [#220](https://github.com/dadajam4/fastkit/pull/220) [`cee75e2`](https://github.com/dadajam4/fastkit/commit/cee75e2a8bfd3a580081059e5721622587936672) Thanks [@dadajam4](https://github.com/dadajam4)! - Inline the page's stylesheets into the SSR dev response

  Opening a page against the `vot` dev server painted unstyled HTML for a moment
  before the styles appeared. `createSSRDevHandler` built the response from
  `index.html`, the SSR render result and the render context, and none of those
  carry CSS: Vite serves stylesheets as JavaScript modules in dev and emits no
  `<link rel="stylesheet">`, so the document had zero styles until the client
  entry had been fetched, parsed and executed. `vot build` + `vot serve` were
  never affected, because the client build writes real stylesheet links into
  `index.html`.

  The dev handler now walks the SSR module graph once the render is done --
  per request, since the set of stylesheets depends on which route was rendered --
  and inlines each one into the head as a `<style>` element. They carry the
  `data-vite-dev-id` attribute Vite's HMR client looks for, so on hydration it
  adopts the existing elements instead of appending a second copy, and CSS hot
  updates keep replacing them in place.

  Order matters as much as presence, because the client never reorders what it
  adopts: whatever order the response ships is the cascade for the rest of the
  session. A plain depth-first walk does not reproduce it -- a module behind a
  dynamic import is reached on the way down, but the browser only runs it after
  the whole static graph. The walk therefore defers dynamically imported modules
  (via the transform result's `dynamicDeps`) and drains them afterwards, which
  reproduces the order the client applies stylesheets in, and with it the order
  `vot build` produces.

  Fixes [#219](https://github.com/dadajam4/fastkit/issues/219)

## 1.4.1

### Patch Changes

- [#213](https://github.com/dadajam4/fastkit/pull/213) [`02ed660`](https://github.com/dadajam4/fastkit/commit/02ed660f4e06be90dceb2664d341d67f1136fe6e) Thanks [@dadajam4](https://github.com/dadajam4)! - Declare `engines.node` on the packages that run in Node

  None of these packages said which Node they needed, so a project on an older
  Node installed cleanly and failed later. `@fastkit/node-util` reaches
  `execa@10` (`engines: >=22`), and nothing in the chain up through
  `@fastkit/vite-plugin-vui` declared anything, so Node 20 builds died with:

  ```
  TypeError: TEXT_ENCODINGS.union is not a function
      at .../execa/lib/arguments/encoding-option.js:20
  ```

  `Set.prototype.union` is Node 22+ and `execa` calls it at import time. The
  failure surfaced only during the build and vui's generation step -- `tsc` and
  the tests passed -- so it showed up in CI and container images while a
  developer on a newer Node saw everything green.

  Each package now declares the highest floor its own shipped dependencies
  impose, so `npm`/`pnpm` report an unsupported engine at install time and
  `engine-strict` fails outright:

  | Floor       | Packages                                                                                                                                  |
  | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
  | `>=24.14.0` | `icon-font-gen`, `vite-kit`, `vite-plugin-vui` (`webfont@12.5.0`)                                                                         |
  | `>=22.18.0` | `plugboy` and its four plugins (`@tsdown/css`, `unplugin-vue-jsx`)                                                                        |
  | `>=22.12.0` | `stylelint-config-vue` (`postcss-html`)                                                                                                   |
  | `>=22.0.0`  | `node-util`, `nodepack`, `color-scheme-gen`, `media-match-gen`, `vui` (`execa@10`); `cookies`, `vue-page`, `vot`, `vot-i18n` (`cookie@2`) |
  | `>=20.19.0` | `eslint-config`, `eslint-config-vue`, `stylelint-config`, `sprite-images`, `ts-tiny-meta`, `vue-tiny-meta`                                |
  | `>=18.0.0`  | `hashed-sync` (`imagemin`)                                                                                                                |

  Note that `@fastkit/vite-plugin-vui` requires **Node 24.14**, not 22: its
  `webfont` dependency does. Nothing here changes what any package needs at run
  time -- these floors were already in force, just undeclared.

  Browser-only packages are left alone even where a transitive dependency has a
  floor: `@fastkit/vui-wysiwyg` inherits one from `@fastkit/vui`, but runs no
  Node code of its own. Optional peers do not contribute a floor, since they are
  reachable only through an opt-in subpath.

  `pnpm audit:deps` now recomputes every floor and fails when a declaration is
  missing or undershoots, so a future dependency bump cannot quietly reintroduce
  the gap. The policy is written up in `docs/dependency-management.md`.

- Updated dependencies [[`02ed660`](https://github.com/dadajam4/fastkit/commit/02ed660f4e06be90dceb2664d341d67f1136fe6e)]:
  - @fastkit/vue-page@0.18.5

## 1.4.0

### Minor Changes

- [#203](https://github.com/dadajam4/fastkit/pull/203) [`b9fc3af`](https://github.com/dadajam4/fastkit/commit/b9fc3afdc5d34c18f6ff7a1bb8d87b831caa79f9) Thanks [@dadajam4](https://github.com/dadajam4)! - Take `vue`, `vue-router` and `@types/node` as `peerDependencies`, and expose the head API from a new `@fastkit/vot/head` subpath.

  `dependencies` was the wrong side for all three. A consumer has to declare `vue` and `vue-router` anyway — it writes components and routes — so holding them here bought nothing on the resolution side while giving up the **single-instance guarantee**, and `@types/node` forced this package's choice of Node types onto a project whose runtime it knows nothing about.

  **`vue` and `vue-router` → peers** (`^3.5.0`, `^4.4.0 || ^5.0.0`). Both are real value imports in the published `dist/vot.mjs`: `createApp`/`createSSRApp`/`h`/`inject` from `vue`, `createRouter`/`createWebHistory`/`createMemoryHistory` from `vue-router`. So this package calls into whichever copy it resolves. Where its range and the consumer's failed to intersect, the two resolved separately and the result was two reactivity systems in one process — `provide`/`inject` across the boundary stopped resolving, `app.use()` landed on the wrong instance — plus `Type 'Router' is not assignable to type 'Router'` wherever Vue's types use `unique symbol`s or declaration merging. A peer declaration is what makes pnpm link the consumer's copy, so the situation cannot arise.

  **`@types/node` → peer** (`>=20`). The published `.d.mts` exposes `IncomingMessage`, `ServerResponse` and `Server` from `node:http`, so a consumer's `tsc` must resolve Node's types — but they are only meaningful if they match the Node the consumer actually runs, and a `dependency` left no way to say so. A project on Node 20 that upgraded got `@types/node@^24` pulled in and its types ran two majors ahead of its runtime. The range is deliberately open at the top: unlike a library API, this declares _which Node's types_, and capping it would push consumers off newer Node for no benefit — `node:http` is all this package needs from it.

  **`express` stays a `dependency`.** It appears nowhere in the published type surface and has no instance-identity requirement; the server internals are this package's business.

  **`@unhead/vue` also stays a `dependency`, and is now re-exported from `@fastkit/vot/head`.** This package installs unhead into the application itself, so an application only ever needs `useHead` and the input types. Reaching them through `@unhead/vue` directly meant declaring it and keeping its range aligned with the copy resolved here — and unhead's Vue composables read the client out of Vue's injection context, so a second copy with a different `headSymbol` resolves nothing and `useHead` silently stops applying. The subpath removes the declaration and keeps `@unhead/vue`, `unhead` and the SSR renderer versioned together, which is where that decision belongs.

  **Migration.** Declare the three peers:

  ```sh
  pnpm add vue vue-router
  pnpm add -D @types/node
  ```

  In practice a project already declares `vue` and `vue-router` — it imports them in its own components. Projects relying on `shamefully-hoist=true` and never declaring them will see a `missing peer dependency` warning until they do.

  Optionally, drop `@unhead/vue` and import the head API from here instead:

  ```diff
  -import { useHead, type ReactiveHead } from '@unhead/vue';
  +import { useHead, type ReactiveHead } from '@fastkit/vot/head';
  ```

  ```sh
  pnpm remove @unhead/vue
  ```

## 1.3.3

### Patch Changes

- [#199](https://github.com/dadajam4/fastkit/pull/199) [`a879812`](https://github.com/dadajam4/fastkit/commit/a8798127ed358898d3e7315d54fff9f6d61e5838) Thanks [@dadajam4](https://github.com/dadajam4)! - Fix `vot generate`, which could not start.

  `bin/generate.mjs` imported the CLI without a file extension:

  ```js
  import { cli } from '../dist/tool';
  ```

  ESM does no extension guessing, so Node threw before anything ran:

  ```
  Error [ERR_MODULE_NOT_FOUND]: Cannot find module '.../packages/vot/dist/tool'
    imported from .../packages/vot/bin/generate.mjs
  ```

  `bin/build.mjs` and `bin/dev.mjs` name `../dist/tool.mjs` correctly; only this one did not, so `vot dev`, `vot build` and `vot serve` were unaffected and `vot generate` had never worked. Present since the first commit.

- Updated dependencies [[`d224120`](https://github.com/dadajam4/fastkit/commit/d224120639a248468c69d83f2791983cb61c248c)]:
  - @fastkit/helpers@0.17.0
  - @fastkit/vue-page@0.18.4
  - @fastkit/vue-utils@0.18.4

## 1.3.2

### Patch Changes

- [#175](https://github.com/dadajam4/fastkit/pull/175) [`05d8bb4`](https://github.com/dadajam4/fastkit/commit/05d8bb4385811b677e323d2137a6d0e8a65186c5) Thanks [@dadajam4](https://github.com/dadajam4)! - Fix SSR breaking with Vue 3.5.40 or newer. That release removed the `vue` peerDependency from `@vue/server-renderer` and made `@vue/runtime-dom` a plain dependency instead ([vuejs/core#15063](https://github.com/vuejs/core/pull/15063)). Because the SSR build keeps `vue` external while bundling `@vue/*`, server-renderer started pulling in its own copy of the runtime, leaving two Vue instances in one process — rendering then failed with `resolveDirective can only be used in render() or setup()` warnings followed by `TypeError: Cannot read properties of null (reading 'ce')`. A `vite:vot-vue-runtime-dom` plugin now redirects `@vue/runtime-dom` back to `vue` during SSR resolution, restoring the single-instance topology. `vue` re-exports every symbol server-renderer needs, and the change requires no additional dependencies on the consumer side.

- Updated dependencies [[`05d8bb4`](https://github.com/dadajam4/fastkit/commit/05d8bb4385811b677e323d2137a6d0e8a65186c5)]:
  - @fastkit/helpers@0.16.2
  - @fastkit/vue-utils@0.18.3
  - @fastkit/vue-page@0.18.3

## 1.3.1

### Patch Changes

- [`d63b1af`](https://github.com/dadajam4/fastkit/commit/d63b1af8bf1bb131590ff540af82428cc60aeb7e) Thanks [@dadajam4](https://github.com/dadajam4)! - Strip the dangling `//# sourceMappingURL=*.d.mts.map` comment from emitted declaration files.

  tsdown (rolldown) appends this comment to every `.d.(m)ts` it emits but does not emit the referenced declaration map, so consumers' editors/build tools fail to resolve it. plugboy now removes the comment during build — but only when the referenced map is genuinely absent, so it becomes a no-op automatically if a future tsdown starts emitting real declaration maps.

  Every package in this monorepo is built by plugboy, so this patch re-publishes them all with declaration files that no longer point at a missing map.

- Updated dependencies [[`d63b1af`](https://github.com/dadajam4/fastkit/commit/d63b1af8bf1bb131590ff540af82428cc60aeb7e)]:
  - @fastkit/helpers@0.16.1
  - @fastkit/vue-page@0.18.1
  - @fastkit/vue-utils@0.18.1

## 1.3.0

### Minor Changes

- [`b824e71`](https://github.com/dadajam4/fastkit/commit/b824e7136b57649d7958e257c21e8704267380e6) Thanks [@dadajam4](https://github.com/dadajam4)! - Release due to package bundler change. No functional changes included.

- Release accompanying the plugboy bundler migration (tsup → tsdown).

  No API changes are intended for this package. The minor bump exists because the package is rebuilt with the new bundler (tsdown / rolldown), and is published together so any incidental output differences are versioned explicitly.

### Patch Changes

- [`25602cb`](https://github.com/dadajam4/fastkit/commit/25602cbe1493cbeb10456b8b0e7680983d9e2ed7) Thanks [@dadajam4](https://github.com/dadajam4)! - Update dependencies and apply the associated fixes.

- Updated dependencies [[`b824e71`](https://github.com/dadajam4/fastkit/commit/b824e7136b57649d7958e257c21e8704267380e6), [`25602cb`](https://github.com/dadajam4/fastkit/commit/25602cbe1493cbeb10456b8b0e7680983d9e2ed7)]:
  - @fastkit/vue-utils@0.18.0
  - @fastkit/vue-page@0.18.0
  - @fastkit/helpers@0.16.0

## 1.3.0-next.1

### Patch Changes

- Update dependencies and apply the associated fixes.

- Updated dependencies []:
  - @fastkit/vue-utils@0.18.0-next.1
  - @fastkit/vue-page@0.18.0-next.1
  - @fastkit/helpers@0.16.0-next.1

## 1.3.0-next.0

### Minor Changes

- Release due to package bundler change. No functional changes included.

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.18.0-next.0
  - @fastkit/vue-page@0.18.0-next.0
  - @fastkit/helpers@0.16.0-next.0

## 1.2.0

### Minor Changes

- Updated major dependencies.

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.17.0
  - @fastkit/vue-page@0.16.1

## 1.1.0

### Minor Changes

- Updated major dependencies.

  Accordingly, the page directory previously specified with `pagesDir` must now be changed to `dirs`.

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.16.0
  - @fastkit/vue-page@0.16.0
  - @fastkit/helpers@0.15.0

## 1.0.0

### Major Changes

- [#153](https://github.com/dadajam4/fastkit/pull/153) [`2a9ac68`](https://github.com/dadajam4/fastkit/commit/2a9ac68653d4335d761d958a4061098218faaa0e) Thanks [@nkenji09](https://github.com/nkenji09)! - Now supports Vite 7 series

## 1.0.0-next.0

### Major Changes

- [#153](https://github.com/dadajam4/fastkit/pull/153) [`c650b4a`](https://github.com/dadajam4/fastkit/commit/c650b4a3813c891b5e21c6dd68cac981ac01d465) Thanks [@nkenji09](https://github.com/nkenji09)! - Now supports Vite 7 series

## 0.17.3

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.13
  - @fastkit/vue-page@0.15.14

## 0.17.2

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.12
  - @fastkit/vue-page@0.15.13

## 0.17.1

### Patch Changes

- **Fixed**: Warning shown when slot functions were executed outside of their rendering scope.

- Updated dependencies []:
  - @fastkit/vue-page@0.15.12
  - @fastkit/vue-utils@0.15.11

## 0.17.0

### Minor Changes

- [#148](https://github.com/dadajam4/fastkit/pull/148) [`8b66410`](https://github.com/dadajam4/fastkit/commit/8b66410e3423016c76956f772b86426dec99a0e7) Thanks [@nkenji09](https://github.com/nkenji09)! - 依存パッケージのアップデートを行いました

## 0.16.13

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.10
  - @fastkit/vue-page@0.15.11

## 0.16.12

### Patch Changes

- Dependency updates only.

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.9
  - @fastkit/helpers@0.14.5
  - @fastkit/vue-page@0.15.10

## 0.16.11

### Patch Changes

- Updated dependencies.

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.8
  - @fastkit/vue-page@0.15.9

## 0.16.10

### Patch Changes

- Updated dependencies.

- Updated dependencies []:
  - @fastkit/vue-page@0.15.8

## 0.16.9

### Patch Changes

- Updated dependencies only.

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.7
  - @fastkit/vue-page@0.15.7

## 0.16.8

### Patch Changes

- [#146](https://github.com/dadajam4/fastkit/pull/146) [`38c99c8`](https://github.com/dadajam4/fastkit/commit/38c99c8d34c434a4acd1df802453b1009cc4009b) Thanks [@dadajam4](https://github.com/dadajam4)! - We have addressed the issue of potential failure when generating a large number of pages simultaneously during static generation by limiting the number of pages generated at once.

## 0.16.7

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.6
  - @fastkit/vue-page@0.15.6

## 0.16.6

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.14.4
  - @fastkit/vue-page@0.15.5
  - @fastkit/vue-utils@0.15.5

## 0.16.5

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.14.3
  - @fastkit/vue-page@0.15.4
  - @fastkit/vue-utils@0.15.4

## 0.16.4

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.14.2
  - @fastkit/vue-page@0.15.3
  - @fastkit/vue-utils@0.15.3

## 0.16.3

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.2
  - @fastkit/vue-page@0.15.2

## 0.16.2

### Patch Changes

- Updated major dependencies.

## 0.16.1

### Patch Changes

- Reverted the removal of the `main` field that was introduced in the previous release and restored support for the old `moduleResolution`.

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.1
  - @fastkit/vue-page@0.15.1
  - @fastkit/helpers@0.14.1

## 0.16.0

### Minor Changes

- Updated Vite to version 5.

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.0
  - @fastkit/vue-page@0.15.0
  - @fastkit/helpers@0.14.0

## 0.15.17

### Patch Changes

- Refactored internal implementation due to a review of ESLint rules, with no changes to the specifications.

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.17
  - @fastkit/vue-page@0.14.17
  - @fastkit/helpers@0.13.8

## 0.15.16

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.16
  - @fastkit/vue-page@0.14.16

## 0.15.15

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.15
  - @fastkit/vue-page@0.14.15

## 0.15.14

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.14
  - @fastkit/vue-page@0.14.14

## 0.15.13

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.13
  - @fastkit/vue-page@0.14.13

## 0.15.12

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.13.7
  - @fastkit/vue-page@0.14.12
  - @fastkit/vue-utils@0.14.12

## 0.15.11

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.13.6
  - @fastkit/vue-page@0.14.11
  - @fastkit/vue-utils@0.14.11

## 0.15.10

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.13.5
  - @fastkit/vue-page@0.14.10
  - @fastkit/vue-utils@0.14.10

## 0.15.9

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.13.4
  - @fastkit/vue-page@0.14.9
  - @fastkit/vue-utils@0.14.9

## 0.15.8

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.8
  - @fastkit/vue-page@0.14.8

## 0.15.7

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.7
  - @fastkit/vue-page@0.14.7

## 0.15.6

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.6
  - @fastkit/vue-page@0.14.6

## 0.15.5

### Patch Changes

- Updated dependencies [[`811800c`](https://github.com/dadajam4/fastkit/commit/811800c8aec5dc1236a887e35aa846560b8c40f7)]:
  - @fastkit/vue-utils@0.14.5
  - @fastkit/vue-page@0.14.5

## 0.15.4

### Patch Changes

- Updated dependencies [[`25885d2`](https://github.com/dadajam4/fastkit/commit/25885d2139c445478ce9aa7ff03539398f28cd55)]:
  - @fastkit/vue-utils@0.14.4
  - @fastkit/vue-page@0.14.4

## 0.15.3

### Patch Changes

- [#122](https://github.com/dadajam4/fastkit/pull/122) [`d0c96fa`](https://github.com/dadajam4/fastkit/commit/d0c96faf96b6c91bcb8bc0b1ca9d22fc8ede303e) Thanks [@dadajam4](https://github.com/dadajam4)! - Update major and non-major packages

- Updated dependencies [[`d0c96fa`](https://github.com/dadajam4/fastkit/commit/d0c96faf96b6c91bcb8bc0b1ca9d22fc8ede303e)]:
  - @fastkit/helpers@0.13.3
  - @fastkit/vue-page@0.14.3
  - @fastkit/vue-utils@0.14.3

## 0.15.2

### Patch Changes

- [#120](https://github.com/dadajam4/fastkit/pull/120) [`5b881b9`](https://github.com/dadajam4/fastkit/commit/5b881b94ce1852c12cc3c8f6954564d5235cba4d) Thanks [@dadajam4](https://github.com/dadajam4)! - JSDocs were added and no-console lint improvements were made.

- Updated dependencies [[`5b881b9`](https://github.com/dadajam4/fastkit/commit/5b881b94ce1852c12cc3c8f6954564d5235cba4d)]:
  - @fastkit/helpers@0.13.2
  - @fastkit/vue-page@0.14.2
  - @fastkit/vue-utils@0.14.2

## 0.15.1

### Patch Changes

- Updated dependencies [[`8e25df8`](https://github.com/dadajam4/fastkit/commit/8e25df840c83d63617f5f343939fc22abf06b4a0)]:
  - @fastkit/vue-utils@0.14.1
  - @fastkit/vue-page@0.14.1

## 0.15.0

### Minor Changes

- [#53](https://github.com/dadajam4/fastkit/pull/53) [`326fa29`](https://github.com/dadajam4/fastkit/commit/326fa29bf34fe8501be6c5a4fa190244d1068090) Thanks [@dadajam4](https://github.com/dadajam4)! - Migrated head to unhead package.

## 0.14.0

### Minor Changes

- [#39](https://github.com/dadajam4/fastkit/pull/39) [`40ee82f`](https://github.com/dadajam4/fastkit/commit/40ee82f4501b88e44ad9b67918df2237298493a0) Thanks [@dadajam4](https://github.com/dadajam4)! - Updated Vue to improve type support for slots, etc.
  This improvement is based on the following Vue.js 3.3 release

  https://blog.vuejs.org/posts/vue-3-3

### Patch Changes

- Updated dependencies [[`40ee82f`](https://github.com/dadajam4/fastkit/commit/40ee82f4501b88e44ad9b67918df2237298493a0)]:
  - @fastkit/vue-utils@0.14.0
  - @fastkit/vue-page@0.14.0

## 0.13.2

### Patch Changes

- Updated dependencies [[`3ed3703a`](https://github.com/dadajam4/fastkit/commit/3ed3703aa9092bf47caed6ec192ef4d5a7621d34)]:
  - @fastkit/helpers@0.13.1
  - @fastkit/vue-page@0.13.1
  - @fastkit/vue-utils@0.13.1

## 0.13.1

### Patch Changes

- [#15](https://github.com/dadajam4/fastkit/pull/15) [`9ac30980`](https://github.com/dadajam4/fastkit/commit/9ac30980a5ee468ae151a2c9fa1f0c5736e488d1) Thanks [@dadajam4](https://github.com/dadajam4)! - Fixed vot build command failure in generate mode on Node v18.

## 0.13.0

### Minor Changes

- First Release in Repository Migration.
