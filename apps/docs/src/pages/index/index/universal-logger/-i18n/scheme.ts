import { I18nSpaceDefine } from '@@/i18n';
import { VNodeChild } from 'vue';

export type Translations = {
  concept: {
    title: string;
    content: () => VNodeChild;
  };
  define: {
    title: string;
  };
  use: {
    title: string;
  };
};

export const scheme = I18nSpaceDefine.defineScheme({
  translations: (t: Translations) => true,
});
