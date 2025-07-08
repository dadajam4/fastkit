import { withCtx as _withCtx } from 'vue';

import type {
  VNodeChild,
  VNode,
  PropType,
  SlotsType,
  ComponentInternalInstance,
  ComponentInstance,
} from 'vue';

type RawSlot = (...args: any[]) => any;

type RawSlots = Record<string, RawSlot>;

/**
 * Modify all ReturnTypes of the map type of the Slot
 *
 */
type NormalizedSlotsReturnTypes<S extends RawSlots, T> = {
  [K in keyof S]: (...params: Parameters<S[K]>) => T;
};

/**
 * Map of slots that can be bound as `v-slots` directives.
 */
type SlotsDirectiveBindings<S extends RawSlots> = NormalizedSlotsReturnTypes<
  S,
  VNodeChild
>;

/**
 * Interface of the slots object that can be referenced in the setup context
 */
export type DefineSlotsType<S extends RawSlots> = NormalizedSlotsReturnTypes<
  S,
  VNode[]
>;

/**
 * Map type of slots that can be set as `slots` option in Vue components
 */
export type ResolvedSlots<S extends RawSlots> = SlotsType<
  NormalizedSlotsReturnTypes<S, VNode[]>
>;

/**
 * A factory that generates map types for slots that can be set as `slots` options in Vue components and props options for tsx support
 *
 */
export type DefinedSlots<S extends RawSlots> = ResolvedSlots<S> & {
  (): {
    'v-slots': PropType<SlotsDirectiveBindings<S>>;
  };
};

const _mock = () => undefined;

/**
 * Define Vue slot options and props factory for tsx support
 *
 * @example
 * ```tsx
 * import { defineComponent } from 'vue';
 * import { defineSlots } from '@fastkit/vue-utils';
 *
 * const slots = defineSlots({
 *   default?: (params: string) => any;
 *   requiredSlots: (optionalParams?: number) => any;
 * });
 *
 * const Component = defineComponent({
 *   props: {
 *     ...slots(), // For tsx
 *   },
 *   slots,
 *   setup() {
 *     // .....
 *   },
 * });
 *
 * <Component
 *   v-slots={{
 *     requiredSlots: (optionalParams) => `${optionalParams || 'fallback message'}`,
 *     default: () => <div>Hello slots.</div>
 *   }}
 * />
 * ```
 *
 * @returns slot options and props factory
 */
export function defineSlots<S extends RawSlots>(): DefinedSlots<S> {
  return _mock as any;
}

type AnyFn = (...args: any[]) => any;

/**
 * Wraps Vue's compiler helper `withCtx` to accept a type argument for its first parameter
 *
 * This function is a workaround for a feature request. It will be unnecessary if Vue adopts the feature.
 *
 * @see {@link https://github.com/vuejs/rfcs/discussions/779}
 * @see {@link _withCtx | withCtx}
 */
export const withCtx = _withCtx as <Fn extends AnyFn>(
  fn: Fn,
  ctx?: ComponentInternalInstance | null,
  isNonScopedSlot?: boolean,
) => Fn;

/**
 * Apply `withCtx` to all functions inside the object (Vue compiler helper)
 *
 * @mutable
 *
 * @see {@link _withCtx | withCtx}
 */
export function withCtxForSlots<Slots extends Record<string, any>>(
  slots: Slots,
  ctx?: ComponentInternalInstance | null,
  isNonScopedSlot?: boolean,
) {
  for (const key in slots) {
    if (Object.hasOwn(slots, key)) {
      const entry = slots[key];
      if (typeof entry === 'function') {
        slots[key] = withCtx(entry, ctx, isNonScopedSlot);
      }
    }
  }
  return slots;
}

type RemoveIndexSignature<T> = {
  [K in keyof T as string extends K
    ? never
    : number extends K
      ? never
      : symbol extends K
        ? never
        : K]: T[K];
};

type ToAny<T extends Record<string, AnyFn | undefined>> = {
  [K in keyof T]: NonNullable<T[K]> extends AnyFn
    ? (...args: Parameters<NonNullable<T[K]>>) => any
    : number;
};

export type TypedSlotsWithCtx<Ctor> = ToAny<
  RemoveIndexSignature<ComponentInstance<Ctor>['$slots']>
>;

/**
 * Wrap all slot functions in the given object with `withCtx` for the specified component.
 *
 * @mutable
 *
 * @example
 * ```tsx
 * <SlotComponent
 *   v-slots={typedSlotsWithCtx(SlotComponent, {
 *     default: () => <div>{some.value}</div>, // This is type safe
 *     slot1: (slot1Payload) => <div>{some.value}</div>, // This is type safe
 *   })}
 * />
 * ```
 *
 * @remarks
 * When defining a set of slots at once using an object, you can use {@link typedSlotsWithCtx}.
 *
 * @see {@link withCtx}
 */
export function typedSlotsWithCtx<Ctor, Slots extends TypedSlotsWithCtx<Ctor>>(
  _ctor: Ctor,
  slots: Slots,
  ctx?: ComponentInternalInstance | null,
  isNonScopedSlot?: boolean,
): Slots {
  return withCtxForSlots(slots, ctx, isNonScopedSlot);
}

export type TypedSlotWithCtx<
  Ctor,
  SlotName extends keyof TypedSlotsWithCtx<Ctor>,
> = TypedSlotsWithCtx<Ctor>[SlotName];

/**
 * Wrap the slot function for the specified component and slot name with `withCtx`.
 *
 * @example
 * ```tsx
 * <SlotComponent
 *   v-slots={{
 *     default: typedSlotsWithCtx(SlotComponent, 'default', () => <div>{some.value}</div>), // This is type safe
 *     slot1: typedSlotsWithCtx(SlotComponent, 'slot1', (slot1Payload) => <div>{some.value}</div>), // This is type safe
 *   }}
 * />
 * ```
 *
 * @remarks
 * When defining a single slot function, you can use {@link typedSlotWithCtx}.
 *
 * @see {@link withCtx}
 */
export function typedSlotWithCtx<
  Ctor,
  SlotName extends keyof TypedSlotsWithCtx<Ctor>,
  Slot extends TypedSlotWithCtx<Ctor, SlotName>,
>(
  _ctor: Ctor,
  _slotName: SlotName,
  fn: Slot,
  ctx?: ComponentInternalInstance | null,
  isNonScopedSlot?: boolean,
): Slot {
  return typeof fn === 'function'
    ? withCtx(fn as any, ctx, isNonScopedSlot)
    : fn;
}
