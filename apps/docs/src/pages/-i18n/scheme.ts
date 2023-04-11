import { I18nSpaceDefine } from '@@/i18n';

export type Translations = {
  lead: string;
};

export const scheme = I18nSpaceDefine.defineScheme({
  translations: (t: Translations) => true,
});
