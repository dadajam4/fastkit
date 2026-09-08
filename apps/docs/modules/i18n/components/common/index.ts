import { commonSchema } from './schema';

export const Common = commonSchema.defineComponent({
  name: 'Common',
  locales: {
    ja: () => import('./ja'),
    en: () => import('./en'),
  },
});
