---
"@fastkit/plugboy-vanilla-extract-plugin": minor
"@fastkit/vue-app-layout": patch
"@fastkit/vue-disabled-reason": patch
"@fastkit/vue-sortable": patch
---

Hand the extracted CSS to tsdown's CSS pipeline, so the `css` options apply to it.

`@vanilla-extract/rollup-plugin` resolves its virtual stylesheets as **external** modules and, in `extract` mode, emits the collected CSS itself as a bundler asset. Either way tsdown never saw the CSS, so none of the `css` options could reach it: `css.target` in particular, which meant a `.css.ts` writing `userSelect: 'none'` shipped a bare `user-select` — the property Safari ignores without `-webkit-` — while `.scss` in the same repository was prefixed correctly. `css.transformer: 'postcss'` and `css.minify` were equally invisible to it.

The plugin now resolves the virtual stylesheet as a real module and supplies its content from `load`, the approach `@vanilla-extract/vite-plugin` takes. The extracted CSS is an ordinary `.css` module in the graph, so tsdown owns it: `target`, `transformer` (lightningcss *or* postcss), `minify` and the preprocessor options all apply, and its pipeline emits the single `css.fileName`. One consequence worth recording: the `?source=` query has to be stripped when resolving, because `@tsdown/css` skips any CSS id carrying a non-`?inline` query — with the query intact the styles are dropped from the output entirely.

Because there is now one CSS producer instead of two, the machinery built around the old split is gone: the temporary file that avoided a `FILE_NAME_CONFLICT` with tsdown's own output, the on-disk merge in `writeBundle`, the `assetFileNames` override that renamed the emitted asset, and the per-entry re-split driven by `meta.css`. `@vanilla-extract/integration` becomes a direct dependency (it provides the virtual-id helpers, and was already an indirect one).

The per-entry CSS contract — plugboy declares a `./<entry>.css` export for every entry with `css: true` — is now served by `css.splitting`, which the plugin derives from the number of such entries: one of them keeps `splitting: false` and a single `<package>.css`, several switch to `splitting: true` so tsdown emits one stylesheet per chunk. That second case is measurably better than the old hand-rolled split, which lost an entry's own CSS whenever a `.css.ts` was shared between entries; it now survives. One gap remains and is documented: shared `.css.ts` CSS lands in the shared chunk's own stylesheet instead of being duplicated into each entry's, so `./<entry>.css` is not self-contained. No package in this repository declares more than one CSS entry, so none of this affects a published stylesheet today.

The three packages that use Vanilla Extract ship changed CSS. The change is a normalization, not a restructuring — verified against the previous build: the selector sequence and the at-rule sequence are identical, so cascade order and class names are untouched. The declarations themselves are now normalized the way lightningcss normalizes them everywhere else in the repository (`top/right/bottom/left: 0` → `inset: 0`, `flex: 1 1 100%` → `flex: 100%`, `rgba(0,0,0,.5)` → `#00000080`, `200ms` → `.2s`), and `@layer` declarations lightningcss can prove redundant are dropped. Total size is unchanged (vue-app-layout: 15957 → 15959 bytes).
