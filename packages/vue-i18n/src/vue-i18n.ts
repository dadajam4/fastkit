import { App } from 'vue';
import { onAppUnmount } from '@fastkit/vue-utils';
import type { Router, RouterOptions } from 'vue-router';
import {
  I18nSpace,
  I18nSpaceStatic,
  I18nLocaleMeta,
  I18nDependencies,
  I18nSpaceOptions,
} from '@fastkit/i18n';
import { VueI18nSubSpaceProvider } from './provider';
import { createVueI18nObjectStorage } from './helpers';
import { VUE_I18N_INJECTION_KEY, useI18nSpace } from './injections';
import { VueI18nContext } from './context';
import { RawVueI18nStrategyFactory, defineStrategy } from './strategies';
import { VueI18nClient, VueI18nClientSettings } from './client';
import { AnySpaceStatic } from './schemes';

/**
 * Service interface to provide internationalization capabilities throughout Vue applications
 */
export interface VueI18n<
  LocaleName extends string = string,
  BaseLocale extends LocaleName = LocaleName,
  LocaleMeta extends I18nLocaleMeta = I18nLocaleMeta,
  Components extends I18nDependencies<LocaleName, BaseLocale, LocaleMeta> = any,
  StrategyCustomInterface extends { [key in keyof any]: any } = {},
> {
  /**
   * Internationalization Space Definition
   *
   * @see {@link I18nSpaceStatic}
   */
  readonly Space: I18nSpaceStatic<LocaleName, BaseLocale, LocaleMeta>;

  /**
   * Generate instantiated internationalization spaces and methods to plug them into Vue app instances
   */
  readonly setup: () => {
    /**
     * Internationalization Service Space
     *
     * @see {@link I18nSpace}
     */
    space: I18nSpace<
      LocaleName,
      BaseLocale,
      LocaleMeta,
      Components,
      StrategyCustomInterface
    >;
    install: (app: App) => any;
  };

  /**
   * Methods to initialize the vue-router instance if necessary
   *
   * * Calling this method is only necessary if the configured strategy requires route initialization
   * * This initialization process should be performed only once during the initialization of the vue application
   */
  setupRouter: (router: Router) => void;

  /**
   * If vue-router options need to be set up, the process
   *
   * * Calling this method is only necessary if the configured strategy requires route initialization
   * * This initialization process should be performed only once during the initialization of the vue application
   */
  extendRouterOptions: (routerOptions: RouterOptions) => void;

  /**
   * Obtaining Provided Internationalization Space
   */
  use: () => I18nSpace<
    LocaleName,
    BaseLocale,
    LocaleMeta,
    Components,
    StrategyCustomInterface
  >;

  /**
   * Generate providers of internationalization subspaces that can be configured and used for Vue components.
   *
   * @see {@link VueI18nSubSpaceProvider}
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
   * @param Components - Mapping of component definitions used in this subspace
   */
  defineSubSpace<
    SubComponents extends I18nDependencies<LocaleName, BaseLocale, LocaleMeta>,
  >(
    Components: SubComponents,
  ): VueI18nSubSpaceProvider<
    LocaleName,
    BaseLocale,
    LocaleMeta,
    Components,
    SubComponents,
    StrategyCustomInterface
  >;
}

/**
 * Internationalization space initialization options
 */
export interface VueI18nSpaceOptions<
  LocaleName extends string = string,
  BaseLocale extends LocaleName = LocaleName,
  LocaleMeta extends I18nLocaleMeta = I18nLocaleMeta,
  Components extends I18nDependencies<
    LocaleName,
    BaseLocale,
    LocaleMeta
  > = I18nDependencies<LocaleName, BaseLocale, LocaleMeta>,
  StrategyCustomInterface extends { [key in keyof any]: any } = {},
> extends I18nSpaceOptions<LocaleName, BaseLocale, LocaleMeta, Components> {
  /**
   * Strategy object or its factory
   */
  strategy?: RawVueI18nStrategyFactory<StrategyCustomInterface>;

  /**
   * Client configuration for vue-i18n
   *
   * @see {@link VueI18nClientSettings}
   */
  client?: VueI18nClientSettings | (() => VueI18nClientSettings | void);
}

/**
 * Generate service interfaces to provide internationalization capabilities throughout the Vue application
 *
 * The vue-i18n library registers a component field `$i18n` to refer to a space instance in the properties of a Vue component during initialization.
 *
 * If you want to enable TypeScript type hints, please extend Vue's type as follows
 *
 * @example
 * ```
 * declare module '@vue/runtime-core' {
 *   export interface ComponentCustomProperties {
 *     $i18n: I18nSpace<YourAppLocaleName, YourAppBaseLocale, YourAppLocaleMeta, YourAppGlobalComponents>;
 *   }
 * }
 * ```
 *
 * @see {@link I18nSpaceStatic}
 * @param Space - Internationalization Space Definition
 * @param options - Internationalization space initialization options
 */
export function createVueI18n<
  LocaleName extends string,
  BaseLocale extends LocaleName,
  LocaleMeta extends I18nLocaleMeta,
  Components extends I18nDependencies<LocaleName, BaseLocale, LocaleMeta>,
  StrategyCustomInterface extends { [key in keyof any]: any } = {},
>(
  Space: I18nSpaceStatic<LocaleName, BaseLocale, LocaleMeta>,
  options: VueI18nSpaceOptions<
    LocaleName,
    BaseLocale,
    LocaleMeta,
    Components,
    StrategyCustomInterface
  > = {},
): VueI18n<
  LocaleName,
  BaseLocale,
  LocaleMeta,
  Components,
  StrategyCustomInterface
> {
  const strategyFactory = options.strategy && defineStrategy(options.strategy);
  const ctx = new VueI18nContext(Space as unknown as AnySpaceStatic);
  const strategy = strategyFactory && strategyFactory(ctx);
  const setupRouter = strategy && strategy.setupRouter;
  const extendRouterOptions = strategy && strategy.extendRouterOptions;

  /**
   * Generate instantiated internationalization spaces and methods to plug them into Vue app instances
   * @see {@link VueI18n.setup}
   */
  const setup = () => {
    const _options: I18nSpaceOptions<
      LocaleName,
      BaseLocale,
      LocaleMeta,
      Components
    > = { ...options };

    // If storage is not specified, reactive storage is used
    _options.storage = _options.storage || createVueI18nObjectStorage;

    // Initialize space
    const space = Space.create(_options);
    const { client: rawClientSettings } = options;

    const install = (app: App) => {
      // Provide space to the entire vue application
      app.provide(VUE_I18N_INJECTION_KEY, space);

      // Set space as a built-in property of a vue component
      app.config.globalProperties.$i18n = space;

      const clientSettings =
        typeof rawClientSettings === 'function'
          ? rawClientSettings()
          : rawClientSettings;

      const client = new VueI18nClient(
        ctx,
        app,
        space as any,
        clientSettings || {},
      );

      // If a strategy is set, initialize it
      if (strategy) {
        client.initStrategy(strategy);
      }

      onAppUnmount(app, () => {
        delete app.config.globalProperties.$i18n;
      });
    };

    return {
      space,
      install,
    };
  };

  const defineSubSpace = <
    SubComponents extends I18nDependencies<LocaleName, BaseLocale, LocaleMeta>,
  >(
    SubComponents: SubComponents,
  ) => {
    return new VueI18nSubSpaceProvider<
      LocaleName,
      BaseLocale,
      LocaleMeta,
      Components,
      SubComponents,
      StrategyCustomInterface
    >(Space, SubComponents);
  };

  return {
    Space,
    setup: setup as any,
    use: useI18nSpace as any,
    defineSubSpace,
    setupRouter: (router) => setupRouter && setupRouter(router),
    extendRouterOptions: (routerOptions) =>
      extendRouterOptions && extendRouterOptions(routerOptions),
  };
}
