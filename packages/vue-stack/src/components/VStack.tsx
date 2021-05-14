import { defineComponent, VNode, PropType, Transition, computed } from 'vue';
import {
  createEmitDefine,
  rawNumberProp,
  clickOutsideDirective,
} from '@fastkit/vue-utils';
import { NavigationGuard } from 'vue-router';
import { VColorSchemeProvider } from '@fastkit/vue-color-scheme';

export type VStackCloseState = 'indeterminate' | 'resolve' | 'cancel';

export interface VStackCloseOption {
  force?: boolean;
  state?: VStackCloseState;
}

// type DelayTimerProps = 'openDelay' | 'closeDelay';

export interface VStackActivatorScopedListeners {
  click?: (ev: MouseEvent) => void;
  contextmenu?: (ev: MouseEvent) => void;
  mouseenter?: (ev: MouseEvent) => void;
  mouseleave?: (ev: MouseEvent) => void;
}

const emits = createEmitDefine({
  change: (modelValue: boolean) => true,
  payload: (value: any) => true,
  show: (stack: any) => true,
  close: (stack: any) => true,
  beforeEnter: (el: HTMLElement, stack: any) => true,
  afterEnter: (el: HTMLElement, stack: any) => true,
  enterCancelled: (el: HTMLElement, stack: any) => true,
  beforeLeave: (el: HTMLElement, stack: any) => true,
  afterLeave: (el: HTMLElement, stack: any) => true,
  leaveCancelled: (el: HTMLElement, stack: any) => true,
});

type VStackSlots = {
  default?: (stack: VStackInstance) => VNode[];
  activator?: (
    scopedListeners: VStackActivatorScopedListeners,
    stack: VStackInstance,
  ) => VNode[];
};

export const VStack = defineComponent({
  name: 'VStack',
  directives: {
    clickOutside: clickOutsideDirective,
  },
  mixins: [VColorSchemeProvider],
  props: {
    modelValue: Boolean,
    transition: {
      type: [String, Object] as PropType<string | typeof Transition>,
      default: '',
    },
    alwaysRender: Boolean,
    backdrop: {
      type: [Boolean, String] as PropType<boolean | string>,
      default: false,
    },
    openOnHover: Boolean,
    openOnContextmenu: Boolean,
    openDelay: rawNumberProp(0),
    closeDelay: rawNumberProp(200),
    closeOnOutsideClick: {
      type: Boolean,
      default: true,
    },
    closeOnEsc: {
      type: Boolean,
      default: true,
    },
    closeOnNavigation: {
      type: Boolean,
      default: true,
    },
    persistent: Boolean,
    timeout: rawNumberProp(0),
    navigationGuard: {
      type: [Boolean, Function] as PropType<boolean | NavigationGuard>,
      default: false,
    },
    // eslint-disable-next-line vue/prop-name-casing
    'v-slots': {
      type: Object as PropType<VStackSlots>,
      default: undefined,
    },
    ...emits.props,
  },
  emits: emits.emits,
  setup(props, ctx) {
    const _activatorScopedListenrs = computed<VStackActivatorScopedListeners>(
      () => {
        if (props.openOnHover) {
          return {
            mouseenter: (ev) => {
              console.log(ev);
            },
            mouseleave: (ev) => {
              console.log(ev);
            },
          };
        }
        if (props.openOnContextmenu) {
          return {
            contextmenu: (ev) => {
              console.log(ev);
            },
          };
        }
        return {
          click: (ev) => {
            console.log(ev);
          },
        };
      },
    );

    const _transitionListeners = {
      beforeEnter: (el: HTMLElement) => {
        // this.$vstack.addTransitioningStack(this);
        ctx.emit('beforeEnter', el as HTMLElement, this);
      },
      afterEnter: (el: HTMLElement) => {
        // this.nowShowing = false;
        // this.nowClosing = false;
        // this.$vstack.removeTransitioningStack(this);
        // this.clearStackTimeoutId();
        // if (this.computedTimeout) {
        //   this.stackTimeoutId = window.setTimeout(() => {
        //     this.clearStackTimeoutId();
        //     this.close({ force: true });
        //   }, this.computedTimeout);
        // }
        ctx.emit('afterEnter', el as HTMLElement, this);
      },
      enterCancelled: (el: HTMLElement) => {
        // this.nowShowing = false;
        // this.nowClosing = false;
        // this.$vstack.removeTransitioningStack(this);
        ctx.emit('enterCancelled', el as HTMLElement, this);
      },
      beforeLeave: (el: HTMLElement) => {
        // this.$vstack.addTransitioningStack(this);
        ctx.emit('beforeLeave', el as HTMLElement, this);
      },
      afterLeave: (el: HTMLElement) => {
        // this.nowShowing = false;
        // this.nowClosing = false;
        // this.setNeedRender(false);
        // this.$vstack.removeTransitioningStack(this);
        ctx.emit('afterLeave', el as HTMLElement, this);
      },
      leaveCancelled: (el: HTMLElement) => {
        // this.nowShowing = false;
        // this.nowClosing = false;
        // this.$vstack.removeTransitioningStack(this);
        ctx.emit('leaveCancelled', el as HTMLElement, this);
      },
    };

    const TransitionComponent = computed(() => {
      const { transition } = props;
      return typeof transition === 'string' ? Transition : transition;
    });

    return {
      /** @protected */
      _activatorScopedListenrs,

      /** @protected */
      _transitionListeners,

      /** @private */
      TransitionComponent,
    };
  },
  render() {
    const { TransitionComponent, $slots } = this;
    const { default: defaultSlot, activator: activatorSlot } =
      $slots as VStackSlots;

    const $activator =
      activatorSlot && activatorSlot(this._activatorScopedListenrs, this);

    const $children = (
      <TransitionComponent v-on={this._transitionListeners}>
        {defaultSlot && defaultSlot(this)}
      </TransitionComponent>
    );

    return (
      <>
        {$activator}
        {$children}
      </>
    );
  },
});

type VStackInstance = InstanceType<typeof VStack>;
