export function toInt(value: string | number): number {
  return typeof value === 'number' ? value : parseInt(value, 10);
}

export function toFloat(value: string | number): number {
  return typeof value === 'number' ? value : parseFloat(value);
}

export function toNumber(source: any): number {
  return typeof source === 'number' ? source : Number(source);
}
