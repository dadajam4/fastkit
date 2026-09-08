---
'@fastkit/vite-plugin-vui': minor
---

Generate code that names only packages the project already declares.

`viteVuiPlugin` writes code into the **consumer's** project — `.vui/installer.ts`, `.vui/setup.scss`, and through `@fastkit/vite-kit` the generated `icon-font/`, `color-scheme/` and `media-match/` modules. Those files import by bare specifier, so every package they name has to resolve from the consumer's project. `dependencies` is the wrong section for such a package: it installs beside _this_ one, where the consumer's `.vui/` cannot see it. And a peer declaration cannot place it either — pnpm puts into a project's `node_modules` only what the project itself declares, and an auto-installed peer lands in the virtual store.

So the generated tree's imports are, unavoidably, requirements of the consuming project. The fix is to have it name fewer of them. Each generator now takes the runtime module as an option, and this plugin passes `@fastkit/vui`, which re-exports all three leaf packages:

| package                 | before         | after                     |
| ----------------------- | -------------- | ------------------------- |
| `@fastkit/icon-font`    | undeclared     | not named at all          |
| `@fastkit/color-scheme` | undeclared     | not named at all          |
| `@fastkit/media-match`  | undeclared     | not named at all          |
| `@fastkit/vue-page`     | `dependencies` | required peer             |
| `@fastkit/vui`          | `dependencies` | required peer             |

`@fastkit/vue-page` was never imported by this package at all — the specifier existed only inside the generated template.

**Migration.** Your project now needs `@fastkit/vui`, `@fastkit/vue-page`, `vue` and `vue-router`, and nothing else on this account:

```sh
pnpm remove @fastkit/icon-font @fastkit/color-scheme @fastkit/media-match
```

Regenerate afterwards (delete `.vui/`, or just run the build). Authoring a custom color scheme or breakpoint set still uses `@fastkit/color-scheme-gen` / `@fastkit/media-match-gen` as `devDependencies`; `@fastkit/color-scheme-gen` now re-exports the full authoring API, so that path needs no other package either.
