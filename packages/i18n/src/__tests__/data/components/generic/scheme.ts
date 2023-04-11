import { TestI18nSpace } from '../../space';
import { Sub1 } from '../sub1';

export type GenericTranslations = {
  /**
   * number
   */
  num: number;

  /**
   * string
   */
  str: string;

  /**
   * boolean
   */
  bool: boolean;

  /**
   * null or number
   */
  null: null | number;

  /**
   * function
   *
   * @param arg - string argument
   */
  fn<ARG extends string>(arg: ARG): string;

  /**
   * nested object
   */
  nested: {
    /**
     * nested number
     */
    num: number;

    /**
     * nested string
     */
    str: string;

    /**
     * nested boolean
     */
    bool: boolean;

    /**
     * nested function
     * @param arg - boolean
     */
    fn(arg: boolean): string;
  };
};

export const genericScheme = TestI18nSpace.defineScheme({
  dependencies: {
    sub1: Sub1,
  },
  translations: (t: GenericTranslations) => true,
  dateTimeFormats: {
    year: { year: '2-digit' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
  },
  relativeTimeFormats: {
    narrow: { style: 'narrow' },
    short: { style: 'short' },
    long: { style: 'long' },
  },
  numberFormats: {
    jpyCurrency: { style: 'currency', currency: 'JPY' },
    maxSig: { maximumSignificantDigits: 3 },
  },
  listFormats: {
    piyo: { style: 'long' },
  },
});
