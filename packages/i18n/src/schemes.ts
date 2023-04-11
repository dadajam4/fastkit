import { I18nComponentStatic } from './component';

/**
 * Translation objects that can be configured for internationalization services
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface I18nTranslations {}

/**
 * Setting the formatting of Date and time that can be registered for internationalization services
 */
export type I18nDateTimeFormats = Record<string, Intl.DateTimeFormatOptions>;

/**
 * Setting the formatting of relative time that can be registered for internationalization services
 */
export type I18nRelativeTimeFormats = Record<
  string,
  Intl.RelativeTimeFormatOptions
>;

/**
 * Setting the formatting of numbers that can be registered for internationalization services
 */
export type I18nNumberFormats = Record<string, Intl.NumberFormatOptions>;

/**
 * Setting the formatting of list that can be registered with the Internationalization Service
 */
export type I18nListFormats = Record<string, Intl.ListFormatOptions>;

export type I18nAnyFormats =
  | I18nDateTimeFormats
  | I18nRelativeTimeFormats
  | I18nNumberFormats
  | I18nListFormats;

/**
 * Configurable meta information for internationalization service locales
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface I18nLocaleMeta {}

/**
 * Dependent components that can be registered in the spaces and components of the internationalization service
 */
export type I18nDependent<
  LocaleName extends string = string,
  BaseLocale extends LocaleName = LocaleName,
  LocaleMeta extends I18nLocaleMeta = I18nLocaleMeta,
> = I18nComponentStatic<
  LocaleName,
  BaseLocale,
  LocaleMeta,
  any,
  any,
  any,
  any,
  any,
  any
>;

/**
 * Map of dependent components that can be registered in the spaces and components of the internationalization service
 */
export type I18nDependencies<
  LocaleName extends string = string,
  BaseLocale extends LocaleName = LocaleName,
  LocaleMeta extends I18nLocaleMeta = I18nLocaleMeta,
> = Record<string, I18nDependent<LocaleName, BaseLocale, LocaleMeta>>;

/**
 * Instantiated component map
 */
export type I18nInstantiatedDependencies<
  Dependencies extends I18nDependencies<any, any, any>,
> = Readonly<{
  [Name in keyof Dependencies]: ReturnType<
    Dependencies[Name]['createInstance']
  >;
}>;

type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

/**
 * @internal
 */
export type I18nConditionalLocaleMeta<LocaleMeta> =
  RequiredKeys<LocaleMeta> extends never
    ? { meta?: void }
    : { meta: LocaleMeta };

export type I18nTypedImported<T> = T | { default: T };

/**
 * @internal
 */
export function resolveI18nTypedImported<T>(imported: I18nTypedImported<T>): T {
  return imported && typeof imported === 'object' && 'default' in imported
    ? imported.default
    : imported;
}

/**
 * Per-language fallback settings for internationalization services
 */
export type I18nSpaceFallbackLocale<LocaleName extends string> =
  | LocaleName
  | Partial<Record<LocaleName, LocaleName>>;

export const I18N_FORMAT_TYPES = [
  'dateTime',
  'relativeTime',
  'number',
  'list',
] as const;

/**
 * Internationalization Service Format Type
 */
export type I18nFormatType = (typeof I18N_FORMAT_TYPES)[number];

/**
 * @internal
 */
export const I18N_FORMAT_NAMESPACE_PREFIXS = {
  dateTime: 'DateTime' as const,
  relativeTime: 'RelativeTime' as const,
  number: 'Number' as const,
  list: 'List' as const,
};

/**
 * Option type map for each format type
 */
export type I18nFormatOptionsMap = {
  dateTime: Intl.DateTimeFormatOptions;
  relativeTime: Intl.RelativeTimeFormatOptions;
  number: Intl.NumberFormatOptions;
  list: Intl.ListFormatOptions;
};

export type I18nNormalizedFormats<
  Type extends I18nFormatType,
  Formats extends I18nAnyFormats,
> = Record<keyof Formats, I18nFormatOptionsMap[Type]>;

/**
 * Date and time argument to be passed to the formatter
 *
 * - `number` - number of milliseconds since January 1, 1970, 00:00:00 UTC.
 * - `Date` - Instance of Date class
 * - `string` - Date and time strings that can be processed by the Date class
 */
export type I18nDateTimeFormatArg = number | Date | string;

/**
 * Date and time arguments to be passed to the formatter
 */
export type I18nDateTimeFormatArgs = [I18nDateTimeFormatArg];

/**
 * Numeric argument to be passed to the formatter
 *
 * - `number` - numerical value
 * - `bigint` - typeof of bigint
 * - `string` - String that can be parsed as a number
 */
export type I18nNumberFormatArg = number | bigint | string;

/**
 * Argument of list type to be passed to the formatter
 */
export type I18nListFormatArg = Iterable<string>;
