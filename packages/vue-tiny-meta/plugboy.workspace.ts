import { defineWorkspaceConfig } from '@fastkit/plugboy';

export default defineWorkspaceConfig({
  entries: {
    '.': './src/index.ts',
    vite: './src/vite/index.ts',
    storybook: './src/storybook/index.ts',
  },
  external: ['typescript'],
});
