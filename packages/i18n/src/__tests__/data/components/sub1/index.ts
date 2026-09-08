import { sub1Schema } from './schema';
import { ja } from './ja';
import { en } from './en';
import { zhtw } from './zh-tw';
import { zhcn } from './zh-cn';

export const Sub1 = sub1Schema.defineComponent({
  name: 'sub1',
  locales: {
    ja,
    en,
    // @see https://jestjs.io/docs/ecmascript-modules
    // 'zh-cn': () => import('./zh-cn'),
    'zh-cn': () =>
      new Promise((resolve) =>
        setTimeout(() => resolve({ default: zhcn }), 500),
      ),
    'zh-tw': zhtw,
  },
});
