---
"@fastkit/plugboy": patch
"@fastkit/vue-tiny-meta": patch
---

Update `magic-string` from 0.30.x to 1.1.0.

No code changes were needed. magic-string 1.0.0 is a pure-ESM release — the CJS, UMD and IIFE builds were dropped and the type declarations are now generated from its TypeScript source — but the API is unchanged and `MagicString` is still exported as the default. Both packages already ship ESM only, so nothing about how they are consumed changes.

Only append-style operations are used here (`appendLeft` in plugboy's env plugin, `append` in vue-tiny-meta's Vite plugin, both followed by `toString()` and `generateMap({ hires: true })`), so the 1.x fixes around replacement trimming and zero-length range moves do not apply. Emitted code and source maps were compared between 0.30.21 and 1.1.0 for both call shapes and are identical.

Both packages are bumped together so a single magic-string major is installed rather than two side by side.
