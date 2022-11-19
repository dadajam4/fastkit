import {
  DefineComponent,
  VNodeChild,
  PropType,
  ComponentCustomOptions,
} from 'vue';

// export type RawSlotValidators = Record<string, (...args: any[]) => boolean>;

// export type ResolvedSlots<V extends RawSlotValidators> = {
//   [K in keyof V]?: (...args: Parameters<V[K]>) => VNodeChild; //VNode[];
// };

export type ExtractComponentPropTypes<
  C extends {
    setup?: DefineComponent<any>['setup'];
  },
> = Parameters<NonNullable<C['setup']>>[0];

// export type RawSlotsSettings = Record<string, any[]>;
export interface RawSlotsSettings {
  [key: string]: any;
}

export type ResolveRawSlots<R extends RawSlotsSettings> = {
  [K in keyof R]?: (prop: R[K]) => VNodeChild;
};

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
