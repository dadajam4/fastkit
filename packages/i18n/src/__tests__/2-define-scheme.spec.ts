import { describe, it, expect } from 'vitest';
import { defineI18nSpace } from '../space';

describe('スキーマを定義する時', () => {
  const Space = defineI18nSpace({
    locales: ['ja', { name: 'l2', formatLocales: ['en'] }],
    baseLocale: 'ja',
  });

  describe('シンプルなスキーマを定義する時', () => {
    interface Trans {
      str: string;
      num: number;
      bool: boolean;
    }

    const d = { year: '2-digit' } as const;
    const n = { style: 'currency', currency: 'EUR' } as const;
    const l = {
      style: 'long',
      type: 'conjunction',
    } as const;

    const scheme = Space.defineScheme({
      translations: (t: Trans) => true,
      dateTimeFormats: {
        d,
      },
      numberFormats: {
        n,
      },
      listFormats: {
        l,
      },
    });

    it('スキーマからスペースのコンストラクタを取得できること', () => {
      expect(scheme.Space).toBe(Space);
    });

    it('依存コンポーネントを指定しなかった時、依存コンポーネントマップが空のマップであること', () => {
      expect(scheme.dependencies).toStrictEqual({});
    });

    it('指定した日時フォーマットオプションが取得できること', () => {
      expect(scheme.dateTimeFormats.d).toStrictEqual(d);
    });

    it('指定した数値フォーマットオプションが取得できること', () => {
      expect(scheme.numberFormats.n).toStrictEqual(n);
    });

    it('指定したリストフォーマットオプションが取得できること', () => {
      expect(scheme.listFormats.l).toStrictEqual(l);
    });
  });
});
