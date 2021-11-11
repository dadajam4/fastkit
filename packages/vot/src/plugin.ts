/// <reference types="vite-plugin-pages/client" />

import { App, h } from 'vue';
import { Router } from 'vue-router';
import _viteSSR from 'vite-ssr';
import { createHead } from '@vueuse/head';
import { isPromise, IN_WINDOW } from '@fastkit/helpers';
import {
  installVuePageControl,
  VuePageControl,
  VPageRoot,
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

type ViteSSROptions = Parameters<typeof _viteSSR>[1];

// declare module '@fastkit/vue-page' {
//   interface VuePageControl {
//     // _ErrorComponent?: RawComponent;
//     request?: IncomingMessage;
//     response?: ServerResponse;
//   }
// }

export interface VotOptions extends Omit<ViteSSROptions, 'routes'> {
  // ErrorComponent?: RawComponent;
  // routes: RouteRecordRaw[];
  plugins?: RawVotPlugin[];
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

  const hook = _viteSSR(RootApp, { ...options, routes }, async (_ctx) => {
    const app = _ctx.app as App;
    const router = _ctx.router as Router;
    const initialState = _ctx.initialState;
    const initialRoute = _ctx.initialRoute;
    // _ctx.isClient;
    const request = _ctx.request;
    const response = _ctx.response;
    // if (response) {
    //   response.statusCode = 404;
    // }
    // request
    // console.log(_ctx.response);

    const head = createHead();
    app.use(head);

    const { plugins } = options;

    const pageControl = installVuePageControl({
      app,
      router,
      initialState,
      initialRoute,
      request,
      response,
    });

    if (IN_WINDOW) {
      (window as any).$vpage = pageControl;
    }

    // const ctx: VotControl = {
    //   app,
    //   router,
    // };

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
  });
  return hook;
}

export function createVotEntry(App: any, options: VotOptions): VotHook {
  const hookPromise = createVotHook(App, options);
  return async function renderer(url: string, cfg: any = {}) {
    const hook = await hookPromise;
    return hook(url, cfg);
  };
}
