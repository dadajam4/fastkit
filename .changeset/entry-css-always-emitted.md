---
"@fastkit/plugboy": patch
---

Guarantee a stylesheet for every `css: true` entry.

plugboy declares a `./<entry>.css` export for each such entry, but with more than one of them the file it points at was not always produced. The build emits one stylesheet per output *chunk* (`css.splitting`), which does not line up with the entries: CSS reached from several entries is moved into a shared chunk and emitted under that chunk's hashed name, which no export points at, and an entry whose CSS comes *only* from there gets no stylesheet at all — a published export resolving to a missing file. Reported from a downstream package with two CSS entries, one of which re-exports only shared `.css.ts` helpers.

Each entry's stylesheet is now rebuilt from its own CSS plus the CSS of every chunk it imports, dependencies first, and the leftover per-chunk files are deleted. Shared CSS is duplicated into each entry that needs it, which is what makes a single `./<entry>.css` import complete. Skipped when `css.inject` is on, since the JavaScript then imports the per-chunk stylesheets by name.

The chunk graph is captured in `generateBundle` because it is gone by the time the stylesheets exist: a chunk holding nothing but CSS is dropped once tsdown's CSS pipeline has emitted its stylesheet, and its importers' `imports` are emptied with it — by `writeBundle` only the orphaned stylesheet is left. For the same reason `optimizeCSS` and `preserve-css-imports` no longer walk the bundle assets alone; they take every stylesheet the build wrote, so an assembled file gets the same treatment as any other.

A package with a single CSS entry emits one combined stylesheet and is untouched: every stylesheet this repository publishes is byte-identical.
