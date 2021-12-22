import './VDialog.scss';
import { defineComponent, ExtractPropTypes } from 'vue';
import { createStackableDefine, createStackActionProps } from '../schemes';
import { useStackControl, useStackAction } from '../composables';
import { ExtractPropInput } from '@fastkit/vue-utils';

const { props, emits } = createStackableDefine({
  defaultTransition: 'v-stack-slide-y',
  defaultFocusTrap: true,
  defaultFocusRestorable: true,
  defaultScrollLock: true,
});

export const stackDialogProps = {
  ...props,
  ...createStackActionProps(),
  dense: Boolean,
};

export type VDialogProps = ExtractPropInput<typeof stackDialogProps>;

export type VDialogResolvedProps = ExtractPropTypes<typeof stackDialogProps>;

export const VDialog = defineComponent({
  name: 'VDialog',
  inheritAttrs: false,
  props: stackDialogProps,
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
        <div
          class={[
            'v-dialog',
            {
              'v-dialog--dense': this.dense,
            },
          ]}
          tabindex="0">
          <div class="v-dialog__scroller">
            <div class="v-dialog__centerer">
              {withClickOutside(
                <div class={['v-dialog__content', color.colorClasses.value]}>
                  <div class="v-dialog__body">{children}</div>
                  {$actions.length > 0 && (
                    <div class="v-dialog__actions">{$actions}</div>
                  )}
                </div>,
              )}
            </div>
          </div>
        </div>
      );
    });
  },
});

export type VDialogStatic = typeof VDialog;
