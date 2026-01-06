import { defineWorkspaceConfig } from '@fastkit/plugboy';
import { colorSchemeDTSPreserve } from '@fastkit/color-scheme/plugboy-dts-preserve';
import { mediaMatchDTSPreserve } from '@fastkit/media-match/plugboy-dts-preserve';
import { iconFontDTSPreserve } from '@fastkit/icon-font/plugboy-dts-preserve';

/**
 * Regular expression to remove unwanted types from d.ts files
 * @TODO emits options can no longer be merged since vue3.4.
 * vue-stack src/composables/component.ts EmitsToPropOptions

```
 & {
    [x: `on${Capitalize<string & keyof T_1>}`]: ((...args: never) => any) | undefined;
},
```

*/
const REPLACE_RE =
  /\s+&\s+\{\s+\[x:\s+`on\$\{Capitalize<string\s+&\s+keyof\s+[a-zA-Z\d_]+>\}`\]:[\s\S]+?\}/g;

export default defineWorkspaceConfig({
  entries: {
    '.': {
      src: './src/index.ts',
      css: true,
    },
  },
  dts: {
    preserveType: [
      colorSchemeDTSPreserve(),
      mediaMatchDTSPreserve(),
      iconFontDTSPreserve(),
    ],
    normalizers: [
      (dts) => {
        const replaced = dts.replace(REPLACE_RE, '');
        return replaced;
      },
    ],
  },
  copy: [
    {
      from: 'public',
      to: 'dist',
    },
  ],
});
