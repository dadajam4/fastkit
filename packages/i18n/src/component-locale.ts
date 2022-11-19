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
import { I18nComponent } from './component';
import { DeepPartial } from '@fastkit/helpers';

/**
 * translation object
 */
export type I18nTranslationsData<
  Translations extends I18nTranslations,
  Strict extends boolean = false,
> = Strict extends true ? Translations : DeepPartial<Translations>;

/**
 * Translation Object Factory
 *
 * * In the internationalization service, the translation object is never directly referenced until the component is instantiated
 * * This is a specification to allow for the case where independent component instances are referenced in the translation object.
 */
export type I18nTranslationsFactory<
  LocaleName extends string = string,
  BaseLocale extends LocaleName = LocaleName,
  LocaleMeta extends I18nLocaleMeta = {},
  Translations extends I18nTranslations = {},
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
> = (
  component: I18nComponent<
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
) => I18nTranslationsData<Translations, Strict>;

/** Translation object or its factory */
export type I18nTranslationsOrFactory<
  LocaleName extends string = string,
  BaseLocale extends LocaleName = LocaleName,
  LocaleMeta extends I18nLocaleMeta = {},
  Translations extends I18nTranslations = {},
  DateTimeFormats extends I18nDateTimeFormats = I18nDateTimeFormats,
  RelativeTimeFormats extends I18nRelativeTimeFormats = I18nRelativeTimeFormats,
  NumberFormats extends I18nNumberFormats = I18nNumberFormats,
  ListFormats extends I18nListFormats = I18nListFormats,
  Dependencies extends I18nDependencies<
    LocaleName,
    BaseLocale,
    LocaleMeta
  > = I18nDependencies<LocaleName, BaseLocale, LocaleMeta>,
  Strict extends boolean = true,
> =
  | I18nTranslationsData<Translations, Strict>
  | I18nTranslationsFactory<
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
 * Normalize a translation object or its factory to a factory method
 *
 * @param target - Translation object or its factory
 * @returns Translation Object Factory
 */
function normalizeTranslationsToFactory<
  LocaleName extends string = string,
  BaseLocale extends LocaleName = LocaleName,
  LocaleMeta extends I18nLocaleMeta = {},
  Translations extends I18nTranslations = {},
  DateTimeFormats extends I18nDateTimeFormats = I18nDateTimeFormats,
  RelativeTimeFormats extends I18nRelativeTimeFormats = I18nRelativeTimeFormats,
  NumberFormats extends I18nNumberFormats = I18nNumberFormats,
  ListFormats extends I18nListFormats = I18nListFormats,
  Dependencies extends I18nDependencies<
    LocaleName,
    BaseLocale,
    LocaleMeta
  > = I18nDependencies<LocaleName, BaseLocale, LocaleMeta>,
  Strict extends boolean = true,
>(
  target: I18nTranslationsOrFactory<
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
  >,
): I18nTranslationsFactory<
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
> {
  return typeof target === 'function'
    ? (target as I18nTranslationsFactory<
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
      >)
    : () => target;
}

/**
 * Component locale settings
 */
export interface I18nComponentLocaleSettings<
  LocaleName extends string = string,
  BaseLocale extends LocaleName = LocaleName,
  LocaleMeta extends I18nLocaleMeta = {},
  Translations extends I18nTranslations = {},
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
> {
  /** Translation object or its factory */
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
    Strict
  >;
  /** Setting the formatting of Date and time that can be registered for internationalization services */
  dateTimeFormats?: Partial<I18nNormalizedFormats<'dateTime', DateTimeFormats>>;

  /** Setting the formatting of relative time that can be registered for internationalization services */
  relativeTimeFormats?: Partial<
    I18nNormalizedFormats<'relativeTime', RelativeTimeFormats>
  >;

  /** Setting the formatting of numbers that can be registered for internationalization services */
  numberFormats?: Partial<I18nNormalizedFormats<'number', NumberFormats>>;

  /** Setting the formatting of list that can be registered with the Internationalization Service */
  listFormats?: Partial<I18nNormalizedFormats<'list', ListFormats>>;
}

/**
 * component locale
 */
export class I18nComponentLocale<
  LocaleName extends string = string,
  BaseLocale extends LocaleName = LocaleName,
  LocaleMeta extends I18nLocaleMeta = any,
  Translations extends I18nTranslations = any,
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
> {
  /**
   * Translation Object Factory
   *
   * * Runs only once when the component is instantiated and a locale load request is generated
   */
  readonly translations: I18nTranslationsFactory<
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

  /** Setting the formatting of Date and time that can be registered for internationalization services */
  readonly dateTimeFormats: DateTimeFormats;

  /** Setting the formatting of relative time that can be registered for internationalization services */
  readonly relativeTimeFormats: RelativeTimeFormats;

  /** Setting the formatting of numbers that can be registered for internationalization services */
  readonly numberFormats: NumberFormats;

  /** Setting the formatting of list that can be registered with the Internationalization Service */
  readonly listFormats: ListFormats;

  /** Is this locale a strict locale? */
  readonly isStrict: boolean;

  /**
   * Initialize component locales
   *
   * @param settings - Component locale settings
   * @param isStrict - Is this locale a strict locale?
   */
  constructor(
    settings: I18nComponentLocaleSettings<
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
    >,
    isStrict: Strict = false as Strict,
  ) {
    const {
      translations = {} as I18nTranslationsData<Translations, Strict>,
      dateTimeFormats = {} as Partial<DateTimeFormats>,
      relativeTimeFormats = {} as Partial<RelativeTimeFormats>,
      numberFormats = {} as Partial<NumberFormats>,
      listFormats = {} as Partial<ListFormats>,
    } = settings;

    this.translations = normalizeTranslationsToFactory(translations);
    this.dateTimeFormats = dateTimeFormats as any;
    this.relativeTimeFormats = relativeTimeFormats as any;
    this.numberFormats = numberFormats as any;
    this.listFormats = listFormats as any;
    this.isStrict = isStrict;
  }
}
