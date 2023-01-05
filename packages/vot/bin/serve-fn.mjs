import path from 'path';
import express from 'express';
import { loadConfigFromFile } from 'vite';
import { proxyMiddleware } from '../dist/tool/index.mjs';
import module from 'node:module';
const require = module.createRequire(import.meta.url);

export async function serve(opts = {}) {
  let memwatch;

  if (opts.memwatch) {
    const { createMemwatch } = await import('./memwatch.mjs');
    memwatch = await createMemwatch();

    memwatch.memwatcher.start({
      graph: true,
      graphSetup(setup) {
        setup.metrics.malloc = {
          aggregator: 'avg',
          color: 'cyan',
        };
      },
      graphAddMetric(turtleGraph, stats) {
        turtleGraph.metric('malloc', 'malloc').push(stats.malloced_memory);
      },
    });
  }

  const { path: configPath, config } = await loadConfigFromFile({
    command: 'serve',
  });

  const root = path.dirname(configPath);

  const host = (config.server && config.server.host) || '0.0.0.0';
  const port = (config.server && config.server.port) || 3000;

  const votPlugin = findPlugin('vite:vot');

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

  let router = server;
  if (config.base) {
    router = express.Router();
    server.use(config.base, router);
  }

  if (config.server.proxy) {
    router.use(proxyMiddleware(null, config));
  }

  if (configureServer) {
    const use = router.use.bind(router);
    await configureServer({ middlewares: { use } });
  }

  // Serve every static asset route
  for (const asset of ssr.assets || []) {
    router.use('/' + asset, express.static(path.join(dist, 'client', asset)));
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

  const launched = await new Promise((resolve, reject) => {
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

  function findPlugin(pluginName, buckets = config.plugins) {
    for (const row of buckets) {
      if (Array.isArray(row)) {
        const hit = findPlugin(pluginName, row);
        if (hit) return hit;
      }
      if (row.name === pluginName) {
        return row;
      }
    }
  }
}

export default serve;
