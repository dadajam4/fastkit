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
 * Custom interface for root strategies
 */
export interface PathPrefixStrategyCustomInterface {
  /**
   * Generate locations that reflect the locale selected in the space
   * @param location - Location
   */
  location(location: RouteLocationRaw): ResolvedLocation;

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
 * Create a strategy launcher to extend vue-router routes
 *
 * * This strategy detects valid languages in the i18n space and extends the vue-router route
 * * Use this if you want to determine the locale on a URL path basis
 * * Fine-tuning is possible, e.g., skipping path extensions for base locales only.
 * * The operation changes in detail depending on the setting @see {@link PathPrefixStrategySettings}
 *
 * @param settings - Configure PathPrefixStrategy behavior
 * @returns Route Extension Strategy Launcher
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
         * ### リダイレクトを行わない条件
         * * パスから検出したロケールとクライアントロケールとが一致している場合はリダイレクトしない
         * * 次回リダイレクト先が前回リダイレクト先と一致している場合、無限リダイレクトを避けるためにリダイレクトをキャンセルする
         *
         * ### リダイレクト先検出条件
         *
         * 1. クライアントロケール矯正設定がされていて、クライアントロケールが検出されている時はクライアントロケールへリダイレクトする
         * 2. 基礎ロケールを除外していなくて、パスにマッチするロケールがない時は、クライアントロケールかベースロケールへリダイレクトする
         * 3. 基礎ロケールを除外していて、パスにマッチするロケールがなくて、まだリダイレクトしていない時は、クライアントロケールかベースロケールへリダイレクトする
         */
        const detectInitialLocale = (): {
          /** 初期ロケール名 */
          locale: string;

          /** リダイレクトを行うべき場合、そのロケール名 */
          redirectTo?: string;
        } => {
          /** 現在のパスに含まれているロケール */
          const initialPath =
            client.getInitialPath() || router.currentRoute.value.path;
          const matchedLocale = ctx.getLocaleInPath(initialPath);

          /** 現在のパスに対応するロケール */
          const resolvedMatchedLocale = matchedLocale || ctx.baseLocale;

          /** クライアントが認識できるロケール */
          const clientLocale = client.extractClientLocale();

          /** 前回リダイレクトしたロケール */
          const redirectedLocale = getRedirectedLocale();

          /** リダイレクトしたいロケール名 */
          let redirectTo: string | undefined = (() => {
            // パスから検出したロケールとクライアントロケールとが一致している場合はリダイレクトしない
            if (clientLocale === resolvedMatchedLocale) return;

            // クライアントロケール矯正設定がされていて、クライアントロケールが検出されている時はクライアントロケールへリダイレクトする
            if (ctx.forceClientLocale && clientLocale) {
              return clientLocale;
            }

            const clientOrBaseLocale = clientLocale || ctx.baseLocale;

            // 基礎ロケールを除外していなくて、パスにマッチするロケールがない時は、クライアントロケールかベースロケールへリダイレクトする
            if (!ctx.ignoreBaseLocale && !matchedLocale) {
              return clientOrBaseLocale;
            }

            // 基礎ロケールを除外していて、パスにマッチするロケールがなくて、まだリダイレクトしていない時は、クライアントロケールかベースロケールへリダイレクトする
            if (ctx.ignoreBaseLocale && !matchedLocale && !redirectedLocale) {
              return clientOrBaseLocale;
            }
          })();

          // 次回リダイレクト先が前回リダイレクト先と一致している場合、無限リダイレクトを避けるためにリダイレクトをキャンセルする
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
          LocaleLink,
        };
      },
      extendRouterOptions:
        extendMode === 'pushOptions' ? ctx.extendRouterOptions : undefined,
      setupRouter: extendMode === 'addRoutes' ? ctx.extendRouter : undefined,
    };
  });
}
