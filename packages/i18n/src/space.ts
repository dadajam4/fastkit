import {
  I18nLocaleMeta,
  I18nTranslations,
  I18nDateTimeFormats,
  I18nRelativeTimeFormats,
  I18nNumberFormats,
  I18nListFormats,
  I18nDependencies,
  I18nInstantiatedDependencies,
  I18nSpaceFallbackLocale,
} from './schemes';
import { I18nLocaleSource, I18nLocale, I18nLocales } from './locale';
import {
  I18nComponentScheme,
  I18nComponentSchemeSettings,
  defineI18nComponentScheme,
} from './component-scheme';
import {
  I18nStorage,
  I18nStorageOrFactory,
  createI18nObjectStorage,
  I18nStorageAnyData,
} from './storage';
import { I18nComponentStatic } from './component';
import { resolveLocale as _resolveLocale } from './helpers';
import { I18nSpaceStorage, I18nSpaceStorageData } from './space-storage';

/**
 * Internationalization space definition settings
 */
export interface I18nSpaceStaticSettings<
  LocaleName extends string,
  BaseLocale extends LocaleName,
  LocaleMeta extends I18nLocaleMeta,
> {
  /** Locale settings or mixed list of locale names for internationalization spaces */
  locales: I18nLocaleSource<LocaleName, LocaleMeta>[];

  /**
   * base locale name
   */
  baseLocale: BaseLocale;

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
  fallbackLocale?: I18nSpaceFallbackLocale<LocaleName>;
}

/**
 * The definition of the internationalization space or an instance of it, or the interface that all of its subspaces hold
 */
export interface I18nSpaceStaticImpl<
  LocaleName extends string,
  BaseLocale extends LocaleName,
  LocaleMeta extends I18nLocaleMeta,
> {
  /** List of locales in the internationalization space */
  readonly locales: I18nLocales<LocaleName, BaseLocale, LocaleMeta>;

  /** base locale name */
  readonly baseLocale: BaseLocale;
  /**
   * First locale name immediately after the i18n service is initialized
   *
   * * If not set, the base locale name is set by default
   */
  readonly defaultLocale: LocaleName;

  /** List of valid locale names in this space */
  readonly availableLocales: readonly LocaleName[];

  /** Map of dependent locale names per locale name in space */
  readonly localeDependenciesMap: Record<LocaleName, LocaleName[]>;

  /**
   * Checks if the specified locale name is the base locale name
   * @param localeName - Locale name
   * @returns `true` if it is a base locale name
   */
  isBaseLocale(localeName: LocaleName): localeName is BaseLocale;

  /**
   * Checks if the specified locale name (or similar string) is the base locale name
   * @param localeLikeString - Locale name (or similar name)
   * @returns `true` if it is a base locale name
   */
  isBaseLocale(
    localeLikeString: LocaleName | string,
  ): localeLikeString is BaseLocale;

  /**
   * Checks if the specified locale name (or similar string) is a valid locale name for this instance
   * @param localeLikeString - Locale name (or similar name)
   * @returns `true` if it is a valid locale name
   */
  isAvailableLocale(localeLikeString: string): localeLikeString is LocaleName;

  /**
   * Converts the specified locale name (or similar string) to a locale name valid for this instance
   *
   * * This method splits the given string with a hyphen string (`"-"`) to get the most likely locale name
   * * If no locale name matches, the base locale name is selected
   *
   * @param localeLikeString - Locale name (or similar name)
   */
  resolveLocale(localeLikeString: LocaleName | string): LocaleName;

  /**
   * Converts the specified locale name (or similar string) to a locale name valid for this instance
   *
   * * This method splits the given string with a hyphen string (`"-"`) to get the most likely locale name
   * * If the locale names do not match, the base locale name is selected unless the second argument is true
   *
   * @param localeLikeString - Locale name (or similar name)
   * @param withoutDefault - Return undefined when no matching locale is found?
   */
  resolveLocale<D extends boolean | undefined>(
    localeLikeString: LocaleName | string,
    withoutDefault?: D,
  ): D extends true ? LocaleName | undefined : LocaleName;

  /**
   * Obtains the locale object corresponding to a given locale name
   *
   * @param localeName - locale name
   */
  getLocale(
    localeName: LocaleName,
  ): I18nLocale<LocaleName, BaseLocale, LocaleMeta>;

  /**
   * Get the meta object corresponding to the specified locale name
   *
   * @param localeName - locale name
   * @returns Meta object
   */
  getLocaleMeta(localeName: LocaleName): LocaleMeta;

  /**
   * Get the locale string that will be passed to Intl to format the date, time, and number for a given locale name (or similar name)
   *
   * @param locale - Locale name
   * @returns Locale name for formatting
   */
  getFormatLocales(locale: LocaleName): string | string[];

  /**
   * Get the locale string that will be passed to Intl to format the date, time, and number for a given locale name (or similar name)
   *
   * @param localeLikeString - Locale name (or similar name)
   * @returns Locale name for formatting
   */
  getFormatLocales(localeLikeString: string): string | string[];

  /**
   * Get a list of dependent locale names for a given locale name
   *
   * * If multiple locale names are specified, their mixed dependent locale names will be returned
   * * Returned locale names are filtered for unnecessary locale names to avoid duplicates
   *
   * @param localeNames - List of locale names
   */
  getLocaleDependencies(...localeNames: LocaleName[]): LocaleName[];
}

/**
 * Internationalization space initialization options
 */
export interface I18nSpaceOptions<
  LocaleName extends string = string,
  BaseLocale extends LocaleName = LocaleName,
  LocaleMeta extends I18nLocaleMeta = I18nLocaleMeta,
  Components extends I18nDependencies<
    LocaleName,
    BaseLocale,
    LocaleMeta
  > = I18nDependencies<LocaleName, BaseLocale, LocaleMeta>,
> {
  /**
   * Configurable storage interface for internationalization services, or a factory for it
   *
   * * Any other specification is acceptable as long as it has get and set interfaces
   * * By registering a reactive interface provided by React, Vue, etc., it is possible to link the state of the UI with the processing state of the internationalization service.
   */
  storage?: I18nStorageOrFactory<I18nStorageAnyData>;

  /**
   * Mapping settings for components you want to be present in the space
   */
  components?: Components;

  /**
   * First locale name immediately after the i18n service is initialized
   *
   * * If not set, the default locale set in the space definition will be set
   */
  defaultLocale?: LocaleName;
}

/**
 * Internationalization Service Space
 *
 * * Internationalization services are basically processed in units of this space.
 * * All components instantiated in this space will work in conjunction with the loading status of this space and the influence of the selected locale
 * * For server-side use, it is best to instantiate this space for one client (one request) or one service function
 * * For client-side use, you can invoke an instance of this space at the root of the application, and then invoke a separate subspace for each root component with `createSubSpace()` to share state and match the design with encapsulated logic. It is possible to match the design with encapsulated logic
 */
export type I18nSpace<
  LocaleName extends string,
  BaseLocale extends LocaleName,
  LocaleMeta extends I18nLocaleMeta,
  Components extends I18nDependencies<
    LocaleName,
    BaseLocale,
    LocaleMeta
  > = I18nDependencies<LocaleName, BaseLocale, LocaleMeta>,
  SpaceCustomInterface extends { [key in keyof any]: any } = {},
> = I18nSpaceStaticImpl<LocaleName, BaseLocale, LocaleMeta> & {
  /** space definition */
  readonly Ctor: I18nSpaceStatic<LocaleName, BaseLocale, LocaleMeta>;

  /** Configurable storage interface for internationalization services */
  readonly storage: I18nStorage<
    I18nSpaceStorageData<LocaleName, BaseLocale, LocaleMeta>
  >;

  /** Currently selected locale name */
  readonly currentLocaleName: LocaleName;

  /** Currently selected locale object */
  readonly currentLocale: I18nLocale<LocaleName, BaseLocale, LocaleMeta>;

  /** Instantiated component map */
  readonly at: I18nInstantiatedDependencies<Components>;

  /**
   * `true` if any locale is in the process of loading.
   */
  readonly isLoading: boolean;

  /**
   * List of locale names currently under loading
   *
   * * Note that this includes locale names other than `nextLocaleName`.
   * * If the locale you are switching to contains dependencies, or if you repeatedly load different locales in succession, there may be cases where multiple locales are being loaded in the background
   */
  readonly loadingLocales: LocaleName[];

  /**
   * If you are switching locales, the locale name
   *
   * * This is usually set by a call to `setLocale()`.
   */
  readonly nextLocaleName?: LocaleName;

  /**
   * If you are switching locales, the locale object
   *
   * * This is usually set by a call to `setLocale()`.
   */
  readonly nextLocale?: I18nLocale<LocaleName, BaseLocale, LocaleMeta>;

  /**
   * Sets the specified locale name and loads dependencies if not already loaded
   * @param locale - locale name
   */
  setLocale(localeName: LocaleName): Promise<void>;

  /**
   * Sets the specified locale name and loads dependencies if not already loaded
   * @param localeLikeString - locale name (or similar name)
   */
  setLocale(localeLikeString: string): Promise<void>;

  /**
   * Loads a locale with the specified locale name (or list of locales)
   *
   * @param localeNames - List of locale names
   */
  load(...localeNames: LocaleName[]): Promise<void>;

  /**
   * Initialize space
   *
   * * This simply loads the currently selected locale
   * * Note that immediately after instantiating the space, loading of the locale under selection is not triggered, so this call must be made
   */
  init(): Promise<
    I18nSpace<
      LocaleName,
      BaseLocale,
      LocaleMeta,
      Components,
      SpaceCustomInterface
    >
  >;

  /**
   * Checks if the specified locale name is currently selected
   *
   * @param localeName - locale name
   */
  currentLocaleIs(localeName: LocaleName): boolean;

  /**
   * Get a list of component definitions this space currently depends on
   */
  getComponentDependencies(): I18nComponentStatic<
    LocaleName,
    BaseLocale,
    LocaleMeta,
    any,
    any,
    any,
    any,
    any,
    any
  >[];

  /**
   * Create a subspace that works with this space
   *
   * @param SubComponents - Map of dependent components that can be registered in the spaces and components of the internationalization service
   * @param bucket - Specify the objects to which you want to map instances of subcomponents, if any (this usually does not need to be specified)
   */
  createSubSpace<
    SubComponents extends I18nDependencies<LocaleName, BaseLocale, LocaleMeta>,
  >(
    SubComponents: SubComponents,
    bucket?: any,
  ): I18nSubSpace<
    LocaleName,
    BaseLocale,
    LocaleMeta,
    Components,
    SubComponents
  >;
} & SpaceCustomInterface;

/**
 * Internationalization Space Definition
 *
 * * Internationalization services are basically processed in units of this space.
 * * All components instantiated in this space will work in conjunction with the loading status of this space and the influence of the selected locale
 * * For server-side use, it is best to instantiate this space for one client (one request) or one service function
 * * For client-side use, you can invoke an instance of this space at the root of the application, and then invoke a separate subspace for each root component with `createSubSpace()` to share state and match the design with encapsulated logic. It is possible to match the design with encapsulated logic
 */
export interface I18nSpaceStatic<
  LocaleName extends string,
  BaseLocale extends LocaleName,
  LocaleMeta extends I18nLocaleMeta,
> extends I18nSpaceStaticImpl<LocaleName, BaseLocale, LocaleMeta> {
  /**
   * Create an instance of an internationalization space
   *
   * * If different instances are created from the same space definition, the loading status of the components and the locale under selection are managed independently
   *
   * @param options - Internationalization space initialization options
   */
  create<
    Components extends I18nDependencies<LocaleName, BaseLocale, LocaleMeta>,
  >(
    options?: I18nSpaceOptions<LocaleName, BaseLocale, LocaleMeta, Components>,
  ): I18nSpace<LocaleName, BaseLocale, LocaleMeta, Components>;

  /**
   * Define component schemas that can belong to this space
   *
   * @param settings - Component Schema Settings
   */
  defineScheme<
    Translations extends I18nTranslations,
    DateTimeFormats extends I18nDateTimeFormats,
    RelativeTimeFormats extends I18nRelativeTimeFormats,
    NumberFormats extends I18nNumberFormats,
    ListFormats extends I18nListFormats,
    Dependencies extends I18nDependencies<LocaleName, BaseLocale, LocaleMeta>,
  >(
    settings: Omit<
      I18nComponentSchemeSettings<
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
      'Space'
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
  >;
}

/**
 * Define internationalization space & generate shared interfaces for instances
 *
 * @internal
 *
 * @param settings - Internationalization space definition settings
 * @returns Interface held by both the definition of the internationalization space or an instance of it
 */
function createStaticImpl<
  LocaleName extends string,
  BaseLocale extends LocaleName,
  LocaleMeta extends I18nLocaleMeta,
>(
  settings: I18nSpaceStaticSettings<LocaleName, BaseLocale, LocaleMeta>,
): I18nSpaceStaticImpl<LocaleName, BaseLocale, LocaleMeta> {
  const {
    locales: _locales,
    baseLocale,
    fallbackLocale,
    defaultLocale = baseLocale,
  } = settings;

  const locales = new I18nLocales(_locales, baseLocale, fallbackLocale);
  const availableLocales = locales.map((locale) => locale.name);
  const localeDependenciesMap = {} as Record<LocaleName, LocaleName[]>;

  locales.forEach((locale) => {
    localeDependenciesMap[locale.name] = locale.dependencies;
  });

  const resolveLocale = (<D extends boolean | undefined>(
    localeLikeString: LocaleName | string,
    withoutDefault?: D,
  ): D extends true ? LocaleName | undefined : LocaleName => {
    return _resolveLocale<LocaleName, D extends true ? undefined : LocaleName>(
      localeLikeString,
      availableLocales,
      withoutDefault ? undefined : (defaultLocale as any),
    );
  }) as I18nSpaceStaticImpl<
    LocaleName,
    BaseLocale,
    LocaleMeta
  >['resolveLocale'];

  const impl: I18nSpaceStaticImpl<LocaleName, BaseLocale, LocaleMeta> = {
    locales,
    availableLocales,
    baseLocale,
    defaultLocale,
    localeDependenciesMap,
    isBaseLocale(localeLikeString): localeLikeString is BaseLocale {
      return localeLikeString === baseLocale;
    },
    isAvailableLocale(localeLikeString): localeLikeString is LocaleName {
      return availableLocales.includes(localeLikeString as any);
    },
    // resolveLocale<D extends boolean>(
    //   localeLikeString: LocaleName | string,
    //   withoutDefault?: D,
    // ): D extends false ? LocaleName | undefined : LocaleName;
    resolveLocale,

    // resolveLocale<D extends boolean | undefined>(
    //   localeLikeString: LocaleName | string,
    //   withoutDefault?: D,
    // ): D extends true ? LocaleName | undefined : LocaleName {
    //   return _resolveLocale<
    //     LocaleName,
    //     D extends true ? undefined : LocaleName
    //   >(
    //     localeLikeString,
    //     availableLocales,
    //     withoutDefault ? undefined : (defaultLocale as any),
    //   );
    // },
    getLocale(localeName) {
      return locales.get(localeName);
    },
    getLocaleMeta(localeName) {
      return impl.getLocale(localeName).meta;
    },
    getFormatLocales(localeLikeString) {
      return impl.getLocale(impl.resolveLocale(localeLikeString))
        .canonicalLocales;
    },
    getLocaleDependencies(...localeNames) {
      const chunks = localeNames.map(
        (localeName) => impl.getLocale(localeName).dependencies,
      );
      return Array.from(new Set(chunks.flat()));
    },
  };
  return impl;
}

/**
 * Subspace for Internationalization Services
 *
 * * This subspace is primarily intended to cater to situations that create a closed internationalization space for client-side routing
 * * By generating this subspace from an internationalized space, you can create a space that is linked to the locale load state or selection state of the parent space
 * * Note that the `dispose()` method of this class must be called when this subspace is no longer needed (mainly when leaving the page on the client side)
 * * If the subspace is not destroyed by the `dispose()` method after it is no longer needed, it may cause a memory leak
 */
export class I18nSubSpace<
  LocaleName extends string,
  BaseLocale extends LocaleName,
  LocaleMeta extends I18nLocaleMeta,
  Components extends I18nDependencies<
    LocaleName,
    BaseLocale,
    LocaleMeta
  > = I18nDependencies<LocaleName, BaseLocale, LocaleMeta>,
  SubComponents extends I18nDependencies<
    LocaleName,
    BaseLocale,
    LocaleMeta
  > = I18nDependencies<LocaleName, BaseLocale, LocaleMeta>,
  SpaceCustomInterface extends { [key in keyof any]: any } = {},
  // Components extends I18nDependencies<LocaleName, BaseLocale, LocaleMeta>,
  // SubComponents extends I18nDependencies<LocaleName, BaseLocale, LocaleMeta>,
> implements I18nSpaceStaticImpl<LocaleName, BaseLocale, LocaleMeta>
{
  /** Internationalization Space */
  readonly space: I18nSpace<
    LocaleName,
    BaseLocale,
    LocaleMeta,
    Components,
    SpaceCustomInterface
  >;

  /** Instantiated component map */
  readonly at: I18nInstantiatedDependencies<Components & SubComponents>;

  /** List of release methods for dependent components in this subspace */
  private _disposers: (() => void)[] = [];

  get locales() {
    return this.space.locales;
  }

  get defaultLocale() {
    return this.space.defaultLocale;
  }

  get baseLocale() {
    return this.space.baseLocale;
  }

  get availableLocales() {
    return this.space.availableLocales;
  }

  get localeDependenciesMap() {
    return this.space.localeDependenciesMap;
  }

  /**
   * Initialize subspace
   *
   * @param space - parent space
   * @param storage - Storage used by parent space
   * @param Components - Map of component definitions to be activated in subspace
   * @param bucket - Object that holds a component instance of the subspace
   */
  constructor(
    space: I18nSpace<
      LocaleName,
      BaseLocale,
      LocaleMeta,
      Components,
      SpaceCustomInterface
    >,
    storage: I18nSpaceStorage<LocaleName, BaseLocale, LocaleMeta>,
    Components: SubComponents,
    bucket: any = {},
  ) {
    this.space = space;

    Object.entries(space.at).forEach(([name, instance]) => {
      Object.defineProperty(bucket, name, {
        enumerable: true,
        get: () => instance,
      });
    });

    Object.entries(Components).forEach(([name, Ctor]) => {
      const { instance, disposer } = storage.requestComponent(space, Ctor);
      Object.defineProperty(bucket, name, {
        enumerable: true,
        get: () => instance,
      });
      this._disposers.push(disposer);
    });

    this.at = bucket;
  }

  isBaseLocale(localeName: LocaleName): localeName is BaseLocale {
    return this.space.isBaseLocale(localeName);
  }

  isAvailableLocale(localeLikeString: string): localeLikeString is LocaleName {
    return this.space.isAvailableLocale(localeLikeString);
  }

  resolveLocale(localeLikeString: string) {
    return this.space.resolveLocale(localeLikeString);
  }

  getLocale(localeName: LocaleName) {
    return this.space.getLocale(localeName);
  }

  getLocaleMeta(localeName: LocaleName) {
    return this.space.getLocaleMeta(localeName);
  }

  getFormatLocales(localeLikeString: string) {
    return this.space.getFormatLocales(localeLikeString);
  }

  getLocaleDependencies(...localeNames: LocaleName[]) {
    return this.space.getLocaleDependencies(...localeNames);
  }

  /**
   * Release subspace from parent space
   */
  dispose() {
    this._disposers.forEach((disposer) => disposer());
    this._disposers = [];
  }
}

/**
 * Internationalization space definition
 *
 * @param settings - Internationalization space definition settings
 * @returns Internationalization Space Definition
 */
export function defineI18nSpace<
  LocaleName extends string,
  BaseLocale extends LocaleName,
  LocaleMeta extends I18nLocaleMeta,
>(
  settings: I18nSpaceStaticSettings<LocaleName, BaseLocale, LocaleMeta>,
): I18nSpaceStatic<LocaleName, BaseLocale, LocaleMeta> {
  const impl = createStaticImpl(settings);
  const Space: I18nSpaceStatic<LocaleName, BaseLocale, LocaleMeta> = {
    ...impl,
    defineScheme(settings) {
      return defineI18nComponentScheme({
        Space,
        ...settings,
      });
    },
    create<
      Components extends I18nDependencies<LocaleName, BaseLocale, LocaleMeta>,
    >(
      options: I18nSpaceOptions<
        LocaleName,
        BaseLocale,
        LocaleMeta,
        Components
      > = {},
    ): I18nSpace<LocaleName, BaseLocale, LocaleMeta, Components> {
      const {
        storage: _storage = createI18nObjectStorage,
        components = {} as Components,
        defaultLocale = impl.defaultLocale,
      } = options;

      const { getLocale } = impl;

      const internalStorage = new I18nSpaceStorage<
        LocaleName,
        BaseLocale,
        LocaleMeta
      >(_storage as any, defaultLocale);

      const at: I18nInstantiatedDependencies<Components> = {} as any;

      const getComponentDependencies = (): I18nComponentStatic<
        LocaleName,
        BaseLocale,
        LocaleMeta,
        any,
        any,
        any,
        any,
        any,
        any
      >[] => {
        return Array.from(
          new Set(internalStorage.componentsRequests.map((req) => req().Ctor)),
        );
      };

      const initResolvers: {
        resolve: (
          space: I18nSpace<LocaleName, BaseLocale, LocaleMeta, Components>,
        ) => any;
        reject: () => any;
      }[] = [];

      const resolveInitResolvers = <T extends 'resolve' | 'reject'>(
        type: T,
        payload: T extends 'resolve'
          ? I18nSpace<LocaleName, BaseLocale, LocaleMeta, Components>
          : any,
      ) => {
        for (const resolver of initResolvers) {
          resolver[type](payload);
        }
        initResolvers.length = 0;
      };

      const loadComponents = (
        Components: I18nComponentStatic<
          LocaleName,
          BaseLocale,
          LocaleMeta,
          any,
          any,
          any,
          any,
          any,
          any
        >[],
        localeNames: LocaleName[],
      ): Promise<void> => {
        if (!Components.length) return Promise.resolve();

        // Get the locale on which the loaded target locale depends
        const localeDependencies = impl.getLocaleDependencies(...localeNames);

        return new Promise((resolve, reject) => {
          let rejected = false;

          const onComponentResolve = () => {
            if (rejected) return;
            if (
              !internalStorage.someComponentIsLoading(
                Components,
                localeDependencies,
              )
            ) {
              resolve();

              if (!space.isLoading) {
                resolveInitResolvers('resolve', space);
              }
            }
          };

          for (const Component of Components) {
            const releaseRequest = internalStorage.pushLoadRequest(
              Component,
              localeNames,
            );
            Component.load(...localeDependencies)
              .then(() => {
                releaseRequest();
                const instance =
                  internalStorage.findComponentInstance(Component);
                instance && instance._setupLocales(localeDependencies);
                onComponentResolve();
              })
              .catch((err) => {
                rejected = true;
                releaseRequest();
                resolveInitResolvers('reject', err);
                reject(err);
              })
              .finally(releaseRequest);
          }
        });
      };

      const space: I18nSpace<LocaleName, BaseLocale, LocaleMeta, Components> = {
        ...impl,
        get Ctor() {
          return Space;
        },
        get storage() {
          return internalStorage.storage;
        },
        at,
        get currentLocaleName() {
          return internalStorage.currentLocale;
        },
        get currentLocale() {
          return getLocale(space.currentLocaleName);
        },
        get loadingLocales() {
          return internalStorage.loadingLocales;
        },
        get nextLocaleName() {
          return internalStorage.nextLocale;
        },
        get nextLocale() {
          const { nextLocaleName } = space;
          if (!nextLocaleName) return;
          return getLocale(nextLocaleName);
        },
        get isLoading() {
          return internalStorage.loadRequests.length > 0;
        },
        setLocale(localeLikeString) {
          const localeName = impl.resolveLocale(localeLikeString);
          internalStorage.nextLocale = localeName;
          return space
            .load(localeName)
            .then(() => {
              internalStorage.currentLocale = localeName;
            })
            .finally(() => {
              internalStorage.nextLocale = undefined;
            });
        },
        currentLocaleIs(localeName) {
          return space.currentLocaleName === localeName;
        },
        createSubSpace(SubComponents, bucket) {
          const subSpace = new I18nSubSpace(
            space,
            internalStorage,
            SubComponents as any,
            bucket,
          );
          if (space.isLoading) {
            loadComponents(Object.values(SubComponents), space.loadingLocales);
          }
          return subSpace;
        },
        getComponentDependencies,
        load(...localeNames) {
          return loadComponents(getComponentDependencies(), localeNames);
        },
        init() {
          if (!space.isLoading)
            return space.load(space.currentLocaleName).then(() => space);
          return new Promise((resolve, reject) => {
            initResolvers.push({
              resolve,
              reject,
            });
          });
        },
      };

      space.createSubSpace(components, at);

      return space;
    },
  };

  return Space;
}
