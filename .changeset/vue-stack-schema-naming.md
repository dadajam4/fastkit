---
'@fastkit/vue-stack': patch
---

Rename the internal menu and dialog "scheme" factories to "schema".

`createMenuScheme` / `CreateMenuSchemeOptions` and `createDialogScheme` / `CreateDialogSchemeOptions` build the props, emits and slots definitions of a component — a description of structure, so the word is **schema**, not **scheme**.

None of them is exported, so nothing about the public API changes. The names do reach the published `.d.mts`, though: `CreateMenuSchemaOptions` appears there as a local declaration because `DefineMenuSettings` extends it. A consumer that reached into the declaration file by name would notice; one using the package's exports would not.
