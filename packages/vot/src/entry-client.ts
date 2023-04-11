import { createSSRApp } from 'vue';
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { deserializeState } from './utils/deserialize-state';
import { useClientRedirect } from './utils/response';
import { getFullPath, withoutSuffix } from './utils/route';
import { setupVotPluginsAndHooks } from './schemes';
import type {
  ClientHandler,
  VotContext,
  VotBeforeRouterSetupParams,
} from './schemes';
import { createScrollBehavior } from '@fastkit/vue-page';
import { provideContext } from './injections';
import { createMockPathRoute } from '@fastkit/vue-utils';

export const createEntry: ClientHandler = async function createClientEntry(
  App,
  { routes, routerOptions = {}, debug = {}, plugins: _plugins, ...options },
  hook,
) {
  const { plugins, hooks } = setupVotPluginsAndHooks(_plugins);
  const app = createSSRApp(App);

  const url = new URL(window.location.href);
  const base = __VOT_BASE__;
  const routeBase = base && withoutSuffix(base, '/');
  // const routeBase = base && withoutSuffix(base({ url }), '/');

  const beforeRouterSetupParams: VotBeforeRouterSetupParams = {
    scrollBehavior: createScrollBehavior(),
    ...routerOptions,
    history: createWebHistory(routeBase),
    routes: routes as RouteRecordRaw[],
  };

  await hooks.emit('beforeRouterSetup', beforeRouterSetupParams);

  const router = createRouter(beforeRouterSetupParams);

  await hooks.emit('afterRouterSetup', router);

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

  const fullPath = getFullPath(url, routeBase);
  const initialRoute = createMockPathRoute(router, fullPath);

  const context: VotContext = {
    url,
    isClient: true,
    initialState,
    redirect,
    writeResponse,
    app,
    router,
    initialRoute,
    plugins,
    hooks,
  };

  provideContext(app, context);

  let entryRoutePath: string | undefined;
  let isFirstRoute = true;
  const done = router.beforeEach((to) => {
    if (isFirstRoute || (entryRoutePath && entryRoutePath === to.path)) {
      // The first route is rendered in the server and its state is provided globally.
      isFirstRoute = false;
      entryRoutePath = to.path;
      to.meta.state = context.initialState;
      done();
    }
  });

  app.use(router);

  if (hook) {
    await hook(context);
  }

  if (debug.mount !== false) {
    // this will hydrate the app
    await router.isReady();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    app.mount(`#${__VOT_CONTAINER_ID__}`, true);
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
