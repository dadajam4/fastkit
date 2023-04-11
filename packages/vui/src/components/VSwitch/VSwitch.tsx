import './VSwitch.scss';
import { defineComponent } from 'vue';
import {
  createFormSelectorItemSettings,
  useFormSelectorItemControl,
} from '@fastkit/vue-form-control';
import { renderSlotOrEmpty } from '@fastkit/vue-utils';
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
    if (typeof window !== 'undefined') {
      (window as any).yy = {};
      (window as any).yy[String(Date.now())] = nodeControl;
    }
    return {
      ...nodeControl.expose(),
      ...control,
    };
  },
  render() {
    const { selectorItemControl } = this;
    return (
      <VCheckable
        class={[
          'v-switch',
          {
            'v-switch--selected': selectorItemControl.selected,
            'v-switch--disabled': selectorItemControl.isDisabled,
            xxxxx: selectorItemControl.booted,
          },
          this.classes,
        ]}
        checked={this.selected}
        invalid={this.invalid}
        disabled={this.isDisabled}
        readonly={this.isReadonly}
        v-slots={{
          input: () =>
            selectorItemControl.createInputElement({ type: 'checkbox' }),
          icon: () => (
            <span class="v-switch__faux">
              <span class="v-switch__faux__pin"></span>
            </span>
          ),
          label: () => renderSlotOrEmpty(this.$slots, 'default'),
        }}
      />
    );
  },
});
