import type {
  RawBooleanQueryValues,
  RawBooleanQuerySchema,
  BooleanQuerySchema,
} from './types';

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

export type InferMultipleAndDefault<T, U> = [T] extends [{ multiple: true }]
  ? U[]
  : [T] extends [{ default: infer D }]
  ? U | D
  : U | undefined;
