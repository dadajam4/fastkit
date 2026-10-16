---
'@fastkit/scroller': patch
---

Scroll operations (`by()`, `to()`, `toElement()`, `toSide()`, `toTop()` etc.) no
longer throw `missing element` when no element has been set yet, or after
`destroy()`. They return a result that does nothing and resolves immediately.
`pushScrollStopper()` and `removeScrollStopper()` no longer throw either; a
stopper pushed before the element is set takes effect once it is set.
`useScrollerControl({ el: 'self' })` and `VScroller` from
`@fastkit/vue-scroller` only set the element on mount, so this was hit while a
`<Suspense>` boundary was still pending.
