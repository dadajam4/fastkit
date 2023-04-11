import { describe, it, expect } from 'vitest';
import { TestI18nSpace, Generic, Sub1 } from './data';

const MockSubComponentScheme = TestI18nSpace.defineScheme({
  translations: (trans: any) => true,
});

const MockSubComponent = MockSubComponentScheme.defineComponent({
  name: 'MockSubComponent',
  locales: {
    ja: MockSubComponentScheme.defineLocale.strict({ translations: {} }),
    en: MockSubComponentScheme.defineLocale({ translations: {} }),
    'zh-cn': MockSubComponentScheme.defineLocale({ translations: {} }),
    'zh-tw': MockSubComponentScheme.defineLocale({ translations: {} }),
  },
});

describe('サブスペースの動作の確認', () => {
  describe('サブスペースの初期化動作の確認', () => {
    const space = TestI18nSpace.create({
      components: { generic: Generic },
    });

    const subSpace = space.createSubSpace({ Sub1, MockSubComponent });

    it('スペースの各フィールドの値が取得できること', () => {
      expect(subSpace.space).toBe(space);
      expect(subSpace.locales).toBe(space.locales);
      expect(subSpace.defaultLocale).toBe(space.defaultLocale);
      expect(subSpace.baseLocale).toBe(space.baseLocale);
      expect(subSpace.availableLocales).toBe(space.availableLocales);
      expect(subSpace.isBaseLocale('ja')).toBe(space.isBaseLocale('ja'));
      expect(subSpace.isAvailableLocale('ja')).toBe(
        space.isAvailableLocale('ja'),
      );
      expect(subSpace.resolveLocale('xx')).toBe(space.resolveLocale('xx'));
      expect(subSpace.getLocale('ja')).toBe(space.getLocale('ja'));
      expect(subSpace.getLocaleMeta('ja')).toBe(space.getLocaleMeta('ja'));
      expect(subSpace.getFormatLocales('ja')).toBe(
        space.getFormatLocales('ja'),
      );
      expect(subSpace.getLocaleDependencies('ja')).toStrictEqual(
        space.getLocaleDependencies('ja'),
      );
      expect(subSpace.at.Sub1).toBe(space.at.generic.deps.sub1);
    });

    it('サブスペースのコンポーネントが動作すること', async () => {
      expect(() => subSpace.at.Sub1.t.str).toThrow(
        '[i18n] The locale "ja" has not yet been initialized.',
      );

      await space.init();
      expect(subSpace.at.Sub1.t.str).toBe('sub1 ja');

      await space.setLocale('en');
      expect(subSpace.at.Sub1.t.str).toBe('sub1 en');
    });

    it('サブスペースを解放できること', async () => {
      const findMock = () =>
        space
          .getComponentDependencies()
          .find((component) => component.name === 'MockSubComponent');

      expect(findMock()).not.toBeUndefined();

      subSpace.dispose();
      expect(findMock()).toBeUndefined();
    });
  });
});
