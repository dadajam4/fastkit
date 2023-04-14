import { I18nSpaceDefine } from '@@/i18n';

export type Translations = {
  motivation: {
    title: string;
    body: string;
  };
  feature: {
    title: string;
    body: string;
  };
  thanks: string;
  contributing: {
    title: string;
    body: string;
  };
  installation: {
    description: string;
  };
  optimization: {
    title: string;
    description: string;
    npm: string;
  };
  packages: {
    title: string;
    description: string;
  };
};

export const scheme = I18nSpaceDefine.defineScheme({
  translations: (t: Translations) => true,
});
