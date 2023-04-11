import type { I18nSpace, I18nSpaceStatic } from '@fastkit/i18n';

/** Internationalization Space Definition */
export type AnySpaceStatic = I18nSpaceStatic<string, string, any>;

/** i18n space instance */
export type AnySpace = I18nSpace<string, string, any, any>;
