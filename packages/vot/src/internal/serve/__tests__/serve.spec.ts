import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import type { AddressInfo } from 'node:net';
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { serve } from '../serve';

/**
 * A minimal stand-in for what `vot build` leaves in `dist/`.
 *
 * `serve()` only ever reads `dist/server/package.json`, the server entry, the
 * SSR manifest and the render entry, so a handful of files is enough to drive
 * the whole mounting path without running a real build.
 */
function createDist(dir: string, base: string, proxyTarget: string) {
  const serverDist = path.join(dir, 'dist/server');
  fs.mkdirSync(serverDist, { recursive: true });
  fs.mkdirSync(path.join(dir, 'dist/client/.vite'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'dist/client/.vite/ssr-manifest.json'), '{}');

  fs.writeFileSync(
    path.join(serverDist, 'package.json'),
    JSON.stringify({
      ssr: { assets: [] },
      exports: 'main.mjs',
      base,
      server: { entry: 'vot.server.mjs' },
    }),
  );

  fs.writeFileSync(
    path.join(serverDist, 'main.mjs'),
    `export default async function renderPage(url) {
      return { html: 'rendered:' + new URL(url).pathname, status: 200 };
    }\n`,
  );

  fs.writeFileSync(
    path.join(serverDist, 'vot.server.mjs'),
    `export default {
      host: '127.0.0.1',
      port: 0,
      proxy: { '/api': ${JSON.stringify(proxyTarget)} },
      configureServer({ use }) {
        use('/healthcheck', (req, res) => {
          res.writeHead(200, { 'content-type': 'text/plain' });
          res.end('healthcheck');
        });
      },
    };\n`,
  );
}

function listen(server: http.Server): Promise<number> {
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () =>
      resolve((server.address() as AddressInfo).port),
    );
  });
}

function close(server: http.Server): Promise<void> {
  return new Promise((resolve) => server.close(() => resolve()));
}

/**
 * Boot `serve()` against a throwaway `dist/` and an upstream the proxy rule
 * points at, and hand back a `GET` bound to the resulting origin.
 */
function servedFixture(base: string) {
  const cwd = process.cwd();
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vot-serve-'));
  const upstream = http.createServer((req, res) => {
    res.writeHead(200, { 'content-type': 'text/plain' });
    res.end(`upstream:${req.url}`);
  });

  let origin: string;
  let served: Awaited<ReturnType<typeof serve>>;

  beforeAll(async () => {
    createDist(dir, base, `http://127.0.0.1:${await listen(upstream)}`);

    // `serve()` resolves `dist` against the working directory, and prints a
    // URL banner we have no use for here.
    process.chdir(dir);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);

    served = await serve();
    origin = `http://127.0.0.1:${(served.server.address() as AddressInfo).port}`;
  }, 30_000);

  afterAll(async () => {
    process.chdir(cwd);
    vi.restoreAllMocks();
    await close(served.server);
    await close(upstream);
    fs.rmSync(dir, { recursive: true, force: true });
  });

  return async function get(pathname: string) {
    const res = await fetch(`${origin}${pathname}`);
    return { status: res.status, body: await res.text() };
  };
}

// The point of these: `vot dev` hands `configureServer` Vite's own connect
// stack, which sits at the server root. `vot serve` has to agree, or the same
// source line answers at two different URLs (#223).
describe("serve, base '/app/'", () => {
  const get = servedFixture('/app/');

  it('mounts configureServer middleware at the server root, outside base', async () => {
    await expect(get('/healthcheck')).resolves.toEqual({
      status: 200,
      body: 'healthcheck',
    });
  });

  it('does not mount configureServer middleware inside base', async () => {
    const { body } = await get('/app/healthcheck');
    expect(body).toBe('rendered:/app/healthcheck');
  });

  it('matches proxy rules at the server root, outside base', async () => {
    await expect(get('/api/items')).resolves.toEqual({
      status: 200,
      body: 'upstream:/api/items',
    });
  });

  it('still renders the application under base', async () => {
    const { body } = await get('/app/some/page');
    expect(body).toBe('rendered:/app/some/page');
  });
});

// The default `base` builds no router at all, so the only thing that can break
// it is the registration order the fix depends on.
describe("serve, base '/'", () => {
  const get = servedFixture('/');

  it('answers configureServer middleware before the render route', async () => {
    await expect(get('/healthcheck')).resolves.toEqual({
      status: 200,
      body: 'healthcheck',
    });
  });

  it('answers proxy rules before the render route', async () => {
    await expect(get('/api/items')).resolves.toEqual({
      status: 200,
      body: 'upstream:/api/items',
    });
  });

  it('renders everything else', async () => {
    const { body } = await get('/some/page');
    expect(body).toBe('rendered:/some/page');
  });
});
