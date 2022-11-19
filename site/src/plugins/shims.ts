import { I18nSpace } from '~/i18n';
import { AuthSearvice } from './auth';

declare module '@fastkit/vue-page' {
  interface VuePageControl {
    i18n: I18nSpace;
    auth: AuthSearvice;
  }
}
