import { RecursiveArray } from '@fastkit/ts-type-utils';

/**
 * Converting a recursive array to a flat array
 *
 * @param source - Recursive Arrays
 * @returns - Flattened array
 */
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

/**
 * Remove any element from an array
 *
 * @mutable
 *
 * @param array - Array
 * @param entry - Element to be deleted
 */
export function arrayRemove<T>(array: T[], entry: T) {
  const index = array.indexOf(entry);
  if (index !== -1) {
    array.splice(index, 1);
  }
}

/**
 * Generate a range array with a specified number of ranges
 *
 * @param length - number of elements
 * @param offset - starting value
 * @returns range array
 */
export function range(length: number, offset = 0): number[] {
  return Array.from(Array(length), (v, k) => k + offset);
}

/**
 * Obtain a unique array with duplicate values removed from the specified array
 *
 * @param array - Array
 * @returns Array with duplicates removed
 */
export function arrayUnique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}
