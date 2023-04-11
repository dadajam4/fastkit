/**
 * Checks if the specified value is empty-like
 *
 * - For arrays, check length
 * - `false`, `null`, `undefined`, `""` is considered "value is empty"
 */
export function isEmpty(value: any): boolean {
  if (typeof value === 'function') return false;
  return value == null || value === false || value.length === 0;
}

export function notEmptyValue<T>(args: T[]): NonNullable<T> | undefined;
export function notEmptyValue<T>(
  args: T[],
  defaultValue: NonNullable<T>,
): NonNullable<T>;
export function notEmptyValue<T>(args: T[], defaultValue?: NonNullable<T>) {
  for (const arg of args) {
    if (!isEmpty(arg)) {
      return arg;
    }
  }
  return defaultValue;
}
