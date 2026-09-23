---
'@fastkit/plugboy-vanilla-extract-plugin': patch
---

Leave `css.splitting` and `css.fileName` to plugboy.

The plugin used to default `splitting` to `false` for a single CSS entry, which handed the package's stylesheet to tsdown's merge. That merge concatenates chunks in bundle order, so a `.css.ts` whose styles are composed from another chunk could end up after the styles built on it. plugboy now sets both keys itself and builds the stylesheet in dependency order. The plugin no longer reserves any `css` option.

Requires `@fastkit/plugboy` with dependency-ordered stylesheets (the release this ships with). Upgrade the two together.
