import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { Hono } from 'hono';
import { createAdaptorServer } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { RESPONSE_ALREADY_SENT } from '@hono/node-server/utils/response';
import chalk from 'chalk';
import type {
  VotServerAdapter,
  VotAdapterApp,
  VotAdapterContext,
  VotListenResult,
  VotRuntimeContext,
} from '../../schema/adapter';
import {
  proxyMiddleware,
  warnUnsupportedProxyRules,
} from '../../internal/serve/proxy';
import {
  declineResponse,
  isDeclined,
  VOT_DECLINE_HEADER,
} from '../../internal/serve/handler';
import { matchProxyRule, ruleForwardsWebSocket } from '../../schema/proxy';
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
    const server = createAdaptorServer({ fetch: app.fetch });

    /**
     * The `upgrade` listener is installed before `listen()`, not after. It used
     * to be handed a server that did not exist until `listen()` had been
     * called, so a `ws: true` rule worked under `vot dev` and silently did
     * nothing in production (#236, #254).
     */
    const wsRules = ctx.proxy.filter(ruleForwardsWebSocket);
    if (wsRules.length) {
      server.on('upgrade', (req, socket, head) => {
        const rule = matchProxyRule(wsRules, req.url || '');
        if (!rule) return;
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
      close: () =>
        new Promise<void>((resolve, reject) => {
          server.close((error) => (error ? reject(error) : resolve()));
        }),
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
