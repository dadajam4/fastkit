---
"@fastkit/vue-loading": patch
"@fastkit/vui-wysiwyg": patch
---

Drop the unnecessary `vue-router` peer dependency. Neither package has a `vue-router` import specifier in its published output, so a consumer never needs to resolve the `vue-router` package for these to work: `@fastkit/vue-loading` does not use vue-router at all, and in `@fastkit/vui-wysiwyg` the only vue-router types are fully inlined into the `.d.ts` (no `from 'vue-router'` import). The peer requirement was therefore spurious.
