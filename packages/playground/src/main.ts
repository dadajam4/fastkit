import './main.scss';
import viteSSR from 'vite-ssr';
import { App } from '~/App';
import { createHead } from '@vueuse/head';
import { routes } from '~/routes';
import byeie from '@fastkit/byeie';
import { installVuiPlugin } from '@fastkit/vui';
import { colorScheme } from '../.dynamic/color-scheme/color-scheme.info';
import '../.dynamic/icon-font/icons';

if (__BROWSER__) {
  // byeie({ deadline: 'recommended' });
  byeie({ deadline: 'microsoft-365-pre' });
}

const _hook = viteSSR(App, { routes }, (ctx) => {
  const { app } = ctx;
  const head = createHead();
  app.use(head);

  installVuiPlugin(app, {
    colorScheme,
    colors: {
      primary: 'primary',
      error: 'error',
    },
    icons: {
      menuDown: 'menu-down',
    },
  });
  // app.use(vueColorScheme);
  // installVueStackPlugin(app, { primaryColor: 'primary' });
  // app.use(VueStackPlugin);
  return { head };
});

export default async function hook(url: string, cfg: any = {}) {
  return _hook(url, cfg);
}
