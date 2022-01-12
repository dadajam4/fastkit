/// <reference types="vite-plugin-pages/client" />

import { App, h } from 'vue';
import { Router } from 'vue-router';
// import _viteSSR from 'vite-ssr';
import { createEntry } from './vue/entry';
import { createHead } from '@vueuse/head';
import { isPromise, IN_WINDOW } from '@fastkit/helpers';
import {
  installVuePageControl,
  VuePageControl,
  VPageRoot,
  VuePageControlMiddlewareFn,
} from '@fastkit/vue-page';
export * from '@fastkit/vue-page';

export type VotPluginFn = (ctx: VuePageControl) => any | Promise<any>;

export interface VotPlugin {
  setup: VotPluginFn;
}

export type RawVotPlugin = VotPluginFn | VotPlugin;

function resolveRawVotPlugin(raw: RawVotPlugin) {
  return typeof raw === 'function' ? { setup: raw } : raw;
}

export function createVotPlugin(source: RawVotPlugin) {
  return resolveRawVotPlugin(source);
}

type ViteSSROptions = Parameters<typeof createEntry>[1];

export interface VotOptions extends Omit<ViteSSROptions, 'routes'> {
  plugins?: RawVotPlugin[];
  middleware?: VuePageControlMiddlewareFn[];
}

export type VotHook = (url: string, cfg?: any) => Promise<any>;

export async function createVotHook(
  App: any,
  options: VotOptions,
): Promise<VotHook> {
  const slots = {
    default: () => h(App),
  };
  const RootApp = () => h(VPageRoot, null, slots);
  const routes = (await import('virtual:generated-pages')).default;

  const hook = await createEntry(
    RootApp,
    { ...options, routes },
    async (_ctx) => {
      const app = _ctx.app as App;
      const router = _ctx.router as Router;
      const {
        initialState,
        initialRoute,
        request,
        response,
        writeResponse,
        redirect,
      } = _ctx;

      const head = createHead();
      app.use(head);

      const { plugins, middleware } = options;

      const pageControl = installVuePageControl({
        app,
        router,
        initialState,
        initialRoute,
        request,
        response,
        middleware,
        writeResponse,
        serverRedirect: redirect,
      });

      if (IN_WINDOW) {
        (window as any).$vpc = pageControl;
      }

      if (plugins) {
        for (const _plugin of plugins) {
          const plugin = resolveRawVotPlugin(_plugin);
          const result = plugin.setup(pageControl);
          if (isPromise(result)) {
            await result;
          }
        }
      }
      return { head };
    },
  );
  return hook as any;
}

export function createVotEntry(App: any, options: VotOptions): VotHook {
  const hookPromise = createVotHook(App, options);
  return async function renderer(url: string, cfg: any = {}) {
    const hook = await hookPromise;
    return hook(url, cfg);
  };
}
