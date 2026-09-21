import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { Hono } from 'hono';
import { createAdaptorServer, type ServerType } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { RESPONSE_ALREADY_SENT } from '@hono/node-server/utils/response';
import chalk from 'chalk';
import {
  DEFAULT_SHUTDOWN_TIMEOUT,
  type VotServerAdapter,
  type VotAdapterApp,
  type VotAdapterContext,
  type VotListenResult,
  type VotRuntimeContext,
} from '../../schema/adapter';
import {
  proxyMiddleware,
  warnUnsupportedProxyRules,
  createHttpOnlyUpgradeWarner,
} from '../../internal/serve/proxy';
import {
  declineResponse,
  isDeclined,
  VOT_DECLINE_HEADER,
} from '../../internal/serve/handler';
import { matchProxyRule, ruleForwardsWebSocket } from '../../schema/proxy';
import { KEEP_STANDARD_GLOBALS } from '../../internal/hono-globals';
import { forwardUpgrade } from './upgrade';

export const NODE_ADAPTER_NAME = 'node';

/**
 * What the node adapter puts in {@link VotRuntimeContext.native}.
 */
export interface VotNodeRuntime {
  incoming: IncomingMessage;
  outgoing: ServerResponse;
}

/**
 * Reach the Node objects a request arrived on.
 *
 * The render core never looks inside `runtime`, so this is the way back to
 * `node:http` for code that knowingly runs on this adapter. It returns
 * `undefined` on every other runtime rather than throwing, so a caller can ask
 * without first knowing the answer.
 */
export function getNodeRuntime(
  runtime: VotRuntimeContext | undefined,
): VotNodeRuntime | undefined {
  if (runtime?.adapter !== NODE_ADAPTER_NAME) return undefined;
  return runtime.native as VotNodeRuntime | undefined;
}

type NodeBindings = { incoming: IncomingMessage; outgoing: ServerResponse };

/**
 * A server whose connections can be managed one class at a time.
 *
 * `createAdaptorServer` may hand back an HTTP/2 server, and those have no
 * connection-level control -- see nodejs/node#55459. Narrowing rather than
 * casting keeps the difference visible at the one place it matters.
 */
type DrainableServer = ServerType & {
  closeIdleConnections(): void;
  closeAllConnections(): void;
};

function isDrainable(server: ServerType): server is DrainableServer {
  return typeof (server as DrainableServer).closeIdleConnections === 'function';
}

/**
 * How often idle connections are swept while a shutdown is draining.
 *
 * Short enough that a socket going idle does not measurably delay the
 * shutdown, long enough to be free.
 */
const IDLE_SWEEP_INTERVAL = 50;

/**
 * Stop listening, then let in-flight requests finish.
 *
 * `server.close()` on its own is not a graceful shutdown. It stops accepting
 * connections, but then waits for *every* open connection to end, and an idle
 * keep-alive socket ends when the client decides it should -- long after an
 * orchestrator's grace period has run out. A process that only calls `close()`
 * does not drain; it hangs until `SIGKILL`.
 *
 * So idle sockets are dropped, because they carry no work, and whatever is
 * still in flight gets `timeout` to finish before the rest are destroyed.
 *
 * The sweep has to repeat rather than run once. Node does **not** switch to
 * `Connection: close` after `server.close()` -- a response sent while draining
 * still carries `connection: keep-alive`, so its socket goes back to idle
 * *after* the first sweep has already been and gone. Dropping idle sockets only
 * at the start therefore leaves exactly the connections a drain is supposed to
 * release, and `close()` never completes.
 *
 * A socket can be swept in the instant between one request finishing and the
 * next arriving on it. That is the intended trade: the server has stopped
 * accepting connections and is on its way out, so a client that tries to reuse
 * the socket should be reconnecting elsewhere rather than being served here.
 */
export function closeServer(
  server: ServerType,
  timeout: number = DEFAULT_SHUTDOWN_TIMEOUT,
): Promise<void> {
  const drainable = isDrainable(server) ? server : undefined;
  const draining = !!drainable && timeout > 0;

  /**
   * Armed before `close()` rather than from inside its callback: the callback
   * cannot fire before this function has returned, so arming here costs
   * nothing and leaves both handles `const` for the callback to clear.
   */
  const sweep = draining
    ? setInterval(() => drainable.closeIdleConnections(), IDLE_SWEEP_INTERVAL)
    : undefined;
  const force = draining
    ? setTimeout(() => drainable.closeAllConnections(), timeout)
    : undefined;

  // Nothing should keep the process alive merely because the drain has not
  // finished yet.
  sweep?.unref?.();
  force?.unref?.();

  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (sweep) clearInterval(sweep);
      if (force) clearTimeout(force);

      /**
       * A server that was already closed reports `ERR_SERVER_NOT_RUNNING`.
       * That is the state the caller asked for, so it resolves rather than
       * throwing -- shutdown paths double up easily and should be idempotent.
       */
      if (
        error &&
        (error as NodeJS.ErrnoException).code !== 'ERR_SERVER_NOT_RUNNING'
      ) {
        reject(error);
        return;
      }
      resolve();
    });

    if (!drainable) return;

    drainable.closeIdleConnections();

    // Nothing is going to wait, so the in-flight sockets go with the idle ones.
    if (!draining) drainable.closeAllConnections();
  });
}

function runtimeFor(bindings: NodeBindings): VotRuntimeContext {
  return { adapter: NODE_ADAPTER_NAME, native: bindings };
}

/**
 * Build the Hono application, in the one order that matters.
 *
 * **proxy, then user middleware, then static assets, then the catch-all.**
 * Proxy rules and user middleware sit at the server root, outside `base`: a
 * health check or a webhook receiver is not part of the application's asset
 * tree, and the same source line has to answer at the same URL under
 * `vot dev` and `vot serve` (#223). Static assets and the catch-all live under
 * `base`, and the catch-all has to come last or it claims everything.
 */
async function createApp(
  ctx: VotAdapterContext<Hono>,
): Promise<VotAdapterApp<Hono>> {
  const app = new Hono();

  if (ctx.proxy.length) {
    warnUnsupportedProxyRules(ctx.proxy, NODE_ADAPTER_NAME, true);
    app.use(proxyMiddleware({ rules: ctx.proxy, logger: ctx.logger }));
  }

  await ctx.configureServer?.({ app });

  if (ctx.static) {
    const { dir, assets } = ctx.static;
    // `serveStatic` resolves `root` against the working directory.
    const root = path.relative(process.cwd(), dir) || '.';
    const prefix = ctx.base === '/' ? '' : ctx.base.slice(0, -1);
    for (const asset of assets) {
      app.use(
        `${prefix}/${asset}/*`,
        serveStatic({
          root,
          rewriteRequestPath: (requestPath) =>
            prefix ? requestPath.slice(prefix.length) : requestPath,
        }),
      );
    }
  }

  app.all('*', async (c) => {
    const bindings = c.env as NodeBindings;
    const response = await ctx.handler(c.req.raw, runtimeFor(bindings));

    /**
     * Something reached past the fetch model and wrote to the socket itself --
     * `vot generate`'s route-table endpoint does exactly that, through the
     * runtime handle. Writing a second response on top of it is
     * `ERR_HTTP_HEADERS_SENT`, so the adapter says so and stops.
     *
     * Only a runtime-specific layer can notice this, which is why it is here
     * rather than in the render core.
     */
    if (bindings.outgoing?.headersSent) return RESPONSE_ALREADY_SENT;

    return response ?? declineResponse();
  });

  // Fires only when nothing matched at all, so a user route that answers 404
  // on purpose still answers 404 rather than being taken for a decline.
  app.notFound(() => declineResponse());

  const fetch = async (request: Request): Promise<Response> => {
    const response = await app.fetch(request);
    if (!isDeclined(response)) return response;
    // Nothing sits behind vot here, so a decline is simply a 404.
    const headers = new Headers(response.headers);
    headers.delete(VOT_DECLINE_HEADER);
    return new Response(null, { status: 404, headers });
  };

  const listen = async (): Promise<VotListenResult> => {
    const server = createAdaptorServer({
      fetch: app.fetch,
      ...KEEP_STANDARD_GLOBALS,
    });

    /**
     * The `upgrade` listener is installed before `listen()`, not after. It used
     * to be handed a server that did not exist until `listen()` had been
     * called, so a `ws: true` rule worked under `vot dev` and silently did
     * nothing in production (#236, #254).
     */
    if (ctx.proxy.length) {
      /**
       * Matched against **every** rule, not only the ones that forward
       * upgrades. Filtering first is what made the mistake invisible: a rule
       * written without `ws: true` was indistinguishable from no rule at all,
       * so the upgrade it should have carried went nowhere and said nothing
       * (#290).
       */
      const warnHttpOnly = createHttpOnlyUpgradeWarner();
      server.on('upgrade', (req, socket, head) => {
        const rule = matchProxyRule(ctx.proxy, req.url || '');

        if (!rule || !ruleForwardsWebSocket(rule)) {
          if (rule) warnHttpOnly(rule);
          /**
           * Destroyed rather than left alone. Node closes an upgrade itself
           * when nothing is listening for one, so installing a listener in
           * order to be able to warn must not turn a closed connection into a
           * socket that hangs until the client gives up.
           */
          socket.destroy();
          return;
        }

        forwardUpgrade(req, socket, head, rule, (error) => {
          ctx.logger.error(
            `${chalk.red('websocket proxy error:')}\n${error.stack}`,
            { timestamp: true, error },
          );
        });
      });
    }

    await new Promise<void>((resolve, reject) => {
      server.once('error', reject);
      server.listen(ctx.port, ctx.host, () => {
        server.off('error', reject);
        resolve();
      });
    });

    const address = server.address();
    const resolved =
      address && typeof address === 'object'
        ? { host: address.address, port: address.port }
        : { host: ctx.host, port: ctx.port };

    return {
      ...resolved,
      native: server,
      close: () => closeServer(server, ctx.shutdownTimeout),
    };
  };

  return { app, fetch, listen };
}

/**
 * The default adapter: Hono on `@hono/node-server`.
 *
 * Everything in this module is Node-only and must stay unreachable from the
 * render core -- `@hono/node-server` names `node:http`, and a build for a
 * runtime without it fails the moment that import becomes reachable.
 */
export const nodeAdapter: VotServerAdapter<Hono> = {
  name: NODE_ADAPTER_NAME,
  supports: { proxyWebSocket: true, listen: true },
  createApp,
};

export default nodeAdapter;
