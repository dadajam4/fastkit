---
'@fastkit/eslint-config': patch
'@fastkit/eslint-config-vue': patch
---

Document the formatting stance and add usage docs; clean up how the Vue config disables formatting.

Both configs turn off ESLint's formatting rules (via `eslint-config-prettier`) and do **not** run any formatter — pick and run your own on your side (Prettier via CLI/editor, dprint, Biome, or `eslint-plugin-prettier` if you want to format through ESLint). The READMEs now cover installation, flat-config usage, and this stance.

Migration: no action needed for most setups. `@fastkit/eslint-config-vue` now disables formatting with `eslint-config-prettier/flat` instead of `@vue/eslint-config-prettier/skip-formatting`. Behavior is unchanged — `eslint-plugin-vue`'s formatting rules are still turned off — but it is no longer Prettier-specific (`skip-formatting` also forced `prettier/prettier` off), and the `@vue/eslint-config-prettier` dependency is dropped in favor of `eslint-config-prettier`.
