import { defineWorkspaceConfig } from '@fastkit/plugboy';

export default defineWorkspaceConfig({
  entries: {
    '.': './src/index.ts',
  },
  // `public/` (templates) is copied into `dist` by the default `publicDir: true`
  // (consistent in both build and stub).
});
