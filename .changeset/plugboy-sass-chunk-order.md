---
'@fastkit/plugboy-sass-plugin': patch
---

Concatenate stylesheets in dependency order across chunks.

The styles were ordered by each module's position in the bundle. That puts every entry chunk's modules first, so a `.scss` imported through a chunk shared between entries came after the styles that depend on it. They are now ordered by plugboy's chunk load order: each chunk after the chunks it imports statically, dynamically imported chunks last. Within a chunk, the module order is unchanged.

Requires `@fastkit/plugboy` with the exported chunk ordering (the release this ships with).
