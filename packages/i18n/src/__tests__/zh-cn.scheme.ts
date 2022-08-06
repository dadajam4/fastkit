import type { jaScheme } from './ja.scheme';

export const zhcnScheme = (base: ReturnType<typeof jaScheme>) =>
  base.createSubScheme({
    value: {
      str: '简体中文 str',
      nested: {
        str: 'nested zh-cn str',
        fn(arg: boolean): string {
          return arg ? base.link().t.nested.str : String(arg);
        },
      },
    },
    numberFormats: {
      maxSig: { maximumSignificantDigits: 2 },
    },
  });

export default zhcnScheme;
