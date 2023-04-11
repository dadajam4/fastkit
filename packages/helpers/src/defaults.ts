import { isNonNullObject } from './object';
import { WritableKeysOf } from '@fastkit/ts-type-utils';

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

export const MERGE_DEFAULTS_INDEX_SIGNATURE_SYMBOL = Symbol();

function getIndexSignatureScheme(
  scheme: unknown,
): DefaultsSchemeSource<any> | undefined {
  if (!scheme || Array.isArray(scheme) || typeof scheme !== 'object') {
    return;
  }

  const symbols = Object.getOwnPropertySymbols(scheme);
  if (symbols.some((s) => s === MERGE_DEFAULTS_INDEX_SIGNATURE_SYMBOL)) {
    return (scheme as any)[MERGE_DEFAULTS_INDEX_SIGNATURE_SYMBOL];
  }
}

export function createIndexSignatureDefaultsScheme<T>(
  scheme: DefaultsSchemeSource<T>,
) {
  return {
    [MERGE_DEFAULTS_INDEX_SIGNATURE_SYMBOL]: scheme,
  };
}

export function mergeDefaults<T>(base: T, scheme: DefaultsScheme<T>): T {
  const indexSignatureScheme = getIndexSignatureScheme(scheme);
  if (indexSignatureScheme) {
    const baseKeys = Object.keys(base as any); // @FIXME
    const _scheme: any = {};
    baseKeys.forEach((key) => {
      _scheme[key] = indexSignatureScheme;
    });
    return mergeDefaults(base, _scheme as any);
  }

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
