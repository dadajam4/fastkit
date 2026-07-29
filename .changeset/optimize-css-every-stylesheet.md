---
"@fastkit/plugboy": minor
---

Apply `optimizeCSS` to every stylesheet the build writes.

The optimizations ran in `generateBundle`, over the CSS assets present in the bundle at that moment. tsdown's own CSS pipeline emits from a *post* plugin, which runs after every user plugin's `generateBundle`, so a stylesheet tsdown produced was never in that set: it silently skipped the layer/media merging and `combineRules`. Only CSS that a plugin emitted itself — `@fastkit/plugboy-sass-plugin`, or the vanilla-extract plugin — was optimized, which is why the gap went unnoticed.

The pass now runs in `writeBundle`, on the files on disk, where every producer has finished. `preserve-css-imports` re-injects external `@import`s in its own `writeBundle` and is registered later, so they still end up above the optimized rules.

Every stylesheet this repository publishes is byte-identical after the change, since all of them came from a plugin. A package whose CSS comes only from tsdown (a plain `.css` / `.scss` import, with neither the sass nor the vanilla-extract plugin in play) now gets the optimizations it always declared.
