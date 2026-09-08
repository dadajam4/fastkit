import { schema } from './schema';
import { i18n } from '@@';

export const guide = schema.defineComponent({
  locales: {
    ja: () => import('./ja'),
    en: () => import('./en'),
  },
});

export const GuideI18nSpace = i18n.defineSubSpace({ guide });
