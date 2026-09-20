import { describe, it, expect } from 'vitest';
import { useSsrResponse } from '../response';

describe('useSsrResponse', () => {
  it('keeps the draft and the written response in step', () => {
    // The draft is what the page layer is handed; `writeResponse` is the same
    // store reached through a callback. Two stores would be two answers.
    const { draft, response, writeResponse } = useSsrResponse();

    writeResponse({ status: 404 });

    expect(draft.status).toBe(404);
    expect(response()).toEqual({ status: 404 });
  });

  it('starts empty rather than carrying undefined keys', () => {
    // The snapshot is spread over the rendered payload, so an explicit
    // `undefined` would erase whatever was already there.
    const { response } = useSsrResponse();

    expect(response()).toEqual({});
    expect('status' in response()).toBe(false);
  });

  it('merges headers instead of replacing them', () => {
    const { draft, response, writeResponse } = useSsrResponse();

    writeResponse({ headers: { 'x-one': '1' } });
    writeResponse({ headers: { 'x-two': '2' } });

    expect(draft.headers.get('x-one')).toBe('1');
    expect(response().headers).toEqual({ 'x-one': '1', 'x-two': '2' });
  });

  it('resolves the deferred on a redirect and not otherwise', async () => {
    const { deferred, writeResponse, isRedirect } = useSsrResponse();
    let settled = false;
    deferred.promise.then(() => {
      settled = true;
    });

    writeResponse({ status: 404 });
    await Promise.resolve();
    expect(settled).toBe(false);
    expect(isRedirect()).toBe(false);

    writeResponse({ status: 302, headers: { location: '/elsewhere' } });
    await expect(deferred.promise).resolves.toEqual({
      status: 302,
      headers: { location: '/elsewhere' },
    });
    expect(isRedirect()).toBe(true);
  });

  it('reports a status the page layer wrote straight into the draft', () => {
    // `_writeStates` sets the status on the draft; nothing else has to happen
    // for the transport to see it.
    const { draft, response } = useSsrResponse();

    draft.status = 500;

    expect(response()).toEqual({ status: 500 });
  });
});
