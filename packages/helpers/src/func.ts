import { ExcludeFunction } from './types';

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

export type FunctionableValue<
  T extends ExcludeFunction<unknown>,
  ARGS extends any[],
> = T | ((...args: ARGS) => T);

export function resolveFunctionableValue<
  T extends ExcludeFunction<unknown>,
  ARGS extends any[],
>(source: FunctionableValue<T, ARGS>, ...args: ARGS): T {
  return typeof source === 'function' ? source(...args) : source;
}

resolveFunctionableValue.build = function build<ARGS extends any[]>(
  ...args: ARGS
): <T extends ExcludeFunction<unknown>>(
  source: FunctionableValue<T, ARGS>,
) => T {
  return (source) => resolveFunctionableValue(source, ...args);
};
