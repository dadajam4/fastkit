import { TestI18nSpace } from '../../space';

export type Sub1Translations = {
  /**
   * sub1 string
   */
  str: string;
};

export const sub1Scheme = TestI18nSpace.defineScheme({
  translations: (t: Sub1Translations) => true,
});
