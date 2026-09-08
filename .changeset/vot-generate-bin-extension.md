---
'@fastkit/vot': patch
---

Fix `vot generate`, which could not start.

`bin/generate.mjs` imported the CLI without a file extension:

```js
import { cli } from '../dist/tool';
```

ESM does no extension guessing, so Node threw before anything ran:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '.../packages/vot/dist/tool'
  imported from .../packages/vot/bin/generate.mjs
```

`bin/build.mjs` and `bin/dev.mjs` name `../dist/tool.mjs` correctly; only this one did not, so `vot dev`, `vot build` and `vot serve` were unaffected and `vot generate` had never worked. Present since the first commit.
