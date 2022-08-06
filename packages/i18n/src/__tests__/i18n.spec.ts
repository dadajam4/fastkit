/* eslint-disable @typescript-eslint/no-empty-function */
import 'jest';
import { defineLocale, I18n, I18nLocaleSettings } from '../';
import { jaScheme } from './ja.scheme';
import { enScheme } from './en.scheme';
import { zhcnScheme } from './zh-cn.scheme';
import { delay } from '@fastkit/helpers';

function createJA<
  T extends Partial<
    Omit<I18nLocaleSettings<any, any, any>, 'name' | 'meta' | 'scheme'>
  > | void = void,
>(opts?: T) {
  return defineLocale({
    name: 'ja',
    meta: {
      name: '日本語',
    },
    scheme: jaScheme(),
    ...opts,
  });
}

function createEN<
  T extends Partial<
    Omit<I18nLocaleSettings<any, any, any>, 'name' | 'meta' | 'scheme'>
  > | void = void,
>(base: ReturnType<typeof createJA>, opts?: T) {
  return base.createStrictSubLocale({
    name: 'en',
    meta: {
      name: 'English',
    },
    scheme: enScheme(base),
    ...opts,
  });
}

function createZHCN<
  T extends Partial<
    Omit<I18nLocaleSettings<any, any, any>, 'name' | 'meta' | 'scheme'>
  > | void = void,
>(base: ReturnType<typeof createJA>, opts?: T) {
  return base.createSubLocale({
    name: 'zh-cn',
    formatLocales: 'zh-CN',
    meta: {
      name: '简体中文',
    },
    scheme: zhcnScheme(base),
    ...opts,
  });
}

function createSimpleInstance() {
  const ja = createJA();
  const en = createEN(ja);
  const zhcn = createZHCN(ja, {
    fallbackLocale: 'en',
  });

  const i18n = new I18n({
    locales: [ja, en, zhcn],
  });

  return { i18n, ja, en, zhcn };
}

function createAsyncJA<
  T extends Partial<
    Omit<I18nLocaleSettings<any, any, any>, 'name' | 'meta' | 'scheme'>
  > | void = void,
>(opts?: T) {
  return defineLocale({
    name: 'ja',
    meta: {
      name: '日本語',
    },
    scheme: async () => {
      await delay(100);
      return jaScheme();
    },
    ...opts,
  });
}

function createAsyncEN<
  T extends Partial<
    Omit<I18nLocaleSettings<any, any, any>, 'name' | 'meta' | 'scheme'>
  > | void = void,
>(base: ReturnType<typeof createJA>, opts?: T) {
  return base.createStrictSubLocale({
    name: 'en',
    meta: {
      name: 'English',
    },
    scheme: async () => {
      await delay(200);
      return enScheme(base);
    },
    ...opts,
  });
}

function createAsyncZHCN<
  T extends Partial<
    Omit<I18nLocaleSettings<any, any, any>, 'name' | 'meta' | 'scheme'>
  > | void = void,
>(base: ReturnType<typeof createJA>, opts?: T) {
  return base.createSubLocale({
    name: 'zh-cn',
    formatLocales: 'zh-CN',
    meta: {
      name: '简体中文',
    },
    scheme: async () => {
      await delay(200);
      return zhcnScheme(base);
    },
    ...opts,
  });
}

function createAsyncInstance() {
  const ja = createAsyncJA();
  const en = createAsyncEN(ja);
  const zhcn = createAsyncZHCN(ja, {
    fallbackLocale: 'en',
  });

  const i18n = new I18n({
    locales: [ja, en, zhcn],
  });

  return { i18n, ja, en, zhcn };
}

describe('i18n', () => {
  describe('Configure locale settings and initialize i18n instance', () => {
    it('Immediately after locale creation, the link() method raises an exception.', () => {
      const ja = createJA();
      expect(() => ja.link()).toThrow(
        /^\[i18n\] There is no linked I18n service/,
      );
    });

    it('The state of the instance must be generated based on the settings at the time of instantiation.', () => {
      const { i18n, ja } = createSimpleInstance();
      const linked = ja.link();

      expect(linked).toBe(i18n);
      expect(linked).toBeInstanceOf(I18n);
      expect(i18n.availableLocales).toStrictEqual(['ja', 'en', 'zh-cn']);
      expect(i18n.baseLocale).toBe('ja');
      expect(i18n.defaultLocale).toBe('ja');
      expect(i18n.dependenciesMap).toStrictEqual({
        ja: ['ja'],
        en: ['en', 'ja'],
        'zh-cn': ['zh-cn', 'en', 'ja'],
      });
      expect(i18n.meta('ja')).toStrictEqual({
        name: '日本語',
      });
      expect(i18n.meta('en')).toStrictEqual({
        name: 'English',
      });
      expect(i18n.meta('zh-cn')).toStrictEqual({
        name: '简体中文',
      });
    });
  });

  describe('Get the value set in the locale configuration', () => {
    it('Must be able to obtain values for the base locale', () => {
      const { i18n } = createSimpleInstance();
      i18n.setLocale('ja');

      expect(i18n.currentMeta).toStrictEqual({
        name: '日本語',
      });
      expect(i18n.t.num).toBe(1);
      expect(i18n.t.str).toBe('str');
      expect(i18n.t.bool).toBe(false);
      expect(i18n.t.null).toBeNull();
      expect(i18n.t.fn('xxx')).toBe('hello xxx');
      expect(i18n.t.nested.num).toBe(0);
      expect(i18n.t.nested.str).toBe('nested str');
      expect(i18n.t.nested.bool).toBe(true);
      expect(i18n.t.nested.fn(true)).toBe('hello true');
    });

    it('A value corresponding to the set locale can be retrieved.', () => {
      const { i18n } = createSimpleInstance();
      i18n.setLocale('en');

      expect(i18n.currentMeta).toStrictEqual({
        name: 'English',
      });
      expect(i18n.t.num).toBe(0);
      expect(i18n.t.str).toBe('en str');
      expect(i18n.t.bool).toBe(true);
      expect(i18n.t.null).toBe(5);
      expect(i18n.t.fn('xxx')).toBe('hello en xxx');
      expect(i18n.t.nested.num).toBe(1);
      expect(i18n.t.nested.str).toBe('en nested str');
      expect(i18n.t.nested.bool).toBe(false);
      expect(i18n.t.nested.fn(true)).toBe('(en)hello true');
    });
  });

  describe('Format the date and time.', () => {
    it('If a value is not found, the fallback locale, and then the base locale, in that order, can be used to retrieve the value.', () => {
      const { i18n } = createSimpleInstance();
      i18n.setLocale('zh-cn');

      expect(i18n.t.num).toBe(0);
      expect(i18n.t.str).toBe('简体中文 str');
      expect(i18n.t.bool).toBe(true);
      expect(i18n.t.null).toBe(5);
      expect(i18n.t.fn('xxx')).toBe('hello en xxx');
      expect(i18n.t.nested.num).toBe(1);
      expect(i18n.t.nested.str).toBe('nested zh-cn str');
      expect(i18n.t.nested.bool).toBe(false);
      expect(i18n.t.nested.fn(true)).toBe('nested zh-cn str');
    });

    it('Must be able to format date and time', () => {
      const { i18n } = createSimpleInstance();

      i18n.setLocale('ja');
      expect(i18n.d(0, 'long')).toBe('1970年1月1日');
      expect(i18n.d(new Date(0), 'year')).toBe('70年');
      expect(i18n.d(0)).toBe('1970/1/1');
      expect(i18n.d('1970-01-01T00:00:00.000Z')).toBe('1970/1/1');
      expect(i18n.d(new Date(0), 'year', { month: '2-digit' })).toBe('70/01');

      i18n.setLocale('en');
      expect(i18n.d(0, 'long')).toBe('January 1, 1970');
      expect(i18n.d(new Date(0), 'year')).toBe('1970');
      expect(i18n.d(0)).toBe('1/1/1970');
      expect(i18n.d('1970-01-01T00:00:00.000Z')).toBe('1/1/1970');
      expect(i18n.d(new Date(0), 'year', { month: '2-digit' })).toBe('01/1970');
      expect(i18n.d(0, 'long', 'ja')).toBe('1970年1月1日');

      i18n.setLocale('zh-cn');
      expect(i18n.d(0, 'long')).toBe('1970年1月1日');
      expect(i18n.d(new Date(0), 'year')).toBe('1970年');
      expect(i18n.d(0)).toBe('1970/1/1');
      expect(i18n.d('1970-01-01T00:00:00.000Z')).toBe('1970/1/1');
      expect(i18n.d(new Date(0), 'year', { month: '2-digit' })).toBe(
        '1970年1月',
      );
      expect(i18n.d(0, 'long', 'en-US')).toBe('January 1, 1970');
    });

    it('Date/time format parts can be retrieved.', () => {
      const { i18n } = createSimpleInstance();

      i18n.setLocale('ja');
      expect(i18n.datetimeParts(0, 'long')).toStrictEqual([
        { type: 'year', value: '1970' },
        { type: 'literal', value: '年' },
        { type: 'month', value: '1' },
        { type: 'literal', value: '月' },
        { type: 'day', value: '1' },
        { type: 'literal', value: '日' },
      ]);

      i18n.setLocale('en');
      expect(i18n.datetimeParts(0, 'long')).toStrictEqual([
        { type: 'month', value: 'January' },
        { type: 'literal', value: ' ' },
        { type: 'day', value: '1' },
        { type: 'literal', value: ', ' },
        { type: 'year', value: '1970' },
      ]);
    });
  });

  describe('Formatting numerical values.', () => {
    it('Must be able to format number', () => {
      const { i18n } = createSimpleInstance();

      i18n.setLocale('ja');
      expect(i18n.n(12345, 'jpyCurrency')).toBe('￥12,345');
      expect(i18n.n(123456789.6789, 'maxSig')).toBe('123,000,000');
      expect(i18n.n(12345, 'jpyCurrency', { currency: 'EUR' })).toBe(
        '€12,345.00',
      );

      i18n.setLocale('en');
      expect(i18n.n(12345, 'jpyCurrency')).toBe('¥12,345');
      expect(i18n.n(123456789.6789, 'maxSig')).toBe('123,000,000');
      expect(i18n.n(12345, 'jpyCurrency', { currency: 'EUR' })).toBe(
        '€12,345.00',
      );

      i18n.setLocale('zh-cn');
      expect(i18n.n(12345, 'jpyCurrency')).toBe('JP¥12,345');
      expect(i18n.n(123456789.6789, 'maxSig')).toBe('120,000,000');
      expect(i18n.n(12345, 'jpyCurrency', { currency: 'EUR' })).toBe(
        '€12,345.00',
      );
    });

    it('Number format parts can be retrieved.', () => {
      const { i18n } = createSimpleInstance();

      i18n.setLocale('zh-cn');
      expect(i18n.numberParts(12345, 'jpyCurrency')).toStrictEqual([
        { type: 'currency', value: 'JP¥' },
        { type: 'integer', value: '12' },
        { type: 'group', value: ',' },
        { type: 'integer', value: '345' },
      ]);
      expect(i18n.numberParts(123456789.6789, 'maxSig')).toStrictEqual([
        { type: 'integer', value: '120' },
        { type: 'group', value: ',' },
        { type: 'integer', value: '000' },
        { type: 'group', value: ',' },
        { type: 'integer', value: '000' },
      ]);
      expect(
        i18n.numberParts(12345, 'jpyCurrency', { currency: 'EUR' }),
      ).toStrictEqual([
        { type: 'currency', value: '€' },
        { type: 'integer', value: '12' },
        { type: 'group', value: ',' },
        { type: 'integer', value: '345' },
        { type: 'decimal', value: '.' },
        { type: 'fraction', value: '00' },
      ]);
    });
  });

  describe('Load locale configuration asynchronously', () => {
    const { i18n, ja } = createAsyncInstance();
    const linked = ja.link();

    it('Can load locales asynchronously', async () => {
      expect(linked).toBe(i18n);
      expect(linked).toBeInstanceOf(I18n);
      expect(i18n.availableLocales).toStrictEqual(['ja', 'en', 'zh-cn']);
      expect(i18n.baseLocale).toBe('ja');
      expect(i18n.defaultLocale).toBe('ja');
      expect(i18n.dependenciesMap).toStrictEqual({
        ja: ['ja'],
        en: ['en', 'ja'],
        'zh-cn': ['zh-cn', 'en', 'ja'],
      });
      expect(() => i18n.t.bool).toThrow(
        /^\[i18n\] The locale "ja" has not been loaded yet\./,
      );
      expect(i18n.isLoading).toBeFalsy();
      expect(i18n.loadingLocales).toStrictEqual([]);
      const initPromise = i18n.init();
      expect(i18n.isLoading).toBeTruthy();
      expect(i18n.loadingLocales).toStrictEqual(['ja']);
      expect(() => i18n.t.bool).toThrow(
        /^\[i18n\] The locale "ja" has not been loaded yet\./,
      );
      await initPromise;

      expect(i18n.t.num).toBe(1);
      expect(i18n.t.str).toBe('str');
      expect(i18n.t.bool).toBe(false);
      expect(i18n.t.null).toBeNull();
      expect(i18n.t.fn('xxx')).toBe('hello xxx');
      expect(i18n.t.nested.num).toBe(0);
      expect(i18n.t.nested.str).toBe('nested str');
      expect(i18n.t.nested.bool).toBe(true);
      expect(i18n.t.nested.fn(true)).toBe('hello true');

      expect(i18n.d(0, 'long')).toBe('1970年1月1日');
      expect(i18n.d(new Date(0), 'year')).toBe('70年');
    });

    it('Can fall back to a loaded base locale when the locale configuration has not yet been loaded', async () => {
      const en = i18n.adapter('en');

      expect(en.value.num).toBe(1);
      expect(en.value.str).toBe('str');
      expect(en.value.bool).toBe(false);
      expect(en.value.null).toBeNull();
      expect(en.value.fn('xxx')).toBe('hello xxx');
      expect(en.value.nested.num).toBe(0);
      expect(en.value.nested.str).toBe('nested str');
      expect(en.value.nested.bool).toBe(true);
      expect(en.value.nested.fn(true)).toBe('hello true');

      expect(i18n.d(0, 'long', 'en')).toBe('January 1, 1970');
      expect(i18n.d(new Date(0), 'year', 'en')).toBe('70');
    });

    let switchEnPromise: any;

    it('After a locale change, it is possible to fall back to the basic configuration while the locale is being loaded.', async () => {
      switchEnPromise = i18n.setLocale('en');

      expect(i18n.currentLocale).toBe('ja');
      expect(i18n.isLoading).toBeTruthy();
      expect(i18n.loadingLocales).toStrictEqual(['en']);
      expect(i18n.t.num).toBe(1);
      expect(i18n.t.str).toBe('str');
      expect(i18n.t.bool).toBe(false);
      expect(i18n.t.null).toBeNull();
      expect(i18n.t.fn('xxx')).toBe('hello xxx');
      expect(i18n.t.nested.num).toBe(0);
      expect(i18n.t.nested.str).toBe('nested str');
      expect(i18n.t.nested.bool).toBe(true);
      expect(i18n.t.nested.fn(true)).toBe('hello true');

      expect(i18n.d(0, 'long')).toBe('1970年1月1日');
      expect(i18n.d(new Date(0), 'year')).toBe('70年');
    });

    it('After the locale change is completed, the changed locale configuration can be retrieved.', async () => {
      await switchEnPromise;

      expect(i18n.currentLocale).toBe('en');
      expect(i18n.isLoading).toBeFalsy();
      expect(i18n.loadingLocales).toStrictEqual([]);

      expect(i18n.t.num).toBe(0);
      expect(i18n.t.str).toBe('en str');
      expect(i18n.t.bool).toBe(true);
      expect(i18n.t.null).toBe(5);
      expect(i18n.t.fn('xxx')).toBe('hello en xxx');
      expect(i18n.t.nested.num).toBe(1);
      expect(i18n.t.nested.str).toBe('en nested str');
      expect(i18n.t.nested.bool).toBe(false);
      expect(i18n.t.nested.fn(true)).toBe('(en)hello true');

      expect(i18n.d(0, 'long')).toBe('January 1, 1970');
      expect(i18n.d(new Date(0), 'year')).toBe('70');
    });

    it('Can check if the locale is already loaded', () => {
      expect(i18n.localeIsLoaded('ja')).toBeTruthy();
      expect(i18n.localeIsLoaded('en')).toBeTruthy();
      expect(i18n.localeIsLoaded('zh-cn')).toBeFalsy();
    });

    let switchZHCNPromise: any;

    it('While reading sublocale, fall back to fallback locale, then base locale', () => {
      switchZHCNPromise = i18n.setLocale('zh-cn');

      expect(i18n.currentLocale).toBe('en');
      expect(i18n.isLoading).toBeTruthy();
      expect(i18n.loadingLocales).toStrictEqual(['zh-cn']);

      expect(i18n.t.num).toBe(0);
      expect(i18n.t.str).toBe('en str');
      expect(i18n.t.bool).toBe(true);
      expect(i18n.t.null).toBe(5);
      expect(i18n.t.fn('xxx')).toBe('hello en xxx');
      expect(i18n.t.nested.num).toBe(1);
      expect(i18n.t.nested.str).toBe('en nested str');
      expect(i18n.t.nested.bool).toBe(false);
      expect(i18n.t.nested.fn(true)).toBe('(en)hello true');

      expect(i18n.d(0, 'long')).toBe('January 1, 1970');
      expect(i18n.d(new Date(0), 'year')).toBe('70');
      expect(i18n.localeIsLoaded('zh-cn')).toBeFalsy();
    });
  });
});
