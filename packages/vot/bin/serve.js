const path = require('path');
const express = require('express');
const vite = require('vite');
const { proxyMiddleware } = require('../dist/tool');

async function main() {
  const { path: configPath, config } = await vite.loadConfigFromFile({
    command: 'serve',
  });

  const root = path.dirname(configPath);

  const port = (config.server && config.server.port) || 3000;

  const votPlugin = findPlugin('vite:vot');
  const configureServer = votPlugin && votPlugin.configureServer;

  const dist = path.resolve(root, 'dist');

  const { ssr } = require(path.join(dist, 'server/package.json'));

  const manifest = require(path.join(dist, 'client/ssr-manifest.json'));

  const { default: renderPage } = require(path.join(dist, 'server'));

  const server = express();

  if (config.server.proxy) {
    server.use(proxyMiddleware(null, config));
  }

  if (configureServer) {
    const use = server.use.bind(server);
    await configureServer({ middlewares: { use } });
  }

  // Serve every static asset route
  for (const asset of ssr.assets || []) {
    server.use('/' + asset, express.static(path.join(dist, 'client', asset)));
  }

  // Everything else is treated as a "rendering request"
  server.get('*', async (request, response) => {
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

    response.writeHead(status || 200, statusText || headers, headers);
    response.end(html);
  });

  await new Promise((resolve, reject) => {
    try {
      server.listen(port, () => {
        console.log(`Server started: http://localhost:${port}`);
        resolve();
      });
    } catch (err) {
      reject(err);
    }
  });

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

main();
