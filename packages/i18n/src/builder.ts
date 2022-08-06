/* eslint-disable @typescript-eslint/ban-types */
import {
  I18nValueScheme,
  I18nLocaleSettings,
  I18nScheme,
  BuildedI18nLocaleSettings,
  BuildedI18nScheme,
  I18nSchemeHelpers,
  I18nStorage,
} from './schemes';
import { LINKED_SYMBOL } from './injections';
import { I18nError } from './logger';

function injectSchemeHelpers<T extends I18nLocaleSettings | I18nScheme>(
  target: T,
): T & I18nSchemeHelpers<any, any, any> {
  const builded: T & I18nSchemeHelpers<any, any, any> = {
    ...target,
    link() {
      const service = (this as any)[LINKED_SYMBOL];
      if (!service) {
        throw new I18nError(
          'There is no linked I18n service. The link() method cannot operate until the locale settings are initialized on the service instance.',
        );
      }
      return service;
    },
    createSubScheme(subScheme) {
      return defineI18nScheme(subScheme as any) as any;
    },
    createStrictSubScheme(subScheme) {
      return defineI18nScheme(subScheme as any) as any;
    },
    createSubLocale(subLocaleSettings) {
      return defineLocale(subLocaleSettings as any) as any;
    },
    createStrictSubLocale(subLocaleSettings) {
      return defineLocale(subLocaleSettings as any) as any;
    },
  };

  (builded as any).clone = function clone() {
    const cloned = { ...builded };
    delete (cloned as any)[LINKED_SYMBOL];
    return cloned;
  };

  return builded;
}

/**
 * Define i18n configuration
 *
 * @param scheme - i18n value schema
 * @returns Configured i18n configuration
 */
export function defineI18nScheme<
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
>(
  scheme: I18nScheme<ValueScheme, DatetimeFormats, NumberFormats>,
): BuildedI18nScheme<ValueScheme, DatetimeFormats, NumberFormats> {
  return injectSchemeHelpers(scheme as I18nScheme) as BuildedI18nScheme<
    ValueScheme,
    DatetimeFormats,
    NumberFormats
  >;
}

/**
 * Define i18n locale settings
 *
 * @param scheme - i18n locale settings
 * @returns Configured i18n locale settings
 */
export function defineLocale<
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
>(
  settings: I18nLocaleSettings<
    ValueScheme,
    DatetimeFormats,
    NumberFormats,
    LocaleName,
    Meta
  >,
): BuildedI18nLocaleSettings<
  ValueScheme,
  DatetimeFormats,
  NumberFormats,
  LocaleName,
  Meta
> {
  return injectSchemeHelpers(
    settings as I18nLocaleSettings,
  ) as BuildedI18nLocaleSettings<
    ValueScheme,
    DatetimeFormats,
    NumberFormats,
    LocaleName,
    Meta
  >;
}

/**
 * Define the storage available in i18n
 *
 * @param storage - storage interface (Must meet I18nStorage constraints)
 */
export function defineI18nStorage<Storage extends I18nStorage>(
  storage: Storage,
): Storage {
  return storage;
}
