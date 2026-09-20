import { describe, it, expect } from 'vitest';
import type { Cookie } from 'set-cookie-parser';
import {
  serializeCookie,
  createCookie,
  areCookiesEqual,
  isIncomingMessage,
  isServerResponse,
  isWebRequest,
  isWebHeaders,
  getSetCookies,
} from '../helpers';

describe('serializeCookie', () => {
  it('serializes a bare cookie', () => {
    expect(serializeCookie('a', 'b')).toBe('a=b');
  });

  it('URL-encodes the value by default', () => {
    expect(serializeCookie('data', 'a b/c=d')).toBe('data=a%20b%2Fc%3Dd');
  });

  it('applies a custom encode instead of the default one', () => {
    // Guards the cookie@2 migration: `encode` belongs to the second argument of
    // `stringifySetCookie`, so folding it into the cookie attributes would
    // silently fall back to the default encoder.
    expect(
      serializeCookie('data', 'A B', { encode: (v) => v.replace(/ /g, '_') }),
    ).toBe('data=A_B');
  });

  it('never emits `encode` as an attribute', () => {
    expect(serializeCookie('a', 'b', { encode: (v) => v })).not.toMatch(
      /encode/i,
    );
  });

  it.each([
    [{ path: '/' }, 'a=b; Path=/'],
    [{ httpOnly: true }, 'a=b; HttpOnly'],
    [{ secure: true }, 'a=b; Secure'],
    [{ maxAge: 3600 }, 'a=b; Max-Age=3600'],
    [{ domain: 'example.com' }, 'a=b; Domain=example.com'],
    [{ partitioned: true }, 'a=b; Partitioned'],
    [{ priority: 'high' as const }, 'a=b; Priority=High'],
    [{ sameSite: 'lax' as const }, 'a=b; SameSite=Lax'],
    [{ sameSite: 'strict' as const }, 'a=b; SameSite=Strict'],
    [{ sameSite: 'none' as const }, 'a=b; SameSite=None'],
    [{ sameSite: true }, 'a=b; SameSite=Strict'],
    [
      { expires: new Date('2030-01-01T00:00:00Z') },
      'a=b; Expires=Tue, 01 Jan 2030 00:00:00 GMT',
    ],
  ])('serializes %o', (options, expected) => {
    expect(serializeCookie('a', 'b', options)).toBe(expected);
  });

  it('serializes an empty value', () => {
    expect(serializeCookie('a', '', { maxAge: -1 })).toBe('a=; Max-Age=-1');
  });

  it('rejects an invalid value', () => {
    expect(() => serializeCookie('a', 'b c', { encode: (v) => v })).toThrow(
      TypeError,
    );
  });
});

describe('createCookie', () => {
  it('defaults sameSite to lax', () => {
    expect(createCookie('a', 'b')).toEqual({
      name: 'a',
      value: 'b',
      sameSite: 'lax',
    });
  });

  it.each([
    [true, 'strict'],
    [false, 'lax'],
    [undefined, 'lax'],
    ['none' as const, 'none'],
  ])('normalizes sameSite %s to %s', (input, expected) => {
    expect(createCookie('a', 'b', { sameSite: input }).sameSite).toBe(expected);
  });

  it('strips encode from the attributes', () => {
    expect(createCookie('a', 'b', { encode: (v) => v })).not.toHaveProperty(
      'encode',
    );
  });
});

describe('areCookiesEqual', () => {
  const cookie = (props: Partial<Cookie>): Cookie =>
    ({ name: 'a', value: 'b', ...props }) as Cookie;

  it('ignores the value, since a cookie with the same key is overwritten', () => {
    expect(
      areCookiesEqual(
        cookie({ value: 'old', path: '/', sameSite: 'lax' }),
        cookie({ value: 'new', path: '/', sameSite: 'lax' }),
      ),
    ).toBe(true);
  });

  it('compares sameSite case-insensitively', () => {
    expect(
      areCookiesEqual(cookie({ sameSite: 'Lax' }), cookie({ sameSite: 'lax' })),
    ).toBe(true);
  });

  it.each([
    ['name', cookie({ name: 'other' })],
    ['path', cookie({ path: '/other' })],
    ['domain', cookie({ domain: 'other.example.com' })],
    ['sameSite', cookie({ sameSite: 'strict' })],
  ])('treats a differing %s as a different cookie', (_label, other) => {
    expect(areCookiesEqual(cookie({}), other)).toBe(false);
  });
});

describe('isWebRequest', () => {
  it('accepts a web-standard Request', () => {
    expect(isWebRequest(new Request('https://example.com/'))).toBe(true);
  });

  it('accepts a request-like object carrying a Headers', () => {
    expect(isWebRequest({ headers: new Headers() })).toBe(true);
  });

  it.each([
    ['an IncomingMessage-like object', { headers: { cookie: 'a=b' } }],
    ['an object without headers', {}],
    ['null', null],
    ['undefined', undefined],
  ])('rejects %s', (_label, source) => {
    expect(isWebRequest(source)).toBe(false);
  });

  it('is the check the Node guards cannot stand in for', () => {
    // `isIncomingMessage` starts from `isObject`, which asks for
    // `[object Object]`. A `Request` stringifies to `[object Request]`, so it
    // used to fall through every branch and read no cookies at all.
    const request = new Request('https://example.com/');
    expect(isIncomingMessage(request)).toBe(false);
    expect(isWebRequest(request)).toBe(true);
  });
});

describe('isWebHeaders', () => {
  it('accepts a web-standard Headers', () => {
    expect(isWebHeaders(new Headers())).toBe(true);
  });

  it.each([
    ['a plain header record', { cookie: 'a=b' }],
    ['an object with only append', { append: () => undefined }],
    ['null', null],
    ['undefined', undefined],
  ])('rejects %s', (_label, source) => {
    expect(isWebHeaders(source)).toBe(false);
  });

  it('is the check the Node guards cannot stand in for', () => {
    const headers = new Headers();
    expect(isServerResponse(headers)).toBe(false);
    expect(isWebHeaders(headers)).toBe(true);
  });
});

describe('getSetCookies', () => {
  it('returns one entry per cookie', () => {
    const headers = new Headers();
    headers.append('set-cookie', 'a=1; Path=/');
    headers.append('set-cookie', 'b=2; Path=/');
    expect(getSetCookies(headers)).toEqual(['a=1; Path=/', 'b=2; Path=/']);
  });

  it('is empty when nothing has been set', () => {
    expect(getSetCookies(new Headers())).toEqual([]);
  });

  it('splits a joined value when getSetCookie() is unavailable', () => {
    const headers = {
      get: () => 'a=1; Expires=Tue, 01 Jan 2030 00:00:00 GMT, b=2; Path=/',
    } as unknown as Headers;
    expect(getSetCookies(headers)).toEqual([
      'a=1; Expires=Tue, 01 Jan 2030 00:00:00 GMT',
      'b=2; Path=/',
    ]);
  });
});
