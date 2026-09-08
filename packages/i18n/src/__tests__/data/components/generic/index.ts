import { genericSchema } from './schema';
import { ja } from './ja';
import { en } from './en';
import { zhtw } from './zh-tw';
import { zhcn } from './zh-cn';

export const Generic = genericSchema.defineComponent({
  name: 'generic',
  locales: {
    ja,
    en,
    // @see https://jestjs.io/docs/ecmascript-modules
    // 'zh-cn': () => import('./zh-cn'),
    'zh-cn': () =>
      new Promise((resolve) => setTimeout(() => resolve(zhcn), 500)),
    'zh-tw': zhtw,
  },
});
