import { WritableKeysOf } from '@fastkit/ts-type-utils';
import { isNonNullObject } from './object';

interface AnyObject {
  [key: string | number | symbol]: any;
}

export type DefaultsSchemaSource<V> =
  V extends Array<infer U>
    ? U extends AnyObject
      ? | [DefaultsSchema<U>]
        | [DefaultsSchema<U>, (notObject: unknown) => Partial<U> | void]
      : [() => U[]]
    : V extends AnyObject
      ? DefaultsSchema<V>
      : () => V;

export type DefaultsSchema<T> = {
  [K in WritableKeysOf<T>]?: DefaultsSchemaSource<T[K]>;
};

export const MERGE_DEFAULTS_INDEX_SIGNATURE_SYMBOL = Symbol(
  'MERGE_DEFAULTS_INDEX_SIGNATURE',
);

function getIndexSignatureSchema(
  schema: unknown,
): DefaultsSchemaSource<any> | undefined {
  if (!schema || Array.isArray(schema) || typeof schema !== 'object') {
    return;
  }

  const symbols = Object.getOwnPropertySymbols(schema);
  if (symbols.some((s) => s === MERGE_DEFAULTS_INDEX_SIGNATURE_SYMBOL)) {
    return (schema as any)[MERGE_DEFAULTS_INDEX_SIGNATURE_SYMBOL];
  }
}

export function createIndexSignatureDefaultsSchema<T>(
  schema: DefaultsSchemaSource<T>,
) {
  return {
    [MERGE_DEFAULTS_INDEX_SIGNATURE_SYMBOL]: schema,
  };
}

export function mergeDefaults<T>(base: T, schema: DefaultsSchema<T>): T {
  const indexSignatureSchema = getIndexSignatureSchema(schema);
  if (indexSignatureSchema) {
    const baseKeys = Object.keys(base as any); // @FIXME
    const _schema: any = {};
    baseKeys.forEach((key) => {
      _schema[key] = indexSignatureSchema;
    });
    return mergeDefaults(base, _schema as any);
  }

  const keys = Object.keys(schema) as (keyof T)[];
  for (const key of keys) {
    const source = (schema as any)[key];
    if (!source) {
      continue;
    }
    if (typeof source === 'function') {
      if (base[key] === undefined) {
        base[key] = source() as T[typeof key];
      }
    } else if (Array.isArray(source)) {
      const schemaOrFn = source[0] as DefaultsSchema<any> | (() => any);
      if (!base[key] || !Array.isArray(base[key])) {
        base[key] = [] as any;
      }

      const bucket = base[key] as unknown as any[];

      if (typeof schemaOrFn === 'function' && !bucket.length) {
        bucket.push(...schemaOrFn());
      }

      if (typeof schemaOrFn === 'object') {
        const fallbackFn = (source as any)[1] as unknown as
          ((notObject: unknown) => any) | undefined;
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
          newItems.push(mergeDefaults(row, schemaOrFn));
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
