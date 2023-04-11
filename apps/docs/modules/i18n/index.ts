import { createVotI18n, createPathPrefixStrategy } from '@fastkit/vot-i18n';
import { I18nSpaceDefine } from './space';
import { Common } from './components';

export * from './space';
export * from './components';

export const i18n = createVotI18n(I18nSpaceDefine, {
  defaultLocale: 'en',
  components: {
    common: Common,
  },
  strategy: createPathPrefixStrategy({
    ignoreBaseLocale: true,
  }),
});
