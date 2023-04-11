import { I18nLocaleMeta, I18nSpaceFallbackLocale } from './schemes';
import { safeGetCanonicalLocales } from './helpers';

/**
 * Locale Settings for Internationalization Space
 */
export interface I18nLocaleSettings<
  LocaleName extends string,
  LocaleMeta extends I18nLocaleMeta,
> {
  /** locale name */
  name: LocaleName;

  /** meta-information */
  meta?: LocaleMeta;

  /**
   * Locale name of fallback target
   *
   * * If the requested value or formatter is not found, it will also look for a value for the specified locale
   * * It can be configured with this option, but it can also be configured as an i18n-wide option
   * * The basic locale set for the i18n instance will always be used as the fallback for the final stage, so no configuration is required
   */
  fallbackLocale?: LocaleName;

  /**
   * Locale string to be passed to Intl for formatting dates, times, and numbers.
   *
   * * If this is not specified, it defaults to the locale name specified in the language settings
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#locale_identification_and_negotiation
   */
  formatLocales?: string | string[];
}

/**
 * Locale setting or locale name for internationalization space
 */
export type I18nLocaleSource<
  LocaleName extends string,
  LocaleMeta extends I18nLocaleMeta,
> = LocaleName | I18nLocaleSettings<LocaleName, LocaleMeta>;

/**
 * Internationalization Space Locale
 */
export class I18nLocale<
  LocaleName extends string,
  BaseLocale extends LocaleName,
  LocaleMeta extends I18nLocaleMeta,
> {
  /** locale name */
  readonly name: LocaleName;

  /** meta-information */
  readonly meta: LocaleMeta;

  /**
   * Locale name of fallback target
   *
   * * If the requested value or formatter is not found, it will also look for a value for the specified locale
   * * It can be configured with this option, but it can also be configured as an i18n-wide option
   * * The basic locale set for the i18n instance will always be used as the fallback for the final stage, so no configuration is required
   */
  readonly fallbackLocale?: string;

  /**
   * Locale string to be passed to Intl for formatting dates, times, and numbers.
   *
   * * If this is not specified, it defaults to the locale name specified in the language settings
   *
   * @see https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl#locale_identification_and_negotiation
   */
  readonly formatLocales: string | string[];

  /**
   * List of normalized locale names from the formatting language
   *
   * * If the specified locale name is invalid, this is an empty list
   *
   * @see https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/getCanonicalLocales
   */
  readonly canonicalLocales: string[];

  /**
   * Formatters by locale default format type
   *
   * * The locale for this formatter is initialized in `this.formatLocales`.
   */
  readonly formatters: {
    readonly dateTime: Intl.DateTimeFormat;
    readonly relativeTime: Intl.RelativeTimeFormat;
    readonly number: Intl.NumberFormat;
    readonly list: Intl.ListFormat;
  };

  /** Is it a base locale? */
  readonly isBaseLocale: boolean;

  /**
   * List of locale names this locale depends on
   *
   * * The names of the locales are listed in order from the name of their own locale, starting with the name of the locale closest to the dependency.
   * * This always includes the base locale name for the space
   */
  readonly dependencies: LocaleName[];

  /**
   * Initialize the locale for the internationalization space
   *
   * @param source - Locale setting or locale name for internationalization space
   * @param baseLocale - base locale name
   * @param spaceFallbackLocale - Fallback settings for the entire space
   */
  constructor(
    source: I18nLocaleSource<LocaleName, LocaleMeta>,
    baseLocale: BaseLocale,
    spaceFallbackLocale?: I18nSpaceFallbackLocale<LocaleName>,
  ) {
    // Normalize the source
    const objectSource: I18nLocaleSource<LocaleName, LocaleMeta> =
      typeof source === 'string' ? { name: source } : source;

    const {
      name,
      meta = {} as LocaleMeta,
      fallbackLocale,
      formatLocales,
    } = objectSource;

    this.name = name;
    this.meta = meta;
    this.fallbackLocale = fallbackLocale;
    this.formatLocales = formatLocales || name;
    this.isBaseLocale = name === baseLocale;

    const canonicalLocales = safeGetCanonicalLocales(this.formatLocales);
    this.canonicalLocales = canonicalLocales;

    // Initialize default formatter
    this.formatters = {
      dateTime: new Intl.DateTimeFormat(canonicalLocales),
      relativeTime: new Intl.RelativeTimeFormat(canonicalLocales),
      number: new Intl.NumberFormat(canonicalLocales),
      list: new Intl.ListFormat(canonicalLocales),
    };

    // Calculating Dependencies
    const dependencies: LocaleName[] = [name];
    if (fallbackLocale) {
      dependencies.push(fallbackLocale as LocaleName);
    }
    if (spaceFallbackLocale) {
      const spaceFallback =
        typeof spaceFallbackLocale === 'string'
          ? spaceFallbackLocale
          : spaceFallbackLocale[name];
      if (
        spaceFallback &&
        !dependencies.includes(spaceFallback as LocaleName)
      ) {
        dependencies.push(spaceFallback as LocaleName);
      }
    }
    if (!dependencies.includes(baseLocale)) {
      dependencies.push(baseLocale);
    }
    this.dependencies = dependencies;
  }

  getDateTimeFormatter(options?: Intl.DateTimeFormatOptions) {
    if (!options) return this.formatters.dateTime;
    return new Intl.DateTimeFormat(this.formatLocales, options);
  }

  getRelativeTimeFormatter(options?: Intl.RelativeTimeFormatOptions) {
    if (!options) return this.formatters.relativeTime;
    return new Intl.RelativeTimeFormat(this.formatLocales, options);
  }

  getNumberFormatter(options?: Intl.NumberFormatOptions) {
    if (!options) return this.formatters.number;
    return new Intl.NumberFormat(this.formatLocales, options);
  }

  getListFormatter(options?: Intl.ListFormatOptions) {
    if (!options) return this.formatters.list;
    return new Intl.ListFormat(this.formatLocales, options);
  }
}

/**
 * List of locales in the internationalization space
 *
 * * This class provides an Array and a Map-like interface
 */
export class I18nLocales<
  LocaleName extends string,
  BaseLocale extends LocaleName,
  LocaleMeta extends I18nLocaleMeta,
> {
  /** array interface */
  readonly array: I18nLocale<LocaleName, BaseLocale, LocaleMeta>[];

  /** dictionary interface */
  readonly at: Record<
    LocaleName,
    I18nLocale<LocaleName, BaseLocale, LocaleMeta>
  >;

  /** Number of locales */
  get length() {
    return this.array.length;
  }

  /**
   * Initialize locale list
   *
   * @param sources - Locale settings for internationalization spaces or mixed list of locale names
   * @param baseLocale - base locale name
   * @param spaceFallbackLocale - Fallback settings for the entire space
   */
  constructor(
    sources: I18nLocaleSource<LocaleName, LocaleMeta>[],
    baseLocale: BaseLocale,
    spaceFallbackLocale?: I18nSpaceFallbackLocale<LocaleName>,
  ) {
    this.array = sources.map(
      (source) => new I18nLocale(source, baseLocale, spaceFallbackLocale),
    );

    this.at = Object.fromEntries(
      this.array.map((locale) => [locale.name, locale]),
    ) as Record<LocaleName, I18nLocale<LocaleName, BaseLocale, LocaleMeta>>;
  }

  [Symbol.iterator](): IterableIterator<
    I18nLocale<LocaleName, BaseLocale, LocaleMeta>
  > {
    return this.array[Symbol.iterator]();
  }

  /**
   * Get locale by locale name
   *
   * @param localeName - locale name
   * @returns Internationalization Space Locale
   */
  get(localeName: LocaleName): I18nLocale<LocaleName, BaseLocale, LocaleMeta> {
    return this.at[localeName];
  }

  /** Alias to Array class */
  every<S extends I18nLocale<LocaleName, BaseLocale, LocaleMeta>>(
    predicate: (
      value: I18nLocale<LocaleName, BaseLocale, LocaleMeta>,
      index: number,
      array: I18nLocale<LocaleName, BaseLocale, LocaleMeta>[],
    ) => value is S,
  ) {
    return this.array.every<S>(predicate);
  }

  /** Alias to Array class */
  some(
    predicate: (
      value: I18nLocale<LocaleName, BaseLocale, LocaleMeta>,
      index: number,
      array: I18nLocale<LocaleName, BaseLocale, LocaleMeta>[],
    ) => unknown,
  ) {
    return this.array.some(predicate);
  }

  /** Alias to Array class */
  forEach(
    callbackfn: (
      value: I18nLocale<LocaleName, BaseLocale, LocaleMeta>,
      index: number,
      array: I18nLocale<LocaleName, BaseLocale, LocaleMeta>[],
    ) => void,
  ) {
    return this.array.forEach(callbackfn);
  }

  /** Alias to Array class */
  map<U>(
    callbackfn: (
      value: I18nLocale<LocaleName, BaseLocale, LocaleMeta>,
      index: number,
      array: I18nLocale<LocaleName, BaseLocale, LocaleMeta>[],
    ) => U,
  ) {
    return this.array.map<U>(callbackfn);
  }

  /** Alias to Array class */
  filter(
    predicate: (
      value: I18nLocale<LocaleName, BaseLocale, LocaleMeta>,
      index: number,
      array: I18nLocale<LocaleName, BaseLocale, LocaleMeta>[],
    ) => unknown,
  ): I18nLocale<LocaleName, BaseLocale, LocaleMeta>[];

  /** Alias to Array class */
  filter<S extends I18nLocale<LocaleName, BaseLocale, LocaleMeta>>(
    predicate: (
      value: I18nLocale<LocaleName, BaseLocale, LocaleMeta>,
      index: number,
      array: I18nLocale<LocaleName, BaseLocale, LocaleMeta>[],
    ) => value is S,
  ): S[] {
    return this.array.filter<S>(predicate);
  }

  /** Alias to Array class */
  find(
    predicate: (
      value: I18nLocale<LocaleName, BaseLocale, LocaleMeta>,
      index: number,
      obj: I18nLocale<LocaleName, BaseLocale, LocaleMeta>[],
    ) => unknown,
  ): I18nLocale<LocaleName, BaseLocale, LocaleMeta> | undefined;

  /** Alias to Array class */
  find<S extends I18nLocale<LocaleName, BaseLocale, LocaleMeta>>(
    predicate: (
      // this: void,
      value: I18nLocale<LocaleName, BaseLocale, LocaleMeta>,
      index: number,
      obj: I18nLocale<LocaleName, BaseLocale, LocaleMeta>[],
    ) => value is S,
  ): S | undefined {
    return this.array.find<S>(predicate);
  }
}
