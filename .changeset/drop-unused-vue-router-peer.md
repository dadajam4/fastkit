---
"@fastkit/vue-loading": patch
---

Drop the unnecessary `vue-router` peer dependency from `@fastkit/vue-loading`. The package does not use `vue-router` at all — neither its source nor its published output references it — so requiring consumers to provide `vue-router` was spurious.
