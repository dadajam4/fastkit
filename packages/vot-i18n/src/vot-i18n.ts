import { VotPlugin } from '@fastkit/vot';
import {
  I18nSpaceStatic,
  I18nLocaleMeta,
  I18nDependencies,
  VueI18nSpaceOptions,
  VueI18n,
  createVueI18n,
  VueI18nClientSettings,
} from '@fastkit/vue-i18n';
import { pick } from '@fastkit/accept-language';

/**
 * vot plugin for vue-i18n
 */
export interface VotI18n<
  LocaleName extends string,
  BaseLocale extends LocaleName,
  LocaleMeta extends I18nLocaleMeta,
  Components extends I18nDependencies<LocaleName, BaseLocale, LocaleMeta>,
  StrategyCustomInterface extends { [key in keyof any]: any } = {},
> extends VotPlugin,
    Pick<
      VueI18n<
        LocaleName,
        BaseLocale,
        LocaleMeta,
        Components,
        StrategyCustomInterface
      >,
      'defineSubSpace' | 'use'
    > {}

/**
 * Create a vot plugin for vue-i18n
 * @param Space - Internationalization Space Definition
 * @param options - Internationalization space initialization options
 * @returns vot plugin for vue-i18n
 */
export function createVotI18n<
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
  >,
): VotI18n<
  LocaleName,
  BaseLocale,
  LocaleMeta,
  Components,
  StrategyCustomInterface
> {
  let clientSettings: VueI18nClientSettings | undefined;
  const i18n = createVueI18n(Space, {
    ...options,
    client: () => clientSettings,
  });

  const { defineSubSpace, use } = i18n;

  return {
    defineSubSpace,
    use,
    hooks: {
      beforeRouterSetup: i18n.extendRouterOptions,
      afterRouterSetup: i18n.setupRouter,
    },
    async setup(ctx) {
      const { request } = ctx;
      clientSettings = {
        strategyStorage: ctx.cookies,
        initialPath: () => ctx.route.path,
        serverRedirect: ctx.isServer ? ctx.redirect : undefined,
        getClientLanguage: request
          ? (availableLocales) => {
              const picked = pick(
                availableLocales,
                request.headers['accept-language'],
                { loose: true },
              );
              return picked;
            }
          : undefined,
      };

      const plugin = i18n.setup();
      ctx.app.use(plugin);
      (ctx as any).i18n = plugin.space;
      await plugin.space.init();
    },
  };
}
