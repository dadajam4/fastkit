import { parse, serialize } from 'cookie';
import * as setCookieParser from 'set-cookie-parser';
import type { Cookie } from 'set-cookie-parser';
import {
  CookiesContext,
  CookieParseOptions,
  CookiesBucket,
  CookieSerializeOptions,
  CookiesEventMap,
} from './schemes';
import { EV } from '@fastkit/ev';
import { IN_DOCUMENT } from '@fastkit/helpers';
import {
  isCookiesBrowserContext,
  isIncomingMessage,
  isServerResponse,
  createCookie,
  areCookiesEqual,
} from './helpers';
import { logger, CookiesError } from './logger';

export interface CookiesOptions extends CookieParseOptions {
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
    Object.assign(this.bucket, cookies);
  }

  parse(options?: CookieParseOptions): CookiesBucket {
    const { ctx } = this;
    let cookieString: string;
    if (isCookiesBrowserContext(ctx)) {
      cookieString = ctx.cookie;
    } else if (isIncomingMessage(ctx.req)) {
      cookieString = ctx.req.headers.cookie || '';
    } else {
      return {};
    }
    return parse(cookieString, options || this.options);
  }

  get(name: string): string | undefined {
    return this.bucket[name];
  }

  set(name: string, value: string, options?: CookieSerializeOptions): void {
    if (value === '' || value == null) {
      return this.delete(name);
    }
    const { ctx } = this;
    if (isCookiesBrowserContext(ctx)) {
      if (options && options.httpOnly) {
        throw new CookiesError('Can not set a httpOnly cookie in the browser.');
      }
      ctx.cookie = serialize(name, value, options);
    } else if (isServerResponse(ctx.res)) {
      const { res } = ctx;

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

      /**
       * Parse cookies but ignore values - we've already encoded
       * them in the previous call.
       */
      const parsedCookies = setCookieParser.parse(cookies, {
        decodeValues: false,
      });

      /**
       * We create the new cookie and make sure that none of
       * the existing cookies match it.
       */
      const newCookie = createCookie(name, value, options);
      const cookiesToSet: string[] = [];

      parsedCookies.forEach((parsedCookie: Cookie) => {
        if (!areCookiesEqual(parsedCookie, newCookie)) {
          /**
           * We serialize the cookie back to the original format
           * if it isn't the same as the new one.
           */
          const serializedCookie = serialize(
            parsedCookie.name,
            parsedCookie.value,
            {
              // we prevent reencoding by default, but you might override it
              encode: (val: string) => val,
              ...(parsedCookie as CookieSerializeOptions),
            },
          );
          cookiesToSet.push(serializedCookie);
        }
      });
      cookiesToSet.push(serialize(name, value, options));

      // Update the header.
      res.setHeader('Set-Cookie', cookiesToSet);
    }
    this.update({ [name]: value });
  }

  delete(name: string, options?: CookieSerializeOptions) {
    /**
     * We forward the request destroy to setCookie function
     * as it is the same function with modified maxAge value.
     */
    return this.set(name, '', { ...(options || {}), maxAge: -1 });
  }
}
