import { promises as fs } from 'node:fs';
import path from 'node:path';
import { performance } from 'perf_hooks';
import {
  createServer as createViteServer,
  isCSSRequest,
  InlineConfig,
  ViteDevServer,
  EnvironmentModuleNode,
} from 'vite';
import chalk from 'chalk';
import module from 'node:module';
import { getPluginOptions, getEntryPoint } from '../utils';
import type { SsrOptions } from '../../vot';
import type { VotRequestHandler } from '../../schema/adapter';

const require = module.createRequire(import.meta.url);

// This cannot be imported from utils due to ESM <> CJS issues
const isRedirect = ({ status = 0 } = {}) => status >= 300 && status < 400;

function fixEntryPoint(vite: ViteDevServer) {
  // The plugin is redirecting to the entry-client for the SPA,
  // but we need to reach the entry-server here. This trick
  // replaces the plugin behavior in the config and seems
  // to keep the entry-client for the SPA.
  for (const alias of vite.config.resolve.alias || []) {
    if ((alias as any)._viteSSR === true) {
      alias.replacement = alias.replacement.replace('client', 'server');
    }
  }
}

// export interface SsrOptions {
//   plugin?: string;
//   ssr?: string;
//   getRenderContext?: (params: {
//     url: string;
//     request: connect.IncomingMessage;
//     response: ServerResponse;
//     resolvedEntryPoint: Record<string, any>;
//   }) => Promise<WrittenResponse>;
// }

const SCSS_MAP_MATCH_RE = /\.s?(a|c)ss\.map$/;

/**
 * Placeholder swapped for the stylesheets the rendered page uses.
 *
 * It is put into the template *before* rendering so that the styles end up
 * where the client build puts its `<link rel="stylesheet">` tags: after the
 * head of `index.html`, but ahead of the tags the renderer appends for the
 * current route.
 */
const DEV_STYLES_PLACEHOLDER = '<!--vot-dev-styles-->';

const HEAD_CLOSE_TAG = '</head>';

/**
 * Ask Vite for the stylesheet itself instead of the JavaScript module that
 * injects it. `direct` has to come first so that the request still ends in a
 * CSS extension for ids that already carry a query (`App.vue?vue&type=style`).
 */
function injectDirectQuery(id: string): string {
  const queryIndex = id.indexOf('?');
  return queryIndex === -1
    ? `${id}?direct`
    : `${id.slice(0, queryIndex)}?direct&${id.slice(queryIndex + 1)}`;
}

const ID_PREFIX_MATCH_RE = /^\/@id\//;

const NULL_BYTE_PLACEHOLDER_MATCH_RE = /^__x00__/;

const TIMESTAMP_QUERY_MATCH_RE = /[?&]t=\d+/;

/**
 * `dynamicDeps` records the specifier as the module runner addresses it, which
 * is the module url with Vite's virtual module encoding still applied. Strip it
 * back down so the two sides can be compared.
 */
function normalizeModuleUrl(url: string): string {
  return url
    .replace(ID_PREFIX_MATCH_RE, '')
    .replace(NULL_BYTE_PLACEHOLDER_MATCH_RE, '\0')
    .replace(TIMESTAMP_QUERY_MATCH_RE, '');
}

function escapeAttributeValue(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

interface DevStyle {
  id: string;
  css: string;
}

function renderDevStyles(styles: DevStyle[]): string {
  return styles
    .map(
      ({ id, css }) =>
        `<style type="text/css" data-vite-dev-id="${escapeAttributeValue(
          id,
        )}">${css.replace(/<\/style>/gi, '<\\/style>')}</style>`,
    )
    .join('\n');
}

export const createSSRDevHandler = (
  server: ViteDevServer,
  options: SsrOptions = {},
) => {
  options = {
    ...server.config.inlineConfig, // CLI flags
    ...options,
  };

  const useCSSDevSourcemap = !!server.config.css?.devSourcemap;

  const pluginOptions = getPluginOptions(server.config);
  const resolve = (p: string) => path.resolve(server.config.root, p);
  async function getIndexTemplate(url: string) {
    // Template should be fresh in every request
    const indexHtml = await fs.readFile(
      pluginOptions.input || resolve('index.html'),
      'utf-8',
    );
    return await server.transformIndexHtml(url, indexHtml);
  }

  /**
   * Collect the stylesheets the rendered page pulled in.
   *
   * Vite serves stylesheets as JavaScript modules in dev, so nothing in the
   * response carries CSS until the client entry has been fetched and executed —
   * the window that shows up as a flash of unstyled content. Walking the SSR
   * module graph tells us which stylesheets this particular route needs, and
   * they are keyed by the module id Vite's HMR client uses so that it adopts
   * the `<style>` elements instead of appending duplicates on hydration.
   */
  async function collectDevStyles(entryId: string): Promise<DevStyle[]> {
    const ssrEnvironment = server.environments.ssr;
    const clientEnvironment = server.environments.client;
    if (!ssrEnvironment || !clientEnvironment) return [];

    const { moduleGraph } = ssrEnvironment;
    const entryModule =
      moduleGraph.getModuleById(entryId) ||
      (await moduleGraph.getModuleByUrl(entryId));
    if (!entryModule) return [];

    const cssIds: string[] = [];
    const seen = new Set<EnvironmentModuleNode>();
    const deferred: EnvironmentModuleNode[] = [];

    // Stylesheets are leaves of the graph, so the order they are reached in is
    // the order the client applies them in — and the cascade depends on it.
    // Depth-first in import order gets that right for static imports; anything
    // behind a dynamic import only runs once the static graph is done, so it is
    // queued and walked afterwards.
    const walk = (mod: EnvironmentModuleNode) => {
      if (seen.has(mod)) return;
      seen.add(mod);
      if (mod.id && isCSSRequest(mod.id)) {
        cssIds.push(mod.id);
        return;
      }
      const dynamicDeps = new Set(
        (mod.transformResult?.dynamicDeps || []).map(normalizeModuleUrl),
      );
      mod.importedModules.forEach((imported) => {
        if (dynamicDeps.has(normalizeModuleUrl(imported.url))) {
          deferred.push(imported);
        } else {
          walk(imported);
        }
      });
    };

    walk(entryModule);

    // `deferred` grows while it is drained, which keeps nested dynamic imports
    // in the order the client reaches them.
    while (deferred.length) {
      walk(deferred.shift() as EnvironmentModuleNode);
    }

    const styles = await Promise.all(
      cssIds.map(async (id): Promise<DevStyle | undefined> => {
        // The SSR transform of a stylesheet is an empty module, so the CSS has
        // to come from the client environment.
        const result = await clientEnvironment
          .transformRequest(injectDirectQuery(id))
          .catch((error) => {
            server.config.logger.warn(
              `[vot] Could not inline "${id}" into the SSR response: ${
                (error as Error).message
              }`,
            );
            return null;
          });
        return result?.code ? { id, css: result.code } : undefined;
      }),
    );

    return styles.filter((style): style is DevStyle => !!style);
  }

  const handleSsrRequest: VotRequestHandler = async (request, runtime) => {
    const url = new URL(request.url);
    const requestPath = `${url.pathname}${url.search}`;

    // Declining rather than answering: these belong to Vite's own middlewares,
    // or to whatever sits behind vot.
    if (
      request.method !== 'GET' ||
      url.pathname === '/favicon.ico' ||
      (!useCSSDevSourcemap && SCSS_MAP_MATCH_RE.test(requestPath))
    ) {
      return undefined;
    }

    fixEntryPoint(server);

    let template = await getIndexTemplate(requestPath).catch((error) => {
      server.ssrFixStacktrace(error as Error);
      throw error;
    });

    // Reserve the slot the collected styles go into. The placeholder is an HTML
    // comment, so it is harmless on the paths that bypass the replacement.
    template = template.replace(
      HEAD_CLOSE_TAG,
      `${DEV_STYLES_PLACEHOLDER}${HEAD_CLOSE_TAG}`,
    );

    try {
      const entryPoint =
        options.ssrEntry || (await getEntryPoint(server.config, template));

      const resolvedEntryId = resolve(entryPoint);
      let resolvedEntryPoint = await server.ssrLoadModule(resolvedEntryId);
      resolvedEntryPoint = resolvedEntryPoint.default || resolvedEntryPoint;
      const render = resolvedEntryPoint.render || resolvedEntryPoint;

      // This context might contain initialState provided by other plugins
      const { getRenderContext } = options;

      const context =
        (getRenderContext &&
          (await getRenderContext({
            url: request.url,
            request,
            runtime,
            resolvedEntryPoint,
          }))) ||
        {};

      if (isRedirect(context)) {
        return new Response(null, {
          status: context.status,
          ...(context.statusText
            ? { statusText: context.statusText }
            : undefined),
          headers: context.headers,
        });
      }

      const result = await render(request.url, {
        request,
        runtime,
        template,
        ...context,
      });

      if (isRedirect(result)) {
        return new Response(null, {
          status: result.status,
          ...(result.statusText
            ? { statusText: result.statusText }
            : undefined),
          headers: result.headers,
        });
      }

      // The set of stylesheets depends on what the render actually imported,
      // so this has to happen per request, once the render is done.
      const styles = await collectDevStyles(resolvedEntryId);

      const headers = new Headers(result.headers);
      headers.set('Content-Type', 'text/html');

      return new Response(
        (result.html as string).replace(DEV_STYLES_PLACEHOLDER, () =>
          renderDevStyles(styles),
        ),
        {
          status: result.status || 200,
          ...(result.statusText
            ? { statusText: result.statusText }
            : undefined),
          headers,
        },
      );
    } catch (error) {
      server.ssrFixStacktrace(error as Error);
      /**
       * The template goes back so that Vite's client can mount its error
       * overlay; the error itself is logged here rather than handed onward,
       * because a fetch handler has nowhere to hand it.
       */
      server.config.logger.error(
        chalk.red(`[vot] SSR render failed: ${(error as Error).stack}`),
        { error: error as Error },
      );
      return new Response(template.replace(DEV_STYLES_PLACEHOLDER, ''), {
        status: 500,
        headers: { 'Content-Type': 'text/html' },
      });
    }
  };

  return handleSsrRequest;
};

export interface CreateSsrServerOptions extends InlineConfig {
  // polyfills?: boolean;
}

export async function createSsrServer(options: CreateSsrServerOptions = {}) {
  // Enable SSR in the plugin
  process.env.__DEV_MODE_SSR = 'true';

  const viteServer = await createViteServer({
    ...options,
    ...{
      define: {
        __VOT_GENERATE__: false,
      },
    },
    server: options.server || { ...(options as any) },
  });

  const isMiddlewareMode = !!(
    (options as any).middlewareMode || options.server?.middlewareMode
  );

  return new Proxy(viteServer, {
    get(target, prop, receiver) {
      if (prop === 'listen') {
        return async (port?: number) => {
          const server = await target.listen(port);

          if (!isMiddlewareMode) {
            await printServerInfo(server);
          }

          return server;
        };
      }

      return Reflect.get(target, prop, receiver);
    },
  });
}

export async function printServerInfo(server: ViteDevServer) {
  const { info } = server.config.logger;

  let ssrReadyMessage = '\n -- SSR mode';

  if (Object.prototype.hasOwnProperty.call(server, 'printUrls')) {
    const vitePkg = require('vite/package.json');
    info(
      chalk.cyan(`\n  vite v${vitePkg.version}`) +
        chalk.green(` dev server running at:\n`),
      { clear: !server.config.logger.hasWarned },
    );

    server.printUrls();

    const ssrStartTime = (globalThis as any).__ssr_start_time;
    if (ssrStartTime) {
      ssrReadyMessage += chalk.cyan(
        ` ready in ${Math.round(performance.now() - ssrStartTime)}ms.`,
      );
    }
  }

  info(`${ssrReadyMessage}\n`);
}
