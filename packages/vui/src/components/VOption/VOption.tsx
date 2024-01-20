import './VOption.scss';
import { defineComponent, computed } from 'vue';
import {
  createFormSelectorItemSettings,
  useFormSelectorItemControl,
} from '@fastkit/vue-form-control';
import { createControlProps, useControl } from '../../composables';
import { VUI_SELECT_SYMBOL, VUI_OPTION_SYMBOL } from '../../injections';

const { props, emits } = createFormSelectorItemSettings();

export const VOption = defineComponent({
  name: 'VOption',
  props: {
    ...props,
    ...createControlProps(),
  },
  emits,
  // eslint-disable-next-line no-shadow
  setup(props, ctx) {
    const nodeControl = useFormSelectorItemControl(props, ctx, {
      nodeType: VUI_OPTION_SYMBOL,
      parentNodeType: VUI_SELECT_SYMBOL,
    });
    const control = useControl(props);
    const classes = computed(() => [
      'v-option',
      {
        'v-option--selected': nodeControl.selected,
        'v-option--has-not-value': !nodeControl.hasValue,
        'v-option--disabled': nodeControl.isDisabled,
      },
      control.classes.value,
    ]);

    return () => (
      <label
        class={classes.value}
        onClick={nodeControl.handleClickElement}
        tabindex={nodeControl.tabindex}
        data-value={nodeControl.propValue}
        aria-disabled={nodeControl.isDisabled}>
        <span class="v-option__label">{ctx.slots.default?.()}</span>
      </label>
    );
  },
});
