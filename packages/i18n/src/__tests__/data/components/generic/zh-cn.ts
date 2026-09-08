import { genericSchema } from './schema';

export const zhcn = genericSchema.defineLocale({
  translations: (component) => ({
    str: '简体中文 str',
    nested: {
      str: 'nested zh-cn str',
      fn(arg) {
        return arg ? component.t.nested.str : String(arg);
      },
    },
  }),
  dateTimeFormats: {
    year: { year: 'numeric' },
  },
  relativeTimeFormats: {
    narrow: {
      style: 'long',
    },
  },
});

export default zhcn;
