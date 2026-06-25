---
'@fastkit/plugboy-vanilla-extract-plugin': patch
---

Merge plain (non-`.css.ts`) CSS into the per-entry CSS of the entry that imports it.

Plain CSS imported by an entry (e.g. an `@font-face` sheet) flows through tsdown's own CSS pipeline, which combines it into a single file. With per-entry splitting active that combined file was written to a `<package>.css` named after the package directory — a file that is not in `package.json#exports` and is imported by no entry, so consumers reading the real `<entry>.css` lost those styles (e.g. `@font-face` went missing).

`generateBundle` now records which entries import plain CSS (by walking the input module graph), and `writeBundle` merges tsdown's plain-CSS blob into those entries' CSS files instead of the orphan `<package>.css`. With a single CSS entry the original single-file behavior is unchanged.

Note: the combined blob cannot be partitioned per entry, so if several entries import distinct plain CSS each receives the whole blob; in practice plain CSS (fonts/resets) is imported by a single entry. tsdown's native CSS `splitting` is not usable here — it drops plain CSS entirely when vanilla-extract is present.
