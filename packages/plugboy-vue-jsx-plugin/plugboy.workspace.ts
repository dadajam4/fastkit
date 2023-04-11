import { defineWorkspaceConfig } from '@fastkit/plugboy';

export default defineWorkspaceConfig({
  ignoreProjectConfig: true,
  entries: {
    '.': './src/index.ts',
  },
});
