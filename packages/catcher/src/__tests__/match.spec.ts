import { describe, test, expect, vi, afterEach } from 'vitest';
import { build } from '../catcher';
import { match } from '../match';
import { createCatcherResolver } from '../schema';
import { fetchResponseResolver } from '../resolvers/fetch';

afterEach(() => {
  vi.restoreAllMocks();
});

function captureWarnings() {
  return vi.spyOn(console, 'warn').mockImplementation(() => undefined);
}

const resolvers = [fetchResponseResolver()];

const AppError = build({
  resolvers,
  defaultMessage: 'Something went wrong',
  normalizer: match(resolvers, {
    fetchError: ({ response }) => ({
      code: 'HTTP_ERROR' as const,
      message: response.bodyRead
        ? (response.json?.message ?? response.statusText)
        : response.statusText,
      status: response.status,
    }),
    // Last among the real branches on purpose: `nativeError` is present for
    // every `Error`, so anything after it would be dead.
    nativeError: (e) => ({ code: 'UNEXPECTED' as const, message: e.message }),
    default: () => ({
      code: 'UNKNOWN' as const,
      message: 'Something went wrong',
    }),
  }),
});

const notFound = () =>
  new Response('{"message":"That item is gone."}', {
    status: 404,
    statusText: 'Not Found',
  });

describe('match: dispatch', () => {
  test('hands a branch its own slice', async () => {
    const err = await AppError.fromAsync(notFound());

    expect(err.code).toBe('HTTP_ERROR');
    expect(err.message).toBe('That item is gone.');
    expect(err.status).toBe(404);
  });

  test('falls through to a later branch when the key is absent', () => {
    const err = AppError.from(new Error('plain'));

    expect(err.code).toBe('UNEXPECTED');
    expect(err.message).toBe('plain');
    expect(err.status).toBeUndefined();
  });

  test('takes default when nothing matched', () => {
    const err = AppError.from('just a string');

    expect(err.code).toBe('UNKNOWN');
    expect(err.message).toBe('Something went wrong');
  });

  // An `Error` carrying a `Response` produces both keys, because
  // `nativeErrorResolver` runs first and never declines one. Which branch wins
  // is decided by the order they are written, and nothing else.
  test('the first listed branch wins when two keys are present', async () => {
    const carrier = Object.assign(new Error('Request failed'), {
      response: notFound(),
    });

    const err = await AppError.fromAsync(carrier);

    expect(err.resolvedData.nativeError).toBeInstanceOf(Error);
    expect(err.resolvedData.fetchError).toBeDefined();
    expect(err.code).toBe('HTTP_ERROR');
  });

  test('default is last however it is written', () => {
    const Reordered = build({
      resolvers,
      defaultMessage: 'm',
      normalizer: match(resolvers, {
        default: () => ({ code: 'UNKNOWN' as const }),
        nativeError: (e) => ({
          code: 'UNEXPECTED' as const,
          message: e.message,
        }),
      }),
    });

    expect(Reordered.from(new Error('plain')).code).toBe('UNEXPECTED');
    expect(Reordered.from('a string').code).toBe('UNKNOWN');
  });
});

describe('match: the branch context', () => {
  test('carries everything the resolvers found, not just the slice', async () => {
    const WithStack = build({
      resolvers,
      defaultMessage: 'm',
      normalizer: match(resolvers, {
        // The branches are a dispatch, not a partition: a `fetchError` branch
        // still wants the native error's stack.
        fetchError: ({ response }, ctx) => ({
          status: response.status,
          from: ctx.resolvedData.nativeError?.message,
        }),
        default: () => ({}),
      }),
    });
    const carrier = Object.assign(new Error('Request failed'), {
      response: notFound(),
    });

    const err = await WithStack.fromAsync(carrier);

    expect(err.from).toBe('Request failed');
  });

  test('carries the error information only where there is any', () => {
    const Spy = build({
      resolvers: [],
      defaultMessage: 'm',
      normalizer: match([], {
        default: (ctx) => ({ saw: ctx.exceptionInfo }),
      }),
    });
    const info = { code: 'X' };

    expect(Spy.create(info).saw).toBe(info);
    expect(Spy.from(info).saw).toBeUndefined();
  });
});

describe('match: the ordering trap', () => {
  test('warns when nativeError shadows a later branch', () => {
    const warn = captureWarnings();

    match(resolvers, {
      nativeError: (e) => ({ message: e.message }),
      fetchError: ({ response }) => ({ message: response.statusText }),
      default: () => ({ message: 'm' }),
    });

    expect(warn).toHaveBeenCalledTimes(1);
    const [message] = warn.mock.calls[0];
    expect(message).toContain('`nativeError` before `fetchError`');
    expect(message).toContain('never run');
  });

  test('says nothing when it is last', () => {
    const warn = captureWarnings();

    match(resolvers, {
      fetchError: ({ response }) => ({ message: response.statusText }),
      nativeError: (e) => ({ message: e.message }),
      default: () => ({ message: 'm' }),
    });

    expect(warn).not.toHaveBeenCalled();
  });

  test('says nothing when it is the only branch', () => {
    const warn = captureWarnings();

    match(resolvers, {
      nativeError: (e) => ({ message: e.message }),
      default: () => ({ message: 'm' }),
    });

    expect(warn).not.toHaveBeenCalled();
  });
});

/* ------------------------------------------------------------------ *
 * Type-level assertions, checked by `pnpm typecheck`
 * ------------------------------------------------------------------ */

type Expect<T extends true> = T;
type Equals<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;

// Produced by every branch, so it is required...
export type _CodeIsRequired = Expect<
  Equals<
    (typeof AppError)['prototype']['code'],
    'HTTP_ERROR' | 'UNEXPECTED' | 'UNKNOWN'
  >
>;
// ...and produced by one, so it is optional rather than a union error.
export type _StatusIsOptional = Expect<
  Equals<(typeof AppError)['prototype']['status'], number | undefined>
>;

const typedResolvers = [fetchResponseResolver()];
const customResolver = createCatcherResolver((source: unknown) =>
  source instanceof Error ? { appError: { kind: 'app' as const } } : undefined,
);

build({
  resolvers: typedResolvers,
  defaultMessage: 'm',
  normalizer: match(typedResolvers, {
    // @ts-expect-error -- the slice is typed, so a typo is caught
    fetchError: ({ response }) => ({ message: response.stattus }),
    default: () => ({ message: 'm' }),
  }),
});

build({
  resolvers: typedResolvers,
  defaultMessage: 'm',
  normalizer: match(typedResolvers, {
    // @ts-expect-error -- `json` stays behind the `bodyRead` discriminant
    fetchError: ({ response }) => ({ message: response.json }),
    default: () => ({ message: 'm' }),
  }),
});

build({
  resolvers: typedResolvers,
  defaultMessage: 'm',
  normalizer: match(typedResolvers, {
    // @ts-expect-error -- a key no resolver produces is not a branch. Inferring
    // the branches from the literal skips the usual excess property check, so
    // a typo would otherwise compile and simply never run.
    notAResolverKey: () => ({ message: 'm' }),
    default: () => ({ message: 'm' }),
  }),
});

build({
  resolvers: [customResolver],
  defaultMessage: 'm',
  // @ts-expect-error -- `default` is required
  normalizer: match([customResolver], {
    appError: ({ kind }) => ({ message: kind }),
  }),
});
