import { defineWorkspaceConfig, exposeEntries } from '@fastkit/plugboy';

const deps = await exposeEntries({
  dir: './src/dependencies',
});

export default defineWorkspaceConfig({
  entries: {
    '.': {
      src: './src/index.ts',
      css: true,
    },
    ...deps,
  },
});
