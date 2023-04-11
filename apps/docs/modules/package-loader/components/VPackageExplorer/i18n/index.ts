export type { FilterInfo } from './scheme';

import { i18n } from '@@/i18n';

import { packageExploerI18nScheme } from './scheme';

export const PackageExploerI18n = packageExploerI18nScheme.defineComponent({
  name: 'PackageExploer',
  locales: {
    en: () => import('./en'),
    ja: () => import('./ja'),
  },
});

export const PackageExploerI18nSpace = i18n.defineSubSpace({
  PackageExploer: PackageExploerI18n,
});
