/**
 * @file Dispatch on what the resolvers found
 */

import type {
  AnyData,
  AnyResolvers,
  ResolvedCatcherData,
  AnyNormalizer,
} from './schema';
import { devWarn } from './dev';

/** Every key any member of the union has */
type AllKeys<U> = U extends any ? keyof U : never;

/**
 * A key *every* member of the union has
 *
 * `UnionToIntersection<keyof U>` does not work here: distribution flattens the
 * per-member key unions into one union before the intersection is taken, so it
 * collapses to `never` as soon as two branches differ at all.
 */
type CommonKeys<U> =
  AllKeys<U> extends infer K
    ? K extends PropertyKey
      ? (
          U extends any ? (K extends keyof U ? true : false) : never
        ) extends true
        ? K
        : never
      : never
    : never;

type ValueAt<U, K extends PropertyKey> = U extends any
  ? K extends keyof U
    ? U[K]
    : never
  : never;

/**
 * The branches' return types, as one object rather than a union
 *
 * A bare union would be unusable: `err.status` is an error on a union whose
 * other member has no `status`, so every read outside the common fields would
 * need narrowing the author never asked for. Merging keeps a field required
 * when every branch produces it -- which is what makes a `message` declared in
 * every branch, `default` included, a type-level guarantee -- and optional when
 * only some do.
 */
export type MergedBranchData<U> = {
  [K in CommonKeys<U> & PropertyKey]: ValueAt<U, K>;
} & {
  [K in Exclude<AllKeys<U>, CommonKeys<U>> & PropertyKey]?: ValueAt<U, K>;
};

/** What a branch is given besides its own slice */
export interface MatchContext<Resolvers extends AnyResolvers = AnyResolvers> {
  /**
   * Everything the resolvers found, including the slices other branches
   * would have taken
   *
   * A `fetchError` branch reaching for `nativeError.stack` is the ordinary
   * reason to want this: the branches are a dispatch, not a partition.
   */
  resolvedData: ResolvedCatcherData<Resolvers>;
  /**
   * The error information, when the instance is being built through
   * `create` / `createAsync`
   *
   * `undefined` for `from` / `fromAsync`, which is the usual case: there the
   * exception is unknown and the resolvers are what is known about it.
   */
  exceptionInfo: unknown;
}

/**
 * Branches, keyed by what a resolver contributed
 *
 * Every key is optional except `default`, which is what makes the dispatch
 * total.
 */
export type MatchBranches<Resolvers extends AnyResolvers = AnyResolvers> = {
  [K in keyof ResolvedCatcherData<Resolvers>]?: (
    slice: NonNullable<ResolvedCatcherData<Resolvers>[K]>,
    ctx: MatchContext<Resolvers>,
  ) => AnyData;
} & {
  /**
   * Taken when no other branch's key is present
   *
   * Required. It is what lets the merged return type promise anything at all:
   * a field is required on the result only when every branch produces it, and
   * without a total dispatch there would always be a path that produced
   * nothing.
   */
  default: (ctx: MatchContext<Resolvers>) => AnyData;
};

/**
 * Reject a branch keyed by something no resolver produces
 *
 * Inferring `Branches` from the object literal skips the excess property check
 * that a plain parameter type would get, so a typo would compile and the branch
 * would simply never run. Mapping the unknown keys to `never` puts the error
 * back on the key itself.
 */
type OnlyResolvedKeys<Branches, Resolvers extends AnyResolvers> = {
  [K in keyof Branches]: K extends
    keyof ResolvedCatcherData<Resolvers> | 'default'
    ? Branches[K]
    : never;
};

type BranchReturns<Branches> = {
  [K in keyof Branches]: Branches[K] extends (...args: any[]) => infer T
    ? T
    : never;
}[keyof Branches];

/**
 * Dispatch on what the resolvers found
 *
 * A normalizer written by hand is a chain of optional access, and its shape is
 * dominated by "does this field exist" rather than "which kind of exception was
 * it":
 *
 * ```ts
 * normalizer: (resolved) => () => ({
 *   message: resolved.fetchError?.response.bodyRead
 *     ? (resolved.fetchError.response.json?.message ??
 *        resolved.fetchError.response.statusText)
 *     : resolved.fetchError?.response.statusText,
 *   status: resolved.fetchError?.response.status,
 * })
 * ```
 *
 * Each branch here is handed its slice, already narrowed, so the `?.`
 * disappears:
 *
 * ```ts
 * const resolvers = [fetchResponseResolver()];
 *
 * const AppError = build({
 *   resolvers,
 *   defaultMessage: 'Something went wrong',
 *   normalizer: match(resolvers, {
 *     fetchError: ({ response }) => ({
 *       code: 'HTTP_ERROR',
 *       message: response.bodyRead
 *         ? (response.json?.message ?? response.statusText)
 *         : response.statusText,
 *       status: response.status,
 *     }),
 *     nativeError: (e) => ({ code: 'UNEXPECTED', message: e.message }),
 *     default: () => ({ code: 'UNKNOWN', message: 'Something went wrong' }),
 *   }),
 * });
 * ```
 *
 * ## The branches are ordered, not exclusive
 *
 * This is the one thing to know before writing one. Branches are tried **in the
 * order they are written**, and the first whose key is present wins; `default`
 * is always last, wherever it appears.
 *
 * They have to be ordered, because they are not exclusive.
 * `nativeErrorResolver` runs in front of your list and never declines an
 * `Error`, so a fetch error arrives with *both* keys:
 *
 * ```ts
 * resolvedData; // { nativeError: ApiResponseError, fetchError: { ... } }
 * ```
 *
 * A `nativeError` branch therefore matches essentially everything, and belongs
 * last -- just before `default`. Listing it earlier makes every branch after it
 * dead, which development warns about.
 *
 * ## Why the resolvers are passed again
 *
 * They are the only way to type the slices. Written without them the branch
 * parameters fall back to `any`, taking the narrowing -- and the point of this
 * helper -- with them. Nothing reads the array at runtime.
 *
 * @param _resolvers - The same list handed to `build`
 * @param branches - {@link MatchBranches The branches}, in priority order
 * @returns An exception normalizer
 */
export function match<
  Resolvers extends AnyResolvers,
  Branches extends MatchBranches<Resolvers>,
>(
  _resolvers: Resolvers,
  branches: Branches & OnlyResolvedKeys<Branches, Resolvers>,
): (
  resolvedData: ResolvedCatcherData<Resolvers>,
) => (exceptionInfo: any) => MergedBranchData<BranchReturns<Branches>> {
  const keys = (Object.keys(branches) as string[]).filter(
    (key) => key !== 'default',
  );

  const nativeErrorAt = keys.indexOf('nativeError');
  if (nativeErrorAt !== -1 && nativeErrorAt < keys.length - 1) {
    devWarn(
      new Set(),
      `\`match\` lists \`nativeError\` before ${keys
        .slice(nativeErrorAt + 1)
        .map((key) => `\`${key}\``)
        .join(', ')}, which will never run.\n` +
        `  \`nativeErrorResolver\` contributes to every \`Error\`, so a \`nativeError\`\n` +
        `  branch matches almost everything. List it last, just before \`default\`.`,
    );
  }

  return (resolvedData) => (exceptionInfo) => {
    const ctx: MatchContext<Resolvers> = { resolvedData, exceptionInfo };
    for (const key of keys) {
      const slice = (resolvedData as AnyData)[key];
      if (slice == null) continue;
      const branch = (branches as AnyData)[key];
      if (!branch) continue;
      return branch(slice, ctx);
    }
    return (branches.default as (c: MatchContext<Resolvers>) => AnyData)(
      ctx,
    ) as MergedBranchData<BranchReturns<Branches>>;
  };
}

/** `match` produces this, which is an {@link AnyNormalizer} */
export type MatchNormalizer<
  Resolvers extends AnyResolvers = AnyResolvers,
  Branches extends MatchBranches<Resolvers> = MatchBranches<Resolvers>,
> = ReturnType<typeof match<Resolvers, Branches>> & AnyNormalizer<Resolvers>;
