import { defineWorkspaceConfig } from '@fastkit/plugboy';

export default defineWorkspaceConfig({
  entries: {
    '.': './src/index.ts',
    tool: './src/tool/index.ts',
    server: './src/server/index.ts',
  },
  external: [
    'virtual:generated-pages',
    /^\@fastkit\/vot/,
    'node-memwatcher',
    '@airbnb/node-memwatch',
  ],
});
