import './VCheckbox.scss';
import { defineComponent, computed } from 'vue';
import {
  createFormSelectorItemSettings,
  useFormSelectorItemControl,
} from '@fastkit/vue-form-control';
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
  // eslint-disable-next-line no-shadow
  setup(props, ctx) {
    const nodeControl = useFormSelectorItemControl(props, ctx, {
      nodeType: VUI_CHECKBOX_SYMBOL,
      parentNodeType: VUI_CHECKBOX_GROUP_SYMBOL,
    });

    const control = useControl(props);
    const isIndeterminate = computed(() => props.indeterminate);
    const classes = computed(() => [
      'v-checkbox',
      {
        'v-checkbox--selected': nodeControl.selected,
        'v-checkbox--indeterminate': isIndeterminate.value,
      },
      control.classes.value,
    ]);
    const api = nodeControl.extend({
      get isIndeterminate() {
        return isIndeterminate.value;
      },
    });

    ctx.expose({
      control: api,
    });

    const slots = {
      input: () => nodeControl.createInputElement({ type: 'checkbox' }),
      faux: () => <span class="v-checkbox__faux"></span>,
      label: () => ctx.slots.default?.(),
    };

    return () => (
      <VCheckable
        class={classes.value}
        checked={nodeControl.selected || isIndeterminate.value}
        invalid={nodeControl.invalid}
        disabled={nodeControl.isDisabled}
        readonly={nodeControl.isReadonly}
        v-slots={slots}
      />
    );
  },
});
