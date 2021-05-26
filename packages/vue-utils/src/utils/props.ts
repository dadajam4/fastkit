import { PropType, Prop } from '@vue/runtime-core';

export const rawNumberPropType = [String, Number] as PropType<string | number>;

export type RawNumberProp<D extends number | string | undefined = undefined> =
  D extends undefined
    ? {
        type: PropType<string | number>;
        required: true;
      }
    : {
        type: PropType<string | number>;
        default: string | number;
      };

export function rawNumberProp<
  D extends number | string | undefined = undefined,
  R = RawNumberProp<D>,
>(defaultValue?: D): R {
  return {
    type: rawNumberPropType,
    required: defaultValue == null ? true : undefined,
    default: defaultValue,
  } as unknown as R;
}

/* eslint-disable @typescript-eslint/ban-types */
type InferPropType<T> = [T] extends [null]
  ? any
  : [T] extends [
      {
        type: null | true;
      },
    ]
  ? any
  : [T] extends [
      | ObjectConstructor
      | {
          type: ObjectConstructor;
        },
    ]
  ? Record<string, any>
  : [T] extends [
      | BooleanConstructor
      | {
          type: BooleanConstructor;
        },
    ]
  ? boolean
  : [T] extends [
      | DateConstructor
      | {
          type: DateConstructor;
        },
    ]
  ? Date
  : [T] extends [Prop<infer V, infer D>]
  ? unknown extends V
    ? D
    : V
  : T;

type RequiredKeys<T> = {
  [K in keyof T]: T[K] extends {
    required: true;
  }
    ? K
    : never;
}[keyof T];

type OptionalKeys<T> = Exclude<keyof T, RequiredKeys<T>>;

export type ExtractPropInput<O> = O extends object
  ? {
      [K in RequiredKeys<O>]: InferPropType<O[K]>;
    } &
      {
        [K in OptionalKeys<O>]?: InferPropType<O[K]>;
      }
  : {
      [K in string]: any;
    };
