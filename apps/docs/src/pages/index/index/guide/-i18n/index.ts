import { scheme } from './scheme';
import { i18n } from '@@';

export const guide = scheme.defineComponent({
  locales: {
    ja: () => import('./ja'),
    en: () => import('./en'),
  },
});

export const GuideI18nSpace = i18n.defineSubSpace({ guide });
