import { describe, it, expect } from 'vitest';
import { useSsrResponse } from '../response';

describe('useSsrResponse', () => {
  it('keeps one store, reachable two ways', () => {
    // The draft is what the page layer is handed; `writeResponse` is the same
    // store reached through a callback. Two stores would be two answers.
    const { draft, writeResponse } = useSsrResponse();

    writeResponse({ status: 404 });

    expect(draft.status).toBe(404);
  });

  it('starts with no status and an empty header set', () => {
    const { draft } = useSsrResponse();

    expect(draft.status).toBeUndefined();
    expect([...draft.headers.keys()]).toEqual([]);
  });

  it('merges headers instead of replacing them', () => {
    const { draft, writeResponse } = useSsrResponse();

    writeResponse({ headers: { 'x-one': '1' } });
    writeResponse({ headers: { 'x-two': '2' } });

    expect(draft.headers.get('x-one')).toBe('1');
    expect(draft.headers.get('x-two')).toBe('2');
  });

  it('carries a multi-value Set-Cookie, which is the point of the Headers', () => {
    // A `Record<string, string>` could not hold this, and that is why cookies
    // used to be written straight to the Node response instead.
    const { draft } = useSsrResponse();

    draft.headers.append('set-cookie', 'a=1; Path=/');
    draft.headers.append('set-cookie', 'b=2; Path=/');

    expect(draft.headers.getSetCookie()).toEqual([
      'a=1; Path=/',
      'b=2; Path=/',
    ]);
  });

  it('resolves the deferred on a redirect and not otherwise', async () => {
    const { deferred, draft, writeResponse, isRedirect } = useSsrResponse();
    let settled = false;
    deferred.promise.then(() => {
      settled = true;
    });

    writeResponse({ status: 404 });
    await Promise.resolve();
    expect(settled).toBe(false);
    expect(isRedirect()).toBe(false);

    writeResponse({ status: 302, headers: { location: '/elsewhere' } });
    await expect(deferred.promise).resolves.toBe(draft);
    expect(isRedirect()).toBe(true);
    expect(draft.headers.get('location')).toBe('/elsewhere');
  });

  it('reports a status the page layer wrote straight into the draft', () => {
    // `_writeStates` sets the status on the draft; nothing else has to happen
    // for the transport to see it.
    const { draft } = useSsrResponse();

    draft.status = 500;

    expect(draft.status).toBe(500);
  });
});
