import { CookiesBrowserContext, CookieSerializeOptions } from './schemes';
import type {
  IncomingMessage,
  IncomingHttpHeaders,
  ServerResponse,
} from 'node:http';
import type { Cookie } from 'set-cookie-parser';
import { isObject } from '@fastkit/helpers';

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
 * Create an instance of the Cookie interface
 */
export function createCookie(
  name: string,
  value: string,
  options: CookieSerializeOptions = {},
): Cookie {
  let sameSite = options.sameSite;
  if (sameSite === true) {
    sameSite = 'strict';
  }
  if (sameSite === undefined || sameSite === false) {
    sameSite = 'lax';
  }
  const cookieToSet = { ...options, sameSite };
  delete cookieToSet.encode;
  return {
    name: name,
    value: value,
    ...cookieToSet,
  };
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
 * @param a first Cookie for comparison
 * @param b second Cookie for comparison
 */
export function areCookiesEqual(a: Cookie, b: Cookie) {
  let sameSiteSame = a.sameSite === b.sameSite;
  if (typeof a.sameSite === 'string' && typeof b.sameSite === 'string') {
    sameSiteSame = a.sameSite.toLowerCase() === b.sameSite.toLowerCase();
  }

  return (
    hasSameProperties(
      { ...a, sameSite: undefined },
      { ...b, sameSite: undefined },
    ) && sameSiteSame
  );
}
