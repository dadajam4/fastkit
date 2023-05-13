import { PropType, Prop, ComponentPropsOptions } from 'vue';

import type { HTMLAttributes } from 'vue';

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

type HTMLAttributeName = keyof HTMLAttributes;

export type HTMLAttributesPropOptions<
  Names extends HTMLAttributeName = HTMLAttributeName,
> = {
  [K in Names]-?: PropType<HTMLAttributes[K]>;
};

const _mock: unknown = undefined;

/**
 * Focusable Element Events
 */
export const FOCUSABLE_ATTRIBUTES_PROPS = _mock as HTMLAttributesPropOptions<
  'tabindex' | 'onFocus' | 'onFocusin' | 'onFocusout' | 'onBlur'
>;

/**
 * Focusable Element Events
 * @see {@link FOCUSABLE_ATTRIBUTES_PROPS}
 */
export type FocusableAttributesProps = typeof FOCUSABLE_ATTRIBUTES_PROPS;

/**
 * Keyboard Operable Element Events
 */
export const KEYBOARDABLE_ATTRIBUTES_PROPS = _mock as HTMLAttributesPropOptions<
  'onKeydown' | 'onKeypress' | 'onKeyup'
>;

/**
 * Keyboard Operable Element Events
 * @see {@link KEYBOARDABLE_ATTRIBUTES_PROPS}
 */
export type KeyboardableAttributesProps = typeof KEYBOARDABLE_ATTRIBUTES_PROPS;

/**
 * Pointer Operable Element Events
 */
export const POINTABLE_ATTRIBUTES_PROPS = _mock as HTMLAttributesPropOptions<
  | 'onAuxclick'
  | 'onClick'
  | 'onContextmenu'
  | 'onDblclick'
  | 'onMousedown'
  | 'onMouseenter'
  | 'onMouseleave'
  | 'onMousemove'
  | 'onMouseout'
  | 'onMouseover'
  | 'onMouseup'
  | 'onTouchcancel'
  | 'onTouchend'
  | 'onTouchmove'
  | 'onTouchstart'
  | 'onPointerdown'
  | 'onPointermove'
  | 'onPointerup'
  | 'onPointercancel'
  | 'onPointerenter'
  | 'onPointerleave'
  | 'onPointerover'
  | 'onPointerout'
>;

/**
 * Pointer Operable Element Events
 * @see {@link POINTABLE_ATTRIBUTES_PROPS}
 */
export type PointableAttributesProps = typeof POINTABLE_ATTRIBUTES_PROPS;

/**
 * Events held by HTML elements
 *
 * @deprecated - This symbol may be removed in the next minor version; consider using {@link HTMLAttributesPropOptions} to define only the necessary events.
 */
export const htmlAttributesPropOptions = _mock as HTMLAttributesPropOptions;
