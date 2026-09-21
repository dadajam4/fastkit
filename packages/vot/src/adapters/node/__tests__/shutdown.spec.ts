import * as http from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterEach, describe, expect, it } from 'vitest';
import { Hono } from 'hono';
import { closeServer } from '../index';
import { nodeAdapter } from '../index';

const listen = (server: http.Server) =>
  new Promise<number>((resolve) => {
    server.listen(0, '127.0.0.1', () =>
      resolve((server.address() as AddressInfo).port),
    );
  });

/** A client that holds its socket open afterwards, the way a browser does. */
const agent = new http.Agent({ keepAlive: true, maxSockets: 4 });

interface Requested {
  /** Resolves with the body, or rejects if the socket dies first. */
  done: Promise<string>;
  /** Resolves once the server has the request in hand. */
  arrived: Promise<void>;
}

function request(port: number, path = '/'): Requested {
  let markArrived: () => void;
  const arrived = new Promise<void>((resolve) => {
    markArrived = resolve;
  });

  const done = new Promise<string>((resolve, reject) => {
    const req = http.request(
      { port, host: '127.0.0.1', path, agent },
      (res) => {
        markArrived();
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => resolve(body));
        res.on('error', reject);
      },
    );
    req.on('error', reject);
    req.end();
  });

  return { done, arrived };
}

const servers: http.Server[] = [];

function track(server: http.Server): http.Server {
  servers.push(server);
  return server;
}

afterEach(() => {
  agent.destroy();
  for (const server of servers.splice(0)) {
    server.closeAllConnections?.();
    server.close();
  }
});

describe('closeServer', () => {
  it('resolves although an idle keep-alive socket is still open', async () => {
    const server = track(
      http.createServer((_req, res) => {
        res.writeHead(200, { 'content-type': 'text/plain' });
        res.end('ok');
      }),
    );
    const port = await listen(server);

    // The response completes, but the agent keeps the socket for reuse. A bare
    // `server.close()` would now wait for the client to give it up.
    await expect(request(port).done).resolves.toBe('ok');

    const started = Date.now();
    await closeServer(server, 30_000);

    // Resolved on its own, well inside the timeout it was given.
    expect(Date.now() - started).toBeLessThan(1_000);
  });

  /**
   * Also the regression test for sweeping idle sockets repeatedly rather than
   * once. Node keeps answering `Connection: keep-alive` after `close()`, so
   * this socket goes back to idle *after* the first sweep; with a single sweep
   * the shutdown never completes and only the force deadline ends it.
   */
  it('lets an in-flight request finish', async () => {
    let respond: (() => void) | undefined;

    const server = track(
      http.createServer((_req, res) => {
        respond = () => {
          res.writeHead(200, { 'content-type': 'text/plain' });
          res.end('finished');
        };
      }),
    );
    const port = await listen(server);

    const inFlight = request(port);
    // Wait until the handler is running, so the shutdown really does overlap it.
    await new Promise<void>((resolve) => {
      const tick = setInterval(() => {
        if (respond) {
          clearInterval(tick);
          resolve();
        }
      }, 5);
    });

    let closed = false;
    const closing = closeServer(server, 5_000).then(() => {
      closed = true;
    });

    // Still draining: the request has not been answered yet.
    await new Promise((resolve) => {
      setTimeout(resolve, 50);
    });
    expect(closed).toBe(false);

    respond!();

    await expect(inFlight.done).resolves.toBe('finished');
    await closing;
    expect(closed).toBe(true);
  });

  it('forces the remaining sockets shut once the timeout runs out', async () => {
    // A handler that never answers -- the case a deadline exists for.
    const server = track(http.createServer(() => undefined));
    const port = await listen(server);

    const stuck = request(port);
    await new Promise((resolve) => {
      setTimeout(resolve, 50);
    });

    const started = Date.now();
    await closeServer(server, 150);
    const elapsed = Date.now() - started;

    expect(elapsed).toBeGreaterThanOrEqual(140);
    expect(elapsed).toBeLessThan(3_000);
    await expect(stuck.done).rejects.toThrow();
  });

  it('forces immediately when the timeout is 0', async () => {
    const server = track(http.createServer(() => undefined));
    const port = await listen(server);

    const stuck = request(port);
    await new Promise((resolve) => {
      setTimeout(resolve, 50);
    });

    const started = Date.now();
    await closeServer(server, 0);

    expect(Date.now() - started).toBeLessThan(200);
    await expect(stuck.done).rejects.toThrow();
  });

  it('is idempotent, so overlapping shutdown paths do not throw', async () => {
    const server = track(http.createServer((_req, res) => res.end('ok')));
    await listen(server);

    await closeServer(server, 1_000);
    await expect(closeServer(server, 1_000)).resolves.toBeUndefined();
  });
});

describe('nodeAdapter listen().close()', () => {
  it('drains through the adapter, honouring ctx.shutdownTimeout', async () => {
    const app = await nodeAdapter.createApp({
      command: 'serve',
      host: '127.0.0.1',
      port: 0,
      base: '/',
      proxy: [],
      logger: { error: () => undefined },
      shutdownTimeout: 150,
      // Never answers, so only the deadline can end the shutdown.
      handler: () => new Promise<Response>(() => undefined),
      configureServer: ({ app: hono }) => {
        expect(hono).toBeInstanceOf(Hono);
      },
    });

    const listened = await app.listen!();

    const stuck = request(listened.port);
    await new Promise((resolve) => {
      setTimeout(resolve, 50);
    });

    const started = Date.now();
    await listened.close();
    const elapsed = Date.now() - started;

    expect(elapsed).toBeGreaterThanOrEqual(140);
    expect(elapsed).toBeLessThan(3_000);
    await expect(stuck.done).rejects.toThrow();
  });
});
