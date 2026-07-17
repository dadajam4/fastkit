---
"@fastkit/plugboy": minor
---

Add Vite-compatible ambient module types to the `@fastkit/plugboy/env` subpath. Referencing it (already required for the `__PLUGBOY_DEV__` / `__PLUGBOY_STUB__` constants) now also types the non-JS imports plugboy can bundle, mirroring a subset of Vite's `vite/client` types so source written for Vite/tsdown type-checks the same way: static assets (images, media, fonts, `.webmanifest`, `.pdf`, `.txt`, …) as a `string` default export, CSS side-effect imports and CSS Modules, and `?raw` as a `string`. Vite-only features without a plugboy loader (`?url` / `?inline`, `?worker` / `?sharedworker`, `*.wasm?init`, `vite/modulepreload-polyfill`, `vite:preloadError`) are intentionally omitted so the types never imply unsupported behavior.
