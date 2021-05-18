import './VStackDialog.scss';
import { defineComponent } from 'vue';
import { createStackableDefine, createStackActionProps } from '../schemes';
import { useStackControl, useStackAction } from '../hooks';

const { props, emits } = createStackableDefine({
  defaultTransition: 'v-stack-slide-y',
  defaultFocusTrap: true,
  defaultFocusRestorable: true,
  defaultScrollLock: true,
});

const dialogProps = {
  ...props,
  ...createStackActionProps(),
};

export const VStackDialog = defineComponent({
  name: 'VStackDialog',
  inheritAttrs: false,
  props: dialogProps,
  emits,
  setup(props, ctx) {
    const stackControl = useStackControl(props, ctx);
    const actionControl = useStackAction(props, stackControl);
    return {
      stackControl,
      actionControl,
    };
  },
  render() {
    const { render, color } = this.stackControl;
    const { $actions } = this.actionControl;
    return render((children, { withClickOutside }) => {
      return (
        <div class="v-stack-dialog" tabindex="0">
          <div class="v-stack-dialog__scroller">
            <div class="v-stack-dialog__centerer">
              {withClickOutside(
                <div
                  class={['v-stack-dialog__content', color.colorClasses.value]}>
                  <div class="v-stack-dialog__body">{children}</div>
                  <div class="v-stack-dialog__actions">{$actions}</div>
                </div>,
              )}
            </div>
          </div>
        </div>
      );
    });
  },
});
