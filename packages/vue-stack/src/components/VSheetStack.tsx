import './VSheetStack.scss';
import {
  defineComponent,
  ExtractPropTypes,
  PropType,
  VNodeChild,
  computed,
} from 'vue';
import { createStackableDefine, VStackSlots, VStackControl } from '../schemes';
import { useStackControl } from '../composables';
import { ExtractPropInput } from '@fastkit/vue-utils';

const { props, emits } = createStackableDefine({
  defaultTransition: 'v-sheet-stack',
  defaultFocusTrap: true,
  defaultFocusRestorable: true,
  defaultScrollLock: true,
});

export interface VSheetStackSlots extends VStackSlots {
  header?: (control: VStackControl) => VNodeChild;
}

export const sheetStackProps = {
  ...props,
  'v-slots': undefined as unknown as PropType<VSheetStackSlots>,
};

export type VSheetStackProps = ExtractPropInput<typeof sheetStackProps>;

export type VSheetStackResolvedProps = ExtractPropTypes<typeof sheetStackProps>;

const SHEET_STACK_TYPE = Symbol();

export const VSheetStack = defineComponent({
  name: 'VSheetStack',
  inheritAttrs: false,
  props: sheetStackProps,
  emits,
  setup(props, ctx) {
    const stackControl = useStackControl(props, ctx, {
      stackType: SHEET_STACK_TYPE,
    });
    const hasActiveChild = computed(() => {
      const myIndex = stackControl.zIndex;
      const stacks = stackControl.$service
        .getActiveStacks()
        .filter((stack) => stack.stackType === SHEET_STACK_TYPE);
      return stacks.some((stack) => stack.zIndex > myIndex);
    });
    return {
      stackControl,
      hasActiveChild,
    };
  },
  render() {
    const { render, color } = this.stackControl;
    const headerSlot = this.$slots.header;
    return render((children) => {
      return (
        <div
          class={[
            'v-sheet-stack',
            {
              'v-sheet-stack--has-active-child': this.hasActiveChild,
            },
            color.colorClasses.value,
          ]}
          tabindex="0">
          {headerSlot && (
            <div class="v-sheet-stack__header">
              {headerSlot(this.stackControl)}
            </div>
          )}
          <div class="v-sheet-stack__scroller">{children}</div>
        </div>
      );
    });
  },
});

export type VSheetStackStatic = typeof VSheetStack;
