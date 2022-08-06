import {
  I18nOptions,
  I18nStorage,
  I18nStorageValueMap,
  I18nDependenciesMap,
  I18nLocaleSettings,
  I18nValueScheme,
  I18nFlattenedSchemes,
  I18nScheme,
  I18nSubScheme,
  I18nSchemeAdapter,
} from './schemes';
import {
  isPromise,
  arrayRemove,
  mapFromObjectArray,
  DeepPartial,
  toDate,
} from '@fastkit/helpers';
import {
  toFlattenedObject,
  createBuiltinStorage,
  createI18nDependenciesMap,
  normalizeLocale,
  injectI18n,
} from './helpers';
import { I18nError } from './logger';

/**
 * i18n class of service
 */
export class I18n<
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
  Storage extends I18nStorage = I18nStorage,
> {
  /**
   * Storage interfaces available for i18n services
   *
   * * The get() and set() methods are mandatory, and the rest are optional settings when the i18n service is instantiated.
   */
  readonly storage: Storage;

  /**
   * List of locale settings
   *
   * * The locale setting at the top of the list is the base locale setting (i.e., there is always at least one locale setting in the list)
   * * Whenever a value is retrieved or formatted by the i18n service and no corresponding value is found for the currently set locale, this base locale setting is always used in the end.
   */
  readonly locales: [
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
   * Map object of configuration information for all locales as configured in i18n service options
   */
  readonly localesMap: Record<
    LocaleName,
    I18nLocaleSettings<
      ValueScheme,
      DatetimeFormats,
      NumberFormats,
      LocaleName,
      Meta
    >
  >;

  /**
   * List of available locale names
   */
  readonly availableLocales: LocaleName[];

  /**
   * base locale name
   */
  readonly baseLocale: LocaleName;

  /**
   * default locale name
   */
  readonly defaultLocale: LocaleName;

  /**
   * Dependent locale information for each locale in the i18n service
   */
  readonly dependenciesMap: I18nDependenciesMap<LocaleName>;

  /**
   * Map object of promiscuous instances of per-locale loading process
   */
  private _loadPromiseMap: Partial<Record<LocaleName, Promise<any>>> = {};

  /**
   * An object interface that references the value of the currently set locale configuration object in the i18n service
   *
   * * If no value is found for the referenced object value for the currently selected locale, recursively attempts to reference the fallback locale, then the base locale, until a value is found
   * * That is, when referencing a value through this interface, the value is never missing, but it is not necessarily the value for the currently configured locale
   */
  private _adapter: I18nSchemeAdapter<
    LocaleName,
    ValueScheme,
    DatetimeFormats,
    NumberFormats
  > = {};

  /**
   * Map of Intl formatter cache
   */
  private _formatterCache: {
    datetime: Partial<Record<string, Intl.DateTimeFormat>>;
    number: Partial<Record<string, Intl.NumberFormat>>;
  } = {
    datetime: {},
    number: {},
  };

  /**
   * Locale setting corresponding to the currently selected locale
   */
  get currentLocaleSettings() {
    return this.getLocaleSettings();
  }

  /**
   * Meta object corresponding to the currently selected locale
   */
  get currentMeta(): Meta {
    return this.meta();
  }

  /**
   * Locale name for formatting to the currently selected locale
   */
  get currentFormatLocales() {
    return this.getFormatLocales();
  }

  /**
   * Object interface for locale value reference corresponding to the currently selected locale
   *
   * * If no value is found for the referenced object value for the currently selected locale, recursively attempts to reference the fallback locale, then the base locale, until a value is found
   * * That is, when referencing a value through this interface, the value is never missing, but it is not necessarily the value for the currently configured locale
   */
  get trans() {
    return this.adapter().value;
  }

  /**
   * Object interface for locale value reference corresponding to the currently selected locale
   *
   * * If no value is found for the referenced object value for the currently selected locale, recursively attempts to reference the fallback locale, then the base locale, until a value is found
   * * That is, when referencing a value through this interface, the value is never missing, but it is not necessarily the value for the currently configured locale
   */
  get t() {
    return this.trans;
  }

  /**
   * Date and time format settings for the currently selected locale
   */
  get datetimeFormats() {
    return this.getDatetimeFormats();
  }

  /**
   * Number format settings for the currently selected locale
   */
  get numberFormats() {
    return this.getNumberFormats();
  }

  /**
   * Currently selected locale name
   */
  get currentLocale(): LocaleName {
    return this._getStorageValue('currentLocale');
  }

  /**
   * List of locale names currently under loading
   */
  get loadingLocales() {
    return this._getStorageValue('loadingLocales');
  }

  /**
   * `true` if any locale is in the process of loading.
   */
  get isLoading() {
    return this.loadingLocales.length > 0;
  }

  /**
   * List of locale names on which the currently selected locale depends
   */
  get dependencies(): LocaleName[] {
    return this._getLocaleDependencies();
  }

  /**
   * Name of the locale that is about to be set next
   *
   * * Value present when the locale configuration is being loaded by the `setLocale()` method.
   */
  get nextLocale() {
    return this._getStorageValue('nextLocale');
  }

  /**
   * Initialize I18n service
   *
   * @param options - Configuration options for i18n service
   */
  constructor(
    options: I18nOptions<
      ValueScheme,
      DatetimeFormats,
      NumberFormats,
      LocaleName,
      Meta,
      Storage
    >,
  ) {
    const {
      storage = createBuiltinStorage(),
      locales,
      defaultLocale,
    } = options;
    this.storage = storage as Storage;
    this.locales = locales;
    this.localesMap = mapFromObjectArray(
      locales,
      'name',
    ) as typeof this.localesMap;
    this.baseLocale = locales[0].name;
    this.availableLocales = locales.map((locale) => locale.name);
    this.defaultLocale = defaultLocale || this.baseLocale;
    this.dependenciesMap = createI18nDependenciesMap(options);

    // setup storage values
    this._setStorageValue('flattenedSchemes', {});
    this._setStorageValue('currentLocale', this.defaultLocale);
    this._setStorageValue('nextLocale', null);
    this._setStorageValue('loadingLocales', []);

    // auto setup schems
    this.availableLocales.forEach((locale) => {
      const settings = this.localesMap[locale];
      injectI18n(this, settings, locale);
      if (typeof settings.scheme !== 'function') {
        this._setLocaleScheme(locale, settings.scheme);
      }
    });
  }

  /**
   * Checks if the specified locale name (or similar string) is a valid locale name for this instance
   * @param localeLikeString - Locale name (or similar name)
   * @returns `true` if it is a valid locale name
   */
  isAvailableLocale(
    localeLikeString: LocaleName | string,
  ): localeLikeString is LocaleName {
    return this.availableLocales.includes(localeLikeString as LocaleName);
  }

  /**
   * Checks if the specified locale name (or similar string) is the base locale name
   * @param localeLikeString - Locale name (or similar name)
   * @returns `true` if it is a base locale name
   */
  isBaseLocale(localeLikeString: LocaleName | string) {
    return localeLikeString === this.baseLocale;
  }

  /**
   * Converts the specified locale name (or similar string) to a locale name valid for this instance
   *
   * * This method splits the given string with a hyphen string (`"-"`) to get the most likely locale name
   * * If no locale name matches, the base locale name is selected
   *
   * @param localeLikeString - Locale name (or similar name)
   */
  resolveLocale(
    localeLikeString: LocaleName | string = this.currentLocale,
  ): LocaleName {
    if (this.isAvailableLocale(localeLikeString)) {
      return localeLikeString;
    }
    localeLikeString = normalizeLocale(localeLikeString as string);
    let resolved: LocaleName | undefined;
    while (true) {
      for (const locale of this.availableLocales) {
        const normalizedLocale = normalizeLocale(locale);
        if (normalizedLocale === localeLikeString) {
          resolved = locale;
          break;
        }
      }
      if (resolved) {
        break;
      }
      const tmp: string[] = localeLikeString.split('-');
      tmp.length = tmp.length - 1;
      if (!tmp.length) {
        break;
      }
      localeLikeString = tmp.join('-');
    }
    return resolved || this.defaultLocale;
  }

  /**
   * Load all dependencies locales of the currently selected locale that have not yet been loaded
   */
  init() {
    return this._ensureLocales(this.dependencies);
  }

  /**
   * Sets the specified locale name and loads dependencies if not already loaded
   * @param locale - locale name
   */
  setLocale(locale: LocaleName): Promise<void>;

  /**
   * Sets the specified locale name and loads dependencies if not already loaded
   * @param localeLikeString - locale name (or similar name)
   */
  setLocale(localeLikeString: string): Promise<void>;

  setLocale(localeLikeString: LocaleName | string): Promise<void> {
    const locale = this.resolveLocale(localeLikeString);
    if (this.localeIsLoaded(locale)) {
      this._setCurrentLocale(locale);
      return Promise.resolve();
    }
    this._setNextLocale(locale);
    const dependencies = this._getLocaleDependencies(locale);
    return this._ensureLocales(dependencies).then(() => {
      this._setCurrentLocale(locale);
    });
  }

  /**
   * Checks if the configuration corresponding to the specified locale name has already been loaded
   * @param locale - locale name
   * @returns `true` if already loaded
   */
  localeIsLoaded(locale: LocaleName) {
    return !!this._getLoadedValueScheme(locale);
  }

  /**
   * Obtain the object interface for the locale configuration reference corresponding to the currently selected locale.
   *
   * * If no value is found for the referenced object value for the currently selected locale, recursively attempts to reference the fallback locale, then the base locale, until a value is found
   * * That is, when referencing a value through this interface, the value is never missing, but it is not necessarily the value for the currently configured locale
   */
  adapter(): Required<I18nScheme<ValueScheme, DatetimeFormats, NumberFormats>>;

  /**
   * Obtains the object interface for the locale configuration reference corresponding to the specified locale name.
   *
   * * If no value is found for the referenced object value for the currently selected locale, recursively attempts to reference the fallback locale, then the base locale, until a value is found
   * * That is, when referencing a value through this interface, the value is never missing, but it is not necessarily the value for the currently configured locale
   *
   * @param locale - locale name
   */
  adapter(
    locale?: LocaleName,
  ): Required<I18nScheme<ValueScheme, DatetimeFormats, NumberFormats>>;

  /**
   * Obtains the object interface for the locale configuration reference corresponding to the specified locale name (or similar name).
   *
   * * If no value is found for the referenced object value for the currently selected locale, recursively attempts to reference the fallback locale, then the base locale, until a value is found
   * * That is, when referencing a value through this interface, the value is never missing, but it is not necessarily the value for the currently configured locale
   *
   * @param localeLikeString - locale name (or similar name)
   */
  adapter(
    localeLikeString?: string,
  ): Required<I18nScheme<ValueScheme, DatetimeFormats, NumberFormats>>;

  adapter(
    localeLikeString: LocaleName | string = this.currentLocale,
  ): Required<I18nScheme<ValueScheme, DatetimeFormats, NumberFormats>> {
    const locale = this.resolveLocale(localeLikeString);
    const scheme = this._adapter[locale];
    if (!scheme) {
      const suffix = locale === localeLikeString ? '' : `(${localeLikeString})`;
      throw new I18nError(
        `The locale "${locale}"${suffix} has not been loaded yet.`,
      );
    }
    return scheme;
  }

  /**
   * Get the locale setting corresponding to the currently selected locale
   *
   * @returns locale setting
   */
  getLocaleSettings(): Record<
    LocaleName,
    I18nLocaleSettings<
      ValueScheme,
      DatetimeFormats,
      NumberFormats,
      LocaleName,
      Meta
    >
  >[LocaleName];

  /**
   * Get the locale setting corresponding to the specified locale name
   *
   * @param locale - locale name
   * @returns locale setting
   */
  getLocaleSettings(
    locale: LocaleName,
  ): Record<
    LocaleName,
    I18nLocaleSettings<
      ValueScheme,
      DatetimeFormats,
      NumberFormats,
      LocaleName,
      Meta
    >
  >[LocaleName];

  /**
   * Get the locale setting corresponding to the specified locale name (or similar name)
   *
   * @param localeLikeString - Locale name (or similar name)
   * @returns locale setting
   */
  getLocaleSettings(
    localeLikeString?: string,
  ): Record<
    LocaleName,
    I18nLocaleSettings<
      ValueScheme,
      DatetimeFormats,
      NumberFormats,
      LocaleName,
      Meta
    >
  >[LocaleName];

  getLocaleSettings(
    localeLikeString: LocaleName | string = this.currentLocale,
  ): Record<
    LocaleName,
    I18nLocaleSettings<
      ValueScheme,
      DatetimeFormats,
      NumberFormats,
      LocaleName,
      Meta
    >
  >[LocaleName] {
    return this.localesMap[this.resolveLocale(localeLikeString)];
  }

  /**
   * Get the meta object corresponding to the currently selected locale
   *
   * @returns Meta object
   */
  meta(): Meta;

  /**
   * Get the meta object corresponding to the specified locale name
   *
   * @param locale - locale name
   * @returns Meta object
   */
  meta(locale: LocaleName): Meta;

  /**
   * Get the meta object corresponding to the specified locale name (or similar name)
   *
   * @param localeLikeString - Locale name (or similar name)
   * @returns Meta object
   */
  meta(localeLikeString?: string): Meta;

  meta(localeLikeString?: LocaleName | string): Meta {
    return this.getLocaleSettings(localeLikeString).meta as Meta;
  }

  /**
   * Gets the locale string that will be passed to Intl to format the date, time, and number for the currently selected locale.
   *
   * @returns Locale name for formatting
   */
  getFormatLocales(): string | string[];

  /**
   * Get the locale string that will be passed to Intl to format the date, time, and number for a given locale name (or similar name)
   *
   * @param locale - Locale name
   * @returns Locale name for formatting
   */
  getFormatLocales(locale?: LocaleName): string | string[];

  /**
   * Get the locale string that will be passed to Intl to format the date, time, and number for a given locale name (or similar name)
   *
   * @param localeLikeString - Locale name (or similar name)
   * @returns Locale name for formatting
   */
  getFormatLocales(localeLikeString?: string): string | string[];

  getFormatLocales(
    localeLikeString: LocaleName | string = this.currentLocale,
  ): string | string[] {
    const { formatLocales } = this.getLocaleSettings(localeLikeString);
    return formatLocales || localeLikeString;
  }

  /**
   * Get the date/time format setting corresponding to the currently selected locale
   * @returns date/time format setting
   */
  getDatetimeFormats(): DatetimeFormats;

  /**
   * Get the date/time format setting corresponding to the specified locale name
   * @param locale - Locale name
   * @returns date/time format setting
   */
  getDatetimeFormats(locale?: LocaleName): DatetimeFormats;

  /**
   * Get the date/time format setting corresponding to the specified locale name (or similar string)
   * @param localeLikeString - Locale name (or similar name)
   * @returns date/time format setting
   */
  getDatetimeFormats(localeLikeString?: string): DatetimeFormats;

  getDatetimeFormats(
    localeLikeString: LocaleName | string = this.currentLocale,
  ) {
    return this.adapter(localeLikeString).datetimeFormats;
  }

  /**
   * Get the date/time formatter corresponding to the currently selected locale
   */
  getDateTimeFormatter(): Intl.DateTimeFormat;

  /**
   * Get the date/time formatter corresponding to the currently selected locale and format name
   * @param formatName - format name
   * @param overrides - Formatting options you want to override
   */
  getDateTimeFormatter(
    formatName?: keyof DatetimeFormats,
    overrides?: Intl.DateTimeFormatOptions,
  ): Intl.DateTimeFormat;

  /**
   * Get the date/time formatter corresponding to the specified format name and locale name (or similar string)
   * @param formatName - format name
   * @param localeLikeString - locale name (or similar string)
   */
  getDateTimeFormatter(
    formatName?: keyof DatetimeFormats,
    localeLikeString?: LocaleName | string,
  ): Intl.DateTimeFormat;

  getDateTimeFormatter(
    formatName?: keyof DatetimeFormats,
    localeOrOverrides: LocaleName | string | Intl.DateTimeFormatOptions = this
      .currentLocale,
  ) {
    const [locale, overrides] =
      this._resolveFormatLocaleOrOverrides(localeOrOverrides);

    if (formatName && !overrides) {
      const cache = this._getFormatterCache('datetime', locale, formatName);
      if (cache) return cache;
    }

    let opts: Intl.DateTimeFormatOptions | undefined = formatName
      ? this.getDatetimeFormats(locale)[formatName]
      : undefined;

    if (overrides) {
      opts = opts ? { ...opts, ...overrides } : overrides;
    }

    const locales = this.getFormatLocales(locale);
    const formatter = new Intl.DateTimeFormat(locales, opts);

    if (formatName && !overrides) {
      this._setFormatterCache('datetime', locale, formatName, formatter);
    }

    return formatter;
  }

  /**
   * Format the date and time in the currently selected locale
   * @param value - Date and time (or its source)
   */
  datetimeFormat(value: number | string | Date): string;

  /**
   * Format the date and time in the currently selected locale and the specified format name
   * @param value - Date and time (or its source)
   * @param formatName - format name
   * @param overrides - Formatting options you want to override
   */
  datetimeFormat(
    value: number | string | Date,
    formatName?: keyof DatetimeFormats,
    overrides?: Intl.DateTimeFormatOptions,
  ): string;

  /**
   * Format date and time with specified format name and locale name
   * @param value - Date and time (or its source)
   * @param formatName - format name
   * @param localeLikeString - locale name
   */
  datetimeFormat(
    value: number | string | Date,
    formatName?: keyof DatetimeFormats,
    locale?: LocaleName,
  ): string;

  /**
   * Format date and time with specified format name and locale name
   * @param value - Date and time (or its source)
   * @param formatName - format name
   * @param localeLikeString - locale name (or similar string)
   */
  datetimeFormat(
    value: number | string | Date,
    formatName?: keyof DatetimeFormats,
    localeLikeString?: string,
  ): string;

  datetimeFormat(
    value: number | string | Date,
    formatName?: keyof DatetimeFormats,
    localeOrOverrides?: LocaleName | string | Intl.DateTimeFormatOptions,
  ) {
    const formatter = this.getDateTimeFormatter(
      formatName,
      localeOrOverrides as Intl.DateTimeFormatOptions,
    );
    return formatter.format(toDate(value));
  }

  /**
   * Format the date and time in the currently selected locale
   * @param value - Date and time (or its source)
   */
  d(value: number | string | Date): string;

  /**
   * Format the date and time in the currently selected locale and the specified format name
   * @param value - Date and time (or its source)
   * @param formatName - format name
   * @param overrides - Formatting options you want to override
   */
  d(
    value: number | string | Date,
    formatName?: keyof DatetimeFormats,
    overrides?: Intl.DateTimeFormatOptions,
  ): string;

  /**
   * Format date and time with specified format name and locale name
   * @param value - Date and time (or its source)
   * @param formatName - format name
   * @param localeLikeString - locale name
   */
  d(
    value: number | string | Date,
    formatName: keyof DatetimeFormats,
    locale: LocaleName,
  ): string;

  /**
   * Format date and time with specified format name and locale name
   * @param value - Date and time (or its source)
   * @param formatName - format name
   * @param localeLikeString - locale name (or similar string)
   */
  d(
    value: number | string | Date,
    formatName: keyof DatetimeFormats,
    localeLikeString: string,
  ): string;

  d(
    value: number | string | Date,
    formatName?: keyof DatetimeFormats,
    localeOrOverrides?: LocaleName | string | Intl.DateTimeFormatOptions,
  ) {
    return this.datetimeFormat(
      value,
      formatName,
      localeOrOverrides as Intl.DateTimeFormatOptions,
    );
  }

  /**
   * Get a list of parts formatted for date and time in the currently selected locale
   * @param value - Date and time (or its source)
   */
  datetimeParts(value: number | string | Date): Intl.DateTimeFormatPart[];

  /**
   * Get a list of parts formatted for date and time with the currently selected locale and the specified format name
   * @param value - Date and time (or its source)
   * @param formatName - format name
   * @param overrides - Formatting options you want to override
   */
  datetimeParts(
    value: number | string | Date,
    formatName?: keyof DatetimeFormats,
    overrides?: Intl.DateTimeFormatOptions,
  ): Intl.DateTimeFormatPart[];

  /**
   * Obtains a list of parts formatted for date and time with the specified format name and locale name.
   * @param value - Date and time (or its source)
   * @param formatName - format name
   * @param localeLikeString - locale name
   */
  datetimeParts(
    value: number | string | Date,
    formatName?: keyof DatetimeFormats,
    locale?: LocaleName,
  ): Intl.DateTimeFormatPart[];

  /**
   * Obtains a list of parts formatted for date and time with the specified format name and locale name.
   * @param value - Date and time (or its source)
   * @param formatName - format name
   * @param localeLikeString - locale name (or similar string)
   */
  datetimeParts(
    value: number | string | Date,
    formatName?: keyof DatetimeFormats,
    localeLikeString?: string,
  ): Intl.DateTimeFormatPart[];

  datetimeParts(
    value: number | string | Date,
    formatName?: keyof DatetimeFormats,
    localeOrOverrides?: LocaleName | string | Intl.DateTimeFormatOptions,
  ) {
    const formatter = this.getDateTimeFormatter(
      formatName,
      localeOrOverrides as Intl.DateTimeFormatOptions,
    );
    return formatter.formatToParts(toDate(value));
  }

  /**
   * Get the number format setting corresponding to the currently selected locale
   * @returns Number format setting
   */
  getNumberFormats(): NumberFormats;

  /**
   * Get the number format setting corresponding to the specified locale name
   * @param locale - Locale name
   * @returns Number format setting
   */
  getNumberFormats(locale?: LocaleName): NumberFormats;

  /**
   * Get the number format setting corresponding to the specified locale name (or similar string)
   * @param localeLikeString - Locale name (or similar name)
   * @returns Number format setting
   */
  getNumberFormats(localeLikeString?: string): NumberFormats;

  getNumberFormats(localeLikeString: LocaleName | string = this.currentLocale) {
    return this.adapter(localeLikeString).numberFormats;
  }
  /**
   * Get the number formatter corresponding to the currently selected locale
   */
  getNumberFormatter(): Intl.NumberFormat;

  /**
   * Get the number formatter corresponding to the currently selected locale and format name
   * @param formatName - format name
   * @param overrides - Formatting options you want to override
   */
  getNumberFormatter(
    formatName?: keyof NumberFormats,
    overrides?: Intl.NumberFormatOptions,
  ): Intl.NumberFormat;

  /**
   * Get the number formatter corresponding to the specified format name and locale name (or similar string)
   * @param formatName - format name
   * @param localeLikeString - locale name (or similar string)
   */
  getNumberFormatter(
    formatName?: keyof NumberFormats,
    localeLikeString?: LocaleName | string,
  ): Intl.NumberFormat;

  getNumberFormatter(
    formatName?: keyof NumberFormats,
    localeOrOverrides: LocaleName | string | Intl.NumberFormatOptions = this
      .currentLocale,
  ) {
    const [locale, overrides] =
      this._resolveFormatLocaleOrOverrides(localeOrOverrides);

    if (formatName && !overrides) {
      const cache = this._getFormatterCache('number', locale, formatName);
      if (cache) return cache;
    }

    let opts: Intl.NumberFormatOptions | undefined = formatName
      ? this.getNumberFormats(locale)[formatName]
      : undefined;

    if (overrides) {
      opts = opts ? { ...opts, ...overrides } : overrides;
    }

    const locales = this.getFormatLocales(locale);
    const formatter = new Intl.NumberFormat(locales, opts);

    if (formatName && !overrides) {
      this._setFormatterCache('number', locale, formatName, formatter);
    }

    return formatter;
  }

  /**
   * Format the number in the currently selected locale
   * @param value - number (or its source)
   */
  numberFormat(value: number | string): string;

  /**
   * Format the number in the currently selected locale and the specified format name
   * @param value - number (or its source)
   * @param formatName - format name
   * @param overrides - Formatting options you want to override
   */
  numberFormat(
    value: number | string,
    formatName?: keyof NumberFormats,
    overrides?: Intl.NumberFormatOptions,
  ): string;

  /**
   * Format number with specified format name and locale name
   * @param value - number (or its source)
   * @param formatName - format name
   * @param localeLikeString - locale name
   */
  numberFormat(
    value: number | string,
    formatName?: keyof NumberFormats,
    locale?: LocaleName,
  ): string;

  /**
   * Format number with specified format name and locale name
   * @param value - number (or its source)
   * @param formatName - format name
   * @param localeLikeString - locale name (or similar string)
   */
  numberFormat(
    value: number | string,
    formatName?: keyof NumberFormats,
    localeLikeString?: string,
  ): string;

  numberFormat(
    value: number | string,
    formatName?: keyof NumberFormats,
    localeOrOverrides?: LocaleName | string | Intl.NumberFormatOptions,
  ) {
    const formatter = this.getNumberFormatter(
      formatName,
      localeOrOverrides as Intl.NumberFormatOptions,
    );
    return formatter.format(Number(value));
  }

  /**
   * Format the number in the currently selected locale
   * @param value - number (or its source)
   */
  n(value: number | string): string;

  /**
   * Format the number in the currently selected locale and the specified format name
   * @param value - number (or its source)
   * @param formatName - format name
   * @param overrides - Formatting options you want to override
   */
  n(
    value: number | string,
    formatName?: keyof NumberFormats,
    overrides?: Intl.NumberFormatOptions,
  ): string;

  /**
   * Format number with specified format name and locale name
   * @param value - number (or its source)
   * @param formatName - format name
   * @param localeLikeString - locale name
   */
  n(
    value: number | string,
    formatName: keyof NumberFormats,
    locale: LocaleName,
  ): string;

  /**
   * Format number with specified format name and locale name
   * @param value - number (or its source)
   * @param formatName - format name
   * @param localeLikeString - locale name (or similar string)
   */
  n(
    value: number | string,
    formatName: keyof NumberFormats,
    localeLikeString: string,
  ): string;

  n(
    value: number | string,
    formatName?: keyof NumberFormats,
    localeOrOverrides?: LocaleName | string | Intl.NumberFormatOptions,
  ) {
    return this.numberFormat(
      value,
      formatName,
      localeOrOverrides as Intl.NumberFormatOptions,
    );
  }

  /**
   * Get a list of parts formatted for number in the currently selected locale
   * @param value - number (or its source)
   */
  numberParts(value: number | string): Intl.NumberFormatPart[];

  /**
   * Get a list of parts formatted for number with the currently selected locale and the specified format name
   * @param value - number (or its source)
   * @param formatName - format name
   * @param overrides - Formatting options you want to override
   */
  numberParts(
    value: number | string,
    formatName?: keyof NumberFormats,
    overrides?: Intl.NumberFormatOptions,
  ): Intl.NumberFormatPart[];

  /**
   * Obtains a list of parts formatted for number with the specified format name and locale name.
   * @param value - number (or its source)
   * @param formatName - format name
   * @param localeLikeString - locale name
   */
  numberParts(
    value: number | string,
    formatName?: keyof NumberFormats,
    locale?: LocaleName,
  ): Intl.NumberFormatPart[];

  /**
   * Obtains a list of parts formatted for number with the specified format name and locale name.
   * @param value - number (or its source)
   * @param formatName - format name
   * @param localeLikeString - locale name (or similar string)
   */
  numberParts(
    value: number | string,
    formatName?: keyof NumberFormats,
    localeLikeString?: string,
  ): Intl.NumberFormatPart[];

  numberParts(
    value: number | string,
    formatName?: keyof NumberFormats,
    localeOrOverrides?: LocaleName | string | Intl.NumberFormatOptions,
  ) {
    const formatter = this.getNumberFormatter(
      formatName,
      localeOrOverrides as Intl.NumberFormatOptions,
    );
    return formatter.formatToParts(Number(value));
  }

  /**
   * Get a list of locale names on which a given locale depends
   * @param locale - locale name
   */
  private _getLocaleDependencies(locale = this.currentLocale): LocaleName[] {
    return this.dependenciesMap[locale];
  }

  /**
   * Obtain locale configurations for all flattened languages
   * @returns Locale settings for all languages (flattened)
   */
  private _getFlattenedSchemes() {
    return this._getStorageValue('flattenedSchemes');
  }

  /**
   * Retrieve loaded configuration information for a given locale
   * @param locale - locale name
   */
  private _getLoadedValueScheme(locale: LocaleName) {
    return this._getFlattenedSchemes()[locale];
  }

  /**
   * Obtains the storage value corresponding to the specified key
   * @param key - Storage Value Key
   */
  private _getStorageValue<Key extends keyof I18nStorageValueMap>(
    key: Key,
  ): I18nStorageValueMap<LocaleName>[Key] {
    return this.storage.get(key);
  }

  /**
   * Sets the storage value with the specified key
   * @param key - Storage Value Key
   * @param value - Value to set
   */
  private _setStorageValue<Key extends keyof I18nStorageValueMap>(
    key: Key,
    value: I18nStorageValueMap<LocaleName>[Key],
  ): I18nStorageValueMap<LocaleName>[Key] {
    return this.storage.set(key, value);
  }

  /**
   * Adds the specified locale name as the locale name being read
   * @param locale - locale name
   */
  private _pushLoadingLocale(locale: LocaleName) {
    const loadings = this._getStorageValue('loadingLocales');
    if (!loadings.includes(locale)) {
      loadings.push(locale);
      this._setStorageValue('loadingLocales', loadings);
    }
  }

  /**
   * Remove the specified locale name from the list of currently loaded locale names
   * @param locale - locale name
   */
  private _removeLoadingLocale(locale: LocaleName) {
    const loadings = this._getStorageValue('loadingLocales');
    if (loadings.includes(locale)) {
      arrayRemove(loadings, locale);
      this._setStorageValue('loadingLocales', loadings);
    }
  }

  /**
   * Obtains the locale configuration corresponding to the specified locale name
   * @param locale - locale name
   */
  private _getValueScheme(locale: LocaleName) {
    return this._getFlattenedSchemes()[locale];
  }

  /**
   * Set the specified locale name and locale configuration to the instance
   *
   * * Setting the configuration through this method will add a reference to this instance to the configuration object
   * * This method must be used whenever a configuration set process is performed
   *
   * @param locale - locale name
   * @param scheme - Schema of i18n
   */
  private _setLocaleScheme(
    locale: LocaleName,
    scheme:
      | I18nScheme<ValueScheme, DatetimeFormats, NumberFormats>
      | I18nSubScheme<ValueScheme, DatetimeFormats, NumberFormats>,
  ) {
    injectI18n(this, scheme, locale);
    const { value = {}, datetimeFormats, numberFormats } = scheme;

    const _value: I18nFlattenedSchemes['value'] = toFlattenedObject(
      value,
      'value.',
    );

    const _datetimeFormats: I18nFlattenedSchemes['datetimeFormats'] = {};
    datetimeFormats &&
      Object.entries(datetimeFormats).forEach(([key, opts]) => {
        _datetimeFormats[`datetimeFormats.${key}`] = opts;
      });

    const _numberFormats: I18nFlattenedSchemes['numberFormats'] = {};
    numberFormats &&
      Object.entries(numberFormats).forEach(([key, opts]) => {
        _datetimeFormats[`numberFormats.${key}`] = opts;
      });

    const map = this._getFlattenedSchemes();
    const flattenedScheme = {
      ..._value,
      ..._datetimeFormats,
      ..._numberFormats,
    };
    map[locale] = flattenedScheme;

    if (this.isBaseLocale(locale)) {
      this._adapter = this._buildTranslationAdapter(
        scheme as I18nScheme<ValueScheme, DatetimeFormats, NumberFormats>,
      );
    }
  }

  /**
   * Generate an object interface that serves as an adapter for locale configuration acquisition references
   *
   * * This process must always specify the configuration object for the base locale
   * * If an object in a sublocale is specified, an interface is created in which all configuration values are inaccessible
   *
   * @param baseScheme - Locale configuration object (for basic locale)
   */
  private _buildTranslationAdapter(
    baseScheme: I18nScheme<ValueScheme, DatetimeFormats, NumberFormats>,
  ): I18nSchemeAdapter<
    LocaleName,
    ValueScheme,
    DatetimeFormats,
    NumberFormats
  > {
    const adapter: Partial<
      I18nSchemeAdapter<LocaleName, ValueScheme, DatetimeFormats, NumberFormats>
    > = {};

    const localeTick = (
      locale: LocaleName,
      tree: { [key: string]: any },
      prefix = '',
      bucket: { [key: string]: any } = {},
    ): any => {
      const ignoreNestedSearchKeys = ['datetimeFormats.', 'numberFormats.'];

      for (const [key, value] of Object.entries(tree)) {
        const path = `${prefix}${key}`;

        if (
          value &&
          typeof value === 'object' &&
          !ignoreNestedSearchKeys.includes(prefix)
        ) {
          bucket[key] = localeTick(locale, value, `${path}.`);
          continue;
        }

        Object.defineProperty(bucket, key, {
          enumerable: true,
          get: () => {
            return this._getSchemeValueByPath(path, locale);
          },
        });
      }

      return bucket;
    };

    this.availableLocales.forEach((locale) => {
      adapter[locale] = localeTick(locale, baseScheme);
    });

    return adapter;
  }

  /**
   * Load the specified locale if it is not already loaded
   *
   * @param locale - locale name
   */
  private _ensureLocale(
    locale: LocaleName,
  ): Promise<
    I18nLocaleSettings<
      DeepPartial<ValueScheme>,
      Partial<DatetimeFormats>,
      Partial<NumberFormats>,
      LocaleName,
      Meta
    >
  > {
    let promise = this._loadPromiseMap[locale];
    if (promise) return promise;

    const settings = this.localesMap[locale];
    const schemeOrLoader = settings.scheme;
    const payload =
      typeof schemeOrLoader === 'function'
        ? schemeOrLoader(locale)
        : schemeOrLoader;

    if (isPromise(payload)) {
      promise = payload;
      this._pushLoadingLocale(locale);
    } else {
      promise = Promise.resolve(payload);
    }

    promise = promise
      .then((value) => {
        this._setLocaleScheme(locale, value);
        return value;
      })
      .catch((err) => {
        delete this._loadPromiseMap[locale];
        throw err;
      })
      .finally(() => this._removeLoadingLocale(locale));

    this._loadPromiseMap[locale] = promise;
    return promise;
  }

  /**
   * Load all of the specified list of locale names, if any, that have not already been loaded
   *
   * @param locale - locale name
   */
  private async _ensureLocales(locales: LocaleName[]): Promise<void> {
    await Promise.all(locales.map<any>((locale) => this._ensureLocale(locale)));
  }

  /**
   * Get the locale configuration value corresponding to the path of the specified value
   * @param valuePath - path to a value
   * @param locale - locale name (or the currently selected locale if not specified)
   */
  private _getSchemeValueByPath(valuePath: string, locale?: LocaleName): any {
    const dependencies = locale
      ? this._getLocaleDependencies(locale)
      : this.dependencies;

    for (const locale of dependencies) {
      const flattenedScheme = this._getValueScheme(locale);
      if (!flattenedScheme) continue;
      const value = flattenedScheme[valuePath];
      if (value !== undefined) {
        return value;
      }
    }

    throw new I18nError(`missing locale value for "${valuePath}".`);
  }

  private _resolveFormatLocaleOrOverrides<
    Options extends Intl.DateTimeFormatOptions | Intl.NumberFormatOptions,
  >(
    localeOrOverrides: LocaleName | string | Options,
  ): [LocaleName, undefined] | [undefined, Options] {
    return typeof localeOrOverrides === 'string'
      ? [this.resolveLocale(localeOrOverrides), undefined]
      : [undefined, localeOrOverrides];
  }

  private _getFormatterCache<Type extends 'datetime' | 'number'>(
    type: Type,
    locale: LocaleName,
    formatterName: keyof DatetimeFormats | keyof NumberFormats,
  ):
    | (Type extends 'datetime' ? Intl.DateTimeFormat : Intl.NumberFormat)
    | undefined {
    return this._formatterCache[type][
      `${locale}:${formatterName as string}`
    ] as any;
  }

  private _setFormatterCache<Type extends 'datetime' | 'number'>(
    type: Type,
    locale: LocaleName,
    formatterName: keyof DatetimeFormats | keyof NumberFormats,
    formatter: Type extends 'datetime'
      ? Intl.DateTimeFormat
      : Intl.NumberFormat,
  ) {
    this._formatterCache[type][`${locale}:${formatterName as string}`] =
      formatter as any;
  }

  private _setCurrentLocale(currentLocale: LocaleName) {
    const { nextLocale } = this;
    if (nextLocale && nextLocale !== currentLocale) {
      return;
    }
    this._setStorageValue('currentLocale', currentLocale);
    this._setNextLocale(null);
  }

  private _setNextLocale(nextLocale: LocaleName | null) {
    this._setStorageValue('nextLocale', nextLocale);
  }
}
