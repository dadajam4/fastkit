/// <reference types="vite-plugin-pages/client" />

import { App, h, Component } from 'vue';
import { Router } from 'vue-router';
import { createEntry } from './entry';
import { createHead } from '@vueuse/head';
import { isPromise, IN_WINDOW, removeUndef } from '@fastkit/helpers';
import { installVuePageControl, VPageRoot } from '@fastkit/vue-page';
import { resolveRawVotPlugin, CreateEntryOptions } from './schemes';
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

      const pageControl = installVuePageControl(
        removeUndef({
          app,
          router,
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
  return hook;
}

export function createVotEntry(App: Component, options: CreateEntryOptions) {
  const hookPromise = createVotHook(App, options);
  return async function renderer(url: string, cfg: any = {}) {
    const hook = await hookPromise;
    return hook ? hook(url, cfg) : undefined;
  };
}
