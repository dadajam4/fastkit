// Runs in vitest's default node environment: no `window`, so `@fastkit/helpers`
// reports `IN_WINDOW === false` -- the SSR case.
import { describe, it, expect } from 'vitest';
import { createApp } from 'vue';
import { createRouter, createMemoryHistory } from 'vue-router';
import { Cookies } from '@fastkit/cookies';
import type { IncomingMessage } from 'node:http';
import { VuePageControl } from '../page-control';
import type { VuePageServerContext, PageResponseDraft } from '../page-control';

function createRequest(cookie = ''): IncomingMessage {
  return { headers: { cookie } } as unknown as IncomingMessage;
}

function createControl(server?: VuePageServerContext) {
  const app = createApp({ render: () => null });
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: { render: () => null } }],
  });
  return new VuePageControl({
    app,
    router,
    initialRoute: { ...router.currentRoute.value, href: '/' },
    server,
  });
}

describe('server context injection', () => {
  it('takes the cookie jar the transport built rather than building one', () => {
    const request = createRequest('sid=abc');
    const headers = new Headers();
    const cookies = new Cookies({ req: request, headers });
    const response: PageResponseDraft = { headers };

    const control = createControl({ request, response, cookies });

    // Identity, not equivalence: assembling an equivalent jar here is exactly
    // what this package stopped doing.
    expect(control.cookies).toBe(cookies);
    expect(control.cookies.get('sid')).toBe('abc');
  });

  it('writes cookies through to wherever the transport pointed them', () => {
    const headers = new Headers();
    const control = createControl({
      request: createRequest(),
      response: { headers },
      cookies: new Cookies({ req: createRequest(), headers }),
    });

    control.cookies.set('sid', 'abc', { path: '/', httpOnly: true });

    expect(headers.getSetCookie()).toEqual(['sid=abc; Path=/; HttpOnly']);
  });

  it('exposes the injected request and response draft under the old names', () => {
    const request = createRequest();
    const response: PageResponseDraft = { headers: new Headers() };
    const control = createControl({
      request,
      response,
      cookies: new Cookies({}),
    });

    expect(control.request).toBe(request);
    expect(control.response).toBe(response);
    expect(control.server?.runtime).toBeUndefined();
  });

  it('carries the adapter runtime through without looking inside it', () => {
    const runtime = { anything: Symbol('transport handle') };
    const control = createControl({
      request: createRequest(),
      response: { headers: new Headers() },
      cookies: new Cookies({}),
      runtime,
    });

    expect(control.server?.runtime).toBe(runtime);
  });

  it('falls back to an inert jar when a server render has no context', () => {
    // There is no `document` here, so the browser branch is not an option
    // either. This used to be the `{ req: undefined, res: undefined }` case:
    // a jar that reads nothing and writes nowhere, rather than a crash.
    const control = createControl();

    expect(control.request).toBeUndefined();
    expect(control.response).toBeUndefined();
    expect(control.cookies.bucket).toEqual({});
    expect(() => control.cookies.set('sid', 'abc')).not.toThrow();
  });
});
