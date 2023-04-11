import { defineWorkspaceConfig } from '@fastkit/plugboy';
import { colorSchemeDTSPreserve } from '@fastkit/color-scheme/plugboy-dts-preserve';

export default defineWorkspaceConfig({
  entries: {
    '.': './src/index.ts',
  },
  dts: {
    preserveType: [colorSchemeDTSPreserve()],
  },
});
