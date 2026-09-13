import { defineWorkspaceConfig } from '@fastkit/plugboy';

export default defineWorkspaceConfig({
  entries: {
    '.': './src/index.ts',
    tool: './src/tool/index.ts',
    server: './src/server/index.ts',
    'internal/serve': './src/internal/serve/index.ts',
    head: './src/head.ts',
  },
  deps: {
    neverBundle: [
      'virtual:generated-pages',
      /^@fastkit\/vot/,
      'node-memwatcher',
      '@airbnb/node-memwatch',
    ],
  },
});
