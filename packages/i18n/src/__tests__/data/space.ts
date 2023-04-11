import { defineI18nSpace } from '../../space';

export const TestI18nSpace = defineI18nSpace({
  locales: [
    // 基礎ロケール。同期読み込みする。
    {
      name: 'ja',
      meta: {
        displayName: '日本語',
      },
    },
    // 厳格ロケール。「简体中文」からのフォールバックに使用する。
    {
      name: 'en',
      meta: {
        displayName: 'English',
      },
    },
    // サブロケール。英語にフォールバックする。
    {
      name: 'zh-cn',
      meta: {
        displayName: '简体中文',
      },
      formatLocales: 'zh-Hans-CN',
    },
    // サブロケール。全ての値が基礎ロケールの日本語にフォールバックする。
    {
      name: 'zh-tw',
      meta: {
        displayName: '繁體中文',
      },
      formatLocales: 'zh-Hant-CN',
    },
  ],
  baseLocale: 'ja',
  defaultLocale: 'ja',
  fallbackLocale: {
    'zh-cn': 'en',
  },
});
