/* eslint-disable @typescript-eslint/ban-types */

/**
 * If the specified type is a function, the function type is returned; otherwise, the function type with the specified return type is returned.
 */
export type NormalizeFuncType<T> = T extends (...args: any) => any
  ? T
  : () => T;

/**
 * Value types that can be replaced with functions
 */
export type FunctionableValue<T, ARGS extends any[]> = T extends Function
  ? never
  : T | ((...args: ARGS) => T);

/**
 * Resolve functions and replaceable values as values
 * @param source - Value types that can be replaced with functions
 * @param args - List of arguments required by the function
 * @returns Resolved Value
 */
export function resolveFunctionableValue<T, ARGS extends any[]>(
  source: FunctionableValue<T, ARGS>,
  ...args: ARGS
): T extends Function ? never : T {
  return typeof source === 'function' ? source(...args) : source;
}

/**
 * Generate a resolver function to resolve values that can be replaced with functions
 * @param args - List of arguments required by the function
 * @returns Resolver function
 */
resolveFunctionableValue.build = function build<ARGS extends any[]>(
  ...args: ARGS
): <T>(source: FunctionableValue<T, ARGS>) => T extends Function ? never : T {
  return (source) => resolveFunctionableValue(source, ...args);
};
