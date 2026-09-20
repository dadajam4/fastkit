import type { IncomingMessage, ServerResponse } from 'node:http';

export type { ParseOptions, SerializeOptions } from 'cookie';

export type CookiesBrowserContext = Document;

export interface CookiesNodeContext {
  req?: IncomingMessage;
  res?: ServerResponse;
}

/**
 * Context for runtimes that speak the web-standard Fetch API instead of
 * `node:http` — Workers, Deno, Bun, or a Node server that has already lifted
 * the request into a {@link Request}.
 *
 * Both members are optional, and a context may carry only the half it needs:
 * `request` alone for a read-only context, `headers` alone for a writer.
 */
export interface CookiesWebContext {
  /**
   * Request the cookies are read from, through `request.headers.get('cookie')`.
   */
  request?: Request;
  /**
   * Response headers the cookies are written to, through
   * `headers.append('set-cookie', ...)`.
   *
   * Unlike a {@link CookiesNodeContext}, there is no `writableEnded` equivalent
   * to check here: whether the response has already been sent is known to the
   * transport layer, not to a bag of headers.
   */
  headers?: Headers;
}

export type CookiesServerContext = CookiesNodeContext | CookiesWebContext;

export type CookiesContext = CookiesBrowserContext | CookiesServerContext;

export type CookiesBucket = Record<string, string | undefined>;

export interface OnCookiesChangeEvent {
  name: string;
  value: string | undefined;
}

export interface CookiesEventMap {
  change: OnCookiesChangeEvent;
}
