import type { I18nSpace, I18nSpaceStatic } from '@fastkit/i18n';
import type { VueI18nContext } from '../context';
import type { VueI18nClient } from '../client';
import type { Router, RouterOptions } from 'vue-router';

/** Internationalization Space Definition */
export type AnySpaceStatic = I18nSpaceStatic<string, string, any>;

/** i18n space instance */
export type AnySpace = I18nSpace<string, string, any, any>;

export interface VueI18nStrategyInitResult {
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
   * - もし必要な場合、ルーターのセットアップ処理
   */
  initClient(client: VueI18nClient): VueI18nStrategyInitResult;

  /**
   * Custom interface to expand i18n space
   *
   * * Set this option if you want to provide your strategy's own service methods, etc. in the i18n space.
   * * It can be referenced by a property named `strategy` in the i18n space
   */
  spaceExtends?: (client: VueI18nClient) => StrategyCustomInterface;

  setupRouter?: (router: Router) => any;

  extendRouterOptions?: (routerOptions: RouterOptions) => any;
}

export type VueI18nStrategyFactory<StrategyCustomInterface = void> = (
  ctx: VueI18nContext,
) => VueI18nStrategy<StrategyCustomInterface>;

export type RawVueI18nStrategyFactory<StrategyCustomInterface = void> =
  | VueI18nStrategy<StrategyCustomInterface>
  | VueI18nStrategyFactory<StrategyCustomInterface>;

export function defineStrategy<StrategyCustomInterface = void>(
  strategyOrFactory: RawVueI18nStrategyFactory<StrategyCustomInterface>,
): VueI18nStrategyFactory<StrategyCustomInterface> {
  return typeof strategyOrFactory === 'function'
    ? strategyOrFactory
    : () => strategyOrFactory;
}
