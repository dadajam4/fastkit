/* eslint-disable no-console */
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import express, { Express } from 'express';
import type {
  CommonServerOptions,
  Logger,
  Plugin,
  ProxyOptions,
  ResolvedServerUrls,
  MinimalPluginContextWithoutEnvironment,
} from 'vite';
import module from 'node:module';
import { createServer, type Server } from 'node:http';
import chalk from 'chalk';
import { capitalize } from '@fastkit/helpers';
import type { Server as ConnectServer } from 'connect';
import { resolveServerUrls } from '../../utils/host';
import {
  resolveVotServerDefinition,
  VotServerDefinition,
} from '../../schema/server';
import { proxyMiddleware } from './proxy';

const require = module.createRequire(import.meta.url);

export interface ServeOptions {
  memwatch?: boolean;
}

export interface ServedResult {
  server: Server;
  port: number;
  host: string;
  resolvedUrls: ResolvedServerUrls;
}

/**
 * Everything `serve()` needs, regardless of where it came from.
 *
 * The server entry emitted by `vot build` fills this in directly. Without one,
 * it is reconstructed from the project's Vite config -- see
 * {@link loadConfigFromViteConfig}.
 */
interface ResolvedServeConfig {
  host: string;
  port: number;
  https?: CommonServerOptions['https'];
  base?: string;
  proxy?: Record<string, string | ProxyOptions>;
  logger: Pick<Logger, 'error'>;
  /**
   * Normalized form of both `VotConfigureServerFn` and the Vite
   * `configureServer` plugin hook.
   */
  configureServer?: (use: ConnectServer['use']) => Promise<void> | void;
}

const DEFAULT_HOST = '0.0.0.0';
const DEFAULT_PORT = 3000;

/**
 * Minimal stand-in for Vite's logger.
 *
 * Only `error` is ever called (by the proxy), and building one here is what
 * keeps `resolveConfig()` out of the serve path.
 */
const consoleLogger: Pick<Logger, 'error'> = {
  error(msg) {
    console.error(msg);
  },
};

function importDist(file: string): Promise<any> {
  return import(pathToFileURL(file).href);
}

function resolveHost(host: string | boolean | undefined): string {
  return host && host !== true ? host : DEFAULT_HOST;
}

/**
 * Read the server entry that `vot build` bundled into `dist/server`.
 *
 * Nothing here touches the project's Vite config, so the production runtime
 * does not need any of the plugins that `vite.config.ts` imports.
 */
async function loadConfigFromServerEntry(
  serverDist: string,
  entry: string,
  base: string | undefined,
): Promise<ResolvedServeConfig> {
  const mod = await importDist(path.join(serverDist, entry));
  const definition: VotServerDefinition | undefined = mod.default;

  if (!definition) {
    throw new Error(
      `the server entry "${entry}" has no default export. Export the result of \`defineVotServer()\`.`,
    );
  }

  const config = await resolveVotServerDefinition(definition, {
    command: 'serve',
    dev: false,
    mode: process.env.NODE_ENV || 'production',
  });

  const { configureServer } = config;

  return {
    host: resolveHost(config.host),
    port: config.port || DEFAULT_PORT,
    base,
    proxy: config.proxy,
    logger: consoleLogger,
    configureServer:
      configureServer && ((use) => configureServer({ use }) as Promise<void>),
  };
}

/**
 * Reconstruct the serve config by evaluating the project's `vite.config.ts`.
 *
 * Kept for applications built before server entries existed. It is the reason
 * every plugin referenced by `vite.config.ts` has to be installed in
 * production, so `vite` is imported lazily and only down this path.
 */
async function loadConfigFromViteConfig(): Promise<ResolvedServeConfig> {
  const { loadConfigFromFile, resolveConfig } = await import('vite');

  // Tells the vot plugin's `config()` hook that this is a production serve
  // rather than `vot dev`. It runs here because `resolveConfig()` below uses
  // the `serve` command, which Vite otherwise equates with development.
  process.env.__VOT_SERVE = 'true';

  const loadedConfig = await loadConfigFromFile({
    // @TODO
    // mode: process.env.NODE_ENV || 'development',
    command: 'serve',
  } as any);

  if (!loadedConfig) {
    throw new Error(`missing vite config.`);
  }

  const { config } = loadedConfig;
  const resolvedConfig = await resolveConfig(config, 'serve');

  const votPlugin = findPlugin('vite:vot', config.plugins);
  if (!votPlugin) {
    throw new Error('missing vot plugin.');
  }

  const { configureServer } = votPlugin;

  return {
    host: resolveHost(config.server?.host),
    port: config.server?.port || DEFAULT_PORT,
    https: config.server?.https,
    base: config.base,
    proxy: config.server?.proxy,
    logger: resolvedConfig.logger,
    configureServer:
      configureServer &&
      (async (use) => {
        const handler =
          typeof configureServer === 'function'
            ? configureServer
            : configureServer.handler;

        // The actual server is Express rather than Vite, so mock up the Vite
        // context the hook expects.
        const mockContext = {} as MinimalPluginContextWithoutEnvironment;

        // A partial ViteDevServer mock satisfying the minimum the
        // configureServer hook asks for.
        const mockViteDevServer = { middlewares: { use } } as any;

        await handler.call(mockContext, mockViteDevServer);
      }),
  };

  function findPlugin(
    pluginName: string,
    buckets: typeof config.plugins,
  ): Plugin | undefined {
    if (!buckets) return;
    for (const row of buckets) {
      if (Array.isArray(row)) {
        const hit = findPlugin(pluginName, row);
        if (hit) return hit;
      }
      if (
        row &&
        typeof row !== 'boolean' &&
        'name' in row &&
        row.name === pluginName
      ) {
        return row;
      }
    }
  }
}

export async function serve(opts: ServeOptions = {}): Promise<ServedResult> {
  let memwatch: any;

  if (opts.memwatch) {
    const { createMemwatch } = await import('./memwatch');

    memwatch = await createMemwatch();

    memwatch.memwatcher.start({
      graph: true,
      graphSetup(setup: any) {
        setup.metrics.malloc = {
          aggregator: 'avg',
          color: 'cyan',
        };
      },
      graphAddMetric(turtleGraph: any, stats: any) {
        turtleGraph.metric('malloc', 'malloc').push(stats.malloced_memory);
      },
    });
  }

  const dist = path.resolve(process.cwd(), 'dist');
  const serverDist = path.join(dist, 'server');

  const { ssr, exports, base, server: serverEntry } = require(
    path.join(serverDist, 'package.json'),
  );

  const config: ResolvedServeConfig = serverEntry?.entry
    ? await loadConfigFromServerEntry(serverDist, serverEntry.entry, base)
    : await loadConfigFromViteConfig();

  const { host, port } = config;

  const manifest = require(path.join(dist, 'client/.vite/ssr-manifest.json'));

  const { default: renderPage } = await importDist(
    path.join(serverDist, exports),
  );

  const app = express();
  // The HTTP server exists before anything is mounted, because the proxy needs
  // it to answer `upgrade`: `proxyMiddleware` installs that listener on the
  // server it is handed, and it used to be handed `null` since the server only
  // came into being at `listen()` (issue #236). `express().listen()` does
  // exactly this internally.
  const server = createServer(app);

  if (memwatch) {
    app.get('/__memwatch__/diff', async (request, response) => {
      memwatch.gc();
      const diff = memwatch.diff();
      response.json(diff);
    });
  }

  // Proxy rules and `configureServer` middleware are mounted at the server
  // root rather than inside `base`, so that the same source line answers at the
  // same URL under `vot dev` and `vot serve`. `base` is where the application's
  // assets and routes live; a health check, a metrics endpoint or a webhook
  // receiver is not part of that.
  //
  // They also have to be registered before the `base` router, whose catch-all
  // render route would otherwise claim every request below `base`.
  if (config.proxy) {
    app.use(
      proxyMiddleware(server, { proxy: config.proxy, logger: config.logger }),
    );
  }

  // Express's `use` differs from connect's only in its return type, and
  // `VotConfigureServerFn` is declared against connect's.
  await config.configureServer?.(
    app.use.bind(app) as unknown as ConnectServer['use'],
  );

  let router: Express = app;
  if (config.base && config.base !== '/') {
    router = express.Router() as Express;
    app.use(config.base, router);
  }

  // Serve every static asset route
  for (const asset of ssr.assets || []) {
    const staticHandler = express.static(path.join(dist, 'client', asset)); // @TODO Express internal bug??
    router.use(`/${asset}`, staticHandler);
  }

  // Everything else is treated as a "rendering request"
  router.get('*', async (request, response) => {
    const url = `${request.protocol}://${request.get('host')}${request.originalUrl}`;

    const { html, status, statusText, headers } = await renderPage(url, {
      manifest,
      preload: true,
      // Anything passed here will be available in the main hook
      request,
      response,
      // initialState: { ... } // <- This would also be available
    });

    if (response.headersSent) {
      return;
    }

    response.writeHead(status || 200, statusText || headers, headers);
    await new Promise((resolve) => setTimeout(resolve, 100));
    response.end(html);
  });

  const launched = await new Promise<{
    server: Server;
    resolvedUrls: ResolvedServerUrls;
  }>((resolve, reject) => {
    try {
      const launched = server.listen(port, host, async () => {
        const resolvedUrls = await resolveServerUrls(
          launched,
          { host: config.host, https: config.https },
          { rawBase: config.base },
        );

        console.log('');
        console.log(chalk.green('vot server running at:'));
        console.log('');

        (['local', 'network'] as const).forEach((type) => {
          const urls = resolvedUrls[type];
          const urlsText = urls.length
            ? chalk.cyan(urls.join(' '))
            : chalk.gray('Not exposed.');
          console.log(`> ${capitalize(type)}: ${urlsText}`);
        });

        resolve({ server: launched, resolvedUrls });
      });
    } catch (err) {
      reject(err);
    }
  });

  return {
    server: launched.server,
    port,
    host,
    resolvedUrls: launched.resolvedUrls,
  };
}
