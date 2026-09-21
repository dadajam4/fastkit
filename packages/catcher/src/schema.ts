import type { UnionToIntersection } from '@fastkit/helpers';
import type { nativeErrorResolver } from './resolvers/native';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import type { build } from './catcher';

/**
 * List of built-in resolvers
 */
type BuiltinErrorResolvers = [typeof nativeErrorResolver];

export interface AnyData {
  [key: string]: any;
}

interface ErrorImplements {
  name: string;
  message: string;
  stack?: string;
}

type ExcludeNullableReturnType<T> = T extends (...args: any[]) => any
  ? (
      args: Parameters<T>[0],
    ) => Partial<Exclude<Awaited<ReturnType<T>>, void | undefined | null>>
  : (...args: any[]) => {};

export type ResolverContext = {
  /**
   * Stop the resolvers after this one
   *
   * Optional. Leaving it uncalled means every later resolver still gets its
   * turn, which is what you want when your resolver adds a facet of the
   * exception rather than claiming it.
   *
   * It holds whether or not you return anything: "this one is mine and nobody
   * after me needs to look" is just as sayable by a resolver that recognised
   * the exception and found nothing in it worth extracting.
   *
   * A resolver that throws does not get to keep this -- it contributed
   * nothing, and that includes its claim on the exception.
   */
  resolve: () => void;
  /**
   * What the resolvers before this one returned, merged
   *
   * Never empty for an `Error`: `nativeErrorResolver` runs in front of your
   * list and never declines one, so `nativeError` is already here. Empty for
   * anything that is not an `Error`.
   */
  readonly resolvedData: AnyData;
  /**
   * Whether the caller is able to await this resolver's result
   *
   * * `true` when the instance is being built through {@link
   *   CatcherConstructor.fromAsync fromAsync} or {@link
   *   CatcherConstructor.createAsync createAsync}: a promise returned from here
   *   is awaited, and the normalizer sees the settled value
   * * `false` for the synchronous entry points. An instance is an `Error` that
   *   has to exist by the time it is thrown, so nothing can be awaited -- a
   *   promise returned here is discarded, because the normalizer has already
   *   run by the time it could settle
   *
   * A resolver that needs to await something reads this and returns whatever it
   * can offer synchronously instead. See `fetchResponseResolver`, which reports
   * the response metadata either way and the body only when it may await.
   */
  readonly canAwait: boolean;
  /**
   * Report something this resolver found and could not reach
   *
   * Call it when {@link ResolverContext.canAwait canAwait} is `false` and you
   * are about to return less than you have -- a `Response` whose body you can
   * see but cannot wait for. The catcher collects what was reported and, in
   * development only, warns once that an `await`-capable entry point would
   * have got more:
   *
   * ```
   * [@fastkit/catcher] A resolver could not wait for: response body.
   *   Use `await Catcher.fromAsync(e)` where you can await.
   * ```
   *
   * Nothing is emitted when nothing is reported, so a catcher that happens to
   * hold an async-capable resolver stays quiet for the exceptions that resolver
   * never matched. Say what was lost, not that something might have been:
   *
   * ```ts
   * if (!ctx.canAwait) {
   *   ctx.degraded?.('response body');
   *   return { fetchError: { response: { bodyRead: false, ...meta } } };
   * }
   * ```
   *
   * A no-op when `canAwait` is `true`: nothing was lost, so there is nothing to
   * say.
   *
   * @remarks Optional only so that a hand-built context still type-checks --
   *   a catcher always supplies it. Prefer `runResolver` from
   *   `@fastkit/catcher/testing` over building one by hand; it is what makes
   *   this observable in a test.
   *
   * @param what - What could not be reached, as a noun phrase that reads after
   *   "could not wait for": `'response body'`, `'stream contents'`
   */
  degraded?: (what: string) => void;
};

/**
 * Exception Resolver
 *
 * Answers one question: is this exception mine, and if so what is worth
 * pulling out of it? Return an object to be merged into `resolvedData` for the
 * normalizer, or nothing to decline.
 *
 * * Results are merged in order, so a later resolver overwrites the keys of an
 *   earlier one and leaves the rest. Namespacing what you return under one key
 *   -- `{ apiError: { ... } }` rather than `{ code, status }` -- keeps two
 *   resolvers from silently overwriting each other's fields.
 * * May return a promise. It is only awaited when the instance is built through
 *   {@link CatcherConstructor.fromAsync fromAsync} / {@link
 *   CatcherConstructor.createAsync createAsync} -- check
 *   {@link ResolverContext.canAwait ctx.canAwait} before returning one, and
 *   report what the synchronous path cost through
 *   {@link ResolverContext.degraded ctx.degraded()}.
 * * **Must not throw.** A resolver runs while an error is being described and
 *   must not replace it with one of its own. One that does is skipped and
 *   warned about in development, and the exception being described reaches the
 *   normalizer regardless -- a safety net, not a licence.
 */
export type AnyResolver = (
  exceptionInfo: unknown,
  ctx: ResolverContext,
) =>
  | AnyData
  | void
  | undefined
  | null
  | Promise<AnyData | void | undefined | null>;

/** List of Exception Resolver */
export type AnyResolvers = AnyResolver[];

/**
 * Creating an Exception Resolver
 *
 * @param resolver -  Exception Resolver
 * @returns Exception Resolver
 */
export function createCatcherResolver<Resolver extends AnyResolver>(
  resolver: Resolver,
) {
  return resolver;
}

type MergeParametersAndReturnTypes<
  Resolvers extends AnyResolvers = AnyResolvers,
> = Resolvers extends (infer T)[] ? ExcludeNullableReturnType<T> : never;

type ComputedResolvedTypes<Resolvers extends AnyResolvers = AnyResolvers> =
  UnionToIntersection<
    ReturnType<MergeParametersAndReturnTypes<[...Resolvers]>>
  >;

export type ResolvedCatcherData<Resolvers extends AnyResolvers = AnyResolvers> =
  ComputedResolvedTypes<[...BuiltinErrorResolvers, ...Resolvers]>;

/**
 * Exception Normalizer
 *
 * Decides what an error looks like in this application: it is handed everything
 * the resolvers extracted and returns the fields the instance carries.
 *
 * **It is also the boundary.** What it returns becomes
 * {@link Catcher.data data} and is the only thing `toJSON()` emits, so "what
 * this application calls an error" and "what is safe to log" are one decision,
 * made here. Read {@link Catcher.resolvedData resolvedData} for what that means
 * in practice; spreading a response into the return value is how a `set-cookie`
 * ends up in a log line.
 *
 * {@link match} is usually a better way to write one than a chain of `?.`.
 */
export type AnyNormalizer<Resolvers extends AnyResolvers = AnyResolvers> = (
  resolvedData: ResolvedCatcherData<Resolvers>,
) => (exceptionInfo: any) => AnyData | void | undefined | null;

/**
 * Creating an Exception Normalizer
 *
 * @param normalizer - Exception Normalizer
 * @param _resolvers - List of Exception Resolver
 * @returns Exception Normalizer
 */
export function createCatcherNormalizer<
  Normalizer extends AnyNormalizer<Resolvers>,
  Resolvers extends AnyResolvers = AnyResolvers,
>(normalizer: Normalizer, _resolvers?: Resolvers): Normalizer {
  return normalizer;
}

/**
 * Catcher constructor generation options
 */
export interface CatcherBuilderOptions<
  Resolvers extends AnyResolvers = AnyResolvers,
  Normalizer extends AnyNormalizer<Resolvers> = AnyNormalizer<Resolvers>,
> {
  /**
   * Default name if the name cannot be resolved from the supplemented exception
   *
   * @default CatcherError
   */
  defaultName?: string;
  /**
   * Message to use when nothing else produced one
   *
   * Applied last, after the normalizer and after the native error's own
   * `message`, and only when what is left is empty.
   *
   * **Set it.** Without it there is no guarantee that a catcher has a message,
   * and the failure is quiet rather than loud: a normalizer that returns no
   * `message` for an exception it did not recognise leaves the instance with
   * the empty string an `Error` is born with, so `toJSON()` reports
   * `"message": ""` -- not an absent field a log pipeline can spot, but a
   * present one that reads like a real, empty message.
   *
   * ```ts
   * build({
   *   defaultName: 'AppError',
   *   defaultMessage: 'Something went wrong',
   *   resolvers,
   *   normalizer,
   * });
   * ```
   *
   * The string belongs to the application, not to this package, so there is no
   * default -- it is what a user may end up reading. Development warns once
   * per catcher when an instance is built without a message and this is unset.
   */
  defaultMessage?: string;
  /**
   * List of Exception Resolver
   */
  resolvers?: Resolvers;
  /**
   * Exception Normalizer
   *
   * A method to finally normalize the set of values resolved by the resolver
   */
  normalizer: Normalizer;
}

export type CatcherData<T = AnyData> = T &
  /**
   * The fields the catcher fills in for itself, whatever the normalizer
   * returned: `name` from `defaultName`, `stack` from the instance, and
   * `message` from the exception or from `defaultMessage`. Optional because
   * a normalizer that declares them narrows them back to required, and
   * nothing guarantees a `message` unless `defaultMessage` is set.
   */
  Partial<ErrorImplements> & {
    /**
     * Catcher symbol
     * @internal
     */
    $__catcher: true;
  };

/**
 * Caught exception instances
 */
export interface Catcher<
  Resolvers extends AnyResolvers = AnyResolvers,
  T = AnyData,
> extends Error {
  /** It is a catcher instance */
  readonly isCatcher: true;
  /**
   * What the **normalizer** returned -- and the only thing that is serialized
   *
   * `toJSON()` emits this and nothing else, so this is what leaves the process:
   * what reaches a log, an error report, a response body. Its fields are also
   * defined onto the instance, which is where `err.status` comes from.
   *
   * Not to be confused with {@link Catcher.resolvedData resolvedData}, which is
   * one layer earlier and is not serialized. The two names are one word apart
   * and the difference between them is what is safe to keep -- see
   * {@link Catcher.resolvedData resolvedData} before copying anything across.
   */
  readonly data: CatcherData<T>;
  /**
   * What the **resolvers** extracted -- never serialized
   *
   * Everything they found, in full, because none of it leaves on its own:
   * `toJSON()` emits {@link Catcher.data data}, which is what the normalizer
   * returned. That is the boundary, and it is deliberate -- a resolver may hold
   * the whole response precisely because holding it costs nothing.
   *
   * **So copy out of here deliberately, never wholesale.** What a response
   * carries is what the server sent:
   *
   * * `set-cookie` -- session and refresh tokens, and a 401 is exactly when
   *   those get rotated
   * * a `url` that may hold a signed-URL signature or a `?token=`
   * * a body that may hold far more than the message you were after
   *
   * ```ts
   * // Fine: a code and a message.
   * return { code: 'HTTP_ERROR', message: response.json?.message };
   *
   * // Puts the session cookie, the signed URL and the whole body wherever
   * // this error is logged.
   * return { ...response };
   * ```
   *
   * This package's own README made the second mistake, which is the reason this
   * warning is here rather than in the documentation alone.
   */
  readonly resolvedData: ResolvedCatcherData<Resolvers>;
  /**
   * Catcher instance generated from original exception source before override
   *
   * * Only set if override is specified at instance creation
   */
  readonly source?: Catcher<Resolvers, T>;
  /**
   * List of extension sources for own instance
   *
   * * The younger the index, the closer the source is to you.
   */
  readonly histories: Catcher<Resolvers, T>[];
  /**
   * 全ての歴史を辿ったメッセージのリスト
   *
   * * If multiple identical messages are detected, they are filtered to avoid duplicates
   */
  readonly messages: string[];
  /**
   * Obtain as a JSON object
   */
  toJSON(): ErrorImplements & CatcherData<T> & { messages: string[] };
  /**
   * Obtain as JSON string
   * @param indent - number of indentations
   *
   * @default 2
   */
  toJSONString(indent?: number | boolean): string;
}

/**
 * Exception catcher constructor
 *
 * * The first thing to do is to generate this constructor in your application using the build method
 * * Instance properties are extended by type arguments at creation
 */
export interface CatcherConstructor<
  Resolvers extends AnyResolvers = AnyResolvers,
  Normalizer extends AnyNormalizer = AnyNormalizer,
> {
  /**
   * Create an error instance based on the error information.
   */
  new (
    errorInfo: Parameters<ReturnType<Normalizer>>[0],
  ): Catcher<Resolvers, ReturnType<ReturnType<Normalizer>>> &
    ReturnType<ReturnType<Normalizer>>;

  /**
   * Create an error instance based on the error information.
   */
  create(
    errorInfo: Parameters<ReturnType<Normalizer>>[0],
  ): Catcher<Resolvers, ReturnType<ReturnType<Normalizer>>> &
    ReturnType<ReturnType<Normalizer>>;

  /**
   * Create an error instance based on an unknown exception.
   * The fields of the error instance can be overwritten by specifying an object as the second argument.
   */
  from(
    unknownException: unknown,
    overrides?: Partial<ReturnType<ReturnType<Normalizer>> & ErrorImplements>,
  ): Catcher<Resolvers, ReturnType<ReturnType<Normalizer>>> &
    ReturnType<ReturnType<Normalizer>>;

  /**
   * {@link CatcherConstructor.from from}, awaiting every resolver
   *
   * Some of what an exception carries can only be reached asynchronously -- a
   * `Response` hands out its body through a promise and no other way. A
   * resolver cannot deliver that to a synchronous constructor: the instance has
   * to exist by the time it is thrown, which is before the body could arrive.
   *
   * This entry point awaits the resolvers first and normalizes afterwards, so
   * the normalizer sees everything. Prefer it wherever you can await -- a
   * `catch` in an async function, which is where fetch errors live:
   *
   * ```ts
   * try {
   *   await api.getUser(id);
   * } catch (e) {
   *   throw await AppError.fromAsync(e);
   * }
   * ```
   *
   * Nothing else changes: you still hand it an unknown exception and let the
   * resolvers work out what it is.
   */
  fromAsync(
    unknownException: unknown,
    overrides?: Partial<ReturnType<ReturnType<Normalizer>> & ErrorImplements>,
  ): Promise<
    Catcher<Resolvers, ReturnType<ReturnType<Normalizer>>> &
      ReturnType<ReturnType<Normalizer>>
  >;

  /**
   * {@link CatcherConstructor.create create}, awaiting every resolver
   *
   * See {@link CatcherConstructor.fromAsync fromAsync}.
   */
  createAsync(
    errorInfo: Parameters<ReturnType<Normalizer>>[0],
  ): Promise<
    Catcher<Resolvers, ReturnType<ReturnType<Normalizer>>> &
      ReturnType<ReturnType<Normalizer>>
  >;
}
