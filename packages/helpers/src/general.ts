/**
 * 値が空っぽでないか
 *
 * 配列の場合はlengthをチェックする
 * falseは値として認めない（チェックボックスを考慮）
 * value === null
 * || value === undefined
 * || value === ''
 * || Array.isArray(value) && value.length === 0
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
