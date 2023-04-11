import './VOption.scss';
import { defineComponent, computed } from 'vue';
import {
  createFormSelectorItemSettings,
  useFormSelectorItemControl,
} from '@fastkit/vue-form-control';
import { renderSlotOrEmpty } from '@fastkit/vue-utils';
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
  setup(props, ctx) {
    const nodeControl = useFormSelectorItemControl(props, ctx, {
      nodeType: VUI_OPTION_SYMBOL,
      parentNodeType: VUI_SELECT_SYMBOL,
    });
    const control = useControl(props);
    const classes = computed(() => {
      return [
        'v-option',
        {
          'v-option--selected': nodeControl.selected,
          'v-option--has-not-value': !nodeControl.hasValue,
          'v-option--disabled': nodeControl.isDisabled,
        },
        control.classes.value,
      ];
    });
    return {
      ...nodeControl.expose(),
      classes,
    };
  },
  render() {
    const { selectorItemControl, classes } = this;
    return (
      <label
        class={classes}
        onClick={selectorItemControl.handleClickElement}
        tabindex={selectorItemControl.tabindex}
        data-value={selectorItemControl.propValue}
        {...({
          'aria-disabled': selectorItemControl.isDisabled,
        } as any)}>
        <span class="v-option__label">
          {renderSlotOrEmpty(this.$slots, 'default')}
        </span>
      </label>
    );
  },
});
