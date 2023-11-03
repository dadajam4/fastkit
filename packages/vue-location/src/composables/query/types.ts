import type { LocationQueryValue } from 'vue-router';
import {
  QueryValueConstructor,
  BUILTIN_BOOLEAN_SCHEMA,
  DefaultFactory,
  Data,
  InferMultipleAndDefault,
  RequiredKeys,
  OptionalKeys,
  NormalizeConstructor,
} from './_internal';

export type QueryType<T> = QueryValueConstructor<T> | T[] | readonly T[];

export type BooleanQueryValues =
  | [trueValue: string, falseValue: string]
  | readonly [trueValue: string, falseValue: string];

export type RawBooleanQueryValues =
  | keyof typeof BUILTIN_BOOLEAN_SCHEMA
  | BooleanQueryValues;

export interface RawBooleanQuerySchema {
  /**
   * @default ["true", "false"]
   */
  values?: RawBooleanQueryValues;
  /**
   * In cases like `?isNull&isEmpty=&other=other`, treat `isNull` as `true`.
   * @default true
   */
  nullToTrue?: boolean;
}

export interface BooleanQuerySchema {
  values: BooleanQueryValues;
  /**
   * In cases like `?isNull&isEmpty=&other=other`, treat `isNull` as `true`.
   * @default true
   */
  nullToTrue: boolean;
}

/**
 * Query schema
 */
export type QuerySchema<T = any, D = T> = {
  /**
   * The actual query name to operate on
   *
   * By default, it operates on queries with the same name as the keys in the schema definition, but this setting allows you to change the query name to be operated on.
   */
  aliasFor?: string;
  /**
   * Value type
   *
   * You can create a union type with multiple types by setting an array.
   */
  type?: QueryType<T> | null | true;
  /** Make it an array type. */
  multiple?: boolean;
  /**
   * Default value when the query value is missing
   */
  default?: D | DefaultFactory<D> | null | undefined;
  /**
   * Schema for handling boolean values
   *
   * @default ["true", "false"]
   *
   * @see {@link RawBooleanQuerySchema}
   */
  booleanSchema?: RawBooleanQueryValues | RawBooleanQuerySchema;
  /**
   * Normalize the query values obtained by vue-router:
   *
   * This process takes place at the very beginning.
   *
   * @param value - The query values obtained by vue-router
   */
  normalizer?(
    value: LocationQueryValue | LocationQueryValue[],
  ): LocationQueryValue | LocationQueryValue[];
  /**
   * Validate the query values obtained by vue-router
   *
   * - This process is executed for each element within an array of query values, if such an array exists.
   * - If it returns false, the value is treated as non-existent.
   *
   * @param value - The query values obtained by vue-router
   */
  validator?(value: LocationQueryValue): boolean;
  /**
   * A serialization function that converts to LocationQueryValue handled in vue-router.
   * @param value - Value to serialize
   */
  serialize?(
    value: unknown,
  ): LocationQueryValue | LocationQueryValue[] | undefined;
};

/** Query schema specification */
export type QuerySchemaSpec<T = any> = QueryType<T> | QuerySchema<T>;

/** Queries schema */
export type QueriesSchema<P = Data> = {
  [K in keyof P]: QuerySchemaSpec<P[K]> | null | true;
};

export type InferQueryType<T> = [T] extends [null] | [true]
  ? string
  : [T] extends [
      {
        type: null | true;
      },
    ]
  ? InferMultipleAndDefault<T, string>
  : [T] extends [
      | StringConstructor
      | {
          type: StringConstructor;
        },
    ]
  ? InferMultipleAndDefault<T, string>
  : [T] extends [
      | NumberConstructor
      | {
          type: NumberConstructor;
        },
    ]
  ? InferMultipleAndDefault<T, number>
  : [T] extends [
      | BooleanConstructor
      | {
          type: BooleanConstructor;
        },
    ]
  ? boolean
  : [T] extends [
      | (infer U)[]
      | readonly (infer U)[]
      | {
          type: (infer U)[];
        }
      | {
          type: readonly (infer U)[];
        },
    ]
  ? InferMultipleAndDefault<T, NormalizeConstructor<U>>
  : never;

export type ExtractQueryTypes<O> = {
  [K in keyof Pick<O, RequiredKeys<O>>]: InferQueryType<O[K]>;
} & {
  [K in keyof Pick<O, OptionalKeys<O>>]?: InferQueryType<O[K]>;
};

export type ExtractQueryInputs<Scheme, Types = ExtractQueryTypes<Scheme>> = {
  [K in keyof Types]?: Types[K] | null;
};
