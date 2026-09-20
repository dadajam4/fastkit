import * as http from 'node:http';
import * as https from 'node:https';
import type { Duplex } from 'node:stream';
import type { ResolvedVotProxyRule } from '../../schema/proxy';

/**
 * Forward a WebSocket upgrade to `rule.target` and splice the two sockets.
 *
 * There is no `fetch` equivalent of an upgrade, so this is necessarily written
 * against Node's API and lives here rather than in the render core.
 *
 * `http.request` is what keeps it short: asked to upgrade, it emits its own
 * `upgrade` event with the 101 already parsed and the upstream socket in hand.
 * What is left is to replay that response to the client verbatim and let the
 * two sockets carry each other.
 */
export function forwardUpgrade(
  req: http.IncomingMessage,
  clientSocket: Duplex,
  head: Buffer,
  rule: ResolvedVotProxyRule,
  onError: (error: Error) => void,
): void {
  const target = new URL(rule.target.replace(/^ws/, 'http'));
  const requestPath = req.url as string;
  const path = rule.rewrite ? rule.rewrite(requestPath) : requestPath;

  const headers: http.OutgoingHttpHeaders = { ...req.headers, ...rule.headers };
  if (rule.changeOrigin) headers.host = target.host;

  const secure = target.protocol === 'https:';
  const request = secure ? https.request : http.request;

  const upstream = request({
    hostname: target.hostname,
    port: target.port || (secure ? 443 : 80),
    path: `${target.pathname.replace(/\/$/, '')}${path}`,
    method: req.method,
    headers,
  });

  const fail = (error: Error) => {
    onError(error);
    clientSocket.destroy();
  };

  upstream.on('error', fail);
  clientSocket.on('error', () => upstream.destroy());

  /**
   * Replay a parsed response's status line and headers onto a raw socket.
   *
   * `rawHeaders` rather than `headers`: the client gets what the upstream
   * actually sent, in order and with its own casing, instead of Node's
   * normalized view of it.
   */
  const writeHead = (res: http.IncomingMessage) => {
    const lines = [`HTTP/1.1 ${res.statusCode} ${res.statusMessage}`];
    for (let i = 0; i < res.rawHeaders.length; i += 2) {
      lines.push(`${res.rawHeaders[i]}: ${res.rawHeaders[i + 1]}`);
    }
    clientSocket.write(`${lines.join('\r\n')}\r\n\r\n`);
  };

  // The upstream refused to upgrade. Relay what it said rather than leaving
  // the client waiting for a 101 that is never coming.
  upstream.on('response', (res) => {
    writeHead(res);
    res.pipe(clientSocket);
  });

  upstream.on('upgrade', (res, upstreamSocket, upstreamHead) => {
    upstreamSocket.on('error', () => clientSocket.destroy());
    writeHead(res);

    // Bytes that arrived alongside either handshake belong to the stream that
    // follows it, so they go back on the front of the queue.
    if (upstreamHead?.length) upstreamSocket.unshift(upstreamHead);
    if (head?.length) clientSocket.unshift(head);

    upstreamSocket.pipe(clientSocket);
    clientSocket.pipe(upstreamSocket);
  });

  upstream.end();
}
