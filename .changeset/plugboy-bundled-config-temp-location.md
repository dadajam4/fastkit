---
'@fastkit/plugboy': patch
---

Write the temporary bundled config file into `<configDir>/node_modules/.plugboy/` instead of next to the config.

When loading `plugboy.project.*` / `plugboy.workspace.*`, `bundle-require` bundles the config to a throwaway `.mjs` before importing it. By default that landed in the repo/package root (e.g. `plugboy.project.bundled_<id>.mjs`), which is noisy and can be left behind if the build is force-killed. It now goes under the config's own `node_modules/.plugboy/` — already gitignored and out of sight — while module resolution is unchanged (Node still walks up to the same `node_modules`).
