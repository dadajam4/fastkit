import { schema } from './schema';

export const pkg = schema.defineComponent({
  locales: {
    ja: () => import('./ja'),
    en: () => import('./en'),
  },
});
