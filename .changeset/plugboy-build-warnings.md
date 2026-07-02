---
"@fastkit/plugboy": patch
---

Silence two classes of spurious build warnings so real issues stand out.

- **Self-reference / `deps.neverBundle` imports (`UNRESOLVED_IMPORT`):** imports of the package's own name (e.g. `my-pkg/assets/logo.svg`, resolved at runtime via the `exports` map) and subpaths of packages listed in `deps.neverBundle` are now resolved as explicit externals up front, so rolldown no longer emits `UNRESOLVED_IMPORT` for them. Genuinely unresolved specifiers (typos) still warn, and build output is unchanged.
- **Empty declaration chunks (`SOURCEMAP_BROKEN`):** `rolldown-plugin-dts`'s fake-js pass returns a source-map-less string for empty `.d.ts` chunks (e.g. an entry composed solely of external re-exports), which made rolldown emit a spurious `SOURCEMAP_BROKEN` warning. This warning is now filtered — but only when attributed to `rolldown-plugin-dts:fake-js`; genuine JS-chunk sourcemap breakage still warns. The suppression is traceable at debug log level. This is a workaround for an upstream `rolldown-plugin-dts` bug and is documented for removal once fixed upstream.
