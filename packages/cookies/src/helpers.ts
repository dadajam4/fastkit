import type {
  IncomingMessage,
  IncomingHttpHeaders,
  ServerResponse,
} from 'node:http';
import { stringifySetCookie } from 'cookie';
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
