---
'@fastkit/vue-media-match': minor
---

Declare `@fastkit/media-match` as a peer dependency instead of a dependency.

This package re-exposes `MediaMatchKey` and `MediaMatchConditions` in its published types, and a project's generated breakpoint definition augments `@fastkit/media-match` to replace the placeholder key type. A module augmentation only applies to the copy it resolves, so the project and this package have to resolve the same one; as a `dependency` a version skew silently produced two copies, and every breakpoint key fell back to the placeholder.
