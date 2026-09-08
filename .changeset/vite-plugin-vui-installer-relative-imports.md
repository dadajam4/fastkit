---
'@fastkit/vite-plugin-vui': patch
---

Generate `.vui/installer.ts` with relative imports instead of absolute paths.

Two of its three generated imports carried the absolute path of the machine that ran the build:

```ts
import { colorScheme } from '/Users/someone/work/app/.vui/color-scheme/color-scheme.info';
import '/Users/someone/work/app/.vui/media-match/media-match';
import './icon-font';
```

All three files are written into the same directory as `installer.ts`, so all three can be relative — the third already was. Committing `.vui/` therefore produced a file that resolved nowhere on any other checkout, the emitted output differed between a developer's machine and CI, and on Windows the specifier came out with backslashes.

`ViteVuiPluginResult.settings` still reports absolute paths: those are for programmatic use, not for embedding in generated code.
