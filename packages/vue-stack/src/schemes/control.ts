import {
  Ref,
  Transition,
  VNode,
  VNodeChild,
  PropType,
  ExtractPropTypes,
  SetupContext,
} from 'vue';
import type { VueStackService } from '../service';
import { RouteLocationNormalized } from 'vue-router';
import {
  colorSchemeProps,
  // ColorSchemePropsStaticOptions,
  ColorClassesResult,
} from '@fastkit/vue-color-scheme';
import { UseKeyboardRef, StyleValue } from '@fastkit/vue-utils';
import { rawNumberProp, JavaScriptTransition } from '@fastkit/vue-utils';

type DelayTimerProps = 'openDelay' | 'closeDelay';

export type StackableCloseReason = 'indeterminate' | 'resolved' | 'canceled';

export type VueStackActivatorPayload = HTMLElement | MouseEvent;

export type VStackNavigationGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
) => boolean | Promise<boolean>;

export interface VStackActivatorAttributes {
  onClick?: (ev: MouseEvent) => void;
  onContextmenu?: (ev: MouseEvent) => void;
  onMouseenter?: (ev: MouseEvent) => void;
  onMouseleave?: (ev: MouseEvent) => void;
}

export interface VStackControlState {
  isActive: boolean;
  activator: HTMLElement | Event | null;
  closeReason: StackableCloseReason;
  initialValue: any;
  inputValue: any;
  showing: boolean;
  closing: boolean;
  guardAnimating: boolean;
  guardAnimateTimeId: number | null;
  activateOrder: number;
  timeoutId: number | null;
  delayTimers: number[];
  needRender: boolean;
  booted: boolean;
  isDestroyed: boolean;
}

export interface VStackCloseOptions {
  force?: boolean;
  reason?: StackableCloseReason;
}

export function isStackControl(source: unknown): source is VStackControl {
  return (
    !!source &&
    typeof source === 'object' &&
    (source as VStackControl).__isStackControl === true
  );
}

export interface VStackControl {
  readonly __isStackControl: true;
  readonly isActive: boolean;
  value: any;
  readonly $service: VueStackService;
  readonly color: ColorClassesResult;
  readonly classes: any[];
  readonly styles: StyleValue[];
  readonly transitioning: boolean;
  readonly activateOrder: number;
  readonly timeout: number;
  readonly persistent: boolean;
  readonly isResolved: boolean;
  readonly isCanceled: boolean;
  readonly zIndex: number;
  readonly focusRestorable: boolean;
  readonly closeOnEsc: boolean;
  readonly closeOnNavigation: boolean;
  readonly closeOnOutsideClick: boolean;
  readonly openDelay: number;
  readonly closeDelay: number;
  readonly isDestroyed: boolean;
  readonly contentRef: Ref<HTMLElement | null>;
  readonly activator: HTMLElement | Event | null;
  readonly backdropRef: Ref<HTMLElement | null>;
  readonly stackType?: string | symbol;

  /** @private */
  readonly _: {
    readonly state: VStackControlState;
    readonly activatorAttrs: VStackActivatorAttributes;
    readonly Transition: {
      readonly Ctor: typeof Transition;
      readonly props: any;
      // readonly name: string | undefined;
    };
    readonly keyboard: UseKeyboardRef;
    readonly transitionListeners: {
      onBeforeEnter: (el: HTMLElement) => void;
      onAfterEnter: (el: HTMLElement) => void;
      onEnterCancelled: (el: HTMLElement) => void;
      onBeforeLeave: (el: HTMLElement) => void;
      onAfterLeave: (el: HTMLElement) => void;
      onLeaveCancelled: (el: HTMLElement) => void;
    };
    focusTrapper?: (ev: FocusEvent) => void;
    setIsActive(isActive: boolean, withEmit?: boolean): void;
    clearTimeoutId(): void;
    runDelay(prop: number | DelayTimerProps, cb: () => any): void;
    clearDelay(): void;
    trapFocus(ev?: FocusEvent): boolean | void;
    setupFocusTrapper(): void;
    removeFocusTrapper(): void;
    checkFocusTrap(): void;
    setNeedRender(needRender: boolean): void;
    outsideClickCloseConditional(ev: MouseEvent, pre?: boolean): boolean;
    clearGuardEffect(): void;
  };

  show(activator?: VueStackActivatorPayload): Promise<void>;
  toggle(activator?: VueStackActivatorPayload): Promise<void>;
  close(opts?: VStackCloseOptions): Promise<void>;
  resolve(payload?: any): Promise<void>;
  cancel(force?: boolean): Promise<void>;
  render(
    fn: (
      children: VNodeChild | undefined,
      opts: {
        withClickOutside: (node: VNode) => VNode;
      },
    ) => VNode,
    opts?: {
      transition?: (child?: VNode) => VNode;
    },
  ): VNode;
  toFront(): void;
  resetValue(): void;
  isFront(filter?: (control: VStackControl) => boolean): boolean;
  guardEffect(): void;
}

export const stackableEmits = {
  'update:modelValue': (modelValue: boolean) => true,
  change: (modelValue: boolean) => true,
  payload: (value: any) => true,
  show: (control: VStackControl) => true,
  close: (control: VStackControl) => true,
  beforeEnter: (el: HTMLElement, control: VStackControl) => true,
  afterEnter: (el: HTMLElement, control: VStackControl) => true,
  enterCancelled: (el: HTMLElement, control: VStackControl) => true,
  beforeLeave: (el: HTMLElement, control: VStackControl) => true,
  afterLeave: (el: HTMLElement, control: VStackControl) => true,
  leaveCancelled: (el: HTMLElement, control: VStackControl) => true,
};

export interface VStackActivatorPayload {
  attrs: VStackActivatorAttributes;
  control: VStackControl;
}

export type VStackSlots = {
  default?: (control: VStackControl) => VNodeChild;
  activator?: (payload: VStackActivatorPayload) => VNodeChild;
};

export interface CreateStackablePropsOptions {
  /*extends ColorSchemePropsStaticOptions*/ defaultTransition?: string;
  /** @default false */
  defaultFocusTrap?: boolean;
  /** @default false */
  defaultFocusRestorable?: boolean;
  /** @default false */
  defaultScrollLock?: boolean;
  /** @default true */
  defaultCloseOnOutsideClick?: boolean;
  /** @default true */
  defaultCloseOnNavigation?: boolean;
  /** @default 0 */
  defaultTimeout?: number;
}

export interface VStackObjectTransitionProp<
  T extends string | JavaScriptTransition,
> {
  transition: T;
  props?: T extends JavaScriptTransition ? T['props'] : typeof Transition.props;
}

export type RawVStackObjectTransitionProp<
  T extends string | JavaScriptTransition,
> = string | VStackObjectTransitionProp<T>;

// const hoge: VStackObjectTransitionProp<typeof Transition> = {
//   transition: Transition,
// };

export function createStackableProps<T extends string | JavaScriptTransition>(
  opts: CreateStackablePropsOptions = {},
) {
  const {
    defaultTransition = 'v-stack-fade',
    defaultFocusTrap = false,
    defaultFocusRestorable = false,
    defaultScrollLock = false,
    defaultCloseOnOutsideClick = true,
    defaultCloseOnNavigation = true,
    defaultTimeout = 0,
  } = opts;

  return {
    ...colorSchemeProps(),
    modelValue: Boolean,
    lazyBoot: Boolean,
    value: null,
    class: null,
    style: null as unknown as PropType<StyleValue>,
    transition: {
      type: [String, Object, Function] as PropType<
        RawVStackObjectTransitionProp<T>
      >,
      default: defaultTransition,
    },
    alwaysRender: Boolean,
    backdrop: {
      type: [Boolean, String] as PropType<boolean | string>,
      default: false,
    },
    focusTrap: {
      type: Boolean,
      default: defaultFocusTrap,
    },
    focusRestorable: {
      type: Boolean,
      default: defaultFocusRestorable,
    },
    scrollLock: {
      type: Boolean,
      default: defaultScrollLock,
    },
    openOnHover: Boolean,
    openOnContextmenu: Boolean,
    openDelay: rawNumberProp(0),
    closeDelay: rawNumberProp(200),
    closeOnOutsideClick: {
      type: Boolean,
      default: defaultCloseOnOutsideClick,
    },
    closeOnEsc: {
      type: Boolean,
      default: true,
    },
    closeOnNavigation: {
      type: Boolean,
      default: defaultCloseOnNavigation,
    },
    persistent: Boolean,
    zIndex: rawNumberProp(0),
    timeout: rawNumberProp(defaultTimeout),
    navigationGuard: {
      type: [Boolean, Function] as PropType<boolean | VStackNavigationGuard>,
      default: false,
    },
    guardEffect: {
      type: [Boolean, String],
      default: true,
    },
    activator: {
      type: [Object, Boolean] as PropType<Element | Event | boolean | null>,
      default: null,
    },
    'v-slots': undefined as unknown as PropType<VStackSlots>,
  };
}

export type VStackProps = ExtractPropTypes<
  ReturnType<typeof createStackableProps>
>;
export type VStackSetupContext = SetupContext<typeof stackableEmits>;

export function createStackableDefine(opts?: CreateStackablePropsOptions) {
  return {
    props: createStackableProps(opts),
    emits: stackableEmits,
  };
}
