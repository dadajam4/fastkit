import { defineWorkspaceConfig } from '@fastkit/plugboy';
import { colorSchemeDTSPreserve } from '@fastkit/color-scheme/plugboy-dts-preserve';
import { mediaMatchDTSPreserve } from '@fastkit/media-match/plugboy-dts-preserve';
import { iconFontDTSPreserve } from '@fastkit/icon-font/plugboy-dts-preserve';

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
  },
});
