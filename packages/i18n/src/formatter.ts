import {
  I18nDateTimeFormats,
  I18nRelativeTimeFormats,
  I18nNumberFormats,
  I18nListFormats,
  I18N_FORMAT_TYPES,
  I18nFormatType,
  I18N_FORMAT_NAMESPACE_PREFIXS,
  I18nDateTimeFormatArg,
  I18nNumberFormatArg,
  I18nNormalizedFormats,
  I18nListFormatArg,
} from './schemes';

import type { I18nComponentScheme } from './component-scheme';
import type { I18nComponentLocale } from './component-locale';
import type { I18nSpace } from './space';

/**
 * Merged objects with formatter options for all locales in the component schema
 *
 * * But in fact this is only the default option of the component schema until the loading of the component locale is completed
 *
 * @internal
 */
type MergedFormatOptions<LocaleName extends string> = {
  [Type in I18nFormatType]: {
    [Name in LocaleName]: any;
  };
};

/**
 * @internal
 */
type AnyFormatter = Intl.DateTimeFormat | Intl.NumberFormat | Intl.ListFormat;

/**
 * Cache of formatters by format type and locale
 *
 * @internal
 */
type FormatterCache<LocaleName extends string> = {
  [Type in I18nFormatType]: {
    [Name in LocaleName]: {
      [formatName: string]: AnyFormatter | undefined;
    };
  };
};

/**
 * @internal
 * @param localeNames - list of locale name
 */
function createMergedOptions<
  LocaleName extends string,
  DateTimeFormats extends I18nDateTimeFormats,
  RelativeTimeFormats extends I18nRelativeTimeFormats,
  NumberFormats extends I18nNumberFormats,
  ListFormats extends I18nListFormats,
>(
  scheme: I18nComponentScheme<
    LocaleName,
    any,
    any,
    any,
    DateTimeFormats,
    RelativeTimeFormats,
    NumberFormats,
    ListFormats,
    any
  >,
): {
  cache: FormatterCache<LocaleName>;
  mergedOptions: MergedFormatOptions<LocaleName>;
} {
  const cache: FormatterCache<LocaleName> = {} as any;
  const mergedOptions: MergedFormatOptions<LocaleName> = {} as any;

  for (const type of I18N_FORMAT_TYPES) {
    const baseOptions = scheme[`${type}Formats`];
    const cacheBucket = {} as any;
    const optionsBucket = {} as any;

    for (const localeName of scheme.Space.availableLocales) {
      optionsBucket[localeName] = { ...baseOptions };
      cacheBucket[localeName] = {};
    }

    cache[type] = cacheBucket;
    mergedOptions[type] = optionsBucket;
  }
  return {
    cache,
    mergedOptions,
  };
}

const valueNomalizers = {
  dateTime: (value?: I18nDateTimeFormatArg): undefined | number | Date => {
    return typeof value === 'string' ? new Date(value) : value;
  },
  relativeTime: undefined,
  number: (value: I18nNumberFormatArg): number | bigint => {
    return typeof value === 'string' ? parseFloat(value) : value;
  },
  list: undefined,
};

/**
 * List of types that support range system formats
 *
 * * Not yet implemented because the implementation of the range format for numbers is still ambiguous
 */
const RANGE_SUPPORTS: I18nFormatType[] = ['dateTime'];

/**
 * Date and time fomat-related interface
 *
 * @see [Intl.DateTimeFormat](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat)
 */
export interface I18nBuildedDateTimeInterface<
  LocaleName extends string = string,
  DateTimeFormats extends I18nDateTimeFormats = I18nDateTimeFormats,
> {
  /**
   * Get the date/time format setting corresponding to the currently selected locale
   * @returns date/time format setting
   */
  settings(): I18nNormalizedFormats<'dateTime', DateTimeFormats>;

  /**
   * Get the date/time format setting corresponding to the specified locale name
   * @param localeName - Locale name
   * @returns date/time format setting
   */
  settings(
    localeName: LocaleName,
  ): I18nNormalizedFormats<'dateTime', DateTimeFormats>;

  /**
   * Get the date/time formatter corresponding to the currently selected locale
   * @param options - [Intl.DateTimeFormatOptions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat)
   */
  formatter(options?: Intl.DateTimeFormatOptions): Intl.DateTimeFormat;

  /**
   * Get the date/time formatter corresponding to the specified format name and currently selected locale
   * @param formatName - format name
   * @param overrides - Override settings for formatting options. [Intl.DateTimeFormatOptions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat)
   */
  formatter(
    formatName: keyof DateTimeFormats,
    overrides?: Intl.DateTimeFormatOptions,
  ): Intl.DateTimeFormat;

  /**
   * Get the date/time formatter corresponding to the specified format name and locale name(If not specified, the currently selected locale)
   * @param formatName - format name
   * @param localeName - locale name
   * @param overrides - Override settings for formatting options. [Intl.DateTimeFormatOptions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat)
   */
  formatter(
    formatName: keyof DateTimeFormats,
    localeName?: LocaleName,
    overrides?: Intl.DateTimeFormatOptions,
  ): Intl.DateTimeFormat;

  /**
   * Get a date/time formatted string in the currently selected locale
   * @param date - Date and time arguments to be passed to the formatter
   * @param options - [Intl.DateTimeFormatOptions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat)
   */
  format(
    date?: I18nDateTimeFormatArg,
    options?: Intl.DateTimeFormatOptions,
  ): string;

  /**
   * Get a date/time formatted string with the specified format name and currently selected locale
   * @param date - Date and time arguments to be passed to the formatter
   * @param formatName - format name
   * @param overrides - Override settings for formatting options. [Intl.DateTimeFormatOptions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat)
   */
  format(
    date?: I18nDateTimeFormatArg,
    formatName?: keyof DateTimeFormats,
    overrides?: Intl.DateTimeFormatOptions,
  ): string;

  /**
   * Get a date/time formatted string with the specified format name and locale name(If not specified, the currently selected locale)
   * @param date - Date and time arguments to be passed to the formatter
   * @param formatName - format name
   * @param localeName - locale name
   * @param overrides - Override settings for formatting options. [Intl.DateTimeFormatOptions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat)
   */
  format(
    date?: I18nDateTimeFormatArg,
    formatName?: keyof DateTimeFormats,
    localeName?: LocaleName,
    overrides?: Intl.DateTimeFormatOptions,
  ): string;

  /**
   * Get a date/time formatted parts in the currently selected locale
   * @param date - Date and time arguments to be passed to the formatter
   * @param options - [Intl.DateTimeFormatOptions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat)
   */
  parts(
    date?: I18nDateTimeFormatArg,
    options?: Intl.DateTimeFormatOptions,
  ): Intl.DateTimeFormatPart[];

  /**
   * Get a date/time formatted parts with the specified format name and currently selected locale
   * @param date - Date and time arguments to be passed to the formatter
   * @param formatName - format name
   * @param overrides - Override settings for formatting options. [Intl.DateTimeFormatOptions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat)
   */
  parts(
    date?: I18nDateTimeFormatArg,
    formatName?: keyof DateTimeFormats,
    overrides?: Intl.DateTimeFormatOptions,
  ): Intl.DateTimeFormatPart[];

  /**
   * Get a date/time formatted parts with the specified format name and locale name(If not specified, the currently selected locale)
   * @param date - Date and time arguments to be passed to the formatter
   * @param formatName - format name
   * @param localeName - locale name
   * @param overrides - Override settings for formatting options. [Intl.DateTimeFormatOptions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat)
   */
  parts(
    date?: I18nDateTimeFormatArg,
    formatName?: keyof DateTimeFormats,
    localeName?: LocaleName,
    overrides?: Intl.DateTimeFormatOptions,
  ): Intl.DateTimeFormatPart[];

  /**
   * Get a string formatted for the specified two date ranges in the currently selected locale
   * @param startDate - Start date and time
   * @param endDate - End date and time
   * @param options - [Intl.DateTimeFormatOptions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat)
   *
   * @see [formatRangeToParts](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/formatRangeToParts)
   */
  range(
    startDate: I18nDateTimeFormatArg,
    endDate: I18nDateTimeFormatArg,
    options?: Intl.DateTimeFormatOptions,
  ): string;

  /**
   * Obtains formatted strings for the currently selected locale and for the two date ranges in the specified format name.
   * @param startDate - Start date and time
   * @param endDate - End date and time
   * @param formatName - format name
   * @param overrides - Override settings for formatting options. [Intl.DateTimeFormatOptions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat)
   *
   * @see [formatRangeToParts](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/formatRangeToParts)
   */
  range(
    startDate: I18nDateTimeFormatArg,
    endDate: I18nDateTimeFormatArg,
    formatName?: keyof DateTimeFormats,
    overrides?: Intl.DateTimeFormatOptions,
  ): string;

  /**
   * Obtains formatted strings for two date ranges in the specified format name and locale.
   * @param startDate - Start date and time
   * @param endDate - End date and time
   * @param formatName - format name
   * @param localeName - locale name
   * @param overrides - Override settings for formatting options. [Intl.DateTimeFormatOptions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat)
   *
   * @see [formatRangeToParts](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/formatRangeToParts)
   */
  range(
    startDate: I18nDateTimeFormatArg,
    endDate: I18nDateTimeFormatArg,
    formatName?: keyof DateTimeFormats,
    localeName?: LocaleName,
    overrides?: Intl.DateTimeFormatOptions,
  ): string;

  /**
   * Obtains formatted parts for the specified two date ranges in the currently selected locale
   * @param startDate - Start date and time
   * @param endDate - End date and time
   * @param options - [Intl.DateTimeFormatOptions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat)
   *
   * @see [formatRangeToParts](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/formatRangeToParts)
   */
  rangeParts(
    startDate: I18nDateTimeFormatArg,
    endDate: I18nDateTimeFormatArg,
    options?: Intl.DateTimeFormatOptions,
  ): Intl.DateTimeRangeFormatPart[];

  /**
   * Obtains formatted parts for the currently selected locale and for the two date ranges in the specified format name.
   * @param startDate - Start date and time
   * @param endDate - End date and time
   * @param formatName - format name
   * @param overrides - Override settings for formatting options. [Intl.DateTimeFormatOptions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat)
   *
   * @see [formatRangeToParts](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/formatRangeToParts)
   */
  rangeParts(
    startDate: I18nDateTimeFormatArg,
    endDate: I18nDateTimeFormatArg,
    formatName?: keyof DateTimeFormats,
    overrides?: Intl.DateTimeFormatOptions,
  ): Intl.DateTimeRangeFormatPart[];

  /**
   * Obtains formatted parts for two date ranges in the specified format name and locale.
   * @param startDate - Start date and time
   * @param endDate - End date and time
   * @param formatName - format name
   * @param localeName - locale name
   * @param overrides - Override settings for formatting options. [Intl.DateTimeFormatOptions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat)
   *
   * @see [formatRangeToParts](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/formatRangeToParts)
   */
  rangeParts(
    startDate: I18nDateTimeFormatArg,
    endDate: I18nDateTimeFormatArg,
    formatName?: keyof DateTimeFormats,
    localeName?: LocaleName,
    overrides?: Intl.DateTimeFormatOptions,
  ): Intl.DateTimeRangeFormatPart[];
}

/**
 * Relative time formatting related interfaces
 *
 * @see [Intl.RelativeTimeFormat](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat/RelativeTimeFormat)
 */
export interface I18nBuildedRelativeTimeInterface<
  LocaleName extends string = string,
  RelativeTimeFormats extends I18nRelativeTimeFormats = I18nRelativeTimeFormats,
> {
  /**
   * Get the relative time format setting corresponding to the currently selected locale
   * @returns relative time format setting
   */
  settings(): I18nNormalizedFormats<'relativeTime', RelativeTimeFormats>;

  /**
   * Get the relative time format setting corresponding to the specified locale name
   * @param localeName - Locale name
   * @returns relative time format setting
   */
  settings(
    localeName: LocaleName,
  ): I18nNormalizedFormats<'relativeTime', RelativeTimeFormats>;

  /**
   * Get the relative time formatter corresponding to the currently selected locale
   * @param options - [Intl.RelativeTimeFormatOptions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat/RelativeTimeFormat)
   */
  formatter(options?: Intl.RelativeTimeFormatOptions): Intl.RelativeTimeFormat;

  /**
   * Get the relative time formatter corresponding to the specified format name and currently selected locale
   * @param formatName - format name
   * @param overrides - Override settings for formatting options. [Intl.RelativeTimeFormatOptions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat/RelativeTimeFormat)
   */
  formatter(
    formatName: keyof RelativeTimeFormats,
    overrides?: Intl.RelativeTimeFormatOptions,
  ): Intl.RelativeTimeFormat;

  /**
   * Get the relative time formatter corresponding to the specified format name and locale name(If not specified, the currently selected locale)
   * @param formatName - format name
   * @param localeName - locale name
   * @param overrides - Override settings for formatting options. [Intl.RelativeTimeFormatOptions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat/RelativeTimeFormat)
   */
  formatter(
    formatName: keyof RelativeTimeFormats,
    localeName?: LocaleName,
    overrides?: Intl.RelativeTimeFormatOptions,
  ): Intl.RelativeTimeFormat;

  /**
   * Get a relative time formatted string in the currently selected locale
   * @param value - Numeric value to use in the internationalized relative time message
   * @param unit - [Unit](https://tc39.es/ecma402/#sec-singularrelativetimeunit) to use in the relative time internationalized message.
   * @param options - [Intl.RelativeTimeFormatOptions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat/RelativeTimeFormat)
   */
  format(
    value: number,
    unit: Intl.RelativeTimeFormatUnit,
    options?: Intl.RelativeTimeFormatOptions,
  ): string;

  /**
   * Get a relative time formatted string with the specified format name and currently selected locale
   * @param value - Numeric value to use in the internationalized relative time message
   * @param unit - [Unit](https://tc39.es/ecma402/#sec-singularrelativetimeunit) to use in the relative time internationalized message.
   * @param formatName - format name
   * @param overrides - Override settings for formatting options. [Intl.RelativeTimeFormatOptions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat/RelativeTimeFormat)
   */
  format(
    value: number,
    unit: Intl.RelativeTimeFormatUnit,
    formatName?: keyof RelativeTimeFormats,
    overrides?: Intl.RelativeTimeFormatOptions,
  ): string;

  /**
   * Get a relative time formatted string with the specified format name and locale name(If not specified, the currently selected locale)
   * @param value - Numeric value to use in the internationalized relative time message
   * @param unit - [Unit](https://tc39.es/ecma402/#sec-singularrelativetimeunit) to use in the relative time internationalized message.
   * @param formatName - format name
   * @param localeName - locale name
   * @param overrides - Override settings for formatting options. [Intl.RelativeTimeFormatOptions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat/RelativeTimeFormat)
   */
  format(
    value: number,
    unit: Intl.RelativeTimeFormatUnit,
    formatName?: keyof RelativeTimeFormats,
    localeName?: LocaleName,
    overrides?: Intl.RelativeTimeFormatOptions,
  ): string;

  /**
   * Get a relative time formatted parts in the currently selected locale
   * @param value - Numeric value to use in the internationalized relative time message
   * @param unit - [Unit](https://tc39.es/ecma402/#sec-singularrelativetimeunit) to use in the relative time internationalized message.
   * @param options - [Intl.RelativeTimeFormatOptions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat/RelativeTimeFormat)
   */
  parts(
    value: number,
    unit: Intl.RelativeTimeFormatUnit,
    options?: Intl.RelativeTimeFormatOptions,
  ): Intl.RelativeTimeFormatPart[];

  /**
   * Get a relative time formatted parts with the specified format name and currently selected locale
   * @param value - Numeric value to use in the internationalized relative time message
   * @param unit - [Unit](https://tc39.es/ecma402/#sec-singularrelativetimeunit) to use in the relative time internationalized message.
   * @param formatName - format name
   * @param overrides - Override settings for formatting options. [Intl.RelativeTimeFormatOptions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat/RelativeTimeFormat)
   */
  parts(
    value: number,
    unit: Intl.RelativeTimeFormatUnit,
    formatName?: keyof RelativeTimeFormats,
    overrides?: Intl.RelativeTimeFormatOptions,
  ): Intl.RelativeTimeFormatPart[];

  /**
   * Get a relative time formatted parts with the specified format name and locale name(If not specified, the currently selected locale)
   * @param value - Numeric value to use in the internationalized relative time message
   * @param unit - [Unit](https://tc39.es/ecma402/#sec-singularrelativetimeunit) to use in the relative time internationalized message.
   * @param formatName - format name
   * @param localeName - locale name
   * @param overrides - Override settings for formatting options. [Intl.RelativeTimeFormatOptions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat/RelativeTimeFormat)
   */
  parts(
    value: number,
    unit: Intl.RelativeTimeFormatUnit,
    formatName?: keyof RelativeTimeFormats,
    localeName?: LocaleName,
    overrides?: Intl.RelativeTimeFormatOptions,
  ): Intl.RelativeTimeFormatPart[];
}

/**
 * Numeric fomat-related interfaces
 *
 * * Range-based functions have not yet been implemented because browser support is still ambiguous. [Browser compatibility](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat#browser_compatibility)
 *
 * @see [Intl.NumberFormatOptions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat)
 */
export interface I18nBuildedNumberInterface<
  LocaleName extends string = string,
  NumberFormats extends I18nNumberFormats = I18nNumberFormats,
> {
  /**
   * Get the number format setting corresponding to the currently selected locale
   * @returns Number format setting
   */
  settings(): I18nNormalizedFormats<'number', NumberFormats>;

  /**
   * Get the number format setting corresponding to the specified locale name
   * @param locale - Locale name
   * @returns Number format setting
   */
  settings(locale: LocaleName): I18nNormalizedFormats<'number', NumberFormats>;

  /**
   * Get the number formatter corresponding to the currently selected locale
   * @param options - [Intl.NumberFormatOptions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat)
   */
  formatter(options?: Intl.NumberFormatOptions): Intl.NumberFormat;

  /**
   * Get the number formatter corresponding to the specified format name and currently selected locale
   * @param formatName - format name
   * @param overrides - Override settings for formatting options. [Intl.NumberFormatOptions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat)
   */
  formatter(
    formatName: keyof NumberFormats,
    overrides?: Intl.NumberFormatOptions,
  ): Intl.NumberFormat;

  /**
   * Get the number formatter corresponding to the specified format name and locale name(If not specified, the currently selected locale)
   * @param formatName - format name
   * @param localeName - locale name
   * @param overrides - Override settings for formatting options. [Intl.NumberFormatOptions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat)
   */
  formatter(
    formatName: keyof NumberFormats,
    localeName?: LocaleName,
    overrides?: Intl.NumberFormatOptions,
  ): Intl.NumberFormat;

  /**
   * Get a numeric formatted string in the currently selected locale
   * @param value - Numeric arguments to be passed to the formatter
   * @param options - [Intl.NumberFormatOptions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat)
   */
  format(
    value: I18nNumberFormatArg,
    options?: Intl.NumberFormatOptions,
  ): string;

  /**
   * Get a numeric formatted string with the specified format name and currently selected locale
   * @param value - Numeric arguments to be passed to the formatter
   * @param formatName - format name
   * @param overrides - Override settings for formatting options. [Intl.NumberFormatOptions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat)
   */
  format(
    value: I18nNumberFormatArg,
    formatName?: keyof NumberFormats,
    overrides?: Intl.NumberFormatOptions,
  ): string;

  /**
   * Get a numeric formatted string with the specified format name and locale name(If not specified, the currently selected locale)
   * @param value - Numeric arguments to be passed to the formatter
   * @param formatName - format name
   * @param localeName - locale name
   * @param overrides - Override settings for formatting options. [Intl.NumberFormatOptions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat)
   */
  format(
    value: I18nNumberFormatArg,
    formatName?: keyof NumberFormats,
    localeName?: LocaleName,
    overrides?: Intl.NumberFormatOptions,
  ): string;

  /**
   * Get a numeric formatted parts in the currently selected locale
   * @param value - Numeric arguments to be passed to the formatter
   * @param options - [Intl.NumberFormatOptions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat)
   */
  parts(
    value: I18nNumberFormatArg,
    options?: Intl.NumberFormatOptions,
  ): Intl.NumberFormatPart[];

  /**
   * Get a numeric formatted parts with the specified format name and currently selected locale
   * @param value - Numeric arguments to be passed to the formatter
   * @param formatName - format name
   * @param overrides - Override settings for formatting options. [Intl.NumberFormatOptions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat)
   */
  parts(
    value: I18nNumberFormatArg,
    formatName?: keyof NumberFormats,
    overrides?: Intl.NumberFormatOptions,
  ): Intl.NumberFormatPart[];

  /**
   * Get a numeric formatted parts with the specified format name and locale name(If not specified, the currently selected locale)
   * @param value - Numeric arguments to be passed to the formatter
   * @param formatName - format name
   * @param localeName - locale name
   * @param overrides - Override settings for formatting options. [Intl.NumberFormatOptions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat)
   */
  parts(
    value: I18nNumberFormatArg,
    formatName?: keyof NumberFormats,
    localeName?: LocaleName,
    overrides?: Intl.NumberFormatOptions,
  ): Intl.NumberFormatPart[];
}

/**
 * Related interfaces for fomat of list elements
 *
 * @see [Intl.ListFormatOptions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/ListFormat/ListFormat)
 */
export interface I18nBuildedListInterface<
  LocaleName extends string = string,
  ListFormats extends I18nListFormats = I18nListFormats,
> {
  /**
   * Get the list format setting corresponding to the currently selected locale
   * @returns List format setting
   */
  settings(): I18nNormalizedFormats<'list', ListFormats>;

  /**
   * Get the list format setting corresponding to the specified locale name
   * @param locale - Locale name
   * @returns List format setting
   */
  settings(locale: LocaleName): I18nNormalizedFormats<'list', ListFormats>;

  /**
   * Get the list formatter corresponding to the currently selected locale
   * @param options - [Intl.ListFormatOptions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/ListFormat/ListFormat)
   */
  formatter(options?: Intl.ListFormatOptions): Intl.ListFormat;

  /**
   * Get the list formatter corresponding to the specified format name and currently selected locale
   * @param formatName - format name
   * @param localeName - locale name
   * @param overrides - Override settings for formatting options. [Intl.ListFormatOptions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/ListFormat/ListFormat)
   */
  formatter(
    formatName: keyof ListFormats,
    overrides?: Intl.ListFormatOptions,
  ): Intl.ListFormat;

  /**
   * Get the list formatter corresponding to the specified format name and locale name(If not specified, the currently selected locale)
   * @param formatName - format name
   * @param localeName - locale name
   * @param overrides - Override settings for formatting options. [Intl.ListFormatOptions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/ListFormat/ListFormat)
   */
  formatter(
    formatName: keyof ListFormats,
    localeName?: LocaleName,
    overrides?: Intl.ListFormatOptions,
  ): Intl.ListFormat;

  /**
   * Get a list-formatted string in the currently selected locale
   * @param list - Arguments of list type to be passed to the formatter
   * @param options - [Intl.ListFormatOptions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/ListFormat/ListFormat)
   */
  format(list: I18nListFormatArg, options?: Intl.ListFormatOptions): string;

  /**
   * Get a list-formatted string with the specified format name and currently selected locale
   * @param list - Arguments of list type to be passed to the formatter
   * @param formatName - format name
   * @param overrides - Override settings for formatting options. [Intl.ListFormatOptions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/ListFormat/ListFormat)
   */
  format(
    list: I18nListFormatArg,
    formatName?: keyof ListFormats,
    overrides?: Intl.ListFormatOptions,
  ): string;

  /**
   * Get a list-formatted string with the specified format name and locale name(If not specified, the currently selected locale)
   * @param list - Arguments of list type to be passed to the formatter
   * @param formatName - format name
   * @param localeName - locale name
   * @param overrides - Override settings for formatting options. [Intl.ListFormatOptions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/ListFormat/ListFormat)
   */
  format(
    list: I18nListFormatArg,
    formatName?: keyof ListFormats,
    localeName?: LocaleName,
    overrides?: Intl.ListFormatOptions,
  ): string;

  /**
   * Get a list-formatted parts in the currently selected locale
   * @param list - Arguments of list type to be passed to the formatter
   * @param options - [Intl.ListFormatOptions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/ListFormat/ListFormat)
   */
  parts(
    list: I18nListFormatArg,
    options?: Intl.ListFormatOptions,
  ): ReturnType<InstanceType<(typeof Intl)['ListFormat']>['formatToParts']>;

  /**
   * Get a list-formatted parts with the specified format name and currently selected locale
   * @param list - Arguments of list type to be passed to the formatter
   * @param formatName - format name
   * @param overrides - Override settings for formatting options. [Intl.ListFormatOptions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/ListFormat/ListFormat)
   */
  parts(
    list: I18nListFormatArg,
    formatName?: keyof ListFormats,
    overrides?: Intl.ListFormatOptions,
  ): ReturnType<InstanceType<(typeof Intl)['ListFormat']>['formatToParts']>;

  /**
   * Get a list-formatted parts with the specified format name and locale name(If not specified, the currently selected locale)
   * @param list - Arguments of list type to be passed to the formatter
   * @param formatName - format name
   * @param localeName - locale name
   * @param overrides - Override settings for formatting options. [Intl.ListFormatOptions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/ListFormat/ListFormat)
   */
  parts(
    list: I18nListFormatArg,
    formatName?: keyof ListFormats,
    localeName?: LocaleName,
    overrides?: Intl.ListFormatOptions,
  ): ReturnType<InstanceType<(typeof Intl)['ListFormat']>['formatToParts']>;
}

/**
 * An interface with formatting capabilities for use in component instances.
 */
export interface I18nBuildedFormatter<
  LocaleName extends string = string,
  DateTimeFormats extends I18nDateTimeFormats = I18nDateTimeFormats,
  RelativeTimeFormats extends I18nRelativeTimeFormats = I18nRelativeTimeFormats,
  NumberFormats extends I18nNumberFormats = I18nNumberFormats,
  ListFormats extends I18nListFormats = I18nListFormats,
> {
  /**
   * Date and time fomat-related interface
   *
   * @see [Intl.DateTimeFormat](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat)
   */
  dateTime: I18nBuildedDateTimeInterface<LocaleName, DateTimeFormats>;

  /**
   * Date and time fomat-related interface
   *
   * @see [Intl.DateTimeFormat](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat)
   */
  d: I18nBuildedDateTimeInterface<LocaleName, DateTimeFormats>;

  /**
   * Relative time formatting related interfaces
   *
   * @see [Intl.RelativeTimeFormat](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat/RelativeTimeFormat)
   */
  relativeTime: I18nBuildedRelativeTimeInterface<
    LocaleName,
    RelativeTimeFormats
  >;

  /**
   * Relative time formatting related interfaces
   *
   * @see [Intl.RelativeTimeFormat](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat/RelativeTimeFormat)
   */
  rt: I18nBuildedRelativeTimeInterface<LocaleName, RelativeTimeFormats>;

  /**
   * Numeric fomat-related interfaces
   *
   * * Range-based functions have not yet been implemented because browser support is still ambiguous. [Browser compatibility](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat#browser_compatibility)
   *
   * @see [Intl.NumberFormatOptions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat)
   */
  number: I18nBuildedNumberInterface<LocaleName, NumberFormats>;

  /**
   * Numeric fomat-related interfaces
   *
   * * Range-based functions have not yet been implemented because browser support is still ambiguous. [Browser compatibility](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat#browser_compatibility)
   *
   * @see [Intl.NumberFormatOptions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat)
   */
  n: I18nBuildedNumberInterface<LocaleName, NumberFormats>;

  /**
   * Related interfaces for fomat of list elements
   *
   * @see [Intl.ListFormatOptions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/ListFormat/ListFormat)
   */
  list: I18nBuildedListInterface<LocaleName, ListFormats>;

  /**
   * Related interfaces for fomat of list elements
   *
   * @see [Intl.ListFormatOptions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/ListFormat/ListFormat)
   */
  l: I18nBuildedListInterface<LocaleName, ListFormats>;
}

/**
 * Class that provides formatter-related behavior for use in component instances
 *
 * @internal
 */
export class I18nFormatter<
  LocaleName extends string,
  DateTimeFormats extends I18nDateTimeFormats,
  RelativeTimeFormats extends I18nRelativeTimeFormats,
  NumberFormats extends I18nNumberFormats,
  ListFormats extends I18nListFormats,
> {
  /** component schema */
  readonly scheme: I18nComponentScheme<
    LocaleName,
    any,
    any,
    any,
    DateTimeFormats,
    RelativeTimeFormats,
    NumberFormats,
    ListFormats,
    any
  >;

  /** Cache of formatters by format type and locale */
  readonly cache: FormatterCache<LocaleName>;

  /** Merged objects with formatter options for all locales in the component schema */
  readonly mergedOptions: MergedFormatOptions<LocaleName>;

  constructor(
    scheme: I18nComponentScheme<
      LocaleName,
      any,
      any,
      any,
      DateTimeFormats,
      RelativeTimeFormats,
      NumberFormats,
      ListFormats,
      any
    >,
  ) {
    this.scheme = scheme;

    const { cache, mergedOptions } = createMergedOptions(scheme);
    this.cache = cache;
    this.mergedOptions = mergedOptions;
  }

  /**
   * Apply formatters for loaded component locales
   *
   * * This method is called from the component definition when the loading of the component locale is completed
   *
   * @param localeName - locale name
   * @param formats - Loaded locale formatting objects
   */
  applyLocale(
    localeName: LocaleName,
    formats: Pick<
      I18nComponentLocale<
        LocaleName,
        any,
        any,
        any,
        DateTimeFormats,
        RelativeTimeFormats,
        NumberFormats,
        ListFormats,
        any,
        any
      >,
      `${I18nFormatType}Formats`
    >,
  ) {
    for (const type of I18N_FORMAT_TYPES) {
      Object.assign(
        this.mergedOptions[type][localeName],
        formats[`${type}Formats`],
      );
    }
  }

  /**
   * Obtains the format option object corresponding to the specified format type and locale name
   *
   * @param type - format type
   * @param localeName - locale name
   * @returns format option object
   */
  getFormats(type: I18nFormatType, localeName: LocaleName) {
    return this.mergedOptions[type][localeName];
  }

  /**
   * Build formatter-related interfaces for use in component instances
   *
   * * Called once when the component is instantiated
   * * We intentionally ignore many TypeScript type constraints within this method. This is because we believe that the reduction in bundle size is more valuable than the maintenance efficiency of this library.
   * * The behavior of the interface generated by this method is guaranteed by unit tests.
   *
   * @param space - Internationalization Space
   * @returns An interface with formatting capabilities for use in component instances.
   */
  build(
    space: I18nSpace<LocaleName, any, any, any>,
  ): I18nBuildedFormatter<
    LocaleName,
    DateTimeFormats,
    RelativeTimeFormats,
    NumberFormats,
    ListFormats
  > {
    const result: I18nBuildedFormatter<
      LocaleName,
      DateTimeFormats,
      RelativeTimeFormats,
      NumberFormats,
      ListFormats
    > = {} as any;

    for (const type of I18N_FORMAT_TYPES) {
      const typeBucket = {} as any;
      result[type] = typeBucket;

      const NameSpacePrefix = I18N_FORMAT_NAMESPACE_PREFIXS[type];
      const normalizer = valueNomalizers[type];
      const normalizeValue = (value: any) =>
        normalizer ? normalizer(value) : value;

      // settings getter
      const settingsGetter = (
        localeName: LocaleName = space.currentLocaleName,
      ) => {
        return this.getFormats(type, localeName);
      };
      typeBucket.settings = settingsGetter;

      // formatter getter
      const localeFormatterGetterProp =
        `get${NameSpacePrefix}Formatter` as const;
      const cacheBucket = this.cache[type];
      const IntlFormat = Intl[`${NameSpacePrefix}Format`];

      const formatterGetter = (
        optionsOrFormatName?: any,
        localeName: LocaleName = space.currentLocaleName,
        overrides?: any,
      ) => {
        // If no format name or format option is specified, returns the formatter for the currently selected locale
        if (!optionsOrFormatName || typeof optionsOrFormatName === 'object') {
          return space.currentLocale[localeFormatterGetterProp](
            optionsOrFormatName,
          );
        }

        const localeCache = cacheBucket[localeName];

        // If there is no override setting, first check to see if there is a generated cache, and if so, return the cache.
        if (!overrides) {
          const cachedFormatter = localeCache[optionsOrFormatName];
          if (cachedFormatter) return cachedFormatter;
        }

        // Generate formatter
        const formats = this.getFormats(type, localeName);
        const baseOptions = formats[optionsOrFormatName];
        const options = overrides
          ? { ...baseOptions, ...overrides }
          : baseOptions;
        const formatter = new IntlFormat(
          space.getFormatLocales(localeName),
          options,
        );

        if (!overrides) {
          // Cache only if no overwrite setting is specified
          (localeCache as any)[optionsOrFormatName] = formatter;
        }

        return formatter;
      };
      typeBucket.formatter = formatterGetter;

      /**
       *
       * Generate a format method that takes only one argument
       * @param fnName - Name of the formatting function to be called in the target instance of Intl.
       * @returns Formatting Functions
       */
      const buildSingleArgFormatter = (fnName: string) => {
        return (
          value: any,
          optionsOrFormatName?: any,
          localeName: LocaleName = space.currentLocaleName,
          overrides?: any,
        ) => {
          const formatter = formatterGetter(
            optionsOrFormatName,
            localeName,
            overrides,
          );
          return (formatter as any)[fnName](normalizeValue(value));
        };
      };

      /**
       * Generate a format method that takes two arguments
       * @param fnName - Name of the formatting function to be called in the target instance of Intl.
       * @returns Formatting Functions
       */
      const buildDoubleArgsFormatter = (fnName: string) => {
        return (
          startValue: any,
          endValue: any,
          optionsOrFormatName?: any,
          localeName: LocaleName = space.currentLocaleName,
          overrides?: any,
        ) => {
          const formatter: any = formatterGetter(
            optionsOrFormatName,
            localeName,
            overrides,
          );
          return formatter[fnName](
            normalizeValue(startValue),
            normalizeValue(endValue),
          );
        };
      };

      // In `"relativeTime"`, it always takes two arguments.
      const buildBaseFormatter =
        type === 'relativeTime'
          ? buildDoubleArgsFormatter
          : buildSingleArgFormatter;

      // format
      const format = buildBaseFormatter('format');
      typeBucket.format = format;

      // format to parts
      const formatToParts = buildBaseFormatter('formatToParts');
      typeBucket.parts = formatToParts;

      // range formatters
      if (RANGE_SUPPORTS.includes(type)) {
        const formatRange = buildDoubleArgsFormatter('formatRange');
        typeBucket.range = formatRange;

        // format range to parts
        const formatRangeToParts =
          buildDoubleArgsFormatter('formatRangeToParts');
        typeBucket.rangeParts = formatRangeToParts;
      }
    }

    return result;
  }
}
