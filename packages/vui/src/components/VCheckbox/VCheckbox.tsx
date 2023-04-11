import './VCheckbox.scss';
import { defineComponent, computed } from 'vue';
import {
  createFormSelectorItemSettings,
  useFormSelectorItemControl,
} from '@fastkit/vue-form-control';
import { renderSlotOrEmpty } from '@fastkit/vue-utils';
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
    const { selectorItemControl, isIndeterminate } = this;
    return (
      <VCheckable
        class={[
          'v-checkbox',
          {
            'v-checkbox--selected': selectorItemControl.selected,
            'v-checkbox--indeterminate': isIndeterminate,
          },
          this.classes,
        ]}
        checked={this.selected || isIndeterminate}
        invalid={this.invalid}
        disabled={this.isDisabled}
        readonly={this.isReadonly}
        v-slots={{
          input: () =>
            selectorItemControl.createInputElement({ type: 'checkbox' }),
          faux: () => <span class="v-checkbox__faux"></span>,
          label: () => renderSlotOrEmpty(this.$slots, 'default'),
        }}
      />
    );
  },
});
