import { sub1Scheme } from './scheme';
import { ja } from './ja';
import { en } from './en';
import { zhtw } from './zh-tw';
import { zhcn } from './zh-cn';

export const Sub1 = sub1Scheme.defineComponent({
  name: 'sub1',
  locales: {
    ja,
    en,
    // @see https://jestjs.io/docs/ecmascript-modules
    // 'zh-cn': () => import('./zh-cn'),
    'zh-cn': () => {
      return new Promise((resolve) =>
        setTimeout(() => resolve({ default: zhcn }), 500),
      );
    },
    'zh-tw': zhtw,
  },
});
