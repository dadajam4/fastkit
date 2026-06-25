---
'@fastkit/plugboy-vanilla-extract-plugin': patch
---

Split extracted CSS per entry so multi-entry packages emit one `<entry>.css` per entry again.

`@vanilla-extract/rollup-plugin`'s `extract: { name }` mode collects the CSS of every `.css.ts` in the graph into a single bundle, which lost plugboy's per-entry CSS contract: each entry with `css: true` declares a `./<entry>.css` export, but only the main entry's file was ever produced (so e.g. `pkg/secondary.css` 404'd).

The `rename-css` plugin now rebuilds per-entry files from data vanilla-extract already exposes — `moduleInfo.meta.css` (its public hand-off for extracted CSS) keyed by each entry chunk's `imports`. The only coupling to vanilla-extract is `meta.css`; asset names are not parsed and the import statements it strips are not re-added.

- Splitting only happens when more than one entry actually has CSS. With a single CSS entry (the common case) vanilla-extract's already-correct bundle is left untouched, so existing single-entry packages are unaffected.
- The split runs before `plugboy-optimize-css`, so each per-entry file still goes through the postcss optimizations.
- The main entry overwrites vanilla-extract's existing asset in place (re-emitting the same name would trip rolldown's `FILE_NAME_CONFLICT`); other entries are emitted as new assets.
