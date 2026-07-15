# Dependency Management

Fastkit is a monorepo that publishes ~60 packages to npm. Every published package
must be **independently installable** — a consumer who runs `pnpm add @fastkit/x`
in a normal (isolated, non-`shamefully-hoist`) setup must be able to resolve
everything that package needs at runtime and type-check time.

This document is the policy for deciding **where each dependency belongs**
(`dependencies` / `peerDependencies` / `devDependencies` / `optionalDependencies`,
or the workspace root), and records the mechanism facts and verification steps
that make those decisions correct.

## The one question that drives every decision

> **Does this import ship in the package's `dist` (i.e. reach consumers)?**

- **Ships to consumers** → it must be declared by the package (`dependencies`
  or `peerDependencies`). A missing one is a bug: it only "works" in this repo
  because of hoisting, and breaks for consumers.
- **Does not ship** (build config, tests, build-time helpers that get inlined,
  compiled-away styles) → `devDependencies`, or the workspace-root shared
  toolchain. Consumers never see it, so centralizing is fine.

Historically these packages assumed `shamefully-hoist: true`. The goal is to no
longer require it: complete per-package declaration of everything that ships,
plus a deliberately centralized dev toolchain at the root.

## Decision guide

Work through these in order for any dependency `X` used by a package:

1. **Is `X` part of the shared build/lint/test toolchain?**
   (`@fastkit/plugboy` + its plugins, `vitest`, `typescript`, `vue-tsc`,
   `eslint` + configs, `prettier`, `stylelint` + configs, `turbo`,
   `@changesets/*`, `jsdom`, `@vue/test-utils`, `@vitejs/plugin-vue-jsx`,
   `rollup`, `vite`, `postcss`, `tsx`, `@fastkit/ts-tiny-meta`,
   `@fastkit/vanilla-extract-utils`, `@types/node`, …)
   → **Root-aggregate it** (declare in the workspace-root `package.json`
   `devDependencies`). Do **not** declare it per package. See
   [Root-aggregated dev toolchain](#root-aggregated-dev-toolchain).

2. **Is `X` used only in the package's own build config / tests, or is it a
   build-time helper that gets bundled into `dist` (not externalized)?**
   → **`devDependencies`** of that package (or rely on the root for the shared
   toolchain). It does not reach consumers.

3. **Does `X` ship in `dist` as a runtime value import?**
   - If it is a **framework / host-provided singleton** (`vue`, `vue-router`,
     `@unhead/vue`) or a tool whose host supplies it →
     **`peerDependencies`** (+ `devDependencies` for local dev/build).
   - Otherwise → **`dependencies`**.

4. **Is `X` used only as a type (`import type`)?**
   - If the type is internal (erased from both `.js` and the published `.d.ts`
     surface) → **`devDependencies`**.
   - If the published `.d.ts` re-exposes the type to consumers → the consumer
     must be able to resolve it → **`peerDependencies`**.

5. **Is `X` an optional feature loaded through a guarded dynamic
   `import()` (try/catch)?**
   → **`optionalDependencies`** or `peerDependenciesMeta.<X>.optional = true`
   (or leave it undeclared if it is intentionally optional-and-absent).

6. **Refinement — is a peer `X` (from step 3 or 4) reachable only through a
   subpath export the consumer opts into, not from the main entry?**
   → keep it a `peerDependency` but mark it **optional**
   (`peerDependenciesMeta.<X>.optional = true`). See
   [Peers scoped to an optional subpath export](#peers-scoped-to-an-optional-subpath-export).

## Reference table

| Situation | Section | Example |
| --- | --- | --- |
| Shared build/lint/test toolchain | **workspace-root `devDependencies`** | `vitest`, `typescript`, `plugboy`, `eslint` |
| Runtime value import that ships | `dependencies` | `@fastkit/vue-page` in `vite-plugin-vui` |
| Framework singleton that ships | `peerDependencies` (+ `devDependencies`) | `vue`, `vue-router` |
| Tool whose host provides it, used in shipped code | `peerDependencies` (+ `devDependencies`) | `typescript` in `ts-tiny-meta` |
| `import type` only, not re-exposed | `devDependencies` | — |
| Compiled-away styles (`*.css.ts`) | `devDependencies` (or root toolchain) | `@vanilla-extract/css` |
| Build config (`plugboy.workspace.ts`) or bundled build helper | root toolchain / `devDependencies` — **never `dependencies`** | `@fastkit/plugboy` |
| plugboy plugin (the package *is* a plugin) | required `peerDependencies` | `@fastkit/plugboy-sass-plugin` |
| Dependency reachable only via an opt-in subpath export | **optional** `peerDependencies` | `@fastkit/plugboy` in `@fastkit/icon-font`; `vite` in `@fastkit/ts-tiny-meta` |
| Optional feature via guarded dynamic import | `optionalDependencies` / `peerDependenciesMeta.optional` | `node-memwatcher` in `vot` |

## Special cases and established rules

### Peers scoped to an optional subpath export

**General rule:** if a dependency is used **only** by a subpath export that the
consumer opts into — not by the package's main entry — declare it as an
**optional** peer (`peerDependenciesMeta.<dep>.optional = true`).

A consumer who imports only the main entry never touches that subpath and does
not need the dependency; a *required* peer would emit a spurious
"missing peer dependency" warning for them. Marking it optional keeps the
relationship documented for consumers who do use the subpath (which, for a
build-time subpath, always run in a context that already provides the dep) while
staying quiet for everyone else.

How to tell whether a dependency is subpath-scoped: check whether it is imported
from the main entry's (`src/index.ts`) import closure, or only from the source
files that back a non-main subpath entry. If it appears only outside the main
closure, it is subpath-scoped and its peer should be optional. (This can be
audited mechanically — walk the relative-import graph from `src/index.ts` and
flag peers that never appear in it.)

Examples in this repo:

- `@fastkit/icon-font`, `@fastkit/color-scheme`, and `@fastkit/media-match` each
  export a `./plugboy-dts-preserve` subpath that imports `@fastkit/plugboy`,
  while their main entry does not → `@fastkit/plugboy` is an **optional** peer.
- `@fastkit/ts-tiny-meta` uses `vite` only in its `./vite` subpath → `vite` is an
  **optional** peer.

Contrast: a dependency used by the **main** entry (e.g. `vue` in a component
package, or `typescript` in `@fastkit/ts-tiny-meta`'s core) is a **required**
peer — every consumer needs it.

### Framework singletons (the Vue family)

`vue` and every `@vue/*` internal package (`@vue/runtime-core`,
`@vue/server-renderer`, `@vue/compiler-*`, `@vue/reactivity`, `@vue/shared`, …)
cross-depend on each other by **exact** version. If different packages resolve
different patch versions (e.g. one package's `^3.5.0` picks `3.5.39` while the
rest are pinned at `3.5.38`), Vue's module identity is **duplicated** and
JSX / `VNodeChild` type-checking breaks.

Rules:

- Each package declares `vue` (and `vue-router` when used) as a
  `peerDependency` with a permissive range (`^3.5.0`), plus a `devDependency`
  for local development.
- The **whole Vue family is pinned to one version via `pnpm overrides`** in
  `pnpm-workspace.yaml`. Overrides affect install-time resolution only; the
  published `peerDependencies` ranges are untouched, so consumers keep their
  freedom.

### `@fastkit/plugboy` (the build tool)

plugboy is dev toolchain. It appears in packages in a few ways; the correct
placement depends on how it is used:

- In `plugboy.workspace.ts` (a package's own build config) or via a bundled
  helper such as `@fastkit/plugboy/runtime-utils` imported into `src` → **rely
  on the root-aggregated plugboy** (or `devDependencies`). **Never
  `dependencies`.** plugboy externalizes `dependencies` / `peerDependencies` /
  `optionalDependencies` and bundles everything else; declaring a *bundled*
  helper under `dependencies` externalizes it and breaks at runtime — e.g.
  `runtime-utils`' `getPackageDir()` walks the call stack and, once externalized,
  resolves plugboy's own directory instead of the caller's.
- A plugboy **plugin** (`@fastkit/plugboy-*-plugin`) → **required
  `peerDependencies`**: the package is meaningless without a plugboy host.
- A package that exports a `./plugboy-dts-preserve` (or similar) subpath used
  from other packages' `plugboy.workspace.ts` → **optional `peerDependencies`**
  (`peerDependenciesMeta`). Only consumers who use that subpath — always inside a
  plugboy build, which supplies plugboy — need it; consumers of the main entry
  do not.

### vanilla-extract (`*.css.ts`)

`@vanilla-extract/css` / `@vanilla-extract/css-utils` / the
`@fastkit/vanilla-extract-utils` helpers used in `*.css.ts` files are compiled to
static CSS at build time and leave **no import in the shipped JS**. Treat them as
build tooling → `devDependencies` (or the root toolchain), **not**
`dependencies`.

### Module-augmentation types

Some type customization works by TypeScript module augmentation — e.g. the docs
app's generated color-scheme types (`.vui/color-scheme/color-scheme.info.ts`)
augment `@fastkit/color-scheme` to replace placeholder types like `ScopeName`.
For the augmentation to apply, **the augmentation source and the code that
consumes the type must resolve the same physical copy** of the augmented package.
The consuming app must therefore **declare that package directly** (e.g.
`apps/docs` declares `@fastkit/color-scheme`); otherwise the two resolve
different copies and the types fall back to the uncustomized placeholders.

## Root-aggregated dev toolchain

The shared build/lint/test toolchain lives in the workspace-root
`package.json` `devDependencies`, **not** in each package.

Why this is correct (and not a `shamefully-hoist` smell):

- None of it ships in `dist`, so it never reaches consumers — placement is a
  repo-internal concern only.
- Nested packages resolve it by ordinary upward Node resolution to the root
  `node_modules`. This is **not** `shamefully-hoist` (which flattens *transitive*
  dependencies); root direct dependencies are always linked into the root
  regardless, so it works under strict/isolated pnpm too.
- Centralizing keeps one version across the workspace and avoids repeating the
  same toolchain in 60+ manifests.

Package-specific libraries are **not** part of this and must be declared where
used — e.g. the docs app declares `@fastkit/color-scheme-gen`, `@fastkit/node-util`,
and `fs-extra` because its own build modules use them.

## Mechanism facts

- **plugboy externals** = `dependencies` + `peerDependencies` +
  `optionalDependencies`. Everything else (`devDependencies` and undeclared
  imports) is **bundled** into `dist`. This is why a bundled helper must not sit
  in `dependencies`.
- **`shamefully-hoist` only affects consumers via transitive dependencies.** The
  real fix for the consumer-facing problem is complete `dependencies` /
  `peerDependencies` per published package — nothing else.
- **`pnpm overrides`** pin a single resolved version workspace-wide at
  install time. Publishing rewrites `workspace:` / `catalog:` protocols but does
  not bake overrides into published manifests.
- **`pnpm catalog:` was considered** for centralizing the Vue version but not
  adopted: converting ~26 packages × 2 references is high churn for marginal
  benefit over `overrides` + the per-package declarations that already exist.

## Verification

After changing dependencies, verify with:

```bash
pnpm build:force          # NOT `turbo run … --force` — see below
pnpm build:docs           # exercises the docs app end-to-end (incl. generated CSS/types)
pnpm typecheck            # type consistency (catches duplicate-identity / augmentation issues)
pnpm test
```

- **Always use `pnpm build:force`, never `turbo run … --force`.** `turbo --force`
  ignores caches across the whole graph and breaks plugboy's self-bootstrap
  (plugboy must build itself first); `pnpm build:force` clears the Turbo cache
  and runs `build:plugboy` before the rest.
- **Consumer reproduction:** `pnpm add` a single package into a throwaway project
  with default settings (no `shamefully-hoist`) and confirm its imports resolve.
  A missing runtime `dependencies` / `peerDependencies` fails here.
- **Detecting phantoms — audit the built `dist`, not `src`.** The
  authoritative consumer-facing check is: for each published package, scan its
  built `dist/**` for import specifiers and verify each is declared in
  `dependencies` / `peerDependencies` / `optionalDependencies` (NOT
  `devDependencies` — consumers don't get those; and bundled imports never
  appear in `dist`). A `src`-based scan over-reports — it includes type-only
  imports erased from the output, `*.css.ts` compiled away at build, test files,
  and bundled helpers. Classify findings by severity:
  - **static runtime import** (`import … from` / `require`) → hard runtime break;
  - **type import in `.d.ts`** → breaks consumer type-checking;
  - **dynamic `import()`** → usually an optional feature (often `try`/`catch`
    guarded, e.g. `@fastkit/vot`'s memory-monitoring imports); confirm each is
    guarded and intentionally undeclared rather than a real miss.

  Strip comments before scanning, or JSDoc `@example` code blocks in `.d.ts`
  produce false positives. **Goal: static-runtime = 0 and type = 0.** Note that
  pnpm's `hoist=false` does **not** surface these (root-declared deps still
  resolve via upward traversal), and a real isolated install (`pnpm deploy`-style)
  is the ultimate confirmation.

  > **Do not declare a guarded optional dynamic dependency just to silence the
  > audit.** Declaring it as a peer with `auto-install-peers` on (pnpm default)
  > pulls the (often native) module into the install for everyone; declaring it
  > as an `optionalDependency` force-installs it too. Leaving a `try`/`catch`
  > `import()` undeclared is the correct "bring your own if you want the feature"
  > pattern — it does not break consumers.
