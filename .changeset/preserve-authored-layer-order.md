---
"@fastkit/plugboy": patch
"@fastkit/vui": patch
---

Preserve the authored `@layer` order through the CSS transform.

lightningcss drops a name from an `@layer a, b, c;` statement when a block for that layer follows in the same stylesheet — the block establishes the same order, so the name is redundant. That reasoning holds for a standalone document. It does not hold for a library stylesheet whose statement *also* orders layers belonging to other packages: once the name is gone, the layer's position is decided by wherever its own block lands relative to those other packages' stylesheets, and the authored order is lost.

`@fastkit/vui` declares `@layer vui-normalize, vui-color-scheme, vue-disabled-reason, vue-loading, vue-app-layout, vui;`, of which only `vui-normalize` and `vui` have blocks in the file. Both were being pruned, so the published `vui.css` declared four layers instead of six and `vui-normalize` was established *after* `vui-color-scheme` / `vue-disabled-reason` / `vue-loading` — promoting the reset layer above the packages it is supposed to lose to, which showed up as changed component styling (buttons, among others).

`preserve-css-imports` now records the layer names of every `@layer a, b;` statement in `load` — before tsdown's CSS pipeline can prune them, the same interception point it already uses for external `@import`s — and re-emits them, in their authored order, at the top of each stylesheet in `writeBundle`. Names the emitted stylesheet declares on its own are appended after them.

This regressed when a build `target` was first declared: before that, lightningcss transformed nothing at all (`@tsdown/css` returns early with no target, no `lightningcss` options and no minification), so the statement survived untouched.

`vui.css` grows by the 20 bytes of the two restored names; its rules are unchanged. A stylesheet whose `@layer` statements are generated rather than authored — vanilla-extract emits its own — is not covered here, since nothing reads it before the transform; no package currently depends on that case.
