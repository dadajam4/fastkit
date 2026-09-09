---
'@fastkit/vot': minor
---

Take `vue`, `vue-router` and `@types/node` as `peerDependencies`, and expose the head API from a new `@fastkit/vot/head` subpath.

`dependencies` was the wrong side for all three. A consumer has to declare `vue` and `vue-router` anyway — it writes components and routes — so holding them here bought nothing on the resolution side while giving up the **single-instance guarantee**, and `@types/node` forced this package's choice of Node types onto a project whose runtime it knows nothing about.

**`vue` and `vue-router` → peers** (`^3.5.0`, `^4.4.0 || ^5.0.0`). Both are real value imports in the published `dist/vot.mjs`: `createApp`/`createSSRApp`/`h`/`inject` from `vue`, `createRouter`/`createWebHistory`/`createMemoryHistory` from `vue-router`. So this package calls into whichever copy it resolves. Where its range and the consumer's failed to intersect, the two resolved separately and the result was two reactivity systems in one process — `provide`/`inject` across the boundary stopped resolving, `app.use()` landed on the wrong instance — plus `Type 'Router' is not assignable to type 'Router'` wherever Vue's types use `unique symbol`s or declaration merging. A peer declaration is what makes pnpm link the consumer's copy, so the situation cannot arise.

**`@types/node` → peer** (`>=20`). The published `.d.mts` exposes `IncomingMessage`, `ServerResponse` and `Server` from `node:http`, so a consumer's `tsc` must resolve Node's types — but they are only meaningful if they match the Node the consumer actually runs, and a `dependency` left no way to say so. A project on Node 20 that upgraded got `@types/node@^24` pulled in and its types ran two majors ahead of its runtime. The range is deliberately open at the top: unlike a library API, this declares *which Node's types*, and capping it would push consumers off newer Node for no benefit — `node:http` is all this package needs from it.

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