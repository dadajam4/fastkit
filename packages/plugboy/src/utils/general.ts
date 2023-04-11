export function isPromise<T = any>(obj: any): obj is Promise<T> {
  return (
    !!obj &&
    (typeof obj === 'object' || typeof obj === 'function') &&
    typeof obj.then === 'function'
  );
}

export type Listable<T> =
  | T
  | false
  | null
  | undefined
  | Listable<T>[]
  | Promise<T | false | null | undefined | Listable<T>[]>;

export async function resolveListable<T>(raw: Listable<T>): Promise<T[]> {
  const result: T[] = [];
  const list = Array.isArray(raw) ? raw : [raw];
  for (let row of list) {
    if (isPromise(row)) {
      row = await row;
    }
    if (!row) continue;
    if (Array.isArray(row)) {
      result.push(...(await resolveListable(row)));
      continue;
    }
    result.push(row);
  }
  return result;
}
