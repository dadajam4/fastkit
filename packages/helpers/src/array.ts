export type RecursiveArray<T> = T | RecursiveArray<T>[];

export function flattenRecursiveArray<T>(source: RecursiveArray<T>): T[] {
  const results: T[] = [];
  if (!Array.isArray(source)) {
    results.push(source);
  } else {
    for (const row of source) {
      results.push(...flattenRecursiveArray(row));
    }
  }
  return results;
}

export function arrayRemove<T>(array: T[], entry: T) {
  const index = array.indexOf(entry);
  if (index !== -1) {
    array.splice(index, 1);
  }
}
