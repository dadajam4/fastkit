import { App, inject } from 'vue';
import { onAppUnmount } from '@fastkit/vue-utils';
import {
  I18nSpaceStatic,
  I18nLocaleMeta,
  I18nDependencies,
  I18nSpaceOptions,
  I18nSpace,
} from '@fastkit/i18n';
import { createVueI18nObjectStorage } from './helpers';
import { VUE_I18N_INJECTION_KEY } from './injections';
import type { Router } from 'vue-router';
import { VueI18nSubSpaceProvider } from './provider';
import { VueI18nError } from './logger';

/**
 * Obtaining Provided Internationalization Space
 * @returns
 */
const use = () => {
  const space = inject(VUE_I18N_INJECTION_KEY);
  if (!space) {
    throw new VueI18nError('missing provided i18n space');
  }
  return space;
};

/**
 * Service interface to provide internationalization capabilities throughout Vue applications
 */
export interface VueI18n<
  LocaleName extends string,
  BaseLocale extends LocaleName,
  LocaleMeta extends I18nLocaleMeta,
  Components extends I18nDependencies<LocaleName, BaseLocale, LocaleMeta>,
> {
  /**
   * Generate instantiated internationalization spaces and methods to plug them into Vue app instances
   */
  setup: () => {
    space: I18nSpace<LocaleName, BaseLocale, LocaleMeta, Components>;
    install: (app: App) => any;
  };

  /**
   * Obtaining Provided Internationalization Space
   */
  use: () => I18nSpace<LocaleName, BaseLocale, LocaleMeta, Components>;

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
    SubComponents
  >;
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
>(
  Space: I18nSpaceStatic<LocaleName, BaseLocale, LocaleMeta>,
  options?: I18nSpaceOptions<LocaleName, BaseLocale, LocaleMeta, Components>,
): VueI18n<LocaleName, BaseLocale, LocaleMeta, Components> {
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

    const install = (app: App) => {
      app.provide(VUE_I18N_INJECTION_KEY, space);
      app.config.globalProperties.$i18n = space;

      const router: Router | undefined = app.config.globalProperties.$router;

      // Register guard if Vue Router is already installed
      if (router) {
        VueI18nSubSpaceProvider.registerRouterGuard(router, space, app);
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
      SubComponents
    >(Space, SubComponents);
  };

  return {
    setup,
    use,
    defineSubSpace,
  };
}
