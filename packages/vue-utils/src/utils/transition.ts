/* eslint-disable @typescript-eslint/ban-types */
import {
  FunctionalComponent,
  ComponentPropsOptions,
  BaseTransition,
  BaseTransitionProps,
  SetupContext,
  Transition,
  TransitionProps,
  h,
  ExtractPropTypes,
  ExtractDefaultPropTypes,
} from 'vue';
import { ExtractPropInput } from './props';

const javaScriptTransitionHookKeys = [
  'onBeforeEnter',
  'onEnter',
  'onAfterEnter',
  'onEnterCancelled',
  'onBeforeLeave',
  'onLeave',
  'onAfterLeave',
  'onLeaveCancelled',
  'onBeforeAppear',
  'onAppear',
  'onAfterAppear',
  'onAppearCancelled',
] as const;

export type JavaScriptTransitionHookKey =
  typeof javaScriptTransitionHookKeys[number];

export type JavaScriptTransitionHooks<HostElement = HTMLElement> = {
  // [K in JavaScriptTransitionHookKey]?: (
  //   ...args: Parameters<BaseTransitionProps[K]>
  // ) => void | Promise<void>;
  onBeforeEnter?: (el: HostElement) => void;
  onEnter?: (el: HostElement, done: () => void) => void;
  onAfterEnter?: (el: HostElement) => void;
  onEnterCancelled?: (el: HostElement) => void;
  onBeforeLeave?: (el: HostElement) => void;
  onLeave?: (el: HostElement, done: () => void) => void;
  onAfterLeave?: (el: HostElement) => void;
  onLeaveCancelled?: (el: HostElement) => void;
  onBeforeAppear?: (el: HostElement) => void;
  onAppear?: (el: HostElement, done: () => void) => void;
  onAfterAppear?: (el: HostElement) => void;
  onAppearCancelled?: (el: HostElement) => void;
};

export type JavaScriptTransition<
  CustomProps extends Readonly<ComponentPropsOptions> = {},
> = FunctionalComponent<
  BaseTransitionProps & ExtractPropInput<CustomProps>,
  {}
> & {
  // props?: BaseTransitionProps & ExtractPropInput<CustomProps>;
  __defaults?: ExtractDefaultPropTypes<CustomProps>;
};

export interface JavaScriptTransitionOptions<
  CustomProps extends Readonly<ComponentPropsOptions> = {},
  Props = BaseTransitionProps & ExtractPropTypes<CustomProps>,
> {
  props?: CustomProps;
  displayName?: string;
  render: (props: Props, ctx: SetupContext) => JavaScriptTransitionHooks;
}

export function createJavaScriptTransition<
  CustomProps extends Readonly<ComponentPropsOptions> = {},
>(opts: JavaScriptTransitionOptions<CustomProps>) {
  const { displayName = 'JavaScriptTransition' } = opts;
  // const baseProps: TransitionProps = {
  //   css: false,
  // };
  const Component: JavaScriptTransition<CustomProps> = (props, ctx) => {
    const { slots } = ctx;
    const resolvedProps: TransitionProps = {
      css: false,
    };
    const listeners = {
      ...opts.render(props as any, ctx as any),
    };
    javaScriptTransitionHookKeys.forEach((key) => {
      let _key = key.slice(2);
      _key = _key.charAt(0).toLowerCase() + _key.slice(1);
      (resolvedProps as any)[key] = (el: any, done: any) => {
        const fn = listeners[key] as any;
        fn && fn(el, done);
        ctx.emit(_key, el, done);
      };
    });

    return h(Transition, resolvedProps, slots);
  };
  Component.displayName = displayName;
  Component.props = {
    ...(BaseTransition as any).props,
    ...opts.props,
  };
  // console.log(opts.props, (Component.props as any).onEnter);
  return Component;
}
