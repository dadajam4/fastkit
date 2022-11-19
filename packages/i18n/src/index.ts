export type {
  I18nTranslations,
  I18nDateTimeFormats,
  I18nRelativeTimeFormats,
  I18nNumberFormats,
  I18nListFormats,
  I18nNormalizedFormats,
  I18nLocaleMeta,
  I18nDependencies,
  I18nInstantiatedDependencies,
  I18nSpaceFallbackLocale,
  I18nFormatType,
} from './schemes';
export type {
  I18nStorage,
  I18nStorageFactory,
  I18nStorageOrFactory,
  I18nStorageAnyData,
} from './storage';
export { createI18nObjectStorage } from './storage';
export type {
  I18nLocaleSettings,
  I18nLocaleSource,
  I18nLocale,
  I18nLocales,
} from './locale';
export type {
  I18nSpaceStaticSettings,
  I18nSpaceOptions,
  I18nSpace,
  I18nSpaceStatic,
  I18nSubSpace,
} from './space';
export { defineI18nSpace } from './space';
export type { I18nSpaceStorageData } from './space-storage';
export type {
  I18nComponentSchemeSettings,
  I18nComponentScheme,
} from './component-scheme';
export type {
  I18nTranslationsData,
  I18nTranslationsFactory,
  I18nTranslationsOrFactory,
  I18nComponentLocaleSettings,
  I18nComponentLocale,
} from './component-locale';
export type {
  I18nComponentLocales,
  I18nComponentStaticSettings,
  I18nComponent,
  I18nComponentStatic,
} from './component';
