import { VueI18nStrategyFactory, defineStrategy } from '../../schemes';
import type { RouteLocationRaw } from 'vue-router';
import { PathPrefixContext, PathPrefixContextSettings } from './context';
import {
  ResolvedLocation,
  PathBaseLocation,
  RelativeTypeLocation,
} from './schemes';
import { LocaleLink } from './components/LocaleLink';

/**
 * Custom interface for Prefix-based strategies for locale names
 */
export interface PathPrefixStrategyCustomInterface {
  /**
   * Generate locations that reflect the locale selected in the space
   * @param location - Location
   */
  location(location: RouteLocationRaw): ResolvedLocation;

  /**
   * Get the path corresponding to the specified locale
   * @param localeName - locale name
   * @param currentRoutePath - current route path
   *
   * * returns `undefined` if the current locale and the switched locale are the same
   * @returns path after switching
   *
   * @see {@link PathPrefixContext.getSwitchLocalePath}
   */
  getSwitchLocation(localeName: string): string | undefined;

  /**
   * RouterLink with automatic application of the locale selected in the space
   * @see {@link LocaleLink}
   */
  LocaleLink: typeof LocaleLink;
}

export type PathPrefixStrategyExtendMode = 'pushOptions' | 'addRoutes';

const DEFAULT_EXTEND_MODE: PathPrefixStrategyExtendMode = 'addRoutes';

export interface PathPrefixStrategySettings extends PathPrefixContextSettings {
  /**
   * @see {@link PathPrefixStrategyExtendMode}
   * @see {@link DEFAULT_EXTEND_MODE}
   */
  extendMode?: PathPrefixStrategyExtendMode;
}

/**
 * Create a Prefix-based strategy for locale names
 *
 * * This strategy detects valid languages in the i18n space and extends the vue-router route
 * * Use this if you want to determine the locale on a URL path basis
 * * Fine-tuning is possible, e.g., skipping path extensions for base locales only.
 * * The operation changes in detail depending on the setting @see {@link PathPrefixStrategySettings}
 *
 * @param settings - Configure PathPrefixStrategy behavior
 * @returns Prefix-based strategy
 */
export function createPathPrefixStrategy(
  settings: PathPrefixStrategySettings = {},
): VueI18nStrategyFactory<PathPrefixStrategyCustomInterface> {
  return defineStrategy((vueI18nContext) => {
    const ctx = new PathPrefixContext(vueI18nContext, settings);
    const { extendMode = DEFAULT_EXTEND_MODE } = settings;

    return {
      initClient: (client) => {
        const router = client.enforceRouter();

        function _setLocale(
          localeName: string,
          redirect?: boolean,
        ): Promise<void> {
          const nextPath = ctx.getSwitchLocalePath(
            localeName,
            router.currentRoute.value.path,
          );
          if (!nextPath) {
            return client.setSpaceLocale(localeName);
          }
          return router[redirect ? 'replace' : ctx.setLocaleBehavire](
            nextPath,
          ).then((navigationFailure) => {
            if (navigationFailure) {
              throw navigationFailure;
            }
          });
        }

        function setLocale(localeName: string): Promise<void> {
          return _setLocale(localeName);
        }

        const getRedirectedLocale = (): string | undefined => {
          return client.getStorageValue(ctx.redirectedStorageKey);
        };

        /**
         * Detect the need for redirects
         *
         * This method detects whether a redirect is necessary and, if so, returns the locale for the redirect as well
         * @remarks Detect redirect destinations under the following conditions
         *
         * ### Conditions under which redirects are not performed
         * * Do not redirect if the locale detected from the path matches the client locale
         * * If the next redirect destination matches the previous redirect destination, cancel the redirect to avoid infinite redirects
         *
         * ### Redirect Destination Detection Condition
         *
         * 1. Redirect to the client locale when client locale enforcement is set and the client locale is detected.
         * 2. If the base locale is not excluded and there is no matching locale in the path, redirect to the client locale or base locale
         * 3. Redirect to the client locale or base locale when the base locale is excluded and there is no matching locale in the path and it has not yet been redirected
         */
        const detectInitialLocale = (): {
          /** initial locale name */
          locale: string;

          /** The locale name, if a redirect should be performed */
          redirectTo?: string;
        } => {
          /** Locale included in the current path */
          const initialPath =
            client.getInitialPath() || router.currentRoute.value.path;
          const matchedLocale = ctx.getLocaleInPath(initialPath);

          /** Locale corresponding to the current path */
          const resolvedMatchedLocale = matchedLocale || ctx.baseLocale;

          /** Client-recognizable locales */
          const clientLocale = client.extractClientLocale();

          /** Last redirected locale */
          const redirectedLocale = getRedirectedLocale();

          /** The locale name, if a redirect should be performed */
          let redirectTo: string | undefined = (() => {
            // Do not redirect if the locale detected from the path matches the client locale
            if (clientLocale === resolvedMatchedLocale) return;

            // Redirect to the client locale when client locale correction is configured and the client locale is detected.
            if (ctx.forceClientLocale && clientLocale) {
              return clientLocale;
            }

            const clientOrBaseLocale = clientLocale || ctx.baseLocale;

            // If the base locale is not excluded and there is no matching locale in the path, redirect to the client locale or base locale
            if (!ctx.ignoreBaseLocale && !matchedLocale) {
              return clientOrBaseLocale;
            }

            // Redirect to the client locale or base locale when the base locale is excluded and there is no matching locale in the path and it has not yet been redirected
            if (ctx.ignoreBaseLocale && !matchedLocale && !redirectedLocale) {
              return clientOrBaseLocale;
            }
          })();

          // If the next redirect destination matches the previous redirect destination, cancel the redirect to avoid infinite redirects
          if (
            redirectTo === redirectedLocale ||
            resolvedMatchedLocale === redirectTo
          ) {
            redirectTo = undefined;
          }

          return {
            locale: resolvedMatchedLocale,
            redirectTo,
          };
        };

        const { locale, redirectTo } = detectInitialLocale();

        ctx.registerLocaleLoader(client, router);

        let redirected = false;
        if (redirectTo && !redirected) {
          const result = { setLocale };
          const nextPath = ctx.getSwitchLocalePath(
            redirectTo,
            router.currentRoute.value.path,
          );
          if (!nextPath) {
            client.setSpaceLocale(locale);
            return result;
          }
          const remover = router.afterEach(() => {
            remover();
            redirected = true;
            client.setStorageValue(ctx.redirectedStorageKey, redirectTo);
            client.redirect(nextPath);
          });
          return result;
        }

        if (locale) {
          client.setSpaceLocale(locale);
        }
        return { setLocale };
      },
      spaceExtends: (client) => {
        const router = client.enforceRouter();

        const resolvePathBaseLocation = (
          location: PathBaseLocation,
        ): ResolvedLocation => {
          let { path } = location;
          if (!path.startsWith('/')) return router.resolve(location);
          const locale = ctx.getLocaleInPath(path);
          if (locale) {
            if (ctx.ignoreBaseLocale) {
              path = path.replace(ctx.pathMatchRe, '');
            }
            return router.resolve({
              ...location,
              path,
            });
          }
          const { currentLocaleName } = client.space;
          const prefix =
            ctx.ignoreBaseLocale && currentLocaleName === ctx.baseLocale
              ? ''
              : `/${currentLocaleName}`;
          return router.resolve({
            ...location,
            path: `${prefix}${path}`,
          });
        };

        const resolveRelativeTypeLocation = (
          location: RelativeTypeLocation,
        ): ResolvedLocation => {
          const { name } = location;
          if (!name) return router.resolve(location);
          const preResolved = router.resolve(location);
          return resolvePathBaseLocation(preResolved);
        };

        const createSpaceLocation = (
          location: RouteLocationRaw,
        ): ResolvedLocation => {
          const loc =
            typeof location === 'string' ? { path: location } : location;
          return 'path' in loc
            ? resolvePathBaseLocation(loc)
            : resolveRelativeTypeLocation(loc);
        };
        return {
          location: createSpaceLocation,
          getSwitchLocation: (localeName) =>
            ctx.getSwitchLocalePath(
              localeName,
              router.currentRoute.value.fullPath,
            ),
          LocaleLink,
        };
      },
      extendRouterOptions:
        extendMode === 'pushOptions' ? ctx.extendRouterOptions : undefined,
      setupRouter: extendMode === 'addRoutes' ? ctx.extendRouter : undefined,
    };
  });
}
