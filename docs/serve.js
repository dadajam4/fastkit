const path = require('path');
const express = require('express');

const dist = path.resolve(__dirname, 'dist');

const { ssr } = require(path.join(dist, 'server/package.json'));

const manifest = require(path.join(dist, 'client/ssr-manifest.json'));

const { default: renderPage } = require(path.join(dist, 'server'));

const server = express();

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

const port = 3000;
console.log(`Server started: http://localhost:${port}`);
server.listen(port);
