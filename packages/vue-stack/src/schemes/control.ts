import {
  Ref,
  Transition,
  VNode,
  VNodeChild,
  PropType,
  ExtractPropTypes,
  SetupContext,
  SlotsType,
  ComponentPublicInstance,
  type HTMLAttributes,
} from 'vue';
import { RouteLocationNormalized } from 'vue-router';
import { StyleValue, defineSlots, rawNumberProp } from '@fastkit/vue-utils';
import { UseKeyboardRef } from '@fastkit/vue-keyboard';
import { JavaScriptTransition } from '@fastkit/vue-transitions';
import type { VueStackService } from '../service';

type DelayTimerProps = 'openDelay' | 'closeDelay';

/**
 * Reason for becoming hidden
 *
 * - `indeterminate` Not determined reason
 * - `resolved` - User performed an 'OK'-like action
 * - `canceled` - User performed a 'Cancel'-like action
 */
export type StackableCloseReason = 'indeterminate' | 'resolved' | 'canceled';

/**
 * Configuration for closing the stack with the Tab key
 *
 * - `always` Always close.
 * - `not-focused` When the Tab key is pressed and the active element of the document is outside the stack and its activator.
 */
export type StackableTabCloseSetting = 'always' | 'not-focused';

/**
 * Configuration for closing the stack with the Tab key
 *
 * If `true` is specified, it is treated as `always`.
 *
 * @see {@link StackableTabCloseSetting}
 */
export type StackableTabCloseSpec = boolean | StackableTabCloseSetting;

export type VStackNavigationGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
) => boolean | Promise<boolean>;

/**
 * Handler function for resolving the stack.
 *
 * Handler function for resolving the stack, which may include validation processes or asynchronous submission tasks.
 *
 * @returns A boolean or undefined value or a Promise that resolves to a boolean or undefined value.
 *   - If `false`, the stack resolution is canceled.
 */
export type StackableResolveHandler = (
  ctx: VStackControl,
) => boolean | void | undefined | Promise<boolean | void | undefined>;

/**
 * Attributes to apply to the stack element's activator
 */
export interface VStackActivatorAttributes {
  /** VNode ref */
  ref: Ref;
  /** Click handler */
  onClick?: (ev: PointerEvent) => void;
  /** Context menu handler */
  onContextmenu?: (ev: PointerEvent) => void;
  /** Mouse enter handler */
  onMouseenter?: (ev: MouseEvent) => void;
  /** Mouse leave handler */
  onMouseleave?: (ev: MouseEvent) => void;
  /** Focus handler */
  onFocus?: (ev: FocusEvent) => void;
}

/** State of the stack control */
export interface VStackControlState {
  /** Display state */
  isActive: boolean;
  /** Activator element */
  readonly activator: HTMLElement | undefined;
  /**
   * Reason for becoming hidden
   *
   * @see {@link StackableCloseReason}
   */
  closeReason: StackableCloseReason;
  /** Initial value */
  initialValue: any;
  /** Input value */
  inputValue: any;
  /**
   * If the asynchronous resolution handler is in progress, its type.
   */
  guardInProgressType: null | 'cancel' | 'resolve';
  /** During display animation */
  showing: boolean;
  /** During hide animation */
  closing: boolean;
  /** During guard animation */
  guardAnimating: boolean;
  /** Guard animation timer ID */
  guardAnimateTimeId: number | null;
  /** Activation order */
  activateOrder: number;
  /** Auto-hide timer ID */
  timeoutId: number | null;
  /** List of delay request timer IDs */
  delayTimers: number[];
  /** Rendering required */
  needRender: boolean;
  /** Component mounted */
  booted: boolean;
  /** Component destroyed */
  isDestroyed: boolean;
  /** Whether the activator element is being hovered. */
  isActivatorHovered: boolean;
  /** Whether the stack content is being hovered. */
  isContentHovered: boolean;
}

/**
 * Close option
 */
export interface VStackCloseOptions {
  /**
   * Force close
   *
   * When the `persistent` setting is enabled, the stack will not close unless this option is also activated.
   */
  force?: boolean;
  /**
   * Reason for becoming hidden
   *
   * @see {@link StackableCloseReason}
   */
  reason?: StackableCloseReason;
}

/**
 * Check if the specified value is an instance of the stack control
 *
 * @param source - The value to check
 * @returns - If it is a stack control, returns `true`
 */
export function isStackControl(source: unknown): source is VStackControl {
  return (
    !!source &&
    typeof source === 'object' &&
    (source as VStackControl).__isStackControl === true
  );
}

/**
 * Stack control
 */
export interface VStackControl {
  readonly __isStackControl: true;
  /** Display state */
  readonly isActive: boolean;
  /**
   * The value entered into the stack
   *
   * This is always `undefined` if the `closeReason` is not `resolved`.
   */
  value: any;
  /**
   * Stack service
   *
   * @see {@link VueStackService}
   */
  readonly $service: VueStackService;
  /** List of class attributes */
  readonly classes: any[];
  /** List of style attributes */
  readonly styles: StyleValue[];
  /** During animation */
  readonly transitioning: boolean;
  /** Activation order */
  readonly activateOrder: number;
  /** Timeout setting (milliseconds) */
  readonly timeout: number;
  /**
   * Persistently display
   *
   * If this setting is enabled, it will attempt to block hide requests or page transitions
   */
  readonly persistent: boolean;
  /** The user has performed a confirmation action, such as 'OK,' for the stack display */
  readonly isResolved: boolean;
  /** The user has performed a negative action, such as 'Cancel,' for the stack display */
  readonly isCanceled: boolean;
  /** z index */
  readonly zIndex: number;
  /** Restore focus after hiding */
  readonly focusRestorable: boolean;
  /** Close when the ESC key is pressed */
  readonly closeOnEsc: boolean;
  /**
   * Close when the ESC key is pressed
   *
   * @see {@link StackableTabCloseSetting}
   */
  readonly closeOnTab: false | StackableTabCloseSetting;
  /** Close on navigation occurrence */
  readonly closeOnNavigation: boolean;
  /** Close when clicking outside the stack area */
  readonly closeOnOutsideClick: boolean;
  /** Delay time for display (in milliseconds) */
  readonly openDelay: number;
  /** Delay time for hiding (in milliseconds) */
  readonly closeDelay: number;
  /** Component destroyed */
  readonly isDestroyed: boolean;
  /** Stack content element */
  readonly contentRef: Ref<HTMLElement | null>;
  /** Activator element */
  readonly activator: HTMLElement | undefined;
  /** Backdrop element */
  readonly backdropRef: Ref<HTMLElement | null>;
  /** Stack type */
  readonly stackType?: string | symbol;
  /**
   * Inactivate the stack and disable all display processing
   */
  readonly disabled: boolean;
  /**
   * If the asynchronous resolution handler is in progress, its type.
   */
  readonly guardInProgressType: null | 'cancel' | 'resolve';
  /**
   * A boolean flag indicating whether the guard process is currently in progress.
   * When true, it signifies that the guard is actively executing.
   */
  readonly guardInProgress: boolean;
  /**
   * The VStackControl instance in the parent hierarchy of the component tree.
   */
  readonly parent: VStackControl | undefined;
  /**
   * List of VStackControl instances located below this component in the component tree.
   */
  readonly children: VStackControl[];
  /**
   * List of all nested VStackControl instances, including children.
   */
  readonly allChildren: VStackControl[];
  /**
   * Whether the mouse pointer is hovering over its activator or stack content.
   */
  readonly isHovered: boolean;
  /**
   * Whether the specified element is part of its activator or stack element.
   * @param el - Element
   */
  contains(el: Element): boolean;

  /** @private */
  readonly _: {
    readonly attrs: Record<string, unknown>;
    /**
     * State of the stack control
     *
     * @see {@link VStackControlState}
     */
    readonly state: VStackControlState;
    /**
     * Attributes to apply to the stack element's activator
     *
     * @see {@link VStackActivatorAttributes}
     */
    readonly activatorAttrs: VStackActivatorAttributes;
    /** Transition settings */
    readonly Transition: {
      readonly Ctor: typeof Transition;
      readonly props: any;
    };
    /**
     * Keyboard composable
     *
     * @see {@link UseKeyboardRef}
     */
    readonly keyboard: UseKeyboardRef;
    /** Listener object related to transitions */
    readonly transitionListeners: {
      onBeforeEnter: (el: HTMLElement) => void;
      onAfterEnter: (el: HTMLElement) => void;
      onEnterCancelled: (el: HTMLElement) => void;
      onBeforeLeave: (el: HTMLElement) => void;
      onAfterLeave: (el: HTMLElement) => void;
      onLeaveCancelled: (el: HTMLElement) => void;
    };
    /** Handler to trap focus */
    focusTrapper?: (ev: FocusEvent) => void;
    /**
     * Set the active state
     * @param isActive - active state
     * @param withEmit - Notify of changes
     */
    setIsActive(isActive: boolean, withEmit?: boolean): void;
    /** Clear the auto-hide timer */
    clearTimeoutId(): void;
    /** Perform delayed processing */
    runDelay(prop: number | DelayTimerProps, cb: () => any): void;
    /** Clear the delayed processing queue */
    clearDelay(): void;
    /** Trap focus */
    trapFocus(ev?: FocusEvent): boolean | void;
    /** Prepare handler for focus trapping */
    setupFocusTrapper(): void;
    /** Remove handler for focus trapping */
    removeFocusTrapper(): void;
    /** Update focus trap settings */
    checkFocusTrap(): void;
    /** Set rendering request */
    setNeedRender(needRender: boolean): void;
    /** Process for determining hide on outside-click */
    outsideClickCloseConditional(ev: PointerEvent, pre?: boolean): boolean;
    /** Clear guard effect */
    clearGuardEffect(): void;
    joinChild(child: VStackControl): () => void;
  };
  /**
   * Set the activator
   *
   * @param query - Specifying the activator element or its query
   *
   * @see {@link VStackActivatorQuery}
   */
  setActivator(query: VStackActivatorQuery): this;
  /** Show the stack */
  show(): Promise<void>;
  /** Toggle the display state */
  toggle(): Promise<void>;
  /**
   * Close the stack
   *
   * @param opts - Close option
   *
   * @see {@link VStackCloseOptions}
   */
  close(opts?: VStackCloseOptions): Promise<void>;
  /**
   * Confirm the stack input
   *
   * The stack will close with the `force` option.
   *
   * @param payload - The confirmed value (if any)
   */
  resolve(payload?: any): Promise<void | undefined | false>;
  /**
   * Cancel the stack input
   *
   * @param force - Forcefully close
   */
  cancel(force?: boolean): Promise<void>;
  /**
   * Render the stack
   *
   * @param fn - Renderer
   * @param opts - Rendering options
   */
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
  /** Bring the stack to the forefront */
  toFront(): void;
  /** Reset the stack input */
  resetValue(): void;
  /**
   * Check if the stack is in the foreground
   * @param filter - Exclude filter for specific stacks
   */
  isFront(filter?: (control: VStackControl) => boolean): boolean;

  /**
   * If the specified element is a comprehensive descendant of this stack or is the same, it returns the included element.
   *
   * @param other - The element to be checked.
   * @param includingActivator - Check if it might be included in the activator element.
   */
  getContainsOrSameElement(
    other: Node | Event | EventTarget | null | undefined,
    includingActivator?: boolean,
  ): HTMLElement | undefined;
  /**
   * If the specified element is a comprehensive descendant of this stack or is the same, it returns `true`.
   *
   * @param other - The element to be checked.
   * @param includingActivator - Check if it might be included in the activator element.
   */
  containsOrSameElement(
    other: Node | Event | EventTarget | null | undefined,
    includingActivator?: boolean,
  ): boolean;
  /** Execute guard effect */
  guardEffect(): void;
}

export const stackableEmits = {
  /**
   * Update display state
   * @param modelValue - display state
   */
  'update:modelValue': (modelValue: boolean) => true,
  /**
   * When updating the display state
   * @param modelValue - display state
   */
  change: (modelValue: boolean) => true,
  /**
   * When updating the stack input
   * @param value - Stack input
   */
  payload: (value: any) => true,
  /**
   * When the stack is displayed
   * @param control - Stack control
   */
  show: (control: VStackControl) => true,
  /**
   * When the stack is closed
   * @param control - Stack control
   */
  close: (control: VStackControl) => true,
  /**
   * Before the enter transition starts
   * @param el - Element
   * @param control - Stack control
   */
  beforeEnter: (el: HTMLElement, control: VStackControl) => true,
  /**
   * After the enter transition starts
   * @param el - Element
   * @param control - Stack control
   */
  afterEnter: (el: HTMLElement, control: VStackControl) => true,
  /**
   * When the enter transition start is canceled
   * @param el - Element
   * @param control - Stack control
   */
  enterCancelled: (el: HTMLElement, control: VStackControl) => true,
  /**
   * Before the leave transition starts
   * @param el - Element
   * @param control - Stack control
   */
  beforeLeave: (el: HTMLElement, control: VStackControl) => true,
  /**
   * After the leave transition starts
   * @param el - Element
   * @param control - Stack control
   */
  afterLeave: (el: HTMLElement, control: VStackControl) => true,
  /**
   * When the leave transition start is canceled
   * @param el - Element
   * @param control - Stack control
   */
  leaveCancelled: (el: HTMLElement, control: VStackControl) => true,
};

export type StackableEmits = typeof stackableEmits;

/**
 * Payload for the activator slot
 */
export interface VStackActivatorPayload {
  /**
   * Attributes to apply to the stack element's activator
   *
   * @see {@link VStackActivatorAttributes}
   */
  get attrs(): VStackActivatorAttributes;
  /**
   * Stack control
   *
   * @see {@link VStackControl}
   */
  get control(): VStackControl;
}

export type VStackSlots = {
  default?: (control: VStackControl) => VNodeChild;
  /**
   * Activator rendering slot
   *
   * @param payload - Payload for the activator slot
   *
   * @see {@link VStackActivatorPayload}
   */
  activator?: (payload: VStackActivatorPayload) => VNodeChild;
};

export const V_STACK_SLOTS = defineSlots<VStackSlots>();

type MergeSlots<A extends SlotsType, B extends SlotsType> = SlotsType<
  NonNullable<A[keyof A]> & NonNullable<B[keyof B]>
>;

export type MergeStackBaseSlots<Slots extends SlotsType> = MergeSlots<
  Slots,
  typeof V_STACK_SLOTS
>;

export interface CreateStackablePropsOptions {
  /* extends ColorSchemePropsStaticOptions */
  /** @default "v-stack-fade" */
  defaultTransition?: string;
  /** @default false */
  defaultFocusTrap?: boolean;
  /** @default false */
  defaultFocusRestorable?: boolean;
  /** @default false */
  defaultScrollLock?: boolean;
  /** @default false */
  defaultBackdrop?: string | boolean;
  /** @default true */
  defaultCloseOnOutsideClick?: boolean;
  /** @default true */
  defaultCloseOnNavigation?: boolean;
  /** @default true */
  defaultCloseOnEsc?: boolean;
  /** @default false */
  defaultCloseOnTab?: StackableTabCloseSpec;
  /** @default 0 */
  defaultTimeout?: number;
  /** @default false */
  defaultPersistent?: boolean;
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

/**
 * Specifying the activator element or its query
 */
export type VStackActivatorQuery =
  | string
  | Event
  | Element
  | ComponentPublicInstance
  | (() => Element | ComponentPublicInstance | void | undefined | null);

export type VStackActivatorAttrsObject = HTMLAttributes & Record<string, any>;

export type VStackActivatorAttrsFn = (ctx: {
  control: VStackControl;
}) => VStackActivatorAttrsObject | undefined;

export type VStackActivatorAttrsSpec =
  | VStackActivatorAttrsFn
  | VStackActivatorAttrsObject;

export function createStackableProps<T extends string | JavaScriptTransition>(
  opts: CreateStackablePropsOptions = {},
) {
  const {
    defaultTransition = 'v-stack-fade',
    defaultFocusTrap = false,
    defaultFocusRestorable = false,
    defaultScrollLock = false,
    defaultBackdrop = false,
    defaultCloseOnOutsideClick = true,
    defaultCloseOnNavigation = true,
    defaultCloseOnEsc = true,
    defaultCloseOnTab = false,
    defaultTimeout = 0,
    defaultPersistent = false,
  } = opts;

  return {
    /** Display state */
    modelValue: Boolean,
    /** Do not display until the component is mounted */
    lazyBoot: Boolean,
    /** Stack input */
    value: null,
    /** Class attributes */
    class: null,
    /** Style attributes */
    style: null as unknown as PropType<StyleValue>,
    /**
     * Transition settings
     *
     * @see {@link RawVStackObjectTransitionProp}
     */
    transition: {
      type: [String, Object, Function] as PropType<
        RawVStackObjectTransitionProp<T>
      >,
      default: defaultTransition,
    },
    /**
     * Always draw the stack even when it is invisible
     *
     * If your application relies on drawing small elements in the stack, try this setting
     */
    alwaysRender: Boolean,
    /**
     * Display a backdrop behind the stack
     *
     * If string is specified, it will be displayed in that color
     */
    backdrop: {
      type: [Boolean, String] as PropType<boolean | string>,
      default: defaultBackdrop,
    },
    /**
     * Trap user focus
     */
    focusTrap: {
      type: Boolean,
      default: defaultFocusTrap,
    },
    /**
     * Restore focus when stack is hidden
     */
    focusRestorable: {
      type: Boolean,
      default: defaultFocusRestorable,
    },
    /**
     * Lock document scrolling
     */
    scrollLock: {
      type: Boolean,
      default: defaultScrollLock,
    },
    /**
     * Show stack on activator click
     */
    openOnClick: {
      type: Boolean,
      default: undefined,
    },
    /**
     * Show stack when hovering over activator
     */
    openOnHover: Boolean,
    /**
     * Display stack when opening context menu on activator
     */
    openOnContextmenu: Boolean,
    /**
     * Show stack when focus is on activator
     */
    openOnFocus: {
      type: Boolean,
      default: undefined,
    },
    /**
     * Time to delay display (in milliseconds)
     */
    openDelay: rawNumberProp(0),
    /**
     * Time to delay hiding (in milliseconds)
     */
    closeDelay: rawNumberProp(200),
    /**
     * Close stack when clicking outside the stack
     */
    closeOnOutsideClick: {
      type: Boolean,
      default: defaultCloseOnOutsideClick,
    },
    /**
     * Close stack when ECS key is pressed
     */
    closeOnEsc: {
      type: Boolean,
      default: defaultCloseOnEsc,
    },
    /**
     * Close when the ESC key is pressed
     *
     * @see {@link StackableTabCloseSpec}
     */
    closeOnTab: {
      type: [Boolean, String] as PropType<StackableTabCloseSpec>,
      default: defaultCloseOnTab,
    },
    /**
     * Close stack when navigation occurs
     */
    closeOnNavigation: {
      type: Boolean,
      default: defaultCloseOnNavigation,
    },
    /**
     * Persistently display
     *
     * If this setting is enabled, it will attempt to block hide requests or page transitions
     */
    persistent: {
      type: Boolean,
      default: defaultPersistent,
    },
    /**
     * Inactivate the stack and disable all display processing
     */
    disabled: Boolean,
    /** z index */
    zIndex: rawNumberProp(0),
    /** Timeout setting (milliseconds) */
    timeout: rawNumberProp(defaultTimeout),
    /**
     * Guard navigation while viewing stacks
     *
     * @see {@link VStackNavigationGuard}
     */
    navigationGuard: {
      type: [Boolean, Function] as PropType<boolean | VStackNavigationGuard>,
      default: false,
    },
    /**
     * Show hidden guard effects
     */
    guardEffect: {
      type: [Boolean, String],
      default: true,
    },
    /**
     * Elements to include in the click-outside-directive check
     *
     * By specifying this, it is possible to skip the hiding process when clicking outside the stack elements.
     */
    includeElements: Function as PropType<() => Element[]>,
    /**
     * Specifying the activator element or its query
     *
     * @see {@link VStackActivatorQuery}
     */
    activator: {} as PropType<VStackActivatorQuery>,
    /**
     * Handler function for when the stack is resolved with a positive value.
     *
     * Which may include validation processes or asynchronous submission tasks.
     *
     * @returns A boolean or undefined value or a Promise that resolves to a boolean or undefined value.
     *   - If `false`, the stack resolution is canceled.
     *
     * @see {@link StackableResolveHandler}
     */
    resolveHandler: Function as PropType<StackableResolveHandler>,
    /**
     * Handler function for when the stack is resolved with a negative value.
     *
     * Which may include validation processes or asynchronous submission tasks.
     *
     * @returns A boolean or undefined value or a Promise that resolves to a boolean or undefined value.
     *   - If `false`, the stack resolution is canceled.
     *
     * @see {@link StackableResolveHandler}
     */
    cancelHandler: Function as PropType<StackableResolveHandler>,
    /**
     * Additional attributes to apply to the element attributes of the activator slot parameters
     *
     * If set, the attributes will be added to the `attrs` property
     * object of the activator slot.
     *
     * @see {@link VStackActivatorAttrsSpec}
     */
    activatorAttrs: [Function, Object] as PropType<VStackActivatorAttrsSpec>,

    ...V_STACK_SLOTS(),
  };
}

export type StackablePropsOptions = ReturnType<typeof createStackableProps>;

export type VStackProps = ExtractPropTypes<StackablePropsOptions>;

export type VStackSetupContext = SetupContext<typeof stackableEmits>;

export function createStackableDefine(opts?: CreateStackablePropsOptions) {
  return {
    props: createStackableProps(opts),
    emits: stackableEmits,
  };
}
