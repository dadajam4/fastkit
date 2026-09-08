import { i18n } from '@@/i18n';

import { packageExploerI18nSchema } from './schema';

export type { FilterInfo } from './schema';

export const PackageExploerI18n = packageExploerI18nSchema.defineComponent({
  name: 'PackageExploer',
  locales: {
    en: () => import('./en'),
    ja: () => import('./ja'),
  },
});

export const PackageExploerI18nSpace = i18n.defineSubSpace({
  PackageExploer: PackageExploerI18n,
});
