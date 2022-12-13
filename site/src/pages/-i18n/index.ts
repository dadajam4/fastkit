import { scheme } from './scheme';

export const Top = scheme.defineComponent({
  locales: {
    ja: () => import('./ja'),
    en: () => import('./en'),
  },
});
