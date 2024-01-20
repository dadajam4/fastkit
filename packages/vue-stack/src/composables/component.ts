import {
  ExtractPropTypes,
  VNode,
  VNodeChild,
  ComponentPropsOptions,
  EmitsOptions,
  SetupContext,
  SlotsType,
  PropType,
  ObjectEmitsOptions,
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
  setup?: (ctx: StackableSetupContext<Props, Emits, Slots, CustomAPI>) =>
    | ((
        children: VNodeChild,
        // eslint-disable-next-line no-shadow
        ctx: StackableSetupContext<Props, Emits, Slots, CustomAPI>,
      ) => VNode)
    | void;
  render?: (
    children: VNodeChild,
    ctx: StackableSetupContext<Props, Emits, Slots, CustomAPI>,
  ) => VNode;
}

/**
 * @TODO Utility to temporarily deal with the fact that emits options can no longer be merged since vue3.4.
 */
export type EmitsToPropOptions<T extends EmitsOptions> = T extends string[]
  ? {
      [K in string & `on${Capitalize<T[number]>}`]: PropType<
        (...args: any[]) => any
      >;
    }
  : T extends ObjectEmitsOptions
    ? {
        [K in string &
          `on${Capitalize<string & keyof T>}`]: K extends `on${infer C}`
          ? T[Uncapitalize<C>] extends null
            ? never // PropType<(...args: any[]) => any>
            : PropType<
                (
                  // eslint-disable-next-line no-shadow
                  ...args: T[Uncapitalize<C>] extends (...args: infer P) => any
                    ? P
                    : never
                ) => any
              >
          : never;
      }
    : {};

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
