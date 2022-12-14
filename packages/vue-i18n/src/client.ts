import { App } from 'vue';
import type { AnySpace } from './schemes';
import type { Router, RouteLocationRaw } from 'vue-router';
import type { VueI18nContext } from './context';
import { VueI18nSubSpaceProvider } from './provider';
import { VueI18nStrategy } from './strategies';
import { logger, VueI18nError } from './logger';
import { IN_WINDOW } from '@fastkit/helpers';

/**
 * Result of Client Language Retrieval
 *
 * * We are aware of values such as Navigator.language and the Accept language header
 */
export type GetClientLanguageResult =
  | string
  | string[]
  | readonly string[]
  | undefined
  | null;

/**
 * Method for redirects on the server
 */
export type ServerRedirectFn = (redirectTo: string) => any;

/**
 * Method for getting the client's language
 *
 * @param availableLocales - List of locale names supported by the i18n space
 */
export type GetClientLanguage = (
  availableLocales: string[] | readonly string[],
) => GetClientLanguageResult;

/**
 * Storage interface for storing the results of the strategy's processing
 *
 * * Please set up any storage on the side of the strategy user
 * * For example, map to cookies if server-side, local storage if on the browser, etc.
 */
export interface StrategyStorage {
  /**
   * Obtains the value of a specified key
   */
  get: (key: string) => any;

  /**
   * Stores a value in the specified key
   */
  set: (key: string, value: string) => any;
}

/**
 * Client configuration for vue-i18n
 *
 * @see {@link VueI18nClient}
 */
export interface VueI18nClientSettings {
  /**
   * Storage interface for storing the results of the strategy's processing
   *
   * @see {@link StrategyStorage}
   */
  strategyStorage?: StrategyStorage;

  /**
   * Get the client's language
   *
   * * This setting is primarily intended to recognize the client language on the server side
   * * If the runtime environment is a browser, ignore behavior settings and return `Navigator.languages`
   *
   * @see {@link GetClientLanguageResult}
   */
  getClientLanguage?: GetClientLanguage;

  /**
   * Method for redirects on the server
   *
   * * Called when redirecting on the SSR side
   */
  serverRedirect?: ServerRedirectFn;

  /**
   * Initial Client Path
   *
   * * At the time of initialization of vue-router, the route may not yet be established, so please configure as needed
   */
  initialPath?: string | (() => string | undefined);
}

/**
 * vue-i18n client
 *
 * * Class that controls one client request for a vue application with vue-i18n set up
 */
export class VueI18nClient {
  /**
   * Context object to control & support strategy behavior
   * @see {@link VueI18nContext}
   */
  readonly ctx: VueI18nContext;

  /** vue application instance */
  readonly app: App;

  /** i18n space instance */
  readonly space: AnySpace;

  /**
   * vue-router instance
   *
   * * Only set if vur-router is pre-installed in vue
   * * Support processes that depend on the router instance must have this instance set
   */
  readonly router?: Router;

  /**
   * Client configuration for vue-i18n
   * @see {@link VueI18nClientSettings}
   */
  readonly settings: VueI18nClientSettings;

  // readonly storage?: StrategyStorage;

  /** List of valid locale names in this space */
  get availableLocales() {
    return this.space.availableLocales;
  }

  /** base locale name */
  get baseLocale() {
    return this.space.baseLocale;
  }

  constructor(
    ctx: VueI18nContext,
    app: App,
    space: AnySpace,
    settings: VueI18nClientSettings = {},
  ) {
    this.ctx = ctx;
    this.app = app;
    this.space = space;
    this.settings = settings;
    this.router = app.config.globalProperties.$router;

    this.setSpaceLocale = space.setLocale.bind(space);

    // Register guard if Vue Router is already installed
    if (this.router) {
      VueI18nSubSpaceProvider.registerRouterGuard(this.router, space, app);
    }
  }

  /**
   * Obtain a (vue-router)Router instance
   *
   * @see {@link Router}
   * @returns Router instance
   * @throws Will throw an error if no Router instance is installed.
   */
  enforceRouter(): Router {
    const { router } = this;
    if (!router) {
      throw new VueI18nError(
        'A vue-router instance is required for the path prefix strategy to work.',
      );
    }
    return router;
  }

  /**
   * Set locale for i18n space
   *
   * @remarks
   * * vue-i18n overrides the `setLocale` method of an i18n space instance
   * * Use this override if you want to call the space method directly, ignoring the processing of this override
   */
  readonly setSpaceLocale: (localeName: string) => Promise<void>;

  /**
   * Initialize the strategy
   *
   * @remarks This method performs the following initialization
   *
   * - If the strategy has i18n space extension settings, extend the space instance
   * - Override i18n space locale setting methods with strategy locale setting methods
   * - If the strategy initialization process returns a locale name, set it to space as the initial locale
   *
   * @param strategy - Strategies for working with i18n spaces in vue applications
   * @see {@link VueI18nStrategy}
   */
  initStrategy(strategy: VueI18nStrategy<any>) {
    const { space } = this;

    if (strategy.spaceExtends) {
      const extendsProps = strategy.spaceExtends(this);
      Object.entries(extendsProps).forEach(([key, value]) => {
        Object.defineProperty(space, key, {
          get: () => value,
        });
      });
    }

    const { setLocale, locale } = strategy.initClient(this);

    /**
     * The `setLocale` method to inject into i18n space
     *
     * @param localeName - locale name
     */
    const setLocaleAdapter = (localeName: string): Promise<void> => {
      const resolvedLocaleName = space.resolveLocale(localeName);
      if (space.currentLocaleIs(resolvedLocaleName)) return Promise.resolve();
      return setLocale(resolvedLocaleName);
    };

    // Override methods for locale sets
    space.setLocale = setLocaleAdapter;

    // If locale name is returned, set to space
    locale && this.setSpaceLocale(locale);
  }

  /**
   * Obtain client-recognizable languages
   *
   * * If the runtime environment is a browser, ignore behavior settings and return `Navigator.languages`
   *
   * @returns client-recognizable languages
   * @see {@link VueI18nClientSettings.getClientLanguage}
   */
  getClientLanguage(
    availableLocales: string[] | readonly string[] = this.availableLocales,
  ) {
    if (typeof navigator !== 'undefined') {
      return navigator.languages;
    }
    const { getClientLanguage } = this.settings;
    return getClientLanguage && getClientLanguage(availableLocales);
  }

  /**
   * Get the locale name of the best matching locale in the i18n space locale among the languages the client can recognize
   *
   * * returns `undefined` if no matching locale is found
   * @returns best match locale name
   */
  extractClientLocale(): string | undefined {
    const lang = this.getClientLanguage();
    if (!lang) return;
    const chunks = typeof lang === 'string' ? [lang] : lang;
    for (const chunk of chunks) {
      const resolved = this.space.resolveLocale(chunk, true);
      if (resolved) return resolved;
    }
  }

  /**
   * Retrieve storage values
   *
   * * Returns `undefined` if storage is not set
   *
   * @param key - Value Key
   * @returns If stored, the value string
   */
  getStorageValue(key: string): string | undefined {
    const { strategyStorage } = this.settings;
    const value = strategyStorage && strategyStorage.get(key);
    return typeof value === 'string' ? value : undefined;
  }

  /**
   * Store values in storage
   *
   * * If storage is not configured, the process is canceled
   *
   * @param key - Value Key
   * @param value - String to be saved
   */
  setStorageValue(key: string, value: string): void {
    const { strategyStorage } = this.settings;
    strategyStorage && strategyStorage.set(key, value);
  }

  /**
   * Method to redirect
   *
   * * When the execution environment is a server, if a redirect method for SSR is set, that method will be called.
   *
   * @param redirectTo - Redirect Location
   */
  redirect(redirectTo: RouteLocationRaw): any {
    const fullPath = this.rawLocationToFullPath(redirectTo);
    const { router } = this;
    const { serverRedirect } = this.settings;

    if (!fullPath) {
      logger.warn(
        'Cancels the redirect because the redirector cannot be resolved.',
        redirectTo,
      );
      return;
    }

    if (IN_WINDOW) {
      if (router) {
        router.replace(fullPath);
      } else {
        location.href = fullPath;
      }
      return;
    }

    if (serverRedirect) {
      serverRedirect(fullPath);
    } else if (router) {
      router.replace(fullPath);
    } else {
      logger.warn(
        'Cancel the redirection because the server could not detect the redirection method.',
        redirectTo,
      );
    }
  }

  /**
   * Obtain the initial path of the client
   *
   * @see {@link VueI18nClientSettings.initialPath}
   */
  getInitialPath(): string | undefined {
    const { initialPath } = this.settings;
    return typeof initialPath === 'function' ? initialPath() : initialPath;
  }

  /**
   * Convert locations that can be specified in vue-router to full paths
   * @param rawLocation - User-level route location
   * @returns Full path of location
   */
  private rawLocationToFullPath(
    rawLocation: RouteLocationRaw,
  ): string | undefined {
    if (this.router) return this.router.resolve(rawLocation).fullPath;
    if (typeof rawLocation === 'string') return rawLocation;
  }
}
