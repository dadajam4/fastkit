import { schema } from './schema';

export const Home = schema.defineComponent({
  locales: {
    ja: () => import('./ja'),
    en: () => import('./en'),
  },
});
