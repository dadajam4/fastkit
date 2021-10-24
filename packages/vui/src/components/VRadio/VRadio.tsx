import './VRadio.scss';
import { defineComponent, renderSlot } from 'vue';
import {
  createFormSelectorItemSettings,
  useFormSelectorItemControl,
} from '@fastkit/vue-kit';
import { createControlProps, useControl } from '../../composables';
import { VUI_RADIO_GROUP_SYMBOL, VUI_RADIO_SYMBOL } from '../../injections';
import { VCheckable } from '../VCheckable';

const { props, emits } = createFormSelectorItemSettings();

export const VRadio = defineComponent({
  name: 'VRadio',
  props: {
    ...props,
    ...createControlProps(),
  },
  emits,
  setup(props, ctx) {
    const nodeControl = useFormSelectorItemControl(props, ctx, {
      nodeType: VUI_RADIO_SYMBOL,
      parentNodeType: VUI_RADIO_GROUP_SYMBOL,
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
          'v-radio',
          {
            'v-radio--selected': nodeControl.selected,
          },
          this.classes,
        ]}
        checked={this.selected}
        invalid={this.invalid}
        disabled={this.isDisabled}
        v-slots={{
          input: () => nodeControl.createInputElement({ type: 'radio' }),
          faux: () => <span class="v-radio__faux"></span>,
          label: () => renderSlot(this.$slots, 'default'),
        }}
      />
    );
  },
});
