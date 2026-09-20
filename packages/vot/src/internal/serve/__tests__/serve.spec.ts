import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import type { AddressInfo, Socket } from 'node:net';
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
    `export default async function renderPage(url, options = {}) {
      const { request } = options;
      const headers = new Headers();
      // Echo back what the transport delivered, so the tests can see whether
      // the render context really carries a web-standard Request.
      headers.set(
        'x-saw-accept-language',
        request?.headers?.get('accept-language') ?? '(none)',
      );
      headers.set('x-saw-url', request?.url ?? '(none)');
      headers.append('set-cookie', 'a=1; Path=/');
      headers.append('set-cookie', 'b=2; Path=/');
      return {
        html: 'rendered:' + new URL(url).pathname,
        status: 200,
        headers,
      };
    }\n`,
  );

  fs.writeFileSync(
    path.join(serverDist, 'vot.server.mjs'),
    `export default {
      host: '127.0.0.1',
      port: 0,
      proxy: {
        '/api': ${JSON.stringify(proxyTarget)},
        // Opting into WebSocket forwarding, the way Vite's proxy does.
        '/ws': { target: ${JSON.stringify(proxyTarget)}, ws: true },
      },
      configureServer({ app }) {
        app.get('/healthcheck', (c) =>
          c.text('healthcheck', 200, { 'content-type': 'text/plain' }),
        );
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

/**
 * Destroy every socket a server has accepted, then close it.
 *
 * An upgraded socket stays open by design and stops being tracked by the HTTP
 * server, so neither `close()` -- which waits for connections -- nor
 * `closeAllConnections()` releases it. Teardown hangs without this.
 */
function close(server: http.Server, sockets: Set<Socket>): Promise<void> {
  for (const socket of sockets) socket.destroy();
  sockets.clear();
  return new Promise((resolve) => server.close(() => resolve()));
}

/** Remember every socket a server accepts, so teardown can destroy them. */
function trackSockets(server: http.Server): Set<Socket> {
  const sockets = new Set<Socket>();
  server.on('connection', (socket) => {
    sockets.add(socket);
    socket.on('close', () => sockets.delete(socket));
  });
  return sockets;
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
  // Completes a real WebSocket handshake, so an upgrade that arrives here is
  // answered rather than merely accepted.
  upstream.on('upgrade', (req, socket) => {
    const accept = crypto
      .createHash('sha1')
      .update(
        `${req.headers['sec-websocket-key']}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`,
      )
      .digest('base64');
    socket.write(
      'HTTP/1.1 101 Switching Protocols\r\n' +
        'Upgrade: websocket\r\nConnection: Upgrade\r\n' +
        `Sec-WebSocket-Accept: ${accept}\r\n\r\n`,
    );
    // Echo whatever arrives, so a forwarded socket can be told apart from a
    // handshake that carries nothing.
    socket.on('data', (chunk: Buffer) => {
      socket.write(`echo:${chunk.toString()}`);
    });
  });

  let origin: string;
  let served: Awaited<ReturnType<typeof serve>>;
  const upstreamSockets = trackSockets(upstream);
  let servedSockets: Set<Socket>;

  beforeAll(async () => {
    createDist(dir, base, `http://127.0.0.1:${await listen(upstream)}`);

    // `serve()` resolves `dist` against the working directory, and prints a
    // URL banner we have no use for here.
    process.chdir(dir);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);

    served = await serve();
    servedSockets = trackSockets(served.native as http.Server);
    origin = `http://127.0.0.1:${served.port}`;
  }, 30_000);

  afterAll(async () => {
    process.chdir(cwd);
    vi.restoreAllMocks();
    for (const socket of servedSockets) socket.destroy();
    servedSockets.clear();
    await served.close();
    await close(upstream, upstreamSockets);
    fs.rmSync(dir, { recursive: true, force: true });
  });

  const get = async (pathname: string, init?: RequestInit) => {
    const res = await fetch(`${origin}${pathname}`, init);
    return {
      status: res.status,
      contentType: res.headers.get('content-type'),
      headers: res.headers,
      body: await res.text(),
    };
  };

  /**
   * Ask for a WebSocket upgrade and report what came back.
   *
   * With `send`, the answer also carries what the upstream echoed. A 101 that
   * cannot carry a frame is not a forwarded socket, and asserting only on the
   * status line would pass against a proxy that splices nothing.
   */
  const upgrade = (pathname: string, send?: string) =>
    new Promise<'upgraded' | 'not upgraded' | `echo:${string}`>((resolve) => {
      const { port } = new URL(origin);
      const request = http.request({
        host: '127.0.0.1',
        port,
        path: pathname,
        headers: {
          Connection: 'Upgrade',
          Upgrade: 'websocket',
          'Sec-WebSocket-Key': crypto.randomBytes(16).toString('base64'),
          'Sec-WebSocket-Version': '13',
        },
      });
      const done = (answer: 'upgraded' | 'not upgraded' | `echo:${string}`) => {
        request.destroy();
        resolve(answer);
      };
      const timer = setTimeout(() => done('not upgraded'), 2000);
      request.on('upgrade', (_res, socket) => {
        clearTimeout(timer);
        if (!send) return done('upgraded');
        socket.once('data', (chunk: Buffer) =>
          done(chunk.toString() as `echo:${string}`),
        );
        socket.write(send);
      });
      request.on('response', () => {
        clearTimeout(timer);
        done('not upgraded');
      });
      request.on('error', () => {
        clearTimeout(timer);
        done('not upgraded');
      });
      request.end();
    });

  return { get, upgrade };
}

// The point of these: `vot dev` hands `configureServer` Vite's own connect
// stack, which sits at the server root. `vot serve` has to agree, or the same
// source line answers at two different URLs (#223).
describe("serve, base '/app/'", () => {
  const { get, upgrade } = servedFixture('/app/');

  it('mounts configureServer middleware at the server root, outside base', async () => {
    await expect(get('/healthcheck')).resolves.toMatchObject({
      status: 200,
      body: 'healthcheck',
    });
  });

  it('does not mount configureServer middleware inside base', async () => {
    const { body } = await get('/app/healthcheck');
    expect(body).toBe('rendered:/app/healthcheck');
  });

  it('matches proxy rules at the server root, outside base', async () => {
    await expect(get('/api/items')).resolves.toMatchObject({
      status: 200,
      body: 'upstream:/api/items',
    });
  });

  it('still renders the application under base', async () => {
    const { body } = await get('/app/some/page');
    expect(body).toBe('rendered:/app/some/page');
  });

  // Without this the transport falls back to `text/plain` and a browser shows
  // the markup instead of rendering it -- which no assertion on the body can
  // see.
  it('serves a rendered page as HTML', async () => {
    const { contentType } = await get('/app/some/page');
    expect(contentType).toMatch(/^text\/html/);
  });

  // The render context carries a web-standard `Request` now. Anything reading
  // a request header -- language negotiation, above all -- depends on this
  // actually arriving, and a render that quietly sees no headers looks exactly
  // like one that does.
  it('delivers the request, headers and all, to the renderer', async () => {
    const { headers } = await get('/app/some/page', {
      headers: { 'accept-language': 'ja,en;q=0.8' },
    });
    expect(headers.get('x-saw-accept-language')).toBe('ja,en;q=0.8');
    expect(headers.get('x-saw-url')).toMatch(/\/app\/some\/page$/);
  });

  // A `Record<string, string>` could not have carried this, which is why
  // cookies used to be written straight to the Node response instead.
  it('carries every Set-Cookie the render wrote', async () => {
    const { headers } = await get('/app/some/page');
    expect(headers.getSetCookie()).toEqual(['a=1; Path=/', 'b=2; Path=/']);
  });

  // An upgrade never reaches Express -- the listener sits on the HTTP server --
  // so `base` cannot apply to it, the same way proxy rules are matched at the
  // root rather than inside `base`.
  it('forwards a WebSocket upgrade at the root, not under base', async () => {
    await expect(upgrade('/ws/socket')).resolves.toBe('upgraded');
    await expect(upgrade('/app/ws/socket')).resolves.toBe('not upgraded');
  });
});

// The default `base` builds no router at all, so the only thing that can break
// it is the registration order the fix depends on.
describe("serve, base '/'", () => {
  const { get, upgrade } = servedFixture('/');

  it('answers configureServer middleware before the render route', async () => {
    await expect(get('/healthcheck')).resolves.toMatchObject({
      status: 200,
      body: 'healthcheck',
    });
  });

  it('answers proxy rules before the render route', async () => {
    await expect(get('/api/items')).resolves.toMatchObject({
      status: 200,
      body: 'upstream:/api/items',
    });
  });

  it('renders everything else', async () => {
    const { body } = await get('/some/page');
    expect(body).toBe('rendered:/some/page');
  });

  // The proxy installs its `upgrade` listener on the HTTP server it is given,
  // and `serve()` used to have none to give until `listen()` -- so a `ws: true`
  // rule worked under `vot dev` and silently did nothing here (issue #236).
  it('forwards a WebSocket upgrade for a rule that opts in', async () => {
    await expect(upgrade('/ws/socket')).resolves.toBe('upgraded');
  });

  // The handshake is the easy half. This is the half `http-proxy` used to do,
  // and the half a hand-rolled forwarder can get wrong without anything
  // else noticing.
  it('carries data over the forwarded socket in both directions', async () => {
    await expect(upgrade('/ws/socket', 'ping')).resolves.toBe('echo:ping');
  });

  it('leaves an upgrade alone for a rule that does not', async () => {
    // Matches Vite: a plain string target forwards HTTP only, so the same
    // config behaves the same under `vot dev` and `vot serve`.
    await expect(upgrade('/api/socket')).resolves.toBe('not upgraded');
  });
});
