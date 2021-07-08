const HAS_MAP = typeof Map !== 'undefined';

export function isMap<K extends any, V extends any>(
  source: unknown,
): source is Map<K, V> {
  return HAS_MAP && source instanceof Map;
}
