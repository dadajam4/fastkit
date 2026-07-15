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
  // `@fastkit/vui` re-exposes `@fastkit/vue-form-control` types through its public
  // API (e.g. `createFormNodeWrapperProps`). Those types are NOT imported by name
  // in this package's source, so TypeScript would otherwise INLINE their concrete
  // declarations into the emitted `.d.ts` (bloat + a nominal type-identity clash
  // with a consumer's real `@fastkit/vue-form-control`). Force them external so the
  // `.d.ts` references them instead. They resolve via `@fastkit/vui` (a required
  // peer that depends on them) — see docs/dependency-management.md.
  deps: {
    neverBundle: ['@fastkit/vue-form-control', '@fastkit/vue-utils'],
  },
});
