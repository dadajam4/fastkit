---
'@fastkit/vite-plugin-vui': minor
---

Declare the packages the generated `.vui/` tree imports, as peer dependencies.

`viteVuiPlugin` writes code into the **consumer's** project — `.vui/installer.ts`, `.vui/setup.scss`, and through `@fastkit/vite-kit` the generated `icon-font/`, `color-scheme/` and `media-match/` modules. Those files import by bare specifier, so every package they name has to resolve from the consumer's project. Five did not:

| package                 | before         | after         |
| ----------------------- | -------------- | ------------- |
| `@fastkit/icon-font`    | undeclared     | required peer |
| `@fastkit/color-scheme` | undeclared     | required peer |
| `@fastkit/media-match`  | undeclared     | required peer |
| `@fastkit/vue-page`     | `dependencies` | required peer |
| `@fastkit/vui`          | `dependencies` | required peer |

`dependencies` is the wrong section for all of them: it installs the package beside _this_ one, where the consumer's `.vui/` cannot see it. `@fastkit/vue-page` was never imported by this package at all — the specifier existed only inside the generated template.

**What this does and does not do.** A peer declaration does not install anything into your project. pnpm puts only what your project itself declares into its `node_modules`; a peer it auto-installs lands in the virtual store, where the generated code cannot see it. So these five still have to be direct dependencies of your project — that has always been true, it was simply undocumented. What changes is that a strict install (`auto-install-peers=false`) now names what is missing, the README says which packages and why, and the plugin fails with the list rather than letting the generated types fall back to placeholders.

A consumer that works today already declares all five.
