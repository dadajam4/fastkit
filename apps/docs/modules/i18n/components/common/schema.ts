import { I18nSpaceDefine } from '../../space';

export type CommonTranslations = {
  appName: string;
  guide: string;
  whatIsFastkit: string;
  howToUse: string;
  installation: string;
  translations: string;
  copied: string;
  packages: string;
  previousPage: string;
  nextPage: string;
  all: string;
  usage: string;
  docIsInPreparation: string;
};

export const commonSchema = I18nSpaceDefine.defineSchema({
  translations: (t: CommonTranslations) => true,
});
