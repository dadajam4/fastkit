---
'@fastkit/vite-plugin-vui': minor
---

Discard a generated tree that a different toolchain produced, instead of leaving it to the project.

Only `@fastkit/icon-font-gen` skips work when nothing changed, and since #191 it decides that from its own version and options. Nothing else was accounted for:

- a change in `@fastkit/vite-plugin-vui` or `@fastkit/vite-kit` did not reach that decision at all;
- output that is no longer generated was never removed. The watch-mode runner only adds, so dropping an icon-font entry or renaming one left `icon-font/<old-name>/` in place indefinitely.

Projects worked around both by deleting `.vui/` by hand whenever a `@fastkit/*` version moved — a workaround that has to know which directories are generated, and to notice the upgrade in the first place.

`.vui/.manifest.json` now records what produced the tree: the versions of this package, `@fastkit/vite-kit` and the three generators, the module the generated code is written against, and the icon-font entry names. When any of it no longer matches, the directory is emptied before anything is generated into it.

It is written only once every generator has booted, so a run that failed leaves the directory it emptied without a manifest and the next one starts clean again. In the steady state nothing changes: the manifest matches, the directory is left alone, and `@fastkit/icon-font-gen` still skips the expensive work.

The one visible cost is that the first build after any `@fastkit/*` upgrade regenerates the icon font. That is the same work the manual workaround did, now without having to remember it.
