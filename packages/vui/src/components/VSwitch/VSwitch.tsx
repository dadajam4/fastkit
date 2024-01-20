import './VSwitch.scss';
import { defineComponent, computed } from 'vue';
import {
  createFormSelectorItemSettings,
  useFormSelectorItemControl,
} from '@fastkit/vue-form-control';
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
  // eslint-disable-next-line no-shadow
  setup(props, ctx) {
    const nodeControl = useFormSelectorItemControl(props, ctx, {
      nodeType: VUI_SWITCH_SYMBOL,
      parentNodeType: VUI_SWITCH_GROUP_SYMBOL,
    });
    const control = useControl(props);
    if (typeof window !== 'undefined') {
      (window as any).yy = {};
      (window as any).yy[String(Date.now())] = nodeControl;
    }

    const classes = computed(() => [
      'v-switch',
      {
        'v-switch--selected': nodeControl.selected,
        'v-switch--disabled': nodeControl.isDisabled,
      },
      control.classes.value,
    ]);

    const slots = {
      input: () => nodeControl.createInputElement({ type: 'checkbox' }),
      icon: () => (
        <span class="v-switch__faux">
          <span class="v-switch__faux__pin"></span>
        </span>
      ),
      label: () => ctx.slots.default?.(),
    };

    ctx.expose({
      control: nodeControl,
    });

    return () => (
      <VCheckable
        class={classes.value}
        checked={nodeControl.selected}
        invalid={nodeControl.invalid}
        disabled={nodeControl.isDisabled}
        readonly={nodeControl.isReadonly}
        v-slots={slots}
      />
    );
  },
});
