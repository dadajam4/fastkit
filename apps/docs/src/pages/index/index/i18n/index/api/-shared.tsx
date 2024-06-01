import { createPrefetch } from '@fastkit/vot';
import { VBreadcrumbs } from '@fastkit/vui';
import { hydrateExports } from '@fastkit/ts-tiny-meta';

export const API_CATEGORIES = ['component'] as const;

export type APICategory = (typeof API_CATEGORIES)[number];

export function isAPICategory(source: unknown): source is APICategory {
  return API_CATEGORIES.includes(source as APICategory);
}

type Types = typeof import('@@@/packages/i18n/typemeta/$types');

export const metaPrefetch = createPrefetch('i18n/meta', async () => {
  const exports = (await import('@@@/packages/i18n/typemeta/$types.json'))
    .default;
  // return import('./-meta.$types');
  return {
    exports,
    types: undefined as unknown as Types,
  };
});

const originalInject = metaPrefetch.inject.bind(metaPrefetch);

metaPrefetch.inject = function customInject(...args) {
  const result = originalInject(...args);
  const types = hydrateExports(result!.exports);
  return {
    ...result,
    types,
    // names: Object.keys(types),
  };
};

export function createBreadcrumbs(category: string) {
  return (
    <VBreadcrumbs
      items={[
        {
          to: `/i18n/`,
          text: () => <span class="notranslate">HOME</span>,
        },
        {
          to: `/i18n/api/`,
          text: () => <span class="notranslate">API</span>,
          disabled: true,
        },
        {
          to: `/helpers/api/${category}/`,
          text: () => <span class="notranslate">{category}</span>,
          disabled: true,
        },
      ]}
    />
  );
}
