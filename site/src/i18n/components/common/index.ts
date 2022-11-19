import { commonScheme } from './scheme';

export const Common = commonScheme.defineComponent({
  name: 'Common',
  locales: {
    ja: () => import('./ja'),
    en: () => import('./en'),
  },
});
