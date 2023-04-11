import { defineWorkspaceConfig } from '@fastkit/plugboy';
import { iconFontDTSPreserve } from './src/plugboy-dts-preserve';

export default defineWorkspaceConfig({
  entries: {
    '.': './src/index.ts',
    'plugboy-dts-preserve': './src/plugboy-dts-preserve.ts',
  },
  dts: {
    preserveType: [iconFontDTSPreserve()],
  },
});
