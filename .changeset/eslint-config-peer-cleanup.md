---
'@fastkit/eslint-config': minor
---

Clean up peer dependencies.

- Drop the unused `prettier` peer. The config only uses `eslint-config-prettier` (which does not require Prettier to be installed) to turn off formatting rules and does not run Prettier itself, so requiring `prettier` was misleading.
- Narrow the `eslint` peer from `^8.50.0` to `^9.0.0 || ^10.0.0`. This is a flat-config-only preset (built on typescript-eslint's flat configs and `eslint-plugin-vue` v10) that requires ESLint 9+; ESLint 8 is also end-of-life. Consumers must be on ESLint 9 or 10.
