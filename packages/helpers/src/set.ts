const HAS_SET = typeof Set !== 'undefined';

export function isSet<T extends any>(source: unknown): source is Set<T> {
  return HAS_SET && source instanceof Set;
}
