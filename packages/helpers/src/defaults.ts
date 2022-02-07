import { isNonNullObject } from './object';
import { WritableKeysOf } from './types';

interface AnyObject {
  [key: string | number | symbol]: any;
}

export type DefaultsSchemeSource<V> = V extends Array<infer U>
  ? U extends AnyObject
    ?
        | [DefaultsScheme<U>]
        | [DefaultsScheme<U>, (notObject: unknown) => Partial<U> | void]
    : [() => U[]]
  : V extends AnyObject
  ? DefaultsScheme<V>
  : () => V;

export type DefaultsScheme<T> = {
  [K in WritableKeysOf<T>]?: DefaultsSchemeSource<T[K]>;
};

export function mergeDefaults<T>(base: T, scheme: DefaultsScheme<T>): T {
  const keys = Object.keys(scheme) as (keyof T)[];
  for (const key of keys) {
    const source = (scheme as any)[key];
    if (!source) {
      continue;
    }
    if (typeof source === 'function') {
      if (base[key] === undefined) {
        base[key] = source() as T[typeof key];
      }
    } else if (Array.isArray(source)) {
      const schemeOrFn = source[0] as DefaultsScheme<any> | (() => any);
      if (!base[key] || !Array.isArray(base[key])) {
        base[key] = [] as any;
      }

      const bucket = base[key] as unknown as any[];

      if (typeof schemeOrFn === 'function' && !bucket.length) {
        bucket.push(...schemeOrFn());
      }

      if (typeof schemeOrFn === 'object') {
        const fallbackFn = (source as any)[1] as unknown as
          | ((notObject: unknown) => any)
          | undefined;
        const newItems: any[] = [];
        bucket.forEach((row) => {
          if (!row || typeof row !== 'object') {
            if (fallbackFn) {
              row = fallbackFn(row);
              if (row === undefined) {
                return;
              }
            } else {
              return;
            }
          }
          newItems.push(mergeDefaults(row, schemeOrFn));
        });
        base[key] = newItems as any;
      }
    } else {
      if (!isNonNullObject(base[key])) {
        base[key] = {} as any;
      }
      base[key] = mergeDefaults(base[key], source as any);
    }
  }
  return base;
}
