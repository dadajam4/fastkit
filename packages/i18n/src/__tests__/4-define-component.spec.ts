import { describe, it, expect } from 'vitest';
import { defineI18nSpace } from '../space';

describe('コンポーネントを定義する時', () => {
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

  const jaTranslations = scheme.defineTranslations.strict({
    str: '',
    num: 2,
    bool: false,
  });

  const jaNumberFormats = {
    n: {},
  } as const;

  const ja = scheme.defineLocale.strict({
    translations: jaTranslations,
    numberFormats: jaNumberFormats,
  });

  const l2 = scheme.defineLocale({
    translations: scheme.defineTranslations({}),
    numberFormats: {},
  });

  describe('シンプルなコンポーネントを定義した時', () => {
    const Component = scheme.defineComponent({
      locales: { ja, l2 },
    });

    it('スキーマが参照できること', () => {
      expect(Component.scheme).toBe(scheme);
    });

    it('依存コンポーネントが取得できること', () => {
      expect(Component.dependencies).toStrictEqual({});
    });

    it('フォーマッタ用のオプションが取得できること', () => {
      expect(Component.dateTimeFormats).toStrictEqual(scheme.dateTimeFormats);
      expect(Component.numberFormats).toStrictEqual(scheme.numberFormats);
      expect(Component.listFormats).toStrictEqual(scheme.listFormats);
    });

    describe('コンポーネントスキーマにコンポーネントを依存関係として登録した時', () => {
      interface Trans2 {
        str2: string;
        num2: number;
        bool2: boolean;
      }

      const dependencies = { dep1: Component } as const;

      const scheme2 = Space.defineScheme({
        translations: (t: Trans2) => true,
        dependencies,
      });

      it('依存コンポーネントが設定されていること', () => {
        expect(scheme2.dependencies).toStrictEqual(dependencies);
      });

      const ja = scheme2.defineLocale.strict({
        translations: { str2: '', num2: 2, bool2: true },
      });

      const l2 = scheme2.defineLocale({
        translations: { bool2: false },
      });

      const Component2 = scheme2.defineComponent({
        locales: { ja, l2 },
      });

      it('スキーマが参照できること', () => {
        expect(Component2.scheme).toBe(scheme2);
      });

      it('依存コンポーネントが取得できること', () => {
        expect(Component2.dependencies).toStrictEqual(dependencies);
      });

      it('フォーマッタ用のオプションが取得できること', () => {
        expect(Component2.dateTimeFormats).toStrictEqual(
          scheme2.dateTimeFormats,
        );
        expect(Component2.numberFormats).toStrictEqual(scheme2.numberFormats);
        expect(Component2.listFormats).toStrictEqual(scheme2.listFormats);
      });
    });

    describe('スペースを依存コンポーネントを添えてインスタンス化した時', () => {
      const space = Space.create({
        components: { C1: Component },
      });

      const c1 = space.at.C1;

      it('依存コンポーネントとしてインスタンスが登録されていること', () => {
        expect(c1.Ctor).toBe(Component);
        const deps = space.getComponentDependencies();
        expect(deps.length).toBe(1);
        expect(deps[0]).toBe(Component);
      });

      it('コンポーネントからスペースインスタンスが取得できること', () => {
        expect(c1.space.Ctor).toBe(Space);
      });

      it('コンポーネントからスキーマが取得できること', () => {
        expect(c1.scheme).toBe(scheme);
      });

      it('フォーマッタ用のオプションが取得できること', () => {
        expect(c1.dateTime.settings()).toStrictEqual(scheme.dateTimeFormats);
        expect(c1.number.settings()).toStrictEqual(scheme.numberFormats);
        expect(c1.list.settings()).toStrictEqual(scheme.listFormats);
      });
    });
  });
});
