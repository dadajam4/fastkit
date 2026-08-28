---
"@fastkit/plugboy-vanilla-extract-plugin": patch
---

Name the single combined stylesheet after the entry that declares the CSS.

plugboy publishes a `./<entry>.css` export for every `css: true` entry, normalizing the main entry (`.`) to the package directory name. With exactly one such entry the plugin turns `css.splitting` off, so the whole package collects into one file named by `css.fileName` — which therefore has to be the name plugboy declared.

That name was derived from whether a `.` entry existed at all, rather than from which entry carries the CSS:

```ts
const cssBaseName = entryIds.includes('.') ? ctx.dir.basename : entryIds[0];
```

The two only agree when `.` is itself the `css: true` entry. A package whose sole CSS entry is a secondary one — say `styles`, alongside a `.` entry with no CSS — emitted `dist/<package>.css` while plugboy declared `./styles.css`, so the published export resolved to a file the build never wrote.

Nothing fails at build time: `plugboy build` is green, the stylesheet is complete, and only its name is wrong. The breakage surfaces in a consumer, as `ENOENT` on an `@import` of the declared path — or, worse, as silently missing styles.

The name is now taken from the sole `css: true` entry, normalized the same way plugboy normalizes it. Packages whose `.` entry carries the CSS are unaffected, and so are packages with several CSS entries, where `splitting` names each stylesheet after its own chunk and `assemble-entry-css` reconciles them with the declared exports.

Every package in this repository declares its CSS on the main entry, so none of them changes shape here; the fix was reported from a downstream package whose `styles` entry carried the CSS. An affected package now emits its stylesheet under the declared name, so a consumer reaching past the package export into a deep `dist/` path has to follow the rename.
