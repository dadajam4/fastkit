---
"@fastkit/plugboy": patch
"@fastkit/vui": patch
---

Preserve the authored `@layer` order through the CSS transform.

lightningcss drops a name from an `@layer a, b, c;` statement when a block for that layer follows in the same stylesheet — the block establishes the same order, so the name is redundant. That reasoning holds for a standalone document. It does not hold for a library stylesheet whose statement *also* orders layers belonging to other packages: once the name is gone, the layer's position is decided by wherever its own block lands relative to those other packages' stylesheets, and the authored order is lost.

`@fastkit/vui` declares `@layer vui-normalize, vui-color-scheme, vue-disabled-reason, vue-loading, vue-app-layout, vui;`, of which only `vui-normalize` and `vui` have blocks in the file. Both were being pruned, so the published `vui.css` declared four layers instead of six and `vui-normalize` was established *after* `vui-color-scheme` / `vue-disabled-reason` / `vue-loading` — promoting the reset layer above the packages it is supposed to lose to, which showed up as changed component styling (buttons, among others).

`preserve-css-imports` now records the layer names of every `@layer a, b;` statement before tsdown's CSS pipeline can prune them, and re-emits them, in their declared order, at the top of each stylesheet in `writeBundle`. Names the emitted stylesheet still declares on its own are appended after them.

The capture is a `transform` hook declared `order: 'pre'`, which runs ahead of tsdown's CSS handling even though that is registered as a *pre plugin* — hook order wins over plugin order. It is the only point that sees the CSS of every stylesheet in the graph, including a virtual one another plugin supplies from `load`: vanilla-extract generates its `@layer` statements into such a module, and for a package built entirely from `.css.ts` that generated statement is the only record of the intended order.

Each stylesheet's declarations are read as a set of "must come before" constraints and merged by topological sort, rather than concatenated with repeats dropped. A name's first appearance is rarely where its order is decided: vanilla-extract re-declares a layer at the top of *every* stylesheet that puts a rule in it, so a single `@layer that-one;` from some component is seen before the module that declares how all the layers relate — and taking first appearances would let that component decide the layer's position. The sequences are visited in module execution order, which decides which one wins a contradiction and how otherwise-free names are ordered.

This regressed when a build `target` was first declared: before that, lightningcss transformed nothing at all (`@tsdown/css` returns early with no target, no `lightningcss` options and no minification), so the statement survived untouched.

`vui.css` grows by the 20 bytes of the two restored names; its rules are unchanged.
