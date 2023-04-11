import { I18nSpaceDefine } from '@@/i18n';

export interface FilterInfo {
  name: string;
  description?: string;
}

export type PackageExploerTranslations = {
  header: {
    name: string;
    scope: string;
    feature: string;
    description: string;
  };
  scopes: Record<string, FilterInfo>;
  features: Record<string, FilterInfo>;
};

export const packageExploerI18nScheme = I18nSpaceDefine.defineScheme({
  translations: (t: PackageExploerTranslations) => true,
});
