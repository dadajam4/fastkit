export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

export type ExcludeByType<T, PickedType = unknown> = Pick<
  T,
  {
    [K in keyof T]: T[K] extends PickedType ? never : K;
  }[keyof T]
>;

// eslint-disable-next-line @typescript-eslint/ban-types
export type ExcludeFunction<T> = ExcludeByType<T, Function>;

export type IfEquals<X, Y, A, B> = (<T>() => T extends X ? 1 : 2) extends <
  T,
>() => T extends Y ? 1 : 2
  ? A
  : B;

export type WritableKeysOf<T> = {
  [P in keyof T]: IfEquals<
    { [Q in P]: T[P] },
    { -readonly [Q in P]: T[P] },
    P,
    never
  >;
}[keyof T];

export type WritablePart<T> = Pick<T, WritableKeysOf<T>>;
