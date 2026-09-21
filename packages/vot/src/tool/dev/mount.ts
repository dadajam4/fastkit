import type { IncomingMessage, ServerResponse } from 'node:http';
import type { NextHandleFunction } from 'connect';
import { getRequestListener } from '@hono/node-server';
import type { VotAdapterApp } from '../../schema/adapter';
import { isDeclined } from '../../internal/serve/handler';
import { KEEP_STANDARD_GLOBALS } from '../../internal/hono-globals';

/** Thrown to make the listener give up without touching the response. */
const DECLINE = Symbol('vot.decline');
/** Set on the response so the middleware knows to call `next()`. */
const DECLINED = Symbol('vot.declined');

/**
 * Mount a vot application inside Vite's connect stack.
 *
 * **This has to be installed from a `configureServer` post-hook** -- the
 * function a Vite plugin returns from that hook -- and not by calling
 * `server.middlewares.use()` directly. Anywhere later puts it behind Vite's
 * HTML fallback, which answers every page request with `index.html`, and the
 * catch-all never runs at all.
 */
export function createDevMiddleware(
  app: VotAdapterApp<any>,
): NextHandleFunction {
  const listener = getRequestListener(
    async (request, env) => {
      const response = await app.app.fetch(request, env);
      if (!isDeclined(response)) return response;
      (env.outgoing as ServerResponse & { [DECLINED]?: boolean })[DECLINED] =
        true;
      throw DECLINE;
    },
    {
      ...KEEP_STANDARD_GLOBALS,
      /**
       * Returning nothing is how the listener is told to give up: it returns
       * without having written anything to the response, which leaves it
       * untouched for whatever connect runs next.
       */
      errorHandler: (error) => {
        if (error === DECLINE) return;
        return new Response(null, { status: 500 });
      },
    },
  );

  return function votDevMiddleware(req, res, next) {
    /**
     * Vite's HTML fallback has already rewritten `url` to `/index.html` by the
     * time this runs; only `originalUrl` still says what was asked for. The
     * listener builds its `Request` from `url`, so without this every page
     * would render as the index route.
     */
    const rewritten = req.url;
    const { originalUrl } = req as IncomingMessage & { originalUrl?: string };
    if (originalUrl !== undefined) req.url = originalUrl;

    const restore = () => {
      req.url = rewritten;
    };

    listener(req, res).then(
      () => {
        if (!(res as ServerResponse & { [DECLINED]?: boolean })[DECLINED])
          return;
        // Put it back, so whatever runs next sees what it expected.
        restore();
        next();
      },
      (error) => {
        restore();
        next(error);
      },
    );
  };
}
