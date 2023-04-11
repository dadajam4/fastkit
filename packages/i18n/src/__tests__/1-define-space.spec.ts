import { describe, it, expect } from 'vitest';
import { defineI18nSpace } from '../space';
import { I18nLocales, I18nLocale } from '../locale';

describe('国際化スペースを定義する時', () => {
  describe('シンプルな設定で定義した時', () => {
    const Space = defineI18nSpace({
      locales: ['ja', { name: 'l2', formatLocales: ['en'] }],
      baseLocale: 'ja',
    });

    it('有効言語リストが配列で取得できること', () => {
      expect(Space.availableLocales).toStrictEqual(['ja', 'l2']);
    });

    it('指定した基底ロケールが設定されていること', () => {
      expect(Space.baseLocale).toBe('ja');
    });

    it('デフォルトロケールを指定しなかった時、基底ロケールがデフォルトロケールとして設定されていること', () => {
      expect(Space.defaultLocale).toBe('ja');
    });

    describe('有効なロケールかどうかをチェックする時', () => {
      it('無効なロケールを指定した時、isAvailableLocale() が falseを返却すること', () => {
        expect(Space.isAvailableLocale('xxx')).toBe(false);
      });

      it('有効なロケールを指定した時、isAvailableLocale() が trueを返却すること', () => {
        expect(Space.isAvailableLocale('ja')).toBe(true);
      });
    });

    describe('ロケールリストを利用する時', () => {
      it('ロケールリストのインスタンスが取得できること', () => {
        expect(Space.locales).toBeInstanceOf(I18nLocales);
      });

      const { ja, l2 } = Space.locales.at;

      it('ロケールリストの各ロケールが構造化されていること', () => {
        expect(ja).toBeInstanceOf(I18nLocale);
        expect(ja.name).toBe('ja');
        expect(ja.meta).toStrictEqual({});
        expect(ja.isBaseLocale).toBe(true);

        expect(l2).toBeInstanceOf(I18nLocale);
        expect(l2.name).toBe('l2');
        expect(l2.meta).toStrictEqual({});
        expect(l2.isBaseLocale).toBe(false);
      });

      it('ロケールリストからロケールが検索できること', () => {
        const hit = Space.locales.find((locale) => locale.name === 'l2');
        expect(hit).toBe(l2);
      });
    });

    it('スペースからロケールが取得できること', () => {
      const { ja, l2 } = Space.locales.at;
      expect(Space.getLocale('ja')).toBe(ja);
      expect(Space.getLocale('l2')).toBe(l2);
    });

    it('スペースからフォーマットロケールが取得できること', () => {
      expect(Space.getFormatLocales('ja')).toStrictEqual(['ja']);
      expect(Space.getFormatLocales('l2')).toStrictEqual(['en']);
    });

    describe('任意の文字列を有効なロケール名に正規化する時', () => {
      it('無効なロケールを指定した時にデフォルトロケールとして正規化されること', () => {
        expect(Space.resolveLocale('xxx')).toBe(Space.defaultLocale);
      });
      it('有効なロケールを指定した時にそのままのロケール名として取得できること', () => {
        expect(Space.resolveLocale('l2')).toBe('l2');
      });
      it('大文字と小文字の違いが正規化されること', () => {
        expect(Space.resolveLocale('L2')).toBe('l2');
      });
      it('ハイフン区切りでパーツ化されて正規化されること', () => {
        expect(Space.resolveLocale('l2-hoge-fuga')).toBe('l2');
      });
      it('ハイフン区切りされたパーツが無効なロケール名である場合、デフォルトロケールとして正規化されること', () => {
        expect(Space.resolveLocale('l2a-hoge-fuga')).toBe('ja');
      });
    });

    describe('ロケールの依存関係を取得する時', () => {
      it('基底ロケールの依存関係はそのロケール名のみであること', () => {
        expect(Space.getLocaleDependencies('ja')).toStrictEqual(['ja']);
      });
      it('ロケールにフォールバックを指定した時、フォールバックロケールが依存関係の後続へ設定されていること', () => {
        expect(Space.getLocaleDependencies('ja')).toStrictEqual(['ja']);
        expect(Space.getLocaleDependencies('l2')).toStrictEqual(['l2', 'ja']);
      });
    });

    describe('スペースをインスタンス化した時', () => {
      const space = Space.create();

      it('有効言語リストが配列で取得できること', () => {
        expect(space.availableLocales).toStrictEqual(['ja', 'l2']);
      });

      it('指定した基底ロケールが設定されていること', () => {
        expect(space.baseLocale).toBe('ja');
      });

      it('デフォルトロケールを指定しなかった時、基底ロケールがデフォルトロケールとして設定されていること', () => {
        expect(space.defaultLocale).toBe('ja');
      });

      it('現在のロケールオブジェクトを取得できること', () => {
        expect(space.currentLocale).toBe(space.locales.at.ja);
      });

      it('現在のロケール名を取得できること', () => {
        expect(space.currentLocaleName).toBe('ja');
      });

      it('現在のロケールをチェックできること', () => {
        expect(space.currentLocaleIs('ja')).toBe(true);
        expect(space.currentLocaleIs('l2')).toBe(false);
      });

      it('次のロケールがundefinedであること', () => {
        expect(space.nextLocale).toBeUndefined();
      });

      it('次のロケール名がundefinedであること', () => {
        expect(space.nextLocaleName).toBeUndefined();
      });

      it('ロード中のロケールリストが空っぽであること', () => {
        expect(space.loadingLocales).toStrictEqual([]);
      });

      it('ロード中でないこと', () => {
        expect(space.isLoading).toBe(false);
      });

      describe('有効なロケールかどうかをチェックする時', () => {
        it('無効なロケールを指定した時、isAvailableLocale() が falseを返却すること', () => {
          expect(space.isAvailableLocale('xxx')).toBe(false);
        });

        it('有効なロケールを指定した時、isAvailableLocale() が trueを返却すること', () => {
          expect(space.isAvailableLocale('ja')).toBe(true);
        });
      });

      describe('ロケールリストを利用する時', () => {
        it('ロケールリストのインスタンスが取得できること', () => {
          expect(space.locales).toBeInstanceOf(I18nLocales);
        });

        const { ja, l2 } = space.locales.at;

        it('ロケールリストの各ロケールが構造化されていること', () => {
          expect(ja).toBeInstanceOf(I18nLocale);
          expect(ja.name).toBe('ja');
          expect(ja.meta).toStrictEqual({});
          expect(ja.isBaseLocale).toBe(true);

          expect(l2).toBeInstanceOf(I18nLocale);
          expect(l2.name).toBe('l2');
          expect(l2.meta).toStrictEqual({});
          expect(l2.isBaseLocale).toBe(false);
        });

        it('ロケールリストからロケールが検索できること', () => {
          const hit = space.locales.find((locale) => locale.name === 'l2');
          expect(hit).toBe(l2);
        });
      });

      it('スペースからロケールが取得できること', () => {
        const { ja, l2 } = space.locales.at;
        expect(space.getLocale('ja')).toBe(ja);
        expect(space.getLocale('l2')).toBe(l2);
      });

      it('スペースからフォーマットロケールが取得できること', () => {
        expect(space.getFormatLocales('ja')).toStrictEqual(['ja']);
        expect(space.getFormatLocales('l2')).toStrictEqual(['en']);
      });

      describe('任意の文字列を有効なロケール名に正規化する時', () => {
        it('無効なロケールを指定した時にデフォルトロケールとして正規化されること', () => {
          expect(space.resolveLocale('xxx')).toBe(space.defaultLocale);
        });
        it('有効なロケールを指定した時にそのままのロケール名として取得できること', () => {
          expect(space.resolveLocale('l2')).toBe('l2');
        });
        it('大文字と小文字の違いが正規化されること', () => {
          expect(space.resolveLocale('L2')).toBe('l2');
        });
        it('ハイフン区切りでパーツ化されて正規化されること', () => {
          expect(space.resolveLocale('l2-hoge-fuga')).toBe('l2');
        });
        it('ハイフン区切りされたパーツが無効なロケール名である場合、デフォルトロケールとして正規化されること', () => {
          expect(space.resolveLocale('l2a-hoge-fuga')).toBe('ja');
        });
      });

      describe('ロケールの依存関係を取得する時', () => {
        it('基底ロケールの依存関係はそのロケール名のみであること', () => {
          expect(space.getLocaleDependencies('ja')).toStrictEqual(['ja']);
        });
        it('ロケールにフォールバックを指定した時、フォールバックロケールが依存関係の後続へ設定されていること', () => {
          expect(space.getLocaleDependencies('ja')).toStrictEqual(['ja']);
          expect(space.getLocaleDependencies('l2')).toStrictEqual(['l2', 'ja']);
        });
      });
    });
  });
});
