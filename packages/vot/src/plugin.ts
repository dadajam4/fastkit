/// <reference types="vite-plugin-pages/client" />

import { App, h, Component } from 'vue';
import { Router } from 'vue-router';
import { createEntry } from './entry';
import { createHead } from '@vueuse/head';
import { isPromise, IN_WINDOW, removeUndef } from '@fastkit/helpers';
import {
  installVuePageControl,
  VuePageControlSettings,
  VPageRoot,
} from '@fastkit/vue-page';
import { CreateEntryOptions } from './schemes';
import { VOT_GENERATE_PAGES_PATH } from './schemes/generate';
export * from '@fastkit/vue-page';

export async function createVotHook(
  App: Component,
  options: CreateEntryOptions,
) {
  const slots = {
    default: () => h(App),
  };
  const RootApp = () => h(VPageRoot, null, slots);
  const routes =
    options.routes || (await import('virtual:generated-pages')).default;

  const hook = await createEntry(
    RootApp,
    { ...options, routes },
    async (_ctx) => {
      const app = _ctx.app as App;
      const router = _ctx.router as Router;

      if (__VOT_GENERATE__) {
        router.addRoute({
          path: `/${VOT_GENERATE_PAGES_PATH}`,
          component: {
            name: VOT_GENERATE_PAGES_PATH,
            template: '',
            middleware: (ctx) => {
              if (ctx.response) {
                ctx.response.setHeader('Content-Type', 'application/json');
                ctx.response.writeHead(200);
                ctx.response.end(JSON.stringify(router.getRoutes()));
              }
            },
          },
        });
      }

      const {
        initialState,
        initialRoute,
        request,
        response,
        writeResponse,
        redirect,
        plugins,
      } = _ctx;

      const head = createHead();
      app.use(head);

      const { middleware, routerOptions } = options;

      const pageControl = installVuePageControl(
        removeUndef<VuePageControlSettings>({
          app,
          router,
          RouterLink: routerOptions?.RouterLink,
          useLink: routerOptions?.useLink,
          initialState,
          initialRoute,
          request,
          response,
          middleware,
          writeResponse,
          serverRedirect: redirect,
          ErrorComponent: options.ErrorComponent,
        }),
      );

      // Set page control reference for global window
      if (IN_WINDOW) {
        (window as any).$vpc = pageControl;
      }

      // Install plugins
      if (plugins) {
        for (const plugin of plugins) {
          const result = plugin.setup(pageControl);
          if (isPromise(result)) {
            await result;
          }
        }
      }

      return { head };
    },
  );
  return hook;
}

export function createVotEntry(App: Component, options: CreateEntryOptions) {
  const hookPromise = createVotHook(App, options);
  return async function renderer(url: string, cfg: any = {}) {
    const hook = await hookPromise;
    return hook ? hook(url, cfg) : undefined;
  };
}
