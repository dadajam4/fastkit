import type { nativeErrorResolver } from './resolvers/native';
import type { UnionToIntersection } from '@fastkit/helpers';
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
    ) => Partial<Exclude<ReturnType<T>, void | undefined | null>>
  : (...args: any[]) => {};

export type ResolverContext = {
  resolve: () => void;
};

/** Exception Resolver */
export type AnyResolver = (
  exceptionInfo: unknown,
  ctx: ResolverContext,
) => AnyData | void | undefined | null;

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
 * A method to finally normalize the set of values resolved by the resolver
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

export type CatcherData<T = AnyData> = T & {
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
  /** Error information fully processed by custom resolvers and normalizers */
  readonly data: CatcherData<T>;
  /** Data extracted by custom resolvers */
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
}
