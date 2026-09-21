import { describe, test, expect, vi, afterEach } from 'vitest';
import { build } from '../catcher';
import { createCatcherResolver } from '../schema';
import { nativeErrorResolver } from '../resolvers/native';

afterEach(() => {
  vi.restoreAllMocks();
});

/** Capture what this catcher warns about, without it reaching the run's output. */
function captureWarnings() {
  return vi.spyOn(console, 'warn').mockImplementation(() => undefined);
}

describe('build: the resolver list', () => {
  const custom = createCatcherResolver((source: unknown) =>
    typeof source === 'string' ? { fromString: source } : undefined,
  );

  // `build` used to `unshift` the native resolver into the array it was given,
  // so a `const resolvers = [...]` shared between two catchers came back with a
  // resolver in it that was never put there.
  test('does not touch the array it is given', () => {
    const shared = [custom];

    build({ resolvers: shared, normalizer: () => () => ({ code: 'A' }) });
    build({ resolvers: shared, normalizer: () => () => ({ code: 'B' }) });

    expect(shared).toEqual([custom]);
  });

  test('still runs the native resolver, in both catchers', () => {
    const shared = [custom];
    const A = build({ resolvers: shared, normalizer: () => () => ({}) });
    const B = build({ resolvers: shared, normalizer: () => () => ({}) });

    expect(A.from(new Error('a')).resolvedData.nativeError).toBeInstanceOf(
      Error,
    );
    expect(B.from(new Error('b')).resolvedData.nativeError).toBeInstanceOf(
      Error,
    );
  });

  test('leaves the native resolver where the caller put it', () => {
    let sawNativeError: boolean | undefined;
    const spy = createCatcherResolver((_source: unknown, ctx) => {
      sawNativeError = 'nativeError' in ctx.resolvedData;
    });

    // Native resolver named last on purpose: `spy` runs before it, so it must
    // not see `nativeError` yet.
    const Last = build({
      resolvers: [spy, nativeErrorResolver],
      normalizer: () => () => ({}),
    });
    Last.from(new Error('boom'));
    expect(sawNativeError).toBe(false);

    // ...and the default position puts it first, so `spy` does see it.
    const Default = build({
      resolvers: [spy],
      normalizer: () => () => ({}),
    });
    Default.from(new Error('boom'));
    expect(sawNativeError).toBe(true);
  });
});

describe('build: defaultMessage', () => {
  // Without it the instance keeps the empty string an `Error` is born with,
  // and `toJSON()` reports `"message": ""` -- a present field that reads like
  // a real, empty message rather than an absent one a log pipeline can spot.
  test('an unrecognised exception has no message without it', () => {
    captureWarnings();
    const AppError = build({ normalizer: () => () => ({ code: 'A' }) });

    const err = AppError.from('just a string');

    expect(err.data.message).toBeUndefined();
    expect(err.toJSON().message).toBe('');
  });

  test('supplies one, and it reaches the instance and the JSON', () => {
    const AppError = build({
      defaultMessage: 'Something went wrong',
      normalizer: () => () => ({ code: 'A' }),
    });

    const err = AppError.from('just a string');

    expect(err.message).toBe('Something went wrong');
    expect(err.data.message).toBe('Something went wrong');
    expect(err.toJSON().message).toBe('Something went wrong');
    expect(err.messages).toEqual(['Something went wrong']);
  });

  test('never displaces a message that exists', () => {
    const AppError = build({
      defaultMessage: 'Something went wrong',
      normalizer: () => () => ({ code: 'A' }),
    });

    // From the exception itself...
    expect(AppError.from(new Error('real')).message).toBe('real');

    // ...and from the normalizer.
    const Normalized = build({
      defaultMessage: 'Something went wrong',
      normalizer: () => () => ({ message: 'from the normalizer' }),
    });
    expect(Normalized.from('anything').message).toBe('from the normalizer');
  });

  test('warns once when an instance ends up with no message', () => {
    const warn = captureWarnings();
    const AppError = build({ normalizer: () => () => ({ code: 'A' }) });

    AppError.from('one');
    AppError.from('two');

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('defaultMessage');
  });

  test('says nothing when a message was produced', () => {
    const warn = captureWarnings();
    const AppError = build({ normalizer: () => () => ({ code: 'A' }) });

    AppError.from(new Error('real'));

    expect(warn).not.toHaveBeenCalled();
  });
});

describe('build: ctx.degraded', () => {
  /** A resolver that can reach further when it is allowed to await. */
  const bodyResolver = createCatcherResolver((source: unknown, ctx) => {
    if (!(source instanceof Error)) return;
    if (!ctx.canAwait) {
      ctx.degraded?.('response body');
      return { body: undefined };
    }
    return Promise.resolve({ body: 'the body' });
  });

  const buildAppError = () =>
    build({
      defaultMessage: 'Something went wrong',
      resolvers: [bodyResolver],
      normalizer: () => () => ({ code: 'A' }),
    });

  test('warns when a synchronous entry point loses something', () => {
    const warn = captureWarnings();

    buildAppError().from(new Error('boom'));

    expect(warn).toHaveBeenCalledTimes(1);
    const [message] = warn.mock.calls[0];
    expect(message).toContain('could not wait for: response body');
    expect(message).toContain('fromAsync');
  });

  test('names the catcher the application gave it', () => {
    const warn = captureWarnings();

    build({
      defaultName: 'AppError',
      defaultMessage: 'Something went wrong',
      resolvers: [bodyResolver],
      normalizer: () => () => ({ code: 'A' }),
    }).from(new Error('boom'));

    expect(warn.mock.calls[0][0]).toContain('await AppError.fromAsync(e)');
  });

  test('says nothing when nothing was lost', async () => {
    const warn = captureWarnings();
    const AppError = buildAppError();

    const err = await AppError.fromAsync(new Error('boom'));

    expect(err.resolvedData.body).toBe('the body');
    expect(warn).not.toHaveBeenCalled();
  });

  // The reason this is reported by the resolver rather than inferred from the
  // resolver list: a catcher that *holds* an async-capable resolver says
  // nothing for the exceptions that resolver never matched.
  test('says nothing for an exception the resolver declined', () => {
    const warn = captureWarnings();

    buildAppError().from('not an error');

    expect(warn).not.toHaveBeenCalled();
  });

  test('warns once, however many exceptions go through', () => {
    const warn = captureWarnings();
    const AppError = buildAppError();

    AppError.from(new Error('one'));
    AppError.from(new Error('two'));
    AppError.from(new Error('three'));

    expect(warn).toHaveBeenCalledTimes(1);
  });

  test('a resolver may report unconditionally', async () => {
    const warn = captureWarnings();
    const eager = createCatcherResolver((_source: unknown, ctx) => {
      ctx.degraded?.('everything');
      return { seen: true };
    });
    const AppError = build({
      defaultMessage: 'Something went wrong',
      resolvers: [eager],
      normalizer: () => () => ({ code: 'A' }),
    });

    await AppError.fromAsync(new Error('boom'));

    expect(warn).not.toHaveBeenCalled();
  });
});
