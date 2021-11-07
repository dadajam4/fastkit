import { App, h } from 'vue';
import { Router, RouteRecordRaw } from 'vue-router';
import _viteSSR from 'vite-ssr';
import { createHead } from '@vueuse/head';
import { isPromise, IN_WINDOW } from '@fastkit/helpers';
import {
  installVuePageControl,
  VuePageControl,
  VPageRoot,
} from '@fastkit/vue-page';
export * from '@fastkit/vue-page';

export type VitePagePluginFn = (ctx: VuePageControl) => any | Promise<any>;

export interface VitePagePlugin {
  setup: VitePagePluginFn;
}

export type RawVitePagePlugin = VitePagePluginFn | VitePagePlugin;

function resolveRawVitePagePlugin(raw: RawVitePagePlugin) {
  return typeof raw === 'function' ? { setup: raw } : raw;
}

export function createVitePagePlugin(source: RawVitePagePlugin) {
  return resolveRawVitePagePlugin(source);
}

type ViteSSROptions = Parameters<typeof _viteSSR>[1];

// declare module '@fastkit/vue-page' {
//   interface VuePageControl {
//     // _ErrorComponent?: RawComponent;
//     request?: IncomingMessage;
//     response?: ServerResponse;
//   }
// }

export interface VitePageOptions extends Omit<ViteSSROptions, 'routes'> {
  // ErrorComponent?: RawComponent;
  routes: RouteRecordRaw[];
  plugins?: RawVitePagePlugin[];
}

export type VitePageHook = (url: string, cfg?: any) => Promise<any>;

export async function createVitePageHook(
  App: any,
  options: VitePageOptions,
): Promise<VitePageHook> {
  const slots = {
    default: () => h(App),
  };
  const RootApp = () => h(VPageRoot, null, slots);
  const hook = _viteSSR(RootApp, { ...options }, async (_ctx) => {
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

    // const ctx: VitePageControl = {
    //   app,
    //   router,
    // };

    if (plugins) {
      for (const _plugin of plugins) {
        const plugin = resolveRawVitePagePlugin(_plugin);
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

export function createVitePageRenderer(
  App: any,
  options: VitePageOptions,
): VitePageHook {
  const hookPromise = createVitePageHook(App, options);
  return async function renderer(url: string, cfg: any = {}) {
    const hook = await hookPromise;
    return hook(url, cfg);
  };
}
