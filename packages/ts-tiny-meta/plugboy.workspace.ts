import { defineWorkspaceConfig } from '@fastkit/plugboy';

export default defineWorkspaceConfig({
  entries: {
    '.': './src/index.ts',
    ts: './src/ts/index.ts',
    vite: './src/vite/index.ts',
    'ts-morph': './src/dependencies/ts-morph.ts',
  },
  external: ['typescript'],
});
