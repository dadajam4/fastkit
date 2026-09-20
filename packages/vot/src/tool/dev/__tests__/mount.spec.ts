import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { AddressInfo } from 'node:net';
import { createServer, ViteDevServer } from 'vite';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { nodeAdapter } from '../../../adapters/node';
import { createDevMiddleware } from '../mount';

/**
 * These cover the one thing the dev mount has to get right: a request the vot
 * application declines must reach the rest of Vite's stack, untouched, rather
 * than becoming a 404 vot invented.
 */
describe('createDevMiddleware', () => {
  let root: string;
  let server: ViteDevServer;
  let origin: string;
  const fellThrough: string[] = [];

  beforeEach(async () => {
    root = fs.realpathSync(
      fs.mkdtempSync(path.join(os.tmpdir(), 'vot-mount-')),
    );
    fs.writeFileSync(
      path.join(root, 'index.html'),
      '<!doctype html><html><head><title>fixture</title></head><body><script type="module" src="/main.ts"></script></body></html>\n',
    );
    fs.writeFileSync(path.join(root, 'main.ts'), 'export const a = 1;\n');

    const votApp = await nodeAdapter.createApp({
      command: 'dev',
      host: '127.0.0.1',
      port: 0,
      base: '/',
      proxy: [],
      logger: { error: () => undefined },
      configureServer: ({ app }) => {
        app.get('/healthcheck', (c) => c.text('healthcheck', 200));
      },
      handler: async (request) => {
        const { pathname } = new URL(request.url);
        // The catch-all declines what it does not own, exactly as the real
        // one does for a non-GET or a favicon.
        if (request.method !== 'GET') return undefined;
        if (pathname === '/favicon.ico') return undefined;
        // A page path vot declines, to reach the case where Vite's fallback
        // has rewritten the url and the request still has to move on.
        if (pathname === '/declined/page') return undefined;
        return new Response(`rendered ${pathname}`, {
          headers: { 'content-type': 'text/html' },
        });
      },
    });

    server = await createServer({
      root,
      logLevel: 'silent',
      server: { port: 0, host: '127.0.0.1' },
      plugins: [
        {
          name: 'vot-mount-test',
          configureServer(vite) {
            // Returning a function defers the mount until after Vite's own
            // middlewares but before its HTML fallback -- which is the only
            // place this can go.
            return () => {
              const middleware = createDevMiddleware(votApp);
              vite.middlewares.use((req, res, next) => {
                middleware(req, res, () => {
                  fellThrough.push(`${req.method} ${req.url}`);
                  next();
                });
              });
            };
          },
        },
      ],
    });

    await server.listen();
    origin = `http://127.0.0.1:${(server.httpServer!.address() as AddressInfo).port}`;
  });

  afterEach(async () => {
    await server?.close();
    fs.rmSync(root, { recursive: true, force: true });
    fellThrough.length = 0;
  });

  it('answers a route configureServer registered', async () => {
    const res = await fetch(`${origin}/healthcheck`);
    expect(await res.text()).toBe('healthcheck');
    expect(fellThrough).toEqual([]);
  });

  it('renders the path that was asked for, not the one Vite rewrote', async () => {
    // Vite's HTML fallback rewrites `req.url` to `/index.html` before this
    // middleware runs. Reading it rather than `originalUrl` would make every
    // page render as the index route -- and nothing else would notice.
    const res = await fetch(`${origin}/some/page`);
    expect(await res.text()).toBe('rendered /some/page');
  });

  it('falls through when the catch-all declines', async () => {
    const res = await fetch(`${origin}/favicon.ico`);
    expect(fellThrough).toEqual(['GET /favicon.ico']);
    expect(res.headers.has('x-vot-decline')).toBe(false);
  });

  it('falls through when nothing matched at all', async () => {
    const res = await fetch(`${origin}/anything`, { method: 'POST' });
    expect(fellThrough).toEqual(['POST /anything']);
    expect(res.headers.has('x-vot-decline')).toBe(false);
  });

  it('restores the url it borrowed before passing the request on', async () => {
    // Vite's HTML fallback rewrote this to `/index.html` before vot ran; vot
    // swapped `originalUrl` back in to render the right route. Whatever runs
    // next has to see what Vite gave it, not what vot needed.
    await fetch(`${origin}/declined/page`);
    expect(fellThrough).toEqual(['GET /index.html']);
  });

  it('leaves Vite to serve its own module requests', async () => {
    const res = await fetch(`${origin}/main.ts`);
    expect(await res.text()).toContain('export const a = 1');
    expect(fellThrough).toEqual([]);
  });
});
