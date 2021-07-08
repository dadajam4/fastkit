import type { nativeErrorResolver } from './resolvers/native';

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
      ...args: Parameters<T>
    ) => Partial<Exclude<ReturnType<T>, void | undefined | null>>
  : (...args: any[]) => {};

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;

export type AnyResolver = (source: any) => AnyData | void | undefined | null;

export type AnyResolvers = AnyResolver[];

type MergeParametersAndReturnTypes<
  Resolvers extends AnyResolvers = AnyResolvers,
> = Resolvers extends (infer T)[] ? ExcludeNullableReturnType<T> : never;

type ComputedArgs<Resolvers extends AnyResolvers = AnyResolvers> = Parameters<
  MergeParametersAndReturnTypes<[...BultinErrorResolvers, ...Resolvers]>
>;

type ComputedResolvedTypes<Resolvers extends AnyResolvers = AnyResolvers> =
  UnionToIntersection<
    ReturnType<
      MergeParametersAndReturnTypes<[...BultinErrorResolvers, ...Resolvers]>
    >
  >;

export type AnyNormalizer = (
  data: AnyData,
) => AnyData | void | undefined | null;

export type AnyNormalizers = AnyNormalizer[];

export interface CatcherBuilderOptions<
  Resolvers extends AnyResolvers,
  Normalizers extends AnyNormalizers,
> {
  defaultName?: string;
  resolvers?: Resolvers;
  normalizers?: Normalizers;
}

export type CatcherData<T = AnyData> = T & {
  $_catcherCaught: true;
};

export interface Catcher<T = AnyData> extends Error {
  readonly isCatcher: true;
  readonly data: CatcherData<T>;
  source: any;
  toJSON(): ErrorImplements & CatcherData<T>;
  toJSONString(indent?: number | boolean): string;
}

export interface CatcherConstructor<
  Resolvers extends AnyResolvers = AnyResolvers,
  Normalizers extends AnyNormalizers = AnyNormalizers,
> {
  new (...args: ComputedArgs<Resolvers> | [string]): Catcher<
    ComputedResolvedTypes<Resolvers> & ComputedResolvedTypes<Normalizers>
  > &
    ComputedResolvedTypes<Resolvers> &
    ComputedResolvedTypes<Normalizers>;
}
