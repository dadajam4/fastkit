import { createApp } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { createRouter, createMemoryHistory, RouteRecordRaw } from 'vue-router';
import { getFullPath, withoutSuffix } from './utils/route';
import { renderHeadToString } from '@vueuse/head';
import { serializeState } from './utils/serialize-state';
import { createUrl } from './utils/route';
import { useSsrResponse } from './utils/response';
import {
  buildHtmlDocument,
  findDependencies,
  renderPreloadLinks,
} from './utils/html';

import type { SsrHandler, VotContext } from './schemes';

import { provideContext } from './injections';

const getEmptyHtmlParts = () => ({
  headTags: '',
  htmlAttrs: '',
  bodyAttrs: '',
  body: '',
  initialState: undefined as any,
  dependencies: [] as string[],
});

export const createEntry: SsrHandler = function createSsrEntry(
  App,
  {
    routes,
    // base,
    routerOptions = {},
    transformState = serializeState,
    ...options
  },
  hook,
) {
  return async function ssrEntry(
    url,
    {
      manifest,
      preload = false,
      skip = false,
      template = `__VOT_HTML__`, // This string is transformed at build time
      request,
      response,
      initialState,
      // ...extra
    } = {},
  ) {
    if (skip) {
      return { html: template, ...getEmptyHtmlParts() };
    }

    url = createUrl(url);

    const app = createApp(App);
    // const routeBase = base && withoutSuffix(base({ url }), '/');
    const base = __VOT_BASE__;
    const routeBase = base && withoutSuffix(base, '/');
    const router = createRouter({
      ...routerOptions,
      history: createMemoryHistory(routeBase),
      routes: routes as RouteRecordRaw[],
    });

    router.beforeEach((to) => {
      to.meta.state = initialState || null;
    });

    const fullPath = getFullPath(url, routeBase);
    const initialRoute = router.resolve(fullPath);

    // Server redirect utilities
    const {
      deferred,
      response: writtenResponse,
      writeResponse,
      redirect,
      isRedirect,
    } = useSsrResponse();

    if (!request) {
      throw new Error('need request object.');
    }

    if (!response) {
      throw new Error('need response object.');
    }

    const context: VotContext = {
      url,
      isClient: false,
      app,
      router,
      request,
      response,
      initialRoute,
      initialState: {},
      writeResponse,
      redirect,
    };

    provideContext(app, context);

    const { head } = (hook && (await hook(context))) || {};

    app.use(router);

    const tick = async () => {
      router.push(fullPath);

      await router.isReady();

      if (isRedirect()) return {};

      Object.assign(
        context.initialState || {},
        (router.currentRoute.value.meta || {}).state || {},
      );
      const body = await renderToString(app, context);
      if (isRedirect()) return {};

      const {
        headTags = '',
        htmlAttrs = '',
        bodyAttrs = '',
      } = head ? renderHeadToString(head) : {};

      return { body, headTags, htmlAttrs, bodyAttrs };
    };

    // Wait for either rendering finished or redirection detected
    const payload = await Promise.race([
      tick(), // Resolves when rendering to string is done
      deferred.promise, // Resolves when 'redirect' is called
    ]);

    // The 'redirect' utility has been called during rendering: skip everything else
    if (isRedirect()) return writtenResponse;

    // Not a redirect: get the HTML parts returned by the renderer and continue
    const htmlParts = {
      ...getEmptyHtmlParts(),
      ...payload,

      // Serialize the state to include it in the DOM
      initialState: await transformState(
        context.initialState || {},
        serializeState,
      ),
    };

    // If a manifest is provided and the current framework is able to add
    // modules to the context (e.g. Vue) while rendering, collect the dependencies.
    if (manifest) {
      htmlParts.dependencies = findDependencies(
        (context as any).modules,
        manifest,
      );

      if (preload && htmlParts.dependencies.length > 0) {
        htmlParts.headTags += renderPreloadLinks(htmlParts.dependencies);
      }
    }

    return {
      html: buildHtmlDocument(template, htmlParts),
      ...htmlParts,
      ...writtenResponse,
    };
  };
};

// export default viteSSR;
