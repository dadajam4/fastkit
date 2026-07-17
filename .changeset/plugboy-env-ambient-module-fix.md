---
"@fastkit/plugboy": patch
---

Fix the Vite-compatible ambient module declarations in `@fastkit/plugboy/env` being inert on the consumer side. The trailing `export {}` made `env.d.ts` a module, and top-level wildcard `declare module '*.svg'` / `*?raw` / CSS declarations in a module file are not registered as global ambient modules — so importing an asset, a `?raw` file, or CSS still failed to type-check (`TS2307` / `TS2882`) even after referencing `@fastkit/plugboy/env`. The file is now a script (plain top-level `declare const` / `declare module`, no trailing `export {}`), so both the `__PLUGBOY_DEV__` / `__PLUGBOY_STUB__` constants and the module declarations apply globally. Fixes #172.
