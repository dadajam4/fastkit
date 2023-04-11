export * from '@fastkit/i18n';
export { createVueI18nObjectStorage } from './helpers';
export { VueI18nSubSpaceProvider } from './provider';
export { VueI18nContext } from './context';
export type {
  GetClientLanguageResult,
  ServerRedirectFn,
  GetClientLanguage,
  StrategyStorage,
  VueI18nClientSettings,
} from './client';
export { VueI18nClient } from './client';
export * from './strategies';
export { useI18nSpace } from './injections';
export * from './vue-i18n';
