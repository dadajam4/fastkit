---
'@fastkit/vue-scroller': patch
---

Require `@fastkit/scroller` `^1.0.2`, which fixes `missing element` thrown by
scroll operations and scroll stoppers called before the element is set (e.g.
while a `<Suspense>` boundary is still pending). Without this release, an
existing lockfile keeps the unfixed version.
