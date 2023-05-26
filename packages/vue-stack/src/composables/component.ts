import {
  ExtractPropTypes,
  VNode,
  VNodeChild,
  ComponentPropsOptions,
  EmitsOptions,
  SetupContext,
  SlotsType,
} from 'vue';
import {
  VStackControl,
  StackablePropsOptions,
  StackableEmits,
} from '../schemes';
import { useStackControl, UseStackControlOptions } from './control';

export type StackableSetupContext<
  Props extends Readonly<ComponentPropsOptions>,
  Emits extends EmitsOptions,
  Slots extends SlotsType,
  CustomAPI extends Record<keyof any, any>,
> = {
  readonly control: VStackControl;
  readonly props: ExtractPropTypes<StackablePropsOptions & Props>;
  readonly setupContext: SetupContext<StackableEmits & Emits, Slots>;
} & CustomAPI;

export interface DefineStackableSettings<
  Props extends Readonly<ComponentPropsOptions>,
  Emits extends EmitsOptions,
  Slots extends SlotsType,
  CustomAPI extends Record<keyof any, any> = {},
> {
  name?: string;
  setup?: (
    ctx: StackableSetupContext<Props, Emits, Slots, CustomAPI>,
  ) =>
    | ((
        children: VNodeChild,
        ctx: StackableSetupContext<Props, Emits, Slots, CustomAPI>,
      ) => VNode)
    | void;
  render?: (
    children: VNodeChild,
    ctx: StackableSetupContext<Props, Emits, Slots, CustomAPI>,
  ) => VNode;
}

export function setupStackableComponent<
  Props extends Readonly<ComponentPropsOptions>,
  Emits extends EmitsOptions = EmitsOptions,
  Slots extends SlotsType = SlotsType,
  CustomAPI extends Record<keyof any, any> = Record<keyof any, any>,
>(
  props: any,
  setupContext: any,
  options?: UseStackControlOptions,
): StackableSetupContext<Props, Emits, Slots, CustomAPI> {
  const control = useStackControl(props, setupContext, options);
  return {
    control,
    props,
    setupContext: setupContext as any,
  } as any;
}
