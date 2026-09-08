---
'@fastkit/vue-location': patch
---

Rename the `Scheme` type parameter of `ExtractQueryInputs` to `Schema`.

It stands for a query definition object — a description of structure — so the word is **schema**. The name of a type parameter is not referenceable, so nothing can break; it shows up in the published declaration file and in editor hints, which is the only reason to release it.
