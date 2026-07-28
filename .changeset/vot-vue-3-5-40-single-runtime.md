---
"@fastkit/vot": patch
---

Fix SSR breaking with Vue 3.5.40 or newer. That release removed the `vue` peerDependency from `@vue/server-renderer` and made `@vue/runtime-dom` a plain dependency instead ([vuejs/core#15063](https://github.com/vuejs/core/pull/15063)). Because the SSR build keeps `vue` external while bundling `@vue/*`, server-renderer started pulling in its own copy of the runtime, leaving two Vue instances in one process — rendering then failed with `resolveDirective can only be used in render() or setup()` warnings followed by `TypeError: Cannot read properties of null (reading 'ce')`. A `vite:vot-vue-runtime-dom` plugin now redirects `@vue/runtime-dom` back to `vue` during SSR resolution, restoring the single-instance topology. `vue` re-exports every symbol server-renderer needs, and the change requires no additional dependencies on the consumer side.
