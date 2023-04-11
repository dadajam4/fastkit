const HAS_SET = typeof Set !== 'undefined';

export function isSet<T>(source: unknown): source is Set<T> {
  return HAS_SET && source instanceof Set;
}
