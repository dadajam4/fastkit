/**
 * Verify that the specified value is an object compatible with Promise
 *
 * @param source - Value to be tested
 * @returns `true` if compatible with Promise
 */
export function isPromise<T = any>(obj: any): obj is Promise<T> {
  return (
    !!obj &&
    (typeof obj === 'object' || typeof obj === 'function') &&
    typeof obj.then === 'function'
  );
}
