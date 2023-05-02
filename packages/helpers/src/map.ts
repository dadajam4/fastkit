const HAS_MAP = typeof Map !== 'undefined';

/**
 * Checks if the given value is a `Map` instance
 * @param source - Value to be tested
 * @returns `true` if it is an instance of `Map`.
 */
export function isMap<K, V>(source: unknown): source is Map<K, V> {
  return HAS_MAP && source instanceof Map;
}
