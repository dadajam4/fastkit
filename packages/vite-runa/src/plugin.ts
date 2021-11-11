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

export type ViteRunaPluginFn = (ctx: VuePageControl) => any | Promise<any>;

export interface ViteRunaPlugin {
  setup: ViteRunaPluginFn;
}

export type RawViteRunaPlugin = ViteRunaPluginFn | ViteRunaPlugin;

function resolveRawViteRunaPlugin(raw: RawViteRunaPlugin) {
  return typeof raw === 'function' ? { setup: raw } : raw;
}

export function createViteRunaPlugin(source: RawViteRunaPlugin) {
  return resolveRawViteRunaPlugin(source);
}

type ViteSSROptions = Parameters<typeof _viteSSR>[1];

// declare module '@fastkit/vue-page' {
//   interface VuePageControl {
//     // _ErrorComponent?: RawComponent;
//     request?: IncomingMessage;
//     response?: ServerResponse;
//   }
// }

export interface ViteRunaOptions extends Omit<ViteSSROptions, 'routes'> {
  // ErrorComponent?: RawComponent;
  // routes: RouteRecordRaw[];
  plugins?: RawViteRunaPlugin[];
}

export type ViteRunaHook = (url: string, cfg?: any) => Promise<any>;

export async function createViteRunaHook(
  App: any,
  options: ViteRunaOptions,
): Promise<ViteRunaHook> {
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

    // const ctx: ViteRunaControl = {
    //   app,
    //   router,
    // };

    if (plugins) {
      for (const _plugin of plugins) {
        const plugin = resolveRawViteRunaPlugin(_plugin);
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

export function createViteRunaEntry(
  App: any,
  options: ViteRunaOptions,
): ViteRunaHook {
  const hookPromise = createViteRunaHook(App, options);
  return async function renderer(url: string, cfg: any = {}) {
    const hook = await hookPromise;
    return hook(url, cfg);
  };
}
