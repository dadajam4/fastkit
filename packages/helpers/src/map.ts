const HAS_MAP = typeof Map !== 'undefined';

export function isMap<K, V>(source: unknown): source is Map<K, V> {
  return HAS_MAP && source instanceof Map;
}
