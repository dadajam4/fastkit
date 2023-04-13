import { scheme } from './scheme';

export const guide = scheme.defineComponent({
  locales: {
    ja: () => import('./ja'),
    en: () => import('./en'),
  },
});
