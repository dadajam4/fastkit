import type {
  RawBooleanQueryValues,
  RawBooleanQuerySchema,
  BooleanQuerySchema,
  QuerySchemaSpec,
  QuerySchema,
} from './types';
import type { LocationQueryValue } from 'vue-router';

export type Data = Record<string, unknown>;

export type QueryValueConstructor<T = any> =
  | {
      new (...args: any[]): T & {};
    }
  | {
      (): T;
    }
  | QueryValueMethod<T>;

export type QueryValueMethod<T, TConstructor = any> = [T] extends [
  ((...args: any) => any) | undefined,
]
  ? {
      new (): TConstructor;
      (): T;
      readonly prototype: TConstructor;
    }
  : never;

export type DefaultFactory<T> = (props: Data) => T | null | undefined;

export const BUILTIN_BOOLEAN_SCHEMA = {
  'true/false': ['true', 'false'],
  '1/0': ['1', '0'],
  'on/off': ['on', 'off'],
} as const;

export function normalizeRawBooleanQuerySchema(
  schema: RawBooleanQueryValues | RawBooleanQuerySchema | undefined,
): BooleanQuerySchema {
  const _schema: RawBooleanQuerySchema | undefined =
    typeof schema === 'string' || Array.isArray(schema)
      ? { values: schema }
      : (schema as BooleanQuerySchema | undefined);

  const { values = 'true/false', nullToTrue = true } = {
    ..._schema,
  };
  return {
    values:
      typeof values === 'string' ? BUILTIN_BOOLEAN_SCHEMA[values] : values,
    nullToTrue,
  };
}

export type RequiredKeys<T> = {
  [K in keyof T]: T[K] extends
    | {
        default: any;
      }
    | {
        multiple: true;
      }
    | BooleanConstructor
    | {
        type: BooleanConstructor;
      }
    ? T[K] extends {
        default: undefined | (() => undefined);
      }
      ? never
      : K
    : never;
}[keyof T];

export type OptionalKeys<T> = Exclude<keyof T, RequiredKeys<T>>;

export type NormalizeConstructor<T> = T extends StringConstructor
  ? string
  : T extends NumberConstructor
  ? number
  : T extends BooleanConstructor
  ? boolean
  : T;

type NormalizeDefaultType<D> = D extends (...args: any[]) => infer U ? U : D;

export type InferMultipleAndDefault<T, U> = [T] extends [{ multiple: true }]
  ? U[]
  : [T] extends [{ default: infer D }]
  ? U | NormalizeDefaultType<D>
  : U | undefined;

export const normalizeType = (type: any) =>
  type == null || type === true ? String : type;

export const normalizeQuerySchemaSpec = (
  spec: QuerySchemaSpec | null | true,
): QuerySchema => {
  spec = normalizeType(spec);
  const result = {
    ...(typeof spec === 'object' && !Array.isArray(spec)
      ? (spec as QuerySchema)
      : { type: spec }),
  };
  if (result.type === Boolean && result.default === undefined) {
    result.default = false;
  }
  return result;
};

export type LocationQueryValueChunk = LocationQueryValue | undefined;
