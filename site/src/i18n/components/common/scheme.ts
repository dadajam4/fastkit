import { I18nSpaceDefine } from '../../space';

export type CommonTranslations = {
  appName: string;
  getStarted: string;
};

export const commonScheme = I18nSpaceDefine.defineScheme({
  translations: (t: CommonTranslations) => true,
});
