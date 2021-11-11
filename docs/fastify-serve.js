const Fastify = require('fastify');
const fastifyStatic = require('fastify-static');
const path = require('path');
const fs = require('fs');

const dist = path.resolve(__dirname, 'dist');

const { ssr } = require(path.join(dist, 'server/package.json'));

const manifest = require(path.join(dist, 'client/ssr-manifest.json'));

const { default: renderPage } = require(path.join(dist, 'server'));

const fastify = Fastify();

// Serve every static asset route
const assetRoot = path.join(dist, 'client');
const staticFiles = [];
const staticDirs = [];

ssr.assets.forEach((asset) => {
  const resourcePath = path.join(assetRoot, asset);
  const stats = fs.statSync(resourcePath);
  if (stats.isDirectory()) {
    staticDirs.push({
      name: asset,
      dir: path.dirname(resourcePath),
      path: resourcePath,
    });
  } else {
    staticFiles.push({
      name: asset,
      dir: path.dirname(resourcePath),
      path: resourcePath,
    });
  }
});

staticDirs.forEach(({ name, path }) => {
  console.log(name, path);
  fastify.register(fastifyStatic, {
    root: path,
    prefix: `/${name}`,
  });
});

staticFiles.forEach(({ name, dir, path }) => {
  fastify.get(`/${name}`, (req, reply) => {
    return reply.sendFile(name, dir);
  });
});

fastify.get('*', async (req, reply) => {
  const url = req.protocol + '://' + req.hostname + req.url;
  const { html, status, statusText, headers } = await renderPage(url, {
    manifest,
    preload: true,
    // Anything passed here will be available in the main hook
    request: req.raw,
    response: reply.raw,
    // initialState: { ... } // <- This would also be available
  });

  reply.raw.writeHead(status || 200, statusText || headers, headers);
  reply.raw.end(html);
});

fastify.listen(3000);
