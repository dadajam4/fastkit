---
'@fastkit/color-scheme-gen': patch
'@fastkit/cookies': patch
'@fastkit/eslint-config': patch
'@fastkit/eslint-config-vue': patch
'@fastkit/hashed-sync': patch
'@fastkit/icon-font-gen': patch
'@fastkit/media-match-gen': patch
'@fastkit/node-util': patch
'@fastkit/nodepack': patch
'@fastkit/plugboy': patch
'@fastkit/plugboy-sass-plugin': patch
'@fastkit/plugboy-vanilla-extract-plugin': patch
'@fastkit/plugboy-vue-jsx-plugin': patch
'@fastkit/plugboy-vue-plugin': patch
'@fastkit/sprite-images': patch
'@fastkit/stylelint-config': patch
'@fastkit/stylelint-config-vue': patch
'@fastkit/ts-tiny-meta': patch
'@fastkit/vite-kit': patch
'@fastkit/vite-plugin-vui': patch
'@fastkit/vot': patch
'@fastkit/vot-i18n': patch
'@fastkit/vue-page': patch
'@fastkit/vue-tiny-meta': patch
'@fastkit/vui': patch
---

Declare `engines.node` on the packages that run in Node

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

| Floor | Packages |
| --- | --- |
| `>=24.14.0` | `icon-font-gen`, `vite-kit`, `vite-plugin-vui` (`webfont@12.5.0`) |
| `>=22.18.0` | `plugboy` and its four plugins (`@tsdown/css`, `unplugin-vue-jsx`) |
| `>=22.12.0` | `stylelint-config-vue` (`postcss-html`) |
| `>=22.0.0` | `node-util`, `nodepack`, `color-scheme-gen`, `media-match-gen`, `vui` (`execa@10`); `cookies`, `vue-page`, `vot`, `vot-i18n` (`cookie@2`) |
| `>=20.19.0` | `eslint-config`, `eslint-config-vue`, `stylelint-config`, `sprite-images`, `ts-tiny-meta`, `vue-tiny-meta` |
| `>=18.0.0` | `hashed-sync` (`imagemin`) |

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
