import {
  I18nLocaleMeta,
  I18nTranslations,
  I18nDateTimeFormats,
  I18nRelativeTimeFormats,
  I18nNumberFormats,
  I18nListFormats,
  I18nDependencies,
  I18nNormalizedFormats,
} from './schemes';
import {
  I18nComponentLocale,
  I18nComponentLocaleSettings,
  I18nTranslationsOrFactory,
} from './component-locale';
import {
  I18nComponentStatic,
  I18nComponentStaticSettings,
  defineI18nComponent,
} from './component';
import { I18nSpaceStatic } from './space';

/**
 * Component Schema Settings
 */
export type I18nComponentSchemeSettings<
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
  /** space definition */
  Space: I18nSpaceStatic<LocaleName, BaseLocale, LocaleMeta>;

  /**
   * Translation Object Validator
   *
   * * This field is required for type definition resolution in TypeScript
   * * Even if the contents of a Function are mocked (always responds true), there is no problem for normal use.
   * * Can be used to validate values, e.g. when retrieving translation objects from an external server (wip)
   */
  translations?: (translations: Translations) => boolean;

  /** Setting the formatting of Date and time that can be registered for internationalization services */
  dateTimeFormats?: DateTimeFormats;

  /** Setting the formatting of relative time that can be registered for internationalization services */
  relativeTimeFormats?: RelativeTimeFormats;

  /** Setting the formatting of numbers that can be registered for internationalization services */
  numberFormats?: NumberFormats;

  /** Setting the formatting of list that can be registered with the Internationalization Service */
  listFormats?: ListFormats;

  /**
   * Map of dependent components that can be registered in the spaces and components of the internationalization service
   *
   * * Registered dependencies can be referenced from the component instance `deps`.
   */
  dependencies?: Dependencies;
};

/**
 * Interfaces owned by both the component definition and its instance
 */
export interface I18nComponentSchemeImpl<
  DateTimeFormats extends I18nDateTimeFormats,
  RelativeTimeFormats extends I18nRelativeTimeFormats,
  NumberFormats extends I18nNumberFormats,
  ListFormats extends I18nListFormats,
> {
  /** Setting the formatting of Date and time that can be registered for internationalization services */
  readonly dateTimeFormats: I18nNormalizedFormats<'dateTime', DateTimeFormats>;

  /** Setting the formatting of relative time that can be registered for internationalization services */
  readonly relativeTimeFormats: I18nNormalizedFormats<
    'relativeTime',
    RelativeTimeFormats
  >;

  /** Setting the formatting of numbers that can be registered for internationalization services */
  readonly numberFormats: I18nNormalizedFormats<'number', NumberFormats>;

  /** Setting the formatting of list that can be registered with the Internationalization Service */
  readonly listFormats: I18nNormalizedFormats<'list', ListFormats>;
}

/**
 * Interface of methods for defining translation objects
 */
export interface DefineI18nTranslations<
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
  /**
   * Define a translation object
   *
   * @param translations - Translation object or its factory
   * @returns Translation object or its factory
   */
  (
    translations: I18nTranslationsOrFactory<
      LocaleName,
      BaseLocale,
      LocaleMeta,
      Translations,
      DateTimeFormats,
      RelativeTimeFormats,
      NumberFormats,
      ListFormats,
      Dependencies,
      false
    >,
  ): I18nTranslationsOrFactory<
    LocaleName,
    BaseLocale,
    LocaleMeta,
    Translations,
    DateTimeFormats,
    RelativeTimeFormats,
    NumberFormats,
    ListFormats,
    Dependencies,
    false
  >;
  /**
   * Strictly define translation objects
   *
   * @param translations - Translation object or its factory
   * @returns Translation object or its factory
   */
  strict(
    translations: I18nTranslationsOrFactory<
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
    >,
  ): I18nTranslationsOrFactory<
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
}

/**
 * Interface for methods that define component locales
 */
export interface DefineI18nLocale<
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
  /**
   * Define a component locale
   *
   * @param localeSettings - Component locale settings
   * @returns component locale
   */
  (
    localeSettings: I18nComponentLocaleSettings<
      LocaleName,
      BaseLocale,
      LocaleMeta,
      Translations,
      DateTimeFormats,
      RelativeTimeFormats,
      NumberFormats,
      ListFormats,
      Dependencies,
      false
    >,
  ): I18nComponentLocale<
    LocaleName,
    BaseLocale,
    LocaleMeta,
    Translations,
    DateTimeFormats,
    RelativeTimeFormats,
    NumberFormats,
    ListFormats,
    Dependencies,
    false
  >;
  /**
   * Strictly define component locale
   *
   * @param localeSettings - Component locale settings
   * @returns component locale
   */
  strict(
    localeSettings: I18nComponentLocaleSettings<
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
    >,
  ): I18nComponentLocale<
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
}

/**
 * component schema
 */
export interface I18nComponentScheme<
  LocaleName extends string,
  BaseLocale extends LocaleName,
  LocaleMeta extends I18nLocaleMeta,
  Translations extends I18nTranslations,
  DateTimeFormats extends I18nDateTimeFormats,
  RelativeTimeFormats extends I18nRelativeTimeFormats,
  NumberFormats extends I18nNumberFormats,
  ListFormats extends I18nListFormats,
  Dependencies extends I18nDependencies<LocaleName, BaseLocale, LocaleMeta>,
> extends I18nComponentSchemeImpl<
    DateTimeFormats,
    RelativeTimeFormats,
    NumberFormats,
    ListFormats
  > {
  /** Translation object validators */
  readonly isAvailablTranslations: (translations: Translations) => boolean;

  /** space definition */
  readonly Space: I18nSpaceStatic<LocaleName, BaseLocale, LocaleMeta>;

  /** Map of dependent components that can be registered in the spaces and components of the internationalization service */
  readonly dependencies: Dependencies;

  /**
   * Create component definitions
   *
   * @param componentSettings - Component Definition Settings
   */
  defineComponent(
    componentSettings: Omit<
      I18nComponentStaticSettings<
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
      'scheme'
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
  >;

  /** Interface of methods for defining translation objects */
  defineTranslations: DefineI18nTranslations<
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

  /** Interface for methods that define component locales */
  defineLocale: DefineI18nLocale<
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
 * Define component schemas
 *
 * @param settings - Component Schema Settings
 * @returns Component Schema
 */
export function defineI18nComponentScheme<
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
  settings: I18nComponentSchemeSettings<
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
): I18nComponentScheme<
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
  const {
    Space,
    translations = () => true,
    dateTimeFormats = {},
    relativeTimeFormats = {},
    numberFormats = {},
    listFormats = {},
    dependencies = {} as Dependencies,
  } = settings;

  const defineTranslations: DefineI18nTranslations<
    LocaleName,
    BaseLocale,
    LocaleMeta,
    Translations,
    DateTimeFormats,
    RelativeTimeFormats,
    NumberFormats,
    ListFormats,
    Dependencies
  > = function defineTranslations(translations) {
    return translations;
  };

  defineTranslations.strict = function defineStrictTranslations(translations) {
    return translations;
  };

  const defineLocale: DefineI18nLocale<
    LocaleName,
    BaseLocale,
    LocaleMeta,
    Translations,
    DateTimeFormats,
    RelativeTimeFormats,
    NumberFormats,
    ListFormats,
    Dependencies
  > = function defineLocale(localeSettings) {
    return new I18nComponentLocale(localeSettings);
  };

  defineLocale.strict = function defineStrictLocale(localeSettings) {
    return new I18nComponentLocale(localeSettings, true);
  };

  const scheme: I18nComponentScheme<
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
    Space,
    dependencies,
    isAvailablTranslations: translations,
    dateTimeFormats: dateTimeFormats as I18nNormalizedFormats<
      'dateTime',
      DateTimeFormats
    >,
    relativeTimeFormats: relativeTimeFormats as I18nNormalizedFormats<
      'relativeTime',
      RelativeTimeFormats
    >,
    numberFormats: numberFormats as I18nNormalizedFormats<
      'number',
      NumberFormats
    >,
    listFormats: listFormats as I18nNormalizedFormats<'list', ListFormats>,
    defineTranslations,
    defineLocale,
    defineComponent: (componentSettings) =>
      defineI18nComponent({ scheme, ...componentSettings }),
  };

  return scheme;
}
