import { scheme } from './scheme';

export const pkg = scheme.defineComponent({
  locales: {
    ja: () => import('./ja'),
    en: () => import('./en'),
  },
});
