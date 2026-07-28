---
"@fastkit/plugboy": patch
"@fastkit/vui-wysiwyg": patch
---

Generate a stable entry order in `exposeEntries()`.

`glob` makes no ordering guarantee, and the insertion order of the entries `exposeEntries()` builds becomes the key order of the generated `exports` and `typesVersions`. The result was that building the same sources rewrote the workspace's `package.json` on an arbitrary subset of builds — over seven runs of this repo it flipped back and forth between two orderings, leaving a dirty working tree roughly every other build. The glob result is now sorted, so the generated key order is fixed.

`@fastkit/vui-wysiwyg` is the only workspace using `exposeEntries()`; its `package.json` is committed in the new sorted order and no longer changes when it is rebuilt.
