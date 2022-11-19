import {
  I18nLocaleMeta,
  I18nTranslations,
  I18nDateTimeFormats,
  I18nRelativeTimeFormats,
  I18nNumberFormats,
  I18nListFormats,
  I18nDependencies,
} from './schemes';
import { resolveI18nTypedImported } from './schemes';
import { I18nComponentLocaleOrLoader, I18nComponentLocales } from './component';
import { I18nComponentLocale } from './component-locale';

/**
 * Component locale loader
 */
export class I18nLocaleLoader<
  LocaleName extends string,
  BaseLocale extends LocaleName,
  LocaleMeta extends I18nLocaleMeta,
  Translations extends I18nTranslations,
  DateTimeFormats extends I18nDateTimeFormats,
  RelativeTimeFormats extends I18nRelativeTimeFormats,
  NumberFormats extends I18nNumberFormats,
  ListFormats extends I18nListFormats,
  Dependencies extends I18nDependencies<LocaleName, BaseLocale, LocaleMeta>,
> {
  /** locale name */
  readonly locale: LocaleName;

  /** Component locale or its asynchronous loader */
  readonly source: I18nComponentLocaleOrLoader<
    LocaleName,
    BaseLocale,
    LocaleMeta,
    Translations,
    DateTimeFormats,
    RelativeTimeFormats,
    NumberFormats,
    ListFormats,
    Dependencies,
    any
  >;

  /** Promise instance to resolve read completion */
  private _promise?: Promise<
    I18nComponentLocale<
      LocaleName,
      BaseLocale,
      LocaleMeta,
      Translations,
      DateTimeFormats,
      RelativeTimeFormats,
      NumberFormats,
      ListFormats,
      Dependencies,
      any
    >
  >;

  /** Is loading complete? */
  private _isLoaded = false;

  /** Is loading complete? */
  get isLoaded() {
    return this._isLoaded;
  }

  get isLoading() {
    return !this.isLoaded && !!this._promise;
  }

  /**
   * Initialize the loader for the component locale
   *
   * @param localeName - locale name
   * @param source - Component locale or its asynchronous loader
   */
  constructor(
    localeName: LocaleName,
    source: I18nComponentLocaleOrLoader<
      LocaleName,
      BaseLocale,
      LocaleMeta,
      Translations,
      DateTimeFormats,
      RelativeTimeFormats,
      NumberFormats,
      ListFormats,
      Dependencies,
      any
    >,
  ) {
    this.locale = localeName;
    this.source = source;
  }

  /**
   * ロケールをロードする
   */
  load(): Promise<
    I18nComponentLocale<
      LocaleName,
      BaseLocale,
      LocaleMeta,
      Translations,
      DateTimeFormats,
      RelativeTimeFormats,
      NumberFormats,
      ListFormats,
      Dependencies,
      any
    >
  > {
    if (this._promise) return this._promise;

    const { source } = this;
    if (typeof source !== 'function') {
      this._promise = Promise.resolve(source);
      return this._promise;
    }

    this._promise = source()
      .then(resolveI18nTypedImported)
      .catch((err) => {
        delete this._promise;
        throw err;
      });

    return this._promise;
  }
}

/**
 * @internal
 */
type I18nLocalesLoaderMap<
  LocaleName extends string,
  BaseLocale extends LocaleName,
  LocaleMeta extends I18nLocaleMeta,
  Translations extends I18nTranslations,
  DateTimeFormats extends I18nDateTimeFormats,
  RelativeTimeFormats extends I18nRelativeTimeFormats,
  NumberFormats extends I18nNumberFormats,
  ListFormats extends I18nListFormats,
  Dependencies extends I18nDependencies<LocaleName, BaseLocale, LocaleMeta>,
> = Record<
  LocaleName,
  I18nLocaleLoader<
    LocaleName,
    BaseLocale,
    LocaleMeta,
    Translations,
    DateTimeFormats,
    RelativeTimeFormats,
    NumberFormats,
    ListFormats,
    Dependencies
  >
>;

/**
 * Component Locale List Loader Class
 */
export class I18nLocalesLoader<
  LocaleName extends string,
  BaseLocale extends LocaleName,
  LocaleMeta extends I18nLocaleMeta,
  Translations extends I18nTranslations,
  DateTimeFormats extends I18nDateTimeFormats,
  RelativeTimeFormats extends I18nRelativeTimeFormats,
  NumberFormats extends I18nNumberFormats,
  ListFormats extends I18nListFormats,
  Dependencies extends I18nDependencies<LocaleName, BaseLocale, LocaleMeta>,
> {
  /** Map of loader instances per locale */
  readonly at: I18nLocalesLoaderMap<
    LocaleName,
    BaseLocale,
    LocaleMeta,
    Translations,
    DateTimeFormats,
    RelativeTimeFormats,
    NumberFormats,
    ListFormats,
    Dependencies
  > = {} as any;

  /** Map instances of loaded component locales */
  private _loaded: Record<
    LocaleName,
    I18nComponentLocale<
      LocaleName,
      BaseLocale,
      LocaleMeta,
      Translations,
      DateTimeFormats,
      RelativeTimeFormats,
      NumberFormats,
      ListFormats,
      Dependencies,
      any
    >
  > = {} as any;

  /** Map instances of loaded component locales */
  get loadedLocales(): I18nComponentLocale<
    LocaleName,
    BaseLocale,
    LocaleMeta,
    Translations,
    DateTimeFormats,
    RelativeTimeFormats,
    NumberFormats,
    ListFormats,
    Dependencies,
    any
  >[] {
    return Object.values(this._loaded);
  }

  /** Callback after locale loading is complete */
  private _onLoad: (
    localeName: LocaleName,
    locale: I18nComponentLocale<
      LocaleName,
      BaseLocale,
      LocaleMeta,
      Translations,
      DateTimeFormats,
      RelativeTimeFormats,
      NumberFormats,
      ListFormats,
      Dependencies,
      any
    >,
  ) => any;

  /**
   * Initialize locale loader for components
   *
   * @param locales - Map settings for component locales or their asynchronous loaders
   * @param onLoad - Callback after locale loading is complete
   */
  constructor(
    locales: I18nComponentLocales<
      LocaleName,
      BaseLocale,
      LocaleMeta,
      Translations,
      DateTimeFormats,
      RelativeTimeFormats,
      NumberFormats,
      ListFormats,
      Dependencies
    >,
    onLoad: (
      localeName: LocaleName,
      locale: I18nComponentLocale<
        LocaleName,
        BaseLocale,
        LocaleMeta,
        Translations,
        DateTimeFormats,
        RelativeTimeFormats,
        NumberFormats,
        ListFormats,
        Dependencies,
        any
      >,
    ) => any,
  ) {
    this._onLoad = onLoad;

    Object.entries(locales).forEach(([localeName, source]) => {
      (this.at as any)[localeName] = new I18nLocaleLoader(
        localeName,
        source as any,
      );
    });
  }

  /**
   * Loads a list of specified locale names
   *
   * @param localeNames - List of locale names
   */
  load(...localeNames: LocaleName[]): Promise<void> {
    const chunks: [
      LocaleName,
      I18nLocaleLoader<
        LocaleName,
        BaseLocale,
        LocaleMeta,
        Translations,
        DateTimeFormats,
        RelativeTimeFormats,
        NumberFormats,
        ListFormats,
        Dependencies
      >,
    ][] = [];
    localeNames.forEach((localeName) => {
      const loader = this.at[localeName];
      if (!loader.isLoaded) {
        chunks.push([localeName, loader]);
      }
    });
    if (!chunks.length) return Promise.resolve();
    return Promise.all(
      chunks.map(([localeName, loader]) =>
        loader.load().then((locale) => {
          this._loaded[localeName] = locale;
          this._onLoad(localeName, locale);
        }),
      ),
    ).then(() => undefined);
  }

  /**
   * Obtain component locale instances that have been loaded
   *
   * @param localeName - locale name
   * @returns component locale instance
   */
  get(localeName: LocaleName) {
    return this._loaded[localeName];
  }

  /**
   * Retrieve strictly defined locales that have completed loading
   *
   * @returns Strictly defined locale objects
   */
  getStrictLocale():
    | I18nComponentLocale<
        LocaleName,
        BaseLocale,
        LocaleMeta,
        Translations,
        DateTimeFormats,
        RelativeTimeFormats,
        NumberFormats,
        ListFormats,
        Dependencies,
        true
      >
    | undefined {
    return this.loadedLocales.find((locale) => locale.isStrict);
  }
}
