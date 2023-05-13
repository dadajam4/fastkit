import type { VNodeChild, VNode, PropType, SlotsType } from 'vue';

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
