---
'@fastkit/stylelint-config': patch
'@fastkit/stylelint-config-vue': patch
---

Declare `postcss-html` in the package that actually needs it, and upgrade `stylelint-config-recommended-vue` to v2.

`postcss-html` is a required peer of `stylelint-config-recommended-vue`, which only `@fastkit/stylelint-config-vue` depends on — but it was declared by `@fastkit/stylelint-config`, whose own config never parses HTML or Vue. It resolved for consumers by hoisting, not by declaration, and `pnpm` reported it as a missing peer.

Moving it alone was not enough. `stylelint-config-recommended-vue@1.6.1` requires `postcss-html@^1` while depending on `stylelint-config-html@>=1.0.0` with no upper bound, so a fresh install pulls `stylelint-config-html@2`, whose own peer is `postcss-html@^2`:

```
└─┬ stylelint-config-recommended-vue 1.6.1
  └─┬ stylelint-config-html 2.0.0
    └── ✕ unmet peer postcss-html@^2.0.0: found 1.8.1
```

`stylelint-config-recommended-vue@2.0.0` moved its configs to peer dependencies, so `@fastkit/stylelint-config-vue` now declares them itself (`postcss-html`, `stylelint-config-html`, `stylelint-config-recommended`, `stylelint-config-recommended-scss`) and the whole graph resolves on v2 with no peer warnings.

Nothing changes about the rules: v2 only drops support for Stylelint below 14.5 and switches to ESM, and the config Stylelint resolves for a `.vue` file is identical, rule for rule, before and after.
