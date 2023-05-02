const HAS_SET = typeof Set !== 'undefined';

/**
 * Checks if the given value is a `Set` instance
 * @param source - Value to be tested
 * @returns `true` if it is an instance of `Set`.
 */
export function isSet<T>(source: unknown): source is Set<T> {
  return HAS_SET && source instanceof Set;
}
