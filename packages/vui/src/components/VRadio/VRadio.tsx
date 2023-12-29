import './VRadio.scss';
import { defineComponent, computed } from 'vue';
import {
  createFormSelectorItemSettings,
  useFormSelectorItemControl,
} from '@fastkit/vue-form-control';
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
    const classes = computed(() => [
      'v-radio',
      {
        'v-radio--selected': nodeControl.selected,
      },
      control.classes.value,
    ]);
    const slots = {
      input: () => nodeControl.createInputElement({ type: 'radio' }),
      faux: () => <span class="v-radio__faux"></span>,
      label: () => ctx.slots.default?.(),
    };

    return () => {
      return (
        <VCheckable
          class={classes.value}
          checked={nodeControl.selected}
          invalid={nodeControl.invalid}
          disabled={nodeControl.isDisabled}
          readonly={nodeControl.isReadonly}
          v-slots={slots}
        />
      );
    };
  },
});
