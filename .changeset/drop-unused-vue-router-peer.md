---
"@fastkit/vue-loading": patch
"@fastkit/vui-wysiwyg": patch
---

Drop the unused `vue-router` peer dependency. Neither package references vue-router anywhere, so it was needlessly requiring consumers to provide it.
