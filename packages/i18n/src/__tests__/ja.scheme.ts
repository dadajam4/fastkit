import { defineI18nScheme } from '../';

export const jaScheme = () =>
  defineI18nScheme({
    value: {
      num: 1,
      str: 'str',
      bool: <boolean>false,
      null: <null | number>null,
      fn<ARG extends string>(arg: ARG) {
        return `hello ${arg}`;
      },
      nested: {
        num: 0,
        str: 'nested str',
        bool: <boolean>true,
        fn: (arg: boolean): string => {
          return arg ? 'hello true' : 'hello false';
        },
      },
    },
    datetimeFormats: {
      year: { year: '2-digit' },
      long: { year: 'numeric', month: 'long', day: 'numeric' },
    },
    numberFormats: {
      jpyCurrency: { style: 'currency', currency: 'JPY' },
      maxSig: { maximumSignificantDigits: 3 },
    },
  });

export default jaScheme;
