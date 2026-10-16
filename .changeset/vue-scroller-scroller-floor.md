---
'@fastkit/vue-scroller': patch
---

Require `@fastkit/scroller` `^1.0.1`, which fixes `missing element` thrown when
a `useScrollerControl({ el: 'self' })` component is unmounted before it mounts
(e.g. navigating away while a `<Suspense>` boundary is still pending). Without
this release, `@fastkit/vue-scroller` still accepted `^1.0.0`, so an existing
lockfile kept the unfixed version.
