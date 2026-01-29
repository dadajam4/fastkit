---
'@fastkit/plugboy': major
---

Changed the bundler from tsup to tsdown.

This release includes the following breaking changes:

- Plugin system changed from esbuild-based to rolldown-based
- `onSuccess` hook has been removed
- `publicDir` option has been removed

New features:

- Plugboy plugins are now compatible with tsdown (rolldown) plugins
- vue-tsc can now be used as the DTS compiler (`dts.compiler: 'vue-tsc'`)
- Added `dts.ignoreCompilerErrors` option
- Added `@fastkit/plugboy/runtime-utils` export for runtime utilities

### Migration Guide

- If using `esbuildPlugins`, replace with rolldown-compatible plugins
- If using `onSuccess` hook, use the `onSuccess` option in workspace config instead
- If using `publicDir`, use the `copy` option instead
