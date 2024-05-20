import { InjectionKey, inject, provide } from 'vue';
import { createPrefetch } from '@fastkit/vot';
import { SourceFileExports, hydrateExports } from '@fastkit/ts-tiny-meta';

type Types = typeof import('@@@/packages/vue-scoped-loading/typemeta/$types');

export const prefetch = createPrefetch('vue-scoped-loading/api', async () => {
  const exports = (
    await import('@@@/packages/vue-scoped-loading/typemeta/$types.json')
  ).default;
  return {
    exports,
  };
});

const API_META_INJECTION_KEY: InjectionKey<ApiMeta> = Symbol('ApiMeta');

export class ApiMeta {
  static prefetch = prefetch;

  static use(): ApiMeta {
    const meta = inject(API_META_INJECTION_KEY);
    if (!meta) {
      throw new Error('missing provided API meta');
    }
    return meta;
  }

  readonly exports: SourceFileExports;

  readonly types: Types;

  constructor() {
    this.exports = prefetch.inject().exports;
    this.types = hydrateExports(this.exports);
    provide(API_META_INJECTION_KEY, this);
  }
}
