---
'@fastkit/plugboy': patch
'@fastkit/vue-color-scheme': patch
'@fastkit/vui': patch
---

Stop the DTS type-preserve step from emitting a duplicate import.

When a declaration file already imported the names it needed, plugboy added a second import of the same module anyway, binding each name twice:

```ts
import { ThemeName, PaletteName, ScopeName, ColorVariant } from '@fastkit/color-scheme';
import { ColorSchemeInfo, ..., ColorVariant, ColorVariant as ColorVariant$1, ... } from "@fastkit/color-scheme";
```

Consumers type-checking with `skipLibCheck: false` got `TS2300: Duplicate identifier` for every name. It reproduced in `@fastkit/vue-color-scheme` (8 errors) and `@fastkit/vui` (6), and surfaced in anything depending on them — `@fastkit/vue-loading`, `@fastkit/vui-wysiwyg` and `@fastkit/vite-plugin-vui`.

The step looked for an existing import with a single-quoted specifier, while the declaration bundler emits double-quoted ones, so it never found the statement it was supposed to merge into. It now matches either quote style, merges into the existing statement keeping its quoting, and treats a name as already available when *any* import in the file binds it — `ScopeName` reaches `@fastkit/vui` through both `@fastkit/color-scheme` and `@fastkit/vue-color-scheme`, so importing it again collided even though the modules differ.

`@fastkit/vue-color-scheme` and `@fastkit/vui` are released with it so the corrected declarations reach consumers; their emitted API is otherwise unchanged.
