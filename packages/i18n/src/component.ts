import {
  I18nLocaleMeta,
  I18nTranslations,
  I18nDateTimeFormats,
  I18nRelativeTimeFormats,
  I18nNumberFormats,
  I18nListFormats,
  I18nDependencies,
  I18nInstantiatedDependencies,
  I18nTypedImported,
} from './schemes';
import {
  I18nComponentScheme,
  I18nComponentSchemeImpl,
} from './component-scheme';
import { I18nComponentLocale } from './component-locale';
import { I18nSpace } from './space';
import { I18nLocalesLoader } from './loader';
import { I18nError } from './logger';
import { toFlattenedObject } from './helpers';
import { isPlainObject } from '@fastkit/helpers';
import { I18nFormatter, I18nBuildedFormatter } from './formatter';

type I18nComponentLocaleImported<
  LocaleName extends string,
  BaseLocale extends LocaleName,
  LocaleMeta extends I18nLocaleMeta,
  Translations extends I18nTranslations,
  DateTimeFormats extends I18nDateTimeFormats,
  RelativeTimeFormats extends I18nRelativeTimeFormats,
  NumberFormats extends I18nNumberFormats,
  ListFormats extends I18nListFormats,
  Dependencies extends I18nDependencies<LocaleName, BaseLocale, LocaleMeta>,
  Strict extends boolean = false,
> = I18nTypedImported<
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
    Strict
  >
>;

/**
 * Asynchronous loader for component locales
 *
 * * The payload of the asynchronous load result can be the result of an ES Modules default export (`{ default: xxx }`)
 */
export type I18nComponentLocaleLoader<
  LocaleName extends string,
  BaseLocale extends LocaleName,
  LocaleMeta extends I18nLocaleMeta,
  Translations extends I18nTranslations,
  DateTimeFormats extends I18nDateTimeFormats,
  RelativeTimeFormats extends I18nRelativeTimeFormats,
  NumberFormats extends I18nNumberFormats,
  ListFormats extends I18nListFormats,
  Dependencies extends I18nDependencies<LocaleName, BaseLocale, LocaleMeta>,
  Strict extends boolean = false,
> = () => Promise<
  I18nComponentLocaleImported<
    LocaleName,
    BaseLocale,
    LocaleMeta,
    Translations,
    DateTimeFormats,
    RelativeTimeFormats,
    NumberFormats,
    ListFormats,
    Dependencies,
    Strict
  >
>;

/**
 * Component locale or its asynchronous loader
 */
export type I18nComponentLocaleOrLoader<
  LocaleName extends string = string,
  BaseLocale extends LocaleName = LocaleName,
  LocaleMeta extends I18nLocaleMeta = I18nLocaleMeta,
  Translations extends I18nTranslations = I18nTranslations,
  DateTimeFormats extends I18nDateTimeFormats = I18nDateTimeFormats,
  RelativeTimeFormats extends I18nRelativeTimeFormats = I18nRelativeTimeFormats,
  NumberFormats extends I18nNumberFormats = I18nNumberFormats,
  ListFormats extends I18nListFormats = I18nListFormats,
  Dependencies extends I18nDependencies<
    LocaleName,
    BaseLocale,
    LocaleMeta
  > = I18nDependencies<LocaleName, BaseLocale, LocaleMeta>,
  Strict extends boolean = false,
> =
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
      Strict
    >
  | I18nComponentLocaleLoader<
      LocaleName,
      BaseLocale,
      LocaleMeta,
      Translations,
      DateTimeFormats,
      RelativeTimeFormats,
      NumberFormats,
      ListFormats,
      Dependencies,
      Strict
    >;

/**
 * Map settings for component locales or their asynchronous loaders
 */
export type I18nComponentLocales<
  LocaleName extends string = string,
  BaseLocale extends LocaleName = LocaleName,
  LocaleMeta extends I18nLocaleMeta = I18nLocaleMeta,
  Translations extends I18nTranslations = I18nTranslations,
  DateTimeFormats extends I18nDateTimeFormats = I18nDateTimeFormats,
  RelativeTimeFormats extends I18nRelativeTimeFormats = I18nRelativeTimeFormats,
  NumberFormats extends I18nNumberFormats = I18nNumberFormats,
  ListFormats extends I18nListFormats = I18nListFormats,
  Dependencies extends I18nDependencies<
    LocaleName,
    BaseLocale,
    LocaleMeta
  > = I18nDependencies<LocaleName, BaseLocale, LocaleMeta>,
> = Record<
  BaseLocale,
  I18nComponentLocaleOrLoader<
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
> &
  Record<
    LocaleName,
    I18nComponentLocaleOrLoader<
      LocaleName,
      BaseLocale,
      LocaleMeta,
      Translations,
      DateTimeFormats,
      RelativeTimeFormats,
      NumberFormats,
      ListFormats,
      Dependencies,
      true | false
    >
  >;

/**
 * Component Definition Settings
 */
export type I18nComponentStaticSettings<
  LocaleName extends string,
  BaseLocale extends LocaleName,
  LocaleMeta extends I18nLocaleMeta,
  Translations extends I18nTranslations,
  DateTimeFormats extends I18nDateTimeFormats,
  RelativeTimeFormats extends I18nRelativeTimeFormats,
  NumberFormats extends I18nNumberFormats,
  ListFormats extends I18nListFormats,
  Dependencies extends I18nDependencies<LocaleName, BaseLocale, LocaleMeta>,
> = {
  /**
   * component name
   *
   * * Optional, but it makes it easier to perform internal debugging, etc.
   */
  name?: string;

  /** component schema */
  scheme: I18nComponentScheme<
    LocaleName,
    BaseLocale,
    LocaleMeta,
    Translations,
    DateTimeFormats,
    RelativeTimeFormats,
    NumberFormats,
    ListFormats,
    Dependencies
  >;

  /**
   * Map settings for component locales or their asynchronous loaders
   *
   * * Be sure to register all locales declared in the space
   * * The locale corresponding to the base locale must always be a strict setting
   */
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
  >;
};

/**
 * Interfaces owned by both the component definition or its instance
 */
export interface I18nComponentStaticImpl<
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
  /** component name */
  readonly name?: string;

  /** component schema */
  readonly scheme: I18nComponentScheme<
    LocaleName,
    BaseLocale,
    LocaleMeta,
    Translations,
    DateTimeFormats,
    RelativeTimeFormats,
    NumberFormats,
    ListFormats,
    Dependencies
  >;
}

/**
 * Internationalization Service Components
 *
 * * Internationalization services are designed to have multiple components available
 * * Build your application robustly by designing components for features, screens, and domains
 * * Components created from the same space definition can reference each other's instances
 */
export interface I18nComponent<
  LocaleName extends string = string,
  BaseLocale extends LocaleName = LocaleName,
  LocaleMeta extends I18nLocaleMeta = I18nLocaleMeta,
  Translations extends I18nTranslations = I18nTranslations,
  DateTimeFormats extends I18nDateTimeFormats = I18nDateTimeFormats,
  RelativeTimeFormats extends I18nRelativeTimeFormats = I18nRelativeTimeFormats,
  NumberFormats extends I18nNumberFormats = I18nNumberFormats,
  ListFormats extends I18nListFormats = I18nListFormats,
  Dependencies extends I18nDependencies<
    LocaleName,
    BaseLocale,
    LocaleMeta
  > = I18nDependencies<LocaleName, BaseLocale, LocaleMeta>,
> extends I18nComponentStaticImpl<
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
    I18nBuildedFormatter<
      LocaleName,
      DateTimeFormats,
      RelativeTimeFormats,
      NumberFormats,
      ListFormats
    > {
  /** component definition */
  readonly Ctor: I18nComponentStatic<
    LocaleName,
    BaseLocale,
    LocaleMeta,
    Translations,
    DateTimeFormats,
    RelativeTimeFormats,
    NumberFormats,
    ListFormats,
    Dependencies
  >;

  /** Internationalization Space */
  readonly space: I18nSpace<LocaleName, BaseLocale, LocaleMeta>;

  /** Instantiated component map */
  readonly deps: I18nInstantiatedDependencies<Dependencies>;

  /** Translation object corresponding to the currently selected locale */
  readonly trans: Translations;

  /**
   * Translation object corresponding to the currently selected locale
   *
   * * Alias to `this.trans`.
   */
  readonly t: Translations;

  /**
   * Obtains the translation object corresponding to the specified locale name
   *
   * @param localeName - locale name
   */
  getTranslations(localeName: LocaleName): Translations;

  /**
   * Initialize a list of specified locale names
   *
   * @internal
   */
  _setupLocales(localeNames: LocaleName[]): void;
}

/**
 * Component Definition of Internationalization Services
 *
 * * Internationalization services are designed to have multiple components available
 * * Build your application robustly by designing components for features, screens, and domains
 * * Components created from the same space definition can reference each other's instances
 */
export interface I18nComponentStatic<
  LocaleName extends string = string,
  BaseLocale extends LocaleName = LocaleName,
  LocaleMeta extends I18nLocaleMeta = I18nLocaleMeta,
  Translations extends I18nTranslations = I18nTranslations,
  DateTimeFormats extends I18nDateTimeFormats = I18nDateTimeFormats,
  RelativeTimeFormats extends I18nRelativeTimeFormats = I18nRelativeTimeFormats,
  NumberFormats extends I18nNumberFormats = I18nNumberFormats,
  ListFormats extends I18nListFormats = I18nListFormats,
  Dependencies extends I18nDependencies<
    LocaleName,
    BaseLocale,
    LocaleMeta
  > = I18nDependencies<LocaleName, BaseLocale, LocaleMeta>,
> extends I18nComponentStaticImpl<
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
    I18nComponentSchemeImpl<
      DateTimeFormats,
      RelativeTimeFormats,
      NumberFormats,
      ListFormats
    > {
  /** Map settings for component locales or their asynchronous loaders */
  readonly locales: I18nComponentLocales<
    LocaleName,
    BaseLocale,
    LocaleMeta,
    Translations,
    DateTimeFormats,
    RelativeTimeFormats,
    NumberFormats,
    ListFormats,
    Dependencies
  >;

  /** Map of dependent components that can be registered in the spaces and components of the internationalization service */
  readonly dependencies: Dependencies;

  /**
   * Create a component instance
   *
   * * This method is usually executed from a space instance inside the internationalization service
   *
   * @param space - Internationalization Space
   */
  createInstance(
    space: I18nSpace<LocaleName, BaseLocale, LocaleMeta>,
  ): I18nComponent<
    LocaleName,
    BaseLocale,
    LocaleMeta,
    Translations,
    DateTimeFormats,
    RelativeTimeFormats,
    NumberFormats,
    ListFormats,
    Dependencies
  >;

  /**
   * Load the specified locale
   *
   * @param locales - List of locale names
   */
  load(...locales: LocaleName[]): Promise<void>;
}

/**
 * Create component definitions
 *
 * @param settings - Component Definition Settings
 * @returns component definition
 */
export function defineI18nComponent<
  LocaleName extends string,
  BaseLocale extends LocaleName,
  LocaleMeta extends I18nLocaleMeta,
  Translations extends I18nTranslations,
  DateTimeFormats extends I18nDateTimeFormats,
  RelativeTimeFormats extends I18nRelativeTimeFormats,
  NumberFormats extends I18nNumberFormats,
  ListFormats extends I18nListFormats,
  Dependencies extends I18nDependencies<LocaleName, BaseLocale, LocaleMeta>,
>(
  settings: I18nComponentStaticSettings<
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
): I18nComponentStatic<
  LocaleName,
  BaseLocale,
  LocaleMeta,
  Translations,
  DateTimeFormats,
  RelativeTimeFormats,
  NumberFormats,
  ListFormats,
  Dependencies
> {
  const { name, scheme, locales } = settings;
  const {
    Space,
    dependencies,
    dateTimeFormats,
    relativeTimeFormats,
    numberFormats,
    listFormats,
  } = scheme;
  const formatterCache = new I18nFormatter(scheme);

  const loader = new I18nLocalesLoader(locales, (localeName, locale) => {
    formatterCache.applyLocale(localeName, locale);
  });

  const Ctor: I18nComponentStatic<
    LocaleName,
    BaseLocale,
    LocaleMeta,
    Translations,
    DateTimeFormats,
    RelativeTimeFormats,
    NumberFormats,
    ListFormats,
    Dependencies
  > = {
    name,
    locales,
    scheme,
    dependencies,
    dateTimeFormats,
    relativeTimeFormats,
    numberFormats,
    listFormats,
    load(...localeNames) {
      if (!localeNames.length) return Promise.resolve();
      return loader.load(...localeNames);
    },
    createInstance(space) {
      const { at: deps } = space.createSubSpace(dependencies);

      const translationsMap: Partial<Record<LocaleName, Translations>> = {};

      const flattenedTranslationsMap = {} as Record<
        LocaleName,
        { [key: string]: any }
      >;

      Space.availableLocales.forEach((localeName) => {
        flattenedTranslationsMap[localeName] = {};
      });

      const getTranslations = (
        localeName: LocaleName = space.currentLocaleName,
      ) => {
        const translations = translationsMap[localeName];
        if (!translations) {
          throw new I18nError(
            `The locale "${localeName}" has not yet been initialized.`,
          );
        }
        return translations as Translations;
      };

      const formats = formatterCache.build(space);

      const component: I18nComponent<
        LocaleName,
        BaseLocale,
        LocaleMeta,
        Translations,
        DateTimeFormats,
        RelativeTimeFormats,
        NumberFormats,
        ListFormats,
        Dependencies
      > = {
        name,
        Ctor,
        space,
        scheme,
        get trans() {
          return getTranslations();
        },
        get t() {
          return getTranslations();
        },
        deps,
        getTranslations,
        ...formats,
        _setupLocales,
      };

      /**
       * Cache of strict locale settings
       *
       * * Cache for performance since it will be used in subsequent processes.
       */
      let strictSettings:
        | {
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
              true
            >;
            translations: Translations;
          }
        | undefined;

      /**
       * Retrieve strict locale settings that may be cached
       *
       * * Throws an exception if strict locale settings have not been loaded when this method is called
       */
      const getStrictSettings = () => {
        if (strictSettings) return strictSettings;
        const strictLocale = loader.getStrictLocale();
        if (!strictLocale) {
          throw new I18nError(
            'Initialization cannot be performed because strict locale settings are not found.',
          );
        }
        strictSettings = {
          locale: strictLocale,
          translations: strictLocale.translations(component),
        };
        return strictSettings;
      };

      /**
       * Get the value of a translation object by the concatenated path of the specified translation object's key and the locale name
       *
       * * If value not found, look for fallback locale value
       * * If a fallback value is found, set the value as a cache in the translation object to be searched
       *
       * @param valuePath - Flattened value path
       * @param localeName - locale name
       */
      const getTranslationByPath = (
        valuePath: string,
        localeName: LocaleName,
      ) => {
        const localeTranslations = flattenedTranslationsMap[localeName];
        const value = localeTranslations[valuePath];
        if (value !== undefined) {
          return value;
        }

        const localeDependencies = Space.localeDependenciesMap[localeName];

        for (const fallbackLocale of localeDependencies) {
          if (fallbackLocale === localeName) continue;
          const fallbackTranslations = flattenedTranslationsMap[fallbackLocale];
          const value = fallbackTranslations[valuePath];
          if (value !== undefined) {
            (localeTranslations as any)[valuePath] = value;
            return value;
          }
        }
        throw new I18nError(`missing locale value for "${valuePath}".`);
      };

      /**
       * Generates flattened translation objects per locale
       *
       * @param localeName - locale name
       * @param tree - Tree of value objects (which must be derived from strict locale translation objects)
       * @param prefix - Key prefix (Set only in recursive calls to this method)
       * @param bucket - Objects to be stored (Set only in recursive calls to this method)
       * @returns Flattened translation object
       */
      const createLocaleFlattenedTranslations = (
        localeName: LocaleName,
        tree: { [key: string]: any },
        prefix = '',
        bucket: { [key: string]: any } = {},
      ) => {
        for (const [key, value] of Object.entries(tree)) {
          const path = `${prefix}${key}`;

          if (isPlainObject(value)) {
            bucket[key] = createLocaleFlattenedTranslations(
              localeName,
              value,
              `${path}.`,
            );
            continue;
          }

          Object.defineProperty(bucket, key, {
            enumerable: true,
            get: () => getTranslationByPath(path, localeName),
          });
        }
        return bucket;
      };

      /**
       * Set up the specified locale
       *
       * @param localeName - locale name
       */
      const setupLocale = (localeName: LocaleName) => {
        const strictSettings = getStrictSettings();
        const locale = loader.get(localeName);
        const translations =
          strictSettings.locale === locale
            ? strictSettings.translations
            : locale.translations(component);

        flattenedTranslationsMap[localeName] = toFlattenedObject(translations);

        translationsMap[localeName] = createLocaleFlattenedTranslations(
          localeName,
          strictSettings.translations,
        ) as any;
      };

      /**
       * Set up a list of specified locale names
       *
       * * This method is called only after the completion of the loading of the component definition from the belonging space
       *
       * @param localeNames - List of locale names
       */
      function _setupLocales(localeNames: LocaleName[]) {
        for (const localeName of localeNames) {
          if (!translationsMap[localeName]) {
            setupLocale(localeName);
          }
        }
      }

      return component;
    },
  };

  return Ctor;
}
