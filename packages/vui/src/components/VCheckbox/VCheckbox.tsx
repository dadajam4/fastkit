import './VCheckbox.scss';
import { defineComponent, renderSlot, computed } from 'vue';
import {
  createFormSelectorItemSettings,
  useFormSelectorItemControl,
} from '@fastkit/vue-kit';
import { createControlProps, useControl } from '../../composables';
import {
  VUI_CHECKBOX_GROUP_SYMBOL,
  VUI_CHECKBOX_SYMBOL,
} from '../../injections';
import { VCheckable } from '../VCheckable';

const { props, emits } = createFormSelectorItemSettings();

export const VCheckbox = defineComponent({
  name: 'VCheckbox',
  props: {
    ...props,
    ...createControlProps(),
    indeterminate: Boolean,
  },
  emits,
  setup(props, ctx) {
    const nodeControl = useFormSelectorItemControl(props, ctx, {
      nodeType: VUI_CHECKBOX_SYMBOL,
      parentNodeType: VUI_CHECKBOX_GROUP_SYMBOL,
    });
    const control = useControl(props);
    const isIndeterminate = computed(() => props.indeterminate);
    return {
      ...nodeControl.expose(),
      ...control,
      isIndeterminate,
    };
  },
  render() {
    const { nodeControl, isIndeterminate } = this;
    return (
      <VCheckable
        class={[
          'v-checkbox',
          {
            'v-checkbox--selected': nodeControl.selected,
            'v-checkbox--indeterminate': isIndeterminate,
          },
          this.classes,
        ]}
        checked={this.selected || isIndeterminate}
        invalid={this.invalid}
        disabled={this.isDisabled}
        v-slots={{
          input: () => nodeControl.createInputElement({ type: 'checkbox' }),
          faux: () => <span class="v-checkbox__faux"></span>,
          label: () => renderSlot(this.$slots, 'default'),
        }}
      />
    );
  },
});
