import type { nativeErrorResolver } from './resolvers/native';
import type { UnionToIntersection } from '@fastkit/helpers';

type BultinErrorResolvers = [typeof nativeErrorResolver];

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
      // ...args: Parameters<T>
      args: Parameters<T>[0],
    ) => Partial<Exclude<ReturnType<T>, void | undefined | null>>
  : (...args: any[]) => {};

export type ResolverContext = {
  resolve: () => void;
};

export type AnyResolver = (
  exceptionInfo: unknown,
  ctx: ResolverContext,
) => AnyData | void | undefined | null;

export type AnyResolvers = AnyResolver[];

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
  ComputedResolvedTypes<[...BultinErrorResolvers, ...Resolvers]>;

export type AnyNormalizer<Resolvers extends AnyResolvers = AnyResolvers> = (
  resolvedData: ResolvedCatcherData<Resolvers>,
) => (exceptionInfo: any) => AnyData | void | undefined | null;

export function createCatcherNomalizer<
  Normalizer extends AnyNormalizer<Resolvers>,
  Resolvers extends AnyResolvers = AnyResolvers,
>(nomalizer: Normalizer, _resolvers?: Resolvers): Normalizer {
  return nomalizer;
}

export interface CatcherBuilderOptions<
  Resolvers extends AnyResolvers,
  Normalizer extends AnyNormalizer<Resolvers>,
> {
  defaultName?: string;
  resolvers?: Resolvers;
  normalizer: Normalizer;
}

export type CatcherData<T = AnyData> = T & {
  $__catcher: true;
};

export interface Catcher<
  Resolvers extends AnyResolvers = AnyResolvers,
  T = AnyData,
> extends Error {
  readonly isCatcher: true;
  readonly data: CatcherData<T>;
  readonly resolvedData: ResolvedCatcherData<Resolvers>;
  readonly source?: Catcher<Resolvers, T>;
  readonly histories: Catcher<Resolvers, T>[];
  readonly messages: string[];
  // source: any;
  toJSON(): ErrorImplements & CatcherData<T> & { messages: string[] };
  toJSONString(indent?: number | boolean): string;
}

export interface CatcherConstructor<
  Resolvers extends AnyResolvers = AnyResolvers,
  Normalizer extends AnyNormalizer = AnyNormalizer,
> {
  // new (
  //   exceptionInfo: Parameters<ReturnType<Normalizer>>[0],
  //   overrides?: Partial<ReturnType<ReturnType<Normalizer>> & ErrorImplements>,
  // ): Catcher<Resolvers, ReturnType<ReturnType<Normalizer>>> &
  //   ReturnType<ReturnType<Normalizer>>;

  /**
   * Create an error instance based on the error information.
   */
  new (errorInfo: Parameters<ReturnType<Normalizer>>[0]): Catcher<
    Resolvers,
    ReturnType<ReturnType<Normalizer>>
  > &
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
  // new (
  //   exceptionInfo: Parameters<ReturnType<Normalizer>>[0],
  //   overrides?: Partial<ReturnType<ReturnType<Normalizer>> & ErrorImplements>,
  // ): Catcher<Resolvers, ReturnType<ReturnType<Normalizer>>> &
  //   ReturnType<ReturnType<Normalizer>>;
  // resolve(
  //   exceptionInfo: Parameters<ReturnType<Normalizer>>[0] | undefined,
  //   overrides?: Partial<ReturnType<ReturnType<Normalizer>> & ErrorImplements>,
  // ): Catcher<Resolvers, ReturnType<ReturnType<Normalizer>>> &
  //   ReturnType<ReturnType<Normalizer>>;
}
