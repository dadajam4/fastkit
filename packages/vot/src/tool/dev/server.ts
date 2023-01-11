import type { ServerResponse } from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { performance } from 'perf_hooks';
import { NextHandleFunction } from 'connect';
import {
  createServer as createViteServer,
  InlineConfig,
  ViteDevServer,
} from 'vite';
import chalk from 'chalk';
import { getPluginOptions, getEntryPoint } from '../utils';
import type { WrittenResponse, SsrOptions } from '../../vot';
import module from 'node:module';

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

export const createSSRDevHandler = (
  server: ViteDevServer,
  options: SsrOptions = {},
) => {
  options = {
    ...server.config.inlineConfig, // CLI flags
    ...options,
  };

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

  function writeHead(response: ServerResponse, params: WrittenResponse = {}) {
    if (params.status) {
      response.statusCode = params.status;
    }

    if (params.statusText) {
      response.statusMessage = params.statusText;
    }

    if (params.headers) {
      for (const [key, value] of Object.entries(params.headers)) {
        response.setHeader(key, value);
      }
    }
  }

  const handleSsrRequest: NextHandleFunction = async (
    request,
    response,
    next,
  ) => {
    if (request.method !== 'GET' || request.originalUrl === '/favicon.ico') {
      return next();
    }

    fixEntryPoint(server);

    let template: string;

    try {
      template = await getIndexTemplate(request.originalUrl as string);
    } catch (error) {
      server.ssrFixStacktrace(error as Error);
      return next(error);
    }

    try {
      const entryPoint =
        options.ssrEntry || (await getEntryPoint(server.config, template));

      let resolvedEntryPoint = await server.ssrLoadModule(resolve(entryPoint));
      resolvedEntryPoint = resolvedEntryPoint.default || resolvedEntryPoint;
      const render = resolvedEntryPoint.render || resolvedEntryPoint;

      const protocol =
        (request as any).protocol ||
        (request.headers.referer || '').split(':')[0] ||
        'http';

      const url = protocol + '://' + request.headers.host + request.originalUrl;

      // This context might contain initialState provided by other plugins
      const { getRenderContext } = options;

      const context =
        (getRenderContext &&
          (await getRenderContext({
            url,
            request,
            response,
            resolvedEntryPoint,
          }))) ||
        {};

      writeHead(response, context);
      if (isRedirect(context)) {
        return response.end();
      }

      const result = await render(url, {
        request,
        response,
        template,
        ...context,
      });

      if (response.headersSent) {
        return response.end();
      }

      writeHead(response, result);
      if (isRedirect(result)) {
        return response.end();
      }

      response.setHeader('Content-Type', 'text/html');
      response.end(result.html);
    } catch (error) {
      // Send back template HTML to inject ViteErrorOverlay
      response.setHeader('Content-Type', 'text/html');
      response.end(template);

      // Wait until browser injects ViteErrorOverlay
      // custom element from the previous template
      setTimeout(() => next(error), 250);
      server.ssrFixStacktrace(error as Error);
    }
  };

  return handleSsrRequest;
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
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
    server: options.server || { ...options },
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
  const info = server.config.logger.info;

  let ssrReadyMessage = '\n -- SSR mode';

  if (Object.prototype.hasOwnProperty.call(server, 'printUrls')) {
    const vitePkg = require('vite/package.json');
    info(
      chalk.cyan(`\n  vite v${vitePkg.version}`) +
        chalk.green(` dev server running at:\n`),
      { clear: !server.config.logger.hasWarned },
    );

    server.printUrls();

    const ssr_start_time = (globalThis as any).__ssr_start_time;
    if (ssr_start_time) {
      ssrReadyMessage += chalk.cyan(
        ` ready in ${Math.round(performance.now() - ssr_start_time)}ms.`,
      );
    }
  }

  info(ssrReadyMessage + '\n');
}
