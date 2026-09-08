---
'@fastkit/vite-kit': minor
---

Pass `runtimeModule` through to the color-scheme and media-match generators.

`colorSchemeVitePlugin` and `mediaMatchVitePlugin` now accept `runtimeModule` and forward it. `iconFontVitePlugin` already did, since its options extend `IconFontOptions`.

The option decides which module the generated code imports from and augments. It defaults to the leaf runtime package, so nothing changes unless you set it.
