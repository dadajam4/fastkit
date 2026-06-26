---
'@fastkit/plugboy': patch
---

Document the `__PLUGBOY_DEV__` / `__PLUGBOY_STUB__` build-time env constants and fix their type JSDoc.

- Correct the `__PLUGBOY_DEV__` global type's `@remarks` to match actual behavior: `true` during `stub`, and in a published `build` it is replaced with a runtime check of the consumer's environment (`NODE_ENV` / `import.meta.env.DEV`) rather than being stub-only.
- Add an "Env constants" usage guide (`docs/env-constants.md`, with a Japanese version) and a v1 (tsdown) migration guide (`docs/migrations/v1.md`), linked from the README.
