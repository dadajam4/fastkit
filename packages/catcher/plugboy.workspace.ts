import { defineWorkspaceConfig } from '@fastkit/plugboy';

export default defineWorkspaceConfig({
  entries: {
    '.': './src/index.ts',
    // Test helpers, on their own path so they never reach an application
    // bundle through the main entry.
    testing: './src/testing.ts',
  },
});
