export function toInt(value: string | number): number {
  return typeof value === 'number' ? value : parseInt(value, 10);
}

export function toFloat(value: string | number): number {
  return typeof value === 'number' ? value : parseFloat(value);
}
