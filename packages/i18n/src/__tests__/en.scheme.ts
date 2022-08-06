import type { jaScheme } from './ja.scheme';

export const enScheme = (base: ReturnType<typeof jaScheme>) =>
  base.createStrictSubScheme({
    value: {
      num: 0,
      str: 'en str',
      bool: true,
      null: 5,
      fn: <ARG extends string>(arg: ARG) => {
        return `hello en ${arg}` as const;
      },
      nested: {
        num: 1,
        str: 'en nested str',
        bool: false,
        fn: (arg) => {
          return arg ? '(en)hello true' : '(en)hello false';
        },
      },
    },
    datetimeFormats: {
      year: { year: 'numeric' },
    },
  });

export default enScheme;
