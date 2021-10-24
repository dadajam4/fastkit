export function toInt(value: string | number): number {
  return typeof value === 'number' ? value : parseInt(value, 10);
}

export function toFloat(value: string | number): number {
  return typeof value === 'number' ? value : parseFloat(value);
}

export function toNumber(source: any): number {
  return typeof source === 'number' ? source : Number(source);
}

export function toComparableNumbers<ARGS extends number[]>(
  ...args: ARGS
): [ARGS, number] {
  let maxFloating = 0;
  args.forEach((arg) => {
    const floating = arg.toString().split('.')[1];
    if (floating) {
      const { length } = floating;
      if (length > maxFloating) {
        maxFloating = length;
      }
    }
  });
  const offset = 10 ** maxFloating;
  return [args.map((arg) => arg * offset) as ARGS, offset];
}

export function safeRemainderOperation(a: number, b: number) {
  const [[_a, _b]] = toComparableNumbers(a, b);
  return _a % _b;
}
