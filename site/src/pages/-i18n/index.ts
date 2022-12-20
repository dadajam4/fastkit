import { scheme } from './scheme';

export const Home = scheme.defineComponent({
  locales: {
    ja: () => import('./ja'),
    en: () => import('./en'),
  },
});
