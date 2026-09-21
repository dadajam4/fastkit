import { describe, test, expect, vi, afterEach } from 'vitest';
import { build } from '../../catcher';
import { runResolver } from '../../testing';
import {
  fetchResponseResolver,
  type SerializableFetchResponse,
  type FetchResponseWithBody,
} from '../fetch';

/**
 * `type` used to be spelled `ResponseType`, a name only `lib.dom.d.ts`
 * publishes: `@types/node` types the same property through `undici-types`,
 * which exports the union as a module type and never as a global. A Node-only
 * consumer (`lib: ["esnext"]`, `types: ["node"]`) therefore got `TS2552` from
 * inside our declarations, while the `Headers` on the line above resolved fine
 * (issue #255).
 *
 * Deriving it from `Response` -- a global in both environments -- fixes that
 * without restating a spec type. These assertions are checked by
 * `pnpm typecheck` and keep the field from drifting back to a bare global or
 * being widened to `string`.
 */
type Expect<T extends true> = T;
/** Tuple-wrapped so a union is compared as a whole rather than distributed. */
type MutuallyAssignable<A, B> = [A] extends [B]
  ? [B] extends [A]
    ? true
    : false
  : false;

type OurType = SerializableFetchResponse['type'];

export type _TypeFollowsResponse = Expect<
  MutuallyAssignable<OurType, Response['type']>
>;

// A real member is accepted, and the union is still a union -- if the field
// were widened to `string`, `string` would be assignable to it and this fails.
export type _TypeIsTheUnionNotString = Expect<
  'cors' extends OurType ? ([string] extends [OurType] ? false : true) : false
>;

// `json` and `text` must only be reachable after narrowing on `bodyRead`. If
// they leaked onto the union, this would stop being an error.
export type _BodyIsBehindTheDiscriminant = Expect<
  'json' extends keyof SerializableFetchResponse ? false : true
>;

afterEach(() => {
  vi.restoreAllMocks();
});

/** Run the resolver the way the synchronous entry points do. */
function resolveFetch(source: unknown) {
  return runResolver(fetchResponseResolver(), source, { canAwait: false });
}

/** The same, awaiting the resolver the way `fromAsync` does. */
function resolveFetchAsync(source: unknown) {
  return runResolver(fetchResponseResolver(), source);
}

const AppError = build({
  resolvers: [fetchResponseResolver()],
  normalizer: (resolved) => () => ({
    // Deliberately narrow: the message, and nothing the server sent.
    message: resolved.fetchError?.response.bodyRead
      ? (resolved.fetchError.response.json?.message ??
        resolved.fetchError.response.statusText)
      : resolved.fetchError?.response.statusText,
    status: resolved.fetchError?.response.status,
  }),
});

describe('fetch resolver', () => {
  test('ignores a source that carries no Response', async () => {
    const { data, resolved } = await resolveFetch(new Error('boom'));

    expect(data).toBeUndefined();
    expect(resolved).toBe(false);
  });

  test('reports the metadata synchronously, without the body', async () => {
    const response = new Response('{"message":"not found"}', {
      status: 404,
      statusText: 'Not Found',
      headers: { 'content-type': 'application/json' },
    });
    const { data, resolved, degraded } = await resolveFetch(response);

    expect(resolved).toBe(true);
    // The body is right there and cannot be waited for, so the resolver says
    // so rather than leaving `bodyRead: false` to look like a body-less
    // response.
    expect(degraded).toEqual(['response body']);
    const info: SerializableFetchResponse = data!.fetchError.response;
    expect(info.bodyRead).toBe(false);
    expect(info.status).toBe(404);
    expect(info.statusText).toBe('Not Found');
    expect(info.ok).toBe(false);
    expect(info.type).toBe(response.type);
    // Nothing was read, so nothing was taken from the caller either.
    expect(response.bodyUsed).toBe(false);
  });

  test('reads the body when it may await', async () => {
    const { data, degraded } = await resolveFetchAsync(
      new Response('{"message":"not found"}', { status: 404 }),
    );

    // Nothing was lost, so nothing is reported.
    expect(degraded).toEqual([]);
    const info = data!.fetchError.response as FetchResponseWithBody;
    expect(info.bodyRead).toBe(true);
    expect(info.text).toBe('{"message":"not found"}');
    expect(info.json).toEqual({ message: 'not found' });
  });

  // The resolver used to call `json()` and `text()` on the same response. A
  // body can only be read once, so the second rejected with `TypeError: Body
  // is unusable` -- unhandled, on every fetch error, which terminates a Node
  // process by default. Vitest fails the run on an unhandled rejection, so
  // every test here reproduces that; this one pins the other consequence.
  test('leaves the caller their own body to read', async () => {
    const response = new Response('{"message":"not found"}');
    const { data } = await resolveFetchAsync(response);

    expect(response.bodyUsed).toBe(false);
    await expect(response.json()).resolves.toEqual({ message: 'not found' });
    expect((data!.fetchError.response as FetchResponseWithBody).text).toBe(
      '{"message":"not found"}',
    );
  });

  test('keeps a non-JSON body as text without rejecting', async () => {
    const { data } = await resolveFetchAsync(
      new Response('<html>Gateway Timeout</html>', { status: 504 }),
    );

    const info = data!.fetchError.response as FetchResponseWithBody;
    expect(info.text).toBe('<html>Gateway Timeout</html>');
    expect(info.json).toBeNull();
  });

  test('survives a response whose body was already consumed', async () => {
    const response = new Response('{"a":1}');
    await response.text();

    const { data } = await resolveFetchAsync(response);

    const info = data!.fetchError.response as FetchResponseWithBody;
    expect(info.text).toBe('');
    expect(info.json).toBeNull();
  });

  test('flattens headers, combining repeats the way Headers.get does', async () => {
    const { data } = await resolveFetchAsync(
      new Response(null, {
        status: 401,
        headers: [
          ['content-type', 'application/json'],
          ['set-cookie', 'session=a'],
          ['set-cookie', 'refresh=b'],
        ],
      }),
    );

    const { headers } = data!.fetchError.response;
    expect(headers).toEqual({
      'content-type': 'application/json',
      // `Object.fromEntries` would have dropped `session=a` here.
      'set-cookie': 'session=a, refresh=b',
    });
    // Plain enough to survive serialization, unlike the `Headers` it replaced.
    expect(JSON.parse(JSON.stringify(headers))).toEqual(headers);
  });

  test('carries the error fields when the Response is attached to an Error', async () => {
    const error = Object.assign(new Error('Request failed'), {
      response: new Response('{"a":1}', { status: 500 }),
    });

    const { data } = await resolveFetchAsync(error);

    expect(data!.fetchError.message).toBe('Request failed');
    expect(data!.fetchError.name).toBe('Error');
    expect(data!.fetchError.response.status).toBe(500);
    expect((data!.fetchError.response as FetchResponseWithBody).json).toEqual({
      a: 1,
    });
  });
});

describe('fetch resolver, through a catcher', () => {
  const notFound = () =>
    new Response('{"message":"That item is gone."}', {
      status: 404,
      statusText: 'Not Found',
    });

  test('fromAsync gives the normalizer the body', async () => {
    const err = await AppError.fromAsync(notFound());

    expect(err.message).toBe('That item is gone.');
    expect(err.status).toBe(404);
  });

  test('from falls back to what is knowable synchronously, and says so', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const err = AppError.from(notFound());

    expect(err.message).toBe('Not Found');
    expect(err.status).toBe(404);
    // Picking `from` here costs the body, which used to be silent: the
    // normalizer just saw `bodyRead: false` and fell back to `statusText`.
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain(
      'could not wait for: response body',
    );
  });

  test('fromAsync still honours overrides, and the source keeps the body', async () => {
    const err = await AppError.fromAsync(notFound(), { message: 'Overridden' });

    expect(err.message).toBe('Overridden');
    // The pre-resolved data has to reach the source instance too, or the
    // override would be layered over a normalizer that never saw the body.
    expect(err.source!.message).toBe('That item is gone.');
    expect(err.resolvedData.fetchError!.response.bodyRead).toBe(true);
  });

  test('fromAsync hands back a catcher instance untouched', async () => {
    const first = await AppError.fromAsync(notFound());
    const second = await AppError.fromAsync(first);

    expect(second).toBe(first);
  });

  // The boundary the whole design rests on: resolvers may hold everything the
  // server sent, because only what the *normalizer* returns is serialized.
  test('what the server sent does not reach toJSON on its own', async () => {
    const response = new Response(
      '{"message":"nope","internal":"SECRET-BODY"}',
      {
        status: 401,
        headers: { 'set-cookie': 'session=SECRET-COOKIE' },
      },
    );
    Object.defineProperty(response, 'url', {
      value: 'https://api.example.com/f?sig=SECRET-SIG',
    });

    const err = await AppError.fromAsync(response);
    const serialized = err.toJSONString(0);

    expect(serialized).not.toContain('SECRET-COOKIE');
    expect(serialized).not.toContain('SECRET-SIG');
    expect(serialized).not.toContain('SECRET-BODY');
    // ...while the resolver still has all of it for a normalizer that asks.
    const resolved = err.resolvedData.fetchError!.response;
    expect(resolved.headers['set-cookie']).toBe('session=SECRET-COOKIE');
    expect(resolved.url).toContain('SECRET-SIG');
  });
});
