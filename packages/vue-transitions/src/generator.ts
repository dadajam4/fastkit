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
import { ExtractPropInput } from '@fastkit/vue-utils';

/**
 * List of hook keys that can be set in JS transitions
 */
const JS_TRANSITION_HOOK_KEYS = [
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

/**
 * Keys for hooks that can be set in JS transitions
 *
 * @see {@link JS_TRANSITION_HOOK_KEYS}
 */
export type JavaScriptTransitionHookKey =
  (typeof JS_TRANSITION_HOOK_KEYS)[number];

/**
 * Hook setting object for JS transitions
 */
export type JavaScriptTransitionHooks<HostElement = HTMLElement> = {
  [Key in JavaScriptTransitionHookKey]?: BaseTransitionProps<HostElement>[Key];
};

/**
 * JS Transition Component
 */
export type JavaScriptTransition<
  CustomProps extends Readonly<ComponentPropsOptions> = {},
> = FunctionalComponent<
  BaseTransitionProps & ExtractPropInput<CustomProps>,
  {}
> & {
  __defaults?: ExtractDefaultPropTypes<CustomProps>;
};

/**
 * JS transition component generation options
 */
export interface JavaScriptTransitionOptions<
  CustomProps extends Readonly<ComponentPropsOptions> = {},
  Props = BaseTransitionProps & ExtractPropTypes<CustomProps>,
> {
  /**
   * Custom Property Settings
   *
   * @see {@link ComponentPropsOptions}
   */
  props?: CustomProps;
  /**
   * Display name
   *
   * @default "JavaScriptTransition"
   * @see {@link FunctionalComponent.displayName}
   */
  displayName?: string;
  /**
   * hook setup function
   */
  setup: (props: Props, ctx: SetupContext) => JavaScriptTransitionHooks;
}

/**
 * Generate JS transition components
 *
 * @param opts - [JS transition component generation options](JavaScriptTransitionOptions)
 */
export function generateJavaScriptTransition<
  CustomProps extends Readonly<ComponentPropsOptions> = {},
>(opts: JavaScriptTransitionOptions<CustomProps>) {
  const { displayName = 'JavaScriptTransition' } = opts;
  const Component: JavaScriptTransition<CustomProps> = (props, ctx) => {
    const { slots } = ctx;
    const resolvedProps: TransitionProps = {
      css: false,
    };
    const listeners = {
      ...opts.setup(props as any, ctx as any),
    };
    JS_TRANSITION_HOOK_KEYS.forEach((key) => {
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
  return Component;
}
