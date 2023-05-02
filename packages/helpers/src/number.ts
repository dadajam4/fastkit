/**
 * Returns an integer of the given value
 *
 * @param value - Numbers or their strings
 * @returns Integer
 */
export function toInt(value: string | number): number {
  return typeof value === 'number' ? Math.trunc(value) : parseInt(value, 10);
}

/**
 * Returns a floating-point value of the given value
 *
 * @param value - Numbers or their strings
 * @returns floating-point value
 */
export function toFloat(value: string | number): number {
  return typeof value === 'number' ? value : parseFloat(value);
}

/**
 * Returns the specified value normalized to number
 *
 * @param value - Numbers or their strings
 * @returns number
 */
export function toNumber(source: any): number {
  return typeof source === 'number' ? source : Number(source);
}
