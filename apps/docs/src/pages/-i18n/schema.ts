import { I18nSpaceDefine } from '@@/i18n';

export type Translations = {
  lead: string;
};

export const schema = I18nSpaceDefine.defineSchema({
  translations: (t: Translations) => true,
});
