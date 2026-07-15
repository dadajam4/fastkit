---
"@fastkit/plugboy": minor
"@fastkit/ts-tiny-meta": minor
---

Declare `typescript` as a peer dependency (`^6.0.0 || ^7.0.0`). Both packages use the TypeScript compiler API and/or expose its types in their published `.d.ts`, so declaring it lets them resolve correctly in an isolated install instead of relying on the dependency being hoisted.
