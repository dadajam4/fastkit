import type {
  IncomingMessage,
  IncomingHttpHeaders,
  ServerResponse,
} from 'node:http';
import { stringifySetCookie } from 'cookie';
import * as setCookieParser from 'set-cookie-parser';
import type { Cookie } from 'set-cookie-parser';
import { isObject } from '@fastkit/helpers';
import { CookiesBrowserContext, SerializeOptions } from './schema';

export function isCookiesBrowserContext(
  source: any,
): source is CookiesBrowserContext {
  return typeof Document !== 'undefined' && source instanceof Document;
}

export function isIncomingHttpHeaders(
  source: any,
): source is IncomingHttpHeaders {
  return isObject(source);
}

export function isIncomingMessage(source: any): source is IncomingMessage {
  return (
    isObject(source) &&
    isIncomingHttpHeaders((source as unknown as IncomingMessage).headers)
  );
}

export function isServerResponse(source: any): source is ServerResponse {
  const target = source as unknown as ServerResponse;
  return (
    isObject(target) &&
    typeof target.setHeader === 'function' &&
    typeof target.writableEnded === 'boolean'
  );
}

/**
 * Tells whether the given value is a web-standard {@link Request}.
 *
 * The check is duck-typed on purpose. {@link isIncomingMessage} and
 * {@link isServerResponse} are built on `isObject`, which asks for
 * `[object Object]` — a `Request` stringifies to `[object Request]` and would
 * be rejected by it. Duck-typing also accepts the request-like objects that
 * server frameworks hand out in place of the global.
 */
export function isWebRequest(source: any): source is Request {
  return typeof source?.headers?.get === 'function';
}

/**
 * Tells whether the given value is a web-standard {@link Headers}.
 *
 * Duck-typed for the same reason as {@link isWebRequest}.
 */
export function isWebHeaders(source: any): source is Headers {
  return (
    typeof source?.append === 'function' && typeof source?.get === 'function'
  );
}

/**
 * Read the `Set-Cookie` values a {@link Headers} already carries, as one entry
 * per cookie.
 *
 * `getSetCookie()` is the only way to get that split reliably, so it is used
 * whenever the implementation has it. The fallback exists for the older
 * polyfills that predate it, where `get('set-cookie')` returns every cookie
 * joined by commas — which `splitCookiesString` knows how to take apart again.
 */
export function getSetCookies(headers: Headers): string[] {
  if (typeof headers.getSetCookie === 'function') {
    return headers.getSetCookie();
  }
  const raw = headers.get('set-cookie');
  return raw ? setCookieParser.splitCookiesString(raw) : [];
}

/**
 * Resolve `sameSite` to the value a browser would apply, so that a cookie
 * parsed out of a `Set-Cookie` header and one built from `SerializeOptions` can
 * be compared on equal terms.
 */
function normalizeSameSite(sameSite: boolean | string | undefined): string {
  if (sameSite === true) return 'strict';
  if (sameSite == null || sameSite === false) return 'lax';
  return sameSite.toLowerCase();
}

/**
 * Create an instance of the Cookie interface
 */
export function createCookie(
  name: string,
  value: string,
  options: SerializeOptions = {},
): Cookie {
  const cookieToSet = {
    ...options,
    sameSite: normalizeSameSite(options.sameSite),
  };
  delete cookieToSet.encode;
  return {
    name,
    value,
    ...cookieToSet,
  };
}

/**
 * Serialize a cookie into a `Set-Cookie` header value.
 *
 * cookie@2 dropped the `serialize(name, value, options)` signature in favour of
 * object mode, and `encode` now lives in a separate argument instead of being
 * mixed in with the cookie attributes.
 */
export function serializeCookie(
  name: string,
  value: string,
  options: SerializeOptions = {},
): string {
  const { encode, ...attributes } = options;
  return stringifySetCookie({ ...attributes, name, value }, { encode });
}

type Dict<T = any> = { [key: string]: T };

/**
 * Tells whether given objects have the same properties.
 */
export function hasSameProperties(a: Dict, b: Dict) {
  const aProps = Object.getOwnPropertyNames(a);
  const bProps = Object.getOwnPropertyNames(b);

  if (aProps.length !== bProps.length) {
    return false;
  }

  for (let i = 0; i < aProps.length; i++) {
    const propName = aProps[i];

    if (a[propName] !== b[propName]) {
      return false;
    }
  }

  return true;
}
/**
 * Compare the cookie and return true if the cookies have equivalent
 * options and the cookies would be overwritten in the browser storage.
 *
 * The value is deliberately excluded: a cookie is overwritten based on its key
 * and attributes, so two cookies that differ only in value are the same cookie
 * and re-sending the old one would be redundant. `sameSite` is compared through
 * {@link normalizeSameSite} because one side typically comes from a parsed
 * header and the other from {@link createCookie}.
 *
 * @param a first Cookie for comparison
 * @param b second Cookie for comparison
 */
export function areCookiesEqual(a: Cookie, b: Cookie) {
  return (
    hasSameProperties(
      { ...a, value: undefined, sameSite: undefined },
      { ...b, value: undefined, sameSite: undefined },
    ) && normalizeSameSite(a.sameSite) === normalizeSameSite(b.sameSite)
  );
}

/**
 * Merge a new cookie into the `Set-Cookie` values a response already carries.
 *
 * Every existing entry is serialized back as it was, except the one the new
 * cookie would overwrite in the browser — {@link areCookiesEqual} decides that,
 * and the match is dropped so the header never ships two cookies that the
 * browser would collapse into one anyway.
 *
 * Values are parsed with `decodeValues: false`: they were encoded on the way
 * in, and decoding them here would only mean encoding them again below.
 */
export function mergeSetCookies(
  existing: string[],
  name: string,
  value: string,
  options?: SerializeOptions,
): string[] {
  const parsedCookies = setCookieParser.parse(existing, {
    decodeValues: false,
  });
  const newCookie = createCookie(name, value, options);
  const cookiesToSet: string[] = [];

  parsedCookies.forEach((parsedCookie: Cookie) => {
    if (!areCookiesEqual(parsedCookie, newCookie)) {
      cookiesToSet.push(
        serializeCookie(parsedCookie.name, parsedCookie.value, {
          // we prevent reencoding by default, but you might override it
          encode: (val: string) => val,
          ...(parsedCookie as SerializeOptions),
        }),
      );
    }
  });
  cookiesToSet.push(serializeCookie(name, value, options));

  return cookiesToSet;
}
