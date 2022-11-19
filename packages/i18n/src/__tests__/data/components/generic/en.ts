import { genericScheme } from './scheme';

export const en = genericScheme.defineLocale.strict({
  translations: (component) => ({
    num: 0,
    str: 'en str',
    bool: true,
    null: 5,
    fn(arg) {
      return `hello en ${arg} : ${component.deps.sub1.t.str}`;
    },
    nested: {
      num: 1,
      str: 'en nested str',
      bool: false,
      fn(arg) {
        return arg ? '(en)hello true' : '(en)hello false';
      },
    },
  }),
  dateTimeFormats: {
    year: { year: 'numeric' },
  },
  listFormats: {
    piyo: { style: 'long', type: 'conjunction' },
  },
});
