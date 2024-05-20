import { computed, InjectionKey, provide, inject } from 'vue';
import { useVuePageControl, createPrefetch } from '@fastkit/vot';
import { hydrateExports, SourceFileExports } from '@fastkit/ts-tiny-meta';

type Types = typeof import('@@@/packages/helpers/typemeta/$types');

export type APICategory = keyof Types;

export async function getHelpersTypes() {
  const exports = (await import('@@@/packages/helpers/typemeta/$types.json'))
    .default;
  return {
    exports,
  };
}

export const prefetch = createPrefetch('helpers/api', getHelpersTypes);

export const HELPERS_META_INJECTION_KEY: InjectionKey<HelpersMeta> =
  Symbol('HelpersMeta');

export class HelpersMeta {
  static use(): HelpersMeta {
    const meta = inject(HELPERS_META_INJECTION_KEY);
    if (!meta) {
      throw new Error('missing provided HelpersMeta');
    }
    return meta;
  }

  private _hydrated?: Types;

  readonly exports: SourceFileExports;

  readonly names: APICategory[];

  get types(): Types {
    if (!this._hydrated) {
      this._hydrated = hydrateExports(this.exports);
    }
    return this._hydrated;
  }

  constructor(exports: SourceFileExports) {
    this.exports = exports;
    this.names = Object.keys(exports.exports) as APICategory[];
    provide(HELPERS_META_INJECTION_KEY, this);
  }
}

export function useMatchedCategory() {
  const vpc = useVuePageControl();
  const { types, names } = HelpersMeta.use();

  const _matchedCategory = computed(() => {
    const { category } = vpc.route.params;
    const matchedName = names.includes(category as APICategory)
      ? (category as APICategory)
      : null;
    if (!matchedName) return null;
    const _types = types[matchedName];
    return {
      name: matchedName,
      types: _types,
    };
  });

  return {
    types,
    get names() {
      return names;
    },
    // names,
    get matched() {
      return _matchedCategory.value;
    },
  };
}
