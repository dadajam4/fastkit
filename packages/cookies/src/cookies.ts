import { parseCookie } from 'cookie';
import { EV } from '@fastkit/ev';
import { IN_DOCUMENT } from '@fastkit/helpers';
import {
  CookiesContext,
  CookiesNodeContext,
  CookiesWebContext,
  ParseOptions,
  CookiesBucket,
  SerializeOptions,
  CookiesEventMap,
} from './schema';
import {
  isCookiesBrowserContext,
  isIncomingMessage,
  isServerResponse,
  isWebRequest,
  isWebHeaders,
  getSetCookies,
  mergeSetCookies,
  serializeCookie,
} from './helpers';
import { logger, CookiesError } from './logger';

/**
 * A server context with every member of both halves in view.
 *
 * `CookiesServerContext` is a union, so reaching for `req` or `request`
 * through it would need a narrowing step that says nothing: the members the
 * context does not carry are simply `undefined`, and the `is*` guards below
 * are what actually decide which branch runs.
 */
type AnyServerContext = CookiesNodeContext & CookiesWebContext;

export interface CookiesOptions extends ParseOptions {
  bucket?: CookiesBucket;
}

export class Cookies extends EV<CookiesEventMap> {
  readonly ctx: CookiesContext;

  readonly options?: CookiesOptions;

  readonly bucket: CookiesBucket;

  constructor(ctx?: CookiesContext, options?: CookiesOptions) {
    super();

    if (!ctx) {
      if (IN_DOCUMENT) {
        ctx = document;
      } else {
        throw new CookiesError(
          'A context object is required to use Cookies in a server environment.',
        );
      }
    }

    this.ctx = ctx;
    this.options = options;
    this.bucket = (options && options.bucket) || {};
    this.update(this.parse());

    this.get = this.get.bind(this);
    this.set = this.set.bind(this);
    this.delete = this.delete.bind(this);
  }

  private update(cookies: CookiesBucket) {
    const { bucket } = this;
    Object.entries(cookies).forEach(([name, value]) => {
      const newValue: string | undefined =
        value === '' || value == null ? undefined : value;

      if (newValue == null) {
        if (bucket[name] == null) return;
        delete bucket[name];
        this.emit('change', { name, value: newValue });
      } else if (bucket[name] !== value) {
        bucket[name] = value;
        this.emit('change', { name, value: newValue });
      }
    });
  }

  parse(options?: ParseOptions): CookiesBucket {
    const { ctx } = this;
    let cookieString: string;
    if (isCookiesBrowserContext(ctx)) {
      cookieString = ctx.cookie;
    } else {
      const { req, request } = ctx as AnyServerContext;
      if (isIncomingMessage(req)) {
        cookieString = req.headers.cookie || '';
      } else if (isWebRequest(request)) {
        cookieString = request.headers.get('cookie') || '';
      } else {
        return {};
      }
    }
    return parseCookie(cookieString, options || this.options);
  }

  get(name: string): string | undefined {
    return this.bucket[name];
  }

  set(name: string, value: string, options?: SerializeOptions): void {
    if (value === '' || value == null) {
      return this.delete(name, options);
    }
    this.write(name, value, options);
  }

  private write(name: string, value: string, options?: SerializeOptions): void {
    const { ctx } = this;
    if (isCookiesBrowserContext(ctx)) {
      if (options && options.httpOnly) {
        throw new CookiesError('Can not set a httpOnly cookie in the browser.');
      }
      ctx.cookie = serializeCookie(name, value, options);
      this.update({ [name]: value });
      return;
    }

    const { res, headers } = ctx as AnyServerContext;

    if (isServerResponse(res)) {
      // Check if response has finished and warn about it.
      if (res.writableEnded) {
        logger.warn(`Not setting "${name}" cookie. Response has finished.`);
        logger.warn(`You should set cookie before res.send()`);
        return;
      }

      /**
       * Load existing cookies from the header and parse them.
       */
      let cookies = res.getHeader('Set-Cookie') || [];

      if (typeof cookies === 'string') cookies = [cookies];
      if (typeof cookies === 'number') cookies = [];

      // Update the header.
      res.setHeader(
        'Set-Cookie',
        mergeSetCookies(cookies, name, value, options),
      );
    } else if (isWebHeaders(headers)) {
      /**
       * `Headers` only appends, so the whole `Set-Cookie` set is rewritten:
       * dropping an entry is the point of the merge, and there is no other way
       * to take one back out.
       */
      const cookiesToSet = mergeSetCookies(
        getSetCookies(headers),
        name,
        value,
        options,
      );
      headers.delete('set-cookie');
      cookiesToSet.forEach((cookie) => headers.append('set-cookie', cookie));
    }

    this.update({ [name]: value });
  }

  delete(name: string, options?: SerializeOptions): void {
    /**
     * Deleting is the same write with an expired maxAge. It has to go straight
     * to `write()` rather than back through `set()`, since the empty value
     * would be routed right back here.
     */
    this.write(name, '', { ...(options || {}), maxAge: -1 });
  }
}
