import './main.scss';
import viteSSR from 'vite-ssr';
import { App } from './App';
import { createHead } from '@vueuse/head';
import { installVui } from '../.vui/installer';

const _hook = viteSSR(App, { routes: [] }, (ctx) => {
  const { app } = ctx;
  const head = createHead();
  app.use(head);
  installVui(app);
  return { head };
});

export default async function hook(url: string, cfg: any = {}) {
  return _hook(url, cfg);
}
