---
'@fastkit/plugboy': patch
---

Add a plugboy-owned `publicDir` workspace option and drop the public `css` option.

- `publicDir` copies a directory (default `./public`, `false` to disable, or a custom path) into the output directory. plugboy performs this copy itself, identically in both `build` and `stub`, so dev (`stub`) and release (`build`) stay in sync without relying on tsdown's `copy` (whose `flatten`/`rename`/function form would diverge between the two). tsdown's `copy` still works for build-time-only assets and is documented as not running during `stub`.
- Remove `css` from the public workspace config (`UserWorkspaceConfig` / `ResolvedWorkspaceConfig`). It was never meaningfully user-settable — CSS plugins (e.g. vanilla-extract) overwrite it — and exposing it conflicted with per-entry CSS handling. It remains as the internal `ctx.css` channel for plugins.
