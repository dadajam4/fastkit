---
'@fastkit/plugboy': patch
---

Changes a `preparePackageJSON` hook makes to `json` are now saved to `package.json`. Previously they were silently discarded, so the documented `json.sideEffects = false` had no effect. The hook now receives the content about to be saved, including the generated `exports`, instead of the content read before the update.
