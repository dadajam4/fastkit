import {
  reactive,
  computed,
  Transition,
  onBeforeMount,
  onMounted,
  onBeforeUnmount,
  Teleport,
  watch,
  ref,
  VNode,
  withDirectives,
  vShow,
  nextTick,
  DirectiveArguments,
  cloneVNode,
} from 'vue';
import { useColorClasses } from '@fastkit/vue-color-scheme';
import { toInt, IN_WINDOW } from '@fastkit/helpers';
import { attemptFocus, focusFirstDescendant } from '@fastkit/dom';
import { StyleValue } from '@fastkit/vue-utils';
import { clickOutsideDirectiveArgument } from '@fastkit/vue-click-outside';
import { bodyScrollLockDirectiveArgument } from '@fastkit/vue-body-scroll-lock';
import { useKeyboard } from '@fastkit/vue-keyboard';
import { useRouter } from 'vue-router';
import {
  VStackControlState,
  VStackControl,
  VStackProps,
  VStackSetupContext,
  VStackSlots,
  VStackActivatorAttributes,
  VStackNavigationGuard,
} from '../schemes';
import { useVueStack } from './service';
import { useStackRoot } from './root';

export type VStackCloseReason = 'indeterminate' | 'resolved' | 'canceled';

export interface UseStackControlOptions {
  onContentMounted?: (content: HTMLElement) => any;
  onContentDetached?: () => any;
  transitionResolver?: () => string;
  stackType?: string | symbol;
}

const outsideClickControlFilter = (control: VStackControl) =>
  control.closeOnOutsideClick;

export function useStackControl(
  props: VStackProps,
  ctx: VStackSetupContext,
  opts: UseStackControlOptions = {},
) {
  const { onContentMounted, onContentDetached, transitionResolver } = opts;

  const router = useRouter();

  const beforeEachHookRemover = router.beforeEach(async (to, from) => {
    if (!control.isActive) return true;
    const result = await navigationGuard.value(to, from);
    if (!result) {
      control.guardEffect();
    }
    return result;
  });

  const afterEachHookRemover = router.afterEach(() => {
    if (control.closeOnNavigation) {
      control.close({ force: true });
    }
  });

  const $vstack = useVueStack();
  const rootControl = useStackRoot();
  const color = useColorClasses(props, { useRootThemeDefault: true });
  const state = reactive<VStackControlState>({
    // id,
    isActive: props.lazyBoot ? false : props.modelValue,
    activator: null,
    closeReason: 'indeterminate',
    initialValue: props.value,
    inputValue: props.value,
    showing: false,
    closing: false,
    activateOrder: 0,
    timeoutId: null,
    delayTimers: [],
    needRender: false,
    guardAnimating: false,
    guardAnimateTimeId: null,
    booted: false,
    isDestroyed: false,
  });

  const transitioning = computed(() => state.showing || state.closing);
  const persistent = computed(() => props.persistent);
  const closeOnEsc = computed(() => props.closeOnEsc);
  const closeOnNavigation = computed(() => props.closeOnNavigation);
  const closeOnOutsideClick = computed(() => props.closeOnOutsideClick);
  const alwaysRender = computed(() => props.alwaysRender);
  const guardEffect = computed(() => props.guardEffect);
  const scrollLock = computed(() => props.scrollLock);
  const timeout = computed(() => toInt(props.timeout));
  const openDelay = computed(() => toInt(props.openDelay));
  const closeDelay = computed(() => toInt(props.closeDelay));
  const contentRef = ref<null | HTMLElement>(null);
  const backdropRef = ref<null | HTMLElement>(null);
  const focusTrap = computed(() => props.focusTrap);
  const focusRestorable = computed(() => props.focusRestorable);
  const computedActivator = computed(() => props.activator);
  const backdrop = computed(() => {
    const { backdrop } = props;
    if (!backdrop) return;
    const index = zIndex.value;
    const style = {
      zIndex: index,
      backgroundColor: typeof backdrop === 'string' ? backdrop : undefined,
    };
    return (
      <div
        class="v-stack-backdrop"
        style={style}
        v-show={control.isActive}
        ref={backdropRef}></div>
    );
  });
  const navigationGuard = computed<VStackNavigationGuard>(() => {
    const { navigationGuard } = props;
    if (typeof navigationGuard === 'function') {
      return navigationGuard;
    }
    return function guard() {
      if (navigationGuard || persistent.value) return false;
      return true;
    };
  });

  const inheritedAttrs = computed(() => {
    const { class: classes, style: styles } = props;
    return {
      classes: classes as any,
      styles: [styles] as StyleValue[],
    };
  });

  const zIndex = computed(() => {
    const zIndex = toInt(props.zIndex);
    return zIndex || $vstack.zIndex + control.activateOrder;
  });

  // const isActive = computed<boolean>({
  //   get() {
  //     return state.isActive;
  //   },
  //   set(value) {
  //     state.isActive = value;
  //   },
  // });

  const keyboard = useKeyboard(
    {
      key: 'Escape',
      handler: (ev) => {
        if (!closeOnEsc.value || !control.isFront()) return;
        if (persistent.value) {
          control.guardEffect();
          return;
        }
        control.cancel(false);
      },
    },
    { autorun: true },
  );

  const activatorAttrs = computed<VStackActivatorAttributes>(() => {
    if (props.openOnHover) {
      return {
        onMouseenter: (ev) => {
          if (control.transitioning) return;
          privateApi.clearDelay();
          if (control.isActive) return;
          privateApi.runDelay('openDelay', () => {
            !control.isActive && control.show(ev);
          });
        },
        onMouseleave: (ev) => {
          privateApi.clearDelay();
          if (!control.isActive) return;
          privateApi.runDelay('closeDelay', () => {
            if (!control.isActive) return;
            const $content = contentRef.value;
            const relatedTarget = ev.relatedTarget as HTMLElement;
            if (
              $content &&
              (relatedTarget === $content || $content.contains(relatedTarget))
            ) {
              return;
            }
            const { activator } = state;
            const el =
              activator instanceof Event ? activator.target : activator;

            if (
              el &&
              el instanceof HTMLElement &&
              (relatedTarget === el || el.contains(relatedTarget))
            ) {
              return;
            }
            control.close();
          });
        },
      };
    }
    if (props.openOnContextmenu) {
      return {
        onContextmenu: (ev) => {
          if (ev.defaultPrevented) return;
          ev.preventDefault();
          control.toggle(ev);
        },
      };
    }
    return {
      onClick: (ev) => {
        control.toggle(ev);
      },
    };
  });

  const TransitionDefine = computed(() => {
    if (transitionResolver) {
      return {
        Ctor: Transition,
        props: {
          name: transitionResolver(),
        },
      };
    }
    const { transition } = props;
    if (typeof transition === 'string') {
      return {
        Ctor: Transition,
        props: {
          name: transition,
        },
      };
    } else {
      // const { transition} = transition;
      let Ctor: any = transition.transition;
      let name: string | undefined;

      if (typeof Ctor === 'string' || Ctor == null) {
        name = Ctor || undefined;
        Ctor = Transition;
        // transition.props
      }

      const props = {
        ...transition.props,
      };

      if (name) {
        (props as any).name = name;
      }
      // if (!Ctor)
      // transition.transition
      return {
        Ctor: Transition,
        props,
      };
    }
  });

  const privateApi: VStackControl['_'] = {
    get state() {
      return state;
    },
    get activatorAttrs() {
      return activatorAttrs.value;
    },
    get Transition() {
      return TransitionDefine.value;
    },
    get keyboard() {
      return keyboard;
    },
    transitionListeners: {
      onBeforeEnter: (el) => {
        ctx.emit('beforeEnter', el, control);
      },
      onAfterEnter: (el) => {
        state.showing = false;
        state.closing = false;
        privateApi.clearTimeoutId();
        if (control.timeout) {
          state.timeoutId = window.setTimeout(() => {
            privateApi.clearTimeoutId();
            control.close({ force: true });
          }, control.timeout);
        }
        if (focusTrap.value && control.isFront()) {
          privateApi.trapFocus();
        }
        ctx.emit('afterEnter', el, control);
      },
      onEnterCancelled: (el) => {
        state.showing = false;
        state.closing = false;
        ctx.emit('enterCancelled', el, control);
      },
      onBeforeLeave: (el) => {
        ctx.emit('beforeLeave', el, control);
      },
      onAfterLeave: (el) => {
        state.showing = false;
        state.closing = false;
        onContentDetached && onContentDetached();
        nextTick(() => {
          !control.isActive && privateApi.setNeedRender(false);
        });
        ctx.emit('afterLeave', el, control);
      },
      onLeaveCancelled: (el) => {
        state.showing = false;
        state.closing = false;
        ctx.emit('leaveCancelled', el, control);
      },
    },
    clearTimeoutId: () => {
      if (state.timeoutId !== null) {
        clearTimeout(state.timeoutId);
        state.timeoutId = null;
      }
    },
    setIsActive(value, withEmit = true) {
      if (state.isActive === value) return;
      privateApi.clearTimeoutId();
      value && triggerContentMountedTick();
      state.isActive = value;

      withEmit && ctx.emit('update:modelValue', value);
      ctx.emit('change', value);

      if (value) {
        state.showing = true;
        control.toFront();
        ctx.emit('show', control);
      } else {
        state.closing = true;
        ctx.emit('close', control);
      }
    },
    clearDelay() {
      for (const timer of state.delayTimers) {
        clearTimeout(timer);
      }
      state.delayTimers = [];
    },
    runDelay(prop, cb) {
      privateApi.clearDelay();
      const ammount = typeof prop === 'number' ? prop : control[prop];
      if (!ammount) return cb();
      state.delayTimers.push(window.setTimeout(cb, toInt(ammount)));
    },
    trapFocus(ev) {
      const $content = contentRef.value;
      if (!$content) return;
      if (ev && $content.contains(ev.target as any)) {
        return;
      }

      const nodes = [$content, ...Array.from($content.childNodes)];

      for (const node of nodes) {
        if (
          attemptFocus(node as HTMLElement) ||
          focusFirstDescendant(node as HTMLElement)
        ) {
          return true;
        }
      }
      return false;
    },
    setupFocusTrapper() {
      privateApi.removeFocusTrapper();
      privateApi.focusTrapper = (ev) => {
        if ($vstack.isFront(control)) {
          privateApi.trapFocus(ev);
        }
      };
      document.addEventListener('focus', privateApi.focusTrapper, true);
    },
    removeFocusTrapper() {
      if (privateApi.focusTrapper) {
        document.removeEventListener('focus', privateApi.focusTrapper, true);
        delete privateApi.focusTrapper;
      }
    },
    checkFocusTrap() {
      if (!IN_WINDOW) return;
      if (control.isActive && focusTrap.value) {
        privateApi.setupFocusTrapper();
      } else {
        privateApi.removeFocusTrapper();
      }
    },
    setNeedRender(needRender: boolean) {
      if (!needRender) state.activateOrder = 0;
      state.needRender = alwaysRender.value || needRender;
    },
    outsideClickCloseConditional(ev, pre) {
      if (
        !closeOnOutsideClick.value ||
        state.showing ||
        !control.isFront(outsideClickControlFilter) ||
        $vstack.someTransitioning()
      ) {
        return false;
      }

      if (!pre && persistent.value) {
        control.guardEffect();
        return false;
      }

      return control.isActive;
    },
    clearGuardEffect() {
      if (state.guardAnimateTimeId !== null) {
        clearTimeout(state.guardAnimateTimeId);
      }
      state.guardAnimating = false;
    },
  };

  const control: VStackControl = {
    __isStackControl: true,
    _: privateApi,
    get $service() {
      return $vstack;
    },
    get stackType() {
      return opts.stackType;
    },
    get transitioning() {
      return transitioning.value;
    },
    get persistent() {
      return persistent.value;
    },
    get closeOnEsc() {
      return closeOnEsc.value;
    },
    get closeOnNavigation() {
      return closeOnNavigation.value;
    },
    get closeOnOutsideClick() {
      return closeOnOutsideClick.value;
    },
    get zIndex() {
      return zIndex.value;
    },
    get isActive() {
      return state.isActive;
    },
    get timeout() {
      return timeout.value;
    },
    get color() {
      return color;
    },
    get classes() {
      const classes = ['v-stack', inheritedAttrs.value.classes];
      if (state.guardAnimating) {
        classes.push('v-stack-guard-effect');
      }
      return classes;
    },
    get styles() {
      return [
        ...inheritedAttrs.value.styles,
        {
          zIndex: zIndex.value,
        },
      ];
    },
    get activateOrder() {
      return state.activateOrder;
    },
    get isResolved() {
      return state.closeReason === 'resolved';
    },
    get isCanceled() {
      return state.closeReason === 'canceled';
    },
    get value() {
      return control.isResolved ? state.inputValue : undefined;
    },
    set value(value) {
      if (state.inputValue !== value) {
        state.inputValue = value;
        ctx.emit('payload', value);
      }
    },
    get focusRestorable() {
      return focusRestorable.value;
    },
    get openDelay() {
      return openDelay.value;
    },
    get closeDelay() {
      return closeDelay.value;
    },
    get isDestroyed() {
      return state.isDestroyed;
    },
    get contentRef() {
      return contentRef;
    },
    get activator() {
      return state.activator;
    },
    get backdropRef() {
      return backdropRef;
    },
    show(activator) {
      let _activator: HTMLElement | null;
      const propActivator = computedActivator.value;

      if (propActivator === false) {
        _activator = null;
      } else {
        const __activator = activator || propActivator;
        if (__activator instanceof Event) {
          _activator = __activator.target as HTMLElement | null;
        } else if (__activator instanceof Element) {
          _activator = __activator as HTMLElement;
        } else {
          _activator = document.activeElement as HTMLElement | null;
        }
      }

      state.activator = _activator;

      // Fix for bubbling cue.
      return new Promise((resolve) =>
        setTimeout(() => {
          privateApi.setIsActive(true);
          resolve();
        }, 0),
      );
    },
    toggle(activator) {
      return control.isActive ? control.close() : control.show(activator);
    },
    close(opts = {}) {
      const { force = false, reason = 'indeterminate' } = opts;
      if (persistent.value && !force) return Promise.resolve();
      state.closeReason = reason;
      privateApi.setIsActive(false);
      return Promise.resolve();
    },
    resetValue() {
      control.value = state.initialValue;
    },
    resolve(value) {
      if (value !== undefined) {
        control.value = value;
      }
      return this.close({
        force: true,
        reason: 'resolved',
      });
    },
    cancel(force) {
      return control.close({
        force,
        reason: 'canceled',
      });
    },
    toFront() {
      const front = $vstack.getFront();
      const maxActivateOrder = front ? front.activateOrder : 0;
      state.activateOrder = maxActivateOrder + 1;
    },
    isFront(filter?: (control: VStackControl) => boolean) {
      return $vstack.isFront(control, filter);
    },
    guardEffect() {
      if (!guardEffect.value) return;
      state.guardAnimating = false;
      nextTick(() => {
        state.guardAnimating = true;
        state.guardAnimateTimeId = window.setTimeout(
          privateApi.clearGuardEffect,
          150,
        );
      });
    },
    render(fn, opts = {}) {
      const { booted, needRender } = state;
      const { default: defaultSlot, activator: activatorSlot } =
        ctx.slots as VStackSlots;
      const { transitionListeners, Transition: TransitionDefine } = privateApi;

      const $activator =
        activatorSlot &&
        activatorSlot({
          attrs: privateApi.activatorAttrs,
          control,
        });

      const $contents: VNode[] = [];
      // if ($activator) {
      //   $contents.push(...$activator);
      // }

      const rootContainer = rootControl.root.value;

      if (rootContainer) {
        let $child: VNode | undefined;
        if (booted && needRender) {
          const children = defaultSlot && defaultSlot(control);
          const _clickOutside = clickOutsideDirectiveArgument({
            handler: (ev) => {
              control.close();
            },
            conditional: privateApi.outsideClickCloseConditional,
          });
          let usedClickOutside = false;
          const withClickOutside = (node: VNode) => {
            usedClickOutside = true;
            return withDirectives(node, [_clickOutside]);
          };
          const node = fn(children, { withClickOutside });
          const dirs: DirectiveArguments = [
            [vShow, control.isActive],
            bodyScrollLockDirectiveArgument(
              scrollLock.value && control.isActive,
            ),
          ];
          if (!usedClickOutside) {
            dirs.push(_clickOutside);
          }

          $child = withDirectives(node, dirs);

          $child = cloneVNode($child, {
            class: control.classes,
            style: control.styles,
            ref: contentRef,
          });
        }

        const { transition } = opts;
        let $transition: VNode;

        if (transition) {
          $transition = cloneVNode(transition($child), transitionListeners);
        } else {
          const { Ctor: TransitionCtor, props: transitionProps } =
            TransitionDefine;

          $transition = (
            <TransitionCtor
              {...transitionProps}
              {...(transitionListeners as any)}>
              {$child}
            </TransitionCtor>
          );
        }

        if (state.booted) {
          $contents.push(
            <Teleport to={rootContainer}>
              {[
                <Transition name="v-stack-fade">{backdrop.value}</Transition>,
                $transition,
              ]}
            </Teleport>,
          );
        }
      }

      return (
        <>
          {$activator}
          {$contents}
        </>
      );
    },
  };

  onBeforeMount(() => {
    $vstack.add(control);
  });

  onMounted(() => {
    state.booted = true;
    if (props.lazyBoot && props.modelValue) {
      control.show();
    }
    if (control.isActive) {
      control.toFront();
      triggerContentMountedTick();
      privateApi.checkFocusTrap();
    }
  });

  onBeforeUnmount(() => {
    privateApi.clearDelay();
    privateApi.clearTimeoutId();
    privateApi.removeFocusTrapper();
    state.isDestroyed = true;
    state.activator = null;
    beforeEachHookRemover();
    afterEachHookRemover();
    $vstack.remove(control);
  });

  watch(
    () => props.modelValue,
    (modelValue) => {
      privateApi.setIsActive(modelValue, false);
    },
  );

  watch(
    () => props.value,
    (value) => {
      state.inputValue = value;
      state.initialValue = value;
    },
  );

  watch(
    () => state.isActive,
    (value) => {
      if (value) {
        privateApi.setNeedRender(true);
      } else {
        if (state.activator) {
          if (focusRestorable.value) {
            const el =
              state.activator instanceof Event
                ? state.activator.target
                : state.activator;
            el && attemptFocus(el as HTMLElement);
          }
          state.activator = null;
        }
      }
      privateApi.checkFocusTrap();
    },
    { immediate: true },
  );

  watch(
    () => props.alwaysRender,
    (value) => {
      if (value) {
        privateApi.setNeedRender(true);
      }
    },
    { immediate: true },
  );

  function triggerContentMountedTick(count = 0) {
    const content = contentRef.value;
    if (content) {
      // this.autofocus();
      onContentMounted && onContentMounted(content);
      return;
    }

    count++;

    if (count < 3) {
      nextTick(() => {
        triggerContentMountedTick(count);
      });
    }
  }

  return control;
}
