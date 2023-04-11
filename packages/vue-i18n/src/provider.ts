import {
  I18nSpace,
  I18nSubSpace,
  I18nLocaleMeta,
  I18nSpaceStatic,
  I18nDependencies,
} from '@fastkit/i18n';
import { inject, InjectionKey, App } from 'vue';
import type { Router, RouteLocationNormalized } from 'vue-router';
import {
  arrayRemove,
  flattenRecursiveArray,
  arrayUnique,
} from '@fastkit/helpers';
import { VueI18nError } from './logger';
import {
  extractRouteMatchedItems,
  isComponentCustomOptions,
} from '@fastkit/vue-utils';

/**
 * Subspace Providers
 * @internal
 */
export type AnyProvider = VueI18nSubSpaceProvider<any, any, any, any, any, any>;

/**
 * Subspace provider cache interface
 */
interface ProviderCache {
  /** Subspace Providers */
  provider: AnyProvider;

  /**
   * Subspace for Internationalization Services
   * @see {@link I18nSubSpace}
   */
  subSpace: I18nSubSpace<any, any, any, any, any, any>;

  /**
   * Freeing the cache
   */
  dispose: () => void;
}

/**
 * Providers of internationalization subspaces that can be configured and used for Vue components
 *
 * * This class is normally initialized only from [VueI18n.defineSubSpace()](./vue-i18n.ts).
 */
export class VueI18nSubSpaceProvider<
  LocaleName extends string = string,
  BaseLocale extends LocaleName = LocaleName,
  LocaleMeta extends I18nLocaleMeta = I18nLocaleMeta,
  SpaceComponents extends I18nDependencies<
    LocaleName,
    BaseLocale,
    LocaleMeta
  > = I18nDependencies<LocaleName, BaseLocale, LocaleMeta>,
  SubComponents extends I18nDependencies<
    LocaleName,
    BaseLocale,
    LocaleMeta
  > = I18nDependencies<LocaleName, BaseLocale, LocaleMeta>,
  StrategyCustomInterface extends { [key in keyof any]: any } = {},
> {
  /**
   * Symbol key to inject subspace when `setup()` Vue components
   */
  private readonly injectionKey: InjectionKey<
    I18nSubSpace<
      LocaleName,
      BaseLocale,
      LocaleMeta,
      SpaceComponents,
      SubComponents,
      StrategyCustomInterface
    >
  > = Symbol();

  /**
   * Mapping of component definitions in subspace
   */
  readonly Components: SubComponents;

  /**
   * Definition of the internationalization space to which this subspace belongs
   */
  readonly Space: I18nSpaceStatic<LocaleName, BaseLocale, LocaleMeta>;

  constructor(
    Space: I18nSpaceStatic<LocaleName, BaseLocale, LocaleMeta>,
    Components: SubComponents,
  ) {
    this.Space = Space;
    this.Components = Components;
  }

  /**
   * Obtain an instance of the internationalization subspace
   * @returns Subspace for Internationalization Services
   */
  use(): I18nSubSpace<
    LocaleName,
    BaseLocale,
    LocaleMeta,
    SpaceComponents,
    SubComponents,
    StrategyCustomInterface
  > {
    const subSpace = inject(this.injectionKey);
    if (!subSpace) {
      throw new VueI18nError('missing provided i18n sub space.');
    }
    return subSpace;
  }

  /**
   * Register a guard to initialize the internationalization space when initializing the router or changing route.
   *
   * @internal
   * @param router - Router instance
   * @param space - Internationalization Service Space
   * @param app - Vue app
   * @returns Function to release a registered router guard
   */
  static registerRouterGuard(
    router: Router,
    space: I18nSpace<any, any, any, any>,
    app: App,
  ): () => void {
    /** Provider Cache */
    const caches: ProviderCache[] = [];

    /**
     * Apply list of matched providers and update cache when initializing or changing router
     * @param matchedProviders - List of matched providers
     */
    const applyMatchedProviders = (matchedProviders: AnyProvider[]) => {
      // First, release provider caches that are no longer needed.
      for (const cache of caches) {
        if (!matchedProviders.includes(cache.provider)) {
          cache.dispose();
        }
      }

      // Initialize and cache matched providers that have not yet been cached
      for (const provider of matchedProviders) {
        if (!caches.find((cache) => cache.provider === provider)) {
          // Initialize subspace
          const subSpace = space.createSubSpace(provider.Components);

          // Cache it.
          const cache: ProviderCache = {
            provider,
            subSpace,
            dispose: () => {
              subSpace.dispose();
              arrayRemove(caches, cache);

              // There is no API available to revoke provide(), so delete the cache of the app instance.
              // @see https://github.com/vuejs/core/blob/4c3203b9b7b362fe61150ad05e231e2a35e11356/packages/runtime-core/src/apiInject.ts#L26
              delete app._context.provides[provider.injectionKey as any];
            },
          };
          caches.push(cache);

          // Provide to be available in Vue's `setup()`.
          app.provide(provider.injectionKey, subSpace);
        }
      }
    };

    // Register a Guard
    const disposer = router.beforeResolve(async (to) => {
      const matchedProviders = extractVueI18nComponentOptions(to);
      applyMatchedProviders(matchedProviders);

      // The provider cache list is then updated with only what is needed, so initialize the internationalization space and load the required locales
      await space.init();
    });
    return disposer;
  }
}

export interface VueI18nInjectedComponent {
  i18n?: VueI18nComponentOption;
}

export type VueI18nComponentOption =
  | AnyProvider
  | VueI18nInjectedComponent
  | VueI18nComponentOption[];

declare module '@vue/runtime-core' {
  export interface ComponentCustomOptions {
    /**
     * Provider of the subspace to be initialized when this root component is activated.
     *
     * @example
     *
     * ```
     * import { createVueI18n } from '@fastkit/vue-i18n';
     *
     * const i18n = createVueI18n(SomeSpace, {
     *   components: {
     *     SomeComponent,
     *   },
     * });
     *
     * const SubSpace = i18n.defineSubSpace({ SubComponent });
     *
     * export default defineComponent({
     *   i18n: SubSpace,
     *   setup(props, ctx) {
     *     const subSpace = SubSpace.use();
     *     console.log(subSpace.at.SubComponent.trans.someValue);
     *   },
     * });
     * ```
     */
    i18n?: VueI18nComponentOption;
  }
}

function flattenVueI18nComponentOption(
  option: VueI18nComponentOption,
): AnyProvider[] {
  const results: AnyProvider[] = [];
  flattenRecursiveArray(option).forEach((value) => {
    if (value instanceof VueI18nSubSpaceProvider) return results.push(value);
    const { i18n } = value;
    if (i18n) results.push(...flattenVueI18nComponentOption(i18n));
  });
  return arrayUnique(results);
}

/**
 * Get the provider of the subspace set in the vue component
 * @param route - Normalized route object
 * @returns Provider of the subspace
 */
export function extractVueI18nComponentOptions(
  route: RouteLocationNormalized,
): AnyProvider[] {
  const results: AnyProvider[] = [];
  const items = extractRouteMatchedItems(route);
  items.forEach((item) => {
    const { Component } = item;
    if (!isComponentCustomOptions(Component)) return;
    const { i18n } = Component;
    if (i18n) {
      results.push(...flattenVueI18nComponentOption(i18n));
    }
  });
  return arrayUnique(results);
}
