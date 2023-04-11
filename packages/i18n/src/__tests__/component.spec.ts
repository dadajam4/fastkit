import { describe, it, expect } from 'vitest';
import { TestI18nSpace, Generic } from './data';

describe('コンポーネントの初期化と翻訳オブジェクト参照のテスト', () => {
  describe('コンポーネントのスタティック処理のテスト', () => {
    it('基礎ロケールの依存ロケールが基礎ロケールのみになっていること', () => {
      expect(TestI18nSpace.getLocaleDependencies('ja')).toStrictEqual(['ja']);
    });

    it('基礎ロケール以外の依存ロケールに基礎ロケールが含まれていること', () => {
      expect(TestI18nSpace.getLocaleDependencies('en')).toStrictEqual([
        'en',
        'ja',
      ]);
      expect(TestI18nSpace.getLocaleDependencies('zh-tw')).toStrictEqual([
        'zh-tw',
        'ja',
      ]);
    });

    it('フォールバックロケールの指定がある場合、依存ロケールとして含まれていること', () => {
      expect(TestI18nSpace.getLocaleDependencies('zh-cn')).toStrictEqual([
        'zh-cn',
        'en',
        'ja',
      ]);
    });

    it('ロケールが正規化できること', () => {
      expect(TestI18nSpace.resolveLocale('ja-JP')).toBe('ja');
      expect(TestI18nSpace.resolveLocale('en-US')).toBe('en');
      expect(TestI18nSpace.resolveLocale('enus')).toBe('ja');
      expect(TestI18nSpace.resolveLocale('zh_TW')).toBe('zh-tw');
      expect(TestI18nSpace.resolveLocale('zh')).toBe('zh-cn');
      expect(TestI18nSpace.resolveLocale('ZH')).toBe('zh-cn');
      expect(TestI18nSpace.resolveLocale('zh-hoge')).toBe('zh-cn');
    });
  });

  describe('コンポーネントインスタンス処理のテスト', () => {
    const space = TestI18nSpace.create({
      components: { generic: Generic },
    });

    it('ロードが完了しない状態で翻訳オブジェクトを参照すると例外をスローすること', () => {
      const { generic } = space.at;

      expect(() => generic.t.fn('あいうえお')).toThrow(
        '[i18n] The locale "ja" has not yet been initialized.',
      );

      expect(() => generic.deps.sub1.t.str).toThrow(
        '[i18n] The locale "ja" has not yet been initialized.',
      );
    });

    it('ロード中のステータスが取得できること', async () => {
      expect(space.loadingLocales).toStrictEqual([]);
      expect(space.isLoading).toBe(false);
      const promise = space.init();
      expect(space.loadingLocales).toStrictEqual(['ja']);
      expect(space.isLoading).toBe(true);
      await promise;
      expect(space.loadingLocales).toStrictEqual([]);
      expect(space.isLoading).toBe(false);
    });

    it('スペースインスタンスはロード状態を独立して持てること', async () => {
      const space2 = TestI18nSpace.create({
        defaultLocale: 'en',
        components: { generic: Generic },
      });

      expect(space.currentLocaleName).toBe('ja');
      expect(space.loadingLocales).toStrictEqual([]);
      expect(space.isLoading).toBe(false);

      expect(space2.currentLocaleName).toBe('en');
      expect(space2.loadingLocales).toStrictEqual([]);
      expect(space2.isLoading).toBe(false);

      const promise = space2.init();

      expect(space.loadingLocales).toStrictEqual([]);
      expect(space.isLoading).toBe(false);

      expect(space2.loadingLocales).toStrictEqual(['en']);
      expect(space2.isLoading).toBe(true);

      await promise;

      expect(space.loadingLocales).toStrictEqual([]);
      expect(space.isLoading).toBe(false);

      expect(space2.loadingLocales).toStrictEqual([]);
      expect(space2.isLoading).toBe(false);
    });

    it('ロードが完了後に翻訳オブジェクトを参照できること', () => {
      const { generic } = space.at;
      expect(generic.t.num).toBe(1);
      expect(generic.t.str).toBe('str');
      expect(generic.t.bool).toBe(false);
      expect(generic.t.null).toBe(null);
      expect(generic.t.fn('arg')).toBe('hello arg');
      expect(generic.t.nested.num).toBe(0);
      expect(generic.t.nested.str).toBe('nested str');
      expect(generic.t.nested.bool).toBe(true);
      expect(generic.t.nested.fn(true)).toBe('hello true');
      expect(generic.t.nested.fn(false)).toBe('hello false');
    });

    it('依存関係にあるコンポーネントの翻訳オブジェクトを参照できること', () => {
      const { generic } = space.at;
      expect(generic.deps.sub1.t.str).toBe('sub1 ja');
    });

    it('ロケール切り替え中のステータスと翻訳オブジェクトが取得できること', async () => {
      const { generic } = space.at;
      expect(space.currentLocaleName).toBe('ja');
      expect(space.nextLocaleName).toBeUndefined();
      expect(space.loadingLocales).toStrictEqual([]);
      expect(space.isLoading).toBe(false);

      const promise = space.setLocale('en');

      expect(space.currentLocaleName).toBe('ja');
      expect(space.nextLocaleName).toBe('en');
      expect(space.loadingLocales).toStrictEqual(['en']);
      expect(space.isLoading).toBe(true);
      expect(generic.t.num).toBe(1);

      await promise;

      expect(space.currentLocaleName).toBe('en');
      expect(space.nextLocaleName).toBeUndefined();
      expect(space.loadingLocales).toStrictEqual([]);
      expect(space.isLoading).toBe(false);
      expect(generic.t.num).toBe(0);
    });

    it('言語切り替え後に変更後の翻訳オブジェクトを参照できること', () => {
      const { generic } = space.at;
      expect(generic.t.num).toBe(0);
      expect(generic.t.str).toBe('en str');
      expect(generic.t.bool).toBe(true);
      expect(generic.t.null).toBe(5);
      expect(generic.t.fn('arg')).toBe('hello en arg : sub1 en');
      expect(generic.t.nested.num).toBe(1);
      expect(generic.t.nested.str).toBe('en nested str');
      expect(generic.t.nested.bool).toBe(false);
      expect(generic.t.nested.fn(true)).toBe('(en)hello true');
      expect(generic.t.nested.fn(false)).toBe('(en)hello false');
    });

    it('不完全なロケール翻訳オブジェクトを参照する時、フォールバックロケールの値が補完されていること', async () => {
      const { generic } = space.at;

      expect(space.currentLocaleName).toBe('en');
      expect(space.nextLocaleName).toBeUndefined();
      expect(space.loadingLocales).toStrictEqual([]);
      expect(space.isLoading).toBe(false);

      const promise = space.setLocale('zh-cn');

      expect(space.currentLocaleName).toBe('en');
      expect(space.nextLocaleName).toBe('zh-cn');
      expect(space.loadingLocales).toStrictEqual(['zh-cn']);
      expect(space.isLoading).toBe(true);
      expect(generic.t.num).toBe(0);

      await promise;

      expect(space.currentLocaleName).toBe('zh-cn');
      expect(space.nextLocaleName).toBeUndefined();
      expect(space.loadingLocales).toStrictEqual([]);
      expect(space.isLoading).toBe(false);

      expect(generic.t.num).toBe(0);
      expect(generic.t.str).toBe('简体中文 str');
      expect(generic.t.bool).toBe(true);
      expect(generic.t.null).toBe(5);
      expect(generic.t.fn('arg')).toBe('hello en arg : sub1 zh-cn');
      expect(generic.t.nested.num).toBe(1);
      expect(generic.t.nested.str).toBe('nested zh-cn str');
      expect(generic.t.nested.bool).toBe(false);
      expect(generic.t.nested.fn(true)).toBe('nested zh-cn str');
      expect(generic.t.nested.fn(false)).toBe('false');
    });
  });
});
