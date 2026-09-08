import { genericSchema } from './schema';

export const ja = genericSchema.defineLocale.strict({
  translations: {
    num: 1,
    str: 'str',
    bool: false,
    null: null,
    fn(arg) {
      return `hello ${arg}`;
    },
    nested: {
      num: 0,
      str: 'nested str',
      bool: true,
      fn(arg) {
        return arg ? 'hello true' : 'hello false';
      },
    },
  },
});
