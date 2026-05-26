---
'@fastkit/vue-stack': patch
---

Fix `VMenu` not resizing its outer scroller when the inner content shrinks (e.g. collapsing an accordion or hiding nodes with `v-show`). `updateMenuRect` now clears the content element's fixed inline size before calling `getBoundingClientRect`, so the body's natural size is measured instead of the constrained one — previously the measurement was taken before the styles were cleared, leaving stale dimensions that prevented the scroller from shrinking.
