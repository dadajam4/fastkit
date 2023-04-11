import { defineI18nSpace } from '@fastkit/vue-i18n';

export const I18nSpaceDefine = defineI18nSpace({
  locales: [
    {
      name: 'en',
      meta: {
        displayName: 'English',
      },
    },
    {
      name: 'ja',
      meta: {
        displayName: '日本語',
      },
    },
  ],
  baseLocale: 'en',
});

export type I18nSpace = ReturnType<(typeof I18nSpaceDefine)['create']>;
