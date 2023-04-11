/** Convert union to intersection type */
export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

/** Ostracize fields of a given type from the structure */
export type OmitByType<T, PickedType = unknown> = Pick<
  T,
  {
    [K in keyof T]: T[K] extends PickedType ? never : K;
  }[keyof T]
>;

/** Removing function type values from a structure */
// eslint-disable-next-line @typescript-eslint/ban-types
export type OmitFunction<T> = OmitByType<T, Function>;

/**
 * Compare the identity of two types (X, Y) and obtain a type according to the result
 */
export type IfEquals<X, Y, A, B> = (<T>() => T extends X ? 1 : 2) extends <
  T,
>() => T extends Y ? 1 : 2
  ? A
  : B;

/** Retrieve writable member names from the structure by union type */
export type WritableKeysOf<T> = {
  [P in keyof T]: IfEquals<
    { [Q in P]: T[P] },
    { -readonly [Q in P]: T[P] },
    P,
    never
  >;
}[keyof T];

/** Extracts only writable members from a structure */
export type WritablePart<T> = Pick<T, WritableKeysOf<T>>;

/**
 * Recursively unwraps the "awaited type" of a function return type. Non-promise "thenables" should resolve to `never`. This emulates the behavior of `await`.
 */
export type AwaitedReturnType<Fn extends (...args: any) => any> = Awaited<
  ReturnType<Fn>
>;

/**
 * JavaScript primitive variable type
 */
export type Primitive =
  | bigint
  | boolean
  | null
  | number
  | string
  | symbol
  | undefined;

// eslint-disable-next-line @typescript-eslint/ban-types
type DeepReadonlyExclude = Function | Date | Error | RegExp;

/**
 * Recursively inspect the structure and mark all properties as readonly
 *
 * @note
 * Considering the use case of this utility type, {@link DeepReadonlyExclude some values} skip recursive checks
 */
export type DeepReadonly<T> = T extends DeepReadonlyExclude
  ? T
  : { readonly [key in keyof T]: DeepReadonly<T[key]> };

// eslint-disable-next-line @typescript-eslint/ban-types
type DeepPartialExclude = Function;

/**
 * Recursively inspect the structure and mark all properties as optional
 *
 * @note
 * Considering the use case of this utility type, {@link DeepPartialExclude some values} skip recursive checks
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export type DeepPartial<T> = T extends DeepPartialExclude
  ? T
  : // eslint-disable-next-line @typescript-eslint/ban-types
  T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

/**
 * Recursive Arrays
 */
export type RecursiveArray<T> = T | RecursiveArray<T>[];

export type UnPromisify<T> = T extends Promise<infer U> ? U : T;
