import { createVueI18n } from '@fastkit/vue-i18n';
import { I18nSpaceDefine } from './space';
import { createVotPlugin } from '@fastkit/vot';
import { Common } from './components';

export * from './space';
export * from './components';

export const i18n = createVueI18n(I18nSpaceDefine, {
  defaultLocale: 'en',
  components: {
    common: Common,
  },
});

export const i18nPlugin = createVotPlugin({
  async setup(ctx) {
    const plugin = i18n.setup();
    ctx.app.use(plugin);
    ctx.i18n = plugin.space;
    await plugin.space.init();
  },
});
