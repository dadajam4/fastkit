import { createSSRApp } from 'vue';
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { deserializeState } from './utils/deserialize-state';
import { useClientRedirect } from './utils/response';
import { getFullPath, withoutSuffix } from './utils/route';
import type { ClientHandler, VotContext } from './schemes';
import { createScrollBehavior } from '@fastkit/vue-page';
import { provideContext } from './injections';

export const createEntry: ClientHandler = async function createClientEntry(
  App,
  { routes, routerOptions = {}, debug = {}, ...options },
  hook,
) {
  const app = createSSRApp(App);

  const url = new URL(window.location.href);
  const base = __VOT_BASE__;
  const routeBase = base && withoutSuffix(base, '/');
  // const routeBase = base && withoutSuffix(base({ url }), '/');
  const router = createRouter({
    scrollBehavior: createScrollBehavior(),
    ...routerOptions,
    history: createWebHistory(routeBase),
    routes: routes as RouteRecordRaw[],
  });
  const { transformState = deserializeState } = options;

  // Deserialize the state included in the DOM
  const initialState = await transformState(
    (window as any).__INITIAL_STATE__,
    deserializeState,
  );

  // Browser redirect utilities
  const { redirect, writeResponse } = useClientRedirect((location) =>
    router.push(location),
  );

  const context: VotContext = {
    url,
    isClient: true,
    initialState,
    redirect,
    writeResponse,
    app,
    router,
    initialRoute: router.resolve(getFullPath(url, routeBase)),
  };

  provideContext(app, context);

  let entryRoutePath: string | undefined;
  let isFirstRoute = true;
  router.beforeEach((to) => {
    if (isFirstRoute || (entryRoutePath && entryRoutePath === to.path)) {
      // The first route is rendered in the server and its state is provided globally.
      isFirstRoute = false;
      entryRoutePath = to.path;
      to.meta.state = context.initialState;
    }
  });

  if (hook) {
    await hook(context);
  }

  app.use(router);

  if (debug.mount !== false) {
    // this will hydrate the app
    await router.isReady();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    app.mount(`#${__CONTAINER_ID__}`, true);
    // it is possible to debug differences of SSR / Hydrated app state
    // by adding a timeout between rendering the SSR version and hydrating it later
    // window.setTimeout(() => {
    //   console.log('The app has now hydrated');
    //   router.isReady().then(() => {
    //     app.mount('#app', true);
    //   });
    // }, 5000);
  }
};

// export default viteSSR;
