import * as http from 'node:http';
import * as net from 'node:net';
import * as crypto from 'node:crypto';
import type { Duplex } from 'node:stream';
import type { AddressInfo, Socket } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { forwardUpgrade } from '../upgrade';

const listen = (server: http.Server) =>
  new Promise<number>((resolve) => {
    server.listen(0, '127.0.0.1', () =>
      resolve((server.address() as AddressInfo).port),
    );
  });

const accept = (key: string) =>
  crypto
    .createHash('sha1')
    .update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
    .digest('base64');

describe('forwardUpgrade', () => {
  let upstream: http.Server;
  let proxy: http.Server;
  let proxyPort: number;
  let upstreamSawHost: string | undefined;
  const open = new Set<Socket | Duplex>();

  beforeAll(async () => {
    upstream = http.createServer((_req, res) => {
      res.writeHead(426, { 'content-type': 'text/plain' });
      res.end('upgrade required');
    });

    upstream.on('upgrade', (req, socket, head) => {
      open.add(socket);
      upstreamSawHost = req.headers.host;
      socket.write(
        'HTTP/1.1 101 Switching Protocols\r\n' +
          'Upgrade: websocket\r\nConnection: Upgrade\r\n' +
          `Sec-WebSocket-Accept: ${accept(
            req.headers['sec-websocket-key'] as string,
          )}\r\n` +
          `X-Upstream-Path: ${req.url}\r\n\r\n`,
      );
      if (head?.length) socket.unshift(head);
      socket.on('data', (chunk: Buffer) => {
        socket.write(`echo:${chunk.toString()}`);
      });
    });

    const upstreamPort = await listen(upstream);

    proxy = http.createServer((_req, res) => {
      res.writeHead(404);
      res.end();
    });
    proxy.on('upgrade', (req, socket, head) => {
      open.add(socket);
      forwardUpgrade(
        req,
        socket,
        head,
        {
          context: '/ws',
          target: `ws://127.0.0.1:${upstreamPort}`,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/ws/, ''),
        },
        () => undefined,
      );
    });
    proxyPort = await listen(proxy);
  });

  afterAll(async () => {
    open.forEach((socket) => socket.destroy());
    await new Promise((r) => proxy.close(r));
    await new Promise((r) => upstream.close(r));
  });

  const upgrade = (pathname: string, send?: string) =>
    new Promise<{
      status?: number;
      headers: http.IncomingHttpHeaders;
      echoed?: string;
    }>((resolve, reject) => {
      const request = http.request({
        host: '127.0.0.1',
        port: proxyPort,
        path: pathname,
        headers: {
          Connection: 'Upgrade',
          Upgrade: 'websocket',
          'Sec-WebSocket-Key': crypto.randomBytes(16).toString('base64'),
          'Sec-WebSocket-Version': '13',
        },
      });
      const timer = setTimeout(
        () => reject(new Error('no answer within 3s')),
        3000,
      );

      request.on('upgrade', (res, socket) => {
        open.add(socket);
        if (!send) {
          clearTimeout(timer);
          socket.destroy();
          resolve({ status: res.statusCode, headers: res.headers });
          return;
        }
        socket.once('data', (chunk: Buffer) => {
          clearTimeout(timer);
          socket.destroy();
          resolve({
            status: res.statusCode,
            headers: res.headers,
            echoed: chunk.toString(),
          });
        });
        socket.write(send);
      });

      request.on('response', (res) => {
        clearTimeout(timer);
        request.destroy();
        resolve({ status: res.statusCode, headers: res.headers });
      });
      request.on('error', (error) => {
        clearTimeout(timer);
        reject(error);
      });
      request.end();
    });

  it('completes the handshake and relays the upstream headers verbatim', async () => {
    const result = await upgrade('/ws/socket');
    expect(result.status).toBe(101);
    expect(result.headers.upgrade).toBe('websocket');
    expect(result.headers['sec-websocket-accept']).toBeTypeOf('string');
  });

  it('applies rewrite to the path the upstream sees', async () => {
    const result = await upgrade('/ws/socket');
    expect(result.headers['x-upstream-path']).toBe('/socket');
  });

  it('applies changeOrigin to the Host header', async () => {
    await upgrade('/ws/socket');
    expect(upstreamSawHost).toBe(
      `127.0.0.1:${(upstream.address() as AddressInfo).port}`,
    );
  });

  it('carries data in both directions after the handshake', async () => {
    // The half `http-proxy` used to do for free. A 101 that cannot carry a
    // frame is not a forwarded socket.
    const result = await upgrade('/ws/socket', 'ping');
    expect(result.echoed).toBe('echo:ping');
  });

  it('relays a refusal instead of leaving the client waiting', async () => {
    const refusing = http.createServer((_req, res) => {
      res.writeHead(426, { 'content-type': 'text/plain' });
      res.end('upgrade required');
    });
    const refusingPort = await listen(refusing);

    const relay = http.createServer();
    relay.on('upgrade', (req, socket, head) => {
      open.add(socket);
      forwardUpgrade(
        req,
        socket,
        head,
        { context: '/ws', target: `http://127.0.0.1:${refusingPort}` },
        () => undefined,
      );
    });
    const relayPort = await listen(relay);

    const answer = await new Promise<string>((resolve, reject) => {
      const socket = net.connect(relayPort, '127.0.0.1', () => {
        socket.write(
          'GET /ws/socket HTTP/1.1\r\nHost: localhost\r\n' +
            'Connection: Upgrade\r\nUpgrade: websocket\r\n' +
            `Sec-WebSocket-Key: ${crypto
              .randomBytes(16)
              .toString('base64')}\r\n` +
            'Sec-WebSocket-Version: 13\r\n\r\n',
        );
      });
      const timer = setTimeout(
        () => reject(new Error('no answer within 3s')),
        3000,
      );
      socket.once('data', (chunk: Buffer) => {
        clearTimeout(timer);
        socket.destroy();
        resolve(chunk.toString());
      });
      socket.on('error', reject);
    });

    expect(answer).toMatch(/^HTTP\/1\.1 426 /);
    expect(answer).toContain('upgrade required');

    await new Promise((r) => relay.close(r));
    await new Promise((r) => refusing.close(r));
  });
});
