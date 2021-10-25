import './VSwitch.scss';
import { defineComponent, renderSlot } from 'vue';
import {
  createFormSelectorItemSettings,
  useFormSelectorItemControl,
} from '@fastkit/vue-kit';
import { createControlProps, useControl } from '../../composables';
import { VUI_SWITCH_GROUP_SYMBOL, VUI_SWITCH_SYMBOL } from '../../injections';
import { VCheckable } from '../VCheckable';

const { props, emits } = createFormSelectorItemSettings();

export const VSwitch = defineComponent({
  name: 'VSwitch',
  props: {
    ...props,
    ...createControlProps(),
  },
  emits,
  setup(props, ctx) {
    const nodeControl = useFormSelectorItemControl(props, ctx, {
      nodeType: VUI_SWITCH_SYMBOL,
      parentNodeType: VUI_SWITCH_GROUP_SYMBOL,
    });
    const control = useControl(props);
    return {
      ...nodeControl.expose(),
      ...control,
    };
  },
  render() {
    const { nodeControl } = this;
    return (
      <VCheckable
        class={[
          'v-switch',
          {
            'v-switch--selected': nodeControl.selected,
            'v-switch--disabled': nodeControl.isDisabled,
          },
          this.classes,
        ]}
        checked={this.selected}
        invalid={this.invalid}
        disabled={this.isDisabled}
        readonly={this.isReadonly}
        v-slots={{
          input: () => nodeControl.createInputElement({ type: 'checkbox' }),
          icon: () => (
            <span class="v-switch__faux">
              <span class="v-switch__faux__pin"></span>
            </span>
          ),
          label: () => renderSlot(this.$slots, 'default'),
        }}
      />
    );
  },
});
