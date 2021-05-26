import './main.scss';
import viteSSR from 'vite-ssr';
import { App } from '~/App';
import { createHead } from '@vueuse/head';
import { routes } from '~/routes';
import byeie from '@fastkit/byeie';
import vueColorScheme from './plugins/color-scheme';
import { installVueStackPlugin } from '@fastkit/vue-stack';

if (__BROWSER__) {
  // byeie({ deadline: 'recommended' });
  byeie({ deadline: 'microsoft-365-pre' });
}

const _hook = viteSSR(App, { routes }, (ctx) => {
  const { app } = ctx;
  const head = createHead();
  app.use(head);
  app.use(vueColorScheme);
  installVueStackPlugin(app, { primaryColor: 'primary' });
  // app.use(VueStackPlugin);
  return { head };
});

export default async function hook(url: string, cfg: any = {}) {
  return _hook(url, cfg);
}
