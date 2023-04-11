import path from 'node:path';
import express, { Express } from 'express';
import { loadConfigFromFile, Plugin, resolveConfig } from 'vite';
import { proxyMiddleware } from './proxy';
import module from 'node:module';
import type { Server } from 'node:http';

const require = module.createRequire(import.meta.url);

export interface ServeOptions {
  memwatch?: boolean;
}

export async function serve(opts: ServeOptions = {}) {
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

  const loadedConfig = await loadConfigFromFile({
    // @TODO
    // mode: process.env.NODE_ENV || 'development',
    command: 'serve',
  } as any);

  if (!loadedConfig) {
    throw new Error(`missing vite config.`);
  }

  const resolvedConfig = await resolveConfig(loadedConfig.config, 'serve');

  const { path: configPath, config } = loadedConfig;

  const root = path.dirname(configPath);

  const _host = config.server?.host;
  const host = _host && _host !== true ? _host : '0.0.0.0';
  const port = config.server?.port || 3000;

  const votPlugin = findPlugin('vite:vot');
  if (!votPlugin) {
    throw new Error('missing vot plugin.');
  }

  const configureServer = votPlugin && votPlugin.configureServer;

  const dist = path.resolve(root, 'dist');

  const { ssr, exports } = require(path.join(dist, 'server/package.json'));

  const manifest = require(path.join(dist, 'client/ssr-manifest.json'));

  const { default: renderPage } = await import(
    path.join(dist, 'server', exports)
  );

  const server = express();

  if (memwatch) {
    server.get('/__memwatch__/diff', async (request, response) => {
      memwatch.gc();
      const diff = memwatch.diff();
      response.json(diff);
    });
  }

  let router: Express = server;
  if (config.base) {
    router = express.Router() as Express;
    server.use(config.base, router);
  }

  if (config.server?.proxy) {
    router.use(proxyMiddleware(null, resolvedConfig));
  }

  if (configureServer) {
    const handler =
      typeof configureServer === 'function'
        ? configureServer
        : configureServer.handler;
    const use = router.use.bind(router);
    await handler({
      middlewares: {
        use,
      },
    } as any);
  }

  // Serve every static asset route
  for (const asset of ssr.assets || []) {
    const staticHandler = express.static(path.join(dist, 'client', asset)); // @TODO Express internal bug??
    router.use('/' + asset, staticHandler);
  }

  // Everything else is treated as a "rendering request"
  router.get('*', async (request, response) => {
    const url =
      request.protocol + '://' + request.get('host') + request.originalUrl;

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

  const launched = await new Promise<Server>((resolve, reject) => {
    try {
      const launched = server.listen(port, host, () => {
        console.log(`Server started: http://localhost:${port}`);
        resolve(launched);
      });
    } catch (err) {
      reject(err);
    }
  });

  return {
    server: launched,
    port,
    host,
  };

  function findPlugin(
    pluginName: string,
    buckets = config.plugins,
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
