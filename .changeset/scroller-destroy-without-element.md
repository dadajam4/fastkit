---
'@fastkit/scroller': patch
---

`Scroller.destroy()` no longer throws `missing element` when no element has
been set yet. `useScrollerControl({ el: 'self' })` from `@fastkit/vue-scroller`
hit this when its component was unmounted before mounting, e.g. by navigating
away while a `<Suspense>` boundary was still pending.

Destroying a `Scroller` right after giving it an element no longer leaves an
unhandled rejection from the `start()` that the element setup had kicked off.
