/**
 * Recursively unwraps the "awaited type" of a function return type. Non-promise "thenables" should resolve to `never`. This emulates the behavior of `await`.
 */
export type AwaitedReturnType<Fn extends (...args: any) => any> = Awaited<
  ReturnType<Fn>
>;

/**
 * If the specified type is a function, the function type is returned; otherwise, the function type with the specified return type is returned.
 */
export type NormalizeFuncType<T> = T extends (...args: any) => any
  ? T
  : () => T;
