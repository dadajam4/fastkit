import { I18nSpace } from './space';
import { I18nComponentStatic, I18nComponent } from './component';
import { I18nLocaleMeta } from './schemes';
import { I18nStorage, I18nStorageOrFactory } from './storage';

/**
 * Result of component presence request for internationalization services
 */
export interface I18nComponentRequireResult<
  LocaleName extends string,
  BaseLocale extends LocaleName,
  LocaleMeta extends I18nLocaleMeta,
> {
  /** component instance */
  instance: I18nComponent<LocaleName, BaseLocale, LocaleMeta>;

  /** Release the existence of the component */
  disposer: () => void;
}

/**
 * Existence requirements for components in the internationalization space
 *
 * * This class is generated from the internationalization space and the dependencies of the components registered during its instantiation
 * * Basically, if an instance of this exists in a space, its component instances are always affected by the loading and locale selection state of the space
 */
export class I18nComponentRequest<
  LocaleName extends string,
  BaseLocale extends LocaleName,
  LocaleMeta extends I18nLocaleMeta,
> {
  /** component instance */
  readonly instance: I18nComponent<LocaleName, BaseLocale, LocaleMeta>;

  /**
   * List of release processes for existence requests
   *
   * * Matches the number of clients requesting use of this component
   * * When this list is empty, this instance is discarded.
   */
  readonly disposers: (() => void)[] = [];

  /** Callback method when there are no more clients requesting this component */
  private _onEmpty?: () => void;

  /** component definition */
  get Ctor() {
    return this.instance.Ctor;
  }

  /**
   * Initialize component existence request
   *
   * @param space - Internationalization Services
   * @param Ctor - component definition
   * @param onEmpty - Callback method when there are no more clients requesting this component
   */
  constructor(
    space: I18nSpace<LocaleName, BaseLocale, LocaleMeta>,
    Ctor: I18nComponentStatic<LocaleName, BaseLocale, LocaleMeta>,
    onEmpty: () => void,
  ) {
    this.instance = Ctor.createInstance(space);
    this._onEmpty = onEmpty;
  }

  /**
   * Add a request
   *
   * @returns Component instances and request release processing
   */
  require(): I18nComponentRequireResult<LocaleName, BaseLocale, LocaleMeta> {
    const disposer = () => {
      const { disposers } = this;
      const index = disposers.indexOf(disposer);
      if (index === 1) return;
      disposers.splice(index, 1);
      if (!this.disposers.length) {
        const { _onEmpty } = this;
        delete this._onEmpty;
        _onEmpty && _onEmpty();
      }
    };
    this.disposers.push(disposer);
    return {
      instance: this.instance,
      disposer,
    };
  }
}

/**
 * Component load request
 *
 * * At the top of the array is a list of locale names in the request
 */
export type I18nComponentLoadRequest<
  LocaleName extends string,
  BaseLocale extends LocaleName,
  LocaleMeta extends I18nLocaleMeta,
> = [
  LocaleName[],
  I18nComponentStatic<
    LocaleName,
    BaseLocale,
    LocaleMeta,
    any,
    any,
    any,
    any,
    any,
    any
  >,
];

/**
 * Storage data interface used by internationalization services
 */
export interface I18nSpaceStorageData<
  LocaleName extends string,
  BaseLocale extends LocaleName,
  LocaleMeta extends I18nLocaleMeta,
> {
  /** Currently selected locale name */
  currentLocale: LocaleName;

  /** Name of the locale that is about to be selected next */
  nextLocale: LocaleName | null;

  /** List of getters for component existence request */
  componentsRequests: (() => I18nComponentRequest<
    LocaleName,
    BaseLocale,
    LocaleMeta
  >)[];

  /** List of currently loaded locale names */
  loadingLocales: LocaleName[];

  /** List of getters for locale load requests for this storage */
  loadRequests: (() => I18nComponentLoadRequest<
    LocaleName,
    BaseLocale,
    LocaleMeta
  >)[];
}

/**
 * Internal storage interface for internationalized spaces
 */
export class I18nSpaceStorage<
  LocaleName extends string,
  BaseLocale extends LocaleName,
  LocaleMeta extends I18nLocaleMeta,
> {
  /** Storage interfaces available for internationalization services */
  readonly storage: I18nStorage<
    I18nSpaceStorageData<LocaleName, BaseLocale, LocaleMeta>
  >;

  /** Currently selected locale name */
  get currentLocale() {
    return this.storage.get('currentLocale');
  }

  set currentLocale(currentLocale) {
    this.storage.set('currentLocale', currentLocale);
  }

  /** List of currently loaded locale names */
  get loadingLocales() {
    return this.storage.get('loadingLocales');
  }

  /** Name of the locale that is about to be selected next */
  get nextLocale() {
    return this.storage.get('nextLocale') || undefined;
  }

  set nextLocale(nextLocale) {
    this.storage.set('nextLocale', nextLocale || null);
  }

  /** List of getters for component requests for the space this storage is tied to */
  get componentsRequests() {
    return this.storage.get('componentsRequests');
  }

  /** List of getters for locale load requests for this storage */
  get loadRequests() {
    return this.storage.get('loadRequests');
  }

  /**
   * Initialize the internal storage of the internationalization space
   *
   * @param storage - Storage Interface
   * @param defaultLocale - Default locale name
   */
  constructor(
    storage: I18nStorageOrFactory<
      I18nSpaceStorageData<LocaleName, BaseLocale, LocaleMeta>
    >,
    defaultLocale: LocaleName,
  ) {
    // Initialize internal storage
    const _storage = typeof storage === 'function' ? storage() : storage;

    _storage.set('currentLocale', defaultLocale);
    _storage.set('nextLocale', null);
    _storage.set('componentsRequests', []);
    _storage.set('loadingLocales', []);
    _storage.set('loadRequests', []);

    this.storage = _storage;
  }

  /**
   * Obtains a component request from the specified component definition
   *
   * @param Ctor - component definition
   * @returns component request
   */
  findComponentRequest(
    Ctor: I18nComponentStatic<LocaleName, BaseLocale, LocaleMeta>,
  ) {
    const hit = this.componentsRequests.find((req) => req().Ctor === Ctor);
    return hit && hit();
  }

  /**
   * Obtain a component instance from the specified component definition
   *
   * @param Ctor - component definition
   * @returns component instance
   */
  findComponentInstance(
    Ctor: I18nComponentStatic<LocaleName, BaseLocale, LocaleMeta>,
  ) {
    const req = this.findComponentRequest(Ctor);
    return req && req.instance;
  }

  /**
   * Requests the presence of a component for a given space
   *
   * @param space - Internationalization Services
   * @param Ctor - component definition
   * @returns Result of component presence request for internationalization services
   */
  requestComponent(
    space: I18nSpace<LocaleName, BaseLocale, LocaleMeta>,
    Ctor: I18nComponentStatic<LocaleName, BaseLocale, LocaleMeta>,
  ): I18nComponentRequireResult<LocaleName, BaseLocale, LocaleMeta> {
    let req = this.findComponentRequest(Ctor);
    if (!req) {
      const _req = new I18nComponentRequest(space, Ctor, () =>
        this.releaseComponentRequest(Ctor),
      );
      req = _req;
      this.storage.set('componentsRequests', [
        ...this.componentsRequests,
        () => _req,
      ]);
    }
    return req.require();
  }

  /**
   * Release existence request for specified component definition
   *
   * @param Ctor - component definition
   */
  releaseComponentRequest(
    Ctor: I18nComponentStatic<LocaleName, BaseLocale, LocaleMeta>,
  ) {
    this.storage.set(
      'componentsRequests',
      this.componentsRequests.filter((req) => req().Ctor !== Ctor),
    );
  }

  /**
   * List of component instances whose presence is requested
   *
   * @returns List of component instances
   */
  requiredComponents() {
    return this.componentsRequests.map((req) => req().instance);
  }

  /**
   * Obtains a load request for a specified component definition
   *
   * @param Ctor - component definition
   * @returns Component load request
   */
  findLoadRequest(
    Ctor: I18nComponentStatic<LocaleName, BaseLocale, LocaleMeta>,
  ) {
    const getter = this.loadRequests.find((req) => req()[1] === Ctor);
    return getter && getter();
  }

  /**
   * Add a load request for the specified component definition
   *
   * * When executing this method, be sure to release the request by executing Function, the return value of this method, after the load is completed on the executing side
   * * Both the execution of this method and the release process update the definition settings of the loaded language & components
   *
   * @param Ctor - component definition
   * @param localeNames - List of locale names
   * @returns Function for releasing read requests
   */
  pushLoadRequest(
    Ctor: I18nComponentStatic<LocaleName, BaseLocale, LocaleMeta>,
    localeNames: LocaleName[],
  ) {
    const _localeNames = localeNames.slice();
    const req = this.findLoadRequest(Ctor);
    if (!req) {
      const _req: I18nComponentLoadRequest<LocaleName, BaseLocale, LocaleMeta> =
        [_localeNames, Ctor];
      this.storage.set('loadRequests', [...this.loadRequests, () => _req]);
    } else {
      req[0] = Array.from(new Set([...req[0], ...localeNames]));
    }

    this.updateLoadingLocales();

    return () => {
      const req = this.findLoadRequest(Ctor);
      if (!req) return;
      req[0] = req[0].filter((localName) => !_localeNames.includes(localName));
      if (!req[0].length) {
        this.storage.set(
          'loadRequests',
          this.loadRequests.filter((getter) => getter() !== req),
        );
        this.updateLoadingLocales();
      }
    };
  }

  /** Check if one or more locales are running load */
  isLoading(): boolean;

  /** Checks if one of the list of specified locale names is currently loading */
  isLoading(...localeNames: LocaleName[]): boolean;

  /** Checks if one of the list of specified locale names is currently loading */
  isLoading(...localeNames: LocaleName[]): boolean;

  isLoading(...localeNames: LocaleName[]) {
    const { loadingLocales } = this;
    if (!localeNames.length) return loadingLocales.length > 0;
    return localeNames.some((localeName) =>
      loadingLocales.includes(localeName),
    );
  }

  someComponentIsLoading(
    Ctors: I18nComponentStatic<LocaleName, BaseLocale, LocaleMeta>[],
    localeNames?: LocaleName[],
  ) {
    for (const Ctor of Ctors) {
      const req = this.findLoadRequest(Ctor);
      if (
        req &&
        (!localeNames ||
          localeNames.some((localeName) => req[0].includes(localeName)))
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Update the list of loading locale names
   *
   * * This method is only executed from within pushLoadRequest or its release method
   */
  private updateLoadingLocales() {
    const chunks = this.loadRequests.map((getter) => getter()[0]);
    this.storage.set('loadingLocales', Array.from(new Set(chunks.flat())));
  }
}
