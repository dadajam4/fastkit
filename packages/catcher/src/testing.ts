/**
 * @file Test helpers for exception resolvers
 *
 * Writing a resolver is the way this package gets used, and testing one used to
 * mean building a {@link ResolverContext} by hand -- which couples every
 * consumer's tests to the shape of a type they do not own, and leaves the parts
 * that are not plain return values (`ctx.resolve()`, `ctx.degraded()`)
 * unobservable.
 *
 * Published as `@fastkit/catcher/testing` so it stays out of application
 * bundles.
 */

import type { AnyData, AnyResolver, ResolverContext } from './schema';

/**
 * What a resolver returned, with the nullish results it may hand back removed
 *
 * A resolver reports "not mine" by returning nothing, which {@link
 * RunResolverResult.data data} represents as `undefined` -- so the useful type
 * is what is left once those are taken out.
 */
export type ResolverOutput<Resolver extends AnyResolver> = Exclude<
  Awaited<ReturnType<Resolver>>,
  void | undefined | null
>;

/** How to run the resolver */
export interface RunResolverOptions {
  /**
   * The value of {@link ResolverContext.canAwait ctx.canAwait}
   *
   * A resolver that can reach further when awaited has two paths through it,
   * and they are different code. Set this to `false` to test the one the
   * synchronous entry points take.
   *
   * @default true
   */
  canAwait?: boolean;
  /**
   * What earlier resolvers already left behind
   *
   * Seeds {@link ResolverContext.resolvedData ctx.resolvedData}. Inside a real
   * catcher this is never empty for an `Error`: the native resolver runs first
   * and always contributes `nativeError`.
   *
   * @default {}
   */
  resolvedData?: AnyData;
}

/** What running a resolver produced */
export interface RunResolverResult<T> {
  /** What the resolver returned, or `undefined` when it declined the exception */
  data: T | undefined;
  /**
   * Whether the resolver called {@link ResolverContext.resolve ctx.resolve()}
   *
   * The only way to tell that a resolver means to stop the ones after it, which
   * is a decision worth a test of its own -- a resolver that stops too eagerly
   * silently removes data another resolver would have added.
   */
  resolved: boolean;
  /**
   * What the resolver reported through
   * {@link ResolverContext.degraded ctx.degraded()}, in the order reported
   *
   * Always empty when `canAwait` is `true`, because nothing was lost.
   */
  degraded: string[];
}

/**
 * Run a single resolver over an exception
 *
 * ```ts
 * import { runResolver } from '@fastkit/catcher/testing';
 *
 * const { data } = await runResolver(myResolver, new ApiError(404));
 * expect(data?.apiError.status).toBe(404);
 *
 * // The synchronous path, and what it admits to losing
 * const sync = await runResolver(myResolver, err, { canAwait: false });
 * expect(sync.degraded).toEqual(['response body']);
 * ```
 *
 * Always asynchronous, whether or not the resolver is: a resolver that returns
 * a promise is awaited, exactly as `fromAsync` awaits it, so one `await` covers
 * both kinds.
 *
 * This runs the resolver you give it and nothing else. A built catcher also
 * runs the native resolver first, so if what you are testing reads
 * `ctx.resolvedData.nativeError`, seed it through
 * {@link RunResolverOptions.resolvedData resolvedData}.
 *
 * @param resolver - The resolver to run
 * @param source - The exception to hand it
 * @param options - {@link RunResolverOptions How to run the resolver}
 * @returns {@link RunResolverResult What running it produced}
 */
export async function runResolver<Resolver extends AnyResolver>(
  resolver: Resolver,
  source: unknown,
  options: RunResolverOptions = {},
): Promise<RunResolverResult<ResolverOutput<Resolver>>> {
  const { canAwait = true, resolvedData = {} } = options;

  let resolved = false;
  const degraded: string[] = [];

  const ctx: ResolverContext = {
    resolve: () => {
      resolved = true;
    },
    get resolvedData() {
      return resolvedData;
    },
    canAwait,
    degraded: (what) => {
      if (canAwait || degraded.includes(what)) return;
      degraded.push(what);
    },
  };

  const data = await resolver(source, ctx);

  return {
    data: (data ?? undefined) as ResolverOutput<Resolver> | undefined,
    resolved,
    degraded,
  };
}
