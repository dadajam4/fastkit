---
"@fastkit/vui-wysiwyg": patch
---

Reference `@fastkit/vue-form-control` / `@fastkit/vue-utils` types instead of inlining them into the published `.d.ts`. `VWysiwygEditor` spreads `createFormNodeWrapperProps()` (re-exported by `@fastkit/vui`), which previously caused TypeScript to bake **copies** of those form-control declarations into `vui-wysiwyg.d.mts`. Because classes like `FormNodeControl` carry `protected` members and are compared nominally, the inlined copy did not match a consumer's real `@fastkit/vue-form-control` type, so bridging the two (e.g. passing a `VWysiwygEditorAPI` form node to a `@fastkit/vue-form-control` API) raised a spurious `TS2322`. The types are now emitted as `import('@fastkit/vue-form-control')` references and resolve through the required `@fastkit/vui` peer, so they share one identity with the consumer's copy. No new dependencies are required (this is a build-only change; the packages already arrive via `@fastkit/vui`).
