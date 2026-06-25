---
'@fastkit/plugboy-vanilla-extract-plugin': patch
---

Allow `LayerStyle` values created by `defineLayerStyle` to be exported from `.css.ts` modules.

The `.css.ts` build is delegated to `@vanilla-extract/rollup-plugin`, whose `serializeVanillaModule` rejects plain function exports — so the documented usage `export const x = defineLayerStyle(...)` (which returns a function) previously crashed the build. `defineLayerStyle` now registers vanilla-extract's official function serializer (`addFunctionSerializer`), emitting deterministic re-construction code instead of throwing.

- Global layers (`{ globalName }`) re-construct via `defineLayerStyle({ globalName, parent })`, whose name is deterministic. Existing behavior is unchanged.
- Scoped layers (`{ debugId }`) carry their build-time hash name verbatim through the new internal `defineLayerStyleFromResolvedName(layerName, parentLayerName)` entry, so the re-constructed reference resolves to the exact layer emitted into CSS (calling `layer()` again would produce a different name).

A re-constructed instance is a reference handle that restores only deterministic state (`layerName` / `parentLayerName`); `hooks` and `extend()` additions are not serialized. This does not affect build-time behavior — hooks run during `.css.ts` evaluation and their CSS is already baked in before serialization.
