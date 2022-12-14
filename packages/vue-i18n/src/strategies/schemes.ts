import type { VueI18nContext } from '../context';
import type { VueI18nClient } from '../client';
import type { Router, RouterOptions } from 'vue-router';

/**
 * Strategy initialization results
 */
export interface VueI18nStrategyInitResult {
  /**
   * locale name
   *
   * * If this locale name is set, it will be set as the client's initial locale
   */
  locale?: string;

  /**
   * Strategy-specific locale setting functions
   *
   * * vue-18n initialization replaces the `setLocale` method in the i18n space with this method
   *
   * @param localeName - locale name
   */
  setLocale(localeName: string): Promise<void>;
}

/**
 * Strategies for working with i18n spaces in vue applications
 */
export interface VueI18nStrategy<StrategyCustomInterface = void> {
  /**
   * Strategy-specific initialization process
   *
   * @remarks We expect this method to do the following
   *
   * - Perform individual strategy setups. (Routing extensions, etc.)
   */
  initClient(client: VueI18nClient): VueI18nStrategyInitResult;

  /**
   * Custom interface to expand i18n space
   *
   * * Set this option if you want to provide your strategy's own service methods, etc. in the i18n space.
   * * It can be referenced by a property named `strategy` in the i18n space
   */
  spaceExtends?: (client: VueI18nClient) => StrategyCustomInterface;

  /**
   * Methods to initialize the vue-router instance if necessary
   *
   * * This initialization process is executed only once during the initialization of the vue application
   * * In particular, if you need to initialize every client request on the server side, do so in `initClient`.
   */
  setupRouter?: (router: Router) => any;

  /**
   * If vue-router options need to be set up, the process
   */
  extendRouterOptions?: (routerOptions: RouterOptions) => any;
}

/**
 * Factories that generate strategies
 *
 * @param ctx - Context object to control & support strategy behavior
 */
export type VueI18nStrategyFactory<StrategyCustomInterface = void> = (
  ctx: VueI18nContext,
) => VueI18nStrategy<StrategyCustomInterface>;

/**
 * Strategy object or its factory
 */
export type RawVueI18nStrategyFactory<StrategyCustomInterface = void> =
  | VueI18nStrategy<StrategyCustomInterface>
  | VueI18nStrategyFactory<StrategyCustomInterface>;

/**
 * Define Strategies
 *
 * @param strategyOrFactory - Strategy object or its factory
 * @returns Factories that generate strategies
 */
export function defineStrategy<StrategyCustomInterface = void>(
  strategyOrFactory: RawVueI18nStrategyFactory<StrategyCustomInterface>,
): VueI18nStrategyFactory<StrategyCustomInterface> {
  return typeof strategyOrFactory === 'function'
    ? strategyOrFactory
    : () => strategyOrFactory;
}
