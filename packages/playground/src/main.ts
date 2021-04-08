import viteSSR from 'vite-ssr';
import { App } from '~/App';
import { createHead } from '@vueuse/head';
import { routes } from '~/routes';
import byeie from '@fastkit/byeie';

if (__BROWSER__) {
  // byeie({ deadline: 'recommended' });
  byeie({ deadline: '2021/04/08' });
}

export default viteSSR(App, { routes }, ({ app }) => {
  const head = createHead();
  app.use(head);
  return { head };
});
