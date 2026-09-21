import { describe, test, expect } from 'vitest';
import { runResolver } from '../testing';
import { createCatcherResolver } from '../schema';

describe('runResolver', () => {
  const apiResolver = createCatcherResolver(
    (source: unknown, ctx): { apiError: { status: number } } | undefined => {
      if (!(source instanceof Error) || !('status' in source)) return;
      ctx.resolve();
      return { apiError: { status: source.status as number } };
    },
  );

  const fixture = () => Object.assign(new Error('gone'), { status: 404 });

  test('hands back what the resolver returned', async () => {
    const { data } = await runResolver(apiResolver, fixture());

    expect(data?.apiError.status).toBe(404);
  });

  test('reports a declined exception as undefined', async () => {
    const { data, resolved } = await runResolver(apiResolver, 'a string');

    expect(data).toBeUndefined();
    expect(resolved).toBe(false);
  });

  // Whether a resolver stops the ones after it is a decision worth testing, and
  // it is not observable from the return value.
  test('reports whether ctx.resolve() was called', async () => {
    const { resolved } = await runResolver(apiResolver, fixture());

    expect(resolved).toBe(true);
  });

  test('awaits a resolver that returns a promise', async () => {
    const slow = createCatcherResolver(async () => ({ slow: true }));

    const { data } = await runResolver(slow, new Error('boom'));

    expect(data).toEqual({ slow: true });
  });

  test('can await by default, and on request cannot', async () => {
    const branching = createCatcherResolver((_source: unknown, ctx) => ({
      canAwait: ctx.canAwait,
    }));

    expect((await runResolver(branching, null)).data?.canAwait).toBe(true);
    expect(
      (await runResolver(branching, null, { canAwait: false })).data?.canAwait,
    ).toBe(false);
  });

  test('collects what the resolver reported as lost', async () => {
    const partial = createCatcherResolver((_source: unknown, ctx) => {
      if (!ctx.canAwait) {
        ctx.degraded?.('response body');
        return { body: undefined };
      }
      return Promise.resolve({ body: 'the body' });
    });

    const sync = await runResolver(partial, new Error('boom'), {
      canAwait: false,
    });
    expect(sync.degraded).toEqual(['response body']);
    expect(sync.data).toEqual({ body: undefined });

    // Nothing is lost when the caller can wait, so there is nothing to report.
    const async = await runResolver(partial, new Error('boom'));
    expect(async.degraded).toEqual([]);
    expect(async.data).toEqual({ body: 'the body' });
  });

  // A resolver inside a real catcher never sees an empty `ctx.resolvedData` for
  // an `Error`: the native resolver runs first and always contributes.
  test('seeds what earlier resolvers left behind', async () => {
    const reader = createCatcherResolver((_source: unknown, ctx) => ({
      sawNativeMessage: ctx.resolvedData.nativeError?.message,
    }));
    const nativeError = new Error('from the native resolver');

    const { data } = await runResolver(reader, nativeError, {
      resolvedData: { nativeError },
    });

    expect(data?.sawNativeMessage).toBe('from the native resolver');
  });
});
