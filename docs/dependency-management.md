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
   `@types/node`, …)
   → **Root-aggregate it** (declare in the workspace-root `package.json`
   `devDependencies`). Do **not** declare it per package. See
   [Root-aggregated dev toolchain](#root-aggregated-dev-toolchain).

   Root-aggregation exists to keep a dependency that *every* package uses out of
   60-odd `package.json` files. It does not extend to a **workspace** package that
   only a few packages build against: turbo orders `build` with
   `dependsOn: ["^build"]`, which walks declared workspace dependencies, so an
   undeclared one has no edge and its `dist` may not exist yet when the dependent
   builds — see [Workspace build-time helpers](#workspace-build-time-helpers).

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

### Peer dependency version ranges

When declaring a `peerDependency`, **enumerate the major versions you support and
cap before the next unverified one** — e.g. `^6.0.0 || ^7.0.0`. Do **not** use an
open-ended `>=6.0.0`: it claims compatibility with every future major (8, 9, …),
each of which will contain breaking changes you have not verified.

This matters most for dependencies that do not follow semver. **TypeScript in
particular breaks its public API in minor and major releases**, so:

- `^6.0.0` alone excludes the imminent TypeScript 7 (caret means `>=6.0.0 <7.0.0`)
  and warns those consumers unnecessarily;
- `>=6.0.0` over-promises TypeScript 8+;
- `^6.0.0 || ^7.0.0` is correct — extend to `|| ^8.0.0` once TS 8 ships and is
  verified.

This matches the repo's existing peers (cf. the `vite` peer
`^6.0.0 || ^7.0.0 || ^8.0.0` — enumerated majors, explicit upper bound).

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
build tooling → `devDependencies`, **not** `dependencies`.

The two external ones are root-aggregated. `@fastkit/vanilla-extract-utils` is a
workspace package, so declare it in the `devDependencies` of each package whose
`*.css.ts` imports it — see
[Workspace build-time helpers](#workspace-build-time-helpers).

### Workspace build-time helpers

A **workspace** package that another package only needs at build time — a
`*.css.ts` helper such as `@fastkit/vanilla-extract-utils`, a
`./plugboy-dts-preserve` subpath, a codegen helper — still has to be declared by
the package that imports it, normally in `devDependencies`. Relying on the root
toolchain is not enough here, for a reason that has nothing to do with
resolution:

`build` is ordered by `dependsOn: ["^build"]` in `turbo.json`, which walks
**declared** workspace dependencies. An undeclared import gives turbo no edge, so
the helper and its dependent can build concurrently, and the dependent fails with
`Could not resolve …` whenever the helper's `dist` does not happen to exist yet.
A warm `dist` hides this, so it tends to surface only on a cold cache — for
instance `turbo run build --filter=<the dependent>`, or CI after a lockfile
change invalidates everything.

`@fastkit/plugboy` is the exception, and only because *every* package builds with
it: ordering is handled once by the `build:plugboy` phase that `build` and
`build:docs` run first, rather than by 60 declarations.

### Module-augmentation types

Some type customization works by TypeScript module augmentation — e.g. the docs
app's generated color-scheme types (`.vui/color-scheme/color-scheme.info.ts`)
augment `@fastkit/color-scheme` to replace placeholder types like `ScopeName`.
For the augmentation to apply, **the augmentation source and the code that
consumes the type must resolve the same physical copy** of the augmented package.
The consuming app must therefore **declare that package directly** (e.g.
`apps/docs` declares `@fastkit/color-scheme`); otherwise the two resolve
different copies and the types fall back to the uncustomized placeholders.

### Inlined external types in `.d.ts` (reference, don't inline)

plugboy generates types with tsdown → `rolldown-plugin-dts`, which produces a
**self-contained `.d.ts`**. For each type the emitted declarations reference, the
bundler either keeps an `import('pkg').Foo` reference or copies the declaration
**inline** — decided by whether `pkg` is **externalized**. plugboy externalizes
its declared deps (`dependencies` + `peerDependencies` + `optionalDependencies`)
*plus* whatever a `plugboy.workspace.ts` `deps.neverBundle` lists.

What actually decides it, per type:

- A type the **source references by an explicit name imported from an external
  package** (e.g. `const control: TextableControl`, `TextableControl` imported
  from `@fastkit/vui`) → kept as `import('@fastkit/vui').TextableControl`. The
  import specifier is preserved.
- A type that only appears because TypeScript **structurally expanded** some
  other value/function (e.g. spreading `...createFormNodeWrapperProps()`; the
  source never writes the type name) → resolved to its **definition package** and
  **inlined** (unless that package is external). A re-export subpath does NOT
  redirect this — the bundler always follows to the definition origin.

**Why inlining is bad — it is not just bloat.** An inlined class with
`private`/`protected` members is compared **nominally**: the baked-in copy and a
consumer's real copy of the same class are *different declarations*, so
`TS2322 "not assignable"` fires the moment a consumer bridges the two (e.g. takes
`VWysiwygEditorAPI`'s form-node type and passes it to a `@fastkit/vue-form-control`
API). Plus it bloats the file (inlining `vue-form-control` added ~1,600 lines) and
is invisible to an import-specifier scan.

**Fix: make the type a reference, not an inline.** Two tools, by case:

1. **Declare the package** (`dependencies` / `peerDependencies`) — when it is a
   genuine dependency this package uses (runtime, or imported by name). Standard,
   self-describing.
2. **`deps.neverBundle` in `plugboy.workspace.ts`** — when the type is type-only,
   arrives *only* through structural expansion (the source never imports it by
   name), and is already **provided by a REQUIRED declared dep**. Externalizing it
   emits the reference; it resolves through that provider. Use this instead of
   re-declaring a foundation the package doesn't itself use. Example:
   `@fastkit/vui-wysiwyg` never names `@fastkit/vue-form-control`, but its
   `VWysiwygEditor` props spread `createFormNodeWrapperProps()` (vui re-exports it),
   pulling `FormNodeControl` in. `neverBundle: ['@fastkit/vue-form-control',
   '@fastkit/vue-utils']` makes the `.d.ts` reference them; they resolve via the
   required `@fastkit/vui` peer (which depends on them).

**`neverBundle` is only safe when a REQUIRED declared dep provides the package.**
Externalizing something that nothing declared provides just moves the phantom to
the consumer (an undeclared `import('pkg')` they can't resolve under strict
isolation — see the earlier neverBundle-without-a-provider trap). Having to spell
`neverBundle` out is a minor wart (ideally the bundler would reference the type
through the re-export path the source used, but it resolves to the definition
origin instead); it is an acceptable, audited workaround.

**Audit.** `audit:deps` fails on any `[inlined]` external type (both
`node_modules/…` and workspace-relative `../pkg/dist/…` regions — goal:
**inlined external = 0**), so a missing `neverBundle`/declaration is caught. A
reference that is undeclared **but provided through a required declared dep** is
reported as **`[via]`** (informational, non-failing) — the accepted `neverBundle`
outcome.

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
- **The same external set (plus `deps.neverBundle`) governs the `.d.ts`.** tsdown →
  `rolldown-plugin-dts` keeps an external package's types as an `import('pkg')`
  reference and **inlines a non-external package's types** instead. Inlining is not
  just bloat — an inlined nominal class (`private`/`protected` members) is a
  *different declaration* from the consumer's real copy and clashes (`TS2322`). So
  externalization controls JS bundling *and* whether a type is referenced (good) or
  copied in (bad). See "Inlined external types" above.
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
  - **inlined external type** (`//#region` region, `node_modules/…` or
    workspace-relative `../pkg/dist/…`) → bloat + nominal type-identity clash; fix
    by declaring or `neverBundle` (see "Inlined external types" above);
  - **via declared dep** → undeclared but genuinely provided through a REQUIRED
    declared dep (its dep/peer); informational, not a failure (the accepted
    `neverBundle` outcome);
  - **dynamic `import()`** → usually an optional feature (often `try`/`catch`
    guarded, e.g. `@fastkit/vot`'s memory-monitoring imports); confirm each is
    guarded and intentionally undeclared rather than a real miss.

  Strip comments before scanning, or JSDoc `@example` code blocks in `.d.ts`
  produce false positives. The scan is regex-based over source text, so it also
  counts import-like strings inside string literals (e.g. a codegen template
  that emits `import … from 'vue'`) — it **over-reports rather than under-reports**,
  which is the safe direction for a guardrail (worst case you declare a dep you
  didn't strictly need; you never silently miss one). It also reports at most one
  version per dependency, so it flags an undeclared dep, not version drift.
  Packages that publish source directly instead of a `dist` build (config / type
  packages such as the eslint/stylelint configs) are outside this dist-based
  audit; the script reports them separately so a partial build can't masquerade
  as a clean pass. The script also detects the inverse leak — an undeclared
  external package whose types are **inlined** into a `.d.ts` (the `[inlined]`
  category; see "Inlined external types" above) — which an import-specifier scan
  cannot. **Goal: static-runtime = 0, type = 0, and inlined external = 0.**
  References that are undeclared but genuinely provided through a required declared
  dep are reported as `[via]` and are acceptable (not counted against the goal).
  Note that pnpm's `hoist=false` does **not** surface these (root-declared deps
  still resolve via upward traversal), and a real isolated install
  (`pnpm deploy`-style) is the ultimate confirmation.

  > **Blind spot — ambient `@types/*`.** An import-specifier scan cannot see
  > `@types/*` packages: they are pulled in implicitly by `import … from 'x'`,
  > never referenced by name. Dev-only `@types/*` whose types do **not** appear
  > in any published `.d.ts` are fine root-aggregated (like `@types/node`). But
  > if a published `.d.ts` exposes a type from `@types/X` (i.e. `X`'s types are
  > part of the public API), the package must declare `@types/X` itself
  > (`dependencies`) — the consumer needs it to type-check. Check this by
  > grepping published `.d.ts` for the module (`grep -r "from 'x'" dist/*.d.mts`),
  > not by the import audit.

  > **Do not declare a guarded optional dynamic dependency just to silence the
  > audit.** Declaring it as a peer with `auto-install-peers` on (pnpm default)
  > pulls the (often native) module into the install for everyone; declaring it
  > as an `optionalDependency` force-installs it too. Leaving a `try`/`catch`
  > `import()` undeclared is the correct "bring your own if you want the feature"
  > pattern — it does not break consumers.
