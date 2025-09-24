import { describe, it, expect } from 'vitest';
import { defineI18nSpace } from '../space';

describe('コンポーネントロケールを定義する時', () => {
  const Space = defineI18nSpace({
    locales: ['ja', { name: 'l2', formatLocales: ['en'] }],
    baseLocale: 'ja',
  });
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

  describe('厳格にロケールを定義した時', () => {
    const translations = scheme.defineTranslations.strict({
      str: '',
      num: 2,
      bool: false,
    });

    const n = {} as const;

    const ja = scheme.defineLocale.strict({
      translations,
      numberFormats: {
        n,
      },
    });

    it('厳格フラグがtrueとして設定されていること', () => {
      expect(ja.isStrict).toBe(true);
    });

    it('翻訳オブジェクトファクトリが設定されていること', () => {
      expect(ja.translations).toBeInstanceOf(Function);
    });

    it('フォーマッタ用のオプションが設定されていること', () => {
      expect(ja.dateTimeFormats).toStrictEqual({});
      expect(ja.numberFormats).toStrictEqual({ n });
      expect(ja.listFormats).toStrictEqual({});
    });
  });
});
