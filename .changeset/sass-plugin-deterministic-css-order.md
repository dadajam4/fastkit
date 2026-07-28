---
"@fastkit/plugboy-sass-plugin": patch
"@fastkit/vui": patch
"@fastkit/vui-wysiwyg": patch
"@fastkit/vue-stack": patch
"@fastkit/vue-loading": patch
"@fastkit/vue-scroller": patch
---

Emit Sass stylesheets in a deterministic order.

`rollup-plugin-sass` appends each stylesheet to a flat array from its `transform` hook and joins that array as-is. rolldown runs `transform` concurrently, so the array ended up in whatever order the transforms happened to finish, and building the same sources twice produced CSS with the rule blocks in a different order — which matters, because that order is the cascade order. Building this repo three times produced three different `vui.css` files.

The plugin now joins the collected entries in the bundle's module execution order, which is already stable. Every stylesheet is a module in the graph, so the order is fully determined; anything the graph does not account for keeps its collected order, after the entries that could be placed.

No rules are added, removed or rewritten — only reordered. This was verified during the build for all five affected packages: the byte length is unchanged and the set of rule blocks is an exact permutation of the previous output. The patch bumps for the CSS-emitting packages are there because their published `.css` changes order.
