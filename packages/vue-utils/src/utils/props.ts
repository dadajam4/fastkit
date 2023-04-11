import { PropType, Prop, ComponentPropsOptions } from 'vue';

import { HTMLAttributes } from 'vue';

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
    } & {
      [K in OptionalKeys<O>]?: InferPropType<O[K]>;
    }
  : {
      [K in string]: any;
    };

export function createPropsOptions<
  PropsOptions extends Readonly<ComponentPropsOptions>,
>(opts: PropsOptions): PropsOptions {
  return opts;
}

export type Booleanish = boolean | 'true' | 'false';

export const BooleanishPropOption = {
  type: [Boolean, String] as PropType<Booleanish>,
  default: false,
};

export function resolveBooleanish(
  source: Booleanish | undefined,
  defaultValue = false,
): boolean {
  if (source == null) return defaultValue;
  return typeof source === 'boolean' ? source : JSON.parse(source);
}

export type Numberish = string | number;

export const NumberishPropOption = {
  type: [Number, String] as PropType<Numberish>,
};

export function resolveNumberish<
  T extends Numberish | undefined,
  D extends number | undefined = undefined,
>(
  source: T,
  defaultValue?: D,
): D extends number
  ? number
  : T extends undefined
  ? number | undefined
  : number {
  if (source == null) return defaultValue as any;
  return typeof source === 'number' ? source : Number(source);
}

export type HTMLAttributesPropOptions = {
  [K in keyof HTMLAttributes]-?: PropType<HTMLAttributes[K]>;
};

export const htmlAttributesPropOptions =
  undefined as unknown as HTMLAttributesPropOptions;
