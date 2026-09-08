import { describe, it, expect, vi } from 'vitest';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { Cookies } from '../cookies';
import type { CookiesServerContext } from '../schema';

function createRequest(cookie = ''): IncomingMessage {
  return { headers: { cookie } } as unknown as IncomingMessage;
}

interface MockResponse {
  res: ServerResponse;
  setCookies: () => string[];
}

function createResponse(existing: string[] = []): MockResponse {
  const headers: Record<string, number | string | string[]> = {};
  if (existing.length) headers['Set-Cookie'] = existing;
  const res = {
    writableEnded: false,
    getHeader: (name: string) => headers[name],
    setHeader: (name: string, value: number | string | string[]) => {
      headers[name] = value;
    },
  } as unknown as ServerResponse;
  return {
    res,
    setCookies: () => (headers['Set-Cookie'] as string[]) || [],
  };
}

function createCookies(cookie = '', existing: string[] = []) {
  const { res, setCookies } = createResponse(existing);
  const ctx: CookiesServerContext = { req: createRequest(cookie), res };
  return { cookies: new Cookies(ctx), setCookies };
}

describe('Cookies', () => {
  describe('parse', () => {
    it('reads cookies from the request header', () => {
      const { cookies } = createCookies('sid=abc; theme=dark');
      expect(cookies.bucket).toEqual({ sid: 'abc', theme: 'dark' });
    });

    it('decodes percent-encoded values', () => {
      const { cookies } = createCookies('data=a%20b');
      expect(cookies.get('data')).toBe('a b');
    });

    it('yields an empty bucket for an absent header', () => {
      const { cookies } = createCookies('');
      expect(cookies.bucket).toEqual({});
    });

    it('returns undefined for an unknown name', () => {
      const { cookies } = createCookies('sid=abc');
      expect(cookies.get('nope')).toBeUndefined();
    });
  });

  describe('set', () => {
    it('writes a Set-Cookie header and updates the bucket', () => {
      const { cookies, setCookies } = createCookies();
      cookies.set('sid', 'abc', { path: '/', httpOnly: true });
      expect(setCookies()).toEqual(['sid=abc; Path=/; HttpOnly']);
      expect(cookies.get('sid')).toBe('abc');
    });

    it('encodes the value', () => {
      const { cookies, setCookies } = createCookies();
      cookies.set('data', 'a b/c=d');
      expect(setCookies()).toEqual(['data=a%20b%2Fc%3Dd']);
    });

    it('emits a change event', () => {
      const { cookies } = createCookies();
      const onChange = vi.fn();
      cookies.on('change', onChange);
      cookies.set('sid', 'abc');
      expect(onChange.mock.calls[0][0]).toEqual({ name: 'sid', value: 'abc' });
    });

    it('keeps unrelated cookies already present on the response', () => {
      const { cookies, setCookies } = createCookies('', [
        'other=1; Path=/; SameSite=Lax',
      ]);
      cookies.set('sid', 'abc', { path: '/', sameSite: 'lax' });
      expect(setCookies()).toEqual([
        'other=1; Path=/; SameSite=Lax',
        'sid=abc; Path=/; SameSite=Lax',
      ]);
    });

    it('replaces a cookie with the same key instead of duplicating it', () => {
      const { cookies, setCookies } = createCookies('', [
        'sid=old; Path=/; SameSite=Lax',
      ]);
      cookies.set('sid', 'new', { path: '/', sameSite: 'lax' });
      expect(setCookies()).toEqual(['sid=new; Path=/; SameSite=Lax']);
    });

    it('does nothing to a finished response', () => {
      const { res, setCookies } = createResponse();
      (res as unknown as { writableEnded: boolean }).writableEnded = true;
      const cookies = new Cookies({ req: createRequest(), res });
      cookies.set('sid', 'abc');
      expect(setCookies()).toEqual([]);
    });
  });

  describe('delete', () => {
    it('expires the cookie and clears it from the bucket', () => {
      const { cookies, setCookies } = createCookies('sid=abc');
      expect(cookies.get('sid')).toBe('abc');
      cookies.delete('sid');
      expect(setCookies()).toEqual(['sid=; Max-Age=-1']);
      expect(cookies.get('sid')).toBeUndefined();
    });

    it('keeps the attributes needed to match the original cookie', () => {
      const { cookies, setCookies } = createCookies('sid=abc');
      cookies.delete('sid', { path: '/', domain: 'example.com' });
      expect(setCookies()).toEqual([
        'sid=; Max-Age=-1; Domain=example.com; Path=/',
      ]);
    });

    it('emits a change event with an undefined value', () => {
      const { cookies } = createCookies('sid=abc');
      const onChange = vi.fn();
      cookies.on('change', onChange);
      cookies.delete('sid');
      expect(onChange.mock.calls[0][0]).toEqual({
        name: 'sid',
        value: undefined,
      });
    });

    it.each([[''], [null], [undefined]])(
      'is what set() delegates to for the value %s',
      (value) => {
        const { cookies, setCookies } = createCookies('sid=abc');
        cookies.set('sid', value as unknown as string, { path: '/' });
        expect(setCookies()).toEqual(['sid=; Max-Age=-1; Path=/']);
        expect(cookies.get('sid')).toBeUndefined();
      },
    );
  });
});
