import { DeepPartial } from '@fastkit/helpers';
import type { I18n } from './i18n';

export type I18nPrimitiveValue = string | number | boolean | null | undefined;

export type I18nFnValue<
  ValueScheme extends I18nValueScheme<
    ValueScheme,
    DatetimeFormats,
    NumberFormats
  > = I18nValueScheme<any, any, any>,
  DatetimeFormats extends Record<
    string,
    Intl.DateTimeFormatOptions | undefined
  > = Record<string, Intl.DateTimeFormatOptions>,
  NumberFormats extends Record<
    string,
    Intl.NumberFormatOptions | undefined
  > = Record<string, Intl.NumberFormatOptions>,
> = (...args: any[]) => any;

export type I18nValue<
  ValueScheme extends I18nValueScheme<
    ValueScheme,
    DatetimeFormats,
    NumberFormats
  > = I18nValueScheme<any, any, any>,
  DatetimeFormats extends Record<
    string,
    Intl.DateTimeFormatOptions | undefined
  > = Record<string, Intl.DateTimeFormatOptions>,
  NumberFormats extends Record<
    string,
    Intl.NumberFormatOptions | undefined
  > = Record<string, Intl.NumberFormatOptions>,
> =
  | I18nPrimitiveValue
  | I18nFnValue<ValueScheme, DatetimeFormats, NumberFormats>
  | I18nValueScheme<ValueScheme, DatetimeFormats, NumberFormats>;

/**
 * i18n value schema
 */
export type I18nValueScheme<
  ValueScheme extends I18nValueScheme<
    ValueScheme,
    DatetimeFormats,
    NumberFormats
  > = I18nValueScheme<any, any, any>,
  DatetimeFormats extends Record<
    string,
    Intl.DateTimeFormatOptions | undefined
  > = Record<string, Intl.DateTimeFormatOptions>,
  NumberFormats extends Record<
    string,
    Intl.NumberFormatOptions | undefined
  > = Record<string, Intl.NumberFormatOptions>,
> = {
  [key: keyof any]: I18nValue<ValueScheme, DatetimeFormats, NumberFormats>;
};

/**
 * Schema of i18n
 */
export interface I18nScheme<
  ValueScheme extends I18nValueScheme<
    ValueScheme,
    DatetimeFormats,
    NumberFormats
  > = I18nValueScheme<any, any, any>,
  DatetimeFormats extends Record<
    string,
    Intl.DateTimeFormatOptions | undefined
  > = Record<string, Intl.DateTimeFormatOptions>,
  NumberFormats extends Record<
    string,
    Intl.NumberFormatOptions | undefined
  > = Record<string, Intl.NumberFormatOptions>,
> {
  /**
   * i18n value schema
   */
  value?: ValueScheme | undefined;

  /**
   * Datetime Format Settings
   */
  datetimeFormats?: DatetimeFormats | undefined;

  /**
   * Number Format Settings
   */
  numberFormats?: NumberFormats | undefined;
}

/**
 * Helper interface when configuring i18n
 */
export interface I18nSchemeHelpers<
  ValueScheme extends I18nValueScheme<
    ValueScheme,
    DatetimeFormats,
    NumberFormats
  >,
  DatetimeFormats extends Record<
    string,
    Intl.DateTimeFormatOptions | undefined
  >,
  NumberFormats extends Record<string, Intl.NumberFormatOptions | undefined>,
  LocaleName extends string = string,
  Meta extends Record<keyof any, unknown> = Record<keyof any, unknown>,
> {
  /**
   * Get an i18n instance for the language setting being configured
   *
   * * This is basically the assumption used from the function value of the i18n configuration
   * * If this method is called before the i18n instance has been created, an exception will be thrown
   */
  link(): I18n<ValueScheme, DatetimeFormats, NumberFormats, LocaleName, Meta>;

  /**
   * Generate a subschema for this language setting
   *
   * @param subScheme - Schema of i18n. It must partially conform to the basic configuration.
   */
  createSubScheme<
    SubValueScheme extends DeepPartial<ValueScheme>,
    SubDatetimeFormats extends Partial<
      Record<keyof DatetimeFormats, Intl.DateTimeFormatOptions | undefined>
    >,
    SubNumberFormats extends Partial<
      Record<keyof NumberFormats, Intl.NumberFormatOptions | undefined>
    >,
  >(
    subScheme: I18nScheme<SubValueScheme, SubDatetimeFormats, SubNumberFormats>,
  ): BuildedI18nScheme<SubValueScheme, SubDatetimeFormats, SubNumberFormats>;

  /**
   * Generate a subschema that is fully compatible with the interface of this language configuration.
   *
   * @param subScheme - Schema of i18n. Must be fully compatible with this language configuration.
   */
  createStrictSubScheme<
    SubValueScheme extends ValueScheme,
    SubDatetimeFormats extends Partial<
      Record<keyof DatetimeFormats, Intl.DateTimeFormatOptions | undefined>
    >,
    SubNumberFormats extends Partial<
      Record<keyof NumberFormats, Intl.NumberFormatOptions | undefined>
    >,
  >(
    subScheme: I18nScheme<SubValueScheme, SubDatetimeFormats, SubNumberFormats>,
  ): BuildedI18nScheme<SubValueScheme, SubDatetimeFormats, SubNumberFormats>;

  /**
   * Generate a locale settings for this language setting
   *
   * @param subLocaleSettings - Sub locale settings. It must partially conform to the basic configuration.
   */
  createSubLocale<
    SubValueScheme extends DeepPartial<ValueScheme>,
    SubDatetimeFormats extends Partial<
      Record<keyof DatetimeFormats, Intl.DateTimeFormatOptions | undefined>
    >,
    SubNumberFormats extends Partial<
      Record<keyof NumberFormats, Intl.NumberFormatOptions | undefined>
    >,
    SubLocaleName extends string,
  >(
    subLocaleSettings: I18nLocaleSettings<
      SubValueScheme,
      SubDatetimeFormats,
      SubNumberFormats,
      SubLocaleName,
      Meta
    >,
  ): BuildedI18nLocaleSettings<
    ValueScheme,
    DatetimeFormats,
    NumberFormats,
    SubLocaleName,
    Meta
  >;

  /**
   * Generate a locale settings that is fully compatible with the interface of this language configuration.
   *
   * @param subScheme - Sub locale settings. Must be fully compatible with this language configuration.
   */
  createStrictSubLocale<
    SubValueScheme extends ValueScheme,
    SubDatetimeFormats extends Partial<
      Record<keyof DatetimeFormats, Intl.DateTimeFormatOptions | undefined>
    >,
    SubNumberFormats extends Partial<
      Record<keyof NumberFormats, Intl.NumberFormatOptions | undefined>
    >,
    SubLocaleName extends string,
  >(
    subLocaleSettings: I18nLocaleSettings<
      SubValueScheme,
      SubDatetimeFormats,
      SubNumberFormats,
      SubLocaleName,
      Meta
    >,
  ): BuildedI18nLocaleSettings<
    ValueScheme,
    DatetimeFormats,
    NumberFormats,
    SubLocaleName,
    Meta
  >;
}

/**
 * Predefined Internationalization Schema
 *
 * * Helper interface for i18n configuration is given
 */
export interface BuildedI18nScheme<
  ValueScheme extends I18nValueScheme<
    ValueScheme,
    DatetimeFormats,
    NumberFormats
  > = I18nValueScheme<any, any, any>,
  DatetimeFormats extends Record<
    string,
    Intl.DateTimeFormatOptions | undefined
  > = Record<string, Intl.DateTimeFormatOptions>,
  NumberFormats extends Record<
    string,
    Intl.NumberFormatOptions | undefined
  > = Record<string, Intl.NumberFormatOptions>,
> extends I18nScheme<ValueScheme, DatetimeFormats, NumberFormats>,
    I18nSchemeHelpers<ValueScheme, DatetimeFormats, NumberFormats> {}

/**
 * Sub schema of i18n
 */
export interface I18nSubScheme<
  ValueScheme extends I18nValueScheme<
    ValueScheme,
    DatetimeFormats,
    NumberFormats
  > = I18nValueScheme<any, any, any>,
  DatetimeFormats extends Record<
    string,
    Intl.DateTimeFormatOptions | undefined
  > = Record<string, Intl.DateTimeFormatOptions>,
  NumberFormats extends Record<
    string,
    Intl.NumberFormatOptions | undefined
  > = Record<string, Intl.NumberFormatOptions>,
> {
  /**
   * i18n value schema
   */
  value?: DeepPartial<ValueScheme> | undefined;

  /**
   * Datetime Format Settings
   */
  datetimeFormats?: Partial<DatetimeFormats> | undefined;

  /**
   * Number Format Settings
   */
  numberFormats?: Partial<NumberFormats> | undefined;
}

/**
 * i18n configuration loader
 *
 * @param locale - Locale name to be loaded
 */
export type I18nSchemeLoader<
  ValueScheme extends I18nValueScheme<
    ValueScheme,
    DatetimeFormats,
    NumberFormats
  > = I18nValueScheme<any, any, any>,
  DatetimeFormats extends Record<
    string,
    Intl.DateTimeFormatOptions | undefined
  > = Record<string, Intl.DateTimeFormatOptions>,
  NumberFormats extends Record<
    string,
    Intl.NumberFormatOptions | undefined
  > = Record<string, Intl.NumberFormatOptions>,
> = (
  locale: string,
) =>
  | I18nScheme<ValueScheme, DatetimeFormats, NumberFormats>
  | Promise<I18nScheme<ValueScheme, DatetimeFormats, NumberFormats>>;

/**
 * i18n locale settings
 */
export interface I18nLocaleSettings<
  ValueScheme extends I18nValueScheme<
    ValueScheme,
    DatetimeFormats,
    NumberFormats
  > = I18nValueScheme<any, any, any>,
  DatetimeFormats extends Record<
    string,
    Intl.DateTimeFormatOptions | undefined
  > = Record<string, Intl.DateTimeFormatOptions>,
  NumberFormats extends Record<
    string,
    Intl.NumberFormatOptions | undefined
  > = Record<string, Intl.NumberFormatOptions>,
  LocaleName extends string = string,
  Meta extends Record<keyof any, unknown> = Record<keyof any, unknown>,
> {
  /**
   * locale name
   */
  name: LocaleName;

  /**
   * Locale name of fallback target
   *
   * * If the requested value or formatter is not found, it will also look for a value for the specified locale
   * * It can be configured with this option, but it can also be configured as an i18n-wide option
   * * The basic locale set for the i18n instance will always be used as the fallback for the final stage, so no configuration is required
   */
  fallbackLocale?: string;

  /**
   * Locale string to be passed to Intl for formatting dates, times, and numbers.
   *
   * * If this is not specified, it defaults to the locale name specified in the language settings
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#locale_identification_and_negotiation
   */
  formatLocales?: string | string[];

  /**
   * Locale Meta Information
   */
  meta?: Meta;

  /**
   * Configuration of i18n or its loader
   */
  scheme:
    | I18nScheme<ValueScheme, DatetimeFormats, NumberFormats>
    | I18nSchemeLoader<ValueScheme, DatetimeFormats, NumberFormats>;
}

/**
 * Predefined locale settings
 *
 * * Helper interface for i18n configuration is given
 */
export interface BuildedI18nLocaleSettings<
  ValueScheme extends I18nValueScheme<
    ValueScheme,
    DatetimeFormats,
    NumberFormats
  > = I18nValueScheme<any, any, any>,
  DatetimeFormats extends Record<
    string,
    Intl.DateTimeFormatOptions | undefined
  > = Record<string, Intl.DateTimeFormatOptions>,
  NumberFormats extends Record<
    string,
    Intl.NumberFormatOptions | undefined
  > = Record<string, Intl.NumberFormatOptions>,
  LocaleName extends string = string,
  Meta extends Record<keyof any, unknown> = Record<keyof any, unknown>,
> extends I18nLocaleSettings<
      ValueScheme,
      DatetimeFormats,
      NumberFormats,
      LocaleName,
      Meta
    >,
    I18nSchemeHelpers<
      ValueScheme,
      DatetimeFormats,
      NumberFormats,
      LocaleName,
      Meta
    > {}

/**
 * Storage interfaces available for i18n services
 *
 * * Just have get() and set() methods
 * * UI can be reactively updated by setting reactive objects according to your UI framework, etc.
 */
export interface I18nStorage {
  get(key: string): any;
  set(key: string, value: any): any;
}

/**
 * Storage interface used by i18n package built-in
 *
 * * Simple memory storage.
 */
export interface BuiltinI18nStorage extends I18nStorage {
  store: { [key: string]: any };
}

/**
 * Flattened object interface for i18n locale configuration objects
 */
export type I18nFlattenedSchemes = { [key: keyof any]: any };

/**
 * Object interfaces stored in storage in i18n services
 */
export type I18nStorageValueMap<LocaleName extends string = string> = {
  flattenedSchemes: Partial<Record<LocaleName, I18nFlattenedSchemes>>;
  currentLocale: LocaleName;
  nextLocale: LocaleName | null;
  loadingLocales: LocaleName[];
};

/**
 * Configuration options for i18n service
 */
export interface I18nOptions<
  ValueScheme extends I18nValueScheme<
    ValueScheme,
    DatetimeFormats,
    NumberFormats
  >,
  DatetimeFormats extends Record<
    string,
    Intl.DateTimeFormatOptions | undefined
  >,
  NumberFormats extends Record<string, Intl.NumberFormatOptions | undefined>,
  LocaleName extends string,
  Meta extends Record<keyof any, unknown> = Record<keyof any, unknown>,
  Storage extends I18nStorage = I18nStorage,
> {
  /**
   * Storage interface used by the service
   *
   * * If not set, simple memory storage is used by default
   */
  storage?: Storage;

  /**
   * List of locale settings
   *
   * * The locale setting set at the top of the list is used as the base setting (i.e., there must always be at least one locale setting in the list)
   * * For TypeScript type resolution, this base locale must also be properly set as the root locale in your service
   * * Whenever a value is retrieved or formatted by the i18n service and no corresponding value is found for the currently set locale, this base locale setting is always used in the end.
   */
  locales: [
    I18nLocaleSettings<
      ValueScheme,
      DatetimeFormats,
      NumberFormats,
      LocaleName,
      Meta
    >,
    ...I18nLocaleSettings<
      DeepPartial<ValueScheme>,
      Partial<DatetimeFormats>,
      Partial<NumberFormats>,
      LocaleName,
      Meta
    >[],
  ];

  /**
   * First locale name immediately after the i18n service is initialized
   *
   * * If not set, the base locale name is set by default
   */
  defaultLocale?: LocaleName;

  /**
   * Fallback Settings
   *
   * * If a single locale name is specified, the fallback for all locales will be the specified locale
   * * If you specify an object with a locale name as a key, you can specify a locale to fall back to for each locale
   * * If the requested value or formatter is not found, it will also look for a value for the specified locale
   * * It can be configured comprehensively as an option for this i18 service, or individually for each locale-specific option setting
   * * The basic locale set for the i18n instance will always be used as the fallback for the final stage, so no configuration is required
   */
  fallbackLocale?: LocaleName | Partial<Record<LocaleName, LocaleName>>;
}

/**
 * Dependent locale information for each locale in the i18n service
 */
export type I18nDependenciesMap<LocaleName extends string> = {
  [locale in LocaleName]: LocaleName[];
};

/**
 * An object interface that references the value of the currently set locale configuration object in the i18n service
 *
 * * If no value is found for the referenced object value for the currently selected locale, recursively attempts to reference the fallback locale, then the base locale, until a value is found
 * * That is, when referencing a value through this interface, the value is never missing, but it is not necessarily the value for the currently configured locale
 */
export type I18nSchemeAdapter<
  LocaleName extends string,
  ValueScheme extends I18nValueScheme<
    ValueScheme,
    DatetimeFormats,
    NumberFormats
  >,
  DatetimeFormats extends Record<
    string,
    Intl.DateTimeFormatOptions | undefined
  >,
  NumberFormats extends Record<string, Intl.NumberFormatOptions | undefined>,
> = Partial<
  Record<
    LocaleName,
    Required<I18nScheme<ValueScheme, DatetimeFormats, NumberFormats>>
  >
>;
