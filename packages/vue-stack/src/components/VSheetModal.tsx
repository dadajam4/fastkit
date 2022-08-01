import './VSheetModal.scss';
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
  defaultTransition: 'v-sheet-modal',
  defaultFocusTrap: true,
  defaultFocusRestorable: true,
  defaultScrollLock: true,
});

export interface VSheetModalSlots extends VStackSlots {
  header?: (control: VStackControl) => VNodeChild;
}

export const sheetModalProps = {
  ...props,
  header: Function as PropType<(control: VStackControl) => VNodeChild>,
  'v-slots': undefined as unknown as PropType<VSheetModalSlots>,
};

export type VSheetModalProps = ExtractPropInput<typeof sheetModalProps>;

export type VSheetModalResolvedProps = ExtractPropTypes<typeof sheetModalProps>;

const SHEET_STACK_TYPE = Symbol();

export const VSheetModal = defineComponent({
  name: 'VSheetModal',
  inheritAttrs: false,
  props: sheetModalProps,
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
    const headerSlot = this.$slots.header || this.header;
    return render((children) => {
      return (
        <div
          class={[
            'v-sheet-modal',
            {
              'v-sheet-modal--has-active-child': this.hasActiveChild,
            },
            color.colorClasses.value,
          ]}
          tabindex="0">
          {headerSlot && (
            <div class="v-sheet-modal__header">
              {headerSlot(this.stackControl)}
            </div>
          )}
          <div class="v-sheet-modal__scroller">{children}</div>
        </div>
      );
    });
  },
});

export type VSheetModalStatic = typeof VSheetModal;
