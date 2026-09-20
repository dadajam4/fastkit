/// <reference types="vite-plugin-pages/client" />

import { App, h, Component } from 'vue';
import { Router } from 'vue-router';
import { isPromise, IN_WINDOW, removeUndef } from '@fastkit/helpers';
import {
  installVuePageControl,
  VuePageControlSettings,
  VPageRoot,
} from '@fastkit/vue-page';
import { withCtx } from '@fastkit/vue-utils';
import { createEntry } from './entry';
import { CreateEntryOptions } from './schema';
import { VOT_GENERATE_PAGES_PATH } from './schema/generate';

export * from '@fastkit/vue-page';

export async function createVotHook(
  App: Component,
  options: CreateEntryOptions,
) {
  const defaultSlot = () => h(App);
  const RootApp = () =>
    h(VPageRoot, null, {
      default: withCtx(defaultSlot),
    });
  const { createHead } = await (typeof window !== undefined
    ? import('@unhead/vue/client')
    : import('@unhead/vue/server'));

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
              /**
               * This writes the route table straight down the wire rather than
               * rendering a page, so it needs the real transport response --
               * which the page layer no longer carries. It comes back through
               * the runtime handle the adapter put there.
               *
               * The shape is spelled out structurally rather than imported
               * from `@fastkit/vot/adapters/node`: this module is part of the
               * application bundle, and that one names `node:http`. Reaching
               * for it here would put Node's http module in the import graph
               * of every build, including the ones that have no such module.
               */
              const outgoing = (
                ctx.server?.runtime as
                  | {
                      native?: {
                        outgoing?: {
                          setHeader(name: string, value: string): void;
                          writeHead(status: number): void;
                          end(body: string): void;
                        };
                      };
                    }
                  | undefined
              )?.native?.outgoing;

              if (outgoing) {
                outgoing.setHeader('Content-Type', 'application/json');
                outgoing.writeHead(200);
                outgoing.end(JSON.stringify(router.getRoutes()));
              }
            },
          },
        });
      }

      const {
        initialState,
        initialRoute,
        server,
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
          server,
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
