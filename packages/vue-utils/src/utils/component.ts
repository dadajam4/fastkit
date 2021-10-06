import {
  defineComponent,
  DefineComponent,
  ComponentPropsOptions,
  ComputedOptions,
  MethodOptions,
  ComponentOptionsMixin,
  EmitsOptions,
  ComponentOptionsWithObjectProps,
  Slots,
  VNodeChild,
} from 'vue';

export type RawSlotValidators = Record<string, (...args: any[]) => boolean>;

export type ResolvedSlots<V extends RawSlotValidators> = {
  [K in keyof V]?: (...args: Parameters<V[K]>) => VNodeChild; //VNode[];
};

export type ExtractComponentPropTypes<
  C extends {
    setup?: DefineComponent<any>['setup'];
  },
> = Parameters<NonNullable<C['setup']>>[0];

export function defineComponentWithSlots<
  SlotValidators extends Readonly<RawSlotValidators>,
  PropsOptions extends Readonly<ComponentPropsOptions>,
  RawBindings,
  D,
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  E extends EmitsOptions = Record<string, any>,
  EE extends string = string,
>(
  options: {
    _slots?: SlotValidators;
  } & ComponentOptionsWithObjectProps<
    PropsOptions,
    RawBindings,
    D,
    C,
    M,
    Mixin,
    Extends,
    E,
    EE
  >,
): DefineComponent<
  PropsOptions,
  RawBindings,
  D,
  C,
  M,
  Mixin,
  Extends,
  E,
  EE
> & {
  renderSlots: (settings: ResolvedSlots<SlotValidators>) => Slots;
} {
  const Component = (defineComponent as any)(options);
  Component.renderSlots = (settings: any) => settings;
  return Component;
}
