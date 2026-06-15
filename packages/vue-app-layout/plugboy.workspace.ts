import { defineWorkspaceConfig } from '@fastkit/plugboy';

export default defineWorkspaceConfig({
  entries: {
    '.': {
      src: './src/index.ts',
      css: true,
    },
  },
});
