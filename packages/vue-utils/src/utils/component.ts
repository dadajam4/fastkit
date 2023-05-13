import {
  DefineComponent,
  VNodeChild,
  PropType,
  ComponentCustomOptions,
} from 'vue';
import type { defineSlots } from './slots';

export type ExtractComponentPropTypes<
  C extends {
    setup?: DefineComponent<any>['setup'];
  },
> = Parameters<NonNullable<C['setup']>>[0];

interface RawSlotsSettings {
  [key: string]: any;
}

type ResolveRawSlots<R extends RawSlotsSettings> = {
  [K in keyof R]?: (prop: R[K]) => VNodeChild;
};

/**
 * Define properties for slots for tsx support
 *
 * @deprecated This functionality has been moved to {@link defineSlots} with Vue 3.3 slots type support. It may be removed in the next minor version.
 */
export function defineSlotsProps<R extends RawSlotsSettings>() {
  return undefined as unknown as {
    'v-slots': PropType<ResolveRawSlots<R>>;
  };
}

export function isComponentCustomOptions(
  Component: unknown,
): Component is ComponentCustomOptions {
  return (
    (!!Component && typeof Component === 'object') ||
    typeof Component === 'function'
  );
}
