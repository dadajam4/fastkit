import { I18nSpaceDefine } from '../../space';

export type CommonTranslations = {
  appName: string;
  guide: string;
  whatIsFastkit: string;
  tryItOut: string;
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

export const commonScheme = I18nSpaceDefine.defineScheme({
  translations: (t: CommonTranslations) => true,
});
