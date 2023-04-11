import { VueI18nContext } from '../../../context';
import type { Router, RouteRecordRaw, RouterOptions } from 'vue-router';
import { VueI18nClient } from '../../../client';

/**
 * Function to match the route you want to exclude
 *
 * * Note that you can exclude routes by returning `true`!
 */
export type GenerateRouteExcludeFn = (route: RouteRecordRaw) => boolean;

/**
 * Matcher for routes you want to exclude from route generation
 *
 * - `string` Regular expression string to match the path of the route you want to exclude
 * - `RegExp` Regular expression instance to match the path of the route you want to exclude
 * - `GenerateRouteExcludeFn` Function to match the route you want to exclude @see {@link GenerateRouteExcludeFn}
 */
export type GenerateRouteExclude = string | RegExp | GenerateRouteExcludeFn;

/**
 * Normalize the automatic route generation exclusion settings to a function
 * @param source - Matcher for routes you want to exclude from route generation
 * @returns Function to match the route you want to exclude
 */
const normalizeGenerateRouteExclude = (
  source: GenerateRouteExclude,
): GenerateRouteExcludeFn => {
  if (typeof source === 'function') return source;
  const re = typeof source === 'string' ? new RegExp(source) : source;
  return (route) => re.test(route.path);
};

/**
 * Concatenate the locale name with the path to the Route record in vue-router
 *
 * * If the path of the root record does not start with a slash, the locale is ignored
 * @param localeName - locale name
 * @param path - vue-router Route.path
 * @returns
 */
const joinPath = (localeName: string, path: string) => {
  if (path.startsWith('/')) {
    return `/${localeName}${path.replace(/\/$/, '')}`;
  }
  return path;
};

/**
 * How to manipulate the route when calling `setLocale()`.
 *
 * - `push` Keep a history
 * - `replace` Leaves no history
 */
export type SetLocaleBehavior = 'push' | 'replace';

/** Default value of storage key for storing redirected locales */
const DEFAULT_REDIRECTED_STORAGE_KEY = 'vi18n_redirected';

/** Default values for router behavior when setting the locale */
const DEFAULT_SET_LOCALE_BEHAVIOR: SetLocaleBehavior = 'push';

const ROUTER_EXTENDED_SYMBOL = Symbol('v18n-extended');

/**
 * Checks whether the route has already been extended in the specified object
 * @param routerOrOptionsOrRoutes - Objects to be checked
 * @returns true if extended
 */
const isExtended = (
  routerOrOptionsOrRoutes: Router | RouterOptions | RouterOptions['routes'],
): boolean => {
  return (routerOrOptionsOrRoutes as any)[ROUTER_EXTENDED_SYMBOL] === true;
};

/**
 * Set the extended flag for the route
 * @param routerOrOptionsOrRoutes - Objects to be set
 */
const setExtended = (
  routerOrOptionsOrRoutes: Router | RouterOptions | RouterOptions['routes'],
) => {
  Object.defineProperty(routerOrOptionsOrRoutes, ROUTER_EXTENDED_SYMBOL, {
    get: () => true,
  });
};

/**
 * Configure path prefix behavior
 */
export interface PathPrefixContextSettings {
  /**
   * Do you want to exclude route generation for veil locales defined in space
   *
   * @default false
   */
  ignoreBaseLocale?: boolean;

  /**
   * List of routes you want to exclude from route generation
   *
   * @see {@link GenerateRouteExclude}
   */
  excludes?: GenerateRouteExclude[];

  /**
   * How to manipulate the route when calling `setLocale()`.
   *
   * @default "push"
   * @see {@link SetLocaleBehavior}
   * @see {@link DEFAULT_SET_LOCALE_BEHAVIOR}
   */
  setLocaleBehavire?: SetLocaleBehavior;

  /**
   * Storage key corresponding to the locale value of the last redirection result
   * @default "vi18n_redirected"
   * @see {@link DEFAULT_REDIRECTED_STORAGE_KEY}
   */
  redirectedStorageKey?: string;

  /**
   * Enforce redirection to the client locale
   *
   * * Redirects are not performed when the client locale cannot be detected or when it is determined that the redirect should be canceled
   */
  forceClientLocale?: boolean;
}

/**
 * Service class to extend routes according to the locale of the i18n space
 */
export class PathPrefixContext {
  /**
   * Context object to control & support strategy behavior
   * @see {@link VueI18nContext}
   */
  readonly ctx: VueI18nContext;

  /** Regular expression instances matching the locale prefix for this space */
  readonly pathMatchRe: RegExp;

  /**
   * How to manipulate the route when calling `setLocale()`.
   * @see {@link SetLocaleBehavior}
   */
  readonly setLocaleBehavire: SetLocaleBehavior;

  /**
   * Do you want to exclude route generation for veil locales defined in space
   * @see {@link PathPrefixContextSettings.ignoreBaseLocale}
   */
  readonly ignoreBaseLocale: boolean;

  /**
   * Storage key corresponding to the locale value of the last redirection result
   * @see {@link PathPrefixContextSettings.redirectedStorageKey}
   */
  readonly redirectedStorageKey: string;

  /**
   * Enforce redirection to the client locale
   * @see {@link PathPrefixContextSettings.forceClientLocale}
   */
  readonly forceClientLocale: boolean;

  /**
   * List of routes you want to exclude from route generation
   * @see {@link GenerateRouteExcludeFn}
   */
  readonly excludes: GenerateRouteExcludeFn[];

  /** Internationalization Space Definition */
  get Space() {
    return this.ctx.Space;
  }

  /** List of valid locale names in this space */
  get availableLocales() {
    return this.Space.availableLocales;
  }

  /** base locale name */
  get baseLocale() {
    return this.Space.baseLocale;
  }

  /** Checks if the specified locale name (or similar string) is a valid locale name for this instance */
  get isAvailableLocale() {
    return this.Space.isAvailableLocale;
  }

  constructor(ctx: VueI18nContext, settings: PathPrefixContextSettings = {}) {
    this.ctx = ctx;
    this.pathMatchRe = new RegExp(`^/(${this.availableLocales.join('|')})`);

    const {
      setLocaleBehavire = DEFAULT_SET_LOCALE_BEHAVIOR,
      excludes = [],
      ignoreBaseLocale = false,
      redirectedStorageKey = DEFAULT_REDIRECTED_STORAGE_KEY,
      forceClientLocale = false,
    } = settings;
    this.setLocaleBehavire = setLocaleBehavire;
    this.ignoreBaseLocale = ignoreBaseLocale;
    this.redirectedStorageKey = redirectedStorageKey;
    this.forceClientLocale = forceClientLocale;
    this.excludes = excludes.map((exclude) =>
      normalizeGenerateRouteExclude(exclude),
    );

    // bind this for methods...
    (
      [
        // 'extendRouterOptionsRoutes',
        'extendRouterOptions',
        'extendRouter',
      ] as const
    ).forEach((fn) => {
      this[fn] = this[fn].bind(this) as any;
    });
  }

  /**
   * Extract locale names from the path of a given route
   * @param path - path of a route (If not specified, the path of the current route is used)
   * @returns Matching locale name, if any
   */
  getLocaleInPath(path: string): string | undefined {
    const localeMatch = path.match(this.pathMatchRe);
    const extracted = localeMatch && localeMatch[1];
    return extracted && this.isAvailableLocale(extracted)
      ? extracted
      : undefined;
  }

  /**
   * Checks whether a given route should be overtaken by a route extension
   * @param route - Routes to check
   * @returns True if the extension should be unintroduced.
   */
  isExcludeRoute(route: RouteRecordRaw): boolean {
    return this.excludes.some((exclude) => exclude(route));
  }

  /**
   * Duplicate a given route with a given locale name prefix
   * @param route - Route object from which to duplicate
   * @param localeName - locale name
   * @returns Duplicated route object
   */
  duplicateRoute(route: RouteRecordRaw, localeName: string): RouteRecordRaw {
    const routeName =
      typeof route.name === 'symbol'
        ? Symbol('duplicated')
        : `${localeName}-${route.name || ''}`;

    const duplicated: RouteRecordRaw = {
      ...route,
      name: routeName,
      path: joinPath(localeName, route.path),
    };

    const { children } = duplicated;

    if (children) {
      duplicated.children = this.duplicateRoutes(children, localeName);
    }

    return duplicated;
  }

  /**
   * Duplicate a given route object list with a given locale name prefix
   * @param routes - Route object list from which to duplicate
   * @param localeName - locale name
   * @returns Duplicated route list object
   */
  duplicateRoutes(
    routes: readonly RouteRecordRaw[],
    localeName: string,
  ): RouteRecordRaw[] {
    const duplicatedRoutes: RouteRecordRaw[] = [];
    for (const route of routes) {
      if (this.isExcludeRoute(route)) continue;
      duplicatedRoutes.push(this.duplicateRoute(route, localeName));
    }
    return duplicatedRoutes;
  }

  /**
   * Sorts a list of specified route objects
   *
   * @remarks Sort in the following order
   *
   * 1. Route without locale name prefix
   * 2. Order of valid language list
   *
   * @param routes - route objects
   */
  sortRoutes(routes: RouteRecordRaw[] | readonly RouteRecordRaw[]) {
    const results = routes.slice();
    const { pathMatchRe, availableLocales } = this;
    const getLocaleIndex = (path: string) => {
      const localeMatch = path.match(pathMatchRe);
      const locale = localeMatch && localeMatch[1];
      if (!locale) return -1;
      return availableLocales.indexOf(locale);
    };
    results.sort((a, b) => {
      const ai = getLocaleIndex(a.path);
      const bi = getLocaleIndex(b.path);
      if (ai < bi) return -1;
      if (ai > bi) return 1;
      return 0;
    });
    return results;
  }

  /**
   * Generates a list of duplicated routes corresponding to the specified list of route objects
   *
   * * The result of executing this method does not include the root from which it was replicated
   *
   * @param routes - route objects
   * @returns Duplicated route list object
   */
  generateExtendRoutes(routes: readonly RouteRecordRaw[]): RouteRecordRaw[] {
    const generatedRoutes: RouteRecordRaw[] = [];
    for (const localeName of this.availableLocales) {
      if (this.ignoreBaseLocale && localeName === this.baseLocale) continue;
      const duplicatedRoutes = this.duplicateRoutes(routes, localeName);
      generatedRoutes.push(...duplicatedRoutes);
    }
    const sorted = this.sortRoutes(generatedRoutes);
    return sorted;
  }

  // /**
  //  * Extend the optional route of the specified vue-router with a list of locales in this space
  //  * @param routes - route objects
  //  */
  // extendRouterOptionsRoutes(routes: RouteRecordRaw[]) {
  //   if (isExtended(routes)) return;
  //   routes.push(...this.generateExtendRoutes(routes));
  //   this.sortRoutes(routes);
  //   setExtended(routes);
  // }

  /**
   * Extend the optional route of the specified vue-router with a list of locales in this space
   * @param routerOptions - Options to initialize a {@link RouterOptions | Router} instance.
   */
  extendRouterOptions(routerOptions: RouterOptions) {
    if (isExtended(routerOptions)) return;
    routerOptions.routes = [
      ...routerOptions.routes,
      ...this.generateExtendRoutes(routerOptions.routes),
    ];
    routerOptions.routes = this.sortRoutes(routerOptions.routes);
    setExtended(routerOptions);
  }

  /**
   * Extend the router instance with a list of locales in this space
   * @param router - {@link Router} instance.
   */
  extendRouter(router: Router) {
    if (isExtended(router)) return;
    const generatedRoutes = this.generateExtendRoutes(router.options.routes);
    for (const route of generatedRoutes) {
      router.addRoute(route);
    }
    setExtended(router);
  }

  /**
   * Register hook to load i18n space locale at vue-router transition
   */
  registerLocaleLoader(client: VueI18nClient, router: Router) {
    router.beforeResolve((to) => {
      let matchedLocale = this.getLocaleInPath(to.path);
      if (!matchedLocale && this.ignoreBaseLocale) {
        matchedLocale = this.baseLocale;
      }
      if (!matchedLocale || client.space.currentLocaleIs(matchedLocale)) return;
      return client.setSpaceLocale(matchedLocale);
    });
  }

  /**
   * Get the path corresponding to the specified locale
   * @param localeName - locale name
   * @param currentRoutePath - current route path
   *
   * * returns `undefined` if the current locale and the switched locale are the same
   * @returns path after switching
   */
  getSwitchLocalePath(
    localeName: string,
    currentRoutePath: string,
  ): string | undefined {
    const path = currentRoutePath.replace(this.pathMatchRe, '') || '/';
    const nextPath =
      this.ignoreBaseLocale && localeName === this.baseLocale
        ? path
        : `/${localeName}${path}`;

    if (
      this.getLocaleInPath(currentRoutePath) === this.getLocaleInPath(nextPath)
    ) {
      return;
    }
    return nextPath;
  }
}
