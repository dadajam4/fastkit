---
'@fastkit/stylelint-config': patch
'@fastkit/stylelint-config-vue': patch
---

Stop extending `stylelint-prettier/recommended`, which the package no longer depends on.

The `extends` entry was kept when `stylelint-prettier` was dropped from `dependencies` in 0.15.0 (the CJS → ESM change), so every consumer of the shared config failed to load Stylelint at all:

```
ConfigurationError: Could not find "stylelint-prettier/recommended".
Do you need to install the package or use the "configBasedir" option?
```

`@fastkit/stylelint-config-vue` was equally unusable, since it extends the base config. This repository did not notice because `stylelint-prettier` is a root devDependency here and the root `stylelint.config.mjs` extends `stylelint-prettier/recommended` itself.

The entry is removed rather than the dependency restored: Prettier is a formatting choice that belongs to the consuming project, and `stylelint-prettier` resolves `prettier` at module load time — declaring it would force Prettier onto every consumer, including those who format with something else. A project that wants the integration adds `stylelint-prettier` and puts `'stylelint-prettier/recommended'` after this config in its own `extends`, which is what this repository already does.

Nothing else about the config changes, and formatting enforcement in this repository is unaffected.
