---
'@fastkit/plugboy-vanilla-extract-plugin': patch
---

Fix per-entry CSS splitting silently no-op'ing on some rolldown versions.

The split introduced in 4.0.0-next.11 attributed CSS to entries by reading each output chunk's `imports`, but whether vanilla-extract's external virtual CSS ids appear there is rolldown-version-dependent. On versions that list only real output chunks, the lookup found nothing, so multi-entry packages fell back to a single combined `<package>.css` instead of one `<entry>.css` per entry.

CSS is now attributed by walking the input module graph from each entry's `facadeModuleId` via `getModuleInfo().importedIds`, which is stable across rolldown versions and independent of how the output is chunked. A `.css.ts` reached by several entries is included in each entry's file (self-contained per-entry CSS). Single-CSS-entry packages are unaffected.
